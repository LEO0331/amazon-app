import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { randomUUID } from 'crypto';
import { execute } from '../db/client.js';
import { mapProduct, mapUser } from '../db/mappers.js';
import { isAdmin, isAdminOrSeller, isAuth } from '../utils.js';
import { resetDatabase, seedProducts, seedUsers } from '../services/seedService.js';

const productRouter = express.Router();

const PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 30;

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

async function loadSellerMap(rows) {
  const ids = [...new Set(rows.map((row) => row.seller_id).filter(Boolean))];
  if (ids.length === 0) {
    return new Map();
  }

  const placeholders = ids.map(() => '?').join(',');
  const users = await execute(`SELECT * FROM users WHERE id IN (${placeholders})`, ids);
  return new Map(users.rows.map((user) => [user.id, mapUser(user)]));
}

productRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const page = Math.max(1, toNumber(req.query.pageNumber, 1));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, toNumber(req.query.pageSize, PAGE_SIZE)));
    const seller = req.query.seller || '';
    const name = req.query.name || '';
    const category = req.query.category || '';
    const min = req.query.min ? toNumber(req.query.min, 0) : 0;
    const max = req.query.max ? toNumber(req.query.max, 0) : 0;
    const rating = req.query.rating ? toNumber(req.query.rating, 0) : 0;
    const order = req.query.order || '';

    const where = [];
    const args = [];

    if (seller) {
      where.push('seller_id = ?');
      args.push(seller);
    }

    if (name) {
      where.push('LOWER(name) LIKE ?');
      args.push(`%${name.toLowerCase()}%`);
    }

    if (category) {
      where.push('category = ?');
      args.push(category);
    }

    if (min && max) {
      where.push('price BETWEEN ? AND ?');
      args.push(min, max);
    }

    if (rating) {
      where.push('rating >= ?');
      args.push(rating);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sortOrder =
      order === 'lowest'
        ? 'price ASC'
        : order === 'highest'
          ? 'price DESC'
          : order === 'toprated'
            ? 'rating DESC'
            : 'created_at DESC';

    const countResult = await execute(`SELECT COUNT(*) AS count FROM products ${whereSql}`, args);
    const count = Number(countResult.rows[0]?.count || 0);

    const rows = await execute(
      `SELECT * FROM products ${whereSql} ORDER BY ${sortOrder} LIMIT ? OFFSET ?`,
      [...args, pageSize, pageSize * (page - 1)]
    );

    const sellerMap = await loadSellerMap(rows.rows);
    const products = rows.rows.map((row) =>
      mapProduct(row, row.seller_id ? sellerMap.get(row.seller_id) || { _id: row.seller_id } : null)
    );

    res.send({
      products,
      page,
      pages: Math.ceil(count / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (_req, res) => {
    const categories = await execute('SELECT DISTINCT category FROM products ORDER BY category ASC');
    res.send(categories.rows.map((row) => row.category));
  })
);

productRouter.get(
  '/seed',
  expressAsyncHandler(async (_req, res) => {
    await resetDatabase();
    const users = await seedUsers();
    await seedProducts({
      count: 500,
      sellerIds: users.filter((user) => user.isSeller).map((user) => user.id),
    });
    res.send({ message: 'Seed complete', productCount: 500 });
  })
);

productRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const result = await execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const row = result.rows[0];
    if (!row) {
      res.status(404).send({ message: 'Product Not Found' });
      return;
    }

    let seller = null;
    if (row.seller_id) {
      const sellerResult = await execute('SELECT * FROM users WHERE id = ?', [row.seller_id]);
      if (sellerResult.rows[0]) {
        seller = mapUser(sellerResult.rows[0]);
      }
    }

    res.send(mapProduct(row, seller));
  })
);

productRouter.post(
  '/',
  isAuth,
  isAdminOrSeller,
  expressAsyncHandler(async (req, res) => {
    const now = new Date().toISOString();
    const id = randomUUID();
    await execute(
      `INSERT INTO products (
        id, seller_id, name, image, brand, category, description,
        price, count_in_stock, rating, num_reviews, reviews_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user._id,
        `sample name ${Date.now()}`,
        '/images/p1.jpg',
        'sample brand',
        'sample category',
        'sample description',
        0,
        0,
        0,
        0,
        '[]',
        now,
        now,
      ]
    );

    const product = (await execute('SELECT * FROM products WHERE id = ?', [id])).rows[0];
    res.send({ message: 'Product Created', product: mapProduct(product, { _id: req.user._id }) });
  })
);

productRouter.put(
  '/:id',
  isAuth,
  isAdminOrSeller,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM products WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Product Not Found' });
      return;
    }

    await execute(
      `UPDATE products SET
        name = ?,
        price = ?,
        image = ?,
        category = ?,
        brand = ?,
        count_in_stock = ?,
        description = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        req.body.name,
        req.body.price,
        req.body.image,
        req.body.category,
        req.body.brand,
        req.body.countInStock,
        req.body.description,
        new Date().toISOString(),
        req.params.id,
      ]
    );

    const updated = (await execute('SELECT * FROM products WHERE id = ?', [req.params.id])).rows[0];
    res.send({ message: 'Product Updated', product: mapProduct(updated, { _id: updated.seller_id }) });
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM products WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Product Not Found' });
      return;
    }

    await execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.send({ message: 'Product Deleted', product: mapProduct(row, { _id: row.seller_id }) });
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const row = (await execute('SELECT * FROM products WHERE id = ?', [req.params.id])).rows[0];
    if (!row) {
      res.status(404).send({ message: 'Product Not Found' });
      return;
    }

    const reviews = JSON.parse(row.reviews_json || '[]');
    if (reviews.some((review) => review.name === req.user.name)) {
      res.status(400).send({ message: 'You have already submitted a review' });
      return;
    }

    const review = {
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
      createdAt: new Date().toISOString(),
    };

    reviews.push(review);
    const numReviews = reviews.length;
    const rating = reviews.reduce((total, item) => total + Number(item.rating), 0) / numReviews;

    await execute(
      'UPDATE products SET reviews_json = ?, num_reviews = ?, rating = ?, updated_at = ? WHERE id = ?',
      [JSON.stringify(reviews), numReviews, Number(rating.toFixed(2)), new Date().toISOString(), req.params.id]
    );

    res.status(201).send({
      message: 'Review Created',
      review,
    });
  })
);

export default productRouter;
