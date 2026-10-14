// Playwright Lab: the PUBLIC feature specs for the QA Shop practice app (practice-app/).
// The learner reads these, brainstorms scenarios and writes real Playwright tests in practice/tests.
// The judge (scripts/judge.mjs) grades them against hidden, seeded bugs listed in judge/mutants.json.
// Rule: every hidden bug must break a rule written here. Never describe the bugs themselves.

export interface PwLabStep {
  id: string;
  title: string;
  /** one line for the overview card */
  summary: string;
  /** where in the app the feature lives */
  where: string;
  /** the tag every test for this step must carry */
  tag: string;
  /** user story + acceptance criteria / business rules (markdown) */
  spec: string;
  /** questions that help the learner brainstorm (never the answers) */
  prompts: string[];
  /** number of hidden bugs (must match judge/mutants.json) */
  hiddenBugs: number;
}

export const PW_LAB_APP_URL = 'http://localhost:4400';

/** Shown on the overview page: facts that every step relies on. */
export const PW_LAB_ABOUT = `
**QA Shop** is a small online shop built for this lab. It runs on your machine (\`npm run practice-app\`, then open
http://localhost:4400). Data lives in memory, so restarting the app resets everything.

| Account | Password | Notes |
|---|---|---|
| \`alice\` | \`Secret123!\` | regular customer |
| \`bob\` | \`Secret123!\` | regular customer (handy for "another user" scenarios) |
| \`locked_user\` | \`Secret123!\` | an account that has been locked |

**Pages:** \`/\` sign in · \`/inventory.html\` products · \`/cart.html\` cart · \`/checkout.html\` your details ·
\`/review.html\` order review, promo code and totals · \`/confirmation.html?id=…\` · \`/receipt.html?id=…\` (opens in a new tab).

**Each browser context gets its own session** (cookie), so its cart, promo code and checkout details are separate from
every other test. Tests can run in parallel safely.

**Shortcuts for test setup** (the same endpoints the pages use). Call them with \`page.request\`, which shares the
page's cookies, to skip UI steps that are not what your test is about:

| Request | Body | Effect |
|---|---|---|
| \`POST /api/session/login\` | \`{ "username": "alice", "password": "Secret123!" }\` | signs this browser context in |
| \`POST /api/cart/items\` | \`{ "productId": 1, "quantity": 2 }\` | adds to the cart |
| \`POST /api/checkout/details\` | \`{ "firstName", "lastName", "email", "phone", "postcode" }\` | saves valid checkout details |
| \`POST /api/test/reset\` | none | clears this session (signed out, empty cart) |

Product ids: 1 Aero Backpack, 2 Bolt T-Shirt, 3 Classic Hoodie, 4 Desk Lamp, 5 Explorer Jacket, 6 Fleece Beanie,
7 iPhone Case, 8 Noise-Cancelling Headphones, 9 Water Bottle, 10 Wireless Mouse, 11 Sport Socks, 12 Canvas Tote.
`;

