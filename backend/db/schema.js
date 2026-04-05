import { execute } from './client.js';

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    is_seller INTEGER NOT NULL DEFAULT 0,
    seller_name TEXT,
    seller_logo TEXT,
    seller_description TEXT,
    seller_rating REAL NOT NULL DEFAULT 0,
    seller_num_reviews INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    seller_id TEXT,
    name TEXT NOT NULL UNIQUE,
    image TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    count_in_stock INTEGER NOT NULL,
    rating REAL NOT NULL DEFAULT 0,
    num_reviews INTEGER NOT NULL DEFAULT 0,
    reviews_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    seller_id TEXT,
    order_items_json TEXT NOT NULL,
    shipping_address_json TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_result_json TEXT,
    items_price REAL NOT NULL,
    shipping_price REAL NOT NULL,
    tax_price REAL NOT NULL,
    total_price REAL NOT NULL,
    is_paid INTEGER NOT NULL DEFAULT 0,
    paid_at TEXT,
    is_delivered INTEGER NOT NULL DEFAULT 0,
    delivered_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS support_threads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    admin_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_message_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (thread_id) REFERENCES support_threads(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
  'CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id)',
  'CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)',
  'CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)',
  'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id)',
  'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_support_threads_user ON support_threads(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_support_threads_last_message_at ON support_threads(last_message_at)',
  'CREATE INDEX IF NOT EXISTS idx_support_messages_thread ON support_messages(thread_id)',
];

let initialized = false;

export async function initDatabase() {
  if (initialized) {
    return;
  }

  for (const sql of statements) {
    await execute(sql);
  }

  initialized = true;
}
