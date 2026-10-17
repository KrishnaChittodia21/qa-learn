import type { Topic } from '../../types';

const topic: Topic = {
  id: 'pw-pom-data',
  phase: 'pw-framework',
  order: 2,
  title: 'Page Objects & Test Data',
  subtitle:
    'Build a real framework: page objects and component objects for SauceDemo, page objects given to tests by fixtures, a clear folder layout, and test data that is unique, works per environment, drives many tests and is cleaned up through the API.',
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
    'Page object = a class for one page: constructor(page), readonly Locator fields, and async methods named after what the user does (login, addToCart). Selectors live in ONE place.',
    'Locators are lazy: they search the page only when used. So creating them in the constructor is safe. Never store innerText() or count() results in fields.',
    'Expose locators so tests can check them with web-first expect(), which retries. Avoid true/false helpers like isLoggedIn() that return isVisible().',
    'Assertions: business results belong in tests. Page objects may only check "this page is ready" (title, URL).',
    'Give page objects to tests with fixtures: base.extend({ loginPage: async ({ page }, use) => use(new LoginPage(page)) }). Tests then just write ({ loginPage }).',
    'Component objects wrap repeated UI parts (header, product card, modal). Pages contain them. Build their locators from one root locator.',
    'Folders: pages/ (page objects), components/, fixtures/, data/, utils/ (API helpers), tests/ (specs by feature), playwright.config.ts, .env (gitignored).',
    'Test data: static JSON for fixed data, one file per environment picked by TEST_ENV, secrets only in env vars, Faker for unique random data (faker.seed(n) to repeat it).',
    'Data-driven tests: for (const row of rows) test(`... ${row.name}`, ...) at file level. Titles must be unique. Hooks outside the loop run around each test as usual.',
    'Unique data per test (Faker, testInfo.testId) stops clashes in parallel runs. Never change imported JSON: all tests in a worker share one cached copy.',
    'Clean up in fixture teardown through the API; it runs even on failure. Restful Booker: POST /auth → token, DELETE /booking/:id with Cookie token=… → 201.',
  ],
  sections: [
    {
      heading: 'Page Object Model: what it is and why teams use it',
      body: `**Example:**

- Without POM: \`await page.locator('#user-name').fill('standard_user')\` → this selector is copied into 40 tests.
- With POM: \`await loginPage.login('standard_user', password)\` → the test says what the user does. The selector lives in one class.

A page object is like a TV remote for one screen of your app. Tests press buttons named "login" or "add to cart". They do not care which wires (selectors) sit behind each button. When the wiring changes, you fix the remote once.

The **Page Object Model (POM)** is a design pattern. Each page, or big part of a page, gets its own class. The class:

- holds the **locators** for that page, written once;
- has **methods** for user actions on that page, like \`login(user, pass)\` or \`addToCart(name)\`;
- hides HTML details from tests, so specs read like test cases.

The Playwright docs give two reasons to use it. Page objects make tests **easier to write**, because you get simple methods for your app. They make tests **easier to maintain**, because selectors live in one place.

Martin Fowler adds a useful rule. A page object should model what a *user* can do and see, not the HTML structure.

| Without POM | With POM |
|---|---|
| \`#user-name\` copied into 40 specs | one \`username\` locator in \`LoginPage\` |
| Login selector changes → 40 edits | Login selector changes → 1 edit |
| Specs read like page scripts | Specs read like \`loginPage.login(user)\` |
| Hard for manual testers to review | Easy to review as test steps |

**Watch out:** do not over-build. A 10-test suite on one page does not need many layers of classes. Start with one class per page. Pull out components and shared classes only when you see repeated code.

**In an interview, say:** "POM separates *what* the test checks from *how* it drives the page. Locators and actions live in page classes. Checks on the business result live in the spec. Fixtures give the page objects to the tests."

**Why testers care:** when a developer renames a field, you fix one line, not 40 tests.`,
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
        'One class per page or area: locators + methods named after user actions.',
        'Selectors change in one place, and specs stay readable.',
        'Do not build deep class layers before you see repeated code.',
      ],
      source: 'Playwright docs — Page object models; Martin Fowler — PageObject',
    },
    {
      heading: 'Building a LoginPage for SauceDemo',
      body: `**Example:**

- \`this.username = page.getByPlaceholder('Username')\` → in the constructor, save how to find the Username box.
- \`await loginPage.login('locked_out_user', password)\` → in the test, fill both boxes and click Login with one call.

Start with the screen every test touches first: the login page.

The usual Playwright shape, as in the official POM guide:

- \`constructor(page: Page)\` stores the page and creates **\`readonly\` Locator fields**. \`readonly\` means the field is set once and never replaced.
- **Async methods** do the actions (\`goto\`, \`login\`).
- Locators are public fields, so a test can check them.

**Why the constructor is a safe place:** a locator is **lazy**. \`page.getByPlaceholder('Username')\` does not search the page when you create it. It searches each time you act or check. So you can build all locators before \`goto()\`.

SauceDemo details:

- The inputs have the placeholders "Username" and "Password".
- The button is \`<input type="submit" value="Login">\`. So \`getByRole('button', { name: 'Login' })\` works.
- Every element also has a \`data-test\` attribute. Set \`testIdAttribute: 'data-test'\` in the config to use \`getByTestId('username')\`.

**Common mistakes:**

- Storing text instead of locators: \`this.errorText = await page.locator('...').textContent()\`. You cannot use await in a constructor. And the saved value would soon be out of date.
- Methods that return true/false for checks, like \`isErrorShown()\` returning \`isVisible()\`. These do not wait. Expose the locator instead. Let the test write \`expect(loginPage.error).toBeVisible()\`.

**Why testers care:** the same \`login()\` method works for the happy path and for the locked-out user. One class serves both tests.`,
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
        'Locators are lazy: safe to create before the page opens.',
        'Expose locators for web-first assertions. Avoid true/false helpers.',
      ],
      source: 'Playwright docs — Page object models; Locators (lazy evaluation)',
    },
    {
      heading: 'InventoryPage and CartPage: methods that model user intent',
      body: `**Example:**

- \`await inventoryPage.addToCart('Sauce Labs Backpack')\` → find the card with that name, then click its "Add to cart" button.
- \`clickAddButton(0)\` → clicks the first button. It breaks when the product order changes.

Name methods after what the user wants ("add the backpack"). Do not name them after what the code does ("click the third button").

Guidelines for action methods:

- **Take business data, not positions.** \`addToCart('Sauce Labs Backpack')\` is better than \`clickAddButton(0)\`.
- **Find the row by text, then act inside it.** Use \`items.filter({ hasText: name }).getByRole('button', { name: 'Add to cart' })\`. This keeps working when items are re-ordered.
- **Return data when the test needs it.** For example, \`itemNames()\` returns \`allTextContents()\`. But keep the checks in the test.
- **Return the next page object only if it makes the flow clearer**, like \`openCart(): Promise<CartPage>\`. This is optional. With fixtures, most teams just ask for both page objects.
- **Wait for the page to be ready, not for time.** If a method opens a new page, end it by waiting for proof, like the page title. Never use \`waitForTimeout\`.

SauceDemo locators used below:

- Product cards: \`[data-test="inventory-item"]\`.
- Product names: \`[data-test="inventory-item-name"]\`.
- Page title: \`[data-test="title"]\`. It reads "Products" or "Your Cart".
- Cart link: \`[data-test="shopping-cart-link"]\`.
- Cart badge: \`[data-test="shopping-cart-badge"]\`.

**Why testers care:** tests that use product names keep passing when the shop adds or re-orders products.`,
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
        'Methods take business data (a product name), not positions.',
        'filter({ hasText }) plus a getByRole inside it survives layout changes.',
        'Methods that open a page end with a "page is ready" check, never a sleep.',
      ],
      source: 'Playwright docs — Page object models; Locators: filtering',
    },
    {
      heading: 'Wiring page objects into fixtures',
      body: `**Example:**

- \`test('added product appears in the cart', async ({ inventoryPage, cartPage }) => { ... })\` → the test gets a logged-in products page and a cart page. It never writes \`new InventoryPage(page)\`.

Think of the fixture as a waiter. You order the page objects you want, and it brings them ready to use.

Writing \`new LoginPage(page)\` in every test is repetitive. So combine POM with fixtures. Both the Playwright fixtures guide and Checkly's article recommend this:

1. In \`fixtures/pages.ts\`, extend the base test with one fixture per page object.
2. A fixture can also do setup. For example, \`inventoryPage\` can log in and open the page before handing the object over.
3. Specs import \`test\` and \`expect\` from the fixtures file. They ask for what they need.

Benefits:

- No repeated setup lines in specs.
- Lazy creation: a test that only needs \`cartPage\` never builds the others.
- One place to change how pages are prepared. Later you can switch from UI login to \`storageState\` (a saved login file) without touching tests.

**Tip:** keep page objects as **plain classes** that know nothing about fixtures. Fixtures create and prepare them. Page objects hold selectors and actions. Each piece stays simple.

**Why testers care:** specs become short and readable. A login change touches one fixture, not every spec.`,
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
        'One fixture per page object. Specs ask for what they need.',
        'Fixtures can use each other (inventoryPage uses loginPage).',
        'Page objects stay plain classes; fixtures create and prepare them.',
      ],
      source: 'Playwright docs — Fixtures (todoPage example); Checkly blog — POM + fixtures',
    },
    {
      heading: 'Component objects: header, product card, modals',
      body: `**Example:**

- \`new ProductCard(this.items.filter({ hasText: 'Sauce Labs Backpack' }))\` → a small object for one product card.
- \`card.addButton\` → this button is searched only inside that card. It can never click a button in another card.

Pages share furniture. The SauceDemo header (menu, cart icon) is on every page. Every product card has the same name, price and button layout. Model this furniture once.

A **component object** is a small class for a reusable part of the UI. Two rules make components solid:

1. **Start from a root locator.** The component gets a \`Locator\` for its outer element (its root). It builds the child locators from that root.
2. **Contain, don't inherit.** A page *has a* header: \`this.header = new Header(page)\`. Avoid long chains like \`BasePage → AuthedPage → InventoryPage\`, where nobody knows what comes from where. This idea is called **composition over inheritance**.

Create a component when the same group of elements appears on 2 or more pages. Also create one when a list of repeated items (cards, table rows) needs actions on each item.

**Why testers care:** the header is fixed in one class. Card-level locators stop "clicked the wrong product" bugs in tests.`,
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
        'Components wrap repeated UI. Pages contain them.',
        'Build child locators from the component root locator.',
        'Prefer containing components over deep BasePage inheritance.',
      ],
      source: 'Playwright docs — Locators: chaining and filtering; Martin Fowler — PageObject (page objects for fragments)',
    },
    {
      heading: 'Assertions in page objects: the debate',
      body: `**Example:**

- \`await expect(this.title).toHaveText('Products')\` inside \`InventoryPage.goto()\` → OK. It only checks that the page is ready.
- \`await expect(this.page.locator('.total')).toHaveText('$32.39')\` inside a page method → not OK. That check is the test's job.

A page object is the driver. The test is the judge. The driver may check "the road is open" before driving. Only the judge decides if the trip met its goal.

| Approach | For | Against |
|---|---|---|
| **No assertions in page objects** (Fowler's view) | each class has one job; tests show every check; page objects work for positive and negative tests | ready-checks must still happen somewhere |
| **Assertions inside page methods** | shorter specs; the official POM guide's \`getStarted()\` checks a heading | hidden checks; a \`login()\` that checks success cannot be reused for the "wrong password" test |
| **Middle ground (most teams)** | page methods may check **readiness** ("cart page loaded"); tests check **business results** | the team must agree on the rule |

The middle ground in practice:

- \`InventoryPage.goto()\` ends with \`expect(this.title).toHaveText('Products')\`. This ready-check makes the next steps reliable.
- \`LoginPage.login()\` does **not** check for success, because the locked-out test reuses it.
- The spec checks what the test case is about: cart contents, error text, sort order.
- Page objects **expose locators**. Specs then use web-first \`expect()\`, and the failure points at the spec line.

**Red flags in page objects:**

- \`waitForTimeout\`.
- \`try { ... } catch {}\` that hides failures.
- Methods that return \`isVisible()\` true/false values.
- Test data typed inside methods.
- \`expect\` on business values ("total is $32.39").

**In an interview, say:** "Business checks live in the test, so the test reads as a test case. A page object may check it reached the right page. That is part of doing the action reliably."

**Why testers care:** methods without hidden checks can be reused for negative tests, like a wrong password.`,
      keyPoints: [
        'Tests own business checks. Page objects may check that a page is ready.',
        'A login() that checks for success cannot serve negative tests.',
        'Expose locators. Avoid true/false isX() helpers.',
      ],
      source: 'Martin Fowler — PageObject; Playwright docs — Page object models',
    },
    {
      heading: 'Framework folder structure',
      body: `**Example:**

- \`pages/LoginPage.ts\` → a page object.
- \`tests/cart/add-to-cart.spec.ts\` → a spec, grouped by feature.
- \`.env\` → local secrets, never committed to git.

A good folder structure is like a well-labelled kitchen. Anyone new can find the knives without asking.

A layout that grows well for a SauceDemo UI + Restful Booker API framework:

| Folder / file | Holds | Rule |
|---|---|---|
| \`tests/\` | specs grouped by feature (\`auth/\`, \`cart/\`, \`checkout/\`, \`api/\`) | only test steps and checks |
| \`pages/\` | page objects | locators + actions, no test data |
| \`components/\` | header, product card, modals | built from a root locator |
| \`fixtures/\` | \`test.extend\` files, merged into one \`index.ts\` | specs import \`test\` from here |
| \`data/\` | static JSON (products, users without passwords), files per environment | no secrets |
| \`utils/\` or \`api/\` | API clients, data builders, Faker factories | small helper functions |
| \`playwright.config.ts\` | runner settings and projects | values come from env vars |
| \`.env\` / \`.env.example\` | local secrets / list of needed keys | \`.env\` is gitignored |
| \`playwright/.auth/\` | saved storageState files | gitignored |

"Gitignored" means git never saves the file. So secrets stay out of the shared repo.

Habits that keep it healthy:

- One page object per file, named after the page.
- Specs end in \`*.spec.ts\`. Setup files end in \`*.setup.ts\`.
- A spec never imports another spec.
- Avoid long relative paths like \`../../../pages\`. A TypeScript path alias like \`@pages/*\` helps.

**Why testers care:** a new team member can add a test in minutes, because every file has an obvious home.`,
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
        'Specs by feature. Pages, components, fixtures, data and utils kept apart.',
        'Secrets in env vars. .env and .auth are gitignored.',
        'Specs import test from fixtures/index.ts (made with mergeTests).',
      ],
      source: 'Playwright docs — Fixtures (mergeTests), Authentication (.auth gitignore); community framework write-ups',
    },
    {
      heading: 'Test data management: JSON, environment data and Faker',
      body: `**Example:**

- \`buildBooking({ depositpaid: false })\` → a booking full of realistic random values. The test sets only \`depositpaid\`.
- \`faker.person.firstName()\` → a random first name, like 'Maya'.

Test data comes in kinds, like kitchen ingredients. Pantry staples never change (static data). Recipes change by kitchen (environment data). Fresh produce is bought for each meal (unique data per test).

| Kind | Example | Store it in | Watch out |
|---|---|---|---|
| Static reference | product names and prices on SauceDemo | \`data/products.json\` | update it when the product list changes |
| Per environment | base URLs, existing customer ids on QA vs staging | \`data/env/qa.json\`, picked by \`TEST_ENV\` | never put secrets in JSON |
| Secrets | passwords, API keys | env vars (\`.env\` locally, CI secrets in pipelines) | \`.env\` must be gitignored |
| Dynamic / unique | new booking names, emails | made per test (Faker, \`testInfo.testId\`) | log it so you can repeat a failure |

**Faker** (\`@faker-js/faker\`) is a library that makes realistic random data:

- \`faker.person.firstName()\`, \`faker.internet.email()\` and \`faker.string.uuid()\`.
- \`faker.date.soon()\` and \`faker.helpers.arrayElement([...])\`.

Use the \`person\` module for names. Older tutorials use \`faker.name\`, which belongs to older versions.

\`faker.seed(123)\` makes the values repeat in the same order. That helps you reproduce a failure. But a fixed seed gives every worker the **same** values. So do not use a seed to get unique data.

**Data builders** (also called factories) wrap Faker. Tests change only the fields that matter: \`buildBooking({ depositpaid: false })\`.

**Watch out:** \`import products from '../data/products.json'\` gives every test in a worker the **same object**. Node loads a file once and caches it. If one test changes the object, later tests in that worker see the change. Treat imported data as read-only. Or copy it with \`structuredClone()\` before you change it.

**Why testers care:** unique, realistic data stops tests from clashing. Data files per environment make the switch from QA to staging a one-word change.`,
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
        'Static JSON, per-environment JSON (TEST_ENV), secrets in env vars, random data from Faker.',
        'Builders with overrides keep tests short and show what matters.',
        'Imported JSON is one shared copy per worker: never change it.',
      ],
      source: 'Faker.js docs — Usage; Playwright docs — Parameterize tests (env variables)',
    },
    {
      heading: 'Data-driven and parameterised tests',
      body: `**Example:**

- \`for (const c of cases) { test('login as ' + c.user, async ({ loginPage }) => { ... }) }\` → one separate test for each row of data.
- 5 rows in \`cases\` → 5 tests in the report, each with its own pass or fail.

One test recipe, many lists of ingredients. Do not write "login as standard_user", "login as problem_user" and so on by hand. Loop over a table instead. This is called a **data-driven** (or **parameterised**) test.

How Playwright does it, from the official guide:

- Loop at **file level** (or inside a describe) with \`for...of\` or \`forEach\`. Call \`test()\` once per row.
- Each row becomes a separate test in the report. It is retried and run in parallel on its own.
- **Titles must be unique.** Put the row's key in the title, like \`login as \${user}\` (written with backticks in code). Two tests with the same title cause an error.
- Hooks outside the loop work as usual: beforeEach runs before each generated test. To get hooks per row, wrap each row in its own \`test.describe\`.
- Data can come from an inline array, a JSON file or a CSV file. Read CSV with \`csv-parse/sync\` and \`columns: true\`.
- To run the whole suite in different ways (as admin and as user), use **parameterised projects**. That means an option fixture (\`[default, { option: true }]\`) set differently in each project.

**Watch out:** do not loop over 20 rows *inside* one test. The first failure stops the rest. The report shows only one test. A retry repeats all rows.

**Real example:** SauceDemo login results as a decision table. \`performance_glitch_user\` logs in slowly, but its expected result is still "Products". Auto-waiting handles the delay; the test timeout is the limit.

**Why testers care:** one loop turns a decision table from your manual test design into many clear, separate tests.`,
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
        'One test() per data row, at file or describe level, with unique titles.',
        'Each row is separate: its own retry, its own report line, and it can run in parallel.',
        'To vary the whole suite, use parameterised projects with option fixtures.',
      ],
      source: 'Playwright docs — Parameterize tests (forEach, CSV, parameterized projects)',
    },
    {
      heading: 'Unique data per test and cleanup via API',
      body: `**Example:**

- \`buildBooking()\` → a booking with a unique lastname, like 'qa-x8K2pQ1z'.
- \`await use(...)\` and then \`request.delete(...)\` in the fixture → the booking is deleted after the test, even if the test failed.

In a shared kitchen, you label your food with your name. You throw away your own leftovers. Parallel tests share one server. Unique names stop tests from clashing. Clean-up stops the database from filling with junk.

**Rules for unique data:**

- Make names per test (Faker, \`testInfo.testId\`). Add a clear prefix like \`qa-\`, so leftover data is easy to find and delete.
- Never search for "the first booking". Search for *your* booking by its unique field or id.
- For things per worker (like accounts), use \`parallelIndex\`. For data per test, use unique values.

**Rules for clean-up:**

- **Use the API, not the UI**, for setup and clean-up. It is faster and more stable.
- Put clean-up in **fixture teardown** (the code after \`await use()\`) or in \`afterEach\`. Both run when the test fails. The last line of a test does not.
- Make clean-up **forgiving**. If the test already deleted the record, a 404 in teardown is fine.
- Add a **safety net**: a teardown project or nightly job that deletes everything with the \`qa-\` prefix.

**Restful Booker facts** (from its API docs):

- \`POST /auth\` with \`{ "username": "admin", "password": "password123" }\` returns \`{ token }\`.
- \`POST /booking\` returns \`{ bookingid, booking }\`.
- \`DELETE /booking/:id\` needs \`Cookie: token=<token>\` (or Basic auth). It answers **201 Created**, which is unusual but true.
- After that, the deleted booking returns 404.
- In a real framework, the admin login should still come from env vars.

**Why testers care:** without clean-up, leftover data grows every run. Lists get slow and searches find the wrong records. Tests become **flaky**: they pass sometimes and fail sometimes.`,
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
        'Unique, prefixed data per test. Find records by id, not by position.',
        'Clean up in fixture teardown or afterEach, through the API. Accept a 404.',
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
        'A junior engineer wrote one "SaucePage" class that every spec uses. It is 400 lines long; here is a typical slice. Tests that use it are slow and fail at random. The locked-out-user test cannot reuse login().',
      task:
        'Split it into small page objects with lazy locators. Remove the sleeps and the hidden business checks. Stop typing credentials into the code. Make the methods work for both positive and negative tests.',
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
        'Which parts belong to which screen? Login, inventory and cart are different pages. The cart badge belongs to a header component.',
        'Make locators readonly fields built in the constructor. Let methods take data (username, password, product name).',
        'Replace every waitForTimeout with a web-first wait for the thing that proves the next state. Move the business checks to the spec. Return locators instead of true/false values.',
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
      explanation: `- **Split by page:** \`LoginPage\` and \`InventoryPage\` replace one 400-line class. A \`Header\` component is the next step. Small classes are easier to review and change.
- **Lazy readonly locators**, defined once. User-facing locators (\`getByPlaceholder\`, \`getByRole\`) and \`data-test\` attributes replace the position-based XPath \`(//button...)[1]\`. That XPath breaks when products are re-ordered.
- **Data in, not typed in:** \`login(user, pass)\` serves the standard, locked-out and wrong-password tests. Credentials come from env vars.
- **No sleeps:** 6 s of \`waitForTimeout\` per flow is gone. Playwright waits automatically before actions, and \`openCart\` waits for the "Your Cart" title.
- **No hidden business checks, no true/false helpers:** \`isCartCount()\` returned a one-time true/false with no retry. \`isVisible()\` does not wait. Tests now write \`expect(inventory.cartBadge).toHaveText('1')\`, which retries and gives a clear failure message.
- **Old-style calls removed:** \`page.fill(selector)\`, \`page.click(selector)\` and \`page.isVisible(selector)\` are discouraged. Use locators instead.`,
      followUps: [
        {
          q: 'Should openCart() return a CartPage object?',
          a: 'It can. "Fluent" page objects make the flow clear: inventory.openCart() returns a CartPage. With fixtures, many teams skip this and just ask for cartPage, so objects are not built inside other objects. Either way is fine if the team is consistent. Avoid long chains that hide which page you are on.',
        },
        {
          q: 'Where would you put a check that the cart total is correct?',
          a: 'In the spec, because it is the business result of that test case. The page object can expose a total locator, or a method that returns the number, and the test checks it. Keeping it out of the page object lets negative and edge-case tests reuse the same methods.',
        },
      ],
    },
    {
      id: 'pw-pom-data-cc-2',
      title: 'Hard-coded shared booking that leaks and collides',
      context:
        'Three API-backed specs use the same typed-in booking data. With 4 workers they fail at random ("expected Jim, got Sally"). The shared Restful Booker server also fills up with "Jim Brown" bookings, because clean-up only runs when everything passes.',
      task:
        'Make every test create its own unique booking. Clean it up even when the test fails. Take the admin login out of the code. Stop tests from changing a shared data object.',
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
        'Which data here is the same for every test and every worker? How could two workers mix up each other\'s bookings?',
        'Make a unique booking per test with a factory. Keep the id that the create call returns.',
        'Move create and delete into a fixture, so the delete runs after await use() even on failure. Get the token once per worker, using env vars.',
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
      explanation: `- **Unique data:** the \`booking\` fixture builds data with the Faker factory (\`qa-\` + a random lastname). So four workers never fight over "Jim Brown".
- **Look up by id:** the test reads \`/booking/:id\` for its own record. \`?firstname=Jim\` could match any worker's booking, or a stranger's, on a public API.
- **No shared changes:** the imported JSON was one cached object. Changing it changed the data for every later test in that worker. Now the test makes a copy with spread (\`{ ...booking.data }\`).
- **Clean-up always runs:** the delete sits after \`await use()\` in the fixture, so it runs even when a check fails. It accepts 201 (Restful Booker's delete status) or 404.
- **Secrets out of code:** the worker-scoped \`apiToken\` fixture reads \`RB_USER\` and \`RB_PASS\` from env vars. It logs in once per worker, not once per test.
- **Status checks:** the PUT status is checked. So a 403 from a bad token fails at the right line.`,
      followUps: [
        {
          q: 'How would you clean up data left behind by a crashed run?',
          a: 'Every record has the qa- prefix. So a teardown project (project dependencies with teardown) or a nightly CI job can list bookings. It deletes those whose lastname starts with qa- and that are older than an hour. The per-test fixture handles the normal case; the sweep is the safety net.',
        },
        {
          q: 'Why authenticate in a worker-scoped fixture rather than in each test?',
          a: 'The token is the same for every test in that worker. Fetching it once saves one request per test and keeps tests focused. It must not use test-scoped fixtures. So it builds its own API client from the playwright fixture and closes it when the worker stops.',
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
        'Explains why: easier upkeep and readable tests',
        'Correct TS class with Page, readonly Locators and async methods',
        'Uses modern locators and no sleeps',
        'Keeps the check in the test',
      ],
      modelAnswer: `**Example:** \`await loginPage.login('standard_user', process.env.SAUCE_PASS!)\` → one readable line instead of three selector lines.

**POM** is a design pattern. Each page of the app gets a class. The class holds that page's locators and the actions a user can do there. Tests call those methods instead of touching selectors. When the UI changes, I fix one class. Specs read like manual test steps.

For SauceDemo:
- \`LoginPage\` has \`constructor(page)\` and readonly locators: \`username = page.getByPlaceholder('Username')\`, \`password = page.getByPlaceholder('Password')\`, \`loginButton = page.getByRole('button', { name: 'Login' })\` and \`error = page.locator('[data-test="error"]')\`.
- Methods: \`goto()\` calls \`page.goto('/')\`, using baseURL. \`login(user, pass)\` fills both fields and clicks.

Test:
- \`const loginPage = new LoginPage(page)\`, \`await loginPage.goto()\`, \`await loginPage.login('standard_user', process.env.SAUCE_PASS!)\`, then \`await expect(page).toHaveURL(/inventory/)\`.
- A negative test reuses the same method with \`locked_out_user\`. It checks \`expect(loginPage.error).toContainText('locked out')\`.

Design choices I would point out:
- Locators are created in the constructor. That is safe because locators are lazy.
- \`login()\` has **no assertion**, so it serves positive and negative tests.
- Credentials come from env vars, even though SauceDemo's are public. That is the right habit for real apps.
- In the full framework, tests would not even write \`new LoginPage(page)\`. A fixture provides \`loginPage\`.`,
      followUps: [
        {
          q: 'Why readonly?',
          a: 'readonly tells TypeScript that the locator field is set once in the constructor and never replaced. It shows intent and stops a test from overwriting loginPage.username by mistake. It costs nothing at run time; it is only a compile-time check.',
        },
        {
          q: 'Would you add an isLoggedIn() method?',
          a: 'Not as a true/false method based on isVisible(). isVisible() checks once without waiting, which leads to flaky expect(...).toBe(true) checks. I would expose a locator, like inventory.title. The test then checks it with toBeVisible() or toHaveText(), which retry automatically.',
        },
      ],
      pitfalls: [
        'Putting waitForTimeout in page methods',
        'Checking login success inside login(), which breaks negative tests',
        'Using long XPath copied from DevTools',
      ],
    },
    {
      id: 'pw-pom-data-iq-02',
      difficulty: 'medium',
      question: 'Should page objects contain assertions? Defend your position.',
      whatInterviewerLooksFor: [
        'Knows both sides of the debate',
        'Separates ready-checks from business checks',
        'Gives a real example where reuse breaks',
        'Mentions exposing locators for web-first assertions',
      ],
      modelAnswer: `**Example:** if \`login()\` checked "landed on the products page", the wrong-password test could not use it.

There are two schools of thought:
- **No assertions in page objects** (Martin Fowler's view). Page objects drive the UI; tests decide pass or fail. Page objects stay reusable, and each test's checks are visible.
- **Assertions allowed.** The official Playwright POM example checks a heading inside \`getStarted()\`. Some teams like short specs.

My position is the **middle ground**:
1. **Business checks live in the test.** "Cart contains the backpack", "error says locked out" and "total is $32.39" are the point of the test case. So they must be visible in the spec.
2. **Ready-checks may live in the page object.** \`InventoryPage.goto()\` ends with \`expect(this.title).toHaveText('Products')\`. That is not the test's goal. It makes sure the page is ready before the next action, which removes flakiness.

A real reason: if \`login()\` checked for success, I could not reuse it for the locked-out or wrong-password tests. I would end up with \`login()\`, \`loginExpectingError()\` and \`loginWithoutCheck()\`.

To make checks easy in tests, page objects **expose locators** (\`cartPage.items\`, \`header.cartBadge\`). Tests use web-first \`expect(locator)\`, which retries. I avoid methods that return true/false from \`isVisible()\` or \`textContent()\`. They check once and fail at random.`,
      followUps: [
        {
          q: 'What if the team already has assertions everywhere in page objects?',
          a: 'I would not rewrite everything at once. New code follows the rule. When a page object blocks a negative test, I move that check out at that point. I would also write the rule in the framework README, so code reviews apply it the same way.',
        },
        {
          q: 'Is expect.soft useful in page objects?',
          a: 'Rarely. Soft assertions help in a test that checks many separate fields on one screen. Hidden in page objects, they make failures surprising, because the method seems to pass. Keep soft checks in the spec, where readers can see them.',
        },
      ],
      pitfalls: [
        'Answering only "never" or "always", with no nuance',
        'Not knowing that the official example checks inside a method',
        'Ignoring reuse for negative tests',
      ],
    },
    {
      id: 'pw-pom-data-iq-03',
      difficulty: 'medium',
      question: 'How do you combine page objects with Playwright fixtures? Why is it better than creating page objects in each test?',
      whatInterviewerLooksFor: [
        'test.extend with page-object fixtures',
        'Fixtures that use other fixtures (inventoryPage uses loginPage)',
        'Lazy creation and one place for setup',
        'Import rule: test comes from the fixtures file',
      ],
      modelAnswer: `**Example:** \`test('adds item', async ({ inventoryPage, cartPage }) => { ... })\` → the test gets ready page objects. It never writes \`new XPage(page)\`.

I create \`fixtures/pages.ts\`:
- \`base.extend<{ loginPage: LoginPage; inventoryPage: InventoryPage; cartPage: CartPage }>({...})\`
- \`loginPage: async ({ page }, use) => use(new LoginPage(page))\`
- \`inventoryPage: async ({ page, loginPage }, use) => { await loginPage.goto(); await loginPage.login(env user, env pass); await use(new InventoryPage(page)); }\`
- export \`test\` and \`expect\`.

Specs then import from that file.

Why it is better:
1. **No repeated lines:** no \`new XPage(page)\` in 100 specs.
2. **Setup in one place:** \`inventoryPage\` arrives logged in. When we move to storageState, I change the fixture, not the specs.
3. **Lazy:** a test that only asks for \`loginPage\` never logs in.
4. **Combinable:** fixtures can use fixtures. I can merge page fixtures with data fixtures using \`mergeTests\`.
5. **Typed:** the editor autocompletes \`inventoryPage.addToCart\`.

Two rules I follow. Page objects stay plain classes that know nothing about fixtures. And specs never import \`test\` from \`@playwright/test\` directly, or they lose the custom fixtures. A lint rule (no-restricted-imports) can enforce that.`,
      followUps: [
        {
          q: 'What does mergeTests do?',
          a: 'mergeTests(a, b) joins several extended test objects into one. Then fixtures from pages.ts and data.ts are available together. You export the merged test from fixtures/index.ts, and every spec imports from there. Each fixture file stays small and focused.',
        },
        {
          q: 'Would you make page-object fixtures worker-scoped to save time?',
          a: 'No. Page objects wrap a page, which is test-scoped and made fresh for each test. A worker-scoped page object would share one page across tests and break their separation. Building a page object costs almost nothing. The slow part, login, is better solved with storageState.',
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
      question: 'How do you manage test data in your framework, including data that differs between QA and staging?',
      whatInterviewerLooksFor: [
        'Sorts data into kinds (static, per environment, secret, dynamic)',
        'Secrets in env vars or CI secrets, never committed',
        'A way to pick the environment (TEST_ENV)',
        'Unique dynamic data with Faker or factories, plus clean-up',
      ],
      modelAnswer: `**Example:** \`TEST_ENV=staging npx playwright test\` → the tests load \`data/env/staging.json\`, and the config uses the staging baseURL.

I split data into four kinds:

1. **Static reference data**, the same everywhere. Example: SauceDemo product names and prices in \`data/products.json\`. Read-only.
2. **Per-environment data**: base URL, an existing customer id, feature flags. One file per environment (\`data/env/qa.json\`, \`staging.json\`), picked by a \`TEST_ENV\` variable. The config also reads \`TEST_ENV\` to set \`baseURL\`.
3. **Secrets**: passwords and API keys. Only in environment variables. Locally, a gitignored \`.env\` loaded with dotenv. In the pipeline, CI secrets. A committed \`.env.example\` lists the keys.
4. **Dynamic data**: anything a test creates (bookings, users, orders). Made per test with Faker through **factories** like \`buildBooking(overrides)\`. A \`qa-\` prefix makes leftovers easy to find.

Life cycle:
- Create data through the **API** in a fixture. Hand it to the test. Delete it in the fixture's teardown, so clean-up runs on failure too.
- Log the generated values, or attach them to the report, so a failure can be repeated. \`faker.seed()\` can replay values while debugging.

What I avoid: ids that exist in only one environment, tests that need data from other tests, and changing imported JSON. Imported JSON is one shared cached object per worker.`,
      followUps: [
        {
          q: 'A test needs an order in "shipped" status, and the UI flow to get there takes 3 minutes. What do you do?',
          a: 'Create the order directly in that state through an API, inside a fixture. A test-only endpoint or a database seed also works, if the team provides one. Then test only the behaviour that matters in the UI. The long flow gets its own end-to-end test, so it is covered once, not repeated as setup in many tests.',
        },
        {
          q: 'Where do you keep data for data-driven tests?',
          a: 'Small tables go inline in the spec, because that is easiest to read. Larger sets go in JSON or CSV under data/. They are loaded at file level and looped, one test per row, each with a unique title. If business users maintain the data, CSV works well, read with csv-parse/sync.',
        },
      ],
      pitfalls: [
        'Committing .env or passwords in JSON',
        'Relying on fixed records that someone else may change',
        'No clean-up plan',
      ],
    },
    {
      id: 'pw-pom-data-iq-05',
      difficulty: 'medium',
      question: 'How do you write data-driven tests in Playwright? What can go wrong?',
      whatInterviewerLooksFor: [
        'A loop that creates one test per row',
        'Knows titles must be unique',
        'Knows how hooks behave with loops',
        'Parameterised projects for suite-wide variations',
      ],
      modelAnswer: `**Example:** \`for (const row of rows) { test('login as ' + row.user, async ({ page }) => { ... }) }\` → one test per row. A template-literal title works too.

Playwright has no special syntax for this. You make tests with a normal loop at file or describe level.

Each row becomes a **separate test**. It has its own report line and its own retry. It can run in parallel with \`fullyParallel\`.

Data sources: inline arrays (easiest to read), JSON imports, or CSV. The official guide reads CSV with \`csv-parse/sync\` (\`columns: true, skip_empty_lines: true\`).

What can go wrong:
1. **Duplicate titles.** Two rows that give the same title cause an error. Put the field that differs in the title.
2. **A loop inside one test.** \`for (row of rows)\` inside a single test stops at the first failure. It reports one test and retries every row. Make separate tests instead.
3. **Hooks.** Hooks outside the loop run around each generated test as usual. If each row needs its own beforeEach or beforeAll, wrap that row in a \`test.describe\`.
4. **Loading data with await.** Playwright reads test files synchronously when it collects tests. So read the data synchronously (\`fs.readFileSync\` or a JSON import). Do not fetch it from an API at file level.
5. **Shared rows.** Rows are shared objects. Do not change them in tests.

To vary the whole suite (run all tests as two users, or in two languages), I use **parameterised projects**. An option fixture \`[default, { option: true }]\` is set differently per project in the config.`,
      followUps: [
        {
          q: 'How do you pass a parameter to every test in a project?',
          a: "Declare an option fixture: base.extend<{ userRole: string }>({ userRole: ['user', { option: true }] }). In the config, project A sets use: { userRole: 'admin' } and project B sets use: { userRole: 'user' }. Tests and fixtures read userRole like any other fixture.",
        },
        {
          q: 'Your CSV has 500 rows. Is making 500 UI tests a good idea?',
          a: 'Usually not. Use equivalence partitioning and boundary values to pick a few representative rows for the UI. Push the full set down to API or unit tests, where each check takes milliseconds. Hundreds of UI tests for one form slow the pipeline but find few extra bugs.',
        },
      ],
      pitfalls: [
        'Loop inside a single test',
        'Titles that are not unique',
        'Fetching test data with await at file level',
      ],
    },
    {
      id: 'pw-pom-data-iq-06',
      difficulty: 'hard',
      question:
        'Your API-backed UI tests pass alone but fail in CI with 6 workers. The shared QA database also keeps filling with test records. Walk me through a fix.',
      context: 'The tests create Restful Booker bookings and then look for them in an admin UI list.',
      whatInterviewerLooksFor: [
        'Spots shared data and "pick the first row" as causes of clashes',
        'Unique data per test and lookup by id',
        'Clean-up in teardown that survives failures',
        'A safety-net sweep and logging',
      ],
      modelAnswer: `**Example:** six workers all create "Jim Brown". Then each test clicks "the first Jim Brown" in the list. Often that row belongs to another worker.

**Find the cause first.** I would open the trace of a failing test and check which record it read. Typical root causes:
- All tests create "Jim Brown", then pick "the first row" or search by that name. That could be any worker's record.
- Tests expect an empty list ("expect 1 booking") while other workers add records.
- Clean-up sits at the end of the test body. Any failure skips it, so data leaks. Over many runs the list grows, and paging or slowness causes more failures.

**Fix:**
1. **Unique data per test.** A Faker factory makes \`lastname = qa-<random>\` (or uses \`testInfo.testId\`). Log it.
2. **Find by unique key or id.** Search the UI for the exact unique lastname, or go straight to \`/booking/:id\`. Check facts about my own row, not global counts.
3. **Clean-up in fixture teardown.** A \`booking\` fixture creates the record through the API, calls \`await use()\`, then deletes it with the token cookie. Teardown runs even when the test fails, and it accepts a 404.
4. **Token once per worker**, with a worker-scoped fixture and credentials from env vars.
5. **Safety net.** A teardown project or nightly job deletes \`qa-\` records older than X hours, in case a worker crashed.
6. **Check the fix:** run with \`--repeat-each=5 --workers=6\` to prove the clashes are gone.

If the app cannot separate data at all (one shared cart per account), I give each worker its own account using \`parallelIndex\`.`,
      followUps: [
        {
          q: 'Why not just set workers to 1 in CI?',
          a: 'It hides the bug and makes the run several times slower. The suite would still break as soon as someone runs it in parallel locally, or the team adds sharding. Separate data is a design property of the tests. Fix it once and the suite can grow.',
        },
        {
          q: 'How does --repeat-each help here?',
          a: 'It runs every test N times in the same run. With several workers, two copies of the same test are much more likely to run at the same time. So clashes show up reliably before the change is merged, not once a week in CI.',
        },
      ],
      pitfalls: [
        'Blaming the app or CI machine without checking the data',
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
        'A plan for login reuse and environments',
        'Rules that scale (naming, imports, tags, lint)',
        'Practical: start small, add CI early',
      ],
      modelAnswer: `**Example:** by the end of week one, a new tester can copy \`tests/cart/add-to-cart.spec.ts\`, change two lines and have a working test.

**Week-one structure**
- \`playwright.config.ts\`: baseURL from \`TEST_ENV\`, retries and trace on CI, projects for setup + chromium (+ firefox later), \`testIdAttribute\`.
- \`tests/\` grouped by feature (\`auth/\`, \`catalog/\`, \`cart/\`, \`checkout/\`, \`api/\`), plus \`auth.setup.ts\`.
- \`pages/\` and \`components/\`: plain classes, lazy locators, methods named after user actions, ready-checks only.
- \`fixtures/\`: \`pages.ts\` (page objects), \`data.ts\` (API-created data with teardown), and \`index.ts\` merging them with \`mergeTests\`.
- \`api/\`: thin typed clients for setup and clean-up (\`BookingApi.create()\`), used by fixtures and API specs.
- \`data/\`: static JSON and per-environment files; \`utils/factories.ts\` with Faker builders.
- \`.env.example\`, plus a gitignored \`.env\` and \`playwright/.auth/\`.

**Rules**
- Specs import \`test\` only from \`fixtures/index.ts\` (enforced by a lint rule).
- Locator order: role, label, test id. No XPath without a comment.
- No \`waitForTimeout\` and no shared changing state. Every test is independent and safe to run in parallel.
- Business checks in specs. Tags \`@smoke\` and \`@regression\`. \`test.step\` for business actions.
- Unique \`qa-\` prefixed data, with API setup and clean-up.

**Delivery**
- Day 1–2: config, login through a storageState setup project, and 3 smoke tests on the main path (login, add to cart, checkout).
- Day 3: GitHub Actions runs smoke on every PR. The HTML report and traces are saved as artifacts (files kept after the CI run).
- Then grow coverage feature by feature. Pull out components only when code repeats.

The goal is not the perfect folder tree. The goal is that a new tester can add a test in 15 minutes by copying a pattern.`,
      followUps: [
        {
          q: 'How do you keep the framework consistent as 5 more testers join?',
          a: 'A short CONTRIBUTING guide with one example of each pattern. ESLint with eslint-plugin-playwright (missing await, no waitForTimeout, no focused tests). TypeScript strict mode. PR reviews with a checklist. CI that fails on test.only via forbidOnly. Rules enforced by tools survive; rules kept in people\'s heads do not.',
        },
        {
          q: 'Would you use Cucumber/BDD on top?',
          a: 'Only if business people will really read or write the feature files. Otherwise it adds a translation layer and step definitions to maintain, with little benefit. Playwright titles, tags and test.step already make readable reports. If BDD is required, playwright-bdd works with the Playwright runner and keeps fixtures.',
        },
      ],
      pitfalls: [
        'Designing a huge abstract framework before writing a single test',
        'No plan for login, environments or data clean-up',
        'Leaving CI until the end',
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
        'Each folder has one job. Secrets and saved login cookies stay out of git, and .env.example lists what each developer must set.',
      followUps: [
        {
          q: 'Where would you put a helper that waits for a toast message on any page?',
          a: 'In components/Toast.ts, as a small component object (a root locator plus a method or exposed locator). Page objects that show toasts contain it. It is UI, so it does not belong in utils/. It is shared, so it does not belong in one page object.',
        },
      ],
    },
    {
      id: 'pw-pom-data-drill-2',
      question:
        'A data-driven spec loops over 6 SauceDemo users × 3 sort options, making one test per combination. The config has 2 projects (chromium, firefox), fullyParallel, 3 workers, 9 s per test on average, and retries: 1. 10% of tests fail once, then pass. Estimate the test count and wall time. Then estimate again after you cut the matrix to 8 combinations with pairwise thinking.',
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
        'Data-driven loops grow fast (rows × options × projects). Use test design techniques to pick rows, and remember that retries add time too.',
      followUps: [
        {
          q: 'What must the test titles contain here?',
          a: 'Both loop variables, e.g. `sort ${sort} as ${user}`, so all 18 titles in the file are unique. Playwright adds the project name in reports by itself, so it does not need to be in the title.',
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
        'Clean-up at the end of a test body only runs for passing tests, which is exactly when you need it least. Teardown plus a prefixed sweep is the pattern that works.',
      followUps: [
        {
          q: 'Why does leaked data cause more test failures over time?',
          a: 'Lists grow and split into pages, searches return many matches, and endpoints slow down. Tests that look for "a booking" or count rows start failing or timing out. Leaked data causes flaky tests, not just mess.',
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
        'Keeping selectors in one class is the main upkeep benefit of POM: a UI change is fixed in one locator. Editing 50 tests is exactly what POM prevents. Playwright does not fix selectors by itself, and the config does not hold page selectors.',
      followUps: [
        {
          q: 'What else does POM improve besides maintenance?',
          a: 'Readability. Specs read like test steps (loginPage.login, inventory.addToCart), so manual testers and reviewers can follow them. It also makes it natural to reuse methods in positive and negative tests.',
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
        'The official POM guide creates locators in the constructor and saves them as readonly fields. This works because locators are lazy: they search the page only when used. Passing selectors from tests defeats the pattern. The config has no locator section, and beforeAll cannot use page.',
      followUps: [
        {
          q: 'Why is it safe to create them before page.goto()?',
          a: 'A Locator is only a description of how to find elements. It searches the page each time an action or assertion runs. So creating it early costs nothing, and it never goes out of date.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-03',
      difficulty: 'medium',
      question: 'This spec fails before any test starts. Why?',
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
        'standard_user appears twice. So two tests share the title "inventory loads for standard_user", and Playwright reports duplicate titles as an error. File-level loops are the documented way to parameterise. Env vars can be read anywhere, and fixtures work in generated tests.',
      followUps: [
        {
          q: 'How would you guard against this when the data comes from a CSV?',
          a: 'Put a unique column (a test case id) in the title, for example `${row.id}: ${row.user}`. Also check the CSV for duplicate ids when you load it, so the error message is clear.',
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
        'isVisible() returns the state at that moment, without waiting. So it is often false while the page is still loading. A web-first assertion on the locator retries until the timeout. A sleep slows the suite and can still lose the race. A manual retry is a weak copy of auto-waiting, and toBeTruthy() checks the same one-time value.',
      followUps: [
        {
          q: 'When is isVisible() appropriate?',
          a: 'For branching logic where you do not want to wait. Example: close an optional cookie banner if it is already showing. To check expected behaviour, always use expect(locator) assertions.',
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
        'Locators, user actions and a "page is ready" wait at the end of navigation belong in page objects. The expected total is test-case data, so it belongs in the spec or a data file. A fixed sleep is bad anywhere: it is slow and can still lose the race.',
      followUps: [
        {
          q: 'Why is the readiness wait acceptable but the business assertion is not?',
          a: 'The ready-wait is part of doing the navigation reliably, and it is the same for every test. The expected total is what one specific test case checks. Hiding it in the page object would make the method useless for other cases.',
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
        'Each project runs every test in the matching files: 4 generated tests × 3 projects = 12. The answer 4 ignores the projects. 7 adds instead of multiplying. 64 (4 cubed) wrongly treats projects as a power.',
      followUps: [
        {
          q: 'How would you run the matrix only on chromium?',
          a: 'Run npx playwright test --project=chromium. Or limit the file in the config with testIgnore or testMatch on the other projects. Or call test.skip(({ browserName }) => browserName !== "chromium") at file level.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-07',
      difficulty: 'medium',
      question: 'A test fails with random Faker data. You need the exact same values again while debugging. What helps most?',
      options: [
        'Call faker.seed(n) with a fixed number before generating, and log the values used',
        'Switch to faker.name.firstName(), which is deterministic',
        'Generate the data in beforeAll instead of the test',
        'Run with --repeat-each=10 until the same data appears',
      ],
      correct: [0],
      explanation:
        'faker.seed(n) makes the values repeat in the same order, and logging the generated values in the report lets you replay a failure. faker.name is the old module name, not a fixed-value mode. Moving data creation into beforeAll does not make it repeat. Re-running and hoping for the same random data is guesswork.',
      followUps: [
        {
          q: 'Why not seed Faker with the same number in every worker permanently?',
          a: 'Then every worker would make the same values, so parallel tests would create identical names and clash. Use a seed for debugging. In normal runs, rely on random values or testId for uniqueness.',
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
        'A component object wraps the shared UI once, and each page holds a header object (composition). Copying repeats selectors. Inheriting from InventoryPage would give CartPage inventory methods it should not have. The config is not a place for locators.',
      followUps: [
        {
          q: 'How do you keep a ProductCard component from clicking a button in another card?',
          a: 'Give it a root locator: one inventory item, found with filter({ hasText: name }). Build every child locator from that root. Then its button search stays inside that one card.',
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
        'Locators are lazy and look up the element again on every action or assertion. So creating one before the element exists is fine. toHaveText then retries until the badge reads 2. Locators have no refresh() method. A timeout of 0 would turn off the retrying instead of helping.',
      followUps: [
        {
          q: 'What would break if the constructor stored await locator.textContent() instead?',
          a: 'You cannot use await in a constructor. Even in an async setup method, the saved string would be a snapshot of that moment (probably empty) and would never update. Save locators, and read values at the time of the check.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL places where clean-up of API-created test data still runs when the test fails an assertion.',
      options: [
        'Code after await use() in the fixture that created the data',
        'A test.afterEach hook in the same file',
        'The last lines of the test body, after the assertions',
        'A teardown project linked to the setup project, sweeping records with the qa- prefix',
      ],
      correct: [0, 1, 3],
      explanation:
        'Fixture teardown and afterEach run whether the test passed or failed. A teardown project runs after the projects that depend on it finish. Code at the end of the test body is skipped as soon as an assertion fails. That is the classic cause of leaked data.',
      followUps: [
        {
          q: 'Which of these do you prefer and why?',
          a: 'Fixture teardown, because creating and deleting live in one function, and the test cannot forget it. The prefixed sweep is a safety net for crashes. afterEach works, but it splits setup and clean-up across the file.',
        },
      ],
    },
    {
      id: 'pw-pom-data-mcq-11',
      difficulty: 'medium',
      question:
        'Locally you run against QA. In CI the same suite must hit staging, where customer ids are different. Which approach is best?',
      options: [
        'Hard-code QA ids and comment them out in CI',
        'Keep data/env/qa.json and data/env/staging.json and pick one with a TEST_ENV variable',
        'Use if (process.env.CI) branches inside every test',
        'Store staging ids in the HTML report from the previous run',
      ],
      correct: [1],
      explanation:
        'Data files per environment, picked by one environment variable, keep the tests the same everywhere. The config can use the same TEST_ENV for baseURL. Commenting code in and out leads to mistakes. CI checks inside every test spread environment logic everywhere. Reports are outputs, not inputs.',
      followUps: [
        {
          q: 'Would you put the staging admin password in staging.json?',
          a: 'No. Passwords and tokens go in environment variables: CI secrets in pipelines and a gitignored .env locally. The JSON holds only non-secret data, such as ids and feature flags.',
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
        'This is a design choice. Fluent methods show which page you land on. Fixtures keep page objects separate and create them lazily. Playwright requires neither. Page objects are light wrappers around one shared page, so returning them leaks nothing. Fixtures can easily give several page objects the same page.',
      followUps: [
        {
          q: 'What is a risk of long fluent chains?',
          a: 'Chains like login().addToCart().openCart().checkout() hide where failures happen. They also tie page objects to each other, so a change in one flow spreads through many classes. Short chains, or fixtures plus test.step, keep it readable.',
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
        'Typed-in secrets, a fixed sleep and an unrelated business check are real problems. getByRole with an accessible name is the recommended, sturdy locator. Inline locators are a style choice that slightly hurts reuse, but they are not the main defects here.',
      followUps: [
        {
          q: 'How would you rewrite it?',
          a: 'login(user, pass) with readonly locators. The caller or a fixture passes in credentials from env vars. No sleep, or a ready-check on the next page title instead. The total check moves into the checkout test that cares about it.',
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
        'A module is loaded once per worker, and every import gets the same object. So A\'s change is visible to B in that worker. The file on disk is not touched. Playwright does not reload modules between tests, and a JSON import is not a promise.',
      followUps: [
        {
          q: 'Fix it in one line in test A.',
          a: 'Work on a copy: const item = structuredClone(products[0]); item.price *= 0.9. Better still, treat data files as read-only by team rule. Or freeze them (Object.freeze) in a data module, so an accidental change throws an error.',
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
        'Custom fixtures exist only on the extended test object exported from your fixtures file. If the spec imports the base test from @playwright/test, the runner does not know inventoryPage. The other options would cause different errors, or none at all.',
      followUps: [
        {
          q: 'How do you stop this from happening again?',
          a: "Add an ESLint no-restricted-imports rule. It forbids importing test from '@playwright/test' in tests/ and points developers to fixtures/index.ts.",
        },
      ],
    },
  ],
};

export default topic;
