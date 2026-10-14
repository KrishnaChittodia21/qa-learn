import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-functions',
  phase: 'javascript',
  order: 2,
  title: 'Functions, Scope and Closures',
  subtitle:
    'Declarations, expressions and arrows, parameters and return, scope, hoisting and the TDZ, closures, callbacks and higher-order functions, `this`, pure functions and recursion, all tied to writing reusable test helpers.',
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
    'Declaration `function f() {}` is hoisted whole (callable before its line); an expression/arrow assigned to `const` is in the TDZ until its line, and with `var` it is `undefined` (calling it gives "is not a function").',
    'Arrow with braces needs an explicit `return`; `x => x * 2` returns implicitly; return an object as `() => ({ id: 1 })`.',
    'Missing arguments are `undefined`; extras are ignored. Defaults apply only for `undefined` (not `null`). `...rest` collects extras into a real array.',
    'A function without `return` returns `undefined`. Never put the returned value on the line after `return` (automatic semicolon).',
    'Scope is lexical: a function sees variables where it was WRITTEN, not where it is called. let/const are block-scoped; var is function-scoped.',
    'TDZ: let/const/class exist from the start of the block but throw ReferenceError until their declaration runs.',
    'Closure = function + the variables around it when it was created; each call of the outer function makes a fresh, private set (counters, unique-ID generators, cached setup).',
    '`for (var i...)` + callbacks all see the final i; `for (let i...)` gives each iteration its own i.',
    'Higher-order function = takes and/or returns a function (map, filter, test(), retry wrappers). A callback is the function you pass in.',
    '`this` is decided by HOW a regular function is called (obj.method() → obj); arrows have no own `this`, they use the surrounding one. Detached class methods lose `this` → TypeError.',
    'Pure function: same input → same output, no side effects. Make data builders and parsers pure; keep side effects (browser, network, files) at the edges.',
    'Recursion needs a base case; without one you get `RangeError: Maximum call stack size exceeded`.',
  ],
  sections: [
    {
      heading: 'What a function is: a reusable test step',
      body: `**Intuition:** a function is a named, reusable recipe. In manual testing you write "Login as standard_user" once in a test case and reuse it in 40 others; in code, that reusable step is a function.

**Anatomy**
- **Name:** what the step does (\`loginAs\`, \`buildUser\`, \`toCents\`).
- **Parameters:** placeholders listed in the definition (\`username\`, \`password\`).
- **Arguments:** actual values passed at the call (\`'standard_user'\`, \`'secret_sauce'\`).
- **Body:** the statements that run.
- **Return value:** what the call evaluates to (\`undefined\` if there is no \`return\`).

Defining a function does nothing visible; **calling** it (\`name(...)\`) runs it. Forgetting the parentheses gives you the function itself, not its result, a common beginner bug: \`console.log(getTitle)\` prints \`[Function: getTitle]\`.

**Why it matters for Playwright:** every test is a function you hand to \`test('name', async ({ page }) => { ... })\`. Page Object methods, fixtures, helpers and hooks are all functions. If you are comfortable writing small functions with clear inputs and outputs, a framework is just many of them arranged neatly.

**In interviews, say this:** "I extract repeated steps into small functions with clear parameters and return values, so a change in the login flow is fixed in one place, not in 40 tests."`,
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

// No return statement → the call evaluates to undefined
function logStep(step) {
  console.log(\`STEP: \${step}\`);
}
const result = logStep('open login page'); // → STEP: open login page
console.log(result); // → undefined`,
        },
      ],
      keyPoints: [
        'Parameters are in the definition; arguments are the values you pass.',
        'No `return` → `undefined`.',
        'Every Playwright test body, hook, fixture and page-object method is a function.',
      ],
      source: 'javascript.info: Functions; Marijn Haverbeke: Eloquent JavaScript, Ch 3',
    },
    {
      heading: 'Declarations vs expressions vs arrow functions',
      body: `**Intuition:** three ways to write the same recipe card: a card pinned on the wall from the start (declaration), a card you write and then file under a label (expression), and a short sticky-note version (arrow).

| Form | Syntax | Hoisted? | Own \`this\`? | Typical use in tests |
|---|---|---|---|---|
| Declaration | \`function login(u) { ... }\` | Yes, whole function | Yes | Top-level helpers |
| Function expression | \`const login = function (u) { ... };\` | Only the variable (TDZ with const) | Yes | Rare today |
| Arrow function | \`const login = (u) => { ... };\` | Only the variable (TDZ with const) | **No**, inherits | Callbacks, test bodies, short helpers |

**Arrow shortcuts**
- One parameter: parentheses optional (\`n => n * 2\`).
- Expression body returns automatically (\`n => n * 2\`).
- Block body \`{ }\` needs \`return\` (\`n => { return n * 2; }\`).
- Returning an object literal needs parentheses: \`() => ({ id: 1 })\`; without them the braces are read as a block.

**Arrows are not just shorter:** they have no own \`this\` and no \`arguments\` object, and cannot be used with \`new\`. That makes them perfect for callbacks inside methods (they keep the method's \`this\`) and wrong as object methods that need \`this\`.

**What you will see in Playwright:** \`test('adds item', async ({ page }) => { ... })\` is an async arrow function whose single parameter is destructured from the fixtures object.`,
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
const makeUserWrong = (name) => { name: name };   // braces = block, "name:" is a label
const makeUser = (name) => ({ name });            // parentheses = object
console.log(makeUserWrong('qa'));  // → undefined
console.log(makeUser('qa'));       // → { name: 'qa' }

// Functions are values: store, pass, return
const steps = [double1, double3];
console.log(steps.length, typeof steps[0]); // → 2 function`,
        },
      ],
      keyPoints: [
        'Declarations are hoisted; expressions and arrows are not callable before their line.',
        'Arrow + braces = needs `return`; arrow returning an object needs `({ })`.',
        'Arrows have no own `this`: great for callbacks, bad for object methods.',
      ],
      source: 'javascript.info: Function expressions, Arrow functions basics; MDN: Arrow function expressions',
    },
    {
      heading: 'Parameters: defaults, rest and missing arguments',
      body: `**Intuition:** parameters are the input fields of your helper. JavaScript is lenient: it does not complain if you fill in too few or too many fields, so you must design for both.

**Rules**
- **Missing argument** → the parameter is \`undefined\`.
- **Extra arguments** → silently ignored (still visible in the old \`arguments\` object of regular functions).
- **Default values** \`(timeout = 5000)\` apply when the argument is **\`undefined\`** (missing or explicitly undefined), **not** when it is \`null\`, \`0\` or \`''\`. Defaults are evaluated at call time and can use earlier parameters: \`(a, b = a * 2)\`.
- **Rest parameter** \`(...names)\` gathers remaining arguments into a real array; it must be last.
- **Options object** pattern: for more than 2 or 3 inputs, accept one object and destructure it, \`function createBooking({ firstname, lastname, totalprice = 100 })\`. Callers name what they pass, order no longer matters, and Playwright uses this style everywhere (\`{ name: 'Login', exact: true }\`).

**Common mistake:** relying on \`||\` for defaults inside the body (\`retries = retries || 2\`), which overrides a legitimate 0. Use a default parameter or \`??\`.`,
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
        'Defaults fire only for `undefined`.',
        'Rest parameter is a real array and must be last.',
        'Prefer an options object for 3+ parameters, as Playwright does.',
      ],
      source: 'javascript.info: Functions (default values), Rest parameters and spread syntax; MDN: Default parameters',
    },
    {
      heading: 'Return values and early returns',
      body: `**Intuition:** \`return\` is the function handing you the answer and leaving the room. Nothing after it runs.

**Rules**
- \`return value;\` ends the function and makes the call evaluate to \`value\`.
- \`return;\` or falling off the end returns \`undefined\`.
- **Early returns** (guard clauses) keep helpers flat: check the bad cases first and leave.
- **ASI trap:** a line break right after \`return\` inserts a semicolon, so \`return\` on one line and \`{ ok: true }\` on the next returns \`undefined\`.
- A function returns **one** value; to return several, return an object (\`{ status, body }\`) or an array.

**For testers:** a helper that "checks" something should *return* a result (or throw), not just \`console.log\` it. A logged mismatch does not fail a test; a returned \`false\` that you assert on, or a thrown error, does.`,
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

// ASI trap: a newline after return ends the statement
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
        'Use guard clauses to reject bad input early.',
        'Never break the line right after `return`.',
        'Checks should return a value or throw; logging does not fail a test.',
      ],
      source: 'javascript.info: Functions (returning a value); Marijn Haverbeke: Eloquent JavaScript, Ch 3',
    },
    {
      heading: 'Scope: global, function and block',
      body: `**Intuition:** scope is the set of rooms in a building. From inside a room you can see into the corridor and the lobby (outer scopes), but people in the lobby cannot see into your room.

**Kinds of scope**
- **Global:** declared outside any function or block; visible everywhere in that file/module. Keep it minimal: global mutable state is what makes tests depend on each other.
- **Function scope:** parameters and variables declared inside a function (including \`var\`).
- **Block scope:** \`let\`/\`const\` inside \`{ }\` of an \`if\`, \`for\`, or bare block.

**Lexical (static) scope:** a function's view is fixed by **where it is written**, not by where it is called. When JavaScript looks up a name, it searches the current scope, then the enclosing one, outward to global. Kyle Simpson describes this as nested "buckets"; Eloquent JavaScript calls it each local scope seeing all the scopes that contain it.

**Shadowing:** an inner variable with the same name hides the outer one inside that scope. Legal, but confusing in tests (\`const page\` inside a helper shadowing the fixture \`page\`).

**For testers:** a variable declared in one Playwright \`test()\` is invisible to another test, which is good: tests should not share state. Data needed by several tests belongs in a fixture or a factory function, not a top-level \`let\` that tests mutate.`,
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
        'Lookup goes from the inner scope outward; outer code cannot see inner variables.',
        'Scope is fixed where the function is written (lexical).',
        'Avoid shared mutable globals between tests.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Scope & Closures, Ch 1-3; javascript.info: Variable scope, closure",
    },
    {
      heading: 'Hoisting and the temporal dead zone',
      body: `**Intuition:** before running a scope, JavaScript reads it once and registers every declaration, like a teacher taking the register before class. What each name holds at the start of class differs by declaration type.

| Declaration | Registered at start? | Value before its line | Effect of using it early |
|---|---|---|---|
| \`function f() {}\` | Yes | The whole function | Works |
| \`var x = 1\` | Yes | \`undefined\` | Silently \`undefined\` |
| \`let\` / \`const\` / \`class\` | Yes | *Uninitialised* (TDZ) | \`ReferenceError: Cannot access 'x' before initialization\` |
| \`var f = function () {}\` | Yes (as var) | \`undefined\` | \`TypeError: f is not a function\` |
| \`const f = () => {}\` | Yes (TDZ) | Uninitialised | \`ReferenceError\` |

**Temporal dead zone (TDZ):** the time between entering the block and executing the \`let\`/\`const\` line. It is "temporal" because it is about *when* code runs, not where it is written: a function declared above can safely reference a \`const\` below, as long as it is **called** after that line.

**Practical rules:** declare before use; put helper function declarations wherever reads best (they are hoisted); never rely on \`var\` hoisting.

**In interviews, say this:** "Declarations are processed before execution. Function declarations are fully available, var is initialised to undefined, and let/const are hoisted but stay uninitialised in the TDZ, so early access throws instead of silently giving undefined."`,
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
        'Function declarations: fully hoisted.',
        '`var`: hoisted as undefined. `let`/`const`: TDZ → ReferenceError.',
        'TDZ depends on when code runs, not on line order alone.',
      ],
      source: 'MDN: Hoisting, Temporal dead zone; javascript.info: The old "var"; OpenReplay: 10 JS interview questions',
    },
    {
      heading: 'Closures: functions that remember',
      body: `**Intuition:** a closure is a function carrying a backpack. When a function is created inside another, it packs the surrounding variables into its backpack and keeps them even after the outer function has finished.

**Definition:** a closure is the combination of a function and the lexical environment in which it was created. In JavaScript **every** function is a closure; it becomes interesting when an inner function outlives the call that created it (returned, stored, passed as a callback).

**Key facts**
1. The inner function keeps a **live reference** to the variables, not a snapshot. If the variable changes, the function sees the new value.
2. **Each call** of the outer function creates a **new** environment, so two counters made by the same factory are independent.
3. Variables in the backpack are **private**: nothing outside can read or change them except through the returned functions.

**Testing uses**
- **Unique ID / data generators:** \`const nextEmail = makeEmailFactory('checkout')\` → \`checkout_1@test.com\`, \`checkout_2@test.com\`...
- **Run-once setup / caching:** compute a token once and return the cached value afterwards (the idea behind worker-scoped fixtures).
- **Configured helpers:** \`const inRange = between(10, 20)\` returns a predicate for filtering prices.
- Playwright itself: the callback you pass to \`test()\` closes over variables like \`baseURL\` or test data declared above it.

**The loop classic:** with \`for (var i...)\` and callbacks, all callbacks share one \`i\` (function-scoped) and see its final value. \`for (let i...)\` creates a new binding per iteration, so each callback remembers its own.`,
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
        'Closure = function + the scope it was born in, kept alive after the outer call ends.',
        'Each factory call creates a separate, private environment.',
        'Closures capture variables live, not as snapshots.',
        'Use `let` in loops that create callbacks.',
      ],
      source: "javascript.info: Variable scope, closure; MDN: Closures; Kyle Simpson: You Don't Know JS Yet: Scope & Closures, Ch 7",
    },
    {
      heading: 'Callbacks and higher-order functions',
      body: `**Intuition:** a callback is a note you hand someone saying "when you are done, do this". A higher-order function is the person who accepts such notes (or writes new ones).

**Definitions**
- **Callback:** a function passed as an argument to be called later by someone else.
- **Higher-order function (HOF):** a function that takes a function as an argument and/or returns a function.

**You already use them:** \`[1, 2, 3].map(n => n * 2)\` (map is a HOF, the arrow is the callback), \`setTimeout(fn, 1000)\`, \`page.on('dialog', handler)\`, and \`test('title', async ({ page }) => {...})\`, where \`test\` is a HOF and your test body is the callback.

**Writing your own HOFs** is how you remove repetition in test helpers:
- \`withStep(name, fn)\`: logs before/after any action.
- \`retry(fn, attempts)\`: calls \`fn\` until it stops throwing.
- \`between(min, max)\`: returns a predicate (a function that answers true/false).

**Common mistakes:** passing the *result* instead of the function (\`retry(login(), 3)\` calls login immediately); and the \`this\` loss when passing a method (\`retry(page.login, 3)\`), covered next.

(Array HOFs like map/filter/reduce get a full topic of their own, and asynchronous callbacks are covered with promises.)`,
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
        'HOFs remove repetition: logging, retrying, predicates.',
      ],
      source: 'Marijn Haverbeke: Eloquent JavaScript, Ch 5 Higher-Order Functions; MDN: Callback function',
    },
    {
      heading: '`this` basics: method calls, arrows and lost this',
      body: `**Intuition:** \`this\` is the word "me" in a sentence. Who "me" refers to depends on who is speaking right now, i.e. on **how the function is called**, not where it was written. Arrow functions are the exception: they never say "me"; they repeat whatever "me" meant in the surrounding code.

**Rules for regular functions and methods**

| Call style | \`this\` is |
|---|---|
| \`obj.method()\` | \`obj\` (the thing before the dot) |
| \`const f = obj.method; f()\` | \`undefined\` in strict mode (classes, ES modules), the global object in old sloppy scripts |
| \`new LoginPage()\` | The new object |
| \`fn.call(x)\` / \`fn.bind(x)\` | \`x\` |
| Arrow function | Whatever \`this\` was where the arrow was **written** |

**Why testers meet this:** Page Objects are classes, and their methods use \`this.page\`, \`this.usernameInput\`. Two classic failures:
1. **Passing a method as a callback** (\`retry(loginPage.submit, 3)\`): the method is detached from its object, so \`this\` is undefined → \`TypeError: Cannot read properties of undefined\`. Fix: \`retry(() => loginPage.submit(), 3)\` or \`.bind(loginPage)\`.
2. **Regular function as an inner callback inside a method** (\`items.forEach(function () { this.count++ })\`): the inner function gets its own \`this\`. Fix: use an arrow, which inherits the method's \`this\`.

**The other direction:** do *not* write object methods as arrows (\`open: () => this.url\`); the arrow takes \`this\` from outside the object, not the object itself.`,
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
        'Regular functions: `this` = object before the dot at call time.',
        'Arrows: inherit `this` from where they are written.',
        'Passing `obj.method` as a callback detaches it; wrap it in an arrow or bind.',
      ],
      source: "javascript.info: Object methods, \"this\"; MDN: this; Kyle Simpson: You Don't Know JS Yet: Objects & Classes (this)",
    },
    {
      heading: 'Pure functions and side effects',
      body: `**Intuition:** a pure function is a calculator: same buttons pressed, same answer, and pressing them changes nothing else in the room. An impure function is a vending machine: it changes stock, takes money, and might answer differently tomorrow.

**Pure function:** (1) output depends only on its inputs, (2) no side effects: no changing arguments or outside variables, no I/O (network, file, console, browser), no randomness or clock.

**Side effects are necessary** (a test must click and navigate), but they should be **at the edges**. Eloquent JavaScript makes the same point: pure functions are easy to test and combine; side effects are needed but harder to reason about.

**Why testers love pure helpers**

| Helper | Pure? | Why it matters |
|---|---|---|
| \`toCents('$29.99')\` | Yes | Unit-testable in milliseconds, no browser |
| \`buildUser(overrides)\` returning a new object | Yes (if it does not touch shared data) | No cross-test pollution |
| \`addTax(cart)\` that changes \`cart.total\` in place | No (mutates argument) | Tests that reuse \`cart\` get wrong totals |
| \`uniqueEmail()\` using \`Date.now()\` | No (clock) | Fine, but inject the time to make it testable |

**Common mistake:** mutating an argument (\`user.role = 'admin'\`) inside a "builder". Every later test using the same object inherits the change: a classic order-dependent flaky test.`,
      code: [
        {
          language: 'javascript',
          title: 'Impure vs pure data builder',
          code: `const defaultUser = { name: 'standard_user', role: 'customer' };

// Impure: mutates the shared default
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
        'Pure = same input, same output, no side effects.',
        'Return new objects instead of mutating arguments.',
        'Inject time/randomness to make helpers deterministic and unit-testable.',
      ],
      source: 'Marijn Haverbeke: Eloquent JavaScript, Ch 3 (Functions and side effects)',
    },
    {
      heading: 'Recursion basics',
      body: `**Intuition:** recursion is Russian dolls: to open the big doll you open a smaller one, and so on until you reach the smallest doll, which you simply hold (the base case).

**Structure of every recursive function**
1. **Base case:** an input simple enough to answer directly (stops the recursion).
2. **Recursive case:** reduce the problem and call the function on the smaller piece.

**The call stack:** each call waits for the inner call to return, piling up frames. With no base case (or one that is never reached) the stack overflows: \`RangeError: Maximum call stack size exceeded\`.

**When testers meet recursion**
- Walking **nested data**: a JSON API response with nested categories, a site menu tree, a folder of test files.
- Deep comparison of two objects (the Objects topic builds one).
- Interview classics: factorial, sum of digits, reverse a string, Fibonacci.

**Recursion vs loops:** anything recursive can be written with a loop; loops are usually faster and cannot overflow the stack. Recursion reads better for tree-shaped data. Eloquent JavaScript's advice applies: write it clearly first and only optimise when it matters.`,
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
        'Always write the base case first.',
        'Each call adds a stack frame; missing base case → RangeError.',
        'Recursion fits nested/tree data; loops fit flat repetition.',
      ],
      source: 'javascript.info: Recursion and stack; Marijn Haverbeke: Eloquent JavaScript, Ch 3 (Recursion)',
    },
  ],
  codeChallenges: [
    {
      id: 'js-functions-cc-1',
      title: 'Fix a test-data factory that leaks state and returns nothing',
      context:
        'A shared helper module creates users for registration tests. Tests pass alone but fail when run together: emails collide, a test that expected a "customer" sometimes gets an "admin", and `buildAddress` returns undefined.',
      task: 'Fix the helpers so each test gets fresh, independent data: no shared mutable globals, no mutation of the defaults, correct return values and correct default handling. The tests call `makeTestData(overridesList, city)`, which simulates one fresh test run: it builds one user per overrides object (emails `user1@test.com`, `user2@test.com`, … restarting at 1 on every call) and returns `{ users, address, defaultRole }`, where `address` is `{ city }` and `defaultRole` is the role in the shared defaults afterwards (must still be "customer"). Press Run to check your fix.',
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
        'Does `var user = defaults` create a new object? What is shared between `a` and `b`?',
        'Look at the arrow function body: is `{ city: city, ... }` an object or a block?',
        'Put the counter inside a closure (a factory) and use `??` or spread order for defaults instead of `||`.',
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
1. **Shared object:** \`var user = defaults\` copies the *reference*, so every user was the same object and \`role: 'admin'\` leaked into later tests. Spreading \`{ ...DEFAULTS, ...overrides }\` creates a new object per call; \`Object.freeze\` makes accidental writes to the defaults fail loudly in strict code.
2. **Global counter:** moved into a closure created by \`createUserBuilder\`. Each builder has private state; nothing outside can reset or corrupt it, and you can create one per worker with a different prefix to avoid collisions in parallel runs.
3. **\`|| true\` bug:** \`false || true\` is \`true\`, so opting out of the newsletter was impossible. Spread order (overrides last) lets an explicit \`false\` win.
4. **Arrow returning an object:** \`=> { city: city }\` is parsed as a block containing a label (\`city:\`) and an expression, so the arrow returns \`undefined\`. Wrap the object in parentheses.
5. **\`var\` → \`const\`/\`let\`** and a default parameter \`overrides = {}\` so \`buildUser()\` works with no arguments.

The tests call \`makeTestData\` several times in the same page load, exactly like several tests sharing one module: with the global counter the second call starts at \`user3\`, and with the shared defaults an earlier \`role: 'admin'\` leaks into later runs.`,
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
          q: 'How would you guarantee unique emails across parallel Playwright workers?',
          a: 'Include the worker index in the prefix, e.g. create the builder in a worker-scoped fixture and pass a prefix such as "w" + workerInfo.workerIndex + "_", or add a random part with crypto.randomUUID(). A module-level counter restarts at 0 in every worker process, so it alone is not unique across workers.',
        },
        {
          q: 'Is the spread copy enough if DEFAULTS had a nested address object?',
          a: 'No. Spread is a shallow copy: the nested object would still be shared, and `user.address.city = "X"` would change it for everyone. Either build nested objects freshly inside the function, or deep-copy with structuredClone(DEFAULTS) before applying overrides.',
        },
      ],
    },
    {
      id: 'js-functions-cc-2',
      title: 'Repair a page-object helper that loses `this`',
      context:
        'A simplified Page Object (no browser here, a fake `page` that records actions) works when tests call `loginPage.login()` directly, but crashes when passed to the `retry` helper, and the `logAll` method never counts anything.',
      task: 'Make `retry(loginPage.login, 3)`-style usage safe, fix `logAll`, and make `retry` fail loudly instead of returning undefined. The tests call `runLoginFlow(attempts, failures)`: it creates a fresh `LoginPage` on a `FakePage` whose login button throws for the first `failures` clicks, logs in through `retry`, and returns `{ result, actions, counted }`: `result` is `\'done\'` or the error message `\'failed after N attempts\'`, `actions` the recorded page actions, `counted` the value of `logAll()`. Press Run to check your fix.',
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
        'What is `this` inside `login` when `retry` calls it as plain `fn()`?',
        'Inside `logAll`, which function owns the `this` used in `this.logged++`?',
        'Arrow functions inherit `this`; regular functions get it from the call. Pick the right one for each place.',
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
1. **Detached method:** \`retry(loginPage.login, 2)\` passes the function without its object. Class bodies are strict, so the plain call \`fn()\` gives \`this === undefined\` and \`this.page\` throws. Wrapping in an arrow (\`() => loginPage.login()\`) or using \`bind\` keeps the receiver.
2. **Callback \`this\`:** the \`function (a) {...}\` passed to \`forEach\` gets its own \`this\` (undefined), so \`this.logged\` crashed. An arrow callback inherits \`logAll\`'s \`this\`.
3. **\`retry\` swallowing failure:** after all attempts it returned \`undefined\`, which a caller might treat as success. It now throws a clear error.
4. **The \`describe\` arrow property** was harmless here but was removed: per-instance arrow properties are a workaround people add when they do not understand \`this\`; a normal method plus correct calling style is clearer.`,
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
          q: 'Some teams define every Page Object method as an arrow class field (login = async () => {...}). Pros and cons?',
          a: 'Pro: methods can be passed around without losing `this`. Cons: each instance gets its own copy of every function (more memory), they are not on the prototype so subclasses cannot call super.login(), and it hides the calling-style issue rather than teaching it. Most Playwright POMs use normal methods and call them as page.method().',
        },
        {
          q: 'Why does Playwright code rarely hit this problem in practice?',
          a: 'Because tests usually call methods directly on the object, `await loginPage.login(user)`, and fixtures pass instances, not detached methods. The problem appears with generic helpers (retry, step wrappers, event handlers) that receive a function, which is exactly where you should wrap the call in an arrow.',
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
        'Hoisting difference between declaration and expressions',
        'Arrow syntax rules (implicit return, object literal in parentheses)',
        'Arrow functions have no own this/arguments',
        'Practical guidance tied to tests and page objects',
      ],
      modelAnswer: `**Declaration:** \`function login(user) { ... }\`. Hoisted completely, so it can be called above its definition. Has its own \`this\` and \`arguments\`.

**Expression:** \`const login = function (user) { ... };\`. The function is created when that line runs; with \`const\` the name is in the temporal dead zone before it, with \`var\` it is \`undefined\` (calling it gives "login is not a function").

**Arrow:** \`const login = (user) => { ... };\`. Same hoisting as an expression, shorter syntax, implicit return for single expressions (\`n => n * 2\`), and **no own \`this\`, \`arguments\` or \`new\`**: it uses \`this\` from where it is written.

**How I use them in a Playwright project:**
- **Test bodies and callbacks:** arrows. \`test('adds to cart', async ({ page }) => { ... })\`, \`.filter(p => p > 10)\`, \`page.on('dialog', d => d.accept())\`.
- **Page Object methods:** normal class methods (\`async login(user, pass) { ... }\`) because they need \`this.page\`.
- **Utility helpers** (\`toCents\`, \`buildUser\`): either a declaration or a \`const\` arrow; teams usually pick one style for consistency.

**Gotchas I watch for:** an arrow with braces and no \`return\` returns \`undefined\`; returning an object needs \`() => ({ ... })\`; and writing an object method as an arrow makes \`this\` point outside the object.`,
      followUps: [
        {
          q: 'Can an arrow function be used as a constructor?',
          a: 'No. Arrow functions have no [[Construct]] behaviour and no prototype property, so `new Arrow()` throws a TypeError ("is not a constructor"). Use a class or a regular function when you need new. In tests this rarely matters because Page Objects are classes.',
        },
        {
          q: 'What does `arguments` refer to inside an arrow function?',
          a: 'Arrows do not have their own arguments object; the name refers to the arguments of the nearest enclosing regular function (or is a ReferenceError at module top level). Modern code uses rest parameters (...args) instead, which work the same in both kinds of function and give a real array.',
        },
      ],
      pitfalls: [
        'Saying arrows are "just shorter syntax" with no behavioural difference.',
        'Claiming expressions are hoisted like declarations.',
        'Recommending arrow functions for object methods that use this.',
      ],
    },
    {
      id: 'js-functions-iq-02',
      difficulty: 'medium',
      question: 'Explain closures in your own words and give a practical example from test automation.',
      whatInterviewerLooksFor: [
        'Correct definition: function + lexical environment, survives the outer call',
        'Each call creates a fresh environment',
        'Live reference, not a copy',
        'A realistic testing use case, not just a counter',
      ],
      modelAnswer: `**Definition:** a closure is a function together with the variables from the scope where it was created. When an inner function is returned or stored, it keeps access to those variables even after the outer function has finished. In JavaScript every function forms a closure; it becomes visible when the inner function outlives the outer call.

**Minimal example:**
\`function makeCounter() { let count = 0; return () => ++count; }\`
\`const next = makeCounter(); next(); next();\` → 1, then 2. \`count\` is private: nothing else can touch it. A second \`makeCounter()\` gets its own \`count\` starting at 0.

**Test-automation examples:**
1. **Unique test data:** \`makeEmailFactory('checkout')\` returns a function producing \`checkout_1@test.com\`, \`checkout_2@test.com\`, with the counter hidden in the closure.
2. **Run-once / cached setup:** \`once(getAuthToken)\` calls the API the first time and returns the cached token afterwards. Playwright's worker-scoped fixtures follow the same idea: set up once, reuse.
3. **Configured predicates:** \`between(10, 30)\` returns \`price => price >= 10 && price <= 30\`, used to filter product prices.
4. **Every test body:** the async arrow passed to \`test()\` closes over constants declared at the top of the spec file.

**Things to know:** closures capture variables **live** (if the variable changes later, the closure sees it), which explains the \`for (var i...)\` puzzle where all callbacks see the final value; \`let\` in the loop gives each iteration its own binding. Closures also keep memory alive, so a long-lived closure holding a large object prevents it from being garbage-collected.`,
      followUps: [
        {
          q: 'Why does the classic loop with var and setTimeout print 3, 3, 3?',
          a: 'var i is function-scoped, so there is a single i shared by all three callbacks. By the time the timers fire, the loop has finished and i is 3. Each callback closes over the same variable, not a copy of its value at that moment. Using let creates a new binding per iteration, so the callbacks print 0, 1, 2.',
        },
        {
          q: 'How are closures related to data privacy?',
          a: 'Variables inside the outer function are reachable only through the functions it returns, so they act like private fields. Before classes had #private fields, the module pattern used closures to hide internal state. In test helpers this keeps counters or caches from being reset by accident from other tests.',
        },
      ],
      pitfalls: [
        'Defining a closure as "a function inside a function" without mentioning retained scope.',
        'Saying a closure copies the values at creation time.',
        'Only giving the textbook counter with no real use.',
      ],
    },
    {
      id: 'js-functions-iq-03',
      difficulty: 'medium',
      question: 'What is hoisting? Predict the output: `console.log(a); var a = 1; console.log(b); let b = 2; sayHi(); function sayHi() { console.log("hi"); }`',
      whatInterviewerLooksFor: [
        'Explains the two-phase model (declarations registered first)',
        'var → undefined, let/const → TDZ ReferenceError, function → callable',
        'Notices execution stops at the first uncaught error',
      ],
      modelAnswer: `**Hoisting** is the observable effect of JavaScript processing declarations before executing a scope. Nothing physically moves; the engine registers names first, then runs statements top to bottom.

- **Function declarations** are registered with their full body, so they are callable anywhere in the scope.
- **\`var\`** is registered and initialised to \`undefined\`.
- **\`let\` / \`const\` / \`class\`** are registered but **uninitialised** until their line runs (the temporal dead zone). Any access before that throws \`ReferenceError\`.

**Tracing the snippet:**
1. \`console.log(a)\` → \`undefined\` (var hoisted, value not yet assigned).
2. \`var a = 1\` assigns 1.
3. \`console.log(b)\` → \`ReferenceError: Cannot access 'b' before initialization\`. **Execution stops here** because the error is uncaught.
4. \`sayHi()\` never runs. If the \`b\` line were removed, it would print \`hi\`, since function declarations are hoisted whole.

**So the output is:** \`undefined\`, then a ReferenceError.

**Why the TDZ exists:** it turns a silent bug (using a variable before it has its value) into a loud one. In test code, that means using a \`const expectedTotal\` before computing it fails immediately with a clear message instead of comparing against \`undefined\`.`,
      followUps: [
        {
          q: 'Is `typeof b` safe inside the TDZ?',
          a: 'No. typeof is safe for undeclared variables (it returns "undefined"), but for a let/const/class in its TDZ it throws a ReferenceError, because the name exists in the scope and is uninitialised. This is a nice trick question that separates "not declared" from "declared but not yet initialised".',
        },
        {
          q: 'Are class declarations hoisted?',
          a: 'Yes, like let: the name is registered but stays in the TDZ until the class line executes, so `new LoginPage()` above the class declaration throws a ReferenceError. That is why Page Object classes are imported or declared before use.',
        },
      ],
      pitfalls: [
        'Printing "hi" despite the uncaught ReferenceError earlier.',
        'Saying let is not hoisted at all.',
        'Describing hoisting as code being physically moved to the top.',
      ],
    },
    {
      id: 'js-functions-iq-04',
      difficulty: 'hard',
      question: 'How does `this` work in JavaScript, and how is it different in arrow functions? Describe a bug it can cause in a Page Object.',
      whatInterviewerLooksFor: [
        'this depends on the call site for regular functions',
        'Arrows inherit this lexically',
        'Concrete detached-method bug and fixes (arrow wrapper, bind)',
        'Mentions strict mode/classes giving undefined',
      ],
      modelAnswer: `**Regular functions:** \`this\` is decided at **call time** by how the function is called:
- \`obj.method()\` → \`this\` is \`obj\`.
- \`new Ctor()\` → the new object.
- \`fn.call(x)\`, \`fn.apply(x)\`, \`fn.bind(x)\` → \`x\`.
- Plain call \`fn()\` → \`undefined\` in strict mode (classes and ES modules are always strict), the global object in old sloppy scripts.

**Arrow functions** have no own \`this\`; they use the \`this\` of the scope where they were **defined**, permanently. \`bind\`/\`call\` cannot change it.

**Page Object bug:**
\`class LoginPage { constructor(page) { this.page = page; } async submit() { await this.page.getByRole('button', { name: 'Login' }).click(); } }\`

If a helper receives the method, like \`await retry(loginPage.submit, 3)\`, the helper calls \`fn()\` with no receiver. Inside \`submit\`, \`this\` is \`undefined\`, so \`this.page\` throws \`TypeError: Cannot read properties of undefined (reading 'page')\`.

**Fixes:** \`retry(() => loginPage.submit(), 3)\` (my preferred: obvious and readable), or \`retry(loginPage.submit.bind(loginPage), 3)\`.

**The opposite bug:** a callback inside a method written as \`function () { this.count++ }\` gets its own \`this\`. Using an arrow there inherits the method's \`this\`. Rule of thumb: **methods as regular methods, callbacks inside them as arrows.**`,
      followUps: [
        {
          q: 'What does bind return, and can you rebind a bound function?',
          a: 'bind returns a new function whose this is permanently set to the given value (optionally with pre-filled arguments). Calling bind again on that result does not change this; the first binding wins. Arrow functions ignore bind for this entirely.',
        },
        {
          q: 'What is this inside a Playwright test body?',
          a: 'Nothing useful: test bodies are usually arrow functions, so this is inherited from module scope (undefined in ES modules). Playwright passes everything you need as fixtures in the first argument ({ page, request }) and testInfo as the second, so tests never rely on this.',
        },
      ],
      pitfalls: [
        'Saying this refers to the function itself.',
        'Saying this is fixed where a regular function is defined.',
        'Recommending arrow functions for all methods without trade-offs.',
      ],
    },
    {
      id: 'js-functions-iq-05',
      difficulty: 'hard',
      question: 'Write a function `once(fn)` that returns a new function which calls `fn` only the first time and returns the cached result on later calls. Where could this help in a test suite?',
      whatInterviewerLooksFor: [
        'Uses a closure with a flag and cached value',
        'Forwards arguments and the return value',
        'Handles fn returning undefined (flag, not value check)',
        'Relates to one-time setup / fixtures',
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

**Walkthrough:**
- \`called\` and \`result\` live in the closure, private to this wrapper.
- I use a **separate flag** rather than \`if (result === undefined)\`, because \`fn\` might legitimately return \`undefined\` and must still not run twice.
- \`...args\` forwards any arguments; \`fn.apply(this, args)\` also forwards \`this\` in case the wrapper is used as a method.
- Setting \`called = true\` **before** calling \`fn\` prevents re-entry if \`fn\` indirectly calls the wrapper again (a design choice to mention).

**Usage:** \`const init = once(() => { console.log('seeding'); return 42; }); init(); init();\` logs "seeding" once and returns 42 both times.

**Test-suite uses:**
- Fetching an auth token or seeding reference data once per worker.
- Lazy creation of an expensive object (a database client) on first use.
- In Playwright, the built-in answer is a **worker-scoped fixture** or a **setup project** with \`storageState\`; \`once\` is the plain-JS version of the same idea and a common interview stepping stone.

**Async note:** for an async \`fn\`, caching the **promise** (not the resolved value) makes concurrent callers share the same in-flight request.`,
      followUps: [
        {
          q: 'What if fn throws on the first call? Should later calls retry?',
          a: 'With the flag set before calling fn, a throw leaves called = true and result undefined, so later calls silently return undefined, which is bad. Better: set the flag only after success (wrap in try, set called in the success path), so a failed setup is retried, or cache and rethrow the error so every caller sees the failure.',
        },
        {
          q: 'How would you write memoize, which caches per argument?',
          a: 'Keep a Map from key to result: `const cache = new Map(); return (arg) => { if (!cache.has(arg)) cache.set(arg, fn(arg)); return cache.get(arg); }`. For multiple arguments build a key such as JSON.stringify(args). Use has() rather than checking the value so undefined results are cached too.',
        },
      ],
      pitfalls: [
        'Checking `result === undefined` instead of using a flag.',
        'Not forwarding arguments or the return value.',
        'Using a global variable instead of a closure.',
      ],
    },
    {
      id: 'js-functions-iq-06',
      difficulty: 'medium',
      question: 'Write a recursive function that returns the sum of the digits of a non-negative integer (e.g. 4096 → 19). Then explain the base case and what happens without one.',
      context: 'A small coding question used in automation screening rounds to check basic problem solving before Playwright questions.',
      whatInterviewerLooksFor: [
        'Correct base case and reduction step',
        'Uses % 10 and Math.floor(n / 10) (or string conversion)',
        'Explains call stack and RangeError',
        'Offers an iterative alternative',
      ],
      modelAnswer: `**Recursive solution:**

\`function sumDigits(n) {\`
\`  if (n < 10) return n;                         // base case: one digit\`
\`  return (n % 10) + sumDigits(Math.floor(n / 10)); // last digit + rest\`
\`}\`

**Trace for 4096:** \`6 + sumDigits(409)\` → \`9 + sumDigits(40)\` → \`0 + sumDigits(4)\` → \`4\`. Unwinding: 4 + 0 + 9 + 6 = **19**.

**Base case:** the smallest input we can answer directly (a single digit is its own sum). Every recursive call must move **towards** it; here \`Math.floor(n / 10)\` drops one digit per call, so it always terminates for non-negative integers.

**Without a base case:** the function keeps calling itself; each call adds a frame to the call stack until the engine's limit is hit: \`RangeError: Maximum call stack size exceeded\`. The same happens if the reduction step is wrong (e.g. \`n / 10\` without \`Math.floor\` produces decimals that never get below the base case in the expected way, or an off-by-one never reaches it).

**Alternatives I would mention:**
- Iterative: \`let s = 0; while (n > 0) { s += n % 10; n = Math.floor(n / 10); } return s;\` (no stack growth).
- String-based: \`String(n).split('').reduce((s, d) => s + Number(d), 0)\`, readable but converts types.

**Testing my own function:** 0 → 0, 7 → 7, 10 → 1, 4096 → 19, 99999 → 45; and I would clarify the contract for negatives and non-integers (reject, or use \`Math.abs\`).`,
      followUps: [
        {
          q: 'When is recursion a better choice than a loop in test automation?',
          a: 'For tree-shaped data whose depth you do not know in advance: walking nested JSON in an API response to find every "id" field, comparing two nested objects deeply, or traversing a nested menu or folder structure. For flat repetition, such as retries or iterating rows, a loop is simpler and cannot overflow the stack.',
        },
        {
          q: 'What does your function return for 0, and for a negative number?',
          a: 'For 0 it returns 0 from the base case, which is correct. For -15, n < 10 is true immediately, so it returns -15, which is wrong. I would either guard with `if (n < 0) throw new RangeError("non-negative only")` or use Math.abs, depending on the requirement; pointing this out unprompted is a good signal.',
        },
      ],
      pitfalls: [
        'Forgetting Math.floor and producing decimals.',
        'No base case or a base case that is never reached.',
        'Not testing edge inputs like 0 and single digits.',
      ],
    },
    {
      id: 'js-functions-iq-07',
      difficulty: 'medium',
      question: 'What is a pure function? A test helper `applyCoupon(cart, code)` changes `cart.total` directly. Why might this make your tests flaky, and how would you rewrite it?',
      whatInterviewerLooksFor: [
        'Same input → same output; no side effects',
        'Links mutation of shared data to order-dependent failures',
        'Rewrites to return a new object',
        'Knows side effects belong at the edges of a test',
      ],
      modelAnswer: `**Pure function:** given the same arguments it always returns the same result, and it has no side effects: it does not modify its arguments or outside variables, and does no I/O (network, files, console, browser, clock, randomness).

**The problem with \`applyCoupon(cart, code)\` mutating \`cart.total\`:**
- If several tests import the same \`cart\` fixture object from a data file, the first test that applies \`SAVE10\` changes the shared object. The next test starts with an already-discounted total.
- The result depends on **test order**: passes alone, fails in a full run, or the reverse. With parallel workers the order changes between runs, so it looks random. That is the textbook definition of a flaky, order-dependent test.
- Debugging is hard because the failing test is innocent; the polluter ran earlier.

**Rewrite:**

\`function applyCoupon(cart, code) {\`
\`  const rate = code === 'SAVE10' ? 0.1 : 0;\`
\`  const totalCents = Math.round(cart.totalCents * (1 - rate));\`
\`  return { ...cart, totalCents, coupon: code };\`
\`}\`

It returns a **new** cart; the input is untouched, so any number of tests can share the same starting data. Using cents avoids float surprises. If the cart had nested objects (items), I would create new arrays/objects for the parts I change or use \`structuredClone\`.

**The bigger principle:** keep calculation and data-building helpers pure and unit-testable in milliseconds; keep side effects (clicking, API calls) inside the test or Page Object where they are expected. In Playwright, fixtures that create fresh data per test complete the picture.`,
      followUps: [
        {
          q: 'How could you detect accidental mutation of shared test data?',
          a: 'Deep-freeze the shared fixtures in a dev/CI check (Object.freeze recursively) so any write throws a TypeError in strict mode, ES modules included. Alternatively compare a JSON snapshot of the data before and after each test in a hook. Running tests in random or reversed order also exposes hidden order dependencies.',
        },
        {
          q: 'Is a function that only reads Date.now() pure?',
          a: 'No: the same arguments can give different results at different times, which is a hidden input. To make it pure, pass the time in as a parameter (or inject a clock). Playwright also has a Clock API (page.clock) to control time in the browser for the same reason: determinism.',
        },
      ],
      pitfalls: [
        'Defining pure only as "returns something".',
        'Not connecting mutation to order-dependent flakiness.',
        'Fixing it by resetting the global in afterEach instead of removing the shared mutation.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-functions-drill-1',
      question:
        'Trace this file line by line and give each output (or the error): `console.log(typeof setup); console.log(count); var count = 5; console.log(typeof helper); var helper = () => 1; console.log(helper()); console.log(limit); const limit = 10; function setup() {}`',
      assumptions: [
        'Declarations are registered before any line runs.',
        'An uncaught error stops the script.',
        '`typeof` on a var holding undefined returns "undefined".',
      ],
      steps: [
        { label: 'Registration phase', calc: 'setup → function; count → undefined; helper → undefined; limit → TDZ' },
        { label: 'typeof setup', calc: 'function declaration, fully hoisted → "function"' },
        { label: 'console.log(count)', calc: 'var registered as undefined → undefined; then count = 5' },
        { label: 'typeof helper', calc: 'helper is still undefined (arrow not assigned yet) → "undefined"' },
        { label: 'helper = () => 1; helper()', calc: 'assignment has now run → 1' },
        { label: 'console.log(limit)', calc: 'const in TDZ → ReferenceError: Cannot access \'limit\' before initialization; script stops' },
      ],
      answer: '`function`, `undefined`, `undefined`, `1`, then **ReferenceError** (Cannot access \'limit\' before initialization).',
      insight:
        'Only function declarations are safe to use early. var silently gives undefined; let/const fail loudly. In test files, declare data and helpers before use and prefer const, so mistakes surface as clear errors.',
      followUps: [
        {
          q: 'What changes if `var helper = () => 1` becomes `const helper = () => 1`?',
          a: '`typeof helper` on the third line now throws a ReferenceError (TDZ), because typeof is not safe for let/const before initialisation. Execution stops there, earlier than before, so only "function" and undefined are printed.',
        },
      ],
    },
    {
      id: 'js-functions-drill-2',
      question:
        'Predict the outputs: `function makeCounter(start = 0) { let n = start; return { inc: () => ++n, get: () => n }; } const a = makeCounter(); const b = makeCounter(10); a.inc(); a.inc(); b.inc(); console.log(a.get(), b.get()); const c = a; c.inc(); console.log(a.get());`',
      assumptions: [
        'Each makeCounter call creates its own closure environment.',
        '`++n` increments then returns the new value.',
        'Assigning an object to another variable copies the reference, not the object.',
      ],
      steps: [
        { label: 'a = makeCounter()', calc: 'environment A: n = 0' },
        { label: 'b = makeCounter(10)', calc: 'environment B: n = 10' },
        { label: 'a.inc(); a.inc()', calc: 'A: n = 1, then 2' },
        { label: 'b.inc()', calc: 'B: n = 11 (A unaffected)' },
        { label: 'console.log(a.get(), b.get())', calc: '2 11' },
        { label: 'const c = a; c.inc()', calc: 'c points to the same object whose functions close over A → A: n = 3' },
        { label: 'console.log(a.get())', calc: '3' },
      ],
      answer: '`2 11`, then `3`.',
      insight:
        'Two factory calls give two independent private states; two variables pointing at the same object share one. That is exactly how per-test data factories avoid collisions while shared objects cause them.',
      followUps: [
        {
          q: 'How would you add a reset() that sets the counter back to its start value?',
          a: 'Add `reset: () => { n = start; }` to the returned object. The start parameter is also part of the closure, so reset can read it later. Nothing outside can set n to an arbitrary value, which keeps the counter consistent.',
        },
      ],
    },
    {
      id: 'js-functions-drill-3',
      question:
        'Predict each line: `class Product { constructor(n) { this.name = n; } label() { return "Item: " + this.name; } } const p = new Product("Backpack"); const f = p.label; const g = p.label.bind(p); const h = () => p.label(); console.log(p.label()); console.log(g()); console.log(h()); console.log(f());`',
      assumptions: [
        'Class bodies are strict mode.',
        'A plain call `f()` in strict mode gives this === undefined.',
        'bind fixes this permanently; an arrow wrapper calls the method on p.',
      ],
      steps: [
        { label: 'p.label()', calc: 'called on p → this = p → "Item: Backpack"' },
        { label: 'g()', calc: 'bound to p → "Item: Backpack"' },
        { label: 'h()', calc: 'arrow calls p.label() → "Item: Backpack"' },
        { label: 'f()', calc: 'detached plain call → this undefined → reading this.name throws TypeError' },
      ],
      answer: '`Item: Backpack` three times, then `TypeError: Cannot read properties of undefined (reading \'name\')`.',
      insight:
        'this belongs to the call, not to the function. Whenever you hand a method to someone else (retry helpers, event handlers, array callbacks), wrap it in an arrow or bind it.',
      followUps: [
        {
          q: 'Would f() also throw if Product were a plain object literal in an old non-module script?',
          a: 'Not necessarily. In sloppy mode a plain call sets this to the global object, so this.name reads globalThis.name, typically undefined (or, in a browser, window.name, often an empty string), giving "Item: undefined" or "Item: " without an error. That silent wrong result is worse than the TypeError, one reason strict mode is the default in classes and modules.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-functions-mcq-01',
      difficulty: 'easy',
      question: 'A helper is called on line 1 but defined further down as a function declaration. What happens?',
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
        'Function declarations are hoisted with their full body, so the call works before the definition line and prints "Hello, qa". A ReferenceError would happen for a const/let function expression (TDZ), and a TypeError for a var function expression called too early.',
      followUps: [
        {
          q: 'What would change with `const greetUser = (name) => ...`?',
          a: 'The call on line 1 would hit the temporal dead zone and throw ReferenceError: Cannot access \'greetUser\' before initialization. Arrow functions and function expressions are only available after their assignment runs.',
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
        'With a block body { }, an arrow behaves like a normal function: no return means undefined. Either write `return items.map(...)` or drop the braces for an implicit return. map itself returns a new array; there is nothing asynchronous to await; arrows accept any parameters.',
      followUps: [
        {
          q: 'How would you return an object literal from a one-line arrow?',
          a: 'Wrap it in parentheses: `(i) => ({ name: i.name, price: i.price })`. Without them, the braces are parsed as a function body and the arrow returns undefined.',
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
        'Default parameters apply only when the argument is undefined (missing or explicitly undefined). null is a real value, so it is passed through. Beginners often assume defaults work like || or ??, which would treat null differently.',
      followUps: [
        {
          q: 'How would you also default null?',
          a: 'Inside the body: `user = user ?? "standard_user"`. ?? treats both null and undefined as missing while keeping legitimate falsy values like an empty string, which you might want to test as an invalid username.',
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
        'Named parameters take arguments in order (title, first); the rest parameter collects the remaining two into a real array, so its length is 2 and Array.isArray is true. The old arguments object is array-like but not an array, which is why some expect false.',
      followUps: [
        {
          q: 'Can a rest parameter come before other parameters?',
          a: 'No. It must be the last parameter; `function f(...a, b)` is a SyntaxError. That rule makes it unambiguous which arguments go where.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-05',
      difficulty: 'medium',
      question: 'Two loops schedule callbacks that read the loop variable later. What do they print?',
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
        'var creates one function-scoped i shared by every callback; when they run, the loop has finished and i is 3 (the value that ended the loop, not 2). let creates a fresh binding per iteration, so each callback closes over its own k. Closures hold live variables, not copies of values.',
      followUps: [
        {
          q: 'How could you fix the var version without changing to let?',
          a: 'Create a new scope per iteration, e.g. an IIFE: `fromVar.push(((j) => () => j)(i))`, passing the current value as a parameter. That was the pre-ES2015 pattern; today let is the clean fix.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-06',
      difficulty: 'medium',
      question: 'A checkout function logs a let variable one line before declaring it. What is the outcome of calling it?',
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
        'total is hoisted to the top of the function scope but stays in the temporal dead zone until its let line runs, so access throws "Cannot access before initialization". undefined would be the var behaviour; "is not defined" is the message for a name that does not exist at all.',
      followUps: [
        {
          q: 'Why is this error better than getting undefined?',
          a: 'It fails at the exact line of the mistake with a clear message. With var, the code continues with undefined and fails later in an unrelated place (or, worse, an assertion compares against undefined and passes for the wrong reason).',
        },
      ],
    },
    {
      id: 'js-functions-mcq-07',
      difficulty: 'medium',
      question: 'Two ID generators are created from the same factory. What is logged?',
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
        'Each call to idMaker creates a new environment with its own n. orderId was called twice before the log, so the third call returns ORD-3, while userId\'s private n starts fresh, giving USR-1. USR-4 assumes a shared counter.',
      followUps: [
        {
          q: 'Why is this useful for parallel Playwright tests, and what is its limit?',
          a: 'Each test or worker can get its own generator so IDs never collide within it. But each worker is a separate process, so two workers both produce ORD-1; include the worker index or a random/UUID part for global uniqueness.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-08',
      difficulty: 'medium',
      question: 'Select ALL of the following that are higher-order functions.',
      options: [
        'Array.prototype.map',
        'A function `between(min, max)` that returns `price => price >= min && price <= max`',
        'Math.max',
        "Playwright's `test('title', async ({ page }) => {...})`",
        'A function `toCents(text)` that returns a number',
      ],
      correct: [0, 1, 3],
      explanation:
        'A higher-order function takes a function as an argument and/or returns one. map and Playwright\'s test() take callbacks; between returns a function. Math.max and toCents only take and return plain values, so they are ordinary functions.',
      followUps: [
        {
          q: 'Give an example of a HOF you would write for a test framework.',
          a: 'A step wrapper: `async function step(name, fn) { console.log(name); return await fn(); }`, or a retry helper that takes the action to retry. Playwright already provides test.step(name, async () => {...}), which is a HOF that groups actions in the report and trace.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-09',
      difficulty: 'medium',
      question: 'A helper is defined with `var` as a function expression and called before that line. What is the error?',
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
        'var resetCart is hoisted and initialised to undefined, so the name exists but calling undefined throws a TypeError ("is not a function"). "is not defined" means the name does not exist at all; "before initialization" is the TDZ message for let/const.',
      followUps: [
        {
          q: 'How would you read these three error messages when debugging?',
          a: '"X is not defined" → typo or missing import. "Cannot access X before initialization" → used a let/const/class too early (ordering). "X is not a function" → the name exists but holds something else, often undefined from var hoisting, a wrong import, or a property that is not a method.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-10',
      difficulty: 'hard',
      question: 'Calling `new Timer().start()` produces what result?',
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
        'The regular function passed to forEach gets its own this; with no thisArg and class code being strict, that this is undefined, so this.ticks throws. Using an arrow callback would inherit start\'s this and return 3. NaN would require this to be an object without ticks (as in sloppy mode with the global object).',
      followUps: [
        {
          q: 'Name two fixes besides an arrow function.',
          a: 'Pass a thisArg: `[1, 2, 3].forEach(function () { this.ticks++; }, this)`, or capture it before the callback: `const self = this;` and use self.ticks inside. The arrow version is the modern, most readable choice.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-11',
      difficulty: 'hard',
      question: 'A Page Object method is passed to a generic retry helper as `retry(loginPage.submit, 3)` and every attempt fails with "Cannot read properties of undefined (reading \'page\')". What is the root cause?',
      options: [
        'The method was detached from its object, so inside it `this` is undefined when retry calls fn()',
        'retry must be declared with async to call class methods',
        'Class methods cannot be passed as arguments in JavaScript',
        'The page fixture was closed before the retry started',
      ],
      correct: [0],
      explanation:
        'Passing loginPage.submit hands over just the function; this is decided at call time, and retry calls fn() with no receiver, so this is undefined in strict class code. Methods can be passed as values, async is unrelated to this, and a closed page gives a different error (target closed). Fix with `() => loginPage.submit()` or bind.',
      followUps: [
        {
          q: 'Which fix do you prefer and why?',
          a: 'An arrow wrapper, `retry(() => loginPage.submit(), 3)`: it is explicit, lets you pass arguments naturally, and works for async methods. bind works too but is easier to forget and harder to read when arguments are involved.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-12',
      difficulty: 'hard',
      question: 'Select ALL functions that are pure.',
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
        'a depends only on its inputs and changes nothing. c returns a new object without touching its argument. b changes an outside variable (side effect), d depends on the clock (different output for the same input), and e mutates its argument. Mutation and hidden inputs are what make helpers unpredictable in tests.',
      followUps: [
        {
          q: 'How would you make d pure?',
          a: 'Pass the timestamp in as a parameter, so d becomes (now) => a string built from now, e.g. "user_" + now + "@test.com". The caller (a fixture or the test) decides the time, and unit tests of d become deterministic.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-13',
      difficulty: 'medium',
      question: 'Select ALL statements about closures that are true.',
      options: [
        'A closure keeps access to variables of its outer function after that function has returned',
        'A closure stores a snapshot copy of outer variables taken when it was created',
        'Each call to an outer function creates a new set of variables for the closures it returns',
        'Closures only exist for arrow functions',
      ],
      correct: [0, 2],
      explanation:
        'Closures retain the outer environment after the outer call ends, and every call creates a new environment (independent counters). They reference variables live, not as snapshots, which explains the var-loop puzzle. Every JavaScript function forms a closure, not only arrows.',
      followUps: [
        {
          q: 'Can closures cause memory problems?',
          a: 'Yes, if a long-lived closure (an event handler or a cached function) references a large object, that object cannot be garbage-collected. In tests this rarely matters, but in long-running apps leaked listeners holding DOM nodes are a classic memory-leak source.',
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
        'Scope is lexical: readEnv was written at the top level, so it sees the outer env ("qa") even though it is called inside run. inner was written inside run, so it sees run\'s env ("prod"). Answers with "prod" first assume dynamic scope (lookup by caller), which JavaScript does not use.',
      followUps: [
        {
          q: 'Is `this` lexical or dynamic in JavaScript?',
          a: 'For regular functions, this is dynamic (decided by the call), unlike variables, which are lexical. Arrow functions make this lexical too. That contrast is a frequent interview follow-up and the root of most this-related bugs.',
        },
      ],
    },
    {
      id: 'js-functions-mcq-15',
      difficulty: 'expert',
      question: 'A recursive helper walks a nested category tree from an API. Select ALL statements that are correct.',
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
        'Leaves are the empty-children node and the two {} nodes (no children property, handled by the base case), so the result is 3. There is a base case, so no RangeError for this tree. A cyclic reference would never reach a leaf, causing "Maximum call stack size exceeded", which is why robust walkers track visited nodes with a Set.',
      followUps: [
        {
          q: 'How would you protect the walker against cycles?',
          a: 'Pass a Set of visited nodes: at the start, `if (seen.has(node)) return 0; seen.add(node);`. Object identity makes the Set check reliable. structuredClone and many deep-equal libraries do the same internally to handle circular structures.',
        },
      ],
    },
  ],
};

export default topic;
