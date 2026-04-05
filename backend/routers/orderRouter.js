import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { randomUUID } from 'crypto';
import { execute } from '../db/client.js';
import { mapOrder } from '../db/mappers.js';
import { isAdmin, isAdminOrSeller, isAuth } from '../utils.js';

const orderRouter = express.Router();

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
    if (!Array.isArray(req.body.orderItems) || req.body.orderItems.length === 0) {
      res.status(400).send({ message: 'Cart is empty' });
      return;
    }

    const timestamp = new Date().toISOString();
    const id = randomUUID();

    await execute(
      `INSERT INTO orders (
        id, user_id, seller_id, order_items_json, shipping_address_json,
        payment_method, payment_result_json, items_price, shipping_price, tax_price, total_price,
        is_paid, paid_at, is_delivered, delivered_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 0, NULL, ?, ?)`,
      [
        id,
        req.user._id,
        req.body.orderItems[0]?.seller?._id || null,
        JSON.stringify(req.body.orderItems),
        JSON.stringify(req.body.shippingAddress || {}),
        req.body.paymentMethod,
        null,
        Number(req.body.itemsPrice || 0),
        Number(req.body.shippingPrice || 0),
        Number(req.body.taxPrice || 0),
        Number(req.body.totalPrice || 0),
        timestamp,
        timestamp,
      ]
    );

    const created = (await execute('SELECT * FROM orders WHERE id = ?', [id])).rows[0];
    res.status(201).send({ message: 'New Order Created', order: mapOrder(created) });
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
    res.send({ message: 'Order Deleted', product: mapOrder(row) });
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
