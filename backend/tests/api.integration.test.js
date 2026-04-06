import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test-api.db';
process.env.FRONTEND_ORIGINS = process.env.FRONTEND_ORIGINS || 'http://localhost:5173';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || '5000';
process.env.AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX || '5000';

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
  assert.equal(authBody.token, undefined);

  await admin.getCsrfToken();

  const listResponse = await admin.request('/api/users');
  assert.equal(listResponse.status, 200);
  const users = await listResponse.json();
  assert.ok(Array.isArray(users));
  assert.ok(users.length >= 3);
});

test('users endpoint: signin rejects invalid credentials and signout clears auth cookie', async () => {
  await seed();

  const invalid = await fetch(`${baseUrl}/api/users/signin`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'wrong-password' }),
  });
  assert.equal(invalid.status, 401);

  const admin = new Session(baseUrl);
  const signin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(signin.status, 200);
  await admin.getCsrfToken();

  const signout = await admin.post('/api/users/signout', {});
  assert.equal(signout.status, 200);
  const setCookie = signout.headers.getSetCookie ? signout.headers.getSetCookie().join(';') : '';
  assert.ok(setCookie.includes('auth_token='));
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
  assert.equal(categoriesResponse.headers.get('cache-control'), 'public, max-age=300, s-maxage=600');
  const categories = await categoriesResponse.json();
  assert.ok(Array.isArray(categories));
  assert.ok(categories.length > 0);
});

test('products validation: invalid pagination values are rejected', async () => {
  await seed();

  const response = await fetch(`${baseUrl}/api/products?pageNumber=abc&pageSize=0`);
  assert.equal(response.status, 400);
});

