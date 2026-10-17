import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-arrays',
  phase: 'javascript',
  order: 4,
  title: 'Arrays: Methods, Sorting & Interview Problems',
  subtitle:
    'Arrays are lists. You use them in every Playwright test: prices, names, table rows and IDs. Learn the main methods, the traps that change your data, the sort trap, and the array questions QA interviews ask.',
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
    'An array is a numbered list. Indexes start at 0. `arr.length` is the item count. `arr.at(-1)` is the last item. Use `Array.isArray(x)`, not `typeof` (it says "object").',
    'These CHANGE the original: push, pop, shift, unshift, splice, sort, reverse, fill. These give a NEW array: slice, concat, map, filter, flat, toSorted, toReversed, toSpliced, with, `[...arr]`.',
    '`splice(start, count, ...items)` cuts the original and returns the removed items. `slice(start, end)` copies; the end is not included; negative numbers count from the end.',
    'map = change each item (same length). filter = keep some items. reduce = combine into one value. ALWAYS give reduce a starting value (`[].reduce(fn)` throws a TypeError).',
    'forEach returns undefined, cannot `break`, and does NOT wait for async code. Use `for...of` when you need break or await.',
    'find → first match or undefined. findIndex → index or -1. some → at least one? every → all? (`[].every(...)` is true!). includes finds NaN; indexOf does not.',
    'Plain `sort()` compares as TEXT: `[10, 9, 1, 100].sort()` → [1, 10, 100, 9]. Numbers: `(a, b) => a - b`. Text: `a.localeCompare(b)`.',
    'sort() changes the array and returns the SAME array, so `expect(arr).toEqual(arr.sort())` always passes. Sort a copy: `[...arr].sort(...)` or `arr.toSorted(...)`.',
    'Remove duplicates: `[...new Set(arr)]` (keeps first-seen order; not for objects). Count values: `counts[x] = (counts[x] ?? 0) + 1`, or a Map.',
    'Common interview set: reverse without reverse(), second largest, missing number (n(n+1)/2 − sum), rotate (k % n), chunk, flatten, merge two sorted arrays (two pointers), pair sum (Set).',
    'Playwright: `await locator.allTextContents()` → string[]. It does NOT wait, so wait first. Turn texts into numbers, then compare with a sorted copy. If you know the exact list, use `await expect(locator).toHaveText([...])`.',
    'Speed words: `includes` or `indexOf` inside a loop = O(n²) (a loop inside a loop). A Set lookup is very fast, so Set answers are O(n) (one pass).',
  ],
  sections: [
    {
      heading: 'Arrays in plain English',
      body: `**Example:** \`const products = ['Backpack', 'Bike Light', 'Bolt T-Shirt'];\`

- \`products[0]\` gives \`'Backpack'\`.
- \`products.length\` gives \`3\`.
- \`products[10]\` gives \`undefined\`. There is no error.

An **array** is a numbered list, like one column in Excel. Each position has a number called an **index**. Indexes start at **0**, not 1.

You meet arrays all the time in testing. Product names on a page are an array. So are the prices in a cart, the rows of a table, and the list an API returns.

**The basics**

- Make an array with square brackets: \`['a', 'b', 'c']\`.
- Read one item by its index: \`products[0]\` is the first item.
- \`length\` tells you how many items there are.
- The last item is \`products[products.length - 1]\`. The short way is \`products.at(-1)\`.
- A missing index gives \`undefined\`. It does not throw an error.
- An array can hold anything: numbers, text, objects, even other arrays.
- \`const\` stops you giving the variable a new value. You can still add items to the array.
- To ask "is this an array?", use \`Array.isArray(x)\`. \`typeof []\` says \`'object'\`, so \`typeof\` cannot tell.

**Watch out:** a list of 6 items has indexes 0 to 5. A loop with \`i <= arr.length\` reads one item too many.

**Why testers care:** a wrong index quietly gives \`undefined\`, so your test may check the wrong data with no error.`,
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
        'Reading a missing index gives undefined, not an error. Your test gets wrong data quietly.',
        'Use Array.isArray, never typeof, to detect arrays.',
      ],
      source: 'javascript.info — Arrays',
    },
    {
      heading: 'Changing vs copying methods (mutating vs non-mutating)',
      body: `**Example:** \`const original = [3, 1, 2];\`

- \`const copy = [...original];\` makes a copy.
- \`copy.sort((a, b) => a - b);\` sorts the copy to \`[1, 2, 3]\`.
- \`original\` is still \`[3, 1, 2]\`.

Some array methods **change the original array**. This is called **mutating**. Other methods leave the original alone and **give you a new array**.

Think of a shared Google Sheet. Some methods type straight into the shared sheet. Others make a photocopy and change only the copy.

**Watch out:** \`const b = a\` does **not** copy an array. Both names point to the same list. A change made through \`b\` also shows up in \`a\`.

| Changes the original | Gives a new array (original untouched) |
|---|---|
| \`push\`, \`pop\` (end) | \`slice\` (copy a part) |
| \`unshift\`, \`shift\` (start) | \`concat\`, spread \`[...a, ...b]\` |
| \`splice\` (cut or insert anywhere) | \`toSpliced\` |
| \`sort\` | \`toSorted\` |
| \`reverse\` | \`toReversed\` |
| \`fill\`, \`copyWithin\` | \`map\`, \`filter\`, \`flat\`, \`flatMap\`, \`with(i, v)\` |

\`toSorted\`, \`toReversed\`, \`toSpliced\` and \`with\` are the newer "copy" versions. They need Node 20 or a modern browser.

**Rule of thumb:** treat arrays you did not create as read-only. Copy first with \`[...arr]\`, then change the copy.

**In an interview, say:** "\`sort\` and \`reverse\` change the original. To keep it, I copy first with \`[...arr]\`, or I use \`toSorted\`."

**Why testers care:** two tests may share one list of test data. If one test pushes into it, the other test sees the extra item. That makes tests flaky.`,
      code: [
        {
          language: 'javascript',
          title: 'Same reference, surprising change',
          code: `const original = [3, 1, 2];
const alias = original;          // NOT a copy: both names point to one array
alias.push(4);
console.log(original);           // → [3, 1, 2, 4]

const copy = [...original];      // a real copy
copy.sort((a, b) => a - b);
console.log(copy);               // → [1, 2, 3, 4]
console.log(original);           // → [3, 1, 2, 4]  (untouched)

// sort() returns the SAME array object it sorted
const scores = [30, 10, 20];
const sorted = scores.sort((a, b) => a - b);
console.log(sorted === scores);  // → true
console.log(scores);             // → [10, 20, 30]  (original changed!)

// Newer copy versions (Node 20+): the original stays the same
const ids = [3, 1, 2];
console.log(ids.toSorted((a, b) => a - b)); // → [1, 2, 3]
console.log(ids.toReversed());              // → [2, 1, 3]
console.log(ids.with(0, 99));               // → [99, 1, 2]
console.log(ids);                           // → [3, 1, 2]`,
        },
      ],
      keyPoints: [
        '`const b = a` does not copy. Both names point to the same array.',
        'sort, reverse and splice change the original. toSorted, toReversed and toSpliced do not.',
        '`[...arr]` copies the list, but objects inside it are still shared.',
      ],
      source: 'MDN Web Docs — Array: copying methods and mutating methods',
    },
    {
      heading: 'Adding, removing and slicing',
      body: `**Example:** \`const steps = [1, 2, 3, 4, 5];\`

- \`steps.slice(1, 3)\` gives \`[2, 3]\` (a copy).
- \`steps.splice(1, 2)\` also gives \`[2, 3]\` (cut out).
- Now \`steps\` is \`[1, 4, 5]\`.

Both calls gave \`[2, 3]\`. But only \`splice\` changed \`steps\`.

- \`push\` and \`pop\` work at the **end** of the list.
- \`unshift\` and \`shift\` work at the **start** of the list.
- \`splice\` cuts out or inserts items **anywhere**. It changes the original.
- \`slice\` **copies** a part. The end index is not included.

| Method | Where | Returns | Changes the original? |
|---|---|---|---|
| \`push(x)\` | end | new length | yes |
| \`pop()\` | end | removed item | yes |
| \`unshift(x)\` | start | new length | yes |
| \`shift()\` | start | removed item | yes |
| \`splice(i, n, ...items)\` | anywhere | array of removed items | yes |
| \`slice(start, end)\` | range | new array (end exclusive) | no |

**splice vs slice** is a very common interview question. Memory trick: s**p**lice has a **p** for "**p**ermanent change".

**Watch out:** do not \`splice\` items while looping forward over the same array. Each removal moves the next item one place left, so the loop skips it. Use \`filter\` instead, or loop backwards.

**Why testers care:** \`allUsers.slice(0, 3)\` gives you three smoke-test users and keeps the full list safe.`,
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
        'push and unshift return the new length. pop and shift return the removed item.',
        'splice changes the array and returns what it removed. slice only copies.',
        'Do not splice inside a forward loop over the same array. Use filter instead.',
      ],
      source: 'javascript.info — Array methods (splice, slice, concat)',
    },
    {
      heading: 'Looping and searching: forEach, find, some, every, includes',
      body: `**Example:** \`const names = ['standard_user', 'locked_out_user', 'admin'];\`

- \`names.includes('admin')\` gives \`true\`.
- \`names.find((n) => n.startsWith('l'))\` gives \`'locked_out_user'\`.
- \`names.some((n) => n === 'guest')\` gives \`false\`.

These methods answer simple questions about a list. "Is this value in the list?" "Which item matches first?" "Does at least one match?"

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

1. \`every\` on an **empty** list is \`true\`. No item breaks the rule, so it passes. If the page shows zero prices, \`prices.every(p => p > 0)\` still passes. Check the count first.
2. \`includes(NaN)\` is \`true\`, but \`indexOf(NaN)\` is \`-1\`. The two methods compare values in slightly different ways.

**forEach limits:** you cannot \`break\` out of \`forEach\`. It always returns \`undefined\`. It also does not wait for \`async\` code. To stop early, use \`for...of\` with \`break\`. Or use \`find\` or \`some\`, which stop at the first match.

**Why testers care:** \`find\` picks one test user from a list. \`some\` and \`every\` turn a whole list into one yes/no check.`,
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

// Trap 2: includes finds NaN, indexOf does not
console.log([NaN].includes(NaN), [NaN].indexOf(NaN));   // → true -1

// forEach always returns undefined
console.log([1, 2, 3].forEach((x) => x * 2));           // → undefined`,
        },
      ],
      keyPoints: [
        'find/some/every stop early; forEach always visits everything.',
        'Check the length before every(). An empty list always passes.',
        'includes is the readable way to ask "is X in the list?".',
      ],
      source: 'MDN Web Docs — Array.prototype.every, includes, find',
    },
    {
      heading: 'map, filter and reduce',
      body: `**Example:** \`const prices = [29.99, 9.99, 15.99];\`

- \`prices.map((p) => p * 2)\` gives \`[59.98, 19.98, 31.98]\`.
- \`prices.filter((p) => p > 10)\` gives \`[29.99, 15.99]\`.
- \`prices.reduce((sum, p) => sum + p, 0)\` gives \`55.97\`.

Think of a factory line:

- **map** changes every item. The same number of items come out.
- **filter** is a quality gate. Only some items get through.
- **reduce** combines all items into one value, like a total.

A typical test uses all three. Read text from the page, **map** it to numbers, **filter** the ones you need, then **reduce** them to a total.

**map:** your function runs once for each item. Its return value goes into the new array. Inside curly braces \`{ }\` you must write \`return\`. If you forget it, you get \`undefined\` items.

**filter:** keeps the items where your function returns a truthy value (a value that counts as true). \`arr.filter(Boolean)\` drops empty strings, \`null\`, \`undefined\`, \`0\` and \`NaN\`.

**reduce:** carries a running result from item to item. This running result is called the **accumulator**. **Always give a starting value**, like \`0\` for a sum. Without one, an empty list throws a \`TypeError\`.

You can chain them, one after another: \`texts.map(toNumber).filter(n => n > 10).reduce(sum, 0)\`.

**Watch out:** \`['1', '2', '3'].map(parseInt)\` gives \`[1, NaN, NaN]\`. \`map\` also passes the index, and \`parseInt\` reads it as the number base. Use \`map(Number)\` instead.

**Why testers care:** "the cart total equals the sum of the item prices" is a \`map\` plus a \`reduce\`.`,
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
        'map keeps the length, filter makes it shorter, reduce gives one value.',
        'Inside `{ }` you must write `return`. Arrow functions without braces return by themselves.',
        'Always give reduce a starting value: 0 for sums, {} for counting, [] for lists.',
      ],
      source: 'javascript.info — Array methods (map, filter, reduce); Eloquent JavaScript Ch 5',
    },
    {
      heading: 'Sorting: the text-order trap and checking sort order',
      body: `**Example:**

- \`[10, 9, 1, 100].sort()\` gives \`[1, 10, 100, 9]\`. Surprise!
- \`[10, 9, 1, 100].sort((a, b) => a - b)\` gives \`[1, 9, 10, 100]\`.

By default, \`sort\` compares items **as text**, letter by letter. It does this even for numbers. "100" comes before "9" because "1" comes before "9". Capital letters also come before small letters.

**How to sort correctly**

- Pass a **compare function** \`(a, b) => ...\`. A negative result puts \`a\` first. A positive result puts \`b\` first. Zero keeps their order.
- Numbers, small to big: \`(a, b) => a - b\`. Big to small: \`(a, b) => b - a\`.
- Text: \`(a, b) => a.localeCompare(b)\`. It handles capitals and accents the way people expect.
- Objects: compare one field, like \`(a, b) => a.price - b.price\`.
- Equal items keep their original order. This is called a **stable** sort.
- \`sort\` **changes the original** array and returns that same array. Use \`[...arr].sort(...)\` or \`toSorted\` to keep the original.

**Testing a sort option (the most common array task in Playwright):**

1. Read the texts the user sees with \`allTextContents()\`.
2. Turn them into numbers, or trimmed text.
3. Make a **sorted copy**, and compare the two with \`toEqual\`.

**Watch out:** \`expect(prices).toEqual(prices.sort())\` can never fail. \`sort\` sorts \`prices\` itself and returns the same array. So you compare the array with itself.

| Data | Comparator |
|---|---|
| numbers ascending | \`(a, b) => a - b\` |
| numbers descending | \`(a, b) => b - a\` |
| text A→Z | \`(a, b) => a.localeCompare(b)\` |
| text Z→A | \`(a, b) => b.localeCompare(a)\` |
| objects by field | \`(a, b) => a.price - b.price\` |
| dates (ISO strings) | \`(a, b) => new Date(a) - new Date(b)\` |

**Why testers care:** "Sort by price" is tested in almost every online shop. The text-sort trap gives a wrong order with no error.`,
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

// Helper: is a list sorted small to big? (does not change the list)
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
        'No compare function means text order, even for numbers.',
        'a - b for small to big, b - a for big to small, localeCompare for text.',
        'Compare the page order with a sorted COPY, never with arr.sort() of the same array.',
      ],
      source: 'MDN Web Docs — Array.prototype.sort; Playwright docs — locator.allTextContents',
    },
    {
      heading: 'flat, flatMap, Array.from, spread and destructuring',
      body: `**Example:**

- \`[1, [2, 3]].flat()\` gives \`[1, 2, 3]\`.
- \`Array.from({ length: 3 }, (_, i) => i + 1)\` gives \`[1, 2, 3]\`.
- \`const [first, ...rest] = ['login', 'search', 'cart'];\` sets \`first\` to \`'login'\` and \`rest\` to \`['search', 'cart']\`.

These are tools to **reshape** arrays.

- **\`flat()\`** unpacks lists inside a list by one level. \`flat(Infinity)\` unpacks every level.
- **\`flatMap(fn)\`** is \`map\` and then \`flat()\`. Use it when each item gives several results, like splitting lines into words.
- **\`Array.from\`** makes a real array from other things: a string, a Set, or \`{ length: 5 }\`. It is a quick way to create test data.
- **Spread \`[...a, ...b]\`** pours the items into a new array. Use it to copy or join arrays.
- **Destructuring** takes items out by position: \`const [first, second] = arr\`. \`[a, b] = [b, a]\` swaps two variables.

**Watch out:** \`Array(3)\` makes 3 **empty slots**, not 3 values. \`map\` skips empty slots. Use \`new Array(3).fill(0)\` or \`Array.from({ length: 3 })\`.

**Why testers care:** you use these to create 50 unique emails or split a CSV line into fields. They also turn table rows into one list of cells.`,
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
        'Spread copies the list (objects inside are shared). Destructuring reads by position.',
      ],
      source: 'MDN Web Docs — Array.prototype.flat, flatMap, Array.from',
    },
    {
      heading: 'Set, Map and frequency counting',
      body: `**Example:** \`const ids = ['A1', 'B2', 'A1'];\`

- \`[...new Set(ids)]\` gives \`['A1', 'B2']\`.
- \`new Set(ids).size === ids.length\` gives \`false\`. There is a duplicate.

A **Set** is like a guest list. Each value appears only once. A **Map** (or a plain object) is like a tally sheet: a name on the left, a count on the right.

**Set**

- \`new Set(array)\` removes duplicates. It keeps the first-seen order.
- \`set.has(x)\` answers "have I seen this?" very fast. It is much faster than \`includes\` inside a loop.
- \`[...set]\` turns it back into an array.
- Two objects with the same content still count as two different values.

**Counting how often each value appears**

This "frequency map" solves many interview questions: duplicates, the most frequent item, the first item that does not repeat.

- With an object: \`counts[x] = (counts[x] ?? 0) + 1\`. Keys become strings.
- With a Map: \`m.set(x, (m.get(x) ?? 0) + 1)\`. Keys keep their type and order.
- \`Object.groupBy(items, fn)\` (Node 21+) puts items into groups by a key.

**Why testers care:** "every order ID on the page is unique" is one line: \`new Set(ids).size === ids.length\`.`,
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

// Count each value with a Map
const counts = new Map();
for (const id of orderIds) counts.set(id, (counts.get(id) ?? 0) + 1);
console.log(counts);                     // → Map(3) { 'A1' => 2, 'B2' => 2, 'C3' => 1 }

// Most frequent item
const [top] = [...counts].sort((a, b) => b[1] - a[1]);
console.log(top);                        // → ['A1', 2]

// Set does not dedupe objects with equal content
console.log(new Set([{ id: 1 }, { id: 1 }]).size);       // → 2

// Group by a key (Node 21+)
const tests = [{ t: 'login', s: 'pass' }, { t: 'cart', s: 'fail' }, { t: 'pay', s: 'pass' }];
console.log(Object.groupBy(tests, (x) => x.s));
// → [Object: null prototype] {
//     pass: [ { t: 'login', s: 'pass' }, { t: 'pay', s: 'pass' } ],
//     fail: [ { t: 'cart', s: 'fail' } ] }`,
        },
      ],
      keyPoints: [
        'new Set(arr).size === arr.length is a one-line uniqueness assertion.',
        'Use a Set for "seen before?" checks. It is much faster than includes in a loop.',
        'A Set treats two objects as different even with the same content. Remove duplicate objects by a key, like id.',
      ],
      source: 'javascript.info — Map and Set; MDN Web Docs — Object.groupBy',
    },
    {
      heading: 'Array interview problems, part 1: reverse, duplicates, second largest, missing number',
      body: `**Example (find the missing number in 1 to 5):** \`const nums = [1, 2, 4, 5];\`

- The full list 1 to 5 adds up to \`(5 * 6) / 2\`, which is \`15\`.
- \`nums.reduce((s, x) => s + x, 0)\` gives \`12\`.
- \`15 - 12\` is \`3\`. That is the missing number.

QA coding rounds rarely ask for fancy algorithms. They ask small list problems, and they watch **how** you think.

**A simple approach (say it aloud):**

1. **Ask questions:** sorted or not? duplicates? negative numbers? can I change the input? what if it is empty?
2. **Try a small example** by hand.
3. **Write a simple version first.** Then improve it, often with a Set or a single loop.
4. **Test it like a tester:** empty, one item, all equal, negatives, already sorted.
5. **Say how fast it is**, and how much extra memory it needs.

**Speed words (Big-O):** O(n) means the work grows in step with the list size. O(n²) means a loop inside a loop. Ten times more items means a hundred times more work.

| Problem | Built-in way | Manual way | Time |
|---|---|---|---|
| Reverse | \`[...a].reverse()\` | two pointers swapping ends | O(n) |
| Remove duplicates | \`[...new Set(a)]\` | loop + Set of seen | O(n) |
| Second largest (distinct) | sort desc of unique values, take [1] | one pass tracking first & second | O(n log n) vs O(n) |
| Missing number 1..n | sum formula | XOR or a Set | O(n) |
| Max / min | \`Math.max(...a)\` | loop | O(n) |

**Watch out:** \`Math.max(...[])\` is \`-Infinity\`. A very large array spread into \`Math.max\` can throw an error, so a loop is safer.

**Why testers care:** the same skills check real data, like "find the second cheapest price" or "which invoice number is missing?".`,
      code: [
        {
          language: 'javascript',
          title: 'Reverse, dedupe, second largest, missing number',
          code: `// 1. Reverse without reverse(): two pointers
function reverseArray(arr) {
  const a = [...arr];                     // don't change the caller's array
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
        'Ask questions, try an example, write a simple version, improve it, test edge cases, say the speed.',
        'Second largest: ask whether repeated top values count. Say your choice out loud.',
        'Know a manual version of each problem. Interviewers often say "no sort() or Set".',
      ],
      source: 'GeeksforGeeks — Array interview questions; softwaretestpilot.com — QA/SDET coding rounds',
    },
    {
      heading: 'Array interview problems, part 2: rotate, chunk, flatten, merge sorted, pair sum',
      body: `**Example (rotate right by 2):** \`const arr = [1, 2, 3, 4, 5];\`

- \`[...arr.slice(-2), ...arr.slice(0, -2)]\` gives \`[4, 5, 1, 2, 3]\`.
- The last two items moved to the front.

These questions check three skills. Can you **move items around**? Can you **walk two lists at once**? Can you **remember what you have seen**?

- **Rotate right by k:** move the last \`k\` items to the front. First do \`k = k % n\` (the remainder). Rotating 5 items 7 times is the same as 2 times. Handle the empty array too.
- **Chunk:** split into groups of size \`n\` with \`slice(i, i + n)\`. Move \`i\` forward by \`n\` each time. The last group may be shorter.
- **Flatten without \`flat()\`:** if an item is an array, the function calls itself on it. This is called **recursion**. Otherwise, add the item.
- **Merge two sorted arrays without \`sort()\`:** use **two pointers** (one index for each list). Compare the two front items. Take the smaller one and move that pointer. At the end, add what is left.
- **Pair sum:** for each number, ask "have I already seen \`target - n\`?" Keep the seen numbers in a Set. One loop is enough.
- **Move zeros to the end** and **common items of two arrays** use the same ideas.

**In an interview, say:** "I'll solve it with built-in methods first. Then I'll show the manual version. I'll test an empty array, a k bigger than the length, and duplicates."

**Why testers care:** chunking sends test data in batches. Merging checks that page 1 and page 2 of a sorted list still make one sorted list.`,
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
        'Rotation: first do k = k % n, and handle the empty array.',
        'Two pointers merge two sorted lists in one pass, without sort().',
        'A Set of "seen" values turns many loop-inside-a-loop answers into one loop.',
      ],
      source: 'GeeksforGeeks — Rotate array, Merge two sorted arrays; javascript.info — Recursion',
    },
    {
      heading: 'Arrays in Playwright tests',
      body: `**Example:** \`const priceLocator = page.locator('[data-test="inventory-item-price"]');\`

- \`await expect(priceLocator).toHaveCount(6);\` waits for the list.
- \`const texts = await priceLocator.allTextContents();\` gives \`['$29.99', '$9.99', ...]\`.
- \`texts.map((t) => Number(t.replace('$', '')))\` gives \`[29.99, 9.99, ...]\`.

A Playwright **locator** can match many elements on the page. Some methods give you their texts as a plain JavaScript array. Some assertions compare the elements with an array you expect.

| Need | Playwright API | Returns / does |
|---|---|---|
| All texts as strings | \`await locator.allTextContents()\` | \`string[]\` (textContent, includes hidden text) |
| All rendered texts | \`await locator.allInnerTexts()\` | \`string[]\` (innerText, as displayed) |
| Each match as its own locator | \`await locator.all()\` | \`Locator[]\` (loop with \`for...of\`) |
| How many matched | \`await expect(locator).toHaveCount(6)\` | web-first, retries |
| Exact list of texts, in order | \`await expect(locator).toHaveText(['A', 'B'])\` | web-first, retries |
| Partial texts, in order | \`await expect(locator).toContainText(['A', 'B'])\` | web-first, retries |

**Important:** \`allTextContents()\` and \`all()\` do **not** wait. If the list is not on the page yet, they return \`[]\`. And \`[].every(...)\` is \`true\`. So wait first, with \`await expect(locator).toHaveCount(n)\`. Or use the array form of \`toHaveText\`. It retries until the list matches, for up to 5 seconds by default.

**Which one to use:**

- You know the exact list (names after an "A to Z" sort): \`await expect(locator).toHaveText(expectedArray)\`.
- You must calculate something, like price order or a cart total. Wait first, then read with \`allTextContents()\`. Then use \`map\`, \`reduce\` or a \`Set\`.
- You must act on each item (add every item under $20): use \`for (const row of await locator.all())\` with \`await\` inside. Never use \`forEach(async ...)\`.

**Why testers care:** this is where all the array skills meet real tests. You read a list, clean it, and compare it.`,
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
        'allTextContents() and all() do not wait. Wait with toHaveCount first.',
        'toHaveText([...]) checks the whole list in order, and retries.',
        'To act on each element, use for...of over locator.all() with await inside.',
      ],
      source: 'Playwright docs — Locators (lists), LocatorAssertions toHaveText / toHaveCount',
    },
  ],
  codeChallenges: [
    {
      id: 'js-arrays-cc-1',
      title: 'The sort check that can never fail',
      context:
        'A teammate wrote a helper to check the "Price (low to high)" option on a shopping site. It passed on every run for months. It even passed on the day the sort feature was completely broken.',
      task: 'Find every reason this check passes when it should not. Fix `verifySortedLowToHigh` so it fails (throws an error) when the page is not sorted. Do not change the data it was given. The tests call `runSortTest(texts)`, which acts like a Playwright test that calls your helper. It returns `\'PASS\'` unless the helper throws; then it returns `\'FAIL: \' + error.message`. Expected messages: `No prices found: did the page load?`, `Not a price: "<text>"` and `Not sorted. Got <JSON>, expected <JSON>`. Press Run to check your fix.',
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
        'sort() changes the array and returns the same array. What are you really comparing?',
        'What should happen when the list is empty? And how does the plain sort() order 100 and 29.99?',
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

1. **\`parseFloat('$29.99')\` is \`NaN\`.** It stops at the first character it cannot read, and \`$\` comes first. So every price became \`NaN\`. Remove the \`$\` (and commas), and throw an error on \`NaN\`.
2. **\`prices.sort()\` changes the array and returns the same array.** So \`prices == sorted\` compared the array with itself: always \`true\`. Sort a **copy**: \`[...prices].sort(...)\` or \`toSorted\`.
3. **The plain sort compares as text.** Even with real numbers, \`[29.99, 9.99, 100].sort()\` gives \`[100, 29.99, 9.99]\`. Use \`(a, b) => a - b\`.
4. **\`==\` on two arrays only asks "is this the very same array?"** It never compares the items. Compare item by item (\`every\`), or use \`expect(...).toEqual(...)\`.
5. **An empty list passed.** A check that cannot fail on zero data is not a check. Check the length first (in Playwright, \`await expect(locator).toHaveCount(n)\` before reading).
6. **Returning true/false and logging** is easy to ignore. \`runSortTest\` ignores the return value, just like a test that writes \`verifySortedLowToHigh(texts);\` on its own line. Throw an error (or use \`expect\`) so the test really fails. Show both lists in the message.`,
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
          a: 'If you know the exact list (fixed demo data), the array form of toHaveText is better. It retries until the page matches, so a slow page is fine. When products change, you do not know the values in advance. Then you read the texts, make the sorted copy and compare. Many teams do both: toHaveCount to wait, then the calculated check.',
        },
        {
          q: 'How would you check descending order and ties?',
          a: 'Use the compare function (a, b) => b - a for the expected copy. Equal prices are fine: a list like [15.99, 15.99] still matches. Another helper, with no copy, is prices.every((p, i) => i === 0 || prices[i - 1] >= p). It reads as "each price is not bigger than the one before it".',
        },
      ],
    },
    {
      id: 'js-arrays-cc-2',
      title: 'Cleaning up a list of failed tests',
      context:
        'A report script gets the results of a test run. It should (a) drop all passed results, (b) list the failing test titles once each, and (c) count failures per spec file. The numbers in the Slack summary never match the HTML report.',
      task: 'Fix `summarise(results)` so it returns `{ titles, perFile }`. `titles` is the failed test titles, each once, in first-seen order. `perFile` is the number of failed results per spec file (every failed attempt counts). Only `status: \'failed\'` is a failure. Do not change the results array you were given. Press Run to check your fix.',
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
        'In (c), what does the reduce function return, and what is the starting value?',
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

1. **splice inside a forward loop skips items.** When index 0 is removed, the item at index 1 slides to index 0. But \`i\` moves on to 1, so the second "passed" result survives. It also **changed the caller's array**. \`filter\` fixes both. Also, use \`===\` instead of \`==\` as a habit.
2. **\`titles.includes(r)\` looked for an object in a list of strings.** It was never true, so duplicates (retries) were kept. Map to titles first, then remove duplicates with a \`Set\`.
3. **The reduce function had no \`return\`.** So the running result (\`acc\`) became \`undefined\` after the first call. And with **no starting value**, the first result object was used as \`acc\`. \`undefined + 1\` is \`NaN\`, and \`undefined[r.file]\` throws. Return \`acc\`, start from \`{}\`, and use \`?? 0\` for the first count.
4. **Decide whether retries count.** Here, failures per file count every failed attempt (2), while titles appear once (1). Say which one you want. A Playwright report counts a test once, and marks it flaky if a retry passed.`,
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
          a: 'Group results by a key made of file + title. Build a Map with that key, and keep the last status for each key. Then count the keys whose last status is failed. With Object.groupBy(failed, r => r.file + "::" + r.title) you can also see how many attempts each test made. That helps you spot flaky tests.',
        },
        {
          q: 'If you must remove items in place (no new array), how do you avoid skipping?',
          a: 'Loop backwards: for (let i = arr.length - 1; i >= 0; i--) { if (shouldRemove(arr[i])) arr.splice(i, 1); }. Removing an item only moves the items after it, and you have already visited those. So nothing is skipped. Another way: copy the kept items forward one by one, then set arr.length at the end.',
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
        'Asks whether a repeated top value counts (is [9, 9, 7] → 9 or 7?)',
        'Handles edge cases: fewer than two different values, negative numbers, an empty array',
        'Knows the simple sort answer and the faster one-loop answer',
        'Says how fast it is, and tests their own code out loud',
      ],
      modelAnswer: `**Ask first:** "Does a repeated top value count? For \`[5, 3, 9, 9, 7]\` I'll assume the answer is **7**, the second largest *different* value. If there are fewer than two different values, I'll return \`null\`."

**Quick version (with built-in methods):** remove duplicates, sort big to small, take index 1. It is clear, but slower, and it builds new arrays.

    const secondBySort = (a) => [...new Set(a)].sort((x, y) => y - x)[1] ?? null;

**One loop, O(n) time, no extra arrays:** keep two variables, \`first\` and \`second\`. Both start at \`-Infinity\`, a value smaller than any number. (Starting at 0 breaks for negative numbers.)

    function secondLargest(nums) {
      let first = -Infinity, second = -Infinity;
      for (const n of nums) {
        if (n > first) { second = first; first = n; }
        else if (n > second && n < first) { second = n; }
      }
      return second === -Infinity ? null : second;
    }

**Walk through \`[5, 3, 9, 9, 7]\`:** 5 → first=5. 3 → second=3. 9 → second=5, first=9. The next 9 equals first, so \`n < first\` skips it. 7 → second=7. Result: **7**.

**Test it like a tester:**

| Input | Expected |
|---|---|
| \`[5, 3, 9, 9, 7]\` | 7 |
| \`[-4, -1, -9]\` | -4 |
| \`[4, 4]\` | null |
| \`[]\` | null |
| \`[1, 2]\` | 1 |

**Why it matters in QA:** the same "track the top two values in one loop" idea checks things like "the highlighted deal is the second cheapest" in a list of prices from the page.`,
      followUps: [
        {
          q: 'What if duplicates should count, so [9, 9, 7] returns 9?',
          a: 'Then remove the n < first condition, so a value equal to first can move into second. The rule becomes: if n > first, move first into second; else if n > second, take it. With the sort version, skip the Set, sort big to small and take index 1. Asking this question first is exactly what the interviewer wants to see.',
        },
        {
          q: 'How would you find the k-th largest?',
          a: 'Simplest: remove duplicates, sort big to small, and take index k - 1. That is fast enough for test data. For very large inputs there are faster ways (a "heap" that keeps only the top k values), but JavaScript has no built-in heap. In a QA interview, mention that idea and write the sort version unless asked otherwise.',
        },
        {
          q: 'Why start from -Infinity instead of 0 or arr[0]?',
          a: 'Starting from 0 gives a wrong answer when all numbers are negative: [-4, -1, -9] would return 0, which is not even in the array. Starting from arr[0] works for first, but needs extra care for second. -Infinity is smaller than any real number, so the first real values always replace it. It also works as a "not found" marker.',
        },
      ],
      pitfalls: [
        'Using arr.sort() without a compare function, which sorts as text ([10, 9, 100] → 100 comes first).',
        'Returning sorted[length - 2] without removing duplicates, so [9, 9, 7] returns 9 by accident.',
        'Starting at 0, which fails for negative numbers.',
        'Never mentioning an empty array or a one-item array.',
      ],
    },
    {
      id: 'js-arrays-iq-02',
      difficulty: 'easy',
      question: 'Remove duplicates from an array. Show me more than one way, and tell me which you would use in a test.',
      whatInterviewerLooksFor: [
        'Knows the Set one-liner and why it works',
        'Can write a manual version (interviewers often say "no Set")',
        'Knows a Set does not remove objects with the same content, and how to remove them by a key',
        'Talks about keeping the original order, and about speed',
      ],
      modelAnswer: `**Three ways, from shortest to most manual:**

**1. Set (O(n), keeps first-seen order):**

    const unique1 = (arr) => [...new Set(arr)];
    unique1([3, 1, 3, 2, 1]); // → [3, 1, 2]

**2. filter + indexOf (slower, O(n²), but short and no Set):** keep an item only if this is the first place it appears.

    const unique2 = (arr) => arr.filter((x, i) => arr.indexOf(x) === i);

**3. Manual loop that remembers what it has seen (O(n)):**

    function unique3(arr) {
      const seen = {};
      const out = [];
      for (const x of arr) {
        if (!seen[x]) { seen[x] = true; out.push(x); }
      }
      return out;
    }

Careful: object keys are always text, so \`1\` and \`'1'\` count as the same key in version 3. A \`Set\` or \`Map\` keeps them apart.

**Objects (API data):** \`new Set([{id:1},{id:1}])\` keeps both. Two objects are only "equal" if they are the very same object. So remove duplicates by a key instead:

    const byId = (rows) => [...new Map(rows.map((r) => [r.id, r])).values()];

(This keeps the **last** row for each id.)

**In a test I'd use the Set**, usually inside a check: "every order ID in the table is unique" is \`expect(new Set(ids).size).toBe(ids.length)\`. If it fails, I'd also find the actual duplicates, so the error message names them.`,
      followUps: [
        {
          q: 'How do you return only the values that ARE duplicated?',
          a: 'Use two Sets: seen and dupes. Loop over the array. If seen already has the value, add it to dupes; otherwise add it to seen. Return [...dupes]. Or count each value and keep those with a count above 1. Both need one loop. The filter version arr.filter((x, i) => arr.indexOf(x) !== i) also works, but lists a value twice if it appears three times.',
        },
        {
          q: 'Does your Set version handle NaN and -0?',
          a: 'A Set treats every NaN as the same value, so it keeps one NaN. It also treats -0 and +0 as equal. The indexOf version is different: indexOf(NaN) is always -1, so arr.filter((x, i) => arr.indexOf(x) === i) drops NaN completely. Mentioning this shows you know that includes/Set and indexOf compare values in slightly different ways.',
        },
      ],
      pitfalls: [
        'Only knowing the Set one-liner and freezing when asked for a manual version.',
        'Saying a Set removes objects that have the same content (it does not).',
        'Using a loop inside a loop without saying it is slow (O(n²)).',
      ],
    },
    {
      id: 'js-arrays-iq-03',
      difficulty: 'medium',
      question: 'An array contains the numbers 1 to n with exactly one number missing. Find the missing number.',
      whatInterviewerLooksFor: [
        'Checks the assumptions: unsorted? exactly one missing? no duplicates?',
        'Uses the sum formula n(n+1)/2 and computes n correctly (length + 1)',
        'Offers another way (a Set, or sort and scan) and compares them',
        'Can handle "several numbers missing"',
      ],
      modelAnswer: `**Ask first:** "The array is not sorted, has no duplicates, and exactly one number from 1 to n is missing. So its length is n - 1."

**Sum formula (one loop, no extra memory):** the sum of 1 to n is \`n * (n + 1) / 2\`. Subtract the real sum. What is left is the missing number.

    function missingNumber(arr) {
      const n = arr.length + 1;                 // one number is missing
      const expected = (n * (n + 1)) / 2;
      const actual = arr.reduce((s, x) => s + x, 0);
      return expected - actual;
    }
    missingNumber([3, 7, 1, 2, 8, 4, 5]);  // → 6

Walk-through: the length is 7, so n = 8. Expected sum = 36. Real sum = 30. Missing: **6**.

**Another way, with a Set (clearer, but uses extra memory):**

    function missingWithSet(arr) {
      const have = new Set(arr);
      for (let i = 1; i <= arr.length + 1; i++) if (!have.has(i)) return i;
    }

**Edge cases:** the first number is missing (\`[2, 3]\` → 1), the last is missing (\`[1, 2]\` → 3), and the empty array (\`[]\` → 1).

**Several missing numbers:** the formula no longer works. Use the Set loop and collect every \`i\` that is not there. That is the version I'd use in QA. Example: "invoice numbers 1001 to 1050 should all be in the export. Which are missing?"`,
      followUps: [
        {
          q: 'What if the range starts at 1001 instead of 1?',
          a: 'Use the general sum formula: the sum of a to b is (a + b) * (b - a + 1) / 2. With one number missing, b = a + arr.length. Or use the Set version and loop from the smallest to the largest number you expect. For a QA export check (invoice IDs 1001 to 1050) the Set version is better, because it lists every gap, not just one.',
        },
        {
          q: 'How would you find the duplicate if one number appears twice instead?',
          a: 'Loop over the array with a Set. The first value that is already in the Set is the duplicate. That is one loop. If one value is repeated and one is missing, count how often each number appears. The number with count 2 is the duplicate, and the number with count 0 is the missing one.',
        },
      ],
      pitfalls: [
        'Using n = arr.length, which is off by one.',
        'Sorting first and scanning. It works, but it is slower and it changes the input unless you copy it.',
        'Not asking whether the input can contain duplicates.',
      ],
    },
    {
      id: 'js-arrays-iq-04',
      difficulty: 'medium',
      question: 'Rotate an array to the right by k positions. Then do it without slice or spread.',
      whatInterviewerLooksFor: [
        'Shrinks k with k % n and handles an empty array',
        'A clear built-in solution first, then a manual one',
        'Says whether the input array is changed',
        'Tests with k = 0, k = n, k > n',
      ],
      modelAnswer: `**Understand:** right by 2 means \`[1, 2, 3, 4, 5]\` → \`[4, 5, 1, 2, 3]\`: the last two items wrap to the front.

**Step 1, always:** \`k = k % n\` (the remainder). Rotating 5 items by 7 is the same as by 2. Rotating by 5 changes nothing. Check \`n === 0\` first, because \`% 0\` gives \`NaN\`.

**Built-in version (new array):**

    function rotateRight(arr, k) {
      const n = arr.length;
      if (n === 0) return [];
      k = k % n;
      if (k === 0) return [...arr];
      return [...arr.slice(-k), ...arr.slice(0, -k)];
    }

Watch out: \`arr.slice(-0)\` is the whole array, which is why the \`k === 0\` guard exists.

**Manual version (index maths):** the item at index \`i\` moves to index \`(i + k) % n\`.

    function rotateManual(arr, k) {
      const n = arr.length;
      const out = new Array(n);
      for (let i = 0; i < n; i++) out[(i + k) % n] = arr[i];
      return out;
    }

**Without a new array (the classic "three reversals"):** reverse the whole array. Then reverse the first k items. Then reverse the rest. \`[1,2,3,4,5]\` → \`[5,4,3,2,1]\` → \`[4,5,3,2,1]\` → \`[4,5,1,2,3]\`.

**Tests I would run:** k = 0, k = 2, k = n, k = n + 2, an empty array, one item, and left rotation (which is right rotation by \`n - k\`).

Speed: all three are one pass, O(n). The first two build a new array. The reversal trick needs no extra array.`,
      followUps: [
        {
          q: 'How do you rotate left instead?',
          a: 'Left by k is the same as right by n - k (after normalising k). With slices: [...arr.slice(k), ...arr.slice(0, k)]. With index arithmetic: out[i] = arr[(i + k) % n]. A carousel test ("click next 3 times, the 4th slide is shown") is essentially a left rotation, so this maps nicely to UI testing.',
        },
        {
          q: 'What about a negative k?',
          a: 'Pick a rule and say it: a negative k could mean rotate left. In JavaScript, % keeps the minus sign, so -1 % 5 is -1, not 4. Use ((k % n) + n) % n to always get a number from 0 to n - 1. Then rotate right by that amount.',
        },
      ],
      pitfalls: [
        'Forgetting k % n, so a k bigger than the length gives wrong or empty results.',
        'Using arr.pop() + unshift() k times on a big array without saying it is slow.',
        'Changing the caller\'s array without saying so.',
      ],
    },
    {
      id: 'js-arrays-iq-05',
      difficulty: 'medium',
      question: 'Count how many times each element appears in an array, then return the most frequent one and the first non-repeating one.',
      whatInterviewerLooksFor: [
        'Counts each value with an object or a Map, in one loop',
        'Knows that object keys are always text, but Map keys keep their type',
        'Handles ties and "nothing found"',
        'Links it to real QA work: counting statuses, flaky failures, duplicate IDs',
      ],
      modelAnswer: `**Count each value (a "frequency map"), in one loop:**

    function frequencies(arr) {
      const counts = new Map();
      for (const x of arr) counts.set(x, (counts.get(x) ?? 0) + 1);
      return counts;
    }
    const statuses = ['pass', 'fail', 'pass', 'skip', 'pass', 'fail'];
    frequencies(statuses); // → Map { 'pass' => 3, 'fail' => 2, 'skip' => 1 }

**Most frequent:** loop over the counts once and keep the biggest.

    function mostFrequent(arr) {
      let best = null, bestCount = 0;
      for (const [value, count] of frequencies(arr)) {
        if (count > bestCount) { best = value; bestCount = count; }
      }
      return best;          // ties: the first one seen wins
    }

**First value that does not repeat:** a Map remembers the order you added keys. So the first key with count 1 is the answer.

    function firstUnique(arr) {
      for (const [value, count] of frequencies(arr)) if (count === 1) return value;
      return null;
    }
    firstUnique(statuses); // → 'skip'

**Object vs Map:** \`counts[x] = (counts[x] ?? 0) + 1\` works and prints nicely. But keys become text, so \`1\` and \`'1'\` merge. Number-like keys are also put in number order, which breaks "first value that does not repeat". A \`Map\` keeps the type and the order you added.

**Real QA uses:** summarise a test run (passed, failed and flaky counts). Find the error message that appears most in the logs. Or check that "each product appears exactly once in the cart" (every count === 1).`,
      followUps: [
        {
          q: 'How would you do this for characters in a string (first non-repeating character)?',
          a: 'Same steps: build the Map with for (const ch of str). Then loop over the Map, which keeps the order you added, and return the first key with count 1. for...of over a string reads each character correctly, even emoji, which index loops can split. Lower-case the string first if case should not matter, and decide whether spaces count.',
        },
        {
          q: 'How would you return all values that tie for the highest count?',
          a: 'First loop: find the highest count with Math.max(...counts.values()). Second loop: keep the entries with that count: [...counts].filter(([, c]) => c === max).map(([v]) => v). Two loops are still O(n). Saying how you will handle ties before you code makes a strong impression.',
        },
      ],
      pitfalls: [
        'A loop inside a loop that counts each item separately (slow, O(n²)).',
        'Using a plain object for number keys and being surprised by the order.',
        'Forgetting to handle the "no unique element" case.',
      ],
    },
    {
      id: 'js-arrays-iq-06',
      difficulty: 'medium',
      question: 'Merge two sorted arrays into one sorted array without using sort().',
      whatInterviewerLooksFor: [
        'Uses two pointers (one index per array) and adds the leftover items',
        'Understands why joining and then sorting is slower',
        'Handles empty arrays and the same value in both arrays',
        'Clean, readable loop conditions',
      ],
      modelAnswer: `**Idea:** both lists are already sorted. So the smallest item left is always at the **front** of one of them. Compare the two front items, take the smaller one, and move that index forward. When one list runs out, add the rest of the other.

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

**Speed:** one pass over both lists, O(n + m). The shortcut \`[...a, ...b].sort((x, y) => x - y)\` is correct but slower. It also ignores that the inputs are already sorted, which is the whole point of the question.

**Edge cases:** one or both arrays empty. The same value in both (\`<=\` takes the item from \`a\` first). Negative numbers. Very different lengths.

**Extra I'd offer:** to merge **without duplicates**, skip a value equal to the last one added. For lists sorted **big to small**, flip the comparison.

**QA link:** a real paging test joins page 1 and page 2 of a "sorted by date" API. Then it checks that the joined list is still sorted.`,
      followUps: [
        {
          q: 'How would you merge k sorted arrays?',
          a: 'Simplest: merge them two at a time (1 with 2, then the result with 3, and so on). That is easy to explain. Faster: merge in pairs like a tournament (1+2, 3+4, then the winners). For interview test data, the simple version is fine: arrays.reduce(mergeSorted, []).',
        },
        {
          q: 'How would you test that your merge function is correct?',
          a: 'Write example tests: empty + empty, empty + list, mixed values, all of a smaller than b, and the same value in both. Then add a random check: for random sorted inputs, the output length equals a.length + b.length, the output is sorted, and it equals [...a, ...b].sort((x, y) => x - y). The slow built-in version gives the expected answer.',
        },
      ],
      pitfalls: [
        'Forgetting the leftover items when one array runs out.',
        'Using concat + sort() without a compare function (the text-sort bug).',
        'Loop conditions with <= length, which read one item too many.',
      ],
    },
    {
      id: 'js-arrays-iq-07',
      difficulty: 'easy',
      question: 'Split an array into chunks of size n, and flatten a nested array without using flat().',
      whatInterviewerLooksFor: [
        'Chunk: the right loop step and slice positions, and a shorter last chunk',
        'Flatten: a function that calls itself (recursion), using Array.isArray',
        'Checks bad input (size <= 0) and mentions very deep nesting',
        'Links chunking to sending test data or API calls in batches',
      ],
      modelAnswer: `**Chunk:** move through the array \`size\` items at a time, and slice each group. \`slice\` stops at the end by itself, so the last chunk is just shorter.

    function chunk(arr, size) {
      if (size <= 0) throw new Error('size must be > 0');  // avoid an infinite loop
      const out = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    }
    chunk([1, 2, 3, 4, 5], 2); // → [[1, 2], [3, 4], [5]]

With built-ins only: \`Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))\`.

**Flatten (any depth) with recursion (a function that calls itself):**

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

**Without recursion** (for very deep nesting, which can crash a function that calls itself too often): keep a to-do list of items. Take one off, and if it is an array, put its items back on the list.

**Where testers use these:** split 500 generated users into batches of 50 API calls, so you do not hit a rate limit. Or flatten table rows (\`[[cell, cell], [cell, cell]]\`) into one list of cells, then check that none is empty.`,
      followUps: [
        {
          q: 'How would you flatten only to a given depth, like flat(2)?',
          a: 'Add a depth parameter and make it one smaller on each inner call: if Array.isArray(item) && depth > 0, push ...flatten(item, depth - 1); otherwise push the item as it is. With depth 1 you get exactly flat(). This shows you understand the built-in method, not just how to call it.',
        },
        {
          q: 'Why use Array.isArray instead of typeof item === "object"?',
          a: 'typeof returns "object" for arrays, plain objects and null. So plain objects would be wrongly "flattened", and null would crash. Array.isArray is true only for real arrays, which is exactly what you want to flatten.',
        },
      ],
      pitfalls: [
        'Looping with i++ and slicing (i, i + size), which gives overlapping chunks.',
        'Not handling size 0, which loops forever.',
        'Flattening with toString().split(","), which turns numbers into strings and breaks on strings with commas.',
      ],
    },
    {
      id: 'js-arrays-iq-08',
      difficulty: 'hard',
      question: 'In Playwright, how would you verify that a product listing is sorted by price after the user picks "Price (low to high)"? Walk me through the code and the ways such a test can pass falsely.',
      whatInterviewerLooksFor: [
        'Reads texts with allTextContents, turns them into numbers, compares with a sorted copy',
        'Knows allTextContents does not wait, and checks for an empty list',
        'Spots the "sort changes the original" false pass and the text-sort bug',
        'Mentions the retrying option (toHaveText with an array) and when to use it',
      ],
      modelAnswer: `**The test (SauceDemo):**

1. Log in, then select the option: \`await page.locator('[data-test="product-sort-container"]').selectOption('lohi')\`.
2. Wait for the list, and make sure it is not empty: \`await expect(prices).toHaveCount(6)\` (or at least \`toBeVisible\` on \`.first()\`).
3. Read the texts: \`const texts = await prices.allTextContents()\`.
4. Turn them into numbers: \`const values = texts.map((t) => Number(t.replace('$', '')))\`.
5. Compare with a sorted copy: \`expect(values).toEqual([...values].sort((a, b) => a - b))\`.

**Ways it can pass when it should fail, and the fix for each:**

| False pass | Why | Fix |
|---|---|---|
| \`expect(values).toEqual(values.sort(...))\` | sort changes the array and returns the same array | sort a copy |
| \`.sort()\` with no compare function | text order: "100" before "25" | \`(a, b) => a - b\` |
| \`parseFloat('$9.99')\` | NaN; NaN arrays still "equal" | strip \`$\`, assert no NaN |
| reading before render | \`allTextContents()\` returns \`[]\` immediately; empty equals empty | \`toHaveCount\` first |
| missing \`await\` on an assertion | test ends before it runs | await every \`expect(locator)\` |
| reading before the re-sort | the old order is captured | wait for a known first item, e.g. \`toHaveText\` on \`.first()\` |

**The last row needs care:** after \`selectOption\`, the page may redraw the list a moment later. If you read too early, you test the old list. A safe trick: first check the expected first and last items with retrying assertions, then do the calculated check.

**When the data never changes:** \`await expect(prices).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99'])\` retries until the list matches. I use the calculated check when products change, and the fixed list for fixed demo data.`,
      followUps: [
        {
          q: 'How would you verify sorting by name Z to A?',
          a: 'Read the names with allTextContents on the item-name locator. Then compare with [...names].sort((a, b) => b.localeCompare(a)). localeCompare matters because the plain sort puts all capital letters before small letters, and names may have accents. Trim spaces first, because textContent can include extra spaces.',
        },
        {
          q: 'The list is paginated, 20 per page. How do you check global order?',
          a: 'Collect each page into one array (add each page after it loads, with await). Then run the same sorted-copy check on the full list. Also check the edge: the last item of page 1 <= the first item of page 2. Often it is faster and more reliable to check the order through the API with the request fixture, and keep one UI test for page 1.',
        },
      ],
      pitfalls: [
        'Comparing the array with arr.sort() of itself.',
        'Using allTextContents without waiting, then "passing" on an empty array.',
        'Using waitForTimeout(3000) instead of a retrying assertion.',
        'Sorting numbers without a compare function.',
      ],
    },
    {
      id: 'js-arrays-iq-09',
      difficulty: 'hard',
      question: 'Given an array of numbers and a target, return the pair that adds up to the target. Start with brute force, then optimise.',
      context: 'A common "two-sum" warm-up in SDET coding rounds. Interviewers use it to see if you can make a slow answer faster.',
      whatInterviewerLooksFor: [
        'Starts with a correct loop-inside-a-loop answer and says it is O(n²)',
        'Speeds it up to one loop with a Set or Map of seen values',
        'Asks: indexes or values? duplicates? more than one pair?',
        'Mentions the two-pointer version for a sorted array',
      ],
      modelAnswer: `**Ask first:** "Return the values or the indexes? If there are several pairs, is any one fine? Can one item be used twice?" I'll return the first pair of **indexes**, using two different items.

**Simple version, O(n²):** check every pair.

    function pairBrute(nums, target) {
      for (let i = 0; i < nums.length; i++)
        for (let j = i + 1; j < nums.length; j++)
          if (nums[i] + nums[j] === target) return [i, j];
      return null;
    }

**Faster, one loop, with a Map of value → index:** for each number, the partner we need is \`target - n\`. If we have already seen it, we are done. If not, remember this number.

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

We check \`seen\` **before** adding the current number. That stops a number pairing with itself (\`[5]\`, target 10 → null).

**If the array is sorted:** use two pointers, one at each end. If the sum is too small, move the left one right. If it is too big, move the right one left. One loop, no extra memory.

**Tests:** no pair, negative numbers, duplicates (\`[3, 3]\`, target 6 → \`[0, 1]\`), pair at the very end, empty array.`,
      followUps: [
        {
          q: 'How would you return ALL unique pairs?',
          a: 'Keep the seen Set. When a partner exists, add the pair to a result Set with a fixed key like Math.min(a, b) + ":" + Math.max(a, b). Then [2, 7] and [7, 2] are not counted twice. At the end, turn the keys back into number pairs. It is still one loop.',
        },
        {
          q: 'Why is includes() inside the loop not a real optimisation?',
          a: 'nums.includes(target - n) searches the whole array each time. So it is still a loop inside a loop, just hidden. It also lets a number match itself. A Set or Map lookup is almost instant, which makes the whole answer one loop. Explaining hidden loops inside built-in methods impresses interviewers.',
        },
      ],
      pitfalls: [
        'Letting a number pair with itself.',
        'Using includes or indexOf inside the loop and calling it fast.',
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
        'The starting value (the accumulator) is an empty object {}.',
        'acc[s] ?? 0 gives 0 the first time a key is seen.',
        'Object keys print in the order they were added (for keys that are not numbers).',
      ],
      steps: [
        { label: 'Start', calc: 'acc = {}' },
        { label: 'Item 1: "pass"', calc: 'acc.pass = (undefined ?? 0) + 1 = 1 → { pass: 1 }' },
        { label: 'Item 2: "fail"', calc: 'acc.fail = 0 + 1 = 1 → { pass: 1, fail: 1 }' },
        { label: 'Item 3: "pass"', calc: 'acc.pass = 1 + 1 = 2 → { pass: 2, fail: 1 }' },
        { label: 'Item 4: "skip"', calc: 'acc.skip = 0 + 1 = 1 → { pass: 2, fail: 1, skip: 1 }' },
        { label: 'Return', calc: 'reduce returns the final running result' },
      ],
      answer: '`{ pass: 2, fail: 1, skip: 1 }`. Without the `return acc` line, the second call would get `undefined`, and `undefined["fail"]` would throw a TypeError. Without `{}`, the first item, the string "pass", would become the running result. In strict mode (every ES module, so every Playwright test file), `acc["fail"] = 1` then throws `TypeError: Cannot create property \'fail\' on string \'pass\'`.',
      insight: 'Every reduce is just "running result in, running result out". Write the running result after each item, like a table. It is the fastest way to debug any reduce, in an interview or in a test helper.',
      followUps: [
        {
          q: 'How would you write the same thing without reduce?',
          a: 'const acc = {}; for (const s of statuses) acc[s] = (acc[s] ?? 0) + 1;. Many reviewers find the for...of version easier to read, and it is fine to say so in an interview. reduce is nicest at the end of a chain (map → filter → reduce), or when you want one expression.',
        },
      ],
    },
    {
      id: 'js-arrays-drill-2',
      question:
        'Predict each logged value: `const a = [10, 9, 1, 100]; const b = a; const c = a.sort(); const d = [...a].sort((x, y) => y - x); b.push(5); console.log(a, c, d, a === c, a.length);`',
      assumptions: [
        'The plain sort() compares values as text.',
        '`b = a` makes a second name for the same array; spread copies the items.',
        'sort returns the same array it sorted.',
      ],
      steps: [
        { label: 'b = a', calc: 'a and b are the same array object' },
        { label: 'c = a.sort()', calc: 'text order "1" < "10" < "100" < "9" → a becomes [1, 10, 100, 9]; c is the same array as a' },
        { label: 'd = [...a].sort(desc)', calc: 'copy of [1, 10, 100, 9] sorted as numbers, big to small → [100, 10, 9, 1]; a untouched' },
        { label: 'b.push(5)', calc: 'pushes into the shared array → a (and b and c) = [1, 10, 100, 9, 5]' },
        { label: 'a === c', calc: 'same array → true' },
        { label: 'a.length', calc: '5' },
      ],
      answer: '`[1, 10, 100, 9, 5]  [1, 10, 100, 9, 5]  [100, 10, 9, 1]  true  5`',
      insight: 'Three names (a, b, c) all pointed at one array. Two "innocent" steps (sort, and push through b) changed it. Only the spread copy (d) was separate. In test code, this is how one helper quietly breaks shared test data.',
      followUps: [
        {
          q: 'What changes if you replace a.sort() with a.toSorted()?',
          a: 'toSorted returns a new sorted array and leaves a alone. So c becomes [1, 10, 100, 9] (still text order, because there is no compare function). a stays [10, 9, 1, 100] until the push, so a === c is false. After b.push(5), a is [10, 9, 1, 100, 5]. d is made from the unsorted a: [100, 10, 9, 1].',
        },
      ],
    },
    {
      id: 'js-arrays-drill-3',
      question:
        'Trace the loop and predict the final array: `const ids = [\'a\', \'x\', \'x\', \'b\', \'x\']; for (let i = 0; i < ids.length; i++) { if (ids[i] === \'x\') ids.splice(i, 1); } console.log(ids);`',
      assumptions: [
        'splice(i, 1) removes one item at index i and moves later items one place left.',
        'The loop condition reads ids.length again on every round.',
      ],
      steps: [
        { label: 'i = 0', calc: '"a" → keep. ids = [a, x, x, b, x]' },
        { label: 'i = 1', calc: '"x" → splice → ids = [a, x, b, x] (second x slid into index 1)' },
        { label: 'i = 2', calc: '"b" → keep (the x now at index 1 was skipped!)' },
        { label: 'i = 3', calc: '"x" → splice → ids = [a, x, b]' },
        { label: 'i = 4', calc: '4 < 3 is false → loop ends' },
      ],
      answer: '`[\'a\', \'x\', \'b\']`: one "x" survives because it slid into the index the loop had just processed.',
      insight: 'Removing items while looping forward skips the item after every removal. Use filter (it makes a new array), or loop backwards if you must change the array itself.',
      followUps: [
        {
          q: 'Fix it three different ways.',
          a: '1) ids = ids.filter((id) => id !== "x") (requires let, or assign to a new const). 2) Loop backwards: for (let i = ids.length - 1; i >= 0; i--) if (ids[i] === "x") ids.splice(i, 1). 3) Decrement after removing: if (ids[i] === "x") { ids.splice(i, 1); i--; }. The filter version is the clearest, and it does not change shared data.',
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
        'Without a compare function, sort turns each value into text and compares letter by letter. So "100" comes before "25", and "9" comes last. [1, 9, 10, 25, 100] is what you get with (a, b) => a - b, which is why numbers need that function. The big-to-small option would need b - a.',
      followUps: [
        { q: 'Why did JavaScript choose string comparison as the default?', a: 'Arrays can hold mixed types, and every value can be turned into text. So text order is the only order that works for anything. It is predictable, but rarely what you want for numbers. Always pass a compare function for numbers.' },
      ],
    },
    {
      id: 'js-arrays-mcq-02',
      difficulty: 'easy',
      question: 'Which methods change the original array? Select ALL that apply.',
      options: ['splice', 'slice', 'sort', 'map', 'push'],
      correct: [0, 2, 4],
      explanation:
        'splice removes or inserts items in the original. sort reorders the original. push adds to the end of the original. slice returns a copy of a part, and map returns a new array, so the original stays the same. slice and splice are a classic trap, because the names differ by one letter.',
      followUps: [
        { q: 'Name the versions of sort and splice that do not change the original.', a: 'toSorted and toSpliced. They work in Node 20+ and modern browsers. Before they existed, people copied first with [...arr] or arr.slice(), and then called sort or splice on the copy.' },
      ],
    },
    {
      id: 'js-arrays-mcq-03',
      difficulty: 'easy',
      question: 'You need the FIRST user object whose `locked` property is true. Which method fits best?',
      options: ['users.filter((u) => u.locked)', 'users.find((u) => u.locked)', 'users.some((u) => u.locked)', 'users.includes({ locked: true })'],
      correct: [1],
      explanation:
        'find returns the first matching item (or undefined), and stops looking early. filter returns an array of all matches, so you would still need [0]. some returns only true or false. includes looks for that very same object, so a new object like { locked: true } is never found.',
      followUps: [
        { q: 'What does find return when nothing matches, and how should a test handle it?', a: 'undefined. Reading .name on it throws a TypeError that hides the real problem. So check it exists first (expect(user).toBeDefined()), or throw a clear error such as "No locked user in test data".' },
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
        'map passes (value, index, array). parseInt reads the index as the number base. parseInt("1", 0) is 1 (base 0 means "normal"). parseInt("2", 1) is NaN (base 1 does not exist). parseInt("3", 2) is NaN (3 is not a binary digit). Use map(Number) or map((s) => parseInt(s, 10)).',
      followUps: [
        { q: 'Which is safer for price strings like "$9.99": Number, parseInt or parseFloat?', a: 'None of them on their own: all return NaN, because "$" comes first. Remove the $ first (text.replace("$", "")), then use Number. Number rejects junk at the end (Number("9.99abc") is NaN), while parseFloat quietly ignores it. Then check the result is not NaN.' },
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
        'every on an empty array is true, because no item breaks the rule. allTextContents does not wait, so it returns [] if the list is not on the page yet. Wait with await expect(locator).toHaveCount(n), or check prices.length > 0 first. Only the retrying expect(locator) assertions wait; methods that just read do not.',
      followUps: [
        { q: 'What does [].some(...) return?', a: 'false, because no item matches the rule. So some fails safely on empty data, while every passes when it should not. Remember this difference whenever you check lists read from a page.' },
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
        'b = a does not copy. It is a second name for the same array, so pushing through b changes that one array: a and b both have length 4. c is a spread copy, so popping from c (4 → 3 items) does not touch a. "3 4 3" assumes b = a makes a copy, which is the mistake this question tests.',
      followUps: [
        { q: 'Does spread make a deep copy of an array of objects?', a: 'No. Spread makes a "shallow" copy: the new array holds the same objects. So changing c[0].name also changes a[0].name. Use structuredClone(a) for a full ("deep") copy of plain data.' },
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
        'A Set keeps the first copy of each value, in the order added. Both spread and Array.from turn it back into an array. The filter/indexOf version keeps an item only at the first place it appears. sort() reorders but keeps duplicates ([1, 1, 2, 2, 3]). flat() only unpacks inner lists.',
      followUps: [
        { q: 'Which of these is O(n²) and why?', a: 'The filter + indexOf version. For every item, indexOf searches from the start, so n items × up to n checks. The Set versions are O(n), because adding to a Set and looking up a value are almost instant.' },
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
        'With no starting value, the first ITEM ({ price: 10 }) becomes the running result. Object + 20 turns the object into the text "[object Object]". Joining text then gives "[object Object]20", then "[object Object]205". With 0 as the starting value you get 35. The TypeError only happens on an empty array.',
      followUps: [
        { q: 'How do you make it safe for an empty cart too?', a: 'Give the starting value: items.reduce((sum, i) => sum + i.price, 0) returns 0 for an empty array instead of throwing. Then decide whether an empty cart is itself a failure in your test, and check the count separately.' },
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
        'Option 2 sorts a separate copy with a people-friendly text compare, and compares the items. Option 1 sorts the array itself and compares it with itself, so it always passes. Option 3 only checks that an array exists. Option 4 uses == on two different arrays, which only asks "same array?", so it is always false.',
      followUps: [
        { q: 'Why localeCompare rather than the default sort for names?', a: 'The plain sort compares character codes, so "Zebra" comes before "apple", and letters with accents go to the end. localeCompare follows language rules. With { sensitivity: "base" } it also ignores capitals. That matches what users expect from an A to Z option.' },
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
        'allTextContents is async (it returns Promise<string[]>) and reads the page right away. It does not wait for elements, so an early call can give []. The array form of toHaveText retries until the whole list matches in order, or the timeout ends. "It auto-waits" is the common wrong belief.',
      followUps: [
        { q: 'How do you safely use allTextContents then?', a: 'Wait for a clear condition first, such as await expect(locator).toHaveCount(6) or await expect(locator.first()).toBeVisible(). Then read the texts and calculate. You get the retrying wait, plus the freedom of plain JavaScript on the result.' },
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
        'The second 9 is not greater than first (9), but it IS greater than second (5). So second becomes 9. To get the second largest DIFFERENT value (7), the else-if needs an extra n < first condition. Most people expect "9 7". That is exactly why interviewers want you to ask about duplicates.',
      followUps: [
        { q: 'Which is the "correct" answer for second largest of [5, 9, 9, 7]?', a: 'It depends on the requirement, so ask. If it means the second item in big-to-small order, 9 is right. If it means the second largest different value, 7 is right. Say your assumption before you code.' },
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
        'A Set drops duplicates, so equal sizes mean no duplicates. every(... indexOf === i) is true only if each id first appears at its own index. The filter version collects any later repeats and expects none. some(...) is true as soon as one id is at its first index. That is always true for index 0, so it never finds duplicates.',
      followUps: [
        { q: 'If the check fails, how do you show WHICH ids are duplicated in the error message?', a: 'Find them: const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))]; then expect(dupes, "duplicate order ids").toEqual([]). Checking the duplicate list gives a clear message, instead of "expected false to be true".' },
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
        'for...of with await inside clicks one card at a time, and the test waits for each click. forEach ignores the promises its async function returns, so the test moves on before the clicks finish (and errors go unhandled). map starts all clicks and returns promises nobody waits for. clickCount means how many times to click one element (a double-click is 2). Also, a locator that matches many elements fails Playwright\'s strict mode for click.',
      followUps: [
        { q: 'Could Promise.all over the map version work?', a: 'It would wait for all clicks, but they would run at the same time on one page. A real user never does that, and the page may change in between (for example, the button text changes to "Remove"). One-by-one for...of acts like a real user and gives clearer failures.' },
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
        '-0 is the same as 0. So a.slice(-0) is the whole array, and a.slice(0, -0) is slice(0, 0), which is empty. [1, 2, 3, 4] plus [] gives [1, 2, 3, 4], so it happens to look right. The hidden bug shows with k = 6: slice(-6) is the whole array and slice(0, -6) is empty. It returns [1, 2, 3, 4] instead of the correct [3, 4, 1, 2]. The safe version does k = k % n first, and handles 0 and the empty array.',
      followUps: [
        { q: 'What does rotate([1, 2, 3, 4], 0) return if you change the second slice to a.slice(0, a.length - k)?', a: 'a.slice(-0) is the full array, and a.slice(0, 4) is also the full array. So the result is [1, 2, 3, 4, 1, 2, 3, 4], doubled. That is why careful answers handle k === 0 on its own (after k % n), instead of trusting slice tricks.' },
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
        'An empty rows array flattens to [], and every on [] is true: a false pass. flat() only unpacks one level, so ["b", ""] stays an array, and calling .trim() on an array throws a TypeError. null has no trim method, so that also throws. The 2x2 table of strings is the normal case, and it is checked correctly.',
      followUps: [
        { q: 'How would you make this check robust?', a: 'Check rows.length > 0 first. Flatten with flat(Infinity), or make sure the data is exactly two levels. Clean each value: cells.map((c) => String(c ?? "").trim()). Then check that the list of empty cells is [], so the failure message shows which cells were empty.' },
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
        'splice(start = 1, deleteCount = 2, "x") removes two items from index 1 (2 and 3), puts "x" in their place, and returns the removed items. The original array is changed. The last option is what you would expect if splice copied like slice, which is the usual mix-up.',
      followUps: [
        { q: 'How do you insert without deleting anything?', a: 'Pass 0 as deleteCount: steps.splice(2, 0, "new") inserts "new" at index 2 and returns []. To insert without changing the original, use steps.toSpliced(2, 0, "new") on Node 20+.' },
      ],
    },
  ],
};

export default topic;
