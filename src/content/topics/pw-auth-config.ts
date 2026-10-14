import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-auth-config',
  phase: 'pw-framework',
  order: 3,
  title: 'Configuration & Authentication',
  subtitle:
    'Read and write a production-grade playwright.config.ts (use, projects, timeouts, retries, workers, reporters, webServer), drive it from environment variables, and log in once with storageState, setup projects, multiple roles and API login.',
  estimatedMinutes: 95,
  sources: [
    'Playwright docs — Test configuration (playwright.dev/docs/test-configuration)',
    'Playwright docs — TestConfig API reference (playwright.dev/docs/api/class-testconfig)',
    'Playwright docs — Test use options (playwright.dev/docs/test-use-options)',
    'Playwright docs — Projects (playwright.dev/docs/test-projects)',
    'Playwright docs — Global setup and teardown (playwright.dev/docs/test-global-setup-teardown)',
    'Playwright docs — Authentication (playwright.dev/docs/auth)',
    'Playwright docs — BrowserContext.storageState (indexedDB option)',
    'Playwright docs — Parameterize tests: env variables and .env files (playwright.dev/docs/test-parameterize)',
    'Checkly Learn — Playwright authentication / reusing storageState (checklyhq.com/learn/playwright/authentication)',
    'BrowserStack guide — Using Playwright storageState',
    'SauceDemo, the-internet.herokuapp.com (basic auth), Restful Booker public demo sites',
  ],
  tags: ['playwright', 'config', 'projects', 'timeouts', 'retries', 'webServer', 'dotenv', 'storageState', 'authentication', 'setup-project', 'globalSetup'],
  cheatSheet: [
    'Config layers: top-level = runner options (testDir, timeout, retries, workers, reporter, projects, webServer); use = browser/context options (baseURL, trace, storageState). Precedence: test.use > project use > top-level use.',
    'Defaults: test timeout 30 s, expect 5 s, actionTimeout/navigationTimeout 0 (no limit, bounded by test timeout), retries 0, workers = half the CPU cores, globalTimeout 0, webServer timeout 60 s, outputDir test-results.',
    'CI pattern: forbidOnly: !!process.env.CI, retries: process.env.CI ? 2 : 0, trace: "on-first-retry", reporter html (+ junit for CI dashboards).',
    'webServer: { command, url, reuseExistingServer: !process.env.CI } starts your app before tests and stops it after.',
    'Projects = named variants (browsers, devices, environments, smoke vs full); run one with --project=name; dependencies run first, a failed dependency skips dependents.',
    'Env vars: dotenv.config({ path: path.resolve(__dirname, ".env") }) in the config; select env with TEST_ENV; secrets only in .env (gitignored) or CI secrets.',
    'storageState = cookies + localStorage (+ IndexedDB with { indexedDB: true }) saved to JSON; sessionStorage is NOT included.',
    'Recommended auth: tests/auth.setup.ts logs in and calls page.context().storageState({ path }); a "setup" project + dependencies: ["setup"] + use: { storageState: "playwright/.auth/user.json" }.',
    'Gitignore playwright/.auth: it holds live session cookies. Logged-out tests: test.use({ storageState: { cookies: [], origins: [] } }).',
    'Multiple roles: one setup per role (admin.json, user.json) + test.use({ storageState }) per file/describe; two roles in one test → browser.newContext({ storageState }) each.',
    'Tests that change server state of the account → one account per worker (worker fixture keyed by parallelIndex).',
    'Project dependencies > globalSetup: shows in report, traces, fixtures, config options apply. API login: request.post + request.storageState({ path }). Basic auth: use.httpCredentials.',
  ],
  sections: [
    {
      heading: 'playwright.config.ts anatomy: runner options, use and projects',
      body: `**Intuition:** the config is a recipe card with three parts: how the kitchen runs (runner options), how every dish is prepared (\`use\`), and variations of the menu (\`projects\`).

| Layer | Examples | Controls |
|---|---|---|
| **Top-level runner options** | \`testDir\`, \`testMatch\`, \`timeout\`, \`expect\`, \`retries\`, \`workers\`, \`fullyParallel\`, \`forbidOnly\`, \`reporter\`, \`outputDir\`, \`webServer\`, \`globalTimeout\`, \`maxFailures\` | how the test runner finds, schedules and reports tests |
| **\`use\`** | \`baseURL\`, \`storageState\`, \`trace\`, \`screenshot\`, \`video\`, \`headless\`, \`viewport\`, \`locale\`, \`actionTimeout\`, \`testIdAttribute\`, \`httpCredentials\`, \`extraHTTPHeaders\` | how each browser, context and page is created |
| **\`projects\`** | \`name\`, \`use: { ...devices['Desktop Chrome'] }\`, \`dependencies\`, \`testMatch\`, \`retries\`, \`grep\` | named variants of the run |

**Precedence (most specific wins):** \`test.use()\` in a file or describe → project \`use\` → top-level \`use\`. Projects can also override some runner options such as \`retries\`, \`timeout\` and \`testDir\`.

**Common mistake:** putting \`baseURL\` at the top level instead of inside \`use\`. TypeScript flags it with \`defineConfig\`, but in a plain JavaScript config it is silently ignored and \`page.goto('/')\` fails. Always wrap the config in \`defineConfig()\` to get type checking and autocompletion.

**In interviews, say this:** "Runner options decide which tests run and how; \`use\` decides what the browser looks like for each test; projects let me run the same tests under different \`use\` settings."`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts: a realistic SauceDemo setup',
          code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // fail CI if a test.only slipped in
  retries: process.env.CI ? 2 : 0,       // retry only on CI
  workers: process.env.CI ? 2 : undefined, // undefined = default (half the CPU cores)
  reporter: process.env.CI ? [['html', { open: 'never' }], ['junit', { outputFile: 'results.xml' }]] : 'html',

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',        // SauceDemo uses data-test="..."
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});`,
        },
      ],
      keyPoints: [
        'Top-level = runner; use = browser/context; projects = variants.',
        'Precedence: test.use > project use > top-level use.',
        'Wrap in defineConfig() so misplaced options are type errors.',
      ],
      source: 'Playwright docs — Test configuration; Test use options',
    },
    {
      heading: 'Timeouts, retries and workers',
      body: `**Intuition:** timeouts are kitchen timers at different levels: one for a single action, one for an assertion, one for the whole test, one for the entire run.

| Setting | Where | Default | What it limits |
|---|---|---|---|
| \`timeout\` | top-level / project / \`test.setTimeout()\` | **30 000 ms** | one test incl. its beforeEach and test-scoped fixtures |
| \`expect.timeout\` | \`expect: { timeout }\` | **5 000 ms** | each web-first assertion's retrying |
| \`actionTimeout\` | \`use\` | **0** (no own limit) | each click/fill etc.; still bounded by the test timeout |
| \`navigationTimeout\` | \`use\` | **0** (no own limit) | \`page.goto\`, \`waitForURL\` ... |
| \`globalTimeout\` | top-level | **0** (off) | the whole run; useful on CI to stop runaway jobs |
| \`webServer.timeout\` | \`webServer\` | **60 000 ms** | waiting for your app to start |
| \`retries\` | top-level / project / describe.configure | **0** | extra attempts for a failed test |
| \`workers\` | top-level / \`--workers\` | **half the logical CPU cores** | parallel worker processes (number or '50%') |
| \`maxFailures\` | top-level / \`--max-failures\` | **0** (off) | stop after N failures |

Practical guidance:
- Do not raise the global test timeout to hide slowness. Use \`test.slow()\` (×3) or \`test.setTimeout()\` on the few slow tests.
- Set \`actionTimeout\`/\`navigationTimeout\` (e.g. 10 s / 15 s) if you want a hung click to fail with a precise message instead of a generic 30 s test timeout.
- \`retries: process.env.CI ? 2 : 0\` is the common pattern: retries hide flakiness locally, but on CI they keep pipelines moving while traces (\`on-first-retry\`) capture evidence.
- Fewer workers on CI (\`2\` or \`'50%'\`) is common because CI machines have few cores; sharding across machines is covered in the CI topic.`,
      keyPoints: [
        'Test 30 s, expect 5 s, action/navigation unlimited (bounded by test).',
        'Retries default 0; typical CI value 2 with trace on-first-retry.',
        'Workers default to half the CPU cores; tune down on small CI runners.',
      ],
      source: 'Playwright docs — TestConfig API reference; Test use options; Test configuration',
    },
    {
      heading: 'Reporters, outputDir and artifacts',
      body: `**Intuition:** reporters are how the run talks to people (terminal, HTML page) and machines (JUnit XML for CI dashboards); \`outputDir\` is the evidence locker for screenshots, videos and traces.

- **Default reporter:** \`list\` locally and \`dot\` when the \`CI\` env var is set. Projects created with \`npm init playwright\` set \`reporter: 'html'\`.
- **Several reporters at once:** \`reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'results.xml' }]]\`.
- **\`outputDir\`** (default \`test-results\`) holds per-test artifacts; it is cleaned at the start of each run. The HTML report goes to \`playwright-report/\`.
- **Artifacts** are configured in \`use\`: \`trace\`, \`video\` (\`'off' | 'on' | 'retain-on-failure' | 'on-first-retry' | ...\`) and \`screenshot\` (\`'off' | 'on' | 'only-on-failure'\`). All are off by default.

A good default for a framework: \`trace: 'on-first-retry'\`, \`screenshot: 'only-on-failure'\`, \`video: 'retain-on-failure'\` on CI. Debugging with these artifacts (trace viewer, flaky triage) is covered in the debugging topic; here the point is knowing **where** they are switched on.`,
      code: [
        {
          language: 'typescript',
          title: 'Reporter and artifact settings',
          code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  outputDir: 'test-results',             // traces, screenshots, videos per test
  reporter: [
    ['list'],                            // readable terminal output
    ['html', { open: 'never' }],         // playwright-report/index.html
    ['junit', { outputFile: 'results/junit.xml' }], // for Jenkins/Azure/GitLab
  ],
  use: {
    trace: 'on-first-retry',             // full trace only when a retry happens
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },
});`,
        },
      ],
      keyPoints: [
        'Default reporter: list locally, dot on CI; html is set by npm init.',
        'outputDir = test-results (cleaned each run); HTML report in playwright-report/.',
        'trace/video/screenshot are use options, off by default.',
      ],
      source: 'Playwright docs — TestConfig API reference (reporter, outputDir); Test use options (recording)',
    },
    {
      heading: 'webServer: start the app before the tests',
      body: `**Intuition:** before the tasting starts, someone has to switch on the oven. \`webServer\` tells Playwright to start your app, wait until it answers, run the tests, then shut it down.

Key options: \`command\` (required), \`url\` or \`port\` (what to poll until ready), \`reuseExistingServer\` (use an already running dev server instead of starting a new one), \`timeout\` (default 60 s), \`env\`, \`cwd\`, \`stdout\` (default \`'ignore'\`), \`stderr\` (default \`'pipe'\`). You can pass an **array** to start several servers (frontend + mock API).

The standard pattern is \`reuseExistingServer: !process.env.CI\`: locally you keep \`npm run dev\` open and tests reuse it; on CI a fresh server is always started, so you never test a stale build.

SauceDemo is a public site, so a SauceDemo suite needs no webServer; it matters when you test your own app in the same repository.`,
      code: [
        {
          language: 'typescript',
          title: 'webServer for a local app',
          code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run start',              // how to start the app
    url: 'http://localhost:3000/health',   // polled until it responds
    reuseExistingServer: !process.env.CI,  // local: reuse your running dev server
    timeout: 120_000,                      // slow first build (default 60 s)
    stdout: 'pipe',                        // show server logs while debugging
  },
  use: { baseURL: 'http://localhost:3000' },
});`,
        },
      ],
      keyPoints: [
        'command + url/port; Playwright waits for the URL, then runs tests.',
        'reuseExistingServer: !process.env.CI is the standard pattern.',
        'Default webServer timeout is 60 s.',
      ],
      source: 'Playwright docs — Test configuration (webServer); TestConfig API reference',
    },
    {
      heading: 'Projects: browsers, devices, environments and smoke runs',
      body: `**Intuition:** a project is a saved "run profile". Same tests, different settings.

