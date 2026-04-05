import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { execute } from '../db/client.js';
import { isAdmin, isAuth } from '../utils.js';
import { resetDatabase, seedOrders, seedProducts, seedUsers } from '../services/seedService.js';

const seedRouter = express.Router();

seedRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const count = Number(req.body.count || 500);
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
