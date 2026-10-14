import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-objects-strings',
  phase: 'javascript',
  order: 3,
  title: 'Objects, Classes and Strings',
  subtitle:
    'Objects as test data and config, destructuring and spread, reference vs value, shallow vs deep copies, JSON, classes for Page Objects, string methods for assertions, regex basics and the classic string interview problems.',
  estimatedMinutes: 110,
  sources: [
    'javascript.info: Objects, Object references and copying, Destructuring assignment, Object.keys/values/entries, JSON methods, Classes (basic syntax, inheritance), Strings, Regular expressions (patterns and flags, character classes, quantifiers)',
    'MDN Web Docs: Working with objects, Spread syntax, structuredClone(), The structured clone algorithm, JSON, Classes, String, Regular expressions guide',
    "Kyle Simpson: You Don't Know JS Yet: Objects & Classes (references, copies, class mechanics)",
    'Marijn Haverbeke: Eloquent JavaScript (4th ed), Ch 4 Data Structures: Objects and Arrays (mutability, deep comparison exercise), Ch 6 The Secret Life of Objects, Ch 9 Regular Expressions',
    'Playwright docs: Page object models (class with constructor(page) and locator fields)',
    'GeeksforGeeks: JavaScript Interview Questions (string reverse, palindrome, char count, comparing objects, spread output)',
  ],
  tags: ['javascript', 'objects', 'destructuring', 'spread', 'reference', 'deep-copy', 'structuredClone', 'json', 'classes', 'page-object', 'strings', 'regex', 'interview-coding'],
  cheatSheet: [
    'Object = key/value pairs: `{ username: "standard_user", password: "secret_sauce" }`. Dot for fixed names, brackets for dynamic or hyphenated keys (`row["first-name"]`, `data[field]`).',
    'Destructuring: `const { page } = fixtures`, `const { user: name = "guest", ...rest } = obj`, `const [first, second] = list`.',
    'Spread for overrides: `{ ...defaults, ...overrides }`, later keys win. Rest collects the remainder.',
    'Object.keys/values/entries give arrays; keys order: integer-like keys ascending first, then string keys in insertion order.',
    'Primitives are copied by value; objects/arrays are shared by reference. `a === b` for objects means "same object", not "same content".',
    'Spread / Object.assign = shallow copy (nested objects still shared). `structuredClone(obj)` = deep copy (no functions, class instances lose their prototype).',
    'JSON.stringify drops undefined and functions, turns NaN/Infinity into null and Dates into strings; JSON.parse needs double-quoted keys and no trailing commas.',
    'Classes: `constructor(page)` stores state on `this`; methods use `this.x`; `extends` + `super(page)` (must call super before using this in a subclass). This is the Page Object Model.',
    'Strings are immutable; every method returns a new string. Assert text with `trim()`, `toLowerCase()`, `includes`, `startsWith`, exact `===`.',
    '`replace("a","b")` replaces the FIRST match only; use `replaceAll` or a regex with `g`.',
    'Regex basics: `\\d` digit, `\\w` word char, `\\s` space, `+` one-or-more, `?` optional, `^$` anchors, `( )` capture, `g` global, `i` ignore case. `"of 245".match(/\\d+/)[0]` gives "245".',
    'Interview classics: reverse (loop from the end, or `[...s].reverse().join("")`), palindrome (normalise then compare), frequency map (`freq[ch] = (freq[ch] ?? 0) + 1`), first non-repeating char (two passes), deep equal (recursive).',
  ],
  sections: [
    {
      heading: 'Objects: key-value pairs for test data and config',
      body: `**Intuition:** an object is a filled-in form: field names (keys) and their values. A test-data row "username: standard_user, password: secret_sauce, expected: Products" is naturally one object.

**Creating and reading**
- Literal: \`const user = { username: 'standard_user', password: 'secret_sauce' };\`
- Read: \`user.username\`; missing keys give \`undefined\` (no error).
- Add/change: \`user.role = 'customer';\` Remove: \`delete user.role;\`
- Check a key exists: \`'role' in user\` or \`Object.hasOwn(user, 'role')\` (better than \`if (user.role)\`, which fails for \`0\`, \`''\`, \`false\`).
- **Shorthand** when a variable has the same name: \`{ username, password }\`.
- **Methods** are functions stored as values: \`{ login() { ... } }\`.
- Values can be anything, including nested objects and arrays, which is exactly the shape of API JSON.

**Where testers use objects**

| Use | Example |
|---|---|
| Test data | \`{ firstname: 'Jim', lastname: 'Brown', totalprice: 111 }\` for Restful Booker |
| Config | \`playwright.config\` exports one big object: \`{ use: { baseURL, trace: 'on-first-retry' }, retries: 2 }\` |
| Options | \`page.getByRole('button', { name: 'Login', exact: true })\` |
| Fixtures | \`async ({ page, request }) => ...\` receives an object of fixtures |
| Lookup tables | \`const users = { standard: {...}, locked: {...} }\` then \`users[type]\` |`,
      code: [
        {
          language: 'javascript',
          title: 'Test data as objects',
          code: `const username = 'standard_user';
const loginData = {
  username,                     // shorthand for username: username
  password: 'secret_sauce',
  expected: { url: '/inventory.html', title: 'Products' }, // nested object
  tags: ['@smoke', '@login'],                              // array value
};

console.log(loginData.expected.title); // → Products
console.log(loginData.tags[0]);        // → @smoke
console.log(loginData.missing);        // → undefined (no error)

loginData.attempts = 0;                // add a key
console.log('attempts' in loginData);  // → true
console.log(loginData.attempts ? 'has attempts' : 'no attempts'); // → no attempts (0 is falsy!)
console.log(Object.hasOwn(loginData, 'attempts')); // → true (correct existence check)

delete loginData.attempts;
console.log(Object.hasOwn(loginData, 'attempts')); // → false

// A lookup table of users by type
const users = {
  standard: { username: 'standard_user' },
  locked: { username: 'locked_out_user', error: 'Sorry, this user has been locked out.' },
};
console.log(users.locked.error.startsWith('Sorry')); // → true`,
        },
      ],
      keyPoints: [
        'Objects are the natural shape of test data, config, options and API JSON.',
        'Missing keys read as `undefined` silently.',
        'Use `in` / `Object.hasOwn` to test existence, not truthiness.',
      ],
      source: 'javascript.info: Objects; MDN: Working with objects',
    },
    {
      heading: 'Dot vs bracket notation',
      body: `**Intuition:** dot notation is calling someone by a name you know in advance; bracket notation is reading the name off a card at runtime.

| | Dot \`obj.key\` | Bracket \`obj[expr]\` |
|---|---|---|
| Key known while writing code | Yes | Yes |
| Key in a variable | No | **Yes**: \`obj[field]\` |
| Key with \`-\`, spaces, or starting with a digit | No | **Yes**: \`obj['first-name']\`, \`obj['2fa']\` |
| Readability | Best | Fine |

**Computed keys** build objects with dynamic names: \`{ [field]: value }\`.

**Common bugs**
- \`obj.field\` when you meant \`obj[field]\`: it looks up the literal key "field" and returns \`undefined\`.
- \`obj[username]\` when you meant \`obj['username']\`: it uses the *value* of the variable \`username\` as the key.

**Data-driven testing:** loop over field names and read/write values with brackets, e.g. validating that every required field in a form-data object is present.`,
      code: [
        {
          language: 'javascript',
          title: 'Dynamic keys in data-driven checks',
          code: `const formRow = { 'first-name': 'Jim', 'last-name': 'Brown', zip: '560001' };

console.log(formRow['first-name']); // → Jim
console.log(formRow.zip);           // → 560001

const field = 'last-name';
console.log(formRow[field]);  // → Brown
console.log(formRow.field);   // → undefined  (looks for a key literally named "field")

// Validate required fields with a loop + brackets
const required = ['first-name', 'last-name', 'zip', 'email'];
const missing = required.filter((key) => !formRow[key]);
console.log(missing); // → [ 'email' ]

// Computed key when building an object
const errorField = 'zip';
const expectedError = { [errorField]: 'Postal Code is required' };
console.log(expectedError); // → { zip: 'Postal Code is required' }

// Optional chaining works with brackets too
const response = { data: null };
console.log(response.data?.['first-name'] ?? 'no data'); // → no data`,
        },
      ],
      keyPoints: [
        'Use brackets for keys in variables or with special characters.',
        '`obj.field` and `obj[field]` are different lookups.',
        '`{ [key]: value }` creates computed keys.',
      ],
      source: 'javascript.info: Objects (square brackets, computed properties)',
    },
    {
      heading: 'Destructuring: unpacking objects and arrays',
      body: `**Intuition:** destructuring is unpacking a delivery box straight onto labelled shelves instead of taking items out one at a time.

**Object destructuring** matches by **key name**: \`const { username, password } = user;\`
- **Rename:** \`const { username: name } = user;\` (key \`username\` into variable \`name\`).
- **Default** (for \`undefined\` only): \`const { role = 'customer' } = user;\`
- **Nested:** \`const { expected: { title } } = data;\`
- **Rest:** \`const { password, ...safeUser } = user;\` (handy for logging without secrets).

**Array destructuring** matches by **position**: \`const [first, , third] = rows;\`, also used for swapping \`[a, b] = [b, a]\`.

**In function parameters**, this is everywhere in Playwright: \`test('x', async ({ page, request }) => {...})\` destructures the fixtures object; \`const [response] = await Promise.all([...])\` destructures an array.

**Common mistake:** destructuring from \`undefined\` throws (\`const { a } = undefined\` → TypeError). Give parameter objects a default: \`function f({ timeout = 5000 } = {})\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Destructuring like Playwright does',
          code: `const testData = {
  user: 'standard_user',
  password: 'secret_sauce',
  expected: { title: 'Products', count: 6 },
};

const { user, expected: { title, count } } = testData; // nested
console.log(user, title, count); // → standard_user Products 6

const { user: login, role = 'customer' } = testData;   // rename + default
console.log(login, role); // → standard_user customer

const { password, ...safeToLog } = testData;           // rest: drop the secret
console.log(safeToLog); // → { user: 'standard_user', expected: { title: 'Products', count: 6 } }

// Array destructuring by position
const [firstPrice, , thirdPrice] = ['$29.99', '$9.99', '$15.99'];
console.log(firstPrice, thirdPrice); // → $29.99 $15.99

// Parameter destructuring with defaults (like ({ page }) in tests)
function openPage({ path = '/', timeout = 5000 } = {}) {
  return \`goto \${path} (timeout \${timeout})\`;
}
console.log(openPage({ path: '/cart.html' })); // → goto /cart.html (timeout 5000)
console.log(openPage());                       // → goto / (timeout 5000)`,
        },
      ],
      keyPoints: [
        'Object destructuring is by key; array destructuring is by position.',
        'Defaults apply for `undefined` only.',
        '`({ page })` in a Playwright test is parameter destructuring.',
      ],
      source: 'javascript.info: Destructuring assignment; MDN: Destructuring',
    },
    {
      heading: 'Spread and rest with objects',
      body: `**Intuition:** spread \`...\` pours the contents of one container into another. Rest \`...\` scoops up "whatever is left".

**Spread in object literals:** \`{ ...a, ...b }\` copies own enumerable properties of \`a\`, then \`b\`. **Later keys win**, which gives the most useful test-data pattern:

\`const user = { ...defaults, ...overrides };\`

- Defaults first, overrides last → explicit values (even \`false\`, \`0\`, \`''\`) win.
- Reverse the order and your overrides are silently ignored.
- Spread of \`null\`/\`undefined\` is allowed and adds nothing (\`{ ...undefined }\` → \`{}\`).

**Rest in destructuring** (\`const { password, ...rest } = obj\`) and **rest parameters** (\`function f(...args)\`) collect the remainder.

**Arrays:** \`[...list, newItem]\` builds a new array (non-mutating); \`Math.max(...prices)\` spreads an array into arguments.

**Important:** spread makes a **shallow** copy. Nested objects are still shared; see "Reference vs value" and "Shallow vs deep copy".`,
      code: [
        {
          language: 'javascript',
          title: 'Defaults + overrides for booking data',
          code: `const defaultBooking = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  additionalneeds: 'Breakfast',
};

const negativeCase = { ...defaultBooking, totalprice: -1, depositpaid: false };
console.log(negativeCase.totalprice, negativeCase.depositpaid); // → -1 false
console.log(defaultBooking.totalprice);                         // → 111 (original untouched)

// Order matters: later keys win
const wrongOrder = { totalprice: -1, ...defaultBooking };
console.log(wrongOrder.totalprice); // → 111 (override lost!)

// Factory using spread; overrides may be omitted
const buildBooking = (overrides = {}) => ({ ...defaultBooking, ...overrides });
console.log(buildBooking({ firstname: '' }).firstname === ''); // → true (empty string kept)

// Remove a field to test "missing required field"
const { lastname, ...withoutLastname } = defaultBooking;
console.log(Object.keys(withoutLastname)); // → [ 'firstname', 'totalprice', 'depositpaid', 'additionalneeds' ]

// Spread arrays into arguments
const prices = [29.99, 9.99, 49.99];
console.log(Math.max(...prices)); // → 49.99`,
        },
      ],
      keyPoints: [
        '`{ ...defaults, ...overrides }`: overrides last.',
        'Rest destructuring is an easy way to build "missing field" negative cases.',
        'Spread is shallow.',
      ],
      source: 'MDN: Spread syntax; javascript.info: Rest parameters and spread syntax',
    },
    {
      heading: 'Object.keys, values and entries',
      body: `**Intuition:** these three turn an object into a list so you can loop over it: just the labels, just the contents, or label-content pairs.

| Method | Returns | Typical use |
|---|---|---|
| \`Object.keys(obj)\` | \`['user', 'role']\` | Check which fields exist; compare key sets |
| \`Object.values(obj)\` | \`['qa', 'admin']\` | Sum or validate all values |
| \`Object.entries(obj)\` | \`[['user','qa'], ['role','admin']]\` | Loop over pairs with \`for (const [k, v] of ...)\` |
| \`Object.fromEntries(pairs)\` | object | Build an object back, e.g. after filtering |

**Key order rule:** integer-like keys (\`'1'\`, \`'10'\`) come first in ascending numeric order, then other string keys in insertion order. So do not rely on key order when comparing API objects; compare by key.

**Worked example:** fill a form from a data object, and verify an API response has exactly the expected fields (a contract check).`,
      code: [
        {
          language: 'javascript',
          title: 'Looping over form data and checking API fields',
          code: `const checkoutForm = { firstName: 'Jim', lastName: 'Brown', postalCode: '560001' };

// Pretend "fill" (in Playwright: await page.getByTestId(key).fill(value))
for (const [field, value] of Object.entries(checkoutForm)) {
  console.log(\`fill \${field} = \${value}\`);
}
// → fill firstName = Jim
// → fill lastName = Brown
// → fill postalCode = 560001

// Contract check: response must have exactly these keys
const apiBody = { bookingid: 7, booking: {}, debug: true };
const expectedKeys = ['bookingid', 'booking'];
const actualKeys = Object.keys(apiBody);
const unexpected = actualKeys.filter((k) => !expectedKeys.includes(k));
const absent = expectedKeys.filter((k) => !actualKeys.includes(k));
console.log({ unexpected, absent }); // → { unexpected: [ 'debug' ], absent: [] }

// Sum values, then rebuild a filtered object
const cartPrices = { backpack: 29.99, bikeLight: 9.99, onesie: 7.99 };
const totalCents = Object.values(cartPrices).reduce((s, p) => s + Math.round(p * 100), 0);
console.log(totalCents / 100); // → 47.97
const under10 = Object.fromEntries(Object.entries(cartPrices).filter(([, p]) => p < 10));
console.log(under10); // → { bikeLight: 9.99, onesie: 7.99 }

// Key order: integer-like keys first
console.log(Object.keys({ b: 1, a: 2, 10: 'x', 2: 'y' })); // → [ '2', '10', 'b', 'a' ]`,
        },
      ],
      keyPoints: [
        'keys/values/entries turn objects into arrays you can loop and filter.',
        '`for (const [k, v] of Object.entries(o))` is the cleanest object loop.',
        'Never rely on key order for equality checks.',
      ],
      source: 'javascript.info: Object.keys, values, entries; MDN: Object.entries',
    },
    {
      heading: 'Reference vs value',
      body: `**Intuition:** a primitive is like handing someone a photocopy; they can scribble on it and your original stays clean. An object is like handing someone the address of your house; anyone with the address walks into the *same* house and can move the furniture.

**Primitives** (string, number, boolean, null, undefined, bigint, symbol) are **copied by value**. Assigning or passing them creates an independent copy.

**Objects** (including arrays, functions, dates, class instances) are **stored by reference**. A variable holds a reference (address); \`const b = a\` copies the *reference*, so \`a\` and \`b\` point to the **same** object. Passing an object into a function passes the reference too, so the function can mutate the caller's object.

**Equality follows the same rule:** \`===\` on objects asks "is this the same object?", not "does it have the same content?". \`{ a: 1 } === { a: 1 }\` is \`false\`. For content equality, use a deep comparison (\`expect(a).toEqual(b)\` in Playwright, or a deepEqual function).

**Why testers care: shared test data bugs**
1. A data file exports \`validUser\`; test A does \`const u = validUser; u.email = 'x'\`; test B (same worker) now sees email 'x'. Order-dependent failures.
2. A helper "updates" a booking object you passed in and your expected-value object changes with it, so the assertion compares the object with itself and always passes.
3. Comparing two API responses with \`===\` always fails even when identical.

**In interviews, say this:** "Primitives are copied by value, objects by reference. Assigning an object copies the reference, so mutations are visible through every variable. To compare content I use deep equality, and to avoid shared-state bugs I create fresh data per test or deep-copy with structuredClone."`,
      code: [
        {
          language: 'javascript',
          title: 'Same house, two addresses',
          code: `// Primitives: independent copies
let expectedCount = 6;
let actualCount = expectedCount;
actualCount = 5;
console.log(expectedCount, actualCount); // → 6 5

// Objects: shared reference
const validUser = { name: 'standard_user', email: 'qa@test.com' };
const testUser = validUser;          // copies the reference, not the object
testUser.email = 'changed@test.com';
console.log(validUser.email);        // → changed@test.com (both point to one object)
console.log(testUser === validUser); // → true

// Functions receive the reference too
function markVip(user) { user.vip = true; }
markVip(validUser);
console.log(validUser.vip);          // → true (caller's object mutated)

// Equality is identity, not content
console.log({ id: 1 } === { id: 1 });   // → false
console.log([1, 2] === [1, 2]);         // → false
const copy = { ...validUser };
console.log(copy === validUser, copy.name === validUser.name); // → false true

// The "assertion compares the object with itself" trap
const expected = validUser;
validUser.email = 'bug@test.com';
console.log(expected.email === validUser.email); // → true (always passes, tests nothing)`,
        },
      ],
      diagram: `   stack (variables)              heap (objects)
  +-------------------+
  | expectedCount: 6  |   primitives live in the variable itself
  | actualCount:   5  |
  | validUser  ---------+
  | testUser   ---------+-->  { name: 'standard_user',
  | expected   ---------+       email: 'bug@test.com', vip: true }
  +-------------------+    three variables, ONE object`,
      keyPoints: [
        'Primitives copy by value; objects and arrays copy by reference.',
        '`===` on objects checks identity.',
        'Functions can mutate objects you pass them.',
        'Shared mutable test data is a top cause of order-dependent flaky tests.',
      ],
      source: "javascript.info: Object references and copying; Kyle Simpson: You Don't Know JS Yet: Get Started (values vs references)",
    },
    {
      heading: 'Shallow vs deep copy with structuredClone',
      body: `**Intuition:** a shallow copy is a new folder holding the *same* inner documents; a deep copy photocopies every page in every inner folder too.

| Technique | Depth | Keeps Dates/Maps/Sets | Keeps functions / class methods | Notes |
|---|---|---|---|---|
| \`{ ...obj }\`, \`Object.assign({}, obj)\`, \`[...arr]\` | Shallow | Shares them | Copies the property (still the same function) | Nested objects shared |
| \`JSON.parse(JSON.stringify(obj))\` | Deep | No: Dates become strings, Maps become \`{}\` | Drops functions and \`undefined\` | Old trick, lossy |
| \`structuredClone(obj)\` | Deep | **Yes** | **No**: functions throw \`DataCloneError\`; class instances become plain objects | Built into Node 17+ and browsers; handles circular references |

**Rule of thumb for test data:** plain data (what you would put in a JSON file) → \`structuredClone\`. Objects with behaviour (Page Objects, clients) → do not copy; create a new instance.

**Even better than copying:** a **factory function** that builds fresh data each call (\`buildUser()\`), so there is nothing shared to copy in the first place.`,
      code: [
        {
          language: 'javascript',
          title: 'Shallow copy leaks; structuredClone does not',
          code: `const baseOrder = {
  id: 101,
  address: { city: 'Pune', zip: '411001' },
  items: ['backpack'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
};

const shallow = { ...baseOrder };
shallow.id = 202;                 // top level: independent
shallow.address.city = 'Delhi';   // nested: SHARED
shallow.items.push('bike-light'); // nested array: SHARED
console.log(baseOrder.id, baseOrder.address.city, baseOrder.items);
// → 101 Delhi [ 'backpack', 'bike-light' ]

const deep = structuredClone(baseOrder);
deep.address.city = 'Mumbai';
console.log(baseOrder.address.city, deep.address.city); // → Delhi Mumbai
console.log(deep.createdAt instanceof Date);             // → true (Dates survive)

// JSON round-trip is lossy
const viaJson = JSON.parse(JSON.stringify(baseOrder));
console.log(typeof viaJson.createdAt);                   // → string

// structuredClone limits
try {
  structuredClone({ login() {} });
} catch (e) {
  console.log(e.name); // → DataCloneError
}
class Product { constructor(n) { this.name = n; } label() { return this.name; } }
const cloned = structuredClone(new Product('Onesie'));
console.log(cloned.name, cloned instanceof Product); // → Onesie false (methods lost)`,
        },
      ],
      keyPoints: [
        'Spread/Object.assign copy one level only.',
        '`structuredClone` deep-copies data, keeps Dates/Maps/Sets, rejects functions.',
        'JSON round-trip loses Dates, undefined and functions.',
        'Factories that build fresh data beat copying.',
      ],
      source: 'MDN: structuredClone(), The structured clone algorithm; javascript.info: Object references and copying',
    },
    {
      heading: 'JSON: stringify and parse',
      body: `**Intuition:** JSON is the shipping format for data. \`JSON.stringify\` packs a JavaScript object into a text parcel; \`JSON.parse\` unpacks text back into objects. Every API test you write sends and receives JSON.

**JSON rules (stricter than JS objects):** keys in **double quotes**, strings in double quotes, no trailing commas, no comments, no functions, no \`undefined\`. Values: string, number, boolean, null, array, object.

**JSON.stringify(value, replacer, space)**
- \`JSON.stringify(obj, null, 2)\` pretty-prints with 2-space indent, great for logs and attaching to reports.
- Properties with \`undefined\` or function values are **dropped**; in arrays they become \`null\`.
- \`NaN\` and \`Infinity\` become \`null\`; \`Date\` becomes an ISO string.

**JSON.parse(text)** throws \`SyntaxError\` on invalid JSON (single quotes, trailing comma, HTML error page instead of JSON). In API tests, a parse failure is often the first sign the server returned an HTML 502 page instead of JSON.

**In Playwright:** \`await response.json()\` parses for you; \`request.post(url, { data: obj })\` stringifies for you. You still use JSON directly for reading test-data files and building logs.`,
      code: [
        {
          language: 'javascript',
          title: 'Round-tripping test data and catching bad JSON',
          code: `const booking = {
  firstname: 'Jim',
  totalprice: 111,
  bookingdates: { checkin: '2025-01-01', checkout: '2025-01-05' },
  notes: undefined,            // will be dropped
};

const body = JSON.stringify(booking);
console.log(body);
// → {"firstname":"Jim","totalprice":111,"bookingdates":{"checkin":"2025-01-01","checkout":"2025-01-05"}}

console.log(JSON.stringify({ n: NaN, when: new Date(0), list: [undefined] }));
// → {"n":null,"when":"1970-01-01T00:00:00.000Z","list":[null]}

const parsed = JSON.parse(body);
console.log(parsed.bookingdates.checkin); // → 2025-01-01
console.log(parsed === booking);          // → false (a brand-new object)

// Invalid JSON throws: single quotes or an HTML error page
for (const text of ["{'id': 1}", '<html>502 Bad Gateway</html>']) {
  try {
    JSON.parse(text);
  } catch (e) {
    console.log(e.name); // → SyntaxError (printed twice)
  }
}

// Pretty-print for readable logs
console.log(JSON.stringify({ id: 1, ok: true }, null, 2).split('\\n').length); // → 4`,
        },
      ],
      keyPoints: [
        'JSON needs double quotes, no trailing commas, no undefined/functions.',
        'stringify drops undefined properties; NaN → null; Date → string.',
        '`JSON.parse` throws SyntaxError on invalid text (often an HTML error page).',
      ],
      source: 'javascript.info: JSON methods, toJSON; MDN: JSON.stringify, JSON.parse',
    },
    {
      heading: 'Classes for Page Objects: constructor, methods and extends',
      body: `**Intuition:** a class is a blueprint; each object created with \`new\` is a house built from it. In the Page Object Model, the blueprint describes one page of the app (its elements and actions), and each test builds its own instance around its own \`page\`.

**Syntax essentials**
- \`class LoginPage { constructor(page) { this.page = page; } }\`: the constructor runs on \`new LoginPage(page)\` and stores state on \`this\`.
- **Methods** are written without \`function\`: \`login(user, pass) { ... }\`. Inside, always use \`this.\` to reach fields.
- **Inheritance:** \`class InventoryPage extends BasePage\`. A subclass constructor **must call \`super(...)\` before using \`this\`**; otherwise \`ReferenceError: Must call super constructor...\`.
- \`super.method()\` calls the parent's version (e.g. a shared \`open()\`).
- **Getters** (\`get title() {...}\`) read like properties; \`#private\` fields hide internals; \`static\` members belong to the class itself.
- Class bodies are always **strict mode**, which is why a detached method has \`this === undefined\`.

**How this maps to Playwright** (from the official POM guide): the constructor receives \`page\` and creates **locators** as fields (\`this.usernameInput = page.getByPlaceholder('Username')\`), and methods are \`async\` actions (\`async login(u, p) { await this.usernameInput.fill(u); ... }\`). The snippet below uses a fake page that records actions so it runs in plain Node.

**Design tips:** keep locators and actions in the page object; keep assertions mostly in tests (a debated point covered in the POM topic); pass credentials in as arguments instead of hard-coding them.`,
      code: [
        {
          language: 'javascript',
          title: 'A runnable Page Object skeleton (fake page)',
          code: `class FakePage {               // stands in for Playwright's page
  constructor() { this.actions = []; this.url = ''; }
  goto(path) { this.url = path; this.actions.push(\`goto \${path}\`); }
  fill(sel, value) { this.actions.push(\`fill \${sel}\`); }
  click(sel) { this.actions.push(\`click \${sel}\`); }
}

class BasePage {
  constructor(page, path) {
    this.page = page;
    this.path = path;
  }
  open() { this.page.goto(this.path); return this; }
  get isOpen() { return this.page.url === this.path; } // getter
}

class LoginPage extends BasePage {
  constructor(page) {
    super(page, '/');                 // must come before using this
    this.username = '#user-name';     // in Playwright: page.getByPlaceholder('Username')
    this.password = '#password';
    this.submit = '#login-button';
  }
  login(user, pass) {
    this.page.fill(this.username, user);
    this.page.fill(this.password, pass);
    this.page.click(this.submit);
  }
}

const page = new FakePage();
const loginPage = new LoginPage(page);
loginPage.open().login('standard_user', 'secret_sauce');
console.log(loginPage.isOpen);                  // → true
console.log(page.actions.join(' | '));
// → goto / | fill #user-name | fill #password | click #login-button
console.log(loginPage instanceof BasePage);     // → true
console.log(typeof LoginPage);                  // → function (classes are special functions)`,
        },
      ],
      keyPoints: [
        'constructor stores state on `this`; methods use `this.` for every field.',
        'Subclass constructors must call `super()` first.',
        'POM: constructor(page) + locator fields + async action methods.',
        'Classes are strict mode; detached methods lose `this`.',
      ],
      source: 'javascript.info: Class basic syntax, Class inheritance; Playwright docs: Page object models; Marijn Haverbeke: Eloquent JavaScript, Ch 6',
    },
    {
      heading: 'Strings and string methods for assertions',
      body: `**Intuition:** almost everything a UI test reads (headings, error messages, prices, counts) arrives as a string. String methods are your toolkit for normalising that text before you compare it.

**Basics:** strings are **immutable**: \`s[0] = 'X'\` does nothing (or throws a TypeError in strict code such as ES modules); every method returns a new string. Index with \`s[0]\` or \`s.at(-1)\` (last char). \`length\` counts UTF-16 code units (emoji count as 2).

| Method | Example → result | Test use |
|---|---|---|
| \`trim()\` | \`'  Products '\` → \`'Products'\` | Remove stray whitespace from \`textContent\` |
| \`toLowerCase()\` / \`toUpperCase()\` | \`'SWAG'\` → \`'swag'\` | Case-insensitive compare |
| \`includes(x)\` | \`'Thank you for your order!'.includes('order')\` → true | Partial message match |
| \`startsWith\` / \`endsWith\` | \`url.endsWith('/inventory.html')\` | URL and prefix checks |
| \`indexOf(x)\` | -1 when not found | Position, legacy contains check |
| \`slice(start, end)\` | \`'$29.99'.slice(1)\` → \`'29.99'\` | Cut symbols; negative indexes count from the end |
| \`split(sep)\` | \`'a,b'.split(',')\` → \`['a','b']\` | Parse CSV-ish text, words |
| \`replace\` / \`replaceAll\` | \`'1,299'.replace(',', '')\` | \`replace\` with a string changes **only the first** match |
| \`padStart(n, ch)\` | \`'7'.padStart(3, '0')\` → \`'007'\` | Order IDs, dates |
| \`repeat(n)\` | \`'a'.repeat(256)\` | Boundary test data (max length) |

**Comparing strings:** \`===\` is exact. \`<\`/\`>\` compare by character code (\`'Z' < 'a'\` is true). Use \`a.localeCompare(b)\` for human alphabetical order, e.g. verifying "Name (A to Z)" sorting on SauceDemo.

**In Playwright** you usually let web-first assertions do the normalising: \`toHaveText\` normalises whitespace, accepts a regex, and retries; \`toContainText\` matches a substring. Plain string methods are for values you have already read or for API bodies.`,
      code: [
        {
          language: 'javascript',
          title: 'Normalising UI text before comparing',
          code: `const heading = '  Products \\n';
console.log(heading === 'Products');        // → false
console.log(heading.trim() === 'Products'); // → true

const msg = 'Epic sadface: Username is required';
console.log(msg.includes('Username is required')); // → true
console.log(msg.toLowerCase().startsWith('epic sadface')); // → true

const priceText = '$1,299.00';
console.log(priceText.replace(',', '').slice(1));  // → 1299.00
console.log('1,2,3'.replace(',', ''));              // → 12,3  (first match only)
console.log('1,2,3'.replaceAll(',', ''));           // → 123

// Strings are immutable
let status = 'pending';
status[0] = 'P';                     // ignored here; throws TypeError in strict mode / ES modules
console.log(status);                 // → pending
console.log(status.toUpperCase(), status); // → PENDING pending

// Boundary data for a 50-char field
const maxName = 'a'.repeat(50), overMax = 'a'.repeat(51);
console.log(maxName.length, overMax.length); // → 50 51

// Alphabetical sort verification
const names = ['Sauce Labs Backpack', 'sauce labs onesie', 'Test.allTheThings() T-Shirt'];
console.log('Sauce' < 'sauce');                       // → true (uppercase codes are smaller)
console.log(names[0].localeCompare(names[1]) < 0);    // → true (human order)`,
        },
      ],
      keyPoints: [
        'Strings are immutable; methods return new strings.',
        'Normalise with trim/toLowerCase before exact compares.',
        '`replace(string)` changes only the first match.',
        'Use `localeCompare` for human alphabetical order.',
      ],
      source: 'javascript.info: Strings; MDN: String',
    },
    {
      heading: 'Regex basics for testers',
      body: `**Intuition:** a regular expression is a search pattern with wildcards, like a smart "find" that understands "any digits" or "an email-ish shape".

**The 12 symbols that cover most test needs**

| Pattern | Means | Example |
|---|---|---|
| \`\\d\` | a digit | \`/\\d+/\` matches \`245\` |
| \`\\w\` | letter, digit or _ | \`/\\w+/\` |
| \`\\s\` | whitespace | \`/\\s+/g\` to collapse spaces |
| \`.\` | any char except newline | escape as \`\\.\` for a literal dot |
| \`+\` / \`*\` / \`?\` | 1+, 0+, optional | \`/colou?r/\` |
| \`{2,}\` | 2 or more | \`/[a-z]{2,}/\` |
| \`[abc]\`, \`[^abc]\` | one of / none of | \`/[aeiou]/\` vowels |
| \`^\` \`$\` | start / end of string | \`/^\\d{6}$/\` exactly 6 digits (PIN code) |
| \`( )\` | capture group | \`/\\$(\\d+\\.\\d{2})/\` captures the amount |
| flags \`g\` \`i\` | all matches / ignore case | \`/error/i\` |

**Methods:** \`regex.test(str)\` → boolean; \`str.match(regex)\` → first match with groups, or all matches with \`g\`; \`str.replace(regex, x)\`; \`str.split(regex)\`.

**Where testers use regex:** extracting numbers from text ("Showing 1-10 of 245 results"), validating formats (order IDs, emails, dates) in API responses, and Playwright assertions: \`await expect(page).toHaveURL(/.*inventory/)\`, \`toHaveText(/Thank you/i)\`, \`getByRole('button', { name: /add to cart/i })\`.

**Common mistakes:** forgetting to escape \`.\`, \`$\`, \`(\` when you mean them literally; forgetting anchors, so \`/\\d{6}/\` also matches 7-digit strings; and using a \`g\` regex with \`.test()\` repeatedly (it remembers \`lastIndex\` between calls).`,
      code: [
        {
          language: 'javascript',
          title: 'Extracting and validating with regex',
          code: `// Extract numbers from a results summary
const summary = 'Showing 1-10 of 245 results';
console.log(summary.match(/\\d+/g));            // → [ '1', '10', '245' ]
const total = Number(summary.match(/of (\\d+)/)[1]);
console.log(total);                             // → 245

// Capture the amount from a price label
const label = 'Total: $32.39';
console.log(label.match(/\\$(\\d+\\.\\d{2})/)[1]); // → 32.39

// Validate formats with anchors
const isPin = (s) => /^\\d{6}$/.test(s);
console.log(isPin('560001'), isPin('5600011'), isPin('56A001')); // → true false false
const looksLikeEmail = /^[\\w.+-]+@[\\w-]+\\.[a-z]{2,}$/i;
console.log(looksLikeEmail.test('qa.user+1@test.com')); // → true
console.log(looksLikeEmail.test('qa@test'));            // → false

// Normalise whitespace before comparing
const messy = 'Sauce   Labs\\n  Backpack';
console.log(messy.replace(/\\s+/g, ' '));       // → Sauce Labs Backpack

// Case-insensitive match
console.log(/thank you/i.test('THANK YOU FOR YOUR ORDER')); // → true

// The g + test() lastIndex trap
const g = /a/g;
console.log(g.test('a'), g.test('a'));          // → true false`,
        },
      ],
      keyPoints: [
        '`\\d \\w \\s . + * ? ^ $ ( ) [ ]` plus flags `g`, `i` cover most test needs.',
        'Anchor validation patterns with `^...$`.',
        'Escape `.`, `$`, `(` to match them literally.',
        'Playwright assertions and locators accept regex for flexible matching.',
      ],
      source: 'javascript.info: Regular expressions (patterns and flags, character classes, quantifiers, capturing groups); Marijn Haverbeke: Eloquent JavaScript, Ch 9',
    },
    {
      heading: 'String interview problems: reverse, palindrome, vowels, frequency, first unique',
      body: `**Intuition:** these are the "FizzBuzz" of automation interviews. They check that you can loop, use an object as a counter, and handle edge cases, all skills you use when processing page text.

**The patterns**
1. **Reverse without \`reverse()\`:** loop from the last index down, building a new string. With built-ins: \`[...s].reverse().join('')\` (spread splits by code point, so emoji survive; \`split('')\` breaks them).
2. **Palindrome:** normalise first (lowercase, strip non-alphanumerics), then compare with its reverse, or use **two pointers** moving inwards (no extra string).
3. **Count vowels:** loop and check \`'aeiou'.includes(ch)\`, or \`(s.match(/[aeiou]/gi) ?? []).length\`.
4. **Character frequency:** an object (or \`Map\`) as a counter: \`freq[ch] = (freq[ch] ?? 0) + 1\`.
5. **First non-repeating character:** two passes: build the frequency map, then scan the string again in order and return the first char with count 1. Time O(n).

**What to say aloud:** clarify the contract (case-sensitive? spaces count? empty string?), state the approach, write it, then **test it like a tester**: empty string, one char, all same chars, mixed case, spaces and punctuation, unicode. That last step is where QA candidates shine.`,
      code: [
        {
          language: 'javascript',
          title: 'Five classic string problems',
          code: `function reverse(s) {
  let out = '';
  for (let i = s.length - 1; i >= 0; i--) out += s[i];
  return out;
}
console.log(reverse('Playwright')); // → thgirwyalP
console.log(reverse(''));           // → (empty string)

function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0, right = clean.length - 1;          // two pointers
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++; right--;
  }
  return true;
}
console.log(isPalindrome('A man, a plan, a canal: Panama')); // → true
console.log(isPalindrome('Sauce'));                          // → false

const countVowels = (s) => [...s.toLowerCase()].filter((ch) => 'aeiou'.includes(ch)).length;
console.log(countVowels('Sauce Labs Backpack')); // → 6

function charFrequency(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] ?? 0) + 1;
  return freq;
}
console.log(charFrequency('test')); // → { t: 2, e: 1, s: 1 }

function firstUnique(s) {
  const freq = charFrequency(s);           // pass 1: count
  for (const ch of s) if (freq[ch] === 1) return ch; // pass 2: first with count 1
  return null;
}
console.log(firstUnique('swiss'));   // → w
console.log(firstUnique('aabb'));    // → null`,
        },
      ],
      keyPoints: [
        'Reverse: loop backwards; with built-ins prefer `[...s]` over `split("")` for unicode.',
        'Palindrome: normalise, then two pointers.',
        'Frequency map: `freq[ch] = (freq[ch] ?? 0) + 1`.',
        'First unique: count first, then scan in original order.',
        'Always finish by listing edge-case tests.',
      ],
      source: 'GeeksforGeeks: JavaScript Interview Questions (string manipulation); javascript.info: Strings; Marijn Haverbeke: Eloquent JavaScript, Ch 4',
    },
  ],
  codeChallenges: [
    {
      id: 'js-objects-strings-cc-1',
      title: 'Stop tests from polluting shared booking data',
      context:
        'Several Restful-Booker API tests import `baseBooking` from a data module and tweak it per test. Run alone, each test passes; run together, prices and dates drift, and the "same booking" check never passes even when the API echoes the body perfectly.',
      task: 'Fix the helpers so each test gets an independent copy, nested data is never shared, and the equality check compares content. The tests call `runBookingTests(dateRanges)` (one or more `[checkin, checkout]` pairs), which builds one booking per pair and returns `{ bookings, baseCheckin, echoMatches, sameAsFirst }`: the bookings, the base booking\'s checkin afterwards (must stay "2025-01-01"), whether the last booking equals its JSON echo from the API, and whether the last booking has the same content as the first. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'booking-data.js (buggy)',
        code: `const baseBooking = {
  firstname: 'Jim',
  totalprice: 111,
  bookingdates: { checkin: '2025-01-01', checkout: '2025-01-05' },
};

function withDates(checkin, checkout) {
  const b = { ...baseBooking };          // "copy"
  b.bookingdates.checkin = checkin;      // nested object is shared!
  b.bookingdates.checkout = checkout;
  return b;
}

function sameBooking(sent, received) {
  return sent === received;              // compare the bookings
}

// Entry point the tests call
function runBookingTests(dateRanges) {
  const bookings = dateRanges.map(([checkin, checkout]) => withDates(checkin, checkout));
  const first = bookings[0];
  const last = bookings[bookings.length - 1];
  const echoed = JSON.parse(JSON.stringify(last)); // what the API returns
  return {
    bookings,
    baseCheckin: baseBooking.bookingdates.checkin,
    echoMatches: sameBooking(last, echoed),
    sameAsFirst: sameBooking(first, last),
  };
}

// runBookingTests([['2025-02-01', '2025-02-28'], ['2025-03-01', '2025-03-02']])
// → both bookings show 2025-03-01..2025-03-02 (wrong test data!),
//   baseCheckin '2025-03-01' (base polluted),
//   echoMatches false (even though identical)`,
      },
      hints: [
        'Spread copies one level. What happens to `bookingdates`?',
        'Either build the nested object freshly, or deep-copy the base with a built-in function.',
        '`===` checks identity. You need a recursive, key-by-key comparison (or a test framework\'s toEqual).',
      ],
      solution: {
        language: 'javascript',
        title: 'booking-data.js (fixed)',
        code: `const BASE_BOOKING = Object.freeze({
  firstname: 'Jim',
  totalprice: 111,
  bookingdates: Object.freeze({ checkin: '2025-01-01', checkout: '2025-01-05' }),
});

// Fresh deep copy per call; overrides for nested dates are merged explicitly
function buildBooking({ bookingdates = {}, ...overrides } = {}) {
  const copy = structuredClone(BASE_BOOKING);     // deep: nothing shared
  return { ...copy, ...overrides, bookingdates: { ...copy.bookingdates, ...bookingdates } };
}

// Content comparison (what Playwright's toEqual does for you)
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));
}

function runBookingTests(dateRanges) {
  const bookings = dateRanges.map(([checkin, checkout]) => buildBooking({ bookingdates: { checkin, checkout } }));
  const first = bookings[0];
  const last = bookings[bookings.length - 1];
  const echoed = JSON.parse(JSON.stringify(last));
  return {
    bookings,
    baseCheckin: BASE_BOOKING.bookingdates.checkin, // → 2025-01-01 (untouched)
    echoMatches: deepEqual(last, echoed),           // → true
    sameAsFirst: deepEqual(first, last),
  };
}`,
      },
      explanation: `**Fixes**
1. **Shallow copy:** \`{ ...baseBooking }\` created a new top-level object but \`bookingdates\` still pointed to the single shared nested object, so every test overwrote the same dates and polluted the base. \`structuredClone\` deep-copies, and the nested override is merged into a fresh object.
2. **Freezing the base:** \`Object.freeze\` on the base and its nested object turns any future accidental mutation into a TypeError in strict code (ES modules, classes) instead of a silent cross-test leak.
3. **Identity vs content:** \`sent === received\` is only true for the same object; a parsed API response is always a new object. \`deepEqual\` compares keys and values recursively. In Playwright you would write \`expect(received).toEqual(sent)\`.
4. **Options object with defaults** (\`{ bookingdates = {}, ...overrides } = {}\`) makes \`buildBooking()\` work with no arguments and keeps nested overrides partial.

The tests call \`runBookingTests\` several times in one page load, like several tests importing the same module, so a polluted base shows up in \`baseCheckin\` and in the bookings themselves.`,
      fnName: 'runBookingTests',
      tests: [
        {
          args: [[['2025-02-01', '2025-02-28'], ['2025-03-01', '2025-03-02']]],
          expected: { bookings: [{ firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-02-01', checkout: '2025-02-28' } }, { firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-03-01', checkout: '2025-03-02' } }], baseCheckin: '2025-01-01', echoMatches: true, sameAsFirst: false },
        },
        {
          args: [[['2025-04-10', '2025-04-12']]],
          expected: { bookings: [{ firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-04-10', checkout: '2025-04-12' } }], baseCheckin: '2025-01-01', echoMatches: true, sameAsFirst: true },
        },
        {
          args: [[['2025-05-01', '2025-05-03'], ['2025-05-10', '2025-05-11'], ['2025-05-20', '2025-05-25']]],
          expected: { bookings: [{ firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-05-01', checkout: '2025-05-03' } }, { firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-05-10', checkout: '2025-05-11' } }, { firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-05-20', checkout: '2025-05-25' } }], baseCheckin: '2025-01-01', echoMatches: true, sameAsFirst: false },
        },
        {
          args: [[['2025-01-01', '2025-01-05']]],
          expected: { bookings: [{ firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-01-01', checkout: '2025-01-05' } }], baseCheckin: '2025-01-01', echoMatches: true, sameAsFirst: true },
        },
        {
          args: [[['2025-07-01', '2025-07-04'], ['2025-07-01', '2025-07-04']]],
          expected: { bookings: [{ firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-07-01', checkout: '2025-07-04' } }, { firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-07-01', checkout: '2025-07-04' } }], baseCheckin: '2025-01-01', echoMatches: true, sameAsFirst: true }, hidden: true,
        },
        {
          args: [[['2025-12-24', '2025-12-26'], ['2025-06-01', '2025-06-03']]],
          expected: { bookings: [{ firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-12-24', checkout: '2025-12-26' } }, { firstname: 'Jim', totalprice: 111, bookingdates: { checkin: '2025-06-01', checkout: '2025-06-03' } }], baseCheckin: '2025-01-01', echoMatches: true, sameAsFirst: false }, hidden: true,
        },
      ],
      followUps: [
        {
          q: 'Why not use JSON.parse(JSON.stringify(base)) for the deep copy?',
          a: 'It works for pure JSON-like data, but silently loses Dates (they become strings), drops undefined values and functions, and throws on circular references. structuredClone keeps Dates, Maps and Sets and handles cycles, so it is the safer default. For JSON-only fixtures both behave the same.',
        },
        {
          q: 'What is the difference between toEqual and toStrictEqual in Playwright\'s expect?',
          a: 'toEqual recursively compares values but ignores properties whose value is undefined, so { a: 1, b: undefined } equals { a: 1 }. toStrictEqual also checks undefined properties, array sparseness and object types (a class instance is not equal to a plain object). For API bodies parsed from JSON, toEqual is usually enough.',
        },
      ],
    },
    {
      id: 'js-objects-strings-cc-2',
      title: 'Fix a broken Page Object class hierarchy',
      context:
        'A junior engineer wrote a SauceDemo-style Page Object hierarchy (using a fake page so it runs in Node). It crashes on construction, the login method refers to variables that do not exist, credentials are hard-coded, and the "error visible" check compares text loosely.',
      task: 'Make the classes construct correctly, use instance fields properly, accept credentials as parameters (`login(user, pass)`), and return a precise boolean from `hasLockedOutError()`. The tests call `runLogin(user, pass, errorText)`, which puts `errorText` on a fresh `FakePage`, logs in and returns `{ actions, lockedOut }`: the recorded page actions and the result of `hasLockedOutError()` (true only when the text says "this user has been locked out", in any case). Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'pages.js (buggy)',
        code: `class FakePage {
  constructor() { this.actions = []; this.errorText = ' Epic sadface: Sorry, this user has been locked out. '; }
  fill(sel, v) { this.actions.push(\`fill \${sel}=\${v}\`); }
  click(sel) { this.actions.push(\`click \${sel}\`); }
  textOf() { return this.errorText; }
}

class BasePage {
  constructor(page) { this.page = page; }
}

class LoginPage extends BasePage {
  constructor(page) {
    this.username = '#user-name';      // uses this before super()
    super(page);
    this.password = '#password';
  }
  login() {
    page.fill(username, 'standard_user');  // no this.
    page.fill(password, 'secret_sauce');   // hard-coded credentials
    page.click('#login-button');
  }
  hasLockedOutError() {
    return this.page.textOf().indexOf('locked out');  // returns a number
  }
}

// Entry point the tests call
function runLogin(user, pass, errorText) {
  const page = new FakePage();
  page.errorText = errorText;
  const lp = new LoginPage(page);
  lp.login(user, pass);
  return { actions: page.actions, lockedOut: lp.hasLockedOutError() };
}

// runLogin('standard_user', 'secret_sauce', '')
// → ReferenceError: Must call super constructor in derived class
//   before accessing 'this' or returning from derived constructor`,
      },
      hints: [
        'In a subclass constructor, what must happen before `this` is touched?',
        'Inside a method, how do you reach the page and the selectors stored on the instance?',
        'What does `indexOf` return when the text is not found, and is that truthy?',
      ],
      solution: {
        language: 'javascript',
        title: 'pages.js (fixed)',
        code: `class FakePage {
  constructor() { this.actions = []; this.errorText = ' Epic sadface: Sorry, this user has been locked out. '; }
  fill(sel, v) { this.actions.push(\`fill \${sel}=\${v}\`); }
  click(sel) { this.actions.push(\`click \${sel}\`); }
  textOf() { return this.errorText; }
}

class BasePage {
  constructor(page) { this.page = page; }
}

class LoginPage extends BasePage {
  constructor(page) {
    super(page);                        // always first in a subclass
    this.username = '#user-name';
    this.password = '#password';
    this.submit = '#login-button';
  }
  login(user, pass) {                   // credentials come from the test / env
    this.page.fill(this.username, user);
    this.page.fill(this.password, pass);
    this.page.click(this.submit);
  }
  hasLockedOutError() {
    const text = this.page.textOf().trim().toLowerCase();
    return text.includes('this user has been locked out');  // a real boolean
  }
}

function runLogin(user, pass, errorText) {
  const page = new FakePage();
  page.errorText = errorText;
  const lp = new LoginPage(page);
  lp.login(user, pass);
  return { actions: page.actions, lockedOut: lp.hasLockedOutError() };
}

// runLogin('locked_out_user', 'from-env-secret', ' Epic sadface: Sorry, this user has been locked out. ')
// → { actions: ['fill #user-name=locked_out_user', 'fill #password=from-env-secret', 'click #login-button'],
//     lockedOut: true }
// Why indexOf is risky: 'locked out?'.indexOf('locked out') is 0 (falsy),
// and a missing text gives -1 (truthy).`,
      },
      explanation: `**Fixes**
1. **\`super()\` first:** a derived class has no \`this\` until the parent constructor runs; touching \`this\` earlier throws \`ReferenceError: Must call super constructor...\`.
2. **Instance fields need \`this.\`:** \`page\`, \`username\`, \`password\` inside \`login\` referred to undeclared variables (ReferenceError at call time). Every field is \`this.page\`, \`this.username\`, etc.
3. **No hard-coded credentials:** the method takes \`user, pass\` so tests can drive positive and negative cases, and secrets can come from environment variables instead of source code.
4. **Precise boolean:** \`indexOf\` returns a position: \`-1\` (truthy!) when missing and \`0\` (falsy!) when the text starts with it, so it is wrong in both directions. \`trim().toLowerCase().includes(...)\` returns a real boolean. In real Playwright code you would assert with \`await expect(errorLocator).toContainText('locked out')\`, which also waits.`,
      fnName: 'runLogin',
      tests: [
        { args: ['standard_user', 'secret_sauce', ''], expected: { actions: ['fill #user-name=standard_user', 'fill #password=secret_sauce', 'click #login-button'], lockedOut: false } },
        { args: ['locked_out_user', 'pw1', ' Epic sadface: Sorry, this user has been locked out. '], expected: { actions: ['fill #user-name=locked_out_user', 'fill #password=pw1', 'click #login-button'], lockedOut: true } },
        {
          args: ['problem_user', 'secret_sauce', 'Epic sadface: Username and password do not match any user in this service'],
          expected: { actions: ['fill #user-name=problem_user', 'fill #password=secret_sauce', 'click #login-button'], lockedOut: false },
        },
        {
          args: ['locked_out_user', 'x', 'EPIC SADFACE: SORRY, THIS USER HAS BEEN LOCKED OUT.'],
          expected: { actions: ['fill #user-name=locked_out_user', 'fill #password=x', 'click #login-button'], lockedOut: true },
        },
        { args: ['a', 'b', 'This user has been locked out.'], expected: { actions: ['fill #user-name=a', 'fill #password=b', 'click #login-button'], lockedOut: true }, hidden: true },
        { args: ['', '', ''], expected: { actions: ['fill #user-name=', 'fill #password=', 'click #login-button'], lockedOut: false }, hidden: true },
      ],
      followUps: [
        {
          q: 'What would the Playwright version of this LoginPage look like?',
          a: 'The constructor stores page and creates locators: `this.username = page.getByPlaceholder("Username"); this.submit = page.getByRole("button", { name: "Login" });`. Methods become async: `async login(user, pass) { await this.username.fill(user); await this.password.fill(pass); await this.submit.click(); }`. Tests get it via `new LoginPage(page)` or a custom fixture.',
        },
        {
          q: 'Should hasLockedOutError() return a boolean or should the page object assert?',
          a: 'Returning a boolean and asserting it with expect(...).toBe(true) loses auto-waiting and gives a vague message. Many teams instead expose the locator (loginPage.errorMessage) and assert in the test with web-first expect, or add an expectLockedOut() method that wraps expect. Either is fine if it keeps waiting and clear failure output.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-objects-strings-iq-01',
      difficulty: 'easy',
      question: 'Reverse a string without using the built-in reverse() method. Then show the one-liner with built-ins and tell me which edge cases you would test.',
      whatInterviewerLooksFor: [
        'A correct loop from the last index (or two-pointer swap on an array)',
        'Knows strings are immutable, so builds a new string',
        'Mentions unicode/emoji and split("") vs spread',
        'Lists edge cases like a tester',
      ],
      modelAnswer: `**Loop solution:**

\`function reverse(s) {\`
\`  let out = '';\`
\`  for (let i = s.length - 1; i >= 0; i--) out += s[i];\`
\`  return out;\`
\`}\`

Strings are immutable, so I build a new one. Time O(n). (Repeated \`+=\` is fine in modern engines; for very long strings I could push characters into an array and \`join('')\` once.)

**Alternative without reverse, using two pointers on an array:**
convert to \`const chars = [...s]\`, swap \`chars[left]\` and \`chars[right]\` while \`left < right\`, then \`chars.join('')\`.

**With built-ins:** \`[...s].reverse().join('')\`. I use spread instead of \`s.split('')\` because \`split('')\` splits UTF-16 code units: an emoji like a smiley is two units and would be reversed into broken characters, whereas spread iterates by code point. (Combined characters such as flags or accented letters built from two code points still need \`Intl.Segmenter\` for perfect results; I would mention it but not implement it unless asked.)

**Edge cases I would test:**
- \`''\` → \`''\`; \`'a'\` → \`'a'\`
- palindrome \`'level'\` → same string
- spaces and punctuation \`'ab c!'\` → \`'!c ba'\`
- mixed case preserved \`'Ab'\` → \`'bA'\`
- emoji \`'hi😀'\` → \`'😀ih'\`
- non-string input (number, null): reject with a TypeError or convert with \`String()\` depending on the contract.

**Why it matters for testing:** the same loop skills are used for parsing page text, and listing edge cases unprompted shows test thinking, which is what a QA interviewer is really scoring.`,
      followUps: [
        {
          q: 'How would you reverse the order of words instead of characters?',
          a: 'Split on whitespace, reverse, join: `s.trim().split(/\\s+/).reverse().join(" ")`. Without reverse(), loop over the words array from the end and push into a new array. Using a regex split with \\s+ handles multiple spaces, and trim() avoids empty strings at the ends.',
        },
        {
          q: 'How would you count the vowels in the same string?',
          a: 'Loop over the lowercase characters and count those in "aeiou": `[...s.toLowerCase()].filter(ch => "aeiou".includes(ch)).length`. A regex alternative is `(s.match(/[aeiou]/gi) ?? []).length`; the `?? []` matters because match returns null, not an empty array, when nothing matches.',
        },
      ],
      pitfalls: [
        'Trying to assign to s[i] in place (strings are immutable).',
        'Off-by-one: starting the loop at s.length instead of s.length - 1.',
        'Not mentioning any edge cases.',
      ],
    },
    {
      id: 'js-objects-strings-iq-02',
      difficulty: 'easy',
      question: 'Write a function that checks whether a sentence is a palindrome, ignoring case, spaces and punctuation ("A man, a plan, a canal: Panama" should be true).',
      whatInterviewerLooksFor: [
        'Normalises input before comparing',
        'Uses two pointers or compares with a reversed copy',
        'Explains complexity',
        'Tests boundary inputs',
      ],
      modelAnswer: `**Approach:** normalise, then compare characters from both ends.

\`function isPalindrome(s) {\`
\`  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\`
\`  let left = 0, right = clean.length - 1;\`
\`  while (left < right) {\`
\`    if (clean[left] !== clean[right]) return false;\`
\`    left++; right--;\`
\`  }\`
\`  return true;\`
\`}\`

**Explanation:**
- \`toLowerCase()\` makes "A" and "a" equal.
- \`replace(/[^a-z0-9]/g, '')\` removes everything that is not a letter or digit (spaces, commas, colon). The \`g\` flag removes all of them, not just the first.
- Two pointers stop at the first mismatch, so a long non-palindrome fails fast. Time O(n), extra space O(n) for the cleaned string.

**One-liner alternative:** \`clean === [...clean].reverse().join('')\`: shorter, but builds a second string and always walks the whole input.

**Test cases:**

| Input | Expected | Why |
|---|---|---|
| \`'A man, a plan, a canal: Panama'\` | true | punctuation and case |
| \`'racecar'\` | true | odd length |
| \`'abba'\` | true | even length |
| \`'Sauce'\` | false | normal negative |
| \`''\` | true | empty is a palindrome by convention (clarify!) |
| \`'!!'\` | true | becomes empty after cleaning |
| \`'12321'\` | true | digits kept |

**Clarifying questions I would ask:** should digits count? What about accented letters (the \`[^a-z0-9]\` filter would drop "é")? These questions show requirement analysis, the core QA skill.`,
      followUps: [
        {
          q: 'How would you support accented and non-English letters?',
          a: 'Use Unicode-aware regex: `s.toLowerCase().normalize("NFD").replace(/[^\\p{L}\\p{N}]/gu, "")` keeps any letter (\\p{L}) or number (\\p{N}) in any script. NFD normalisation separates accents into combining marks, which this filter removes, so "é" compares equal to "e". Mention the trade-off: the business rule decides whether accents matter.',
        },
        {
          q: 'What is the time and space complexity of each version?',
          a: 'Both are O(n) time. The two-pointer version uses O(n) space for the cleaned string but stops at the first mismatch; the reverse-and-compare version builds two extra strings (array and joined copy) and always processes the full input. Without cleaning, two pointers that skip non-alphanumerics in place achieve O(1) extra space.',
        },
      ],
      pitfalls: [
        'Forgetting the g flag so only the first space is removed.',
        'Comparing before lowercasing.',
        'Not considering empty or punctuation-only input.',
      ],
    },
    {
      id: 'js-objects-strings-iq-03',
      difficulty: 'medium',
      question: 'Count how many times each character appears in a string, and then return the first character that does not repeat (e.g. "swiss" → "w").',
      context: 'A common follow-on coding question; interviewers often ask it right after string reversal.',
      whatInterviewerLooksFor: [
        'Uses an object or Map as a frequency counter',
        'Two-pass approach preserving original order',
        'O(n) reasoning rather than nested loops',
        'Handles no-unique-character case',
      ],
      modelAnswer: `**Step 1: frequency map**

\`function charFrequency(s) {\`
\`  const freq = {};\`
\`  for (const ch of s) freq[ch] = (freq[ch] ?? 0) + 1;\`
\`  return freq;\`
\`}\`
\`charFrequency('swiss')\` → \`{ s: 3, w: 1, i: 1 }\`.

\`freq[ch] ?? 0\` handles the first time a character is seen (the key is \`undefined\`). \`for...of\` iterates by character (code point).

**Step 2: first non-repeating character**

\`function firstUnique(s) {\`
\`  const freq = charFrequency(s);\`
\`  for (const ch of s) if (freq[ch] === 1) return ch;\`
\`  return null;\`
\`}\`

I scan the **string** again (not the object) because the question asks for the first in the original order; scanning the original string guarantees that order regardless of how keys are stored.

**Complexity:** two linear passes → O(n) time, O(k) space for k distinct characters. A naive version with \`indexOf\`/\`lastIndexOf\` per character is O(n²).

**Map instead of object:** \`const freq = new Map(); freq.set(ch, (freq.get(ch) ?? 0) + 1);\` avoids clashes with inherited keys such as "constructor" and keeps insertion order for every kind of key.

**Edge cases:** \`''\` → null; \`'aabb'\` → null; \`'a'\` → 'a'; case sensitivity (\`'Aa'\`: clarify whether A and a are the same; if not, the answer is 'A'); spaces (should \`' '\` count?).

**Tester's angle:** the same frequency-map pattern finds duplicate IDs in an API list or counts statuses in a results table.`,
      followUps: [
        {
          q: 'How would you return the most frequent character?',
          a: 'Build the map, then track the max: loop over Object.entries(freq) keeping the key with the highest count, or reduce over the entries. Clarify ties: return the first one encountered in the string, or all of them. Complexity stays O(n).',
        },
        {
          q: 'How would you find duplicate words in a sentence instead?',
          a: 'Normalise case, split on non-word characters, count with the same pattern: `for (const w of s.toLowerCase().split(/\\W+/).filter(Boolean)) freq[w] = (freq[w] ?? 0) + 1;`, then keep keys with count > 1. filter(Boolean) removes empty strings left by leading or trailing punctuation.',
        },
      ],
      pitfalls: [
        'Iterating the object keys to find "first", relying on key order.',
        'Using nested loops (O(n²)) without noticing.',
        'Forgetting to return null when every character repeats.',
      ],
    },
    {
      id: 'js-objects-strings-iq-04',
      difficulty: 'hard',
      question: 'Write a function deepEqual(a, b) that returns true when two values have the same structure and content (nested objects and arrays). Why not just use === or JSON.stringify?',
      whatInterviewerLooksFor: [
        'Recursion with a correct primitive/null base case',
        'Compares key counts and each key recursively',
        'Explains why === and JSON.stringify fail',
        'Mentions limitations (Dates, NaN, cycles) and toEqual',
      ],
      modelAnswer: `**Implementation:**

\`function deepEqual(a, b) {\`
\`  if (a === b) return true;                                  // same primitive or same reference\`
\`  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\`
\`  if (Array.isArray(a) !== Array.isArray(b)) return false;  // [] vs {}\`
\`  const keysA = Object.keys(a), keysB = Object.keys(b);\`
\`  if (keysA.length !== keysB.length) return false;\`
\`  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));\`
\`}\`

**How it works:** primitives (and identical references) are settled by \`===\`. If either side is not a non-null object, they differ. For objects and arrays, the key counts must match and every key must exist in both with deeply equal values; arrays work because their indexes are keys. Eloquent JavaScript has this exact exercise in Ch 4.

**Why not \`===\`?** For objects it checks identity: two separately created \`{ id: 1 }\` are different objects, and a parsed API response is always a new object.

**Why not \`JSON.stringify(a) === JSON.stringify(b)\`?**
- Key order matters: \`{a:1,b:2}\` and \`{b:2,a:1}\` stringify differently but are equal.
- \`undefined\` properties disappear, so \`{a: undefined}\` equals \`{}\`.
- \`NaN\` becomes \`null\`; Dates become strings; functions vanish; cycles throw.

**Limitations of my version to mention:** \`NaN\` vs \`NaN\` is false (use \`Object.is\`), Dates/Maps/Sets compare as empty objects (add special cases), and circular references would recurse forever (track visited pairs).

**In practice:** in Playwright I use \`expect(actual).toEqual(expected)\` (or \`toStrictEqual\`, or \`toMatchObject\` for a subset), which handles these cases and prints a readable diff. Writing \`deepEqual\` shows I understand what those matchers do.`,
      followUps: [
        {
          q: 'How would you check that an API response contains at least these fields, ignoring extras?',
          a: 'A subset comparison: for each key in expected, recurse into actual, but do not require equal key counts. In Playwright, `expect(body).toMatchObject({ firstname: "Jim", bookingdates: { checkin: "2025-01-01" } })` does exactly that, which suits APIs that add fields like timestamps or ids.',
        },
        {
          q: 'How would you add support for Date objects?',
          a: 'Before the generic object branch: `if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();`. Similar special cases are needed for Map and Set (compare sizes and entries) and RegExp (compare source and flags). Libraries like Node\'s util.isDeepStrictEqual already handle these.',
        },
      ],
      pitfalls: [
        'Forgetting that typeof null is "object" and crashing on Object.keys(null).',
        'Only checking that keys of a exist in b (missing extra keys in b).',
        'Recommending JSON.stringify without mentioning key order.',
      ],
    },
    {
      id: 'js-objects-strings-iq-05',
      difficulty: 'medium',
      question: 'What is the difference between passing by value and by reference in JavaScript, and between a shallow and a deep copy? Give an example of a test bug each can cause.',
      whatInterviewerLooksFor: [
        'Primitives copied, objects shared via reference',
        'Spread/Object.assign are shallow',
        'structuredClone (or factories) for deep copies',
        'Concrete, realistic test-data bug',
      ],
      modelAnswer: `**Value vs reference:** primitives are copied when assigned or passed, so changing the copy never affects the original. Objects and arrays are held by reference: \`const b = a\` gives a second name for the **same** object, and a function receiving an object can mutate the caller's data. (Strictly, JavaScript always passes "the value of the reference", so reassigning the parameter inside a function does not affect the caller, but mutating its properties does.)

**Test bug from references:** a shared \`validUser\` fixture object. Test A sets \`validUser.email = 'dup@test.com'\` to check duplicate-email validation. Test B, in the same worker, registers "a fresh user" with the now-mutated email and fails with "email already exists", only when run after A. Classic order-dependent flakiness.

**Shallow vs deep copy:**
- **Shallow** (\`{ ...obj }\`, \`Object.assign\`, \`[...arr]\`): new outer object, but nested objects are still shared.
- **Deep** (\`structuredClone(obj)\`): every nested level is copied; Dates, Maps and Sets are preserved; functions throw \`DataCloneError\`; class instances become plain objects.

**Test bug from shallow copy:** \`const order = { ...baseOrder }; order.address.city = 'Delhi';\` The developer thought they copied, but \`baseOrder.address\` changed for every later test.

**How I prevent it:**
1. Factory functions returning fresh data per test (\`buildUser(overrides)\`), ideally as Playwright fixtures.
2. \`structuredClone\` when I must start from a shared template.
3. \`Object.freeze\` (recursive) on shared constants so mutation fails loudly.
4. Deep equality (\`toEqual\`) for comparing content, never \`===\` on objects.`,
      followUps: [
        {
          q: 'If a function reassigns its object parameter (user = {...}), does the caller see it?',
          a: 'No. Reassignment only changes the local parameter to point at a new object; the caller\'s variable still points to the original. Only mutations of the shared object (user.name = "x") are visible to the caller. This distinction is why JavaScript is described as "pass by sharing" or passing references by value.',
        },
        {
          q: 'Is Object.freeze a deep freeze?',
          a: 'No, it is shallow: top-level properties become read-only, but nested objects stay mutable. A deep freeze walks the object recursively and freezes every nested object. Writes to a frozen object fail silently in sloppy mode and throw a TypeError in strict mode, which ES modules and classes always use.',
        },
      ],
      pitfalls: [
        'Claiming spread makes a deep copy.',
        'Saying JavaScript passes objects "by reference" exactly like C++ references without nuance.',
        'Recommending JSON round-trip without mentioning its losses.',
      ],
    },
    {
      id: 'js-objects-strings-iq-06',
      difficulty: 'medium',
      question: 'Explain classes, constructors and inheritance in JavaScript. How would you use them to build a Page Object Model with a BasePage?',
      whatInterviewerLooksFor: [
        'constructor, this, methods, new',
        'extends and super (super before this)',
        'POM structure with locators and actions',
        'Sensible views on what belongs in the base class',
      ],
      modelAnswer: `**Classes** are templates for objects. \`new LoginPage(page)\` creates an object, runs the \`constructor\`, and links the object to the class's methods (via its prototype), so all instances share one copy of each method.

- **constructor(page):** stores per-instance state on \`this\` (\`this.page = page\`).
- **Methods:** \`async login(user, pass) { ... }\`, using \`this.\` to reach fields.
- **extends / super:** \`class LoginPage extends BasePage\`. In the subclass constructor, \`super(page)\` must run before any \`this\` access. \`super.open()\` calls the parent's method.
- Extras: getters (\`get heading()\`), \`static\` helpers, \`#private\` fields. Class bodies run in strict mode.

**POM design for SauceDemo:**
- **BasePage:** \`constructor(page)\` storing \`this.page\`; shared pieces such as \`this.menuButton = page.getByRole('button', { name: 'Open Menu' })\`, an \`open(path)\` that calls \`this.page.goto(path)\`, and \`logout()\`.
- **LoginPage extends BasePage:** locators \`this.username = page.getByPlaceholder('Username')\`, \`this.password\`, \`this.loginButton = page.getByRole('button', { name: 'Login' })\`, \`this.error = page.getByTestId('error')\`; method \`async login(user, pass)\`.
- **InventoryPage extends BasePage:** \`addToCart(productName)\`, \`cartBadge\`, \`sortBy(option)\`.
- Tests: \`const loginPage = new LoginPage(page); await loginPage.open('/'); await loginPage.login(user, pass); await expect(inventory.title).toHaveText('Products');\`

**What I keep out of BasePage:** page-specific locators and assertions. Inheritance is for genuinely shared behaviour (header, menu, navigation); for reusable widgets (a date picker, a table) I prefer **composition**: a component class that page objects hold as a field.

**Playwright integration:** custom fixtures (\`test.extend\`) can construct page objects so tests receive \`{ loginPage }\` ready to use.`,
      followUps: [
        {
          q: 'Why do subclass constructors need super() before using this?',
          a: 'In a derived class, the object is created by the parent constructor. Until super() runs, there is no initialised this, so any access throws ReferenceError ("Must call super constructor in derived class..."). If the subclass has no constructor at all, JavaScript generates one that forwards all arguments to super automatically.',
        },
        {
          q: 'What are the risks of deep inheritance chains in a test framework?',
          a: 'Changes in a base class ripple into every page, behaviour becomes hard to find (which level defines this method?), and pages inherit methods that make no sense for them. Keep hierarchies shallow (BasePage plus one level) and use composition for shared components. Readability matters more than clever reuse in test code.',
        },
      ],
      pitfalls: [
        'Forgetting this. inside methods.',
        'Calling super() after assigning this.something.',
        'Putting every helper in BasePage (a "god class").',
      ],
    },
    {
      id: 'js-objects-strings-iq-07',
      difficulty: 'medium',
      question: 'A search page shows "Showing 1-10 of 245 results". Write code to extract the total (245) and verify it equals the number of rows the API returned. What can go wrong?',
      whatInterviewerLooksFor: [
        'Uses a regex with a capture group (or a robust split)',
        'Converts the captured string to a number explicitly',
        'Handles no-match (null) safely',
        'Thinks about locale formats, pagination and timing',
      ],
      modelAnswer: `**Extraction:**

\`function totalFromSummary(text) {\`
\`  const match = text.match(/of\\s+([\\d,]+)\\s+results?/i);\`
\`  if (!match) throw new Error('Unexpected summary text: ' + text);\`
\`  return Number(match[1].replaceAll(',', ''));\`
\`}\`
\`totalFromSummary('Showing 1-10 of 245 results')\` → \`245\`.

**Pattern explained:** \`of\` then one-or-more spaces, then a **capture group** of digits and commas (so "1,245" works), then "result" or "results" (\`s?\`), case-insensitive (\`i\`). \`match[1]\` is the captured text, a string, so I convert with \`Number\` after removing commas.

**Verification:** compare with the API: \`expect(totalFromSummary(text)).toBe(apiBody.totalCount)\`. Note that the page shows 10 rows, so the right comparison is with the API's total count field, not the length of the current page's array. I would also verify \`rows on page === Math.min(10, total)\`.

**What can go wrong:**
1. **No match** → \`match\` is \`null\` and \`match[1]\` crashes with a TypeError. I throw a clear error that includes the actual text.
2. **Locale formatting:** "1.245" in German, "1,245" in English, "1 245" with a thin space in French. Clarify the locale under test, or set it in the browser context (\`locale: 'en-US'\`).
3. **Timing:** reading the text before the search finishes gives the old count. In Playwright I would first wait with a web-first assertion: \`await expect(summary).toHaveText(/of \\d+ results/)\`, then read it.
4. **Naive \`/\\d+/\`** returns "1" (the first number), not the total. Anchoring on "of" avoids that.
5. **Pluralisation:** "of 1 result" must also match; hence \`results?\`.`,
      followUps: [
        {
          q: 'How would you get all three numbers at once?',
          a: 'Use one regex with three groups: `const [, from, to, total] = text.match(/(\\d+)\\s*-\\s*(\\d+)\\s+of\\s+(\\d+)/)`, then map them with Number. Array destructuring with a leading comma skips the full match. Alternatively, text.match(/\\d+/g) returns all digit runs, but relies on their order.',
        },
        {
          q: 'Why is the g flag dangerous with regex.test() in a loop?',
          a: 'A regex with g (or y) keeps lastIndex between calls. Calling test() again on another string starts searching from that index, so identical inputs can alternate true/false. Use a regex without g for test(), create it inside the loop, or reset lastIndex = 0.',
        },
      ],
      pitfalls: [
        'Using /\\d+/ and getting the first number instead of the total.',
        'Comparing the captured string to a number with ===.',
        'Ignoring the null case when the text does not match.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-objects-strings-drill-1',
      question:
        'Predict every log: `const base = { user: "qa", prefs: { theme: "dark" }, tags: ["smoke"] }; const a = base; const b = { ...base }; const c = structuredClone(base); a.user = "admin"; b.prefs.theme = "light"; b.tags.push("cart"); c.tags.push("api"); console.log(base.user, base.prefs.theme, base.tags.length, c.tags.length, b === base, b.prefs === base.prefs);`',
      assumptions: [
        'Assignment copies the reference.',
        'Spread copies one level (shallow).',
        'structuredClone copies every level (deep).',
      ],
      steps: [
        { label: 'a = base', calc: 'same object → a.user = "admin" changes base.user to "admin"' },
        { label: 'b = { ...base }', calc: 'new outer object; b.prefs and b.tags point to base\'s nested objects' },
        { label: 'b.prefs.theme = "light"', calc: 'mutates the shared prefs → base.prefs.theme = "light"' },
        { label: 'b.tags.push("cart")', calc: 'shared array → base.tags = ["smoke", "cart"] (length 2)' },
        { label: 'c = structuredClone(base)', calc: 'cloned on line 4, before any mutation → its own tags ["smoke"]; push "api" → c.tags length 2, base unaffected' },
        { label: 'b === base, b.prefs === base.prefs', calc: 'different outer objects → false; same nested object → true' },
      ],
      answer: '`admin light 2 2 false true`.',
      insight:
        'Assignment shares everything, spread shares nested data, structuredClone shares nothing. When test data has nested objects, a spread "copy" is the bug waiting to happen.',
      followUps: [
        {
          q: 'What would base.tags.length be if c had been created with { ...base } as well?',
          a: '3. Both b and c would share base.tags, so pushing "cart" and "api" adds two items to the single shared array: ["smoke", "cart", "api"]. That is exactly how two tests that both "copy" a fixture end up seeing each other\'s data.',
        },
      ],
    },
    {
      id: 'js-objects-strings-drill-2',
      question:
        'Trace `firstUnique("stress")` for the two-pass algorithm (build a frequency object with `for...of`, then scan the string again for the first count of 1). Then compute `countVowels("Checkout: Overview")` where vowels are a, e, i, o, u (case-insensitive).',
      assumptions: [
        'freq[ch] = (freq[ch] ?? 0) + 1 for each character in order.',
        'The second pass scans the original string from left to right.',
        'Spaces and punctuation are not vowels.',
      ],
      steps: [
        { label: 'Pass 1 over "stress"', calc: 's→1, t→1, r→1, e→1, s→2, s→3 → { s: 3, t: 1, r: 1, e: 1 }' },
        { label: 'Pass 2: index 0 "s"', calc: 'freq.s = 3 → skip' },
        { label: 'Pass 2: index 1 "t"', calc: 'freq.t = 1 → return "t"' },
        { label: 'Lowercase "Checkout: Overview"', calc: '"checkout: overview"' },
        { label: 'Vowels in "checkout"', calc: 'e, o, u → 3' },
        { label: 'Vowels in "overview"', calc: 'o, e, i, e → 4' },
        { label: 'Total', calc: '3 + 4 = 7' },
      ],
      answer: '`firstUnique("stress")` → `"t"`; `countVowels("Checkout: Overview")` → `7`.',
      insight:
        'Counting first and then scanning in original order gives O(n) and the correct "first". The same two-pass idea finds the first duplicate order ID in an API list or the first failing row in a table.',
      followUps: [
        {
          q: 'What does firstUnique return for "aabbcc" and for an empty string, and how would you test both?',
          a: 'Both return null: in "aabbcc" every count is 2, and an empty string has no characters, so the second loop never runs. I would include both as explicit test rows, plus a single-character input ("x" → "x") and a mixed-case input to confirm whether "A" and "a" are treated as different characters.',
        },
      ],
    },
    {
      id: 'js-objects-strings-drill-3',
      question:
        'Predict each value: `const resp = { id: 7, booking: { firstname: "Jim", totalprice: 111 }, tags: ["vip", "late"] }; const { id, booking: { firstname, depositpaid = false }, tags: [, second] } = resp; const updated = { ...resp.booking, totalprice: 150, ...{ firstname: "Sally" } }; const json = JSON.stringify({ id, depositpaid, note: undefined });` Give id, firstname, depositpaid, second, updated, and json.',
      assumptions: [
        'Destructuring defaults apply only when the value is undefined.',
        'In object spread, later keys win.',
        'JSON.stringify drops properties whose value is undefined.',
      ],
      steps: [
        { label: 'id', calc: 'resp.id → 7' },
        { label: 'firstname', calc: 'nested destructuring from resp.booking → "Jim"' },
        { label: 'depositpaid', calc: 'resp.booking.depositpaid is undefined → default false' },
        { label: 'second', calc: 'array pattern [, second] skips index 0 → "late"' },
        { label: 'updated', calc: '{ firstname: "Jim", totalprice: 111 } → totalprice 150 → firstname "Sally" → { firstname: "Sally", totalprice: 150 }' },
        { label: 'json', calc: 'note is undefined → dropped → {"id":7,"depositpaid":false}' },
      ],
      answer: '`7`, `"Jim"`, `false`, `"late"`, `{ firstname: "Sally", totalprice: 150 }`, and `{"id":7,"depositpaid":false}`.',
      insight:
        'Destructuring, spread and JSON are the daily tools of API testing: pull out what you assert on, build variations of a payload, and know exactly what actually goes over the wire (undefined fields never arrive).',
      followUps: [
        {
          q: 'Was resp.booking modified when building updated?',
          a: 'No. Spread created a new object and the later keys overrode values in that new object only; resp.booking still has firstname "Jim" and totalprice 111. If updated had been created by assigning resp.booking and then setting properties, the original would have changed.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-objects-strings-mcq-01',
      difficulty: 'easy',
      question: 'A data row is `{ "first-name": "Jim", zip: "560001" }`. Which expression reads the first name?',
      options: ['row["first-name"]', 'row.first-name', 'row.firstName', 'row[first-name]'],
      correct: [0],
      explanation:
        'Keys containing a hyphen must be read with bracket notation and a string. row.first-name is parsed as row.first minus name, row.firstName looks up a different (missing) key, and row[first-name] tries to subtract two undefined variables.',
      followUps: [
        {
          q: 'When must you use brackets even for simple keys?',
          a: 'When the key is in a variable: `const field = "zip"; row[field]`. Writing row.field would look for a key literally called "field". Data-driven tests that loop over field names rely on this constantly.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-02',
      difficulty: 'easy',
      question: 'A helper in a plain (non-module, non-strict) Node script tries to capitalise an order status in place. What does it log?',
      code: {
        language: 'javascript',
        code: `let status = 'shipped';
status[0] = 'S';
console.log(status);`,
      },
      options: ['shipped', 'Shipped', "TypeError: Cannot assign to read only property '0'", 'Shhipped'],
      correct: [0],
      explanation:
        'Strings are immutable; assigning to an index is silently ignored in sloppy scripts, so the value stays "shipped" (in strict mode it throws a TypeError, which is why that option is tempting). To capitalise, build a new string: status[0].toUpperCase() + status.slice(1).',
      followUps: [
        {
          q: 'Which string methods change the original string?',
          a: 'None. Every string method (trim, replace, toUpperCase, slice) returns a new string. You must assign the result: status = status.trim(). Forgetting to assign is a common reason a "normalised" value is not normalised.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-03',
      difficulty: 'easy',
      question: 'A booking factory merges defaults and overrides with spread. What is the result?',
      code: {
        language: 'javascript',
        code: `const defaults = { totalprice: 100, depositpaid: true };
const overrides = { depositpaid: false };
console.log({ ...defaults, ...overrides });`,
      },
      options: [
        '{ totalprice: 100, depositpaid: false }',
        '{ totalprice: 100, depositpaid: true }',
        '{ depositpaid: false }',
        '{ totalprice: 100, depositpaid: true, depositpaid: false }',
      ],
      correct: [0],
      explanation:
        'Spread copies properties in order and later keys overwrite earlier ones, so the override false wins while totalprice is kept. An object cannot hold the same key twice. Swapping the spread order would produce depositpaid: true, a common bug.',
      followUps: [
        {
          q: 'Why is spread better than `defaults.depositpaid = false` here?',
          a: 'Spread creates a new object, leaving defaults untouched for the next test. Assigning directly mutates the shared defaults object, so every later test silently inherits depositpaid: false.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-04',
      difficulty: 'medium',
      question: 'An expected-vs-actual check for user objects logs three comparisons. What do they print?',
      code: {
        language: 'javascript',
        code: `const expected = { id: 1, name: 'qa' };
const actual = { id: 1, name: 'qa' };
const alias = expected;
console.log(expected === actual, expected === alias, JSON.stringify(expected) === JSON.stringify(actual));`,
      },
      options: ['false true true', 'true true true', 'false false true', 'true false false'],
      correct: [0],
      explanation:
        '=== on objects checks identity: expected and actual are two separate objects (false), alias is the same reference (true). The JSON strings are equal here because keys are in the same order, but that comparison breaks if the order differs. Use deep equality (toEqual) for content.',
      followUps: [
        {
          q: 'When would the JSON.stringify comparison give a wrong answer?',
          a: 'When key order differs ({ id, name } vs { name, id } gives different strings), when a property is undefined (dropped on one side), or with NaN/Dates. It is a fragile shortcut; deep equality compares keys regardless of order.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-05',
      difficulty: 'medium',
      question: 'A test copies a fixture with spread before editing the nested address. What does the original show afterwards?',
      code: {
        language: 'javascript',
        code: `const fixture = { name: 'Jim', address: { city: 'Pune' } };
const copy = { ...fixture };
copy.name = 'Sally';
copy.address.city = 'Delhi';
console.log(fixture.name, fixture.address.city);`,
      },
      options: ['Jim Delhi', 'Jim Pune', 'Sally Delhi', 'Sally Pune'],
      correct: [0],
      explanation:
        'Spread is a shallow copy: the top-level name is independent, so fixture.name stays Jim, but address is the same nested object in both, so the city change shows up in fixture. "Jim Pune" assumes a deep copy, which needs structuredClone.',
      followUps: [
        {
          q: 'Give two ways to make the copy fully independent.',
          a: '`const copy = structuredClone(fixture)`, or copy each nested level explicitly: `{ ...fixture, address: { ...fixture.address } }`. The second is fine for one level of nesting; structuredClone scales to any depth.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-06',
      difficulty: 'medium',
      question: 'You send `JSON.stringify(payload)` to an API. Select ALL statements that correctly describe what happens to the payload values.',
      options: [
        'A property whose value is undefined (it is dropped entirely)',
        'A property whose value is null (it is dropped entirely)',
        'A Date value (it becomes an ISO string, not a Date)',
        'A NaN value (it becomes null)',
        'A nested object (it is flattened into the parent)',
      ],
      correct: [0, 2, 3],
      explanation:
        'undefined properties are omitted, Dates are serialised as ISO strings via toJSON, and NaN/Infinity become null. null itself is valid JSON and is kept as null, and nested objects stay nested. Knowing this explains "the field I set is missing in the request" bugs.',
      followUps: [
        {
          q: 'How would you test that an API rejects a missing required field?',
          a: 'Build the payload without the key (rest destructuring: const { lastname, ...body } = valid) rather than setting it to undefined, so the intent is explicit, then send it and expect a 400 with a message naming the field. Also test the field present but null, which is a different case.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-07',
      difficulty: 'medium',
      question: 'Destructuring with rename and default: what is logged?',
      code: {
        language: 'javascript',
        code: `const fixtures = { page: 'PAGE', request: undefined };
const { page: p, request = 'API', browserName = 'chromium' } = fixtures;
console.log(p, request, browserName);`,
      },
      options: ['PAGE API chromium', 'PAGE undefined chromium', 'page API chromium', 'PAGE API undefined'],
      correct: [0],
      explanation:
        'page: p reads the key page into a variable named p ("PAGE"). Defaults apply when the value is undefined, which is true both for the explicit undefined (request) and for the missing key (browserName). The option with undefined assumes an explicit undefined blocks the default; it does not.',
      followUps: [
        {
          q: 'Would the default apply if request were null?',
          a: 'No. Destructuring defaults, like default parameters, only kick in for undefined. null is a deliberate value and is kept, so request would be null.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-08',
      difficulty: 'medium',
      question: 'Which method call correctly turns "$1,299.00" into "1299.00"?',
      code: {
        language: 'javascript',
        code: `const t = '$1,299.00';
// A: t.replace('$', '').replace(',', '')
// B: t.replace(/[$,]/g, '')
// C: t.slice(1).replace(',', '')
// D: t.replace('$,', '')`,
      },
      options: ['A, B and C', 'Only B', 'A and B', 'B and D'],
      correct: [0],
      explanation:
        'A removes the one $ and the one comma; B removes every $ and comma via a global character class; C cuts the first character and the comma. D looks for the literal two-character sequence "$," which does not occur, so nothing changes. B is the most robust since prices above a million have two commas and a string replace only affects the first.',
      followUps: [
        {
          q: 'What would A return for "$1,299,000.00"?',
          a: '"1299,000.00": replace with a string pattern only changes the first occurrence, so the second comma survives and Number() would give NaN. Use replaceAll(",", "") or a regex with the g flag.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-09',
      difficulty: 'hard',
      question: 'A subclass Page Object sets a field before calling super. What happens on `new CartPage(page)`?',
      code: {
        language: 'javascript',
        code: `class BasePage {
  constructor(page) { this.page = page; }
}
class CartPage extends BasePage {
  constructor(page) {
    this.checkoutButton = '#checkout';
    super(page);
  }
}
new CartPage({});`,
      },
      options: [
        'ReferenceError: you must call super before accessing this in a derived constructor',
        'It works; the order of statements in a constructor does not matter',
        'TypeError: checkoutButton is read-only',
        'The object is created but page is undefined',
      ],
      correct: [0],
      explanation:
        'In a derived class, this does not exist until the parent constructor has run via super(). Touching this first throws a ReferenceError ("Must call super constructor in derived class before accessing \'this\'..."). Statement order matters here, and nothing about the field is read-only.',
      followUps: [
        {
          q: 'What happens if CartPage defines no constructor at all?',
          a: 'JavaScript supplies a default constructor equivalent to constructor(...args) { super(...args); }, so new CartPage(page) still sets this.page. You only need an explicit constructor when the subclass adds its own fields.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-10',
      difficulty: 'hard',
      question: 'Select ALL statements about structuredClone that are true.',
      options: [
        'It creates a deep copy, so nested objects are not shared with the original',
        'It preserves Date objects as Dates',
        'It copies functions and class methods',
        'A cloned class instance is no longer an instance of that class',
        'It throws on circular references',
      ],
      correct: [0, 1, 3],
      explanation:
        'structuredClone copies every nested level, keeps Dates (and Maps, Sets, RegExps), and handles circular references correctly. Functions cannot be cloned (DataCloneError), and class instances come back as plain objects without their prototype, so instanceof is false and methods are gone.',
      followUps: [
        {
          q: 'So how should you "copy" a Page Object?',
          a: 'You should not: create a new instance with new LoginPage(page) or get one from a fixture. Page Objects hold behaviour and a live page reference, not plain data, so copying them makes no sense. Clone only plain test data.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-11',
      difficulty: 'hard',
      question: 'A helper reverses product names with `name.split("").reverse().join("")`. For "Bike😀" the output contains broken characters. Why?',
      options: [
        'split("") splits into UTF-16 code units, and the emoji is made of two units that get reversed into an invalid order',
        'reverse() cannot handle strings longer than 4 characters with symbols',
        'join("") inserts invisible separators between emoji bytes',
        'Emoji are not valid characters in JavaScript strings',
      ],
      correct: [0],
      explanation:
        'JavaScript strings are UTF-16; characters outside the basic plane (most emoji) take two code units (a surrogate pair). split("") separates them and reversing swaps their order, producing invalid characters. Spreading [..."Bike😀"] iterates by code point and keeps the emoji intact. reverse and join have no such limits.',
      followUps: [
        {
          q: 'What does "😀".length return, and why does it matter for field-length tests?',
          a: 'It returns 2, because length counts UTF-16 code units. A "max 10 characters" validation might accept 10 letters but reject 6 emoji, or the backend might count differently from the frontend. Including emoji and accented characters in boundary tests catches these mismatches.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-12',
      difficulty: 'medium',
      question: 'The confirmation text is read as "  THANK YOU for your order! ". Select ALL expressions that evaluate to true.',
      code: {
        language: 'javascript',
        code: `const text = '  THANK YOU for your order! ';`,
      },
      options: [
        "text.trim().toLowerCase() === 'thank you for your order!'",
        "text.includes('Thank you')",
        "/thank you for your order/i.test(text)",
        "text.startsWith('THANK')",
        "text.toLowerCase().includes('order')",
      ],
      correct: [0, 2, 4],
      explanation:
        'Trimming and lowercasing gives an exact match; a case-insensitive regex finds the phrase anywhere; lowercasing then includes("order") is true. includes("Thank you") is case-sensitive and the text has "THANK YOU". startsWith("THANK") is false because of the two leading spaces.',
      followUps: [
        {
          q: 'How would you assert this in Playwright?',
          a: '`await expect(page.getByRole("heading", { level: 2 })).toHaveText(/thank you for your order/i)`. toHaveText normalises whitespace and accepts a regex, and the web-first assertion retries until the text appears, so you do not need manual trim/lowercase or waits.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL regexes that match the whole string "560001" and reject "5600012" (a 6-digit Indian PIN code check).',
      options: ['/^\\d{6}$/', '/\\d{6}/', '/^[0-9]{6}$/', '/^\\d+$/', '/^[1-9]\\d{5}$/'],
      correct: [0, 2, 4],
      explanation:
        'Anchors ^ and $ force the whole string to be exactly six digits, so ^\\d{6}$, ^[0-9]{6}$ and ^[1-9]\\d{5}$ (no leading zero) all accept 560001 and reject the 7-digit value. Without anchors, \\d{6} finds six digits inside "5600012" and wrongly matches; ^\\d+$ accepts any length.',
      followUps: [
        {
          q: 'Why might ^[1-9]\\d{5}$ be the best of the three?',
          a: 'Real Indian PIN codes never start with 0, so it encodes one more business rule and rejects "012345". Choosing the validation pattern is a requirements question: confirm with the spec before asserting the stricter rule.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-14',
      difficulty: 'expert',
      question: 'A teammate compares API bodies with `JSON.stringify(a) === JSON.stringify(b)`. For which pair does this give the WRONG answer about content equality?',
      code: {
        language: 'javascript',
        code: `// Pair 1
const a1 = { id: 1, tags: ['x'] }, b1 = { id: 1, tags: ['x'] };
// Pair 2
const a2 = { id: 1, name: 'Jim' }, b2 = { name: 'Jim', id: 1 };
// Pair 3
const a3 = { id: 1 }, b3 = { id: 2 };
// Pair 4
const a4 = { price: NaN }, b4 = { price: null };`,
      },
      options: ['Pair 2 and Pair 4', 'Pair 1 only', 'Pair 2 only', 'Pair 3 and Pair 4'],
      correct: [0],
      explanation:
        'Pair 2 has equal content but different key order, so the strings differ and the check wrongly says "different". Pair 4 has different content (NaN vs null), but stringify turns NaN into null, so both become {"price":null} and the check wrongly says "equal". Pairs 1 and 3 are judged correctly (equal and different). Key order and lossy conversions are why deep equality beats string comparison.',
      followUps: [
        {
          q: 'Which Playwright matcher would you use instead, and does it care about key order?',
          a: 'expect(a).toEqual(b) compares recursively by key, so key order does not matter. Note that toEqual treats undefined properties as missing (so { note: undefined } equals {}), while toStrictEqual does not.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-15',
      difficulty: 'expert',
      question: 'A first-non-repeating-character function is written as below. What does it return for "aAbBa" and why?',
      code: {
        language: 'javascript',
        code: `function firstUnique(s) {
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] ?? 0) + 1;
  for (const ch of s) if (freq[ch] === 1) return ch;
  return null;
}
console.log(firstUnique('aAbBa'));`,
      },
      options: [
        '"A", because the comparison is case-sensitive and "A" appears once',
        '"b", because "a" and "A" are counted together',
        'null, because every letter repeats when case is ignored',
        '"a", because it is the first character',
      ],
      correct: [0],
      explanation:
        'Object keys are case-sensitive strings, so "a" is counted 2 times while "A", "b" and "B" are each counted once. Scanning in order, the first character with count 1 is "A" at index 1. "b" or null would be correct only if the function lowercased the input first, a requirement to clarify in the interview.',
      followUps: [
        {
          q: 'How would you make it case-insensitive but still return the original character?',
          a: 'Count with a lowercased key, freq[ch.toLowerCase()], and in the second pass check freq[ch.toLowerCase()] === 1 but return ch itself. For "aAbBa" that yields null, since a/A and b/B both repeat. Stating the assumption before coding is the key interview signal.',
        },
      ],
    },
  ],
};

export default topic;
