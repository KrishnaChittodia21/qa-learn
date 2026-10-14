import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-debug-flaky',
  phase: 'pw-framework',
  order: 4,
  title: 'Debugging, Reporting & Flaky Tests',
  subtitle:
    'Inspector, UI mode, trace viewer, screenshots, videos and reporters, then the real work: finding why a test is flaky, fixing it for good, and proving the fix.',
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
  tags: ['debugging', 'inspector', 'ui-mode', 'trace-viewer', 'reporters', 'flaky-tests', 'retries', 'repeat-each', 'isolation'],
  cheatSheet: [
    'Debug one test: `npx playwright test login.spec.ts:12 --debug` → headed, Inspector open, timeout 0, 1 worker; add `await page.pause()` to stop at a precise line.',
    '`npx playwright test --ui` = UI mode: watch mode, time-travel timeline, pick locator, filters by status/project/tag. Best local loop for writing and fixing tests.',
    'Trace viewer: `trace: \'on-first-retry\'` (cheap, CI default) or `\'retain-on-failure\'` (works without retries); open with `npx playwright show-trace trace.zip` or trace.playwright.dev.',
    'Trace tabs to read in order: Errors → Actions (before/action/after snapshots) → Log (actionability waits) → Network → Console → Source.',
    'Artifacts: `screenshot: \'only-on-failure\'`, `video: \'retain-on-failure\'` (or `\'on-first-retry\'`); all land in `test-results/`; HTML report in `playwright-report/`.',
    'Reporters: `list` (local default), `dot` (CI default), `line`, `html`, `json`, `junit` (Jenkins/Azure), `blob` (shards → merge-reports), `github` (PR annotations), `allure-playwright` (3rd party).',
    'Result states: passed (first try), **flaky** (failed then passed on retry), failed (failed every retry). `--fail-on-flaky-tests` turns flaky into a red build.',
    'On failure Playwright throws away the whole worker + browser; the retry runs in a fresh worker, so `beforeAll` runs again. `testInfo.retry` tells you which attempt you are on.',
    'Serial mode (`test.describe.configure({ mode: \'serial\' })`): one failure skips the rest, and a retry re-runs the whole group. Prefer isolated tests.',
    'Top flaky causes: hard waits, check-then-act with `isVisible()`, waiting for a response after triggering it, shared data between tests, order dependence, animations, unstable test env.',
    'Prove a fix: `--repeat-each=50 --workers=4` (add `--retries=0`), run in CI conditions, then watch the flaky rate in reports for a week.',
    'Retries are a seatbelt, not a fix: keep `retries: 2` on CI, never locally, and track every test that comes back "flaky".',
  ],
  sections: [
    {
      heading: 'The debugging toolbox at a glance',
      body: `**Intuition:** debugging a UI test is like investigating a car crash. Sometimes you can watch it happen again in slow motion (Inspector, UI mode). Sometimes you only have the dashcam footage from last night's CI run (trace, video, screenshot). Pick the tool by asking: *can I reproduce it right now, on my machine?*

Playwright ships a tool for each situation:

| Situation | Tool | How to start it |
|---|---|---|
| Writing a new test, want instant feedback | **UI mode** | \`npx playwright test --ui\` |
| Fails locally, want to step line by line | **Inspector** (\`--debug\`) | \`npx playwright test cart.spec.ts:18 --debug\` |
| Want to stop at one exact line | \`page.pause()\` | add \`await page.pause()\`, run headed or with \`--debug\` |
| Prefer breakpoints in the editor | **VS Code extension** | right-click the green triangle → Debug Test |
| Failed in CI, cannot reproduce | **Trace viewer** | \`npx playwright show-trace trace.zip\` |
| Need visual proof for a bug report | Screenshot / video | \`screenshot\` and \`video\` in \`use\` |
| Need low-level protocol detail | API logs | \`DEBUG=pw:api npx playwright test\` |

**Rule of thumb:** reproduce locally first with \`--ui\` or \`--debug\`. If you cannot reproduce, do not guess: collect a trace from the failing environment and read it.

**In interviews, say this:** "For local failures I use UI mode or the Inspector; for CI failures I rely on traces recorded on the first retry, plus screenshots and video kept only on failure, so I can debug without rerunning."`,
      keyPoints: [
        'Local and reproducible → interactive tools (UI mode, Inspector, VS Code).',
        'CI-only or intermittent → recorded evidence (trace first, then video/screenshot).',
        'Never debug a flaky test by adding sleeps until it passes.',
      ],
      source: 'Playwright docs — Debugging Tests',
    },
    {
      heading: 'Inspector, --debug and page.pause()',
      body: `**Intuition:** \`--debug\` is the pause button and the frame-by-frame remote for your test.

\`--debug\` does four things at once: runs the browser **headed**, opens the **Playwright Inspector**, sets the test **timeout to 0** (so you are not killed while thinking) and limits the run to **one worker** with \`--max-failures=1\`. Under the hood it sets \`PWDEBUG=1\`.

In the Inspector you can:
- **Step over** each Playwright call and see the target element highlighted.
- Read the **actionability log** for the current action: "waiting for element to be visible, enabled and stable…", which tells you *why* a click is stuck.
- **Pick locator**: hover the page, click an element and get a recommended \`getByRole\` / \`getByTestId\` locator; you can also edit the locator live and see what matches.
- **Resume** to run until the next \`page.pause()\` or the end.

Target precisely: give the file and **line number** so only that test runs, and one project so only one browser opens.

**Common mistake:** committing \`page.pause()\`. It exists only for interactive, headed debugging sessions; left in the code it can stall a headed run waiting for someone to press Resume, and it is noise in review. Add a lint rule or a pre-commit grep for it, and set \`forbidOnly: !!process.env.CI\` to catch a stray \`.only\`.`,
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
        '--debug = headed + Inspector + timeout 0 + 1 worker + stop on first failure.',
        'Use file:line to run a single test.',
        'The actionability log explains why an action is waiting.',
      ],
      source: 'Playwright docs — Debugging Tests; Command line',
    },
    {
      heading: 'UI mode and VS Code debugging',
      body: `**Intuition:** UI mode is a "test cockpit": the test list on the left, a time-travel film strip in the middle, and DOM snapshots you can inspect, all live while you edit code.

**UI mode** (\`npx playwright test --ui\`) gives you:
- **Watch mode**: click the eye icon next to a test or file and it re-runs on every save.
- A **timeline** like the trace viewer for every run: hover an action to see the page *at that moment*, with Before/After snapshots.
- **Pick locator**, Console, Network, Errors and Source tabs.
- **Filters** by text, \`@tag\`, status (passed/failed/skipped) and project.

**VS Code extension** (Playwright Test for VS Code):
- Click in the gutter to set a **breakpoint**, then right-click the run icon → **Debug Test**; you can inspect variables like \`await locator.count()\` in the Debug Console.
- **Show browser** keeps the browser open and highlights locators as your cursor moves over them in the code.
- **Pick locator** and **Record new** (codegen) from the Testing sidebar.

| Need | UI mode | VS Code debugger | Inspector |
|---|---|---|---|
| Fast edit → rerun loop | best (watch) | good | slow |
| Inspect JS variables | no | **yes** (breakpoints) | no |
| Time-travel through DOM | **yes** | no | no |
| Step one action at a time | via timeline | yes | **yes** |

**In interviews, say this:** "UI mode is my daily driver; I drop into the VS Code debugger when the bug is in my test logic (data, loops, page-object code) rather than in the page."`,
      keyPoints: [
        'UI mode = watch mode + time travel + pick locator.',
        'VS Code debugger is for bugs in your own TypeScript, not the page.',
        'Both are local tools; CI needs recorded artefacts.',
      ],
      source: 'Playwright docs — UI Mode; Debugging Tests (VS Code extension)',
    },
    {
      heading: 'Trace viewer: replaying a failed run step by step',
      body: `**Intuition:** a trace is a flight recorder. It stores every action, a DOM snapshot before and after it, the network, the console and your source line, zipped into one file you can replay anywhere.

**Recording.** Set \`trace\` in \`use\` (or pass \`--trace\` on the CLI):

| Value | Records | When to use |
|---|---|---|
| \`'off'\` | nothing | never debugging |
| \`'on'\` | every test | local deep dives only; heavy |
| \`'on-first-retry'\` | only the first retry of a failed test | **CI default** (generated config); needs \`retries > 0\` |
| \`'on-all-retries'\` | every retry | chasing a rare flake |
| \`'retain-on-failure'\` | every test, kept only if it failed | no retries, or you want the trace of the *first* failure |

**Opening.** \`npx playwright show-trace path/to/trace.zip\`, from the HTML report (\`npx playwright show-report\` → open the failed test → Traces), or drag the zip into **trace.playwright.dev** (processed in your browser; nothing is uploaded).

**Reading a trace, in this order:**
1. **Errors** tab and the red marker on the timeline: the failing call and its message.
2. **Actions** list: durations. An action that took 29.9s is waiting, not slow.
3. **Snapshots**: *Before* / *Action* (shows the exact click point) / *After*. Was the element covered by a spinner? Was the text still the old value?
4. **Log**: the actionability steps ("element is not stable", "element is outside of the viewport", "<div class=overlay> intercepts pointer events").
5. **Network**: did the API call return 500, or start *after* the assertion?
6. **Console** and **Source**: JS errors on the page; the exact line in your test.
7. **Metadata**: browser, viewport, duration, to spot "CI uses a different viewport".`,
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
        'on-first-retry is cheap because passing tests record nothing.',
        'retain-on-failure needs no retries but records every test (slower).',
        'Long action duration = waiting; the Log tab says on what.',
      ],
      source: 'Playwright docs — Trace viewer',
    },
    {
      heading: 'Screenshots, videos and the HTML report',
      body: `**Intuition:** a screenshot is a photo of the crash, a video is the dashcam, a trace is the full black box. Collect cheap evidence always, expensive evidence only on failure.

| Option (in \`use\`) | Values | Cost | Where saved |
|---|---|---|---|
| \`screenshot\` | \`'off'\`, \`'on'\`, \`'only-on-failure'\` | low | \`test-results/<test>/\` |
| \`video\` | \`'off'\`, \`'on'\`, \`'retain-on-failure'\`, \`'on-first-retry'\` | medium (recording slows runs) | \`test-results/<test>/\` |
| \`trace\` | see trace section | medium–high | \`test-results/<test>/trace.zip\` |

Videos are written when the page/context **closes**, so \`page.video().path()\` is only usable after that. Default size is the viewport scaled down to fit 800×800; set \`video: { mode: 'on', size: { width: 640, height: 480 } }\` to change it.

**Manual screenshots** are useful as evidence in a test or bug report: \`page.screenshot({ path, fullPage: true })\` or \`locator.screenshot()\`. Attach them to the report with \`testInfo.attach\` so they show up next to the test.

**HTML report** (\`reporter: 'html'\`, folder \`playwright-report/\`): groups tests by file, filters by passed/failed/**flaky**/skipped, shows steps, errors with code frames, attachments (screenshots, video, trace link). Open with \`npx playwright show-report\`. Option \`open: 'always' | 'never' | 'on-failure'\` (default \`on-failure\`; on CI use \`never\` so the job does not try to open a browser).`,
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
        'Default to only-on-failure / retain-on-failure: evidence without the cost.',
        'Everything per-test lives in test-results/; the report lives in playwright-report/.',
        'testInfo.attach puts custom files into the report.',
      ],
      source: 'Playwright docs — Screenshots; Videos; Reporters (HTML)',
    },
    {
      heading: 'Reporters: who reads the results?',
      body: `**Intuition:** a reporter is the "format" of the test results. A human in a terminal wants something short, a human after CI wants a clickable page, Jenkins wants XML, a merge step wants raw data.

| Reporter | Output | Typical use |
|---|---|---|
| \`list\` | one line per test | **default locally** |
| \`line\` | single updating line, failures inline | big suites in a terminal |
| \`dot\` | one char per test | **default on CI** |
| \`html\` | \`playwright-report/\` folder | humans after a CI run (upload as artifact) |
| \`json\` | one JSON file | dashboards, custom scripts |
| \`junit\` | XML | Jenkins, Azure DevOps, GitLab test tabs |
| \`blob\` | raw zip per shard | **sharding**: merge later with \`merge-reports\` |
| \`github\` | inline annotations | failures shown on the PR diff in GitHub Actions |
| \`allure-playwright\` | Allure results dir | third-party rich history/trend reports |

You can use **several reporters at once** (array of tuples). Add a reporter only on CI with \`process.env.CI\`.

**Interview angle:** "Why junit?" Because the CI server parses it to show a test tab and trend; "Why blob?" Because shard reports must be merged into one HTML report.`,
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
        'list locally, dot on CI are the defaults.',
        'junit for CI servers, blob for shards, github for PR annotations.',
        'Multiple reporters can run together.',
      ],
      source: 'Playwright docs — Reporters',
    },
    {
      heading: 'What makes a test flaky',
      body: `**Intuition:** a flaky test is a coin toss dressed up as a test: same code, same app, different result. It is almost always a **race**: the test and the app run on different clocks, and sometimes the test wins when it should wait.

**Definition:** a test is flaky when it both passes and fails on the same commit without any code change. Playwright labels a test **flaky** when it fails first and passes on a retry.

| Cause | Smell in the code | Fix |
|---|---|---|
| Hard waits | \`waitForTimeout(3000)\` | web-first assertion on the real signal (\`toBeVisible\`, \`toHaveText\`, \`toHaveURL\`) |
| Check-then-act | \`if (await btn.isVisible())\`, \`expect(await el.textContent()).toBe(...)\` | \`await expect(el).toHaveText(...)\` (retries until timeout) |
| Waiting for a response after triggering it | \`await click(); await page.waitForResponse(...)\` | start \`waitForResponse\` **before** the click, then await it |
| Shared / leftover data | two tests edit "user1"'s cart | unique data per test, API setup + cleanup |
| Order dependence | test B needs test A's booking | each test creates what it needs (fixtures) |
| Fragile locators | \`.nth(3)\`, long CSS/XPath, auto-generated classes | role/label/test-id locators, filter by text |
| Animations / transitions | click lands mid-animation | assert final state; actionability waits for *stable*; disable animations in test env |
| Environment | slow shared staging, 3rd-party widgets, time zones, viewport | mock 3rd parties, pin \`timezoneId\`/\`locale\`/viewport in config |
| Resource starvation | many workers on a 2-CPU CI runner | fewer workers, shard instead |

**Not every intermittent failure is a flaky test.** Sometimes the app has a real race condition (double-submit, stale cache). A trace that shows the **app** misbehaving is a bug report, not a test fix.`,
      diagram: `  Race: the classic flaky timeline
  time ----------------------------------------------------->
  test : click "Search" -> read results   (reads too early)
  app  : click handled -> fetch /api/search ...... render
                                  ^ fast machine: render before read  -> PASS
                                  ^ slow CI:      render after read   -> FAIL`,
      keyPoints: [
        'Flaky = non-deterministic result on unchanged code.',
        'Most flakiness is timing; the rest is shared state and environment.',
        'Sometimes the flake is a real product bug: check the trace before "fixing" the test.',
      ],
      source: 'Playwright docs — Retries; Auto-waiting; BrowserStack & TestDino flaky-test guides',
    },
    {
      heading: 'Fixing flaky tests: patterns that work',
      body: `**Intuition:** stop telling the test *how long* to wait; tell it *what to wait for*.

Five patterns fix most flakes:

1. **Assert the outcome, not the clock.** Replace sleeps with web-first assertions; they retry until the condition holds (default 5s \`expect\` timeout).
2. **Register before you trigger.** For network-dependent steps, create the \`waitForResponse\` promise, *then* click, *then* await it.
3. **Own your data.** Each test creates its own user/booking/cart through an API or fixture with a unique value (\`Date.now()\`, \`testInfo.workerIndex\`) and cleans it up.
4. **Isolate.** No module-level variables shared across tests; each test gets a fresh context (Playwright's default). Avoid \`serial\` unless a flow truly cannot be split.
5. **Control the environment.** Mock unstable third parties with \`page.route\`, fix \`timezoneId\`, \`locale\`, viewport; disable CSS animations in the test build if possible.

Use \`expect.poll\` or \`expect(...).toPass()\` for things that are not a locator (an API value that eventually changes).`,
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
        'waitForResponse promise first, action second, await third.',
        'Unique data + isolation removes order dependence.',
      ],
      source: 'Playwright docs — Assertions; Network (waiting for responses)',
    },
    {
      heading: 'Retries and flaky tests',
      body: `**Intuition:** retries are an airbag. They save the build from a single bad roll, but if your airbag fires every day, you need to fix the brakes.

**Configuring retries** (off by default):
- Config: \`retries: process.env.CI ? 2 : 0\` (the generated config does exactly this).
- CLI: \`npx playwright test --retries=2\`.
- Per group: \`test.describe.configure({ retries: 1 })\`.

**How a retry works.** Each worker is a separate process with its own browser. When a test fails, Playwright **discards the entire worker process and browser** and starts a new one. In the fresh worker, \`beforeAll\` hooks run again, the failed test is retried, then the remaining tests continue. So worker-scoped state is rebuilt; anything you stored in a module variable is gone.

**Result categories:**
| Category | Meaning |
|---|---|
| passed | passed on the first run |
| **flaky** | failed first, passed on a retry |
| failed | failed the first run and every retry |

The build stays **green** for flaky tests unless you add \`--fail-on-flaky-tests\`. The HTML report has a "Flaky" filter: that is your to-do list.

**\`testInfo.retry\`** is 0 on the first attempt, 1 on the first retry, and so on. Use it to clear server state before retrying, or to log extra detail.

**Serial mode caveat.** In \`test.describe.configure({ mode: 'serial' })\` a failure **skips the following tests**, and on retry **the whole group runs again**, including the ones that already passed. That is why the docs recommend independent tests.`,
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
        'Failure → worker + browser discarded → fresh worker reruns beforeAll → retry.',
        'flaky = failed then passed; the build is green unless --fail-on-flaky-tests.',
        'Serial groups retry as a whole; isolated tests retry alone.',
      ],
      source: 'Playwright docs — Retries; Command line (--fail-on-flaky-tests)',
    },
    {
      heading: 'Proving a fix: --repeat-each, isolation and quarantine',
      body: `**Intuition:** you cannot prove a coin is fair with one toss. A test that fails 1 time in 50 will pass a single run 98% of the time, so "it passed once after my change" proves nothing.

**Stress it on purpose:**
- \`npx playwright test checkout.spec.ts --repeat-each=50 --retries=0\` runs every test 50 times with no retries to hide failures.
- Add \`--workers=4\` (or more) to create CPU contention similar to CI, and \`--project=webkit\` if the flake is browser-specific.
- \`-x\` / \`--max-failures=1\` stops at the first failure, saving time once you know it is still broken.
- \`npx playwright test --last-failed\` re-runs only what failed last time.

**Isolation checks:** run the test **alone** (\`file:line\`), then **in its file**, then **in the whole suite**. Passes alone but fails in the suite = shared state or order dependence. Fails alone = timing or environment.

**Quarantine, not deletion.** When a fix will take days, tag the test (\`{ tag: '@quarantine' }\`) and exclude it from the PR gate with \`--grep-invert @quarantine\`, while a nightly job still runs it. Give every quarantined test an owner and a ticket; otherwise quarantine becomes a graveyard. \`test.fixme()\` skips it with a visible reason.`,
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
        'Alone vs file vs suite tells you timing vs shared state.',
        'Quarantine with an owner and ticket; do not silently skip.',
      ],
      source: 'Playwright docs — Command line; Annotations (tags, fixme)',
    },
    {
      heading: 'A triage playbook: passes locally, fails in CI',
      body: `**Intuition:** when a test only fails in CI, something about CI is different. Your job is to find *which* difference matters, using evidence instead of guesses.

**The differences that usually matter:**
| Difference | Typical symptom | Check |
|---|---|---|
| Slower / fewer CPUs | timeouts, actions starting before render | trace action durations; reduce workers |
| Headless vs headed | hover/focus or font rendering differs | run locally headless |
| Viewport / locale / timezone | element off-screen, date assertions wrong | trace Metadata; pin them in config |
| Clean environment | missing seed data, no logged-in state | does the test create its own data? |
| Parallel workers | tests collide on the same account | unique data per worker |
| Network / env URL | 3rd-party script blocked, staging down | trace Network tab |
| Different browser version | WebKit-only failure | match the Playwright version / Docker image |

**Steps:**
1. Download the **HTML report** artifact; open the failed test; open its **trace**.
2. Read Errors → Actions → Snapshot → Log → Network (see the trace section).
3. Reproduce locally with CI-like settings: \`CI=1 npx playwright test file:line --repeat-each=30 --workers=4\` (headless).
4. Classify: test bug (fix the wait/data), environment issue (fix config/infra), or **product bug** (file it with the trace attached).
5. Fix, prove with \`--repeat-each\`, and track the flaky count going down.

**In interviews, say this:** "I don't rerun until green. I open the trace from the failed CI attempt, identify whether it's timing, data, or environment, reproduce under CI conditions, fix the root cause and verify with repeat-each."`,
      keyPoints: [
        'CI-only failure = find the environmental difference.',
        'The trace from the failed attempt is the primary evidence.',
        'Classify before fixing: test bug, env issue, or product bug.',
      ],
      source: 'Playwright docs — Trace viewer; Continuous Integration; Parallelism',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-debug-flaky-cc-1',
      title: 'Make the fruit list test deterministic',
      context:
        'This test against the Playwright API-mocking demo fails about 1 run in 8 on CI and almost never locally. The trace of a failed run shows the `waitForResponse` call timing out after 30s even though the Network tab shows the fruits request completing at 0.4s.',
      task: 'Find every source of non-determinism (there are at least four) and rewrite the test so it passes or fails only because of app behaviour, never timing.',
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
        'When is the fruits request sent relative to `page.goto`? Can it finish before `waitForResponse` starts listening?',
        'What happens to the `if (isVisible())` branch when the list is still empty? Does the test fail or silently pass?',
        '`toHaveCount`, `toHaveText` and `not.toHaveCount(0)` retry; `count()` and `textContent()` do not.',
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
      explanation: `**Fixes, one per smell:**
- **Race on \`waitForResponse\`.** The request fires during \`goto\`; on a fast run it finished before the listener existed, so the wait hung for 30s. Creating the promise first and awaiting it after \`goto\` removes the race.
- **\`waitForTimeout(2000)\` removed.** The test now waits for the real signal (list items), so it is both faster and safe on slow machines.
- **\`if (isVisible())\` removed.** That branch made the test *pass silently* when the list was empty: a false positive. \`not.toHaveCount(0)\` fails loudly.
- **\`textContent()\` snapshot replaced** with \`toHaveText\`, which retries.
- **Generic \`li\`** replaced with \`getByRole('listitem')\`, and the final check asserts a known fruit so the test verifies behaviour, not just "something rendered".
- \`expect(response).toBeOK()\` checks the 2xx range with a readable error message.`,
      followUps: [
        {
          q: 'Why did this fail mostly on CI and not locally?',
          a: 'Whether the fruits response arrives before or after `goto` resolves depends on the relative speed of page load and the API. Locally the page load usually finished first, so the listener was in place in time; on CI the API sometimes answered before `goto` returned, so the listener started too late and hung. The trace confirmed it: response at 0.4s, wait started after. Flakes live in relative timing, which is exactly what differs between environments.',
        },
        {
          q: 'How would you prove your rewrite is stable before merging?',
          a: 'Run it with `--repeat-each=100 --retries=0 --workers=4`, headless, ideally also in the CI pipeline on the PR branch. Zero failures across 100 runs gives strong evidence: a 1-in-8 flake would almost certainly appear. Then watch the HTML report flaky filter over the next week of CI runs.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-cc-2',
      title: 'Break the order dependence in a TodoMVC suite',
      context:
        'This file passes when run alone with 1 worker, fails randomly with `fullyParallel: true`, and when the first test fails on CI the retry also fails "because the todo already exists". Your lead asks you to make every test independent.',
      task: 'Rewrite the suite so each test can run alone, in any order, in parallel, and on a retry. Keep the same coverage.',
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
        'Which built-in fixture already gives every test a fresh, isolated page?',
        'Each test should create the state it needs. Could a small helper (or `beforeEach`) add a todo?',
        'Replace `count()` checks with `toHaveCount`, and the CSS chain with role/test-id locators.',
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
- **No shared \`page\` or \`beforeAll\`.** The built-in \`page\` fixture gives each test a new browser context, so localStorage (where TodoMVC keeps todos) starts empty. That is what makes retries and parallel runs safe.
- **Serial mode removed.** Tests no longer depend on each other, so one failure doesn't skip the rest and a retry re-runs only the failed test.
- **Each test builds its own state** through a small helper; the helper itself asserts the todo appeared, so later steps never race the render.
- **\`waitForTimeout\` and \`count()\` replaced** with \`toHaveCount\` and \`toHaveText\`, which retry.
- **Locators** use the app's \`data-testid\` attributes and role names instead of CSS chains.
- The third test now also checks that *only* completed todos are removed: better coverage than "list is empty".`,
      followUps: [
        {
          q: 'Isn\'t repeating the "add a todo" setup in every test slower?',
          a: 'Slightly per test, but parallel execution more than pays it back, and each failure now points to one behaviour. If setup is expensive (e.g. creating users), do it through an API or a fixture, not through the UI. Speed that depends on order is fake speed: it collapses as soon as you shard or retry.',
        },
        {
          q: 'When is serial mode actually justified?',
          a: 'Rarely: when a flow is a single business transaction whose steps cannot be set up independently, such as a multi-page wizard with server state that has no API. Even then, prefer one longer test with `test.step` blocks over several dependent tests, because a long test still retries as a unit and reports each step.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-debug-flaky-iq-01',
      difficulty: 'medium',
      question: 'A Playwright test is green on your laptop but red in the CI pipeline about a third of the time. Walk me through how you investigate.',
      whatInterviewerLooksFor: [
        'Uses evidence (trace, report, video) before changing code',
        'Knows the typical CI differences: CPU, headless, viewport, data, parallelism',
        'Reproduces under CI-like conditions with repeat-each and workers',
        'Classifies test bug vs environment vs product bug',
        'Does not "fix" by adding sleeps or retries',
      ],
      modelAnswer: `**1. Collect evidence.** Our CI config records \`trace: 'on-first-retry'\`, screenshots and video on failure, and uploads the HTML report as an artifact. I download it, open the failed test and its trace.

**2. Read the trace.** Errors tab for the failing call, then the action list: an action that took 30s was *waiting*; the Log tab tells me for what (not visible, covered by an overlay, not stable). I check the Before/After snapshots and the Network tab: did the API respond slowly or with a 500, or did my assertion run before the response?

**3. List what is different in CI:** fewer CPUs, headless, different viewport or timezone, empty database, several workers sharing an account, a staging service that is slow.

**4. Reproduce like CI:** \`CI=1 npx playwright test cart.spec.ts:18 --repeat-each=30 --retries=0 --workers=4\`. If it fails alone, it is timing/environment; if only within the suite, it is shared state or order.

**5. Fix the root cause:** replace sleeps or \`isVisible()\` checks with web-first assertions, register \`waitForResponse\` before the click, give each test unique data, pin locale/timezone, or mock a flaky third party.

**6. Prove and monitor:** repeat-each 100 with zero failures, then watch the flaky filter in reports. If the trace shows the *app* misbehaving (double-submit, stale data), I file a bug with the trace attached rather than masking it.`,
      followUps: [
        {
          q: 'The trace shows a click on "Checkout" that took 29 seconds before timing out. What do you look at next?',
          a: 'The Log tab for that action, which lists the actionability checks Playwright retried: for example "element is not visible" or "<div class=loading-overlay> intercepts pointer events". Then the Before snapshot to see what covered the button, and the Network tab to see which request the overlay was waiting on. The fix is usually to wait for the overlay to disappear via an assertion, not a sleep.',
        },
        {
          q: 'You cannot reproduce it locally even with repeat-each. Now what?',
          a: 'Make CI collect more: temporarily switch to `trace: \'on-all-retries\'` or `retain-on-failure` for that file, add `test.step` labels and `testInfo.attach` of relevant API responses. Run the suspect test in CI with `--repeat-each` on a branch. Also compare environments: the Docker image or Playwright version, the CI viewport, and whether other tests share its data.',
        },
        {
          q: 'Would you just increase the timeouts?',
          a: 'Only if the evidence shows the operation is legitimately slow in that environment, for example a report export that takes 12s on staging. Then I raise the timeout for that one assertion with `{ timeout: 15_000 }`, not globally. Raising timeouts across the board hides real performance regressions and makes failing runs much slower.',
        },
      ],
      pitfalls: [
        'Re-running the pipeline until green and calling it fixed.',
        'Adding `waitForTimeout` to "give it more time".',
        'Turning retries up to 5 without investigating.',
        'Never considering that the app itself might be at fault.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-02',
      difficulty: 'easy',
      question: 'What is a flaky test, how does Playwright report one, and is enabling retries a good fix?',
      whatInterviewerLooksFor: [
        'Precise definition: different results on unchanged code',
        'Knows the passed / flaky / failed categories',
        'Treats retries as mitigation, not a fix',
        'Mentions tracking flaky tests and --fail-on-flaky-tests',
      ],
      modelAnswer: `A **flaky test** passes and fails on the same commit without any code change. The cause is non-determinism: timing races, shared data, test order, or an unstable environment.

Playwright makes flakiness visible when retries are on. Every test ends in one of three states:
- **passed**: passed on the first attempt;
- **flaky**: failed at first, then passed on a retry;
- **failed**: failed the first attempt and all retries.

The HTML report has a "Flaky" filter, and the terminal summary counts flaky tests separately.

**Are retries a fix? No, they are a seatbelt.** I keep \`retries: 2\` on CI (the generated config does this) so one unlucky run doesn't block a whole team, and \`trace: 'on-first-retry'\` so every retry gives me a trace to debug. Locally retries stay at 0 so I see problems immediately.

But a flaky test still costs time and trust: each retry adds minutes to the pipeline, and a team that sees "flaky" every day stops believing red builds, which is how real bugs slip through. So I treat every flaky result as a ticket: read its trace, fix the cause, prove it with \`--repeat-each\`. For teams that want a hard rule, \`--fail-on-flaky-tests\` turns any flaky result into a failed build.`,
      followUps: [
        {
          q: 'Can a test marked flaky be hiding a real bug?',
          a: 'Yes. If the app has a race condition, such as a double-submit or stale cache that appears under load, the test will fail intermittently and pass on retry. Retries then hide a bug users will hit. That is why I read the trace of the failed attempt and decide whether the test or the app misbehaved before changing anything.',
        },
        {
          q: 'How many retries do you configure on CI and why?',
          a: 'Usually 1 or 2. One retry is enough to absorb a genuinely random infrastructure blip; more than 2 mostly hides problems and makes failing runs very slow, since each retry runs in a new worker with a new browser. I also keep retries at 0 locally so developers see flakiness while writing tests.',
        },
      ],
      pitfalls: [
        'Defining flaky as "a test that fails" (a failing test is not necessarily flaky).',
        'Saying retries solve flakiness.',
        'Not knowing Playwright labels flaky results separately.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-03',
      difficulty: 'medium',
      question: 'How do you configure and use the trace viewer? Why do teams choose on-first-retry instead of on?',
      whatInterviewerLooksFor: [
        'Knows the trace option values and their trade-offs',
        'Knows how to open a trace (show-trace, report, trace.playwright.dev)',
        'Can name what is inside a trace and how to read it',
        'Understands cost: recording every test slows runs and fills storage',
      ],
      modelAnswer: `**Config:** \`use: { trace: 'on-first-retry' }\` in \`playwright.config.ts\`, or \`--trace on\` on the command line for a one-off run.

| Value | Meaning |
|---|---|
| \`off\` | no traces |
| \`on\` | every test; heavy |
| \`on-first-retry\` | only when a failed test is retried the first time |
| \`on-all-retries\` | every retry |
| \`retain-on-failure\` | record all, keep only failures |

**Why \`on-first-retry\`:** passing tests (the vast majority) record nothing, so the suite runs at full speed and artifacts stay small. When a test fails, its retry records a trace, which is exactly the evidence I need. The catch: it needs \`retries > 0\`, and it captures the *retry*, not the original failure. If the retry passes, I still get a trace of a flaky test, which is useful. If I have no retries, \`retain-on-failure\` is the alternative.

**Opening:** from the HTML report (click the trace icon on the failed test), \`npx playwright show-trace trace.zip\`, or by dragging the zip into trace.playwright.dev, which processes it locally in the browser.

**Reading:** Errors and the red timeline marker first, then the Actions list with durations, Before/Action/After DOM snapshots that I can inspect like DevTools, the Log for actionability waits, Network for API status and timing, Console for page errors, Source for my test line, and Metadata for browser/viewport.`,
      followUps: [
        {
          q: 'Is a trace safe to attach to a public bug tracker?',
          a: 'Be careful. A trace includes DOM snapshots, network requests and responses with headers, and typed values, so it can contain tokens, cookies, passwords and personal data. Treat it like a log containing secrets: keep it in your CI artifacts with limited retention, or redact and use test accounts with fake data.',
        },
        {
          q: 'How is the trace different from a video?',
          a: 'A video is pixels only: you see what happened but cannot inspect the DOM, network or the locator used. A trace is structured: each action has DOM snapshots you can inspect, timings, the actionability log, network bodies and console. Video is nice for a non-technical audience; trace is what an engineer debugs with.',
        },
      ],
      pitfalls: [
        'Using `trace: \'on\'` in CI for every test and complaining about slow runs and huge artifacts.',
        'Setting on-first-retry while retries is 0, then wondering why no traces exist.',
        'Not knowing traces can contain secrets.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-04',
      difficulty: 'hard',
      question: 'You fixed a test that failed roughly once every 30 runs. How do you convince the team the fix actually works?',
      context: 'The team lead is skeptical because "it passed once" has been claimed before.',
      whatInterviewerLooksFor: [
        'Understands that one green run is not evidence',
        'Uses --repeat-each with retries off, and CI-like load',
        'Can reason about how many runs are enough',
        'Tracks the flaky rate after merge',
      ],
      modelAnswer: `**One pass proves almost nothing.** A test that fails 1 in 30 passes a single run about 97% of the time.

**1. Reproduce the failure first.** Before the fix, run \`--repeat-each=100 --retries=0 --workers=4\` on the original code. If I cannot make it fail, I cannot prove I fixed it. Here I'd expect roughly 3 failures in 100 runs.

**2. Run the same stress on the fix.** Same command, same machine, headless. Zero failures in 100 runs is strong evidence: the chance of a 1-in-30 flake passing 100 times in a row is (29/30)^100 ≈ 3.4%. For more confidence, 200 runs takes it below 0.2%.

**3. Do it under CI conditions.** Run the stress job on the PR branch in the real pipeline (same Docker image, same CPU, same parallelism), because many flakes only appear under CI timing.

**4. Explain the root cause, not just the result.** "The test read the cart badge before the add-to-cart request returned; it now asserts with \`toHaveText('1')\`, which retries." A causal explanation plus the stress numbers is much more convincing than a green tick.

**5. Monitor after merge.** Watch the HTML report's flaky filter or a dashboard of flaky counts for a week. If it shows up again, the fix was incomplete and it goes back to quarantine.`,
      followUps: [
        {
          q: 'The stress run passes locally 100/100, but the test still flakes on CI. What next?',
          a: 'Then the trigger is environmental, not purely timing on my machine. I would compare CI specifics: number of workers vs vCPUs, shared test accounts between parallel jobs, the base URL environment, viewport and timezone. Running the stress job inside the CI pipeline, and collecting traces with `on-all-retries`, usually reveals it.',
        },
        {
          q: 'Why turn retries off during the stress run?',
          a: 'With retries on, a failure followed by a pass is reported as flaky and the run stays green, so you can miss failures if you only look at the exit code. With `--retries=0`, every failure is a failure. You want the stress run to be as sensitive as possible.',
        },
      ],
      pitfalls: [
        '"It passed after my change, so it\'s fixed."',
        'Stress-testing with retries enabled.',
        'Not reproducing the failure before applying the fix.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-05',
      difficulty: 'medium',
      question: 'Which reporters would you configure for a Playwright suite that runs locally, in GitHub Actions, and in Jenkins? Why each one?',
      whatInterviewerLooksFor: [
        'Knows the built-in reporters and defaults',
        'Matches reporter to audience (human, CI server, merge step)',
        'Knows multiple reporters can run together',
        'Mentions artifacts and blob for sharding',
      ],
      modelAnswer: `I pick a reporter for each **reader** of the results.

**Locally:** \`list\` (the default) shows each test as it finishes, plus \`html\` with \`open: 'on-failure'\` so a browser opens with the report only when something broke.

**GitHub Actions:**
- \`dot\` (the CI default) keeps logs short;
- \`github\` adds failure annotations directly on the PR;
- \`html\` with \`open: 'never'\`, uploaded as an artifact with \`actions/upload-artifact\` and \`if: \${{ !cancelled() }}\` so failed runs still upload.
- If we shard, each shard uses \`blob\` instead, and a final job runs \`npx playwright merge-reports --reporter html ./all-blob-reports\` to produce one report.

**Jenkins:** \`junit\` with \`outputFile: 'results/junit.xml'\`; the JUnit plugin parses it to show a test results tab, history and trends, plus the HTML report archived via the HTML Publisher plugin.

**Optional:** \`json\` for custom dashboards, or \`allure-playwright\` if the organisation already uses Allure for history across runs.

All of this lives in one config: \`reporter: process.env.CI ? [...] : [...]\`, since reporters are an array of \`[name, options]\` tuples and can run together.`,
      followUps: [
        {
          q: 'Why does the HTML report need `open: \'never\'` on CI?',
          a: 'The default is `on-failure`, which tries to open a browser and serve the report when tests fail. On a headless CI runner that can block or waste time. Setting `never` (or `PLAYWRIGHT_HTML_OPEN=never`) just writes the folder, which you then upload as an artifact.',
        },
        {
          q: 'What does the blob reporter solve that html does not?',
          a: 'Each shard is a separate machine with only part of the results. If every shard produced its own HTML report you would have several partial reports. Blob reports keep raw results so `merge-reports` can combine all shards into a single HTML (or junit) report covering the whole run.',
        },
      ],
      pitfalls: [
        'Thinking only one reporter can be active.',
        'Forgetting to upload the report as an artifact, so it disappears with the runner.',
        'Not knowing blob/merge-reports for shards.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-06',
      difficulty: 'expert',
      question: 'Explain exactly what Playwright does when a test fails and retries are enabled. How does that interact with beforeAll, worker fixtures and serial mode?',
      whatInterviewerLooksFor: [
        'Knows the worker process and browser are discarded',
        'Knows beforeAll and worker-scoped fixtures run again in the new worker',
        'Knows serial groups retry together and later tests are skipped',
        'Can use testInfo.retry to make retries safe',
      ],
      modelAnswer: `**Mechanics.** Tests run in worker processes; each worker owns a browser. When a test fails, Playwright **throws away the whole worker process and its browser**, starts a new worker, and in that fresh worker:
1. runs the \`beforeAll\` hooks of the file/group again,
2. sets up worker-scoped fixtures again,
3. retries the failed test,
4. then continues with the remaining tests from that worker's queue.

Consequences:
- Anything in **module-level variables** from the old worker is gone; tests relying on it fail on retry.
- Expensive \`beforeAll\` / worker fixtures (e.g. seeding a database, logging in) **run again**. They must be idempotent: creating "user1" twice must not crash.
- Server-side state left by the failed attempt still exists. \`testInfo.retry\` (0 first, 1 on the first retry…) lets a test or fixture clean up or use a fresh unique name.

**Serial mode** (\`test.describe.configure({ mode: 'serial' })\`): if one test fails, the following tests in the group are **skipped**, and on retry **the entire group runs again from the first test**, including those that passed. So one flaky step makes the whole group slow and noisy. That is the main reason the docs recommend isolated tests.

**Reporting:** a test that failed then passed is **flaky**, otherwise **failed** after the last retry; \`--fail-on-flaky-tests\` makes flaky results fail the run.`,
      followUps: [
        {
          q: 'Why does Playwright restart the worker instead of just re-running the test?',
          a: 'A failed test may leave the browser or worker in a bad state: a hung page, a crashed context, corrupted worker fixtures. Starting from a fresh process guarantees the retry runs in a clean environment, so a pass on retry is meaningful and one failure cannot poison later tests in that worker.',
        },
        {
          q: 'How would you make a `beforeAll` that creates test users safe under retries?',
          a: 'Make it idempotent: generate unique usernames per worker and attempt (`testInfo.workerIndex`, `testInfo.retry` or a timestamp), or "get or create" via the API, and clean up in `afterAll`. Better still, move it into a worker-scoped fixture with teardown after `use()`, so creation and cleanup are paired.',
        },
      ],
      pitfalls: [
        'Believing a retry runs in the same browser.',
        'Expecting module variables set in an earlier test to survive a retry.',
        'Not knowing serial groups retry as a whole.',
      ],
    },
    {
      id: 'pw-debug-flaky-iq-07',
      difficulty: 'hard',
      question: 'You join a team where 40 of 600 Playwright tests are flaky and the PR pipeline is red half the time. What is your plan for the first month?',
      whatInterviewerLooksFor: [
        'Measures before acting (flaky list, frequency, cost)',
        'Restores trust quickly with quarantine + ownership',
        'Fixes by root-cause category, not test by test at random',
        'Adds guardrails to prevent new flakes',
      ],
      modelAnswer: `**Week 1: measure and stop the bleeding.**
- Make sure CI has \`retries: 2\`, \`trace: 'on-first-retry'\`, and uploads the HTML report so every failure has evidence.
- Build a flaky list from recent reports: test, failure rate, error message.
- Tag the worst offenders \`@quarantine\` and exclude them from the PR gate with \`--grep-invert @quarantine\`; a nightly job still runs them. Each gets an owner and a ticket. The PR pipeline becomes trustworthy again within days.

**Weeks 2–3: fix by category.** Reading traces, flakes cluster into a few causes:
- hard waits and \`isVisible()\`/\`textContent()\` assertions → web-first assertions;
- \`waitForResponse\` after the click → register first;
- shared accounts/data across workers → API-created unique data, fixtures with cleanup;
- third-party widgets and slow staging → \`page.route\` mocks;
- locale/timezone/viewport differences → pinned in config.
Fixing a category often fixes many tests at once. Each fix is proven with \`--repeat-each=100 --retries=0\` before it leaves quarantine.

**Week 4: guardrails.**
- ESLint rules (e.g. \`eslint-plugin-playwright\`) for \`waitForTimeout\`, missing \`await\`, \`page.pause\`.
- New or changed tests run with \`--repeat-each\` in the PR job (\`--only-changed\` helps select them).
- Track the flaky count per week; a test that turns flaky goes to quarantine with an owner the same day.`,
      followUps: [
        {
          q: 'A product manager says "just delete the flaky tests". How do you respond?',
          a: 'Each test exists because it covers a risk. Deleting it removes the signal, not the risk. Quarantine keeps the coverage running nightly without blocking PRs, with a deadline: if a test is not fixed or justified within, say, two sprints, we review whether the scenario is covered elsewhere (API or component tests) before deleting.',
        },
        {
          q: 'How do you stop new flaky tests from entering the suite?',
          a: 'Lint rules for known smells, code review checklists (no sleeps, unique data, web-first assertions), and running new or modified tests several times in the PR pipeline, e.g. `--only-changed --repeat-each=10`. A test that cannot pass 10 out of 10 doesn\'t get merged.',
        },
      ],
      pitfalls: [
        'Fixing tests one by one with no data on which hurt most.',
        'Quarantining without owners or deadlines.',
        'Setting retries to 5 to make the pipeline green.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-debug-flaky-drill-1',
      question:
        'Read this (simplified) trace of a failed CI run and name the root cause and the fix.\n\nActions: `goto /inventory 410ms` · `click "Add to cart" (backpack) 38ms` · `click cart link 52ms` · `expect(locator(".cart_item")).toHaveCount(1) 5.0s ✗`. Error: "Expected 1, received 0". Network: `POST /api/cart 201` starts at 0.45s, ends at 1.9s. Console: none. After snapshot of the cart click: cart page shows "Your cart is empty".',
      assumptions: [
        'The app adds items to the cart through an asynchronous `POST /api/cart`.',
        'The cart page loads its contents from the server when it opens.',
        'The test passes locally where the API answers in about 100ms.',
      ],
      steps: [
        { label: 'Locate the failing call', calc: 'toHaveCount(1) waited the full 5.0s expect timeout and still saw 0 items.' },
        { label: 'Check timing of the trigger', calc: 'Add-to-cart click at ~0.41s; POST /api/cart runs 0.45s → 1.9s (slow on CI).' },
        { label: 'Check what the test did meanwhile', calc: 'Cart link clicked at ~0.45s + 38ms ≈ 0.5s, long before the POST finished at 1.9s.' },
        { label: 'Explain the 0 items', calc: 'Cart page fetched its contents before the server stored the item → "empty" is rendered and never refreshed.' },
        { label: 'Decide: test or app?', calc: 'A fast user could hit this too, but the immediate test bug is navigating before the add completed. Raise a product question too.' },
      ],
      answer: `**Root cause:** a race between the add-to-cart request and navigation. The test opened the cart ~1.4s before \`POST /api/cart\` completed on the slow CI backend, so the cart page loaded empty. Locally the API answers in 100ms, hiding the race.

**Fix:** wait for the observable result of "add to cart" before navigating, e.g. \`await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1')\`, or register \`page.waitForResponse('**/api/cart')\` before the click and await it. Then navigate and assert.

**Also:** report to the team that the UI lets a user navigate before the cart is saved: possibly a real UX bug.`,
      insight: 'Long action durations and the Network tab timeline together usually reveal the race. Compare when the request ended with when the test moved on.',
      followUps: [
        {
          q: 'Why did increasing the expect timeout to 15s not help?',
          a: 'Because the cart page already rendered "empty" from a request made before the item was saved, and nothing re-fetches it. Waiting longer on a page that will never update cannot pass. The fix has to change *when* the test navigates, not how long it waits afterwards.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-drill-2',
      question:
        'A checkout test used to fail about 1 run in 50. After your fix, how many consecutive passing runs (`--repeat-each=N --retries=0`) do you need to be 95% confident the flake is gone (i.e. that a 1-in-50 flake would have shown up)?',
      assumptions: [
        'The original failure probability per run is p = 0.02 and runs are independent.',
        'We want the chance of seeing zero failures, if the bug were still there, to be ≤ 5%.',
      ],
      steps: [
        { label: 'Probability one run passes if still flaky', calc: '1 − 0.02 = 0.98' },
        { label: 'Probability N runs all pass', calc: '0.98^N' },
        { label: 'Set the condition', calc: '0.98^N ≤ 0.05' },
        { label: 'Solve with logs', calc: 'N ≥ ln(0.05) / ln(0.98) = (−2.996) / (−0.0202) ≈ 148.3' },
        { label: 'Round up', calc: 'N = 150 runs (≈ 3 × the "1 in 50" number)' },
        { label: 'Cost check', calc: '150 × 8s per run ÷ 4 workers ≈ 300s ≈ 5 minutes' },
      ],
      answer: `About **150 clean runs**. A handy rule ("rule of three"): to be 95% sure a 1-in-K failure is gone, you need about **3 × K** consecutive passes. With 4 workers and an 8-second test this is ~5 minutes, which is cheap insurance.`,
      insight: 'Ten or twenty green runs prove little for rare flakes; size the repeat count from the observed failure rate.',
      followUps: [
        {
          q: 'What if the original flake rate was 1 in 200?',
          a: 'Then you need about 3 × 200 = 600 clean runs for the same confidence, which is ~20 minutes at 8s per run on 4 workers. At that point it is often better to run the stress job in CI on the PR branch, and to keep monitoring the flaky rate in reports after merging.',
        },
      ],
    },
    {
      id: 'pw-debug-flaky-drill-3',
      question:
        'Your CI suite has 400 tests, average 10s each, 4 workers on one machine, `retries: 2`. On a typical run 12 tests fail on the first attempt; 10 of them pass on the first retry and 2 fail all retries. Estimate the extra wall-clock time retries add, and how the run is reported.',
      assumptions: [
        'Retries run in fresh workers and add roughly 3s of worker/browser startup each.',
        'Retried tests take the same 10s per attempt.',
        'Work spreads evenly across the 4 workers.',
      ],
      steps: [
        { label: 'Base run time', calc: '400 × 10s ÷ 4 workers = 1,000s ≈ 16.7 min' },
        { label: 'First retries', calc: '12 retries × (10s + 3s startup) = 156s of work' },
        { label: 'Second retries', calc: 'Only the 2 still failing: 2 × 13s = 26s of work' },
        { label: 'Total extra work', calc: '156 + 26 = 182s ÷ 4 workers ≈ 46s (but the 2-retry chains are serial: ≥ 26s on one worker)' },
        { label: 'Reported outcome', calc: '388 passed, 10 flaky, 2 failed → build is red because of the 2 failures' },
      ],
      answer: `Retries add roughly **45–60 seconds** (about 5%) to a ~17-minute run. The report shows **388 passed, 10 flaky, 2 failed**; the build is red because of the 2 failures, but the 10 flaky tests would *not* turn it red unless you pass \`--fail-on-flaky-tests\`.`,
      insight: 'Retries are cheap in time but expensive in trust: 10 flaky tests per run means 10 unknown risks every day. The time cost is the smallest part.',
      followUps: [
        {
          q: 'How would the time change with trace set to "on" instead of "on-first-retry"?',
          a: 'Recording traces for all 400 tests adds overhead to every test (snapshots, screenshots, writing zips), often 10–30% depending on the app, so the 16.7-minute run could become 19–22 minutes, plus much larger artifacts. With on-first-retry only the 12 retried tests pay that cost.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-debug-flaky-mcq-01',
      difficulty: 'easy',
      question: 'You want to step through one failing test line by line in a headed browser with the Playwright Inspector. Which command is best?',
      options: [
        'npx playwright test tests/cart.spec.ts:18 --debug',
        'npx playwright test --headed --retries=0',
        'npx playwright show-report',
        'npx playwright test --repeat-each=1 --trace on',
      ],
      correct: [0],
      explanation:
        'Giving file:line runs only that test, and `--debug` opens the Inspector headed with timeout 0 and one worker. `--headed` alone shows the browser but you cannot step through actions. `show-report` opens the HTML report of a finished run. A trace is recorded evidence to read afterwards, not an interactive step-through.',
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
      question: 'A checkout spec errors on attempt one, then succeeds when the runner tries it again. Which label does the HTML report give it?',
      options: ['passed', 'flaky', 'failed', 'skipped'],
      correct: [1],
      explanation:
        'Playwright uses three outcomes: passed (first attempt), flaky (failed first, passed on a retry) and failed (failed every attempt). It is not plain "passed" because the first attempt failed, and not "failed" because a retry succeeded. Skipped is for tests that never ran.',
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
      explanation:
        'The listener is created after the click, so on a fast backend the response has already finished and `waitForResponse` waits for a second one that never comes. Create the promise before the click and await it afterwards. `fill` does run actionability checks including editable; `waitForResponse` accepts globs, regexes and predicates; `status()` is synchronous.',
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
      options: ["trace: 'on'", "trace: 'on-first-retry'", "trace: 'off'", "trace: 'retain-on-failure'"],
      correct: [1],
      explanation:
        "`on-first-retry` records only when a failed test is retried, so passing tests record nothing and pay no cost. `on` records every test. `retain-on-failure` keeps only failing traces but still *records* every test, so passing tests are slowed. `off` gives you no evidence at all.",
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
      question: 'Which of these are real causes of flaky Playwright tests? Select ALL that apply.',
      options: [
        'Two parallel workers logging in as the same user and editing the same cart',
        'Using `await expect(locator).toHaveText()` instead of reading `textContent()`',
        'A test that relies on data created by the previous test in the file',
        'Asserting with `expect(await el.isVisible()).toBe(true)` right after a click',
        'Using `getByRole` instead of a CSS selector',
      ],
      correct: [0, 2, 3],
      explanation:
        'Shared accounts across workers, order dependence and one-shot `isVisible()` checks are classic flake sources. `toHaveText` is the fix for snapshot reads because it retries, and `getByRole` is the recommended, more resilient locator, so neither causes flakiness.',
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
      question: 'After a failure, what does the runner do before the second attempt starts?',
      options: [
        'The same browser page is reloaded and the test runs again',
        'The worker process and its browser are discarded; a new worker reruns beforeAll hooks, then the test',
        'Only the failed assertion is re-executed',
        'All tests in the whole run are restarted',
      ],
      correct: [1],
      explanation:
        'Playwright throws away the entire worker process and browser after a failure and starts a fresh worker, which reruns `beforeAll` and worker fixtures before retrying. It does not reuse the page, does not re-run just one assertion, and only retries the failed test (or the whole group in serial mode), not the full run.',
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
      question: 'With `retries: 1` on CI, this file sometimes reports "409 user already exists" on the second attempt only. Why?',
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
      explanation:
        'After a failure Playwright discards the worker; the new worker re-runs `beforeAll`, which posts the same fixed username again and the server rejects it. `beforeAll` runs once per worker, not once per test. The request fixture can be used in `beforeAll`. Retries never reuse the failed worker.',
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
      question: 'Which command gives the strongest evidence that a fix for an intermittent failure in `checkout.spec.ts` worked?',
      options: [
        'npx playwright test checkout.spec.ts --retries=3',
        'npx playwright test checkout.spec.ts --repeat-each=100 --retries=0 --workers=4',
        'npx playwright test checkout.spec.ts --last-failed',
        'npx playwright test checkout.spec.ts --headed',
      ],
      correct: [1],
      explanation:
        'Repeating each test 100 times with retries disabled and several workers makes a rare failure very likely to show, and nothing hides it. Retries hide failures by turning them into flaky passes. `--last-failed` reruns only once. Headed mode changes timing and runs once, so it proves little.',
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
      options: ["['junit', { outputFile: 'results.xml' }]", "['dot']", "['list']", "['line']"],
      correct: [0],
      explanation:
        'CI servers like Jenkins and Azure DevOps parse JUnit XML to build test tabs and trends. `dot`, `list` and `line` only print to the terminal, so the CI server has nothing structured to parse.',
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
      question: 'Which config keeps local runs fast but gives you a screenshot, video and trace for every CI failure? Select ALL lines that belong in `use` for CI.',
      options: [
        "screenshot: 'only-on-failure'",
        "video: 'retain-on-failure'",
        "trace: 'on-first-retry'",
        "video: 'on'",
        "screenshot: 'on'",
      ],
      correct: [0, 1, 2],
      explanation:
        "`only-on-failure`, `retain-on-failure` and `on-first-retry` all give evidence for failures while costing little or nothing for passing tests. `video: 'on'` and `screenshot: 'on'` produce artifacts for every test, which slows runs and bloats storage without adding debugging value for green tests.",
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
      explanation:
        '`isVisible()` does not wait; it returns the state at that instant, so the branch is skipped and the test passes without checking anything: a false positive. A web-first assertion would wait and fail. There is no strict-mode issue since only one element is involved, and nothing waits 30s here.',
      followUps: [
        {
          q: 'Fix it in one line.',
          a: "await expect(page.getByText('Thanks!')).toBeVisible(); — the assertion retries until the message appears and fails clearly if it never does.",
        },
      ],
    },
    {
      id: 'pw-debug-flaky-mcq-12',
      difficulty: 'medium',
      question: 'A test passes when run alone but fails intermittently when the whole suite runs with 6 workers. Which causes are the most likely? Select ALL that apply.',
      options: [
        'Tests share data (same user, same record) and collide',
        'The test depends on state left behind by another test',
        'The locator uses getByRole',
        'Resource contention: 6 workers on a small machine slow the app and the browser',
      ],
      correct: [0, 1, 3],
      explanation:
        'Passing alone but failing in the suite points to shared state, order dependence, or load from too many workers. Using `getByRole` is the recommended locator style and does not depend on what other tests do.',
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
      question: 'In a failed trace, the click on "Place order" has a duration of 29.8s and the Log tab repeats: `<div class="spinner-overlay"> intercepts pointer events`. What is the best fix?',
      options: [
        "await page.getByRole('button', { name: 'Place order' }).click({ force: true })",
        "await expect(page.locator('.spinner-overlay')).toBeHidden(); then click the button",
        'await page.waitForTimeout(5000) before the click',
        'Increase the test timeout to 60 seconds',
      ],
      correct: [1],
      explanation:
        'The overlay is covering the button while the app is busy; waiting until it is hidden reflects real user behaviour and passes as soon as the app is ready. `force: true` skips actionability checks and clicks through a busy UI, hiding a state a user would see. A fixed sleep is a guess, and a longer timeout just makes the failure slower if the overlay never leaves.',
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
      explanation:
        '`testInfo.retry` counts attempts starting at 0, and `--fail-on-flaky-tests` turns flaky results into a failed run. By default flaky tests do not fail the run, and retries are off by default; the generated config enables 2 only on CI via `process.env.CI`.',
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
      question: 'This config is used on CI with 2 retries. A test fails once and passes on retry. Which artifacts will exist for that test?',
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
      explanation:
        'The first attempt failed, so its video is retained and a failure screenshot is taken. The first retry records a trace because of on-first-retry, and it is kept even though that attempt passed. Artifacts are per attempt, so "eventually passed" does not delete the failed attempt\'s evidence, and passing tests elsewhere in the run record no trace.',
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
