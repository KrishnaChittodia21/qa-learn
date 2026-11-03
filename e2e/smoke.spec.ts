// Smoke journey for a first-time, signed-out visitor: Home → first lesson → mark it read (kept in this browser) →
// the graded exam and the account pages ask for an account. The signed-in journey is in account.spec.ts.
import { expect, test } from '@playwright/test';

test('a new visitor can study the first topic; exams and account pages ask for an account', async ({ page }) => {
  // ticking a section earns "Hello, Tester"; its celebration may pop up over whatever comes next
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());
  await page.goto('/');

  // first visit opens the welcome tour
  const tour = page.getByRole('dialog');
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Close the guide' }).click();
  // the first-visit tour carries on into a "Show me" walkthrough of the menu
  await expect(page.getByText(/Show me · 1 of \d+/)).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByText(/Show me · /)).toBeHidden();

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
  // one copy only: the outgoing page must not render the new route too (fixed in M6)
  const signUp = page.getByRole('heading', { name: 'Sign up to take graded exams' });
  await expect(signUp).toHaveCount(1);
  await expect(signUp).toBeVisible();

  // interview answers too
  await page.goto(`${topicUrl}?tab=interview`);
  await expect(page.getByRole('link', { name: /Sign up to see the model answer/ }).first()).toBeVisible();

  // account pages are shown dimmed with the sign-up prompt
  await page.goto('/#/weak-areas');
  await expect(page.getByRole('note', { name: 'Weak areas is locked' })).toBeVisible();

  // badges are earned in this browser, no account needed: the ticked section above earned "Hello, Tester"
  await page.goto('/#/achievements');
  await expect(page.getByRole('note', { name: /is locked/ })).toHaveCount(0);
  await expect(page.getByText('Hello, Tester').first()).toBeVisible();
});

test('Guide me explains the page and "Show me" walks through it', async ({ page }) => {
  // a returning visitor: the welcome tour has been seen
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await page.goto('/#/topic/mt-fundamentals?tab=learn');
  await expect(page.getByRole('checkbox').first()).toBeVisible();
  await page.keyboard.press('?');
  const guide = page.getByRole('dialog', { name: 'Topic' });
  await expect(guide).toBeVisible();
  await guide.getByRole('button', { name: 'Show me' }).click();
  // stops not on screen are skipped (phones have no study-path strip), so check the walk, not its first stop
  await expect(page.getByText(/Show me · 1 of \d+/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Show me · 2 of')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText(/Show me · /)).toBeHidden();
});

test('a Short plays to its quiz and end card, and stays watched after a reload', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  // the first watched Short earns "Opening Scene"
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());

  await page.goto('/#/shorts');
  await expect(page.getByText(/0 of 12 watched/)).toBeVisible();
  await page.getByRole('link', { name: /Ariane 5: 37 seconds/ }).click();
  await expect(page).toHaveURL(/#\/short\/ariane-5-overflow/);

  const player = page.getByRole('region', { name: 'Ariane 5: 37 seconds' });
  const next = player.locator('.sp-navrow').getByRole('button', { name: 'Next beat' });
  // step through to the quiz: Next is disabled there until it is answered
  await expect(async () => {
    if (await next.isEnabled()) await next.click();
    await expect(player.getByRole('group', { name: 'Your answer' })).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(next).toBeDisabled();
  await player.getByRole('button', { name: 'A longer launch countdown' }).click();
  await expect(player.getByText('Not that one:')).toBeVisible();
  await player.getByRole('button', { name: /Ariane 5 flight data at its real boundaries/ }).click();
  await expect(player.getByText('Right.')).toBeVisible();
  await next.click();
  await expect(player.getByRole('link', { name: /Read the full lesson/ })).toBeVisible();

  await page.reload();
  await page.goto('/#/shorts');
  await expect(page.getByText(/1 of 12 watched/)).toBeVisible();
  await expect(page.getByRole('heading', { name: /Watched/ })).toBeVisible();
});
