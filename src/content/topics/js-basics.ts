import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-basics',
  phase: 'javascript',
  order: 1,
  title: 'JavaScript Basics for Testers',
  subtitle:
    'Variables, types, operators, == vs ===, truthy/falsy, conditionals, template literals and number gotchas: the JavaScript you need before you write a single Playwright test.',
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
    'JavaScript is the language; Node.js runs it outside the browser. Playwright tests are JavaScript/TypeScript files that Node executes.',
    'Default to `const`; use `let` only when you reassign; avoid `var` (function-scoped, hoisted as undefined, leaks out of blocks).',
    '8 types: string, number, bigint, boolean, undefined, null, symbol, object. `typeof null` is "object" (historic bug); use `Array.isArray()` for arrays.',
    '`===` compares type AND value with no conversion; `==` converts first (`"1" == 1` is true, `0 == ""` is true). Use `===` everywhere; `x == null` is the one accepted idiom.',
    'Falsy values (exactly 8): false, 0, -0, 0n, "", null, undefined, NaN. Everything else is truthy, including "0", "false", [] and {}.',
    '`a || b` falls back on ANY falsy value (0 and "" too); `a ?? b` falls back only on null/undefined. Use `??` for config defaults like timeouts and retries.',
    '`obj?.a?.b` returns undefined instead of throwing when a link is null/undefined; pair with `??` for a default.',
    '`+` with a string concatenates ("5" + 2 is "52"); `-`, `*`, `/` convert to numbers ("5" - 2 is 3).',
    '0.1 + 0.2 is 0.30000000000000004: compare money in cents or with `toFixed(2)`; never `===` on raw float sums.',
    '`NaN !== NaN`; check with `Number.isNaN(x)`. `parseFloat("29.99 USD")` is 29.99 but `Number("$29.99")` is NaN: strip symbols first.',
    'Template literals: backticks, `${expr}` interpolation, multi-line; ideal for unique test data like `user_${Date.now()}@test.com`.',
    'Debug with `console.log`, `console.table`, `console.error`, and the Node REPL; read the error name and line number first.',
  ],
  sections: [
    {
      heading: 'What JavaScript and Node.js are (and why Playwright needs them)',
      body: `**Intuition:** JavaScript is a language, like English. Node.js is a "speaker" that can read that language on your laptop or a CI server, outside the browser. A Playwright test is a JavaScript (or TypeScript) file; Node.js reads it and, through Playwright, drives Chromium, Firefox and WebKit.

**The precise picture**

| Term | What it is | Where you meet it as a tester |
|---|---|---|
| **JavaScript (ECMAScript)** | The language standard, updated yearly (ES2015 added \`let\`, \`const\`, arrows, classes; ES2020 added \`??\` and \`?.\`) | Every test file you write |
| **Browser engine** (V8 in Chrome, SpiderMonkey in Firefox, JavaScriptCore in Safari) | Runs JS inside a web page | DevTools console, the app under test |
| **Node.js** | V8 plus file system, network and process APIs, running outside the browser | \`npx playwright test\` runs on Node |
| **npm** | Node's package manager | \`npm init playwright@latest\` installs Playwright |
| **TypeScript** | JavaScript plus optional type annotations, compiled away before running | Playwright's default template uses \`.ts\` files |

**Why a manual tester must learn JS first:** every Playwright line (\`await page.getByRole('button', { name: 'Login' }).click()\`) is ordinary JavaScript: an object (\`page\`), a method call, a string, an options object, and \`await\`. If you understand values, objects, functions and promises, Playwright reads like plain English. If you do not, you end up copy-pasting code you cannot debug.

**In interviews, say this:** "JavaScript is the language, Node.js is the runtime that executes it outside a browser, and Playwright is a Node library. My tests run in Node and control real browsers through Playwright."`,
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
        'JavaScript = language; Node.js = runtime outside the browser; Playwright = Node library that drives browsers.',
        'TypeScript is JavaScript with types; everything in this phase applies to it unchanged.',
        'Your test code and the web app\'s code run in different places (Node vs the browser page).',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Get Started, Ch 1; Node.js docs",
    },
    {
      heading: 'Running JavaScript: Node, the REPL and the browser console',
      body: `**Intuition:** you need a scratch pad where you can type a line and instantly see the result, the way you would try a value in a form field before writing the test case.

**Three ways to run JS**

1. **Node REPL:** type \`node\` in a terminal and press Enter. You get a \`>\` prompt; type \`0.1 + 0.2\` and see the answer. \`.exit\` (or Ctrl+C twice) quits.
2. **A file:** save code as \`scratch.js\` and run \`node scratch.js\`. This is how you practise every snippet in this course.
3. **Browser DevTools console:** F12 → Console. Useful for poking at the app under test (\`document.title\`), but remember that this is the *page's* JavaScript world, not your test's.

**Statements, semicolons, comments:** a program is a list of statements run top to bottom. Semicolons are optional in most places (automatic semicolon insertion), but teams usually keep them or enforce a style with a formatter (Prettier). \`//\` starts a one-line comment; \`/* ... */\` spans lines.

**Common mistake:** running \`node login.spec.ts\` to execute a Playwright test. Node will run the file as a plain script, \`test()\` will not be registered with the runner, and nothing happens (or a type error). Playwright tests are run with \`npx playwright test\`.`,
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
        'Practise every snippet with `node file.js` or the `node` REPL.',
        'The DevTools console runs inside the page, not inside your test.',
        'Playwright tests run with `npx playwright test`, not `node file.spec.ts`.',
      ],
      source: 'Node.js docs: REPL; javascript.info: Hello, world! and Code structure',
    },
    {
      heading: 'Variables: let, const and var',
      body: `**Intuition:** a variable is a labelled box. \`const\` is a box whose label is glued to one value forever; \`let\` is a box you can empty and refill; \`var\` is an old box with a loose lid that leaks outside the room you put it in.

**The rules**

| | \`const\` | \`let\` | \`var\` |
|---|---|---|---|
| Reassign? | No (TypeError) | Yes | Yes |
| Scope | Block \`{ }\` | Block \`{ }\` | Whole function (or global) |
| Use before declaration | ReferenceError (temporal dead zone) | ReferenceError (temporal dead zone) | \`undefined\` (hoisted and initialised) |
| Redeclare in same scope | SyntaxError | SyntaxError | Allowed (silently) |
| Modern advice | **Default choice** | When the value changes | Avoid in new code |

**\`const\` does not mean frozen.** It locks the *binding*, not the contents. \`const user = { name: 'standard_user' }\` can still have \`user.name\` changed; you just cannot point \`user\` at a different object. This matters for shared test data (see the Objects topic).

**Naming:** camelCase (\`loginButton\`, \`maxRetries\`), letters/digits/\`$\`/\`_\`, cannot start with a digit, case-sensitive (\`User\` ≠ \`user\`). Reserved words (\`let\`, \`class\`, \`return\`) are not allowed. Use names that read like test language: \`expectedTitle\`, \`invalidEmails\`, \`cartCount\`.

**In interviews, say this:** "I use \`const\` by default so accidental reassignment fails loudly, \`let\` for counters and values that change, and I avoid \`var\` because it is function-scoped and hoisted, which causes bugs that are hard to spot."`,
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

// const locks the binding, not the object's contents
const user = { name: 'standard_user' };
user.name = 'locked_out_user';
console.log(user.name); // → locked_out_user

// var ignores block scope, let respects it
if (true) {
  var leaky = 'I escaped the block';
  let contained = 'I stay inside';
}
console.log(leaky);            // → I escaped the block
console.log(typeof contained); // → undefined (not declared out here)`,
        },
      ],
      keyPoints: [
        '`const` by default, `let` when reassigning, never `var` in new code.',
        '`const` objects and arrays can still be mutated.',
        '`var` is function-scoped and leaks out of `if`/`for` blocks.',
      ],
      source: 'javascript.info: Variables; MDN: let, const, var',
    },
    {
      heading: 'Data types and typeof quirks',
      body: `**Intuition:** every value has a *kind*: text, number, yes/no, "nothing", or a bundle of other values. The kind decides what operations make sense, just as a date field and a quantity field accept different inputs.

**The 8 types**

| Type | Example | \`typeof\` result | Note for testers |
|---|---|---|---|
| string | \`'Products'\`, \`"₹499"\` | \`"string"\` | Text you read from the page is always a string |
| number | \`42\`, \`29.99\`, \`NaN\`, \`Infinity\` | \`"number"\` | One type for integers and decimals |
| bigint | \`9007199254740993n\` | \`"bigint"\` | Huge integers (rare in tests) |
| boolean | \`true\`, \`false\` | \`"boolean"\` | Results of checks |
| undefined | a declared but unset variable | \`"undefined"\` | "No value was assigned" |
| null | \`null\` | \`"object"\` (!) | "Intentionally empty"; the \`typeof\` result is a 1995 bug kept for compatibility |
| symbol | \`Symbol('id')\` | \`"symbol"\` | Unique keys (rare in tests) |
| object | \`{}\`, \`[]\`, \`new Date()\`, functions | \`"object"\` / \`"function"\` | Arrays and null also say "object" |

The first seven are **primitives** (immutable, compared by value). Objects are compared **by reference** (covered in the Objects topic).

**\`null\` vs \`undefined\`:** \`undefined\` usually means "JavaScript never got a value" (missing property, missing argument, function with no return). \`null\` usually means "a developer deliberately said empty" (an API returning \`"middleName": null\`). In API tests, a field that is \`null\` and a field that is missing are different defects.

**Reliable checks:** \`Array.isArray(x)\` for arrays, \`x === null\` for null, \`Number.isNaN(x)\` for NaN, \`typeof x === 'string'\` for strings.

**Common mistake:** asserting \`typeof response.items === 'array'\`. It is never true; \`typeof []\` is \`'object'\`.`,
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
        '7 primitives + object. Arrays, dates, null and functions are not separate `typeof` types (functions report "function").',
        '`typeof null === "object"` and `typeof NaN === "number"` are classic interview traps.',
        'Use `Array.isArray`, `=== null` and `Number.isNaN` for precise checks.',
      ],
      source: 'javascript.info: Data types; MDN: typeof',
    },
    {
      heading: 'Operators: arithmetic, logical, ?? and ?.',
      body: `**Intuition:** operators are the verbs of JavaScript: add, compare, combine conditions, pick a fallback.

**Arithmetic:** \`+ - * / % **\`. \`%\` is the remainder (\`10 % 3\` is 1), handy for "every 3rd row". \`**\` is power. \`++\`/\`--\` add or subtract one.

**The \`+\` trap:** if either side is a string, \`+\` **concatenates**. Other arithmetic operators convert strings to numbers. This is the #1 source of "the total shows 2999 instead of 59.98" bugs when prices are read from the page as text.

**Logical operators return one of their operands, not just true/false:**
- \`a || b\` returns \`a\` if it is truthy, else \`b\`.
- \`a && b\` returns \`a\` if it is falsy, else \`b\`.
- \`!a\` returns a real boolean; \`!!a\` converts any value to boolean.

**Nullish coalescing \`??\` (ES2020):** \`a ?? b\` returns \`b\` only when \`a\` is \`null\` or \`undefined\`. Unlike \`||\`, it keeps legitimate \`0\`, \`''\` and \`false\`.

**Optional chaining \`?.\` (ES2020):** \`user?.address?.city\` stops and returns \`undefined\` if any link is null/undefined instead of throwing \`TypeError: Cannot read properties of undefined\`. Also works for calls (\`obj.method?.()\`) and brackets (\`obj?.[key]\`).

| Expression | Result | Why |
|---|---|---|
| \`0 \\|\\| 30000\` | 30000 | 0 is falsy, so \`\\|\\|\` falls back |
| \`0 ?? 30000\` | 0 | 0 is not null/undefined |
| \`'' \\|\\| 'guest'\` | \`'guest'\` | empty string is falsy |
| \`null ?? 'x'\` | \`'x'\` | null triggers \`??\` |

**In interviews, say this:** "For defaults I use \`??\` because a timeout of 0 or retries of 0 is a valid setting; \`||\` would silently replace it."`,
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
        '`+` with any string concatenates; `-`, `*`, `/` convert to numbers.',
        '`||`/`&&` return operands, not booleans.',
        '`??` only replaces null/undefined; `?.` prevents crashes on missing links.',
      ],
      source: 'javascript.info: Basic operators, Logical operators, Nullish coalescing, Optional chaining',
    },
    {
      heading: '== vs === and type coercion',
      body: `**Intuition:** \`===\` is a strict passport check: same type, same value, no excuses. \`==\` is a lenient doorman who first tries to "convert" both sides into something comparable and then compares, which lets surprising guests in.

**Strict equality \`===\`:** if the types differ, the answer is \`false\` immediately. No conversion. \`!==\` is its negation.

**Loose equality \`==\`:** if types differ, JavaScript **coerces** (converts) them, mostly towards numbers: strings become numbers, booleans become 1/0. Special rules: \`null == undefined\` is \`true\`, and \`null\`/\`undefined\` equal nothing else. \`NaN\` equals nothing, not even itself.

| Expression | \`==\` | \`===\` | What happened with \`==\` |
|---|---|---|---|
| \`'1' == 1\` | true | false | \`'1'\` → 1 |
| \`0 == ''\` | true | false | \`''\` → 0 |
| \`'0' == false\` | true | false | both → 0 |
| \`[] == false\` | true | false | \`[]\` → \`''\` → 0 |
| \`null == undefined\` | true | false | special rule |
| \`null == 0\` | false | false | null only equals undefined |
| \`NaN == NaN\` | false | false | NaN equals nothing |

**Coercion beyond \`==\`:** relational operators (\`<\`, \`>=\`) also convert, which gives \`null >= 0\` → \`true\` while \`null == 0\` → \`false\`. Comparing two **strings** with \`<\` compares them alphabetically by character code, so \`'10' < '9'\` is \`true\`. That is exactly the bug when you verify "sorted by price" using text read from the page.

**Explicit conversion beats implicit:** \`Number(x)\`, \`String(x)\`, \`Boolean(x)\`. Kyle Simpson's point in *You Don't Know JS* is that coercion is not evil if it is obvious; the danger is coercion you did not intend.

**In interviews, say this:** "I use \`===\` everywhere. \`==\` converts types first, so \`'0' == false\` is true. The only \`==\` I accept is \`value == null\`, which matches both null and undefined in one check."`,
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
console.log(null >= 0);         // → true  (relational: null -> 0)
console.log(NaN == NaN);        // → false

// A real bug: badge text from the page is a string
const cartBadgeText = '2';
console.log(cartBadgeText === 2);         // → false (types differ)
console.log(Number(cartBadgeText) === 2); // → true  (convert explicitly)

// Sorting check with strings vs numbers
console.log('10' < '9');  // → true  (alphabetical, char by char)
console.log(10 < 9);      // → false

// The accepted == idiom: one check for null OR undefined
const discount = undefined;
console.log(discount == null); // → true`,
        },
      ],
      keyPoints: [
        '`===` never converts; `==` converts types first.',
        'Convert page text explicitly with `Number()` before numeric checks.',
        'String comparison with `<`/`>` is alphabetical: `"10" < "9"` is true.',
        '`x == null` is the one widely accepted use of `==`.',
      ],
      source: "MDN: Equality comparisons and sameness; javascript.info: Comparisons; Kyle Simpson: You Don't Know JS Yet (coercion)",
    },
    {
      heading: 'Truthy and falsy values',
      body: `**Intuition:** when JavaScript needs a yes/no (in an \`if\`, with \`!\`, \`||\`, \`&&\`), it squeezes any value into true or false. A short list of values squeeze to \`false\`; everything else is \`true\`.

**The 8 falsy values (memorise them):** \`false\`, \`0\`, \`-0\`, \`0n\`, \`''\` (empty string), \`null\`, \`undefined\`, \`NaN\`.

**Everything else is truthy**, including traps: \`'0'\`, \`'false'\`, \`' '\` (a space), \`[]\` (empty array), \`{}\` (empty object), \`-1\`, \`Infinity\`.

**Why testers care**

| Code | Bug it hides |
|---|---|
| \`if (items) { ... }\` | An empty array \`[]\` is truthy, so "no items returned" is treated as success |
| \`if (!count) fail()\` | \`count = 0\` is falsy, so a valid zero triggers the failure path |
| \`if (process.env.HEADLESS)\` | Environment variables are strings; \`'false'\` is truthy, so headless stays on |
| \`const name = input \\|\\| 'Guest'\` | A legitimate empty-string input gets replaced |

**Better checks:** \`items.length > 0\`, \`count === 0\`, \`process.env.HEADLESS === 'true'\`, \`input ?? 'Guest'\`.

**In interviews, say this:** "Truthiness is fine for 'is this value present at all', but in assertions I compare explicitly, like \`length > 0\` or \`=== 'true'\`, because empty arrays are truthy and zero is falsy."`,
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
        'Exactly 8 falsy values; `[]`, `{}`, `"0"` and `"false"` are truthy.',
        'Environment variables are always strings (or undefined).',
        'Prefer explicit checks (`length > 0`, `=== 0`) in assertions.',
      ],
      source: 'MDN: Falsy, Truthy; javascript.info: Type Conversions',
    },
    {
      heading: 'Conditionals: if/else, switch and the ternary',
      body: `**Intuition:** conditionals are decision tables in code. If you have written a decision table for a coupon field, you already think this way.

**if / else if / else** runs the first branch whose condition is truthy.

**switch** compares one value against many cases **using \`===\`**. Each \`case\` needs a \`break\` (or \`return\`), otherwise execution "falls through" into the next case. That fall-through is a classic bug, but it can be used deliberately to group cases.

**Ternary \`cond ? a : b\`** is an expression that returns a value; use it for short choices (\`const browser = isCI ? 'chromium' : 'firefox'\`), not for nested logic.

**Worked example:** classify an HTTP status code from an API response, a helper you will reuse in API tests.`,
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
        '`switch` uses strict equality and needs `break`/`return` to stop fall-through.',
        'Ternary is an expression: good for picking a value, bad for nested logic.',
        'String comparisons in conditions are case-sensitive.',
      ],
      source: 'javascript.info: Conditional branching, The "switch" statement',
    },
    {
      heading: 'Template literals for test data',
      body: `**Intuition:** a template literal is a fill-in-the-blanks form. Write the sentence once, mark the blanks, and JavaScript fills them in.

**Syntax:** backticks instead of quotes. Inside, \`\${expression}\` inserts the value of any expression (a variable, arithmetic, a function call). Template literals can span multiple lines and contain both \`'\` and \`"\` without escaping.

**Where testers use them**
- **Unique test data:** \`\` \`qa_\${Date.now()}@example.com\` \`\` so parallel tests never collide on "email already registered".
- **Dynamic URLs:** \`\` \`\${baseUrl}/booking/\${bookingId}\` \`\`.
- **Readable failure messages:** \`\` \`Expected \${expected} items but saw \${actual}\` \`\`.
- **Locators with data:** \`\` page.getByRole('row', { name: \`Order \${orderId}\` }) \`\` builds the accessible name from a variable.

**Gotchas:** objects interpolate as \`[object Object]\` (use \`JSON.stringify\`), \`null\` becomes \`'null'\`, \`undefined\` becomes \`'undefined'\`, arrays are joined with commas. A missing value therefore produces a string like \`/booking/undefined\` rather than an error, so check for it.`,
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
        'Backticks + `${expr}`; multi-line allowed.',
        'Use `Date.now()` or a counter for unique emails and usernames.',
        'Undefined and objects interpolate silently as "undefined" and "[object Object]".',
      ],
      source: 'MDN: Template literals; javascript.info: Strings (backticks)',
    },
    {
      heading: 'Number gotchas: 0.1 + 0.2, NaN and parsing',
      body: `**Intuition:** computers store decimals in binary, and most decimals (like 0.1) cannot be written exactly in binary, just as 1/3 cannot be written exactly in decimal. Tiny rounding errors appear, and they break \`===\` on prices.

**Floating point (IEEE 754 double):** \`0.1 + 0.2\` is \`0.30000000000000004\`. On SauceDemo, Fleece Jacket ($49.99) + Onesie ($7.99) computes as \`57.980000000000004\`. Fixes for price assertions:
1. Format both sides: \`sum.toFixed(2) === '57.98'\` (\`toFixed\` returns a **string**).
2. Work in cents: \`Math.round(price * 100)\`.
3. Compare with tolerance: \`Math.abs(a - b) < 0.005\` (Playwright's \`toBeCloseTo\` does this).

**NaN:** "Not a Number" is what failed numeric conversions produce (\`Number('$29.99')\`). It is of type number, it is **not equal to itself**, and it spreads: any arithmetic with NaN gives NaN. Check with \`Number.isNaN(x)\` (the global \`isNaN('abc')\` converts first and returns true for any non-numeric string).

**Parsing text from the page**

| Call | Result | Use when |
|---|---|---|
| \`Number('29.99')\` | 29.99 | Whole string must be numeric |
| \`Number('$29.99')\` | NaN | Fails on any junk |
| \`Number('')\` | 0 | Careful: empty becomes 0! |
| \`parseFloat('29.99 USD')\` | 29.99 | Reads leading number, ignores the rest |
| \`parseFloat('$29.99')\` | NaN | Must start with a digit/sign |
| \`parseInt('42px', 10)\` | 42 | Integers; always pass radix 10 |

**Other edges:** \`1 / 0\` is \`Infinity\`; integers are only exact up to \`Number.MAX_SAFE_INTEGER\` (9007199254740991), so large IDs from APIs should stay strings or use BigInt.`,
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
        'Never `===` raw float sums; use `toFixed(2)`, cents, or a tolerance.',
        '`toFixed` returns a string.',
        '`Number("")` is 0 and `Number("$1")` is NaN: clean page text first.',
        '`NaN !== NaN`; use `Number.isNaN`.',
      ],
      source: 'javascript.info: Numbers; MDN: Number.EPSILON, parseFloat, Number.isNaN',
    },
    {
      heading: 'Console debugging',
      body: `**Intuition:** \`console.log\` is your evidence screenshot. When a test misbehaves, print what the code actually sees, not what you assume it sees.

**Useful console methods**

| Method | Use |
|---|---|
| \`console.log(a, b)\` | Print values; pass several args instead of concatenating so types stay visible |
| \`console.log({ total, expected })\` | Shorthand prints names with values: \`{ total: 59.98, expected: '59.98' }\` |
| \`console.table(rows)\` | Arrays of objects as a table (test data sets) |
| \`console.error\` / \`console.warn\` | Write to stderr; shows up highlighted in CI logs |
| \`console.time('x')\` / \`console.timeEnd('x')\` | Rough timing of a block |
| \`console.assert(cond, msg)\` | Logs only when \`cond\` is falsy (does not throw) |

**Reading an error:** look at the **name** (\`TypeError\`, \`ReferenceError\`, \`SyntaxError\`), the **message**, and the **first stack line in your own file**. \`TypeError: Cannot read properties of undefined (reading 'email')\` means the thing *before* \`.email\` was undefined.

**Beyond console:** in Node you can pause on a \`debugger;\` statement with \`node --inspect-brk file.js\`, and in Playwright you will later use \`--debug\`, \`page.pause()\` and the trace viewer. Remove noisy logs before committing; leftover logs make CI output unreadable.`,
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
        'Log `{ variable }` to see both name and value; check `typeof` when results look odd.',
        'Read error name + message + first line in your file.',
        '`console.assert` does not fail a test; real assertions do.',
      ],
      source: 'Node.js docs: Console; javascript.info: Debugging in the browser',
    },
  ],
  codeChallenges: [
    {
      id: 'js-basics-cc-1',
      title: 'Fix the test-config helper that ignores zero and compares loosely',
      context:
        'A teammate wrote a helper that builds run settings for a Playwright-style suite from an options object and an environment variable. On CI, `retries: 0` is ignored, `HEADLESS=false` still runs headless, and the "is smoke run" check passes for the wrong values.',
      task: 'Fix `buildSettings(opts, env)` so that explicit 0/false/empty values are respected, the env var string is interpreted correctly, and comparisons are strict. It must return `{ retries, timeout, headless, isSmoke, label }` where `headless` is a real boolean and `label` reads "Run with N attempts" (N = retries + 1). Press Run to check your fix.',
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
        'Which operator falls back only on null/undefined instead of on every falsy value?',
        'Environment variables are strings. What is `Boolean("false")`?',
        'Look at how `+` evaluates left to right when a string is involved, and decide what type `tag` should be.',
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
1. **\`||\` → \`??\`** for \`retries\` and \`timeout\`: \`||\` replaced the legitimate \`0\` with the default. \`??\` only replaces \`null\`/\`undefined\`.
2. **Env var parsing:** \`env.HEADLESS || true\` returned the *string* \`'false'\`, which is truthy, so the suite stayed headless. The fix compares the string explicitly and returns a real boolean.
3. **Loose equality:** \`opts.tag == 1\` happened to work for \`'1'\` but also passes for \`true\` and \`' 1 '\`. Converting with \`Number()\` and comparing with \`===\` makes the intent explicit.
4. **Concatenation bug:** \`'Run with ' + retries + 1\` evaluates left to right as string + number + number, producing \`'21'\`. Doing the math inside \`\${}\` (or in parentheses) fixes it.
5. **\`var\` → \`const\`:** none of the values are reassigned; \`const\` documents that and prevents accidents.`,
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
          q: 'Why might `timeout: 0` be a meaningful value rather than a mistake?',
          a: 'In Playwright, a timeout of 0 means "no timeout" for many settings, which people use while debugging. A helper that silently turns 0 into 30000 changes behaviour without telling anyone. The general rule: a default should only apply when the caller gave no value at all, which is exactly what `??` expresses.',
        },
        {
          q: 'How would you test this helper itself?',
          a: 'Table-driven unit checks: each row gives opts, env and the expected settings. Include the boundary values that broke it: retries 0, timeout 0, HEADLESS "false", "true", undefined and an unexpected value like "no", tag as "1", 1 and "smoke". The bug class here is "falsy but valid", so every input should have a 0/empty/false row.',
        },
      ],
    },
    {
      id: 'js-basics-cc-2',
      title: 'Repair a flaky cart-total check',
      context:
        'This helper verifies the SauceDemo checkout overview: it reads item prices and the "Item total" label as text, sums the items and compares. It fails intermittently depending on which products are in the cart, and once it passed when the label was missing entirely.',
      task: 'Fix `verifyItemTotal(priceTexts, totalLabel)` so it parses the prices robustly, compares money without floating-point surprises, and fails loudly when anything cannot be parsed. It returns `\'PASS\'`, or `\'FAIL: unparseable price in <JSON of priceTexts>\'`, `\'FAIL: unparseable total label "<label>"\'`, or `\'FAIL: items add up to X.XX but page shows Y.YY\'`. Press Run to check your fix.',
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
        'What does `parseFloat("$49.99")` return, and what does the second `if` do with that value?',
        'Convert each side to whole cents with `Math.round(x * 100)` before comparing.',
        'Treat "could not parse" as its own failure with `Number.isNaN`, never as a pass.',
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
1. **Parsing:** \`parseFloat('$49.99')\` is \`NaN\` because the string starts with \`$\`. The new \`toCents\` extracts the first number with a small regex, so \`$49.99\`, \`49.99\` and \`Item total: $57.98\` all work.
2. **NaN treated as a pass:** \`sum != sum\` is true only for NaN, and the starter returned PASS for it, the worst possible outcome: a test that passes when it cannot read the page. Unparseable input is now an explicit FAIL with the offending text.
3. **Floating point:** \`49.99 + 7.99\` is \`57.980000000000004\`. Summing integer cents avoids drift entirely.
4. **Strict comparison** (\`===\`) on integers, and failure messages that show both values formatted to two decimals, so the CI log is self-explanatory.`,
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
          q: 'In Playwright, which assertion would you use for a computed decimal instead of hand-rolled cents?',
          a: '`expect(sum).toBeCloseTo(57.98, 2)` compares numbers with a precision of 2 decimal digits, which absorbs floating-point noise. For the text on the page itself I would use a web-first assertion such as `await expect(page.getByTestId("subtotal-label")).toHaveText("Item total: $57.98")`, which also retries until the UI settles.',
        },
        {
          q: 'Why is "a test that passes when it cannot read the data" so dangerous?',
          a: 'It is a false negative for the whole suite: the report is green while the feature may be broken, and nobody looks at green tests. Good checks fail closed: missing elements, NaN, empty strings or undefined must produce a failure with a message that names the bad input, so the root cause is obvious in the CI log.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-basics-iq-01',
      difficulty: 'easy',
      question: 'What is the difference between var, let and const? Which do you use in your test scripts and why?',
      whatInterviewerLooksFor: [
        'Scope difference: function scope vs block scope',
        'Hoisting behaviour: undefined vs temporal dead zone',
        'Knows const prevents reassignment but not mutation',
        'States a clear personal default with a reason',
      ],
      modelAnswer: `**Short answer:** all three declare variables; they differ in scope, hoisting and reassignment.

| | var | let | const |
|---|---|---|---|
| Scope | function | block | block |
| Access before declaration | \`undefined\` | ReferenceError (TDZ) | ReferenceError (TDZ) |
| Reassign | yes | yes | no |
| Redeclare in same scope | yes | no | no |

**Example of the scope difference:** a \`var\` declared inside an \`if\` block is visible after the block; a \`let\` is not. With \`var\` in a loop that schedules callbacks, every callback sees the final value; with \`let\`, each iteration gets its own copy.

**const is not "immutable":** \`const user = { role: 'admin' }\` cannot be pointed at another object, but \`user.role = 'guest'\` still works. To actually freeze an object you would use \`Object.freeze\` (shallow).

**What I use:** \`const\` by default (base URLs, locators, test data objects, the \`page\` from a fixture), \`let\` only for values that change, such as a retry counter or an accumulator, and never \`var\`. In tests this has a practical benefit: if someone accidentally reassigns \`expectedTotal\` halfway through a test, \`const\` makes it fail immediately with a TypeError instead of silently asserting against the wrong value.`,
      followUps: [
        {
          q: 'If const objects can be mutated, how do you protect shared test data?',
          a: 'Either create fresh data per test with a factory function (each call returns a new object), or deep-copy before modifying with structuredClone. Object.freeze helps catch accidental writes, but it is shallow, so nested objects remain writable. In Playwright, a fixture that builds data per test is the cleanest option because tests can also run in parallel workers.',
        },
        {
          q: 'What happens if you access a let variable before its declaration line?',
          a: 'You get `ReferenceError: Cannot access \'x\' before initialization`. The variable is hoisted (the engine knows it exists in that block), but it is uninitialised until the declaration runs; that window is called the temporal dead zone. With var, the same access returns undefined, which hides the bug instead of reporting it.',
        },
      ],
      pitfalls: [
        'Saying const makes objects immutable.',
        'Claiming let and const are not hoisted at all (they are, but stay in the TDZ).',
        'Describing var only as "old" without explaining function scope.',
      ],
    },
    {
      id: 'js-basics-iq-02',
      difficulty: 'medium',
      question: 'Explain == versus === with examples. Is there ever a good reason to use ==?',
      whatInterviewerLooksFor: [
        'Correctly says == performs type coercion and === does not',
        'Gives concrete surprising examples',
        'Mentions null/undefined special case and NaN',
        'Connects to a real test bug (string from the page vs number)',
      ],
      modelAnswer: `**\`===\` (strict):** compares type and value. Different types → \`false\`, no conversion.

**\`==\` (loose):** if the types differ, JavaScript converts them first (usually to numbers), then compares.

Examples:
- \`'5' == 5\` → \`true\`, \`'5' === 5\` → \`false\`
- \`0 == ''\` → \`true\`; \`'0' == false\` → \`true\`; \`[] == false\` → \`true\`
- \`null == undefined\` → \`true\` but \`null == 0\` → \`false\`
- \`NaN == NaN\` → \`false\` (NaN equals nothing; use \`Number.isNaN\`)

**Why it matters in testing:** anything you read from the UI (\`textContent\`, \`inputValue\`) is a string. If I write \`if (badgeText == 3)\` it passes for \`'3'\`, but it also passes for \`' 3 '\` and \`'03'\`, which might be a formatting bug I should catch. With \`===\` I am forced to convert explicitly: \`Number(badgeText.trim()) === 3\`, or better, assert the exact text \`'3'\`.

**The one good use of \`==\`:** \`value == null\` is a compact, widely accepted way to test for "null or undefined" in one go. Linters such as ESLint's \`eqeqeq\` rule have an option that allows exactly this.

**Objects:** both operators compare object **references**, so \`{a:1} === {a:1}\` is \`false\`. To compare API payloads I use a deep equality assertion (\`toEqual\` in Playwright's expect).`,
      followUps: [
        {
          q: 'What does `[] == ![]` return and why?',
          a: 'true. `![]` is evaluated first: `[]` is truthy, so `![]` is `false`. Now `[] == false`: the boolean becomes 0, the array is converted to a primitive (`""`), and `""` becomes 0. `0 == 0` is true. It is a puzzle, but it shows why == is avoided: the rules chain several conversions.',
        },
        {
          q: 'How does Playwright\'s expect compare values: like == or ===?',
          a: '`toBe` uses Object.is, which is like === except that NaN equals NaN and +0 differs from -0. `toEqual` recursively compares the contents of objects and arrays. Neither does loose coercion, so `expect("3").toBe(3)` fails, which is what you want.',
        },
      ],
      pitfalls: [
        'Saying == "compares only values" without explaining conversion.',
        'Thinking === compares object contents.',
        'Forgetting that NaN is not equal to itself under either operator.',
      ],
    },
    {
      id: 'js-basics-iq-03',
      difficulty: 'medium',
      question: 'What is the difference between null and undefined, and why does typeof null return "object"? How would you check if an API field is an array?',
      context: 'Asked while discussing validation of an API response body in a JavaScript-based test.',
      whatInterviewerLooksFor: [
        'undefined = not assigned / missing; null = intentionally empty',
        'Knows typeof null is a historic bug, not a feature',
        'Uses Array.isArray instead of typeof',
        'Links missing vs null fields to API contract defects',
      ],
      modelAnswer: `**undefined** means "no value has been assigned": a declared variable without a value, a missing object property, a missing function argument, or the result of a function with no \`return\`.

**null** is a value a developer deliberately assigns to mean "empty / no object here", for example \`"discountCode": null\` in a JSON response.

**typeof null === 'object'** is a bug from the first JavaScript implementation (1995): values were stored with a type tag, and the tag for objects was 0, which is also what the null pointer looked like. Fixing it would break existing websites, so it stayed. Practical consequence: \`typeof x === 'object'\` is not a safe "is this an object?" check; add \`x !== null\`.

**Checking for arrays:** \`typeof []\` is also \`'object'\`, so I use \`Array.isArray(body.items)\`.

**Why testers care:** in an API contract, these are three different situations:
1. field present with a value,
2. field present but \`null\`,
3. field missing (reading it gives \`undefined\`).

If the spec says "\`middleName\` may be null", then a response without the field at all is a contract violation that a loose check like \`if (!body.middleName)\` would not distinguish. I check \`'middleName' in body\` (or \`Object.hasOwn\`) and \`body.middleName === null\` separately, or validate the whole body with a JSON schema.`,
      followUps: [
        {
          q: 'What does JSON.stringify do with undefined and null values?',
          a: 'Properties whose value is undefined are dropped from the output, while null is kept: `JSON.stringify({ a: undefined, b: null })` gives `{"b":null}`. So if a client sends a body built from objects with undefined fields, the server never sees those keys. Worth knowing when an API test "sends" a field that silently disappears.',
        },
        {
          q: 'How would you check that a value is a plain object (not null, not an array)?',
          a: '`typeof v === "object" && v !== null && !Array.isArray(v)`. Each part removes one false positive: null reports "object", and arrays report "object". For stricter checks (excluding Dates, Maps), compare `Object.getPrototypeOf(v) === Object.prototype`.',
        },
      ],
      pitfalls: [
        'Saying null and undefined are "the same".',
        'Using typeof to detect arrays.',
        'Treating a missing field and a null field as equivalent in API checks.',
      ],
    },
    {
      id: 'js-basics-iq-04',
      difficulty: 'medium',
      question: 'Which values are falsy in JavaScript, and how does `||` differ from `??` when setting defaults in test configuration?',
      whatInterviewerLooksFor: [
        'Lists all falsy values (0, "", null, undefined, NaN, false, -0, 0n)',
        'Knows [] and "0" are truthy',
        'Explains || falls back on any falsy, ?? only on null/undefined',
        'Gives a realistic config example',
      ],
      modelAnswer: `**Falsy values:** \`false\`, \`0\`, \`-0\`, \`0n\`, \`''\`, \`null\`, \`undefined\`, \`NaN\`. Everything else is truthy, including \`'0'\`, \`'false'\`, \`[]\` and \`{}\`.

**\`a || b\`** returns \`a\` if it is truthy, otherwise \`b\`. So it replaces *every* falsy value.

**\`a ?? b\`** returns \`b\` only if \`a\` is \`null\` or \`undefined\`.

**Config example:**

- \`const retries = process.env.RETRIES || 2\`: if someone sets \`RETRIES=0\`... it is actually the *string* \`'0'\`, which is truthy, so this returns \`'0'\` (a string, which may break numeric math later).
- \`const retries = opts.retries || 2\` with \`opts.retries = 0\` returns \`2\`, silently ignoring the explicit "no retries".
- \`const retries = opts.retries ?? 2\` returns \`0\`. Correct.

The robust version for env vars combines both lessons: \`const retries = Number(process.env.RETRIES ?? 2)\`.

**Where truthiness bites in assertions:** \`if (items)\` is true for an empty array; \`if (!count)\` treats a valid 0 as missing. In tests I compare explicitly (\`items.length > 0\`, \`count === 0\`) so the intent is clear and empty states are tested properly.`,
      followUps: [
        {
          q: 'Can you mix ?? with || in one expression?',
          a: 'Not without parentheses: `a || b ?? c` is a SyntaxError, a deliberate rule to avoid ambiguous precedence. Write `(a || b) ?? c` or `a || (b ?? c)` to state what you mean.',
        },
        {
          q: 'What is the difference between ?? and the ??= operator?',
          a: '`x ??= value` assigns value to x only if x is currently null or undefined, so it is shorthand for `x = x ?? value` but without re-assigning when x already has a value. It is handy for lazily filling defaults in an options object, such as `opts.timeout ??= 30000`.',
        },
      ],
      pitfalls: [
        'Forgetting NaN or the empty string in the falsy list.',
        'Believing an empty array is falsy.',
        'Using || for numeric defaults where 0 is valid.',
      ],
    },
    {
      id: 'js-basics-iq-05',
      difficulty: 'medium',
      question: 'Why does 0.1 + 0.2 not equal 0.3 in JavaScript, and how do you assert prices and totals safely in a test?',
      context: 'The interviewer shows a failing check: expected 57.98, received 57.980000000000004 on an e-commerce checkout page.',
      whatInterviewerLooksFor: [
        'Explains binary floating point (IEEE 754) simply',
        'Offers several safe comparison strategies',
        'Remembers that toFixed returns a string',
        'Distinguishes asserting displayed text vs computed numbers',
      ],
      modelAnswer: `**Why:** JavaScript numbers are 64-bit IEEE 754 floating-point values. Many decimal fractions (0.1, 0.2, 7.99) have no exact binary representation, the same way 1/3 has no exact decimal one. Each is stored as the nearest representable value, and adding them can expose the tiny error: \`0.1 + 0.2\` is \`0.30000000000000004\`; \`49.99 + 7.99\` is \`57.980000000000004\`.

**Safe strategies:**
1. **Integer cents:** \`Math.round(price * 100)\`; sum integers; compare with \`===\`. Most robust for money.
2. **Round for display comparison:** \`sum.toFixed(2) === '57.98'\`. Note \`toFixed\` returns a string, so compare to a string.
3. **Tolerance:** \`Math.abs(actual - expected) < 0.005\`. In Playwright: \`expect(sum).toBeCloseTo(57.98, 2)\`.

**What I actually assert in UI tests:** the page shows text, so I usually assert the text exactly: \`await expect(subtotal).toHaveText('Item total: $57.98')\`. I only compute numbers when I am verifying a calculation, for example that item prices add up to the subtotal, and then I compute in cents.

**Related gotchas:** \`Number('$57.98')\` is \`NaN\`, so strip currency symbols first; large integer IDs (beyond 2^53 − 1) lose precision, so keep them as strings.`,
      followUps: [
        {
          q: 'Is the floating-point issue a JavaScript bug?',
          a: 'No. It is how IEEE 754 binary floating point works, and Python, Java (double), C# (double) behave the same way: in Python `0.1 + 0.2` also prints 0.30000000000000004. Some languages offer decimal types (Java BigDecimal, C# decimal); in JavaScript you use integers (cents) or a decimal library.',
        },
        {
          q: 'What does (1.005).toFixed(2) return?',
          a: '"1.00", not "1.01", because 1.005 is actually stored as 1.00499999999999989... So toFixed is fine for formatting a result for display comparison, but rounding money for business logic should be done in integer cents (or with a library) to match what the backend does.',
        },
      ],
      pitfalls: [
        'Calling it a JavaScript bug.',
        'Comparing toFixed output to a number with ===.',
        'Using parseFloat on "$57.98" and not noticing NaN.',
      ],
    },
    {
      id: 'js-basics-iq-06',
      difficulty: 'easy',
      question: 'Write a function that takes an HTTP status code and returns "success", "redirect", "client error", "server error" or "invalid". How would you test it?',
      whatInterviewerLooksFor: [
        'Correct ranges with inclusive/exclusive boundaries',
        'Handles invalid input (non-number, out of range, non-integer)',
        'Applies boundary value analysis to their own code',
        'Readable structure (early returns or switch(true) avoided)',
      ],
      modelAnswer: `**Code (spoken line by line):**

- First guard bad input: \`if (!Number.isInteger(code) || code < 100 || code > 599) return 'invalid';\`
- Then ranges with early returns:
  - \`if (code < 200) return 'informational';\` (optional; the spec only listed four, so I would ask: for 1xx I would return \`'invalid'\` or add a category)
  - \`if (code < 300) return 'success';\`
  - \`if (code < 400) return 'redirect';\`
  - \`if (code < 500) return 'client error';\`
  - \`return 'server error';\`

Using ascending \`<\` checks with early returns means each branch only needs one comparison, and there are no gaps or overlaps.

**Testing it, like any feature under test (BVA on each boundary):**

| Input | Expected |
|---|---|
| 199, 200 | informational/invalid, success |
| 299, 300 | success, redirect |
| 399, 400 | redirect, client error |
| 499, 500 | client error, server error |
| 599, 600 | server error, invalid |
| '200' (string) | invalid (or decide to coerce: a requirement question!) |
| 200.5, NaN, undefined | invalid |

**Why the string case matters:** if the code came from \`response.status()\` in Playwright it is a number, but if it was parsed from a log line it is a string. I would clarify the contract instead of silently coercing with \`==\`. Showing that I test my own helpers with boundary values is exactly what separates an automation tester from someone who only writes scripts.`,
      followUps: [
        {
          q: 'Why not use switch for ranges?',
          a: 'switch compares with === against single values, so ranges need the `switch (true) { case code >= 200 && code < 300: ... }` trick, which is harder to read than if/else. switch shines for discrete values like environment names or HTTP method names. For ranges, ordered if statements with early return are clearer.',
        },
        {
          q: 'In Playwright API tests, is there a built-in for "2xx"?',
          a: 'Yes. `response.ok()` returns true for statuses 200-299, and the web-first `await expect(response).toBeOK()` asserts it with a helpful failure message. For exact checks you still assert `expect(response.status()).toBe(201)` because "some 2xx" can hide a 200 where the spec requires 201 Created.',
        },
      ],
      pitfalls: [
        'Off-by-one boundaries (using <= 300 for success).',
        'Not handling invalid input at all.',
        'Not offering any test cases for their own function.',
      ],
    },
    {
      id: 'js-basics-iq-07',
      difficulty: 'medium',
      question: 'Swap the values of two variables without using a third variable. Then predict: what do "5" + 3, "5" - 3 and true + true evaluate to?',
      context: 'A warm-up coding round often mixes a tiny coding task with output prediction to check JavaScript fundamentals.',
      whatInterviewerLooksFor: [
        'Knows destructuring swap',
        'Can explain the arithmetic swap and its limits',
        'Correctly predicts coercion results and explains why',
      ],
      modelAnswer: `**Swap (modern, readable):**

\`let a = 1, b = 2; [a, b] = [b, a];\` → \`a\` is 2, \`b\` is 1.

This is **array destructuring**: the right side builds a temporary array \`[2, 1]\`, the left side unpacks it into \`a\` and \`b\`. Works for any type (strings, objects).

**Arithmetic swap (the "classic" answer):**

\`a = a + b; b = a - b; a = a - b;\`

Works for numbers only, can lose precision with floats, and breaks with strings (\`+\` concatenates). I would mention it but prefer destructuring. (XOR swap \`a ^= b; b ^= a; a ^= b;\` works for 32-bit integers only.)

**Output prediction:**
- \`'5' + 3\` → \`'53'\`: if either operand of \`+\` is a string, it concatenates.
- \`'5' - 3\` → \`2\`: \`-\` is numeric only, so \`'5'\` is converted to 5.
- \`true + true\` → \`2\`: booleans convert to 1 and 0 for arithmetic.

**Why an automation interviewer asks this:** values read from the browser are strings, so \`+\` on them concatenates. Knowing which operators convert and which concatenate is the difference between a test that checks \`2 + 1 = 3\` items and one that checks \`'21'\`.`,
      followUps: [
        {
          q: 'Would the destructuring swap work if the previous line did not end with a semicolon?',
          a: 'It can break. If the previous line is `let b = 2` with no semicolon and the next line starts with `[a, b] = [b, a]`, JavaScript may join them as `2[a, b] = ...`, an index access. Lines starting with `[` or `(` are the main automatic-semicolon-insertion trap, which is why many teams keep semicolons or a formatter enforces them.',
        },
        {
          q: 'What do "5" * "2" and [] + {} produce?',
          a: '`"5" * "2"` is 10 because `*` converts both strings to numbers. `[] + {}` is the string "[object Object]": both are converted to primitives, the array becomes "" and the object becomes "[object Object]", and since a string is involved, + concatenates.',
        },
      ],
      pitfalls: [
        'Saying "5" + 3 is 8.',
        'Only knowing the arithmetic trick and not its string/float limitations.',
        'Not explaining why the coercion happens.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-basics-drill-1',
      question:
        'Predict the output of each line before running it: `console.log("3" + 4 + 5)`, `console.log(3 + 4 + "5")`, `console.log("10" - "4" + "2")`, `console.log(+"")`, `console.log(null + 1)`, `console.log(undefined + 1)`.',
      assumptions: [
        'Operators of equal precedence evaluate left to right.',
        '`+` concatenates if either operand is a string; `-` always converts to numbers.',
        'Unary `+` converts its operand to a number.',
      ],
      steps: [
        { label: '"3" + 4 + 5', calc: '"3" + 4 → "34" (string wins); "34" + 5 → "345"' },
        { label: '3 + 4 + "5"', calc: '3 + 4 → 7 (both numbers); 7 + "5" → "75"' },
        { label: '"10" - "4" + "2"', calc: '"10" - "4" → 6 (minus converts); 6 + "2" → "62"' },
        { label: '+""', calc: 'Number("") is 0 → 0' },
        { label: 'null + 1', calc: 'null converts to 0 → 1' },
        { label: 'undefined + 1', calc: 'undefined converts to NaN → NaN' },
      ],
      answer: '`345`, `75`, `62`, `0`, `1`, `NaN` (the first three are strings, which `console.log` prints without quotes).',
      insight:
        'Left-to-right evaluation plus the "+ prefers strings" rule explains most coercion puzzles. In test code, convert page text with Number() before doing any arithmetic.',
      followUps: [
        {
          q: 'How would you make "3" + 4 + 5 produce 12?',
          a: 'Convert explicitly first: `Number("3") + 4 + 5` or `+"3" + 4 + 5`. Explicit conversion at the point where text enters your code (right after reading it from the page or an API) keeps the rest of the logic numeric and predictable.',
        },
      ],
    },
    {
      id: 'js-basics-drill-2',
      question:
        'A config loader runs `const s = { retries: 0, baseURL: "", headless: "false", workers: null };` and then logs: `s.retries || 1`, `s.retries ?? 1`, `s.baseURL || "http://localhost"`, `s.baseURL ?? "http://localhost"`, `!!s.headless`, `s.workers ?? 4`, `s.trace?.mode ?? "off"`. Predict each value.',
      assumptions: [
        'Falsy: false, 0, -0, 0n, "", null, undefined, NaN.',
        '`??` falls back only for null/undefined.',
        '`?.` returns undefined when the left side is null/undefined.',
      ],
      steps: [
        { label: 's.retries || 1', calc: '0 is falsy → 1' },
        { label: 's.retries ?? 1', calc: '0 is not null/undefined → 0' },
        { label: 's.baseURL || "http://localhost"', calc: '"" is falsy → "http://localhost"' },
        { label: 's.baseURL ?? "http://localhost"', calc: '"" is not nullish → "" (empty string)' },
        { label: '!!s.headless', calc: '"false" is a non-empty string → truthy → true' },
        { label: 's.workers ?? 4', calc: 'null → 4' },
        { label: 's.trace?.mode ?? "off"', calc: 's.trace is undefined → ?. gives undefined → "off"' },
      ],
      answer: '`1`, `0`, `"http://localhost"`, `""`, `true`, `4`, `"off"`.',
      insight:
        'Pick the operator by asking "is this falsy value legitimate?" Zero retries is legitimate (use ??); an empty baseURL is probably not (|| or validation). String flags like "false" must be compared explicitly.',
      followUps: [
        {
          q: 'Which of these results would most likely cause a confusing test failure, and how?',
          a: '`s.baseURL ?? "http://localhost"` returning "" is the sneakiest: page.goto("/login") would then have no base URL and fail with an "invalid URL" style error far away from the config. Validating config at startup (throw if baseURL is empty) gives a clear message at the real cause.',
        },
      ],
    },
    {
      id: 'js-basics-drill-3',
      question:
        'Trace this snippet and give each logged value: `const qty = "2"; const price = 9.99; console.log(qty * price); console.log(qty + price); console.log(typeof (qty * price)); console.log((qty * price).toFixed(2) === "19.98"); console.log(Number("2 ") === 2, Number("2 items"));`',
      assumptions: [
        '`*` converts strings to numbers; `+` with a string concatenates.',
        '`toFixed` returns a string.',
        'Number() trims surrounding whitespace but rejects any other junk.',
      ],
      steps: [
        { label: 'qty * price', calc: '"2" → 2; 2 × 9.99 = 19.98 → 19.98' },
        { label: 'qty + price', calc: 'string + number → "2" + "9.99" → "29.99"' },
        { label: 'typeof (qty * price)', calc: 'result of * is a number → "number"' },
        { label: '(qty * price).toFixed(2) === "19.98"', calc: '19.98.toFixed(2) is the string "19.98" → true' },
        { label: 'Number("2 ") === 2', calc: 'whitespace is trimmed → 2 === 2 → true' },
        { label: 'Number("2 items")', calc: 'non-numeric characters → NaN' },
      ],
      answer: '`19.98`, `29.99` (a string), `"number"`, `true`, then `true NaN`.',
      insight:
        'The same two values give a correct total with * and a nonsense "price" with +. When a quantity comes from an input field it is a string: convert it before any arithmetic, and assert both the type and the value when debugging.',
      followUps: [
        {
          q: 'Why might qty + price be a realistic bug and not just a puzzle?',
          a: 'A "subtotal = qty + shipping" calculation in a test helper, with qty read via inputValue(), produces "25.99" instead of 7.99 for qty 2 and shipping 5.99. The assertion then compares against the page and fails, and the tester wrongly files an app bug. Converting with Number() at the boundary prevents it.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-basics-mcq-01',
      difficulty: 'easy',
      question: 'Which statement best describes the relationship between JavaScript, Node.js and Playwright?',
      options: [
        'Node.js is a runtime that executes JavaScript outside the browser, and Playwright is a library running in Node that controls browsers',
        'Playwright is a JavaScript engine that replaces Node.js when tests run in a browser',
        'Node.js is a browser, and Playwright tests run inside the page as JavaScript',
        'JavaScript is compiled into Node.js, which Playwright then converts into browser actions',
      ],
      correct: [0],
      explanation:
        'Node.js embeds the V8 engine plus OS APIs so JavaScript can run outside a browser; `npx playwright test` runs your test files in Node, and Playwright sends commands to real browsers. Playwright is not an engine, Node is not a browser, and tests do not run inside the page (only code you pass to page.evaluate does).',
      followUps: [
        {
          q: 'Where does code inside page.evaluate(() => document.title) run?',
          a: 'Inside the browser page, not in Node. The function is serialised and executed in the page context, so it cannot see your test variables unless you pass them as an argument. That separation of Node-side and page-side code is a common source of confusion for beginners.',
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
        'const prevents re-binding the variable `user` to a different value, but the object it points to can still be changed, so the property update succeeds and prints problem_user. The TypeError appears only for `user = {...}`. standard_user would require the object to be frozen.',
      followUps: [
        {
          q: 'How would you make the assignment fail or be ignored?',
          a: 'Object.freeze(user) makes top-level properties read-only: in non-strict code the assignment is silently ignored, in strict mode (ES modules, classes) it throws a TypeError. Freeze is shallow, so nested objects stay writable unless frozen too.',
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
        'The falsy values are false, 0, -0, 0n, "", null, undefined and NaN, so 0, NaN and "" are falsy. The string "0" is a non-empty string and therefore truthy, and an empty array is an object, and all objects are truthy, a classic trap when checking `if (items)`.',
      followUps: [
        {
          q: 'How should you check that an API returned at least one item?',
          a: 'Use `Array.isArray(items) && items.length > 0`, or in Playwright `expect(items.length).toBeGreaterThan(0)`. A bare `if (items)` passes for an empty array, so an endpoint that wrongly returns [] would look fine.',
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
        '`==` converts the string to a number before comparing, so it is true; `===` sees string vs number and returns false without converting; `Number(badge)` is the number 2, so the strict check is true. Option "true, true, true" assumes === converts like ==, which it never does.',
      followUps: [
        {
          q: 'Why is asserting the text "2" often better than converting to a number?',
          a: 'The user sees text. Asserting `toHaveText("2")` catches formatting defects like "02" or " 2" that Number() would hide, and Playwright\'s web-first assertion retries until the badge updates, avoiding a race with the click that added the item.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-05',
      difficulty: 'medium',
      question: 'Which line prints `0`?',
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
        'B: `??` keeps 0 because it is not null/undefined. C: `&&` returns its first operand when that operand is falsy, so it returns 0 without evaluating 3. A falls back to 3 because 0 is falsy, and D also yields 3 because !0 is true. Many beginners miss that && returns the operand itself, not false.',
      followUps: [
        {
          q: 'When is `&&` returning a non-boolean actually useful?',
          a: 'As a guard: `user && user.name` returns user.name only if user exists (today `user?.name` is cleaner). In React it is used for conditional rendering. In test code, prefer explicit booleans in assertions so a 0 or "" does not sneak through as a "result".',
        },
      ],
    },
    {
      id: 'js-basics-mcq-06',
      difficulty: 'medium',
      question: 'You verify that prices on a product list are sorted low-to-high. The prices are read as strings: ["9.99", "15.99", "7.99"]. A helper checks `prices[i] <= prices[i + 1]` for each pair. What happens?',
      options: [
        'It wrongly flags 9.99 → 15.99 as out of order, because two strings are compared character by character',
        'It works correctly because <= converts both strings to numbers',
        'It throws a TypeError because strings cannot be compared with <=',
        'It always returns true because non-empty strings are truthy',
      ],
      correct: [0],
      explanation:
        'When both operands are strings, relational operators compare them lexicographically by character code, so "9.99" <= "15.99" is false ("9" > "1"). The helper flags a correctly sorted pair as wrong (and could accept a wrong order elsewhere). Relational operators only convert to numbers when the types differ; they never throw on strings; truthiness is irrelevant here.',
      followUps: [
        {
          q: 'How do you fix the helper?',
          a: 'Convert first: `const nums = prices.map(Number)` (after stripping "$"), then compare numbers, or compare `nums` with a sorted copy: `[...nums].sort((a, b) => a - b)` and deep-equal them with toEqual. The default sort() is also lexicographic, so the comparator is required.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-07',
      difficulty: 'medium',
      question: 'Select ALL expressions that evaluate to `true`.',
      options: ['null == undefined', 'null == 0', 'null >= 0', 'NaN === NaN', "'' == 0"],
      correct: [0, 2, 4],
      explanation:
        'null == undefined is a special rule (true). null == 0 is false because == never converts null to a number, but relational operators do, so null >= 0 becomes 0 >= 0 (true). NaN is not equal to anything, including itself. "" == 0 is true because the empty string converts to 0.',
      followUps: [
        {
          q: 'How do you test for NaN reliably?',
          a: '`Number.isNaN(x)`, which is true only for the actual NaN value. The global `isNaN(x)` converts first, so isNaN("hello") is true. Object.is(x, NaN) also works, and Playwright\'s toBe uses Object.is, so expect(NaN).toBe(NaN) passes.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-08',
      difficulty: 'hard',
      question: 'A checkout helper compares a summed price three ways. What do the three logs print?',
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
        'Floating point makes the sum 57.980000000000004, so the first check is false. toFixed(2) returns the string "57.98", which is never === to the number 57.98, so the second is false; the third compares string to string and is true. Picking "false, true, true" assumes toFixed returns a number.',
      followUps: [
        {
          q: 'Give a money-safe way to sum prices.',
          a: 'Convert each price to integer cents with Math.round(price * 100), add the integers, and compare to expected cents. Integers below 2^53 are exact in JavaScript, so there is no drift. Format back with (cents / 100).toFixed(2) only for messages.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-09',
      difficulty: 'medium',
      question: 'Your config reads `const headless = process.env.HEADLESS || true;` and CI sets HEADLESS=false. What happens and why?',
      options: [
        'Tests run headless, because the env var is the string "false", which is truthy and is returned as-is',
        'Tests run headed, because || converts "false" to the boolean false',
        'Tests run headed, because environment variables are parsed as booleans by Node',
        'Node throws because a string cannot be used with ||',
      ],
      correct: [0],
      explanation:
        'Environment variables are always strings (or undefined). "false" is a non-empty string, so it is truthy and || returns it; any truthiness check on it then means "headless". Node never parses env vars into booleans, and || works on any types. Compare explicitly: process.env.HEADLESS !== "false".',
      followUps: [
        {
          q: 'How does Playwright usually decide headed vs headless?',
          a: 'Headless is the default; you run headed with the --headed CLI flag or `use: { headless: false }` in playwright.config. Teams often key behaviour off `!!process.env.CI` (CI sets CI=true), e.g. retries: process.env.CI ? 2 : 0.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-10',
      difficulty: 'hard',
      question: 'An environment-name switch is called with the string "1" and then the number 1. What gets logged?',
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
        'switch compares with ===, so the string "1" matches no case and runs default (local). For the number 1, case 1 matches and, with no break, execution falls through into case 2, printing qa then staging. Options that print qa for "1" assume loose comparison; "local, then qa" ignores fall-through.',
      followUps: [
        {
          q: 'How would you catch this class of bug automatically?',
          a: 'Linters: ESLint\'s no-fallthrough rule flags a case that falls through without a comment, and TypeScript\'s noFallthroughCasesInSwitch option makes it a compile error. For the type mismatch, TypeScript would flag passing a string where a number is expected.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-11',
      difficulty: 'medium',
      question: 'Which template literal correctly builds a unique email such as `qa_1700000000000@test.com` from `const id = Date.now()`?',
      options: [
        '`qa_${id}@test.com` (with backticks)',
        "'qa_${id}@test.com' (with single quotes)",
        '"qa_" + ${id} + "@test.com"',
        '`qa_$(id)@test.com` (with backticks)',
      ],
      correct: [0],
      explanation:
        'Interpolation needs backticks and the ${ } syntax. Inside single or double quotes, ${id} is just literal text, so you would get "qa_${id}@test.com". ${} outside a template literal is a syntax error, and $(id) is shell syntax, not JavaScript.',
      followUps: [
        {
          q: 'Is Date.now() unique enough for parallel Playwright workers?',
          a: 'Not guaranteed: two workers can create data in the same millisecond. Add the worker index (testInfo.workerIndex) or a random suffix, or use crypto.randomUUID(). Collisions cause flaky "email already registered" failures that only appear in parallel runs.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-12',
      difficulty: 'hard',
      question: 'Select ALL statements about `typeof` that are correct.',
      options: [
        'typeof null returns "object"',
        'typeof [] returns "array"',
        'typeof NaN returns "number"',
        'typeof a function returns "function"',
        'typeof undeclaredVariable throws a ReferenceError',
      ],
      correct: [0, 2, 3],
      explanation:
        'typeof null is "object" (historic bug), typeof NaN is "number", and functions report "function". Arrays report "object", so use Array.isArray. typeof on an undeclared variable safely returns "undefined" instead of throwing (although typeof on a let variable in its temporal dead zone does throw).',
      followUps: [
        {
          q: 'Why is typeof safe on undeclared variables useful?',
          a: 'It lets code feature-detect globals that may not exist in an environment, such as `typeof window !== "undefined"` to tell browser from Node. Accessing `window` directly in Node would throw a ReferenceError.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-13',
      difficulty: 'hard',
      question: 'An API returns `{ "order": { "customer": null } }`. Which expression returns "N/A" without throwing when the customer is null?',
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
        'B short-circuits at customer?. and returns undefined, then ?? supplies "N/A". A, C and D all read .email from null and throw a TypeError: in C the ?. guards order (which exists), and in D it guards body. Optional chaining only protects the link immediately to its left, so it must sit right after the value that can be null.',
      followUps: [
        {
          q: 'When is optional chaining hiding a real defect?',
          a: 'If the contract says customer is required, `customer?.email` makes the test quietly continue with undefined. In assertions, check structure explicitly (expect(body.order.customer).not.toBeNull() or schema validation) and reserve ?. for genuinely optional data.',
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
        'Number() rejects any non-numeric character, so "$29.99" is NaN (A). parseFloat reads a leading number and stops at junk, so B is 29.99. Number("") is 0, not NaN (C). undefined converts to NaN in arithmetic (D). parseInt needs the string to start with a digit, so "px42" is NaN (E).',
      followUps: [
        {
          q: 'Why is Number("") === 0 dangerous in UI tests?',
          a: 'If a price element is empty because the app failed to render it, Number(text) silently becomes 0 and a "total is non-negative" or "free item" check could pass. Check that the text is non-empty (or use a regex match) before converting, so missing data fails loudly.',
        },
      ],
    },
    {
      id: 'js-basics-mcq-15',
      difficulty: 'expert',
      question: 'Select ALL true statements about debugging this failure: `TypeError: Cannot read properties of undefined (reading \'email\')` at line 12 of user.helper.js.',
      options: [
        'The expression immediately before `.email` evaluated to undefined',
        'The property email exists but its value is undefined',
        'Logging the object one level up (e.g. `console.log({ user })`) is a good first step',
        'The bug is always at line 12, never in the code that produced the object',
      ],
      correct: [0, 2],
      explanation:
        'The message means JavaScript tried to read `email` from undefined, so the thing before `.email` was undefined, and logging it (plus where it came from) is the right first move. If email existed with value undefined, reading it would not throw. Line 12 is where it crashed, but the cause is often earlier, e.g. an API returning a different shape or a function missing a return.',
      followUps: [
        {
          q: 'What tools help beyond console.log in Node?',
          a: 'Put a `debugger;` statement in and run `node --inspect-brk file.js`, then attach Chrome DevTools or the VS Code debugger to step through and inspect variables. For Playwright tests specifically, `npx playwright test --debug` and the trace viewer show each action and its state.',
        },
      ],
    },
  ],
};

export default topic;
