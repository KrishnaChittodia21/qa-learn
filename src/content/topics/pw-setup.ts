import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-setup',
  phase: 'pw-basics',
  order: 1,
  title: 'Playwright Setup, Architecture & Tooling',
  subtitle:
    'What Playwright is and how it differs from Selenium and Cypress, the browser → context → page model, installing with npm init playwright, reading playwright.config.ts, writing and running your first test, and the tools (CLI, UI mode, codegen, VS Code, HTML report) you will use every day.',
  estimatedMinutes: 85,
  sources: [
    'Playwright docs — Installation (playwright.dev/docs/intro)',
    'Playwright docs — Writing tests (playwright.dev/docs/writing-tests)',
    'Playwright docs — Running and debugging tests (playwright.dev/docs/running-tests)',
    'Playwright docs — Test configuration (playwright.dev/docs/test-configuration)',
    'Playwright docs — Command line (playwright.dev/docs/test-cli)',
    'Playwright docs — UI Mode (playwright.dev/docs/test-ui-mode)',
    'Playwright docs — Test generator / codegen (playwright.dev/docs/codegen)',
    'Playwright docs — Isolation / Browser contexts (playwright.dev/docs/browser-contexts)',
    'Playwright docs — Best practices (playwright.dev/docs/best-practices)',
    'Playwright docs — TypeScript (playwright.dev/docs/test-typescript)',
    "Debbie O'Brien — debbie.codes blog (Playwright team)",
    'Selenium docs — WebDriver & Selenium Manager (selenium.dev/documentation)',
    'Cypress docs — Trade-offs & Cross-origin (docs.cypress.io)',
    'TestDino — Playwright interview questions & answers 2026; Testleaf — Top Playwright interview questions 2025',
  ],
  tags: ['playwright', 'setup', 'architecture', 'browser-context', 'config', 'cli', 'ui-mode', 'codegen', 'vs-code', 'html-report', 'selenium', 'cypress'],
  cheatSheet: [
    'Install: `npm init playwright@latest` → picks TS/JS, tests folder, optional GitHub Actions workflow, downloads Chromium + Firefox + WebKit; on CI/Linux use `npx playwright install --with-deps`.',
    'Created files: `playwright.config.ts`, `package.json` (+ lock file), `tests/example.spec.ts`, and `.github/workflows/playwright.yml` if you said yes.',
    'Object model: Browser (one process) → BrowserContext (incognito-like profile: own cookies, localStorage) → Page (a tab). Each test gets a fresh context + page from the fixtures.',
    'Test anatomy: `import { test, expect } from \'@playwright/test\'` → `test(\'title\', async ({ page }) => { await page.goto(...); await expect(locator).toBeVisible(); })`. Every Playwright call is awaited.',
    'Config defaults: test timeout 30s, expect timeout 5s, no action/navigation timeout, retries 0, workers = half the logical CPU cores; the template adds `fullyParallel: true`, `retries: CI ? 2 : 0`, `trace: \'on-first-retry\'`, `reporter: \'html\'`.',
    'Top-level config = runner options (testDir, timeout, retries, workers, reporter, projects, webServer); `use` = browser/page options (baseURL, trace, screenshot, video, headless, testIdAttribute, viewport).',
    'Run: `npx playwright test` (all, headless, every project) · `tests/login.spec.ts:12` (one test by line) · `-g "checkout"` (by title/tag) · `--project=chromium` · `--headed` · `--last-failed` · `--list` · `-x`.',
    'Debug/explore: `--ui` (watch mode + time-travel timeline + pick locator) · `--debug` (Inspector, headed, 1 worker, no timeout) · `npx playwright codegen <url>` (record actions & assertions).',
    'Report: HTML report in `playwright-report/` (opens automatically on failure); `npx playwright show-report` serves it on port 9323; raw artifacts (traces, screenshots, videos) live in `test-results/`.',
    'TypeScript works with zero setup, but Playwright only strips types; run `npx tsc --noEmit` and the `@typescript-eslint/no-floating-promises` rule on CI to catch type errors and missing `await`s.',
    'vs Selenium: no drivers, auto-waiting built in, contexts for cheap isolation, free parallelism/sharding, trace viewer. vs Cypress: runs outside the browser, so multi-tab, multi-origin, iframes and WebKit are first-class.',
    'Keep it current: `npm install -D @playwright/test@latest` then `npx playwright install --with-deps`; check with `npx playwright --version`.',
  ],
  sections: [
    {
      heading: 'What Playwright is (and what it is not)',
      body: `**Intuition:** Playwright is a robot that drives a real browser exactly like a careful manual tester would: it opens a page, waits until a button is really clickable, clicks it, and then checks what the user would see. The difference is that it does it in seconds, in three browser engines, and the same way every time.

**Precisely:** Playwright is an open-source browser automation framework from Microsoft (first released in 2020 by engineers who had earlier built Google's Puppeteer). It ships in two layers:

| Layer | Package | What you get |
|---|---|---|
| **Playwright Test** (what this course uses) | \`@playwright/test\` | A full test runner: \`test\`/\`expect\`, fixtures, parallel workers, retries, projects, reporters, UI mode, trace viewer |
| **Playwright Library** | \`playwright\` | Just the browser-automation API (launch, contexts, pages). You bring your own runner (Jest, Mocha) or write scripts and scrapers |

**Browsers:** Chromium (Chrome, Edge), Firefox and WebKit (the engine behind Safari), plus device emulation for mobile Chrome and Mobile Safari. Playwright downloads its own tested browser builds, so you never install or match a "driver" by hand.

**Languages:** TypeScript/JavaScript, Python, Java and .NET. The \`@playwright/test\` runner itself is the Node.js flavour; Python uses a pytest plugin, Java and .NET use JUnit/TestNG or NUnit/MSTest. Interview tip: the most complete feature set (fixtures, UI mode, sharding, HTML report) lives in the TypeScript/Node runner.

**What it covers:** UI end-to-end tests, API tests (the \`request\` fixture), network mocking, visual comparisons, accessibility checks with plugins, and component testing (experimental). **What it is not:** a load-testing tool (use k6/JMeter), a native mobile-app tool (use Appium), or a replacement for unit tests.

**Common mistake:** saying "Playwright is a Selenium wrapper". It is not; it talks to browsers through its own protocol connections, not through WebDriver.

**In interviews, say this:** "Playwright is a cross-browser end-to-end framework with a built-in test runner. Its big wins for me as a tester are auto-waiting, isolated browser contexts per test, and debugging tools like UI mode and the trace viewer."`,
      keyPoints: [
        '`@playwright/test` = runner + assertions + fixtures; `playwright` = automation library only.',
        'Chromium, Firefox and WebKit from one API; browsers are downloaded by Playwright, no drivers.',
        'Supports TS/JS, Python, Java, .NET; the Node runner has the richest tooling.',
      ],
      source: 'Playwright docs — Installation & Library vs Test',
    },
    {
      heading: 'Playwright vs Selenium vs Cypress',
      body: `**Intuition:** Selenium is the long-established universal remote (works with everything, but you assemble the parts). Cypress lives *inside* the browser next to your app (great developer experience, but it sees the world through one tab). Playwright stands *outside* the browser and controls it directly (one tool that covers many tabs, origins and engines).

| Dimension | Playwright | Selenium (4.x) | Cypress |
|---|---|---|---|
| How it talks to the browser | Persistent connection to the browser over its own protocol (CDP for Chromium, patched Firefox/WebKit builds) | W3C WebDriver protocol (HTTP) through a browser driver; WebDriver BiDi being added | Test code runs **inside** the browser alongside the app, plus a Node process |
| Languages | TS/JS, Python, Java, .NET | Java, Python, C#, JavaScript, Ruby (plus community bindings) | JavaScript/TypeScript only |
| Browsers | Chromium, Firefox, WebKit (Safari engine) | Chrome, Edge, Firefox, Safari, legacy IE | Chrome-family, Firefox; WebKit is experimental |
| Waiting | Auto-waits for actionability before each action; web-first assertions retry | You write implicit/explicit waits yourself | Built-in retry-ability of commands and assertions |
| Multi-tab / popups | Yes, first-class (\`context.waitForEvent('page')\`) | Yes, via window handles | No multi-tab support |
| Multiple origins in one test | Yes | Yes | Supported via \`cy.origin()\` with restrictions |
| iframes | \`frameLocator()\` / \`contentFrame()\` | \`switchTo().frame()\` | Needs workarounds or plugins |
| Isolation | New browser context per test (cheap, milliseconds) | Usually a new browser session per test (slow) or manual cleanup | Clears state between tests in the same browser |
| Parallelism | Built-in workers and \`--shard\`, free | Selenium Grid / cloud providers | Parallelisation through Cypress Cloud (paid) or third-party tools |
| Network mocking | \`page.route()\` built in | Limited (BiDi/CDP in newer versions) | \`cy.intercept()\` built in |
| Debugging | UI mode, Inspector, trace viewer, HTML report | IDE debugger, screenshots, Grid logs | Time-travel runner UI |
| Mobile | Device emulation (viewport, touch, UA) | Real devices via Appium | Viewport emulation |

**When to pick which (honest answer):**

- **Playwright:** new web projects, teams who want cross-browser + API + mocking in one free tool, and anyone who must test Safari behaviour on Linux CI.
- **Selenium:** large existing Java/C# suites, organisations with an established Grid, or when you need real mobile devices through Appium and a single WebDriver skill set.
- **Cypress:** front-end teams who live in JavaScript, test one origin at a time, and value its interactive runner.

**Common mistake:** claiming one tool is "best" for everything. Interviewers want trade-offs: "We had 600 Selenium Java tests and a Java team; rewriting would cost a quarter. For the *new* React app, I would start with Playwright because…"`,
      keyPoints: [
        'Playwright: outside the browser, auto-waiting, contexts, free parallelism, trace viewer.',
        'Selenium: WebDriver standard, most languages, Grid/Appium ecosystem; you manage waits.',
        'Cypress: inside the browser, JS only, no multi-tab, strong interactive runner.',
      ],
      source: 'Playwright docs — Why Playwright / Browsers; Selenium docs — WebDriver; Cypress docs — Trade-offs; Checkly — Playwright guides',
    },
    {
      heading: 'Architecture: browser → context → page',
      body: `**Intuition:** think of a hotel. The **browser** is the building (expensive to build, you start one). A **browser context** is a guest room with its own key, its own minibar and its own luggage (cookies, localStorage, sessionStorage, cache, permissions). A **page** is a window inside that room (a tab). Two rooms never share luggage, even though they are in the same building.

**Mechanics:**

1. The test runner (Node.js) starts one **worker process** per parallel slot.
2. Each worker launches a **browser** for its project (for example Chromium) and keeps the connection open over a WebSocket-style pipe, so commands do not pay an HTTP round-trip each.
3. For **every test**, the built-in \`context\` fixture creates a brand-new **BrowserContext**, and the \`page\` fixture opens one **Page** in it. When the test ends, the context is thrown away.

Because a context is "fast and cheap" (milliseconds, not the seconds a new browser costs), Playwright can give each test a clean, incognito-like profile. That is why test order does not matter and why tests can run in parallel safely.

**Two users in one test:** create two contexts from the \`browser\` fixture. They are as separate as two different laptops. Use **two pages in the same context** only when you want the *same* user in two tabs (they share the login cookie).

| Need | Use |
|---|---|
| Fresh user per test | Default \`page\` fixture (new context each test) |
| Buyer and seller chatting in one test | \`browser.newContext()\` twice |
| Same user, link opens a new tab | Pages in the same \`context\` |
| Reuse a logged-in session across tests | \`storageState\` (covered in pw-auth-config) |

**In interviews, say this:** "Isolation comes from browser contexts, not from cleanup code. Playwright starts every test from scratch instead of trying to undo the previous test."`,
      diagram: `  playwright test (Node runner)
    |-- worker 1 -----------------------------------------
    |     Browser: Chromium (launched once per worker)
    |       |-- Context A (test 1)  cookies, storage, cache
    |       |      '-- Page (tab)
    |       '-- Context B (test 2)  totally separate profile
    |              |-- Page (tab)
    |              '-- Page (popup opened by the app)
    '-- worker 2 -----------------------------------------
          Browser: Chromium
            '-- Context C (test 3)
                   '-- Page`,
      code: [
        {
          language: 'typescript',
          title: 'tests/contexts.spec.ts — default isolation and two users in one test',
          code: `import { test, expect } from '@playwright/test';

// Each test receives its own brand-new context + page from the fixtures.
test('standard user sees the products page', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\\.html/);
});

// Two isolated users at the same time: two contexts from the browser fixture.
test('two users do not share a session', async ({ browser }) => {
  const userA = await browser.newContext();
  const userB = await browser.newContext();
  const pageA = await userA.newPage();
  const pageB = await userB.newPage();

  await pageA.goto('https://www.saucedemo.com/');
  await pageA.getByPlaceholder('Username').fill('standard_user');
  await pageA.getByPlaceholder('Password').fill('secret_sauce');
  await pageA.getByRole('button', { name: 'Login' }).click();

  // User B never logged in, so the inventory URL sends them back to login.
  await pageB.goto('https://www.saucedemo.com/inventory.html');
  await expect(pageB.getByRole('button', { name: 'Login' })).toBeVisible();

  await userA.close(); // contexts you create yourself, you close yourself
  await userB.close();
});`,
        },
      ],
      keyPoints: [
        'Browser = expensive process; context = cheap isolated profile; page = tab.',
        'The `page` fixture gives every test a new context, which is the basis of isolation and parallelism.',
        'Two users → two contexts; same user in two tabs → two pages in one context.',
      ],
      source: 'Playwright docs — Isolation (Browser contexts); Playwright docs — Writing tests (test isolation)',
    },
    {
      heading: 'Installing Playwright with npm init playwright',
      body: `**Intuition:** one command scaffolds the project and downloads the browsers, like a "starter kit" that contains a sample test and a sensible configuration.

**Prerequisites:** a current LTS release of **Node.js** (check the docs' system requirements for the exact supported versions; recent docs list Node 22, 24 and 26), a terminal, and VS Code. Supported OS: Windows 11+ (or WSL), recent macOS, and Debian/Ubuntu LTS releases.

**Steps:**

1. Create a folder and open it in a terminal.
2. Run \`npm init playwright@latest\`. It asks four questions:
   - TypeScript or JavaScript (default **TypeScript**),
   - name of the tests folder (default \`tests\`, or \`e2e\` if \`tests\` already exists),
   - add a **GitHub Actions** workflow (say yes; you will need it later),
   - install Playwright browsers (default yes).
3. Run \`npx playwright test\` to execute the example test headless in all three browsers, then \`npx playwright show-report\`.

**Where do browsers go?** Into a shared cache, not \`node_modules\`: \`~/Library/Caches/ms-playwright\` on macOS, \`~/.cache/ms-playwright\` on Linux, \`%USERPROFILE%\\AppData\\Local\\ms-playwright\` on Windows. Each Playwright version pins specific browser builds, which is why upgrading the package is followed by \`npx playwright install\`.

**Linux and CI:** browsers need system libraries (fonts, codecs). \`npx playwright install --with-deps\` installs the browsers *and* the OS packages. To save CI minutes, install only what you run: \`npx playwright install chromium --with-deps\`.

**Existing project?** Running the same command inside an existing repo just adds \`@playwright/test\` to your \`package.json\` and creates the config; or install manually with \`npm install -D @playwright/test\` and \`npx playwright install\`.

**Common mistake:** installing \`playwright\` (the library) instead of \`@playwright/test\`, then wondering why \`test\` and \`expect\` cannot be imported.`,
      code: [
        {
          language: 'bash',
          title: 'From empty folder to green test run',
          code: `# 1. Check Node.js is installed (use a current LTS version)
node -v

# 2. Scaffold a project (answers: TypeScript, tests, GitHub Actions = yes, browsers = yes)
mkdir saucedemo-tests && cd saucedemo-tests
npm init playwright@latest

# 3. Run the example test: headless, parallel, all configured browsers
npx playwright test

# 4. Open the HTML report
npx playwright show-report

# On a fresh Linux box or CI image: browsers + system dependencies
npx playwright install --with-deps

# Only the browser you actually run on CI (faster)
npx playwright install chromium --with-deps

# Later: upgrade Playwright and its matching browsers
npm install -D @playwright/test@latest
npx playwright install --with-deps
npx playwright --version`,
        },
      ],
      keyPoints: [
        '`npm init playwright@latest` = scaffold + config + example test + optional CI workflow + browsers.',
        'Browsers live in a per-user cache folder and are tied to the Playwright version.',
        '`--with-deps` adds the OS libraries Linux/CI images need.',
      ],
      source: 'Playwright docs — Installation; Playwright docs — Browsers; Playwright docs — Best practices (CI)',
    },
    {
      heading: 'Project structure after setup',
      body: `**Intuition:** like a new test management project, there is one settings file, one place for test cases, and folders that results get written to.

| Path | Created by | Purpose | Commit to Git? |
|---|---|---|---|
| \`playwright.config.ts\` | init | Runner + browser configuration | Yes |
| \`package.json\` / lock file | init | Dependencies (\`@playwright/test\`, \`@types/node\`) and npm scripts | Yes |
| \`tests/example.spec.ts\` | init | Sample test; files ending in \`.spec.ts\` or \`.test.ts\` are picked up | Yes |
| \`.github/workflows/playwright.yml\` | init (if chosen) | Runs tests on push / PR | Yes |
| \`node_modules/\` | npm | Installed packages | **No** |
| \`test-results/\` | each run | Per-test artifacts: traces, screenshots, videos, error context | **No** |
| \`playwright-report/\` | html reporter | The HTML report | **No** (upload as CI artifact) |
| \`playwright/.cache\`, \`playwright/.auth\` | component tests / auth setup | Caches and saved login state | **No** (\`.auth\` holds secrets) |

Older versions of the scaffold also created a \`tests-examples/demo-todo-app.spec.ts\` file with a richer TodoMVC example; it is worth reading once and deleting.

**Which files are tests?** By default the runner looks in \`testDir\` for files matching \`*.spec.ts\`, \`*.test.ts\` (and the \`.js\`, \`.mjs\`, \`.tsx\` variants). Override with \`testMatch\` / \`testIgnore\`.

**A structure you can grow into** (POM and fixtures come later in the course): \`tests/\` for specs grouped by feature, \`pages/\` for page objects, \`fixtures/\` for custom fixtures, \`test-data/\` for JSON data, \`.env\` for local secrets (git-ignored).

**Common mistake:** committing \`test-results/\` or \`playwright/.auth/\` (which can contain session cookies) to Git.`,
      diagram: `saucedemo-tests/
|-- .github/workflows/playwright.yml   CI pipeline (optional)
|-- tests/
|   '-- example.spec.ts                your specs: *.spec.ts / *.test.ts
|-- playwright.config.ts               runner + browser settings
|-- package.json                       deps + scripts
|-- package-lock.json
|-- .gitignore                         node_modules, test-results, reports
|-- node_modules/                      (ignored)
|-- test-results/                      traces, screenshots, videos (ignored)
'-- playwright-report/                 HTML report (ignored)`,
      keyPoints: [
        'Config, specs, package.json and the CI workflow are source; results and reports are generated output.',
        'Default test files: `*.spec.ts` / `*.test.ts` under `testDir`.',
        'Never commit saved auth state; it contains real session cookies.',
      ],
      source: 'Playwright docs — Installation (what was installed); Playwright docs — Test configuration (testMatch)',
    },
    {
      heading: 'playwright.config.ts walkthrough',
      body: `**Intuition:** the config is the "test plan settings" of your suite: where tests live, how long to wait, how many to run at once, which browsers, and what evidence to collect.

**Rule of thumb:** options at the **top level** control the *runner* (which tests, how many workers, timeouts, retries, reporters). Options inside \`use\` control the *browser and page* each test gets (base URL, viewport, trace, screenshots, test id attribute). A \`use\` block inside a **project** overrides the global one for that browser.

| Option | Where | Default | What it does |
|---|---|---|---|
| \`testDir\` | top | config folder | Folder scanned for tests |
| \`timeout\` | top | 30 000 ms | Max time for one test (including hooks/fixtures) |
| \`expect.timeout\` | top | 5 000 ms | How long web-first assertions retry |
| \`fullyParallel\` | top | false | Run tests inside one file in parallel too |
| \`forbidOnly\` | top | false | Fail the run if a \`test.only\` slipped in (turn on for CI) |
| \`retries\` | top | 0 | Re-run failed tests; a pass on retry is reported as **flaky** |
| \`workers\` | top | half of logical CPU cores | Parallel worker processes |
| \`reporter\` | top | \`list\` locally, \`dot\` on CI (template sets \`html\`) | Output format(s) |
| \`projects\` | top | one default project | Browser/device matrix (or setup/teardown projects) |
| \`webServer\` | top | none | Start your app before tests |
| \`use.baseURL\` | use | none | Lets you write \`page.goto('/')\` |
| \`use.trace\` | use | \`off\` | \`on-first-retry\` records a trace only when a test is retried |
| \`use.screenshot\` / \`use.video\` | use | \`off\` | \`only-on-failure\` / \`retain-on-failure\` are the usual choices |
| \`use.testIdAttribute\` | use | \`data-testid\` | Attribute read by \`getByTestId\` |
| \`use.headless\` | use | true | \`--headed\` flips it for one run |
| \`use.actionTimeout\` / \`navigationTimeout\` | use | 0 (no limit) | Per-action caps; the test timeout still applies |

**SauceDemo note:** SauceDemo marks elements with \`data-test="username"\`, not \`data-testid\`. Setting \`testIdAttribute: 'data-test'\` lets you write \`page.getByTestId('username')\`.

Detailed config patterns (env files, multiple environments, storageState, setup projects) are covered in **pw-auth-config**; this section is the map.

**Common mistake:** putting runner options such as \`timeout\` or \`retries\` inside \`use\`; they belong at the top level (TypeScript will flag most of these).`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts — the template, tuned for SauceDemo',
          code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',             // where *.spec.ts files live
  fullyParallel: true,            // tests inside a file also run in parallel
  forbidOnly: !!process.env.CI,   // a forgotten test.only fails the CI build
  retries: process.env.CI ? 2 : 0, // retry only on CI; locally, fail fast
  workers: process.env.CI ? 1 : undefined, // undefined = half the CPU cores
  reporter: 'html',               // writes playwright-report/
  // timeout: 30_000,             // per-test default (shown for reference)
  // expect: { timeout: 5_000 },  // web-first assertion default

  use: {
    baseURL: 'https://www.saucedemo.com', // page.goto('/') works
    testIdAttribute: 'data-test',         // SauceDemo uses data-test="..."
    trace: 'on-first-retry',              // trace only when a retry happens
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
});`,
        },
      ],
      keyPoints: [
        'Top level = runner (timeout, retries, workers, reporter, projects); `use` = browser/page options.',
        'Defaults to remember: test 30s, expect 5s, retries 0, workers = half the cores, no action timeout.',
        '`testIdAttribute: \'data-test\'` makes `getByTestId` work on SauceDemo.',
      ],
      source: 'Playwright docs — Test configuration; Playwright docs — Test use options; Playwright docs — Timeouts',
    },
    {
      heading: 'Your first test, line by line',
      body: `**Intuition:** a Playwright test is a manual test case written as code: preconditions (open the page), steps (fill, click), and expected results (assertions), with every step awaited like "wait until the previous step has really finished".

**Anatomy of the test below:**

| Line | Meaning |
|---|---|
| \`import { test, expect } from '@playwright/test'\` | The runner's test function and assertion library |
| \`test.describe('Login', ...)\` | Groups related tests (like a test suite) |
| \`test('title', async ({ page }) => { ... })\` | One test case; \`{ page }\` is a **fixture**: a fresh tab in a fresh context, injected for you |
| \`await page.goto('/')\` | Navigate; \`/\` is joined to \`baseURL\` from the config |
| \`page.getByPlaceholder('Username')\` | A **locator**: a description of how to find the element (next topic) |
| \`.fill(...)\`, \`.click()\` | Actions; each one auto-waits until the element is visible, enabled, stable and ready |
| \`await expect(page).toHaveURL(...)\` | A **web-first assertion**: retries until true or until the 5s expect timeout |

**Why \`await\` everywhere?** Every Playwright action talks to a separate browser process and returns a Promise. Without \`await\`, the next line runs before the click has happened, and the test can finish (and pass!) before the browser did anything. You met this in the JavaScript async topic; here it becomes the number-one beginner bug.

**Writing tests from a manual case:** keep the same structure. Title = test case title, steps = actions, expected result = \`expect\`. One test checks one behaviour; tests never depend on each other (each starts in a new context).

**Common mistake:** asserting with \`expect(await locator.isVisible()).toBe(true)\`. It checks once, immediately, and does not wait. Use \`await expect(locator).toBeVisible()\` (covered in depth in pw-assertions-waiting).`,
      code: [
        {
          language: 'typescript',
          title: 'tests/login.spec.ts — SauceDemo login, positive and negative',
          code: `import { test, expect } from '@playwright/test';

// baseURL = https://www.saucedemo.com and testIdAttribute = 'data-test' (see config)
test.describe('Login', () => {
  test('valid user lands on the Products page', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  test('locked-out user sees an error', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('locked_out_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    // The error <h3> has role="alert" on SauceDemo
    await expect(page.getByRole('alert')).toContainText('locked out');
    await expect(page).not.toHaveURL(/inventory/);
  });
});`,
        },
      ],
      keyPoints: [
        '`{ page }` is a fixture: a new isolated tab per test, created and cleaned up by the runner.',
        'Await every action and every web-first assertion.',
        'Map manual test cases directly: title → test name, steps → actions, expected → expect.',
      ],
      source: 'Playwright docs — Writing tests; Playwright docs — Fixtures (built-in page fixture)',
    },
    {
      heading: 'Running tests from the CLI',
      body: `**Intuition:** the CLI is your "test execution" screen. You choose *which* tests (files, lines, titles, tags, projects), *how* (headed, workers, retries) and *what output* (reporter).

| You want to… | Command |
|---|---|
| Run everything (headless, all projects, parallel) | \`npx playwright test\` |
| One file | \`npx playwright test tests/login.spec.ts\` |
| Files whose path contains words | \`npx playwright test login cart\` (regex on file paths) |
| One test at a line | \`npx playwright test tests/login.spec.ts:12\` |
| Tests whose **title** matches | \`npx playwright test -g "locked-out"\` |
| Everything except a tag | \`npx playwright test --grep-invert @slow\` (or \`-G\`) |
| One browser | \`npx playwright test --project=chromium\` |
| See the browser | \`npx playwright test --headed\` |
| Only last run's failures | \`npx playwright test --last-failed\` |
| Only tests in files changed vs Git | \`npx playwright test --only-changed=main\` |
| Just list what would run | \`npx playwright test --list\` |
| Stop at first failure | \`npx playwright test -x\` |
| Control parallelism | \`npx playwright test --workers=4\` (or \`--workers=50%\`) |
| Stress a test for flakiness | \`npx playwright test --repeat-each=10\` |
| Step through with the Inspector | \`npx playwright test --debug\` |
| Interactive runner | \`npx playwright test --ui\` |

**How filters combine:** file filters (positional args) and \`-g\` both narrow the set; the result is then multiplied by the number of projects. A file with 4 tests and 3 browser projects is 12 test runs.

**Tags:** put \`@smoke\` in the title (or use the \`tag\` option) and filter with \`-g @smoke\`. Tags and annotations are covered in pw-hooks-fixtures.

**npm scripts** make commands discoverable for the team: \`"test:smoke": "playwright test -g @smoke --project=chromium"\`.

**Common mistake:** confusing the positional filter (matches **file paths**) with \`-g\` (matches **test titles**). \`npx playwright test checkout\` runs \`checkout.spec.ts\`; it does not run a test titled "checkout" inside \`cart.spec.ts\`.`,
      code: [
        {
          language: 'json',
          title: 'package.json scripts for a SauceDemo suite',
          code: `{
  "name": "saucedemo-tests",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed --project=chromium",
    "test:smoke": "playwright test -g @smoke --project=chromium",
    "test:ui": "playwright test --ui",
    "test:failed": "playwright test --last-failed",
    "codegen": "playwright codegen https://www.saucedemo.com",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.0",
    "@types/node": "^22.0.0"
  }
}`,
        },
      ],
      keyPoints: [
        'Positional args filter by file path; `-g` filters by test title (including tags).',
        'Total runs = matching tests × selected projects.',
        '`--last-failed`, `--list`, `-x`, `--repeat-each` are the everyday productivity flags.',
      ],
      source: 'Playwright docs — Command line; Playwright docs — Running and debugging tests',
    },
    {
      heading: 'UI mode, codegen and the VS Code extension',
      body: `**Intuition:** three cockpits for the same engine. **UI mode** is the control room for running and watching tests. **Codegen** is a recorder that writes code while you click. The **VS Code extension** brings both into the editor next to your code.

**UI mode** (\`npx playwright test --ui\`):
- sidebar of all tests; run a file, a describe block or a single test; filter by name, project, \`@tag\` or status;
- **watch mode** (eye icon) re-runs a test when you save;
- a **timeline** with a DOM snapshot for every action: Before/After tabs, Actions, Source, Console, Network, Errors and Attachments tabs;
- **Pick locator**: hover the snapshot, click an element, copy a suggested locator.

**Codegen** (\`npx playwright codegen https://www.saucedemo.com\`):
- opens a browser + the Inspector; every click and fill becomes code;
- toolbar buttons add **assertions** for visibility, text and value;
- prefers role, text and test-id locators and refines them until they match exactly one element;
- useful flags: \`--device="iPhone 13"\`, \`--viewport-size=800,600\`, \`--color-scheme=dark\`, \`--lang\`, \`--timezone\`, \`--test-id-attribute=data-test\`, \`--save-storage=auth.json\` / \`--load-storage=auth.json\`, \`-o tests/recorded.spec.ts\`.

**VS Code extension** (Microsoft, ID \`ms-playwright.playwright\`): green run buttons beside each test, Testing sidebar, choose projects, **Show browser**, **Pick locator**, **Record new** / **Record at cursor**, breakpoints and step debugging, and opening traces.

| Tool | Best for | Not for |
|---|---|---|
| UI mode | Exploring a suite, watch mode while writing, time-travel on failures locally | CI runs |
| \`--debug\` (Inspector) | Pausing and stepping through one test, live-editing locators | Running many tests |
| Codegen | First draft of a flow, discovering locators on an unfamiliar page | Final, maintainable tests as-is |
| VS Code extension | Day-to-day writing, running one test, breakpoints | Headless CI |

**Codegen honesty for interviews:** recorded code is a **starting point**. You still remove duplicated steps, add meaningful assertions, replace typed test data with variables, and move repeated flows into page objects.`,
      code: [
        {
          language: 'bash',
          title: 'Explore and record',
          code: `# Interactive UI mode with watch mode and time-travel snapshots
npx playwright test --ui

# Step through one test with the Inspector (headed, 1 worker, no timeout)
npx playwright test tests/login.spec.ts:6 --debug

# Record a flow on SauceDemo, using data-test for getByTestId suggestions
npx playwright codegen --test-id-attribute=data-test https://www.saucedemo.com

# Record on an emulated phone and save the code to a file
npx playwright codegen --device="iPhone 13" -o tests/recorded-mobile.spec.ts https://demo.playwright.dev/todomvc

# Log in once while recording, keep the session for later recordings
npx playwright codegen --save-storage=auth.json https://www.saucedemo.com
npx playwright codegen --load-storage=auth.json https://www.saucedemo.com/inventory.html`,
        },
      ],
      keyPoints: [
        'UI mode = run + watch + time-travel + pick locator, locally.',
        'Codegen records actions and assertions; treat its output as a draft.',
        'VS Code extension = run/debug/record/pick locator inside the editor.',
      ],
      source: "Playwright docs — UI Mode; Playwright docs — Test generator; Playwright docs — Getting started VS Code; Debbie O'Brien — How to locate elements in Playwright",
    },
    {
      heading: 'The HTML report and test results',
      body: `**Intuition:** the HTML report is the test execution report you would otherwise build by hand in a spreadsheet: every test, every browser, pass/fail/flaky, with screenshots and traces attached as evidence.

**How it works:**
- With \`reporter: 'html'\`, each run writes \`playwright-report/index.html\`. By default it **opens automatically when something fails** (locally); on CI it just gets written so you can upload it as an artifact.
- \`npx playwright show-report\` serves the last report (default \`http://localhost:9323\`).
- Each test shows its **steps** (every action and assertion with timings), the error with a code frame, and **attachments**: screenshots, videos, and the **trace** (open it with one click to get the trace viewer).
- Status values: **passed**, **failed**, **flaky** (failed, then passed on a retry), **skipped**.
- Raw artifacts for each test live in \`test-results/<test-name>-<project>/\`; it is cleaned at the start of each run.

**Reporters at a glance** (details in pw-debug-flaky): \`list\` (one line per test, local default), \`dot\` (compact, CI default), \`line\`, \`html\`, \`junit\` (XML for Jenkins/Azure DevOps), \`json\`, \`blob\` (for merging sharded runs), plus third-party ones like Allure. You can combine them: \`reporter: [['list'], ['html', { open: 'never' }]]\`.

**Common mistake:** setting \`trace: 'on'\` and \`video: 'on'\` for every test on CI "to be safe". It slows runs and bloats artifacts; \`trace: 'on-first-retry'\` (or \`retain-on-failure\`) gives evidence exactly when you need it.

**In interviews, say this:** "When CI fails, I download the HTML report artifact, open the failing test's trace, and look at the DOM snapshot and network tab at the failing step before I touch the code."`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts — reporters for local and CI',
          code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [
        ['dot'],                                   // short console output
        ['html', { open: 'never' }],               // uploaded as an artifact
        ['junit', { outputFile: 'results/junit.xml' }], // for Jenkins / Azure DevOps
      ]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',          // trace attached to retried tests
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});`,
        },
      ],
      keyPoints: [
        'HTML report = steps, errors, screenshots, videos, traces per test and project.',
        '`show-report` serves it on port 9323; `test-results/` holds raw artifacts.',
        'Collect heavy artifacts only on failure or retry.',
      ],
      source: 'Playwright docs — Reporters (HTML reporter); Playwright docs — Best practices (debugging on CI)',
    },
    {
      heading: 'TypeScript vs JavaScript in Playwright',
      body: `**Intuition:** TypeScript is JavaScript with labels on every box. The labels do not change what the code does; they let your editor warn you before you run it ("\`fill\` needs a string", "this function returns a Promise").

