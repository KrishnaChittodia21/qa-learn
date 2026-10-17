import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-locators',
  phase: 'pw-basics',
  order: 2,
  title: 'Locators: Finding Elements the Way Users Do',
  subtitle:
    `How locators work (they search the page again every time), which locator to choose first (role → label → placeholder → text → alt/title → test id), getByRole in depth, filtering and chaining, strictness, CSS and XPath as a last resort, iframes and shadow DOM, testIdAttribute, and the tools that pick locators for you.`,
  estimatedMinutes: 90,
  sources: [
    'Playwright docs — Locators (playwright.dev/docs/locators)',
    'Playwright docs — Other locators (playwright.dev/docs/other-locators)',
    'Playwright docs — Locator API reference (playwright.dev/docs/api/class-locator)',
    'Playwright docs — Frames (playwright.dev/docs/frames)',
    'Playwright docs — Best practices (playwright.dev/docs/best-practices)',
    'Playwright docs — Test generator / Pick locator (playwright.dev/docs/codegen)',
    'W3C — Accessible Name and Description Computation (accname) & WAI-ARIA roles',
    "Debbie O'Brien — How to locate elements in Playwright (debbie.codes)",
    "Checkly — Make your end-to-end tests more stable with Playwright's user-first selectors",
    'TestDino — Playwright interview questions & answers 2026 (locators, strict mode, iframes)',
  ],
  tags: ['playwright', 'locators', 'getByRole', 'getByLabel', 'getByTestId', 'filter', 'strict-mode', 'css', 'xpath', 'frameLocator', 'shadow-dom', 'accessibility'],
  cheatSheet: [
    `A locator is a recipe, not an element. Nothing is searched until an action or assertion runs. It searches the page again every time, so it never goes stale.`,
    `Priority: getByRole → getByLabel → getByPlaceholder → getByText → getByAltText / getByTitle → getByTestId → CSS → XPath (last resort).`,
    `\`getByRole('button', { name: 'Login' })\`: by default \`name\` matches part of the text and ignores case. \`exact: true\` = whole text, same case. A regex also works. More filters: level, checked, pressed, expanded, selected, disabled, includeHidden.`,
    `Accessible name comes from aria-labelledby > aria-label > label/alt/content text > title. \`<input type="submit" value="Login">\` has role button and name "Login".`,
    `getByText is for text you don't click. Spaces are always cleaned up. By default it matches part of the text and ignores case. Use \`{ exact: true }\` or a regex to be precise.`,
    `getByTestId reads \`data-testid\` unless \`use.testIdAttribute\` is set (SauceDemo: \`testIdAttribute: 'data-test'\`). The value must match exactly.`,
    `Narrow down with chaining (\`list.getByRole(...)\`) and \`filter({ hasText, hasNotText, has, hasNot, visible })\`. Combine with \`and()\` / \`or()\`.`,
    `Strictness: actions and checks on one element (click, fill, toHaveText, toBeVisible) throw "strict mode violation" if more than one element matches. count(), all() and toHaveCount() do not.`,
    `first() / last() / nth(i) (counting from 0) remove the strictness error but break when the order changes. Prefer a filter by visible content.`,
    `CSS or XPath with page.locator('...'). Playwright detects the type; \`//\` means XPath. Avoid long HTML paths, nth-child and generated class names.`,
    `iframes: page.frameLocator('#id').getByRole(...) or locator.contentFrame(). Open shadow DOM is searched automatically (but not by XPath, and not closed shadow roots).`,
    `Pick locators with codegen, UI mode, the VS Code extension or the Inspector. If the best tool offers only a CSS path, the HTML is missing labels or test ids.`,
  ],
  sections: [
    {
      heading: 'What a locator is',
      body: `**Example:** \`const loginButton = page.getByRole('button', { name: 'Login' })\`

- This line does not touch the browser yet.
- It only saves *how* to find the Login button.
- The search happens later, when you call \`await loginButton.click()\`.

A **locator** is a description of how to find an element. It is like telling a colleague "the Login button on the sign-in form". It is not a photo of the button. Your colleague can use the description again and again.

You create locators with \`page.getByRole()\`, \`page.getByLabel()\`, \`page.locator()\` and similar methods. Creating one does nothing in the browser.

Playwright searches the page only when you call an **action** (\`click\`, \`fill\`, \`check\`…) or an assertion like \`await expect(locator).toBeVisible()\`. Then it waits until the element is ready, and acts.

**Locator vs ElementHandle.** Old code uses \`page.$()\`. It returns an **ElementHandle**: a fixed pointer to one element, found at one moment.

| | Locator (use this) | ElementHandle from \`page.$()\` (old) |
|---|---|---|
| What it holds | A description of how to find the element | A pointer to one element, found once |
| When it searches | Every time you use it | Once, when created |
| The app redraws the element (React replaces it) | Finds the new element | Still points to the old, removed element → errors |
| Waits by itself before actions | Yes | Limited; you handle timing |
| Error if many elements match | Yes | No |
| In the docs | Recommended | Discouraged |

**In an interview, say:** "A locator is a recipe. I can define it once, at the top of a test or in a page object, and reuse it. Each time I use it, Playwright searches the page again."

**Watch out:** don't write \`const btn = await page.getByRole('button')\`. There is nothing to await, because \`getByRole\` returns a locator right away. Await the **action** instead: \`await page.getByRole('button', { name: 'Login' }).click()\`.

**Why testers care:** you define a locator once and reuse it everywhere. It never goes out of date.`,
      code: [
        {
          language: 'typescript',
          title: 'Locators are cheap to create and safe to reuse',
          code: `import { test, expect } from '@playwright/test';

test('declare once, use many times', async ({ page }) => {
  // No browser work happens on these three lines: they are just recipes.
  const username = page.getByPlaceholder('Username');
  const password = page.getByPlaceholder('Password');
  const loginButton = page.getByRole('button', { name: 'Login' });

  await page.goto('https://www.saucedemo.com/');
  await loginButton.click();                       // empty form → error shown
  await expect(page.getByRole('alert')).toContainText('Username is required');

  // The page re-rendered; the same locators still work because they re-query.
  await username.fill('standard_user');
  await password.fill('secret_sauce');
  await loginButton.click();
  await expect(page).toHaveURL(/inventory/);
});`,
        },
      ],
      keyPoints: [
        `Creating a locator does nothing in the browser. Actions and assertions do the searching.`,
        `Don't \`await\` the locator itself. Await the action or the assertion.`,
        `Prefer locators over \`page.$\` and ElementHandles, which go stale.`,
      ],
      source: 'Playwright docs — Locators (introduction); Playwright docs — Locator API reference',
    },
    {
      heading: 'How a locator resolves',
      body: `**Example:** \`await page.getByRole('button', { name: 'Login' }).click()\`

- Playwright searches the page for a Login button, right now.
- If it finds none, it waits and searches again.
- If it finds one, it waits until the button is ready, then clicks.
- If it finds more than one, it stops with an error.

Each time you use a locator, Playwright searches again from scratch. It is like asking "where is the Login button *now*?" before every step.

**The steps inside \`await locator.click()\`:**

1. **Find:** search the current page (the main frame, or the iframe you chose). Open shadow DOM is searched too.
2. **Count:** 0 matches → wait and try again. Exactly 1 → go on. More than 1 → stop at once with a **strict mode violation** error (see Strictness).
3. **Check that it is ready:** for a click, the element must be on the page, visible, not moving, not covered, and enabled. These are the **actionability checks**. If one fails, go back to step 1 and try again.
4. **Act:** scroll the element into view and send a real mouse click.
5. If the timeout comes first, the test fails. The error lists what Playwright tried.

Assertions use the same loop. \`await expect(locator).toHaveText('1')\` searches and checks again and again. It stops when it passes or when the 5 s expect timeout ends. This kind of check is called a **web-first assertion**.

**Why it matters:** modern apps (React, Angular) often replace elements on the page. An old pointer to a replaced element points at nothing. We call it "detached" or "stale". A locator never holds an element, so it cannot go stale.

**Example from TodoMVC:** after you add an item, the list is drawn again. \`getByTestId('todo-title')\` still finds the new items, because every assertion searches again.

Waiting is covered fully in **pw-assertions-waiting**. Here, remember the order: *find → exactly one? → ready? → act*. Playwright repeats this until the timeout.

**Why testers care:** your tests don't break just because the app redrew the page.`,
      diagram: `  await locator.click()
        |
        v
  +--------------------+   0 matches    +-------------------+
  | resolve query on   |--------------->| wait, retry       |--+
  | the live DOM       |                | (until timeout)   |  |
  +--------------------+                +-------------------+  |
        | 1 match              >1 match                        |
        |                         '--> throw strict mode       |
        v                              violation               |
  +--------------------+  not ready                            |
  | actionability:     |---------------------------------------+
  | visible, stable,   |   (re-resolve on every retry)
  | enabled, receives  |
  | events             |
  +--------------------+
        | ready
        v
     click!`,
      code: [
        {
          language: 'typescript',
          title: 'demo.playwright.dev/todomvc — the list re-renders, the locator keeps up',
          code: `import { test, expect } from '@playwright/test';

test('locators re-resolve after re-renders', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');

  const newTodo = page.getByPlaceholder('What needs to be done?');
  const titles = page.getByTestId('todo-title'); // TodoMVC uses data-testid

  await newTodo.fill('Write locator notes');
  await newTodo.press('Enter');
  await newTodo.fill('Practise getByRole');
  await newTodo.press('Enter');

  // Same locator object, fresh query each time it is used:
  await expect(titles).toHaveText(['Write locator notes', 'Practise getByRole']);

  // Complete the first item: the DOM node is replaced, the locator does not care.
  await page.getByTestId('todo-item')
    .filter({ hasText: 'Write locator notes' })
    .getByRole('checkbox', { name: 'Toggle Todo' })
    .check();
  await expect(page.getByTestId('todo-item').first()).toHaveClass(/completed/);
});`,
        },
      ],
      keyPoints: [
        `Every action and assertion runs the search again, so locators never go stale.`,
        `Zero matches → wait and retry. More than one → strict mode error. Exactly one → readiness checks → act.`,
        `Retries go on until the action, test or expect timeout ends.`,
      ],
      source: 'Playwright docs — Locators; Playwright docs — Auto-waiting (actionability)',
    },
    {
      heading: 'The recommended locator priority',
      body: `**Example:** compare \`page.getByRole('button', { name: 'Login' })\` with \`page.locator('.form_column > div:nth-child(3) > input')\`.

- The first says what a user sees: "the Login button".
- The second says where the element sits in the HTML.
- The first keeps working after a redesign. The second often breaks.

Find elements the way a user would describe them. Users say "the **Login** button", "the **Password** field", "the **Products** heading". They never say "the third div inside .form_column".

This includes people who use a screen reader, a program that reads the page aloud.

**Priority list** (Playwright's advice; codegen follows it too):

| # | Locator | Use for | Example |
|---|---|---|---|
| 1 | \`getByRole\` | Anything you click or that gives structure: buttons, links, checkboxes, headings, rows, dialogs | \`getByRole('button', { name: 'Login' })\` |
| 2 | \`getByLabel\` | Form fields with a \`<label>\`, \`aria-label\` or \`aria-labelledby\` | \`getByLabel('Password')\` |
| 3 | \`getByPlaceholder\` | Inputs with no label but with a placeholder | \`getByPlaceholder('Username')\` |
| 4 | \`getByText\` | Text you don't click: messages, paragraphs, spans | \`getByText('Epic sadface')\` |
| 5 | \`getByAltText\` | Images and \`<area>\` by their \`alt\` text | \`getByAltText('Sauce Labs Backpack')\` |
| 6 | \`getByTitle\` | Elements with a \`title\` attribute (tooltips) | \`getByTitle('Issues count')\` |
| 7 | \`getByTestId\` | When user-facing text is missing, unclear or changes often (translations) | \`getByTestId('login-button')\` |
| 8 | CSS / XPath with \`page.locator\` | Last resort: old apps, no better hook | \`page.locator('#user-name')\` |

**Why this order:**

- **It survives changes.** Classes, nesting and ids change when developers refactor. The role and name of a "Login" button rarely change.
- **It fails for the right reason.** If a developer renames the button to "HEROBUTTON_TXT", a role locator fails. That is a real bug a user would see. A CSS locator would miss it.
- **A free accessibility check.** If you can't write a role or label locator, screen-reader users probably can't find that control either. Report it as a bug.

**Where test ids fit:** they are stable and clear, but users can't see them. So they don't catch "wrong label" bugs.

Teams with translated pages or icon-only buttons often use test ids for those elements. Both choices are fine in an interview, if you explain the trade-off.

**In an interview, say:** "Role and label first, because they match what the user sees and also check accessibility. Test ids when the text changes often. CSS or XPath only as a last resort, short and scoped."

**Why testers care:** role locators keep working when developers change CSS classes.`,
      keyPoints: [
        `User-facing locators (role, label, placeholder, text) first. Test ids next. CSS and XPath last.`,
        `User-facing locators also catch broken labels and missing accessibility.`,
        `Test ids are a clear agreement with developers. They suit translated pages and icon-only buttons.`,
      ],
      source: "Playwright docs — Locators (quick guide) & Best practices; Checkly — user-first selectors; Debbie O'Brien — How to locate elements in Playwright",
    },
    {
      heading: 'getByRole in depth',
      body: `**Example:** \`page.getByRole('button', { name: 'Login' })\` matches all three of these:

- \`<button>Login</button>\`.
- \`<input type="submit" value="Login">\`.
- \`<div role="button">Login</div>\`.

To the browser, each one is "a button named Login".

Next to the HTML, the browser builds an **accessibility tree**. It is a simple list that says what each thing is and what it is called. Screen readers use it. \`getByRole\` searches this tree.

**Common built-in roles:**

| HTML | Role |
|---|---|
| \`<button>\`, \`<input type="submit">\`/\`"button"\` | button |
| \`<a href="...">\` | link (no \`href\` → no link role) |
| \`<input type="text">\`, \`<textarea>\` | textbox |
| \`<input type="checkbox">\` / \`"radio"\` | checkbox / radio |
| \`<select>\` | combobox (or listbox with \`multiple\`/\`size\`) |
| \`<h1>\`…\`<h6>\` | heading (with \`level\`) |
| \`<ul>/<ol>\`, \`<li>\` | list, listitem |
| \`<table>\`, \`<tr>\`, \`<td>\`, \`<th>\` | table, row, cell, columnheader |
| \`<img alt="...">\` | img |
| \`<nav>\`, \`<main>\`, \`<footer>\` (top-level) | navigation, main, contentinfo |
| \`role="alert"\`, \`role="dialog"\` | alert, dialog |

**The accessible name** is what \`name\` matches. The browser works it out in roughly this order:

1. \`aria-labelledby\`.
2. \`aria-label\`.
3. The native label: \`<label for>\`, a wrapping label, \`alt\`, or the \`value\` of a submit input.
4. The text inside the element.
5. \`title\`.

So \`<button aria-label="Close menu">X</button>\` is named "Close menu", not "X".

**Options:**

| Option | Meaning |
|---|---|
| \`name\` | A string matches part of the name and ignores case. A regex also works |
| \`exact: true\` | The name must match the whole string, with the same case (outer spaces trimmed) |
| \`level\` | Heading level, e.g. \`{ level: 1 }\` |
| \`checked\`, \`pressed\`, \`expanded\`, \`selected\`, \`disabled\` | Match the element's state |
| \`includeHidden\` | Also match elements hidden from the accessibility tree (default false) |

**Part-of-name trap:** \`getByRole('link', { name: 'About' })\` also matches "About the company". Use \`exact: true\`, or a regex like \`/^About$/\`.

**Watch out:** a link styled to look like a button is still a link. \`getByRole('button', { name: 'Submit' })\` won't find it. Role is about meaning, not looks. Check the Accessibility pane in DevTools, or use Pick locator.

**Why testers care:** one locator works no matter which HTML tag the developer chose.`,
      code: [
        {
          language: 'typescript',
          title: 'getByRole on SauceDemo and the-internet',
          code: `import { test, expect } from '@playwright/test';

test('roles, names and states', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  // <input type="submit" value="Login"> → role button, name "Login"
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  // The burger icon's name comes from hidden text / the icon's alt, not a visible label
  await page.getByRole('button', { name: 'Open Menu' }).click();
  // Menu entries are <a role="button">, so their role is button, not link
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

  // Sort dropdown: <select aria-label="Sort products"> → combobox
  await page.getByRole('button', { name: 'Close Menu' }).click();
  await page.getByRole('combobox', { name: 'Sort products' })
    .selectOption('Price (low to high)');
});

test('state options: checked', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/checkboxes');
  // Two unlabeled checkboxes: the second one starts checked
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 3 })).toHaveText('Checkboxes');
});`,
        },
      ],
      keyPoints: [
        `Role comes from meaning (the tag or the \`role\` attribute), not from how it looks.`,
        `Name = accessible name (aria-labelledby, aria-label, label/alt/value, text, title).`,
        `\`name\` matches part of the text and ignores case, unless \`exact: true\`. Use \`level\`, \`checked\` and so on to narrow further.`,
      ],
      source: 'Playwright docs — Locate by role; Locator API (getByRole options); W3C accname 1.2; WAI-ARIA in HTML (implicit roles)',
    },
    {
      heading: 'getByLabel, getByPlaceholder, getByText, getByAltText, getByTitle',
      body: `**Example:** \`await page.getByLabel('Password').fill('SuperSecretPassword!')\`

- Playwright finds the input linked to the label "Password".
- It types the password into it.
- It still works if the input's id or class changes.

These locators match other ways people point at things. "The field labelled Password." "The box that says Username inside it." "The message that says locked out." "The backpack picture."

| Locator | Matches | Default matching | Good target |
|---|---|---|---|
| \`getByLabel(text)\` | A form field linked to a \`<label for>\`, a wrapping \`<label>\`, \`aria-labelledby\` or \`aria-label\` | Part of the text, any case; \`exact\` available | the-internet login: \`getByLabel('Username')\` |
| \`getByPlaceholder(text)\` | The \`placeholder\` of inputs and textareas | Part of the text, any case; \`exact\` available | SauceDemo: \`getByPlaceholder('Username')\` |
| \`getByText(text)\` | An element whose text matches | Part of the text, any case; **spaces always cleaned up**; \`exact\` or regex | Error banners, product names, pop-up messages |
| \`getByAltText(text)\` | \`<img>\` / \`<area>\` by \`alt\` | Part of the text, any case; \`exact\` available | Product images |
| \`getByTitle(text)\` | An element by its \`title\` attribute | Part of the text, any case; \`exact\` available | Icon buttons with tooltips |

**getByText details for interviews:**

- Spaces are always cleaned up, even with \`exact: true\`. Line breaks become spaces. Many spaces become one. Spaces at the start and end are ignored.
- \`exact: true\` means the full text, with the same case. A regex gives full control: \`getByText(/^Products$/)\`.
- Use it for text you **don't click**. For a button, prefer \`getByRole('button', { name })\`. That also proves it is a real button.
- It can match several elements. A parent and its child that both "contain" the text are handled for you. The same message shown twice is not. Then chain from a container or use \`exact\`.

**Placeholder vs label:** a placeholder disappears when the user types. So it is a weak label for people.

SauceDemo's login fields have only placeholders (and test ids). The-internet's login form has real labels. Use what exists, and report missing labels as accessibility issues.

**Why testers care:** these locators read the page like a user does, so they also catch wrong or missing labels.`,
      code: [
        {
          language: 'typescript',
          title: 'Labels on the-internet, placeholders and text on SauceDemo',
          code: `import { test, expect } from '@playwright/test';

test('the-internet login uses real labels', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  // <label for="username">Username</label><input id="username">
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('You logged into a secure area!')).toBeVisible();
});

test('SauceDemo: placeholders, text and alt text', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  // Substring + case-insensitive by default
  await expect(page.getByText('do not match any user')).toBeVisible();

  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  // exact: whole string, case-sensitive (whitespace still normalised)
  await expect(page.getByText('Products', { exact: true })).toBeVisible();
  await expect(page.getByAltText('Sauce Labs Backpack')).toBeVisible();
});`,
        },
      ],
      keyPoints: [
        `getByLabel works with \`<label for>\`, wrapping labels, aria-labelledby and aria-label.`,
        `getByText matches part of the text and ignores case by default. Spaces are always cleaned up. Use \`exact\` or a regex to be strict.`,
        `For things you click, prefer role over text.`,
      ],
      source: 'Playwright docs — Locate by label / placeholder / text / alt text / title',
    },
    {
      heading: 'getByTestId and testIdAttribute',
      body: `**Example:** \`page.getByTestId('login-button')\`

- By default it finds the element with \`data-testid="login-button"\`.
- Users never see this attribute.
- It stays the same when the design or wording changes.

A **test id** is a name tag that developers add to an element just for automation. The team agrees on it.

**How it works:**

- \`getByTestId('login-button')\` matches \`[data-testid="login-button"]\` by default. The value must match exactly (a regex is also allowed).
- Different attribute? Set it once in the config: \`use: { testIdAttribute: 'data-test' }\`.
- **SauceDemo uses \`data-test\`.** For example: \`data-test="username"\`, \`"password"\`, \`"login-button"\`, \`"inventory-item"\`, \`"shopping-cart-badge"\` and \`"add-to-cart-sauce-labs-backpack"\`.
- You can also call \`selectors.setTestIdAttribute('data-test')\` in code. Codegen accepts \`--test-id-attribute=data-test\`, so recordings use it too.
- You can set it per project, if two apps use different attributes.

**When test ids are the right choice:**

| Situation | Why |
|---|---|
| The page is translated (English/Hindi/German) | Role names change with each language |
| Icon-only buttons with no label (and the team won't add one) | There is no name a user can read |
| Many identical controls in a list | Use a test id for the row + a role inside it |
| Text comes from a CMS and changes every week | Text locators would fail when nothing is broken |

**Downside:** a test id passes even if the visible label is wrong, like "Lgoin". So add text checks where the wording matters.

**Watch out:** don't write \`page.locator('[data-test="username"]')\` everywhere. Set \`testIdAttribute\` once and use \`getByTestId('username')\`.

**Why testers care:** test ids keep working when the text is translated or reworded.`,
      code: [
        {
          language: 'typescript',
          title: 'playwright.config.ts + a SauceDemo test using data-test',
          code: `// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test', // getByTestId now reads data-test="..."
  },
});

// tests/cart.spec.ts
import { test, expect } from '@playwright/test';

test('add two items via test ids', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await page.getByTestId('add-to-cart-sauce-labs-bike-light').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
  // Also check what the user reads, which test ids cannot prove:
  await expect(page.getByTestId('remove-sauce-labs-backpack')).toHaveText('Remove');
});`,
        },
      ],
      keyPoints: [
        `The default attribute is \`data-testid\`. Set \`use.testIdAttribute\` for anything else (SauceDemo: \`data-test\`).`,
        `Test ids survive wording and translation changes, but they don't check the visible text.`,
        `Set the attribute once instead of repeating CSS attribute selectors.`,
      ],
      source: 'Playwright docs — Locate by test id & Set a custom test id attribute; Playwright docs — codegen --test-id-attribute',
    },
    {
      heading: 'Filtering and chaining',
      body: `**Example:** \`cards.filter({ hasText: 'Sauce Labs Bolt T-Shirt' }).getByRole('button', { name: 'Add to cart' })\`

- \`cards\` is all six product cards.
- \`filter\` keeps only the card that mentions the Bolt T-Shirt.
- \`.getByRole(...)\` then finds the Add to cart button inside that card only.

It is like narrowing a search in a spreadsheet. First "rows in the product list". Then "the row that mentions Backpack". Then "the Add to cart button in that row".

**Chaining** means calling a locator method on another locator: \`outer.getByRole(...)\`. It searches *inside* each match of the outer locator.

**\`filter()\` options:**

| Option | Keeps elements that… |
|---|---|
| \`hasText: 'Backpack'\` or a regex | contain that text somewhere inside (part of the text, any case) |
| \`hasNotText: 'Sold out'\` | do not contain that text |
| \`has: page.getByRole('heading', { name: 'Product 2' })\` | contain an element that matches that locator (searched inside the outer element) |
| \`hasNot: page.getByRole('button', { name: 'Remove' })\` | do not contain such an element |
| \`visible: true\` | are visible (useful when the page has hidden copies, like desktop + mobile menus) |

**Combining locators:**

- \`a.and(b)\`: elements that match both. Example: \`page.getByRole('button').and(page.getByTitle('Subscribe'))\`.
- \`a.or(b)\`: elements that match either one. Example: "either the new-email banner or the security dialog appears". If both show up, there are two matches, so add \`.first()\` before an assertion.

**Pattern for lists and tables:** find the row by something unique the user sees. Then find the control inside it. This is much safer than "the 4th button".

**Watch out:** don't write \`filter({ has: page.locator('body .inventory_item_name') })\`. The inner locator is searched inside the outer element. So don't start it from the top of the page. A simple role or test-id locator is enough.

**Why testers care:** you click the right product even after the list is sorted or a new item is added.`,
      code: [
        {
          language: 'typescript',
          title: 'SauceDemo inventory: pick the right product card',
          code: `import { test, expect } from '@playwright/test';
// config: testIdAttribute: 'data-test', baseURL: 'https://www.saucedemo.com'

test('add a specific product and check it in the cart', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();

  const cards = page.getByTestId('inventory-item');      // 6 product cards

  // filter by text, then chain to the button inside that card only
  await cards.filter({ hasText: 'Sauce Labs Bolt T-Shirt' })
    .getByRole('button', { name: 'Add to cart' })
    .click();

  // filter by a descendant locator (has) and by absence (hasNot)
  const inCart = cards.filter({ has: page.getByRole('button', { name: 'Remove' }) });
  const notInCart = cards.filter({ hasNot: page.getByRole('button', { name: 'Remove' }) });
  await expect(inCart).toHaveCount(1);
  await expect(notInCart).toHaveCount(5);

  // read all product names in display order (multi-element: no strictness issue)
  const names = await cards.getByTestId('inventory-item-name').allTextContents();
  expect(names).toContain('Sauce Labs Bolt T-Shirt');
});`,
        },
      ],
      keyPoints: [
        `Chaining searches inside each match of the outer locator.`,
        `\`filter\` with hasText / hasNotText / has / hasNot / visible narrows a list without using positions.`,
        `\`and()\` keeps elements that match both; \`or()\` keeps either. An \`or()\` may need \`.first()\` to avoid a strictness error.`,
      ],
      source: 'Playwright docs — Filtering locators, Chaining, Matching two locators (and/or); Locator API — filter()',
    },
    {
      heading: 'Strictness',
      body: `**Example:** \`await page.getByRole('button', { name: 'Add to cart' }).click()\` on the SauceDemo products page.

- There are six "Add to cart" buttons.
- Playwright does not guess which one you mean.
- It stops with this error:

\`Error: strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements\`

A careful colleague asks "which one?" instead of guessing. Playwright does the same. This is called **strictness**.

**Rule:** any action or check on **one** element throws an error if the locator matches more than one.

| Throws if many match (one-element operations) | Fine with many matches (many-element operations) |
|---|---|
| \`click\`, \`fill\`, \`check\`, \`hover\`, \`press\`, \`selectOption\`, \`textContent\`, \`getAttribute\`, \`inputValue\` | \`count()\`, \`all()\`, \`allTextContents()\`, \`allInnerTexts()\`, \`evaluateAll()\` |
| \`expect(l).toBeVisible()\`, \`toHaveText('x')\`, \`toBeChecked()\`, \`toHaveValue()\` | \`expect(l).toHaveCount(n)\`, \`toHaveText(['a','b'])\` (array form) |

The error lists every match, with a suggested locator for each. Often that is all you need to fix it.

**Why strictness helps:** without it, a test might click the first of six buttons today. After the list is reordered, it would quietly click a *different* one. It would pass while testing the wrong thing.

**Fixes, best first:**

1. Make the locator more specific with what the user sees: a fuller \`name\`, \`exact: true\`, or a state like \`checked\`.
2. **Scope** it: start from a unique container (a dialog, a row, a product card), or use \`filter({ hasText })\`.
3. Use a **test id** for the row or the control.
4. Only when order is the real requirement, use \`first()\`, \`last()\` or \`nth(i)\`. Counting starts at 0. Example: "the first search result is the sponsored one".

**Why \`nth()\` is a last resort:** it ties the test to order and layout. A new sort order, a new banner or an A/B test can quietly point it at another element. The docs warn about this too.

**Watch out:** don't "fix" every strict mode error with \`.first()\`. That hides the problem instead of solving it.

**Why testers care:** strictness stops a test from passing while it clicks the wrong element.`,
      code: [
        {
          language: 'typescript',
          title: 'From strict mode violation to a precise locator',
          code: `import { test, expect } from '@playwright/test';
// config: testIdAttribute: 'data-test', baseURL: 'https://www.saucedemo.com'

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('secret_sauce');
  await page.getByTestId('login-button').click();
});

test('strictness in practice', async ({ page }) => {
  const addButtons = page.getByRole('button', { name: 'Add to cart' });

  // Multi-element operations are allowed:
  await expect(addButtons).toHaveCount(6);
  console.log(await addButtons.count()); // → 6

  // await addButtons.click();
  // ✗ strict mode violation: ... resolved to 6 elements

  // ✓ scope by what the user sees
  await page.getByTestId('inventory-item')
    .filter({ hasText: 'Sauce Labs Fleece Jacket' })
    .getByRole('button', { name: 'Add to cart' })
    .click();

  // ✓ order IS the requirement after sorting by price, so first() is justified
  await page.getByRole('combobox', { name: 'Sort products' }).selectOption('lohi');
  await expect(page.getByTestId('inventory-item-price').first()).toHaveText('$7.99');
});`,
        },
      ],
      keyPoints: [
        `Actions and checks on one element throw an error if the locator matches more than one.`,
        `count(), all(), allTextContents(), toHaveCount() and the array form of toHaveText() work on many.`,
        `Fix it by being more specific or by scoping. Use first/last/nth only when order is the requirement.`,
      ],
      source: 'Playwright docs — Strictness; Locator API — first(), last(), nth(); Checkly — handling multiple matches',
    },
    {
      heading: 'CSS and XPath: when you still need them',
      body: `**Example:** \`page.locator('//div[2]/form/div[3]/input')\`

- This XPath says "the input in the third div of the form in the second div".
- If a developer adds one wrapper div, it breaks.
- \`page.getByRole('button', { name: 'Login' })\` would keep working.

CSS and XPath describe a house as "the third building after the second left turn". That works until the street changes. Use them only when there is no name, label or test id to use.

**How:** \`page.locator(selector)\`. Playwright detects the type itself. Strings that start with \`//\` or \`..\` are XPath. All others are CSS. You can also write \`css=\` or \`xpath=\` in front.

**Brittle vs strong:**

| Brittle | Why it breaks | Better |
|---|---|---|
| \`//div[2]/form/div[3]/input\` | Any layout change shifts the numbers | \`getByRole('button', { name: 'Login' })\` |
| \`.btn.btn_primary.btn_small.btn_inventory\` | Style classes change in redesigns | \`getByRole('button', { name: 'Add to cart' })\` inside the card |
| \`.css-1x2y3z\` (generated class name) | Changes on every build | \`getByLabel\` / \`getByTestId\` |
| \`//button[text()='Login ']\` | Exact text with spaces; no clean-up | \`getByRole('button', { name: 'Login' })\` |
| \`#root > div > div:nth-child(4)\` | Depends on the HTML structure | Scope from a named area or role |

**When CSS or XPath is OK:**

- A stable, meaningful id that developers own. \`page.locator('#user-name')\` on SauceDemo is fine. But \`getByTestId('username')\` or the placeholder is clearer.
- Short CSS inside a scope, for something with no meaning: \`card.locator('img')\`.
- Attribute selectors for data in the HTML: \`page.locator('[data-sort="price"]')\`.
- XPath to go up to a parent in an old page (\`locator('xpath=..')\`). But \`filter({ has })\` is better.

**Old forms you may see in old code:** \`text=Login\` (the old text engine) and \`>>\` chaining. Also layout pseudo-classes like \`:right-of()\` and \`:near()\`, which are deprecated and may be removed. And \`:nth-match()\`. Use \`getByText\`, chained locators and \`filter()\` instead.

**Important limit:** XPath does **not** search inside shadow DOM. CSS and \`getBy*\` locators do.

**Speed myth:** some tests show CSS is a little faster than \`getByRole\`. The difference is milliseconds. Fixing broken locators and false passes costs hours. Choose the locator that survives change.

**Why testers care:** fewer tests break after every redesign.`,
      code: [
        {
          language: 'typescript',
          title: 'CSS/XPath that are acceptable, and how to keep them small',
          code: `import { test, expect } from '@playwright/test';

test('scoped CSS where no semantic hook exists', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables');

  // Find the row by what the user sees, then use short CSS inside it.
  const row = page.getByRole('row').filter({ hasText: 'jsmith@gmail.com' });
  await expect(row.locator('td').nth(0)).toHaveText('Smith');   // Last Name column

  // A stable id owned by the developers is acceptable
  await expect(page.locator('#table2')).toBeVisible();

  // XPath is auto-detected by the leading //, but keep it short and anchored
  const header = page.locator('//table[@id="table1"]//th[span[text()="Due"]]');
  await expect(header).toHaveCount(1);
});

test('SauceDemo id vs test id vs placeholder: three valid choices', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('#user-name').fill('standard_user');       // CSS id
  await page.getByPlaceholder('Password').fill('secret_sauce');  // user-facing
  await page.locator('[data-test="login-button"]').click();     // attribute CSS
  await expect(page).toHaveURL(/inventory/);
});`,
        },
      ],
      keyPoints: [
        `\`page.locator()\` detects CSS or XPath by itself (\`//\` or \`..\` → XPath).`,
        `Avoid structural paths, nth-child, style classes and generated class names.`,
        `XPath does not search inside shadow DOM. Layout pseudo-classes, \`text=\` and \`>>\` are old forms.`,
      ],
      source: 'Playwright docs — Other locators (CSS, XPath, legacy text, layout pseudo-classes); Playwright docs — Best practices',
    },
    {
      heading: 'Frames and shadow DOM',
      body: `**Example:** \`page.frameLocator('#mce_0_ifr').locator('#tinymce')\`

- \`#mce_0_ifr\` is an **iframe**: a separate web page shown inside this page.
- \`frameLocator\` tells Playwright to search inside it.
- Then \`.locator('#tinymce')\` finds the editor body in that iframe.

An iframe is like a TV showing another channel inside the page. You must "tune in" before you can find anything in it.

**Shadow DOM** is a component's private, hidden inner HTML. Playwright can usually see inside it with no extra step.

**iframes:**

- Locators on \`page\` search only the main page. To reach inside an iframe, scope to it first. There are two ways.
- Way 1: \`page.frameLocator('#mce_0_ifr').getByRole(...)\`.
- Way 2: \`page.locator('#mce_0_ifr').contentFrame().getByRole(...)\`. This turns a locator for the \`<iframe>\` into a FrameLocator.
- An iframe inside an iframe? Chain again: \`.frameLocator('...').frameLocator('...')\`.
- Frame locators work like normal locators. They search late and wait by themselves. So you don't need a "switch to frame" step like in Selenium.
- \`page.frame({ name })\` and \`page.frame({ url })\` return a \`Frame\` object. That is the older style. Prefer frame locators.

**Shadow DOM:**

- All Playwright locators (role, text, label, test id, CSS) **search inside open shadow roots by default**.
- Exceptions: **XPath does not**, and **closed** shadow roots are not supported.
- So in apps built from web components (Salesforce Lightning, many design systems), \`getByRole('button', { name: 'Save' })\` usually just works. An XPath copied from DevTools fails.

**Watch out:** \`page.getByText('Your content goes here.')\` times out when the text is inside an editor iframe. The text is in another document. Scope to the frame first.

**Why testers care:** rich text editors, payment forms and chat widgets often live in iframes.`,
      code: [
        {
          language: 'typescript',
          title: 'iframe on the-internet, and an open shadow root built with setContent',
          code: `import { test, expect } from '@playwright/test';

test('reach inside the TinyMCE iframe', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/iframe');
  const editor = page.frameLocator('#mce_0_ifr');           // scope to the iframe
  await expect(editor.locator('#tinymce')).toContainText('Your content goes here.');

  // Same thing via contentFrame() on a locator for the <iframe> element
  const sameEditor = page.locator('#mce_0_ifr').contentFrame();
  await expect(sameEditor.locator('body')).toBeVisible();
});

test('locators pierce open shadow DOM, XPath does not', async ({ page }) => {
  await page.setContent(\`
    <user-card></user-card>
    <script>
      const host = document.querySelector('user-card');
      const root = host.attachShadow({ mode: 'open' });
      root.innerHTML = '<h2>Swag Labs</h2><button>Follow</button>';
    </script>\`);

  await expect(page.getByRole('heading', { name: 'Swag Labs' })).toBeVisible();
  await page.getByRole('button', { name: 'Follow' }).click();     // pierces
  await expect(page.locator('user-card button')).toHaveCount(1);  // CSS pierces
  await expect(page.locator('//button')).toHaveCount(0);          // XPath does not
});`,
        },
      ],
      keyPoints: [
        `iframes need scoping: \`page.frameLocator(selector)\` or \`locator.contentFrame()\`.`,
        `Frame locators search late and wait by themselves. There is no "switch to frame" step.`,
        `Every locator type except XPath searches inside open shadow DOM. Closed shadow roots are not supported.`,
      ],
      source: 'Playwright docs — Frames; Playwright docs — Locators (Shadow DOM, frameLocator); Locator API — contentFrame()',
    },
    {
      heading: 'Tools that pick locators for you',
      body: `**Example:** \`npx playwright codegen --test-id-attribute=data-test https://www.saucedemo.com\`

- Click **Pick locator** in the toolbar.
- Hover over the Login button and click it.
- Playwright shows \`getByTestId('login-button')\`, ready to copy.

Don't guess locators. Point at the element and let Playwright suggest one. Then check it.

| Tool | How to open | What you do |
|---|---|---|
| **Codegen** | \`npx playwright codegen <url>\` (add \`--test-id-attribute=data-test\` for SauceDemo) | Click **Pick locator**, hover, click; copy the locator |
| **UI mode** | \`npx playwright test --ui\` | Pick a locator on the page snapshot of any step; edit it and see the matches highlighted |
| **Inspector** | \`npx playwright test --debug\` or \`await page.pause()\` | Type a locator and see matches highlighted on the paused page |
| **VS Code extension** | Testing sidebar → **Pick locator** | Hover in the browser; the locator appears in the editor box |
| **Browser DevTools** | Elements → Accessibility pane | See the role and accessible name the browser uses |

**How the tools choose:** role and name first, then text, then test id. They **improve the locator until it matches only one element**. They do this by starting from a uniquely named parent, adding \`exact\`, or filtering.

If nothing meaningful exists, they fall back to CSS. That is worth reporting to developers.

**Checklist for a suggested locator:**

1. Does it describe what a user sees (role and name, or label)?
2. Does it match exactly one element now, **and** after likely changes? Think of a new product, a new sort order or translated text.
3. Is the scope as small as possible (inside a card, row or dialog)?
4. If it is a CSS path, can you ask developers for a label or test id instead?

**Bonus:** \`locator.describe('Checkout button')\` adds a human name. It shows up in traces and reports. This helps when a long chained locator fails.

**In an interview, say:** "I use the picker to start. But I always check the locator before I commit it. Does it match what the user sees? Will it stay unique when the page changes?"

**Why testers care:** you get a good locator in seconds, without reading the HTML by hand.`,
      code: [
        {
          language: 'bash',
          title: 'Opening the locator pickers',
          code: `# Record and pick locators on SauceDemo with data-test test ids
npx playwright codegen --test-id-attribute=data-test https://www.saucedemo.com

# Pick locators on DOM snapshots of an existing test
npx playwright test tests/cart.spec.ts --ui

# Pause at a line and try locators live in the Inspector
npx playwright test tests/cart.spec.ts:12 --debug

# Inside a test, pause where you want to experiment:
#   await page.pause();`,
        },
      ],
      keyPoints: [
        `Codegen, UI mode, the Inspector and VS Code all have Pick locator.`,
        `The tools prefer role, text and test id, and improve the locator until it matches one element.`,
        `Always check a suggested locator: user-facing, still unique after changes, small scope.`,
      ],
      source: "Playwright docs — Test generator (Generate locators); Playwright docs — UI Mode (Pick locator); Debbie O'Brien — How to locate elements in Playwright",
    },
  ],
  codeChallenges: [
    {
      id: 'pw-locators-cc-1',
      title: 'Replace brittle XPath/CSS with user-facing locators',
      context:
        `This SauceDemo checkout test came from an old Selenium IDE recording. It breaks every time the front-end team changes the styles. Once it even "passed" while clicking the wrong product, after the sort order changed.`,
      task:
        `Rewrite every locator. The test must survive style and layout changes. It must pick the right product by what the user sees. And it must still fail if visible labels break. Assume \`testIdAttribute: 'data-test'\` and \`baseURL\` are set in the config.`,
      starter: {
        language: 'typescript',
        title: 'tests/checkout.spec.ts (before)',
        code: `import { test, expect } from '@playwright/test';

test('checkout one item', async ({ page }) => {
  await page.goto('/');
  await page.locator('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div[1]/input').fill('standard_user');
  await page.locator('//*[@id="root"]/div/div[2]/div[1]/div/div/form/div[2]/input').fill('secret_sauce');
  await page.locator('.submit-button.btn_action').click();

  // "Sauce Labs Backpack" is the first card... today
  await page.locator('.inventory_list > div:nth-child(1) button').click();
  await page.locator('.shopping_cart_link').click();
  await page.locator('button.btn.btn_action.btn_medium.checkout_button').click();

  await page.locator('input:nth-of-type(1)').fill('Asha');
  await page.locator('//input[@placeholder="Last Name"]').fill('Rao');
  await page.locator('form input:nth-child(3)').fill('560001');
  await page.locator('.cart_footer input').click();
  await page.locator('//button[text()="Finish"]').click();
  expect(await page.locator('h2').textContent()).toBe('Thank you for your order!');
});`,
      },
      hints: [
        `The login fields have placeholders and data-test ids. The Login control is a submit input, and its accessible name is "Login".`,
        `For the product, find the inventory card that contains the product name, then the "Add to cart" button inside it. The cart icon has its own test id.`,
        `The checkout fields have placeholders "First Name", "Last Name" and "Zip/Postal Code". Continue, Finish and the "thank you" heading all have accessible names. End with a web-first assertion.`,
      ],
      solution: {
        language: 'typescript',
        title: 'tests/checkout.spec.ts (after)',
        code: `import { test, expect } from '@playwright/test';
// config: baseURL 'https://www.saucedemo.com', testIdAttribute 'data-test'

test('checkout one item', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // Target the product by its visible name, not its position
  await page.getByTestId('inventory-item')
    .filter({ hasText: 'Sauce Labs Backpack' })
    .getByRole('button', { name: 'Add to cart' })
    .click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();

  await page.getByPlaceholder('First Name').fill('Asha');
  await page.getByPlaceholder('Last Name').fill('Rao');
  await page.getByPlaceholder('Zip/Postal Code').fill('560001');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you for your order!' }))
    .toBeVisible();
});`,
      },
      explanation: `**What changed, and why:**

- **Long XPath → placeholders:** \`//*[@id="root"]/div/div[2]/...\` described the whole page layout. One extra wrapper div from a redesign broke it. A placeholder is what the user sees in the field.
- **Style classes → roles:** \`.submit-button.btn_action\` and the long \`checkout_button\` class chain describe looks, not behaviour. \`getByRole('button', { name: 'Login' })\` also checks that the control really is a button with the right label.
- **\`nth-child(1)\` → filter by product name:** the old test quietly clicked a different product after a sort change. That was a false pass. Filtering the card by "Sauce Labs Backpack" makes the goal clear, and the test fails loudly if the product disappears.
- **Cart link:** SauceDemo has \`data-test="shopping-cart-link"\`. Its accessible name changes with the item count ("Cart, 1 items"), so the test id is the steadier choice here. This is a good example of choosing a test id on purpose.
- **\`input:nth-of-type(1)\`, \`form input:nth-child(3)\` → placeholders** for the checkout form.
- **\`//button[text()="Finish"]\` → role + name:** no traps with spaces or exact text.
- **Final check:** \`expect(await ...textContent()).toBe(...)\` checked once, with no retry. The web-first \`toBeVisible()\` on a named heading waits for the confirmation page.`,
      followUps: [
        {
          q: 'Why not use test ids for every element in this test?',
          a: `Test ids would be stable, but they would not catch bugs a user can see. If the button label became "Chekout", or a field lost its placeholder, a test-ids-only test would still pass. Role and placeholder locators keep the test close to the user and also give a light accessibility check. Keep test ids for elements whose visible name changes or is missing, like the cart link here.`,
        },
        {
          q: 'The product names are translated in the German build. What would you change?',
          a: `Pick the product with something that does not depend on language, like \`getByTestId('add-to-cart-sauce-labs-backpack')\`. Or keep the card filter, but read the product name from the same translation file the app uses. Button names also change with the language. So either run the test per language with translated strings, or use test ids for the controls.`,
        },
      ],
    },
    {
      id: 'pw-locators-cc-2',
      title: 'Strict mode "fixed" with nth(): make it precise instead',
      context:
        `A test kept failing with "strict mode violation". So a teammate added \`.first()\` and \`.nth()\` everywhere. Now it passes, but nobody can tell which elements it really clicks. And it broke when the-internet added a new checkbox in a staging build.`,
      task:
        `Rewrite the locators so each one finds one specific element by meaning: label text, row content or state. Do not use position. Keep the assertions meaningful.`,
      starter: {
        language: 'typescript',
        title: 'tests/tables-and-boxes.spec.ts (before)',
        code: `import { test, expect } from '@playwright/test';

test('edit Frank\\'s row', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables');
  // Frank Bach is the 3rd row today
  await page.locator('#table1 tbody tr').nth(2).getByRole('link').first().click();
  await expect(page).toHaveURL(/#edit/);
});

test('tick the first checkbox', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/checkboxes');
  await page.getByRole('checkbox').first().check();
  expect(await page.getByRole('checkbox').nth(0).isChecked()).toBe(true);
});

test('login heading', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await expect(page.getByText('Login').first()).toBeVisible();
});`,
      },
      hints: [
        `In the table, which visible value is unique to Frank's row? Filter the rows by it, then pick the link by its name.`,
        `The two checkboxes have no labels. Which state option tells the unchecked one apart from the checked one? (Then report the missing labels.)`,
        `"Login" appears as a heading and as a button. Which role and option point only to the page heading?`,
      ],
      solution: {
        language: 'typescript',
        title: 'tests/tables-and-boxes.spec.ts (after)',
        code: `import { test, expect } from '@playwright/test';

test('edit Frank\\'s row', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/tables');
  const table = page.locator('#table1');             // stable id: acceptable scope
  const franksRow = table.getByRole('row').filter({ hasText: 'fbach@yahoo.com' });
  await expect(franksRow).toHaveCount(1);            // guard: exactly one Frank
  await franksRow.getByRole('link', { name: 'edit' }).click();
  await expect(page).toHaveURL(/#edit/);
});

test('tick the unchecked checkbox', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/checkboxes');
  // No labels on this page (an accessibility bug worth reporting), so use state:
  const unchecked = page.getByRole('checkbox', { checked: false });
  await expect(unchecked).toHaveCount(1);
  await unchecked.check();
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(2);
});

test('login heading', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await expect(page.getByRole('heading', { name: 'Login Page', level: 2 })).toBeVisible();
});`,
      },
      explanation: `**The fixes:**

- **Row by content, not by position:** \`nth(2)\` meant "whatever is third". Sorting the table (this page allows it) or adding a row quietly changes the target. Filtering the rows by Frank's unique email says what you mean. The \`toHaveCount(1)\` guard fails loudly if the data changes.
- **Link by name:** \`getByRole('link').first()\` picked "edit" only because it came before "delete". Naming the link removes the order problem, and you never click delete by accident.
- **Checkbox by state:** with no labels, the honest way to tell them apart is the state (\`checked: false\`). The assertion now checks the result (two checked boxes) with a web-first \`toHaveCount\`. Before, it used \`isChecked()\` with a plain \`expect\` that does not retry.
- **Heading by role and level:** \`getByText('Login').first()\` could match the button, the heading or a menu link, depending on the HTML order. \`getByRole('heading', { name: 'Login Page', level: 2 })\` is clear.
- **Lesson:** a strict mode violation is useful information. Solve the ambiguity; don't hide it.`,
      followUps: [
        {
          q: 'When is `.first()` genuinely correct?',
          a: `When the position is what you are testing. For example: "after sorting by price low to high, the first item costs $7.99". Or "the newest message appears at the top", or "the first search result is the sponsored one". There, the order is the behaviour, so \`first()\` or \`nth()\` shows your intent. Using it only to silence a strict mode error is the bad pattern.`,
        },
        {
          q: 'How would you ask developers to make the checkboxes easier to test?',
          a: `Report it as an accessibility issue. Each checkbox needs an accessible name, for example \`<label><input type="checkbox"> Subscribe to newsletter</label>\` or an \`aria-label\`. Then tests can use \`getByRole('checkbox', { name: 'Subscribe to newsletter' })\` or \`getByLabel\`. It helps screen-reader users and makes the tests stronger at the same time, so it is an easy argument to win.`,
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-locators-iq-01',
      difficulty: 'medium',
      question: `What is a locator in Playwright? How is it different from what \`page.$()\` or Selenium's findElement returns?`,
      context: '"What is a locator / how does locator resolution work" appears in most 2025–2026 Playwright question banks (e.g. TestDino, Testleaf).',
      whatInterviewerLooksFor: [
        `Locator = a description that searches the page again on every use.`,
        `The contrast with element handles and WebElements, which can go stale.`,
        `Auto-waiting and strictness as results of this design.`,
        `A real example of the page being redrawn.`,
      ],
      modelAnswer: `**A locator is a reusable description of how to find an element**, not the element itself. \`page.getByRole('button', { name: 'Login' })\` returns at once, without touching the browser. When I call an action or a web-first assertion on it, Playwright:

1. searches the page as it is **right now**;
2. checks that exactly one element matches (strictness);
3. waits until the element is ready: visible, not moving, enabled, not covered;
4. acts. If anything is not ready, it repeats all of this until the timeout.

**\`page.$()\` / ElementHandle (and Selenium's \`WebElement\`)** hold a pointer to one element, found at one moment. If a React app redraws that part of the page, the pointer points at an element that is gone. In Selenium that is the classic \`StaleElementReferenceException\`. In Playwright's handle API it means errors and flaky tests. Handles also skip strictness and wait less, so the docs discourage them.

**Example:** on TodoMVC I write \`const titles = page.getByTestId('todo-title')\`. I add two items and check \`toHaveText([...])\`. The list is redrawn after each add, but the same locator keeps working, because every use searches again.

**What this means in practice:**
- I define locators once (at the top of a test, or in a page object) and reuse them safely.
- I never write \`await page.getByRole(...)\` on its own. I await the action or the assertion.
- To count or read lists, I use many-element methods like \`count()\`, \`allTextContents()\` or \`toHaveCount()\`.`,
      followUps: [
        {
          q: 'If locators are lazy, when do you actually get an error for a wrong locator?',
          a: `Only when you use it. If an action or assertion uses a locator that matches nothing, Playwright waits and retries until the timeout. Then it fails with a log of what it was waiting for. If the locator matches several elements, it fails at once with a strict mode violation that lists the matches. A wrong locator that you never use gives no error at all.`,
        },
        {
          q: 'Is there any case where you would still use an ElementHandle?',
          a: `Rarely. A few low-level cases use handles, like passing an element into \`page.evaluate\`, or old code. But locators now cover almost everything: \`evaluate\`, \`evaluateAll\`, \`boundingBox\`, screenshots, and frames with \`contentFrame()\`. In new code I use locators. In code review I treat \`page.$\` and \`$$\` as a warning sign.`,
        },
      ],
      pitfalls: [
        `Saying a locator "stores the element" or "finds the element when it is created".`,
        `Awaiting the locator itself and thinking that is what waits.`,
        `Not knowing why stale element errors disappear with locators.`,
      ],
    },
    {
      id: 'pw-locators-iq-02',
      difficulty: 'easy',
      question: `Which locator do you prefer in Playwright, and why? Rank them.`,
      whatInterviewerLooksFor: [
        `The right order, with getByRole first.`,
        `Reasons: survives change, matches the user's view, checks accessibility.`,
        `A fair view of test ids.`,
        `Real examples on a real page.`,
      ],
      modelAnswer: `My order follows Playwright's advice:

1. **\`getByRole\`** with a name: \`getByRole('button', { name: 'Login' })\`. It matches how users and screen readers see the page. It survives style changes, and it fails when the visible label breaks.
2. **\`getByLabel\`** for form fields: \`getByLabel('Password')\` on the-internet's login form.
3. **\`getByPlaceholder\`** when there is no label, like SauceDemo's login fields.
4. **\`getByText\`** for text you don't click, like error messages: \`getByText('Epic sadface')\`.
5. **\`getByAltText\` / \`getByTitle\`** for images and icons with tooltips.
6. **\`getByTestId\`** when user-facing names are missing, unclear or keep changing (translations, CMS text, icon-only buttons). On SauceDemo I set \`testIdAttribute: 'data-test'\`.
7. **CSS / XPath** only as a last resort: short and scoped. Never long structural paths or generated class names.

**Why this order:**
- **It survives change:** the role and name of a button change much less often than its classes or position.
- **It fails for real bugs:** a role-based test fails if the button loses its label. A CSS test would pass.
- **Accessibility:** if I can't write a role or label locator, screen-reader users probably struggle too, so I report it.

**About test ids:** some teams use them everywhere because they are stable. That is a fair choice. But I add assertions on the visible text where the wording matters, because a test id never proves what the user reads.`,
      followUps: [
        {
          q: 'A button shows only an icon (a trash can) with no text. How do you locate it?',
          a: `First check its accessible name in DevTools. If it has \`aria-label="Delete item"\` or a \`title\`, then \`getByRole('button', { name: 'Delete item' })\` or \`getByTitle\` works. If it has no name at all, that is an accessibility bug: a screen reader just says "button". I would report it. Until it is fixed, I would use a test id, or short CSS scoped inside that row.`,
        },
        {
          q: 'Is getByText a good choice for buttons?',
          a: `It works, but \`getByRole('button', { name })\` is better. It makes sure the element really is a button, which keyboard and screen-reader users can reach. It also won't match the same words in a paragraph or heading. I keep getByText for text you don't click: messages, read-only labels and product descriptions.`,
        },
      ],
      pitfalls: [
        `Starting with XPath or CSS as the default choice.`,
        `Saying test ids are always best, without saying they don't check the visible text.`,
        `Not knowing that getByLabel and getByPlaceholder exist.`,
      ],
    },
    {
      id: 'pw-locators-iq-03',
      difficulty: 'medium',
      question: `Your test fails with "strict mode violation: resolved to 3 elements". What does it mean, and how do you fix it properly?`,
      context: 'Strict mode violations are among the most common Playwright interview scenarios reported in 2025–2026 question guides.',
      whatInterviewerLooksFor: [
        `Explains strictness and which operations use it.`,
        `Reads the error message (it lists the matches).`,
        `Fixes it by being more specific or scoping before using nth or first.`,
        `Knows when first() and nth() are the right tool.`,
      ],
      modelAnswer: `**What it means:** I called a one-element operation (click, fill, \`toHaveText\`, \`toBeVisible\`…) on a locator that now matches three elements. Playwright won't guess which one I meant. Many-element operations (\`count()\`, \`allTextContents()\`, \`toHaveCount()\`) would not throw.

**How I fix it:**

1. **Read the error.** It lists each match and suggests a locator for each. So I see what the three are, for example a header link, a footer link and a button, all named "Login".
2. **Be more specific with what the user sees:** the full name with \`exact: true\`, a different role (\`heading\` vs \`link\`), a state (\`checked: false\`), or \`level\` for headings.
3. **Scope to a unique container:** \`page.getByRole('dialog').getByRole('button', { name: 'Save' })\`. Or a product card filtered by its name: \`getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button', { name: 'Add to cart' })\`.
4. **Use a test id** on the element or its row, when the visible information really is the same.
5. **Only if order is the requirement** ("the cheapest item is first after sorting"), use \`first()\`, \`last()\` or \`nth()\`.

**Why not \`.first()\` by default?** It hides the problem. When products are reordered, or a new banner adds another match, the test clicks something else, and it may still pass. Strictness exists to stop exactly that kind of false pass.

**Also check:** sometimes the extra matches are hidden copies, like mobile and desktop menus. Then \`filter({ visible: true })\` is the honest fix.`,
      followUps: [
        {
          q: 'Why does `toHaveCount(3)` work on the same locator that failed the click?',
          a: `Because \`toHaveCount\` is a many-element assertion. Its whole job is to look at all the matches, so strictness does not apply. The same is true for \`count()\`, \`all()\`, \`allTextContents()\` and the array form of \`toHaveText([...])\`. Strictness applies only to operations that must act on, or read from, one specific element.`,
        },
        {
          q: 'Can you disable strict mode globally?',
          a: `Not for locators in @playwright/test. Strictness is there on purpose. You opt out for one locator with \`first()\`, \`last()\` or \`nth()\`. If a team wants to turn it off everywhere, their locators are usually too vague. It is better to fix that with scoping and names.`,
        },
      ],
      pitfalls: [
        `Adding \`.first()\` everywhere as the standard fix.`,
        `Thinking strictness applies to count() and toHaveCount().`,
        `Not reading the error, which already lists the matches.`,
      ],
    },
    {
      id: 'pw-locators-iq-04',
      difficulty: 'hard',
      question:
        `The app has no test ids. Its CSS classes are generated codes (like \`css-1q2w3e\`) that change with every build. Some buttons have no labels. How do you build a stable locator plan?`,
      whatInterviewerLooksFor: [
        `Starts with user-facing locators and the accessibility tree.`,
        `Uses scoping and filtering, not the HTML structure.`,
        `Works with developers (test ids, labels) instead of fighting the HTML.`,
        `Has a short-term plan and a way to keep locators easy to maintain.`,
      ],
      modelAnswer: `**1. Check what the accessibility tree already gives you.** Generated classes don't matter to \`getByRole\`. Most buttons, links, headings, form fields and dialogs have roles and names, even in apps with generated CSS. I run codegen or UI mode's Pick locator on the key pages, and check the Accessibility pane in DevTools.

**2. Use user-facing locators plus scoping.**
- \`getByRole('dialog', { name: 'Edit address' }).getByRole('button', { name: 'Save' })\`.
- Rows or cards by visible content: \`getByRole('row').filter({ hasText: 'INV-1042' })\`, then the control inside.
- Page areas: \`getByRole('navigation')\` and \`getByRole('main')\`, to tell header copies from body copies.

**3. Treat missing labels as bugs.** An icon button with no accessible name is invisible to screen-reader users. I file accessibility bugs ("Delete button in cart row has no accessible name"), with the WCAG rule. Fixing them makes good locators possible.

**4. Agree on test ids for the rest.** Propose a naming rule (\`data-testid\` or \`data-test\`, kebab-case, a stable meaning such as \`cart-row-delete\`). Add it to the definition of done for new UI. Set \`testIdAttribute\` once.

**5. Short-term fallback:** short CSS on stable attributes (\`[name="email"]\`, \`[type="submit"]\`, \`aria-*\`), always scoped inside a container found by role. Never generated classes, never \`nth-child\` paths.

**6. Keep it easy to maintain:** locators live in page objects, so a change is fixed in one place. I add \`locator.describe()\` to long chains so traces are easy to read. And I review locators in code review like real product code.`,
      followUps: [
        {
          q: 'A developer says adding test ids "pollutes production HTML". How do you respond?',
          a: `The attributes are tiny, do nothing on their own, and are widely used. They make tests much cheaper to maintain. If the team still objects, a build plugin can remove them from production builds and keep them in staging. At the same time, better accessible names mean fewer test ids are needed at all, and developers usually like that.`,
        },
        {
          q: 'How would you locate a specific row in a data grid built from divs instead of a table?',
          a: `Check whether the grid sets ARIA roles (\`role="grid"\`, \`"row"\`, \`"gridcell"\`). Good component libraries do, and then \`getByRole('row').filter({ hasText: 'INV-1042' })\` works. If not, find the repeated row container by a test id or stable attribute. Filter it by the unique visible value, then chain to the control inside. Also report the missing grid roles.`,
        },
      ],
      pitfalls: [
        `Copying full XPaths from DevTools as the main plan.`,
        `Relying on generated class names.`,
        `Not involving developers or accessibility in the solution.`,
      ],
    },
    {
      id: 'pw-locators-iq-05',
      difficulty: 'medium',
      question: `How do you work with elements inside iframes and inside shadow DOM in Playwright? How is that different from Selenium?`,
      whatInterviewerLooksFor: [
        `Uses frameLocator or contentFrame.`,
        `Knows frame locators wait by themselves and need no switching.`,
        `Knows the shadow DOM rules (XPath and closed roots).`,
        `Compares with Selenium's switchTo and shadow root methods.`,
      ],
      modelAnswer: `**iframes:** an iframe is a separate document, so page locators don't look inside it. I scope to it first:

- \`page.frameLocator('#mce_0_ifr').locator('#tinymce')\` for the TinyMCE editor on the-internet's /iframe page, or
- \`page.locator('#mce_0_ifr').contentFrame().locator('body')\`, which turns a locator for the iframe element into a frame locator. (The TinyMCE toolbar buttons are on the main page. Only the text area is inside the iframe.)

Frame locators **wait by themselves**, like any locator. If the iframe loads late, Playwright waits. An iframe inside an iframe is just more chaining. There is no "switch into the frame, then switch back" step.

In Selenium you call \`driver.switchTo().frame(...)\`. Every later command then targets that frame, and you must remember \`switchTo().defaultContent()\` afterwards. Forgetting it is a classic bug.

**Shadow DOM:** Playwright locators search inside **open** shadow roots automatically. So \`getByRole('button', { name: 'Follow' })\` finds a button inside a web component with no extra code. Two exceptions:
- **XPath does not** search inside shadow roots. A copied XPath often fails in web-component apps.
- **Closed** shadow roots are not supported.

In Selenium 4 you usually get the host element, call \`getShadowRoot()\`, and search inside it with CSS, one level at a time.

**Example habit:** when a locator times out on an element I can clearly see, I check in DevTools. Is it inside an \`<iframe>\` (needs frameLocator) or a \`#shadow-root (closed)\` (needs help from the app)?`,
      followUps: [
        {
          q: 'An iframe has no id or name. How do you target it?',
          a: `Any locator that finds the iframe element works. For example \`page.locator('iframe[title="Payment form"]').contentFrame()\`, \`page.frameLocator('iframe[src*="stripe"]')\`, or even \`page.getByTitle('Payment form').contentFrame()\`. Iframes should have a \`title\` for accessibility anyway, so if it is missing, report it.`,
        },
        {
          q: 'How would you check something in a third-party payment iframe you do not control?',
          a: `Find it with frameLocator and use it like a user would, with test card numbers in the provider's sandbox. But Playwright's best practices say: don't depend on other companies' pages in most tests. Fake the payment network call with \`page.route\` in most checkout tests. Keep only one or two end-to-end tests against the sandbox.`,
        },
      ],
      pitfalls: [
        `Saying Playwright needs a switchTo-style call for iframes.`,
        `Saying XPath works inside shadow DOM.`,
        `Not knowing that closed shadow roots are not supported.`,
      ],
    },
    {
      id: 'pw-locators-iq-06',
      difficulty: 'medium',
      question:
        `Every card on a product list has the same "Add to cart" button. How do you click the button for one specific product? Write the locator.`,
      whatInterviewerLooksFor: [
        `Container → filter by unique visible content → control inside.`,
        `Uses filter({ hasText }) or filter({ has }).`,
        `Avoids nth() and explains why.`,
        `Adds an assertion that proves the right item was added.`,
      ],
      modelAnswer: `The pattern is **container → filter by what makes it unique → control inside**.

On SauceDemo (with \`testIdAttribute: 'data-test'\`):

\`page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Bike Light' }).getByRole('button', { name: 'Add to cart' })\`

Step by step:
1. \`getByTestId('inventory-item')\` matches all six product cards.
2. \`filter({ hasText: 'Sauce Labs Bike Light' })\` keeps the one card with that name.
3. \`.getByRole('button', { name: 'Add to cart' })\` searches only inside that card, so it matches exactly one button.

If two products had similar names ("Backpack" and "Backpack Pro"), I would filter with \`has\` on the exact name: \`filter({ has: page.getByText('Sauce Labs Backpack', { exact: true }) })\`.

**Without test ids**, the same idea works with roles when the HTML is semantic: \`getByRole('listitem').filter({ hasText: 'Bike Light' }).getByRole('button', { name: 'Add to cart' })\`.

**Why not \`nth(1)\`?** It depends on today's order. Sorting, a new product or a personalised list changes the order. Then the test clicks the wrong item, and it may still pass.

**Prove it worked:**
- \`await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible()\` (the button changes);
- \`await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1')\`;
- and on the cart page, \`await expect(page.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Bike Light'])\`.`,
      followUps: [
        {
          q: 'What does filter({ has }) do differently from hasText?',
          a: `\`hasText\` keeps elements whose text contains the string anywhere inside. That can match too much, for example part of a word or a description. \`has\` keeps elements that contain a child matching another locator, searched inside each candidate. It lets you be precise, for example by requiring a heading with an exact name, or a certain badge inside the card.`,
        },
        {
          q: 'How would you add every product cheaper than $10 to the cart?',
          a: `After the list has loaded, read the prices with \`cards.getByTestId('inventory-item-price').allTextContents()\`. Or loop with \`for (const card of await cards.all())\`, read each price, and click Add to cart in the matching cards. Then check that the badge equals the number of matches. \`all()\` does not wait, so first check that the list has loaded, for example with \`toHaveCount(6)\`.`,
        },
      ],
      pitfalls: [
        `Using nth() based on the current position.`,
        `Calling getByRole('button', { name: 'Add to cart' }).click() on the whole page (strict mode violation).`,
        `Not checking that the right item ended up in the cart.`,
      ],
    },
    {
      id: 'pw-locators-iq-07',
      difficulty: 'hard',
      question:
        `A senior colleague wants XPath for everything: "it can find anything, and CSS is faster than getByRole anyway". How do you respond?`,
      whatInterviewerLooksFor: [
        `A polite argument based on evidence, not on rules.`,
        `Real limits of XPath: shadow DOM, breaking easily, text matching.`,
        `Puts the speed claim in proportion.`,
        `Offers a practical middle way.`,
      ],
      modelAnswer: `I would agree with what is true. Then I would move the talk to the cost of maintaining tests.

**What is true:** XPath is powerful. It can move to parents and siblings and use complex conditions. And small speed tests can show CSS is a little faster than \`getByRole\`, because role matching works out accessible names.

**Why I still would not use it by default:**

| Concern | XPath first | Role/label first |
|---|---|---|
| Layout change (a new wrapper div) | Position-based paths break | Not affected |
| Shadow DOM | XPath does **not** search inside | getBy* and CSS search open roots |
| Text matching | \`text()=\` is exact and sensitive to spaces | Spaces cleaned up; part, exact or regex |
| Catches UX bugs | No: passes if the label breaks | Fails if the name or role breaks |
| Easy to read in review | \`//div[3]/span[@class='x']/..\` | \`getByRole('button', { name: 'Pay' })\` |
| Accessibility signal | None | Missing names show up as bugs |

**Speed in proportion:** a few milliseconds per search, while a UI test spends seconds on page loads and network calls. One flaky or broken locator costs far more engineer time than all the search time of the whole suite.

**A practical middle way:**
- Default to role, label or test id. Allow CSS or XPath when there is no meaningful hook, but **scoped** (inside a container found by role) and **short**.
- Where XPath goes up to a parent, use \`filter({ has })\` instead.
- Agree on test ids with developers for awkward widgets.
- Try it for two weeks: count locator-related failures before and after on one module.

That keeps the talk about results (fewer broken tests), not about personal taste.`,
      followUps: [
        {
          q: 'Give an XPath use case and its Playwright-native replacement.',
          a: `A common XPath is "find the row with this email, then its delete link": \`//td[text()="fbach@yahoo.com"]/../td/a[text()="delete"]\`. The Playwright version is \`page.getByRole('row').filter({ hasText: 'fbach@yahoo.com' }).getByRole('link', { name: 'delete' })\`. It needs no parent step, ignores extra spaces, is easy to read, and still works if the table moves into a web component.`,
        },
        {
          q: 'Are there layout-based locators in Playwright, like "the input right of this label"?',
          a: `There were CSS pseudo-classes like \`:right-of()\`, \`:left-of()\`, \`:above()\`, \`:below()\` and \`:near()\`. The docs now mark them deprecated and say they may be removed. Layout depends on screen size and fonts, so these break easily. Link the input to its label (getByLabel), or scope by a shared container instead.`,
        },
      ],
      pitfalls: [
        `Turning it into a fight about rules, with no evidence.`,
        `Saying XPath can search inside shadow DOM in Playwright.`,
        `Caring more about milliseconds of search time than about maintenance cost.`,
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-locators-drill-1',
      question:
        'Pick the best Playwright locator for each of these 6 elements (config has `testIdAttribute: \'data-test\'`): (1) `<input id="user-name" placeholder="Username" data-test="username">` (2) `<label for="email">Email address</label><input id="email" class="css-9xk2">` (3) `<button class="btn_primary btn_small" data-test="add-to-cart-sauce-labs-onesie">Add to cart</button>` inside a card whose title text is "Sauce Labs Onesie" (4) `<h3 data-test="error" role="alert">Epic sadface: Username is required</h3>` (5) `<button aria-label="Close menu"><img src="x.svg"></button>` (6) `<img alt="Sauce Labs Backpack" class="inventory_item_img">`',
      assumptions: [
        'Priority: role → label → placeholder → text → alt/title → test id → CSS/XPath.',
        'Where a test id is the cleanest unique hook among many identical controls, using it is acceptable.',
        'Each locator must match exactly one element on its page.',
      ],
      steps: [
        { label: '1 username field', calc: 'No <label>; placeholder is user-facing → getByPlaceholder(\'Username\'). (getByTestId(\'username\') equally fine; #user-name is a last resort.)' },
        { label: '2 email field', calc: 'Has a real <label for> → getByLabel(\'Email address\'). The class is a generated hash: never use it.' },
        { label: '3 Add to cart in one card', calc: 'Six identical buttons → scope: getByTestId(\'inventory-item\').filter({ hasText: \'Sauce Labs Onesie\' }).getByRole(\'button\', { name: \'Add to cart\' }); or the product-specific test id getByTestId(\'add-to-cart-sauce-labs-onesie\').' },
        { label: '4 error banner', calc: 'role="alert" → getByRole(\'alert\'), then assert toContainText(\'Username is required\').' },
        { label: '5 icon-only close button', calc: 'Accessible name from aria-label → getByRole(\'button\', { name: \'Close menu\' }).' },
        { label: '6 product image', calc: 'Image with alt → getByAltText(\'Sauce Labs Backpack\') (or getByRole(\'img\', { name: \'Sauce Labs Backpack\' })).' },
      ],
      answer: `1 \`getByPlaceholder('Username')\` · 2 \`getByLabel('Email address')\` · 3 card \`filter({ hasText })\` → \`getByRole('button', { name: 'Add to cart' })\` (or the specific test id) · 4 \`getByRole('alert')\` · 5 \`getByRole('button', { name: 'Close menu' })\` · 6 \`getByAltText('Sauce Labs Backpack')\``,
      insight:
        `Read the HTML the way a screen reader does: role and accessible name first. Classes and ids only break a tie when there is no user-facing hook. Generated class names are never OK.`,
      followUps: [
        {
          q: 'For element 3, which of the two options would you put in a page object, and why?',
          a: `A method with a parameter that uses the card filter, for example \`addToCart(name)\`. It filters the inventory cards by the product name and clicks the named button. It reads like the user story, works for any product without building test-id strings, and still checks the visible button label. The product-specific test id is fine too, but it ties the page object to the app's id naming.`,
        },
      ],
    },
    {
      id: 'pw-locators-drill-2',
      question:
        'Given this DOM, predict for each line how many elements the locator matches and whether the line passes, throws a strict mode violation, or times out: `<nav><a href="/login">Login</a></nav> <main><h2>Login Page</h2><form><label for="u">Username</label><input id="u"><button type="submit">Login</button></form></main> <footer><a href="/help">Login help</a></footer>`. (a) `await page.getByRole(\'link\', { name: \'Login\' }).click()` (b) `await page.getByText(\'Login\').click()` (c) `await expect(page.getByRole(\'button\', { name: \'Login\' })).toBeVisible()` (d) `await expect(page.getByRole(\'link\', { name: \'Login\', exact: true })).toHaveCount(1)` (e) `await page.getByLabel(\'Username\').fill(\'tomsmith\')` (f) `await page.getByRole(\'heading\', { name: \'Login\', level: 1 }).click()`',
      assumptions: [
        `Role names match part of the text and ignore case, unless \`exact: true\`.`,
        `getByText matches elements whose own text contains the string (part of the text, any case).`,
        `One-element operations throw when more than one element matches; counts and toHaveCount do not.`,
      ],
      steps: [
        { label: '(a)', calc: 'Links named containing "Login": "Login" and "Login help" → 2 matches → click throws a strict mode violation.' },
        { label: '(b)', calc: 'Text containing "Login": nav link, h2 "Login Page", button, footer "Login help" → 4 matches → strict mode violation.' },
        { label: '(c)', calc: 'Buttons named "Login": only the submit button (links are role link) → 1 match → passes.' },
        { label: '(d)', calc: 'exact: true → only the nav link "Login" → count 1 → passes (toHaveCount is multi-element anyway).' },
        { label: '(e)', calc: '<label for="u"> associates with the input → 1 match → fill succeeds.' },
        { label: '(f)', calc: 'The heading is h2, not level 1 → 0 matches → waits and times out.' },
      ],
      answer: `(a) 2 → **strict violation** · (b) 4 → **strict violation** · (c) 1 → **pass** · (d) 1 → **pass** · (e) 1 → **pass** · (f) 0 → **timeout**`,
      insight:
        `Matching part of the name is the usual cause of surprise strict mode violations. Fix it with \`exact: true\`, a more specific role, or scoping to a page area (\`getByRole('navigation')\`). Zero matches never throw at once; they wait until the timeout.`,
      followUps: [
        {
          q: 'Rewrite (a) two different ways so it clicks only the header link.',
          a: `Make the name exact: \`page.getByRole('link', { name: 'Login', exact: true })\`. Or scope it to the page area: \`page.getByRole('navigation').getByRole('link', { name: 'Login' })\`. The scoped version also shows what you mean (the header link). It stays correct even if someone later adds another exact "Login" link to the footer.`,
        },
      ],
    },
    {
      id: 'pw-locators-drill-3',
      question:
        'Compute the accessible name (what `getByRole(..., { name })` matches) for each element, then write the locator: (1) `<button aria-label="Remove Sauce Labs Backpack">Remove</button>` (2) `<input type="submit" value="Login">` (3) `<span id="lbl">Search products</span><input type="text" aria-labelledby="lbl" placeholder="Type here">` (4) `<a href="/cart"><img src="cart.svg" alt="Cart"></a>` (5) `<button title="Settings"><svg></svg></button>` (6) `<label><input type="checkbox"> Remember me</label>`',
      assumptions: [
        'Simplified accname order: aria-labelledby → aria-label → native labelling (label element, alt, value) → subtree text → title.',
        'Images inside links contribute their alt text to the link\'s name.',
        'Implicit roles follow standard HTML-ARIA mappings.',
      ],
      steps: [
        { label: '1', calc: 'aria-label wins over text → name "Remove Sauce Labs Backpack" → getByRole(\'button\', { name: \'Remove Sauce Labs Backpack\' }).' },
        { label: '2', calc: 'Submit input: role button, name from value → "Login" → getByRole(\'button\', { name: \'Login\' }).' },
        { label: '3', calc: 'aria-labelledby points to the span → "Search products" (placeholder is not the name here) → getByRole(\'textbox\', { name: \'Search products\' }) or getByLabel(\'Search products\').' },
        { label: '4', calc: 'Link name from the img alt → "Cart" → getByRole(\'link\', { name: \'Cart\' }).' },
        { label: '5', calc: 'No text, no aria → falls back to title → "Settings" → getByRole(\'button\', { name: \'Settings\' }) or getByTitle(\'Settings\').' },
        { label: '6', calc: 'Wrapping label → "Remember me" → getByRole(\'checkbox\', { name: \'Remember me\' }) or getByLabel(\'Remember me\').' },
      ],
      answer: `1 "Remove Sauce Labs Backpack" · 2 "Login" · 3 "Search products" · 4 "Cart" · 5 "Settings" · 6 "Remember me", each located with \`getByRole(role, { name })\` (or getByLabel/getByTitle equivalents).`,
      insight:
        `The visible text is not always the name: aria-label and aria-labelledby replace it. When a role locator fails and you don't know why, look at the computed name in the DevTools Accessibility pane, or use Pick locator. Don't guess.`,
      followUps: [
        {
          q: 'In element 1, would `getByRole(\'button\', { name: \'Remove\' })` match? Is that a problem?',
          a: `Yes. "Remove" is part of "Remove Sauce Labs Backpack" (and case is ignored), so it matches. But it also matches every other product's Remove button. With several items in the cart, that is a strict mode violation. Use the full name, \`exact: true\`, or scope to the cart row. Note that the visible text "Remove" is not the name here, because aria-label wins.`,
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-locators-mcq-01',
      difficulty: 'easy',
      question: `Which locator does Playwright recommend as the first choice for things you click, like buttons and links?`,
      options: ['page.getByRole()', 'page.locator() with XPath', 'page.getByTestId()', 'page.locator() with CSS classes'],
      correct: [0],
      explanation:
        `\`getByRole\` matches how users and screen readers see the page: the role plus the accessible name. So it survives style changes, and it fails when labels break. Test ids are a good backup when user-facing names are missing or keep changing. CSS classes and XPath depend on how the page is built, so they are the last resort.`,
      followUps: [
        {
          q: 'When would you choose getByTestId over getByRole?',
          a: `When the user-facing name is missing, keeps changing or is not unique. For example: translated pages, text from a CMS, icon-only buttons with no name, or many identical controls where a stable id on the row is clearer. Add text assertions where the wording matters, because a test id never checks what users read.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-02',
      difficulty: 'easy',
      question: `What does this line do in the browser?`,
      code: {
        language: 'typescript',
        code: `const login = page.getByRole('button', { name: 'Login' });`,
      },
      options: [
        'Nothing yet: it creates a lazy locator that is resolved when an action or assertion uses it',
        'It finds the button immediately and stores a reference to the DOM node',
        'It waits up to 30 seconds for the button to appear',
        'It throws if no button named Login exists on the page right now',
      ],
      correct: [0],
      explanation:
        `Creating a locator is instant and does no work in the browser. The search runs each time \`login\` is used in an action or a web-first assertion. "Stores a reference to the element" describes \`page.$()\` and ElementHandles, not locators. Nothing waits or throws when the locator is created. The waiting happens later, during the action, up to the timeout.`,
      followUps: [
        {
          q: 'So what happens if the button does not exist when you call `await login.click()`?',
          a: `Playwright keeps searching and waiting for a match that is ready to click. If none appears before the timeout (the test timeout, or actionTimeout if you set one), the click fails. The error includes a log of what it was waiting for.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-03',
      difficulty: 'medium',
      question: `On the SauceDemo products page, each of the six products has an "Add to cart" button. What happens here?`,
      code: {
        language: 'typescript',
        code: `await page.getByRole('button', { name: 'Add to cart' }).click();`,
      },
      options: [
        'It throws a strict mode violation because the locator resolves to 6 elements',
        'It clicks the first matching button',
        'It clicks all six buttons in order',
        'It waits until only one button remains, then clicks it',
      ],
      correct: [0],
      explanation:
        `A click needs exactly one match. With six matches, Playwright throws "strict mode violation… resolved to 6 elements". It never quietly picks the first one; that needs an explicit \`.first()\`. It never clicks all of them. And it does not wait for the count to drop: a strictness error comes at once.`,
      followUps: [
        {
          q: 'Fix it to add only the Bolt T-Shirt.',
          a: `Scope to that product's card: \`page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Bolt T-Shirt' }).getByRole('button', { name: 'Add to cart' }).click()\`, with \`testIdAttribute: 'data-test'\` in the config. Or use the product's own test id, \`add-to-cart-sauce-labs-bolt-t-shirt\`.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-04',
      difficulty: 'medium',
      question: `A locator matches several elements. Which of these work without a strict mode violation? Select ALL that apply.`,
      options: [
        'await locator.count()',
        'await expect(locator).toHaveCount(3)',
        'await locator.allTextContents()',
        'await locator.fill(\'abc\')',
        'await expect(locator).toBeVisible()',
      ],
      correct: [0, 1, 2],
      explanation:
        `\`count()\`, \`toHaveCount()\` and \`allTextContents()\` are made for many elements, so strictness does not apply. \`fill()\` acts on one element and \`toBeVisible()\` checks one element. So both throw when the locator matches more than one. Interviewers often ask about this difference.`,
      followUps: [
        {
          q: 'How do you assert the exact list of product names in order?',
          a: `Use the array form of toHaveText on the many-element locator: \`await expect(page.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Backpack', ...])\`. It keeps retrying until all the names match, in order. Reading \`allTextContents()\` once and comparing with a plain expect does not retry.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-05',
      difficulty: 'medium',
      question: `SauceDemo marks elements with \`data-test="..."\`. What makes \`page.getByTestId('username')\` work?`,
      options: [
        "Setting use: { testIdAttribute: 'data-test' } in playwright.config.ts",
        'Nothing: getByTestId matches any attribute that starts with data-test',
        "Writing getByTestId('data-test=username')",
        "Setting expect: { testId: 'data-test' } at the top level of the config",
      ],
      correct: [0],
      explanation:
        `getByTestId reads \`data-testid\` by default. \`use.testIdAttribute\` (or \`selectors.setTestIdAttribute\`) changes the attribute name. It does not match other attributes that start with the same letters. It does not understand "attr=value" strings. And there is no \`expect.testId\` option.`,
      followUps: [
        {
          q: 'How do you make codegen suggest getByTestId with data-test too?',
          a: `Run \`npx playwright codegen --test-id-attribute=data-test https://www.saucedemo.com\`. Codegen then knows the \`data-test\` values. It writes \`getByTestId(...)\` wherever it decides a test id is the best choice.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-06',
      difficulty: 'medium',
      question:
        `A page has two links: "About" and "About the company". Which locators match ONLY the "About" link? Select ALL that apply.`,
      options: [
        "page.getByRole('link', { name: 'About', exact: true })",
        "page.getByRole('link', { name: /^About$/ })",
        "page.getByRole('link', { name: 'About' })",
        "page.getByRole('link', { name: 'about', exact: true })",
      ],
      correct: [0, 1],
      explanation:
        `With \`exact: true\`, the name must equal "About" in full, with the same case. The regex \`/^About$/\` does the same, because \`^\` and \`$\` mean start and end. Without \`exact\`, the name matches any part and ignores case, so "About" also matches "About the company". And with \`exact: true\`, lowercase "about" does not match "About", because exact matching checks case.`,
      followUps: [
        {
          q: 'Besides exact, what is another way to separate the two links?',
          a: `Scope by where each link lives: \`page.getByRole('navigation').getByRole('link', { name: 'About' })\` for a header link, and \`page.getByRole('contentinfo')\` for the footer. Scoping by page area often says more than changing how the name matches.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-07',
      difficulty: 'hard',
      question: 'Which element does this locator match?',
      code: {
        language: 'typescript',
        code: `// DOM:
// <button aria-label="Close cart">X</button>
// <button>Close</button>
// <button title="Close dialog"></button>

await page.getByRole('button', { name: 'Close', exact: true }).click();`,
      },
      options: [
        'Only the second button, whose accessible name is exactly "Close"',
        'The first button, because its visible text is "X" and its label contains Close',
        'All three, causing a strict mode violation',
        'The third button, because title has the highest priority',
      ],
      correct: [0],
      explanation:
        `The accessible names are "Close cart" (aria-label replaces the text "X"), "Close" (the text inside) and "Close dialog" (title, used only when nothing else gives a name). With \`exact: true\`, only the name "Close" matches. Without exact, all three contain "Close", so you would get a strict mode violation. Title has the lowest priority, not the highest.`,
      followUps: [
        {
          q: 'How can you see the accessible name the browser computed?',
          a: `Open DevTools → Elements → Accessibility pane to see the role and name. Or use Pick locator in codegen or UI mode, which shows the role locator Playwright would write. \`locator.ariaSnapshot()\` also prints the accessibility tree of an area as YAML.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-08',
      difficulty: 'medium',
      question:
        `On https://the-internet.herokuapp.com/iframe, a test runs \`await page.getByText('Your content goes here.').isVisible()\`. The text is clearly on screen, but it is never found. Why?`,
      options: [
        'The text lives inside an iframe (the TinyMCE editor), so it must be located through page.frameLocator() or contentFrame()',
        'getByText cannot match text that ends with a period',
        'The text is in a closed shadow root, which no tool can access',
        'isVisible() only works with getByRole locators',
      ],
      correct: [0],
      explanation:
        `Page locators search only the main page. The editor text is in a separate document inside an iframe. So scope to it first, with \`page.frameLocator('#mce_0_ifr')\` or \`page.locator('#mce_0_ifr').contentFrame()\`. The other options are wrong: a full stop is fine for getByText, the editor is not a closed shadow root, and isVisible works with any locator (though it does not wait).`,
      followUps: [
        {
          q: 'Why is isVisible() a poor choice here even after fixing the frame?',
          a: `isVisible() checks once, right now, with no waiting. So it can return false while the editor is still loading. Use a web-first assertion instead: \`await expect(page.frameLocator('#mce_0_ifr').locator('#tinymce')).toContainText('Your content goes here.')\`. It retries until it passes or the expect timeout ends.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-09',
      difficulty: 'hard',
      question: `Which statements about shadow DOM and Playwright locators are true? Select ALL that apply.`,
      options: [
        'getByRole, getByText and CSS locators pierce open shadow roots automatically',
        'XPath locators do not pierce shadow roots',
        'Closed-mode shadow roots are not supported',
        'You must call a special pierce() method before locating inside any shadow root',
        'CSS locators require the >>> combinator to enter shadow DOM',
      ],
      correct: [0, 1, 2],
      explanation:
        `Playwright locators search inside open shadow DOM by default. The two exceptions in the docs are XPath (does not search inside) and closed shadow roots (not supported). There is no pierce() method. And Playwright CSS needs no special \`>>>\` combinator; that habit comes from other tools.`,
      followUps: [
        {
          q: 'Your test uses an XPath copied from DevTools for a Salesforce Lightning button and it never matches. What do you try?',
          a: `Lightning components draw their HTML inside shadow roots, so XPath cannot see the button. Switch to a user-facing locator like \`getByRole('button', { name: 'Save' })\`, or short CSS. Both search inside open shadow roots. If the role locator still fails, check the accessible name in DevTools.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-10',
      difficulty: 'hard',
      question: `The product list can now be sorted. Why has this test become flaky?`,
      code: {
        language: 'typescript',
        code: `await page.getByTestId('inventory-item').nth(2)
  .getByRole('button', { name: 'Add to cart' }).click();
await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');`,
      },
      options: [
        'nth(2) targets whatever card is third at that moment, so a different sort order adds a different product while the badge check still passes',
        'nth() is one-based, so nth(2) points at the second card',
        'nth() always throws a strict mode violation when more than one element exists',
        'getByRole cannot be chained after nth()',
      ],
      correct: [0],
      explanation:
        `A position-based locator depends on today's order. When sorting or a new product changes the order, the test acts on a different card. The plain badge check can't notice, so the test passes wrongly. The other options are wrong: nth() counts from 0 (nth(2) is the third card), it skips strictness instead of throwing, and you can chain after nth().`,
      followUps: [
        {
          q: 'How would you rewrite it, and what assertion proves the right product was added?',
          a: `Filter by the product name: \`cards.filter({ hasText: 'Sauce Labs Onesie' }).getByRole('button', { name: 'Add to cart' }).click()\`. Then check that the same card now shows a Remove button. On the cart page, check that \`getByTestId('inventory-item-name')\` has the text \`['Sauce Labs Onesie']\`. The badge alone only proves that *something* was added.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-11',
      difficulty: 'medium',
      question: `You need the "edit" link in the table row for "Jason Doe". Which locator is the most robust?`,
      options: [
        "page.getByRole('row').filter({ hasText: 'Jason' }).getByRole('link', { name: 'edit' })",
        "page.locator('table tr:nth-child(4) td:last-child a').first()",
        "page.getByRole('link', { name: 'edit' }).nth(3)",
        "page.locator('//td[text()=\"Jason\"]/following-sibling::td[5]/a[1]')",
      ],
      correct: [0],
      explanation:
        `Filtering rows by the visible value, then finding the link by name inside that row, is how a user finds it. It survives reordering. The nth-child CSS and nth(3) depend on the row position. The XPath depends on the column position and an exact text() match. So those three break when the layout or data changes.`,
      followUps: [
        {
          q: 'What if two rows contain "Jason"?',
          a: `Make the filter more specific. Use a unique value such as the email (\`hasText: 'jdoe@hotmail.com'\`). Or filter with \`has: page.getByRole('cell', { name: 'Jason', exact: true })\` and add a second filter for the last name. A \`toHaveCount(1)\` check before the click makes the assumption clear.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-12',
      difficulty: 'easy',
      question: `How does Playwright read the strings passed to page.locator() here?`,
      code: {
        language: 'typescript',
        code: `page.locator('//button[@type="submit"]');
page.locator('button[type="submit"]');`,
      },
      options: [
        'The first is auto-detected as XPath (starts with //), the second as CSS',
        'Both are treated as CSS; XPath always needs the xpath= prefix',
        'Both are treated as XPath because they contain square brackets',
        'The first throws because XPath is no longer supported',
      ],
      correct: [0],
      explanation:
        `Playwright detects the type itself. Strings that start with \`//\` or \`..\` are XPath; all others are CSS. The \`css=\` and \`xpath=\` prefixes are optional. XPath still works; it is only discouraged in favour of user-facing locators. Square brackets are valid in both CSS attribute selectors and XPath conditions, so they don't decide the type.`,
      followUps: [
        {
          q: 'Which user-facing locator would you use instead for that submit button?',
          a: `Use its accessible name, for example \`page.getByRole('button', { name: 'Login' })\`. A submit input or button has the button role, and the name also checks the label users see. If the form has several submit buttons, scope to the form or dialog first.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-13',
      difficulty: 'hard',
      question:
        `A responsive site has two "Menu" buttons. One is in the desktop header and visible. The other is in a mobile drawer squeezed to zero width and height (still in the accessibility tree, not display:none). On desktop, \`page.getByRole('button', { name: 'Menu' }).click()\` throws a strict mode violation. Which fixes are reasonable? Select ALL that apply.`,
      options: [
        "page.getByRole('button', { name: 'Menu' }).filter({ visible: true })",
        "Scope to the desktop header: page.getByRole('banner').getByRole('button', { name: 'Menu' })",
        "page.getByRole('button', { name: 'Menu' }).nth(1) because the mobile copy is always second",
        "page.getByRole('button', { name: 'Menu', includeHidden: true })",
      ],
      correct: [0, 1],
      explanation:
        `Keeping only visible elements, or scoping to the container that holds only the desktop button, both remove the confusion based on meaning. \`nth(1)\` depends on the HTML order, which can differ between page templates. \`includeHidden: true\` makes it worse, because it also adds elements hidden from the accessibility tree. Why does the error happen at all? getByRole already skips display:none and aria-hidden elements. But a zero-size element stays in the accessibility tree, even though it fails Playwright's visibility check.`,
      followUps: [
        {
          q: 'How would you test the mobile menu then?',
          a: `Run the same test in a mobile project (for example \`...devices['iPhone 13']\`). There the mobile button is visible and the desktop one is hidden. The visible-filter or header-scoped locator then finds the right button in each project, so one test covers both layouts.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-14',
      difficulty: 'expert',
      question:
        `An \`or()\` locator handles either a cookie banner or a promo dialog. Why does the assertion sometimes fail with a strict mode violation, and what is the fix?`,
      code: {
        language: 'typescript',
        code: `const banner = page.getByRole('region', { name: 'Cookie consent' });
const promo = page.getByRole('dialog', { name: 'Special offer' });

await expect(banner.or(promo)).toBeVisible();`,
      },
      options: [
        'When both appear, the or() locator matches 2 elements; add .first() because either one appearing satisfies the check',
        'or() is only valid inside filter(), so the line throws on every run',
        'toBeVisible() ignores or() and only checks the banner',
        'or() requires both locators to use the same role, so mixing region and dialog throws',
      ],
      correct: [0],
      explanation:
        `A locator built with or() matches elements from either side. When both the banner and the dialog show up, it matches two elements, and toBeVisible() is strict. The real requirement is "at least one is visible", so \`.first()\` is the correct, documented fix here. The other options are wrong: or() works as a normal locator, it covers both sides, and the two sides do not need the same role.`,
      followUps: [
        {
          q: 'After the assertion, how would you dismiss whichever one appeared?',
          a: `Now you know one of them is visible. So check which one with a quick, non-retrying check, e.g. \`if (await promo.isVisible()) await promo.getByRole('button', { name: 'Close' }).click();\`, and do the same for the banner. For pop-ups that can appear at random times, \`page.addLocatorHandler()\` registers a handler that closes them before actions.`,
        },
      ],
    },
    {
      id: 'pw-locators-mcq-15',
      difficulty: 'expert',
      question: `Which statements about filter() are correct? Select ALL that apply.`,
      code: {
        language: 'typescript',
        code: `const cards = page.getByTestId('inventory-item');

const a = cards.filter({ hasText: 'backpack' });
const b = cards.filter({ has: page.getByRole('button', { name: 'Remove' }) });
const c = cards.filter({ hasNotText: 'Sauce Labs' });
const d = cards.filter({ hasNot: page.getByTestId('inventory-item-price') });`,
      },
      options: [
        'a matches the "Sauce Labs Backpack" card because hasText is a case-insensitive substring match',
        'b keeps only cards that contain a Remove button, searched inside each card rather than from the page root',
        'c matches every card because hasNotText is ignored when hasText is absent',
        'd keeps cards that have no price element inside them',
        'b throws because a page-level locator cannot be used inside filter()',
      ],
      correct: [0, 1, 3],
      explanation:
        `hasText matches part of the text and ignores case, so "backpack" finds "Sauce Labs Backpack". The inner locator for has and hasNot is searched inside each card, even though it starts with \`page\`. So b and d work as described. hasNotText works on its own; here it would match no cards, because every name contains "Sauce Labs". And using \`page.getBy...\` inside has is the documented pattern, so b does not throw.`,
      followUps: [
        {
          q: 'What constraint applies to the inner locator in has / hasNot?',
          a: `It must be in the same frame as the outer locator, and it cannot contain frame locators. It is matched inside each outer element. So it should describe something inside the card (like a button or a name element), not a path from the top of the page.`,
        },
      ],
    },
  ],
};

export default topic;
