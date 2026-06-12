import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createHash, randomUUID } from 'crypto';
import { execute } from '../db/client.js';
import { mapOrder } from '../db/mappers.js';
import { isAdmin, isAdminOrSeller, isAuth } from '../utils.js';

const orderRouter = express.Router();
const MAX_ORDER_QTY = 99;
const MAX_IDEMPOTENCY_KEY_LENGTH = 255;
const IDEMPOTENCY_RETENTION_MS = 24 * 60 * 60 * 1000;

function toAmount(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Number(parsed.toFixed(2));
}

function normalizePaymentMethod(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getRequestHash(body) {
  return createHash('sha256').update(JSON.stringify(body || {})).digest('hex');
}

function getIdempotencyKey(req) {
  const key = req.get('Idempotency-Key');
  return typeof key === 'string' ? key.trim() : '';
}

function sendIdempotencyError(res, status, code, message) {
  res.status(status).send({
    message,
    error: {
      type: 'idempotency_error',
      code,
      message,
      request_id: res.locals.requestId,
    },
  });
}

async function findIdempotencyRecord(key) {
  return (await execute('SELECT * FROM idempotency_keys WHERE key = ?', [key])).rows[0] || null;
}

function idempotencyScopeMatches(record, req) {
  return (
    record.method === req.method &&
    record.path === req.baseUrl + req.path &&
    (record.user_id || '') === (req.user?._id || '')
  );
}

async function reserveIdempotencyKey({ key, req, requestHash, timestamp }) {
  if (!key) {
    return { reserved: false };
  }

  const expiresAt = new Date(new Date(timestamp).getTime() + IDEMPOTENCY_RETENTION_MS).toISOString();
  await execute(
    `INSERT INTO idempotency_keys (
      key, method, path, user_id, request_hash, response_status, response_body_json, created_at, updated_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)`,
    [key, req.method, req.baseUrl + req.path, req.user?._id || null, requestHash, timestamp, timestamp, expiresAt]
  );
  return { reserved: true };
}

async function persistIdempotencyResponse({ key, status, body, timestamp }) {
  if (!key) {
    return;
  }

  await execute(
    'UPDATE idempotency_keys SET response_status = ?, response_body_json = ?, updated_at = ? WHERE key = ?',
    [status, JSON.stringify(body), timestamp, key]
  );
}

function canAccessOrder(user, orderRow) {
  if (user?.isAdmin) {
    return true;
  }
  if (orderRow.user_id === user?._id) {
    return true;
  }
  if (user?.isSeller && orderRow.seller_id === user?._id) {
    return true;
  }
  return false;
}

async function hydrateOrders(rows) {
  const ids = [...new Set(rows.map((row) => row.user_id).filter(Boolean))];
  const usersById = new Map();

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    const users = await execute(`SELECT id, name FROM users WHERE id IN (${placeholders})`, ids);
    users.rows.forEach((user) => usersById.set(user.id, { _id: user.id, name: user.name }));
  }

  return rows.map((row) => {
    const mapped = mapOrder(row);
    return {
      ...mapped,
      user: usersById.get(row.user_id) || mapped.user,
    };
  });
}

