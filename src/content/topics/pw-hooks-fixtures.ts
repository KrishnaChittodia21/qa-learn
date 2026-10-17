import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-hooks-fixtures',
  phase: 'pw-framework',
  order: 1,
  title: 'Test Structure, Hooks & Fixtures',
  subtitle:
    'How a Playwright test file is built (test, describe, step), when hooks run, how fixtures give each test ready-made setup, and how tags and parallel modes choose what runs.',
  estimatedMinutes: 90,
  sources: [
    'Playwright docs — Fixtures (playwright.dev/docs/test-fixtures)',
    'Playwright docs — Test API reference: hooks, step, describe.configure (playwright.dev/docs/api/class-test)',
    'Playwright docs — Annotations and tags (playwright.dev/docs/test-annotations)',
    'Playwright docs — Parallelism (playwright.dev/docs/test-parallel)',
    'Playwright docs — Retries: workers and failures (playwright.dev/docs/test-retries)',
    'Playwright docs — Test use options (playwright.dev/docs/test-use-options)',
    'Checkly blog — Combine Page Object Models and fixtures in Playwright (Nočnica Mellifera)',
    'bug0.com knowledge base — Playwright fixtures; Playwright interview questions',
    'DEV Community — Playwright interview questions and answers (2024–2025 write-ups)',
    'SauceDemo public demo site (www.saucedemo.com)',
  ],
  tags: ['playwright', 'hooks', 'fixtures', 'test.extend', 'worker-scope', 'annotations', 'tags', 'parallel', 'serial', 'test.step'],
  cheatSheet: [
    'Building blocks: test() = one test case. test.describe() = a group. test.step() = a named step inside a test. Steps show in the report and trace, and can return a value.',
    'Hooks: beforeAll/afterAll run once per worker for their scope. beforeEach/afterEach run around every test. Outer beforeEach runs before inner. Inner afterEach runs before outer.',
    'A failed test stops its worker. The next tests start in a fresh worker, so beforeAll runs AGAIN. beforeAll is not "once per run".',
    'Built-in fixtures: page and context (new per test), browser (shared per worker), browserName, request (a separate API client per test). testInfo is the second argument.',
    'Custom fixture: base.extend({ name: async ({ page }, use) => { setup; await use(value); clean-up } }). Code after await use() is the clean-up (teardown). It runs even when the test fails.',
    'Fixtures are lazy: they are set up only if a test or hook asks for them. A fixture can use other fixtures. Those are set up first and cleaned up last.',
    "Worker scope: [fn, { scope: 'worker' }] runs once per worker. It can only use worker fixtures (browser, not page). auto: true runs a fixture even if no test names it.",
    'Prefer fixtures for reusable setup: they run only when needed, are typed, keep setup and clean-up together, and work across files. Hooks are fine for setup inside one file.',
    'Annotations: test.skip (do not run), test.fixme (known broken, do not run), test.fail (run, must fail), test.slow (timeout x3), test.only (run only this; block it on CI with forbidOnly).',
    "Tags: { tag: '@smoke' } or '@smoke' in the title. Run with --grep @smoke. Leave out with --grep-invert @slow.",
    "Default: files run at the same time; tests inside one file run in order. fullyParallel: true or describe.configure({ mode: 'parallel' }) splits a file. mode: 'serial' skips the rest after a failure and retries the whole group (avoid it).",
    'Never share changing variables at the top of a file: each worker is a separate process. Make data unique with testInfo.testId, workerIndex or parallelIndex.',
  ],
  sections: [
    {
      heading: 'Anatomy of a test file: test, describe and test.step',
      body: `**Example:**

- \`test('adds the backpack', async ({ page }) => { ... })\` → one test case. Playwright gives it a fresh \`page\`.
- \`test.describe('Cart', () => { ... })\` → a group of related tests.
- \`await test.step('Log in', async () => { ... })\` → a named step inside one test.

A spec file is like a chapter of your manual test-case document. Each \`test()\` is one test case. \`test.describe()\` is a section heading. \`test.step()\` is a numbered step inside a case.

**test()** declares one test. Each test must work on its own. The \`{ page }\` part asks Playwright for a **fixture**. A fixture is something Playwright prepares for your test, like a fresh \`page\`. It also cleans it up afterwards.

**test.describe()** groups tests. Hooks, tags and settings inside a describe apply only to that group. You can put a describe inside another describe.

**test.step()** gives part of a test a name. The name shows in the HTML report, UI mode and trace viewer. The trace viewer is a tool that replays your test step by step. So a failure says "failed in step *Add backpack to cart*", not "line 37".

A step returns whatever its body returns. You can use that value later in the test.

Two handy step options: \`{ box: true }\` makes errors point at the step call. \`{ timeout }\` sets a time limit for one step.

**Watch out:** a 60-line test with no steps still works. But when it fails in CI, nobody can tell which action broke.

**In an interview, say:** "I keep tests independent. I group them by feature with describe. I use test.step for business actions, so the report reads like a manual test case."

**Why testers care:** steps make reports easy to read for the whole team, even people who do not write code.`,
      code: [
        {
          language: 'typescript',
          title: 'tests/cart.spec.ts: describe + steps on SauceDemo',
          code: `import { test, expect } from '@playwright/test';

test.describe('Cart', () => {
  test('adds the backpack to the cart', async ({ page }) => {
    await test.step('Log in as standard user', async () => {
      await page.goto('https://www.saucedemo.com/');
      await page.getByPlaceholder('Username').fill(process.env.SAUCE_USER ?? '');
      await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASS ?? '');
      await page.getByRole('button', { name: 'Login' }).click();
    });

    // a step can return a value that later code uses
    const itemName = await test.step('Add first product', async () => {
      const first = page.locator('[data-test="inventory-item"]').first();
      await first.getByRole('button', { name: 'Add to cart' }).click();
      return first.locator('[data-test="inventory-item-name"]').innerText();
    });

    await test.step('Verify cart', async () => {
      await page.locator('[data-test="shopping-cart-link"]').click();
      await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(itemName);
    });
  });
});`,
        },
      ],
      keyPoints: [
        'test = one independent test case. describe = a group with its own hooks and settings. step = a named action inside a test.',
        'test.step gives back what its body returns. { box: true } points errors at the line that called the step.',
        'Steps make reports and traces easy to read, even for non-coders.',
      ],
      source: 'Playwright docs — Test API reference (test.describe, test.step)',
    },
    {
      heading: 'Hooks: beforeAll, beforeEach, afterEach, afterAll',
      body: `**Example:**

- \`test.beforeEach(async ({ page }) => { await page.goto('https://www.saucedemo.com/'); })\` → before every test in this file, open the login page.
- \`test.afterEach(async ({ page }, testInfo) => { ... })\` → after every test, run some clean-up. It runs even when the test failed.

A **hook** is a "do this before or after" rule. beforeEach is like "wash hands before every experiment". beforeAll is like "switch on the lab once in the morning".

A **worker** is a separate process that runs tests. Each worker has its own browser. Some hooks run once per worker.

| Hook | When it runs | What it can use | Typical use |
|---|---|---|---|
| \`test.beforeAll\` | once per **worker**, for its file or describe | worker fixtures only (\`browser\`, not \`page\`) | create shared read-only data |
| \`test.beforeEach\` | before **every** test in scope | \`page\`, \`request\` and testInfo | open the start page |
| \`test.afterEach\` | after every test, **even a failed one** | \`page\`, \`request\` and testInfo | attach logs, delete test data |
| \`test.afterAll\` | once per worker, after its tests | worker fixtures | delete what beforeAll created |

Facts to remember:

- A hook at file level covers the whole file. A hook inside a describe covers only that group.
- Several hooks at the same level run in the order you wrote them.
- If one hook fails, Playwright still runs the other hooks. So clean-up still happens.
- Since v1.38, a hook can have a title, like \`test.beforeEach('Open inventory', async ({ page }) => ...)\`. The title shows in reports.
- You cannot call \`test.use()\` inside a hook. Call it at file or describe level.

**Why beforeAll cannot use \`page\`:** each test gets its own new \`page\`. But beforeAll belongs to the worker, which lives longer than one test. If you really need a page there, create one with \`browser.newPage()\`. Close it in afterAll. Every test then shares that one page.

**Watch out:** do not log in once in beforeAll and share that page with every test. If one test fails, the worker restarts and beforeAll runs again. Tests start to depend on each other's leftovers. Use fixtures or storageState instead. **storageState** is a saved file of cookies and local storage, so tests start already logged in. The auth topic covers it.

**Why testers care:** afterEach runs even after a failure. That makes it a safe place for screenshots, logs and clean-up.`,
      code: [
        {
          language: 'typescript',
          title: 'Hooks with titles and testInfo',
          code: `import { test, expect } from '@playwright/test';

test.beforeEach('Open login page', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
});

test.afterEach('Attach URL on failure', async ({ page }, testInfo) => {
  // afterEach runs for failed tests too, so it is a good place for diagnostics
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('url-at-failure', { body: page.url(), contentType: 'text/plain' });
  }
});

test('shows an error for a locked-out user', async ({ page }) => {
  await page.getByPlaceholder('Username').fill('locked_out_user');
  await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASS ?? '');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('[data-test="error"]')).toContainText('locked out');
});`,
        },
      ],
      keyPoints: [
        'beforeAll/afterAll: once per worker. They can only use worker fixtures like browser.',
        'beforeEach/afterEach: around every test. They can use page, request and testInfo.',
        'afterEach still runs when the test failed. Check testInfo.status to react to a failure.',
      ],
      source: 'Playwright docs — Test API reference: test.beforeAll / beforeEach / afterEach / afterAll',
    },
    {
      heading: 'Hook order across nested describes and workers',
      body: `**Example:** a test sits inside \`describe('outer')\`, which holds \`describe('inner')\`.

- Before the test: outer \`beforeEach\` runs, then inner \`beforeEach\`.
- After the test: inner \`afterEach\` runs, then outer \`afterEach\`.

Think of nested describes as boxes inside boxes. You open the outer box first. You close the inner box first.

The full order for one test:

1. outer \`beforeAll\`, then inner \`beforeAll\` (the first time the worker reaches them).
2. outer \`beforeEach\`, then inner \`beforeEach\`.
3. the test itself.
4. inner \`afterEach\`, then outer \`afterEach\`.
5. after the last test of that scope in the worker: inner \`afterAll\`, then outer \`afterAll\`.

**Workers change the picture.** A worker is a separate Node process with its own browser. Every worker that runs tests from a file runs that file's \`beforeAll\` for itself. Two more rules surprise people:

- **A failed test shuts down its worker.** The next test starts in a brand-new worker. So \`beforeAll\` runs again there. The old worker runs \`afterAll\` before it stops.
- **In parallel mode, each test runs all its hooks for itself.** That includes \`beforeAll\` and \`afterAll\`. Parallel mode means \`fullyParallel\` or \`mode: 'parallel'\`. So a "run once" beforeAll runs once **per test** there.

A **setup project** is a small test project that runs once before your other tests. A **worker-scoped fixture** is set up once per worker. Both are covered below.

**In an interview, say:** "beforeAll runs per worker, not once per run. For once-per-run setup I use a setup project. For once-per-worker setup I use a worker-scoped fixture."

**Why testers care:** beforeAll can run many times. So "create user" in beforeAll can fail with "user already exists".`,
      diagram: `describe outer                       log order for test "t1"
 |- beforeAll  (A1)                  A1  outer beforeAll
 |- beforeEach (E1)                  A2  inner beforeAll
 |- afterEach  (X1)                  E1  outer beforeEach
 |- afterAll   (Z1)                  E2  inner beforeEach
 '- describe inner                   t1  test body
     |- beforeAll  (A2)              X2  inner afterEach
     |- beforeEach (E2)              X1  outer afterEach
     |- afterEach  (X2)              ... (t2 repeats E1 E2 t2 X2 X1)
     |- afterAll   (Z2)              Z2  inner afterAll
     '- test t1, test t2             Z1  outer afterAll`,
      code: [
        {
          language: 'typescript',
          title: 'Print the order yourself (run with --workers=1)',
          code: `import { test } from '@playwright/test';

test.describe('outer', () => {
  test.beforeAll(() => console.log('A1 outer beforeAll'));
  test.beforeEach(() => console.log('E1 outer beforeEach'));
  test.afterEach(() => console.log('X1 outer afterEach'));
  test.afterAll(() => console.log('Z1 outer afterAll'));

  test.describe('inner', () => {
    test.beforeAll(() => console.log('A2 inner beforeAll'));
    test.beforeEach(() => console.log('E2 inner beforeEach'));
    test.afterEach(() => console.log('X2 inner afterEach'));
    test.afterAll(() => console.log('Z2 inner afterAll'));

    test('t1', () => console.log('t1 body'));
    test('t2', () => console.log('t2 body'));
  });
});
// → A1, A2, E1, E2, t1 body, X2, X1, E1, E2, t2 body, X2, X1, Z2, Z1`,
        },
      ],
      keyPoints: [
        'Setup hooks run outer → inner. Clean-up hooks run inner → outer.',
        'beforeAll runs once per worker per scope. It runs again after a failure restarts the worker.',
        'In fully parallel mode, every test runs beforeAll and afterAll for itself.',
      ],
      source: 'Playwright docs — Parallelism; Retries (workers and failures); Test API reference',
    },
    {
      heading: 'Built-in fixtures: page, context, browser, request',
      body: `**Example:**

- \`test('...', async ({ page, request }) => { ... })\` → Playwright sees that you asked for \`page\` and \`request\`. It prepares exactly those two for this test.

A **fixture** is like a hotel room. It is cleaned and ready before you arrive. It is cleaned again after you leave. You just say "I need a room" (\`{ page }\`).

| Fixture | What it is | How long it lives |
|---|---|---|
| \`page\` | a fresh browser tab | new for every test |
| \`context\` | the private browser session that owns \`page\` (own cookies and storage) | new for every test |
| \`browser\` | the opened browser | shared by all tests in one worker |
| \`browserName\` | \`'chromium' \\| 'firefox' \\| 'webkit'\` | comes from the project |
| \`request\` | a separate API client for HTTP calls | new for every test |

A **browser context** is like a fresh incognito window. It has its own cookies and local storage.

Every \`use\` option in the config is also a fixture. Examples are \`baseURL\`, \`storageState\`, \`viewport\` and \`locale\`. You can read one, like \`async ({ baseURL }) => ...\`. You can change one with \`test.use()\`.

The **second argument** of a test, hook or fixture is \`testInfo\`. It holds facts about the running test: title, status, retry number, \`workerIndex\`, \`parallelIndex\` and \`testId\`. It also has helpers like \`attach()\` and \`outputPath()\`. You can get it anywhere in a test with \`test.info()\`.

**Watch out:** the \`request\` fixture does not share cookies with \`page\`. Use \`page.request\` when an API call must use the logged-in browser session.

**Why testers care:** \`page\` and \`context\` are new for each test. Cookies from test A never leak into test B. That is what makes parallel runs safe.`,
      code: [
        {
          language: 'typescript',
          title: 'Reading built-in fixtures and testInfo',
          code: `import { test, expect } from '@playwright/test';

test('fixtures you get for free', async ({ page, context, browserName, request }, testInfo) => {
  // context is the one that owns page: same cookies, same storage
  expect(page.context()).toBe(context);

  // request is a separate API client; it does not share cookies with page by default
  const res = await request.get('https://restful-booker.herokuapp.com/ping');
  expect(res.status()).toBe(201); // Restful Booker answers /ping with 201

  testInfo.annotations.push({ type: 'browser', description: browserName });
  console.log(testInfo.title, 'worker', testInfo.workerIndex, 'retry', testInfo.retry);
});`,
        },
      ],
      keyPoints: [
        'page, context and request: new for every test. browser: shared by one worker.',
        'Config "use" options are fixtures too (baseURL, storageState, viewport...).',
        'testInfo = facts about the test plus helpers (attach, outputPath, workerIndex, testId).',
      ],
      source: 'Playwright docs — Fixtures: built-in fixtures',
    },
    {
      heading: 'Custom fixtures with test.extend and use()',
      body: `**Example:**

- \`loggedInPage: async ({ page }, use) => { /* log in */ await use(page); }\` → a fixture that logs in, then hands the page to the test.
- \`test('shows six products', async ({ loggedInPage }) => { ... })\` → the test just asks for it by name.

A custom fixture is your own "hotel room type". You write the setup and clean-up steps once. Any test can then ask for it by name.

**How it works.** \`test.extend()\` gives you a **new** \`test\` function that knows your extra fixtures. Each fixture is an async function. It receives other fixtures and a \`use\` function:

1. Code **before** \`await use(value)\` is the setup.
2. \`await use(value)\` gives \`value\` to the test. It **waits until the test finishes**.
3. Code **after** \`await use()\` is the clean-up, also called **teardown**. It runs even if the test failed.

Rules to remember:

- Tests must import \`test\` from **your fixtures file**, not from \`@playwright/test\`. Otherwise the new fixtures do not exist. Export \`expect\` from the same file too.
- Fixtures are **lazy**. A fixture is set up only when a test or hook asks for it by name.
- A fixture can use other fixtures. For example, \`inventoryPage\` can ask for \`page\`. Playwright sets up \`page\` first and cleans it up last.
- Always write \`await use(...)\`. Without \`await\`, the clean-up runs at once, while the test is still running.
- Fixture names use letters, digits and underscores. They start with a letter or an underscore.
- You can **override** a built-in fixture. For example, make \`page\` start on \`baseURL\`.
- You can **merge** fixtures from two files with \`mergeTests(a, b)\`.

**Real example (SauceDemo):** almost every test needs "a logged-in user on the products page". Do not copy four login lines into 40 tests. Make one \`loggedInPage\` fixture. If the login screen changes, you fix one function.

**Why testers care:** setup and clean-up live in one place. A UI change means one fix, and test data never gets left behind.`,
      code: [
        {
          language: 'typescript',
          title: 'fixtures/base.ts: a logged-in page and a test-data fixture',
          code: `import { test as base, expect, type Page } from '@playwright/test';

type Fixtures = {
  loggedInPage: Page;
  bookingId: number;
};

export const test = base.extend<Fixtures>({
  loggedInPage: async ({ page }, use) => {
    // setup: runs only for tests that ask for loggedInPage
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill(process.env.SAUCE_USER!);
    await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASS!);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory/);
    await use(page); // the test runs here
    // no teardown needed: page/context are closed by Playwright
  },

  bookingId: async ({ request }, use) => {
    const res = await request.post('https://restful-booker.herokuapp.com/booking', {
      data: { firstname: 'Asha', lastname: 'QA', totalprice: 120, depositpaid: true,
        bookingdates: { checkin: '2026-01-10', checkout: '2026-01-12' } },
    });
    const { bookingid } = await res.json();
    await use(bookingid);
    // teardown: always runs, even if the test failed (cleanup via API is covered in the POM & data topic)
    console.log('test finished with booking', bookingid);
  },
});

export { expect };`,
        },
        {
          language: 'typescript',
          title: 'tests/inventory.spec.ts: just ask for the fixture',
          code: `import { test, expect } from '../fixtures/base';

test('shows six products', async ({ loggedInPage }) => {
  await expect(loggedInPage.locator('[data-test="inventory-item"]')).toHaveCount(6);
});

test('booking id is a number', async ({ bookingId }) => {
  // loggedInPage is NOT set up here: fixtures are lazy
  expect(typeof bookingId).toBe('number');
});`,
        },
      ],
      keyPoints: [
        'Setup → await use(value) → clean-up (teardown), all in one function.',
        'Import test from your fixtures file. Export expect from it too.',
        'Lazy and combinable: only requested fixtures run, and the fixtures they use run first.',
      ],
      source: 'Playwright docs — Fixtures: creating a fixture, overriding fixtures, mergeTests',
    },
    {
      heading: 'Worker-scoped, auto and option fixtures',
      body: `**Example:**

- \`account: [async ({}, use, workerInfo) => { ... }, { scope: 'worker' }]\` → set up once per worker, then shared by every test in that worker.
- \`failOnConsoleErrors: [async ({ page }, use) => { ... }, { auto: true }]\` → runs for every test, even though no test asks for it.

Normal fixtures are like paper cups: a new one for each test. A **worker-scoped fixture** is like the office coffee machine. It is set up once per worker. Every test in that worker shares it.

You pass fixture options as a pair in square brackets: \`[fn, { ...options }]\`.

| Option | Meaning | Example use |
|---|---|---|
| \`scope: 'worker'\` | set up once per worker, cleaned up when the worker stops | one test account per worker, a database connection, a mock server |
| \`auto: true\` | runs for every test (or worker) even if nobody names it | collect console errors, attach logs on failure |
| \`timeout: 60_000\` | its own time limit for a slow fixture | loading a big set of test data |
| \`option: true\` | a setting that projects or \`test.use()\` can change | \`defaultUser: ['standard_user', { option: true }]\` |
| \`box: true\` / \`'self'\` | hide the fixture's steps in reports (\`'self'\` keeps inner steps) | noisy helpers |
| \`title: 'my fixture'\` | a friendlier name in reports and errors | |

An **auto fixture** is a fixture with \`auto: true\`. It works like a global hook.

Rules:

- Put worker fixture types in the **second** type slot: \`base.extend<TestFixtures, WorkerFixtures>()\`.
- A worker fixture can only use other worker fixtures, like \`browser\`. It can never use \`page\` or \`context\`. Those are thrown away after each test.
- Worker fixtures get their **own timeout**. By default it equals the test timeout.
- Test fixtures count toward the test's timeout, unless you give them their own.
- For "one account per worker", use \`test.info().parallelIndex\`. It goes from 0 to workers-1. It stays the same when a worker restarts.

**Watch out:** never make something worker-scoped if tests change it, like a cart or a shared page. Worker scope is safe only for read-only things, or things unique to that worker.

**Why testers care:** worker scope saves time on slow setup. For example, you get one login token per worker instead of one per test.`,
      code: [
        {
          language: 'typescript',
          title: 'Worker account + auto console-error guard',
          code: `import { test as base, expect } from '@playwright/test';

type WorkerFixtures = { account: { username: string } };
type TestFixtures = { failOnConsoleErrors: void };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // once per worker: pick a unique account by parallelIndex
  account: [async ({}, use, workerInfo) => {
    const username = \`qa_user_\${workerInfo.parallelIndex}\`;
    await use({ username });
  }, { scope: 'worker' }],

  // runs for EVERY test without being named
  failOnConsoleErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await use();
    expect(errors, 'console errors during the test').toEqual([]);
  }, { auto: true, box: true }],
});

export { expect };`,
        },
      ],
      keyPoints: [
        "[fn, { scope: 'worker' }] = once per worker. Worker fixtures cannot use page.",
        'auto: true = a fixture that runs for every test (or worker), like a global hook.',
        'option: true makes a fixture a setting you can change from projects or test.use().',
      ],
      source: 'Playwright docs — Fixtures: worker-scoped, automatic, timeout, option, box and title',
    },
    {
      heading: 'How fixtures and hooks interleave',
      body: `**Example:** \`beforeEach\` uses \`page\`, and test 2 uses \`testFixture\`.

- \`page\` is set up first, because \`beforeEach\` needs it.
- \`testFixture\` is set up after \`beforeEach\`, because only the test body needs it.

Playwright prepares what each step needs just before that step. It cleans up in reverse order.

The rules, from the official docs:

- If fixture A uses fixture B, **B is set up before A and cleaned up after A**.
- Normal fixtures are set up **lazily**: right before the hook or test that needs them.
- **Auto worker fixtures** are set up before anything else in the worker, even before beforeAll.
- **Auto test fixtures** are set up before \`beforeEach\` hooks and the test.
- Test-scoped fixtures are cleaned up after each test, after \`afterEach\`.
- Worker-scoped fixtures are cleaned up when the worker stops, after \`afterAll\`.

The diagram shows a full run. \`beforeEach\` uses \`page\`. Test 1 uses \`page\`. Test 2 uses \`testFixture\`. That fixture needs \`page\` and the worker fixture \`workerFixture\`.

**Watch out:** a fixture that no test or hook asks for is never set up at all.

**Why testers care:** this order tells you where to look when setup fails. It also explains why a log line appears before or after a hook.`,
      diagram: `WORKER START   browser setup -> autoWorkerFixture setup -> beforeAll
TEST 1         autoTestFixture setup -> page setup -> beforeEach
               -> test 1 -> afterEach -> page teardown
               -> autoTestFixture teardown
TEST 2         autoTestFixture setup -> page setup -> beforeEach
               -> workerFixture setup (lazy, first time needed)
               -> testFixture setup -> test 2 -> afterEach
               -> testFixture teardown -> page teardown
               -> autoTestFixture teardown
WORKER END     afterAll -> workerFixture teardown
               -> autoWorkerFixture teardown -> browser teardown
(an unused fixture is never set up at all)`,
      keyPoints: [
        'A fixture that others use is set up first and cleaned up last.',
        'Auto worker fixtures come before beforeAll. Auto test fixtures come before beforeEach.',
        'A fixture needed only by the test body is set up after beforeEach.',
      ],
      source: 'Playwright docs — Fixtures: execution order',
    },
    {
      heading: 'Fixtures vs hooks: which one when?',
      body: `**Example:**

- Hook style: \`let bookingId\` at the top of the file, filled in \`beforeEach\`, deleted in \`afterEach\`.
- Fixture style: \`test('reads its own booking', async ({ bookingId }) => { ... })\` → the test simply asks for \`bookingId\`.

A hook is a rule pinned to one notice board (one file or describe). A fixture is a tool in a shared toolbox. Any test in any file can pick it up. It puts itself away afterwards.

| Question | Hooks (beforeEach/afterEach) | Fixtures (test.extend) |
|---|---|---|
| Reuse in other files | copy the hook into each file | import \`test\` once, use anywhere |
| When it runs | for every test in scope, needed or not | only for tests that ask (lazy), unless \`auto\` |
| Setup and clean-up | two separate hooks, often far apart | one function around \`await use()\` |
| Giving values to the test | a \`let\` variable at file level (changeable, no types) | a typed argument (\`{ cartPage }\`) |
| Building on each other | hard; hooks cannot use each other | fixtures can use fixtures |
| Scope | per test or per worker | per test or per worker, you choose |
| Reports | hook titles | fixture steps (can be boxed or titled) |

**Rule of thumb:**

- Use a **hook** for small setup inside one file that every test there needs. Example: \`page.goto('/inventory.html')\`.
- Use a **fixture** for anything reused across files, anything with clean-up, or anything that gives back a value. Examples: page objects, API clients, test data, logged-in pages.
- Use a **setup project** for work done once per run, like logging in and saving storageState.

Fixtures are a form of **dependency injection**. The test lists what it needs, and Playwright provides it.

**In an interview, say:** "With fixtures, the test says what it needs and Playwright gives it. Setup and clean-up live together. Nothing runs that the test did not ask for. I keep hooks for tiny steps inside one file."

**Why testers care:** fixtures stop copy-paste setup. One change in the fixture fixes every test that uses it.`,
      code: [
        {
          language: 'typescript',
          title: 'Same setup, hook style vs fixture style',
          code: `// HOOK STYLE: shared mutable variable, setup and teardown split apart
import { test as plain } from '@playwright/test';
let bookingId: number;
plain.beforeEach(async ({ request }) => {
  const res = await request.post('https://restful-booker.herokuapp.com/booking', { data: {/*...*/} });
  bookingId = (await res.json()).bookingid;
});
plain.afterEach(async () => { /* delete bookingId */ });

// FIXTURE STYLE: value injected, typed, setup+teardown together, reusable
import { test } from '../fixtures/base';
test('reads its own booking', async ({ bookingId, request }) => {
  const res = await request.get(\`https://restful-booker.herokuapp.com/booking/\${bookingId}\`);
  console.log(res.status()); // → 200
});`,
        },
      ],
      keyPoints: [
        'Hooks: for one file, always run in scope. Fixtures: reusable, lazy, typed, and clean up after themselves.',
        'Give data to tests through fixture arguments, not file-level let variables.',
        'Once-per-run setup belongs in a setup project, not in beforeAll.',
      ],
      source: 'Playwright docs — Fixtures: "with fixtures" vs "without fixtures"; Checkly blog on POM + fixtures',
    },
    {
      heading: 'Annotations and tags: skip, fixme, fail, slow, only, @smoke',
      body: `**Example:**

- \`test('login works', { tag: '@smoke' }, async ({ page }) => { ... })\` → this test gets the label @smoke.
- \`npx playwright test --grep @smoke\` → run only the tests with that label.
- \`test.skip(isMobile, 'Sort dropdown is hidden on mobile layout')\` → skip this test on mobile.

**Annotations** are sticky notes on a test case: "not for Firefox", "known bug", "this one is slow". **Tags** are labels you can filter on, like "@smoke" or "@regression".

| Annotation | Does the test run? | Report shows | Use when |
|---|---|---|---|
| \`test.skip()\` | no | skipped | the test does not apply here (feature not on this browser or environment) |
| \`test.fixme()\` | no | skipped (fixme) | the test is broken and you plan to fix it |
| \`test.fail()\` | **yes**, and it must fail | passes if it fails; **error if it passes** | a known product bug: you get told when the bug is fixed |
| \`test.slow()\` | yes | normal | the test is really long: timeout ×3 |
| \`test.only()\` | only the "only" tests run | | local debugging; block it on CI with \`forbidOnly: !!process.env.CI\` |

Most annotations can be used in three ways:

- Declare it: \`test.skip('title', body)\`.
- Always, inside a test: \`test.skip()\`.
- With a condition: \`test.skip(browserName === 'webkit', 'reason')\`.

At describe level, you can pass a function that gets fixtures: \`test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only')\`. For a whole group, use \`test.describe.skip\` or \`test.describe.fixme\`.

**Tags** start with \`@\`. Add them with the \`tag\` option on a test or a describe. Or put them in the title.

- \`test('checkout', { tag: ['@smoke', '@cart'] }, async ({ page }) => {})\`.
- \`--grep @smoke\` runs them. \`--grep-invert @slow\` leaves them out. \`--grep "@smoke|@cart"\` means smoke OR cart.

**Custom annotations** show in the HTML report. Use them to link bug tickets: \`{ annotation: { type: 'issue', description: 'JIRA-123' } }\`. You can also add one while the test runs with \`test.info().annotations.push(...)\`.

**Watch out:** do not use skip for a known bug. Nobody will notice when it is fixed. Use \`test.fail()\` instead.

**Why testers care:** tags let CI run a fast smoke suite on every commit and the full suite at night.`,
      code: [
        {
          language: 'typescript',
          title: 'Annotations and tags in practice',
          code: `import { test, expect } from '@playwright/test';

test('login works', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('sort by price on mobile', { tag: '@regression' }, async ({ page, isMobile }) => {
  test.skip(isMobile, 'Sort dropdown is hidden on mobile layout');
  // ...
});

test('problem_user sees correct images', {
  annotation: { type: 'issue', description: 'BUG-482 wrong product images' },
}, async ({ page }) => {
  test.fail(); // known bug: if this starts passing, the run tells us to remove fail()
  // ...
});

test('full checkout with 10 items', async ({ page }) => {
  test.slow(); // 30s default becomes 90s
  // ...
});`,
        },
        {
          language: 'bash',
          title: 'Running by tag',
          code: `npx playwright test --grep @smoke                 # only smoke
npx playwright test --grep-invert @slow           # everything except slow
npx playwright test --grep "@smoke|@cart"         # smoke OR cart
npx playwright test --grep "(?=.*@smoke)(?=.*@cart)"  # smoke AND cart`,
        },
      ],
      keyPoints: [
        'skip = does not apply here. fixme = broken, do not run. fail = run it and expect it to fail.',
        'test.slow() triples the timeout. You cannot use it in beforeAll or afterAll.',
        'Add tags with { tag } or @word in the title. Filter with --grep and --grep-invert.',
      ],
      source: 'Playwright docs — Annotations; Test API reference (test.skip, test.fail, test.slow)',
    },
    {
      heading: 'Serial vs parallel modes',
      body: `**Example:**

- \`test.describe.configure({ mode: 'parallel' })\` → the tests in this file run at the same time, in different workers.
- \`test.describe.configure({ mode: 'serial' })\` → the tests run strictly in order. After one fails, the rest are skipped.

By default, Playwright works like a team of cashiers (workers). Each cashier takes a whole basket (a file). They scan its items (tests) one after another. You can also split a basket across cashiers. Or you can force one basket to go strictly in order.

| Mode | How to turn it on | What happens | Retries |
|---|---|---|---|
| default | nothing | files run at the same time; tests in a file run in order, in one worker | each failed test is retried on its own |
| parallel | \`fullyParallel: true\` (config or project) or \`test.describe.configure({ mode: 'parallel' })\` | tests of one file are spread over workers | each test is retried on its own |
| serial | \`test.describe.configure({ mode: 'serial' })\` | strict order; after a failure the rest are **skipped** | the **whole group** is retried from the start |

\`test.describe.serial\` and \`test.describe.parallel\` still exist, but they are deprecated (old, so avoid them). Use \`describe.configure\` instead. It also takes \`retries\` and \`timeout\` for that group. To take one file **out** of a global \`fullyParallel\`, use \`mode: 'default'\`.

**Why the docs warn against serial mode:** serial tests depend on each other. Test 2 needs the cart from test 1. This hides bugs. One failure skips everything after it. Nothing can run at the same time.

Prefer independent tests. Each one sets up its own data with fixtures or API calls. Use serial mode only as a last resort. It suits long journeys that are too costly to set up again and again.

**Worker facts:** workers are separate processes. They cannot share variables. \`workerIndex\` is unique for each worker process and grows after restarts. \`parallelIndex\` goes from 0 to workers-1, and the new worker reuses it. Set the worker count with \`workers\` in the config or \`--workers\` on the command line.

**Why testers care:** independent tests can run at the same time, so the suite finishes faster. A failure also points to one real problem.`,
      code: [
        {
          language: 'typescript',
          title: 'Configuring modes per file',
          code: `import { test } from '@playwright/test';

// Spread this file's tests across workers
test.describe.configure({ mode: 'parallel' });

test.describe('price sorting', () => {
  test('low to high', async ({ page }) => { /* independent */ });
  test('high to low', async ({ page }) => { /* independent */ });
});

// A truly ordered journey (use sparingly)
test.describe('order journey', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });
  test('create order', async ({ page }) => { /* ... */ });
  test('pay order', async ({ page }) => { /* skipped if create fails */ });
});`,
        },
      ],
      keyPoints: [
        'Default: files run at the same time; tests in one file run in order.',
        "mode: 'parallel' or fullyParallel splits a file. Its tests must be independent.",
        "mode: 'serial' skips the rest after a failure and retries the whole group.",
      ],
      source: 'Playwright docs — Parallelism; Test API reference (describe.configure)',
    },
    {
      heading: 'Sharing state safely between tests and workers',
      body: `**Example:**

- \`let cartCount = 0\` at the top of a spec file → each worker gets its own copy. The value carries over between tests in that worker.
- \`const lastname = 'qa-' + testInfo.testId\` → a name unique to this test. No other test or worker can clash with it.

Each worker is a separate kitchen. A note on one kitchen's fridge (a variable at the top of the file) is invisible to the other kitchens. The next cook in the same kitchen might read an old note.

Three classic bugs:

1. **A changing variable at the top of the file**, like \`let cartCount = 0\`. Each worker has its own copy. It keeps its value between tests in that worker. It resets when the worker restarts. So results depend on which tests ran before.
2. **Tests that rely on order.** Test 2 uses the user created by test 1. This breaks with \`fullyParallel\`, \`--grep\`, \`--last-failed\` and retries.
3. **Shared server data.** All workers edit the same booking or the same user's cart. Browser contexts are kept apart, but the **server** is shared.

Fixes:

- Pass values with **fixtures**, not shared variables.
- Make server data unique per test: \`'order-' + testInfo.testId\` or Faker values. Faker is a library that makes random, realistic data. Per worker, use \`parallelIndex\`.
- Write files to \`testInfo.outputPath('export.csv')\`. That path is unique for each test.
- If a test needs earlier data, **create it inside the test**. An API call in a fixture works well. Do not depend on another test.

**In an interview, say:** "Each test must pass when run alone, in any order, in any worker. If a test only passes after another test, that is a bug in the suite."

**Why testers care:** shared state causes **flaky tests**. A flaky test sometimes passes and sometimes fails without any code change.`,
      code: [
        {
          language: 'typescript',
          title: 'Unique data per test and per worker',
          code: `import { test, expect } from '@playwright/test';

test('creates a booking with a unique name', async ({ request }, testInfo) => {
  // testId is stable and unique per test; parallelIndex identifies the worker slot
  const lastname = \`qa-\${testInfo.parallelIndex}-\${testInfo.testId.slice(0, 8)}\`;
  const res = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: { firstname: 'Ravi', lastname, totalprice: 50, depositpaid: false,
      bookingdates: { checkin: '2026-02-01', checkout: '2026-02-03' } },
  });
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).booking.lastname).toBe(lastname);

  // per-test file path, never clashes with another worker
  console.log(testInfo.outputPath('booking.json'));
});`,
        },
      ],
      keyPoints: [
        'Variables at the top of a file live per worker and survive between tests. Do not change them in tests.',
        'Separate browser contexts do not separate the server. Make your data unique.',
        'Every test must pass alone, in any order, in any worker.',
      ],
      source: 'Playwright docs — Parallelism: isolation and unique data per worker',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-hooks-fixtures-cc-1',
      title: 'Copy-pasted login in every test',
      context:
        'A teammate wrote 30 SauceDemo tests. Each one starts with the same login lines and the same typed-in password. When the login form got a new "Remember me" checkbox, all 30 tests had to be edited.',
      task:
        'Refactor the tests. The login must live in one place. Tests get a logged-in page by asking for it. Credentials come from environment variables. No fixed sleeps.',
      starter: {
        language: 'typescript',
        title: 'tests/inventory.spec.ts (before)',
        code: `import { test, expect } from '@playwright/test';

test('shows products', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.waitForTimeout(2000);
  expect(await page.locator('.inventory_item').count()).toBe(6);
});

test('adds backpack', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.waitForTimeout(2000);
  await page.click('#add-to-cart-sauce-labs-backpack');
  expect(await page.locator('.shopping_cart_badge').textContent()).toBe('1');
});`,
      },
      hints: [
        'Which Playwright feature lets a test say "I need X" and get it ready, with clean-up afterwards?',
        'Move the four login lines into base.extend({ loggedInPage: async ({ page }, use) => { ...; await use(page); } }).',
        'Replace the sleep with an assertion that waits for the URL or title to change. Replace the count() and textContent() checks with toHaveCount and toHaveText.',
      ],
      solution: {
        language: 'typescript',
        title: 'fixtures/base.ts + tests/inventory.spec.ts (after)',
        code: `// fixtures/base.ts
import { test as base, expect, type Page } from '@playwright/test';

export const test = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('https://www.saucedemo.com/');
    await page.getByPlaceholder('Username').fill(process.env.SAUCE_USER!);
    await page.getByPlaceholder('Password').fill(process.env.SAUCE_PASS!);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
    await use(page);
  },
});
export { expect };

// tests/inventory.spec.ts
import { test, expect } from '../fixtures/base';

test('shows products', async ({ loggedInPage: page }) => {
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
});

test('adds backpack', async ({ loggedInPage: page }) => {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
});`,
      },
      explanation: `- **One place for login:** the \`loggedInPage\` fixture owns it. A UI change means one edit.
- **Credentials from environment variables** (\`SAUCE_USER\` and \`SAUCE_PASS\`, set in \`.env\` or CI secrets). They are no longer typed into 30 files. SauceDemo's are public, but a real app's are not.
- **No \`waitForTimeout\`:** the fixture checks the "Products" title. That check waits exactly as long as needed.
- **Web-first assertions** (\`toHaveCount\`, \`toHaveText\`) keep retrying until they pass or time out. \`count()\` + \`toBe\` checks only once, so it is flaky.
- **Better locators:** \`page.fill('#id')\` and \`page.click\` still work. But user-facing locators (\`getByPlaceholder\`, \`getByRole\`) or \`data-test\` ids survive code changes better.
- **Next step:** logging in through the UI for every test is still slow. The auth topic uses a setup project and \`storageState\`, so login runs once per run.`,
      followUps: [
        {
          q: 'Why not just put the login in a beforeEach in each file?',
          a: 'A beforeEach must be copied into every file. It runs even for tests that do not need a logged-in user. It also cannot hand a typed value to the test. The fixture is written once and imported everywhere. It runs only for tests that ask for it. Later you can switch it to storageState without touching any test.',
        },
        {
          q: 'How would you make the fixture log in as a different user for some tests?',
          a: "Turn the username into an option fixture: `sauceUser: ['standard_user', { option: true }]`. Let loggedInPage read it. A file or describe can then call `test.use({ sauceUser: 'problem_user' })`. A project can also set it in the config. The fixture code stays the same.",
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-cc-2',
      title: 'Tests sharing a mutable variable across parallel workers',
      context:
        'This file passes with --workers=1. After the team turned on fullyParallel: true, it fails at random. Sometimes the cart badge shows 2. Sometimes the "remove" test cannot find the item.',
      task:
        'Explain why it is flaky. Then rewrite it so every test is independent: it must pass alone, in any order, in any worker.',
      starter: {
        language: 'typescript',
        title: 'tests/cart.spec.ts (before)',
        code: `import { test, expect, type Page } from '@playwright/test';

let page: Page;          // shared page
let itemsInCart = 0;     // shared counter

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
});

test('add backpack', async () => {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  itemsInCart++;
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(String(itemsInCart));
});

test('add bike light', async () => {
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  itemsInCart++;
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(String(itemsInCart));
});

test('remove backpack', async () => {
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click(); // needs test 1
  itemsInCart--;
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(String(itemsInCart));
});`,
      },
      hints: [
        'With fullyParallel, each test may run in a different worker process. What is itemsInCart in a fresh worker? Which page does it use?',
        'Each test should create what it needs: a fresh page (the built-in page fixture) and its own items in the cart.',
        'For the remove test, add the backpack inside that test first (or in a fixture), then remove it.',
      ],
      solution: {
        language: 'typescript',
        title: 'tests/cart.spec.ts (after)',
        code: `import { test, expect } from '../fixtures/base'; // provides loggedInPage

test.describe.configure({ mode: 'parallel' }); // safe now: no shared state

const badge = '[data-test="shopping-cart-badge"]';

test('add backpack shows 1 in badge', async ({ loggedInPage: page }) => {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator(badge)).toHaveText('1');
});

test('add two items shows 2 in badge', async ({ loggedInPage: page }) => {
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await expect(page.locator(badge)).toHaveText('2');
});

test('removing the only item hides the badge', async ({ loggedInPage: page }) => {
  // arrange its OWN state instead of depending on another test
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator(badge)).toHaveText('1');
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
  await expect(page.locator(badge)).toBeHidden();
});`,
      },
      explanation: `**Why it was flaky:**
- \`page\` and \`itemsInCart\` are variables at the top of the file. Each worker process has its **own copy**, starting at 0. So a test alone in worker 2 may expect "1" while the page shows 2. Or it finds no backpack to remove.
- beforeAll runs once per worker. It runs again after a failure restarts the worker. So different workers have different shared pages with different carts.
- "remove backpack" needs "add backpack" to run first, in the same worker.

**Fixes:**
- Use the built-in **per-test** \`page\`, through the \`loggedInPage\` fixture. Each test gets a fresh context and an empty cart.
- Each test **sets up its own data**. It checks fixed values ("1", "2", hidden), not a running counter.
- The login details moved into the fixture (environment variables). Parallel mode is now safe and faster.`,
      followUps: [
        {
          q: 'Logging in for every test is slower than once in beforeAll. How do you keep tests separate and still fast?',
          a: 'Log in once per run in a setup project and save storageState to a file. Every test then starts a new context with that saved login. Tests stay separate but skip the login form. SauceDemo keeps its cart in localStorage, so tests do not see each other\'s carts, even with the same user. If the cart lives on the server, use one account per worker.',
        },
        {
          q: 'When is a shared page in beforeAll OK?',
          a: 'Rarely. It can work when tests only read, are costly to set up, and run in serial mode on purpose. Example: checking 20 static footer links on one loaded page. Even then the tests are no longer separate. A failure restarts the worker and beforeAll runs again. Most teams prefer fixtures plus fast API setup.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-hooks-fixtures-iq-01',
      difficulty: 'medium',
      question: 'What are fixtures in Playwright? How are they different from beforeEach hooks? When would you still use a hook?',
      whatInterviewerLooksFor: [
        'Explains fixtures as setup and clean-up that a test asks for by name',
        'Mentions: lazy, reusable across files, setup and clean-up in one place',
        'Knows hooks belong to one file or describe and always run there',
        'Gives a sensible rule for choosing',
      ],
      modelAnswer: `**Example:** \`test('cart', async ({ cartPage }) => { ... })\`. The test asks for \`cartPage\`. Playwright logs in, builds the page object and hands it over.

A **fixture** is something Playwright prepares for a test when the test asks for it by name. \`page\`, \`context\`, \`browser\` and \`request\` are built-in fixtures. We add our own with \`test.extend()\`.

A custom fixture is one async function. First comes the setup. Then \`await use(value)\` gives the value to the test and waits for it to finish. Then comes the clean-up, which runs even if the test failed.

**Differences from beforeEach:**

| | beforeEach | Fixture |
|---|---|---|
| Reuse | copy into each file | import once |
| Runs | for every test in scope | only when asked for (lazy) |
| Data to the test | a file-level \`let\` variable | a typed argument |
| Clean-up | a separate afterEach | after \`await use()\`, same function |
| Building on others | not possible | fixtures can use fixtures |

In my SauceDemo framework, \`loggedInPage\`, \`inventoryPage\` and \`cartPage\` are fixtures. Tests that do not need login never pay for it.

**When I still use hooks:** for tiny steps inside one file, like \`beforeEach(() => page.goto('/inventory.html'))\`. Or an \`afterEach\` that attaches a screenshot for one unstable area. For once-per-run work like login, I use a setup project, not \`beforeAll\`. \`beforeAll\` runs per worker, and again after every worker restart.`,
      followUps: [
        {
          q: 'What happens if you forget to await use()?',
          a: 'use() returns a promise that finishes only after the test ends. Without await, the fixture moves on at once. So the clean-up runs while the test is still using the value, for example deleting test data mid-test. You get confusing, random failures. Always write await use(value).',
        },
        {
          q: 'How do fixtures from two different files get combined?',
          a: 'You can chain extend calls, so one fixtures file extends another. Or use mergeTests(testA, testB) from @playwright/test. It gives one test object with both sets of fixtures, and tests import that merged test. This keeps page-object fixtures and API or data fixtures in separate files.',
        },
      ],
      pitfalls: [
        'Saying fixtures are "just test data" (that is what "fixture files" mean in Jest or Cypress)',
        'Saying fixtures always run for every test (only auto fixtures do)',
        'Logging in once in beforeAll and sharing one page across tests',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-02',
      difficulty: 'easy',
      question: 'In what order do beforeAll, beforeEach, afterEach and afterAll run when describes are nested? Show it with an example.',
      whatInterviewerLooksFor: [
        'Setup runs outer to inner; clean-up runs inner to outer',
        'beforeAll/afterAll run once per worker per scope',
        'Mentions that a failure restarts the worker',
        'Gives a clear worked example',
      ],
      modelAnswer: `**Example:** a file has \`describe('outer')\`. Inside it is \`describe('inner')\` with two tests. Each describe has all four hooks.

With one worker, the log is:

1. outer beforeAll
2. inner beforeAll
3. outer beforeEach → inner beforeEach → **test 1** → inner afterEach → outer afterEach
4. outer beforeEach → inner beforeEach → **test 2** → inner afterEach → outer afterEach
5. inner afterAll
6. outer afterAll

So **setup goes from outside in**, and **clean-up goes from inside out**. It is like opening and closing boxes inside boxes. Several hooks at the same level run in the order they were written.

Two warnings I always add:
- **beforeAll is per worker, not per run.** If tests from this file run in two workers, each worker runs beforeAll.
- **A failure restarts the worker.** If test 1 fails, Playwright shuts that worker down and runs its afterAll hooks. Test 2 starts in a new worker, which runs both beforeAll hooks again. In fully parallel mode, each test runs all hooks for itself.

That is why I never keep state that tests depend on in beforeAll.`,
      followUps: [
        {
          q: 'Where do fixtures fit into that order?',
          a: 'Auto worker fixtures are set up before beforeAll. Auto test fixtures are set up before beforeEach. Normal fixtures are set up just before the hook or test that needs them, so a fixture used only by the test body comes after beforeEach. Test fixtures are cleaned up after afterEach. Worker fixtures are cleaned up after afterAll, when the worker stops.',
        },
        {
          q: 'Does afterEach run when the test fails?',
          a: 'Yes. afterEach runs after every test, pass or fail. Playwright also keeps running the other hooks even if one hook fails. So afterEach is a good place to attach screenshots and logs. Compare testInfo.status with testInfo.expectedStatus to spot a failure.',
        },
      ],
      pitfalls: [
        'Saying afterEach runs outer first',
        'Saying beforeAll runs exactly once for the whole run',
        'Not knowing that a failing test causes a new worker',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-03',
      difficulty: 'medium',
      question: 'Walk me through a custom fixture that creates test data through an API before a test and deletes it afterwards.',
      context: 'The interviewer wants you to write it live in TypeScript against Restful Booker.',
      whatInterviewerLooksFor: [
        'Correct test.extend syntax with types',
        'Setup → await use → clean-up',
        'Uses the request fixture and checks the setup response',
        'Exports test and expect, and specs import them',
      ],
      modelAnswer: `**Example:** a test written as \`async ({ booking, request }) => { ... }\` gets a fresh booking. The booking is deleted after the test.

I would create \`fixtures/data.ts\`:

1. Import \`test as base\` and \`expect\` from \`@playwright/test\`.
2. Declare the type: \`type Fixtures = { booking: { id: number; lastname: string } }\`.
3. Write \`export const test = base.extend<Fixtures>({ booking: async ({ request }, use) => { ... } })\`.

Inside the fixture:
- **Setup:** send \`POST /booking\` with a unique lastname (Faker or \`testInfo.testId\`). Check \`res.ok()\`, so a broken setup fails clearly *inside the fixture*. Then read \`bookingid\`.
- **Hand over:** \`await use({ id, lastname })\`. The test runs at this point.
- **Clean-up:** get a token with \`POST /auth\`. Then send \`DELETE /booking/{id}\` with the header \`Cookie: token=...\`. Restful Booker returns 201 for a successful delete. This runs even if the test failed, so no data is left behind.

Then \`export { expect }\`. Specs use \`import { test, expect } from '../fixtures/data'\`.

Extra points I would mention:
- The token could be a **worker-scoped fixture**. Then I log in once per worker, not once per test.
- If I need fixtures from several files, I merge them with \`mergeTests\`.
- Checks about the feature stay in the test. The fixture only checks that setup worked.`,
      followUps: [
        {
          q: 'Why make the auth token worker-scoped?',
          a: 'The token is the same for every test, and fetching it costs a network call. A worker-scoped fixture fetches it once per worker and shares it with every test in that worker. It only uses worker-level things: it makes its own API client with playwright.request.newContext. So the scope rule is respected.',
        },
        {
          q: 'What if the clean-up itself fails?',
          a: 'The test is reported as failed with the clean-up error. That is correct, because data was left behind. Where it makes sense, I make clean-up forgiving, for example by ignoring a 404 if the test already deleted the booking. I log the id. A nightly job also deletes anything with the test prefix, as a safety net.',
        },
      ],
      pitfalls: [
        'Putting clean-up in afterAll with a shared list of ids (lost if the worker crashes)',
        'Forgetting to await use()',
        'Using the page fixture inside a worker-scoped fixture',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-04',
      difficulty: 'hard',
      question: 'What is the difference between a test-scoped and a worker-scoped fixture? Give an example where worker scope causes a bug.',
      whatInterviewerLooksFor: [
        'Lifetime: one test versus one worker process',
        'Worker fixtures cannot use test fixtures',
        'Understands the risk of shared data that tests change',
        'Knows parallelIndex/workerIndex for per-worker resources',
      ],
      modelAnswer: `**Example:** \`page\` is test-scoped: every test gets a new one. \`browser\` is worker-scoped: all tests in one worker share it.

- A **test-scoped** fixture is the default. It is created for each test that uses it and cleaned up after that test. \`page\`, \`context\` and \`request\` are test-scoped.
- A **worker-scoped** fixture uses \`[fn, { scope: 'worker' }]\`. It is created once per worker process. Every test in that worker shares it. It is cleaned up when the worker stops. It has its own timeout and can only use other worker fixtures.

**Good uses of worker scope:** an auth token, one test account per worker (picked by \`parallelIndex\`), a database connection, a local mock server, or a storageState file per worker.

**A bug caused by worker scope:** someone makes \`cartPage\` worker-scoped "to save time". It reuses one page for the whole worker. Test A adds a backpack. Test B in the same worker expects an empty cart but sees "1". The file passes alone but fails in the full suite. After any failure the worker restarts and the fixture is rebuilt. So the failures look random.

Another one: a worker-scoped "user" that every test edits, like changing the address. Tests in the same worker see each other's edits.

**Rule:** use worker scope only for read-only things, or things unique to that worker. Anything tests change should be test-scoped.`,
      followUps: [
        {
          q: 'workerIndex or parallelIndex: which do you use to pick an account per worker?',
          a: 'parallelIndex. It goes from 0 to workers-1. When a worker crashes, the new worker keeps the same parallelIndex. So it maps cleanly onto a fixed pool of accounts (qa_user_0 … qa_user_3). workerIndex keeps growing after each restart, so it would run past the end of the pool.',
        },
        {
          q: 'Can a worker-scoped fixture use page?',
          a: 'No. page belongs to one test and is thrown away after it. The worker fixture lives longer, so Playwright rejects this. If a worker fixture needs a page, it creates one with browser.newPage() and closes it itself. The official per-worker login example does exactly this.',
        },
      ],
      pitfalls: [
        'Thinking worker scope means shared across all workers',
        'Making page objects that tests change worker-scoped, for speed',
        'Using workerIndex to pick from an account pool',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-05',
      difficulty: 'medium',
      question: 'A developer suggests test.describe.serial for a checkout flow: test 1 logs in, test 2 adds to cart, test 3 checks out. What do you say?',
      whatInterviewerLooksFor: [
        'Knows what serial mode does on failure and on retry',
        'Explains why the docs warn against it',
        'Suggests independent tests with fixtures or API setup',
        'Admits there are rare good uses',
      ],
      modelAnswer: `**Example:** in serial mode, if "add to cart" fails, "check out" is **skipped**. With retries, the whole group starts again from "log in".

First, the facts. \`describe.serial\` is deprecated. The current way is \`test.describe.configure({ mode: 'serial' })\`. Serial tests run in order, in one worker. If test 2 fails, test 3 is skipped. With retries, the **whole group** is retried from test 1.

My concerns:
- **Hidden links between tests.** Test 3 does not just test checkout. It also tests that everything before it worked. A login bug shows up as three red tests, or one red and two skipped. That hides information.
- **No parallel runs and no single runs.** I cannot run just the checkout test with \`--grep\`. The group cannot be split across workers.
- **Slow retries.** A flaky step in test 3 repeats tests 1 and 2.

What I would suggest instead:
- One test, "user can check out a backpack", with \`test.step()\` for log in, add to cart and check out. The report still shows which step failed.
- Plus faster, independent tests for each part. Each one sets up its own state with a \`loggedInPage\` fixture or storageState. Cart contents are set up directly. SauceDemo keeps the cart in localStorage; a real app would use an API.

Serial mode is a last resort. Use it only for flows that cannot be set up any other way and are too costly to repeat.`,
      followUps: [
        {
          q: 'How many browser contexts does a serial group use?',
          a: 'Each test still gets its own page and context by default. So state does not carry over, unless you share a page made in beforeAll. That surprises people: serial mode promises order, not shared browser state. Teams that rely on serial often share a page from beforeAll too, which brings the worker-restart problems with it.',
        },
        {
          q: 'How do you set retries just for one describe?',
          a: "Call test.describe.configure({ retries: 2 }) inside that describe. It also accepts mode and timeout. This overrides the project or config retries, for that group only.",
        },
      ],
      pitfalls: [
        'Thinking serial mode shares the page automatically',
        'Not knowing later tests are skipped after a failure',
        'Rejecting the idea without offering test.step or fixtures instead',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-06',
      difficulty: 'easy',
      question: 'How do you run only smoke tests in CI? What is the difference between test.skip, test.fixme and test.fail?',
      whatInterviewerLooksFor: [
        'Tag syntax and --grep/--grep-invert',
        'Clear meaning of skip, fixme and fail',
        'Knows test.fail reports an error when the test passes',
        'Mentions forbidOnly for test.only',
      ],
      modelAnswer: `**Example:** \`test('login', { tag: '@smoke' }, async ({ page }) => { ... })\` plus \`npx playwright test --grep @smoke\` runs only the smoke tests.

**Tagging and choosing tests**
- Tag tests with \`{ tag: '@smoke' }\`, or put \`@smoke\` in the title. Tags can also go on a describe.
- CI smoke job: \`npx playwright test --grep @smoke\`. Nightly full run: \`npx playwright test --grep-invert @quarantine\`.
- Or define a "smoke" project with \`grep: /@smoke/\` in the config. Then the command is just \`--project=smoke\`.

**Annotations**
- \`test.skip()\`: the test **does not apply** here (feature not on Safari, not on staging). It does not run and shows as skipped. Usually it has a condition: \`test.skip(browserName === 'webkit', 'reason')\`.
- \`test.fixme()\`: the test is **broken and we plan to fix it**. It does not run. Unlike skip, it says that someone must fix it.
- \`test.fail()\`: the test **runs and must fail**, for example because it shows known bug BUG-482. If it suddenly passes, Playwright reports an error. That tells us the bug is fixed and the annotation should go.
- \`test.slow()\`: triples the timeout.

I link each fixme or fail to a ticket with \`annotation: { type: 'issue', description: 'BUG-482' }\`, so the HTML report shows why. I also set \`forbidOnly: !!process.env.CI\`. Then a forgotten \`test.only\` fails the CI run, instead of quietly skipping everything else.`,
      followUps: [
        {
          q: 'How do you select tests that have BOTH @smoke and @cart?',
          a: 'grep takes a regular expression. It is matched against the title, including tags. For AND, use lookaheads: --grep "(?=.*@smoke)(?=.*@cart)". For OR, use "@smoke|@cart". On Windows PowerShell the pipe needs escaping, which often trips up CI.',
        },
        {
          q: 'A test is flaky. Should you mark it fixme?',
          a: 'Only as a short, tracked quarantine with a ticket. It is not a fix. First I read the trace to find the cause: a missing wait, shared data or the environment. If I must quarantine, I tag it @quarantine and leave it out of the blocking job. I keep running it in a non-blocking job, so we still see results, and I set a deadline to fix it.',
        },
      ],
      pitfalls: [
        'Mixing up test.fail with "skip on failure"',
        'Using skip for known bugs, so nobody notices when they are fixed',
        'Not knowing about --grep-invert or forbidOnly',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-07',
      difficulty: 'expert',
      question:
        'After turning on fullyParallel, a file whose beforeAll creates a test user through the API starts failing with "user already exists". It also runs much slower. What changed, and how would you redesign it?',
      whatInterviewerLooksFor: [
        'Knows each test runs beforeAll for itself in parallel mode',
        'Spots data that is not unique across workers',
        'Suggests a worker-scoped fixture or a setup project',
        'Thinks about clean-up and worker restarts',
      ],
      modelAnswer: `**Example:** 6 tests in fully parallel mode means beforeAll runs 6 times. It tries to create the same user 6 times.

**What changed:** in default mode, all tests of the file ran in one worker. So beforeAll ran once, plus once more after any failure. With \`fullyParallel\`, the file's tests are spread over workers. The docs say **each parallel test runs all its hooks for itself**, including beforeAll and afterAll. So beforeAll now runs once per test:
- It always creates the same username, so the second try clashes: "user already exists".
- N tests now pay the user-creation cost N times, so the run is slower.

**Ways to redesign it:**
1. **Unique data per test**, if each test needs its own user. Use a test-scoped fixture. It creates \`user-\${testInfo.testId}\` (or a Faker email), hands it over and deletes it in clean-up.
2. **One user per worker**, if tests may share a user inside one worker. Use a worker-scoped fixture keyed by \`test.info().parallelIndex\`. It creates (or reuses) \`qa_user_\${parallelIndex}\` and cleans up when the worker stops.
3. **One user for the whole run**, if tests only read. A **setup project** creates the user once, and the test projects depend on it.

I would also make creation safe to repeat: if the user exists, reuse or reset it. A crashed worker may skip clean-up. A teardown project or nightly job can delete users with the test prefix.

**Lesson:** beforeAll is not "once per run". Choose the scope with fixtures or project dependencies, and make server data unique.`,
      followUps: [
        {
          q: 'How would you keep this file in default mode while the rest of the suite is fully parallel?',
          a: "Add test.describe.configure({ mode: 'default' }) at the top of the file. It takes that file out of the global fullyParallel setting, so its tests run in order, in one worker. That is only a quick patch. The real fix is unique data or the right fixture scope.",
        },
        {
          q: 'Why is a setup project better than globalSetup for creating that user once?',
          a: 'A setup project is a normal test. It shows in the HTML report, can record a trace, can use fixtures like request, and follows config options. globalSetup is a plain function outside the test runner, with no trace and no fixtures. Project dependencies also support a teardown project for clean-up.',
        },
      ],
      pitfalls: [
        'Assuming beforeAll still runs once after turning on fullyParallel',
        'Fixing it by setting workers: 1 for everything',
        'Using the same hard-coded username in every worker',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-hooks-fixtures-drill-1',
      question:
        'A file has beforeAll (A), beforeEach (E), afterEach (X), afterAll (Z) and two tests, t1 and t2. The config has fullyParallel: false and workers: 2, and another file runs in the other worker. Then you switch to fullyParallel: true. Write the log order for this file in each case. Both tests pass.',
      assumptions: [
        'All hooks are at file level, all tests pass, no retries.',
        'Default mode: one file is handled by one worker at a time.',
        'In parallel mode each test runs all relevant hooks for itself.',
        'Assume t1 lands in worker 0 and t2 in worker 1 in parallel mode.',
      ],
      steps: [
        { label: 'Default mode: who runs this file?', calc: 'One worker (say W0) takes the whole file; W1 is busy with the other file.' },
        { label: 'Default mode log (W0)', calc: 'A → E → t1 → X → E → t2 → X → Z' },
        { label: 'Parallel mode: t1 in W0', calc: 'W0: A → E → t1 → X → Z' },
        { label: 'Parallel mode: t2 in W1', calc: 'W1: A → E → t2 → X → Z (interleaved in time with W0)' },
        { label: 'Count hooks', calc: 'Default: A×1, Z×1, E×2, X×2. Parallel: A×2, Z×2, E×2, X×2.' },
      ],
      answer:
        'Default: **A, E, t1, X, E, t2, X, Z** in one worker. Fully parallel: **W0: A, E, t1, X, Z** and **W1: A, E, t2, X, Z**. They run at the same time, so the combined console output mixes in an unpredictable order. beforeAll and afterAll ran twice.',
      insight:
        'How often beforeAll runs depends on how tests are spread over workers, not on how many files you have. Anything in beforeAll must be safe to run many times, at the same time, in different processes.',
      followUps: [
        {
          q: 'In default mode, t1 fails. What is the log now?',
          a: 'W0: A, E, t1 (fails), X, Z. Then that worker shuts down. t2 runs in a new worker: A, E, t2, X, Z. So beforeAll and afterAll run twice even in default mode, because after a failure the next test always gets a fresh worker.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-drill-2',
      question:
        'Order these lines for one worker running two tests: `beforeEach` uses `page`; test 1 uses `page`; test 2 uses `cartPage` (test fixture depending on `page` and the worker fixture `apiToken`). There is also an auto test fixture `logs` and an auto worker fixture `env`. Lines to order: apiToken setup, beforeAll, cartPage setup/teardown, env setup/teardown, logs setup/teardown, page setup/teardown, beforeEach, afterEach, afterAll, test 1, test 2.',
      assumptions: [
        'Fixtures follow the official execution-order rules.',
        'browser setup/teardown can be ignored for this drill.',
        'All tests pass.',
      ],
      steps: [
        { label: 'Worker start', calc: 'Auto worker fixtures first: env setup → beforeAll' },
        { label: 'Test 1 setup', calc: 'Auto test fixtures before beforeEach: logs setup → page setup (beforeEach needs it) → beforeEach' },
        { label: 'Test 1 run + teardown', calc: 'test 1 → afterEach → page teardown → logs teardown' },
        { label: 'Test 2 setup', calc: 'logs setup → page setup → beforeEach → apiToken setup (lazy, first need) → cartPage setup' },
        { label: 'Test 2 run + teardown', calc: 'test 2 → afterEach → cartPage teardown → page teardown → logs teardown' },
        { label: 'Worker end', calc: 'afterAll → apiToken teardown → env teardown' },
      ],
      answer:
        '**env setup, beforeAll, logs setup, page setup, beforeEach, test 1, afterEach, page teardown, logs teardown, logs setup, page setup, beforeEach, apiToken setup, cartPage setup, test 2, afterEach, cartPage teardown, page teardown, logs teardown, afterAll, apiToken teardown, env teardown.**',
      insight:
        'Fixtures needed only by the test body are created after beforeEach. Worker fixtures live until after afterAll, even if only one test used them.',
      followUps: [
        {
          q: 'If no test used cartPage, would apiToken ever be set up?',
          a: 'No. Normal (non-auto) fixtures are lazy. A fixture runs only when a test, hook or another active fixture needs it. apiToken was pulled in only because cartPage needs it. Unused fixtures cost nothing, so a big fixtures file does not slow tests down.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-drill-3',
      question:
        'A spec file has 8 tests and a beforeAll that seeds data (6 s). Workers = 4. Compare how many times beforeAll runs and its total cost in: (a) default mode, all pass; (b) default mode, tests 3 and 6 fail; (c) fullyParallel, all pass; (d) a worker-scoped fixture keyed by parallelIndex with fullyParallel, all pass.',
      assumptions: [
        'Default mode: the whole file runs in one worker.',
        'A failure shuts down the worker; the next test starts in a fresh worker that re-runs beforeAll.',
        'Fully parallel: each test runs beforeAll for itself.',
        'Worker fixture: set up once per worker that uses it; all 4 workers get tests.',
      ],
      steps: [
        { label: '(a) default, all pass', calc: '1 run × 6 s = 6 s' },
        { label: '(b) default, 2 failures', calc: 'Initial 1 + restart after t3 + restart after t6 = 3 runs × 6 s = 18 s' },
        { label: '(c) fullyParallel', calc: '8 tests × 1 run each = 8 runs × 6 s = 48 s of seeding (spread over 4 workers ≈ 12 s wall time)' },
        { label: '(d) worker fixture', calc: '4 workers × 1 = 4 runs × 6 s = 24 s total (≈ 6 s wall time, in parallel)' },
      ],
      answer:
        '(a) **1×, 6 s** · (b) **3×, 18 s** · (c) **8×, 48 s total** · (d) **4×, 24 s total, about 6 s wall time**. Only (a) matches the "once" people assume.',
      insight:
        'Choose the scope on purpose: per test (fixture), per worker (worker fixture) or per run (setup project). beforeAll quietly switches between these, depending on the mode and on failures.',
      followUps: [
        {
          q: 'How would you get exactly one seed per run regardless of mode?',
          a: 'Put the seeding in a setup project (testMatch: /seed\\.setup\\.ts/). Add it to the dependencies of the test projects, with a teardown project for clean-up. It runs once, before the projects that depend on it. It also shows in the report with its own trace.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-hooks-fixtures-mcq-01',
      difficulty: 'easy',
      question: 'Your test must call a REST API directly, without opening a browser page. Which built-in fixture should it ask for?',
      options: ['page', 'request', 'context', 'browser'],
      correct: [1],
      explanation:
        'request is a separate API client, made fresh for each test and built for HTTP calls. page and context are browser objects (page.request exists, but it shares the browser cookies). browser is the shared browser for the worker and has no direct HTTP helpers.',
      followUps: [
        {
          q: 'Does the request fixture share cookies with page?',
          a: 'No. The request fixture has its own cookies. page.request (or context.request) shares cookies with the browser context. That helps when an API call must use the logged-in browser session.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-02',
      difficulty: 'easy',
      question: 'The config timeout is 30 s. A test calls test.slow() at its start. What is its timeout now?',
      options: ['30 s, slow() only changes the report label', '60 s', '90 s', 'No timeout at all'],
      correct: [2],
      explanation:
        'test.slow() marks the test as slow and triples its timeout, so 30 s becomes 90 s. It is more than a label. It does not double the limit or remove it. To remove the limit, you would call test.setTimeout(0).',
      followUps: [
        {
          q: 'Can you call test.slow() in beforeAll?',
          a: 'No. The API reference says slow() cannot be used in beforeAll or afterAll. Inside the hook, call test.setTimeout() to change that hook\'s timeout instead.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-03',
      difficulty: 'easy',
      question: 'Which command runs only the tests tagged @smoke?',
      code: {
        language: 'typescript',
        code: `test('login works', { tag: '@smoke' }, async ({ page }) => { /* ... */ });
test('sort by price @regression', async ({ page }) => { /* ... */ });`,
      },
      options: [
        'npx playwright test --tag smoke',
        'npx playwright test --grep @smoke',
        'npx playwright test --project=@smoke',
        'npx playwright test --only @smoke',
      ],
      correct: [1],
      explanation:
        'Tags are matched with --grep, and left out with --grep-invert. There is no --tag or --only flag. --project picks a project by its name in the config, not by a tag.',
      followUps: [
        {
          q: 'How would you run everything except @regression?',
          a: 'npx playwright test --grep-invert @regression. You can also combine them: --grep @smoke --grep-invert @slow runs the smoke tests that are not slow.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-04',
      difficulty: 'medium',
      question: 'What does this file print (one worker, both tests pass)?',
      code: {
        language: 'typescript',
        code: `test.beforeEach(() => console.log('E-outer'));
test.afterEach(() => console.log('X-outer'));
test.describe('group', () => {
  test.beforeEach(() => console.log('E-inner'));
  test.afterEach(() => console.log('X-inner'));
  test('t', () => console.log('t'));
});`,
      },
      options: [
        'E-outer, E-inner, t, X-outer, X-inner',
        'E-inner, E-outer, t, X-inner, X-outer',
        'E-outer, E-inner, t, X-inner, X-outer',
        'E-inner, t, X-inner (outer hooks do not apply inside a describe)',
      ],
      correct: [2],
      explanation:
        'File-level hooks apply to every test in the file, even inside nested describes. beforeEach hooks run outer to inner. afterEach hooks run inner to outer. Option A gets the clean-up order backwards. Option D is wrong because outer hooks still wrap tests in inner groups.',
      followUps: [
        {
          q: 'Where would a file-level beforeAll appear in this log?',
          a: 'First, before E-outer, once per worker. A beforeAll inside the describe would run after the file-level one, right before the first test of that group.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-05',
      difficulty: 'hard',
      question: 'Testers report that todo items sometimes vanish in the middle of tests that use this fixture. Why?',
      code: {
        language: 'typescript',
        code: `export const test = base.extend<{ todoPage: TodoPage }>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    use(todoPage);
    await todoPage.removeAll();
  },
});`,
      },
      options: [
        'TodoPage must be created inside use(), not before it',
        'use() is not awaited, so removeAll() runs immediately while the test is still running',
        'Fixtures cannot depend on page; they must use browser',
        'removeAll() should be in an afterAll hook because fixtures have no teardown',
      ],
      correct: [1],
      explanation:
        'use() returns a promise that finishes only after the test ends. Without await, the code goes straight on to the clean-up line and deletes items mid-test. Creating the object before use() is fine. Test fixtures may use page. And code after await use() is exactly where fixture clean-up belongs.',
      followUps: [
        {
          q: 'Which lint rule catches this kind of bug?',
          a: '@typescript-eslint/no-floating-promises flags promises that are not awaited or handled. eslint-plugin-playwright also has rules for missing awaits on Playwright calls. Both are worth turning on in a framework repo.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-06',
      difficulty: 'medium',
      question: 'Select ALL statements that are true about worker-scoped fixtures.',
      options: [
        'They are set up at most once per worker process and torn down when the worker shuts down',
        'They can depend on the page fixture',
        'They are shared by every worker in the run, so all workers see the same object',
        'They get their own timeout, equal to the test timeout by default',
        'They are declared with tuple syntax and { scope: \'worker\' }',
      ],
      correct: [0, 3, 4],
      explanation:
        'Worker fixtures live once per worker process. They have their own timeout (by default the test timeout) and use [fn, { scope: "worker" }]. They cannot use page, which belongs to one test and is thrown away after it. Workers are separate processes, so each worker has its own copy. Nothing is shared across workers.',
      followUps: [
        {
          q: 'Where do you put the type of a worker fixture in test.extend?',
          a: 'In the second type slot: base.extend<TestFixtures, WorkerFixtures>({...}). Test fixtures go in the first slot. Mixing them up gives type errors on the scope option.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-07',
      difficulty: 'medium',
      question:
        "A teammate sets a describe to mode: 'serial' so that test B can see the backpack that test A added to the cart. Both tests use the built-in page fixture. Does B see the backpack?",
      options: [
        'Yes: serial mode reuses one page for the whole group',
        'No: each test still gets a fresh page and context; serial only fixes order and skip-on-failure',
        'Yes, but only when workers is set to 1',
        'No, because serial mode clears localStorage after every test step',
      ],
      correct: [1],
      explanation:
        'Serial mode fixes the order and skips later tests after a failure. But page and context are still created fresh for each test. A new context has empty cookies and localStorage, so the cart is empty. The number of workers does not change that. Nothing is cleared per step; the separation comes from new contexts.',
      followUps: [
        {
          q: 'Why do the docs discourage serial mode?',
          a: 'Tests start to depend on each other. One failure skips the rest, retries repeat earlier tests, and the group cannot run in parallel or be filtered one by one. Independent tests with fixtures or API setup are faster and fail more clearly.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-08',
      difficulty: 'medium',
      question: 'This passes with --workers=1 but fails at random with fullyParallel: true and 4 workers. What is the root cause?',
      code: {
        language: 'typescript',
        code: `let createdId: number;

test('create booking', async ({ request }) => {
  const res = await request.post('/booking', { data: booking });
  createdId = (await res.json()).bookingid;
});

test('get booking', async ({ request }) => {
  const res = await request.get(\`/booking/\${createdId}\`);
  expect(res.status()).toBe(200);
});`,
      },
      options: [
        'The request fixture is shared between tests, so the second request is cancelled',
        'createdId is a module variable; in another worker it is undefined, and order is not guaranteed',
        'Restful Booker rate-limits parallel requests',
        'GET requests need await res.json() before checking status',
      ],
      correct: [1],
      explanation:
        'Each worker is a separate process with its own copy of the file\'s variables. A test in another worker sees createdId as undefined. Fully parallel mode also does not promise any order. The request fixture is per test, not shared. Rate limits would not explain why one worker always passes, and status() does not need the body read first.',
      followUps: [
        {
          q: 'How do you fix it?',
          a: 'Make "get booking" create its own booking. Best is a fixture that creates it, hands over the id and deletes it in clean-up. Then each test passes alone, in any order, in any worker.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-09',
      difficulty: 'medium',
      question:
        'A test shows a known product bug (BUG-482). You want CI to stay green now, but to be told automatically when developers fix the bug. Which annotation fits?',
      options: ['test.skip()', 'test.fixme()', 'test.fail()', 'test.slow()'],
      correct: [2],
      explanation:
        'test.fail() runs the test and expects it to fail. If it starts passing, Playwright reports an error. That is your signal that the bug is fixed. skip and fixme do not run the test, so nobody would notice the fix. slow only changes the timeout.',
      followUps: [
        {
          q: 'How would you link the test to BUG-482 in the report?',
          a: "Add an annotation in the test details: { annotation: { type: 'issue', description: 'BUG-482' } }. It shows in the HTML report next to the test.",
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-10',
      difficulty: 'hard',
      question:
        'A file has a beforeAll hook and 4 tests. It runs with fullyParallel: true and workers: 2, and all tests pass. According to the docs, how many times does beforeAll run for this file?',
      options: ['1', '2 (once per worker)', '4 (each parallel test runs relevant hooks for itself)', '0, because beforeAll is disabled in parallel mode'],
      correct: [2],
      explanation:
        'The parallelism guide says each parallel test runs all its hooks for itself, including beforeAll and afterAll. So 4 tests means 4 runs. "Once per worker" is true in default mode, where one worker runs the whole file. beforeAll is never turned off.',
      followUps: [
        {
          q: 'What would you use for once-per-worker setup in a fully parallel suite?',
          a: "A worker-scoped fixture ([fn, { scope: 'worker' }]). It is created once per worker, however the tests are spread, and cleaned up when the worker stops.",
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-11',
      difficulty: 'hard',
      question: 'Select ALL true statements about fixtures declared with { auto: true }.',
      options: [
        'They run for every test (or worker) even if no test names them',
        'An auto test fixture is set up before beforeEach hooks',
        'An auto test fixture also runs for the beforeAll hook',
        'They are a good way to implement global "before every test" behaviour such as collecting console errors',
      ],
      correct: [0, 1, 3],
      explanation:
        'Auto fixtures do not need to be named. Auto test fixtures are set up before beforeEach and the test. They are the recommended way to add global per-test behaviour. The docs\' order example shows that an auto WORKER fixture is set up for beforeAll, but an auto TEST fixture is not.',
      followUps: [
        {
          q: 'How do you make an auto fixture invisible in reports?',
          a: "Add box: true to its options ([fn, { auto: true, box: true }]). box: 'self' hides only the fixture's own step but keeps any steps inside it.",
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-12',
      difficulty: 'hard',
      question: 'Which is set up FIRST for the second test?',
      code: {
        language: 'typescript',
        code: `const test = base.extend<{ cart: string }, { token: string }>({
  token: [async ({}, use) => { await use('t'); }, { scope: 'worker' }],
  cart: async ({ page, token }, use) => { await use('c'); },
});
test.beforeEach(async ({ page }) => { /* goto */ });
test('first', async ({ page }) => {});
test('second', async ({ cart }) => {});`,
      },
      options: ['token', 'cart', 'page', 'beforeEach'],
      correct: [2],
      explanation:
        'beforeEach needs page, so page is set up first, then beforeEach runs. token and cart are needed only by the test body. So they are set up lazily, after beforeEach: token first (cart needs it), then cart. Neither has auto: true, so neither jumps ahead.',
      followUps: [
        {
          q: 'When is token torn down?',
          a: 'When the worker stops, after the afterAll hooks, because it is worker-scoped. cart and page are cleaned up right after the second test. cart goes first, because it uses page.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-13',
      difficulty: 'expert',
      question:
        'Default mode, 1 worker, retries: 0. A file has beforeAll and 5 tests. Test 2 fails; the others pass. How many times do beforeAll and afterAll run?',
      options: ['beforeAll 1, afterAll 1', 'beforeAll 2, afterAll 2', 'beforeAll 5, afterAll 5', 'beforeAll 2, afterAll 1'],
      correct: [1],
      explanation:
        'After test 2 fails, the worker shuts down and runs afterAll. A new worker runs tests 3–5. It runs beforeAll again, and afterAll at its end. So the answer is 2 and 2. Option A ignores the worker restart. C describes fully parallel mode. D forgets that afterAll runs in the old worker before it stops.',
      followUps: [
        {
          q: 'How can you see this happening?',
          a: 'Log testInfo.workerIndex in beforeAll. You will see 0 for the first run and 1 after the failure, while parallelIndex stays 0. The HTML report also shows a different worker for the later tests.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-14',
      difficulty: 'expert',
      question:
        'Tests in 4 workers create Restful Booker bookings. Later, each test searches for "its" booking by lastname. Select ALL choices that give a lastname unique to each test.',
      options: [
        'const lastname = `qa-${Date.now()}` at the top of the spec file',
        'test.info().testId combined with a prefix, inside the test',
        "faker.string.uuid() generated inside the test or a test-scoped fixture",
        'testInfo.parallelIndex on its own',
      ],
      correct: [1, 2],
      explanation:
        'testId is unique per test, and a uuid made inside each test is unique too. A Date.now() at the top of the file is computed once per worker, when the file loads. Every test in that worker shares it, and two workers could even get the same millisecond. parallelIndex names a worker slot, so all tests in that worker would share it.',
      followUps: [
        {
          q: 'When is parallelIndex the right key?',
          a: 'When you want one thing per worker, not per test. Example: one login account per worker from a fixed pool (qa_user_0..3), or one storageState file per worker. Each test still creates its own unique business data.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-15',
      difficulty: 'medium',
      question: 'Which tests run with `npx playwright test --grep @smoke --grep-invert @slow`?',
      code: {
        language: 'typescript',
        code: `test.describe('cart', { tag: '@smoke' }, () => {
  test('add item', async () => {});                          // T1
  test('add 50 items', { tag: '@slow' }, async () => {});    // T2
});
test('checkout @smoke', async () => {});                     // T3
test('sort products', { tag: '@regression' }, async () => {}); // T4`,
      },
      options: ['T1 and T3', 'T1, T2 and T3', 'Only T3', 'T1 only'],
      correct: [0],
      explanation:
        'Tags on a describe apply to every test inside it, so T1 and T2 have @smoke. T3 has @smoke in its title. T2 also has @slow, so --grep-invert removes it. T4 has no @smoke. So the answer is T1 and T3.',
      followUps: [
        {
          q: 'How would you make this the default for a CI smoke job without typing flags?',
          a: "Define a project with grep: /@smoke/ and grepInvert: /@slow/ in playwright.config.ts. Then run --project=smoke. Projects support the grep and grepInvert options.",
        },
      ],
    },
  ],
};

export default topic;
