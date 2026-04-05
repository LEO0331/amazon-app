import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { execute } from '../db/client.js';
import { isAdmin, isAuth } from '../utils.js';
import { resetDatabase, seedOrders, seedProducts, seedUsers } from '../services/seedService.js';

const seedRouter = express.Router();
const DEFAULT_SEED_COUNT = 500;
const MAX_SEED_COUNT = 1000;

seedRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const requestedCount = Number(req.body.count || DEFAULT_SEED_COUNT);
    if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > MAX_SEED_COUNT) {
      res.status(400).send({ message: `count must be an integer between 1 and ${MAX_SEED_COUNT}` });
      return;
    }

    const count = requestedCount;
    await resetDatabase();
    const users = await seedUsers();
    const sellerIds = users.filter((user) => user.isSeller).map((user) => user.id);
    await seedProducts({ count, sellerIds });

    const customer = users.find((user) => !user.isAdmin && !user.isSeller);
    await seedOrders({ userId: customer?.id, sellerId: sellerIds[0] });

    const rows = await execute('SELECT COUNT(*) AS count FROM products');

    res.send({
      message: 'Database seeded',
      products: Number(rows.rows[0]?.count || 0),
      users: users.length,
    });
  })
);

export default seedRouter;
