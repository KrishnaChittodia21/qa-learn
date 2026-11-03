// Playwright config for the qa-learn app's own end-to-end tests (e2e/). Not the learner exercises:
// those are in practice/playwright.config.ts. Run: npm run test:e2e (needs a local mongod; starts both servers itself).
//
// qa-api runs on its own throwaway database with the real answer key synced into it. Without SMTP it writes every
// email (confirm and reset links included) to its log, which the tests read from e2e/.api.log.
import { defineConfig, devices } from '@playwright/test';

const PORT = 5179;
const API_PORT = 3101;
export const API_LOG = 'e2e/.api.log';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/e2e' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: `npm --prefix api run sync:answers --silent && node --no-warnings api/src/server.ts > ${API_LOG} 2>&1`,
      url: `http://127.0.0.1:${API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        MONGODB_URI: process.env.TEST_MONGODB_URI ?? 'mongodb://127.0.0.1:27017',
        MONGODB_DB: 'qa_learn_e2e',
        PORT: String(API_PORT),
        APP_URL: `http://localhost:${PORT}`,
        BETTER_AUTH_SECRET: 'e2e-secret-e2e-secret-e2e-secret-12345',
        // the browsers share one IP: room for both projects' sign-ups
        RATE_LIMIT_PER_MINUTE: '1000',
      },
    },
    {
      command: `npx vite --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      env: { API_URL: `http://127.0.0.1:${API_PORT}` },
    },
  ],
});
