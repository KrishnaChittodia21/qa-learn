import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-loops-modules-errors',
  phase: 'javascript',
  order: 5,
  title: 'Loops, Modules, npm & Error Handling',
  subtitle:
    'Repeat work with the right loop, split test code into files (modules), understand package.json and npm, and handle errors with try/catch/finally and custom errors. Every Playwright project is built on these basics.',
  estimatedMinutes: 105,
  sources: [
    'javascript.info — Loops: while and for, Iterables, Modules (introduction, export and import), Error handling (try...catch, custom errors)',
    'MDN Web Docs — for...of, for...in, label, JavaScript modules, Error, Error: cause, Date',
    'Node.js docs — Modules: ECMAScript modules, Determining module system ("type" field), Debugging guide (--inspect)',
    'npm Docs — package.json, npm ci, npm install, semver',
    'VS Code docs — Node.js debugging (JavaScript Debug Terminal, breakpoints)',
    'Playwright docs — TypeScript and ESM support, errors.TimeoutError, page.pause, --debug',
    'Marijn Haverbeke — Eloquent JavaScript, Ch 2 Program Structure, Ch 8 Bugs and Errors, Ch 10 Modules',
    'Restful Booker API docs (restful-booker.herokuapp.com/apidoc) — booking payload and date format',
  ],
  tags: ['loops', 'for-of', 'for-in', 'modules', 'esm', 'commonjs', 'npm', 'package-json', 'try-catch', 'custom-errors', 'debugging', 'dates'],
  cheatSheet: [
    '`for (start; condition; step)` when you need the index. Use `i < arr.length`, never `<=` (that reads one item past the end).',
    '`while` = "repeat until something changes" (unknown number of rounds). `do...while` runs at least once. Always make sure the loop can stop.',
    '`for...of` gives VALUES of arrays, strings, Sets, Maps and `locator.all()` results. `for...in` gives KEYS of objects, as strings. Do not use `for...in` on arrays.',
    '`break` leaves the loop. `continue` skips to the next round. A label (`outer:`) lets you break out of two loops. `forEach` supports none of these.',
    'Plain objects are not iterable. Use `Object.keys`, `values` or `entries`: `for (const [k, v] of Object.entries(obj))`.',
    'ES modules: `export function x`, `export default class LoginPage`, `import LoginPage, { x } from \'./file\'`. Named imports must match the name. A default import can use any name.',
    'CommonJS = `require` / `module.exports` (older Node). ESM = `import` / `export` (browsers and modern Node; `.mjs` or `"type": "module"`). Playwright tests use `import`.',
    'package.json: `scripts` (`"test": "playwright test"`), dependencies vs devDependencies (`@playwright/test` is a dev dependency). package-lock.json pins exact versions. CI runs `npm ci`.',
    '`try { risky } catch (err) { handle } finally { always clean up }`. `finally` runs even after `return` or an error. If you cannot handle an error, rethrow it.',
    'Throw Error objects, not strings, so you get a stack trace. For a custom error, extend `Error`, set `this.name`, and pass `{ cause }` to keep the original error.',
    'Debug: `debugger;` plus the VS Code JavaScript Debug Terminal, `node --inspect-brk file.js`, `console.table` for arrays. In Playwright, use `--debug` or `page.pause()`.',
    'Dates: months start at 0 (0 = January). `toISOString().slice(0, 10)` gives "YYYY-MM-DD" in UTC. `Date.now()` makes unique test data. Going past a month end rolls into the next month.',
  ],
  sections: [
    {
      heading: 'The classic for loop',
      body: `    for (let i = 1; i <= 3; i++) {
      console.log('Row ' + i);
    }
    // → Row 1
    // → Row 2
    // → Row 3

A **loop** repeats the same steps. Think of "do these steps for each row of the test data sheet". You write the code once, and the loop runs it many times.

\`for (let i = 1; i <= 3; i++)\` has three parts, split by semicolons:
1. **Start:** \`let i = 1\` runs once, at the beginning.
2. **Condition:** \`i <= 3\` is checked before each round. When it is false, the loop stops.
3. **Step:** \`i++\` adds 1 after each round.

Use this loop when you need the **index** (the position number). For example: "every 3rd item", or counting down.

**Common mistakes**
- **Off by one:** array positions start at 0. So \`i <= arr.length\` reads one item past the end. That item is \`undefined\`, and a sum becomes \`NaN\`. Use \`i < arr.length\`.
- **\`var\` instead of \`let\`:** with \`var\`, the whole loop shares one \`i\`. Code that runs later, like \`setTimeout\`, sees only the last value. \`let\` gives a fresh \`i\` in each round. Always use \`let\`.
- **Endless loop:** you forget \`i++\`, so the condition never becomes false. Press Ctrl+C to stop Node.

**Why testers care:** loops create test data for data-driven tests, like 5 users with unique emails.`,
      code: [
        {
          language: 'javascript',
          title: 'Generating test data with a for loop',
          code: `const users = [];
for (let i = 1; i <= 5; i++) {           // 1..5 inclusive is fine: we are counting, not indexing
  users.push({
    email: 'qa.user' + i + '@example.com',
    role: i % 2 === 0 ? 'admin' : 'buyer', // even → admin, odd → buyer
  });
}
console.log(users.length);               // → 5
console.log(users[1]);                   // → { email: 'qa.user2@example.com', role: 'admin' }

// Walking an array by index: use < length
const prices = [10, 20, 30];
let total = 0;
for (let i = 0; i < prices.length; i++) total += prices[i];
console.log(total);                      // → 60

// Off-by-one bug: <= reads prices[3], which is undefined
let broken = 0;
for (let i = 0; i <= prices.length; i++) broken += prices[i];
console.log(broken);                     // → NaN

// Counting down, stepping by 2
for (let i = 6; i > 0; i -= 2) console.log(i);
// → 6
// → 4
// → 2`,
        },
      ],
      keyPoints: [
        'To walk an array: start at 0 and stop at `i < length`.',
        'Declare the counter with `let`, never `var`.',
        'Make sure the condition can become false.',
      ],
      source: 'javascript.info — Loops: while and for',
    },
    {
      heading: 'while and do...while',
      body: `    let attempts = 0;
    let status = 'pending';
    while (status === 'pending' && attempts < 10) {
      attempts++;
      if (attempts === 3) status = 'done';
    }
    console.log(status, attempts); // → done 3

Use \`while\` when you do not know how many rounds you need. For example: "keep checking while the status is pending".

- \`while (condition) { ... }\` checks first. The body may run **zero** times.
- \`do { ... } while (condition)\` runs the body first, then checks. So it runs **at least once**.

**Always add a limit.** A real system can stay "pending" forever. Then a loop without a limit hangs your test run. A counter like \`attempts < 10\` turns a hang into a clear failure.

**Playwright note:** do not write your own waiting loops in Playwright tests. An assertion like \`await expect(locator).toHaveText('Done')\` already retries until it times out. For other checks, use \`expect.poll()\` or \`expect(...).toPass()\`. Plain \`while\` loops are still useful in data scripts, or to read every page of API results.

**Why testers care:** a retry loop without a limit can hang the whole test run.`,
      code: [
        {
          language: 'javascript',
          title: 'Paging through results and a bounded retry',
          code: `// Fake API: 3 pages of results
const pages = { 1: ['a', 'b'], 2: ['c', 'd'], 3: ['e'] };
const all = [];
let page = 1;
while (pages[page]) {                    // stop when a page does not exist
  all.push(...pages[page]);
  page++;
}
console.log(all);                        // → [ 'a', 'b', 'c', 'd', 'e' ]

// Bounded retry: never loop forever
const statuses = ['pending', 'pending', 'done'];
let attempt = 0;
let status;
do {
  status = statuses[attempt];            // pretend this is a status check
  attempt++;
} while (status !== 'done' && attempt < 10);
console.log(status, attempt);            // → done 3

// do...while runs the body once even if the condition is false
let n = 10;
do { console.log('ran with', n); } while (n < 5); // → ran with 10`,
        },
      ],
      keyPoints: [
        '`while`: unknown number of rounds. It may run zero times.',
        '`do...while`: always runs at least once.',
        'Every retry loop needs a limit (attempts or time).',
      ],
      source: 'javascript.info — Loops: while and for; MDN — do...while',
    },
    {
      heading: 'for...of vs for...in',
      body: `    const browsers = ['chromium', 'firefox'];
    for (const b of browsers) console.log(b);
    // → chromium
    // → firefox
    for (const k in browsers) console.log(k);
    // → 0
    // → 1

\`for...of\` gives you the **values**: the things in the boxes. \`for...in\` gives you the **keys**: the labels on the boxes. For an array, the keys are the positions, and they are strings: '0', '1'.

| | for...of | for...in |
|---|---|---|
| Gives you | values | keys, always as strings |
| Works on | arrays, strings, Sets, Maps | plain objects |
| On \`['a', 'b']\` | \`'a'\`, \`'b'\` | \`'0'\`, \`'1'\` (strings!) |
| On a plain object | TypeError: not iterable | \`'name'\`, \`'role'\` |
| Use it for | arrays and lists (your default) | rarely; prefer \`Object.entries\` |

Things that \`for...of\` can walk through are called **iterable**. Arrays, strings, Sets and Maps are iterable. Plain objects are not.

**Watch out:** \`for...in\` keys are strings. So \`i + 1\` gives \`'01'\`, not \`1\`.

**What about forEach?** \`arr.forEach(fn)\` is fine for simple jobs. But you cannot \`break\` out of it. Also, \`await\` inside it does not pause the loop. In Playwright, write \`for (const item of await list.all()) { await ... }\`.

**In an interview, say:** "for...of gives the values of an array or string. for...in gives the keys of an object as strings, so I don't use it on arrays. For objects I use Object.entries with for...of."

**Why testers care:** \`for...of\` with \`await\` is the safe way to loop over elements in a Playwright test.`,
      code: [
        {
          language: 'javascript',
          title: 'Values vs keys',
          code: `const browsers = ['chromium', 'firefox', 'webkit'];
browsers.extra = 'oops';                 // an array is an object, so it can get extra keys

for (const b of browsers) console.log(b);
// → chromium
// → firefox
// → webkit

for (const k in browsers) console.log(k, typeof k);
// → 0 string
// → 1 string
// → 2 string
// → extra string

// Trap: the keys are strings, so + joins text
for (const i in [10, 20]) console.log(i + 1);
// → 01
// → 11

// for...of works on strings, Sets and Maps too
for (const ch of 'QA') console.log(ch);
// → Q
// → A
for (const [name, ms] of new Map([['login', 1200], ['cart', 800]])) {
  console.log(name, ms);
}
// → login 1200
// → cart 800

// Plain objects are not iterable
try {
  for (const x of { a: 1 }) console.log(x);
} catch (e) {
  console.log(e.name);                           // → TypeError
}`,
        },
      ],
      keyPoints: [
        '`for...of` gives values. `for...in` gives keys, as strings.',
        'Do not use `for...in` on arrays.',
        'In async test code, `for...of` with `await` is the safe loop.',
      ],
      source: 'MDN Web Docs — for...of, for...in; javascript.info — Iterables',
    },
    {
      heading: 'break, continue and labels',
      body: `    const results = ['pass', 'skip', 'fail', 'pass'];
    for (const r of results) {
      if (r === 'skip') continue;
      if (r === 'fail') break;
      console.log('checked', r);
    }
    // → checked pass

- \`continue\` skips the rest of this round and moves to the next one.
- \`break\` stops the loop completely.

Here, 'skip' was skipped, and 'fail' stopped the loop. So the last 'pass' was never checked.

**Labels** give an outer loop a name. Inside two loops, \`break rows\` leaves both loops at once. You will rarely need this. It is handy for "find the first empty cell in a table".

**forEach, map and filter cannot break.** To stop at the first match, use \`for...of\` with \`break\`. Or use \`find\`, \`some\` or \`findIndex\`. They stop early on their own.

**Watch out:** \`return\` inside a \`forEach\` callback does not stop the loop. It only ends that one call. The loop goes on with the next item.

**Why testers care:** you can stop at the first failure to save time, or skip rows that do not apply.`,
      code: [
        {
          language: 'javascript',
          title: 'Skipping, stopping, and escaping nested loops',
          code: `const results = ['pass', 'skip', 'pass', 'fail', 'pass'];

for (const r of results) {
  if (r === 'skip') continue;            // ignore skipped tests
  if (r === 'fail') { console.log('stop: first failure'); break; }
  console.log('checked', r);
}
// → checked pass
// → checked pass
// → stop: first failure

// return inside forEach does NOT stop the loop
results.forEach((r) => {
  if (r === 'fail') return;              // only skips this one item
  // ...still runs for the last 'pass'
});

// Labels: find the first empty cell in a table
const table = [
  ['Asha', 'admin'],
  ['Ravi', ''],
  ['', 'buyer'],
];
let found = null;
rows: for (let r = 0; r < table.length; r++) {
  for (let c = 0; c < table[r].length; c++) {
    if (table[r][c] === '') { found = [r, c]; break rows; }
  }
}
console.log(found);                      // → [ 1, 1 ]`,
        },
      ],
      keyPoints: [
        '`continue` skips one round. `break` ends the loop.',
        'A labelled break leaves nested loops in one step.',
        'Use `find`, `some` or `for...of` with `break` to stop early.',
      ],
      source: 'MDN Web Docs — break, continue, label',
    },
    {
      heading: 'Looping over objects',
      body: `    const user = { name: 'Asha', role: 'admin' };
    for (const [key, value] of Object.entries(user)) {
      console.log(key + ' = ' + value);
    }
    // → name = Asha
    // → role = admin

A plain object is not iterable. So \`for...of\` cannot walk it directly. First, turn it into a list.

| Need | Use | Gives |
|---|---|---|
| field names | \`Object.keys(obj)\` | \`['name', 'role']\` |
| field values | \`Object.values(obj)\` | \`['Asha', 'admin']\` |
| both | \`Object.entries(obj)\` | \`[['name', 'Asha'], ['role', 'admin']]\` |
| back to an object | \`Object.fromEntries(pairs)\` | \`{ name: 'Asha', role: 'admin' }\` |

\`Object.entries\` plus \`for...of\` is the clearest way to loop over an object. \`[key, value]\` unpacks each pair into two variables.

**Testing uses**
- Fill a form from a data object. Loop over the pairs and fill each field by its label.
- Compare an API response with the expected values, field by field. Collect every mismatch, instead of stopping at the first one.
- Count the keys: \`Object.keys(obj).length\`.

**Why testers care:** one report that lists every wrong field is more useful than a test that stops at the first.`,
      code: [
        {
          language: 'javascript',
          title: 'Field-by-field comparison of an API response',
          code: `const expected = { firstname: 'Asha', lastname: 'Rao', totalprice: 150, depositpaid: true };
const actual   = { firstname: 'Asha', lastname: 'Roa', totalprice: '150', depositpaid: true };

const mismatches = [];
for (const [field, want] of Object.entries(expected)) {
  const got = actual[field];
  if (got !== want) mismatches.push(field + ': expected ' + JSON.stringify(want) + ', got ' + JSON.stringify(got));
}
console.log(mismatches);
// → [ 'lastname: expected "Rao", got "Roa"', 'totalprice: expected 150, got "150"' ]

console.log(Object.keys(expected));       // → [ 'firstname', 'lastname', 'totalprice', 'depositpaid' ]
console.log(Object.values(expected).length); // → 4

// Transform an object: uppercase every string value
const shout = Object.fromEntries(
  Object.entries({ a: 'x', b: 'y' }).map(([k, v]) => [k, v.toUpperCase()]),
);
console.log(shout);                       // → { a: 'X', b: 'Y' }

// In Playwright (inside an async test):
// for (const [label, value] of Object.entries(formData)) {
//   await page.getByLabel(label).fill(value);
// }`,
        },
      ],
      keyPoints: [
        'Plain objects are not iterable. Use `Object.keys`, `Object.values` or `Object.entries`.',
        '`for (const [key, value] of Object.entries(obj))` is the clearest object loop.',
        'Collect all mismatches before failing, for a more useful report.',
      ],
      source: 'javascript.info — Object.keys, values, entries',
    },
    {
      heading: 'ES modules: export and import',
      body: `    // file: helpers.js
    export const BASE_URL = 'https://www.saucedemo.com';
    export function add(a, b) { return a + b; }

    // file: login.spec.js
    import { BASE_URL, add } from './helpers.js';
    console.log(add(2, 3)); // → 5

A **module** is one JavaScript file that shares code with other files.
- \`export\` marks what other files may use.
- \`import\` brings it into another file.

Every Playwright project works like this. Test files import \`test\` and \`expect\` from \`@playwright/test\`. They also import your page objects and helpers.

**Two kinds of export**

| | Named export | Default export |
|---|---|---|
| Write | \`export function login() {}\` | \`export default class LoginPage {}\` |
| Import | \`import { login } from './helpers'\` | \`import LoginPage from './LoginPage'\` |
| How many per file | any number | one at most |
| Name when importing | must match (rename with \`as\`) | any name you like |

**Rules worth knowing**
- Put imports at the top of the file. The path is a plain string.
- A module's code runs **once**, the first time it is imported. Every file that imports it shares the same exported objects. So if a helper module keeps data that tests change, tests in the same worker see each other's changes.
- Modules always use **strict mode**, which has stricter rules. For example, using a variable you never declared throws a ReferenceError.
- In plain Node, a relative import needs the file extension: \`'./utils.js'\`. Playwright's TypeScript tests let you leave it out.

**Team habit:** many teams prefer named exports. The editor then checks the name and auto-imports it correctly.

**Why testers care:** page objects, fixtures and helpers all live in separate modules, so you import and export all day.`,
      code: [
        {
          language: 'typescript',
          title: 'A small Playwright project split into modules',
          code: `// ---- utils/data.ts ----
export const BASE_URL = 'https://www.saucedemo.com';
export function uniqueEmail(prefix = 'qa') {
  return prefix + '+' + Date.now() + '@example.com';
}

// ---- pages/LoginPage.ts ----
import type { Page } from '@playwright/test';
export default class LoginPage {
  constructor(private page: Page) {}
  async login(user: string, pass: string) {
    await this.page.getByPlaceholder('Username').fill(user);
    await this.page.getByPlaceholder('Password').fill(pass);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}

// ---- tests/login.spec.ts ----
import { test, expect } from '@playwright/test';  // named imports from a package
import LoginPage from '../pages/LoginPage';        // default import (any name works)
import { BASE_URL as APP } from '../utils/data';   // named import renamed with "as"

test('standard user lands on inventory', async ({ page }) => {
  await page.goto(APP);
  await new LoginPage(page).login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/inventory/);
});`,
        },
      ],
      keyPoints: [
        'Named exports: many per file, imported with `{ }` and the exact name.',
        'Default export: one per file, imported without `{ }`, under any name.',
        'A module runs once, so its data is shared by every file that imports it.',
      ],
      source: 'javascript.info — Modules: export and import; Playwright docs — TypeScript',
    },
    {
      heading: 'CommonJS vs ES modules, npm and package.json',
      body: `    // math.cjs (CommonJS, the older style)
    function add(a, b) { return a + b; }
    module.exports = { add };
    // app.cjs
    const { add } = require('./math.cjs');
    console.log(add(2, 3)); // → 5

    // math.mjs (ES module, the modern style)
    export function add(a, b) { return a + b; }
    // app.mjs
    import { add } from './math.mjs';
    console.log(add(2, 3)); // → 5

Node has two ways to share code between files.
- **CommonJS** is the older one. It uses \`require\` and \`module.exports\`.
- **ES modules** (ESM) are the official modern one. They use \`import\` and \`export\`.

Both still exist, and mixing them gives confusing errors.

| | CommonJS | ES modules |
|---|---|---|
| Import | \`require('x')\` | \`import x from 'x'\` |
| Export | \`module.exports = {...}\` | \`export\` / \`export default\` |
| Node uses it for | \`.cjs\` files, or \`.js\` without \`"type": "module"\` | \`.mjs\` files, or \`.js\` with \`"type": "module"\` in package.json |
| \`await\` at the top of a file | no | yes |
| \`__dirname\` | yes | no; use \`import.meta.dirname\` (Node 20.11+) |

**Two errors you will meet**
- "require is not defined in ES module scope": you used \`require\` in an ESM file.
- "Cannot use import statement outside a module": you used \`import\` in a CommonJS file.

The fix: pick one style for the project. Then set \`"type"\` in package.json, or the file extension, to match.

**npm and package.json**

**package.json** is the shopping list of your project. **npm** is the tool that installs what is on the list.
- \`npm init playwright@latest\` creates a new Playwright project.
- \`dependencies\` are needed by the app when it runs. \`devDependencies\` are tools for building and testing. \`@playwright/test\` is a dev dependency: \`npm i -D @playwright/test\`.
- \`"scripts"\`: with \`"test": "playwright test"\`, anyone can run \`npm test\`. Run other scripts with \`npm run <name>\`.
- Versions look like \`1.48.0\`: major.minor.patch. This system is called **semver**. \`^1.48.0\` allows any newer 1.x version.
- **package-lock.json** records the exact versions that were installed. Commit it to git.
- \`npm install\` may update the lock file. **\`npm ci\`** installs exactly what the lock file says. CI pipelines should use \`npm ci\`.
- \`npx playwright test\` runs a tool from your project without a global install.
- Never commit \`node_modules\`. List it in \`.gitignore\`.

**Why testers care:** \`npm ci\` gives your laptop and the CI server the same versions. So a test that passes for you also passes in CI.`,
      code: [
        {
          language: 'json',
          title: 'package.json for a Playwright project',
          code: `{
  "name": "saucedemo-e2e",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:headed": "playwright test --headed",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.0.0",
    "dotenv": "^16.4.5"
  }
}`,
        },
        {
          language: 'javascript',
          title: 'The same helper in CommonJS and in ESM',
          code: `// ---- math.cjs (CommonJS) ----
function add(a, b) { return a + b; }
module.exports = { add };

// ---- app.cjs ----
const { add } = require('./math.cjs');
console.log(add(2, 3));                  // → 5

// ---- math.mjs (ES module) ----
export function multiply(a, b) { return a * b; }

// ---- app.mjs ----
import { multiply } from './math.mjs';   // extension required in plain Node ESM
console.log(multiply(2, 3));             // → 6
console.log(typeof require);             // → undefined (no require in ESM)`,
        },
      ],
      keyPoints: [
        'CommonJS: `require` and `module.exports`. ESM: `import` and `export`. Pick one per project.',
        '`"type": "module"` in package.json makes `.js` files ES modules.',
        'Commit package-lock.json. CI runs `npm ci`. `@playwright/test` is a dev dependency.',
      ],
      source: 'Node.js docs — Modules: ECMAScript modules, packages ("type"); npm Docs — package.json, npm ci',
    },
    {
      heading: 'try, catch and finally',
      body: `    try {
      console.log('start');
      JSON.parse('{bad');
      console.log('never runs');
    } catch (err) {
      console.log('caught', err.name);
    } finally {
      console.log('cleanup');
    }
    // → start
    // → caught SyntaxError
    // → cleanup

- \`try\` holds the risky code. It runs until something **throws** an error.
- JavaScript then jumps straight to \`catch (err)\`. The rest of \`try\` is skipped. That is why "never runs" did not print.
- \`finally\` **always** runs: after success, after an error, and even after a \`return\` inside \`try\`. Use it for cleanup, like logging out or deleting test data.
- If you do not need the error, you can write \`catch { ... }\` without \`(err)\`.

**Watch out**
- Never \`return\` from \`finally\`. It replaces the earlier return value, and it even hides errors.
- \`try/catch\` only catches errors thrown **while the try block runs**. An error thrown later, for example inside \`setTimeout\`, is not caught. A promise is caught only if you \`await\` it inside the \`try\`. The async topic explains this.

**The tester's golden rule:** do not wrap assertions in try/catch just to log them. \`expect\` fails a test by throwing an error. If you catch it and carry on, the test is reported as **passed**. Catch an error only when you can really handle it: retry, add a clearer message, or clean up. Otherwise **rethrow** it, which means throw it again.

**Cleanup in Playwright:** the usual place is a fixture (the code after \`use()\`) or \`afterEach\`. Inside one test, \`try/finally\` is a clear way to delete a booking you created through the API.

**Why testers care:** a caught and ignored assertion error turns a failing test into a passing one.`,
      diagram: `  try { step1; step2 (throws!); step3 }   catch (e) { ... }   finally { ... }
        |        |                   ^           |                    |
        ok       +--- jumps ---------+           +-------> always ----+
                    (step3 is skipped)            then code after the block`,
      code: [
        {
          language: 'javascript',
          title: 'Order of execution and the swallowed-assertion bug',
          code: `function parsePrice(text) {
  try {
    console.log('try start');
    const n = Number(text.replace('$', ''));   // throws if text is null
    console.log('parsed');
    return n;
  } catch (err) {
    console.log('caught:', err.name);
    return null;
  } finally {
    console.log('finally');                    // runs in BOTH cases
  }
}
console.log(parsePrice('$9.99'));
// → try start
// → parsed
// → finally
// → 9.99
console.log(parsePrice(null));
// → try start
// → caught: TypeError
// → finally
// → null

// BUG: swallowing an assertion error makes a failing check "pass"
function assertEqual(a, b) { if (a !== b) throw new Error(a + ' !== ' + b); }
try {
  assertEqual(2, 3);
} catch (e) {
  console.log('logged and ignored:', e.message);  // → logged and ignored: 2 !== 3 (the test runner never sees it)
}
// Fix: catch only to add context, then rethrow
try {
  assertEqual(2, 3);
} catch (e) {
  throw new Error('Cart count check failed', { cause: e }); // fails loudly, keeps the original
}`,
        },
      ],
      keyPoints: [
        '`finally` always runs. Use it for cleanup, never for `return`.',
        'Catching an assertion error without rethrowing turns a failure into a pass.',
        '`try/catch` only catches errors thrown while `try` runs, so `await` promises inside it.',
      ],
      source: 'javascript.info — Error handling, "try...catch"; MDN — try...catch',
    },
    {
      heading: 'throw, Error types and custom errors',
      body: `    try {
      throw new Error('Cart is empty');
    } catch (err) {
      console.log(err.name);    // → Error
      console.log(err.message); // → Cart is empty
    }

\`throw\` stops the code and reports a problem. The error object has three useful parts:
- **name**: what kind of error it is.
- **message**: what happened.
- **stack**: where it happened (file and line).

**Built-in error types you will see**

| Error | Usual cause | Example |
|---|---|---|
| \`TypeError\` | using a value the wrong way | \`null.length\`, or calling something that is not a function |
| \`ReferenceError\` | the variable does not exist | a typo: \`pagee.goto()\` |
| \`SyntaxError\` | broken code or broken JSON | \`JSON.parse('{bad')\` |
| \`RangeError\` | a number outside the allowed range | \`new Array(-1)\` |
| \`AggregateError\` | several errors at once | \`Promise.any\` when every promise fails |
| Playwright \`TimeoutError\` | an action or wait took too long | the element never became visible |

**Always throw Error objects, not strings.** \`throw 'failed'\` has no stack and no name, so reports become useless.

**Custom errors** make failures easy to read. Callers can also check the type with \`instanceof\`.

    class ApiError extends Error {
      constructor(message, status) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
      }
    }
    const e = new ApiError('Not found', 404);
    console.log(e.name, e.status, e instanceof Error); // → ApiError 404 true

The steps are:
1. Extend \`Error\`.
2. Call \`super(message)\` first.
3. Set \`this.name\`. Without it, the error shows as plain "Error".
4. Add useful fields, like \`status\` and \`url\`.

**Keep the original error with \`cause\`:** \`new Error('Login step failed', { cause: err })\` adds context. The original \`err\` stays available as \`.cause\`.

Playwright exports \`errors.TimeoutError\` from \`@playwright/test\`. So you can check \`err instanceof errors.TimeoutError\` when a timeout is an expected result.

**Why testers care:** a clear error like "ApiError 404 on /booking/999" saves debugging time when a test fails in CI.`,
      code: [
        {
          language: 'javascript',
          title: 'A custom ApiError with status and cause',
          code: `class ApiError extends Error {
  constructor(message, { status, url, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

function checkResponse(res) {
  if (res.status >= 400) {
    throw new ApiError('Request failed with ' + res.status, { status: res.status, url: res.url });
  }
  return res;
}

try {
  checkResponse({ status: 404, url: '/booking/999' });
} catch (err) {
  console.log(err instanceof ApiError, err instanceof Error); // → true true
  console.log(err.name, err.status, err.url);   // → ApiError 404 /booking/999
  console.log(String(err));                     // → ApiError: Request failed with 404
}

// Built-in types
try { JSON.parse('{bad'); } catch (e) { console.log(e.name); }  // → SyntaxError
try { null.length; } catch (e) { console.log(e.name); }         // → TypeError
try { undefinedVar; } catch (e) { console.log(e.name); }        // → ReferenceError

// Wrapping with cause keeps the root problem
const wrapped = new Error('Login step failed', { cause: new Error('401 Unauthorized') });
console.log(wrapped.cause.message);             // → 401 Unauthorized`,
        },
      ],
      keyPoints: [
        '`throw new Error(...)`, never a string, to keep the name, message and stack.',
        'Custom errors: extend `Error`, call `super`, set `this.name`, add fields.',
        'Use `{ cause }` to add context without losing the original error.',
      ],
      source: 'javascript.info — Custom errors, extending Error; MDN — Error.prototype.cause; Playwright docs — errors.TimeoutError',
    },
    {
      heading: 'Debugging in VS Code and Node',
      body: `    function totalOf(prices) {
      let sum = 0;
      for (const p of prices) sum += p;
      return sum;
    }
    console.log(totalOf([1, 2, '3'])); // → 33

The answer should be 6, but it is 33. Why? \`1 + 2\` is 3. Then \`3 + '3'\` joins two pieces of text and gives '33'. A **debugger** helps you find bugs like this. It pauses the program on a line. Then you can look at every variable and move forward one line at a time.

**A toolkit, from quick to powerful**
1. **Read the error.** The first line gives the error type and message. Below it, the **stack trace** lists file:line places, newest first. Click the first line that points to **your** code.
2. **console helpers:** \`console.log('label', value)\` (always add a label!), \`console.table(list)\` for arrays of objects, \`console.dir(obj, { depth: null })\` for nested JSON, and \`console.time('x')\` with \`console.timeEnd('x')\` to measure time.
3. **Breakpoints in VS Code:** click left of a line number to add a red dot. Open a **JavaScript Debug Terminal** (Command Palette → "JavaScript Debug Terminal"). Run \`node script.js\` or \`npx playwright test\` there. The code pauses at your red dots.
4. **\`debugger;\`** written in the code pauses there when a debugger is attached.
5. **Node inspector:** \`node --inspect-brk script.js\` pauses on the first line. Attach from VS Code or chrome://inspect.
6. **Playwright tools:** \`npx playwright test --debug\` opens the Inspector and steps through actions. \`await page.pause()\` pauses at one point. The VS Code Playwright extension runs one test with breakpoints.

**While paused:** hover over variables. Use the **Watch** panel and the **Call Stack**. Step Over (F10), Step Into (F11) and Continue (F5).

**In an interview, describe your habit:** make the bug happen with the smallest input. Guess the cause. Prove it in the debugger. Fix it. Then add a test that would have caught it.

**Why testers care:** reading the stack trace and pausing on the right line finds a bug much faster than guessing.`,
      code: [
        {
          language: 'javascript',
          title: 'debugger, console.table and timing',
          code: `const users = [
  { name: 'standard_user', locked: false },
  { name: 'locked_out_user', locked: true },
];
console.table(users);
// ┌─────────┬───────────────────┬────────┐
// │ (index) │ name              │ locked │
// ├─────────┼───────────────────┼────────┤
// │ 0       │ 'standard_user'   │ false  │
// │ 1       │ 'locked_out_user' │ true   │
// └─────────┴───────────────────┴────────┘

function totalOf(prices) {
  let sum = 0;
  for (const p of prices) {
    debugger;                    // pauses here when run in a JavaScript Debug Terminal
    sum += p;
  }
  return sum;
}

console.time('sum');
console.log(totalOf([1, 2, '3']));  // → 33 (the debugger shows sum turning into the string '33')
console.timeEnd('sum');             // prints the time taken, e.g. sum: 0.05ms

// Run with:  node --inspect-brk debug-me.js   (then attach from VS Code)
// Playwright: npx playwright test login.spec.ts --debug`,
        },
      ],
      keyPoints: [
        'Read the stack trace from the top, and jump to the first line in your own code.',
        'A JavaScript Debug Terminal plus breakpoints works for `node` and `npx playwright test`.',
        'Label every `console.log`. Use `console.table` for arrays of objects.',
      ],
      source: 'VS Code docs — Node.js debugging; Node.js docs — Debugging guide; Playwright docs — Debugging tests',
    },
    {
      heading: 'Dates for test data',
      body: `    const d = new Date('2026-10-14T00:00:00Z');
    console.log(d.toISOString().slice(0, 10));     // → 2026-10-14
    console.log(new Date(2026, 0, 31).getMonth()); // → 0
    console.log(typeof Date.now());                // → number

Dates cause many "works on my machine" bugs. The usual causes are time zones, months that start at 0, and month-end surprises. Learn a few safe recipes.

- \`new Date()\` is "now". \`Date.now()\` is now as a number: milliseconds since 1 January 1970. It is great for unique test data.
- **Months start at 0.** \`new Date(2026, 0, 31)\` is 31 January. Days of the month start at 1.
- \`toISOString()\` gives text like '2026-10-14T09:30:00.000Z' in **UTC** (world standard time). \`.slice(0, 10)\` keeps 'YYYY-MM-DD'. Many APIs want this format, like Restful Booker check-in dates.
- Dates **roll over**. \`setDate(32)\` moves into the next month. "31 January + 1 month" becomes 3 March. This helps for "add N days", but it is risky for "add a month".
- **Local time vs UTC:** \`getDate()\` uses your computer's time zone. \`getUTCDate()\` uses UTC. A CI server in UTC and a laptop in India (UTC+5:30) can disagree about "today" near midnight. Use UTC for dates you send to APIs.
- Setters like \`setDate\` change the Date object itself. Copy it first: \`new Date(base)\`.

**Recipes:** a unique email, \`'qa+' + Date.now() + '@example.com'\`. "Tomorrow" and "in 3 days" for a booking. A birth date exactly 18 years ago for an age-limit test.

**Why testers care:** fixed dates expire, and time zones can shift a date by one day. Both make tests fail only on some days or machines.`,
      code: [
        {
          language: 'javascript',
          title: 'Booking dates and unique data',
          code: `// YYYY-MM-DD in UTC, N days from a base date
function isoDatePlus(days, base = new Date()) {
  const d = new Date(base);                // copy first: setters change the date
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const base = new Date('2026-10-14T00:00:00Z');
console.log(isoDatePlus(1, base));         // → 2026-10-15
console.log(isoDatePlus(30, base));        // → 2026-11-13  (rolls into November)

const booking = {
  firstname: 'Asha',
  lastname: 'Rao',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: isoDatePlus(1, base), checkout: isoDatePlus(4, base) },
  additionalneeds: 'Breakfast',
};
console.log(booking.bookingdates);         // → { checkin: '2026-10-15', checkout: '2026-10-18' }

// Months are 0-based
console.log(new Date(2026, 0, 31).getMonth()); // → 0  (January)

// Overflow surprise: 31 Jan + 1 month
const d = new Date(2026, 0, 31);
d.setMonth(1);                             // "February 31st" does not exist...
console.log(d.toDateString());             // → Tue Mar 03 2026

// Unique per run
console.log(typeof Date.now());            // → number
const email = 'qa+' + Date.now() + '@example.com';  // e.g. 'qa+1791963000000@example.com'`,
        },
      ],
      keyPoints: [
        'Month 0 is January. `toISOString` uses UTC.',
        'Copy a Date before calling setters, because they change it.',
        'Use UTC helpers for API dates, so CI and laptops agree.',
      ],
      source: 'MDN Web Docs — Date; javascript.info — Date and time; Restful Booker API docs',
    },
  ],
  codeChallenges: [
    {
      id: 'js-loops-modules-errors-cc-1',
      title: 'The test-data script that lies',
      context:
        'A script builds users for a data-driven signup test. It also checks a list of order IDs. It seems to work, but the test data is slightly wrong, and the check never reports problems.',
      task: 'Fix the loop and checking bugs in `makeData(roles, orderIds)`. It returns `{ users, problems }`. `users` has exactly one user per role, like `{ email: \'user1@example.com\', role }`, numbered from 1. `problems` has one message per bad order ID, in the form `row N: invalid id "<id>"`, where N starts at 1. Good IDs look like `A-123`. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'make-data.js',
        code: `function makeData(roles, orderIds) {
  const users = [];
  for (var i = 0; i <= roles.length; i++) {
    users.push({ email: 'user' + i + '@example.com', role: roles[i] });
  }

  const problems = [];
  for (const index in orderIds) {
    const id = orderIds[index];
    if (!/^A-\\d{3}$/.test(id)) {
      problems.push('row ' + index + 1 + ': invalid id "' + id + '"');
      break;
    }
  }
  orderIds.forEach((id) => {
    if (id === '') return 'empty!';    // meant to stop the run
  });
  return { users, problems };
}

// makeData(['buyer', 'admin', 'support'], ['A-100', 'A-101', '', 'A-1O3'])  // letter O, not zero
// → 4 users (the last with role undefined) and only 1 problem: 'row 21: invalid id ""'
//   (expected 3 users and 2 problems)`,
      },
      hints: [
        'How many times does the first loop run for 3 roles? What is roles[3]?',
        'What type is `index` in a for...in loop? What does "row " + index + 1 give?',
        'Should the check stop at the first bad ID? What does a return inside a forEach callback do?',
      ],
      solution: {
        language: 'javascript',
        title: 'make-data.js (fixed)',
        code: `const ID_PATTERN = /^A-\\d{3}$/;

function makeData(roles, orderIds) {
  // Build users: one per role, index-aware, no off-by-one
  const users = roles.map((role, i) => ({ email: 'user' + (i + 1) + '@example.com', role }));

  // Collect EVERY problem with a real row number (1-based for humans)
  const problems = [];
  for (const [i, id] of orderIds.entries()) {
    if (!ID_PATTERN.test(id)) problems.push('row ' + (i + 1) + ': invalid id "' + id + '"');
  }
  return { users, problems };
}

// makeData(['buyer', 'admin', 'support'], ['A-100', 'A-101', '', 'A-1O3'])
// → users: 3 (the last is { email: 'user3@example.com', role: 'support' })
//   problems: ['row 3: invalid id ""', 'row 4: invalid id "A-1O3"']

// The caller fails the run loudly instead of returning a string nobody reads:
// const { problems } = makeData(roles, orderIds);
// if (problems.length > 0) {
//   throw new Error(problems.length + ' invalid order ids:\\n' + problems.join('\\n'));
// }`,
      },
      explanation: `**Fixes:**

1. **\`i <= roles.length\`** ran 4 times, so the 4th user had \`role: undefined\`. Use \`< length\`. Even better, use \`map\` over the roles, so the count always matches.
2. **\`var i\`** is shared by the whole loop and leaks out of it. Use \`let\`, or no counter at all with \`map\`.
3. **for...in gives string keys.** So \`'row ' + index + 1\` printed "row 21" instead of "row 3". Use \`for...of\` with \`entries()\` to get a number index. Also put the maths in brackets before joining text: \`(i + 1)\`.
4. **\`break\` after the first problem** hid the second bad ID. A checker should collect all problems, so one run shows the full picture.
5. **Returning a value from a forEach callback does nothing.** It does not stop the loop, and nobody sees the value. Collect the problems, then \`throw\` an Error so the script or test fails with a clear message. (In the lab, \`makeData\` returns the problems and the caller throws.)`,
      fnName: 'makeData',
      tests: [
        {
          args: [['buyer', 'admin', 'support'], ['A-100', 'A-101', '', 'A-1O3']],
          expected: { users: [{ email: 'user1@example.com', role: 'buyer' }, { email: 'user2@example.com', role: 'admin' }, { email: 'user3@example.com', role: 'support' }], problems: ['row 3: invalid id ""', 'row 4: invalid id "A-1O3"'] },
        },
        {
          args: [['buyer'], ['A-100']],
          expected: { users: [{ email: 'user1@example.com', role: 'buyer' }], problems: [] },
        },
        {
          args: [[], []],
          expected: { users: [], problems: [] },
        },
        {
          args: [['admin', 'support'], ['X-100', 'A-200', 'A-20']],
          expected: { users: [{ email: 'user1@example.com', role: 'admin' }, { email: 'user2@example.com', role: 'support' }], problems: ['row 1: invalid id "X-100"', 'row 3: invalid id "A-20"'] },
        },
        {
          args: [['buyer', 'admin'], ['A-100', 'A-101', 'A-102']],
          expected: { users: [{ email: 'user1@example.com', role: 'buyer' }, { email: 'user2@example.com', role: 'admin' }], problems: [] },
        },
        {
          args: [['support'], ['XA-1000Y', 'A-999']],
          expected: { users: [{ email: 'user1@example.com', role: 'support' }], problems: ['row 1: invalid id "XA-1000Y"'] }, hidden: true,
        },
        {
          args: [['buyer'], ['A-100', 'A-100', 'A-100', 'A-100', 'A-100', 'A-100', 'A-100', 'A-100', 'A-100', 'A-100', '']],
          expected: { users: [{ email: 'user1@example.com', role: 'buyer' }], problems: ['row 11: invalid id ""'] }, hidden: true,
        },
      ],
      followUps: [
        {
          q: 'Why use a regex with ^ and $ for the ID check?',
          a: 'Without ^ and $, /A-\\d{3}/ would accept "XA-1000Y", because it only needs to find the pattern somewhere inside the text. ^ and $ make the whole value match. The regex also catches the letter O typed instead of a zero, which a simple startsWith("A-") check would miss.',
        },
        {
          q: 'How would you turn this into a Playwright data-driven test?',
          a: 'Export the users array from a data file. Then loop at the top level of the spec: for (const user of users) { test("signup as " + user.role, async ({ page }) => { ... }); }. Each round adds a separate test with its own name, so the report shows which role failed, and the tests can run in parallel.',
        },
      ],
    },
    {
      id: 'js-loops-modules-errors-cc-2',
      title: 'A booking helper that hides failures',
      context:
        'Several Playwright specs import this helper file to create and delete Restful Booker bookings. When the API is down, tests fail much later with confusing "Cannot read properties of undefined" errors. Also, test bookings pile up on the server.',
      task: 'Fix `createBooking` and `withBooking`. Failures must be reported at once with a clear error of its own type: an `ApiError` with the message `POST /booking failed: <status> <response text>`. Any 2xx status counts as success. Cleanup must always run and must send the auth token. The tests call `async runScenario(createStatus, testFails)`. It runs one "spec" through `withBooking` against a fake `request` (no network). It returns `{ outcome, calls }`: `\'passed\'` or `\'<ErrorName>: <message>\'`, plus the list of requests and test steps, in order. You do not need to change the lab harness at the bottom. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'bookingHelper.js (in a "type": "module" project)',
        code: `const BASE = 'https://restful-booker.herokuapp.com';

async function createBooking(request, data) {
  try {
    const res = await request.post(BASE + '/booking', { data });
    if (res.status() != 200) throw 'create failed';
    return (await res.json()).bookingid;
  } catch (e) {
    console.log('oops', e);          // and carry on...
  }
}

async function withBooking(request, token, data, testBody) {
  const id = await createBooking(request, data);
  await testBody(id);
  await request.delete(BASE + '/booking/' + id);   // skipped if testBody throws
}

// (in the real file: module.exports = { createBooking, withBooking };
//  left out here because the lab runs as a plain script)

// ---- lab harness: a fake Playwright \`request\` (no need to change below) ----
const STATUS_TEXT = { 200: 'OK', 201: 'Created', 404: 'Not Found', 500: 'Internal Server Error', 503: 'Service Unavailable' };
function fakeRequest(createStatus, calls) {
  const response = (status, body) => ({
    status: () => status,
    ok: () => status >= 200 && status < 300,
    json: async () => body,
    text: async () => STATUS_TEXT[status] ?? '',
  });
  return {
    post: async (url) => {
      calls.push('POST ' + url.replace(BASE, ''));
      return response(createStatus, { bookingid: 42 });
    },
    delete: async (url, opts) => {
      const cookie = opts && opts.headers && opts.headers.Cookie;
      calls.push('DELETE ' + url.replace(BASE, '') + (cookie ? ' (' + cookie + ')' : ' (no auth)'));
      return response(cookie ? 201 : 403, {});
    },
  };
}

// Entry point the tests call: one spec that uses a booking
async function runScenario(createStatus, testFails) {
  const calls = [];
  const request = fakeRequest(createStatus, calls);
  let outcome = 'passed';
  try {
    await withBooking(request, 'abc123', { firstname: 'Jim' }, async (id) => {
      calls.push('test uses booking ' + id);
      if (testFails) throw new Error('assertion failed');
    });
  } catch (e) {
    outcome = e instanceof Error ? e.name + ': ' + e.message : 'non-Error thrown: ' + String(e);
  }
  return { outcome, calls };
}`,
      },
      hints: [
        'What does createBooking return when the POST fails? Where will that problem show up?',
        'What is missing from a thrown string, compared to an Error object?',
        'Which block runs even if testBody throws? And which export style matches "type": "module"?',
      ],
      solution: {
        language: 'javascript',
        title: 'bookingHelper.js (fixed)',
        code: `const BASE = 'https://restful-booker.herokuapp.com';

class ApiError extends Error {
  constructor(message, { status, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status;
  }
}

async function createBooking(request, data) {
  const res = await request.post(BASE + '/booking', { data });
  if (!res.ok()) {
    throw new ApiError('POST /booking failed: ' + res.status() + ' ' + (await res.text()), {
      status: res.status(),
    });
  }
  const body = await res.json();
  return body.bookingid;
}

async function withBooking(request, token, data, testBody) {
  const id = await createBooking(request, data);   // throws early with a clear message
  try {
    await testBody(id);
  } finally {
    // runs whether testBody passed or threw; the original error still propagates
    await request.delete(BASE + '/booking/' + id, { headers: { Cookie: 'token=' + token } });
  }
}

// In the real file every helper is exported with ES module syntax
// (export class ApiError, export async function createBooking, ...);
// the keywords are left out here because the lab runs as a plain script.

// ---- lab harness: a fake Playwright \`request\` (no need to change below) ----
const STATUS_TEXT = { 200: 'OK', 201: 'Created', 404: 'Not Found', 500: 'Internal Server Error', 503: 'Service Unavailable' };
function fakeRequest(createStatus, calls) {
  const response = (status, body) => ({
    status: () => status,
    ok: () => status >= 200 && status < 300,
    json: async () => body,
    text: async () => STATUS_TEXT[status] ?? '',
  });
  return {
    post: async (url) => {
      calls.push('POST ' + url.replace(BASE, ''));
      return response(createStatus, { bookingid: 42 });
    },
    delete: async (url, opts) => {
      const cookie = opts && opts.headers && opts.headers.Cookie;
      calls.push('DELETE ' + url.replace(BASE, '') + (cookie ? ' (' + cookie + ')' : ' (no auth)'));
      return response(cookie ? 201 : 403, {});
    },
  };
}

// Entry point the tests call: one spec that uses a booking
async function runScenario(createStatus, testFails) {
  const calls = [];
  const request = fakeRequest(createStatus, calls);
  let outcome = 'passed';
  try {
    await withBooking(request, 'abc123', { firstname: 'Jim' }, async (id) => {
      calls.push('test uses booking ' + id);
      if (testFails) throw new Error('assertion failed');
    });
  } catch (e) {
    outcome = e instanceof Error ? e.name + ': ' + e.message : 'non-Error thrown: ' + String(e);
  }
  return { outcome, calls };
}`,
      },
      explanation: `**Fixes:**

1. **The catch hid the error.** The function returned \`undefined\`, and the failure showed up later as an unrelated TypeError. Let it throw (no try/catch here at all), so the test fails at the real cause.
2. **\`throw 'create failed'\`** had no stack, no type and no detail. A custom \`ApiError\` carries the status and the response text. Callers can check it with \`instanceof\`.
3. **\`!= 200\`** used loose equality and accepted only one code. \`res.ok()\` accepts the whole 2xx range.
4. **Cleanup was skipped** when \`testBody\` threw. \`try/finally\` makes sure the DELETE runs. Note there is **no catch**: the original test failure still goes up to the caller after cleanup.
5. **Restful Booker's DELETE needs auth** (a token cookie or Basic auth). So the helper now takes a token. Without it, cleanup failed silently with a 403.
6. **\`module.exports\` in a \`"type": "module"\` project** throws "module is not defined in ES module scope". Use \`export\` everywhere. (In a real suite, a Playwright fixture is an even better place for create and delete.) The lab code leaves out the export lines because it runs as a plain script.`,
      fnName: 'runScenario',
      tests: [
        { args: [200, false], expected: { outcome: 'passed', calls: ['POST /booking', 'test uses booking 42', 'DELETE /booking/42 (token=abc123)'] } },
        { args: [200, true], expected: { outcome: 'Error: assertion failed', calls: ['POST /booking', 'test uses booking 42', 'DELETE /booking/42 (token=abc123)'] } },
        { args: [500, false], expected: { outcome: 'ApiError: POST /booking failed: 500 Internal Server Error', calls: ['POST /booking'] } },
        { args: [201, false], expected: { outcome: 'passed', calls: ['POST /booking', 'test uses booking 42', 'DELETE /booking/42 (token=abc123)'] } },
        { args: [503, true], expected: { outcome: 'ApiError: POST /booking failed: 503 Service Unavailable', calls: ['POST /booking'] } },
        { args: [404, false], expected: { outcome: 'ApiError: POST /booking failed: 404 Not Found', calls: ['POST /booking'] }, hidden: true },
        { args: [201, true], expected: { outcome: 'Error: assertion failed', calls: ['POST /booking', 'test uses booking 42', 'DELETE /booking/42 (token=abc123)'] }, hidden: true },
      ],
      followUps: [
        {
          q: 'What happens if both testBody and the DELETE in finally throw?',
          a: 'The error thrown in finally replaces the first one. You would see the cleanup failure and lose the real test failure. To be safe, wrap the cleanup in its own try/catch that logs the cleanup error but does not throw it. Then the original assertion error is the one reported. Playwright fixtures report cleanup errors separately, which is another reason to use a fixture.',
        },
        {
          q: 'How would this look as a Playwright fixture?',
          a: 'test.extend({ booking: async ({ request }, use) => { const id = await createBooking(request, data); await use(id); await deleteBooking(request, id); } }). The code after use() is the cleanup, and it runs even when the test fails. Tests just ask for ({ booking }) as a parameter, and no spec needs its own try/finally.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-loops-modules-errors-iq-01',
      difficulty: 'easy',
      question: 'What is the difference between for...of, for...in and forEach? Which do you use in Playwright tests and why?',
      whatInterviewerLooksFor: [
        'for...of gives values; for...in gives object keys as strings',
        'Knows forEach cannot break and does not wait for await',
        'Chooses for...of with await for Playwright actions in order',
        'Mentions Object.entries for objects',
      ],
      modelAnswer: `**Short version:** for...of gives **values**. for...in gives **keys**. forEach is an **array method** that calls a function once per item.

\`for (const b of ['chromium', 'firefox']) console.log(b)\` prints chromium, then firefox.

| | for...of | for...in | forEach |
|---|---|---|---|
| Gives | values | keys, as strings | (value, index, array) |
| Works on | arrays, strings, Sets, Maps | objects | arrays |
| break / continue | yes | yes | no |
| await inside pauses the loop | yes | yes | **no** |

**Why it matters in tests:**

- for...in on an array gives \`'0'\`, \`'1'\` as **strings**. So \`i + 1\` becomes \`'01'\`. Extra keys on the array also show up. I don't use it on arrays.
- forEach with an async callback starts every callback and returns at once. It does not wait. In a Playwright test, the test can finish before the clicks happen. Failures then show up as unhandled errors instead of test failures.

**What I use:**

- To act on several elements in order: \`for (const row of await page.getByRole('row').all()) { await expect(row).toBeVisible(); }\`
- For objects such as form data: \`for (const [label, value] of Object.entries(formData)) await page.getByLabel(label).fill(value);\`
- For simple changes with no await: \`map\` and \`filter\`.
- For data-driven tests: a top-level for...of that calls \`test(...)\` once per data row. Each case gets its own name in the report.`,
      followUps: [
        {
          q: 'How do you run the actions in parallel instead of one by one?',
          a: 'Turn the items into promises and wait for all of them together: await Promise.all(items.map((x) => doSomething(x))). That is fine for independent API calls. For clicks on one page I keep them one by one, because a user cannot click six things at once, and the page may redraw between clicks.',
        },
        {
          q: 'Is for...in ever the right choice?',
          a: 'Rarely. It lists the keys of an object, including keys the object gets from its parent, so it can surprise you. Object.keys and Object.entries return only the object\'s own keys, as an array you can loop with for...of, sort or filter. I would only use for...in in old code.',
        },
      ],
      pitfalls: [
        'Saying for...in and for...of do the same thing.',
        'Using forEach with async callbacks in test code.',
        'Not knowing that for...in keys are strings.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-02',
      difficulty: 'easy',
      question: 'How do you stop a loop as soon as you find what you are looking for? Show it with a list of test results where you need the first failure.',
      whatInterviewerLooksFor: [
        'Uses break in for or for...of, or find / findIndex / some',
        'Knows forEach cannot be stopped, and return only skips one item',
        'Handles the "not found" case',
        'Mentions a labelled break for nested loops',
      ],
      modelAnswer: `**Three good options:**

**1. for...of with break** (clear, and works with await):

    let firstFail = null;
    for (const r of results) {
      if (r.status === 'failed') { firstFail = r; break; }
    }

**2. Built-in methods that stop early:** \`results.find((r) => r.status === 'failed')\` returns the item or \`undefined\`. \`findIndex\` gives the position or \`-1\`. \`some\` answers yes or no. These read best when there is no \`await\`.

**3. Nested data with a label:** when results are grouped by spec file, \`files: for (const file of specs) { for (const t of file.tests) { if (t.status === 'failed') { hit = t; break files; } } }\` leaves both loops at once.

**What does NOT work:** \`results.forEach(r => { if (r.status === 'failed') return; })\`. \`return\` ends only that one call. The loop goes on to the end. Throwing an error to escape forEach "works", but it misuses errors.

**Handle "not found":** decide what it means. For "first failure" in a report, \`undefined\` probably means "all passed". For "find the user row in the table", not finding it is a test failure. So I check it with a clear message, instead of crashing later on \`undefined.name\`.

**Bonus:** \`continue\` is the partner of \`break\`. It skips this item (for example, a skipped test) and goes on to the next.`,
      followUps: [
        {
          q: 'What if each check needs an await, like reading text from a locator?',
          a: 'Use for...of with await and break: for (const row of await rows.all()) { if ((await row.textContent())?.includes("Asha")) { target = row; break; } }. find and some do not wait for an async callback. It returns a Promise, and a Promise is always truthy. In Playwright, a filtered locator is even better: page.getByRole("row").filter({ hasText: "Asha" }).',
        },
        {
          q: 'What is the difference between break and return inside a loop in a function?',
          a: 'break leaves only the loop, and the function goes on with the code after it. return leaves the whole function at once, so it also stops the loop. Returning early from a helper (return r as soon as it matches) is often the cleanest way to write "find the first" by hand.',
        },
      ],
      pitfalls: [
        'Believing that return inside forEach stops the loop.',
        'Using filter(...)[0], which checks the whole array.',
        'Passing an async callback to find or some.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-03',
      difficulty: 'medium',
      question: 'Explain named vs default exports. How would you organise page objects, fixtures and helpers in a Playwright project using modules?',
      whatInterviewerLooksFor: [
        'Correct import syntax for both kinds',
        'A sensible folder structure (pages, fixtures, utils, tests, data)',
        'Knows a module runs once and its data is shared',
        'A consistent team rule, and the reason for it',
      ],
      modelAnswer: `**Named exports:** any number per file. You import them with braces and the exact name. You can rename with \`as\`.

    export const BASE_URL = 'https://www.saucedemo.com';
    export function uniqueEmail() { /* ... */ }
    // import { BASE_URL, uniqueEmail as email } from '../utils/data';

**Default export:** one per file. You import it without braces, under any name.

    export default class LoginPage { /* ... */ }
    // import LoginPage from '../pages/LoginPage';

**Trade-off:** a default import can get any name, so names can drift across the codebase. Named imports are checked by name, and editors auto-import them correctly. So many teams use named exports everywhere, or a default export only for "one class per file" page objects. Being consistent matters more than the choice.

**Structure I would suggest:**

| Folder | Contents | Exports |
|---|---|---|
| \`pages/\` | LoginPage, InventoryPage, CartPage | one class each |
| \`fixtures/\` | \`test = base.extend({...})\` with page objects and API setup | \`export const test\`, \`export { expect }\` |
| \`utils/\` | data builders, date helpers, API helpers | small named functions |
| \`data/\` | JSON test data | imported where needed |
| \`tests/\` | \`*.spec.ts\` | nothing |

Specs then import \`test\` and \`expect\` from \`../fixtures\`, not from \`@playwright/test\`. So every test gets the page objects ready to use.

**Two module facts that cause real bugs:** a module runs **once per process**, and everyone shares it. If one test pushes into an array exported from \`utils/data.ts\`, the next test in the same worker sees it. Also, modules use strict mode, so a variable you forgot to declare throws an error instead of quietly becoming global.`,
      followUps: [
        {
          q: 'What is a barrel file, and is it a good idea?',
          a: 'A barrel is an index.ts file that re-exports from several files (export * from "./LoginPage"). Specs can then write import { LoginPage, CartPage } from "../pages". It shortens imports. But it can create import loops, and it hides where things come from. It is fine for a small set of page objects. Avoid barrels that point to other barrels.',
        },
        {
          q: 'Why should specs import test from your fixtures file rather than from @playwright/test?',
          a: 'Because the extended test object carries your custom fixtures: page objects, logged-in state, API helpers. If you import the base test, the code still compiles, but those fixtures are missing, and TypeScript complains when a test asks for them. Exporting expect from the same file keeps one import line per spec.',
        },
      ],
      pitfalls: [
        'Putting braces around a default import, or forgetting them for a named one.',
        'Exporting shared arrays or objects that tests change, as "global test data".',
        'No clear structure, so helpers are copied into each spec.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-04',
      difficulty: 'medium',
      question: 'You run a script and get "require is not defined in ES module scope". What does it mean and how do you fix it? Explain CommonJS vs ES modules.',
      whatInterviewerLooksFor: [
        'Sees that CommonJS and ES module styles are mixed',
        'Knows how Node decides: the "type" field and .mjs / .cjs extensions',
        'Offers fixes in both directions',
        'Knows ESM facts: imports at the top, top-level await, no __dirname',
      ],
      modelAnswer: `**What it means:** Node is treating the file as an **ES module**. That happens because package.json has \`"type": "module"\`, or the file ends in \`.mjs\`. ES modules do not have \`require\`, \`module.exports\`, \`__dirname\` or \`__filename\`.

For example, \`const fs = require('fs');\` in such a file fails. \`import fs from 'fs';\` works.

**CommonJS vs ESM in short:** CommonJS is Node's original system: \`require\` and \`module.exports\`. ES modules are the JavaScript standard: \`import\` and \`export\`. Browsers and modern Node use them, and they allow \`await\` at the top of a file.

**How Node decides:**

| File | Treated as |
|---|---|
| \`.mjs\` | ESM |
| \`.cjs\` | CommonJS |
| \`.js\` with \`"type": "module"\` | ESM |
| \`.js\` without it | CommonJS |

**Fixes:**

1. **Move to ESM (recommended):** replace \`const x = require('x')\` with \`import x from 'x'\`. Replace \`module.exports = {...}\` with \`export\`. Replace \`__dirname\` with \`import.meta.dirname\` (Node 20.11+). Add file extensions to relative imports.
2. **Stay with CommonJS:** remove \`"type": "module"\`, or rename the file to \`.cjs\`.
3. **Need a CommonJS-only package from ESM?** \`import pkg from 'pkg'\` usually works (you get \`module.exports\` as the default). Or use \`createRequire(import.meta.url)\` from \`node:module\`.

The opposite error, "Cannot use import statement outside a module", is the same mix-up the other way round.

**Playwright context:** test files are usually TypeScript and always use \`import\`. Playwright handles them with or without \`"type": "module"\`. The errors mostly appear in plain \`.js\` helper scripts, like data seeding or report uploads, that live next to the tests.`,
      followUps: [
        {
          q: 'How do you get the current folder path in an ES module?',
          a: 'Use import.meta.dirname (and import.meta.filename) on Node 20.11 or later. On older versions: import { fileURLToPath } from "node:url"; const __dirname = path.dirname(fileURLToPath(import.meta.url)). This matters when you read test data files next to the spec, because the current folder differs between your laptop and CI.',
        },
        {
          q: 'What is dynamic import and when would you use it?',
          a: 'await import("./module.js") loads a module while the code runs, and gives back a promise of its exports. It works in both CommonJS and ESM, so CommonJS code can use it to load an ESM-only package. It is also handy for loading a config for one environment, or a heavy tool only when needed.',
        },
      ],
      pitfalls: [
        'Mixing require and import in the same file and hoping it works.',
        'Deleting "type": "module" without checking what else depends on it.',
        'Not knowing that __dirname does not exist in ESM.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-05',
      difficulty: 'medium',
      question: 'Walk me through package.json in a Playwright project. What is the difference between dependencies and devDependencies, and between npm install and npm ci?',
      whatInterviewerLooksFor: [
        'Explains scripts, devDependencies and version ranges',
        'Knows package-lock.json is committed, and why',
        'npm ci for CI: clean, exact, fails on a mismatch',
        'Knows npx, and that node_modules is not committed',
      ],
      modelAnswer: `**package.json describes the project:** its name, version, \`"type"\`, **scripts**, and the packages it needs.

**scripts** give the team shared commands. \`"test": "playwright test"\` runs with \`npm test\`. \`"test:smoke": "playwright test --grep @smoke"\` runs with \`npm run test:smoke\`. CI calls the same scripts, so "how we run tests" lives in one place.

**dependencies vs devDependencies:**

- \`dependencies\`: needed when the **application** runs in production (for example express or react).
- \`devDependencies\`: needed only to build, lint or **test**. In a test project, \`@playwright/test\`, \`@types/node\`, \`dotenv\` and \`@faker-js/faker\` are devDependencies (\`npm i -D ...\`). \`npm install --omit=dev\` skips them for production builds.

**Versions (semver):** \`MAJOR.MINOR.PATCH\`. \`^1.48.0\` accepts any 1.x from 1.48.0 up. \`~1.48.0\` accepts only patch updates. \`1.48.0\` is exact. A Playwright update also updates the browsers, so many teams pin an exact version and upgrade on purpose.

**package-lock.json** records the exact version of every package, including the packages they use. **Commit it.** It makes two machines install exactly the same thing.

**npm install vs npm ci:**

| | npm install | npm ci |
|---|---|---|
| Reads | package.json (the lock file as a guide) | package-lock.json, strictly |
| Can change the lock file | yes | never; it fails if the lock file and package.json disagree |
| node_modules | updated in place | deleted and installed fresh |
| Use it for | local work, adding packages | CI pipelines |

**Also:** after installing \`@playwright/test\`, run \`npx playwright install --with-deps\` to download the browsers (and the system libraries they need on Linux CI). \`npx\` runs a package's command without a global install. \`node_modules/\` goes in \`.gitignore\`.`,
      followUps: [
        {
          q: 'Tests pass locally but fail in CI right after a Playwright upgrade. What would you check first?',
          a: 'First, check that CI installed the same versions: is package-lock.json committed, and does CI use npm ci? Then check that the browsers match the library version: npx playwright install --with-deps must run after npm ci, or CI must use the matching Playwright Docker image. Finally, read the release notes for changes and compare traces from both machines.',
        },
        {
          q: 'What is the difference between npm i -D and npm i -g?',
          a: '-D saves the package in this project\'s devDependencies, so every teammate and CI get it from package.json. -g installs it globally on your machine only. The project cannot see that, which causes "works on my machine" problems. For project tools, prefer a local dev dependency run with npx or an npm script.',
        },
      ],
      pitfalls: [
        'Adding package-lock.json to .gitignore.',
        'Putting @playwright/test in dependencies "because tests need it".',
        'Using npm install in CI and getting different versions on each run.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-06',
      difficulty: 'medium',
      question: 'When should you use try/catch inside a Playwright test, and when is it harmful? How do you guarantee cleanup of test data?',
      whatInterviewerLooksFor: [
        'Knows expect throws, and catching it hides failures',
        'Uses try/finally (no catch), fixtures or afterEach for cleanup',
        'Catches only to add context, recover or handle an expected case, then rethrows',
        'Knows try/catch needs await to catch async failures',
      ],
      modelAnswer: `**How failures work:** a Playwright assertion or action **throws an error** when it fails or times out. The test runner marks the test failed when that error leaves the test function. Anything that stops the error from leaving can turn a failure into a pass.

**Harmful uses:**

- \`try { await expect(cartBadge).toHaveText('2'); } catch (e) { console.log(e); }\`: the test reports **passed**.
- Wrapping a whole test in try/catch "to take a screenshot". Playwright already does that with \`screenshot: 'only-on-failure'\` and traces.
- Using try/catch to steer the test: \`try { await banner.click({ timeout: 2000 }); } catch {}\` to close a popup that may or may not appear. It hides real problems and adds a fixed delay. For overlays that appear at random times, use \`page.addLocatorHandler\`, or check the page state directly.

**Good uses:**

1. **Add context and rethrow:** \`catch (e) { throw new Error('Checkout step failed for user ' + user, { cause: e }); }\`.
2. **The failure is what you test:** checking that an API helper fails. \`await expect(promise).rejects.toThrow(...)\` is often cleaner.
3. **Cleanup with try/finally:** create the data, run the steps inside \`try\`, delete in \`finally\`. There is no \`catch\`, so the original failure still goes up after cleanup.

**Where cleanup belongs in a real suite:** a fixture. The code after \`await use(booking)\` is the cleanup, and it runs even when the test fails. Playwright reports cleanup errors separately. \`afterEach\` also works for cleanup after each test.

**Async detail:** \`try { page.click(...) } catch\` without \`await\` catches nothing. The promise fails after the try block has already finished. Always \`await\` inside try.`,
      followUps: [
        {
          q: 'How do you make a test continue after a failed check but still fail at the end?',
          a: 'Use soft assertions: await expect.soft(locator).toHaveText("..."). The failure is recorded, the test keeps running so you see every problem in one run, and the test is marked failed at the end. That is the right tool, instead of try/catch around each check.',
        },
        {
          q: 'An error in finally hides the original test error. How do you avoid that?',
          a: 'Make the cleanup code careful: wrap it in its own try/catch, and log or attach the cleanup error without throwing it again. Then the original assertion error is the one reported. Moving cleanup into a fixture avoids the problem, because Playwright reports test errors and cleanup errors separately.',
        },
      ],
      pitfalls: [
        'try/catch around expect with only a console.log.',
        'Catching without await, so nothing is caught.',
        'Putting cleanup after the assertions, where it is skipped when a check fails.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-07',
      difficulty: 'hard',
      question: 'Design a custom error for API failures in your test framework. Why bother, and how would callers use it?',
      whatInterviewerLooksFor: [
        'Correct custom error class: super, this.name, extra fields',
        'Uses cause to keep the original error',
        'Callers check the type with instanceof, not by matching message text',
        'Explains the payoff: faster understanding of failures in reports',
      ],
      modelAnswer: `**Why:** a raw failure like "TypeError: Cannot read properties of undefined (reading 'bookingid')" tells you nothing. Compare it with \`ApiError: POST /booking returned 503 (Service Unavailable)\`, plus the URL and the response body. That tells the person reading the report exactly where to look. It also lets code react to the **type** of error.

**Design:**

    export class ApiError extends Error {
      constructor(message, { status, method, url, body, cause } = {}) {
        super(message, { cause });          // cause keeps the original error
        this.name = 'ApiError';             // shows in stack traces and reports
        this.status = status;
        this.method = method;
        this.url = url;
        this.body = body;                   // shortened response text
      }
    }

You can add child classes: \`class AuthError extends ApiError\` (401/403) and \`class NotFoundError extends ApiError\` (404).

**Throwing it** in one shared request helper:

    if (!res.ok()) {
      throw new ApiError(method + ' ' + url + ' returned ' + res.status(), {
        status: res.status(), method, url, body: (await res.text()).slice(0, 500),
      });
    }

**Using it:**

- Most tests do nothing special. The error leaves the test, the test fails, and the report shows a clear message.
- A setup step can react to the type: \`if (err instanceof AuthError) { await refreshToken(); retry once; } else throw err;\`.
- A negative test checks the type: \`await expect(getBooking(999)).rejects.toBeInstanceOf(NotFoundError)\`.

**Rules:** decide with \`instanceof\` or \`status\`, never by matching message text. Always rethrow what you cannot handle. Never put tokens or passwords in the message or body, because reports are shared.`,
      followUps: [
        {
          q: 'Why set this.name explicitly?',
          a: 'A child of Error gets name = "Error" from its parent. So without setting it, the stack trace and String(err) start with "Error:", and you lose the type at a glance. Setting this.name = "ApiError" makes reports and logs show the real type. instanceof works either way, because it checks the class, not the name.',
        },
        {
          q: 'What is the difference between wrapping with cause and just rethrowing?',
          a: 'Rethrowing passes the same error up, unchanged. Wrapping creates a new error with more context ("Checkout setup failed for user Asha") and keeps the original in err.cause, so Node and most reporters print both. Wrap when the extra context helps the reader. Rethrow when you have nothing to add.',
        },
      ],
      pitfalls: [
        'throw "API failed" (a string): no stack trace and no type.',
        'Matching on the error message text to decide what to do.',
        'Putting secrets in error messages.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-08',
      difficulty: 'easy',
      question: 'A helper script crashes with "TypeError: Cannot read properties of undefined". Walk me through how you would debug it in VS Code.',
      whatInterviewerLooksFor: [
        'Reads the message and stack trace to find the exact line',
        'Uses breakpoints and the JavaScript Debug Terminal, not random logs',
        'Makes a guess about the cause and proves it (which value is undefined, and why)',
        'Fixes the cause and adds a guard or a test',
      ],
      modelAnswer: `**1. Read the error.** "Cannot read properties of undefined (reading 'price')" means the thing before \`.price\` was \`undefined\`. The first stack trace line in my own file gives the exact line, for example \`cart.js:14\`.

**2. Make it happen with the smallest input.** Run just that script with the smallest data that fails. If it only fails sometimes, note which data causes it.

**3. Pause on the line.** Put a breakpoint on line 14 (click left of the line number). Open a **JavaScript Debug Terminal** and run \`node cart.js\` (or \`npx playwright test cart.spec.ts\`). When it pauses, hover over the variables or add them to **Watch**. Inside a loop, a conditional breakpoint (\`item === undefined\`) pauses only when it matters.

**4. Walk back with the Call Stack** to see where the bad value came from. Common causes: an index past the end (\`items[items.length]\`), \`find\` returning \`undefined\`, a wrong key name in API JSON (\`booking.bookingId\` vs \`bookingid\`), or a promise without \`await\`.

**5. Prove the guess.** In the Debug Console, type \`items.length\` and \`i\`. If \`i === items.length\`, the loop has an off-by-one \`<=\`.

**6. Fix the cause, not the symptom.** Change the loop condition, instead of adding \`?.\` everywhere. Optional chaining (\`?.\`) is right when the value really is optional. It is wrong when it hides a bug.

**7. Stop it from coming back.** Add a check with a clear error ("No product named X in cart"), or a unit test for the helper.

Without VS Code: run \`node --inspect-brk cart.js\` and attach from chrome://inspect, or add a short labelled \`console.log\`. In a Playwright test, \`--debug\`, \`page.pause()\` and the trace viewer cover the browser side.`,
      followUps: [
        {
          q: 'When would you still use console.log instead of the debugger?',
          a: 'For quick checks, for code that runs in CI where you cannot attach a debugger, and for timing problems where pausing changes what happens. I label every log (console.log("cart items", items)) and remove them before committing. In test runs, test.info().attach keeps useful data in the report instead.',
        },
        {
          q: 'What does optional chaining (?.) change here and why can it be dangerous?',
          a: 'item?.price gives undefined instead of throwing when item is undefined. That is right if a missing item is allowed. In tests it often hides the real bug: the sum becomes NaN, or the check compares undefined, and the failure moves somewhere harder to find. When the value should never be missing, add a clear check with a clear error.',
        },
      ],
      pitfalls: [
        'Adding console.log everywhere without reading the stack trace.',
        'Adding ?. without understanding why the value is undefined.',
        'Not making the bug happen with a small input first.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-09',
      difficulty: 'hard',
      question: 'Generate test data for a hotel booking: check-in tomorrow, check-out 3 nights later, both as YYYY-MM-DD. What can go wrong with dates in tests?',
      whatInterviewerLooksFor: [
        'Correct "add days" logic that handles month and year changes',
        'Knows months start at 0 and Date setters change the date',
        'Understands UTC vs local time zone problems in CI',
        'Mentions fixed dates or a controlled clock for stable tests',
      ],
      modelAnswer: `**Helper:**

    function isoDatePlus(days, base = new Date()) {
      const d = new Date(base);                 // copy first; setters change the date
      d.setUTCDate(d.getUTCDate() + days);      // Date handles month and year changes
      return d.toISOString().slice(0, 10);      // 'YYYY-MM-DD' in UTC
    }
    const checkin = isoDatePlus(1);
    const checkout = isoDatePlus(4);            // 3 nights after check-in

\`setUTCDate(32)\` moves into the next month by itself. So 30 December + 3 days becomes 2 January of the next year, with no extra code.

**What goes wrong:**

| Problem | Example | Prevention |
|---|---|---|
| Months start at 0 | \`new Date(2026, 1, 1)\` is **February** | use ISO strings, or add comments |
| Time zones | laptop in India, CI in UTC; between 00:00 and 05:30 in India, "today" differs | do date maths in UTC for API data |
| Mixing local and UTC | \`getDate()\` with \`toISOString()\` can shift a day | use the UTC getters and setters everywhere |
| Month overflow | 31 Jan + 1 month = 3 March | add days, or cap at the month's last day |
| Changing a shared date | \`base.setDate(...)\` changes the shared base | copy first |
| Tests that change by day | "tomorrow" is sometimes a Saturday, with different prices | fix the date, or control the clock |
| Daylight saving | a local "day" can be 23 or 25 hours | prefer UTC, or whole-day helpers |

**Stable tests:** when page behaviour depends on "today", Playwright's **Clock API** (\`await page.clock.setFixedTime(new Date('2026-10-14T10:00:00Z'))\`) fixes the browser's time. Then the test behaves the same every day. For API data, pass an explicit base date.

**Edge cases to mention:** check-in today, check-out before check-in, same-day check-out, 29 February in a leap year, and the end of the year.`,
      followUps: [
        {
          q: 'How would you get the date exactly 18 years ago for an age-gate boundary test?',
          a: 'Copy today and subtract 18 from the year: const d = new Date(); d.setUTCFullYear(d.getUTCFullYear() - 18). Also test one day less (just under 18) and one day more. Watch out for 29 February: 18 years before 29 Feb 2028 lands on 1 March 2010. Agree on the business rule, and include a leap-day case.',
        },
        {
          q: 'Why not just hard-code dates like 2026-10-15 in the test?',
          a: 'Fixed dates go stale. Once the date is in the past, booking APIs reject it, and the test fails for a reason that has nothing to do with the code. Relative dates (tomorrow, +3 days) stay valid. Fixed dates are fine when you also control the clock, because then the whole scenario stays the same every run.',
        },
      ],
      pitfalls: [
        'Adding 1 to getMonth() in some places but not others, or forgetting months start at 0.',
        'Mixing local getters with toISOString (UTC) and being off by one day.',
        'Hard-coding dates that will expire.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-loops-modules-errors-drill-1',
      question:
        'Predict the output line by line: `outer: for (let r = 0; r < 3; r++) { for (let c = 0; c < 3; c++) { if (c === 1) continue outer; if (r === 2) break outer; console.log(r, c); } }`',
      assumptions: [
        '`continue outer` jumps to the next round of the OUTER loop (r++).',
        '`break outer` leaves both loops completely.',
        'The inner loop starts again at c = 0 for each new r.',
      ],
      steps: [
        { label: 'r = 0, c = 0', calc: 'c !== 1, r !== 2 → log "0 0"' },
        { label: 'r = 0, c = 1', calc: 'c === 1 → continue outer → r becomes 1' },
        { label: 'r = 1, c = 0', calc: 'log "1 0"' },
        { label: 'r = 1, c = 1', calc: 'continue outer → r becomes 2' },
        { label: 'r = 2, c = 0', calc: 'c !== 1, but r === 2 → break outer: both loops end' },
      ],
      answer: 'Two lines: `0 0` and `1 0`.',
      insight: 'Labels change which loop continue and break act on. Without the label, continue would only skip to c = 2 in the inner loop, and break would only end the inner loop. Trace loops as a table of (r, c, action) and you will never guess wrong.',
      followUps: [
        {
          q: 'What would print without the labels (plain continue and break)?',
          a: 'r = 0: c = 0 logs "0 0", c = 1 continues, c = 2 logs "0 2". r = 1: logs "1 0" and "1 2". r = 2: c = 0 hits break, so the inner loop ends, and then the outer loop also ends because r becomes 3. Output: 0 0, 0 2, 1 0, 1 2.',
        },
      ],
    },
    {
      id: 'js-loops-modules-errors-drill-2',
      question:
        'Predict every log and the final return value: `function f() { try { console.log("A"); throw new Error("x"); console.log("B"); } catch (e) { console.log("C", e.message); return "from catch"; } finally { console.log("D"); } console.log("E"); } console.log(f());`',
      assumptions: [
        'A throw skips the rest of the try block.',
        'finally runs before the function really returns.',
        'finally has no return of its own here.',
      ],
      steps: [
        { label: 'try', calc: 'logs "A", then throw → "B" is skipped' },
        { label: 'catch', calc: 'logs "C x"; the return of "from catch" waits for finally' },
        { label: 'finally', calc: 'runs before leaving: logs "D"' },
        { label: 'after the block', calc: '"E" never runs: the function already returned' },
        { label: 'caller', calc: 'console.log(f()) logs "from catch"' },
      ],
      answer: '`A`, `C x`, `D`, `from catch`. B and E are never printed.',
      insight: 'finally always runs, even when try or catch returns. It runs before the value reaches the caller. That is why cleanup goes in finally. If finally itself returned "from finally", it would replace the catch result, so never return from finally.',
      followUps: [
        {
          q: 'What if the catch block rethrows instead of returning?',
          a: 'The logs are A, C x, D. Then the error leaves f, so console.log(f()) never runs, and the caller gets the Error("x"). It stays uncaught unless the caller has its own try/catch. finally still runs before the error leaves the function, which is exactly why try/finally is safe for cleanup in tests.',
        },
      ],
    },
    {
      id: 'js-loops-modules-errors-drill-3',
      question:
        'A data script builds a booking for "31 January + 1 month". Trace: `const d = new Date(2026, 0, 31); d.setMonth(d.getMonth() + 1); console.log(d.getMonth(), d.getDate());` What prints, and how would you make "+1 month" safe?',
      assumptions: [
        'Months start at 0 (0 = January, 1 = February, 2 = March).',
        'February 2026 has 28 days (2026 is not a leap year).',
        'Extra days roll over into the next month.',
      ],
      steps: [
        { label: 'Start', calc: 'new Date(2026, 0, 31) → 31 January 2026; getMonth() = 0' },
        { label: 'setMonth(1)', calc: 'asks for "31 February 2026", which does not exist' },
        { label: 'Overflow', calc: 'February has 28 days → 31 − 28 = 3 days into March' },
        { label: 'Result', calc: '3 March 2026 → getMonth() = 2, getDate() = 3' },
      ],
      answer: '`2 3` (3 March 2026), not the end of February the author expected.',
      insight: 'Adding months is unclear at the end of a month. Adding days is not. For a safe "+1 month", cap the day: set the date to 1, add the month, then set the date to Math.min(originalDay, daysInNewMonth). Here daysInNewMonth = new Date(y, m + 1, 0).getDate().',
      followUps: [
        {
          q: 'Why does new Date(y, m + 1, 0) give the last day of month m?',
          a: 'Day 0 of a month means "one day before the 1st", which is the last day of the month before. So new Date(2026, 2, 0) is 28 February 2026, and getDate() returns 28. It is a well-known trick to get the number of days in a month, and it handles leap years by itself.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-loops-modules-errors-mcq-01',
      difficulty: 'easy',
      question: 'Which loop prints the VALUES "chromium", "firefox", "webkit" from `const b = [\'chromium\', \'firefox\', \'webkit\']`?',
      options: ['for (const x in b) console.log(x)', 'for (const x of b) console.log(x)', 'for (const x of Object.keys(b)) console.log(x)', 'for (let x = 1; x <= b.length; x++) console.log(b[x])'],
      correct: [1],
      explanation:
        'for...of gives the values of an array. for...in and Object.keys both give the positions as strings ("0", "1", "2"). The classic for loop starts at 1 and uses <=, so it skips "chromium" and prints undefined at the end.',
      followUps: [
        { q: 'How do you get both the index and the value in a for...of loop?', a: 'Use entries(): for (const [i, value] of b.entries()) gives the number index and the value. This avoids the string keys of for...in, and you can still use break, continue and await.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-02',
      difficulty: 'easy',
      question: 'You want to stop looping as soon as the first failed result is found. Which constructs can do that? Select ALL that apply.',
      options: ['for...of with break', 'results.forEach with return', 'results.find(...)', 'results.some(...)'],
      correct: [0, 2, 3],
      explanation:
        'break ends a for...of loop at once. find and some stop at the first item where the callback returns a truthy value. In forEach, return only ends the current call, and the loop goes on with the next item. So forEach cannot stop early.',
      followUps: [
        { q: 'Which of those three would you choose if each check needs await?', a: 'for...of with break. find and some do not wait for an async callback. It returns a Promise, and a Promise is always truthy, so find would return the first item no matter what the real result was.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-03',
      difficulty: 'easy',
      question: 'Which import correctly uses a file that contains `export default class LoginPage {}` and `export const LOGIN_URL = \'/\'`?',
      options: [
        "import { LoginPage, LOGIN_URL } from './LoginPage'",
        "import LoginPage, { LOGIN_URL } from './LoginPage'",
        "import LoginPage, LOGIN_URL from './LoginPage'",
        "const { LoginPage } = import './LoginPage'",
      ],
      correct: [1],
      explanation:
        'The default export is imported without braces, under any name. Named exports go inside braces, with their exact names. You can combine them, default first. Option 1 treats the default as a named export. Option 3 leaves out the braces for the named one. Option 4 is not valid code.',
      followUps: [
        { q: 'How would you import LOGIN_URL under a different name?', a: 'Use as inside the braces: import LoginPage, { LOGIN_URL as LOGIN_PATH } from "./LoginPage". You only need as for named exports, because a default import can take any name directly.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-04',
      difficulty: 'medium',
      question: 'What does this print?',
      code: {
        language: 'javascript',
        code: `for (const i in [10, 20, 30]) {
  if (i + 1 === 2) console.log('found');
  else console.log(i + 1);
}`,
      },
      options: ["'found', 21, 31", "'01', '11', '21'", "1, 'found', 3", "11, 21, 31"],
      correct: [1],
      explanation:
        'for...in gives the keys as strings ("0", "1", "2"). "0" + 1 joins text and gives "01", and "01" === 2 is never true. So it logs "01", "11", "21". People who expect number indexes guess 1, "found", 3.',
      followUps: [
        { q: 'How would you fix the loop?', a: 'Use for (const [i, v] of arr.entries()) for number indexes, or a classic for (let i = 0; i < arr.length; i++). Number(i) + 1 also works, but the real fix is to not use for...in on arrays.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-05',
      difficulty: 'medium',
      question: 'A test wraps an assertion like this. What does the report show when the cart badge reads "1"?',
      code: {
        language: 'typescript',
        code: `test('cart badge shows 2', async ({ page }) => {
  // ...add two items...
  try {
    await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('2');
  } catch (e) {
    console.log('badge mismatch', e);
  }
});`,
      },
      options: [
        'Failed, because expect failed',
        'Passed, because the error was caught and not rethrown',
        'Flaky, because the assertion retried',
        'Skipped, because the test logged an error',
      ],
      correct: [1],
      explanation:
        'Playwright marks a test failed when an error leaves the test function. expect throws after retrying for 5 seconds, but the catch swallows the error. So the test ends normally and is reported as passed. "Flaky" means a test failed and then passed on a retry, which is not the case here. Nothing here skips the test either.',
      followUps: [
        { q: 'How should you keep going after a failed check but still fail the test?', a: 'Use expect.soft(...). The failure is recorded, the test keeps running, and it is marked failed at the end. Or add context in the catch and throw again: throw new Error("badge mismatch", { cause: e }).' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-06',
      difficulty: 'medium',
      question: 'What is logged by this function call?',
      code: {
        language: 'javascript',
        code: `function check() {
  try {
    return 'try';
  } finally {
    console.log('cleanup');
  }
}
console.log(check());`,
      },
      options: ["'try' only", "'cleanup' then 'try'", "'try' then 'cleanup'", "'cleanup' only"],
      correct: [1],
      explanation:
        'The return value "try" is ready first. Then finally runs, before the function really returns, and logs "cleanup". Only then does the caller get "try" and log it. A return does not skip finally, which is what makes finally reliable for cleanup.',
      followUps: [
        { q: 'What if finally also contained return "finally"?', a: 'The function would return "finally", replacing the return from try. It would even hide an error thrown in try. That is why linters warn about a return inside finally (the no-unsafe-finally rule).' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-07',
      difficulty: 'medium',
      question: 'Which statements about package.json and npm in a Playwright project are correct? Select ALL that apply.',
      options: [
        '@playwright/test normally belongs in devDependencies',
        'package-lock.json should be committed to Git',
        'npm ci may rewrite package-lock.json to match package.json',
        'node_modules should be committed so CI does not need to install',
        '"test": "playwright test" in scripts lets you run npm test',
      ],
      correct: [0, 1, 4],
      explanation:
        'Test tools are dev dependencies. The lock file is committed, so every machine installs the same versions. Scripts define shared commands. npm ci never changes the lock file; it fails if package.json and the lock file disagree. node_modules is large, depends on the operating system, and is never committed.',
      followUps: [
        { q: 'Why is npm ci preferred in CI pipelines?', a: 'It deletes node_modules and installs exactly what package-lock.json lists, and it fails on any mismatch. So builds are the same every time, and usually faster. npm install may pick newer versions within the allowed ranges.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-08',
      difficulty: 'medium',
      question: 'Running `node seed.js` fails with "require is not defined in ES module scope". package.json contains "type": "module". Which fixes work? Select ALL that apply.',
      options: [
        'Replace require(...) with import statements',
        'Rename the file to seed.cjs',
        'Add "use strict" at the top of seed.js',
        'Run it with node --require seed.js',
      ],
      correct: [0, 1],
      explanation:
        'With "type": "module", .js files are ES modules, and require does not exist there. Switching to import fixes it. Renaming the file to .cjs also works, because it tells Node to treat that one file as CommonJS. "use strict" changes nothing, since modules are already strict. --require loads a file early but does not change its type.',
      followUps: [
        { q: 'What else must change when converting such a script to ESM?', a: 'module.exports becomes export. __dirname and __filename become import.meta.dirname and import.meta.filename (Node 20.11+). Relative imports need file extensions. JSON files are read with fs, or imported with an import attribute: with { type: "json" }.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-09',
      difficulty: 'medium',
      question: 'Which value does this expression produce? `new Date(2026, 1, 1).getMonth()`',
      options: ['0', '1', '2', 'It throws a RangeError'],
      correct: [1],
      explanation:
        'The month you pass to new Date starts at 0, so (2026, 1, 1) is 1 February 2026. getMonth also counts from 0, so it returns 1. Beginners often think the 1 means January (and answer 0), or that getMonth adds 1 (and answer 2).',
      followUps: [
        { q: 'How do you print the month as a human-friendly 2-digit string?', a: 'String(d.getMonth() + 1).padStart(2, "0") gives "02". Or take it from toISOString().slice(5, 7) when you want UTC. Use Intl.DateTimeFormat for names like "Feb".' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-10',
      difficulty: 'hard',
      question: 'Which statements about custom errors are true? Select ALL that apply.',
      code: {
        language: 'javascript',
        code: `class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
const e = new ApiError('Not found', 404);`,
      },
      options: [
        'e instanceof Error is true',
        'e.name is "ApiError" automatically',
        'String(e) starts with "Error: Not found" unless this.name is set',
        'e.stack is available because it extends Error',
      ],
      correct: [0, 2, 3],
      explanation:
        'A child of Error is also an Error, and it gets a stack trace from the Error constructor. But name comes from Error as "Error". So String(e) is "Error: Not found" until you set this.name = "ApiError". Forgetting that line is the most common custom-error mistake.',
      followUps: [
        { q: 'How would you also keep the original low-level error?', a: 'Accept a cause and pass it to super: super(message, { cause }). Then err.cause holds the original error, and Node prints it with the stack. You add context without losing the real cause.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-11',
      difficulty: 'hard',
      question: 'Two spec files import `export const createdIds = []` from utils/state.ts and push into it. Tests run with 1 worker. What happens?',
      options: [
        'Each spec gets its own fresh empty array',
        'Both specs share the same array because a module is evaluated once per process',
        'TypeScript refuses to compile a mutable export',
        'Playwright resets all modules between tests',
      ],
      correct: [1],
      explanation:
        'Modules are cached. The first import runs the file, and every later import in the same worker gets the same exported objects. So items pushed by one spec are visible to the next. With several workers, each worker has its own copy. So the behaviour differs between local and CI runs, a classic cause of flaky tests.',
      followUps: [
        { q: 'How should per-test data be shared instead?', a: 'Create the data inside the test, or in a test-scoped fixture, so each test gets a fresh value, and pass it in directly. For data that must outlive a worker (for example IDs to clean up later), write to a file or use the API, not a variable in a module.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-12',
      difficulty: 'hard',
      question: 'Which error type does each line throw? Pick the option that matches all three: (1) `JSON.parse(\'{bad\')` (2) `null.length` (3) `pagee.goto(\'/\')` where `pagee` was never declared.',
      options: [
        'SyntaxError, TypeError, ReferenceError',
        'TypeError, TypeError, ReferenceError',
        'SyntaxError, ReferenceError, TypeError',
        'RangeError, TypeError, SyntaxError',
      ],
      correct: [0],
      explanation:
        'Broken JSON throws a SyntaxError when the code runs. Reading a property of null throws a TypeError. Using a name that was never declared throws a ReferenceError. Knowing these names helps you read failing CI logs fast: a ReferenceError is often a typo, and a TypeError usually means an unexpected undefined or null.',
      followUps: [
        { q: 'Which of these would TypeScript catch before running?', a: 'TypeScript catches the undeclared pagee (ReferenceError), and usually null.length too, before the code runs. Broken JSON is data, so JSON.parse can only fail while running. That is why you should check or wrap the parsing of outside data.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-13',
      difficulty: 'expert',
      question: 'Which snippets guarantee the DELETE runs AND the original test failure is still reported if `runSteps()` throws? Select ALL that apply.',
      options: [
        'try { await runSteps(); } finally { await deleteBooking(id); }',
        'try { await runSteps(); } catch (e) { console.log(e); } await deleteBooking(id);',
        'try { await runSteps(); } catch (e) { await deleteBooking(id); throw e; } await deleteBooking(id);',
        'await runSteps(); await deleteBooking(id);',
      ],
      correct: [0, 2],
      explanation:
        'try/finally runs the cleanup and lets the original error keep going up. Catch, clean up, then rethrow also works (with the cleanup repeated for the success path). Option 2 cleans up but swallows the failure, so the test passes. Option 4 skips the cleanup completely when runSteps throws.',
      followUps: [
        { q: 'Why is a Playwright fixture usually better than either working option?', a: 'The fixture cleanup (code after await use(...)) always runs, even on a failure or timeout, and Playwright reports cleanup errors separately from test errors. The cleanup code also lives in one place, instead of being repeated in every test.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-14',
      difficulty: 'expert',
      question: 'A data helper returns `d.toISOString().slice(0, 10)` after `d.setDate(d.getDate() + 1)` on `new Date()`. A tester in India (UTC+5:30) runs it at 02:00 local time. Which statements are correct? Select ALL that apply.',
      options: [
        'setDate/getDate use local time, while toISOString uses UTC',
        'At 02:00 IST it is still the previous day in UTC, so the result can be "today" in India instead of tomorrow',
        'The same code always gives the same date on a CI machine running in UTC and on the laptop',
        'Using setUTCDate/getUTCDate with toISOString keeps the calculation consistent',
      ],
      correct: [0, 1, 3],
      explanation:
        'The local setter adds a day in India time. But toISOString converts back to UTC. At 02:00 in India it is 20:30 of the day before in UTC, so "tomorrow" in India prints as today\'s date. Using UTC getters and setters with toISOString keeps everything in one time zone. Machines in different time zones can give different dates, so statement 3 is false.',
      followUps: [
        { q: 'How do you make date-dependent UI tests give the same result every day?', a: 'Control the clock. Playwright\'s page.clock.setFixedTime (or install) fixes the browser time. You can also set the timezoneId option for the browser context, so the page acts as if it were in one time zone on every machine.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-15',
      difficulty: 'hard',
      question: 'How many times does this while loop body run, and what is the final value of `attempt`?',
      code: {
        language: 'javascript',
        code: `const statuses = ['pending', 'pending', 'pending', 'done'];
let attempt = 0;
while (statuses[attempt] !== 'done' && attempt < 2) {
  attempt++;
}
console.log(attempt);`,
      },
      options: ['3 times, attempt = 3', '2 times, attempt = 2', '4 times, attempt = 4', '0 times, attempt = 0'],
      correct: [1],
      explanation:
        'The condition is checked before each round. When attempt is 0 and then 1, both parts are true, so the body runs twice. When attempt is 2, the limit (attempt < 2) is false, so the loop stops, even though the status is still pending. The limit did its job: a limited retry gives up instead of looping forever.',
      followUps: [
        { q: 'After this loop, how should the script react to still being "pending"?', a: 'Check the final state and throw a clear error, for example throw new Error("Order still pending after 2 checks"). A limited loop that ends silently is almost as bad as an endless one, because the next steps run against the wrong state.' },
      ],
    },
  ],
};

export default topic;
