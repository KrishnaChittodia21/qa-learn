// Your Playwright Lab tests live in practice/tests/. Add as many *.spec.ts files as you like.
//
// Every test must carry the tag of the step it tests, so the judge knows which hidden bugs to try on it:
//
//   test('locked user sees an error', { tag: '@step1' }, async ({ page }) => { ... });
//
// or tag a whole group:
//
//   test.describe('Cart', { tag: '@step4' }, () => {
//     test('...', async ({ page }) => { ... });
//   });
//
// Read the spec for each step in the app (Practice → Playwright Lab), brainstorm scenarios
// (boundaries, negative cases, state, edge cases), write the tests, then run `npm run judge`.
import { test, expect } from '@playwright/test';

test('standard user can sign in', { tag: '@step1' }, async ({ page }) => {
  await page.goto('/'); // relative URL: baseURL comes from playwright.config.ts
  await page.getByLabel('Username').fill('alice');
  await page.getByLabel('Password').fill('Secret123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByText('Signed in as alice')).toBeVisible();
});

// TODO @step1 Login: what else does the spec promise? Wrong passwords, empty fields, special accounts, logging out…

// TODO @step2 Product list, search and filter:
// test('…', { tag: '@step2' }, async ({ page }) => { … });

// TODO @step3 Sorting:
// test('…', { tag: '@step3' }, async ({ page }) => { … });

// TODO @step4 Cart (quantities, badge, reload, the "Empty cart" dialog):
// test('…', { tag: '@step4' }, async ({ page }) => { … });

// TODO @step5 Checkout form validation:
// test('…', { tag: '@step5' }, async ({ page }) => { … });

// TODO @step6 Promo codes:
// test('…', { tag: '@step6' }, async ({ page }) => { … });

// TODO @step7 Order totals and confirmation (the receipt opens in a new tab):
// test('…', { tag: '@step7' }, async ({ page }) => { … });

// TODO @step8 REST API (use the `request` fixture):
// test('…', { tag: '@step8' }, async ({ request }) => { … });