Typical uses:
- **Browsers and devices:** \`chromium\`, \`firefox\`, \`webkit\`, \`Mobile Chrome\` (\`devices['Pixel 5']\`), branded Chrome via \`channel: 'chrome'\`.
- **Environments:** a \`staging\` project with its own \`baseURL\` and \`retries: 2\`, a \`production\` smoke project with \`retries: 0\`.
- **Subsets:** a \`smoke\` project with \`grep: /@smoke/\` or \`testMatch\`, a \`regression\` project with \`testIgnore\`.
- **Setup/teardown:** a \`setup\` project that other projects list in \`dependencies\`, optionally with \`teardown: 'cleanup'\`.

Rules:
- \`npx playwright test\` runs **all** projects; \`--project=chromium\` runs one (repeatable).
- Dependencies always run first, even with filters; \`--no-deps\` skips them.
- If a dependency **fails**, dependent projects are **skipped**.
- Independent projects run in parallel with each other.
- Tests count per project: 50 tests × 3 browser projects = 150 test runs.`,
      code: [
        {
          language: 'typescript',
          title: 'Projects for browsers, mobile and smoke',
          code: `import { defineConfig, devices } from '@playwright/test';

const auth = { storageState: 'playwright/.auth/user.json' };

export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },

    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...auth }, dependencies: ['setup'] },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'], ...auth }, dependencies: ['setup'] },
    { name: 'mobile',   use: { ...devices['Pixel 5'], ...auth }, dependencies: ['setup'] },

    // quick PR gate: only @smoke tests, chromium, no retries
    {
      name: 'smoke',
      grep: /@smoke/,
      retries: 0,
      use: { ...devices['Desktop Chrome'], ...auth },
      dependencies: ['setup'],
    },
  ],
});
// npx playwright test --project=smoke`,
        },
      ],
      keyPoints: [
        'Projects = same tests, different use/runner settings.',
        'Dependencies run first; a failed dependency skips dependents.',
        'Test runs multiply by the number of projects.',
      ],
      source: 'Playwright docs — Projects',
    },
    {
      heading: 'Environment variables, .env files and multiple environments',
      body: `**Intuition:** the same suite should run against QA, staging or production smoke without editing code, just like the same app binary runs in every environment with different settings.

**Pattern:**
1. Secrets and per-environment values live in **environment variables**: \`BASE_URL\`, \`SAUCE_USER\`, \`SAUCE_PASS\`.
2. Locally, a gitignored **\`.env\`** file (or one per environment: \`.env.qa\`, \`.env.staging\`) is loaded by \`dotenv\` at the top of the config. A committed **\`.env.example\`** lists the keys without values.
3. On CI, the same names come from **pipeline secrets** (GitHub Actions \`secrets.SAUCE_PASS\` mapped to \`env:\`), so no file is needed.
4. One switch variable, e.g. \`TEST_ENV=staging\`, selects which file to load and therefore the \`baseURL\`.

Run it: \`TEST_ENV=staging npx playwright test\` (macOS/Linux) or set the variable in the CI job.

**Moving SauceDemo credentials to env vars:** \`standard_user\` / \`secret_sauce\` are public demo credentials, but treat them like real ones: \`.env\` holds \`SAUCE_USER=standard_user\` and \`SAUCE_PASS=secret_sauce\`, the code reads \`process.env.SAUCE_PASS\`, and the repository never contains the literal.

**Common mistakes:** committing \`.env\`; reading \`process.env.X\` without a check (undefined becomes the string "undefined" in a fill); logging secrets in test output.`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts: env-driven settings',
          code: `import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// TEST_ENV=staging → loads .env.staging (falls back to .env.qa)
const ENV = process.env.TEST_ENV ?? 'qa';
dotenv.config({ path: path.resolve(__dirname, \`.env.\${ENV}\`) });

// fail fast with a clear message instead of typing "undefined" into a form
for (const key of ['BASE_URL', 'SAUCE_USER', 'SAUCE_PASS']) {
  if (!process.env[key]) throw new Error(\`Missing env var \${key} for TEST_ENV=\${ENV}\`);
}

export default defineConfig({
  retries: ENV === 'prod' ? 0 : 1,
  use: { baseURL: process.env.BASE_URL },
});`,
        },
        {
          language: 'bash',
          title: '.env.example (committed) vs .env.qa (gitignored)',
          code: `# .env.example — documents the keys, no real values
BASE_URL=
SAUCE_USER=
SAUCE_PASS=

# .env.qa — local only, listed in .gitignore
BASE_URL=https://www.saucedemo.com
SAUCE_USER=standard_user
SAUCE_PASS=secret_sauce`,
        },
      ],
      keyPoints: [
        'Values in env vars; .env locally (gitignored), secrets on CI.',
        'TEST_ENV picks the environment file and baseURL.',
        'Validate required env vars in the config and fail fast.',
      ],
      source: 'Playwright docs — Parameterize tests (environment variables, .env files)',
    },
    {
      heading: 'Logging in: UI login per test vs saved state',
      body: `**Intuition:** typing your password at the front door every time you re-enter the office vs wearing a visitor badge for the day. The badge (saved session) is faster, and the front door still gets tested once.

| Approach | Speed | Isolation | Tests the login UI? | Use for |
|---|---|---|---|---|
| UI login in every test (hook/fixture) | slowest: N logins | full | yes, N times (wasteful) | tiny suites, or the login tests themselves |
| **storageState via setup project** | 1 login per run | each test still gets a fresh context | once, in setup | most suites |
| storageState per worker (worker fixture) | 1 login per worker | per-worker account | once per worker | tests that change account state on the server |
| API login + storageState | fastest | same as above | no (cover the UI login in its own tests) | apps with a login API |

What makes saved state work: most web apps remember a login through **cookies**, **localStorage** or **IndexedDB**. Playwright can snapshot those from a logged-in context into a JSON file and preload them into every new context, so the app sees an already-logged-in browser.

Keep a few **dedicated login tests** (valid, invalid, locked-out) that start logged out. Everything else should start logged in.`,
      keyPoints: [
        'Saved state removes repeated logins without sharing a page.',
        'Every test still gets a fresh context, preloaded with the session.',
        'Keep separate login-UI tests that start logged out.',
      ],
      source: 'Playwright docs — Authentication; Checkly Learn — Playwright authentication',
    },
    {
      heading: 'Reusing authentication with storageState',
      body: `**Intuition:** log in once, take a photo of the browser's "memory" (cookies and storage), and give every test a browser that starts from that photo.

**The recommended recipe (from the official auth guide):**
1. \`mkdir -p playwright/.auth\` and add \`playwright/.auth\` to \`.gitignore\`: the file contains live session cookies.
2. Write \`tests/auth.setup.ts\`: a normal test (imported as \`setup\`) that logs in through the UI, **waits for proof of login** (URL or a logged-in element), then calls \`page.context().storageState({ path })\`.
3. In the config, add a \`setup\` project matching \`*.setup.ts\`, and in every testing project set \`dependencies: ['setup']\` and \`use: { storageState: 'playwright/.auth/user.json' }\`.
4. Tests just \`page.goto('/inventory.html')\`: they are already logged in.

**What storageState contains:** cookies, localStorage per origin, and IndexedDB if you pass \`{ indexedDB: true }\` (needed for e.g. Firebase Auth). **sessionStorage is not saved**; the docs show a workaround with \`page.evaluate\` + \`context.addInitScript\`.

**SauceDemo example:** SauceDemo remembers the user with a \`session-username\` cookie, so the saved JSON contains that cookie and \`/inventory.html\` opens directly. (Without it, SauceDemo redirects to the login page with an error.)

**Opting out:** login tests reset state with \`test.use({ storageState: { cookies: [], origins: [] } })\`.

**Gotchas:**
- Saving too early (before redirects finish setting cookies) captures a half-logged-in state. Always wait for a logged-in signal first.
- Sessions **expire**. Writing the file under the project's \`outputDir\` means it is cleaned every run; otherwise delete stale files. UI mode does not run the setup project by default, so re-run \`auth.setup.ts\` manually when the session expires.`,
      code: [
        {
          language: 'typescript',
          title: 'tests/auth.setup.ts',
          code: `import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as standard user', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(process.env.SAUCE_USER!);
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASS!);
  await page.getByRole('button', { name: 'Login' }).click();

  // wait for PROOF of login before saving, or the state may be incomplete
  await page.waitForURL('**/inventory.html');
  await expect(page.getByTestId('title')).toHaveText('Products');

  await page.context().storageState({ path: authFile });
});`,
        },
        {
          language: 'typescript',
          title: 'tests/cart/cart.spec.ts: already logged in; login tests opt out',
          code: `import { test, expect } from '@playwright/test';

test('cart starts empty', async ({ page }) => {
  await page.goto('/inventory.html'); // no login steps needed
  await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
});

test.describe('login form', () => {
  // start logged out for these tests only
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(process.env.SAUCE_USER!);
    await page.getByPlaceholder('Password').fill('wrong');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByTestId('error')).toContainText('do not match');
  });
});`,
        },
      ],
      diagram: `run start
  [setup project] auth.setup.ts --login once--> playwright/.auth/user.json
        |  (dependency must pass)
        v
  [chromium project]  test A: new context + user.json -> logged in
                      test B: new context + user.json -> logged in
                      test C: new context + user.json -> logged in
  (each test isolated; none of them types the password)`,
      keyPoints: [
        'Setup project logs in once, saves JSON; test projects depend on it and load it.',
        'Wait for proof of login before saving; gitignore playwright/.auth.',
        'Opt out with storageState { cookies: [], origins: [] }.',
      ],
      source: 'Playwright docs — Authentication (basic shared account, setup project)',
    },
    {
      heading: 'Project dependencies vs globalSetup',
      body: `**Intuition:** both are "do this before everything", but a setup project is a first-class test you can see and debug, while globalSetup is a script running backstage.

| | Setup project (dependencies) | \`globalSetup\` file |
|---|---|---|
| What it is | normal tests in a project others depend on | one exported async function \`(config: FullConfig) => {}\` |
| Shows in HTML report | yes, as its own project | no |
| Trace recording | yes, via \`use.trace\` | only if you start tracing manually |
| Fixtures (\`page\`, \`request\`, \`baseURL\`) | yes | no; you launch the browser yourself |
| Config \`use\` options applied (headless, testIdAttribute) | yes | no |
| Teardown | \`teardown: 'cleanup'\` project | \`globalTeardown\` file (or return a function) |
| Recommendation | **preferred by the docs** | still supported; fine for non-browser work |

Things to know:
- Dependencies run even when you filter tests (\`--grep\`, a file path). \`--no-deps\` skips them.
- If the setup project fails, dependent projects are **skipped**, which is what you want when login is broken: one clear failure instead of 300.
- Setup files must use \`test()\` (usually imported as \`setup\`), and should be matched only by the setup project (\`testMatch: /.*\\.setup\\.ts/\`) so they are not run as regular tests.
- \`globalSetup\` can pass data to tests through \`process.env\`; setup projects usually pass data through files (like storageState JSON).`,
      code: [
        {
          language: 'typescript',
          title: 'Setup + teardown projects',
          code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\\.setup\\.ts/,
      teardown: 'cleanup',            // runs after all dependents finish
    },
    {
      name: 'cleanup',
      testMatch: /.*\\.teardown\\.ts/, // e.g. delete qa- bookings via API
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});`,
        },
      ],
      keyPoints: [
        'Setup projects: report, trace, fixtures, config options. globalSetup: none of those.',
        'Failed setup → dependents skipped. --no-deps skips setup.',
        'teardown: "cleanup" project runs after dependents.',
      ],
      source: 'Playwright docs — Global setup and teardown; Projects (dependencies, teardown)',
    },
    {
      heading: 'Multiple roles and one account per worker',
      body: `**Intuition:** an admin badge and a customer badge. Make both once, then each test picks the badge it needs.

**Multiple roles (shared accounts):**
- One setup test per role saves its own file: \`playwright/.auth/admin.json\`, \`playwright/.auth/user.json\`.
- Choose the role per file or describe: \`test.use({ storageState: 'playwright/.auth/admin.json' })\`.
- **Two roles in one test** (admin approves what a user submitted): create a context per role with \`browser.newContext({ storageState })\`, use both pages, close both contexts at the end. You can wrap these in fixtures like \`adminPage\` / \`userPage\`.

**One account per worker:** if tests change server-side state of the account (cart saved on the server, profile settings), sharing one account across parallel workers causes collisions. The docs' pattern:
- Override the \`storageState\` fixture to use a **worker-scoped** fixture.
- In it, use \`test.info().parallelIndex\` to pick a unique account (\`qa_user_0\`, \`qa_user_1\`...).
- Log in once per worker with \`browser.newPage({ storageState: undefined })\`, save to \`<project outputDir>/.auth/<id>.json\`, reuse the file if it already exists.

\`parallelIndex\` is the right key because it stays in the range 0 … workers-1, even when a failed worker is replaced.`,
      code: [
        {
          language: 'typescript',
          title: 'Two roles in one test',
          code: `import { test, expect } from '@playwright/test';

test('admin sees the order the user just placed', async ({ browser }) => {
  const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
  const userContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();

  try {
    await userPage.goto('/orders/new');
    await userPage.getByRole('button', { name: 'Place order' }).click();
    const orderId = await userPage.getByTestId('order-id').innerText();

    await adminPage.goto('/admin/orders');
    await expect(adminPage.getByRole('row', { name: orderId })).toBeVisible();
  } finally {
    await adminContext.close(); // contexts you create yourself, you close yourself
    await userContext.close();
  }
});`,
        },
        {
          language: 'typescript',
          title: 'fixtures/auth.ts: one account per worker (shape of the official pattern)',
          code: `import { test as base } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export const test = base.extend<{}, { workerStorageState: string }>({
  // every test in this worker uses this worker's file
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  workerStorageState: [async ({ browser }, use) => {
    const id = test.info().parallelIndex;
    const file = path.resolve(test.info().project.outputDir, \`.auth/\${id}.json\`);
    if (fs.existsSync(file)) return use(file);

    const page = await browser.newPage({ storageState: undefined }); // start logged out
    await page.goto('https://app.example.com/login');
    await page.getByLabel('Email').fill(\`qa_user_\${id}@example.com\`);
    await page.getByLabel('Password').fill(process.env.QA_PASS!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/dashboard');
    await page.context().storageState({ path: file });
    await page.close();
    await use(file);
  }, { scope: 'worker' }],
});`,
        },
      ],
      keyPoints: [
        'One setup + JSON per role; test.use({ storageState }) per file/describe.',
        'Two roles in one test: one newContext per role, close them yourself.',
        'Per-worker accounts: worker fixture keyed by parallelIndex, file in outputDir.',
      ],
      source: 'Playwright docs — Authentication (multiple roles, one account per parallel worker)',
    },
    {
      heading: 'API login, HTTP basic auth and session expiry',
      body: `**Intuition:** if the building has a staff entrance (a login API), use it for setup; save the front door (UI login) for the tests that are about the front door.

**API login:** if the app sets its session cookie from a login endpoint, do the setup with the \`request\` fixture and save its state: \`await request.post('/login', { form: {...} })\` then \`await request.storageState({ path })\`. This is much faster than the UI and not affected by UI flakiness.

Caveat: an \`APIRequestContext\` only collects **cookies**. If the frontend puts a token into **localStorage** with JavaScript after login, an API-only login will not produce that state; either log in through the UI once, or write the token into localStorage yourself (\`context.addInitScript\`) or into the \`origins\` part of the state.

**Restful Booker style tokens:** some APIs return a token in the body (\`POST /auth\` → \`{ token }\`) that you then send as \`Cookie: token=...\`. For API tests, keep that in a worker-scoped fixture or set it via \`extraHTTPHeaders\`.

**HTTP Basic auth:** sites protected by a browser username/password prompt (e.g. \`https://the-internet.herokuapp.com/basic_auth\`, admin/admin) are handled with \`use: { httpCredentials: { username, password } }\`, not by filling a form.

**Session expiry:**
- Short-lived sessions can expire during a long run. Keep runs short (sharding), make the setup project run every time (default), and do not commit or cache auth files across days.
- If a test suddenly lands on the login page, check the age of the state file first.
- Store the file under \`test.info().project.outputDir\` when it does not need to survive between runs: it is cleaned automatically.
- MFA/OTP: use a test account with MFA disabled in test environments, a TOTP secret to generate codes in setup, or an API that issues a session directly. Never try to automate SMS.`,
      code: [
        {
          language: 'typescript',
          title: 'tests/api-auth.setup.ts and httpCredentials',
          code: `import { test as setup } from '@playwright/test';

// API login: the server answers with a Set-Cookie session
setup('authenticate via API', async ({ request }) => {
  const res = await request.post('https://app.example.com/api/login', {
    form: { user: process.env.APP_USER!, password: process.env.APP_PASS! },
  });
  if (!res.ok()) throw new Error(\`Login API failed: \${res.status()}\`);
  // saves the cookies collected by this request context
  await request.storageState({ path: 'playwright/.auth/api-user.json' });
});

// playwright.config.ts (excerpt) for a Basic-auth protected site:
// use: {
//   baseURL: 'https://the-internet.herokuapp.com',
//   httpCredentials: { username: process.env.BASIC_USER!, password: process.env.BASIC_PASS! },
// }
// test: await page.goto('/basic_auth');
//       await expect(page.getByText('Congratulations!')).toBeVisible();`,
        },
      ],
      keyPoints: [
        'API login + request.storageState: fastest setup when the session is a cookie.',
        'Token kept in localStorage by frontend JS is NOT captured by an API login.',
        'Basic auth → use.httpCredentials. Sessions expire: regenerate state every run.',
      ],
      source: 'Playwright docs — Authentication (API request, session storage); Test use options (httpCredentials)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-auth-config-cc-1',
      title: 'Logging in through the UI in all 240 tests',
      context:
        'The suite has 240 SauceDemo tests across 12 files. Every file has a beforeEach that logs in through the form with literal credentials. CI takes 14 minutes, and when SauceDemo is slow the login step itself times out and turns the whole run red.',
      task:
        'Change the framework so the UI login happens once per run, tests start already logged in but still isolated, credentials come from environment variables, and the dedicated login tests still start logged out.',
      starter: {
        language: 'typescript',
        title: 'tests/cart.spec.ts (one of 12 files) + config (before)',
        code: `// tests/cart.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
});

test('add backpack', async ({ page }) => {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
});

// playwright.config.ts
// export default defineConfig({
//   projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
// });`,
      },
      hints: [
        'Which Playwright feature saves cookies and localStorage of a logged-in browser to a file and preloads them into new contexts?',
        'Create tests/auth.setup.ts that logs in once and saves the state; add a "setup" project and make chromium depend on it.',
        'Set use.storageState and baseURL in the chromium project, delete the beforeEach, and give login tests an empty storageState.',
      ],
      solution: {
        language: 'typescript',
        title: 'auth.setup.ts + config + spec (after)',
        code: `// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill(process.env.SAUCE_USER!);
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASS!);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByTestId('title')).toHaveText('Products'); // proof of login
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});

// playwright.config.ts
// import 'dotenv/config';
// export default defineConfig({
//   use: { baseURL: 'https://www.saucedemo.com', testIdAttribute: 'data-test' },
//   projects: [
//     { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
//     { name: 'chromium', dependencies: ['setup'],
//       use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' } },
//   ],
// });

// tests/cart.spec.ts: no login code at all
import { test, expect } from '@playwright/test';
test('add backpack', async ({ page }) => {
  await page.goto('/inventory.html');
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});
// tests/login.spec.ts: test.use({ storageState: { cookies: [], origins: [] } });`,
      },
      explanation: `- **One login per run:** the setup project logs in once and writes \`playwright/.auth/user.json\`; 240 UI logins become 1.
- **Still isolated:** every test gets a **new context** preloaded from the file, so carts and other browser state never leak between tests (SauceDemo's cart lives in localStorage of each fresh context).
- **Clear failure mode:** if login breaks, the setup project fails and dependent tests are **skipped**, instead of 240 confusing failures.
- **Secrets:** credentials read from \`SAUCE_USER\`/\`SAUCE_PASS\` (loaded by \`dotenv\` locally, CI secrets in the pipeline). Add \`playwright/.auth\` and \`.env\` to \`.gitignore\`.
- **baseURL + testIdAttribute** remove repeated hosts and let \`getByTestId\` read SauceDemo's \`data-test\` attributes.
- **Login UI is still tested** by dedicated tests that reset storageState to empty.`,
      followUps: [
        {
          q: 'Roughly how much time does this save?',
          a: 'If a UI login takes about 3 s, 240 logins cost about 12 minutes of test time; with 4 workers that is about 3 minutes of wall time. After the change you pay one login (about 3 s) in the setup project. The exact numbers vary, but login is usually the largest repeated cost in UI suites.',
        },
        {
          q: 'Why not save the state once and commit the JSON so CI does not even need the setup step?',
          a: 'The file contains a live session cookie (a credential) and sessions expire. Committing it leaks access and causes random "logged out" failures when it ages. Regenerating it each run costs seconds and is always fresh.',
        },
      ],
    },
    {
      id: 'pw-auth-config-cc-2',
      title: 'A config that fights the team',
      context:
        'This config "works on my machine", but on CI the tests are slow, retries hide real failures locally, credentials are in git, a forgotten test.only once made CI run 1 test and pass, and page.goto("/") fails because baseURL is ignored.',
      task:
        'Rewrite the config so options are in the right layer, CI and local behave sensibly, secrets come from env vars, the environment is selectable, and artifacts are useful for debugging failures.',
      starter: {
        language: 'javascript',
        title: 'playwright.config.js (before)',
        code: `// plain JS config, no defineConfig, so nothing is type-checked
module.exports = {
  testDir: './tests',
  baseURL: 'https://www.saucedemo.com',      // wrong layer: silently ignored
  timeout: 120000,                            // raised to "fix" slow tests
  retries: 3,                                 // also locally
  workers: 1,                                 // everywhere
  use: {
    headless: false,
    storageState: 'auth.json',               // committed to git
    video: 'on',
    trace: 'on',
  },
  // credentials used by tests via require('./playwright.config').creds
  creds: { user: 'standard_user', pass: 'secret_sauce' },
};`,
      },
      hints: [
        'Which options belong to use (browser/context) and which to the runner? Where is baseURL read from?',
        'Use process.env.CI to switch retries, workers, forbidOnly and artifacts between local and CI.',
        'Move credentials to env vars loaded with dotenv, and generate the storage state in a setup project into a gitignored folder.',
      ],
      solution: {
        language: 'typescript',
        title: 'playwright.config.ts (after)',
        code: `import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

const ENV = process.env.TEST_ENV ?? 'qa';
dotenv.config({ path: path.resolve(__dirname, \`.env.\${ENV}\`) });
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,                       // default; slow tests use test.slow()
  fullyParallel: true,
  forbidOnly: CI,                        // a stray test.only fails CI
  retries: CI ? 2 : 0,                   // see failures honestly on your machine
  workers: CI ? 2 : undefined,           // default = half the CPU cores locally
  reporter: CI ? [['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]] : 'html',

  use: {
    baseURL: process.env.BASE_URL,       // correct layer
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',             // evidence without slowing every test
    screenshot: 'only-on-failure',
    video: CI ? 'retain-on-failure' : 'off',
  },

  projects: [
    { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    },
  ],
});`,
      },
      explanation: `- **defineConfig + TypeScript:** misplaced options become compile errors. \`baseURL\` now lives in \`use\`, so \`page.goto('/')\` works.
- **Timeout back to 30 s:** a 2-minute timeout makes every hang cost 2 minutes and hides performance problems. Slow tests opt in with \`test.slow()\`.
- **Retries only on CI:** retrying locally hides flakiness from the person who can fix it. On CI, 2 retries + \`trace: 'on-first-retry'\` keeps the pipeline moving and records evidence.
- **Workers:** default parallelism locally; a fixed small number on CI runners.
- **forbidOnly on CI** prevents the "1 test ran and passed" accident.
- **Artifacts:** trace/video on for every test slows the run and fills disks; keep them for failures and retries.
- **headless** removed (default true); use \`--headed\` or UI mode when debugging.
- **Secrets:** credentials come from \`.env.<TEST_ENV>\` / CI secrets, not a config export. The storage state is generated by a setup project into \`playwright/.auth/\` (gitignored) instead of a committed \`auth.json\`.`,
      followUps: [
        {
          q: 'A test genuinely needs 2 minutes (a large CSV export). How do you configure that?',
          a: 'Inside that test call test.setTimeout(120_000), or test.slow() if triple the default is enough. If a whole file is slow, use test.describe.configure({ timeout: 120_000 }) in it. The global timeout stays 30 s so everything else still fails fast.',
        },
        {
          q: 'Why might someone set workers: 1, and what is the better fix?',
          a: 'Usually because tests collide on shared data or depend on order. workers: 1 hides that and multiplies runtime. The fix is test isolation: unique data per test, per-worker accounts via parallelIndex, and API setup instead of relying on earlier tests.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-auth-config-iq-01',
      difficulty: 'medium',
      question: 'Explain how one config file lets your suite run on laptops and in pipelines, against QA or staging, with login reused. Go layer by layer: runner, use, projects.',
      whatInterviewerLooksFor: [
        'Distinguishes runner options, use options and projects',
        'Knows defaults and CI-specific choices with reasons',
        'Mentions env-driven baseURL and secrets handling',
        'Mentions auth setup project and artifacts',
      ],
      modelAnswer: `I explain it in three layers.

**Runner options**
- \`testDir: './tests'\`, \`fullyParallel: true\`: my tests are independent, so I let Playwright spread them across workers.
- \`forbidOnly: !!process.env.CI\`: a forgotten \`test.only\` fails CI instead of silently running one test.
- \`retries: process.env.CI ? 2 : 0\`: locally I want to see flakiness; on CI retries keep the pipeline moving and the report marks such tests as flaky.
- \`workers: process.env.CI ? 2 : undefined\`: the default is half the CPU cores; CI runners are small.
- \`reporter\`: HTML for people, JUnit for the CI dashboard.
- I keep the default **30 s test** and **5 s expect** timeouts and mark genuinely slow tests with \`test.slow()\`.

**use (applies to every test)**
- \`baseURL\` from \`process.env.BASE_URL\`, chosen by \`TEST_ENV\` via a \`.env.<env>\` file loaded by dotenv. Specs use relative paths.
- \`testIdAttribute: 'data-test'\` because SauceDemo uses that attribute.
- \`trace: 'on-first-retry'\`, \`screenshot: 'only-on-failure'\`, video retained on failure on CI: evidence for failures without slowing passing tests.

**projects**
- \`setup\` project (\`*.setup.ts\`) logs in once and saves \`playwright/.auth/user.json\`.
- \`chromium\`, \`firefox\` (and a mobile profile) depend on \`setup\` and load that storageState.
- A \`smoke\` project with \`grep: /@smoke/\` for the PR gate.

Secrets never live in the config: credentials come from env vars, and \`.env\` plus \`playwright/.auth\` are gitignored.`,
      followUps: [
        {
          q: 'Where would you put a 10-second limit on individual clicks?',
          a: "use: { actionTimeout: 10_000 }. By default actions have no own timeout and are only bounded by the 30 s test timeout, so a stuck click reports a generic test timeout. With actionTimeout the error names the action that hung, which makes triage faster.",
        },
        {
          q: 'What is the precedence if baseURL is set in top-level use, in a project and in test.use?',
          a: 'The most specific wins: test.use() in the file or describe, then the project use, then the top-level use. That lets a single describe point at a different host without changing the rest of the suite.',
        },
      ],
      pitfalls: [
        'Listing options without saying why',
        'Raising the global timeout to fix flakiness',
        'Hard-coded credentials or URLs in the config',
      ],
    },
    {
      id: 'pw-auth-config-iq-02',
      difficulty: 'medium',
      question: 'How do you avoid logging in through the UI in every test? Explain storageState end to end.',
      whatInterviewerLooksFor: [
        'Setup project + dependencies + use.storageState',
        'What the file contains and why it is gitignored',
        'Waiting for login to complete before saving',
        'Opt-out for login tests; isolation still holds',
      ],
      modelAnswer: `**Idea:** log in once, save the browser's authenticated state, and start every test's new context from it.

**Steps**
1. \`tests/auth.setup.ts\` (imported as \`setup\`): go to the login page, fill credentials from env vars, submit, **wait for proof of login** (\`waitForURL('**/inventory.html')\` or a logged-in element), then \`await page.context().storageState({ path: 'playwright/.auth/user.json' })\`.
2. Config: a \`setup\` project with \`testMatch: /.*\\.setup\\.ts/\`; each test project has \`dependencies: ['setup']\` and \`use: { storageState: 'playwright/.auth/user.json' }\`.
3. Tests just navigate to protected pages.

**What is in the file:** cookies and localStorage for each origin (IndexedDB too if I pass \`indexedDB: true\`). Not sessionStorage. For SauceDemo it is the \`session-username\` cookie. Because it is a live session, \`playwright/.auth\` goes into \`.gitignore\`.

**Isolation:** each test still gets a **fresh context**, only preloaded with the cookies. Changes one test makes in its browser (cart in localStorage) do not leak to other tests.

**Login tests:** the tests that verify the login form use \`test.use({ storageState: { cookies: [], origins: [] } })\` to start logged out.

**Benefits:** N logins become 1; if login breaks, the setup fails and dependents are skipped with one clear error; setup shows in the HTML report with a trace.`,
      followUps: [
        {
          q: 'What if tests change data on the server for the logged-in user, for example a saved address?',
          a: 'Then a shared account collides across parallel workers. I switch to one account per worker: override storageState with a worker-scoped fixture keyed by parallelIndex that logs in qa_user_<index> once and saves a per-worker file. Each worker then has its own server-side data.',
        },
        {
          q: 'Why wait for an element before saving the state?',
          a: 'Many apps finish setting cookies during redirects after the click. Saving immediately can capture a half-logged-in state, and every test then lands on the login page. Waiting for the final URL or a logged-in element guarantees the state is complete.',
        },
      ],
      pitfalls: [
        'Thinking all tests share one page',
        'Committing the auth JSON',
        'Forgetting dependencies, so the state file is stale or missing',
      ],
    },
    {
      id: 'pw-auth-config-iq-03',
      difficulty: 'hard',
      question: 'What is the difference between globalSetup and a setup project with dependencies? Which do you use and why?',
      whatInterviewerLooksFor: [
        'Knows both mechanisms and their syntax',
        'Lists concrete advantages of project dependencies',
        'Knows failure behaviour and --no-deps',
        'Knows teardown options for both',
      ],
      modelAnswer: `**globalSetup** is a file referenced by \`globalSetup: require.resolve('./global-setup')\`. It default-exports one async function receiving \`FullConfig\`, runs once before all tests, and can return a teardown function (or use \`globalTeardown\`). It runs **outside** the test runner: no fixtures, so for browser work you launch \`chromium\` yourself, and config \`use\` options are not applied automatically.

**A setup project** is a normal project whose tests do the setup, and other projects list it in \`dependencies\`. Because it is a test:
- it appears in the **HTML report** as its own project;
- it records a **trace** according to \`use.trace\`, so a broken login in CI is debuggable;
- it can use **fixtures** (\`page\`, \`request\`, \`baseURL\`) and gets config options like \`headless\` and \`testIdAttribute\`;
- it can be cleaned up by a **teardown project** (\`teardown: 'cleanup'\`) that runs after all dependents.

Behaviour: dependencies run before dependents even when I filter by file or grep; if the setup fails, dependent projects are **skipped**; \`--no-deps\` skips setup when I deliberately want to.

**My choice:** setup projects, which the docs recommend, for authentication and data seeding. I would still use globalSetup for something that is not test-like at all, e.g. starting a Docker container or reading secrets from a vault before anything else, or in older codebases where it already works. Note that \`webServer\` covers the common "start my app" case anyway.`,
      followUps: [
        {
          q: 'How does globalSetup pass data to tests?',
          a: 'Through process.env (strings, so JSON.stringify structured data) or by writing files such as a storageState JSON. Setup projects usually communicate through files too, since each test runs in a worker process that does not share memory with the setup.',
        },
        {
          q: 'UI mode does not seem to log in. Why?',
          a: 'UI mode does not run the setup project by default to keep iterations fast. Enable the setup project in the project filter once (or run auth.setup.ts manually) whenever the saved state is missing or expired, then disable it again.',
        },
      ],
      pitfalls: [
        'Saying they are identical',
        'Not knowing that a failed dependency skips dependents',
        'Using globalSetup and then wondering why there is no trace of the failing login',
      ],
    },
    {
      id: 'pw-auth-config-iq-04',
      difficulty: 'medium',
      question: 'Your app has admin and customer roles. How do you test both, including a flow where the admin must act on something the customer just did?',
      whatInterviewerLooksFor: [
        'One saved state per role via setup',
        'test.use per file/describe',
        'Multiple contexts in one test with cleanup',
        'Optional role fixtures with POM',
      ],
      modelAnswer: `**Setup:** two setup tests in \`auth.setup.ts\`: "authenticate as admin" saves \`playwright/.auth/admin.json\`, "authenticate as customer" saves \`playwright/.auth/customer.json\`. Credentials for both come from env vars.

**Per-file role:** the default project uses the customer state. Admin specs override it at the top: \`test.use({ storageState: 'playwright/.auth/admin.json' })\`. Inside one file, I can switch roles per \`test.describe\`.

**Both roles in one test** (customer places an order, admin approves it):
- \`const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' })\`
- \`const customerContext = await browser.newContext({ storageState: 'playwright/.auth/customer.json' })\`
- open a page in each, drive the customer flow, read the order id, then assert in the admin page that the order is visible and approve it, then check the customer page shows "Approved".
- Close both contexts in a \`finally\` (or a fixture teardown) because contexts I create manually are not closed by Playwright.

**Cleaner with fixtures:** define \`adminPage\` and \`customerPage\` fixtures that create the context with the right state, wrap the page in a page object (\`AdminOrdersPage\`), \`await use(...)\`, and close the context afterwards. Tests then read \`async ({ adminPage, customerPage }) => {...}\`.

Negative role tests matter too: the customer should get 403 or a redirect on admin URLs.`,
      followUps: [
        {
          q: 'Should the admin and customer contexts share a browser?',
          a: 'Yes, they come from the same worker-scoped browser fixture, which is cheap. Isolation between roles is at the context level: separate cookie jars and storage, exactly like two different browser profiles on one machine.',
        },
        {
          q: 'How would you test that a customer cannot open an admin page?',
          a: 'Use the customer storage state, goto the admin URL and assert the app response: a redirect to the customer area or a 403 page. Also call the admin API with the customer session through context.request and assert 403, because UI hiding alone is not security.',
        },
      ],
      pitfalls: [
        'Logging out and in again within a single context',
        'Forgetting to close manually created contexts',
        'Only testing positive role paths',
      ],
    },
    {
      id: 'pw-auth-config-iq-05',
      difficulty: 'easy',
      question: 'How do you run the same Playwright suite against QA and staging without changing code, and how do you keep credentials safe?',
      whatInterviewerLooksFor: [
        'Environment variables and dotenv',
        'A selector variable such as TEST_ENV',
        'CI secrets, .gitignore, .env.example',
        'Optional per-environment projects',
      ],
      modelAnswer: `**Mechanism**
- Everything that differs per environment is an **environment variable**: \`BASE_URL\`, user names, passwords, API keys.
- Locally, I keep \`.env.qa\` and \`.env.staging\` (both gitignored). The config reads \`TEST_ENV\` (default \`qa\`) and calls \`dotenv.config({ path: path.resolve(__dirname, '.env.' + ENV) })\`.
- \`use.baseURL = process.env.BASE_URL\`; specs only use relative paths like \`page.goto('/inventory.html')\`.
- I validate required variables at the top of the config and throw a clear error if one is missing.
- Run: \`TEST_ENV=staging npx playwright test\`.

**On CI**
- No \`.env\` file: the pipeline injects the same variable names from secrets (e.g. GitHub Actions \`env: SAUCE_PASS: \${{ secrets.SAUCE_PASS }}\`).
- The job sets \`TEST_ENV\` per stage.

**Safety**
- \`.env*\` (except \`.env.example\`) and \`playwright/.auth\` are in \`.gitignore\`.
- \`.env.example\` documents the keys without values.
- Never log secrets; avoid putting them in test titles or attachments.

Even for SauceDemo, whose \`standard_user\`/\`secret_sauce\` are public, I follow this pattern so the habit is right for real apps.

**Alternative:** per-environment projects (\`staging\` and \`production\` projects with different \`baseURL\` and \`retries\`) when both must run in the same invocation.`,
      followUps: [
        {
          q: 'What is the risk of process.env.PASSWORD being undefined?',
          a: 'fill() needs a string; with a non-null assertion the test may type "undefined" or throw a type error deep in a test, making the failure confusing. Validating required variables in the config fails the run immediately with a message naming the missing variable and environment.',
        },
        {
          q: 'Would you run destructive tests against production?',
          a: 'No. Production gets a small read-only smoke set (tagged @prod-safe) with zero retries and no data creation, often via its own project. Anything that creates orders or changes data runs only in QA/staging.',
        },
      ],
      pitfalls: [
        'Committing .env files',
        'if/else on environment names scattered through tests',
        'Absolute URLs in specs',
      ],
    },
    {
      id: 'pw-auth-config-iq-06',
      difficulty: 'hard',
      question:
        'After moving to storageState, tests pass locally but on CI about half of them land on the login page. Walk me through your debugging.',
      whatInterviewerLooksFor: [
        'Checks the setup project ran and passed',
        'Checks state completeness and timing of save',
        'Considers expiry, domains/origins and sessionStorage/IndexedDB',
        'Uses traces and evidence',
      ],
      modelAnswer: `I would gather evidence first, then go through likely causes.

**Evidence:** open the HTML report and trace of a failing test (network tab: was the session cookie sent? which redirect happened?). Open the setup project's trace too. Check the saved JSON as a CI artifact (without publishing it).

**Likely causes**
1. **Setup did not run or ran differently.** The project lacks \`dependencies: ['setup']\`, or CI runs \`--project=chromium --no-deps\` and picks up a stale file. Fix the config/command.
2. **State saved too early.** The setup clicked Login and saved before the redirect set the final cookie. Fix: \`waitForURL\` / assert a logged-in element before \`storageState()\`.
3. **Domain or origin mismatch.** Setup logged in on \`app.qa.example.com\` but tests use a different \`baseURL\` host (or http vs https), so cookies do not apply. Make both use the same \`baseURL\`.
4. **Auth stored where storageState does not look.** Token in **sessionStorage** (not saved) or **IndexedDB** (needs \`indexedDB: true\`). Fix accordingly.
5. **Expiry.** A short session expires during a long CI run, or a cached auth file from a previous pipeline was restored. Regenerate per run; shard long suites.
6. **Server-side invalidation.** Logging in again elsewhere (another worker or job using the same account) kills earlier sessions on apps with one-session-per-user. Use per-worker accounts.

"About half" suggests a timing or account conflict rather than a missing file, so I would look hardest at 2, 5 and 6, verifying with \`--repeat-each\` and timestamps in the trace.`,
      followUps: [
        {
          q: 'How do you check whether the app uses sessionStorage for auth?',
          a: 'Log in manually with DevTools open and look at Application → Storage for cookies, localStorage, sessionStorage and IndexedDB entries that appear after login. Or in a Playwright script, evaluate JSON.stringify(sessionStorage) after login. If the token is only in sessionStorage, use the docs workaround with addInitScript.',
        },
        {
          q: 'How would you make an expired session fail clearly instead of with random locator errors?',
          a: 'Add an auto fixture or a check in key page objects: after navigation, if the URL is the login page, throw "Session expired or storageState invalid" with the state file timestamp. One explicit message saves a lot of triage time.',
        },
      ],
      pitfalls: [
        'Turning on retries to make it pass',
        'Going back to UI login everywhere without finding the cause',
        'Not checking that setup actually ran on CI',
      ],
    },
    {
      id: 'pw-auth-config-iq-07',
      difficulty: 'expert',
      question:
        'The app allows only one active session per user, and tests modify the user\'s server-side cart. With 6 workers and a single shared storageState, tests randomly fail. Design the authentication strategy.',
      whatInterviewerLooksFor: [
        'Identifies session invalidation and shared server state',
        'One account per worker with parallelIndex',
        'Implementation details: worker fixture overriding storageState, outputDir, reuse of the file',
        'Account provisioning, cleanup and CI sharding concerns',
      ],
      modelAnswer: `**Why it fails:** with one account, (a) every new login can invalidate the others' sessions, and (b) all workers add to and clear the same server-side cart. Results depend on timing.

**Design: one account per parallel worker**
- Provision accounts \`qa_cart_0 … qa_cart_N\` (N ≥ max workers) in QA, ideally via an admin API in a setup project, or pre-created and documented.
- In \`fixtures/auth.ts\`, override the built-in \`storageState\` fixture with a worker-scoped \`workerStorageState\` fixture:
  - \`const id = test.info().parallelIndex\` (stable 0…workers-1, reused after a worker restart, so the account pool is enough);
  - file = \`path.resolve(test.info().project.outputDir, '.auth/' + id + '.json')\`; if it exists, reuse it;
  - else open \`browser.newPage({ storageState: undefined })\`, log in as \`qa_cart_\${id}\`, wait for proof of login, save, close the page.
- Specs import \`test\` from this fixtures file.
- Because each worker logs in exactly once and holds its own account, no session is invalidated and carts do not collide.

**Per-test state:** a test-scoped fixture empties the cart via API before each test (and/or after), so tests in the same worker do not depend on each other.

**Sharding on CI:** each shard machine has its own workers with \`parallelIndex\` 0…N again, so two shards would reuse the same accounts. Include the shard index in the account key (e.g. read it from an env var set by the CI job) or give each shard its own account range.

**Hygiene:** writing state to \`outputDir\` means it is cleaned before each run; passwords from env vars; the HTML report shows which account a test used via an annotation.`,
      followUps: [
        {
          q: 'Why parallelIndex and not workerIndex?',
          a: 'workerIndex increases every time a worker restarts after a failure, so with 6 workers it could reach 10 or more and run past a pool of 6 accounts. parallelIndex stays within 0..workers-1 and the replacement worker inherits it, which maps cleanly onto a fixed account pool.',
        },
        {
          q: 'Could you avoid UI login entirely here?',
          a: 'If the app has a login API that sets the session cookie, the worker fixture can log in with playwright.request.newContext and save context.storageState(). That is faster and less flaky. Keep one UI login test so the form itself is still covered.',
        },
      ],
      pitfalls: [
        'Setting workers: 1 as the solution',
        'Using workerIndex for the account pool',
        'Forgetting shards share parallelIndex values',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-auth-config-drill-1',
      question:
        'A suite has 300 tests, 3 browser projects, 6 workers per run. A UI login takes 4 s. Count the logins and total login time per run for: (a) login in beforeEach, (b) one setup project + storageState shared by all projects, (c) one account per worker via a worker fixture, with a separate state folder per project.',
      assumptions: [
        '300 tests × 3 projects = 900 test executions per run; no retries.',
        'All 6 workers run tests in every project.',
        'In (c) each project has its own outputDir, so each worker logs in once per project.',
      ],
      steps: [
        { label: '(a) beforeEach', calc: '900 executions × 1 login = 900 logins × 4 s = 3,600 s (60 min of test time; ≈ 10 min wall at 6 workers)' },
        { label: '(b) setup project', calc: '1 login × 4 s = 4 s (runs once before all dependent projects)' },
        { label: '(c) per-worker accounts', calc: '6 workers × 3 projects = 18 logins × 4 s = 72 s total (≈ 12 s wall)' },
        { label: 'Logins saved (a → b)', calc: '900 − 1 = 899 logins, ≈ 3,596 s of test time' },
      ],
      answer:
        '(a) **900 logins, ~60 min of test time (~10 min wall)**. (b) **1 login, 4 s**. (c) **18 logins, ~72 s total (~12 s wall)**. storageState saves about 899 logins per run.',
      insight:
        'Login is often the biggest repeated cost in a UI suite. Pick the cheapest scope that keeps tests isolated: per run if tests only read, per worker if they change account data.',
      followUps: [
        {
          q: 'With retries: 2 and 5% of tests retried once, how many extra logins does (a) cost? And (b)?',
          a: '(a) 5% of 900 = 45 extra executions, each with a login: 45 more logins, about 3 more minutes of test time. (b) zero, because retries reuse the saved state file; the setup project is not re-run for retried tests.',
        },
      ],
    },
    {
      id: 'pw-auth-config-drill-2',
      question:
        'Work out the effective baseURL, retries, timeout and storageState for the test "approve order" given the config and spec below. Config: top-level timeout 30000, retries 1, use { baseURL: "https://qa.shop.test", storageState: "playwright/.auth/user.json" }. Project "staging": retries 2, use { baseURL: "https://staging.shop.test" }. Spec (run under project "staging"): at file top `test.use({ storageState: "playwright/.auth/admin.json" })`; inside describe "approvals": `test.describe.configure({ timeout: 60000 })`; test "approve order" calls `test.slow()`.',
      assumptions: [
        'Precedence: test.use > project use > top-level use; describe.configure overrides project/config timeout for that scope.',
        'test.slow() triples the timeout in effect for that test.',
      ],
      steps: [
        { label: 'baseURL', calc: 'top-level qa → overridden by project staging → no test.use for baseURL ⇒ https://staging.shop.test' },
        { label: 'storageState', calc: 'top-level user.json → project does not set it → file-level test.use admin.json ⇒ admin.json' },
        { label: 'retries', calc: 'top-level 1 → project 2 → no describe override ⇒ 2' },
        { label: 'timeout', calc: '30,000 → describe.configure 60,000 → test.slow() × 3 ⇒ 180,000 ms' },
      ],
      answer:
        '**baseURL** https://staging.shop.test · **storageState** playwright/.auth/admin.json · **retries** 2 · **timeout** 180 s.',
      insight:
        'Settings stack from general to specific: config → project → file/describe → test. Reading them in that order resolves almost every "why does this test behave differently" question.',
      followUps: [
        {
          q: 'How can you confirm the effective values at runtime?',
          a: 'Inside the test, log testInfo.timeout, testInfo.project.retries and testInfo.project.use.baseURL, or read the baseURL fixture directly. testInfo reflects the resolved values for that particular test.',
        },
      ],
    },
    {
      id: 'pw-auth-config-drill-3',
      question:
        'For each situation, pick which limit fails first and with what kind of message: defaults are test timeout 30 s, expect 5 s, actionTimeout 0; config adds actionTimeout 10 s. (1) A click on a button covered by a spinner for 20 s. (2) expect(badge).toHaveText("2") while the badge shows "1" forever. (3) page.goto to a page that takes 40 s to load, with no navigationTimeout set. (4) A test making 8 assertions, each passing after 4.5 s.',
      assumptions: [
        'actionTimeout applies to actions like click/fill, not to goto (navigationTimeout is separate and unset).',
        'Every individual limit is also capped by the remaining test time.',
      ],
      steps: [
        { label: '(1) click', calc: 'Actionability waits; 10 s actionTimeout < 20 s spinner ⇒ click fails at 10 s with an action timeout naming the locator' },
        { label: '(2) assertion', calc: 'expect retries for 5 s ⇒ assertion fails at 5 s: expected "2", received "1"' },
        { label: '(3) goto', calc: 'navigationTimeout 0 = no own limit; test timeout 30 s hits first ⇒ "Test timeout of 30000ms exceeded" during goto' },
        { label: '(4) many slow assertions', calc: 'each < 5 s passes, but 8 × 4.5 = 36 s > 30 s ⇒ test timeout during the 7th assertion' },
      ],
      answer:
        '(1) **action timeout at 10 s**; (2) **expect timeout at 5 s**; (3) **test timeout at 30 s** (no navigation limit set); (4) **test timeout at 30 s** although every single assertion was within its limit.',
      insight:
        'Smaller, specific timeouts produce precise error messages; the test timeout is the overall budget. Set navigation/action limits to get clear failures, and fix slow steps rather than raising the global timeout.',
      followUps: [
        {
          q: 'How would you change the config so case (3) fails with a navigation-specific message?',
          a: 'Set use: { navigationTimeout: 15_000 }. page.goto would then fail after 15 s with a navigation timeout naming the URL, well before the 30 s test budget, which points straight at the slow page.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-auth-config-mcq-01',
      difficulty: 'easy',
      question: 'With no timeout settings in the config, what are the default test timeout and expect timeout?',
      options: ['30 s and 5 s', '60 s and 10 s', '30 s and 30 s', 'No test timeout and 5 s'],
      correct: [0],
      explanation:
        'Playwright Test defaults to a 30,000 ms test timeout and a 5,000 ms timeout for web-first assertions. 60/10 and 30/30 are common guesses, and the "no limit" default applies to actionTimeout and navigationTimeout, not to the test itself.',
      followUps: [
        {
          q: 'Which one would you change first if a page is legitimately slow?',
          a: 'Neither globally. Mark that test with test.slow() or test.setTimeout(), or give the one slow assertion its own { timeout } option. Global increases make every failure slower to report.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-02',
      difficulty: 'easy',
      question: 'Why does page.goto("/inventory.html") fail with this config?',
      code: {
        language: 'javascript',
        code: `module.exports = {
  testDir: './tests',
  baseURL: 'https://www.saucedemo.com',
  use: { trace: 'on-first-retry' },
};`,
      },
      options: [
        'baseURL must be inside use, so it is never applied here',
        'Relative URLs are not supported by page.goto',
        'trace must be off for baseURL to work',
        'testDir must be an absolute path',
      ],
      correct: [0],
      explanation:
        'baseURL is a use option (a context option), so at the top level it is ignored and "/inventory.html" has no host. page.goto supports relative URLs when baseURL is set, trace is unrelated, and testDir can be relative to the config file.',
      followUps: [
        {
          q: 'How would TypeScript have caught this?',
          a: 'With defineConfig() in a .ts config, an unknown top-level property like baseURL is reported as a type error, so the mistake is visible before running anything.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-03',
      difficulty: 'easy',
      question: 'Why do the docs tell you to add playwright/.auth to .gitignore?',
      options: [
        'The files are large binary snapshots that slow down git',
        'They contain live session cookies/tokens that act like credentials',
        'Playwright refuses to read state files that are tracked by git',
        'The folder is regenerated by npm install',
      ],
      correct: [1],
      explanation:
        'The saved state contains session cookies and storage that let anyone act as that user until the session expires, so committing it leaks access. The files are small JSON, Playwright does not check git status, and npm install does not touch them.',
      followUps: [
        {
          q: 'Where else could you write the state so it is cleaned automatically?',
          a: 'Under test.info().project.outputDir (for example in a worker fixture). The output directory is cleaned at the start of each run, so stale sessions never pile up.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-04',
      difficulty: 'medium',
      question: 'auth.setup.ts runs and passes, but tests in the chromium project still start on the login page. What is missing?',
      code: {
        language: 'typescript',
        code: `projects: [
  { name: 'setup', testMatch: /.*\\.setup\\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
    dependencies: ['setup'],
  },
],`,
      },
      options: [
        "storageState: 'playwright/.auth/user.json' in the chromium project's use",
        'teardown: "setup" on the chromium project',
        'fullyParallel: false, because storageState only works serially',
        'A globalSetup entry pointing at auth.setup.ts',
      ],
      correct: [0],
      explanation:
        'dependencies only guarantees that setup runs first; the test project must also load the saved file via use.storageState. teardown is for cleanup projects, storageState works fine in parallel, and adding globalSetup would just duplicate the login.',
      followUps: [
        {
          q: 'And if storageState is set but dependencies is missing?',
          a: 'Tests load whatever file exists from a previous run. They may pass with an old valid session, fail when it expires, or crash if the file is missing (for example on a fresh CI machine). Both settings are needed.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-05',
      difficulty: 'medium',
      question:
        'The project loads a logged-in storageState for all tests. What does test.use({ storageState: { cookies: [], origins: [] } }) at the top of login.spec.ts do?',
      options: [
        'Deletes the saved user.json file from disk',
        'Makes the tests in that file start with an empty, logged-out browser state',
        'Logs the user out on the server for every other test too',
        'Disables cookies entirely for the file, so login can never work',
      ],
      correct: [1],
      explanation:
        'It overrides the storageState option for that file with an empty state, so those tests start logged out and can test the login form. It does not touch the file on disk, does not affect the server session, and cookies still work normally once the test logs in.',
      followUps: [
        {
          q: 'Could you put that inside a describe instead?',
          a: 'Yes. test.use() inside a test.describe applies only to that group, so one file can have a logged-out describe and logged-in tests side by side.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-06',
      difficulty: 'medium',
      question: 'Select ALL that BrowserContext.storageState() can capture.',
      options: [
        'Cookies',
        'localStorage for each origin',
        'IndexedDB, when called with { indexedDB: true }',
        'sessionStorage',
        'The currently open tabs and their URLs',
      ],
      correct: [0, 1, 2],
      explanation:
        'Storage state covers cookies and localStorage, plus IndexedDB when you opt in (useful for Firebase-style auth). sessionStorage is not persisted (the docs show a manual workaround), and open pages or URLs are not part of the state.',
      followUps: [
        {
          q: 'Your app keeps its token in sessionStorage. What now?',
          a: 'Read it after login with page.evaluate(() => JSON.stringify(sessionStorage)), save it to a file, and in tests restore it with context.addInitScript that writes the values back for the right hostname, as shown in the auth docs.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-07',
      difficulty: 'medium',
      question:
        'Top-level use sets baseURL to the QA host. The "staging" project sets baseURL to the staging host. A describe in one spec calls test.use({ baseURL: "http://localhost:3000" }). Running --project=staging, which baseURL do tests in that describe get?',
      options: ['The QA host', 'The staging host', 'http://localhost:3000', 'It throws because baseURL is defined three times'],
      correct: [2],
      explanation:
        'The most specific setting wins: test.use in a describe overrides the project use, which overrides the top-level use. Tests outside that describe still get the staging host. Defining it at several levels is normal and does not throw.',
      followUps: [
        {
          q: 'How do you reset it back to the config value inside a nested describe?',
          a: 'Call test.use({ baseURL: undefined }) in that describe; the docs show this resets the option to the value from the configuration.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-08',
      difficulty: 'medium',
      question:
        'The config has retries: process.env.CI ? 2 : 0. A test always fails. How many times does it run locally and on CI?',
      options: ['1 locally, 2 on CI', '1 locally, 3 on CI', '3 locally, 3 on CI', '0 locally, 2 on CI'],
      correct: [1],
      explanation:
        'retries counts extra attempts after the first run. Locally retries is 0, so it runs once; on CI it runs once plus 2 retries = 3 times. "2 on CI" forgets the original attempt, and 0 runs is not possible for a selected test.',
      followUps: [
        {
          q: 'Why keep retries at 0 locally?',
          a: 'So a developer sees flakiness immediately where they can debug it. Retries on CI keep the pipeline moving and, with trace: on-first-retry, collect the evidence needed to fix the flaky test later.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-09',
      difficulty: 'hard',
      question:
        'The setup project fails because the login page is down. Projects chromium and firefox both depend on setup. What happens to their 200 tests?',
      options: [
        'They run anyway and each fails on the login page',
        'They are skipped, and the report shows the single setup failure',
        'Playwright retries the setup project until it passes',
        'They run with the previous run\'s state file if it exists',
      ],
      correct: [1],
      explanation:
        'When a dependency project fails, its dependent projects do not run; their tests are skipped. This gives one clear failure instead of 200. Setup is retried only according to the normal retries setting, not forever, and old state files are not used because the dependents never start.',
      followUps: [
        {
          q: 'How do you run the chromium tests without the setup project while debugging?',
          a: 'npx playwright test --project=chromium --no-deps. It skips dependencies and teardowns, so it relies on an existing valid state file. Use it carefully because a stale state causes misleading failures.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL real advantages of a setup project (project dependencies) over globalSetup for logging in.',
      options: [
        'It appears in the HTML report as its own project',
        'It can record a trace using the normal trace setting',
        'It can use fixtures like page and request, and config use options apply',
        'It is the only way to save storageState to a file',
        'It never needs to log in again when the session expires',
      ],
      correct: [0, 1, 2],
      explanation:
        'The docs list report integration, traces and fixtures/config options as the reasons to prefer project dependencies. globalSetup can also save storageState (the docs show an example), and neither approach magically handles expiry; both just run before tests each time.',
      followUps: [
        {
          q: 'How do you clean up after a setup project?',
          a: "Add teardown: 'cleanup' to the setup project and define a 'cleanup' project matching *.teardown.ts. It runs after all projects that depend on setup have finished.",
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-11',
      difficulty: 'hard',
      question: 'You already have npm run dev serving the app on port 3000. What happens when you run the tests locally (CI is not set)?',
      code: {
        language: 'typescript',
        code: `webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
},`,
      },
      options: [
        'Playwright reuses your running server and starts no new one',
        'Playwright starts a second server and the port clash fails the run',
        'Playwright kills your dev server and starts a fresh one',
        'webServer is ignored whenever baseURL is missing',
      ],
      correct: [0],
      explanation:
        'Locally reuseExistingServer is true, so if the URL already responds Playwright uses it. On CI it is false, so Playwright always starts its own server (and errors if the port is already taken). It never kills your process, and webServer does not depend on baseURL.',
      followUps: [
        {
          q: 'Why should CI never reuse a server?',
          a: 'On CI you want to test the code that was just built. Reusing an unknown process could test an old build or a different branch and give false confidence.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-12',
      difficulty: 'hard',
      question:
        'In the official one-account-per-worker pattern, why is the state file named with test.info().parallelIndex rather than workerIndex?',
      options: [
        'parallelIndex is a string, which file names require',
        'parallelIndex stays within 0..workers-1 and is reused by a replacement worker, so it maps onto a fixed account pool',
        'workerIndex is only available in afterAll hooks',
        'parallelIndex is unique across shards on different machines',
      ],
      correct: [1],
      explanation:
        'After a failure, Playwright starts a new worker with a new, higher workerIndex but the same parallelIndex, so parallelIndex fits a fixed pool of accounts. Both are numbers, workerIndex is available everywhere testInfo is, and parallelIndex values repeat across shards.',
      followUps: [
        {
          q: 'What breaks when you shard across 2 machines with this pattern?',
          a: 'Both machines have workers with parallelIndex 0..N, so they log in with the same accounts at the same time. Add the shard number (from a CI env var) to the account key or give each shard a separate account range.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-13',
      difficulty: 'expert',
      question:
        'The setup below runs without errors, yet UI tests that load api-user.json land on the login page. The SPA stores its JWT in localStorage after calling /api/login from the browser. Why?',
      code: {
        language: 'typescript',
        code: `setup('api login', async ({ request }) => {
  const res = await request.post('/api/login', {
    data: { email: process.env.APP_USER, password: process.env.APP_PASS },
  });
  expect(res.ok()).toBeTruthy(); // returns { token: "eyJ..." }
  await request.storageState({ path: 'playwright/.auth/api-user.json' });
});`,
      },
      options: [
        'request.storageState() only works for GET requests',
        'The token came back in the response body; no cookie was set and nothing wrote it to localStorage, so the saved state is empty',
        'The setup project must use page instead of request for any login',
        'JWTs cannot be stored in storageState files',
      ],
      correct: [1],
      explanation:
        'An APIRequestContext saves the cookies it received; here the app returns the token in the body and its frontend JavaScript would normally put it in localStorage, which never happened. API login works when the server sets a session cookie. A UI login is not required, though: you can write the token into the state\'s origins/localStorage yourself. The method is not limited to GET, and JWTs can be saved like any storage value.',
      followUps: [
        {
          q: 'How could you keep the fast API login and still make this work?',
          a: 'Take the token from the response, open a page on the app origin, set localStorage with page.evaluate (or add an init script), then save page.context().storageState(). Or build the JSON yourself with the origin and a localStorage entry for the token key.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-14',
      difficulty: 'expert',
      question:
        'Your QA app sessions expire after 15 minutes and the CI suite takes 40 minutes. Select ALL changes that address the resulting late-run "logged out" failures.',
      options: [
        'Shard the suite so each machine finishes within the session lifetime, each running its own setup project',
        'Always run the setup project at the start of every CI job instead of restoring a cached state file',
        'Commit a fresh storageState file to git every morning',
        'Ask for a longer session lifetime in the QA environment configuration for test accounts',
        'Raise the test timeout to 40 minutes',
      ],
      correct: [0, 1, 3],
      explanation:
        'Shorter runs per machine, a fresh login at the start of every job, and a longer session lifetime for test accounts all attack the expiry. A committed state file is a leaked credential and is already hours old when used; a larger test timeout has nothing to do with how long the server keeps the session alive.',
      followUps: [
        {
          q: 'How would you detect expiry quickly instead of seeing random locator failures?',
          a: 'Add a check (an auto fixture or a page-object guard) that fails with a clear "session expired" message when a test unexpectedly lands on the login URL, and log the age of the state file in the report.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-15',
      difficulty: 'medium',
      question: 'https://the-internet.herokuapp.com/basic_auth shows a browser username/password dialog. Which config makes this test pass?',
      code: {
        language: 'typescript',
        code: `test('basic auth', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/basic_auth');
  await expect(page.getByText('Congratulations!')).toBeVisible();
});`,
      },
      options: [
        "use: { httpCredentials: { username: 'admin', password: 'admin' } } (values from env vars)",
        "use: { storageState: { cookies: [{ name: 'auth', value: 'admin:admin' }] } }",
        'page.on("dialog", d => d.accept("admin")) inside the test',
        "use: { extraHTTPHeaders: { 'X-Basic': 'admin:admin' } }",
      ],
      correct: [0],
      explanation:
        'HTTP Basic auth is answered by the browser with credentials, which Playwright provides through the httpCredentials context option. The prompt is not a JavaScript dialog, a made-up cookie does nothing, and a custom header name is not the Authorization header the server expects.',
      followUps: [
        {
          q: 'Could you send the Authorization header yourself instead?',
          a: 'Yes, extraHTTPHeaders: { Authorization: "Basic " + base64("admin:admin") } works, but it sends the header to every host the page talks to. httpCredentials answers only the auth challenge, and can be restricted with its origin option.',
        },
      ],
    },
  ],
};

export default topic;
