import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-actions',
  phase: 'pw-basics',
  order: 3,
  title: 'Actions: Clicking, Typing, Dialogs, Tabs, Frames and Tables',
  subtitle:
    'How to do in code what a user does with mouse and keyboard: open pages, click, type, pick from dropdowns, drag, upload, download, answer pop-up dialogs, handle new tabs, work in iframes and read tables.',
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
    'Always `await` an action. Each action finds the element, waits until it is ready, scrolls to it, then acts. Actions have no time limit of their own: the 30 s test timeout stops them, unless you set `actionTimeout`.',
    '`page.goto(url)` waits for the `load` event by default. `waitUntil` can be `load`, `domcontentloaded`, `commit` or `networkidle` (not recommended). After a click that opens a page, use `page.waitForURL(\'**/inventory.html\')`.',
    '`fill()` puts in the whole text at once (use this by default). `pressSequentially(text, { delay })` types key by key, for autocomplete. `press(\'Enter\')` sends one key. `page.type` is old; do not use it.',
    'Clicks: `click()`, `dblclick()`, `click({ button: \'right\' })`, `click({ modifiers: [\'Shift\'] })`, `hover()`. `{ force: true }` skips the safety checks and can hide real bugs, like a banner a user cannot click through.',
    'Real `<select>` → `selectOption(\'value\')`, `selectOption({ label })`, `selectOption({ index })`, or a list for multi-select. Custom div dropdowns → click the dropdown, then click `getByRole(\'option\', { name })`.',
    '`check()` / `uncheck()` / `setChecked(bool)` for checkboxes and radio buttons. They confirm the box really changed.',
    'Upload: `setInputFiles(path | path[] | [] | { name, mimeType, buffer })`. Download: `const p = page.waitForEvent(\'download\'); await click; const d = await p; await d.saveAs(...)`.',
    'With no listener, dialogs close by themselves (Cancel for a confirm). Add `page.once(\'dialog\', d => d.accept())` BEFORE the click. A listener that never calls accept() or dismiss() makes the click hang.',
    'New tab: start `const p = context.waitForEvent(\'page\')` (or `page.waitForEvent(\'popup\')`) BEFORE the click, then `const tab = await p`. If you start waiting after the click, you can miss the tab.',
    'Iframes: `page.frameLocator(\'#mce_0_ifr\').locator(\'#tinymce\')` or `page.locator(\'iframe\').contentFrame()`. Normal page locators never look inside an iframe.',
    'Tables: `page.locator(\'#table1 tbody tr\').filter({ hasText: \'Bach\' })` finds a row by its text. Then read a cell with `.locator(\'td\').nth(3)`. `allTextContents()` reads the list right now and does not wait.',
    'Drag: `source.dragTo(target)`. If the page is picky: hover source, `mouse.down()`, hover target twice, `mouse.up()`. Actions scroll by themselves; use `mouse.wheel(0, 500)` for endless lists.',
  ],
  sections: [
    {
      heading: 'What happens when you call an action',
      body: `**Example:** \`await page.getByRole('button', { name: 'Login' }).click()\` → Playwright finds the Login button. It waits until the button can be clicked. Then it clicks it.

An **action** is something a user does: click, type, pick, drag. Think of it as a careful robot finger. A manual tester does the same steps without thinking.

Every action goes through four steps:

1. **Find** the element. The locator must match exactly one element. Two matches is an error, not a guess. This rule is called **strict mode**.
2. **Wait** until the element is ready. For a click, it must be visible, not moving, enabled and not covered. These checks are called **actionability checks**. The next topic, *Assertions and waiting*, lists them all.
3. **Scroll** the element into view, if needed.
4. **Do** the real action, like a mouse press and release.

How long does it wait? An action has **no time limit of its own**. It keeps trying until the **test timeout (30 seconds)** runs out. You can set a shorter limit with \`actionTimeout\` in the config, or pass \`{ timeout }\` to one call.

**Every action returns a Promise, so always use \`await\`.** Without \`await\`, the next line runs before the click happens. This is the most common beginner bug.

**Watch out:** an action does not check the result. A click only clicks. An assertion with \`expect\` proves the page changed.

| Want to do | Use | Avoid |
|---|---|---|
| Open a URL | \`page.goto('/inventory.html')\` | Typing into the address bar |
| Click | \`locator.click()\` | \`page.click('css')\`, \`elementHandle.click()\` |
| Type a value | \`locator.fill('text')\` | \`page.type()\` (deprecated) |
| Press a key | \`locator.press('Enter')\` | \`page.keyboard\` when a locator works |
| Pick from \`<select>\` | \`locator.selectOption('2')\` | Clicking \`<option>\` elements |
| Tick a box | \`locator.check()\` | \`click()\` (does not verify the state) |

**In an interview, say:** "Playwright actions wait for the element to be ready. So I never add sleeps before a click. I always await actions. I use \`force: true\` only in rare cases, with a reason."

**Why testers care:** auto-waiting removes most fixed sleeps, so tests run faster and fail less.`,
      code: [
        {
          language: 'typescript',
          title: 'A first realistic action sequence on SauceDemo',
          code: `import { test, expect } from '@playwright/test';

test('standard user can log in', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');

  // fill(): waits until the input is visible, enabled and editable, then sets the value
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
        'An action finds the element, waits until it is ready, scrolls, then acts.',
        'Actions have no time limit of their own; the 30 s test timeout stops them.',
        'Always await actions. Actions do not check results; assertions do.',
      ],
      source: 'Playwright docs — Actions; Auto-waiting (actionability)',
    },
    {
      heading: 'Navigation: goto, waitUntil, reload and history',
      body: `**Example:** \`await page.goto('https://www.saucedemo.com/')\` → the browser opens the page. Playwright waits until the page has fully loaded, then moves on.

\`goto\` is like typing a URL and pressing Enter. By default it waits for the **\`load\`** event. That means images, scripts and styles have all loaded.

\`goto\` also returns the server's answer (the response). So you can check the status code, like 200.

The \`waitUntil\` option changes what "loaded" means:

| \`waitUntil\` | Resolves when | Use it |
|---|---|---|
| \`'load'\` (default) | \`load\` event fired | Almost always |
| \`'domcontentloaded'\` | HTML parsed, before images | Heavy pages where you only need the DOM |
| \`'commit'\` | Response received, document starts loading | Rare: testing very early page state |
| \`'networkidle'\` | No network traffic for 500 ms | **Not recommended** by the docs: background requests can stop it from ever finishing; check the page content instead |

Other helpers:
- If \`baseURL\` is set in the config, you can write just \`page.goto('/inventory.html')\`.
- \`page.reload()\`, \`page.goBack()\` and \`page.goForward()\` work like the browser buttons.

What if a click opens a new page? You do **not** need \`waitForNavigation\`. It is old (deprecated). Check the new address with \`await expect(page).toHaveURL(...)\`. Or use \`await page.waitForURL('**/checkout-step-one.html')\` before your next step.

**Watch out:** do not add \`waitUntil: 'networkidle'\` "to be safe". It makes every test slower. It can still be wrong for modern apps. Wait for what the user waits for: the content.

**Why testers care:** a manual case like "Back button returns to the product list" becomes \`goBack()\` plus one check.`,
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
        'goto waits for the load event by default and returns the response.',
        'Avoid networkidle; check the visible content instead.',
        'After a click that opens a page, use toHaveURL or waitForURL.',
      ],
      source: 'Playwright docs — Navigations; API reference page.goto',
    },
    {
      heading: 'Clicking, hovering and the force option',
      body: `**Example:** \`await row.click({ button: 'right' })\` → Playwright right-clicks the row. The page's context menu opens.

Most clicks are just \`click()\`. But real users also double-click, right-click, Shift-click and hover. Playwright has an option for each one.

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

**About \`force: true\`.** It skips the safety checks before the click. One check is "is something covering the button?". So a forced click works **even if a cookie banner covers the button**. A real user cannot do that. The forced test passes, but a real bug stays hidden.

Use \`force\` only in rare cases. Example: a styled checkbox that hides the real input on purpose. Always add a comment that says why.

**\`dispatchEvent('click')\`** does not move the mouse. It only sends a click signal to the element. It does not act like a real user.

**Hover menus:** call \`hover()\`, then click the item that appears. Do not put other actions between those two lines.

**In an interview, say:** "If a click fails because another element covers it, I ask: is a real user blocked too? If yes, I report a bug. I do not force the click."

**Why testers care:** a forced click can hide a real overlay bug that blocks customers.`,
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
        'Use click options (button, modifiers, position) instead of raw mouse code.',
        'force: true can hide overlay bugs; explain every use in a comment.',
        'dispatchEvent sends a click signal without moving a real mouse.',
      ],
      source: 'Playwright docs — Actions: mouse click, forcing actions',
    },
    {
      heading: 'Typing: fill vs pressSequentially vs press',
      body: `**Example:** \`await page.getByPlaceholder('Username').fill('standard_user')\` → Playwright clears the box and puts in the whole text at once.

Three ways to type:
- \`fill\` is like pasting a value.
- \`pressSequentially\` types one key at a time.
- \`press\` hits one key or shortcut, like Enter.

| Method | What it does | When |
|---|---|---|
| \`fill('text')\` | Focuses, clears, sets the whole value, fires \`input\` | **Default** for inputs, textareas, \`contenteditable\` |
| \`clear()\` | Empties the field | Testing a required-field error |
| \`pressSequentially('text', { delay: 100 })\` | Sends keydown/keypress/keyup for each character | Autocomplete, input masks, per-key validation |
| \`press('Enter')\` | One key or chord on the focused element | Submit with Enter, \`Tab\`, \`ArrowDown\`, \`ControlOrMeta+A\` |
| \`page.keyboard.press('Escape')\` | Key press on whatever is focused | No natural element to target (close a modal) |
| \`page.type()\` | Deprecated | Never in new code |

Key facts:
- \`fill\` works on an input, a textarea or an editable area. On anything else it throws an error. (A label linked to an input is fine.)
- \`fill\` waits until the field is **visible, enabled and editable**. A read-only field makes it fail. That is correct: a user cannot type there either.
- Key names: \`Enter\`, \`Tab\`, \`Backspace\`, \`Escape\`, \`ArrowDown\`, \`Shift+A\`.
- \`ControlOrMeta\` means Ctrl on Windows and Linux, and Cmd on Mac. One test works on both.

**When to switch:** some search boxes show suggestions only on key presses. \`fill('lap')\` sets the text, but no suggestions appear. Use \`pressSequentially('lap')\` instead. Then pick a suggestion with \`ArrowDown\` and \`Enter\`.

**Watch out:** do not use \`pressSequentially\` everywhere "to be realistic". It is slower and tests nothing extra on normal fields.

**Why testers care:** the right typing method makes autocomplete and search tests work the first time.`,
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
        'Use fill by default; use pressSequentially only when keys matter.',
        'press sends one key or shortcut; ControlOrMeta works on every OS.',
        'page.type is old (deprecated); do not use it.',
      ],
      source: 'Playwright docs — Actions: text input, type characters, keys and shortcuts',
    },
    {
      heading: 'Checkboxes, radios and dropdowns (native vs custom)',
      body: `**Example:** \`await sort.selectOption('lohi')\` → Playwright picks the option whose value is \`lohi\`. On SauceDemo, that is "Price (low to high)".

**Checkboxes and radio buttons.** Use \`check()\`, \`uncheck()\` or \`setChecked(true | false)\`. They click only if needed. Then they confirm the box really changed. If the page ignores the click, they throw an error. A plain \`click()\` just flips the box and checks nothing. So prefer \`check()\`.

**Two kinds of dropdown.** A **native** dropdown is a real \`<select>\` element. A **custom** dropdown is a group of \`div\`s that only looks like one. Playwright handles them differently.

**Native \`<select>\`:** use \`selectOption\`. It waits for the dropdown and the option. It picks the option and tells the page the value changed.

| Call | Selects by |
|---|---|
| \`selectOption('lohi')\` | \`value\` attribute (falls back to label) |
| \`selectOption({ label: 'Price (low to high)' })\` | Visible text |
| \`selectOption({ index: 2 })\` | Position (fragile, avoid) |
| \`selectOption(['red', 'green'])\` | Several values in a \`multiple\` select |

SauceDemo's sort dropdown is \`[data-test="product-sort-container"]\` with values \`az\`, \`za\`, \`lohi\`, \`hilo\`. On the-internet \`/dropdown\`, \`#dropdown\` has options valued \`1\` and \`2\`.

**Custom dropdowns** (React Select, MUI, Angular Material): there is no \`<select>\`. So \`selectOption\` throws "Element is not a select". Do what the user does. Click the dropdown to open it. Then click the option. Good dropdowns have the roles \`combobox\` and \`option\`, so \`getByRole\` works. Then check the text shown in the dropdown.

**In an interview, say:** "First I inspect the HTML. For a real \`<select>\`, I use \`selectOption\` and check with \`toHaveValue\`. For a custom dropdown, I click the combobox, then the option by role and name."

**Why testers care:** picking the right method stops "Element is not a select" errors on modern apps.`,
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
        'check, uncheck and setChecked confirm the new state; click does not.',
        'selectOption works only on a real <select>: by value, label, index or a list.',
        'Custom dropdowns: click the combobox, then click the option by role.',
      ],
      source: 'Playwright docs — Actions: checkboxes and radio buttons, select options',
    },
    {
      heading: 'Drag and drop, mouse and scrolling',
      body: `**Example:** \`await a.dragTo(b)\` → Playwright presses the mouse on box A, moves to box B and lets go.

Dragging is "press, move, release". Playwright can do it in one call. It can also do it step by step for picky pages.

- **One call:** \`source.dragTo(target)\`. This is the normal way.
- **Step by step:** \`source.hover()\`, \`page.mouse.down()\`, \`target.hover()\`, \`page.mouse.up()\`. Some pages need the mouse to move over the target before they accept a drop. So the docs suggest hovering the target **twice**.
- **Scrolling:** actions scroll by themselves. Scroll on purpose only to test scrolling itself. Examples: endless lists, "back to top" buttons. Use \`page.mouse.wheel(0, 800)\` or \`locator.scrollIntoViewIfNeeded()\`.
- **Raw mouse and keyboard** (\`page.mouse\`, \`page.keyboard\`) are for drawing areas and sliders. Use them when there is no element to target.

**Practice page:** the-internet \`/drag_and_drop\` has two boxes, A and B. After you drag A onto B, they swap. The first box now shows "B". That swap is your expected result.

**Watch out:** always check the result after a drag. A drag that "works" only proves the mouse moved.

**Why testers care:** drag tests catch broken sorting, Kanban boards and file drop zones.`,
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
        'Try dragTo first; use mouse steps (with two hovers) for picky pages.',
        'Actions scroll by themselves; scroll on purpose only to test scrolling.',
        'Always check the visible result of a drag.',
      ],
      source: 'Playwright docs — Actions: drag and drop, scrolling',
    },
    {
      heading: 'Uploading and downloading files',
      body: `**Example:** \`await page.locator('#file-upload').setInputFiles('tests/data/invoice.pdf')\` → Playwright attaches the file. No file picker window opens.

A test cannot click through your computer's file picker window. So Playwright gives the file straight to the \`<input type="file">\` element.

**Upload with \`setInputFiles\`.** It does not wait for the usual checks. It works even on a hidden input.

| Form | Example |
|---|---|
| One file | \`setInputFiles('tests/data/invoice.pdf')\` |
| Several files | \`setInputFiles(['a.png', 'b.png'])\` (input needs \`multiple\`) |
| Clear selection | \`setInputFiles([])\` |
| In-memory file | \`setInputFiles({ name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') })\` |

Sometimes the file input appears only after a click. Then use the **filechooser** event. Start \`page.waitForEvent('filechooser')\`. Click the upload button. Then call \`fileChooser.setFiles(...)\`.

**Download.** You listen for the browser's "download started" signal (an **event**). Then you save the file.
1. \`const downloadPromise = page.waitForEvent('download');\` (no \`await\` yet)
2. Click the link.
3. \`const download = await downloadPromise;\`
4. Check \`download.suggestedFilename()\`. Save with \`await download.saveAs(path)\` if you need the file.

**Watch out:** downloaded files are temporary. They are **deleted when the test's browser session closes**. Save them if you need them.

**Why testers care:** upload and download cases from your manual suite can be automated without touching the file picker.`,
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
        'setInputFiles takes a path, a list of paths, [] to clear, or a file made in code.',
        'Use the filechooser event only when the input appears after a click.',
        'Start waitForEvent(\'download\') before the click; call saveAs before the test ends.',
      ],
      source: 'Playwright docs — Actions: upload files; Downloads',
    },
    {
      heading: 'JavaScript dialogs: alert, confirm, prompt',
      body: `**Example:** \`page.once('dialog', d => d.accept())\` then \`await button.click()\` → the confirm box opens, and Playwright presses OK.

A browser dialog (alert, confirm, prompt) freezes the page. It waits until someone presses OK or Cancel. So Playwright must know in advance which button to press.

**If you do nothing:** Playwright **closes every dialog for you** (auto-dismiss). An alert just closes. A confirm gets Cancel. A prompt gets no answer. The test goes on, but maybe down the wrong path.

**Handling it yourself:**
- Add the **listener** (code that waits for the dialog) **before** the click that opens it.
- The listener **must** call \`accept()\` or \`dismiss()\`. If it only logs the message, the dialog stays open. Then the \`click()\` **hangs** until the test timeout.
- \`page.on\` handles every dialog in the test. \`page.once\` handles only the next one. Prefer \`once\`. Then a later "Delete everything?" box is not accepted by mistake.

| Dialog API | Purpose |
|---|---|
| \`dialog.type()\` | \`'alert'\`, \`'confirm'\`, \`'prompt'\` or \`'beforeunload'\` |
| \`dialog.message()\` | Text shown in the dialog |
| \`dialog.defaultValue()\` | Pre-filled value of a prompt |
| \`dialog.accept(text?)\` | OK; for prompts, the text to enter |
| \`dialog.dismiss()\` | Cancel |

**Not every popup is a dialog.** Many "popups" are HTML modals made of \`div\`s. They are part of the page. Click them with normal locators.

**Practice page:** the-internet \`/javascript_alerts\` has three buttons. The \`#result\` text then shows "You clicked: Ok", "You clicked: Cancel" or "You entered: <text>".

**Why testers care:** a wrong dialog choice can silently cancel a delete or payment step in your test.`,
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
        'No listener: dialogs close by themselves. A listener that never accepts or dismisses: the click hangs.',
        'Add the listener before the click; prefer page.once.',
        'Save dialog.message() in the listener and check it after the click.',
      ],
      source: 'Playwright docs — Dialogs; API reference Dialog',
    },
    {
      heading: 'New tabs and popups',
      body: `**Example:** \`const p = context.waitForEvent('page')\`, then \`await link.click()\`, then \`const newTab = await p\` → you start listening, click, then receive the new tab.

A link with \`target="_blank"\` opens a new tab. It is like a waiter handing you a second menu. If your hand is not already out, you miss it.

In Playwright, each tab is a \`Page\`. All tabs of one test live in the same **browser context** (one separate browser session with its own cookies). So tabs share cookies and login.

You get the new tab by waiting for an **event** (a signal the browser sends):
- \`context.waitForEvent('page')\`: any new tab in this session.
- \`page.waitForEvent('popup')\`: only tabs opened by this page. A \`_blank\` link click fires both.

**The order rule:**
1. Start waiting **before** the click. Do not \`await\` yet.
2. \`await\` the click.
3. Now \`await\` the wait to get the tab.

What if you click first and start waiting after? The tab may already be open. Your wait then looks for another tab and times out. \`Promise.all([context.waitForEvent('page'), link.click()])\` does the same job safely.

The new tab may still be loading. That is fine. Actions and \`expect\` checks wait by themselves.

Handy calls: \`context.pages()\` lists open tabs. \`newTab.close()\` closes one.

**Why testers care:** "opens in a new tab" is a real requirement, and this pattern tests it without random failures.`,
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
        'Start waitForEvent before the click; await it after.',
        'popup = opened by this page; page = any new tab in the context.',
        'Tabs in one context share cookies and login.',
      ],
      source: 'Playwright docs — Pages: handling new pages, handling popups',
    },
    {
      heading: 'Working inside iframes',
      body: `**Example:** \`page.frameLocator('#mce_0_ifr').locator('#tinymce')\` → Playwright goes into the iframe first, then finds the editor inside it.

An **iframe** is a web page inside a web page. A normal \`page\` locator looks only at the outer page. It never looks inside the iframe. It is like searching one room for keys that are in the next room.

Ways in:
- \`page.frameLocator('#mce_0_ifr')\`. Then chain \`.locator()\` or \`.getByRole()\` as usual. It waits like any locator.
- \`page.locator('iframe').contentFrame()\`. Use this when you already have a locator for the \`<iframe>\` tag.

**Iframes inside iframes:** chain them, outer first, then inner. On the-internet \`/nested_frames\`, the middle frame shows "MIDDLE".

**Where you meet iframes:** card fields from payment providers, text editors, videos, chat widgets. Do not automate CAPTCHA. Ask the developers for a test bypass.

**In an interview, say:** "If a locator times out but I can see the element, I check DevTools for an iframe. Then I use \`frameLocator\` or \`contentFrame()\`. Unlike Selenium, there is no 'switch to frame' to undo."

**Why testers care:** payment and editor tests fail with timeouts until you enter the right iframe.`,
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
        'Page locators do not look inside iframes; use frameLocator or contentFrame().',
        'For iframes inside iframes, chain frame locators.',
        'No switch-to or switch-back step as in Selenium.',
      ],
      source: 'Playwright docs — Frames; API reference FrameLocator and Locator.contentFrame',
    },
    {
      heading: 'Web tables: find a row, read a cell',
      body: `**Example:** \`rows.filter({ hasText: 'fbach@yahoo.com' }).locator('td').nth(3)\` → Playwright finds Frank's row by his email, then reads the 4th cell (Due).

Read a table like a train timetable. Find the row by something unique, like the train number. Then look across to the column you need. Never use "the third row". Sorting changes the row order.

Steps:
1. Find the rows: \`page.locator('#table1 tbody tr')\`.
2. Pick one row by its text: \`.filter({ hasText: 'fbach@yahoo.com' })\`.
3. Inside that row, read a cell with \`.locator('td').nth(3)\`. Or click a link in it.
4. To read a whole column, use \`allTextContents()\`. It gives a list of texts.

**Watch out:** \`allTextContents()\` does not wait. It reads the table as it is right now. So first check the table has loaded, for example with \`toHaveCount\`.

Columns can move too. A safer way: find the column number from the header text first.

**Practice page (the-internet \`/tables\`, table 1):**

| Last Name | First Name | Email | Due |
|---|---|---|---|
| Smith | John | jsmith@gmail.com | $50.00 |
| Bach | Frank | fbach@yahoo.com | $51.00 |
| Doe | Jason | jdoe@hotmail.com | $100.00 |
| Conway | Tim | tconway@earthlink.net | $50.00 |

Test cases: (1) Frank Bach owes $51.00. (2) The total due is $251.00. The code below automates both.

**Watch out:** \`td:has-text("50")\` matches \`$50.00\` twice. It would also match \`$150.00\`. Find the row by a unique value first. Then read the exact cell.

**Why testers care:** order totals, user lists and reports are tables, and these checks keep passing after sorting changes.`,
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
        'Find a row by unique text with filter({ hasText }), not by position.',
        'Find the column number from the header text.',
        'allTextContents() does not wait: check the table has loaded first.',
      ],
      source: 'Playwright docs — Locators: filtering; practice on the-internet /tables',
    },
    {
      heading: 'Putting it together: a checkout form end to end',
      body: `**Example:** \`await page.locator('[data-test="finish"]').click()\` → Playwright clicks Finish. Then \`await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!')\` → it checks the success message. One manual step becomes one action plus one check.

An end-to-end test is your manual test case written as code. It has a precondition, steps and expected results. If you can write the manual case, you can write this.

**Manual test case (SauceDemo):**

| # | Step | Expected |
|---|---|---|
| Pre | Logged in as \`standard_user\` | Products page shown |
| 1 | Add "Sauce Labs Backpack" to cart | Cart badge shows 1, button changes to "Remove" |
| 2 | Open cart, click Checkout | "Checkout: Your Information" |
| 3 | Continue with an empty form | Error "First Name is required" |
| 4 | Fill first name, last name, postcode, Continue | Overview shows item total $29.99 |
| 5 | Click Finish | "Thank you for your order!" |

How the code follows the case:
- Each step is an action, then a check. Actions alone prove nothing.
- \`test.step\` gives each step a name. The HTML report then reads like your manual case.
- The negative step (empty form) is cheap to add. It catches real bugs.

**Watch out:** in a real project, keep passwords in environment variables, not in the test. SauceDemo's public demo login is fine for practice.

**Why testers care:** you can turn your existing manual cases into automated tests step by step.`,
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
        'Turn each manual step into one action plus one check.',
        'test.step makes the report read like a test case.',
        'Add at least one negative step to every form test.',
      ],
      source: 'Playwright docs — Writing tests, test.step; practice on saucedemo.com',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-actions-cc-1',
      title: 'The confirm-dialog test that hangs',
      context:
        'A teammate automated "Delete account asks for confirmation". They used the-internet JavaScript alerts page for practice. The test either hangs for 30 seconds, or shows "You clicked: Cancel". They wanted OK.',
      task: 'Make the test press OK on the confirm box. Check the dialog message and the result text. The test must never hang and must not depend on timing.',
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
        'What must every dialog listener do so the click can finish?',
        'When must the listener exist: before or after the button is clicked?',
        'Save the message inside the listener. Check it after the click with expect. No sleep is needed.',
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
      explanation: `One fix per bug:

1. **The listener never closed the dialog.** It only logged the message. So the confirm stayed open. The \`click()\` could not finish, and the test hung until the 30 s timeout. Every listener must call \`accept()\` or \`dismiss()\`.
2. **Waiting too late.** \`page.waitForEvent('dialog')\` after the click starts listening too late. The dialog is already gone. So it waits for a second dialog that never comes. (With no listener at all, Playwright closes the dialog itself. That is why you saw "You clicked: Cancel".)
3. **\`page.on\` became \`page.once\`.** The listener now handles only this one dialog. A later confirm is not accepted by mistake.
4. **No sleep.** \`waitForTimeout\` + \`textContent\` + \`toBe\` became \`await expect(locator).toHaveText(...)\`. It keeps checking until the text appears.
5. **Check the dialog itself.** The listener saves the message and type. So the test proves the right dialog appeared.`,
      followUps: [
        {
          q: 'How would you test the Cancel path of the same confirm?',
          a: 'Add `page.once(\'dialog\', d => d.dismiss())` before the click. Then check `#result` shows "You clicked: Cancel". With no listener, the dialog is also dismissed. But an explicit dismiss shows my intent. It also lets me save the message and check it. So the test does not pass by luck if the dialog stops appearing.',
        },
        {
          q: 'What if the dialog does not appear at all because of a regression?',
          a: 'In the fixed version, the listener never runs. So `dialogType` stays empty. Then `expect(dialogType).toBe(\'confirm\')` fails with a clear message. That is why saving data in the listener helps. A missing dialog becomes a visible failure.',
        },
      ],
    },
    {
      id: 'pw-actions-cc-2',
      title: 'The flaky new-tab test with forced clicks',
      context:
        'A test checks that "Click Here" opens a new window on the-internet /windows. It passes on a fast laptop. In CI it times out about one run in five. A reviewer also found old (deprecated) calls and a forced click.',
      task: 'Rewrite the test so it always catches the new tab. Use current methods and user-facing locators. Check both tabs. Explain why the original sometimes misses the tab.',
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
        'Replace the CSS path and the old `$` call with getByRole and `await expect(...)` checks.',
        'Could a user click this link normally? If yes, why force it?',
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

1. **Listening in time.** The original clicked, slept, and only then started \`context.waitForEvent('page')\`. The tab opened during the sleep. So the wait looked for a *second* tab and timed out. On some runs the tab opened late enough to be caught. That is why it was **flaky** (sometimes passes, sometimes fails, with no code change). Now we start waiting before the click and \`await\` after.
2. **Missing \`await\` on \`goto\`.** The click could start before the page loaded.
3. **\`force: true\` removed.** Nothing covers the link. Forcing would only hide a future banner bug.
4. **Fragile CSS path → \`getByRole('link', { name: 'Click Here' })\`.**
5. **Sleeps removed.** \`waitForTimeout(2000)\` and \`networkidle\` are gone. \`expect\` checks on the new tab wait for exactly what matters.
6. **\`page.$\` + \`textContent\` + \`toBe\`** became \`toBeVisible\` on a role locator. It keeps checking until it passes.
7. **Better checks.** The test also checks the new tab's URL, the original tab and the tab count.`,
      followUps: [
        {
          q: 'When would you use page.waitForEvent(\'popup\') instead of context.waitForEvent(\'page\')?',
          a: 'When I want only tabs opened by this exact page. `popup` ignores tabs made elsewhere, for example by a helper calling `context.newPage()`. So it is more precise when several tabs are open. For a simple test with a `_blank` link, both work.',
        },
        {
          q: 'The new tab requires login. Will it be logged in?',
          a: 'Yes, if it opens in the same browser context. Tabs in one context share cookies and local storage. So the login from the first tab works in the second. A different context does not share it. That is how you test two users at once.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-actions-iq-1',
      difficulty: 'medium',
      question: 'How do you handle alert, confirm and prompt dialogs in Playwright? What happens if you do nothing?',
      whatInterviewerLooksFor: [
        'Knows dialogs close by themselves (auto-dismiss) when there is no listener',
        'Adds the listener before the click that opens the dialog',
        'Knows a listener must accept or dismiss, or the click hangs',
        'Can type into a prompt and check the dialog message',
        'Can tell browser dialogs apart from HTML modals',
      ],
      modelAnswer: `**If I do nothing:** Playwright **closes every dialog for me** (auto-dismiss). An alert just closes. A confirm gets Cancel. A prompt gets no answer. So the test does not hang. But it may quietly take the wrong path.

**Handling it on purpose:**
1. Add a listener before the click: \`page.once('dialog', async d => { msg = d.message(); await d.accept(); })\`.
2. Click: \`await page.getByRole('button', { name: 'Delete' }).click()\`.
3. Check the saved message, and check the page result with \`await expect(...)\`.

For a prompt, \`dialog.accept('text')\` types the answer.

**Two traps:**
- A listener that only logs never closes the dialog. Then the \`click()\` hangs until the test timeout.
- \`page.on\` stays active for the whole test. I prefer \`page.once\`. Then a later dangerous confirm is not accepted by mistake.

Last, I check it is a real browser dialog. Many "dialogs" are HTML modals made of \`div\`s. I click those with normal locators, like \`getByRole('dialog').getByRole('button', { name: 'OK' })\`.

Example on the-internet: accept the confirm, then \`await expect(page.locator('#result')).toHaveText('You clicked: Ok')\`.`,
      followUps: [
        {
          q: 'How would you assert the exact text of an alert?',
          a: 'Inside the listener, save `dialog.message()` into a variable from the test. Accept the dialog. After the click, check `expect(message).toBe(\'I am a JS Alert\')`. You can check inside the listener too. But a failure there is harder to read in reports. Saving first and checking after is cleaner.',
        },
        {
          q: 'How is this different from Selenium?',
          a: 'In Selenium you switch to the alert after it appears: `driver.switchTo().alert().accept()`. Often you add a wait first. In Playwright you decide in advance with a listener. With no listener, the dialog closes by itself. There is no "switch" to manage.',
        },
        {
          q: 'A test has page.on(\'dialog\', d => d.accept()) in beforeEach. Any risk?',
          a: 'Yes. It accepts every dialog in every test. That includes dialogs that should be cancelled. It also hides surprise dialogs that point to a bug. I would add `page.once` per test instead. Or the shared listener should record dialogs so tests can check none were unexpected.',
        },
      ],
      pitfalls: [
        'Saying you must "switch to the alert" as in Selenium',
        'Adding the listener after the click',
        'Listeners that log but never accept or dismiss',
        'Treating HTML modals as browser dialogs',
      ],
    },
    {
      id: 'pw-actions-iq-2',
      difficulty: 'medium',
      question: 'Clicking a link opens a new browser tab. Walk me through automating and verifying it in Playwright.',
      whatInterviewerLooksFor: [
        'Starts waiting for the new tab before the click',
        'Knows the difference between the context "page" event and the page "popup" event',
        'Checks both the new tab and the original tab',
        'Knows tabs in one context share cookies and login',
      ],
      modelAnswer: `A new tab is a new \`Page\` in the same browser context. I receive it through an **event** (a signal from the browser).

**Steps:**
1. \`const newTabPromise = context.waitForEvent('page');\` with **no await**. Now I am listening.
2. \`await page.getByRole('link', { name: 'Click Here' }).click();\`
3. \`const newTab = await newTabPromise;\`
4. Check the new tab: \`await expect(newTab).toHaveURL(/windows\\/new/)\` and \`await expect(newTab.getByRole('heading', { name: 'New Window' })).toBeVisible()\`.
5. Check the original tab did not change. Optionally check \`expect(context.pages()).toHaveLength(2)\`.

**Why the order matters:** if I click first and wait after, the tab may already be open. Then my wait looks for a second tab and times out. The test becomes **flaky**: it passes when the tab opens slowly and fails when it opens fast. \`Promise.all([context.waitForEvent('page'), link.click()])\` is a safe alternative.

**popup vs page:** \`page.waitForEvent('popup')\` catches only tabs opened by that page. \`context.waitForEvent('page')\` catches any new tab in the context.

**Shared login:** both tabs share cookies and storage. So the new tab is logged in too.

At the end I close the tab, or let Playwright clean up after the test.`,
      followUps: [
        {
          q: 'What if the link opens in the same tab on mobile but a new tab on desktop?',
          a: 'I make the expected behaviour clear for each project. On desktop I use the event pattern. On mobile I check `toHaveURL` on the same page. "Opens in a new tab" is itself a requirement. So each test should state it clearly.',
        },
        {
          q: 'How do you switch back to the original tab?',
          a: 'There is nothing to switch. I keep two variables, `page` and `newTab`. I call methods on whichever one I need. `bringToFront()` only matters for screenshots or watching the browser while debugging.',
        },
      ],
      pitfalls: [
        'Awaiting the click before starting to wait for the new tab',
        'Using waitForTimeout to "let the tab open"',
        'Looking for a "switch to window" method',
        'Checking only that some tab opened, not its URL or content',
      ],
    },
    {
      id: 'pw-actions-iq-3',
      difficulty: 'easy',
      question: 'What is the difference between fill(), pressSequentially() and press()? Which one do you use by default and why?',
      whatInterviewerLooksFor: [
        'Uses fill by default to set values',
        'Uses pressSequentially only for key-by-key behaviour (autocomplete, input masks)',
        'Uses press for single keys and shortcuts',
        'Knows page.type is old (deprecated)',
      ],
      modelAnswer: `- **\`fill(value)\`** clicks into the field and replaces the whole value at once. It waits until the field is visible, enabled and editable. It is my **default**, because it is fast and gives the same result every time.
- **\`pressSequentially(text, { delay })\`** types one key at a time, like a person. I use it only when the app reacts to each key. Examples: autocomplete suggestions, a phone field that formats as you type, a live character counter.
- **\`press(key)\`** sends one key or shortcut: \`Enter\` to submit, \`Tab\` to move on, \`ArrowDown\` in a list, \`ControlOrMeta+A\` to select all on any OS.
- **\`clear()\`** empties a field. It helps test "required field" errors.
- **\`page.type\`** is old (deprecated). Old tutorials still show it.

**Example:** on a search page, \`fill('lap')\` may not show suggestions. The box may only react to key presses. So for that one step I use \`pressSequentially('lap')\`. Then \`press('ArrowDown')\` and \`press('Enter')\`.

I check the value with \`await expect(input).toHaveValue('...')\`.`,
      followUps: [
        {
          q: 'fill() fails with a timeout on a field that looks fine. What do you check?',
          a: 'Is the field read-only or disabled? fill needs it editable and enabled. Does my locator point at the input, or at a wrapper div? Is the field inside an iframe? Do two elements match my locator? The error message in the report says which check kept failing.',
        },
        {
          q: 'How do you test a "max 10 characters" limit?',
          a: 'Use `fill(\'12345678901\')` and check `toHaveValue(\'1234567890\')` if the browser enforces maxlength. Also test the boundaries: 9, 10 and 11 characters. If the app counts keys with JavaScript instead, pressSequentially is closer to how users trigger it.',
        },
      ],
      pitfalls: [
        'Saying pressSequentially is always better because it is "realistic"',
        'Recommending page.type',
        'Clicking the field before fill (fill does that itself)',
      ],
    },
    {
      id: 'pw-actions-iq-4',
      difficulty: 'medium',
      question: 'How do you select a value from a dropdown? What changes when the dropdown is a custom React component instead of a native select?',
      whatInterviewerLooksFor: [
        'selectOption by value, label, index or a list',
        'Inspects the HTML first',
        'Knows selectOption throws on elements that are not a <select>',
        'Click the dropdown, then the option by role, for custom dropdowns',
        'Checks the selected value',
      ],
      modelAnswer: `First I inspect the element in DevTools. Is it a real \`<select>\`?

**Real \`<select>\`:** \`selectOption\` does everything. It waits for the dropdown and the option, picks it, and tells the page the value changed.
- By value: \`selectOption('lohi')\` (SauceDemo sort)
- By label: \`selectOption({ label: 'Price (low to high)' })\`
- By position: \`selectOption({ index: 2 })\`. This breaks easily, so I avoid it.
- Several: \`selectOption(['red', 'green'])\` on a multi-select
Then I check \`await expect(sort).toHaveValue('lohi')\`. More important, I check the effect: prices are now low to high.

**Custom dropdown:** there is no \`<select>\`. So \`selectOption\` throws "Element is not a select". I act like a user:
1. \`await page.getByRole('combobox', { name: 'Country' }).click()\`
2. \`await page.getByRole('option', { name: 'India' }).click()\`
3. \`await expect(page.getByRole('combobox', { name: 'Country' })).toHaveText(/India/)\`

If the dropdown has a search box, I \`fill\` it first to shorten the list.

**Label or value?** Label matches the words in manual test cases. Value stays the same when the text is translated. In a multi-language app I choose value.`,
      followUps: [
        {
          q: 'How do you verify all options of a dropdown?',
          a: 'For a real select: `await expect(page.locator(\'#dropdown option\')).toHaveText([\'Please select an option\', \'Option 1\', \'Option 2\'])`. It compares the whole list in order and keeps retrying. For a custom one, open it first and run the same check on `getByRole(\'option\')`.',
        },
        {
          q: 'The option you want is disabled. What happens?',
          a: 'The browser will not select a disabled option. So the test fails with an error or a timeout. That is usually the right result. I would turn it into a clear check instead: `await expect(option).toBeDisabled()`.',
        },
      ],
      pitfalls: [
        'Clicking <option> elements of a real select',
        'Using selectOption on a div-based dropdown',
        'Picking by position when value or label exists',
        'Not checking the selected value or its effect',
      ],
    },
    {
      id: 'pw-actions-iq-5',
      difficulty: 'hard',
      question: 'A teammate fixed a failing click by adding { force: true }. The test is green now. Do you approve the PR?',
      context: 'The error before the change was: "element intercepts pointer events: <div class="cookie-banner">".',
      whatInterviewerLooksFor: [
        'Knows force skips the safety checks, including "is something covering it?"',
        'Asks whether a real user is blocked too',
        'Suggests a user-like fix (close the banner, or set the consent cookie)',
        'Knows the rare good uses of force',
        'Thinks about bugs the change could hide',
      ],
      modelAnswer: `**Not as it is.** The error says a cookie banner covers the button. \`force: true\` skips the safety checks before the click. One check is "does the button receive the click, or is something on top?". So Playwright clicks under the banner. A real user cannot do that.

**Questions I ask:**
1. **Is it a product bug?** Maybe the banner covers Checkout on a normal screen and cannot be closed. Then it is a real defect. The green test would hide it.
2. **Is it a test setup problem?** Users normally accept the banner once. The test should do the same. Click "Accept" in a \`beforeEach\`. Or better, set the consent cookie before the test with \`storageState\` or \`context.addCookies\`.
3. **Is it a timing problem?** Sometimes the banner slides away slowly. Auto-waiting already handles that. So this failure means it never goes away.

**My suggested fix:**
- Remove \`force\`.
- Handle the banner like a user, or set the cookie in setup.
- Check the banner is gone before checkout: \`await expect(banner).toBeHidden()\`.

**When force is OK:** a styled checkbox that hides the real input on purpose (clicking the label is better). Always add a comment and a ticket link.

\`dispatchEvent('click')\` has the same problem. It skips the real mouse, so it is not a user-like click.`,
      followUps: [
        {
          q: 'How can you stop force from creeping into the codebase?',
          a: 'Add a lint rule. eslint-plugin-playwright has rules against force. Add it to the code review checklist. Ask for a comment on every exception. A CI search for `force: true` can also warn on the pull request.',
        },
        {
          q: 'Which checks does force skip, and which still happen?',
          a: 'Force skips the readiness checks: visible, not moving, enabled and not covered. The locator must still find exactly one element (strict mode still applies). Playwright still does the click. So force fixes "cannot click" errors, not "cannot find" errors.',
        },
      ],
      pitfalls: [
        'Approving because the build is green',
        'Not asking whether users are blocked too',
        'Replacing force with waitForTimeout',
      ],
    },
    {
      id: 'pw-actions-iq-6',
      difficulty: 'medium',
      question: 'Your locator works in DevTools but Playwright says it cannot find the element. You discover it is inside an iframe. How do you handle iframes, including nested ones?',
      whatInterviewerLooksFor: [
        'Knows page locators do not look inside iframes',
        'Uses frameLocator or locator.contentFrame()',
        'Chains frame locators for iframes inside iframes',
        'Gives real examples (payment fields, text editor)',
        'Compares with Selenium switchTo().frame()',
      ],
      modelAnswer: `An iframe holds a separate web page. So \`page.getByRole(...)\` searches only the outer page. It keeps waiting until it times out.

**Ways in:**
- \`page.frameLocator('#card-frame').getByLabel('Card number')\`. A frame locator waits like any locator. I can chain any locator method and act as usual.
- If I already have a locator for the \`<iframe>\` tag, \`locator.contentFrame()\` lets me look inside it.

**Iframes inside iframes:** chain them. \`page.frameLocator('frame[name="frame-top"]').frameLocator('frame[name="frame-middle"]').locator('#content')\` reads "MIDDLE" on the-internet nested frames page.

**Finding the iframe:** use a stable attribute, like \`title\`, \`name\`, \`data-testid\` or part of \`src\`: \`iframe[src*="checkout"]\`. Do not pick it by position. Ad and chat iframes change the order.

**Real cases:** payment card fields (each in its own iframe), text editors like TinyMCE, maps. Do not automate CAPTCHA. Ask for a test key or bypass.

**Compared with Selenium:** there is no \`switchTo().frame()\` and no switching back. Each locator knows its own frame path. So I can never get stuck "inside" the wrong frame.`,
      followUps: [
        {
          q: 'How would you test a Stripe card element?',
          a: 'Use Stripe test mode and its test card numbers. Each field (number, expiry, CVC) may be its own iframe. I find each frame by its title and fill the input inside it. Then I check the outer page for the success message. I never use real cards or live keys.',
        },
        {
          q: 'Can frameLocator actions be slower or flakier?',
          a: 'They wait like any locator, so they are not flaky by nature. Problems come from iframes that reload, or iframes from another site that load slowly. The frame locator simply finds the new frame again. The fix is a check on content inside the frame, not a sleep.',
        },
      ],
      pitfalls: [
        'Searching for a "switch to frame" method',
        'Picking iframes by position',
        'Adding waits instead of entering the frame',
      ],
    },
    {
      id: 'pw-actions-iq-7',
      difficulty: 'hard',
      question: 'Write a test that verifies the "Due" amount for a specific person in a web table, and that the column total is correct. How do you keep it robust when rows are sorted or columns move?',
      context: 'Use the-internet.herokuapp.com/tables, table 1, as the example.',
      whatInterviewerLooksFor: [
        'Finds rows by unique text, not by position',
        'Gets the column number from the header text',
        'Waits for the table to load before reading it all at once',
        'Turns money text into numbers correctly',
        'Thinks about sorting, paging and empty tables',
      ],
      modelAnswer: `**Plan:**
1. Find the rows: \`const rows = page.locator('#table1 tbody tr')\`.
2. Make sure the data is there: \`await expect(rows).toHaveCount(4)\`. This matters because \`allTextContents()\` does not wait.
3. Find the column number from the header. Read the \`thead th\` texts. Then \`findIndex(h => h.trim() === 'Due')\` gives 3. Columns can move, but the header name stays.
4. Pick the row by a unique value: \`rows.filter({ hasText: 'fbach@yahoo.com' })\`. Email is unique. A last name might not be.
5. Check the cell: \`await expect(frankRow.locator('td').nth(dueIndex)).toHaveText('$51.00')\`. This check keeps retrying until it passes.
6. Total: read the column with \`allTextContents()\`. Turn each text into a number with \`Number(text.replace('$', ''))\`. Add them with \`reduce\`. Then \`expect(total).toBe(251)\`.

**Keeping it robust:**
- Sorting: never assume row 2 is Frank. The filter finds him anywhere.
- Money: for values like \`$1,200.50\`, remove everything except digits and the dot. For decimal sums, use \`toBeCloseTo\` or work in cents.
- Paging: check totals through the API. Keep the UI test for what is shown.
- Empty table: a separate test that it shows "No records".

I would put steps 3–4 in a small helper, \`cellFor(rowKey, columnName)\`, in the page object. Then many tests can reuse it.`,
      followUps: [
        {
          q: 'Why not use getByRole(\'row\', { name: \'Frank\' })?',
          a: 'You can. A row\'s name is built from its cell text. So `getByRole(\'row\', { name: /fbach@yahoo\\.com/ })` works and reads well. The risk is partial matches. By default the name match ignores case and accepts part of the text. So `name: \'Doe\'` would also match a "Doerr" row. Use exact matching, a precise regex, or a unique column like email.',
        },
        {
          q: 'How would you verify the table is sorted after clicking the "Due" header?',
          a: 'Click the header. Wait for a visible change with an `expect` check, for example the first cell changes. Then read the column with allTextContents and turn it into numbers. Compare it with a copy sorted by number. A plain `sort()` sorts text, so "$100.00" would land in the wrong place.',
        },
      ],
      pitfalls: [
        'Using row positions like tr:nth-child(2)',
        'Calling allTextContents before the table has loaded',
        'Adding text instead of numbers, or sorting numbers as text',
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
      insight: 'Pick the action from how the element is built (real or custom) and how the app listens (whole value or each key). Each action needs a matching check. The action alone proves nothing.',
      followUps: [
        {
          q: 'What changes for (d) if the file input only appears after clicking "Upload resume"?',
          a: 'Use the filechooser event. Start `const chooserPromise = page.waitForEvent(\'filechooser\')`. Click the button. Then `const chooser = await chooserPromise` and `await chooser.setFiles(\'tests/data/resume.pdf\')`. Start listening before the click, just like new tabs and downloads.',
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
      answer: '**C, D, B, A, F, E** (D, C, B, A, E, F is also correct). B must come after C and D. If B comes before C, the confirm closes with Cancel and no download starts. If B comes before D, the download can start before anyone listens.',
      insight: 'Dialogs, new tabs, downloads and file choosers share one rule: start listening, then click, then receive. Learn it once and use it for all of them.',
      followUps: [
        {
          q: 'What would happen if you used page.on instead of page.once for the dialog here?',
          a: 'This test would still pass. The problem comes later. Any other dialog in the same test would also be accepted, for example a "Delete all?" confirm. page.once handles only the dialog you meant. Surprise dialogs then close with Cancel, so they are easier to notice.',
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
      insight: 'count(), textContent() and allTextContents() read the page once and do not wait. They are right here only because this simple page has loaded. On a table that loads later, first check with toHaveCount, or check directly with toHaveText.',
      followUps: [
        {
          q: 'How would you assert the whole Due column in one retrying assertion?',
          a: '`await expect(rows.locator(\'td:nth-child(4)\')).toHaveText([\'$50.00\', \'$51.00\', \'$100.00\', \'$50.00\'])`. With a list, toHaveText checks every cell in order. It keeps retrying until it matches or times out. So it is safe on tables that load later.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-actions-mcq-01',
      difficulty: 'easy',
      question: 'A search box shows suggestions only when keys are pressed (keyup events). Which call makes suggestions appear for "lap"?',
      options: [
        "await box.fill('lap')",
        "await box.pressSequentially('lap')",
        "await box.selectOption('lap')",
        "await box.setInputFiles('lap')",
      ],
      correct: [1],
      explanation:
        'pressSequentially types one key at a time, so key listeners fire for every letter. fill puts in the whole value at once. Many widgets handle that, but a box that only listens to key presses would miss it. selectOption is for <select> elements and setInputFiles is for file inputs, so both throw here.',
      followUps: [
        {
          q: 'Why not use pressSequentially for every input then?',
          a: 'It is slower and tests nothing extra on normal fields. fill is faster, clears the old value and is the documented default. Keep pressSequentially for fields that react to each key.',
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
        'A plain string is matched against the option value first (then the label). Value "2" belongs to "Option 2". It is not a position number, so "the third option" is right only by chance here. selectOption accepts a plain string as well as { label } and { index }. Nothing on this page changes how positions are counted.',
      followUps: [
        {
          q: 'How would you assert the selection?',
          a: 'await expect(page.locator(\'#dropdown\')).toHaveValue(\'2\'). It keeps checking until the value matches, so it also works when the app updates the dropdown a little later.',
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
        'With no dialog listener, Playwright closes dialogs by itself (dismiss). So the confirm gets Cancel, and the page writes "You clicked: Cancel". A hang happens only when a listener exists but never calls accept or dismiss. Playwright does not press OK by default, and it does not throw an "unhandled dialog" error.',
      followUps: [
        {
          q: 'How do you make it click OK instead?',
          a: 'Add page.once(\'dialog\', d => d.accept()) before the click. Then check await expect(page.locator(\'#result\')).toHaveText(\'You clicked: Ok\').',
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
        'The wait starts after the click has already opened the tab. So the event is usually missed. The wait then looks for a second new tab until it times out. It passes only when the tab happens to open late. The page event does fire for _blank links. toHaveTitle works on any Page, and force has nothing to do with tabs.',
      followUps: [
        {
          q: 'Write the fixed version in three lines.',
          a: 'const p = context.waitForEvent(\'page\'); await page.getByRole(\'link\', { name: \'Click Here\' }).click(); const newTab = await p; We start waiting first and await it after the click.',
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
        'selectOption works by value (lohi), by label, or by position counted from 0 (az=0, za=1, lohi=2). So the first three all pick it, but position breaks most easily. fill throws, because a <select> is not a text field. Clicking a point only opens the dropdown; it does not choose an option.',
      followUps: [
        {
          q: 'Which of the three would you use in a framework and why?',
          a: 'Value or label. Value stays the same when the text changes or is translated. Label matches the manual test case words. Position breaks as soon as an option is added or moved.',
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
        'A custom dropdown is not a <select>. So act like a user: open the combobox, then click the option by role and name. force cannot turn a div into a select. Setting a hidden value with evaluate skips the dropdown\'s own code, so the screen and form may not update. The parent div is not a select either.',
      followUps: [
        {
          q: 'The listbox renders at the end of <body> (a portal). Does that matter?',
          a: 'Only if you searched for the option inside the combobox box. The list is actually at the end of the page. Use a page-level getByRole(\'option\'), or search inside getByRole(\'listbox\').',
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
        'Payment providers usually put card fields inside iframes. Normal page locators never look inside iframes, so use frameLocator or contentFrame(). XPath cannot look inside iframes either. A sleep does not help, because the locator will never match in the outer page. A strict mode error says "resolved to N elements"; it is not a timeout with zero matches.',
      followUps: [
        {
          q: 'How would you pick a stable locator for the iframe itself?',
          a: 'Use a meaningful attribute such as title, name or part of src, for example iframe[title="Secure card number input frame"]. Do not use the iframe\'s position, because ad and chat iframes change the order.',
        },
      ],
    },
    {
      id: 'pw-actions-mcq-08',
      difficulty: 'medium',
      question: 'A download test saves nothing. The file at download.path() is gone when the next test reads it. Why?',
      options: [
        'Downloads require headed mode',
        'Downloaded files are temporary and deleted when the browser context closes; call saveAs() to keep them',
        'download.path() returns a URL, not a file path',
        'You must set acceptDownloads: false',
      ],
      correct: [1],
      explanation:
        'Playwright keeps downloads in a temporary folder. That folder is cleaned when the test\'s browser context closes. So a later test cannot use that path. Save the file with download.saveAs(target) inside the test. Downloads work without a visible browser, path() returns a local file path, and acceptDownloads: false would block downloads completely.',
      followUps: [
        {
          q: 'Where should the test save it?',
          a: 'testInfo.outputPath(download.suggestedFilename()) gives each test its own folder inside the test results. Tests running at the same time do not overwrite each other.',
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
        'setInputFiles accepts one path, a list of paths for a multiple input, or an empty list to clear the choice. It also accepts a file made in code: { name, mimeType, buffer }. fill does not work on file inputs. Browsers do not let scripts type a path into them. That is why setInputFiles exists.',
      followUps: [
        {
          q: 'The page has no file input until you click "Browse". What now?',
          a: 'Start const chooser = page.waitForEvent(\'filechooser\') before clicking Browse. Then call (await chooser).setFiles(path). It is the same listen, click, receive pattern as new tabs and downloads.',
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
        'force skips the safety checks, including "does the button receive the click, or is something on top?". So Playwright clicks under the banner, where a user cannot. The test should fail, and a bug should be filed. force does not wait longer, and it works in every browser. It is for rare, deliberate cases, not for banners that block users.',
      followUps: [
        {
          q: 'How should the test handle a banner that users can close?',
          a: 'Close it like a user in the setup step, or set the consent cookie in storageState. Then check it is hidden before going on. The click stays normal, not forced.',
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
        'Once a dialog listener exists, Playwright stops closing dialogs by itself. It leaves them to you. This listener only logs, so the alert stays open and the click on line 3 never finishes. goto waits for load, not networkidle. Line 4 is never reached. page.on adds the listener at once and does not need await.',
      followUps: [
        {
          q: 'Fix it with one change.',
          a: 'Make the listener close the dialog: page.on(\'dialog\', async d => { console.log(d.message()); await d.accept(); }); Even better, use page.once, so only this dialog is affected.',
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
        'B finds the row by a unique value (the email). So it works wherever sorting puts Frank. A and D depend on the row\'s position, which the new sort changes. C matches any cell that contains "51". That could be $151.00 or a different column, and it does not tie the value to Frank at all.',
      followUps: [
        {
          q: 'What if the Due column moves to position 5?',
          a: 'Then a fixed nth(3) breaks. Read the header texts, find the position of "Due", and use that number. The test now follows the column by its name.',
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
        'goto waits for the load event by default. commit is the earliest point: the response arrived. The docs do not recommend networkidle, because background requests can stop it from finishing, and it does not prove the page is ready. domcontentloaded fires when the HTML is read, before images finish. Waiting for images is what load does.',
      followUps: [
        {
          q: 'After clicking a link that navigates, how do you wait for the new page?',
          a: 'await expect(page).toHaveURL(/target/) or await page.waitForURL(\'**/target\'). waitForNavigation is old (deprecated), and actions on the new page wait by themselves anyway.',
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
        'Press on the source, move over the target, then let go. Some apps accept a drop only after the mouse has moved over the target (the dragover event). That is why you hover the target twice. Two clicks never hold the button down. Sending drop before drag gets the events in the wrong order. The last option presses before reaching the source and releases in the wrong place.',
      followUps: [
        {
          q: 'How do you prove the drop worked on the-internet /drag_and_drop?',
          a: 'Check the swapped headers: await expect(page.locator(\'#column-a header\')).toHaveText(\'B\'). A drag without a result check only proves that the mouse moved.',
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
        'A tab opened by this page fires the page\'s popup event and the context\'s page event. So both listeners get it. The browser object has no \'page\' event. A Page sends \'popup\', not \'page\', so waiting for \'page\' on a page never finishes. A tab made with context.newPage() would fire only the context event, not popup.',
      followUps: [
        {
          q: 'When is context.on(\'page\') more useful than a one-off wait?',
          a: 'When you do not know which action opens a tab, or tabs open again and again (like help pages). A context listener can log or close every new tab. waitForEvent is for one expected tab after one action.',
        },
      ],
    },
  ],
};

export default topic;
