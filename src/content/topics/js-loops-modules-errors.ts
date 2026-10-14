import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-loops-modules-errors',
  phase: 'javascript',
  order: 5,
  title: 'Loops, Modules, npm & Error Handling',
  subtitle:
    'Repeat work with the right loop, split test code into modules, understand package.json and npm, and handle errors with try/catch/finally and custom errors: the plumbing every Playwright project is built on.',
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
    'for (init; condition; step) when you need the index; `i < arr.length`, never `<=` (off-by-one reads undefined).',
    'while = "repeat until a condition changes" (unknown count); do...while runs the body at least once. Always make sure the condition can become false.',
    'for...of → VALUES of iterables (arrays, strings, Sets, Maps, locator.all() results). for...in → KEYS (as strings) of objects; avoid for...in on arrays.',
    'break exits the loop, continue skips to the next round, labels (`outer:`) break out of nested loops; forEach supports none of these.',
    'Objects are not iterable: use Object.keys / values / entries, e.g. `for (const [k, v] of Object.entries(obj))`.',
    'ES modules: `export function x`, `export default class LoginPage`, `import LoginPage, { x } from \'./file\'`. Named imports must match names; default imports can be renamed.',
    'CommonJS = require / module.exports (old Node default). ESM = import / export (browser + modern Node; .mjs or "type": "module"). Playwright TS tests are written with import.',
    'package.json: scripts ("test": "playwright test"), dependencies vs devDependencies (@playwright/test is a dev dependency), package-lock.json pins exact versions; CI uses `npm ci`.',
    'try { risky } catch (err) { handle } finally { always cleanup }. finally runs even after return or throw. Never swallow an error you cannot handle: rethrow it.',
    'Throw Error objects (not strings) so you get a stack trace; subclass Error for custom errors, set this.name, and pass `{ cause }` to keep the original error.',
    'Debug: `debugger;` + VS Code JavaScript Debug Terminal, `node --inspect-brk file.js`, console.table for arrays; in Playwright use --debug or page.pause().',
    'Dates: months are 0-based (0 = January); `toISOString().slice(0, 10)` → "YYYY-MM-DD" in UTC; `Date.now()` makes unique test data; setDate overflow rolls into the next month.',
  ],
  sections: [
    {
      heading: 'The classic for loop',
      body: `**Intuition:** a loop is a manual tester's "repeat these steps for each row of the test data sheet". Instead of copy-pasting the same code 50 times, you write it once and let the loop run it 50 times.

**Anatomy of \`for (init; condition; step)\`:**

1. **init** runs once (\`let i = 0\`).
2. **condition** is checked before every round (\`i < 5\`); when it is false the loop stops.
3. The **body** runs.
4. **step** runs after each round (\`i++\`), then back to 2.

Use the classic \`for\` when you need the **index** (row number, "every 3rd item", walking two arrays side by side) or need to count up or down.

**Common mistakes:**

- **Off-by-one:** \`i <= arr.length\` reads one item past the end (\`undefined\`), which turns a sum into \`NaN\`.
- **\`var\` instead of \`let\`:** \`var\` has one variable for the whole loop; callbacks created inside (like \`setTimeout\`) all see the final value. \`let\` creates a fresh \`i\` per round. Always use \`let\` (or \`const\` in for...of).
- **Infinite loops:** forgetting the step (\`i++\`), or changing the wrong variable. In Node, press Ctrl+C to stop.

**Worked example:** generate 5 test users with unique emails and alternating roles, the kind of data a data-driven Playwright test consumes.`,
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
for (let i = 6; i > 0; i -= 2) console.log(i); // → 6, 4, 2`,
        },
      ],
      keyPoints: [
        'Indexing an array: start at 0, stop at i < length.',
        'Always declare the counter with let, never var.',
        'Make sure the condition will eventually become false.',
      ],
      source: 'javascript.info — Loops: while and for',
    },
    {
      heading: 'while and do...while',
      body: `**Intuition:** use \`while\` when you do not know in advance how many rounds you need: "keep pressing *Next* **while** the Next button is enabled", "retry **while** the status is still *pending*, but at most 10 times".

- \`while (condition) { body }\` checks first; the body may run **zero** times.
- \`do { body } while (condition)\` runs the body **at least once**, then checks.

**Always add a safety limit.** A real system can stay "pending" forever; a loop without a maximum then hangs your test run. A counter (\`attempts < 10\`) or a time limit turns a hang into a clear failure.

**Playwright note:** do not hand-write polling loops with \`waitForTimeout\` inside Playwright tests. Web-first assertions (\`await expect(locator).toHaveText(...)\`) and \`expect.poll\` / \`expect(...).toPass()\` already retry with timeouts. Plain \`while\` loops are still useful in data scripts and when paging through API results.`,
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
console.log(all);                        // → ['a', 'b', 'c', 'd', 'e']

// Bounded retry: never loop forever
const statuses = ['pending', 'pending', 'done'];
let attempt = 0;
let status;
do {
  status = statuses[attempt];            // pretend this is a status check
  attempt++;
} while (status !== 'done' && attempt < 10);
console.log(status, attempt);            // → 'done' 3

// do...while runs the body once even if the condition is false
let n = 10;
do { console.log('ran with', n); } while (n < 5); // → 'ran with' 10`,
        },
      ],
      keyPoints: [
        'while: unknown number of rounds, may run zero times.',
        'do...while: at least one round.',
        'Every polling loop needs a maximum (attempts or time).',
      ],
      source: 'javascript.info — Loops: while and for; MDN — do...while',
    },
    {
      heading: 'for...of vs for...in',
      body: `**Intuition:** **for...of** gives you the **things in the box** (values). **for...in** gives you the **labels on the drawers** (property names). Mixing them up is one of the most common beginner bugs and a favourite interview question.

| | for...of | for...in |
|---|---|---|
| Gives you | values | keys (always strings) |
| Works on | iterables: arrays, strings, Sets, Maps, arguments, NodeLists | any object's enumerable properties |
| On an array \`['a','b']\` | \`'a'\`, \`'b'\` | \`'0'\`, \`'1'\` (strings!) plus any extra/inherited properties |
| On a plain object | TypeError: not iterable | \`'name'\`, \`'role'\` |
| \`break\` / \`continue\` / \`await\` | yes | yes |
| Use it for | arrays and lists (the default choice) | rarely; prefer Object.entries |

**And forEach?** \`arr.forEach(fn)\` is fine for simple side effects, but it cannot \`break\`, and \`await\` inside its callback does not pause the loop. In Playwright, iterate locators with \`for (const item of await list.all()) { await ... }\`.

**In interviews say this:** "for...of iterates values of iterables; for...in enumerates string keys of objects, including inherited ones, so I don't use it on arrays. For objects I use Object.entries with for...of."`,
      code: [
        {
          language: 'javascript',
          title: 'Values vs keys',
          code: `const browsers = ['chromium', 'firefox', 'webkit'];
browsers.extra = 'oops';                 // arrays are objects; extra props happen (libraries, polyfills)

for (const b of browsers) console.log(b);
// → chromium, firefox, webkit          (values only)

for (const k in browsers) console.log(k, typeof k);
// → '0' string, '1' string, '2' string, 'extra' string

// The string index trap
for (const i in [10, 20]) console.log(i + 1);   // → '01', '11'  (string concatenation!)

// for...of works on strings, Sets and Maps too
for (const ch of 'QA') console.log(ch);          // → 'Q', 'A'
for (const [name, ms] of new Map([['login', 1200], ['cart', 800]])) {
  console.log(name, ms);                         // → login 1200, cart 800
}

// Plain objects are not iterable
try {
  for (const x of { a: 1 }) console.log(x);
} catch (e) {
  console.log(e.name);                           // → 'TypeError'
}`,
        },
      ],
      keyPoints: [
        'for...of = values; for...in = string keys.',
        'Never use for...in on arrays: string indexes and extra properties.',
        'In async test code, for...of + await is the safe loop.',
      ],
      source: 'MDN Web Docs — for...of, for...in; javascript.info — Iterables',
    },
    {
      heading: 'break, continue and labels',
      body: `**Intuition:** \`break\` = "stop testing, I found the blocker". \`continue\` = "skip this row, move to the next one". A **label** names an outer loop so you can break out of two loops at once.

- \`break\` leaves the innermost loop (or \`switch\`) immediately.
- \`continue\` ends the current round and goes to the next one (the \`for\` step still runs).
- \`outer: for (...) { for (...) { break outer; } }\` leaves both loops. Labels are rare in app code but handy for "search a grid": find the first table cell with an error and stop.
- **forEach, map, filter** cannot \`break\`. If you need "stop at the first match", use \`for...of\` with \`break\`, or \`find\` / \`some\` / \`findIndex\`, which stop early by design.

**Common mistake:** writing \`return\` inside a \`forEach\` callback expecting the loop to stop. It only returns from that one callback; the loop continues with the next item.`,
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
// → checked pass, checked pass, stop: first failure

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
console.log(found);                      // → [1, 1]`,
        },
      ],
      keyPoints: [
        'continue skips one round; break ends the loop.',
        'A labelled break exits nested loops in one step.',
        'Use find/some or for...of when you need to stop early.',
      ],
      source: 'MDN Web Docs — break, continue, label',
    },
    {
      heading: 'Iterating objects',
      body: `**Intuition:** an object is a form with labelled fields (\`name\`, \`role\`, \`email\`). To walk through it, first turn it into a list: of field names, of values, or of [name, value] pairs.

| Need | Use | Returns |
|---|---|---|
| field names | \`Object.keys(obj)\` | \`['name', 'role']\` |
| field values | \`Object.values(obj)\` | \`['Asha', 'admin']\` |
| both | \`Object.entries(obj)\` | \`[['name', 'Asha'], ['role', 'admin']]\` |
| back to an object | \`Object.fromEntries(pairs)\` | \`{ name: 'Asha', role: 'admin' }\` |

\`for (const [key, value] of Object.entries(obj))\` is the modern, readable loop for objects. It only includes the object's **own** properties, unlike \`for...in\`, which also walks inherited ones.

**Testing uses:**

- Fill a form from a data object: loop over entries and \`fill\` each field by its label.
- Compare an API response with expected values field by field, collecting all mismatches instead of stopping at the first.
- Count properties: \`Object.keys(obj).length\`.`,
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
// → ['lastname: expected "Rao", got "Roa"', 'totalprice: expected 150, got "150"']

console.log(Object.keys(expected));       // → ['firstname', 'lastname', 'totalprice', 'depositpaid']
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
        'Objects are not iterable; convert with keys/values/entries.',
        'Object.entries + for...of + destructuring is the idiomatic object loop.',
        'Collect all mismatches before failing to get a more useful report.',
      ],
      source: 'javascript.info — Object.keys, values, entries',
    },
    {
      heading: 'ES modules: export and import',
      body: `**Intuition:** a module is one file that **exports** what other files may use and **imports** what it needs, like departments sharing documents through an official outbox and inbox. Every Playwright project is a set of modules: test files import \`test\` and \`expect\` from \`@playwright/test\`, page objects, fixtures and helpers.

**Two kinds of export:**

| | Named export | Default export |
|---|---|---|
| Write | \`export function login() {}\` / \`export const BASE = '...'\` | \`export default class LoginPage {}\` |
| Import | \`import { login, BASE } from './helpers'\` | \`import LoginPage from './LoginPage'\` |
| How many per file | any number | at most one |
| Name when importing | must match (rename with \`as\`) | you choose any name |

**Rules worth knowing:**

- Imports are **static**: they live at the top of the file and paths are plain strings. For conditional loading there is \`await import('./x.js')\` (dynamic import).
- Module code runs **once**, the first time it is imported, and every importer shares the same exported objects. Mutable shared state in a helper module leaks between tests in the same worker.
- Modules are always in **strict mode**: assigning to an undeclared variable throws a ReferenceError instead of creating a global.
- In plain Node ESM, relative imports need the file extension (\`'./utils.js'\`). Playwright's TypeScript loader lets you omit it in \`.ts\` tests.

**Team convention:** many teams prefer **named exports** for helpers and page objects, because the name is checked at import time and editors auto-import reliably.`,
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
        'Named exports: many per file, imported with { } and the exact name.',
        'Default export: one per file, imported without { } under any name.',
        'Module-level state is shared by everything that imports it.',
      ],
      source: 'javascript.info — Modules: export and import; Playwright docs — TypeScript',
    },
    {
      heading: 'CommonJS vs ES modules, npm and package.json',
      body: `**Intuition:** Node grew up with its own module system, **CommonJS** (\`require\`), years before JavaScript got an official one, **ES modules** (\`import\`). Both still exist, and the error messages when you mix them are a rite of passage.

| | CommonJS (CJS) | ES modules (ESM) |
|---|---|---|
| Import | \`const fs = require('fs')\` | \`import fs from 'fs'\` |
| Export | \`module.exports = {...}\` / \`exports.x = ...\` | \`export\` / \`export default\` |
| Loading | synchronous, at run time, anywhere in the code | static, analysed before running; \`await import()\` for dynamic |
| Node decides by | \`.cjs\`, or \`.js\` without \`"type": "module"\` | \`.mjs\`, or \`.js\` with \`"type": "module"\` in package.json |
| Top-level await | no | yes |
| \`__dirname\` | available | not defined; use \`import.meta.dirname\` (Node 20.11+) |

**Errors you will meet:** "require is not defined in ES module scope" (you used \`require\` in an ESM file) and "Cannot use import statement outside a module" (you used \`import\` in a CommonJS file). The fix is to pick one style per project and set \`"type"\` (or the file extension) to match.

**npm and package.json, the shopping list of your project:**

- \`npm init -y\` creates **package.json**; \`npm init playwright@latest\` scaffolds a Playwright project.
- \`dependencies\` are needed at run time by the app; \`devDependencies\` are tools for development and testing. \`@playwright/test\` belongs in **devDependencies** (\`npm i -D @playwright/test\`).
- \`"scripts"\`: \`"test": "playwright test"\` lets anyone run \`npm test\`; other scripts run with \`npm run <name>\`.
- Versions use **semver** (\`major.minor.patch\`); \`^1.48.0\` allows newer 1.x versions. **package-lock.json** records the exact versions installed: commit it.
- \`npm install\` may update the lock file; **\`npm ci\`** installs exactly what the lock file says and is what CI pipelines should run.
- \`npx playwright test\` runs a package's command without a global install. \`node_modules\` is never committed (it goes in .gitignore).`,
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
console.log(typeof require);             // → 'undefined' (no require in ESM)`,
        },
      ],
      keyPoints: [
        'CJS: require/module.exports. ESM: import/export. Pick one per project.',
        '"type": "module" in package.json makes .js files ESM.',
        'Commit package-lock.json; CI runs npm ci; @playwright/test is a devDependency.',
      ],
      source: 'Node.js docs — Modules: ECMAScript modules, packages ("type"); npm Docs — package.json, npm ci',
    },
    {
      heading: 'try, catch and finally',
      body: `**Intuition:** \`try\` is "attempt this risky step", \`catch\` is "plan B if it blows up", \`finally\` is "clean the test environment no matter what happened", like logging out and deleting the test booking whether the test passed or failed.

- Code in \`try\` runs until something **throws**. Execution then jumps straight to \`catch (err)\`; the rest of \`try\` is skipped.
- \`finally\` runs **always**: after success, after a caught error, after an uncaught error, even after a \`return\` inside \`try\`.
- A \`return\` inside \`finally\` overrides earlier returns and even swallows thrown errors. Never return from \`finally\`.
- \`try/catch\` only catches errors thrown **while the try block is running**. A callback that throws later (e.g. inside \`setTimeout\`) is not caught, and a promise is only caught if you \`await\` it inside the try (see the async topic).
- \`catch\` without a parameter (\`catch { ... }\`) is allowed when you do not need the error.

**The tester's golden rule:** do **not** wrap assertions in try/catch and just log. \`expect\` fails a test by **throwing**; if you catch that error and carry on, the test reports **passed**. Catch only when you can genuinely handle the error (retry, convert it to a clearer error, clean up) and otherwise **rethrow**.

**Cleanup in Playwright:** the preferred place is a fixture (code after \`use()\`) or \`afterEach\`, but \`try/finally\` inside a test is a clear way to guarantee one-off cleanup, such as deleting a booking created through the API.`,
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
// → try start, parsed, finally, 9.99
console.log(parsePrice(null));
// → try start, caught: TypeError, finally, null

// BUG: swallowing an assertion error makes a failing check "pass"
function assertEqual(a, b) { if (a !== b) throw new Error(a + ' !== ' + b); }
try {
  assertEqual(2, 3);
} catch (e) {
  console.log('logged and ignored:', e.message);  // the test runner never sees it
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
        'finally always runs; use it for cleanup, never for return.',
        'Catching an assertion error without rethrowing turns a failure into a pass.',
        'try/catch only catches what happens while try is executing (await promises inside it).',
      ],
      source: 'javascript.info — Error handling, "try...catch"; MDN — try...catch',
    },
    {
      heading: 'throw, Error types and custom errors',
      body: `**Intuition:** \`throw\` is pulling the emergency cord. The error object is the incident report: **name** (what kind), **message** (what happened) and **stack** (where).

**Built-in error types you will see:**

| Error | Typical cause | Example |
|---|---|---|
| \`TypeError\` | using a value the wrong way | \`null.length\`, calling a non-function |
| \`ReferenceError\` | variable does not exist | typo: \`pagee.goto()\` |
| \`SyntaxError\` | invalid code or invalid JSON | \`JSON.parse('{bad')\` |
| \`RangeError\` | number out of allowed range | \`new Array(-1)\`, \`toFixed(200)\` |
| \`AggregateError\` | several errors at once | \`Promise.any\` when all reject |
| Playwright \`TimeoutError\` | an action or wait exceeded its timeout | element never became visible |

**Always throw Error objects**, not strings: \`throw 'failed'\` has no stack trace and no \`name\`, so reports become useless.

**Custom errors** make failures self-explanatory and let callers react by type with \`instanceof\`:

1. \`class ApiError extends Error\`.
2. Call \`super(message, { cause })\` first.
3. Set \`this.name = 'ApiError'\` (otherwise it shows as plain "Error").
4. Add useful fields (\`status\`, \`url\`, \`body\`).

\`{ cause }\` (ES2022) chains the original error so you add context without losing the root problem. Playwright exports \`errors.TimeoutError\` from \`@playwright/test\` so you can check \`err instanceof errors.TimeoutError\` when a timeout is an expected outcome.`,
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
  console.log(err.name, err.status, err.url);   // → 'ApiError' 404 '/booking/999'
  console.log(String(err));                     // → 'ApiError: Request failed with 404'
}

