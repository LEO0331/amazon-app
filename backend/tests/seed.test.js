import test from 'node:test';
import assert from 'node:assert/strict';
import { initDatabase } from '../db/schema.js';
import { execute } from '../db/client.js';
import { resetDatabase, seedProducts, seedUsers } from '../services/seedService.js';

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
});
