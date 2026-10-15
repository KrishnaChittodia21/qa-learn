import type { CompanyQuestion } from '../../types';

const KPMG = {
  name: 'LinkedIn post: KPMG Playwright Interview Experience (SDET / QA Automation, L1)',
  url: 'https://www.linkedin.com/posts/chitra-malode-1150bb174_kpmg-playwright-interview-experience-sdet-activity-7494973834220019713-2G_Q',
  year: 2026,
};
const GHL = {
  name: 'LeetCode Discuss: GoHighLevel Interview Experience (Lead SDET, 7 YoE)',
  url: 'https://leetcode.com/discuss/post/8346427/',
  year: 2026,
};
const EQUALL = {
  name: 'LeetCode Discuss: Equall (LTCV Credit) Interview Experience (SDET 3, Founding QA)',
  url: 'https://leetcode.com/discuss/post/8337525/',
  year: 2026,
};
const ZEPTO = {
  name: 'LeetCode Discuss: ZEPTO | SDET2 | Interview Experience',
  url: 'https://leetcode.com/discuss/post/6026438/',
  year: 2024,
};
const FOCUS = {
  name: 'GeeksforGeeks: Focus Edumatics QA Engineering Interview Experience 2023',
  url: 'https://www.geeksforgeeks.org/focus-edumatics-qa-engineering-interview-experience-2023/',
  year: 2023,
};

