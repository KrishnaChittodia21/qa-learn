import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-locators',
  phase: 'pw-basics',
  order: 2,
  title: 'Locators: Finding Elements the Way Users Do',
  subtitle:
    'Why locators are lazy and re-resolve, the recommended priority (role → label → placeholder → text → alt/title → test id), getByRole in depth, filtering and chaining, strictness, CSS/XPath as a last resort, iframes and shadow DOM, testIdAttribute, and the tools that pick locators for you.',
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
    'A locator is a lazy recipe, not an element: nothing is searched until an action/assertion runs, and it re-queries the DOM every time (so no stale elements).',
    'Priority: getByRole → getByLabel → getByPlaceholder → getByText → getByAltText / getByTitle → getByTestId → CSS → XPath (last resort).',
    "getByRole('button', { name: 'Login' }): name is a case-insensitive substring by default; `exact: true` = case-sensitive whole string; regex allowed; extra filters: level, checked, pressed, expanded, selected, disabled, includeHidden.",
    'Accessible name comes from aria-labelledby > aria-label > label/alt/content text > title; `<input type="submit" value="Login">` has role button, name "Login".',
    'getByText for non-interactive content; whitespace is always normalised; substring + case-insensitive by default; `{ exact: true }` or a regex to be precise.',
    "getByTestId reads `data-testid` unless `use.testIdAttribute` is set (SauceDemo: `testIdAttribute: 'data-test'`); it is an exact attribute match.",
    'Narrow with chaining (`list.getByRole(...)`) and `filter({ hasText, hasNotText, has, hasNot, visible })`; combine with `and()` / `or()`.',
    'Strictness: single-element operations (click, fill, toHaveText, toBeVisible) throw "strict mode violation" if >1 element matches; count(), all(), toHaveCount() do not.',
    'first()/last()/nth(i) (zero-based) silence strictness but break when order changes; prefer a filter by visible content.',
    "CSS/XPath via page.locator('...') (auto-detected; `//` means XPath); avoid long DOM paths, nth-child and generated classes.",
    "iframes: page.frameLocator('#id').getByRole(...) or locator.contentFrame(); open shadow DOM is pierced automatically (not by XPath, not closed roots).",
    'Pick locators with codegen, UI mode, the VS Code extension or the Inspector; if the best tool can only offer a CSS path, the markup lacks accessibility or test ids.',
  ],
  sections: [
    {
      heading: 'What a locator is',
      body: `**Intuition:** a locator is like the instruction you give a colleague: "the **Login button** on the sign-in form". It is not a photo of the button taken at one moment; it is a description they can use to find the button again whenever they need it.

**Precisely:** a \`Locator\` is an object that stores *how* to find element(s) on a page. You create one with \`page.getByRole()\`, \`page.getByLabel()\`, \`page.locator()\` and friends. Creating it does **not** touch the browser. Only when you call an **action** (\`click\`, \`fill\`, \`check\`…) or a **web-first assertion** (\`await expect(locator).toBeVisible()\`) does Playwright search the DOM, wait for the element to be ready, and act.

| Concept | Locator (use this) | ElementHandle from \`page.$()\` (legacy) |
|---|---|---|
| What it holds | A query | A reference to one DOM node found at one moment |
| When it searches | Every time you use it | Once, when created |
| Re-render (React replaces the node) | Finds the new node | Points to a detached node → errors / stale |
| Auto-waiting | Yes, before each action | Limited; you manage timing |
| Strictness checks | Yes | No |
| Status in docs | Recommended | Discouraged |

**Interview line:** "I treat locators as recipes. I can declare them once at the top of a test or in a page object and reuse them, because each use re-resolves against the live DOM."

**Common mistake:** writing \`const btn = await page.getByRole('button')\`. There is nothing to await: \`getByRole\` returns a locator synchronously. Await the **action** instead: \`await page.getByRole('button', { name: 'Login' }).click()\`.`,
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
        'Creating a locator does nothing in the browser; actions and assertions do the searching.',
        'Do not `await` a locator factory; await the action or assertion.',
        'Prefer locators over `page.$` / ElementHandles, which go stale.',
      ],
      source: 'Playwright docs — Locators (introduction); Playwright docs — Locator API reference',
    },
    {
      heading: 'How a locator resolves',
      body: `**Intuition:** each time you use a locator, Playwright repeats the search from scratch, like asking "where is the Login button *now*?" before every step, and then waits until that button is ready for a human-style click.

**What happens on \`await locator.click()\`:**

1. **Resolve:** run the query against the current DOM (the main frame, or the frame you scoped to). Shadow roots that are open are searched too.
2. **Count matches:** 0 → keep retrying until the timeout; exactly 1 → continue; more than 1 → throw a **strict mode violation** immediately (see Strictness).
3. **Actionability checks** for that action (for click: attached, visible, stable/not animating, receives events/not covered, enabled). If one fails, go back to step 1 and retry. Re-resolving here is what makes it survive re-renders.
4. **Act:** scroll into view and dispatch real mouse/keyboard input.
5. If the test or action timeout is reached first, fail with a log of what was attempted.

Web-first assertions follow the same loop: \`await expect(locator).toHaveText('1')\` re-resolves and re-checks until it passes or the 5s expect timeout ends.

**Why this matters for testers:** single-page apps constantly replace DOM nodes (React re-renders, list updates). A reference captured earlier becomes "detached". A locator never holds a node, so it cannot go stale.

**Worked example (TodoMVC):** after you add an item, the list re-renders. A locator for \`getByTestId('todo-title')\` still finds the new items because every assertion re-queries.

Actionability checks per action, timeouts and waiting strategies are covered fully in **pw-assertions-waiting**; here, remember the order: *resolve → strictness → actionability → act, retrying until timeout*.`,
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
        'Every action/assertion re-runs the query, so locators never go stale.',
        'Zero matches → wait and retry; more than one → strict mode error; one → actionability checks → act.',
        'Retries continue until the action/test or expect timeout.',
      ],
      source: 'Playwright docs — Locators; Playwright docs — Auto-waiting (actionability)',
    },
    {
      heading: 'The recommended locator priority',
      body: `**Intuition:** find elements the way a user (or a screen-reader user) would describe them: "the **Login** button", "the **Password** field", "the **Products** heading". Users never say "the third div inside .form_column".

**Priority list** (Playwright's guidance, which codegen also follows):

| # | Locator | Use for | Example |
|---|---|---|---|
| 1 | \`getByRole\` | Anything interactive or structural: buttons, links, checkboxes, headings, rows, dialogs | \`getByRole('button', { name: 'Login' })\` |
| 2 | \`getByLabel\` | Form fields with a \`<label>\`, \`aria-label\` or \`aria-labelledby\` | \`getByLabel('Password')\` |
| 3 | \`getByPlaceholder\` | Inputs with no label but a placeholder | \`getByPlaceholder('Username')\` |
| 4 | \`getByText\` | Non-interactive text: messages, paragraphs, spans | \`getByText('Epic sadface')\` |
| 5 | \`getByAltText\` | Images and \`<area>\` by \`alt\` | \`getByAltText('Sauce Labs Backpack')\` |
| 6 | \`getByTitle\` | Elements with a \`title\` attribute (tooltips) | \`getByTitle('Issues count')\` |
| 7 | \`getByTestId\` | When user-facing attributes are missing, ambiguous or change often (translated text) | \`getByTestId('login-button')\` |
| 8 | CSS / XPath via \`page.locator\` | Last resort, legacy apps, no better hook | \`page.locator('#user-name')\` |

**Why this order:**
- **Resilience:** classes, nesting and ids are implementation details that change in refactors; the role and visible name of a "Login" button rarely change.
- **Tests that fail for the right reasons:** if a developer renames the button to "HEROBUTTON_TXT", a role locator fails, which is a real UX bug a CSS locator would miss.
- **Accessibility for free:** if you cannot write a role or label locator, screen-reader users probably cannot find that control either. Raise it as a bug.

**Where test ids fit:** they are stable and explicit, but invisible to users, so they do not catch "wrong label" bugs. Teams with translated UIs or icon-only buttons often standardise on test ids for those elements. Both approaches are defensible in interviews; explain the trade-off.

**In interviews, say this:** "Role and label first because they mirror the user and double as an accessibility check; test ids when text is unstable; CSS/XPath only as a last resort, scoped and short."`,
      keyPoints: [
        'User-facing locators (role, label, placeholder, text) first; test ids next; CSS/XPath last.',
        'User-facing locators catch broken labels and missing accessibility.',
        'Test ids are a valid, explicit contract with developers, especially for translated or icon-only UI.',
      ],
      source: "Playwright docs — Locators (quick guide) & Best practices; Checkly — user-first selectors; Debbie O'Brien — How to locate elements in Playwright",
    },
    {
      heading: 'getByRole in depth',
      body: `**Intuition:** the browser builds an **accessibility tree** next to the DOM: a simplified list of "what is this thing and what is it called" for assistive technology. \`getByRole\` queries that tree, so it sees a \`<button>\`, an \`<input type="submit">\` and a \`<div role="button">\` all as **button**.

**Common implicit roles:**

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

**The accessible name** (what \`name\` matches) is computed in roughly this order: \`aria-labelledby\` → \`aria-label\` → native label (\`<label for>\`, wrapping label, \`alt\`, \`value\` of a submit input) → text content → \`title\`. So \`<button aria-label="Close menu">X</button>\` is named "Close menu", not "X".

**Options:**

| Option | Meaning |
|---|---|
| \`name\` | String: case-insensitive substring. Regex allowed. |
| \`exact: true\` | Name must match the whole string, case-sensitive (whitespace trimmed) |
| \`level\` | Heading level, e.g. \`{ level: 1 }\` |
| \`checked\`, \`pressed\`, \`expanded\`, \`selected\`, \`disabled\` | Match ARIA/native state |
| \`includeHidden\` | Also match elements hidden from the accessibility tree (default false) |

**Substring trap:** \`getByRole('link', { name: 'About' })\` also matches "About the company". Use \`exact: true\` or a regex like \`/^About$/\`.

**Common mistake:** using \`getByRole('button', { name: 'Submit' })\` on a link styled as a button. Role is about semantics, not looks; check DevTools' Accessibility pane or use Pick locator.`,
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
        'Role comes from semantics (tag or `role` attribute), not appearance.',
        'Name = accessible name (aria-labelledby, aria-label, label/alt/value, text, title).',
        '`name` is substring and case-insensitive unless `exact: true`; use `level`/`checked` etc. to narrow further.',
      ],
      source: 'Playwright docs — Locate by role; Locator API (getByRole options); W3C accname 1.2; WAI-ARIA in HTML (implicit roles)',
    },
    {
      heading: 'getByLabel, getByPlaceholder, getByText, getByAltText, getByTitle',
      body: `**Intuition:** these mirror the other ways people point at things: "the field labelled Password", "the box that says Username inside it", "the message that says locked out", "the backpack picture".

| Locator | Matches | Default matching | Good target |
|---|---|---|---|
| \`getByLabel(text)\` | Form control associated with a \`<label for>\`, a wrapping \`<label>\`, \`aria-labelledby\` or \`aria-label\` | Substring, case-insensitive; \`exact\` available | the-internet login: \`getByLabel('Username')\` |
| \`getByPlaceholder(text)\` | \`placeholder\` attribute of inputs/textareas | Substring, case-insensitive; \`exact\` available | SauceDemo: \`getByPlaceholder('Username')\` |
| \`getByText(text)\` | Element whose text content matches | Substring, case-insensitive; **whitespace always normalised**; \`exact\` or regex | Error banners, product names, toasts |
| \`getByAltText(text)\` | \`<img>\` / \`<area>\` by \`alt\` | Substring, case-insensitive; \`exact\` available | Product images |
| \`getByTitle(text)\` | Element by \`title\` attribute | Substring, case-insensitive; \`exact\` available | Icon buttons with tooltips |

**getByText details that come up in interviews:**
- Whitespace normalisation happens even with \`exact: true\`: line breaks become spaces, repeated spaces collapse, leading/trailing spaces are ignored.
- \`exact: true\` = full string, case-sensitive. A regex gives full control: \`getByText(/^Products$/)\`.
- Use it for **non-interactive** content. For a button with text, prefer \`getByRole('button', { name })\`, which also proves it is a real button.
- It can match several elements (a parent and a child both "contain" text is handled for you, but repeated messages are not): combine with chaining or \`exact\`.

**Placeholder vs label:** a placeholder disappears when the user types, so it is a weak label for humans. SauceDemo's login fields have only placeholders (plus test ids); the-internet's login form has real labels. Use what exists, and log missing labels as accessibility issues.`,
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
        'getByLabel works with `<label for>`, wrapping labels, aria-labelledby and aria-label.',
        'getByText: substring + case-insensitive by default; whitespace always normalised; `exact` or regex to tighten.',
        'Prefer role over text for interactive elements.',
      ],
      source: 'Playwright docs — Locate by label / placeholder / text / alt text / title',
    },
    {
      heading: 'getByTestId and testIdAttribute',
      body: `**Intuition:** a test id is a name tag the developers pin on an element specifically for automation: invisible to users, agreed with the team, and not supposed to change when the design or wording changes.

**Mechanics:**
- \`page.getByTestId('login-button')\` matches \`[data-testid="login-button"]\` by default. Matching is on the exact attribute value (a regex is also accepted).
- Different attribute? Set it once in the config: \`use: { testIdAttribute: 'data-test' }\`. **SauceDemo uses \`data-test\`** (\`data-test="username"\`, \`"password"\`, \`"login-button"\`, \`"inventory-item"\`, \`"shopping-cart-badge"\`, \`"add-to-cart-sauce-labs-backpack"\`).
- Alternative: \`selectors.setTestIdAttribute('data-test')\` in code; codegen accepts \`--test-id-attribute=data-test\` so recordings use it too.
- Can be set per project if two apps under test use different attributes.

**When test ids are the right call:**

| Situation | Why |
|---|---|
| UI is translated (English/Hindi/German) | Role names change per language |
| Icon-only buttons without labels (and the team will not add them) | No user-facing name |
| Many identical controls in a list | Combine test id for the row + role inside it |
| Text is driven by a CMS and changes weekly | Text locators break for non-bugs |

**Downside:** a test id passes even if the visible label is wrong ("Lgoin"), so add text assertions where the wording matters.

**Common mistake:** writing \`page.locator('[data-test="username"]')\` everywhere instead of configuring \`testIdAttribute\` once and using \`getByTestId('username')\`.`,
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
        'Default attribute is `data-testid`; set `use.testIdAttribute` for anything else (SauceDemo: `data-test`).',
        'Test ids are stable across wording/translation changes but do not verify visible text.',
        'Configure once instead of repeating attribute CSS selectors.',
      ],
      source: 'Playwright docs — Locate by test id & Set a custom test id attribute; Playwright docs — codegen --test-id-attribute',
    },
    {
      heading: 'Filtering and chaining',
      body: `**Intuition:** like narrowing a search in a spreadsheet: first "rows in the product list", then "the row that mentions Backpack", then "the Add to cart button inside that row".

**Chaining** (\`outer.getByRole(...)\`) searches *inside* each match of the outer locator.

**\`filter()\` options:**

| Option | Keeps elements that… |
|---|---|
| \`hasText: 'Backpack'\` or regex | contain that text somewhere inside (case-insensitive substring) |
| \`hasNotText: 'Sold out'\` | do not contain that text |
| \`has: page.getByRole('heading', { name: 'Product 2' })\` | contain a descendant matching that locator (searched relative to the outer element) |
| \`hasNot: page.getByRole('button', { name: 'Remove' })\` | do not contain such a descendant |
| \`visible: true\` | are visible (useful when the DOM has hidden duplicates, e.g. desktop + mobile menus) |

**Combining locators:**
- \`a.and(b)\`: elements matching both, e.g. \`page.getByRole('button').and(page.getByTitle('Subscribe'))\`.
- \`a.or(b)\`: elements matching either, e.g. "either the new-email banner or the security dialog appears". If both are present you have two matches, so add \`.first()\` before an assertion.

**Pattern for lists and tables:** *locate the container row by something unique the user sees, then the control inside it.* This is far sturdier than "the 4th button".

**Common mistake:** writing \`filter({ has: page.locator('body .inventory_item_name') })\`. The inner locator is relative to the outer element, so do not start it from the page root's structure; a simple inner role/test-id locator is enough.`,
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
        'Chaining scopes the search inside each outer match.',
        '`filter` with hasText / hasNotText / has / hasNot / visible narrows a set without positional indexes.',
        '`and()` intersects, `or()` unions; an `or()` may need `.first()` to satisfy strictness.',
      ],
      source: 'Playwright docs — Filtering locators, Chaining, Matching two locators (and/or); Locator API — filter()',
    },
    {
      heading: 'Strictness',
      body: `**Intuition:** if you tell a colleague "click the Add to cart button" on a page with six of them, a careful colleague asks "which one?" instead of guessing. Playwright does the same: it refuses to guess.

**Rule:** any operation that targets **one** element throws when the locator matches more than one:

\`Error: strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements\`

| Throws on multiple matches (single-element) | Fine with multiple matches (multi-element) |
|---|---|
| \`click\`, \`fill\`, \`check\`, \`hover\`, \`press\`, \`selectOption\`, \`textContent\`, \`getAttribute\`, \`inputValue\` | \`count()\`, \`all()\`, \`allTextContents()\`, \`allInnerTexts()\`, \`evaluateAll()\` |
| \`expect(l).toBeVisible()\`, \`toHaveText('x')\`, \`toBeChecked()\`, \`toHaveValue()\` | \`expect(l).toHaveCount(n)\`, \`toHaveText(['a','b'])\` (array form) |

The error message lists every match with a suggested locator for each, which is often all you need to fix it.

**Why strictness is a feature:** without it, a test might click the first of six buttons today, and silently a *different* one tomorrow after a re-ordering, passing while testing the wrong thing.

**Fixes, best first:**
1. Make the locator more specific with what the user sees: a fuller \`name\`, \`exact: true\`, a role state.
2. **Scope** it: chain from a unique container (\`dialog\`, \`row\`, product card) or \`filter({ hasText })\`.
3. Use a **test id** for the row or the control.
4. Only if order is the actual requirement ("the first search result is the sponsored one"): \`first()\`, \`last()\` or \`nth(i)\` (zero-based).

**Why \`nth()\` is a last resort:** it ties the test to order and layout. Sort changes, a new banner or an A/B test silently retargets it. The docs explicitly warn that these methods can act on unintended elements when the page changes.

**Common mistake:** "fixing" every strict mode error with \`.first()\`. That hides the ambiguity instead of resolving it.`,
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
        'Single-element actions and assertions throw if the locator matches more than one element.',
        'count(), all(), allTextContents(), toHaveCount() and array toHaveText() work on many.',
        'Fix by being more specific or scoping; use first/last/nth only when order is the requirement.',
      ],
      source: 'Playwright docs — Strictness; Locator API — first(), last(), nth(); Checkly — handling multiple matches',
    },
    {
      heading: 'CSS and XPath: when you still need them',
      body: `**Intuition:** CSS and XPath are like describing a house by "third building after the second left turn". It works until the street changes. Use them when there is truly no name, label or test id to describe the element by.

**How:** \`page.locator(selector)\`. Playwright auto-detects the type: strings starting with \`//\` or \`..\` are XPath, others are CSS. Explicit prefixes \`css=\` and \`xpath=\` also work.

**Brittle vs resilient:**

| Brittle | Why it breaks | Better |
|---|---|---|
| \`//div[2]/form/div[3]/input\` | Any layout change shifts indexes | \`getByRole('button', { name: 'Login' })\` |
| \`.btn.btn_primary.btn_small.btn_inventory\` | Styling classes change in redesigns | \`getByRole('button', { name: 'Add to cart' })\` scoped to the card |
| \`.css-1x2y3z\` (CSS-in-JS hash) | Regenerated on every build | \`getByLabel\` / \`getByTestId\` |
| \`//button[text()='Login ']\` | Exact text with whitespace, no normalisation | \`getByRole('button', { name: 'Login' })\` |
| \`#root > div > div:nth-child(4)\` | Structural path | Scope from a named landmark/role |

**Acceptable uses:**
- A stable, meaningful id that developers own: \`page.locator('#user-name')\` on SauceDemo is fine (though \`getByTestId('username')\` or the placeholder is clearer).
- Short, scoped CSS for something with no semantics: \`card.locator('img')\`.
- Attribute selectors for data in the DOM: \`page.locator('[data-sort="price"]')\`.
- XPath for a parent hop in a legacy page (\`locator('xpath=..')\`), though \`filter({ has })\` is preferred.

**Know the legacy/deprecated forms (to recognise them in old code):** \`text=Login\` (legacy text engine), \`>>\` chaining, layout pseudo-classes like \`:right-of()\` / \`:near()\` (deprecated and may be removed), \`:nth-match()\`. Prefer \`getByText\`, chained locators and \`filter()\`.

**Important limitation:** XPath does **not** pierce shadow DOM, while CSS and \`getBy*\` locators do.

**Performance myth:** some benchmarks show CSS resolving slightly faster than \`getByRole\`. The difference is milliseconds per lookup; maintenance cost and false passes cost hours. Choose resilience.`,
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
        '`page.locator()` auto-detects CSS vs XPath (`//` or `..` → XPath).',
        'Avoid structural paths, nth-child, styling and generated classes.',
        'XPath does not pierce shadow DOM; layout pseudo-classes and `text=`/`>>` are legacy.',
      ],
      source: 'Playwright docs — Other locators (CSS, XPath, legacy text, layout pseudo-classes); Playwright docs — Best practices',
    },
    {
      heading: 'Frames and shadow DOM',
      body: `**Intuition:** an **iframe** is a separate web page embedded inside the page, like a TV showing another channel; you must "tune in" to it before you can find anything inside. **Shadow DOM** is a component's private inner DOM; Playwright can usually see into it without any extra step.

**iframes:**
- Locators on \`page\` search only the main frame. To reach inside an iframe, scope first:
  - \`page.frameLocator('#mce_0_ifr').getByRole(...)\`, or
  - \`page.locator('#mce_0_ifr').contentFrame().getByRole(...)\` (turn a locator for the \`<iframe>\` element into a FrameLocator).
- Nested iframes: chain again (\`.frameLocator('...').frameLocator('...')\`).
- Frame locators are lazy and auto-wait just like normal locators, so you do not need a "switch to frame" step as in Selenium.
- \`page.frame({ name })\` / \`page.frame({ url })\` return a \`Frame\` object (older style); prefer frame locators.

**Shadow DOM:**
- All Playwright locators (role, text, label, test id, CSS) **pierce open shadow roots by default**.
- Exceptions: **XPath does not pierce**, and **closed** shadow roots are not supported.
- So in a web-components app (Salesforce Lightning, many design systems), \`getByRole('button', { name: 'Save' })\` usually just works, while an XPath copied from DevTools fails.

**Common mistake:** writing \`page.getByText('Your content goes here.')\` for text inside an editor iframe and getting a timeout. The text is in another document; scope to the frame.`,
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
        'iframes need scoping: `page.frameLocator(selector)` or `locator.contentFrame()`.',
        'Frame locators are lazy and auto-wait; no "switch to frame" step.',
        'Open shadow DOM is pierced by every locator type except XPath; closed roots are unsupported.',
      ],
      source: 'Playwright docs — Frames; Playwright docs — Locators (Shadow DOM, frameLocator); Locator API — contentFrame()',
    },
    {
      heading: 'Tools that pick locators for you',
      body: `**Intuition:** instead of guessing, point at the element and let Playwright propose the locator it would use, then sanity-check it.

| Tool | How to open | What you do |
|---|---|---|
| **Codegen** | \`npx playwright codegen <url>\` (add \`--test-id-attribute=data-test\` for SauceDemo) | Click **Pick locator**, hover, click; copy the locator |
| **UI mode** | \`npx playwright test --ui\` | Pick locator on any DOM snapshot of any step; edit it in the playground and see matches highlighted |
| **Inspector** | \`npx playwright test --debug\` or \`await page.pause()\` | Type a locator to highlight matches live on the paused page |
| **VS Code extension** | Testing sidebar → **Pick locator** | Hover in the browser; the locator lands in the editor box |
| **Browser DevTools** | Elements → Accessibility pane | See the computed role and accessible name the browser uses |

**How the generators choose:** role + name first, then text, then test id, and they **refine until the locator is unique** (by chaining from a uniquely named ancestor, adding \`exact\`, or filtering). When nothing semantic exists they fall back to CSS, which is a signal worth reporting.

**Your review checklist for a suggested locator:**
1. Does it describe what a user sees (role/name, label)?
2. Does it match exactly one element now **and** after likely changes (new product, sort order, translated text)?
3. Is the scope as small as possible (inside a card, row or dialog)?
4. If it is a CSS path, can you ask developers for a label or test id instead?

**Bonus:** \`locator.describe('Checkout button')\` attaches a human description that shows up in traces and reports, which helps when a long chained locator fails.

**In interviews, say this:** "I use the picker to start, but I always review the locator for user-facing semantics and uniqueness under change before I commit it."`,
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
        'Codegen, UI mode, Inspector and VS Code all offer Pick locator.',
        'Generators prefer role, text, test id and refine until unique.',
        'Always review a suggested locator for semantics, uniqueness under change and scope.',
      ],
      source: "Playwright docs — Test generator (Generate locators); Playwright docs — UI Mode (Pick locator); Debbie O'Brien — How to locate elements in Playwright",
    },
  ],
  codeChallenges: [
    {
      id: 'pw-locators-cc-1',
      title: 'Replace brittle XPath/CSS with user-facing locators',
      context:
        'This SauceDemo checkout test was exported from an old Selenium IDE recording. It breaks every time the front-end team restyles the page, and once it "passed" while clicking the wrong product after a sort change.',
      task:
        'Rewrite every locator so the test survives styling and layout changes, targets the intended product by what the user sees, and still fails if visible labels break. Assume `testIdAttribute: \'data-test\'` and `baseURL` are configured.',
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
        'Login fields have placeholders and data-test ids; the Login control is a submit input whose accessible name is "Login".',
        'For the product, find the inventory card that contains the product name, then the "Add to cart" button inside it. The cart icon is exposed as a button named after the cart.',
        'Checkout fields have placeholders "First Name", "Last Name", "Zip/Postal Code"; Continue, Finish and the confirmation heading all have accessible names. Use a web-first assertion at the end.',
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
      explanation: `**What changed and why:**

- **Absolute XPath → placeholders:** \`//*[@id="root"]/div/div[2]/...\` encoded the whole layout; any wrapper div added by a redesign broke it. Placeholders are what the user sees in the field.
- **Styling classes → roles:** \`.submit-button.btn_action\` and the long \`checkout_button\` class chain describe CSS, not behaviour. \`getByRole('button', { name: 'Login' })\` also verifies the control really is a button with the right label.
- **\`nth-child(1)\` → filter by product name:** the original test silently clicked a different product after a sort change (a false pass). Filtering the card by "Sauce Labs Backpack" makes the intent explicit and fails loudly if the product disappears.
- **Cart link:** SauceDemo exposes \`data-test="shopping-cart-link"\`; its accessible name changes with the item count ("Cart, 1 items"), so the test id is the stabler hook here. That is a good example of choosing a test id deliberately.
- **\`input:nth-of-type(1)\`, \`form input:nth-child(3)\` → placeholders** for the checkout form.
- **\`//button[text()="Finish"]\` → role + name:** no whitespace or exact-text traps.
- **Final check:** \`expect(await ...textContent()).toBe(...)\` checked once with no retry; the web-first \`toBeVisible()\` on a role-named heading waits for the confirmation page.`,
      followUps: [
        {
          q: 'Why not use test ids for every element in this test?',
          a: 'Test ids would be stable, but they would not catch user-visible regressions: if the button label became "Chekout" or a field lost its placeholder, a test-id-only test still passes. Using role and placeholder where they exist keeps the test closer to the user and doubles as a light accessibility check; test ids are reserved for elements whose user-facing name is dynamic or missing, like the cart link here.',
        },
        {
          q: 'The product names are translated in the German build. What would you change?',
          a: 'Move the product selection to a language-independent hook, such as `getByTestId(\'add-to-cart-sauce-labs-backpack\')`, or keep the card filter but read the expected product name from the same translation file the app uses. Role names for buttons would also change per locale, so either drive the test per locale with translated strings or rely on test ids for the controls.',
        },
      ],
    },
    {
      id: 'pw-locators-cc-2',
      title: 'Strict mode "fixed" with nth(): make it precise instead',
      context:
        'A test kept failing with "strict mode violation", so a teammate sprinkled `.first()` and `.nth()` everywhere. It now passes, but nobody can tell which elements it really clicks, and it broke when the-internet added a new checkbox in a staging build.',
      task:
        'Rewrite the locators so each targets one specific element by meaning (label text, row content or role state) rather than by position, and keep the assertions meaningful.',
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
        'In the table, which visible value uniquely identifies Frank\'s row? Filter rows by it, then pick the link by its name.',
        'The two checkboxes have no labels. Which role-state option distinguishes the unchecked one from the checked one? (Then report the missing labels.)',
        '"Login" appears as a heading and as a button. Which role and option narrow it to the page heading?',
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
      explanation: `**Fixes:**

- **Row by content, not index:** \`nth(2)\` meant "whatever is third". Sorting the table (this page supports it) or adding a row retargets it silently. Filtering rows by Frank's unique email describes the intent, and the \`toHaveCount(1)\` guard fails loudly if the data changes.
- **Link by name:** \`getByRole('link').first()\` picked "edit" only because it came before "delete". Naming it removes the dependence on order (and avoids clicking delete one day).
- **Checkbox by state:** with no labels, the honest discriminator is the state (\`checked: false\`). The assertion now checks the outcome (two checked boxes) with web-first \`toHaveCount\`, instead of \`isChecked()\` with a non-retrying \`expect\`.
- **Heading by role and level:** \`getByText('Login').first()\` could match the button, the heading or a menu link depending on DOM order. \`getByRole('heading', { name: 'Login Page', level: 2 })\` is unambiguous.
- **Takeaway:** strict mode violations are information. Resolve the ambiguity; do not silence it.`,
      followUps: [
        {
          q: 'When is `.first()` genuinely correct?',
          a: 'When position is the requirement being tested: "after sorting by price low-to-high, the first item costs $7.99", "the newest message appears at the top", or "the first search result is the sponsored one". In those cases the order is the behaviour under test, so `first()` or `nth()` expresses intent. Using it merely to silence a strict mode error is the anti-pattern.',
        },
        {
          q: 'How would you ask developers to make the checkboxes easier to test?',
          a: 'File it as an accessibility issue: each checkbox needs an accessible name, for example `<label><input type="checkbox"> Subscribe to newsletter</label>` or an `aria-label`. Then tests can use `getByRole(\'checkbox\', { name: \'Subscribe to newsletter\' })` or `getByLabel`. It helps screen-reader users and makes automation resilient at the same time, which is an easy argument to win.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-locators-iq-01',
      difficulty: 'medium',
      question: 'What is a locator in Playwright, and how is it different from what `page.$()` or Selenium\'s findElement returns?',
      context: '"What is a locator / how does locator resolution work" appears in most 2025–2026 Playwright question banks (e.g. TestDino, Testleaf).',
      whatInterviewerLooksFor: [
        'Locator = lazy description re-resolved on every use',
        'Contrast with element handles / WebElements that can go stale',
        'Mentions auto-waiting and strictness as consequences',
        'A concrete example of a re-render',
      ],
      modelAnswer: `**A locator is a lazy, re-usable description of how to find an element**, not the element itself. \`page.getByRole('button', { name: 'Login' })\` returns immediately without touching the browser. When I call an action or a web-first assertion on it, Playwright:

1. runs the query against the **current** DOM,
2. checks it matches exactly one element (strictness),
3. waits for the actionability checks (visible, stable, enabled, receiving events),
4. acts, and retries the whole thing until the timeout if anything is not ready.

**\`page.$()\` / ElementHandle (and Selenium's \`WebElement\`)** capture a reference to one DOM node at one moment. If a React app re-renders that part of the page, the reference points at a detached node, which gives the classic \`StaleElementReferenceException\` in Selenium, or errors and flakiness in Playwright's handle API. Handles also skip strictness checks and give less auto-waiting, which is why the docs discourage them.

**Example:** on TodoMVC I declare \`const titles = page.getByTestId('todo-title')\`, add two items and assert \`toHaveText([...])\`. The list is re-rendered after each add, but the same locator keeps working because every use re-queries.

**Practical consequences:**
- I can define locators once (top of a test, or in a page object constructor) and reuse them safely.
- I never write \`await page.getByRole(...)\` on its own; I await the action or assertion.
- For counting or reading lists I use multi-element methods like \`count()\`, \`allTextContents()\` or \`toHaveCount()\`.`,
      followUps: [
        {
          q: 'If locators are lazy, when do you actually get an error for a wrong locator?',
          a: 'Only when it is used. An action or assertion with a locator that matches nothing waits and retries until the timeout, then fails with a log showing what it was waiting for. A locator that matches several elements fails immediately with a strict mode violation listing the matches. Declaring an unused wrong locator produces no error at all.',
        },
        {
          q: 'Is there any case where you would still use an ElementHandle?',
          a: 'Rarely. Some low-level cases, such as passing a DOM node into `page.evaluate` or legacy code, use handles, but locator APIs now cover almost everything: `evaluate`, `evaluateAll`, `boundingBox`, screenshots and frame access via `contentFrame()`. In new code I would use locators and treat `page.$` / `$$` as a code-review smell.',
        },
      ],
      pitfalls: [
        'Saying a locator "stores the element" or "finds the element when it is created".',
        'Awaiting locator creation and believing that is what waits.',
        'Not knowing why stale element errors disappear with locators.',
      ],
    },
    {
      id: 'pw-locators-iq-02',
      difficulty: 'easy',
      question: 'Which locator strategy do you prefer in Playwright and why? Rank them.',
      whatInterviewerLooksFor: [
        'Correct priority with getByRole first',
        'Reasons: resilience, user perspective, accessibility',
        'A balanced view of test ids',
        'Concrete examples on a real page',
      ],
      modelAnswer: `My order follows Playwright's guidance:

1. **\`getByRole\`** with a name: \`getByRole('button', { name: 'Login' })\`. It matches how users and assistive technologies perceive the page, survives restyling, and fails when the visible label breaks.
2. **\`getByLabel\`** for form fields: \`getByLabel('Password')\` on the-internet's login form.
3. **\`getByPlaceholder\`** when there is no label (SauceDemo's login fields).
4. **\`getByText\`** for non-interactive content such as error messages: \`getByText('Epic sadface')\`.
5. **\`getByAltText\` / \`getByTitle\`** for images and tooltipped icons.
6. **\`getByTestId\`** when user-facing hooks are missing, ambiguous or unstable (translated UI, CMS text, icon-only buttons). On SauceDemo I set \`testIdAttribute: 'data-test'\`.
7. **CSS / XPath** only as a last resort: short, scoped, never structural paths or generated classes.

**Why this order:**
- **Resilience:** the role and name of a button change far less often than its classes or DOM position.
- **Meaningful failures:** a role-based test fails if the button loses its label, which is a real bug; a CSS test would pass.
- **Accessibility:** if I cannot write a role or label locator, screen-reader users likely struggle too, so I report it.

**About test ids:** some teams prefer them everywhere for stability. That is defensible, but I pair them with assertions on visible text where wording matters, because a test id never proves what the user reads.`,
      followUps: [
        {
          q: 'A button shows only an icon (a trash can) with no text. How do you locate it?',
          a: 'First check its accessible name in DevTools: if it has `aria-label="Delete item"` or a `title`, `getByRole(\'button\', { name: \'Delete item\' })` or `getByTitle` works. If it has no name at all, that is an accessibility defect: screen readers announce just "button". I would report it and, until fixed, use a test id or scope a short CSS selector inside the specific row.',
        },
        {
          q: 'Is getByText a good choice for buttons?',
          a: 'It works, but `getByRole(\'button\', { name })` is better: it ensures the element is actually exposed as a button (keyboard and screen-reader accessible) and avoids matching the same text in a paragraph or heading. I reserve getByText for non-interactive content like messages, labels in read-only views and product descriptions.',
        },
      ],
      pitfalls: [
        'Leading with XPath or CSS as the default strategy.',
        'Saying test ids are always best without mentioning they do not verify visible text.',
        'Not knowing getByLabel or getByPlaceholder exist.',
      ],
    },
    {
      id: 'pw-locators-iq-03',
      difficulty: 'medium',
      question: 'Your test fails with "strict mode violation: resolved to 3 elements". What does that mean, and how do you fix it properly?',
      context: 'Strict mode violations are among the most common Playwright interview scenarios reported in 2025–2026 question guides.',
      whatInterviewerLooksFor: [
        'Explains strictness and which operations enforce it',
        'Reads the error message (it lists the matches)',
        'Fixes by specificity/scoping before reaching for nth/first',
        'Knows when first()/nth() are legitimate',
      ],
      modelAnswer: `**Meaning:** I called a single-element operation (click, fill, \`toHaveText\`, \`toBeVisible\`…) on a locator that currently matches three elements. Playwright refuses to guess which one I meant. Multi-element operations (\`count()\`, \`allTextContents()\`, \`toHaveCount()\`) would not throw.

**How I fix it:**

1. **Read the error.** It lists each matching element and suggests a locator for each, so I see what the three matches are (for example a header link, a footer link and a button, all named "Login").
2. **Be more specific with user-visible information:** full name with \`exact: true\`, a different role (\`heading\` vs \`link\`), a state (\`checked: false\`), or \`level\` for headings.
3. **Scope to a unique container:** \`page.getByRole('dialog').getByRole('button', { name: 'Save' })\`, or a product card filtered by its name: \`getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button', { name: 'Add to cart' })\`.
4. **Use a test id** on the element or its row when the visible information is genuinely identical.
5. **Only if order is the requirement** ("the cheapest item is first after sorting"), use \`first()\`, \`last()\` or \`nth()\`.

**Why not \`.first()\` by default?** It hides the ambiguity. When products are re-ordered or a new banner adds another match, the test clicks something else and may still pass. Strictness exists to stop exactly that kind of false pass.

**Also check:** sometimes the duplicates are hidden copies (mobile + desktop navigation). Then \`filter({ visible: true })\` is the honest fix.`,
      followUps: [
        {
          q: 'Why does `toHaveCount(3)` work on the same locator that failed the click?',
          a: 'Because `toHaveCount` is a multi-element assertion: its whole purpose is to look at all matches, so strictness does not apply. The same goes for `count()`, `all()`, `allTextContents()` and the array form of `toHaveText([...])`. Strictness only applies to operations that must act on, or read from, one specific element.',
        },
        {
          q: 'Can you disable strict mode globally?',
          a: 'Not for locators in @playwright/test; strictness is a deliberate design choice. You opt out per locator with `first()`, `last()` or `nth()`. If a team wants to turn it off broadly, that usually signals locators that are too generic, which is better fixed by scoping and naming.',
        },
      ],
      pitfalls: [
        'Adding `.first()` everywhere as the standard fix.',
        'Thinking strictness applies to count() and toHaveCount().',
        'Not reading the error output, which already lists the matches.',
      ],
    },
    {
      id: 'pw-locators-iq-04',
      difficulty: 'hard',
      question:
        'The app has no test ids, CSS classes are auto-generated hashes (like `css-1q2w3e`) that change every build, and some buttons have no labels. How do you build a stable locator strategy?',
      whatInterviewerLooksFor: [
        'Starts with user-facing locators and the accessibility tree',
        'Uses scoping and filtering rather than structure',
        'Works with developers (test ids, labels) instead of fighting the DOM',
        'Has an interim plan and a way to keep locators maintainable',
      ],
      modelAnswer: `**1. Audit what the accessibility tree already offers.** Generated classes are irrelevant to \`getByRole\`. Most buttons, links, headings, form fields and dialogs have roles and names even in CSS-in-JS apps. I run codegen or UI mode's Pick locator across key pages and check DevTools' Accessibility pane.

**2. Use user-facing locators plus scoping.**
- \`getByRole('dialog', { name: 'Edit address' }).getByRole('button', { name: 'Save' })\`
- Rows/cards by visible content: \`getByRole('row').filter({ hasText: 'INV-1042' })\`, then the control inside.
- Landmarks: \`getByRole('navigation')\`, \`getByRole('main')\` to separate header and body duplicates.

**3. Treat missing labels as bugs.** An icon button with no accessible name is invisible to screen-reader users. I file accessibility defects ("Delete button in cart row has no accessible name") with the WCAG reference; fixing them makes locators possible.

**4. Agree on test ids for the rest.** Propose a convention (\`data-testid\` or \`data-test\`, kebab-case, stable meaning such as \`cart-row-delete\`), add it to the definition of done for new UI, and configure \`testIdAttribute\` once.

**5. Interim fallback:** short CSS anchored to stable attributes (\`[name="email"]\`, \`[type="submit"]\`, \`aria-*\`), always scoped inside a role-located container. Never hashed classes, never \`nth-child\` paths.

**6. Keep it maintainable:** locators live in page objects, so a change is fixed in one place; I add \`locator.describe()\` for long chains so traces read well; and I review locators in code review like production code.`,
      followUps: [
        {
          q: 'A developer says adding test ids "pollutes production HTML". How do you respond?',
          a: 'The attributes are tiny, inert and widely used, and they make tests cheaper to maintain. If the team still objects, they can be stripped at build time for production with a compiler plugin, while staging builds keep them. In parallel, improving accessible names reduces how many test ids are needed at all, which developers usually welcome.',
        },
        {
          q: 'How would you locate a specific row in a data grid built from divs instead of a table?',
          a: 'Check whether the grid sets ARIA roles (`role="grid"`, `"row"`, `"gridcell"`); good component libraries do, and then `getByRole(\'row\').filter({ hasText: \'INV-1042\' })` works. If not, find a repeated container with a test id or stable attribute, filter it by the unique visible value, and chain to the control inside. Report the missing grid semantics too.',
        },
      ],
      pitfalls: [
        'Copying full XPath from DevTools as the main strategy.',
        'Relying on generated class names.',
        'Not involving developers or accessibility in the solution.',
      ],
    },
    {
      id: 'pw-locators-iq-05',
      difficulty: 'medium',
      question: 'How do you work with elements inside iframes and inside shadow DOM in Playwright? How is that different from Selenium?',
      whatInterviewerLooksFor: [
        'frameLocator / contentFrame usage',
        'Knows frame locators auto-wait and need no switching',
        'Shadow DOM piercing rules (XPath and closed roots)',
        'Comparison with Selenium switchTo and shadow root APIs',
      ],
      modelAnswer: `**iframes:** an iframe is a separate document, so page-level locators do not look inside it. I scope first:

- \`page.frameLocator('#mce_0_ifr').locator('#tinymce')\` for the TinyMCE editor on the-internet's /iframe page, or
- \`page.locator('#mce_0_ifr').contentFrame().locator('body')\`, which turns a locator for the iframe element into a frame locator. (The TinyMCE toolbar buttons live in the main page, not in the iframe; only the editable document is inside.)

Frame locators are **lazy and auto-waiting** like any locator: if the iframe loads late, Playwright waits. Nested frames are just more chaining. There is no "switch into the frame, then switch back" step. In Selenium you call \`driver.switchTo().frame(...)\`, every subsequent command targets that frame, and you must remember \`switchTo().defaultContent()\` afterwards; forgetting it is a classic bug.

**Shadow DOM:** Playwright's locators pierce **open** shadow roots automatically, so \`getByRole('button', { name: 'Follow' })\` finds a button inside a web component with no extra code. Two exceptions:
- **XPath does not pierce** shadow roots (a copied XPath often fails in web-component apps);
- **closed** shadow roots are not supported.

In Selenium 4 you typically get the host element, call \`getShadowRoot()\`, and search inside it with CSS, level by level.

**Example habit:** when a locator unexpectedly times out on a visible element, I check in DevTools whether it is inside an \`<iframe>\` (needs frameLocator) or a \`#shadow-root (closed)\` (needs app support).`,
      followUps: [
        {
          q: 'An iframe has no id or name. How do you target it?',
          a: 'Any locator that resolves to the iframe element works: `page.locator(\'iframe[title="Payment form"]\').contentFrame()`, `page.frameLocator(\'iframe[src*="stripe"]\')`, or even `page.getByTitle(\'Payment form\').contentFrame()`. A `title` attribute on iframes is also an accessibility requirement, so if it is missing, it is worth reporting.',
        },
        {
          q: 'How would you check something in a third-party payment iframe you do not control?',
          a: 'Locate it with frameLocator and interact as a user would, using test card numbers in the provider\'s sandbox. But following Playwright best practices, avoid depending on third-party UIs in most tests: mock the payment network call with `page.route` for the bulk of checkout tests and keep one or two end-to-end tests against the sandbox.',
        },
      ],
      pitfalls: [
        'Saying Playwright needs a switchTo-style call for iframes.',
        'Claiming XPath works inside shadow DOM.',
        'Not knowing closed shadow roots are unsupported.',
      ],
    },
    {
      id: 'pw-locators-iq-06',
      difficulty: 'medium',
      question:
        'On a product list where every card has an identical "Add to cart" button, how do you click the button for one specific product? Write the locator.',
      whatInterviewerLooksFor: [
        'Container → filter by unique visible content → control inside',
        'Uses filter({ hasText }) or filter({ has })',
        'Avoids nth() and explains why',
        'Adds an assertion that proves the right item was added',
      ],
      modelAnswer: `The pattern is **container → filter by what makes it unique → control inside**.

On SauceDemo (with \`testIdAttribute: 'data-test'\`):

\`page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Bike Light' }).getByRole('button', { name: 'Add to cart' })\`

Step by step:
1. \`getByTestId('inventory-item')\` matches all six product cards.
2. \`filter({ hasText: 'Sauce Labs Bike Light' })\` keeps the one card containing that name.
3. \`.getByRole('button', { name: 'Add to cart' })\` searches only inside that card, so it matches exactly one button.

If two products had overlapping names ("Backpack" and "Backpack Pro"), I would filter with \`has\` on the exact name element: \`filter({ has: page.getByText('Sauce Labs Backpack', { exact: true }) })\`.

**Without test ids**, the same idea works with roles when the markup is semantic: \`getByRole('listitem').filter({ hasText: 'Bike Light' }).getByRole('button', { name: 'Add to cart' })\`.

**Why not \`nth(1)\`?** It encodes today's order. Sorting, a new product or a personalised list changes it, and the test clicks the wrong item, possibly still passing.

**Prove it worked:**
- \`await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible()\` (the button flips),
- \`await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1')\`,
- and on the cart page, \`await expect(page.getByTestId('inventory-item-name')).toHaveText(['Sauce Labs Bike Light'])\`.`,
      followUps: [
        {
          q: 'What does filter({ has }) do differently from hasText?',
          a: '`hasText` keeps elements whose text content contains the string anywhere inside, which can over-match on substrings or descriptions. `has` keeps elements containing a descendant that matches another locator, searched relative to each candidate. It lets you be precise, for example requiring a heading with an exact name or a specific badge inside the card.',
        },
        {
          q: 'How would you add every product cheaper than $10 to the cart?',
          a: 'Read prices with `cards.getByTestId(\'inventory-item-price\').allTextContents()` after the list is loaded, or iterate `for (const card of await cards.all())`, parse each price, and click Add to cart inside matching cards. Then assert the badge equals the number of matches. Because `all()` does not wait, first assert the list is loaded, for example with `toHaveCount(6)`.',
        },
      ],
      pitfalls: [
        'Using nth() based on the current position.',
        'Calling getByRole(\'button\', { name: \'Add to cart\' }).click() on the whole page (strict mode violation).',
        'Not asserting that the correct item ended up in the cart.',
      ],
    },
    {
      id: 'pw-locators-iq-07',
      difficulty: 'hard',
      question:
        'A senior colleague insists on XPath for everything because "it can find anything, and CSS is faster than getByRole anyway". How do you respond?',
      whatInterviewerLooksFor: [
        'Respectful, evidence-based argument rather than dogma',
        'Concrete technical limits of XPath (shadow DOM, brittleness, text matching)',
        'Puts the performance claim in proportion',
        'Offers a pragmatic compromise',
      ],
      modelAnswer: `I would agree on what is true, then move the discussion to maintenance cost.

**What is true:** XPath is expressive (parent/sibling axes, complex predicates), and micro-benchmarks can show CSS resolving slightly faster than \`getByRole\` because role matching computes accessible names.

**Why I still would not default to it:**

| Concern | XPath-first | Role/label-first |
|---|---|---|
| Layout change (new wrapper div) | Absolute/positional paths break | Unaffected |
| Shadow DOM | XPath does **not** pierce shadow roots | getBy* and CSS pierce open roots |
| Text matching | \`text()=\` is exact, whitespace-sensitive | Normalised whitespace, substring/exact/regex |
| Catches UX bugs | No: passes if the label breaks | Fails if the name/role breaks |
| Readability in review | \`//div[3]/span[@class='x']/..\` | \`getByRole('button', { name: 'Pay' })\` |
| Accessibility signal | None | Missing names surface as bugs |

**Performance in proportion:** a few milliseconds per lookup, while a typical UI test spends seconds on navigation and network. One flaky or broken locator costs far more engineering time than the whole suite's lookup overhead.

**Pragmatic compromise:**
- Default to role/label/test id; allow CSS/XPath when no semantic hook exists, but **scoped** (inside a role-located container) and **short**.
- XPath's parent-axis use case is better served by \`filter({ has })\`.
- Agree on a test-id convention with developers for awkward widgets.
- Run a two-week experiment: count locator-related failures before and after on one module.

That keeps the conversation about outcomes (fewer broken tests), not personal preference.`,
      followUps: [
        {
          q: 'Give an XPath use case and its Playwright-native replacement.',
          a: 'A common XPath is "find the row containing this email, then its Delete button": `//td[text()="fbach@yahoo.com"]/../td/a[text()="delete"]`. The native version is `page.getByRole(\'row\').filter({ hasText: \'fbach@yahoo.com\' }).getByRole(\'link\', { name: \'delete\' })`: no parent axis, whitespace-tolerant, readable, and it pierces shadow DOM if the table ever moves into a web component.',
        },
        {
          q: 'Are there layout-based locators in Playwright, like "the input right of this label"?',
          a: 'There were CSS pseudo-classes such as `:right-of()`, `:left-of()`, `:above()`, `:below()` and `:near()`, but the docs mark them deprecated and say they may be removed. Layout depends on viewport and fonts, so these are fragile. Associate the input with its label (getByLabel) or scope by a shared container instead.',
        },
      ],
      pitfalls: [
        'Turning it into a dogmatic argument without evidence.',
        'Claiming XPath can pierce shadow DOM in Playwright.',
        'Over-weighting milliseconds of lookup time against maintenance cost.',
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
        'Read the markup the way assistive technology does: role + accessible name first. Classes and ids are only tie-breakers when no user-facing hook exists, and generated classes are never acceptable.',
      followUps: [
        {
          q: 'For element 3, which of the two options would you put in a page object, and why?',
          a: 'A parameterised method using the card filter, for example `addToCart(name)` that filters inventory cards by the product name and clicks the role-named button. It reads like the user story, works for any product without building test-id strings, and still verifies the visible button label. The product-specific test id is fine too, but it couples the page object to the app\'s id naming scheme.',
        },
      ],
    },
    {
      id: 'pw-locators-drill-2',
      question:
        'Given this DOM, predict for each line how many elements the locator matches and whether the line passes, throws a strict mode violation, or times out: `<nav><a href="/login">Login</a></nav> <main><h2>Login Page</h2><form><label for="u">Username</label><input id="u"><button type="submit">Login</button></form></main> <footer><a href="/help">Login help</a></footer>`. (a) `await page.getByRole(\'link\', { name: \'Login\' }).click()` (b) `await page.getByText(\'Login\').click()` (c) `await expect(page.getByRole(\'button\', { name: \'Login\' })).toBeVisible()` (d) `await expect(page.getByRole(\'link\', { name: \'Login\', exact: true })).toHaveCount(1)` (e) `await page.getByLabel(\'Username\').fill(\'tomsmith\')` (f) `await page.getByRole(\'heading\', { name: \'Login\', level: 1 }).click()`',
      assumptions: [
        'Role names are case-insensitive substrings unless `exact: true`.',
        'getByText matches elements whose own text contains the string (substring, case-insensitive).',
        'Single-element operations throw on >1 match; counts and toHaveCount do not.',
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
        'Substring matching is the usual cause of surprise strict mode violations; `exact: true`, a more specific role, or scoping to a landmark (`getByRole(\'navigation\')`) resolves them. Zero matches never throw immediately; they wait until the timeout.',
      followUps: [
        {
          q: 'Rewrite (a) two different ways so it clicks only the header link.',
          a: 'Make the name exact: `page.getByRole(\'link\', { name: \'Login\', exact: true })`, or scope it to the landmark: `page.getByRole(\'navigation\').getByRole(\'link\', { name: \'Login\' })`. The scoped version also documents intent (the header link) and stays correct if another exact "Login" link is added to the footer later.',
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
        'The visible text is not always the name: aria-label and aria-labelledby override it. When a role locator surprisingly fails, inspect the computed name in DevTools\' Accessibility pane or with Pick locator instead of guessing.',
      followUps: [
        {
          q: 'In element 1, would `getByRole(\'button\', { name: \'Remove\' })` match? Is that a problem?',
          a: 'Yes. "Remove" is a case-insensitive substring of "Remove Sauce Labs Backpack", so it matches, but it would also match every other product\'s Remove button, causing a strict mode violation when several items are in the cart. Use the full name, exact: true, or scope to the cart row. Note that the visible text "Remove" is ignored for the name because aria-label takes precedence.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-locators-mcq-01',
      difficulty: 'easy',
      question: 'Which locator does Playwright recommend as the first choice for interactive elements like buttons and links?',
      options: ['page.getByRole()', 'page.locator() with XPath', 'page.getByTestId()', 'page.locator() with CSS classes'],
      correct: [0],
      explanation:
        '`getByRole` matches how users and assistive technology perceive the page (role + accessible name), so it survives restyling and fails when labels break. Test ids are a good fallback when user-facing attributes are missing or unstable, while CSS classes and XPath are tied to implementation details and are last resorts.',
      followUps: [
        {
          q: 'When would you choose getByTestId over getByRole?',
          a: 'When the user-facing name is missing, unstable or not unique: translated UIs, CMS-driven text, icon-only buttons without accessible names, or many identical controls where a stable id on the row is clearer. Pair it with text assertions where wording matters, because a test id never verifies what users read.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-02',
      difficulty: 'easy',
      question: 'What does this line do in the browser?',
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
        'Locator factories are synchronous and do no browser work; the query runs each time `login` is used in an action or web-first assertion. Storing a node reference describes `page.$()` / ElementHandles. No waiting or throwing happens at creation; waiting happens during the later action, up to the relevant timeout.',
      followUps: [
        {
          q: 'So what happens if the button does not exist when you call `await login.click()`?',
          a: 'Playwright keeps re-resolving the locator and waiting for a match that passes the actionability checks. If none appears before the timeout (the test timeout, or actionTimeout if configured), the click fails with an error and a call log showing what it was waiting for.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-03',
      difficulty: 'medium',
      question: 'On the SauceDemo inventory page, six products each show an "Add to cart" button. What happens here?',
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
        'Single-element actions such as click require exactly one match; with six matches Playwright throws "strict mode violation… resolved to 6 elements". It never silently picks the first (that requires an explicit `.first()`), never clicks all of them, and does not wait for the count to drop: strictness errors are immediate.',
      followUps: [
        {
          q: 'Fix it to add only the Bolt T-Shirt.',
          a: 'Scope to that product card: `page.getByTestId(\'inventory-item\').filter({ hasText: \'Sauce Labs Bolt T-Shirt\' }).getByRole(\'button\', { name: \'Add to cart\' }).click()` with `testIdAttribute: \'data-test\'` configured. Or use the product-specific test id `add-to-cart-sauce-labs-bolt-t-shirt`.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-04',
      difficulty: 'medium',
      question: 'Which of these operations are allowed on a locator that matches several elements without causing a strict mode violation? Select ALL that apply.',
      options: [
        'await locator.count()',
        'await expect(locator).toHaveCount(3)',
        'await locator.allTextContents()',
        'await locator.fill(\'abc\')',
        'await expect(locator).toBeVisible()',
      ],
      correct: [0, 1, 2],
      explanation:
        '`count()`, `toHaveCount()` and `allTextContents()` are designed for multiple elements, so strictness does not apply. `fill()` acts on one element and `toBeVisible()` asserts on one element, so both throw when the locator matches more than one. This distinction is a frequent interview probe.',
      followUps: [
        {
          q: 'How do you assert the exact list of product names in order?',
          a: 'Use the array form of toHaveText on the multi-element locator: `await expect(page.getByTestId(\'inventory-item-name\')).toHaveText([\'Sauce Labs Backpack\', ...])`. It retries until all names match in order, unlike reading `allTextContents()` once and comparing with a generic expect.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-05',
      difficulty: 'medium',
      question: 'SauceDemo marks elements with `data-test="..."`. What makes `page.getByTestId(\'username\')` work?',
      options: [
        "Setting use: { testIdAttribute: 'data-test' } in playwright.config.ts",
        'Nothing: getByTestId matches any attribute that starts with data-test',
        "Writing getByTestId('data-test=username')",
        "Setting expect: { testId: 'data-test' } at the top level of the config",
      ],
      correct: [0],
      explanation:
        'getByTestId reads `data-testid` by default; `use.testIdAttribute` (or `selectors.setTestIdAttribute`) changes the attribute name. It does not prefix-match other attributes, it does not parse "attr=value" strings, and there is no `expect.testId` option.',
      followUps: [
        {
          q: 'How do you make codegen suggest getByTestId with data-test too?',
          a: 'Run `npx playwright codegen --test-id-attribute=data-test https://www.saucedemo.com`. Codegen then recognises `data-test` values and generates `getByTestId(...)` where it decides a test id is the best hook.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-06',
      difficulty: 'medium',
      question:
        'The page has two links: "About" and "About the company". Which locators match ONLY the "About" link? Select ALL that apply.',
      options: [
        "page.getByRole('link', { name: 'About', exact: true })",
        "page.getByRole('link', { name: /^About$/ })",
        "page.getByRole('link', { name: 'About' })",
        "page.getByRole('link', { name: 'about', exact: true })",
      ],
      correct: [0, 1],
      explanation:
        'With `exact: true` the name must equal "About" in full and with the same case, and the anchored regex `/^About$/` does the same. Without `exact`, the name is a case-insensitive substring, so "About" also matches "About the company". With `exact: true`, lowercase "about" does not match "About" because exact matching is case-sensitive.',
      followUps: [
        {
          q: 'Besides exact, what is another way to separate the two links?',
          a: 'Scope by where they live: `page.getByRole(\'navigation\').getByRole(\'link\', { name: \'About\' })` for a header link versus `page.getByRole(\'contentinfo\')` for the footer. Scoping by landmark is often more meaningful than tweaking the name match.',
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
        'Accessible names: "Close cart" (aria-label overrides the text "X"), "Close" (text content) and "Close dialog" (title, used only when nothing else names it). With `exact: true` only the name "Close" matches. Without exact, the substring rule would match all three and cause a strict mode violation. Title has the lowest priority, not the highest.',
      followUps: [
        {
          q: 'How can you see the accessible name the browser computed?',
          a: 'Open DevTools → Elements → Accessibility pane to see the computed role and name, or use Pick locator in codegen/UI mode, which shows the role-based locator Playwright would generate. `locator.ariaSnapshot()` also prints the accessibility tree as YAML for a region.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-08',
      difficulty: 'medium',
      question:
        'A test does `await page.getByText(\'Your content goes here.\').isVisible()` on https://the-internet.herokuapp.com/iframe and the text is never found, although it is clearly on screen. Why?',
      options: [
        'The text lives inside an iframe (the TinyMCE editor), so it must be located through page.frameLocator() or contentFrame()',
        'getByText cannot match text that ends with a period',
        'The text is in a closed shadow root, which no tool can access',
        'isVisible() only works with getByRole locators',
      ],
      correct: [0],
      explanation:
        'Page-level locators search the main frame only; the editor content is in a separate document inside an iframe, so you scope first with `page.frameLocator(\'#mce_0_ifr\')` or `page.locator(\'#mce_0_ifr\').contentFrame()`. Punctuation is fine for getByText, the editor is not a closed shadow root, and isVisible works with any locator (though it does not wait).',
      followUps: [
        {
          q: 'Why is isVisible() a poor choice here even after fixing the frame?',
          a: 'isVisible() checks once, immediately, without waiting, so it can return false while the editor is still loading. Use a web-first assertion instead: `await expect(page.frameLocator(\'#mce_0_ifr\').locator(\'#tinymce\')).toContainText(\'Your content goes here.\')`, which retries until it passes or the expect timeout ends.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-09',
      difficulty: 'hard',
      question: 'Which statements about shadow DOM support in Playwright locators are true? Select ALL that apply.',
      options: [
        'getByRole, getByText and CSS locators pierce open shadow roots automatically',
        'XPath locators do not pierce shadow roots',
        'Closed-mode shadow roots are not supported',
        'You must call a special pierce() method before locating inside any shadow root',
        'CSS locators require the >>> combinator to enter shadow DOM',
      ],
      correct: [0, 1, 2],
      explanation:
        'Playwright locators pierce open shadow DOM by default; the documented exceptions are XPath (does not pierce) and closed shadow roots (unsupported). There is no pierce() method, and no special `>>>` combinator is needed for Playwright CSS. That is a habit carried over from other tools.',
      followUps: [
        {
          q: 'Your test uses an XPath copied from DevTools for a Salesforce Lightning button and it never matches. What do you try?',
          a: 'Lightning components render inside shadow roots, so XPath cannot see the button. Switch to a user-facing locator such as `getByRole(\'button\', { name: \'Save\' })`, or short CSS, both of which pierce open shadow roots. Check the accessible name in DevTools if the role locator still fails.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-10',
      difficulty: 'hard',
      question: 'Why is this test flaky after the product list was made sortable?',
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
        'Positional locators encode the current order; when sorting or new products change it, the test acts on a different element and the generic badge assertion cannot notice, which is a false pass. nth() is zero-based (nth(2) is the third), it bypasses strictness rather than throwing, and chaining after nth() is allowed.',
      followUps: [
        {
          q: 'How would you rewrite it, and what assertion proves the right product was added?',
          a: 'Filter by the product name: `cards.filter({ hasText: \'Sauce Labs Onesie\' }).getByRole(\'button\', { name: \'Add to cart\' }).click()`. Then assert that the same card now shows a Remove button, and on the cart page that `getByTestId(\'inventory-item-name\')` has text `[\'Sauce Labs Onesie\']`. The badge alone only proves that something was added.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-11',
      difficulty: 'medium',
      question: 'You need the "Edit" link in the table row for "Jason Doe". Which locator expresses that most robustly?',
      options: [
        "page.getByRole('row').filter({ hasText: 'Jason' }).getByRole('link', { name: 'edit' })",
        "page.locator('table tr:nth-child(4) td:last-child a').first()",
        "page.getByRole('link', { name: 'edit' }).nth(3)",
        "page.locator('//td[text()=\"Jason\"]/following-sibling::td[5]/a[1]')",
      ],
      correct: [0],
      explanation:
        'Filtering rows by the visible value and then finding the link by name inside that row mirrors how a user finds it and survives re-ordering. The nth-child CSS and nth(3) depend on row position, and the XPath depends on column position and an exact text() match, so all three break on layout or data changes.',
      followUps: [
        {
          q: 'What if two rows contain "Jason"?',
          a: 'Make the filter more specific: use a unique value such as the email (`hasText: \'jdoe@hotmail.com\'`), or filter with `has: page.getByRole(\'cell\', { name: \'Jason\', exact: true })` and add a second filter for the last name. A `toHaveCount(1)` guard before clicking documents the assumption.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-12',
      difficulty: 'easy',
      question: 'How does Playwright treat the string passed to page.locator() here?',
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
        'Playwright auto-detects selectors: strings starting with `//` or `..` are XPath, others are CSS. The `css=` and `xpath=` prefixes are optional. XPath is still supported (just discouraged in favour of user-facing locators), and brackets are valid in both CSS attribute selectors and XPath predicates.',
      followUps: [
        {
          q: 'Which user-facing locator would you use instead for that submit button?',
          a: 'Whatever its accessible name is, for example `page.getByRole(\'button\', { name: \'Login\' })`. A submit input or button exposes the button role, and naming it also verifies the label users see. If the form has several submit buttons, scope to the form or dialog first.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-13',
      difficulty: 'hard',
      question:
        'A responsive site renders two "Menu" buttons: one in the desktop header (visible) and one in a mobile drawer collapsed to zero width and height (still in the accessibility tree, not display:none). `page.getByRole(\'button\', { name: \'Menu\' }).click()` throws a strict mode violation on desktop. Which fixes are reasonable? Select ALL that apply.',
      options: [
        "page.getByRole('button', { name: 'Menu' }).filter({ visible: true })",
        "Scope to the desktop header: page.getByRole('banner').getByRole('button', { name: 'Menu' })",
        "page.getByRole('button', { name: 'Menu' }).nth(1) because the mobile copy is always second",
        "page.getByRole('button', { name: 'Menu', includeHidden: true })",
      ],
      correct: [0, 1],
      explanation:
        'Filtering to visible elements or scoping to the container that only holds the desktop control both remove the ambiguity based on meaning. `nth(1)` depends on DOM order, which can differ between templates. `includeHidden: true` makes things worse by also including elements hidden from the accessibility tree. Note why the violation happens at all: getByRole already skips display:none and aria-hidden elements, but a zero-size element stays in the accessibility tree while failing Playwright\'s visibility check.',
      followUps: [
        {
          q: 'How would you test the mobile menu then?',
          a: 'Run the same test in a mobile project (for example `...devices[\'iPhone 13\']`), where the mobile button is visible and the desktop one hidden. The visible-filter or landmark-scoped locator then resolves to the right button in each project, so one test covers both layouts.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-14',
      difficulty: 'expert',
      question:
        'An "or" locator is used to handle either a cookie banner or a promo dialog. Why does the assertion sometimes fail with a strict mode violation, and what is the fix?',
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
        'A locator built with or() matches elements from either side; when both the banner and the dialog are present it resolves to two elements, and toBeVisible() is strict. Since "either is visible" is the actual requirement, `.first()` is the documented, legitimate fix. or() works as a top-level locator, applies to both sides, and does not require matching roles.',
      followUps: [
        {
          q: 'After the assertion, how would you dismiss whichever one appeared?',
          a: 'Check which one is present with a non-retrying query now that one is known to be visible, e.g. `if (await promo.isVisible()) await promo.getByRole(\'button\', { name: \'Close\' }).click();` and similarly for the banner. For overlays that can appear at random times, `page.addLocatorHandler()` registers a handler that dismisses them automatically before actions.',
        },
      ],
    },
    {
      id: 'pw-locators-mcq-15',
      difficulty: 'expert',
      question: 'Which statements about filter() are correct? Select ALL that apply.',
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
        'hasText is case-insensitive substring matching, so "backpack" finds "Sauce Labs Backpack". The inner locator for has/hasNot is evaluated relative to each candidate even though it is written from `page`, so b and d work as described. hasNotText works on its own and here would match no cards (all names contain "Sauce Labs"), and using `page.getBy...` inside has is the documented pattern, so it does not throw.',
      followUps: [
        {
          q: 'What constraint applies to the inner locator in has / hasNot?',
          a: 'It must be in the same frame as the outer locator and cannot contain frame locators. It is matched relative to each outer element, so it should describe a descendant (for example a button or a name element), not a path starting from the document root.',
        },
      ],
    },
  ],
};

export default topic;
