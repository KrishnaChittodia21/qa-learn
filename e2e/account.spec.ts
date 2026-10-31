// Accounts end to end, against the real qa-api: progress made while signed out is imported on first sign-in, exams
// are graded by the service, and the account's progress shows up in a second browser.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { API_LOG } from '../playwright.config';

const PASSWORD = 'e2e-password-123';

/** the confirm link the service logged for `email` (no SMTP in tests: emails go to the service log) */
async function confirmLink(email: string): Promise<string> {
  for (let i = 0; i < 50; i++) {
    const line = readFileSync(API_LOG, 'utf8')
      .split('\n')
      .reverse()
      .find((l) => l.includes(`"to":"${email}"`) && l.includes('Confirm your email'));
    const url = line?.match(/https?:\/\/[^\s"\\]+verify-email[^\s"\\]+/)?.[0];
    if (url) return url;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`no confirm email for ${email} in ${API_LOG}`);
}

async function signIn(page: Page, email: string) {
  await page.goto('/#/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sign out/ }).filter({ visible: true })).toBeVisible();
  // sign-in finishes once the account's progress has loaded, then the page goes Home: wait for that before moving on
  await expect(page).toHaveURL(/#\/$/);
}

test('sign up keeps signed-out progress, grades an exam on the server, and syncs to another browser', async ({ page, browser }, info) => {
  // unique per run, project and repeat (sign-ups are limited to 3 a minute per IP: don't repeat this test more than that)
  const email = `e2e-${Date.now()}-${info.project.name}-${info.repeatEachIndex}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());
  // the first-visit tour, closed for good
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));

  // signed out: a lesson ticked as read is kept in this browser
  await page.goto('/#/topic/mt-fundamentals?tab=learn');
  await page.getByRole('checkbox').first().check();

  // sign up, confirm the email, sign in
  await page.goto('/#/signup');
  await page.getByLabel('Name').fill('E2E Learner');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/^Password/).fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await page.goto(await confirmLink(email));
  await expect(page.getByText('Email confirmed. Sign in to start.')).toBeVisible();
  await signIn(page, email);

  // the signed-out tick came along to the account
  await page.goto('/#/topic/mt-fundamentals?tab=learn');
  await expect(page.getByRole('checkbox').first()).toBeChecked();

  // an exam started, timed and graded by qa-api
  await page.goto('/#/topic/mt-fundamentals?tab=exam');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /mark all as read/ }).click();
  await page.getByRole('button', { name: /Set up exam/ }).click();
  const start = page.getByRole('button', { name: /Start run/ });
  await expect(start).toHaveCount(1);
  await start.click();
  await page.getByRole('group', { name: /Options/ }).getByRole('button').first().click();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Submit run' }).click();
  await expect(page.getByRole('heading', { name: 'Run complete' })).toBeVisible();

  // the same account in a fresh browser: the progress is there
  const other = await browser.newContext();
  const second = await other.newPage();
  await second.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await signIn(second, email);
  await second.goto('/#/topic/mt-fundamentals?tab=learn');
  await expect(second.getByRole('checkbox').first()).toBeChecked();
  // account pages open once signed in
  await second.goto('/#/achievements');
  await expect(second.getByText(/Sign up to unlock/)).toHaveCount(0);
  await other.close();
});
