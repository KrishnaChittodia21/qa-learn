import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-actions',
  phase: 'pw-basics',
  order: 3,
  title: 'Actions: Clicking, Typing, Dialogs, Tabs, Frames and Tables',
  subtitle:
    'Everything a user does with mouse and keyboard, expressed as Playwright actions: navigation, clicks, typing, dropdowns, drag and drop, uploads and downloads, browser dialogs, new tabs, iframes and data tables.',
  estimatedMinutes: 110,
  sources: [
    'Playwright docs — Actions (playwright.dev/docs/input)',
    'Playwright docs — Dialogs (playwright.dev/docs/dialogs)',
    'Playwright docs — Pages: new pages and popups (playwright.dev/docs/pages)',
    'Playwright docs — Frames (playwright.dev/docs/frames)',
    'Playwright docs — Downloads (playwright.dev/docs/downloads)',
    'Playwright docs — Navigations (playwright.dev/docs/navigations)',
    'Playwright docs — Auto-waiting / actionability (playwright.dev/docs/actionability)',
    'Playwright API reference — Locator, Page, Dialog, Download, FrameLocator',
    'Playwright docs — Best practices (playwright.dev/docs/best-practices)',
    'Checkly — Playwright learn guides (interaction, waits)',
    'Practice targets: the-internet.herokuapp.com (dropdown, javascript_alerts, upload, download, windows, iframe, nested_frames, tables, drag_and_drop) and saucedemo.com',
  ],
  tags: ['playwright', 'actions', 'click', 'fill', 'selectOption', 'dialogs', 'popups', 'iframes', 'upload', 'download', 'tables', 'drag-and-drop'],
  cheatSheet: [
    'Every action is async: always `await locator.click()`. An action resolves the locator, waits for actionability, scrolls into view, then acts. No default action timeout: it waits until the 30s test timeout unless you set `actionTimeout`.',
    '`page.goto(url)` waits for `load` by default; `waitUntil` can be `load` | `domcontentloaded` | `commit` | `networkidle` (discouraged). Use `page.waitForURL(\'**/inventory.html\')` after a click that navigates.',
    '`fill()` replaces the value in one go (preferred). `pressSequentially(text, { delay })` types key by key for autocomplete/keystroke handlers. `press(\'Enter\')` sends one key. `page.type` is deprecated.',
    'Clicks: `click()`, `dblclick()`, `click({ button: \'right\' })`, `click({ modifiers: [\'Shift\'] })`, `hover()`. `{ force: true }` skips checks and can hide real bugs (an overlay a user cannot click through).',
    'Native `<select>` → `selectOption(\'value\')`, `selectOption({ label })`, `selectOption({ index })`, or an array for multi-select. Custom div dropdowns → click the trigger, then click `getByRole(\'option\', { name })`.',
    '`check()` / `uncheck()` / `setChecked(bool)` for checkboxes and radios; they verify the state actually changed.',
    'Upload: `setInputFiles(path | path[] | [] | { name, mimeType, buffer })`. Download: `const p = page.waitForEvent(\'download\'); await click; const d = await p; await d.saveAs(...)`.',
    'Dialogs are auto-dismissed if no listener exists. Register `page.once(\'dialog\', d => d.accept())` BEFORE the click; a listener that never calls accept()/dismiss() makes the click hang.',
    'New tab: `const p = context.waitForEvent(\'page\')` (or `page.waitForEvent(\'popup\')`) BEFORE the click, then `const tab = await p`. Awaiting after the click races and can miss the event.',
    'Iframes: `page.frameLocator(\'#mce_0_ifr\').locator(\'#tinymce\')` or `page.locator(\'iframe\').contentFrame()`. Page-level locators never look inside frames.',
    'Tables: `page.locator(\'#table1 tbody tr\').filter({ hasText: \'Bach\' })` finds a row by content; then read a cell with `.locator(\'td\').nth(3)`. `allTextContents()` returns a snapshot array.',
    'Drag: `source.dragTo(target)`; fallback is `hover → mouse.down → hover target (twice for dragover) → mouse.up`. Scrolling is automatic; `mouse.wheel(0, 500)` for infinite lists.',
  ],
  sections: [
    {
      heading: 'What happens when you call an action',
      body: `**Intuition:** an action is a polite robot finger. Before it presses a button it looks for the button, waits until it can actually be pressed (visible, not moving, not covered, not disabled), scrolls it into view, and only then presses. A manual tester does the same without thinking about it.

Every call like \`await page.getByRole('button', { name: 'Login' }).click()\` goes through four stages:

1. **Resolve** the locator to exactly one element (strict mode: two matches is an error, not a guess).
2. **Wait for actionability**: the checks depend on the action (a click needs visible, stable, receives events and enabled; \`fill\` needs visible, enabled and editable). The full table lives in the next topic, *Assertions and waiting*.
3. **Scroll** the element into view if needed.
4. **Perform** the real input event (mouse move + down + up for a click, an \`input\` event for \`fill\`).

If the element never becomes actionable, the action keeps retrying. Playwright has **no default action timeout**, so the wait is bounded only by the **test timeout (30s)** unless you set \`use: { actionTimeout: 10_000 }\` in the config or pass \`{ timeout }\` to the call.

**Every action returns a Promise.** Forgetting \`await\` is the number one beginner bug: the next line runs before the click has happened, and the test may even finish before the action fails.

| Want to do | Use | Avoid |
|---|---|---|
| Open a URL | \`page.goto('/inventory.html')\` | Typing into the address bar |
| Click | \`locator.click()\` | \`page.click('css')\`, \`elementHandle.click()\` |
| Type a value | \`locator.fill('text')\` | \`page.type()\` (deprecated) |
| Press a key | \`locator.press('Enter')\` | \`page.keyboard\` when a locator works |
| Pick from \`<select>\` | \`locator.selectOption('2')\` | Clicking \`<option>\` elements |
| Tick a box | \`locator.check()\` | \`click()\` (does not verify the state) |

**In interviews, say this:** "Playwright actions auto-wait for the element to be actionable, so I do not add sleeps before clicks. I use locator-based actions, I always await them, and I keep \`force: true\` for rare, justified cases."`,
      code: [
        {
          language: 'typescript',
          title: 'A first realistic action sequence on SauceDemo',
          code: `import { test, expect } from '@playwright/test';

test('standard user can log in', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  // fill(): waits for the input to be visible, enabled and editable, then sets the value
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');

  // click(): waits for visible, stable, receives events, enabled; then clicks
  await page.getByRole('button', { name: 'Login' }).click();

  // the action does not "check" anything: the assertion does
  await expect(page).toHaveURL(/inventory\\.html/);
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
});`,
        },
      ],
      diagram: `  await locator.click()
        |
        v
  [1 resolve] --0 or 2+ matches--> retry (2+ = strict mode error)
        |
        v
  [2 actionable?] --no--> retry ... until actionTimeout / test timeout
        |
        v
  [3 scroll into view]  -->  [4 mouse move, down, up]  -->  resolves`,
      keyPoints: [
        'Actions resolve, wait for actionability, scroll, then act.',
        'No default action timeout: the 30s test timeout is the usual limit.',
        'Always await; actions do not verify outcomes, assertions do.',
      ],
      source: 'Playwright docs — Actions; Auto-waiting (actionability)',
    },
    {
      heading: 'Navigation: goto, waitUntil, reload and history',
      body: `**Intuition:** \`goto\` is typing a URL and pressing Enter, then waiting for the browser's loading spinner to stop.

- \`page.goto(url)\` resolves when the page fires the **\`load\`** event (all images, scripts and styles loaded). It returns the main response, so you can check the status.
- \`waitUntil\` changes what "loaded" means:

| \`waitUntil\` | Resolves when | Use it |
|---|---|---|
| \`'load'\` (default) | \`load\` event fired | Almost always |
| \`'domcontentloaded'\` | HTML parsed, before images | Heavy pages where you only need the DOM |
| \`'commit'\` | Response received, document starts loading | Rare: testing very early page state |
| \`'networkidle'\` | No network traffic for 500 ms | **Discouraged** by the docs: analytics and polling can keep it from ever settling; assert on the UI instead |

- With \`baseURL\` in the config, write \`page.goto('/inventory.html')\`.
- \`page.reload()\`, \`page.goBack()\`, \`page.goForward()\` mirror the browser buttons.
- After a click that triggers navigation, you do **not** need \`waitForNavigation\` (deprecated). Either assert on the destination with \`await expect(page).toHaveURL(...)\`, or use \`await page.waitForURL('**/checkout-step-one.html')\` when you need to be on the new page before acting.

**Common mistake:** adding \`waitUntil: 'networkidle'\` "to be safe". It slows every test and can still be wrong for single-page apps that render after the network quietens. Wait for what the user waits for: the content.

**Worked example (manual tester's view):** the regression case "Back button returns to the product list with filters kept" becomes \`goBack()\` plus an assertion on the sort dropdown's value.`,
      code: [
        {
          language: 'typescript',
          title: 'Navigation helpers with assertions on the result',
          code: `import { test, expect } from '@playwright/test';

test('back button returns to the product list', async ({ page }) => {
  const response = await page.goto('https://www.saucedemo.com/');
  expect(response?.status()).toBe(200);   // goto returns the main response

  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/inventory.html');      // be sure we arrived

  await page.getByText('Sauce Labs Backpack').click();
  await expect(page).toHaveURL(/inventory-item\\.html\\?id=4/);

  await page.goBack();                               // browser Back
  await expect(page).toHaveURL(/inventory\\.html/);

  await page.reload();                               // F5
  await expect(page.locator('[data-test="title"]')).toHaveText('Products');
});`,
        },
      ],
      keyPoints: [
        'goto waits for load by default and returns the response.',
        'networkidle is discouraged; assert on visible content instead.',
        'Use toHaveURL or waitForURL after navigation clicks, not waitForNavigation.',
      ],
      source: 'Playwright docs — Navigations; API reference page.goto',
    },
    {
      heading: 'Clicking, hovering and the force option',
      body: `**Intuition:** most clicks are just \`click()\`. The variants exist because real users also double-click, right-click, Shift-click and hover.

| Need | Code |
|---|---|
| Normal click | \`await btn.click()\` |
| Double click | \`await row.dblclick()\` |
| Right click (context menu) | \`await row.click({ button: 'right' })\` |
| Shift / Ctrl-or-Cmd click | \`await item.click({ modifiers: ['Shift'] })\`, \`['ControlOrMeta']\` |
| Click a point inside | \`await canvas.click({ position: { x: 10, y: 20 } })\` |
| Hover to reveal a menu | \`await menu.hover()\` |
| Skip actionability checks | \`await btn.click({ force: true })\` |
| Fire a DOM event only | \`await btn.dispatchEvent('click')\` |

**About \`force: true\`.** It skips the non-essential checks, including "receives events". That means Playwright will click **even if a cookie banner covers the button**. A real user cannot do that, so a forced click can turn a real defect (overlay blocks checkout) into a passing test. Legitimate uses are rare: an element that is intentionally covered by a transparent styled layer (custom checkbox), or a known third-party quirk, always with a comment explaining why.

**\`dispatchEvent('click')\`** does not move the mouse at all; it only fires the event on the element. Useful for testing an event handler in isolation, not for simulating a user.

**Hover menus:** \`hover()\` then click the revealed item. If the menu closes when the mouse leaves, do not interleave other actions between the two lines.

**In interviews, say this:** "If a click fails with 'element intercepts pointer events', my first question is whether a user would also be blocked. If yes, that is a bug to report, not something to force."`,
      code: [
        {
          language: 'typescript',
          title: 'Click variants and the right response to an overlay',
          code: `import { test, expect } from '@playwright/test';

test('context menu and modifier clicks', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/context_menu');

  // right click fires a JS alert on this page, so accept it first
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#hot-spot').click({ button: 'right' });

  await page.goto('https://the-internet.herokuapp.com/hovers');
  const firstAvatar = page.locator('.figure').first();
  await firstAvatar.hover();                         // reveals the caption
  await expect(firstAvatar.getByText('name: user1')).toBeVisible();
});

test('overlay: dismiss it like a user, do not force', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/entry_ad');
  // BAD: await page.getByText('Click here').click({ force: true });
  const modal = page.locator('#modal');
  await expect(modal).toBeVisible();
  await modal.getByText('Close').click();            // what a user would do
  await expect(modal).toBeHidden();
});`,
        },
      ],
      keyPoints: [
        'Use options (button, modifiers, position) instead of low-level mouse code.',
        'force: true can hide overlay bugs; justify every use in a comment.',
        'dispatchEvent fires an event without a real pointer interaction.',
      ],
      source: 'Playwright docs — Actions: mouse click, forcing actions',
    },
    {
      heading: 'Typing: fill vs pressSequentially vs press',
      body: `**Intuition:** \`fill\` is pasting a value, \`pressSequentially\` is typing it one key at a time, \`press\` is hitting a single key or shortcut.

| Method | What it does | When |
|---|---|---|
| \`fill('text')\` | Focuses, clears, sets the whole value, fires \`input\` | **Default** for inputs, textareas, \`contenteditable\` |
| \`clear()\` | Empties the field | Testing a required-field error |
| \`pressSequentially('text', { delay: 100 })\` | Sends keydown/keypress/keyup for each character | Autocomplete, input masks, per-key validation |
| \`press('Enter')\` | One key or chord on the focused element | Submit with Enter, \`Tab\`, \`ArrowDown\`, \`ControlOrMeta+A\` |
| \`page.keyboard.press('Escape')\` | Key press on whatever is focused | No natural element to target (close a modal) |
| \`page.type()\` | Deprecated | Never in new code |

Key facts:
- \`fill\` throws if the target is not an \`<input>\`, \`<textarea>\` or \`[contenteditable]\` (a \`<label>\` pointing at a control is allowed; the control is filled).
- \`fill\` waits for **visible, enabled and editable**, so a \`readonly\` field makes it wait and fail. That is a correct failure: the user cannot type there either.
- Key names: \`Enter\`, \`Tab\`, \`Backspace\`, \`Escape\`, \`ArrowDown\`, \`F2\`, \`Shift+A\`. \`ControlOrMeta\` is Ctrl on Windows/Linux and Cmd on macOS, so one test works on both.

**Worked example:** testing a search box that suggests results as you type. \`fill('lap')\` sets the value but some widgets only listen for \`keyup\`, so no suggestions appear. Switch to \`pressSequentially('lap')\`, then pick a suggestion with \`ArrowDown\` + \`Enter\`.

**Common mistake:** using \`pressSequentially\` everywhere "because it is more realistic". It is slower and adds no coverage for ordinary inputs.`,
      code: [
        {
          language: 'typescript',
          title: 'Typing, clearing and keyboard shortcuts',
          code: `import { test, expect } from '@playwright/test';

test('login form keyboard behaviour', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  const username = page.getByPlaceholder('Username');
  const password = page.getByPlaceholder('Password');

  await username.fill('standard_user');
  await username.clear();                            // empty it again
  await expect(username).toHaveValue('');

  // type key by key with a small delay (only needed for keystroke handlers)
  await username.pressSequentially('standard_user', { delay: 50 });
  await password.fill('secret_sauce');

  await password.press('Enter');                     // submit with the keyboard
  await expect(page).toHaveURL(/inventory\\.html/);
});

test('select all and replace using a cross-platform shortcut', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/inputs');
  const box = page.getByRole('spinbutton');
  await box.fill('42');
  await box.press('ControlOrMeta+A');                // Ctrl+A or Cmd+A
  await box.press('Backspace');
  await expect(box).toHaveValue('');
});`,
        },
      ],
      keyPoints: [
        'fill is the default; pressSequentially only for per-key behaviour.',
        'press handles keys and chords; ControlOrMeta is cross-platform.',
        'page.type is deprecated.',
      ],
      source: 'Playwright docs — Actions: text input, type characters, keys and shortcuts',
    },
    {
      heading: 'Checkboxes, radios and dropdowns (native vs custom)',
      body: `**Intuition:** a native dropdown is a real \`<select>\` element the browser draws; a custom dropdown is a pile of \`div\`s that only *looks* like one. Playwright treats them very differently.

**Checkboxes and radios.** \`check()\`, \`uncheck()\` and \`setChecked(true | false)\` click only if needed and then **verify** the state changed (they throw if the page ignores the click). \`click()\` toggles blindly, so prefer \`check()\`.

**Native \`<select>\`**: use \`selectOption\`. It waits for the select to be visible and enabled and for the requested options to exist, selects them, fires \`input\` and \`change\`, and returns the selected values.

| Call | Selects by |
|---|---|
| \`selectOption('lohi')\` | \`value\` attribute (falls back to label) |
| \`selectOption({ label: 'Price (low to high)' })\` | Visible text |
| \`selectOption({ index: 2 })\` | Position (fragile, avoid) |
| \`selectOption(['red', 'green'])\` | Several values in a \`multiple\` select |

SauceDemo's sort dropdown is \`[data-test="product-sort-container"]\` with values \`az\`, \`za\`, \`lohi\`, \`hilo\`. On the-internet \`/dropdown\`, \`#dropdown\` has options valued \`1\` and \`2\`.

**Custom dropdowns** (React Select, MUI, Angular Material): there is no \`<select>\`, so \`selectOption\` throws "Element is not a select". Do what the user does: click the trigger, then click the option. Good components expose \`role="combobox"\` and \`role="option"\`, so \`getByRole\` works. Assert on the trigger's displayed text.

**In interviews, say this:** "First I inspect the DOM. If it is a real \`<select>\` I use \`selectOption\` by value or label and assert with \`toHaveValue\`. If it is a custom widget I click the combobox and then the option by role and name."`,
      code: [
        {
          language: 'typescript',
          title: 'Native select on SauceDemo, checkboxes on the-internet',
          code: `import { test, expect } from '@playwright/test';

test('sort products by price, low to high', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  const sort = page.locator('[data-test="product-sort-container"]');
  await sort.selectOption({ label: 'Price (low to high)' });
  await expect(sort).toHaveValue('lohi');            // the value behind the label

  const prices = await page.locator('[data-test="inventory-item-price"]').allTextContents();
  const numbers = prices.map((p) => Number(p.replace('$', '')));
  expect(numbers).toEqual([...numbers].sort((a, b) => a - b));   // ascending
});

test('checkboxes report their state', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/checkboxes');
  const boxes = page.getByRole('checkbox');
  await boxes.first().check();                       // no-op if already checked
  await boxes.nth(1).setChecked(false);
  await expect(boxes.first()).toBeChecked();
  await expect(boxes.nth(1)).not.toBeChecked();
});`,
        },
        {
          language: 'typescript',
          title: 'Custom (div-based) dropdown pattern',
          code: `import { test, expect } from '@playwright/test';

// Pattern for a React/MUI style dropdown: no <select> element exists.
test('choose a country in a custom combobox', async ({ page }) => {
  await page.goto('/profile');                       // your app, baseURL in config

  const country = page.getByRole('combobox', { name: 'Country' });
  await country.click();                             // opens the listbox
  await page.getByRole('option', { name: 'India' }).click();

  await expect(country).toHaveText(/India/);         // what the user now sees
});`,
        },
      ],
      keyPoints: [
        'check/uncheck/setChecked verify the result; click does not.',
        'selectOption only works on a real <select>; by value, label, index or array.',
        'Custom dropdowns: click the combobox, click the option by role.',
      ],
      source: 'Playwright docs — Actions: checkboxes and radio buttons, select options',
    },
    {
      heading: 'Drag and drop, mouse and scrolling',
      body: `**Intuition:** dragging is "press, move, release". Playwright can do it in one call, or step by step when a page is picky.

- **High level:** \`await source.dragTo(target)\` hovers the source, presses the mouse, moves to the target and releases. Options \`sourcePosition\` / \`targetPosition\` pick exact points.
- **Manual fallback:** \`source.hover()\`, \`page.mouse.down()\`, \`target.hover()\`, \`page.mouse.up()\`. Some pages only react to the \`dragover\` event after the pointer has moved over the target once, so the docs suggest hovering the target **twice**.
- **Scrolling:** actions scroll automatically. Explicit scrolling is only needed for behaviour triggered *by* scrolling: infinite lists, "back to top" buttons, lazy images. Use \`locator.scrollIntoViewIfNeeded()\` or \`page.mouse.wheel(0, 800)\` after hovering the scroll container.
- **Raw mouse/keyboard** (\`page.mouse.move/down/up\`, \`page.keyboard.down('Shift')\`) is for canvases, sliders and drawing apps where there is no element to target.

**Worked example (the-internet \`/drag_and_drop\`):** two boxes, \`#column-a\` (header "A") and \`#column-b\` (header "B"). After dragging A onto B, the headers swap: the first column shows "B". That swap is your expected result, exactly as you would write it in a manual test case.

**Common mistake:** asserting nothing after a drag. The drag "succeeding" only means the mouse moved; the assertion proves the app reacted.`,
      code: [
        {
          language: 'typescript',
          title: 'dragTo, manual drag and scroll-triggered loading',
          code: `import { test, expect } from '@playwright/test';

test('swap columns A and B', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/drag_and_drop');
  const a = page.locator('#column-a');
  const b = page.locator('#column-b');

  await a.dragTo(b);                                 // one-call drag and drop
  await expect(a.locator('header')).toHaveText('B'); // columns swapped
  await expect(b.locator('header')).toHaveText('A');
});

test('manual drag for picky widgets', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/drag_and_drop');
  await page.locator('#column-a').hover();
  await page.mouse.down();
  await page.locator('#column-b').hover();
  await page.locator('#column-b').hover();           // second hover fires dragover
  await page.mouse.up();
  await expect(page.locator('#column-a header')).toHaveText('B');
});

test('infinite scroll loads more paragraphs', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/infinite_scroll');
  const paragraphs = page.locator('.jscroll-added');
  const before = await paragraphs.count();
  await page.mouse.wheel(0, 3000);                   // scroll like a user
  await expect(paragraphs).not.toHaveCount(before);  // retries until more load
});`,
        },
      ],
      keyPoints: [
        'dragTo first; manual mouse steps when the app needs dragover.',
        'Scrolling is automatic for actions; scroll explicitly only to trigger behaviour.',
        'Always assert the visible outcome of a drag.',
      ],
      source: 'Playwright docs — Actions: drag and drop, scrolling',
    },
    {
      heading: 'Uploading and downloading files',
      body: `**Intuition:** you cannot click through the operating system's file picker in a test, so Playwright hands the file straight to the \`<input type="file">\`. For downloads, you listen for the browser's "download started" event and then decide where to save it.

**Upload with \`setInputFiles\`** (no actionability checks; works even on a hidden input):

| Form | Example |
|---|---|
| One file | \`setInputFiles('tests/data/invoice.pdf')\` |
| Several files | \`setInputFiles(['a.png', 'b.png'])\` (input needs \`multiple\`) |
| Clear selection | \`setInputFiles([])\` |
| In-memory file | \`setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') })\` |

When the input is created dynamically only after a click (no input exists up front), use the **filechooser** event: start \`page.waitForEvent('filechooser')\`, click the upload button, then \`fileChooser.setFiles(...)\`.

**Download with the \`download\` event:**
1. \`const downloadPromise = page.waitForEvent('download');\` (no \`await\` yet)
2. Click the link.
3. \`const download = await downloadPromise;\`
4. Check \`download.suggestedFilename()\`, then \`await download.saveAs(path)\` if you need the file. Read it with Node's \`fs\` to verify contents.

Downloaded files are temporary and **deleted when the browser context closes**, so save them if you need them later in the test.

**Worked example test cases (manual → automated):** "Upload a .txt file, see its name on the success page" maps to the-internet \`/upload\`: \`#file-upload\`, \`#file-submit\`, success heading "File Uploaded!" and the filename in \`#uploaded-files\`.`,
      code: [
        {
          language: 'typescript',
          title: 'Upload on the-internet, then download and verify a file',
          code: `import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('upload an in-memory text file', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/upload');
  await page.locator('#file-upload').setInputFiles({
    name: 'qa-notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('uploaded by Playwright'),
  });
  await page.locator('#file-submit').click();
  await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
  await expect(page.locator('#uploaded-files')).toHaveText('qa-notes.txt');
});

test('download a file and check it is not empty', async ({ page }, testInfo) => {
  await page.goto('https://the-internet.herokuapp.com/download');
  const downloadPromise = page.waitForEvent('download');   // start listening first
  await page.getByRole('link', { name: 'some-file.txt' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('some-file.txt');
  const target = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(target);                     // temp file is removed with the context
  expect(fs.statSync(target).size).toBeGreaterThan(0);
});`,
        },
      ],
      keyPoints: [
        'setInputFiles takes a path, an array, [] or an in-memory buffer object.',
        'Use the filechooser event only when the input appears after a click.',
        'Start waitForEvent(\'download\') before the click; saveAs before the context closes.',
      ],
      source: 'Playwright docs — Actions: upload files; Downloads',
    },
    {
      heading: 'JavaScript dialogs: alert, confirm, prompt',
      body: `**Intuition:** a browser dialog freezes the page until someone presses OK or Cancel. Playwright needs to know in advance which button you want pressed.

**Defaults:** if no \`dialog\` listener is registered, Playwright **auto-dismisses** every dialog (OK for an alert; Cancel for a confirm; null for a prompt). The test continues, but a confirm would be cancelled, which may not be what you wanted.

**Handling one yourself:**
- Register the listener **before** the action that opens the dialog: \`page.once('dialog', d => d.accept())\`.
- The listener **must** call \`accept()\` or \`dismiss()\`. A listener that only logs \`dialog.message()\` leaves the dialog open and the triggering \`click()\` **hangs** until the test times out.
- \`page.on\` stays registered for every later dialog in the test; \`page.once\` handles just the next one. \`once\` avoids a forgotten global handler silently accepting a later "Delete everything?" confirm.

| Dialog API | Purpose |
|---|---|
| \`dialog.type()\` | \`'alert'\`, \`'confirm'\`, \`'prompt'\` or \`'beforeunload'\` |
| \`dialog.message()\` | Text shown in the dialog |
| \`dialog.defaultValue()\` | Pre-filled value of a prompt |
| \`dialog.accept(text?)\` | OK; for prompts, the text to enter |
| \`dialog.dismiss()\` | Cancel |

**beforeunload** dialogs appear only when you close with \`page.close({ runBeforeUnload: true })\`; handle them with the same listener. Dialogs are different from HTML modals: a modal built with \`div\`s is part of the page and you click it with normal locators.

**Worked example (the-internet \`/javascript_alerts\`):** three buttons; the \`#result\` paragraph shows "You successfully clicked an alert", "You clicked: Ok" / "You clicked: Cancel", or "You entered: <text>".`,
      code: [
        {
          language: 'typescript',
          title: 'Accept, dismiss and answer a prompt',
          code: `import { test, expect } from '@playwright/test';

test.describe('the-internet JavaScript alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
  });

  test('confirm: accept and check the message', async ({ page }) => {
    let message = '';
    page.once('dialog', async (dialog) => {
      message = dialog.message();                    // capture for the assertion
      await dialog.accept();                         // must accept or dismiss
    });
    await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
    expect(message).toBe('I am a JS Confirm');
    await expect(page.locator('#result')).toHaveText('You clicked: Ok');
  });

  test('confirm: no listener means auto-dismiss', async ({ page }) => {
    await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
    await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
  });

  test('prompt: type an answer', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept('Playwright'));
    await page.getByRole('button', { name: 'Click for JS Prompt' }).click();
    await expect(page.locator('#result')).toHaveText('You entered: Playwright');
  });
});`,
        },
      ],
      keyPoints: [
        'No listener → auto-dismiss. A listener that never accepts/dismisses → the action hangs.',
        'Register the handler before the triggering action; prefer page.once.',
        'Capture dialog.message() in the handler and assert after the click.',
      ],
      source: 'Playwright docs — Dialogs; API reference Dialog',
    },
    {
      heading: 'New tabs and popups',
      body: `**Intuition:** clicking a \`target="_blank"\` link is like a waiter handing you a second menu. If you are not already holding out your hand when it arrives, you miss it.

In Playwright, every tab is a \`Page\` inside the same \`BrowserContext\` (same cookies and storage). To get the new tab you wait for an **event**:

- \`context.waitForEvent('page')\`: any new page in the context.
- \`page.waitForEvent('popup')\`: only pages opened *by this page* (window.open or a \`_blank\` link). Both fire for a \`_blank\` link click.

**The ordering rule:** create the wait promise **before** the click, and await it **after**:

1. \`const newTabPromise = context.waitForEvent('page');\` (no \`await\`)
2. \`await link.click();\`
3. \`const newTab = await newTabPromise;\`

If you write \`await link.click()\` first and only then start \`waitForEvent\`, the event may already have fired and your wait sits there until the timeout. Teams often write the same thing with \`Promise.all([context.waitForEvent('page'), link.click()])\`; both are fine.

The new page may still be loading. Locator actions and web-first assertions wait automatically, so usually you can go straight to \`await expect(newTab).toHaveTitle(...)\`; call \`await newTab.waitForLoadState()\` if you need to read something synchronously like \`newTab.url()\`.

Other handy calls: \`context.pages()\` lists all open tabs, \`newTab.close()\` closes one, \`page.bringToFront()\` focuses a tab for screenshots or headed debugging.

**Worked example (the-internet \`/windows\`):** the "Click Here" link opens \`/windows/new\` whose heading is "New Window". Expected results: new tab opens, original tab stays on "Opening a new window".`,
      code: [
        {
          language: 'typescript',
          title: 'Catching a new tab without racing',
          code: `import { test, expect } from '@playwright/test';

test('link opens a new window', async ({ page, context }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');

  const newTabPromise = context.waitForEvent('page');   // 1. listen first (no await)
  await page.getByRole('link', { name: 'Click Here' }).click();   // 2. trigger
  const newTab = await newTabPromise;                   // 3. receive it

  await expect(newTab).toHaveURL(/\\/windows\\/new/);
  await expect(newTab.getByRole('heading', { name: 'New Window' })).toBeVisible();

  // the original tab is untouched
  await expect(page.getByRole('heading', { name: 'Opening a new window' })).toBeVisible();
  expect(context.pages()).toHaveLength(2);

  await newTab.close();
  expect(context.pages()).toHaveLength(1);
});

test('same thing with the popup event', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Click Here' }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveTitle('New Window');
});`,
        },
      ],
      diagram: `  WRONG (race)                      RIGHT
  ------------                      -----
  await click()  --> tab opens      p = waitForEvent('page')  (listening)
                     event fires    await click() --> tab opens, event
  waitForEvent('page')                               caught by p
     ... waits for a 2nd tab ...    tab = await p   --> resolved
     ... timeout                    `,
      keyPoints: [
        'Start waitForEvent before the click, await it after.',
        'popup = opened by this page; page = any new page in the context.',
        'Tabs share the context: same cookies and login.',
      ],
      source: 'Playwright docs — Pages: handling new pages, handling popups',
    },
    {
      heading: 'Working inside iframes',
      body: `**Intuition:** an iframe is a web page inside a web page, with its own separate DOM. Page-level locators look only at the outer page, like searching one room of a house for keys that are in the room next door.

Ways in:
- \`page.frameLocator('#mce_0_ifr')\` returns a FrameLocator; chain \`.locator()\`, \`.getByRole()\` etc. It is lazy and auto-waits like any locator.
- \`page.locator('iframe[title="Rich Text Area"]').contentFrame()\` converts a normal locator for the \`<iframe>\` element into a FrameLocator (handy when you already have the iframe locator in a page object). The reverse is \`frameLocator.owner()\`.
- \`page.frame({ name: 'frame-middle' })\` or \`page.frame({ url: /checkout/ })\` returns a \`Frame\` object for older-style code; prefer frame locators in tests.

**Nested frames** chain: outer frame locator, then inner. On the-internet \`/nested_frames\`, the top frame (\`name="frame-top"\`) contains \`frame-left\`, \`frame-middle\` and \`frame-right\`; the middle one shows "MIDDLE" in \`#content\`.

**Common iframe sources in real apps:** payment widgets (Stripe, Razorpay card fields), rich-text editors, embedded videos, chat widgets, reCAPTCHA (do not automate CAPTCHA; ask for a test bypass).

**In interviews, say this:** "If a locator times out even though I can see the element, I check whether it is inside an iframe in DevTools. If yes, I go through \`frameLocator\` or \`contentFrame()\`; there is no 'switch to frame' state to undo like in Selenium."

The locator details of frames (strictness, \`frameLocator\` in the locators topic) are covered there; this section focuses on acting inside them.`,
      code: [
        {
          language: 'typescript',
          title: 'Single and nested frames on the-internet',
          code: `import { test, expect } from '@playwright/test';

test('read the TinyMCE editor body inside an iframe', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');
  const editor = page.frameLocator('#mce_0_ifr').locator('#tinymce');
  // page.locator('#tinymce') would never match: it is in another document
  await expect(editor).toContainText('Your content goes here.');
});

test('nested frames: reach the middle frame', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/nested_frames');
  const middle = page
    .frameLocator('frame[name="frame-top"]')
    .frameLocator('frame[name="frame-middle"]')
    .locator('#content');
  await expect(middle).toHaveText('MIDDLE');
});

test('contentFrame() from an existing iframe locator', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');
  const iframeElement = page.locator('#mce_0_ifr');
  const body = iframeElement.contentFrame().locator('body');
  await expect(body).toBeVisible();
});`,
        },
      ],
      keyPoints: [
        'Page locators do not pierce iframes; use frameLocator or contentFrame().',
        'Chain frame locators for nested frames.',
        'No switchTo / switch-back state as in Selenium.',
      ],
      source: 'Playwright docs — Frames; API reference FrameLocator and Locator.contentFrame',
    },
    {
      heading: 'Web tables: find a row, read a cell',
      body: `**Intuition:** you read a table the way you read a train timetable: find the row by something unique (the train number), then look across to the column you need. Never "the third row", because sorting changes row order.

Recipe:
1. Locate rows: \`page.locator('#table1 tbody tr')\` or \`page.getByRole('row')\`.
2. Narrow to one row by content: \`.filter({ hasText: 'fbach@yahoo.com' })\`, or \`getByRole('row', { name: /Frank/ })\`.
3. Read or act within that row: \`.locator('td').nth(3)\` for a cell, \`.getByRole('link', { name: 'edit' })\` for an action.
4. For whole columns, \`allTextContents()\` returns a string array **snapshot** (it does not wait), so first assert the table is ready, for example with \`toHaveCount\`.

Column positions can change too. A robust helper finds the column index from the header text first, then reads \`td\` at that index.

**Worked example (the-internet \`/tables\`, table 1):**

| Last Name | First Name | Email | Due |
|---|---|---|---|
| Smith | John | jsmith@gmail.com | $50.00 |
| Bach | Frank | fbach@yahoo.com | $51.00 |
| Doe | Jason | jdoe@hotmail.com | $100.00 |
| Conway | Tim | tconway@earthlink.net | $50.00 |

Test cases: (1) Frank Bach owes $51.00; (2) total due is $251.00; (3) clicking the "Due" header sorts ascending (Smith/Conway $50 first). The code below automates the first two.

**Common mistake:** \`page.locator('td:has-text("50")')\` matches \`$50.00\` twice and \`$150.00\` if it existed. Match the row by a unique key, then read the exact cell.`,
      code: [
        {
          language: 'typescript',
          title: 'Row by content, cell by header, column totals',
          code: `import { test, expect } from '@playwright/test';

test('table 1: one row and the column total', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables');
  const table = page.locator('#table1');
  const rows = table.locator('tbody tr');
  await expect(rows).toHaveCount(4);                 // table is ready

  // find the column index from the header text (robust to reordering)
  const headers = await table.locator('thead th').allTextContents();
  const dueIndex = headers.findIndex((h) => h.trim() === 'Due');   // → 3

  const frank = rows.filter({ hasText: 'fbach@yahoo.com' });
  await expect(frank.locator('td').nth(dueIndex)).toHaveText('$51.00');

  const dues = await rows.locator('td:nth-child(' + (dueIndex + 1) + ')').allTextContents();
  // dues → ['$50.00', '$51.00', '$100.00', '$50.00']
  const total = dues.reduce((sum, d) => sum + Number(d.replace('$', '')), 0);
  expect(total).toBe(251);
});

test('act inside the matching row', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables');
  const doeRow = page.locator('#table1 tbody tr').filter({ hasText: 'Doe' });
  await doeRow.getByRole('link', { name: 'edit' }).click();
  await expect(page).toHaveURL(/#edit$/);
});`,
        },
      ],
      keyPoints: [
        'Find rows by unique content with filter({ hasText }), not by index.',
        'Look up the column index from the header text.',
        'allTextContents() is a snapshot: assert readiness first.',
      ],
      source: 'Playwright docs — Locators: filtering; practice on the-internet /tables',
    },
    {
      heading: 'Putting it together: a checkout form end to end',
      body: `**Intuition:** an end-to-end form test is your manual test case written as code: preconditions, steps, expected results. If you can write the manual case, you can write this.

**Manual test case (SauceDemo):**

| # | Step | Expected |
|---|---|---|
| Pre | Logged in as \`standard_user\` | Products page shown |
| 1 | Add "Sauce Labs Backpack" to cart | Cart badge shows 1, button changes to "Remove" |
| 2 | Open cart, click Checkout | "Checkout: Your Information" |
| 3 | Continue with an empty form | Error "First Name is required" |
| 4 | Fill first name, last name, postcode, Continue | Overview shows item total $29.99 |
| 5 | Click Finish | "Thank you for your order!" |

Notes on the automation:
- Each step is an action followed by an assertion. Actions alone prove nothing.
- \`test.step\` names the steps so the HTML report reads like the manual case.
- The negative step (empty form) is cheap to add and catches real regressions.
- Credentials should come from env variables or fixtures in a real framework; hard-coding SauceDemo's public demo credentials is acceptable only for a practice site.`,
      code: [
        {
          language: 'typescript',
          title: 'SauceDemo checkout with steps and a negative check',
          code: `import { test, expect } from '@playwright/test';

test('buy the backpack', async ({ page }) => {
  await test.step('log in', async () => {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
  });

  await test.step('add to cart', async () => {
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
    await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
  });

  await test.step('checkout: validation then details', async () => {
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="continue"]').click();          // empty form
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');

    await page.locator('[data-test="firstName"]').fill('Asha');
    await page.locator('[data-test="lastName"]').fill('Verma');
    await page.locator('[data-test="postalCode"]').fill('560001');
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="subtotal-label"]')).toContainText('29.99');
  });

  await test.step('finish', async () => {
    await page.locator('[data-test="finish"]').click();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });
});`,
        },
      ],
      keyPoints: [
        'Map each manual step to one action + one assertion.',
        'test.step makes reports read like test cases.',
        'Include at least one negative path in form tests.',
      ],
      source: 'Playwright docs — Writing tests, test.step; practice on saucedemo.com',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-actions-cc-1',
      title: 'The confirm-dialog test that hangs',
      context:
        'A teammate automated "Delete account asks for confirmation" using the-internet JavaScript alerts page as a stand-in. The test either times out after 30 seconds or reports "You clicked: Cancel" even though they meant to press OK.',
      task: 'Make the test accept the confirm dialog, assert the dialog message, and assert the result text. It must never hang and must not depend on timing.',
      starter: {
        language: 'typescript',
        title: 'confirm.spec.ts (buggy)',
        code: `import { test, expect } from '@playwright/test';

test('confirm dialog is accepted', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  // Version A of the bug: handler only logs, never accepts
  page.on('dialog', (dialog) => console.log('Dialog says:', dialog.message()));

  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();

  // Version B of the bug: waiting for the dialog AFTER it already appeared
  const dialog = await page.waitForEvent('dialog');
  await dialog.accept();
  await page.waitForTimeout(1000);

  const text = await page.locator('#result').textContent();
  expect(text).toBe('You clicked: Ok');
});`,
      },
      hints: [
        'What must every dialog listener do before the click can finish?',
        'At which point in time must the handler exist: before or after the button is clicked?',
        'Capture the message inside the handler and assert with a web-first assertion afterwards; no sleep is needed.',
      ],
      solution: {
        language: 'typescript',
        title: 'confirm.spec.ts (fixed)',
        code: `import { test, expect } from '@playwright/test';

test('confirm dialog is accepted', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

  let dialogType = '';
  let dialogMessage = '';
  // registered BEFORE the click, handles only the next dialog
  page.once('dialog', async (dialog) => {
    dialogType = dialog.type();
    dialogMessage = dialog.message();
    await dialog.accept();                       // releases the page
  });

  await page.getByRole('button', { name: 'Click for JS Confirm' }).click();

  expect(dialogType).toBe('confirm');
  expect(dialogMessage).toBe('I am a JS Confirm');
  await expect(page.locator('#result')).toHaveText('You clicked: Ok');
});`,
      },
      explanation: `Fixes, one per bug:

1. **Handler never settled the dialog.** A \`dialog\` listener that only logs leaves the confirm open, so \`click()\` cannot complete and the test sits until the 30s test timeout. Every handler must call \`accept()\` or \`dismiss()\`.
2. **Waiting too late.** \`page.waitForEvent('dialog')\` after the click starts listening after the dialog has already been handled, so it waits for a second dialog that never comes. (Without any listener at all, Playwright auto-dismisses, which is why the variant without version A shows "You clicked: Cancel".)
3. **\`page.on\` replaced by \`page.once\`.** The handler is scoped to this one dialog; a later confirm in the same test will not be silently accepted.
4. **\`waitForTimeout\` + \`textContent\` + \`toBe\`** replaced by \`await expect(locator).toHaveText(...)\`, which retries until the text appears.
5. **Asserting the dialog itself.** The message and type are captured in the handler, so the test proves the right dialog appeared, not just that something was clicked.`,
      followUps: [
        {
          q: 'How would you test the Cancel path of the same confirm?',
          a: 'Register `page.once(\'dialog\', d => d.dismiss())` before clicking, then assert `#result` has "You clicked: Cancel". Even though no listener also dismisses, an explicit dismiss documents intent and lets me capture the message for an assertion, so the test does not pass accidentally if the dialog stopped appearing.',
        },
        {
          q: 'What if the dialog does not appear at all because of a regression?',
          a: 'With the fixed version the handler never runs, `dialogType` stays empty and `expect(dialogType).toBe(\'confirm\')` fails with a clear message. That is why capturing data in the handler is better than only accepting: it turns "dialog missing" into a visible failure.',
        },
      ],
    },
    {
      id: 'pw-actions-cc-2',
      title: 'The flaky new-tab test with forced clicks',
      context:
        'A test for "Click Here opens a new window" on the-internet /windows passes on a fast laptop and times out in CI about one run in five. A reviewer also flagged deprecated calls and a forced click.',
      task: 'Rewrite the test so it reliably captures the new tab, uses current APIs and user-facing locators, and asserts on both tabs. Explain why the original races.',
      starter: {
        language: 'typescript',
        title: 'windows.spec.ts (flaky)',
        code: `import { test, expect } from '@playwright/test';

test('opens a new window', async ({ page, context }) => {
  page.goto('https://the-internet.herokuapp.com/windows');   // no await

  await page.click('#content > div > a', { force: true });  // brittle + forced
  await page.waitForTimeout(2000);

  const newPage = await context.waitForEvent('page');       // started too late
  await newPage.waitForLoadState('networkidle');

  const heading = await newPage.$('h3');                    // deprecated handle
  expect(await heading!.textContent()).toBe('New Window');
});`,
      },
      hints: [
        'Which line runs first: the click that opens the tab, or the line that starts listening for it?',
        'Replace the CSS path and the `$` handle with role-based locators and web-first assertions.',
        'Is there any reason a user could not click this link normally? If not, why force?',
      ],
      solution: {
        language: 'typescript',
        title: 'windows.spec.ts (reliable)',
        code: `import { test, expect } from '@playwright/test';

test('opens a new window', async ({ page, context }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');

  const newTabPromise = context.waitForEvent('page');      // listen first
  await page.getByRole('link', { name: 'Click Here' }).click();
  const newTab = await newTabPromise;                       // then receive

  await expect(newTab).toHaveURL(/\\/windows\\/new$/);
  await expect(newTab.getByRole('heading', { name: 'New Window' })).toBeVisible();

  // original tab unchanged, and exactly two tabs open
  await expect(page.getByRole('heading', { name: 'Opening a new window' })).toBeVisible();
  expect(context.pages()).toHaveLength(2);
});`,
      },
      explanation: `What changed and why:

1. **Race fixed.** The original clicked, slept, and only then called \`context.waitForEvent('page')\`. The event fired during the sleep, so the wait looked for a *second* new tab and timed out; on some runs the tab opened slowly enough to be caught, hence "flaky". The promise is now created before the click and awaited after.
2. **Missing \`await\` on \`goto\`.** The click could start before navigation finished.
3. **\`force: true\` removed.** Nothing covers the link; forcing would only hide a future overlay bug.
4. **Brittle CSS path → \`getByRole('link', { name: 'Click Here' })\`.**
5. **\`waitForTimeout(2000)\` and \`waitForLoadState('networkidle')\` removed.** Web-first assertions on the new tab wait for exactly what matters; networkidle is discouraged.
6. **\`page.$\` + \`textContent\` + \`toBe\`** replaced by \`toBeVisible\` on a role locator, which retries.
7. **Stronger oracle.** The test also checks the URL of the new tab, that the original tab is intact, and the tab count.`,
      followUps: [
        {
          q: 'When would you use page.waitForEvent(\'popup\') instead of context.waitForEvent(\'page\')?',
          a: 'When I want only tabs opened by this specific page. `popup` ignores pages created elsewhere in the context, such as another test helper calling `context.newPage()`, so it is more precise when several pages are open. For a single-tab test both work for a `_blank` link.',
        },
        {
          q: 'The new tab requires login. Will it be logged in?',
          a: 'Yes, as long as it opens in the same browser context. Pages in one context share cookies and local storage, so a session created in the first tab applies to the second. A different context (for a second user) would not share it, which is exactly how you test two users at once.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-actions-iq-1',
      difficulty: 'medium',
      question: 'How do you handle JavaScript alert, confirm and prompt dialogs in Playwright? What happens if you do nothing?',
      whatInterviewerLooksFor: [
        'Knows dialogs are auto-dismissed when no listener exists',
        'Registers the handler before the triggering action',
        'Knows a handler must accept or dismiss, otherwise the action stalls',
        'Can enter prompt text and assert the dialog message',
        'Distinguishes browser dialogs from HTML modals',
      ],
      modelAnswer: `**Default:** with no \`dialog\` listener, Playwright **auto-dismisses** every dialog. Alerts just close; a confirm returns Cancel; a prompt returns null. So doing nothing is not a hang, but it may silently take the wrong branch.

**Handling one deliberately:**
1. Register before the action: \`page.once('dialog', async d => { msg = d.message(); await d.accept(); })\`.
2. Trigger it: \`await page.getByRole('button', { name: 'Delete' }).click()\`.
3. Assert both the dialog (captured \`msg\`, \`d.type()\`) and the page outcome with a web-first assertion.

For prompts, \`dialog.accept('text')\` enters the answer; \`dialog.defaultValue()\` returns the pre-filled value.

**Two traps:**
- A listener that only logs (\`page.on('dialog', d => console.log(d.message()))\`) never closes the dialog, so the \`click()\` that opened it hangs until the test timeout.
- \`page.on\` stays active for the whole test. I prefer \`page.once\` so a later dangerous confirm is not accepted by accident.

**beforeunload** dialogs only appear with \`page.close({ runBeforeUnload: true })\` and use the same listener.

Finally, I check whether it is a real browser dialog at all: many "dialogs" are HTML modals made of \`div\`s, which I click with normal locators like \`getByRole('dialog').getByRole('button', { name: 'OK' })\`.

Example on the-internet: accept the confirm, then \`await expect(page.locator('#result')).toHaveText('You clicked: Ok')\`.`,
      followUps: [
        {
          q: 'How would you assert the exact text of an alert?',
          a: 'Capture `dialog.message()` inside the handler into a variable declared in the test, accept the dialog, and after the click use `expect(message).toBe(\'I am a JS Alert\')`. Asserting inside the handler also works, but a failing expect inside an event callback is harder to read in reports, so capturing and asserting afterwards is cleaner.',
        },
        {
          q: 'How is this different from Selenium?',
          a: 'In Selenium you switch to the alert after it appears (`driver.switchTo().alert().accept()`), often with an explicit wait. In Playwright you decide in advance with an event listener, and without a listener the dialog is dismissed automatically. There is no "switch" state to manage.',
        },
        {
          q: 'A test has page.on(\'dialog\', d => d.accept()) in beforeEach. Any risk?',
          a: 'It accepts every dialog in every test, including ones that should be cancelled or ones that indicate a bug (an unexpected "Are you sure?"). It hides unexpected dialogs. I would scope handlers per test with `page.once`, or at least make the global handler record dialogs so tests can assert that none were unexpected.',
        },
      ],
      pitfalls: [
        'Saying you need to "switch to the alert" as in Selenium',
        'Registering the listener after the click',
        'Handlers that log but never accept or dismiss',
        'Treating HTML modals as browser dialogs',
      ],
    },
    {
      id: 'pw-actions-iq-2',
      difficulty: 'medium',
      question: 'Clicking a link opens a new browser tab. Walk me through automating and verifying it in Playwright.',
      whatInterviewerLooksFor: [
        'Starts waiting for the event before the click',
        'Knows the difference between context page event and page popup event',
        'Asserts on the new tab and the original tab',
        'Understands tabs share the browser context',
      ],
      modelAnswer: `A new tab is a new \`Page\` in the same \`BrowserContext\`, and I receive it through an event.

**Steps:**
1. \`const newTabPromise = context.waitForEvent('page');\` with **no await**, so I am listening before anything happens.
2. \`await page.getByRole('link', { name: 'Click Here' }).click();\`
3. \`const newTab = await newTabPromise;\`
4. Assert with web-first assertions on the new tab: \`await expect(newTab).toHaveURL(/windows\\/new/)\` and \`await expect(newTab.getByRole('heading', { name: 'New Window' })).toBeVisible()\`.
5. Assert the original page is unchanged, and optionally \`expect(context.pages()).toHaveLength(2)\`.

**Why the order matters:** if I click first and start waiting afterwards, the \`page\` event may already have fired, so my wait looks for a second tab and times out. That shows up as a flaky test: it passes when the tab opens slowly and fails when it opens fast. \`Promise.all([context.waitForEvent('page'), link.click()])\` is an equivalent pattern.

**popup vs page:** \`page.waitForEvent('popup')\` only catches pages opened by that page (window.open or \`_blank\`); \`context.waitForEvent('page')\` catches any new page in the context.

**Shared state:** both tabs share cookies and storage, so the new tab is logged in too. If the new tab is still loading and I need a synchronous value like \`newTab.url()\`, I call \`await newTab.waitForLoadState()\` first; for normal assertions auto-waiting covers it.

Finally I close the tab or let the context be disposed at the end of the test.`,
      followUps: [
        {
          q: 'What if the link opens in the same tab on mobile but a new tab on desktop?',
          a: 'I would make the behaviour explicit per project. For the desktop project I use the event pattern; for the mobile project I assert `toHaveURL` on the same page. A helper can check `link.getAttribute(\'target\')` but I prefer the test to state the expected behaviour clearly per platform, because "opens in new tab" is itself a requirement.',
        },
        {
          q: 'How do you switch back to the original tab?',
          a: 'There is nothing to switch. I keep both `page` and `newTab` variables and call methods on whichever I need. `bringToFront()` only matters for headed debugging or screenshots that depend on focus.',
        },
      ],
      pitfalls: [
        'Awaiting the click before starting to wait for the page event',
        'Using waitForTimeout to "let the tab open"',
        'Looking for "switchTo window" APIs',
        'Only checking that some tab opened, not its URL or content',
      ],
    },
    {
      id: 'pw-actions-iq-3',
      difficulty: 'easy',
      question: 'What is the difference between fill(), pressSequentially() and press()? Which one do you use by default and why?',
      whatInterviewerLooksFor: [
        'fill as the default for setting values',
        'pressSequentially for key-by-key behaviour (autocomplete, masks)',
        'press for single keys and shortcuts',
        'Knows page.type is deprecated',
      ],
      modelAnswer: `- **\`fill(value)\`** focuses the field, replaces its whole value in one go and fires an \`input\` event. It waits for the element to be visible, enabled and editable, and throws if the element is not an input, textarea or contenteditable. It is my **default** because it is fast and deterministic.
- **\`pressSequentially(text, { delay })\`** sends keydown, keypress and keyup for every character, optionally with a delay. I use it only when the app reacts to individual keystrokes: autocomplete suggestions, an input mask that formats a phone number while typing, per-key character counters.
- **\`press(key)\`** sends one key or chord to an element: \`Enter\` to submit, \`Tab\` to move focus, \`ArrowDown\` in a list, \`ControlOrMeta+A\` to select all on any OS.
- **\`clear()\`** empties a field, useful for required-field validation.
- **\`page.type\`** is deprecated; old tutorials still show it.

**Example:** on a search page, \`fill('lap')\` may not trigger suggestions if the widget listens to \`keyup\`. I would switch that one step to \`pressSequentially('lap')\` and then \`press('ArrowDown')\` and \`press('Enter')\`.

The value is verified with \`await expect(input).toHaveValue('...')\`, not by reading it manually.`,
      followUps: [
        {
          q: 'fill() fails with a timeout on a field that looks fine. What do you check?',
          a: 'Whether the field is readonly or disabled (fill needs editable and enabled), whether my locator actually points at the input and not a wrapper div, whether it is inside an iframe, and whether another element with the same locator exists (strict mode). The error log in the report lists which actionability check kept failing.',
        },
        {
          q: 'How do you test a "max 10 characters" limit?',
          a: 'Use `fill(\'12345678901\')` and assert `toHaveValue(\'1234567890\')` if the browser enforces maxlength, plus a boundary set: 9, 10, 11 characters. If the app enforces it with JavaScript on keystrokes instead, pressSequentially is closer to how the logic runs.',
        },
      ],
      pitfalls: [
        'Saying pressSequentially is always better because it is "realistic"',
        'Recommending page.type',
        'Clicking the field before fill (fill focuses automatically)',
      ],
    },
    {
      id: 'pw-actions-iq-4',
      difficulty: 'medium',
      question: 'How do you select a value from a dropdown? What changes when the dropdown is a custom React component instead of a native select?',
      whatInterviewerLooksFor: [
        'selectOption by value, label, index, multiple',
        'Inspects the DOM first',
        'Knows selectOption throws on non-select elements',
        'Click-then-option pattern with role locators for custom dropdowns',
        'Asserts the selected value',
      ],
      modelAnswer: `First I inspect the element in DevTools to see whether it is a real \`<select>\`.

**Native \`<select>\`:** \`selectOption\` does everything: waits for the select to be visible and enabled, waits for the option to exist, selects it and fires \`input\`/\`change\`.
- By value: \`selectOption('lohi')\` (SauceDemo sort)
- By label: \`selectOption({ label: 'Price (low to high)' })\`
- By index: \`selectOption({ index: 2 })\`, fragile, I avoid it
- Multiple: \`selectOption(['red', 'green'])\` on a \`multiple\` select
Then I assert with \`await expect(sort).toHaveValue('lohi')\` and, more importantly, the effect: prices are now in ascending order.

**Custom dropdown:** there is no \`<select>\`, so \`selectOption\` throws "Element is not a select". I interact like a user:
1. \`await page.getByRole('combobox', { name: 'Country' }).click()\`
2. \`await page.getByRole('option', { name: 'India' }).click()\`
3. \`await expect(page.getByRole('combobox', { name: 'Country' })).toHaveText(/India/)\`

If the component is searchable I \`fill\` the combobox input first to filter the list. If options are rendered in a portal at the end of \`body\`, page-level \`getByRole('option')\` still finds them; scoping to the combobox would not.

**Which to prefer, label or value?** Label matches what the business and manual test cases describe; value is stable when copy is translated. In a multi-language app I choose value.`,
      followUps: [
        {
          q: 'How do you verify all options of a dropdown?',
          a: 'For a native select: `await expect(page.locator(\'#dropdown option\')).toHaveText([\'Please select an option\', \'Option 1\', \'Option 2\'])`, which compares the whole list in order and retries. For a custom one, open it and run the same assertion on `getByRole(\'option\')`.',
        },
        {
          q: 'The option you want is disabled. What happens?',
          a: 'selectOption waits for the select to be enabled, not each option; selecting a disabled option fails because the browser will not select it, and the test times out or errors. That is usually the right result, and I would turn it into an explicit assertion: `await expect(option).toBeDisabled()`.',
        },
      ],
      pitfalls: [
        'Clicking <option> elements of a native select',
        'Using selectOption on a div-based dropdown',
        'Selecting by index when value or label exists',
        'Not asserting the selected value or its effect',
      ],
    },
    {
      id: 'pw-actions-iq-5',
      difficulty: 'hard',
      question: 'A teammate fixed a failing click by adding { force: true }. The test is green now. Do you approve the PR?',
      context: 'The error before the change was: "element intercepts pointer events: <div class="cookie-banner">".',
      whatInterviewerLooksFor: [
        'Understands force skips actionability checks, including receives-events',
        'Asks whether a real user is blocked too',
        'Proposes a user-like fix (dismiss the banner, set consent cookie)',
        'Knows legitimate uses of force',
        'Thinks about bugs hidden by the change',
      ],
      modelAnswer: `**Not as is.** The error says a cookie banner is covering the button. \`force: true\` tells Playwright to skip the non-essential actionability checks, including "receives events", so it clicks underneath the banner. A real user could not do that.

**Questions I ask:**
1. **Is it a product bug?** If the banner covers the checkout button on a normal viewport and cannot be closed, that is a real defect. The green test would hide it from everyone.
2. **Is it a test setup issue?** If users normally accept the banner once, the test should do the same: click "Accept" in a \`beforeEach\`, or better, pre-set the consent cookie via \`storageState\` or \`context.addCookies\` so every test starts without the banner.
3. **Is it a timing issue?** Sometimes the banner animates away; then the default auto-waiting already handles it and the failure means it never goes away.

**Fix I would suggest:**
- Remove \`force\`.
- Handle consent like a user (or set the cookie in setup).
- Add an assertion that the banner is hidden before checkout: \`await expect(banner).toBeHidden()\`.

**When force is acceptable:** custom checkboxes where the real \`<input>\` is visually hidden behind a styled span (better: click the label), or a known third-party overlay on a test-only environment, always with a comment and a ticket link.

The same reasoning applies to \`dispatchEvent('click')\`: it bypasses the pointer entirely and should not replace a user-like click in an end-to-end test.`,
      followUps: [
        {
          q: 'How can you stop force from creeping into the codebase?',
          a: 'Add a lint rule (eslint-plugin-playwright has rules against force options), make it a review checklist item, and require a comment explaining any exception. Code search for `force: true` in CI can also post a warning on the PR.',
        },
        {
          q: 'Which checks does force skip, and which still happen?',
          a: 'Force skips the non-essential actionability checks such as visible, stable, enabled and receives events. The element still has to resolve via the locator (strict mode still applies), and Playwright still performs the input. So force fixes "can\'t click" errors, not "can\'t find" errors.',
        },
      ],
      pitfalls: [
        'Approving because the build is green',
        'Not considering that users are blocked too',
        'Replacing force with waitForTimeout',
      ],
    },
    {
      id: 'pw-actions-iq-6',
      difficulty: 'medium',
      question: 'Your locator works in DevTools but Playwright says it cannot find the element. You discover it is inside an iframe. How do you handle iframes, including nested ones?',
      whatInterviewerLooksFor: [
        'Knows page locators do not enter iframes',
        'Uses frameLocator or locator.contentFrame()',
        'Chains for nested frames',
        'Mentions real-world examples (payment widget, editor)',
        'Contrasts with Selenium switchTo().frame()',
      ],
      modelAnswer: `An iframe contains a separate document, so \`page.getByRole(...)\` only searches the outer page and keeps waiting until it times out.

**Ways in:**
- \`page.frameLocator('#card-frame').getByLabel('Card number')\`. A FrameLocator is lazy and auto-waits, so I can chain any locator method and act normally.
- If I already have a locator for the \`<iframe>\` element, \`locator.contentFrame()\` turns it into a FrameLocator. \`frameLocator.owner()\` goes back to the iframe element, useful to assert the frame itself is visible.
- \`page.frame({ name })\` / \`page.frame({ url })\` returns a \`Frame\` object; I use it rarely, mostly for \`frame.url()\` checks.

**Nested frames:** chain them: \`page.frameLocator('frame[name="frame-top"]').frameLocator('frame[name="frame-middle"]').locator('#content')\`, which reads "MIDDLE" on the-internet nested frames page.

**Choosing the iframe locator:** prefer a stable attribute: \`title\`, \`name\`, \`data-testid\`, or a \`src\` fragment like \`iframe[src*="checkout"]\`. Avoid \`iframe >> nth=2\` because ad and chat iframes shift order.

**Real-world cases:** card fields from payment providers are each in their own iframe, rich-text editors like TinyMCE, embedded maps. CAPTCHA frames should not be automated; ask for a test key or bypass.

**Compared with Selenium:** there is no \`switchTo().frame()\` and no switching back; each locator carries its frame path, so I cannot accidentally stay "inside" the wrong frame.`,
      followUps: [
        {
          q: 'How would you test a Stripe card element?',
          a: 'Use Stripe test mode and test card numbers. Each field (number, expiry, CVC) may be its own iframe, so I locate each frame by its title attribute and fill the input inside it, then assert on the outer page (payment success message). I never use real cards or production keys.',
        },
        {
          q: 'Can frameLocator actions be slower or flakier?',
          a: 'They wait like any locator, so they are not inherently flaky. Problems come from iframes that reload (the frame is replaced, but the lazy FrameLocator just re-resolves) or from cross-origin iframes that load slowly; the fix is an assertion on content inside the frame, not a sleep.',
        },
      ],
      pitfalls: [
        'Searching for a "switch to frame" method',
        'Selecting iframes by index',
        'Adding waits instead of entering the frame',
      ],
    },
    {
      id: 'pw-actions-iq-7',
      difficulty: 'hard',
      question: 'Write a test that verifies the "Due" amount for a specific person in a web table, and that the column total is correct. How do you keep it robust when rows are sorted or columns move?',
      context: 'Use the-internet.herokuapp.com/tables, table 1, as the example.',
      whatInterviewerLooksFor: [
        'Finds rows by unique content, not index',
        'Derives column index from header text',
        'Waits for table readiness before snapshot reads',
        'Converts currency text to numbers correctly',
        'Considers sorting, pagination and empty states',
      ],
      modelAnswer: `**Plan:**
1. Locate rows: \`const rows = page.locator('#table1 tbody tr')\`.
2. Make sure the data is there: \`await expect(rows).toHaveCount(4)\` (or \`not.toHaveCount(0)\` for dynamic data). This matters because \`allTextContents()\` does not wait.
3. Find the column index from the header: read \`thead th\` texts and \`findIndex(h => h.trim() === 'Due')\` (index 3 here). Columns can be reordered by a UI change; the header name is the contract.
4. Pick the row by a unique key: \`rows.filter({ hasText: 'fbach@yahoo.com' })\`. Email is unique; last name might not be.
5. Assert the cell: \`await expect(frankRow.locator('td').nth(dueIndex)).toHaveText('$51.00')\`, a web-first assertion that retries.
6. Total: read the column with \`allTextContents()\`, map \`Number(text.replace('$', ''))\`, \`reduce\` to a sum, and \`expect(total).toBe(251)\`.

**Robustness:**
- Sorting: never assume row 2 is Frank; the filter finds him wherever he is. To test sorting itself, click the header and compare the column array with a sorted copy.
- Currency: for values with commas (\`$1,200.50\`), strip non-numeric characters except the dot; for floating point sums, compare with \`toBeCloseTo\` or work in cents.
- Pagination: either loop through pages until "Next" is disabled, or (better) verify totals through the API and keep the UI test for rendering.
- Empty state: a separate test that an empty result shows "No records" instead of an empty table.

I would wrap steps 3–4 in a small helper (\`cellFor(rowKey, columnName)\`) inside the page object so many tests reuse it.`,
      followUps: [
        {
          q: 'Why not use getByRole(\'row\', { name: \'Frank\' })?',
          a: 'You can: a row\'s accessible name is built from its cell text, so `getByRole(\'row\', { name: /fbach@yahoo\\.com/ })` works and reads well. The risk is partial matches: the default name match is case-insensitive substring, so `name: \'Doe\'` would also match a "Doerr" row. Use exact or a precise regex, or filter on a unique column like email.',
        },
        {
          q: 'How would you verify the table is sorted after clicking the "Due" header?',
          a: 'Click the header, wait for a visible change (for example the first cell no longer equals its old value, using a web-first assertion), then read the column with allTextContents, convert to numbers, and compare with a copy sorted using a numeric comparator. A default `sort()` would sort strings and give wrong results for "$100.00".',
        },
      ],
      pitfalls: [
        'Using row indexes like tr:nth-child(2)',
        'Calling allTextContents before the table has loaded',
        'Summing strings or using default sort on numbers',
        'Matching cells with loose text like "50"',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-actions-drill-1',
      question: 'Pick the right Playwright action (and the assertion that proves it worked) for each of these six interactions: (a) tick "I agree to terms", (b) choose "Price (high to low)" in SauceDemo\'s sort select, (c) choose "India" in a MUI country picker, (d) attach resume.pdf to a file input, (e) open a context menu on a row, (f) type a city name into an autocomplete box that suggests as you type.',
      assumptions: [
        'Terms is a native checkbox with a label',
        'SauceDemo sort is a native <select> with value "hilo"',
        'The MUI picker renders role="combobox" and role="option" elements',
        'The file input is a visible <input type="file">',
        'The autocomplete listens to keyup events',
      ],
      steps: [
        { label: '(a) checkbox', calc: "await page.getByLabel('I agree to terms').check(); → await expect(...).toBeChecked()" },
        { label: '(b) native select', calc: "await sort.selectOption('hilo') or selectOption({ label: 'Price (high to low)' }); → await expect(sort).toHaveValue('hilo') and prices descending" },
        { label: '(c) custom dropdown', calc: "await getByRole('combobox', { name: 'Country' }).click(); await getByRole('option', { name: 'India' }).click(); → toHaveText(/India/) on the combobox" },
        { label: '(d) upload', calc: "await input.setInputFiles('tests/data/resume.pdf'); → assert file name shown in the UI" },
        { label: '(e) context menu', calc: "await row.click({ button: 'right' }); → await expect(getByRole('menu')).toBeVisible()" },
        { label: '(f) autocomplete', calc: "await box.pressSequentially('Beng'); → await expect(getByRole('option', { name: 'Bengaluru' })).toBeVisible(); then click it" },
      ],
      answer: `| Interaction | Action | Proof |
|---|---|---|
| Tick terms | \`check()\` | \`toBeChecked()\` |
| Native sort | \`selectOption('hilo')\` | \`toHaveValue('hilo')\` + sorted prices |
| MUI picker | click combobox, click option | combobox \`toHaveText(/India/)\` |
| Upload | \`setInputFiles(path)\` | file name visible |
| Context menu | \`click({ button: 'right' })\` | menu \`toBeVisible()\` |
| Autocomplete | \`pressSequentially('Beng')\` | suggestion visible, then chosen |`,
      insight: 'The right action follows from how the element is built (native vs custom) and how the app listens (value vs keystrokes). Each action needs a matching assertion; the action alone proves nothing.',
      followUps: [
        {
          q: 'What changes for (d) if the file input only appears after clicking "Upload resume"?',
          a: 'Use the filechooser event: `const chooserPromise = page.waitForEvent(\'filechooser\')`, click the button, `const chooser = await chooserPromise`, then `await chooser.setFiles(\'tests/data/resume.pdf\')`. Start listening before the click, as with popups and downloads.',
        },
      ],
    },
    {
      id: 'pw-actions-drill-2',
      question: 'Put these lines in a working order for a test that clicks "Export", accepts a confirm dialog "Export 120 rows?", receives the file in a new download, and checks its name is report.csv. Lines: [A] `const download = await downloadPromise;` [B] `await page.getByRole(\'button\', { name: \'Export\' }).click();` [C] `page.once(\'dialog\', d => { msg = d.message(); return d.accept(); });` [D] `const downloadPromise = page.waitForEvent(\'download\');` [E] `expect(download.suggestedFilename()).toBe(\'report.csv\');` [F] `expect(msg).toBe(\'Export 120 rows?\');`',
      assumptions: [
        'The dialog appears immediately on click; the download starts after the dialog is accepted',
        'msg is declared with let before these lines',
        'Both the dialog handler and the download listener must exist before the click',
      ],
      steps: [
        { label: 'Listeners first', calc: 'C (dialog handler) and D (download promise) both before B; their relative order does not matter' },
        { label: 'Trigger', calc: 'B: click resolves once the dialog has been accepted by C' },
        { label: 'Receive', calc: 'A: await the download that started after the accept' },
        { label: 'Assert', calc: 'F (dialog message) and E (file name) after A' },
      ],
      answer: '**C, D, B, A, F, E** (D, C, B, A, E, F is equally correct). Anything that puts B before C or D is wrong: before C, the confirm is auto-dismissed and no download ever starts; before D, the download event can fire before anyone listens.',
      insight: 'Dialogs, popups, downloads and file choosers share one rule: set up the listener, then trigger, then consume. Learn the pattern once and apply it to every event-driven action.',
      followUps: [
        {
          q: 'What would happen if you used page.on instead of page.once for the dialog here?',
          a: 'This test would still pass. The difference shows up later: any further dialog in the same test, such as a "Delete all?" confirm, would also be accepted silently. page.once limits the handler to the dialog you meant, so unexpected dialogs keep their default dismiss behaviour and are easier to notice.',
        },
      ],
    },
    {
      id: 'pw-actions-drill-3',
      question: 'Trace this code against the-internet /tables table 1 and give the value of each variable: `const rows = page.locator(\'#table1 tbody tr\'); const n = await rows.count(); const last = await rows.filter({ hasText: \'Conway\' }).locator(\'td\').first().textContent(); const dues = await rows.locator(\'td:nth-child(4)\').allTextContents(); const max = Math.max(...dues.map(d => Number(d.slice(1))));`',
      assumptions: [
        'Rows in page order: Smith/John/$50.00, Bach/Frank/$51.00, Doe/Jason/$100.00, Conway/Tim/$50.00',
        'Column 4 is "Due"',
        'The page has fully loaded before this code runs',
      ],
      steps: [
        { label: 'n', calc: 'tbody has 4 rows → n = 4' },
        { label: 'last', calc: 'Row containing "Conway" → first td = "Conway"' },
        { label: 'dues', calc: "td:nth-child(4) of each row → ['$50.00', '$51.00', '$100.00', '$50.00']" },
        { label: 'slice(1)', calc: "removes '$' → ['50.00','51.00','100.00','50.00'] → numbers [50, 51, 100, 50]" },
        { label: 'max', calc: 'Math.max(50, 51, 100, 50) = 100' },
      ],
      answer: '`n = 4`, `last = "Conway"`, `dues = ["$50.00", "$51.00", "$100.00", "$50.00"]`, `max = 100` (Jason Doe).',
      insight: 'count(), textContent() and allTextContents() are one-time snapshots: correct here only because the static page has loaded. On a dynamic table, add a web-first assertion such as toHaveCount first, or assert directly with toHaveText on the locator.',
      followUps: [
        {
          q: 'How would you assert the whole Due column in one retrying assertion?',
          a: '`await expect(rows.locator(\'td:nth-child(4)\')).toHaveText([\'$50.00\', \'$51.00\', \'$100.00\', \'$50.00\'])`. Passing an array to toHaveText checks every matched element in order and retries until it matches or times out, so it is safe on tables that load asynchronously.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-actions-mcq-01',
      difficulty: 'easy',
      question: 'A search box shows suggestions only on keyup events. Which call reliably makes suggestions appear for "lap"?',
      options: [
        "await box.fill('lap')",
        "await box.pressSequentially('lap')",
        "await box.selectOption('lap')",
        "await box.setInputFiles('lap')",
      ],
      correct: [1],
      explanation:
        'pressSequentially sends keydown, keypress and keyup for every character, so keystroke listeners fire. fill sets the whole value at once and fires an input event, which many widgets handle but a keyup-only widget would miss. selectOption is for <select> elements and setInputFiles for file inputs, so both throw here.',
      followUps: [
        {
          q: 'Why not use pressSequentially for every input then?',
          a: 'It is slower and adds no coverage for ordinary fields. fill is faster, clears the old value and is the documented default; pressSequentially is reserved for fields with special keyboard handling.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-02',
      difficulty: 'easy',
      question: 'On the-internet /dropdown, what is selected after this line runs?',
      code: {
        language: 'typescript',
        code: `// <select id="dropdown">
//   <option value="" disabled selected>Please select an option</option>
//   <option value="1">Option 1</option>
//   <option value="2">Option 2</option>
// </select>
await page.locator('#dropdown').selectOption('2');`,
      },
      options: [
        'The third option in the list, regardless of value',
        '"Option 2", because a string argument matches the option value "2"',
        'Nothing; selectOption requires { label } or { index }',
        '"Option 1", because indexes start at 1 in this page',
      ],
      correct: [1],
      explanation:
        'A plain string is matched against the option value (falling back to the label), and value "2" belongs to "Option 2". It is not an index, so "third option" is right only by coincidence here. selectOption accepts a plain string as well as { label } and { index } objects, and nothing about this page renumbers indexes.',
      followUps: [
        {
          q: 'How would you assert the selection?',
          a: "await expect(page.locator('#dropdown')).toHaveValue('2'). It retries until the select's value matches, so it also covers apps that update the select asynchronously.",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-03',
      difficulty: 'easy',
      question: 'This test has no dialog listener. What does #result show after the click on the-internet JavaScript alerts page?',
      code: {
        language: 'typescript',
        code: `await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
await page.getByRole('button', { name: 'Click for JS Confirm' }).click();
console.log(await page.locator('#result').textContent());`,
      },
      options: [
        'Nothing: the click hangs until the test timeout',
        '"You clicked: Ok", because Playwright accepts dialogs by default',
        '"You clicked: Cancel", because dialogs are auto-dismissed without a listener',
        'An error is thrown: "Unhandled dialog"',
      ],
      correct: [2],
      explanation:
        'With no dialog listener, Playwright dismisses dialogs automatically, so the confirm returns false and the page writes "You clicked: Cancel". The hang happens only when a listener exists but never calls accept or dismiss. Playwright does not accept by default and does not throw an unhandled-dialog error.',
      followUps: [
        {
          q: 'How do you make it click OK instead?',
          a: "Register page.once('dialog', d => d.accept()) before the click, then assert await expect(page.locator('#result')).toHaveText('You clicked: Ok').",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-04',
      difficulty: 'medium',
      question: 'This test times out on the last line about 80% of the time. Why?',
      code: {
        language: 'typescript',
        code: `await page.goto('https://the-internet.herokuapp.com/windows');
await page.getByRole('link', { name: 'Click Here' }).click();
const newTab = await context.waitForEvent('page');
await expect(newTab).toHaveTitle('New Window');`,
      },
      options: [
        'waitForEvent(\'page\') only works for window.open, not target="_blank" links',
        'The page event usually fired during the click, before the wait started, so it waits for another tab',
        'toHaveTitle cannot be used on a page returned by an event',
        'The click needs { force: true } because the link opens a new tab',
      ],
      correct: [1],
      explanation:
        'The listener is created after the click has already opened the tab, so the event is usually missed and the wait looks for a second new page until timeout; it passes only when the tab happens to open late. The page event fires for _blank links too. toHaveTitle works on any Page, and force has nothing to do with tabs.',
      followUps: [
        {
          q: 'Write the fixed version in three lines.',
          a: "const p = context.waitForEvent('page'); await page.getByRole('link', { name: 'Click Here' }).click(); const newTab = await p; The promise is created first and awaited after the click.",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-05',
      difficulty: 'medium',
      question: 'SauceDemo\'s sort select has options az, za, lohi, hilo (labels "Name (A to Z)", "Name (Z to A)", "Price (low to high)", "Price (high to low)"). Select ALL that apply: which calls choose "Price (low to high)"?',
      options: [
        "await sort.selectOption('lohi')",
        "await sort.selectOption({ label: 'Price (low to high)' })",
        'await sort.selectOption({ index: 2 })',
        "await sort.fill('lohi')",
        "await sort.click({ position: { x: 0, y: 2 } })",
      ],
      correct: [0, 1, 2],
      explanation:
        'selectOption works by value (lohi), by label, or by zero-based index (az=0, za=1, lohi=2), so the first three all select it, though index is the most fragile. fill throws because a <select> is not an input, textarea or contenteditable. Clicking a position only opens the native dropdown and does not choose an option.',
      followUps: [
        {
          q: 'Which of the three would you use in a framework and why?',
          a: 'Value or label. Value survives copy and translation changes; label matches the manual test case wording. Index breaks as soon as an option is added or reordered.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-06',
      difficulty: 'medium',
      question: 'selectOption fails with "Element is not a <select> element" on a styled MUI "Country" picker. What is the right fix?',
      options: [
        'Add { force: true } to selectOption',
        'Click the combobox, then click getByRole(\'option\', { name: \'India\' })',
        'Use page.evaluate to set the hidden input value to "India"',
        'Use selectOption on the parent <div> instead',
      ],
      correct: [1],
      explanation:
        'Custom dropdowns are not <select> elements, so you interact like a user: open the combobox, then pick the option by role and name. force cannot turn a div into a select. Setting the hidden value with evaluate skips the component logic and may not update the UI or the form state. The parent div is not a select either.',
      followUps: [
        {
          q: 'The listbox renders at the end of <body> (a portal). Does that matter?',
          a: 'It matters only if you scoped the option locator inside the combobox container. Use a page-level getByRole(\'option\') or scope to getByRole(\'listbox\'), which is where the options really live in the DOM.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-07',
      difficulty: 'medium',
      question: 'You can see the "Card number" field on a checkout page, but page.getByLabel(\'Card number\') times out. The field is rendered by a payment provider. What is the most likely cause and fix?',
      options: [
        'The label is wrong; switch to an XPath locator',
        'The field is inside an iframe; use page.frameLocator(...).getByLabel(\'Card number\')',
        'The field loads slowly; add page.waitForTimeout(5000) before it',
        'Strict mode blocks it; add .first()',
      ],
      correct: [1],
      explanation:
        'Payment providers usually render card fields in iframes, and page-level locators never search inside frames, so you go through frameLocator or contentFrame(). XPath does not cross frames either. A sleep does not help because the locator will never match in the outer document. Strict mode errors say "resolved to N elements", not a timeout with zero matches.',
      followUps: [
        {
          q: 'How would you pick a stable locator for the iframe itself?',
          a: 'Use a meaningful attribute such as title, name or a src fragment, for example iframe[title="Secure card number input frame"], rather than the iframe index, because ad and chat iframes change order.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-08',
      difficulty: 'medium',
      question: 'A download test saves nothing: the file path from download.path() does not exist when the next test reads it. What explains this?',
      options: [
        'Downloads require headed mode',
        'Downloaded files are temporary and deleted when the browser context closes; call saveAs() to keep them',
        'download.path() returns a URL, not a file path',
        'You must set acceptDownloads: false',
      ],
      correct: [1],
      explanation:
        'Playwright stores downloads in a temporary location that is cleaned up when the context that produced them closes, so a later test cannot rely on that path. Save the file with download.saveAs(target) within the test. Downloads work headless, path() returns a local file path, and turning off acceptDownloads would block downloads entirely.',
      followUps: [
        {
          q: 'Where should the test save it?',
          a: 'testInfo.outputPath(download.suggestedFilename()) gives a per-test folder inside the test results directory, so parallel tests do not overwrite each other and the file is attached to that run.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-09',
      difficulty: 'medium',
      question: 'Select ALL that apply: which are valid uses of setInputFiles on an <input type="file" multiple>?',
      options: [
        "await input.setInputFiles('tests/data/a.png')",
        "await input.setInputFiles(['tests/data/a.png', 'tests/data/b.png'])",
        'await input.setInputFiles([])',
        "await input.fill('C:/fakepath/a.png')",
      ],
      correct: [0, 1, 2],
      explanation:
        'setInputFiles accepts a single path, an array of paths for multiple inputs, or an empty array to clear the selection (it also accepts in-memory { name, mimeType, buffer } objects). fill does not work on file inputs; browsers do not allow scripts to type a path into them, which is why setInputFiles exists.',
      followUps: [
        {
          q: 'The page has no file input until you click "Browse". What now?',
          a: "Start const chooser = page.waitForEvent('filechooser') before clicking Browse, await it, then call (await chooser).setFiles(path). Same listen-trigger-consume pattern as popups and downloads.",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-10',
      difficulty: 'hard',
      question: 'A cookie banner covers the "Checkout" button on small screens and cannot be closed there. A test uses click({ force: true }) and passes on the mobile project. What is the real problem?',
      options: [
        'None: force exists for exactly this case',
        'The test hides a real defect: users cannot reach Checkout, but the forced click bypasses the "receives events" check',
        'The test is slow because force waits longer',
        'force only works in Chromium, so the mobile project gives false results',
      ],
      correct: [1],
      explanation:
        'force skips actionability checks, including whether the element receives pointer events, so Playwright clicks underneath the banner where a user cannot. The test should fail and a bug should be filed. force does not wait longer, and it is not browser-specific. It exists for rare deliberate cases, not for overlays that block users.',
      followUps: [
        {
          q: 'How should the test handle a banner that users can close?',
          a: 'Close it like a user in setup, or pre-set the consent cookie in storageState, then assert it is hidden before continuing. The click stays unforced.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-11',
      difficulty: 'hard',
      question: 'This test never finishes until the 30 s timeout. Which line causes the hang?',
      code: {
        language: 'typescript',
        code: `await page.goto('https://the-internet.herokuapp.com/javascript_alerts');  // line 1
page.on('dialog', (dialog) => console.log(dialog.message()));            // line 2
await page.getByRole('button', { name: 'Click for JS Alert' }).click(); // line 3
await expect(page.locator('#result'))                                    // line 4
  .toHaveText('You successfully clicked an alert');`,
      },
      options: [
        'Line 1: goto waits for networkidle',
        'Line 3: the alert stays open because the listener never accepts or dismisses it, so click cannot finish',
        'Line 4: toHaveText cannot read text while an alert is open',
        'Line 2: page.on must be awaited',
      ],
      correct: [1],
      explanation:
        'Once a dialog listener exists, Playwright stops auto-dismissing and leaves the dialog to you; this listener only logs, so the alert stays open and the click on line 3 stalls. goto waits for load, not networkidle. Line 4 is never reached. page.on registers synchronously and returns the page, so it does not need await.',
      followUps: [
        {
          q: 'Fix it with one change.',
          a: "Make the handler settle the dialog: page.on('dialog', async d => { console.log(d.message()); await d.accept(); }); or better page.once, so only this dialog is affected.",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-12',
      difficulty: 'hard',
      question: 'The first table row is Smith, John, $50.00. A developer adds a "Sort by Due (desc)" default. Which locator still finds Frank Bach\'s Due cell correctly?',
      code: {
        language: 'typescript',
        code: `const rows = page.locator('#table1 tbody tr');
// A
rows.nth(1).locator('td').nth(3);
// B
rows.filter({ hasText: 'fbach@yahoo.com' }).locator('td').nth(3);
// C
page.locator('#table1 td:has-text("51")');
// D
page.locator('#table1 tr:nth-child(2) td:nth-child(4)');`,
      },
      options: ['A', 'B', 'C', 'D'],
      correct: [1],
      explanation:
        'B finds the row by a unique value (the email), so it works wherever sorting puts Frank. A and D depend on row position, which the new default sort changes. C matches any cell containing "51", which could include another value like $151.00 or a different column, and it does not tie the value to Frank at all.',
      followUps: [
        {
          q: 'What if the Due column moves to position 5?',
          a: 'Hard-coded nth(3) breaks. Read the header texts, find the index of "Due", and use that index, so the test follows the column by name.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-13',
      difficulty: 'hard',
      question: 'Select ALL that apply about page.goto() options and navigation.',
      options: [
        "By default goto resolves after the page's load event",
        "waitUntil: 'networkidle' is discouraged; assert on page content instead",
        "waitUntil: 'commit' resolves once the response is received and the document starts loading",
        "waitUntil: 'domcontentloaded' waits for all images to finish downloading",
      ],
      correct: [0, 1, 2],
      explanation:
        "goto defaults to the load event, commit is the earliest point (response received), and the docs mark networkidle as discouraged because background polling can keep it from settling and it does not prove the UI is ready. domcontentloaded fires when HTML is parsed, which is earlier than images finishing; that describes load, not domcontentloaded.",
      followUps: [
        {
          q: 'After clicking a link that navigates, how do you wait for the new page?',
          a: "await expect(page).toHaveURL(/target/) or await page.waitForURL('**/target'). waitForNavigation is deprecated, and actions on the new page auto-wait anyway.",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-14',
      difficulty: 'expert',
      question: 'dragTo() between two HTML5 drop zones moves the mouse but the app never registers the drop. Which manual sequence does the Playwright documentation suggest?',
      options: [
        'source.click(); target.click()',
        'source.hover(); mouse.down(); target.hover(); target.hover(); mouse.up()',
        'source.dispatchEvent(\'drop\'); target.dispatchEvent(\'drag\')',
        'mouse.down(); source.hover(); mouse.up(); target.hover()',
      ],
      correct: [1],
      explanation:
        'Press on the source, move over the target, then release. Some apps only accept a drop after a dragover event, which needs the pointer to move over the target, hence the second hover. Two clicks never hold the button down. Dispatching drop before drag gets the events in the wrong order and skips the dataTransfer handshake. The last sequence presses before reaching the source and releases at the wrong place.',
      followUps: [
        {
          q: 'How do you prove the drop worked on the-internet /drag_and_drop?',
          a: "Assert the swapped headers: await expect(page.locator('#column-a header')).toHaveText('B'). A drag without an outcome assertion proves only that the mouse moved.",
        },
      ],
    },
    {
      id: 'pw-actions-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL that apply: a test holds a `page` and its `context`. A link with target="_blank" on `page` is clicked. Which listeners receive the new tab?',
      options: [
        "page.waitForEvent('popup')",
        "context.waitForEvent('page')",
        "browser.waitForEvent('page')",
        "page.waitForEvent('page')",
      ],
      correct: [0, 1],
      explanation:
        "A page opened by this page fires the page's popup event and the context's page event, so both listeners get it. Browser has no 'page' event. Page objects emit 'popup', not 'page', so waiting for 'page' on a page never resolves. A tab created with context.newPage() would fire only the context event, not popup.",
      followUps: [
        {
          q: 'When is context.on(\'page\') more useful than a one-off wait?',
          a: 'When you do not know which action opens a tab, or tabs open repeatedly (for example, an app that opens help pages). A context listener can log or close every new page, while waitForEvent is for one expected tab tied to one action.',
        },
      ],
    },
  ],
};

export default topic;
