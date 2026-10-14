import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-assertions-waiting',
  phase: 'pw-basics',
  order: 4,
  title: 'Assertions and Waiting: Auto-waiting, Web-first Assertions, Timeouts',
  subtitle:
    'How Playwright synchronises with a changing page: actionability checks, the full catalog of retrying assertions, generic vs web-first, timeouts, soft assertions, expect.poll and toPass, and how to replace every hard wait.',
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
    'Actions auto-wait for actionability: click = visible + stable + receives events + enabled; fill = visible + enabled + editable; hover/dragTo skip enabled; press, focus, setInputFiles check nothing.',
    'Web-first assertion = `await expect(locator).toBeVisible()`: re-queries the page and retries until it passes or the expect timeout (5s) ends. Always `await` it.',
    'Generic assertion = `expect(value).toBe(x)`: checks a value once, no retry. Fine for plain data, wrong for page state you read a moment ago.',
    '`expect(await loc.isVisible()).toBe(true)` is the classic trap: isVisible returns immediately, so the check races the app. Use `await expect(loc).toBeVisible()`.',
    'Defaults: test 30s, expect 5s, action and navigation no timeout (bounded by the test), global none. Config: `timeout`, `expect: { timeout }`, `use: { actionTimeout, navigationTimeout }`, `globalTimeout`.',
    '`test.slow()` triples the test timeout; `test.setTimeout(ms)` sets it; per-call `{ timeout }` on an action or assertion overrides that call only.',
    '`toHaveText` = full text (normalised whitespace, string or regex or array); `toContainText` = substring. `toHaveCount`, `toHaveValue`, `toHaveAttribute`, `toHaveClass`, `toHaveURL`, `toHaveTitle`, `toBeOK`.',
    '`expect.soft()` records a failure and keeps going; the test still fails at the end. Custom message: `expect(loc, \'cart badge after add\').toHaveText(\'1\')`.',
    '`expect.poll(fn)` retries a function returning a value (intervals 100, 250, 500, 1000 ms; default 5s). `expect(async () => {...}).toPass()` retries a block (default timeout 0 = until the test times out; set one).',
    'Spinners and async data: assert the final state (`toBeVisible` on the result, `toBeHidden` on the loader); use `page.waitForResponse` only when you need the response itself.',
    '`page.waitForTimeout()` is for debugging only: too short = flaky, too long = slow. `networkidle` is discouraged. Wait for a condition, never for a clock.',
  ],
  sections: [
    {
      heading: 'Why waiting is the hard part of UI automation',
      body: `**Intuition:** your test and the web app are two runners on separate tracks. The test runs as fast as the CPU allows; the app waits for servers, animations and JavaScript. A test that checks something before the app has finished is like a waiter clearing a plate before the guest has eaten: wrong, even though both did their job.

In manual testing you wait automatically: you see the spinner and do not click until it disappears. Automation must express that patience **as conditions**, never as fixed pauses.

Three ways to wait, from worst to best:

| Approach | Example | Problem |
|---|---|---|
| Fixed sleep | \`await page.waitForTimeout(3000)\` | Too short on a slow CI machine (flaky), too long on a fast one (slow) |
| Manual polling | \`while (!(await loc.isVisible())) {...}\` | Reinvents what the framework already does, usually without a timeout |
| Condition with auto-retry | \`await expect(loc).toBeVisible()\` | Waits exactly as long as needed, up to a bounded timeout |

Playwright gives you two built-in waiting mechanisms:
1. **Auto-waiting before actions** (actionability checks): the click waits until the element can really be clicked.
2. **Web-first assertions**: \`expect(locator)\` matchers that retry until the page reaches the expected state.

Between them, almost every test can be written without a single explicit wait.

**Worked example:** on the-internet \`/dynamic_loading/1\`, clicking Start shows "Loading..." for about 5 seconds, then reveals "Hello World!". A \`waitForTimeout(3000)\` fails every time; \`waitForTimeout(6000)\` passes but wastes a second per run and fails when the server is slow. The assertion \`await expect(page.locator('#finish')).toBeVisible()\` passes the moment the result is shown... except the default expect timeout is **5s**, the same as the page's delay, so this one needs \`{ timeout: 10_000 }\`. Knowing your timeouts is part of waiting correctly. (A subtle trap: on this page \`#finish\` is in the DOM from the start, just hidden, so \`toHaveText('Hello World!')\` alone would pass immediately. Visibility is the real signal here.)`,
      diagram: `  time --->   0s        1s        2s        3s        4s        5s    6s
  app:        [click Start][ Loading... spinner ................ ][Hello]
  sleep(3000) ------------------------> check: FAIL (still loading)
  sleep(6000) ------------------------------------------------------> ok, 1s wasted
  expect(finish).toBeVisible({ timeout: 10_000 })
              retry . . . . . . . . . . . . . . . . . . . . . . . . -> PASS at ~5s`,
      keyPoints: [
        'Wait for conditions, never for the clock.',
        'Auto-waiting covers actions; web-first assertions cover checks.',
        'Know the timeouts: a correct wait can still fail if the limit is too low.',
      ],
      source: 'Playwright docs — Auto-waiting; Checkly — Dealing with waits and timeouts',
    },
    {
      heading: 'Auto-waiting and actionability checks',
      body: `**Intuition:** before pressing a button, a careful person checks that it is there, not moving, not hidden behind a popup and not greyed out. Playwright does exactly these checks, and which ones depends on the action.

**The five checks:**
- **Visible**: non-empty bounding box and not \`visibility:hidden\`. \`display:none\` and zero-size elements are not visible; **\`opacity:0\` counts as visible**.
- **Stable**: same bounding box for at least two consecutive animation frames (not animating).
- **Receives events**: the element is the hit target at the click point; no overlay, toast or cookie banner on top.
- **Enabled**: not a disabled \`button\`/\`input\`/\`select\`/\`textarea\`/\`option\`/\`optgroup\`, not inside a disabled \`fieldset\`, not under \`aria-disabled="true"\`.
- **Editable**: enabled and not \`readonly\` / \`aria-readonly="true"\`.

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

If a check fails, Playwright **retries** (re-resolving the locator each time) until the action timeout. There is **no default action timeout**, so in practice the 30s test timeout ends it, and the error lists the last failing reason, for example "element is not enabled" or "\`<div class="overlay">\` intercepts pointer events".

\`{ force: true }\` skips the non-essential checks. Use it rarely and never to hide an overlay a real user would hit.

**Important limitation:** auto-waiting answers "can I act on it?", not "is the app finished?". A button can be visible and enabled while the data behind it is still loading. That is what assertions are for.

**In interviews, say this:** "Before a click Playwright checks visible, stable, receives events and enabled; for fill it checks visible, enabled and editable. It retries until the timeout, so I do not need explicit waits before actions."`,
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
        'Five checks: visible, stable, receives events, enabled, editable; the set depends on the action.',
        'opacity:0 counts as visible; display:none does not.',
        'No default action timeout; the test timeout bounds it.',
        'Actionable is not the same as "app finished": assert outcomes.',
      ],
      source: 'Playwright docs — Auto-waiting (actionability checks table)',
    },
    {
      heading: 'Web-first assertions: the catalog',
      body: `**Intuition:** a web-first assertion is a question you keep asking until you get the right answer or run out of patience: "Is the badge showing 1 yet? ... yet? ... yes." Each retry **re-queries the live page**, so it sees changes that happen after the assertion started.

They all have the shape \`await expect(locatorOrPage).matcher(...)\`, retry until the **expect timeout (5s default)**, and must be **awaited**.

**Locator assertions (retrying):**

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

**Page assertions:** \`toHaveURL\`, \`toHaveTitle\` (plus \`toHaveScreenshot\`, \`toMatchAriaSnapshot\`).
**API response assertion:** \`await expect(response).toBeOK()\` (status 200–299).

Useful details:
- \`toBeHidden\` passes when the element is hidden **or not in the DOM at all**, so it suits "spinner disappeared" and "row deleted".
- \`toHaveCount(0)\` is the precise way to say "no rows".
- \`toBeVisible({ visible: false })\` and \`toBeChecked({ checked: false })\` exist for parameterised checks.
- Any matcher accepts \`{ timeout }\` for that call only.

**In interviews, say this:** "I use web-first assertions for anything on the page because they retry against the live DOM; generic assertions only for plain values I already have."`,
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
        'Retries by re-querying the page until the 5s expect timeout.',
        'toBeHidden passes for elements that are not in the DOM.',
      ],
      source: 'Playwright docs — Assertions; API reference LocatorAssertions and PageAssertions',
    },
    {
      heading: 'Generic vs web-first assertions (and the isVisible trap)',
      body: `**Intuition:** a generic assertion checks a photo; a web-first assertion checks a live video. If you took the photo half a second too early, the photo will always be wrong.

| | Generic (non-retrying) | Web-first (auto-retrying) |
|---|---|---|
| Shape | \`expect(value).toBe(x)\` | \`await expect(locator).toHaveText(x)\` |
| Input | A value you already have | A locator / page / response |
| Retries? | **No**, evaluated once | **Yes**, until it passes or times out |
| \`await\` | Not needed (synchronous) | **Required** |
| Examples | \`toBe\`, \`toEqual\`, \`toContain\`, \`toHaveLength\`, \`toBeTruthy\`, \`toMatch\`, \`toBeGreaterThan\`, \`toBeCloseTo\` | \`toBeVisible\`, \`toHaveText\`, \`toHaveCount\`, \`toHaveURL\`, \`toHaveValue\` |
| Use for | API JSON fields, computed arrays, numbers you calculated | Anything shown in the browser |

**The trap pairs** (left side is flaky, right side is correct):

| Flaky | Correct |
|---|---|
| \`expect(await loc.isVisible()).toBe(true)\` | \`await expect(loc).toBeVisible()\` |
| \`expect(await loc.textContent()).toBe('1')\` | \`await expect(loc).toHaveText('1')\` |
| \`expect(await loc.count()).toBe(6)\` | \`await expect(loc).toHaveCount(6)\` |
| \`expect(page.url()).toContain('inventory')\` | \`await expect(page).toHaveURL(/inventory/)\` |
| \`expect(await loc.isChecked()).toBeTruthy()\` | \`await expect(loc).toBeChecked()\` |
| \`expect(await loc.inputValue()).toBe('az')\` | \`await expect(loc).toHaveValue('az')\` |

Why the left side flakes: \`isVisible()\`, \`textContent()\`, \`count()\` and \`page.url()\` read the page **once, right now**. \`isVisible()\` in particular does not wait at all (its old \`timeout\` option is deprecated and ignored). Wrapping the result in \`expect\` adds no waiting.

**\`isVisible()\` is still fine** for branching in a helper (\`if (await banner.isVisible()) await banner.getByText('Close').click()\`), as long as you accept it is a snapshot. But a test that *must* see the element should assert it.

**Generic assertions are still useful:** after a snapshot read that is known to be stable, e.g. sorting \`allTextContents()\` of a loaded list (assert \`toHaveCount\` first), or checking API JSON.

**Missing \`await\`** on a web-first assertion is a silent bug: the promise floats, the test can finish before it settles, and a failure may be reported late or not at all. Enable the \`@typescript-eslint/no-floating-promises\` or \`playwright/missing-playwright-await\` lint rule.`,
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
        'Generic = one-time check of a value; web-first = retrying check of the live page.',
        'isVisible/textContent/count/url are snapshots; never assert on them directly.',
        'Always await web-first assertions; lint for floating promises.',
      ],
      source: 'Playwright docs — Best practices (use web-first assertions); Assertions (non-retrying assertions)',
    },
    {
      heading: 'Text, count and value assertions in depth',
      body: `**Intuition:** most bugs are "the right element shows the wrong words". Text matchers are where precision matters most.

**\`toHaveText\` vs \`toContainText\`:**

| Element text | \`toHaveText('Hello')\` | \`toContainText('Hello')\` | \`toHaveText(/hello/i)\` |
|---|---|---|---|
| "Hello" | pass | pass | pass |
| "  Hello\\n" | pass (whitespace normalised) | pass | pass |
| "Hello World!" | **fail** (full match) | pass (substring) | pass (regex search) |
| "hello" | fail (case-sensitive) | fail | pass (\`i\` flag) |

- Both accept \`{ ignoreCase: true }\` and \`{ useInnerText: true }\`.
- **Arrays** compare a list of elements in order: \`await expect(page.locator('.inventory_item_name')).toHaveText(['A', 'B'])\`. It fails if the count differs, so it also covers "no extra items".
- With an array, \`toContainText(['Backpack', 'Bike'])\` checks each element contains the corresponding substring, in order.
- **Regex** is useful for dynamic parts: \`toHaveText(/Order #\\d+ confirmed/)\`.

**Counts:** \`toHaveCount(n)\` retries until exactly n elements match. Use \`not.toHaveCount(0)\` to wait for "at least one" without knowing how many.

**Values:** \`toHaveValue\` reads the current input/select value (not the \`value\` attribute in the HTML). \`toHaveValues(['a', 'b'])\` for multi-selects. \`toBeEmpty()\` for empty inputs or elements with no text.

**Attributes and classes:** \`toHaveAttribute('aria-expanded', 'true')\`, \`toHaveClass(/active/)\` (regex because the class list may contain more), \`toContainClass('active')\` for a single class name.

**Common mistake:** asserting on long full-page text (\`toHaveText\` on \`body\`). It breaks on every copy change. Assert on the smallest element that carries the meaning.`,
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
        'toHaveText = full (normalised) match; toContainText = substring; regex for dynamic parts.',
        'Arrays compare whole lists in order, including the count.',
        'Assert on the smallest meaningful element.',
      ],
      source: 'Playwright API reference — LocatorAssertions toHaveText, toContainText, toHaveCount',
    },
    {
      heading: 'Timeouts: test, expect, action, navigation',
      body: `**Intuition:** timeouts are nested kitchen timers. The big one (test) rings if the whole recipe takes too long; the small ones (each assertion, each action) ring if one step gets stuck.

| Timeout | Default | Set globally | Override locally |
|---|---|---|---|
| Test (incl. \`beforeEach\` and fixtures setup) | **30 000 ms** | \`timeout: 60_000\` in config | \`test.setTimeout(120_000)\`, \`test.slow()\` (x3) |
| Expect (web-first assertions) | **5 000 ms** | \`expect: { timeout: 10_000 }\` | \`toHaveText('x', { timeout: 10_000 })\` |
| Action (click, fill...) | **none** | \`use: { actionTimeout: 10_000 }\` | \`click({ timeout: 10_000 })\` |
| Navigation (goto, waitForURL) | **none** | \`use: { navigationTimeout: 30_000 }\` | \`goto(url, { timeout: 30_000 })\` |
| Global (whole run) | none | \`globalTimeout: 60 * 60 * 1000\` | – |
| \`beforeAll\` / \`afterAll\` | 30 000 ms (own budget) | – | \`test.setTimeout()\` inside the hook |

Rules of thumb:
- Because action and navigation have **no default**, a stuck click waits until the **test** times out, and the error says "Test timeout of 30000ms exceeded" while pointing at the click. Setting \`actionTimeout\` (e.g. 10–15s) gives faster, clearer failures.
- An assertion that times out reports "Timed out 5000ms waiting for expect(locator).toHaveText(expected)" with the actual value it last saw. Read that **actual value** before changing any timeout.
- \`test.slow()\` is the honest way to mark a known-slow test (for example, a report export). Raising the global timeout for one slow test slows down failure feedback for all.
- \`afterEach\` and fixture teardown share a separate window of the test timeout length.

**Worked example:** \`performance_glitch_user\` on SauceDemo has a deliberately slow login (a few seconds). The default 5s expect usually copes; on a slow CI agent it may not. The fix is a targeted \`{ timeout: 15_000 }\` on that one \`toHaveURL\`, not a 30s global expect timeout.`,
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
        'Test 30s, expect 5s, action and navigation none, global none.',
        'Stuck actions surface as test timeouts unless actionTimeout is set.',
        'Prefer targeted overrides (one call, test.slow) over raising global limits.',
      ],
      source: 'Playwright docs — Timeouts',
    },
    {
      heading: 'Negation, soft assertions and custom messages',
      body: `**Intuition:** \`.not\` asks "make sure this is NOT the case", soft assertions are a checklist that keeps going after a failed item, and custom messages are the note you leave for whoever reads the failure at 2 am.

**\`.not\`** works with every matcher and also retries: \`await expect(badge).not.toBeVisible()\` waits until the badge is gone. For disappearance, \`toBeHidden()\` reads more naturally and means the same thing. Be careful: \`await expect(error).not.toBeVisible()\` straight after a click may pass **immediately**, before the error had a chance to appear. Negative checks need a positive anchor first (assert the success state, then the absence of the error).

**Soft assertions:** \`await expect.soft(loc).toHaveText('x')\` records a failure but does not stop the test. The test is still marked **failed** at the end and the report lists every soft failure. Good for checking several independent fields on one screen (name, price, description of a product). Bad for preconditions: if login failed, continuing just produces noise. Stop early when needed with \`expect(test.info().errors).toHaveLength(0)\`.

**Custom messages:** the second argument to \`expect\` names the check in reports: \`await expect(badge, 'cart badge after adding backpack').toHaveText('1')\`. Worth it in loops and helpers where line numbers are ambiguous.

**\`expect.configure\`** creates a pre-set expect: \`const slowExpect = expect.configure({ timeout: 15_000 })\` or \`const softExpect = expect.configure({ soft: true })\`.

| Feature | Syntax | Test stops on failure? |
|---|---|---|
| Normal | \`await expect(loc).toBeVisible()\` | Yes |
| Negated | \`await expect(loc).not.toBeVisible()\` | Yes |
| Soft | \`await expect.soft(loc).toBeVisible()\` | No (fails at end) |
| With message | \`await expect(loc, 'why').toBeVisible()\` | Yes |`,
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
        '.not retries too, but negative checks need a positive anchor first.',
        'Soft assertions continue the test and fail it at the end.',
        'Custom messages and expect.configure make failures readable.',
      ],
      source: 'Playwright docs — Assertions: negating matchers, soft assertions, custom expect message, expect.configure',
    },
    {
      heading: 'expect.poll and toPass: retrying things that are not locators',
      body: `**Intuition:** web-first assertions only retry page state. Sometimes the thing you wait for lives elsewhere: an API status, a value in local storage, a file being written. \`expect.poll\` and \`toPass\` give the same "keep asking" behaviour to any code.

**\`expect.poll(fn)\`** calls a function repeatedly and applies a generic matcher to its **return value** until it passes.
- Default timeout: the expect timeout (5s); \`timeout: 0\` disables it.
- Default intervals: \`[100, 250, 500, 1000]\` ms (then 1000 ms repeated).
- Example: wait until an order created in the UI shows status "SHIPPED" in the API.

**\`expect(async () => { ... }).toPass()\`** retries a **whole block** (which can contain several assertions and even actions) until it runs without throwing.
- Default intervals: \`[100, 250, 500, 1000]\` ms.
- Default timeout: **0, meaning no own limit**: it keeps retrying until the **test** timeout. It does **not** use the expect timeout. Always pass \`{ timeout }\`.
- Example: click "Refresh" and check the status, repeating until it changes.

| Need | Tool |
|---|---|
| Element state on the page | web-first assertion (\`toHaveText\`, ...) |
| A single value from a function (API, storage, file) | \`expect.poll(() => value).toBe(...)\` |
| A multi-step block that may need repeating | \`expect(async () => {...}).toPass({ timeout })\` |

**Caution:** \`toPass\` can hide real problems if the block contains actions with side effects (clicking "Add" ten times adds ten items). Keep it idempotent, and prefer web-first assertions whenever the condition is visible on the page.`,
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
        'expect.poll retries a value-returning function; default timeout = expect timeout.',
        'toPass retries a block; default timeout 0 = until the test times out, so set one.',
        'Use them only when the condition is not a locator state.',
      ],
      source: 'Playwright docs — Assertions: expect.poll, expect.toPass',
    },
    {
      heading: 'Dynamic elements: spinners, async data and network waits',
      body: `**Intuition:** wait for the thing the user waits for. A user does not wait for "the spinner to disappear"; they wait for **their results**. Assert the result and the spinner takes care of itself.

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

**\`waitForResponse\`** follows the same listen-trigger-consume rule as popups: create the promise **before** the click. It is the right tool when you assert on the response (status, body), and a useful extra guard when the UI gives no signal. The network topic covers mocking and response checks in depth.

**What not to do:**
- \`page.waitForTimeout(n)\`: the docs say it is for debugging only; tests with timers are flaky.
- \`waitForLoadState('networkidle')\`: discouraged; long-polling, analytics and websockets keep it from settling, and SPAs often render after it.
- \`page.waitForSelector('.x')\` as a habit: works, but a web-first assertion says the same thing and reads as a check.
- Loops around \`isVisible()\` with \`waitForTimeout\` inside: a hand-made, worse \`toBeVisible\`.

**Worked example:** the-internet \`/dynamic_loading/2\` adds \`#finish\` to the DOM only after ~5 seconds. \`page.locator('#finish').textContent()\` right after Start returns nothing (or times out waiting for the element), while \`toHaveText('Hello World!', { timeout: 10_000 })\` passes as soon as it appears.`,
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
        'Assert the final state the user cares about; loaders resolve themselves.',
        'waitForResponse: create the promise before the trigger.',
        'locator.waitFor() when you need readiness but no assertion.',
      ],
      source: 'Playwright docs — Assertions; API reference Page.waitForResponse, Locator.waitFor, Page.waitForTimeout',
    },
    {
      heading: 'Choosing the right wait: a decision guide',
      body: `**Intuition:** before writing any wait, ask "what would a human look at to know it is ready?". Then turn that into a condition.

Most flaky Playwright tests in real projects come from four habits: hard sleeps, snapshot reads used as assertions, missing \`await\`, and waiting for the wrong signal (network idle instead of UI). The diagram below is the habit that replaces them.

**Translating Selenium habits** (many interviewers ask this):

| Selenium | Playwright equivalent |
|---|---|
| Implicit wait (global find timeout) | Not needed: locators re-resolve and actions auto-wait |
| Explicit wait \`WebDriverWait(...).until(visibilityOf(el))\` | \`await expect(loc).toBeVisible()\` |
| \`elementToBeClickable\` | Built into \`click()\` (actionability checks) |
| \`Thread.sleep(3000)\` | Nothing. Replace with a condition |
| \`StaleElementReferenceException\` retries | Not applicable: locators are lazy and re-query each time |
| FluentWait with polling | \`expect.poll\` / \`toPass\` with \`intervals\` |

**Code-review checklist for waits:**
1. Any \`waitForTimeout\`? Replace with the condition it was waiting for.
2. Any \`expect(await ...is*()/textContent()/count())\`? Convert to a web-first matcher.
3. Every \`expect(locator)\` and every action \`await\`ed?
4. Negative assertions preceded by a positive anchor?
5. Timeouts raised globally to fix one test? Move the override to that call or use \`test.slow()\`.
6. \`networkidle\` anywhere? Replace with a UI or response condition.`,
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
        'Ask what a human looks at, then assert that.',
        'Selenium explicit waits map to web-first assertions; implicit waits are unnecessary.',
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
        'This test for the-internet dynamic_loading/1 passes on the author\'s laptop and fails in CI roughly once in every four runs. It also takes 8 seconds even when the page is fast.',
      task: 'Remove every fixed wait and snapshot assertion so the test waits exactly as long as needed, gives a clear failure message, and still fails if "Hello World!" never appears.',
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
        'Which lines read the page once and which ones keep retrying?',
        'The page takes about 5 seconds, and the default expect timeout is also 5 seconds. Where should a longer timeout go?',
        'The first sleep waits for nothing in particular: what does goto already wait for?',
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

1. **First \`waitForTimeout(2000)\` removed.** \`goto\` already waits for the \`load\` event, and \`click\` auto-waits for the button to be actionable. The sleep waited for nothing.
2. **\`page.click('#start button')\` → \`getByRole('button', { name: 'Start' })\`.** User-facing locator, locator-based action.
3. **\`waitForTimeout(6000)\` removed.** It was a guess: on a slow CI agent 6s is not enough (the flaky 1 in 4), on a fast one it wastes time. The assertion now waits only as long as needed.
4. **\`isHidden()\` / \`isVisible()\` + \`toBeTruthy\`/\`toBe(true)\` → \`toBeHidden()\` / \`toBeVisible()\`.** \`is*()\` methods return immediately and never retry, so they were only correct because of the sleep before them.
5. **\`textContent()\` + \`toBe\` → \`toHaveText\`.** Retries, normalises whitespace and prints expected vs actual on failure.
6. **Visibility first, text second.** On this page \`#finish\` exists (hidden) from the start, so \`toHaveText\` alone would pass before loading ends; \`toBeVisible\` is the real readiness signal.
7. **Timeout placed where it belongs.** Only this assertion knows the page is slow, so it gets \`{ timeout: 10_000 }\`; the global expect timeout stays at 5s.
8. **Custom message** names the check in the report.

Result: the test takes about 5s instead of 8s+ and only fails when the text truly never appears.`,
      followUps: [
        {
          q: 'Why not just set expect.timeout to 10 seconds in the config?',
          a: 'It would make every failing assertion in the suite take twice as long to report, and hide genuine slowness regressions elsewhere. Timeouts should reflect known behaviour: this one page is slow by design, so the override lives on this one call. If many pages are slow in a given environment, that is a config-per-project decision, not a fix for one test.',
        },
        {
          q: 'Why not just assert toHaveText and drop toBeVisible?',
          a: 'On dynamic_loading/1 the #finish element is in the DOM from the start, only hidden, and toHaveText reads its text even when hidden. So toHaveText alone passes immediately, before loading ends, and the test would not notice a broken loader. The visibility assertion is what proves the user can see the result; the text check then proves it is the right result.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-cc-2',
      title: 'Generic assertions on live page state',
      context:
        'A SauceDemo cart test fails intermittently with "Expected: 2, Received: 1" and sometimes passes even when the badge is wrong. A reviewer suspects missing awaits and snapshot reads.',
      task: 'Rewrite the assertions so every page check retries, nothing floats, and the test fails clearly if the cart badge or URL is wrong.',
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
        'Which assertion returns a Promise that nobody awaits?',
        'There are matchers for URL, text, count and visibility that accept the locator or page directly.',
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

1. **\`expect(page.url()).toContain(...)\` → \`await expect(page).toHaveURL(...)\`.** \`page.url()\` is read once, possibly before the redirect finishes.
2. **\`textContent()\` + \`Number()\` + \`toBe(2)\` → \`toHaveText('2')\`.** The badge updates asynchronously after the second click; reading it once gave "1" on fast runs. The retrying matcher waits for "2".
3. **\`count()\` + \`toEqual(2)\` → \`toHaveText([...])\` on item names.** Retries until the cart page shows exactly these two items in order, which is stronger than a count (it catches the wrong product too).
4. **Floating \`expect(...).toBeVisible()\` awaited.** Without \`await\`, the test could finish before the assertion ran, so it sometimes "passed" with a broken checkout button.
5. **Added a URL assertion for the cart page** as a positive anchor before checking its content, and a custom message on the badge check.`,
      followUps: [
        {
          q: 'How would you catch missing awaits automatically across the suite?',
          a: 'Enable TypeScript-aware linting: `@typescript-eslint/no-floating-promises` flags any un-awaited promise, and eslint-plugin-playwright has `missing-playwright-await` specifically for expect and actions. Run the linter in CI so the PR fails before review.',
        },
        {
          q: 'When is reading count() and using a generic assertion acceptable?',
          a: 'When you need the number for further logic and the list is already known to be stable, for example after a web-first `toHaveCount` or `toHaveText` passed, or on a static page. The rule is: wait with a web-first assertion first, snapshot second.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-assertions-waiting-iq-1',
      difficulty: 'medium',
      question: 'Explain auto-waiting in Playwright. What exactly does it check before a click, and how is this different from implicit and explicit waits in Selenium?',
      whatInterviewerLooksFor: [
        'Names the actionability checks correctly',
        'Knows checks differ per action (fill vs click)',
        'Knows the timeout behaviour (no default action timeout)',
        'Separates action auto-waiting from assertion retrying',
        'Maps Selenium waits to Playwright concepts accurately',
      ],
      modelAnswer: `**Auto-waiting** means every action waits until the element is ready for that action, retrying until a timeout.

**Before a click** Playwright checks that the element:
1. **Visible**: has a non-empty box and is not \`visibility:hidden\` (\`opacity:0\` still counts as visible).
2. **Stable**: not animating; same bounding box for two animation frames.
3. **Receives events**: is the actual hit target, not covered by an overlay.
4. **Enabled**: not \`disabled\`, not in a disabled fieldset, not \`aria-disabled\`.

It also scrolls the element into view. Other actions use different sets: \`fill\` checks visible, enabled and **editable**; \`hover\` and \`dragTo\` skip enabled; \`press\` and \`setInputFiles\` check nothing.

**Timeouts:** there is no default action timeout, so a stuck click waits until the 30s test timeout unless \`actionTimeout\` is configured. The error log shows which check was failing, for example "element intercepts pointer events".

**Assertions are the second half:** web-first assertions like \`await expect(loc).toHaveText('2')\` retry for up to 5s by default. Auto-waiting says "I can act"; assertions say "the app reached the expected state".

**Compared with Selenium:**
- **Implicit wait** only waits for an element to exist when finding it. Playwright locators are lazy and re-resolve on every action, so there is no global find timeout to tune.
- **Explicit waits** (\`WebDriverWait\` + \`ExpectedConditions\`) are written by hand per step. In Playwright, \`elementToBeClickable\` is built into \`click()\`, and \`visibilityOf\` becomes \`await expect(loc).toBeVisible()\`.
- **StaleElementReferenceException** does not happen with locators because nothing is cached.

So in Playwright I write no waits before actions, and I express every expectation as a web-first assertion.`,
      followUps: [
        {
          q: 'Does auto-waiting guarantee the data on the page is loaded?',
          a: 'No. It only guarantees the element can be acted on. A Submit button may be visible and enabled while the form is still fetching default values. If the test depends on data, assert on that data first with a web-first assertion, such as the expected value in a field or the row count in a table.',
        },
        {
          q: 'Why would you set actionTimeout if there is no default?',
          a: 'To fail faster and more clearly. Without it, a click on a permanently covered button burns the full 30s test timeout and the error is reported as a test timeout. With actionTimeout around 10–15s, the failure points to the click and leaves time budget for useful teardown and traces.',
        },
      ],
      pitfalls: [
        'Listing "present in DOM" as the only check',
        'Saying Playwright has an implicit wait setting to configure',
        'Claiming actions verify the result of the action',
        'Thinking opacity:0 elements are treated as hidden',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-2',
      difficulty: 'easy',
      question: 'What is the difference between expect(await locator.isVisible()).toBe(true) and await expect(locator).toBeVisible()? Which do you use?',
      whatInterviewerLooksFor: [
        'Knows isVisible returns immediately without waiting',
        'Explains retrying web-first assertions',
        'Recognises the flakiness pattern',
        'Knows when isVisible is still acceptable',
      ],
      modelAnswer: `**\`expect(await locator.isVisible()).toBe(true)\`**
- \`isVisible()\` checks visibility **once, right now**, and returns a boolean. It does not wait (its old \`timeout\` option is ignored).
- \`toBe(true)\` is a generic assertion on that boolean; it cannot retry because it only has a stored value.
- If the element appears 200 ms later, the test fails. It passes only when the timing happens to be favourable: a classic flaky test.

**\`await expect(locator).toBeVisible()\`**
- A web-first assertion: it re-queries the page and retries until the element is visible or the expect timeout (5s by default) ends.
- On failure it prints the locator, the expectation and what it found, which is far easier to debug.

I always use the second one in tests. The same applies to \`textContent()\` vs \`toHaveText\`, \`count()\` vs \`toHaveCount\`, \`isChecked()\` vs \`toBeChecked\`, \`page.url()\` vs \`toHaveURL\`.

**When \`isVisible()\` is fine:** in conditional logic where either outcome is valid, for example a helper that closes an optional promo banner: \`if (await promo.isVisible()) await promo.getByRole('button', { name: 'Close' }).click()\`. Even then I prefer making the test deterministic (for example, disabling the promo via a cookie) because conditional tests can hide bugs.

The official best-practices page uses exactly this pair as its "don't / do" example.`,
      followUps: [
        {
          q: 'What does the failure output look like for each?',
          a: 'The generic one says "Expected: true, Received: false", with no clue about which element or why. The web-first one names the locator, says it timed out after 5000ms waiting for toBeVisible, and lists the call log (for example "locator resolved to <div id=finish style=display:none>"), which points straight at the cause.',
        },
        {
          q: 'Would await expect(locator.isVisible()).resolves.toBe(true) fix it?',
          a: 'No. `.resolves` only unwraps the promise; isVisible still runs once and returns immediately. Nothing retries. The fix is to pass the locator itself to expect and use a locator matcher.',
        },
      ],
      pitfalls: [
        'Thinking wrapping in expect adds waiting',
        'Adding waitForTimeout before isVisible to "fix" it',
        'Not mentioning the related snapshot methods (textContent, count)',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-3',
      difficulty: 'medium',
      question: 'Your test fails with "Timed out 5000ms waiting for expect(locator).toHaveText(expected)". How do you debug it, and which timeouts exist in Playwright?',
      whatInterviewerLooksFor: [
        'Reads expected vs received before touching timeouts',
        'Knows all defaults (test 30s, expect 5s, action and navigation none)',
        'Uses trace viewer / UI mode to see page state',
        'Applies targeted timeout overrides',
        'Distinguishes slow app from wrong expectation',
      ],
      modelAnswer: `**Step 1: read the error, not the timeout.** The message shows the locator, the expected text and the **received** text from the last retry, plus a call log. Three common cases:
- **Received a different text** (e.g. "1" instead of "2"): the app or my expectation is wrong; more time will not help.
- **Locator resolved to nothing**: wrong locator, element in an iframe, or the page never navigated.
- **Received the right text later in the trace**: the app is genuinely slower than 5s.

**Step 2: look at the page at that moment.** Run with \`--trace on\` (or rely on \`trace: 'on-first-retry'\` in CI) and open the trace: the DOM snapshot, network calls and console at the failing step. Locally, UI mode or \`--debug\` lets me step through.

**Step 3: fix the cause.** Correct the locator or expectation; if the app is slow by design, override only that call: \`toHaveText('2', { timeout: 15_000 })\` or mark the test \`test.slow()\`. If it is slow because of a performance regression, that is a bug to report.

**Timeouts and defaults:**

| Timeout | Default | Config |
|---|---|---|
| Test | 30s | \`timeout\` |
| Expect | 5s | \`expect.timeout\` |
| Action | none | \`use.actionTimeout\` |
| Navigation | none | \`use.navigationTimeout\` |
| Global | none | \`globalTimeout\` |

Per call: \`{ timeout }\` on actions and assertions; per test: \`test.setTimeout\`, \`test.slow()\` (triples). The test timeout also covers \`beforeEach\` and fixture setup.

**What I avoid:** raising \`expect.timeout\` globally to 30s, which slows every real failure, and adding \`waitForTimeout\` before the assertion.`,
      followUps: [
        {
          q: 'A click hangs and the error says "Test timeout of 30000ms exceeded". Why not an action timeout?',
          a: 'Because action timeout has no default, the click is only limited by the test timeout. The report still shows the click as the pending step with its call log (for example "element is not enabled - waiting"). Setting `actionTimeout` would make the click itself fail sooner with a more specific error.',
        },
        {
          q: 'How does test.slow() differ from test.setTimeout(90_000)?',
          a: 'test.slow() multiplies the configured test timeout by three, so it scales if the config changes, and it documents intent ("this test is known to be slow"). setTimeout sets an absolute value. Both apply only to that test. slow() can also take a condition, like `test.slow(browserName === \'webkit\', \'slow on WebKit\')`.',
        },
      ],
      pitfalls: [
        'Immediately increasing timeouts without reading the received value',
        'Saying the default action timeout is 30s or 5s',
        'Raising timeouts globally for one slow page',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-4',
      difficulty: 'medium',
      question: 'What are soft assertions in Playwright? Give a scenario where you would use them and one where you would not.',
      whatInterviewerLooksFor: [
        'Correct semantics: continue running, fail at the end',
        'Good use case: many independent checks on one screen',
        'Bad use case: preconditions and dependent steps',
        'Knows how to stop early using test.info().errors',
      ],
      modelAnswer: `**What they are:** \`expect.soft(...)\` records a failed assertion but lets the test continue. At the end, the test is marked **failed** and the report lists every soft failure. They work with both web-first (\`await expect.soft(loc).toHaveText(...)\`) and generic matchers, and only within the Playwright test runner.

**Good use: one screen, many independent fields.** A product details page shows name, price, description, image alt text and the Add button. If the price is wrong, I still want to know whether the description is wrong too, in the same run, instead of fixing-and-rerunning five times:

- \`await expect.soft(price, 'price').toHaveText('$29.99')\`
- \`await expect.soft(desc, 'description').toContainText('carry.allTheThings()')\`
- \`await expect.soft(addButton, 'add button').toBeEnabled()\`

Similar uses: verifying all columns of a table row, a set of footer links, all fields of an order confirmation.

**Bad use: preconditions and chains.** Login, navigation and "item added to cart" must be **hard** assertions. If login fails softly, every later step fails too and the report fills with noise that hides the first real cause.

**Stopping early after soft checks:** before moving to a dependent part, add \`expect(test.info().errors).toHaveLength(0)\`; if any soft check failed, the test stops there.

**Configured instance:** \`const softExpect = expect.configure({ soft: true })\` for a block of soft checks.

**My rule:** hard for steps the rest of the test depends on, soft for independent observations on one page. Each soft assertion gets a custom message so the report reads like a checklist.`,
      followUps: [
        {
          q: 'Does a soft assertion failure trigger a retry?',
          a: 'Yes, because the test ends as failed. If retries are configured, the whole test runs again; if it then passes, it is reported as flaky. Soft assertions change when the test stops, not whether it fails.',
        },
        {
          q: 'How is this different from wrapping assertions in try/catch?',
          a: 'try/catch swallows the error, so the test passes unless you rethrow, and the report loses the failure details. Soft assertions keep full reporting (expected, received, call log) and mark the test failed. Catching assertion errors manually is an anti-pattern.',
        },
      ],
      pitfalls: [
        'Saying soft assertions make the test pass with warnings',
        'Using soft assertions for login or navigation steps',
        'Replacing soft assertions with try/catch',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-5',
      difficulty: 'medium',
      question: 'A page shows a loading spinner for a few seconds while it fetches orders from an API. How do you wait for it correctly, without hard waits?',
      whatInterviewerLooksFor: [
        'Asserts the final state rather than the spinner',
        'Uses toBeHidden for the loader when needed',
        'Uses waitForResponse with correct ordering when the data matters',
        'Avoids networkidle and waitForTimeout',
        'Considers empty and error states',
      ],
      modelAnswer: `**Principle:** wait for what the user waits for: the orders, not the spinner.

**1. Assert the result directly.** \`await expect(page.getByRole('row')).toHaveCount(6)\` or \`await expect(page.getByRole('cell', { name: 'ORD-1001' })).toBeVisible()\`. The assertion retries while the spinner is shown and passes when the data arrives. If loading takes longer than 5s by design, add \`{ timeout: 15_000 }\` to that call.

**2. Spinner check only when it adds value.** If an action is enabled under the spinner (e.g. a filter input that is reset when loading ends), first \`await expect(page.getByTestId('spinner')).toBeHidden()\`, then act. \`toBeHidden\` also passes if the spinner is removed from the DOM.

**3. When I need the response itself:**
- \`const ordersRes = page.waitForResponse(r => r.url().includes('/api/orders') && r.ok());\` (no await)
- trigger the load (click, goto)
- \`const res = await ordersRes; const orders = await res.json();\`
- assert the UI matches the data: \`toHaveCount(orders.length + 1)\` including the header row.
Creating the promise before the trigger avoids missing a fast response.

**4. Other states:** an empty API result should show "No orders", and a 500 should show an error message; I cover those by mocking the route (covered in the network topic).

**What I avoid:**
- \`waitForTimeout(3000)\`: flaky on slow CI, wasteful on fast machines.
- \`waitForLoadState('networkidle')\`: discouraged; polling or analytics can stop it from settling, and it still does not prove rendering finished.
- Asserting \`not.toBeVisible()\` on the spinner immediately after navigation: it may pass before the spinner even appeared.`,
      followUps: [
        {
          q: 'The spinner sometimes appears for only 50 ms. Should you assert it appears?',
          a: 'Only if showing a loader is a requirement, and then preferably with a mocked slow response (route with a delay) so the check is deterministic. Asserting a 50 ms flash against a real backend is inherently flaky; the important check is the final state.',
        },
        {
          q: 'What if two requests to /api/orders happen (prefetch and real)?',
          a: 'Make the predicate more specific: check the query string, the method, or a request header, for example `r.url().includes(\'/api/orders?page=1\') && r.request().method() === \'GET\'`. Or assert purely on the UI, which is indifferent to how many calls were made.',
        },
      ],
      pitfalls: [
        'Waiting for the spinner with a sleep',
        'Starting waitForResponse after the click',
        'Using networkidle as the default readiness signal',
        'Ignoring empty and error states',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-6',
      difficulty: 'hard',
      question: 'When would you use expect.poll, when expect(...).toPass, and when a normal web-first assertion? What are the defaults and the dangers?',
      whatInterviewerLooksFor: [
        'Matches tool to the kind of condition (DOM, value, block)',
        'Knows default intervals and timeouts, especially toPass timeout 0',
        'Warns about side effects inside toPass',
        'Gives realistic examples',
      ],
      modelAnswer: `**Web-first assertion**: whenever the condition is **page state** a locator can express (text, count, visibility, URL). This covers most tests and gives the best error messages.

**\`expect.poll(fn).matcher()\`**: when the condition is a **single value** produced by code, not by the DOM.
- Examples: an API status after a UI action, a value in \`localStorage\` via \`page.evaluate\`, the size of an exported file, a row count in a test database.
- Defaults: timeout = the expect timeout (5s; \`0\` disables it), intervals \`[100, 250, 500, 1000]\` ms.
- Example: \`await expect.poll(async () => (await request.get('/api/order/42')).status(), { timeout: 15_000 }).toBe(200)\`.

**\`expect(async () => {...}).toPass()\`**: when a **block** of steps must be retried together, often with several assertions.
- Example: click "Refresh", then check the status cell; repeat until it says "Shipped".
- Defaults: intervals \`[100, 250, 500, 1000]\` ms; **timeout 0**, meaning it has no own limit and keeps retrying until the **test** times out. It does not follow \`expect.timeout\`. I always set \`{ timeout }\`.
- Inner web-first assertions should get short timeouts (e.g. 1s) so each attempt is quick.

**Dangers:**
- **Side effects inside \`toPass\`**: if the block clicks "Add to cart", every retry adds another item. Keep blocks idempotent (refresh, read, check).
- **Hiding real bugs**: wrapping a flaky UI assertion in \`toPass\` to make it green can mask a race in the product. Use these tools for genuinely eventual-consistency behaviour (async jobs, queues), not to paper over a wrong locator.
- **Silent long waits**: \`toPass\` without a timeout can eat the whole 30s test budget.

**Summary:** DOM → web-first; one value → \`poll\`; several steps → \`toPass\` with an explicit timeout.`,
      followUps: [
        {
          q: 'Could you replace expect.poll with a for-loop and waitForTimeout?',
          a: 'You could, but you would rebuild retry intervals, a total timeout and a decent error message by hand, and the loop usually has bugs (no upper bound, swallowed errors). expect.poll gives all of that in one line and reports the last received value on failure.',
        },
        {
          q: 'Why give inner assertions in toPass a short timeout?',
          a: 'Each attempt should fail fast so the outer loop can retry. With the default 5s inner timeout and a 30s outer limit, you only get about five attempts and each one waits the full 5s before refreshing again, which wastes time and makes the behaviour hard to reason about.',
        },
      ],
      pitfalls: [
        'Believing toPass uses the 5s expect timeout by default',
        'Putting non-idempotent actions inside toPass',
        'Using poll or toPass for plain DOM checks',
      ],
    },
    {
      id: 'pw-assertions-waiting-iq-7',
      difficulty: 'expert',
      question: 'You join a team whose Playwright suite has around 200 waitForTimeout calls and a 25% flaky rate. How do you plan and execute removing them safely?',
      context: 'The suite runs on GitHub Actions with retries: 2. Management wants fewer flaky reruns without pausing feature testing.',
      whatInterviewerLooksFor: [
        'Measures before changing (flaky rate, time spent sleeping)',
        'Prioritises by impact',
        'Has a mechanical replacement strategy per pattern',
        'Prevents regression via lint and review rules',
        'Verifies with repeat runs and traces',
      ],
      modelAnswer: `**1. Measure the baseline.**
- Count sleeps per file (\`grep -rn waitForTimeout tests/\`) and total sleep time: 200 calls averaging 2s is about 400s of pure waiting per full run.
- From CI reports, list tests marked flaky (passed on retry) over the last few weeks. Rank files by flaky count multiplied by run frequency.

**2. Classify each sleep by intent.** Nearly every sleep is waiting for one of a few things:

| Sleep is waiting for | Replace with |
|---|---|
| Element to appear / change | \`await expect(loc).toBeVisible()\` / \`toHaveText\` |
| Loader to go away | \`await expect(spinner).toBeHidden()\` after a positive anchor |
| Navigation | \`await expect(page).toHaveURL(...)\` |
| API data | \`page.waitForResponse\` created before the trigger |
| Element to be clickable | Nothing: actions auto-wait |
| Eventually-consistent backend | \`expect.poll\` with an explicit timeout |

Remove \`isVisible()\`/\`textContent()\` snapshot assertions in the same pass, since they were only working because of the sleeps.

**3. Execute in small PRs**, highest flaky impact first, one feature area per PR, so reviews are quick and feature work continues.

**4. Verify each PR:** run the changed specs with \`--repeat-each=20\` locally and in CI, with \`trace: 'retain-on-failure'\` to diagnose any remaining failure. A change is done when it passes all repeats and runs faster.

**5. Prevent regressions:** add \`playwright/no-wait-for-timeout\` and \`no-floating-promises\` lint rules as errors for new code (warnings for legacy files until cleaned), and a review checklist item. Set \`actionTimeout\` so stuck actions fail clearly.

**6. Report outcomes:** flaky rate, suite duration and rerun minutes saved, before vs after. That turns a clean-up task into visible value for management.

Where a sleep hides a real product race (data loads after the button is enabled), I file a bug rather than adding another workaround.`,
      followUps: [
        {
          q: 'Some tests still flake after removing sleeps. What next?',
          a: 'Open the trace from a failing repeat and look at what the page showed at the failing step. Typical leftovers are shared test data between parallel workers, tests depending on order, animations without stable states, or genuine app races. Fix isolation first (unique data per test), then report app races as bugs with the trace attached.',
        },
        {
          q: 'Should retries be set to 0 during this work?',
          a: 'Keep retries in CI so delivery is not blocked, but track "flaky" (passed on retry) as a metric and treat it as a failure for the cleanup work. Locally, run with retries 0 and --repeat-each to expose flakiness instead of hiding it.',
        },
      ],
      pitfalls: [
        'Doing a big-bang rewrite of all 200 in one PR',
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
      insight: 'Because actions have no default timeout, a stuck action burns the whole test budget. Setting actionTimeout makes failures faster and more specific, and keeps time for teardown and trace capture.',
      followUps: [
        {
          q: 'Would increasing the test timeout to 60s help this test?',
          a: 'No. The overlay never goes away, so a longer timeout only delays the same failure by 30 more seconds. The fix is to handle the overlay (accept cookies or pre-set the consent cookie) or to report it as a bug if users are blocked too.',
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
      insight: 'The question is never "generic or web-first?" in the abstract; it is "is this value still changing?". Live page state needs a retrying matcher; data you already computed does not.',
      followUps: [
        {
          q: 'Line (3): how do you make sure the computed total was based on loaded data?',
          a: 'Put a web-first assertion before the snapshot read, for example `await expect(rows).toHaveCount(4)` or `toHaveText` on the last row, then read allTextContents and compute. The retrying assertion guarantees the snapshot is taken after the table finished loading.',
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
      insight: 'Hard waits cost time on every run even when the app is fast, and still fail when it is slow. Web-first assertions win on both speed and reliability, which is an easy case to make to a manager with numbers.',
      followUps: [
        {
          q: 'Add flakiness: 10% of tests used to retry once (avg 20s each). What else is saved?',
          a: '15 tests × 20s = 300s of serial retry time per run, about 75s wall-clock on 4 workers, plus the human cost of investigating red builds. If the cleanup halves the flaky rate, that is roughly another 37s per run and about 12 minutes per day, on top of the sleep savings.',
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
        'isVisible() returns the current visibility immediately and does not retry; toBe(true) only compares the stored boolean, so it fails while "Loading..." shows. Waiting up to 5 seconds describes await expect(locator).toBeVisible(), not this code. Nothing here waits for the test timeout, and isVisible returns a promise that can be awaited.',
      followUps: [
        {
          q: 'Rewrite it correctly.',
          a: "await expect(page.locator('#finish')).toBeVisible(); and since this page can take about 5s in other variants, add { timeout: 10_000 } if needed.",
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
        'Web-first assertions retry only for the expect timeout, which defaults to 5 seconds, so a toast that needs 7 seconds is not seen in time. The 30 second limit is the test timeout, a different budget. The assertion does not fail instantly, because retrying is the whole point. It never waits for network idle.',
      followUps: [
        {
          q: 'What is the right fix if 7 s is expected behaviour on that environment?',
          a: "Give that one assertion more time: await expect(toast).toBeVisible({ timeout: 10_000 }). If the whole CI environment is slower, raise expect.timeout for the CI project in the config rather than for every environment.",
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
        'Web-first assertions return a promise; without await nothing waits for it, so the test can end before the check finishes and the failure may be lost or reported out of place. Any locator works with toBeVisible. Custom messages are optional, and no explicit load-state wait is required because the assertion retries on its own.',
      followUps: [
        {
          q: 'How do you catch this mistake automatically?',
          a: 'Enable @typescript-eslint/no-floating-promises or eslint-plugin-playwright\'s missing-playwright-await rule and run lint in CI so the PR fails.',
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
        'toHaveText, toHaveURL and toHaveCount are web-first matchers on a locator or page and keep re-querying until they pass. The textContent version reads the text once and toBe compares a fixed string. toHaveLength on an array is a generic matcher on a value you already hold, so it cannot change between attempts.',
      followUps: [
        {
          q: 'When is the array toHaveLength perfectly fine?',
          a: 'When the array is plain data that will not change, such as parsed API JSON or a list read after a web-first assertion proved the page had loaded.',
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
        'toHaveText with a string requires the full text to match after whitespace normalisation, so "Hello" does not equal "Hello World!". A passes because toContainText checks a substring. C passes because the case-insensitive regex finds a match. D passes because leading and trailing whitespace is normalised.',
      followUps: [
        {
          q: 'Which would you choose for an error message that includes a dynamic order id?',
          a: 'A regex with toHaveText, for example toHaveText(/^Order #\\d+ confirmed$/), so the fixed parts are strict and only the id varies.',
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
        'toBeHidden passes when the element is hidden or not in the DOM at all, and it retries until the removal happens. The isVisible snapshot may run before the delete completes and does not retry. toBeVisible with timeout 0 asserts the opposite. toHaveText on a removed element waits for an element that no longer exists and times out.',
      followUps: [
        {
          q: 'How would you also prove the count dropped?',
          a: 'await expect(page.getByRole(\'row\')).toHaveCount(previousCount - 1), using a count read before the delete, or the known expected number.',
        },
      ],
    },
    {
      id: 'pw-assertions-waiting-mcq-07',
      difficulty: 'medium',
      question: 'Clicks on covered buttons currently hang until the test is killed at 30 s. Which single config change makes every click and fill give up after 10 s with an action-specific error?',
      options: [
        'timeout: 10_000',
        'expect: { timeout: 10_000 }',
        'use: { actionTimeout: 10_000 }',
        'globalTimeout: 10_000',
      ],
      correct: [2],
      explanation:
        'actionTimeout under use limits each action such as click or fill, which otherwise has no default timeout. The top-level timeout would cut the whole test to 10 s. expect.timeout only affects assertions. globalTimeout caps the entire run, which would stop the suite after 10 seconds.',
      followUps: [
        {
          q: 'Which setting would you pair with it for page.goto?',
          a: 'use: { navigationTimeout: 20_000 }, since navigation also has no default timeout and would otherwise be bounded only by the test timeout.',
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
        'A soft assertion records the failure and lets the test continue, but the test is still marked failed at the end. Stopping immediately is what a normal assertion does. Soft failures are never just warnings, and they have nothing to do with skipping.',
      followUps: [
        {
          q: 'How do you stop the test before a dependent step if any soft check failed?',
          a: 'Add expect(test.info().errors).toHaveLength(0) before that step; it fails the test right there when soft errors were collected.',
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
        'Action timeout has no default, so the click keeps retrying the receives-events check until the test timeout of 30s runs out, about 28s after goto. The expect timeout applies to assertions, not actions. Clicks retry rather than fail at once, and the test timeout prevents waiting forever.',
      followUps: [
        {
          q: 'How would you make this fail faster with a clearer error?',
          a: 'Set use: { actionTimeout: 10_000 } in the config, or pass { timeout } to that click. The error then names the click and the intercepting element.',
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
        'Per the actionability table, fill (and clear) waits for Visible, Enabled and Editable. Stable and Receives events apply to pointer actions such as click, check, hover and dragTo. Fill does not go through the pointer at all; it focuses the element and sets the value, so overlays and animations do not stop it.',
      followUps: [
        {
          q: 'A field has the readonly attribute. What happens when you fill it?',
          a: 'It is not editable, so fill keeps retrying and fails at the timeout with a log saying the element is not editable. That is correct behaviour because a user cannot type there; assert it with toBeEditable({ editable: false }) or toHaveAttribute(\'readonly\', \'\').',
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
        'toPass has a default timeout of 0, meaning no limit of its own, and it ignores the expect timeout, so it keeps retrying until the 30s test timeout. The default intervals [100, 250, 500, 1000] are delays, not a retry count; the last one repeats. Each attempt also spends up to 5s inside the inner toHaveText, making the run even slower.',
      followUps: [
        {
          q: 'How would you write it properly?',
          a: "Give toPass an explicit limit and the inner assertion a short timeout: toHaveText('Shipped', { timeout: 1_000 }) inside, and .toPass({ intervals: [1_000, 2_000, 5_000], timeout: 30_000 }) outside.",
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
        'networkidle needs a quiet network for 500 ms, and a ping every 400 ms prevents that, so navigation waits until a timeout. That is one reason the docs mark networkidle as discouraged. It fires after load, not before, it does not filter analytics, and even when it fires it says nothing about whether the UI rendered the data.',
      followUps: [
        {
          q: 'What should the test wait for instead?',
          a: 'Keep the default goto and assert on visible content, for example await expect(page.getByRole(\'heading\', { name: \'Dashboard\' })).toBeVisible() and a data widget\'s text.',
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
        'toHaveCount is a web-first assertion that re-counts until it sees exactly 3 or times out. count(), all() and allTextContents() each take a single snapshot. The docs warn that all() does not wait for elements and gives unpredictable results on dynamic lists. A, B and D can all see 0 or a partial list.',
      followUps: [
        {
          q: 'You also need the texts in order. How?',
          a: "await expect(results).toHaveText(['Result 1', 'Result 2', 'Result 3']). The array form checks count, order and content, and it retries.",
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
        'Both helpers default to the intervals 100, 250, 500, 1000 ms. expect.poll calls a function, checks its return value with a normal matcher, and is bounded by the expect timeout. toPass is the exception: its default timeout is 0, meaning it ignores the expect timeout and can run until the test times out, so the third statement is false.',
      followUps: [
        {
          q: 'Give a case for expect.poll that a locator assertion cannot handle.',
          a: 'Waiting until an API returns status 200 or a field becomes "SHIPPED" after a UI action, or until a value in localStorage is set via page.evaluate. None of those is a DOM state a locator matcher can see.',
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
        'Per the docs, an element with a non-empty box and no visibility:hidden is visible even at opacity 0. The assertion is satisfied as soon as the toast is in the DOM, while it is still transparent. toBeVisible does retry, but it has nothing left to wait for. Screenshots run in order after the await, and toBeVisible does not check stability at all.',
      followUps: [
        {
          q: 'How would you make the screenshot reliable?',
          a: "Assert the final style, for example await expect(toast).toHaveCSS('opacity', '1'), before the screenshot. Alternatively, disable animations with toHaveScreenshot's animations: 'disabled' option or a reduced-motion setting in the test.",
        },
      ],
    },
  ],
};

export default topic;
