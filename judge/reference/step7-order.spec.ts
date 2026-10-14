import { test, expect, type Page } from '@playwright/test';
import { addToCart, saveDetails, signIn } from './helpers';

async function review(page: Page) {
  await signIn(page);
  await addToCart(page, 1);
  await saveDetails(page);
  await page.goto('/review.html');
}

test.describe('Order totals and confirmation', { tag: '@step7' }, () => {
  test('tax is rounded to the nearest cent', async ({ page }) => {
    await review(page);
    await expect(page.getByTestId('summary-tax')).toHaveText('$4.00');
    await expect(page.getByTestId('summary-total')).toHaveText('$53.99');
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByTestId('order-total')).toHaveText('$53.99');
  });

  test('tax is charged after the discount', async ({ page }) => {
    await review(page);
    await page.getByLabel('Promo code').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByTestId('summary-tax')).toHaveText('$3.60');
    await expect(page.getByTestId('summary-total')).toHaveText('$48.59');
  });

  test('receipt matches the confirmation', async ({ page }) => {
    await review(page);
    await page.getByLabel('Promo code').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByTestId('promo-applied')).toBeVisible();
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    const orderId = await page.getByTestId('order-id').textContent();
    expect(orderId).toMatch(/^QS-\d{6}$/);
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'View receipt' }).click();
    const receipt = await popupPromise;
    await expect(receipt.getByTestId('receipt-order-id')).toHaveText(orderId!);
    await expect(receipt.getByTestId('receipt-total')).toHaveText('$48.59');
  });

  test('cart is empty after ordering', async ({ page }) => {
    await review(page);
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page.getByTestId('cart-badge')).toBeHidden();
    await page.goto('/cart.html');
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });
});
