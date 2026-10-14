import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-hooks-fixtures',
  phase: 'pw-framework',
  order: 1,
  title: 'Test Structure, Hooks & Fixtures',
  subtitle:
    'How a Playwright test file is organised (test, describe, step), when hooks run, how fixtures inject ready-made setup into tests, and how annotations, tags and parallel modes control what runs.',
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
    'Building blocks: test() = one scenario, test.describe() = a group, test.step() = a named step inside a test (shows in report/trace, can return a value).',
    'Hooks: beforeAll/afterAll run once per worker for their scope; beforeEach/afterEach run around every test in their scope. Outer beforeEach runs before inner; inner afterEach runs before outer.',
    'A failed test kills its worker; the next tests start in a fresh worker, so beforeAll runs AGAIN. Never assume "beforeAll = once per run".',
    'Built-in fixtures: page, context (both fresh per test), browser (shared per worker), browserName, request (isolated APIRequestContext). Also testInfo as the second argument.',
    'Custom fixture: base.extend({ name: async ({ page }, use) => { setup; await use(value); teardown } }). Code after await use() is teardown and runs even when the test fails.',
    'Fixtures are lazy (set up only if a test or hook asks for them) and composable (a fixture can depend on other fixtures). Dependencies are set up first, torn down last.',
    "Worker scope: [fn, { scope: 'worker' }] runs once per worker, can only depend on worker fixtures (browser, not page). auto: true runs it without being named.",
    'Fixtures > hooks for reusable setup: on-demand, typed, teardown is next to setup, shareable across files. Hooks are fine for file-local setup.',
    "Annotations: test.skip (do not run), test.fixme (known broken, do not run), test.fail (run, must fail), test.slow (timeout x3), test.only (focus; block with forbidOnly on CI).",
    "Tags: { tag: '@smoke' } or '@smoke' in the title; run with --grep @smoke, exclude with --grep-invert @slow.",
    "Default: files in parallel, tests in a file in order. fullyParallel: true or describe.configure({ mode: 'parallel' }) splits a file. mode: 'serial' skips the rest after a failure and retries the whole group (discouraged).",
    'Never share mutable module-level variables between tests: each worker is a separate process. Make data unique with testInfo.testId / workerIndex / parallelIndex.',
  ],
  sections: [
    {
      heading: 'Anatomy of a test file: test, describe and test.step',
      body: `**Intuition:** a spec file is like a chapter of a manual test-case document. Each \`test()\` is one test case, \`test.describe()\` is a section heading that groups related cases, and \`test.step()\` is a numbered step inside a case.

- **\`test(title, async ({ fixtures }) => { ... })\`** declares one independent test. The object you destructure (\`{ page }\`) asks the runner for **fixtures** (more on them below).
- **\`test.describe(title, () => { ... })\`** groups tests. Hooks, \`test.use()\` options, tags and \`describe.configure()\` declared inside apply only to that group. Describes can nest.
- **\`test.step(title, async () => { ... })\`** wraps part of a test in a named step. Steps appear in the HTML report, UI mode and trace viewer, so a failure says "failed in step *Add backpack to cart*" instead of "line 37". A step **returns whatever its body returns**, so you can read data inside a step and use it later.

Useful step options: \`{ box: true }\` makes errors point at the step call (great for helper functions), and \`{ timeout }\` puts a limit on a single step.

**Common mistake:** writing a 60-line test with no steps. It works, but when it fails at 2 a.m. in CI nobody can tell which business action broke. Steps are cheap documentation.

**In interviews, say this:** "I keep tests independent, group them by feature with describe, and use test.step for business-level actions so the report reads like a manual test case."`,
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
        'test = one independent scenario; describe = group with its own hooks/options; step = named sub-action.',
        'test.step returns the body\'s return value; { box: true } points errors at the caller.',
        'Steps make reports and traces readable for non-coders on the team.',
      ],
      source: 'Playwright docs — Test API reference (test.describe, test.step)',
    },
    {
      heading: 'Hooks: beforeAll, beforeEach, afterEach, afterAll',
      body: `**Intuition:** hooks are "do this before/after" instructions attached to a scope, like a lab rule "wash hands before every experiment" (beforeEach) versus "switch on the lab once in the morning" (beforeAll).

| Hook | Runs | Gets | Typical use |
|---|---|---|---|
| \`test.beforeAll\` | once per **worker** for the file/describe it is in | worker fixtures only (\`browser\`, not \`page\`) | create a shared read-only resource, seed data |
| \`test.beforeEach\` | before **every** test in scope | test fixtures (\`page\`, \`request\`) + testInfo | navigate to the start page, small per-test setup |
| \`test.afterEach\` | after every test in scope, **also when it failed** | test fixtures + testInfo | attach logs, clean up what the test created |
| \`test.afterAll\` | once per worker after the tests of that scope | worker fixtures | delete what beforeAll created |

Facts worth memorising (from the API reference):
- Hooks at file level cover the whole file; hooks inside a \`describe\` cover only that group.
- Several hooks at the same scope run in **registration order**.
- Playwright keeps running the other applicable hooks even if one of them fails, so cleanup still happens.
- Since v1.38 hooks can have a title: \`test.beforeEach('Open inventory', async ({ page }) => ...)\`, which shows up in reports.
- \`test.use()\` is **not** allowed inside \`beforeEach\`/\`beforeAll\`; call it at file or describe level.

**Why beforeAll cannot use \`page\`:** \`page\` is created fresh for each test, but beforeAll belongs to the worker, which lives longer than any single test. If you really need a page in beforeAll, create one from \`browser.newPage()\` and close it in afterAll (and accept that this page is shared).

**Common mistake:** logging in inside \`beforeAll\` with a shared page and then letting every test use that page. One failing test kills the worker, a new worker re-runs beforeAll, and tests start depending on each other's leftovers. Prefer fixtures or storageState (see the auth topic).`,
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
        'beforeAll/afterAll: once per worker, worker fixtures only.',
        'beforeEach/afterEach: around each test, can use page/request/testInfo.',
        'afterEach still runs when the test failed; use testInfo.status to react.',
      ],
      source: 'Playwright docs — Test API reference: test.beforeAll / beforeEach / afterEach / afterAll',
    },
    {
      heading: 'Hook order across nested describes and workers',
      body: `**Intuition:** think of nested describes as Russian dolls. On the way **in**, the outer doll opens first; on the way **out**, the inner doll closes first.

For one test inside \`describe('outer') > describe('inner')\`, the order is:

1. outer \`beforeAll\` (first time the worker reaches this scope), then inner \`beforeAll\`
2. outer \`beforeEach\` → inner \`beforeEach\`
3. the test body
4. inner \`afterEach\` → outer \`afterEach\`
5. after the last test of a scope in that worker: inner \`afterAll\`, then outer \`afterAll\`

**Workers change the picture.** A worker is a separate Node process with its own browser. Every worker that runs tests from a file runs that file's \`beforeAll\` for itself. Two more rules from the docs catch people out:

- **A failed test shuts down its worker.** The next test starts in a brand-new worker, so \`beforeAll\` runs again there (and \`afterAll\` runs in the old worker before it dies).
- **In parallel mode** (\`fullyParallel\` or \`mode: 'parallel'\`), each test runs all relevant hooks for itself, including \`beforeAll\`/\`afterAll\`. A "run once" beforeAll in a fully parallel file runs once **per test**.

**In interviews, say this:** "beforeAll is per worker, not per run. If I need once-per-run setup I use a setup project (project dependencies), and if I need once-per-worker setup I use a worker-scoped fixture."`,
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
        'Setup hooks go outer → inner; teardown hooks go inner → outer.',
        'beforeAll runs once per worker per scope, and again after a worker restart caused by a failure.',
        'In fully parallel mode every test runs beforeAll/afterAll for itself.',
      ],
      source: 'Playwright docs — Parallelism; Retries (workers and failures); Test API reference',
    },
    {
      heading: 'Built-in fixtures: page, context, browser, request',
      body: `**Intuition:** a fixture is like a hotel room that is cleaned and prepared before you arrive and cleaned again after you leave. You just say "I need a room" (\`{ page }\`) and it is ready.

When you write \`async ({ page, request }) => {}\`, Playwright reads the names you destructure and prepares exactly those objects. Built-in fixtures:

| Fixture | What it is | Lifetime |
|---|---|---|
| \`page\` | a fresh tab in a fresh context | new for every test |
| \`context\` | the isolated BrowserContext that owns \`page\` (own cookies, storage) | new for every test |
| \`browser\` | the launched browser | shared by all tests in a worker |
| \`browserName\` | \`'chromium' \\| 'firefox' \\| 'webkit'\` | value from the project |
| \`request\` | an isolated \`APIRequestContext\` for API calls | new for every test |

Every \`use\` option in the config (\`baseURL\`, \`storageState\`, \`viewport\`, \`locale\`...) is also exposed as a fixture you can read (\`async ({ baseURL }) => ...\`) and override with \`test.use()\`.

The **second argument** to a test, hook or fixture is \`testInfo\`: title, status, retry number, \`outputPath()\`, \`attach()\`, \`workerIndex\`, \`parallelIndex\`, \`testId\`. You can also get it anywhere during a test with \`test.info()\`.

**Why this matters:** isolation. Because \`page\` and \`context\` are new for each test, cookies and localStorage from test A never leak into test B. That is what makes parallel runs safe and is a big difference from older frameworks where one driver session was reused.`,
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
        'page/context/request: fresh per test. browser: shared per worker.',
        'Config "use" options are fixtures too (baseURL, storageState, viewport...).',
        'testInfo = metadata + helpers (attach, outputPath, workerIndex, testId).',
      ],
      source: 'Playwright docs — Fixtures: built-in fixtures',
    },
    {
      heading: 'Custom fixtures with test.extend and use()',
      body: `**Intuition:** a custom fixture is your own "hotel room type": you write the cleaning instructions once (setup and teardown) and any test can book it by name.

**Mechanics.** \`test.extend()\` returns a **new** \`test\` function that knows extra fixtures. Each fixture is an async function that receives other fixtures and a \`use\` callback:

1. Code **before** \`await use(value)\` is setup.
2. \`await use(value)\` hands \`value\` to the test and **waits until the test finishes**.
3. Code **after** \`await use()\` is teardown. It runs even if the test failed.

Rules to remember:
- Tests must import \`test\` from **your fixtures file**, not from \`@playwright/test\`, or the new fixtures do not exist. Re-export \`expect\` from the same file for convenience.
- Fixtures are **lazy**: a fixture is set up only when a test or hook asks for it by name.
- Fixtures can depend on other fixtures (\`inventoryPage\` can ask for \`page\`). Playwright sets up dependencies first and tears them down last.
- Always \`await use(...)\`. Without \`await\`, the teardown code runs immediately while the test is still using the value.
- Names: letters, digits and underscores, starting with a letter or underscore.
- You can **override** built-ins (e.g. make \`page\` start already on \`baseURL\`) and **merge** fixture sets from several files with \`mergeTests(a, b)\`.

**Worked example (SauceDemo):** almost every test needs "a logged-in user on the inventory page". Instead of copy-pasting four login lines into 40 tests, define a \`loggedInPage\` fixture. If the login screen changes, you edit one function.`,
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
        'Setup → await use(value) → teardown, all in one function.',
        'Import test from the fixtures file; re-export expect.',
        'Lazy + composable: only requested fixtures run, dependencies first.',
      ],
      source: 'Playwright docs — Fixtures: creating a fixture, overriding fixtures, mergeTests',
    },
    {
      heading: 'Worker-scoped, auto and option fixtures',
      body: `**Intuition:** test-scoped fixtures are disposable cups (new one per test). Worker-scoped fixtures are the office coffee machine: set up once per worker and shared by every test that worker runs.

Fixture options are passed with **tuple syntax** \`[fn, { ...options }]\`:

| Option | Meaning | Example use |
|---|---|---|
| \`scope: 'worker'\` | set up once per worker, torn down when the worker exits | one test account per worker, a DB connection, a started mock server |
| \`auto: true\` | runs for every test (or worker) even if nobody names it | collect console errors, attach logs on failure, global "hooks" |
| \`timeout: 60_000\` | separate time limit for a slow fixture | seeding a big dataset |
| \`option: true\` | a configurable value that projects or \`test.use()\` can set | \`defaultUser: ['standard_user', { option: true }]\` |
| \`box: true\` / \`'self'\` | hide the fixture's steps from reports (\`'self'\` keeps inner steps) | noisy helpers |
| \`title: 'my fixture'\` | friendlier name in reports and errors | |

Rules:
- Worker fixtures go in the **second** type parameter: \`base.extend<TestFixtures, WorkerFixtures>()\`.
- A worker fixture can only depend on other worker fixtures (\`browser\`), never on \`page\`/\`context\`, because those die after each test.
- Worker fixtures get their **own timeout** (equal to the test timeout by default); test fixtures count toward the test's timeout unless you give them one.
- Inside a worker fixture, \`test.info().parallelIndex\` (0 … workers-1, stable across restarts) is the right key for "one account per worker".

**Common mistake:** making something worker-scoped that tests mutate (a cart, a shared page). Worker scope is safe for read-only or per-worker-unique resources only.`,
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
        "[fn, { scope: 'worker' }] = once per worker; worker fixtures cannot use page.",
        'auto: true = global per-test (or per-worker) hook as a fixture.',
        'option: true makes a fixture configurable from projects or test.use().',
      ],
      source: 'Playwright docs — Fixtures: worker-scoped, automatic, timeout, option, box and title',
    },
    {
      heading: 'How fixtures and hooks interleave',
      body: `**Intuition:** Playwright prepares exactly what each step needs *just before* that step, and cleans up in reverse.

The official execution-order example boils down to these rules:
- If fixture A depends on fixture B, **B is set up before A and torn down after A**.
- Non-auto fixtures are set up **lazily**, right before the hook or test that needs them.
- **Auto worker fixtures** are set up before anything else in the worker (even before beforeAll).
- **Auto test fixtures** are set up before \`beforeEach\` hooks and the test.
- Test-scoped fixtures are torn down after each test (after \`afterEach\`); worker-scoped ones when the worker shuts down (after \`afterAll\`).

Worked example: \`beforeEach\` uses \`page\`; test 1 uses \`page\`; test 2 uses \`testFixture\`, which depends on \`page\` and the worker fixture \`workerFixture\`.`,
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
        'Dependencies: set up first, torn down last.',
        'Auto worker fixtures come before beforeAll; auto test fixtures before beforeEach.',
        'A fixture needed only by the test body is set up after beforeEach.',
      ],
      source: 'Playwright docs — Fixtures: execution order',
    },
    {
      heading: 'Fixtures vs hooks: which one when?',
      body: `**Intuition:** a hook is a rule pinned to one notice board (one file or describe). A fixture is a tool in a shared toolbox: any test in any file can pick it up, and it puts itself away afterwards.

| Question | Hooks (beforeEach/afterEach) | Fixtures (test.extend) |
|---|---|---|
| Reuse across files | copy the hook into each file | import \`test\` once, use anywhere |
| Runs when | for every test in scope, needed or not | only for tests that ask (lazy), unless \`auto\` |
| Setup and teardown | in two separate hooks, often far apart | in one function around \`await use()\` |
| Passing values to the test | via \`let\` variables at file scope (mutable, untyped) | as a typed argument (\`{ cartPage }\`) |
| Composition | hard; hooks cannot depend on each other | fixtures depend on fixtures |
| Scope | per test or per worker | per test or per worker, configurable |
| Reports | hook titles | fixture steps (can be boxed/titled) |

**Rule of thumb:**
- Use a **hook** for small, file-local setup that every test in that file needs (e.g. \`page.goto('/inventory.html')\`).
- Use a **fixture** for anything reused across files, anything with teardown, anything that produces a value (page objects, API clients, test data, logged-in pages).
- Use a **setup project** (project dependencies) for once-per-run work like authenticating and saving storageState.

**In interviews, say this:** "Fixtures give me dependency injection: the test declares what it needs, setup and teardown live together, and nothing runs that the test did not ask for. I keep hooks for tiny file-local steps."`,
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
        'Hooks: file-local, always run in scope. Fixtures: reusable, lazy, typed, self-cleaning.',
        'Pass data via fixture arguments, not file-level let variables.',
        'Once-per-run setup belongs in a setup project, not beforeAll.',
      ],
      source: 'Playwright docs — Fixtures: "with fixtures" vs "without fixtures"; Checkly blog on POM + fixtures',
    },
    {
      heading: 'Annotations and tags: skip, fixme, fail, slow, only, @smoke',
      body: `**Intuition:** annotations are sticky notes on a test case: "not for Firefox", "known bug, ignore", "this one is slow". Tags are labels you can filter on, like "@smoke" or "@regression".

| Annotation | Runs the test? | Report shows | Use when |
|---|---|---|---|
| \`test.skip()\` | no | skipped | test not applicable (feature not on this browser/env) |
| \`test.fixme()\` | no | skipped (fixme) | test is broken/too slow and you intend to fix it |
| \`test.fail()\` | **yes**, and it must fail | passes if it fails; **errors if it passes** | known product bug: you get alerted when the bug is fixed |
| \`test.slow()\` | yes | normal | test is legitimately long: timeout ×3 |
| \`test.only()\` | only focused tests run | | local debugging; block on CI with \`forbidOnly: !!process.env.CI\` |

Most of these have three forms: declare (\`test.skip('title', body)\`), unconditional inside a test (\`test.skip()\`), and **conditional** (\`test.skip(browserName === 'webkit', 'reason')\`). At describe level you can pass a callback that receives fixtures: \`test.skip(({ browserName }) => browserName !== 'chromium', 'Chromium only')\`. Use \`test.describe.skip\` / \`test.describe.fixme\` for whole groups.

**Tags** start with \`@\`. Add them with the \`tag\` option (on a test or a describe) or inside the title:
- \`test('checkout', { tag: ['@smoke', '@cart'] }, async ({ page }) => {})\`
- \`npx playwright test --grep @smoke\` runs them; \`--grep-invert @slow\` excludes; \`--grep "@smoke|@cart"\` is OR.

**Custom annotations** (\`{ annotation: { type: 'issue', description: 'JIRA-123' } }\`, or \`test.info().annotations.push(...)\` at runtime) show in the HTML report, handy for linking bug tickets.`,
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
        'skip = not applicable; fixme = broken, do not run; fail = run and expect failure.',
        'test.slow() triples the timeout; it cannot be used in beforeAll/afterAll.',
        'Tags via { tag } or @word in the title; filter with --grep / --grep-invert.',
      ],
      source: 'Playwright docs — Annotations; Test API reference (test.skip, test.fail, test.slow)',
    },
    {
      heading: 'Serial vs parallel modes',
      body: `**Intuition:** by default Playwright is like a team of cashiers (workers) each taking a whole basket (file) and scanning its items (tests) one after another. You can also tell it to split baskets so items are scanned by different cashiers, or to force one basket to be scanned strictly in order and abandoned if an item fails.

| Mode | How to enable | Behaviour | Retries |
|---|---|---|---|
| default | nothing | files in parallel; tests in a file in order, same worker | each failed test retried on its own |
| parallel | \`fullyParallel: true\` (config or project) or \`test.describe.configure({ mode: 'parallel' })\` | tests of one file spread over workers | each test retried on its own |
| serial | \`test.describe.configure({ mode: 'serial' })\` | strict order; after a failure the remaining tests are **skipped** | the **whole group** is retried from the start |

\`test.describe.serial\` and \`test.describe.parallel\` still exist but are deprecated; use \`describe.configure\`. \`describe.configure\` also takes \`retries\` and \`timeout\` for that scope. You can opt one file **out** of a global \`fullyParallel\` with \`mode: 'default'\`.

**Why the docs discourage serial mode:** serial tests depend on each other (test 2 needs the cart from test 1). That hides bugs, makes failures cascade, and blocks parallelism. Prefer independent tests that each set up their own state with fixtures or API calls. Serial mode is a last resort for genuinely multi-step journeys that are too expensive to set up repeatedly.

**Worker facts:** workers are separate processes and cannot share variables. \`workerIndex\` is unique per worker process and increases after restarts; \`parallelIndex\` is 0 … workers-1 and is reused by the replacement worker. Control worker count with \`workers\` in config or \`--workers\`.`,
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
        'Default: files parallel, tests in file sequential.',
        "mode: 'parallel' / fullyParallel splits files; tests must be independent.",
        "mode: 'serial' skips the rest after a failure and retries the whole group.",
      ],
      source: 'Playwright docs — Parallelism; Test API reference (describe.configure)',
    },
    {
      heading: 'Sharing state safely between tests and workers',
      body: `**Intuition:** each worker is a separate kitchen. A note stuck on one kitchen's fridge (a module-level variable) is invisible to the other kitchens, and the next cook in the same kitchen might read a stale note.

Three classic bugs:
1. **Module-level mutable variable** (\`let cartCount = 0\` at the top of the file). It is per worker, survives between tests in that worker, and is reset when the worker restarts. Results depend on which tests ran before in that process.
2. **Tests that rely on order** (test 2 uses the user created by test 1). Breaks with \`fullyParallel\`, \`--grep\`, \`--last-failed\` and retries.
3. **Shared backend data** (all workers edit the same booking or the same user's cart). Browser contexts are isolated, but the **server** is not.

Fixes:
- Pass values via **fixtures**, not shared variables.
- Make backend data unique per test: \`'order-' + testInfo.testId\` or Faker values; per worker: \`parallelIndex\`.
- Write files to \`testInfo.outputPath('export.csv')\`, which is unique per test.
- If a test needs prior state, **create it inside the test** (API call in a fixture) instead of depending on another test.

**In interviews, say this:** "Each test must pass when run alone, in any order, in any worker. I treat any test that only passes after another test as a bug in the suite."`,
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
        'Module-level variables are per worker and survive between tests: avoid them.',
        'Isolated browser contexts do not isolate the backend; make data unique.',
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
        'A teammate wrote 30 SauceDemo tests. Each one starts with the same login lines and hard-coded credentials. When the login form got a new "Remember me" checkbox, 30 tests had to be edited.',
      task:
        'Refactor so the login lives in exactly one place, tests receive a logged-in page by asking for it, credentials come from environment variables, and tests no longer wait with fixed sleeps.',
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
        'Which Playwright feature lets a test say "I need X" and get it prepared, with optional cleanup afterwards?',
        'Move the four login lines into base.extend({ loggedInPage: async ({ page }, use) => { ...; await use(page); } }).',
        'Replace the sleep with a web-first assertion that the URL or title changed, and replace count()/textContent() checks with toHaveCount/toHaveText.',
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
      explanation: `- **One place for login:** the \`loggedInPage\` fixture owns it; a UI change means one edit.
- **Credentials from env vars** (\`SAUCE_USER\`, \`SAUCE_PASS\` set in \`.env\`/CI secrets) instead of literals in 30 files. SauceDemo's are public, but real apps' are not.
- **No \`waitForTimeout\`:** the fixture asserts the "Products" title, which auto-waits just as long as needed.
- **Web-first assertions** (\`toHaveCount\`, \`toHaveText\`) retry; \`count()\` + \`toBe\` checks once and is flaky.
- **Modern APIs:** \`page.fill('#id')\`/\`page.click\` work but user-facing locators (\`getByPlaceholder\`, \`getByRole\`) or \`data-test\` ids survive refactors better.
- **Next step:** with many tests, logging in through the UI each time is still slow. The auth topic replaces this with a setup project + \`storageState\`, so login runs once per run.`,
      followUps: [
        {
          q: 'Why not just put the login in a beforeEach in each file?',
          a: 'A beforeEach must be copied into every file, runs even for tests that do not need a logged-in user, and passes nothing typed to the test. The fixture is defined once, imported everywhere, runs only for tests that request it, and can later be swapped for a storageState-based version without touching any test.',
        },
        {
          q: 'How would you make the fixture log in as a different user for some tests?',
          a: "Turn the username into an option fixture: `sauceUser: ['standard_user', { option: true }]`, and let loggedInPage read it. A file or describe can then call `test.use({ sauceUser: 'problem_user' })`, or a project can set it in config. The fixture logic stays the same.",
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-cc-2',
      title: 'Tests sharing a mutable variable across parallel workers',
      context:
        'This file passes with --workers=1 but fails randomly after the team enabled fullyParallel: true. Sometimes the cart badge shows 2, sometimes the "remove" test cannot find the item.',
      task:
        'Explain why it is flaky and rewrite it so every test is independent: it must pass alone, in any order, in any worker.',
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
        'With fullyParallel, each test may run in a different worker process. What is the value of itemsInCart in a fresh worker? Which page does it use?',
        'Each test should create the state it needs: a fresh page per test (the built-in page fixture) and its own items in the cart.',
        'For the remove test, add the backpack inside that test first (or via a fixture), then remove it.',
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
- \`page\` and \`itemsInCart\` are module-level variables. Each worker process has its **own copy**, starting at 0, so a test running alone in worker 2 expects "1" where the page may already show 2, or finds no backpack to remove.
- beforeAll runs once per worker (and again after a failure restarts the worker), so different workers have different shared pages with different carts.
- "remove backpack" depends on "add backpack" having run first in the same worker.

**Fixes:**
- Use the built-in **per-test** \`page\` (through the \`loggedInPage\` fixture): fresh context, empty cart, every time.
- Each test **arranges its own state** and asserts absolute values ("1", "2", hidden), not a running counter.
- Credentials moved into the fixture (env vars). Parallel mode is now safe and faster.`,
      followUps: [
        {
          q: 'Logging in for every test is slower than once in beforeAll. How do you keep isolation and speed?',
          a: 'Log in once per run in a setup project and save storageState to a file; every test then starts with a new context preloaded with that cookie, so it is isolated but skips the login form. SauceDemo keeps its cart in localStorage, so tests do not see each other\'s carts even with the same user. For apps where the cart lives on the server, use one account per worker.',
        },
        {
          q: 'When is a shared page in beforeAll acceptable?',
          a: 'Rarely: when tests are read-only, expensive to set up, and run in serial mode on purpose, for example checking 20 static footer links on one loaded page. Even then you lose isolation, and a failure restarts the worker and repeats beforeAll. Most teams prefer fixtures plus fast API setup.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-hooks-fixtures-iq-01',
      difficulty: 'medium',
      question: 'What are fixtures in Playwright, and how are they different from beforeEach hooks? When would you still use a hook?',
      whatInterviewerLooksFor: [
        'Explains fixtures as on-demand, dependency-injected setup/teardown',
        'Mentions laziness, reuse across files, setup and teardown in one place',
        'Knows hooks are file/describe scoped and always run',
        'Gives a sensible rule for choosing',
      ],
      modelAnswer: `**Fixtures** are named resources that Playwright prepares for a test when the test asks for them in its argument list. \`page\`, \`context\`, \`browser\` and \`request\` are built-in fixtures; we add our own with \`test.extend()\`.

A custom fixture is one async function: setup code, then \`await use(value)\` which hands the value to the test and waits for it to finish, then teardown code which runs even if the test failed.

**Differences from beforeEach:**

| | beforeEach | Fixture |
|---|---|---|
| Reuse | copy per file | import once |
| Runs | for every test in scope | only when requested (lazy) |
| Data to test | file-level \`let\` variable | typed argument |
| Teardown | separate afterEach | after \`await use()\` in the same function |
| Composition | none | fixtures depend on fixtures |

Example from my SauceDemo framework: \`loggedInPage\`, \`inventoryPage\` and \`cartPage\` are fixtures. A test written as \`async ({ cartPage }) => {}\` gets a logged-in user and a ready page object; tests that do not need login never pay for it.

**When I still use hooks:** tiny file-local steps every test in that file needs, like \`beforeEach(() => page.goto('/inventory.html'))\`, or an \`afterEach\` that attaches a screenshot for one flaky area. For once-per-run work like authentication I use a setup project rather than \`beforeAll\`, because \`beforeAll\` runs per worker and again after every worker restart.`,
      followUps: [
        {
          q: 'What happens if you forget to await use()?',
          a: 'use() returns a promise that resolves after the test finishes. Without await, the fixture function continues immediately, so the teardown code runs while the test is still using the value (for example deleting test data mid-test). The result is confusing, intermittent failures. Always write await use(value).',
        },
        {
          q: 'How do fixtures from two different files get combined?',
          a: 'Either chain extend calls (one fixtures file extends another), or use mergeTests(testA, testB) from @playwright/test to produce a single test object with both sets of fixtures. Tests import that merged test. This keeps, for example, page-object fixtures and API/data fixtures in separate files.',
        },
      ],
      pitfalls: [
        'Saying fixtures are "just test data" (that is the Jest/Cypress meaning of fixture files)',
        'Claiming fixtures always run for every test (only auto fixtures do)',
        'Using beforeAll for login and sharing one page across tests',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-02',
      difficulty: 'easy',
      question: 'In what order do beforeAll, beforeEach, afterEach and afterAll run when describes are nested? Show it on an example.',
      whatInterviewerLooksFor: [
        'Outer-to-inner for setup, inner-to-outer for teardown',
        'beforeAll/afterAll once per worker per scope',
        'Mentions worker restart after failure',
        'Clear worked example',
      ],
      modelAnswer: `Take a file with \`describe('outer')\` containing \`describe('inner')\` with two tests, and each describe has all four hooks.

Running with one worker, the log is:

1. outer beforeAll
2. inner beforeAll
3. outer beforeEach → inner beforeEach → **test 1** → inner afterEach → outer afterEach
4. outer beforeEach → inner beforeEach → **test 2** → inner afterEach → outer afterEach
5. inner afterAll
6. outer afterAll

So **setup goes outside-in** and **teardown goes inside-out**, like opening and closing nested boxes. Multiple hooks at the same level run in the order they were registered.

Two important caveats I always mention:
- **beforeAll is per worker, not per run.** If tests from this file run in two workers, each worker runs beforeAll.
- **A failure restarts the worker.** If test 1 fails, Playwright shuts that worker down (running afterAll hooks), and test 2 starts in a new worker, which runs both beforeAll hooks again. In fully parallel mode each test runs all hooks for itself.

That is why I avoid putting state that tests depend on into beforeAll.`,
      followUps: [
        {
          q: 'Where do fixtures fit into that order?',
          a: 'Auto worker fixtures are set up before beforeAll; auto test fixtures before beforeEach. Normal fixtures are set up lazily just before the hook or test that needs them, so a fixture used only by the test body is set up after beforeEach. Test-scoped fixtures are torn down after afterEach; worker-scoped fixtures after afterAll when the worker exits.',
        },
        {
          q: 'Does afterEach run when the test fails?',
          a: 'Yes. afterEach runs after every test regardless of the result, and Playwright keeps running other applicable hooks even if one hook fails. That is why afterEach is a common place to attach diagnostics, using testInfo.status versus testInfo.expectedStatus to detect a failure.',
        },
      ],
      pitfalls: [
        'Saying afterEach runs outer-first',
        'Saying beforeAll runs exactly once for the whole test run',
        'Not knowing that a failing test causes a new worker',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-03',
      difficulty: 'medium',
      question: 'Walk me through writing a custom fixture that creates test data through an API before a test and deletes it afterwards.',
      context: 'The interviewer wants you to write it live in TypeScript against Restful Booker.',
      whatInterviewerLooksFor: [
        'Correct test.extend syntax with types',
        'Setup → await use → teardown',
        'Uses the request fixture and checks the setup response',
        'Exports test/expect and imports them in specs',
      ],
      modelAnswer: `I would create \`fixtures/data.ts\`:

1. Import \`test as base\` and \`expect\` from \`@playwright/test\`.
2. Declare the type: \`type Fixtures = { booking: { id: number; lastname: string } }\`.
3. \`export const test = base.extend<Fixtures>({ booking: async ({ request }, use) => { ... } })\`.

Inside the fixture:
- **Setup:** \`POST /booking\` with a unique lastname (Faker or \`testInfo.testId\`), assert \`res.ok()\` so a broken setup fails loudly *in the fixture* rather than as a confusing failure later, read \`bookingid\`.
- **Hand over:** \`await use({ id, lastname })\`. The test runs at this point.
- **Teardown:** get a token with \`POST /auth\`, then \`DELETE /booking/{id}\` with header \`Cookie: token=...\`. Restful Booker returns 201 for a successful delete. This runs even if the test failed, which is the whole point: no leaked data.

Then \`export { expect }\` and in specs \`import { test, expect } from '../fixtures/data'\`; a test simply writes \`async ({ booking, request }) => {...}\`.

Design notes I would mention:
- The token could itself be a **worker-scoped fixture** so I authenticate once per worker, not once per test.
- If several fixtures are needed across files, I merge them with \`mergeTests\`.
- I keep assertions about the feature in the test; the fixture only asserts that setup succeeded.`,
      followUps: [
        {
          q: 'Why make the auth token worker-scoped?',
          a: 'The token does not change per test and fetching it costs a network round trip. A worker-scoped fixture fetches it once per worker process and shares it with every test that worker runs. It only depends on worker-level things (it creates its own request context via playwright.request.newContext), so the scope rule is respected.',
        },
        {
          q: 'What if teardown itself fails?',
          a: 'The test is reported as failed with the teardown error, which is correct because data leaked. I make teardown tolerant where it makes sense (ignore 404 if the test already deleted the booking) and log the id, and I run a nightly cleanup job for anything tagged with the test prefix as a safety net.',
        },
      ],
      pitfalls: [
        'Putting cleanup in afterAll with a shared array of ids (lost on worker crash)',
        'Forgetting to await use()',
        'Using the page fixture in a worker-scoped fixture',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-04',
      difficulty: 'hard',
      question: 'What is the difference between a test-scoped and a worker-scoped fixture? Give an example where choosing worker scope causes a bug.',
      whatInterviewerLooksFor: [
        'Lifetime: per test vs per worker process',
        'Worker fixtures cannot depend on test fixtures',
        'Understands shared mutable state risk',
        'Knows parallelIndex/workerIndex for per-worker resources',
      ],
      modelAnswer: `- A **test-scoped** fixture (default) is created for each test that uses it and torn down after that test. \`page\`, \`context\`, \`request\` are test-scoped.
- A **worker-scoped** fixture (\`[fn, { scope: 'worker' }]\`) is created once per worker process, shared by every test that worker runs, and torn down when the worker exits. \`browser\` is worker-scoped. It has its own timeout and may depend only on other worker fixtures.

**Good uses of worker scope:** an auth token, one test account per worker (keyed by \`parallelIndex\`), a database connection, a local mock server, a storageState file per worker.

**A bug caused by worker scope:** someone makes \`cartPage\` worker-scoped to "save time": it creates one page in the worker and reuses it. Test A adds a backpack; test B in the same worker expects an empty cart and sees "1". Run the file alone and it passes; run the suite and it fails depending on scheduling. Also, after any failure the worker restarts, the fixture is recreated, and the state changes again, so the failures look random.

Another one: a worker-scoped "user" that every test edits (changes the address). Tests in the same worker see each other's edits.

**Rule:** worker scope only for things that are read-only, or unique to that worker and reset by each test. Mutable things that tests change should be test-scoped.`,
      followUps: [
        {
          q: 'workerIndex or parallelIndex: which do you use to pick an account per worker?',
          a: 'parallelIndex. It ranges from 0 to workers-1 and the replacement worker after a crash keeps the same parallelIndex, so it maps cleanly onto a fixed pool of accounts (qa_user_0 … qa_user_3). workerIndex keeps increasing after each restart, so it would run past the end of the account pool.',
        },
        {
          q: 'Can a worker-scoped fixture use page?',
          a: 'No. page belongs to a single test and is destroyed after it, while the worker fixture lives longer. Playwright rejects the dependency. If a worker fixture needs a browser page, it creates one with browser.newPage() and closes it itself, as the official per-worker authentication example does.',
        },
      ],
      pitfalls: [
        'Thinking worker scope means shared across all workers',
        'Making mutable page objects worker-scoped for speed',
        'Using workerIndex to index an account pool',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-05',
      difficulty: 'medium',
      question: 'A developer suggests test.describe.serial for a checkout flow: test 1 logs in, test 2 adds to cart, test 3 checks out. What do you say?',
      whatInterviewerLooksFor: [
        'Knows serial-mode behaviour on failure and retry',
        'Explains why docs discourage it',
        'Proposes independent tests with fixtures/API setup',
        'Acknowledges rare valid uses',
      ],
      modelAnswer: `First, the mechanics: \`describe.serial\` is deprecated in favour of \`test.describe.configure({ mode: 'serial' })\`. In serial mode the tests run in order in one worker; if test 2 fails, test 3 is **skipped**, and with retries the **whole group** is retried from test 1.

My concerns:
- **Hidden coupling.** Test 3 does not test checkout; it tests "everything before checkout also worked". A login bug shows up as three red tests, or as one red and two skipped, which hides information.
- **No parallelism and no selective runs.** I cannot run just the checkout test with \`--grep\`, and the group cannot be split across workers.
- **Slow retries.** A flaky step in test 3 repeats tests 1 and 2.

What I would propose instead:
- One test, "user can check out a backpack", with \`test.step()\` for login / add to cart / checkout. The report still shows which step failed.
- Plus faster, independent tests for each part, where each arranges its own state: a \`loggedInPage\` fixture (or storageState), and cart contents set up directly (SauceDemo stores the cart in localStorage; a real app would use an API).

Serial mode is a last resort for flows that genuinely cannot be set up any other way and are too expensive to repeat.`,
      followUps: [
        {
          q: 'How many browser contexts does a serial group use?',
          a: 'Each test still gets its own page and context by default, so state does not even carry over unless you share a page created in beforeAll. That surprises people: serial mode guarantees order, not shared browser state. Teams that rely on serial usually also share a page via beforeAll, which brings the worker-restart problems with it.',
        },
        {
          q: 'How do you set retries just for one describe?',
          a: "Call test.describe.configure({ retries: 2 }) inside that describe. It also accepts mode and timeout. This overrides the project/config retries for that scope only.",
        },
      ],
      pitfalls: [
        'Thinking serial mode shares the page automatically',
        'Not knowing later tests are skipped after a failure',
        'Rejecting the idea without offering test.step or fixtures as an alternative',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-06',
      difficulty: 'easy',
      question: 'How do you run only smoke tests in CI, and what is the difference between test.skip, test.fixme and test.fail?',
      whatInterviewerLooksFor: [
        'Tag syntax and --grep/--grep-invert',
        'Clear semantics of skip, fixme, fail',
        'Knows test.fail errors when the test unexpectedly passes',
        'Mentions forbidOnly for test.only',
      ],
      modelAnswer: `**Tagging and selection**
- Tag tests with \`{ tag: '@smoke' }\` (or put \`@smoke\` in the title; tags can also go on a describe).
- CI smoke job: \`npx playwright test --grep @smoke\`. Full regression nightly: \`npx playwright test --grep-invert @quarantine\`.
- Alternatively define a "smoke" project with \`grep: /@smoke/\` in the config so the command is just \`--project=smoke\`.

**Annotations**
- \`test.skip()\` — the test is **not applicable** here (feature not on Safari, not on staging). Not run, shown as skipped. Usually conditional: \`test.skip(browserName === 'webkit', 'reason')\`.
- \`test.fixme()\` — the test is **broken and we plan to fix it** (or it crashes). Not run. It signals intent, unlike a plain skip.
- \`test.fail()\` — the test **runs and is expected to fail**, e.g. it reproduces known bug BUG-482. If it suddenly passes, Playwright reports an error, which tells us the bug is fixed and the annotation should be removed. Great for tracking product bugs without a red build.
- \`test.slow()\` — triples the timeout.

I also link each fixme/fail to a ticket with an \`annotation: { type: 'issue', description: 'BUG-482' }\` so the HTML report shows why, and set \`forbidOnly: !!process.env.CI\` so a forgotten \`test.only\` fails the CI run instead of silently skipping everything else.`,
      followUps: [
        {
          q: 'How do you select tests that have BOTH @smoke and @cart?',
          a: 'grep takes a regular expression matched against the title including tags, so use lookaheads: --grep "(?=.*@smoke)(?=.*@cart)". For OR, use "@smoke|@cart". On Windows PowerShell the pipe needs escaping, which is a common CI gotcha.',
        },
        {
          q: 'A test is flaky. Should you mark it fixme?',
          a: 'Only as a short, tracked quarantine with a ticket, not as a fix. I first look at the trace to find the cause (missing wait, shared data, environment). If I must quarantine, I tag it @quarantine, exclude it from the gating job, keep running it in a non-blocking job so we still see results, and set a deadline to fix it.',
        },
      ],
      pitfalls: [
        'Confusing test.fail with "skip on failure"',
        'Using skip for known bugs, so nobody notices when they are fixed',
        'Not knowing about --grep-invert or forbidOnly',
      ],
    },
    {
      id: 'pw-hooks-fixtures-iq-07',
      difficulty: 'expert',
      question:
        'After enabling fullyParallel, a file whose beforeAll creates a test user through the API starts failing with "user already exists" and runs much slower. Explain what changed and how you would redesign it.',
      whatInterviewerLooksFor: [
        'Knows each test runs beforeAll for itself in parallel mode',
        'Spots non-unique data across workers',
        'Proposes worker-scoped fixture or setup project',
        'Considers cleanup and worker restarts',
      ],
      modelAnswer: `**What changed:** in default mode, all tests of the file ran in one worker, so beforeAll ran once (plus once more after any failure). With \`fullyParallel\`, tests of the file are spread over workers and, per the docs, **each parallel test runs all relevant hooks for itself**, including beforeAll/afterAll. So beforeAll now runs once per test:
- It always creates the same username, so the second creation collides: "user already exists".
- N tests now pay the user-creation cost N times: slower.

**Redesign options:**
1. **Unique data per test** if each test needs its own user: a test-scoped fixture that creates \`user-\${testInfo.testId}\` (or Faker email), yields it, and deletes it in teardown.
2. **One user per worker** if tests can share a user but not across workers: a worker-scoped fixture keyed by \`test.info().parallelIndex\` that creates (or reuses) \`qa_user_\${parallelIndex}\` and cleans up when the worker exits.
3. **One user for the whole run** if tests only read: a **setup project** (project dependencies) creates the user once and saves state; tests depend on that project.

I would also make creation **idempotent** (if it exists, reuse or reset it) because a crashed worker may skip cleanup, and add a teardown project or nightly job to delete users with the test prefix.

**Lesson:** beforeAll is not "once per run". Scope your setup with fixtures or project dependencies, and make backend data unique.`,
      followUps: [
        {
          q: 'How would you keep this file in default mode while the rest of the suite is fully parallel?',
          a: "Add test.describe.configure({ mode: 'default' }) at the top of the file. It opts that file out of the global fullyParallel setting, so its tests run in order in one worker. That is a stopgap though; the real fix is unique data or proper fixture scope.",
        },
        {
          q: 'Why is a setup project better than globalSetup for creating that user once?',
          a: 'A setup project is a normal test: it appears in the HTML report, can record a trace, can use fixtures such as request, and respects config options. globalSetup is a plain function outside the runner, with no trace or fixtures. Project dependencies also support a teardown project for cleanup.',
        },
      ],
      pitfalls: [
        'Assuming beforeAll still runs once after enabling fullyParallel',
        'Fixing it by switching everything back to workers: 1',
        'Using the same hard-coded username in every worker',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-hooks-fixtures-drill-1',
      question:
        'A file has beforeAll (A), beforeEach (E), afterEach (X), afterAll (Z) and tests t1, t2. The config has fullyParallel: false, workers: 2, and a second file is running in the other worker. Then you switch to fullyParallel: true. Write the log order for this file in each case. Both tests pass.',
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
        'Default: **A, E, t1, X, E, t2, X, Z** in one worker. Fully parallel: **W0: A, E, t1, X, Z** and **W1: A, E, t2, X, Z**, running at the same time, so the combined console output interleaves unpredictably. beforeAll/afterAll ran twice.',
      insight:
        'beforeAll counts scale with how tests are distributed, not with how many files you have. Anything in beforeAll must be safe to run many times, at the same time, in different processes.',
      followUps: [
        {
          q: 'In default mode, t1 fails. What is the log now?',
          a: 'W0: A, E, t1 (fails), X, Z; then the worker is shut down. t2 runs in a new worker: A, E, t2, X, Z. So beforeAll and afterAll run twice even in default mode, because a failure always gets a fresh worker for the next test.',
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
        'Fixtures needed only by the test body are created after beforeEach; worker fixtures live until after afterAll even if only one test used them.',
      followUps: [
        {
          q: 'If no test used cartPage, would apiToken ever be set up?',
          a: 'No. Non-auto fixtures are lazy: a fixture runs only when a test, hook or another active fixture needs it. apiToken was pulled in only because cartPage depends on it. Unused fixtures cost nothing, which is why a big fixtures file is not a performance problem.',
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
        'Choose the scope deliberately: per test (fixture), per worker (worker fixture), or per run (setup project). beforeAll silently switches between these depending on mode and failures.',
      followUps: [
        {
          q: 'How would you get exactly one seed per run regardless of mode?',
          a: 'Put the seeding in a setup project (testMatch: /seed\\.setup\\.ts/) and add it to the dependencies of the test projects, with a teardown project to clean up. It runs once before the dependent projects and shows in the report with its own trace.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-hooks-fixtures-mcq-01',
      difficulty: 'easy',
      question: 'Your test needs to call a REST endpoint directly, without opening a browser page. Which built-in fixture should it request?',
      options: ['page', 'request', 'context', 'browser'],
      correct: [1],
      explanation:
        'request is an isolated APIRequestContext created for each test, made for HTTP calls. page and context are browser objects (page.request exists but shares the browser cookies). browser is the shared, worker-scoped browser instance and has no direct HTTP helpers.',
      followUps: [
        {
          q: 'Does the request fixture share cookies with page?',
          a: 'No. The request fixture is its own context. page.request (or context.request) shares the cookie jar with the browser context, which is useful when an API call must use the logged-in browser session.',
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
        'test.slow() marks the test as slow and triples the timeout, so 30 s becomes 90 s. It is not just a label, and it does not double or remove the limit. To remove the limit you would call test.setTimeout(0).',
      followUps: [
        {
          q: 'Can you call test.slow() in beforeAll?',
          a: 'No; the API reference says slow() cannot be used in beforeAll or afterAll. Use test.setTimeout() inside the hook to change that hook\'s timeout instead.',
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
        'Tags are matched with --grep (and excluded with --grep-invert). There is no --tag or --only CLI flag, and --project selects a project by name from the config, not a tag.',
      followUps: [
        {
          q: 'How would you run everything except @regression?',
          a: 'npx playwright test --grep-invert @regression. You can also combine: --grep @smoke --grep-invert @slow runs smoke tests that are not slow.',
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
        'File-level hooks apply to every test in the file, including nested describes. beforeEach hooks run outer to inner and afterEach hooks run inner to outer. Option A gets the teardown order backwards; option D is wrong because outer hooks still wrap tests in inner groups.',
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
      question: 'Testers report that the todo items sometimes vanish in the middle of tests using this fixture. Why?',
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
        'use() returns a promise that resolves only after the test finishes. Without await, execution continues straight into the teardown line, deleting items mid-test. Creating the object before use is correct, test fixtures may depend on page, and code after await use() is exactly where fixture teardown belongs.',
      followUps: [
        {
          q: 'Which lint rule catches this kind of bug?',
          a: '@typescript-eslint/no-floating-promises flags promises that are neither awaited nor handled. eslint-plugin-playwright also has rules for missing awaits on Playwright APIs. Both are worth enabling in a framework repo.',
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
        'Worker fixtures live per worker process, have a separate timeout (default = test timeout) and use [fn, { scope: "worker" }]. They cannot depend on page, which is test-scoped and destroyed after each test. Workers are separate processes, so each worker has its own copy; nothing is shared across workers.',
      followUps: [
        {
          q: 'Where do you put the type of a worker fixture in test.extend?',
          a: 'In the second generic parameter: base.extend<TestFixtures, WorkerFixtures>({...}). Test fixtures go in the first. Mixing them up gives type errors on the scope option.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-07',
      difficulty: 'medium',
      question:
        "A teammate marks a describe as mode: 'serial' so that test B can see the backpack that test A added to the cart. Both tests use the built-in page fixture. Does B see the backpack?",
      options: [
        'Yes: serial mode reuses one page for the whole group',
        'No: each test still gets a fresh page and context; serial only fixes order and skip-on-failure',
        'Yes, but only when workers is set to 1',
        'No, because serial mode clears localStorage after every test step',
      ],
      correct: [1],
      explanation:
        'Serial mode guarantees order (and skips later tests after a failure), but the page and context fixtures are still created fresh for each test. A new context means an empty cookie jar and localStorage, so the cart is empty. Workers do not change that, and nothing is cleared per step; the isolation comes from new contexts.',
      followUps: [
        {
          q: 'Why do the docs discourage serial mode?',
          a: 'Tests become dependent on each other, failures cascade into skips, retries repeat earlier tests, and the group cannot run in parallel or be filtered individually. Independent tests with fixtures or API setup are faster and give clearer failure signals.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-08',
      difficulty: 'medium',
      question: 'This passes with --workers=1 but fails randomly with fullyParallel: true and 4 workers. What is the root cause?',
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
        'Each worker is a separate process with its own copy of the module, so a test in another worker sees createdId as undefined, and fully parallel mode does not guarantee order. The request fixture is per test, not shared. Rate limiting would not explain why one worker always passes, and status() does not need the body parsed.',
      followUps: [
        {
          q: 'How do you fix it?',
          a: 'Make get booking create its own booking, ideally through a fixture that creates it, yields the id and deletes it in teardown. Each test then passes alone, in any order, in any worker.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-09',
      difficulty: 'medium',
      question:
        'A test reproduces a known product bug (BUG-482). You want CI to stay green now, but to be told automatically when developers fix the bug. Which annotation fits?',
      options: ['test.skip()', 'test.fixme()', 'test.fail()', 'test.slow()'],
      correct: [2],
      explanation:
        'test.fail() runs the test and expects it to fail; if it starts passing, Playwright reports an error, which is your signal that the bug is fixed. skip and fixme do not run the test, so nobody would notice the fix. slow only changes the timeout.',
      followUps: [
        {
          q: 'How would you link the test to BUG-482 in the report?',
          a: "Add an annotation in the test details: { annotation: { type: 'issue', description: 'BUG-482' } }. It appears in the HTML report next to the test.",
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-10',
      difficulty: 'hard',
      question:
        'A file has a beforeAll hook and 4 tests, runs with fullyParallel: true, workers: 2, and all tests pass. According to the docs, how many times does beforeAll run for this file?',
      options: ['1', '2 (once per worker)', '4 (each parallel test runs relevant hooks for itself)', '0, because beforeAll is disabled in parallel mode'],
      correct: [2],
      explanation:
        'The parallelism guide says parallel tests run in separate workers and each test executes all relevant hooks just for itself, including beforeAll and afterAll. So 4 tests means 4 runs. "Once per worker" is true in default mode where a worker processes the whole file; beforeAll is never disabled.',
      followUps: [
        {
          q: 'What would you use for once-per-worker setup in a fully parallel suite?',
          a: "A worker-scoped fixture ([fn, { scope: 'worker' }]). It is created once per worker, no matter how tests are distributed, and torn down when the worker exits.",
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
        'Auto fixtures need not be named, auto test fixtures are set up before beforeEach and the test, and they are the recommended way to add global per-test behaviour. The docs\' execution-order example notes that an auto WORKER fixture is set up for beforeAll, but an auto TEST fixture is not.',
      followUps: [
        {
          q: 'How do you make an auto fixture invisible in reports?',
          a: "Add box: true to its options ([fn, { auto: true, box: true }]). box: 'self' hides only the fixture step but keeps any steps inside it.",
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
        'beforeEach needs page, so page is set up first, then beforeEach runs. token and cart are needed only by the test body, so they are set up lazily after beforeEach: token first (cart depends on it), then cart. Neither cart nor token has auto: true, so neither jumps ahead.',
      followUps: [
        {
          q: 'When is token torn down?',
          a: 'At worker shutdown, after afterAll hooks, because it is worker-scoped. cart and page are torn down right after the second test (cart first, since it depends on page).',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-13',
      difficulty: 'expert',
      question:
        'Default mode, 1 worker, retries: 0. A file has beforeAll and 5 tests; test 2 fails, the others pass. How many times does beforeAll run, and how many afterAll?',
      options: ['beforeAll 1, afterAll 1', 'beforeAll 2, afterAll 2', 'beforeAll 5, afterAll 5', 'beforeAll 2, afterAll 1'],
      correct: [1],
      explanation:
        'After test 2 fails, the worker shuts down (running afterAll) and a new worker runs tests 3–5, which runs beforeAll again and afterAll at its end: 2 and 2. Option A ignores the worker restart, C describes fully parallel mode, and D forgets that afterAll runs in the old worker before it exits.',
      followUps: [
        {
          q: 'How can you see this happening?',
          a: 'Log testInfo.workerIndex in beforeAll. You will see index 0 for the first run and index 1 after the failure, while parallelIndex stays 0. The HTML report also shows the different worker for later tests.',
        },
      ],
    },
    {
      id: 'pw-hooks-fixtures-mcq-14',
      difficulty: 'expert',
      question:
        'Tests in 4 workers create Restful Booker bookings and later search for "their" booking by lastname. Select ALL choices that give a lastname unique to each test.',
      options: [
        'const lastname = `qa-${Date.now()}` at the top of the spec file',
        'test.info().testId combined with a prefix, inside the test',
        "faker.string.uuid() generated inside the test or a test-scoped fixture",
        'testInfo.parallelIndex on its own',
      ],
      correct: [1, 2],
      explanation:
        'testId is unique per test and a uuid generated per test is unique too. A module-level Date.now() is computed once per worker at import time, so every test in that worker shares it, and two workers could even get the same millisecond. parallelIndex identifies a worker slot, so all tests in that worker would share it.',
      followUps: [
        {
          q: 'When is parallelIndex the right key?',
          a: 'When you want one resource per worker, not per test: for example, one login account per worker from a fixed pool (qa_user_0..3), or one storageState file per worker. Each test still creates its own unique business data.',
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
        'Describe tags apply to every test inside, so T1 and T2 carry @smoke, and T3 has @smoke in its title. T2 also has @slow, so --grep-invert removes it. T4 has no @smoke. The answer is T1 and T3.',
      followUps: [
        {
          q: 'How would you make this the default for a CI smoke job without typing flags?',
          a: "Define a project with grep: /@smoke/ and grepInvert: /@slow/ in playwright.config.ts, then run --project=smoke. Projects support grep and grepInvert options.",
        },
      ],
    },
  ],
};

export default topic;
