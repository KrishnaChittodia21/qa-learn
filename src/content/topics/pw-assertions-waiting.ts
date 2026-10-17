import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-assertions-waiting',
  phase: 'pw-basics',
  order: 4,
  title: 'Assertions and Waiting: Auto-waiting, Web-first Assertions, Timeouts',
  subtitle:
    'How Playwright waits for a changing page: the checks before each action, checks that keep trying (web-first assertions), time limits, soft checks, expect.poll and toPass, and how to replace every fixed sleep.',
  estimatedMinutes: 105,
  sources: [
    'Playwright docs — Auto-waiting / actionability (playwright.dev/docs/actionability)',
    'Playwright docs — Assertions (playwright.dev/docs/test-assertions)',
    'Playwright docs — Timeouts (playwright.dev/docs/test-timeouts)',
    'Playwright docs — Best practices: use web-first assertions (playwright.dev/docs/best-practices)',
    'Playwright API reference — LocatorAssertions, PageAssertions, Locator.isVisible, Locator.waitFor, Page.waitForResponse, Page.waitForTimeout',
    'Checkly — Dealing with waits and timeouts in Playwright; Auto-waiting methods',
    'BrowserStack guide — Why you should not use page.waitForTimeout()',
    'Practice targets: the-internet.herokuapp.com (dynamic_loading/1 and /2, dynamic_controls) and saucedemo.com (performance_glitch_user, cart badge)',
  ],
  tags: ['playwright', 'assertions', 'expect', 'auto-waiting', 'actionability', 'timeouts', 'soft-assertions', 'expect-poll', 'toPass', 'flaky-tests'],
  cheatSheet: [
    'Actions wait until the element is ready (auto-waiting). click = visible + stable (not moving) + receives events (not covered) + enabled. fill = visible + enabled + editable. hover/dragTo skip enabled. press, focus, setInputFiles check nothing.',
    'Web-first assertion = `await expect(locator).toBeVisible()`. It looks at the page again and again until it passes or 5 s run out (the expect timeout). Always `await` it.',
    'Generic assertion = `expect(value).toBe(x)`. It checks a value once and never tries again. Fine for plain data; wrong for page state you read a moment ago.',
    '`expect(await loc.isVisible()).toBe(true)` is the classic trap. isVisible answers at once, so the check can run too early. Use `await expect(loc).toBeVisible()`.',
    'Defaults: test 30 s, expect 5 s. Action, navigation and global have no limit (the test limit stops them). Config: `timeout`, `expect: { timeout }`, `use: { actionTimeout, navigationTimeout }`, `globalTimeout`.',
    '`test.slow()` gives the test three times the time. `test.setTimeout(ms)` sets it. `{ timeout }` on one action or check changes only that call.',
    '`toHaveText` = full text (extra spaces ignored; string, regex or list). `toContainText` = part of the text. Also: `toHaveCount`, `toHaveValue`, `toHaveAttribute`, `toHaveClass`, `toHaveURL`, `toHaveTitle`, `toBeOK`.',
    '`expect.soft()` records a failure and keeps going; the test still fails at the end. Custom message: `expect(loc, \'cart badge after add\').toHaveText(\'1\')`.',
    '`expect.poll(fn)` repeats a function until its value passes (gaps 100, 250, 500, 1000 ms; limit 5 s). `expect(async () => {...}).toPass()` repeats a block (default limit 0 = until the test times out, so set one).',
    'Spinners and loading data: check the final result (`toBeVisible` on the result, `toBeHidden` on the loader). Use `page.waitForResponse` only when you need the response itself.',
    '`page.waitForTimeout()` is for debugging only: too short = random failures, too long = slow. `networkidle` is not recommended. Wait for a condition, never for a clock.',
  ],
  sections: [
    {
      heading: 'Why waiting is the hard part of UI automation',
      body: `**Example:** \`await expect(page.locator('#finish')).toBeVisible()\` → Playwright keeps checking until the result shows. It moves on the moment it appears.

Your test and the web app run at different speeds. The test runs as fast as the computer allows. The app waits for servers, animations and JavaScript. If the test checks too early, it fails, even though the app is fine.

A manual tester waits without thinking. You see the spinner, so you do not click yet. Automation must wait in the same way: **for a condition** (something becoming true), never for a fixed number of seconds.

Three ways to wait, from worst to best:

| Approach | Example | Problem |
|---|---|---|
| Fixed sleep | \`await page.waitForTimeout(3000)\` | Too short on a slow CI machine (fails), too long on a fast one (slow) |
| Home-made loop | \`while (!(await loc.isVisible())) {...}\` | Rebuilds what Playwright already does, usually with no time limit |
| Condition, checked again and again | \`await expect(loc).toBeVisible()\` | Waits exactly as long as needed, up to a bounded timeout |

Playwright has two built-in ways to wait:
1. **Auto-waiting before actions.** A click waits until the element can really be clicked.
2. **Web-first assertions.** An \`expect(locator)\` check keeps trying until the page shows what you expect.

With these two, almost every test needs no extra wait at all.

**Practice page:** on the-internet \`/dynamic_loading/1\`, clicking Start shows "Loading..." for about 5 seconds. Then "Hello World!" appears.
- \`waitForTimeout(3000)\` fails every time.
- \`waitForTimeout(6000)\` passes, but wastes time. It still fails when the server is slow.
- \`await expect(page.locator('#finish')).toBeVisible()\` passes the moment the text shows.

One catch: an \`expect\` check waits only **5 seconds** by default. This page also needs about 5 seconds. So give this check more time: \`{ timeout: 10_000 }\`.

**Watch out:** on this page, \`#finish\` is in the HTML from the start, just hidden. So \`toHaveText('Hello World!')\` alone passes too early. Check visibility first.

**Why testers care:** fixed sleeps are the top cause of **flaky tests**. A flaky test sometimes passes and sometimes fails, with no code change.`,
      diagram: `  time --->   0s        1s        2s        3s        4s        5s    6s
  app:        [click Start][ Loading... spinner ................ ][Hello]
  sleep(3000) ------------------------> check: FAIL (still loading)
  sleep(6000) ------------------------------------------------------> ok, 1s wasted
  expect(finish).toBeVisible({ timeout: 10_000 })
              retry . . . . . . . . . . . . . . . . . . . . . . . . -> PASS at ~5s`,
      keyPoints: [
        'Wait for a condition, never for a fixed time.',
        'Auto-waiting covers actions; web-first assertions cover checks.',
        'Know the time limits: a correct wait still fails if the limit is too short.',
      ],
      source: 'Playwright docs — Auto-waiting; Checkly — Dealing with waits and timeouts',
    },
    {
      heading: 'Auto-waiting and actionability checks',
      body: `**Example:** \`await page.getByRole('button', { name: 'Enable' }).click()\` → Playwright waits until the button is visible, not moving, enabled and not covered. Then it clicks.

**Auto-waiting** means Playwright waits until the element is ready before it acts. A careful person does the same. They check the button is there, still, not behind a popup and not greyed out. These checks are called **actionability checks**. Which checks run depends on the action.

**The five checks:**
- **Visible:** the element has a size and is not hidden. \`display:none\` is not visible. But **\`opacity:0\` counts as visible**.
- **Stable:** it is not moving (not animating).
- **Receives events:** nothing covers it. No popup, toast or cookie banner sits on top.
- **Enabled:** it is not disabled.
- **Editable:** it is enabled and not read-only.

**Which action waits for what** (from the official table):

| Action | Visible | Stable | Receives events | Enabled | Editable |
|---|---|---|---|---|---|
| \`click\`, \`dblclick\`, \`tap\` | Yes | Yes | Yes | Yes | - |
| \`check\`, \`uncheck\`, \`setChecked\` | Yes | Yes | Yes | Yes | - |
| \`hover\`, \`dragTo\` | Yes | Yes | Yes | - | - |
| \`screenshot\` | Yes | Yes | - | - | - |
| \`fill\`, \`clear\` | Yes | - | - | Yes | Yes |
| \`selectOption\` | Yes | - | - | Yes | - |
| \`selectText\` | Yes | - | - | - | - |
| \`scrollIntoViewIfNeeded\` | - | Yes | - | - | - |
| \`press\`, \`pressSequentially\`, \`focus\`, \`blur\`, \`dispatchEvent\`, \`setInputFiles\` | - | - | - | - | - |

If a check fails, Playwright tries again. It finds the element fresh each time. Actions have **no time limit of their own**. So in practice the 30 second test timeout stops them. The error then shows the last reason, like "element is not enabled".

\`{ force: true }\` skips these checks. Use it rarely. Never use it to get past a banner a real user would hit.

**Watch out:** auto-waiting answers "can I act on it?". It does not answer "has the app finished?". A button can be ready while its data is still loading. That is what assertions are for.

**In an interview, say:** "Before a click, Playwright checks visible, stable, receives events and enabled. For fill, it checks visible, enabled and editable. It keeps trying, so I add no waits before actions."

**Why testers care:** you delete most sleeps, and the error message tells you exactly why a click failed.`,
      code: [
        {
          language: 'typescript',
          title: 'Auto-waiting in action on the-internet dynamic controls',
          code: `import { test, expect } from '@playwright/test';

test('fill waits for the input to become enabled', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_controls');
  const input = page.locator('#input-example input[type="text"]');

  await expect(input).toBeDisabled();               // starts disabled
  await page.getByRole('button', { name: 'Enable' }).click();

  // No sleep: fill() keeps retrying until the input is visible, enabled, editable
  await input.fill('typed after enable');
  await expect(input).toHaveValue('typed after enable');
  await expect(page.locator('#message')).toHaveText("It's enabled!");
});

test('an action error tells you which check failed', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_controls');
  const input = page.locator('#input-example input[type="text"]');
  // Fails after 2s with a log like: "element is not enabled - retrying"
  await expect(input.fill('x', { timeout: 2000 })).rejects.toThrow(/Timeout/);
});`,
        },
      ],
      keyPoints: [
        'Five checks: visible, stable, receives events, enabled, editable. Each action uses some of them.',
        'opacity:0 counts as visible; display:none does not.',
        'Actions have no time limit of their own; the test timeout stops them.',
        '"Ready to click" is not "app finished": check the result with expect.',
      ],
      source: 'Playwright docs — Auto-waiting (actionability checks table)',
    },
    {
      heading: 'Web-first assertions: the catalog',
      body: `**Example:** \`await expect(badge).toHaveText('1')\` → Playwright asks "does the badge show 1 yet?" again and again. It passes as soon as the answer is yes.

A **web-first assertion** is a check that keeps trying on the live page. Each try looks at the page again. So it sees changes that happen after the check started.

All of them look like \`await expect(locatorOrPage).matcher(...)\`. They keep trying for up to **5 seconds** by default (the **expect timeout**). You must always \`await\` them.

**Locator checks (they keep trying):**

| Group | Matchers | Typical use |
|---|---|---|
| Presence & visibility | \`toBeVisible\`, \`toBeHidden\`, \`toBeAttached\`, \`toBeInViewport\` | Element shown, spinner gone |
| State | \`toBeEnabled\`, \`toBeDisabled\`, \`toBeEditable\`, \`toBeChecked\`, \`toBeFocused\`, \`toBeEmpty\` | Button disabled until form valid |
| Text | \`toHaveText\`, \`toContainText\` | Messages, labels, lists |
| Form value | \`toHaveValue\`, \`toHaveValues\` | Inputs, selects, multi-selects |
| Attributes | \`toHaveAttribute\`, \`toHaveClass\`, \`toContainClass\`, \`toHaveId\`, \`toHaveCSS\`, \`toHaveJSProperty\` | \`aria-expanded\`, active tab class |
| Count | \`toHaveCount\` | Number of rows, cart items |
| Accessibility | \`toHaveAccessibleName\`, \`toHaveAccessibleDescription\`, \`toHaveRole\`, \`toMatchAriaSnapshot\` | a11y checks, structure snapshots |
| Visual | \`toHaveScreenshot\` | Visual regression |

**Page checks:** \`toHaveURL\`, \`toHaveTitle\`.
**API response check:** \`await expect(response).toBeOK()\` passes for status 200–299.

Useful details:
- \`toBeHidden\` passes when the element is hidden **or not on the page at all**. Use it for "spinner gone" and "row deleted".
- \`toHaveCount(0)\` is the exact way to say "no rows".
- Any check accepts \`{ timeout }\` to change the time limit for that one call.

**In an interview, say:** "For anything on the page, I use web-first assertions, because they keep trying. I use plain \`expect(value)\` checks only for values I already have."

**Why testers care:** one such check replaces a sleep plus a check, so tests run faster and fail less.`,
      code: [
        {
          language: 'typescript',
          title: 'A tour of the most-used web-first assertions on SauceDemo',
          code: `import { test, expect } from '@playwright/test';

test('cart flow assertions', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await expect(page).toHaveTitle('Swag Labs');                     // page assertion
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await expect(page).toHaveURL(/inventory\\.html/);
  await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  await expect(page.locator('[data-test="product-sort-container"]')).toHaveValue('az');

  const badge = page.locator('[data-test="shopping-cart-badge"]');
  await expect(badge).toBeHidden();                                // not in DOM yet: passes

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await expect(badge).toHaveText('1');
  await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeEnabled();

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(['Sauce Labs Backpack']);
  await expect(page.locator('[data-test="checkout"]')).toHaveAttribute('id', 'checkout');
});`,
        },
      ],
      keyPoints: [
        'Shape: await expect(locator | page | response).matcher().',
        'It looks at the page again and again, for up to 5 s by default.',
        'toBeHidden also passes when the element is not on the page at all.',
      ],
      source: 'Playwright docs — Assertions; API reference LocatorAssertions and PageAssertions',
    },
    {
      heading: 'Generic vs web-first assertions (and the isVisible trap)',
      body: `**Example:** \`expect(await loc.isVisible()).toBe(true)\` → checks once, right now, and may fail. \`await expect(loc).toBeVisible()\` → keeps checking until it is visible.

A **generic assertion** like \`expect(value).toBe(x)\` checks a value once. It is like checking a photo. A web-first check watches a live video. If you took the photo half a second too early, it will always be wrong.

| | Generic (checks once) | Web-first (keeps checking) |
|---|---|---|
| Shape | \`expect(value).toBe(x)\` | \`await expect(locator).toHaveText(x)\` |
| Input | A value you already have | A locator / page / response |
| Tries again? | **No**, checks once | **Yes**, until it passes or times out |
| \`await\` | Not needed (synchronous) | **Required** |
| Examples | \`toBe\`, \`toEqual\`, \`toContain\`, \`toHaveLength\`, \`toBeTruthy\`, \`toMatch\`, \`toBeGreaterThan\`, \`toBeCloseTo\` | \`toBeVisible\`, \`toHaveText\`, \`toHaveCount\`, \`toHaveURL\`, \`toHaveValue\` |
| Use for | API JSON fields, computed arrays, numbers you calculated | Anything shown in the browser |

**The trap pairs** (left side fails sometimes, right side is correct):

| Fails sometimes | Correct |
|---|---|
| \`expect(await loc.isVisible()).toBe(true)\` | \`await expect(loc).toBeVisible()\` |
| \`expect(await loc.textContent()).toBe('1')\` | \`await expect(loc).toHaveText('1')\` |
| \`expect(await loc.count()).toBe(6)\` | \`await expect(loc).toHaveCount(6)\` |
| \`expect(page.url()).toContain('inventory')\` | \`await expect(page).toHaveURL(/inventory/)\` |
| \`expect(await loc.isChecked()).toBeTruthy()\` | \`await expect(loc).toBeChecked()\` |
| \`expect(await loc.inputValue()).toBe('az')\` | \`await expect(loc).toHaveValue('az')\` |

Why the left side fails sometimes: \`isVisible()\`, \`textContent()\`, \`count()\` and \`page.url()\` read the page **once, right now**. \`isVisible()\` does not wait at all. Putting the result inside \`expect\` adds no waiting.

**\`isVisible()\` is still fine for an "if".** Example: close a banner only if it shows. But if the test *must* see the element, use \`toBeVisible()\`.

**Generic assertions are still useful** for values that will not change. Examples: API JSON, or a list you read after \`toHaveCount\` passed.

**Watch out:** an \`expect(locator)\` check without \`await\` is a silent bug. The test can finish before the check runs. A lint rule like \`playwright/missing-playwright-await\` catches it.

**Why testers care:** this one swap fixes many random test failures in real projects.`,
      code: [
        {
          language: 'typescript',
          title: 'Same intent, flaky vs reliable',
          code: `import { test, expect } from '@playwright/test';

test('hidden element revealed after loading (dynamic_loading/1)', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/1');
  await page.getByRole('button', { name: 'Start' }).click();
  const finish = page.locator('#finish');

  // FLAKY: reads visibility once, immediately → false while "Loading..." shows
  // expect(await finish.isVisible()).toBe(true);

  // RELIABLE: retries until visible (page needs ~5s, so raise this call's timeout)
  await expect(finish).toBeVisible({ timeout: 10_000 });
  await expect(finish).toHaveText('Hello World!');
  await expect(page.locator('#loading')).toBeHidden();
});

test('generic assertions on data you already hold', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables');
  const due = page.locator('#table1 tbody td:nth-child(4)');
  await expect(due).toHaveCount(4);                 // web-first: wait for data
  const values = (await due.allTextContents()).map((t) => Number(t.slice(1)));
  expect(values).toEqual([50, 51, 100, 50]);        // generic: plain array
  expect(Math.max(...values)).toBeGreaterThan(99);
});`,
        },
      ],
      keyPoints: [
        'Generic = checks a value once; web-first = keeps checking the live page.',
        'isVisible, textContent, count and url read the page once; do not check them directly.',
        'Always await web-first assertions; a lint rule can catch a missing await.',
      ],
      source: 'Playwright docs — Best practices (use web-first assertions); Assertions (non-retrying assertions)',
    },
    {
      heading: 'Text, count and value assertions in depth',
      body: `**Example:** \`await expect(error).toContainText('Username is required')\` → passes if the error message contains those words anywhere.

Many bugs are "the right element shows the wrong words". So text checks must be exact where it matters.

**\`toHaveText\` vs \`toContainText\`:** \`toHaveText\` needs the full text to match. \`toContainText\` needs only a part.

| Element text | \`toHaveText('Hello')\` | \`toContainText('Hello')\` | \`toHaveText(/hello/i)\` |
|---|---|---|---|
| "Hello" | pass | pass | pass |
| "  Hello\\n" | pass (whitespace normalised) | pass | pass |
| "Hello World!" | **fail** (full match) | pass (substring) | pass (regex search) |
| "hello" | fail (case-sensitive) | fail | pass (\`i\` flag) |

- Extra spaces at the start and end are ignored.
- Add \`{ ignoreCase: true }\` to ignore upper and lower case.
- **A list** checks many elements in order: \`toHaveText(['A', 'B'])\`. It fails if the number of elements differs. So it also catches extra items.
- **A regex** (a text pattern) helps with changing parts: \`toHaveText(/Order #\\d+ confirmed/)\`.

**Counts:** \`toHaveCount(n)\` keeps trying until exactly n elements match. \`not.toHaveCount(0)\` means "at least one".

**Values:** \`toHaveValue\` reads what is in an input or dropdown right now. \`toBeEmpty()\` checks an empty input or an element with no text.

**Attributes and classes:** \`toHaveAttribute('aria-expanded', 'true')\`. For classes, \`toHaveClass(/active/)\` uses a regex, because the element may have more classes.

**Watch out:** do not check the text of the whole page. It breaks on every wording change. Check the smallest element that holds the meaning.

**Why testers care:** precise text checks catch wrong prices, wrong names and wrong error messages.`,
      code: [
        {
          language: 'typescript',
          title: 'Precise text and list assertions after sorting',
          code: `import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
});

test('Z to A sort shows names in reverse order', async ({ page }) => {
  const names = page.locator('[data-test="inventory-item-name"]');
  await page.locator('[data-test="product-sort-container"]').selectOption('za');

  // first and last, exact, retried until the re-render finishes
  await expect(names.first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  await expect(names.last()).toHaveText('Sauce Labs Backpack');
  await expect(names).toHaveCount(6);
});

test('error message: substring vs full text vs regex', async ({ page }) => {
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.locator('[data-test="login-button"]').click();       // empty form
  const error = page.locator('[data-test="error"]');
  await expect(error).toContainText('Username is required');
  await expect(error).toHaveText('Epic sadface: Username is required');
  await expect(error).toHaveText(/username is required/i);
});`,
        },
      ],
      keyPoints: [
        'toHaveText = full text; toContainText = part of the text; regex for changing parts.',
        'A list checks every element in order, and the count too.',
        'Check the smallest element that holds the meaning.',
      ],
      source: 'Playwright API reference — LocatorAssertions toHaveText, toContainText, toHaveCount',
    },
    {
      heading: 'Timeouts: test, expect, action, navigation',
      body: `**Example:** \`await expect(page).toHaveURL(/inventory/, { timeout: 15_000 })\` → this one check may wait up to 15 seconds. All other checks keep the normal 5 seconds.

A **timeout** is a time limit. Think of kitchen timers inside each other. The big timer (the test) rings if the whole recipe takes too long. The small timers (each check, each action) ring if one step gets stuck.

| Timeout | Default | Set globally | Override locally |
|---|---|---|---|
| Test (incl. \`beforeEach\` and fixtures setup) | **30 000 ms** | \`timeout: 60_000\` in config | \`test.setTimeout(120_000)\`, \`test.slow()\` (x3) |
| Expect (web-first assertions) | **5 000 ms** | \`expect: { timeout: 10_000 }\` | \`toHaveText('x', { timeout: 10_000 })\` |
| Action (click, fill...) | **none** | \`use: { actionTimeout: 10_000 }\` | \`click({ timeout: 10_000 })\` |
| Navigation (goto, waitForURL) | **none** | \`use: { navigationTimeout: 30_000 }\` | \`goto(url, { timeout: 30_000 })\` |
| Global (whole run) | none | \`globalTimeout: 60 * 60 * 1000\` | – |
| \`beforeAll\` / \`afterAll\` | 30 000 ms (own budget) | – | \`test.setTimeout()\` inside the hook |

Simple rules:
- Actions and page loads have **no limit of their own**. So a stuck click waits for the whole **test** timeout. The error says "Test timeout of 30000ms exceeded". Set \`actionTimeout\` (10–15 seconds) to get faster, clearer errors.
- A failed check says "Timed out 5000ms waiting for expect(locator)...". It also shows the value it last saw. Read that **received value** before you change any timeout.
- \`test.slow()\` marks one known-slow test. It gives that test three times the time.

**Watch out:** do not raise the global limit to fix one slow test. Every real failure then takes longer to report.

**Practice:** SauceDemo's \`performance_glitch_user\` logs in slowly on purpose. Give that one \`toHaveURL\` check \`{ timeout: 15_000 }\`.

**Why testers care:** the right limit makes slow pages pass and broken pages fail fast with a clear message.`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts timeouts and per-test overrides',
          code: `// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,                 // per test (default)
  globalTimeout: 60 * 60 * 1000,   // whole run: 1 hour cap for CI
  expect: { timeout: 5_000 },      // web-first assertions (default)
  use: {
    actionTimeout: 10_000,         // default is none; fail clicks faster
    navigationTimeout: 20_000,     // default is none
  },
});

// tests/slow.spec.ts
import { test, expect } from '@playwright/test';

test('slow login user', async ({ page }) => {
  test.slow();                                       // 30s → 90s for this test
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('performance_glitch_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory/, { timeout: 15_000 });   // this call only
});`,
        },
      ],
      keyPoints: [
        'Defaults: test 30 s, expect 5 s; action, navigation and global have no limit.',
        'A stuck action shows up as a test timeout unless actionTimeout is set.',
        'Give extra time to one call or one test (test.slow), not to the whole suite.',
      ],
      source: 'Playwright docs — Timeouts',
    },
    {
      heading: 'Negation, soft assertions and custom messages',
      body: `**Example:** \`await expect.soft(price, 'price').toHaveText('$29.99')\` → if the price is wrong, the failure is recorded. The test keeps going and checks the next field.

**\`.not\` flips a check.** \`await expect(badge).not.toBeVisible()\` waits until the badge is gone. It keeps trying too. For "gone", \`toBeHidden()\` reads more naturally and means the same.

**Watch out:** a "not" check right after a click can pass **too early**. The error may simply not have appeared yet. So first check the success state. Then check the error is absent.

**Soft assertions** are checks that do not stop the test. \`expect.soft(...)\` records a failure and carries on. At the end, the test is still marked **failed**. The report lists every soft failure.
- Good for: many separate fields on one screen, like name, price and description.
- Bad for: steps the rest depends on, like login. If login fails, later failures are just noise.
- To stop early: \`expect(test.info().errors).toHaveLength(0)\`.

**Custom messages** name a check in the report: \`await expect(badge, 'cart badge after adding backpack').toHaveText('1')\`. They help most in loops and helpers.

| Feature | Syntax | Test stops on failure? |
|---|---|---|
| Normal | \`await expect(loc).toBeVisible()\` | Yes |
| Negated | \`await expect(loc).not.toBeVisible()\` | Yes |
| Soft | \`await expect.soft(loc).toBeVisible()\` | No (fails at end) |
| With message | \`await expect(loc, 'why').toBeVisible()\` | Yes |

**Why testers care:** one run shows every wrong field on a screen, and the report says which check failed.`,
      code: [
        {
          language: 'typescript',
          title: 'Soft checks on a product page with clear messages',
          code: `import { test, expect } from '@playwright/test';

test('product details page shows correct data', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await page.getByText('Sauce Labs Backpack').click();

  // hard precondition: if this fails, nothing else is meaningful
  await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack');

  // independent checks: collect all failures in one run
  await expect.soft(page.locator('[data-test="inventory-item-price"]'), 'price').toHaveText('$29.99');
  await expect.soft(page.locator('[data-test="inventory-item-desc"]'), 'description').toContainText('carry.allTheThings()');
  await expect.soft(page.locator('[data-test="add-to-cart"]'), 'add button').toBeEnabled();

  // do not continue to checkout if any soft check failed
  expect(test.info().errors).toHaveLength(0);

  await page.locator('[data-test="add-to-cart"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]'), 'badge after add').toHaveText('1');
  await expect(page.locator('[data-test="add-to-cart"]')).toBeHidden();   // replaced by Remove
});`,
        },
      ],
      keyPoints: [
        '.not retries too, but check the success state before a "not" check.',
        'Soft assertions let the test continue, then fail it at the end.',
        'Custom messages make failures easy to read in the report.',
      ],
      source: 'Playwright docs — Assertions: negating matchers, soft assertions, custom expect message, expect.configure',
    },
    {
      heading: 'expect.poll and toPass: retrying things that are not locators',
      body: `**Example:** \`await expect.poll(() => getStatus()).toBe('SHIPPED')\` → Playwright calls \`getStatus()\` again and again until it returns "SHIPPED".

Web-first assertions only re-check things on the page. Sometimes you wait for something else: an API status, a saved value, a file. \`expect.poll\` and \`toPass\` give the same "keep asking" power to any code.

**\`expect.poll(fn)\`** calls your function again and again. It checks the **returned value** each time, until the check passes.
- Time limit: the expect timeout (5 seconds) by default.
- Gaps between tries: 100, 250, 500, then 1000 ms (repeated).
- Use it for: "the order shows SHIPPED in the API".

**\`expect(async () => { ... }).toPass()\`** repeats a **whole block** of steps until it runs with no error.
- Gaps between tries: the same, 100, 250, 500, 1000 ms.
- Time limit: **0 by default, which means no limit of its own.** It keeps trying until the **test** timeout. It does **not** use the 5 second expect timeout. So always pass \`{ timeout }\`.
- Use it for: click "Refresh", check the status, repeat until it changes.

| Need | Tool |
|---|---|
| Element state on the page | web-first assertion (\`toHaveText\`, ...) |
| A single value from a function (API, storage, file) | \`expect.poll(() => value).toBe(...)\` |
| A multi-step block that may need repeating | \`expect(async () => {...}).toPass({ timeout })\` |

**Watch out:** \`toPass\` repeats every step in the block. If the block clicks "Add", ten tries add ten items. Only put steps inside that are safe to repeat (like Refresh). If the condition is visible on the page, use a normal web-first assertion instead.

**Why testers care:** you can test slow background jobs, like order processing, without guessing sleeps.`,
      code: [
        {
          language: 'typescript',
          title: 'Polling an API value and retrying a refresh-and-check block',
          code: `import { test, expect } from '@playwright/test';

test('booking eventually appears in the API', async ({ request }) => {
  const created = await request.post('https://restful-booker.herokuapp.com/booking', {
    data: {
      firstname: 'Asha', lastname: 'Verma', totalprice: 150, depositpaid: true,
      bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' },
    },
  });
  await expect(created).toBeOK();                    // web-first for API responses
  const { bookingid } = await created.json();

  await expect.poll(async () => {
    const res = await request.get('https://restful-booker.herokuapp.com/booking/' + bookingid);
    return res.status();
  }, {
    message: 'booking should be readable',
    intervals: [500, 1_000, 2_000],
    timeout: 15_000,
  }).toBe(200);
});

test('refresh until the status updates', async ({ page }) => {
  await page.goto('/orders/42');                     // your app (baseURL)
  await expect(async () => {
    await page.getByRole('button', { name: 'Refresh' }).click();   // idempotent
    await expect(page.getByTestId('order-status')).toHaveText('Shipped', { timeout: 1_000 });
  }).toPass({ intervals: [1_000, 2_000, 5_000], timeout: 30_000 });
});`,
        },
      ],
      keyPoints: [
        'expect.poll repeats a function and checks its value; its limit is the expect timeout.',
        'toPass repeats a block; its default limit is 0 (until the test times out), so set one.',
        'Use them only when the thing you wait for is not on the page.',
      ],
      source: 'Playwright docs — Assertions: expect.poll, expect.toPass',
    },
    {
      heading: 'Dynamic elements: spinners, async data and network waits',
      body: `**Example:** \`await expect(page.locator('#finish')).toHaveText('Hello World!', { timeout: 10_000 })\` → Playwright waits through the loading spinner. It passes when the result appears.

Wait for what the user waits for. A user does not wait for "the spinner to go away". They wait for **their results**. Check the result, and the spinner takes care of itself.

**Patterns:**

| Situation | Best wait |
|---|---|
| Element appears after loading (the-internet \`/dynamic_loading/2\`, rendered after) | \`await expect(page.locator('#finish')).toHaveText('Hello World!', { timeout: 10_000 })\` |
| Element exists but hidden until loaded (\`/dynamic_loading/1\`) | \`toBeVisible\` first: \`toHaveText\` alone passes early because hidden text still counts |
| Spinner must disappear before an action that is otherwise enabled | \`await expect(spinner).toBeHidden()\` then act |
| Need the data from a network call | \`const resP = page.waitForResponse(r => r.url().includes('/api/orders') && r.ok())\`, trigger, \`await resP\` |
| Navigation after a click | \`await expect(page).toHaveURL(/thank-you/)\` or \`page.waitForURL\` |
| No assertion makes sense, only "be ready" | \`await locator.waitFor()\` (state \`visible\` by default; also \`attached\`, \`detached\`, \`hidden\`) |
| A JS condition in the page | \`await page.waitForFunction(() => window.appReady === true)\` |

**\`waitForResponse\`** waits for a server answer. It follows the same rule as new tabs: start waiting **before** the click, then \`await\` after. Use it when you need to check the response itself (status, body). The network topic covers this in depth.

**What not to do:**
- \`page.waitForTimeout(n)\`: the docs say it is for debugging only. Tests with fixed sleeps fail at random.
- \`waitForLoadState('networkidle')\`: not recommended. Background traffic can stop it from ever finishing.
- Loops around \`isVisible()\` with sleeps inside: a home-made, worse \`toBeVisible\`.

**Practice page:** the-internet \`/dynamic_loading/2\` adds \`#finish\` to the page only after about 5 seconds. \`toHaveText('Hello World!', { timeout: 10_000 })\` passes as soon as it appears.

**Why testers care:** loading screens are everywhere, and these patterns test them without random failures.`,
      code: [
        {
          language: 'typescript',
          title: 'Loader, rendered-later element and a response wait',
          code: `import { test, expect } from '@playwright/test';

test('element rendered after loading (dynamic_loading/2)', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/2');
  await page.getByRole('button', { name: 'Start' }).click();

  const loading = page.locator('#loading');
  await expect(loading).toBeVisible();                       // loader shows first
  await expect(page.locator('#finish')).toHaveText('Hello World!', { timeout: 10_000 });
  await expect(loading).toBeHidden();                         // and is gone after
});

test('wait for a specific API response when you need its data', async ({ page }) => {
  await page.goto('/orders');                                 // your app
  const ordersResponse = page.waitForResponse(
    (res) => res.url().includes('/api/orders') && res.request().method() === 'GET',
  );                                                          // listen first
  await page.getByRole('button', { name: 'Load orders' }).click();
  const res = await ordersResponse;
  expect(res.status()).toBe(200);
  const body = await res.json();
  await expect(page.getByRole('row')).toHaveCount(body.length + 1);   // + header row
});`,
        },
      ],
      keyPoints: [
        'Check the final result the user cares about; spinners take care of themselves.',
        'waitForResponse: start waiting before the click, await after.',
        'Use locator.waitFor() when you need "ready" but no check.',
      ],
      source: 'Playwright docs — Assertions; API reference Page.waitForResponse, Locator.waitFor, Page.waitForTimeout',
    },
    {
      heading: 'Choosing the right wait: a decision guide',
      body: `**Example:** a manual tester knows the page is ready when "It's gone!" shows. So the test says \`await expect(message).toHaveText("It's gone!")\`.

Before writing any wait, ask: "what would a person look at to know it is ready?". Then turn that into a check.

Most randomly failing tests come from four habits:
- fixed sleeps,
- one-time reads used as checks,
- a missing \`await\`,
- waiting for the wrong signal (network quiet instead of the screen).

The diagram below shows what to use instead.

**Selenium habits in Playwright** (interviewers often ask this):

| Selenium | Playwright equivalent |
|---|---|
| Implicit wait (global find timeout) | Not needed: locators find the element fresh each time, and actions auto-wait |
| Explicit wait \`WebDriverWait(...).until(visibilityOf(el))\` | \`await expect(loc).toBeVisible()\` |
| \`elementToBeClickable\` | Built into \`click()\` (actionability checks) |
| \`Thread.sleep(3000)\` | Nothing. Replace with a condition |
| Retrying on \`StaleElementReferenceException\` | Not needed: a locator looks up the element again each time |
| FluentWait (check every few ms) | \`expect.poll\` / \`toPass\` with \`intervals\` |

**Code review checklist for waits:**
1. Any \`waitForTimeout\`? Replace it with the condition it was waiting for.
2. Any \`expect(await ...isVisible() / textContent() / count())\`? Use a web-first check instead.
3. Is every \`expect(locator)\` and every action awaited?
4. Does every "not" check come after a success check?
5. Was a global timeout raised for one test? Move it to that call, or use \`test.slow()\`.
6. Any \`networkidle\`? Replace it with a screen or response check.

**Why testers care:** this checklist turns a randomly failing suite into a reliable one, one review at a time.`,
      diagram: `  What are you waiting for?
        |
        +-- to ACT on an element ------------> just act (auto-waiting)
        |
        +-- something VISIBLE on the page ---> await expect(locator).matcher()
        |      (text, count, state, URL)        (+ { timeout } if known slow)
        |
        +-- something to DISAPPEAR ----------> await expect(loc).toBeHidden()
        |                                      after a positive anchor
        +-- data from a network call --------> p = page.waitForResponse(...)
        |                                      trigger; await p
        +-- a value outside the DOM ---------> await expect.poll(fn).toBe(x)
        |
        +-- a multi-step retry --------------> await expect(async()=>{...})
        |                                      .toPass({ timeout })
        +-- "just a moment" -----------------> STOP. Find the real condition.`,
      code: [
        {
          language: 'typescript',
          title: 'Selenium-style waits rewritten the Playwright way',
          code: `import { test, expect } from '@playwright/test';

test('dynamic controls: remove and re-add the checkbox', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_controls');
  const checkbox = page.locator('#checkbox');
  const message = page.locator('#message');

  // Selenium habit: Thread.sleep + isDisplayed checks. Playwright: conditions.
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(message).toHaveText("It's gone!");            // positive anchor
  await expect(checkbox).toBeHidden();                        // then the absence

  await page.getByRole('button', { name: 'Add' }).click();
  await expect(message).toHaveText("It's back!");
  await expect(checkbox).toBeVisible();

  // the same locator works again: no stale element problem
  await checkbox.check();
  await expect(checkbox).toBeChecked();
});`,
        },
      ],
      keyPoints: [
        'Ask what a person looks at, then check that.',
        'Selenium explicit waits become web-first assertions; implicit waits are not needed.',
        'Use the checklist in code review to remove flaky waits.',
      ],
      source: 'Playwright docs — Best practices; Checkly — Auto-waiting methods',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-assertions-waiting-cc-1',
      title: 'Hard sleeps and isVisible() used as an assertion',
      context:
        'This test for the-internet dynamic_loading/1 passes on the author\'s laptop. In CI it fails about once in four runs. It also takes 8 seconds, even when the page is fast.',
      task: 'Remove every fixed sleep and every one-time check. The test should wait only as long as needed. It should give a clear failure message. It must still fail if "Hello World!" never appears.',
      starter: {
        language: 'typescript',
        title: 'dynamic-loading.spec.ts (flaky)',
        code: `import { test, expect } from '@playwright/test';

test('shows Hello World after loading', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/1');
  await page.waitForTimeout(2000);                     // "let the page settle"

  await page.click('#start button');
  await page.waitForTimeout(6000);                     // loading takes ~5s

  const loadingGone = await page.locator('#loading').isHidden();
  expect(loadingGone).toBeTruthy();

  const visible = await page.locator('#finish').isVisible();
  expect(visible).toBe(true);

  const text = await page.locator('#finish h4').textContent();
  expect(text).toBe('Hello World!');
});`,
      },
      hints: [
        'Which lines read the page once, and which ones keep trying?',
        'The page takes about 5 seconds. The default expect timeout is also 5 seconds. Where should a longer limit go?',
        'The first sleep waits for nothing special. What does goto already wait for?',
      ],
      solution: {
        language: 'typescript',
        title: 'dynamic-loading.spec.ts (reliable)',
        code: `import { test, expect } from '@playwright/test';

test('shows Hello World after loading', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/1');

  await page.getByRole('button', { name: 'Start' }).click();   // auto-waits

  const finish = page.locator('#finish');
  // one retrying assertion replaces the 6s sleep and isVisible()
  await expect(finish, 'result shown after loading').toBeVisible({
    timeout: 10_000,                                  // page needs ~5s; default is 5s
  });
  await expect(finish).toHaveText('Hello World!');   // replaces textContent + toBe
  await expect(page.locator('#loading')).toBeHidden();
});`,
      },
      explanation: `Each change and why:

1. **First \`waitForTimeout(2000)\` removed.** \`goto\` already waits for the page to load. \`click\` already waits for the button to be ready. The sleep waited for nothing.
2. **\`page.click('#start button')\` → \`getByRole('button', { name: 'Start' })\`.** A locator based on what the user sees.
3. **\`waitForTimeout(6000)\` removed.** It was a guess. On a slow CI machine 6 seconds is not enough (the 1-in-4 failure). On a fast one it wastes time. The check now waits only as long as needed.
4. **\`isHidden()\` / \`isVisible()\` + \`toBeTruthy\` / \`toBe(true)\` → \`toBeHidden()\` / \`toBeVisible()\`.** The \`is...()\` methods answer at once and never try again. They only worked because of the sleep before them.
5. **\`textContent()\` + \`toBe\` → \`toHaveText\`.** It keeps trying, ignores extra spaces and shows expected vs received on failure.
6. **Visibility first, text second.** \`#finish\` is on the page (hidden) from the start. So \`toHaveText\` alone would pass before loading ends. \`toBeVisible\` is the real "ready" signal.
7. **Extra time only where needed.** Only this check knows the page is slow. So it gets \`{ timeout: 10_000 }\`. The normal 5 second limit stays for all other checks.
8. **Custom message** names the check in the report.

Result: the test takes about 5 seconds instead of 8+. It fails only when the text truly never appears.`,
      followUps: [
        {
          q: 'Why not just set expect.timeout to 10 seconds in the config?',
          a: 'Then every failing check in the suite takes twice as long to report. It can also hide real slowness on other pages. Only this one page is slow by design. So the extra time belongs on this one call. If many pages are slow in one environment, change the config for that project instead.',
        },
        {
          q: 'Why not just assert toHaveText and drop toBeVisible?',
          a: 'On dynamic_loading/1, #finish is in the HTML from the start, just hidden. toHaveText reads text even when it is hidden. So toHaveText alone passes at once, before loading ends. The test would miss a broken loader. The visibility check proves the user can see the result. The text check then proves it is the right result.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-cc-2',
      title: 'Generic assertions on live page state',
      context:
        'A SauceDemo cart test sometimes fails with "Expected: 2, Received: 1". Sometimes it passes even when the badge is wrong. A reviewer suspects missing awaits and one-time reads.',
      task: 'Rewrite the checks so every page check keeps trying and every check is awaited. The test must fail clearly if the cart badge or URL is wrong.',
      starter: {
        language: 'typescript',
        title: 'cart.spec.ts (unreliable)',
        code: `import { test, expect } from '@playwright/test';

test('two items in cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  expect(page.url()).toContain('inventory');                  // snapshot

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

  const badge = await page.locator('[data-test="shopping-cart-badge"]').textContent();
  expect(Number(badge)).toBe(2);

  await page.locator('[data-test="shopping-cart-link"]').click();
  const count = await page.locator('[data-test="inventory-item"]').count();
  expect(count).toEqual(2);
  expect(page.locator('[data-test="checkout"]')).toBeVisible();   // no await
});`,
      },
      hints: [
        'Find the four places where a value is read once and then compared.',
        'Which check returns a Promise that nobody awaits?',
        'There are checks for URL, text, count and visibility that take the locator or page directly.',
      ],
      solution: {
        language: 'typescript',
        title: 'cart.spec.ts (reliable)',
        code: `import { test, expect } from '@playwright/test';

test('two items in cart', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();
  await expect(page).toHaveURL(/inventory\\.html/);

  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
  await expect(page.locator('[data-test="shopping-cart-badge"]'), 'badge after two adds').toHaveText('2');

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL(/cart\\.html/);
  await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText([
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
  ]);
  await expect(page.locator('[data-test="checkout"]')).toBeVisible();
});`,
      },
      explanation: `Fixes:

1. **\`expect(page.url()).toContain(...)\` → \`await expect(page).toHaveURL(...)\`.** \`page.url()\` is read once, maybe before the page has changed.
2. **\`textContent()\` + \`Number()\` + \`toBe(2)\` → \`toHaveText('2')\`.** The badge updates a moment after the second click. Reading it once gave "1" on fast runs. The new check keeps trying until it sees "2".
3. **\`count()\` + \`toEqual(2)\` → \`toHaveText([...])\` on item names.** It keeps trying until the cart shows exactly these two items, in order. That is stronger than a count. It also catches a wrong product.
4. **The missing \`await\` added to \`expect(...).toBeVisible()\`.** Without it, the test could finish before the check ran. So it sometimes "passed" with a broken checkout button.
5. **A URL check for the cart page was added** before checking its content. The badge check also got a custom message.`,
      followUps: [
        {
          q: 'How would you catch missing awaits automatically across the suite?',
          a: 'Turn on lint rules. `@typescript-eslint/no-floating-promises` flags any promise without await. eslint-plugin-playwright has `missing-playwright-await` just for expect and actions. Run the linter in CI, so the pull request fails before review.',
        },
        {
          q: 'When is reading count() and using a generic assertion acceptable?',
          a: 'When you need the number for more logic, and the list will not change any more. For example, after `toHaveCount` or `toHaveText` already passed, or on a page that never changes. The rule: first wait with a web-first check, then read once.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-assertions-waiting-iq-1',
      difficulty: 'medium',
      question: 'Explain auto-waiting in Playwright. What does it check before a click, and how is it different from implicit and explicit waits in Selenium?',
      whatInterviewerLooksFor: [
        'Names the readiness (actionability) checks correctly',
        'Knows the checks differ per action (fill vs click)',
        'Knows actions have no time limit of their own',
        'Separates action waiting from assertion retrying',
        'Maps Selenium waits to Playwright correctly',
      ],
      modelAnswer: `**Auto-waiting** means every action waits until the element is ready for that action. It keeps trying until a time limit.

**Before a click**, Playwright checks that the element is:
1. **Visible:** it has a size and is not hidden. (\`opacity:0\` still counts as visible.)
2. **Stable:** it is not moving or animating.
3. **Receives events:** nothing covers it, like a banner or popup.
4. **Enabled:** it is not disabled.

It also scrolls the element into view. Other actions use other checks. \`fill\` checks visible, enabled and **editable**. \`press\` and \`setInputFiles\` check nothing.

**Time limit:** actions have no limit of their own. So a stuck click waits for the whole 30 second test timeout, unless \`actionTimeout\` is set. The error shows which check kept failing.

**Assertions are the other half.** \`await expect(loc).toHaveText('2')\` keeps trying for up to 5 seconds. Auto-waiting says "I can act". Assertions say "the app shows the right result".

**Compared with Selenium:**
- **Implicit wait** only waits for an element to exist. Playwright locators find the element fresh on every action. There is no global wait to tune.
- **Explicit waits** are written by hand for each step. In Playwright, "clickable" is built into \`click()\`. \`visibilityOf\` becomes \`await expect(loc).toBeVisible()\`.
- **StaleElementReferenceException** does not happen, because a locator stores nothing.

So I write no waits before actions, and every expectation is a web-first assertion.`,
      followUps: [
        {
          q: 'Does auto-waiting guarantee the data on the page is loaded?',
          a: 'No. It only means the element can be used. A Submit button can be visible and enabled while the form is still loading its values. If the test needs the data, check the data first. For example, check the value in a field or the number of rows in a table.',
        },
        {
          q: 'Why would you set actionTimeout if there is no default?',
          a: 'To fail faster and more clearly. Without it, a click on a covered button uses the full 30 seconds. The error is then reported as a test timeout. With actionTimeout at 10–15 seconds, the error points at the click. Time is also left for clean-up and saving the trace.',
        },
      ],
      pitfalls: [
        'Saying "present in the page" is the only check',
        'Saying Playwright has an implicit wait setting',
        'Saying actions check the result of the action',
        'Thinking opacity:0 elements count as hidden',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-2',
      difficulty: 'easy',
      question: 'What is the difference between expect(await locator.isVisible()).toBe(true) and await expect(locator).toBeVisible()? Which do you use?',
      whatInterviewerLooksFor: [
        'Knows isVisible answers at once without waiting',
        'Explains checks that keep trying (web-first assertions)',
        'Sees why the first one fails at random',
        'Knows when isVisible is still fine',
      ],
      modelAnswer: `**\`expect(await locator.isVisible()).toBe(true)\`**
- \`isVisible()\` checks **once, right now**, and returns true or false. It does not wait.
- \`toBe(true)\` then compares that saved value. It cannot try again, because it only has the old value.
- If the element appears 200 ms later, the test fails. It passes only when timing is lucky. That is a classic **flaky test** (passes sometimes, fails sometimes).

**\`await expect(locator).toBeVisible()\`**
- A web-first assertion. It looks at the page again and again, until the element is visible or 5 seconds pass.
- On failure, it prints the locator, what it expected and what it found. That is much easier to debug.

I always use the second one in tests. The same goes for \`textContent()\` vs \`toHaveText\`, \`count()\` vs \`toHaveCount\`, \`isChecked()\` vs \`toBeChecked\`, and \`page.url()\` vs \`toHaveURL\`.

**When \`isVisible()\` is fine:** in an "if", where both answers are OK. Example: close a promo banner only if it shows: \`if (await promo.isVisible()) await promo.getByRole('button', { name: 'Close' }).click()\`. Even then, I prefer to turn the promo off with a cookie. Tests with "if" can hide bugs.

The official best practices page uses exactly this pair as its "don't / do" example.`,
      followUps: [
        {
          q: 'What does the failure output look like for each?',
          a: 'The first says "Expected: true, Received: false". It gives no clue about which element or why. The second names the locator. It says it waited 5000ms for toBeVisible. It also shows a call log, like "locator resolved to <div id=finish style=display:none>". That points straight at the cause.',
        },
        {
          q: 'Would await expect(locator.isVisible()).resolves.toBe(true) fix it?',
          a: 'No. `.resolves` only unwraps the promise. isVisible still runs once and answers at once. Nothing tries again. The fix is to pass the locator itself to expect and use a locator check like toBeVisible.',
        },
      ],
      pitfalls: [
        'Thinking that putting it inside expect adds waiting',
        'Adding waitForTimeout before isVisible to "fix" it',
        'Not naming the similar one-time reads (textContent, count)',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-3',
      difficulty: 'medium',
      question: 'Your test fails with "Timed out 5000ms waiting for expect(locator).toHaveText(expected)". How do you debug it, and which timeouts exist in Playwright?',
      whatInterviewerLooksFor: [
        'Reads expected vs received before touching any timeout',
        'Knows all defaults (test 30 s, expect 5 s, action and navigation none)',
        'Uses the trace viewer or UI mode to see the page',
        'Adds extra time only where it is needed',
        'Can tell a slow app from a wrong expectation',
      ],
      modelAnswer: `**Step 1: read the error, not the timeout.** The message shows the locator, the expected text and the **received** text from the last try. It also shows a call log. Three common cases:
- **Received a different text** (like "1" instead of "2"): the app or my expectation is wrong. More time will not help.
- **The locator found nothing:** wrong locator, an iframe, or the page never changed.
- **The right text appears later in the trace:** the app really is slower than 5 seconds.

**Step 2: look at the page at that moment.** I open the **trace viewer**. A trace is a recording of the test: page snapshots, network calls and console at each step. I run with \`--trace on\`, or use \`trace: 'on-first-retry'\` in CI. Locally, UI mode or \`--debug\` lets me step through.

**Step 3: fix the cause.** Fix the locator or the expectation. If the app is slow by design, give only that call more time: \`toHaveText('2', { timeout: 15_000 })\`. Or mark the test \`test.slow()\`. If the app got slower, that is a bug to report.

**Timeouts and defaults:**

| Timeout | Default | Config |
|---|---|---|
| Test | 30s | \`timeout\` |
| Expect | 5s | \`expect.timeout\` |
| Action | none | \`use.actionTimeout\` |
| Navigation | none | \`use.navigationTimeout\` |
| Global | none | \`globalTimeout\` |

For one call: \`{ timeout }\`. For one test: \`test.setTimeout\`, or \`test.slow()\` (three times). The test timeout also covers \`beforeEach\` and fixture setup.

**What I avoid:** raising the expect timeout to 30 seconds for everyone, and adding \`waitForTimeout\` before the check.`,
      followUps: [
        {
          q: 'A click hangs and the error says "Test timeout of 30000ms exceeded". Why not an action timeout?',
          a: 'Because actions have no time limit by default. So the click is stopped only by the test timeout. The report still shows the click as the step that was running, with its log, like "element is not enabled - waiting". Setting `actionTimeout` makes the click itself fail sooner, with a clearer error.',
        },
        {
          q: 'How does test.slow() differ from test.setTimeout(90_000)?',
          a: 'test.slow() multiplies the configured test timeout by three. So it follows any config change. It also says clearly "this test is known to be slow". setTimeout sets a fixed number. Both affect only that test. slow() can take a condition too, like `test.slow(browserName === \'webkit\', \'slow on WebKit\')`.',
        },
      ],
      pitfalls: [
        'Raising timeouts at once without reading the received value',
        'Saying the default action timeout is 30 s or 5 s',
        'Raising timeouts for the whole suite because of one slow page',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-4',
      difficulty: 'medium',
      question: 'What are soft assertions in Playwright? Give a scenario where you would use them and one where you would not.',
      whatInterviewerLooksFor: [
        'Correct meaning: the test keeps running, then fails at the end',
        'Good use: many separate checks on one screen',
        'Bad use: steps that later steps depend on',
        'Knows how to stop early with test.info().errors',
      ],
      modelAnswer: `**What they are:** \`expect.soft(...)\` records a failed check but lets the test go on. At the end, the test is marked **failed**. The report lists every soft failure. They work with page checks (\`await expect.soft(loc).toHaveText(...)\`) and with plain value checks.

**Good use: one screen, many separate fields.** A product page shows name, price, description, image and the Add button. If the price is wrong, I still want to know if the description is wrong too. I want that in the same run, not after five fix-and-rerun rounds:

- \`await expect.soft(price, 'price').toHaveText('$29.99')\`
- \`await expect.soft(desc, 'description').toContainText('carry.allTheThings()')\`
- \`await expect.soft(addButton, 'add button').toBeEnabled()\`

Similar uses: all columns of a table row, a set of footer links, all fields of an order confirmation.

**Bad use: steps that others depend on.** Login, page changes and "item added to cart" must be **normal (hard)** checks. If login fails softly, every later step fails too. The report fills with noise that hides the real cause.

**Stopping early:** before a step that depends on the soft checks, add \`expect(test.info().errors).toHaveLength(0)\`. If any soft check failed, the test stops there.

**Shortcut:** \`const softExpect = expect.configure({ soft: true })\` for a group of soft checks.

**My rule:** hard checks for steps the rest depends on. Soft checks for separate details on one page. Each soft check gets a custom message, so the report reads like a checklist.`,
      followUps: [
        {
          q: 'Does a soft assertion failure trigger a retry?',
          a: 'Yes, because the test ends as failed. If retries are set, the whole test runs again. If it then passes, the report marks it as flaky. Soft assertions change when the test stops, not whether it fails.',
        },
        {
          q: 'How is this different from wrapping assertions in try/catch?',
          a: 'try/catch swallows the error. The test passes unless you throw it again, and the report loses the details. Soft assertions keep the full report (expected, received, call log) and still fail the test. Catching assertion errors by hand is a bad practice.',
        },
      ],
      pitfalls: [
        'Saying soft assertions let the test pass with warnings',
        'Using soft assertions for login or page changes',
        'Replacing soft assertions with try/catch',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-5',
      difficulty: 'medium',
      question: 'A page shows a loading spinner for a few seconds while it fetches orders from an API. How do you wait for it correctly, without hard waits?',
      whatInterviewerLooksFor: [
        'Checks the final result, not the spinner',
        'Uses toBeHidden for the spinner when needed',
        'Uses waitForResponse in the right order when the data matters',
        'Avoids networkidle and waitForTimeout',
        'Thinks about empty and error states',
      ],
      modelAnswer: `**Rule:** wait for what the user waits for: the orders, not the spinner.

**1. Check the result directly.** \`await expect(page.getByRole('row')).toHaveCount(6)\` or \`await expect(page.getByRole('cell', { name: 'ORD-1001' })).toBeVisible()\`. The check keeps trying while the spinner shows. It passes when the data arrives. If loading takes more than 5 seconds by design, add \`{ timeout: 15_000 }\` to that call.

**2. Check the spinner only when it matters.** Sometimes a field is usable under the spinner, but gets reset when loading ends. Then first \`await expect(page.getByTestId('spinner')).toBeHidden()\`, then act. \`toBeHidden\` also passes if the spinner is removed from the page.

**3. When I need the server's answer itself:**
- \`const ordersRes = page.waitForResponse(r => r.url().includes('/api/orders') && r.ok());\` (no await yet)
- start the load (click or goto)
- \`const res = await ordersRes; const orders = await res.json();\`
- check the screen matches the data: \`toHaveCount(orders.length + 1)\`, counting the header row.
Starting the wait before the click means a fast response is never missed.

**4. Other states:** an empty result should show "No orders". A server error (500) should show an error message. I test those by faking the server's answer (mocking), covered in the network topic.

**What I avoid:**
- \`waitForTimeout(3000)\`: fails on slow CI, wastes time on fast machines.
- \`waitForLoadState('networkidle')\`: not recommended. Background traffic can stop it from finishing, and it does not prove the screen is ready.
- \`not.toBeVisible()\` on the spinner right after opening the page. It may pass before the spinner even appeared.`,
      followUps: [
        {
          q: 'The spinner sometimes appears for only 50 ms. Should you assert it appears?',
          a: 'Only if showing a spinner is a requirement. Then fake a slow server answer (a route with a delay), so the check gives the same result every time. Checking a 50 ms flash against a real server fails at random. The important check is the final result.',
        },
        {
          q: 'What if two requests to /api/orders happen (prefetch and real)?',
          a: 'Make the match more exact. Check the query string, the method or a header, for example `r.url().includes(\'/api/orders?page=1\') && r.request().method() === \'GET\'`. Or check only the screen, which does not care how many calls were made.',
        },
      ],
      pitfalls: [
        'Waiting for the spinner with a sleep',
        'Starting waitForResponse after the click',
        'Using networkidle as the normal "ready" signal',
        'Ignoring empty and error states',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-6',
      difficulty: 'hard',
      question: 'When would you use expect.poll, when expect(...).toPass, and when a normal web-first assertion? What are the defaults and the dangers?',
      whatInterviewerLooksFor: [
        'Picks the tool by what is being waited for (page, value, block)',
        'Knows the default gaps and limits, especially toPass timeout 0',
        'Warns about repeated side effects inside toPass',
        'Gives real examples',
      ],
      modelAnswer: `**Web-first assertion:** whenever the thing is **on the page** and a locator can see it: text, count, visibility, URL. This covers most tests and gives the best error messages.

**\`expect.poll(fn).matcher()\`:** when the thing is **one value** that comes from code, not from the page.
- Examples: an API status after a UI action, a value in \`localStorage\`, the size of an exported file, a row count in a test database.
- Defaults: limit = the expect timeout (5 seconds). Gaps between tries: 100, 250, 500, 1000 ms.
- Example: \`await expect.poll(async () => (await request.get('/api/order/42')).status(), { timeout: 15_000 }).toBe(200)\`.

**\`expect(async () => {...}).toPass()\`:** when a **block** of steps must be repeated together.
- Example: click "Refresh", then check the status cell. Repeat until it says "Shipped".
- Defaults: the same gaps. But the **limit is 0**, which means no limit of its own. It keeps trying until the **test** times out. It does not use the 5 second expect timeout. So I always set \`{ timeout }\`.
- Checks inside the block should get short limits (about 1 second), so each try is quick.

**Dangers:**
- **Repeated side effects:** if the block clicks "Add to cart", every try adds another item. Only put steps inside that are safe to repeat (refresh, read, check).
- **Hiding real bugs:** wrapping a randomly failing check in \`toPass\` can hide a real timing bug in the product. Use these tools for slow background work (jobs, queues), not to cover a wrong locator.
- **Long silent waits:** \`toPass\` without a limit can use the whole 30 second test time.

**Summary:** on the page → web-first. One value → \`poll\`. Several steps → \`toPass\` with a clear limit.`,
      followUps: [
        {
          q: 'Could you replace expect.poll with a for-loop and waitForTimeout?',
          a: 'You could, but you would rebuild the gaps, the total limit and a good error message by hand. Such loops often have bugs, like no upper limit or hidden errors. expect.poll does all of that in one line. On failure it also shows the last value it received.',
        },
        {
          q: 'Why give inner assertions in toPass a short timeout?',
          a: 'Each try should fail fast, so the outer loop can try again. With the normal 5 second inner limit and a 30 second outer limit, you get only about five tries. Each try waits the full 5 seconds before refreshing. That wastes time and is hard to reason about.',
        },
      ],
      pitfalls: [
        'Believing toPass uses the 5 s expect timeout by default',
        'Putting steps that are not safe to repeat inside toPass',
        'Using poll or toPass for plain page checks',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-7',
      difficulty: 'expert',
      question: 'You join a team whose Playwright suite has around 200 waitForTimeout calls and 25% of tests are flaky. How do you plan and carry out removing them safely?',
      context: 'The suite runs on GitHub Actions with retries: 2. Management wants fewer flaky reruns without pausing feature testing.',
      whatInterviewerLooksFor: [
        'Measures before changing (flaky rate, time spent sleeping)',
        'Starts with the biggest impact',
        'Has a clear replacement for each kind of sleep',
        'Stops sleeps coming back with lint and review rules',
        'Proves each fix with repeated runs and traces',
      ],
      modelAnswer: `A **flaky test** passes sometimes and fails sometimes, with no code change. Here is my plan.

**1. Measure first.**
- Count sleeps per file: \`grep -rn waitForTimeout tests/\`. 200 sleeps of about 2 seconds is about 400 seconds of pure waiting per run.
- From CI reports, list tests that passed only on retry in the last few weeks. Rank files by how often they flake and how often they run.

**2. Sort each sleep by what it waits for.** Almost every sleep waits for one of a few things:

| Sleep is waiting for | Replace with |
|---|---|
| Element to appear / change | \`await expect(loc).toBeVisible()\` / \`toHaveText\` |
| Loader to go away | \`await expect(spinner).toBeHidden()\` after a success check |
| Navigation | \`await expect(page).toHaveURL(...)\` |
| API data | \`page.waitForResponse\` started before the click |
| Element to be clickable | Nothing: actions auto-wait |
| Slow background work | \`expect.poll\` with a clear timeout |

In the same pass, I remove one-time checks like \`isVisible()\` and \`textContent()\`. They only worked because of the sleeps.

**3. Work in small pull requests.** Biggest impact first, one feature area per PR. Reviews stay quick and feature work goes on.

**4. Prove each PR.** Run the changed tests with \`--repeat-each=20\`, locally and in CI. Keep traces on failure (\`trace: 'retain-on-failure'\`). A change is done when all repeats pass and the tests run faster.

**5. Stop sleeps coming back.** Add the lint rules \`playwright/no-wait-for-timeout\` and \`no-floating-promises\`. Make them errors for new code. Add a review checklist item. Set \`actionTimeout\` so stuck actions fail clearly.

**6. Report results.** Show flaky rate, suite time and rerun minutes saved, before and after. Managers then see clear value.

If a sleep hides a real product timing bug, I file a bug instead of adding another workaround.`,
      followUps: [
        {
          q: 'Some tests still flake after removing sleeps. What next?',
          a: 'Open the trace from a failed repeat. Look at what the page showed at the failing step. Common causes: tests running at the same time share test data, tests depend on each other\'s order, animations, or real app timing bugs. Fix test isolation first (unique data per test). Then report app bugs with the trace attached.',
        },
        {
          q: 'Should retries be set to 0 during this work?',
          a: 'Keep retries in CI so delivery is not blocked. But track "flaky" (passed on retry) as a number and treat it as a failure for this clean-up. Locally, run with retries 0 and --repeat-each, so random failures show up instead of being hidden.',
        },
      ],
      pitfalls: [
        'Rewriting all 200 in one big pull request',
        'Replacing sleeps with networkidle everywhere',
        'Not measuring before and after',
        'No lint rule, so sleeps come back within weeks',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-assertions-waiting-drill-1',
      question: 'Timeout arithmetic: config is the defaults (test 30s, expect 5s, no actionTimeout). A test does: goto (2s), fill username and password (0.2s), click Login on a button that a permanent cookie overlay covers, then `await expect(page).toHaveURL(/inventory/)`. When does the test fail, which line is blamed, and what changes if you add `use: { actionTimeout: 10_000 }`?',
      assumptions: [
        'The overlay never disappears',
        'beforeEach and fixture setup take 1s and count toward the test timeout',
        'No retries',
      ],
      steps: [
        { label: 'Time used before the click', calc: '1s setup + 2s goto + 0.2s fills = 3.2s' },
        { label: 'Click waits for "receives events"', calc: 'No action timeout → waits until the test budget runs out: 30s − 3.2s = 26.8s' },
        { label: 'Failure without actionTimeout', calc: 'At t = 30s: "Test timeout of 30000ms exceeded", pending step = click, log says overlay intercepts pointer events. toHaveURL never runs.' },
        { label: 'With actionTimeout 10s', calc: 'Click fails at 3.2s + 10s = 13.2s with "locator.click: Timeout 10000ms exceeded" and the same intercept reason.' },
      ],
      answer: 'Without actionTimeout the test fails at **30s** as a test timeout blamed on the click; with actionTimeout 10s it fails at **about 13.2s** with a click-specific timeout error. In both cases the assertion is never reached.',
      insight: 'Actions have no time limit of their own. So a stuck action uses up the whole test time. Setting actionTimeout makes failures faster and clearer. It also leaves time for clean-up and saving the trace.',
      followUps: [
        {
          q: 'Would increasing the test timeout to 60s help this test?',
          a: 'No. The banner never goes away. A longer timeout only delays the same failure by 30 more seconds. The fix is to handle the banner: accept cookies, or set the consent cookie before the test. If users are blocked too, report it as a bug.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-drill-2',
      question: 'Classify each line as RETRYING or ONE-SHOT, and rewrite the one-shot ones that check page state: (1) `await expect(page).toHaveTitle(\'Swag Labs\')` (2) `expect(await rows.count()).toBe(4)` (3) `expect(total).toBe(251)` where total is a number you computed (4) `await expect(badge).toHaveText(\'2\')` (5) `expect(await toast.isHidden()).toBeTruthy()` (6) `expect(page.url()).toMatch(/cart/)` (7) `await expect.poll(() => getStatus()).toBe(\'DONE\')` (8) `expect(await input.inputValue()).toBe(\'lohi\')`',
      assumptions: [
        'rows, badge, toast and input are Locators',
        'getStatus() is an async function that calls an API',
        'All page elements may update asynchronously',
      ],
      steps: [
        { label: 'Retrying', calc: '(1) page assertion, (4) locator assertion, (7) expect.poll → keep as is' },
        { label: '(2) one-shot on page state', calc: 'await expect(rows).toHaveCount(4)' },
        { label: '(3) one-shot on plain data', calc: 'Fine: a computed number does not change; generic assertion is correct' },
        { label: '(5) one-shot on page state', calc: 'await expect(toast).toBeHidden()' },
        { label: '(6) one-shot on page state', calc: 'await expect(page).toHaveURL(/cart/)' },
        { label: '(8) one-shot on page state', calc: 'await expect(input).toHaveValue(\'lohi\')' },
      ],
      answer: 'Retrying: **1, 4, 7**. One-shot: **2, 3, 5, 6, 8**. Of the one-shot ones, only **3** is acceptable as written (plain data). Rewrite 2 → `toHaveCount(4)`, 5 → `toBeHidden()`, 6 → `toHaveURL(/cart/)`, 8 → `toHaveValue(\'lohi\')`.',
      insight: 'The real question is: "can this value still change?". Live page state needs a check that keeps trying. Data you already calculated does not.',
      followUps: [
        {
          q: 'Line (3): how do you make sure the computed total was based on loaded data?',
          a: 'Put a web-first check before the one-time read. For example, `await expect(rows).toHaveCount(4)`, or `toHaveText` on the last row. Then read allTextContents and calculate. The first check makes sure the table has finished loading before you read it.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-drill-3',
      question: 'Estimate the time saved: a suite of 150 tests contains 300 `waitForTimeout` calls averaging 2.5s each. Replacing them with web-first assertions, the real waiting at those points averages 0.4s. The suite runs on 4 workers, 20 times a day in CI. How much wall-clock time per run and CI-minutes per day are saved, ignoring flakiness?',
      assumptions: [
        'Sleeps are spread evenly across workers',
        'Each CI run uses 4 workers on one machine (4 parallel slots)',
        'No retries, no other changes',
      ],
      steps: [
        { label: 'Sleep time per run (serial)', calc: '300 × 2.5s = 750s' },
        { label: 'Real waiting after the change (serial)', calc: '300 × 0.4s = 120s' },
        { label: 'Saved, serial', calc: '750 − 120 = 630s' },
        { label: 'Saved wall-clock per run', calc: '630s ÷ 4 workers ≈ 157s ≈ 2.6 minutes' },
        { label: 'Saved per day', calc: '2.6 min × 20 runs ≈ 52 minutes of wall-clock; machine time ≈ 630s × 20 = 12,600s = 210 worker-minutes' },
      ],
      answer: 'About **2.6 minutes faster per run** (≈157s), about **52 minutes of pipeline wall-clock per day**, and about **210 worker-minutes per day** of compute. The bigger gain is usually flakiness: fewer retries and fewer people re-running jobs.',
      insight: 'Fixed sleeps cost time on every run, even when the app is fast. They still fail when it is slow. Web-first checks win on both speed and reliability. With numbers, that is easy to explain to a manager.',
      followUps: [
        {
          q: 'Add flakiness: 10% of tests used to retry once (avg 20s each). What else is saved?',
          a: '15 tests × 20s = 300s of retry time per run. On 4 workers that is about 75s of real time. People also lose time looking at red builds. If the clean-up halves the flaky rate, you save about 37s more per run. That is about 12 minutes per day, on top of the sleep savings.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-assertions-waiting-mcq-01',
      difficulty: 'easy',
      question: 'On a page like dynamic_loading/1, the result is revealed a moment after clicking Start (well within 5 s). What does this assertion do?',
      code: {
        language: 'typescript',
        code: `await page.getByRole('button', { name: 'Start' }).click();
expect(await page.locator('#finish').isVisible()).toBe(true);`,
      },
      options: [
        'Waits up to 5 seconds for #finish to become visible, then passes',
        'Checks visibility once, immediately; it fails because #finish is still hidden',
        'Waits up to 30 seconds (the test timeout) for #finish',
        'Throws a syntax error because isVisible cannot be awaited',
      ],
      correct: [1],
      explanation:
        'isVisible() answers at once with the current state and never tries again. toBe(true) only compares that saved true/false value. So it fails while "Loading..." still shows. "Waits up to 5 seconds" describes await expect(locator).toBeVisible(), not this code. Nothing here waits for the test timeout, and isVisible returns a promise that can be awaited.',
      followUps: [
        {
          q: 'Rewrite it correctly.',
          a: 'await expect(page.locator(\'#finish\')).toBeVisible(); This page can take about 5 seconds in other versions, so add { timeout: 10_000 } if needed.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-02',
      difficulty: 'easy',
      question: 'On a slow CI agent a "Saved" toast appears 7 seconds after clicking Save. The project uses Playwright\'s default settings. What happens to `await expect(toast).toBeVisible()`?',
      options: [
        'It passes at about 7 s, because assertions wait until the 30 s test timeout',
        'It fails after about 5 s, because the expect timeout ends before the toast appears',
        'It fails immediately, because the toast is not in the DOM yet',
        'It passes, because toBeVisible waits for the network to become idle first',
      ],
      correct: [1],
      explanation:
        'Web-first checks keep trying only for the expect timeout, which is 5 seconds by default. A toast that needs 7 seconds comes too late. The 30 second limit is the test timeout, a different limit. The check does not fail at once, because trying again is the whole point. It never waits for the network to go quiet.',
      followUps: [
        {
          q: 'What is the right fix if 7 s is expected behaviour on that environment?',
          a: 'Give that one check more time: await expect(toast).toBeVisible({ timeout: 10_000 }). If the whole CI environment is slower, raise expect.timeout only for the CI project in the config.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-03',
      difficulty: 'easy',
      question: 'A cart test sometimes passes even though the checkout button is missing. What is wrong with the last line?',
      code: {
        language: 'typescript',
        code: `await page.locator('[data-test="shopping-cart-link"]').click();
expect(page.locator('[data-test="checkout"]')).toBeVisible();`,
      },
      options: [
        'toBeVisible cannot be used on data-test locators',
        'The web-first assertion is not awaited, so the test can finish before the check settles',
        'expect needs a custom message as its second argument',
        'toBeVisible only works after page.waitForLoadState()',
      ],
      correct: [1],
      explanation:
        'Web-first checks return a promise. Without await, nothing waits for it. The test can end before the check finishes, so the failure may be lost or shown in the wrong place. toBeVisible works with any locator. A custom message is optional. No extra load wait is needed, because the check keeps trying by itself.',
      followUps: [
        {
          q: 'How do you catch this mistake automatically?',
          a: 'Turn on @typescript-eslint/no-floating-promises or the missing-playwright-await rule from eslint-plugin-playwright. Run lint in CI, so the pull request fails.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-04',
      difficulty: 'medium',
      question: 'Select ALL that apply: which of these assertions retry automatically until the timeout?',
      options: [
        "await expect(page.locator('#status')).toHaveText('Saved')",
        "await expect(page).toHaveURL(/dashboard/)",
        "expect(await page.locator('#status').textContent()).toBe('Saved')",
        "expect(items).toHaveLength(3)   // items is an array",
        "await expect(page.getByRole('row')).toHaveCount(5)",
      ],
      correct: [0, 1, 4],
      explanation:
        'toHaveText, toHaveURL and toHaveCount are web-first checks on a locator or page. They look at the page again until they pass. The textContent version reads the text once, and toBe compares a fixed string. toHaveLength on an array is a generic check on a value you already have, so it cannot change between tries.',
      followUps: [
        {
          q: 'When is the array toHaveLength perfectly fine?',
          a: 'When the array is plain data that will not change. For example, parsed API JSON, or a list read after a web-first check proved the page had loaded.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-05',
      difficulty: 'medium',
      question: 'The element\'s text is "Hello World!". Which assertion fails?',
      code: {
        language: 'typescript',
        code: `const msg = page.locator('#finish');
await expect(msg).toContainText('Hello');          // A
await expect(msg).toHaveText('Hello');             // B
await expect(msg).toHaveText(/hello world/i);      // C
await expect(msg).toHaveText('  Hello World!  ');  // D`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [1],
      explanation:
        'toHaveText with a string needs the full text to match (extra spaces at the ends are ignored). "Hello" is not "Hello World!", so B fails. A passes, because toContainText needs only part of the text. C passes, because the regex ignores case and finds a match. D passes, because spaces at the start and end are ignored.',
      followUps: [
        {
          q: 'Which would you choose for an error message that includes a dynamic order id?',
          a: 'A regex with toHaveText, for example toHaveText(/^Order #\\d+ confirmed$/). The fixed words are checked exactly, and only the id may change.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-06',
      difficulty: 'medium',
      question: 'After deleting a row, the app removes the <tr> element from the DOM entirely. Which assertion correctly confirms the row is gone?',
      options: [
        "await expect(row).toBeHidden()",
        "expect(await row.isVisible()).toBe(false) immediately after the click",
        "await expect(row).toBeVisible({ timeout: 0 })",
        "await expect(row).toHaveText('')",
      ],
      correct: [0],
      explanation:
        'toBeHidden passes when the element is hidden or not on the page at all. It keeps trying until the row is removed. The isVisible version may run before the delete finishes, and it never tries again. toBeVisible with timeout 0 checks the opposite. toHaveText on a removed element waits for something that no longer exists and times out.',
      followUps: [
        {
          q: 'How would you also prove the count dropped?',
          a: 'await expect(page.getByRole(\'row\')).toHaveCount(previousCount - 1). Use a count read before the delete, or the known expected number.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-07',
      difficulty: 'medium',
      question: 'Clicks on covered buttons now hang until the test is stopped at 30 s. Which one config change makes every click and fill give up after 10 s, with an error about that action?',
      options: [
        'timeout: 10_000',
        'expect: { timeout: 10_000 }',
        'use: { actionTimeout: 10_000 }',
        'globalTimeout: 10_000',
      ],
      correct: [2],
      explanation:
        'actionTimeout under use sets a limit for each action, like click or fill. Without it, actions have no limit of their own. The top-level timeout would cut the whole test to 10 seconds. expect.timeout only affects checks. globalTimeout limits the entire run, so the whole suite would stop after 10 seconds.',
      followUps: [
        {
          q: 'Which setting would you pair with it for page.goto?',
          a: 'use: { navigationTimeout: 20_000 }. Page loads also have no limit of their own, so only the test timeout would stop them.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-08',
      difficulty: 'medium',
      question: 'A test has three expect.soft checks; the second fails, the others pass, and the remaining hard steps pass. What is the result?',
      options: [
        'Passed, with a warning in the report',
        'Failed, and it stopped right after the second soft check',
        'Failed, but every step after the soft failure still ran',
        'Skipped, because soft failures mark tests as skipped',
      ],
      correct: [2],
      explanation:
        'A soft check records the failure and lets the test continue. At the end, the test is still marked failed. Stopping at once is what a normal check does. Soft failures are never just warnings, and they have nothing to do with skipping a test.',
      followUps: [
        {
          q: 'How do you stop the test before a dependent step if any soft check failed?',
          a: 'Add expect(test.info().errors).toHaveLength(0) before that step. It fails the test right there if any soft errors were recorded.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-09',
      difficulty: 'medium',
      question: 'With default config, a cookie banner permanently covers the button below. How long does the click wait before the test fails?',
      code: {
        language: 'typescript',
        code: `// playwright.config.ts uses only defaults
test('pay', async ({ page }) => {
  await page.goto('/checkout');                       // takes ~2s
  await page.getByRole('button', { name: 'Pay now' }).click();
});`,
      },
      options: [
        '5 seconds, the expect timeout',
        'About 28 seconds, until the 30 s test timeout ends',
        '0 seconds; click fails immediately when covered',
        'Forever, because there is no action timeout',
      ],
      correct: [1],
      explanation:
        'Actions have no time limit by default. So the click keeps checking "is something covering it?" until the 30 second test timeout ends. That is about 28 seconds after goto. The expect timeout is for checks, not actions. A covered click tries again instead of failing at once, and the test timeout stops it from waiting forever.',
      followUps: [
        {
          q: 'How would you make this fail faster with a clearer error?',
          a: 'Set use: { actionTimeout: 10_000 } in the config, or pass { timeout } to that click. The error then names the click and the element covering it.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL that apply: which actionability checks does locator.fill() wait for?',
      options: ['Visible', 'Stable', 'Enabled', 'Editable', 'Receives events'],
      correct: [0, 2, 3],
      explanation:
        'The official table says fill (and clear) waits for Visible, Enabled and Editable. Stable and Receives events are for mouse actions like click, check, hover and dragTo. fill does not use the mouse at all. It focuses the field and sets the value, so banners and animations do not stop it.',
      followUps: [
        {
          q: 'A field has the readonly attribute. What happens when you fill it?',
          a: 'It is not editable, so fill keeps trying and fails at the time limit. The log says the element is not editable. That is correct, because a user cannot type there either. Check it with toBeEditable({ editable: false }) or toHaveAttribute(\'readonly\', \'\').',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-11',
      difficulty: 'hard',
      question: 'An engineer wraps a status check in toPass without options. The status never changes. What happens?',
      code: {
        language: 'typescript',
        code: `await expect(async () => {
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByTestId('status')).toHaveText('Shipped');
}).toPass();`,
      },
      options: [
        'It retries for 5 seconds (the expect timeout) and fails',
        'It runs the block once; toPass does not retry without intervals',
        'It keeps retrying until the test timeout ends, because toPass has a default timeout of 0',
        'It retries exactly 4 times, once per default interval',
      ],
      correct: [2],
      explanation:
        'toPass has a default timeout of 0, which means no limit of its own. It ignores the expect timeout. So it keeps trying until the 30 second test timeout. The default gaps [100, 250, 500, 1000] are waits between tries, not a count; the last one repeats. Each try also waits up to 5 seconds inside the inner toHaveText, which makes it even slower.',
      followUps: [
        {
          q: 'How would you write it properly?',
          a: 'Give toPass a clear limit and the inner check a short one: toHaveText(\'Shipped\', { timeout: 1_000 }) inside, and .toPass({ intervals: [1_000, 2_000, 5_000], timeout: 30_000 }) outside.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-12',
      difficulty: 'hard',
      question: 'A dashboard opens a websocket and sends an analytics ping every 400 ms. A test uses `await page.goto(url, { waitUntil: \'networkidle\' })`. What is the most likely outcome?',
      options: [
        'It speeds the test up because networkidle fires earlier than load',
        'goto may never reach networkidle (500 ms with no traffic) and times out, or wait far longer than needed',
        'networkidle ignores analytics requests automatically',
        'networkidle guarantees every widget has rendered its data',
      ],
      correct: [1],
      explanation:
        'networkidle needs 500 ms with no network traffic. A ping every 400 ms never allows that, so the page load waits until a timeout. That is one reason the docs do not recommend networkidle. It comes after load, not before. It does not ignore analytics. Even when it fires, it says nothing about whether the screen shows the data.',
      followUps: [
        {
          q: 'What should the test wait for instead?',
          a: 'Keep the normal goto and check visible content. For example, await expect(page.getByRole(\'heading\', { name: \'Dashboard\' })).toBeVisible(), plus the text of one data widget.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-13',
      difficulty: 'hard',
      question: 'Search results load asynchronously, 0 to 2 seconds after typing. Which line is the reliable check that exactly 3 results are shown?',
      code: {
        language: 'typescript',
        code: `const results = page.getByRole('listitem');
// A
expect(await results.count()).toBe(3);
// B
expect((await results.all()).length).toBe(3);
// C
await expect(results).toHaveCount(3);
// D
expect(await results.allTextContents()).toHaveLength(3);`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [2],
      explanation:
        'toHaveCount is a web-first check. It counts again and again until it sees exactly 3, or times out. count(), all() and allTextContents() each read the list only once. The docs warn that all() does not wait and gives unpredictable results on changing lists. So A, B and D can all see 0 items or only some.',
      followUps: [
        {
          q: 'You also need the texts in order. How?',
          a: 'await expect(results).toHaveText([\'Result 1\', \'Result 2\', \'Result 3\']). The list form checks count, order and text, and it keeps trying.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-14',
      difficulty: 'expert',
      question: 'Select ALL that apply: which statements about expect.poll and toPass are true?',
      options: [
        'Both use default polling intervals of [100, 250, 500, 1000] ms',
        'expect.poll uses the expect timeout (5s by default) unless you pass one',
        'toPass uses the expect timeout (5s by default) unless you pass one',
        'expect.poll retries a function and applies a generic matcher to its return value',
      ],
      correct: [0, 1, 3],
      explanation:
        'Both helpers wait 100, 250, 500, 1000 ms between tries by default. expect.poll calls a function, checks its returned value with a normal check, and stops at the expect timeout. toPass is the exception. Its default timeout is 0, so it ignores the expect timeout and can run until the test times out. So the third statement is false.',
      followUps: [
        {
          q: 'Give a case for expect.poll that a locator assertion cannot handle.',
          a: 'Waiting until an API returns status 200, or a field becomes "SHIPPED", after a UI action. Or waiting until a value is saved in localStorage. None of those is on the page, so a locator check cannot see it.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-15',
      difficulty: 'expert',
      question: 'A toast fades in with CSS: it is inserted with opacity: 0, then animates to opacity: 1 over 600 ms. A screenshot taken right after `await expect(toast).toBeVisible()` passes sometimes shows an empty area. Why?',
      options: [
        'toBeVisible does not retry for CSS animations',
        'Playwright treats opacity: 0 as visible, so the assertion passes the moment the toast is inserted, before it fades in',
        'Screenshots are always taken before assertions resolve',
        'toBeVisible checks the stable condition, which ignores opacity',
      ],
      correct: [1],
      explanation:
        'The docs say an element with a size and no visibility:hidden is visible, even at opacity 0. So the check passes as soon as the toast is added, while it is still see-through. toBeVisible does keep trying, but it has nothing left to wait for. The screenshot runs after the await, in order, and toBeVisible does not check for movement at all.',
      followUps: [
        {
          q: 'How would you make the screenshot reliable?',
          a: 'Check the final style before the screenshot, for example await expect(toast).toHaveCSS(\'opacity\', \'1\'). Or turn animations off with toHaveScreenshot\'s animations: \'disabled\' option, or a reduced-motion setting.',
        },
      ],
    },
  ],
};

export default topic;
