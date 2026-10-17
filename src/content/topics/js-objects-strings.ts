import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-objects-strings',
  phase: 'javascript',
  order: 3,
  title: 'Objects, Classes and Strings',
  subtitle:
    'Objects for test data and config, copying objects safely, JSON, classes for Page Objects, string methods for checking text, simple regex, and the classic string interview questions.',
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
    'Object = key: value pairs: `{ username: "standard_user", password: "secret_sauce" }`. Use a dot for fixed names, brackets for names in a variable or with a dash (`row["first-name"]`, `data[field]`).',
    'Destructuring pulls values out: `const { page } = fixtures`, `const { user: name = "guest", ...rest } = obj`, `const [first, second] = list`.',
    'Spread for overrides: `{ ...defaults, ...overrides }`. Later keys win. Rest (`...rest`) collects what is left.',
    '`Object.keys`, `Object.values`, `Object.entries` turn an object into an array. Number-like keys come first, so never rely on key order.',
    'Numbers and strings are copied. Objects and arrays are shared by reference. For objects, `a === b` means "same object", not "same content".',
    'Spread and `Object.assign` copy only the top level (shallow). `structuredClone(obj)` copies every level (deep), but not functions.',
    '`JSON.stringify` drops `undefined` and functions, turns `NaN` into `null` and a Date into text. `JSON.parse` needs double quotes and no trailing commas.',
    'Classes: `constructor(page)` saves values on `this`. Methods use `this.x`. A child class calls `super(page)` before using `this`. This is the Page Object Model.',
    'Strings never change. Every method returns a new string. Check text with `trim()`, `toLowerCase()`, `includes`, `startsWith` and exact `===`.',
    '`replace("a", "b")` changes only the FIRST match. Use `replaceAll`, or a regex with the `g` flag.',
    'Regex: `\\d` digit, `\\w` word character, `\\s` space, `+` one or more, `?` optional, `^ $` start and end, `( )` capture, `g` find all, `i` ignore case. `"of 245".match(/\\d+/)[0]` gives "245".',
    'Interview classics: reverse (loop from the end), palindrome (clean, then compare), counter (`freq[ch] = (freq[ch] ?? 0) + 1`), first unique character (count, then scan again), deep equal (compare key by key).',
  ],
  sections: [
    {
      heading: 'Objects: key-value pairs for test data and config',
      body: `    const user = { name: 'standard_user', password: 'secret_sauce' };
    console.log(user.name);  // → standard_user
    console.log(user.age);   // → undefined
    user.role = 'admin';
    console.log(user.role);  // → admin

An **object** is a group of named values. Think of a filled-in form. Each field has a name, called the **key**. Each key has a **value**.

- Read a value with a dot: \`user.name\`.
- A missing key gives \`undefined\`. It does not throw an error.
- Add or change a value: \`user.role = 'admin'\`.
- Remove a key: \`delete user.role\`.
- A value can be anything: text, a number, an array, or another object.

**Check if a key exists** with \`'role' in user\` or \`Object.hasOwn(user, 'role')\`. Do not use \`if (user.role)\` for this. That check fails when the value is \`0\`, \`''\` or \`false\`.

**Shorthand:** when a variable has the same name as the key, write it once. \`{ username }\` means \`{ username: username }\`.

**Where you meet objects in tests**

| Use | Example |
|---|---|
| Test data | \`{ firstname: 'Jim', totalprice: 111 }\` |
| Config | \`playwright.config\` exports one object: \`{ retries: 2, use: { baseURL } }\` |
| Options | \`page.getByRole('button', { name: 'Login' })\` |
| Fixtures | \`async ({ page, request }) => { ... }\` |
| Lookup table | \`users[type]\`, where \`users = { standard: {...}, locked: {...} }\` |

**Why testers care:** test data, config, options and API responses are all objects.`,
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
        'An object is a set of key: value pairs, like a filled-in form.',
        'A missing key gives `undefined`, not an error.',
        'Use `in` or `Object.hasOwn` to check a key exists. Do not check if the value is truthy.',
      ],
      source: 'javascript.info: Objects; MDN: Working with objects',
    },
    {
      heading: 'Dot vs bracket notation',
      body: `    const row = { 'first-name': 'Jim', zip: '560001' };
    const field = 'zip';
    console.log(row.zip);           // → 560001
    console.log(row[field]);        // → 560001
    console.log(row['first-name']); // → Jim
    console.log(row.field);         // → undefined

There are two ways to read a key.

- **Dot** (\`row.zip\`): use it when you know the key name while writing the code.
- **Brackets** (\`row[field]\`): use it when the key is stored in a variable.

Brackets are also needed when the key has a \`-\`, a space, or starts with a digit. So write \`row['first-name']\`, not \`row.first-name\`.

**Why was \`row.field\` undefined?** The dot looks for a key that is literally named "field". There is no such key. To use the variable's value, write \`row[field]\`.

**Build a key from a variable** with square brackets inside the object:

    const errorField = 'zip';
    console.log({ [errorField]: 'required' }); // → { zip: 'required' }

**Watch out:** \`row[username]\` uses the *value* of the variable \`username\`. \`row['username']\` uses the word "username".

**Why testers care:** data-driven tests loop over field names. Inside the loop, you read each value with brackets.`,
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
        'Dot for fixed names. Brackets for names in a variable or with special characters.',
        '`obj.field` and `obj[field]` look up different keys.',
        '`{ [key]: value }` makes a key from a variable.',
      ],
      source: 'javascript.info: Objects (square brackets, computed properties)',
    },
    {
      heading: 'Destructuring: unpacking objects and arrays',
      body: `    const user = { name: 'Asha', role: 'qa', city: 'Pune' };
    const { name, role } = user;
    console.log(name, role);    // → Asha qa
    const [first, second] = ['red', 'green', 'blue'];
    console.log(first, second); // → red green

**Destructuring** pulls values out of an object or array into variables, in one line.

- With an **object**, it matches by **key name**.
- With an **array**, it matches by **position**.

**Useful extras**
- **Rename:** \`const { name: userName } = user\` puts \`user.name\` into a variable called \`userName\`.
- **Default:** \`const { country = 'India' } = user\` uses 'India' when the value is \`undefined\`.
- **Nested:** \`const { expected: { title } } = data\` reaches one level deeper.
- **Rest:** \`const { password, ...safeUser } = user\` keeps every key except \`password\`.
- **Skip an array item:** \`const [, second] = list\` leaves a blank for the first item.

You already use this in every Playwright test. In \`test('login', async ({ page }) => { ... })\`, the \`{ page }\` part destructures the fixtures object.

**Watch out:** destructuring \`undefined\` throws a TypeError. Give the parameter a default: \`function open({ path = '/' } = {})\`.

**Why testers care:** you pull out just the fields you want to check from a big API response.`,
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
        'Object destructuring matches by key. Array destructuring matches by position.',
        'Defaults are used only when the value is `undefined`.',
        '`({ page })` in a Playwright test is destructuring.',
      ],
      source: 'javascript.info: Destructuring assignment; MDN: Destructuring',
    },
    {
      heading: 'Spread and rest with objects',
      body: `    const defaults = { name: 'Jim', price: 100, paid: true };
    const booking = { ...defaults, price: -1 };
    console.log(booking);        // → { name: 'Jim', price: -1, paid: true }
    console.log(defaults.price); // → 100

**Spread** (\`...\`) copies all keys of one object into a new object. If a key appears twice, the **later one wins**. So \`{ ...defaults, ...overrides }\` gives you the defaults with your changes on top. The original \`defaults\` object does not change.

**Watch out:** order matters. \`{ price: -1, ...defaults }\` gives price 100, because \`defaults\` comes later and wins.

**Rest** uses the same three dots to collect "everything else":
- \`const { lastname, ...noLastname } = booking\` gives a copy without \`lastname\`.
- \`function log(...args)\` collects all arguments into one array.

Spread works on arrays too:
- \`[...list, 'new item']\` makes a new array with one more item.
- \`Math.max(...prices)\` passes each price as a separate argument.

Spread copies only the top level. Nested objects are still shared. The "Shallow vs deep copy" section shows why.

**Why testers care:** one default booking plus small overrides gives many test cases, such as a negative price or a missing field.`,
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
        '`{ ...defaults, ...overrides }`: put overrides last, because later keys win.',
        'Rest (`const { a, ...others } = obj`) is an easy way to drop a field for a "missing field" test.',
        'Spread copies only the top level.',
      ],
      source: 'MDN: Spread syntax; javascript.info: Rest parameters and spread syntax',
    },
    {
      heading: 'Object.keys, values and entries',
      body: `    const cart = { backpack: 29.99, light: 9.99 };
    console.log(Object.keys(cart));    // → [ 'backpack', 'light' ]
    console.log(Object.values(cart));  // → [ 29.99, 9.99 ]
    console.log(Object.entries(cart)); // → [ [ 'backpack', 29.99 ], [ 'light', 9.99 ] ]

These three methods turn an object into an array. Then you can loop over it.

- \`Object.keys\` gives just the names.
- \`Object.values\` gives just the values.
- \`Object.entries\` gives \`[name, value]\` pairs.

The cleanest way to loop over an object is \`for (const [name, price] of Object.entries(cart)) { ... }\`.

\`Object.fromEntries(pairs)\` does the opposite. It builds an object from pairs. This is handy after you filter the pairs.

**Watch out: key order.** Number-like keys such as \`'2'\` and \`'10'\` come first, sorted. Other keys keep the order you added them. So never compare two objects by key order. Compare them key by key.

**Why testers care:** you can fill every form field from one data object. You can also check that an API response has exactly the expected fields.`,
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
        '`Object.keys`, `Object.values` and `Object.entries` turn an object into an array.',
        '`for (const [k, v] of Object.entries(obj))` is the cleanest object loop.',
        'Never rely on key order when comparing objects.',
      ],
      source: 'javascript.info: Object.keys, values, entries; MDN: Object.entries',
    },
    {
      heading: 'Reference vs value',
      body: `    let a = 5;
    let b = a;
    b = 6;
    console.log(a);          // → 5
    const user1 = { name: 'Jim' };
    const user2 = user1;
    user2.name = 'Sally';
    console.log(user1.name); // → Sally

Simple values (numbers, strings, booleans, \`null\`, \`undefined\`) are called **primitives**. They are **copied by value**. \`b = a\` makes a separate copy, so changing \`b\` does not touch \`a\`.

Objects and arrays are **shared by reference**. A reference is like a home address. \`user2 = user1\` copies the address, not the house. Both names now point to the same object. A change made through one name shows up through the other.

Changing an object in place is called **mutating** it. A function that gets an object also gets the address. So the function can change the object you passed in.

**\`===\` checks "same object", not "same content"**

    console.log({ id: 1 } === { id: 1 }); // → false

These are two separate objects, so \`===\` says false. To compare content, use a deep check such as \`expect(actual).toEqual(expected)\` in Playwright.

**Real test bugs this causes**
1. Test A changes a shared \`validUser\` object. Test B now gets the changed user. Each test passes alone but fails when they run together.
2. Your "expected" object is the same object as "actual". The check compares it with itself, so it always passes.
3. Comparing two API responses with \`===\` always fails, even when they match.

**In an interview, say:** "Primitives are copied. Objects are shared by reference. To compare content I use deep equality, like toEqual. To avoid shared-data bugs I build fresh data for each test, or copy it with structuredClone."

**Why testers care:** shared test data that one test changes is a top cause of flaky tests.`,
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
const testUser = validUser;          // copies the address (reference), not the object
testUser.email = 'changed@test.com';
console.log(validUser.email);        // → changed@test.com (both point to one object)
console.log(testUser === validUser); // → true

// Functions receive the reference too
function markVip(user) { user.vip = true; }
markVip(validUser);
console.log(validUser.vip);          // → true (the function changed the caller's object)

// === means "same object", not "same content"
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
        'Primitives are copied. Objects and arrays are shared by reference.',
        '`===` on objects means "same object", not "same content".',
        'A function can change an object you pass to it.',
        'Shared test data that tests change is a common cause of flaky tests.',
      ],
      source: "javascript.info: Object references and copying; Kyle Simpson: You Don't Know JS Yet: Get Started (values vs references)",
    },
    {
      heading: 'Shallow vs deep copy with structuredClone',
      body: `    const order = { id: 1, address: { city: 'Pune' } };
    const copy = { ...order };
    copy.id = 2;
    copy.address.city = 'Delhi';
    console.log(order.id, order.address.city); // → 1 Delhi

Spread made a new outer object. So changing \`copy.id\` did not touch \`order\`. But \`address\` is an object inside the object. Spread copied only its reference. So both objects share the same \`address\`.

This is a **shallow copy**: only the top level is new. A **deep copy** copies every level. Use \`structuredClone\` for that:

    const order2 = { id: 1, address: { city: 'Pune' } };
    const deep = structuredClone(order2);
    deep.address.city = 'Mumbai';
    console.log(order2.address.city); // → Pune

| Way to copy | Copies nested objects? | Notes |
|---|---|---|
| \`{ ...obj }\`, \`[...arr]\`, \`Object.assign\` | No (shallow) | Nested objects stay shared |
| \`structuredClone(obj)\` | Yes (deep) | Keeps Dates. Cannot copy functions. Class objects lose their methods. |
| \`JSON.parse(JSON.stringify(obj))\` | Yes (deep) | Old trick. Dates become strings. \`undefined\` and functions are lost. |

**Simple rule:** copy plain data (the kind you keep in a JSON file) with \`structuredClone\`. Do not copy Page Objects. Create a new one with \`new\`.

**Even better:** write a **factory function**, like \`buildUser()\`, that returns fresh data on every call. Nothing is shared, so nothing needs copying.

**Why testers care:** a spread "copy" of nested test data still shares the inner objects. One test can then break another.`,
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

// The JSON trick loses Dates
const viaJson = JSON.parse(JSON.stringify(baseOrder));
console.log(typeof viaJson.createdAt);                   // → string

// What structuredClone cannot do
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
        'Spread and `Object.assign` copy only the top level (shallow).',
        '`structuredClone` copies every level (deep) and keeps Dates. It cannot copy functions.',
        'The JSON trick loses Dates, `undefined` and functions.',
        'A factory that builds fresh data is better than copying.',
      ],
      source: 'MDN: structuredClone(), The structured clone algorithm; javascript.info: Object references and copying',
    },
    {
      heading: 'JSON: stringify and parse',
      body: `    const booking = { name: 'Jim', price: 111, note: undefined };
    const text = JSON.stringify(booking);
    console.log(text);       // → {"name":"Jim","price":111}
    const back = JSON.parse(text);
    console.log(back.price); // → 111

**JSON** is the text format that APIs use to send data.

- \`JSON.stringify(obj)\` turns an object into JSON text.
- \`JSON.parse(text)\` turns JSON text back into an object.

Notice that \`note\` disappeared. \`stringify\` drops keys whose value is \`undefined\`.

**JSON rules** (stricter than JavaScript objects)
- Keys and strings use double quotes.
- No trailing commas and no comments.
- No functions and no \`undefined\`.

**What stringify changes**
- \`undefined\` and functions are dropped. Inside an array they become \`null\`.
- \`NaN\` and \`Infinity\` become \`null\`.
- A Date becomes text, like "2025-01-01T00:00:00.000Z".

\`JSON.stringify(obj, null, 2)\` prints it neatly with 2-space indents. This is great for logs.

**JSON.parse throws a SyntaxError on bad text.** Common causes are single quotes, a trailing comma, or an HTML page instead of JSON. In API tests, this error often means the server sent an HTML "502" error page.

**In Playwright**, \`await response.json()\` parses for you. \`request.post(url, { data: obj })\` stringifies for you.

**Why testers care:** every API test sends and receives JSON. Knowing what \`stringify\` drops explains "my field is missing from the request" bugs.`,
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
        'JSON needs double quotes. It has no trailing commas, `undefined` or functions.',
        '`stringify` drops `undefined` keys, turns `NaN` into `null` and a Date into text.',
        '`JSON.parse` throws a SyntaxError on bad text, often an HTML error page.',
      ],
      source: 'javascript.info: JSON methods, toJSON; MDN: JSON.stringify, JSON.parse',
    },
    {
      heading: 'Classes for Page Objects: constructor, methods and extends',
      body: `    class LoginPage {
      constructor(page) {
        this.page = page;
        this.button = '#login-button';
      }
      describe() { return 'Login button: ' + this.button; }
    }
    const login = new LoginPage('fake page');
    console.log(login.describe()); // → Login button: #login-button

A **class** is a blueprint. \`new LoginPage(page)\` builds one object from it. That object is called an **instance**.

- The **constructor** runs once, when you call \`new\`. It saves values on \`this\`.
- \`this\` means "this object".
- **Methods** are functions inside the class. They reach saved values with \`this.\`, like \`this.button\`.

**Inheritance:** \`class CartPage extends BasePage\` gives CartPage everything that BasePage has.
- In the child's constructor, call \`super(page)\` first. \`super\` runs the parent's constructor.
- Using \`this\` before \`super()\` throws a ReferenceError.
- \`super.open()\` calls the parent's version of a method.

You may also see these:
- \`get title() { ... }\` is a getter. You read it like a normal property.
- \`static\` means it belongs to the class, not to each object.
- \`#secret\` is a private field.

**This is the Page Object Model (POM).** In Playwright, the constructor gets \`page\` and creates **locators** (ways to find elements): \`this.username = page.getByPlaceholder('Username')\`. Methods are \`async\` actions: \`async login(user, pass) { await this.username.fill(user); ... }\`. The code below uses a fake page, so it runs in plain Node.

**Tips:** keep locators and actions in the page object. Keep most assertions in the test. Pass usernames and passwords in as arguments. Do not hard-code them.

**Why testers care:** almost every Playwright framework is built from page object classes.`,
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
console.log(typeof LoginPage);                  // → function (a class is a special kind of function)`,
        },
      ],
      keyPoints: [
        'The constructor saves values on `this`. Methods read them with `this.`.',
        'A child class must call `super()` before it uses `this`.',
        'POM: `constructor(page)`, locator fields, and `async` action methods.',
        'Keep locators and actions in the page object, and most assertions in the test.',
      ],
      source: 'javascript.info: Class basic syntax, Class inheritance; Playwright docs: Page object models; Marijn Haverbeke: Eloquent JavaScript, Ch 6',
    },
    {
      heading: 'Strings and string methods for assertions',
      body: `    const heading = '  Products \\n';
    console.log(heading === 'Products');        // → false
    console.log(heading.trim() === 'Products'); // → true
    console.log('Sorry, locked out'.includes('locked')); // → true
    console.log('$29.99'.slice(1));             // → 29.99

Almost all text a test reads is a string: headings, error messages, prices. String methods clean that text before you compare it.

**Strings never change.** Every method gives back a *new* string. So save the result: \`name = name.trim()\`. The official word for "cannot be changed" is **immutable**.

| Method | Example → result | Use in tests |
|---|---|---|
| \`trim()\` | \`'  Products '\` → \`'Products'\` | Remove extra spaces |
| \`toLowerCase()\` | \`'SWAG'\` → \`'swag'\` | Compare without caring about case |
| \`includes(x)\` | \`'Thank you!'.includes('Thank')\` → true | Check part of a message |
| \`startsWith\` / \`endsWith\` | \`url.endsWith('/inventory.html')\` | Check URLs |
| \`slice(start, end)\` | \`'$29.99'.slice(1)\` → \`'29.99'\` | Cut off symbols |
| \`split(sep)\` | \`'a,b'.split(',')\` → \`['a','b']\` | Break text into parts |
| \`replace\` / \`replaceAll\` | \`'1,2,3'.replace(',', '')\` → \`'12,3'\` | \`replace\` changes only the first match |
| \`padStart(n, ch)\` | \`'7'.padStart(3, '0')\` → \`'007'\` | IDs and dates |
| \`repeat(n)\` | \`'a'.repeat(51)\` | Too-long input for max-length tests |

Use \`s.at(-1)\` to get the last character.

**Comparing strings:** \`===\` is exact. \`<\` and \`>\` compare character codes, so \`'Z' < 'a'\` is true. Capital letters come first. For human A-to-Z order, use \`a.localeCompare(b)\`. Use it to check "Name (A to Z)" sorting.

**Watch out:** \`replace\` with a string changes only the first match. Use \`replaceAll\` to change every match.

**In Playwright**, assertions usually do the cleaning for you. \`toHaveText\` ignores extra spaces, accepts a regex, and retries. \`toContainText\` checks part of the text. Use string methods for values you have already read, or for API bodies.

**Why testers care:** a stray space or a capital letter is the most common reason a text check fails.`,
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
status[0] = 'P';                     // ignored here; throws a TypeError in ES modules
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
        'Strings never change. Methods return a new string, so save the result.',
        'Clean text with `trim()` and `toLowerCase()` before an exact compare.',
        '`replace` with a string changes only the first match.',
        'Use `localeCompare` for human A-to-Z order.',
      ],
      source: 'javascript.info: Strings; MDN: String',
    },
    {
      heading: 'Regex basics for testers',
      body: `    const summary = 'Showing 1-10 of 245 results';
    console.log(summary.match(/\\d+/g));        // → [ '1', '10', '245' ]
    console.log(summary.match(/of (\\d+)/)[1]); // → 245
    console.log(/^\\d{6}$/.test('560001'));     // → true
    console.log(/^\\d{6}$/.test('5600011'));    // → false

A **regular expression** (regex) is a search pattern. It is a smart "find" that understands ideas like "any digit" or "one or more".

\`/\\d+/g\` means "one or more digits, find them all". \`/of (\\d+)/\` finds "of" and then digits. The round brackets **capture** the digits, so \`[1]\` gives "245". \`/^\\d{6}$/\` means "exactly six digits, nothing else".

**The symbols you need most**

| Pattern | Means | Example |
|---|---|---|
| \`\\d\` | one digit | \`/\\d+/\` matches \`245\` |
| \`\\w\` | a letter, digit or _ | \`/\\w+/\` |
| \`\\s\` | a space, tab or new line | \`/\\s+/g\` finds runs of spaces |
| \`.\` | any character | write \`\\.\` for a real dot |
| \`+\` / \`*\` / \`?\` | one or more / zero or more / optional | \`/colou?r/\` |
| \`{2,}\` | 2 or more times | \`/[a-z]{2,}/\` |
| \`[abc]\`, \`[^abc]\` | one of these / none of these | \`/[aeiou]/\` finds a vowel |
| \`^\` and \`$\` | start and end of the text | \`/^\\d{6}$/\` is a 6-digit PIN code |
| \`( )\` | capture this part | \`/\\$(\\d+\\.\\d{2})/\` captures the amount |
| flags \`g\` and \`i\` | find all / ignore case | \`/error/i\` |

**Methods**
- \`regex.test(text)\` gives true or false.
- \`text.match(regex)\` gives the first match and its captured parts. With \`g\`, it gives all matches. It gives \`null\` if nothing matches.
- \`text.replace(regex, x)\` and \`text.split(regex)\` also accept a regex.

**In Playwright:** \`await expect(page).toHaveURL(/inventory/)\`, \`toHaveText(/thank you/i)\` and \`getByRole('button', { name: /add to cart/i })\`.

**Common mistakes**
- Not escaping \`.\`, \`$\` or \`(\` when you mean the real character.
- Forgetting \`^\` and \`$\`. Then \`/\\d{6}/\` also matches a 7-digit number.
- Reusing a \`g\` regex with \`.test()\`. It remembers where it stopped, so the next call can return false.

**Why testers care:** regex pulls numbers out of page text. It also checks formats like emails, IDs and dates.`,
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

// Trap: a g regex remembers where it stopped
const g = /a/g;
console.log(g.test('a'), g.test('a'));          // → true false`,
        },
      ],
      keyPoints: [
        '`\\d \\w \\s . + * ? ^ $ ( ) [ ]` and the flags `g` and `i` cover most test needs.',
        'Use `^...$` when the whole text must match.',
        'Escape `.`, `$` and `(` to match the real character.',
        'Playwright assertions and locators accept a regex.',
      ],
      source: 'javascript.info: Regular expressions (patterns and flags, character classes, quantifiers, capturing groups); Marijn Haverbeke: Eloquent JavaScript, Ch 9',
    },
    {
      heading: 'String interview problems: reverse, palindrome, vowels, frequency, first unique',
      body: `    function reverse(s) {
      let out = '';
      for (let i = s.length - 1; i >= 0; i--) out += s[i];
      return out;
    }
    console.log(reverse('Playwright')); // → thgirwyalP

These are the most common coding questions in automation interviews. They check that you can loop, count with an object, and think about edge cases.

**The five patterns**
1. **Reverse without \`reverse()\`:** loop from the last index down to 0. Add each character to a new string. The one-liner is \`[...s].reverse().join('')\`. Use \`[...s]\`, not \`split('')\`, because \`split('')\` breaks emoji.
2. **Palindrome** (reads the same both ways, like "level"): first clean the text. Lowercase it and remove spaces and punctuation. Then compare it with its reverse. Or use **two pointers**: one index starts at the front, one at the back, and they move inward.
3. **Count vowels:** loop over the characters and check \`'aeiou'.includes(ch)\`.
4. **Count each character:** use an object as a counter: \`freq[ch] = (freq[ch] ?? 0) + 1\`.
5. **First non-repeating character:** use two loops. First count every character. Then walk the string again and return the first one with a count of 1.

**How to answer out loud**
1. Ask questions first. Is it case-sensitive? Do spaces count? What about an empty string?
2. Say your plan, then write the code.
3. Test it like a tester: empty string, one character, all the same character, mixed case, punctuation, emoji.

That last step is where QA candidates shine.

**Why testers care:** the same loops and counters help you process page text and find duplicate IDs in API data.`,
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
        'Reverse: loop backwards. With built-ins, use `[...s]`, not `split("")`.',
        'Palindrome: clean the text first, then compare from both ends.',
        'Counter: `freq[ch] = (freq[ch] ?? 0) + 1`.',
        'First unique: count first, then scan the string again in order.',
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
        'Several Restful-Booker API tests import `baseBooking` from one data file. Each test changes it a little. Alone, each test passes. Together, prices and dates get mixed up. Also, the "same booking" check always fails, even when the API sends back exactly the same data.',
      task: 'Fix the helpers. Each test must get its own copy. Nested data must never be shared. The equality check must compare content. The tests call `runBookingTests(dateRanges)` with one or more `[checkin, checkout]` pairs. It builds one booking per pair and returns `{ bookings, baseCheckin, echoMatches, sameAsFirst }`: the bookings, the base booking\'s checkin afterwards (it must stay "2025-01-01"), whether the last booking equals its JSON copy from the API, and whether the last booking has the same content as the first. Press Run to check your fix.',
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
        'Spread copies only the top level. What happens to `bookingdates`?',
        'Build the nested object fresh, or deep-copy the base with a built-in function.',
        '`===` checks "same object". You need a key-by-key comparison that also looks inside nested objects (like a test framework\'s toEqual).',
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
1. **Shallow copy:** \`{ ...baseBooking }\` made a new outer object. But \`bookingdates\` still pointed to the one shared inner object. So every test wrote over the same dates and changed the base. \`structuredClone\` copies every level, and the new dates go into a fresh object.
2. **Freezing the base:** \`Object.freeze\` on the base and its inner object blocks changes. In strict code (ES modules, classes), a change then throws a TypeError. You see the bug at once, instead of a silent leak between tests.
3. **Same object vs same content:** \`sent === received\` is true only for the same object. A parsed API response is always a new object. \`deepEqual\` compares keys and values, and calls itself for nested objects. In Playwright you would write \`expect(received).toEqual(sent)\`.
4. **Options object with defaults:** \`{ bookingdates = {}, ...overrides } = {}\` lets \`buildBooking()\` work with no arguments. It also lets you override just one of the dates.

The tests call \`runBookingTests\` several times in one page load. This is like several tests importing the same file. So a changed base shows up in \`baseCheckin\` and in the bookings.`,
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
          a: 'It works for plain JSON-like data. But it quietly turns Dates into strings, drops undefined values and functions, and throws on an object that points to itself. structuredClone keeps Dates, Maps and Sets, so it is the safer default. For JSON-only data, both give the same result.',
        },
        {
          q: 'What is the difference between toEqual and toStrictEqual in Playwright\'s expect?',
          a: 'toEqual compares values at every level, but it ignores keys whose value is undefined. So { a: 1, b: undefined } equals { a: 1 }. toStrictEqual also checks those undefined keys and the object type (a class object is not equal to a plain object). For API bodies parsed from JSON, toEqual is usually enough.',
        },
      ],
    },
    {
      id: 'js-objects-strings-cc-2',
      title: 'Fix a broken Page Object class hierarchy',
      context:
        'A junior engineer wrote SauceDemo-style Page Object classes. They use a fake page, so they run in Node. The code crashes when it creates the page object. The login method uses variables that do not exist. The username and password are hard-coded. The "error visible" check returns a number instead of true or false.',
      task: 'Make the classes build correctly. Use `this.` for every saved value. Take the username and password as parameters: `login(user, pass)`. Make `hasLockedOutError()` return a real true or false. The tests call `runLogin(user, pass, errorText)`. It puts `errorText` on a fresh `FakePage`, logs in, and returns `{ actions, lockedOut }`: the recorded page actions, and the result of `hasLockedOutError()`. That result is true only when the text says "this user has been locked out", in any letter case. Press Run to check your fix.',
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
        'In a child class constructor, what must happen before you use `this`?',
        'Inside a method, how do you reach the page and the selectors saved on the object?',
        'What does `indexOf` return when the text is not found? Is that value truthy?',
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
1. **Call \`super()\` first:** a child class has no \`this\` until the parent constructor runs. Using \`this\` earlier throws \`ReferenceError: Must call super constructor...\`.
2. **Use \`this.\` for saved values:** inside \`login\`, the names \`page\`, \`username\` and \`password\` were not variables. So the call threw a ReferenceError. Each one must be \`this.page\`, \`this.username\`, and so on.
3. **No hard-coded passwords:** the method now takes \`user, pass\`. Tests can try good and bad logins. Secrets can come from environment variables instead of the code.
4. **Return a real true or false:** \`indexOf\` returns a position. It gives \`-1\` (truthy!) when the text is missing. It gives \`0\` (falsy!) when the text is at the start. So it is wrong both ways. \`trim().toLowerCase().includes(...)\` returns a real true or false. In real Playwright code you would write \`await expect(errorLocator).toContainText('locked out')\`, which also waits.`,
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
          a: 'The constructor saves page and creates locators: `this.username = page.getByPlaceholder("Username"); this.submit = page.getByRole("button", { name: "Login" });`. The methods become async: `async login(user, pass) { await this.username.fill(user); await this.password.fill(pass); await this.submit.click(); }`. Tests create it with `new LoginPage(page)` or get it from a custom fixture.',
        },
        {
          q: 'Should hasLockedOutError() return a boolean or should the page object assert?',
          a: 'If the method returns true or false and the test checks it with expect(...).toBe(true), you lose auto-waiting and get an unclear failure message. Many teams expose the locator instead (loginPage.errorMessage) and assert in the test with a web-first expect. Others add an expectLockedOut() method that calls expect inside. Both are fine if they keep waiting and give clear failure output.',
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
        'A correct loop from the last index down to 0',
        'Knows strings cannot be changed, so builds a new string',
        'Mentions emoji, and why `[...s]` is safer than `split("")`',
        'Lists edge cases like a tester',
      ],
      modelAnswer: `**Loop solution:**

\`function reverse(s) {\`
\`  let out = '';\`
\`  for (let i = s.length - 1; i >= 0; i--) out += s[i];\`
\`  return out;\`
\`}\`

\`reverse('Playwright')\` → \`'thgirwyalP'\`.

Strings cannot be changed in place, so I build a new one. I start at the last index (\`s.length - 1\`) and walk down to 0. The time grows in line with the length of the string.

**Another way without reverse():** turn the string into an array with \`[...s]\`. Swap the first and last items, then move both ends inward. Finally, \`join('')\` the array.

**With built-ins:** \`[...s].reverse().join('')\`. I use \`[...s]\`, not \`s.split('')\`. An emoji is stored as two pieces. \`split('')\` cuts it in half, so the reversed emoji is broken. \`[...s]\` keeps each emoji whole.

**Edge cases I would test:**
- \`''\` → \`''\`, and \`'a'\` → \`'a'\`
- a palindrome, \`'level'\` → same string
- spaces and punctuation, \`'ab c!'\` → \`'!c ba'\`
- mixed case kept, \`'Ab'\` → \`'bA'\`
- emoji, \`'hi😀'\` → \`'😀ih'\`
- not a string (a number or null): ask what should happen.

**Why it matters:** listing edge cases without being asked shows test thinking. That is what a QA interviewer is really scoring.`,
      followUps: [
        {
          q: 'How would you reverse the order of words instead of characters?',
          a: 'Split the text into words, reverse the array, and join with a space: `s.trim().split(/\\s+/).reverse().join(" ")`. The regex `\\s+` handles several spaces in a row, and trim() avoids empty words at the ends. Without reverse(), loop over the words from the end and push each one into a new array.',
        },
        {
          q: 'How would you count the vowels in the same string?',
          a: 'Loop over the lowercase characters and count the ones in "aeiou": `[...s.toLowerCase()].filter(ch => "aeiou".includes(ch)).length`. A regex way is `(s.match(/[aeiou]/gi) ?? []).length`. The `?? []` matters because match returns null, not an empty array, when nothing matches.',
        },
      ],
      pitfalls: [
        'Trying to change s[i] in place. Strings cannot be changed.',
        'Off by one: starting the loop at s.length instead of s.length - 1.',
        'Not mentioning any edge cases.',
      ],
    },
    {
      id: 'js-objects-strings-iq-02',
      difficulty: 'easy',
      question: 'Write a function that checks whether a sentence is a palindrome, ignoring case, spaces and punctuation ("A man, a plan, a canal: Panama" should be true).',
      whatInterviewerLooksFor: [
        'Cleans the input (lowercase, no punctuation) before comparing',
        'Uses two pointers or compares with a reversed copy',
        'Can say roughly how fast it is',
        'Tests edge-case inputs',
      ],
      modelAnswer: `**Plan:** clean the text, then compare characters from both ends.

\`function isPalindrome(s) {\`
\`  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\`
\`  let left = 0, right = clean.length - 1;\`
\`  while (left < right) {\`
\`    if (clean[left] !== clean[right]) return false;\`
\`    left++; right--;\`
\`  }\`
\`  return true;\`
\`}\`

**How it works:**
- \`toLowerCase()\` makes "A" and "a" the same.
- \`replace(/[^a-z0-9]/g, '')\` removes everything that is not a letter or digit: spaces, commas, the colon. The \`g\` flag removes all of them, not just the first.
- \`left\` starts at the front and \`right\` at the back. They move toward each other. The loop stops at the first mismatch, so a long non-palindrome fails fast. It walks the text at most once.

**Shorter version:** \`clean === [...clean].reverse().join('')\`. It is shorter, but it builds a second string and always reads the whole text.

**Test cases:**

| Input | Expected | Why |
|---|---|---|
| \`'A man, a plan, a canal: Panama'\` | true | punctuation and case |
| \`'racecar'\` | true | odd length |
| \`'abba'\` | true | even length |
| \`'Sauce'\` | false | normal negative |
| \`''\` | true | empty counts as a palindrome (ask!) |
| \`'!!'\` | true | becomes empty after cleaning |
| \`'12321'\` | true | digits are kept |

**Questions I would ask first:** should digits count? What about accented letters like "é"? My filter would remove them. Asking these questions shows requirement analysis, the core QA skill.`,
      followUps: [
        {
          q: 'How would you support accented and non-English letters?',
          a: 'Use a regex that understands every language: `s.toLowerCase().normalize("NFD").replace(/[^\\p{L}\\p{N}]/gu, "")`. Here \\p{L} means any letter and \\p{N} means any number, in any script. normalize("NFD") splits "é" into "e" plus an accent mark, and the filter removes the mark. Whether accents should count is a business rule, so ask.',
        },
        {
          q: 'What is the time and space complexity of each version?',
          a: 'Both versions get slower in a straight line as the text grows (O(n) time). The two-pointer version stores one cleaned string and stops at the first mismatch. The reverse version builds two extra copies and always reads the whole text. If you skip punctuation while moving the pointers, you need no extra copy at all.',
        },
      ],
      pitfalls: [
        'Forgetting the g flag, so only the first space is removed.',
        'Comparing before lowercasing.',
        'Not thinking about empty or punctuation-only input.',
      ],
    },
    {
      id: 'js-objects-strings-iq-03',
      difficulty: 'medium',
      question: 'Count how many times each character appears in a string, and then return the first character that does not repeat (e.g. "swiss" → "w").',
      context: 'A common coding question. Interviewers often ask it right after "reverse a string".',
      whatInterviewerLooksFor: [
        'Uses an object or Map to count characters',
        'Uses two loops and keeps the original order',
        'Avoids a loop inside a loop',
        'Handles the case where every character repeats',
      ],
      modelAnswer: `**Step 1: count each character**

\`function charFrequency(s) {\`
\`  const freq = {};\`
\`  for (const ch of s) freq[ch] = (freq[ch] ?? 0) + 1;\`
\`  return freq;\`
\`}\`
\`charFrequency('swiss')\` → \`{ s: 3, w: 1, i: 1 }\`.

The first time we see a character, \`freq[ch]\` is \`undefined\`. \`?? 0\` turns that into 0, and then we add 1. \`for...of\` gives one character at a time.

**Step 2: first character that does not repeat**

\`function firstUnique(s) {\`
\`  const freq = charFrequency(s);\`
\`  for (const ch of s) if (freq[ch] === 1) return ch;\`
\`  return null;\`
\`}\`

In the second loop I walk the **string** again, not the object. The question asks for the first one in the original order. Walking the string keeps that order for sure.

**Speed:** two loops over the string, so the time grows in line with its length (O(n)). A version that calls \`indexOf\` for every character has a loop inside a loop (O(n²)). That gets slow on long text.

**Map instead of object:** \`const freq = new Map(); freq.set(ch, (freq.get(ch) ?? 0) + 1);\` works for any kind of key and has no built-in keys to clash with.

**Edge cases:** \`''\` → null; \`'aabb'\` → null; \`'a'\` → 'a'. For \`'Aa'\`, ask if "A" and "a" count as the same letter. Ask if spaces count.

**Tester's angle:** the same counter finds duplicate IDs in an API list, or counts pass and fail statuses in a results table.`,
      followUps: [
        {
          q: 'How would you return the most frequent character?',
          a: 'Build the counter, then keep track of the biggest count. Loop over Object.entries(freq) and remember the key with the highest count so far. Ask what to do on a tie: return the first one found in the string, or all of them. It still takes just one extra pass.',
        },
        {
          q: 'How would you find duplicate words in a sentence instead?',
          a: 'Lowercase the sentence, split it into words, and count them with the same pattern: `for (const w of s.toLowerCase().split(/\\W+/).filter(Boolean)) freq[w] = (freq[w] ?? 0) + 1;`. Then keep the words with a count above 1. filter(Boolean) removes empty strings left by punctuation at the start or end.',
        },
      ],
      pitfalls: [
        'Looping over the object keys to find the "first" one, and trusting key order.',
        'Using a loop inside a loop without noticing it is slow.',
        'Forgetting to return null when every character repeats.',
      ],
    },
    {
      id: 'js-objects-strings-iq-04',
      difficulty: 'hard',
      question: 'Write a function deepEqual(a, b) that returns true when two values have the same structure and content (nested objects and arrays). Why not just use === or JSON.stringify?',
      whatInterviewerLooksFor: [
        'A function that calls itself for nested values, with a correct check for simple values and null',
        'Compares the number of keys, then each key',
        'Explains why === and JSON.stringify are not enough',
        'Mentions limits (Dates, NaN, objects that point to themselves) and toEqual',
      ],
      modelAnswer: `**Code:**

\`function deepEqual(a, b) {\`
\`  if (a === b) return true;                                  // same simple value or same object\`
\`  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\`
\`  if (Array.isArray(a) !== Array.isArray(b)) return false;  // [] vs {}\`
\`  const keysA = Object.keys(a), keysB = Object.keys(b);\`
\`  if (keysA.length !== keysB.length) return false;\`
\`  return keysA.every((k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k]));\`
\`}\`

\`deepEqual({ id: 1, tags: ['x'] }, { id: 1, tags: ['x'] })\` → \`true\`.

**How it works:**
- If \`===\` says true, we are done. This covers equal numbers and strings, and the same object.
- If either side is not an object (or is \`null\`), they are different.
- For objects and arrays, the number of keys must match. Then every key must exist in both, with equal values. For nested values, the function calls itself. This is called **recursion**. Arrays work too, because their indexes are keys.

**Why not \`===\`?** For objects it checks "same object". Two separately created \`{ id: 1 }\` objects are different. A parsed API response is always a new object.

**Why not \`JSON.stringify(a) === JSON.stringify(b)\`?**
- Key order matters: \`{a:1,b:2}\` and \`{b:2,a:1}\` give different text, but they are equal.
- \`undefined\` keys disappear, so \`{a: undefined}\` looks like \`{}\`.
- \`NaN\` becomes \`null\`. Dates become text. Functions vanish.

**Limits of my version:** \`NaN\` vs \`NaN\` gives false (use \`Object.is\`). Dates, Maps and Sets look like empty objects. An object that points to itself would loop forever.

**In practice:** in Playwright I use \`expect(actual).toEqual(expected)\`. It handles these cases and prints a clear diff. Writing \`deepEqual\` shows I understand what that matcher does.`,
      followUps: [
        {
          q: 'How would you check that an API response contains at least these fields, ignoring extras?',
          a: 'Do a "subset" check: for each key in expected, look inside actual, but do not require the same number of keys. In Playwright, `expect(body).toMatchObject({ firstname: "Jim", bookingdates: { checkin: "2025-01-01" } })` does exactly this. It suits APIs that add extra fields such as ids or timestamps.',
        },
        {
          q: 'How would you add support for Date objects?',
          a: 'Add a check before the general object branch: `if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();`. Maps and Sets need similar special checks (compare sizes and entries), and so do regexes. Node\'s built-in util.isDeepStrictEqual already handles all of these.',
        },
      ],
      pitfalls: [
        'Forgetting that typeof null is "object", then crashing on Object.keys(null).',
        'Only checking that the keys of a exist in b, and missing extra keys in b.',
        'Suggesting JSON.stringify without mentioning key order.',
      ],
    },
    {
      id: 'js-objects-strings-iq-05',
      difficulty: 'medium',
      question: 'What is the difference between passing by value and by reference in JavaScript, and between a shallow and a deep copy? Give an example of a test bug each can cause.',
      whatInterviewerLooksFor: [
        'Simple values are copied; objects are shared through a reference',
        'Spread and Object.assign copy only the top level',
        'structuredClone (or a factory) for full copies',
        'A real test-data bug as an example',
      ],
      modelAnswer: `**Copy vs share:** numbers, strings and booleans are copied when you assign or pass them. Changing the copy never touches the original. Objects and arrays are shared. \`const b = a\` gives a second name for the **same** object. A function that gets an object can change the caller's data.

\`const u1 = { email: 'a@test.com' }; const u2 = u1; u2.email = 'b@test.com';\` → \`u1.email\` is now \`'b@test.com'\`.

**One detail:** if a function gives its parameter a whole new object (\`user = {...}\`), the caller does not see it. Only changes to the shared object's keys (\`user.name = 'x'\`) are visible.

**Test bug from sharing:** a shared \`validUser\` object. Test A sets \`validUser.email = 'dup@test.com'\` to test the duplicate-email error. Test B runs next in the same worker. It tries to register "a fresh user", but with the changed email. It fails with "email already exists", but only after A. This is a classic flaky test.

**Shallow vs deep copy:**
- **Shallow** (\`{ ...obj }\`, \`Object.assign\`, \`[...arr]\`): a new outer object, but nested objects are still shared.
- **Deep** (\`structuredClone(obj)\`): every level is copied. Dates, Maps and Sets are kept. Functions cannot be copied, and class objects lose their methods.

**Test bug from a shallow copy:** \`const order = { ...baseOrder }; order.address.city = 'Delhi';\` The developer thought they had a copy. But \`baseOrder.address\` changed for every later test.

**How I prevent it:**
1. A factory function that returns fresh data for each test (\`buildUser(overrides)\`), ideally as a Playwright fixture.
2. \`structuredClone\` when I must start from a shared template.
3. \`Object.freeze\` on shared constants, so a change fails loudly.
4. Deep equality (\`toEqual\`) to compare content, never \`===\` on objects.`,
      followUps: [
        {
          q: 'If a function reassigns its object parameter (user = {...}), does the caller see it?',
          a: 'No. Giving the parameter a new object only changes the local name inside the function. The caller\'s variable still points to the original object. Only changes to the shared object\'s keys (user.name = "x") are visible outside. That is why people say JavaScript passes "a copy of the reference".',
        },
        {
          q: 'Is Object.freeze a deep freeze?',
          a: 'No, it only freezes the top level. Top-level keys become read-only, but nested objects can still change. A deep freeze walks through the object and freezes every nested object too. Writing to a frozen object fails silently in old non-strict scripts, and throws a TypeError in strict mode, which ES modules and classes always use.',
        },
      ],
      pitfalls: [
        'Saying spread makes a deep copy.',
        'Saying objects are passed "by reference" without explaining what happens when the parameter gets a new object.',
        'Suggesting the JSON trick without mentioning what it loses.',
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
        'Good sense about what belongs in the base class',
      ],
      modelAnswer: `**Classes** are blueprints for objects. \`new LoginPage(page)\` creates an object and runs the \`constructor\`. All objects made from one class share the same methods.

- **constructor(page):** saves values for this object on \`this\` (\`this.page = page\`).
- **Methods:** \`async login(user, pass) { ... }\`. They use \`this.\` to reach saved values.
- **extends and super:** \`class LoginPage extends BasePage\`. In the child constructor, \`super(page)\` must run before any use of \`this\`. \`super.open()\` calls the parent's method.
- Extras: getters (\`get heading()\`), \`static\` helpers, and \`#private\` fields.

**POM design for SauceDemo:**
- **BasePage:** \`constructor(page)\` saves \`this.page\`. It holds shared parts, like \`this.menuButton = page.getByRole('button', { name: 'Open Menu' })\`, an \`open(path)\` method that calls \`this.page.goto(path)\`, and \`logout()\`.
- **LoginPage extends BasePage:** locators \`this.username = page.getByPlaceholder('Username')\`, \`this.password\`, \`this.loginButton = page.getByRole('button', { name: 'Login' })\`, \`this.error = page.getByTestId('error')\`. Method: \`async login(user, pass)\`.
- **InventoryPage extends BasePage:** \`addToCart(productName)\`, \`cartBadge\`, \`sortBy(option)\`.
- In a test: \`const loginPage = new LoginPage(page); await loginPage.open('/'); await loginPage.login(user, pass);\` and then \`await expect(inventory.title).toHaveText('Products');\`

**What I keep out of BasePage:** locators and checks for one page only. Inheritance is for parts every page really shares, like the header, menu and navigation. For reusable widgets, like a date picker or a table, I prefer **composition**: a small component class that a page object holds as a field.

**Playwright fixtures:** a custom fixture (\`test.extend\`) can create the page objects. Then tests receive \`{ loginPage }\` ready to use.`,
      followUps: [
        {
          q: 'Why do subclass constructors need super() before using this?',
          a: 'In a child class, the parent constructor creates the object. Until super() runs, there is no this yet, so using it throws a ReferenceError ("Must call super constructor in derived class..."). If the child class has no constructor at all, JavaScript adds one that passes all arguments to super for you.',
        },
        {
          q: 'What are the risks of deep inheritance chains in a test framework?',
          a: 'A change in a base class affects every page. It gets hard to find where a method is defined, and pages get methods that make no sense for them. Keep it shallow: BasePage plus one level. Use composition for shared components. In test code, easy reading matters more than clever reuse.',
        },
      ],
      pitfalls: [
        'Forgetting this. inside methods.',
        'Calling super() after setting this.something.',
        'Putting every helper into BasePage until it does everything.',
      ],
    },
    {
      id: 'js-objects-strings-iq-07',
      difficulty: 'medium',
      question: 'A search page shows "Showing 1-10 of 245 results". Write code to extract the total (245) and verify it equals the number of rows the API returned. What can go wrong?',
      whatInterviewerLooksFor: [
        'Uses a regex that captures the number (or a careful split)',
        'Turns the captured text into a number',
        'Handles "no match" (null) safely',
        'Thinks about number formats, paging and timing',
      ],
      modelAnswer: `**Getting the number:**

\`function totalFromSummary(text) {\`
\`  const match = text.match(/of\\s+([\\d,]+)\\s+results?/i);\`
\`  if (!match) throw new Error('Unexpected summary text: ' + text);\`
\`  return Number(match[1].replaceAll(',', ''));\`
\`}\`
\`totalFromSummary('Showing 1-10 of 245 results')\` → \`245\`.

**The pattern in plain words:** the word "of", then spaces, then digits and commas (so "1,245" works too), then "result" or "results". The round brackets capture the number. \`s?\` makes the "s" optional. The \`i\` flag ignores case. \`match[1]\` is the captured text. It is a string, so I remove commas and convert it with \`Number\`.

**Checking it:** compare it with the API: \`expect(totalFromSummary(text)).toBe(apiBody.totalCount)\`. The page shows only 10 rows. So compare with the API's total count field, not the length of one page of results. I would also check that the rows on the page equal \`Math.min(10, total)\`.

**What can go wrong:**
1. **No match:** \`match\` is \`null\`, and \`match[1]\` crashes with a TypeError. I throw a clear error that shows the real text.
2. **Number formats:** "1,245" in English, "1.245" in German, "1 245" in French. Ask which locale is tested, or set it in the browser context (\`locale: 'en-US'\`).
3. **Timing:** if I read the text before the search finishes, I get the old count. In Playwright I first wait with \`await expect(summary).toHaveText(/of \\d+ results/)\`, then read it.
4. **A simple \`/\\d+/\`** returns "1", the first number, not the total. Starting the pattern with "of" avoids that.
5. **One result:** "of 1 result" must match too. That is why the pattern has \`results?\`.`,
      followUps: [
        {
          q: 'How would you get all three numbers at once?',
          a: 'Use one regex with three captured groups: `const [, from, to, total] = text.match(/(\\d+)\\s*-\\s*(\\d+)\\s+of\\s+(\\d+)/)`, then turn each into a Number. The comma at the start of the array pattern skips the full match. Or use text.match(/\\d+/g) to get all digit groups, but then you depend on their order.',
        },
        {
          q: 'Why is the g flag dangerous with regex.test() in a loop?',
          a: 'A regex with the g flag remembers where its last match ended (lastIndex). The next test() call starts from there, even on a different string. So the same input can give true, then false. Use a regex without g for test(), create it inside the loop, or set lastIndex = 0.',
        },
      ],
      pitfalls: [
        'Using /\\d+/ and getting the first number instead of the total.',
        'Comparing the captured string to a number with ===.',
        'Not handling null when the text does not match.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-objects-strings-drill-1',
      question:
        'Predict every log: `const base = { user: "qa", prefs: { theme: "dark" }, tags: ["smoke"] }; const a = base; const b = { ...base }; const c = structuredClone(base); a.user = "admin"; b.prefs.theme = "light"; b.tags.push("cart"); c.tags.push("api"); console.log(base.user, base.prefs.theme, base.tags.length, c.tags.length, b === base, b.prefs === base.prefs);`',
      assumptions: [
        'Assigning an object copies the reference, so both names share one object.',
        'Spread copies only the top level (shallow).',
        'structuredClone copies every level (deep).',
      ],
      steps: [
        { label: 'a = base', calc: 'same object, so a.user = "admin" changes base.user to "admin"' },
        { label: 'b = { ...base }', calc: 'a new outer object, but b.prefs and b.tags point to the same inner objects as base' },
        { label: 'b.prefs.theme = "light"', calc: 'changes the shared prefs, so base.prefs.theme = "light"' },
        { label: 'b.tags.push("cart")', calc: 'shared array, so base.tags = ["smoke", "cart"] (length 2)' },
        { label: 'c = structuredClone(base)', calc: 'copied before any changes, so it has its own tags ["smoke"]. Push "api": c.tags length 2. base is not affected' },
        { label: 'b === base, b.prefs === base.prefs', calc: 'different outer objects → false. Same inner prefs object → true' },
      ],
      answer: '`admin light 2 2 false true`.',
      insight:
        'Assigning shares everything. Spread shares nested data. structuredClone shares nothing. When test data has nested objects, a spread "copy" is a bug waiting to happen.',
      followUps: [
        {
          q: 'What would base.tags.length be if c had been created with { ...base } as well?',
          a: '3. Both b and c would share base.tags. Pushing "cart" and "api" adds two items to the one shared array: ["smoke", "cart", "api"]. That is exactly how two tests that both "copy" the same data end up seeing each other\'s changes.',
        },
      ],
    },
    {
      id: 'js-objects-strings-drill-2',
      question:
        'Trace `firstUnique("stress")` for the two-pass algorithm (build a frequency object with `for...of`, then scan the string again for the first count of 1). Then compute `countVowels("Checkout: Overview")` where vowels are a, e, i, o, u (case-insensitive).',
      assumptions: [
        'freq[ch] = (freq[ch] ?? 0) + 1 for each character, in order.',
        'The second loop walks the original string from left to right.',
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
        'Count first, then walk the string again in its original order. This is fast and gives the correct "first". The same two-step idea finds the first duplicate order ID in an API list, or the first failing row in a table.',
      followUps: [
        {
          q: 'What does firstUnique return for "aabbcc" and for an empty string, and how would you test both?',
          a: 'Both return null. In "aabbcc" every count is 2, and an empty string has no characters, so the second loop never runs. I would add both as test rows. I would also add one character ("x" → "x") and mixed case, to check whether "A" and "a" count as different characters.',
        },
      ],
    },
    {
      id: 'js-objects-strings-drill-3',
      question:
        'Predict each value: `const resp = { id: 7, booking: { firstname: "Jim", totalprice: 111 }, tags: ["vip", "late"] }; const { id, booking: { firstname, depositpaid = false }, tags: [, second] } = resp; const updated = { ...resp.booking, totalprice: 150, ...{ firstname: "Sally" } }; const json = JSON.stringify({ id, depositpaid, note: undefined });` Give id, firstname, depositpaid, second, updated, and json.',
      assumptions: [
        'Destructuring defaults are used only when the value is undefined.',
        'In object spread, later keys win.',
        'JSON.stringify drops keys whose value is undefined.',
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
        'Destructuring, spread and JSON are daily tools in API testing. Pull out what you check, build variations of a request body, and know what is really sent (undefined fields never arrive).',
      followUps: [
        {
          q: 'Was resp.booking modified when building updated?',
          a: 'No. Spread created a new object, and the later keys changed values only in that new object. resp.booking still has firstname "Jim" and totalprice 111. If updated had been made with updated = resp.booking and then changed, the original would have changed too.',
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
        'A key with a dash must be read with brackets and a string: row["first-name"]. row.first-name is read as "row.first minus name". row.firstName looks for a different key that does not exist. row[first-name] tries to subtract two variables that do not exist.',
      followUps: [
        {
          q: 'When must you use brackets even for simple keys?',
          a: 'When the key is stored in a variable: `const field = "zip"; row[field]`. Writing row.field would look for a key that is literally called "field". Data-driven tests that loop over field names use this all the time.',
        },
      ],
    },
    {
      id: 'js-objects-strings-mcq-02',
      difficulty: 'easy',
      question: 'A helper in a plain (non-module, non-strict) Node script tries to capitalise an order status by changing its first letter. What does it log?',
      code: {
        language: 'javascript',
        code: `let status = 'shipped';
status[0] = 'S';
console.log(status);`,
      },
      options: ['shipped', 'Shipped', "TypeError: Cannot assign to read only property '0'", 'Shhipped'],
      correct: [0],
      explanation:
        'Strings cannot be changed in place. In a plain script, writing to an index is silently ignored, so the value stays "shipped". In strict mode it throws a TypeError, which is why that option is tempting. To capitalise, build a new string: status[0].toUpperCase() + status.slice(1).',
      followUps: [
        {
          q: 'Which string methods change the original string?',
          a: 'None of them. Every string method (trim, replace, toUpperCase, slice) returns a new string. You must save the result: status = status.trim(). Forgetting to save it is a common reason a "cleaned" value is not cleaned.',
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
        'Spread copies keys in order, and a later key overwrites an earlier one. So the override false wins, and totalprice stays 100. An object cannot hold the same key twice. If you swap the order of the two spreads, you get depositpaid: true, which is a common bug.',
      followUps: [
        {
          q: 'Why is spread better than `defaults.depositpaid = false` here?',
          a: 'Spread creates a new object and leaves defaults untouched for the next test. Writing defaults.depositpaid = false changes the shared defaults object itself, so every later test quietly gets depositpaid: false.',
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
        'For objects, === checks "same object". expected and actual are two separate objects, so false. alias is another name for expected, so true. The JSON strings are equal here only because the keys are in the same order. That check breaks when the order differs. Use deep equality (toEqual) to compare content.',
      followUps: [
        {
          q: 'When would the JSON.stringify comparison give a wrong answer?',
          a: 'When key order differs ({ id, name } vs { name, id } gives different text), when a key is undefined on one side (it is dropped), or with NaN and Dates. It is a fragile shortcut. Deep equality compares key by key, in any order.',
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
        'Spread makes a shallow copy. The top-level name is a separate copy, so fixture.name stays Jim. But address is the same inner object in both, so the city change shows up in fixture too. "Jim Pune" would need a deep copy, which needs structuredClone.',
      followUps: [
        {
          q: 'Give two ways to make the copy fully independent.',
          a: '`const copy = structuredClone(fixture)`, or copy each nested level by hand: `{ ...fixture, address: { ...fixture.address } }`. The second way is fine for one level of nesting. structuredClone works for any depth.',
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
        'Keys whose value is undefined are left out. Dates become ISO text strings. NaN and Infinity become null. null itself is valid JSON, so it is kept as null. Nested objects stay nested. Knowing this explains "the field I set is missing from the request" bugs.',
      followUps: [
        {
          q: 'How would you test that an API rejects a missing required field?',
          a: 'Build the body without the key, using rest: const { lastname, ...body } = valid. This is clearer than setting it to undefined. Send it and expect a 400 with a message that names the field. Also test the field present but null, which is a different case.',
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
        'page: p reads the key page into a variable called p ("PAGE"). A default is used when the value is undefined. That is true for request (set to undefined) and for browserName (missing). The option with undefined assumes that a written-out undefined blocks the default. It does not.',
      followUps: [
        {
          q: 'Would the default apply if request were null?',
          a: 'No. Destructuring defaults, like default parameters, are used only for undefined. null is a value someone chose on purpose, so it is kept, and request would be null.',
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
        'A removes the one $ and the one comma. B removes every $ and every comma, because the regex has the g flag. C cuts off the first character, then removes the comma. D looks for the two characters "$," next to each other, which do not appear, so nothing changes. B is the safest: a price over a million has two commas, and a string replace only changes the first.',
      followUps: [
        {
          q: 'What would A return for "$1,299,000.00"?',
          a: '"1299,000.00". replace with a string changes only the first match, so the second comma stays and Number() would give NaN. Use replaceAll(",", "") or a regex with the g flag.',
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
        'In a child class, this does not exist until the parent constructor has run through super(). Using this first throws a ReferenceError ("Must call super constructor in derived class before accessing \'this\'..."). So the order of lines does matter here. Nothing about the field is read-only.',
      followUps: [
        {
          q: 'What happens if CartPage defines no constructor at all?',
          a: 'JavaScript adds a default constructor that works like constructor(...args) { super(...args); }. So new CartPage(page) still sets this.page. You only need your own constructor when the child class adds its own fields.',
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
        'structuredClone copies every nested level. It keeps Dates (and Maps, Sets and regexes). It also handles an object that points to itself, so it does not throw. It cannot copy functions (it throws a DataCloneError). A copied class object comes back as a plain object, so instanceof is false and its methods are gone.',
      followUps: [
        {
          q: 'So how should you "copy" a Page Object?',
          a: 'You should not copy it. Create a new one with new LoginPage(page) or get one from a fixture. A Page Object holds actions and a live page, not plain data, so copying it makes no sense. Copy only plain test data.',
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
        'Most emoji are stored as two hidden pieces (UTF-16 code units). split("") cuts the emoji into those two pieces, and reverse() swaps their order. The swapped pair is not a valid character, so it shows as broken symbols. Spreading [..."Bike😀"] keeps each emoji whole. reverse and join have no such limits.',
      followUps: [
        {
          q: 'What does "😀".length return, and why does it matter for field-length tests?',
          a: 'It returns 2, because length counts those hidden pieces, not what you see. A "max 10 characters" check might accept 10 letters but reject 6 emoji. The backend might also count differently from the frontend. Add emoji and accented letters to your length tests to catch this.',
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
        'trim() plus toLowerCase() gives an exact match. The regex with the i flag finds the phrase anywhere, in any case. Lowercasing and then includes("order") is true. includes("Thank you") is case-sensitive, and the text says "THANK YOU". startsWith("THANK") is false because of the two spaces at the start.',
      followUps: [
        {
          q: 'How would you assert this in Playwright?',
          a: '`await expect(page.getByRole("heading", { level: 2 })).toHaveText(/thank you for your order/i)`. toHaveText ignores extra spaces and accepts a regex. It also retries until the text appears, so you need no manual trim, lowercase or waits.',
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
        'The anchors ^ and $ force the whole text to be exactly six digits. So ^\\d{6}$, ^[0-9]{6}$ and ^[1-9]\\d{5}$ (no leading zero) accept 560001 and reject the 7-digit value. Without anchors, \\d{6} finds six digits inside "5600012" and wrongly matches. ^\\d+$ accepts any number of digits.',
      followUps: [
        {
          q: 'Why might ^[1-9]\\d{5}$ be the best of the three?',
          a: 'Real Indian PIN codes never start with 0. So this pattern adds one more business rule and rejects "012345". Picking the pattern is a requirements question: confirm it with the spec before you assert the stricter rule.',
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
        'Pair 2 has the same content but a different key order. The text differs, so the check wrongly says "different". Pair 4 has different content (NaN vs null), but stringify turns NaN into null. Both become {"price":null}, so the check wrongly says "equal". Pairs 1 and 3 are judged correctly. Key order and lost values are why a deep check beats comparing text.',
      followUps: [
        {
          q: 'Which Playwright matcher would you use instead, and does it care about key order?',
          a: 'expect(a).toEqual(b). It compares key by key, so key order does not matter. Note that toEqual treats undefined keys as missing (so { note: undefined } equals {}), while toStrictEqual does not.',
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
        'Object keys are case-sensitive. So "a" is counted 2 times, while "A", "b" and "B" are each counted once. Walking the string in order, the first character with a count of 1 is "A" at index 1. "b" or null would be right only if the function lowercased the text first. That is a requirement to ask about in the interview.',
      followUps: [
        {
          q: 'How would you make it case-insensitive but still return the original character?',
          a: 'Count with a lowercased key, freq[ch.toLowerCase()]. In the second loop, check freq[ch.toLowerCase()] === 1 but return ch itself. For "aAbBa" that gives null, since a/A and b/B both repeat. Saying your assumption before coding is the key interview signal.',
        },
      ],
    },
  ],
};

export default topic;
