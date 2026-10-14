import { test, expect } from '@playwright/test';
import { openProducts } from './helpers';

const A_TO_Z = [
  'Aero Backpack', 'Bolt T-Shirt', 'Canvas Tote', 'Classic Hoodie', 'Desk Lamp', 'Explorer Jacket',
  'Fleece Beanie', 'iPhone Case', 'Noise-Cancelling Headphones', 'Sport Socks', 'Water Bottle', 'Wireless Mouse',
];

test.describe('Sorting', { tag: '@step3' }, () => {
  test.beforeEach(async ({ page }) => {
    await openProducts(page);
  });

  test('default is name A to Z, ignoring case', async ({ page }) => {
    await expect(page.getByTestId('product-name')).toHaveText(A_TO_Z);
    await page.getByLabel('Sort by').selectOption('Name (Z to A)');
    await expect(page.getByTestId('product-name')).toHaveText([...A_TO_Z].reverse());
  });

  test('price low to high is numeric, cents included, ties by name', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('Price (low to high)');
    await expect(page.getByTestId('product-price')).toHaveText([
      '$7.99', '$9.49', '$9.99', '$12.50', '$12.50', '$15.99', '$24.00', '$29.99', '$39.50', '$49.99', '$120.00', '$199.00',
    ]);
    await expect(page.getByTestId('product-name').nth(3)).toHaveText('Canvas Tote');
  });

  test('price high to low keeps ties A to Z', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('Price (high to low)');
    await expect(page.getByTestId('product-name')).toHaveText([
      'Noise-Cancelling Headphones', 'Explorer Jacket', 'Aero Backpack', 'Classic Hoodie', 'Wireless Mouse', 'Desk Lamp',
      'Bolt T-Shirt', 'Canvas Tote', 'Water Bottle', 'Fleece Beanie', 'Sport Socks', 'iPhone Case',
    ]);
  });

  test('sort stays applied after filtering', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('Price (high to low)');
    await page.getByLabel('Category').selectOption('Electronics');
    await expect(page.getByTestId('product-name')).toHaveText(['Noise-Cancelling Headphones', 'Wireless Mouse', 'iPhone Case']);
  });
});