export const PW_LAB_STEPS: PwLabStep[] = [
  {
    id: 'step1',
    title: 'Login',
    summary: 'Sign in, error messages, locked accounts and logging out.',
    where: '/ (sign-in page)',
    tag: '@step1',
    hiddenBugs: 4,
    spec: `
**User story.** As a shopper, I want to sign in with my username and password so that only I can use my cart and orders.

**Acceptance criteria**

1. The sign-in page has a **Username** field, a **Password** field and a **Sign in** button.
2. Valid credentials take the user to the product list (\`/inventory.html\`); the header shows **Signed in as <username>** and a **Log out** button.
3. Usernames are not case-sensitive and surrounding spaces are ignored (\`Alice\` = \`alice\`).
   **Passwords are case-sensitive** and must match exactly.
4. Errors are shown in an alert on the sign-in page, and the user stays on that page:

| Situation | Message |
|---|---|
| Username empty (checked first) | Username is required |
| Username given, password empty | Password is required |
| Unknown username or wrong password | Invalid username or password |
| Correct credentials for a locked account | Sorry, this account has been locked. |

5. A locked account can never sign in.
6. **Log out** returns to the sign-in page and ends the session: after logging out, opening a protected page
   (for example \`/inventory.html\`) directly redirects to the sign-in page until the user signs in again.
7. Every page except the sign-in page requires a signed-in user.
`,
    prompts: [
      'Which accounts in the table behave differently from a normal customer, and what should each one see?',
      'What counts as "almost correct" credentials? Which parts of the input does the spec say are flexible, and which are strict?',
      'After an action like logging out, how would you prove the session really ended, not just the page?',
    ],
  },
  {
    id: 'step2',
    title: 'Product list, search & filter',
    summary: 'Loading spinner, live search, category filter, result count and empty state.',
    where: '/inventory.html',
    tag: '@step2',
    hiddenBugs: 4,
    spec: `
**User story.** As a shopper, I want to search and filter the catalogue so that I can quickly find a product.

**Acceptance criteria**

1. While the catalogue loads, a **Loading products…** status is shown; then 12 product cards appear.
   Each card shows the product name (a heading), its category, its price and an **Add to cart** button.
2. **Search products** filters as you type and matches any part of the product name.
   - Search is **not case-sensitive** (\`backpack\`, \`BACKPACK\` and \`Backpack\` all match "Aero Backpack").
   - Spaces before and after the search text are ignored.
3. **Category** (All categories, Accessories, Clothing, Electronics, Home) shows only products of that category.
4. Search and category work **together**: a product is shown only if it matches the search text **and** the category.
5. A result count above the list reads **Showing N products** (or **Showing 1 product**) and always matches the cards shown.
6. When nothing matches, no cards are shown and the message **No products match your search.** appears.
7. Clearing the search (and choosing All categories) shows all 12 products again.
`,
    prompts: [
      'Search text is user input. What different "shapes" of the same word could a real user type?',
      'Two filters can be used at once. Which combinations would you try, and how would you know the result is right?',
      'What should the page look like when the answer is "nothing"?',
    ],
  },
  {
    id: 'step3',
    title: 'Sorting',
    summary: 'Name A–Z/Z–A and price low–high/high–low, with ties and filters.',
    where: '/inventory.html',
    tag: '@step3',
    hiddenBugs: 4,
    spec: `
**User story.** As a shopper, I want to sort the products so that I can compare them by name or price.

**Acceptance criteria**

1. **Sort by** offers: Name (A to Z) (the default), Name (Z to A), Price (low to high), Price (high to low).
2. Name sorting is alphabetical and **ignores letter case** (a product whose name starts with a lowercase letter is sorted with the others, not at the end).
3. Price sorting compares the **full price including cents** (for example $9.49 is cheaper than $9.99).
4. Products with the **same price** are listed by name A to Z, in **both** price sorts.
5. The chosen sort stays applied when the search text or the category changes: the visible products are always in the order the **Sort by** box shows.
`,
    prompts: [
      'A sort can look right if you only check the first and last item. What would you compare instead?',
      'Look at the catalogue data: which products are "unusual" for a name sort or a price sort?',
      'Sorting is rarely used alone. What other control on the page could interact with it?',
    ],
  },
  {
    id: 'step4',
    title: 'Cart',
    summary: 'Add/remove, quantity limits, the cart badge, reload and the "Empty cart" dialog.',
    where: '/inventory.html and /cart.html',
    tag: '@step4',
    hiddenBugs: 4,
    spec: `
**User story.** As a shopper, I want a cart that keeps the products I choose, with the right quantities.

**Acceptance criteria**

1. **Add to cart** on a product card adds one of that product and shows a toast **Added <product> to cart** that disappears after a few seconds. Adding the same product again increases its quantity.
2. The **cart badge** in the header shows the total quantity of items in the cart (2 × Backpack + 1 × Lamp = 3). It is hidden when the cart is empty, and it updates immediately after every add, quantity change or removal, on every page.
3. The cart page lists each product with its price, a **Quantity for <product>** field, its line total and a **Remove <product>** button, plus the items subtotal.
4. Quantity must be a whole number **from 1 to 10** (both included). A change is applied when the field loses focus or Enter is pressed.
   Any other value is rejected with the alert **Quantity must be between 1 and 10**, and the field goes back to the previous quantity.
   Adding a product that would go above 10 shows **You can have at most 10 of each product**.
5. The cart is kept on the server for the signed-in session: it **survives page reloads** and navigation. Logging out clears it.
6. **Empty cart** asks for confirmation in a browser dialog (**Remove all items from your cart?**).
   **OK** removes everything and shows **Your cart is empty.**; **Cancel** leaves the cart exactly as it was.
`,
    prompts: [
      'The quantity rule has edges. Which exact values sit on each side of them?',
      'The same information (how many items) is shown in more than one place. When could they disagree?',
      'Which ordinary browser actions could make the app "forget" something? And what are the two answers to a dialog?',
    ],
  },
  {
    id: 'step5',
    title: 'Checkout form validation',
    summary: 'Required fields, email, phone and postcode formats.',
    where: '/checkout.html',
    tag: '@step5',
    hiddenBugs: 4,
    spec: `
**User story.** As a shopper, I want to enter my delivery details so that my order reaches me, and I want clear errors if I make a mistake.

**Acceptance criteria**

1. The form has **First name**, **Last name**, **Email**, **Phone number** and **Postcode**, and a **Continue to review** button. (The cart must not be empty to open this page.)
2. **All five fields are required.** A value made only of spaces counts as empty.
3. Rules and the error shown under each field:

| Field | Rule | Error |
|---|---|---|
| First name | required | First name is required |
| Last name | required | Last name is required |
| Email | required; looks like name@domain.tld | Email is required / Enter a valid email address |
| Phone number | required; **exactly 10 digits**; spaces between digits are allowed (\`98765 43210\`); nothing else | Phone number is required / Enter a 10-digit phone number |
| Postcode | required; **exactly 6 digits**, the first digit is not 0 (Indian PIN code, e.g. \`560001\`) | Postcode is required / Enter a valid 6-digit postcode |

4. When any field is invalid, the user stays on the checkout page, an alert says **Please fix the highlighted fields**, each invalid field shows its error, and the values typed so far are kept.
5. When every field is valid, the details are saved and the user goes to the review page (\`/review.html\`).
`,
    prompts: [
      'For each field, what is the smallest change that turns a valid value into an invalid one?',
      'What input looks filled in to the computer but empty to a human?',
      'If you only ever submit a completely empty form, which mistakes could you never notice?',
    ],
  },
  {
    id: 'step6',
    title: 'Promo codes',
    summary: 'Percentage vs fixed codes, expiry, minimum order value, one code per order.',
    where: '/review.html',
    tag: '@step6',
    hiddenBugs: 5,
    spec: `
**User story.** As a shopper, I want to use a promo code at checkout so that I pay less, following the shop's promotion rules.

**Business rules**

| Code | Discount | Condition | Status |
|---|---|---|---|
| \`SAVE10\` | 10% of the items subtotal | none | active |
| \`FLAT20\` | $20.00 off | items subtotal of **at least $100.00** | active |
| \`WELCOME5\` | 5% | none | **expired** |

1. Enter the code in **Promo code** and press **Apply**. Codes are **not case-sensitive** and spaces around the code are ignored.
2. A valid code shows **Promo <CODE> applied**, a **Discount (<CODE>)** line such as **-$5.00**, and updated totals.
3. Errors appear in an alert and no discount is applied:

| Situation | Message |
|---|---|
| Empty input | Enter a promo code |
| Code that does not exist | Promo code is not valid |
| Expired code | This promo code has expired |
| Minimum not met | FLAT20 needs an items subtotal of at least $100.00 |
| A code is already applied | Only one promo code can be used per order |

4. The minimum order value is checked against the **items subtotal before tax and before any discount**.
5. **Only one promo code per order.** To use a different code, press **Remove promo code** first.
6. Percentage discounts are rounded to the nearest cent.
`,
    prompts: [
      'This is a decision table. List the conditions (which code, is it active, is the minimum met, is a code already applied) and the combinations worth a test each.',
      'Where exactly is the edge of "at least $100.00", and which product quantities land you on it? (Product prices are on the products page.)',
      'What happens if a shopper tries to be greedy?',
    ],
  },
  {
    id: 'step7',
    title: 'Order totals & confirmation',
    summary: 'Subtotal, discount, 8% tax, rounding, order number and the receipt in a new tab.',
    where: '/review.html → /confirmation.html → /receipt.html',
    tag: '@step7',
    hiddenBugs: 4,
    spec: `
**User story.** As a shopper, I want to see exactly what I will pay, place the order, and keep a receipt.

**Calculation rules** (shown on the review page as Items subtotal, Discount, Tax (8%) and Total)

1. Line total = unit price × quantity. Items subtotal = the sum of line totals.
2. Discount = the promo code discount (step 6), or nothing.
3. **Tax = 8% of (items subtotal − discount)**, rounded to the **nearest cent** (half a cent rounds up).
4. **Total = items subtotal − discount + tax.** Every amount is shown with two decimals, e.g. \`$53.10\`.
5. Worked example: subtotal $80.00 with SAVE10 → discount $8.00 → tax 8% of $72.00 = $5.76 → total $77.76.

**Placing the order**

6. **Place order** shows **Placing order…** briefly, then the confirmation page: heading **Thank you for your order!**,
   **Order number** in the format \`QS-\` followed by 6 digits, and **Total paid**, which equals the total on the review page.
7. **View receipt** opens the receipt **in a new tab**. The receipt shows the same order number, the items, and the same subtotal, discount, tax and total.
8. After the order is placed, **the cart is empty** (the badge is hidden and the cart page says **Your cart is empty.**). Each order gets a new order number.
`,
    prompts: [
      'Pick carts whose amounts make rounding matter. Can you compute the expected total by hand before you write the assertion?',
      'Which rule only shows up when a promo code is applied?',
      'Two pages show the same order. What should be identical, and what happens to the cart afterwards?',
    ],
  },
  {
    id: 'step8',
    title: 'REST API',
    summary: 'Token login, products, and orders with the right status codes.',
    where: '/api/… (use the request fixture)',
    tag: '@step8',
    hiddenBugs: 5,
    spec: `
**User story.** As a partner developer, I want a JSON API to read products and manage my orders.

All responses are JSON. Errors always have the shape \`{ "error": "<message>" }\`.

| Request | Success | Errors |
|---|---|---|
| \`POST /api/login\` with \`{ "username", "password" }\` | **200** \`{ "token", "username" }\` | 400 missing field · 401 wrong credentials · 403 locked account |
| \`GET /api/products\` (optional \`?category=Home\`) | **200** array of \`{ id, name, price, category }\` | none |
| \`GET /api/products/{id}\` | **200** the product | **404** unknown id |
| \`POST /api/orders\` with \`{ "items": [{ "productId": 1, "quantity": 2 }] }\` | **201 Created**, the order: \`{ id, owner, status, items, subtotal, discount, tax, total }\` | 400 invalid body · 401 no/invalid token |
| \`GET /api/orders\` | **200** array of **your** orders | 401 no/invalid token |
| \`GET /api/orders/{id}\` | **200** the order | 401 · **404** if it does not exist **or belongs to another user** |
| \`DELETE /api/orders/{id}\` | **204** no body | 401 · **404** if it does not exist **or belongs to another user** |

**Rules**

1. Every \`/api/orders\` endpoint needs the header \`Authorization: Bearer <token>\` (the token comes from \`POST /api/login\`). Without a valid token the status is **401** with \`{ "error": "Authentication required" }\`.
2. Users can only see and delete **their own** orders. Another user's order behaves exactly as if it did not exist (404).
3. An order body is valid when \`items\` is a non-empty array, every \`productId\` exists, and every \`quantity\` is a whole number **from 1 to 10**. Otherwise **400**.
4. Order totals follow the step 7 rules (no promo codes in the API): tax is 8%, rounded to the nearest cent.
`,
    prompts: [
      'For each endpoint, what are the "who" questions: no token, a wrong token, the right user, a different user?',
      'Status codes are part of the contract. Which exact codes does the table promise, and do you assert them exactly?',
      'Which request-body values sit on the edges of the rules?',
    ],
  },
];