// Built-in types
try { JSON.parse('{bad'); } catch (e) { console.log(e.name); }  // → 'SyntaxError'
try { null.length; } catch (e) { console.log(e.name); }         // → 'TypeError'
try { undefinedVar; } catch (e) { console.log(e.name); }        // → 'ReferenceError'

// Wrapping with cause keeps the root problem
const wrapped = new Error('Login step failed', { cause: new Error('401 Unauthorized') });
console.log(wrapped.cause.message);             // → '401 Unauthorized'`,
        },
      ],
      keyPoints: [
        'throw new Error(...) (never a string) to keep name, message and stack.',
        'Custom errors: extend Error, call super, set this.name, add fields.',
        'Use { cause } to add context without losing the original error.',
      ],
      source: 'javascript.info — Custom errors, extending Error; MDN — Error.prototype.cause; Playwright docs — errors.TimeoutError',
    },
    {
      heading: 'Debugging in VS Code and Node',
      body: `**Intuition:** \`console.log\` is shouting questions into a dark room. A **debugger** turns on the lights: it pauses the program on a line and lets you look at every variable, then step forward one line at a time.

**A practical toolkit, from quick to powerful:**

1. **Read the error properly.** The first line is the type and message; the stack trace below shows file:line, top frame first. Click the first frame that is **your** code.
2. **console helpers:** \`console.log('label', value)\` (always label!), \`console.table(arrayOfObjects)\` for test data, \`console.dir(obj, { depth: null })\` for nested JSON, \`console.time('x')\` / \`console.timeEnd('x')\` for durations.
3. **Breakpoints in VS Code:** click left of a line number (red dot). Open a **JavaScript Debug Terminal** (Command Palette → "JavaScript Debug Terminal") and run \`node script.js\` or \`npx playwright test\` there; execution pauses at your breakpoints.
4. **\`debugger;\` statement:** pauses there whenever a debugger is attached.
5. **Node inspector:** \`node --inspect-brk script.js\` pauses on the first line; attach from VS Code or chrome://inspect.
6. **Playwright tools:** \`npx playwright test --debug\` opens the Inspector and steps through actions; \`await page.pause()\` pauses at a specific point; the VS Code Playwright extension runs a single test with breakpoints.

**While paused:** hover variables, use the **Watch** panel, the **Call Stack**, and **Step Over** (F10), **Step Into** (F11), **Continue** (F5).

**Habit that impresses interviewers:** reproduce with the smallest input, form a hypothesis, prove it in the debugger, fix, then add a test (or an assertion) that would have caught it.`,
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
console.log(totalOf([1, 2, '3']));  // → '33' : the debugger shows sum becomes the string '33'
console.timeEnd('sum');             // → sum: 0.05ms (varies)

// Run with:  node --inspect-brk debug-me.js   (then attach from VS Code)
// Playwright: npx playwright test login.spec.ts --debug`,
        },
      ],
      keyPoints: [
        'Read the stack trace top-down and jump to the first frame in your own code.',
        'JavaScript Debug Terminal + breakpoints works for node and npx playwright test.',
        'Label every console.log; use console.table for arrays of objects.',
      ],
      source: 'VS Code docs — Node.js debugging; Node.js docs — Debugging guide; Playwright docs — Debugging tests',
    },
    {
      heading: 'Dates for test data',
      body: `**Intuition:** dates are the most common source of "works on my machine" test data bugs: time zones, 0-based months and end-of-month overflow. Learn a few safe recipes and reuse them.

**Facts to remember:**

- \`new Date()\` is "now"; \`Date.now()\` is the current time as milliseconds since 1 Jan 1970 UTC (a number, great for unique IDs).
- **Months are 0-based**: \`new Date(2026, 0, 31)\` is 31 January. Days of the month are 1-based.
- \`toISOString()\` gives \`'2026-10-14T09:30:00.000Z'\` in **UTC**; \`.slice(0, 10)\` gives \`'YYYY-MM-DD'\`, the format many APIs (e.g. Restful Booker check-in/check-out dates) expect.
- Setters **overflow**: \`setDate(32)\` or "31 January + 1 month" rolls into March. Useful for "add N days", dangerous for "add a month".
- Local vs UTC: \`getDate()\` uses the machine's time zone, \`getUTCDate()\` uses UTC. A CI server in UTC and a laptop in India (UTC+5:30) can disagree about "today" around midnight. Pick UTC for data you send to APIs.
- For heavy date work, teams use libraries like date-fns or Day.js; for test data the built-ins are usually enough.

**Recipes:** unique email \`'qa+' + Date.now() + '@example.com'\`; "tomorrow" and "in 3 days" for a booking; a date-of-birth exactly 18 years ago for an age-gate boundary test.`,
      code: [
        {
          language: 'javascript',
          title: 'Booking dates and unique data',
          code: `// YYYY-MM-DD in UTC, N days from a base date
function isoDatePlus(days, base = new Date()) {
  const d = new Date(base);                // copy: setters mutate
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const base = new Date('2026-10-14T00:00:00Z');
console.log(isoDatePlus(1, base));         // → '2026-10-15'
console.log(isoDatePlus(30, base));        // → '2026-11-13'  (rolls into November)

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
console.log(d.toDateString());             // → 'Tue Mar 03 2026'

// Unique per run
console.log(typeof Date.now());            // → 'number'
const email = 'qa+' + Date.now() + '@example.com';  // e.g. 'qa+1791963000000@example.com'`,
        },
      ],
      keyPoints: [
        'Month index 0 = January; toISOString is UTC.',
        'Copy a Date before calling setters; they mutate.',
        'Use UTC-based helpers for API dates so CI and laptops agree.',
      ],
      source: 'MDN Web Docs — Date; javascript.info — Date and time; Restful Booker API docs',
    },
  ],
  codeChallenges: [
    {
      id: 'js-loops-modules-errors-cc-1',
      title: 'The test-data script that lies',
      context:
        'A script builds users for a data-driven signup test and validates an exported list of order IDs. It "works" but the test data is subtly wrong and validation never reports problems.',
      task: 'Fix the loop and validation bugs in `makeData(roles, orderIds)`. It returns `{ users, problems }`: exactly one user per role (`{ email: \'user1@example.com\', role }`, numbered from 1) and one message per invalid order ID, in the form `row N: invalid id "<id>"` with a 1-based row number. Valid IDs look like `A-123`. Press Run to check your fix.',
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
        'What type is `index` in a for...in loop, and what does "row " + index + 1 produce?',
        'Should validation stop at the first bad ID? What does returning from a forEach callback do?',
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

1. **\`i <= roles.length\`** ran 4 times; the 4th user had \`role: undefined\`. Use \`< length\`, or better, \`map\` over the roles so the count always matches.
2. **\`var i\`** leaks out of the loop and is shared by any callbacks created inside it. Use \`let\` (or no counter at all with \`map\`).
3. **for...in gives string keys**, so \`'row ' + index + 1\` printed "row 21" instead of "row 3". Use \`for...of\` with \`entries()\` to get a numeric index, and wrap arithmetic in parentheses before concatenating.
4. **\`break\` after the first problem** hid the second bad ID. A validator should collect all problems so one run shows the full picture.
5. **Returning a value from a forEach callback does nothing**: it neither stops the loop nor reports anything. Collect results and \`throw\` an Error so the script (or test) fails with a clear message (in the lab, \`makeData\` returns the collected problems and the caller throws).`,
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
          a: 'Without the anchors, /A-\\d{3}/ would accept "XA-1000Y" because it only needs to find the pattern somewhere inside the string. ^ and $ force the whole value to match. The regex also catches the letter-O-instead-of-zero typo, which a simple startsWith("A-") check would miss.',
        },
        {
          q: 'How would you turn this into a Playwright data-driven test?',
          a: 'Export the users array from a data module, then loop at the top level of the spec: for (const user of users) { test("signup as " + user.role, async ({ page }) => { ... }); }. Each iteration registers a separate test with a unique title, so reports show which role failed, and the tests can run in parallel.',
        },
      ],
    },
    {
      id: 'js-loops-modules-errors-cc-2',
      title: 'A booking helper that hides failures',
      context:
        'This helper module is imported by several Playwright specs to create and delete Restful Booker bookings. When the API is down, tests fail much later with confusing "Cannot read properties of undefined" errors, and test bookings pile up on the server.',
      task: 'Fix `createBooking` and `withBooking` so failures are reported immediately with a clear, typed error (`ApiError` with message `POST /booking failed: <status> <response text>`), any 2xx status counts as success, and cleanup always runs and sends the auth token. The tests call `async runScenario(createStatus, testFails)`, which runs one "spec" through `withBooking` against a fake `request` (no network) and resolves with `{ outcome, calls }`: `\'passed\'` or `\'<ErrorName>: <message>\'`, plus the list of requests and test steps in order. The lab harness at the bottom does not need changes. Press Run to check your fix.',
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
        'What does createBooking return when the POST fails, and where will that surface?',
        'What is missing from a thrown string compared to an Error?',
        'Which block runs even if testBody throws? And which export syntax matches "type": "module"?',
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

1. **The catch swallowed the error** and the function returned \`undefined\`; the failure surfaced later as an unrelated TypeError. Let it throw (no try/catch at all here), so the test fails at the real cause.
2. **\`throw 'create failed'\`** had no stack, no type and no detail. A custom \`ApiError\` carries the status and response text and can be checked with \`instanceof\`.
3. **\`!= 200\`** used loose equality and a single code; \`res.ok()\` covers the whole 2xx range clearly.
4. **Cleanup was skipped** when \`testBody\` threw. \`try/finally\` guarantees the DELETE. Note there is **no catch**: the original test failure still propagates after cleanup.
5. **Restful Booker's DELETE needs auth** (a token cookie or Basic auth), so the helper now takes a token; without it cleanup silently failed with 403.
6. **\`module.exports\` in a \`"type": "module"\` project** throws "module is not defined in ES module scope". Use \`export\` consistently. (In a real suite, a Playwright fixture is an even better home for create/delete.) The lab code leaves the export lines out because it runs as a plain script.`,
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
          a: 'The error thrown in finally replaces the original one, so you would see the cleanup failure and lose the real test failure. To be safe, wrap the cleanup in its own try/catch that logs (or attaches) the cleanup error but does not throw, so the original assertion error is the one reported. Playwright fixtures report teardown errors separately, which is another reason to move this into a fixture.',
        },
        {
          q: 'How would this look as a Playwright fixture?',
          a: 'test.extend({ booking: async ({ request }, use) => { const id = await createBooking(request, data); await use(id); await deleteBooking(request, id); } }). Code after use() is teardown and runs even when the test fails, tests just declare ({ booking }) as a parameter, and there is no try/finally boilerplate in each spec.',
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
        'for...of = values of iterables; for...in = string keys of objects',
        'Knows forEach cannot break and ignores await',
        'Chooses for...of with await for sequential Playwright actions',
        'Mentions Object.entries for objects',
      ],
      modelAnswer: `**Short version:** for...of iterates **values**, for...in iterates **keys**, forEach is an **array method** that calls a function per item.

| | for...of | for...in | forEach |
|---|---|---|---|
| Gives | values | string keys (incl. inherited) | (value, index, array) |
| Works on | arrays, strings, Sets, Maps | objects | arrays (and Set/Map/NodeList have their own) |
| break / continue | yes | yes | no |
| await inside pauses the loop | yes | yes | **no** |

**Why it matters in tests:**

- for...in on an array gives \`'0'\`, \`'1'\` as **strings**, so \`i + 1\` becomes \`'01'\`, and any extra properties on the array show up too. I don't use it on arrays.
- forEach with an async callback starts every callback and returns immediately. In a Playwright test the test can finish before the clicks happen, and failures become unhandled rejections instead of test failures.

**What I use:**

- Acting on several elements in order: \`for (const row of await page.getByRole('row').all()) { await expect(row).toBeVisible(); }\`
- Objects (e.g. form data): \`for (const [label, value] of Object.entries(formData)) await page.getByLabel(label).fill(value);\`
- Pure transformations with no await: \`map\`/\`filter\`.
- Data-driven tests: a top-level for...of that calls \`test(...)\` once per data row, giving each case its own name in the report.`,
      followUps: [
        {
          q: 'How do you run the actions in parallel instead of one by one?',
          a: 'Map the items to promises and await them together: await Promise.all(items.map((x) => doSomething(x))). That is fine for independent API calls, but for UI actions on a single page I keep them sequential because a user cannot click six things at once and re-renders between clicks can cause races.',
        },
        {
          q: 'Is for...in ever the right choice?',
          a: 'Rarely. It enumerates enumerable string keys of an object, including inherited ones, so it can surprise you. Object.keys/entries return only own properties and give you an array you can loop with for...of, sort or filter. I would only use for...in in old code or when I explicitly want inherited keys.',
        },
      ],
      pitfalls: [
        'Saying for...in and for...of are interchangeable.',
        'Using forEach with async callbacks in test code.',
        'Not knowing that for...in keys are strings.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-02',
      difficulty: 'easy',
      question: 'How do you stop a loop as soon as you find what you are looking for? Show it with a list of test results where you need the first failure.',
      whatInterviewerLooksFor: [
        'Uses break in for/for...of, or find/findIndex/some',
        'Knows forEach cannot be stopped and return only skips one item',
        'Handles the "not found" case',
        'Mentions labelled break for nested loops',
      ],
      modelAnswer: `**Three good options:**

**1. for...of with break** (clear, works with await):

    let firstFail = null;
    for (const r of results) {
      if (r.status === 'failed') { firstFail = r; break; }
    }

**2. Built-ins that stop early by design:** \`results.find((r) => r.status === 'failed')\` returns the item or \`undefined\`; \`findIndex\` gives the position or \`-1\`; \`some\` answers yes/no. These are the most readable when there is no \`await\` involved.

**3. Nested data with a label:** when results are grouped by spec file, \`files: for (const file of specs) { for (const t of file.tests) { if (t.status === 'failed') { hit = t; break files; } } }\` leaves both loops at once.

**What does NOT work:** \`results.forEach(r => { if (r.status === 'failed') return; })\`. \`return\` ends only that callback call; the loop continues to the end. Throwing an exception to escape forEach "works" but is a misuse of errors.

**Handle "not found":** decide what absence means. For "first failure" in a report, \`undefined\` probably means "all passed". For "find the user row in the table", absence is a test failure, so I'd assert it explicitly with a clear message rather than crash later on \`undefined.name\`.

**Bonus:** \`continue\` is the sibling of \`break\`: skip this item (e.g. skipped tests) and go on to the next.`,
      followUps: [
        {
          q: 'What if each check needs an await, like reading text from a locator?',
          a: 'Use for...of with await and break: for (const row of await rows.all()) { if ((await row.textContent())?.includes("Asha")) { target = row; break; } }. find and some do not await their callbacks, so an async predicate returns a Promise, which is always truthy. In Playwright the even better tool is a filtered locator: page.getByRole("row").filter({ hasText: "Asha" }).',
        },
        {
          q: 'What is the difference between break and return inside a loop in a function?',
          a: 'break leaves only the loop and continues with the code after it in the same function. return leaves the whole function immediately, so it also stops the loop. Returning early from a helper (return r as soon as it matches) is often the cleanest way to write "find first" by hand.',
        },
      ],
      pitfalls: [
        'Believing return inside forEach stops the loop.',
        'Using filter(...)[0], which scans the whole array.',
        'Passing an async callback to find/some.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-03',
      difficulty: 'medium',
      question: 'Explain named vs default exports. How would you organise page objects, fixtures and helpers in a Playwright project using modules?',
      whatInterviewerLooksFor: [
        'Correct import syntax for both kinds',
        'A sensible folder structure (pages, fixtures, utils, tests, data)',
        'Awareness that module state is shared and evaluated once',
        'A consistent team convention and its reasoning',
      ],
      modelAnswer: `**Named exports:** any number per file; imported with braces and the exact name (rename with \`as\`).

    export const BASE_URL = 'https://www.saucedemo.com';
    export function uniqueEmail() { /* ... */ }
    // import { BASE_URL, uniqueEmail as email } from '../utils/data';

**Default export:** one per file, imported without braces under any name.

    export default class LoginPage { /* ... */ }
    // import LoginPage from '../pages/LoginPage';

**Trade-off:** a default import can be renamed freely, which allows inconsistent names across the codebase; named imports are checked by name and editors auto-import them reliably. Many teams therefore use named exports everywhere, or default only for "one class per file" page objects. Consistency matters more than the choice.

**Structure I would propose:**

| Folder | Contents | Exports |
|---|---|---|
| \`pages/\` | LoginPage, InventoryPage, CartPage | one class each |
| \`fixtures/\` | \`test = base.extend({...})\` with page objects and API setup | \`export const test\`, \`export { expect }\` |
| \`utils/\` | data builders, date helpers, API helpers | small named functions |
| \`data/\` | JSON test data | imported where needed |
| \`tests/\` | \`*.spec.ts\` | nothing |

Specs then import \`test\` and \`expect\` from \`../fixtures\` instead of \`@playwright/test\`, so every test gets the page objects injected.

**Two module facts that cause real bugs:** a module runs **once per process** and is shared; a mutable array exported from \`utils/data.ts\` and pushed to by one test leaks into the next test in the same worker. And modules are strict mode, so an accidental undeclared variable throws instead of silently becoming global.`,
      followUps: [
        {
          q: 'What is a barrel file, and is it a good idea?',
          a: 'A barrel is an index.ts that re-exports from several files (export * from "./LoginPage"), so specs can import { LoginPage, CartPage } from "../pages". It shortens imports, but it can create circular imports and makes it harder to see where things come from. Fine for a small set of page objects; avoid deep chains of barrels.',
        },
        {
          q: 'Why should specs import test from your fixtures file rather than from @playwright/test?',
          a: 'Because the extended test object carries your custom fixtures (page objects, logged-in state, API helpers). Importing the base test would compile but those fixtures would be missing, and TypeScript would complain when a test asks for them. Re-exporting expect from the same file keeps a single import line per spec.',
        },
      ],
      pitfalls: [
        'Putting curly braces around a default import (or forgetting them for a named one).',
        'Exporting mutable shared arrays/objects as "global test data".',
        'No consistent structure: helpers duplicated inside each spec.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-04',
      difficulty: 'medium',
      question: 'You run a script and get "require is not defined in ES module scope". What does it mean and how do you fix it? Explain CommonJS vs ES modules.',
      whatInterviewerLooksFor: [
        'Recognises the CJS/ESM mismatch',
        'Knows how Node chooses: "type" field and .mjs/.cjs extensions',
        'Offers fixes in both directions',
        'Knows ESM details: static imports, top-level await, no __dirname',
      ],
      modelAnswer: `**What it means:** Node is treating the file as an **ES module** (because package.json has \`"type": "module"\` or the file ends in \`.mjs\`), and ES modules do not have \`require\`, \`module.exports\`, \`__dirname\` or \`__filename\`.

**CommonJS vs ESM in one breath:** CommonJS is Node's original system (\`require\` / \`module.exports\`, loaded synchronously at run time). ES modules are the JavaScript standard (\`import\` / \`export\`, analysed before the code runs, used by browsers and modern Node, with top-level \`await\`).

**How Node decides:**

| File | Treated as |
|---|---|
| \`.mjs\` | ESM |
| \`.cjs\` | CommonJS |
| \`.js\` with \`"type": "module"\` | ESM |
| \`.js\` without it | CommonJS |

**Fixes:**

1. **Go with ESM (recommended):** replace \`const x = require('x')\` with \`import x from 'x'\`, \`module.exports = {...}\` with \`export\`, and \`__dirname\` with \`import.meta.dirname\` (Node 20.11+). Add file extensions to relative imports.
2. **Stay with CommonJS:** remove \`"type": "module"\` or rename the file to \`.cjs\`.
3. **Need a CommonJS-only package from ESM?** \`import pkg from 'pkg'\` usually works (you get \`module.exports\` as the default), or use \`createRequire(import.meta.url)\` from \`node:module\`.

The reverse error, "Cannot use import statement outside a module", is the same mismatch the other way round.

**Playwright context:** test files are usually TypeScript and always use \`import\`; Playwright transpiles them and supports projects with or without \`"type": "module"\`. The errors mostly appear in plain \`.js\` utility scripts (data seeding, report uploads) that live next to the tests.`,
      followUps: [
        {
          q: 'How do you get the current folder path in an ES module?',
          a: 'Use import.meta.dirname (and import.meta.filename) on Node 20.11 or later. On older versions: import { fileURLToPath } from "node:url"; const __dirname = path.dirname(fileURLToPath(import.meta.url)). This matters for reading test data files relative to the spec instead of the current working directory, which differs between your laptop and CI.',
        },
        {
          q: 'What is dynamic import and when would you use it?',
          a: 'await import("./module.js") loads a module at run time and returns a promise of its exports. It works in both CommonJS and ESM, so it is the bridge when CJS code needs an ESM-only package. It is also useful for loading environment-specific config or heavy tools only when needed.',
        },
      ],
      pitfalls: [
        'Mixing require and import in the same file and hoping it works.',
        'Deleting "type": "module" without understanding what else depends on it.',
        'Not knowing that __dirname is missing in ESM.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-05',
      difficulty: 'medium',
      question: 'Walk me through package.json in a Playwright project. What is the difference between dependencies and devDependencies, and between npm install and npm ci?',
      whatInterviewerLooksFor: [
        'Explains scripts, devDependencies and semver ranges',
        'Knows package-lock.json is committed and why',
        'npm ci for CI: clean, exact, fails on mismatch',
        'Knows npx and that node_modules is not committed',
      ],
      modelAnswer: `**package.json is the project's manifest:** name, version, \`"type"\`, **scripts**, and the list of packages it needs.

**scripts** give the team shared commands: \`"test": "playwright test"\` (run with \`npm test\`), \`"test:smoke": "playwright test --grep @smoke"\` (run with \`npm run test:smoke\`). CI calls the same scripts, so "how we run tests" is defined in one place.

**dependencies vs devDependencies:**

- \`dependencies\`: needed when the **application** runs in production (express, react).
- \`devDependencies\`: needed only to build, lint or **test**. A test project's packages, \`@playwright/test\`, \`@types/node\`, \`dotenv\`, \`@faker-js/faker\`, are devDependencies (\`npm i -D ...\`). \`npm install --omit=dev\` skips them for production images.

**Versions (semver):** \`MAJOR.MINOR.PATCH\`. \`^1.48.0\` accepts any 1.x ≥ 1.48.0; \`~1.48.0\` accepts only patches; \`1.48.0\` is exact. Playwright updates also update browser builds, so many teams pin an exact version and upgrade deliberately.

**package-lock.json** records the exact resolved version of every package, including sub-dependencies. **Commit it**: it is what makes two machines install identical trees.

**npm install vs npm ci:**

| | npm install | npm ci |
|---|---|---|
| Reads | package.json (lock as a guide) | package-lock.json strictly |
| Can modify lock | yes | never; errors if it disagrees with package.json |
| node_modules | updates in place | deletes and reinstalls |
| Use | local development, adding packages | CI pipelines |

**Also:** after installing \`@playwright/test\` you run \`npx playwright install --with-deps\` to download browsers (and OS dependencies on Linux CI); \`npx\` runs a package's CLI without a global install; \`node_modules/\` goes in \`.gitignore\`.`,
      followUps: [
        {
          q: 'Tests pass locally but fail in CI right after a Playwright upgrade. What would you check first?',
          a: 'Whether CI installed the same versions: is package-lock.json committed and does CI use npm ci? Then whether the browsers match the library version (npx playwright install --with-deps runs after npm ci, or the CI uses the matching mcr.microsoft.com/playwright Docker tag). Finally read the release notes for behaviour changes and compare traces from both environments.',
        },
        {
          q: 'What is the difference between npm i -D and npm i -g?',
          a: '-D saves the package to devDependencies of this project, so every teammate and CI get it from package.json. -g installs it globally on your machine only, which is invisible to the project and causes "works on my machine" problems. For project tools prefer a local devDependency run with npx or an npm script.',
        },
      ],
      pitfalls: [
        'Adding package-lock.json to .gitignore.',
        'Putting @playwright/test in dependencies "because tests need it".',
        'Using npm install in CI and getting different versions per run.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-06',
      difficulty: 'medium',
      question: 'When should you use try/catch inside a Playwright test, and when is it harmful? How do you guarantee cleanup of test data?',
      whatInterviewerLooksFor: [
        'Knows expect throws and catching it hides failures',
        'Uses try/finally (no catch) or fixtures/afterEach for cleanup',
        'Catches only to add context, recover, or handle an expected condition, then rethrows',
        'Mentions that try/catch needs await to catch async failures',
      ],
      modelAnswer: `**How failures work:** a Playwright assertion or action **throws** when it fails (or times out). The runner marks the test failed when an error escapes the test function. Anything that stops the error from escaping can turn a failure into a pass.

**Harmful uses:**

- \`try { await expect(cartBadge).toHaveText('2'); } catch (e) { console.log(e); }\`: the test reports **passed**.
- Wrapping a whole test in try/catch "to take a screenshot": Playwright already does that with \`screenshot: 'only-on-failure'\` and traces.
- Using try/catch as control flow: \`try { await banner.click({ timeout: 2000 }); } catch {}\` to dismiss an optional popup. It hides real problems and adds a fixed delay. Prefer \`page.addLocatorHandler\` for overlays that appear unpredictably, or check state deterministically.

**Good uses:**

1. **Add context and rethrow:** \`catch (e) { throw new Error('Checkout step failed for user ' + user, { cause: e }); }\`.
2. **Expected failure is the test:** asserting that an API helper rejects (\`await expect(promise).rejects.toThrow(...)\` is often cleaner).
3. **Cleanup with try/finally:** create data, run the steps inside \`try\`, delete in \`finally\`. No \`catch\`, so the original failure still propagates after cleanup.

**Where cleanup belongs in a real suite:** a fixture. Code after \`await use(booking)\` is teardown and runs even when the test fails; Playwright reports teardown errors separately. \`afterEach\` also works for per-test cleanup.

**Async detail:** \`try { page.click(...) } catch\` without \`await\` catches nothing, because the promise rejects after the try block has finished. Always \`await\` inside try.`,
      followUps: [
        {
          q: 'How do you make a test continue after a failed check but still fail at the end?',
          a: 'Use soft assertions: await expect.soft(locator).toHaveText("..."). The failure is recorded, the test keeps running so you see all problems in one run, and the test is marked failed at the end. That is the right tool instead of try/catch around each assertion.',
        },
        {
          q: 'An error in finally hides the original test error. How do you avoid that?',
          a: 'Keep cleanup code defensive: wrap it in its own try/catch and log or attach the cleanup error without rethrowing, so the original assertion error remains the reported one. Moving cleanup into a fixture avoids the problem because Playwright reports test errors and teardown errors separately.',
        },
      ],
      pitfalls: [
        'try/catch around expect with only a console.log.',
        'Catching without await so nothing is caught.',
        'Putting cleanup after the assertions where it is skipped on failure.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-07',
      difficulty: 'hard',
      question: 'Design a custom error for API failures in your test framework. Why bother, and how would callers use it?',
      whatInterviewerLooksFor: [
        'Correct subclassing: super, this.name, extra fields',
        'Uses cause to preserve the original error',
        'Callers branch with instanceof, not message string matching',
        'Explains the payoff: faster triage in reports',
      ],
      modelAnswer: `**Why:** a raw failure like "TypeError: Cannot read properties of undefined (reading 'bookingid')" tells you nothing. An \`ApiError: POST /booking returned 503 (Service Unavailable)\` with the URL and response body tells the person triaging the report exactly where to look, and lets code react by **type**.

**Design:**

    export class ApiError extends Error {
      constructor(message, { status, method, url, body, cause } = {}) {
        super(message, { cause });          // cause keeps the root error (ES2022)
        this.name = 'ApiError';             // shows in stack traces and reports
        this.status = status;
        this.method = method;
        this.url = url;
        this.body = body;                   // truncated response text
      }
    }

Optionally subclasses: \`class AuthError extends ApiError\` (401/403), \`class NotFoundError extends ApiError\` (404).

**Throwing it** in a central request helper:

    if (!res.ok()) {
      throw new ApiError(method + ' ' + url + ' returned ' + res.status(), {
        status: res.status(), method, url, body: (await res.text()).slice(0, 500),
      });
    }

**Using it:**

- Most tests do nothing special: the error escapes, the test fails, the report shows a clear message.
- A setup step can react by type: \`if (err instanceof AuthError) { await refreshToken(); retry once; } else throw err;\`.
- A negative test asserts the type: \`await expect(getBooking(999)).rejects.toBeInstanceOf(NotFoundError)\`.

**Rules:** branch with \`instanceof\` or \`status\`, never by matching message text; always rethrow what you cannot handle; never put tokens or passwords into the message or body, because reports are shared.`,
      followUps: [
        {
          q: 'Why set this.name explicitly?',
          a: 'Error subclasses inherit name = "Error" from the prototype, so without setting it the stack trace and String(err) start with "Error:" and you lose the type at a glance. Setting this.name = "ApiError" (or this.constructor.name) makes reports and logs show the real type. instanceof works either way because it checks the prototype chain.',
        },
        {
          q: 'What is the difference between wrapping with cause and just rethrowing?',
          a: 'Rethrowing passes the same error up unchanged. Wrapping creates a new error with higher-level context ("Checkout setup failed for user Asha") and keeps the original in err.cause, so Node and most reporters print both. Use wrapping when the extra context helps triage, and plain rethrow when you have nothing to add.',
        },
      ],
      pitfalls: [
        'throw "API failed" (a string): no stack trace, no type.',
        'Matching on error message text to decide what to do.',
        'Logging secrets in error messages.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-08',
      difficulty: 'easy',
      question: 'A helper script crashes with "TypeError: Cannot read properties of undefined". Walk me through how you would debug it in VS Code.',
      whatInterviewerLooksFor: [
        'Reads the message and stack trace to the exact line',
        'Uses breakpoints / JavaScript Debug Terminal rather than random logs',
        'Forms and verifies a hypothesis (which value is undefined and why)',
        'Fixes the cause and adds a guard or test',
      ],
      modelAnswer: `**1. Read the error.** "Cannot read properties of undefined (reading 'price')" means something before \`.price\` was \`undefined\`. The first stack frame in my own file gives the exact line, e.g. \`cart.js:14\`.

**2. Reproduce minimally.** Run just that script with the smallest input that fails. Intermittent? Note which data triggers it.

**3. Pause at the line.** Set a breakpoint on line 14 (click the gutter), open a **JavaScript Debug Terminal** and run \`node cart.js\` (or \`npx playwright test cart.spec.ts\`). When it pauses, hover the variables or add them to **Watch**. A conditional breakpoint (\`item === undefined\`) helps inside loops.

**4. Walk back with the Call Stack** to see where the bad value came from: an array index past the end (\`items[items.length]\`), \`find\` returning \`undefined\`, a wrong property name in API JSON (\`booking.bookingId\` vs \`bookingid\`), or an un-awaited promise.

**5. Verify the hypothesis.** In the Debug Console evaluate \`items.length\` and \`i\`. If \`i === items.length\`, it is an off-by-one \`<=\`.

**6. Fix the cause, not the symptom.** Change the loop condition rather than sprinkling \`?.\` everywhere. Optional chaining is right when the value is genuinely optional, wrong when it hides a bug.

**7. Prevent recurrence.** Add a guard with a clear error ("No product named X in cart") or a unit test for the helper.

Without VS Code: \`node --inspect-brk cart.js\` and attach from chrome://inspect, or a temporary labelled \`console.log\`. In a Playwright test, \`--debug\`, \`page.pause()\` and the trace viewer cover the browser side.`,
      followUps: [
        {
          q: 'When would you still use console.log instead of the debugger?',
          a: 'For quick checks, for code that runs in CI where you cannot attach a debugger, and for timing-sensitive async issues where pausing changes the behaviour. I label every log (console.log("cart items", items)) and remove them before committing; for test runs, test.info().attach or annotations keep useful data in the report instead.',
        },
        {
          q: 'What does optional chaining (?.) change here and why can it be dangerous?',
          a: 'item?.price returns undefined instead of throwing when item is undefined. That is correct if a missing item is valid, but in tests it often hides the real bug: the sum becomes NaN or the assertion compares undefined, and the failure moves somewhere less obvious. Prefer an explicit check with a clear error when absence is unexpected.',
        },
      ],
      pitfalls: [
        'Adding console.log everywhere without reading the stack trace.',
        'Fixing with ?. without understanding why the value is undefined.',
        'Not reproducing with a minimal input first.',
      ],
    },
    {
      id: 'js-loops-modules-errors-iq-09',
      difficulty: 'hard',
      question: 'Generate test data for a hotel booking: check-in tomorrow, check-out 3 nights later, both as YYYY-MM-DD. What can go wrong with dates in tests?',
      whatInterviewerLooksFor: [
        'Correct add-days logic that handles month/year rollover',
        'Knows months are 0-based and Date setters mutate',
        'Understands UTC vs local time zone issues in CI',
        'Mentions deterministic dates or clock control for stable tests',
      ],
      modelAnswer: `**Helper:**

    function isoDatePlus(days, base = new Date()) {
      const d = new Date(base);                 // copy; setters mutate
      d.setUTCDate(d.getUTCDate() + days);      // rollover handled by Date
      return d.toISOString().slice(0, 10);      // 'YYYY-MM-DD' in UTC
    }
    const checkin = isoDatePlus(1);
    const checkout = isoDatePlus(4);            // 3 nights after check-in

\`setUTCDate(32)\` rolls into the next month automatically, so 30 December + 3 days becomes 2 January of the next year without extra code.

**What goes wrong:**

| Problem | Example | Prevention |
|---|---|---|
| 0-based months | \`new Date(2026, 1, 1)\` is **February** | use ISO strings or comments |
| Time zones | laptop in IST, CI in UTC; between 00:00 and 05:30 IST the "today" differs | do date maths in UTC for API data |
| Mixing local and UTC | \`getDate()\` with \`toISOString()\` can shift a day | use the UTC getters/setters consistently |
| Month overflow | 31 Jan + 1 month = 3 March | add days, or clamp to the month's last day |
| Mutation | \`base.setDate(...)\` changes the shared base | copy first |
| Non-deterministic tests | "tomorrow" is a Saturday sometimes and pricing differs | fix the date or control the clock |
| DST | a "day" is 23 or 25 hours locally | prefer UTC or whole-day helpers |

**Deterministic tests:** for UI logic that depends on "today", Playwright's **Clock API** (\`await page.clock.setFixedTime(new Date('2026-10-14T10:00:00Z'))\`) fixes the browser's time so the test behaves the same every day. For API data, pass an explicit base date.

**Boundary ideas to mention:** check-in today, check-out before check-in, same-day check-out, 29 February in a leap year, year end.`,
      followUps: [
        {
          q: 'How would you get the date exactly 18 years ago for an age-gate boundary test?',
          a: 'Copy today and subtract 18 from the year: const d = new Date(); d.setUTCFullYear(d.getUTCFullYear() - 18). Then also test one day less (just under 18) and one day more. Watch out for 29 February: subtracting years from 29 Feb 2028 lands on 1 March 2010, so decide the business rule and include a leap-day case.',
        },
        {
          q: 'Why not just hard-code dates like 2026-10-15 in the test?',
          a: 'Hard-coded dates rot: once that date is in the past, booking APIs reject it and the test fails for a reason unrelated to the code under test. Relative dates (tomorrow, +3 days) stay valid. Hard-coded dates are fine when you also control the clock, which makes the scenario fully deterministic.',
        },
      ],
      pitfalls: [
        'Adding 1 to getMonth() inconsistently or forgetting months are 0-based.',
        'Mixing local getters with toISOString (UTC) and getting off-by-one days.',
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
        '`continue outer` jumps to the next iteration of the OUTER loop (r++).',
        '`break outer` leaves both loops entirely.',
        'The inner loop restarts at c = 0 for each new r.',
      ],
      steps: [
        { label: 'r = 0, c = 0', calc: 'c !== 1, r !== 2 → log "0 0"' },
        { label: 'r = 0, c = 1', calc: 'c === 1 → continue outer → r becomes 1' },
        { label: 'r = 1, c = 0', calc: 'log "1 0"' },
        { label: 'r = 1, c = 1', calc: 'continue outer → r becomes 2' },
        { label: 'r = 2, c = 0', calc: 'c !== 1, but r === 2 → break outer: both loops end' },
      ],
      answer: 'Two lines: `0 0` and `1 0`.',
      insight: 'Labels change which loop continue/break act on. Without the label, continue would only skip to c = 2 of the inner loop, and break would only end the inner loop. Trace loops as a table of (r, c, action) and you will never guess wrong.',
      followUps: [
        {
          q: 'What would print without the labels (plain continue and break)?',
          a: 'r = 0: c = 0 logs "0 0", c = 1 continue, c = 2 logs "0 2". r = 1: logs "1 0" and "1 2". r = 2: c = 0 hits break (inner loop ends), then the outer loop also ends because r becomes 3. Output: 0 0, 0 2, 1 0, 1 2.',
        },
      ],
    },
    {
      id: 'js-loops-modules-errors-drill-2',
      question:
        'Predict every log and the final return value: `function f() { try { console.log("A"); throw new Error("x"); console.log("B"); } catch (e) { console.log("C", e.message); return "from catch"; } finally { console.log("D"); } console.log("E"); } console.log(f());`',
      assumptions: [
        'A throw skips the rest of the try block.',
        'finally runs before the function actually returns.',
        'finally has no return of its own here.',
      ],
      steps: [
        { label: 'try', calc: 'logs "A", then throw → "B" is skipped' },
        { label: 'catch', calc: 'logs "C x"; return "from catch" is scheduled' },
        { label: 'finally', calc: 'runs before leaving: logs "D"' },
        { label: 'after the block', calc: '"E" never runs: the function already returned' },
        { label: 'caller', calc: 'console.log(f()) logs "from catch"' },
      ],
      answer: '`A`, `C x`, `D`, `from catch`. B and E are never printed.',
      insight: 'finally always runs, even when try or catch returns, and it runs before the value reaches the caller. That is why cleanup goes in finally. If finally itself returned "from finally", it would override the catch result, so never return from finally.',
      followUps: [
        {
          q: 'What if the catch block rethrows instead of returning?',
          a: 'Logs are A, C x, D, and then the error propagates out of f, so console.log(f()) never runs and the caller sees the Error("x") (uncaught unless the caller has its own try/catch). finally still runs before the error leaves the function, which is exactly why try/finally is safe for cleanup in tests.',
        },
      ],
    },
    {
      id: 'js-loops-modules-errors-drill-3',
      question:
        'A data script builds a booking for "31 January + 1 month". Trace: `const d = new Date(2026, 0, 31); d.setMonth(d.getMonth() + 1); console.log(d.getMonth(), d.getDate());` What prints, and how would you make "+1 month" safe?',
      assumptions: [
        'Months are 0-based (0 = January, 1 = February, 2 = March).',
        'February 2026 has 28 days (2026 is not a leap year).',
        'Date setters roll extra days over into the next month.',
      ],
      steps: [
        { label: 'Start', calc: 'new Date(2026, 0, 31) → 31 January 2026; getMonth() = 0' },
        { label: 'setMonth(1)', calc: 'asks for "31 February 2026", which does not exist' },
        { label: 'Overflow', calc: 'February has 28 days → 31 − 28 = 3 days into March' },
        { label: 'Result', calc: '3 March 2026 → getMonth() = 2, getDate() = 3' },
      ],
      answer: '`2 3` (3 March 2026), not the end of February the author expected.',
      insight: 'Adding months is ambiguous at month ends; adding days is not. For "+1 month" clamp to the last day: set the date to 1, add the month, then set the date to Math.min(originalDay, daysInNewMonth), where daysInNewMonth = new Date(y, m + 1, 0).getDate().',
      followUps: [
        {
          q: 'Why does new Date(y, m + 1, 0) give the last day of month m?',
          a: 'Day 0 of a month means "one day before the 1st", which is the last day of the previous month. So new Date(2026, 2, 0) is 28 February 2026 and getDate() returns 28. It is a well-known trick for days-in-month and works across leap years automatically.',
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
        'for...of iterates the values of an iterable. for...in and Object.keys both give the indexes as strings ("0", "1", "2"). The classic for loop starts at 1 and uses <=, so it skips "chromium" and prints undefined at the end.',
      followUps: [
        { q: 'How do you get both the index and the value in a for...of loop?', a: 'Use entries(): for (const [i, value] of b.entries()) gives the numeric index and the value, which avoids the string-index trap of for...in and keeps break/continue/await available.' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-02',
      difficulty: 'easy',
      question: 'You want to stop iterating as soon as the first failed result is found. Which constructs can do that? Select ALL that apply.',
      options: ['for...of with break', 'results.forEach with return', 'results.find(...)', 'results.some(...)'],
      correct: [0, 2, 3],
      explanation:
        'break ends a for...of loop immediately; find and some stop at the first element whose callback returns truthy. In forEach, return only ends the current callback call and the loop continues with the next item, so it cannot stop early.',
      followUps: [
        { q: 'Which of those three would you choose if each check needs await?', a: 'for...of with break. find and some do not await their callbacks: an async callback returns a Promise, which is always truthy, so find would return the first element regardless of the real result.' },
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
        'The default export is imported without braces (any name works) and named exports go inside braces with their exact names, combined as default first. Option 1 treats the default as a named export, option 3 omits braces for the named one, and option 4 is not valid syntax.',
      followUps: [
        { q: 'How would you import LOGIN_URL under a different name?', a: 'Use as inside the braces: import LoginPage, { LOGIN_URL as LOGIN_PATH } from "./LoginPage". Renaming is only needed for named exports, since default imports can take any name directly.' },
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
        'for...in gives the keys as strings ("0", "1", "2"). "0" + 1 is string concatenation, giving "01", and "01" === 2 is never true. So it logs "01", "11", "21". Programmers expecting numeric indexes predict 1, "found", 3.',
      followUps: [
        { q: 'How would you fix the loop?', a: 'Use for (const [i, v] of arr.entries()) for numeric indexes, or a classic for (let i = 0; i < arr.length; i++). If you must convert a string key, Number(i) + 1 works, but avoiding for...in on arrays is the real fix.' },
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
        'Playwright decides pass/fail by whether an error escapes the test function. expect throws after its 5-second retry, but the catch swallows it, so the test finishes normally and is reported as passed. Flaky only applies to tests that fail and then pass on retry; nothing here causes a skip.',
      followUps: [
        { q: 'How should you keep going after a failed check but still fail the test?', a: 'Use expect.soft(...): the failure is recorded, execution continues, and the test is marked failed at the end. Or rethrow from catch after adding context: throw new Error("badge mismatch", { cause: e }).' },
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
        'The return value "try" is computed, then finally runs before the function actually returns, logging "cleanup". Only then does the caller receive "try" and log it. finally is not skipped by return, which is what makes it reliable for cleanup.',
      followUps: [
        { q: 'What if finally also contained return "finally"?', a: 'The function would return "finally", overriding the try block\'s return (and it would even swallow an error thrown in try). That is why linters flag return inside finally (no-unsafe-finally).' },
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
        'Test tooling is a dev dependency, the lock file is committed so every machine installs identical versions, and scripts define shared commands. npm ci never modifies the lock file; it fails if package.json and the lock disagree. node_modules is large, platform-specific and always ignored.',
      followUps: [
        { q: 'Why is npm ci preferred in CI pipelines?', a: 'It deletes node_modules and installs exactly what package-lock.json specifies, failing on any mismatch. That makes builds reproducible and usually faster than npm install, which may resolve newer versions within the allowed ranges.' },
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
        'With "type": "module", .js files are ES modules where require does not exist. Converting to import fixes it, and so does renaming to .cjs, which tells Node to treat that one file as CommonJS. "use strict" changes nothing (modules are already strict), and --require preloads a module but does not change the file type.',
      followUps: [
        { q: 'What else must change when converting such a script to ESM?', a: 'module.exports becomes export, __dirname/__filename become import.meta.dirname/filename (Node 20.11+), relative imports need file extensions, and JSON files are read with fs or imported with an import attribute (with { type: "json" }).' },
      ],
    },
    {
      id: 'js-loops-modules-errors-mcq-09',
      difficulty: 'medium',
      question: 'Which value does this expression produce? `new Date(2026, 1, 1).getMonth()`',
      options: ['0', '1', '2', 'It throws a RangeError'],
      correct: [1],
      explanation:
        'The constructor takes a 0-based month, so (2026, 1, 1) is 1 February 2026, and getMonth also returns the 0-based index: 1. Beginners often think the 1 means January (and answer 0) or that getMonth adds 1 (and answer 2).',
      followUps: [
        { q: 'How do you print the month as a human-friendly 2-digit string?', a: 'String(d.getMonth() + 1).padStart(2, "0") gives "02". Or take it from toISOString().slice(5, 7) when you want UTC, or use Intl.DateTimeFormat for locale formats like "Feb".' },
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
        'Subclasses are instances of Error and get a stack trace from the Error constructor. name, however, is inherited from Error.prototype as "Error", so String(e) is "Error: Not found" until you set this.name = "ApiError". That missing line is the most common custom-error mistake.',
      followUps: [
        { q: 'How would you also keep the original low-level error?', a: 'Accept a cause and pass it to super: super(message, { cause }). Then err.cause holds the original error and Node prints it in the stack output, so you add context without losing the root problem.' },
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
        'Modules are cached: the first import evaluates the file, and every later import in the same worker process gets the same exported objects. So pushes from one spec are visible to the next. With several workers, each worker has its own copy, which makes the behaviour differ between local and CI runs: a classic flakiness source.',
      followUps: [
        { q: 'How should per-test data be shared instead?', a: 'Create it inside the test or in a test-scoped fixture so each test gets a fresh value, and pass it explicitly. For data that must persist across workers (e.g. created IDs for cleanup) write to files or use the API, not module-level variables.' },
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
        'Invalid JSON throws SyntaxError at run time, reading a property of null throws TypeError, and using an undeclared identifier throws ReferenceError. Knowing these names lets you read failing CI logs quickly: ReferenceError is often a typo, TypeError usually means an unexpected undefined or null value.',
      followUps: [
        { q: 'Which of these would TypeScript catch before running?', a: 'The undeclared pagee (ReferenceError) and usually null.length are compile-time errors in TypeScript. Invalid JSON content is data, so JSON.parse can only fail at run time, which is why parsing external data should be wrapped or validated.' },
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
        'try/finally runs cleanup and lets the original error continue upward. Catch-cleanup-rethrow also works (with cleanup duplicated on the success path). Option 2 cleans up but swallows the failure, so the test passes. Option 4 skips cleanup entirely when runSteps throws.',
      followUps: [
        { q: 'Why is a Playwright fixture usually better than either working option?', a: 'Fixture teardown (code after await use(...)) always runs, even on failure or timeout, and Playwright reports teardown errors separately from test errors. The cleanup code lives in one place instead of being repeated in every test.' },
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
        'Local setters add a day in IST, but toISOString converts back to UTC, which at 02:00 IST is 20:30 the previous day, so "tomorrow" in IST prints as today\'s date. Using UTC getters/setters with toISOString keeps everything in one zone. Machines in different time zones can produce different dates, which is why statement 3 is false.',
      followUps: [
        { q: 'How do you make date-dependent UI tests deterministic?', a: 'Control the clock: Playwright\'s page.clock.setFixedTime (or install) fixes the browser time, and you can set the timezoneId option for the browser context so the page behaves as if it were in a specific time zone on every machine.' },
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
        'The condition is checked before each round. With attempt 0 and 1 both parts are true, so the body runs twice; at attempt 2 the safety limit (attempt < 2) is false and the loop stops even though the status is still pending. The limit worked as designed: a bounded retry gives up instead of looping forever.',
      followUps: [
        { q: 'After this loop, how should the script react to still being "pending"?', a: 'Check the final state and throw a clear error, for example throw new Error("Order still pending after 2 checks"). A bounded loop that exits silently is almost as bad as an infinite one, because later steps run against the wrong state.' },
      ],
    },
  ],
};

export default topic;
