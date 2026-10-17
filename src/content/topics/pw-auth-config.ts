import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-auth-config',
  phase: 'pw-framework',
  order: 3,
  title: 'Configuration & Authentication',
  subtitle: 'Set up playwright.config.ts step by step: timeouts, retries, workers, reports and projects. Read settings from environment variables. Log in once and reuse it with storageState.',
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
  tags: [
    'playwright',
    'config',
    'projects',
    'timeouts',
    'retries',
    'webServer',
    'dotenv',
    'storageState',
    'authentication',
    'setup-project',
    'globalSetup',
  ],
  cheatSheet: [
    'Config has 3 parts: top-level runner options (which tests run and how), use (how the browser is set up), projects (named variations of the run).',
    'Most specific setting wins: test.use() beats project use, which beats top-level use.',
    'Defaults: test timeout 30 s, expect timeout 5 s, actionTimeout and navigationTimeout 0 (no own limit), retries 0, workers = half the CPU cores.',
    'CI pattern: forbidOnly: !!process.env.CI, retries: process.env.CI ? 2 : 0, trace: "on-first-retry", reporter html (+ junit for CI dashboards).',
    'webServer: { command, url, reuseExistingServer: !process.env.CI } starts your app before the tests and stops it after.',
    'Project = same tests with different settings. Run one with --project=name. A setup project in dependencies runs first; if it fails, the dependent projects are skipped.',
    'Env vars: dotenv.config({ path: path.resolve(__dirname, ".env") }) in the config. TEST_ENV picks the environment. Secrets live only in .env (gitignored) or CI secrets.',
    'storageState = a saved JSON file of cookies and localStorage (+ IndexedDB with { indexedDB: true }). sessionStorage is NOT saved.',
    'Auth recipe: tests/auth.setup.ts logs in and calls page.context().storageState({ path }). Then a "setup" project + dependencies: ["setup"] + use: { storageState: "playwright/.auth/user.json" }.',
    'Gitignore playwright/.auth: it holds live session cookies. Start logged out with test.use({ storageState: { cookies: [], origins: [] } }).',
    'Several roles: one saved file per role (admin.json, user.json). Two roles in one test: browser.newContext({ storageState }) for each.',
    'Tests that change the account\'s data on the server: one account per worker (worker fixture keyed by parallelIndex).',
    'Setup project is better than globalSetup: it shows in the report, records a trace, and gets fixtures. API login: request.post + request.storageState({ path }). Basic auth: use.httpCredentials.',
  ],
  sections: [
    {
      heading: 'playwright.config.ts: runner options, use and projects',
      body: `**Example:** \`use: { baseURL: 'https://www.saucedemo.com' }\` → now \`page.goto('/')\` opens SauceDemo in every test.

The config file has three parts. Each part has one job.

- **Runner options** (top level) — which tests run and how. Examples: \`testDir\`, \`timeout\`, \`retries\`, \`workers\`, \`reporter\`, \`webServer\`.
- **\`use\`** — how the browser and page are set up for each test. Examples: \`baseURL\`, \`storageState\`, \`trace\`, \`screenshot\`, \`viewport\`.
- **\`projects\`** — named variations of the run. For example, the same tests in Chrome and in Firefox.

The most specific setting wins. \`test.use()\` in a file beats the project's \`use\`. The project's \`use\` beats the top-level \`use\`. Projects can also change a few runner options, like \`retries\` and \`timeout\`.

**Watch out:** do not put \`baseURL\` at the top level. It must go inside \`use\`. In a plain JavaScript config, the wrong place is silently ignored. Then \`page.goto('/')\` fails. Wrap the config in \`defineConfig()\`. TypeScript then shows an error for a setting in the wrong place.

**In an interview, say:** "Runner options decide which tests run and how. \`use\` decides how the browser looks for each test. Projects run the same tests with different \`use\` settings."

**Why testers care:** One clear config means every test gets the same, correct setup without repeated code.`,
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
        'Top level = runner; use = browser and page setup; projects = variations.',
        'Most specific wins: test.use > project use > top-level use.',
        'Wrap the config in defineConfig() so a setting in the wrong place shows an error.',
      ],
      source: 'Playwright docs — Test configuration; Test use options',
    },
    {
      heading: 'Timeouts, retries and workers',
      body: `**Example:** \`test.slow()\` inside one slow test → that test gets 3 times the normal time (90 s instead of 30 s).

A **timeout** is a time limit. If the limit passes, Playwright stops and fails the step. There are limits at different levels.

- **\`timeout\`** — the limit for one whole test. Default: **30 seconds**. It includes \`beforeEach\` and the test's fixtures.
- **\`expect.timeout\`** — how long one \`expect\` keeps checking the page before it fails. Default: **5 seconds**.
- **\`actionTimeout\`** and **\`navigationTimeout\`** — limits for one click or one \`page.goto\`. Default: **0**, which means no own limit. The test timeout still applies.
- **\`globalTimeout\`** — a limit for the whole run. Default: off. It is useful on CI to stop a stuck job.
- **\`webServer.timeout\`** — how long to wait for your app to start. Default: **60 seconds**.

A **retry** means running a failed test again. \`retries\` is **0** by default.

A **worker** is a separate process that runs tests. Several workers run tests at the same time. The default is **half the CPU cores**.

Good habits:
- Do not raise the test timeout for the whole suite. Mark only the slow tests with \`test.slow()\` or \`test.setTimeout()\`.
- Set \`actionTimeout\` (for example 10 s) if you want a stuck click to fail with a clear message.
- Use \`retries: process.env.CI ? 2 : 0\`. On your laptop you see failures honestly. On CI the pipeline keeps moving.
- Use fewer workers on CI, like \`2\` or \`'50%'\`. CI machines often have few cores.

**Why testers care:** The right limits make a stuck test fail fast with a clear message, instead of hiding slow pages.`,
      keyPoints: [
        'Test 30 s, expect 5 s, action and navigation have no own limit (the test limit still applies).',
        'Retries default to 0; on CI use 2 with trace on-first-retry.',
        'Workers default to half the CPU cores; use fewer on small CI machines.',
      ],
      source: 'Playwright docs — TestConfig API reference; Test use options; Test configuration',
    },
    {
      heading: 'Reporters, outputDir and artifacts',
      body: `**Example:** \`reporter: [['list'], ['html', { open: 'never' }]]\` → you see results in the terminal, and you also get an HTML report page.

A **reporter** shows the test results. Some reporters are for people, like \`list\` (terminal) and \`html\` (a web page). Some are for tools, like \`junit\` (an XML file for CI dashboards).

- **Default reporter:** \`list\` on your laptop, \`dot\` on CI. A project made with \`npm init playwright\` sets \`reporter: 'html'\`.
- You can use several reporters at once. Put them in an array.
- The HTML report goes into the \`playwright-report/\` folder.

**Artifacts** are the files a test leaves behind as evidence. These are screenshots, videos and traces. A **trace** is a recording of the test that you can replay step by step.

- **\`outputDir\`** is the folder for these files. Default: \`test-results\`. It is cleaned at the start of each run.
- You switch them on inside \`use\`: \`trace\`, \`video\` and \`screenshot\`. All are off by default.

A good default: \`trace: 'on-first-retry'\`, \`screenshot: 'only-on-failure'\`, and \`video: 'retain-on-failure'\` on CI. How to read these files is in the debugging topic. Here you learn **where** to switch them on.

**Why testers care:** When a CI test fails, the screenshot and trace show you what happened without running it again.`,
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
        'Default reporter: list locally, dot on CI; npm init sets html.',
        'outputDir = test-results (cleaned each run); HTML report in playwright-report/.',
        'trace, video and screenshot are use options, off by default.',
      ],
      source: 'Playwright docs — TestConfig API reference (reporter, outputDir); Test use options (recording)',
    },
    {
      heading: 'webServer: start the app before the tests',
      body: `**Example:** \`webServer: { command: 'npm run start', url: 'http://localhost:3000' }\` → Playwright starts your app, waits until the URL answers, runs the tests, then stops the app.

Use \`webServer\` when you test your own app in the same repository. You do not need to start the app by hand.

The main options:
- **\`command\`** (required) — how to start the app.
- **\`url\`** or **\`port\`** — what Playwright checks until the app is ready.
- **\`reuseExistingServer\`** — use an app that is already running, instead of starting a new one.
- **\`timeout\`** — how long to wait for the app. Default: 60 seconds.
- **\`stdout\`** / **\`stderr\`** — whether to show the app's logs.

You can also pass an array to start several servers, like a frontend and a fake API.

The usual pattern is \`reuseExistingServer: !process.env.CI\`. On your laptop, tests reuse the app you already run with \`npm run dev\`. On CI, a fresh app always starts. So CI never tests an old build.

SauceDemo is a public website, so a SauceDemo suite does not need \`webServer\`.

**Why testers care:** Tests never fail just because someone forgot to start the app first.`,
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
        'command + url/port: Playwright waits for the URL, then runs the tests.',
        'reuseExistingServer: !process.env.CI is the usual pattern.',
        'Default webServer timeout is 60 s.',
      ],
      source: 'Playwright docs — Test configuration (webServer); TestConfig API reference',
    },
    {
      heading: 'Projects: browsers, devices, environments and smoke runs',
      body: `**Example:** \`npx playwright test --project=firefox\` → only the tests of the \`firefox\` project run.

A **project** is a saved set of settings for a run. The tests are the same. Only the settings change.

Common projects:
- **Browsers and devices** — \`chromium\`, \`firefox\`, \`webkit\`, or a phone like \`devices['Pixel 5']\`.
- **Environments** — a \`staging\` project with its own \`baseURL\` and \`retries: 2\`.
- **Subsets** — a \`smoke\` project with \`grep: /@smoke/\`. It runs only tests tagged \`@smoke\`.
- **Setup** — a \`setup\` project that other projects list in \`dependencies\`. It can have a \`teardown\` project too. Teardown means the clean-up step after the tests.

The rules:
- \`npx playwright test\` runs **all** projects. \`--project=name\` runs one.
- A project's dependencies always run first. \`--no-deps\` skips them.
- If a dependency **fails**, the projects that depend on it are **skipped**.
- Projects that do not depend on each other run at the same time.
- Runs multiply: 50 tests × 3 browser projects = 150 test runs.

**Why testers care:** One suite can check Chrome, Firefox and mobile, or run a quick smoke set, without copying any test.`,
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
        'Project = same tests, different settings.',
        'Dependencies run first; if one fails, the projects that depend on it are skipped.',
        'The number of test runs multiplies by the number of projects.',
      ],
      source: 'Playwright docs — Projects',
    },
    {
      heading: 'Environment variables, .env files and multiple environments',
      body: `**Example:** \`TEST_ENV=staging npx playwright test\` → the same tests now run against the staging website.

An **environment variable** is a named value that the computer gives to your program. In code you read it with \`process.env.NAME\`. Use it for anything that changes between environments: the website address, user names and passwords.

The pattern:
1. Put each value in an environment variable: \`BASE_URL\`, \`SAUCE_USER\`, \`SAUCE_PASS\`.
2. On your laptop, keep them in a **\`.env\`** file. Or one file per environment: \`.env.qa\`, \`.env.staging\`. The \`dotenv\` package loads the file at the top of the config. Add these files to \`.gitignore\`.
3. Commit a **\`.env.example\`** file. It lists the names, but has no real values.
4. On CI there is no \`.env\` file. The pipeline gives the same names from its **secrets** (for example GitHub Actions \`secrets.SAUCE_PASS\`).
5. One switch, \`TEST_ENV=staging\`, picks which file to load. So it also picks the \`baseURL\`.

**SauceDemo:** \`standard_user\` / \`secret_sauce\` are public demo logins. Still, treat them like real ones. Put them in \`.env\` and read \`process.env.SAUCE_PASS\` in code.

**Watch out:** if a variable is missing, \`process.env.X\` is \`undefined\`. A test may then type "undefined" into the form. Check the required variables in the config and stop with a clear error. Also, never commit \`.env\` and never print secrets in logs.

**Why testers care:** You run the same suite on QA or staging with one switch, and passwords never end up in git.`,
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
        'Values in env vars: .env on your laptop (gitignored), secrets on CI.',
        'TEST_ENV picks the environment file and so the baseURL.',
        'Check required env vars in the config and stop early with a clear error.',
      ],
      source: 'Playwright docs — Parameterize tests (environment variables, .env files)',
    },
    {
      heading: 'Logging in: UI login per test vs saved state',
      body: `**Example:** a \`beforeEach\` that types the username and password → 200 tests means 200 logins. Saving the login once means 1 login.

There are two main ways to start a test logged in.

1. **Log in through the form in every test.** It is simple, but slow. It also tests the login page again and again for no reason.
2. **Log in once and save it.** Playwright saves the logged-in browser data to a file. Every test starts from that file. This is called **storageState**.

How does saving work? Most websites remember you with **cookies**, **localStorage** or **IndexedDB**. These are small stores of data inside the browser. Playwright copies them into a JSON file. Each new test loads the file, so the website sees a logged-in browser.

Each test still gets its own fresh browser context. A **browser context** is like a new private browser window. So tests stay separate from each other.

Here are the options, from slowest to fastest.
- **UI login in every test** — fine only for tiny suites, or for the login tests themselves.
- **storageState from a setup project** — one login per run. Use this for most suites.
- **storageState per worker** — one login per worker, each with its own account. Use it when tests change the account's data on the server.
- **API login + storageState** — the fastest. Test the login form in its own tests.

Keep a few **login tests** that start logged out: valid login, wrong password, locked user. All other tests should start logged in.

**Why testers care:** The suite gets much faster, and a slow login page no longer fails hundreds of tests.`,
      keyPoints: [
        'A saved login removes repeated logins, and tests still do not share a page.',
        'Every test gets a fresh context that already has the login cookies.',
        'Keep separate login-form tests that start logged out.',
      ],
      source: 'Playwright docs — Authentication; Checkly Learn — Playwright authentication',
    },
    {
      heading: 'Reusing authentication with storageState',
      body: `**Example:** \`await page.context().storageState({ path: 'playwright/.auth/user.json' })\` → Playwright saves this browser's cookies and localStorage into that file.

**storageState** is a saved file of cookies and local storage. Tests that load it start already logged in.

The recipe from the Playwright docs:
1. Create the folder \`playwright/.auth\`. Add it to \`.gitignore\`. The file holds a live login cookie, like a password.
2. Write \`tests/auth.setup.ts\`. It is a normal test, imported as \`setup\`. It logs in through the form. Then it **waits for proof of login**, like the right URL or a "Products" title. Then it saves the state.
3. In the config, add a \`setup\` project that matches \`*.setup.ts\`. In each test project, add \`dependencies: ['setup']\` and \`use: { storageState: 'playwright/.auth/user.json' }\`.
4. Tests just call \`page.goto('/inventory.html')\`. They are already logged in.

**What the file holds:** cookies and localStorage for each website. It holds IndexedDB too if you pass \`{ indexedDB: true }\`. Firebase login needs this. **sessionStorage is not saved.** The docs show a workaround for it.

**SauceDemo:** it remembers you with a \`session-username\` cookie. So the saved file has this cookie, and \`/inventory.html\` opens directly.

**To start logged out:** login tests use \`test.use({ storageState: { cookies: [], origins: [] } })\`.

**Watch out:**
- Do not save too early. The website may still be setting cookies after the click. Wait for a logged-in sign first.
- Logins **expire**. If tests suddenly land on the login page, create the file again. UI mode does not run the setup project by default. Run \`auth.setup.ts\` by hand when the login expires.

**Why testers care:** Tests skip the login form, run faster, and still start in a clean browser.`,
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
        'The setup project logs in once and saves JSON; test projects depend on it and load it.',
        'Wait for proof of login before saving; gitignore playwright/.auth.',
        'Start logged out with storageState { cookies: [], origins: [] }.',
      ],
      source: 'Playwright docs — Authentication (basic shared account, setup project)',
    },
    {
      heading: 'Project dependencies vs globalSetup',
      body: `**Example:** \`dependencies: ['setup']\` in the \`chromium\` project → the \`setup\` project runs first, and \`chromium\` waits for it.

Both ways mean "do this before all tests". They differ in what you get.

A **setup project** is a project with normal tests that do the setup. Other projects list it in \`dependencies\`. It is a normal test, so you get these benefits.
- It shows in the HTML report.
- It records a trace, so you can debug a broken login on CI.
- It gets fixtures like \`page\`, \`request\` and \`baseURL\`.
- It uses your config settings, like \`testIdAttribute\`.

**\`globalSetup\`** is one file with one async function. It runs once before all tests, outside the test runner. It does not show in the report. It has no trace and no fixtures, so you start the browser yourself. The Playwright docs prefer setup projects.

Clean-up: a setup project can name a **teardown** project. Teardown means the clean-up step. It runs after all tests that depend on the setup. For \`globalSetup\`, the clean-up is a \`globalTeardown\` file.

Good to know:
- Dependencies run even when you filter tests by file or \`--grep\`. \`--no-deps\` skips them.
- If the setup project fails, the projects that depend on it are **skipped**. You get one clear failure instead of 300.
- Only the setup project should match \`*.setup.ts\`. Then these files do not run as normal tests.
- \`globalSetup\` passes data to tests through \`process.env\`. A setup project usually passes data through files, like the storageState JSON.

**Why testers care:** When login breaks, you get one clear failure with a trace, not hundreds of confusing ones.`,
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
        'Setup projects get the report, a trace, fixtures and config settings; globalSetup gets none of these.',
        'If setup fails, the projects that depend on it are skipped; --no-deps skips setup.',
        'A teardown project (teardown: "cleanup") runs after the dependent projects.',
      ],
      source: 'Playwright docs — Global setup and teardown; Projects (dependencies, teardown)',
    },
    {
      heading: 'Multiple roles and one account per worker',
      body: `**Example:** \`test.use({ storageState: 'playwright/.auth/admin.json' })\` at the top of a file → every test in that file starts logged in as admin.

**Several roles (like admin and user):**
- Write one setup test per role. Each saves its own file: \`admin.json\`, \`user.json\`.
- Pick the role per file or per \`describe\` with \`test.use({ storageState })\`.
- **Two roles in one test:** a user places an order and an admin approves it. Make one context per role with \`browser.newContext({ storageState })\`. Use both pages. Close both contexts at the end. You can also wrap them in fixtures like \`adminPage\` and \`userPage\`.

**One account per worker:** sometimes tests change the account's data on the server, like a saved cart. Then workers that share one account will clash. The fix from the docs:
- Replace the \`storageState\` fixture with a **worker-scoped** fixture. Worker-scoped means it is made once per worker, not once per test.
- Inside it, \`test.info().parallelIndex\` gives each worker a number: 0, 1, 2 and so on. Use it to pick an account, like \`qa_user_0\` or \`qa_user_1\`.
- Log in once per worker and save the file in the project's \`outputDir\`. If the file already exists, reuse it.

\`parallelIndex\` is the right number. It always stays between 0 and workers−1, even when a crashed worker is replaced.

**Why testers care:** Each role and each worker has its own login, so parallel tests stop breaking each other's data.`,
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
        'One setup + one JSON file per role; test.use({ storageState }) per file or describe.',
        'Two roles in one test: one newContext per role, and you close them yourself.',
        'One account per worker: a worker fixture that uses parallelIndex, file saved in outputDir.',
      ],
      source: 'Playwright docs — Authentication (multiple roles, one account per parallel worker)',
    },
    {
      heading: 'API login, HTTP basic auth and session expiry',
      body: `**Example:** \`await request.post('/login', { form: {...} })\` then \`await request.storageState({ path })\` → you log in without opening any page, and save the login cookie.

**API login:** some apps log you in through an API call that sets a cookie. Then use the \`request\` fixture in setup. It is much faster than the form. A slow login page cannot break it.

**Watch out:** \`request\` only collects **cookies**. Some apps keep the login token in **localStorage**, set by page JavaScript. An API login does not create that. Then log in through the form once instead. Or put the token into localStorage yourself.

**Token in the response body:** some APIs return a token, like Restful Booker's \`POST /auth\` → \`{ token }\`. You send it back as a \`Cookie: token=...\` header. For API tests, keep it in a worker-scoped fixture (made once per worker), or set it with \`extraHTTPHeaders\`.

**HTTP Basic auth:** some sites show a browser pop-up asking for a user name and password. One example is \`the-internet.herokuapp.com/basic_auth\` (admin/admin). You cannot fill that pop-up like a form. Use \`use: { httpCredentials: { username, password } }\`.

**Logins expire:**
- A short login can expire during a long run. Keep runs short, and let the setup project run every time.
- Do not commit or keep auth files for days.
- If a test suddenly lands on the login page, check how old the state file is.
- Saving the file under \`test.info().project.outputDir\` is handy. That folder is cleaned on each run.
- **MFA/OTP** means a one-time code. Use a test account without MFA. Or create the code in setup from its secret. Or use an API that logs you in directly. Never try to automate SMS.

**Why testers care:** Fast, reliable logins in setup keep the real tests focused on the feature you are testing.`,
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
        'API login + request.storageState: the fastest setup when the login is a cookie.',
        'A token that page JavaScript puts in localStorage is NOT captured by an API login.',
        'Basic auth → use.httpCredentials. Logins expire, so create the state again every run.',
      ],
      source: 'Playwright docs — Authentication (API request, session storage); Test use options (httpCredentials)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-auth-config-cc-1',
      title: 'Logging in through the UI in all 240 tests',
      context: 'The suite has 240 SauceDemo tests in 12 files. Every file has a beforeEach that logs in through the form. The user name and password are typed right in the code. CI takes 14 minutes. When SauceDemo is slow, the login step itself times out, and the whole run turns red.',
      task: 'Change the framework so the login form is used only once per run. Tests must start logged in, but still stay separate from each other. The user name and password must come from environment variables. The login tests must still start logged out.',
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
        'Which Playwright feature saves the cookies and localStorage of a logged-in browser into a file, and loads them into new tests?',
        'Create tests/auth.setup.ts. It logs in once and saves the state. Add a "setup" project and make chromium depend on it.',
        'In the chromium project, set use.storageState and baseURL. Delete the beforeEach. Give the login tests an empty storageState.',
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
      explanation: `- **One login per run:** the setup project logs in once and writes \`playwright/.auth/user.json\`. 240 logins become 1.
- **Tests stay separate:** every test gets a **new context** (like a fresh private window) loaded from the file. A cart in one test never leaks into another test. SauceDemo keeps the cart in localStorage of each fresh context.
- **Clear failure:** if login breaks, the setup project fails. The tests that depend on it are **skipped**. You see one clear error, not 240 confusing ones.
- **Secrets:** the user name and password come from \`SAUCE_USER\` and \`SAUCE_PASS\`. \`dotenv\` loads them on your laptop; CI gives them as secrets. Add \`playwright/.auth\` and \`.env\` to \`.gitignore\`.
- **baseURL + testIdAttribute:** no repeated website address, and \`getByTestId\` reads SauceDemo's \`data-test\` attributes.
- **The login form is still tested** by its own tests, which start with an empty storageState.`,
      followUps: [
        {
          q: 'Roughly how much time does this save?',
          a: 'Say one form login takes about 3 s. Then 240 logins cost about 12 minutes of test time. With 4 workers, that is about 3 minutes of real time. After the change you pay for one login, about 3 s, in the setup project. Login is usually the biggest repeated cost in UI suites.',
        },
        {
          q: 'Why not save the file once and commit it, so CI does not need the setup step?',
          a: 'The file holds a live login cookie, which works like a password. Logins also expire. Committing it leaks access and causes random "logged out" failures when it gets old. Creating it again each run costs only seconds, and it is always fresh.',
        },
      ],
    },
    {
      id: 'pw-auth-config-cc-2',
      title: 'A config that fights the team',
      context: 'This config "works on my machine". But on CI the tests are slow. Retries hide real failures on the laptop. Passwords are in git. A forgotten test.only once made CI run 1 test and pass. And page.goto("/") fails, because baseURL is in the wrong place and is ignored.',
      task: 'Rewrite the config. Put each setting in the right part. Make CI and laptop runs behave sensibly. Read secrets from environment variables. Let the user pick the environment. Keep screenshots and traces that help debug failures.',
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
        'Which settings belong in use (browser and page setup) and which are runner settings? Where is baseURL read from?',
        'Use process.env.CI to switch retries, workers, forbidOnly and the evidence files between laptop and CI.',
        'Move the passwords to env vars loaded with dotenv. Create the saved login in a setup project, inside a gitignored folder.',
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
      explanation: `- **defineConfig + TypeScript:** a setting in the wrong place now shows an error. \`baseURL\` now sits inside \`use\`, so \`page.goto('/')\` works.
- **Timeout back to 30 s:** a 2-minute limit makes every stuck test cost 2 minutes. It also hides slow pages. Slow tests ask for more time with \`test.slow()\`.
- **Retries only on CI:** retrying on the laptop hides flaky tests from the person who can fix them. On CI, 2 retries + \`trace: 'on-first-retry'\` keep the pipeline moving and record evidence.
- **Workers:** the default on the laptop; a small fixed number on CI machines.
- **forbidOnly on CI** stops the "only 1 test ran and passed" accident.
- **Evidence files:** trace and video for every test slow the run and fill the disk. Keep them only for failures and retries.
- **headless** is removed, because it is already the default (no visible window). Use \`--headed\` or UI mode when debugging.
- **Secrets:** passwords come from \`.env.<TEST_ENV>\` or CI secrets, not from the config. The saved login is created by a setup project in \`playwright/.auth/\` (gitignored), not a committed \`auth.json\`.`,
      followUps: [
        {
          q: 'A test really needs 2 minutes, for example a large CSV export. How do you set that up?',
          a: 'Inside that test, call test.setTimeout(120_000). Or call test.slow() if 3 times the normal limit is enough. If a whole file is slow, use test.describe.configure({ timeout: 120_000 }) in it. The global limit stays 30 s, so all other tests still fail fast.',
        },
        {
          q: 'Why might someone set workers: 1, and what is the better fix?',
          a: 'Usually because tests clash on shared data or depend on running in order. workers: 1 hides this and makes the run much longer. The real fix is to keep tests separate: unique data per test, one account per worker with parallelIndex, and API setup instead of relying on earlier tests.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-auth-config-iq-01',
      difficulty: 'medium',
      question: 'How does one config file let your suite run on a laptop and on CI, against QA or staging, with the login reused? Explain it part by part: runner, use, projects.',
      whatInterviewerLooksFor: [
        'Knows the three parts: runner options, use and projects',
        'Knows the defaults and the CI settings, with reasons',
        'Mentions baseURL and secrets from environment variables',
        'Mentions the login setup project and evidence files (trace, screenshot)',
      ],
      modelAnswer: `I explain it in three parts.

**Runner options (which tests run and how)**
- \`fullyParallel: true\` — my tests are independent, so they can run at the same time.
- \`forbidOnly: !!process.env.CI\` — a forgotten \`test.only\` fails CI instead of running just one test.
- \`retries: process.env.CI ? 2 : 0\` — on my laptop I want to see flaky tests. On CI, retries keep the pipeline moving, and the report marks those tests as flaky.
- \`workers: process.env.CI ? 2 : undefined\` — the default is half the CPU cores. CI machines are small.
- \`reporter\` — HTML for people, JUnit for the CI dashboard.
- I keep the default **30 s test** and **5 s expect** limits. Slow tests get \`test.slow()\`.

**use (applies to every test)**
- \`baseURL\` comes from \`process.env.BASE_URL\`. \`TEST_ENV\` picks a \`.env.<env>\` file, loaded by dotenv. Tests use short paths like \`page.goto('/')\`.
- \`testIdAttribute: 'data-test'\`, because SauceDemo uses that attribute.
- \`trace: 'on-first-retry'\` and \`screenshot: 'only-on-failure'\` — evidence for failures, without slowing passing tests.

**projects**
- A \`setup\` project logs in once and saves \`playwright/.auth/user.json\`.
- \`chromium\` and \`firefox\` depend on \`setup\` and load that file.
- A \`smoke\` project with \`grep: /@smoke/\` for quick checks on pull requests.

Passwords never live in the config. They come from env vars. \`.env\` and \`playwright/.auth\` are gitignored.`,
      followUps: [
        {
          q: 'Where would you put a 10-second limit on single clicks?',
          a: 'In use: { actionTimeout: 10_000 }. By default, actions have no own limit. Only the 30 s test limit applies, so a stuck click shows a general test timeout. With actionTimeout, the error names the exact action that got stuck. That makes the cause much faster to find.',
        },
        {
          q: 'What wins if baseURL is set in top-level use, in a project and in test.use?',
          a: 'The most specific one wins. First test.use() in the file or describe, then the project\'s use, then the top-level use. So one describe block can point at a different website without changing the rest of the suite.',
        },
      ],
      pitfalls: [
        'Listing settings without saying why',
        'Raising the global timeout to "fix" flaky tests',
        'Passwords or website addresses typed into the config',
      ],
    },
    {
      id: 'pw-auth-config-iq-02',
      difficulty: 'medium',
      question: 'How do you avoid logging in through the form in every test? Explain storageState from start to end.',
      whatInterviewerLooksFor: [
        'Setup project + dependencies + use.storageState',
        'What the file holds and why it is gitignored',
        'Waiting until login is complete before saving',
        'How login tests start logged out; tests still stay separate',
      ],
      modelAnswer: `**Idea:** log in once, save the browser's login data to a file, and start every test from that file.

**Steps**
1. \`tests/auth.setup.ts\` (imported as \`setup\`) opens the login page. It fills the user name and password from env vars and clicks Login. Then it **waits for proof of login**, for example \`waitForURL('**/inventory.html')\`. Then it saves: \`await page.context().storageState({ path: 'playwright/.auth/user.json' })\`.
2. In the config, a \`setup\` project matches \`*.setup.ts\`. Each test project has \`dependencies: ['setup']\` and \`use: { storageState: 'playwright/.auth/user.json' }\`.
3. Tests just open protected pages. They are already logged in.

**What the file holds:** cookies and localStorage for each website. IndexedDB too, if I pass \`indexedDB: true\`. Not sessionStorage. For SauceDemo it is the \`session-username\` cookie. It is a live login, so \`playwright/.auth\` goes into \`.gitignore\`.

**Tests stay separate:** each test still gets a **fresh context**, only preloaded with the cookies. A cart one test fills does not leak into other tests.

**Login tests:** they use \`test.use({ storageState: { cookies: [], origins: [] } })\` to start logged out.

**Benefits:** many logins become one. If login breaks, setup fails and the other tests are skipped with one clear error. Setup also shows in the HTML report with a trace.`,
      followUps: [
        {
          q: 'What if tests change data on the server for the logged-in user, for example a saved address?',
          a: 'Then one shared account clashes across parallel workers. I switch to one account per worker. A worker-scoped fixture, keyed by parallelIndex, logs in as qa_user_<index> once and saves its own file. Each worker then has its own data on the server.',
        },
        {
          q: 'Why wait for an element before saving the state?',
          a: 'Many apps finish setting cookies during redirects after the click. If you save right away, you may save a half-logged-in state. Then every test lands on the login page. Waiting for the final URL or a logged-in element makes sure the saved state is complete.',
        },
      ],
      pitfalls: [
        'Thinking all tests share one page',
        'Committing the auth JSON file',
        'Forgetting dependencies, so the state file is old or missing',
      ],
    },
    {
      id: 'pw-auth-config-iq-03',
      difficulty: 'hard',
      question: 'What is the difference between globalSetup and a setup project with dependencies? Which do you use, and why?',
      whatInterviewerLooksFor: [
        'Knows both ways and how to write them',
        'Gives real advantages of project dependencies',
        'Knows what happens when setup fails, and --no-deps',
        'Knows the clean-up options for both',
      ],
      modelAnswer: `**globalSetup** is a file named in the config: \`globalSetup: require.resolve('./global-setup')\`. It exports one async function. It runs once before all tests. It can return a clean-up function, or you use \`globalTeardown\`. It runs **outside** the test runner. So there are no fixtures. For browser work you start \`chromium\` yourself, and config \`use\` settings are not applied.

**A setup project** is a normal project whose tests do the setup. Other projects list it in \`dependencies\`. Because it is a test:
- it shows in the **HTML report** as its own project;
- it records a **trace**, so a broken login on CI is easy to debug;
- it can use **fixtures** (\`page\`, \`request\`, \`baseURL\`) and gets config settings like \`testIdAttribute\`;
- a **teardown project** (\`teardown: 'cleanup'\`) can clean up after all dependent tests.

**Behaviour:** dependencies run first, even when I filter by file or grep. If setup fails, the dependent projects are **skipped**. \`--no-deps\` skips setup when I want that.

**My choice:** setup projects. The docs recommend them for login and test data. I would still use globalSetup for work that is not test-like, for example starting a Docker container. And \`webServer\` already covers "start my app".`,
      followUps: [
        {
          q: 'How does globalSetup pass data to tests?',
          a: 'Through process.env, which holds only strings, so use JSON.stringify for objects. Or by writing files, such as a storageState JSON. Setup projects usually pass data through files too, because each test runs in a separate worker process that does not share memory with the setup.',
        },
        {
          q: 'UI mode does not seem to log in. Why?',
          a: 'UI mode does not run the setup project by default, to keep runs fast. When the saved login is missing or expired, turn on the setup project in the project filter once, or run auth.setup.ts by hand. Then turn it off again.',
        },
      ],
      pitfalls: [
        'Saying they are the same',
        'Not knowing that a failed dependency skips the dependent projects',
        'Using globalSetup and then having no trace of the failing login',
      ],
    },
    {
      id: 'pw-auth-config-iq-04',
      difficulty: 'medium',
      question: 'Your app has admin and customer roles. How do you test both? Include a flow where the admin must act on something the customer just did.',
      whatInterviewerLooksFor: [
        'One saved login per role, made in setup',
        'test.use per file or describe',
        'Several contexts in one test, closed at the end',
        'Optional role fixtures with page objects',
      ],
      modelAnswer: `**Setup:** \`auth.setup.ts\` has two setup tests. "authenticate as admin" saves \`playwright/.auth/admin.json\`. "authenticate as customer" saves \`playwright/.auth/customer.json\`. Both passwords come from env vars.

**Role per file:** the project uses the customer file by default. Admin test files change it at the top: \`test.use({ storageState: 'playwright/.auth/admin.json' })\`. I can also switch the role per \`test.describe\`.

**Both roles in one test** (the customer places an order, the admin approves it):
- \`const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' })\`
- \`const customerContext = await browser.newContext({ storageState: 'playwright/.auth/customer.json' })\`
- I open a page in each. The customer places the order and I read the order id. The admin page checks that the order is visible and approves it. Then the customer page shows "Approved".
- I close both contexts in a \`finally\` block. Playwright does not close contexts I create myself.

**Cleaner with fixtures:** \`adminPage\` and \`customerPage\` fixtures create the context with the right file, give the page to the test, and close the context afterwards. The test then reads \`async ({ adminPage, customerPage }) => {...}\`.

I also test the negative case: a customer gets a 403 or a redirect on admin pages.`,
      followUps: [
        {
          q: 'Should the admin and customer contexts share one browser?',
          a: 'Yes. Both come from the same browser, which is made once per worker and is cheap to reuse. The roles are kept apart at the context level. Each context has its own cookies and storage, just like two separate browser profiles on one computer.',
        },
        {
          q: 'How would you test that a customer cannot open an admin page?',
          a: 'Load the customer\'s saved login, open the admin URL, and check what the app does: a redirect to the customer area or a 403 page. Also call the admin API with the customer login through context.request and expect 403. Hiding a button in the UI alone is not security.',
        },
      ],
      pitfalls: [
        'Logging out and in again inside one context',
        'Forgetting to close contexts you created yourself',
        'Testing only the positive role paths',
      ],
    },
    {
      id: 'pw-auth-config-iq-05',
      difficulty: 'easy',
      question: 'How do you run the same Playwright suite against QA and staging without changing code? How do you keep passwords safe?',
      whatInterviewerLooksFor: [
        'Environment variables and dotenv',
        'A switch variable such as TEST_ENV',
        'CI secrets, .gitignore, .env.example',
        'Optional projects per environment',
      ],
      modelAnswer: `**How it works**
- Everything that changes per environment is an **environment variable**: \`BASE_URL\`, user names, passwords, API keys.
- On my laptop I keep \`.env.qa\` and \`.env.staging\`. Both are gitignored. The config reads \`TEST_ENV\` (default \`qa\`) and loads the right file with \`dotenv.config({ path: path.resolve(__dirname, '.env.' + ENV) })\`.
- \`use.baseURL = process.env.BASE_URL\`. Tests use short paths like \`page.goto('/inventory.html')\`.
- At the top of the config I check the required variables. If one is missing, I stop with a clear error.
- To run: \`TEST_ENV=staging npx playwright test\`.

**On CI**
- There is no \`.env\` file. The pipeline gives the same names from its secrets, for example GitHub Actions \`env: SAUCE_PASS: \${{ secrets.SAUCE_PASS }}\`.
- Each CI stage sets its own \`TEST_ENV\`.

**Safety**
- \`.env*\` files (except \`.env.example\`) and \`playwright/.auth\` are in \`.gitignore\`.
- \`.env.example\` lists the names without values.
- I never print secrets in logs, test titles or attachments.

SauceDemo's \`standard_user\`/\`secret_sauce\` are public. I still follow this pattern, so the habit is right for real apps.

**Another option:** separate \`staging\` and \`production\` projects, with their own \`baseURL\` and \`retries\`, when both must run in one go.`,
      followUps: [
        {
          q: 'What is the risk if process.env.PASSWORD is undefined?',
          a: 'fill() needs a string. The test may type "undefined" into the form, or throw a type error deep inside a test. The failure is then confusing. Checking the required variables in the config stops the run at once, with a message naming the missing variable and environment.',
        },
        {
          q: 'Would you run tests that change data against production?',
          a: 'No. Production gets a small read-only smoke set, tagged for example @prod-safe, with zero retries and no new data. It often has its own project. Anything that creates orders or changes data runs only in QA or staging.',
        },
      ],
      pitfalls: [
        'Committing .env files',
        'if/else on environment names spread through the tests',
        'Full website addresses typed into test files',
      ],
    },
    {
      id: 'pw-auth-config-iq-06',
      difficulty: 'hard',
      question: 'After moving to storageState, tests pass on your laptop. But on CI about half of them land on the login page. How do you debug this?',
      whatInterviewerLooksFor: [
        'Checks that the setup project ran and passed',
        'Checks the saved state is complete and saved at the right time',
        'Thinks about expiry, website address (domain) and sessionStorage/IndexedDB',
        'Uses traces and other evidence',
      ],
      modelAnswer: `First I collect evidence, then I check the likely causes.

**Evidence:** I open the HTML report and the trace of a failing test. In the network tab I check: was the login cookie sent? Which redirect happened? I also open the setup project's trace. I check the saved JSON as a CI file (without sharing it publicly).

**Likely causes**
1. **Setup did not run.** The project has no \`dependencies: ['setup']\`. Or CI runs \`--project=chromium --no-deps\` and uses an old file. Fix the config or the command.
2. **State saved too early.** Setup clicked Login and saved before the redirect set the final cookie. Fix: \`waitForURL\` or check a logged-in element before \`storageState()\`.
3. **Different website address.** Setup logged in on \`app.qa.example.com\`, but tests use another host (or http instead of https). The cookies do not apply. Use the same \`baseURL\` for both.
4. **Login stored somewhere else.** The token is in **sessionStorage** (not saved) or **IndexedDB** (needs \`indexedDB: true\`).
5. **Expiry.** A short login expires during a long CI run. Or CI restored an old auth file from an earlier pipeline. Create it fresh each run.
6. **The server logs out old sessions.** Some apps allow one session per user. Another worker or job logs in with the same account and kills the earlier session. Use one account per worker.

"About half" points to timing or account clashes, not a missing file. So I look hardest at 2, 5 and 6. I confirm with \`--repeat-each\` and the timestamps in the trace.`,
      followUps: [
        {
          q: 'How do you check whether the app keeps the login in sessionStorage?',
          a: 'Log in by hand with DevTools open. Look at Application → Storage. See which cookies, localStorage, sessionStorage or IndexedDB entries appear after login. Or, in a Playwright script, run JSON.stringify(sessionStorage) after login. If the token is only in sessionStorage, use the docs workaround with addInitScript.',
        },
        {
          q: 'How would you make an expired login fail clearly instead of with random locator errors?',
          a: 'Add an automatic fixture, or a check in the main page objects. After opening a page, if the URL is the login page, throw "Login expired or storageState invalid", with the file\'s timestamp. One clear message saves a lot of debugging time.',
        },
      ],
      pitfalls: [
        'Turning on retries to make it pass',
        'Going back to form login everywhere without finding the cause',
        'Not checking that setup really ran on CI',
      ],
    },
    {
      id: 'pw-auth-config-iq-07',
      difficulty: 'expert',
      question: 'The app allows only one active login per user. Tests change the user\'s cart on the server. With 6 workers and one shared storageState, tests fail at random. Design the login strategy.',
      whatInterviewerLooksFor: [
        'Sees both problems: logins kicking each other out, and shared server data',
        'One account per worker with parallelIndex',
        'Details: a worker fixture that replaces storageState, files in outputDir, reusing the file',
        'Creating the accounts, cleaning up, and sharding on CI',
      ],
      modelAnswer: `**Why it fails:** with one account, (a) every new login can log out the other workers, and (b) all workers add to and empty the same cart on the server. The result depends on timing.

**Design: one account per worker**
- Create accounts \`qa_cart_0 … qa_cart_N\`, with N at least the number of workers. Best through an admin API in a setup project, or created once and documented.
- In \`fixtures/auth.ts\`, replace the built-in \`storageState\` fixture with a worker-scoped \`workerStorageState\` fixture (made once per worker):
  - \`const id = test.info().parallelIndex\` — it stays between 0 and workers−1, and a replacement worker gets the same number;
  - file = \`path.resolve(test.info().project.outputDir, '.auth/' + id + '.json')\`; if it exists, reuse it;
  - otherwise open \`browser.newPage({ storageState: undefined })\`, log in as \`qa_cart_\${id}\`, wait for proof of login, save, close the page.
- Test files import \`test\` from this fixtures file.
- Each worker logs in once and has its own account. No login is kicked out, and carts do not clash.

**Per test:** a test fixture empties the cart through the API before each test. So tests in the same worker do not depend on each other.

**Sharding on CI:** sharding splits the suite across machines. Each machine's workers start again at \`parallelIndex\` 0. So two machines would use the same accounts. Add the shard number to the account name (from an env var set by CI), or give each machine its own account range.

**Hygiene:** files in \`outputDir\` are cleaned before each run. Passwords come from env vars.`,
      followUps: [
        {
          q: 'Why parallelIndex and not workerIndex?',
          a: 'workerIndex goes up every time a worker restarts after a failure. With 6 workers it can reach 10 or more, and run past a pool of 6 accounts. parallelIndex stays between 0 and workers−1, and the new worker takes over the old number. So it fits a fixed list of accounts.',
        },
        {
          q: 'Could you avoid the login form completely here?',
          a: 'Yes, if the app has a login API that sets the login cookie. The worker fixture can log in with playwright.request.newContext and save context.storageState(). That is faster and less flaky. Keep one form-login test so the login page itself is still covered.',
        },
      ],
      pitfalls: [
        'Setting workers: 1 as the solution',
        'Using workerIndex for the account list',
        'Forgetting that shards reuse the same parallelIndex numbers',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-auth-config-drill-1',
      question: 'A suite has 300 tests, 3 browser projects and 6 workers. One form login takes 4 s. Count the logins and the total login time per run for: (a) login in beforeEach, (b) one setup project + storageState shared by all projects, (c) one account per worker with a worker fixture, and a separate state folder per project.',
      assumptions: [
        '300 tests × 3 projects = 900 test runs per run; no retries.',
        'All 6 workers run tests in every project.',
        'In (c) each project has its own outputDir, so each worker logs in once per project.',
      ],
      steps: [
        {
          label: '(a) beforeEach',
          calc: '900 executions × 1 login = 900 logins × 4 s = 3,600 s (60 min of test time; ≈ 10 min wall at 6 workers)',
        },
        {
          label: '(b) setup project',
          calc: '1 login × 4 s = 4 s (runs once before all dependent projects)',
        },
        {
          label: '(c) per-worker accounts',
          calc: '6 workers × 3 projects = 18 logins × 4 s = 72 s total (≈ 12 s wall)',
        },
        {
          label: 'Logins saved (a → b)',
          calc: '900 − 1 = 899 logins, ≈ 3,596 s of test time',
        },
      ],
      answer: '(a) **900 logins, about 60 min of test time (about 10 min of real time)**. (b) **1 login, 4 s**. (c) **18 logins, about 72 s in total (about 12 s of real time)**. storageState saves about 899 logins per run.',
      insight: 'Login is often the biggest repeated cost in a UI suite. Log in as rarely as you can while tests stay separate: once per run if tests only read data, once per worker if they change the account\'s data.',
      followUps: [
        {
          q: 'With retries: 2 and 5% of tests retried once, how many extra logins does (a) cost? And (b)?',
          a: '(a) 5% of 900 = 45 extra test runs, each with a login. That is 45 more logins, about 3 more minutes of test time. (b) zero, because retries reuse the saved state file. The setup project does not run again for retried tests.',
        },
      ],
    },
    {
      id: 'pw-auth-config-drill-2',
      question: 'Work out the final baseURL, retries, timeout and storageState for the test "approve order". Config: top-level timeout 30000, retries 1, use { baseURL: "https://qa.shop.test", storageState: "playwright/.auth/user.json" }. Project "staging": retries 2, use { baseURL: "https://staging.shop.test" }. The spec runs under project "staging". At the file top: `test.use({ storageState: "playwright/.auth/admin.json" })`. Inside describe "approvals": `test.describe.configure({ timeout: 60000 })`. The test "approve order" calls `test.slow()`.',
      assumptions: [
        'Most specific wins: test.use > project use > top-level use. describe.configure overrides the project/config timeout inside that describe.',
        'test.slow() makes the current timeout 3 times longer for that test.',
      ],
      steps: [
        {
          label: 'baseURL',
          calc: 'top-level qa → overridden by project staging → no test.use for baseURL ⇒ https://staging.shop.test',
        },
        {
          label: 'storageState',
          calc: 'top-level user.json → project does not set it → file-level test.use admin.json ⇒ admin.json',
        },
        {
          label: 'retries',
          calc: 'top-level 1 → project 2 → no describe override ⇒ 2',
        },
        {
          label: 'timeout',
          calc: '30,000 → describe.configure 60,000 → test.slow() × 3 ⇒ 180,000 ms',
        },
      ],
      answer: '**baseURL** https://staging.shop.test · **storageState** playwright/.auth/admin.json · **retries** 2 · **timeout** 180 s.',
      insight: 'Settings stack from general to specific: config → project → file/describe → test. Read them in that order. This answers almost every "why does this test behave differently?" question.',
      followUps: [
        {
          q: 'How can you check the final values while the test runs?',
          a: 'Inside the test, log testInfo.timeout, testInfo.project.retries and testInfo.project.use.baseURL. Or read the baseURL fixture directly. testInfo shows the final values for that exact test.',
        },
      ],
    },
    {
      id: 'pw-auth-config-drill-3',
      question: 'For each case, which limit fails first, and with what kind of message? Defaults: test timeout 30 s, expect 5 s, actionTimeout 0. The config adds actionTimeout 10 s. (1) A click on a button covered by a spinner for 20 s. (2) expect(badge).toHaveText("2") while the badge shows "1" forever. (3) page.goto to a page that takes 40 s to load, with no navigationTimeout set. (4) A test with 8 assertions, each passing after 4.5 s.',
      assumptions: [
        'actionTimeout applies to actions like click and fill, not to goto. navigationTimeout is a separate setting and is not set.',
        'Every single limit is also capped by the time left in the test.',
      ],
      steps: [
        {
          label: '(1) click',
          calc: 'Playwright waits for the button to be clickable; the 10 s actionTimeout is shorter than the 20 s spinner ⇒ the click fails at 10 s with an action timeout that names the locator',
        },
        {
          label: '(2) assertion',
          calc: 'expect keeps checking for 5 s ⇒ the assertion fails at 5 s: expected "2", received "1"',
        },
        {
          label: '(3) goto',
          calc: 'navigationTimeout 0 = no own limit; the 30 s test timeout comes first ⇒ "Test timeout of 30000ms exceeded" during goto',
        },
        {
          label: '(4) many slow assertions',
          calc: 'each one is under 5 s and passes, but 8 × 4.5 = 36 s > 30 s ⇒ test timeout during the 7th assertion',
        },
      ],
      answer: '(1) **action timeout at 10 s**; (2) **expect timeout at 5 s**; (3) **test timeout at 30 s** (no navigation limit set); (4) **test timeout at 30 s**, even though every single assertion was within its limit.',
      insight: 'Small, specific limits give clear error messages. The test timeout is the total budget for the test. Set action and navigation limits to get clear failures. Fix slow steps instead of raising the global timeout.',
      followUps: [
        {
          q: 'How would you change the config so case (3) fails with a navigation message?',
          a: 'Set use: { navigationTimeout: 15_000 }. Then page.goto fails after 15 s with a navigation timeout that names the URL. That is well before the 30 s test limit, and it points straight at the slow page.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-auth-config-mcq-01',
      difficulty: 'easy',
      question: 'The config has no timeout settings. What are the default test timeout and expect timeout?',
      options: ['30 s and 5 s', '60 s and 10 s', '30 s and 30 s', 'No test timeout and 5 s'],
      correct: [0],
      explanation: 'By default, one test may take 30,000 ms, and one `expect` keeps checking for 5,000 ms. 60/10 and 30/30 are common guesses, but they are wrong. "No limit" is the default for actionTimeout and navigationTimeout, not for the test itself.',
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
      explanation: 'baseURL is a `use` setting, so at the top level it is ignored. Then "/inventory.html" has no website address in front. page.goto does accept short paths when baseURL is set. trace has nothing to do with it, and testDir may be a relative path.',
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
      explanation: 'The saved file holds live login cookies and storage. Anyone with it can act as that user until the login expires. So committing it leaks access, like a password. The files are small JSON, not large files. Playwright does not check git, and npm install does not touch this folder.',
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
      question: 'auth.setup.ts runs and passes. But tests in the chromium project still start on the login page. What is missing?',
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
        'storageState: \'playwright/.auth/user.json\' in the chromium project\'s use',
        'teardown: "setup" on the chromium project',
        'fullyParallel: false, because storageState only works serially',
        'A globalSetup entry pointing at auth.setup.ts',
      ],
      correct: [0],
      explanation: '`dependencies` only makes setup run first. The test project must also load the saved file with use.storageState. teardown is for clean-up projects. storageState works fine with tests running at the same time. Adding globalSetup would only log in a second time.',
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
      question: 'The project loads a logged-in storageState for all tests. What does test.use({ storageState: { cookies: [], origins: [] } }) at the top of login.spec.ts do?',
      options: [
        'Deletes the saved user.json file from disk',
        'Makes the tests in that file start with an empty, logged-out browser state',
        'Logs the user out on the server for every other test too',
        'Disables cookies entirely for the file, so login can never work',
      ],
      correct: [1],
      explanation: 'It replaces the saved login with an empty one, for that file only. So those tests start logged out and can test the login form. It does not delete the file on disk. It does not log anyone out on the server. Cookies still work normally after the test logs in.',
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
      question: 'Select ALL the things BrowserContext.storageState() can save.',
      options: [
        'Cookies',
        'localStorage for each origin',
        'IndexedDB, when called with { indexedDB: true }',
        'sessionStorage',
        'The currently open tabs and their URLs',
      ],
      correct: [0, 1, 2],
      explanation: 'storageState saves cookies and localStorage. It also saves IndexedDB if you ask for it, which helps with Firebase-style login. sessionStorage is not saved; the docs show a manual workaround. Open tabs and their URLs are not part of the state either.',
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
      question: 'Top-level use sets baseURL to the QA site. The "staging" project sets baseURL to the staging site. One describe calls test.use({ baseURL: "http://localhost:3000" }). You run --project=staging. Which baseURL do tests in that describe get?',
      options: [
        'The QA host',
        'The staging host',
        'http://localhost:3000',
        'It throws because baseURL is defined three times',
      ],
      correct: [2],
      explanation: 'The most specific setting wins. test.use in a describe beats the project\'s use, which beats the top-level use. So that describe gets localhost. Tests outside it still get the staging site. Setting baseURL at several levels is normal and does not throw an error.',
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
      question: 'The config has retries: process.env.CI ? 2 : 0. A test always fails. How many times does it run on your laptop and on CI?',
      options: ['1 locally, 2 on CI', '1 locally, 3 on CI', '3 locally, 3 on CI', '0 locally, 2 on CI'],
      correct: [1],
      explanation: 'retries counts the extra runs after the first one. On the laptop retries is 0, so the test runs once. On CI it runs once plus 2 retries, so 3 times. "2 on CI" forgets the first run. "0 runs" is impossible for a test you selected.',
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
      question: 'The setup project fails because the login page is down. The chromium and firefox projects both depend on setup. What happens to their 200 tests?',
      options: [
        'They run anyway and each fails on the login page',
        'They are skipped, and the report shows the single setup failure',
        'Playwright retries the setup project until it passes',
        'They run with the previous run\'s state file if it exists',
      ],
      correct: [1],
      explanation: 'When a dependency project fails, the projects that depend on it do not run. Their tests are skipped. You get one clear failure instead of 200. Setup is not retried forever; only the normal retries setting applies. Old state files are not used, because the dependent projects never start.',
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
      question: 'Select ALL the real advantages of a setup project over globalSetup for logging in.',
      options: [
        'It appears in the HTML report as its own project',
        'It can record a trace using the normal trace setting',
        'It can use fixtures like page and request, and config use options apply',
        'It is the only way to save storageState to a file',
        'It never needs to log in again when the session expires',
      ],
      correct: [0, 1, 2],
      explanation: 'The docs give three reasons to prefer setup projects: they show in the report, they record traces, and they get fixtures and config settings. globalSetup can also save storageState; the docs show an example. Neither way solves expired logins by magic. Both simply run before the tests each time.',
      followUps: [
        {
          q: 'How do you clean up after a setup project?',
          a: 'Add teardown: \'cleanup\' to the setup project and define a \'cleanup\' project matching *.teardown.ts. It runs after all projects that depend on setup have finished.',
        },
      ],
    },
    {
      id: 'pw-auth-config-mcq-11',
      difficulty: 'hard',
      question: 'npm run dev is already running the app on port 3000. What happens when you run the tests on your laptop (CI is not set)?',
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
      explanation: 'On the laptop, reuseExistingServer is true. The URL already answers, so Playwright uses your running app. On CI it is false, so Playwright always starts its own app, and fails if the port is already busy. It never stops your app. webServer does not depend on baseURL.',
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
      question: 'In the official one-account-per-worker pattern, why is the state file named with test.info().parallelIndex and not workerIndex?',
      options: [
        'parallelIndex is a string, which file names require',
        'parallelIndex stays within 0..workers-1 and is reused by a replacement worker, so it maps onto a fixed account pool',
        'workerIndex is only available in afterAll hooks',
        'parallelIndex is unique across shards on different machines',
      ],
      correct: [1],
      explanation: 'After a failure, Playwright starts a new worker. It gets a new, higher workerIndex, but the same parallelIndex. So parallelIndex fits a fixed list of accounts. Both are numbers, not strings. workerIndex is available wherever testInfo is. parallelIndex values repeat across shards, so they are not unique there.',
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
      question: 'The setup below runs without errors. Yet UI tests that load api-user.json land on the login page. The app\'s page calls /api/login and then stores the token (a JWT) in localStorage. Why does this fail?',
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
      explanation: 'The `request` fixture saves only the cookies it received. Here the token came back in the response body. Normally the page\'s JavaScript would put it into localStorage, but no page ran. So the saved file is empty. API login works when the server sets a login cookie. You could also write the token into the file\'s localStorage part yourself. The method is not limited to GET, and a JWT can be saved like any other value.',
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
      question: 'On QA, logins expire after 15 minutes. The CI suite takes 40 minutes. Select ALL the changes that fix the "logged out" failures late in the run.',
      options: [
        'Shard the suite so each machine finishes within the session lifetime, each running its own setup project',
        'Always run the setup project at the start of every CI job instead of restoring a cached state file',
        'Commit a fresh storageState file to git every morning',
        'Ask for a longer session lifetime in the QA environment configuration for test accounts',
        'Raise the test timeout to 40 minutes',
      ],
      correct: [0, 1, 3],
      explanation: 'Shorter runs per machine, a fresh login at the start of every job, and a longer login lifetime for test accounts all fix the expiry. A committed state file leaks a credential, and it is already hours old when used. A longer test timeout does not change how long the server keeps the login alive.',
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
      question: 'https://the-internet.herokuapp.com/basic_auth shows a browser pop-up asking for a user name and password. Which config makes this test pass?',
      code: {
        language: 'typescript',
        code: `test('basic auth', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/basic_auth');
  await expect(page.getByText('Congratulations!')).toBeVisible();
});`,
      },
      options: [
        'use: { httpCredentials: { username: \'admin\', password: \'admin\' } } (values from env vars)',
        'use: { storageState: { cookies: [{ name: \'auth\', value: \'admin:admin\' }] } }',
        'page.on("dialog", d => d.accept("admin")) inside the test',
        'use: { extraHTTPHeaders: { \'X-Basic\': \'admin:admin\' } }',
      ],
      correct: [0],
      explanation: 'For HTTP Basic auth, the browser answers the pop-up with a user name and password. Playwright gives them through the httpCredentials setting. The pop-up is not a JavaScript dialog, so page.on("dialog") does not see it. A made-up cookie does nothing. A custom header name is not the Authorization header the server expects.',
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
