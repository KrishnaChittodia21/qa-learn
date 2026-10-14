import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-arrays',
  phase: 'javascript',
  order: 4,
  title: 'Arrays: Methods, Sorting & Interview Problems',
  subtitle:
    'The data structure you will use in every Playwright test: lists of prices, names, rows and IDs. Learn the methods, the mutation traps, the sort trap, and the classic array coding questions QA interviewers love.',
  estimatedMinutes: 120,
  sources: [
    'javascript.info — Arrays, Array methods, Iterables, Map and Set',
    'MDN Web Docs — Array (reference), Array.prototype.sort, toSorted, flat, flatMap, Array.from, Set, Object.groupBy',
    'Marijn Haverbeke — Eloquent JavaScript, Ch 4 Data Structures and Ch 5 Higher-Order Functions',
    'Kyle Simpson — You Don\'t Know JS Yet (Get Started: values vs references)',
    'Playwright docs — locator.allTextContents, locator.all, expect(locator).toHaveText with arrays, toHaveCount',
    'softwaretestpilot.com — Coding rounds for QA and SDET (array question bank)',
    'GeeksforGeeks — Array interview questions (second largest, missing number, rotate, merge sorted arrays)',
    'AmbitionBox — QA / test engineer interview reports (second largest element, remove duplicates)',
  ],
  tags: ['arrays', 'map', 'filter', 'reduce', 'sort', 'set', 'interview-problems', 'allTextContents', 'mutation'],
  cheatSheet: [
    'Arrays are ordered, zero-indexed lists; `arr.length` is last index + 1; `arr.at(-1)` reads the last item; `Array.isArray(x)` (not `typeof`, which says "object").',
    'MUTATE the original: push, pop, shift, unshift, splice, sort, reverse, fill. Return a NEW array: slice, concat, map, filter, flat, toSorted, toReversed, toSpliced, with, spread `[...arr]`.',
    '`splice(start, deleteCount, ...items)` cuts the original and returns the removed items; `slice(start, end)` copies, end is exclusive, negative counts from the end.',
    'map = transform each (same length); filter = keep some (shorter or equal); reduce = fold to one value; ALWAYS give reduce an initial value (`[].reduce(fn)` throws TypeError).',
    'forEach returns undefined, cannot `break`, and does NOT wait for async callbacks; use `for...of` when you need break or await.',
    'find → first item or undefined; findIndex → index or -1; some → at least one; every → all (and `[].every(...)` is true!); includes finds NaN, indexOf does not.',
    'Default `sort()` compares as STRINGS: `[10, 9, 1, 100].sort()` → [1, 10, 100, 9]. Numbers: `(a, b) => a - b`; text: `a.localeCompare(b)`.',
    'sort() sorts in place and returns the SAME array, so `expect(arr).toEqual(arr.sort())` always passes. Copy first: `[...arr].sort(...)` or `arr.toSorted(...)`.',
    'Dedupe: `[...new Set(arr)]` (keeps first-seen order, works for primitives, not objects). Frequency: `counts[x] = (counts[x] ?? 0) + 1` or a Map.',
    'Classic interview set: reverse without reverse(), second largest (single pass, handle duplicates), missing number (n(n+1)/2 − sum), rotate (k % n), chunk, flatten, merge two sorted arrays (two pointers), pair sum (Set).',
    'Playwright: `await locator.allTextContents()` → string[] (does not auto-wait); map to numbers, then compare with a sorted copy; prefer `await expect(locator).toHaveText([...])` when you know the exact list.',
    'Big-O to say aloud: `includes`/`indexOf` inside a loop = O(n²); a Set lookup is O(1) on average, so Set-based solutions are O(n).',
  ],
  sections: [
    {
      heading: 'Arrays in plain English',
      body: `**Intuition:** an array is a numbered list, like the rows in an Excel column. Row numbers start at **0**, not 1.

In testing you meet arrays constantly: the six product names on the SauceDemo inventory page, all the prices in a cart, every row of a table, the list of error messages a form shows, the JSON array an API returns.

**The basics**

- Create with square brackets: \`const fruits = ['apple', 'banana', 'cherry']\`.
- Read by index: \`fruits[0]\` is the first item; \`fruits[fruits.length - 1]\` (or \`fruits.at(-1)\`) is the last.
- \`length\` is always "last index + 1". Reading an index that does not exist gives \`undefined\`, not an error, which is why a typo in an index silently passes bad data into your test.
- An array can hold anything, mixed: numbers, strings, objects, even other arrays.
- \`const\` stops you from **reassigning** the variable; it does not stop you from **changing the contents**. \`const list = []; list.push(1)\` is perfectly legal.
- To check "is this an array?" use \`Array.isArray(value)\`. \`typeof []\` is \`'object'\`, so \`typeof\` cannot tell an array from a plain object.

**Common mistake:** confusing "count" and "index". A list with 6 products has indexes 0 to 5. A loop written as \`i <= arr.length\` reads one item too many and gets \`undefined\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Creating and reading arrays',
          code: `const products = ['Backpack', 'Bike Light', 'Bolt T-Shirt'];

console.log(products[0]);              // → 'Backpack'
console.log(products.length);          // → 3
console.log(products[products.length - 1]); // → 'Bolt T-Shirt'
console.log(products.at(-1));          // → 'Bolt T-Shirt'  (negative index counts from the end)
console.log(products[10]);             // → undefined  (no error!)

// const protects the variable, not the contents
products.push('Fleece Jacket');
console.log(products.length);          // → 4

// typeof cannot spot an array
console.log(typeof products);          // → 'object'
console.log(Array.isArray(products));  // → true
console.log(Array.isArray({ 0: 'a' })); // → false

// Arrays can hold mixed values, including objects (very common for API data)
const users = [
  { name: 'standard_user', locked: false },
  { name: 'locked_out_user', locked: true },
];
console.log(users[1].name);            // → 'locked_out_user'`,
        },
      ],
      keyPoints: [
        'Indexes start at 0; the last index is length - 1.',
        'Out-of-range reads return undefined instead of throwing: a silent source of wrong test data.',
        'Use Array.isArray, never typeof, to detect arrays.',
      ],
      source: 'javascript.info — Arrays',
    },
    {
      heading: 'Mutating vs non-mutating methods',
      body: `**Intuition:** some methods **edit the original document** (like typing into a shared Google Sheet); others **make a photocopy** and edit the copy. Mixing these up is the single biggest source of array bugs in test code.

Why a tester should care: arrays are passed **by reference**. If a helper sorts the list it was given, the caller's list is now sorted too. If two tests share one array of test data and one test \`push\`es into it, the second test sees the extra item. That is shared-state flakiness, created by one innocent-looking method.

| Mutates the original | Returns a new array (original untouched) |
|---|---|
| \`push\`, \`pop\` (end) | \`slice\` (copy a part) |
| \`unshift\`, \`shift\` (start) | \`concat\`, spread \`[...a, ...b]\` |
| \`splice\` (cut / insert anywhere) | \`toSpliced\` (ES2023) |
| \`sort\` | \`toSorted\` (ES2023) |
| \`reverse\` | \`toReversed\` (ES2023) |
| \`fill\`, \`copyWithin\` | \`map\`, \`filter\`, \`flat\`, \`flatMap\`, \`with(i, v)\` |

**Rule of thumb for test code:** treat arrays you did not create as read-only. Copy first (\`[...arr]\`), then change the copy.

**In interviews say this:** "\`sort\` and \`reverse\` mutate; if I need to keep the original I use \`toSorted\`/\`toReversed\` on Node 20+, or spread into a copy first."`,
      code: [
        {
          language: 'javascript',
          title: 'Same reference, surprising change',
          code: `const original = [3, 1, 2];
const alias = original;          // NOT a copy: both names point to one array
alias.push(4);
console.log(original);           // → [3, 1, 2, 4]

const copy = [...original];      // a real (shallow) copy
copy.sort((a, b) => a - b);
console.log(copy);               // → [1, 2, 3, 4]
console.log(original);           // → [3, 1, 2, 4]  (untouched)

// sort() returns the SAME array object it sorted
const scores = [30, 10, 20];
const sorted = scores.sort((a, b) => a - b);
console.log(sorted === scores);  // → true
console.log(scores);             // → [10, 20, 30]  (original changed!)

// ES2023 non-mutating twins (Node 20+, modern browsers)
const ids = [3, 1, 2];
console.log(ids.toSorted((a, b) => a - b)); // → [1, 2, 3]
console.log(ids.toReversed());              // → [2, 1, 3]
console.log(ids.with(0, 99));               // → [99, 1, 2]
console.log(ids);                           // → [3, 1, 2]`,
        },
      ],
      keyPoints: [
        'Assigning an array to another variable copies the reference, not the items.',
        'sort/reverse/splice change the original; toSorted/toReversed/toSpliced do not.',
        'Spread `[...arr]` is a shallow copy: nested objects are still shared.',
      ],
      source: 'MDN Web Docs — Array: copying methods and mutating methods',
    },
    {
      heading: 'Adding, removing and slicing',
      body: `**Intuition:** \`push\`/\`pop\` work at the back of the queue, \`unshift\`/\`shift\` at the front, \`splice\` is scissors-and-glue anywhere, and \`slice\` is a photocopier that copies a range.

| Method | Where | Returns | Mutates? |
|---|---|---|---|
| \`push(x)\` | end | new length | yes |
| \`pop()\` | end | removed item | yes |
| \`unshift(x)\` | start | new length | yes |
| \`shift()\` | start | removed item | yes |
| \`splice(i, n, ...items)\` | anywhere | array of removed items | yes |
| \`slice(start, end)\` | range | new array (end exclusive) | no |

**splice vs slice** is a top-10 JavaScript interview question. Memory trick: s**p**lice has a **p** for "**p**ermanent change".

**Worked example (test data):** you keep a list of users still to be tested. After each test, \`shift()\` takes the next user from the front. A "first 3 smoke users" list is \`allUsers.slice(0, 3)\`, which leaves \`allUsers\` alone.

**Common mistake:** removing items with \`splice\` while looping forward over the same array. Every removal shifts the remaining items left, so the loop skips the next item. Use \`filter\` instead (it builds a new array) or loop backwards.`,
      code: [
        {
          language: 'javascript',
          title: 'push, pop, shift, unshift, splice, slice',
          code: `const queue = ['standard_user', 'problem_user'];
console.log(queue.push('visual_user'));   // → 3  (new length)
console.log(queue.pop());                 // → 'visual_user'
console.log(queue.unshift('admin'));      // → 3
console.log(queue.shift());               // → 'admin'
console.log(queue);                       // → ['standard_user', 'problem_user']

// splice(start, deleteCount, ...itemsToInsert) → returns removed items
const steps = [1, 2, 3, 4, 5];
console.log(steps.splice(1, 2));          // → [2, 3]
console.log(steps);                       // → [1, 4, 5]
steps.splice(1, 0, 'x');                  // insert without deleting
console.log(steps);                       // → [1, 'x', 4, 5]

// slice(start, end) → copy, end NOT included, original untouched
const all = ['a', 'b', 'c', 'd', 'e'];
console.log(all.slice(1, 3));             // → ['b', 'c']
console.log(all.slice(-2));               // → ['d', 'e']
console.log(all.slice());                 // → ['a', 'b', 'c', 'd', 'e'] (full copy)

// Bug: splicing while looping forward skips items
const errors = ['warn', 'error', 'error', 'info'];
for (let i = 0; i < errors.length; i++) {
  if (errors[i] === 'error') errors.splice(i, 1);
}
console.log(errors);                      // → ['warn', 'error', 'info']  (one survived!)
console.log(['warn', 'error', 'error', 'info'].filter((e) => e !== 'error')); // → ['warn', 'info']`,
        },
      ],
      keyPoints: [
        'push/unshift return the new length, pop/shift return the removed item.',
        'splice edits and returns what it removed; slice copies and never edits.',
        'Never splice inside a forward loop over the same array; filter instead.',
      ],
      source: 'javascript.info — Array methods (splice, slice, concat)',
    },
    {
      heading: 'Looping and searching: forEach, find, some, every, includes',
      body: `**Intuition:** these methods answer questions about a list. "Do something with each one" (forEach). "Give me the first one that matches" (find). "Is there at least one?" (some). "Are they all?" (every). "Is this exact value in there?" (includes).

| Question | Method | Returns when nothing matches |
|---|---|---|
| Do something for each item | \`forEach(fn)\` | \`undefined\` (always) |
| First item matching a rule | \`find(fn)\` | \`undefined\` |
| Index of first match | \`findIndex(fn)\` | \`-1\` |
| Last match / its index | \`findLast\`, \`findLastIndex\` | \`undefined\` / \`-1\` |
| Is this exact value present? | \`includes(v)\` | \`false\` |
| Position of exact value | \`indexOf(v)\` | \`-1\` |
| At least one matches? | \`some(fn)\` | \`false\` |
| All match? | \`every(fn)\` | \`true\` on an **empty** array! |

**Two traps interviewers like:**

1. \`[].every(fn)\` is \`true\` ("vacuous truth"). If your locator found **zero** prices because the page had not loaded, \`prices.every(p => p > 0)\` still passes. Always assert the count is greater than zero first.
2. \`indexOf(NaN)\` is \`-1\` but \`includes(NaN)\` is \`true\`, because \`includes\` uses the SameValueZero comparison.

**forEach limits:** you cannot \`break\` out of it, its return value is always \`undefined\`, and it does not wait for \`async\` callbacks (see the async topic). When you need to stop early, use \`for...of\` with \`break\`, or \`find\`/\`some\`, which stop at the first match.`,
      code: [
        {
          language: 'javascript',
          title: 'Searching a list of users',
          code: `const users = [
  { name: 'standard_user', locked: false, role: 'buyer' },
  { name: 'locked_out_user', locked: true, role: 'buyer' },
  { name: 'admin', locked: false, role: 'admin' },
];

console.log(users.find((u) => u.locked).name);          // → 'locked_out_user'
console.log(users.findIndex((u) => u.role === 'admin')); // → 2
console.log(users.find((u) => u.role === 'guest'));     // → undefined
console.log(users.some((u) => u.locked));               // → true
console.log(users.every((u) => u.name.length > 3));     // → true

const names = users.map((u) => u.name);
console.log(names.includes('admin'));                   // → true
console.log(names.indexOf('ghost'));                    // → -1

// Trap 1: every() on an empty list is true
const pricesFromPage = [];                              // page not loaded yet!
console.log(pricesFromPage.every((p) => p > 0));        // → true  (false confidence)

// Trap 2: NaN
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));   // → true -1

// forEach always returns undefined
console.log([1, 2, 3].forEach((x) => x * 2));           // → undefined`,
        },
      ],
      keyPoints: [
        'find/some/every stop early; forEach always visits everything.',
        'Guard every() with a length check: an empty list passes vacuously.',
        'includes is the readable way to ask "is X in the list?".',
      ],
      source: 'MDN Web Docs — Array.prototype.every, includes, find',
    },
    {
      heading: 'map, filter and reduce',
      body: `**Intuition:** think of a factory line. **map** paints every item (same number of items out as in). **filter** is a quality gate that throws some items away. **reduce** melts everything down into one bar (a total, a count, an object).

These three are the core of "data wrangling" in tests: you scrape strings from the page, **map** them to numbers, **filter** the ones you care about, and **reduce** them to a total you can compare with what the UI shows.

**map(fn)** calls \`fn(item, index, array)\` for every item and builds a new array from the return values. Forgetting \`return\` inside curly braces gives you an array of \`undefined\`.

**filter(fn)** keeps the items where \`fn\` returns a truthy value. \`arr.filter(Boolean)\` is a handy idiom to drop empty strings, \`null\`, \`undefined\`, \`0\` and \`NaN\`.

**reduce(fn, initial)** walks the list carrying an **accumulator**. Each call gets \`(acc, item)\` and returns the new accumulator. **Always pass an initial value.** Without it, reduce uses the first item as the start, which breaks for objects and throws \`TypeError: Reduce of empty array with no initial value\` on an empty array, exactly when your page returned no rows.

**Chaining** reads top to bottom like a recipe: \`texts.map(toNumber).filter(n => n > 10).reduce(sum, 0)\`.

**Classic gotcha:** \`['1', '2', '3'].map(parseInt)\` gives \`[1, NaN, NaN]\`, because map passes the index as the second argument and \`parseInt\` treats it as the radix. Write \`map(Number)\` or \`map((s) => parseInt(s, 10))\`.`,
      diagram: `  texts   ['$29.99', '$9.99', '$15.99']
            |  map(t => Number(t.slice(1)))
            v
  numbers [29.99, 9.99, 15.99]         same length
            |  filter(n => n > 10)
            v
  big     [29.99, 15.99]                fewer items
            |  reduce((sum, n) => sum + n, 0)
            v
  total   45.98                         one value`,
      code: [
        {
          language: 'javascript',
          title: 'Cart total: map → filter → reduce',
          code: `const priceTexts = ['$29.99', '$9.99', '$15.99'];

const prices = priceTexts.map((t) => Number(t.replace('$', '')));
console.log(prices);                        // → [29.99, 9.99, 15.99]

const over10 = prices.filter((p) => p > 10);
console.log(over10);                        // → [29.99, 15.99]

const total = prices.reduce((sum, p) => sum + p, 0);
console.log(total.toFixed(2));              // → '55.97'  (toFixed avoids 0.1+0.2 noise)

// Forgetting return inside braces
console.log([1, 2].map((x) => { x * 2; })); // → [undefined, undefined]

// reduce into an object: count orders by status
const orders = ['paid', 'failed', 'paid', 'refunded', 'paid'];
const byStatus = orders.reduce((acc, s) => {
  acc[s] = (acc[s] ?? 0) + 1;
  return acc;                               // must return the accumulator!
}, {});
console.log(byStatus);                      // → { paid: 3, failed: 1, refunded: 1 }

// The parseInt trap
console.log(['1', '2', '3'].map(parseInt)); // → [1, NaN, NaN]
console.log(['1', '2', '3'].map(Number));   // → [1, 2, 3]

// Empty list without an initial value throws
try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.message); }
// → 'Reduce of empty array with no initial value'`,
        },
      ],
      keyPoints: [
        'map keeps length, filter shrinks, reduce collapses to one value.',
        'Inside `{ }` you must write `return`; arrow functions without braces return automatically.',
        'Always give reduce an initial value: 0 for sums, {} for counting, [] for building lists.',
      ],
      source: 'javascript.info — Array methods (map, filter, reduce); Eloquent JavaScript Ch 5',
    },
    {
      heading: 'Sorting: the string trap, comparators and checking sort order',
      body: `**Intuition:** by default JavaScript sorts like a dictionary, letter by letter, **even for numbers**. "100" comes before "25" because "1" comes before "2".

**How sort works**

- \`arr.sort()\` with no argument converts each item to a string and compares UTF-16 code units. That is why \`[10, 9, 1, 100, 25].sort()\` gives \`[1, 10, 100, 25, 9]\`, and why uppercase letters come before lowercase (\`'B' < 'a'\`).
- Pass a **comparator** \`(a, b) => number\`. Return negative to put \`a\` first, positive to put \`b\` first, \`0\` to keep their order. For numbers: \`(a, b) => a - b\` ascending, \`(a, b) => b - a\` descending.
- For text, use \`a.localeCompare(b)\`, which handles case and accents the way humans expect. Add \`{ sensitivity: 'base' }\` to ignore case.
- Sorting objects: compare a field, e.g. \`(a, b) => a.price - b.price\`.
- \`sort\` is **stable** (since ES2019): equal items keep their original relative order.
- \`sort\` **mutates** and returns the same array. Use \`toSorted\` (Node 20+) or \`[...arr].sort(...)\` to keep the original.

**Testing a sort feature (the #1 Playwright array task):** "Choose *Price (low to high)* on SauceDemo and verify the list is sorted." The robust recipe:

1. Read the texts the user sees (\`allTextContents\`).
2. Convert to comparable values (\`Number\`, trim, lowercase).
3. Build an **independently sorted copy** and compare the two with \`toEqual\`.

The classic false-pass bug is \`expect(prices).toEqual(prices.sort())\`: \`sort\` sorts \`prices\` itself and returns the same array, so you compare the array with itself and the test can never fail.

| Data | Comparator |
|---|---|
| numbers ascending | \`(a, b) => a - b\` |
| numbers descending | \`(a, b) => b - a\` |
| text A→Z | \`(a, b) => a.localeCompare(b)\` |
| text Z→A | \`(a, b) => b.localeCompare(a)\` |
| objects by field | \`(a, b) => a.price - b.price\` |
| dates (ISO strings) | \`(a, b) => new Date(a) - new Date(b)\` |`,
      code: [
        {
          language: 'javascript',
          title: 'Default sort vs comparators',
          code: `console.log([10, 9, 1, 100, 25].sort());              // → [1, 10, 100, 25, 9]
console.log([10, 9, 1, 100, 25].sort((a, b) => a - b)); // → [1, 9, 10, 25, 100]
console.log([10, 9, 1, 100, 25].sort((a, b) => b - a)); // → [100, 25, 10, 9, 1]

console.log(['b', 'B', 'a', 'A'].sort());              // → ['A', 'B', 'a', 'b']
console.log(['banana', 'Apple', 'cherry'].sort((a, b) => a.localeCompare(b)));
// → ['Apple', 'banana', 'cherry']

const items = [
  { name: 'Onesie', price: 7.99 },
  { name: 'Backpack', price: 29.99 },
  { name: 'Bike Light', price: 9.99 },
];
console.log(items.toSorted((a, b) => a.price - b.price).map((i) => i.name));
// → ['Onesie', 'Bike Light', 'Backpack']

// Helper: is a list sorted ascending? (no mutation, no copy needed)
const isSortedAsc = (arr) => arr.every((v, i) => i === 0 || arr[i - 1] <= v);
console.log(isSortedAsc([7.99, 9.99, 15.99, 15.99])); // → true  (ties are fine)
console.log(isSortedAsc([9.99, 7.99]));               // → false

// The false-pass trap
const prices = [29.99, 9.99];
const looksSorted = prices.sort((a, b) => a - b);
console.log(looksSorted === prices); // → true: comparing an array with itself proves nothing`,
        },
        {
          language: 'typescript',
          title: 'Playwright: verify SauceDemo "Price (low to high)" really sorts',
          code: `import { test, expect } from '@playwright/test';

test('price low to high sorts the inventory', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  // public demo credentials; real projects read these from env vars
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

  const priceLocator = page.locator('[data-test="inventory-item-price"]');
  await expect(priceLocator).toHaveCount(6);   // wait + guard against an empty list

  const texts = await priceLocator.allTextContents();
  // → ['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']
  const prices = texts.map((t) => Number(t.replace('$', '')));
  const expected = [...prices].sort((a, b) => a - b); // independent sorted COPY

  expect(prices).toEqual(expected);
});`,
        },
      ],
      keyPoints: [
        'No comparator = string comparison, even for numbers.',
        'a - b ascending, b - a descending, localeCompare for text.',
        'Compare the UI order against a sorted COPY; never against arr.sort() of the same array.',
      ],
      source: 'MDN Web Docs — Array.prototype.sort; Playwright docs — locator.allTextContents',
    },
    {
      heading: 'flat, flatMap, Array.from, spread and destructuring',
      body: `**Intuition:** these are the "reshape" tools. \`flat\` unpacks boxes inside boxes, \`Array.from\` turns "list-like" things into real arrays, spread pours one array into another, and destructuring unpacks positions into variables.

- **\`flat(depth = 1)\`** flattens nested arrays by one level by default; \`flat(Infinity)\` flattens everything.
- **\`flatMap(fn)\`** is \`map\` followed by \`flat(1)\`. Great when each item produces zero or more results (split each line into words; turn each table row into its cells).
- **\`Array.from(source, mapFn?)\`** builds an array from a string, a Set, a Map or a "length" object. \`Array.from({ length: 5 }, (_, i) => i + 1)\` makes \`[1, 2, 3, 4, 5]\`, a quick way to generate test data.
- **Spread \`[...a, ...b]\`** copies and merges. **Destructuring** \`const [first, second, ...rest] = arr\` pulls items out by position, and \`[a, b] = [b, a]\` swaps two variables.
- **\`Array(3)\`** creates three *empty slots*, not three \`undefined\`s; \`map\` skips empty slots. Use \`Array.from({ length: 3 })\` or \`new Array(3).fill(0)\`.

**In tests:** generating 50 unique emails, splitting a CSV line into fields, flattening a list of table rows into all cell values.`,
      code: [
        {
          language: 'javascript',
          title: 'Reshaping arrays',
          code: `const nested = [1, [2, [3, [4]]]];
console.log(nested.flat());          // → [1, 2, [3, [4]]]
console.log(nested.flat(Infinity));  // → [1, 2, 3, 4]

const lines = ['add to cart', 'checkout'];
console.log(lines.flatMap((l) => l.split(' ')));
// → ['add', 'to', 'cart', 'checkout']

// Generate test data
const emails = Array.from({ length: 3 }, (_, i) => 'qa+' + (i + 1) + '@example.com');
console.log(emails);
// → ['qa+1@example.com', 'qa+2@example.com', 'qa+3@example.com']
console.log(Array.from('abc'));                  // → ['a', 'b', 'c']
console.log(Array.from(new Set([1, 1, 2])));     // → [1, 2]

// Spread: copy and merge
const smoke = ['login', 'search'];
const regression = [...smoke, 'checkout', 'refund'];
console.log(regression);             // → ['login', 'search', 'checkout', 'refund']

// Destructuring
const [first, , third, ...rest] = regression;
console.log(first, third, rest);     // → 'login' 'checkout' ['refund']
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);                   // → 2 1

// Empty slots trap
console.log(Array(3));               // → [ <3 empty items> ]
console.log(new Array(3).fill(0));   // → [0, 0, 0]`,
        },
      ],
      keyPoints: [
        'flat() defaults to depth 1; flat(Infinity) for any depth.',
        'Array.from({ length: n }, fn) is the cleanest way to generate n items.',
        'Spread makes a shallow copy; destructuring reads by position.',
      ],
      source: 'MDN Web Docs — Array.prototype.flat, flatMap, Array.from',
    },
    {
      heading: 'Set, Map and frequency counting',
      body: `**Intuition:** a **Set** is a guest list where every name appears once. A **Map** (or a plain object) is a tally sheet: name on the left, count on the right.

**Set**: \`new Set(array)\` drops duplicates (using SameValueZero, so \`NaN\` equals \`NaN\`, but two different objects with the same content are **not** equal). \`set.has(x)\` is an average O(1) lookup, much faster than \`array.includes(x)\` inside a loop. Convert back with \`[...set]\`.

**Frequency map**: the pattern behind half the array interview questions (duplicates, most frequent, first non-repeating, anagrams).

- Plain object: \`counts[x] = (counts[x] ?? 0) + 1\`. Keys become strings.
- \`Map\`: \`m.set(x, (m.get(x) ?? 0) + 1)\`. Keys keep their type and insertion order.
- \`Object.groupBy(items, fn)\` (Node 21+, ES2024) groups items into arrays by a key.

**Testing use:** "every order ID on the page must be unique" is \`new Set(ids).size === ids.length\`. "Which statuses appear and how often?" is a frequency map.`,
      code: [
        {
          language: 'javascript',
          title: 'Unique checks, duplicates and counts',
          code: `const orderIds = ['A1', 'B2', 'A1', 'C3', 'B2'];

console.log([...new Set(orderIds)]);                     // → ['A1', 'B2', 'C3']
console.log(new Set(orderIds).size === orderIds.length); // → false (duplicates exist)

// Which values are duplicated?
const seen = new Set();
const dupes = new Set();
for (const id of orderIds) {
  if (seen.has(id)) dupes.add(id);
  else seen.add(id);
}
console.log([...dupes]);                                 // → ['A1', 'B2']

// Frequency map with a Map
const counts = new Map();
for (const id of orderIds) counts.set(id, (counts.get(id) ?? 0) + 1);
console.log(counts);                     // → Map(3) { 'A1' => 2, 'B2' => 2, 'C3' => 1 }

// Most frequent item
const [top] = [...counts].sort((a, b) => b[1] - a[1]);
console.log(top);                        // → ['A1', 2]

// Set does not dedupe objects with equal content
console.log(new Set([{ id: 1 }, { id: 1 }]).size);       // → 2

// Group by (ES2024)
const tests = [{ t: 'login', s: 'pass' }, { t: 'cart', s: 'fail' }, { t: 'pay', s: 'pass' }];
console.log(Object.groupBy(tests, (x) => x.s));
// → [Object: null prototype] {
//     pass: [ { t: 'login', s: 'pass' }, { t: 'pay', s: 'pass' } ],
//     fail: [ { t: 'cart', s: 'fail' } ] }`,
        },
      ],
      keyPoints: [
        'new Set(arr).size === arr.length is a one-line uniqueness assertion.',
        'Use a Set for "seen before?" checks: O(1) average instead of O(n).',
        'Sets compare objects by reference, so dedupe objects by a key (e.g. a Map keyed by id).',
      ],
      source: 'javascript.info — Map and Set; MDN Web Docs — Object.groupBy',
    },
    {
      heading: 'Array interview problems, part 1: reverse, duplicates, second largest, missing number',
      body: `**Intuition:** QA coding rounds rarely ask for fancy algorithms. They ask for small, everyday list problems and watch **how** you think: do you clarify the input, handle edge cases (empty, one item, duplicates, negatives), explain complexity, and know both a "built-in" and a "manual" solution?

**A repeatable approach (say it aloud):**

1. **Clarify**: sorted or not? duplicates? negatives? may I mutate the input? what to return for an empty array?
2. **Example**: walk one small input by hand.
3. **Brute force first**, then improve (often with a Set or a single pass).
4. **Test it like a tester**: empty, one element, all equal, negatives, already sorted.
5. **Complexity**: time and extra space.

| Problem | Built-in way | Manual way | Time |
|---|---|---|---|
| Reverse | \`[...a].reverse()\` | two pointers swapping ends | O(n) |
| Remove duplicates | \`[...new Set(a)]\` | loop + Set of seen | O(n) |
| Second largest (distinct) | sort desc of unique values, take [1] | one pass tracking first & second | O(n log n) vs O(n) |
| Missing number 1..n | sum formula | XOR or a Set | O(n) |
| Max / min | \`Math.max(...a)\` | loop | O(n) |

**Watch-outs:** \`Math.max(...[])\` is \`-Infinity\`; spreading a huge array (hundreds of thousands of items) into \`Math.max\` can throw a RangeError, so a loop or \`reduce\` is safer for large data.`,
      code: [
        {
          language: 'javascript',
          title: 'Reverse, dedupe, second largest, missing number',
          code: `// 1. Reverse without reverse(): two pointers
function reverseArray(arr) {
  const a = [...arr];                     // don't mutate the caller's array
  for (let i = 0, j = a.length - 1; i < j; i++, j--) {
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
console.log(reverseArray([1, 2, 3, 4]));  // → [4, 3, 2, 1]

// 2. Remove duplicates, keep first-seen order
const unique = (arr) => arr.filter((x, i) => arr.indexOf(x) === i); // O(n²) but readable
console.log(unique([3, 1, 3, 2, 1]));     // → [3, 1, 2]
console.log([...new Set([3, 1, 3, 2, 1])]); // → [3, 1, 2]  (O(n))

// 3. Second largest DISTINCT value in one pass
function secondLargest(nums) {
  let first = -Infinity;
  let second = -Infinity;
  for (const n of nums) {
    if (n > first) { second = first; first = n; }
    else if (n > second && n < first) second = n;   // n < first skips duplicates of max
  }
  return second === -Infinity ? null : second;
}
console.log(secondLargest([5, 3, 9, 9, 7]));  // → 7
console.log(secondLargest([4, 4]));           // → null

// 4. Missing number in 1..n (one number missing)
function missingNumber(arr) {
  const n = arr.length + 1;
  const expected = (n * (n + 1)) / 2;
  return expected - arr.reduce((s, x) => s + x, 0);
}
console.log(missingNumber([1, 2, 4, 5, 6]));  // → 3`,
        },
      ],
      keyPoints: [
        'Clarify, example, brute force, optimise, test edge cases, state Big-O.',
        'Second largest: decide whether duplicates of the max count; say it out loud.',
        'Know a no-built-ins version of each problem: interviewers often forbid sort() or Set.',
      ],
      source: 'GeeksforGeeks — Array interview questions; softwaretestpilot.com — QA/SDET coding rounds',
    },
    {
      heading: 'Array interview problems, part 2: rotate, chunk, flatten, merge sorted, pair sum',
      body: `**Intuition:** the second wave of questions tests whether you can **move items around** (rotate, chunk), **walk two lists at once** (merge sorted, intersection) and **remember what you saw** (pair sum with a Set).

- **Rotate right by k:** take the last \`k\` items and put them in front. Always do \`k = k % n\` first, because rotating a 5-item array 7 times equals rotating it 2 times. Handle \`n === 0\`.
- **Chunk:** split into groups of size \`n\` with \`slice(i, i + n)\`, stepping \`i\` by \`n\`. The last chunk may be shorter. Real use: sending test data in batches of 10.
- **Flatten without flat():** recursion. If an item is an array, flatten it and spread the result; otherwise push it.
- **Merge two sorted arrays without sort():** the *two-pointer* technique. Compare the fronts, take the smaller, move that pointer, then append whatever is left. O(n + m), which beats concat-then-sort O((n+m) log(n+m)).
- **Pair sum / two-sum:** for each number, ask "have I seen \`target - n\` already?" with a Set. One pass, O(n).
- **Move zeros to the end** and **intersection of two arrays** are common follow-ups using the same ideas.

**In interviews say this:** "I'll first do it with built-ins for clarity, then show the manual version since you may want to see the logic, and I'll test it with an empty array, k larger than the length, and duplicates."`,
      code: [
        {
          language: 'javascript',
          title: 'Rotate, chunk, flatten, merge, pair sum',
          code: `function rotateRight(arr, k) {
  const n = arr.length;
  if (n === 0) return [];
  k = k % n;                                 // 7 on a 5-item array = 2
  if (k === 0) return [...arr];              // slice(-0) would be the whole array
  return [...arr.slice(-k), ...arr.slice(0, -k)];
}
console.log(rotateRight([1, 2, 3, 4, 5], 2)); // → [4, 5, 1, 2, 3]
console.log(rotateRight([1, 2, 3, 4, 5], 7)); // → [4, 5, 1, 2, 3]
console.log(rotateRight([1, 2, 3], 3));       // → [1, 2, 3]

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
console.log(chunk([1, 2, 3, 4, 5], 2));    // → [[1, 2], [3, 4], [5]]

function flatten(arr) {
  const out = [];
  for (const item of arr) Array.isArray(item) ? out.push(...flatten(item)) : out.push(item);
  return out;
}
console.log(flatten([1, [2, [3, [4]]], 5])); // → [1, 2, 3, 4, 5]

function mergeSorted(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  return [...out, ...a.slice(i), ...b.slice(j)];  // append leftovers
}
console.log(mergeSorted([1, 4, 9], [2, 3, 10, 11])); // → [1, 2, 3, 4, 9, 10, 11]

function hasPairWithSum(nums, target) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(target - n)) return [target - n, n];
    seen.add(n);
  }
  return null;
}
console.log(hasPairWithSum([8, 2, 11, 7], 9));     // → [2, 7]`,
        },
      ],
      keyPoints: [
        'Rotation: normalise k with k % n and handle the empty array.',
        'Two pointers merge sorted lists in O(n + m) without sort().',
        'A Set of "seen" values turns many O(n²) problems into O(n).',
      ],
      source: 'GeeksforGeeks — Rotate array, Merge two sorted arrays; javascript.info — Recursion',
    },
    {
      heading: 'Arrays in Playwright tests',
      body: `**Intuition:** a Playwright **locator** that matches many elements behaves like a "live list" on the page. Some methods give you a JavaScript array snapshot of that list, and some assertions compare the list against an array you expect.

| Need | Playwright API | Returns / does |
|---|---|---|
| All visible texts as strings | \`await locator.allTextContents()\` | \`string[]\` (textContent, includes hidden text) |
| All rendered texts | \`await locator.allInnerTexts()\` | \`string[]\` (innerText, as displayed) |
| Each match as its own locator | \`await locator.all()\` | \`Locator[]\` (loop with \`for...of\`) |
| How many matched | \`await expect(locator).toHaveCount(6)\` | web-first, retries |
| Exact list of texts, in order | \`await expect(locator).toHaveText(['A', 'B'])\` | web-first, retries |
| Partial texts, in order | \`await expect(locator).toContainText(['A', 'B'])\` | web-first, retries |

**Important:** \`allTextContents()\` and \`all()\` do **not** wait. If the list has not rendered yet they return \`[]\`, and \`[].every(...)\` passes. So either wait first (\`await expect(locator).toHaveCount(n)\` or \`toBeVisible\` on \`.first()\`), or use the array form of \`toHaveText\`, which retries until the list matches or the timeout (5 s by default) expires.

**Which to use when:**

- You know the exact expected list (product names after sorting A→Z): \`await expect(locator).toHaveText(expectedArray)\`.
- You must compute something (sorted order of prices, sum of line items equals the subtotal, no duplicate order IDs): snapshot with \`allTextContents()\` after a wait, then use \`map\`/\`reduce\`/\`Set\`.
- You must act on each item (add every item under $20 to the cart): \`for (const row of await locator.all())\` with \`await\` inside. Never \`forEach(async ...)\`.`,
      code: [
        {
          language: 'typescript',
          title: 'Cart subtotal equals the sum of item prices',
          code: `import { test, expect } from '@playwright/test';

test('checkout subtotal equals sum of line items', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // add every product cheaper than $20, acting on each match in turn
  const cards = page.locator('[data-test="inventory-item"]');
  await expect(cards).toHaveCount(6);
  for (const card of await cards.all()) {
    const priceText = await card.locator('[data-test="inventory-item-price"]').textContent();
    if (Number(priceText?.replace('$', '')) < 20) {
      await card.getByRole('button', { name: /add to cart/i }).click();
    }
  }

  await page.locator('[data-test="shopping-cart-link"]').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('First Name').fill('Asha');
  await page.getByPlaceholder('Last Name').fill('Rao');
  await page.getByPlaceholder('Zip/Postal Code').fill('560001');
  await page.getByRole('button', { name: 'Continue' }).click();

  const prices = (await page.locator('[data-test="inventory-item-price"]').allTextContents())
    .map((t) => Number(t.replace('$', '')));
  const sum = prices.reduce((s, p) => s + p, 0);

  expect(prices.length).toBeGreaterThan(0);  // guard: empty list would make sum 0
  await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $' + sum.toFixed(2));
});`,
        },
      ],
      keyPoints: [
        'allTextContents/all() take a snapshot and do not auto-wait; wait with toHaveCount first.',
        'toHaveText([...]) asserts the whole ordered list and retries.',
        'Act on each element with for...of over locator.all(), awaiting inside the loop.',
      ],
      source: 'Playwright docs — Locators (lists), LocatorAssertions toHaveText / toHaveCount',
    },
  ],
  codeChallenges: [
    {
      id: 'js-arrays-cc-1',
      title: 'The sort check that can never fail',
      context:
        'A teammate wrote a helper to verify the "Price (low to high)" option on an e-commerce site. It has passed on every run for months, even on the day the sort feature was completely broken in production.',
      task: 'Find every reason this check gives false confidence and fix `verifySortedLowToHigh` so it fails (throws) when the page is not sorted, without changing the data it was given. The tests call `runSortTest(texts)`, which behaves like a Playwright test calling your helper: it returns `\'PASS\'` unless the helper throws, and then `\'FAIL: \' + error.message`. Expected messages: `No prices found: did the page load?`, `Not a price: "<text>"` and `Not sorted. Got <JSON>, expected <JSON>`. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'priceSortCheck.js',
        code: `// texts come from: await page.locator('.inventory_item_price').allTextContents()
function verifySortedLowToHigh(texts) {
  const prices = texts.map(parseFloat);       // '$29.99' → ?
  const sorted = prices.sort();
  if (prices == sorted) {
    console.log('PASS: prices are sorted');
    return true;
  }
  console.log('FAIL: not sorted');
  return false;
}

// Entry point the tests call: like a Playwright test that calls the helper.
// The test fails only if the helper throws; a returned false is ignored.
function runSortTest(texts) {
  try {
    verifySortedLowToHigh(texts);
    return 'PASS';
  } catch (e) {
    return 'FAIL: ' + e.message;
  }
}

// runSortTest(['$29.99', '$9.99', '$100.00']) → 'PASS'
// runSortTest([])                              → 'PASS' (page never loaded)`,
      },
      hints: [
        'What does parseFloat return for a string that starts with "$"? Try it in Node.',
        'sort() mutates and returns the same array object. What are you really comparing?',
        'Even with a correct comparison, what should happen when the list is empty? And how does default sort order 100 vs 29.99?',
      ],
      solution: {
        language: 'javascript',
        title: 'priceSortCheck.js (fixed)',
        code: `function toPrice(text) {
  const n = Number(text.trim().replace(/[$,]/g, ''));   // '$1,299.00' → 1299
  if (Number.isNaN(n)) throw new Error('Not a price: "' + text + '"');
  return n;
}

function verifySortedLowToHigh(texts) {
  if (texts.length === 0) throw new Error('No prices found: did the page load?');
  const prices = texts.map(toPrice);
  const expected = [...prices].sort((a, b) => a - b);   // independent copy, numeric order
  const ok = prices.every((p, i) => p === expected[i]);
  if (!ok) {
    throw new Error('Not sorted. Got ' + JSON.stringify(prices) + ', expected ' + JSON.stringify(expected));
  }
  return true;
}

function runSortTest(texts) {
  try {
    verifySortedLowToHigh(texts);
    return 'PASS';
  } catch (e) {
    return 'FAIL: ' + e.message;
  }
}

// runSortTest(['$9.99', '$29.99', '$100.00']) → 'PASS'
// runSortTest(['$29.99', '$9.99'])
// → 'FAIL: Not sorted. Got [29.99,9.99], expected [9.99,29.99]'
// runSortTest([]) → 'FAIL: No prices found: did the page load?'

// In a Playwright test, the same idea is one assertion:
// expect(prices).toEqual([...prices].sort((a, b) => a - b));`,
      },
      explanation: `**Fixes, one per bug:**

1. **\`parseFloat('$29.99')\` is \`NaN\`.** It stops at the first character it cannot read, and \`$\` is first. Every price became \`NaN\`. Strip the currency (and thousands separators) and fail loudly on \`NaN\`.
2. **\`prices.sort()\` mutates and returns the same array**, so \`prices == sorted\` compared an array with itself: always \`true\`. Sort a **copy**: \`[...prices].sort(...)\` or \`toSorted\`.
3. **Default sort is a string sort.** Even with real numbers, \`[29.99, 9.99, 100].sort()\` gives \`[100, 29.99, 9.99]\`. Use \`(a, b) => a - b\`.
4. **\`==\` on arrays compares references**, never contents. Compare item by item (\`every\`) or use \`expect(...).toEqual(...)\`.
5. **Empty list passed.** A check that cannot fail on zero data is not a check. Guard the length (in Playwright, \`await expect(locator).toHaveCount(n)\` before reading).
6. **Returning true/false + console.log** is easy to ignore: \`runSortTest\` ignores the return value exactly like a test that writes \`verifySortedLowToHigh(texts);\` on its own line. Throw (or use \`expect\`) so the test actually fails, with a message that shows both lists.`,
      fnName: 'runSortTest',
      tests: [
        { args: [['$9.99', '$29.99', '$100.00']], expected: 'PASS' },
        { args: [['$29.99', '$9.99']], expected: 'FAIL: Not sorted. Got [29.99,9.99], expected [9.99,29.99]' },
        { args: [[]], expected: 'FAIL: No prices found: did the page load?' },
        { args: [['$100.00', '$29.99', '$9.99']], expected: 'FAIL: Not sorted. Got [100,29.99,9.99], expected [9.99,29.99,100]' },
        { args: [['$15.99', '$15.99', '$49.99']], expected: 'PASS' },
        { args: [['$1,299.00', '$99.00']], expected: 'FAIL: Not sorted. Got [1299,99], expected [99,1299]' },
        { args: [['$7.99', '$100.00', '$29.99']], expected: 'FAIL: Not sorted. Got [7.99,100,29.99], expected [7.99,29.99,100]', hidden: true },
        { args: [['$abc']], expected: 'FAIL: Not a price: "$abc"', hidden: true },
      ],
      followUps: [
        {
          q: 'Why not just use expect(locator).toHaveText([...]) instead of reading the prices?',
          a: 'If you know the exact expected list (for fixed demo data) the array form of toHaveText is better: it retries until the page matches, so it handles slow rendering. For dynamic catalogues you do not know the expected values in advance, so you read the texts, compute the sorted copy and compare. Many teams combine both: toHaveCount to wait, then the computed comparison.',
        },
        {
          q: 'How would you check descending order and ties?',
          a: 'Use the comparator (a, b) => b - a for the expected copy. Ties are fine because sort is stable and equal numbers compare equal, so a list like [15.99, 15.99] still matches. An alternative helper without copying is prices.every((p, i) => i === 0 || prices[i - 1] >= p), which reads as "each price is not bigger than the one before it".',
        },
      ],
    },
    {
      id: 'js-arrays-cc-2',
      title: 'Cleaning up a list of failed tests',
      context:
        'A reporting script receives test results from a run and should (a) drop all passed results, (b) produce a de-duplicated list of failing test titles and (c) count failures per spec file. The numbers in the Slack summary never match the HTML report.',
      task: 'Fix `summarise(results)` so it returns `{ titles, perFile }`: the de-duplicated titles of failed results in first-seen order, and the number of failed results per spec file (every failed attempt counts). Only `status: \'failed\'` counts as a failure, and the results array passed in must not be modified. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'summarise.js',
        code: `function summarise(results) {
  // (a) remove passed results
  for (let i = 0; i < results.length; i++) {
    if (results[i].status == 'passed') results.splice(i, 1);
  }
  // (b) unique failing titles
  const titles = [];
  results.forEach((r) => {
    if (!titles.includes(r)) titles.push(r.title);
  });
  // (c) failures per file
  const perFile = results.reduce((acc, r) => {
    acc[r.file] = acc[r.file] + 1;
  });
  return { titles, perFile };
}

// summarise([
//   { title: 'login ok', file: 'login.spec.ts', status: 'passed' },
//   { title: 'cart total', file: 'cart.spec.ts', status: 'passed' },
//   { title: 'pay by card', file: 'pay.spec.ts', status: 'failed' },
//   { title: 'pay by card', file: 'pay.spec.ts', status: 'failed' },  // retry
// ])
// → TypeError, and the array passed in has been modified`,
      },
      hints: [
        'Trace the splice loop by hand with two passed results next to each other.',
        'In (b), what is being compared with includes: a string or an object?',
        'In (c), what does the reducer return, and what is the starting accumulator?',
      ],
      solution: {
        language: 'javascript',
        title: 'summarise.js (fixed)',
        code: `function summarise(results) {
  // (a) filter builds a NEW array: no skipping, caller's data untouched
  const failed = results.filter((r) => r.status === 'failed');

  // (b) Set removes duplicate titles (e.g. retries), keeps first-seen order
  const titles = [...new Set(failed.map((r) => r.title))];

  // (c) reduce with an initial {} and a returned accumulator
  const perFile = failed.reduce((acc, r) => {
    acc[r.file] = (acc[r.file] ?? 0) + 1;
    return acc;
  }, {});

  return { titles, perFile };
}

// summarise(run) with the four results above
// → { titles: ['pay by card'], perFile: { 'pay.spec.ts': 2 } }
// run.length is still 4 (input not modified)`,
      },
      explanation: `**Fixes:**

1. **splice inside a forward loop skips items.** When index 0 is removed, the item at index 1 slides to index 0, but \`i\` moves on to 1, so the second "passed" result survives. It also **mutated the caller's array**. \`filter\` solves both. Also prefer \`===\` over \`==\` as a habit.
2. **\`titles.includes(r)\` compared an object with strings**, so it was never true and duplicates (retries) were kept. Map to titles first, then dedupe with a \`Set\`.
3. **The reducer had no \`return\`**, so the accumulator became \`undefined\` after the first call, and **no initial value** meant the first result object was used as the accumulator. \`undefined + 1\` is \`NaN\` and \`undefined[r.file]\` throws. Return \`acc\` and start from \`{}\`; use \`?? 0\` for the first count.
4. **Decide whether retries count.** Here failures per file counts every failed attempt (2) while titles are unique (1). Say which you want; a Playwright report counts a test once and marks it flaky if a retry passed.`,
      fnName: 'summarise',
      tests: [
        {
          args: [[{ title: 'login ok', file: 'login.spec.ts', status: 'passed' }, { title: 'cart total', file: 'cart.spec.ts', status: 'passed' }, { title: 'pay by card', file: 'pay.spec.ts', status: 'failed' }, { title: 'pay by card', file: 'pay.spec.ts', status: 'failed' }]],
          expected: { titles: ['pay by card'], perFile: { 'pay.spec.ts': 2 } },
        },
        { args: [[{ title: 'a', file: 'a.spec.ts', status: 'passed' }, { title: 'b', file: 'b.spec.ts', status: 'passed' }]], expected: { titles: [], perFile: {} } },
        { args: [[]], expected: { titles: [], perFile: {} } },
        { args: [[{ title: 'only', file: 'a.spec.ts', status: 'failed' }]], expected: { titles: ['only'], perFile: { 'a.spec.ts': 1 } } },
        {
          args: [[{ title: 'a', file: 'x.spec.ts', status: 'failed' }, { title: 'b', file: 'x.spec.ts', status: 'passed' }, { title: 'c', file: 'x.spec.ts', status: 'failed' }, { title: 'd', file: 'y.spec.ts', status: 'failed' }]],
          expected: { titles: ['a', 'c', 'd'], perFile: { 'x.spec.ts': 2, 'y.spec.ts': 1 } },
        },
        {
          args: [[{ title: 's', file: 's.spec.ts', status: 'skipped' }, { title: 'f', file: 'f.spec.ts', status: 'failed' }]],
          expected: { titles: ['f'], perFile: { 'f.spec.ts': 1 } },
          hidden: true,
        },
        {
          args: [[{ title: 'flaky', file: 'f.spec.ts', status: 'failed' }, { title: 'flaky', file: 'f.spec.ts', status: 'passed' }, { title: 'flaky', file: 'f.spec.ts', status: 'failed' }]],
          expected: { titles: ['flaky'], perFile: { 'f.spec.ts': 2 } },
          hidden: true,
        },
      ],
      followUps: [
        {
          q: 'How would you count a test once even if it failed on every retry?',
          a: 'Group by a stable key such as file + title. Build a Map keyed by that string, keep the last status for each key, then count the keys whose final status is failed. With Object.groupBy(failed, r => r.file + "::" + r.title) you can also see how many attempts each test made, which helps flag flaky tests.',
        },
        {
          q: 'If you must remove items in place (no new array), how do you avoid skipping?',
          a: 'Loop backwards: for (let i = arr.length - 1; i >= 0; i--) { if (shouldRemove(arr[i])) arr.splice(i, 1); }. Removing an item only shifts the items after it, which you have already visited, so nothing is skipped. Another option is a write-pointer that copies kept items forward and then sets arr.length at the end.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-arrays-iq-01',
      difficulty: 'easy',
      question: 'Find the second largest number in an array. Do it without sorting.',
      context:
        'One of the most frequently reported JavaScript warm-ups in QA and SDET coding rounds (listed in QA/SDET question banks such as softwaretestpilot.com and in test-engineer interview reports on AmbitionBox).',
      whatInterviewerLooksFor: [
        'Asks whether duplicates of the maximum count (is [9, 9, 7] → 9 or 7?)',
        'Handles edge cases: fewer than two distinct values, negatives, empty array',
        'Knows the simple sort-based answer and the O(n) single-pass answer',
        'Explains complexity and tests their own code aloud',
      ],
      modelAnswer: `**Clarify first:** "Should duplicates of the max count? For \`[5, 3, 9, 9, 7]\` I'll assume the answer is **7**, the second largest *distinct* value. For fewer than two distinct values I'll return \`null\`."

**Quick version (with built-ins):** dedupe, sort descending, take index 1. Clear, but O(n log n) and it allocates new arrays.

    const secondBySort = (a) => [...new Set(a)].sort((x, y) => y - x)[1] ?? null;

**Single pass, O(n) time, O(1) space:** keep two variables, \`first\` and \`second\`, both starting at \`-Infinity\` (not 0, or negative arrays break).

    function secondLargest(nums) {
      let first = -Infinity, second = -Infinity;
      for (const n of nums) {
        if (n > first) { second = first; first = n; }
        else if (n > second && n < first) { second = n; }
      }
      return second === -Infinity ? null : second;
    }

**Walk through \`[5, 3, 9, 9, 7]\`:** 5 → first=5; 3 → second=3; 9 → second=5, first=9; 9 → equal to first, skipped by \`n < first\`; 7 → second=7. Result **7**.

**Test it like a tester:**

| Input | Expected |
|---|---|
| \`[5, 3, 9, 9, 7]\` | 7 |
| \`[-4, -1, -9]\` | -4 |
| \`[4, 4]\` | null |
| \`[]\` | null |
| \`[1, 2]\` | 1 |

**Why it matters in QA:** the same "track the top values in one pass" idea is how you verify "the highlighted deal is the second cheapest" from a scraped price list.`,
      followUps: [
        {
          q: 'What if duplicates should count, so [9, 9, 7] returns 9?',
          a: 'Then drop the n < first condition: when n equals first, it should move into second. The rule becomes: if n > first, shift first into second; else if n > second, take it. With the sort approach, skip the Set and just sort descending and take index 1. Asking this question up front is exactly what the interviewer wants to see.',
        },
        {
          q: 'How would you find the k-th largest?',
          a: 'Simplest: dedupe, sort descending and take index k - 1, which is O(n log n) and fine for test data. For huge inputs you would keep a min-heap of size k (O(n log k)), but JavaScript has no built-in heap, so in a QA interview state that idea and implement the sort version unless asked otherwise.',
        },
        {
          q: 'Why start from -Infinity instead of 0 or arr[0]?',
          a: 'Starting from 0 gives a wrong answer for all-negative arrays: [-4, -1, -9] would return 0, which is not even in the array. Starting from arr[0] works for first but needs care for second when arr[0] is the maximum. -Infinity is smaller than any real number, so the first comparisons always replace it, and it doubles as a "not found" marker.',
        },
      ],
      pitfalls: [
        'Using arr.sort() without a comparator, which sorts as strings ([10, 9, 100] → 100 is "smallest").',
        'Returning sorted[length - 2] without removing duplicates, so [9, 9, 7] returns 9 unintentionally.',
        'Initialising to 0 and failing on negative numbers.',
        'Never mentioning empty or single-element input.',
      ],
    },
    {
      id: 'js-arrays-iq-02',
      difficulty: 'easy',
      question: 'Remove duplicates from an array. Show me more than one way, and tell me which you would use in a test.',
      whatInterviewerLooksFor: [
        'Knows the Set one-liner and why it works',
        'Can write a manual version (interviewers often say "no Set")',
        'Knows Set does not dedupe objects by content and how to dedupe by a key',
        'Talks about order preservation and complexity',
      ],
      modelAnswer: `**Three ways, from shortest to most manual:**

**1. Set (O(n), keeps first-seen order):**

    const unique1 = (arr) => [...new Set(arr)];
    unique1([3, 1, 3, 2, 1]); // → [3, 1, 2]

**2. filter + indexOf (O(n²), but short and no Set):** keep an item only if this is the first index where it appears.

    const unique2 = (arr) => arr.filter((x, i) => arr.indexOf(x) === i);

**3. Manual loop with a "seen" lookup (O(n)):**

    function unique3(arr) {
      const seen = {};
      const out = [];
      for (const x of arr) {
        if (!seen[x]) { seen[x] = true; out.push(x); }
      }
      return out;
    }

Careful: object keys are strings, so \`1\` and \`'1'\` collide in version 3. A \`Set\` or \`Map\` keeps the types apart.

**Objects (API data):** \`new Set([{id:1},{id:1}])\` keeps both, because objects are compared by reference. Dedupe by a key instead:

    const byId = (rows) => [...new Map(rows.map((r) => [r.id, r])).values()];

(This keeps the **last** row for each id.)

**In a test I'd use the Set**, usually as an assertion rather than a transformation: "every order ID in the table is unique" is \`expect(new Set(ids).size).toBe(ids.length)\`. If it fails, I'd compute the actual duplicates with a frequency map so the error message names them.`,
      followUps: [
        {
          q: 'How do you return only the values that ARE duplicated?',
          a: 'Use two Sets: seen and dupes. Loop; if seen has the value, add it to dupes, else add it to seen. Return [...dupes]. Alternatively, build a frequency map and keep keys with a count above 1. Both are O(n). The filter version arr.filter((x, i) => arr.indexOf(x) !== i) works too but repeats a value that appears three times.',
        },
        {
          q: 'Does your Set version handle NaN and -0?',
          a: 'Set uses SameValueZero, so all NaN values collapse into one and -0 equals +0. The indexOf version treats NaN differently: indexOf(NaN) is always -1, so NaN is dropped entirely by arr.filter((x, i) => arr.indexOf(x) === i). Mentioning this edge case shows you know includes/Set and indexOf use different equality.',
        },
      ],
      pitfalls: [
        'Only knowing the Set one-liner and freezing when asked for a manual version.',
        'Claiming Set removes duplicate objects with the same content.',
        'Using a nested loop without mentioning it is O(n²).',
      ],
    },
    {
      id: 'js-arrays-iq-03',
      difficulty: 'medium',
      question: 'An array contains the numbers 1 to n with exactly one number missing. Find the missing number.',
      whatInterviewerLooksFor: [
        'Confirms the assumptions: unsorted? exactly one missing? no duplicates?',
        'Uses the sum formula n(n+1)/2 and computes n correctly (length + 1)',
        'Offers an alternative (Set, sort-and-scan, or XOR) and compares them',
        'Extends to "several numbers missing"',
      ],
      modelAnswer: `**Clarify:** "The array is unsorted, has no duplicates, and exactly one number from 1..n is missing, so its length is n - 1."

**Sum formula, O(n) time, O(1) space:** the sum of 1..n is \`n * (n + 1) / 2\`. Subtract the actual sum and what remains is the missing number.

    function missingNumber(arr) {
      const n = arr.length + 1;                 // one number is missing
      const expected = (n * (n + 1)) / 2;
      const actual = arr.reduce((s, x) => s + x, 0);
      return expected - actual;
    }
    missingNumber([3, 7, 1, 2, 8, 4, 5]);  // → 6

Walk-through: length 7 so n = 8; expected = 36; actual = 30; missing **6**.

**Alternative with a Set (clearer, O(n) extra space):**

    function missingWithSet(arr) {
      const have = new Set(arr);
      for (let i = 1; i <= arr.length + 1; i++) if (!have.has(i)) return i;
    }

**Alternative with XOR** (no overflow risk in languages with fixed-size integers): XOR all numbers 1..n with all array items; pairs cancel and the missing one remains.

**Edge cases:** missing the first number (\`[2, 3]\` → 1), missing the last (\`[1, 2]\` → 3), and the empty array (\`[]\` → 1).

**Multiple missing numbers:** the formula no longer works; use the Set loop and collect every \`i\` that is absent. That version is the one I'd actually use in QA, e.g. "invoice numbers 1001 to 1050 should all appear in the export: which are missing?"`,
      followUps: [
        {
          q: 'What if the range starts at 1001 instead of 1?',
          a: 'Use the general arithmetic series: sum of a..b is (a + b) * (b - a + 1) / 2. With one missing, b = a + arr.length. Or use the Set approach looping from the min to the max you expect. In a QA export check (invoice IDs 1001 to 1050) the Set approach is better because it lists every gap, not just one.',
        },
        {
          q: 'How would you find the duplicate if one number appears twice instead?',
          a: 'Walk the array with a Set: the first value already in the Set is the duplicate, O(n). If exactly one value is duplicated and one is missing, you can combine the sum difference with a Set, or use a frequency map and look for the key with count 2 and the number with count 0.',
        },
      ],
      pitfalls: [
        'Using n = arr.length, which is off by one.',
        'Sorting first and scanning (works, but O(n log n) and mutates the input unless copied).',
        'Not asking whether the input can contain duplicates.',
      ],
    },
    {
      id: 'js-arrays-iq-04',
      difficulty: 'medium',
      question: 'Rotate an array to the right by k positions. Then do it without slice or spread.',
      whatInterviewerLooksFor: [
        'Normalises k with k % n and handles n === 0',
        'Clear built-in solution, then an in-place or manual solution',
        'States whether the input is mutated',
        'Tests with k = 0, k = n, k > n',
      ],
      modelAnswer: `**Understand:** right by 2 means \`[1, 2, 3, 4, 5]\` → \`[4, 5, 1, 2, 3]\`: the last two items wrap to the front.

**Step 1, always:** \`k = k % n\`. Rotating 5 items by 7 is the same as by 2, and by 5 is no change. Guard \`n === 0\` to avoid \`% 0\` (\`NaN\`).

**Built-in version (new array):**

    function rotateRight(arr, k) {
      const n = arr.length;
      if (n === 0) return [];
      k = k % n;
      if (k === 0) return [...arr];
      return [...arr.slice(-k), ...arr.slice(0, -k)];
    }

Watch out: \`arr.slice(-0)\` is the whole array, which is why the \`k === 0\` guard exists.

**Manual version (index arithmetic):** the item at index \`i\` moves to \`(i + k) % n\`.

    function rotateManual(arr, k) {
      const n = arr.length;
      const out = new Array(n);
      for (let i = 0; i < n; i++) out[(i + k) % n] = arr[i];
      return out;
    }

**In-place, O(1) extra space (the classic "three reversals"):** reverse the whole array, then reverse the first k items, then reverse the rest. \`[1,2,3,4,5]\` → \`[5,4,3,2,1]\` → \`[4,5,3,2,1]\` → \`[4,5,1,2,3]\`.

**Tests I would run:** k = 0, k = 2, k = n, k = n + 2, empty array, single item, and left rotation (which is right rotation by \`n - k\`).

Complexity: O(n) time for all three; O(n) extra space for the first two, O(1) for the reversal trick.`,
      followUps: [
        {
          q: 'How do you rotate left instead?',
          a: 'Left by k is the same as right by n - k (after normalising k). With slices: [...arr.slice(k), ...arr.slice(0, k)]. With index arithmetic: out[i] = arr[(i + k) % n]. A carousel test ("click next 3 times, the 4th slide is shown") is essentially a left rotation, so this maps nicely to UI testing.',
        },
        {
          q: 'What about a negative k?',
          a: 'Decide on a rule and say it: a negative k could mean rotate left. JavaScript % keeps the sign of the dividend, so -1 % 5 is -1, not 4. Normalise with ((k % n) + n) % n to always get a value between 0 and n - 1, then rotate right by that amount.',
        },
      ],
      pitfalls: [
        'Forgetting k % n, so k larger than the length produces wrong or empty results.',
        'Using arr.pop() + unshift() k times on a big array without mentioning it is O(n·k).',
        'Mutating the caller\'s array without saying so.',
      ],
    },
    {
      id: 'js-arrays-iq-05',
      difficulty: 'medium',
      question: 'Count how many times each element appears in an array, then return the most frequent one and the first non-repeating one.',
      whatInterviewerLooksFor: [
        'Builds a frequency map with an object or Map in one pass',
        'Knows the difference between object keys (strings) and Map keys',
        'Handles ties and "nothing found"',
        'Connects to real QA use: counting statuses, flaky failures, duplicate IDs',
      ],
      modelAnswer: `**Frequency map: one pass, O(n).**

    function frequencies(arr) {
      const counts = new Map();
      for (const x of arr) counts.set(x, (counts.get(x) ?? 0) + 1);
      return counts;
    }
    const statuses = ['pass', 'fail', 'pass', 'skip', 'pass', 'fail'];
    frequencies(statuses); // → Map { 'pass' => 3, 'fail' => 2, 'skip' => 1 }

**Most frequent:** walk the map once and keep the best.

    function mostFrequent(arr) {
      let best = null, bestCount = 0;
      for (const [value, count] of frequencies(arr)) {
        if (count > bestCount) { best = value; bestCount = count; }
      }
      return best;          // ties: the first one seen wins
    }

**First non-repeating:** a Map remembers insertion order, so the first key with count 1 is the answer.

    function firstUnique(arr) {
      for (const [value, count] of frequencies(arr)) if (count === 1) return value;
      return null;
    }
    firstUnique(statuses); // → 'skip'

**Object vs Map:** \`counts[x] = (counts[x] ?? 0) + 1\` works and prints nicely, but keys become strings (\`1\` and \`'1'\` merge) and integer-like keys are reordered ascending, which breaks "first non-repeating" for numbers. A \`Map\` keeps type and insertion order.

**Real QA uses:** summarise a run (passed/failed/flaky counts), find which error message appears most in logs, or assert "each SKU appears exactly once in the cart" (every count === 1).`,
      followUps: [
        {
          q: 'How would you do this for characters in a string (first non-repeating character)?',
          a: 'Same algorithm: for (const ch of str) build the Map, then loop over the Map (insertion order) and return the first key with count 1. for...of over a string walks characters correctly, including emoji, which index-based loops can split. Lower-case the string first if the comparison should ignore case, and decide whether spaces count.',
        },
        {
          q: 'How would you return all values that tie for the highest count?',
          a: 'First pass computes the max count (Math.max(...counts.values())). Second pass filters the entries whose count equals that max: [...counts].filter(([, c]) => c === max).map(([v]) => v). Two passes are still O(n). Stating your tie-breaking rule before coding is a strong signal.',
        },
      ],
      pitfalls: [
        'Nested loops counting each element separately (O(n²)).',
        'Using a plain object for numeric keys and being surprised by the order.',
        'Forgetting to handle the "no unique element" case.',
      ],
    },
    {
      id: 'js-arrays-iq-06',
      difficulty: 'medium',
      question: 'Merge two sorted arrays into one sorted array without using sort().',
      whatInterviewerLooksFor: [
        'Two-pointer technique with correct leftover handling',
        'Understands why concat + sort is slower (O((n+m) log(n+m)))',
        'Handles empty inputs and duplicates across both arrays',
        'Clean, readable loop conditions',
      ],
      modelAnswer: `**Idea:** both lists are already sorted, so the smallest remaining item is always at the **front** of one of them. Compare the two fronts, take the smaller, advance that pointer. When one list runs out, append the rest of the other.

    function mergeSorted(a, b) {
      const out = [];
      let i = 0, j = 0;
      while (i < a.length && j < b.length) {
        if (a[i] <= b[j]) out.push(a[i++]);
        else out.push(b[j++]);
      }
      while (i < a.length) out.push(a[i++]);   // leftovers of a
      while (j < b.length) out.push(b[j++]);   // leftovers of b
      return out;
    }
    mergeSorted([1, 4, 9], [2, 3, 10, 11]); // → [1, 2, 3, 4, 9, 10, 11]

**Trace:** 1 vs 2 → 1; 4 vs 2 → 2; 4 vs 3 → 3; 4 vs 10 → 4; 9 vs 10 → 9; \`a\` is empty → append 10, 11.

**Complexity:** O(n + m) time, O(n + m) space for the output. The shortcut \`[...a, ...b].sort((x, y) => x - y)\` is correct but O((n+m) log(n+m)) and ignores the fact that the inputs are sorted, which is the whole point of the question.

**Edge cases:** one or both empty; duplicates (\`<=\` keeps items from \`a\` first, which keeps the merge stable); negative numbers; very different lengths.

**Follow-up I'd volunteer:** to merge **without duplicates**, skip pushing a value equal to the last pushed one. To merge **descending** inputs, flip the comparison.

**QA link:** merging two already-sorted result pages (page 1 and page 2 of a "sorted by date" API) and asserting the combined list is still sorted is a real pagination test.`,
      followUps: [
        {
          q: 'How would you merge k sorted arrays?',
          a: 'Simplest: merge them pairwise (merge 1 with 2, then the result with 3, and so on), which is easy to explain. Better: merge in pairs like a tournament (1+2, 3+4, then the results), giving O(N log k) total. The optimal general approach uses a min-heap of the k front items, but for interview test data the pairwise reduce, arrays.reduce(mergeSorted, []), is perfectly acceptable to present.',
        },
        {
          q: 'How would you test that your merge function is correct?',
          a: 'Write example tests (empty + empty, empty + list, interleaved, all of a smaller than b, duplicates across arrays) and a property-style check: for random sorted inputs, the output length equals a.length + b.length, the output is sorted (every item >= previous), and it equals [...a, ...b].sort((x, y) => x - y). The slow built-in version becomes a reliable oracle.',
        },
      ],
      pitfalls: [
        'Forgetting the leftover items when one array runs out.',
        'Using concat + sort() without a comparator (string sort bug).',
        'Off-by-one loop conditions using <= length.',
      ],
    },
    {
      id: 'js-arrays-iq-07',
      difficulty: 'easy',
      question: 'Split an array into chunks of size n, and flatten a nested array without using flat().',
      whatInterviewerLooksFor: [
        'Chunk: correct loop step and slice bounds, shorter last chunk',
        'Flatten: recursion or an explicit stack, with Array.isArray',
        'Validates input (size <= 0) and mentions depth limits',
        'Relates chunking to batching test data or API calls',
      ],
      modelAnswer: `**Chunk:** step through the array \`size\` items at a time and slice each window. \`slice\` happily stops at the end, so the last chunk is just shorter.

    function chunk(arr, size) {
      if (size <= 0) throw new Error('size must be > 0');  // avoid an infinite loop
      const out = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    }
    chunk([1, 2, 3, 4, 5], 2); // → [[1, 2], [3, 4], [5]]

With built-ins only: \`Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))\`.

**Flatten (any depth) with recursion:**

    function flatten(arr) {
      const out = [];
      for (const item of arr) {
        if (Array.isArray(item)) out.push(...flatten(item));
        else out.push(item);
      }
      return out;
    }
    flatten([1, [2, [3, [4]]], 5]); // → [1, 2, 3, 4, 5]

The same thing as a one-liner: \`arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flatten(x) : x), [])\`. The built-in equivalent is \`arr.flat(Infinity)\`.

**Without recursion** (for very deep nesting, to avoid a stack overflow): keep a stack, pop items, push back array contents, and reverse at the end.

**Where testers use these:** chunking 500 generated users into batches of 50 API calls so you do not hit a rate limit; flattening table rows (\`[[cell, cell], [cell, cell]]\`) into one list of cell values before asserting none is empty.`,
      followUps: [
        {
          q: 'How would you flatten only to a given depth, like flat(2)?',
          a: 'Pass a depth parameter and decrease it on each recursive call: if Array.isArray(item) && depth > 0, push ...flatten(item, depth - 1), otherwise push item as is. With depth 1 you get exactly flat(). This shows you understand the built-in rather than just calling it.',
        },
        {
          q: 'Why use Array.isArray instead of typeof item === "object"?',
          a: 'typeof returns "object" for arrays, plain objects and null alike, so objects would be wrongly "flattened" and null would crash when spread. Array.isArray is true only for real arrays, which is exactly the condition for flattening.',
        },
      ],
      pitfalls: [
        'Looping with i++ and slicing (i, i + size), which produces overlapping chunks.',
        'Not handling size 0 (infinite loop).',
        'Flattening with toString().split(","), which turns numbers into strings and breaks on strings with commas.',
      ],
    },
    {
      id: 'js-arrays-iq-08',
      difficulty: 'hard',
      question: 'In Playwright, how would you verify that a product listing is sorted by price after the user picks "Price (low to high)"? Walk me through the code and the ways such a test can pass falsely.',
      whatInterviewerLooksFor: [
        'Reads texts with allTextContents, converts to numbers, compares with a sorted copy',
        'Knows allTextContents does not auto-wait and guards against an empty list',
        'Spots the sort-mutation false pass and the string-sort bug',
        'Mentions web-first alternatives (toHaveText with an array) and the trade-off',
      ],
      modelAnswer: `**The test (SauceDemo):**

1. Log in, then select the option: \`await page.locator('[data-test="product-sort-container"]').selectOption('lohi')\`.
2. Wait for the list and guard against "zero items": \`await expect(prices).toHaveCount(6)\` (or at least \`toBeVisible\` on \`.first()\`).
3. Snapshot: \`const texts = await prices.allTextContents()\`.
4. Convert: \`const values = texts.map((t) => Number(t.replace('$', '')))\`.
5. Compare with an independent copy: \`expect(values).toEqual([...values].sort((a, b) => a - b))\`.

**Ways it passes falsely, and the fix for each:**

| False pass | Why | Fix |
|---|---|---|
| \`expect(values).toEqual(values.sort(...))\` | sort mutates and returns the same array | sort a copy |
| \`.sort()\` with no comparator | string order: "100" before "25" | \`(a, b) => a - b\` |
| \`parseFloat('$9.99')\` | NaN; NaN arrays still "equal" | strip \`$\`, assert no NaN |
| reading before render | \`allTextContents()\` returns \`[]\` immediately; empty equals empty | \`toHaveCount\` first |
| missing \`await\` on an assertion | test ends before it runs | await every \`expect(locator)\` |
| reading before the re-sort | the old order is captured | wait for a known first item, e.g. \`toHaveText\` on \`.first()\` |

**The last row deserves attention:** after \`selectOption\` the page may re-render asynchronously. If the original order already happens to be sorted, or you read too early, you test the wrong list. A robust trick is to assert the expected first and last items with web-first assertions, then do the computed check.

**Alternative when the data is fixed:** \`await expect(prices).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99'])\` retries until the list matches. I prefer the computed check for dynamic catalogues and the literal list for fixed demo data.`,
      followUps: [
        {
          q: 'How would you verify sorting by name Z to A?',
          a: 'Read the names with allTextContents on the item-name locator, then compare with [...names].sort((a, b) => b.localeCompare(a)). localeCompare matters because default sort puts all uppercase before lowercase, and product names may differ in case or contain accents. Trim whitespace first, since textContent can include padding.',
        },
        {
          q: 'The list is paginated, 20 per page. How do you check global order?',
          a: 'Collect page by page into one array (concat after each page, awaiting navigation), then run the same sorted-copy comparison on the combined list; also check the boundary: last item of page 1 <= first item of page 2. Often it is faster and more reliable to check sort order at the API level with the request fixture and keep one UI test for the first page.',
        },
      ],
      pitfalls: [
        'Comparing the array with arr.sort() of itself.',
        'Using allTextContents without waiting, then "passing" on an empty array.',
        'Using waitForTimeout(3000) instead of a web-first wait.',
        'Sorting numbers without a comparator.',
      ],
    },
    {
      id: 'js-arrays-iq-09',
      difficulty: 'hard',
      question: 'Given an array of numbers and a target, return the pair that adds up to the target. Start with brute force, then optimise.',
      context: 'A common "two-sum" style warm-up in SDET coding rounds; interviewers use it to see whether you can improve an O(n²) solution.',
      whatInterviewerLooksFor: [
        'Starts with a correct nested-loop solution and states O(n²)',
        'Optimises with a Set/Map of seen values to O(n)',
        'Clarifies: indexes or values? duplicates? multiple pairs?',
        'Mentions the sorted-array two-pointer variant',
      ],
      modelAnswer: `**Clarify:** "Return the values or the indexes? If several pairs exist, any one? Can the same element be used twice?" I'll return the first pair of **indexes**, using two different elements.

**Brute force, O(n²):** check every pair.

    function pairBrute(nums, target) {
      for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
          if (nums[i] + nums[j] === target) return [i, j];
      return null;
    }

**Optimised, O(n) with a Map of value → index:** for each number, the partner we need is \`target - n\`. If we have already seen it, we are done; otherwise remember this number.

    function pairFast(nums, target) {
      const seen = new Map();
      for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
      }
      return null;
    }
    pairFast([8, 2, 11, 7], 9);  // → [1, 3]

Checking \`seen\` **before** adding the current number is what stops an element pairing with itself (\`[5]\`, target 10 → null).

**If the array is sorted:** two pointers from both ends; if the sum is too small move left up, if too big move right down. O(n) and O(1) space.

**Tests:** no pair, negatives, duplicates (\`[3, 3]\`, target 6 → \`[0, 1]\`), pair at the very end, empty array.`,
      followUps: [
        {
          q: 'How would you return ALL unique pairs?',
          a: 'Keep the seen Set, and when a partner exists add the pair to a result Set using a normalised key such as Math.min(a, b) + ":" + Math.max(a, b), so [2, 7] and [7, 2] are not counted twice. Convert the keys back to number pairs at the end. Still O(n) time with O(n) extra space.',
        },
        {
          q: 'Why is includes() inside the loop not a real optimisation?',
          a: 'nums.includes(target - n) scans the array each time, so the loop is still O(n²) in disguise; it also lets an element match itself. A Set or Map lookup is O(1) on average, which is what turns the whole solution into O(n). Explaining hidden loops inside built-ins is a strong signal in interviews.',
        },
      ],
      pitfalls: [
        'Letting an element pair with itself.',
        'Using includes or indexOf inside the loop and calling it O(n).',
        'Not asking whether indexes or values are wanted.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-arrays-drill-1',
      question:
        'Trace this reduce step by step and give the final value: `[\'pass\', \'fail\', \'pass\', \'skip\'].reduce((acc, s) => { acc[s] = (acc[s] ?? 0) + 1; return acc; }, {})`',
      assumptions: [
        'The initial accumulator is an empty object {}.',
        'acc[s] ?? 0 gives 0 the first time a key is seen.',
        'Object keys print in insertion order (for non-numeric keys).',
      ],
      steps: [
        { label: 'Start', calc: 'acc = {}' },
        { label: 'Item 1: "pass"', calc: 'acc.pass = (undefined ?? 0) + 1 = 1 → { pass: 1 }' },
        { label: 'Item 2: "fail"', calc: 'acc.fail = 0 + 1 = 1 → { pass: 1, fail: 1 }' },
        { label: 'Item 3: "pass"', calc: 'acc.pass = 1 + 1 = 2 → { pass: 2, fail: 1 }' },
        { label: 'Item 4: "skip"', calc: 'acc.skip = 0 + 1 = 1 → { pass: 2, fail: 1, skip: 1 }' },
        { label: 'Return', calc: 'reduce returns the final accumulator' },
      ],
      answer: '`{ pass: 2, fail: 1, skip: 1 }`. If the `return acc` line were removed, the second call would receive `undefined` and `undefined["fail"]` would throw a TypeError. If `{}` were removed, the first item, the string "pass", would become the accumulator, and in strict mode (every ES module, so every Playwright test file) `acc["fail"] = 1` throws `TypeError: Cannot create property \'fail\' on string \'pass\'`.',
      insight: 'Every reduce is just "accumulator in, accumulator out". Writing the accumulator after each item, as a table, is the fastest way to debug any reduce in an interview or a test helper.',
      followUps: [
        {
          q: 'How would you write the same thing without reduce?',
          a: 'const acc = {}; for (const s of statuses) acc[s] = (acc[s] ?? 0) + 1;. Many reviewers find the for...of version easier to read, and it is fine to say so in an interview. reduce shines when the result feeds a chain (map → filter → reduce) or when you want a single expression.',
        },
      ],
    },
    {
      id: 'js-arrays-drill-2',
      question:
        'Predict each logged value: `const a = [10, 9, 1, 100]; const b = a; const c = a.sort(); const d = [...a].sort((x, y) => y - x); b.push(5); console.log(a, c, d, a === c, a.length);`',
      assumptions: [
        'Default sort compares values as strings.',
        'Assignment copies the reference; spread copies the items.',
        'sort returns the same array it sorted.',
      ],
      steps: [
        { label: 'b = a', calc: 'a and b are the same array object' },
        { label: 'c = a.sort()', calc: 'string order "1" < "10" < "100" < "9" → a becomes [1, 10, 100, 9]; c is the same object as a' },
        { label: 'd = [...a].sort(desc)', calc: 'copy of [1, 10, 100, 9] sorted numerically descending → [100, 10, 9, 1]; a untouched' },
        { label: 'b.push(5)', calc: 'pushes into the shared array → a (and b and c) = [1, 10, 100, 9, 5]' },
        { label: 'a === c', calc: 'same reference → true' },
        { label: 'a.length', calc: '5' },
      ],
      answer: '`[1, 10, 100, 9, 5]  [1, 10, 100, 9, 5]  [100, 10, 9, 1]  true  5`',
      insight: 'Three names (a, b, c) all pointed at one array, and two "innocent" operations (sort and push through an alias) changed it. Only the spread copy (d) was independent. In test code this is how one helper silently corrupts shared test data.',
      followUps: [
        {
          q: 'What changes if you replace a.sort() with a.toSorted()?',
          a: 'toSorted returns a new sorted array and leaves a alone. So c becomes [1, 10, 100, 9] (still string order, because there is no comparator), a stays [10, 9, 1, 100] until the push, a === c is false, and after b.push(5) a is [10, 9, 1, 100, 5]. d is computed from the unsorted a: [100, 10, 9, 1].',
        },
      ],
    },
    {
      id: 'js-arrays-drill-3',
      question:
        'Trace the loop and predict the final array: `const ids = [\'a\', \'x\', \'x\', \'b\', \'x\']; for (let i = 0; i < ids.length; i++) { if (ids[i] === \'x\') ids.splice(i, 1); } console.log(ids);`',
      assumptions: [
        'splice(i, 1) removes one item at index i and shifts later items left.',
        'The loop condition re-reads ids.length on every iteration.',
      ],
      steps: [
        { label: 'i = 0', calc: '"a" → keep. ids = [a, x, x, b, x]' },
        { label: 'i = 1', calc: '"x" → splice → ids = [a, x, b, x] (second x slid into index 1)' },
        { label: 'i = 2', calc: '"b" → keep (the x now at index 1 was skipped!)' },
        { label: 'i = 3', calc: '"x" → splice → ids = [a, x, b]' },
        { label: 'i = 4', calc: '4 < 3 is false → loop ends' },
      ],
      answer: '`[\'a\', \'x\', \'b\']`: one "x" survives because it slid into the index the loop had just processed.',
      insight: 'Removing while iterating forward skips the element after every removal. Use filter (new array), or loop backwards when you must mutate in place.',
      followUps: [
        {
          q: 'Fix it three different ways.',
          a: '1) ids = ids.filter((id) => id !== "x") (requires let, or assign to a new const). 2) Loop backwards: for (let i = ids.length - 1; i >= 0; i--) if (ids[i] === "x") ids.splice(i, 1). 3) Decrement after removing: if (ids[i] === "x") { ids.splice(i, 1); i--; }. The filter version is the clearest and does not mutate shared data.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-arrays-mcq-01',
      difficulty: 'easy',
      question: 'A tester sorts a list of response times with sort() and no comparator. What does this log?',
      code: { language: 'javascript', code: `console.log([10, 9, 1, 100, 25].sort());` },
      options: ['[1, 9, 10, 25, 100]', '[1, 10, 100, 25, 9]', '[100, 25, 10, 9, 1]', '[9, 10, 25, 100, 1]'],
      correct: [1],
      explanation:
        'Without a comparator, sort converts each value to a string and compares character codes, so "100" comes before "25" and "9" comes last. [1, 9, 10, 25, 100] is what you get with (a, b) => a - b, which is why that comparator is required for numbers. The descending option would need b - a.',
      followUps: [
        { q: 'Why did JavaScript choose string comparison as the default?', a: 'Arrays can hold mixed types, and every value can be converted to a string, so string comparison is the only order that works for anything. It is predictable but rarely what you want for numbers, so always pass a comparator for numeric data.' },
      ],
    },
    {
      id: 'js-arrays-mcq-02',
      difficulty: 'easy',
      question: 'Which methods change (mutate) the original array? Select ALL that apply.',
      options: ['splice', 'slice', 'sort', 'map', 'push'],
      correct: [0, 2, 4],
      explanation:
        'splice removes/inserts in place, sort reorders in place, and push appends in place. slice returns a copy of a range and map returns a new transformed array, leaving the original untouched. The slice/splice pair is a classic trap because the names differ by one letter.',
      followUps: [
        { q: 'Name the non-mutating version of sort and of splice.', a: 'toSorted and toSpliced (ES2023, available in Node 20+ and modern browsers). Before those existed, the idiom was to copy first with [...arr] or arr.slice() and then call sort or splice on the copy.' },
      ],
    },
    {
      id: 'js-arrays-mcq-03',
      difficulty: 'easy',
      question: 'You need the FIRST user object whose `locked` property is true. Which method fits best?',
      options: ['users.filter((u) => u.locked)', 'users.find((u) => u.locked)', 'users.some((u) => u.locked)', 'users.includes({ locked: true })'],
      correct: [1],
      explanation:
        'find returns the first matching element (or undefined) and stops searching early. filter returns an array of all matches, so you would still need [0]. some returns only a boolean. includes compares by reference, so a new object literal is never found.',
      followUps: [
        { q: 'What does find return when nothing matches, and how should a test handle it?', a: 'undefined. Accessing .name on it throws a TypeError that hides the real problem, so assert it exists first (expect(user).toBeDefined()) or throw a clear error such as "No locked user in fixture data".' },
      ],
    },
    {
      id: 'js-arrays-mcq-04',
      difficulty: 'medium',
      question: 'A helper converts scraped quantity strings with map(parseInt). What is the resulting array?',
      code: { language: 'javascript', code: `console.log(['1', '2', '3'].map(parseInt));` },
      options: ['[1, 2, 3]', "['1', '2', '3']", '[1, NaN, NaN]', '[NaN, NaN, NaN]'],
      correct: [2],
      explanation:
        'map passes (value, index, array). parseInt treats the index as the radix: parseInt("1", 0) is 1 (radix 0 means "default"), parseInt("2", 1) is NaN (radix 1 is invalid), and parseInt("3", 2) is NaN (3 is not a binary digit). Use map(Number) or map((s) => parseInt(s, 10)).',
      followUps: [
        { q: 'Which is safer for price strings like "$9.99": Number, parseInt or parseFloat?', a: 'None directly: all return NaN because "$" comes first. Strip the currency first (text.replace("$", "")), then use Number, which rejects trailing junk (Number("9.99abc") is NaN) instead of silently ignoring it like parseFloat does. Then assert the result is not NaN.' },
      ],
    },
    {
      id: 'js-arrays-mcq-05',
      difficulty: 'medium',
      question: 'A test reads prices from the page and asserts `prices.every((p) => p > 0)`. The page was still loading and `allTextContents()` returned `[]`. What happens?',
      options: [
        'every throws because the array is empty',
        'every returns true, so the assertion passes falsely',
        'every returns false, so the test fails correctly',
        'Playwright retries allTextContents until items appear',
      ],
      correct: [1],
      explanation:
        'every on an empty array is vacuously true: there is no element that breaks the rule. allTextContents does not auto-wait, so it happily returns [] if the list has not rendered. Guard with await expect(locator).toHaveCount(n) or check prices.length > 0 first. Only web-first assertions retry; snapshot methods do not.',
      followUps: [
        { q: 'What does [].some(...) return?', a: 'false: there is no element that satisfies the condition. So some fails safely on empty data, while every passes dangerously. That asymmetry is worth remembering whenever you write assertions over scraped lists.' },
      ],
    },
    {
      id: 'js-arrays-mcq-06',
      difficulty: 'medium',
      question: 'What is logged?',
      code: {
        language: 'javascript',
        code: `const a = [3, 1, 2];
const b = a;
b.push(4);
const c = [...a];
c.pop();
console.log(a.length, b.length, c.length);`,
      },
      options: ['3 4 3', '4 4 3', '4 4 4', '3 4 2'],
      correct: [1],
      explanation:
        'b = a copies the reference, so pushing through b changes the one shared array: a and b both have length 4. c is a spread copy, so popping from c (4 → 3 items) does not affect a. "3 4 3" assumes assignment creates a copy, which is the misconception this question targets.',
      followUps: [
        { q: 'Does spread make a deep copy of an array of objects?', a: 'No, it is shallow: the new array holds the same object references, so editing c[0].name would also change a[0].name. Use structuredClone(a) for a deep copy of plain data.' },
      ],
    },
    {
      id: 'js-arrays-mcq-07',
      difficulty: 'medium',
      question: 'Which expressions return `[1, 2, 3]` from `[1, 2, 2, 3, 1]` (in that order)? Select ALL that apply.',
      options: [
        '[...new Set([1, 2, 2, 3, 1])]',
        '[1, 2, 2, 3, 1].filter((x, i, arr) => arr.indexOf(x) === i)',
        '[1, 2, 2, 3, 1].sort()',
        'Array.from(new Set([1, 2, 2, 3, 1]))',
        '[1, 2, 2, 3, 1].flat()',
      ],
      correct: [0, 1, 3],
      explanation:
        'A Set keeps the first occurrence of each value in insertion order, and both spread and Array.from turn it back into an array. The filter/indexOf version keeps an item only at its first index. sort() reorders but keeps duplicates ([1, 1, 2, 2, 3]), and flat() only removes nesting.',
      followUps: [
        { q: 'Which of these is O(n²) and why?', a: 'The filter + indexOf version: for every item, indexOf scans from the start, so n items × up to n comparisons. The Set versions are O(n) on average because Set insertion and lookup are constant time.' },
      ],
    },
    {
      id: 'js-arrays-mcq-08',
      difficulty: 'medium',
      question: 'What is the value of `total`?',
      code: {
        language: 'javascript',
        code: `const items = [{ price: 10 }, { price: 20 }, { price: 5 }];
const total = items.reduce((sum, item) => sum + item.price);`,
      },
      options: ['35', '"[object Object]205"', 'NaN', 'TypeError: Reduce of empty array'],
      correct: [1],
      explanation:
        'With no initial value, the first ITEM ({ price: 10 }) becomes the accumulator. Object + 20 converts the object to the string "[object Object]", then string concatenation gives "[object Object]20", then "[object Object]205". Passing 0 as the initial value gives 35. The TypeError only happens on an empty array.',
      followUps: [
        { q: 'How do you make it safe for an empty cart too?', a: 'Give the initial value: items.reduce((sum, i) => sum + i.price, 0) returns 0 for an empty array instead of throwing. Then decide whether an empty cart is itself a failure in your test and assert the count separately.' },
      ],
    },
    {
      id: 'js-arrays-mcq-09',
      difficulty: 'medium',
      question: 'Your helper must check that `names` (scraped from the page) is in A→Z order without changing `names`. Which is correct?',
      options: [
        'expect(names).toEqual(names.sort())',
        'expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))',
        'expect(names.sort()).toBeTruthy()',
        'expect(names == names.toSorted()).toBe(true)',
      ],
      correct: [1],
      explanation:
        'Option 2 sorts an independent copy with a human-friendly text comparator and compares contents. Option 1 compares the array with itself after mutating it, so it always passes. Option 3 only checks that an array exists. Option 4 uses == on two arrays, which compares references, so it is always false.',
      followUps: [
        { q: 'Why localeCompare rather than the default sort for names?', a: 'Default sort compares UTF-16 code units, so "Zebra" sorts before "apple" and accented letters land at the end. localeCompare follows language rules; with { sensitivity: "base" } it also ignores case, matching what users expect from an A to Z sort option.' },
      ],
    },
    {
      id: 'js-arrays-mcq-10',
      difficulty: 'hard',
      question: 'Which statements about `locator.allTextContents()` in Playwright are true? Select ALL that apply.',
      options: [
        'It returns a Promise of a string array, so it must be awaited',
        'It auto-waits until at least one element matches',
        'It can return an empty array if the elements have not rendered yet',
        'For a known exact list, await expect(locator).toHaveText([...]) is the retrying alternative',
      ],
      correct: [0, 2, 3],
      explanation:
        'allTextContents is async (returns Promise<string[]>) and takes a snapshot immediately; it does not wait for elements, so an early call can give []. The array form of toHaveText is a web-first assertion that retries until the whole ordered list matches or the expect timeout ends. The auto-wait claim is the common misconception.',
      followUps: [
        { q: 'How do you safely use allTextContents then?', a: 'Wait for a meaningful condition first, such as await expect(locator).toHaveCount(6) or await expect(locator.first()).toBeVisible(), then take the snapshot and compute. That gives you both the retrying wait and the flexibility of plain JavaScript on the result.' },
      ],
    },
    {
      id: 'js-arrays-mcq-11',
      difficulty: 'hard',
      question: 'This loop is meant to find the two biggest numbers. What values does it log for first and second?',
      code: {
        language: 'javascript',
        code: `const nums = [5, 9, 9, 7];
let first = -Infinity, second = -Infinity;
for (const n of nums) {
  if (n > first) { second = first; first = n; }
  else if (n > second) { second = n; }
}
console.log(first, second);`,
      },
      options: ['9 7', '9 9', '9 5', '7 9'],
      correct: [1],
      explanation:
        'The second 9 is not greater than first (9), but it IS greater than second (5), so second becomes 9. To get the second largest DISTINCT value (7), the else-if needs an extra n < first condition. "9 7" is what most people expect, which is exactly why interviewers ask you to clarify duplicates.',
      followUps: [
        { q: 'Which is the "correct" answer for second largest of [5, 9, 9, 7]?', a: 'It depends on the requirement, so ask. If second largest means the second item in descending order, 9 is right. If it means the second largest distinct value, 7 is right. Stating the assumption before coding is the expected behaviour.' },
      ],
    },
    {
      id: 'js-arrays-mcq-12',
      difficulty: 'hard',
      question: 'Which snippets correctly check that every order ID in `ids` is unique? Select ALL that apply.',
      options: [
        'new Set(ids).size === ids.length',
        'ids.every((id, i) => ids.indexOf(id) === i)',
        'ids.filter((id, i) => ids.indexOf(id) !== i).length === 0',
        'ids.some((id, i) => ids.indexOf(id) === i)',
      ],
      correct: [0, 1, 2],
      explanation:
        'A Set drops duplicates, so equal sizes mean no duplicates. every(... indexOf === i) is true only if each id first appears at its own index. The filter version collects any later repeats and expects none. some(...) is true as soon as one id is at its first index, which is always the case for index 0, so it never detects duplicates.',
      followUps: [
        { q: 'If the check fails, how do you show WHICH ids are duplicated in the error message?', a: 'Compute them: const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]; then expect(dupes, "duplicate order ids").toEqual([]). Asserting on the duplicate list gives a readable diff instead of "expected false to be true".' },
      ],
    },
    {
      id: 'js-arrays-mcq-13',
      difficulty: 'hard',
      question: 'A loop must click "Add to cart" on each of 6 product cards in Playwright, one after another. Which approach is correct?',
      options: [
        'cards.forEach(async (c) => await c.click())',
        'for (const c of await cards.all()) { await c.getByRole(\'button\').click(); }',
        '(await cards.all()).map((c) => c.getByRole(\'button\').click())',
        'cards.click({ clickCount: 6 })',
      ],
      correct: [1],
      explanation:
        'for...of with await inside performs the clicks one at a time and the test waits for each. forEach ignores the promises its async callback returns, so the test moves on before the clicks finish (and errors become unhandled). map starts all clicks and returns an array of promises nobody awaits. clickCount means how many times to click one element (a double-click is 2), not how many elements, and a multi-match locator fails strictness.',
      followUps: [
        { q: 'Could Promise.all over the map version work?', a: 'It would await all clicks, but they would run concurrently on one page, which is rarely what a user does and can race with re-renders (for example the button text changing to "Remove"). Sequential for...of mirrors real user behaviour and gives clearer failures.' },
      ],
    },
    {
      id: 'js-arrays-mcq-14',
      difficulty: 'expert',
      question: 'A one-line rotate helper is called with k = 0. What does it return?',
      code: {
        language: 'javascript',
        code: `const rotate = (a, k) => [...a.slice(-k), ...a.slice(0, -k)];
console.log(rotate([1, 2, 3, 4], 0));`,
      },
      options: ['[1, 2, 3, 4]', '[1, 2, 3, 4, 1, 2, 3, 4]', '[]', '[4, 1, 2, 3]'],
      correct: [0],
      explanation:
        '-0 is treated as 0, so a.slice(-0) is the whole array and a.slice(0, -0) is slice(0, 0), which is empty. Spread of [1, 2, 3, 4] plus [] gives [1, 2, 3, 4], so it happens to look right. The hidden bug shows with k = 6: slice(-6) clamps to the whole array and slice(0, -6) is empty, so it returns [1, 2, 3, 4] instead of the correct [3, 4, 1, 2]. The robust version normalises k = k % n and handles 0 and the empty array explicitly.',
      followUps: [
        { q: 'What does rotate([1, 2, 3, 4], 0) return if you change the second slice to a.slice(0, a.length - k)?', a: 'a.slice(-0) is the full array and a.slice(0, 4) is also the full array, so the result is [1, 2, 3, 4, 1, 2, 3, 4], doubled. That is why careful solutions special-case k === 0 (after k % n) instead of relying on slice tricks.' },
      ],
    },
    {
      id: 'js-arrays-mcq-15',
      difficulty: 'expert',
      question: 'You flatten table rows with `rows.flat()` and then check `cells.every((c) => c.trim() !== \'\')`. Which inputs would make this check misleading or crash? Select ALL that apply.',
      options: [
        'rows = [] (no rows rendered yet)',
        'rows = [[\'a\', [\'b\', \'\']]] (nested two levels)',
        'rows = [[\'a\', \'b\'], [\'c\', \'d\']]',
        'rows = [[\'a\', null]]',
      ],
      correct: [0, 1, 3],
      explanation:
        'An empty rows array flattens to [], and every on [] is true: a false pass. flat() only removes one level, so ["b", ""] stays an array and calling .trim() on an array throws a TypeError. null has no trim method, so that also throws. The 2x2 table of strings is the normal case and is checked correctly.',
      followUps: [
        { q: 'How would you make this check robust?', a: 'Assert rows.length > 0 first, flatten with flat(Infinity) or design the data to be exactly two levels, and normalise values: cells.map((c) => String(c ?? "").trim()). Then assert the list of empty cells is [] so the failure message shows which cells were empty.' },
      ],
    },
    {
      id: 'js-arrays-mcq-16',
      difficulty: 'medium',
      question: 'What do the removed items and the original array look like after this splice call?',
      code: {
        language: 'javascript',
        code: `const steps = [1, 2, 3, 4, 5];
const removed = steps.splice(1, 2, 'x');
console.log(removed, steps);`,
      },
      options: [
        "[2, 3] [1, 'x', 4, 5]",
        "[1, 2] ['x', 3, 4, 5]",
        "[2] [1, 'x', 3, 4, 5]",
        "[1, 'x', 4, 5] [1, 2, 3, 4, 5]",
      ],
      correct: [0],
      explanation:
        'splice(start = 1, deleteCount = 2, "x") removes two items starting at index 1 (2 and 3), inserts "x" at that position and returns the removed items. The original array is modified. The last option is what slice-like behaviour would look like, which is the usual confusion.',
      followUps: [
        { q: 'How do you insert without deleting anything?', a: 'Pass 0 as deleteCount: steps.splice(2, 0, "new") inserts "new" at index 2 and returns []. To insert without mutating, use steps.toSpliced(2, 0, "new") on Node 20+.' },
      ],
    },
  ],
};

export default topic;
