import { test, expect, type Page } from '@playwright/test';
import { addToCart, saveDetails, signIn } from './helpers';

async function reviewWith(page: Page, productId: number, qty: number) {
  await signIn(page);
  await addToCart(page, productId, qty);
  await saveDetails(page);
  await page.goto('/review.html');
}

async function apply(page: Page, code: string) {
  await page.getByLabel('Promo code').fill(code);
  await page.getByRole('button', { name: 'Apply' }).click();
}

test.describe('Promo codes', { tag: '@step6' }, () => {
  test('codes are case-insensitive', async ({ page }) => {
    await reviewWith(page, 1, 1);
    await apply(page, 'save10');
    await expect(page.getByTestId('summary-discount')).toHaveText('-$5.00');
  });

  test('expired code is rejected', async ({ page }) => {
    await reviewWith(page, 1, 1);
    await apply(page, 'WELCOME5');
    await expect(page.getByRole('alert')).toHaveText('This promo code has expired');
    await expect(page.getByTestId('summary-discount')).toBeHidden();
  });

  test('FLAT20 works at exactly $100.00', async ({ page }) => {
    await reviewWith(page, 9, 8);
    await expect(page.getByTestId('summary-subtotal')).toHaveText('$100.00');
    await apply(page, 'FLAT20');
    await expect(page.getByTestId('summary-discount')).toHaveText('-$20.00');
  });

  test('FLAT20 below the minimum is rejected', async ({ page }) => {
    await reviewWith(page, 1, 1);
    await apply(page, 'FLAT20');
    await expect(page.getByRole('alert')).toHaveText('FLAT20 needs an items subtotal of at least $100.00');
    await expect(page.getByTestId('summary-total')).toHaveText('$53.99');
  });

  test('only one code per order', async ({ page }) => {
    await reviewWith(page, 9, 8);
    await apply(page, 'SAVE10');
    await expect(page.getByTestId('summary-discount')).toHaveText('-$10.00');
    await apply(page, 'FLAT20');
    await expect(page.getByRole('alert')).toHaveText('Only one promo code can be used per order');
    await expect(page.getByTestId('summary-discount')).toHaveText('-$10.00');
  });
});
