// Playwright config for YOUR practice tests (Playwright Lab in the QA Learn app).
//
//   1. Start the practice app:   npm run practice-app      (http://localhost:4400)
//   2. Run your tests:           npm run practice:test     (or: npx playwright test --config practice/playwright.config.ts)
//   3. Grade them:               npm run judge             (starts its own servers; no need to keep step 1 running)
//
// The judge runs your tests against fresh copies of the app on random ports by setting PRACTICE_URL,
// so always navigate with relative URLs (page.goto('/cart.html')), never a hard-coded http://localhost:4400.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // the judge wants honest results: a test that needs a retry is flaky
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.PRACTICE_URL ?? 'http://localhost:4400',
    trace: 'retain-on-failure', // open with: npx playwright show-trace <path from the error output>
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
