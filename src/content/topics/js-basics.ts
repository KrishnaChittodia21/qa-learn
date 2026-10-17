import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-basics',
  phase: 'javascript',
  order: 1,
  title: 'JavaScript Basics for Testers',
  subtitle:
    'Variables, types, == vs ===, truthy and falsy, if/else, template literals and number traps. The JavaScript you need before your first Playwright test.',
  estimatedMinutes: 90,
  sources: [
    'javascript.info: Variables, Data types, Type Conversions, Basic operators, Comparisons, Conditional branching, Logical operators, Nullish coalescing, Optional chaining, Numbers',
    'MDN Web Docs: Equality comparisons and sameness, typeof, Falsy, Template literals, Number.EPSILON, Optional chaining, Nullish coalescing operator',
    "Kyle Simpson: You Don't Know JS Yet: Get Started (Ch 2, Surveying JS) and the Types & Grammar ideas on coercion",
    'Marijn Haverbeke: Eloquent JavaScript (4th ed), Ch 1 Values, Types, and Operators; Ch 2 Program Structure',
    'Node.js docs: REPL, Console',
    'GeeksforGeeks: JavaScript Interview Questions and Answers (output prediction, typeof null, == vs ===)',
    'OpenReplay blog: 10 JavaScript interview questions that test real understanding',
  ],
  tags: ['javascript', 'variables', 'let-const-var', 'typeof', 'equality', 'coercion', 'truthy-falsy', 'template-literals', 'numbers', 'debugging'],
  cheatSheet: [
    'JavaScript is the language. Node.js runs it outside the browser. Playwright tests are JavaScript or TypeScript files that Node runs.',
    'Use `const` by default. Use `let` only when the value changes. Avoid `var`: it leaks out of `{ }` blocks.',
    'There are 8 types: string, number, bigint, boolean, undefined, null, symbol, object. `typeof null` is "object" (an old bug). Use `Array.isArray()` for arrays.',
    '`===` checks type and value, with no conversion. `==` converts first, so `"1" == 1` is true. Use `===`. Only `x == null` is an accepted use of `==`.',
    'There are exactly 8 falsy values: false, 0, -0, 0n, "", null, undefined, NaN. Everything else is truthy, even "0", "false", [] and {}.',
    '`a || b` uses b when a is any falsy value (0 and "" too). `a ?? b` uses b only when a is null or undefined. Use `??` for timeouts and retries.',
    '`obj?.a?.b` gives undefined instead of crashing when a part is missing. Add `??` to get a default value.',
    '`+` with a string joins text: "5" + 2 is "52". `-`, `*` and `/` turn text into numbers: "5" - 2 is 3.',
    '0.1 + 0.2 is 0.30000000000000004. Compare money in cents or with `toFixed(2)`. Never use `===` on raw decimal sums.',
    '`NaN !== NaN`, so check it with `Number.isNaN(x)`. `parseFloat("29.99 USD")` is 29.99, but `Number("$29.99")` is NaN. Remove symbols first.',
    'Template literals use backticks and `${expr}`. They are great for unique test data like `user_${Date.now()}@test.com`.',
    'Debug with `console.log` and `console.table`. Read the error name and the line number first.',
  ],
  sections: [
    {
      heading: 'What JavaScript and Node.js are (and why Playwright needs them)',
      body: `**Example:** here is one line from a Playwright test.

\`await page.getByRole('button', { name: 'Login' }).click();\`

This line is plain JavaScript. It finds the Login button and clicks it.

**JavaScript** is a language, like English. **Node.js** is a program that runs JavaScript on your laptop or a CI server, outside the browser. **Playwright** is a library (ready-made code) that runs inside Node.js. It opens real browsers and controls them.

| Word | What it means | Where you see it |
|---|---|---|
| **JavaScript** | The language you write | Every test file |
| **Node.js** | Runs JavaScript outside the browser | \`npx playwright test\` runs on Node |
| **npm** | Installs packages (ready-made code) for Node | \`npm init playwright@latest\` |
| **TypeScript** | JavaScript plus types (labels like "this is a number") | Playwright test files end in \`.ts\` |
| **Browser engine** | Runs JavaScript inside a web page | The app you are testing |

Look at the Playwright line again. It uses an object (\`page\`), a function call (\`click()\`), a string (\`'Login'\`) and \`await\`. Learn these basics, and Playwright code becomes easy to read.

**In an interview, say:** "JavaScript is the language. Node.js runs it outside the browser. Playwright is a Node library that controls real browsers."

**Why testers care:** your test code runs in Node, but the app's code runs in the browser. Knowing which side you are on makes debugging much easier.`,
      diagram: `  your test file (login.spec.ts)
            |
            v
   +------------------+      commands       +-----------------+
   |  Node.js (V8)    | ------------------> |  Chromium /     |
   |  + @playwright/  | <------------------ |  Firefox /      |
   |    test runner   |   results, events   |  WebKit         |
   +------------------+                     +-----------------+
   JavaScript runs HERE                     the app under test
                                            runs ITS own JS here`,
      keyPoints: [
        'JavaScript is the language. Node.js runs it outside the browser. Playwright is a Node library that drives browsers.',
        'TypeScript is JavaScript with types. Everything in this phase works the same in TypeScript.',
        'Your test code runs in Node. The web app\'s code runs in the browser page.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Get Started, Ch 1; Node.js docs",
    },
    {
      heading: 'Running JavaScript: Node, the REPL and the browser console',
      body: `**Example:** save this line in a file called \`scratch.js\`.

\`console.log(2 + 3);\`

Now run \`node scratch.js\` in a terminal. It prints \`5\`.

You need a place to try code and see the result quickly. There are three ways.

1. **Node REPL** (a type-and-see prompt): type \`node\` in a terminal and press Enter. Type \`0.1 + 0.2\` and see the answer. Type \`.exit\` to quit.
2. **A file:** save code as \`scratch.js\` and run \`node scratch.js\`. Use this for every snippet in this course.
3. **Browser console:** press F12 and open the Console tab. This code runs *inside the web page*, not in your test.

**Comments:** \`//\` starts a one-line comment. \`/* ... */\` can cover many lines. JavaScript ignores comments.

**Semicolons:** a semicolon \`;\` ends a statement (one instruction). It is often optional, but most teams keep it.

**Watch out:** do not run a Playwright test with \`node login.spec.ts\`. Use \`npx playwright test\` instead.

**Why testers care:** trying one line in the REPL is much faster than running a whole test again.`,
      code: [
        {
          language: 'javascript',
          title: 'scratch.js: run with `node scratch.js`',
          code: `// One statement per line; output is shown after each arrow
console.log('Hello, tester'); // → Hello, tester
console.log(2 + 3);           // → 5

/* A multi-line comment:
   handy for disabling a block while debugging */
const appName = 'SauceDemo';
console.log(appName.length);  // → 9
console.log(typeof appName);  // → string

// Several values in one log call are separated by spaces
console.log('items:', 3, 'total:', 59.97); // → items: 3 total: 59.97`,
        },
      ],
      keyPoints: [
        'Try every snippet with `node file.js` or the `node` REPL.',
        'The browser console runs inside the page, not inside your test.',
        'Run Playwright tests with `npx playwright test`, not `node file.spec.ts`.',
      ],
      source: 'Node.js docs: REPL; javascript.info: Hello, world! and Code structure',
    },
    {
      heading: 'Variables: let, const and var',
      body: `**Example:**

- \`const baseUrl = 'https://www.saucedemo.com';\` (this value never changes)
- \`let attempts = 0;\` then \`attempts = attempts + 1;\` (this value changes)

A **variable** is a labelled box that holds a value.

- **\`const\`**: the box keeps the same value. You cannot put a new value in it.
- **\`let\`**: you can put a new value in the box later.
- **\`var\`**: the old way. Avoid it in new code.

| | \`const\` | \`let\` | \`var\` |
|---|---|---|---|
| Give it a new value later? | No (TypeError) | Yes | Yes |
| Visible outside its \`{ }\` block? | No | No | Yes (it leaks out) |
| Used before its line? | Error | Error | Gives \`undefined\` |
| Should you use it? | **Yes, by default** | When the value changes | No |

**Watch out:** \`const\` does not freeze an object. You can still change what is inside it. \`user.name = 'b'\` works on a \`const user\`. Only \`user = { ... }\` (a whole new value) fails.

**Naming:** use camelCase, like \`loginButton\` or \`maxRetries\`. A name cannot start with a digit. \`User\` and \`user\` are different names.

**In an interview, say:** "I use \`const\` by default and \`let\` when the value changes. I never use \`var\`, because it leaks out of blocks and hides bugs."

**Why testers care:** \`const\` stops you from changing \`expectedTotal\` by mistake halfway through a test.`,
      code: [
        {
          language: 'javascript',
          title: 'let, const and var side by side',
          code: `const baseUrl = 'https://www.saucedemo.com';
let attempts = 0;
attempts = attempts + 1;
console.log(attempts); // → 1

try {
  baseUrl = 'https://staging.example.com'; // reassigning a const
} catch (e) {
  console.log(e.name); // → TypeError
}

// const blocks a new value, but the object inside can still change
const user = { name: 'standard_user' };
user.name = 'locked_out_user';
console.log(user.name); // → locked_out_user

// var leaks out of the { } block; let stays inside
if (true) {
  var leaky = 'I escaped the block';
  let contained = 'I stay inside';
}
console.log(leaky);            // → I escaped the block
console.log(typeof contained); // → undefined (not declared out here)`,
        },
      ],
      keyPoints: [
        'Use `const` by default, `let` when the value changes, and never `var` in new code.',
        'You can still change what is inside a `const` object or array.',
        '`var` leaks out of `if` and `for` blocks.',
      ],
      source: 'javascript.info: Variables; MDN: let, const, var',
    },
    {
      heading: 'Data types and typeof quirks',
      body: `**Example:**

- \`typeof 'Swag Labs'\` gives \`"string"\`.
- \`typeof 29.99\` gives \`"number"\`.
- \`typeof null\` gives \`"object"\`. This one is a surprise!

Every value has a **type** (a kind of value). The type decides what you can do with it. A date field and a quantity field accept different inputs. Values work the same way.

| Type | Example | \`typeof\` gives | Note for testers |
|---|---|---|---|
| string | \`'Products'\`, \`"₹499"\` | \`"string"\` | Text read from a page is always a string |
| number | \`42\`, \`29.99\`, \`NaN\` | \`"number"\` | Whole numbers and decimals share one type |
| bigint | \`9007199254740993n\` | \`"bigint"\` | Very big whole numbers (rare in tests) |
| boolean | \`true\`, \`false\` | \`"boolean"\` | Yes/no results |
| undefined | a variable with no value yet | \`"undefined"\` | "No value was given" |
| null | \`null\` | \`"object"\` (!) | "Empty on purpose". The "object" result is an old bug from 1995 |
| symbol | \`Symbol('id')\` | \`"symbol"\` | Unique keys (rare in tests) |
| object | \`{}\`, \`[]\`, \`new Date()\` | \`"object"\` (functions give \`"function"\`) | Arrays also say "object" |

The first seven are **primitives** (simple, single values). Objects are bundles of values. The Objects topic covers them.

**null vs undefined:**

- \`undefined\` means JavaScript never got a value. Examples: a missing property, or a missing argument.
- \`null\` means a developer chose "empty" on purpose. Example: \`"middleName": null\` in an API response.

In API tests, a \`null\` field and a missing field are two different bugs.

**Safe checks:** \`Array.isArray(x)\` for arrays, \`x === null\` for null, \`Number.isNaN(x)\` for NaN, and \`typeof x === 'string'\` for text.

**Watch out:** \`typeof response.items === 'array'\` is never true, because \`typeof []\` is \`'object'\`.

**Why testers care:** API checks often ask "is this field a list?" Use \`Array.isArray\` for that, not \`typeof\`.`,
      code: [
        {
          language: 'javascript',
          title: 'typeof and its famous quirks',
          code: `console.log(typeof 'Swag Labs');   // → string
console.log(typeof 29.99);         // → number
console.log(typeof NaN);           // → number  ("Not-a-Number" is a number!)
console.log(typeof true);          // → boolean
console.log(typeof undefined);     // → undefined
console.log(typeof null);          // → object  (historic bug)
console.log(typeof []);            // → object
console.log(typeof {});            // → object
console.log(typeof function () {}); // → function
console.log(typeof typeof 1);      // → string  (typeof always returns a string)

// The reliable checks
const apiItems = [{ id: 1 }, { id: 2 }];
console.log(Array.isArray(apiItems)); // → true
const middleName = null;
console.log(middleName === null);     // → true

let notSet;
console.log(notSet);                   // → undefined
console.log({ a: 1 }.b);               // → undefined (missing property)`,
        },
      ],
      keyPoints: [
        '7 primitives plus object. Arrays, dates and null all say "object". Functions say "function".',
        '`typeof null` is "object" and `typeof NaN` is "number". Both are classic interview traps.',
        'Use `Array.isArray`, `=== null` and `Number.isNaN` for exact checks.',
      ],
      source: 'javascript.info: Data types; MDN: typeof',
    },
    {
      heading: 'Operators: arithmetic, logical, ?? and ?.',
      body: `**Example:**

- \`'5' + 2\` gives \`'52'\` (the text is joined).
- \`'5' - 2\` gives \`3\` (a real number).

**Operators** are symbols that do work: add, compare, or pick a fallback value.

**Arithmetic:** \`+ - * / % **\`. \`%\` gives the remainder: \`10 % 3\` is 1. \`**\` is power: \`2 ** 3\` is 8. \`++\` adds one, and \`--\` takes one away.

**The \`+\` trap:** if either side is a string, \`+\` joins the text. This is called *concatenation*. Other operators, like \`-\` and \`*\`, turn strings into numbers. Prices read from a page are strings. So \`'29.99' + '29.99'\` gives \`'29.9929.99'\`, not 59.98.

**Logical operators** (\`||\`, \`&&\`, \`!\`) combine yes/no checks:

- \`a || b\` gives \`a\` if \`a\` is truthy. Otherwise it gives \`b\`.
- \`a && b\` gives \`a\` if \`a\` is falsy. Otherwise it gives \`b\`.
- \`!a\` flips true and false. \`!!a\` turns any value into \`true\` or \`false\`.

(*Truthy* and *falsy* are explained two sections below.)

**\`??\` (nullish coalescing):** *nullish* means null or undefined. \`a ?? b\` gives \`b\` only when \`a\` is \`null\` or \`undefined\`. Unlike \`||\`, it keeps real values like \`0\`, \`''\` and \`false\`.

**\`?.\` (optional chaining):** \`user?.address?.city\` stops and gives \`undefined\` if a part is missing. Without \`?.\`, the code crashes with \`TypeError: Cannot read properties of undefined\`.

| Expression | Result | Why |
|---|---|---|
| \`0 \\|\\| 30000\` | 30000 | 0 is falsy, so \`\\|\\|\` falls back |
| \`0 ?? 30000\` | 0 | 0 is not null/undefined |
| \`'' \\|\\| 'guest'\` | \`'guest'\` | empty string is falsy |
| \`null ?? 'x'\` | \`'x'\` | null triggers \`??\` |

      code: [
**In an interview, say:** "For defaults I use \`??\`. A timeout of 0 is a real setting, and \`||\` would replace it."

**Why testers care:** with \`||\`, a setting of \`retries: 0\` silently becomes 2 retries. \`??\` keeps your 0.
`,
      code: [
        {
          language: 'javascript',
          title: 'Operators you will use in test code',
          code: `console.log(10 % 3);   // → 1
console.log(2 ** 10);  // → 1024
console.log('5' + 2);  // → 52  (string wins: concatenation)
console.log('5' - 2);  // → 3   (minus converts to number)
console.log('29.99' * 2); // → 59.98

// || vs ?? for configuration defaults
const config = { retries: 0, headless: false, workers: undefined };
console.log(config.retries || 2);  // → 2   (bug: 0 was a real setting)
console.log(config.retries ?? 2);  // → 0   (correct)
console.log(config.workers ?? 4);  // → 4

// Optional chaining on an API response with a missing nested object
const order = { id: 101, customer: null };
console.log(order.customer?.email);          // → undefined (no crash)
console.log(order.customer?.email ?? 'N/A'); // → N/A
try {
  console.log(order.customer.email);
} catch (e) {
  console.log(e.name); // → TypeError
}

// && is a guard: right side runs only if left is truthy
const isLoggedIn = true;
console.log(isLoggedIn && 'show cart'); // → show cart`,
        },
      ],
      keyPoints: [
        '`+` with any string joins text. `-`, `*` and `/` turn text into numbers.',
        '`||` and `&&` give back one of the two values, not always true or false.',
        '`??` only replaces null or undefined. `?.` stops crashes on missing parts.',
      ],
      source: 'javascript.info: Basic operators, Logical operators, Nullish coalescing, Optional chaining',
    },
    {
      heading: '== vs === and type coercion',
      body: `**Example:**

- \`'1' == 1\` gives \`true\`.
- \`'1' === 1\` gives \`false\`.

Same values, different answers. Why?

**\`===\` (strict equality)** checks the type and the value. If the types differ, the answer is \`false\`. Nothing is converted. \`!==\` means "not strictly equal".

**\`==\` (loose equality)** converts both sides to the same type first. Then it compares. This automatic conversion is called **type coercion**. It usually turns strings and booleans into numbers. That is why \`'1' == 1\` is true.

Two special rules for \`==\`:

- \`null == undefined\` is \`true\`. They equal nothing else.
- \`NaN\` equals nothing, not even itself.

| Expression | \`==\` | \`===\` | What \`==\` did |
|---|---|---|---|
| \`'1' == 1\` | true | false | \`'1'\` → 1 |
| \`0 == ''\` | true | false | \`''\` → 0 |
| \`'0' == false\` | true | false | both → 0 |
| \`[] == false\` | true | false | \`[]\` → \`''\` → 0 |
| \`null == undefined\` | true | false | special rule |
| \`null == 0\` | false | false | null only equals undefined |
| \`NaN == NaN\` | false | false | NaN equals nothing |

**\`<\` and \`>\` also convert.** So \`null >= 0\` is \`true\`, but \`null == 0\` is \`false\`.

**Two strings compare like words in a dictionary.** They go letter by letter. So \`'10' < '9'\` is \`true\`, because \`'1'\` comes before \`'9'\`. This breaks "sorted by price" checks that use page text.

**Convert on purpose:** use \`Number(x)\`, \`String(x)\` or \`Boolean(x)\`. Then you know exactly what you compare.

**In an interview, say:** "I use \`===\` everywhere. \`==\` converts types first, so \`'0' == false\` is true. The only \`==\` I accept is \`value == null\`. It checks for null and undefined in one go."

**Why testers care:** text from the page is a string. \`'2' === 2\` is false, so convert with \`Number()\` before you compare.`,
      code: [
        {
          language: 'javascript',
          title: 'Equality and coercion in a test context',
          code: `console.log('1' == 1);          // → true
console.log('1' === 1);         // → false
console.log(0 == '');           // → true
console.log('0' == false);      // → true
console.log([] == false);       // → true
console.log(null == undefined); // → true
console.log(null === undefined); // → false
console.log(null == 0);         // → false
console.log(null >= 0);         // → true  (>= turns null into 0)
console.log(NaN == NaN);        // → false

// A real bug: badge text from the page is a string
const cartBadgeText = '2';
console.log(cartBadgeText === 2);         // → false (types differ)
console.log(Number(cartBadgeText) === 2); // → true  (convert explicitly)

// Sorting check with strings vs numbers
console.log('10' < '9');  // → true  (letter by letter, like a dictionary)
console.log(10 < 9);      // → false

// The accepted == idiom: one check for null OR undefined
const discount = undefined;
console.log(discount == null); // → true`,
        },
      ],
      keyPoints: [
        '`===` never converts. `==` converts the types first.',
        'Turn page text into a number with `Number()` before number checks.',
        'Comparing two strings with `<` or `>` goes letter by letter: `"10" < "9"` is true.',
        '`x == null` is the one common, accepted use of `==`.',
      ],
      source: "MDN: Equality comparisons and sameness; javascript.info: Comparisons; Kyle Simpson: You Don't Know JS Yet (coercion)",
    },
    {
      heading: 'Truthy and falsy values',
      body: `**Example:**

- \`if ('0') { ... }\` runs. The string \`'0'\` counts as true.
- \`if (0) { ... }\` does not run. The number \`0\` counts as false.

An \`if\` needs a yes or a no. So JavaScript turns any value into \`true\` or \`false\`. Values that become \`false\` are called **falsy**. All other values are called **truthy**.

**The 8 falsy values (learn them):** \`false\`, \`0\`, \`-0\`, \`0n\`, \`''\` (empty string), \`null\`, \`undefined\`, \`NaN\`.

**Everything else is truthy.** Watch these traps: \`'0'\`, \`'false'\`, \`' '\` (a space), \`[]\` (empty array), \`{}\` (empty object) and \`-1\`.

| Code | The hidden bug |
|---|---|
| \`if (items)\` | An empty array \`[]\` is truthy, so "no items returned" looks like success |
| \`if (!count) fail()\` | \`0\` is falsy, so a valid count of zero fails |
| \`if (process.env.HEADLESS)\` | Environment variables are strings. \`'false'\` is truthy, so headless stays on |
| \`input \\|\\| 'Guest'\` | A real empty input gets replaced with 'Guest' |

**Better checks:** \`items.length > 0\`, \`count === 0\`, \`process.env.HEADLESS === 'true'\` and \`input ?? 'Guest'\`.

**In an interview, say:** "Truthy checks are fine for 'is anything there?'. In assertions I compare exactly, like \`length > 0\` or \`=== 'true'\`. Empty arrays are truthy, and zero is falsy."

**Why testers care:** an empty result list is truthy. So \`if (items)\` passes even when the API returns nothing.`,
      code: [
        {
          language: 'javascript',
          title: 'Truthy/falsy traps',
          code: `const values = [0, '', null, undefined, NaN, '0', 'false', ' ', [], {}];
for (const v of values) {
  console.log(JSON.stringify(v) ?? String(v), '->', Boolean(v));
}
// → 0 -> false
// → "" -> false
// → null -> false
// → undefined -> false
// → null -> false        (JSON shows NaN as null)
// → "0" -> true
// → "false" -> true
// → " " -> true
// → [] -> true
// → {} -> true

// Env vars are strings: compare explicitly
const HEADLESS = 'false';
console.log(HEADLESS ? 'headless' : 'headed');            // → headless (bug)
console.log(HEADLESS === 'true' ? 'headless' : 'headed'); // → headed`,
        },
      ],
      keyPoints: [
        'There are exactly 8 falsy values. `[]`, `{}`, `"0"` and `"false"` are all truthy.',
        'Environment variables are always strings (or undefined).',
        'In assertions, check exactly: `length > 0` or `=== 0`.',
      ],
      source: 'MDN: Falsy, Truthy; javascript.info: Type Conversions',
    },
    {
      heading: 'Conditionals: if/else, switch and the ternary',
      body: `**Example:**

\`if (code === 200) { console.log('ok'); } else { console.log('not ok'); }\`

If \`code\` is 200, this prints \`ok\`. Otherwise it prints \`not ok\`.

**Conditionals** let code make decisions. They work like a decision table for a coupon field.

**if / else if / else** runs the first branch whose condition is true.

**switch** compares one value with many \`case\` values. It uses \`===\`, so \`'1'\` does not match \`1\`. End each case with \`break\` or \`return\`. Without it, the code *falls through* and runs the next case too. This is a common bug. Sometimes people use it on purpose to group cases.

**Ternary** \`cond ? a : b\` is a short if/else that gives back a value. Read it as "if cond, then a, else b". Example: \`const browser = isCI ? 'chromium' : 'firefox'\`. Use it for short choices only. Do not put one ternary inside another.

The code below sorts HTTP status codes into groups. You will reuse this kind of helper in API tests.

**Why testers care:** status checks, environment URLs and retry counts are all small decisions like these.`,
      code: [
        {
          language: 'javascript',
          title: 'Status classifier and an environment switch',
          code: `function classifyStatus(code) {
  if (code >= 200 && code < 300) return 'success';
  else if (code >= 300 && code < 400) return 'redirect';
  else if (code >= 400 && code < 500) return 'client error';
  else if (code >= 500 && code < 600) return 'server error';
  else return 'unknown';
}
console.log(classifyStatus(201)); // → success
console.log(classifyStatus(404)); // → client error
console.log(classifyStatus(503)); // → server error

function baseUrlFor(env) {
  switch (env) {        // uses === for each case
    case 'qa':
    case 'test':        // deliberate grouping: qa and test share a URL
      return 'https://qa.example.com';
    case 'prod':
      return 'https://www.example.com';
    default:
      return 'http://localhost:3000';
  }
}
console.log(baseUrlFor('test')); // → https://qa.example.com
console.log(baseUrlFor('QA'));   // → http://localhost:3000 (case-sensitive!)

const isCI = true;
console.log(isCI ? 2 : 0); // → 2  (retries on CI, none locally)`,
        },
      ],
      keyPoints: [
        '`switch` uses `===` and needs `break` or `return` to stop fall-through.',
        'A ternary picks a value. Keep it short and do not nest it.',
        'String checks are case-sensitive: "QA" is not "qa".',
      ],
      source: 'javascript.info: Conditional branching, The "switch" statement',
    },
    {
      heading: 'Template literals for test data',
      body: `**Example:**

- \`const id = 42;\`
- \`\` \`/booking/\${id}\` \`\` gives \`/booking/42\`.

A **template literal** is a string written with backticks instead of quotes. Think of a fill-in-the-blanks form. You write the sentence once. You mark each blank with \`\${ }\`. JavaScript fills in the value.

- Inside \`\${ }\` you can put a variable, a sum or a function call.
- It can cover many lines.
- It can hold both \`'\` and \`"\` without any extra work.

**Where testers use them**

- **Unique test data:** \`\` \`qa_\${Date.now()}@example.com\` \`\`. Tests that run at the same time never clash on "email already registered".
- **URLs:** \`\` \`\${baseUrl}/booking/\${bookingId}\` \`\`.
- **Clear failure messages:** \`\` \`Expected \${expected} items but saw \${actual}\` \`\`.
- **Locators with data:** \`\` page.getByRole('row', { name: \`Order \${orderId}\` }) \`\`.

**Watch out:** a missing value does not cause an error. \`undefined\` becomes the text \`'undefined'\`, so a URL can become \`/booking/undefined\`. Objects show as \`[object Object]\`, so use \`JSON.stringify\` for them. Arrays are joined with commas.

**Why testers care:** \`Date.now()\` inside a template literal gives each test run its own email or username.`,
      code: [
        {
          language: 'javascript',
          title: 'Building test data with template literals',
          code: `const runId = 1700000000000; // in real tests: Date.now()
const email = \`qa_\${runId}@example.com\`;
console.log(email); // → qa_1700000000000@example.com

const baseUrl = 'https://restful-booker.herokuapp.com';
const bookingId = 42;
console.log(\`\${baseUrl}/booking/\${bookingId}\`);
// → https://restful-booker.herokuapp.com/booking/42

// Expressions, not just variables
const price = 29.99, qty = 2;
console.log(\`Total: $\${(price * qty).toFixed(2)}\`); // → Total: $59.98

// Multi-line text (e.g. a JSON body or a log block)
const report = \`Run: smoke
Passed: \${18}
Failed: \${2}\`;
console.log(report.split('\\n').length); // → 3

// Gotchas: these do not throw, they produce strange strings
let missingId;
console.log(\`/booking/\${missingId}\`); // → /booking/undefined
console.log(\`\${{ id: 1 }}\`);          // → [object Object]
console.log(\`\${JSON.stringify({ id: 1 })}\`); // → {"id":1}
console.log(\`\${['chromium', 'firefox']}\`);   // → chromium,firefox`,
        },
      ],
      keyPoints: [
        'Backticks plus `${expr}`. Many lines are allowed.',
        'Use `Date.now()` or a counter for unique emails and usernames.',
        'A missing value becomes the text "undefined". An object becomes "[object Object]".',
      ],
      source: 'MDN: Template literals; javascript.info: Strings (backticks)',
    },
    {
      heading: 'Number gotchas: 0.1 + 0.2, NaN and parsing',
      body: `**Example:**

- \`0.1 + 0.2\` gives \`0.30000000000000004\`.
- \`0.1 + 0.2 === 0.3\` gives \`false\`.

Computers store numbers in binary (only 0s and 1s). Many decimals, like 0.1, cannot be stored exactly in binary. It is like 1/3 in decimal: 0.3333... never ends. So tiny rounding errors appear. They break \`===\` checks on prices.

On SauceDemo, Fleece Jacket ($49.99) + Onesie ($7.99) gives \`57.980000000000004\`.

**Three safe ways to check prices:**

1. Round both sides to text: \`sum.toFixed(2) === '57.98'\`. Note: \`toFixed\` gives a **string**.
2. Work in cents (whole numbers): \`Math.round(price * 100)\`.
3. Allow a tiny difference: \`Math.abs(a - b) < 0.005\`. Playwright's \`toBeCloseTo\` does this for you.

**NaN** means "Not a Number". You get it when a conversion fails, like \`Number('$29.99')\`. Three facts:

- Its type is still \`number\`.
- It is **not equal to itself**.
- It spreads: any maths with NaN gives NaN.

Check it with \`Number.isNaN(x)\`. The older \`isNaN('abc')\` converts first, so it says true for any text.

**Turning page text into numbers**

| Call | Result | Use when |
|---|---|---|
| \`Number('29.99')\` | 29.99 | Whole string must be numeric |
| \`Number('$29.99')\` | NaN | Fails on any junk |
| \`Number('')\` | 0 | Careful: empty becomes 0! |
| \`parseFloat('29.99 USD')\` | 29.99 | Reads leading number, ignores the rest |
| \`parseFloat('$29.99')\` | NaN | Must start with a digit/sign |
| \`parseInt('42px', 10)\` | 42 | Integers; always pass radix 10 |

      code: [
**Watch out:** whole numbers are exact only up to \`Number.MAX_SAFE_INTEGER\` (9007199254740991). Keep very large API IDs as strings.

**Why testers care:** a total check with \`===\` on raw decimals fails for some product combinations and passes for others.
`,
      code: [
        {
          language: 'javascript',
          title: 'Asserting prices safely',
          code: `console.log(0.1 + 0.2);         // → 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // → false

// SauceDemo: Fleece Jacket + Onesie
const subtotal = 49.99 + 7.99;
console.log(subtotal);                    // → 57.980000000000004
console.log(subtotal.toFixed(2));         // → 57.98  (a string)
console.log(subtotal.toFixed(2) === '57.98'); // → true
console.log(Math.round(subtotal * 100) === 5798); // → true (cents)
console.log(Math.abs(subtotal - 57.98) < 0.005);  // → true

// Parsing "Item total: $57.98" read from the page
const label = 'Item total: $57.98';
console.log(Number(label.split('$')[1])); // → 57.98
console.log(parseFloat('$57.98'));        // → NaN
console.log(parseInt('42px', 10));        // → 42
console.log(Number(''));                  // → 0 (empty text becomes 0!)

// NaN behaviour
const bad = Number('N/A');
console.log(bad, bad === bad);       // → NaN false
console.log(Number.isNaN(bad));      // → true
console.log(isNaN('hello'), Number.isNaN('hello')); // → true false
console.log(bad + 10);               // → NaN (NaN spreads)`,
        },
      ],
      keyPoints: [
        'Never use `===` on raw decimal sums. Use `toFixed(2)`, cents, or a small tolerance.',
        '`toFixed` gives back a string.',
        '`Number("")` is 0 and `Number("$1")` is NaN. Clean page text first.',
        '`NaN !== NaN`, so use `Number.isNaN`.',
      ],
      source: 'javascript.info: Numbers; MDN: Number.EPSILON, parseFloat, Number.isNaN',
    },
    {
      heading: 'Console debugging',
      body: `**Example:**

\`console.log({ total });\` prints \`{ total: '029.999.99' }\`.

The quotes show that \`total\` is a string, not a number. That is the bug.

\`console.log\` is your evidence screenshot. When a test misbehaves, print what the code really sees. Do not guess.

| Method | What it does |
|---|---|
| \`console.log(a, b)\` | Prints values. Pass them separately so you can see their types |
| \`console.log({ total, expected })\` | Prints names with values: \`{ total: 59.98, expected: '59.98' }\` |
| \`console.table(rows)\` | Shows a list of objects as a table |
| \`console.error\` / \`console.warn\` | Prints errors and warnings. CI logs often highlight them |
| \`console.time('x')\` / \`console.timeEnd('x')\` | Measures roughly how long some code takes |
| \`console.assert(cond, msg)\` | Prints \`msg\` only when \`cond\` is false. It does not stop the code |

**Reading an error:** look at three things.

1. The **name**: \`TypeError\`, \`ReferenceError\` or \`SyntaxError\`.
2. The **message**.
3. The **first line from your own file** in the stack trace (the list of calls that led to the error).

\`TypeError: Cannot read properties of undefined (reading 'email')\` means the thing *before* \`.email\` was undefined.

**More tools:** Playwright has \`--debug\`, \`page.pause()\` and the trace viewer. You will use them later. Remove extra logs before you commit. Too many logs make CI output hard to read.

**Why testers care:** printing \`{ total }\` and \`typeof total\` finds most "wrong total" bugs in seconds.`,
      code: [
        {
          language: 'javascript',
          title: 'Debugging a wrong total',
          code: `const prices = ['29.99', '9.99']; // text read from the page
let total = 0;
for (const p of prices) total = total + p;  // bug: + with strings
console.log({ total });            // → { total: '029.999.99' }
console.log(typeof total);         // → string  (there is the clue)

total = 0;
for (const p of prices) total = total + Number(p);
console.log({ total });            // → { total: 39.98 }

console.table([
  { user: 'standard_user', canLogin: true },
  { user: 'locked_out_user', canLogin: false },
]); // → prints a 2-row table with columns (index), user, canLogin

console.assert(total > 100, 'total should exceed 100');
// → Assertion failed: total should exceed 100   (printed, no throw)`,
        },
      ],
      keyPoints: [
        'Log `{ variable }` to see the name and the value. Check `typeof` when a result looks odd.',
        'Read the error name, the message, and the first line in your own file.',
        '`console.assert` does not fail a test. Real assertions do.',
      ],
      source: 'Node.js docs: Console; javascript.info: Debugging in the browser',
    },
  ],
  codeChallenges: [
    {
      id: 'js-basics-cc-1',
      title: 'Fix the test-config helper that ignores zero and compares loosely',
      context:
        'A teammate wrote a helper that builds run settings for a test suite. It reads an options object and an environment variable. On CI, three things go wrong. `retries: 0` is ignored. `HEADLESS=false` still runs headless. The "is smoke run" check passes for the wrong values.',
      task: 'Fix `buildSettings(opts, env)`. Keep real 0, false and empty values. Read the env var string correctly. Use strict comparisons. It must return `{ retries, timeout, headless, isSmoke, label }`. `headless` must be a real boolean. `label` must read "Run with N attempts", where N = retries + 1. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'settings.js (buggy)',
        code: `function buildSettings(opts, env) {
  var retries = opts.retries || 2;          // default 2 retries
  var timeout = opts.timeout || 30000;      // default 30s
  var headless = env.HEADLESS || true;      // default headless
  var isSmoke = opts.tag == 1;              // tag 1 = smoke
  var label = 'Run with ' + retries + 1 + ' attempts';
  return { retries, timeout, headless, isSmoke, label };
}

console.log(buildSettings({ retries: 0, timeout: 0, tag: '1' }, { HEADLESS: 'false' }));
// → {
//   retries: 2,
//   timeout: 30000,
//   headless: 'false',
//   isSmoke: true,
//   label: 'Run with 21 attempts'
// }`,
      },
      hints: [
        'Which operator uses the default only for null or undefined, not for every falsy value?',
        'Environment variables are strings. What is `Boolean("false")`?',
        '`+` works from left to right. What happens once a string is involved? Also decide what type `tag` should be.',
      ],
      solution: {
        language: 'javascript',
        title: 'settings.js (fixed)',
        code: `function buildSettings(opts, env) {
  const retries = opts.retries ?? 2;      // keeps an explicit 0
  const timeout = opts.timeout ?? 30000;  // 0 means "no timeout" in Playwright
  // env vars are strings: only "false" turns headless off
  const headless = env.HEADLESS === undefined ? true : env.HEADLESS !== 'false';
  const isSmoke = Number(opts.tag) === 1; // convert explicitly, then compare strictly
  const label = \`Run with \${retries + 1} attempts\`; // math inside \${}
  return { retries, timeout, headless, isSmoke, label };
}

console.log(buildSettings({ retries: 0, timeout: 0, tag: '1' }, { HEADLESS: 'false' }));
// → {
//   retries: 0,
//   timeout: 0,
//   headless: false,
//   isSmoke: true,
//   label: 'Run with 1 attempts'
// }
console.log(buildSettings({}, {}).headless); // → true`,
      },
      explanation: `**Fixes**
1. **\`||\` → \`??\`** for \`retries\` and \`timeout\`. \`||\` replaced a real \`0\` with the default. \`??\` only replaces \`null\` or \`undefined\`.
2. **Env var check:** \`env.HEADLESS || true\` gave back the *string* \`'false'\`. A non-empty string is truthy, so the suite stayed headless. The fix compares the string exactly and returns a real boolean.
3. **Loose equality:** \`opts.tag == 1\` worked for \`'1'\`. But it also passes for \`true\` and \`' 1 '\`. Converting with \`Number()\` and comparing with \`===\` makes the intent clear.
4. **Joining bug:** \`'Run with ' + retries + 1\` runs left to right. First it joins text, then it joins the 1 as text, so you get \`'21'\`. Doing the maths inside \`\${}\` fixes it.
5. **\`var\` → \`const\`:** no value is changed later. \`const\` says so and prevents accidents.`,
      fnName: 'buildSettings',
      tests: [
        { args: [{ retries: 0, timeout: 0, tag: '1' }, { HEADLESS: 'false' }], expected: { retries: 0, timeout: 0, headless: false, isSmoke: true, label: 'Run with 1 attempts' } },
        { args: [{}, {}], expected: { retries: 2, timeout: 30000, headless: true, isSmoke: false, label: 'Run with 3 attempts' } },
        { args: [{ retries: 1, timeout: 5000, tag: 1 }, { HEADLESS: 'true' }], expected: { retries: 1, timeout: 5000, headless: true, isSmoke: true, label: 'Run with 2 attempts' } },
        { args: [{ tag: '2' }, { HEADLESS: 'false' }], expected: { retries: 2, timeout: 30000, headless: false, isSmoke: false, label: 'Run with 3 attempts' } },
        { args: [{ retries: 3 }, {}], expected: { retries: 3, timeout: 30000, headless: true, isSmoke: false, label: 'Run with 4 attempts' }, hidden: true },
        { args: [{ timeout: 0, retries: 0 }, { HEADLESS: 'true' }], expected: { retries: 0, timeout: 0, headless: true, isSmoke: false, label: 'Run with 1 attempts' }, hidden: true },
      ],
      followUps: [
        {
          q: 'Why might `timeout: 0` be a real setting and not a mistake?',
          a: 'In Playwright, a timeout of 0 often means "no timeout". People use it while debugging. A helper that quietly turns 0 into 30000 changes behaviour without telling anyone. The rule: use a default only when the caller gave no value at all. That is exactly what `??` does.',
        },
        {
          q: 'How would you test this helper itself?',
          a: 'Use a table of cases. Each row has opts, env and the expected settings. Include the values that broke it: retries 0, timeout 0, HEADLESS "false", "true", undefined and an odd value like "no". Try tag as "1", 1 and "smoke". The bug here is "falsy but valid", so give every input a 0, empty or false row.',
        },
      ],
    },
    {
      id: 'js-basics-cc-2',
      title: 'Repair a flaky cart-total check',
      context:
        'This helper checks the SauceDemo checkout overview page. It reads item prices and the "Item total" label as text. It adds up the items and compares the sum with the label. It fails for some products and not others. Once it even passed when the label was missing.',
      task: 'Fix `verifyItemTotal(priceTexts, totalLabel)`. Read the prices safely. Compare money without decimal rounding surprises. Fail clearly when any text cannot be read as a number. It returns `\'PASS\'`, or `\'FAIL: unparseable price in <JSON of priceTexts>\'`, `\'FAIL: unparseable total label "<label>"\'`, or `\'FAIL: items add up to X.XX but page shows Y.YY\'`. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'cart-check.js (buggy)',
        code: `function verifyItemTotal(priceTexts, totalLabel) {
  let sum = 0;
  for (const t of priceTexts) {
    sum += parseFloat(t);               // texts look like "$49.99"
  }
  const shown = parseFloat(totalLabel.replace('Item total: $', ''));
  if (sum == shown) return 'PASS';
  if (sum != sum) return 'PASS';        // "nothing to compare"
  return \`FAIL: \${sum} vs \${shown}\`;
}

console.log(verifyItemTotal(['$49.99', '$7.99'], 'Item total: $57.98'));
// → PASS   (only because both sides are NaN!)
console.log(verifyItemTotal(['49.99', '7.99'], 'Item total: $57.98'));
// → FAIL: 57.980000000000004 vs 57.98
console.log(verifyItemTotal(['$49.99'], ''));
// → PASS   (empty label should never pass)`,
      },
      hints: [
        'What does `parseFloat("$49.99")` give? What does the second `if` do with that value?',
        'Turn each side into whole cents with `Math.round(x * 100)` before you compare.',
        'Treat "could not read the number" as a failure. Check it with `Number.isNaN`. Never treat it as a pass.',
      ],
      solution: {
        language: 'javascript',
        title: 'cart-check.js (fixed)',
        code: `// "$49.99" or "Item total: $57.98" -> 4999 / 5798 cents, or NaN
function toCents(text) {
  const match = String(text).match(/-?\\d+(\\.\\d{1,2})?/); // first number in the text
  return match ? Math.round(Number(match[0]) * 100) : NaN;
}

function verifyItemTotal(priceTexts, totalLabel) {
  const itemCents = priceTexts.map(toCents);
  if (itemCents.some(Number.isNaN)) return \`FAIL: unparseable price in \${JSON.stringify(priceTexts)}\`;
  const shownCents = toCents(totalLabel);
  if (Number.isNaN(shownCents)) return \`FAIL: unparseable total label "\${totalLabel}"\`;

  let sumCents = 0;
  for (const c of itemCents) sumCents += c; // integer math: no float drift
  return sumCents === shownCents
    ? 'PASS'
    : \`FAIL: items add up to \${(sumCents / 100).toFixed(2)} but page shows \${(shownCents / 100).toFixed(2)}\`;
}

console.log(verifyItemTotal(['$49.99', '$7.99'], 'Item total: $57.98')); // → PASS
console.log(verifyItemTotal(['49.99', '7.99'], 'Item total: $57.98'));   // → PASS
console.log(verifyItemTotal(['$49.99'], ''));
// → FAIL: unparseable total label ""
console.log(verifyItemTotal(['$29.99', '$9.99'], 'Item total: $39.99'));
// → FAIL: items add up to 39.98 but page shows 39.99`,
      },
      explanation: `**Fixes**
1. **Reading the number:** \`parseFloat('$49.99')\` is \`NaN\`, because the text starts with \`$\`. The new \`toCents\` finds the first number with a small regex (a text pattern). So \`$49.99\`, \`49.99\` and \`Item total: $57.98\` all work.
2. **NaN treated as a pass:** \`sum != sum\` is true only for NaN. The starter returned PASS for it. That is the worst result: a test that passes when it cannot read the page. Now bad input is a clear FAIL that shows the bad text.
3. **Decimal rounding:** \`49.99 + 7.99\` is \`57.980000000000004\`. Adding whole cents avoids this completely.
4. **Strict comparison** (\`===\`) on whole numbers. The failure message shows both values with two decimals, so the CI log explains itself.`,
      fnName: 'verifyItemTotal',
      tests: [
        { args: [['$49.99', '$7.99'], 'Item total: $57.98'], expected: 'PASS' },
        { args: [['49.99', '7.99'], 'Item total: $57.98'], expected: 'PASS' },
        { args: [['$49.99'], ''], expected: 'FAIL: unparseable total label ""' },
        { args: [['$29.99', '$9.99'], 'Item total: $39.99'], expected: 'FAIL: items add up to 39.98 but page shows 39.99' },
        { args: [['$15.99'], 'Item total: $15.99'], expected: 'PASS' },
        { args: [['$abc'], 'Item total: $1.00'], expected: 'FAIL: unparseable price in ["$abc"]', hidden: true },
        { args: [['0.1', '0.2'], 'Item total: $0.30'], expected: 'PASS', hidden: true },
      ],
      followUps: [
        {
          q: 'In Playwright, which assertion would you use for a calculated decimal, instead of cents?',
          a: '`expect(sum).toBeCloseTo(57.98, 2)` compares numbers to 2 decimal places. It ignores tiny rounding errors. For the text on the page, I would use a web-first assertion: `await expect(page.getByTestId("subtotal-label")).toHaveText("Item total: $57.98")`. It also retries until the page settles.',
        },
        {
          q: 'Why is "a test that passes when it cannot read the data" so dangerous?',
          a: 'The report is green while the feature may be broken. Nobody looks closely at green tests. Good checks fail when data is missing: missing elements, NaN, empty strings or undefined must fail. The message should name the bad input, so the cause is clear in the CI log.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-basics-iq-01',
      difficulty: 'easy',
      question: 'What is the difference between var, let and const? Which one do you use in test scripts, and why?',
      whatInterviewerLooksFor: [
        'Scope: var belongs to the whole function; let and const belong to their { } block',
        'Hoisting: var gives undefined early; let and const throw an error (the temporal dead zone)',
        'Knows const blocks a new value, but the object inside can still change',
        'Gives a clear personal rule with a reason',
      ],
      modelAnswer: `**Short answer:** all three create variables. They differ in where they are visible, when you can use them, and whether you can give them a new value.

| | var | let | const |
|---|---|---|---|
| Visible in | the whole function | the \`{ }\` block | the \`{ }\` block |
| Used before its line | \`undefined\` | error (TDZ) | error (TDZ) |
| New value later | yes | yes | no |
| Declare twice | yes | no | no |

**TDZ (Temporal Dead Zone)** is the gap between the start of a block and the line that declares the variable. Using a \`let\` or \`const\` in that gap throws an error.

**Example:** \`if (true) { var a = 1; let b = 2; }\`. After the block, \`a\` is 1, but \`b\` does not exist. \`var\` leaks out of the block.

**const is not frozen:** \`const user = { role: 'admin' }\` cannot get a new object. But \`user.role = 'guest'\` still works.

**What I use:** \`const\` by default, for base URLs, locators and test data. \`let\` only for values that change, like a retry counter. Never \`var\`. If someone changes \`expectedTotal\` by mistake, \`const\` fails at once with a TypeError.`,
      followUps: [
        {
          q: 'If const objects can still change, how do you protect shared test data?',
          a: 'Create fresh data for each test with a factory function (a function that returns a new object on every call). Or copy the data with structuredClone before changing it. Object.freeze helps too, but only for the top level. In Playwright, a fixture that builds data per test is cleanest, because tests can run at the same time.',
        },
        {
          q: 'What happens if you use a let variable before its declaration line?',
          a: "You get `ReferenceError: Cannot access 'x' before initialization`. JavaScript knows the variable exists, but it has no value yet. That gap is the temporal dead zone. With var, the same code gives undefined, which hides the bug instead of showing it.",
        },
      ],
      pitfalls: [
        'Saying const makes objects unchangeable.',
        'Saying let and const are not hoisted at all. They are, but they stay in the TDZ until their line runs.',
        'Calling var "old" without explaining that it leaks out of blocks.',
      ],
    },
    {
      id: 'js-basics-iq-02',
      difficulty: 'medium',
      question: 'Explain == and === with examples. Is there ever a good reason to use ==?',
      whatInterviewerLooksFor: [
        'Says == converts types first (type coercion) and === does not',
        'Gives clear, surprising examples',
        'Mentions the null/undefined rule and NaN',
        'Links it to a real test bug: page text compared with a number',
      ],
      modelAnswer: `**\`===\` (strict):** checks the type and the value. Different types give \`false\`. Nothing is converted.

**\`==\` (loose):** if the types differ, JavaScript converts them first, usually to numbers. Then it compares. This is called type coercion.

**Examples:**
- \`'5' == 5\` → \`true\`, but \`'5' === 5\` → \`false\`
- \`0 == ''\` → \`true\`, and \`'0' == false\` → \`true\`
- \`null == undefined\` → \`true\`, but \`null == 0\` → \`false\`
- \`NaN == NaN\` → \`false\`. Use \`Number.isNaN\` instead.

**Why it matters in tests:** text from the page is always a string. \`badgeText == 3\` passes for \`'3'\`. It also passes for \`' 3 '\` and \`'03'\`, which may be real formatting bugs. With \`===\` I must convert on purpose: \`Number(badgeText.trim()) === 3\`. Or, better, I check the exact text \`'3'\`.

**The one good use of \`==\`:** \`value == null\` checks for null or undefined in one go. ESLint's \`eqeqeq\` rule has an option that allows exactly this.

**Objects:** both operators check if two objects are the *same object*. So \`{a:1} === {a:1}\` is \`false\`. To compare API data, I use \`toEqual\` in Playwright.`,
      followUps: [
        {
          q: 'What does `[] == ![]` give, and why?',
          a: 'true. First `![]` runs: `[]` is truthy, so `![]` is false. Now we have `[] == false`. The false becomes 0. The array becomes "" and then 0. So `0 == 0` is true. It is a puzzle, but it shows why people avoid ==: one comparison hides several conversions.',
        },
        {
          q: "Does Playwright's expect compare like == or ===?",
          a: '`toBe` uses Object.is. It works like ===, except that NaN equals NaN and +0 differs from -0. `toEqual` compares what is inside objects and arrays. Neither one converts types, so `expect("3").toBe(3)` fails. That is what you want.',
        },
      ],
      pitfalls: [
        'Saying == "compares only values" without explaining the conversion.',
        'Thinking === compares what is inside two objects.',
        'Forgetting that NaN is not equal to itself with either operator.',
      ],
    },
    {
      id: 'js-basics-iq-03',
      difficulty: 'medium',
      question: 'What is the difference between null and undefined? Why does typeof null give "object"? How would you check that an API field is an array?',
      context: 'Asked while talking about checking an API response in a JavaScript test.',
      whatInterviewerLooksFor: [
        'undefined = no value was given, or the field is missing; null = empty on purpose',
        'Knows typeof null is an old bug, not a feature',
        'Uses Array.isArray, not typeof',
        'Links missing vs null fields to API contract bugs',
      ],
      modelAnswer: `**undefined** means "no value was given". You get it for a variable with no value, a missing property, a missing argument, or a function with no \`return\`.

**null** is a value a developer sets on purpose. It means "empty here". Example: \`"discountCode": null\` in a JSON response.

**Why \`typeof null\` is \`'object'\`:** it is a bug from the first version of JavaScript in 1995. Fixing it would break old websites, so it stayed. So \`typeof x === 'object'\` is not a safe "is this an object?" check. Add \`x !== null\`.

**Checking for arrays:** \`typeof []\` is also \`'object'\`. So I use \`Array.isArray(body.items)\`.

**Why testers care:** in an API contract, there are three different cases:
1. the field is there, with a value;
2. the field is there, but it is \`null\`;
3. the field is missing (reading it gives \`undefined\`).

Say the spec says "\`middleName\` may be null". A response with no \`middleName\` at all breaks the contract. A loose check like \`if (!body.middleName)\` cannot tell the difference. I check \`'middleName' in body\` and \`body.middleName === null\` separately. Or I check the whole body with a JSON schema.`,
      followUps: [
        {
          q: 'What does JSON.stringify do with undefined and null values?',
          a: 'It drops properties whose value is undefined, but it keeps null. `JSON.stringify({ a: undefined, b: null })` gives `{"b":null}`. So if a test builds a request body with undefined fields, the server never sees those keys. This explains many "the field silently disappeared" bugs.',
        },
        {
          q: 'How would you check that a value is a plain object (not null, not an array)?',
          a: '`typeof v === "object" && v !== null && !Array.isArray(v)`. Each part removes one wrong match: null says "object", and arrays say "object" too. For a stricter check that also rejects Dates and Maps, compare `Object.getPrototypeOf(v) === Object.prototype`.',
        },
      ],
      pitfalls: [
        'Saying null and undefined are "the same".',
        'Using typeof to detect arrays.',
        'Treating a missing field and a null field as the same in API checks.',
      ],
    },
    {
      id: 'js-basics-iq-04',
      difficulty: 'medium',
      question: 'Which values are falsy in JavaScript? How is `||` different from `??` when you set defaults in test config?',
      whatInterviewerLooksFor: [
        'Lists all 8 falsy values (false, 0, -0, 0n, "", null, undefined, NaN)',
        'Knows [] and "0" are truthy',
        'Explains: || replaces any falsy value; ?? replaces only null or undefined',
        'Gives a real config example',
      ],
      modelAnswer: `**Falsy values:** \`false\`, \`0\`, \`-0\`, \`0n\`, \`''\`, \`null\`, \`undefined\`, \`NaN\`. Everything else is truthy, even \`'0'\`, \`'false'\`, \`[]\` and \`{}\`.

**\`a || b\`** gives \`a\` if it is truthy. Otherwise it gives \`b\`. So it replaces *every* falsy value.

**\`a ?? b\`** gives \`b\` only if \`a\` is \`null\` or \`undefined\`.

**Config example:**
- \`opts.retries || 2\` with \`opts.retries = 0\` gives \`2\`. Your "no retries" setting is silently ignored.
- \`opts.retries ?? 2\` gives \`0\`. Correct.
- \`process.env.RETRIES || 2\` with \`RETRIES=0\` gives the *string* \`'0'\`. It is truthy, so it is kept, but it is text, not a number.

The safe version for env vars: \`Number(process.env.RETRIES ?? 2)\`.

**Where truthy checks hurt in assertions:** \`if (items)\` is true for an empty array. \`if (!count)\` treats a valid 0 as missing. In tests I compare exactly: \`items.length > 0\` and \`count === 0\`.`,
      followUps: [
        {
          q: 'Can you mix ?? with || in one expression?',
          a: 'Not without brackets. `a || b ?? c` is a SyntaxError. JavaScript forbids it on purpose, because the order would be unclear. Write `(a || b) ?? c` or `a || (b ?? c)` to show what you mean.',
        },
        {
          q: 'What is the difference between ?? and ??=?',
          a: '`x ??= value` sets x to value only if x is null or undefined right now. It is a short way to write `x = x ?? value`. It is handy for filling in missing options, like `opts.timeout ??= 30000`.',
        },
      ],
      pitfalls: [
        'Forgetting NaN or the empty string in the falsy list.',
        'Believing an empty array is falsy.',
        'Using || for number defaults where 0 is a valid value.',
      ],
    },
    {
      id: 'js-basics-iq-05',
      difficulty: 'medium',
      question: 'Why is 0.1 + 0.2 not equal to 0.3 in JavaScript? How do you safely check prices and totals in a test?',
      context: 'The interviewer shows a failing check on a shop checkout page: expected 57.98, received 57.980000000000004.',
      whatInterviewerLooksFor: [
        'Explains binary decimals (IEEE 754) in simple words',
        'Gives more than one safe way to compare',
        'Remembers that toFixed gives a string',
        'Knows when to check page text and when to check a calculated number',
      ],
      modelAnswer: `**Why:** JavaScript stores numbers in binary (0s and 1s), in a format called IEEE 754. Many decimals, like 0.1, 0.2 or 7.99, cannot be stored exactly in binary. It is the same as 1/3 in decimal: 0.333... never ends. So each number is stored as a very close value. Adding them can show the tiny error: \`0.1 + 0.2\` is \`0.30000000000000004\`, and \`49.99 + 7.99\` is \`57.980000000000004\`.

**Safe ways to compare:**
1. **Whole cents:** \`Math.round(price * 100)\`. Add the whole numbers and compare with \`===\`. Best for money.
2. **Round to text:** \`sum.toFixed(2) === '57.98'\`. \`toFixed\` gives a string, so compare with a string.
3. **Small tolerance:** \`Math.abs(actual - expected) < 0.005\`. In Playwright: \`expect(sum).toBeCloseTo(57.98, 2)\`.

**What I check in UI tests:** the page shows text, so usually I check the text: \`await expect(subtotal).toHaveText('Item total: $57.98')\`. I calculate numbers only when I test a sum, like "item prices add up to the subtotal". Then I use cents.

**Related traps:** \`Number('$57.98')\` is \`NaN\`, so remove the currency sign first. Very large IDs (above 2^53 − 1) lose accuracy, so keep them as strings.`,
      followUps: [
        {
          q: 'Is this a JavaScript bug?',
          a: 'No. It is how binary decimals (IEEE 754) work everywhere. Python, Java and C# doubles do the same: in Python, `0.1 + 0.2` also prints 0.30000000000000004. Some languages have special decimal types, like Java BigDecimal. In JavaScript you use whole cents or a decimal library.',
        },
        {
          q: 'What does (1.005).toFixed(2) give?',
          a: '"1.00", not "1.01". The number 1.005 is really stored as 1.00499999999999989... So toFixed is fine for showing a value in a check. But for money logic, round in whole cents (or use a library) so you match what the backend does.',
        },
      ],
      pitfalls: [
        'Calling it a JavaScript bug.',
        'Comparing the toFixed result with a number using ===.',
        'Using parseFloat on "$57.98" and not noticing the NaN.',
      ],
    },
    {
      id: 'js-basics-iq-06',
      difficulty: 'easy',
      question: 'Write a function that takes an HTTP status code and returns "success", "redirect", "client error", "server error" or "invalid". How would you test it?',
      whatInterviewerLooksFor: [
        'Correct ranges, with the right boundaries',
        'Handles bad input: not a number, out of range, or a decimal',
        'Uses boundary value analysis on their own code',
        'Readable code, for example early returns',
      ],
      modelAnswer: `**Code (explained line by line):**

- First, reject bad input: \`if (!Number.isInteger(code) || code < 100 || code > 599) return 'invalid';\`
- Then check ranges from low to high, and return early:
  - \`if (code < 200) return 'informational';\` (the task lists only four groups, so I would ask what 1xx should return)
  - \`if (code < 300) return 'success';\`
  - \`if (code < 400) return 'redirect';\`
  - \`if (code < 500) return 'client error';\`
  - \`return 'server error';\`

Each line needs only one comparison. There are no gaps and no overlaps.

**Testing it (boundary values on each edge):**

| Input | Expected |
|---|---|
| 199, 200 | informational/invalid, success |
| 299, 300 | success, redirect |
| 399, 400 | redirect, client error |
| 499, 500 | client error, server error |
| 599, 600 | server error, invalid |
| '200' (string) | invalid (or convert it? Ask: this is a requirement question) |
| 200.5, NaN, undefined | invalid |

**Why the string case matters:** \`response.status()\` in Playwright gives a number. But a code read from a log line is a string. I would ask what the function should accept, not quietly convert with \`==\`. Testing my own helpers with boundary values shows I think like a tester, not just a script writer.`,
      followUps: [
        {
          q: 'Why not use switch for ranges?',
          a: 'switch compares single values with ===. For ranges you need the `switch (true) { case code >= 200 && code < 300: ... }` trick, which is harder to read. switch is great for fixed values, like environment names or HTTP methods. For ranges, simple if statements with early return are clearer.',
        },
        {
          q: 'In Playwright API tests, is there a built-in check for "2xx"?',
          a: 'Yes. `response.ok()` is true for statuses 200-299. `await expect(response).toBeOK()` checks it with a helpful failure message. For exact checks, still use `expect(response.status()).toBe(201)`. "Any 2xx" can hide a 200 where the spec needs 201 Created.',
        },
      ],
      pitfalls: [
        'Off-by-one boundaries, like using <= 300 for success.',
        'Not handling bad input at all.',
        'Not giving any test cases for their own function.',
      ],
    },
    {
      id: 'js-basics-iq-07',
      difficulty: 'medium',
      question: 'Swap the values of two variables without a third variable. Then predict: what do "5" + 3, "5" - 3 and true + true give?',
      context: 'A warm-up coding round often mixes a tiny coding task with "predict the output" questions.',
      whatInterviewerLooksFor: [
        'Knows the destructuring swap',
        'Can explain the maths swap and its limits',
        'Predicts the conversion results correctly and explains why',
      ],
      modelAnswer: `**Swap (modern and readable):**

\`let a = 1, b = 2; [a, b] = [b, a];\` → now \`a\` is 2 and \`b\` is 1.

This is **array destructuring** (unpacking an array into variables). The right side builds a short array \`[2, 1]\`. The left side unpacks it into \`a\` and \`b\`. It works for any type of value.

**Maths swap (the "classic" answer):**

\`a = a + b; b = a - b; a = a - b;\`

It works for numbers only. It can lose accuracy with decimals. It breaks with strings, because \`+\` joins text. I would mention it, but I prefer destructuring.

**Predict the output:**
- \`'5' + 3\` → \`'53'\`. If either side of \`+\` is a string, it joins text.
- \`'5' - 3\` → \`2\`. \`-\` works only on numbers, so \`'5'\` becomes 5.
- \`true + true\` → \`2\`. In maths, \`true\` becomes 1 and \`false\` becomes 0.

**Why a test interviewer asks this:** values read from the browser are strings, and \`+\` on them joins text. That is the difference between a test that checks 2 + 1 = 3 items and one that checks \`'21'\`.`,
      followUps: [
        {
          q: 'Would the destructuring swap work if the line before it had no semicolon?',
          a: 'It can break. Say the line before is `let b = 2` with no semicolon, and the next line starts with `[a, b] = [b, a]`. JavaScript may read them as one line: `2[a, b] = ...`. Lines that start with `[` or `(` are the main trap. That is why many teams keep semicolons or use a formatter.',
        },
        {
          q: 'What do "5" * "2" and [] + {} give?',
          a: '`"5" * "2"` is 10, because `*` turns both strings into numbers. `[] + {}` is the string "[object Object]". Both sides become text first: the array becomes "" and the object becomes "[object Object]". Since text is involved, + joins them.',
        },
      ],
      pitfalls: [
        'Saying "5" + 3 is 8.',
        'Knowing only the maths trick and not its limits with strings and decimals.',
        'Not explaining why the conversion happens.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-basics-drill-1',
      question:
        'Predict the output of each line before you run it: `console.log("3" + 4 + 5)`, `console.log(3 + 4 + "5")`, `console.log("10" - "4" + "2")`, `console.log(+"")`, `console.log(null + 1)`, `console.log(undefined + 1)`.',
      assumptions: [
        'Operators of the same kind run from left to right.',
        '`+` joins text if either side is a string. `-` always turns both sides into numbers.',
        'A `+` in front of one value (like `+""`) turns it into a number.',
      ],
      steps: [
        { label: '"3" + 4 + 5', calc: '"3" + 4 → "34" (text wins); "34" + 5 → "345"' },
        { label: '3 + 4 + "5"', calc: '3 + 4 → 7 (both numbers); 7 + "5" → "75"' },
        { label: '"10" - "4" + "2"', calc: '"10" - "4" → 6 (minus makes numbers); 6 + "2" → "62"' },
        { label: '+""', calc: 'Number("") is 0 → 0' },
        { label: 'null + 1', calc: 'null becomes 0 → 1' },
        { label: 'undefined + 1', calc: 'undefined becomes NaN → NaN' },
      ],
      answer: '`345`, `75`, `62`, `0`, `1`, `NaN`. The first three are strings, which `console.log` prints without quotes.',
      insight:
        'Two rules explain most of these puzzles: work left to right, and "+ prefers text". In test code, turn page text into a number with Number() before any maths.',
      followUps: [
        {
          q: 'How would you make "3" + 4 + 5 give 12?',
          a: 'Convert first: `Number("3") + 4 + 5` or `+"3" + 4 + 5`. Convert at the point where text enters your code, right after you read it from the page or an API. Then the rest of your logic works with numbers and behaves as you expect.',
        },
      ],
    },
    {
      id: 'js-basics-drill-2',
      question:
        'A config loader runs `const s = { retries: 0, baseURL: "", headless: "false", workers: null };`. Then it logs: `s.retries || 1`, `s.retries ?? 1`, `s.baseURL || "http://localhost"`, `s.baseURL ?? "http://localhost"`, `!!s.headless`, `s.workers ?? 4`, `s.trace?.mode ?? "off"`. Predict each value.',
      assumptions: [
        'Falsy values: false, 0, -0, 0n, "", null, undefined, NaN.',
        '`??` uses the default only for null or undefined.',
        '`?.` gives undefined when the left side is null or undefined.',
      ],
      steps: [
        { label: 's.retries || 1', calc: '0 is falsy → 1' },
        { label: 's.retries ?? 1', calc: '0 is not null or undefined → 0' },
        { label: 's.baseURL || "http://localhost"', calc: '"" is falsy → "http://localhost"' },
        { label: 's.baseURL ?? "http://localhost"', calc: '"" is not null or undefined → "" (empty string)' },
        { label: '!!s.headless', calc: '"false" is a non-empty string → truthy → true' },
        { label: 's.workers ?? 4', calc: 'null → 4' },
        { label: 's.trace?.mode ?? "off"', calc: 's.trace is undefined → ?. gives undefined → "off"' },
      ],
      answer: '`1`, `0`, `"http://localhost"`, `""`, `true`, `4`, `"off"`.',
      insight:
        'Choose the operator by asking: "is this falsy value a real setting?" Zero retries is a real setting, so use ??. An empty baseURL is probably a mistake, so use || or check it. Text flags like "false" must be compared exactly.',
      followUps: [
        {
          q: 'Which of these results would most likely cause a confusing test failure, and how?',
          a: '`s.baseURL ?? "http://localhost"` giving "" is the sneakiest. Then page.goto("/login") has no base URL and fails with an "invalid URL" style error, far away from the config. Check the config at startup (throw if baseURL is empty). Then the error message points at the real cause.',
        },
      ],
    },
    {
      id: 'js-basics-drill-3',
      question:
        'Trace this code and give each logged value: `const qty = "2"; const price = 9.99; console.log(qty * price); console.log(qty + price); console.log(typeof (qty * price)); console.log((qty * price).toFixed(2) === "19.98"); console.log(Number("2 ") === 2, Number("2 items"));`',
      assumptions: [
        '`*` turns strings into numbers. `+` with a string joins text.',
        '`toFixed` gives a string.',
        'Number() ignores spaces at the start and end, but rejects any other extra text.',
      ],
      steps: [
        { label: 'qty * price', calc: '"2" → 2; 2 × 9.99 = 19.98 → 19.98' },
        { label: 'qty + price', calc: 'string + number → "2" + "9.99" → "29.99"' },
        { label: 'typeof (qty * price)', calc: 'the result of * is a number → "number"' },
        { label: '(qty * price).toFixed(2) === "19.98"', calc: '19.98.toFixed(2) is the string "19.98" → true' },
        { label: 'Number("2 ") === 2', calc: 'the space is ignored → 2 === 2 → true' },
        { label: 'Number("2 items")', calc: 'extra text → NaN' },
      ],
      answer: '`19.98`, `29.99` (a string), `"number"`, `true`, then `true NaN`.',
      insight:
        'The same two values give a correct total with * and a nonsense "price" with +. A quantity from an input field is a string. Convert it before any maths. When debugging, check both the type and the value.',
      followUps: [
        {
          q: 'Why might qty + price be a real bug and not just a puzzle?',
          a: 'Picture a test helper that does "subtotal = qty + shipping", with qty read by inputValue(). For qty 2 and shipping 5.99 it gives "25.99" instead of 7.99. The check against the page fails, and the tester wrongly reports an app bug. Converting with Number() as soon as you read the text prevents it.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-basics-mcq-01',
      difficulty: 'easy',
      question: 'Which sentence best describes how JavaScript, Node.js and Playwright fit together?',
      options: [
        'Node.js is a runtime that executes JavaScript outside the browser, and Playwright is a library running in Node that controls browsers',
        'Playwright is a JavaScript engine that replaces Node.js when tests run in a browser',
        'Node.js is a browser, and Playwright tests run inside the page as JavaScript',
        'JavaScript is compiled into Node.js, which Playwright then converts into browser actions',
      ],
      correct: [0],
      explanation:
        'Node.js runs JavaScript outside a browser. `npx playwright test` runs your test files in Node, and Playwright sends commands to real browsers. Playwright is not an engine, Node is not a browser, and tests do not run inside the page. Only code you pass to page.evaluate runs in the page.',
      followUps: [
        {
          q: 'Where does the code inside page.evaluate(() => document.title) run?',
          a: 'Inside the browser page, not in Node. Playwright sends the function to the page and runs it there. So it cannot see your test variables unless you pass them in as an argument. Beginners often mix up these two places.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-02',
      difficulty: 'easy',
      question: 'A const test-data object has its name property changed. What does the log show?',
      code: {
        language: 'javascript',
        code: `const user = { name: 'standard_user' };
user.name = 'problem_user';
console.log(user.name);`,
      },
      options: ['problem_user', 'standard_user', 'TypeError: Assignment to constant variable', 'undefined'],
      correct: [0],
      explanation:
        'const stops you from giving the variable `user` a whole new value. But the object inside can still change. So the property update works and prints problem_user. The TypeError appears only for `user = {...}`. standard_user would need a frozen object.',
      followUps: [
        {
          q: 'How would you make the assignment fail or be ignored?',
          a: 'Use Object.freeze(user). Then the top-level properties are read-only. In normal scripts the change is silently ignored. In strict mode (ES modules and classes) it throws a TypeError. Freeze only works one level deep, so nested objects can still change.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-03',
      difficulty: 'easy',
      question: 'Select ALL values that are falsy in JavaScript.',
      options: ['0', '"0"', '[]', 'NaN', '""'],
      correct: [0, 3, 4],
      explanation:
        'The falsy values are false, 0, -0, 0n, "", null, undefined and NaN. So 0, NaN and "" are falsy. The string "0" is not empty, so it is truthy. An empty array is an object, and every object is truthy. This is a classic trap when you write `if (items)`.',
      followUps: [
        {
          q: 'How should you check that an API returned at least one item?',
          a: 'Use `Array.isArray(items) && items.length > 0`. In Playwright, use `expect(items.length).toBeGreaterThan(0)`. A plain `if (items)` passes for an empty array, so an endpoint that wrongly returns [] would look fine.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-04',
      difficulty: 'medium',
      question: 'A test reads the cart badge as text. What do the three comparisons log?',
      code: {
        language: 'javascript',
        code: `const badge = '2';
console.log(badge == 2);
console.log(badge === 2);
console.log(Number(badge) === 2);`,
      },
      options: ['true, false, true', 'true, true, true', 'false, false, true', 'true, false, false'],
      correct: [0],
      explanation:
        '`==` turns the string into a number first, so it is true. `===` sees a string and a number and says false, with no conversion. `Number(badge)` is the number 2, so the strict check is true. The answer "true, true, true" assumes === converts like ==. It never does.',
      followUps: [
        {
          q: 'Why is checking the text "2" often better than converting to a number?',
          a: 'The user sees text. `toHaveText("2")` catches format bugs like "02" or " 2" that Number() would hide. Also, Playwright\'s web-first assertion retries until the badge updates. That avoids a race with the click that added the item.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-05',
      difficulty: 'medium',
      question: 'The config sets retries to 0. Which of the lines A to D print `0`?',
      code: {
        language: 'javascript',
        code: `const opts = { retries: 0 };
console.log(opts.retries || 3);   // A
console.log(opts.retries ?? 3);   // B
console.log(opts.retries && 3);   // C
console.log(!opts.retries ? 3 : opts.retries); // D`,
      },
      options: ['Only B', 'B and C', 'Only C', 'A and B'],
      correct: [1],
      explanation:
        'B: `??` keeps 0, because 0 is not null or undefined. C: `&&` gives back its first value when that value is falsy, so it gives 0 and never looks at 3. A gives 3 because 0 is falsy. D also gives 3 because !0 is true. Many beginners miss that && gives back the value itself, not false.',
      followUps: [
        {
          q: 'When is it useful that `&&` gives back a value instead of true/false?',
          a: 'As a guard: `user && user.name` gives user.name only if user exists. Today `user?.name` is cleaner. React uses && to show things conditionally. In test code, use real true/false values in assertions, so a 0 or "" does not sneak through as a result.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-06',
      difficulty: 'medium',
      question: 'You check that prices on a product list are sorted from low to high. The prices are strings: ["9.99", "15.99", "7.99"]. A helper checks `prices[i] <= prices[i + 1]` for each pair. What happens?',
      options: [
        'It wrongly flags 9.99 → 15.99 as out of order, because two strings are compared character by character',
        'It works correctly because <= converts both strings to numbers',
        'It throws a TypeError because strings cannot be compared with <=',
        'It always returns true because non-empty strings are truthy',
      ],
      correct: [0],
      explanation:
        'When both sides are strings, `<=` compares them letter by letter, like words in a dictionary. So "9.99" <= "15.99" is false, because "9" comes after "1". The helper wrongly flags a correct pair. `<=` only converts to numbers when the types differ. It never throws on strings, and truthiness does not matter here.',
      followUps: [
        {
          q: 'How do you fix the helper?',
          a: 'Convert first: `const nums = prices.map(Number)` (after removing any "$"). Then compare numbers. Or compare `nums` with a sorted copy: `[...nums].sort((a, b) => a - b)`, and check they match with toEqual. Plain sort() also compares letter by letter, so the (a, b) => a - b part is required.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-07',
      difficulty: 'medium',
      question: 'Select ALL expressions that give `true`.',
      options: ['null == undefined', 'null == 0', 'null >= 0', 'NaN === NaN', "'' == 0"],
      correct: [0, 2, 4],
      explanation:
        'null == undefined is a special rule, so it is true. null == 0 is false, because == never turns null into a number. But >= does, so null >= 0 becomes 0 >= 0, which is true. NaN equals nothing, not even itself. "" == 0 is true, because the empty string becomes 0.',
      followUps: [
        {
          q: 'How do you check for NaN reliably?',
          a: 'Use `Number.isNaN(x)`. It is true only for the real NaN value. The older `isNaN(x)` converts first, so isNaN("hello") is true. Object.is(x, NaN) also works. Playwright\'s toBe uses Object.is, so expect(NaN).toBe(NaN) passes.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-08',
      difficulty: 'hard',
      question: 'A checkout helper checks a price sum in three ways. What do the three logs print?',
      code: {
        language: 'javascript',
        code: `const price = 49.99 + 7.99;
console.log(price === 57.98);
console.log(price.toFixed(2) === 57.98);
console.log(price.toFixed(2) === '57.98');`,
      },
      options: ['false, false, true', 'true, true, true', 'false, true, true', 'false, false, false'],
      correct: [0],
      explanation:
        'Decimal rounding makes the sum 57.980000000000004, so the first check is false. toFixed(2) gives the string "57.98". A string is never === to the number 57.98, so the second is false. The third compares a string with a string, so it is true. "false, true, true" assumes toFixed gives a number.',
      followUps: [
        {
          q: 'Give a money-safe way to add up prices.',
          a: 'Turn each price into whole cents with Math.round(price * 100). Add the whole numbers, and compare with the expected cents. Whole numbers are exact in JavaScript (up to about 9 quadrillion), so nothing drifts. Use (cents / 100).toFixed(2) only to show the value in messages.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-09',
      difficulty: 'medium',
      question: 'Your config has `const headless = process.env.HEADLESS || true;` and CI sets HEADLESS=false. What happens, and why?',
      options: [
        'Tests run headless, because the env var is the string "false", which is truthy and is returned as-is',
        'Tests run headed, because || converts "false" to the boolean false',
        'Tests run headed, because environment variables are parsed as booleans by Node',
        'Node throws because a string cannot be used with ||',
      ],
      correct: [0],
      explanation:
        'Environment variables are always strings (or undefined). "false" is a non-empty string, so it is truthy, and || gives it back. Any truthy check on it then means "headless". Node never turns env vars into booleans, and || works on any type. Compare exactly instead: process.env.HEADLESS !== "false".',
      followUps: [
        {
          q: 'How does Playwright usually decide between headed and headless?',
          a: 'Headless is the default. You run headed with the --headed flag, or with `use: { headless: false }` in playwright.config. Teams often switch settings on `!!process.env.CI`, because CI systems set CI=true. For example: retries: process.env.CI ? 2 : 0.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-10',
      difficulty: 'hard',
      question: 'An environment-name switch is called with the string "1" and then with the number 1. What gets logged?',
      code: {
        language: 'javascript',
        code: `function envName(code) {
  switch (code) {
    case 1:
      console.log('qa');
    case 2:
      console.log('staging');
      break;
    default:
      console.log('local');
  }
}
envName('1');
envName(1);`,
      },
      options: ['local, then qa and staging', 'qa, then qa', 'qa and staging, then qa and staging', 'local, then qa'],
      correct: [0],
      explanation:
        'switch compares with ===, so the string "1" matches no case. It runs default and prints local. For the number 1, case 1 matches. There is no break, so the code falls through into case 2 and prints qa, then staging. Answers that print qa for "1" assume a loose check. "local, then qa" forgets about fall-through.',
      followUps: [
        {
          q: 'How would you catch this kind of bug automatically?',
          a: 'Use tools. ESLint\'s no-fallthrough rule flags a case that falls through without a comment. TypeScript\'s noFallthroughCasesInSwitch option makes it a compile error. TypeScript would also flag passing a string where a number is expected.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-11',
      difficulty: 'medium',
      question: 'Which template literal correctly builds a unique email like `qa_1700000000000@test.com` from `const id = Date.now()`?',
      options: [
        '`qa_${id}@test.com` (with backticks)',
        "'qa_${id}@test.com' (with single quotes)",
        '"qa_" + ${id} + "@test.com"',
        '`qa_$(id)@test.com` (with backticks)',
      ],
      correct: [0],
      explanation:
        'Filling in a value needs backticks and the ${ } syntax. Inside single or double quotes, ${id} is just plain text, so you get "qa_${id}@test.com". ${} outside a template literal is a syntax error. $(id) is shell syntax, not JavaScript.',
      followUps: [
        {
          q: 'Is Date.now() unique enough for parallel Playwright workers?',
          a: 'Not always. Two workers can create data in the same millisecond. Add the worker number (testInfo.workerIndex), or a random part, or use crypto.randomUUID(). Clashes cause flaky "email already registered" failures that only appear when tests run in parallel.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-12',
      difficulty: 'hard',
      question: 'Select ALL true statements about `typeof`.',
      options: [
        'typeof null returns "object"',
        'typeof [] returns "array"',
        'typeof NaN returns "number"',
        'typeof a function returns "function"',
        'typeof undeclaredVariable throws a ReferenceError',
      ],
      correct: [0, 2, 3],
      explanation:
        'typeof null is "object" (an old bug). typeof NaN is "number". Functions give "function". Arrays give "object", so use Array.isArray for them. typeof on a variable that was never declared safely gives "undefined" and does not throw. (But typeof on a let variable in its temporal dead zone does throw.)',
      followUps: [
        {
          q: 'Why is it useful that typeof does not throw on undeclared variables?',
          a: 'It lets code check for globals that may not exist. For example, `typeof window !== "undefined"` tells the browser apart from Node. Using `window` directly in Node would throw a ReferenceError.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-13',
      difficulty: 'hard',
      question: 'An API returns `{ "order": { "customer": null } }`. Which expression gives "N/A" without throwing when customer is null?',
      code: {
        language: 'javascript',
        code: `const body = { order: { customer: null } };
// A: body.order.customer.email || 'N/A'
// B: body.order.customer?.email ?? 'N/A'
// C: body.order?.customer.email ?? 'N/A'
// D: body?.order.customer.email ?? 'N/A'`,
      },
      options: ['B only', 'B and C', 'A and B', 'B and D'],
      correct: [0],
      explanation:
        'B stops at customer?. and gives undefined, then ?? gives "N/A". A, C and D all read .email from null, so they throw a TypeError. In C the ?. guards order, which exists. In D it guards body. ?. only protects the value just before it, so put it right after the value that can be null.',
      followUps: [
        {
          q: 'When can optional chaining hide a real bug?',
          a: 'If the contract says customer is required, `customer?.email` lets the test quietly carry on with undefined. In assertions, check the shape on purpose, with expect(body.order.customer).not.toBeNull() or a schema check. Keep ?. for data that is really optional.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-14',
      difficulty: 'expert',
      question: 'Select ALL lines that log `NaN`.',
      code: {
        language: 'javascript',
        code: `console.log(Number('$29.99'));   // A
console.log(parseFloat('29.99 USD')); // B
console.log(Number(''));         // C
console.log(undefined + 1);      // D
console.log(parseInt('px42', 10)); // E`,
      },
      options: ['A', 'B', 'C', 'D', 'E'],
      correct: [0, 3, 4],
      explanation:
        'Number() rejects any non-number character, so "$29.99" gives NaN (A). parseFloat reads the number at the start and stops at the extra text, so B is 29.99. Number("") is 0, not NaN (C). undefined becomes NaN in maths (D). parseInt needs the text to start with a digit, so "px42" gives NaN (E).',
      followUps: [
        {
          q: 'Why is Number("") === 0 dangerous in UI tests?',
          a: 'Say a price element is empty because the app failed to show it. Number(text) quietly becomes 0. Then a "total is not negative" or "free item" check could pass. Check that the text is not empty (or match it with a regex) before converting, so missing data fails clearly.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL true statements about this failure: `TypeError: Cannot read properties of undefined (reading \'email\')` at line 12 of user.helper.js.',
      options: [
        'The expression immediately before `.email` evaluated to undefined',
        'The property email exists but its value is undefined',
        'Logging the object one level up (e.g. `console.log({ user })`) is a good first step',
        'The bug is always at line 12, never in the code that produced the object',
      ],
      correct: [0, 2],
      explanation:
        'The message means JavaScript tried to read `email` from undefined. So the thing before `.email` was undefined. Logging it, and where it came from, is the right first step. If email existed with the value undefined, reading it would not throw. Line 12 is where it crashed, but the cause is often earlier, for example an API giving a different shape or a function missing a return.',
      followUps: [
        {
          q: 'What tools help beyond console.log in Node?',
          a: 'Put a `debugger;` line in the code and run `node --inspect-brk file.js`. Then attach Chrome DevTools or the VS Code debugger to step through the code and see the variables. For Playwright tests, `npx playwright test --debug` and the trace viewer show each action and its state.',
        },
      ],
    },
  ],
};

export default topic;
