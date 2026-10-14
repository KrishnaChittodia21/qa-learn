import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'Secret123!';

/** Signs in through the cookie-session API (page.request shares the page's cookies). */
export async function signIn(page: Page, username = 'alice') {
  const res = await page.request.post('/api/session/login', { data: { username, password: PASSWORD } });
  expect(res.ok()).toBeTruthy();
}

export async function addToCart(page: Page, productId: number, quantity = 1) {
  const res = await page.request.post('/api/cart/items', { data: { productId, quantity } });
  expect(res.ok()).toBeTruthy();
}

export async function saveDetails(page: Page) {
  const res = await page.request.post('/api/checkout/details', {
    data: { firstName: 'Asha', lastName: 'Rao', email: 'asha@example.com', phone: '98765 43210', postcode: '560001' },
  });
  expect(res.ok()).toBeTruthy();
}

export async function openProducts(page: Page) {
  await signIn(page);
  await page.goto('/inventory.html');
  await expect(page.getByTestId('product-card')).toHaveCount(12);
}
