import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-pom-data',
  phase: 'pw-framework',
  order: 2,
  title: 'Page Objects & Test Data',
  subtitle:
    'Structure a real framework: page and component objects for SauceDemo, page objects delivered by fixtures, a sensible folder layout, and test data that is environment-aware, data-driven, unique per test and cleaned up through the API.',
  estimatedMinutes: 95,
  sources: [
    'Playwright docs — Page object models (playwright.dev/docs/pom)',
    'Playwright docs — Fixtures: creating a fixture with a page object (playwright.dev/docs/test-fixtures)',
    'Playwright docs — Parameterize tests (playwright.dev/docs/test-parameterize)',
    'Playwright docs — Parallelism: isolation and unique test data (playwright.dev/docs/test-parallel)',
    'Checkly blog — Combine Page Object Models and fixtures for DRYer test code (Nočnica Mellifera)',
    'Martin Fowler — PageObject (martinfowler.com/bliki/PageObject.html)',
    'Faker.js docs — Usage (fakerjs.dev/guide/usage)',
    'Restful Booker API docs (restful-booker.herokuapp.com/apidoc)',
    'testdino.com and bug0.com — Playwright Page Object Model / fixtures guides',
    'SauceDemo public demo site (www.saucedemo.com)',
  ],
  tags: ['playwright', 'page-object-model', 'component-object', 'fixtures', 'test-data', 'faker', 'data-driven', 'parameterize', 'cleanup', 'framework-structure'],
  cheatSheet: [
    'Page object = a class that wraps one page: constructor(page), readonly Locator fields, async methods named after user intent (login, addToCart). Selectors live in ONE place.',
    'Locators are lazy, so creating them in the constructor is safe before the page loads; never store innerText()/count() results in fields.',
    'Expose locators so tests can assert with web-first expect(); avoid boolean helpers like isLoggedIn() returning isVisible().',
    'Assertions: keep business outcomes in tests; page objects may only assert "this page/step is ready" (wait for title, URL).',
    'Deliver page objects with fixtures: base.extend({ loginPage: async ({ page }, use) => use(new LoginPage(page)) }) so tests just write ({ loginPage }).',
    'Component objects wrap repeated UI parts (header, product card, modal) and are composed into page objects; scope their locators to a root locator.',
    'Folder layout: pages/ (POM), components/, fixtures/, data/, utils/ (api helpers), tests/ (specs by feature), playwright.config.ts, .env (gitignored).',
    'Test data: static JSON for reference data, env-specific files picked by TEST_ENV, secrets only in env vars, Faker for unique dynamic data (faker.seed(n) to reproduce).',
    'Data-driven tests: for (const row of rows) test(`... ${row.name}`, ...) at file level; titles must be unique; hooks outside the loop run once per test as usual.',
    'Unique data per test (Faker, testInfo.testId) avoids parallel collisions; never mutate imported JSON (modules are cached per worker).',
    'Clean up in fixture teardown via API (runs even on failure); Restful Booker: POST /auth → token, DELETE /booking/:id with Cookie token=… → 201.',
  ],
  sections: [
    {
      heading: 'Page Object Model: what it is and why teams use it',
      body: `**Intuition:** a page object is a TV remote for one screen of your app. Tests press buttons named "login" or "add to cart"; they do not care which wires (selectors) are behind each button. When the wiring changes, you fix the remote once, not every test.

**Definition.** The Page Object Model (POM) is a design pattern where each page (or significant part of a page) gets a class that:
- holds the **locators** for that page, defined once;
- exposes **methods** that perform user actions on that page (\`login(user, pass)\`, \`addToCart(name)\`);
- hides HTML details from the tests, so specs read like test cases.

The Playwright docs give two reasons: page objects **simplify authoring** (a higher-level API that fits your app) and **simplify maintenance** (selectors in one place). Martin Fowler's original description adds a useful rule: a page object should model what a *user* can do and see, not the HTML structure.

| Without POM | With POM |
|---|---|
| \`#user-name\` copied into 40 specs | one \`username\` locator in \`LoginPage\` |
| Login selector change → 40 edits | Login selector change → 1 edit |
| Specs read like DOM scripts | Specs read like \`loginPage.login(user)\` |
| Hard for manual testers to review | Reviewable as test steps |

**When NOT to over-engineer:** a 10-test suite on one page does not need a class hierarchy. Start with one class per page; extract components and base classes only when duplication appears.

**In interviews, say this:** "POM separates *what* the test checks from *how* the page is driven. Locators and actions live in page classes, assertions about the business outcome live in the spec, and fixtures hand the page objects to tests."`,
      diagram: `   spec (what to verify)            page objects (how to drive the UI)
 +------------------------+       +---------------------------+
 | test('checkout works') | ----> | LoginPage.login(user)     |
 |   loginPage.login()    |       | InventoryPage.add(name)   |
 |   inventory.add(...)   |       | CartPage.checkout()       |
 |   expect(cart.items)   |       +-------------+-------------+
 +------------------------+                     |
                                         locators (selectors)
                                                |
                                         SauceDemo DOM`,
      keyPoints: [
        'One class per page/area: locators + user-intent methods.',
        'Selectors change in one place; specs stay readable.',
        'Do not build deep hierarchies before duplication appears.',
      ],
      source: 'Playwright docs — Page object models; Martin Fowler — PageObject',
    },
    {
      heading: 'Building a LoginPage for SauceDemo',
      body: `**Intuition:** start with the screen every test touches first.

The usual Playwright shape (it matches the official POM guide):
- \`constructor(page: Page)\` stores the page and creates **\`readonly\` Locator fields**.
- **Async methods** for actions (\`goto\`, \`login\`).
- Locators exposed as public fields so a test can assert on them.

Why locators in the constructor are safe: a Locator is **lazy**. \`page.getByPlaceholder('Username')\` does not search the DOM when it is created; it searches every time you act or assert. So you can build all locators before \`goto()\`.

SauceDemo details worth knowing: the inputs have placeholders "Username" and "Password", the button is an \`<input type="submit" value="Login">\` (so \`getByRole('button', { name: 'Login' })\` works), and every element also has a \`data-test\` attribute. Setting \`testIdAttribute: 'data-test'\` in the config lets you use \`getByTestId('username')\`.

**Common mistakes:**
- Storing text instead of locators: \`this.errorText = await page.locator('...').textContent()\` (you cannot await in a constructor, and the value would be stale).
- Methods that return booleans for assertions (\`isErrorShown()\` → \`isVisible()\`), which do not auto-wait. Expose the locator and let the test use \`expect(loginPage.error).toBeVisible()\`.`,
      code: [
        {
          language: 'typescript',
          title: 'pages/LoginPage.ts',
          code: `import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    // lazy: nothing is looked up until an action or assertion runs
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('/'); // baseURL = https://www.saucedemo.com
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}`,
        },
        {
          language: 'typescript',
          title: 'tests/login.spec.ts',
          code: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('locked out user sees an error', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('locked_out_user', process.env.SAUCE_PASS!);
  // the business assertion stays in the test
  await expect(loginPage.error).toHaveText(/Sorry, this user has been locked out/);
});`,
        },
      ],
      keyPoints: [
        'constructor(page) + readonly locators + async action methods.',
        'Locators are lazy: safe to create before navigation.',
        'Expose locators for web-first assertions; avoid boolean helpers.',
      ],
      source: 'Playwright docs — Page object models; Locators (lazy evaluation)',
    },
    {
      heading: 'InventoryPage and CartPage: methods that model user intent',
      body: `**Intuition:** name methods after what a user wants ("add the backpack"), not after what the code does ("click the third button").

Design guidelines for action methods:
- **Parameterise by business data**, not by index: \`addToCart('Sauce Labs Backpack')\` beats \`clickAddButton(0)\`.
- **Find rows by text then act inside them**: \`items.filter({ hasText: name }).getByRole('button', { name: 'Add to cart' })\`. This survives re-ordering.
- **Return data when the test needs it** (\`itemNames()\` returning \`allTextContents()\`), but keep checks in the test.
- **Return the next page object** only if it makes flows clearer (\`openCart(): Promise<CartPage>\`). It is optional; with fixtures most teams simply request both page objects.
- **Wait for readiness, not for time.** If a method navigates, end it by waiting for something that proves the new page is ready (e.g. the title). Never \`waitForTimeout\`.

SauceDemo facts used below: product cards are \`[data-test="inventory-item"]\`, names \`[data-test="inventory-item-name"]\`, the page title \`[data-test="title"]\` reads "Products" or "Your Cart", the cart link is \`[data-test="shopping-cart-link"]\` and the badge \`[data-test="shopping-cart-badge"]\`.`,
      code: [
        {
          language: 'typescript',
          title: 'pages/InventoryPage.ts and pages/CartPage.ts',
          code: `import { expect, type Page, type Locator } from '@playwright/test';

export class InventoryPage {
  readonly title: Locator;
  readonly items: Locator;
  readonly sort: Locator;

  constructor(readonly page: Page) {
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.sort = page.locator('[data-test="product-sort-container"]');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await expect(this.title).toHaveText('Products'); // readiness check, not a business assertion
  }

  async addToCart(productName: string) {
    await this.items.filter({ hasText: productName })
      .getByRole('button', { name: 'Add to cart' }).click();
  }

  async sortBy(label: 'Name (A to Z)' | 'Price (low to high)' | 'Price (high to low)') {
    await this.sort.selectOption({ label });
  }

  itemNames() {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }
}

export class CartPage {
  readonly items: Locator;
  readonly checkoutButton: Locator;

  constructor(readonly page: Page) {
    this.items = page.locator('[data-test="inventory-item-name"]');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  async goto() {
    await this.page.goto('/cart.html');
  }
}`,
        },
      ],
      keyPoints: [
        'Methods take business data (product name), not indexes.',
        'filter({ hasText }) + scoped getByRole survives layout changes.',
        'Navigation methods end with a readiness wait, never a sleep.',
      ],
      source: 'Playwright docs — Page object models; Locators: filtering',
    },
    {
      heading: 'Wiring page objects into fixtures',
      body: `**Intuition:** instead of every test saying "build me a LoginPage, build me an InventoryPage", the fixture is a waiter who brings the page objects you ordered.

Writing \`new LoginPage(page)\` in each test is repetitive. Combine POM with fixtures (the pattern the Playwright fixtures guide and Checkly's article recommend):

1. In \`fixtures/pages.ts\`, extend the base test with one fixture per page object.
2. A fixture can do setup too: \`inventoryPage\` can log in and navigate before handing the object over.
3. Specs import \`test\`/\`expect\` from the fixtures file and destructure what they need.

Benefits: zero boilerplate in specs, lazy creation (a test that only needs \`cartPage\` never builds the others), and one place to change how pages are prepared, for example switching from UI login to \`storageState\` later without touching tests.

**Tip:** keep page objects as **plain classes** with no knowledge of fixtures. Fixtures own construction and lifecycle; page objects own selectors and actions. That keeps each piece simple and testable.`,
      code: [
        {
          language: 'typescript',
          title: 'fixtures/pages.ts',
          code: `import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage, CartPage } from '../pages/InventoryPage';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  // depends on loginPage: logs in, then hands over a ready inventory page
  inventoryPage: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.login(process.env.SAUCE_USER!, process.env.SAUCE_PASS!);
    const inventory = new InventoryPage(page);
    await expect(inventory.title).toHaveText('Products');
    await use(inventory);
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect };`,
        },
        {
          language: 'typescript',
          title: 'tests/cart/add-to-cart.spec.ts',
          code: `import { test, expect } from '../../fixtures/pages';

test('added product appears in the cart', async ({ inventoryPage, cartPage }) => {
  await inventoryPage.addToCart('Sauce Labs Backpack');
  await cartPage.goto();
  await expect(cartPage.items).toHaveText(['Sauce Labs Backpack']);
});`,
        },
      ],
      keyPoints: [
        'One fixture per page object; specs destructure what they need.',
        'Fixtures can depend on each other (inventoryPage uses loginPage).',
        'Page objects stay plain classes; fixtures own lifecycle.',
      ],
      source: 'Playwright docs — Fixtures (todoPage example); Checkly blog — POM + fixtures',
    },
    {
      heading: 'Component objects: header, product card, modals',
      body: `**Intuition:** pages share furniture. The SauceDemo header (menu, cart icon) is on every page, and every product card has the same name/price/button layout. Model the furniture once.

A **component object** is a small class wrapping a reusable UI part. Two rules make components robust:
1. **Scope to a root locator.** The component receives a \`Locator\` (its root) and builds child locators from it, so \`card.addButton\` can never click a button in another card.
2. **Compose, don't inherit.** A page *has a* header (\`this.header = new Header(page)\`); avoid deep \`BasePage → AuthedPage → InventoryPage\` inheritance chains where it is unclear what comes from where.

When to create a component: the same group of elements appears on 2+ pages, or a list of repeated items (cards, table rows) needs per-item actions.`,
      code: [
        {
          language: 'typescript',
          title: 'components/Header.ts and components/ProductCard.ts',
          code: `import { type Page, type Locator } from '@playwright/test';

export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
  }

  async openCart() {
    await this.cartLink.click();
  }
}

export class ProductCard {
  readonly name: Locator;
  readonly price: Locator;
  readonly addButton: Locator;

  // root = one [data-test="inventory-item"]; children are scoped to it
  constructor(readonly root: Locator) {
    this.name = root.locator('[data-test="inventory-item-name"]');
    this.price = root.locator('[data-test="inventory-item-price"]');
    this.addButton = root.getByRole('button', { name: 'Add to cart' });
  }
}

// usage inside InventoryPage:
//   this.header = new Header(page);
//   card(name: string) { return new ProductCard(this.items.filter({ hasText: name })); }`,
        },
      ],
      keyPoints: [
        'Components wrap repeated UI and are composed into pages.',
        'Scope child locators to the component root locator.',
        'Prefer composition over deep BasePage inheritance.',
      ],
      source: 'Playwright docs — Locators: chaining and filtering; Martin Fowler — PageObject (page objects for fragments)',
    },
    {
      heading: 'Assertions in page objects: the debate',
      body: `**Intuition:** a page object is a driver, the test is the judge. Drivers can check "the road is open" before driving; only the judge decides if the trip met the goal.

| Approach | For | Against |
|---|---|---|
| **No assertions in page objects** (Fowler's view) | single responsibility; tests show every check; page objects reusable for positive and negative tests | readiness waits must still happen somewhere |
| **Assertions inside page methods** | shorter specs; the official POM guide's \`getStarted()\` asserts a heading | hidden checks; a \`login()\` that asserts success cannot be reused for the "wrong password" test |
| **Middle ground (most teams)** | page methods may assert **readiness** ("cart page loaded"), tests assert **business outcomes** | needs a team convention |

The middle ground in practice:
- \`InventoryPage.goto()\` ends with \`expect(this.title).toHaveText('Products')\`: a readiness guard that makes later steps reliable.
- \`LoginPage.login()\` does **not** assert success, because the locked-out test reuses it.
- The spec asserts what the test case is about: cart contents, error text, sort order.
- Page objects **expose locators** so specs can assert with web-first \`expect()\` and the failure message points at the spec line.

**Red flags in page objects:** \`waitForTimeout\`, \`try { ... } catch {}\` that swallows failures, methods returning \`isVisible()\` booleans, test data hard-coded inside methods, \`expect\` on business values ("total is $32.39").

**In interviews, say this:** "Business assertions live in the test so the test reads as a test case. A page object may verify it reached the right page, because that is part of performing the action reliably."`,
      keyPoints: [
        'Tests own business assertions; page objects may assert readiness.',
        'A login() that asserts success cannot serve negative tests.',
        'Expose locators; avoid boolean isX() helpers.',
      ],
      source: 'Martin Fowler — PageObject; Playwright docs — Page object models',
    },
    {
      heading: 'Framework folder structure',
      body: `**Intuition:** a good folder structure is like a well-labelled kitchen: anyone new can find the knives without asking.

A layout that scales for a SauceDemo UI + Restful Booker API framework:

| Folder / file | Holds | Rule |
|---|---|---|
| \`tests/\` | specs grouped by feature (\`auth/\`, \`cart/\`, \`checkout/\`, \`api/\`) | only test logic and assertions |
| \`pages/\` | page objects | locators + actions, no test data |
| \`components/\` | header, product card, modals | scoped to a root locator |
| \`fixtures/\` | \`test.extend\` files, merged into one \`index.ts\` | specs import \`test\` from here |
| \`data/\` | static JSON (products, users without passwords), per-env files | no secrets |
| \`utils/\` or \`api/\` | API clients, data builders, Faker factories | pure helpers |
| \`playwright.config.ts\` | runner config and projects | env-driven values |
| \`.env\` / \`.env.example\` | local secrets / documented keys | \`.env\` gitignored |
| \`playwright/.auth/\` | saved storageState files | gitignored |

Conventions that keep it healthy: one page object per file named after the page, specs named \`*.spec.ts\`, setup files \`*.setup.ts\`, no spec imports another spec, and no relative-path spaghetti (a TS path alias like \`@pages/*\` helps).`,
      diagram: `qa-framework/
|-- playwright.config.ts
|-- .env.example            (SAUCE_USER=, SAUCE_PASS=, TEST_ENV=)
|-- data/
|   |-- products.json
|   '-- env/  qa.json  staging.json
|-- pages/      LoginPage.ts  InventoryPage.ts  CartPage.ts
|-- components/ Header.ts  ProductCard.ts
|-- fixtures/   pages.ts  data.ts  index.ts (mergeTests)
|-- utils/      bookingApi.ts  factories.ts
|-- tests/
|   |-- auth.setup.ts
|   |-- auth/   login.spec.ts
|   |-- cart/   add-to-cart.spec.ts
|   '-- api/    booking.spec.ts
'-- playwright/.auth/       (gitignored)`,
      keyPoints: [
        'Specs by feature; pages, components, fixtures, data, utils separated.',
        'Secrets in env vars; .env and .auth gitignored.',
        'Specs import test from fixtures/index.ts (mergeTests).',
      ],
      source: 'Playwright docs — Fixtures (mergeTests), Authentication (.auth gitignore); community framework write-ups',
    },
    {
      heading: 'Test data management: JSON, environment data and Faker',
      body: `**Intuition:** test data comes in three flavours, like ingredients: pantry staples (static reference data), recipes that change by kitchen (environment data), and fresh produce bought per meal (dynamic unique data).

| Kind | Example | Store it in | Watch out |
|---|---|---|---|
| Static reference | product names and prices on SauceDemo | \`data/products.json\` | update when the product catalogue changes |
| Environment-specific | base URLs, existing customer ids on QA vs staging | \`data/env/qa.json\`, chosen by \`TEST_ENV\` | never secrets in JSON |
| Secrets | passwords, API keys | env vars (\`.env\` locally, CI secrets in pipelines) | \`.env\` must be gitignored |
| Dynamic / unique | new booking names, emails | generated per test (Faker, \`testInfo.testId\`) | log it so failures are reproducible |

**Faker** (\`@faker-js/faker\`) generates realistic data: \`faker.person.firstName()\`, \`faker.internet.email()\`, \`faker.string.uuid()\`, \`faker.date.soon()\`, \`faker.helpers.arrayElement([...])\`. Use the \`person\` module for names (older tutorials use \`faker.name\`, which belongs to older versions). \`faker.seed(123)\` makes the sequence repeatable, handy to reproduce a failure, but a fixed seed in every worker gives every worker the **same** values, so do not rely on a seed for uniqueness.

**Data builders / factories** wrap Faker so tests only override what matters: \`buildBooking({ depositpaid: false })\`.

**Trap:** \`import products from '../data/products.json'\` gives every test in a worker the **same object** (modules are cached). If one test mutates it, later tests in that worker see the change. Treat imported data as read-only, or copy it with \`structuredClone()\` before changing.`,
      code: [
        {
          language: 'typescript',
          title: 'utils/factories.ts and env-based data',
          code: `import { faker } from '@faker-js/faker';
import qa from '../data/env/qa.json' with { type: 'json' };
import staging from '../data/env/staging.json' with { type: 'json' };

// pick environment data by TEST_ENV (default: qa)
const envData = { qa, staging };
export const env = envData[(process.env.TEST_ENV ?? 'qa') as keyof typeof envData];

export type Booking = {
  firstname: string; lastname: string; totalprice: number; depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string }; additionalneeds?: string;
};

// factory: realistic, unique defaults; tests override only what they care about
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 });
  const checkout = new Date(checkin.getTime() + 2 * 24 * 60 * 60 * 1000);
  return {
    firstname: faker.person.firstName(),
    lastname: \`qa-\${faker.string.alphanumeric(8)}\`, // prefix marks test data
    totalprice: faker.number.int({ min: 50, max: 500 }),
    depositpaid: true,
    bookingdates: {
      checkin: checkin.toISOString().slice(0, 10),
      checkout: checkout.toISOString().slice(0, 10),
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout']),
    ...overrides,
  };
}
// buildBooking({ depositpaid: false }) → { firstname: 'Maya', lastname: 'qa-x8K2pQ1z', ... }`,
        },
      ],
      keyPoints: [
        'Static JSON, per-env JSON (TEST_ENV), secrets in env vars, dynamic data via Faker.',
        'Factories with overrides keep tests short and intention-revealing.',
        'Imported JSON is a shared cached object per worker: never mutate it.',
      ],
      source: 'Faker.js docs — Usage; Playwright docs — Parameterize tests (env variables)',
    },
    {
      heading: 'Data-driven and parameterised tests',
      body: `**Intuition:** one test recipe, many ingredient lists. Instead of writing "login as standard_user", "login as problem_user", "login as performance_glitch_user" by hand, loop over a table.

**How Playwright does it (official parameterize guide):**
- Loop at **file level** (or inside a describe) with \`for...of\` or \`forEach\`, calling \`test()\` once per row. Each row becomes a separate test in the report, retried and parallelised independently.
- **Titles must be unique**: put the row's key in the title, e.g. a title template like \`login as \${user}\` (written with backticks in code). Duplicate titles cause an error.
- Hooks declared outside the loop behave normally (beforeEach runs before each generated test). To get hooks per row, wrap each iteration in its own \`test.describe\`.
- Data can come from an inline array, a JSON file or a CSV (parse it with \`csv-parse/sync\`, \`columns: true\`).
- For whole-suite variations (run everything as admin and as user), use **parameterised projects**: an option fixture (\`[default, { option: true }]\`) set differently per project.

**Do not** loop *inside* one test over 20 rows: the first failure stops the rest, the report shows one test, and retries repeat all rows.

**Worked example:** SauceDemo login outcomes as a decision table. Note \`performance_glitch_user\` logs in slowly, so its expected result is still "Products" (auto-waiting handles the delay; the test timeout is the limit).`,
      code: [
        {
          language: 'typescript',
          title: 'tests/auth/login-matrix.spec.ts',
          code: `import { test, expect } from '../../fixtures/pages';

const cases = [
  { user: 'standard_user',           expect: 'inventory' },
  { user: 'locked_out_user',         expect: 'locked out' },
  { user: 'problem_user',            expect: 'inventory' },
  { user: 'performance_glitch_user', expect: 'inventory' },
  { user: 'unknown_user',            expect: 'do not match' },
] as const;

for (const c of cases) {
  // unique title per row → separate test, separate retry, separate report line
  test(\`login as \${c.user} → \${c.expect}\`, async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(c.user, process.env.SAUCE_PASS!);
    if (c.expect === 'inventory') {
      await expect(page).toHaveURL(/inventory\\.html/);
    } else {
      await expect(loginPage.error).toContainText(c.expect);
    }
  });
}`,
        },
      ],
      keyPoints: [
        'One test() per data row at file/describe level; unique titles.',
        'Each row is independent: own retry, own report line, can run in parallel.',
        'Suite-wide variations → parameterised projects with option fixtures.',
      ],
      source: 'Playwright docs — Parameterize tests (forEach, CSV, parameterized projects)',
    },
    {
      heading: 'Unique data per test and cleanup via API',
      body: `**Intuition:** in a shared kitchen, label your food with your name and throw away your leftovers. Parallel tests share one backend; unique names prevent collisions and cleanup prevents the database from filling with junk.

**Unique data rules:**
- Generate names per test (Faker, \`testInfo.testId\`), with a recognisable prefix (\`qa-\`) so leftover data can be found and swept.
- Never search for "the first booking"; search for *your* booking by its unique field or id.
- Per-worker resources (accounts) use \`parallelIndex\`; per-test data uses unique values.

**Cleanup rules:**
- **Prefer API over UI** for setup and cleanup: it is faster and not flaky.
- Put cleanup in **fixture teardown** (after \`await use()\`) or \`afterEach\`. Both run when the test fails; the last line of a test does not.
- Make cleanup **tolerant**: if the test already deleted the record, a 404 in teardown is fine.
- Add a **safety net**: a teardown project or nightly job that deletes everything with the \`qa-\` prefix.

**Restful Booker specifics** (from its API docs): \`POST /auth\` with \`{ "username": "admin", "password": "password123" }\` returns \`{ token }\`; \`POST /booking\` returns \`{ bookingid, booking }\`; \`DELETE /booking/:id\` needs \`Cookie: token=<token>\` (or Basic auth) and answers **201 Created** (a quirk worth knowing); a deleted booking then returns 404. Admin credentials should still come from env vars in a real framework.`,
      code: [
        {
          language: 'typescript',
          title: 'fixtures/data.ts: create via API, always delete in teardown',
          code: `import { test as base, expect } from '@playwright/test';
import { buildBooking, type Booking } from '../utils/factories';

const API = 'https://restful-booker.herokuapp.com';

export const test = base.extend<{ booking: { id: number; data: Booking } }, { apiToken: string }>({
  // once per worker: admin token for cleanup
  apiToken: [async ({ playwright }, use) => {
    const api = await playwright.request.newContext({ baseURL: API });
    const res = await api.post('/auth', {
      data: { username: process.env.RB_USER ?? 'admin', password: process.env.RB_PASS ?? 'password123' },
    });
    await use((await res.json()).token);
    await api.dispose();
  }, { scope: 'worker' }],

  booking: async ({ request, apiToken }, use) => {
    const data = buildBooking();
    const res = await request.post(\`\${API}/booking\`, { data });
    expect(res.ok(), 'setup: create booking').toBeTruthy();
    const { bookingid } = await res.json();

    await use({ id: bookingid, data }); // test runs here

    // teardown runs even if the test failed
    const del = await request.delete(\`\${API}/booking/\${bookingid}\`, {
      headers: { Cookie: \`token=\${apiToken}\` },
    });
    expect([201, 404]).toContain(del.status()); // 404 = test already deleted it
  },
});

export { expect };`,
        },
      ],
      keyPoints: [
        'Unique, prefixed data per test; find records by id, not position.',
        'Cleanup in fixture teardown/afterEach, via API, tolerant of 404.',
        'Restful Booker DELETE needs Cookie token=… and returns 201.',
      ],
      source: 'Restful Booker API docs; Playwright docs — Parallelism (unique data), Fixtures (worker scope)',
    },
  ],
  codeChallenges: [
    {
      id: 'pw-pom-data-cc-1',
      title: 'The god page object with assertions and sleeps',
      context:
        'A junior engineer wrote one "SaucePage" class used by every spec. It is 400 lines long; here is a representative slice. Tests using it are slow and randomly fail, and the locked-out-user test cannot reuse login().',
      task:
        'Split it into focused page objects with lazy locators, remove the sleeps and hidden business assertions, stop hard-coding credentials, and make the methods reusable for both positive and negative tests.',
      starter: {
        language: 'typescript',
        title: 'pages/SaucePage.ts (before)',
        code: `import { expect, type Page } from '@playwright/test';

export class SaucePage {
  constructor(private page: Page) {}

  async login() {
    await this.page.goto('https://www.saucedemo.com/');
    await this.page.fill('#user-name', 'standard_user');
    await this.page.fill('#password', 'secret_sauce');
    await this.page.click('#login-button');
    await this.page.waitForTimeout(3000);
    expect(await this.page.isVisible('.inventory_list')).toBe(true);
  }

  async addFirstItem() {
    await this.page.click('(//button[text()="Add to cart"])[1]');
    await this.page.waitForTimeout(1000);
  }

  async isCartCount(n: number) {
    return (await this.page.textContent('.shopping_cart_badge')) === String(n);
  }

  async checkout() {
    await this.page.click('.shopping_cart_link');
    await this.page.waitForTimeout(2000);
    await this.page.click('#checkout');
    expect(await this.page.textContent('.title')).toBe('Checkout: Your Information');
  }
}`,
      },
      hints: [
        'Which parts belong to which screen? Login, inventory and cart are different pages; the cart badge is a header component.',
        'Make locators readonly fields built in the constructor, and let methods accept data (username, password, product name).',
        'Replace every waitForTimeout with a web-first wait for the thing that proves the next state, and move the business assertions to the spec. Return locators instead of booleans.',
      ],
      solution: {
        language: 'typescript',
        title: 'pages/*.ts + spec (after)',
        code: `import { expect, type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly username: Locator; readonly password: Locator;
  readonly submit: Locator; readonly error: Locator;
  constructor(readonly page: Page) {
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.submit = page.getByRole('button', { name: 'Login' });
    this.error = page.locator('[data-test="error"]');
  }
  async goto() { await this.page.goto('/'); }
  async login(user: string, pass: string) {   // no assertion: reusable for negative tests
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }
}

export class InventoryPage {
  readonly title: Locator; readonly items: Locator; readonly cartBadge: Locator;
  constructor(readonly page: Page) {
    this.title = page.locator('[data-test="title"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  }
  async addToCart(name: string) {
    await this.items.filter({ hasText: name }).getByRole('button', { name: 'Add to cart' }).click();
  }
  async openCart() {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
    await expect(this.title).toHaveText('Your Cart'); // readiness, not business
  }
}

// tests/cart/badge.spec.ts
// test('badge counts added items', async ({ loginPage, page }) => {
//   await loginPage.goto();
//   await loginPage.login(process.env.SAUCE_USER!, process.env.SAUCE_PASS!);
//   const inventory = new InventoryPage(page);
//   await inventory.addToCart('Sauce Labs Backpack');
//   await expect(inventory.cartBadge).toHaveText('1');
// });`,
      },
      explanation: `- **Split by page:** \`LoginPage\` and \`InventoryPage\` (a \`Header\` component is the next refactor) instead of one 400-line class. Smaller classes are easier to review and change.
- **Lazy readonly locators** defined once; user-facing locators (\`getByPlaceholder\`, \`getByRole\`) and \`data-test\` attributes replace the positional XPath \`(//button...)[1]\`, which breaks when products are re-ordered.
- **Data in, not hard-coded:** \`login(user, pass)\` serves standard, locked-out and invalid-password tests. Credentials come from env vars.
- **No sleeps:** 6 s of \`waitForTimeout\` per flow removed. Playwright auto-waits for actions, and \`openCart\` waits for the "Your Cart" title.
- **No hidden business assertions / no booleans:** \`isCartCount()\` returned a one-shot boolean (no retry) and \`isVisible()\` does not wait. Tests now assert \`expect(inventory.cartBadge).toHaveText('1')\`, which retries and gives a clear failure message.
- **Deprecated-style calls removed:** \`page.fill(selector)\`, \`page.click(selector)\`, \`page.isVisible(selector)\` are discouraged in favour of locators.`,
      followUps: [
        {
          q: 'Should openCart() return a CartPage object?',
          a: 'It can: "fluent" page objects make the flow explicit (inventory.openCart() returns a CartPage). With fixtures, many teams skip it and just request cartPage, which avoids constructing objects inside other objects. Either is fine if the team is consistent; avoid deep chains that hide which page you are on.',
        },
        {
          q: 'Where would you put a check that the cart total is correct?',
          a: 'In the spec, because it is the business outcome of that test case. The page object can expose a total locator or a method that returns the parsed number, and the test asserts it. Keeping it out of the page object means negative or edge-case tests can reuse the same methods.',
        },
      ],
    },
    {
      id: 'pw-pom-data-cc-2',
      title: 'Hard-coded shared booking that leaks and collides',
      context:
        'Three API-backed specs use the same hard-coded booking data. With 4 workers they fail randomly ("expected Jim, got Sally"), and the shared Restful Booker instance fills up with "Jim Brown" bookings because cleanup only runs when everything passes.',
      task:
        'Make every test create its own unique booking, clean it up even when the test fails, take the admin credentials out of the code, and stop tests from editing a shared data object.',
      starter: {
        language: 'typescript',
        title: 'tests/api/booking.spec.ts (before)',
        code: `import { test, expect } from '@playwright/test';
import data from '../../data/booking.json' with { type: 'json' };

const API = 'https://restful-booker.herokuapp.com';

test('update first name', async ({ request }) => {
  const created = await (await request.post(\`\${API}/booking\`, { data })).json();
  data.firstname = 'Sally'; // mutates the shared imported object!
  const auth = await (await request.post(\`\${API}/auth\`,
    { data: { username: 'admin', password: 'password123' } })).json();
  await request.put(\`\${API}/booking/\${created.bookingid}\`,
    { data, headers: { Cookie: \`token=\${auth.token}\` } });

  // find "our" booking by name: may pick another worker's booking
  const list = await (await request.get(\`\${API}/booking?firstname=Jim\`)).json();
  expect(list.length).toBeGreaterThan(0);

  // cleanup only reached if everything above passed
  await request.delete(\`\${API}/booking/\${created.bookingid}\`,
    { headers: { Cookie: \`token=\${auth.token}\` } });
});`,
      },
      hints: [
        'Which data here is identical for every test and every worker? How could two workers confuse each other\'s bookings?',
        'Generate a unique booking per test with a factory, and keep the id that the create call returns.',
        'Move create + delete into a fixture so the delete runs after await use() even on failure; fetch the token once per worker from env vars.',
      ],
      solution: {
        language: 'typescript',
        title: 'tests/api/booking.spec.ts (after, uses fixtures/data.ts)',
        code: `import { test, expect } from '../../fixtures/data'; // booking + apiToken fixtures

const API = 'https://restful-booker.herokuapp.com';

test('update first name', async ({ request, booking, apiToken }) => {
  // copy, never mutate fixture/imported data
  const updated = { ...booking.data, firstname: 'Sally' };

  const put = await request.put(\`\${API}/booking/\${booking.id}\`, {
    data: updated,
    headers: { Cookie: \`token=\${apiToken}\` },
  });
  expect(put.status()).toBe(200);

  // read back OUR booking by id, not by a shared name
  const res = await request.get(\`\${API}/booking/\${booking.id}\`);
  expect(await res.json()).toMatchObject({
    firstname: 'Sally',
    lastname: booking.data.lastname, // unique qa-xxxx value from the factory
  });
  // no cleanup here: the booking fixture deletes it in teardown, pass or fail
});`,
      },
      explanation: `- **Unique data:** the \`booking\` fixture builds data with the Faker factory (\`qa-\` + random lastname), so four workers never fight over "Jim Brown".
- **Lookup by id:** the test reads \`/booking/:id\` for its own record instead of \`?firstname=Jim\`, which could match any worker's (or any stranger's) booking on a public API.
- **No shared mutation:** the imported JSON was a cached module object; mutating it changed data for every later test in the worker. Now the test spreads a copy.
- **Guaranteed cleanup:** the delete lives after \`await use()\` in the fixture, so it runs even when an assertion fails. It accepts 201 (Restful Booker's delete status) or 404.
- **Secrets out of code:** the worker-scoped \`apiToken\` fixture reads \`RB_USER\`/\`RB_PASS\` from env vars and authenticates once per worker instead of once per test.
- **Status checks:** the PUT status is asserted, so a 403 from a bad token fails at the right line.`,
      followUps: [
        {
          q: 'How would you clean up data left behind by a crashed run?',
          a: 'Because every record carries the qa- prefix, a teardown project (project dependencies with teardown) or a nightly CI job can list bookings and delete those whose lastname starts with qa- and are older than an hour. The per-test fixture handles the normal case; the sweep is the safety net.',
        },
        {
          q: 'Why authenticate in a worker-scoped fixture rather than in each test?',
          a: 'The token is the same for every test in that worker, so fetching it once saves a request per test and keeps tests focused. It must not depend on test-scoped fixtures, so it builds its own APIRequestContext from the playwright fixture and disposes it at worker shutdown.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'pw-pom-data-iq-01',
      difficulty: 'easy',
      question: 'What is the Page Object Model? Write a LoginPage class for SauceDemo and show a test that uses it.',
      whatInterviewerLooksFor: [
        'Explains the why: maintenance and readability',
        'Correct TS class with Page, readonly Locators, async methods',
        'Uses modern locators, no sleeps',
        'Keeps the assertion in the test',
      ],
      modelAnswer: `**POM** is a design pattern where each page of the application gets a class holding its locators and the actions a user can perform there. Tests call those methods instead of touching selectors. Benefits: when the UI changes I fix one class, and specs read like manual test steps.

For SauceDemo:
- \`LoginPage\` has \`constructor(page)\`, readonly locators \`username = page.getByPlaceholder('Username')\`, \`password = page.getByPlaceholder('Password')\`, \`loginButton = page.getByRole('button', { name: 'Login' })\`, \`error = page.locator('[data-test="error"]')\`.
- Methods: \`goto()\` → \`page.goto('/')\` using baseURL; \`login(user, pass)\` fills both fields and clicks.

Test:
- \`const loginPage = new LoginPage(page)\`, \`await loginPage.goto()\`, \`await loginPage.login('standard_user', process.env.SAUCE_PASS!)\`, then \`await expect(page).toHaveURL(/inventory/)\`.
- Negative test reuses the same method with \`locked_out_user\` and asserts \`expect(loginPage.error).toContainText('locked out')\`.

Design choices I would point out:
- Locators are created in the constructor; this is safe because locators are lazy.
- \`login()\` has **no assertion**, so it serves positive and negative tests.
- Credentials come from env vars even though SauceDemo's are public, because that is the habit for real apps.
- In the full framework I would not even write \`new LoginPage(page)\` in tests; a fixture provides \`loginPage\`.`,
      followUps: [
        {
          q: 'Why readonly?',
          a: 'readonly tells TypeScript that the locator field is assigned once in the constructor and never replaced. It documents intent and prevents a test from accidentally overwriting loginPage.username with something else. It has no runtime cost; it is a compile-time check.',
        },
        {
          q: 'Would you add an isLoggedIn() method?',
          a: 'Not as a boolean based on isVisible(), because isVisible() checks once without waiting and leads to flaky expect(...).toBe(true) checks. I would expose a locator (for example inventory.title) and let the test assert with toBeVisible() or toHaveText(), which auto-retries.',
        },
      ],
      pitfalls: [
        'Putting waitForTimeout in page methods',
        'Asserting login success inside login(), breaking negative tests',
        'Using absolute XPath copied from DevTools',
      ],
    },
    {
      id: 'pw-pom-data-iq-02',
      difficulty: 'medium',
      question: 'Should page objects contain assertions? Defend your position.',
      whatInterviewerLooksFor: [
        'Knows both sides of the debate',
        'Distinguishes readiness checks from business assertions',
        'Gives a concrete example of reuse breaking',
        'Mentions exposing locators for web-first assertions',
      ],
      modelAnswer: `There are two schools:
- **No assertions in page objects** (Martin Fowler's view): page objects drive the UI; tests decide pass/fail. This keeps page objects reusable and makes each test's checks visible.
- **Assertions allowed**: the official Playwright POM example asserts a heading inside \`getStarted()\`, and some teams like short specs.

My position is the **middle ground**:
1. **Business assertions live in the test.** "Cart contains the backpack", "error says locked out", "total is $32.39" are the point of the test case, so they must be visible in the spec.
2. **Readiness checks may live in the page object.** \`InventoryPage.goto()\` ends with \`expect(this.title).toHaveText('Products')\`. That is not the test's purpose; it guarantees the page is ready before the next action, which removes flakiness.

Concrete reason: if \`login()\` asserted "landed on inventory", I could not reuse it for the locked-out-user or wrong-password tests; I would end up with \`login()\`, \`loginExpectingError()\`, \`loginWithoutCheck()\`.

To make test-side assertions easy, page objects **expose locators** (\`cartPage.items\`, \`header.cartBadge\`) so tests use web-first \`expect(locator)\` with auto-retry. I avoid methods returning booleans from \`isVisible()\` or \`textContent()\`, because they check once and fail unpredictably.`,
      followUps: [
        {
          q: 'What if the team already has assertions everywhere in page objects?',
          a: 'I would not rewrite everything at once. New code follows the convention, and when a page object blocks a negative test, I split the assertion out at that point. I would also write the convention into the framework README so code reviews can enforce it consistently.',
        },
        {
          q: 'Is expect.soft useful in page objects?',
          a: 'Rarely. Soft assertions are useful in a test that checks many independent fields on one screen. Hiding them in page objects makes failures surprising because the method appears to succeed. Keep soft checks in the spec where readers can see them.',
        },
      ],
      pitfalls: [
        'Answering only "never" or "always" without nuance',
        'Not knowing the official example asserts inside a method',
        'Ignoring reuse for negative tests',
      ],
    },
    {
      id: 'pw-pom-data-iq-03',
      difficulty: 'medium',
      question: 'How do you combine page objects with Playwright fixtures, and why is it better than creating page objects in each test?',
      whatInterviewerLooksFor: [
        'test.extend with page-object fixtures',
        'Fixture dependencies (inventoryPage uses loginPage)',
        'Lazy creation and single place for setup',
        'Import discipline (test from fixtures file)',
      ],
      modelAnswer: `I create \`fixtures/pages.ts\`:
- \`base.extend<{ loginPage: LoginPage; inventoryPage: InventoryPage; cartPage: CartPage }>({...})\`
- \`loginPage: async ({ page }, use) => use(new LoginPage(page))\`
- \`inventoryPage: async ({ page, loginPage }, use) => { await loginPage.goto(); await loginPage.login(env user, env pass); await use(new InventoryPage(page)); }\`
- export \`test\` and \`expect\`.

Specs then import from that file: \`test('adds item', async ({ inventoryPage, cartPage }) => { ... })\`.

Why it is better:
1. **No boilerplate:** no \`new XPage(page)\` lines in 100 specs.
2. **Setup in one place:** \`inventoryPage\` arrives logged in. When we switch to storageState, I change the fixture, not the specs.
3. **Lazy:** a test that only asks for \`loginPage\` never logs in.
4. **Composable:** fixtures depend on fixtures; I can merge page fixtures with data fixtures using \`mergeTests\`.
5. **Typed:** the editor autocompletes \`inventoryPage.addToCart\`.

Two rules I follow: page objects stay plain classes (no fixture knowledge), and specs never import \`test\` from \`@playwright/test\` directly, or they lose the custom fixtures. A lint rule (no-restricted-imports) can enforce that.`,
      followUps: [
        {
          q: 'What does mergeTests do?',
          a: 'mergeTests(a, b) combines several extended test objects into one, so fixtures from pages.ts and data.ts are available together. You export the merged test from fixtures/index.ts and every spec imports from there, keeping fixture files small and focused.',
        },
        {
          q: 'Would you make page-object fixtures worker-scoped to save time?',
          a: 'No. Page objects wrap a page, which is test-scoped and recreated each test; a worker-scoped page object would share one page across tests and break isolation. Constructing a page object is nearly free; the expensive part, login, is better solved with storageState.',
        },
      ],
      pitfalls: [
        'Importing test from @playwright/test in specs after defining fixtures',
        'Putting fixture logic inside the page object classes',
        'Making page objects worker-scoped',
      ],
    },
    {
      id: 'pw-pom-data-iq-04',
      difficulty: 'medium',
      question: 'How do you manage test data in your framework, including data that differs between QA and staging environments?',
      whatInterviewerLooksFor: [
        'Categorises data (static, env-specific, secret, dynamic)',
        'Secrets in env vars / CI secrets, never committed',
        'Env selection mechanism (TEST_ENV)',
        'Dynamic unique data with Faker/factories and cleanup',
      ],
      modelAnswer: `I split data into four kinds:

1. **Static reference data**, the same everywhere: product names/prices for SauceDemo, in \`data/products.json\`. Read-only.
2. **Environment-specific data**: base URL, an existing customer id, feature flags. One file per env (\`data/env/qa.json\`, \`staging.json\`), picked by a \`TEST_ENV\` variable; the config also reads \`TEST_ENV\` to set \`baseURL\`.
3. **Secrets**: passwords, API keys. Only in environment variables: a gitignored \`.env\` loaded with dotenv locally, and CI secrets in the pipeline. A committed \`.env.example\` documents the keys.
4. **Dynamic data**: anything a test creates (bookings, users, orders). Generated per test with Faker through **factories** like \`buildBooking(overrides)\`, with a \`qa-\` prefix so leftovers are identifiable.

Lifecycle:
- Create through the **API** in a fixture, hand it to the test, delete it in the fixture's teardown so cleanup runs on failure too.
- Log generated values (or attach them to the report) so a failure is reproducible; \`faker.seed()\` can replay a sequence when debugging.

Things I avoid: hard-coded ids that exist only in one environment, tests that depend on data created by other tests, and mutating imported JSON (it is a cached shared object per worker).`,
      followUps: [
        {
          q: 'A test needs an order in "shipped" status, and the UI flow to get there takes 3 minutes. What do you do?',
          a: 'Create the order directly in that state through an API (or a test-only endpoint or DB seed if the team provides one) inside a fixture, then test only the behaviour that matters in the UI. The long flow gets its own end-to-end test, so it is covered once rather than repeated as setup in many tests.',
        },
        {
          q: 'Where do you keep data for data-driven tests?',
          a: 'Small tables inline in the spec, because that is most readable. Larger sets in JSON or CSV under data/, loaded at file level and looped to create one test per row with a unique title. If business users maintain the data, CSV works well, parsed with csv-parse/sync.',
        },
      ],
      pitfalls: [
        'Committing .env or passwords in JSON',
        'Relying on fixed records that someone else may change',
        'No cleanup strategy',
      ],
    },
    {
      id: 'pw-pom-data-iq-05',
      difficulty: 'medium',
      question: 'How do you write data-driven tests in Playwright? What can go wrong?',
      whatInterviewerLooksFor: [
        'Loop that creates one test per row',
        'Unique titles requirement',
        'Hook behaviour with loops',
        'Parameterised projects for suite-level variation',
      ],
      modelAnswer: `Playwright has no special decorator; you generate tests with a normal loop at file or describe level:

- \`for (const row of rows) { test('login as ' + row.user, async ({ page }) => { ... }) }\` (or a template-literal title)

Each row becomes a **separate test**: own report line, own retry, can run in parallel with \`fullyParallel\`.

Data sources: inline arrays (most readable), JSON imports, or CSV parsed with \`csv-parse/sync\` (\`columns: true, skip_empty_lines: true\`), which is what the official guide shows.

What can go wrong:
1. **Duplicate titles.** Two rows producing the same title cause an error. Include the distinguishing field in the title.
2. **Looping inside one test.** \`for (row of rows)\` inside a single test stops at the first failure, reports one test, and retries every row. Generate tests instead.
3. **Hooks.** Hooks outside the loop run around each generated test as usual. If each row needs its own beforeEach/beforeAll, wrap the iteration in a \`test.describe\`.
4. **Async data loading.** Test files are evaluated synchronously when collecting tests, so read the data synchronously (\`fs.readFileSync\` or JSON import), not from an API call at file level.
5. **Shared rows.** Rows are shared objects; do not mutate them in tests.

For suite-wide variations (run all tests as two different users or against two locales), I use **parameterised projects**: an option fixture \`[default, { option: true }]\` overridden per project in the config.`,
      followUps: [
        {
          q: 'How do you pass a parameter to every test in a project?',
          a: "Declare an option fixture: base.extend<{ userRole: string }>({ userRole: ['user', { option: true }] }). In the config, project A sets use: { userRole: 'admin' } and project B sets use: { userRole: 'user' }. Tests and fixtures read userRole like any fixture.",
        },
        {
          q: 'Your CSV has 500 rows. Is generating 500 UI tests a good idea?',
          a: 'Usually not. Use equivalence partitioning and boundary values to pick representative rows for the UI, and push the full matrix down to API or unit level where each check costs milliseconds. Hundreds of UI tests for one form slow the pipeline without finding many more bugs.',
        },
      ],
      pitfalls: [
        'Loop inside a single test',
        'Non-unique titles',
        'Fetching test data asynchronously at file level',
      ],
    },
    {
      id: 'pw-pom-data-iq-06',
      difficulty: 'hard',
      question:
        'Your API-backed UI tests pass alone but fail in CI with 6 workers, and the shared QA database keeps filling with test records. Walk me through a fix.',
      context: 'The tests create Restful Booker bookings and then look for them in an admin UI list.',
      whatInterviewerLooksFor: [
        'Identifies non-unique data and lookup-by-position as collision causes',
        'Unique per-test data and id-based lookup',
        'Cleanup in teardown that survives failures',
        'Safety-net sweep and observability',
      ],
      modelAnswer: `**Diagnose first.** I would open the trace of a failing test and check which record it read. Typical root causes:
- All tests create "Jim Brown", then pick "the first row" or search by that name, which could be any worker's record.
- Tests assume an empty list ("expect 1 booking") while other workers are adding records.
- Cleanup sits at the end of the test body, so any failure skips it and data leaks; over many runs the list grows and pagination or slowness causes more failures.

**Fix:**
1. **Unique data per test.** A factory with Faker generates \`lastname = qa-<random>\` (or includes \`testInfo.testId\`). Log it.
2. **Find by unique key or id.** Search the UI for the exact unique lastname, or go straight to \`/booking/:id\`. Assert relative facts ("my row exists with these values"), not global counts.
3. **Cleanup in fixture teardown.** A \`booking\` fixture creates the record via API, \`await use()\`, then deletes it with the token cookie. Teardown runs even when the test fails; it tolerates 404.
4. **Token once per worker** with a worker-scoped fixture, credentials from env vars.
5. **Safety net.** A teardown project or nightly job deletes records with the \`qa-\` prefix older than X hours, in case a worker crashed.
6. **Verify:** run with \`--repeat-each=5 --workers=6\` to prove the collisions are gone.

If the app cannot isolate data at all (a single shared cart per account), I give each worker its own account using \`parallelIndex\`.`,
      followUps: [
        {
          q: 'Why not just set workers to 1 in CI?',
          a: 'It hides the bug and multiplies runtime by the worker count. The suite would still break the moment someone runs it in parallel locally or the team adds sharding. Data isolation is a design property of the tests; fixing it once lets the suite scale.',
        },
        {
          q: 'How does --repeat-each help here?',
          a: 'It runs every test N times in the same run. Combined with several workers it massively increases the chance that two copies of the same test run at the same time, so collisions show up reliably before the change is merged, instead of once a week in CI.',
        },
      ],
      pitfalls: [
        'Blaming the app or CI machine without checking data',
        'Cleaning up in the last line of the test',
        'Using global counts in assertions',
      ],
    },
    {
      id: 'pw-pom-data-iq-07',
      difficulty: 'expert',
      question:
        'You are the first SDET on a team. Design a Playwright framework from scratch for a web shop (UI) plus its REST API. What folders, layers and conventions do you set up in week one?',
      whatInterviewerLooksFor: [
        'Clear layers: specs, page/component objects, fixtures, data, API clients, config',
        'Auth reuse and environment strategy',
        'Conventions that scale (naming, imports, tags, lint)',
        'Pragmatism: start small, CI early',
      ],
      modelAnswer: `**Week-one structure**
- \`playwright.config.ts\`: baseURL from \`TEST_ENV\`, retries/trace on CI, projects for setup + chromium (+ firefox later), \`testIdAttribute\`.
- \`tests/\` grouped by feature (\`auth/\`, \`catalog/\`, \`cart/\`, \`checkout/\`, \`api/\`), plus \`auth.setup.ts\`.
- \`pages/\` and \`components/\`: plain classes, lazy locators, user-intent methods, readiness checks only.
- \`fixtures/\`: \`pages.ts\` (page objects), \`data.ts\` (API-created entities with teardown), \`index.ts\` merging them with \`mergeTests\`.
- \`api/\`: thin typed clients for setup/cleanup (\`BookingApi.create()\`), used by fixtures and API specs.
- \`data/\`: static JSON + per-env files; \`utils/factories.ts\` with Faker builders.
- \`.env.example\`, gitignored \`.env\` and \`playwright/.auth/\`.

**Conventions**
- Specs import \`test\` only from \`fixtures/index.ts\` (lint rule).
- Locator priority: role/label/test id; no XPath without a comment.
- No \`waitForTimeout\`, no shared mutable state, every test independent and parallel-safe.
- Business assertions in specs; tags \`@smoke\`, \`@regression\`; \`test.step\` for business actions.
- Unique \`qa-\` prefixed data, API setup/cleanup.

**Delivery**
- Day 1–2: config, login via storageState setup project, 3 smoke tests on the critical path (login, add to cart, checkout).
- Day 3: GitHub Actions running smoke on every PR with HTML report and traces as artifacts.
- Then grow coverage feature by feature, extracting components only when duplication appears.

The point is not the perfect tree; it is that a new tester can add a test in 15 minutes by copying a pattern.`,
      followUps: [
        {
          q: 'How do you keep the framework consistent as 5 more testers join?',
          a: 'A short CONTRIBUTING guide with one example of each pattern, ESLint with eslint-plugin-playwright (missing await, no waitForTimeout, no focused tests), TypeScript strict mode, PR reviews with a checklist, and CI that fails on test.only via forbidOnly. Conventions enforced by tools survive; conventions in people\'s heads do not.',
        },
        {
          q: 'Would you use Cucumber/BDD on top?',
          a: 'Only if business stakeholders will actually read or write the feature files. Otherwise it adds a translation layer and step-definition maintenance with little benefit. Playwright test titles, tags and test.step already produce readable reports. If BDD is required, playwright-bdd integrates with the Playwright runner and keeps fixtures.',
        },
      ],
      pitfalls: [
        'Designing a huge abstract framework before writing a single test',
        'No plan for auth, environments or data cleanup',
        'Ignoring CI until the end',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'pw-pom-data-drill-1',
      question:
        'Place each file into the right folder of a SauceDemo + Restful Booker framework, and say which ones must be gitignored: LoginPage.ts, Header.ts, pages.ts (test.extend), index.ts (mergeTests), products.json, staging.json, factories.ts, bookingApi.ts, auth.setup.ts, checkout.spec.ts, user.json (storageState), .env, .env.example.',
      assumptions: [
        'Folders available: pages/, components/, fixtures/, data/, data/env/, utils/, api/, tests/, playwright/.auth/, project root.',
        'Secrets and session files must never be committed.',
      ],
      steps: [
        { label: 'Page and component objects', calc: 'pages/LoginPage.ts; components/Header.ts' },
        { label: 'Fixtures', calc: 'fixtures/pages.ts; fixtures/index.ts (merges pages + data fixtures)' },
        { label: 'Data', calc: 'data/products.json; data/env/staging.json' },
        { label: 'Helpers', calc: 'utils/factories.ts (Faker builders); api/bookingApi.ts (API client)' },
        { label: 'Tests', calc: 'tests/auth.setup.ts; tests/checkout/checkout.spec.ts' },
        { label: 'Secrets and state', calc: 'playwright/.auth/user.json (gitignored); .env at root (gitignored); .env.example at root (committed)' },
      ],
      answer:
        '**pages/** LoginPage.ts · **components/** Header.ts · **fixtures/** pages.ts, index.ts · **data/** products.json · **data/env/** staging.json · **utils/** factories.ts · **api/** bookingApi.ts · **tests/** auth.setup.ts, checkout/checkout.spec.ts · **playwright/.auth/** user.json · **root** .env, .env.example. Gitignored: **.env** and **playwright/.auth/**.',
      insight:
        'Each folder has one job; secrets and session cookies stay out of git, while .env.example documents what each developer must set.',
      followUps: [
        {
          q: 'Where would you put a helper that waits for a toast message on any page?',
          a: 'In components/Toast.ts as a small component object (root locator plus a method or exposed locator), composed into page objects that show toasts. It is UI, so it does not belong in utils/, and it is shared, so it does not belong in one page object.',
        },
      ],
    },
    {
      id: 'pw-pom-data-drill-2',
      question:
        'A data-driven spec loops over 6 SauceDemo users × 3 sort options, generating one test per combination. The config has 2 projects (chromium, firefox), fullyParallel, 3 workers, average 9 s per test, retries 1, and 10% of tests fail once then pass. Estimate test count and wall time. Then estimate again if you cut the matrix with pairwise thinking to 8 combinations.',
      assumptions: [
        'Tests distribute evenly over workers; ignore startup time.',
        'A retried test costs one extra 9 s run.',
        'Pairwise: cover every user at least once and every sort option with several users.',
      ],
      steps: [
        { label: 'Generated tests', calc: '6 users × 3 sorts = 18 per project × 2 projects = 36 tests' },
        { label: 'Runs incl. retries', calc: '36 + 10% × 36 ≈ 36 + 4 = 40 runs' },
        { label: 'Total test time', calc: '40 × 9 s = 360 s' },
        { label: 'Wall time with 3 workers', calc: '360 / 3 = 120 s ≈ 2 min' },
        { label: 'Reduced matrix', calc: '8 × 2 projects = 16 tests; +10% ≈ 18 runs × 9 s = 162 s / 3 ≈ 54 s' },
      ],
      answer:
        'Full matrix: **36 tests, ~40 runs, about 2 minutes** wall time. Pairwise-reduced: **16 tests, about 1 minute**, with every user and every sort option still covered.',
      insight:
        'Data-driven loops multiply quickly (rows × options × projects). Use test design techniques to pick rows, and remember retries add to the bill.',
      followUps: [
        {
          q: 'What must the test titles contain here?',
          a: 'Both loop variables, e.g. `sort ${sort} as ${user}`, so all 18 titles are unique within the file. The project name is added by Playwright automatically in reports, so it does not need to be in the title.',
        },
      ],
    },
    {
      id: 'pw-pom-data-drill-3',
      question:
        'A suite of 120 API-backed tests runs 10 times a day. Each test creates 2 Restful Booker bookings and deletes them on its last line. 8% of test runs fail before reaching the last line. How many bookings leak per day and per 30 days? What is the leak after moving the deletes into fixture teardown, assuming 0.2% of runs end in a worker crash that skips teardown?',
      assumptions: [
        '120 tests × 10 runs = 1,200 test executions per day.',
        'Each failure before the last line leaks both bookings.',
        'Fixture teardown runs on assertion failures; only hard crashes skip it.',
      ],
      steps: [
        { label: 'Executions per day', calc: '120 × 10 = 1,200' },
        { label: 'Failures leaking (before)', calc: '8% × 1,200 = 96 failing executions × 2 bookings = 192 leaked/day' },
        { label: 'Per 30 days (before)', calc: '192 × 30 = 5,760 leaked bookings' },
        { label: 'Crashes (after)', calc: '0.2% × 1,200 = 2.4 executions × 2 = ~5 leaked/day' },
        { label: 'Per 30 days (after)', calc: '~5 × 30 ≈ 144, removed by a nightly qa- prefix sweep' },
      ],
      answer:
        'Before: **~192 leaked bookings per day, ~5,760 per month**. After teardown: **~5 per day (~144 per month)**, and a nightly sweep of `qa-` records brings it to effectively zero.',
      insight:
        'Cleanup at the end of a test body only works for passing tests, which is exactly when you least need it. Teardown plus a prefixed sweep is the reliable pattern.',
      followUps: [
        {
          q: 'Why does leaked data cause more test failures over time?',
          a: 'Lists grow and paginate, searches return many matches, and endpoints slow down, so tests that look for "a booking" or count rows start failing or timing out. Leaked data is a source of flakiness, not just untidiness.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'pw-pom-data-mcq-01',
      difficulty: 'easy',
      question: 'The SauceDemo login button selector changes. In a suite of 50 tests that use a LoginPage class, how many places should you need to edit?',
      options: ['50, one per test', 'One: the locator in LoginPage', 'None: Playwright updates selectors automatically', 'Two: LoginPage and playwright.config.ts'],
      correct: [1],
      explanation:
        'Keeping selectors in one class is the main maintenance benefit of POM: a UI change is fixed in one locator. Editing 50 tests is the situation POM prevents. Playwright does not auto-heal selectors, and the config does not hold page selectors.',
      followUps: [
        {
          q: 'What else does POM improve besides maintenance?',
          a: 'Readability: specs read like test steps (loginPage.login, inventory.addToCart), so manual testers and reviewers can follow them. It also makes reuse natural across positive and negative tests.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-02',
      difficulty: 'easy',
      question: 'Where do Playwright page objects typically create their locators?',
      options: [
        'In the constructor, as readonly Locator fields',
        'Inside each test, passed into every method call',
        'In playwright.config.ts under use',
        'In a beforeAll hook, after the page has loaded',
      ],
      correct: [0],
      explanation:
        'The official POM guide creates locators in the constructor and stores them as readonly fields. This works because locators are lazy and resolve only when used. Passing selectors from tests defeats the pattern, the config has no locator section, and beforeAll cannot use page.',
      followUps: [
        {
          q: 'Why is it safe to create them before page.goto()?',
          a: 'A Locator is only a description of how to find elements. It queries the DOM each time an action or assertion runs, so creating it early costs nothing and never goes stale.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-03',
      difficulty: 'medium',
      question: 'Running this spec fails before any test starts. Why?',
      code: {
        language: 'typescript',
        code: `const users = ['standard_user', 'problem_user', 'standard_user'];

for (const user of users) {
  test(\`inventory loads for \${user}\`, async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(user, process.env.SAUCE_PASS!);
    await expect(page).toHaveURL(/inventory/);
  });
}`,
      },
      options: [
        'Loops are not allowed at file level in Playwright',
        'Two generated tests have the same title, which Playwright rejects',
        'process.env cannot be read inside a loop',
        'loginPage cannot be used in data-driven tests',
      ],
      correct: [1],
      explanation:
        'standard_user appears twice, so two tests share the title "inventory loads for standard_user", and Playwright reports duplicate titles as an error. File-level loops are the documented way to parameterise, env vars are readable anywhere, and fixtures work in generated tests.',
      followUps: [
        {
          q: 'How would you guard against this when the data comes from a CSV?',
          a: 'Include a unique column (a test case id) in the title, for example `${row.id}: ${row.user}`, and validate the CSV for duplicate ids when loading it so the error message is clear.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-04',
      difficulty: 'medium',
      question: 'This check is flaky right after login. What is the best fix?',
      code: {
        language: 'typescript',
        code: `// in InventoryPage
async isLoaded() {
  return this.page.locator('[data-test="inventory-list"]').isVisible();
}

// in the test
expect(await inventoryPage.isLoaded()).toBe(true);`,
      },
      options: [
        'Add await page.waitForTimeout(2000) before calling isLoaded()',
        'Expose the locator and assert await expect(inventoryPage.list).toBeVisible()',
        'Wrap the call in try/catch and retry once',
        'Use toBeTruthy() instead of toBe(true)',
      ],
      correct: [1],
      explanation:
        'isVisible() returns the state at that instant without waiting, so the boolean is often false while the page is still rendering. A web-first assertion on the locator retries until the timeout. Sleeps slow the suite and still race, a manual retry is a weak copy of auto-waiting, and toBeTruthy() checks the same one-shot boolean.',
      followUps: [
        {
          q: 'When is isVisible() appropriate?',
          a: 'For branching logic where you do not want to wait, for example closing an optional cookie banner if it is already shown. For checking expected behaviour, always use expect(locator) assertions.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-05',
      difficulty: 'medium',
      question: 'Select ALL that are good candidates to live inside a page object.',
      options: [
        'Locators for the elements of that page',
        'An addToCart(productName) method that performs the clicks',
        "The expected cart total for the 'two items' test case",
        'A goto() method that ends by waiting for the page title to be visible',
        'A waitForTimeout(3000) to let the page settle',
      ],
      correct: [0, 1, 3],
      explanation:
        'Locators, user-intent actions and a readiness wait at the end of navigation belong in page objects. The expected total is test-case data and belongs in the spec or data files. Fixed sleeps are an anti-pattern anywhere: they are slow and still race.',
      followUps: [
        {
          q: 'Why is the readiness wait acceptable but the business assertion is not?',
          a: 'The readiness wait is part of performing the navigation reliably and is the same for every test. The expected total is what a specific test case verifies; hiding it in the page object would make the method unusable for other cases.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-06',
      difficulty: 'medium',
      question:
        'A login-matrix spec loops over 4 users and creates one test per user. The config has projects chromium, firefox and webkit. How many tests appear in the report (ignoring retries)?',
      options: ['4', '7', '12', '64'],
      correct: [2],
      explanation:
        'Each project runs every test in the matching files: 4 generated tests × 3 projects = 12. 4 ignores the projects, 7 adds instead of multiplying, and 64 (4 cubed) wrongly treats projects as an exponent.',
      followUps: [
        {
          q: 'How would you run the matrix only on chromium?',
          a: 'Either run npx playwright test --project=chromium, or restrict the file in config with testIgnore/testMatch on the other projects, or call test.skip(({ browserName }) => browserName !== "chromium") at file level.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-07',
      difficulty: 'medium',
      question: 'A test fails with random Faker data and you need to reproduce the exact same values while debugging. What helps most?',
      options: [
        'Call faker.seed(n) with a fixed number before generating, and log the values used',
        'Switch to faker.name.firstName(), which is deterministic',
        'Generate the data in beforeAll instead of the test',
        'Run with --repeat-each=10 until the same data appears',
      ],
      correct: [0],
      explanation:
        'faker.seed(n) makes the sequence repeatable, and logging generated values in the report lets you replay a failure. faker.name is the old module name, not a deterministic mode. Moving generation into beforeAll does not make it repeatable, and repeating runs hoping for the same random data is guesswork.',
      followUps: [
        {
          q: 'Why not seed Faker with the same number in every worker permanently?',
          a: 'Every worker would then generate the same sequence, so parallel tests would create identical names and collide. Use seeding for debugging, and rely on randomness or testId for uniqueness in normal runs.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-08',
      difficulty: 'easy',
      question: 'The SauceDemo header (cart icon, menu) appears on the inventory, cart and checkout pages. What is the cleanest way to model it?',
      options: [
        'Copy the header locators into each of the three page objects',
        'A Header component object composed into each page object',
        'Make CartPage and CheckoutPage extend InventoryPage to inherit the header',
        'Put header locators in playwright.config.ts',
      ],
      correct: [1],
      explanation:
        'A component object wraps the shared UI once and each page has a header instance (composition). Copying duplicates selectors, and inheriting from InventoryPage would give CartPage inventory methods it should not have. The config is not a place for locators.',
      followUps: [
        {
          q: 'How do you keep a ProductCard component from clicking a button in another card?',
          a: 'Give it a root locator (one inventory item, found with filter({ hasText: name })) and build every child locator from that root, so its button lookup is scoped to that card only.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-09',
      difficulty: 'hard',
      question: 'The badge locator is created in the constructor, before any item is added. What does the final assertion do?',
      code: {
        language: 'typescript',
        code: `export class CartPage {
  readonly badge: Locator;
  constructor(page: Page) {
    // created before the user has added anything
    this.badge = page.locator('[data-test="shopping-cart-badge"]');
  }
}
// test: create CartPage, add 2 items, then:
await expect(cartPage.badge).toHaveText('2');`,
      },
      options: [
        'It fails: the badge did not exist when the locator was created',
        'It passes: the locator is resolved when the assertion runs and retries until it shows 2',
        "It fails: you must call locator.refresh() after adding items",
        'It passes only if the assertion has { timeout: 0 }',
      ],
      correct: [1],
      explanation:
        'Locators are lazy and re-resolve on every action or assertion, so creating one before the element exists is fine; toHaveText then retries until the badge reads 2. There is no refresh() on locators, and timeout 0 would remove the retrying rather than help.',
      followUps: [
        {
          q: 'What would break if the constructor stored await locator.textContent() instead?',
          a: 'You cannot await in a constructor, and even in an async init method the stored string would be a snapshot of that moment (probably empty) and never update. Store locators, read values at the time of the check.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL places where cleanup of API-created test data will still run when the test fails an assertion.',
      options: [
        'Code after await use() in the fixture that created the data',
        'A test.afterEach hook in the same file',
        'The last lines of the test body, after the assertions',
        'A teardown project linked to the setup project, sweeping records with the qa- prefix',
      ],
      correct: [0, 1, 3],
      explanation:
        'Fixture teardown and afterEach run whether the test passed or failed, and a teardown project runs after the dependent projects finish. Code at the end of the test body is skipped as soon as an assertion throws, which is the classic cause of leaked data.',
      followUps: [
        {
          q: 'Which of these do you prefer and why?',
          a: 'Fixture teardown, because creation and deletion live in one function and the test cannot forget it. The prefixed sweep is a safety net for crashes; afterEach works but splits setup and cleanup across the file.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-11',
      difficulty: 'medium',
      question:
        'Locally you run against QA; in CI the same suite must hit staging, where customer ids differ. Which approach is best?',
      options: [
        'Hard-code QA ids and comment them out in CI',
        'Keep data/env/qa.json and data/env/staging.json and pick one with a TEST_ENV variable',
        'Use if (process.env.CI) branches inside every test',
        'Store staging ids in the HTML report from the previous run',
      ],
      correct: [1],
      explanation:
        'Per-environment data files chosen by one environment variable keep tests identical across environments; the config can use the same TEST_ENV for baseURL. Commenting code in and out is error-prone, CI checks inside every test scatter environment logic, and reports are outputs, not inputs.',
      followUps: [
        {
          q: 'Would you put the staging admin password in staging.json?',
          a: 'No. Passwords and tokens go in environment variables (CI secrets in pipelines, a gitignored .env locally). The JSON holds non-secret data such as ids and feature flags.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-12',
      difficulty: 'expert',
      question:
        'An inventory method can either return void and let tests request cartPage from a fixture, or return a new CartPage ("fluent" style). Which statement is most accurate?',
      options: [
        'Fluent style is required by Playwright for type safety',
        'Both work; fluent style makes navigation explicit, fixtures avoid constructing pages inside pages. Pick one convention',
        'Returning page objects causes memory leaks because each holds a page',
        'Fixtures cannot provide two page objects that share the same page',
      ],
      correct: [1],
      explanation:
        'This is a design choice: fluent methods show which page you land on, while fixtures keep page objects independent and are lazily created. Playwright requires neither. Page objects are light wrappers around one shared page, so returning them leaks nothing, and fixtures happily give several page objects the same page.',
      followUps: [
        {
          q: 'What is a risk of long fluent chains?',
          a: 'Chains like login().addToCart().openCart().checkout() hide where failures happen and tie page objects to each other, so a change in one flow ripples through many classes. Short chains or fixtures plus test.step keep it readable.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-13',
      difficulty: 'hard',
      question: 'Code review: select ALL real defects in this loginAsAdmin() method.',
      code: {
        language: 'typescript',
        code: `async loginAsAdmin() {
  await this.page.locator('#user-name').fill('admin');
  await this.page.locator('#password').fill('Admin@123');
  await this.page.getByRole('button', { name: 'Login' }).click();
  await this.page.waitForTimeout(3000);
  await expect(this.page.locator('.total')).toHaveText('$32.39');
}`,
      },
      options: [
        'Credentials are hard-coded in the page object',
        'A fixed 3-second sleep instead of waiting for a real condition',
        'A test-case business assertion (cart total) hidden inside a login method',
        'getByRole for the button is a brittle locator',
        'Locators are created inline instead of as readonly fields, so the method is the only place they exist',
      ],
      correct: [0, 1, 2],
      explanation:
        'Hard-coded secrets, a fixed sleep and an unrelated business assertion are real problems. getByRole with an accessible name is the recommended, resilient locator. Inline locators are a style choice that hurts reuse a little, but they are not the main defects here.',
      followUps: [
        {
          q: 'How would you rewrite it?',
          a: 'login(user, pass) using readonly locators, credentials passed in from env vars by the caller or fixture, no sleep (or a readiness check on the next page title), and the total assertion moved into the checkout test that cares about it.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-14',
      difficulty: 'expert',
      question: 'With 1 worker, test B fails only when it runs after test A. Why?',
      code: {
        language: 'typescript',
        code: `import products from '../data/products.json' with { type: 'json' };

test('A: discount view', async ({ page }) => {
  products[0].price = products[0].price * 0.9; // show discounted price
  // ...
});

test('B: product prices', async ({ page }) => {
  await expect(page.locator('[data-test="inventory-item-price"]').first())
    .toHaveText(\`$\${products[0].price}\`);
});`,
      },
      options: [
        'JSON imports are re-read from disk for every test, so the file was changed on disk',
        'The imported object is cached per worker; A mutated it, so B sees the changed price',
        'Playwright reloads modules between tests, but in random order',
        'B needs await products before reading it',
      ],
      correct: [1],
      explanation:
        'A module is evaluated once per worker and every import gets the same object, so A\'s mutation is visible to B in that worker. The file on disk is untouched, Playwright does not reload modules between tests, and a JSON import is not a promise.',
      followUps: [
        {
          q: 'Fix it in one line in test A.',
          a: 'Work on a copy: const item = structuredClone(products[0]); item.price *= 0.9. Better still, treat data files as read-only by convention, or freeze them (Object.freeze) in a data module so accidental mutation throws.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-15',
      difficulty: 'easy',
      question: 'Specs suddenly fail with "Test has unknown parameter inventoryPage". What is the most likely cause?',
      options: [
        'The spec imports test from @playwright/test instead of from the fixtures file',
        'InventoryPage has no constructor',
        'The page fixture is disabled in the config',
        'inventoryPage must be written in PascalCase',
      ],
      correct: [0],
      explanation:
        'Custom fixtures exist only on the extended test object exported from your fixtures file. Importing the base test from @playwright/test means the runner does not know inventoryPage. The other options would cause different errors, or none at all.',
      followUps: [
        {
          q: 'How do you stop this from happening again?',
          a: "Add an ESLint no-restricted-imports rule that forbids importing test from '@playwright/test' in tests/, pointing developers to fixtures/index.ts.",
        },
      ],
    },
  ],
};

export default topic;
