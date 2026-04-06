import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import { randomUUID } from 'crypto';
import { execute } from '../db/client.js';
import { mapUser } from '../db/mappers.js';
import {
  clearAuthCookie,
  clearCsrfCookie,
  generateToken,
  isAdmin,
  isAuth,
  issueCsrfToken,
  setAuthCookie,
} from '../utils.js';
import { resetDatabase, seedProducts, seedUsers } from '../services/seedService.js';

const userRouter = express.Router();

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isSeller: user.isSeller,
    seller: user.seller,
  };
}

function authPayload(user) {
  return sanitizeUser(user);
}

async function getUserByEmail(email) {
  const result = await execute('SELECT * FROM users WHERE email = ?', [email]);
  return result.rows[0] || null;
}

async function getUserById(id) {
  const result = await execute('SELECT * FROM users WHERE id = ?', [id]);
  return result.rows[0] || null;
}

userRouter.get(
  '/top-sellers',
  expressAsyncHandler(async (_req, res) => {
    const result = await execute(
      'SELECT * FROM users WHERE is_seller = 1 ORDER BY seller_rating DESC LIMIT 3'
    );
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.send(result.rows.map((row) => sanitizeUser(mapUser(row))));
  })
);

userRouter.get(
  '/seed',
  expressAsyncHandler(async (_req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).send({ message: 'Disabled in production' });
      return;
    }
    await resetDatabase();
    const users = await seedUsers();
    await seedProducts({
      count: 500,
      sellerIds: users.filter((user) => user.isSeller).map((user) => user.id),
    });
    res.send({
      createdUsers: users.map((user) => ({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: Boolean(user.isAdmin),
        isSeller: Boolean(user.isSeller),
      })),
    });
  })
);

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const userRow = await getUserByEmail(req.body.email);
    if (!userRow || !bcrypt.compareSync(req.body.password, userRow.password_hash)) {
      res.status(401).send({ message: 'Invalid email or password' });
      return;
    }

    const user = mapUser(userRow);
    const token = generateToken(user);
    setAuthCookie(res, token);
    issueCsrfToken(res);

    res.send(authPayload(user));
  })
);

userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const existing = await getUserByEmail(req.body.email);
    if (existing) {
      res.status(400).send({ message: 'Email already exists' });
      return;
    }

    const timestamp = new Date().toISOString();
    const id = randomUUID();
    await execute(
      `INSERT INTO users (
        id, name, email, password_hash, is_admin, is_seller,
        seller_name, seller_logo, seller_description, seller_rating, seller_num_reviews,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, 0, NULL, NULL, NULL, 0, 0, ?, ?)`,
      [id, req.body.name, req.body.email, bcrypt.hashSync(req.body.password, 10), timestamp, timestamp]
    );

    const created = mapUser((await getUserById(id)));
    const token = generateToken(created);
    setAuthCookie(res, token);
    issueCsrfToken(res);
    res.send(authPayload(created));
  })
);

userRouter.post('/signout', (_req, res) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.send({ message: 'Signed out' });
});

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const userRow = await getUserById(req.user._id);
    if (!userRow) {
      res.status(404).send({ message: 'User Not Found' });
      return;
    }

    const nextName = req.body.name || userRow.name;
    const nextEmail = req.body.email || userRow.email;
    const nextPassword = req.body.password
      ? bcrypt.hashSync(req.body.password, 10)
      : userRow.password_hash;

    await execute(
      `UPDATE users SET
        name = ?,
        email = ?,
        password_hash = ?,
        seller_name = ?,
        seller_logo = ?,
        seller_description = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        nextName,
        nextEmail,
        nextPassword,
        req.body.sellerName || userRow.seller_name,
        req.body.sellerLogo || userRow.seller_logo,
        req.body.sellerDescription || userRow.seller_description,
        new Date().toISOString(),
        req.user._id,
      ]
    );

    const updated = mapUser((await getUserById(req.user._id)));
    const token = generateToken(updated);
    setAuthCookie(res, token);

    res.send(authPayload(updated));
  })
);

userRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const userRow = await getUserById(req.params.id);
    if (!userRow) {
      res.status(404).send({ message: 'User Not Found' });
      return;
    }
    res.send(sanitizeUser(mapUser(userRow)));
  })
);

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (_req, res) => {
    const result = await execute('SELECT * FROM users ORDER BY created_at DESC');
    res.send(result.rows.map((row) => sanitizeUser(mapUser(row))));
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const userRow = await getUserById(req.params.id);
    if (!userRow) {
      res.status(404).send({ message: 'User Not Found' });
      return;
    }
    if (userRow.email === 'admin@gmail.com') {
      res.status(400).send({ message: 'Can Not Delete Admin User' });
      return;
    }
    await execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.send({ message: 'User Deleted', user: sanitizeUser(mapUser(userRow)) });
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const userRow = await getUserById(req.params.id);
    if (!userRow) {
      res.status(404).send({ message: 'User Not Found' });
      return;
    }

    await execute(
      `UPDATE users SET
        name = ?,
        email = ?,
        is_seller = ?,
        is_admin = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        req.body.name || userRow.name,
        req.body.email || userRow.email,
        req.body.isSeller ? 1 : 0,
        req.body.isAdmin ? 1 : 0,
        new Date().toISOString(),
        req.params.id,
      ]
    );

    const updated = mapUser((await getUserById(req.params.id)));
    res.send({ message: 'User Updated', user: sanitizeUser(updated) });
  })
);

export default userRouter;
