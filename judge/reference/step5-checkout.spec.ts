import { test, expect, type Page } from '@playwright/test';
import { addToCart, signIn } from './helpers';

const VALID = { 'First name': 'Asha', 'Last name': 'Rao', Email: 'asha@example.com', 'Phone number': '98765 43210', Postcode: '560001' };

async function submit(page: Page, overrides: Partial<Record<keyof typeof VALID, string>>) {
  for (const [label, value] of Object.entries({ ...VALID, ...overrides })) await page.getByLabel(label).fill(value);
  await page.getByRole('button', { name: 'Continue to review' }).click();
}

test.describe('Checkout form', { tag: '@step5' }, () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await addToCart(page, 2);
    await page.goto('/checkout.html');
  });

  test('valid details go to review', async ({ page }) => {
    await submit(page, {});
    await expect(page).toHaveURL(/review\.html/);
  });

  test('postcode must be digits only', async ({ page }) => {
    await submit(page, { Postcode: '56A001' });
    await expect(page.getByText('Enter a valid 6-digit postcode')).toBeVisible();
    await expect(page).toHaveURL(/checkout\.html/);
  });

  test('phone must be exactly 10 digits', async ({ page }) => {
    await submit(page, { 'Phone number': '98765432101' });
    await expect(page.getByText('Enter a 10-digit phone number')).toBeVisible();
  });

  test('blank-looking first name is rejected', async ({ page }) => {
    await submit(page, { 'First name': '   ' });
    await expect(page.getByText('First name is required')).toBeVisible();
  });

  test('last name is required', async ({ page }) => {
    await submit(page, { 'Last name': '' });
    await expect(page.getByText('Last name is required')).toBeVisible();
  });
});
