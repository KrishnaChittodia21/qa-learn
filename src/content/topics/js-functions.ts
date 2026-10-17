import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-functions',
  phase: 'javascript',
  order: 2,
  title: 'Functions, Scope and Closures',
  subtitle:
    'How to write and use functions: arrows, parameters, return, scope, hoisting, closures, callbacks, `this`, pure functions and recursion. All tied to writing reusable test helpers.',
  estimatedMinutes: 100,
  sources: [
    'javascript.info: Functions, Function expressions, Arrow functions basics, Variable scope and closure, The old "var", Object methods and "this", Recursion and stack, Rest parameters',
    'MDN Web Docs: Functions guide, Closures, Hoisting, Temporal dead zone, this, Arrow function expressions, Default parameters',
    "Kyle Simpson: You Don't Know JS Yet: Scope & Closures (lexical scope, hoisting, closure) and the 'this' discussion in Objects & Classes",
    'Marijn Haverbeke: Eloquent JavaScript (4th ed), Ch 3 Functions (scopes, closure, recursion, side effects) and Ch 5 Higher-Order Functions',
    'GeeksforGeeks: JavaScript Interview Questions (hoisting, closures, this in arrow vs regular functions)',
    'OpenReplay blog: 10 JavaScript interview questions that test real understanding (hoisting/TDZ, closures)',
  ],
  tags: ['javascript', 'functions', 'arrow-functions', 'scope', 'hoisting', 'tdz', 'closures', 'callbacks', 'higher-order-functions', 'this', 'pure-functions', 'recursion'],
  cheatSheet: [
    'A declaration `function f() {}` can be called before its line. An arrow or expression saved in `const` cannot: it throws until its line runs. With `var` it is `undefined`, so calling it gives "is not a function".',
    'An arrow with `{ }` needs `return`. `x => x * 2` returns by itself. Return an object as `() => ({ id: 1 })`.',
    'Missing arguments are `undefined`. Extra ones are ignored. Defaults are used only for `undefined`, not `null`. `...rest` collects the extras into an array.',
    'A function without `return` gives `undefined`. Never put the value on the line after `return`.',
    'Scope means where a variable is visible. A function sees the variables where it was WRITTEN, not where it is called. let/const live in their `{ }` block; var lives in the whole function.',
    'Hoisting: JavaScript reads declarations first. TDZ (Temporal Dead Zone): a let/const exists from the start of its block, but using it before its line throws a ReferenceError.',
    'Closure: a function remembers the variables around it, even after the outer function has finished. Each outer call makes a fresh, private set (counters, unique IDs, cached setup).',
    '`for (var i...)` with callbacks: they all see the final i. `for (let i...)`: each loop round gets its own i.',
    'A callback is a function you pass to another function. A higher-order function takes or returns a function (map, filter, test(), retry helpers).',
    '`this` in a regular function depends on HOW it is called: in `obj.method()`, `this` is obj. Arrows have no own `this`; they use the outer one. A method passed around on its own loses `this` → TypeError.',
    'Pure function: same input → same output, and it changes nothing outside. Keep data builders and parsers pure.',
    'Recursion (a function calling itself) needs a base case (a stop rule). Without one you get `RangeError: Maximum call stack size exceeded`.',
  ],
  sections: [
    {
      heading: 'What a function is: a reusable test step',
      body: `**Example:**

- \`function greet(name) { return 'Hello, ' + name; }\`
- \`greet('tester')\` gives \`'Hello, tester'\`.

A **function** is a reusable step. You write it once and run it many times. In manual testing you write "Login as standard_user" once and reuse it in 40 test cases. In code, that reusable step is a function.

**The parts of a function**

- **Name:** what the step does (\`loginAs\`, \`buildUser\`, \`toCents\`).
- **Parameters:** the input names in the definition (\`username\`, \`password\`).
- **Arguments:** the real values you pass in when you call it (\`'standard_user'\`).
- **Body:** the code inside \`{ }\` that runs.
- **Return value:** the answer the function gives back. With no \`return\`, the answer is \`undefined\`.

Writing a function does not run it. **Calling** it with \`name(...)\` runs it.

**Watch out:** if you forget the \`()\`, you get the function itself, not its answer. \`console.log(getTitle)\` prints \`[Function: getTitle]\`.

**In an interview, say:** "I move repeated steps into small functions with clear inputs and outputs. If the login flow changes, I fix it in one place, not in 40 tests."

**Why testers care:** every Playwright test is a function you pass to \`test('name', async ({ page }) => { ... })\`. Page Object methods, fixtures and hooks are functions too.`,
      code: [
        {
          language: 'javascript',
          title: 'A first helper: build a login payload',
          code: `function buildLogin(username, password) {
  // parameters behave like local variables inside the body
  return { username, password, submittedAt: 'now' };
}

const payload = buildLogin('standard_user', 'secret_sauce'); // arguments
console.log(payload.username); // → standard_user

// Forgetting () gives you the function, not the result
console.log(typeof buildLogin);    // → function
console.log(typeof buildLogin('a', 'b')); // → object

// No return statement → the call gives back undefined
function logStep(step) {
  console.log(\`STEP: \${step}\`);
}
const result = logStep('open login page'); // → STEP: open login page
console.log(result); // → undefined`,
        },
      ],
      keyPoints: [
        'Parameters are the names in the definition. Arguments are the values you pass in.',
        'No `return` means the call gives back `undefined`.',
        'Every Playwright test body, hook, fixture and Page Object method is a function.',
      ],
      source: 'javascript.info: Functions; Marijn Haverbeke: Eloquent JavaScript, Ch 3',
    },
    {
      heading: 'Declarations vs expressions vs arrow functions',
      body: `**Example:** the same function, written three ways.

- Declaration: \`function double(n) { return n * 2; }\`
- Expression: \`const double = function (n) { return n * 2; };\`
- Arrow: \`const double = (n) => n * 2;\`

All three give \`8\` for \`double(4)\`.

| Form | Call it before its line? | Own \`this\`? | Typical use in tests |
|---|---|---|---|
| Declaration | Yes | Yes | Top-level helpers |
| Function expression | No | Yes | Rare today |
| Arrow function | No | **No**, it borrows the outer one | Callbacks, test bodies, short helpers |

(\`this\` is explained later in this topic.)

**Arrow shortcuts**

- One parameter: the brackets are optional: \`n => n * 2\`.
- No \`{ }\`: the value is returned automatically: \`n => n * 2\`.
- With \`{ }\`: you must write \`return\`: \`n => { return n * 2; }\`.
- To return an object, wrap it in brackets: \`() => ({ id: 1 })\`. Without them, JavaScript reads \`{ }\` as the function body.

**Arrows are not just shorter.** They have no own \`this\`, and you cannot use them with \`new\`. So they are great as callbacks inside methods. But they are wrong as object methods that need \`this\`.

**In Playwright:** \`test('adds item', async ({ page }) => { ... })\`. The test body is an async arrow function. \`{ page }\` picks the \`page\` fixture out of the object that Playwright passes in.

**Why testers care:** an arrow with \`{ }\` but no \`return\` gives \`undefined\`. This bug is very common in helper code.`,
      code: [
        {
          language: 'javascript',
          title: 'The same helper three ways',
          code: `function double1(n) {           // declaration
  return n * 2;
}
const double2 = function (n) {  // function expression
  return n * 2;
};
const double3 = (n) => n * 2;   // arrow, implicit return

console.log(double1(4), double2(4), double3(4)); // → 8 8 8

// Block-body arrow without return: classic bug
const doubleBroken = (n) => { n * 2; };
console.log(doubleBroken(4)); // → undefined

// Returning an object literal from an arrow
const makeUserWrong = (name) => { name: name };   // { } is read as a function body, not an object
const makeUser = (name) => ({ name });            // parentheses = object
console.log(makeUserWrong('qa'));  // → undefined
console.log(makeUser('qa'));       // → { name: 'qa' }

// Functions are values: store, pass, return
const steps = [double1, double3];
console.log(steps.length, typeof steps[0]); // → 2 function`,
        },
      ],
      keyPoints: [
        'Declarations can be called before their line. Expressions and arrows cannot.',
        'An arrow with `{ }` needs `return`. An arrow that returns an object needs `({ })`.',
        'Arrows have no own `this`: great for callbacks, bad for object methods.',
      ],
      source: 'javascript.info: Function expressions, Arrow functions basics; MDN: Arrow function expressions',
    },
    {
      heading: 'Parameters: defaults, rest and missing arguments',
      body: `**Example:**

\`function wait(timeout = 5000) { return timeout; }\`

- \`wait()\` gives \`5000\` (the default).
- \`wait(1000)\` gives \`1000\`.
- \`wait(null)\` gives \`null\`. The default is *not* used!

Parameters are the input fields of your helper. JavaScript does not complain if you pass too few or too many values. So you must plan for both.

**Rules**

- **Missing argument:** the parameter is \`undefined\`.
- **Extra arguments:** they are ignored.
- **Default values** like \`(timeout = 5000)\` are used only when the value is \`undefined\`. They are *not* used for \`null\`, \`0\` or \`''\`. A default can use an earlier parameter: \`(a, b = a * 2)\`.
- **Rest parameter** \`(...names)\` collects all the extra values into a real array. It must come last.
- **Options object:** for more than two or three inputs, take one object instead. Example: \`function createBooking({ firstname, lastname, totalprice = 100 })\`. Callers name each value, so the order does not matter. Playwright uses this style everywhere: \`{ name: 'Login', exact: true }\`.

**Watch out:** \`retries = retries || 2\` inside the body replaces a real \`0\`. Use a default parameter or \`??\` instead.

**Why testers care:** options objects make helpers easy to read. \`createBooking({ lastname: 'Brown' })\` says exactly what it sets.`,
      code: [
        {
          language: 'javascript',
          title: 'Defaults, rest and options objects',
          code: `function waitSettings(timeout = 5000, interval = timeout / 10) {
  return { timeout, interval };
}
console.log(waitSettings());          // → { timeout: 5000, interval: 500 }
console.log(waitSettings(undefined, 50)); // → { timeout: 5000, interval: 50 }
console.log(waitSettings(null));      // → { timeout: null, interval: 0 }  (null does NOT trigger default)

function tagTest(title, ...tags) {    // rest collects the extras
  return \`\${title} [\${tags.join(', ')}]\`;
}
console.log(tagTest('checkout works', '@smoke', '@cart')); // → checkout works [@smoke, @cart]
console.log(tagTest('login'));        // → login []

// Options object with defaults (named arguments)
function createBooking({ firstname, lastname, totalprice = 100, depositpaid = true }) {
  return { firstname, lastname, totalprice, depositpaid };
}
console.log(createBooking({ lastname: 'Brown', firstname: 'Jim' }));
// → { firstname: 'Jim', lastname: 'Brown', totalprice: 100, depositpaid: true }

// Too few / too many arguments are allowed
function pair(a, b) { return [a, b]; }
console.log(pair(1));       // → [ 1, undefined ]
console.log(pair(1, 2, 3)); // → [ 1, 2 ]`,
        },
      ],
      keyPoints: [
        'Defaults are used only for `undefined`.',
        'A rest parameter is a real array and must come last.',
        'Use an options object for 3 or more inputs, like Playwright does.',
      ],
      source: 'javascript.info: Functions (default values), Rest parameters and spread syntax; MDN: Default parameters',
    },
    {
      heading: 'Return values and early returns',
      body: `**Example:**

- \`function add(a, b) { return a + b; }\`
- \`add(2, 3)\` gives \`5\`.

\`return\` hands back the answer and leaves the function at once. Nothing after it runs.

**Rules**

- \`return value;\` ends the function. The call gives back \`value\`.
- \`return;\`, or no \`return\` at all, gives back \`undefined\`.
- **Early return** (also called a *guard clause*): check the bad cases first and leave. This keeps helpers flat and easy to read.
- A function gives back **one** value. To give back several, return an object (\`{ status, body }\`) or an array.

**Watch out:** never break the line right after \`return\`. JavaScript adds a hidden semicolon there. So \`return\` on one line and \`{ ok: true }\` on the next gives \`undefined\`.

**Why testers care:** a helper that "checks" something should *return* a result or throw an error. A \`console.log\` of a mismatch does not fail a test. A returned \`false\` that you assert on, or a thrown error, does.`,
      code: [
        {
          language: 'javascript',
          title: 'Guard clauses and the return trap',
          code: `function parsePrice(text) {
  if (typeof text !== 'string') return null;        // guard 1
  const cleaned = text.replace('$', '').trim();
  if (cleaned === '') return null;                   // guard 2
  const value = Number(cleaned);
  return Number.isNaN(value) ? null : value;         // single happy path
}
console.log(parsePrice('$29.99')); // → 29.99
console.log(parsePrice('  '));     // → null
console.log(parsePrice(42));       // → null

// Trap: a new line right after return ends the statement
function statusBroken() {
  return
  { ok: true };
}
console.log(statusBroken()); // → undefined

// Returning several values as an object
function summarise(results) {
  const passed = results.filter((r) => r === 'pass').length;
  return { passed, failed: results.length - passed };
}
const { passed, failed } = summarise(['pass', 'fail', 'pass']);
console.log(passed, failed); // → 2 1`,
        },
      ],
      keyPoints: [
        'Use early returns to reject bad input first.',
        'Never break the line right after `return`.',
        'Checks should return a value or throw. Logging does not fail a test.',
      ],
      source: 'javascript.info: Functions (returning a value); Marijn Haverbeke: Eloquent JavaScript, Ch 3',
    },
    {
      heading: 'Scope: global, function and block',
      body: `**Example:**

- \`function login() { const user = 'qa'; }\`
- \`console.log(user);\` outside the function throws \`ReferenceError: user is not defined\`.

\`user\` lives inside the function. Code outside cannot see it.

**Scope** means "where a variable is visible". Think of rooms in a building. From inside a room you can see the corridor and the lobby (the outer scopes). People in the lobby cannot see into your room.

**Three kinds of scope**

- **Global:** declared outside every function and block. It is visible everywhere in that file. Keep it small: shared global values make tests depend on each other.
- **Function scope:** parameters and variables declared inside a function (including \`var\`).
- **Block scope:** \`let\` and \`const\` inside the \`{ }\` of an \`if\`, a \`for\` or a plain block.

**Where you write it decides what it sees.** A function sees the variables around the place where it is *written*, not where it is *called*. This is called **lexical scope** ("lexical" means "based on where the code is written"). To find a name, JavaScript looks in the current scope first. Then it looks one level out, and so on, up to global.

**Shadowing:** an inner variable with the same name hides the outer one. It is allowed, but confusing. Example: a \`const page\` inside a helper hides the \`page\` fixture.

**Why testers care:** a variable inside one Playwright \`test()\` is invisible to other tests. That is good, because tests should not share state. Shared data belongs in a fixture or a factory function, not in a top-level \`let\` that tests change.`,
      code: [
        {
          language: 'javascript',
          title: 'Lexical scope and shadowing',
          code: `const env = 'qa';                   // global (module) scope

function buildUrl(path) {
  const host = \`https://\${env}.example.com\`; // sees outer env
  if (path.startsWith('/')) {
    const full = host + path;              // block scoped to the if
    return full;
  }
  return host + '/' + path;
}
console.log(buildUrl('/login')); // → https://qa.example.com/login

function shadow() {
  const env = 'prod';             // shadows the outer env
  return env;
}
console.log(shadow(), env);       // → prod qa

// Lexical: decided where the function is WRITTEN
const label = 'outer';
function readLabel() { return label; }
function caller() {
  const label = 'inner';          // not visible to readLabel
  return readLabel();
}
console.log(caller()); // → outer`,
        },
      ],
      diagram: `  global scope:  env = 'qa', label = 'outer'
  +----------------------------------------------+
  | buildUrl(path): host                         |
  |   +--------------------------------------+   |
  |   | if-block: full                       |   |
  |   +--------------------------------------+   |
  +----------------------------------------------+
  lookup goes INSIDE -> OUTSIDE, never the other way`,
      keyPoints: [
        'JavaScript looks for a name from the inside out. Outer code cannot see inner variables.',
        'A function sees what is around the place where it is written (lexical scope).',
        'Do not share changeable global variables between tests.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Scope & Closures, Ch 1-3; javascript.info: Variable scope, closure",
    },
    {
      heading: 'Hoisting and the temporal dead zone',
      body: `**Example:**

- \`console.log(a); var a = 1;\` prints \`undefined\`.
- \`console.log(b); let b = 2;\` throws a \`ReferenceError\`.

Both lines use a variable before its declaration. Yet they behave differently. Why?

**Hoisting:** JavaScript reads your declarations first, before running the code. It is like a teacher taking the register before class. Every name is known from the start. But what it holds at the start depends on how it was declared.

| Declaration | Value before its line | Using it early gives |
|---|---|---|
| \`function f() {}\` | The whole function | Works fine |
| \`var x = 1\` | \`undefined\` | Quietly \`undefined\` |
| \`let\` / \`const\` / \`class\` | No value yet (TDZ) | \`ReferenceError: Cannot access 'x' before initialization\` |
| \`var f = function () {}\` | \`undefined\` | \`TypeError: f is not a function\` |
| \`const f = () => {}\` | No value yet (TDZ) | \`ReferenceError\` |

**Temporal Dead Zone (TDZ):** the time between the start of a block and the line where a \`let\` or \`const\` is declared. Using the variable in that gap throws an error.

"Temporal" means it is about *time*: when the code runs, not where it is written. A function written above a \`const\` can use it safely. You just have to *call* the function after the \`const\` line has run.

**Simple rules:** declare things before you use them. Function declarations can go anywhere. Never rely on \`var\` hoisting.

**In an interview, say:** "Hoisting means JavaScript reads declarations before it runs the code. Function declarations work everywhere. var starts as undefined. let and const are hoisted too, but they stay in the TDZ, so early use throws an error instead of giving undefined."

**Why testers care:** if you use \`expectedTotal\` before you set it, \`const\` fails at once with a clear error. \`var\` would quietly compare against \`undefined\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Hoisting in action',
          code: `console.log(typeof setupData); // → function (declaration hoisted whole)
console.log(retries);          // → undefined (var hoisted, not its value)
var retries = 2;

try {
  console.log(baseUrl);        // TDZ
} catch (e) {
  console.log(e.name);         // → ReferenceError
}
const baseUrl = 'https://www.saucedemo.com';

try {
  login();                     // var holds undefined at this point
} catch (e) {
  console.log(e.message);      // → login is not a function
}
var login = function () { return 'logged in'; };

function setupData() { return { user: 'standard_user' }; }

// TDZ is about time: this function is defined first but CALLED later
function readTimeout() { return timeout; }
const timeout = 30000;
console.log(readTimeout());    // → 30000 (called after the const line ran)`,
        },
      ],
      keyPoints: [
        'Function declarations work even before their line.',
        '`var` starts as undefined. `let`/`const` are in the TDZ, so early use throws a ReferenceError.',
        'The TDZ is about when code runs, not only about line order.',
      ],
      source: 'MDN: Hoisting, Temporal dead zone; javascript.info: The old "var"; OpenReplay: 10 JS interview questions',
    },
    {
      heading: 'Closures: functions that remember',
      body: `**Example:**

- \`function makeCounter() { let count = 0; return () => ++count; }\`
- \`const next = makeCounter();\`
- \`next()\` gives 1. Calling \`next()\` again gives 2.

\`makeCounter\` has already finished. But the inner arrow still remembers \`count\`.

**Closure:** a function remembers the variables around it, even after the outer function has finished. Think of a backpack. When a function is made inside another function, it packs the nearby variables into its backpack. It keeps them for as long as it lives.

**Three facts**

1. The function keeps the **live variable**, not a copy. If the variable changes, the function sees the new value.
2. **Each call** of the outer function makes a **new** backpack. Two counters from the same factory do not share a count.
3. Variables in the backpack are **private**. Only the returned function can read or change them.

**How testers use closures**

- **Unique data:** \`const nextEmail = makeEmailFactory('checkout')\` gives \`checkout_1@test.com\`, then \`checkout_2@test.com\`, and so on.
- **Run-once setup:** get a token once, then return the saved value after that. Playwright's worker fixtures use the same idea.
- **Ready-made checks:** \`const inRange = between(10, 20)\` gives a function that checks prices.
- **Every test body:** the function you pass to \`test()\` can use variables declared above it, like test data.

**The loop puzzle:** in \`for (var i...)\` there is only one \`i\`. All callbacks share it and see its last value. In \`for (let i...)\`, each loop round gets its own \`i\`, so each callback remembers its own value.

**In an interview, say:** "A closure is a function that remembers the variables from where it was created. I use closures for unique test data and run-once setup."

**Why testers care:** a closure keeps a counter private, so one test cannot reset another test's data by accident.`,
      code: [
        {
          language: 'javascript',
          title: 'Closures for test data and run-once setup',
          code: `function makeEmailFactory(prefix) {
  let count = 0;                       // private: lives in the closure
  return () => {
    count += 1;
    return \`\${prefix}_\${count}@test.com\`;
  };
}
const checkoutEmail = makeEmailFactory('checkout');
const loginEmail = makeEmailFactory('login');
console.log(checkoutEmail()); // → checkout_1@test.com
console.log(checkoutEmail()); // → checkout_2@test.com
console.log(loginEmail());    // → login_1@test.com  (independent counter)

// Run expensive setup once, then reuse the cached value
function once(fn) {
  let done = false, value;
  return (...args) => {
    if (!done) { value = fn(...args); done = true; }
    return value;
  };
}
let tokenCalls = 0;
const getToken = once(() => { tokenCalls++; return 'tok-123'; });
console.log(getToken(), getToken(), tokenCalls); // → tok-123 tok-123 1

// var vs let in a loop with callbacks
const viaVar = [], viaLet = [];
for (var i = 0; i < 3; i++) viaVar.push(() => i);
for (let j = 0; j < 3; j++) viaLet.push(() => j);
console.log(viaVar.map((f) => f())); // → [ 3, 3, 3 ]
console.log(viaLet.map((f) => f())); // → [ 0, 1, 2 ]`,
        },
      ],
      diagram: `  makeEmailFactory('checkout')        makeEmailFactory('login')
  +------------------------+           +------------------------+
  | env A: prefix=checkout |           | env B: prefix=login    |
  |        count=2         |           |        count=1         |
  +-----------^------------+           +-----------^------------+
              |                                    |
       checkoutEmail()                        loginEmail()
   (arrow keeps a link to env A)        (arrow keeps a link to env B)`,
      keyPoints: [
        'Closure: a function plus the variables around it, kept alive after the outer call ends.',
        'Each factory call makes a separate, private set of variables.',
        'Closures see the live variable, not a copy of its value.',
        'Use `let` in loops that create callbacks.',
      ],
      source: "javascript.info: Variable scope, closure; MDN: Closures; Kyle Simpson: You Don't Know JS Yet: Scope & Closures, Ch 7",
    },
    {
      heading: 'Callbacks and higher-order functions',
      body: `**Example:**

\`[1, 2, 3].map(n => n * 2)\` gives \`[2, 4, 6]\`.

You hand \`map\` a small function: \`n => n * 2\`. Then \`map\` calls it once for each item.

**Callback:** a function you pass to another function, so that function can call it later. Think of a note that says "when you are done, do this".

**Higher-order function:** a function that takes a function as input, or gives one back. \`map\` is one. Interviewers often call it a "HOF".

**You already use them**

- \`setTimeout(fn, 1000)\`: runs \`fn\` after one second.
- \`page.on('dialog', handler)\`: runs \`handler\` when a dialog opens.
- \`test('title', async ({ page }) => {...})\`: \`test\` is the higher-order function. Your test body is the callback.

**Write your own** to remove repeated code in test helpers:

- \`withStep(name, fn)\`: logs before and after any action.
- \`retry(fn, attempts)\`: calls \`fn\` again until it stops throwing.
- \`between(min, max)\`: gives back a check function that answers true or false.

**Watch out:** pass the function, not its result. \`retry(login(), 3)\` runs \`login\` right away, only once. Write \`retry(login, 3)\` or \`retry(() => login(), 3)\`.

(Array helpers like map, filter and reduce have their own topic. Async callbacks come with promises.)

**Why testers care:** Playwright is full of callbacks. Every \`test()\`, \`page.on()\` and \`test.step()\` takes a function from you.`,
      code: [
        {
          language: 'javascript',
          title: 'Writing small HOFs for test helpers',
          code: `// Takes a function: wraps any step with logging
function withStep(name, fn) {
  console.log(\`▶ \${name}\`);
  const result = fn();
  console.log(\`✔ \${name}\`);
  return result;
}
const total = withStep('sum cart', () => 29.99 + 9.99);
// → ▶ sum cart
// → ✔ sum cart
console.log(total); // → 39.98

// Takes a function: retry a flaky synchronous check
function retry(fn, attempts) {
  for (let n = 1; n <= attempts; n++) {
    try { return fn(n); }
    catch (e) { console.log(\`attempt \${n} failed: \${e.message}\`); }
  }
  throw new Error(\`gave up after \${attempts} attempts\`);
}
const value = retry((n) => { if (n < 3) throw new Error('not ready'); return 'ready'; }, 5);
// → attempt 1 failed: not ready
// → attempt 2 failed: not ready
console.log(value); // → ready

// Returns a function: a reusable predicate
const between = (min, max) => (price) => price >= min && price <= max;
const isMidRange = between(10, 30);
console.log([7.99, 15.99, 29.99, 49.99].filter(isMidRange)); // → [ 15.99, 29.99 ]`,
        },
      ],
      keyPoints: [
        'Pass the function (`fn`), not its result (`fn()`).',
        '`test()`, `map()`, `setTimeout()` and `page.on()` are all higher-order functions.',
        'Your own higher-order functions remove repeated code: logging, retrying, checks.',
      ],
      source: 'Marijn Haverbeke: Eloquent JavaScript, Ch 5 Higher-Order Functions; MDN: Callback function',
    },
    {
      heading: '`this` basics: method calls, arrows and lost this',
      body: `**Example:**

- \`const cart = { items: 2, count() { return this.items; } };\`
- \`cart.count()\` gives \`2\`. Here \`this\` is \`cart\`, the object before the dot.

**\`this\`** is like the word "me" in a sentence. Who "me" means depends on who is speaking. For a regular function, \`this\` depends on **how the function is called**, not where it is written. Arrow functions are different. They have no "me" of their own. They use the \`this\` of the code around them.

**What \`this\` is, by call style**

| Call style | \`this\` is |
|---|---|
| \`obj.method()\` | \`obj\` (the thing before the dot) |
| \`const f = obj.method; f()\` | \`undefined\` in strict mode (classes, ES modules); the global object in old scripts |
| \`new LoginPage()\` | The new object |
| \`fn.call(x)\` / \`fn.bind(x)\` | \`x\` |
| Arrow function | Whatever \`this\` was where the arrow was **written** |

(*Strict mode* is a safer set of rules. Classes and modules always use it.)

**Two classic bugs in Page Objects.** Page Objects are classes, and their methods use \`this.page\`.

1. **Passing a method on its own:** \`retry(loginPage.submit, 3)\`. The method loses its object, so \`this\` is undefined. You get \`TypeError: Cannot read properties of undefined\`. Fix: \`retry(() => loginPage.submit(), 3)\`, or use \`.bind(loginPage)\`.
2. **A regular function inside a method:** \`items.forEach(function () { this.count++ })\`. The inner function gets its own \`this\`. Fix: use an arrow, which keeps the method's \`this\`.

**The other way round:** do *not* write object methods as arrows, like \`open: () => this.url\`. The arrow takes \`this\` from outside the object.

**Why testers care:** "Cannot read properties of undefined (reading 'page')" in a Page Object almost always means a method lost its \`this\`.`,
      code: [
        {
          language: 'javascript',
          title: 'this in a Page-Object-like class',
          code: `class CartPage {
  constructor() {
    this.items = ['Backpack', 'Bike Light'];
    this.checked = 0;
  }
  count() { return this.items.length; }
  verifyAll() {
    // arrow callback keeps the method's this
    this.items.forEach(() => { this.checked++; });
    return this.checked;
  }
}
const cart = new CartPage();
console.log(cart.count());     // → 2   (this = cart)
console.log(cart.verifyAll()); // → 2

// Detaching the method loses this
const detached = cart.count;
try {
  detached();
} catch (e) {
  console.log(e.message); // → Cannot read properties of undefined (reading 'items')
}

// Three fixes
console.log((() => cart.count())()); // → 2  wrap in an arrow
console.log(cart.count.bind(cart)()); // → 2  bind
console.log(cart.count.call(cart));   // → 2  call with explicit this

// Arrow vs regular method on an object literal created inside a method
const suite = {
  name: 'checkout suite',
  build() {
    return { name: 'cart page', regular() { return this.name; }, arrow: () => this.name };
  },
};
const page = suite.build();
console.log(page.regular(), '|', page.arrow()); // → cart page | checkout suite`,
        },
      ],
      keyPoints: [
        'Regular functions: `this` is the object before the dot, at call time.',
        'Arrows: use the `this` from where they are written.',
        'Passing `obj.method` on its own loses `this`. Wrap it in an arrow or use bind.',
      ],
      source: "javascript.info: Object methods, \"this\"; MDN: this; Kyle Simpson: You Don't Know JS Yet: Objects & Classes (this)",
    },
    {
      heading: 'Pure functions and side effects',
      body: `**Example:**

- \`const total = (price, qty) => price * qty;\` is **pure**. \`total(10, 2)\` always gives \`20\`.
- \`const addTax = (cart) => { cart.total *= 1.1; };\` is **not pure**. It changes the cart you pass in.

A **pure function** follows two rules:

1. The same input always gives the same output.
2. It changes nothing outside itself. It does not change its arguments or outside variables. It does not use the network, files, the console, the browser, the clock or random numbers.

A change to anything outside the function is called a **side effect**. Changing an object or array in place is called *mutating* it.

A pure function is like a calculator: same buttons, same answer, and nothing else changes. An impure function is like a vending machine: it changes the stock and takes your money.

**Side effects are needed.** A test must click and navigate. But keep them at the edges: inside the test or the Page Object. Keep helpers that calculate or build data pure.

| Helper | Pure? | Why it matters |
|---|---|---|
| \`toCents('$29.99')\` | Yes | You can test it in milliseconds, without a browser |
| \`buildUser(overrides)\` that returns a new object | Yes, if it does not touch shared data | Tests do not affect each other |
| \`addTax(cart)\` that changes \`cart.total\` | No, it changes its argument | Other tests that reuse \`cart\` get wrong totals |
| \`uniqueEmail()\` that uses \`Date.now()\` | No, it reads the clock | Fine, but pass the time in to make it testable |

**Watch out:** changing an argument inside a "builder", like \`user.role = 'admin'\`, is a classic bug. Every later test that uses the same object gets the change. Those tests then pass or fail depending on the order they run in. This is a typical *flaky* test (one that passes sometimes and fails other times).

**Why testers care:** pure helpers give the same answer every time, so they never cause flaky tests.`,
      code: [
        {
          language: 'javascript',
          title: 'Impure vs pure data builder',
          code: `const defaultUser = { name: 'standard_user', role: 'customer' };

// Impure: changes (mutates) the shared default object
function makeAdminImpure(user) {
  user.role = 'admin';
  return user;
}
makeAdminImpure(defaultUser);
console.log(defaultUser.role); // → admin   (every other test is now polluted)

defaultUser.role = 'customer';  // reset for the demo

// Pure: returns a new object, leaves the input untouched
const makeAdmin = (user) => ({ ...user, role: 'admin' });
const admin = makeAdmin(defaultUser);
console.log(admin.role, defaultUser.role); // → admin customer

// Impure because of the clock; make it pure by injecting the time
const emailFor = (prefix, now) => \`\${prefix}_\${now}@test.com\`;
console.log(emailFor('reg', 1700000000000)); // → reg_1700000000000@test.com
console.log(emailFor('reg', 1700000000000) === emailFor('reg', 1700000000000)); // → true`,
        },
      ],
      keyPoints: [
        'Pure = same input, same output, and nothing changed outside.',
        'Return new objects instead of changing the ones passed in.',
        'Pass in the time or random values. Then helpers give the same result every time and are easy to test.',
      ],
      source: 'Marijn Haverbeke: Eloquent JavaScript, Ch 3 (Functions and side effects)',
    },
    {
      heading: 'Recursion basics',
      body: `**Example:**

- \`function countdown(n) { if (n === 0) return 'Go!'; return countdown(n - 1); }\`
- \`countdown(3)\` calls \`countdown(2)\`, then \`countdown(1)\`, then \`countdown(0)\`. The last one gives back \`'Go!'\`.

**Recursion** means a function calls itself. Think of Russian dolls. To reach the smallest doll, you open one doll after another. You stop at the smallest one.

**Every recursive function has two parts**

1. **Base case:** a simple input you can answer at once. This is the stop rule.
2. **Recursive case:** make the problem a bit smaller, and call the function again on it.

**The call stack** is the list of function calls that are still waiting for an answer. Each call waits for the inner call to finish. With no base case, the calls never stop. The stack fills up, and you get \`RangeError: Maximum call stack size exceeded\`.

**Where testers meet recursion**

- Walking **nested data**: a JSON response with nested categories, a site menu, or a folder of test files.
- Comparing two nested objects deeply (the Objects topic builds one).
- Interview classics: factorial, sum of digits, reversing a string, Fibonacci.

**Recursion or a loop?** Anything recursive can also be written with a loop. Loops are usually faster, and they cannot overflow the stack. Recursion reads better for tree-shaped data (data with branches, like a menu).

**Why testers care:** API responses are often nested. A short recursive function can find every \`id\` inside them, however deep they go.`,
      code: [
        {
          language: 'javascript',
          title: 'Base case, recursive case, nested data',
          code: `function factorial(n) {
  if (n <= 1) return 1;          // base case
  return n * factorial(n - 1);   // recursive case on a smaller input
}
console.log(factorial(5)); // → 120   (5 * 4 * 3 * 2 * 1)

// Count every link in a nested menu (tree-shaped data)
const menu = {
  label: 'All Items',
  children: [
    { label: 'About', children: [] },
    { label: 'Settings', children: [{ label: 'Profile', children: [] }, { label: 'Security', children: [] }] },
  ],
};
function countLinks(node) {
  let total = 1;                                  // this node
  for (const child of node.children) total += countLinks(child);
  return total;                                   // leaves return 1 (empty children)
}
console.log(countLinks(menu)); // → 5

// No base case → stack overflow
function forever(n) { return forever(n + 1); }
try {
  forever(0);
} catch (e) {
  console.log(e.name, '-', e.message); // → RangeError - Maximum call stack size exceeded
}`,
        },
      ],
      keyPoints: [
        'Always write the base case (the stop rule) first.',
        'Each call waits on the call stack. No base case means a RangeError.',
        'Recursion fits nested, tree-shaped data. Loops fit flat repetition.',
      ],
      source: 'javascript.info: Recursion and stack; Marijn Haverbeke: Eloquent JavaScript, Ch 3 (Recursion)',
    },
  ],
  codeChallenges: [
    {
      id: 'js-functions-cc-1',
      title: 'Fix a test-data factory that leaks state and returns nothing',
      context:
        'A shared helper file creates users for registration tests. Each test passes on its own, but they fail when run together. Emails clash. A test that expects a "customer" sometimes gets an "admin". And `buildAddress` returns undefined.',
      task: 'Fix the helpers so each test gets fresh data of its own. No shared changeable globals. Do not change the defaults. Return the right values and handle defaults correctly. The tests call `makeTestData(overridesList, city)`, which acts like one fresh test run. It builds one user per overrides object, with emails `user1@test.com`, `user2@test.com`, … starting again at 1 on every call. It returns `{ users, address, defaultRole }`. `address` is `{ city }`. `defaultRole` is the role in the shared defaults afterwards, and it must still be "customer". Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'user-data.js (buggy)',
        code: `var counter = 0;
var defaults = { role: 'customer', country: 'IN', newsletter: true };

function buildUser(overrides) {
  counter++;
  var user = defaults;                     // "copy" the defaults
  user.email = 'user' + counter + '@test.com';
  for (var key in overrides) user[key] = overrides[key];
  user.newsletter = overrides.newsletter || true;
  return user;
}

const buildAddress = (city) => { city: city };

// Entry point the tests call: one fresh "test run"
function makeTestData(overridesList, city) {
  const users = overridesList.map((o) => buildUser(o));
  return { users, address: buildAddress(city), defaultRole: defaults.role };
}

// makeTestData([{ role: 'admin' }, { newsletter: false }], 'Pune')
// → both users are the SAME object (role 'admin', newsletter true),
//   address undefined, defaultRole 'admin', and the counter keeps
//   growing across calls`,
      },
      hints: [
        'Does `var user = defaults` create a new object? Or do both names point at the same one?',
        'Look at the arrow function body. Is `{ city: city }` an object or a function body?',
        'Put the counter inside a closure (a factory function). For defaults, use `??` or the order of `...` spreads instead of `||`.',
      ],
      solution: {
        language: 'javascript',
        title: 'user-data.js (fixed)',
        code: `const DEFAULTS = Object.freeze({ role: 'customer', country: 'IN', newsletter: true });

// Factory: each suite (or worker) gets its own private counter via a closure
function createUserBuilder(prefix = 'user') {
  let counter = 0;
  return function buildUser(overrides = {}) {
    counter += 1;
    return {
      ...DEFAULTS,                                // fresh object every call
      email: \`\${prefix}\${counter}@test.com\`,
      ...overrides,                               // explicit values win, false included
    };
  };
}

const buildAddress = (city) => ({ city }); // parentheses = object

function makeTestData(overridesList, city) {
  const buildUser = createUserBuilder('user'); // fresh counter for this run
  const users = overridesList.map((o) => buildUser(o));
  return { users, address: buildAddress(city), defaultRole: DEFAULTS.role };
}

// makeTestData([{ role: 'admin' }, { newsletter: false }], 'Pune')
// → users: [{ role: 'admin', …, email: 'user1@test.com' },
//           { role: 'customer', newsletter: false, …, email: 'user2@test.com' }]
//   address: { city: 'Pune' }, defaultRole: 'customer'`,
      },
      explanation: `**Fixes**
1. **Shared object:** \`var user = defaults\` does not copy the object. Both names point at the *same* object. So every user was the same object, and \`role: 'admin'\` leaked into later tests. \`{ ...DEFAULTS, ...overrides }\` makes a new object on every call. \`Object.freeze\` makes any accidental change to the defaults fail clearly in strict code.
2. **Global counter:** it now lives in a closure made by \`createUserBuilder\`. Each builder has its own private count. Nothing outside can reset or break it. You can make one builder per worker with a different prefix, so parallel runs do not clash.
3. **\`|| true\` bug:** \`false || true\` is \`true\`, so nobody could turn the newsletter off. With overrides spread last, an explicit \`false\` wins.
4. **Arrow returning an object:** in \`=> { city: city }\`, JavaScript reads \`{ }\` as a function body, not an object. So the arrow returns \`undefined\`. Wrap the object in brackets: \`=> ({ city })\`.
5. **\`var\` → \`const\`/\`let\`**, and a default \`overrides = {}\`, so \`buildUser()\` also works with no arguments.

The tests call \`makeTestData\` several times on one page load. That is just like several tests sharing one file. With the global counter, the second call starts at \`user3\`. With the shared defaults, an earlier \`role: 'admin'\` leaks into later runs.`,
      fnName: 'makeTestData',
      tests: [
        {
          args: [[{ role: 'admin' }, { newsletter: false }], 'Pune'],
          expected: {
            users: [
              { role: 'admin', country: 'IN', newsletter: true, email: 'user1@test.com' },
              { role: 'customer', country: 'IN', newsletter: false, email: 'user2@test.com' },
            ],
            address: { city: 'Pune' },
            defaultRole: 'customer',
          },
        },
        {
          args: [[{}], 'Delhi'],
          expected: { users: [{ role: 'customer', country: 'IN', newsletter: true, email: 'user1@test.com' }], address: { city: 'Delhi' }, defaultRole: 'customer' },
        },
        {
          args: [[{ newsletter: false }], 'Goa'],
          expected: { users: [{ role: 'customer', country: 'IN', newsletter: false, email: 'user1@test.com' }], address: { city: 'Goa' }, defaultRole: 'customer' },
        },
        {
          args: [[{ country: 'US', role: 'admin' }, {}, {}], 'Austin'],
          expected: {
            users: [
              { role: 'admin', country: 'US', newsletter: true, email: 'user1@test.com' },
              { role: 'customer', country: 'IN', newsletter: true, email: 'user2@test.com' },
              { role: 'customer', country: 'IN', newsletter: true, email: 'user3@test.com' },
            ],
            address: { city: 'Austin' },
            defaultRole: 'customer',
          },
        },
        { args: [[], 'Pune'], expected: { users: [], address: { city: 'Pune' }, defaultRole: 'customer' } },
        {
          args: [[{ email: 'fixed@test.com' }], 'Mumbai'],
          expected: { users: [{ role: 'customer', country: 'IN', newsletter: true, email: 'fixed@test.com' }], address: { city: 'Mumbai' }, defaultRole: 'customer' },
          hidden: true,
        },
        {
          args: [[{ role: 'admin' }, {}], 'Pune'],
          expected: {
            users: [
              { role: 'admin', country: 'IN', newsletter: true, email: 'user1@test.com' },
              { role: 'customer', country: 'IN', newsletter: true, email: 'user2@test.com' },
            ],
            address: { city: 'Pune' },
            defaultRole: 'customer',
          },
          hidden: true,
        },
      ],
      followUps: [
        {
          q: 'How would you make sure emails are unique across parallel Playwright workers?',
          a: 'Add the worker number to the prefix. For example, create the builder in a worker-scoped fixture with a prefix like "w" + workerInfo.workerIndex + "_". Or add a random part with crypto.randomUUID(). A counter in a file starts again at 0 in every worker process, so on its own it is not unique across workers.',
        },
        {
          q: 'Is the spread copy enough if DEFAULTS had a nested address object?',
          a: 'No. Spread makes a shallow copy: it copies only the top level. The nested object would still be shared, so `user.address.city = "X"` would change it for everyone. Either build nested objects fresh inside the function, or make a deep copy with structuredClone(DEFAULTS) before applying overrides.',
        },
      ],
    },
    {
      id: 'js-functions-cc-2',
      title: 'Repair a page-object helper that loses `this`',
      context:
        'Here is a simple Page Object. There is no browser: a fake `page` just records actions. It works when tests call `loginPage.login()` directly. But it crashes when passed to the `retry` helper. And the `logAll` method never counts anything.',
      task: 'Make `retry(loginPage.login, 3)`-style calls safe. Fix `logAll`. Make `retry` fail clearly instead of returning undefined. The tests call `runLoginFlow(attempts, failures)`. It makes a fresh `LoginPage` on a `FakePage` whose login button throws for the first `failures` clicks. It logs in through `retry` and returns `{ result, actions, counted }`. `result` is `\'done\'` or the error message `\'failed after N attempts\'`. `actions` is the list of recorded page actions. `counted` is the value of `logAll()`. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'login-page.js (buggy)',
        code: `class FakePage {
  constructor(failures = 0) { this.actions = []; this.failures = failures; }
  fill(sel, val) { this.actions.push(\`fill \${sel}=\${val}\`); }
  click(sel) {
    if (this.failures > 0) { this.failures--; throw new Error(\`\${sel} not clickable yet\`); }
    this.actions.push(\`click \${sel}\`);
  }
}

class LoginPage {
  constructor(page) {
    this.page = page;
    this.logged = 0;
    this.describe = () => 'LoginPage';
  }
  login(user = 'standard_user') {
    this.page.fill('#user-name', user);
    this.page.click('#login-button');
    return 'done';
  }
  logAll() {
    this.page.actions.forEach(function (a) { this.logged++; });
    return this.logged;
  }
}

function retry(fn, times) {
  for (let i = 0; i < times; i++) {
    try { return fn(); } catch (e) { console.log('retrying:', e.message); }
  }
}

// Entry point the tests call
function runLoginFlow(attempts, failures) {
  const loginPage = new LoginPage(new FakePage(failures));
  let result;
  try {
    result = retry(loginPage.login, attempts);
  } catch (e) {
    result = e.message;
  }
  const counted = loginPage.logAll();
  return { result, actions: loginPage.page.actions, counted };
}

// runLoginFlow(3, 0)
// → retrying: Cannot read properties of undefined (reading 'page')   (x3)
// → TypeError: Cannot read properties of undefined (reading 'logged')`,
      },
      hints: [
        'What is `this` inside `login` when `retry` calls it as a plain `fn()`?',
        'Inside `logAll`, which function owns the `this` in `this.logged++`?',
        'Arrow functions keep the outer `this`. Regular functions get `this` from the call. Pick the right one for each place.',
      ],
      solution: {
        language: 'javascript',
        title: 'login-page.js (fixed)',
        code: `class FakePage {
  constructor(failures = 0) { this.actions = []; this.failures = failures; }
  fill(sel, val) { this.actions.push(\`fill \${sel}=\${val}\`); }
  click(sel) {
    if (this.failures > 0) { this.failures--; throw new Error(\`\${sel} not clickable yet\`); }
    this.actions.push(\`click \${sel}\`);
  }
}

class LoginPage {
  constructor(page) {
    this.page = page;
    this.logged = 0;
  }
  login(user = 'standard_user') {
    this.page.fill('#user-name', user);
    this.page.click('#login-button');
    return 'done';
  }
  logAll() {
    // arrow callback: uses logAll's this (the LoginPage)
    this.page.actions.forEach(() => { this.logged++; });
    return this.logged;
  }
}

function retry(fn, times) {
  for (let i = 0; i < times; i++) {
    try { return fn(); } catch (e) { console.log('retrying:', e.message); }
  }
  throw new Error(\`failed after \${times} attempts\`); // never return undefined silently
}

function runLoginFlow(attempts, failures) {
  const loginPage = new LoginPage(new FakePage(failures));
  let result;
  try {
    result = retry(() => loginPage.login(), attempts); // arrow keeps the object
    // retry(loginPage.login.bind(loginPage), attempts) works too
  } catch (e) {
    result = e.message;
  }
  const counted = loginPage.logAll();
  return { result, actions: loginPage.page.actions, counted };
}

// runLoginFlow(3, 1)
// → { result: 'done',
//     actions: ['fill #user-name=standard_user', 'fill #user-name=standard_user', 'click #login-button'],
//     counted: 3 }
// runLoginFlow(2, 5) → result: 'failed after 2 attempts'`,
      },
      explanation: `**Fixes**
1. **Method passed on its own:** \`retry(loginPage.login, 2)\` passes the function without its object. Class code is always strict, so the plain call \`fn()\` gives \`this === undefined\`, and \`this.page\` throws. Wrapping it in an arrow (\`() => loginPage.login()\`) or using \`bind\` keeps the object.
2. **Callback \`this\`:** the \`function (a) {...}\` passed to \`forEach\` gets its own \`this\`, which is undefined. So \`this.logged\` crashed. An arrow callback keeps \`logAll\`'s \`this\`.
3. **\`retry\` hiding failure:** after all attempts it returned \`undefined\`. A caller might treat that as success. Now it throws a clear error.
4. **The \`describe\` arrow property** did no harm here, but it was removed. People often add such arrow properties as a workaround when they do not understand \`this\`. A normal method, called the right way, is clearer.`,
      fnName: 'runLoginFlow',
      tests: [
        { args: [3, 0], expected: { result: 'done', actions: ['fill #user-name=standard_user', 'click #login-button'], counted: 2 } },
        { args: [3, 1], expected: { result: 'done', actions: ['fill #user-name=standard_user', 'fill #user-name=standard_user', 'click #login-button'], counted: 3 } },
        { args: [2, 2], expected: { result: 'failed after 2 attempts', actions: ['fill #user-name=standard_user', 'fill #user-name=standard_user'], counted: 2 } },
        { args: [1, 0], expected: { result: 'done', actions: ['fill #user-name=standard_user', 'click #login-button'], counted: 2 } },
        { args: [1, 1], expected: { result: 'failed after 1 attempts', actions: ['fill #user-name=standard_user'], counted: 1 } },
        { args: [0, 0], expected: { result: 'failed after 0 attempts', actions: [], counted: 0 }, hidden: true },
        { args: [5, 4], expected: { result: 'done', actions: ['fill #user-name=standard_user', 'fill #user-name=standard_user', 'fill #user-name=standard_user', 'fill #user-name=standard_user', 'fill #user-name=standard_user', 'click #login-button'], counted: 6 }, hidden: true },
      ],
      followUps: [
        {
          q: 'Some teams write every Page Object method as an arrow class field (login = async () => {...}). What are the pros and cons?',
          a: 'Pro: you can pass the methods around without losing `this`. Cons: each object gets its own copy of every function, which uses more memory. Child classes cannot call super.login(). And it hides the real problem instead of teaching it. Most Playwright Page Objects use normal methods and call them as page.method().',
        },
        {
          q: 'Why does Playwright code rarely hit this problem in practice?',
          a: 'Tests usually call methods directly on the object, like `await loginPage.login(user)`. Fixtures pass whole objects, not loose methods. The problem appears in general helpers (retry, step wrappers, event handlers) that receive a function. That is exactly where you should wrap the call in an arrow.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-functions-iq-01',
      difficulty: 'easy',
      question: 'What is the difference between a function declaration, a function expression and an arrow function? When would you use each in a test framework?',
      whatInterviewerLooksFor: [
        'Hoisting: declarations can be called before their line; expressions cannot',
        'Arrow rules: automatic return, and an object needs brackets',
        'Arrow functions have no own this or arguments',
        'Practical advice for tests and Page Objects',
      ],
      modelAnswer: `**Declaration:** \`function login(user) { ... }\`. It is fully hoisted, so you can call it above its line. It has its own \`this\` and \`arguments\`.

**Expression:** \`const login = function (user) { ... };\`. The function is created when that line runs. Before that line, a \`const\` name is in the temporal dead zone (TDZ), so using it throws. With \`var\`, it is \`undefined\`, so calling it gives "login is not a function".

**Arrow:** \`const login = (user) => { ... };\`. Same timing as an expression, but shorter. A one-line arrow returns its value by itself: \`n => n * 2\`. It has **no own \`this\`**, no \`arguments\`, and you cannot use it with \`new\`. It uses \`this\` from where it is written.

**How I use them in a Playwright project:**
- **Test bodies and callbacks:** arrows. \`test('adds to cart', async ({ page }) => { ... })\`, \`.filter(p => p > 10)\`, \`page.on('dialog', d => d.accept())\`.
- **Page Object methods:** normal class methods, like \`async login(user, pass) { ... }\`, because they need \`this.page\`.
- **Small helpers** (\`toCents\`, \`buildUser\`): a declaration or a \`const\` arrow. Teams usually pick one style.

**Traps I watch for:** an arrow with \`{ }\` and no \`return\` gives \`undefined\`. Returning an object needs \`() => ({ ... })\`. An object method written as an arrow gets the wrong \`this\`.`,
      followUps: [
        {
          q: 'Can an arrow function be used with new?',
          a: 'No. Arrow functions cannot build objects and have no prototype property. So `new Arrow()` throws a TypeError ("is not a constructor"). Use a class or a regular function when you need new. In tests this rarely matters, because Page Objects are classes.',
        },
        {
          q: 'What does `arguments` mean inside an arrow function?',
          a: 'Arrows have no arguments object of their own. The name refers to the arguments of the nearest regular function around it. At the top level of a module, it is a ReferenceError. Modern code uses rest parameters (...args) instead. They work the same in both kinds of function and give a real array.',
        },
      ],
      pitfalls: [
        'Saying arrows are "just shorter", with no difference in behaviour.',
        'Saying expressions are hoisted like declarations.',
        'Suggesting arrow functions for object methods that use this.',
      ],
    },
    {
      id: 'js-functions-iq-02',
      difficulty: 'medium',
      question: 'Explain closures in your own words. Give a practical example from test automation.',
      whatInterviewerLooksFor: [
        'Clear definition: a function plus the variables around it, kept after the outer call ends',
        'Each outer call creates a fresh set of variables',
        'The live variable is kept, not a copy',
        'A real testing example, not just a counter',
      ],
      modelAnswer: `**Definition:** a closure is a function that remembers the variables from the place where it was created. If an inner function is returned or stored, it can still use those variables after the outer function has finished. Every JavaScript function is a closure. You notice it when the inner function lives longer than the outer call.

**Small example:**
\`function makeCounter() { let count = 0; return () => ++count; }\`
\`const next = makeCounter(); next(); next();\` gives 1, then 2. \`count\` is private: nothing else can touch it. A second \`makeCounter()\` gets its own \`count\`, starting at 0.

**Test-automation examples:**
1. **Unique test data:** \`makeEmailFactory('checkout')\` returns a function that gives \`checkout_1@test.com\`, \`checkout_2@test.com\`, and so on. The counter is hidden in the closure.
2. **Run-once setup:** \`once(getAuthToken)\` calls the API the first time and returns the saved token after that. Playwright's worker-scoped fixtures follow the same idea: set up once, reuse.
3. **Ready-made checks:** \`between(10, 30)\` returns \`price => price >= 10 && price <= 30\`, used to filter prices.
4. **Every test body:** the async arrow passed to \`test()\` uses constants declared at the top of the spec file.

**Good to know:** a closure keeps the **live** variable, not a copy. If the variable changes later, the closure sees the change. That explains the \`for (var i...)\` puzzle, where all callbacks see the last value. With \`let\`, each loop round gets its own variable. Closures also keep memory in use: a long-lived closure that holds a big object stops it from being cleaned up.`,
      followUps: [
        {
          q: 'Why does the classic loop with var and setTimeout print 3, 3, 3?',
          a: 'var i belongs to the whole function, so there is only one i. All three callbacks share it. When the timers fire, the loop has finished and i is 3. Each callback reads the same variable, not a copy of its old value. With let, each loop round gets a new variable, so the callbacks print 0, 1, 2.',
        },
        {
          q: 'How are closures linked to keeping data private?',
          a: 'Variables inside the outer function can only be reached through the functions it returns. So they act like private fields. Before classes had #private fields, people used closures to hide internal state. In test helpers, this stops other tests from resetting a counter or cache by accident.',
        },
      ],
      pitfalls: [
        'Defining a closure only as "a function inside a function", without saying it keeps the outer variables.',
        'Saying a closure copies the values when it is created.',
        'Giving only the textbook counter, with no real use.',
      ],
    },
    {
      id: 'js-functions-iq-03',
      difficulty: 'medium',
      question: 'What is hoisting? Predict the output: `console.log(a); var a = 1; console.log(b); let b = 2; sayHi(); function sayHi() { console.log("hi"); }`',
      whatInterviewerLooksFor: [
        'Explains that declarations are read before the code runs',
        'var → undefined, let/const → ReferenceError (TDZ), function → can be called',
        'Notices that the script stops at the first uncaught error',
      ],
      modelAnswer: `**Hoisting:** JavaScript reads your declarations first, before running the code. Nothing actually moves. The engine notes every name first, then runs the lines from top to bottom.

- **Function declarations** are noted with their whole body. So you can call them anywhere in the scope.
- **\`var\`** is noted and set to \`undefined\`.
- **\`let\` / \`const\` / \`class\`** are noted, but they get **no value** until their line runs. That gap is the **Temporal Dead Zone (TDZ)**. Using the name in the gap throws a \`ReferenceError\`.

**Tracing the code:**
1. \`console.log(a)\` → \`undefined\`. The var is known, but its value is not set yet.
2. \`var a = 1\` sets a to 1.
3. \`console.log(b)\` → \`ReferenceError: Cannot access 'b' before initialization\`. **The script stops here**, because nothing catches the error.
4. \`sayHi()\` never runs. Without the \`b\` line, it would print \`hi\`, because function declarations are hoisted whole.

**So the output is:** \`undefined\`, then a ReferenceError.

**Why the TDZ exists:** it turns a silent bug into a loud one. In test code, using \`const expectedTotal\` before you set it fails at once with a clear message. It does not quietly compare against \`undefined\`.`,
      followUps: [
        {
          q: 'Is `typeof b` safe inside the TDZ?',
          a: 'No. typeof is safe for names that were never declared: it gives "undefined". But for a let, const or class in its TDZ, it throws a ReferenceError, because the name exists but has no value yet. This trick question checks if you can tell "not declared" from "declared but not ready".',
        },
        {
          q: 'Are class declarations hoisted?',
          a: 'Yes, like let. The name is known, but it stays in the TDZ until the class line runs. So `new LoginPage()` above the class throws a ReferenceError. That is why Page Object classes are imported or declared before you use them.',
        },
      ],
      pitfalls: [
        'Printing "hi" even though the ReferenceError stopped the script earlier.',
        'Saying let is not hoisted at all.',
        'Describing hoisting as code being physically moved to the top.',
      ],
    },
    {
      id: 'js-functions-iq-04',
      difficulty: 'hard',
      question: 'How does `this` work in JavaScript? How is it different in arrow functions? Describe a bug it can cause in a Page Object.',
      whatInterviewerLooksFor: [
        'For regular functions, this depends on how the function is called',
        'Arrows use the this from where they are written',
        'A real "method passed on its own" bug, with fixes (arrow wrapper, bind)',
        'Mentions that strict mode and classes give undefined',
      ],
      modelAnswer: `**Regular functions:** \`this\` is decided **when the function is called**, by how it is called:
- \`obj.method()\` → \`this\` is \`obj\`.
- \`new Ctor()\` → the new object.
- \`fn.call(x)\`, \`fn.apply(x)\`, \`fn.bind(x)\` → \`x\`.
- A plain call \`fn()\` → \`undefined\` in strict mode. Classes and ES modules are always strict. In old non-strict scripts it is the global object.

**Arrow functions** have no \`this\` of their own. They use the \`this\` from where they were **written**, forever. \`bind\` and \`call\` cannot change it.

**Page Object bug:**
\`class LoginPage { constructor(page) { this.page = page; } async submit() { await this.page.getByRole('button', { name: 'Login' }).click(); } }\`

Say a helper receives the method: \`await retry(loginPage.submit, 3)\`. The helper calls \`fn()\` with no object in front. Inside \`submit\`, \`this\` is \`undefined\`. So \`this.page\` throws \`TypeError: Cannot read properties of undefined (reading 'page')\`.

**Fixes:** \`retry(() => loginPage.submit(), 3)\` is my favourite, because it is clear. Or use \`retry(loginPage.submit.bind(loginPage), 3)\`.

**The opposite bug:** a callback inside a method written as \`function () { this.count++ }\` gets its own \`this\`. An arrow there keeps the method's \`this\`. Rule of thumb: **regular methods for methods, arrows for callbacks inside them.**`,
      followUps: [
        {
          q: 'What does bind return, and can you bind a function twice?',
          a: 'bind returns a new function whose this is fixed to the value you gave. You can also pre-fill some arguments. Calling bind again on that new function does not change this: the first bind wins. Arrow functions ignore bind for this completely.',
        },
        {
          q: 'What is this inside a Playwright test body?',
          a: 'Nothing useful. Test bodies are usually arrow functions, so this comes from the module level, where it is undefined in ES modules. Playwright passes everything you need as fixtures in the first argument ({ page, request }) and testInfo as the second. So tests never need this.',
        },
      ],
      pitfalls: [
        'Saying this means the function itself.',
        'Saying this is fixed where a regular function is written.',
        'Suggesting arrows for every method without explaining the trade-offs.',
      ],
    },
    {
      id: 'js-functions-iq-05',
      difficulty: 'hard',
      question: 'Write a function `once(fn)` that returns a new function. The new function calls `fn` only the first time, and returns the saved result on later calls. Where could this help in a test suite?',
      whatInterviewerLooksFor: [
        'Uses a closure with a flag and a saved value',
        'Passes on the arguments and the return value',
        'Handles fn returning undefined (uses a flag, not a value check)',
        'Links it to one-time setup and fixtures',
      ],
      modelAnswer: `**Implementation:**

\`function once(fn) {\`
\`  let called = false;\`
\`  let result;\`
\`  return function (...args) {\`
\`    if (!called) {\`
\`      called = true;\`
\`      result = fn.apply(this, args);\`
\`    }\`
\`    return result;\`
\`  };\`
\`}\`

**How it works:**
- \`called\` and \`result\` live in the closure. They are private to this wrapper.
- I use a **separate flag**, not \`if (result === undefined)\`. \`fn\` might really return \`undefined\`, and it must still not run twice.
- \`...args\` passes on any arguments. \`fn.apply(this, args)\` also passes on \`this\`, in case the wrapper is used as a method.
- I set \`called = true\` **before** calling \`fn\`. So if \`fn\` somehow calls the wrapper again, it does not run twice. This is a design choice worth mentioning.

**Usage:** \`const init = once(() => { console.log('seeding'); return 42; }); init(); init();\` logs "seeding" only once, and returns 42 both times.

**Where it helps in a test suite:**
- Getting an auth token, or loading reference data, once per worker.
- Creating an expensive object, like a database client, only when it is first needed.
- In Playwright, the built-in answer is a **worker-scoped fixture**, or a **setup project** with \`storageState\`. \`once\` is the plain JavaScript version of the same idea, and a common interview step.

**Async note:** if \`fn\` is async, save the **promise**, not the final value. Then callers that arrive at the same time share the same request.`,
      followUps: [
        {
          q: 'What if fn throws on the first call? Should later calls try again?',
          a: 'With the flag set before calling fn, a throw leaves called = true and result undefined. Later calls then quietly return undefined, which is bad. Better: set the flag only after fn succeeds, so a failed setup is tried again. Or save the error and throw it again, so every caller sees the failure.',
        },
        {
          q: 'How would you write memoize, which saves a result per argument?',
          a: 'Keep a Map from each argument to its result: `const cache = new Map(); return (arg) => { if (!cache.has(arg)) cache.set(arg, fn(arg)); return cache.get(arg); }`. For several arguments, build a key such as JSON.stringify(args). Use has() instead of checking the value, so undefined results are saved too.',
        },
      ],
      pitfalls: [
        'Checking `result === undefined` instead of using a flag.',
        'Not passing on the arguments or the return value.',
        'Using a global variable instead of a closure.',
      ],
    },
    {
      id: 'js-functions-iq-06',
      difficulty: 'medium',
      question: 'Write a recursive function that returns the sum of the digits of a non-negative whole number (for example 4096 → 19). Then explain the base case, and what happens without one.',
      context: 'A small coding question used in automation screening rounds. It checks basic problem solving before the Playwright questions.',
      whatInterviewerLooksFor: [
        'A correct base case and a step that makes the number smaller',
        'Uses % 10 and Math.floor(n / 10) (or turns the number into a string)',
        'Explains the call stack and the RangeError',
        'Offers a loop version too',
      ],
      modelAnswer: `**Recursive solution:**

\`function sumDigits(n) {\`
\`  if (n < 10) return n;                         // base case: one digit\`
\`  return (n % 10) + sumDigits(Math.floor(n / 10)); // last digit + rest\`
\`}\`

**Trace for 4096:** \`6 + sumDigits(409)\` → \`9 + sumDigits(40)\` → \`0 + sumDigits(4)\` → \`4\`. Adding up on the way back: 4 + 0 + 9 + 6 = **19**.

**Base case:** the smallest input we can answer at once. A single digit is its own sum. Every recursive call must move **towards** the base case. Here \`Math.floor(n / 10)\` drops one digit per call, so it always stops for non-negative whole numbers.

**Without a base case:** the function keeps calling itself. Each call adds a waiting entry to the call stack (the list of calls not yet finished). When the stack is full, you get \`RangeError: Maximum call stack size exceeded\`. The same can happen if the "make it smaller" step is wrong. For example, \`n / 10\` without \`Math.floor\` makes decimals, and the function does not behave as planned.

**Other ways I would mention:**
- A loop: \`let s = 0; while (n > 0) { s += n % 10; n = Math.floor(n / 10); } return s;\`. The stack does not grow.
- With a string: \`String(n).split('').reduce((s, d) => s + Number(d), 0)\`. Easy to read, but it switches between text and numbers.

**Testing my own function:** 0 → 0, 7 → 7, 10 → 1, 4096 → 19, 99999 → 45. I would also ask what should happen for negative numbers and decimals: reject them, or use \`Math.abs\`?`,
      followUps: [
        {
          q: 'When is recursion a better choice than a loop in test automation?',
          a: 'For tree-shaped data when you do not know how deep it goes. Examples: walking nested JSON in an API response to find every "id" field, comparing two nested objects, or going through a nested menu or folder. For flat repetition, like retries or table rows, a loop is simpler and cannot overflow the stack.',
        },
        {
          q: 'What does your function return for 0, and for a negative number?',
          a: 'For 0 it returns 0 from the base case, which is correct. For -15, n < 10 is true at once, so it returns -15, which is wrong. I would either add `if (n < 0) throw new RangeError("non-negative only")` or use Math.abs, depending on the requirement. Pointing this out without being asked is a good sign.',
        },
      ],
      pitfalls: [
        'Forgetting Math.floor and getting decimals.',
        'No base case, or a base case that is never reached.',
        'Not testing edge inputs like 0 and single digits.',
      ],
    },
    {
      id: 'js-functions-iq-07',
      difficulty: 'medium',
      question: 'What is a pure function? A test helper `applyCoupon(cart, code)` changes `cart.total` directly. Why might this make your tests flaky, and how would you rewrite it?',
      whatInterviewerLooksFor: [
        'Same input → same output, and no side effects',
        'Links changing shared data to tests that fail depending on their order',
        'Rewrites it to return a new object',
        'Knows that side effects belong at the edges of a test',
      ],
      modelAnswer: `**Pure function:** with the same arguments it always gives the same result. And it has no side effects: it does not change its arguments or outside variables. It does no input/output either: no network, files, console, browser, clock or random numbers.

**The problem with \`applyCoupon(cart, code)\` changing \`cart.total\`:**
- Say several tests import the same \`cart\` object from a data file. The first test that applies \`SAVE10\` changes the shared object. The next test starts with a total that is already discounted.
- The result depends on **test order**. A test passes alone and fails in a full run, or the other way round. With parallel workers the order changes between runs, so it looks random. That is exactly what a flaky, order-dependent test is.
- Debugging is hard, because the failing test did nothing wrong. The test that changed the data ran earlier.

**Rewrite:**

\`function applyCoupon(cart, code) {\`
\`  const rate = code === 'SAVE10' ? 0.1 : 0;\`
\`  const totalCents = Math.round(cart.totalCents * (1 - rate));\`
\`  return { ...cart, totalCents, coupon: code };\`
\`}\`

It returns a **new** cart and leaves the input alone. So any number of tests can share the same starting data. Using cents avoids decimal rounding surprises. If the cart had nested objects (like items), I would copy the parts I change. Or I would use \`structuredClone\`.

**The bigger rule:** keep helpers that calculate or build data pure. They can be tested in milliseconds. Keep side effects, like clicks and API calls, inside the test or the Page Object, where people expect them. In Playwright, fixtures that create fresh data for each test complete the picture.`,
      followUps: [
        {
          q: 'How could you catch accidental changes to shared test data?',
          a: 'Deep-freeze the shared data in a CI check (call Object.freeze on every level). Then any change throws a TypeError in strict mode, which includes ES modules. Or save a JSON copy of the data before each test and compare it afterwards in a hook. Running tests in random or reversed order also shows hidden order problems.',
        },
        {
          q: 'Is a function that only reads Date.now() pure?',
          a: 'No. The same arguments can give different results at different times, so the clock is a hidden input. To make it pure, pass the time in as a parameter (or pass in a clock). Playwright also has a Clock API (page.clock) to control time in the browser, for the same reason: the same result every run.',
        },
      ],
      pitfalls: [
        'Defining pure only as "returns something".',
        'Not linking changed shared data to tests that fail depending on their order.',
        'Fixing it by resetting the global in afterEach, instead of removing the shared change.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-functions-drill-1',
      question:
        'Trace this file line by line. Give each output, or the error: `console.log(typeof setup); console.log(count); var count = 5; console.log(typeof helper); var helper = () => 1; console.log(helper()); console.log(limit); const limit = 10; function setup() {}`',
      assumptions: [
        'JavaScript notes every declaration before any line runs (hoisting).',
        'An error that nothing catches stops the script.',
        '`typeof` on a var that holds undefined gives "undefined".',
      ],
      steps: [
        { label: 'Before any line runs', calc: 'setup → function; count → undefined; helper → undefined; limit → TDZ (no value yet)' },
        { label: 'typeof setup', calc: 'function declaration, fully hoisted → "function"' },
        { label: 'console.log(count)', calc: 'var starts as undefined → undefined; then count = 5' },
        { label: 'typeof helper', calc: 'helper is still undefined (the arrow is not saved yet) → "undefined"' },
        { label: 'helper = () => 1; helper()', calc: 'the line has now run → 1' },
        { label: 'console.log(limit)', calc: 'const in the TDZ → ReferenceError: Cannot access \'limit\' before initialization; the script stops' },
      ],
      answer: '`function`, `undefined`, `undefined`, `1`, then **ReferenceError** (Cannot access \'limit\' before initialization).',
      insight:
        'Only function declarations are safe to use early. var quietly gives undefined, while let and const fail loudly. In test files, declare data and helpers before you use them, and prefer const. Then mistakes show up as clear errors.',
      followUps: [
        {
          q: 'What changes if `var helper = () => 1` becomes `const helper = () => 1`?',
          a: '`typeof helper` on the third line now throws a ReferenceError, because helper is in the TDZ, and typeof is not safe there. The script stops at that line, earlier than before. So only "function" and undefined are printed.',
        },
      ],
    },
    {
      id: 'js-functions-drill-2',
      question:
        'Predict the outputs: `function makeCounter(start = 0) { let n = start; return { inc: () => ++n, get: () => n }; } const a = makeCounter(); const b = makeCounter(10); a.inc(); a.inc(); b.inc(); console.log(a.get(), b.get()); const c = a; c.inc(); console.log(a.get());`',
      assumptions: [
        'Each makeCounter call makes its own private set of variables (its own closure).',
        '`++n` adds one first, then gives the new value.',
        'Saving an object in another variable does not copy it. Both names point at the same object.',
      ],
      steps: [
        { label: 'a = makeCounter()', calc: 'set A: n = 0' },
        { label: 'b = makeCounter(10)', calc: 'set B: n = 10' },
        { label: 'a.inc(); a.inc()', calc: 'A: n = 1, then 2' },
        { label: 'b.inc()', calc: 'B: n = 11 (A does not change)' },
        { label: 'console.log(a.get(), b.get())', calc: '2 11' },
        { label: 'const c = a; c.inc()', calc: 'c is the same object as a, so its functions use set A → A: n = 3' },
        { label: 'console.log(a.get())', calc: '3' },
      ],
      answer: '`2 11`, then `3`.',
      insight:
        'Two factory calls give two separate private counters. Two variables that point at the same object share one. This is why per-test data factories avoid clashes, and shared objects cause them.',
      followUps: [
        {
          q: 'How would you add a reset() that sets the counter back to its start value?',
          a: 'Add `reset: () => { n = start; }` to the returned object. The start parameter is also kept in the closure, so reset can read it later. Nothing outside can set n to any other value, which keeps the counter correct.',
        },
      ],
    },
    {
      id: 'js-functions-drill-3',
      question:
        'Predict each line: `class Product { constructor(n) { this.name = n; } label() { return "Item: " + this.name; } } const p = new Product("Backpack"); const f = p.label; const g = p.label.bind(p); const h = () => p.label(); console.log(p.label()); console.log(g()); console.log(h()); console.log(f());`',
      assumptions: [
        'Class code always runs in strict mode.',
        'In strict mode, a plain call `f()` gives this === undefined.',
        'bind fixes this for good. The arrow wrapper calls the method on p.',
      ],
      steps: [
        { label: 'p.label()', calc: 'called on p → this = p → "Item: Backpack"' },
        { label: 'g()', calc: 'bound to p → "Item: Backpack"' },
        { label: 'h()', calc: 'the arrow calls p.label() → "Item: Backpack"' },
        { label: 'f()', calc: 'plain call with no object → this is undefined → reading this.name throws a TypeError' },
      ],
      answer: '`Item: Backpack` three times, then `TypeError: Cannot read properties of undefined (reading \'name\')`.',
      insight:
        'this belongs to the call, not to the function. Whenever you hand a method to someone else (retry helpers, event handlers, array callbacks), wrap it in an arrow or bind it.',
      followUps: [
        {
          q: 'Would f() also throw if Product were a plain object in an old, non-module script?',
          a: 'Not always. In old non-strict code, a plain call sets this to the global object. So this.name reads globalThis.name, which is usually undefined (in a browser, window.name is often an empty string). You get "Item: undefined" or "Item: " with no error. That quiet wrong result is worse than a TypeError. It is one reason classes and modules are always strict.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-functions-mcq-01',
      difficulty: 'easy',
      question: 'A helper is called on line 1, but it is defined further down as a function declaration. What happens?',
      code: {
        language: 'javascript',
        code: `console.log(greetUser('qa'));

function greetUser(name) {
  return \`Hello, \${name}\`;
}`,
      },
      options: ['Hello, qa', 'ReferenceError: greetUser is not defined', 'TypeError: greetUser is not a function', 'undefined'],
      correct: [0],
      explanation:
        'Function declarations are hoisted with their whole body. So the call works before the definition line and prints "Hello, qa". A ReferenceError happens for a const/let function expression (TDZ). A TypeError happens for a var function expression called too early.',
      followUps: [
        {
          q: 'What would change with `const greetUser = (name) => ...`?',
          a: 'The call on line 1 would hit the temporal dead zone and throw ReferenceError: Cannot access \'greetUser\' before initialization. Arrow functions and function expressions can only be used after their line has run.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-02',
      difficulty: 'easy',
      question: 'Why does `getPrices()` return undefined here?',
      code: {
        language: 'javascript',
        code: `const getPrices = (items) => {
  items.map((i) => i.price);
};
console.log(getPrices([{ price: 9.99 }, { price: 7.99 }]));`,
      },
      options: [
        'The arrow body uses braces, so it needs an explicit return',
        'map() returns undefined when used inside an arrow function',
        'Arrow functions cannot take array parameters',
        'items.map must be awaited before returning',
      ],
      correct: [0],
      explanation:
        'With { } around the body, an arrow works like a normal function: no return means undefined. Either write `return items.map(...)`, or remove the braces so the value is returned by itself. map does return a new array. There is nothing async to await, and arrows accept any parameters.',
      followUps: [
        {
          q: 'How would you return an object from a one-line arrow?',
          a: 'Wrap it in brackets: `(i) => ({ name: i.name, price: i.price })`. Without them, JavaScript reads the { } as the function body, and the arrow returns undefined.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-03',
      difficulty: 'easy',
      question: 'Given `function login(user = "standard_user") { return user; }`, what do `login(undefined)` and `login(null)` return?',
      options: [
        '"standard_user" and null',
        '"standard_user" and "standard_user"',
        'undefined and null',
        'undefined and "standard_user"',
      ],
      correct: [0],
      explanation:
        'A default is used only when the argument is undefined (missing, or passed as undefined). null is a real value, so it is passed through as null. Beginners often think defaults work like || or ??, which would treat null differently.',
      followUps: [
        {
          q: 'How would you also use the default for null?',
          a: 'Inside the body, write `user = user ?? "standard_user"`. ?? treats both null and undefined as missing. It keeps other falsy values, like an empty string, which you might want to test as an invalid username.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-04',
      difficulty: 'medium',
      question: 'What does this tagging helper log?',
      code: {
        language: 'javascript',
        code: `function tag(title, first, ...others) {
  return [title, first, others.length, Array.isArray(others)];
}
console.log(tag('login', '@smoke', '@auth', '@p1'));`,
      },
      options: [
        "[ 'login', '@smoke', 2, true ]",
        "[ 'login', '@smoke', 3, true ]",
        "[ 'login', '@smoke', 2, false ]",
        "[ 'login', [ '@smoke', '@auth', '@p1' ], 3, true ]",
      ],
      correct: [0],
      explanation:
        'Named parameters take the arguments in order: title, then first. The rest parameter collects the other two into a real array, so its length is 2 and Array.isArray is true. The old arguments object looks like an array but is not one, which is why some people expect false.',
      followUps: [
        {
          q: 'Can a rest parameter come before other parameters?',
          a: 'No. It must be the last parameter. `function f(...a, b)` is a SyntaxError. This rule makes it clear which arguments go where.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-05',
      difficulty: 'medium',
      question: 'Two loops save callbacks that read the loop variable later. What do they print?',
      code: {
        language: 'javascript',
        code: `const fromVar = [];
const fromLet = [];
for (var i = 0; i < 3; i++) fromVar.push(() => i);
for (let k = 0; k < 3; k++) fromLet.push(() => k);
console.log(fromVar.map((f) => f()), fromLet.map((f) => f()));`,
      },
      options: ['[ 3, 3, 3 ] [ 0, 1, 2 ]', '[ 0, 1, 2 ] [ 0, 1, 2 ]', '[ 2, 2, 2 ] [ 0, 1, 2 ]', '[ 3, 3, 3 ] [ 3, 3, 3 ]'],
      correct: [0],
      explanation:
        'var makes one i for the whole function, and every callback shares it. When they run, the loop has finished and i is 3 (the value that ended the loop, not 2). let makes a new k for each loop round, so each callback keeps its own k. Closures keep the live variable, not a copy of its value.',
      followUps: [
        {
          q: 'How could you fix the var version without switching to let?',
          a: 'Make a new scope for each loop round. For example, call a function at once and pass in the current value: `fromVar.push(((j) => () => j)(i))`. This was the old pattern before ES2015. Today, let is the clean fix.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-06',
      difficulty: 'medium',
      question: 'A checkout function logs a let variable one line before declaring it. What happens when you call it?',
      code: {
        language: 'javascript',
        code: `function checkout() {
  console.log(total);
  let total = 59.98;
}
checkout();`,
      },
      options: [
        'ReferenceError: Cannot access \'total\' before initialization',
        'It logs undefined',
        'It logs 59.98',
        'ReferenceError: total is not defined',
      ],
      correct: [0],
      explanation:
        'total is hoisted to the top of the function, but it stays in the temporal dead zone until its let line runs. So using it throws "Cannot access before initialization". undefined would be the var behaviour. "is not defined" is the message for a name that does not exist at all.',
      followUps: [
        {
          q: 'Why is this error better than getting undefined?',
          a: 'It fails at the exact line of the mistake, with a clear message. With var, the code carries on with undefined and fails later somewhere else. Or worse, an assertion compares against undefined and passes for the wrong reason.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-07',
      difficulty: 'medium',
      question: 'Two ID makers are created from the same factory. What is logged?',
      code: {
        language: 'javascript',
        code: `function idMaker(prefix) {
  let n = 0;
  return () => \`\${prefix}-\${++n}\`;
}
const orderId = idMaker('ORD');
const userId = idMaker('USR');
orderId(); orderId();
console.log(orderId(), userId());`,
      },
      options: ['ORD-3 USR-1', 'ORD-3 USR-4', 'ORD-1 USR-1', 'ORD-2 USR-1'],
      correct: [0],
      explanation:
        'Each call to idMaker makes a new private n. orderId was called twice before the log, so the third call gives ORD-3. userId has its own n that starts fresh, so it gives USR-1. The answer USR-4 assumes the two share one counter.',
      followUps: [
        {
          q: 'Why is this useful for parallel Playwright tests, and what is its limit?',
          a: 'Each test or worker can get its own ID maker, so IDs never clash inside it. But each worker is a separate process, so two workers can both make ORD-1. Add the worker number, or a random or UUID part, to make IDs unique everywhere.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL of the following that are higher-order functions (functions that take or return a function).',
      options: [
        'Array.prototype.map',
        'A function `between(min, max)` that returns `price => price >= min && price <= max`',
        'Math.max',
        "Playwright's `test('title', async ({ page }) => {...})`",
        'A function `toCents(text)` that returns a number',
      ],
      correct: [0, 1, 3],
      explanation:
        'A higher-order function takes a function as an argument, or returns one. map and Playwright\'s test() take callbacks. between returns a function. Math.max and toCents only take and return plain values, so they are ordinary functions.',
      followUps: [
        {
          q: 'Give an example of a higher-order function you would write for a test framework.',
          a: 'A step wrapper: `async function step(name, fn) { console.log(name); return await fn(); }`. Or a retry helper that takes the action to retry. Playwright already has test.step(name, async () => {...}). It is a higher-order function that groups actions in the report and the trace.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-09',
      difficulty: 'medium',
      question: 'A helper is written as a `var` function expression and called before that line. What is the error?',
      code: {
        language: 'javascript',
        code: `try {
  resetCart();
} catch (e) {
  console.log(e.name + ': ' + e.message);
}
var resetCart = function () { return 'empty'; };`,
      },
      options: [
        'TypeError: resetCart is not a function',
        'ReferenceError: resetCart is not defined',
        "ReferenceError: Cannot access 'resetCart' before initialization",
        'No error; it logs nothing because resetCart returns "empty"',
      ],
      correct: [0],
      explanation:
        'var resetCart is hoisted and starts as undefined. So the name exists, but calling undefined throws a TypeError ("is not a function"). "is not defined" means the name does not exist at all. "before initialization" is the TDZ message for let and const.',
      followUps: [
        {
          q: 'How would you read these three error messages when debugging?',
          a: '"X is not defined": a typo or a missing import. "Cannot access X before initialization": a let, const or class used too early, so check the order. "X is not a function": the name exists but holds something else, often undefined from var hoisting, a wrong import, or a property that is not a method.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-10',
      difficulty: 'hard',
      question: 'What happens when you call `new Timer().start()`?',
      code: {
        language: 'javascript',
        code: `class Timer {
  constructor() { this.ticks = 0; }
  start() {
    [1, 2, 3].forEach(function () {
      this.ticks++;
    });
    return this.ticks;
  }
}
console.log(new Timer().start());`,
      },
      options: [
        "TypeError: Cannot read properties of undefined (reading 'ticks')",
        '3',
        '0',
        'NaN',
      ],
      correct: [0],
      explanation:
        'The regular function passed to forEach gets its own this. Class code is strict and no thisArg is given, so that this is undefined, and this.ticks throws. An arrow callback would keep start\'s this and return 3. NaN would need this to be some object without ticks, as in old non-strict code with the global object.',
      followUps: [
        {
          q: 'Name two fixes besides an arrow function.',
          a: 'Pass a thisArg: `[1, 2, 3].forEach(function () { this.ticks++; }, this)`. Or save it before the callback: `const self = this;`, then use self.ticks inside. The arrow version is the modern, easiest-to-read choice.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-11',
      difficulty: 'hard',
      question: 'A Page Object method is passed to a retry helper as `retry(loginPage.submit, 3)`. Every attempt fails with "Cannot read properties of undefined (reading \'page\')". What is the root cause?',
      options: [
        'The method was detached from its object, so inside it `this` is undefined when retry calls fn()',
        'retry must be declared with async to call class methods',
        'Class methods cannot be passed as arguments in JavaScript',
        'The page fixture was closed before the retry started',
      ],
      correct: [0],
      explanation:
        'Passing loginPage.submit hands over only the function, without its object. this is decided when the function is called. retry calls fn() with nothing before the dot, so this is undefined in strict class code. Methods can be passed as values, async has nothing to do with this, and a closed page gives a different error (target closed). Fix it with `() => loginPage.submit()` or bind.',
      followUps: [
        {
          q: 'Which fix do you prefer, and why?',
          a: 'An arrow wrapper: `retry(() => loginPage.submit(), 3)`. It is clear, it lets you pass arguments in the normal way, and it works for async methods. bind works too, but it is easier to forget and harder to read when there are arguments.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-12',
      difficulty: 'hard',
      question: 'Select ALL functions that are pure (same input gives the same output, and nothing outside changes).',
      code: {
        language: 'javascript',
        code: `const a = (price, qty) => price * qty;
let calls = 0;
const b = (x) => { calls++; return x * 2; };
const c = (user) => ({ ...user, role: 'admin' });
const d = () => \`user_\${Date.now()}@test.com\`;
const e = (list) => { list.push('done'); return list; };`,
      },
      options: ['a', 'b', 'c', 'd', 'e'],
      correct: [0, 2],
      explanation:
        'a depends only on its inputs and changes nothing. c returns a new object and leaves its argument alone. b changes an outside variable (a side effect). d depends on the clock, so the same input can give a different output. e changes its argument. Changed data and hidden inputs make helpers unpredictable in tests.',
      followUps: [
        {
          q: 'How would you make d pure?',
          a: 'Pass the time in as a parameter. Then d becomes (now) => a string built from now, like "user_" + now + "@test.com". The caller (a fixture or the test) chooses the time, and unit tests of d give the same result every run.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL true statements about closures.',
      options: [
        'A closure keeps access to variables of its outer function after that function has returned',
        'A closure stores a snapshot copy of outer variables taken when it was created',
        'Each call to an outer function creates a new set of variables for the closures it returns',
        'Closures only exist for arrow functions',
      ],
      correct: [0, 2],
      explanation:
        'A closure keeps the outer variables after the outer call ends. Every call of the outer function makes a new set of variables, so counters do not share a count. Closures see the live variable, not a snapshot, which explains the var-loop puzzle. Every JavaScript function forms a closure, not only arrows.',
      followUps: [
        {
          q: 'Can closures cause memory problems?',
          a: 'Yes. If a long-lived closure, like an event handler or a cached function, holds a big object, that object cannot be cleaned up from memory. In tests this rarely matters. In long-running apps, leftover listeners holding page elements are a classic memory leak.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-14',
      difficulty: 'expert',
      question: 'Scope puzzle: what does this print?',
      code: {
        language: 'javascript',
        code: `const env = 'qa';
function readEnv() { return env; }
function run() {
  const env = 'prod';
  const inner = () => env;
  return [readEnv(), inner()];
}
console.log(run());`,
      },
      options: ["[ 'qa', 'prod' ]", "[ 'prod', 'prod' ]", "[ 'qa', 'qa' ]", "[ 'prod', 'qa' ]"],
      correct: [0],
      explanation:
        'A function sees the variables where it was written (lexical scope). readEnv was written at the top level, so it sees the outer env ("qa"), even though run calls it. inner was written inside run, so it sees run\'s env ("prod"). Answers with "prod" first assume a function sees its caller\'s variables. JavaScript does not work that way.',
      followUps: [
        {
          q: 'Is `this` decided where a function is written, or where it is called?',
          a: 'For regular functions, this is decided by the call. That is different from variables, which are decided by where the code is written. Arrow functions make this follow the written place too. This contrast is a common interview follow-up, and the root of most this bugs.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-15',
      difficulty: 'expert',
      question: 'A recursive helper walks a nested category tree from an API. Select ALL correct statements.',
      code: {
        language: 'javascript',
        code: `function countLeaves(node) {
  if (!node.children || node.children.length === 0) return 1;
  let total = 0;
  for (const child of node.children) total += countLeaves(child);
  return total;
}
const tree = { children: [{ children: [] }, { children: [{}, {}] }] };
console.log(countLeaves(tree));`,
      },
      options: [
        'It logs 3',
        'The first line is the base case and handles nodes with no children property',
        'It throws RangeError because there is no base case',
        'If the API returned a node whose child is the node itself (a cycle), it would recurse until the stack overflows',
      ],
      correct: [0, 1, 3],
      explanation:
        'The leaves are the node with empty children and the two {} nodes (no children property, which the base case handles). So the result is 3. There is a base case, so this tree gives no RangeError. A node that contains itself (a cycle) would never reach a leaf and would cause "Maximum call stack size exceeded". That is why careful walkers remember visited nodes in a Set.',
      followUps: [
        {
          q: 'How would you protect the walker against cycles?',
          a: 'Pass in a Set of visited nodes. At the start, write `if (seen.has(node)) return 0; seen.add(node);`. A Set checks if it is the exact same object, so this is reliable. structuredClone and many deep-equal libraries do the same inside to handle circular data.',
        },
      ],
    },
  ],
};

export default topic;
