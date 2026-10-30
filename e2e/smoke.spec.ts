// Smoke journey for a first-time visitor: Home → first lesson → mark it read → unlock and run the exam → result.
// Every later milestone (sign-up, locks, Saved, Shorts…) adds its own journey next to this one.
import { expect, test } from '@playwright/test';

test('a new visitor can study the first topic and take its exam', async ({ page }) => {
  // earning a badge (first section read, etc.) opens a celebration over the page at any point: close it when it shows
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());

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

  // the exam is locked until every section is read (default study-first lock)
  const topicUrl = page.url().split('?')[0];
  await page.goto(`${topicUrl}?tab=exam`);
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /mark all as read/ }).click();
  await page.getByRole('button', { name: /Set up exam/ }).click();

  // during a route change the outgoing page-host briefly renders the new page too (Layout.tsx, fixed in M6):
  // wait until there is one copy, which also fails if the duplicate ever stays
  const start = page.getByRole('button', { name: /Start run/ });
  await expect(start).toHaveCount(1);
  await start.click();
  await page.getByRole('group', { name: /Options/ }).getByRole('button').first().click();
  page.once('dialog', (d) => d.accept()); // "N question(s) unanswered. Submit anyway?"
  await page.getByRole('button', { name: 'Submit run' }).click();

  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();
});
