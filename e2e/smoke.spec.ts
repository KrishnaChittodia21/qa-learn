// Smoke journey for a first-time, signed-out visitor: Home → first lesson → mark it read (kept in this browser) →
// the graded exam and the account pages ask for an account. The signed-in journey is in account.spec.ts.
import { expect, test } from '@playwright/test';

test('a new visitor can study the first topic; exams and account pages ask for an account', async ({ page }) => {
  await page.goto('/');

  // first visit opens the welcome tour
  const tour = page.getByRole('dialog');
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Close the guide' }).click();
  await expect(tour).toBeHidden();

  await page.getByRole('link', { name: /Start lesson one/ }).click();
  await expect(page).toHaveURL(/#\/topic\/[^?]+\?tab=learn/);

  // ticking a section is saved and survives a reload
  const tick = page.getByRole('checkbox').first();
  await tick.check();
  await expect(tick).toBeChecked();
  await page.reload();
  await expect(page.getByRole('checkbox').first()).toBeChecked();

  // the exam is graded by qa-api, so it asks for an account
  const topicUrl = page.url().split('?')[0];
  await page.goto(`${topicUrl}?tab=exam`);
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /mark all as read/ }).click();
  await page.getByRole('button', { name: /Set up exam/ }).click();
  // during a route change the outgoing page-host briefly renders the new page too (Layout.tsx, fixed in M6)
  const signUp = page.getByRole('heading', { name: 'Sign up to take graded exams' });
  await expect(signUp).toHaveCount(1);
  await expect(signUp).toBeVisible();

  // interview answers too
  await page.goto(`${topicUrl}?tab=interview`);
  await expect(page.getByRole('link', { name: /Sign up to see the model answer/ }).first()).toBeVisible();

  // account pages are shown dimmed with the sign-up prompt
  await page.goto('/#/achievements');
  await expect(page.getByRole('note', { name: 'achievements is locked' })).toBeVisible();
});
