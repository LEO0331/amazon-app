import { expect, test } from '@playwright/test';

const apiBaseUrl = 'http://127.0.0.1:5005';

async function seedDatabase(request) {
  const response = await request.get(`${apiBaseUrl}/api/users/seed`);
  expect(response.ok()).toBeTruthy();
}

async function getAvailableProduct(request) {
  const response = await request.get(`${apiBaseUrl}/api/products?pageSize=30`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const product = body.products.find((item) => item.countInStock > 0);

  expect(product, [
    'ERROR: Seeded catalog did not include an in-stock product.',
    'WHY: Checkout E2E needs a deterministic product that can be added to cart.',
    'FIX: Adjust seedProducts count/stock fixture or widen the product lookup page size.',
  ].join('\n')).toBeTruthy();

  return product;
}

test.describe('storefront checkout', () => {
  test.beforeEach(async ({ request }) => {
    await seedDatabase(request);
  });

  test('rejects invalid sign-in from the browser', async ({ page }) => {
    await page.goto('/#/signin');

    await page.getByLabel('Email').fill('user@gmail.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('creates an order through product, cart, auth, shipping, and payment screens', async ({ page, request }) => {
    const product = await getAvailableProduct(request);

    await page.goto(`/#/product/${product._id}`);
    await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
    await page.getByRole('button', { name: 'Add To Cart' }).click();

    await expect(page).toHaveURL(/#\/cart\//);
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
    await expect(page.getByText(product.name).first()).toBeVisible();
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();

    await expect(page).toHaveURL(/#\/signin\?redirect=shipping/);
    await page.getByLabel('Email').fill('user@gmail.com');
    await page.getByLabel('Password').fill('1234');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/#\/shipping/);
    await page.getByLabel('Full Name').fill('Customer User');
    await page.getByLabel('Address').fill('1 Demo Street');
    await page.getByLabel('City').fill('Taipei');
    await page.getByLabel('Postal Code').fill('100');
    await page.getByLabel('Country').fill('Taiwan');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/#\/payment/);
    await expect(page.getByLabel('PayPal')).toBeChecked();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/#\/placeorder/);
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/#\/order\/[a-f0-9-]+/);
    await expect(page.getByRole('heading', { name: /Order [a-f0-9-]+/ })).toBeVisible();
    await expect(page.getByText('Not Paid')).toBeVisible();
    await expect(page.getByText('Not Delivered')).toBeVisible();
  });
});
