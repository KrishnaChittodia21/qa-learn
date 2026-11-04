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

test('the visualiser steps through a wrong solution and shows where it went off', async ({ page }) => {
  const done = noApi(page);
  await page.goto('/#/coding/code-arrays-rotate-one');
  // right rotation copies each cell onto itself: the "right" test fails
  await page.locator('.cx-ed textarea').fill(
    [
      'function rotateOne(arr, direction) {',
      "  if (direction === 'left') {",
      '    const first = arr[0];',
      '    for (let i = 0; i < arr.length - 1; i++) arr[i] = arr[i + 1];',
      '    arr[arr.length - 1] = first;',
      '  } else {',
      '    const last = arr[arr.length - 1];',
      '    for (let i = arr.length - 1; i > 0; i--) arr[i] = arr[i];',
      '    arr[0] = last;',
      '  }',
      '  return arr;',
      '}',
    ].join('\n'),
  );
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const tv = page.getByRole('region', { name: 'Step-through visualiser' });
  // it opens on the first failing visible test and plays it
  await expect(tv.getByRole('button', { name: /✗ 02/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(tv.locator('.tv-code li.now')).toHaveCount(1);
  // it autoplays unless reduced motion is on; either way, scrub back to the start
  const pause = tv.getByRole('button', { name: 'Pause' });
  if (await pause.isVisible()) await pause.click();
  await tv.getByRole('slider', { name: 'Step' }).fill('0');
  await expect(tv.locator('.tv-count')).toHaveText(/^1\//);
  await tv.getByRole('button', { name: 'Next step' }).click();
  await expect(tv.locator('.tv-count')).toHaveText(/^2\//);
  // the verdict names the return and the expected value, and jumps there with the wrong cells marked
  await expect(tv.locator('.tv-verdict')).toContainText('Returned [4, 2, 3, 4] on line 11');
  await tv.getByRole('button', { name: 'Go to the return' }).click();
  await expect(tv.locator('.tv-cell.wrong')).toHaveCount(3);
  await expect(tv.locator('.tv-expect')).toBeVisible();
  done();
});
