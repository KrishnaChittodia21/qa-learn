import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-output-puzzles',
  phase: 'javascript',
  order: 7,
  title: 'Predict the Output: JavaScript Interview Puzzles',
  subtitle:
    'The "what does this code print?" round: hoisting, TDZ, closures in loops, this, coercion, truthy/falsy, references, array and string gotchas, and event-loop ordering, each traced step by step and verified in Node.',
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
    'Hoisting: `var` is hoisted as undefined; `let`/`const` are hoisted but sit in the TDZ (ReferenceError until the declaration line, even for `typeof`).',
    'Function declarations are hoisted with their body (callable early); `var f = function(){}` gives TypeError "f is not a function"; `const f = () => {}` gives ReferenceError.',
    'Same-name declarations: the LAST function declaration wins before any code runs; a later `var x = value` assignment then overwrites the function.',
    'Closures capture variables, not values: `var` in a loop = one shared binding (3, 3, 3); `let` in a for-header = a new binding per iteration (0, 1, 2). `let` declared outside a while loop is still shared.',
    '`this` is decided by the call: `obj.m()` → obj; detached `m()` → undefined in strict/class code; arrows take `this` from where they are written; `bind` wins over a later `call`.',
    '`+` with any string concatenates; `-`, `*`, `/`, unary `+` convert to numbers. Objects become strings first: `[] + {}` is "[object Object]", `[1,2] + [3]` is "1,23".',
    '`null == undefined` is true but `null == 0` is false while `null >= 0` is true. `NaN` equals nothing (use `Number.isNaN`); `includes` finds NaN, `indexOf` does not.',
    '`&&` returns the first falsy value or the last value; `||` the first truthy or the last; `??` falls back only on null/undefined, so `0 ?? 5` is 0.',
    'Objects are compared by reference: `{a:1} === {a:1}` is false. Spread copies one level; nested objects are shared. Reassigning a parameter never changes the caller.',
    'Array traps: default `sort()` compares strings and mutates; `push` returns the new length; `delete` leaves a hole; `length = n` truncates; `map` with braces and no `return` gives undefineds.',
    'Strings are immutable: `s[0] = "X"` and a bare `s.toUpperCase()` change nothing. `replace` with a string changes only the first match.',
    'Event loop: all sync code → ALL microtasks (then, await continuations, queueMicrotask) → one timer → microtasks again. The Promise executor itself runs synchronously.',
  ],
  sections: [
    {
      heading: 'var, let, const: hoisting and the Temporal Dead Zone',
      body: `**Intuition:** before a script runs, JavaScript does a quick "registration pass" and writes every declared name on a whiteboard. \`var\` names get the value \`undefined\` written next to them. \`let\` and \`const\` names are written down but covered with tape: touching them before the declaration line runs is an error. That taped-off stretch is the **Temporal Dead Zone (TDZ)**.

**The rules**

| Declaration | Hoisted? | Value before its line | Scope |
|---|---|---|---|
| \`var\` | yes | \`undefined\` | whole function (ignores blocks) |
| \`let\` | yes, in TDZ | ReferenceError | the nearest \`{ }\` block |
| \`const\` | yes, in TDZ | ReferenceError | the nearest \`{ }\` block |

**The trap:** \`typeof\` is "safe" for a name that was never declared (it returns "undefined"), but it is **not** safe inside the TDZ: \`typeof plan\` throws if \`const plan\` appears later in the same scope.

**How to reason it out step by step**
1. Scan the scope first and list every \`var\`, \`let\`, \`const\` and \`function\` name.
2. Mark \`var\` names as \`undefined\`, \`let\`/\`const\` names as "TDZ".
3. Now walk the lines top to bottom, updating values as assignments run.
4. A \`var\` inside \`if\`/\`for\` belongs to the whole function, so it leaks out of the block.`,
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
        'var → hoisted as undefined; let/const → hoisted into the TDZ (ReferenceError).',
        '`typeof` of an undeclared name is "undefined", but `typeof` of a TDZ name throws.',
        'var is function-scoped, so it escapes if/for blocks.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Scope & Closures; javascript.info: Variable scope, closure",
    },
    {
      heading: 'Function declarations vs function expressions',
      body: `**Intuition:** a function **declaration** (\`function add() {}\`) is registered with its whole body during the registration pass, so you can call it before the line where it is written. A function **expression** (\`var f = function () {}\` or \`const f = () => {}\`) is just a variable holding a value, so it follows the variable rules from the previous section.

**What you get when you call too early**

| Written as | Calling it before its line gives |
|---|---|
| \`function f() {}\` | works |
| \`var f = function () {}\` | **TypeError**: f is not a function (f is \`undefined\`) |
| \`let f = ...\` / \`const f = () => {}\` | **ReferenceError**: Cannot access 'f' before initialization |

**The traps**
- Two declarations with the same name: the **last one wins** for every call, even calls that sit above it, because both are registered before any line runs.
- A \`var\` and a function with the same name: the function wins during registration, but when the \`var x = value\` line executes, the value replaces the function.
- A **named function expression** (\`const helper = function inner() {}\`): the name \`inner\` exists only inside the function's own body.

**How to reason it out:** do the registration pass on paper (functions get bodies, vars get undefined, last declaration overwrites earlier ones), then execute line by line.`,
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
        'Declarations are callable early; var-expressions give TypeError, let/const-expressions give ReferenceError.',
        'Last same-name declaration wins; a later var assignment overwrites a function.',
        'A named function expression\'s name is visible only inside its own body.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet: Scope & Closures; Lydia Hallie: javascript-questions",
    },
    {
      heading: 'Closures in loops: var vs let with callbacks and setTimeout',
      body: `**Intuition:** a closure is a function that keeps a **live link** to the variables around it, not a photo of their values. If several functions link to the same variable, they all see its final value.

**The rule**
- \`for (var i ...)\`: there is **one** \`i\` for the whole loop. Every callback reads that one \`i\` later, after the loop has finished, so all see the end value.
- \`for (let i ...)\`: the for-header creates a **fresh \`i\` per iteration** and copies the value forward, so each callback has its own.
- \`let i\` declared **outside** a \`while\` loop is still a single shared variable. \`let\` only helps when it is in the for-header (or inside the loop body).

**The trap:** people think "setTimeout with 0 ms runs immediately". It never does: it runs after the whole loop (and all other synchronous code) has finished, which is why the shared variable is already at its end value.

**How to reason it out step by step**
1. Ask: how many copies of the loop variable exist? (var or outside-let → one; for-header let → one per iteration.)
2. Ask: when does the callback actually run? (later → after the loop ends.)
3. The callback prints whatever its copy holds at that later moment.`,
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
        'Closures hold live variables, not snapshots.',
        'var loop + delayed callback → every callback sees the final value.',
        'Only a let in the for-header gives one binding per iteration.',
      ],
      source: 'javascript.info: Variable scope, closure (task "Army of functions"); Lydia Hallie: javascript-questions',
    },
    {
      heading: 'this: regular functions, arrows, detached methods, call and bind',
      body: `**Intuition:** \`this\` is like the word "me" in a sentence: who "me" refers to depends on **who is speaking right now** (how the function is called), not on where the sentence was written. Arrow functions are the exception: they have no "me" of their own and borrow it from the surrounding code.

**The rules, in priority order**

| Call style | \`this\` inside a regular function |
|---|---|
| \`fn.bind(x)\` then any call | \`x\` (cannot be changed later, not even by \`call\`) |
| \`fn.call(x)\` / \`fn.apply(x)\` | \`x\` |
| \`obj.fn()\` | \`obj\` (whatever is left of the dot) |
| plain \`fn()\` | \`undefined\` in strict mode and class bodies; the global object in sloppy scripts |
| arrow function | \`this\` of the code where the arrow was written |

**The trap:** passing a method as a callback (\`const { count } = cart\`, \`forEach(reporter.record)\`, \`retry(page.submit)\`) drops the "left of the dot" part, so \`this\` is lost. Class bodies are always strict, so the result is a **TypeError**, not a silent undefined.

**How to reason it out step by step**
1. Find the exact call expression that runs the function.
2. Arrow? Look outward to the enclosing regular function and use its \`this\`.
3. Otherwise apply the table from the top: bound? call/apply? dot? plain call?`,
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
        '`this` depends on the call, not on where the function is written (except arrows).',
        'Detached class methods throw TypeError because class code is strict.',
        'bind is permanent; call/apply cannot override it.',
      ],
      source: 'Lydia Hallie: javascript-questions (this and arrow functions, call vs bind); MDN: this',
    },
    {
      heading: 'Type coercion: +, -, ==, unary plus and typeof',
      body: `**Intuition:** when an operator gets values of the "wrong" type, JavaScript quietly converts them, like a cashier who converts your coins before adding them up. The trick is knowing **which** conversion each operator chooses.

**The rules**
- \`+\`: if **either** side is a string (or becomes one, like an array or object), it **joins strings**. Otherwise it adds numbers. It works left to right: \`1 + 2 + '3'\` is "33" but \`'1' + 2 + 3\` is "123".
- \`-\`, \`*\`, \`/\`, \`%\` and unary \`+\`: always convert to **numbers**. \`'' → 0\`, \`' 42 ' → 42\`, \`'4px' → NaN\`, \`true → 1\`, \`null → 0\`, \`undefined → NaN\`, \`[] → 0\`, \`{} → NaN\`.
- Objects and arrays become primitives through their string form: \`[] → ""\`, \`[1, 2] → "1,2"\`, \`{} → "[object Object]"\`.
- \`==\`: \`null\` and \`undefined\` equal each other and **nothing else**. Otherwise both sides head toward numbers. But relational operators (\`>=\`) do convert \`null\` to 0, so \`null >= 0\` is true while \`null == 0\` is false.
- \`NaN\` is not equal to anything, including itself.

**The trap:** \`typeof null\` is "object", \`typeof NaN\` is "number", \`typeof []\` is "object". None of these mean what a beginner expects.

**How to reason it out:** evaluate one operator at a time, left to right (respecting \`*\` before \`+\`), and write the intermediate value and its type after each step.`,
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
        'One string anywhere in a + chain turns the rest of the chain into joining.',
        'null == undefined only; null >= 0 is still true.',
        'typeof null → "object", typeof NaN → "number", typeof [] → "object".',
      ],
      source: 'GeeksforGeeks: JavaScript Output Based Interview Questions; MDN: Equality comparisons and sameness',
    },
    {
      heading: 'Truthy, falsy and what && || ?? actually return',
      body: `**Intuition:** \`&&\` and \`||\` are not "true/false machines". They are **pickers**: they hand back one of the two values you gave them, unchanged.

**The rules**
- Falsy values: \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Everything else is truthy, including \`"0"\`, \`" "\`, \`"false"\`, \`[]\` and \`{}\`.
- \`a && b\`: if \`a\` is falsy return **a**, else return **b**.
- \`a || b\`: if \`a\` is truthy return **a**, else return **b**. In a chain, if all are falsy you get the **last** one.
- \`a ?? b\`: return \`b\` only when \`a\` is \`null\` or \`undefined\`. \`0\` and \`""\` are kept.

**The trap:** \`[]\` is truthy (\`if ([])\` runs) but \`[] == false\` is also true, because \`==\` converts \`[]\` to "" and then to 0. "Truthy" (used by \`if\`) and "loosely equal to true" are different questions.

**How to reason it out:** for each operand, write T or F; stop at the first operand that decides the result; return that operand itself (not \`true\`/\`false\`).`,
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
        '&& returns the first falsy operand or the last one; || returns the first truthy or the last one.',
        '?? only replaces null and undefined.',
        '"0", " ", [] and {} are truthy.',
      ],
      source: 'MDN: Logical AND, Logical OR, Nullish coalescing; GeeksforGeeks: JavaScript Output Based Interview Questions',
    },
    {
      heading: 'References and mutation: ===, spread copies, parameters, freeze',
      body: `**Intuition:** a variable holding an object does not hold the object itself; it holds an **address card** pointing to it. Copying the variable copies the card, not the house. Two cards to the same house see the same furniture changes.

**The rules**
- \`===\` on objects/arrays compares **addresses**: \`{ id: 1 } === { id: 1 }\` is false; \`a === alias\` is true.
- Spread (\`{ ...obj }\`, \`[...arr]\`) makes a **new outer** object but copies nested objects as cards, so nested changes are shared (a shallow copy).
- Function parameters receive a copy of the card. **Mutating** through it (\`order.status = 'paid'\`) changes the caller's object; **reassigning** it (\`order = {...}\`) only changes the local card.
- \`Object.freeze\` is shallow. In a sloppy (non-module) script, writes to a frozen property are silently ignored; in strict mode they throw TypeError.
- Plain-object keys are strings: an object used as a key becomes "[object Object]".

**The trap:** "I spread it, so it's a copy" is only true one level deep.

**How to reason it out:** draw boxes for each object and arrows for each variable. Every \`=\` moves an arrow; every \`.prop =\` or \`push\` changes a box.`,
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
        'Objects compare by reference; two identical literals are never ===.',
        'Spread is shallow; nested objects stay shared.',
        'Mutating a parameter affects the caller; reassigning it does not.',
      ],
      source: 'Lydia Hallie: javascript-questions (references, Object.freeze, object keys); javascript.info: Object references and copying',
    },
    {
      heading: 'Array method gotchas: sort, push, length, delete, holes, splice, includes',
      body: `**Intuition:** many array methods look harmless but either **change the original** or **return something you did not expect**. Output questions love both.

**The rules**

| Code | Returns | Changes the array? |
|---|---|---|
| \`arr.sort()\` | the same array (not a copy) | yes, compared as strings by default |
| \`arr.push(x)\` | the **new length** | yes |
| \`arr.length = n\` | — | truncates (or adds empty slots) |
| \`delete arr[i]\` | true | leaves a **hole**; length unchanged |
| \`arr.slice(a, b)\` | a copy of a..b-1 | no |
| \`arr.splice(a, n, ...items)\` | the **removed** items | yes |
| \`arr.indexOf(NaN)\` | -1 | no |
| \`arr.includes(NaN)\` | true | no |
| \`arr.map(x => { x * 2 })\` | undefineds (braces need \`return\`) | no |

**The traps:** default \`sort()\` puts 100 before 25 (string "1" < "2"); \`forEach\`/\`map\` skip holes; \`map(parseInt)\` passes the index as the radix.

**How to reason it out:** for each line ask two questions: "what does this call **return**?" and "did it **mutate** the array?" Keep a running picture of the array.`,
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
        'sort() mutates and returns the same array; default order is string order.',
        'push returns the new length; splice returns the removed items.',
        'includes finds NaN; indexOf cannot.',
      ],
      source: 'MDN: Array.prototype.sort, splice, includes; GeeksforGeeks: JavaScript Output Based Interview Questions',
    },
    {
      heading: 'Strings: immutability and method surprises',
      body: `**Intuition:** a string is like text carved in stone. Methods such as \`toUpperCase\` or \`replace\` do not re-carve it; they hand you a **new** stone. If you do not catch the new one in a variable, it is gone.

**The rules**
- \`s[0] = 'X'\` silently does nothing in a sloppy script (TypeError in strict mode). \`s.length = 1\` also does nothing.
- \`replace('-', '/')\` with a string pattern changes **only the first** match; use \`replaceAll\` or a \`/-/g\` regex.
- \`slice\` accepts negative indexes (count from the end); if start > end it returns "". \`substring\` treats negatives as 0 and **swaps** its arguments if start > end.
- String comparison is character by character using code units: \`'10' > '9'\` is false (because "1" < "9"), and uppercase letters sort before lowercase.
- \`includes\`, \`startsWith\`, \`indexOf\` are case-sensitive.

**The trap:** \`verdict.toUpperCase();\` on its own line looks like it changed \`verdict\`. It did not.

**How to reason it out:** for each line, ask "is the result assigned anywhere?" and write the exact characters with their indexes on paper for slice/substring.`,
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
        'String methods return new strings; the original never changes.',
        'replace with a string pattern changes only the first match.',
        'Strings compare character by character, so "10" < "9".',
      ],
      source: 'MDN: String (immutability, replace, slice, substring); GeeksforGeeks: JavaScript Output Based Interview Questions',
    },
    {
      heading: 'Event loop ordering: sync → microtasks → macrotasks, and async/await',
      body: `**Intuition:** think of a restaurant kitchen. The chef finishes the **current order** completely (synchronous code). Then the chef clears **every sticky note** on the counter, including notes added while clearing (microtasks: \`.then\`, \`await\` continuations, \`queueMicrotask\`). Only then does the chef take **one** order from the waiting line (a macrotask: \`setTimeout\`, \`setInterval\`, I/O), and the cycle repeats.

**The rules**
1. All synchronous code runs first, top to bottom. The function you pass to \`new Promise(fn)\` is synchronous.
2. An \`async\` function runs synchronously **until its first \`await\`**. The rest of it becomes a microtask.
3. After the sync code, the microtask queue is drained completely, in the order items were queued.
4. Then one timer callback runs, then all microtasks it created, then the next timer.
5. Timers with the same delay run in the order they were registered; a 0 ms timer still waits for steps 1–3.

**The trap:** "\`setTimeout(fn, 0)\` runs right away" and "code after \`await\` runs before the next line of the caller". Both are wrong.

**How to reason it out:** keep three columns on paper: **Output**, **Microtask queue**, **Timer queue**. Walk the code, writing sync output immediately and appending callbacks to the right queue. Then drain microtasks (adding new ones to the end), then take one timer at a time.`,
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
      diagram: `  call stack (sync)  ──► microtask queue (drain ALL) ──► ONE macrotask ─┐
       ▲                 then / await / queueMicrotask    setTimeout     │
       └──────────────────────────────────────────────────────────────────┘`,
      keyPoints: [
        'Sync first, then every microtask, then one macrotask, repeat.',
        'Promise executors and the part of an async function before await are synchronous.',
        'setTimeout(fn, 0) means "after everything currently queued", never "now".',
      ],
      source: 'MDN: Using microtasks in JavaScript; Lydia Hallie: javascript-questions (event loop questions)',
    },
    {
      heading: 'Scope and shadowing, default parameters, arguments and rest',
      body: `**Intuition:** scopes are nested boxes. When code looks up a name, it checks its own box first and only walks outward if the name is not there. A name declared in an inner box **shadows** (hides) the same name outside, for the **whole** inner box, even lines above the declaration.

**The rules**
- A \`var\` inside a function shadows the outer variable from the first line of that function, and is \`undefined\` until assigned. This happens even if the \`var\` sits inside an \`if (false)\` block that never runs.
- Default parameters apply only when the argument is \`undefined\` (missing or passed as undefined). \`null\`, \`0\` and \`""\` are real values. Defaults are evaluated **on each call** and can use earlier parameters.
- \`arguments.length\` counts what the caller passed; \`fn.length\` counts declared parameters before the first default/rest.
- Rest parameters (\`...rest\`) are always a real array, empty when nothing is left.
- Assigning to an undeclared name in a sloppy script creates a global variable (a common typo bug); strict mode throws ReferenceError.

**The trap:** "the outer variable is visible until the inner one is declared". No: the inner declaration owns the name for the whole scope.

**How to reason it out:** for each name used, find the innermost scope that **declares** it (anywhere in that scope), then apply that declaration's hoisting rule.`,
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
        'An inner declaration shadows the outer name for the entire inner scope.',
        'Defaults kick in only for undefined, and are re-evaluated on every call.',
        'arguments.length = what was passed; fn.length = what was declared.',
      ],
      source: "javascript.info: Variable scope, closure; Kyle Simpson: You Don't Know JS Yet: Scope & Closures",
    },
    {
      heading: 'A 5-step method for any output question',
      body: `**Intuition:** output questions are not about memorising tricks. They are about **executing the code in your head the way the engine does**, slowly and on paper. Interviewers care more about your narration than about speed.

**The 5 steps**
1. **Registration pass.** List every declaration per scope: functions get their bodies, \`var\` gets \`undefined\`, \`let\`/\`const\` go into the TDZ. Note same-name collisions.
2. **Draw memory.** Boxes for objects/arrays, arrows for variables. Every \`=\` moves an arrow; every \`.x =\`, \`push\`, \`sort\`, \`splice\` edits a box.
3. **Walk sync code line by line.** For each expression, write the intermediate value **and its type** (\`'4' + 3\` → "43" string, then \`- 1\` → 42 number). For each call, decide \`this\` from the call site.
4. **Queue async work.** Keep three columns: Output / Microtasks / Timers. After the sync code, drain all microtasks, then take one timer, drain again, repeat.
5. **Format the answer like Node.** Top-level strings print without quotes; strings inside arrays/objects print with single quotes; holes show as \`<1 empty item>\`; \`console.log(a, b)\` separates with a space. Say "throws TypeError" if a line throws, and note that **nothing after it runs** (unless it is caught).

**Environment notes interviewers expect you to mention**
- Run snippets as a plain script (\`node file.js\`, or a classic \`<script>\`). Modules and class bodies are **strict**, which turns some silent failures (writes to frozen objects, writes to string indexes, accidental globals) into TypeError/ReferenceError.
- Top-level \`this\` differs: \`{}\` (module.exports) in a Node CommonJS file, \`window\` in a browser script, \`undefined\` in an ES module. Avoid relying on it.

**In interviews, say this:** "Let me trace it: first hoisting, then the sync lines, then the microtask queue, then the timers." Then do exactly that, out loud.`,
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
        'Registration pass → memory drawing → sync walk → async queues → Node formatting.',
        'Name the type of every intermediate value.',
        'State the environment (script vs module, strict vs sloppy) when it changes the answer.',
      ],
      source: "Kyle Simpson: You Don't Know JS Yet; javascript.info; verified by running in Node.js",
    },
  ],
  codeChallenges: [
    {
      id: 'js-output-puzzles-cc-1',
      title: 'The retry logger that always says "attempt 4 of 3"',
      context:
        'A teammate wrote a small helper for a flaky-API investigation. It should log "Retry attempt 1 of 3", "Retry attempt 2 of 3", "Retry attempt 3 of 3", spaced 10 ms apart. Instead the console shows the same impossible line three times, and the log line is used in a bug report, so it must be right.',
      task: 'Predict what the starter logs, explain why, and fix `scheduleRetries(maxAttempts, log)` so each scheduled log shows its own attempt number. Keep the delays. The tests call `collectLogs(maxAttempts)`, which passes a `log` function that records each line and resolves with the recorded lines in order once all timers have fired. Press Run to check your fix.',
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
        'How many `attempt` variables exist when it is declared with var?',
        'When do the arrow functions run: during the loop, or after it has finished?',
        'Which declaration keyword creates a new binding for every loop iteration?',
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
      explanation: `**Why it printed "4 of 3":** \`var attempt\` is one function-scoped variable. The loop finishes immediately (it only *schedules* timers), leaving \`attempt\` at 4, the value that made \`attempt <= 3\` false. Ten milliseconds later the first callback runs and reads that single shared variable: 4. So do the other two.

**Fixes**
- **\`let\` in the for-header** (preferred): each iteration gets its own \`attempt\`, so each closure sees 1, 2, 3.
- **Pass the value as an argument** (\`setTimeout(fn, delay, attempt)\`): the current value is copied into the callback's parameter at scheduling time. An IIFE does the same job in older code.

**Lesson for test code:** any callback that runs later (timers, event handlers, \`page.on('response')\` listeners) and reads a loop variable must have its own copy of that variable.`,
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
          a: 'The delay `attempt * 10` is evaluated immediately, during each loop iteration, when attempt is 1, 2 and 3. Only the callback body reads attempt later. So the timers fire at 10, 20 and 30 ms, but all three print 4.',
        },
        {
          q: 'Would changing the arrow function to a regular function fix it?',
          a: 'No. Both kinds of functions close over the same variable; the problem is how many variables exist, not the function syntax. Only creating a separate binding per iteration (let, an argument, an IIFE) fixes it.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-cc-2',
      title: 'A sort-check helper that says every list is sorted',
      context:
        'An automation engineer wrote `isSortedAscending()` to verify a "Price: low to high" filter. The test never fails, even when the developer deliberately breaks the sorting. The author is surprised by what the two sample calls print.',
      task: 'Predict what the sample calls print, list every bug, and fix `isSortedAscending(prices)` so it returns true only for numerically ascending input and never modifies the array it is given. The tests call `checkPrices(prices)`, which returns `{ result, pricesAfter }`: the helper\'s answer and the caller\'s array after the call (it must be unchanged). Press Run to check your fix.',
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
        'With no comparator, how are 100, 25 and 5 compared?',
        'How do you compare two arrays element by element instead of by reference?',
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
      explanation: `**Bug 1: reference comparison.** \`sort()\` sorts in place and returns the **same array**, so \`prices === sorted\` is always true. The helper could never fail.

**Bug 2: string ordering.** Without a comparator, numbers are compared as strings. \`[100, 25, 5]\` becomes "100" < "25" < "5", which is already in string order, so \`sort()\` leaves it as \`[ 100, 25, 5 ]\`. That is why the last line looks "unchanged" even though the helper mutated it: string order happened to match.

**Bug 3: mutation.** On any other input (say \`[25, 5]\`), the helper would reorder the caller's array, corrupting data later steps of the test rely on.

**Fixes:** copy with spread (or \`toSorted\` in Node 20+), sort with \`(a, b) => a - b\`, and compare element by element with \`every\`. Or skip sorting and check each neighbour pair.`,
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
          a: 'It would mutate it to [ 100, 25, 5 ] (string order: "100" < "25" < "5") and still return true. The test would pass and the caller would now hold a reordered array, a double failure.',
        },
        {
          q: 'How would you use this helper in a Playwright test?',
          a: 'Read the prices with `await page.getByTestId("price").allTextContents()`, convert each with `Number(text.replace("$", ""))`, then `expect(isAscending(prices)).toBe(true)`. Better still, compare against a sorted copy with `expect(prices).toEqual([...prices].sort((a, b) => a - b))` so the failure message shows both arrays.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-output-puzzles-iq-01',
      difficulty: 'easy',
      question:
        'Walk me through the output of this timer loop, then give me two different fixes: `for (var i = 1; i <= 3; i++) { setTimeout(() => console.log(i), i * 100); }`',
      context: 'The single most common output question in JavaScript and SDET screening rounds.',
      whatInterviewerLooksFor: [
        'Correct output (4, 4, 4) and the reason: one shared var binding',
        'Understands the callbacks run after the loop has finished',
        'At least two fixes (let, argument/IIFE) and why each works',
        'Notices that the delays are still 100/200/300 ms',
      ],
      modelAnswer: `**Output:** \`4\`, \`4\`, \`4\`, printed at about 100, 200 and 300 ms.

**Trace**
1. \`var i\` is function-scoped (or global here), so there is **one** \`i\` for the whole loop.
2. The loop runs synchronously: it schedules three timers and increments \`i\` to 2, 3, then 4, where \`i <= 3\` fails.
3. The delay argument \`i * 100\` is evaluated during each iteration (100, 200, 300), so the timers are spaced correctly.
4. When each timer fires, its arrow function reads the shared \`i\`, which is now 4.

**Fix 1: \`let\`**

    for (let i = 1; i <= 3; i++) {
      setTimeout(() => console.log(i), i * 100);
    }

A \`let\` in the for-header creates a new binding per iteration, so the closures capture 1, 2, 3.

**Fix 2: pass the value**

    for (var i = 1; i <= 3; i++) {
      setTimeout((n) => console.log(n), i * 100, i);
    }

Extra arguments to \`setTimeout\` are passed to the callback, so the value is copied at scheduling time. An IIFE \`((n) => setTimeout(() => console.log(n), n * 100))(i)\` does the same thing in pre-ES6 code.

**Why it matters for QA:** listeners such as \`page.on('response', ...)\` registered in a loop have exactly the same trap.`,
      followUps: [
        {
          q: 'What if I change var to let but move the declaration outside: `let i = 1; for (; i <= 3; i++) {...}`?',
          a: 'Then it prints 4, 4, 4 again. The per-iteration copy only happens for a let declared in the for-header. A let declared before the loop is a single variable shared by every closure, exactly like var.',
        },
        {
          q: 'What if all the delays are 0 instead of i * 100?',
          a: 'With var it still prints 4, 4, 4, just all at once after the synchronous code finishes. A 0 ms timer never runs during the loop; it waits until the call stack is empty and microtasks are drained.',
        },
      ],
      pitfalls: [
        'Answering 1, 2, 3 or 0, 1, 2 (forgetting the timers run after the loop).',
        'Answering 3, 3, 3 (forgetting the final increment that ends the loop).',
        'Saying "use an arrow function" as the fix; the function syntax is irrelevant.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-02',
      difficulty: 'medium',
      question:
        'Explain this: `var x = 10; function test() { console.log(x); if (false) { var x = 20; } } test();` Why is it not 10, even though the if block never runs?',
      whatInterviewerLooksFor: [
        'Answers undefined',
        'Explains var hoisting to the top of the function, regardless of blocks',
        'Distinguishes declaration (hoisted) from assignment (never runs)',
        'Can contrast with let/const behaviour',
      ],
      modelAnswer: `**Output:** \`undefined\`.

**Step by step**
1. When \`test\` is called, JavaScript first registers every declaration in the function body. \`var\` ignores block boundaries, so \`var x\` inside \`if (false)\` still declares a local \`x\` for the **whole** function, initialised to \`undefined\`.
2. That local \`x\` **shadows** the global \`x = 10\` from the first line of the function.
3. \`console.log(x)\` reads the local \`x\`: \`undefined\`.
4. The \`if (false)\` body never runs, so the assignment \`x = 20\` never happens. Only the *declaration* was hoisted, never the assignment.

Think of it as the engine rewriting the function to:

    function test() {
      var x;            // hoisted declaration
      console.log(x);   // undefined
      if (false) { x = 20; }
    }

**Contrast with let**

    var x = 10;
    function test() { console.log(x); if (false) { let x = 20; } }

This prints **10**: a \`let\` belongs only to the \`if\` block, so the function body has no local \`x\` and the lookup walks out to the global.

**The general rule I apply:** to resolve a name, find the innermost scope that *declares* it anywhere, then apply that declaration's hoisting behaviour.`,
      followUps: [
        {
          q: 'What if the function uses `let x = 20;` at its top level after the console.log, instead of var inside the if?',
          a: 'Then console.log(x) throws ReferenceError: Cannot access x before initialization. The let is hoisted to the function scope, shadows the global, and is in the Temporal Dead Zone until its line runs.',
        },
        {
          q: 'How would a linter or TypeScript help here?',
          a: 'ESLint rules such as no-var, no-shadow and block-scoped-var flag this pattern. Using const/let by default removes the whole class of bug because the declaration stays in its block and early access throws instead of quietly giving undefined.',
        },
      ],
      pitfalls: [
        'Answering 10 because "the if never runs".',
        'Answering 20 because "var is hoisted with its value".',
        'Saying ReferenceError, confusing var with let.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-03',
      difficulty: 'medium',
      question:
        'A reporter class crashes when its method is handed to forEach: `class Reporter { constructor() { this.passed = 0; } record() { this.passed++; } } const r = new Reporter(); ["t1", "t2"].forEach(r.record);` What happens and how do you fix it?',
      whatInterviewerLooksFor: [
        'Predicts TypeError: Cannot read properties of undefined (reading passed)',
        'Explains that passing r.record drops the receiver, and class code is strict',
        'Offers several fixes: arrow wrapper, bind, class-field arrow, forEach thisArg',
        'Connects it to Page Object methods passed as callbacks',
      ],
      modelAnswer: `**Output:** it throws **TypeError: Cannot read properties of undefined (reading 'passed')** on the first element, and \`r.passed\` stays 0.

**Step by step**
1. \`r.record\` is just a reference to the function; writing it without calling it does **not** remember \`r\`.
2. \`forEach\` calls it as a plain function: \`callback(element, index, array)\`.
3. For a plain call, \`this\` is \`undefined\` in strict code, and class bodies are always strict.
4. \`this.passed++\` therefore reads a property of \`undefined\`: TypeError.

**Fixes (all print/record correctly)**

    ["t1", "t2"].forEach(() => r.record());      // 1. arrow wrapper: call with a dot
    ["t1", "t2"].forEach(r.record.bind(r));      // 2. bind the receiver
    ["t1", "t2"].forEach(r.record, r);           // 3. forEach's thisArg

    class Reporter {                             // 4. class-field arrow
      passed = 0;
      record = () => { this.passed++; };
    }

After any fix, \`r.passed\` is 2.

**Where this appears in test code:** \`retry(loginPage.submit)\`, \`page.on('dialog', handler.accept)\`, or \`test.step('x', basePage.open)\`. Any time a method is passed instead of called, \`this\` is lost.`,
      followUps: [
        {
          q: 'What if Reporter were a plain object literal in a sloppy (non-module) script instead of a class?',
          a: 'Then this would be the global object, not undefined. `this.passed++` would create a global `passed` with value NaN and nothing would throw. r.passed stays 0: a silent bug, which is worse than the crash.',
        },
        {
          q: 'What is the trade-off of the class-field arrow fix?',
          a: 'Each instance gets its own copy of the function (more memory, not on the prototype), and subclasses cannot override it via super. It is convenient for callbacks, but bind at the call site or an arrow wrapper keeps methods on the prototype.',
        },
      ],
      pitfalls: [
        'Saying it logs or increments normally because "record belongs to r".',
        'Fixing it by changing record to a regular function expression (no change).',
        'Not knowing that class bodies are strict mode.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-04',
      difficulty: 'hard',
      question:
        'Order these six log lines and justify each position: `console.log("start"); setTimeout(() => console.log("timeout"), 0); (async () => { console.log("async start"); await null; console.log("async end"); })(); Promise.resolve().then(() => console.log("promise")); console.log("end");`',
      whatInterviewerLooksFor: [
        'Correct order: start, async start, end, async end, promise, timeout',
        'Knows an async function runs synchronously until its first await',
        'Explains the microtask queue is FIFO, so async end is queued before promise',
        'Explains timers wait for the microtask queue to drain',
      ],
      modelAnswer: `**Output**

    start
    async start
    end
    async end
    promise
    timeout

**Trace with three columns (Output / Microtasks / Timers)**
1. \`start\` prints. Output: start.
2. \`setTimeout(..., 0)\` puts "timeout" in the **timer** queue.
3. The async IIFE starts **synchronously**: \`async start\` prints. At \`await null\`, the rest of the function ("async end") is put in the **microtask** queue and control returns to the script.
4. \`Promise.resolve().then(...)\`: the promise is already resolved, so "promise" is appended to the microtask queue, **after** "async end".
5. \`end\` prints. Synchronous code is done.
6. Drain microtasks in order: \`async end\`, then \`promise\`.
7. Take one timer: \`timeout\`.

**Rules I am applying:** synchronous code first; the body of an async function before its first await is synchronous; awaiting a non-promise (or already-resolved promise) still yields to the microtask queue for one tick; microtasks are FIFO and fully drained before any timer.

**Why testers care:** this is the reason a missing \`await\` before a Playwright call lets the next line run first, and why a \`.then\` callback's assertion may happen after the test has already ended.`,
      followUps: [
        {
          q: 'What if the .then line is moved above the async IIFE?',
          a: 'Then "promise" is queued first, so the order becomes start, async start, end, promise, async end, timeout. Microtasks run in the order they were queued, so the position of the line that queues them decides the order.',
        },
        {
          q: 'What if `await null` becomes `await new Promise(r => setTimeout(r, 0))`?',
          a: 'Now "async end" waits for a timer registered after the "timeout" timer. Order: start, async start, end, promise, timeout, async end. The awaited promise resolves only when its own timer fires, which is behind the first timer in the queue.',
        },
      ],
      pitfalls: [
        'Printing "async start" after "end" (thinking the whole async function is deferred).',
        'Putting "timeout" before the promise lines because its delay is 0.',
        'Guessing promise before async end without tracing queue order.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-05',
      difficulty: 'medium',
      question:
        'Evaluate each coercion expression aloud and explain the conversion: `[] + []`, `[] + {}`, `"5" - - "2"`, `true + true + "1"`, `[10] == 10`.',
      whatInterviewerLooksFor: [
        'Correct values: "", "[object Object]", 7, "21", true',
        'Explains object-to-primitive conversion via the string form',
        'Explains left-to-right evaluation and when + switches to concatenation',
        'Uses typeof of each result',
      ],
      modelAnswer: `**Results:** \`""\` (empty string), \`"[object Object]"\`, \`7\`, \`"21"\`, \`true\`.

**Step by step**
- **\`[] + []\`**: \`+\` with objects converts each to a primitive. An array's primitive form is its \`join(",")\`, so \`[]\` → \`""\`. \`"" + ""\` → **""** (a string).
- **\`[] + {}\`**: \`""\` + \`"[object Object]"\` → **"[object Object]"**. (Typed alone at the start of a console line, \`{} + []\` can be parsed as an empty block followed by \`+[]\` and show 0, so always test it inside \`console.log(...)\`.)
- **\`"5" - - "2"\`**: the second minus is unary: \`-"2"\` → -2 (number). Then \`"5" - (-2)\`: binary minus converts "5" to 5, so 5 + 2 → **7**.
- **\`true + true + "1"\`**: left to right. \`true + true\` → 1 + 1 → 2 (no strings yet, so numeric). \`2 + "1"\` → **"21"**.
- **\`[10] == 10\`**: \`==\` between an object and a number converts the object: \`[10]\` → "10" → 10. \`10 == 10\` → **true**.

**My rule of thumb**
1. Evaluate one operator at a time, left to right (unary first).
2. If \`+\` sees a string (after converting objects), it concatenates; every other arithmetic operator converts to numbers.
3. In real code, avoid all of this: convert explicitly with \`Number()\`/\`String()\` and compare with \`===\`.`,
      followUps: [
        {
          q: 'What does `[1, 2] == "1,2"` give, and `[1, 2] === "1,2"`?',
          a: 'The first is true: the array becomes the string "1,2" and the strings match. The second is false, because === never converts and an array is not a string. This is exactly why test assertions should use strict equality or toEqual on real arrays.',
        },
        {
          q: 'What is `+[]` and `+{}`?',
          a: '+[] is 0 because [] becomes "" and "" converts to 0. +{} is NaN because {} becomes "[object Object]", which is not a number. Unary plus is just Number(...) in disguise.',
        },
      ],
      pitfalls: [
        'Saying [] + [] is [] or an empty array.',
        'Evaluating true + true + "1" as "truetrue1".',
        'Reading "5" - - "2" as a syntax error or as 3.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-06',
      difficulty: 'medium',
      question:
        'What do the two values printed by this reset helper look like, and why? `function reset(data) { data.items.push("extra"); data = { items: [] }; return data.items.length; } const order = { items: ["pen"] }; console.log(reset(order), order.items);`',
      whatInterviewerLooksFor: [
        'Correct output: 0 [ \'pen\', \'extra\' ]',
        'Explains that JavaScript passes a copy of the reference ("call by sharing")',
        'Separates mutation (visible to caller) from reassignment (local only)',
        'Links it to shared test data mutated by helpers',
      ],
      modelAnswer: `**Output:** \`0 [ 'pen', 'extra' ]\`

**Step by step**
1. \`order\` points to an object box: \`{ items: ['pen'] }\`.
2. Calling \`reset(order)\` copies the **reference** into the parameter \`data\`. Now \`order\` and \`data\` point to the same box.
3. \`data.items.push("extra")\` **mutates** that shared box: the caller's \`order.items\` is now \`['pen', 'extra']\`.
4. \`data = { items: [] }\` **reassigns** only the local parameter. \`data\` now points to a brand-new box; \`order\` still points to the old one.
5. \`return data.items.length\` reads the new box: \`0\`.
6. \`console.log\` prints \`0\` and then the caller's array: \`[ 'pen', 'extra' ]\`.

**How I describe it in one line:** JavaScript is always pass-by-value, but for objects the value *is* a reference. You can change the object the caller sees; you cannot make the caller's variable point somewhere else.

**Test-automation impact:** a fixture object such as \`const validUser = {...}\` passed into helpers that "tweak" it (\`user.email = ''\` for a negative test) leaks the change into later tests. Defend with a fresh copy per test (\`structuredClone(validUser)\` or a factory function that returns a new object every call).`,
      followUps: [
        {
          q: 'What if the first line inside reset were `data.items = []` instead of push?',
          a: 'Then the caller sees order.items as an empty array, because assigning a property on the shared object is still a mutation. The output would be 0 [] — the reassignment of data afterwards changes nothing for the caller.',
        },
        {
          q: 'Would passing `{ ...order }` into reset protect the caller?',
          a: 'Only partly. The spread creates a new outer object, but its items property still points to the same array, so the push still changes order.items. A deep copy with structuredClone(order) fully protects it.',
        },
      ],
      pitfalls: [
        'Saying JavaScript passes objects "by reference" and so order now has an empty items array.',
        'Answering 1 for the length by forgetting the reassignment.',
        'Thinking the push is undone because data was reassigned.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-07',
      difficulty: 'hard',
      question:
        'Three variables, one array: `const a = [3, 1, 2]; const b = a.sort(); const c = a.reverse(); console.log(a, b, c, a === c);` What is printed and what does it teach you about array methods?',
      whatInterviewerLooksFor: [
        'Correct output: [ 3, 2, 1 ] three times and true',
        'Knows sort and reverse mutate in place and return the same array',
        'Mentions toSorted/toReversed or copying first',
        'Relates to test helpers corrupting scraped data',
      ],
      modelAnswer: `**Output:** \`[ 3, 2, 1 ] [ 3, 2, 1 ] [ 3, 2, 1 ] true\`

**Step by step**
1. \`a\` points to one array box: \`[3, 1, 2]\`.
2. \`a.sort()\` sorts **that box in place** to \`[1, 2, 3]\` and returns **the same box**. So \`b\` is not a sorted copy; \`b === a\`.
3. \`a.reverse()\` also works in place: the single box becomes \`[3, 2, 1]\`, and \`c\` is again the same box.
4. All three variables point to one array, so all print \`[ 3, 2, 1 ]\`, and \`a === c\` is \`true\`.

Most candidates expect \`b\` to be \`[ 1, 2, 3 ]\` because "b was assigned before the reverse". The assignment copied the **reference**, not the contents, so later mutations show through.

**Mutating vs non-mutating**

| Mutates and returns same array | Returns a new array |
|---|---|
| \`sort\`, \`reverse\`, \`splice\`, \`fill\`, \`copyWithin\` | \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\` (ES2023), \`slice\`, \`map\`, \`filter\`, \`concat\` |

**Safe versions**

    const sorted = [...a].sort((x, y) => x - y);
    const reversed = a.toReversed();   // Node 20+

**In tests:** when I verify sort order on a page, I read the values once and compare against a sorted *copy*, never against \`values.sort()\`, because that compares the array with itself.`,
      followUps: [
        {
          q: 'What changes if line 2 is `const b = [...a].sort();`?',
          a: 'Then b is its own sorted array [ 1, 2, 3 ], and a is only reversed: [ 2, 1, 3 ]. c is the same box as a, so the output is [ 2, 1, 3 ] [ 1, 2, 3 ] [ 2, 1, 3 ] true.',
        },
        {
          q: 'Why might `[10, 9, 1].sort()` surprise someone here?',
          a: 'Without a comparator the values are compared as strings, so the result is [ 1, 10, 9 ]: "10" comes before "9" because "1" < "9". Always pass (x, y) => x - y for numbers.',
        },
      ],
      pitfalls: [
        'Printing b as [ 1, 2, 3 ] (thinking sort returns a copy).',
        'Answering a === c as false.',
        'Not knowing any non-mutating alternative.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-08',
      difficulty: 'hard',
      question:
        'A counter is built with an IIFE that exposes a getter, and one value is destructured mid-way: `const counter = (() => { let n = 0; return { inc: () => ++n, get value() { return n; } }; })(); counter.inc(); counter.inc(); const { value } = counter; counter.inc(); console.log(value, counter.value);` Explain the result.',
      whatInterviewerLooksFor: [
        'Correct output: 2 3',
        'Explains the IIFE runs once and the closure keeps n private and alive',
        'Explains destructuring reads the getter once (a snapshot)',
        'Mentions the same snapshot problem with spread',
      ],
      modelAnswer: `**Output:** \`2 3\`

**Step by step**
1. The arrow IIFE runs **once**, immediately. It creates a local \`n = 0\` and returns an object whose \`inc\` and \`value\` getter both close over that same \`n\`. Nothing outside can reach \`n\` directly: it is private state.
2. \`counter.inc()\` twice → \`n\` is 2.
3. \`const { value } = counter\` **calls the getter once** and stores the number 2 in a plain local variable. It does not keep a link to the getter.
4. \`counter.inc()\` → \`n\` is 3.
5. \`value\` is still the snapshot \`2\`; \`counter.value\` calls the getter again and reads the live closure: \`3\`.

**Two ideas in one question**
- **Closures keep variables alive**: \`n\` survives after the IIFE returns because \`inc\` and the getter still reference it.
- **Reading a getter copies its current value**: destructuring, spread (\`{ ...counter }\`) and \`JSON.stringify\` all freeze the value at that moment.

**Where it shows up in tests:** destructuring \`const { count } = cartState\` once at the start of a test and asserting on it later, after actions changed the state, gives stale results. Read the live value right before the assertion.`,
      followUps: [
        {
          q: 'What if value were a normal property `value: n` instead of a getter?',
          a: 'Then it is evaluated once, when the object literal is created, so counter.value would be 0 forever. The output would be 0 0: incrementing n never touches a plain property that copied it at creation time.',
        },
        {
          q: 'What does `const copy = { ...counter }; counter.inc(); console.log(copy.value)` print at the end of the original snippet?',
          a: 'Spread calls the getter at copy time and stores a plain data property. If made after the third inc (n = 3), copy.value is 3, and later incs do not change it. copy.inc still points at the shared closure, though, so copy.inc() would increment the original n.',
        },
      ],
      pitfalls: [
        'Answering 3 3 (thinking destructuring keeps a live link).',
        'Answering 0 3 or thinking the IIFE re-runs on each access.',
        'Not recognising the get syntax as a getter.',
      ],
    },
    {
      id: 'js-output-puzzles-iq-09',
      difficulty: 'easy',
      question:
        'Predict the three lines from this profile-guard code: `const user = { profile: null }; console.log(user && user.profile && user.profile.email); console.log(user.profile?.email ?? "no email"); console.log(!!user.profile, !!user);`',
      whatInterviewerLooksFor: [
        'Correct output: null / no email / false true',
        'Knows && returns an operand, not a boolean',
        'Explains optional chaining short-circuits to undefined and ?? supplies a default',
        'Uses !! to explain truthiness',
      ],
      modelAnswer: `**Output**

    null
    no email
    false true

**Step by step**
1. **\`user && user.profile && user.profile.email\`**: \`&&\` returns the first falsy operand, or the last one if all are truthy. \`user\` is an object → truthy, move on. \`user.profile\` is \`null\` → falsy, **stop and return \`null\`**. The third operand never runs, which is why there is no TypeError. The printed value is \`null\`, not \`false\`.
2. **\`user.profile?.email ?? "no email"\`**: \`?.\` sees that \`user.profile\` is null and short-circuits to \`undefined\` instead of throwing. \`??\` replaces \`undefined\` with \`"no email"\`.
3. **\`!!user.profile, !!user\`**: double negation converts to a real boolean. \`null\` → \`false\`; any object → \`true\`.

**Why interviewers ask this:** the old \`a && a.b && a.b.c\` guard and the modern \`a?.b?.c\` both protect against \`Cannot read properties of null\`, but they return different things (\`null\` vs \`undefined\`), and \`||\` vs \`??\` differ when the real value is \`0\` or \`""\`.

**In API tests** I prefer \`body.user?.email\` with an explicit assertion that the profile exists first, so a missing field fails loudly with a clear message instead of quietly becoming a default.`,
      followUps: [
        {
          q: 'What if profile is `{ email: "" }` and we use `|| "no email"` instead of `??`?',
          a: 'Then `user.profile?.email || "no email"` gives "no email" because "" is falsy, while `?? "no email"` gives "" because "" is not null or undefined. Use ?? when empty strings or zero are valid values you want to keep.',
        },
        {
          q: 'What if user itself is null in line 2?',
          a: 'user.profile?.email would throw TypeError, because the optional chain only protects the access after ?. — reading .profile on null is unprotected. You need user?.profile?.email.',
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
        'Default parameters that read outer state: `let count = 0; function next(id = ++count) { return id; } console.log(next(), next(5), next(), count);` What prints, and what changes if the signature becomes `function pair(a = b, b = 1)`?',
      whatInterviewerLooksFor: [
        'Correct output: 1 5 2 2',
        'Knows defaults are evaluated at call time, only when the argument is undefined',
        'Knows parameters have their own TDZ, left to right',
        'Clear step-by-step narration',
      ],
      modelAnswer: `**Output:** \`1 5 2 2\`

**Step by step**
1. Arguments of \`console.log\` are evaluated left to right.
2. \`next()\`: no argument, so the default expression \`++count\` **runs now**: count becomes 1 and \`id\` is 1. Returns **1**.
3. \`next(5)\`: an argument was passed, so the default expression is **not evaluated at all**. count stays 1. Returns **5**.
4. \`next()\`: default runs again: count becomes 2. Returns **2**.
5. \`count\` is read last: **2**.

Defaults are not computed once at definition time (unlike Python); they are expressions re-evaluated on every call that needs them, and they can have side effects.

**The second part: \`function pair(a = b, b = 1)\`**

Parameters behave like \`let\` declarations initialised **left to right**, each with its own TDZ:

    function pair(a = b, b = 1) { return [a, b]; }
    pair();        // ReferenceError: Cannot access 'b' before initialization
    pair(7);       // [ 7, 1 ] — a's default never runs
    function pairOk(a = 1, b = a * 2) { return [a, b]; }
    pairOk();      // [ 1, 2 ]

So a default may use **earlier** parameters, never later ones.

**Test relevance:** a data factory such as \`function makeUser(id = ++seq)\` gives unique IDs only for calls without an explicit ID, which is exactly what you want, but it also means passing \`undefined\` explicitly still consumes a sequence number.`,
      followUps: [
        {
          q: 'What does `next(undefined)` do, and `next(null)`?',
          a: 'next(undefined) triggers the default exactly like a missing argument, so count increments. next(null) passes a real value: no increment, and it returns null. Only undefined activates defaults.',
        },
        {
          q: 'What is `next.length`?',
          a: 'It is 0. Function length counts parameters before the first one with a default value (or a rest parameter). Since id has a default, nothing is counted.',
        },
      ],
      pitfalls: [
        'Answering 1 5 1 1 (thinking the default is computed once).',
        'Thinking next(5) still increments count.',
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
        'Runs as a plain (non-module) script with node.',
        'The code, one statement per line, is: var stage = "build" / let runs = 0 / function pipeline() { console.log(stage) / var stage = "test" / runs++ / console.log(stage, runs) / if (true) { let stage = "deploy"; console.log(stage) } / console.log(stage) / return typeof report / function report() {} } / console.log(pipeline()) / console.log(stage, runs).',
        'There are six console.log calls; write one output line per call, in execution order.',
      ],
      steps: [
        { label: 'Registration (global)', calc: 'stage → undefined (var), runs → TDZ (let), pipeline → function. Then stage = "build", runs = 0.' },
        { label: 'Registration (inside pipeline)', calc: 'Local var stage → undefined (shadows the global for the whole function); report → function (hoisted even though it sits after return).' },
        { label: 'Line 1: console.log(stage)', calc: 'Reads the LOCAL stage, still undefined → prints `undefined`.' },
        { label: 'Line 2: console.log(stage, runs)', calc: 'Local stage = "test"; runs (global let, reachable by closure) becomes 1 → prints `test 1`.' },
        { label: 'Line 3: inside the if block', calc: 'A block-scoped let stage = "deploy" shadows the local var inside the block only → prints `deploy`.' },
        { label: 'Line 4: after the block', calc: 'Block gone; back to the function\'s var stage → prints `test`.' },
        { label: 'Line 5: console.log(pipeline())', calc: 'return typeof report → the hoisted function declaration exists → prints `function`.' },
        { label: 'Line 6: console.log(stage, runs)', calc: 'Global stage was never touched (the function wrote its own local) → "build"; runs was incremented once → prints `build 1`.' },
      ],
      answer: `Output:

1. \`undefined\`
2. \`test 1\`
3. \`deploy\`
4. \`test\`
5. \`function\`
6. \`build 1\``,
      insight:
        'Resolve every name to the innermost scope that declares it anywhere in that scope, then apply that declaration\'s hoisting rule. A function declaration placed after return is still hoisted; a var inside a function never touches the global of the same name; but a function can freely mutate an outer let it does not redeclare (runs).',
      followUps: [
        {
          q: 'What changes if `var stage = "test"` becomes `let stage = "test"`?',
          a: 'The first console.log(stage) inside pipeline now hits the Temporal Dead Zone and throws ReferenceError: Cannot access stage before initialization. Nothing else in pipeline runs, and because the error is not caught, the last line of the script never runs either.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-2',
      question:
        'Ten numbered labels race through three timers, a two-step promise chain and an async IIFE. Write the exact print order of labels 1 to 10 (code in the givens).',
      assumptions: [
        'Code: `console.log("1"); setTimeout(() => console.log("2"), 10); setTimeout(() => { console.log("3"); Promise.resolve().then(() => console.log("4")); }, 0); Promise.resolve().then(() => { console.log("5"); setTimeout(() => console.log("6"), 0); }).then(() => console.log("7")); (async () => { console.log("8"); await null; console.log("9"); })(); console.log("10");`',
        'Runs in Node or a browser; the whole synchronous part finishes in well under 10 ms.',
        'Keep three columns: Output, Microtask queue, Timer queue.',
        'Timers with equal delay run in registration order; a 10 ms timer runs after the 0 ms timers registered in the same few milliseconds.',
      ],
      steps: [
        { label: 'Sync pass', calc: 'Print 1. Timer queue: [2 @10ms, T3 @0ms]. Microtasks: [then5]. Async IIFE prints 8, hits await → microtasks: [then5, rest9]. Print 10. Output so far: 1, 8, 10.' },
        { label: 'Drain microtasks (1)', calc: 'then5 prints 5 and registers timer 6 @0ms → timers: [T3, 6, 2@10ms]. Its .then(7) is now queued → microtasks: [rest9, then7].' },
        { label: 'Drain microtasks (2)', calc: 'rest9 prints 9. then7 prints 7. Microtask queue empty. Output: 1, 8, 10, 5, 9, 7.' },
        { label: 'First timer', calc: 'T3 prints 3 and queues a microtask (4). Microtasks drain before the next timer → prints 4.' },
        { label: 'Second timer', calc: 'Timer 6 (0 ms, registered during microtasks) prints 6.' },
        { label: 'Last timer', calc: 'The 10 ms timer prints 2.' },
      ],
      answer: `Output: **1, 8, 10, 5, 9, 7, 3, 4, 6, 2** (one per line).`,
      insight:
        'Write the queues down. The two traps are (a) the async function body before await is synchronous (8 comes early), and (b) a microtask created inside a timer runs before the NEXT timer (4 before 6). Timer 2 is last only because of its 10 ms delay.',
      followUps: [
        {
          q: 'What if the 10 ms delay on label 2 becomes 0?',
          a: 'Timer 2 was registered first of all, so it becomes the first timer to run: 1, 8, 10, 5, 9, 7, 2, 3, 4, 6. Equal delays run in registration order, and timer 6 was registered last (during the microtask phase).',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-3',
      question:
        'Evaluate this coercion worksheet; write each printed line: `console.log(1 + "1" - 1); console.log("3" + 4 * 5); console.log([] + null + 1); console.log([2] * [3]); console.log(true + null); console.log("" == []); console.log(NaN === NaN || Object.is(NaN, NaN)); console.log(typeof (1 / 0)); console.log(0 === -0, Object.is(0, -0)); console.log({} == "[object Object]");`',
      assumptions: [
        'Ten separate console.log statements, each on its own line.',
        'Write strings without quotes (as Node prints top-level strings).',
        'Apply operator precedence (* before +) and left-to-right evaluation.',
      ],
      steps: [
        { label: '1 + "1" - 1', calc: '1 + "1" → "11" (string join). "11" - 1 → 10 (minus converts). Prints 10.' },
        { label: '"3" + 4 * 5', calc: '* first: 20. "3" + 20 → "320". Prints 320.' },
        { label: '[] + null + 1', calc: '[] → "". "" + null → "null". "null" + 1 → "null1". Prints null1.' },
        { label: '[2] * [3]', calc: '* converts both to numbers: "2" → 2, "3" → 3. Prints 6.' },
        { label: 'true + null', calc: 'No strings: 1 + 0 → 1. Prints 1.' },
        { label: '"" == []', calc: '[] → "" ; "" == "" → true. Prints true.' },
        { label: 'NaN === NaN || Object.is(NaN, NaN)', calc: 'First is false; Object.is treats NaN as equal to itself → true. Prints true.' },
        { label: 'typeof (1 / 0)', calc: '1 / 0 is Infinity, which is a number. Prints number.' },
        { label: '0 === -0, Object.is(0, -0)', calc: '=== says true; Object.is distinguishes the signs → false. Prints true false.' },
        { label: '{} == "[object Object]"', calc: 'The object converts to its string form "[object Object]" → equal. Prints true.' },
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
        'Every line is solved by the same two habits: evaluate one operator at a time in precedence order, and write the TYPE of each intermediate value. The moment a string appears, + joins; every other arithmetic operator converts to numbers.',
      followUps: [
        {
          q: 'Line 3 becomes `[] + undefined + 1`. What prints?',
          a: 'undefined1. [] becomes the empty string, "" + undefined is the string "undefined", and joining 1 gives "undefined1". Compare `undefined + 1` alone, which is NaN because no string is involved.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-4',
      question:
        'Trace the references in this fixture script and write each logged line: `const base = { tags: ["smoke"], meta: { owner: "qa" }, count: 1 }; const copy = { ...base, count: 2 }; const list = [base, copy]; const sorted = list; copy.tags.push("api"); copy.meta = { owner: "dev" }; sorted.push({ tags: [] }); console.log(base.tags); console.log(base.meta.owner); console.log(base.count, copy.count); console.log(list.length); console.log(list[0] === base); console.log(copy.tags === base.tags); const ids = [5, 25, 100, 1]; const out = ids.sort(); console.log(out === ids, ids);`',
      assumptions: [
        'One statement per line, 16 lines in total, run with node.',
        'Arrays print Node-style, e.g. [ \'smoke\' ].',
        'Draw boxes for objects and arrows for variables before answering.',
      ],
      steps: [
        { label: 'Build the memory picture', calc: 'copy is a NEW outer object, but copy.tags and copy.meta point at base\'s tags array and meta object (spread is shallow). count is a number, copied by value and then overridden to 2.' },
        { label: 'list and sorted', calc: 'sorted = list copies the arrow, not the array: one array box with two names.' },
        { label: 'copy.tags.push("api")', calc: 'Mutates the SHARED tags array → base.tags is now [ \'smoke\', \'api\' ].' },
        { label: 'copy.meta = { owner: "dev" }', calc: 'Reassigns copy\'s own property to a new object; base.meta is untouched ("qa").' },
        { label: 'sorted.push(...)', calc: 'Same box as list → list.length becomes 3.' },
        { label: 'Logs 1–6', calc: '[ \'smoke\', \'api\' ] / qa / 1 2 / 3 / true / true.' },
        { label: 'ids.sort()', calc: 'String order: "1" < "100" < "25" < "5" → [ 1, 100, 25, 5 ], sorted in place, returns the same array → out === ids is true.' },
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
        'Spread copies one level: pushing into a nested array is shared, but replacing a nested property (copy.meta = ...) is not. Assigning an array to a new name never copies it. These are the same bugs that make one test\'s data edits leak into another.',
      followUps: [
        {
          q: 'How would you change line 2 so that base.tags stays [ \'smoke\' ]?',
          a: 'Copy the nested array too: `const copy = { ...base, tags: [...base.tags], count: 2 }`, or deep-copy everything with `structuredClone(base)` and then set count. Either way copy.tags becomes its own array and the push no longer reaches base.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-drill-5',
      question:
        'Trace `this` and closures through this Suite class and write every logged line: `class Suite { constructor(name) { this.name = name; this.results = []; } add(r) { this.results.push(r); return this; } summary() { return this.name + ": " + this.results.length; } kinds() { return this.results.map(function () { return typeof this; }); } names() { return this.results.map(() => this.name); } } const s = new Suite("smoke").add("pass").add("fail"); console.log(s.summary()); console.log(s.kinds()); console.log(s.names()); const fn = s.summary; try { fn(); } catch (e) { console.log(e.constructor.name); } const bound = s.summary.bind({ name: "other", results: [1] }); console.log(bound()); const makeCounter = () => { let n = 0; return () => n++; }; const c = makeCounter(); c(); c(); console.log(c(), makeCounter()());`',
      assumptions: [
        'Class bodies are always strict mode.',
        'The code is laid out one statement per line (about 20 lines).',
        'Six console.log calls; arrays print Node-style.',
      ],
      steps: [
        { label: 'Chained construction', calc: 'add returns this, so .add("pass").add("fail") works on the same object: results = [ \'pass\', \'fail\' ].' },
        { label: 's.summary()', calc: 'Dot call → this = s → "smoke: 2".' },
        { label: 's.kinds()', calc: 'map calls the regular function as a plain function; class code is strict, so this is undefined → [ \'undefined\', \'undefined\' ].' },
        { label: 's.names()', calc: 'Arrow borrows this from names(), which is s → [ \'smoke\', \'smoke\' ].' },
        { label: 'fn()', calc: 'Detached method, plain call → this is undefined → reading this.name throws TypeError, caught → prints TypeError.' },
        { label: 'bound()', calc: 'this is the bound object → "other: 1".' },
        { label: 'Counter', calc: 'n++ returns the OLD value: first c() → 0, second → 1, third → 2 (n becomes 3). makeCounter()() is a brand-new closure → 0. Prints 2 0.' },
      ],
      answer: `Output:

1. \`smoke: 2\`
2. \`[ 'undefined', 'undefined' ]\`
3. \`[ 'smoke', 'smoke' ]\`
4. \`TypeError\`
5. \`other: 1\`
6. \`2 0\``,
      insight:
        'Decide this at every call site: dot call → the object; plain call in class code → undefined; arrow → borrowed from the enclosing method; bind → fixed. Post-increment returns the value before the increment, and every factory call builds a fresh closure.',
      followUps: [
        {
          q: 'How could kinds() return [ \'object\', \'object\' ] without converting to an arrow function?',
          a: 'Pass a thisArg as the second argument to map: `this.results.map(function () { return typeof this; }, this)`. map then calls the callback with this set to the Suite instance, so typeof this is "object" for each element.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-output-puzzles-mcq-01',
      difficulty: 'easy',
      question: 'Three typeof checks on values a tester meets in API payloads. What is logged, line by line?',
      code: {
        language: 'javascript',
        code: `console.log(typeof NaN);
console.log(typeof [1, 2]);
console.log(typeof typeof 7);`,
      },
      options: ['number, object, string', 'NaN, array, number', 'number, array, string', 'undefined, object, number'],
      correct: [0],
      explanation:
        'NaN ("not a number") is still of type number. Arrays are objects, so typeof gives "object" (use Array.isArray to detect them). typeof always returns a string, so typeof of any typeof result is "string". "array" is never a typeof result, which rules out two options.',
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
      question: 'A quantity field mixes strings and numbers in arithmetic. What are the three printed results?',
      code: {
        language: 'javascript',
        code: `console.log('4' * '3');
console.log('4' + 3 - 1);
console.log(-'5' + 5);`,
      },
      options: ['12, 42, 0', '12, 6, 0', '"43", 42, "-55"', 'NaN, 42, 10'],
      correct: [0],
      explanation:
        'Line 1: * converts both strings to numbers → 12. Line 2: left to right, "4" + 3 joins to "43", then "43" - 1 converts back to a number → 42. Line 3: unary minus converts "5" to -5, and -5 + 5 → 0. The option with 6 forgets that + joins as soon as one side is a string.',
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
      question: 'A navigation queue gets two more steps pushed in one call. What do the two logs show?',
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
        'push mutates the array and returns its NEW LENGTH, not the array and not the pushed item. After pushing two items the array has 3 elements, so result is 3 and queue.length is 3. Expecting the array back is a common mistake when people chain push like map.',
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
        'An empty array is an object, and every object is truthy, so A prints. "0" and " " are non-empty strings, so they are truthy (B and D). 0 and null are falsy, so C and E do not print. Beginners often treat [] and "0" as "empty" and therefore falsy.',
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
      question: 'A browser name is redeclared inside a bare block. What are the two outputs?',
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
        'A let inside { } creates a new variable that exists only in that block and shadows the outer one there. Inside the block it is "firefox"; after the block the outer "chromium" is visible again. Redeclaring is only an error in the SAME scope, not in a nested block.',
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
      question: 'A test verdict string is uppercased and has its first letter overwritten (plain non-module script). What is finally logged?',
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
        'Strings are immutable. toUpperCase returns a NEW string, which is discarded because it is not assigned. Writing to verdict[0] silently does nothing in a sloppy script (strict mode would throw TypeError). So verdict is still "passed".',
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
      question: 'Prefix and postfix increments on a retry count. Which three numbers are printed?',
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
        'count++ returns the OLD value (5) and then increments count to 6. ++count increments first (to 7) and returns the NEW value (7). count is 7 at the end. Options with 6 for a mix up the postfix and prefix behaviour.',
      followUps: [
        {
          q: 'What does `let x = 5; x = x++; console.log(x);` print?',
          a: 'It prints 5. x++ evaluates to 5 and increments x to 6, but then the assignment writes the evaluated 5 back into x, overwriting the increment.',
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
        'Synchronous code runs first, so "test" prints immediately. Timers only run after the script finishes; the 0 ms timer fires before the 30 ms one, so "cleanup" then "report". A 0 ms delay never jumps ahead of synchronous code.',
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
      question: 'A const retry limit is reassigned inside try/catch. What two lines are logged?',
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
        'Assigning to a const binding throws TypeError ("Assignment to constant variable") at runtime, in sloppy and strict mode alike. The value stays 2. It is not a ReferenceError (the name exists) and not a SyntaxError (the code parses fine).',
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
      question: 'Two browser helpers are inspected with typeof before either line that defines them. What is logged?',
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
        'A function declaration is hoisted together with its body, so openBrowser is already a function. closeBrowser is a var: only the name is hoisted, with value undefined, until the assignment line runs. Nothing throws because var names exist from the start.',
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
      question: 'Arrays are combined with plus and multiplied. What are the two printed values?',
      code: {
        language: 'javascript',
        code: `console.log([1, 2] + [3, 4]);
console.log([5] * [2]);`,
      },
      options: ['1,23,4 and 10', '[ 1, 2, 3, 4 ] and 10', '10 and 10', '1,23,4 and NaN'],
      correct: [0],
      explanation:
        'Arrays do not add element-wise. + converts each to a string ("1,2" and "3,4") and joins them: "1,23,4". * converts to numbers: [5] → "5" → 5 and [2] → 2, giving 10. Use spread ([...a, ...b]) or concat to merge arrays.',
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
      question: 'Loose comparisons involving null and undefined against zero. What are the four booleans?',
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
        '== has a special rule: null and undefined equal each other and nothing else, so null == 0 and undefined == 0 are false, while undefined == null is true. >= uses numeric conversion instead, turning null into 0, so null >= 0 is true. This inconsistency is a favourite trick question.',
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
      question: 'Four letters are joined with a stray unary plus in the middle. What single word is printed?',
      code: {
        language: 'javascript',
        code: `console.log('t' + 'e' + +'s' + 't');`,
      },
      options: ['teNaNt', 'test', 'teNaN', 'tes0t'],
      correct: [0],
      explanation:
        'The "+ +" is a binary plus followed by a unary plus. Unary plus converts "s" to a number, which is NaN. Then "te" + NaN joins as "teNaN", and + "t" gives "teNaNt". Reading it as "test" ignores the unary operator.',
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
      question: 'Chained relational comparisons look mathematically obvious. What does each line print?',
      code: {
        language: 'javascript',
        code: `console.log(1 < 2 < 3);
console.log(3 > 2 > 1);
console.log(3 > 2 >= 1);`,
      },
      options: ['true, false, true', 'true, true, true', 'true, false, false', 'false, false, true'],
      correct: [0],
      explanation:
        'Comparisons run left to right and produce booleans. 1 < 2 is true, and true < 3 becomes 1 < 3 → true. 3 > 2 is true, and true > 1 becomes 1 > 1 → false. Line 3: true >= 1 becomes 1 >= 1 → true. JavaScript has no chained ranges like maths does.',
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
      question: 'The length of a results array is shrunk and then grown again. What are the two logs?',
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
        'Setting length smaller deletes the extra elements permanently. Setting it larger does not bring them back; it creates an empty slot (a hole), which Node prints as <1 empty item>. A hole is different from an element whose value is undefined, although reading it also gives undefined.',
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
      question: 'One browser is removed from a list with the delete operator. What does the single log line show?',
      code: {
        language: 'javascript',
        code: `const browsers = ['chromium', 'firefox', 'webkit'];
delete browsers[1];
console.log(browsers.length, browsers[1], 1 in browsers);`,
      },
      options: ['3 undefined false', '2 webkit true', '3 undefined true', '2 undefined false'],
      correct: [0],
      explanation:
        'delete removes the property but does not shift elements or change length, so length stays 3. Index 1 is now a hole: reading it gives undefined, and the "in" operator reports false because the slot no longer exists. To remove and shift, use splice(1, 1).',
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
        'A negative start counts from the end, so -1 is index 2 ("pay"). splice removes 1 element there, inserts "cart" and "pay" in its place, mutates steps, and returns the REMOVED items as an array: [ "pay" ]. It never returns the modified array.',
      followUps: [
        {
          q: 'How would you do the same edit without mutating steps?',
          a: 'Use toSpliced (ES2023, Node 20+): const next = steps.toSpliced(-1, 1, "cart", "pay"). Or build it with slice: [...steps.slice(0, -1), "cart", "pay"].',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-18',
      difficulty: 'medium',
      question: 'Temperature offsets including negatives are sorted with no comparator. What is the result?',
      code: {
        language: 'javascript',
        code: `console.log([-1, -5, 2, 10].sort());`,
      },
      options: ['[ -1, -5, 10, 2 ]', '[ -5, -1, 2, 10 ]', '[ -1, -5, 2, 10 ]', '[ 10, 2, -1, -5 ]'],
      correct: [0],
      explanation:
        'Default sort compares string forms character by character. "-" (code 45) comes before digits, so the negatives come first; "-1" before "-5" because "1" < "5". Then "10" before "2" because "1" < "2". The numeric order needs sort((a, b) => a - b).',
      followUps: [
        {
          q: 'Why does the default sort use strings at all?',
          a: 'Arrays can hold mixed types, and string comparison is a total order that works for anything. The spec chose it as the safe default, which is why every numeric sort must pass a comparator.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-19',
      difficulty: 'medium',
      question: 'A doubling helper uses braces in its arrow function, and a second one uses forEach. What is printed?',
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
        'An arrow function with braces is a block body: without an explicit return it returns undefined, so map collects three undefineds. forEach always returns undefined, whatever the callback returns. Removing the braces (n => n * 2) fixes the map.',
      followUps: [
        {
          q: 'How do you return an object literal from a concise arrow function?',
          a: 'Wrap it in parentheses: n => ({ value: n }). Without them, the braces are read as a function body and value: is treated as a label, so the function returns undefined.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-20',
      difficulty: 'medium',
      question: 'How many lines does this forEach print when the callback returns early for one ID?',
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
        'return inside a forEach callback only ends that one call; forEach moves on to the next element. So 102 is skipped and 101, 103, 104 print. forEach cannot be stopped early except by throwing; use for...of with break, or some/find.',
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
      question: 'An array of user objects is spread into a copy, then the copy is edited. What does the original report?',
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
        'Spread creates a new outer array, so pushing into copy does not change users (length stays 1). But the element objects are shared references, so editing copy[0].name edits the same object users[0] points to: "ravi". Shallow copy, shared insides.',
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
      question: 'A lookup object receives the number 1 and the string "1" as keys. What is printed?',
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
        'Plain-object keys are always strings (or symbols). seen[1] is stored under the key "1", so the second assignment overwrites the same property. There is one key, and its value is "string key". A Map would keep 1 and "1" as two different keys.',
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
      question: 'A Promise constructor logs before and after calling resolve. In what order do the four strings appear?',
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
        'The executor function runs synchronously inside the constructor, so "exec" prints first. resolve() does not stop the executor, so "after resolve" prints next. The .then callback is a microtask and waits until the synchronous "end" has printed; then "done" appears.',
      followUps: [
        {
          q: 'What if the executor calls resolve twice with different values?',
          a: 'Only the first call counts. A promise settles once; later resolve or reject calls are silently ignored, so .then receives the first value.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-24',
      difficulty: 'medium',
      question: 'A rejected request is recovered by catch and the chain continues. What is logged, in order?',
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
        'Synchronous "D" prints first. The rejection skips the .then that has no error handler (A never runs), reaches .catch, which logs "B timeout" and RETURNS a value. Returning from catch fulfils the next promise, so the final .then runs with "recovered".',
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
      question: 'A sum function computes its second parameter from the first by default. What does the call list print?',
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
        'The default applies only when the argument is undefined. sum(3) and sum(3, undefined) use b = 6 → 9. sum(3, 0) keeps 0 → 3. sum(3, null) keeps null, and 3 + null converts null to 0 → 3, not NaN.',
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
      question: 'A logging function compares the arguments it received with the parameters it declared. What two strings print?',
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
        'arguments.length counts the values actually passed: 1, then 3 (extra arguments are allowed and still counted). A function\'s length property counts its declared parameters, which is always 2 here. Options with 3/3 assume length changes per call.',
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
      question: 'A Set is built from mixed duplicates including NaN and signed zeros. What size is reported?',
      code: {
        language: 'javascript',
        code: `const unique = new Set([1, '1', 1, NaN, NaN, 0, -0]);
console.log(unique.size);`,
      },
      options: ['4', '5', '6', '7'],
      correct: [0],
      explanation:
        'Set uses SameValueZero: 1 and "1" differ (number vs string), the second 1 is a duplicate, NaN is treated as equal to NaN (unlike ===), and 0 and -0 count as the same. Unique values: 1, "1", NaN, 0 → 4.',
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
        'The parameter receives a copy of the reference. Setting account.plan mutates the caller\'s object, so acct.plan becomes "pro". Reassigning account only redirects the local name to a new object, whose plan "free" is returned. The caller\'s variable is never redirected.',
      followUps: [
        {
          q: 'How would you write upgrade so it never changes the caller\'s object?',
          a: 'Return a new object instead: const upgrade = (account) => ({ ...account, plan: "pro" }). The caller decides whether to use it, and shared test fixtures stay untouched.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-29',
      difficulty: 'medium',
      question: 'An environment key string is edited with replace, substring and slice. What three lines appear?',
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
        'replace with a string pattern changes only the FIRST "-". substring swaps its arguments when start > end, so (6, 2) acts as (2, 6) → "-env". slice does not swap; with start > end it returns an empty string, so the comparison is true.',
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
        'A: null and undefined are loosely equal by definition. C: "1" converts to 1. D: [] converts to "", which equals "". B is false because NaN equals nothing. E is false because null is only == to undefined (and itself), never to false, even though both are falsy.',
      followUps: [
        {
          q: 'Why is `null == false` false when both are falsy?',
          a: 'Because == does not check truthiness. Its algorithm has a special case that makes null equal only to null and undefined. Truthiness only matters in boolean contexts like if, &&, || and !.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-31',
      difficulty: 'medium',
      question: 'Select ALL string and array comparisons below that log true.',
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
        'B: one side is a number, so "9" becomes 9 and 10 > 9. C: strings compare char by char and "c" < "d". E: [2] → "2" → 2. A is false because two strings compare as text ("1" < "9"). D is false because uppercase "Z" (90) sorts before lowercase "a" (97).',
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
      question: 'Select ALL labelled lines that log the value undefined.',
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
        'A missing property (A), a function without return (B) and an out-of-range index (C) all give undefined without throwing. D prints 2 because user.name exists, so ?. continues normally. E prints null, which is a different value from undefined.',
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
      question: 'A block reads an outer level variable before redeclaring it with let. What happens at the console.log line?',
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
        'The inner let level is hoisted to the top of the block and shadows the outer variable for the WHOLE block, but it is in the Temporal Dead Zone until its line. So console.log(level) refers to the inner, uninitialised binding and throws ReferenceError: Cannot access level before initialization. It does not fall back to the outer 1.',
      followUps: [
        {
          q: 'What would it print if the inner declaration used var at the top level of a function instead of a block?',
          a: 'Inside a function, a var level later in the body makes level undefined at the console.log line (hoisted as undefined), so it prints undefined rather than throwing. var gives a silent wrong value; let gives a loud error.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-34',
      difficulty: 'hard',
      question: 'A launch helper falls back to webkit when no browser is set. What does it return?',
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
        'The var inside the if is hoisted to the top of launch, creating a local browser that is undefined and shadows the global "chromium". !undefined is true, so the if body assigns "webkit", which is returned. The global is never read inside the function.',
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
      question: 'Two function declarations share the label name, and one call happens between them. What is printed?',
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
        'All function declarations are processed before any line runs, and the later one replaces the earlier. By the time label() is called on line 2, label already returns "B". Duplicate function declarations are allowed in scripts and in function bodies, so there is no error.',
      followUps: [
        {
          q: 'Would the answer change if both were written as `const label = function () {...}`?',
          a: 'Yes: declaring const label twice in the same scope is a SyntaxError and nothing runs. With let the same. With var it would run and print A B, because each assignment happens in order.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-36',
      difficulty: 'hard',
      question: 'A named function expression checks its own internal name. What two values appear?',
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
        'The name of a named function expression is bound only inside that function body (useful for recursion and stack traces). Inside, check is the function → "function". Outside, check is not declared anywhere, and typeof an undeclared name safely returns "undefined".',
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
      question: 'A Cart method is destructured off its instance and called. What two lines are logged?',
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
        'Destructuring copies the function, not its link to cart. count() is a plain call, and class code is strict, so this is undefined and this.items throws TypeError. count.call(cart) sets this explicitly, returning 2. The "undefined" option is what a sloppy plain-object version might do.',
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
      question: 'An env reader is bound to the qa object, then called with call and rebound. What are the three names?',
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
        'bind creates a new function whose this is fixed forever. call cannot override it, and binding a bound function again has no effect on this, so both bound calls return "qa". The unbound env.call(prod) uses prod → "prod".',
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
      question: 'An async loader awaits null while a then-callback and more logs are queued. What is the exact print order?',
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
        'S1 prints. Calling load() runs it synchronously up to the await: L1 prints, and the continuation is queued as a microtask. Then the .then callback is queued behind it. S2 prints, ending the synchronous code. Microtasks run in order: L2, then P.',
      followUps: [
        {
          q: 'What is the order if load() is called after the Promise.resolve line?',
          a: 'S1, L1, S2, P, L2. The then callback is queued first, and the await continuation second. The rule is simply first queued, first run.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-40',
      difficulty: 'hard',
      question: 'finally callbacks return values and log during success and failure chains. What is printed?',
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
        'finally callbacks receive no value and their return value is ignored; the original result passes through ("data", or the rejection). Both finally callbacks run in the first microtask round, so "cleanup" prints first. The pass-through then needs extra ticks, and the chains stay in step, so "data" prints before "boom".',
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
      question: 'Settings are frozen and then two properties are written in a plain sloppy-mode script. What is logged?',
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
        'Object.freeze makes the top-level properties read-only; in sloppy mode the write to timeout is silently ignored, so it stays 5000. Freeze is shallow: user is a separate object that is not frozen, so its role changes to "admin". In strict mode or an ES module, line 2 would throw TypeError instead.',
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
      question: 'What are the two booleans from comparing an array with its own negation and Math.max with Math.min?',
      code: {
        language: 'javascript',
        code: `console.log([] == ![]);
console.log(Math.max() < Math.min());`,
      },
      options: ['true, true', 'false, false', 'false, true', 'true, false'],
      correct: [0],
      explanation:
        '![] is false because [] is truthy. Then [] == false: false → 0, [] → "" → 0, so 0 == 0 is true. Math.max() with no arguments returns -Infinity (the identity for max) and Math.min() returns Infinity, so -Infinity < Infinity is true.',
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
      question: 'Unary plus is applied to six different values in one log call. What is printed?',
      code: {
        language: 'javascript',
        code: `console.log(+true, +'', +' 12 ', +'1e3', +[], +{});`,
      },
      options: ['1 0 12 1000 0 NaN', '1 NaN 12 1 0 NaN', 'NaN 0 NaN 1000 NaN NaN', '1 0 12 1e3 0 0'],
      correct: [0],
      explanation:
        'Unary + is Number(). true → 1. The empty string → 0. Surrounding spaces are trimmed → 12. "1e3" is valid exponent notation → 1000. [] → "" → 0. {} → "[object Object]" → NaN.',
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
      question: 'A sparse array is iterated with forEach and mapped. What does the single log line contain?',
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
        'The double comma creates a hole, so length is 3. forEach skips holes: the callback runs twice. map also skips the hole but keeps the slot, so the result has a hole in the same position. NaN would appear only if the slot held undefined.',
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
      question: 'A while loop stores closures over a let declared before the loop. What does fns[0]() return?',
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
        'There is only one i: it was declared once, outside the loop. let gives one binding per iteration only when it is declared in a for-header. All three closures read the same variable, which is 3 when they are finally called.',
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
        'B throws ReferenceError: the name was never declared, and only typeof (line A) is allowed to touch undeclared names safely. D throws TypeError: cfg.timeout is undefined, and reading .ms on undefined fails. C just gives undefined, and E short-circuits to undefined through optional chaining.',
      followUps: [
        {
          q: 'Which error type tells you "the name does not exist" vs "the value is wrong"?',
          a: 'ReferenceError means the identifier cannot be resolved (typo, out of scope, TDZ). TypeError means the name exists but the value cannot be used that way (reading a property of undefined/null, calling a non-function, assigning to a const).',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-47',
      difficulty: 'medium',
      question: 'Select ALL typeof lines whose printed result is the word object.',
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
        'null gives "object" (a historic bug kept for compatibility), arrays are objects, and a Date instance is an object. Functions are objects too, but typeof reports them specially as "function" (C). NaN is a number (E).',
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
      question: 'Select ALL labels that print after sync but before timer in this mixed async script.',
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
        'Order: sync, then, micro, async, timer. "then", "micro" and the code after await are all microtasks, queued in that order, and the whole microtask queue is drained before any timer runs. A 0 ms timer is a macrotask and always waits.',
      followUps: [
        {
          q: 'What is the difference between queueMicrotask and Promise.resolve().then?',
          a: 'Both queue a microtask in the same queue. queueMicrotask is a direct API that does not create a promise, so an exception in it is reported as an uncaught error instead of an unhandled rejection.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-49',
      difficulty: 'expert',
      question: 'The loop body increments its own let counter after scheduling a timeout. Which numbers are printed?',
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
        'Iteration 1: i is 0, a timer is scheduled, then i++ makes this iteration\'s binding 1. The header copies 1 into a fresh binding and increments it to 2; 2 < 3, so iteration 2 schedules a timer and i++ makes it 3. Next: copy 3, increment to 4, loop ends. Each closure sees its own binding\'s final value: 1 and 3.',
      followUps: [
        {
          q: 'What would the same loop print with var?',
          a: 'Two timers are still scheduled (i goes 0 → 1 → 2 → 3 → 4), but they share one variable whose final value is 4, so it prints 4 and 4.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-50',
      difficulty: 'expert',
      question: 'parseInt is given a tiny decimal as a string, the same decimal as a number, and a pixel value. What three numbers print?',
      code: {
        language: 'javascript',
        code: `console.log(parseInt('0.0000005'));
console.log(parseInt(0.0000005));
console.log(parseInt('12px'));`,
      },
      options: ['0, 5, 12', '0, 0, 12', '0, 0, NaN', '5, 5, 12'],
      correct: [0],
      explanation:
        'parseInt converts its argument to a string first and reads digits until it hits an invalid character. "0.0000005" → stops at "." → 0. The NUMBER 0.0000005 stringifies as "5e-7", so parsing stops at "e" → 5. "12px" → 12. Use Math.trunc for numbers; parseInt is for strings.',
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
      question: 'Sync logs, an async IIFE with two awaits, a then-chain and two timers are interleaved. What is the full order?',
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
        'Sync: A, C (async body up to the first await), I. Microtasks queued: [D-continuation, G]. D runs (schedules timer E, then awaits → F queued); G runs (H queued). Queue is now [F, H]: F, then H. Timers in registration order: B (registered first), then E.',
      followUps: [
        {
          q: 'Why does F come before H even though both are "second steps"?',
          a: 'F was queued while D ran, which happened before G ran and queued H. The microtask queue is first-in, first-out, so whichever step was queued earlier runs earlier, regardless of which chain it belongs to.',
        },
      ],
    },
    {
      id: 'js-output-puzzles-mcq-52',
      difficulty: 'expert',
      question: 'An object with a getter is spread into a copy before the source changes. What do the two getter reads show?',
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
        'Spread READS each property, so the getter runs once at copy time (1 + 1 = 2) and the copy stores the plain value 2, not the getter. Later, stats.next calls the live getter with passed = 10 → 11. The snapshot never updates.',
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
        'During registration, the var declaration adds report (as undefined) and the function declaration then sets it to the function, so the first typeof is "function". When line 2 executes, the assignment replaces it with 42. The function declaration on line 3 does nothing at runtime, so the final typeof is "number".',
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
