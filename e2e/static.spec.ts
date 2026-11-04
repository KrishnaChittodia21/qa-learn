// Everything works in the browser: no service, no sign-in, exams graded here, answers after an attempt, CSP enforced.
import { expect, test, type Page } from '@playwright/test';

/** fails the test if the page ever calls the service */
function noApi(page: Page) {
  const calls: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/')) calls.push(r.url());
  });
  return () => expect(calls, 'the app must not call /api').toEqual([]);
}

/** every Content-Security-Policy violation the page reports */
const cspErrors = new WeakMap<Page, string[]>();

test.afterEach(async ({ page }) => {
  expect(cspErrors.get(page) ?? [], 'no CSP violations').toEqual([]);
});

test.beforeEach(async ({ page }) => {
  const errs: string[] = [];
  cspErrors.set(page, errs);
  page.on('console', (m) => /Content Security Policy/i.test(m.text()) && errs.push(m.text()));
  await page.addInitScript(() => localStorage.getItem('qa-learn-ui-v1') || localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());
});

test('no sign-in anywhere; every page is open', async ({ page }) => {
  const done = noApi(page);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Start lesson one/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sign in|Sign up|Create account/ })).toHaveCount(0);
  for (const path of ['/weak-areas', '/achievements', '/saved']) {
    await page.goto(`/#${path}`);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('note', { name: /is locked/ })).toHaveCount(0);
    await expect(page.getByText(/Sign up to|Sign in to/)).toHaveCount(0);
  }
  done();
});

test('a topic exam is graded in the browser and recorded', async ({ page }) => {
  const done = noApi(page);
  await page.goto('/#/topic/mt-fundamentals?tab=exam');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /mark all as read/ }).click();
  await page.getByRole('button', { name: /Set up exam/ }).click();
  await page.getByRole('button', { name: /Start run/ }).click();
  // answer the first question with its first option, then submit the rest unanswered
  await page.locator('.opts button').first().click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Submit run' }).click();
  await expect(page.getByText(/\d+%/).first()).toBeVisible();
  // the review shows the right answers (they ship with this build)
  await expect(page.locator('.explanation').first()).not.toBeEmpty();
  const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('qa-learn-progress-v1') ?? '{}').tests?.['mt-fundamentals']?.attempts);
  expect(attempts).toBe(1);
  done();
});

test('a model answer shows after an attempt, with no wait', async ({ page }) => {
  const done = noApi(page);
  await page.goto('/#/topic/mt-fundamentals?tab=interview');
  const box = page.getByRole('textbox', { name: /Your answer to question 1/ });
  await box.fill('Testing finds defects early and builds confidence that the product meets its requirements.');
  const card = page.locator('.model-answer').first();
  await expect(card).toHaveCount(0);
  await page.getByRole('button', { name: 'Reveal model answer' }).first().click();
  // straight away: no 20-second wait and no service round trip
  await expect(card).toBeVisible({ timeout: 1000 });
  await expect(card).not.toBeEmpty();
  done();
});

test('learner code still runs under the CSP: a coding problem runs its tests', async ({ page }) => {
  const done = noApi(page);
  await page.goto('/#/coding/code-arrays-sum-and-max');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  // the starter runs in a blob Worker via new Function: a summary means the CSP allowed it
  await expect(page.locator('.tr-sum')).toBeVisible();
  await expect(page.getByText(/Timed out|Content Security Policy|EvalError/)).toHaveCount(0);
  done();
});