orderRouter.get(
  '/',
  isAuth,
  isAdminOrSeller,
  expressAsyncHandler(async (req, res) => {
    const seller = req.query.seller || '';
    let sql = 'SELECT * FROM orders';
    const args = [];

    if (seller) {
      sql += ' WHERE seller_id = ?';
      args.push(seller);
    } else if (req.user.isSeller && !req.user.isAdmin) {
      sql += ' WHERE seller_id = ?';
      args.push(req.user._id);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await execute(sql, args);
    res.send(await hydrateOrders(result.rows));
  })
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (_req, res) => {
    const ordersAgg = await execute(
      'SELECT COUNT(*) AS numOrders, COALESCE(SUM(total_price), 0) AS totalSales FROM orders'
    );
    const usersAgg = await execute('SELECT COUNT(*) AS numUsers FROM users');
    const daily = await execute(
      `SELECT substr(created_at, 1, 10) AS _id, COUNT(*) AS orders, COALESCE(SUM(total_price), 0) AS sales
       FROM orders GROUP BY substr(created_at, 1, 10) ORDER BY _id ASC`
    );
    const categories = await execute(
      'SELECT category AS _id, COUNT(*) AS count FROM products GROUP BY category ORDER BY count DESC'
    );

    res.send({
      orders: [
        {
          _id: null,
          numOrders: Number(ordersAgg.rows[0]?.numOrders || 0),
          totalSales: Number(ordersAgg.rows[0]?.totalSales || 0),
        },
      ],
      users: [
        {
          _id: null,
          numUsers: Number(usersAgg.rows[0]?.numUsers || 0),
        },
      ],
      dailyOrders: daily.rows.map((row) => ({
        _id: row._id,
        orders: Number(row.orders),
        sales: Number(row.sales),
      })),
      productCategories: categories.rows.map((row) => ({
        _id: row._id,
        count: Number(row.count),
      })),
    });
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const idempotencyKey = getIdempotencyKey(req);
    const requestHash = idempotencyKey ? getRequestHash(req.body) : '';

    if (idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
      sendIdempotencyError(
        res,
        400,
        'idempotency_key_too_long',
        `Idempotency-Key must be ${MAX_IDEMPOTENCY_KEY_LENGTH} characters or fewer`
      );
      return;
    }

    if (idempotencyKey) {
      const existing = await findIdempotencyRecord(idempotencyKey);
      if (existing) {
        if (!idempotencyScopeMatches(existing, req) || existing.request_hash !== requestHash) {
          sendIdempotencyError(
            res,
            409,
            'idempotency_key_reused_with_different_params',
            'The provided Idempotency-Key was already used with different request parameters.'
          );
          return;
        }
        if (!existing.response_body_json) {
          sendIdempotencyError(
            res,
            409,
            'idempotency_key_in_use',
            'The provided Idempotency-Key is already processing.'
          );
          return;
        }

        res.status(Number(existing.response_status || 200)).send(JSON.parse(existing.response_body_json));
        return;
      }
    }

    if (!Array.isArray(req.body.orderItems) || req.body.orderItems.length === 0) {
      res.status(400).send({ message: 'Cart is empty' });
      return;
    }

    if (!req.body.shippingAddress || typeof req.body.shippingAddress !== 'object' || Array.isArray(req.body.shippingAddress)) {
      res.status(400).send({ message: 'Invalid shipping address' });
      return;
    }

    const paymentMethod = normalizePaymentMethod(req.body.paymentMethod);
    if (!paymentMethod) {
      res.status(400).send({ message: 'Invalid payment method' });
      return;
    }

    const productIds = req.body.orderItems.map((item) => item?.product).filter(Boolean);
    if (productIds.length !== req.body.orderItems.length) {
      res.status(400).send({ message: 'Invalid order items' });
      return;
    }

    const uniqueProductIds = [...new Set(productIds)];
    const placeholders = uniqueProductIds.map(() => '?').join(',');
    const productsResult = await execute(
      `SELECT id, seller_id, name, image, price, count_in_stock FROM products WHERE id IN (${placeholders})`,
      uniqueProductIds
    );
    const productById = new Map(productsResult.rows.map((row) => [row.id, row]));
    if (productById.size !== uniqueProductIds.length) {
      res.status(400).send({ message: 'One or more products are invalid' });
      return;
    }

    const normalizedItems = [];
    let itemsPrice = 0;
    for (const item of req.body.orderItems) {
      const productId = item?.product;
      const qty = Number(item?.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ORDER_QTY) {
        res.status(400).send({ message: 'Invalid item quantity' });
        return;
      }

      const product = productById.get(productId);
      if (!product) {
        res.status(400).send({ message: 'One or more products are invalid' });
        return;
      }

      const stock = Number(product.count_in_stock);
      if (Number.isFinite(stock) && qty > stock) {
        res.status(400).send({ message: `Insufficient stock for ${product.name}` });
        return;
      }

      const unitPrice = Number(product.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        res.status(400).send({ message: 'Invalid product pricing' });
        return;
      }

      normalizedItems.push({
        name: product.name,
        qty,
        image: product.image,
        price: unitPrice,
        product: product.id,
        seller: { _id: product.seller_id || null },
      });
      itemsPrice += unitPrice * qty;
    }
    itemsPrice = Number(itemsPrice.toFixed(2));

    const shippingPrice = toAmount(req.body.shippingPrice, 0);
    const taxPrice = toAmount(req.body.taxPrice, 0);
    if (shippingPrice === null || taxPrice === null) {
      res.status(400).send({ message: 'Invalid order pricing' });
      return;
    }
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const clientTotal = toAmount(req.body.totalPrice);
    if (clientTotal !== null && Math.abs(clientTotal - totalPrice) > 0.01) {
      res.status(400).send({ message: 'Order total mismatch' });
      return;
    }

    const sellerIds = new Set(normalizedItems.map((item) => item.seller?._id).filter(Boolean));
    if (sellerIds.size > 1) {
      res.status(400).send({ message: 'Mixed seller orders are not supported' });
      return;
    }
    const orderSellerId = [...sellerIds][0] || null;

    const timestamp = new Date().toISOString();
    const id = randomUUID();
    if (idempotencyKey) {
      try {
        await reserveIdempotencyKey({ key: idempotencyKey, req, requestHash, timestamp });
      } catch (error) {
        const existing = await findIdempotencyRecord(idempotencyKey);
        if (existing) {
          if (!idempotencyScopeMatches(existing, req) || existing.request_hash !== requestHash) {
            sendIdempotencyError(
              res,
              409,
              'idempotency_key_reused_with_different_params',
              'The provided Idempotency-Key was already used with different request parameters.'
            );
            return;
          }
          if (existing.response_body_json) {
            res.status(Number(existing.response_status || 200)).send(JSON.parse(existing.response_body_json));
            return;
          }
          sendIdempotencyError(
            res,
            409,
            'idempotency_key_in_use',
            'The provided Idempotency-Key is already processing.'
          );
          return;
        }
        throw error;
      }
    }

    await execute(
      `INSERT INTO orders (
        id, user_id, seller_id, order_items_json, shipping_address_json,
        payment_method, payment_result_json, items_price, shipping_price, tax_price, total_price,
        is_paid, paid_at, is_delivered, delivered_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0, NULL, ?, ?)`,
      [
        id,
        req.user._id,
        orderSellerId,
        JSON.stringify(normalizedItems),
        JSON.stringify(req.body.shippingAddress),
        paymentMethod,
        null,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        timestamp,
        timestamp,
      ]
    );

    const created = (await execute('SELECT * FROM orders WHERE id = ?', [id])).rows[0];
    const responseBody = { message: 'New Order Created', order: mapOrder(created) };
    await persistIdempotencyResponse({ key: idempotencyKey, status: 201, body: responseBody, timestamp });
    res.status(201).send(responseBody);
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const rows = await execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user._id]);
    res.send(rows.rows.map((row) => mapOrder(row)));
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM orders WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Order Not Found' });
      return;
    }
    if (!canAccessOrder(req.user, row)) {
      res.status(403).send({ message: 'Forbidden' });
      return;
    }
    res.send(mapOrder(row));
  })
);

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM orders WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Order Not Found' });
      return;
    }
    if (!req.user?.isAdmin && row.user_id !== req.user?._id) {
      res.status(403).send({ message: 'Forbidden' });
      return;
    }

    const timestamp = new Date().toISOString();
    await execute(
      `UPDATE orders SET
        is_paid = 1,
        paid_at = ?,
        payment_result_json = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        timestamp,
        JSON.stringify({
          id: req.body.id,
          status: req.body.status,
          update_time: req.body.update_time,
          email_address: req.body.email_address,
        }),
        timestamp,
        req.params.id,
      ]
    );

    const updated = (await execute('SELECT * FROM orders WHERE id = ?', [req.params.id])).rows[0];
    res.send({ message: 'Order Paid', order: mapOrder(updated) });
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM orders WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Order Not Found' });
      return;
    }

    await execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.send({ message: 'Order Deleted', order: mapOrder(row) });
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM orders WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Order Not Found' });
      return;
    }

    const timestamp = new Date().toISOString();
    await execute(
      'UPDATE orders SET is_delivered = 1, delivered_at = ?, updated_at = ? WHERE id = ?',
      [timestamp, timestamp, req.params.id]
    );

    const updated = (await execute('SELECT * FROM orders WHERE id = ?', [req.params.id])).rows[0];
    res.send({ message: 'Order Delivered', order: mapOrder(updated) });
  })
);

export default orderRouter;
