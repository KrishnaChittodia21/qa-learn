import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-setup',
  phase: 'pw-basics',
  order: 1,
  title: 'Playwright Setup, Architecture & Tooling',
  subtitle:
    `What Playwright is, how it compares with Selenium and Cypress, and how browser, context and page fit together. Then install it, read the config file, write and run your first test, and meet the everyday tools: the command line, UI mode, codegen, VS Code and the HTML report.`,
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
    `Install: \`npm init playwright@latest\`. It asks TS or JS, the tests folder name and whether to add a GitHub Actions workflow. Then it downloads Chromium, Firefox and WebKit. On CI or Linux, use \`npx playwright install --with-deps\`.`,
    `Files it creates: \`playwright.config.ts\`, \`package.json\` (and lock file), \`tests/example.spec.ts\`, and \`.github/workflows/playwright.yml\` if you said yes.`,
    `Browser → context → page: Browser = one running browser. BrowserContext = a private profile, like an incognito window, with its own cookies and local storage. Page = one tab. Every test gets a fresh context and page.`,
    `A test: \`import { test, expect } from '@playwright/test'\` → \`test('title', async ({ page }) => { await page.goto(...); await expect(locator).toBeVisible(); })\`. Put \`await\` before every Playwright call.`,
    `Defaults: test timeout 30 s, expect timeout 5 s, no action or navigation timeout, retries 0, workers = half the logical CPU cores. The template adds \`fullyParallel: true\`, \`retries: CI ? 2 : 0\`, \`trace: 'on-first-retry'\` and \`reporter: 'html'\`.`,
    `Top level of the config = runner settings (testDir, timeout, retries, workers, reporter, projects, webServer). Inside \`use\` = browser and page settings (baseURL, trace, screenshot, video, headless, testIdAttribute, viewport).`,
    `Run: \`npx playwright test\` (all tests, no window, every project) · \`tests/login.spec.ts:12\` (one test by line) · \`-g "checkout"\` (by title or tag) · \`--project=chromium\` · \`--headed\` · \`--last-failed\` · \`--list\` · \`-x\`.`,
    `Debug and explore: \`--ui\` (UI mode: watch, step-by-step timeline, pick locator) · \`--debug\` (Inspector, visible browser, 1 worker, no timeout) · \`npx playwright codegen <url>\` (records your clicks as code).`,
    `Report: the HTML report is in \`playwright-report/\`. It opens by itself when a test fails locally. \`npx playwright show-report\` serves it on port 9323. Traces, screenshots and videos are in \`test-results/\`.`,
    `TypeScript works with no setup. But Playwright only removes the types; it does not check them. On CI, run \`npx tsc --noEmit\` and the \`@typescript-eslint/no-floating-promises\` lint rule to catch type errors and missing \`await\`s.`,
    `vs Selenium: no drivers, built-in waiting, cheap clean profiles per test, free parallel runs and sharding, trace viewer. vs Cypress: Playwright runs outside the browser, so many tabs, many websites, iframes and WebKit all work well.`,
    `Update: \`npm install -D @playwright/test@latest\`, then \`npx playwright install --with-deps\`. Check with \`npx playwright --version\`.`,
  ],
  sections: [
    {
      heading: 'What Playwright is (and what it is not)',
      body: `**Example:** \`await page.getByRole('button', { name: 'Login' }).click()\`

- Playwright finds the Login button the way a user sees it.
- It waits until the button can be clicked. This is called **auto-waiting**.
- Then it clicks it.

That is Playwright in one line. It is a tool that controls a real browser. It works like a careful manual tester. But it takes seconds, and it does the same steps every time.

Microsoft makes Playwright. It is free and open source.

**Two packages:**

| Package | What you get |
|---|---|
| \`@playwright/test\` (this course) | A full test runner: \`test\`, \`expect\`, fixtures (ready-made helpers like \`page\`), parallel runs, retries, reports, UI mode, trace viewer (a step-by-step replay of a test) |
| \`playwright\` | Only the browser-control part, with no runner. Used for scripts and scrapers |

**Browsers:** Chromium (Chrome, Edge), Firefox and WebKit. WebKit is the engine inside Safari. Playwright can also act like a phone, such as mobile Chrome or Mobile Safari.

Playwright downloads its own browsers. You never install a "driver" by hand.

**Languages:** TypeScript/JavaScript, Python, Java and .NET. The TypeScript version has the most tools, like UI mode and the HTML report.

**What it can test:** web pages from start to end, and APIs (with the \`request\` fixture). It can also fake network answers, compare screenshots and check accessibility with plugins.

**What it is not:** it is not a load-testing tool (use k6 or JMeter). It does not test native mobile apps (use Appium). It does not replace unit tests.

**Watch out:** Playwright is not a "Selenium wrapper". It does not use WebDriver. It talks to the browsers directly.

**In an interview, say:** "Playwright is a cross-browser tool for end-to-end tests, with its own test runner. I like three things: auto-waiting, a clean browser profile for every test, and debugging tools like UI mode and the trace viewer."

**Why testers care:** one free tool covers three browsers, UI tests and API tests.`,
      keyPoints: [
        `\`@playwright/test\` = runner + assertions + fixtures. \`playwright\` = browser control only.`,
        `One API for Chromium, Firefox and WebKit. Playwright downloads the browsers; no drivers.`,
        `Works with TS/JS, Python, Java and .NET. The TypeScript runner has the most tools.`,
      ],
      source: 'Playwright docs — Installation & Library vs Test',
    },
    {
      heading: 'Playwright vs Selenium vs Cypress',
      body: `**Example:** \`await page.getByRole('button', { name: 'Login' }).click()\`

- In Playwright, this line waits for the button by itself.
- In Selenium, you usually write an extra "wait until clickable" line first.

That one difference shows the main idea. Each tool sits in a different place:

- **Selenium** is the old, universal remote. It works with almost every language and browser. You build the parts yourself.
- **Cypress** runs inside the browser, next to your app. JavaScript developers like it. But it sees only one tab.
- **Playwright** sits outside the browser and controls it. One tool handles many tabs, many websites and three browser engines.

| Point | Playwright | Selenium 4 | Cypress |
|---|---|---|---|
| How it talks to the browser | Direct, always-open connection | WebDriver standard, through a driver program | Test code runs inside the browser |
| Languages | TS/JS, Python, Java, .NET | Java, Python, C#, JavaScript, Ruby | JavaScript/TypeScript only |
| Browsers | Chromium, Firefox, WebKit (Safari engine) | Chrome, Edge, Firefox, Safari | Chrome family, Firefox; WebKit is experimental |
| Waiting | Waits by itself before each action; assertions retry | You write the waits | Commands and assertions retry |
| Many tabs / popups | Yes | Yes, with window handles | No |
| Several websites in one test | Yes | Yes | With \`cy.origin()\`, with limits |
| iframes | \`frameLocator()\` | \`switchTo().frame()\` | Needs workarounds |
| Clean state per test | New browser context (a fresh private profile) per test, in milliseconds | Usually a new browser (slow) | Clears state between tests |
| Running tests at the same time | Built in and free | Selenium Grid or a cloud | Cypress Cloud (paid) or other tools |
| Faking network answers | \`page.route()\` | Limited | \`cy.intercept()\` |
| Debugging | UI mode, Inspector, trace viewer, HTML report | IDE debugger, screenshots | Time-travel runner |
| Mobile | Phone emulation | Real devices through Appium | Screen size only |

**When to pick which:**

- **Playwright:** new web projects. Teams that want many browsers, API tests and network faking in one free tool. Also teams that must test Safari's engine on Linux CI.
- **Selenium:** big existing Java or C# suites. Teams that already run a Selenium Grid. Testing on real phones through Appium.
- **Cypress:** JavaScript front-end teams who test one website at a time and like its runner.

**Watch out:** don't say one tool is "best" for everything. Talk about trade-offs. For example: "We had 600 Selenium Java tests and a Java team. A rewrite would take three months. For the new React app, I would start with Playwright."

**Why testers care:** this is a very common interview question. A balanced answer shows real experience.`,
      keyPoints: [
        `Playwright: outside the browser, built-in waiting, fresh context per test, free parallel runs, trace viewer.`,
        `Selenium: the WebDriver standard, most languages, Grid and Appium. You write the waits.`,
        `Cypress: inside the browser, JavaScript only, no multiple tabs, a strong interactive runner.`,
      ],
      source: 'Playwright docs — Why Playwright / Browsers; Selenium docs — WebDriver; Cypress docs — Trade-offs; Checkly — Playwright guides',
    },
    {
      heading: 'Architecture: browser → context → page',
      body: `**Example:** \`test('login', async ({ page }) => { ... })\`

- \`{ page }\` is a **fixture**: something Playwright prepares for your test and cleans up after it.
- Here it is a brand-new tab, called a **page**.
- The page lives in a brand-new **browser context**. A context is a private browser profile, like an incognito window.
- When the test ends, Playwright throws the context away.

Think of a hotel:

- The **browser** is the building. It is slow to build, so Playwright starts it once.
- A **browser context** is a guest room. It has its own key and its own bags: cookies, local storage, session storage, cache and permissions.
- A **page** is a window in that room. It is one tab.

Two rooms never share bags, even in the same building.

**What happens when you run tests:**

1. The test runner starts some **workers**. A worker is a separate process that runs tests. Several workers run at the same time.
2. Each worker opens one browser, for example Chromium. It keeps a fast, open connection to it.
3. For every test, Playwright makes a new context and a new page. When the test ends, the context is closed.

A new context takes milliseconds. A new browser takes seconds. So every test can get a clean start cheaply.

That is why test order does not matter. It is also why tests can safely run at the same time.

**Two users in one test:** create two contexts from the \`browser\` fixture. They are as separate as two laptops.

**Same user in two tabs:** use two pages in one context. They share the login cookie.

| You need | Use |
|---|---|
| A fresh user for each test | The default \`page\` fixture |
| Buyer and seller chatting in one test | \`browser.newContext()\` two times |
| Same user, a link opens a new tab | Two pages in the same \`context\` |
| Stay logged in across tests | \`storageState\`, a saved file of cookies (see pw-auth-config) |

**In an interview, say:** "Each test gets its own browser context. Playwright starts every test clean. It does not try to undo the last test."

**Why testers care:** one test cannot break the next one by leaving cookies or items in the cart.`,
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
        `Browser = slow to start; context = cheap private profile; page = one tab.`,
        `The \`page\` fixture gives every test a new context. This keeps tests apart and lets them run at the same time.`,
        `Two users → two contexts. Same user in two tabs → two pages in one context.`,
      ],
      source: 'Playwright docs — Isolation (Browser contexts); Playwright docs — Writing tests (test isolation)',
    },
    {
      heading: 'Installing Playwright with npm init playwright',
      body: `**Example:** \`npm init playwright@latest\`

- This one command creates a starter project.
- It adds a config file and a sample test.
- It downloads the browsers.

**Before you start:** install a current LTS version of Node.js. LTS means the stable version with long support. Recent docs list Node 22, 24 and 26. You also need a terminal and VS Code.

Playwright runs on Windows 11 (or WSL), recent macOS, and Debian or Ubuntu LTS.

**Steps:**

1. Make a new folder and open it in a terminal.
2. Run \`npm init playwright@latest\`. It asks four questions.
   - TypeScript or JavaScript? The default is **TypeScript**.
   - Name of the tests folder? The default is \`tests\` (or \`e2e\` if \`tests\` already exists).
   - Add a **GitHub Actions** workflow? Say yes. You will need it later.
   - Install the browsers? The default is yes.
3. Run \`npx playwright test\`. It runs the sample test in all three browsers.
4. Run \`npx playwright show-report\` to see the results.

By default the tests run **headless**. That means the browser runs with no visible window.

**Where do browsers go?** Not into \`node_modules\`. They go into a shared cache folder.

- macOS: \`~/Library/Caches/ms-playwright\`.
- Linux: \`~/.cache/ms-playwright\`.
- Windows: \`%USERPROFILE%\\AppData\\Local\\ms-playwright\`.

Each Playwright version needs its own browser builds. So after you upgrade Playwright, run \`npx playwright install\` again.

**Linux and CI:** browsers need some system files, like fonts. \`npx playwright install --with-deps\` installs the browsers and these files.

To save CI time, install only the browser you use: \`npx playwright install chromium --with-deps\`.

**Existing project?** Run the same init command inside it. Or install by hand: \`npm install -D @playwright/test\`, then \`npx playwright install\`.

**Watch out:** don't install \`playwright\` (the library) by mistake. Install \`@playwright/test\`. Otherwise you cannot import \`test\` and \`expect\`.

**Why testers care:** you go from an empty folder to a green test run in a few minutes.`,
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
        `\`npm init playwright@latest\` = project + config + sample test + optional CI workflow + browsers.`,
        `Browsers live in a cache folder for your user. Each Playwright version needs its own browsers.`,
        `\`--with-deps\` adds the system files that Linux and CI machines need.`,
      ],
      source: 'Playwright docs — Installation; Playwright docs — Browsers; Playwright docs — Best practices (CI)',
    },
    {
      heading: 'Project structure after setup',
      body: `**Example:** after \`npm init playwright@latest\`, your folder has \`playwright.config.ts\` and \`tests/example.spec.ts\`.

- \`playwright.config.ts\` holds the settings.
- \`tests/\` holds your test files.
- After a run, \`test-results/\` and \`playwright-report/\` appear. They hold the results.

It is like a project in a test management tool. There is one settings file, one place for test cases, and folders for results.

| Path | Made by | What it is for | Commit to Git? |
|---|---|---|---|
| \`playwright.config.ts\` | init | Runner and browser settings | Yes |
| \`package.json\` / lock file | init | Packages (\`@playwright/test\`, \`@types/node\`) and npm scripts | Yes |
| \`tests/example.spec.ts\` | init | A sample test. Files ending in \`.spec.ts\` or \`.test.ts\` are tests | Yes |
| \`.github/workflows/playwright.yml\` | init (if you said yes) | Runs the tests on every push or pull request | Yes |
| \`node_modules/\` | npm | Installed packages | **No** |
| \`test-results/\` | each run | Files saved for each test: traces, screenshots, videos, error details | **No** |
| \`playwright-report/\` | html reporter | The HTML report | **No** (upload it from CI instead) |
| \`playwright/.cache\`, \`playwright/.auth\` | component tests / login setup | Caches and saved login state | **No** (\`.auth\` holds secrets) |

Older versions also made \`tests-examples/demo-todo-app.spec.ts\`. It is a bigger example. Read it once, then delete it.

**Which files are tests?** Playwright looks inside \`testDir\`. It picks files that end in \`.spec.ts\` or \`.test.ts\`. The \`.js\`, \`.mjs\` and \`.tsx\` versions count too. You can change this with \`testMatch\` and \`testIgnore\`.

**A layout you can grow into.** Later in the course you will add more folders.

- \`tests/\` for test files, grouped by feature.
- \`pages/\` for page objects.
- \`fixtures/\` for your own fixtures.
- \`test-data/\` for JSON data.
- \`.env\` for local secrets. Git ignores it.

**Watch out:** never commit \`test-results/\` or \`playwright/.auth/\` to Git. The \`.auth\` folder can hold real login cookies.

**Why testers care:** a clean folder layout makes the suite easy to grow and safe to share.`,
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
        `Config, test files, package.json and the CI workflow go into Git. Results and reports do not.`,
        `By default, test files are \`*.spec.ts\` or \`*.test.ts\` inside \`testDir\`.`,
        `Never commit saved login state. It holds real session cookies.`,
      ],
      source: 'Playwright docs — Installation (what was installed); Playwright docs — Test configuration (testMatch)',
    },
    {
      heading: 'playwright.config.ts walkthrough',
      body: `**Example:** \`retries: process.env.CI ? 2 : 0\`

- On CI, a failed test runs again, up to 2 more times.
- On your laptop, it does not run again.
- This one line in \`playwright.config.ts\` sets it for the whole suite.

The config file is the settings page of your suite. It says where tests live and how long to wait. It says how many tests run at once and which browsers to use. It also says what proof to save, like screenshots.

**Rule of thumb:**

- Settings at the **top level** control the *runner*: which tests, how many workers, timeouts, retries and reports.
- Settings inside \`use\` control the *browser and page*: base URL, screen size, trace, screenshots and test id attribute.
- A **project** is one named setup, usually one browser or device. A \`use\` block inside a project overrides the main one for that project.

| Setting | Where | Default | What it does |
|---|---|---|---|
| \`testDir\` | top | config folder | Folder with your tests |
| \`timeout\` | top | 30 000 ms | Most time one test may take, including hooks and fixtures |
| \`expect.timeout\` | top | 5 000 ms | How long assertions like \`toBeVisible\` keep retrying |
| \`fullyParallel\` | top | false | Also run the tests inside one file at the same time |
| \`forbidOnly\` | top | false | Fail the run if a \`test.only\` was left in (turn on for CI) |
| \`retries\` | top | 0 | Run a failed test again. A pass on a retry is marked **flaky** |
| \`workers\` | top | half of logical CPU cores | How many test processes run at the same time |
| \`reporter\` | top | \`list\` locally, \`dot\` on CI (template sets \`html\`) | Report format |
| \`projects\` | top | one default project | Browsers and devices to run on (also setup projects) |
| \`webServer\` | top | none | Start your app before the tests |
| \`use.baseURL\` | use | none | Lets you write \`page.goto('/')\` |
| \`use.trace\` | use | \`off\` | \`on-first-retry\` records a trace only when a test is retried |
| \`use.screenshot\` / \`use.video\` | use | \`off\` | Usually \`only-on-failure\` / \`retain-on-failure\` |
| \`use.testIdAttribute\` | use | \`data-testid\` | The attribute that \`getByTestId\` reads |
| \`use.headless\` | use | true | \`--headed\` shows the window for one run |
| \`use.actionTimeout\` / \`navigationTimeout\` | use | 0 (no limit) | Limit for each action; the test timeout still applies |

Two words from the table:

- A **flaky test** sometimes passes and sometimes fails, with no code change.
- A **trace** is a recording of every step. It has page snapshots, network calls and console logs.

**SauceDemo note:** SauceDemo marks elements with \`data-test="username"\`, not \`data-testid\`. Set \`testIdAttribute: 'data-test'\`. Then \`page.getByTestId('username')\` works.

More config patterns are in **pw-auth-config**: env files, many environments, storageState and setup projects. This section is the map.

**Watch out:** don't put runner settings like \`timeout\` or \`retries\` inside \`use\`. They belong at the top level. TypeScript flags most of these mistakes.

**Why testers care:** a few lines of config make the suite fast on your laptop and strict on CI.`,
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
        `Top level = runner (timeout, retries, workers, reporter, projects). \`use\` = browser and page settings.`,
        `Defaults to remember: test 30 s, expect 5 s, retries 0, workers = half the cores, no action timeout.`,
        `\`testIdAttribute: 'data-test'\` makes \`getByTestId\` work on SauceDemo.`,
      ],
      source: 'Playwright docs — Test configuration; Playwright docs — Test use options; Playwright docs — Timeouts',
    },
    {
      heading: 'Your first test, line by line',
      body: `**Example:** \`await page.getByPlaceholder('Username').fill('standard_user')\`

- Playwright finds the box with the placeholder "Username".
- It waits until the box is ready.
- It types \`standard_user\` into it.
- \`await\` makes the test wait until the typing is done.

A Playwright test is a manual test case written as code. It has preconditions (open the page), steps (fill, click) and expected results (assertions).

| Line | Meaning |
|---|---|
| \`import { test, expect } from '@playwright/test'\` | Brings in the test function and the assertion library |
| \`test.describe('Login', ...)\` | Groups related tests, like a test suite |
| \`test('title', async ({ page }) => { ... })\` | One test case. \`{ page }\` is a fixture: a fresh tab in a fresh context |
| \`await page.goto('/')\` | Opens a page. \`/\` is added to \`baseURL\` from the config |
| \`page.getByPlaceholder('Username')\` | A **locator**: a way to find an element (next topic) |
| \`.fill(...)\`, \`.click()\` | Actions. Each one first waits until the element is visible, enabled, still and ready |
| \`await expect(page).toHaveURL(...)\` | A **web-first assertion**: it keeps checking until it is true, for up to 5 s |

**Why \`await\` everywhere?** Every Playwright action talks to the browser, and that takes time. Each action returns a Promise, a "result comes later" value.

Without \`await\`, the next line runs before the click happens. The test can even finish, and pass, before the browser does anything. You met this in the JavaScript async topic. Here it is the number-one beginner bug.

**From a manual case to code.** Keep the same shape.

- Test case title → test name.
- Steps → actions.
- Expected result → \`expect\`.

One test checks one behaviour. Tests never depend on each other, because each one starts in a new context.

**Watch out:** don't write \`expect(await locator.isVisible()).toBe(true)\`. It checks only once, right now, and does not wait. Write \`await expect(locator).toBeVisible()\` instead. There is more in pw-assertions-waiting.

**Why testers care:** your manual test cases turn into code almost line by line.`,
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
        `\`{ page }\` is a fixture: a new, separate tab for each test. The runner creates it and cleans it up.`,
        `Put \`await\` before every action and every web-first assertion.`,
        `Map manual cases directly: title → test name, steps → actions, expected result → expect.`,
      ],
      source: 'Playwright docs — Writing tests; Playwright docs — Fixtures (built-in page fixture)',
    },
    {
      heading: 'Running tests from the CLI',
      body: `**Example:** \`npx playwright test tests/login.spec.ts --project=chromium\`

- It runs only the tests in \`login.spec.ts\`.
- It runs them only in Chromium.
- With no other flags, they run headless (no window) and at the same time.

The CLI (command line) is your "run tests" screen. You choose *which* tests run, *how* they run, and *what report* you get.

| You want to… | Command |
|---|---|
| Run everything (no window, all projects, in parallel) | \`npx playwright test\` |
| Run one file | \`npx playwright test tests/login.spec.ts\` |
| Run files whose path contains some words | \`npx playwright test login cart\` |
| Run one test at a line | \`npx playwright test tests/login.spec.ts:12\` |
| Run tests whose **title** matches | \`npx playwright test -g "locked-out"\` |
| Run everything except a tag | \`npx playwright test --grep-invert @slow\` (or \`-G\`) |
| Run one browser | \`npx playwright test --project=chromium\` |
| See the browser | \`npx playwright test --headed\` |
| Run only last run's failures | \`npx playwright test --last-failed\` |
| Run only tests in files changed in Git | \`npx playwright test --only-changed=main\` |
| Just list what would run | \`npx playwright test --list\` |
| Stop at the first failure | \`npx playwright test -x\` |
| Choose how many run at once | \`npx playwright test --workers=4\` (or \`--workers=50%\`) |
| Run a test many times to find flakiness | \`npx playwright test --repeat-each=10\` |
| Step through with the Inspector | \`npx playwright test --debug\` |
| Open the interactive runner | \`npx playwright test --ui\` |

**How filters combine:** a file filter and \`-g\` both make the list smaller. Then the list is multiplied by the number of projects.

For example, a file with 4 tests and 3 browser projects gives 12 test runs.

**Tags:** put \`@smoke\` in the test title (or use the \`tag\` option). Then run with \`-g @smoke\`. Tags are covered in pw-hooks-fixtures.

**npm scripts** help the team find common commands: \`"test:smoke": "playwright test -g @smoke --project=chromium"\`.

**Watch out:** a plain word after \`test\` matches **file paths**. \`-g\` matches **test titles**. So \`npx playwright test checkout\` runs \`checkout.spec.ts\`. It does not run a test called "checkout" inside \`cart.spec.ts\`.

**Why testers care:** running only the tests you need saves minutes on every change.`,
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
        `A plain word filters by file path. \`-g\` filters by test title, including tags.`,
        `Total runs = matching tests × selected projects.`,
        `Everyday flags: \`--last-failed\`, \`--list\`, \`-x\`, \`--repeat-each\`.`,
      ],
      source: 'Playwright docs — Command line; Playwright docs — Running and debugging tests',
    },
    {
      heading: 'UI mode, codegen and the VS Code extension',
      body: `**Example:** \`npx playwright codegen https://www.saucedemo.com\`

- A browser opens, next to a small code window.
- You click and type on the site.
- Playwright writes the matching test code as you go.

Playwright has three helper tools.

- **UI mode** is a control room. You run tests and watch each step.
- **Codegen** is a recorder. It writes code while you click.
- The **VS Code extension** puts both tools inside your editor.

**UI mode** (\`npx playwright test --ui\`):

- A list of all tests is on the left. Run one file, one group or one test. Filter by name, project, \`@tag\` or status.
- **Watch mode** (the eye icon) runs a test again each time you save.
- A **timeline** keeps a snapshot of the page for every action. You can see the page before and after each step.
- Tabs show Actions, Source, Console, Network, Errors and Attachments.
- **Pick locator:** hover over the snapshot, click an element, and copy a suggested locator.

**Codegen** (\`npx playwright codegen https://www.saucedemo.com\`):

- It opens a browser and the **Inspector**, a small window that shows the code. Every click and fill becomes code.
- Toolbar buttons add **assertions** for visibility, text and value.
- It prefers role, text and test-id locators. It improves each one until it matches exactly one element.
- Useful flags: \`--device="iPhone 13"\`, \`--viewport-size=800,600\`, \`--color-scheme=dark\`, \`--lang\`, \`--timezone\`, \`--test-id-attribute=data-test\`, \`--save-storage=auth.json\` / \`--load-storage=auth.json\`, \`-o tests/recorded.spec.ts\`.

**VS Code extension** (by Microsoft, ID \`ms-playwright.playwright\`). It adds green run buttons next to each test and a Testing sidebar.

You can choose projects and turn on **Show browser**. It also has **Pick locator**, **Record new** and **Record at cursor**. You can set breakpoints, step through code and open traces.

| Tool | Best for | Not for |
|---|---|---|
| UI mode | Exploring a suite; watch mode while writing; going back through a local failure step by step | CI runs |
| \`--debug\` (Inspector) | Pausing one test and going step by step; trying locators live | Running many tests |
| Codegen | A first draft of a flow; finding locators on a new page | Final tests as they are |
| VS Code extension | Daily writing; running one test; breakpoints | Headless CI |

**In an interview, say:** "Codegen gives me a starting point. I still remove repeated steps and add real assertions. I move test data into variables and put repeated flows into page objects."

**Why testers care:** these tools show exactly what the browser did, so you fix tests faster.`,
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
        `UI mode = run, watch, step back through each action, and pick locators, on your laptop.`,
        `Codegen records actions and assertions. Treat its code as a first draft.`,
        `The VS Code extension runs, debugs, records and picks locators inside the editor.`,
      ],
      source: "Playwright docs — UI Mode; Playwright docs — Test generator; Playwright docs — Getting started VS Code; Debbie O'Brien — How to locate elements in Playwright",
    },
    {
      heading: 'The HTML report and test results',
      body: `**Example:** \`npx playwright show-report\`

- It opens the last HTML report in your browser, at \`http://localhost:9323\`.
- You see every test in every browser, marked passed, failed or flaky.
- Failed tests have screenshots and traces attached.

The HTML report is your test execution report. Without it, you would build one by hand in a spreadsheet.

**How it works:**

- With \`reporter: 'html'\`, each run writes \`playwright-report/index.html\`.
- Locally, the report **opens by itself when a test fails**.
- On CI it is only written. You upload it as a build **artifact**: a file the CI job keeps for you to download.
- Each test shows its **steps**: every action and assertion, with timings.
- It also shows the error, with the lines of code around it.
- **Attachments** are screenshots, videos and the **trace**. One click opens the trace in the trace viewer.
- Possible results: **passed**, **failed**, **flaky** (failed, then passed on a retry) and **skipped**.
- Raw files for each test are in \`test-results/<test-name>-<project>/\`. This folder is emptied at the start of each run.

**Reporters at a glance.** A reporter decides the format of the results. More in pw-debug-flaky.

- \`list\`: one line per test (local default).
- \`dot\`: very short output (CI default).
- \`line\`, \`html\` and \`json\`.
- \`junit\`: XML for Jenkins or Azure DevOps.
- \`blob\`: for joining results when tests are split across machines (sharding).
- Third-party reporters, like Allure.

You can use more than one: \`reporter: [['list'], ['html', { open: 'never' }]]\`.

**Watch out:** don't set \`trace: 'on'\` and \`video: 'on'\` for every test on CI "just to be safe". It slows the run and makes huge files. \`trace: 'on-first-retry'\` (or \`retain-on-failure\`) saves proof only when you need it.

**In an interview, say:** "When CI fails, I download the HTML report. I open the failing test's trace. I check the page snapshot and the network tab at the failing step. Only then do I change code."

**Why testers care:** the report gives you proof for every failure, ready to attach to a bug.`,
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
        `HTML report = steps, errors, screenshots, videos and traces for each test and project.`,
        `\`show-report\` serves it on port 9323. \`test-results/\` holds the raw files.`,
        `Save heavy files (trace, video) only on failure or retry.`,
      ],
      source: 'Playwright docs — Reporters (HTML reporter); Playwright docs — Best practices (debugging on CI)',
    },
    {
      heading: 'TypeScript vs JavaScript in Playwright',
      body: `**Example:** \`await login(page, 'standard_user')\`

- The \`login\` helper needs three values, but this line gives only two.
- In TypeScript, VS Code underlines the mistake before you run anything.
- In plain JavaScript, you find out only when the test fails.

TypeScript is JavaScript with labels on values, like "this is a string". The labels do not change what the code does. They let your editor warn you early.

**What Playwright does with TypeScript:** it runs \`.ts\` test files directly. There is no build step.

But it only **removes** the types. It does **not check** them. So a test with a type error can still run, and then fail in a confusing way.

| Check | How |
|---|---|
| Type errors | \`npx tsc --noEmit\` on CI (needs a \`tsconfig.json\`) |
| Missing \`await\` (a "floating" Promise that nobody waits for) | ESLint rule \`@typescript-eslint/no-floating-promises\` |
| Autocomplete for options and locators | Free in VS Code with TS |

**Should a beginner choose TypeScript?** Yes. The docs, codegen and most job posts use it.

You only need simple types: strings, numbers, \`Page\` and \`Locator\`. Everything from the JavaScript topics still works. Most type labels are optional, because TypeScript can work them out.

**Choose JavaScript when** the team's code is plain JS and adding TypeScript would slow them down. The Playwright API is the same.

**Watch out:** "it ran, so the types are fine" is wrong. Add \`tsc --noEmit\` to the pipeline.

**Why testers care:** the editor catches typos and missing values before the test ever runs.`,
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
        `Playwright runs TS files but does not check types. Run \`tsc --noEmit\` separately.`,
        `The lint rule \`no-floating-promises\` catches a missing \`await\`.`,
        `The API is the same in TS and JS. TS adds autocomplete and earlier errors.`,
      ],
      source: 'Playwright docs — TypeScript; Playwright docs — Best practices (lint your tests)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-setup-cc-1',
      title: 'Fix a config that is slow, noisy and unsafe for CI',
      context:
        `A teammate copied this playwright.config.ts from an old blog post. Now there are four problems. The SauceDemo suite (120 tests) takes 25 minutes locally. CI sometimes runs with a forgotten \`test.only\`. Every test records a video. And \`getByTestId('username')\` never finds anything.`,
      task:
        `Rewrite the config. It should be fast locally, and strict on CI with good proof of failures. It should run Chromium, Firefox and WebKit. And \`getByTestId\` should work with SauceDemo's HTML. Keep the defaults where they are already good.`,
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
        `Which settings should change when \`process.env.CI\` is set? Think about \`forbidOnly\`, \`retries\` and \`workers\`.`,
        `SauceDemo uses \`data-test\`, but \`getByTestId\` reads \`data-testid\` by default. Which setting changes that?`,
        `Which \`trace\`, \`video\` and \`screenshot\` modes save files only when a test fails or retries? And which setting lets you write \`page.goto('/inventory.html')\`?`,
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
      explanation: `**The fixes, one by one:**

- **\`fullyParallel: true\` and default workers locally:** each test already gets its own browser context, so running tests at the same time is safe. One worker turned a 4-minute suite into 25 minutes. If parallel runs fail, the tests share data. That is the real bug to fix.
- **\`forbidOnly: !!process.env.CI\`:** a forgotten \`test.only\` quietly skips the rest of the suite. With this line, CI fails loudly instead.
- **Retries only on CI:** three retries on your laptop hide real failures while you work. Two retries on CI absorb random environment problems. The report marks those tests **flaky**.
- **Timeout back to the 30 s default:** with a 5-minute timeout, a stuck test wastes 5 minutes before it tells you anything.
- **\`baseURL\`:** removes the full address from every test. You can point the suite at staging with one change.
- **\`testIdAttribute: 'data-test'\`:** SauceDemo's attribute is \`data-test\`, so \`getByTestId\` needs this to match.
- **Save files only on failure:** \`trace: 'on'\` and \`video: 'on'\` for 120 tests × 3 browsers is slow and huge. \`on-first-retry\` and \`retain-on-failure\` keep only the proof you need for debugging.
- **Headless by default:** opening windows slows the run. Use \`--headed\` or \`--ui\` when you want to watch.
- **Three engines:** WebKit catches Safari-only bugs that a Chromium-only suite misses.`,
      followUps: [
        {
          q: 'Why set workers to a small number on CI instead of leaving it undefined?',
          a: `CI machines often have few CPU cores and little memory. The app may also be a shared staging server. A small, fixed number of workers keeps runs steady. Too many workers overload the machine, and the timeouts then look like flaky tests. To go faster on CI, add more machines with \`--shard\`, not more workers per machine.`,
        },
        {
          q: 'What does "flaky" mean in the HTML report, and is it OK to ship with flaky tests?',
          a: `A test is flaky when it failed at least once and then passed on a retry in the same run. Retries keep the pipeline green, but a flaky test is still a bug in the test or the app. It makes people stop trusting the suite, and it can hide real problems. Track flaky tests and open the retry trace. Fix the cause: shared data, a missing web-first assertion, or a race with the network. Once the suite is stable, think about \`--fail-on-flaky-tests\`.`,
        },
      ],
    },
    {
      id: 'pw-setup-cc-2',
      title: 'A first test written like a manual script',
      context:
        `A manual tester turned two SauceDemo test cases into Playwright code. Locally the run is green most of the time. On CI it is red. It is also red whenever the cart test runs alone with \`npx playwright test -g "cart"\`.`,
      task:
        `Rewrite the file so each test stands alone, waits correctly, and checks what a user would see. Use the config from the previous challenge (baseURL and testIdAttribute: data-test).`,
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
        `Each test gets a brand-new browser context. What happens to \`loggedInPage\` when the second test runs alone, or in another worker?`,
        `Find the line with no \`await\`. Replace the fixed sleep with an assertion that waits for the inventory page.`,
        `Move the shared steps into \`beforeEach\` (or a helper). Use test-id or role locators and web-first assertions instead of \`page.$\` and \`innerText()\`.`,
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
      explanation: `**What was wrong, and why the fix works:**

- **Tests shared state:** \`loggedInPage\` belongs to test 1's context. Playwright closes that context when test 1 ends. So test 2 drives a closed page. When test 2 runs alone or in another worker, the variable is \`undefined\`. Tests must stand alone, and \`beforeEach\` gives each one its own login.
- **No \`await\` on the click:** the test moved on before the click happened. Only the sleep hid this.
- **\`waitForTimeout(3000)\`:** too long when the app is fast, too short on a slow CI machine. \`await expect(page).toHaveURL(...)\` waits exactly as long as needed, up to 5 s.
- **\`page.$\`, \`innerText()\` and a plain \`expect\`:** \`page.$\` returns an ElementHandle, a fixed pointer to one element, which is discouraged. The plain \`expect\` checks once and does not retry. \`await expect(locator).toHaveText('1')\` keeps checking until the badge updates.
- **Full address and CSS ids in the test:** \`baseURL\` and test-id or role locators make tests easier to move and to read.
- **Better checks:** the solution also checks that the button changes to Remove. A real user would notice that.`,
      followUps: [
        {
          q: 'Logging in through the UI before every test is slow. What would you do once the suite has 200 tests?',
          a: `Log in once in a setup project and save the session with \`storageState\`, a file of cookies and local storage. Then point \`use.storageState\` at that file, so test projects start already logged in. Every test still gets its own context, but each context starts with the saved cookies. Tests stay separate, and only the real login tests use the login form.`,
        },
        {
          q: 'If two tests really must run in order (for example create then delete), how would you express that?',
          a: `First ask if they really must. Usually each test should create its own data, ideally through the API, so it can run alone. If the order really matters, put the tests in \`test.describe.serial\` (or set the describe mode to serial). Then they run in one worker, in order, and later tests are skipped if an earlier one fails. Share data through variables declared in the describe block, never through a page from another test.`,
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-setup-iq-01',
      difficulty: 'medium',
      question: `What is Playwright? Why would you pick it over Selenium or Cypress for a new web project?`,
      context: 'A very common opener in 2025–2026 automation interviews (it appears in most published Playwright question banks, e.g. TestDino and Testleaf).',
      whatInterviewerLooksFor: [
        `A clear one-line definition, not marketing words.`,
        `Real technical differences: auto-waiting, a fresh context per test, a direct browser connection, many tabs and websites, WebKit.`,
        `Fair trade-offs: when Selenium or Cypress is still the better choice.`,
        `A link to tester problems: flaky tests, slow debugging, CI cost.`,
      ],
      modelAnswer: `**Definition:** Playwright is a free, open-source tool from Microsoft for end-to-end tests in many browsers. The \`@playwright/test\` package gives you browser control *and* a test runner in one: assertions, fixtures, parallel workers, retries and reports.

**Why I would choose it for a new web project:**

1. **Fewer flaky tests.** Every action waits by itself until the element is visible, enabled and still. \`expect(locator)\` assertions keep retrying. In Selenium I write these waits myself.
2. **Cheap, clean state.** Each test gets a new browser context, a private profile made in milliseconds. Tests don't share cookies, so they can run at the same time.
3. **Real cross-browser testing.** Chromium, Firefox and WebKit from one API. I can test Safari's engine on Linux CI.
4. **Flows Cypress finds hard:** many tabs, popups, several websites in one test, and iframes with \`frameLocator\`.
5. **Debugging and reports:** UI mode, the Inspector, the trace viewer and the HTML report, all free. Parallel runs and sharding are built in.
6. **UI and API in one tool:** the \`request\` fixture, and \`page.route\` to fake network answers.

**When I would not switch:** a large, healthy Selenium Java suite with a Java team and a Grid. A rewrite would cost more than it saves. Also when we need real phones through Appium, or a Cypress team is already happy testing one website.

**Example:** on SauceDemo, a login → add to cart → checkout flow in Playwright needs no wait lines at all. The same Selenium test usually needs waits around the inventory page and the cart badge.`,
      followUps: [
        {
          q: 'Is Playwright built on top of WebDriver?',
          a: `No. Playwright keeps its own direct, always-open connection to each browser. For Chromium it uses the Chrome DevTools Protocol. For Firefox and WebKit it uses its own patched builds. That is why it downloads its own browsers. Selenium uses the W3C WebDriver standard through a separate driver program, and newer versions add WebDriver BiDi.`,
        },
        {
          q: 'Which languages can you use, and does the language matter?',
          a: `TypeScript/JavaScript, Python, Java and .NET all share the same core API. The difference is the runner. TypeScript/JavaScript uses \`@playwright/test\`, with fixtures, projects, UI mode, sharding and the HTML report built in. Python, Java and .NET use pytest, JUnit/TestNG or NUnit/MSTest. I pick the language the team knows best, and TypeScript by default for web teams.`,
        },
        {
          q: 'What is one real limitation of Playwright?',
          a: `It does not test native mobile apps; it only emulates mobile browsers. It is not a load-testing tool. Its bundled browsers are not the exact branded Chrome or Safari your users have, although you can use \`channel: 'chrome'\` or \`'msedge'\`. And for Safari on a real Mac or iPhone you still need a device cloud or a Mac.`,
        },
      ],
      pitfalls: [
        `Saying "Playwright is faster" without saying why (direct connection, cheap contexts, parallel workers).`,
        `Calling Playwright a Selenium wrapper, or saying it uses WebDriver.`,
        `Saying Playwright is always better, with no trade-offs for Selenium or Cypress.`,
      ],
    },
    {
      id: 'pw-setup-iq-02',
      difficulty: 'medium',
      question: `Explain browser, browser context and page. Why does Playwright make a new context for every test?`,
      whatInterviewerLooksFor: [
        `The correct order (browser → context → page) and what each one holds.`,
        `Isolation explained with cookies and storage, not vague words.`,
        `Knows a context is cheap and a new browser is slow.`,
        `Can use it: two users in one test, popups.`,
      ],
      modelAnswer: `**The three levels:**

- **Browser:** one running browser (Chromium, Firefox or WebKit). It is slow to start, so each worker starts it once and reuses it.
- **Browser context:** a private profile inside that browser, like an incognito window. It has its own cookies, local storage, session storage, cache and permissions. It also holds settings like location and screen size.
- **Page:** one tab (or popup) inside a context. Pages in the same context share its cookies.

**Why a new context for each test:**

The built-in \`page\` fixture makes a fresh context for every test and closes it at the end. So:

1. Items left in the cart, or a login cookie, cannot affect the next test.
2. Order doesn't matter. Tests can run at the same time and be split across machines.
3. You can run any single test alone to debug it.

Playwright prefers **starting clean** to cleaning up afterwards. Cleanup code is easy to forget, and some things cannot be undone. A new context takes milliseconds. A new browser per test, the old Selenium way, takes seconds.

**Using it:**
- *Buyer and seller chat:* call \`browser.newContext()\` twice. Now there are two separate users in one test.
- *A "Terms" link opens a new tab:* same context, with \`context.waitForEvent('page')\`. The new tab shares the login.
- *Faster logins:* save a context's cookies with \`storageState\` and load them into new contexts.`,
      followUps: [
        {
          q: 'If contexts are isolated, how do you avoid logging in through the UI in every test?',
          a: `Log in once, in a setup project or global setup. Call \`context.storageState({ path })\` to save the cookies and local storage to a JSON file. Then set \`use.storageState\` to that file. Every test still gets a new context, but it starts already logged in. Tests stay separate, and only the real login tests use the form.`,
        },
        {
          q: 'Do two tests in the same worker share the browser? Is that a problem?',
          a: `Yes. A worker reuses its browser for all the tests it runs. But each test gets its own context, so no cookies or storage leak between them. Contexts do not protect things outside the browser, such as rows in the app's database. Each test should create its own unique data to stay independent.`,
        },
      ],
      pitfalls: [
        `Mixing up context and page (saying each tab has its own cookies).`,
        `Saying Playwright "clears cookies after each test". It makes a new context instead.`,
        `Thinking contexts also separate server data, like database records.`,
      ],
    },
    {
      id: 'pw-setup-iq-03',
      difficulty: 'easy',
      question: `Walk me through setting up Playwright from scratch for a new project, up to the first green test.`,
      whatInterviewerLooksFor: [
        `What you need first (Node LTS, an editor) and the exact install command.`,
        `Knows which files are created and what each one is for.`,
        `Runs the tests, opens the report, and knows the CI install flag.`,
        `Makes sensible first config changes (baseURL, testIdAttribute).`,
      ],
      modelAnswer: `**1. Before starting:** install a current LTS version of Node.js, and VS Code with the Playwright extension.

**2. Create the project:** in an empty folder, run \`npm init playwright@latest\`. I choose **TypeScript**, keep the \`tests\` folder, and say **yes** to the GitHub Actions workflow and to installing browsers.

**3. What I get:**
- \`playwright.config.ts\`: runner and browser settings. It has Chromium, Firefox and WebKit projects, the HTML reporter, retries on CI and \`trace: 'on-first-retry'\`.
- \`tests/example.spec.ts\`: a sample test.
- \`package.json\` with \`@playwright/test\`.
- \`.github/workflows/playwright.yml\`, if I said yes.

**4. Run and look:** \`npx playwright test\` runs everything headless and in parallel. \`npx playwright show-report\` opens the HTML report. While writing tests, I keep \`npx playwright test --ui\` open.

**5. First config changes for a real app like SauceDemo:** \`baseURL: 'https://www.saucedemo.com'\`, so tests can use \`page.goto('/')\`. And \`testIdAttribute: 'data-test'\`, because SauceDemo does not use the default \`data-testid\`.

**6. First real test:** I take a manual case (valid login). I use codegen once to see good locators. Then I write it cleanly: fill username and password, click Login, and \`await expect(page).toHaveURL(/inventory/)\`.

**7. Housekeeping:** add \`node_modules\`, \`test-results\`, \`playwright-report\` and \`playwright/.auth\` to \`.gitignore\`. Add npm scripts for common runs. On CI, use \`npx playwright install --with-deps\` (or only \`chromium\`).`,
      followUps: [
        {
          q: 'The example test fails on a fresh Linux CI runner with missing shared libraries. Why?',
          a: `The browsers were downloaded, but the system packages they need are missing. These are things like fonts, graphics and media libraries, and a bare Linux image does not have them. Run \`npx playwright install --with-deps\` in the pipeline (optionally only \`chromium\`). Or use the official Playwright Docker image, which already has the browsers and these packages for one Playwright version.`,
        },
        {
          q: 'How do you upgrade Playwright safely?',
          a: `Update the package with \`npm install -D @playwright/test@latest\`. Then run \`npx playwright install --with-deps\` to download the matching browsers. Check with \`npx playwright --version\`. Read the release notes for breaking changes. Run the full suite on a branch first. If CI uses a Docker image, use the same version there.`,
        },
      ],
      pitfalls: [
        `Installing the \`playwright\` library instead of \`@playwright/test\`.`,
        `Not knowing that browsers are separate downloads, tied to the Playwright version.`,
        `Committing the test-results or playwright-report folders to Git.`,
      ],
    },
    {
      id: 'pw-setup-iq-04',
      difficulty: 'hard',
      question: `Walk me through the important settings in playwright.config.ts. Which ones would you change for CI, and why?`,
      whatInterviewerLooksFor: [
        `Separates top-level runner settings from \`use\` settings.`,
        `Knows the main defaults: 30 s test, 5 s expect, 0 retries, workers = half the cores.`,
        `Reasons about CI: forbidOnly, retries, workers, reporters, when to record traces.`,
        `Mentions projects for browsers, and baseURL for switching environments.`,
      ],
      modelAnswer: `I split the config into two halves.

**Runner settings (top level):**
- \`testDir\` / \`testMatch\`: where tests are. By default, files named \`*.spec.ts\` or \`*.test.ts\`.
- \`timeout\`: the limit for each test, **30 s** by default. \`expect.timeout\`: **5 s** by default, for web-first assertions.
- \`fullyParallel\`: also run tests inside one file at the same time.
- \`workers\`: by default, **half the logical CPU cores**.
- \`retries\`: **0** by default.
- \`reporter\`: \`list\` locally and \`dot\` on CI by default. The template sets \`html\`.
- \`projects\`: the browsers and devices. Later also a setup project for login.
- \`webServer\`: starts the app before the tests, when it runs locally.

**Browser settings (\`use\`):** \`baseURL\`, \`trace\`, \`screenshot\`, \`video\`, \`headless\`, \`viewport\`, \`testIdAttribute\`, \`storageState\`, \`actionTimeout\`.

**What changes on CI (using \`process.env.CI\`):**

| Setting | Local | CI | Why |
|---|---|---|---|
| \`forbidOnly\` | false | true | A forgotten \`test.only\` must not quietly skip the suite |
| \`retries\` | 0 | 2 | Absorb random CI problems; a pass on retry is marked flaky |
| \`workers\` | default | small fixed number | Small CI machines, shared staging; add machines with \`--shard\` |
| \`reporter\` | list + html | dot + html (\`open: 'never'\`) + junit/blob | Files for people, for Jenkins and for merging |
| \`trace\` | on-first-retry | on-first-retry | Proof exactly for the retried failures |
| \`baseURL\` | localhost or staging | from an env variable | Same suite, many environments |

**Example:** for SauceDemo I also set \`testIdAttribute: 'data-test'\`. I run Chromium on every pull request, and all three browsers every night, picking projects with \`--project\`.`,
      followUps: [
        {
          q: 'Where does the expect timeout live, and why not just raise the test timeout?',
          a: `It is a top-level setting: \`expect: { timeout: 10_000 }\`. You can also pass \`{ timeout }\` to one assertion. The test timeout covers the whole test, including hooks. Raising it does not make one assertion wait longer, because each assertion still stops at the expect timeout. Raise only the timeout for the slow thing. Better still, fix the slowness instead of hiding it.`,
        },
        {
          q: 'What is the difference between `trace: \'on-first-retry\'` and `\'retain-on-failure\'`?',
          a: `\`on-first-retry\` records a trace only on the first retry of a failed test. So it needs \`retries\` above 0, and the first failed attempt has no trace. \`retain-on-failure\` records every test but keeps the trace only for failed ones. You get proof from the very first failure, but recording every test costs time. CI templates use on-first-retry because it is cheaper.`,
        },
      ],
      pitfalls: [
        `Putting \`timeout\` or \`retries\` inside \`use\`.`,
        `Setting high retries everywhere just to make the pipeline green.`,
        `Recording video and trace for every test on CI by default.`,
      ],
    },
    {
      id: 'pw-setup-iq-05',
      difficulty: 'easy',
      question: `How do you run just one test, one file, one browser, or only the smoke tests from the command line?`,
      whatInterviewerLooksFor: [
        `Exact commands, not vague words.`,
        `Knows the file-path filter vs the \`-g\` title filter.`,
        `Knows \`--project\`, \`file:line\`, \`--last-failed\` and \`--headed\`.`,
        `Knows that the number of runs is multiplied by the projects.`,
      ],
      modelAnswer: `Everything goes through \`npx playwright test\` plus filters:

| Goal | Command |
|---|---|
| Whole suite | \`npx playwright test\` |
| One file | \`npx playwright test tests/cart.spec.ts\` |
| Files whose path contains "cart" | \`npx playwright test cart\` |
| One test by line number | \`npx playwright test tests/cart.spec.ts:18\` |
| Tests by title or tag | \`npx playwright test -g "@smoke"\` |
| Leave out a tag | \`npx playwright test --grep-invert "@slow"\` |
| One browser | \`npx playwright test --project=chromium\` |
| Watch it run | add \`--headed\` (or use \`--ui\`) |
| Only what failed last time | \`npx playwright test --last-failed\` |
| See the list without running | \`npx playwright test --list\` |

**Key detail:** a plain word after \`test\` is a pattern for **file paths**. \`-g\` is a pattern for the **full test title**: the describe titles, the test title and the tags.

Filters work together. Then the result is multiplied by the selected projects. For example, 5 smoke tests × 3 browser projects = 15 runs, unless I add \`--project\`.

In the editor I mostly use the run button in the VS Code extension. Sometimes I add \`test.only\` for a moment, with \`forbidOnly\` on CI so it can't be merged. For the team, I add npm scripts like \`"test:smoke": "playwright test -g @smoke --project=chromium"\`.`,
      followUps: [
        {
          q: 'What is the risk of using `test.only` to run a single test?',
          a: `If someone commits it, the runner runs only that test (and other \`.only\` tests) and reports success. The rest of the suite quietly stops running. Protect against it with \`forbidOnly: !!process.env.CI\`, which makes any \`.only\` fail on CI. For local focus, prefer CLI filters (\`file:line\`, \`-g\`) or the VS Code run button.`,
        },
        {
          q: 'How does `--last-failed` know what failed?',
          a: `After each run, Playwright writes a small "last run" file in the output folder. It lists the failed tests. \`--last-failed\` reads that file and runs only those tests. The file lives in \`test-results\`, so it shows your own last local run. On split (sharded) CI runs, each machine has its own file. That is why the docs show a custom \`--last-failed-file\` option for that case.`,
        },
      ],
      pitfalls: [
        `Thinking a plain word after \`test\` matches test titles.`,
        `Forgetting that each selected project multiplies the number of runs.`,
        `Using \`test.only\` and then committing it.`,
      ],
    },
    {
      id: 'pw-setup-iq-06',
      difficulty: 'medium',
      question: `Would you build your suite with codegen? When do you use codegen, UI mode, --debug and the VS Code extension?`,
      whatInterviewerLooksFor: [
        `Sees codegen as a tool for locators and first drafts, not a framework.`,
        `Knows what each tool does and picks the right one for each situation.`,
        `Can explain the clean-up after recording: assertions, data, page objects.`,
        `Mentions Pick locator, and the test id setting for codegen.`,
      ],
      modelAnswer: `**Codegen** (\`npx playwright codegen <url>\`) records my clicks and typing as Playwright code. Its toolbar adds assertions for visibility, text and value. It picks strong locators (role, text, test id) and improves each one until it matches exactly one element.

I use it to **find locators** on a new page and to get a **first draft** of a flow. I don't commit its code as it is. Recorded code repeats setup steps, uses fixed data, has extra clicks and weak assertions. After recording I:
1. keep the locators and delete the noise;
2. add real assertions (URL, heading, cart badge);
3. move data into variables or fixtures;
4. move repeated flows, like login, into \`beforeEach\`, a page object or a setup project.

For SauceDemo I run \`codegen --test-id-attribute=data-test\`, so it suggests \`getByTestId('login-button')\` correctly.

**Choosing a tool:**

| Situation | Tool |
|---|---|
| Writing tests, want quick feedback on save | UI mode with watch mode |
| A failing test, need to see the page at each step | UI mode timeline locally; trace viewer for CI failures |
| Pause one test, go step by step, try locators live | \`--debug\` (Inspector; visible browser, one worker, no timeout) |
| Daily editing, running one test, breakpoints | VS Code extension |
| New page, which locator should I use? | Pick locator in UI mode, VS Code or codegen |`,
      followUps: [
        {
          q: 'Codegen produced `page.locator(\'#root > div > div:nth-child(2) > input\')` for a field. What does that tell you?',
          a: `Codegen falls back to CSS structure when the element has nothing better. That means no role with a usable name, no label, no placeholder and no test id. This points to poor accessibility or missing test hooks in the HTML. I would look for a placeholder or label I could use. Otherwise I would ask the developers to add a proper label or a \`data-testid\`. A label also helps screen-reader users.`,
        },
        {
          q: 'What does `--debug` change compared with a normal run?',
          a: `It opens the Playwright Inspector and shows the browser window. It uses only one worker and turns off timeouts, so you can pause as long as you like. You can step over each action, see the target element highlighted, and edit locators live. You can debug from one test with \`npx playwright test file.spec.ts:10 --debug\`, or call \`await page.pause()\` in the code.`,
        },
      ],
      pitfalls: [
        `Saying "I record everything with codegen, so I don't need to code".`,
        `Committing recorded tests that have no assertions.`,
        `Using UI mode or --headed in CI pipelines.`,
      ],
    },
    {
      id: 'pw-setup-iq-07',
      difficulty: 'expert',
      question:
        `Your company has 800 Selenium Java UI tests. They take 3 hours and 10% are flaky. Your manager asks: should we move to Playwright? How do you answer?`,
      whatInterviewerLooksFor: [
        `Does not jump to "rewrite everything".`,
        `Separates tool problems from test-design problems.`,
        `Suggests a small, measured pilot with clear success numbers.`,
        `Thinks about language, team skills, infrastructure and duplicate coverage.`,
      ],
      modelAnswer: `I would decide with data, not because a tool is popular.

**1. Find the causes first.** Why is the suite slow and flaky? I would look at 30 flaky failures. Are they missing waits and stale elements? Playwright's auto-waiting and locators help with those. Or are they shared test data, unstable environments and setup done through the UI? Those problems follow us into any tool. Why 3 hours? Maybe tests run one by one, each opens a new browser, and each logs in through the UI.

**2. Quick wins without moving:** run tests in parallel on Grid, create data through the API, and remove sleeps. If this fixes most problems, moving is less urgent.

**3. A pilot.** Pick one important area, for example checkout with about 40 tests, and write it in Playwright. Playwright has a Java version, so the team could keep Java. Or it could move to TypeScript if the developers use it. Measure:

| Metric | Selenium today | Playwright pilot target |
|---|---|---|
| Runtime for the 40 tests | baseline | at least 2–3× faster with workers + storageState |
| Flaky rate over 2 weeks | ~10% | under 2% |
| Time to understand a CI failure | baseline | shorter with traces |
| Effort per new test | baseline | the same or lower |

**4. If the pilot wins, move step by step.** New tests go to Playwright. Old tests move when they break or their feature changes. Both suites run on CI until coverage overlaps. Then delete duplicates. Move business-rule checks down to API tests instead of copying every UI test.

**5. Risks:** the team must learn a new tool (plan training). Real-device or old-browser needs may still need Selenium or Appium. Reports must connect to CI (the JUnit reporter works with Jenkins). And for a while there are two suites to maintain.

**My recommendation:** a short pilot with agreed numbers, then decide.`,
      followUps: [
        {
          q: 'Which Playwright features would most directly attack the 3-hour runtime?',
          a: `Run many tests at the same time in parallel workers, with a fresh context per test instead of a fresh browser. Split the suite across CI machines with \`--shard\`. Log in once with \`storageState\` and a setup project, instead of logging in through the UI in every test. Create test data with the \`request\` fixture, not through the UI. Together these matter more than the raw speed of the browser connection.`,
        },
        {
          q: 'Would you port every Selenium test one-to-one?',
          a: `No. A move is the right time to delete duplicate or low-value UI tests. Business-rule checks can move down to API or unit tests. Keep only the user journeys that need a real browser. Copying 800 tests one by one would bring the same design problems, and probably the same flakiness. I would map the tests to risks and rebuild coverage on purpose.`,
        },
      ],
      pitfalls: [
        `Promising Playwright will fix flakiness caused by shared test data or unstable environments.`,
        `Suggesting a full rewrite at once, with no pilot and no numbers.`,
        `Ignoring the team's language skills and the existing setup.`,
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
        `Filters make the list of tests smaller. Projects multiply it. "Why did it run 3 times?" usually means you forgot the project multiplier. "Why did nothing run?" usually means you mixed up the file-path filter and the title filter.`,
      followUps: [
        {
          q: 'How can you check these numbers without running anything?',
          a: `Add \`--list\` to any command. Playwright prints every test that would run, with its project in front, and a total count. It does not open any browser. It is the quickest way to check a \`-g\` pattern, a tag plan or a CI shard command before a real run.`,
        },
        {
          q: 'How would you make @smoke tests run only on Chromium permanently, without remembering flags?',
          a: `Add an npm script such as \`"test:smoke": "playwright test -g @smoke --project=chromium"\`. Or add a special project to the config, for example \`{ name: 'smoke', grep: /@smoke/, use: { ...devices['Desktop Chrome'] } }\`, and run it with \`--project=smoke\`. The config option is easy for the team to find and works the same locally and on CI.`,
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
        `\`on-first-retry\` is cheap. But it gives you nothing locally, where there are no retries. On CI it covers only the first retry. If you need a trace of the very first failure, use \`retain-on-failure\`, or run once with \`--trace on\`.`,
      followUps: [
        {
          q: 'Locally you want a trace for a failing test right now. What is the quickest way?',
          a: `Run just that test again with tracing turned on: \`npx playwright test tests/cart.spec.ts:12 --trace on\`. Then open the trace from the HTML report, or with \`npx playwright show-trace\`. Or run the test in UI mode. It shows the same timeline, page snapshots and network calls live, with no trace file needed.`,
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
        `Ask: "Is this the same person?" Same person → same context, more pages. Different person → different context. Different browser engine → different project. In @playwright/test you almost never start a browser yourself.`,
      followUps: [
        {
          q: 'In scenario 2, how would you avoid logging both users in through the UI?',
          a: `In a setup project, make one storageState file per role, for example admin.json and customer.json. In the test, call \`browser.newContext({ storageState: 'playwright/.auth/admin.json' })\`, and do the same for the customer. Each context starts already logged in as its role. The test can then focus on the approval, not on the login form.`,
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-setup-mcq-01',
      difficulty: 'easy',
      question: `Which command creates a new Playwright Test project with a config file, a sample test and the browsers?`,
      options: ['npm init playwright@latest', 'npm install playwright', 'npx playwright codegen', 'npx create-playwright-config'],
      correct: [0],
      explanation:
        `\`npm init playwright@latest\` runs the official setup. It asks TS or JS, the tests folder and whether to add a GitHub Actions workflow, then installs the browsers. \`npm install playwright\` adds only the browser-control library: no runner, no config. \`codegen\` records tests in a project that already exists. \`create-playwright-config\` is not a real command.`,
      followUps: [
        {
          q: 'What extra step is needed on a fresh Linux CI image?',
          a: `Run \`npx playwright install --with-deps\` (or \`npx playwright install chromium --with-deps\`). It installs the browsers and the system libraries they need. Or use the official Playwright Docker image, which already has them for one version.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-02',
      difficulty: 'easy',
      question: `In Playwright, what is a BrowserContext?`,
      options: [
        'An isolated, incognito-like browser profile with its own cookies and storage',
        'A single browser tab inside a window',
        'A separate browser process launched for every test',
        'The Node.js worker process that executes test files',
      ],
      correct: [0],
      explanation:
        `A context is a private profile inside a running browser, like an incognito window. It has its own cookies, local storage, session storage, cache and permissions. A tab is a Page, and a page lives inside a context. Playwright does not start a new browser for each test; contexts are the cheap option. Worker processes belong to the test runner, not to contexts.`,
      followUps: [
        {
          q: 'Do two pages in the same context share the login session?',
          a: `Yes. Pages in one context share its cookies and storage. So a link that opens a new tab keeps the user logged in. To act as two different users, make two contexts instead.`,
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
        `Without \`await\`, the test does not wait for the login click. The next line starts at once. Here the next action waits by itself for the add-to-cart button, so the test may still pass. That is why a missing \`await\` is sneaky and makes tests flaky. Playwright has no hidden queue. TypeScript does not force \`await\` (a lint rule does). And a click without \`await\` does not throw right away.`,
      followUps: [
        {
          q: 'How do you catch this class of bug automatically?',
          a: `Turn on the ESLint rule \`@typescript-eslint/no-floating-promises\` and run it on CI. The Playwright best-practices page recommends it. It flags any Promise that nobody awaits or handles, including Playwright actions and assertions without \`await\`.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-04',
      difficulty: 'medium',
      question: `playwright.config.ts has no timeout settings at all. Which defaults apply? Select ALL that apply.`,
      options: [
        'Each test may run for up to 30 seconds',
        'Web-first assertions like toBeVisible retry for up to 5 seconds',
        'Each action such as click() has its own 10-second limit',
        'Failed tests are retried twice',
        'Workers default to half of the logical CPU cores',
      ],
      correct: [0, 1, 4],
      explanation:
        `The defaults are: 30 s per test, 5 s for \`expect\` assertions, and workers = half the logical CPU cores. Actions have no time limit of their own by default (0 means only the test timeout applies), so the 10-second option is wrong. \`retries\` is 0 by default. The "2 on CI" value comes from the generated template, not from Playwright itself.`,
      followUps: [
        {
          q: 'How do you give a single slow assertion more time without changing the global setting?',
          a: `Give that one assertion its own timeout: \`await expect(page.getByTestId('title')).toHaveText('Products', { timeout: 10_000 })\`. For a whole slow test, use \`test.slow()\` (it triples the timeout) or \`test.setTimeout(ms)\` inside the test.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-05',
      difficulty: 'medium',
      question:
        `Your suite has \`tests/checkout.spec.ts\`. It also has a test titled "checkout shows total" inside \`tests/cart.spec.ts\`. Which command runs ONLY the test titled "checkout shows total"?`,
      options: [
        'npx playwright test -g "checkout shows total"',
        'npx playwright test checkout',
        'npx playwright test --project="checkout shows total"',
        'npx playwright test --only "checkout shows total"',
      ],
      correct: [0],
      explanation:
        `\`-g\` (or \`--grep\`) filters by test title. A plain word like \`checkout\` is a pattern for file paths. It would run every test in checkout.spec.ts, and not the test in cart.spec.ts. \`--project\` picks config projects (browsers). \`--only\` is not a command-line flag; \`test.only\` is something you write in code.`,
      followUps: [
        {
          q: 'How could you run the same test by location instead of title?',
          a: `Use the file:line form: \`npx playwright test tests/cart.spec.ts:24\`, where 24 is the line where the test starts. It helps when titles are long or look alike. The VS Code run buttons use the same idea.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-06',
      difficulty: 'medium',
      question: `Which statements comparing Playwright with Cypress and Selenium are correct? Select ALL that apply.`,
      options: [
        'Playwright can drive several tabs and several origins in one test; Cypress does not support multiple tabs',
        'Selenium talks to browsers through the W3C WebDriver protocol via a browser driver',
        'Cypress supports Java, Python and C# test code',
        'Playwright requires you to download a matching chromedriver before running tests',
        'Playwright can run WebKit, the engine behind Safari, on Linux and Windows',
      ],
      correct: [0, 1, 4],
      explanation:
        `Playwright handles many tabs and many websites in one test. Cypress has no multi-tab support. Selenium talks to browsers through WebDriver and a driver program (now managed by Selenium Manager). Cypress tests are JavaScript or TypeScript only, so the Java/Python/C# option is wrong. Playwright downloads its own browsers and needs no chromedriver. Its WebKit build runs on all major operating systems.`,
      followUps: [
        {
          q: 'Is testing on Playwright\'s WebKit the same as testing on real Safari?',
          a: `Close, but not the same. It is built from the same WebKit engine, so it catches most Safari-only layout and behaviour bugs. But it is not Apple's own Safari on macOS or iOS. Important flows may still need a check on real Safari, through a device cloud or a Mac.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-07',
      difficulty: 'easy',
      question: `Which file sets where tests live, how many workers run, retries, reporters and the browser projects?`,
      options: ['playwright.config.ts', 'package.json', 'tsconfig.json', 'tests/example.spec.ts'],
      correct: [0],
      explanation:
        `\`playwright.config.ts\` holds the runner settings (testDir, workers, retries, reporter, projects) and the browser settings under \`use\`. package.json lists packages and scripts. tsconfig.json sets up the TypeScript compiler; Playwright does not use it to check types when tests run. Spec files hold the tests themselves.`,
      followUps: [
        {
          q: 'Can you use a different config file for a special run?',
          a: `Yes, with \`-c\` or \`--config\`, for example \`npx playwright test -c playwright.smoke.config.ts\`. Some teams keep a separate config for visual tests or another environment. But projects inside one config are usually easier to maintain.`,
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
        `\`getByTestId\` looks for \`data-testid\` unless \`use.testIdAttribute\` says otherwise. SauceDemo uses \`data-test\`, so the locator finds nothing. Also, \`on-first-retry\` records only on a retry, and retries are 0 by default, so no trace is ever made. The other options are wrong: baseURL normally includes \`https://\`, trace belongs in \`use\`, a relative testDir is fine, projects are optional, and getByTestId does not match attribute prefixes.`,
      followUps: [
        {
          q: 'Besides the config, how else can you change the test id attribute?',
          a: `Call \`selectors.setTestIdAttribute('data-test')\` (import \`selectors\` from @playwright/test) before tests run, for example in a fixture or global setup. The config option is clearer and can differ per project, so it is the usual choice. Codegen has a matching \`--test-id-attribute\` flag.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-09',
      difficulty: 'medium',
      question: `You want tests to run again each time you save a file. You want a page snapshot for each action. And you want to pick locators by hovering. Which command gives you all of this?`,
      options: ['npx playwright test --ui', 'npx playwright test --headed', 'npx playwright show-report', 'npx playwright test --list'],
      correct: [0],
      explanation:
        `UI mode (\`--ui\`) has watch mode, a timeline with a page snapshot for each action, and a Pick locator tool. \`--headed\` only shows the browser window during a normal run. \`show-report\` opens the last HTML report. \`--list\` prints the tests without running them.`,
      followUps: [
        {
          q: 'How would you open UI mode from inside a Docker container or Codespace?',
          a: `Start it on an address you can reach, for example \`npx playwright test --ui-host=0.0.0.0 --ui-port=8080\`, and open that address in your browser. Be careful: 0.0.0.0 can let other machines on the network see your traces and any secrets in them.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-10',
      difficulty: 'hard',
      question: `The 'log in' test passes. Why does the 'inventory shows 6 items' test fail on SauceDemo?`,
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
        `Each test gets its own browser context. So the login cookie from test 1 does not exist in test 2, and SauceDemo sends a visitor who is not logged in back to the login page. The other options are wrong: tests in a file run in the order they are written (not reversed), \`toHaveCount\` works with any locator, and deep links work fine once the user is logged in.`,
      followUps: [
        {
          q: 'Give two correct ways to make the second test pass.',
          a: `Log in inside the second test, ideally in a shared \`test.beforeEach\` or a helper, so the steps are not copied. Or, for a big suite, log in once in a setup project, save the session with \`storageState\`, and start the tests with it. Both ways keep the tests independent.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-11',
      difficulty: 'medium',
      question: `Which of these go at the TOP LEVEL of defineConfig, not inside \`use\`? Select ALL that apply.`,
      options: ['retries', 'baseURL', 'workers', 'reporter', 'testIdAttribute'],
      correct: [0, 2, 3],
      explanation:
        `\`retries\`, \`workers\` and \`reporter\` set up the test runner, so they go at the top level. \`baseURL\` and \`testIdAttribute\` change how each page and locator works, so they go under \`use\` (for all tests or per project). Mixing these up is a very common config mistake. TypeScript flags most of them.`,
      followUps: [
        {
          q: 'Can a single project override `use` options?',
          a: `Yes. Each project has its own \`use\` block, merged over the main one. That is how a mobile project sets \`...devices['iPhone 13']\`, or a staging project sets a different \`baseURL\`, while sharing everything else.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-12',
      difficulty: 'hard',
      question:
        `A colleague says: "Our TypeScript tests ran fine in Playwright, so there are no type errors." Why is this wrong, and what should be added to CI?`,
      options: [
        'Playwright strips TypeScript types without type-checking, so add `npx tsc --noEmit` (and lint) to CI',
        'Playwright type-checks only files that fail, so add `--strict` to the test command',
        'Playwright converts TS to Python before running, so add a Python linter',
        'The reasoning is right; Playwright refuses to run tests with any type error',
      ],
      correct: [0],
      explanation:
        `Playwright turns TS into JS on the fly but does not check the types. So tests with small type errors still run. The docs say to run \`tsc --noEmit\` separately, plus ESLint rules such as no-floating-promises. The other options are wrong: there is no \`--strict\` flag for type checking, nothing is turned into Python, and Playwright does not refuse to run tests with type errors.`,
      followUps: [
        {
          q: 'What else does ESLint catch that the type checker does not?',
          a: `The \`@typescript-eslint/no-floating-promises\` rule catches Promises with no \`await\`, like a \`click()\` or an \`expect(...).toBeVisible()\` without \`await\`. The type checker sees nothing wrong there. But these are one of the most common causes of flaky Playwright tests.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-13',
      difficulty: 'expert',
      question: `Which statements about codegen are true? Select ALL that apply.`,
      options: [
        'It prefers role, text and test-id locators and refines them until they match a single element',
        'It can add assertions for visibility, text and value from its toolbar',
        '`--save-storage` / `--load-storage` let you record once logged in without logging in again',
        'Its output is production-ready and should be committed without edits',
        'It only works with Chromium and cannot emulate devices',
      ],
      correct: [0, 1, 2],
      explanation:
        `Codegen picks strong locators, has buttons to add assertions, and can save and load login state between recording sessions. Its code is only a draft: it has no structure, no reusable data and weak assertions, so "commit without edits" is wrong. It also supports other browsers with \`--browser\` (chromium, firefox, webkit) and emulation such as \`--device\`, \`--viewport-size\` and \`--color-scheme\`.`,
      followUps: [
        {
          q: 'Why should the saved auth.json from `--save-storage` never be committed?',
          a: `It holds real cookies and local storage for a logged-in session. That works like a password. Anyone with the file can act as that user until the session ends. Keep it in a folder that Git ignores (for example playwright/.auth) and create it again when needed.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-14',
      difficulty: 'hard',
      question:
        `CI has \`retries: 2\` and \`trace: 'on-first-retry'\`. A test fails on attempt 1 and passes on attempt 2. What does the HTML report show?`,
      options: [
        'Status "flaky", with a trace attached for the retry attempt',
        'Status "passed" with no record of the first failure',
        'Status "failed", because any failed attempt fails the test',
        'Status "flaky", with a trace attached for the first failed attempt only',
      ],
      correct: [0],
      explanation:
        `When a test fails and then passes on a retry, Playwright marks it flaky, not passed and not failed. With \`on-first-retry\`, tracing turns on for the first retry. So the trace belongs to attempt 2, not attempt 1. The error from the first attempt is still listed in the report, under its result tab.`,
      followUps: [
        {
          q: 'How can you make the pipeline fail when flaky tests appear?',
          a: `Run with \`--fail-on-flaky-tests\` (or the \`failOnFlakyTests\` config option). Then the run fails if any test passed only on a retry. This makes the team fix flaky tests instead of letting retries hide them. Many teams turn it on once the suite is stable.`,
        },
      ],
    },
    {
      id: 'pw-setup-mcq-15',
      difficulty: 'expert',
      question:
        `A chat app must be tested with a buyer and a seller sending messages to each other live. Which approach models this correctly in @playwright/test?`,
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
        `Two different users need two separate contexts. Calling \`browser.newContext()\` twice gives them their own cookies and storage at the same time. Pages in one context share the login, so Option B makes both "users" the same person. Starting browsers yourself is not needed and is slower. Projects run separately, maybe in different workers, so they cannot talk to each other inside one test.`,
      followUps: [
        {
          q: 'Who closes these contexts?',
          a: `Contexts you make yourself from the browser fixture are your job to close. Call \`await buyer.close()\` and \`await seller.close()\` at the end, or close them in a fixture's clean-up step. The runner closes the built-in \`context\` and \`page\` fixtures for you.`,
        },
      ],
    },
  ],
};

export default topic;
