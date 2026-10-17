import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-async',
  phase: 'javascript',
  order: 6,
  title: 'Asynchronous JavaScript: Promises, async/await & the Event Loop',
  subtitle:
    'Why almost every Playwright line starts with await. Learn what runs now, what runs next and what runs after a timer (the event loop), plus promises, async/await, error handling, Promise.all and friends, and the async mistakes that make tests pass when they should fail.',
  estimatedMinutes: 120,
  sources: [
    'javascript.info — Introduction: callbacks, Promise, Promises chaining, Error handling with promises, Promise API, Microtasks, Async/await, Event loop: microtasks and macrotasks',
    'MDN Web Docs — Using promises, Promise.all / allSettled / race / any, async function, await, queueMicrotask, The event loop (JavaScript execution model)',
    'Jake Archibald — Tasks, microtasks, queues and schedules (jakearchibald.com, 2015)',
    'Philip Roberts — What the heck is the event loop anyway? (JSConf EU 2014)',
    'Marijn Haverbeke — Eloquent JavaScript, Ch 11 Asynchronous Programming',
    'Playwright docs — Writing tests (await), Auto-waiting, page.waitForResponse, page.waitForEvent, Best practices (lint with @typescript-eslint/no-floating-promises), Clock',
    'Debbie O\'Brien / Playwright team — "Catch missing await calls in Playwright tests with ESLint" (dev.to)',
    'Node.js docs — Unhandled rejections (--unhandled-rejections=throw is the default since Node 15)',
  ],
  tags: ['async', 'promises', 'async-await', 'event-loop', 'microtasks', 'promise-all', 'floating-promises', 'playwright-await'],
  cheatSheet: [
    'JavaScript does ONE thing at a time. Slow work (network, timers, browser actions) is started now, and the result is handled later through callbacks or promises. Nothing blocks.',
    'Event loop: 1) run all normal code (runs now); 2) run ALL promise jobs: .then, code after await, queueMicrotask (runs after the current code; "microtasks"); 3) run ONE timer or event (runs after a timer; "macrotask"); back to 2.',
    'Classic order: `console.log(1); setTimeout(→2); Promise.resolve().then(→3); console.log(4)` prints 1 4 3 2. setTimeout(fn, 0) means "after everything else", never "now".',
    'A promise is pending, then settles once: fulfilled (a value) or rejected (an error). `.then` returns a NEW promise: return a value to pass it on, throw to reject.',
    'An async function always returns a promise. await pauses only that function; the rest of it runs after the current code. Code after an un-awaited call keeps running at once.',
    'Errors: `try { await x } catch (e) {}`, or `.catch()`. try/catch WITHOUT await catches nothing. Inside try, write `return await`, so that try can catch the error.',
    'Promise.all: all succeed → values in input order; first failure → fails at once. allSettled: never fails, gives {status, value|reason}. race: first to finish. any: first to succeed, AggregateError if all fail.',
    'One after another: `await a(); await b();` = sum of the times. Together: `await Promise.all([a(), b()])` = the slowest time. Run together only work that does not depend on each other.',
    '`arr.forEach(async x => await ...)` does not wait. Use `for...of` + await (one after another) or `await Promise.all(arr.map(async x => ...))` (together).',
    'In Playwright, await actions (click, fill, goto), web-first assertions (`await expect(locator).toBeVisible()`) and reads (textContent, allTextContents). `page.locator()` and `getByRole()` only describe: no await.',
    'Missing await = "floating promise": the test can end before the action or check runs. It passes falsely, or fails later with "Target page, context or browser has been closed". Turn on @typescript-eslint/no-floating-promises.',
    'Wait for a response or popup by starting the wait BEFORE the click: `const resP = page.waitForResponse(url); await click; const res = await resP;` (or Promise.all of both).',
  ],
  sections: [
    {
      heading: 'Sync vs async: why JavaScript waits without blocking',
      body: `**Example:** \`console.log('order taken'); setTimeout(() => console.log('food ready'), 1000); console.log('serving other tables');\`

- It prints \`order taken\`, then \`serving other tables\`.
- One second later, it prints \`food ready\`.

JavaScript did not stop and wait for the timer. It started the timer and moved on.

Think of a restaurant with **one waiter**. A slow waiter takes your order, then stands in the kitchen until the food is ready. A smart waiter gives the order to the kitchen and serves other tables. When the kitchen rings the bell, he comes back. JavaScript is the smart waiter.

**The facts:**

- JavaScript does **one thing at a time**. (It has one "thread".)
- Slow jobs are handed to someone else: network calls, timers, files, and every browser action in Playwright. JavaScript keeps going and handles the result later.
- **Synchronous** code runs now, line by line. Each line finishes before the next one starts.
- **Asynchronous** code *starts* a job now and *finishes* it later. You get the result through a **callback** or a **promise**. Both are explained below.

**Watch out:** a long loop blocks everything. While it runs, no timer, click or page update can happen.

**Why testers care:** \`page.click()\` talks to a real browser, so it cannot finish at once. It returns a promise. If you do not \`await\` it, your test runs ahead of the browser.`,
      code: [
        {
          language: 'javascript',
          title: 'Synchronous vs asynchronous order',
          code: `console.log('1. order taken');

setTimeout(() => {
  console.log('3. food ready (after 1 second)');
}, 1000);                                // hand the job to the timer, keep going

console.log('2. serving other tables');

// A long loop freezes EVERYTHING (timers, clicks, page updates) until it finishes
const start = Date.now();
while (Date.now() - start < 200) { /* busy-wait 200 ms: never do this */ }
console.log('blocked for ~200 ms');

// Output:
// → 1. order taken
// → 2. serving other tables
// → blocked for ~200 ms
// → 3. food ready (after 1 second)`,
        },
      ],
      keyPoints: [
        'JavaScript does one thing at a time, so a long loop blocks everything else.',
        'Async work starts now and finishes later, through a callback or a promise.',
        'Every Playwright action is async, because it talks to a separate browser program.',
      ],
      source: 'javascript.info — Introduction: callbacks; Eloquent JavaScript Ch 11',
    },
    {
      heading: 'Callbacks and callback hell',
      body: `**Example:** \`setTimeout(() => console.log('done'), 500);\`

- The arrow function \`() => console.log('done')\` is a **callback**.
- \`setTimeout\` calls it back after 500 ms, and it prints \`done\`.

A **callback** is a function you give to other code, so that code can call it later. It is like leaving your phone number: "call me when it is ready".

\`setTimeout(fn, ms)\`, \`addEventListener('click', fn)\` and Node's older \`fs.readFile(path, (err, data) => ...)\` all take callbacks. In Node's style, the first argument is the error (or \`null\`). The second is the result. This is called **error-first**.

**The problem: callback hell.** Step 2 needs the result of step 1. Step 3 needs the result of step 2. So the callbacks sit inside each other, deeper and deeper. People call this the "pyramid of doom". Every level must check its own error. And a \`try/catch\` around the outer call cannot catch errors inside the callback, because the callback runs later.

**The fix was promises**, and then \`async/await\` on top of promises. You still see callbacks in event handlers, like \`page.on('dialog', ...)\` in Playwright. Turning a callback function into a promise is a classic interview task. See the \`sleep\` example below.

**Why testers care:** Playwright events such as \`page.on('dialog', ...)\` use callbacks, and many old test helpers do too.`,
      code: [
        {
          language: 'javascript',
          title: 'Nested callbacks vs a promise wrapper',
          code: `// Fake slow functions in callback style (the error comes first)
function getUser(id, cb) { setTimeout(() => cb(null, { id, name: 'Asha' }), 10); }
function getOrders(user, cb) { setTimeout(() => cb(null, ['A1', 'B2']), 10); }

// Callbacks inside callbacks: every level handles its own error
getUser(7, (err, user) => {
  if (err) return console.error(err);
  getOrders(user, (err2, orders) => {
    if (err2) return console.error(err2);
    console.log(user.name, orders);      // → Asha ['A1', 'B2']
  });
});

// Turning callback functions into promises (what util.promisify does)
const getUserP = (id) =>
  new Promise((resolve, reject) => getUser(id, (err, u) => (err ? reject(err) : resolve(u))));
const getOrdersP = (u) =>
  new Promise((resolve, reject) => getOrders(u, (err, o) => (err ? reject(err) : resolve(o))));

// Flat and readable with async/await
async function main() {
  const user = await getUserP(7);
  const orders = await getOrdersP(user);
  console.log(user.name, orders.length); // → Asha 2
}
main();

// The most famous wrapper: sleep (fine in scripts, NOT as a wait in Playwright tests)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));`,
        },
      ],
      keyPoints: [
        'A callback is a function passed to be called later.',
        'Callbacks inside callbacks are hard to read, and each level must handle its own error.',
        'Wrap a callback function in new Promise(...) once, then use await.',
      ],
      source: 'javascript.info — Introduction: callbacks; Node.js docs — util.promisify',
    },
    {
      heading: 'The event loop: runs now, runs next, runs after a timer',
      body: `**Example:** \`console.log('A'); setTimeout(() => console.log('B'), 0); Promise.resolve().then(() => console.log('C')); console.log('D');\`

- It prints \`A\`, \`D\`, \`C\`, \`B\`.
- \`A\` and \`D\` **run now**.
- \`C\` **runs after the current code finishes**.
- \`B\` **runs after a timer**, so it comes last, even with 0 ms.

The **event loop** is the rule that decides what runs next. JavaScript puts every piece of code into one of three groups:

| Group | What is in it | Interview name |
|---|---|---|
| **Runs now** | normal lines of code, top to bottom | synchronous code (on the **call stack**) |
| **Runs after the current code finishes** | \`.then\`, \`.catch\`, \`.finally\`, the code after \`await\`, \`queueMicrotask\` | **microtasks** |
| **Runs after a timer** | \`setTimeout\`, \`setInterval\`, clicks and other events, network callbacks | **macrotasks** (or tasks) |

**The rule, step by step:**

1. Run all the "runs now" code, until nothing is left.
2. Run **every** "after the current code" job. If one of them adds a new one, run that too.
3. Run **one** timer job. Then go back to step 2.

**Things you must be able to explain:**

- \`setTimeout(fn, 0)\` does not mean "now". It means "after all current code and all promise jobs".
- A \`.then\` callback never runs at once, even if the promise is already done.
- The function inside \`new Promise(...)\` **runs now**. Only the \`.then\` part waits.
- After \`await\`, the rest of the function **runs after the current code finishes**.

**In an interview, say:** "First all normal code. Then all promise jobs, called microtasks. Then one timer, called a macrotask. Then promise jobs again."

**Why testers care:** this explains why \`setTimeout(fn, 0)\` is not instant, and why code after a missing \`await\` runs too early.`,
      diagram: `  +------------------+     starts timers, network    +-------------------+
  | RUNS NOW         | ----------------------------> | THE ENVIRONMENT   |
  | one line at a    |                               | timers, network,  |
  | time             |                               | the browser       |
  +--------^---------+                               +---------+---------+
           |                                                   | when done
           | 2) run ALL of these                               v
  +--------+-------------------+            +-----------------------------+
  | AFTER THE CURRENT CODE     |            | AFTER A TIMER               |
  | .then  await (microtasks)  |            | setTimeout (macrotasks)     |
  +----------------------------+            +--------------+--------------+
           ^                                               |
           +----------- 3) then take ONE of these ---------+`,
      code: [
        {
          language: 'javascript',
          title: 'The ordering rules in one snippet',
          code: `// microtask = runs after the current code finishes; macrotask = runs after a timer
console.log('A: sync');

setTimeout(() => console.log('B: macrotask (timer)'), 0);

Promise.resolve().then(() => console.log('C: microtask (then)'));

queueMicrotask(() => console.log('D: microtask (queueMicrotask)'));

new Promise((resolve) => {
  console.log('E: executor runs synchronously');
  resolve();
}).then(() => console.log('F: microtask (then)'));

console.log('G: sync');

// → A: sync
// → E: executor runs synchronously
// → G: sync
// → C: microtask (then)
// → D: microtask (queueMicrotask)
// → F: microtask (then)
// → B: macrotask (timer)`,
        },
      ],
      keyPoints: [
        'Order: runs now → all promise jobs (microtasks) → one timer (macrotask) → all promise jobs → ...',
        '.then callbacks and code after await run after the current code; timers run later.',
        'The function inside new Promise(...) runs now; only .then waits.',
      ],
      source: 'Jake Archibald — Tasks, microtasks, queues and schedules; javascript.info — Event loop: microtasks and macrotasks; Philip Roberts — JSConf EU 2014',
    },
    {
      heading: 'Promises: pending, fulfilled, rejected',
      body: `**Example:** \`Promise.resolve(5).then((n) => console.log(n * 2));\`

- It prints \`10\`.
- \`.then\` runs once the promise has its value.

A **promise** is like a parcel tracking number. Right now the parcel is on its way. This state is called **pending**. Later, one of two things happens:

- It arrives. The promise is **fulfilled**, and you get a **value**.
- It is lost. The promise is **rejected**, and you get a **reason** (an error).

A promise changes state only once. "Fulfilled or rejected" together is called **settled**.

**How to use a promise:**

- \`.then(fn)\` runs \`fn\` with the value.
- \`.catch(fn)\` runs \`fn\` with the error.
- \`.finally(fn)\` runs \`fn\` in both cases.
- **\`.then\` gives back a new promise.** What you **return** goes to the next \`.then\`. What you **throw** goes to the next \`.catch\`. This is how you build a chain.
- **Watch out:** if you forget \`return\` inside \`.then\`, the next step gets \`undefined\` and does not wait.
- An error skips the next \`.then\` steps until it reaches a \`.catch\`.
- \`Promise.resolve(v)\` and \`Promise.reject(err)\` make a promise that is already settled. They are handy for test mocks.

You will mostly write \`async/await\`. But Playwright returns promises everywhere, and puzzle questions use \`.then\`. So you need to read both styles.

**Why testers care:** every Playwright action returns a promise. A promise that nobody awaits can fail without anyone noticing.`,
      code: [
        {
          language: 'javascript',
          title: 'Creating and chaining promises',
          code: `function fetchBooking(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) resolve({ id, firstname: 'Asha', totalprice: 150 });
      else reject(new Error('Booking not found: ' + id));
    }, 50);
  });
}

fetchBooking(1)
  .then((b) => b.totalprice)                  // return a value → next then gets it
  .then((price) => price * 1.18)              // add 18% tax
  .then((total) => console.log(total.toFixed(2))) // → '177.00'
  .catch((err) => console.log('failed:', err.message))
  .finally(() => console.log('done'));        // → 'done'

fetchBooking(-1)
  .then(() => console.log('never runs'))      // skipped: the promise rejected
  .catch((err) => console.log(err.message))   // → 'Booking not found: -1'

// Forgetting return breaks the chain
Promise.resolve(2)
  .then((x) => { x * 10; })                   // no return!
  .then((v) => console.log(v));               // → undefined

// Settles only once
new Promise((resolve) => { resolve(1); resolve(2); }).then(console.log); // → 1`,
        },
      ],
      keyPoints: [
        'A promise settles once: fulfilled with a value, or rejected with an error.',
        'then returns a new promise: return to pass a value on, throw to reject.',
        'One catch at the end handles an error from any earlier step.',
      ],
      source: 'javascript.info — Promise, Promises chaining; MDN Web Docs — Using promises',
    },
    {
      heading: 'async/await',
      body: `**Example:** \`async function getPrice() { return 42; }\`

- \`getPrice()\` gives a **promise**, not \`42\`.
- \`await getPrice()\` gives \`42\`.

\`await\` means "pause this function until the promise is done". Other code can run in the meantime. It makes async code read like a normal script, top to bottom. That is why every Playwright test uses it.

**Rules:**

- An \`async\` function **always returns a promise**. \`return 5\` gives a promise of 5. A \`throw\` gives a rejected promise.
- \`await\` pauses **only the current async function**. The rest of the program keeps running.
- \`await 5\` (a plain value) just gives \`5\`, but the function still pauses for a moment.
- You can use \`await\` inside an \`async\` function. You can also use it at the top level of an ES module (a file that uses \`import\`).
- Arrow functions can be async too. \`async ({ page }) => { ... }\` is exactly what a Playwright test body is.

**What runs when:** when you call an async function, the code before its first \`await\` **runs now**. The code after the \`await\` **runs later**, once the promise is done. So if you call an async function without \`await\`, the caller moves on at once.

| \`.then\` style | async/await style |
|---|---|
| \`getUser().then(u => getOrders(u)).then(o => show(o))\` | \`const u = await getUser(); const o = await getOrders(u); show(o);\` |
| \`.catch(handle)\` | \`try { ... } catch (e) { handle(e) }\` |
| \`.finally(cleanup)\` | \`finally { cleanup() }\` |

**Why testers care:** every Playwright test is an async function. Each \`await\` makes the test wait for the browser before the next step.`,
      code: [
        {
          language: 'javascript',
          title: 'What runs when',
          code: `const wait = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));

async function login() {
  console.log('2: login starts (sync part)');
  const token = await wait(50, 'tok-123');     // pauses login() only
  console.log('4: got token', token);
  return token;                                // fulfils login()'s promise
}

console.log('1: before');
const p = login();                             // runs now, until the first await
console.log('3: after calling login, p is a', p.constructor.name); // → Promise
p.then((t) => console.log('5: caller sees', t));

// → 1: before
// → 2: login starts (sync part)
// → 3: after calling login, p is a Promise
// → true   (printed by the five() line below, which also runs now)
// → 4: got token tok-123
// → 5: caller sees tok-123

async function five() { return 5; }
console.log(five() instanceof Promise);        // → true`,
        },
      ],
      keyPoints: [
        'async functions always return promises.',
        'await pauses only the current function. The caller keeps going unless it awaits too.',
        'Code before the first await runs now.',
      ],
      source: 'javascript.info — Async/await; MDN Web Docs — async function, await',
    },
    {
      heading: 'Async error handling',
      body: `**Example:** \`try { await Promise.reject(new Error('503')); } catch (e) { console.log('caught', e.message); }\`

- It prints \`caught 503\`.
- Without the \`await\`, the \`catch\` would never run.

A rejected promise is an error that arrives **later**. You can only catch it if someone is still listening when it arrives. That means an \`await\` inside a \`try\`, or a \`.catch()\` on the promise.

**Rules:**

- \`try { await risky(); } catch (e) { ... }\` works. \`await\` turns the rejection into a normal error **at that line**.
- \`try { risky(); } catch (e) {}\` **without await** catches nothing. The try block ends at once, and the error comes later.
- Inside a \`try\`, write \`return await promise\`, not \`return promise\`. Only the first one lets that \`catch\` see the error.
- \`.catch()\` at the end of a chain does the same job in \`.then\` style.
- A rejection that nobody handles is an **unhandled rejection**. Since Node 15 it crashes Node. In Playwright it can fail a different test, which is very confusing.
- \`Promise.all\` rejects with the **first** error. The other promises keep running. Their later errors are ignored by \`all\`.

**In tests:** do not catch errors just to hide them. Catch them to add a clear message, to clean up, or when the error is what you expect: \`await expect(promise).rejects.toThrow('not found')\`.

**Why testers care:** with a missing \`await\` inside \`try\`, a failed setup step looks like a success.`,
      code: [
        {
          language: 'javascript',
          title: 'Catching rejections correctly',
          code: `const failSoon = () => new Promise((_, reject) => setTimeout(() => reject(new Error('503 from API')), 10));

async function good() {
  try {
    await failSoon();                       // rejection becomes a throw HERE
  } catch (e) {
    console.log('caught:', e.message);      // → caught: 503 from API
  }
}

async function bad() {
  try {
    failSoon();                             // no await: promise escapes the try
  } catch (e) {
    console.log('never printed');
  }
}                                           // → unhandled rejection later!

async function returnWithoutAwait() {
  try {
    return failSoon();                      // returned, not awaited: catch is skipped
  } catch {
    return 'recovered';
  }
}
async function returnWithAwait() {
  try {
    return await failSoon();                // awaited inside try: catch runs
  } catch {
    return 'recovered';
  }
}

await good();
returnWithoutAwait().catch((e) => console.log('caller got:', e.message)); // → caller got: 503 from API
console.log(await returnWithAwait());       // → recovered
// (call bad() in a script and Node exits with an unhandled rejection error)`,
        },
      ],
      keyPoints: [
        'try/catch only catches what you await inside it.',
        'Inside try, write return await, so that try can catch the error.',
        'Unhandled rejections crash Node and confuse Playwright reports. Always await, or add .catch.',
      ],
      source: 'javascript.info — Error handling with promises; Node.js docs — unhandled rejections',
    },
    {
      heading: 'Promise.all, allSettled, race and any',
      body: `**Example:** \`const results = await Promise.all([Promise.resolve('login'), Promise.resolve('cart')]);\`

- \`results\` is \`['login', 'cart']\`.
- \`Promise.all\` waits for **all** the promises, and keeps their order.

Imagine you are waiting for several parcels:

- **all:** tell me when every parcel arrives. If one is lost, tell me at once.
- **allSettled:** tell me when every parcel has arrived or been lost. Give me a report for each one.
- **race:** tell me about the first parcel that arrives *or* gets lost.
- **any:** tell me about the first parcel that arrives. Only report a failure if every parcel was lost.

| Method | Succeeds when | Fails when | Result | Testing use |
|---|---|---|---|---|
| \`Promise.all\` | all succeed | the **first** one fails | values in **input order** | create 5 bookings in parallel; wait for click + response |
| \`Promise.allSettled\` | all are done | never | \`[{status:'fulfilled', value}, {status:'rejected', reason}]\` | health-check several services and report every failure |
| \`Promise.race\` | the first one to finish succeeds | the first one to finish fails | that one value or error | add a timeout to a promise |
| \`Promise.any\` | the first one **succeeds** | **all** fail | first value; \`AggregateError\` with \`.errors\` | try mirrors, use the fastest that works |

**Details interviewers ask about:**

- \`all\` gives results in the order you passed them in, not the order they finished.
- \`Promise.all([])\` succeeds at once with \`[]\`. \`Promise.any([])\` fails with an \`AggregateError\` (one error that holds a list of errors).
- \`all\` does not stop the other promises when one fails. They keep running.
- Plain values in the list count as already done.

**Why testers care:** \`Promise.all\` creates test data in parallel. \`allSettled\` reports every broken service, not just the first.`,
      code: [
        {
          language: 'javascript',
          title: 'All four combinators side by side',
          code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

console.log(await Promise.all([wait(30, 'login'), wait(10, 'cart'), 'static']));
// → ['login', 'cart', 'static']   (input order, not finish order)

try {
  await Promise.all([wait(200, 'slow'), failAfter(20, 'payment API down')]);
} catch (e) {
  console.log(e.message);          // → 'payment API down' (after ~20 ms, fail fast)
}

const report = await Promise.allSettled([wait(10, 'auth ok'), failAfter(10, 'search 500')]);
console.log(report.map((r) => (r.status === 'fulfilled' ? r.value : 'FAIL ' + r.reason.message)));
// → ['auth ok', 'FAIL search 500']

console.log(await Promise.race([wait(50, 'slow mirror'), wait(5, 'fast mirror')]));
// → 'fast mirror'

try {
  await Promise.any([failAfter(5, 'mirror A down'), failAfter(10, 'mirror B down')]);
} catch (e) {
  console.log(e.name, e.errors.map((x) => x.message));
  // → AggregateError ['mirror A down', 'mirror B down']
}

// race as a timeout wrapper
const withTimeout = (p, ms) =>
  Promise.race([p, failAfter(ms, 'Timed out after ' + ms + 'ms')]);
try { await withTimeout(wait(100, 'x'), 20); } catch (e) { console.log(e.message); }
// → 'Timed out after 20ms'`,
        },
      ],
      keyPoints: [
        'all: every value, or the first error. Results come in input order.',
        'allSettled: never fails. Use it to report every result.',
        'race: the first to finish (even a failure). any: the first success.',
      ],
      source: 'MDN Web Docs — Promise.all, Promise.allSettled, Promise.race, Promise.any; javascript.info — Promise API',
    },
    {
      heading: 'Sequential vs parallel',
      body: `**Example:**

- \`for (const id of ids) await getUser(id);\` runs the calls **one after another**.
- \`await Promise.all(ids.map((id) => getUser(id)));\` runs them **at the same time**.
- With 3 calls of 100 ms each, the first takes about 300 ms. The second takes about 100 ms.

Think of making tea and toast. One after another: boil the kettle, wait, *then* start the toaster. At the same time: start both, then wait for both. It is the same work with half the waiting. But it only works when the jobs do not depend on each other.

| Pattern | Code | Total time for 3 × 100 ms calls |
|---|---|---|
| One after another (sequential) | \`for (const id of ids) results.push(await get(id))\` | ~300 ms |
| At the same time (parallel) | \`await Promise.all(ids.map((id) => get(id)))\` | ~100 ms |
| Start early, await later | \`const a = get(1); const b = get(2); await a; await b;\` | ~100 ms (but see the warning) |

**When to choose which:**

- **One after another** when each step needs the one before it. Example: log in → get a token → create a booking with that token. Also when order matters, or when the server has a rate limit.
- **At the same time** for independent work. Examples: create 10 test users through the API, or check 5 endpoints.
- **In small groups** for big batches. Run 5 at a time with \`Promise.all\`, so you do not overload a shared test server.

**Watch out ("start early, await later"):** \`a\` may fail while you still wait for \`b\`. Then nobody is listening to \`a\` yet. Node may report an unhandled rejection. \`Promise.all\` listens to all of them at once, so prefer it.

**UI steps in Playwright stay one after another.** One page is one user. Clicking in parallel causes races. Playwright runs tests in parallel with **workers** (separate processes), not with \`Promise.all\` over clicks.

**Why testers care:** parallel API setup can make a slow test suite several times faster.`,
      code: [
        {
          language: 'javascript',
          title: 'Timing sequential vs parallel',
          code: `const fakeApi = (id) => new Promise((r) => setTimeout(() => r({ id, ok: true }), 100));
const ids = [1, 2, 3];

let t = Date.now();
const seq = [];
for (const id of ids) seq.push(await fakeApi(id));   // one after another
console.log('sequential', Math.round((Date.now() - t) / 100) * 100, 'ms'); // → sequential 300 ms

t = Date.now();
const par = await Promise.all(ids.map((id) => fakeApi(id))); // all at once
console.log('parallel', Math.round((Date.now() - t) / 100) * 100, 'ms');   // → parallel 100 ms
console.log(par.map((r) => r.id));                   // → [1, 2, 3] (input order)

// Limited concurrency: chunks of 2
async function inChunks(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}
t = Date.now();
await inChunks([1, 2, 3, 4, 5], 2, fakeApi);
console.log('chunked', Math.round((Date.now() - t) / 100) * 100, 'ms');     // → chunked 300 ms`,
        },
      ],
      keyPoints: [
        'await in a loop = one after another. Promise.all over map = all at the same time.',
        'Run together only independent work. Use small groups to respect rate limits.',
        'In Playwright, keep UI steps one after another. Use workers for parallel tests.',
      ],
      source: 'javascript.info — Async/await, Promise API; MDN Web Docs — Promise.all',
    },
    {
      heading: 'Common async mistakes: missing await, forEach + async, floating promises',
      body: `**Example:** \`[30, 10].forEach(async (ms) => { await sleep(ms); console.log(ms); }); console.log('done');\`

- It prints \`done\` first, then \`10\`, then \`30\`.
- \`forEach\` did not wait for the async functions. (\`sleep(ms)\` waits \`ms\` milliseconds.)

A promise nobody waits for is like a colleague you sent on an errand and then forgot. If they fail, nobody hears about it. If you leave the building (the test ends), the errand is cut short.

**Mistake 1: missing \`await\`.** \`page.getByRole('button', { name: 'Login' }).click();\` without \`await\` starts the click and moves on. If it is the last line, the test **ends** and Playwright closes the page. Then the click fails with "Target page, context or browser has been closed". The error may point to the wrong place, or not show at all. An un-awaited \`expect(locator).toHaveText(...)\` may never get the chance to fail. The test **passes when it should fail**.

**Mistake 2: \`forEach\` with an async function.** \`forEach\` ignores the promises. All the calls start, \`forEach\` returns at once, and nothing waits. Use \`for...of\` with \`await\` (one after another). Or use \`await Promise.all(arr.map(async ...))\` (at the same time). \`map\` alone has the same problem: you get a list of unfinished promises.

**Mistake 3: a helper that hides its promise.** If a helper calls an async function without \`return\` or \`await\`, even \`await helper()\` does not wait for that work. A promise that nobody awaits is called a **floating promise**.

**Mistake 4: async functions in \`filter\`, \`find\` or \`some\`.** An async function returns a promise. A promise counts as true, so \`filter\` keeps everything.

**Mistake 5: \`await\` on code that is not async**, like \`await page.locator(...)\`. It does no harm, but it shows confusion. Linters flag it.

**Prevention:** turn on the \`@typescript-eslint/no-floating-promises\` lint rule (the Playwright docs recommend it). \`eslint-plugin-playwright\` also has a \`missing-playwright-await\` rule. Use TypeScript. In code review, check every Playwright call for \`await\`.

**Why testers care:** a missing \`await\` is the most common reason a Playwright test passes while the feature is broken.`,
      code: [
        {
          language: 'javascript',
          title: 'forEach does not wait',
          code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

async function collectBroken() {
  const out = [];
  [30, 10, 20].forEach(async (ms) => {
    await wait(ms);
    out.push(ms);
  });
  console.log('forEach finished, length =', out.length); // → 0  (nothing awaited!)
  return out;
}

async function collectSequential() {
  const out = [];
  for (const ms of [30, 10, 20]) {
    await wait(ms);
    out.push(ms);
  }
  return out;                                  // → [30, 10, 20]  (~60 ms)
}

async function collectParallel() {
  return Promise.all([30, 10, 20].map(async (ms) => { await wait(ms); return ms; }));
}                                              // → [30, 10, 20]  (~30 ms, input order)

const broken = await collectBroken();
await wait(50);
console.log('later the broken array is', broken); // → [10, 20, 30] (completion order, too late)
console.log(await collectSequential());
console.log(await collectParallel());

// async predicate in filter keeps everything (a Promise is truthy)
const kept = [1, 2, 3].filter(async (n) => n > 2);
console.log(kept);                             // → [1, 2, 3]`,
        },
      ],
      keyPoints: [
        'Every promise must be awaited, returned, or given a .catch.',
        'forEach, filter and find never wait for async functions.',
        'Turn on no-floating-promises, so the linter finds missing awaits.',
      ],
      source: 'Playwright docs — Best practices (lint your tests); dev.to Playwright — Catch missing await calls with ESLint; javascript.info — Async/await',
    },
    {
      heading: 'Why every Playwright call is awaited',
      body: `**Example:**

- \`const button = page.getByRole('button', { name: 'Login' });\` needs **no** \`await\`. It only describes the button.
- \`await button.click();\` **needs** \`await\`. It talks to the browser.

Your test script and the browser are two separate programs. They talk over a connection. Every command (\`click\`, \`fill\`, \`goto\`) is a message, and then a wait for the reply. \`await\` means "wait until the browser says it is done, then go to the next step".

**What needs await and what does not:**

| Needs \`await\` (returns a Promise) | No \`await\` (runs at once) |
|---|---|
| Actions: \`goto\`, \`click\`, \`fill\`, \`check\`, \`selectOption\`, \`press\` | Making locators: \`page.locator()\`, \`getByRole()\`, \`getByTestId()\`, \`.filter()\`, \`.nth()\` |
| Web-first assertions: \`await expect(locator).toBeVisible()\`, \`toHaveText\`, \`toHaveURL\` | Plain checks on normal values: \`expect(prices.length).toBe(6)\` |
| Reads: \`textContent\`, \`allTextContents\`, \`count\`, \`isVisible\`, \`inputValue\` | \`test.info()\`, building strings and arrays |
| Waits: \`waitForResponse\`, \`waitForEvent\`, \`waitForURL\` | |
| API: \`request.get/post\`, \`response.json()\` | |

A locator is only a **description** of where to find something. Making one does not touch the browser, so it needs no \`await\`. Using a locator (click, check, read) does touch the browser, so it needs \`await\`.

**Waiting for something a click causes:** start the wait **before** the click. Otherwise the response or popup may arrive before you start listening, and the wait times out.

- \`const responsePromise = page.waitForResponse('**/api/cart'); await addButton.click(); const response = await responsePromise;\` (the pattern in the Playwright docs), or
- \`const [response] = await Promise.all([page.waitForResponse('**/api/cart'), addButton.click()]);\`

**Do not** use \`page.waitForTimeout(3000)\` or your own \`sleep\` as a wait. Actions already wait until the element is ready. Web-first assertions (the \`await expect(locator)...\` checks) retry, for 5 s by default. Each test gets 30 s. Fixed sleeps only add time and flakiness.

**Why testers care:** knowing which calls need \`await\` stops both false passes and "page has been closed" errors.`,
      code: [
        {
          language: 'typescript',
          title: 'Correct awaits, a response wait and a popup',
          code: `import { test, expect } from '@playwright/test';

test('todo is saved and the docs link opens in a new tab', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');

  const input = page.getByPlaceholder('What needs to be done?'); // sync: just a description
  await input.fill('Buy milk');                                  // async: talks to the browser
  await input.press('Enter');

  const items = page.getByTestId('todo-item');
  await expect(items).toHaveCount(1);              // web-first: retries up to 5 s
  await expect(items.first()).toHaveText('Buy milk');

  const texts = await items.allTextContents();     // async read → string[]
  expect(texts).toEqual(['Buy milk']);             // plain value: no await needed
});

test('wait for the API response an action triggers', async ({ page }) => {
  // 1) start waiting BEFORE the action (no await yet)
  const responsePromise = page.waitForResponse('**/api/v1/fruits');
  // 2) trigger it: this page fetches the fruit list while loading
  await page.goto('https://demo.playwright.dev/api-mocking');
  // 3) now await the response that was already being listened for
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const fruits = await response.json();             // → [{ name: ..., id: ... }, ...]
  expect(fruits.length).toBeGreaterThan(0);
});

test('handle a popup', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('link', { name: 'Click Here' }).click(),
  ]);
  await expect(popup.getByRole('heading')).toHaveText('New Window');
});`,
        },
      ],
      keyPoints: [
        'Making a locator needs no await. Actions, reads and web-first assertions need await.',
        'Start waitForResponse or waitForEvent before the click that causes it.',
        'Never use fixed sleeps. Trust auto-waiting and retrying assertions.',
      ],
      source: 'Playwright docs — Writing tests, Auto-waiting, page.waitForResponse, page.waitForEvent, Pages (handling popups)',
    },
    {
      heading: 'Output-ordering puzzles: a method that always works',
      body: `**Example:** \`console.log('s'); setTimeout(() => console.log('t'), 0); Promise.resolve().then(() => console.log('p')); console.log('e');\`

- Answer: \`s\`, \`e\`, \`p\`, \`t\`.
- Runs now: \`s\` and \`e\`. Runs after the current code: \`p\`. Runs after a timer: \`t\`.

These puzzles look like tricks, but you can solve them step by step. Draw three columns: **Output**, **After current code** (microtasks) and **After a timer** (macrotasks).

**The method:**

1. Read the code from top to bottom. Print every normal \`console.log\` at once. Remember: the function inside \`new Promise(...)\` runs now. So does an async function, up to its first \`await\`.
2. \`setTimeout\` → add its callback to the **After a timer** column.
3. \`.then\` on a finished promise, \`queueMicrotask\`, or the code after an \`await\` → add it to the **After current code** column.
4. When the script ends, run the **After current code** column from the top until it is empty. New jobs go to the bottom.
5. Take the **first** timer job and run it. Then empty the **After current code** column again. Repeat.

**Patterns to recognise:**

| Pattern | Result |
|---|---|
| normal logs vs everything else | normal logs always come first |
| \`then\` vs \`setTimeout(0)\` | \`then\` first |
| two chains \`.then(a1).then(a2)\` and \`.then(b1).then(b2)\` | they take turns: a1 b1 a2 b2 |
| \`await\` inside an async function called from the script | the code after \`await\` waits for the script to end, then runs before any timer |
| \`setTimeout\` added inside a \`then\` | goes to the back of the timer line |
| a \`then\` added inside a \`setTimeout\` | runs right after that timer, before the next timer |

**Exam tip:** say the steps out loud while you solve. Interviewers care more about the reasoning than the final answer.

**Why testers care:** these puzzles are common in SDET interviews. The same reasoning explains many flaky async tests.`,
      code: [
        {
          language: 'javascript',
          title: 'A full puzzle with the trace',
          code: `async function a1() {
  console.log('a1 start');
  await a2();                 // a2 runs now; the rest of a1 waits for the current code to finish
  console.log('a1 end');
}
async function a2() { console.log('a2'); }

console.log('script start');
setTimeout(() => console.log('timeout'), 0);   // After a timer: [timeout]
a1();                                          // logs a1 start, a2; After current code: [a1 end]
new Promise((resolve) => {
  console.log('executor');                     // runs now
  resolve();
}).then(() => console.log('then'));            // After current code: [a1 end, then]
console.log('script end');

// → script start
// → a1 start
// → a2
// → executor
// → script end
// → a1 end
// → then
// → timeout`,
        },
      ],
      keyPoints: [
        'Track three columns: output, after current code (microtasks), after a timer (macrotasks).',
        'Run all promise jobs before each timer job.',
        'Code before the first await runs now; code after it runs after the current code.',
      ],
      source: 'Jake Archibald — Tasks, microtasks, queues and schedules; javascript.info — Event loop',
    },
  ],
  codeChallenges: [
    {
      id: 'js-async-cc-1',
      title: 'The Playwright test that always passes',
      context:
        'This checkout test has been green for weeks. Then a developer broke the "Add to cart" buttons, and it stayed green. In CI it sometimes fails with "Target page, context or browser has been closed", on a different line each time.',
      task: 'Fix every async problem in `cartTest(page, names)`, so the test really checks the cart and fails when it should. Keep the same steps. The lab uses a tiny fake of Playwright\'s `page` (small delays, no browser). It also has two web-first assertions, `expectBadge(page, text)` and `expectCartItems(page, names)`. They retry for a short time and reject if the value is wrong. The tests call `runCartTest(names, brokenButtons)`. It runs your test like Playwright does: the page is closed as soon as the test function returns. It resolves with `{ result, cart }`: `\'passed\'` or `\'failed: <message>\'`, and the cart in click order. With `brokenButtons`, the Add to cart buttons do nothing, so your test must fail on the badge check. Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'cart-test.js',
        code: `// The test you fix. page is a tiny fake of Playwright's page (see the harness below):
// page.fill(...) ~ page.getByPlaceholder(...).fill(...), expectCartItems ~ await expect(locator).toHaveText(...)
async function cartTest(page, names) {
  page.fill('Username', 'standard_user');
  page.fill('Password', 'secret_sauce');
  await page.clickLogin();

  names.forEach(async (name) => {
    await page.clickAddToCart(name);
  });

  await page.waitForTimeout(2000);
  page.clickCartLink();

  expectCartItems(page, names);
  if (await page.badgeIsVisible()) {
    console.log('badge visible');
  }
}

// ---- lab harness: a tiny fake Playwright page (no need to change below) ----
const tick = (ms) => new Promise((r) => setTimeout(r, ms));
// a forgotten await must not crash the runner, so fake promises are marked as handled
const handled = (p) => { p.catch(() => {}); return p; };

function makeFakePage(brokenButtons) {
  const s = { closed: false, user: '', pass: '', loggedIn: false, cart: [], onCartPage: false };
  const act = (ms, fn) => handled((async () => {
    await tick(ms);
    if (s.closed) throw new Error('Target page, context or browser has been closed');
    fn();
  })());
  return {
    state: s,
    fill: (field, value) => act(6, () => { if (field === 'Username') s.user = value; else s.pass = value; }),
    clickLogin: () => act(2, () => { s.loggedIn = s.user === 'standard_user' && s.pass === 'secret_sauce'; }),
    // a longer product name renders slower, so clicks running at the same time finish out of order
    clickAddToCart: (name) => act(Math.min(name.length, 20), () => {
      if (s.loggedIn && !brokenButtons) s.cart.push(name);
    }),
    clickCartLink: () => act(2, () => { s.onCartPage = true; }),
    waitForTimeout: (ms) => tick(Math.min(ms / 100, 20)),   // 2000 ms runs as 20 ms here
    badgeIsVisible: async () => s.cart.length > 0,          // a boolean right now: no retry, no assertion
  };
}

// web-first assertions: retry for a short while, then reject with a clear message
function retryExpect(page, check, message) {
  return handled((async () => {
    for (let i = 0; i < 15; i++) {
      if (page.state.closed) throw new Error('Target page, context or browser has been closed');
      if (check()) return;
      await tick(3);
    }
    throw new Error(message());
  })());
}
const badgeText = (page) => (page.state.cart.length ? String(page.state.cart.length) : '');
const cartNames = (page) => (page.state.onCartPage ? page.state.cart : []);
const expectBadge = (page, text) =>
  retryExpect(page, () => badgeText(page) === text,
    () => 'expect(cart badge).toHaveText("' + text + '") failed: received "' + badgeText(page) + '"');
const expectCartItems = (page, names) =>
  retryExpect(page, () => JSON.stringify(cartNames(page)) === JSON.stringify(names),
    () => 'expect(cart item names).toHaveText(' + JSON.stringify(names) + ') failed: received ' + JSON.stringify(cartNames(page)));

// Entry point the tests call: runs cartTest the way Playwright runs a test
async function runCartTest(names, brokenButtons) {
  const page = makeFakePage(brokenButtons);
  let result = 'passed';
  try {
    await cartTest(page, names);
  } catch (e) {
    result = 'failed: ' + e.message;
  }
  page.state.closed = true;   // Playwright closes the page as soon as the test function returns
  return { result, cart: [...page.state.cart] };
}`,
      },
      hints: [
        'Go line by line: which calls return a promise that nobody awaits?',
        'What does forEach do with the promises its async function returns? What line was hiding the missing waits?',
        'Is isVisible() an assertion? What does the test do if the badge is missing?',
      ],
      solution: {
        language: 'javascript',
        title: 'cart-test.js (fixed)',
        code: `async function cartTest(page, names) {
  await page.fill('Username', 'standard_user');
  await page.fill('Password', 'secret_sauce');
  await page.clickLogin();

  for (const name of names) {                       // sequential, awaited
    await page.clickAddToCart(name);
  }

  // web-first assertion instead of a fixed sleep
  await expectBadge(page, String(names.length));

  await page.clickCartLink();
  await expectCartItems(page, names);
}

// The real Playwright version:
// await page.getByPlaceholder('Username').fill('standard_user');
// await page.getByPlaceholder('Password').fill('secret_sauce');
// await page.getByRole('button', { name: 'Login' }).click();
// for (const name of names) {
//   const card = page.locator('[data-test="inventory-item"]').filter({ hasText: name });
//   await card.getByRole('button', { name: 'Add to cart' }).click();
// }
// await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText(String(names.length));
// await page.locator('[data-test="shopping-cart-link"]').click();
// await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(names);

// ---- lab harness: a tiny fake Playwright page (no need to change below) ----
const tick = (ms) => new Promise((r) => setTimeout(r, ms));
// a forgotten await must not crash the runner, so fake promises are marked as handled
const handled = (p) => { p.catch(() => {}); return p; };

function makeFakePage(brokenButtons) {
  const s = { closed: false, user: '', pass: '', loggedIn: false, cart: [], onCartPage: false };
  const act = (ms, fn) => handled((async () => {
    await tick(ms);
    if (s.closed) throw new Error('Target page, context or browser has been closed');
    fn();
  })());
  return {
    state: s,
    fill: (field, value) => act(6, () => { if (field === 'Username') s.user = value; else s.pass = value; }),
    clickLogin: () => act(2, () => { s.loggedIn = s.user === 'standard_user' && s.pass === 'secret_sauce'; }),
    // a longer product name renders slower, so clicks running at the same time finish out of order
    clickAddToCart: (name) => act(Math.min(name.length, 20), () => {
      if (s.loggedIn && !brokenButtons) s.cart.push(name);
    }),
    clickCartLink: () => act(2, () => { s.onCartPage = true; }),
    waitForTimeout: (ms) => tick(Math.min(ms / 100, 20)),   // 2000 ms runs as 20 ms here
    badgeIsVisible: async () => s.cart.length > 0,          // a boolean right now: no retry, no assertion
  };
}

// web-first assertions: retry for a short while, then reject with a clear message
function retryExpect(page, check, message) {
  return handled((async () => {
    for (let i = 0; i < 15; i++) {
      if (page.state.closed) throw new Error('Target page, context or browser has been closed');
      if (check()) return;
      await tick(3);
    }
    throw new Error(message());
  })());
}
const badgeText = (page) => (page.state.cart.length ? String(page.state.cart.length) : '');
const cartNames = (page) => (page.state.onCartPage ? page.state.cart : []);
const expectBadge = (page, text) =>
  retryExpect(page, () => badgeText(page) === text,
    () => 'expect(cart badge).toHaveText("' + text + '") failed: received "' + badgeText(page) + '"');
const expectCartItems = (page, names) =>
  retryExpect(page, () => JSON.stringify(cartNames(page)) === JSON.stringify(names),
    () => 'expect(cart item names).toHaveText(' + JSON.stringify(names) + ') failed: received ' + JSON.stringify(cartNames(page)));

// Entry point the tests call: runs cartTest the way Playwright runs a test
async function runCartTest(names, brokenButtons) {
  const page = makeFakePage(brokenButtons);
  let result = 'passed';
  try {
    await cartTest(page, names);
  } catch (e) {
    result = 'failed: ' + e.message;
  }
  page.state.closed = true;   // Playwright closes the page as soon as the test function returns
  return { result, cart: [...page.state.cart] };
}`,
      },
      explanation: `**Fixes:**

1. **\`fill\` without \`await\`** (twice): the login click could run before the fields were filled. Every action returns a promise, so await it.
2. **\`names.forEach(async ...)\`** started both clicks and returned at once. Nothing waited for them, and a failure became an unhandled rejection instead of a test failure. \`for...of\` with \`await\` does the clicks in order and passes errors up to the test.
3. **\`waitForTimeout(2000)\`** was hiding the missing waits: slow when things go well, flaky when they do not. It is replaced by a web-first assertion on the cart badge. That retries until the badge shows "2" (up to the 5 s expect timeout).
4. **Cart link click without \`await\`.**
5. **\`expect(locator).toHaveText(...)\` without \`await\`**: the last line of the test. The test function returned, Playwright closed the page, and the assertion never got to fail. That is the false pass. Web-first assertions must be awaited.
6. **\`isVisible()\` + \`console.log\` is not an assertion.** It returns true or false at once (no retry), and the test passes whether the badge exists or not. Use \`await expect(...).toHaveText('2')\` or \`toBeVisible()\`.

Turning on \`@typescript-eslint/no-floating-promises\` would have flagged findings 1, 4 and 5 automatically.

In the lab, the un-awaited fills make the login click run before the fields are filled. And \`forEach\` lets a slow click finish after a fast one, so the cart order no longer matches the click order.`,
      fnName: 'runCartTest',
      tests: [
        { args: [['Sauce Labs Backpack', 'Sauce Labs Bike Light'], false], expected: { result: 'passed', cart: ['Sauce Labs Backpack', 'Sauce Labs Bike Light'] } },
        { args: [['Sauce Labs Fleece Jacket', 'Sauce Labs Onesie'], false], expected: { result: 'passed', cart: ['Sauce Labs Fleece Jacket', 'Sauce Labs Onesie'] } },
        {
          args: [['Sauce Labs Backpack', 'Sauce Labs Bike Light'], true],
          expected: { result: 'failed: expect(cart badge).toHaveText("2") failed: received ""', cart: [] },
        },
        { args: [['Sauce Labs Onesie'], false], expected: { result: 'passed', cart: ['Sauce Labs Onesie'] } },
        { args: [['Sauce Labs Bolt T-Shirt', 'Sauce Labs Onesie', 'Sauce Labs Backpack'], false], expected: { result: 'passed', cart: ['Sauce Labs Bolt T-Shirt', 'Sauce Labs Onesie', 'Sauce Labs Backpack'] } },
        {
          args: [['Sauce Labs Fleece Jacket'], true],
          expected: { result: 'failed: expect(cart badge).toHaveText("1") failed: received ""', cart: [] },
          hidden: true,
        },
      ],
      followUps: [
        {
          q: 'Why did CI show "Target page, context or browser has been closed" on random lines?',
          a: 'Un-awaited actions were still running when the test function finished. Playwright then closed the browser context, and whichever action was still running failed with that message. Which one depended on timing, so the line changed between runs. Once every action is awaited, the test cannot finish while work is still running.',
        },
        {
          q: 'Could you add both items in parallel with Promise.all?',
          a: 'Yes, but a real user does not click two things at once, and the page redraws between clicks (each button changes to "Remove"). The clicks would race with that redraw. One-by-one for...of is clearer and shows exactly where a failure happens. Use Promise.all for independent API setup calls instead.',
        },
      ],
    },
    {
      id: 'js-async-cc-2',
      title: 'Slow, fragile test-data seeding',
      context:
        'A global-setup script creates 20 bookings on Restful Booker before the tests run. It takes far too long. It sometimes crashes Node with an unhandled rejection. And when one booking fails, nobody knows which one.',
      task: 'Make `seed(count)` faster without overloading the server (at most 5 requests at a time). Report every failure clearly, and remove the bad async patterns. The lab replaces `fetch` with a fake server (3 ms per request, no network). The tests call `async runSeed(count, failing)`. The server answers HTTP 500 for the booking indexes in `failing`. The result is `{ ids }` (booking ids 1000 + i, in order) or `{ error }` (`\'N bookings failed:\'` and then one `Booking i failed: HTTP 500` line per failure). It also has `requests` (POSTs made by the time `seed` finished) and `maxInFlight` (the most requests running at the same time). Press Run to check your fix.',
      starter: {
        language: 'javascript',
        title: 'seed.js',
        code: `const BASE = 'https://restful-booker.herokuapp.com';

function createBooking(i) {
  return new Promise(async (resolve) => {            // async executor
    const res = await fetch(BASE + '/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstname: 'User' + i, lastname: 'Seed', totalprice: 100,
        depositpaid: true, bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' } }),
    });
    resolve((await res.json()).bookingid);           // never rejects
  });
}

async function seed(count = 20) {
  const ids = [];
  for (let i = 0; i < count; i++) {
    ids.push(await createBooking(i));                // 20 sequential calls
  }
  createBooking(99).then((id) => ids.push(id));      // floating promise
  return ids;
}

// seed().then((ids) => console.log('created', ids.length));   // no error handling

// ---- lab harness: a fake fetch and server (no need to change below) ----
let server; // reset for every test by runSeed
async function fetch(url, options) {               // shadows the real fetch: no network in the lab
  const i = Number(JSON.parse(options.body).firstname.slice(4));
  server.requests += 1;
  server.inFlight += 1;
  server.maxInFlight = Math.max(server.maxInFlight, server.inFlight);
  await new Promise((r) => setTimeout(r, 3));
  server.inFlight -= 1;
  const ok = !server.failing.includes(i);
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => (ok ? { bookingid: 1000 + i } : { error: 'Internal Server Error' }),
  };
}

// Entry point the tests call: seeds count bookings; the server answers 500 for the indexes in failing
async function runSeed(count, failing) {
  server = { requests: 0, inFlight: 0, maxInFlight: 0, failing };
  let outcome;
  try {
    outcome = { ids: [...(await seed(count))] };
  } catch (e) {
    outcome = { error: e.message };
  }
  return { ...outcome, requests: server.requests, maxInFlight: server.maxInFlight };
}`,
      },
      hints: [
        'What happens to an error thrown inside an async function passed to new Promise(...)? Do you need new Promise at all?',
        'Do the 20 bookings depend on each other? How could you run them in groups?',
        'Which Promise method reports every success and failure, without stopping at the first?',
      ],
      solution: {
        language: 'javascript',
        title: 'seed.js (fixed)',
        code: `const BASE = 'https://restful-booker.herokuapp.com';

async function createBooking(i) {                    // async function already returns a promise
  const res = await fetch(BASE + '/booking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ firstname: 'User' + i, lastname: 'Seed', totalprice: 100,
      depositpaid: true, bookingdates: { checkin: '2026-11-01', checkout: '2026-11-03' } }),
  });
  if (!res.ok) throw new Error('Booking ' + i + ' failed: HTTP ' + res.status);
  return (await res.json()).bookingid;
}

async function seed(count = 20, concurrency = 5) {
  const indexes = Array.from({ length: count }, (_, i) => i);
  const results = [];
  for (let start = 0; start < count; start += concurrency) {
    const batch = indexes.slice(start, start + concurrency);
    results.push(...(await Promise.allSettled(batch.map(createBooking))));
  }
  const ids = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const errors = results.filter((r) => r.status === 'rejected').map((r) => r.reason.message);
  if (errors.length) throw new Error(errors.length + ' bookings failed:\\n' + errors.join('\\n'));
  return ids;
}

// In the global-setup module (top-level await):
// try {
//   const ids = await seed();
//   console.log('created', ids.length);
// } catch (e) {
//   console.error(e.message);
//   process.exitCode = 1;                           // fail the CI step clearly
// }

// ---- lab harness: a fake fetch and server (no need to change below) ----
let server; // reset for every test by runSeed
async function fetch(url, options) {               // shadows the real fetch: no network in the lab
  const i = Number(JSON.parse(options.body).firstname.slice(4));
  server.requests += 1;
  server.inFlight += 1;
  server.maxInFlight = Math.max(server.maxInFlight, server.inFlight);
  await new Promise((r) => setTimeout(r, 3));
  server.inFlight -= 1;
  const ok = !server.failing.includes(i);
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => (ok ? { bookingid: 1000 + i } : { error: 'Internal Server Error' }),
  };
}

// Entry point the tests call: seeds count bookings; the server answers 500 for the indexes in failing
async function runSeed(count, failing) {
  server = { requests: 0, inFlight: 0, maxInFlight: 0, failing };
  let outcome;
  try {
    outcome = { ids: [...(await seed(count))] };
  } catch (e) {
    outcome = { error: e.message };
  }
  return { ...outcome, requests: server.requests, maxInFlight: server.maxInFlight };
}`,
      },
      explanation: `**Fixes:**

1. **The \`new Promise(async (resolve) => ...)\` pattern is a bug.** If \`fetch\` or \`res.json()\` throws inside that async function, the error goes to a promise nobody watches. The outer promise never finishes, and the script hangs or crashes with an unhandled rejection. An \`async function\` already returns a promise and passes errors on.
2. **It never failed on HTTP errors.** \`fetch\` only rejects when the network fails; a 500 or 418 resolves normally. Check \`res.ok\` and throw a clear error.
3. **20 awaits one after another** = 20 × the request time. The bookings do not depend on each other, so run them in groups of 5 with \`Promise.all\` or \`allSettled\`. That is about 4 request times instead of 20, without flooding a shared demo server.
4. **\`Promise.allSettled\`** collects every result. So one failure does not hide the others, and the error lists exactly which bookings failed. (Use \`Promise.all\` instead if you want to stop at the first failure.)
5. **The floating \`createBooking(99).then(...)\`** was not awaited. \`seed\` returned before it finished, so the count was wrong, and its failure would be unhandled. It is removed (or it must be awaited, or added to a group).
6. **The top-level call had no error handling.** Top-level \`await\` in a module plus \`try/catch\` sets a non-zero exit code, so CI fails where everyone can see it.`,
      fnName: 'runSeed',
      tests: [
        { args: [20, []], expected: { ids: [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019], requests: 20, maxInFlight: 5 } },
        { args: [3, []], expected: { ids: [1000, 1001, 1002], requests: 3, maxInFlight: 3 } },
        { args: [10, [4]], expected: { error: '1 bookings failed:\nBooking 4 failed: HTTP 500', requests: 10, maxInFlight: 5 } },
        {
          args: [6, [0, 5]],
          expected: { error: '2 bookings failed:\nBooking 0 failed: HTTP 500\nBooking 5 failed: HTTP 500', requests: 6, maxInFlight: 5 },
        },
        { args: [1, []], expected: { ids: [1000], requests: 1, maxInFlight: 1 } },
        { args: [12, [11]], expected: { error: '1 bookings failed:\nBooking 11 failed: HTTP 500', requests: 12, maxInFlight: 5 }, hidden: true },
        { args: [0, []], expected: { ids: [], requests: 0, maxInFlight: 0 }, hidden: true },
      ],
      followUps: [
        {
          q: 'Why not just Promise.all all 20 at once?',
          a: 'It would be fastest. But 20 POSTs at the same moment can hit rate limits or overload a shared test server. That causes failures that have nothing to do with the code you are testing. Groups (or a small limit on requests at once) give most of the speed with a safe load. On your own private server, a higher limit is fine.',
        },
        {
          q: 'How would you add a retry for transient 503 errors?',
          a: 'Wrap createBooking in a retry helper. Loop up to N attempts and return on success. On failure, await a growing wait (for example 200 ms, 400 ms, 800 ms) before trying again. When attempts run out, throw the last error with { cause }. Only retry temporary errors (503, network resets), never 400-level validation errors.',
        },
      ],
    },
  ],
  interviewQuestions: [
    {
      id: 'js-async-iq-01',
      difficulty: 'medium',
      question: 'Explain the JavaScript event loop. What is the difference between microtasks and macrotasks? What does this print: `console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);`',
      whatInterviewerLooksFor: [
        'One thread, the call stack and the waiting lines (queues), explained simply',
        'Correct order: normal code → all microtasks → one macrotask',
        'Examples of each (then, await, queueMicrotask vs setTimeout, network, events)',
        'Correct answer 1 4 3 2, with reasons, not just memory',
      ],
      modelAnswer: `**Simple picture:** JavaScript runs one thing at a time. The code running right now sits on the **call stack**. Slow work (timers, network, browser commands) is handed to the environment. When that work is done, its callback waits in a line (a **queue**). The **event loop** picks what runs next whenever the current code has finished.

**Two waiting lines, with different priority:**

| | Microtasks (run after the current code finishes) | Macrotasks (run after a timer or event) |
|---|---|---|
| Examples | \`.then/.catch/.finally\`, code after \`await\`, \`queueMicrotask\` | \`setTimeout\`, \`setInterval\`, I/O, UI events, \`setImmediate\` (Node) |
| When they run | right after the current code, **all of them**, even new ones added meanwhile | **one** per round of the loop |

**The loop:** run the current code until it ends → run all microtasks → (the browser may redraw the page) → take one macrotask → run all microtasks → repeat.

**The snippet:**

1. \`console.log(1)\` runs now → **1**.
2. \`setTimeout\` → its callback waits for the timer (macrotask).
3. \`Promise.resolve().then\` → its callback waits for the current code to finish (microtask).
4. \`console.log(4)\` → **4**.
5. The script is done → run the microtasks → **3**.
6. Next macrotask → **2**.

**Answer: 1, 4, 3, 2.**

**Why a QA engineer should care:** it explains why \`setTimeout(fn, 0)\` is not "now". It explains why code after an un-awaited call runs first, and why a test can end before a forgotten promise does. It also helps me read Playwright traces: my test code and the browser are separate, and every \`await\` is a point where other waiting work can run.`,
      followUps: [
        {
          q: 'Where does the code after an await go?',
          a: 'When an async function reaches await, it gives control back to the caller. Once the awaited promise is done, the rest of the function becomes a microtask: it runs after the current code finishes. So it runs after the remaining normal code, but before any setTimeout callback that is already waiting.',
        },
        {
          q: 'Can microtasks starve the page?',
          a: 'Yes. The loop runs every microtask before it redraws the page or runs a timer. So a microtask that keeps adding another microtask (for example, a promise chain that calls itself) blocks timers, clicks and page updates, just like an endless loop. Repeating with setTimeout does not, because each round waits in the timer line.',
        },
        {
          q: 'Is setTimeout(fn, 0) really 0 ms?',
          a: 'No. It means "not earlier than 0 ms". The callback still waits for the current code, all microtasks, and any timers added earlier. Browsers also make timers inside timers wait at least about 4 ms after a few levels. That is why small fixed timeouts are never a reliable way to wait in tests.',
        },
      ],
      pitfalls: [
        'Saying setTimeout 0 runs before promises "because 0 means now".',
        'Saying JavaScript does many things at once because the browser works in parallel.',
        'Saying the order without explaining the waiting lines.',
      ],
    },
    {
      id: 'js-async-iq-02',
      difficulty: 'easy',
      question: 'What is a Promise? Compare .then chains with async/await and show how errors are handled in each.',
      whatInterviewerLooksFor: [
        'Names pending, fulfilled and rejected, and says a promise settles only once',
        'Knows then returns a new promise (return passes a value on, throw rejects)',
        'Writes the same logic with async/await and try/catch/finally',
        'Mentions that async functions return promises',
      ],
      modelAnswer: `**A promise is an object for a value that will arrive later**, like a parcel tracking number. It starts **pending**. It settles exactly once: **fulfilled** with a value, or **rejected** with an error.

**.then style:**

    getToken()
      .then((token) => createBooking(token))   // return → next step waits for it
      .then((booking) => console.log(booking.id))
      .catch((err) => console.error('setup failed', err))
      .finally(() => console.log('done'));

Each \`.then\` returns a **new** promise. Returning a value passes it on. Returning a promise makes the chain wait for it. Throwing (or a rejected promise) jumps to the next \`.catch\`. Forgetting \`return\` is the classic bug: the next step gets \`undefined\` and does not wait.

**async/await style (same logic):**

    async function setup() {
      try {
        const token = await getToken();
        const booking = await createBooking(token);
        console.log(booking.id);
      } catch (err) {
        console.error('setup failed', err);
      } finally {
        console.log('done');
      }
    }

\`await\` gives you the value, or throws the error at that line. So a normal \`try/catch/finally\` works. An \`async\` function itself always returns a promise.

**Which I use:** async/await for test code. It reads top to bottom like test steps, and Playwright uses it. I still use promise methods like \`Promise.all\`, and a short \`.then\` or \`.catch\` when it is clearer, e.g. \`const data = await res.json().catch(() => null)\`.`,
      followUps: [
        {
          q: 'What happens if you never handle a rejected promise?',
          a: 'It becomes an unhandled rejection. Node (15+) treats it like an uncaught error and stops the process. Browsers log it in the console. In a Playwright run it can fail the current test, a different test, or the whole worker, so the real cause is hard to find. Always await promises, or add .catch.',
        },
        {
          q: 'Is .then(success, failure) the same as .then(success).catch(failure)?',
          a: 'Not quite. With .then(success, failure), an error thrown inside success is NOT caught by failure, because both belong to the same promise. With .then(success).catch(failure), the catch belongs to the new promise that then returns. So it catches errors from the first promise and from success. The second form is usually what you want.',
        },
      ],
      pitfalls: [
        'Thinking a promise can be resolved multiple times.',
        'Forgetting return inside .then.',
        'Thinking await stops the whole program.',
      ],
    },
    {
      id: 'js-async-iq-03',
      difficulty: 'medium',
      question: 'Compare Promise.all, Promise.allSettled, Promise.race and Promise.any. Give a test-automation use case for each.',
      whatInterviewerLooksFor: [
        'Correct rules for when each one succeeds or fails, and what it returns',
        'all keeps input order and fails at the first error',
        'any fails with an AggregateError; race also finishes on a failure',
        'Practical, specific QA use cases',
      ],
      modelAnswer: `| | Resolves | Rejects | Result |
|---|---|---|---|
| **all** | every promise succeeds | at the first failure | values in input order |
| **allSettled** | every promise is done | never | \`{status, value}\` / \`{status, reason}\` for each |
| **race** | the first to finish succeeded | the first to finish failed | that one result |
| **any** | the first one succeeds | only if all fail | first value; \`AggregateError\` with \`.errors\` |

**Use cases:**

- **all:** parallel API setup before a UI test, e.g. create three products and a user, then use all the IDs: \`const [p1, p2, user] = await Promise.all([...])\`. Also the Playwright idiom \`await Promise.all([page.waitForResponse(...), button.click()])\`. If any setup call fails, there is no point going on, so stopping at the first error is right.
- **allSettled:** a smoke "health check" of several services, or cleanup of many records, where I want a report of **every** failure rather than stopping at the first.
- **race:** wrapping a promise with my own timeout in a Node script: \`Promise.race([task, timeoutReject(10_000)])\`. Remember: race also finishes on a fast **failure**.
- **any:** use the first environment or mirror that responds successfully (e.g. a test-data service with a fallback). It only fails if all fail.

**Details:** \`all\` does not stop the other promises after a failure; they keep running. \`Promise.all([])\` gives \`[]\` at once, while \`Promise.any([])\` fails. Plain values count as already done.

**In Playwright tests** I mostly use \`all\` for response or popup waits and API setup. UI actions on one page stay one after another.`,
      followUps: [
        {
          q: 'Promise.all rejected because one request failed. Do the other requests stop?',
          a: 'No. You cannot cancel a promise by default, so the other requests keep running and may still create data on the server. That matters for cleanup: you might leave test data behind. Use allSettled to learn about every result, or use AbortController with fetch if you really need to cancel.',
        },
        {
          q: 'How would you implement a simple Promise.all yourself?',
          a: 'Return a new Promise, with a results array and a counter. For each input (wrapped in Promise.resolve): on success, store the value at its index and add 1 to the counter; when the counter equals the length, resolve. On failure, call reject at once. For an empty array, resolve [] straight away. Storing by index is what keeps the input order.',
        },
      ],
      pitfalls: [
        'Saying all returns results in the order they finished.',
        'Confusing race and any.',
        'Thinking allSettled can reject.',
      ],
    },
    {
      id: 'js-async-iq-04',
      difficulty: 'medium',
      question: 'Why does this not wait: `ids.forEach(async (id) => { await deleteBooking(id); }); console.log(\'cleanup done\');`? Fix it two ways.',
      context: 'A widely discussed JavaScript pitfall that shows up in QA automation code reviews and interviews.',
      whatInterviewerLooksFor: [
        'Explains that forEach ignores the promises it gets back',
        'One-after-another fix with for...of + await',
        'All-at-once fix with Promise.all + map',
        'Discusses error handling and which fix suits which situation',
      ],
      modelAnswer: `**Why:** \`forEach\` calls the function for each item and **ignores what it returns**. An async function returns a promise. So \`forEach\` starts every deletion, throws all the promises away, and returns at once. "cleanup done" is logged while the deletions are still running. If one fails, the error is an **unhandled rejection** that nobody waited for.

**Fix 1: one after another, with for...of**

    for (const id of ids) {
      await deleteBooking(id);
    }
    console.log('cleanup done');

Each deletion finishes before the next starts. The first failure throws and stops the loop. Time = the sum of all calls. Use it when order matters, when the server has a rate limit, or when each step needs the one before.

**Fix 2: all at once, with Promise.all**

    await Promise.all(ids.map((id) => deleteBooking(id)));
    console.log('cleanup done');

All deletions run at the same time, and we wait for all of them. Time ≈ the slowest call. The first failure makes \`Promise.all\` fail (the others keep running).

**For cleanup specifically** I'd often use \`Promise.allSettled\`, so one failed delete does not hide the others, and then report the failures:

    const results = await Promise.allSettled(ids.map(deleteBooking));
    const failed = results.filter((r) => r.status === 'rejected');

**Same trap elsewhere:** \`map\` with an async function returns an array of promises, so you need \`Promise.all\`. \`filter\`, \`some\` and \`find\` with async functions treat every promise as true. In Playwright, loop over locators with \`for (const row of await rows.all()) { await ... }\`.`,
      followUps: [
        {
          q: 'What about for await...of? Is it the same as for...of with await?',
          a: 'for await...of is made for async streams of data, and it also awaits each item of an array of promises. With ids.map(deleteBooking), all the deletions already started at once; for await...of only reads the results in order. So the work runs in parallel. For clear code, use for...of + await or Promise.all, and keep for await...of for real async streams.',
        },
        {
          q: 'How would you limit concurrency to 5 at a time?',
          a: 'Work in groups of 5: for (let i = 0; i < ids.length; i += 5) await Promise.all(ids.slice(i, i + 5).map(deleteBooking)). Inside a group the calls run together; the groups run one after another. Libraries like p-limit always keep exactly five running, which is a bit faster when calls take different times.',
        },
      ],
      pitfalls: [
        'Adding await before forEach (forEach returns undefined, so it waits for nothing).',
        'Using Promise.all for UI clicks on one page.',
        'Forgetting error handling in the all-at-once version.',
      ],
    },
    {
      id: 'js-async-iq-05',
      difficulty: 'hard',
      question: 'A Playwright test passes but a teammate shows that the feature is broken. You find `expect(page.getByText(\'Order placed\')).toBeVisible();` without await on the last line. Explain exactly why it passed and how you would prevent this across the suite.',
      whatInterviewerLooksFor: [
        'Knows web-first assertions return promises and retry',
        'Explains that the test function ends before the assertion is done',
        'Prevention: lint rule, TypeScript, code review, verifying tests can fail',
        'Knows expect on plain values needs no await, but expect on locators does',
      ],
      modelAnswer: `**Why it passed:** \`expect(locator).toBeVisible()\` is a **web-first assertion**. It returns a promise and keeps retrying until the element is visible, or until the timeout (5 s by default) runs out. Without \`await\`, the test function reaches its end at once and returns. Playwright thinks the test is done and closes the page. The unfinished assertion never gets to fail the test in time. Result: **green test, broken feature**. In the middle of a test, the same mistake lets later steps run too early, which causes flaky tests instead.

**Which expects need await:**

| Needs \`await\` | No \`await\` |
|---|---|
| \`expect(locator).toBeVisible()\`, \`toHaveText\`, \`toHaveCount\` | \`expect(value).toBe(...)\`, \`toEqual\` on plain values |
| \`expect(page).toHaveURL()\`, \`toHaveTitle()\` | |
| \`expect.poll(...)\`, \`expect(...).toPass()\` | |

**Prevention across the suite:**

1. **Lint:** \`@typescript-eslint/no-floating-promises\` (recommended in Playwright's best-practices docs) flags any promise that is not awaited. \`eslint-plugin-playwright\` has \`missing-playwright-await\`, made for expects. Run lint in CI and block merges that fail it.
2. **TypeScript** with type-aware linting, so the rule knows which calls return promises.
3. **Prove tests can fail:** for each new test, break the check once (use a wrong expected text) and make sure it goes red. A test that cannot fail is worse than no test.
4. **Code review checklist:** every action and web-first assertion has \`await\`; \`isVisible()\` is never used as an assertion.
5. Newer Playwright versions may warn about some un-awaited calls, but the linter is the reliable guard.`,
      followUps: [
        {
          q: 'Why is isVisible() a similar trap even when awaited?',
          a: 'await locator.isVisible() returns true or false at once, without retrying, so it shows the page at one moment only. Inside an if, the test quietly takes a different path. Inside expect(await x.isVisible()).toBe(true), it fails on slow pages. await expect(locator).toBeVisible() retries until the timeout, which is the correct assertion.',
        },
        {
          q: 'How do you find all existing missing awaits in a large legacy suite?',
          a: 'Turn on the no-floating-promises rule (it needs parserOptions pointing at the TypeScript project, for type information). Run eslint on the tests folder and fix the lines it reports; many editors then show problems as you type. As a quick first pass, also search for "expect(page" and "expect(locator" lines that do not start with await.',
        },
      ],
      pitfalls: [
        'Saying "Playwright auto-waits, so await is optional".',
        'Adding waitForTimeout as a fix.',
        'Not realising the test could not fail before the fix.',
      ],
    },
    {
      id: 'js-async-iq-06',
      difficulty: 'hard',
      question: 'You need to assert on the API response that a button click triggers. Why does `await button.click(); const res = await page.waitForResponse(\'**/api/cart\');` time out sometimes, and how do you fix it?',
      whatInterviewerLooksFor: [
        'Timing problem: the response can arrive before the wait starts listening',
        'Start the wait first, then click, then await the wait',
        'Promise.all alternative and why it works',
        'Matches the request precisely and checks the status and body',
      ],
      modelAnswer: `**The timing problem:** \`waitForResponse\` only sees responses that arrive **after** it starts listening. In the broken version, the click is awaited first. By the time the click is done, a fast API may have already answered. The wait then looks for a response that has already gone by, and times out (the 30 s test timeout, or a timeout you set). It passes on a slow server and fails on a fast one: classic flakiness.

**Fix 1 (the pattern in the Playwright docs): create the promise first, await it later.**

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/cart') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Add to cart' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ items: 1 });

Calling \`waitForResponse\` without \`await\` starts listening at once and gives back a promise. The click then sends the request. Finally we await the promise that was already listening.

**Fix 2: Promise.all.**

    const [response] = await Promise.all([
      page.waitForResponse('**/api/cart'),
      page.getByRole('button', { name: 'Add to cart' }).click(),
    ]);

Both start at the same moment, so the wait is listening before the request can finish.

**Good habits:** match precisely (URL **and** method, maybe \`r.ok()\`), so another request does not end the wait. Check the response **and** the result on the page, because users see the page. The same pattern works for \`waitForEvent('popup')\`, \`waitForEvent('download')\` and \`waitForURL\`.`,
      followUps: [
        {
          q: 'When would you mock the response instead of waiting for it?',
          a: 'When the test is about how the page behaves, not about the server: error states (500, timeouts), empty lists or very large data. page.route can answer the request with fixed JSON, so the test is fast and gives the same result every time. Keep a smaller set of end-to-end tests that call the real API.',
        },
        {
          q: 'Is the first fix safe if the click throws?',
          a: 'If the click fails, the test fails at the click line. The unfinished responsePromise is left behind, and Playwright cleans it up when the page closes, so it does not hide the failure. Promise.all handles both promises together, which some teams prefer. Either pattern is fine; the key is that listening starts before the action.',
        },
      ],
      pitfalls: [
        'Adding waitForTimeout before waitForResponse.',
        'Using a URL pattern that also matches other requests.',
        'Checking only the network response, never the page.',
      ],
    },
    {
      id: 'js-async-iq-07',
      difficulty: 'hard',
      question: 'Write an async helper that retries an operation, waiting longer after each failure (exponential backoff). When would you use it in test code, and when would you use Playwright\'s built-in retrying instead?',
      whatInterviewerLooksFor: [
        'A correct loop with await, try/catch and a growing wait',
        'Throws the last error, with context, after the final attempt',
        'Retries only temporary errors',
        'Knows expect.poll, toPass and web-first assertions already handle UI waiting',
      ],
      modelAnswer: `**The utility:**

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function retry(fn, { attempts = 3, baseMs = 200, isRetryable = () => true } = {}) {
      let lastError;
      for (let i = 1; i <= attempts; i++) {
        try {
          return await fn(i);                       // return await so catch sees rejections
        } catch (err) {
          lastError = err;
          if (i === attempts || !isRetryable(err)) break;
          await sleep(baseMs * 2 ** (i - 1));       // 200, 400, 800 ms...
        }
      }
      throw new Error('Failed after ' + attempts + ' attempts', { cause: lastError });
    }

    const booking = await retry(() => createBooking(data), {
      isRetryable: (e) => e.status === 503 || e.code === 'ECONNRESET',
    });

Points to say out loud: use \`return await\` inside \`try\` (otherwise errors skip the catch). The wait doubles each time. Only **temporary** errors are retried; a 400 validation error will fail every time. The final error keeps the original one as \`cause\`. Real-world versions add **jitter** (a small random extra wait), so many clients do not all retry at the same moment.

**When I use it:** API setup and cleanup against a shaky shared test server, global setup scripts, and checking a background job outside the browser.

**When I use Playwright instead:**

- Waiting for UI state: web-first assertions already retry (\`await expect(locator).toHaveText(...)\`).
- Polling a value: \`await expect.poll(async () => (await request.get(url)).status(), { timeout: 30_000 }).toBe(200)\`.
- Retrying a block of steps until it passes: \`await expect(async () => { ... }).toPass({ timeout: 15_000 })\`.
- Re-running a whole flaky test: the \`retries\` config. It also marks the test "flaky", so problems stay visible.

**Warning:** retries can hide real bugs. If an operation needs retries often, log it and tell the team. Do not quietly retry forever.`,
      followUps: [
        {
          q: 'Why add jitter to the backoff?',
          a: 'If many test workers fail at the same moment (say the service restarts), plain backoff makes them all retry at exactly 200, 400 and 800 ms. They hit the recovering service in waves, all together. A random extra wait, for example sleep(random(0, base * 2^i)), spreads the retries out. In a small suite it matters less, but mentioning it shows you understand the idea.',
        },
        {
          q: 'How is test.retries different from your retry helper?',
          a: 'test.retries runs the whole test again from the start, in a fresh browser context. If a retry passes, it marks the test as flaky, so the problem stays visible in reports. A retry helper repeats one operation inside one test run and hides the temporary failure. Use the helper for calls you know are sometimes shaky, and config retries as a CI safety net, not as a fix.',
        },
      ],
      pitfalls: [
        'Retrying every error, even 4xx validation errors.',
        'Using return without await inside try.',
        'Wrapping UI assertions in a custom retry loop with sleeps.',
      ],
    },
    {
      id: 'js-async-iq-08',
      difficulty: 'expert',
      question: 'Predict the output and explain each step: an async function a1 logs "a1 start", awaits a2 (which logs "a2"), then logs "a1 end". The script logs "script start", schedules setTimeout("timeout"), calls a1(), creates a new Promise whose executor logs "executor" and resolves, attaches .then("then"), and logs "script end".',
      whatInterviewerLooksFor: [
        'Knows an async function body runs now, up to its first await',
        'Knows the function inside new Promise(...) runs now',
        'Runs microtasks in the order they were added',
        'Places the timer last and explains why',
      ],
      modelAnswer: `**Answer:** script start, a1 start, a2, executor, script end, a1 end, then, timeout.

**Trace (Output | After current code = microtasks | After a timer = macrotasks):**

| Step | Output | Micro queue | Macro queue |
|---|---|---|---|
| log "script start" | script start | | |
| setTimeout | | | timeout |
| call a1(): logs "a1 start" | a1 start | | timeout |
| a1 calls a2(): logs "a2", a2's promise is already fulfilled | a2 | | timeout |
| a1 hits \`await\` → rest of a1 queued | | a1 end | timeout |
| new Promise: executor runs now | executor | a1 end | timeout |
| resolve() + .then → handler queued | | a1 end, then | timeout |
| log "script end" | script end | a1 end, then | timeout |
| script done → run all micro | a1 end, then | | timeout |
| next macrotask | timeout | | |

**Key ideas:**

1. Calling an async function runs its body **now, up to the first await**. So "a1 start" and "a2" print before the rest of the script.
2. \`await\` pauses a1. The rest of a1 becomes a microtask once the awaited promise is fulfilled (a2's promise already is).
3. The function inside \`new Promise\` **runs now**. Only \`.then\` waits.
4. Microtasks run in the order they were added: "a1 end" was added before "then".
5. The timer is a macrotask, so it runs after all microtasks, even with a 0 ms delay.

**Why this matters in test code:** when a test calls an async helper without await, the first part of the helper runs now. The rest runs later, after the test has moved on. That is exactly how a forgotten-await bug looks.`,
      followUps: [
        {
          q: 'What if a2 itself awaited something before logging?',
          a: 'Suppose a2 is async () => { await null; console.log("a2"); }. Calling a2 now adds the rest of a2 as a microtask first. a1 then waits for a2\'s unfinished promise. "executor" and "script end" print. Then the microtasks run: "a2" prints, which finishes a2\'s promise and adds "a1 end" behind "then". So the output becomes script start, a1 start, executor, script end, a2, then, a1 end, timeout.',
        },
        {
          q: 'Would the output change in Node vs the browser?',
          a: 'Not for this snippet. Both run all promise jobs (microtasks) before the next timer (macrotask). Differences appear only with Node-only functions: process.nextTick runs even before promise jobs, and the order of setImmediate vs setTimeout(0) in the main file can vary. Browser and Node agree on the then/await/setTimeout rules used here.',
        },
      ],
      pitfalls: [
        'Putting "a1 start" after "script end".',
        'Thinking the function inside new Promise(...) runs later.',
        'Putting "timeout" before the microtasks.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-async-drill-1',
      question:
        'Predict the output line by line: `console.log(\'A\'); setTimeout(() => console.log(\'B\'), 0); Promise.resolve().then(() => console.log(\'C\')); queueMicrotask(() => console.log(\'D\')); console.log(\'E\');`',
      assumptions: [
        'Normal code runs first, top to bottom.',
        '.then and queueMicrotask callbacks run after the current code finishes (microtasks), in the order they were added.',
        'setTimeout callbacks run after a timer (macrotasks), only after all microtasks.',
      ],
      steps: [
        { label: 'Line 1', calc: 'runs now → output: A' },
        { label: 'Line 2', calc: 'setTimeout → After a timer: [B]' },
        { label: 'Line 3', calc: 'then on a finished promise → After current code: [C]' },
        { label: 'Line 4', calc: 'queueMicrotask → After current code: [C, D]' },
        { label: 'Line 5', calc: 'runs now → output: A E' },
        { label: 'Run all microtasks', calc: 'output: A E C D' },
        { label: 'Next timer (macrotask)', calc: 'output: A E C D B' },
      ],
      answer: '`A`, `E`, `C`, `D`, `B`',
      insight: 'Three columns (output, after current code, after a timer) solve every ordering puzzle. Microtasks run in the order they were added, and the 0 ms timer still waits for all of them.',
      followUps: [
        {
          q: 'What if the then callback itself scheduled setTimeout(() => console.log("F"), 0)?',
          a: 'When C runs, it adds F to the timer line, behind B. After D, the loop takes B, runs any microtasks (none), then takes F. Output: A E C D B F. A timer added later goes to the back of the line, even with the same 0 ms delay.',
        },
      ],
    },
    {
      id: 'js-async-drill-2',
      question:
        'A timer callback schedules its own microtask. Trace the order of five labels: two zero-delay timers are registered (the first logs t1 and queues a promise reaction that logs m-in-t1; the second logs t2), then a resolved-promise reaction logs m1 and registers a third zero-delay timer that logs t3.',
      assumptions: [
        'After every timer job (macrotask), all microtasks run before the next timer job.',
        'Timers with the same delay run in the order they were added.',
      ],
      steps: [
        { label: 'Script', calc: 'After a timer: [t1, t2]; After current code: [m1]; nothing prints yet' },
        { label: 'Run micro', calc: 'm1 runs → output m1; adds t3 → After a timer: [t1, t2, t3]' },
        { label: 'Timer t1', calc: 'output t1; adds m-in-t1 → After current code: [m-in-t1]' },
        { label: 'Run micro', calc: 'output m-in-t1 (before t2!)' },
        { label: 'Timer t2', calc: 'output t2' },
        { label: 'Timer t3', calc: 'output t3' },
      ],
      answer: '`m1`, `t1`, `m-in-t1`, `t2`, `t3`',
      insight: 'A microtask added inside a timer callback runs right after that timer, before the next timer. "One timer job, then all microtasks" is the whole rule.',
      followUps: [
        {
          q: 'Which would print first if t2 were scheduled with 10 ms and t3 with 0 ms from inside m1?',
          a: 'm1, t1, m-in-t1, then t3 (0 ms, ready almost at once), then t2 once its 10 ms have passed: m1, t1, m-in-t1, t3, t2. Timers run when their time is up, so a timer added later with a shorter delay can overtake one with a longer delay.',
        },
      ],
    },
    {
      id: 'js-async-drill-3',
      question:
        'Estimate the real time it takes. A setup script creates 12 users via an API that takes 250 ms per call, then logs in as each user (150 ms per call, needs that user\'s ID). Compare (a) fully sequential, (b) `Promise.all` for all creates, then `Promise.all` for all logins, (c) the same as (b) but in chunks of 4.',
      assumptions: [
        'Each call takes a fixed time, and the server handles calls at the same time without slowing down.',
        'Logins for a user can only start after that user exists.',
        'Ignore the tiny time JavaScript itself takes (a few milliseconds).',
      ],
      steps: [
        { label: '(a) one after another', calc: '12 × 250 + 12 × 150 = 3000 + 1800 = 4800 ms' },
        { label: '(b) all at once, in two phases', calc: 'creates ≈ 250 ms (slowest of 12) + logins ≈ 150 ms = 400 ms' },
        { label: '(c) chunks of 4', calc: '12 / 4 = 3 chunks; creates 3 × 250 = 750 ms, logins 3 × 150 = 450 ms → 1200 ms' },
        { label: 'Better (c)', calc: 'per group, create then log in those 4 users: 3 × (250 + 150) = 1200 ms (same total, but the first users are ready sooner)' },
      ],
      answer: '(a) ~4.8 s, (b) ~0.4 s, (c) ~1.2 s. Running calls at the same time is 12× faster here. Groups of 4 give up some speed, but never send more than 4 requests at once.',
      insight: 'One-after-another time is the SUM of the calls; Promise.all time is the SLOWEST call. Real servers slow down under load, so the real (b) number is higher than 400 ms. Small groups keep the shared test server healthy and your results stable.',
      followUps: [
        {
          q: 'How would the numbers change if the server could only process 2 requests at a time?',
          a: 'Requests beyond 2 wait in line on the server, so (b) acts like groups of 2: creates 6 × 250 = 1500 ms, logins 6 × 150 = 900 ms, about 2.4 s. Sending more requests than the server can handle does not help and may cause timeouts. That is why you measure the server before choosing how many to run at once.',
        },
      ],
    },
  ],
  test: [
    {
      id: 'js-async-mcq-01',
      difficulty: 'easy',
      question: 'In what order are the numbers logged by this four-line snippet?',
      code: {
        language: 'javascript',
        code: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
      },
      options: ['1 2 3 4', '1 4 2 3', '1 4 3 2', '1 3 4 2'],
      correct: [2],
      explanation:
        'Normal logs run first (1, 4). Then everything that runs after the current code finishes: the .then callback (3). Only then does the timer run (2). "1 4 2 3" assumes a 0 ms timer runs before promises, which is the most common mistake.',
      followUps: [
        { q: 'Where would code after an await go in this ordering?', a: 'It runs after the current code finishes (a microtask), in the same group as the then callback, in the order it was added. So it comes after all normal code and before the setTimeout callback.' },
      ],
    },
    {
      id: 'js-async-mcq-02',
      difficulty: 'easy',
      question: 'Which Playwright calls must be awaited? Select ALL that apply.',
      options: [
        "page.getByRole('button', { name: 'Login' })",
        "page.getByRole('button', { name: 'Login' }).click()",
        "expect(page.getByText('Welcome')).toBeVisible()",
        'expect(prices.length).toBe(6)',
        "page.locator('.price').allTextContents()",
      ],
      correct: [1, 2, 4],
      explanation:
        'Actions (click), web-first assertions on locators (toBeVisible) and reads (allTextContents) talk to the browser and return promises. Making a locator does not: it is only a description. expect on a plain number is a normal check that finishes at once.',
      followUps: [
        { q: 'Is it harmful to write await page.locator(...)?', a: 'It does not break anything, because awaiting something that is not a promise just gives it back. But it shows confusion and adds noise. Linters such as Biome\'s noPlaywrightUselessAwait or eslint-plugin-playwright flag it.' },
      ],
    },
    {
      id: 'js-async-mcq-03',
      difficulty: 'easy',
      question: 'What does an async function return when its body executes `return 42`?',
      options: ['The number 42', 'A Promise that fulfils with 42', 'undefined until awaited', 'A callback function'],
      correct: [1],
      explanation:
        'An async function always returns a promise. Returning a value fulfils that promise with the value; throwing rejects it. To get 42 itself, the caller must await the call, or use .then.',
      followUps: [
        { q: 'What does an async function return if it throws?', a: 'It returns a rejected promise instead of throwing at once. The caller sees the error only through await (inside try/catch) or .catch. That is why calling it with neither gives an unhandled rejection.' },
      ],
    },
    {
      id: 'js-async-mcq-04',
      difficulty: 'medium',
      question: 'What is logged by the forEach-based collector below?',
      code: {
        language: 'javascript',
        code: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function run() {
  const done = [];
  [3, 1, 2].forEach(async (n) => {
    await wait(n * 10);
    done.push(n);
  });
  console.log(done);
}
run();`,
      },
      options: ['[3, 1, 2]', '[1, 2, 3]', '[]', 'A TypeError'],
      correct: [2],
      explanation:
        'forEach does not wait for the promises its async function returns. All three waits start, and console.log runs at once with an empty array. Later the pushes happen in the order they finish ([1, 2, 3]), but nobody logs that. [3, 1, 2] is what a for...of + await loop would give.',
      followUps: [
        { q: 'Which change makes it log [3, 1, 2]?', a: 'Use for (const n of [3, 1, 2]) { await wait(n * 10); done.push(n); } before the log. Promise.all over map would also give [3, 1, 2] if you return n from each function and use the returned array, because Promise.all keeps the input order.' },
      ],
    },
    {
      id: 'js-async-mcq-05',
      difficulty: 'medium',
      question: 'You must create 3 independent test users through the API before a test, as fast as possible, and stop if any creation fails. Which is best?',
      options: [
        'for (const u of users) { await createUser(u); }',
        'await Promise.all(users.map((u) => createUser(u)));',
        'users.forEach((u) => createUser(u));',
        'await Promise.race(users.map((u) => createUser(u)));',
      ],
      correct: [1],
      explanation:
        'Promise.all runs the independent calls at the same time and fails at the first failure. The for...of loop is correct but runs one call after another (about three times slower). forEach does not wait at all and hides failures. race finishes as soon as ONE call finishes, and leaves the others unchecked.',
      followUps: [
        { q: 'What if you need a report of every failure instead of stopping at the first?', a: 'Use Promise.allSettled, then keep the results with status "rejected". allSettled never fails, so you see every result. Then fail with one message that lists all the failed users.' },
      ],
    },
    {
      id: 'js-async-mcq-06',
      difficulty: 'medium',
      question: 'Which statements about Promise combinators are true? Select ALL that apply.',
      options: [
        'Promise.all returns values in the order the promises were passed in',
        'Promise.allSettled rejects if any promise rejects',
        'Promise.race can reject if the first promise to settle is a rejection',
        'Promise.any rejects with an AggregateError only when all promises reject',
      ],
      correct: [0, 2, 3],
      explanation:
        'all keeps the input order, whatever order the promises finish in. race takes the result of the first promise to finish, success or failure. any ignores failures until one succeeds, and only fails (with AggregateError.errors) when all fail. allSettled never fails; it reports each result.',
      followUps: [
        { q: 'What does Promise.all([]) return?', a: 'A promise that fulfils at once with an empty array. In a test that builds the array from page data, "nothing to check" then quietly passes. So check the length first.' },
      ],
    },
    {
      id: 'js-async-mcq-07',
      difficulty: 'medium',
      question: 'The helper below is called as `await setup()` and the API fails. What happens?',
      code: {
        language: 'javascript',
        code: `async function setup() {
  try {
    createBooking();               // returns a promise that rejects
  } catch (e) {
    console.log('setup failed', e.message);
  }
}`,
      },
      options: [
        "'setup failed' is logged and setup resolves",
        'setup resolves and the rejection is unhandled',
        'setup rejects with the API error',
        'The catch block runs after the rejection arrives',
      ],
      correct: [1],
      explanation:
        'Without await, the try block ends as soon as createBooking returns its unfinished promise. So the catch can never see the error that comes later. setup succeeds, and the rejected promise has no handler: an unhandled rejection that can crash Node or fail a different test. Adding await makes the catch work.',
      followUps: [
        { q: 'What is the fix if setup should fail when the API fails?', a: 'Simply await createBooking() without try/catch. Or catch it, add a clear message and throw again: catch (e) { throw new Error("setup failed", { cause: e }); }. Logging and going on would hide the failure.' },
      ],
    },
    {
      id: 'js-async-mcq-08',
      difficulty: 'medium',
      question: 'Two promise chains are started one after the other. In what order do their four log lines appear?',
      code: {
        language: 'javascript',
        code: `Promise.resolve().then(() => console.log('x1')).then(() => console.log('x2'));
Promise.resolve().then(() => console.log('y1')).then(() => console.log('y2'));`,
      },
      options: ['x1 x2 y1 y2', 'x1 y1 x2 y2', 'y1 y2 x1 x2', 'x1 y1 y2 x2'],
      correct: [1],
      explanation:
        'During the script, only the first then of each chain is added to the after-current-code line (x1, y1). Running x1 finishes its promise and adds x2 at the end of that line, behind y1. So the chains take turns: x1, y1, x2, y2. "x1 x2 y1 y2" assumes a whole chain runs at once.',
      followUps: [
        { q: 'Why does this interleaving matter in real code?', a: 'Two separate async flows move forward step by step, taking turns. So shared data (a global counter, a shared array of test data) can be read and changed by both between steps. That is a race condition, even with one thread. It is why tests should not share data they change.' },
      ],
    },
    {
      id: 'js-async-mcq-09',
      difficulty: 'hard',
      question: 'A test needs the response triggered by clicking "Save". Which snippets reliably capture it? Select ALL that apply.',
      options: [
        "await page.getByRole('button', { name: 'Save' }).click(); const res = await page.waitForResponse('**/api/save');",
        "const resP = page.waitForResponse('**/api/save'); await page.getByRole('button', { name: 'Save' }).click(); const res = await resP;",
        "const [res] = await Promise.all([page.waitForResponse('**/api/save'), page.getByRole('button', { name: 'Save' }).click()]);",
        "await page.getByRole('button', { name: 'Save' }).click(); await page.waitForTimeout(2000);",
      ],
      correct: [1, 2],
      explanation:
        'Both correct options start listening before the click, so even a very fast response is caught. Option 1 starts listening only after the click is done, so the response may have already arrived, and the wait times out. The fixed sleep does not catch the response at all; it only adds time.',
      followUps: [
        { q: 'How do you avoid matching the wrong request?', a: 'Pass a function instead of a URL pattern, for example (r) => r.url().endsWith("/api/save") && r.request().method() === "POST" && r.ok(). This avoids catching an earlier GET, or a CORS preflight request, on the same URL.' },
      ],
    },
    {
      id: 'js-async-mcq-10',
      difficulty: 'hard',
      question: 'Why can a Playwright test pass even though its final line is a failing check? Select ALL that apply.',
      code: {
        language: 'typescript',
        code: `test('shows confirmation', async ({ page }) => {
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Place order' }).click();
  expect(page.getByText('Order placed')).toBeVisible();
});`,
      },
      options: [
        'The web-first assertion returns a promise that is not awaited',
        'The test function returns before the assertion has finished retrying',
        'toBeVisible is a synchronous check that always passes',
        '@typescript-eslint/no-floating-promises would flag this line',
      ],
      correct: [0, 1, 3],
      explanation:
        'expect(locator).toBeVisible() is async and retries until the expect timeout. Without await, the test body returns at once. Playwright treats the test as finished and closes the page, so the failure never reaches the test. The no-floating-promises lint rule catches it. toBeVisible is async, and it does not always pass.',
      followUps: [
        { q: 'How do you check that a new test can actually fail?', a: 'Break it on purpose for a moment: change the expected text, or use a state where the check is false. Make sure it goes red with a clear message. If it stays green, the test is not checking what you think.' },
      ],
    },
    {
      id: 'js-async-mcq-11',
      difficulty: 'hard',
      question: 'What does this timer-and-microtask mix print?',
      code: {
        language: 'javascript',
        code: `setTimeout(() => {
  console.log('t1');
  Promise.resolve().then(() => console.log('m-in-t1'));
}, 0);
setTimeout(() => console.log('t2'), 0);
Promise.resolve().then(() => console.log('m1'));`,
      },
      options: ['m1 t1 t2 m-in-t1', 't1 t2 m1 m-in-t1', 'm1 t1 m-in-t1 t2', 't1 m-in-t1 t2 m1'],
      correct: [2],
      explanation:
        'm1 runs after the script finishes (a microtask), so it comes before any timer. After the t1 timer runs, the loop runs all microtasks again, so m-in-t1 comes before the t2 timer. "m1 t1 t2 m-in-t1" wrongly assumes all timers run before any newly added microtask.',
      followUps: [
        { q: 'What is the general rule this demonstrates?', a: 'After each single timer job or event (a macrotask), all microtasks run before the next one. Two timers never run back to back if microtasks were added in between.' },
      ],
    },
    {
      id: 'js-async-mcq-12',
      difficulty: 'hard',
      question: 'Which are anti-patterns in async test code? Select ALL that apply.',
      options: [
        'new Promise(async (resolve) => { resolve(await fetchToken()); })',
        'await Promise.all(ids.map((id) => api.delete(id)))',
        'items.filter(async (i) => await isActive(i))',
        "const res = await request.get('/booking/1'); expect(res.ok()).toBeTruthy();",
      ],
      correct: [0, 2],
      explanation:
        'An async function inside new Promise(...) hides errors: if fetchToken fails, the outer promise never finishes. filter with an async function keeps every item, because a promise counts as true. Promise.all over map is a correct way to run calls together. Awaiting an API call and then checking the response is normal, correct test code.',
      followUps: [
        { q: 'How do you correctly filter with an async check?', a: 'First get all the answers: const flags = await Promise.all(items.map(isActive)); then filter normally: items.filter((_, i) => flags[i]). Or loop with for...of and await, and push matching items into a new array.' },
      ],
    },
    {
      id: 'js-async-mcq-13',
      difficulty: 'expert',
      question: 'What do the two calls below produce?',
      code: {
        language: 'javascript',
        code: `const fail = () => Promise.reject(new Error('lost'));
async function a() { try { return fail(); } catch { return 'caught'; } }
async function b() { try { return await fail(); } catch { return 'caught'; } }
a().then(console.log, (e) => console.log('a rejected:', e.message));
b().then(console.log, (e) => console.log('b rejected:', e.message));`,
      },
      options: [
        "'caught' and 'caught'",
        "'a rejected: lost' and 'caught'",
        "'caught' and 'b rejected: lost'",
        "'a rejected: lost' and 'b rejected: lost'",
      ],
      correct: [1],
      explanation:
        'In a, the rejected promise is returned without await, so the try/catch is already over when it fails. a simply takes on that failure. In b, return await makes the error happen inside try, so the catch returns "caught". That is why "return await" is recommended inside try blocks.',
      followUps: [
        { q: 'Outside a try block, is return await still useful?', a: 'The result is the same, but return await keeps the async function in the error\'s stack trace, so errors are easier to follow. Many style guides now prefer return await everywhere for that reason. Inside try/catch it is required for correct behaviour.' },
      ],
    },
    {
      id: 'js-async-mcq-14',
      difficulty: 'expert',
      question: 'Three API calls take 300 ms, 100 ms and 200 ms. Which statements are correct? Select ALL that apply.',
      options: [
        'Awaiting them one after another takes about 600 ms',
        'Promise.all of the three takes about 300 ms',
        'Promise.all returns results ordered by finish time: 100, 200, 300',
        'Promise.race of the three settles after about 100 ms',
      ],
      correct: [0, 1, 3],
      explanation:
        'Awaits one after another add up (300 + 100 + 200 = 600 ms). Promise.all waits for the slowest (about 300 ms). race finishes with the fastest (about 100 ms). Promise.all results follow the INPUT order, not the finish order, so the third statement is false.',
      followUps: [
        { q: 'Why might the real parallel time be more than 300 ms?', a: 'The server, network or rate limiter may handle many requests at once more slowly than single ones. Some Node setups also limit connections per host. The estimate assumes the calls do not affect each other, so measure on the real server before choosing how many to run at once.' },
      ],
    },
    {
      id: 'js-async-mcq-15',
      difficulty: 'medium',
      question: 'Where does the code after `await` inside an async function run?',
      code: {
        language: 'javascript',
        code: `async function f() {
  console.log('f1');
  await null;
  console.log('f2');
}
console.log('s');
f();
console.log('e');
setTimeout(() => console.log('t'), 0);
Promise.resolve().then(() => console.log('then'));`,
      },
      options: ['s f1 f2 e then t', 's f1 e f2 then t', 's e f1 f2 then t', 's f1 e then f2 t'],
      correct: [1],
      explanation:
        'Calling f runs it now, up to the await, so f1 prints right after s. The rest of f (f2) waits until the current code finishes, so e prints next. f2 was added before the then callback, so it runs first. The timer runs last. Option 1 forgets that await always pauses, even for null.',
      followUps: [
        { q: 'What would change if the caller wrote await f() instead of f()?', a: 'The caller would pause until f finished, so e would print after f2: s, f1, f2, e. The timer and the then callback are added after that point, so then comes before t at the end.' },
      ],
    },
    {
      id: 'js-async-mcq-16',
      difficulty: 'hard',
      question: 'A health-check script must report the status of 5 services and never stop at the first failure. Which combinator fits best?',
      options: ['Promise.all', 'Promise.allSettled', 'Promise.race', 'Promise.any'],
      correct: [1],
      explanation:
        'allSettled waits for every promise and returns a status/value or status/reason object for each. So you can report all healthy and broken services. all stops at the first failure, race reports only the first to finish, and any reports only the first success.',
      followUps: [
        { q: 'How would you make the script exit non-zero if any service is down?', a: 'After allSettled, keep the rejected results. If there are any, print them and set process.exitCode = 1 (or throw an Error that lists them). CI then marks the step as failed, and the log still shows every broken service.' },
      ],
    },
  ],
};

export default topic;
