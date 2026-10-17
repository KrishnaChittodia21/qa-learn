import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-output-puzzles',
  phase: 'javascript',
  order: 7,
  title: 'Predict the Output: JavaScript Interview Puzzles',
  subtitle:
    'The "what does this code print?" interview round. Learn the common traps (hoisting, closures in loops, this, type conversion, truthy and falsy, shared objects, arrays, strings and the event loop) and trace each one step by step. Every output was checked in Node.',
  estimatedMinutes: 120,
  sources: [
    'Lydia Hallie: javascript-questions (GitHub README), used for the range of themes interviewers draw on',
    'GeeksforGeeks: JavaScript Output Based Interview Questions',
    'DEV Community (Amit Kumar): output-based JavaScript questions handbook',
    'javascript.info: Variable scope, closure (and its end-of-chapter tasks)',
    'MDN Web Docs: Array.prototype.sort (default string ordering, holes and undefined)',
    "Kyle Simpson: You Don't Know JS Yet: Scope & Closures (hoisting, TDZ, lexical scope)",
    'Every output in this topic was checked by running the snippet with Node.js 23 as a plain (non-module) script',
  ],
  tags: ['javascript', 'output-questions', 'hoisting', 'tdz', 'closures', 'this', 'coercion', 'event-loop', 'arrays', 'strings', 'interview'],
  cheatSheet: [
    'Read early: a `var` gives `undefined`. A `let`/`const` throws ReferenceError until its line runs (the TDZ), even inside `typeof`.',
    'A `function f() {}` declaration can be called before its line. `var f = function () {}` called early gives TypeError "f is not a function". `const f = () => {}` called early gives ReferenceError.',
    'Two functions with the same name: the LAST one wins, even for calls above it. A later `var x = value` line then replaces the function.',
    'Closures remember the variable, not its value. `var` in a loop = one shared variable (3, 3, 3). `let` in `for (...)` = a new variable each round (0, 1, 2). A `let` declared before a while loop is still shared.',
    '`this` depends on the call: `obj.m()` → obj. A plain `m()` → undefined in class code. Arrows use the `this` around them. `bind` beats a later `call`.',
    '`+` with any string joins text. `-`, `*`, `/` and unary `+` turn values into numbers. Arrays and objects become strings first: `[1,2] + [3]` is "1,23".',
    '`null == undefined` is true. `null == 0` is false, but `null >= 0` is true. `NaN` equals nothing; `includes` finds NaN, `indexOf` does not.',
    '`&&` returns the first falsy value, or the last value. `||` returns the first truthy value, or the last. `??` replaces only null/undefined, so `0 ?? 5` is 0.',
    'Objects are compared by address: `{a:1} === {a:1}` is false. Spread copies only one level. Reassigning a parameter never changes the caller\'s variable.',
    'Array traps: plain `sort()` compares as text and changes the array. `push` returns the new length. `delete` leaves a hole. `map` with `{ }` and no `return` gives undefineds.',
    'Strings never change: `s[0] = "X"` and a bare `s.toUpperCase()` do nothing to `s`. `replace` with a string changes only the first match.',
    'Event loop order: all normal code → all promise callbacks (`.then`, code after `await`) → one timer → promise callbacks again. Code inside `new Promise(...)` runs at once.',
  ],
  sections: [
    {
      heading: 'var, let, const: hoisting and the Temporal Dead Zone',
      body: `**Look at this first:**
- \`console.log(score); var score = 90;\` prints \`undefined\`.
- \`console.log(level); let level = 'smoke';\` throws \`ReferenceError\`.

Why are they different? Before running any line, JavaScript reads the whole script once. It notes down every variable name. This is called **hoisting** (JavaScript reads your declarations first, before running the code).

- A \`var\` name is noted down with the value \`undefined\`. So reading it early gives \`undefined\`.
- A \`let\` or \`const\` name is noted down but locked. Reading it before its line throws an error.

**Temporal Dead Zone (TDZ)** is the time between the start of a block and the line where a \`let\`/\`const\` is declared. Using the variable in that gap throws a \`ReferenceError\`.

| Keyword | Read before its line gives | Lives inside |
|---|---|---|
| \`var\` | \`undefined\` | the whole function (ignores \`{ }\` blocks) |
| \`let\` | ReferenceError | the nearest \`{ }\` block |
| \`const\` | ReferenceError | the nearest \`{ }\` block |

**Watch out:** \`typeof\` is safe for a name that was never declared. It just returns "undefined". But \`typeof\` still throws inside the TDZ.

**How to solve these questions**
1. First, list every \`var\`, \`let\`, \`const\` and \`function\` name.
2. Mark \`var\` names as \`undefined\`. Mark \`let\`/\`const\` names as "locked".
3. Now read the lines from top to bottom. Update the values as you go.
4. A \`var\` inside \`if\` or \`for\` belongs to the whole function. It leaks out of the block.

**Why testers care:** use \`const\` and \`let\` in Playwright tests. Then an early use fails loudly, instead of quietly giving \`undefined\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Reading before the declaration line',
          code: `// Plain script: node hoisting.js
console.log(score);          // → undefined
var score = 90;
console.log(score);          // → 90

try {
  console.log(level);
} catch (e) {
  console.log(e.name);       // → ReferenceError
}
let level = 'smoke';

try {
  console.log(typeof plan);  // typeof does NOT protect you inside the TDZ
} catch (e) {
  console.log(e.message);    // → Cannot access 'plan' before initialization
}
const plan = 'regression';

console.log(typeof neverDeclared); // → undefined (no declaration at all is fine)`,
        },
        {
          language: 'javascript',
          title: 'Blocks stop let/const, not var',
          code: `for (var a = 0; a < 2; a++) {}
console.log(a);              // → 2   (var leaked out of the loop)

for (let b = 0; b < 2; b++) {}
console.log(typeof b);       // → undefined (b only existed inside the loop)

if (true) {
  var leaked = 'var escapes the block';
  const kept = 'const stays inside';
}
console.log(leaked);         // → var escapes the block
console.log(typeof kept);    // → undefined`,
        },
      ],
      keyPoints: [
        'var read early → undefined. let/const read early → ReferenceError (the TDZ).',
        '`typeof` of a name that was never declared gives "undefined". `typeof` of a TDZ name throws.',
        'var ignores { } blocks, so it leaks out of if and for.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Scope & Closures; javascript.info: Variable scope, closure",
    },
    {
      heading: 'Function declarations vs function expressions',
      body: `**Look at this first:**
- \`hello(); function hello() { console.log('hi'); }\` prints \`hi\`.
- \`hi(); var hi = function () {};\` throws \`TypeError: hi is not a function\`.

A **function declaration** starts with the word \`function\`, like \`function add() {}\`. JavaScript stores it, body and all, before running any line. So you can call it early.

A **function expression** stores a function inside a variable, like \`var f = function () {}\` or \`const f = () => {}\`. It follows the variable rules from the previous section.

| Written as | Calling it before its line gives |
|---|---|
| \`function f() {}\` | works |
| \`var f = function () {}\` | **TypeError**: f is not a function (f is still \`undefined\`) |
| \`let f = ...\` / \`const f = () => {}\` | **ReferenceError**: Cannot access 'f' before initialization |

**Watch out**
- Two declarations with the same name: the **last one wins**. This is true even for calls written above it.
- A \`var\` and a function with the same name: the function is stored first. When the \`var x = value\` line runs, the value replaces the function.
- A **named function expression**, like \`const helper = function inner() {}\`. The name \`inner\` works only inside that function.

**How to solve these questions:** first do the "read declarations first" step on paper. Functions get their bodies. \`var\` names get \`undefined\`. A later declaration replaces an earlier one. Then run the lines one by one.

**Why testers care:** do you see "x is not a function" or "Cannot access x before initialization" in a test file? Then a helper was probably called before the line that created it.`,
      code: [
        {
          language: 'javascript',
          title: 'Calling before the definition',
          code: `console.log(add(2, 3));       // → 5 (declaration: hoisted with its body)
function add(x, y) { return x + y; }

console.log(typeof multiply); // → undefined (var hoisted, value not assigned yet)
try { multiply(2, 3); } catch (e) { console.log(e.name); } // → TypeError
var multiply = function (x, y) { return x * y; };

try { divide(6, 3); } catch (e) { console.log(e.name); } // → ReferenceError
const divide = (x, y) => x / y;`,
        },
        {
          language: 'javascript',
          title: 'Same names and named expressions',
          code: `function pick() { return 'first'; }
console.log(pick());          // → second (both registered; the later one wins)
function pick() { return 'second'; }

console.log(typeof report);   // → function
var report = 'ready';         // this assignment runs now...
function report() {}
console.log(typeof report);   // → string (...and replaced the function)

const helper = function inner() { return typeof inner; };
console.log(helper());        // → function
console.log(typeof inner);    // → undefined (the name is private to the function)`,
        },
      ],
      keyPoints: [
        'A function declaration can be called early. A var function called early gives TypeError; a let/const one gives ReferenceError.',
        'With two same-name declarations, the last one wins. A later var assignment replaces a function.',
        'The name of a named function expression works only inside that function.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Scope & Closures; Lydia Hallie: javascript-questions",
    },
    {
      heading: 'Closures in loops: var vs let with callbacks and setTimeout',
      body: `**Look at this first:**
- \`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));\` prints 3, 3, 3.
- \`for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));\` prints 0, 1, 2.

The only change is \`var\` to \`let\`. To see why, you need one idea.

**Closure** means a function remembers the variables around it, even after the outer code has finished. It remembers the variable itself, not a copy of its value. So if the variable changes later, the function sees the new value.

**The rules**
- \`for (var i ...)\`: there is only **one** \`i\` for the whole loop. Every callback reads that same \`i\` later. By then the loop is over, so all of them see the last value.
- \`for (let i ...)\`: each round of the loop gets its **own fresh \`i\`**. So each callback keeps its own number.
- A \`let i\` written **before** a \`while\` loop is still one shared variable. \`let\` only helps inside the \`for (...)\` brackets or inside the loop body.

**Watch out:** \`setTimeout(fn, 0)\` does not run right away. It runs after the whole loop, and all other normal code, has finished.

**How to solve these questions**
1. Ask: how many copies of the loop variable exist? A \`var\`, or a \`let\` outside the loop, gives one. A \`let\` in \`for (...)\` gives one per round.
2. Ask: when does the callback run? A timer callback runs later, after the loop ends.
3. The callback prints what its copy holds at that later moment.

**Why testers care:** listeners like \`page.on('response', ...)\` added in a loop run later. If they read a \`var\` loop counter, they all see the last value.`,
      code: [
        {
          language: 'javascript',
          title: 'Collecting functions in a loop',
          code: `const varFns = [];
for (var i = 0; i < 3; i++) {
  varFns.push(() => i);
}
console.log(varFns.map((f) => f()));   // → [ 3, 3, 3 ]

const letFns = [];
for (let j = 0; j < 3; j++) {
  letFns.push(() => j);
}
console.log(letFns.map((f) => f()));   // → [ 0, 1, 2 ]

let k = 0;
const whileFns = [];
while (k < 3) {
  whileFns.push(() => k);
  k++;
}
console.log(whileFns.map((f) => f())); // → [ 3, 3, 3 ] (one k for the whole loop)`,
        },
        {
          language: 'javascript',
          title: 'The setTimeout version interviewers love',
          code: `for (var t = 1; t <= 3; t++) {
  setTimeout(() => console.log('var', t), 0);
}
for (let u = 1; u <= 3; u++) {
  setTimeout(() => console.log('let', u), 0);
}
// Output, in this order:
// var 4
// var 4
// var 4
// let 1
// let 2
// let 3`,
        },
        {
          language: 'javascript',
          title: 'Each factory call gets its own closure',
          code: `function makeRetryCounter() {
  let attempts = 0;
  return () => ++attempts;
}
const apiRetry = makeRetryCounter();
const uiRetry = makeRetryCounter();
apiRetry();
apiRetry();
console.log(apiRetry());     // → 3
console.log(uiRetry());      // → 1 (separate call, separate attempts variable)`,
        },
      ],
      keyPoints: [
        'A closure remembers the variable itself, not a copy of its value.',
        'var loop + a callback that runs later → every callback sees the final value.',
        'Only a let inside for (...) gives a new variable for each round.',
      ],
      source: 'javascript.info: Variable scope, closure (task "Army of functions"); Lydia Hallie: javascript-questions',
    },
    {
      heading: 'this: regular functions, arrows, detached methods, call and bind',
      body: `**Look at this first:**
- \`const page = { title: 'Login', read() { return this.title; } };\`
- \`page.read()\` returns \`Login\`. The object left of the dot is \`this\`.
- \`const read = page.read; read();\` returns \`undefined\` in a plain script. Nothing is left of the dot, so \`this\` is lost.

\`this\` means "the object that called this function". It is decided **when the function is called**, not where it was written. Think of the word "me": who it means depends on who is speaking.

**Arrow functions** are different. They have no \`this\` of their own. They use the \`this\` of the code around them.

**The rules, strongest first**

| How the function is called | \`this\` inside a regular function |
|---|---|
| \`fn.bind(x)\`, then any call | \`x\` (fixed forever; even \`call\` cannot change it) |
| \`fn.call(x)\` / \`fn.apply(x)\` | \`x\` |
| \`obj.fn()\` | \`obj\` (whatever is left of the dot) |
| plain \`fn()\` | \`undefined\` in class code and strict mode; the global object in a plain script |
| arrow function | the \`this\` of the code where the arrow was written |

**Watch out:** passing a method somewhere else drops the "left of the dot" part. Examples: \`const { count } = cart\` or \`forEach(reporter.record)\`. Class code always uses **strict mode** (a stricter set of JavaScript rules). So in a class you get a **TypeError**, not a quiet \`undefined\`.

**How to solve these questions**
1. Find the exact line that calls the function.
2. Is it an arrow? Then look outward and use the \`this\` of the surrounding regular function.
3. Otherwise check the table from the top: \`bind\`? \`call\`/\`apply\`? a dot? a plain call?

**Why testers care:** Page Object methods passed as callbacks, like \`retry(loginPage.submit)\`, lose \`this\`. Wrap them in an arrow instead: \`retry(() => loginPage.submit())\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Inside a class (always strict)',
          code: `class LoginPage {
  constructor() { this.title = 'Login'; }
  regular() { return this.title; }
  withArrow() { const read = () => this.title; return read(); }
  withInnerFunction() {
    function read() { return this; }
    return read();
  }
}
const lp = new LoginPage();
console.log(lp.regular());           // → Login
console.log(lp.withArrow());         // → Login
console.log(lp.withInnerFunction()); // → undefined (plain call in strict code)

const detached = lp.regular;
try { detached(); } catch (e) { console.log(e.name); } // → TypeError
console.log(lp.regular.bind(lp)());  // → Login`,
        },
        {
          language: 'javascript',
          title: 'call, bind and arrows created inside a function',
          code: `function whoAmI() { return this.name; }
const alpha = { name: 'alpha', whoAmI };
const beta = { name: 'beta' };
console.log(alpha.whoAmI());          // → alpha
console.log(alpha.whoAmI.call(beta)); // → beta
const locked = whoAmI.bind(alpha);
console.log(locked.call(beta));       // → alpha (bind beats a later call)

function makeLogger() {
  return { label: 'object', arrow: () => this.label, method() { return this.label; } };
}
const logger = makeLogger.call({ label: 'caller' });
console.log(logger.arrow());          // → caller (borrowed from makeLogger's this)
console.log(logger.method());         // → object`,
        },
      ],
      keyPoints: [
        '`this` depends on how the function is called, not where it is written. Arrows are the exception.',
        'A class method taken off its object throws TypeError, because class code is strict.',
        'bind is permanent. call and apply cannot change it.',
      ],
      source: 'Lydia Hallie: javascript-questions (this and arrow functions, call vs bind); MDN: this',
    },
    {
      heading: 'Type coercion: +, -, ==, unary plus and typeof',
      body: `**Look at this first:**
- \`1 + '2'\` gives \`'12'\` (text).
- \`'9' - 4\` gives \`5\` (a number).

**Type coercion** means JavaScript quietly changes a value from one type to another, for example from text to a number. It happens when an operator gets a type it did not expect. The trick is knowing which way each operator converts.

**The rules**
- \`+\` joins text if **either** side is a string. Arrays and objects count too, because they turn into strings first. Otherwise \`+\` adds numbers.
- \`+\` works left to right. \`1 + 2 + '3'\` is "33". But \`'1' + 2 + 3\` is "123".
- \`-\`, \`*\`, \`/\`, \`%\` and a single \`+\` in front of a value always turn values into **numbers**. For example: \`''\` → 0, \`' 42 '\` → 42, \`'4px'\` → NaN, \`true\` → 1, \`null\` → 0, \`undefined\` → NaN.
- Arrays and objects become text first: \`[]\` → "", \`[1, 2]\` → "1,2", \`{}\` → "[object Object]".
- \`==\` (loose equal) converts types before it compares. \`null\` and \`undefined\` equal each other and **nothing else**. Other values are usually turned into numbers.
- \`>=\` and \`<\` do turn \`null\` into 0. So \`null >= 0\` is true, while \`null == 0\` is false.
- \`NaN\` means "not a number". It is not equal to anything, not even itself.

**Watch out:** \`typeof null\` is "object". \`typeof NaN\` is "number". \`typeof []\` is "object". None of these mean what a beginner expects.

**How to solve these questions:** work out one operator at a time, left to right. Remember that \`*\` and \`/\` go before \`+\`. After each step, write down the value and its type.

**Why testers care:** text read from a page is always a string. Convert it with \`Number(...)\` before doing maths, and use \`===\` in your checks.`,
      code: [
        {
          language: 'javascript',
          title: '+ joins, the others convert to numbers',
          code: `console.log(1 + '2');            // → 12 (a string)
console.log('9' - 4);            // → 5
console.log('3' * '4');          // → 12
console.log(true + 1);           // → 2
console.log(JSON.stringify([] + [])); // → ""
console.log([] + {});            // → [object Object]
console.log([1, 2] + [3]);       // → 1,23
console.log(+'');                // → 0
console.log(+' 42 ');            // → 42
console.log(+'4px');             // → NaN`,
        },
        {
          language: 'javascript',
          title: '== quirks, NaN and typeof',
          code: `console.log(null == undefined);   // → true
console.log(null == 0);           // → false
console.log(null >= 0);           // → true
console.log('' == 0);             // → true
console.log('0' == false);        // → true
console.log(NaN == NaN);          // → false
console.log(Number.isNaN('abc')); // → false (it is a string, not NaN)
console.log(isNaN('abc'));        // → true (converts first, then checks)
console.log(typeof null);         // → object
console.log(typeof NaN);          // → number
console.log(typeof []);           // → object
console.log(typeof function () {}); // → function`,
        },
      ],
      keyPoints: [
        'Once a string appears in a + chain, the rest of the chain joins text.',
        'null == undefined is true, and null == 0 is false. But null >= 0 is true.',
        'typeof null → "object", typeof NaN → "number", typeof [] → "object".',
      ],
      source: 'GeeksforGeeks: JavaScript Output Based Interview Questions; MDN: Equality comparisons and sameness',
    },
    {
      heading: 'Truthy, falsy and what && || ?? actually return',
      body: `**Look at this first:**
- \`'qa' && 'prod'\` gives \`'prod'\`.
- \`'' || 'fallback'\` gives \`'fallback'\`.
- \`0 ?? 5\` gives \`0\`.

\`&&\` and \`||\` do not just return true or false. They **pick** one of the two values you gave them and return it unchanged.

**Falsy** values act like false in an \`if\`. There are only eight: \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\` and \`NaN\`. Everything else is **truthy**, including \`"0"\`, \`" "\`, \`"false"\`, \`[]\` and \`{}\`.

**The rules**
- \`a && b\`: if \`a\` is falsy, return \`a\`. Otherwise return \`b\`.
- \`a || b\`: if \`a\` is truthy, return \`a\`. Otherwise return \`b\`. If every value is falsy, you get the **last** one.
- \`a ?? b\`: return \`b\` only when \`a\` is \`null\` or \`undefined\`. So \`0\` and \`""\` are kept.

**Watch out:** \`[]\` is truthy, so \`if ([])\` runs. But \`[] == false\` is also true, because \`==\` turns \`[]\` into "" and then into 0. "Truthy" and "loosely equal to true" are different questions.

**How to solve these questions:** mark each value T (truthy) or F (falsy). Stop at the first value that decides the result. Return that value itself, not \`true\` or \`false\`.

**Why testers care:** \`const timeout = options.timeout || 5000\` turns a real \`0\` into 5000. Use \`??\` when 0 or "" are valid values.`,
      code: [
        {
          language: 'javascript',
          title: 'Pickers, not booleans',
          code: `console.log('qa' && 'prod');          // → prod
console.log(0 && 'never');            // → 0
console.log('' || 'fallback');        // → fallback
console.log(JSON.stringify(null || 0 || '')); // → "" (all falsy: the last one)
console.log(0 ?? 5);                  // → 0
console.log(null ?? undefined ?? 'end'); // → end
console.log(!!'false');               // → true
console.log(!![]);                    // → true
console.log([] == false);             // → true (truthy, yet == false)`,
        },
        {
          language: 'javascript',
          title: 'Which values make an if run?',
          code: `const checks = {
  zero: 0, zeroString: '0', empty: '', space: ' ',
  emptyArray: [], emptyObject: {}, nan: NaN, minusOne: -1,
};
for (const [label, value] of Object.entries(checks)) {
  if (value) console.log(label);
}
// → zeroString
// → space
// → emptyArray
// → emptyObject
// → minusOne`,
        },
      ],
      keyPoints: [
        '&& returns the first falsy value, or the last one. || returns the first truthy value, or the last one.',
        '?? only replaces null and undefined.',
        '"0", " ", [] and {} are truthy.',
      ],
      source: 'MDN: Logical AND, Logical OR, Nullish coalescing; GeeksforGeeks: JavaScript Output Based Interview Questions',
    },
    {
      heading: 'References and mutation: ===, spread copies, parameters, freeze',
      body: `**Look at this first:**
- \`{ id: 1 } === { id: 1 }\` gives \`false\`.
- \`const a = { id: 1 }; const b = a; b.id = 99;\` Now \`a.id\` is \`99\` too.

A variable does not hold an object itself. It holds the object's **address**, like a card with a house address on it. Copying the variable copies the card, not the house. Two cards with the same address see the same changes.

**The rules**
- \`===\` on objects and arrays compares **addresses**, not contents. So two objects that look the same are not \`===\`.
- Spread (\`{ ...obj }\`, \`[...arr]\`) makes a new outer object. But objects inside it are still shared. This is called a **shallow copy** (only the top level is copied).
- A function parameter gets a copy of the card. **Changing** the object through it (\`order.status = 'paid'\`) changes the caller's object. Changing an object in place is called **mutating** it.
- **Reassigning** the parameter (\`order = {...}\`) only changes the local card. The caller does not see it.
- \`Object.freeze\` blocks changes to the top level only. In a plain script, writes to a frozen property are silently ignored. In strict mode they throw a TypeError.
- Plain object keys are always strings. An object used as a key becomes "[object Object]".

**Watch out:** "I spread it, so it's a copy" is only true one level deep.

**How to solve these questions:** draw a box for each object and an arrow for each variable. Every \`=\` moves an arrow. Every \`.prop =\` or \`push\` changes a box.

**Why testers care:** if two tests share one test data object and one test changes it, the other test sees the change. Give each test a fresh copy, for example with \`structuredClone(data)\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Same box or a new box?',
          code: `console.log({ id: 1 } === { id: 1 }); // → false
const first = { id: 1 };
const alias = first;
alias.id = 99;
console.log(first.id, first === alias); // → 99 true

const original = { user: 'qa', tags: ['smoke'] };
const shallow = { ...original };
shallow.user = 'dev';
shallow.tags.push('regression');
console.log(original.user);             // → qa
console.log(original.tags);             // → [ 'smoke', 'regression' ]`,
        },
        {
          language: 'javascript',
          title: 'Parameters, freeze and object keys (plain sloppy script)',
          code: `function update(order) {
  order.status = 'paid';     // changes the caller's object
  order = { status: 'new' }; // moves only the local arrow
  return order.status;
}
const order = { status: 'pending' };
console.log(update(order), order.status); // → new paid

const config = Object.freeze({ retries: 2, env: { name: 'qa' } });
config.retries = 5;          // ignored here (TypeError in strict mode)
config.env.name = 'prod';    // nested object is NOT frozen
console.log(config.retries, config.env.name); // → 2 prod

const cache = {};
const keyA = { id: 'A' };
const keyB = { id: 'B' };
cache[keyA] = 'apple';
cache[keyB] = 'banana';
console.log(cache[keyA]);    // → banana (both keys became '[object Object]')`,
        },
      ],
      keyPoints: [
        'Objects are compared by address. Two objects that look the same are never ===.',
        'Spread copies one level only. Objects inside stay shared.',
        'Changing a parameter\'s object affects the caller. Reassigning the parameter does not.',
      ],
      source: 'Lydia Hallie: javascript-questions (references, Object.freeze, object keys); javascript.info: Object references and copying',
    },
    {
      heading: 'Array method gotchas: sort, push, length, delete, holes, splice, includes',
      body: `**Look at this first:**
- \`[100, 25, 3].sort()\` gives \`[ 100, 25, 3 ]\`.
- \`['a'].push('b')\` gives \`2\`, not the array.

Many array methods look harmless. But they either **change the original array**, or **return something you did not expect**. Output questions love both.

| Code | Returns | Changes the array? |
|---|---|---|
| \`arr.sort()\` | the same array (not a copy) | yes, and it compares as text by default |
| \`arr.push(x)\` | the **new length** | yes |
| \`arr.length = n\` | — | cuts the array (or adds empty slots) |
| \`delete arr[i]\` | true | leaves a **hole**; length stays the same |
| \`arr.slice(a, b)\` | a copy of items a to b-1 | no |
| \`arr.splice(a, n, ...items)\` | the **removed** items | yes |
| \`arr.indexOf(NaN)\` | -1 | no |
| \`arr.includes(NaN)\` | true | no |
| \`arr.map(x => { x * 2 })\` | undefineds (with \`{ }\` you need \`return\`) | no |

**Watch out**
- Plain \`sort()\` puts 100 before 25. It compares text, and "1" comes before "2".
- \`forEach\` and \`map\` skip holes (empty slots).
- \`['7', '7', '7'].map(parseInt)\` gives \`[ 7, NaN, NaN ]\`. \`map\` also passes the index, and \`parseInt\` reads it as the number base.

**How to solve these questions:** for each line, ask two questions. What does this call **return**? Did it **change** the array? Keep a running picture of the array.

**Why testers care:** to check that prices on a page are sorted, compare them with a sorted **copy**: \`[...prices].sort((a, b) => a - b)\`. Never compare against \`prices.sort()\`, because that is the same array.`,
      code: [
        {
          language: 'javascript',
          title: 'sort, map(parseInt), push, length, delete',
          code: `const timings = [100, 25, 3];
console.log(timings.sort());                 // → [ 100, 25, 3 ]
console.log(timings.sort((a, b) => a - b));  // → [ 3, 25, 100 ]
console.log(['7', '7', '7'].map(parseInt));  // → [ 7, NaN, NaN ]

const list = ['a', 'b', 'c', 'd'];
console.log(list.push('e'));                 // → 5
list.length = 2;
console.log(list);                           // → [ 'a', 'b' ]
delete list[0];
console.log(list, list.length);              // → [ <1 empty item>, 'b' ] 2`,
        },
        {
          language: 'javascript',
          title: 'slice vs splice, NaN search, holes, map without return',
          code: `const steps = ['open', 'login', 'search', 'pay'];
console.log(steps.slice(1, 3));    // → [ 'login', 'search' ]
console.log(steps);                // → [ 'open', 'login', 'search', 'pay' ]
console.log(steps.splice(1, 2));   // → [ 'login', 'search' ]
console.log(steps);                // → [ 'open', 'pay' ]

console.log([NaN].indexOf(NaN));   // → -1
console.log([NaN].includes(NaN));  // → true

const sparse = [1, , 3];
let calls = 0;
sparse.forEach(() => calls++);
console.log(sparse.length, calls); // → 3 2
console.log([1, 2, 3].map((n) => { n * 2; })); // → [ undefined, undefined, undefined ]`,
        },
      ],
      keyPoints: [
        'sort() changes the array and returns the same array. Without a compare function it sorts as text.',
        'push returns the new length. splice returns the removed items.',
        'includes finds NaN. indexOf cannot.',
      ],
      source: 'MDN: Array.prototype.sort, splice, includes; GeeksforGeeks: JavaScript Output Based Interview Questions',
    },
    {
      heading: 'Strings: immutability and method surprises',
      body: `**Look at this first:**
- \`let role = 'tester'; role.toUpperCase(); console.log(role);\` prints \`tester\`.
- \`role = role.toUpperCase(); console.log(role);\` prints \`TESTER\`.

A string can never be changed in place. We say strings are **immutable** (they cannot be changed). Methods like \`toUpperCase\` or \`replace\` give you a **new** string. If you do not save it in a variable, it is lost.

**The rules**
- \`s[0] = 'X'\` does nothing in a plain script. Strict mode throws a TypeError. \`s.length = 1\` also does nothing.
- \`replace('-', '/')\` with a text pattern changes **only the first** match. Use \`replaceAll\`, or a regex with the g flag like \`/-/g\`.
- \`slice\` accepts negative numbers, which count from the end. If start is bigger than end, it returns "".
- \`substring\` treats negative numbers as 0. If start is bigger than end, it **swaps** them.
- Strings are compared one character at a time. So \`'10' > '9'\` is false, because "1" comes before "9". Capital letters come before small letters.
- \`includes\`, \`startsWith\` and \`indexOf\` care about capital letters. This is called **case-sensitive**.

**Watch out:** \`verdict.toUpperCase();\` alone on a line looks like it changed \`verdict\`. It did not.

**How to solve these questions:** for each line, ask "is the result saved anywhere?" For \`slice\` and \`substring\`, write each character and its index on paper.

**Why testers care:** checking that "Error: wrong password" contains "error" fails, because of the capital E. Make both sides lower case first, or use a regex with the i flag like \`/error/i\`.`,
      code: [
        {
          language: 'javascript',
          title: 'Strings never change in place (plain sloppy script)',
          code: `let role = 'tester';
role[0] = 'T';
console.log(role);                         // → tester
role.toUpperCase();
console.log(role);                         // → tester (the result was thrown away)
role = role.toUpperCase();
console.log(role);                         // → TESTER

const path = 'a-b-c';
console.log(path.replace('-', '/'));       // → a/b-c
console.log(path.replaceAll('-', '/'));    // → a/b/c
console.log('Playwright'.slice(-6));       // → wright
console.log('Playwright'.substring(4, 1)); // → lay
console.log(JSON.stringify('Playwright'.slice(4, 1))); // → ""`,
        },
        {
          language: 'javascript',
          title: 'Small methods, big surprises',
          code: `console.log('5'.padStart(3, '0'));       // → 005
console.log('  ok  '.trim().length);     // → 2
console.log('QA'.at(-1));                // → A
console.log('a,b,,c'.split(','));        // → [ 'a', 'b', '', 'c' ]
console.log('Error'.includes('err'));    // → false (case-sensitive)
console.log('10' > '9');                 // → false (compared character by character)
console.log('apple' < 'Banana');         // → false (uppercase sorts first)`,
        },
      ],
      keyPoints: [
        'String methods return new strings. The original never changes.',
        'replace with a text pattern changes only the first match.',
        'Strings compare one character at a time, so "10" < "9".',
      ],
      source: 'MDN: String (immutability, replace, slice, substring); GeeksforGeeks: JavaScript Output Based Interview Questions',
    },
    {
      heading: 'Event loop ordering: normal code → promises → timers, and async/await',
      body: `**Look at this first:**
- \`setTimeout(() => console.log('timer'), 0);\`
- \`Promise.resolve().then(() => console.log('promise'));\`
- \`console.log('sync');\`
- This prints \`sync\`, then \`promise\`, then \`timer\`.

The **event loop** is how JavaScript decides what runs next. It runs one thing at a time, in this order:
1. All normal code, top to bottom. This is called **synchronous** code (it runs line by line, right now).
2. Then **every** waiting promise callback. These are called **microtasks** (small jobs that run right after the current code). \`.then\` callbacks, the code after \`await\` and \`queueMicrotask\` are microtasks.
3. Then **one** timer callback (\`setTimeout\`, \`setInterval\`). Timers are called **macrotasks**, or just "tasks".
4. Then all microtasks again, then the next timer, and so on.

Think of a chef. The chef first finishes the current order. Then the chef clears every sticky note on the counter, even notes added meanwhile. Only then does the chef take the next order from the line.

**More rules**
- The function you pass to \`new Promise(fn)\` runs at once, as normal code.
- An \`async\` function runs as normal code **until its first \`await\`**. The rest of it waits in the microtask queue.
- Timers with the same delay run in the order they were created. A 0 ms timer still waits for steps 1 and 2.

**Watch out:** two ideas sound right but are wrong. "\`setTimeout(fn, 0)\` runs right away" is wrong. "Code after \`await\` runs before the caller's next line" is also wrong.

**How to solve these questions:** draw three columns: **Output**, **Microtasks** and **Timers**. Walk through the code. Write normal output at once, and add each callback to its column. Then run the Microtasks column from top to bottom (new ones go to the end). Then take one timer at a time.

**Why testers care:** \`await\` every Playwright call. Without it, the next line runs first, and the test can finish before the browser does.`,
      code: [
        {
          language: 'javascript',
          title: 'The Promise executor is synchronous',
          code: `console.log('A');
setTimeout(() => console.log('E'), 0);
new Promise((resolve) => {
  console.log('B');          // runs immediately, inside the constructor
  resolve();
}).then(() => console.log('D'));
console.log('C');
// Output: A, B, C, D, E`,
        },
        {
          language: 'javascript',
          title: 'async/await splits a function in two',
          code: `async function fetchUser() {
  console.log('inside, before await');
  await null;
  console.log('after await');
}
console.log('start');
fetchUser();
Promise.resolve().then(() => console.log('then'));
setTimeout(() => console.log('timer'), 0);
console.log('end of script');
// Output:
// start
// inside, before await
// end of script
// after await   (queued first, when the await was reached)
// then
// timer`,
        },
        {
          language: 'javascript',
          title: 'Timers order by delay, then by registration',
          code: `setTimeout(() => console.log('slow 50ms'), 50);
setTimeout(() => console.log('fast 0ms'), 0);
setTimeout(() => console.log('also 0ms'));
console.log('sync first');
// Output: sync first, fast 0ms, also 0ms, slow 50ms`,
        },
      ],
      diagram: `  normal code ──► ALL microtasks ─────────► ONE timer ───┐
       ▲          (.then, after await)       (setTimeout)  │
       └───────────────────────────────────────────────────┘`,
      keyPoints: [
        'Order: normal code, then every microtask, then one timer. Then repeat.',
        'Code inside new Promise(...) and the part of an async function before await run at once.',
        'setTimeout(fn, 0) means "after everything already waiting", never "now".',
      ],
      source: 'MDN: Using microtasks in JavaScript; Lydia Hallie: javascript-questions (event loop questions)',
    },
    {
      heading: 'Scope and shadowing, default parameters, arguments and rest',
      body: `**Look at this first:**
- \`var env = 'prod'; function showEnv() { console.log(env); var env = 'qa'; } showEnv();\`
- This prints \`undefined\`, not \`prod\`.

**Scope** is the area of code where a variable can be used. Scopes sit inside each other like boxes. When code looks up a name, it checks its own box first. It only looks outward if the name is not there.

A name declared in an inner box **shadows** (hides) the same name outside. It hides it for the **whole** inner box, even on lines above the declaration. That is why \`showEnv\` prints \`undefined\`.

**The rules**
- A \`var\` inside a function hides the outer variable from the function's first line. It is \`undefined\` until assigned. This happens even if the \`var\` sits inside an \`if (false)\` block that never runs.
- **Default parameters**, like \`function f(x = 5)\`, are used only when the argument is \`undefined\`. \`null\`, \`0\` and \`""\` are real values. The default is worked out again **on each call**, and it can use earlier parameters.
- \`arguments.length\` counts what the caller passed. \`fn.length\` counts the declared parameters before the first default or rest parameter.
- Rest parameters (\`...rest\`) are always a real array. It is empty when nothing is left.
- In a plain script, assigning to a name with no \`let\`, \`const\` or \`var\` creates a global variable. This is a common typo bug. Strict mode throws a ReferenceError instead.

**Watch out:** "the outer variable is visible until the inner one is declared" is wrong. The inner declaration owns the name for the whole scope.

**How to solve these questions:** for each name used, find the nearest scope that **declares** it, anywhere in that scope. Then apply that keyword's hoisting rule.

**Why testers care:** a helper that reuses an outer name like \`page\` or \`user\` can hide the real one. Give inner variables clear, different names.`,
      code: [
        {
          language: 'javascript',
          title: 'Shadowing and default parameters',
          code: `var env = 'prod';
function showEnv() {
  console.log(env);          // → undefined (the local var env is hoisted)
  var env = 'qa';
  console.log(env);          // → qa
}
showEnv();
console.log(env);            // → prod

function retry(times, delay = times * 100) { return [times, delay]; }
console.log(retry(3));             // → [ 3, 300 ]
console.log(retry(3, 0));          // → [ 3, 0 ]
console.log(retry(3, undefined));  // → [ 3, 300 ]
console.log(retry(3, null));       // → [ 3, null ]`,
        },
        {
          language: 'javascript',
          title: 'arguments, rest and accidental globals (plain sloppy script)',
          code: `function legacy(a, b) { return [arguments.length, legacy.length]; }
console.log(legacy(1));             // → [ 1, 2 ]
console.log(legacy(1, 2, 3));       // → [ 3, 2 ]

function modern(first, ...rest) { return { first, rest }; }
console.log(modern());              // → { first: undefined, rest: [] }
console.log(modern('a', 'b', 'c')); // → { first: 'a', rest: [ 'b', 'c' ] }

function makeUser() { userCount = 1; } // no let/const/var: a global is created
makeUser();
console.log(userCount);             // → 1`,
        },
      ],
      keyPoints: [
        'An inner declaration hides the outer name for the whole inner scope.',
        'Defaults are used only for undefined, and are worked out again on every call.',
        'arguments.length = what was passed. fn.length = what was declared.',
      ],
      source: "javascript.info: Variable scope, closure; Kyle Simpson: You Don't Know JS Yet: Scope & Closures",
    },
    {
      heading: 'A 5-step method for any output question',
      body: `**Look at this first:**
- \`console.log('4' + 3 - 1);\` prints \`42\`.
- Step by step: \`'4' + 3\` → "43" (a string). Then \`"43" - 1\` → 42 (a number).

Output questions are not about memorising tricks. You run the code in your head, slowly, the way JavaScript does. Write each step on paper. Interviewers care more about how you explain than about speed.

**The 5 steps**
1. **Read declarations first.** List every declaration in each scope. Functions get their bodies. \`var\` gets \`undefined\`. \`let\`/\`const\` are locked (TDZ). Note any repeated names.
2. **Draw memory.** Draw boxes for objects and arrays, and arrows for variables. Every \`=\` moves an arrow. Every \`.x =\`, \`push\`, \`sort\` or \`splice\` changes a box.
3. **Walk the normal code line by line.** For each step, write the value **and its type**. For each function call, decide \`this\` from how it is called.
4. **Queue the async work.** Use three columns: Output, Microtasks and Timers. After the normal code, run all microtasks. Then take one timer, run microtasks again, and repeat.
5. **Write the answer the way Node prints it.** Top-level strings print without quotes. Strings inside arrays and objects print with single quotes. Holes show as \`<1 empty item>\`. \`console.log(a, b)\` puts a space between values. If a line throws, name the error. Then note that **nothing after it runs**, unless the error is caught.

**Say where the code runs**
- These snippets run as a plain script (\`node file.js\`, or a normal \`<script>\` tag).
- Modules and class code use **strict mode**. It turns some silent failures into errors. Examples: writing to a frozen object, writing to a string index, or creating a global by mistake.
- The top-level \`this\` changes by place. It is \`{}\` in a Node CommonJS file, \`window\` in a browser script and \`undefined\` in an ES module. Do not rely on it.

**In an interview, say:** "Let me trace it. First hoisting, then the normal lines, then the microtasks, then the timers." Then do exactly that, out loud.

**Why testers care:** the same slow tracing finds real bugs in test code, like a missing \`await\` or shared test data.`,
      code: [
        {
          language: 'javascript',
          title: 'The method applied to a small snippet',
          code: `// Step 1: registration: total → TDZ, items → TDZ, addTax → function
console.log(addTax(10));        // → 12 (declaration is callable early)
const items = [{ price: 10 }, { price: 5 }];
let total = 0;
// Step 2: items is ONE box; copy points at the SAME box
const copy = items;
copy.push({ price: 1 });
// Step 3: walk the loop; each step adds a number
for (const item of items) total += item.price;
console.log(total);             // → 16
// Step 4: queue the async work
setTimeout(() => console.log('timer', total), 0);
Promise.resolve().then(() => { total = 0; console.log('micro', total); });
console.log('sync', items.length); // → sync 3
// Step 5: final order → micro 0, then timer 0 (the microtask ran first)
function addTax(n) { return n + 2; }`,
        },
      ],
      keyPoints: [
        'Declarations first → draw memory → walk normal code → queue async work → print like Node.',
        'Write down the type of every in-between value.',
        'Say where the code runs (script or module, strict or not) when it changes the answer.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet; javascript.info; verified by running in Node.js",
    },
  ],
  codeChallenges: [
    {
      id: 'js-output-puzzles-cc-1',
      title: 'The retry logger that always says "attempt 4 of 3"',
      context:
        'A teammate wrote a small helper to study a flaky API. It should log "Retry attempt 1 of 3", then "2 of 3", then "3 of 3", 10 ms apart. Instead it prints the same impossible line three times. The log goes into a bug report, so it must be right.',
      task: 'First, predict what the starter logs and say why. Then fix `scheduleRetries(maxAttempts, log)` so each log line shows its own attempt number. Keep the delays. The tests call `collectLogs(maxAttempts)`. It records each line and, after all timers have run, gives back the lines in order. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        code: `function scheduleRetries(maxAttempts, log) {
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    setTimeout(() => {
      log('Retry attempt ' + attempt + ' of ' + maxAttempts);
    }, attempt * 10);
  }
}