export const QUESTIONS: CompanyQuestion[] = [
  // ---------------- KPMG ----------------
  {
    id: 'co-playwright-kpmg-1',
    company: 'KPMG',
    area: 'playwright',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'hard',
    question:
      'Live scenario: open a flight-booking site (MakeMyTrip was used) and, in the date picker, select the date that shows the cheapest fare.',
    answer: `Treat it as "read a list, compute, then act" rather than clicking blindly.

1. Open the calendar and wait for the fares to render with a web-first assertion (prices often load after the days).
2. Collect every day cell that has a price, parse the number (strip currency symbols and commas), and keep the index of the minimum.
3. Click that same cell and assert the selection.

    import { test, expect } from '@playwright/test';

    test('pick the cheapest date', async ({ page }) => {
      await page.goto('https://www.example-flights.com');
      await page.getByRole('button', { name: /departure/i }).click();
      const days = page.getByTestId('calendar-day').filter({ has: page.getByTestId('fare') });
      await expect(days.first()).toBeVisible();

      const fares = await days.getByTestId('fare').allInnerTexts();
      const values = fares.map((t) => Number(t.replace(/[^0-9.]/g, '')));
      const cheapest = values.indexOf(Math.min(...values));

      await days.nth(cheapest).click();
      await expect(days.nth(cheapest)).toHaveAttribute('aria-selected', 'true');
    });

Talk through the edge cases: days with no fare, ties (pick the first), fares that are still loading (assert a count or wait for the fares API with \`page.waitForResponse\` before reading), and month navigation if the cheapest date may be in the next month. Mention that on a real third-party site you would prefer the fare API (via \`page.route\` or the \`request\` fixture) to make the check deterministic.`,
    followUps: [
      {
        q: 'How would you cover two months instead of one?',
        a: 'Loop: read fares for the visible month, remember the min with its month label, click "next month", repeat, then navigate back to the winning month and click the cell.',
      },
      {
        q: 'Why not use allInnerTexts() immediately after opening the calendar?',
        a: 'allInnerTexts() does not auto-wait; it returns whatever is in the DOM now. Assert visibility or a count first, otherwise you may read an empty or partial list.',
      },
    ],
    topic: 'pw-actions',
    source: KPMG,
  },
  {
    id: 'co-playwright-kpmg-2',
    company: 'KPMG',
    area: 'playwright',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'medium',
    question: 'What are fixtures in Playwright, and which custom fixtures have you built yourself?',
    answer: `A **fixture** is a named piece of setup/teardown that a test asks for in its parameters (\`page\`, \`context\`, \`request\`, \`browser\` are built-in). Playwright creates only the fixtures a test uses, runs the code before \`use()\` as setup and the code after it as teardown, and isolates them per test (or per worker with \`{ scope: 'worker' }\`).

Typical custom fixtures worth naming: page objects, an API client, a logged-in page, and seeded test data that is cleaned up afterwards.

    import { test as base, expect } from '@playwright/test';
    import { LoginPage } from './pages/LoginPage';

    type Fixtures = { loginPage: LoginPage; newUser: { id: string; email: string } };

    export const test = base.extend<Fixtures>({
      loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
      },
      newUser: async ({ request }, use) => {
        const res = await request.post('/api/users', { data: { email: 'qa+' + Date.now() + '@test.dev' } });
        expect(res.ok()).toBeTruthy();
        const user = await res.json();
        await use(user);
        await request.delete('/api/users/' + user.id); // teardown
      },
    });

Why fixtures beat \`beforeEach\`: they are lazy, composable (one fixture can depend on another), typed, and keep teardown next to setup.`,
    followUps: [
      {
        q: 'When would you use a worker-scoped fixture?',
        a: 'For expensive things shared by all tests in a worker, such as one authenticated account per worker or a database connection; declare it with { scope: "worker" }.',
      },
      {
        q: 'What is an automatic fixture?',
        a: 'A fixture declared with { auto: true } runs for every test even if no test asks for it, which is handy for global logging or attaching artifacts on failure.',
      },
    ],
    topic: 'pw-hooks-fixtures',
    source: KPMG,
  },
  {
    id: 'co-playwright-kpmg-3',
    company: 'KPMG',
    area: 'playwright',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'medium',
    question: 'How do you run Playwright tests in parallel, and how do you keep parallel runs from interfering with each other?',
    answer: `Playwright Test runs **test files in parallel across worker processes** by default; tests inside one file run in order unless you opt in.

- \`workers\` in \`playwright.config.ts\` (or \`--workers=4\`) controls how many processes run; \`fullyParallel: true\` also parallelises tests within a file.
- \`test.describe.configure({ mode: 'parallel' })\` or \`'serial'\` sets it per file/describe.
- Across machines, use sharding: \`npx playwright test --shard=1/4\` and merge blob reports.

    // playwright.config.ts
    import { defineConfig } from '@playwright/test';
    export default defineConfig({
      fullyParallel: true,
      workers: process.env.CI ? 4 : undefined,
      retries: process.env.CI ? 2 : 0,
    });

Isolation is what makes parallel safe: every test gets a fresh \`BrowserContext\` (own cookies and storage). The remaining risk is **shared data** — two workers editing the same user or cart. Fix it with unique data per test (timestamps or \`testInfo.workerIndex\` in names), per-worker accounts, and API-created data that each test cleans up. Keep order-dependent flows in a single \`serial\` describe instead of relying on file order.`,
    followUps: [
      {
        q: 'How do you give each worker its own logged-in user?',
        a: 'Create a worker-scoped fixture that logs in account N (chosen by testInfo.parallelIndex) once, saves storageState to a file, and reuses it for every test in that worker.',
      },
    ],
    topic: 'pw-auth-config',
    source: KPMG,
  },
  {
    id: 'co-playwright-kpmg-4',
    company: 'KPMG',
    area: 'playwright',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'medium',
    question: 'Explain the architecture of Playwright: how does a test script actually drive the browser?',
    answer: `Three layers:

1. **Your test (client)** — Node/TS (or Python, Java, .NET) code calling the Playwright API.
2. **Playwright server/driver** — the client sends commands to it over a single persistent **WebSocket** connection (in Node it is in-process but uses the same protocol).
3. **Browsers** — Playwright talks to Chromium via the Chrome DevTools Protocol and to its patched Firefox and WebKit builds via their own protocols. It downloads exact browser versions it is tested against.

Inside a browser it uses **BrowserContexts**: lightweight, incognito-like profiles. Each test gets a new context, so isolation is cheap compared with launching a new browser. A context holds pages (tabs), cookies, storage, permissions and routes.

Contrast with Selenium: WebDriver sends separate HTTP requests per command through a driver binary (chromedriver, geckodriver). Playwright's long-lived connection plus event awareness (network, DOM) is what enables auto-waiting, request interception and tracing.

On top sits **Playwright Test**: the runner with workers, fixtures, projects, retries, reporters and the trace viewer.`,
    followUps: [
      {
        q: 'Browser vs BrowserContext vs Page?',
        a: 'Browser is the launched process; a context is an isolated session inside it (own cookies/storage); a page is one tab inside a context. Tests normally get a new context and page each.',
      },
    ],
    topic: 'pw-setup',
    source: KPMG,
  },
  {
    id: 'co-playwright-kpmg-5',
    company: 'KPMG',
    area: 'playwright',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'easy',
    question: 'In what order do Playwright tests, hooks and fixtures execute?',
    answer: `For one worker:

1. Global setup (\`globalSetup\` or a setup **project** that others depend on) runs once before everything.
2. Worker-scoped fixtures are set up when the worker first needs them.
3. \`beforeAll\` hooks of a describe run once per worker for that group.
4. For **each test**: test-scoped fixtures it uses are set up → \`beforeEach\` (outer describe first, then inner) → the test body → \`afterEach\` (inner first, then outer) → fixture teardown in reverse order.
5. \`afterAll\` after the last test in the group in that worker; then worker fixtures tear down; finally global teardown.

Between files the order is **not guaranteed** once you run in parallel: files are distributed across workers. Inside a file tests run top-to-bottom unless \`fullyParallel\` or \`mode: 'parallel'\` is set. If a test fails, the worker is discarded and a new one starts, so \`beforeAll\` can run more than once — never rely on it for one-time global state.

    test.describe('cart', () => {
      test.beforeAll(async () => { /* once per worker */ });
      test.beforeEach(async ({ page }) => { await page.goto('/'); });
      test('adds item', async ({ page }) => { /* ... */ });
      test.afterEach(async ({}, testInfo) => { console.log(testInfo.status); });
    });`,
    followUps: [
      {
        q: 'Why can beforeAll run twice in one run?',
        a: 'After a failure Playwright throws the worker away and starts a fresh one for the remaining tests, and that new worker runs beforeAll again.',
      },
    ],
    topic: 'pw-hooks-fixtures',
    source: KPMG,
  },
  {
    id: 'co-playwright-kpmg-6',
    company: 'KPMG',
    area: 'playwright',
    role: 'SDET / QA Automation (Playwright)',
    round: 'L1',
    difficulty: 'medium',
    question: 'What is playwright.config.ts, and which settings have you actually used in it?',
    answer: `It is the single place that tells the runner **where tests are, how to run them and in which environments**. Settings worth naming from real projects:

- \`testDir\`, \`timeout\`, \`expect.timeout\`
- \`fullyParallel\`, \`workers\`, \`retries\` (often CI-only), \`forbidOnly\` in CI
- \`reporter\`: \`[['html'], ['list'], ['junit', { outputFile: 'results.xml' }]]\`
- \`use\`: \`baseURL\`, \`trace: 'on-first-retry'\`, \`screenshot: 'only-on-failure'\`, \`video: 'retain-on-failure'\`, \`storageState\`, \`viewport\`, \`locale\`, \`extraHTTPHeaders\`
- \`projects\`: a \`setup\` project for login plus chromium/firefox/webkit/mobile projects with \`dependencies: ['setup']\`
- \`webServer\` to start the app before tests

    import { defineConfig, devices } from '@playwright/test';
    export default defineConfig({
      testDir: './tests',
      retries: process.env.CI ? 2 : 0,
      reporter: [['html'], ['junit', { outputFile: 'results.xml' }]],
      use: { baseURL: process.env.BASE_URL, trace: 'on-first-retry' },
      projects: [
        { name: 'setup', testMatch: /auth\\.setup\\.ts/ },
        { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' }, dependencies: ['setup'] },
      ],
    });

Environment switching is usually done with \`process.env\` (dotenv) feeding \`baseURL\`.`,
    followUps: [
      {
        q: 'How do you run only one project or override a setting from the CLI?',
        a: 'npx playwright test --project=chromium; many options also have CLI flags such as --workers, --retries, --headed, --grep and --shard.',
      },
    ],
    topic: 'pw-auth-config',
    source: KPMG,
  },

  // ---------------- GoHighLevel ----------------
  {
    id: 'co-playwright-gohighlevel-1',
    company: 'GoHighLevel',
    area: 'playwright',
    role: 'Lead SDET',
    round: 'Managerial round (QA Director + Senior Manager)',
    difficulty: 'hard',
    question:
      'In TestNG you hook into results with listeners. What would you use in Playwright to get the same behaviour?',
    answer: `Playwright has no listener classes, but every listener use case has a native equivalent:

- **onTestStart / onTestSuccess / onTestFailure** → a **custom reporter** implementing \`Reporter\` (\`onBegin\`, \`onTestBegin\`, \`onTestEnd\`, \`onEnd\`), registered in \`reporter\` in the config. Good for pushing results to Slack, a dashboard or a test-management tool.
- **Per-test before/after logic** (screenshot on failure, extra logs) → \`test.afterEach\` with \`testInfo.status\`, or an **auto fixture**.
- **Retry analyzer** → the built-in \`retries\` setting; flaky tests are reported separately.
- **Suite-level setup** → \`globalSetup\` or a setup project.

    // reporters/slack-reporter.ts
    import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
    export default class SlackReporter implements Reporter {
      private failed: string[] = [];
      onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === 'failed') this.failed.push(test.titlePath().join(' > '));
      }
      async onEnd() {
        if (this.failed.length) console.log('Notify:', this.failed);
      }
    }
    // playwright.config.ts → reporter: [['html'], ['./reporters/slack-reporter.ts']]

Attach artifacts from tests with \`testInfo.attach()\` so they appear in the HTML report.`,
    followUps: [
      {
        q: 'Where do you put "take a screenshot on failure" logic?',
        a: 'Usually nowhere: set screenshot: "only-on-failure" in use. For custom artifacts, use an auto fixture or afterEach that checks testInfo.status !== testInfo.expectedStatus and calls testInfo.attach().',
      },
    ],
    topic: 'pw-debug-flaky',
    source: GHL,
  },
  {
    id: 'co-playwright-gohighlevel-2',
    company: 'GoHighLevel',
    area: 'playwright',
    role: 'Lead SDET',
    round: 'Technical round 3',
    difficulty: 'hard',
    question: 'Walk us through the architecture of a Playwright framework you would build for a large product.',
    answer: `A layered structure that keeps tests short and pushes detail down:

- **tests/** — specs grouped by feature, readable as user stories; no raw selectors.
- **pages/ or components/** — page objects / component objects wrapping locators (\`getByRole\`, \`getByTestId\`) and user actions; assertions stay in tests or in clearly named \`expect...\` helpers.
- **fixtures/** — \`test.extend\` providing page objects, API clients, authenticated contexts and seeded data with teardown.
- **api/** — thin clients over the \`request\` fixture for data setup and backend checks.
- **data/** — builders/factories, not huge static JSON; unique data per test.
- **config** — \`playwright.config.ts\` with projects (setup → browsers), env-driven \`baseURL\`, retries and reporters; secrets from env vars.
- **auth** — a setup project saves \`storageState\` per role; tests start logged in.
- **reporting & CI** — HTML + JUnit, traces on retry, sharding in the pipeline, artifacts uploaded.

    // tests/checkout.spec.ts
    import { test, expect } from '../fixtures';
    test('user can buy an item', async ({ cartPage, seededProduct }) => {
      await cartPage.add(seededProduct.name);
      await cartPage.checkout();
      await expect(cartPage.confirmation).toHaveText(/order placed/i);
    });

Scalability points to mention: test independence, tags (\`@smoke\`) with \`--grep\`, lint rules (no \`waitForTimeout\`, no \`.only\`), and ownership of flaky-test triage.`,
    followUps: [
      {
        q: 'Page objects or fixtures — which do you prefer?',
        a: 'Both: page objects model the UI; fixtures create and inject them (plus data and auth) so tests never construct objects or do setup themselves.',
      },
    ],
    topic: 'pw-pom-data',
    source: GHL,
  },
  {
    id: 'co-playwright-gohighlevel-3',
    company: 'GoHighLevel',
    area: 'playwright',
    role: 'Lead SDET',
    round: 'Technical round 1 (live automation exercise)',
    difficulty: 'medium',
    question:
      'Live task: create the test data through the API, then verify that data in the UI and continue with further UI actions.',
    answer: `Use the \`request\` fixture (shares \`baseURL\` and can share auth) for setup, then the \`page\` for verification. API setup is faster and more reliable than clicking through forms, and it lets the UI test focus on what it is actually checking.

    import { test, expect } from '@playwright/test';

    test('contact created via API shows in the list', async ({ request, page }) => {
      const name = 'Auto Contact ' + Date.now();
      const res = await request.post('/api/contacts', { data: { name, email: 'auto@test.dev' } });
      expect(res.status()).toBe(201);
      const { id } = await res.json();

      await page.goto('/contacts');
      const row = page.getByRole('row', { name: new RegExp(name) });
      await expect(row).toBeVisible();
      await row.getByRole('button', { name: 'Edit' }).click();
      await expect(page.getByLabel('Name')).toHaveValue(name);

      await request.delete('/api/contacts/' + id); // clean up
    });

Points interviewers like: unique data per run, asserting the API response before using it, web-first assertions in the UI (no sleeps), and cleanup — ideally moved into a fixture so it runs even when the test fails.`,
    followUps: [
      {
        q: 'How do you make the API call authenticated with the same user as the browser?',
        a: 'Reuse the storageState file: create the request context with storageState, or use page.request, which shares cookies with the browser context.',
      },
    ],
    topic: 'pw-api-network',
    source: GHL,
  },

  // ---------------- Zepto ----------------
  {
    id: 'co-playwright-zepto-1',
    company: 'Zepto',
    area: 'playwright',
    role: 'SDET-2',
    round: 'Technical round 2 (internal)',
    difficulty: 'easy',
    question: 'What is Playwright, why would you choose it, and what is the WebSocket protocol it relies on?',
    answer: `**Playwright** is Microsoft's open-source browser automation library plus a test runner (\`@playwright/test\`). One API drives Chromium, Firefox and WebKit, in TS/JS, Python, Java and .NET.

**Why choose it:** auto-waiting and web-first assertions (fewer flaky waits), isolated browser contexts per test, built-in parallelism and sharding, network interception (\`page.route\`), API testing (\`request\` fixture), multi-tab/iframe/multi-user support, trace viewer, codegen and UI mode, and no separate driver binaries to manage.

**WebSocket** is a protocol that upgrades one HTTP connection into a long-lived, full-duplex channel: both sides can send messages at any time without a new request. Playwright keeps one such connection between client and browser/driver, so commands and browser events (navigation, requests, console logs) flow both ways instantly. That event stream is what allows auto-waiting and network interception; Selenium's classic WebDriver uses a request/response HTTP call per command.

You can also test an app's own WebSockets:

    page.on('websocket', (ws) => {
      ws.on('framereceived', (f) => console.log('received', f.payload));
    });`,
    followUps: [
      {
        q: 'Can Playwright mock a WebSocket server?',
        a: 'Yes, recent versions provide page.routeWebSocket(url, handler) to intercept or fully mock WebSocket traffic, similar to page.route for HTTP.',
      },
    ],
    topic: 'pw-setup',
    source: ZEPTO,
  },

  // ---------------- Equall ----------------
  {
    id: 'co-playwright-equall-1',
    company: 'Equall',
    area: 'playwright',
    role: 'SDET 3 (Founding QA)',
    round: 'Take-home assignment',
    difficulty: 'medium',
    question:
      'Your framework for a food-delivery app must support location mocking. How do you fake the user\'s location in Playwright?',
    answer: `Grant the geolocation permission and set coordinates on the **browser context**, either in config or per test. The page's \`navigator.geolocation\` then returns your values.

    // playwright.config.ts (default for all tests)
    use: { geolocation: { latitude: 12.9716, longitude: 77.5946 }, permissions: ['geolocation'] }

    // per test, including a mid-test move
    import { test, expect } from '@playwright/test';
    test.use({ geolocation: { latitude: 28.6139, longitude: 77.209 }, permissions: ['geolocation'] });

    test('restaurants update when the user moves', async ({ page, context }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Detect my location' }).click();
      await expect(page.getByTestId('delivery-city')).toHaveText(/Delhi/);

      await context.setGeolocation({ latitude: 19.076, longitude: 72.8777 });
      await page.getByRole('button', { name: 'Detect my location' }).click();
      await expect(page.getByTestId('delivery-city')).toHaveText(/Mumbai/);
    });

Also test the negative path: run without the permission (or \`context.clearPermissions()\`) and assert the manual address fallback. If the app resolves an address through a geocoding API, mock that call with \`page.route\` so results do not depend on a third party.`,
    followUps: [
      {
        q: 'How would you also fake the timezone and locale for that city?',
        a: 'Set timezoneId (e.g. "Asia/Kolkata") and locale (e.g. "en-IN") in use or test.use; they are context options like geolocation.',
      },
    ],
    topic: 'pw-auth-config',
    source: EQUALL,
  },
  {
    id: 'co-playwright-equall-2',
    company: 'Equall',
    area: 'playwright',
    role: 'SDET 3 (Founding QA)',
    round: 'Take-home assignment',
    difficulty: 'medium',
    question: 'The same assignment required network/API mocking in the framework. How do you mock API responses in Playwright?',
    answer: `Use \`page.route\` (or \`context.route\` for all pages) to intercept matching requests and decide what happens: \`fulfill\` with fake data, \`continue\` with changes, or \`abort\` to simulate a failure.

    import { test, expect } from '@playwright/test';

    test('shows empty state when no restaurants', async ({ page }) => {
      await page.route('**/api/restaurants*', (route) =>
        route.fulfill({ status: 200, json: { items: [] } }),
      );
      await page.goto('/');
      await expect(page.getByText('No restaurants deliver here')).toBeVisible();
    });

    test('modifies a real response', async ({ page }) => {
      await page.route('**/api/menu', async (route) => {
        const res = await route.fetch();
        const body = await res.json();
        body.items[0].price = 0;
        await route.fulfill({ response: res, json: body });
      });
      await page.goto('/menu');
    });

    test('handles server error', async ({ page }) => {
      await page.route('**/api/cart', (r) => r.fulfill({ status: 500 }));
      // assert the error banner
    });

Framework tips: wrap common mocks in fixtures, keep mock payloads as typed builders, consider \`page.routeFromHAR\` for recorded responses, and keep a few un-mocked end-to-end tests so mocks do not hide integration bugs.`,
    followUps: [
      {
        q: 'How do you assert that the app actually sent the right request?',
        a: 'Use page.waitForRequest / waitForResponse with a predicate, or capture route.request().postDataJSON() inside the handler and assert on it.',
      },
    ],
    topic: 'pw-api-network',
    source: EQUALL,
  },
  {
    id: 'co-playwright-equall-3',
    company: 'Equall',
    area: 'playwright',
    role: 'SDET 3 (Founding QA)',
    round: 'Take-home assignment',
    difficulty: 'medium',
    question: 'The assignment also asked for custom reporting. How would you add custom reporting to a Playwright framework?',
    answer: `Start with what is built in, then extend:

1. **Built-in reporters**: \`html\` (with traces, screenshots, videos), \`list\`/\`line\`/\`dot\` for the console, \`junit\` and \`json\` for CI tools, \`blob\` for merging sharded runs. Several can run at once.
2. **Enrich the report from tests**: \`test.step()\` for readable steps, \`testInfo.attach()\` for files/JSON, \`test.info().annotations\` for links to tickets, and tags (\`{ tag: '@smoke' }\`) for filtering.
3. **Custom reporter**: a class implementing \`Reporter\` that builds your own summary (Slack message, Markdown, dashboard upload).

    import type { Reporter, FullResult, TestCase, TestResult } from '@playwright/test/reporter';
    class SummaryReporter implements Reporter {
      private counts = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
      onTestEnd(test: TestCase, result: TestResult) {
        const outcome = test.outcome();
        if (outcome === 'expected') this.counts.passed++;
        else if (outcome === 'flaky') this.counts.flaky++;
        else if (outcome === 'skipped') this.counts.skipped++;
        else this.counts.failed++;
      }
      onEnd(result: FullResult) {
        console.log('Run ' + result.status, this.counts);
      }
    }
    export default SummaryReporter;

Register it in the config: \`reporter: [['html', { open: 'never' }], ['./reporters/summary.ts']]\`. Allure (\`allure-playwright\`) is a common third-party option when stakeholders want history and trends.`,
    followUps: [
      {
        q: 'How do you get one report from four CI shards?',
        a: 'Run each shard with the blob reporter, upload the blob-report folders as artifacts, then run npx playwright merge-reports --reporter html ./all-blob-reports in a final job.',
      },
    ],
    topic: 'pw-debug-flaky',
    source: EQUALL,
  },

  // ---------------- Focus Edumatics ----------------
  {
    id: 'co-playwright-focus-edumatics-1',
    company: 'Focus Edumatics',
    area: 'playwright',
    role: 'QA Engineering',
    round: 'Technical / HR interview (round 2)',
    difficulty: 'easy',
    question: 'Write the basic template of a Playwright test.',
    answer: `Show the minimal pieces: import \`test\`/\`expect\`, a \`describe\` (optional), a hook, a test that receives the \`page\` fixture, an action and a web-first assertion.

    import { test, expect } from '@playwright/test';

    test.describe('login', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('https://www.saucedemo.com/');
      });

      test('valid user reaches the inventory page', async ({ page }) => {
        await page.getByPlaceholder('Username').fill('standard_user');
        await page.getByPlaceholder('Password').fill('secret_sauce');
        await page.getByRole('button', { name: 'Login' }).click();

        await expect(page).toHaveURL(/inventory/);
        await expect(page.getByText('Products')).toBeVisible();
      });
    });

Then mention how it runs: \`npm init playwright@latest\` scaffolds \`playwright.config.ts\` and \`tests/\`; \`npx playwright test\` runs headless across configured projects, \`--headed\`/\`--ui\` for watching, \`npx playwright show-report\` for the HTML report. (The interview used Python — the Python template is the same idea with \`pytest-playwright\`: \`def test_login(page: Page): ... expect(page).to_have_url(...)\`.)`,
    followUps: [
      {
        q: 'Why does the test receive page instead of launching a browser itself?',
        a: 'page is a built-in fixture: the runner launches the browser, creates a fresh isolated context and page for the test, and closes them afterwards.',
      },
    ],
    topic: 'pw-setup',
    source: FOCUS,
  },
  {
    id: 'co-playwright-focus-edumatics-2',
    company: 'Focus Edumatics',
    area: 'playwright',
    role: 'QA Engineering',
    round: 'Technical / HR interview (round 2)',
    difficulty: 'easy',
    question: 'How do you locate an image with Playwright?',
    answer: `Prefer user-facing locators. An \`<img>\` with \`alt\` text has the accessible role **img** and its alt as the name, so both of these work:

    await expect(page.getByRole('img', { name: 'Company logo' })).toBeVisible();
    await expect(page.getByAltText('Company logo')).toBeVisible();

Other options, in order of preference:

    page.getByTestId('hero-image');                 // stable test id
    page.locator('img[src*="logo"]');               // CSS on src when nothing better exists
    page.getByRole('link', { name: 'Home' }).getByRole('img'); // scoped inside a parent

Useful checks once you have it:

    const img = page.getByAltText('Company logo');
    await expect(img).toHaveAttribute('src', /logo\\.svg/);
    // image actually loaded (not broken):
    const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
    expect(loaded).toBe(true);

A missing \`alt\` is also an accessibility bug worth reporting. For pixel comparison, use \`await expect(img).toHaveScreenshot()\`.`,
    followUps: [
      {
        q: 'How would you find all broken images on a page?',
        a: 'Collect all img locators, evaluate naturalWidth for each (or listen to page "response" events for image requests with status >= 400) and fail listing the broken src values.',
      },
    ],
    topic: 'pw-locators',
    source: FOCUS,
  },
];
