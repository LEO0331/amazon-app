import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../db/schema.js';
import { execute } from '../db/client.js';
import { resetDatabase, seedOrders, seedProducts, seedUsers } from '../services/seedService.js';

test('database schema initializes required tables', async () => {
  await initDatabase();
  const result = await execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'products', 'orders', 'support_threads', 'support_messages')");
  assert.equal(result.rows.length, 5);
});

test('seed pipeline generates 500 products', async () => {
  await initDatabase();
  await resetDatabase();
  const users = await seedUsers();
  const sellerIds = users.filter((user) => user.isSeller).map((user) => user.id);
  await seedProducts({ count: 500, sellerIds });
  const productCount = await execute('SELECT COUNT(*) AS count FROM products');
  assert.equal(Number(productCount.rows[0].count), 500);

  const imageRows = await execute('SELECT image FROM products GROUP BY image');
  assert.ok(imageRows.rows.length >= 6);
});

test('seedOrders no-op when userId is missing or no products exist', async () => {
  await initDatabase();
  await resetDatabase();

  await seedOrders({});
  let orders = await execute('SELECT COUNT(*) AS count FROM orders');
  assert.equal(Number(orders.rows[0].count), 0);

  const users = await seedUsers();
  const customer = users.find((user) => !user.isAdmin && !user.isSeller);
  await seedOrders({ userId: customer?.id });

  orders = await execute('SELECT COUNT(*) AS count FROM orders');
  assert.equal(Number(orders.rows[0].count), 0);
});

test('seedOrders creates an order when products exist', async () => {
  await initDatabase();
  await resetDatabase();

  const users = await seedUsers();
  const sellerIds = users.filter((user) => user.isSeller).map((user) => user.id);
  const customer = users.find((user) => !user.isAdmin && !user.isSeller);

  await seedProducts({ count: 5, sellerIds });
  await seedOrders({ userId: customer?.id, sellerId: sellerIds[0] });

  const orders = await execute('SELECT COUNT(*) AS count FROM orders');
  assert.equal(Number(orders.rows[0].count), 1);

  const created = await execute('SELECT * FROM orders LIMIT 1');
  assert.equal(Number(created.rows[0].is_paid), 0);
  assert.equal(Number(created.rows[0].is_delivered), 0);
});
