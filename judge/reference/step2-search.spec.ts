import { test, expect } from '@playwright/test';
import { openProducts } from './helpers';

test.describe('Search and filter', { tag: '@step2' }, () => {
  test.beforeEach(async ({ page }) => {
    await openProducts(page);
  });

  test('search ignores case', async ({ page }) => {
    await page.getByLabel('Search products').fill('BACKPACK');
    await expect(page.getByTestId('product-name')).toHaveText(['Aero Backpack']);
    await expect(page.getByTestId('result-count')).toHaveText('Showing 1 product');
  });

  test('search ignores surrounding spaces', async ({ page }) => {
    await page.getByLabel('Search products').fill('  tote  ');
    await expect(page.getByTestId('product-name')).toHaveText(['Canvas Tote']);
  });

  test('search and category combine', async ({ page }) => {
    await page.getByLabel('Category').selectOption('Clothing');
    await page.getByLabel('Search products').fill('o');
    await expect(page.getByTestId('product-name')).toHaveText(['Bolt T-Shirt', 'Classic Hoodie', 'Explorer Jacket', 'Sport Socks']);
    await expect(page.getByTestId('result-count')).toHaveText('Showing 4 products');
  });

  test('no results shows the empty message', async ({ page }) => {
    await page.getByLabel('Search products').fill('zzz');
    await expect(page.getByTestId('product-card')).toHaveCount(0);
    await expect(page.getByText('No products match your search.')).toBeVisible();
    await expect(page.getByTestId('result-count')).toHaveText('Showing 0 products');
  });
});
