import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-debug-flaky',
  phase: 'pw-framework',
  order: 4,
  title: 'Debugging, Reporting & Flaky Tests',
  subtitle: 'Debug tools first: Inspector, UI mode, trace viewer, screenshots, videos and reports. Then the real work: find why a test is flaky, fix it for good, and prove the fix.',
  estimatedMinutes: 90,
  sources: [
    'Playwright docs — Debugging Tests (playwright.dev/docs/debug)',
    'Playwright docs — Trace viewer (playwright.dev/docs/trace-viewer)',
    'Playwright docs — UI Mode (playwright.dev/docs/test-ui-mode)',
    'Playwright docs — Screenshots, Videos (playwright.dev/docs/screenshots, /videos)',
    'Playwright docs — Reporters (playwright.dev/docs/test-reporters)',
    'Playwright docs — Retries (playwright.dev/docs/test-retries)',
    'Playwright docs — Command line (playwright.dev/docs/test-cli)',
    'Playwright docs — Parallelism (playwright.dev/docs/test-parallel)',
    'Playwright docs — Network: waiting for responses (playwright.dev/docs/network)',
    'BrowserStack guide — Playwright flaky tests',
    'TestDino / Endform blogs — Playwright flaky tests: causes and fixes (2025–2026)',
    'Debbie O\'Brien / Playwright team — Trace viewer and UI mode videos',
  ],
  tags: [
    'debugging',
    'inspector',
    'ui-mode',
    'trace-viewer',
    'reporters',
    'flaky-tests',
    'retries',
    'repeat-each',
    'isolation',
  ],
  cheatSheet: [
    'Debug one test: `npx playwright test login.spec.ts:12 --debug` → visible browser, Inspector open, timeout 0, 1 worker. Add `await page.pause()` to stop at one exact line.',
    '`npx playwright test --ui` = UI mode: re-runs on save, a timeline you can go back through, pick locator, filters by status/project/tag. Best for writing and fixing tests on your laptop.',
    'Trace viewer: `trace: \'on-first-retry\'` (cheap, the CI default) or `\'retain-on-failure\'` (works without retries). Open with `npx playwright show-trace trace.zip` or trace.playwright.dev.',
    'Read a trace in this order: Errors → Actions (before/action/after pictures) → Log (what the action waited for) → Network → Console → Source.',
    'Evidence files: `screenshot: \'only-on-failure\'`, `video: \'retain-on-failure\'` (or `\'on-first-retry\'`). All go to `test-results/`; the HTML report goes to `playwright-report/`.',
    'Reporters: `list` (laptop default), `dot` (CI default), `line`, `html`, `json`, `junit` (Jenkins/Azure), `blob` (shards → merge-reports), `github` (notes on the PR), `allure-playwright` (3rd party).',
    'Results: passed (first try), **flaky** (failed, then passed on a retry), failed (failed every try). `--fail-on-flaky-tests` makes flaky tests turn the build red.',
    'On a failure, Playwright throws away the whole worker and its browser. The retry runs in a fresh worker, so `beforeAll` runs again. `testInfo.retry` tells you which try this is.',
    'Serial mode (`test.describe.configure({ mode: \'serial\' })`): one failure skips the rest, and a retry runs the whole group again. Prefer independent tests.',
    'Top flaky causes: fixed sleeps, check-then-act with `isVisible()`, waiting for a response after triggering it, shared data, test order, animations, an unstable test environment.',
    'Prove a fix: `--repeat-each=50 --workers=4` (add `--retries=0`), run in CI-like conditions, then watch the flaky rate in reports for a week.',
    'Retries are a seatbelt, not a fix: `retries: 2` on CI, never on your laptop, and track every test that comes back "flaky".',
  ],
  sections: [
    {
      heading: 'The debugging toolbox at a glance',
      body: `**Example:** \`npx playwright test --ui\` → a window opens with your tests. You run one and watch each step on the page.

First ask one question: *can I make the failure happen again on my laptop right now?*

- **Yes** → use a live tool. You watch the test run and stop it where you want.
- **No** (it failed only on CI) → use the recorded evidence from that run. The best one is the **trace**: a recording of the test that you can replay step by step.

Playwright has a tool for each case:
- **UI mode** — for writing a test and quick re-runs. Start: \`npx playwright test --ui\`.
- **Inspector** — to go through a failing test one line at a time. Start: \`npx playwright test cart.spec.ts:18 --debug\`.
- **\`page.pause()\`** — to stop at one exact line. Add \`await page.pause()\` and run with \`--debug\`.
- **VS Code extension** — for breakpoints in your editor. Right-click the green triangle → Debug Test.
- **Trace viewer** — for a CI failure you cannot repeat. Start: \`npx playwright show-trace trace.zip\`.
- **Screenshot / video** — for a picture to put in a bug report. Switch them on in \`use\`.
- **API logs** — for very low-level detail. Start: \`DEBUG=pw:api npx playwright test\`.

**Watch out:** do not add sleeps until the test passes. That hides the problem.

**In an interview, say:** "For failures on my laptop I use UI mode or the Inspector. For CI failures I read the trace from the first retry, plus screenshots and video kept only on failure. So I can debug without running it again."

**Why testers care:** Picking the right tool first saves hours of guessing.`,
      keyPoints: [
        'Can repeat it on your laptop → live tools (UI mode, Inspector, VS Code).',
        'Only on CI, or only sometimes → recorded evidence (trace first, then video/screenshot).',
        'Never "fix" a flaky test by adding sleeps until it passes.',
      ],
      source: 'Playwright docs — Debugging Tests',
    },
    {
      heading: 'Inspector, --debug and page.pause()',
      body: `**Example:** \`npx playwright test login.spec.ts:12 --debug\` → the browser opens and the test stops before the first step. Press "Step over" to run one line at a time.

\`--debug\` does four things at once:
- It shows the browser window (**headed** mode). Normally tests run **headless**, which means with no visible window.
- It opens the **Playwright Inspector**, a small window that controls the test.
- It sets the test **timeout to 0**, so the test is not stopped while you think.
- It runs **one worker** and stops after the first failure (\`--max-failures=1\`).

Behind the scenes it sets \`PWDEBUG=1\`.

In the Inspector you can:
- **Step over** each Playwright call. The element it acts on is highlighted.
- Read the **log** for the current action. For example: "waiting for element to be visible, enabled and stable". It tells you *why* a click is stuck.
- Use **Pick locator**. Click an element on the page and get a good locator, like \`getByRole\` or \`getByTestId\`. You can also edit a locator and see what it matches.
- Press **Resume** to run until the next \`page.pause()\` or the end.

Give the file and the **line number**, so only that one test runs. Pick one project, so only one browser opens.

**Watch out:** do not commit \`page.pause()\`. In a headed run it waits for someone to press Resume. Add a lint rule or a pre-commit check for it. Also set \`forbidOnly: !!process.env.CI\` to catch a forgotten \`.only\`.

**Why testers care:** You see exactly which step fails and why, instead of guessing from an error message.`,
      code: [
        {
          language: 'bash',
          title: 'Debug commands you will actually use',
          code: `# every test, headed + Inspector (rarely what you want)
npx playwright test --debug

# one test by line number, one browser
npx playwright test tests/cart.spec.ts:18 --project=chromium --debug

# Playwright API logs in the terminal (macOS/Linux)
DEBUG=pw:api npx playwright test tests/cart.spec.ts

# browser DevTools with the playwright.$ / playwright.locator helpers
# (needs an await page.pause() in the test)
PWDEBUG=console npx playwright test tests/cart.spec.ts`,
        },
        {
          language: 'typescript',
          title: 'Pause exactly where things go wrong',
          code: `import { test, expect } from '@playwright/test';

test('adds backpack to cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Inspector stops here: try locators live in the "Pick locator" box
  await page.pause();

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
});`,
        },
      ],
      keyPoints: [
        '--debug = visible browser + Inspector + timeout 0 + 1 worker + stop at the first failure.',
        'Use file:line to run just one test.',
        'The action log in the Inspector says why an action is waiting.',
      ],
      source: 'Playwright docs — Debugging Tests; Command line',
    },
    {
      heading: 'UI mode and VS Code debugging',
      body: `**Example:** in UI mode, click the eye icon next to a test → it runs again on every save.

**UI mode** (\`npx playwright test --ui\`) is the best place to write and fix tests. It gives you:
- **Watch mode** — the test re-runs on every save.
- A **timeline** for every run. Hover an action to see the page *at that moment*, with Before and After pictures.
- **Pick locator**, plus Console, Network, Errors and Source tabs.
- **Filters** by text, \`@tag\`, status (passed, failed, skipped) and project.

**VS Code extension** (Playwright Test for VS Code):
- Click next to a line number to set a **breakpoint**. A breakpoint is a place where the code stops. Then right-click the run icon → **Debug Test**. Now you can check values, like \`await locator.count()\`, in the Debug Console.
- **Show browser** keeps the browser open. It highlights a locator when your cursor is on it in the code.
- **Pick locator** and **Record new** (codegen, which writes code as you click) are in the Testing sidebar.

Which one to use?
- Quick edit and re-run → UI mode.
- Check your own variables (data, loops, page-object code) → VS Code debugger.
- Go back through the page step by step → UI mode.
- Step one action at a time → Inspector or VS Code.

**In an interview, say:** "UI mode is my daily tool. I switch to the VS Code debugger when the bug is in my test code, not in the page."

**Why testers care:** A fast edit-and-run loop means you write stable tests sooner.`,
      keyPoints: [
        'UI mode = watch mode + timeline + pick locator.',
        'The VS Code debugger is for bugs in your own test code, not in the page.',
        'Both are laptop tools; CI needs recorded evidence files.',
      ],
      source: 'Playwright docs — UI Mode; Debugging Tests (VS Code extension)',
    },
    {
      heading: 'Trace viewer: replaying a failed run step by step',
      body: `**Example:** \`npx playwright show-trace trace.zip\` → a window opens. You click each step and see the page before and after it.

A **trace** is like a plane's black box. It records every action, a picture of the page before and after it, the network calls, the console and your code line. All of it is in one zip file that you can replay anywhere.

**Switch it on** with \`trace\` in \`use\` (or \`--trace\` on the command line):
- \`'off'\` — records nothing.
- \`'on'\` — records every test. Heavy; use it only for deep checks on your laptop.
- \`'on-first-retry'\` — records only the first retry of a failed test. This is the **CI default** in a new config. It needs \`retries\` above 0.
- \`'on-all-retries'\` — records every retry. Good for chasing a rare failure.
- \`'retain-on-failure'\` — records every test, but keeps the file only if it failed. Use it without retries, or when you want the *first* failure.

**Open it** with \`npx playwright show-trace path/to/trace.zip\`. Or open it from the HTML report (\`npx playwright show-report\` → failed test → Traces). Or drag the zip into **trace.playwright.dev**. The file is opened in your browser; nothing is uploaded.

**Read it in this order:**
1. **Errors** tab and the red mark on the timeline — which step failed, and the message.
2. **Actions** list — how long each step took. A step that took 29.9 s was waiting, not slow.
3. **Pictures** — *Before*, *Action* (shows the exact click point) and *After*. Was a spinner covering the button? Was the old text still there?
4. **Log** — what the action waited for. For example, "element is not stable" or "another element would receive the click".
5. **Network** — did the API return 500? Did it start *after* the assertion?
6. **Console** and **Source** — errors on the page, and the exact line in your test.
7. **Metadata** — browser, viewport and duration. Maybe CI uses a different screen size.

**Why testers care:** You can debug a CI failure from one file, without running the test again.`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts: evidence for CI, quiet locally',
          code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'https://www.saucedemo.com',
    // CI: trace of the first retry; locally: keep a trace if anything fails
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});`,
        },
      ],
      diagram: `  Trace viewer layout
  +--------------------------------------------------------------+
  | Timeline: [goto]---[fill]-[fill]-[click]-------[expect XXX]  |
  +-------------------+------------------------------------------+
  | Actions           |  Snapshot:  Before | Action | After      |
  |  goto      310ms  |                                          |
  |  fill       45ms  |   (DOM you can inspect, click point dot) |
  |  click      60ms  |                                          |
  |  expect   5.0s X  |                                          |
  +-------------------+------------------------------------------+
  | Call | Log | Errors | Console | Network | Source | Metadata  |
  +--------------------------------------------------------------+`,
      keyPoints: [
        'on-first-retry is cheap, because passing tests record nothing.',
        'retain-on-failure needs no retries, but records every test (slower).',
        'A long step time means waiting; the Log tab says what it waited for.',
      ],
      source: 'Playwright docs — Trace viewer',
    },
    {
      heading: 'Screenshots, videos and the HTML report',
      body: `**Example:** \`use: { screenshot: 'only-on-failure' }\` → when a test fails, Playwright saves a picture of the page at that moment.

A screenshot is a photo. A video is a recording of the whole test. A trace is the full black box. Collect cheap evidence always. Collect costly evidence only on failure.

- **\`screenshot\`** — \`'off'\`, \`'on'\` or \`'only-on-failure'\`. Low cost.
- **\`video\`** — \`'off'\`, \`'on'\`, \`'retain-on-failure'\` or \`'on-first-retry'\`. Medium cost; recording slows the run.
- **\`trace\`** — see the trace section. Medium to high cost.

All of these go into \`test-results/<test>/\`. The trace file is \`trace.zip\`.

A video is saved only when the page or context **closes**. So \`page.video().path()\` works only after that. The default video size is the viewport, scaled down to fit 800×800. To change it, use \`video: { mode: 'on', size: { width: 640, height: 480 } }\`.

**Your own screenshots** are good evidence for a bug report. Use \`page.screenshot({ path, fullPage: true })\` or \`locator.screenshot()\`. Add them to the report with \`testInfo.attach\`, so they show next to the test.

**HTML report** (\`reporter: 'html'\`, folder \`playwright-report/\`):
- It groups tests by file.
- It filters by passed, failed, **flaky** and skipped.
- It shows the steps, errors with the code line, and attached files (screenshots, video, trace link).
- Open it with \`npx playwright show-report\`.
- The \`open\` option is \`'always'\`, \`'never'\` or \`'on-failure'\` (default). On CI use \`'never'\`, so the job does not try to open a browser.

**Why testers care:** A failure screenshot or video gives clear proof for a bug report.`,
      code: [
        {
          language: 'typescript',
          title: 'Attach your own evidence to the report',
          code: `import { test, expect } from '@playwright/test';

test('checkout total is correct', async ({ page }, testInfo) => {
  await page.goto('https://www.saucedemo.com');
  // ... login and add items (omitted)

  await test.step('capture the overview page', async () => {
    // full-page screenshot, attached so it appears in the HTML report
    await testInfo.attach('checkout-overview', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  await expect(page.locator('[data-test="total-label"]')).toContainText('Total');
});`,
        },
      ],
      keyPoints: [
        'Use only-on-failure / retain-on-failure by default: evidence without the cost.',
        'Per-test files live in test-results/; the report lives in playwright-report/.',
        'testInfo.attach puts your own files into the report.',
      ],
      source: 'Playwright docs — Screenshots; Videos; Reporters (HTML)',
    },
    {
      heading: 'Reporters: who reads the results?',
      body: `**Example:** \`reporter: [['list'], ['junit', { outputFile: 'results.xml' }]]\` → you see results in the terminal, and Jenkins gets an XML file.

A **reporter** decides the format of the test results. Pick it by who reads them.

- **\`list\`** — one line per test. The **default on your laptop**.
- **\`line\`** — one line that updates, with failures shown in place. Good for big suites.
- **\`dot\`** — one character per test. The **default on CI**.
- **\`html\`** — a \`playwright-report/\` folder. For people after a CI run (upload it as a CI file).
- **\`json\`** — one JSON file. For dashboards and your own scripts.
- **\`junit\`** — an XML file. Jenkins, Azure DevOps and GitLab read it to show a tests tab.
- **\`blob\`** — a raw zip per shard. **Sharding** means splitting the suite across machines. Later, \`merge-reports\` joins the blobs into one report.
- **\`github\`** — shows failures as notes on the pull request in GitHub Actions.
- **\`allure-playwright\`** — a third-party reporter with history and trend charts.

You can use **several reporters at once** (an array). Add a reporter only on CI with \`process.env.CI\`.

**In an interview, say:** "I use junit because the CI server reads it to show test results and trends. I use blob when sharding, because the shard reports must be merged into one HTML report."

**Why testers care:** The right reporter puts results where your team already looks.`,
      code: [
        {
          language: 'typescript',
          title: 'Different reporters for local and CI',
          code: `import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: process.env.CI
    ? [
        ['dot'],                                      // short CI log
        ['html', { open: 'never' }],                  // uploaded as an artifact
        ['junit', { outputFile: 'results/junit.xml' }], // for the CI test tab
        ['github'],                                   // PR annotations
      ]
    : [['list'], ['html', { open: 'on-failure' }]],
});`,
        },
      ],
      keyPoints: [
        'list on your laptop and dot on CI are the defaults.',
        'junit for CI servers, blob for shards, github for notes on the PR.',
        'Several reporters can run together.',
      ],
      source: 'Playwright docs — Reporters',
    },
    {
      heading: 'What makes a test flaky',
      body: `**Example:** \`await page.waitForTimeout(3000)\` before a click → on a fast day the page is ready and the test passes. On a slow day it is not, and the test fails.

A **flaky test** is a test that sometimes passes and sometimes fails without any code change. Playwright marks a test **flaky** when it fails first and then passes on a retry.

Most flaky tests are a **race**. The test and the app run at their own speed. Sometimes the test acts before the app is ready.

Common causes, what they look like, and the fix:
- **Fixed sleeps** — \`waitForTimeout(3000)\`. Fix: wait for the real sign with a web-first assertion, like \`toBeVisible\`, \`toHaveText\` or \`toHaveURL\`. A **web-first assertion** is an \`expect\` that keeps checking the page until it passes or times out.
- **Check, then act** — \`if (await btn.isVisible())\` or \`expect(await el.textContent()).toBe(...)\`. These check only once. Fix: \`await expect(el).toHaveText(...)\`, which keeps checking.
- **Waiting for a response too late** — \`await click(); await page.waitForResponse(...)\`. The response may already be gone. Fix: start \`waitForResponse\` **before** the click, then await it.
- **Shared data** — two tests change the same user's cart. Fix: unique data per test, set up and cleaned up through the API.
- **Test order** — test B needs the booking that test A made. Fix: each test creates what it needs, for example with fixtures.
- **Fragile locators** — \`.nth(3)\`, long CSS or XPath, generated class names. Fix: role, label or test-id locators, filtered by text.
- **Animations** — the click lands while something still moves. Fix: check the final state. Playwright already waits for an element to be *stable* (not moving). Turn off animations in the test build if you can.
- **Environment** — a slow shared staging server, third-party widgets, time zones, screen size. Fix: fake third-party calls, and set \`timezoneId\`, \`locale\` and viewport in the config.
- **Too few CPUs** — many workers on a 2-CPU CI machine. Fix: fewer workers, or split the suite across machines.

**Watch out:** not every random failure is a test problem. Sometimes the app has a real race bug, like a double submit. If the trace shows the **app** doing something wrong, file a bug. Do not "fix" the test.

**Why testers care:** Flaky tests make the team stop trusting the suite, so real bugs get ignored.`,
      diagram: `  Race: the classic flaky timeline
  time ----------------------------------------------------->
  test : click "Search" -> read results   (reads too early)
  app  : click handled -> fetch /api/search ...... render
                                  ^ fast machine: render before read  -> PASS
                                  ^ slow CI:      render after read   -> FAIL`,
      keyPoints: [
        'Flaky = the result changes although the code did not.',
        'Most flaky tests are about timing; the rest is shared data and environment.',
        'Sometimes the flake is a real app bug: check the trace before "fixing" the test.',
      ],
      source: 'Playwright docs — Retries; Auto-waiting; BrowserStack & TestDino flaky-test guides',
    },
    {
      heading: 'Fixing flaky tests: patterns that work',
      body: `**Example:** replace \`await page.waitForTimeout(3000)\` with \`await expect(page.getByText('Order placed')).toBeVisible()\` → the test waits exactly as long as needed, up to 5 s.

The main idea: do not tell the test *how long* to wait. Tell it *what to wait for*.

Five patterns fix most flaky tests:

1. **Check the result, not the clock.** Replace sleeps with web-first assertions. They keep checking until the condition is true. The default \`expect\` limit is 5 s.
2. **Start listening before you act.** For steps that need a network answer: first create the \`waitForResponse\` promise. Then click. Then await the promise.
3. **Own your data.** Each test creates its own user, booking or cart through the API or a fixture. Give it a unique value, like \`Date.now()\` or \`testInfo.workerIndex\`. Clean it up at the end.
4. **Keep tests separate.** Do not share variables between tests. Each test gets a fresh context; Playwright does this by default. Avoid \`serial\` mode unless a flow really cannot be split.
5. **Control the environment.** Fake unstable third-party services with \`page.route\`. Fix \`timezoneId\`, \`locale\` and viewport. Turn off CSS animations in the test build if you can.

For values that are not on the page, use \`expect.poll\` or \`expect(...).toPass()\`. For example, an API value that changes after a while.

**Why testers care:** These fixes remove the cause, so the test stays green for good.`,
      code: [
        {
          language: 'typescript',
          title: 'Before: three races in five lines',
          code: `import { test, expect } from '@playwright/test';

test('dynamic loading (flaky)', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/2');
  await page.locator('#start button').click();
  await page.waitForTimeout(3000);                    // guess: sometimes too short
  const shown = await page.locator('#finish').isVisible(); // snapshot, no retry
  expect(shown).toBe(true);
  expect(await page.locator('#finish').textContent()).toBe('Hello World!');
});`,
        },
        {
          language: 'typescript',
          title: 'After: deterministic, and faster when the app is fast',
          code: `import { test, expect } from '@playwright/test';

test('dynamic loading (stable)', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/2');
  await page.getByRole('button', { name: 'Start' }).click();

  // retries until the text appears (or the expect timeout expires)
  const finish = page.locator('#finish');
  await expect(finish).toBeVisible();
  await expect(finish).toHaveText('Hello World!');
});

test('search waits for the right response', async ({ page }) => {
  await page.goto('/search');
  const resp = page.waitForResponse((r) => r.url().includes('/api/search') && r.ok());
  await page.getByRole('button', { name: 'Search' }).click(); // trigger after registering
  await resp;
  await expect(page.getByRole('listitem')).not.toHaveCount(0);
});`,
        },
      ],
      keyPoints: [
        'Web-first assertions wait for a condition; sleeps wait for a guess.',
        'waitForResponse promise first, then the action, then await.',
        'Unique data + separate tests remove order problems.',
      ],
      source: 'Playwright docs — Assertions; Network (waiting for responses)',
    },
    {
      heading: 'Retries and flaky tests',
      body: `**Example:** \`retries: process.env.CI ? 2 : 0\` → on CI, a failed test runs up to 2 more times. On your laptop it runs only once.

A **retry** means running a failed test again. Retries are like an airbag. They save the build from one bad run. But if the airbag fires every day, you must fix the brakes.

**How to turn on retries** (they are off by default):
- In the config: \`retries: process.env.CI ? 2 : 0\`. A new config already has this.
- On the command line: \`npx playwright test --retries=2\`.
- For one group: \`test.describe.configure({ retries: 1 })\`.

**What happens on a retry.** A worker is a separate process with its own browser. When a test fails, Playwright **throws away the whole worker and its browser**. It starts a new worker. There, \`beforeAll\` hooks run again, the failed test runs again, and then the other tests continue. So anything you kept in a shared variable is gone.

**The three results:**
- **passed** — passed on the first run.
- **flaky** — failed first, then passed on a retry.
- **failed** — failed the first run and every retry.

A flaky test keeps the build **green**, unless you add \`--fail-on-flaky-tests\`. The HTML report has a "Flaky" filter. Treat it as your to-do list.

**\`testInfo.retry\`** is 0 on the first try, 1 on the first retry, and so on. Use it to clean server data before a retry, or to log more detail.

**Watch out: serial mode.** In \`test.describe.configure({ mode: 'serial' })\`, one failure **skips the tests after it**. On retry, **the whole group runs again**, even the tests that passed. That is why the docs advise independent tests.

**Why testers care:** Retries keep CI moving, and the "flaky" label shows you which tests need fixing.`,
      code: [
        {
          language: 'typescript',
          title: 'Retry-aware cleanup with testInfo.retry',
          code: `import { test, expect } from '@playwright/test';

test.describe.configure({ retries: 1 }); // this file only

test('creates a booking', async ({ page, request }, testInfo) => {
  const name = \`Asha-\${testInfo.workerIndex}-\${Date.now()}\`; // unique per attempt

  if (testInfo.retry > 0) {
    // a previous attempt may have left data behind: log it for triage
    console.log(\`retry #\${testInfo.retry} for \${testInfo.title}\`);
  }

  const res = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: {
      firstname: name, lastname: 'Rao', totalprice: 150, depositpaid: true,
      bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' },
    },
  });
  await expect(res).toBeOK();
});`,
        },
      ],
      keyPoints: [
        'Failure → worker and browser thrown away → new worker runs beforeAll again → retry.',
        'flaky = failed, then passed; the build stays green unless --fail-on-flaky-tests.',
        'Serial groups retry as a whole; independent tests retry alone.',
      ],
      source: 'Playwright docs — Retries; Command line (--fail-on-flaky-tests)',
    },
    {
      heading: 'Proving a fix: --repeat-each, isolation and quarantine',
      body: `**Example:** \`npx playwright test checkout.spec.ts --repeat-each=50 --retries=0\` → every test in the file runs 50 times, and no retry hides a failure.

One passing run proves nothing. Say a test fails 1 time in 50. Then a single run passes 98% of the time.

**Run it many times on purpose:**
- \`--repeat-each=50 --retries=0\` runs each test 50 times with no retries.
- Add \`--workers=4\` or more. This makes the CPU busy, like on CI. Add \`--project=webkit\` if the problem is in one browser.
- \`-x\` (same as \`--max-failures=1\`) stops at the first failure. It saves time once you know the test is still broken.
- \`npx playwright test --last-failed\` runs only the tests that failed last time.

**Find the kind of problem:** run the test **alone** (\`file:line\`). Then run it **with its file**. Then run it **in the whole suite**.
- Passes alone, fails in the suite → shared data or test order.
- Fails alone → timing or environment.

**Quarantine, do not delete.** Quarantine means you take a test out of the main run for a while. Use it when a fix will take days. Tag the test with \`{ tag: '@quarantine' }\`. Leave it out of the pull-request check with \`--grep-invert @quarantine\`. A nightly job still runs it. Give every quarantined test an owner and a ticket. Otherwise it is forgotten. \`test.fixme()\` skips a test and shows the reason.

**Why testers care:** You can show with numbers that the fix works, not just hope it does.`,
      code: [
        {
          language: 'bash',
          title: 'A flaky-fix verification session',
          code: `# 1. reproduce: hammer the suspect test without retries
npx playwright test tests/checkout.spec.ts:27 --repeat-each=100 --retries=0 --workers=4

# 2. same, but in the context of its whole file (order/shared-state check)
npx playwright test tests/checkout.spec.ts --repeat-each=20 --retries=0

# 3. after fixing: stop at the first failure to fail fast
npx playwright test tests/checkout.spec.ts --repeat-each=100 --retries=0 -x

# 4. PR gate excludes quarantined tests; nightly runs everything
npx playwright test --grep-invert @quarantine`,
        },
      ],
      keyPoints: [
        'Always use --retries=0 while proving a fix.',
        'Alone vs file vs suite tells you timing vs shared data.',
        'Quarantine with an owner and a ticket; never skip a test silently.',
      ],
      source: 'Playwright docs — Command line; Annotations (tags, fixme)',
    },
    {
      heading: 'A triage playbook: passes locally, fails in CI',
      body: `**Example:** \`CI=1 npx playwright test cart.spec.ts:18 --repeat-each=30 --workers=4\` → you run the test on your laptop under conditions close to CI.

If a test fails only on CI, something about CI is different. Your job is to find *which* difference matters. Use evidence, not guesses. **Triage** means sorting the failure: what kind of problem is it, and who should fix it?

Differences that usually matter:
- **Slower or fewer CPUs** — timeouts, or actions before the page has drawn. Check step times in the trace. Use fewer workers.
- **Headless vs headed** — headless means no visible window. Hover, focus or fonts can behave differently. Run headless on your laptop too.
- **Screen size, language, time zone** — an element is off-screen, or a date check is wrong. Check the trace Metadata. Set these in the config.
- **A clean environment** — no seed data, no saved login. Does the test create its own data?
- **Parallel workers** — tests clash on the same account. Use unique data per worker.
- **Network or website address** — a third-party script is blocked, or staging is down. Check the trace Network tab.
- **Browser version** — fails only in WebKit. Use the same Playwright version or Docker image.

**Steps:**
1. Download the **HTML report** from the CI run. Open the failed test and its **trace**.
2. Read Errors → Actions → pictures → Log → Network (see the trace section).
3. Run it on your laptop in CI-like conditions with the command from the example. It runs headless.
4. Decide what it is. A test bug: fix the wait or the data. An environment problem: fix the config or machines. A **product bug**: file it with the trace attached.
5. Fix it, prove it with \`--repeat-each\`, and watch the flaky count go down.

**In an interview, say:** "I don't just re-run until it is green. I open the trace from the failed CI run. I find out if it is timing, data or environment. I repeat it under CI conditions. Then I fix the cause and check with repeat-each."

**Why testers care:** A clear routine turns "works on my machine" into a known cause and a real fix.`,
      keyPoints: [
        'Fails only on CI = find what is different on CI.',
        'The trace from the failed run is your main evidence.',
        'Decide what it is before fixing: test bug, environment problem or product bug.',
      ],
      source: 'Playwright docs — Trace viewer; Continuous Integration; Parallelism',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-debug-flaky-cc-1',
      title: 'Make the fruit list test reliable',
      context: 'This test runs against the Playwright API-mocking demo. It fails about 1 run in 8 on CI, and almost never on a laptop. The trace of a failed run shows `waitForResponse` timing out after 30 s. Yet the Network tab shows the fruits request finished at 0.4 s.',
      task: 'Find every reason the result can change from run to run (there are at least four). Rewrite the test so it passes or fails only because of what the app does, never because of timing.',
      starter: {
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test';

test('shows the fruit list', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/api-mocking');

  // make sure the API call finished
  const response = await page.waitForResponse('**/api/v1/fruits');
  expect(response.status()).toBe(200);

  await page.waitForTimeout(2000); // let the list render

  const items = page.locator('li');
  if (await items.first().isVisible()) {
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  }

  // third item should be a fruit name
  const third = await items.nth(2).textContent();
  expect(third?.length).toBeGreaterThan(0);
});`,
      },
      hints: [
        'When is the fruits request sent, compared with `page.goto`? Can it finish before `waitForResponse` starts listening?',
        'What happens in the `if (isVisible())` branch when the list is still empty? Does the test fail, or pass without checking anything?',
        '`toHaveCount`, `toHaveText` and `not.toHaveCount(0)` keep checking. `count()` and `textContent()` check only once.',
      ],
      solution: {
        language: 'typescript',
        code: `import { test, expect } from '@playwright/test';

test('shows the fruit list', async ({ page }) => {
  // 1. register the wait BEFORE the action that triggers the request
  const fruitsResponse = page.waitForResponse(
    (r) => r.url().includes('/api/v1/fruits') && r.request().method() === 'GET',
  );
  await page.goto('https://demo.playwright.dev/api-mocking');

  // 2. assert the response with a web-first API assertion
  await expect(await fruitsResponse).toBeOK();

  // 3. assert the UI outcome; these retry until the list renders
  const items = page.getByRole('listitem');
  await expect(items).not.toHaveCount(0);
  await expect(items.nth(2)).toHaveText(/\\w+/); // retries; no snapshot read

  // 4. even better: assert a known value instead of "something"
  await expect(page.getByText('Strawberry')).toBeVisible();
});`,
      },
      explanation: `**One fix for each problem:**
- **Race on \`waitForResponse\`.** The request is sent during \`goto\`. On a fast run it finished before the listener existed, so the wait hung for 30 s. Now the promise is created first and awaited after \`goto\`. The race is gone.
- **\`waitForTimeout(2000)\` removed.** The test now waits for the real sign: the list items. It is faster, and safe on slow machines.
- **\`if (isVisible())\` removed.** With an empty list, that branch made the test *pass without checking anything*. That is a false pass. \`not.toHaveCount(0)\` fails clearly instead.
- **\`textContent()\` replaced** with \`toHaveText\`, which keeps checking.
- **Plain \`li\`** replaced with \`getByRole('listitem')\`. The last check looks for a known fruit, so the test checks real behaviour, not just "something showed up".
- \`expect(response).toBeOK()\` checks for a 2xx status, with a clear error message.`,
      followUps: [
        {
          q: 'Why did this fail mostly on CI and not on the laptop?',
          a: 'It depends on which finishes first: the page load or the fruits API. On the laptop the page load usually finished first, so the listener was ready in time. On CI the API sometimes answered before `goto` returned. The listener started too late and hung. The trace confirmed it: response at 0.4 s, wait started after. Flaky tests live in this kind of timing, which is exactly what changes between machines.',
        },
        {
          q: 'How would you prove the rewrite is stable before merging?',
          a: 'Run it with `--repeat-each=100 --retries=0 --workers=4`, headless. Ideally run it in the CI pipeline on the PR branch too. Zero failures in 100 runs is strong proof, because a 1-in-8 failure would almost surely show up. Then watch the "Flaky" filter in the HTML report for the next week of CI runs.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-cc-2',
      title: 'Break the order dependence in a TodoMVC suite',
      context: 'This file passes when it runs alone with 1 worker. It fails at random with `fullyParallel: true`. When the first test fails on CI, the retry also fails "because the todo already exists". Your lead asks you to make every test independent.',
      task: 'Rewrite the suite so each test can run alone, in any order, at the same time as others, and on a retry. Keep the same coverage.',
      starter: {
        language: 'typescript',
        code: `import { test, expect, type Page } from '@playwright/test';

let page: Page; // shared across tests

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('https://demo.playwright.dev/todomvc');
});

test('add a todo', async () => {
  await page.getByPlaceholder('What needs to be done?').fill('Buy milk');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  expect(await page.locator('.todo-list li').count()).toBe(1);
});

test('complete the todo', async () => {
  // relies on "Buy milk" from the previous test
  await page.locator('.todo-list li .toggle').first().check();
  await expect(page.locator('.todo-list li').first()).toHaveClass(/completed/);
});

test('clear completed', async () => {
  await page.getByRole('button', { name: 'Clear completed' }).click();
  expect(await page.locator('.todo-list li').count()).toBe(0);
});`,
      },
      hints: [
        'Which built-in fixture already gives every test a fresh, separate page?',
        'Each test should create the data it needs. Could a small helper (or `beforeEach`) add a todo?',
        'Replace `count()` checks with `toHaveCount`. Replace the CSS chain with role or test-id locators.',
      ],
      solution: {
        language: 'typescript',
        code: `import { test, expect, type Page } from '@playwright/test';

async function addTodo(page: Page, text: string) {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill(text);
  await input.press('Enter');
  await expect(page.getByTestId('todo-title').filter({ hasText: text })).toBeVisible();
}

// fresh page per test via the built-in fixture; no shared variables
test.beforeEach(async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
});

test('add a todo', async ({ page }) => {
  await addTodo(page, 'Buy milk');
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
});

test('complete a todo', async ({ page }) => {
  await addTodo(page, 'Buy milk'); // own setup
  const item = page.getByTestId('todo-item').filter({ hasText: 'Buy milk' });
  await item.getByRole('checkbox', { name: 'Toggle Todo' }).check();
  await expect(item).toHaveClass(/completed/);
});

test('clear completed removes only completed todos', async ({ page }) => {
  await addTodo(page, 'Buy milk');
  await addTodo(page, 'Walk dog');
  await page.getByTestId('todo-item').filter({ hasText: 'Buy milk' })
    .getByRole('checkbox', { name: 'Toggle Todo' }).check();
  await page.getByRole('button', { name: 'Clear completed' }).click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-item')).toHaveText(['Walk dog']);
});`,
      },
      explanation: `**What changed and why:**
- **No shared \`page\` and no \`beforeAll\`.** The built-in \`page\` fixture gives each test a new browser context, like a fresh private window. So localStorage, where TodoMVC keeps the todos, starts empty. This makes retries and parallel runs safe.
- **Serial mode removed.** Tests no longer depend on each other. One failure does not skip the rest, and a retry runs only the failed test.
- **Each test makes its own data** with a small helper. The helper also checks that the todo appeared, so later steps never run too early.
- **\`waitForTimeout\` and \`count()\` replaced** with \`toHaveCount\` and \`toHaveText\`, which keep checking.
- **Locators** use the app's \`data-testid\` attributes and role names instead of CSS chains.
- The third test now also checks that *only* completed todos are removed. That is better coverage than "the list is empty".`,
      followUps: [
        {
          q: 'Isn\'t repeating the "add a todo" setup in every test slower?',
          a: 'A little, per test. But running tests at the same time more than makes up for it. And each failure now points to one behaviour. If setup is costly, like creating users, do it through an API or a fixture, not the UI. Speed that depends on test order is fake speed: it breaks as soon as you shard or retry.',
        },
        {
          q: 'When is serial mode really needed?',
          a: 'Rarely. Only when a flow is one business process whose steps cannot be set up on their own. For example, a multi-page wizard with server data and no API. Even then, prefer one longer test with `test.step` blocks over several dependent tests. A long test still retries as one unit, and the report shows each step.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-debug-flaky-iq-01',
      difficulty: 'medium',
      question: 'A Playwright test is green on your laptop but red on CI about a third of the time. How do you investigate?',
      whatInterviewerLooksFor: [
        'Looks at evidence (trace, report, video) before changing code',
        'Knows what is usually different on CI: CPU, headless, screen size, data, parallel workers',
        'Repeats the failure in CI-like conditions with repeat-each and workers',
        'Decides if it is a test bug, an environment problem or a product bug',
        'Does not "fix" it by adding sleeps or retries',
      ],
      modelAnswer: `**1. Collect evidence.** Our CI config records \`trace: 'on-first-retry'\`, plus screenshots and video on failure. It uploads the HTML report as a file. I download it and open the failed test and its trace.

**2. Read the trace.** First the Errors tab for the failing step. Then the action list. A step that took 30 s was *waiting*. The Log tab says what for: not visible, covered by an overlay, or still moving. I check the Before/After pictures and the Network tab. Was the API slow, or did it return 500? Did my assertion run before the response came?

**3. List what is different on CI:** fewer CPUs, headless (no visible window), a different screen size or time zone, an empty database, several workers sharing one account, a slow staging service.

**4. Repeat it like CI:** \`CI=1 npx playwright test cart.spec.ts:18 --repeat-each=30 --retries=0 --workers=4\`. If it fails alone, it is timing or environment. If it fails only in the full suite, it is shared data or test order.

**5. Fix the cause:** replace sleeps or \`isVisible()\` checks with web-first assertions. Start \`waitForResponse\` before the click. Give each test unique data. Set locale and time zone. Fake an unstable third-party service.

**6. Prove it and watch it:** repeat-each 100 with zero failures, then watch the "Flaky" filter in reports. If the trace shows the *app* doing something wrong, like a double submit, I file a bug with the trace attached. I don't hide it.`,
      followUps: [
        {
          q: 'The trace shows a click on "Checkout" that took 29 seconds before timing out. What do you look at next?',
          a: 'The Log tab for that step. It lists the checks Playwright kept repeating, for example "element is not visible" or "<div class=loading-overlay> intercepts pointer events". Then the Before picture, to see what covered the button. Then the Network tab, to see which request the overlay was waiting for. The usual fix is an assertion that waits for the overlay to disappear, not a sleep.',
        },
        {
          q: 'You cannot repeat it on your laptop, even with repeat-each. Now what?',
          a: 'Make CI collect more. For that file, switch to `trace: \'on-all-retries\'` or `retain-on-failure` for a while. Add `test.step` labels, and attach important API responses with `testInfo.attach`. Run the test on CI with `--repeat-each` on a branch. Also compare the setups: Docker image, Playwright version, CI screen size, and whether other tests share its data.',
        },
        {
          q: 'Would you just increase the timeouts?',
          a: 'Only if the evidence shows the step is really slow in that environment. For example, a report export that takes 12 s on staging. Then I raise the limit for that one assertion with `{ timeout: 15_000 }`, not for the whole suite. Raising all timeouts hides real slowness and makes failing runs much longer.',
        },
      ],
      pitfalls: [
        'Re-running the pipeline until it is green and calling it fixed.',
        'Adding `waitForTimeout` to "give it more time".',
        'Turning retries up to 5 without looking for the cause.',
        'Never thinking that the app itself might be wrong.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-02',
      difficulty: 'easy',
      question: 'What is a flaky test? How does Playwright report one? Are retries a good fix?',
      whatInterviewerLooksFor: [
        'Clear definition: different results on the same code',
        'Knows the passed / flaky / failed results',
        'Sees retries as a safety net, not a fix',
        'Mentions tracking flaky tests and --fail-on-flaky-tests',
      ],
      modelAnswer: `A **flaky test** passes and fails on the same code, without any change. The usual causes are timing races, shared data, test order, or an unstable environment.

Playwright shows flaky tests when retries are on. Every test ends in one of three results:
- **passed** — passed on the first try;
- **flaky** — failed first, then passed on a retry;
- **failed** — failed the first try and every retry.

The HTML report has a "Flaky" filter. The terminal summary also counts flaky tests separately.

**Are retries a fix? No, they are a seatbelt.** I keep \`retries: 2\` on CI, as the generated config does. So one unlucky run does not block the whole team. With \`trace: 'on-first-retry'\`, every retry gives me a trace to debug. On my laptop retries stay at 0, so I see problems at once.

A flaky test still costs time and trust. Each retry adds minutes to the pipeline. A team that sees "flaky" every day stops believing red builds, and real bugs slip through. So every flaky result becomes a ticket for me: read the trace, fix the cause, prove it with \`--repeat-each\`. For a strict rule, \`--fail-on-flaky-tests\` makes any flaky result fail the build.`,
      followUps: [
        {
          q: 'Can a test marked flaky hide a real bug?',
          a: 'Yes. The app may have a race bug, like a double submit or old cached data under load. Then the test fails sometimes and passes on retry. Retries hide a bug that users will hit. That is why I read the trace of the failed try first. I decide whether the test or the app was wrong before I change anything.',
        },
        {
          q: 'How many retries do you set on CI, and why?',
          a: 'Usually 1 or 2. One retry is enough to absorb a truly random infrastructure problem. More than 2 mostly hides problems, and failing runs get very slow, because each retry runs in a new worker with a new browser. I keep retries at 0 on laptops, so people see flaky tests while writing them.',
        },
      ],
      pitfalls: [
        'Defining flaky as "a test that fails" (a failing test is not always flaky).',
        'Saying retries solve flaky tests.',
        'Not knowing Playwright reports flaky results separately.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-03',
      difficulty: 'medium',
      question: 'How do you set up and use the trace viewer? Why do teams choose on-first-retry instead of on?',
      whatInterviewerLooksFor: [
        'Knows the trace option values and their trade-offs',
        'Knows how to open a trace (show-trace, the report, trace.playwright.dev)',
        'Can say what is inside a trace and how to read it',
        'Knows the cost: recording every test slows runs and fills storage',
      ],
      modelAnswer: `**Setup:** \`use: { trace: 'on-first-retry' }\` in \`playwright.config.ts\`. Or \`--trace on\` on the command line for one run.

The values:
- \`off\` — no traces.
- \`on\` — every test; heavy.
- \`on-first-retry\` — only on the first retry of a failed test.
- \`on-all-retries\` — on every retry.
- \`retain-on-failure\` — record all, keep only failures.

**Why \`on-first-retry\`:** passing tests are most tests, and they record nothing. So the suite runs at full speed and the files stay small. When a test fails, its retry records a trace. That is exactly the evidence I need. The catch: it needs \`retries\` above 0. It records the *retry*, not the first failure. If the retry passes, I still get a trace of a flaky test, which is useful. Without retries, I use \`retain-on-failure\`.

**Opening:** from the HTML report (the trace icon on the failed test), with \`npx playwright show-trace trace.zip\`, or by dragging the zip into trace.playwright.dev. That site opens the file in your own browser.

**Reading:** first the Errors tab and the red mark on the timeline. Then the Actions list with step times. Then the Before/Action/After pictures, which I can inspect like DevTools. Then the Log (what each step waited for), Network (API status and timing), Console (page errors), Source (my test line) and Metadata (browser, screen size).`,
      followUps: [
        {
          q: 'Is it safe to attach a trace to a public bug tracker?',
          a: 'Be careful. A trace holds page snapshots, network requests and responses with headers, and typed values. So it can contain tokens, cookies, passwords and personal data. Treat it like a log with secrets. Keep it in CI files with a short keep-time, or use test accounts with fake data.',
        },
        {
          q: 'How is a trace different from a video?',
          a: 'A video is only pictures. You see what happened, but you cannot inspect the page, the network or the locator used. A trace has structure: each step has page snapshots you can inspect, timings, the wait log, network bodies and the console. Video is nice for non-technical people; engineers debug with the trace.',
        },
      ],
      pitfalls: [
        'Using `trace: \'on\'` on CI for every test, then complaining about slow runs and huge files.',
        'Setting on-first-retry while retries is 0, then wondering why there are no traces.',
        'Not knowing that traces can contain secrets.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-04',
      difficulty: 'hard',
      question: 'You fixed a test that failed about once every 30 runs. How do you show the team that the fix really works?',
      context: 'The team lead does not believe it, because people have said "it passed once" before.',
      whatInterviewerLooksFor: [
        'Knows that one green run is not proof',
        'Uses --repeat-each with retries off, and CI-like load',
        'Can explain how many runs are enough',
        'Tracks the flaky rate after merging',
      ],
      modelAnswer: `**One pass proves almost nothing.** A test that fails 1 time in 30 passes a single run about 97% of the time.

**1. Make it fail first.** Before the fix, I run \`--repeat-each=100 --retries=0 --workers=4\` on the old code. If I cannot make it fail, I cannot prove I fixed it. Here I expect about 3 failures in 100 runs.

**2. Run the same test on the fix.** Same command, same machine, headless. Zero failures in 100 runs is strong proof. The chance that a 1-in-30 problem passes 100 times in a row is (29/30)^100 ≈ 3.4%. With 200 runs it drops below 0.2%.

**3. Do it in CI conditions.** I run the same job on the PR branch in the real pipeline: same Docker image, same CPU, same number of workers. Many flaky tests show up only with CI timing.

**4. Explain the cause, not only the result.** For example: "The test read the cart badge before the add-to-cart request came back. It now uses \`toHaveText('1')\`, which keeps checking." A clear cause plus the numbers is much more convincing than one green tick.

**5. Watch it after merging.** I watch the "Flaky" filter in the HTML report, or a dashboard of flaky counts, for a week. If it comes back, the fix was not complete and the test goes back to quarantine.`,
      followUps: [
        {
          q: 'The test passes 100 out of 100 on your laptop, but still fails sometimes on CI. What next?',
          a: 'Then the trigger is in the CI environment, not just timing on my laptop. I compare the CI details: workers vs CPUs, test accounts shared between parallel jobs, the website address, screen size and time zone. Running the repeat job inside the CI pipeline, with traces on `on-all-retries`, usually shows the cause.',
        },
        {
          q: 'Why turn retries off during the repeat run?',
          a: 'With retries on, a failure followed by a pass is reported as flaky, and the run stays green. You can miss failures if you only look at the result. With `--retries=0`, every failure counts as a failure. You want the repeat run to catch as much as possible.',
        },
      ],
      pitfalls: [
        '"It passed after my change, so it\'s fixed."',
        'Running the repeat test with retries on.',
        'Not making the test fail before applying the fix.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-05',
      difficulty: 'medium',
      question: 'Which reporters would you set up for a Playwright suite that runs on laptops, in GitHub Actions and in Jenkins? Why each one?',
      whatInterviewerLooksFor: [
        'Knows the built-in reporters and the defaults',
        'Picks a reporter for each reader (people, CI server, merge step)',
        'Knows several reporters can run together',
        'Mentions uploading the report, and blob for sharding',
      ],
      modelAnswer: `I pick a reporter for each **reader** of the results.

**On a laptop:** \`list\` (the default) shows each test as it finishes. I add \`html\` with \`open: 'on-failure'\`, so the report opens only when something broke.

**GitHub Actions:**
- \`dot\` (the CI default) keeps the logs short.
- \`github\` shows failures as notes right on the PR.
- \`html\` with \`open: 'never'\`, uploaded with \`actions/upload-artifact\` and \`if: \${{ !cancelled() }}\`. So failed runs still upload the report.
- If we shard (split the suite across machines), each shard uses \`blob\` instead. A final job runs \`npx playwright merge-reports --reporter html ./all-blob-reports\` to make one report.

**Jenkins:** \`junit\` with \`outputFile: 'results/junit.xml'\`. The JUnit plugin reads it to show a test results tab, history and trends. The HTML report is kept with the HTML Publisher plugin.

**Optional:** \`json\` for our own dashboards, or \`allure-playwright\` if the company already uses Allure for history.

All of this lives in one config: \`reporter: process.env.CI ? [...] : [...]\`. Reporters are an array of \`[name, options]\` pairs, and they all run together.`,
      followUps: [
        {
          q: 'Why does the HTML report need `open: \'never\'` on CI?',
          a: 'The default is `on-failure`. It tries to open a browser and show the report when tests fail. On a CI machine with no screen, that can block the job or waste time. With `never` (or `PLAYWRIGHT_HTML_OPEN=never`) it just writes the folder, and you upload it as a file.',
        },
        {
          q: 'What does the blob reporter solve that html does not?',
          a: 'Each shard is a separate machine with only part of the results. If every shard made its own HTML report, you would have several partial reports. Blob reports keep the raw results, so `merge-reports` can join all shards into one HTML (or junit) report for the whole run.',
        },
      ],
      pitfalls: [
        'Thinking only one reporter can be active.',
        'Forgetting to upload the report, so it is lost when the CI machine stops.',
        'Not knowing blob and merge-reports for shards.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-06',
      difficulty: 'expert',
      question: 'What exactly does Playwright do when a test fails and retries are on? How does that affect beforeAll, worker fixtures and serial mode?',
      whatInterviewerLooksFor: [
        'Knows the worker process and its browser are thrown away',
        'Knows beforeAll and worker-scoped fixtures run again in the new worker',
        'Knows serial groups retry together and later tests are skipped',
        'Can use testInfo.retry to make retries safe',
      ],
      modelAnswer: `**What happens.** Tests run in worker processes, and each worker has its own browser. When a test fails, Playwright **throws away the whole worker and its browser**. It starts a new worker. In that fresh worker it:
1. runs the \`beforeAll\` hooks of the file or group again,
2. sets up worker-scoped fixtures again (fixtures made once per worker),
3. retries the failed test,
4. then continues with the other tests in that worker's queue.

What this means:
- Values in **shared variables** from the old worker are gone. Tests that rely on them fail on retry.
- Costly \`beforeAll\` hooks and worker fixtures, like filling a database or logging in, **run again**. Running them twice must be safe. For example, creating "user1" twice must not crash.
- Data the failed try left on the server is still there. \`testInfo.retry\` (0 first, 1 on the first retry…) lets a test clean up or use a new unique name.

**Serial mode** (\`test.describe.configure({ mode: 'serial' })\`): if one test fails, the tests after it are **skipped**. On retry, **the whole group runs again from the first test**, even the ones that passed. So one flaky step makes the whole group slow and noisy. That is the main reason the docs recommend independent tests.

**Reporting:** a test that failed and then passed is **flaky**. If it fails the last retry, it is **failed**. \`--fail-on-flaky-tests\` makes flaky results fail the run.`,
      followUps: [
        {
          q: 'Why does Playwright restart the worker instead of just running the test again?',
          a: 'A failed test may leave the browser or worker broken: a stuck page, a crashed context, or bad worker fixtures. A fresh process makes sure the retry runs in a clean state. So a pass on retry means something, and one failure cannot spoil later tests in that worker.',
        },
        {
          q: 'How would you make a `beforeAll` that creates test users safe with retries?',
          a: 'Make it safe to run twice. Create unique user names per worker and try (`testInfo.workerIndex`, `testInfo.retry` or a timestamp), or "get or create" the user through the API. Clean up in `afterAll`. Even better, move it into a worker-scoped fixture with clean-up after `use()`, so creating and cleaning up stay together.',
        },
      ],
      pitfalls: [
        'Believing a retry runs in the same browser.',
        'Expecting variables set in an earlier test to survive a retry.',
        'Not knowing that serial groups retry as a whole.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-07',
      difficulty: 'hard',
      question: 'You join a team where 40 of 600 Playwright tests are flaky. The PR pipeline is red half the time. What is your plan for the first month?',
      whatInterviewerLooksFor: [
        'Measures before acting (flaky list, how often, how costly)',
        'Wins back trust fast with quarantine and owners',
        'Fixes by type of cause, not random test by test',
        'Adds checks to stop new flaky tests',
      ],
      modelAnswer: `**Week 1: measure and stop the damage.**
- Make sure CI has \`retries: 2\` and \`trace: 'on-first-retry'\`, and uploads the HTML report. Then every failure has evidence.
- Build a flaky list from recent reports: test name, how often it fails, error message.
- Tag the worst ones \`@quarantine\` and leave them out of the PR check with \`--grep-invert @quarantine\`. A nightly job still runs them. Each gets an owner and a ticket. Within days, people trust the PR pipeline again.

**Weeks 2–3: fix by type of cause.** The traces show that flaky tests fall into a few groups:
- fixed sleeps and \`isVisible()\`/\`textContent()\` checks → web-first assertions;
- \`waitForResponse\` after the click → start it before the click;
- accounts and data shared across workers → unique data made through the API, fixtures with clean-up;
- third-party widgets and slow staging → fake them with \`page.route\`;
- locale, time zone and screen size differences → set them in the config.
One fix for a group often fixes many tests at once. Each fix is proven with \`--repeat-each=100 --retries=0\` before the test leaves quarantine.

**Week 4: add guards.**
- Lint rules (for example \`eslint-plugin-playwright\`) for \`waitForTimeout\`, a missing \`await\` and \`page.pause\`.
- New or changed tests run with \`--repeat-each\` in the PR job. \`--only-changed\` helps pick them.
- Track the flaky count each week. A test that turns flaky goes to quarantine with an owner the same day.`,
      followUps: [
        {
          q: 'A product manager says "just delete the flaky tests". How do you answer?',
          a: 'Each test exists because it covers a risk. Deleting it removes the warning, not the risk. Quarantine keeps the test running every night without blocking PRs, with a deadline. If it is not fixed within, say, two sprints, we check whether the case is covered elsewhere (API or component tests) before deleting it.',
        },
        {
          q: 'How do you stop new flaky tests from entering the suite?',
          a: 'Lint rules for known bad patterns. A code review checklist: no sleeps, unique data, web-first assertions. And new or changed tests run several times in the PR pipeline, for example `--only-changed --repeat-each=10`. A test that cannot pass 10 out of 10 does not get merged.',
        },
      ],
      pitfalls: [
        'Fixing tests one by one with no data on which ones hurt most.',
        'Quarantine without owners or deadlines.',
        'Setting retries to 5 to make the pipeline green.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-debug-flaky-drill-1',
      question: `Read this short trace of a failed CI run. Name the cause and the fix.

Actions: \`goto /inventory 410ms\` · \`click "Add to cart" (backpack) 38ms\` · \`click cart link 52ms\` · \`expect(locator(".cart_item")).toHaveCount(1) 5.0s ✗\`. Error: "Expected 1, received 0". Network: \`POST /api/cart 201\` starts at 0.45s, ends at 1.9s. Console: none. After picture of the cart click: the cart page shows "Your cart is empty".`,
      assumptions: [
        'The app adds items to the cart with a `POST /api/cart` request that runs in the background.',
        'The cart page loads its items from the server when it opens.',
        'The test passes on the laptop, where the API answers in about 100 ms.',
      ],
      steps: [
        {
          label: 'Find the failing step',
          calc: 'toHaveCount(1) waited the full 5.0 s expect limit and still saw 0 items.',
        },
        {
          label: 'Check when the request ran',
          calc: 'Add-to-cart click at about 0.41 s; POST /api/cart runs from 0.45 s to 1.9 s (slow on CI).',
        },
        {
          label: 'Check what the test did in the meantime',
          calc: 'Cart link clicked at about 0.45 s + 38 ms ≈ 0.5 s, long before the POST finished at 1.9 s.',
        },
        {
          label: 'Explain the 0 items',
          calc: 'The cart page loaded its items before the server saved the new one → it shows "empty" and never refreshes.',
        },
        {
          label: 'Decide: test or app?',
          calc: 'A fast user could hit this too, but the test bug is opening the cart before the add finished. Also raise a question with the product team.',
        },
      ],
      answer: `**Cause:** a race between the add-to-cart request and opening the cart. The test opened the cart about 1.4 s before \`POST /api/cart\` finished on the slow CI server. So the cart page loaded empty. On the laptop the API answers in 100 ms, which hides the race.

**Fix:** wait for the visible result of "add to cart" before opening the cart. For example \`await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1')\`. Or start \`page.waitForResponse('**/api/cart')\` before the click and await it. Then open the cart and check.

**Also:** tell the team that a user can leave the page before the cart is saved. This may be a real usability bug.`,
      insight: 'Long step times plus the Network tab timeline usually show the race. Compare when the request ended with when the test moved on.',
      followUps: [
        {
          q: 'Why did raising the expect timeout to 15 s not help?',
          a: 'The cart page had already shown "empty", from a request made before the item was saved. Nothing loads it again. Waiting longer on a page that will never change cannot pass. The fix must change *when* the test opens the cart, not how long it waits afterwards.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-drill-2',
      question: 'A checkout test used to fail about 1 run in 50. After your fix, how many passing runs in a row (`--repeat-each=N --retries=0`) do you need to be 95% sure the problem is gone? In other words: a 1-in-50 failure would almost surely have shown up.',
      assumptions: [
        'The old failure chance per run is p = 0.02, and runs do not affect each other.',
        'If the bug were still there, the chance of seeing zero failures should be 5% or less.',
      ],
      steps: [
        {
          label: 'Probability one run passes if still flaky',
          calc: '1 − 0.02 = 0.98',
        },
        {
          label: 'Probability N runs all pass',
          calc: '0.98^N',
        },
        {
          label: 'Set the condition',
          calc: '0.98^N ≤ 0.05',
        },
        {
          label: 'Solve with logs',
          calc: 'N ≥ ln(0.05) / ln(0.98) = (−2.996) / (−0.0202) ≈ 148.3',
        },
        {
          label: 'Round up',
          calc: 'N = 150 runs (≈ 3 × the "1 in 50" number)',
        },
        {
          label: 'Cost check',
          calc: '150 × 8s per run ÷ 4 workers ≈ 300s ≈ 5 minutes',
        },
      ],
      answer: 'About **150 clean runs**. A handy rule (the "rule of three"): to be 95% sure a 1-in-K failure is gone, you need about **3 × K** passes in a row. With 4 workers and an 8-second test, this takes about 5 minutes. That is cheap insurance.',
      insight: 'Ten or twenty green runs prove little for a rare failure. Choose the number of repeats from the failure rate you saw.',
      followUps: [
        {
          q: 'What if the old failure rate was 1 in 200?',
          a: 'Then you need about 3 × 200 = 600 clean runs for the same confidence. That is about 20 minutes at 8 s per run on 4 workers. At that point it is often better to run the repeat job on CI on the PR branch, and keep watching the flaky rate in reports after merging.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-drill-3',
      question: 'Your CI suite has 400 tests, 10 s each on average, 4 workers on one machine, and `retries: 2`. In a typical run, 12 tests fail on the first try. 10 of them pass on the first retry, and 2 fail every retry. Estimate the extra time retries add, and how the run is reported.',
      assumptions: [
        'Retries run in fresh workers, and each adds about 3 s to start the worker and browser.',
        'Retried tests take the same 10 s per try.',
        'Work is shared evenly across the 4 workers.',
      ],
      steps: [
        {
          label: 'Base run time',
          calc: '400 × 10s ÷ 4 workers = 1,000s ≈ 16.7 min',
        },
        {
          label: 'First retries',
          calc: '12 retries × (10s + 3s startup) = 156s of work',
        },
        {
          label: 'Second retries',
          calc: 'Only the 2 still failing: 2 × 13s = 26s of work',
        },
        {
          label: 'Total extra work',
          calc: '156 + 26 = 182s ÷ 4 workers ≈ 46s (but the 2-retry chains are serial: ≥ 26s on one worker)',
        },
        {
          label: 'Reported outcome',
          calc: '388 passed, 10 flaky, 2 failed → build is red because of the 2 failures',
        },
      ],
      answer: 'Retries add about **45–60 seconds** (about 5%) to a 17-minute run. The report shows **388 passed, 10 flaky, 2 failed**. The build is red because of the 2 failures. The 10 flaky tests would *not* turn it red, unless you pass `--fail-on-flaky-tests`.',
      insight: 'Retries cost little time but a lot of trust. 10 flaky tests per run means 10 unknown risks every day. The time cost is the smallest part.',
      followUps: [
        {
          q: 'How would the time change with trace "on" instead of "on-first-retry"?',
          a: 'Recording traces for all 400 tests adds work to every test: page snapshots, screenshots and writing zip files. Often that is 10–30% more, depending on the app. So the 16.7-minute run could become 19–22 minutes, with much bigger files. With on-first-retry, only the 12 retried tests pay that cost.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-debug-flaky-mcq-01',
      difficulty: 'easy',
      question: 'You want to go through one failing test line by line, in a visible browser, with the Playwright Inspector. Which command is best?',
      options: [
        'npx playwright test tests/cart.spec.ts:18 --debug',
        'npx playwright test --headed --retries=0',
        'npx playwright show-report',
        'npx playwright test --repeat-each=1 --trace on',
      ],
      correct: [0],
      explanation: 'file:line runs only that one test. `--debug` opens the Inspector with a visible browser, timeout 0 and one worker. `--headed` alone shows the browser, but you cannot step through the actions. `show-report` opens the report of a finished run. A trace is a recording to read later, not a live step-by-step tool.',
      followUps: [
        {
          q: 'What does --debug change apart from opening the Inspector?',
          a: 'It runs headed, sets the test timeout to 0 so you are not killed while inspecting, uses a single worker and stops after the first failure (`--max-failures=1`). Under the hood it sets PWDEBUG=1.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-02',
      difficulty: 'easy',
      question: 'A checkout test fails on the first try, then passes when the runner tries it again. Which label does the HTML report give it?',
      options: ['passed', 'flaky', 'failed', 'skipped'],
      correct: [1],
      explanation: 'Playwright has three results: passed (first try), flaky (failed first, passed on a retry) and failed (failed every try). It is not "passed", because the first try failed. It is not "failed", because a retry passed. Skipped is only for tests that never ran.',
      followUps: [
        {
          q: 'Does a flaky result make the build red?',
          a: 'Not by default; the run exits successfully. Add `--fail-on-flaky-tests` if your team wants any flaky result to fail the pipeline.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-03',
      difficulty: 'medium',
      question: 'Why is this test flaky?',
      code: {
        language: 'typescript',
        code: `test('saves profile', async ({ page }) => {
  await page.goto('/profile');
  await page.getByLabel('City').fill('Pune');
  await page.getByRole('button', { name: 'Save' }).click();
  const res = await page.waitForResponse('**/api/profile');
  expect(res.status()).toBe(200);
});`,
      },
      options: [
        'The response can arrive before waitForResponse starts listening, so the wait sometimes times out',
        'fill() does not wait for the input to be editable',
        'waitForResponse only matches full URLs, not globs',
        'status() returns a promise and must be awaited',
      ],
      correct: [0],
      explanation: 'The listener starts after the click. On a fast server the response has already finished, so `waitForResponse` waits for a second one that never comes. Create the promise before the click and await it after. The other options are wrong: `fill` does check that the field is editable, `waitForResponse` accepts globs, regexes and functions, and `status()` is not async.',
      followUps: [
        {
          q: 'Rewrite the last three lines correctly.',
          a: 'const resPromise = page.waitForResponse(\'**/api/profile\'); await page.getByRole(\'button\', { name: \'Save\' }).click(); const res = await resPromise; await expect(res).toBeOK(); — register, trigger, then await.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-04',
      difficulty: 'medium',
      question: 'Your CI config has `retries: 2`. Which trace setting records evidence only for tests that failed at least once, without slowing down passing tests?',
      options: ['trace: \'on\'', 'trace: \'on-first-retry\'', 'trace: \'off\'', 'trace: \'retain-on-failure\''],
      correct: [1],
      explanation: '`on-first-retry` records only when a failed test is retried. Passing tests record nothing and pay no cost. `on` records every test. `retain-on-failure` keeps only failing traces, but it still *records* every test, so passing tests get slower. `off` gives no evidence at all.',
      followUps: [
        {
          q: 'When would you prefer retain-on-failure?',
          a: 'When retries are 0 (e.g. locally) or when you need the trace of the original failing attempt rather than the retry, for example if the retry tends to pass and you want to see the failure itself.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-05',
      difficulty: 'medium',
      question: 'Which of these really cause flaky Playwright tests? Select ALL that apply.',
      options: [
        'Two parallel workers logging in as the same user and editing the same cart',
        'Using `await expect(locator).toHaveText()` instead of reading `textContent()`',
        'A test that relies on data created by the previous test in the file',
        'Asserting with `expect(await el.isVisible()).toBe(true)` right after a click',
        'Using `getByRole` instead of a CSS selector',
      ],
      correct: [0, 2, 3],
      explanation: 'Accounts shared across workers, tests that depend on order, and one-time `isVisible()` checks are classic causes. `toHaveText` is actually the fix for one-time reads, because it keeps checking. `getByRole` is the recommended, sturdier locator. So neither of those two causes flaky tests.',
      followUps: [
        {
          q: 'How do you give each worker its own account?',
          a: 'Use `testInfo.workerIndex` (or `parallelIndex`) to pick from a pool of accounts, or create a user per worker via the API in a worker-scoped fixture, and store per-worker storageState files.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-06',
      difficulty: 'medium',
      question: 'After a failure, what does the runner do before the second try starts?',
      options: [
        'The same browser page is reloaded and the test runs again',
        'The worker process and its browser are discarded; a new worker reruns beforeAll hooks, then the test',
        'Only the failed assertion is re-executed',
        'All tests in the whole run are restarted',
      ],
      correct: [1],
      explanation: 'Playwright throws away the whole worker process and its browser after a failure. It starts a fresh worker, which runs `beforeAll` and worker fixtures again before the retry. It does not reuse the page. It does not re-run just one assertion. It retries only the failed test (or the whole group in serial mode), not the full run.',
      followUps: [
        {
          q: 'What does that mean for a module-level variable set by an earlier test?',
          a: 'It is lost: the new worker re-imports the file and the variable starts at its initial value. Tests depending on it will fail on retry, another reason to keep tests independent.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-07',
      difficulty: 'hard',
      question: 'With `retries: 1` on CI, this file sometimes shows "409 user already exists", but only on the second try. Why?',
      code: {
        language: 'typescript',
        code: `test.beforeAll(async ({ request }) => {
  const res = await request.post('/api/users', {
    data: { username: 'qa_checkout_user', password: 'Secret#123' },
  });
  expect(res.status()).toBe(201);
});

test('checkout as new user', async ({ page }) => {
  // ... occasionally fails on a slow payment step
});`,
      },
      options: [
        'The retry runs in a fresh worker, so beforeAll runs again and tries to create a user that the first attempt already created',
        'beforeAll runs once per test, so the user is created twice even without retries',
        'The request fixture is not allowed inside beforeAll hooks',
        'Retries reuse the same worker, and the old API context still holds the user',
      ],
      correct: [0],
      explanation: 'After a failure, Playwright throws away the worker. The new worker runs `beforeAll` again. It sends the same fixed user name again, and the server rejects it with 409. `beforeAll` runs once per worker, not once per test. The request fixture can be used in `beforeAll`. Retries never reuse the failed worker.',
      followUps: [
        {
          q: 'How do you make this setup retry-safe?',
          a: 'Generate a unique username per worker and attempt (e.g. include `testInfo.workerIndex` and `Date.now()`), or "get or create", and delete the user in `afterAll` or in a worker fixture teardown so every attempt starts clean.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-08',
      difficulty: 'hard',
      question: 'Which command gives the strongest proof that a fix for a random failure in `checkout.spec.ts` worked?',
      options: [
        'npx playwright test checkout.spec.ts --retries=3',
        'npx playwright test checkout.spec.ts --repeat-each=100 --retries=0 --workers=4',
        'npx playwright test checkout.spec.ts --last-failed',
        'npx playwright test checkout.spec.ts --headed',
      ],
      correct: [1],
      explanation: 'Running each test 100 times, with retries off and several workers, makes a rare failure very likely to show. Nothing hides it. Retries hide failures by turning them into flaky passes. `--last-failed` runs the tests only once. Headed mode changes the timing and also runs once, so it proves little.',
      followUps: [
        {
          q: 'Why add --workers=4?',
          a: 'Parallel workers create CPU contention similar to CI and run copies concurrently, which exposes timing races and shared-data collisions that a single worker on an idle laptop hides.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-09',
      difficulty: 'easy',
      question: 'Which reporter would you add so Jenkins can show a test-results tab with pass/fail history?',
      options: ['[\'junit\', { outputFile: \'results.xml\' }]', '[\'dot\']', '[\'list\']', '[\'line\']'],
      correct: [0],
      explanation: 'CI servers like Jenkins and Azure DevOps read JUnit XML. They use it to build test tabs and trends. `dot`, `list` and `line` only print to the terminal. So the CI server has nothing structured to read.',
      followUps: [
        {
          q: 'And for GitHub Actions PR annotations?',
          a: 'The `github` reporter, which emits annotations so failures appear on the PR, usually combined with an uploaded HTML report for details.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-10',
      difficulty: 'medium',
      question: 'You want local runs to stay fast, but every CI failure should have a screenshot, video and trace. Select ALL the lines that belong in `use` for CI.',
      options: [
        'screenshot: \'only-on-failure\'',
        'video: \'retain-on-failure\'',
        'trace: \'on-first-retry\'',
        'video: \'on\'',
        'screenshot: \'on\'',
      ],
      correct: [0, 1, 2],
      explanation: '`only-on-failure`, `retain-on-failure` and `on-first-retry` all give evidence for failures, and cost little or nothing for passing tests. `video: \'on\'` and `screenshot: \'on\'` make files for every test. That slows runs and fills storage, and green tests do not need debugging.',
      followUps: [
        {
          q: 'Where do these artifacts end up?',
          a: 'In the output directory, `test-results/` by default, one folder per test, and they are linked from the HTML report in `playwright-report/`. Upload the report (and test-results if needed) as CI artifacts.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-11',
      difficulty: 'hard',
      question: 'What does this test do when the success message never appears?',
      code: {
        language: 'typescript',
        code: `test('submits form', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Email').fill('a@b.co');
  await page.getByRole('button', { name: 'Send' }).click();
  if (await page.getByText('Thanks!').isVisible()) {
    await expect(page.getByText('Thanks!')).toHaveText('Thanks!');
  }
});`,
      },
      options: [
        'It fails after the 5s expect timeout',
        'It passes, because isVisible() returns false immediately and the assertion is skipped',
        'It fails immediately with a strict-mode error',
        'It waits up to 30s for the text, then fails',
      ],
      correct: [1],
      explanation: '`isVisible()` does not wait. It returns the state at that exact moment. So the `if` branch is skipped, and the test passes without checking anything. That is a false pass. A web-first assertion would wait and then fail. There is no strict-mode problem, because only one element is involved. Nothing waits 30 s here.',
      followUps: [
        {
          q: 'Fix it in one line.',
          a: 'await expect(page.getByText(\'Thanks!\')).toBeVisible(); — the assertion retries until the message appears and fails clearly if it never does.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-12',
      difficulty: 'medium',
      question: 'A test passes when run alone, but fails now and then when the whole suite runs with 6 workers. Which causes are most likely? Select ALL that apply.',
      options: [
        'Tests share data (same user, same record) and collide',
        'The test depends on state left behind by another test',
        'The locator uses getByRole',
        'Resource contention: 6 workers on a small machine slow the app and the browser',
      ],
      correct: [0, 1, 3],
      explanation: 'Passing alone but failing in the suite points to shared data, test order, or too much load from too many workers. Using `getByRole` is the recommended locator style. It does not depend on what other tests do, so it is not a cause here.',
      followUps: [
        {
          q: 'How do you tell shared state from resource contention?',
          a: 'Run the full suite with `--workers=1`. If it still fails, the cause is order/shared state; if it passes with one worker but fails with six, suspect collisions between parallel tests or CPU starvation, then check traces for slow actions versus wrong data.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-13',
      difficulty: 'hard',
      question: 'In a failed trace, the click on "Place order" took 29.8 s. The Log tab keeps repeating: `<div class="spinner-overlay"> intercepts pointer events`. What is the best fix?',
      options: [
        'await page.getByRole(\'button\', { name: \'Place order\' }).click({ force: true })',
        'await expect(page.locator(\'.spinner-overlay\')).toBeHidden(); then click the button',
        'await page.waitForTimeout(5000) before the click',
        'Increase the test timeout to 60 seconds',
      ],
      correct: [1],
      explanation: 'A spinner covers the button while the app is busy. Waiting until the spinner is hidden matches what a real user does. It passes as soon as the app is ready. `force: true` skips Playwright\'s checks and clicks through a busy page, which hides a state users would see. A fixed sleep is a guess. A longer timeout only makes the failure slower if the spinner never goes away.',
      followUps: [
        {
          q: 'Why doesn\'t the click itself just wait for the overlay?',
          a: 'It does: the "receives events" actionability check retries until the element is hit-testable, which is why it ran for 29.8s. Here the overlay never disappeared in time, so the real question is why the app stayed busy; the Network tab may show a slow or failed request.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-14',
      difficulty: 'expert',
      question: 'Which statements about retries and flaky tests in Playwright are true? Select ALL that apply.',
      options: [
        '`testInfo.retry` is 0 on the first attempt and increases on each retry',
        'By default, a run that contains flaky tests exits with a failure code',
        '`--fail-on-flaky-tests` makes the run fail if any test is classified as flaky',
        'Retries are enabled by default with a value of 2',
      ],
      correct: [0, 2],
      explanation: '`testInfo.retry` counts the tries, starting at 0. `--fail-on-flaky-tests` makes flaky results fail the run. By default, flaky tests do not fail the run. Retries are off by default; the generated config turns on 2 retries only on CI, using `process.env.CI`.',
      followUps: [
        {
          q: 'Give a practical use of testInfo.retry.',
          a: 'Clean up server-side data the previous attempt may have created, or generate a different unique name on each attempt, so the retry does not fail with "already exists".',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-15',
      difficulty: 'expert',
      question: 'This config runs on CI with 2 retries. A test fails once, then passes on the retry. Which files will exist for that test?',
      code: {
        language: 'typescript',
        code: `use: {
  trace: 'on-first-retry',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
},
retries: 2,`,
      },
      options: [
        'A trace from the retry, plus a video and screenshot from the failed first attempt',
        'Only a screenshot, because the test eventually passed',
        'Nothing, because flaky tests keep no artifacts',
        'A trace and video of every attempt including passing tests in the run',
      ],
      correct: [0],
      explanation: 'The first try failed, so its video is kept and a failure screenshot is taken. The first retry records a trace, because of on-first-retry. That trace is kept even though the retry passed. Files are saved per try, so "passed in the end" does not delete the evidence of the failed try. Tests that passed on the first try record no trace.',
      followUps: [
        {
          q: 'Why is a trace of the passing retry still useful?',
          a: 'It shows the timing of a successful run, which you can compare against the failed attempt\'s video and screenshot to spot the race: for example, the retry waited 1.8s for an API call that the first attempt raced past.',
        },
      ],
    },
  ],
};

export default topic;
