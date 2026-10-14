import { test, expect } from '@playwright/test';
import { PASSWORD } from './helpers';

test.describe('Login', { tag: '@step1' }, () => {
  async function login(page: import('@playwright/test').Page, user: string, pass: string) {
    await page.goto('/');
    await page.getByLabel('Username').fill(user);
    await page.getByLabel('Password').fill(pass);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  test('valid user signs in', async ({ page }) => {
    await login(page, 'alice', PASSWORD);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(page.getByText('Signed in as alice')).toBeVisible();
  });

  test('locked user is rejected', async ({ page }) => {
    await login(page, 'locked_user', PASSWORD);
    await expect(page.getByRole('alert')).toHaveText('Sorry, this account has been locked.');
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('password is case-sensitive', async ({ page }) => {
    await login(page, 'alice', PASSWORD.toLowerCase());
    await expect(page.getByRole('alert')).toHaveText('Invalid username or password');
  });

  test('empty password is required', async ({ page }) => {
    await login(page, 'alice', '');
    await expect(page.getByRole('alert')).toHaveText('Password is required');
  });

  test('protected pages redirect after logout', async ({ page }) => {
    await login(page, 'alice', PASSWORD);
    await expect(page).toHaveURL(/inventory/);
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.goto('/inventory.html');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
