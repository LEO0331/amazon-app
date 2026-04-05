import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test-api.db';
process.env.FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS || 'http://localhost:5173';

class Session {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookieMap = new Map();
    this.csrfToken = '';
  }

  async request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (this.cookieMap.size > 0) {
      const cookie = [...this.cookieMap.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
      headers.set('cookie', cookie);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const setCookie = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    for (const entry of setCookie) {
      const [pair] = entry.split(';');
      const [key, value] = pair.split('=');
      this.cookieMap.set(key, value);
    }

    return response;
  }

  async getCsrfToken() {
    const response = await this.request('/api/auth/csrf-token');
    assert.equal(response.status, 200);
    const body = await response.json();
    this.csrfToken = body.csrfToken;
    return this.csrfToken;
  }

  async post(path, body, { withCsrf = true } = {}) {
    const headers = { 'content-type': 'application/json' };
    if (withCsrf) {
      if (!this.csrfToken) {
        await this.getCsrfToken();
      }
      headers['x-csrf-token'] = this.csrfToken;
    }

    return this.request(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body || {}),
    });
  }

  async put(path, body, { withCsrf = true } = {}) {
    const headers = { 'content-type': 'application/json' };
    if (withCsrf) {
      if (!this.csrfToken) {
        await this.getCsrfToken();
      }
      headers['x-csrf-token'] = this.csrfToken;
    }

    return this.request(path, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body || {}),
    });
  }
}

let server;
let baseUrl;

async function seed() {
  const response = await fetch(`${baseUrl}/api/users/seed`);
  assert.equal(response.status, 200);
}

test.before(async () => {
  const { default: app } = await import('../app.js');
  server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test('users endpoints: seed + signin + list', async () => {
  await seed();

  const admin = new Session(baseUrl);
  const signin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(signin.status, 200);
  const authBody = await signin.json();
  assert.equal(authBody.email, 'admin@gmail.com');

  await admin.getCsrfToken();

  const listResponse = await admin.request('/api/users');
  assert.equal(listResponse.status, 200);
  const users = await listResponse.json();
  assert.ok(Array.isArray(users));
  assert.ok(users.length >= 3);
});

test('products endpoints: list + details + categories', async () => {
  await seed();

  const listResponse = await fetch(`${baseUrl}/api/products?pageNumber=1`);
  assert.equal(listResponse.status, 200);
  const listBody = await listResponse.json();
  assert.ok(Array.isArray(listBody.products));
  assert.ok(listBody.products.length > 0);

  const firstProduct = listBody.products[0];

  const detailResponse = await fetch(`${baseUrl}/api/products/${firstProduct._id}`);
  assert.equal(detailResponse.status, 200);
  const detail = await detailResponse.json();
  assert.equal(detail._id, firstProduct._id);

  const categoriesResponse = await fetch(`${baseUrl}/api/products/categories`);
  assert.equal(categoriesResponse.status, 200);
  const categories = await categoriesResponse.json();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0);
});

test('orders endpoints: create + mine + pay + summary', async () => {
  await seed();

  const user = new Session(baseUrl);
  const signin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(signin.status, 200);
  await user.getCsrfToken();

  const listResponse = await fetch(`${baseUrl}/api/products?pageNumber=1`);
  const listBody = await listResponse.json();
  const product = listBody.products[0];

  const createOrder = await user.post('/api/orders', {
    orderItems: [
      {
        name: product.name,
        qty: 1,
        image: product.image,
        price: product.price,
        product: product._id,
        seller: { _id: product.seller?._id || null },
      },
    ],
    shippingAddress: {
      fullName: 'Customer User',
      address: '1 Demo Street',
      city: 'Taipei',
      postalCode: '100',
      country: 'Taiwan',
    },
    paymentMethod: 'PayPal',
    itemsPrice: product.price,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: product.price,
  });
  assert.equal(createOrder.status, 201);
  const orderPayload = await createOrder.json();
  const orderId = orderPayload.order._id;

  const mine = await user.request('/api/orders/mine');
  assert.equal(mine.status, 200);
  const mineOrders = await mine.json();
  assert.ok(mineOrders.some((order) => order._id === orderId));

  const pay = await user.put(`/api/orders/${orderId}/pay`, {
    id: 'payment-id',
    status: 'COMPLETED',
    update_time: new Date().toISOString(),
    email_address: 'user@gmail.com',
  });
  assert.equal(pay.status, 200);

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const summary = await admin.request('/api/orders/summary');
  assert.equal(summary.status, 200);
  const summaryBody = await summary.json();
  assert.ok(Array.isArray(summaryBody.orders));
});

test('support endpoints: create thread + send and list messages', async () => {
  await seed();

  const user = new Session(baseUrl);
  const signin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(signin.status, 200);
  await user.getCsrfToken();

  const createThread = await user.post('/api/support/threads', { userId: '' });
  assert.equal(createThread.status, 201);
  const thread = await createThread.json();
  assert.ok(thread._id);

  const sendMessage = await user.post(`/api/support/threads/${thread._id}/messages`, { body: 'Need help with order' });
  assert.equal(sendMessage.status, 201);

  const userMessages = await user.request(`/api/support/threads/${thread._id}/messages`);
  assert.equal(userMessages.status, 200);
  const messages = await userMessages.json();
  assert.ok(messages.length >= 1);

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);

  const threads = await admin.request('/api/support/threads');
  assert.equal(threads.status, 200);
  const threadList = await threads.json();
  assert.ok(threadList.length >= 1);
});