**What Playwright does with TS:** it runs \`.ts\` test files directly, with no build step. But it only **strips** the types; it does **not type-check**. A test with a type error can still run (and fail in a confusing way). So:

| Check | How |
|---|---|
| Type errors | \`npx tsc --noEmit\` in CI (needs a \`tsconfig.json\`) |
| Missing \`await\` (floating promises) | ESLint rule \`@typescript-eslint/no-floating-promises\` |
| Autocomplete for options and locators | Comes free in VS Code with TS |

**Should a beginner choose TS?** Yes: the docs, codegen output and most job descriptions use TypeScript, and you only need *light* types (strings, numbers, \`Page\`, \`Locator\`). Everything you learned in JavaScript still applies; type annotations are optional in most places because TypeScript infers them.

**Choose JavaScript when** the team's codebase is plain JS and adding a TS toolchain would be friction. The Playwright API is identical.

**Common mistake:** believing "it ran, so it type-checks". Add \`tsc --noEmit\` to the pipeline.`,
      code: [
        {
          language: 'typescript',
          title: 'Light typing in a helper (types are optional but helpful)',
          code: `import { test, expect, type Page } from '@playwright/test';

// The Page type gives autocomplete for page.* inside the helper.
async function login(page: Page, username: string, password: string) {
  await page.goto('/');
  await page.getByTestId('username').fill(username);
  await page.getByTestId('password').fill(password);
  await page.getByTestId('login-button').click();
}

test('problem_user can still log in', async ({ page }) => {
  await login(page, 'problem_user', 'secret_sauce');
  await expect(page.getByTestId('title')).toHaveText('Products');
});

// With TypeScript, this mistake is flagged in the editor before running:
// await login(page, 'standard_user');  // Expected 3 arguments, but got 2.
// And with no-floating-promises, a missing await is flagged too:
// login(page, 'standard_user', 'secret_sauce'); // Promises must be awaited`,
        },
      ],
      keyPoints: [
        'Playwright transpiles TS but does not type-check; run `tsc --noEmit` separately.',
        'Lint `no-floating-promises` to catch missing awaits.',
        'Same API in TS and JS; TS gives autocomplete and earlier errors.',
      ],
      source: 'Playwright docs — TypeScript; Playwright docs — Best practices (lint your tests)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-setup-cc-1',
      title: 'Fix a config that is slow, noisy and unsafe for CI',
      context:
        'A teammate copied this playwright.config.ts from an old blog post. The SauceDemo suite (120 tests) takes 25 minutes locally, CI sometimes ships with a `test.only`, every test records video, and `getByTestId(\'username\')` never finds anything.',
      task:
        'Rewrite the config so it is fast locally, strict and evidence-rich on CI, runs Chromium, Firefox and WebKit, and makes `getByTestId` work with SauceDemo markup. Keep defaults where defaults are good.',
      starter: {
        language: 'typescript',
        title: 'playwright.config.ts (before)',
        code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,                    // "parallel is flaky"
  retries: 3,                    // everywhere, including local runs
  timeout: 5 * 60 * 1000,        // 5 minutes per test, "just in case"
  reporter: 'list',
  use: {
    headless: false,             // always open a window
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

// tests use full URLs everywhere, e.g.
// await page.goto('https://www.saucedemo.com/inventory.html');
// and await page.getByTestId('username').fill('standard_user'); // never matches`,
      },
      hints: [
        'Which options should depend on `process.env.CI`? Think about `forbidOnly`, `retries` and `workers`.',
        'SauceDemo uses `data-test`, while `getByTestId` reads `data-testid` by default. Where is that configured?',
        'Artifacts: which `trace` / `video` / `screenshot` modes record only when a test fails or retries? And what lets you write `page.goto(\'/inventory.html\')`?',
      ],
      solution: {
        language: 'typescript',
        title: 'playwright.config.ts (after)',
        code: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                     // isolated contexts make this safe
  forbidOnly: !!process.env.CI,            // a stray test.only fails CI
  retries: process.env.CI ? 2 : 0,         // retries hide nothing locally
  workers: process.env.CI ? 2 : undefined, // local: half the CPU cores
  // timeout stays at the 30s default; a slow test is a signal, not a setting
  reporter: process.env.CI
    ? [['dot'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',  // tests call page.goto('/inventory.html')
    testIdAttribute: 'data-test',          // getByTestId('username') now matches
    trace: 'on-first-retry',               // evidence exactly when a retry happens
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // headless stays true (default); use --headed or --ui when watching
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});`,
      },
      explanation: `**Fixes, one by one:**

- **\`fullyParallel: true\` + default workers locally:** each test already gets its own browser context, so parallel runs are safe. One worker turned a 4-minute suite into 25 minutes. If parallel runs are flaky, the tests share data, and that is the bug to fix.
- **\`forbidOnly: !!process.env.CI\`:** a forgotten \`test.only\` silently skips the rest of the suite; this makes CI fail loudly instead.
- **Retries only on CI:** three local retries hide real failures while you are developing. Two on CI absorb environment noise and label those tests **flaky** in the report.
- **Timeout back to the 30s default:** a 5-minute timeout means a stuck test burns 5 minutes before telling you anything.
- **\`baseURL\`:** removes hard-coded hosts from every test and lets you point the suite at staging with one change.
- **\`testIdAttribute: 'data-test'\`:** SauceDemo's attribute is \`data-test\`, so \`getByTestId\` needed this to match.
- **Artifacts on failure only:** \`trace: 'on'\` + \`video: 'on'\` for 120 tests × 3 browsers is slow and huge; \`on-first-retry\` / \`retain-on-failure\` keep exactly the evidence you debug with.
- **Headless by default:** windows popping up slow the run; use \`--headed\` or \`--ui\` when you want to watch.
- **Three engines:** WebKit catches Safari-only bugs that a Chromium-only suite misses.`,
      followUps: [
        {
          q: 'Why set workers to a small number on CI instead of leaving it undefined?',
          a: 'CI runners often have few CPU cores and limited memory, and the app under test may be a shared staging server. A fixed, small worker count keeps runs predictable and avoids overloading the environment, which itself causes timeouts that look like flaky tests. To go faster on CI you usually add machines with `--shard` rather than more workers per machine.',
        },
        {
          q: 'What does "flaky" mean in the HTML report, and is it OK to ship with flaky tests?',
          a: 'A test is marked flaky when it failed at least once and then passed on a retry within the same run. Retries keep the pipeline green, but flaky tests are a defect in the test or the app: they erode trust and hide real regressions. Track them, open the retry trace, fix the root cause (shared data, missing web-first assertion, race with the network), and consider `--fail-on-flaky-tests` once the suite is stable.',
        },
      ],
    },
    {
      id: 'pw-setup-cc-2',
      title: 'A first test written like a manual script',
      context:
        'A manual tester converted two SauceDemo test cases into Playwright. The run is green locally most of the time, red on CI, and red whenever the cart test is run alone with `npx playwright test -g "cart"`.',
      task:
        'Refactor the file so each test is independent, waits correctly, and asserts what a user would see. Use the config from the previous challenge (baseURL and testIdAttribute: data-test).',
      starter: {
        language: 'typescript',
        title: 'tests/shop.spec.ts (before)',
        code: `import { test, expect } from '@playwright/test';

let loggedInPage: any; // shared between tests

test('login', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  page.click('#login-button');            // no await
  await page.waitForTimeout(3000);        // "wait for the page"
  loggedInPage = page;                    // reuse in the next test
});

test('add backpack to cart', async () => {
  await loggedInPage.click('#add-to-cart-sauce-labs-backpack');
  const badge = await loggedInPage.$('.shopping_cart_badge');
  expect(await badge.innerText()).toBe('1');
});`,
      },
      hints: [
        'Each test receives a brand-new browser context. What happens to `loggedInPage` when the second test runs, especially alone or in another worker?',
        'Find the line that is not awaited, and replace the fixed sleep with an assertion that waits for the inventory page.',
        'Move the shared steps into `beforeEach` (or a helper) and use test-id / role locators plus web-first assertions instead of `page.$` and `innerText()`.',
      ],
      solution: {
        language: 'typescript',
        title: 'tests/shop.spec.ts (after)',
        code: `import { test, expect } from '@playwright/test';

test.describe('Shopping as standard_user', () => {
  // Every test logs in inside its own fresh context: no shared state.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory\\.html/); // waits, no sleep
  });

  test('login shows the product list', async ({ page }) => {
    await expect(page.getByTestId('title')).toHaveText('Products');
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
  });

  test('adding the backpack updates the cart badge', async ({ page }) => {
    await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();
  });
});`,
      },
      explanation: `**What was wrong and why the fix works:**

- **Shared state between tests:** \`loggedInPage\` belongs to test 1's context, which Playwright closes when test 1 ends. Test 2 then drives a dead page, and when run alone or in another worker the variable is \`undefined\`. Tests must be independent; \`beforeEach\` gives each one its own login.
- **Missing \`await\` on the click:** the test moved on before the click happened, and only the sleep hid the race.
- **\`waitForTimeout(3000)\`:** too long when the app is fast, too short on a slow CI machine. \`await expect(page).toHaveURL(...)\` waits exactly as long as needed (up to 5s).
- **\`page.$\` + \`innerText()\` + generic \`expect\`:** \`page.$\` returns an ElementHandle snapshot (discouraged), and the generic assertion checks once without retrying. \`await expect(locator).toHaveText('1')\` retries until the badge updates.
- **Hard-coded host and CSS ids:** \`baseURL\` and test-id/role locators make the tests portable and readable.
- **Better assertions:** the solution also checks the button flips to Remove, which is what a user would notice.`,
      followUps: [
        {
          q: 'Logging in through the UI before every test is slow. What would you do once the suite has 200 tests?',
          a: 'Log in once in a setup project, save the session with `storageState`, and let the test projects start already authenticated by pointing `use.storageState` at that file. Every test still gets its own context, but each context is pre-loaded with the cookies, so isolation is kept and the login form is exercised only in the tests that are actually about login.',
        },
        {
          q: 'If two tests really must run in order (for example create then delete), how would you express that?',
          a: 'First question whether they should: usually each test should create its own data, ideally through the API, so it can run alone. If order is genuinely required, put them in a `test.describe.serial` (or configure the describe mode to serial) so they run in one worker in order and later ones are skipped if an earlier one fails. Share data through variables declared in the describe, not through a page from another test.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-setup-iq-01',
      difficulty: 'medium',
      question: 'What is Playwright, and why would you pick it over Selenium or Cypress for a new web project?',
      context: 'A very common opener in 2025–2026 automation interviews (it appears in most published Playwright question banks, e.g. TestDino and Testleaf).',
      whatInterviewerLooksFor: [
        'A clear one-line definition, not marketing',
        'Concrete technical differences: auto-waiting, contexts, protocol connection, multi-tab/origin, WebKit',
        'Balanced trade-offs and when Selenium or Cypress is still the better choice',
        'Tie-in to tester pain points (flakiness, debugging, CI cost)',
      ],
      modelAnswer: `**Definition:** Playwright is an open-source, cross-browser end-to-end testing framework from Microsoft. With \`@playwright/test\` you get the browser automation API *and* a test runner (assertions, fixtures, parallel workers, retries, reporters) in one package.

**Why I would choose it for a new web project:**

1. **Less flakiness by design.** Every action auto-waits for the element to be visible, enabled and stable, and \`expect(locator)\` assertions retry. In Selenium I would write explicit waits myself.
2. **Cheap isolation.** Each test gets a new browser context, an incognito-like profile that takes milliseconds to create, so tests don't leak cookies into each other and can run in parallel.
3. **Real cross-browser coverage.** Chromium, Firefox and WebKit from one API, including Safari's engine on Linux CI.
4. **Scenarios Cypress struggles with:** multiple tabs, popups, several origins in one test, iframes via \`frameLocator\`.
5. **Debugging and reporting:** UI mode, Inspector, trace viewer and the HTML report, all free. Parallelism and sharding are built in too.
6. **One tool for UI + API:** the \`request\` fixture and \`page.route\` mocking.

**When I would not switch:** a large, healthy Selenium Java suite with a Java team and Grid infrastructure (rewriting costs more than it saves), a need for real mobile devices through Appium, or a front-end team already productive in Cypress testing a single-origin app.

**Example:** on SauceDemo, a login → add to cart → checkout flow in Playwright needs no waits at all; the same Selenium test typically needs explicit waits around the inventory page and cart badge.`,
      followUps: [
        {
          q: 'Is Playwright built on top of WebDriver?',
          a: 'No. Playwright keeps a direct, persistent connection to the browser using its own protocol layer: the Chrome DevTools Protocol for Chromium and patched builds of Firefox and WebKit that expose equivalent capabilities. That is why it downloads its own browser builds. Selenium uses the W3C WebDriver protocol through a separate driver executable, now increasingly with WebDriver BiDi for event-driven features.',
        },
        {
          q: 'Which languages can you use, and does the language matter?',
          a: 'TypeScript/JavaScript, Python, Java and .NET share the same core automation API. The difference is the runner: TypeScript/JavaScript uses `@playwright/test` with fixtures, projects, UI mode, sharding and the HTML report out of the box, whereas Python, Java and .NET rely on pytest, JUnit/TestNG or NUnit/MSTest. I would pick the language the team maintains best, defaulting to TypeScript for web teams.',
        },
        {
          q: 'What is one real limitation of Playwright?',
          a: 'It does not test native mobile apps (only mobile browser emulation, not real devices), it is not a load-testing tool, and the bundled browsers are not the exact branded Chrome or Safari your users run, although you can use `channel: \'chrome\'` or `\'msedge\'`. Another practical one: for Safari on real macOS devices you still need a device cloud or a Mac.',
        },
      ],
      pitfalls: [
        'Saying "Playwright is faster" without explaining why (protocol connection, contexts, parallel workers).',
        'Calling Playwright a Selenium wrapper or saying it uses WebDriver.',
        'Claiming Playwright is always better and dismissing Selenium/Cypress without trade-offs.',
      ],
    },
    {
      id: 'pw-setup-iq-02',
      difficulty: 'medium',
      question: 'Explain browser, browser context and page. Why does Playwright create a new context for every test?',
      whatInterviewerLooksFor: [
        'Correct hierarchy and what each object owns',
        'Isolation explained in terms of cookies/storage, not hand-waving',
        'Knows contexts are cheap compared with launching browsers',
        'Can apply it: multi-user scenarios, popups',
      ],
      modelAnswer: `**The hierarchy:**

- **Browser:** one launched browser process (Chromium, Firefox or WebKit). Expensive to start, so each worker launches it once and reuses it.
- **BrowserContext:** an isolated, incognito-like profile inside that browser. It owns cookies, localStorage, sessionStorage, cache, permissions, geolocation, viewport and other emulation settings.
- **Page:** a single tab (or popup window) inside a context. Pages in the same context share the context's cookies.

**Why a new context per test:**

The built-in \`page\` fixture creates a fresh context for every test and closes it afterwards. So:

1. A test that leaves items in the cart or a logged-in cookie can't affect the next test.
2. Order doesn't matter, so tests can run in parallel and be sharded across machines.
3. Any single test can be re-run alone to debug it.

Playwright prefers **starting clean** over cleaning up after the fact, because cleanup code is easy to forget and some state cannot be undone. Contexts make this affordable: creating one takes milliseconds, while launching a new browser per test (the classic Selenium pattern) costs seconds.

**Applying it:**
- *Buyer and seller chat:* \`browser.newContext()\` twice → two independent users in one test.
- *"Terms" link opens a new tab:* same context, \`context.waitForEvent('page')\`, so the new tab shares the session.
- *Faster logins:* save a context's state with \`storageState\` and load it into new contexts.`,
      followUps: [
        {
          q: 'If contexts are isolated, how do you avoid logging in through the UI in every test?',
          a: 'Log in once (in a setup project or global setup), call `context.storageState({ path })` to save cookies and local storage to a JSON file, and set `use.storageState` to that file. Every test still gets its own new context, but each context starts pre-loaded with that state. Isolation is kept, and only the dedicated login tests exercise the form.',
        },
        {
          q: 'Do two tests in the same worker share the browser? Is that a problem?',
          a: 'Yes, a worker reuses its browser process across the tests it runs, but each test gets its own context, so no cookies or storage leak between them. Things that live outside the browser, such as data in the application database, are not isolated by contexts; tests should create their own unique data to stay independent.',
        },
      ],
      pitfalls: [
        'Mixing up context and page (saying each tab has its own cookies).',
        'Saying Playwright "clears cookies after each test" instead of creating a new context.',
        'Thinking contexts also isolate server-side data such as database records.',
      ],
    },
    {
      id: 'pw-setup-iq-03',
      difficulty: 'easy',
      question: 'Walk me through setting up Playwright from scratch for a new project and getting the first test green.',
      whatInterviewerLooksFor: [
        'Prerequisites (Node LTS, editor) and the exact init command',
        'Knows what files are generated and what each is for',
        'Runs, views report, and mentions CI-specific install flags',
        'Mentions sensible first config changes (baseURL, testIdAttribute)',
      ],
      modelAnswer: `**1. Prerequisites:** install a current LTS version of Node.js and VS Code with the Playwright extension.

**2. Scaffold:** in an empty folder run \`npm init playwright@latest\`. I choose **TypeScript**, keep the \`tests\` folder, say **yes** to the GitHub Actions workflow and **yes** to installing browsers.

**3. What I get:**
- \`playwright.config.ts\`: runner and browser settings, with Chromium, Firefox and WebKit projects, the HTML reporter, retries on CI and \`trace: 'on-first-retry'\`;
- \`tests/example.spec.ts\`: a sample test;
- \`package.json\` with \`@playwright/test\`;
- \`.github/workflows/playwright.yml\` if I opted in.

**4. Run and inspect:** \`npx playwright test\` runs everything headless and in parallel; \`npx playwright show-report\` opens the HTML report. While I write tests I keep \`npx playwright test --ui\` open.

**5. First config changes for a real app** such as SauceDemo: \`baseURL: 'https://www.saucedemo.com'\` so tests use \`page.goto('/')\`, and \`testIdAttribute: 'data-test'\` because SauceDemo's attribute isn't the default \`data-testid\`.

**6. First real test:** I take a manual case (valid login), use codegen once to see suggested locators, then write it cleanly: fill username/password, click Login, \`await expect(page).toHaveURL(/inventory/)\`.

**7. Hygiene:** \`.gitignore\` for \`node_modules\`, \`test-results\`, \`playwright-report\`, \`playwright/.auth\`; npm scripts for common runs; on CI use \`npx playwright install --with-deps\` (or just \`chromium\`).`,
      followUps: [
        {
          q: 'The example test fails on a fresh Linux CI runner with missing shared libraries. Why?',
          a: 'The browser binaries were downloaded, but the operating-system packages they depend on (fonts, graphics and media libraries) are missing on a bare Linux image. Run `npx playwright install --with-deps` (optionally just `chromium`) in the pipeline, or use the official Playwright Docker image, which already contains browsers and dependencies matching a specific Playwright version.',
        },
        {
          q: 'How do you upgrade Playwright safely?',
          a: 'Bump the package with `npm install -D @playwright/test@latest`, then run `npx playwright install --with-deps` so the matching browser builds are downloaded, and confirm with `npx playwright --version`. Read the release notes for breaking changes, run the full suite on a branch, and pin the same version in the CI Docker image if you use one.',
        },
      ],
      pitfalls: [
        'Installing the `playwright` library instead of `@playwright/test`.',
        'Not knowing that browsers are separate downloads tied to the Playwright version.',
        'Committing test-results or playwright-report folders to Git.',
      ],
    },
    {
      id: 'pw-setup-iq-04',
      difficulty: 'hard',
      question: 'Walk me through the important settings in playwright.config.ts. Which would you change for CI, and why?',
      whatInterviewerLooksFor: [
        'Distinguishes top-level runner options from `use` options',
        'Knows key defaults (30s test, 5s expect, retries 0, workers half the cores)',
        'CI reasoning: forbidOnly, retries, workers, reporters, trace strategy',
        'Mentions projects for browsers and baseURL / environment switching',
      ],
      modelAnswer: `I split the config into two halves.

**Runner (top level):**
- \`testDir\` / \`testMatch\`: where tests are found (\`*.spec.ts\`, \`*.test.ts\` by default).
- \`timeout\`: per test, **30s** default; \`expect.timeout\`: **5s** default for web-first assertions.
- \`fullyParallel\`: also parallelise tests within a file.
- \`workers\`: defaults to **half the logical CPU cores**.
- \`retries\`: default **0**.
- \`reporter\`: \`list\` locally / \`dot\` on CI by default; the template sets \`html\`.
- \`projects\`: the browser/device matrix, and later setup projects for login.
- \`webServer\`: starts the app before testing when it runs locally.

**Browser (\`use\`):** \`baseURL\`, \`trace\`, \`screenshot\`, \`video\`, \`headless\`, \`viewport\`, \`testIdAttribute\`, \`storageState\`, \`actionTimeout\`.

**What changes on CI (driven by \`process.env.CI\`):**

| Setting | Local | CI | Why |
|---|---|---|---|
| \`forbidOnly\` | false | true | A forgotten \`test.only\` must not silently skip the suite |
| \`retries\` | 0 | 2 | Absorb infra noise; retried passes are labelled flaky |
| \`workers\` | default | small fixed number | Small runners, shared staging; scale out with \`--shard\` |
| \`reporter\` | list + html | dot + html (\`open: 'never'\`) + junit/blob | Artifacts for people and for Jenkins/merging |
| \`trace\` | on-first-retry | on-first-retry | Evidence exactly for the retried failures |
| \`baseURL\` | localhost or staging | from an env variable | Same suite, many environments |

**Example:** for SauceDemo I also set \`testIdAttribute: 'data-test'\`, and run Chromium on every PR but all three engines nightly by selecting projects with \`--project\`.`,
      followUps: [
        {
          q: 'Where does the expect timeout live, and why not just raise the test timeout?',
          a: 'It is a top-level option: `expect: { timeout: 10_000 }`, or per assertion with `{ timeout }`. The test timeout covers the whole test including hooks; raising it does not make individual assertions wait longer, since each assertion still gives up after the expect timeout. Raise the specific timeout that matches the slow thing, and preferably fix the slowness instead of hiding it.',
        },
        {
          q: 'What is the difference between `trace: \'on-first-retry\'` and `\'retain-on-failure\'`?',
          a: '`on-first-retry` records a trace only on the first retry of a failed test, so it requires `retries` greater than 0, and the original failing attempt has no trace. `retain-on-failure` records every test but keeps the trace only for those that failed, giving evidence from the first failure at the cost of recording overhead for every test. CI templates use on-first-retry as the cheaper default.',
        },
      ],
      pitfalls: [
        'Putting `timeout` or `retries` inside `use`.',
        'Setting retries high everywhere to make the pipeline green.',
        'Recording video and trace for every test on CI by default.',
      ],
    },
    {
      id: 'pw-setup-iq-05',
      difficulty: 'easy',
      question: 'How do you run just one test, one file, one browser, or only the smoke tests from the command line?',
      whatInterviewerLooksFor: [
        'Exact commands, not vague descriptions',
        'Knows file-path filter vs `-g` title filter',
        'Knows `--project`, `file:line`, `--last-failed`, `--headed`',
        'Understands runs multiply by projects',
      ],
      modelAnswer: `All through \`npx playwright test\` with filters:

| Goal | Command |
|---|---|
| Whole suite | \`npx playwright test\` |
| One file | \`npx playwright test tests/cart.spec.ts\` |
| Files whose path contains "cart" | \`npx playwright test cart\` |
| One test by line number | \`npx playwright test tests/cart.spec.ts:18\` |
| Tests by title or tag | \`npx playwright test -g "@smoke"\` |
| Exclude a tag | \`npx playwright test --grep-invert "@slow"\` |
| One browser | \`npx playwright test --project=chromium\` |
| Watch it run | add \`--headed\` (or use \`--ui\`) |
| Only what failed last time | \`npx playwright test --last-failed\` |
| Preview without running | \`npx playwright test --list\` |

**Key detail:** positional arguments are **regular expressions on file paths**, while \`-g\` is a regex on the **full test title** (describe titles + test title + tags). Filters combine, and the result is multiplied by the selected projects: 5 smoke tests × 3 browser projects = 15 runs unless I add \`--project\`.

In the editor I mostly use the VS Code extension's run button or \`test.only\` temporarily (with \`forbidOnly\` on CI to stop it being merged). For the team, I wrap common runs in npm scripts such as \`"test:smoke": "playwright test -g @smoke --project=chromium"\`.`,
      followUps: [
        {
          q: 'What is the risk of using `test.only` to run a single test?',
          a: 'If it is committed, the runner executes only that test (and other `.only` tests) and reports success, so a whole suite silently stops running. Protect against it with `forbidOnly: !!process.env.CI`, which turns any `.only` into a failure on CI, and prefer CLI filters (`file:line`, `-g`) or the VS Code run button for local focus.',
        },
        {
          q: 'How does `--last-failed` know what failed?',
          a: 'After each run Playwright writes a small last-run file in the output directory listing the failed tests. `--last-failed` reads it and runs only those. Because it lives in `test-results`, it reflects your local last run; on sharded CI each shard has its own file, which is why the docs show a custom `--last-failed-file` option for that case.',
        },
      ],
      pitfalls: [
        'Thinking the positional argument matches test titles.',
        'Forgetting that every selected project multiplies the run count.',
        'Relying on `test.only` and committing it.',
      ],
    },
    {
      id: 'pw-setup-iq-06',
      difficulty: 'medium',
      question: 'Would you build your suite with codegen? When do you use codegen, UI mode, --debug and the VS Code extension?',
      whatInterviewerLooksFor: [
        'Understands codegen as a locator/draft tool, not a framework',
        'Knows what each tool does and picks the right one per situation',
        'Can explain post-recording clean-up (assertions, data, POM)',
        'Mentions Pick locator and testIdAttribute for codegen',
      ],
      modelAnswer: `**Codegen** (\`npx playwright codegen <url>\`) records my clicks and typing as Playwright code and lets me add visibility/text/value assertions from the toolbar. It picks resilient locators (role, text, test id) and refines them until each matches exactly one element. I use it to **discover locators** on an unfamiliar page and to produce a **first draft** of a flow. I don't commit the output as-is: recorded scripts repeat setup steps, hard-code data, contain incidental clicks and have weak assertions. After recording I:
1. keep the locators, delete the noise;
2. add meaningful assertions (URL, heading, cart badge);
3. move data into variables or fixtures;
4. move repeated flows (login) into \`beforeEach\`, a page object or a setup project.

For SauceDemo I run \`codegen --test-id-attribute=data-test\` so it suggests \`getByTestId('login-button')\` correctly.

**Choosing tools:**

| Situation | Tool |
|---|---|
| Writing tests, want instant feedback on save | UI mode with watch mode |
| A failing test, need to see the DOM at each step | UI mode timeline locally, trace viewer for CI failures |
| Step through one test, pause, try locators live | \`--debug\` (Inspector; headed, one worker, no timeout) |
| Daily editing, run one test, breakpoints in my code | VS Code extension |
| New page, which locator should I use? | Pick locator in UI mode / VS Code / codegen |`,
      followUps: [
        {
          q: 'Codegen produced `page.locator(\'#root > div > div:nth-child(2) > input\')` for a field. What does that tell you?',
          a: 'Codegen falls back to CSS structure when the element has no role with a usable accessible name, no label, no placeholder and no test id. That is a signal of poor accessibility or missing hooks in the markup. I would check whether a placeholder or label exists that I could target, and otherwise ask developers to add a proper label or a `data-testid` (which also improves the app for screen-reader users).',
        },
        {
          q: 'What does `--debug` change compared with a normal run?',
          a: 'It opens the Playwright Inspector, launches the browser headed, forces a single worker, and disables timeouts so you can pause indefinitely. You can step over each action, see the targeted element highlighted, and edit locators live in the Inspector. You can also run `npx playwright test file.spec.ts:10 --debug` to debug from one specific test, or call `await page.pause()` in code.',
        },
      ],
      pitfalls: [
        'Saying "I record everything with codegen, so I do not need to code".',
        'Committing recorded tests with no assertions.',
        'Using UI mode or --headed in CI pipelines.',
      ],
    },
    {
      id: 'pw-setup-iq-07',
      difficulty: 'expert',
      question:
        'Your company has 800 Selenium Java UI tests that take 3 hours and are 10% flaky. Your manager asks whether to migrate to Playwright. How do you answer?',
      whatInterviewerLooksFor: [
        'Does not jump to "rewrite everything"',
        'Separates tool problems from test-design problems',
        'Proposes a measurable pilot with success criteria',
        'Considers language, team skills, infrastructure and coverage overlap',
      ],
      modelAnswer: `I would treat it as a decision backed by data, not a fashion choice.

**1. Diagnose first.** Why is the suite slow and flaky? Sample 30 flaky failures: are they missing waits and stale elements (a tool/framework issue Playwright's auto-waiting and locators help with), or shared test data, unstable environments and UI-only setup (design issues that would follow us into any tool)? Why 3 hours: sequential runs, a new browser per test, UI logins everywhere?

**2. Quick wins without migrating:** parallelise on Grid, create data via API, remove sleeps. If these fix most problems, migration is less urgent.

**3. Pilot.** Pick one high-value flow area (for example checkout, ~40 tests) and write it in Playwright. Playwright has a Java binding, so the team could keep Java, or move to TypeScript if the developers and front-end codebase use it. Measure:

| Metric | Selenium today | Playwright pilot target |
|---|---|---|
| Runtime for the 40 tests | baseline | at least 2–3× faster with workers + storageState |
| Flaky rate over 2 weeks | ~10% | under 2% |
| Time to diagnose a CI failure | baseline | shorter with traces |
| Effort per new test | baseline | similar or lower |

**4. Migration strategy if the pilot wins:** strangler pattern. New tests go to Playwright; old tests are migrated when they break or when their feature changes; both suites run in CI until coverage overlaps; delete duplicates and push lower-level checks down to API tests rather than porting everything 1:1.

**5. Risks:** team ramp-up (training plan), real-device or IE needs that still require Selenium/Appium, reporting integration (JUnit reporter covers Jenkins), and two suites to maintain during transition.

**My recommendation:** a time-boxed pilot with agreed numbers, then decide.`,
      followUps: [
        {
          q: 'Which Playwright features would most directly attack the 3-hour runtime?',
          a: 'Running many tests in parallel workers with a fresh context per test instead of a fresh browser, sharding across CI machines with `--shard`, reusing login via `storageState` and a setup project instead of logging in through the UI in every test, and creating test data through the `request` fixture rather than through the UI. Together these usually matter more than raw protocol speed.',
        },
        {
          q: 'Would you port every Selenium test one-to-one?',
          a: 'No. A migration is the right moment to delete duplicate or low-value UI tests, move business-rule checks down to API or unit tests, and keep only the user journeys that need a real browser. Porting 800 tests mechanically would carry over the same design problems and likely the same flakiness. I would map existing tests to risks and rebuild coverage deliberately.',
        },
      ],
      pitfalls: [
        'Promising Playwright will fix flakiness caused by shared test data or unstable environments.',
        'Proposing a big-bang rewrite with no pilot or metrics.',
        'Ignoring the team\'s language skills and existing infrastructure.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-setup-drill-1',
      question:
        'Your config has 3 projects (chromium, firefox, webkit). The suite is: `tests/login.spec.ts` (4 tests; one titled "valid login @smoke" starting on line 5), `tests/cart.spec.ts` (3 tests; one titled "add item @smoke"), `tests/checkout.spec.ts` (5 tests, none tagged). For each command, how many test runs happen? (a) `npx playwright test` (b) `npx playwright test --project=chromium` (c) `npx playwright test login` (d) `npx playwright test -g @smoke --project=firefox` (e) `npx playwright test tests/login.spec.ts:5` (f) `npx playwright test --grep-invert @smoke --project chromium` (g) `npx playwright test cart -g checkout`',
      assumptions: [
        'Every project runs every test file (no testMatch/testIgnore per project).',
        'Positional arguments are regexes matched against file paths.',
        '`-g` / `--grep-invert` match the full test title, which includes tags written in the title.',
        'No test titles in cart.spec.ts contain the word "checkout".',
      ],
      steps: [
        { label: 'Count tests', calc: '4 + 3 + 5 = 12 tests; 2 of them carry @smoke.' },
        { label: '(a) everything', calc: '12 tests × 3 projects = 36 runs.' },
        { label: '(b) one project', calc: '12 × 1 = 12 runs.' },
        { label: '(c) file filter "login"', calc: 'Only login.spec.ts matches the path: 4 × 3 = 12 runs.' },
        { label: '(d) smoke on firefox', calc: '2 tagged tests × 1 project = 2 runs.' },
        { label: '(e) file:line', calc: 'Line 5 is the "valid login @smoke" test: 1 test × 3 projects = 3 runs.' },
        { label: '(f) invert smoke on chromium', calc: '12 − 2 = 10 tests × 1 = 10 runs.' },
        { label: '(g) file filter AND title filter', calc: 'cart.spec.ts has no title containing "checkout" → 0 runs ("No tests found" error unless --pass-with-no-tests).' },
      ],
      answer: `**(a) 36 · (b) 12 · (c) 12 · (d) 2 · (e) 3 · (f) 10 · (g) 0**, and (g) exits with an error because nothing matched.`,
      insight:
        'Filters narrow the set of tests; projects multiply it. Most "why did it run 3 times?" confusion comes from forgetting the project multiplier, and most "why did nothing run?" from mixing up file-path filters with title filters.',
      followUps: [
        {
          q: 'How can you check these numbers without running anything?',
          a: 'Append `--list` to any command. Playwright prints every test that would run, prefixed with its project, and a total count, without launching browsers. It is the quickest way to verify a grep pattern, a tag strategy or a CI shard command before spending minutes on a real run.',
        },
        {
          q: 'How would you make @smoke tests run only on Chromium permanently, without remembering flags?',
          a: 'Either add an npm script such as `"test:smoke": "playwright test -g @smoke --project=chromium"`, or define a dedicated project in the config, for example `{ name: \'smoke\', grep: /@smoke/, use: { ...devices[\'Desktop Chrome\'] } }`, and run it with `--project=smoke`. The config option is discoverable and works the same locally and in CI.',
        },
      ],
    },
    {
      id: 'pw-setup-drill-2',
      question:
        'Using the template config (`retries: process.env.CI ? 2 : 0`, `trace: \'on-first-retry\'`, `screenshot: \'only-on-failure\'`, `reporter: \'html\'`), predict what happens in each case: (1) locally, `tests/cart.spec.ts` fails once; (2) on CI, the same test fails on attempt 1 and passes on attempt 2; (3) on CI, a test fails on all attempts. For each: final status, how many attempts, which artifacts exist, and whether the HTML report opens.',
      assumptions: [
        'CI sets the `CI` environment variable (GitHub Actions does).',
        'The html reporter uses its default `open: \'on-failure\'` behaviour, which does not open a browser on CI.',
        'Screenshots are taken at the end of a failed attempt.',
      ],
      steps: [
        { label: 'Case 1: retries locally', calc: 'CI unset → retries = 0 → 1 attempt.' },
        { label: 'Case 1: artifacts', calc: 'Failure screenshot yes; trace no (no retry happened, so on-first-retry never triggers).' },
        { label: 'Case 1: report', calc: 'Status failed; HTML report opens automatically because a test failed locally.' },
        { label: 'Case 2: attempts', calc: 'retries = 2; attempt 1 fails, attempt 2 (first retry) passes → stops, 2 attempts.' },
        { label: 'Case 2: status and artifacts', calc: 'Status flaky; screenshot from attempt 1; trace recorded for attempt 2 (the first retry).' },
        { label: 'Case 3: attempts and artifacts', calc: '3 attempts (1 + 2 retries); screenshots for each failed attempt; trace only for attempt 2 (first retry).' },
        { label: 'Case 3: report', calc: 'Status failed; report written to playwright-report/ but not opened on CI; upload it as an artifact.' },
      ],
      answer: `| Case | Attempts | Status | Trace | Screenshot | Report |
|---|---|---|---|---|---|
| 1 local fail | 1 | failed | none | yes | opens |
| 2 CI fail→pass | 2 | **flaky** | attempt 2 | attempt 1 | written, not opened |
| 3 CI always fails | 3 | failed | attempt 2 only | each attempt | written, not opened |`,
      insight:
        '`on-first-retry` is cheap but gives you nothing locally (no retries) and only covers the first retry on CI. If you need a trace of the very first failure, use `retain-on-failure` or run once with `--trace on`.',
      followUps: [
        {
          q: 'Locally you want a trace for a failing test right now. What is the quickest way?',
          a: 'Re-run just that test with tracing forced on: `npx playwright test tests/cart.spec.ts:12 --trace on`, then open it from the HTML report or with `npx playwright show-trace`. Alternatively run it in UI mode, which shows the same timeline, DOM snapshots and network log live without needing a trace file.',
        },
      ],
    },
    {
      id: 'pw-setup-drill-3',
      question:
        'For each scenario, decide whether you need a new browser, a new context, or just a new page in the same context, and name the fixture or API: (1) a normal SauceDemo login test; (2) admin approves a booking while a customer watches the status change live; (3) clicking "Terms" opens a new tab for the same logged-in user; (4) check that a cart persists for the same user after closing and reopening a tab; (5) the same checkout test on Chromium and WebKit; (6) verify that user A cannot see user B\'s orders.',
      assumptions: [
        'Using `@playwright/test` with the default `page`, `context` and `browser` fixtures.',
        'Contexts share nothing (cookies, storage); pages in one context share cookies and storage.',
        'Browser engines are chosen with projects in the config, not inside a test.',
      ],
      steps: [
        { label: '1 normal test', calc: 'Default `page` fixture → new context + page automatically.' },
        { label: '2 two roles live', calc: 'Two different users at the same time → `browser.newContext()` twice (or one per role with its storageState).' },
        { label: '3 new tab, same user', calc: 'Same session → new page in the same context: `context.waitForEvent(\'page\')` while clicking.' },
        { label: '4 reopen tab', calc: 'Same context, `context.newPage()` after closing the first page → cookies/localStorage still there.' },
        { label: '5 two engines', calc: 'Not inside one test → two projects (chromium, webkit); each launches its own browser.' },
        { label: '6 data isolation between users', calc: 'Two separate contexts (two logins) → user B\'s page must not show A\'s order.' },
      ],
      answer: `1 → \`page\` fixture · 2 → two \`browser.newContext()\` · 3 → same context, catch the new page event · 4 → same context, new page · 5 → two **projects** (separate browsers) · 6 → two contexts.`,
      insight:
        'Ask "is this the same person?" Same person → same context (more pages). Different person → different context. Different browser engine → different project. You almost never launch a browser yourself in @playwright/test.',
      followUps: [
        {
          q: 'In scenario 2, how would you avoid logging both users in through the UI?',
          a: 'Create one storageState file per role in a setup project (admin.json, customer.json), then in the test call `browser.newContext({ storageState: \'playwright/.auth/admin.json\' })` and the same for the customer. Each context starts already authenticated as its role, and the test focuses on the approval behaviour rather than on the login form.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-setup-mcq-01',
      difficulty: 'easy',
      question: 'Which command scaffolds a new Playwright Test project with a config file, an example test and browser downloads?',
      options: ['npm init playwright@latest', 'npm install playwright', 'npx playwright codegen', 'npx create-playwright-config'],
      correct: [0],
      explanation:
        '`npm init playwright@latest` runs the official initializer: it asks TS or JS, the tests folder, whether to add a GitHub Actions workflow, and installs browsers. `npm install playwright` only adds the automation library (no runner, no config). `codegen` records tests in an existing setup, and `create-playwright-config` is not a real command.',
      followUps: [
        {
          q: 'What extra step is needed on a fresh Linux CI image?',
          a: 'Run `npx playwright install --with-deps` (or `npx playwright install chromium --with-deps`) so the browsers and the operating-system libraries they need are installed. Alternatively use the official Playwright Docker image that already contains them for a given version.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-02',
      difficulty: 'easy',
      question: 'In Playwright, what does a BrowserContext represent?',
      options: [
        'An isolated, incognito-like browser profile with its own cookies and storage',
        'A single browser tab inside a window',
        'A separate browser process launched for every test',
        'The Node.js worker process that executes test files',
      ],
      correct: [0],
      explanation:
        'A context is an isolated profile inside a running browser: its own cookies, localStorage, sessionStorage, cache and permissions. A tab is a Page (which lives inside a context). Playwright deliberately does not launch a new browser per test; contexts are the cheap alternative. Worker processes are a runner concept, separate from contexts.',
      followUps: [
        {
          q: 'Do two pages in the same context share the login session?',
          a: 'Yes. Pages in one context share its cookies and storage, so a link that opens a new tab keeps the user logged in. To simulate two different users you create two contexts instead.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-03',
      difficulty: 'medium',
      question: 'What happens when this test runs?',
      code: {
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test';

test('cart badge', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  page.getByTestId('login-button').click();
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
});`,
      },
      options: [
        'It may work or fail unpredictably: the login click is not awaited, so the next line races it, and a floating promise can also error after the test ends',
        'It always passes because Playwright queues every action and runs them in order even without await',
        'It fails at compile time because TypeScript requires await before every Promise',
        'It always fails immediately because click() throws when not awaited',
      ],
      correct: [0],
      explanation:
        'Without `await`, the test does not wait for the click; the next action starts at once. Here the next action auto-waits for the add-to-cart button, so it might still pass, which is exactly what makes missing awaits sneaky and flaky. Playwright has no hidden queue, TypeScript does not require await (a lint rule does), and an un-awaited click does not throw synchronously.',
      followUps: [
        {
          q: 'How do you catch this class of bug automatically?',
          a: 'Enable the ESLint rule `@typescript-eslint/no-floating-promises` (recommended in the Playwright best-practices docs) and run it in CI. It flags any Promise that is neither awaited nor handled, including un-awaited Playwright actions and assertions.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-04',
      difficulty: 'medium',
      question: 'Without any timeout settings in playwright.config.ts, which defaults apply? Select ALL that apply.',
      options: [
        'Each test may run for up to 30 seconds',
        'Web-first assertions like toBeVisible retry for up to 5 seconds',
        'Each action such as click() has its own 10-second limit',
        'Failed tests are retried twice',
        'Workers default to half of the logical CPU cores',
      ],
      correct: [0, 1, 4],
      explanation:
        'Defaults: 30s per test, 5s for `expect` assertions, and workers equal to half the logical CPU cores. Actions have no separate timeout by default (0 = limited only by the test timeout), so the 10-second option is wrong. `retries` defaults to 0; the "2 on CI" value comes from the generated template, not from Playwright defaults.',
      followUps: [
        {
          q: 'How do you give a single slow assertion more time without changing the global setting?',
          a: 'Pass a timeout to that assertion, for example `await expect(page.getByTestId(\'title\')).toHaveText(\'Products\', { timeout: 10_000 })`. For a whole slow test use `test.slow()` (triples the timeout) or `test.setTimeout(ms)` inside the test.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-05',
      difficulty: 'medium',
      question:
        'Your suite has `tests/checkout.spec.ts` and a test titled "checkout shows total" inside `tests/cart.spec.ts`. Which command runs ONLY the test titled "checkout shows total"?',
      options: [
        'npx playwright test -g "checkout shows total"',
        'npx playwright test checkout',
        'npx playwright test --project="checkout shows total"',
        'npx playwright test --only "checkout shows total"',
      ],
      correct: [0],
      explanation:
        '`-g`/`--grep` filters by test title. A positional argument such as `checkout` is a regex on file paths, so it would run every test in checkout.spec.ts and not the test in cart.spec.ts. `--project` selects config projects (browsers), and `--only` is not a CLI flag (`test.only` is a code-level modifier).',
      followUps: [
        {
          q: 'How could you run the same test by location instead of title?',
          a: 'Use the file:line syntax: `npx playwright test tests/cart.spec.ts:24`, where 24 is the line where the test is declared. It is handy when titles are long or similar, and the VS Code extension uses the same idea behind its run buttons.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-06',
      difficulty: 'medium',
      question: 'Which statements about Playwright compared with Cypress and Selenium are accurate? Select ALL that apply.',
      options: [
        'Playwright can drive several tabs and several origins in one test; Cypress does not support multiple tabs',
        'Selenium talks to browsers through the W3C WebDriver protocol via a browser driver',
        'Cypress supports Java, Python and C# test code',
        'Playwright requires you to download a matching chromedriver before running tests',
        'Playwright can run WebKit, the engine behind Safari, on Linux and Windows',
      ],
      correct: [0, 1, 4],
      explanation:
        'Playwright handles multi-tab and multi-origin flows natively, while Cypress has no multi-tab support. Selenium uses WebDriver through a driver (now managed by Selenium Manager). Cypress tests are JavaScript/TypeScript only. Playwright downloads its own browser builds and needs no chromedriver, and its WebKit build runs on all major OSes.',
      followUps: [
        {
          q: 'Is testing on Playwright\'s WebKit the same as testing on real Safari?',
          a: 'Close but not identical: it is the same rendering and JavaScript engine family, built from WebKit sources, so it catches most Safari-specific layout and behaviour bugs. It is not Apple\'s branded Safari on macOS or iOS, so critical flows may still need a check on real Safari through a device cloud or a Mac.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-07',
      difficulty: 'easy',
      question: 'Which file controls where tests live, how many workers run, retries, reporters and the browser projects?',
      options: ['playwright.config.ts', 'package.json', 'tsconfig.json', 'tests/example.spec.ts'],
      correct: [0],
      explanation:
        '`playwright.config.ts` holds runner options (testDir, workers, retries, reporter, projects) and browser options under `use`. package.json lists dependencies and scripts, tsconfig.json configures the TypeScript compiler (Playwright does not type-check with it at run time), and spec files contain tests.',
      followUps: [
        {
          q: 'Can you use a different config file for a special run?',
          a: 'Yes, with `-c` or `--config`, for example `npx playwright test -c playwright.smoke.config.ts`. Teams sometimes keep a separate config for visual tests or a different environment, although projects inside one config are usually easier to maintain.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-08',
      difficulty: 'hard',
      question: 'A tester writes this config. What is wrong with it?',
      code: {
        language: 'typescript',
        code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
  },
});
// Tests use: await page.getByTestId('username').fill('standard_user');`,
      },
      options: [
        'getByTestId looks for data-testid by default, but SauceDemo uses data-test, and with retries left at 0 the on-first-retry trace never records',
        'baseURL must not include https:// and trace must be set at the top level, not in use',
        'testDir must be an absolute path and defineConfig must receive projects or it throws',
        'Nothing is wrong; getByTestId matches any attribute starting with data-test',
      ],
      correct: [0],
      explanation:
        'getByTestId uses `data-testid` unless `use.testIdAttribute` is set, and SauceDemo marks fields with `data-test`, so the locator matches nothing. Also, `on-first-retry` only records on a retry, and retries default to 0. baseURL normally includes the scheme and trace belongs in `use`, relative testDir is fine and projects are optional, and getByTestId does not prefix-match attributes.',
      followUps: [
        {
          q: 'Besides the config, how else can you change the test id attribute?',
          a: 'Call `selectors.setTestIdAttribute(\'data-test\')` (import `selectors` from @playwright/test) before tests run, for example in a fixture or global setup. The config option is clearer and is applied per project, so it is the usual choice. Codegen has a matching `--test-id-attribute` flag.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-09',
      difficulty: 'medium',
      question: 'You want to watch tests re-run every time you save a file, inspect a DOM snapshot for each action, and pick locators by hovering. Which command gives you that?',
      options: ['npx playwright test --ui', 'npx playwright test --headed', 'npx playwright show-report', 'npx playwright test --list'],
      correct: [0],
      explanation:
        'UI mode (`--ui`) provides watch mode, a timeline of actions with DOM snapshots (time travel) and a Pick locator tool. `--headed` only shows the browser window during a normal run. `show-report` serves the last HTML report, and `--list` prints tests without running them.',
      followUps: [
        {
          q: 'How would you open UI mode from inside a Docker container or Codespace?',
          a: 'Start it on a reachable host and port, for example `npx playwright test --ui-host=0.0.0.0 --ui-port=8080`, and open that address in your browser. Be careful: binding to 0.0.0.0 can expose traces and any secrets in them to other machines on the network.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-10',
      difficulty: 'hard',
      question: 'Why does this second test fail when it runs, even though the first one passes?',
      code: {
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test';

test('log in', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});

test('inventory shows 6 items', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/inventory.html');
  await expect(page.getByText('Add to cart')).toHaveCount(6);
});`,
      },
      options: [
        'The second test gets a brand-new context with no session cookie, so SauceDemo redirects it to the login page',
        'Tests in one file run in reverse order, so the login has not happened yet',
        'toHaveCount cannot be used with getByText',
        'page.goto cannot open a deep link such as /inventory.html',
      ],
      correct: [0],
      explanation:
        'Each test receives its own browser context, so the login cookie from test 1 does not exist in test 2, and SauceDemo sends an unauthenticated visitor back to login. Tests in a file run in declaration order by default (not reversed), `toHaveCount` works with any locator, and deep links are fine once the user is logged in.',
      followUps: [
        {
          q: 'Give two correct ways to make the second test pass.',
          a: 'Log in inside the second test, ideally in a shared `test.beforeEach` or a helper so the steps are not duplicated. Or, for a large suite, log in once in a setup project, save the session with `storageState`, and configure the tests to start with it. Both keep tests independent of each other.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-11',
      difficulty: 'medium',
      question: 'Which of these belong at the TOP LEVEL of defineConfig rather than inside `use`? Select ALL that apply.',
      options: ['retries', 'baseURL', 'workers', 'reporter', 'testIdAttribute'],
      correct: [0, 2, 3],
      explanation:
        '`retries`, `workers` and `reporter` configure the test runner, so they are top-level options. `baseURL` and `testIdAttribute` change how each page/locator behaves, so they live under `use` (globally or per project). Mixing these up is one of the most common config mistakes, and TypeScript flags most of them.',
      followUps: [
        {
          q: 'Can a single project override `use` options?',
          a: 'Yes. Each project has its own `use` block that is merged over the global one, which is how a mobile project sets `...devices[\'iPhone 13\']` or a staging project sets a different `baseURL` while sharing the rest of the configuration.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-12',
      difficulty: 'hard',
      question:
        'A colleague says: "Our TypeScript tests ran fine in Playwright, so there are no type errors." Why is that reasoning wrong, and what should be added to CI?',
      options: [
        'Playwright strips TypeScript types without type-checking, so add `npx tsc --noEmit` (and lint) to CI',
        'Playwright type-checks only files that fail, so add `--strict` to the test command',
        'Playwright converts TS to Python before running, so add a Python linter',
        'The reasoning is right; Playwright refuses to run tests with any type error',
      ],
      correct: [0],
      explanation:
        'Playwright transpiles TS on the fly and does not type-check, so tests with non-critical type errors still run. The docs recommend running `tsc --noEmit` separately (plus ESLint rules such as no-floating-promises). There is no `--strict` CLI flag for type checking, there is no conversion to Python, and Playwright does not block type errors.',
      followUps: [
        {
          q: 'What else does ESLint catch that the type checker does not?',
          a: 'The `@typescript-eslint/no-floating-promises` rule catches un-awaited Promises, such as a `click()` or an `expect(...).toBeVisible()` without `await`. The type checker considers those valid code, but they are one of the most common causes of flaky Playwright tests.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-13',
      difficulty: 'expert',
      question: 'Which statements about codegen are true? Select ALL that apply.',
      options: [
        'It prefers role, text and test-id locators and refines them until they match a single element',
        'It can add assertions for visibility, text and value from its toolbar',
        '`--save-storage` / `--load-storage` let you record once logged in without logging in again',
        'Its output is production-ready and should be committed without edits',
        'It only works with Chromium and cannot emulate devices',
      ],
      correct: [0, 1, 2],
      explanation:
        'Codegen chooses resilient locators, offers assertion buttons, and can save/load authentication state between recording sessions. Its output is a draft: it lacks structure, reusable data and meaningful assertions. It supports `--browser` choices (chromium, firefox, webkit) and emulation such as `--device`, `--viewport-size` and `--color-scheme`.',
      followUps: [
        {
          q: 'Why should the saved auth.json from `--save-storage` never be committed?',
          a: 'It contains real cookies and local storage for a logged-in session, effectively a password-equivalent token. Anyone with the file can impersonate that user until the session expires. Keep it in a git-ignored folder (for example playwright/.auth) and regenerate it as needed.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-14',
      difficulty: 'hard',
      question:
        'With `retries: 2` on CI and `trace: \'on-first-retry\'`, a test fails on attempt 1 and passes on attempt 2. What does the HTML report show?',
      options: [
        'Status "flaky", with a trace attached for the retry attempt',
        'Status "passed" with no record of the first failure',
        'Status "failed", because any failed attempt fails the test',
        'Status "flaky", with a trace attached for the first failed attempt only',
      ],
      correct: [0],
      explanation:
        'When a test fails and then passes on a retry, Playwright marks it flaky (not plain passed, not failed). With `on-first-retry`, tracing is turned on for the first retry, so the trace belongs to attempt 2, not attempt 1. The first attempt\'s error is still listed in the report under its result tab.',
      followUps: [
        {
          q: 'How can you make the pipeline fail when flaky tests appear?',
          a: 'Run with `--fail-on-flaky-tests` (or the equivalent `failOnFlakyTests` config option). The run then exits non-zero if any test only passed on retry, which forces the team to fix flakiness instead of letting retries hide it. Many teams enable it once the suite is stable.',
        },
      ],
    },
    {
      id: 'pw-setup-mcq-15',
      difficulty: 'expert',
      question:
        'A chat app must be tested with a buyer and a seller exchanging messages in real time. Which approach correctly models this in @playwright/test?',
      code: {
        language: 'typescript',
        code: `test('buyer and seller chat', async ({ browser }) => {
  // Option A
  const buyer = await browser.newContext();
  const seller = await browser.newContext();
  const buyerPage = await buyer.newPage();
  const sellerPage = await seller.newPage();

  // Option B (alternative)
  // const buyerPage = await context.newPage();
  // const sellerPage = await context.newPage();
});`,
      },
      options: [
        'Option A: two contexts, so each user has independent cookies and sessions',
        'Option B: two pages in one context, because pages are fully isolated from each other',
        'Launch two browsers with chromium.launch() inside the test; contexts cannot run at the same time',
        'Use two projects in the config, one for the buyer and one for the seller',
      ],
      correct: [0],
      explanation:
        'Two different users need two isolated contexts; `browser.newContext()` twice gives them separate cookies and storage at the same time. Pages in one context share the session, so Option B would make both "users" the same person. Launching browsers is unnecessary and slower, and projects run separately (possibly in different workers), so they cannot talk to each other inside one test.',
      followUps: [
        {
          q: 'Who closes these contexts?',
          a: 'Contexts you create yourself from the browser fixture are your responsibility: call `await buyer.close()` and `await seller.close()` at the end (or in a fixture teardown). The built-in `context` and `page` fixtures are closed by the runner automatically.',
        },
      ],
    },
  ],
};

export default topic;