test('products security: create product requires admin or seller authentication', async () => {
  await seed();

  const unauthorized = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.ok([401, 403].includes(unauthorized.status));
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

test('security: protected route requires auth cookie', async () => {
  await seed();
  const response = await fetch(`${baseUrl}/api/orders/mine`);
  assert.equal(response.status, 401);
});

test('security: bearer auth header is rejected when cookie is missing', async () => {
  await seed();

  const response = await fetch(`${baseUrl}/api/orders/mine`, {
    headers: {
      authorization: 'Bearer fake-token',
    },
  });
  assert.equal(response.status, 401);
});

test('security: csrf token required for protected mutation', async () => {
  await seed();

  const user = new Session(baseUrl);
  const signin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(signin.status, 200);

  const noCsrf = await user.post('/api/support/threads', { userId: '' }, { withCsrf: false });
  assert.equal(noCsrf.status, 403);
});

test('support security: non-admin cannot read another user thread', async () => {
  await seed();

  const customer = new Session(baseUrl);
  const customerSignin = await customer.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(customerSignin.status, 200);
  await customer.getCsrfToken();

  const threadResponse = await customer.post('/api/support/threads', { userId: '' });
  assert.equal(threadResponse.status, 201);
  const thread = await threadResponse.json();

  const seller = new Session(baseUrl);
  const sellerSignin = await seller.post('/api/users/signin', { email: 'seller@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(sellerSignin.status, 200);

  const forbidden = await seller.request(`/api/support/threads/${thread._id}/messages`);
  assert.equal(forbidden.status, 403);
});

test('cors: allowed frontend origin receives access-control-allow-origin', async () => {
  await seed();

  const response = await fetch(`${baseUrl}/api/products/categories`, {
    headers: {
      origin: 'http://localhost:5173',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('seed validation: rejects count beyond hard limit', async () => {
  await seed();

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const response = await admin.post('/api/seed', { count: 2000 });
  assert.equal(response.status, 400);
});

test('security: /api/users/seed is disabled in production mode', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const response = await fetch(`${baseUrl}/api/users/seed`);
    assert.equal(response.status, 403);
  } finally {
    process.env.NODE_ENV = previous;
  }
});

test('upload safety: /api/uploads/s3 requires auth and returns 503 when not configured', async () => {
  await seed();

  const unauthenticated = await fetch(`${baseUrl}/api/uploads/s3`, { method: 'POST' });
  assert.ok([401, 403].includes(unauthenticated.status));

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const configuredCheck = await admin.post('/api/uploads/s3', {});
  assert.equal(configuredCheck.status, 503);
});

test('platform endpoints: health/root and disallowed CORS origin handling', async () => {
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);

  const root = await fetch(`${baseUrl}/`);
  assert.equal(root.status, 200);

  const blockedOrigin = await fetch(`${baseUrl}/api/products/categories`, {
    headers: {
      origin: 'https://malicious.example',
    },
  });
  assert.equal(blockedOrigin.status, 403);
});

test('users branches: register, duplicate rejection, top-sellers, user by id and not found', async () => {
  await seed();

  const register = await fetch(`${baseUrl}/api/users/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Branch Tester',
      email: 'branch@example.com',
      password: '1234',
    }),
  });
  assert.equal(register.status, 200);
  const registered = await register.json();
  assert.equal(registered.email, 'branch@example.com');

  const duplicate = await fetch(`${baseUrl}/api/users/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Branch Tester',
      email: 'branch@example.com',
      password: '1234',
    }),
  });
  assert.equal(duplicate.status, 400);

  const topSellers = await fetch(`${baseUrl}/api/users/top-sellers`);
  assert.equal(topSellers.status, 200);
  assert.equal(topSellers.headers.get('cache-control'), 'public, max-age=300, s-maxage=600');
  const sellers = await topSellers.json();
  assert.ok(Array.isArray(sellers));
  assert.ok(sellers.length >= 1);

  const byId = await fetch(`${baseUrl}/api/users/${registered._id}`);
  assert.equal(byId.status, 200);

  const missing = await fetch(`${baseUrl}/api/users/00000000-0000-0000-0000-000000000000`);
  assert.equal(missing.status, 404);
});

test('users admin branches: update/delete paths including not found and admin deletion guard', async () => {
  await seed();

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const register = await fetch(`${baseUrl}/api/users/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Delete Me',
      email: 'deleteme@example.com',
      password: '1234',
    }),
  });
  const created = await register.json();

  const updateUser = await admin.put(`/api/users/${created._id}`, {
    name: 'Delete Me Updated',
    email: created.email,
    isSeller: true,
    isAdmin: false,
  });
  assert.equal(updateUser.status, 200);

  const updateMissing = await admin.put('/api/users/00000000-0000-0000-0000-000000000000', {
    name: 'Missing',
    email: 'missing@example.com',
    isSeller: false,
    isAdmin: false,
  });
  assert.equal(updateMissing.status, 404);

  const usersResponse = await admin.request('/api/users');
  assert.equal(usersResponse.status, 200);
  const users = await usersResponse.json();
  const seededAdmin = users.find((entry) => entry.email === 'admin@gmail.com');
  assert.ok(seededAdmin?._id);

  const deleteAdmin = await admin.request(`/api/users/${seededAdmin._id}`, {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(deleteAdmin.status, 400);

  const deleteCreated = await admin.request(`/api/users/${created._id}`, {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(deleteCreated.status, 200);

  const deleteMissing = await admin.request('/api/users/00000000-0000-0000-0000-000000000000', {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(deleteMissing.status, 404);
});

test('users profile branches: update fields/password and handle missing authenticated user', async () => {
  await seed();

  const user = new Session(baseUrl);
  const signin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(signin.status, 200);
  await user.getCsrfToken();

  const updateProfile = await user.put('/api/users/profile', {
    name: 'Updated User',
    email: 'user.updated@gmail.com',
    password: 'new-password',
    sellerName: 'Updated Seller Name',
    sellerLogo: 'https://example.com/logo.png',
    sellerDescription: 'Updated seller bio',
  });
  assert.equal(updateProfile.status, 200);
  const updatedBody = await updateProfile.json();
  assert.equal(updatedBody.name, 'Updated User');
  assert.equal(updatedBody.email, 'user.updated@gmail.com');

  const signout = await user.post('/api/users/signout', {});
  assert.equal(signout.status, 200);

  const signinWithNewPassword = await user.post(
    '/api/users/signin',
    { email: 'user.updated@gmail.com', password: 'new-password' },
    { withCsrf: false }
  );
  assert.equal(signinWithNewPassword.status, 200);

  const temporary = new Session(baseUrl);
  const registerTemporary = await temporary.post(
    '/api/users/register',
    { name: 'Temporary', email: 'temporary@gmail.com', password: '1234' },
    { withCsrf: false }
  );
  assert.equal(registerTemporary.status, 200);
  const temporaryUser = await registerTemporary.json();
  assert.ok(temporaryUser._id);
  await temporary.getCsrfToken();

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const deleteTemporary = await admin.request(`/api/users/${temporaryUser._id}`, {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(deleteTemporary.status, 200);

  const missingProfile = await temporary.put('/api/users/profile', {
    name: 'Should Fail',
  });
  assert.equal(missingProfile.status, 404);
});

test('products branches: filter validation, seed route, CRUD, and review guardrails', async () => {
  await seed();

  const invalidOrder = await fetch(`${baseUrl}/api/products?order=invalid-order`);
  assert.equal(invalidOrder.status, 400);

  const productSeed = await fetch(`${baseUrl}/api/products/seed`);
  assert.ok([401, 403].includes(productSeed.status));

  const missingProduct = await fetch(`${baseUrl}/api/products/00000000-0000-0000-0000-000000000000`);
  assert.equal(missingProduct.status, 404);

  const seller = new Session(baseUrl);
  const sellerSignin = await seller.post('/api/users/signin', { email: 'seller@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(sellerSignin.status, 200);
  await seller.getCsrfToken();

  const createProduct = await seller.post('/api/products', {});
  assert.equal(createProduct.status, 200);
  const createdProduct = (await createProduct.json()).product;
  assert.ok(createdProduct._id);

  const updateProduct = await seller.put(`/api/products/${createdProduct._id}`, {
    name: 'Updated Product',
    price: 19.99,
    image: 'https://opengameart.org/sites/default/files/items.png',
    category: 'Accessories',
    brand: 'Brand X',
    countInStock: 15,
    description: 'Updated description',
  });
  assert.equal(updateProduct.status, 200);

  const updateMissing = await seller.put('/api/products/00000000-0000-0000-0000-000000000000', {
    name: 'Missing',
    price: 10,
    image: 'https://opengameart.org/sites/default/files/items.png',
    category: 'Shoes',
    brand: 'Brand Y',
    countInStock: 1,
    description: 'Missing product',
  });
  assert.equal(updateMissing.status, 404);

  const reviewProduct = await seller.post(`/api/products/${createdProduct._id}/reviews`, {
    rating: 4,
    comment: 'Looks good',
  });
  assert.equal(reviewProduct.status, 201);

  const duplicateReview = await seller.post(`/api/products/${createdProduct._id}/reviews`, {
    rating: 5,
    comment: 'Second review should fail',
  });
  assert.equal(duplicateReview.status, 400);

  const missingReviewTarget = await seller.post('/api/products/00000000-0000-0000-0000-000000000000/reviews', {
    rating: 4,
    comment: 'Missing target',
  });
  assert.equal(missingReviewTarget.status, 404);

  const sellerDeleteAttempt = await seller.request(`/api/products/${createdProduct._id}`, {
    method: 'DELETE',
    headers: {
      'x-csrf-token': seller.csrfToken,
    },
  });
  assert.equal(sellerDeleteAttempt.status, 401);

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const adminDelete = await admin.request(`/api/products/${createdProduct._id}`, {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(adminDelete.status, 200);
});

test('orders branches: empty cart rejection, order detail/missing, seller listing, deliver/delete flows', async () => {
  await seed();

  const user = new Session(baseUrl);
  const userSignin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(userSignin.status, 200);
  await user.getCsrfToken();

  const emptyCart = await user.post('/api/orders', {
    orderItems: [],
    shippingAddress: {},
    paymentMethod: 'PayPal',
  });
  assert.equal(emptyCart.status, 400);

  const productsResponse = await fetch(`${baseUrl}/api/products?pageNumber=1`);
  const products = (await productsResponse.json()).products;
  const item = products[0];

  const createOrder = await user.post('/api/orders', {
    orderItems: [
      {
        name: item.name,
        qty: 1,
        image: item.image,
        price: item.price,
        product: item._id,
        seller: { _id: item.seller?._id || null },
      },
    ],
    shippingAddress: { fullName: 'User', address: 'A', city: 'B', postalCode: '100', country: 'TW' },
    paymentMethod: 'PayPal',
    itemsPrice: item.price,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: item.price,
  });
  assert.equal(createOrder.status, 201);
  const createdOrder = (await createOrder.json()).order;

  const readOrder = await user.request(`/api/orders/${createdOrder._id}`);
  assert.equal(readOrder.status, 200);

  const readMissingOrder = await user.request('/api/orders/00000000-0000-0000-0000-000000000000');
  assert.equal(readMissingOrder.status, 404);

  const seller = new Session(baseUrl);
  const sellerSignin = await seller.post('/api/users/signin', { email: 'seller@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(sellerSignin.status, 200);
  await seller.getCsrfToken();

  const sellerOrders = await seller.request('/api/orders?seller=');
  assert.equal(sellerOrders.status, 200);

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const deliverOrder = await admin.put(`/api/orders/${createdOrder._id}/deliver`, {});
  assert.equal(deliverOrder.status, 200);

  const deliverMissing = await admin.put('/api/orders/00000000-0000-0000-0000-000000000000/deliver', {});
  assert.equal(deliverMissing.status, 404);

  const deleteOrder = await admin.request(`/api/orders/${createdOrder._id}`, {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(deleteOrder.status, 200);

  const deleteMissing = await admin.request('/api/orders/00000000-0000-0000-0000-000000000000', {
    method: 'DELETE',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
  });
  assert.equal(deleteMissing.status, 404);
});

test('orders security: non-owner cannot read or pay another user order', async () => {
  await seed();

  const buyer = new Session(baseUrl);
  const buyerSignin = await buyer.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(buyerSignin.status, 200);
  await buyer.getCsrfToken();

  const productsResponse = await fetch(`${baseUrl}/api/products?pageNumber=1`);
  const product = (await productsResponse.json()).products[0];

  const createOrder = await buyer.post('/api/orders', {
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
    shippingAddress: { fullName: 'Buyer', address: 'A', city: 'B', postalCode: '100', country: 'TW' },
    paymentMethod: 'PayPal',
    itemsPrice: product.price,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: product.price,
  });
  assert.equal(createOrder.status, 201);
  const orderId = (await createOrder.json()).order._id;

  const outsider = new Session(baseUrl);
  const registerOutsider = await outsider.post(
    '/api/users/register',
    { name: 'Outsider', email: 'outsider@gmail.com', password: '1234' },
    { withCsrf: false }
  );
  assert.equal(registerOutsider.status, 200);
  await outsider.getCsrfToken();

  const forbiddenRead = await outsider.request(`/api/orders/${orderId}`);
  assert.equal(forbiddenRead.status, 403);

  const forbiddenPay = await outsider.put(`/api/orders/${orderId}/pay`, {
    id: 'forged',
    status: 'COMPLETED',
    update_time: new Date().toISOString(),
    email_address: 'outsider@gmail.com',
  });
  assert.equal(forbiddenPay.status, 403);
});

test('products security: seed route requires admin auth and sellers cannot update other seller product', async () => {
  await seed();

  const anonSeed = await fetch(`${baseUrl}/api/products/seed`);
  assert.ok([401, 403].includes(anonSeed.status));

  const seller = new Session(baseUrl);
  const sellerSignin = await seller.post('/api/users/signin', { email: 'seller@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(sellerSignin.status, 200);
  await seller.getCsrfToken();

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const usersResponse = await admin.request('/api/users');
  assert.equal(usersResponse.status, 200);
  const users = await usersResponse.json();
  const buyer = users.find((entry) => entry.email === 'user@gmail.com');
  assert.ok(buyer?._id);

  const promoteBuyer = await admin.put(`/api/users/${buyer._id}`, {
    name: buyer.name,
    email: buyer.email,
    isSeller: true,
    isAdmin: false,
  });
  assert.equal(promoteBuyer.status, 200);

  const buyerAsSeller = new Session(baseUrl);
  const promotedSignin = await buyerAsSeller.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(promotedSignin.status, 200);
  await buyerAsSeller.getCsrfToken();

  const productsResponse = await fetch(`${baseUrl}/api/products?pageNumber=1`);
  const targetProduct = (await productsResponse.json()).products.find((item) => item.seller?._id);
  assert.ok(targetProduct?._id);

  const forbiddenUpdate = await buyerAsSeller.put(`/api/products/${targetProduct._id}`, {
    name: 'Hacked Name',
    price: targetProduct.price,
    image: targetProduct.image,
    category: targetProduct.category,
    brand: targetProduct.brand,
    countInStock: targetProduct.countInStock,
    description: targetProduct.description,
  });
  assert.equal(forbiddenUpdate.status, 403);
});

test('orders security: seller_id is derived from product records, not trusted from client payload', async () => {
  await seed();

  const buyer = new Session(baseUrl);
  const buyerSignin = await buyer.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(buyerSignin.status, 200);
  await buyer.getCsrfToken();

  const productsResponse = await fetch(`${baseUrl}/api/products?pageNumber=1`);
  const product = (await productsResponse.json()).products.find((entry) => entry.seller?._id);
  assert.ok(product?._id);
  const forgedSellerId = '00000000-0000-0000-0000-000000000000';

  const createOrder = await buyer.post('/api/orders', {
    orderItems: [
      {
        name: product.name,
        qty: 1,
        image: product.image,
        price: product.price,
        product: product._id,
        seller: { _id: forgedSellerId },
      },
    ],
    shippingAddress: { fullName: 'Buyer', address: 'A', city: 'B', postalCode: '100', country: 'TW' },
    paymentMethod: 'PayPal',
    itemsPrice: product.price,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: product.price,
  });
  assert.equal(createOrder.status, 201);
  const order = (await createOrder.json()).order;
  assert.equal(order.seller, product.seller._id);
  assert.notEqual(order.seller, forgedSellerId);
});

test('support branches: admin user listing, thread validation, message validation, and missing thread', async () => {
  await seed();

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const supportUsers = await admin.request('/api/support/admin/users');
  assert.equal(supportUsers.status, 200);
  const users = await supportUsers.json();
  assert.ok(Array.isArray(users));

  const createWithoutUserId = await admin.post('/api/support/threads', { userId: '' });
  assert.equal(createWithoutUserId.status, 400);

  const user = new Session(baseUrl);
  const userSignin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(userSignin.status, 200);
  await user.getCsrfToken();

  const threadResponse = await user.post('/api/support/threads', { userId: '' });
  assert.equal(threadResponse.status, 201);
  const thread = await threadResponse.json();

  const emptyMessage = await user.post(`/api/support/threads/${thread._id}/messages`, { body: '   ' });
  assert.equal(emptyMessage.status, 400);

  const missingThreadMessage = await user.post('/api/support/threads/00000000-0000-0000-0000-000000000000/messages', {
    body: 'Hello',
  });
  assert.equal(missingThreadMessage.status, 404);
});

test('seed router branches: auth/admin checks and successful reseed', async () => {
  await seed();

  const anonymous = await fetch(`${baseUrl}/api/seed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ count: 10 }),
  });
  assert.ok([401, 403].includes(anonymous.status));

  const user = new Session(baseUrl);
  const userSignin = await user.post('/api/users/signin', { email: 'user@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(userSignin.status, 200);
  await user.getCsrfToken();

  const forbidden = await user.post('/api/seed', { count: 10 });
  assert.equal(forbidden.status, 401);

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const reseed = await admin.post('/api/seed', { count: 10 });
  assert.equal(reseed.status, 200);
  const payload = await reseed.json();
  assert.equal(payload.products, 10);
  assert.equal(payload.users, 3);
});

test('upload router branches: reject non-image and accept image upload', async () => {
  await seed();

  const admin = new Session(baseUrl);
  const adminSignin = await admin.post('/api/users/signin', { email: 'admin@gmail.com', password: '1234' }, { withCsrf: false });
  assert.equal(adminSignin.status, 200);
  await admin.getCsrfToken();

  const plainForm = new FormData();
  plainForm.append('image', new Blob(['not-image'], { type: 'text/plain' }), 'bad.txt');
  const plainUpload = await admin.request('/api/uploads', {
    method: 'POST',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
    body: plainForm,
  });
  assert.equal(plainUpload.status, 500);

  const imageForm = new FormData();
  imageForm.append('image', new Blob(['fake-image-bytes'], { type: 'image/png' }), 'ok.png');
  const imageUpload = await admin.request('/api/uploads', {
    method: 'POST',
    headers: {
      'x-csrf-token': admin.csrfToken,
    },
    body: imageForm,
  });
  assert.equal(imageUpload.status, 200);
  const uploadedPath = await imageUpload.text();
  assert.match(uploadedPath, /uploads[\\/]/);
});
