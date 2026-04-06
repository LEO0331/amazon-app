import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { execute } from '../db/client.js';

function nowIso() {
  return new Date().toISOString();
}

const categories = ['Shirts', 'Pants', 'Shoes', 'Accessories', 'Bags', 'Electronics'];
const sellerLogos = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=80',
];

const productImages = [
  'https://opengameart.org/sites/default/files/items.png',
  'https://opengameart.org/sites/default/files/items_31.png',
];

export async function resetDatabase() {
  await execute('DELETE FROM support_messages');
  await execute('DELETE FROM support_threads');
  await execute('DELETE FROM orders');
  await execute('DELETE FROM products');
  await execute('DELETE FROM users');
}

export async function seedUsers() {
  const timestamp = nowIso();

  const users = [
    {
      id: randomUUID(),
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: bcrypt.hashSync('1234', 10),
      isAdmin: 1,
      isSeller: 1,
      sellerName: 'Notion Store',
      sellerLogo: sellerLogos[0],
      sellerDescription: 'Primary seller account',
      sellerRating: 4.8,
      sellerNumReviews: 128,
    },
    {
      id: randomUUID(),
      name: 'Seller User',
      email: 'seller@gmail.com',
      password: bcrypt.hashSync('1234', 10),
      isAdmin: 0,
      isSeller: 1,
      sellerName: 'Atlas Goods',
      sellerLogo: sellerLogos[1],
      sellerDescription: 'Secondary seller account',
      sellerRating: 4.4,
      sellerNumReviews: 84,
    },
    {
      id: randomUUID(),
      name: 'Customer User',
      email: 'user@gmail.com',
      password: bcrypt.hashSync('1234', 10),
      isAdmin: 0,
      isSeller: 0,
      sellerName: null,
      sellerLogo: null,
      sellerDescription: null,
      sellerRating: 0,
      sellerNumReviews: 0,
    },
  ];

  for (const user of users) {
    await execute(
      `INSERT INTO users (
        id, name, email, password_hash, is_admin, is_seller,
        seller_name, seller_logo, seller_description, seller_rating, seller_num_reviews,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.name,
        user.email,
        user.password,
        user.isAdmin,
        user.isSeller,
        user.sellerName,
        user.sellerLogo,
        user.sellerDescription,
        user.sellerRating,
        user.sellerNumReviews,
        timestamp,
        timestamp,
      ]
    );
  }

  return users;
}

export async function seedProducts({ count = 500, sellerIds = [] } = {}) {
  const timestamp = nowIso();
  const ids = sellerIds.length > 0 ? sellerIds : [null];

  for (let i = 0; i < count; i += 1) {
    const category = faker.helpers.arrayElement(categories);
    const brand = faker.company.name().slice(0, 60);
    const rating = Number((faker.number.float({ min: 2.8, max: 5, fractionDigits: 1 })).toFixed(1));
    const numReviews = faker.number.int({ min: 1, max: 450 });

    await execute(
      `INSERT INTO products (
        id, seller_id, name, image, brand, category, description,
        price, count_in_stock, rating, num_reviews, reviews_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        faker.helpers.arrayElement(ids),
        `${faker.commerce.productName()} ${i + 1}`.slice(0, 120),
        productImages[i % productImages.length],
        brand,
        category,
        faker.commerce.productDescription().slice(0, 500),
        Number(faker.commerce.price({ min: 15, max: 999, dec: 2 })),
        faker.number.int({ min: 0, max: 200 }),
        rating,
        numReviews,
        '[]',
        timestamp,
        timestamp,
      ]
    );
  }
}

export async function seedOrders({ userId, sellerId } = {}) {
  if (!userId) {
    return;
  }

  const products = (await execute('SELECT id, name, image, price, seller_id FROM products LIMIT 5')).rows;
  if (products.length === 0) {
    return;
  }

  const orderItems = products.slice(0, 2).map((product, index) => ({
    name: product.name,
    qty: index + 1,
    image: product.image,
    price: Number(product.price),
    product: product.id,
    seller: {
      _id: product.seller_id,
    },
  }));

  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 12;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
  const timestamp = nowIso();

  await execute(
    `INSERT INTO orders (
      id, user_id, seller_id, order_items_json, shipping_address_json,
      payment_method, payment_result_json, items_price, shipping_price, tax_price, total_price,
      is_paid, paid_at, is_delivered, delivered_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      userId,
      sellerId || orderItems[0].seller._id,
      JSON.stringify(orderItems),
      JSON.stringify({
        fullName: 'Customer User',
        address: '1 Demo Street',
        city: 'Taipei',
        postalCode: '100',
        country: 'Taiwan',
      }),
      'PayPal',
      null,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      0,
      null,
      0,
      null,
      timestamp,
      timestamp,
    ]
  );
}
