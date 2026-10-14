import { test, expect } from '@playwright/test';
import { addToCart, openProducts, signIn } from './helpers';

test.describe('Cart', { tag: '@step4' }, () => {
  test('add from the product list updates the badge', async ({ page }) => {
    await openProducts(page);
    await page.getByRole('article', { name: 'Desk Lamp' }).getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByRole('status')).toHaveText('Added Desk Lamp to cart');
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });

  test('quantity accepts 10 but rejects 11', async ({ page }) => {
    await signIn(page);
    await addToCart(page, 4);
    await page.goto('/cart.html');
    const qty = page.getByLabel('Quantity for Desk Lamp');
    await qty.fill('10');
    await qty.press('Enter');
    await expect(page.getByTestId('line-total')).toHaveText('$240.00');
    await qty.fill('11');
    await qty.press('Enter');
    await expect(page.getByRole('alert')).toHaveText('Quantity must be between 1 and 10');
    await expect(qty).toHaveValue('10');
    await expect(page.getByTestId('cart-badge')).toHaveText('10');
  });

  test('badge updates after remove', async ({ page }) => {
    await signIn(page);
    await addToCart(page, 1);
    await addToCart(page, 2);
    await page.goto('/cart.html');
    await expect(page.getByTestId('cart-badge')).toHaveText('2');
    await page.getByRole('button', { name: 'Remove Aero Backpack' }).click();
    await expect(page.getByTestId('cart-row')).toHaveCount(1);
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });

  test('cart survives a reload', async ({ page }) => {
    await signIn(page);
    await addToCart(page, 6, 2);
    await page.goto('/cart.html');
    await expect(page.getByTestId('cart-badge')).toHaveText('2');
    await page.reload();
    await expect(page.getByTestId('cart-row')).toHaveCount(1);
    await expect(page.getByTestId('cart-badge')).toHaveText('2');
  });

  test('empty cart asks for confirmation', async ({ page }) => {
    await signIn(page);
    await addToCart(page, 1);
    await addToCart(page, 9);
    await page.goto('/cart.html');
    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: 'Empty cart' }).click();
    await expect(page.getByTestId('cart-row')).toHaveCount(2);
    await page.reload();
    await expect(page.getByTestId('cart-row')).toHaveCount(2);
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Empty cart' }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
    await expect(page.getByTestId('cart-badge')).toBeHidden();
  });
});
