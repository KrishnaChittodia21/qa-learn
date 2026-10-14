import type { Topic } from '../../types';

const topic: Topic = {
  id: 'js-async',
  phase: 'javascript',
  order: 6,
  title: 'Asynchronous JavaScript: Promises, async/await & the Event Loop',
  subtitle:
    'Why almost every Playwright line starts with await. Callbacks, the event loop (call stack, microtasks, macrotasks), promises, async/await, error handling, Promise.all and friends, and the async mistakes that make tests pass when they should fail.',
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
    'JavaScript runs on ONE thread: slow work (network, timers, browser actions) is started, and its result is handled later via callbacks/promises, so nothing blocks.',
    'Event loop: run all synchronous code (call stack) → drain ALL microtasks (promise .then, await continuations, queueMicrotask) → run ONE macrotask (setTimeout, I/O, events) → drain microtasks again → repeat.',
    'Classic order: `console.log(1); setTimeout(→2); Promise.resolve().then(→3); console.log(4)` prints 1 4 3 2. setTimeout(fn, 0) means "not before 0 ms", never "now".',
    'A promise is pending, then settles once: fulfilled (value) or rejected (reason). `.then` returns a NEW promise; return a value to pass it on, throw to reject.',
    'async functions always return a promise; await pauses only that function until the promise settles, then resumes it as a microtask. Code after an un-awaited call keeps running.',
    'Errors: `try { await x } catch (e) {}`, or `.catch()`. try/catch WITHOUT await catches nothing. `return await` inside try if you want that try to catch the rejection.',
    'Promise.all: all fulfil → array in input order; first rejection rejects (fail fast). allSettled: never rejects, gives {status, value|reason}. race: first to settle. any: first to fulfil, AggregateError if all reject.',
    'Sequential `await a(); await b();` = sum of times. Parallel `await Promise.all([a(), b()])` = slowest time. Parallelise only independent work.',
    '`arr.forEach(async x => await ...)` does not wait: use `for...of` + await (sequential) or `await Promise.all(arr.map(async x => ...))` (parallel).',
    'In Playwright: actions (click, fill, goto), web-first assertions (`await expect(locator).toBeVisible()`) and data reads (textContent, allTextContents) return promises: AWAIT them. `page.locator()`/`getByRole()` are synchronous: no await.',
    'Missing await = floating promise: the test can finish before the action/assertion runs, passing falsely or failing later with "Target page, context or browser has been closed". Turn on @typescript-eslint/no-floating-promises.',
    'Wait for a response/popup by starting the wait BEFORE the click: `const resP = page.waitForResponse(url); await click; const res = await resP;` (or Promise.all of both).',
  ],
  sections: [
    {
      heading: 'Sync vs async: why JavaScript waits without blocking',
      body: `**Intuition:** a restaurant with **one waiter**. A *synchronous* waiter takes your order, walks into the kitchen and stands there until the food is ready, ignoring every other table. An *asynchronous* waiter hands the order to the kitchen, serves other tables, and comes back when the kitchen rings the bell. JavaScript is the second waiter.

**The facts:**

- JavaScript runs your code on **one thread**: it does one thing at a time.
- Slow things (HTTP requests, timers, reading files, and every browser action Playwright performs) are handed to the **environment** (the browser, Node, or the Playwright driver). JavaScript keeps going and handles the result later.
- **Synchronous** code runs line by line, top to bottom, each line finishing before the next starts.
- **Asynchronous** code *starts* work now and *finishes* it later. The "later" part is delivered through a **callback** or a **promise**.

**Why a tester must care:** every Playwright action talks to a real browser through a separate process. \`page.click()\` cannot return the result instantly, so it returns a **promise**. If you do not \`await\` it, your test races ahead of the browser. Understanding async is the difference between reliable tests and tests that "pass" without checking anything.`,
      code: [
        {
          language: 'javascript',
          title: 'Synchronous vs asynchronous order',
          code: `console.log('1. order taken');

setTimeout(() => {
  console.log('3. food ready (after 1 second)');
}, 1000);                                // hand work to the environment, keep going

console.log('2. serving other tables');

// Output:
// → 1. order taken
// → 2. serving other tables
// → 3. food ready (after 1 second)

// A blocking loop freezes EVERYTHING (timers, clicks, rendering) until it finishes
const start = Date.now();
while (Date.now() - start < 200) { /* busy-wait 200 ms: never do this */ }
console.log('blocked for ~200 ms');`,
        },
      ],
      keyPoints: [
        'One thread: long synchronous work blocks everything else.',
        'Async work is started now and finished later via callbacks or promises.',
        'Every Playwright action is async because it talks to a separate browser process.',
      ],
      source: 'javascript.info — Introduction: callbacks; Eloquent JavaScript Ch 11',
    },
    {
      heading: 'Callbacks and callback hell',
      body: `**Intuition:** a callback is leaving your phone number with the kitchen: "call me when it is ready". You pass a **function** that the other code will call later.

\`setTimeout(fn, ms)\`, \`addEventListener('click', fn)\` and Node's older \`fs.readFile(path, (err, data) => ...)\` all take callbacks. Node's convention is **error-first**: the first argument is an error (or \`null\`), the second the result.

**The problem: callback hell.** When step 2 needs step 1's result and step 3 needs step 2's, the callbacks nest deeper and deeper (the "pyramid of doom"). Every level must check its own error, and it is easy to forget one. Errors thrown inside a callback cannot be caught by a \`try/catch\` around the outer call, because the callback runs later.

**The solution was promises**, and then \`async/await\` built on promises. You will still meet callbacks in event handlers (\`page.on('dialog', ...)\` in Playwright) and old libraries. Wrapping a callback API in a promise is a classic interview task: see the \`sleep\` and \`readFileAsync\` examples.`,
      code: [
        {
          language: 'javascript',
          title: 'Nested callbacks vs a promise wrapper',
          code: `// Fake async API in callback style (error-first)
function getUser(id, cb) { setTimeout(() => cb(null, { id, name: 'Asha' }), 10); }
function getOrders(user, cb) { setTimeout(() => cb(null, ['A1', 'B2']), 10); }

// Callback pyramid: every level handles its own error
getUser(7, (err, user) => {
  if (err) return console.error(err);
  getOrders(user, (err2, orders) => {
    if (err2) return console.error(err2);
    console.log(user.name, orders);      // → Asha ['A1', 'B2']
  });
});

// Wrapping callbacks in promises (what util.promisify does)
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
        'Nested callbacks are hard to read and error handling is repeated at each level.',
        'Wrap callback APIs in new Promise(...) once, then use await.',
      ],
      source: 'javascript.info — Introduction: callbacks; Node.js docs — util.promisify',
    },
    {
      heading: 'The event loop: call stack, microtasks and macrotasks',
      body: `**Intuition:** picture one chef (the **call stack**), a **VIP ticket rail** (the **microtask queue**) and a **normal ticket rail** (the **macrotask / task queue**). The chef finishes the current dish completely. Then they clear **every** VIP ticket, including VIP tickets added while clearing. Only then do they take **one** normal ticket, and the cycle repeats.

**The pieces:**

| Piece | What lives there | Examples |
|---|---|---|
| Call stack | the function running right now | your synchronous code |
| Environment (Web APIs / Node / libuv) | timers counting, network in flight | setTimeout, fetch, file reads |
| Microtask queue | promise reactions, run ASAP | \`.then/.catch/.finally\`, code after \`await\`, \`queueMicrotask\` |
| Macrotask (task) queue | callbacks from the environment | \`setTimeout\`, \`setInterval\`, I/O, UI events, \`setImmediate\` (Node) |

**The algorithm (one "tick"):**

1. Run the current script / task until the call stack is empty.
2. Run **all** microtasks, including any queued by those microtasks.
3. (In browsers) maybe render.
4. Take the **next** macrotask and go back to step 1.

**Consequences you must be able to explain:**

- \`setTimeout(fn, 0)\` runs **after** all current synchronous code **and** all pending promise callbacks.
- Promise callbacks are always async, even for an already-resolved promise: \`Promise.resolve().then(fn)\` never runs \`fn\` immediately.
- The executor of \`new Promise(executor)\` runs **synchronously**; only the \`.then\` handlers are deferred.
- After \`await\`, the rest of the async function continues as a **microtask**.
- An endless chain of microtasks starves timers and rendering, just like an infinite loop.

**In interviews say this:** "Synchronous code first, then all microtasks (promises, await continuations), then one macrotask such as a timer, then microtasks again." Jake Archibald's article and Philip Roberts' talk are the classic references.`,
      diagram: `   +-------------+      starts timers / I/O       +--------------------+
   | CALL STACK  | -----------------------------> | ENVIRONMENT        |
   | (1 thing at |                                | timers, network,   |
   |  a time)    |                                | browser driver     |
   +------^------+                                +---------+----------+
          |                                                 | when done
          | 2) drain ALL                                    v
   +------+---------------+                      +---------------------+
   | MICROTASK QUEUE      |                      | MACROTASK QUEUE     |
   | .then  await  qMT    |                      | setTimeout  I/O     |
   +----------------------+                      +----------+----------+
          ^                                                 |
          +---------- 3) then take ONE macrotask -----------+`,
      code: [
        {
          language: 'javascript',
          title: 'The ordering rules in one snippet',
          code: `console.log('A: sync');

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
        'Order: synchronous code → all microtasks → one macrotask → all microtasks → ...',
        'Promise reactions and await continuations are microtasks; timers are macrotasks.',
        'The Promise executor is synchronous; only its handlers are deferred.',
      ],
      source: 'Jake Archibald — Tasks, microtasks, queues and schedules; javascript.info — Event loop: microtasks and macrotasks; Philip Roberts — JSConf EU 2014',
    },
    {
      heading: 'Promises: pending, fulfilled, rejected',
      body: `**Intuition:** a promise is a **delivery tracking number**. Right now the parcel is *in transit* (pending). Later it is either *delivered* (fulfilled, with the parcel as its **value**) or *failed* (rejected, with a **reason**). It changes state only once, and you can register what to do in either case.

**Mechanics:**

- States: \`pending\` → \`fulfilled\` **or** \`rejected\` (together called *settled*). Calling \`resolve\` a second time is ignored.
- \`promise.then(onFulfilled, onRejected?)\`, \`.catch(onRejected)\`, \`.finally(onSettled)\` register reactions.
- **\`.then\` returns a new promise.** Whatever you **return** from the handler becomes the next value; whatever you **throw** becomes the next rejection; returning a promise makes the chain wait for it. This is what makes chains flat.
- Forgetting to \`return\` inside a \`.then\` breaks the chain: the next step gets \`undefined\` and does not wait.
- A rejection skips the following \`.then\` handlers until it reaches a \`.catch\`.
- \`Promise.resolve(v)\` and \`Promise.reject(err)\` create already-settled promises (handy in tests and mocks).

**You will mostly write async/await**, but Playwright returns promises everywhere, and output-ordering questions are about \`.then\`, so you must read both styles.`,
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
        'A promise settles once: fulfilled with a value or rejected with a reason.',
        'then returns a new promise: return to pass values on, throw to reject.',
        'A single catch at the end handles a rejection from any earlier step.',
      ],
      source: 'javascript.info — Promise, Promises chaining; MDN Web Docs — Using promises',
    },
    {
      heading: 'async/await',
      body: `**Intuition:** \`await\` is "pause this recipe until the oven beeps, and let the kitchen do other things meanwhile". It makes async code read like a normal top-to-bottom script, which is why every Playwright test is written with it.

**Rules:**

- \`async function\` **always returns a promise**. \`return 5\` becomes a promise fulfilled with 5; a \`throw\` becomes a rejected promise.
- \`await promise\` pauses **only the current async function** until the promise settles, then gives you the value (or throws the rejection reason). The rest of the program keeps running.
- \`await\` on a non-promise just wraps it (\`await 5\` is 5), still yielding once.
- You can use \`await\` inside async functions and at the top level of ES modules.
- Arrow functions can be async too: \`async ({ page }) => { ... }\` is exactly what a Playwright test body is.

**Reading the order:** everything before the first \`await\` runs synchronously when you call the function. Everything after it runs later, as a microtask. That is why calling an async function without \`await\` lets the caller continue immediately.

| \`.then\` style | async/await style |
|---|---|
| \`getUser().then(u => getOrders(u)).then(o => show(o))\` | \`const u = await getUser(); const o = await getOrders(u); show(o);\` |
| \`.catch(handle)\` | \`try { ... } catch (e) { handle(e) }\` |
| \`.finally(cleanup)\` | \`finally { cleanup() }\` |`,
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
const p = login();                             // runs until the first await
console.log('3: after calling login, p is a', p.constructor.name); // → Promise
p.then((t) => console.log('5: caller sees', t));

// → 1: before
// → 2: login starts (sync part)
// → 3: after calling login, p is a Promise
// → 4: got token tok-123
// → 5: caller sees tok-123

async function five() { return 5; }
console.log(five() instanceof Promise);        // → true`,
        },
      ],
      keyPoints: [
        'async functions always return promises.',
        'await pauses only the current function; callers continue unless they await too.',
        'Code before the first await runs synchronously.',
      ],
      source: 'javascript.info — Async/await; MDN Web Docs — async function, await',
    },
    {
      heading: 'Async error handling',
      body: `**Intuition:** a rejected promise is an error that arrives **later**. You can only catch it if someone is still listening when it arrives: an \`await\` inside a \`try\`, or a \`.catch()\` attached to the chain.

**Rules:**

- \`try { await risky(); } catch (e) { ... }\` catches rejections because \`await\` turns the rejection into a thrown error **at that line**.
- \`try { risky(); } catch (e) {}\` **without await** catches nothing: the function returns a pending promise, the try block ends, and the rejection happens afterwards.
- Inside an async function, \`return promise\` from a \`try\` does **not** let that \`try\` catch the rejection; \`return await promise\` does.
- \`.catch()\` at the end of a chain is the promise-style equivalent.
- An **unhandled rejection** (nobody awaited it or attached \`.catch\`) crashes Node by default since Node 15. In a Playwright run it can fail an unrelated test or the worker, which is very confusing to debug.
- \`Promise.all\` rejects with the **first** error; the other promises keep running and their later errors are ignored by \`all\` (attach handlers or use \`allSettled\` if they matter).

**In tests:** do not catch to hide failures (see the loops/errors topic). Catch to add context, to clean up, or when the error is the expected result: \`await expect(promise).rejects.toThrow('not found')\`.`,
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
        'Use return await inside try when that try should handle the rejection.',
        'Unhandled rejections crash Node and confuse Playwright reports: always await or .catch.',
      ],
      source: 'javascript.info — Error handling with promises; Node.js docs — unhandled rejections',
    },
    {
      heading: 'Promise.all, allSettled, race and any',
      body: `**Intuition:** you are waiting for several parcels. **all**: "tell me when every parcel arrives; if one is lost, tell me immediately". **allSettled**: "tell me when every parcel has either arrived or been lost, with a report for each". **race**: "tell me about the first parcel that arrives *or* gets lost". **any**: "tell me about the first parcel that actually arrives; only tell me it failed if every one was lost".

| Combinator | Fulfils when | Rejects when | Result | Testing use |
|---|---|---|---|---|
| \`Promise.all\` | all fulfil | the **first** rejection | values in **input order** | create 5 bookings in parallel; wait for click + response |
| \`Promise.allSettled\` | all settle | never | \`[{status:'fulfilled', value}, {status:'rejected', reason}]\` | health-check several services and report every failure |
| \`Promise.race\` | first settles (fulfil) | first settles (reject) | that one value/reason | add a timeout to a promise |
| \`Promise.any\` | first **fulfils** | **all** reject | first value; \`AggregateError\` with \`.errors\` | try mirrors, use the fastest that works |

**Details interviewers probe:**

- Results of \`all\` are in **input** order, not completion order.
- \`Promise.all([])\` fulfils immediately with \`[]\`; \`Promise.any([])\` rejects with an AggregateError.
- \`all\` does not cancel the other promises when one rejects; they keep running.
- Non-promise values in the array are treated as already fulfilled.`,
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
        'all: everything or the first error; results in input order.',
        'allSettled: never rejects; use it to report every outcome.',
        'race: first settled (even a rejection); any: first success.',
      ],
      source: 'MDN Web Docs — Promise.all, Promise.allSettled, Promise.race, Promise.any; javascript.info — Promise API',
    },
    {
      heading: 'Sequential vs parallel',
      body: `**Intuition:** making tea and toast. Sequential: boil the kettle, wait, *then* start the toaster. Parallel: start both, then wait for both. Same work, half the waiting, as long as the two jobs do not depend on each other.

| Pattern | Code | Total time for 3 × 100 ms calls |
|---|---|---|
| Sequential | \`for (const id of ids) results.push(await get(id))\` | ~300 ms |
| Parallel | \`await Promise.all(ids.map((id) => get(id)))\` | ~100 ms |
| Start early, await later | \`const a = get(1); const b = get(2); await a; await b;\` | ~100 ms (but see the warning) |

**When to choose which:**

- **Sequential** when each step depends on the previous one (log in → get token → create booking with token), when order matters, or when the target cannot handle load (rate limits).
- **Parallel** for independent work: creating 10 test users through the API, checking 5 endpoints, reading several files.
- **Limited concurrency** for big batches: process in chunks of, say, 5 with \`Promise.all\` per chunk, so you do not hammer a shared test environment.

**Warning about "start early, await later":** if \`a\` rejects while you are still awaiting \`b\`, \`a\`'s rejection has no handler yet and Node may report it as unhandled. \`Promise.all\` attaches handlers to every promise at once, so prefer it.

**UI actions in Playwright stay sequential.** One page is one user; firing clicks in parallel causes races. Parallelism in Playwright comes from **workers** running different tests, not from \`Promise.all\` over clicks.`,
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
        'await in a loop = sequential; Promise.all over map = parallel.',
        'Parallelise only independent work; respect rate limits with chunks.',
        'In Playwright, keep UI steps sequential; scale with workers instead.',
      ],
      source: 'javascript.info — Async/await, Promise API; MDN Web Docs — Promise.all',
    },
    {
      heading: 'Common async mistakes: missing await, forEach + async, floating promises',
      body: `**Intuition:** an un-awaited promise is a colleague you sent on an errand and then forgot about. If they fail, nobody hears about it. If you leave the building (the test ends), their errand is cut short.

**Mistake 1: missing \`await\`.** \`page.getByRole('button', { name: 'Login' }).click();\` without await starts the click and moves on. The next line may run before the click, and if it is the last line, the test **ends**, Playwright closes the page, and the click fails with "Target page, context or browser has been closed", sometimes attributed to the wrong place, sometimes not at all. An un-awaited \`expect(locator).toHaveText(...)\` may never get the chance to fail: the test **passes falsely**.

**Mistake 2: \`forEach\` with an async callback.** \`forEach\` ignores the promises its callback returns. All callbacks start, \`forEach\` returns immediately, and nothing waits for them. Use \`for...of\` + \`await\` (sequential) or \`await Promise.all(arr.map(async ...))\` (parallel). The same applies to \`map\` without \`Promise.all\`: you get an array of pending promises.

**Mistake 3: floating promises in helpers.** A helper that calls an async function without returning or awaiting it hides the work from its caller, so even an \`await helper()\` does not wait.

**Mistake 4: async callbacks in \`filter\`/\`find\`/\`some\`.** An async predicate returns a promise, which is truthy, so \`filter\` keeps everything.

**Mistake 5: \`await\` on synchronous Playwright APIs** (\`await page.locator(...)\`). Harmless but a sign of confusion; linters flag it.

**Prevention:** enable \`@typescript-eslint/no-floating-promises\` (recommended by the Playwright docs) and/or \`eslint-plugin-playwright\`'s \`missing-playwright-await\`; use TypeScript; review every Playwright call for \`await\`. Newer Playwright versions may also warn about some un-awaited calls, but do not rely on that.`,
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
        'forEach/filter/find never await async callbacks.',
        'Turn on no-floating-promises: let the linter find missing awaits.',
      ],
      source: 'Playwright docs — Best practices (lint your tests); dev.to Playwright — Catch missing await calls with ESLint; javascript.info — Async/await',
    },
    {
      heading: 'Why every Playwright call is awaited',
      body: `**Intuition:** your test script and the browser are two separate programs talking over a connection. Every command (\`click\`, \`fill\`, \`goto\`) is a message and a wait for the reply. \`await\` is "wait for the browser to confirm before the next step".

**What needs await and what does not:**

| Needs \`await\` (returns a Promise) | No \`await\` (synchronous) |
|---|---|
| Actions: \`goto\`, \`click\`, \`fill\`, \`check\`, \`selectOption\`, \`press\` | Creating locators: \`page.locator()\`, \`getByRole()\`, \`getByTestId()\`, \`.filter()\`, \`.nth()\` |
| Web-first assertions: \`await expect(locator).toBeVisible()\`, \`toHaveText\`, \`toHaveURL\` | Generic assertions on plain values: \`expect(prices.length).toBe(6)\` |
| Reads: \`textContent\`, \`allTextContents\`, \`count\`, \`isVisible\`, \`inputValue\` | \`test.info()\`, building strings and arrays |
| Waits: \`waitForResponse\`, \`waitForEvent\`, \`waitForURL\` | |
| API: \`request.get/post\`, \`response.json()\` | |

Locators are **lazy descriptions**: creating one does not touch the browser, so it is synchronous. Using one (acting, asserting, reading) touches the browser, so it is async.

**Waiting for something a click triggers:** start the wait **before** the click, otherwise the response or popup may arrive before you begin listening and the wait times out:

- \`const responsePromise = page.waitForResponse('**/api/cart'); await addButton.click(); const response = await responsePromise;\` (the pattern the Playwright docs use), or
- \`const [response] = await Promise.all([page.waitForResponse('**/api/cart'), addButton.click()]);\`

**Do not** replace waits with \`page.waitForTimeout(3000)\` or a home-made \`sleep\`: actions auto-wait for actionability and web-first assertions retry (5 s default for \`expect\`, 30 s per test), so fixed sleeps only add time and flakiness.`,
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
        'Locator creation is synchronous; actions, reads and web-first assertions are async.',
        'Start waitForResponse/waitForEvent before the click that triggers it.',
        'Never use fixed sleeps; rely on auto-waiting and retrying assertions.',
      ],
      source: 'Playwright docs — Writing tests, Auto-waiting, page.waitForResponse, page.waitForEvent, Pages (handling popups)',
    },
    {
      heading: 'Output-ordering puzzles: a method that always works',
      body: `**Intuition:** these puzzles look like trick questions, but they are mechanical. Simulate the chef: run the synchronous code, write down what goes into each queue, then empty the queues by the rules.

**The method (draw three columns: Output, Microtasks, Macrotasks):**

1. Go through the code top to bottom. Print synchronous \`console.log\`s immediately. Remember that the **Promise executor** and the part of an async function **before its first await** are synchronous.
2. \`setTimeout\` → append its callback to **Macrotasks**.
3. \`.then\` on a settled promise, \`queueMicrotask\`, or reaching an \`await\` → append the continuation to **Microtasks**.
4. When the script ends, run Microtasks **one by one from the front until the queue is empty**, adding new ones to the end as they appear.
5. Take the **first** macrotask, run it, then drain Microtasks again. Repeat.

**Patterns to recognise:**

| Pattern | Result |
|---|---|
| sync logs vs everything else | sync logs always come first |
| \`then\` vs \`setTimeout(0)\` | \`then\` first |
| two chains \`.then(a1).then(a2)\` and \`.then(b1).then(b2)\` | interleave: a1 b1 a2 b2 |
| \`await\` inside an async function called from the script | the code after \`await\` waits for the script to finish, then runs as a microtask |
| \`setTimeout\` scheduled inside a \`then\` | goes to the back of the macrotask queue |
| microtask scheduled inside a \`setTimeout\` | runs right after that timer, before the next timer |

**Exam tip:** say the method aloud while solving. Interviewers care more about the reasoning (queues and their priority) than the final string.`,
      code: [
        {
          language: 'javascript',
          title: 'A full puzzle with the trace',
          code: `async function a1() {
  console.log('a1 start');
  await a2();                 // a2 runs synchronously; the rest of a1 becomes a microtask
  console.log('a1 end');
}
async function a2() { console.log('a2'); }

console.log('script start');
setTimeout(() => console.log('timeout'), 0);   // Macro: [timeout]
a1();                                          // logs a1 start, a2; Micro: [a1 end]
new Promise((resolve) => {
  console.log('executor');                     // sync
  resolve();
}).then(() => console.log('then'));            // Micro: [a1 end, then]
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
        'Track three columns: output, microtasks, macrotasks.',
        'Drain all microtasks before each macrotask.',
        'Code before the first await is synchronous; after it, a microtask.',
      ],
      source: 'Jake Archibald — Tasks, microtasks, queues and schedules; javascript.info — Event loop',
    },
  ],
  codeChallenges: [
    {
      id: 'js-async-cc-1',
      title: 'The Playwright test that always passes',
      context:
        'This checkout test has been green for weeks. A developer then broke the "Add to cart" buttons and it stayed green. In CI it occasionally fails with "Target page, context or browser has been closed" on a different line each time.',
      task: 'Fix every async problem in `cartTest(page, names)` so the test really checks the cart and fails when it should. Keep the same scenario. The lab uses a tiny fake of Playwright\'s `page` (small delays, no browser) plus two web-first assertions, `expectBadge(page, text)` and `expectCartItems(page, names)`, that retry briefly and reject on mismatch. The tests call `runCartTest(names, brokenButtons)`, which runs your test like Playwright does (the page is closed as soon as the test function returns) and resolves with `{ result, cart }`: `\'passed\'` or `\'failed: <message>\'`, and the cart in click order. With `brokenButtons` the Add to cart buttons do nothing, so your test must fail on the badge check. Press Run to check your fix.',
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
        'What does forEach do with the promises its async callback returns? What replaced the missing waiting?',
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

1. **\`fill\` without \`await\`** (twice): the login click could run before the fields were filled. Every action returns a promise; await it.
2. **\`names.forEach(async ...)\`** started both clicks and returned immediately; nothing waited for them, and a failure became an unhandled rejection instead of a test failure. \`for...of\` with \`await\` performs them in order and propagates errors.
3. **\`waitForTimeout(2000)\`** was papering over the missing waits: slow in the good case, flaky in the bad case. Replaced by a web-first assertion on the cart badge, which retries until it shows "2" (up to the 5 s expect timeout).
4. **Cart link click without \`await\`.**
5. **\`expect(locator).toHaveText(...)\` without \`await\`**: the last statement of the test. The test function returned, Playwright tore down the page, and the assertion never got to fail: the false pass. Web-first assertions must be awaited.
6. **\`isVisible()\` + \`console.log\` is not an assertion**: it returns a boolean immediately (no retry) and the test passes whether the badge exists or not. Use \`await expect(...).toHaveText('2')\` / \`toBeVisible()\`.

Turning on \`@typescript-eslint/no-floating-promises\` would have flagged findings 1, 4 and 5 automatically.

In the lab, the un-awaited fills make the login click run before the fields are filled, and \`forEach\` lets a slower click finish after a faster one, so the cart order no longer matches the click order.`,
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
          a: 'Un-awaited actions were still running when the test function finished. Playwright then closed the context, and whichever pending action was in flight failed with that message. Which one depended on timing, so the line changed between runs. Once every action is awaited, the test cannot finish while work is pending.',
        },
        {
          q: 'Could you add both items in parallel with Promise.all?',
          a: 'Technically yes, but it does not model a real user and the two clicks race with the re-rendering of the inventory page (each button changes to "Remove"). Sequential for...of is clearer and gives a precise failure location. Use Promise.all for independent API setup calls instead.',
        },
      ],
    },
    {
      id: 'js-async-cc-2',
      title: 'Slow, fragile test-data seeding',
      context:
        'A global-setup script creates 20 bookings on Restful Booker before the suite runs. It takes far too long, sometimes crashes Node with an unhandled rejection, and when one booking fails nobody knows which.',
      task: 'Make `seed(count)` faster without overloading the server (at most 5 requests at a time), report every failure clearly, and remove the async anti-patterns. The lab replaces `fetch` with a fake server (3 ms per request, no network). The tests call `async runSeed(count, failing)`, where the server answers HTTP 500 for the booking indexes in `failing`, and get `{ ids }` (booking ids 1000 + i, in order) or `{ error }` (`\'N bookings failed:\'` followed by one `Booking i failed: HTTP 500` line per failure), plus `requests` (POSTs made by the time `seed` settled) and `maxInFlight` (most requests at the same time). Press Run to check your fix.',
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
        'What happens to an error thrown inside an async Promise executor? Do you need new Promise at all?',
        'Are the 20 bookings dependent on each other? How could you run them in groups?',
        'Which combinator reports every success and failure without stopping at the first?',
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

1. **\`new Promise(async (resolve) => ...)\` anti-pattern.** If \`fetch\` or \`res.json()\` throws inside an async executor, the error rejects the executor's own (ignored) promise, the outer promise never settles, and the script hangs or crashes with an unhandled rejection. An \`async function\` already returns a promise and propagates errors.
2. **Never rejected on HTTP errors.** \`fetch\` only rejects on network failure; a 500 or 418 resolves normally. Check \`res.ok\` and throw a descriptive error.
3. **20 sequential awaits** = 20 × round-trip time. The bookings are independent, so run them in batches of 5 with \`Promise.all/allSettled\`: about 4 round-trips instead of 20, without flooding a shared demo server.
4. **\`Promise.allSettled\`** collects every outcome, so one failure does not hide the others and the error lists exactly which bookings failed. (Use \`Promise.all\` instead if you want to stop on the first failure.)
5. **Floating \`createBooking(99).then(...)\`** was not awaited: \`seed\` returned before it finished, so the count was wrong, and its failure would be unhandled. Removed (or it must be awaited / included in the batch).
6. **The top-level call had no error handling.** Top-level \`await\` in a module plus \`try/catch\` sets a non-zero exit code so CI fails visibly.`,
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
          a: 'It would be fastest, but 20 simultaneous POSTs can trigger rate limits or overload a shared test environment, causing failures that have nothing to do with the code under test. Batching (or a small concurrency limit) gives most of the speed with predictable load. On your own dedicated environment, a higher limit is fine.',
        },
        {
          q: 'How would you add a retry for transient 503 errors?',
          a: 'Wrap createBooking in a retry helper: loop up to N attempts, return on success, and on failure await a growing delay (for example 200 ms, 400 ms, 800 ms) before trying again; rethrow the last error with { cause } when attempts run out. Only retry transient errors (503, network resets), never 400-level validation errors.',
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
        'Single thread + call stack + queues, explained simply',
        'Correct priority: sync → all microtasks → one macrotask',
        'Examples of each queue (then/await/queueMicrotask vs setTimeout/I/O/events)',
        'Correct answer 1 4 3 2 with reasoning, not memorisation',
      ],
      modelAnswer: `**Simple picture:** JavaScript has one call stack, so it runs one thing at a time. Slow work (timers, network, browser commands) is handed to the environment. When that work finishes, its callback is queued. The **event loop** decides what runs next whenever the stack is empty.

**Two queues with different priority:**

| | Microtasks | Macrotasks (tasks) |
|---|---|---|
| Examples | \`.then/.catch/.finally\`, code after \`await\`, \`queueMicrotask\` | \`setTimeout\`, \`setInterval\`, I/O, UI events, \`setImmediate\` (Node) |
| When they run | after the current task, **all of them**, including newly added ones | **one** per loop turn |

**The loop:** run the current script/task until the stack is empty → drain all microtasks → (browser may render) → take one macrotask → drain microtasks → repeat.

**The snippet:**

1. \`console.log(1)\` is sync → **1**.
2. \`setTimeout\` → callback to the macrotask queue.
3. \`Promise.resolve().then\` → callback to the microtask queue.
4. \`console.log(4)\` → **4**.
5. Script done → drain microtasks → **3**.
6. Next macrotask → **2**.

**Answer: 1, 4, 3, 2.**

**Why a QA engineer should care:** it explains why \`setTimeout(fn, 0)\` is not "immediately", why code after an un-awaited call runs first, and why a test can finish before a floating promise does. It also helps me read Playwright traces: my test code and the browser are separate, and every \`await\` is a point where other queued work can run.`,
      followUps: [
        {
          q: 'Where does the code after an await go?',
          a: 'When an async function hits await, it returns control to the caller. Once the awaited promise settles, the rest of the function is scheduled as a microtask. So in the same tick it runs after the remaining synchronous code but before any setTimeout callback that is already queued.',
        },
        {
          q: 'Can microtasks starve the page?',
          a: 'Yes. Because the loop drains the microtask queue completely before rendering or running timers, a microtask that keeps scheduling another microtask (for example a recursive promise chain) blocks timers, input and rendering just like an infinite loop. setTimeout-based recursion does not, because each round goes back through the macrotask queue.',
        },
        {
          q: 'Is setTimeout(fn, 0) really 0 ms?',
          a: 'No. It means "no earlier than 0 ms": the callback still waits for the current task and all microtasks, plus any timers queued earlier. Browsers also clamp nested timers to at least about 4 ms after several levels of nesting. That is why fixed small timeouts are never a reliable synchronisation tool in tests.',
        },
      ],
      pitfalls: [
        'Saying setTimeout 0 runs before promises "because 0 is immediate".',
        'Claiming JavaScript is multi-threaded because the browser does work in parallel.',
        'Reciting the order without explaining the queues.',
      ],
    },
    {
      id: 'js-async-iq-02',
      difficulty: 'easy',
      question: 'What is a Promise? Compare .then chains with async/await and show how errors are handled in each.',
      whatInterviewerLooksFor: [
        'States pending/fulfilled/rejected and settle-once',
        'Knows then returns a new promise (return/throw semantics)',
        'Equivalent async/await with try/catch/finally',
        'Mentions that async functions return promises',
      ],
      modelAnswer: `**A promise is an object representing a value that will be available later**, like a tracking number. It starts **pending** and settles exactly once: **fulfilled** with a value or **rejected** with a reason.

**.then style:**

    getToken()
      .then((token) => createBooking(token))   // return → next step waits for it
      .then((booking) => console.log(booking.id))
      .catch((err) => console.error('setup failed', err))
      .finally(() => console.log('done'));

Each \`.then\` returns a **new** promise. Returning a value passes it on; returning a promise makes the chain wait; throwing (or a rejected promise) skips to the next \`.catch\`. Forgetting \`return\` is the classic bug: the next step gets \`undefined\` and does not wait.

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

\`await\` unwraps the value or throws the rejection at that line, so ordinary \`try/catch/finally\` works. An \`async\` function itself always returns a promise.

**Which I use:** async/await for test code, because it reads top to bottom like test steps and is what Playwright uses. I still use promise methods for combinators (\`Promise.all\`) and when a short \`.then\` is clearer, e.g. \`const data = await res.json().catch(() => null)\`.`,
      followUps: [
        {
          q: 'What happens if you never handle a rejected promise?',
          a: 'It becomes an unhandled rejection. Node (15+) treats it as an uncaught exception and exits the process with an error; browsers log it in the console. In a Playwright run it can fail the current test, a different test, or the worker, which makes the root cause hard to find. Always await promises or attach .catch.',
        },
        {
          q: 'Is .then(success, failure) the same as .then(success).catch(failure)?',
          a: 'Not quite. With .then(success, failure), an error thrown inside success is NOT caught by failure, because both are handlers on the same promise. With .then(success).catch(failure), the catch is attached to the promise returned by then, so it catches errors from the original promise and from success. The second form is usually what you want.',
        },
      ],
      pitfalls: [
        'Thinking a promise can be resolved multiple times.',
        'Forgetting return inside .then.',
        'Believing await blocks the whole program.',
      ],
    },
    {
      id: 'js-async-iq-03',
      difficulty: 'medium',
      question: 'Compare Promise.all, Promise.allSettled, Promise.race and Promise.any. Give a test-automation use case for each.',
      whatInterviewerLooksFor: [
        'Accurate fulfil/reject rules and result shapes',
        'Input-order results for all; fail-fast semantics',
        'AggregateError for any; race settles on rejection too',
        'Practical, specific QA use cases',
      ],
      modelAnswer: `| | Resolves | Rejects | Result |
|---|---|---|---|
| **all** | every promise fulfils | first rejection (fail fast) | values in input order |
| **allSettled** | every promise settles | never | \`{status, value}\` / \`{status, reason}\` per input |
| **race** | first to settle, if it fulfilled | first to settle, if it rejected | that single outcome |
| **any** | first to fulfil | only if all reject | first value; \`AggregateError\` with \`.errors\` |

**Use cases:**

- **all:** parallel API setup before a UI test, e.g. create three products and a user, then use all the IDs: \`const [p1, p2, user] = await Promise.all([...])\`. Also the Playwright idiom \`await Promise.all([page.waitForResponse(...), button.click()])\`. If any setup call fails, there is no point continuing, so fail fast is right.
- **allSettled:** a smoke "health check" of several services, or cleanup of many records, where I want a report of **every** failure rather than stopping at the first.
- **race:** wrapping a promise with my own timeout in a Node script: \`Promise.race([task, timeoutReject(10_000)])\`. Remember race also settles on a fast **rejection**.
- **any:** use the first environment or mirror that responds successfully (e.g. a test-data service with a fallback). It only fails if all fail.

**Details:** \`all\` does not cancel the other promises after a rejection; they keep running. \`Promise.all([])\` resolves to \`[]\` immediately, while \`Promise.any([])\` rejects. Non-promise values are treated as already fulfilled.

**In Playwright tests** I mostly use \`all\` for response/popup waits and API setup; UI actions on one page stay sequential.`,
      followUps: [
        {
          q: 'Promise.all rejected because one request failed. Do the other requests stop?',
          a: 'No. Promises are not cancellable by default, so the other requests keep running and may still create data on the server. That matters for cleanup: you might leave orphan test data. Use allSettled to learn about every outcome, or use AbortController with fetch if you need real cancellation.',
        },
        {
          q: 'How would you implement a simple Promise.all yourself?',
          a: 'Return a new Promise; keep a results array and a counter. For each input (wrapped with Promise.resolve), on fulfilment store the value at its index and increment the counter, resolving when the counter equals the length; on rejection call reject immediately. Handle the empty array by resolving [] straight away. Storing by index is what keeps input order.',
        },
      ],
      pitfalls: [
        'Saying all returns results in completion order.',
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
        'Explains that forEach ignores returned promises',
        'Sequential fix with for...of + await',
        'Parallel fix with Promise.all + map',
        'Discusses error handling and which fix suits which situation',
      ],
      modelAnswer: `**Why:** \`forEach\` calls the callback for each item and **ignores the return value**. An async callback returns a promise, so \`forEach\` starts every deletion, throws all the promises away and returns immediately. "cleanup done" is logged while deletions are still in flight, and if one fails the error is an **unhandled rejection** that nobody awaited.

**Fix 1: sequential with for...of**

    for (const id of ids) {
      await deleteBooking(id);
    }
    console.log('cleanup done');

Each deletion completes before the next starts. The first failure throws and stops the loop. Time = sum of all calls. Use it when order matters, the server is rate-limited, or each step depends on the previous.

**Fix 2: parallel with Promise.all**

    await Promise.all(ids.map((id) => deleteBooking(id)));
    console.log('cleanup done');

All deletions run at once and we wait for all of them. Time ≈ the slowest call. The first failure rejects \`Promise.all\` (the others keep running).

**For cleanup specifically** I'd often use \`Promise.allSettled\`, so one failed delete does not hide the others, and then report the failures:

    const results = await Promise.allSettled(ids.map(deleteBooking));
    const failed = results.filter((r) => r.status === 'rejected');

**Same trap elsewhere:** \`map\` with an async callback returns an array of promises (need \`Promise.all\`); \`filter\`, \`some\`, \`find\` with async predicates treat every promise as truthy. In Playwright, iterate locators with \`for (const row of await rows.all()) { await ... }\`.`,
      followUps: [
        {
          q: 'What about for await...of? Is it the same as for...of with await?',
          a: 'for await...of is for async iterables (like streams) and also awaits each element of an array of promises. With an array of already-started promises (ids.map(deleteBooking)) it awaits them in order, but they all started at once, so it behaves like parallel work consumed sequentially. For readability, prefer for...of + await or Promise.all and use for await...of for real async iterables.',
        },
        {
          q: 'How would you limit concurrency to 5 at a time?',
          a: 'Process the array in chunks: for (let i = 0; i < ids.length; i += 5) await Promise.all(ids.slice(i, i + 5).map(deleteBooking)). Each chunk runs in parallel and chunks run one after another. Libraries like p-limit offer a sliding window that keeps exactly five in flight, which is a bit faster when durations vary.',
        },
      ],
      pitfalls: [
        'Adding await before forEach (forEach returns undefined, so it waits for nothing).',
        'Using Promise.all for UI clicks on one page.',
        'Ignoring error handling in the parallel version.',
      ],
    },
    {
      id: 'js-async-iq-05',
      difficulty: 'hard',
      question: 'A Playwright test passes but a teammate shows that the feature is broken. You find `expect(page.getByText(\'Order placed\')).toBeVisible();` without await on the last line. Explain exactly why it passed and how you would prevent this across the suite.',
      whatInterviewerLooksFor: [
        'Understands web-first assertions return promises and retry',
        'Explains the test function finishing before the assertion settles',
        'Prevention: lint rule, TypeScript, code review, verifying tests can fail',
        'Distinguishes sync expect on values from async expect on locators',
      ],
      modelAnswer: `**Why it passed:** \`expect(locator).toBeVisible()\` is a **web-first assertion**. It returns a promise and keeps retrying until the element is visible or the expect timeout (5 s by default) runs out. Without \`await\`, the test function reaches its end immediately and returns. Playwright considers the test done, tears down the page and context, and the pending assertion either never rejects in time to be attributed to the test or fails against a closed page. Result: **green test, broken feature**. Mid-test, the same mistake lets later steps run before the condition holds, causing flakiness instead.

**Which expects need await:**

| Needs \`await\` | No \`await\` |
|---|---|
| \`expect(locator).toBeVisible()\`, \`toHaveText\`, \`toHaveCount\` | \`expect(value).toBe(...)\`, \`toEqual\` on plain values |
| \`expect(page).toHaveURL()\`, \`toHaveTitle()\` | |
| \`expect.poll(...)\`, \`expect(...).toPass()\` | |

**Prevention across the suite:**

1. **Lint:** \`@typescript-eslint/no-floating-promises\` (recommended in Playwright's best-practices docs) flags any un-awaited promise; \`eslint-plugin-playwright\` has \`missing-playwright-await\` specifically for expects. Run lint in CI and block merges.
2. **TypeScript** with type-aware linting, so the rule knows which calls return promises.
3. **Prove tests can fail:** for each new test, break the condition once (wrong expected text) and confirm it goes red. A test that cannot fail is worse than no test.
4. **Code review checklist:** every action and web-first assertion awaited; no \`isVisible()\` used as an assertion.
5. Newer Playwright versions may warn about some un-awaited calls, but the linter is the reliable guard.`,
      followUps: [
        {
          q: 'Why is isVisible() a similar trap even when awaited?',
          a: 'await locator.isVisible() returns a boolean immediately, without retrying, so it reflects the page at one instant. Used in an if, the test silently takes a different path; used in expect(await x.isVisible()).toBe(true), it fails on slow pages. await expect(locator).toBeVisible() retries until the timeout, which is the correct assertion.',
        },
        {
          q: 'How do you find all existing missing awaits in a large legacy suite?',
          a: 'Enable the no-floating-promises rule (it needs parserOptions with the TypeScript project for type information), run eslint over the tests folder and fix the reported lines; many editors can then show violations inline. Also search for "expect(page" and "expect(locator" lines not starting with await as a quick first pass.',
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
        'Race condition: response can arrive before the listener starts',
        'Start the wait first, then click, then await',
        'Promise.all alternative and why it works',
        'Uses a precise URL/predicate and asserts on status/body',
      ],
      modelAnswer: `**The race:** \`waitForResponse\` only sees responses that arrive **after** it starts listening. In the broken version the click is awaited first; by the time the click resolves, a fast API may already have responded. The listener then waits for a response that has already gone by and times out (30 s test timeout, or the action timeout you set). It passes on a slow environment and fails on a fast one: classic flakiness.

**Fix 1 (the pattern in the Playwright docs): create the promise first, await it later.**

    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/cart') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Add to cart' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    expect(await response.json()).toMatchObject({ items: 1 });

Calling \`waitForResponse\` without \`await\` starts listening immediately and gives back a promise; the click then triggers the request; finally we await the already-listening promise.

**Fix 2: Promise.all.**

    const [response] = await Promise.all([
      page.waitForResponse('**/api/cart'),
      page.getByRole('button', { name: 'Add to cart' }).click(),
    ]);

Both start in the same tick, so the listener is active before the request can complete.

**Good habits:** match precisely (URL **and** method, maybe \`r.ok()\`) so an unrelated request does not satisfy the wait; assert the response **and** the UI result (web-first) because users see the UI; the same pattern applies to \`waitForEvent('popup')\`, \`waitForEvent('download')\` and \`waitForURL\`.`,
      followUps: [
        {
          q: 'When would you mock the response instead of waiting for it?',
          a: 'When the test is about the UI behaviour, not the backend: error states (500, timeouts), empty lists or very large data. page.route can fulfil the request with fixed JSON so the test is fast and deterministic. Keep a smaller set of end-to-end tests that hit the real API to cover integration.',
        },
        {
          q: 'Is the first fix safe if the click throws?',
          a: 'If the click fails, the test fails at the click line, and the pending responsePromise is left behind; Playwright cleans it up when the page closes, so it does not hide the failure. Promise.all handles both promises together, which some teams prefer for that reason. Either pattern is acceptable; the key is that listening starts before the action.',
        },
      ],
      pitfalls: [
        'Adding waitForTimeout before waitForResponse.',
        'Using a URL glob that also matches other requests.',
        'Asserting only the network response, never the UI.',
      ],
    },
    {
      id: 'js-async-iq-07',
      difficulty: 'hard',
      question: 'Write an async utility that retries an operation with exponential backoff. When would you use it in test code, and when would you use Playwright\'s built-in retrying instead?',
      whatInterviewerLooksFor: [
        'Correct loop with await, try/catch and growing delay',
        'Rethrows the last error with context after the final attempt',
        'Retries only transient errors',
        'Knows expect.poll / toPass / web-first assertions cover UI waiting',
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

Points to say aloud: \`return await\` inside \`try\` (otherwise rejections skip the catch); the delay doubles; only **transient** errors are retried (a 400 validation error will fail every time); the final error keeps the original as \`cause\`. Production versions add **jitter** (a random part of the delay) to avoid many clients retrying in lockstep.

**When I use it:** API setup and teardown against a shaky shared environment, global setup scripts, polling a back-office job outside the browser.

**When I use Playwright instead:**

- Waiting for UI state: web-first assertions already retry (\`await expect(locator).toHaveText(...)\`).
- Polling a value: \`await expect.poll(async () => (await request.get(url)).status(), { timeout: 30_000 }).toBe(200)\`.
- Retrying a block of steps until it passes: \`await expect(async () => { ... }).toPass({ timeout: 15_000 })\`.
- Whole-test retries for flakiness: the \`retries\` config, which also labels the test "flaky" so problems stay visible.

**Warning:** retries can hide real bugs. If an operation needs retries regularly, log it and raise it with the team instead of quietly retrying forever.`,
      followUps: [
        {
          q: 'Why add jitter to the backoff?',
          a: 'If many test workers fail at the same moment (say the service restarts), pure exponential backoff makes them all retry at exactly 200, 400, 800 ms, hitting the recovering service in synchronized waves. Random jitter, for example sleep(random(0, base * 2^i)), spreads the retries out. In a small test suite it matters less, but mentioning it shows you understand the pattern.',
        },
        {
          q: 'How is test.retries different from your retry helper?',
          a: 'test.retries re-runs the entire test from scratch in a fresh context and marks the test as flaky if a retry passes, which keeps flakiness visible in reports. A retry helper repeats one operation inside a single test run and hides the transient failure. Use the helper for known-transient infrastructure calls, and config retries as a CI safety net, not as a fix.',
        },
      ],
      pitfalls: [
        'Retrying every error, including 4xx validation errors.',
        'Using return without await inside try.',
        'Wrapping UI assertions in a custom retry loop with sleeps.',
      ],
    },
    {
      id: 'js-async-iq-08',
      difficulty: 'expert',
      question: 'Predict the output and explain each step: an async function a1 logs "a1 start", awaits a2 (which logs "a2"), then logs "a1 end". The script logs "script start", schedules setTimeout("timeout"), calls a1(), creates a new Promise whose executor logs "executor" and resolves, attaches .then("then"), and logs "script end".',
      whatInterviewerLooksFor: [
        'Knows the async function body runs synchronously until its first await',
        'Knows the Promise executor is synchronous',
        'Orders microtasks by the time they were queued',
        'Places the timer last and explains why',
      ],
      modelAnswer: `**Answer:** script start, a1 start, a2, executor, script end, a1 end, then, timeout.

**Trace (Output | Microtasks | Macrotasks):**

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
| stack empty → drain micro | a1 end, then | | timeout |
| next macrotask | timeout | | |

**Key ideas:**

1. Calling an async function runs its body **synchronously up to the first await**, so "a1 start" and "a2" print before anything else in the script that follows.
2. \`await\` suspends a1 and queues its continuation as a microtask once the awaited promise is fulfilled (a2's promise already is).
3. The \`new Promise\` **executor is synchronous**; only \`.then\` is deferred.
4. Microtasks run in the order they were queued: "a1 end" was queued before "then".
5. The timer is a macrotask, so it runs after all microtasks, despite its 0 ms delay.

**Why this matters in test code:** when a test calls an async helper without await, the helper's first part runs immediately and the rest runs later, after the test has moved on. That is exactly the shape of a floating-promise bug.`,
      followUps: [
        {
          q: 'What if a2 itself awaited something before logging?',
          a: 'Suppose a2 is async () => { await null; console.log("a2"); }. Then calling a2 queues a2\'s continuation first, a1 awaits a2\'s still-pending promise, the executor and "script end" print, then microtasks run: "a2", which fulfils a2\'s promise and queues "a1 end" behind "then". So the output becomes script start, a1 start, executor, script end, a2, then, a1 end, timeout.',
        },
        {
          q: 'Would the output change in Node vs the browser?',
          a: 'Not for this snippet: both implement promise jobs as microtasks drained before the next macrotask. Differences appear with Node-specific APIs like process.nextTick (which runs before promise microtasks) and setImmediate vs setTimeout(0) ordering in the main module, which can vary. Browser and Node agree on the then/await/setTimeout rules used here.',
        },
      ],
      pitfalls: [
        'Putting "a1 start" after "script end".',
        'Thinking the Promise executor is asynchronous.',
        'Placing "timeout" before the microtasks.',
      ],
    },
  ],
  envelopeQuestions: [
    {
      id: 'js-async-drill-1',
      question:
        'Predict the output line by line: `console.log(\'A\'); setTimeout(() => console.log(\'B\'), 0); Promise.resolve().then(() => console.log(\'C\')); queueMicrotask(() => console.log(\'D\')); console.log(\'E\');`',
      assumptions: [
        'Synchronous code runs first, top to bottom.',
        'Promise reactions and queueMicrotask callbacks are microtasks, queued in call order.',
        'setTimeout callbacks are macrotasks, run after all microtasks.',
      ],
      steps: [
        { label: 'Line 1', calc: 'sync → output: A' },
        { label: 'Line 2', calc: 'setTimeout → Macro: [B]' },
        { label: 'Line 3', calc: 'then on a resolved promise → Micro: [C]' },
        { label: 'Line 4', calc: 'queueMicrotask → Micro: [C, D]' },
        { label: 'Line 5', calc: 'sync → output: A E' },
        { label: 'Drain microtasks', calc: 'output: A E C D' },
        { label: 'Next macrotask', calc: 'output: A E C D B' },
      ],
      answer: '`A`, `E`, `C`, `D`, `B`',
      insight: 'Three columns (output, micro, macro) solve every ordering puzzle. Microtasks keep FIFO order among themselves, and the 0 ms timer still waits for all of them.',
      followUps: [
        {
          q: 'What if the then callback itself scheduled setTimeout(() => console.log("F"), 0)?',
          a: 'When C runs it adds F to the macrotask queue behind B. After D, the loop takes B, drains microtasks (none), then takes F. Output: A E C D B F. A timer scheduled later goes to the back of the line even with the same 0 ms delay.',
        },
      ],
    },
    {
      id: 'js-async-drill-2',
      question:
        'A timer callback schedules its own microtask. Trace the order of five labels: two zero-delay timers are registered (the first logs t1 and queues a promise reaction that logs m-in-t1; the second logs t2), then a resolved-promise reaction logs m1 and registers a third zero-delay timer that logs t3.',
      assumptions: [
        'After every macrotask, all microtasks are drained before the next macrotask.',
        'Timers with equal delay run in the order they were scheduled.',
      ],
      steps: [
        { label: 'Script', calc: 'Macro: [t1, t2]; Micro: [m1]; no sync output' },
        { label: 'Drain micro', calc: 'm1 runs → output m1; schedules t3 → Macro: [t1, t2, t3]' },
        { label: 'Macro t1', calc: 'output t1; queues m-in-t1 → Micro: [m-in-t1]' },
        { label: 'Drain micro', calc: 'output m-in-t1 (before t2!)' },
        { label: 'Macro t2', calc: 'output t2' },
        { label: 'Macro t3', calc: 'output t3' },
      ],
      answer: '`m1`, `t1`, `m-in-t1`, `t2`, `t3`',
      insight: 'A microtask queued inside a timer callback runs immediately after that timer, before the next timer. "One macrotask, then all microtasks" is the whole rule.',
      followUps: [
        {
          q: 'Which would print first if t2 were scheduled with 10 ms and t3 with 0 ms from inside m1?',
          a: 'm1, t1, m-in-t1, then t3 (0 ms, ready almost immediately), then t2 once its 10 ms have elapsed: m1, t1, m-in-t1, t3, t2. Timers run when they are due, in due-time order, so a longer delay can let a later-scheduled timer overtake it.',
        },
      ],
    },
    {
      id: 'js-async-drill-3',
      question:
        'Estimate wall-clock time. A setup script creates 12 users via an API that takes 250 ms per call, then logs in as each user (150 ms per call, needs that user\'s ID). Compare (a) fully sequential, (b) `Promise.all` for all creates, then `Promise.all` for all logins, (c) the same as (b) but in chunks of 4.',
      assumptions: [
        'Each call takes a fixed time and the server handles concurrent calls without slowing down.',
        'Logins for a user can only start after that user exists.',
        'Ignore JavaScript overhead (milliseconds).',
      ],
      steps: [
        { label: '(a) sequential', calc: '12 × 250 + 12 × 150 = 3000 + 1800 = 4800 ms' },
        { label: '(b) parallel phases', calc: 'creates ≈ 250 ms (slowest of 12) + logins ≈ 150 ms = 400 ms' },
        { label: '(c) chunks of 4', calc: '12 / 4 = 3 chunks; creates 3 × 250 = 750 ms, logins 3 × 150 = 450 ms → 1200 ms' },
        { label: 'Better (c)', calc: 'per chunk do create then login for those 4 users: 3 × (250 + 150) = 1200 ms (same total, earlier first ready user)' },
      ],
      answer: '(a) ~4.8 s, (b) ~0.4 s, (c) ~1.2 s. Parallelism gives a 12× speed-up here; chunking trades some speed for a bounded load of at most 4 concurrent requests.',
      insight: 'Sequential await time is the SUM of the calls; Promise.all time is the MAX. Real servers slow down under load, so the real (b) number is higher than 400 ms. Chunking keeps the shared test environment healthy and your results stable.',
      followUps: [
        {
          q: 'How would the numbers change if the server could only process 2 requests at a time?',
          a: 'Requests beyond 2 queue on the server, so (b) behaves like chunks of 2: creates 6 × 250 = 1500 ms, logins 6 × 150 = 900 ms, about 2.4 s. Sending more concurrency than the server can handle does not help and may cause timeouts, which is why measuring the environment before choosing a concurrency limit matters.',
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
        'Synchronous logs run first (1, 4). Then all microtasks run (the promise reaction, 3). Only then does the event loop take the next macrotask, the timer (2). "1 4 2 3" assumes a 0 ms timer runs before promises, which is the most common misconception.',
      followUps: [
        { q: 'Where would code after an await go in this ordering?', a: 'It is a microtask, so it would run in the same group as the then callback (in the order it was queued), after all synchronous code and before the setTimeout callback.' },
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
        'Actions (click), web-first assertions on locators (toBeVisible) and reads (allTextContents) talk to the browser and return promises. Creating a locator is synchronous: it is only a description. expect on a plain number is a generic, synchronous assertion.',
      followUps: [
        { q: 'Is it harmful to write await page.locator(...)?', a: 'It does not break anything, because awaiting a non-promise just returns it, but it shows a misunderstanding and adds noise. Linters such as Biome\'s noPlaywrightUselessAwait or eslint-plugin-playwright flag it.' },
      ],
    },
    {
      id: 'js-async-mcq-03',
      difficulty: 'easy',
      question: 'What does an async function return when its body executes `return 42`?',
      options: ['The number 42', 'A Promise that fulfils with 42', 'undefined until awaited', 'A callback function'],
      correct: [1],
      explanation:
        'An async function always returns a promise. Returning a value fulfils that promise with the value; throwing rejects it. To get 42 itself, the caller must await the call or use .then.',
      followUps: [
        { q: 'What does an async function return if it throws?', a: 'It returns a rejected promise instead of throwing synchronously. The caller sees the error only through await (inside try/catch) or .catch, which is why calling it without either produces an unhandled rejection.' },
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
        'forEach does not await the promises its async callback returns, so all three waits start and console.log runs immediately with an empty array. Later the pushes happen in completion order ([1, 2, 3]), but nobody logs it. [3, 1, 2] is what a for...of + await loop would produce.',
      followUps: [
        { q: 'Which change makes it log [3, 1, 2]?', a: 'Use for (const n of [3, 1, 2]) { await wait(n * 10); done.push(n); } before the log. Promise.all over map would also log [3, 1, 2] if you return n from each callback and use the returned array, because Promise.all preserves input order.' },
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
        'Promise.all runs the independent calls in parallel and rejects on the first failure. The for...of loop is correct but sequential (about three times slower). forEach does not wait at all and hides failures. race settles as soon as ONE call finishes, leaving the others unchecked.',
      followUps: [
        { q: 'What if you need a report of every failure instead of stopping at the first?', a: 'Use Promise.allSettled and then filter the results with status "rejected". It never rejects, so you see every outcome and can fail with a message listing all the failed users.' },
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
        'all keeps input order regardless of completion order. race adopts the outcome of the first promise to settle, success or failure. any ignores rejections until one fulfils and only rejects (with AggregateError.errors) when all fail. allSettled never rejects; it reports each outcome.',
      followUps: [
        { q: 'What does Promise.all([]) return?', a: 'A promise that fulfils immediately with an empty array. In a test that builds the array from scraped data, that means "nothing to check" silently passes, so guard the length first.' },
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
        'Without await the try block finishes as soon as createBooking returns its pending promise, so the catch can never see the later rejection. setup resolves successfully, and the rejected promise has no handler: an unhandled rejection that can crash Node or fail an unrelated test. Adding await makes the catch work.',
      followUps: [
        { q: 'What is the fix if setup should fail when the API fails?', a: 'Simply await createBooking() without try/catch, or catch, add context and rethrow: catch (e) { throw new Error("setup failed", { cause: e }); }. Logging and continuing would hide the failure.' },
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
        'Only the first then of each chain is queued during the script (x1, y1). Running x1 fulfils its promise and queues x2 at the end of the microtask queue, behind y1. So the chains interleave: x1, y1, x2, y2. "x1 x2 y1 y2" assumes a whole chain runs at once.',
      followUps: [
        { q: 'Why does this interleaving matter in real code?', a: 'Two independent async flows advance step by step in turn, so shared state (a global counter, a shared array of test data) can be read and modified by both between steps. That is a race condition even on a single thread, and why tests should not share mutable state.' },
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
        'Both correct options start listening before the click, so even a very fast response is captured. Option 1 starts listening only after the click completes, so the response may already have arrived and the wait times out. The fixed sleep does not capture the response at all and only adds time.',
      followUps: [
        { q: 'How do you avoid matching the wrong request?', a: 'Pass a predicate instead of a glob, for example (r) => r.url().endsWith("/api/save") && r.request().method() === "POST" && r.ok(). This avoids catching an earlier GET or a preflight request on the same URL.' },
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
        'expect(locator).toBeVisible() is async and retries up to the expect timeout. Without await, the test body returns immediately, Playwright treats the test as finished and tears the page down, so the failure is never attributed to the test. The floating-promise lint rule catches it. toBeVisible is not synchronous and does not always pass.',
      followUps: [
        { q: 'How do you check that a new test can actually fail?', a: 'Temporarily break it: change the expected text, or point it at a state where the condition is false, and confirm it goes red with a clear message. If it stays green, the test is not checking what you think.' },
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
        'm1 is a microtask from the script, so it runs before any timer. After the t1 timer runs, the event loop drains microtasks again, so m-in-t1 runs before the t2 timer. "m1 t1 t2 m-in-t1" wrongly assumes all timers run before any newly queued microtask.',
      followUps: [
        { q: 'What is the general rule this demonstrates?', a: 'After each single macrotask (one timer callback, one event), all microtasks are drained before the next macrotask. Timers never run back to back if microtasks are queued between them.' },
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
        'An async executor inside new Promise hides errors: if fetchToken rejects, the outer promise never settles. filter with an async predicate keeps every item because a Promise is truthy. Promise.all over map is a correct parallel pattern, and awaiting an API call then asserting on the response is ordinary, correct test code.',
      followUps: [
        { q: 'How do you correctly filter with an async check?', a: 'First compute the results: const flags = await Promise.all(items.map(isActive)); then filter synchronously: items.filter((_, i) => flags[i]). Or loop with for...of and await, pushing matching items into a new array.' },
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
        'In a, the rejected promise is returned without being awaited inside try, so the try/catch is already finished when it rejects; a adopts the rejection. In b, return await makes the rejection throw inside try, so the catch returns "caught". This is why "return await" inside try blocks is recommended.',
      followUps: [
        { q: 'Outside a try block, is return await still useful?', a: 'Functionally the result is the same, but return await keeps the async function in the stack trace, which can make errors easier to trace. Many style guides now prefer return await consistently for that reason; inside try/catch it is required for correct behaviour.' },
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
        'Sequential awaits add up (300 + 100 + 200 = 600 ms). Promise.all waits for the slowest (about 300 ms). race settles with the fastest (about 100 ms). Promise.all results follow INPUT order, not finish order, so the third statement is false.',
      followUps: [
        { q: 'Why might the real parallel time be more than 300 ms?', a: 'The server, network or rate limiter may handle concurrent requests more slowly than isolated ones, and Node limits sockets per host in some setups. Estimates assume independent calls; measure in the real environment before tuning concurrency.' },
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
        'Calling f runs it synchronously until the await, so f1 prints right after s. The rest of f (f2) is queued as a microtask, then e prints. f2 was queued before the then callback, so it runs first; the timer runs last. Option 1 forgets that await always yields, even for null.',
      followUps: [
        { q: 'What would change if the caller wrote await f() instead of f()?', a: 'The caller would pause until f finished, so e would print after f2: s, f1, f2, e. The timer and the then callback are then scheduled after that point, giving then before t at the end.' },
      ],
    },
    {
      id: 'js-async-mcq-16',
      difficulty: 'hard',
      question: 'A health-check script must report the status of 5 services and never stop at the first failure. Which combinator fits best?',
      options: ['Promise.all', 'Promise.allSettled', 'Promise.race', 'Promise.any'],
      correct: [1],
      explanation:
        'allSettled waits for every promise and returns a status/value or status/reason object for each, so you can report all healthy and unhealthy services. all stops at the first rejection, race reports only the first to settle, and any reports only the first success.',
      followUps: [
        { q: 'How would you make the script exit non-zero if any service is down?', a: 'After allSettled, filter the rejected results; if there are any, print them and set process.exitCode = 1 (or throw an Error listing them). CI then marks the step failed while the log still shows every failing service.' },
      ],
    },
  ],
};

export default topic;