// Entry point the tests call: records the lines instead of printing them
function collectLogs(maxAttempts) {
  const lines = [];
  scheduleRetries(maxAttempts, (line) => lines.push(line));
  return new Promise((resolve) => setTimeout(() => resolve(lines), maxAttempts * 10 + 20));
}

// collectLogs(3)
// Author expected:
// Retry attempt 1 of 3
// Retry attempt 2 of 3
// Retry attempt 3 of 3
// Actual output:
// Retry attempt 4 of 3
// Retry attempt 4 of 3
// Retry attempt 4 of 3`,
      },
      hints: [
        'With var, how many `attempt` variables exist in total?',
        'When do the arrow functions run: during the loop, or after it has finished?',
        'Which keyword gives the loop a new variable in every round?',
      ],
      solution: {
        language: 'javascript',
        code: `function scheduleRetries(maxAttempts, log) {
  // let in the for-header: a fresh 'attempt' for every iteration
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    setTimeout(() => {
      log('Retry attempt ' + attempt + ' of ' + maxAttempts);
    }, attempt * 10);
  }
}

function collectLogs(maxAttempts) {
  const lines = [];
  scheduleRetries(maxAttempts, (line) => lines.push(line));
  return new Promise((resolve) => setTimeout(() => resolve(lines), maxAttempts * 10 + 20));
}

// collectLogs(3) resolves with:
// ['Retry attempt 1 of 3', 'Retry attempt 2 of 3', 'Retry attempt 3 of 3']

// Alternative without changing the loop: pass the value as a timer argument
function scheduleRetriesOld(maxAttempts, log) {
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    setTimeout((n) => log('Retry attempt ' + n + ' of ' + maxAttempts), attempt * 10, attempt);
  }
}`,
      },
      explanation: `**Why it printed "4 of 3":**
1. \`var attempt\` is one variable for the whole function.
2. The loop finishes at once. It only *sets up* three timers.
3. When the loop ends, \`attempt\` is 4. That is the value that made \`attempt <= 3\` false.
4. 10 ms later, the first callback runs. It reads the one shared \`attempt\`, which is 4. The other two callbacks do the same.

**Fixes**
- **Use \`let\` in \`for (...)\`** (best). Each round gets its own \`attempt\`, so the callbacks see 1, 2 and 3.
- **Pass the value as an argument:** \`setTimeout(fn, delay, attempt)\`. The current value is copied into the callback's parameter when the timer is set up. Older code does the same with an IIFE (a function that is called right where it is written).

**Lesson for test code:** a callback that runs later and reads a loop variable needs its own copy of it. This includes timers, event handlers and \`page.on('response')\` listeners.`,
      fnName: 'collectLogs',
      tests: [
        { args: [3], expected: ['Retry attempt 1 of 3', 'Retry attempt 2 of 3', 'Retry attempt 3 of 3'] },
        { args: [1], expected: ['Retry attempt 1 of 1'] },
        { args: [2], expected: ['Retry attempt 1 of 2', 'Retry attempt 2 of 2'] },
        { args: [0], expected: [] },
        { args: [4], expected: ['Retry attempt 1 of 4', 'Retry attempt 2 of 4', 'Retry attempt 3 of 4', 'Retry attempt 4 of 4'], hidden: true },
      ],
      followUps: [
        {
          q: 'Why are the three lines still spaced 10 ms apart in the buggy version if attempt is always 4?',
          a: 'The delay `attempt * 10` is worked out at once, inside each round, when attempt is 1, 2 and 3. Only the callback body reads attempt later. So the timers run at 10, 20 and 30 ms, but all three print 4.',
        },
        {
          q: 'Would changing the arrow function to a regular function fix it?',
          a: 'No. Both kinds of function remember the same variable. The problem is how many variables exist, not how the function is written. Only a separate variable per round fixes it: let, an argument or an IIFE.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-cc-2',
      title: 'A sort-check helper that says every list is sorted',
      context:
        'An automation engineer wrote `isSortedAscending()` to check a "Price: low to high" filter. The test never fails, even when a developer breaks the sorting on purpose. The author is surprised by what the two sample calls print.',
      task: 'Predict what the sample calls print, and list every bug. Then fix `isSortedAscending(prices)`. It must return true only when the numbers go up from small to big. It must never change the array it is given. The tests call `checkPrices(prices)`, which returns `{ result, pricesAfter }`: the helper\'s answer, and the caller\'s array after the call (it must be unchanged). Press Run to check your fix.',
      starter: {
        language: 'javascript',
        code: `function isSortedAscending(prices) {
  const sorted = prices.sort();
  return prices === sorted;
}

// Entry point the tests call: the helper's answer and the caller's array afterwards
function checkPrices(prices) {
  const result = isSortedAscending(prices);
  return { result, pricesAfter: prices };
}

// const pageOne = [5, 25, 100];
// const pageTwo = [100, 25, 5];
// console.log(isSortedAscending(pageOne)); // author expects true
// console.log(isSortedAscending(pageTwo)); // author expects false
// console.log(pageTwo);                    // author expects [ 100, 25, 5 ]
// Actual output:
// true
// true
// [ 100, 25, 5 ]`,
      },
      hints: [
        'What does sort() return: a new array or the same one?',
        'With no compare function, how are 100, 25 and 5 compared?',
        'How do you compare two arrays item by item, instead of by address?',
      ],
      solution: {
        language: 'javascript',
        code: `function isSortedAscending(prices) {
  // copy first so the caller's array is untouched, and compare as numbers
  const sorted = [...prices].sort((a, b) => a - b);
  return sorted.every((value, i) => value === prices[i]);
}

function checkPrices(prices) {
  const result = isSortedAscending(prices);
  return { result, pricesAfter: prices };
}

// isSortedAscending([5, 25, 100]) → true
// isSortedAscending([100, 25, 5]) → false, and the array is still [ 100, 25, 5 ]

// Simpler O(n) alternative with no sorting at all
const isAscending = (arr) => arr.every((v, i) => i === 0 || arr[i - 1] <= v);
// isAscending([1, 2, 2, 9]) → true, isAscending([3, 1]) → false`,
      },
      explanation: `**Bug 1: comparing addresses.** \`sort()\` sorts the array in place and returns the **same array**. So \`prices === sorted\` is always true. The helper can never fail.

**Bug 2: sorting as text.** With no compare function, numbers are compared as text. As text, "100" < "25" < "5". So \`[100, 25, 5]\` is already "sorted", and \`sort()\` leaves it as \`[ 100, 25, 5 ]\`. That is why the last line looks unchanged. The helper did sort it; the text order just happened to match.

**Bug 3: changing the caller's array.** With other input, say \`[25, 5]\`, the helper reorders the caller's array. Later steps of the test then work with wrong data.

**Fixes:** copy first with spread (or use \`toSorted\` in Node 20+). Sort with \`(a, b) => a - b\`. Compare item by item with \`every\`. Or skip sorting and just check each pair of neighbours.`,
      fnName: 'checkPrices',
      tests: [
        { args: [[5, 25, 100]], expected: { result: true, pricesAfter: [5, 25, 100] } },
        { args: [[100, 25, 5]], expected: { result: false, pricesAfter: [100, 25, 5] } },
        { args: [[25, 5, 100]], expected: { result: false, pricesAfter: [25, 5, 100] } },
        { args: [[1, 2, 2, 9]], expected: { result: true, pricesAfter: [1, 2, 2, 9] } },
        { args: [[]], expected: { result: true, pricesAfter: [] } },
        { args: [[3, 1]], expected: { result: false, pricesAfter: [3, 1] }, hidden: true },
        { args: [[9.99, 15.5, 100]], expected: { result: true, pricesAfter: [9.99, 15.5, 100] }, hidden: true },
      ],
      followUps: [
        {
          q: 'What would the buggy helper do to the array [25, 5, 100]?',
          a: 'It would change it to [ 100, 25, 5 ], because as text "100" < "25" < "5". It would still return true. So the test passes, and the caller now holds a reordered array. That is two failures at once.',
        },
        {
          q: 'How would you use this helper in a Playwright test?',
          a: 'Read the prices with `await page.getByTestId("price").allTextContents()`. Turn each into a number with `Number(text.replace("$", ""))`. Then check `expect(isAscending(prices)).toBe(true)`. Even better, compare with a sorted copy: `expect(prices).toEqual([...prices].sort((a, b) => a - b))`. Then a failure message shows both arrays.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-output-puzzles-iq-01',
      difficulty: 'easy',
      question:
        'What does this timer loop print, and why? Then give two different fixes: `for (var i = 1; i <= 3; i++) { setTimeout(() => console.log(i), i * 100); }`',
      context: 'The most common output question in JavaScript and SDET screening rounds.',
      whatInterviewerLooksFor: [
        'Correct output (4, 4, 4) and the reason: there is only one shared var i',
        'Knows the callbacks run after the loop has finished',
        'Gives at least two fixes (let, or passing the value) and says why each works',
        'Notices that the delays are still 100, 200 and 300 ms',
      ],
      modelAnswer: `**Output:** \`4\`, \`4\`, \`4\`, printed at about 100, 200 and 300 ms.

**Step by step**
1. \`var i\` is not tied to the loop block. So there is only **one** \`i\` for the whole loop.
2. The loop runs at once. It sets up three timers and moves \`i\` to 2, then 3, then 4. At 4, \`i <= 3\` is false, so the loop stops.
3. The delay \`i * 100\` is worked out inside each round (100, 200, 300). So the timers are still spaced out correctly.
4. When each timer runs, its arrow function reads the shared \`i\`. By now it is 4.

**Fix 1: use \`let\`**

    for (let i = 1; i <= 3; i++) {
      setTimeout(() => console.log(i), i * 100);
    }

A \`let\` in \`for (...)\` gives each round its own \`i\`. So the callbacks print 1, 2, 3.

**Fix 2: pass the value**

    for (var i = 1; i <= 3; i++) {
      setTimeout((n) => console.log(n), i * 100, i);
    }

Extra arguments to \`setTimeout\` are handed to the callback. So the value is copied when the timer is set up. Older code does the same with an IIFE (a function called right where it is written): \`((n) => setTimeout(() => console.log(n), n * 100))(i)\`.

**Why it matters for QA:** listeners such as \`page.on('response', ...)\` added in a loop have exactly the same trap.`,
      followUps: [
        {
          q: 'What if I change var to let but move the declaration outside: `let i = 1; for (; i <= 3; i++) {...}`?',
          a: 'Then it prints 4, 4, 4 again. The "new i for each round" rule only works for a let inside for (...). A let declared before the loop is one variable shared by every callback, just like var.',
        },
        {
          q: 'What if all the delays are 0 instead of i * 100?',
          a: 'With var it still prints 4, 4, 4, just all at once after the normal code finishes. A 0 ms timer never runs during the loop. It waits until all normal code and all promise callbacks are done.',
        },
      ],
      pitfalls: [
        'Answering 1, 2, 3 or 0, 1, 2 (forgetting that the timers run after the loop).',
        'Answering 3, 3, 3 (forgetting the last i++ that ends the loop).',
        'Saying "use an arrow function" as the fix. How the function is written does not matter.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-02',
      difficulty: 'medium',
      question:
        'Explain this: `var x = 10; function test() { console.log(x); if (false) { var x = 20; } } test();` Why does it not print 10, even though the if block never runs?',
      whatInterviewerLooksFor: [
        'Answers undefined',
        'Explains that var is hoisted to the top of the function, ignoring blocks',
        'Separates the declaration (hoisted) from the assignment (never runs)',
        'Can compare it with let/const',
      ],
      modelAnswer: `**Output:** \`undefined\`.

**Step by step**
1. When \`test\` is called, JavaScript first reads every declaration in the function. This is **hoisting**. \`var\` ignores \`{ }\` blocks. So \`var x\` inside \`if (false)\` still creates a local \`x\` for the **whole** function, set to \`undefined\`.
2. That local \`x\` **shadows** (hides) the global \`x = 10\`, from the first line of the function.
3. \`console.log(x)\` reads the local \`x\`: \`undefined\`.
4. The \`if (false)\` body never runs. So \`x = 20\` never happens. Only the *declaration* moved up, never the value.

You can picture JavaScript rewriting the function like this:

    function test() {
      var x;            // hoisted declaration
      console.log(x);   // undefined
      if (false) { x = 20; }
    }

**Compare with let**

    var x = 10;
    function test() { console.log(x); if (false) { let x = 20; } }

This prints **10**. A \`let\` belongs only to the \`if\` block. So the function has no local \`x\`, and the lookup goes out to the global one.

**The rule I use:** to find a name, look for the nearest scope that *declares* it anywhere. Then apply that keyword's hoisting rule.`,
      followUps: [
        {
          q: 'What if the function uses `let x = 20;` at its top level after the console.log, instead of var inside the if?',
          a: 'Then console.log(x) throws ReferenceError: Cannot access x before initialization. The let is hoisted to the top of the function and hides the global. But it stays locked (in the Temporal Dead Zone) until its line runs.',
        },
        {
          q: 'How would a linter or TypeScript help here?',
          a: 'ESLint rules such as no-var, no-shadow and block-scoped-var flag this pattern. Using const and let everywhere removes this whole kind of bug. The variable stays in its block, and early use throws instead of quietly giving undefined.',
        },
      ],
      pitfalls: [
        'Answering 10 because "the if never runs".',
        'Answering 20 because "var is hoisted with its value".',
        'Saying ReferenceError, mixing up var with let.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-03',
      difficulty: 'medium',
      question:
        'A reporter class crashes when its method is passed to forEach: `class Reporter { constructor() { this.passed = 0; } record() { this.passed++; } } const r = new Reporter(); ["t1", "t2"].forEach(r.record);` What happens, and how do you fix it?',
      whatInterviewerLooksFor: [
        'Predicts TypeError: Cannot read properties of undefined (reading passed)',
        'Explains that passing r.record loses the object, and that class code is strict',
        'Offers several fixes: arrow wrapper, bind, class-field arrow, forEach thisArg',
        'Links it to Page Object methods passed as callbacks',
      ],
      modelAnswer: `**Output:** it throws **TypeError: Cannot read properties of undefined (reading 'passed')** on the first item. \`r.passed\` stays 0.

**Step by step**
1. \`r.record\` without \`()\` is just the function itself. It does **not** remember \`r\`.
2. \`forEach\` calls it as a plain function: \`callback(element, index, array)\`. Nothing is left of the dot.
3. In a plain call, \`this\` is \`undefined\` in strict code. Class code is always strict.
4. So \`this.passed++\` tries to read a property of \`undefined\`. That is a TypeError.

**Fixes (each one records correctly)**

    ["t1", "t2"].forEach(() => r.record());      // 1. arrow wrapper: call with a dot
    ["t1", "t2"].forEach(r.record.bind(r));      // 2. bind the receiver
    ["t1", "t2"].forEach(r.record, r);           // 3. forEach's thisArg

    class Reporter {                             // 4. class-field arrow
      passed = 0;
      record = () => { this.passed++; };
    }

After any fix, \`r.passed\` is 2.

**Where this shows up in test code:** \`retry(loginPage.submit)\`, \`page.on('dialog', handler.accept)\` or \`test.step('x', basePage.open)\`. Whenever a method is passed instead of called, \`this\` is lost.`,
      followUps: [
        {
          q: 'What if Reporter were a plain object literal in a sloppy (non-module) script instead of a class?',
          a: 'Then this would be the global object, not undefined. `this.passed++` would create a global `passed` with the value NaN, and nothing would throw. r.passed stays 0. That silent bug is worse than a crash.',
        },
        {
          q: 'What is the trade-off of the class-field arrow fix?',
          a: 'Each object gets its own copy of the function, which uses more memory. It is also not on the prototype, the shared parent object that holds class methods. So a subclass cannot reach it with super. It is handy for callbacks, but bind or an arrow wrapper at the call site keeps methods shared.',
        },
      ],
      pitfalls: [
        'Saying it works because "record belongs to r".',
        'Trying to fix it by turning record into a regular function expression (no change).',
        'Not knowing that class code is always strict mode.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-04',
      difficulty: 'hard',
      question:
        'Put these six log lines in order and explain each position: `console.log("start"); setTimeout(() => console.log("timeout"), 0); (async () => { console.log("async start"); await null; console.log("async end"); })(); Promise.resolve().then(() => console.log("promise")); console.log("end");`',
      whatInterviewerLooksFor: [
        'Correct order: start, async start, end, async end, promise, timeout',
        'Knows an async function runs as normal code until its first await',
        'Explains that microtasks run first in, first out, so async end is queued before promise',
        'Explains that timers wait until every microtask is done',
      ],
      modelAnswer: `**Output**

    start
    async start
    end
    async end
    promise
    timeout

**Trace with three columns: Output, Microtasks, Timers**
1. \`start\` prints.
2. \`setTimeout(..., 0)\` puts "timeout" in the **Timers** column.
3. The async arrow function starts **at once**, as normal code. \`async start\` prints. At \`await null\`, the rest of the function ("async end") goes into the **Microtasks** column. Control goes back to the script.
4. \`Promise.resolve().then(...)\`: the promise is already resolved. So "promise" goes into Microtasks, **after** "async end".
5. \`end\` prints. The normal code is done.
6. Run the microtasks in order: \`async end\`, then \`promise\`.
7. Take one timer: \`timeout\`.

**The rules I am using**
- Normal code runs first.
- An async function runs as normal code until its first \`await\`.
- \`await\` on a plain value still pauses. The rest of the function goes into the microtask queue.
- Microtasks run in the order they were added. All of them run before any timer.

**Why testers care:** this is why a missing \`await\` before a Playwright call lets the next line run first. It is also why a check inside \`.then\` may run after the test has already ended.`,
      followUps: [
        {
          q: 'What if the .then line is moved above the async IIFE?',
          a: 'Then "promise" is queued first. The order becomes start, async start, end, promise, async end, timeout. Microtasks run in the order they were added, so the position of the line that adds them decides the order.',
        },
        {
          q: 'What if `await null` becomes `await new Promise(r => setTimeout(r, 0))`?',
          a: 'Now "async end" waits for a new timer, which was created after the "timeout" timer. Order: start, async start, end, promise, timeout, async end. The awaited promise finishes only when its own timer runs, and that timer is behind the first one.',
        },
      ],
      pitfalls: [
        'Printing "async start" after "end" (thinking the whole async function waits).',
        'Putting "timeout" before the promise lines because its delay is 0.',
        'Guessing "promise" before "async end" without tracing the queue order.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-05',
      difficulty: 'medium',
      question:
        'Work out each expression out loud and explain the type conversion: `[] + []`, `[] + {}`, `"5" - - "2"`, `true + true + "1"`, `[10] == 10`.',
      whatInterviewerLooksFor: [
        'Correct values: "", "[object Object]", 7, "21", true',
        'Explains that arrays and objects turn into strings first',
        'Explains left-to-right order, and when + switches to joining text',
        'Gives the type of each result',
      ],
      modelAnswer: `**Results:** \`""\` (empty string), \`"[object Object]"\`, \`7\`, \`"21"\`, \`true\`.

**Step by step**
- **\`[] + []\`**: \`+\` first turns each array into a simple value. An array becomes its items joined with commas, so \`[]\` → \`""\`. Then \`"" + ""\` → **""** (a string).
- **\`[] + {}\`**: \`""\` + \`"[object Object]"\` → **"[object Object]"**. (Typed alone at the start of a console line, \`{} + []\` may show 0, because \`{}\` is read as an empty block. So always test these inside \`console.log(...)\`.)
- **\`"5" - - "2"\`**: the second minus sits in front of \`"2"\` on its own. So \`-"2"\` → -2 (a number). Then \`"5" - (-2)\`: minus turns "5" into 5. 5 + 2 → **7**.
- **\`true + true + "1"\`**: left to right. \`true + true\` → 1 + 1 → 2. No strings yet, so it adds numbers. Then \`2 + "1"\` → **"21"**.
- **\`[10] == 10\`**: \`==\` between an array and a number converts the array: \`[10]\` → "10" → 10. Then \`10 == 10\` → **true**.

**My rule of thumb**
1. Work out one operator at a time, left to right. A single \`-\` or \`+\` in front of a value goes first.
2. If \`+\` sees a string, it joins text. Every other maths operator turns values into numbers.
3. In real code, avoid all this. Convert on purpose with \`Number()\` or \`String()\`, and compare with \`===\`.`,
      followUps: [
        {
          q: 'What does `[1, 2] == "1,2"` give, and `[1, 2] === "1,2"`?',
          a: 'The first is true: the array becomes the string "1,2", and the strings match. The second is false, because === never converts, and an array is not a string. This is why test checks should use strict equality, or toEqual on real arrays.',
        },
        {
          q: 'What is `+[]` and `+{}`?',
          a: '+[] is 0, because [] becomes "" and "" becomes 0. +{} is NaN, because {} becomes "[object Object]", which is not a number. A single + in front of a value works just like Number(...).',
        },
      ],
      pitfalls: [
        'Saying [] + [] is [] (an empty array).',
        'Working out true + true + "1" as "truetrue1".',
        'Reading "5" - - "2" as a syntax error, or as 3.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-06',
      difficulty: 'medium',
      question:
        'What two values does this reset helper print, and why? `function reset(data) { data.items.push("extra"); data = { items: [] }; return data.items.length; } const order = { items: ["pen"] }; console.log(reset(order), order.items);`',
      whatInterviewerLooksFor: [
        'Correct output: 0 [ \'pen\', \'extra\' ]',
        'Explains that JavaScript passes a copy of the address (called "call by sharing")',
        'Separates changing the object (the caller sees it) from reassigning the parameter (local only)',
        'Links it to shared test data changed by helpers',
      ],
      modelAnswer: `**Output:** \`0 [ 'pen', 'extra' ]\`

**Step by step**
1. \`order\` points to one object box: \`{ items: ['pen'] }\`.
2. Calling \`reset(order)\` copies the **address** into the parameter \`data\`. Now \`order\` and \`data\` point to the same box.
3. \`data.items.push("extra")\` **changes** that shared box. So the caller's \`order.items\` is now \`['pen', 'extra']\`.
4. \`data = { items: [] }\` **reassigns** only the local parameter. \`data\` now points to a brand-new box. \`order\` still points to the old one.
5. \`return data.items.length\` reads the new box: \`0\`.
6. \`console.log\` prints \`0\` and then the caller's array: \`[ 'pen', 'extra' ]\`.

**In one line:** JavaScript always passes a copy of the value. For an object, that value is its address. So you can change the object the caller sees. But you cannot make the caller's variable point somewhere else.

**Test-automation impact:** say a shared object \`const validUser = {...}\` goes into a helper that "tweaks" it, like \`user.email = ''\` for a negative test. The change leaks into later tests. Give each test a fresh copy: \`structuredClone(validUser)\`, or a factory function that returns a new object on every call.`,
      followUps: [
        {
          q: 'What if the first line inside reset were `data.items = []` instead of push?',
          a: 'Then the caller sees order.items as an empty array. Setting a property on the shared object still changes that object. The output would be 0 []. Reassigning data afterwards changes nothing for the caller.',
        },
        {
          q: 'Would passing `{ ...order }` into reset protect the caller?',
          a: 'Only partly. Spread makes a new outer object, but its items property still points to the same array. So the push still changes order.items. A deep copy with structuredClone(order) fully protects it.',
        },
      ],
      pitfalls: [
        'Saying objects are passed "by reference", so order now has an empty items array.',
        'Answering 1 for the length, forgetting the reassignment.',
        'Thinking the push is undone because data was reassigned.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-07',
      difficulty: 'hard',
      question:
        'Three variables, one array: `const a = [3, 1, 2]; const b = a.sort(); const c = a.reverse(); console.log(a, b, c, a === c);` What is printed, and what does it teach you about array methods?',
      whatInterviewerLooksFor: [
        'Correct output: [ 3, 2, 1 ] three times, then true',
        'Knows sort and reverse change the array in place and return the same array',
        'Mentions toSorted/toReversed, or copying first',
        'Links it to test helpers that spoil scraped data',
      ],
      modelAnswer: `**Output:** \`[ 3, 2, 1 ] [ 3, 2, 1 ] [ 3, 2, 1 ] true\`

**Step by step**
1. \`a\` points to one array box: \`[3, 1, 2]\`.
2. \`a.sort()\` sorts **that same box** to \`[1, 2, 3]\`. It returns **the same box**, not a copy. So \`b === a\`.
3. \`a.reverse()\` also works in place. The one box becomes \`[3, 2, 1]\`, and \`c\` is again the same box.
4. All three variables point to one array. So all print \`[ 3, 2, 1 ]\`, and \`a === c\` is \`true\`.

Most people expect \`b\` to be \`[ 1, 2, 3 ]\`, because "b was set before the reverse". But the assignment copied the **address**, not the contents. So later changes show through.

**Changes the array vs makes a new one**

| Changes the array and returns it | Returns a new array |
|---|---|
| \`sort\`, \`reverse\`, \`splice\`, \`fill\`, \`copyWithin\` | \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\` (ES2023), \`slice\`, \`map\`, \`filter\`, \`concat\` |

**Safe versions**

    const sorted = [...a].sort((x, y) => x - y);
    const reversed = a.toReversed();   // Node 20+

**In tests:** to check sort order on a page, I read the values once. Then I compare them with a sorted *copy*. I never compare with \`values.sort()\`, because that compares the array with itself.`,
      followUps: [
        {
          q: 'What changes if line 2 is `const b = [...a].sort();`?',
          a: 'Then b is its own sorted array [ 1, 2, 3 ], and a is only reversed: [ 2, 1, 3 ]. c is the same box as a. So the output is [ 2, 1, 3 ] [ 1, 2, 3 ] [ 2, 1, 3 ] true.',
        },
        {
          q: 'Why might `[10, 9, 1].sort()` surprise someone here?',
          a: 'With no compare function, the values are compared as text. So the result is [ 1, 10, 9 ]: "10" comes before "9" because "1" < "9". For numbers, always pass (x, y) => x - y.',
        },
      ],
      pitfalls: [
        'Printing b as [ 1, 2, 3 ] (thinking sort returns a copy).',
        'Answering false for a === c.',
        'Not knowing any method that leaves the array unchanged.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-08',
      difficulty: 'hard',
      question:
        'A counter is built with an IIFE (a function that runs right where it is written). It has a getter, and one value is destructured part-way: `const counter = (() => { let n = 0; return { inc: () => ++n, get value() { return n; } }; })(); counter.inc(); counter.inc(); const { value } = counter; counter.inc(); console.log(value, counter.value);` Explain the result.',
      whatInterviewerLooksFor: [
        'Correct output: 2 3',
        'Explains that the IIFE runs once, and the closure keeps n private and alive',
        'Explains that destructuring reads the getter once (a snapshot)',
        'Mentions the same snapshot problem with spread',
      ],
      modelAnswer: `**Output:** \`2 3\`

**Step by step**
1. The arrow function runs **once**, right away. It creates a local \`n = 0\` and returns an object with \`inc\` and a \`value\` getter. A **getter** is a property that runs a function each time you read it.
2. Both \`inc\` and the getter remember the same \`n\`. Nothing outside can reach \`n\` directly, so it is private.
3. \`counter.inc()\` twice → \`n\` is 2.
4. \`const { value } = counter\` **runs the getter once**. It stores the number 2 in a plain local variable. It keeps no link to the getter.
5. \`counter.inc()\` → \`n\` is 3.
6. \`value\` is still the saved \`2\`. \`counter.value\` runs the getter again and reads the live \`n\`: \`3\`.

**Two ideas in one question**
- **Closures keep variables alive.** \`n\` still exists after the outer function returns, because \`inc\` and the getter still use it.
- **Reading a getter copies its current value.** Destructuring, spread (\`{ ...counter }\`) and \`JSON.stringify\` all save the value at that moment.

**Where it shows up in tests:** say you write \`const { count } = cartState\` at the start of a test. Later actions change the state, but \`count\` keeps the old number. Read the live value right before the check.`,
      followUps: [
        {
          q: 'What if value were a normal property `value: n` instead of a getter?',
          a: 'Then it is worked out once, when the object is created. So counter.value would be 0 forever, and the output would be 0 0. Changing n never touches a plain property that copied it at the start.',
        },
        {
          q: 'What does `const copy = { ...counter }; counter.inc(); console.log(copy.value)` print at the end of the original snippet?',
          a: 'Spread runs the getter at copy time and stores a plain value. If you copy after the third inc (n = 3), copy.value is 3, and later incs do not change it. But copy.inc still points at the shared function, so copy.inc() would still increase the original n.',
        },
      ],
      pitfalls: [
        'Answering 3 3 (thinking destructuring keeps a live link).',
        'Answering 0 3, or thinking the IIFE runs again on each read.',
        'Not recognising the get syntax as a getter.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-09',
      difficulty: 'easy',
      question:
        'Predict the three lines from this profile-check code: `const user = { profile: null }; console.log(user && user.profile && user.profile.email); console.log(user.profile?.email ?? "no email"); console.log(!!user.profile, !!user);`',
      whatInterviewerLooksFor: [
        'Correct output: null / no email / false true',
        'Knows && returns one of its values, not a boolean',
        'Explains that ?. stops early with undefined, and ?? supplies a default',
        'Uses !! to explain truthiness',
      ],
      modelAnswer: `**Output**

    null
    no email
    false true

**Step by step**
1. **\`user && user.profile && user.profile.email\`**: \`&&\` returns the first falsy value, or the last value if all are truthy. \`user\` is an object, so it is truthy; move on. \`user.profile\` is \`null\`, which is falsy. So **stop and return \`null\`**. The third part never runs, which is why there is no TypeError. The printed value is \`null\`, not \`false\`.
2. **\`user.profile?.email ?? "no email"\`**: \`?.\` (optional chaining) sees that \`user.profile\` is null. It stops and gives \`undefined\` instead of throwing. Then \`??\` replaces \`undefined\` with \`"no email"\`.
3. **\`!!user.profile, !!user\`**: two \`!\` signs turn any value into a real boolean. \`null\` → \`false\`. Any object → \`true\`.

**Why interviewers ask this:** the old guard \`a && a.b && a.b.c\` and the modern \`a?.b?.c\` both protect against "Cannot read properties of null". But they return different things: \`null\` vs \`undefined\`. Also, \`||\` and \`??\` differ when the real value is \`0\` or \`""\`.

**In API tests,** I prefer \`body.user?.email\`, plus a clear check that the profile exists first. Then a missing field fails loudly with a clear message. It does not quietly turn into a default value.`,
      followUps: [
        {
          q: 'What if profile is `{ email: "" }` and we use `|| "no email"` instead of `??`?',
          a: 'Then `user.profile?.email || "no email"` gives "no email", because "" is falsy. But `?? "no email"` gives "", because "" is not null or undefined. Use ?? when empty strings or zero are valid values you want to keep.',
        },
        {
          q: 'What if user itself is null in line 2?',
          a: 'user.profile?.email would throw a TypeError. The ?. only protects the step right after it. Reading .profile on null has no protection. You need user?.profile?.email.',
        },
      ],
      pitfalls: [
        'Saying line 1 prints false or undefined.',
        'Thinking line 1 throws a TypeError.',
        'Mixing up ?? and ||.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-10',
      difficulty: 'expert',
      question:
        'Default parameters that read outer state: `let count = 0; function next(id = ++count) { return id; } console.log(next(), next(5), next(), count);` What prints? And what changes if the signature becomes `function pair(a = b, b = 1)`?',
      whatInterviewerLooksFor: [
        'Correct output: 1 5 2 2',
        'Knows defaults are worked out at call time, and only when the argument is undefined',
        'Knows parameters are set left to right, each with its own TDZ',
        'Clear step-by-step explanation',
      ],
      modelAnswer: `**Output:** \`1 5 2 2\`

**Step by step**
1. The arguments of \`console.log\` are worked out left to right.
2. \`next()\`: no argument, so the default \`++count\` **runs now**. count becomes 1 and \`id\` is 1. Returns **1**.
3. \`next(5)\`: an argument was passed, so the default does **not run at all**. count stays 1. Returns **5**.
4. \`next()\`: the default runs again. count becomes 2. Returns **2**.
5. \`count\` is read last: **2**.

Defaults are not worked out once, when the function is written. (Python works that way; JavaScript does not.) They run again on every call that needs them, and they can change other variables.

**Part two: \`function pair(a = b, b = 1)\`**

Parameters act like \`let\` variables, set **left to right**. Each one is locked (in the TDZ) until its turn:

    function pair(a = b, b = 1) { return [a, b]; }
    pair();        // ReferenceError: Cannot access 'b' before initialization
    pair(7);       // [ 7, 1 ] — a's default never runs
    function pairOk(a = 1, b = a * 2) { return [a, b]; }
    pairOk();      // [ 1, 2 ]

So a default may use **earlier** parameters, never later ones.

**Test relevance:** a test data factory like \`function makeUser(id = ++seq)\` gives a unique ID only when you pass no ID. That is what you want. But passing \`undefined\` on purpose still uses up a number.`,
      followUps: [
        {
          q: 'What does `next(undefined)` do, and `next(null)`?',
          a: 'next(undefined) uses the default, just like a missing argument, so count goes up. next(null) passes a real value. Nothing is added, and it returns null. Only undefined turns on a default.',
        },
        {
          q: 'What is `next.length`?',
          a: 'It is 0. A function\'s length counts the parameters before the first one with a default (or a rest parameter). id has a default, so nothing is counted.',
        },
      ],
      pitfalls: [
        'Answering 1 5 1 1 (thinking the default is worked out only once).',
        'Thinking next(5) still increases count.',
        'Saying pair() returns [ undefined, 1 ].',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-output-puzzles-drill-1',
      question:
        'Write the full output, line by line, of this pipeline script: `var stage = "build"; let runs = 0; function pipeline() { console.log(stage); var stage = "test"; runs++; console.log(stage, runs); if (true) { let stage = "deploy"; console.log(stage); } console.log(stage); return typeof report; function report() {} } console.log(pipeline()); console.log(stage, runs);`',
      assumptions: [
        'It runs as a plain (non-module) script with node.',
        'The code, one statement per line, is: var stage = "build" / let runs = 0 / function pipeline() { console.log(stage) / var stage = "test" / runs++ / console.log(stage, runs) / if (true) { let stage = "deploy"; console.log(stage) } / console.log(stage) / return typeof report / function report() {} } / console.log(pipeline()) / console.log(stage, runs).',
        'There are six console.log calls. Write one output line per call, in the order they run.',
      ],
      steps: [
        { label: 'Read declarations first (global)', calc: 'stage → undefined (var). runs → locked in the TDZ (let). pipeline → the function. Then the lines run: stage = "build", runs = 0.' },
        { label: 'Read declarations first (inside pipeline)', calc: 'A local var stage → undefined. It hides the global stage for the whole function. report → the function (hoisted, even though it sits after return).' },
        { label: 'Line 1: console.log(stage)', calc: 'Reads the LOCAL stage, which is still undefined → prints `undefined`.' },
        { label: 'Line 2: console.log(stage, runs)', calc: 'The local stage is now "test". runs is the global let, which the function can reach. It becomes 1 → prints `test 1`.' },
        { label: 'Line 3: inside the if block', calc: 'A new let stage = "deploy" hides the local var, but only inside the block → prints `deploy`.' },
        { label: 'Line 4: after the block', calc: 'The block is over, so we are back to the function\'s var stage → prints `test`.' },
        { label: 'Line 5: console.log(pipeline())', calc: 'return typeof report → the hoisted function exists → prints `function`.' },
        { label: 'Line 6: console.log(stage, runs)', calc: 'The global stage was never touched, because the function wrote to its own local one → "build". runs went up once → prints `build 1`.' },
      ],
      answer: `Output:

1. \`undefined\`
2. \`test 1\`
3. \`deploy\`
4. \`test\`
5. \`function\`
6. \`build 1\``,
      insight:
        'For every name, find the nearest scope that declares it anywhere. Then apply that keyword\'s hoisting rule. A function declaration placed after return is still hoisted. A var inside a function never touches a global with the same name. But a function can freely change an outer let that it does not declare again (runs).',
      followUps: [
        {
          q: 'What changes if `var stage = "test"` becomes `let stage = "test"`?',
          a: 'The first console.log(stage) inside pipeline now hits the Temporal Dead Zone. It throws ReferenceError: Cannot access stage before initialization. Nothing else in pipeline runs. The error is not caught, so the last line of the script never runs either.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-2',
      question:
        'Ten numbered labels race through three timers, a two-step promise chain and an async IIFE. Write the exact print order of labels 1 to 10. The code is in the givens.',
      assumptions: [
        'Code: `console.log("1"); setTimeout(() => console.log("2"), 10); setTimeout(() => { console.log("3"); Promise.resolve().then(() => console.log("4")); }, 0); Promise.resolve().then(() => { console.log("5"); setTimeout(() => console.log("6"), 0); }).then(() => console.log("7")); (async () => { console.log("8"); await null; console.log("9"); })(); console.log("10");`',
        'It runs in Node or a browser. The whole normal (synchronous) part finishes in well under 10 ms.',
        'Keep three columns: Output, Microtasks and Timers.',
        'Timers with the same delay run in the order they were created. A 10 ms timer runs after 0 ms timers created at about the same time.',
      ],
      steps: [
        { label: 'Normal code', calc: 'Print 1. Timers: [2 @10ms, T3 @0ms]. Microtasks: [then5]. The async IIFE prints 8, then hits await → Microtasks: [then5, rest9]. Print 10. Output so far: 1, 8, 10.' },
        { label: 'Run microtasks (1)', calc: 'then5 prints 5 and creates timer 6 @0ms → Timers: [T3, 6, 2@10ms]. Its .then(7) is now queued → Microtasks: [rest9, then7].' },
        { label: 'Run microtasks (2)', calc: 'rest9 prints 9. then7 prints 7. The microtask queue is now empty. Output: 1, 8, 10, 5, 9, 7.' },
        { label: 'First timer', calc: 'T3 prints 3 and queues a microtask (4). Microtasks run before the next timer → prints 4.' },
        { label: 'Second timer', calc: 'Timer 6 (0 ms, created during the microtasks) prints 6.' },
        { label: 'Last timer', calc: 'The 10 ms timer prints 2.' },
      ],
      answer: `Output: **1, 8, 10, 5, 9, 7, 3, 4, 6, 2** (one per line).`,
      insight:
        'Write the queues down. There are two traps. (a) The async function body before await runs as normal code, so 8 comes early. (b) A microtask created inside a timer runs before the NEXT timer, so 4 comes before 6. Timer 2 is last only because of its 10 ms delay.',
      followUps: [
        {
          q: 'What if the 10 ms delay on label 2 becomes 0?',
          a: 'Timer 2 was created first of all, so it becomes the first timer to run: 1, 8, 10, 5, 9, 7, 2, 3, 4, 6. Timers with equal delays run in the order they were created, and timer 6 was created last (during the microtasks).',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-3',
      question:
        'Work through this type-conversion worksheet. Write each printed line: `console.log(1 + "1" - 1); console.log("3" + 4 * 5); console.log([] + null + 1); console.log([2] * [3]); console.log(true + null); console.log("" == []); console.log(NaN === NaN || Object.is(NaN, NaN)); console.log(typeof (1 / 0)); console.log(0 === -0, Object.is(0, -0)); console.log({} == "[object Object]");`',
      assumptions: [
        'Ten separate console.log statements, each on its own line.',
        'Write strings without quotes, the way Node prints top-level strings.',
        'Do * before +. Otherwise work left to right.',
      ],
      steps: [
        { label: '1 + "1" - 1', calc: '1 + "1" → "11" (joins text). "11" - 1 → 10 (minus turns it into a number). Prints 10.' },
        { label: '"3" + 4 * 5', calc: '* goes first: 20. "3" + 20 → "320". Prints 320.' },
        { label: '[] + null + 1', calc: '[] → "". "" + null → "null". "null" + 1 → "null1". Prints null1.' },
        { label: '[2] * [3]', calc: '* turns both into numbers: "2" → 2, "3" → 3. Prints 6.' },
        { label: 'true + null', calc: 'No strings here: 1 + 0 → 1. Prints 1.' },
        { label: '"" == []', calc: '[] → "". "" == "" → true. Prints true.' },
        { label: 'NaN === NaN || Object.is(NaN, NaN)', calc: 'The first part is false. Object.is treats NaN as equal to itself → true. Prints true.' },
        { label: 'typeof (1 / 0)', calc: '1 / 0 is Infinity, which is a number. Prints number.' },
        { label: '0 === -0, Object.is(0, -0)', calc: '=== says true. Object.is tells 0 and -0 apart → false. Prints true false.' },
        { label: '{} == "[object Object]"', calc: 'The object turns into its string form "[object Object]" → equal. Prints true.' },
      ],
      answer: `Output:

1. \`10\`
2. \`320\`
3. \`null1\`
4. \`6\`
5. \`1\`
6. \`true\`
7. \`true\`
8. \`number\`
9. \`true false\`
10. \`true\``,
      insight:
        'Two habits solve every line. Work out one operator at a time, in the right order. Write the TYPE of each in-between value. Once a string appears, + joins text. Every other maths operator turns values into numbers.',
      followUps: [
        {
          q: 'Line 3 becomes `[] + undefined + 1`. What prints?',
          a: 'undefined1. [] becomes the empty string. "" + undefined is the string "undefined". Joining 1 gives "undefined1". Compare `undefined + 1` alone: it is NaN, because no string is involved.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-4',
      question:
        'Trace the shared objects in this test data script. Write each logged line: `const base = { tags: ["smoke"], meta: { owner: "qa" }, count: 1 }; const copy = { ...base, count: 2 }; const list = [base, copy]; const sorted = list; copy.tags.push("api"); copy.meta = { owner: "dev" }; sorted.push({ tags: [] }); console.log(base.tags); console.log(base.meta.owner); console.log(base.count, copy.count); console.log(list.length); console.log(list[0] === base); console.log(copy.tags === base.tags); const ids = [5, 25, 100, 1]; const out = ids.sort(); console.log(out === ids, ids);`',
      assumptions: [
        'One statement per line, 16 lines in total, run with node.',
        'Arrays print the Node way, e.g. [ \'smoke\' ].',
        'Draw a box for each object and an arrow for each variable before you answer.',
      ],
      steps: [
        { label: 'Draw the memory picture', calc: 'copy is a NEW outer object. But copy.tags and copy.meta point at base\'s tags array and meta object, because spread copies one level only. count is a number, so it is copied, then set to 2.' },
        { label: 'list and sorted', calc: 'sorted = list copies the arrow, not the array. So one array box has two names.' },
        { label: 'copy.tags.push("api")', calc: 'Changes the SHARED tags array → base.tags is now [ \'smoke\', \'api\' ].' },
        { label: 'copy.meta = { owner: "dev" }', calc: 'Points copy\'s own property at a new object. base.meta is not touched ("qa").' },
        { label: 'sorted.push(...)', calc: 'Same box as list → list.length becomes 3.' },
        { label: 'Logs 1–6', calc: '[ \'smoke\', \'api\' ] / qa / 1 2 / 3 / true / true.' },
        { label: 'ids.sort()', calc: 'Text order: "1" < "100" < "25" < "5" → [ 1, 100, 25, 5 ]. It sorts in place and returns the same array → out === ids is true.' },
      ],
      answer: `Output:

1. \`[ 'smoke', 'api' ]\`
2. \`qa\`
3. \`1 2\`
4. \`3\`
5. \`true\`
6. \`true\`
7. \`true [ 1, 100, 25, 5 ]\``,
      insight:
        'Spread copies one level. Pushing into a nested array is shared, but replacing a nested property (copy.meta = ...) is not. Giving an array a new name never copies it. These are the same bugs that make one test\'s data changes leak into another test.',
      followUps: [
        {
          q: 'How would you change line 2 so that base.tags stays [ \'smoke\' ]?',
          a: 'Copy the nested array too: `const copy = { ...base, tags: [...base.tags], count: 2 }`. Or deep-copy everything with `structuredClone(base)` and then set count. Either way, copy.tags becomes its own array, and the push no longer reaches base.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-5',
      question:
        'Trace `this` and closures through this Suite class. Write every logged line: `class Suite { constructor(name) { this.name = name; this.results = []; } add(r) { this.results.push(r); return this; } summary() { return this.name + ": " + this.results.length; } kinds() { return this.results.map(function () { return typeof this; }); } names() { return this.results.map(() => this.name); } } const s = new Suite("smoke").add("pass").add("fail"); console.log(s.summary()); console.log(s.kinds()); console.log(s.names()); const fn = s.summary; try { fn(); } catch (e) { console.log(e.constructor.name); } const bound = s.summary.bind({ name: "other", results: [1] }); console.log(bound()); const makeCounter = () => { let n = 0; return () => n++; }; const c = makeCounter(); c(); c(); console.log(c(), makeCounter()());`',
      assumptions: [
        'Class code always uses strict mode.',
        'The code has one statement per line (about 20 lines).',
        'There are six console.log calls. Arrays print the Node way.',
      ],
      steps: [
        { label: 'Chained setup', calc: 'add returns this, so .add("pass").add("fail") works on the same object: results = [ \'pass\', \'fail\' ].' },
        { label: 's.summary()', calc: 'Called with a dot → this = s → "smoke: 2".' },
        { label: 's.kinds()', calc: 'map calls the regular function as a plain call. Class code is strict, so this is undefined → [ \'undefined\', \'undefined\' ].' },
        { label: 's.names()', calc: 'The arrow uses the this of names(), which is s → [ \'smoke\', \'smoke\' ].' },
        { label: 'fn()', calc: 'A method taken off its object and called plainly → this is undefined. Reading this.name throws TypeError. It is caught → prints TypeError.' },
        { label: 'bound()', calc: 'this is the bound object → "other: 1".' },
        { label: 'Counter', calc: 'n++ returns the OLD value. First c() → 0, second → 1, third → 2 (n becomes 3). makeCounter()() builds a brand-new closure → 0. Prints 2 0.' },
      ],
      answer: `Output:

1. \`smoke: 2\`
2. \`[ 'undefined', 'undefined' ]\`
3. \`[ 'smoke', 'smoke' ]\`
4. \`TypeError\`
5. \`other: 1\`
6. \`2 0\``,
      insight:
        'Decide this at every call. Called with a dot → the object. A plain call in class code → undefined. An arrow → borrowed from the method around it. bind → fixed. n++ returns the value before adding 1. Every factory call builds a fresh closure.',
      followUps: [
        {
          q: 'How could kinds() return [ \'object\', \'object\' ] without converting to an arrow function?',
          a: 'Pass a second argument to map: `this.results.map(function () { return typeof this; }, this)`. map then calls the callback with this set to the Suite object. So typeof this is "object" for each item.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-output-puzzles-mcq-01',
      difficulty: 'easy',
      question: 'Three typeof checks on values you often see in API data. What is printed, line by line?',
      code: {
        language: 'javascript',
        code: `console.log(typeof NaN);
console.log(typeof [1, 2]);
console.log(typeof typeof 7);`,
      },
      options: ['number, object, string', 'NaN, array, number', 'number, array, string', 'undefined, object, number'],
      correct: [0],
      explanation:
        'Line 1: NaN means "not a number", but its type is still number. Line 2: an array is a kind of object, so typeof gives "object". Use Array.isArray to spot arrays. Line 3: typeof 7 is the string "number", and typeof of any string is "string". The word "array" is never a typeof result, so two options are out.',
      followUps: [
        {
          q: 'How do you reliably check that an API field is an array?',
          a: 'Use Array.isArray(value). typeof returns "object" for arrays, plain objects and null alike, so it cannot tell them apart. In Playwright API tests: expect(Array.isArray(body.items)).toBe(true).',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-02',
      difficulty: 'easy',
      question: 'A quantity field mixes strings and numbers in maths. What are the three printed results?',
      code: {
        language: 'javascript',
        code: `console.log('4' * '3');
console.log('4' + 3 - 1);
console.log(-'5' + 5);`,
      },
      options: ['12, 42, 0', '12, 6, 0', '"43", 42, "-55"', 'NaN, 42, 10'],
      correct: [0],
      explanation:
        'Line 1: * turns both strings into numbers, so 4 * 3 → 12. Line 2: work left to right. "4" + 3 joins text → "43". Then "43" - 1 turns it back into a number → 42. Line 3: the minus in front turns "5" into -5, and -5 + 5 → 0. The option with 6 forgets that + joins text as soon as one side is a string.',
      followUps: [
        {
          q: 'How would you safely add a quantity read from an input field to a number?',
          a: 'Convert explicitly first: Number(qtyText) + 3, or parseInt(qtyText, 10) + 3 when the text may have trailing units. Then assert the type with Number.isNaN to catch bad input instead of silently concatenating.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-03',
      difficulty: 'easy',
      question: 'Two more steps are pushed onto a navigation queue in one call. What do the two logs show?',
      code: {
        language: 'javascript',
        code: `const queue = ['login'];
const result = queue.push('search', 'checkout');
console.log(result);
console.log(queue.length);`,
      },
      options: ['3 and 3', "[ 'login', 'search', 'checkout' ] and 3", "'checkout' and 3", 'undefined and 3'],
      correct: [0],
      explanation:
        'Line 2: push adds "search" and "checkout" to the array. Then it returns the NEW LENGTH, not the array and not the added item. The array now has 3 items, so result is 3. Line 4: queue.length is also 3. Expecting the array back is a common mistake.',
      followUps: [
        {
          q: 'Which method adds an item and gives you a new array instead?',
          a: 'Use spread or concat: const next = [...queue, "pay"] or queue.concat("pay"). Both return a new array and leave the original unchanged, which is safer for shared test data.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-04',
      difficulty: 'easy',
      question: 'Five if statements test different values. Which letters are printed?',
      code: {
        language: 'javascript',
        code: `if ([]) console.log('A');
if ('0') console.log('B');
if (0) console.log('C');
if (' ') console.log('D');
if (null) console.log('E');`,
      },
      options: ['A B D', 'B D', 'A D', 'A B C D'],
      correct: [0],
      explanation:
        'A: [] is an empty array, but every array and object is truthy. So A prints. B: "0" is a non-empty string, so it is truthy. D: " " (a space) is also a non-empty string. C and E: 0 and null are falsy, so they do not print. Beginners often think [] and "0" are "empty", and so falsy.',
      followUps: [
        {
          q: 'How do you check that an array of scraped rows is actually empty?',
          a: 'Check its length: if (rows.length === 0). The array itself is always truthy, so if (rows) never detects emptiness. In Playwright, prefer await expect(locator).toHaveCount(0).',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-05',
      difficulty: 'easy',
      question: 'The variable browser is declared again inside a bare { } block. What are the two outputs?',
      code: {
        language: 'javascript',
        code: `let browser = 'chromium';
{
  let browser = 'firefox';
  console.log(browser);
}
console.log(browser);`,
      },
      options: ['firefox, chromium', 'firefox, firefox', 'chromium, chromium', 'SyntaxError: browser has already been declared'],
      correct: [0],
      explanation:
        'Line 3: the inner let creates a new browser that lives only inside the { } block. It hides the outer one there, so line 4 prints "firefox". After the block, the inner variable is gone, so line 6 prints the outer "chromium". Declaring the same name twice is only an error in the SAME block, not in a block inside it.',
      followUps: [
        {
          q: 'What if the inner declaration used var instead of let?',
          a: 'It is a SyntaxError: var is not block-scoped, so it would try to declare browser in the same scope as the outer let, which is not allowed. The script would not run at all.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-06',
      difficulty: 'easy',
      question: 'A test result string is made upper case, and its first letter is overwritten (plain, non-module script). What is printed at the end?',
      code: {
        language: 'javascript',
        code: `let verdict = 'passed';
verdict.toUpperCase();
verdict[0] = 'X';
console.log(verdict);`,
      },
      options: ['passed', 'PASSED', 'Xassed', 'XASSED'],
      correct: [0],
      explanation:
        'Strings can never be changed in place. Line 2: toUpperCase returns a NEW string, "PASSED". Nobody saves it, so it is thrown away. Line 3: writing to verdict[0] silently does nothing in a plain script. (Strict mode would throw a TypeError.) So line 4 prints "passed".',
      followUps: [
        {
          q: 'How would you capitalise just the first letter?',
          a: 'Build a new string and assign it: verdict = verdict[0].toUpperCase() + verdict.slice(1), giving "Passed". Every string "edit" in JavaScript is really "make a new string and reassign".',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-07',
      difficulty: 'easy',
      question: 'A retry count goes up with count++ and ++count. Which three numbers are printed?',
      code: {
        language: 'javascript',
        code: `let count = 5;
const a = count++;
const b = ++count;
console.log(a, b, count);`,
      },
      options: ['5 7 7', '6 7 7', '5 6 6', '6 6 7'],
      correct: [0],
      explanation:
        'Line 2: count++ gives the OLD value (5) to a, then adds 1, so count is 6. Line 3: ++count adds 1 first, so count is 7. Then it gives the NEW value (7) to b. Line 4 prints 5 7 7. Options with 6 for a mix up the two forms.',
      followUps: [
        {
          q: 'What does `let x = 5; x = x++; console.log(x);` print?',
          a: 'It prints 5. x++ gives back 5 and sets x to 6. But then the = puts that 5 back into x, which wipes out the increase.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-08',
      difficulty: 'easy',
      question: 'Two timers with different delays and one console.log. In what order do the words appear?',
      code: {
        language: 'javascript',
        code: `setTimeout(() => console.log('report'), 30);
setTimeout(() => console.log('cleanup'), 0);
console.log('test');`,
      },
      options: ['test, cleanup, report', 'report, cleanup, test', 'cleanup, test, report', 'test, report, cleanup'],
      correct: [0],
      explanation:
        'Line 3 is normal code, so "test" prints first. Timers only run after the normal code is done. Line 2 has a 0 ms delay, so "cleanup" comes next. Line 1 waits 30 ms, so "report" is last. A 0 ms delay never jumps ahead of normal code.',
      followUps: [
        {
          q: 'Is the 30 ms delay a guarantee that report prints exactly 30 ms later?',
          a: 'No, it is a minimum. The callback runs no earlier than 30 ms, but later if the thread is busy with other work. That is why tests should wait for conditions, not fixed sleeps.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-09',
      difficulty: 'easy',
      question: 'Someone tries to change a const retry limit inside try/catch. What two lines are printed?',
      code: {
        language: 'javascript',
        code: `const maxRetries = 2;
try {
  maxRetries = 3;
} catch (e) {
  console.log(e.name);
}
console.log(maxRetries);`,
      },
      options: ['TypeError, 2', 'ReferenceError, 2', 'SyntaxError, 3', 'Nothing is caught; 3 is logged'],
      correct: [0],
      explanation:
        'Line 3: giving a const a new value throws a TypeError ("Assignment to constant variable"). This happens in every mode. Line 5 catches it and prints "TypeError". The value never changed, so line 7 prints 2. It is not a ReferenceError, because the name exists. It is not a SyntaxError, because the code is written correctly.',
      followUps: [
        {
          q: 'Can you change a property of a const object?',
          a: 'Yes. const freezes the binding, not the value: const cfg = { retries: 2 }; cfg.retries = 3 works. To block property changes you need Object.freeze, and even that is shallow.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-10',
      difficulty: 'easy',
      question: 'typeof is used on two browser helpers before the lines that create them. What is printed?',
      code: {
        language: 'javascript',
        code: `console.log(typeof openBrowser);
console.log(typeof closeBrowser);
function openBrowser() {}
var closeBrowser = function () {};`,
      },
      options: ['function, undefined', 'undefined, undefined', 'function, function', 'ReferenceError'],
      correct: [0],
      explanation:
        'JavaScript reads declarations first. Line 3 is a function declaration, so openBrowser is stored with its body, and line 1 prints "function". Line 4 is a var. Only its name is stored early, with the value undefined. So line 2 prints "undefined". Nothing throws, because var names exist from the start.',
      followUps: [
        {
          q: 'What if closeBrowser were declared with const?',
          a: 'Then the second typeof throws ReferenceError, because const names are in the Temporal Dead Zone before their line, and typeof does not protect against the TDZ.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-11',
      difficulty: 'easy',
      question: 'Arrays are joined with + and multiplied with *. What are the two printed values?',
      code: {
        language: 'javascript',
        code: `console.log([1, 2] + [3, 4]);
console.log([5] * [2]);`,
      },
      options: ['1,23,4 and 10', '[ 1, 2, 3, 4 ] and 10', '10 and 10', '1,23,4 and NaN'],
      correct: [0],
      explanation:
        'Line 1: + does not add arrays item by item. It turns each array into text, "1,2" and "3,4", and joins them: "1,23,4". Line 2: * turns both into numbers: [5] → "5" → 5, and [2] → 2. So 5 * 2 = 10. To merge arrays, use spread ([...a, ...b]) or concat.',
      followUps: [
        {
          q: 'What does `[1, 2] * [3]` give?',
          a: 'NaN. [1, 2] becomes the string "1,2", which is not a valid number, so the multiplication produces NaN. Only single-element arrays survive numeric conversion.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-12',
      difficulty: 'medium',
      question: 'null and undefined are compared with 0 using loose comparisons. What are the four booleans?',
      code: {
        language: 'javascript',
        code: `console.log(null == 0);
console.log(null >= 0);
console.log(undefined == 0);
console.log(undefined == null);`,
      },
      options: ['false, true, false, true', 'true, true, false, true', 'false, false, false, true', 'false, true, true, false'],
      correct: [0],
      explanation:
        '== has a special rule: null and undefined equal each other and nothing else. Line 1: null == 0 → false. Line 3: undefined == 0 → false. Line 4: undefined == null → true. Line 2 is different. >= turns null into the number 0, so 0 >= 0 → true. This mismatch is a favourite trick question.',
      followUps: [
        {
          q: 'Why is `x == null` sometimes accepted in code reviews?',
          a: 'Because it is true exactly for null and undefined and nothing else, so it is a compact "is missing" check. Many style guides allow this one use of == and require === everywhere else.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-13',
      difficulty: 'medium',
      question: 'Four letters are joined, with a stray + in the middle. What word is printed?',
      code: {
        language: 'javascript',
        code: `console.log('t' + 'e' + +'s' + 't');`,
      },
      options: ['teNaNt', 'test', 'teNaN', 'tes0t'],
      correct: [0],
      explanation:
        '"+ +" is a joining + followed by a lone + in front of "s". A lone + turns its value into a number. "s" is not a number, so it becomes NaN. Now work left to right: "t" + "e" → "te". "te" + NaN → "teNaN". "teNaN" + "t" → "teNaNt". Reading it as "test" ignores the second +.',
      followUps: [
        {
          q: 'What is `+"  7 "`?',
          a: 'It is 7. Number conversion trims surrounding whitespace before parsing, so spaces are fine, but any non-numeric character inside (like "7px") makes the result NaN.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-14',
      difficulty: 'medium',
      question: 'Chained comparisons that look like maths. What does each line print?',
      code: {
        language: 'javascript',
        code: `console.log(1 < 2 < 3);
console.log(3 > 2 > 1);
console.log(3 > 2 >= 1);`,
      },
      options: ['true, false, true', 'true, true, true', 'true, false, false', 'false, false, true'],
      correct: [0],
      explanation:
        'Comparisons run left to right, and each one gives true or false. Line 1: 1 < 2 is true. Then true < 3 becomes 1 < 3 → true. Line 2: 3 > 2 is true. Then true > 1 becomes 1 > 1 → false. Line 3: true >= 1 becomes 1 >= 1 → true. JavaScript has no maths-style ranges.',
      followUps: [
        {
          q: 'How should a range check like "status between 200 and 299" be written?',
          a: 'With two comparisons joined by &&: status >= 200 && status <= 299. In Playwright API tests, response.ok() already checks the 200–299 range.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-15',
      difficulty: 'medium',
      question: 'A results array is made shorter, then longer again. What are the two logs?',
      code: {
        language: 'javascript',
        code: `const results = ['pass', 'fail', 'pass', 'skip'];
results.length = 2;
console.log(results);
results.length = 3;
console.log(results);`,
      },
      options: [
        "[ 'pass', 'fail' ] and [ 'pass', 'fail', <1 empty item> ]",
        "[ 'pass', 'fail' ] and [ 'pass', 'fail', 'pass' ]",
        "[ 'pass', 'fail', 'pass', 'skip' ] twice (length is read-only)",
        "[ 'pass', 'fail' ] and [ 'pass', 'fail', undefined ]",
      ],
      correct: [0],
      explanation:
        'Line 2: setting length to 2 deletes the last two items for good, so line 3 prints [ \'pass\', \'fail\' ]. Line 4: setting length to 3 does not bring them back. It adds an empty slot, called a hole. Node prints a hole as <1 empty item>. A hole is not the same as an item holding undefined, although reading it also gives undefined.',
      followUps: [
        {
          q: 'What is the shortest way to empty an array that other code also references?',
          a: 'arr.length = 0. It clears the same array object, so every variable pointing at it sees an empty array. arr = [] would only rebind one variable and leave the others pointing at the old data.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-16',
      difficulty: 'medium',
      question: 'One browser is removed from a list with delete. What does the log line show?',
      code: {
        language: 'javascript',
        code: `const browsers = ['chromium', 'firefox', 'webkit'];
delete browsers[1];
console.log(browsers.length, browsers[1], 1 in browsers);`,
      },
      options: ['3 undefined false', '2 webkit true', '3 undefined true', '2 undefined false'],
      correct: [0],
      explanation:
        'Line 2: delete removes the item at index 1. But it does not move the other items, and length stays 3. Index 1 is now a hole. Reading browsers[1] gives undefined. "1 in browsers" checks whether the slot exists, so it gives false. To remove an item and close the gap, use splice(1, 1).',
      followUps: [
        {
          q: 'How does forEach treat the hole that delete left?',
          a: 'It skips it. forEach, map, filter and reduce skip holes, so the callback runs twice, not three times. A classic for loop with an index visits it and reads undefined.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-17',
      difficulty: 'medium',
      question: 'A checkout flow replaces its last step using splice with a negative start. What is printed?',
      code: {
        language: 'javascript',
        code: `const steps = ['open', 'login', 'pay'];
const removed = steps.splice(-1, 1, 'cart', 'pay');
console.log(removed, steps);`,
      },
      options: [
        "[ 'pay' ] [ 'open', 'login', 'cart', 'pay' ]",
        "[ 'open', 'login', 'cart', 'pay' ] [ 'open', 'login', 'cart', 'pay' ]",
        "[ 'pay' ] [ 'open', 'login', 'pay' ]",
        "'pay' [ 'open', 'cart', 'pay' ]",
      ],
      correct: [0],
      explanation:
        'A negative start counts from the end, so -1 means index 2 ("pay"). splice removes 1 item there and puts "cart" and "pay" in its place. So steps becomes [ \'open\', \'login\', \'cart\', \'pay\' ]. splice returns the REMOVED items as an array: [ \'pay\' ]. It never returns the changed array.',
      followUps: [
        {
          q: 'How would you do the same edit without mutating steps?',
          a: 'Use toSpliced (Node 20+): const next = steps.toSpliced(-1, 1, "cart", "pay"). Or build a new array with slice: [...steps.slice(0, -1), "cart", "pay"]. Both leave steps unchanged.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-18',
      difficulty: 'medium',
      question: 'Temperature offsets, including negatives, are sorted with no compare function. What is the result?',
      code: {
        language: 'javascript',
        code: `console.log([-1, -5, 2, 10].sort());`,
      },
      options: ['[ -1, -5, 10, 2 ]', '[ -5, -1, 2, 10 ]', '[ -1, -5, 2, 10 ]', '[ 10, 2, -1, -5 ]'],
      correct: [0],
      explanation:
        'Plain sort compares values as text, one character at a time. "-" comes before all digits, so the negatives come first. "-1" comes before "-5", because "1" < "5". Then "10" comes before "2", because "1" < "2". For number order, use sort((a, b) => a - b).',
      followUps: [
        {
          q: 'Why does the default sort use strings at all?',
          a: 'Arrays can hold mixed types, and every value can be turned into text. So text order was chosen as the safe default. That is why every number sort needs a compare function.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-19',
      difficulty: 'medium',
      question: 'One doubling helper uses { } in its arrow function, and a second one uses forEach. What is printed?',
      code: {
        language: 'javascript',
        code: `const doubled = [1, 2, 3].map((n) => { n * 2; });
const total = [1, 2, 3].forEach((n) => n * 2);
console.log(doubled, total);`,
      },
      options: [
        '[ undefined, undefined, undefined ] undefined',
        '[ 2, 4, 6 ] undefined',
        '[ 2, 4, 6 ] [ 2, 4, 6 ]',
        '[] undefined',
      ],
      correct: [0],
      explanation:
        'Line 1: the arrow has { }, so it is a block body. A block body needs an explicit return, or the function returns undefined. So map collects three undefineds. Line 2: forEach always returns undefined, whatever the callback returns. So total is undefined. Removing the braces, (n) => n * 2, fixes the map.',
      followUps: [
        {
          q: 'How do you return an object literal from a concise arrow function?',
          a: 'Wrap it in round brackets: n => ({ value: n }). Without them, the { } is read as a function body and value: is read as a label. Then the function returns undefined.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-20',
      difficulty: 'medium',
      question: 'The forEach callback returns early for one ID. How many lines are printed?',
      code: {
        language: 'javascript',
        code: `const ids = [101, 102, 103, 104];
ids.forEach((id) => {
  if (id === 102) return;
  console.log(id);
});`,
      },
      options: ['3 lines: 101, 103, 104', '1 line: 101', '2 lines: 101 and 102', '4 lines: return is ignored'],
      correct: [0],
      explanation:
        'Line 3: return inside a forEach callback only ends that one call. forEach then moves on to the next item. So 102 is skipped, and 101, 103 and 104 print. You cannot stop forEach early, except by throwing an error. To stop early, use for...of with break, or some/find.',
      followUps: [
        {
          q: 'Which loop would stop at 102 instead?',
          a: 'for (const id of ids) { if (id === 102) break; console.log(id); } prints only 101. Array.prototype.some also stops as soon as its callback returns true.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-21',
      difficulty: 'medium',
      question: 'An array of user objects is spread into a copy, then the copy is edited. What does the original show?',
      code: {
        language: 'javascript',
        code: `const users = [{ name: 'asha' }];
const copy = [...users];
copy[0].name = 'ravi';
copy.push({ name: 'meera' });
console.log(users.length, users[0].name);`,
      },
      options: ['1 ravi', '1 asha', '2 ravi', '2 asha'],
      correct: [0],
      explanation:
        'Line 2: spread makes a new outer array. But the user object inside is not copied; both arrays point to the same object. Line 3 edits that shared object, so users[0].name is now "ravi". Line 4 pushes into the new outer array only, so users.length stays 1. Output: 1 ravi. A shallow copy shares its insides.',
      followUps: [
        {
          q: 'How would you copy the list so editing names is safe?',
          a: 'Copy each object too: users.map(u => ({ ...u })), or structuredClone(users) for any depth. Then copy[0] is a separate object and users[0].name stays "asha".',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-22',
      difficulty: 'medium',
      question: 'A lookup object gets the number 1 and the string "1" as keys. What is printed?',
      code: {
        language: 'javascript',
        code: `const seen = {};
seen[1] = 'number key';
seen['1'] = 'string key';
console.log(Object.keys(seen).length, seen[1]);`,
      },
      options: ['1 string key', '2 number key', '2 string key', '1 number key'],
      correct: [0],
      explanation:
        'Plain object keys are always strings. Line 2: seen[1] is stored under the key "1". Line 3: seen["1"] uses the same key, so it overwrites the value. There is only one key, and its value is "string key". A Map would keep 1 and "1" as two different keys.',
      followUps: [
        {
          q: 'When would you choose a Map over an object for test bookkeeping?',
          a: 'When keys are not plain strings (numbers you want kept as numbers, objects such as locators or users), when you need insertion order and .size, or frequent adds/deletes. Map keeps 1 and "1" distinct and allows object keys by reference.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-23',
      difficulty: 'medium',
      question: 'Code inside a new Promise logs before and after calling resolve. In what order do the four strings appear?',
      code: {
        language: 'javascript',
        code: `new Promise((resolve) => {
  console.log('exec');
  resolve('done');
  console.log('after resolve');
}).then((v) => console.log(v));
console.log('end');`,
      },
      options: [
        'exec, after resolve, end, done',
        'exec, done, after resolve, end',
        'end, exec, after resolve, done',
        'exec, end, after resolve, done',
      ],
      correct: [0],
      explanation:
        'The function inside new Promise(...) runs at once, as normal code. So "exec" prints first. Calling resolve() does not stop that function, so "after resolve" prints next. The .then callback waits until all normal code is done. So "end" prints, and then "done".',
      followUps: [
        {
          q: 'What if the executor calls resolve twice with different values?',
          a: 'Only the first call counts. A promise can finish only once. Later resolve or reject calls are quietly ignored, so .then gets the first value.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-24',
      difficulty: 'medium',
      question: 'A failed request is handled by catch, and the chain goes on. What is printed, in order?',
      code: {
        language: 'javascript',
        code: `Promise.reject(new Error('timeout'))
  .then(() => console.log('A'))
  .catch((e) => {
    console.log('B', e.message);
    return 'recovered';
  })
  .then((v) => console.log('C', v));
console.log('D');`,
      },
      options: [
        'D, B timeout, C recovered',
        'B timeout, C recovered, D',
        'D, A, B timeout, C recovered',
        'D, B timeout (the chain stops after catch)',
      ],
      correct: [0],
      explanation:
        'Line 8 is normal code, so "D" prints first. The promise is rejected (it failed). A failure skips the .then on line 2, so "A" never prints. It reaches .catch, which prints "B timeout" and RETURNS a value. Returning a value from catch turns the chain back into success. So the last .then runs and prints "C recovered".',
      followUps: [
        {
          q: 'How would you make the chain stay rejected after logging in catch?',
          a: 'Re-throw inside catch: .catch(e => { console.log(e.message); throw e; }). Otherwise catch "swallows" the error, and a test may pass even though the request failed.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-25',
      difficulty: 'medium',
      question: 'A sum function uses the first parameter to set a default for the second. What does the call list print?',
      code: {
        language: 'javascript',
        code: `function sum(a, b = a * 2) {
  return a + b;
}
console.log(sum(3), sum(3, 0), sum(3, undefined), sum(3, null));`,
      },
      options: ['9 3 9 3', '9 9 9 9', '9 3 9 NaN', '9 3 3 3'],
      correct: [0],
      explanation:
        'The default b = a * 2 is used only when b is undefined. sum(3) and sum(3, undefined) use b = 6 → 9. sum(3, 0) keeps 0 → 3. sum(3, null) keeps null. Then 3 + null turns null into 0 → 3, not NaN.',
      followUps: [
        {
          q: 'What does `3 + undefined` give, compared with `3 + null`?',
          a: '3 + undefined is NaN, because undefined converts to NaN. 3 + null is 3, because null converts to 0. That difference is why a missing number field and a null field behave differently in calculations.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-26',
      difficulty: 'medium',
      question: 'A log function compares how many arguments it got with how many parameters it declared. What two strings are printed?',
      code: {
        language: 'javascript',
        code: `function log(level, msg) {
  return arguments.length + '/' + log.length;
}
console.log(log('info'));
console.log(log('warn', 'disk', 'extra'));`,
      },
      options: ['1/2 and 3/2', '2/2 and 3/3', '1/1 and 3/3', '1/2 and 2/2'],
      correct: [0],
      explanation:
        'arguments.length counts the values actually passed. log("info") passes 1. log("warn", "disk", "extra") passes 3; extra arguments are allowed and still counted. log.length counts the declared parameters, which is always 2 here. So the lines are 1/2 and 3/2. Options with 3/3 wrongly assume log.length changes per call.',
      followUps: [
        {
          q: 'Why do arrow functions not have this problem with arguments?',
          a: 'Arrow functions have no own arguments object at all. Use rest parameters instead, (...args) => args.length, which gives a real array and works in both arrow and regular functions.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-27',
      difficulty: 'medium',
      question: 'A Set is built from repeated values, including NaN, 0 and -0. What size is printed?',
      code: {
        language: 'javascript',
        code: `const unique = new Set([1, '1', 1, NaN, NaN, 0, -0]);
console.log(unique.size);`,
      },
      options: ['4', '5', '6', '7'],
      correct: [0],
      explanation:
        'A Set keeps only unique values. 1 and "1" are different (a number and a string). The second 1 is a repeat. A Set treats NaN as equal to NaN (unlike ===), so the second NaN is a repeat too. 0 and -0 count as the same value. Unique values: 1, "1", NaN, 0 → 4.',
      followUps: [
        {
          q: 'How would you use a Set to check that a page shows no duplicate order IDs?',
          a: 'const ids = await page.getByTestId("order-id").allTextContents(); expect(new Set(ids).size).toBe(ids.length). If any ID repeats, the Set is smaller than the array.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-28',
      difficulty: 'medium',
      question: 'A function upgrades an account object and then reassigns its parameter. What does the caller see?',
      code: {
        language: 'javascript',
        code: `function upgrade(account) {
  account.plan = 'pro';
  account = { plan: 'free' };
  return account.plan;
}
const acct = { plan: 'basic' };
console.log(upgrade(acct), acct.plan);`,
      },
      options: ['free pro', 'free free', 'pro pro', 'free basic'],
      correct: [0],
      explanation:
        'The parameter account gets a copy of acct\'s address. Line 2: account.plan = "pro" changes the caller\'s object, so acct.plan is now "pro". Line 3: account = {...} only points the local name at a new object. Line 4 returns that new object\'s plan, "free". So the output is free pro.',
      followUps: [
        {
          q: 'How would you write upgrade so it never changes the caller\'s object?',
          a: 'Return a new object instead: const upgrade = (account) => ({ ...account, plan: "pro" }). The caller decides whether to use it, and shared test data stays untouched.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-29',
      difficulty: 'medium',
      question: 'An environment key is edited with replace, substring and slice. What three lines appear?',
      code: {
        language: 'javascript',
        code: `const key = 'qa-env-login';
console.log(key.replace('-', '_'));
console.log(key.substring(6, 2));
console.log(key.slice(6, 2) === '');`,
      },
      options: [
        'qa_env-login, -env, true',
        'qa_env_login, -env, true',
        'qa_env-login, an empty line, false',
        'qa_env_login, env-, false',
      ],
      correct: [0],
      explanation:
        'Line 2: replace with a text pattern changes only the FIRST "-" → "qa_env-login". Line 3: substring swaps its numbers when start > end, so (6, 2) acts like (2, 6) → "-env". Line 4: slice does not swap. With start > end it returns an empty string, so the comparison is true.',
      followUps: [
        {
          q: 'How would you replace every dash?',
          a: 'Use key.replaceAll("-", "_") or key.replace(/-/g, "_"). Both give "qa_env_login". The g flag is required when using a regex with replace.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-30',
      difficulty: 'medium',
      question: 'Select ALL lines in this comparison set that print true.',
      code: {
        language: 'javascript',
        code: `console.log(null == undefined); // A
console.log(NaN == NaN);        // B
console.log('1' == 1);          // C
console.log([] == '');          // D
console.log(null == false);     // E`,
      },
      options: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
      correct: [0, 2, 3],
      explanation:
        'A: null and undefined are loosely equal by rule. C: "1" turns into the number 1, so 1 == 1. D: [] turns into "", so "" == "". B is false, because NaN equals nothing, not even itself. E is false, because null is only == to undefined (and null). It is never == to false, even though both are falsy.',
      followUps: [
        {
          q: 'Why is `null == false` false when both are falsy?',
          a: 'Because == does not check truthiness. It has a special rule: null equals only null and undefined. Truthiness only matters where a true/false answer is needed, like if, &&, || and !.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-31',
      difficulty: 'medium',
      question: 'Select ALL comparisons below that print true.',
      code: {
        language: 'javascript',
        code: `console.log('10' > '9');        // A
console.log(10 > '9');          // B
console.log('abc' < 'abd');     // C
console.log('Zebra' > 'apple'); // D
console.log([2] == 2);          // E`,
      },
      options: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
      correct: [1, 2, 4],
      explanation:
        'B: one side is a number, so "9" turns into 9, and 10 > 9. C: strings compare one character at a time, and "c" < "d". E: [2] → "2" → 2, so 2 == 2. A is false: two strings compare as text, and "1" < "9". D is false: capital "Z" (code 90) sorts before small "a" (code 97).',
      followUps: [
        {
          q: 'How do you compare names alphabetically regardless of case?',
          a: 'Use a.localeCompare(b, undefined, { sensitivity: "base" }), or compare lowercase copies. localeCompare also handles accents correctly, which plain < does not.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-32',
      difficulty: 'medium',
      question: 'Select ALL labelled lines that print undefined.',
      code: {
        language: 'javascript',
        code: `const user = { name: 'qa' };
function noReturn() {}
const arr = [1, 2];
console.log(user.age);           // A
console.log(noReturn());         // B
console.log(arr[5]);             // C
console.log(user.name?.length);  // D
console.log(null);               // E`,
      },
      options: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
      correct: [0, 1, 2],
      explanation:
        'A: user has no age property, so you get undefined. B: a function with no return gives undefined. C: index 5 is outside the array, so you get undefined. None of these throw. D prints 2, because user.name exists, so ?. carries on normally. E prints null, which is a different value from undefined.',
      followUps: [
        {
          q: 'How can you tell "property missing" from "property present with value undefined"?',
          a: 'Use Object.hasOwn(user, "age") or "age" in user. Both return false when the key is absent, but true for { age: undefined }, even though user.age reads as undefined in both cases.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-33',
      difficulty: 'hard',
      question: 'A block reads the outer level variable, then declares its own level with let. What happens at the console.log line?',
      code: {
        language: 'javascript',
        code: `let level = 1;
{
  console.log(level);
  let level = 2;
}`,
      },
      options: ['It throws ReferenceError', 'It prints 1', 'It prints undefined', 'It prints 2'],
      correct: [0],
      explanation:
        'The inner let level belongs to the whole { } block, from its first line. It hides the outer level there. But it is in the Temporal Dead Zone (locked) until its own line runs. So console.log(level) reads the locked inner variable and throws ReferenceError: Cannot access level before initialization. It does not fall back to the outer 1.',
      followUps: [
        {
          q: 'What would it print if the inner declaration used var at the top level of a function instead of a block?',
          a: 'If a var level appears later in a function body, it is hoisted as undefined. So the console.log line prints undefined instead of throwing. var gives a quiet wrong value; let gives a loud error.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-34',
      difficulty: 'hard',
      question: 'A launch helper should fall back to webkit when no browser is set. What does it return?',
      code: {
        language: 'javascript',
        code: `var browser = 'chromium';
function launch() {
  if (!browser) {
    var browser = 'webkit';
  }
  return browser;
}
console.log(launch());`,
      },
      options: ['webkit', 'chromium', 'undefined', 'ReferenceError'],
      correct: [0],
      explanation:
        'The var inside the if is hoisted to the top of launch. So launch has its own local browser, set to undefined, which hides the global "chromium". Line 3: !undefined is true, so the if body runs and sets browser to "webkit". Line 6 returns "webkit". The global is never read inside the function.',
      followUps: [
        {
          q: 'What does it return if the inner declaration becomes let?',
          a: '"chromium". The let lives only inside the if block, so the condition reads the global "chromium", !"chromium" is false, the block never runs, and the global value is returned.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-35',
      difficulty: 'hard',
      question: 'Two function declarations share the name label, and one call happens between them. What is printed?',
      code: {
        language: 'javascript',
        code: `function label() { return 'A'; }
const first = label();
function label() { return 'B'; }
console.log(first, label());`,
      },
      options: ['B B', 'A B', 'A A', 'SyntaxError: duplicate declaration'],
      correct: [0],
      explanation:
        'JavaScript reads all function declarations before running any line. The later label replaces the earlier one. So when line 2 calls label(), it already returns "B". Line 4 calls it again: "B". Two function declarations with the same name are allowed in scripts and in functions, so there is no error.',
      followUps: [
        {
          q: 'Would the answer change if both were written as `const label = function () {...}`?',
          a: 'Yes. Declaring const label twice in the same scope is a SyntaxError, so nothing runs. let is the same. With var it would run and print A B, because each assignment happens in order.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-36',
      difficulty: 'hard',
      question: 'A named function expression checks its own inner name. What two values appear?',
      code: {
        language: 'javascript',
        code: `const helper = function check() {
  return typeof check;
};
console.log(helper(), typeof check);`,
      },
      options: ['function undefined', 'function function', 'undefined undefined', 'ReferenceError'],
      correct: [0],
      explanation:
        'The name check exists only inside that function. (This is handy for calling itself and for clearer error traces.) Line 2: inside, check is the function → "function". Line 4: outside, check was never declared. typeof of a name that was never declared safely gives "undefined".',
      followUps: [
        {
          q: 'Why name a function expression at all?',
          a: 'The name appears in stack traces and lets the function call itself even if the outer variable is later reassigned. In test helpers, named functions make failure traces far easier to read.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-37',
      difficulty: 'hard',
      question: 'A Cart method is pulled off its object with destructuring and then called. What two lines are printed?',
      code: {
        language: 'javascript',
        code: `class Cart {
  constructor() { this.items = 2; }
  count() { return this.items; }
}
const cart = new Cart();
const { count } = cart;
try {
  console.log(count());
} catch (e) {
  console.log(e.constructor.name);
}
console.log(count.call(cart));`,
      },
      options: ['TypeError, 2', 'undefined, 2', '2, 2', 'ReferenceError, 2'],
      correct: [0],
      explanation:
        'Line 6: destructuring copies the function, but not its link to cart. Line 8: count() is a plain call, and class code is strict, so this is undefined. Reading this.items then throws a TypeError, and line 10 prints "TypeError". Line 12: count.call(cart) sets this to cart on purpose, so it returns 2. The "undefined" option is what a non-class object in a plain script might do.',
      followUps: [
        {
          q: 'How would you make destructured methods safe in a Page Object?',
          a: 'Define them as class-field arrow functions (count = () => this.items) or bind them in the constructor (this.count = this.count.bind(this)). Both keep this pointing at the instance wherever the function travels.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-38',
      difficulty: 'hard',
      question: 'An env reader is bound to the qa object, then called with call, and bound again. What are the three names?',
      code: {
        language: 'javascript',
        code: `function env() { return this.name; }
const qa = { name: 'qa' };
const prod = { name: 'prod' };
const bound = env.bind(qa);
console.log(bound.call(prod), env.call(prod), bound.bind(prod)());`,
      },
      options: ['qa prod qa', 'prod prod prod', 'qa prod prod', 'qa qa qa'],
      correct: [0],
      explanation:
        'Line 4: bind makes a new function whose this is fixed to qa forever. First value: bound.call(prod) cannot change it → "qa". Second value: env.call(prod) is not bound, so this is prod → "prod". Third value: binding a bound function again has no effect on this → "qa". Output: qa prod qa.',
      followUps: [
        {
          q: 'Is there any way to change this for a bound function?',
          a: 'Only by calling it with new, which creates a fresh object as this (and ignores the bound value). For normal calls, the first bind wins permanently. Arrow functions likewise ignore call/apply/bind for this.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-39',
      difficulty: 'hard',
      question: 'An async loader awaits null, while a then-callback and more logs are queued. What is the exact print order?',
      code: {
        language: 'javascript',
        code: `async function load() {
  console.log('L1');
  await null;
  console.log('L2');
}
console.log('S1');
load();
Promise.resolve().then(() => console.log('P'));
console.log('S2');`,
      },
      options: ['S1, L1, S2, L2, P', 'S1, S2, L1, L2, P', 'S1, L1, S2, P, L2', 'S1, L1, L2, S2, P'],
      correct: [0],
      explanation:
        'Line 6 prints S1. Line 7 calls load(), which runs as normal code up to the await, so L1 prints. The rest of load (L2) waits in the microtask queue, the waiting line for promise work. Line 8 adds the .then callback (P) to the queue, behind L2. Line 9 prints S2, and the normal code is done. The queue then runs in order: L2, then P.',
      followUps: [
        {
          q: 'What is the order if load() is called after the Promise.resolve line?',
          a: 'S1, L1, S2, P, L2. The .then callback is queued first, and the rest of load second. The rule is simply: first queued, first run.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-40',
      difficulty: 'hard',
      question: 'finally callbacks return a value and print during a success chain and a failure chain. What is printed?',
      code: {
        language: 'javascript',
        code: `Promise.resolve('data')
  .finally(() => 'ignored')
  .then((v) => console.log(v));
Promise.reject(new Error('boom'))
  .finally(() => console.log('cleanup'))
  .catch((e) => console.log(e.message));`,
      },
      options: ['cleanup, data, boom', 'ignored, cleanup, boom', 'data, cleanup, boom', 'cleanup, boom, ignored'],
      correct: [0],
      explanation:
        'A finally callback gets no value, and whatever it returns is ignored. The original result passes through: "data" in the first chain, the error in the second. Both finally callbacks run in the first round of promise callbacks, so "cleanup" prints first. Passing the result on takes a few more steps, and both chains move in step. So "data" prints before "boom".',
      followUps: [
        {
          q: 'When does a finally callback change the outcome of the chain?',
          a: 'Only if it throws or returns a rejected promise. Then that new error replaces the original value or error. A normal return value is always ignored.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-41',
      difficulty: 'hard',
      question: 'Settings are frozen, then two properties are changed, in a plain (non-strict) script. What is printed?',
      code: {
        language: 'javascript',
        code: `const settings = Object.freeze({ timeout: 5000, user: { role: 'viewer' } });
settings.timeout = 1;
settings.user.role = 'admin';
console.log(settings.timeout, settings.user.role);`,
      },
      options: ['5000 admin', '1 admin', '5000 viewer', 'TypeError: Cannot assign to read only property'],
      correct: [0],
      explanation:
        'Line 1: Object.freeze makes the top-level properties read-only. Line 2: in a plain script, the write to timeout is silently ignored, so it stays 5000. Line 3: freeze only covers the top level. user is a separate object that is not frozen, so its role changes to "admin". In strict mode or an ES module, line 2 would throw a TypeError instead.',
      followUps: [
        {
          q: 'How would you deep-freeze a shared test configuration?',
          a: 'Recursively freeze every nested object: a deepFreeze(obj) helper that calls Object.freeze on obj and then on each property value that is an object. Or keep config immutable by convention and hand each test structuredClone(config).',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-42',
      difficulty: 'hard',
      question: 'An array is compared with its own opposite, and Math.max() with Math.min(). What are the two booleans?',
      code: {
        language: 'javascript',
        code: `console.log([] == ![]);
console.log(Math.max() < Math.min());`,
      },
      options: ['true, true', 'false, false', 'false, true', 'true, false'],
      correct: [0],
      explanation:
        'Line 1: [] is truthy, so ![] is false. Now [] == false: false turns into 0, and [] turns into "" and then 0. So 0 == 0 → true. Line 2: Math.max() with no arguments returns -Infinity, and Math.min() returns Infinity. So -Infinity < Infinity → true.',
      followUps: [
        {
          q: 'Where could Math.max() with no arguments bite you in a test?',
          a: 'Math.max(...responseTimes) on an empty array returns -Infinity, so a check like "max < 2000 ms" passes even though nothing was measured. Assert the array is non-empty first.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-43',
      difficulty: 'hard',
      question: 'A lone + is put in front of six different values in one log call. What is printed?',
      code: {
        language: 'javascript',
        code: `console.log(+true, +'', +' 12 ', +'1e3', +[], +{});`,
      },
      options: ['1 0 12 1000 0 NaN', '1 NaN 12 1 0 NaN', 'NaN 0 NaN 1000 NaN NaN', '1 0 12 1e3 0 0'],
      correct: [0],
      explanation:
        'A lone + works like Number(). true → 1. The empty string → 0. Spaces around a number are trimmed → 12. "1e3" is a valid short way to write 1 × 10³ → 1000. [] → "" → 0. {} → "[object Object]" → NaN.',
      followUps: [
        {
          q: 'Why might `Number(input) || 0` be a buggy default for a form value?',
          a: 'An empty input converts to 0 without error, and a genuine "0" also gives 0, so you cannot tell "not entered" from "zero". Check the raw string first (input.trim() === "") before converting.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-44',
      difficulty: 'hard',
      question: 'An array with a hole is looped with forEach and mapped. What does the log line contain?',
      code: {
        language: 'javascript',
        code: `const a = [1, , 3];
let calls = 0;
a.forEach(() => calls++);
console.log(a.length, calls, a.map((x) => x * 2));`,
      },
      options: [
        '3 2 [ 2, <1 empty item>, 6 ]',
        '3 3 [ 2, NaN, 6 ]',
        '2 2 [ 2, 6 ]',
        '3 3 [ 2, 0, 6 ]',
      ],
      correct: [0],
      explanation:
        'Line 1: the double comma makes a hole (an empty slot), so length is 3. Line 3: forEach skips holes, so its callback runs only twice, and calls is 2. Line 4: map also skips the hole, but keeps the empty slot in the same place: [ 2, <1 empty item>, 6 ]. NaN would appear only if the slot held undefined.',
      followUps: [
        {
          q: 'How do you turn holes into real undefined values?',
          a: 'Array.from(a) or [...a] converts holes into undefined elements, after which map visits them (giving NaN for x * 2). Avoid holes entirely by never writing double commas or using delete on arrays.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-45',
      difficulty: 'hard',
      question: 'A while loop stores functions that read a let declared before the loop. What does the last line print?',
      code: {
        language: 'javascript',
        code: `let i = 0;
const fns = [];
while (i < 3) {
  fns.push(() => i);
  i++;
}
console.log(fns[0](), fns[2]());`,
      },
      options: ['3 3', '0 2', '0 3', '2 2'],
      correct: [0],
      explanation:
        'There is only one i, because it was declared once, before the loop. let gives a new variable each round only when it is declared inside for (...). The loop pushes three functions that all read this same i. When they are finally called, the loop is over and i is 3. So both calls return 3: "3 3".',
      followUps: [
        {
          q: 'How do you fix it without changing to a for loop?',
          a: 'Copy the value into a block-scoped constant each time round: while (i < 3) { const n = i; fns.push(() => n); i++; }. Each iteration creates a new n, so the functions return 0, 1, 2.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-46',
      difficulty: 'medium',
      question: 'Each labelled line runs on its own in a fresh script. Select ALL lines that throw an error.',
      code: {
        language: 'javascript',
        code: `const page = null;
const cfg = {};
console.log(typeof missingVariable); // A
console.log(missingVariable);        // B
console.log(cfg.timeout);            // C
console.log(cfg.timeout.ms);         // D
console.log(page?.url);              // E`,
      },
      options: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
      correct: [1, 3],
      explanation:
        'B throws a ReferenceError: missingVariable was never declared. Only typeof (line A) can safely touch a name that does not exist. D throws a TypeError: cfg.timeout is undefined, and reading .ms on undefined fails. C just gives undefined. E uses ?. (optional chaining), which stops at null and gives undefined.',
      followUps: [
        {
          q: 'Which error type tells you "the name does not exist" vs "the value is wrong"?',
          a: 'ReferenceError means the name cannot be found: a typo, out of scope, or in the TDZ. TypeError means the name exists, but its value cannot be used that way. Examples: reading a property of undefined or null, calling something that is not a function, or assigning to a const.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-47',
      difficulty: 'medium',
      question: 'Select ALL typeof lines that print the word object.',
      code: {
        language: 'javascript',
        code: `console.log(typeof null);             // A
console.log(typeof []);               // B
console.log(typeof function () {});   // C
console.log(typeof new Date());       // D
console.log(typeof NaN);              // E`,
      },
      options: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
      correct: [0, 1, 3],
      explanation:
        'A: typeof null gives "object". This is an old bug that was kept so that old code keeps working. B: arrays are objects. D: a Date is an object. C: functions are objects too, but typeof reports them as "function". E: NaN is a number.',
      followUps: [
        {
          q: 'How do you check that a value is a plain, non-null object?',
          a: 'value !== null && typeof value === "object" && !Array.isArray(value). Each part removes one false positive: null, then non-objects, then arrays.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-48',
      difficulty: 'hard',
      question: 'Select ALL labels that print after "sync" but before "timer" in this mixed async script.',
      code: {
        language: 'javascript',
        code: `setTimeout(() => console.log('timer'), 0);
Promise.resolve().then(() => console.log('then'));
queueMicrotask(() => console.log('micro'));
(async () => {
  await undefined;
  console.log('async');
})();
console.log('sync');`,
      },
      options: ['then', 'micro', 'async', 'None: the 0 ms timer runs right after sync'],
      correct: [0, 1, 2],
      explanation:
        'The order is: sync, then, micro, async, timer. "sync" is normal code, so it prints first. "then", "micro" and the code after await are all microtasks (promise jobs that run right after normal code). They are queued in that order, and every microtask runs before any timer. The 0 ms timer is a macrotask (a normal task), so it always waits.',
      followUps: [
        {
          q: 'What is the difference between queueMicrotask and Promise.resolve().then?',
          a: 'Both add a job to the same microtask queue. queueMicrotask does it directly, without making a promise. So if it throws, you get an uncaught error, not an unhandled promise rejection.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-49',
      difficulty: 'expert',
      question: 'The loop body adds 1 to its own let counter after setting a timer. Which numbers are printed?',
      code: {
        language: 'javascript',
        code: `for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
  i++;
}`,
      },
      options: ['1 and 3', '0 and 2', '0, 1 and 2', '3, 3 and 3'],
      correct: [0],
      explanation:
        'Round 1: i is 0. A timer is set, then i++ makes this round\'s i equal 1. The for (...) part copies 1 into a fresh i for the next round and adds 1, so it is 2. 2 < 3, so round 2 sets a timer, and i++ makes it 3. Next: copy 3, add 1 to get 4, and the loop ends. Each timer sees the final value of its own round\'s i: 1 and 3.',
      followUps: [
        {
          q: 'What would the same loop print with var?',
          a: 'Two timers are still set (i goes 0 → 1 → 2 → 3 → 4). But they share one variable, which ends at 4. So it prints 4 and 4.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-50',
      difficulty: 'expert',
      question: 'parseInt gets a tiny decimal as a string, the same decimal as a number, and a pixel value. What three numbers are printed?',
      code: {
        language: 'javascript',
        code: `console.log(parseInt('0.0000005'));
console.log(parseInt(0.0000005));
console.log(parseInt('12px'));`,
      },
      options: ['0, 5, 12', '0, 0, 12', '0, 0, NaN', '5, 5, 12'],
      correct: [0],
      explanation:
        'parseInt first turns its input into a string. Then it reads digits until it hits a character it cannot use. Line 1: "0.0000005" stops at "." → 0. Line 2: the NUMBER 0.0000005 turns into the string "5e-7", so it stops at "e" → 5. Line 3: "12px" stops at "p" → 12. Use Math.trunc for numbers; parseInt is for strings.',
      followUps: [
        {
          q: 'Why is `Number("12px")` different from `parseInt("12px")`?',
          a: 'Number requires the whole (trimmed) string to be numeric, so "12px" is NaN. parseInt reads the leading digits and ignores the rest, giving 12. Use parseInt for CSS values like "12px"; use Number when junk should be rejected.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-51',
      difficulty: 'expert',
      question: 'Normal logs, an async IIFE with two awaits, a then-chain and two timers are mixed together. What is the full order?',
      code: {
        language: 'javascript',
        code: `console.log('A');
setTimeout(() => console.log('B'), 0);
(async () => {
  console.log('C');
  await Promise.resolve();
  console.log('D');
  setTimeout(() => console.log('E'), 0);
  await null;
  console.log('F');
})();
Promise.resolve()
  .then(() => console.log('G'))
  .then(() => console.log('H'));
console.log('I');`,
      },
      options: [
        'A C I D G F H B E',
        'A C I G H D F B E',
        'A C D F I G H B E',
        'A C I D F G H E B',
      ],
      correct: [0],
      explanation:
        'Normal code first: A, then C (the async body up to its first await), then I. Microtask queue: [rest of the function from D, G]. D runs. It sets timer E and hits the next await, so F is queued. G runs, so H is queued. The queue is now [F, H]: F prints, then H. Timers run in the order they were set: B (set first), then E.',
      followUps: [
        {
          q: 'Why does F come before H even though both are "second steps"?',
          a: 'F was queued while D ran, and that happened before G ran and queued H. Microtasks are first in, first out. So the step queued earlier runs earlier, whichever chain it belongs to.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-52',
      difficulty: 'expert',
      question: 'An object with a getter is spread into a copy before the original changes. What do the two getter reads show?',
      code: {
        language: 'javascript',
        code: `const stats = {
  passed: 1,
  get next() { return this.passed + 1; },
};
const snapshot = { ...stats };
stats.passed = 10;
console.log(snapshot.next, stats.next);`,
      },
      options: ['2 11', '11 11', '2 2', 'NaN 11'],
      correct: [0],
      explanation:
        'A getter is a property that runs a function when you read it. Line 5: spread READS each property, so the getter runs once (1 + 1 = 2). The copy stores the plain value 2, not the getter. Line 6 sets stats.passed to 10. Line 7: snapshot.next is still 2. stats.next runs the live getter with passed = 10 → 11. The snapshot never updates.',
      followUps: [
        {
          q: 'How could you copy an object and keep its getters working?',
          a: 'Copy the property descriptors: Object.defineProperties({}, Object.getOwnPropertyDescriptors(stats)). Then snapshot.next is still a getter, though it reads snapshot.passed (its own copy), not stats.passed.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-53',
      difficulty: 'expert',
      question: 'A var and a function declaration share the name report. What does typeof show before and after the var line?',
      code: {
        language: 'javascript',
        code: `console.log(typeof report);
var report = 42;
function report() {}
console.log(typeof report);`,
      },
      options: ['function, then number', 'undefined, then number', 'number, then function', 'function, then function'],
      correct: [0],
      explanation:
        'JavaScript reads declarations first. The var adds report as undefined, and then the function declaration sets it to the function. So line 1 prints "function". Line 2 runs and replaces it with 42. Line 3, the function declaration, does nothing when it is reached. So line 4 prints "number".',
      followUps: [
        {
          q: 'How would linting prevent this?',
          a: 'ESLint no-redeclare and no-func-assign flag it, and using const/let would make it a SyntaxError immediately. Distinct names for values and functions avoid the issue entirely.',
        },
      ],
    },
  ],
};

export default topic;
