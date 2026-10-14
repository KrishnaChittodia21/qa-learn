import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-async-retry',
    category: 'async',
    difficulty: 'medium',
    title: 'Retry a flaky async operation',
    prompt: `Flaky operations (a slow API, a login that sometimes fails) are everyday life in automation. Write \`retry(failTimes, maxAttempts)\`.

Inside your function, build a fake operation that **rejects** on its first \`failTimes\` calls and then resolves \`'ok'\`. Call it up to \`maxAttempts\` times and resolve to:
- \`{ result: 'ok', attempts: k }\` if attempt \`k\` succeeded, or
- \`{ result: 'failed', attempts: maxAttempts }\` if every attempt failed.

**Example 1**
\`\`\`
await retry(2, 3)  // { result: 'ok', attempts: 3 }
\`\`\`
**Example 2**
\`\`\`
await retry(3, 3)  // { result: 'failed', attempts: 3 }
\`\`\`

**Constraints**
- The function must be \`async\` (or return a Promise).
- \`maxAttempts >= 0\`.`,
    fnName: 'retry',
    starter: `/**
 * @param {number} failTimes   how many calls the fake operation fails before succeeding
 * @param {number} maxAttempts how many attempts you are allowed
 * @returns {Promise<{ result: 'ok' | 'failed', attempts: number }>}
 */
async function retry(failTimes, maxAttempts) {
  // your code
}`,
    tests: [
      { args: [2, 3], expected: { result: 'ok', attempts: 3 } },
      { args: [3, 3], expected: { result: 'failed', attempts: 3 } },
      { args: [0, 3], expected: { result: 'ok', attempts: 1 } },
      { args: [1, 1], expected: { result: 'failed', attempts: 1 } },
      { args: [0, 0], expected: { result: 'failed', attempts: 0 } },
      { args: [5, 10], expected: { result: 'ok', attempts: 6 }, hidden: true },
      { args: [4, 2], expected: { result: 'failed', attempts: 2 }, hidden: true },
    ],
    hints: [
      'The fake: keep a `calls` counter; return `Promise.reject(...)` while `calls <= failTimes`, else `Promise.resolve("ok")`.',
      'Loop attempts 1..maxAttempts with `try { await op() } catch {}`.',
      'Return as soon as one attempt succeeds.',
    ],
    solution: `async function retry(failTimes, maxAttempts) {
  let calls = 0;
  const op = function () {
    calls++;
    return calls <= failTimes ? Promise.reject(new Error('fail #' + calls)) : Promise.resolve('ok');
  };
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await op();
      return { result, attempts: attempt };
    } catch (e) {
      // swallow and try again
    }
  }
  return { result: 'failed', attempts: maxAttempts };
}`,
    explanation: `**Approach:** a \`for\` loop with \`try/await/catch\`. \`await\` turns a rejection into a thrown error, so \`catch\` decides whether to retry.

**Complexity:** O(maxAttempts) calls.

**Alternative:** a recursive promise chain, \`op().catch(() => attemptsLeft > 1 ? retryFn(attemptsLeft - 1) : Promise.reject(e))\`. Real retry helpers add a **backoff** delay between attempts (e.g. 100ms, 200ms, 400ms) and only retry on retriable errors.

**Say aloud:** "In Playwright you rarely hand-roll this. Web-first assertions auto-retry, \`expect.poll\` and \`expect().toPass()\` retry blocks, and \`retries\` in config re-runs tests. Retries can also hide real bugs, so I'd track flaky tests rather than just retrying them."`,
    followUps: [
      { q: 'Why add exponential backoff between retries?', a: 'Immediate retries can hammer a struggling service. Waiting longer each time gives it time to recover and avoids synchronised retry storms.' },
      { q: 'What is the Playwright equivalent?', a: 'expect(async () => { ... }).toPass({ intervals: [1000, 2000] }) or expect.poll(fn) retries until the assertion passes or times out.' },
    ],
  },
  {
    id: 'code-async-sequential',
    category: 'async',
    difficulty: 'medium',
    title: 'Run async tasks sequentially',
    prompt: `Write \`runSequentially(delays)\`. For each index \`i\`, create a task that logs \`'start i'\`, waits \`delays[i]\` ms, then logs \`'end i'\`. Run the tasks **one after another** (not in parallel) and resolve to the log array.

**Example 1**
\`\`\`
await runSequentially([20, 5])
// ['start 0', 'end 0', 'start 1', 'end 1']
// (in parallel you would get ['start 0', 'start 1', 'end 1', 'end 0'])
\`\`\`
**Example 2**
\`\`\`
await runSequentially([])  // []
\`\`\`

**Constraints**
- \`delays[i] <= 30\`.
- Build the sleep helper yourself with \`setTimeout\`.`,
    fnName: 'runSequentially',
    starter: `/**
 * @param {number[]} delays  ms each task should take
 * @returns {Promise<string[]>} the log of start/end events
 */
async function runSequentially(delays) {
  // your code
}`,
    tests: [
      { args: [[20, 5]], expected: ['start 0', 'end 0', 'start 1', 'end 1'] },
      { args: [[]], expected: [] },
      { args: [[0]], expected: ['start 0', 'end 0'] },
      { args: [[10, 0, 5]], expected: ['start 0', 'end 0', 'start 1', 'end 1', 'start 2', 'end 2'] },
      { args: [[0, 0]], expected: ['start 0', 'end 0', 'start 1', 'end 1'] },
      { args: [[15, 10, 5, 0]], expected: ['start 0', 'end 0', 'start 1', 'end 1', 'start 2', 'end 2', 'start 3', 'end 3'], hidden: true },
      { args: [[30, 1]], expected: ['start 0', 'end 0', 'start 1', 'end 1'], hidden: true },
    ],
    hints: [
      '`const sleep = ms => new Promise(r => setTimeout(r, ms));`',
      'A plain `for` loop with `await` inside runs one at a time.',
      '`delays.forEach(async ...)` does NOT wait. Avoid it here.',
    ],
    solution: `async function runSequentially(delays) {
  const log = [];
  const sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  for (let i = 0; i < delays.length; i++) {
    log.push('start ' + i);
    await sleep(delays[i]);
    log.push('end ' + i);
  }
  return log;
}`,
    explanation: `**Approach:** \`for\` + \`await\`. Each iteration pauses until its sleep resolves, so task i+1 starts only after task i ends.

**Complexity:** total time is the **sum** of the delays. \`Promise.all\` would take the **max**.

**Alternative:** \`delays.reduce((chain, ms, i) => chain.then(() => task(i, ms)), Promise.resolve())\`. Same behaviour, but written as a promise chain. **Trap:** \`forEach(async ...)\` fires all callbacks without waiting, so it runs in parallel and returns immediately.

**Say aloud:** "Sequential when order or shared state matters, like creating a user then logging in. Parallel with Promise.all when tasks are independent. And never forEach with async."`,
    followUps: [
      { q: 'Why does forEach with an async callback not wait?', a: 'forEach ignores the callback return value, so the returned promises are never awaited and the loop finishes immediately.' },
    ],
  },
  {
    id: 'code-async-promise-all',
    category: 'async',
    difficulty: 'hard',
    title: 'Implement Promise.all yourself',
    prompt: `Write \`promiseAll(values, delays)\`. For each index \`i\`, build a promise that after \`delays[i]\` ms **resolves** \`values[i]\`, or **rejects** with \`'item i failed'\` if \`values[i]\` is \`null\`.

Combine them **without using \`Promise.all\`/\`allSettled\`**. Resolve to the array of values **in input order**. If any promise rejects, resolve to \`'rejected: <reason>'\` for the first rejection.

**Example 1**
\`\`\`
await promiseAll([1, 2, 3], [30, 10, 20])  // [1, 2, 3]   (order by index, not by finish time)
\`\`\`
**Example 2**
\`\`\`
await promiseAll([1, null, 3], [5, 10, 20])  // 'rejected: item 1 failed'
\`\`\`

**Constraints**
- Delays are ≤ 30 ms; an empty input resolves to \`[]\`.`,
    fnName: 'promiseAll',
    starter: `/**
 * @param {any[]} values   null means "this one rejects"
 * @param {number[]} delays
 * @returns {Promise<any[] | string>}
 */
function promiseAll(values, delays) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3], [30, 10, 20]], expected: [1, 2, 3] },
      { args: [[1, null, 3], [5, 10, 20]], expected: 'rejected: item 1 failed' },
      { args: [[], []], expected: [] },
      { args: [['a'], [0]], expected: ['a'] },
      { args: [[0, false, ''], [3, 2, 1]], expected: [0, false, ''] },
      { args: [[null, null], [25, 5]], expected: 'rejected: item 1 failed', hidden: true },
      { args: [['x', 'y'], [0, 0]], expected: ['x', 'y'], hidden: true },
      { args: [[{ id: 1 }, [2]], [10, 0]], expected: [{ id: 1 }, [2]], hidden: true },
    ],
    hints: [
      'Return a `new Promise((resolve, reject) => ...)`.',
      'Store each result at `results[i]` (not push), and count how many have finished.',
      'Resolve when the count reaches the length; reject on the first failure. Handle the empty case up front.',
    ],
    solution: `function promiseAll(values, delays) {
  const tasks = values.map(function (v, i) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (v === null) reject('item ' + i + ' failed');
        else resolve(v);
      }, delays[i]);
    });
  });

  function all(promises) {
    return new Promise(function (resolve, reject) {
      const results = new Array(promises.length);
      let remaining = promises.length;
      if (remaining === 0) {
        resolve([]);
        return;
      }
      promises.forEach(function (p, i) {
        Promise.resolve(p).then(function (val) {
          results[i] = val;
          remaining--;
          if (remaining === 0) resolve(results);
        }, reject);
      });
    });
  }

  return all(tasks).then(
    function (r) { return r; },
    function (reason) { return 'rejected: ' + reason; }
  );
}`,
    explanation: `**Approach:** wrap everything in one outer promise. Each input's \`.then\` writes into \`results[i]\` (so order follows the **index**, not completion time) and decrements a counter. When it hits 0, resolve. Any rejection calls the outer \`reject\`. Later calls are ignored because a promise settles only once.

**Complexity:** O(n) bookkeeping. Wall-clock time is the slowest task (they run concurrently).

**Built-ins to compare:** \`Promise.all\` (fail fast), \`Promise.allSettled\` (never rejects, gives \`{status, value|reason}\` each), \`Promise.race\` (first to settle), \`Promise.any\` (first to fulfil).

**Say aloud:** "The key details are index-based assignment, the empty-array case, and that falsy values like 0 still count. In Playwright, \`Promise.all([page.waitForResponse(...), click()])\` is how you avoid missing a fast response."`,
    followUps: [
      { q: 'Why is Promise.all([page.waitForResponse(url), button.click()]) a common Playwright pattern?', a: 'It starts listening before the click triggers the request, so a fast response is not missed, as it could be if you awaited the click first.' },
      { q: 'When would you prefer Promise.allSettled?', a: 'When you need every outcome even if some fail, e.g. cleaning up several test users and reporting which deletions failed.' },
    ],
  },
  {
    id: 'code-async-timeout',
    category: 'async',
    difficulty: 'medium',
    title: 'Timeout wrapper',
    prompt: `Write \`withTimeout(workMs, timeoutMs)\`. Build a fake job that resolves \`'done'\` after \`workMs\`. Race it against a timer: resolve \`'done'\` if the job wins, or \`'timeout'\` if \`timeoutMs\` elapses first. Clear the losing timer.

**Example 1**
\`\`\`
await withTimeout(5, 30)  // 'done'
\`\`\`
**Example 2**
\`\`\`
await withTimeout(30, 5)  // 'timeout'
\`\`\`

**Constraints**
- All values ≤ 30 ms; tests never use equal times.`,
    fnName: 'withTimeout',
    starter: `/**
 * @param {number} workMs     how long the fake job takes
 * @param {number} timeoutMs  how long you are willing to wait
 * @returns {Promise<'done' | 'timeout'>}
 */
function withTimeout(workMs, timeoutMs) {
  // your code
}`,
    tests: [
      { args: [5, 30], expected: 'done' },
      { args: [30, 5], expected: 'timeout' },
      { args: [0, 20], expected: 'done' },
      { args: [25, 10], expected: 'timeout' },
      { args: [10, 30], expected: 'done' },
      { args: [30, 0], expected: 'timeout', hidden: true },
      { args: [1, 25], expected: 'done', hidden: true },
    ],
    hints: [
      'Create two promises: the job and a timer that resolves "timeout".',
      '`Promise.race([job, timer])` settles with whichever finishes first.',
      'Keep the timer id and `clearTimeout` it afterwards so it does not keep running.',
    ],
    solution: `function withTimeout(workMs, timeoutMs) {
  let workId;
  let timerId;
  const job = new Promise(function (resolve) {
    workId = setTimeout(function () { resolve('done'); }, workMs);
  });
  const timer = new Promise(function (resolve) {
    timerId = setTimeout(function () { resolve('timeout'); }, timeoutMs);
  });
  return Promise.race([job, timer]).then(function (winner) {
    clearTimeout(workId);
    clearTimeout(timerId);
    return winner;
  });
}`,
    explanation: `**Approach:** \`Promise.race\` between the job and a timer promise, then clear both timers so nothing lingers.

**Complexity:** O(1). Wall time is \`min(workMs, timeoutMs)\`.

**Without race:** a single \`new Promise\` whose resolve is called by whichever \`setTimeout\` fires first. Later calls are no-ops because a promise settles once. A production version usually **rejects** with a TimeoutError instead of resolving a string, and an \`AbortController\` cancels the real work.

**Say aloud:** "Racing doesn't cancel the slow job; it just stops waiting for it. Playwright has this built in: every action and assertion takes a \`timeout\` option, and test.setTimeout sets the overall budget."`,
    followUps: [
      { q: 'Does Promise.race cancel the losing promise?', a: 'No. The losing work keeps running, and race only ignores its result. Use AbortController or clearTimeout to actually stop it.' },
    ],
  },
  {
    id: 'code-async-sleep-sort',
    category: 'async',
    difficulty: 'medium',
    title: 'Timer ordering ("sleep sort")',
    prompt: `Write \`sleepSort(nums)\` that, for each number \`n\`, schedules \`setTimeout\` for \`n\` ms that pushes \`n\` into a result array. Resolve with the array once **all** timers have fired. The output comes out sorted, which demonstrates how the event loop orders timers.

**Example 1**
\`\`\`
await sleepSort([30, 10, 20])  // [10, 20, 30]
\`\`\`
**Example 2**
\`\`\`
await sleepSort([])  // []
\`\`\`

**Constraints**
- Values are distinct, \`0..30\`, and at least 5 apart (so timer jitter cannot swap them).`,
    fnName: 'sleepSort',
    starter: `/**
 * @param {number[]} nums  distinct delays in ms (0-30)
 * @returns {Promise<number[]>}
 */
function sleepSort(nums) {
  // your code
}`,
    tests: [
      { args: [[30, 10, 20]], expected: [10, 20, 30] },
      { args: [[]], expected: [] },
      { args: [[5]], expected: [5] },
      { args: [[25, 0, 15]], expected: [0, 15, 25] },
      { args: [[20, 10, 0, 30]], expected: [0, 10, 20, 30] },
      { args: [[0, 5, 10]], expected: [0, 5, 10], hidden: true },
      { args: [[30, 25, 20, 15, 10]], expected: [10, 15, 20, 25, 30], hidden: true },
    ],
    hints: [
      'Return `new Promise(resolve => ...)`.',
      'In each timer callback, push the number and check whether `out.length === nums.length`.',
      'Resolve immediately for an empty array, or you will wait forever.',
    ],
    solution: `function sleepSort(nums) {
  return new Promise(function (resolve) {
    const out = [];
    if (nums.length === 0) {
      resolve(out);
      return;
    }
    for (const n of nums) {
      setTimeout(function () {
        out.push(n);
        if (out.length === nums.length) resolve(out);
      }, n);
    }
  });
}`,
    explanation: `**Approach:** schedule one timer per value. The event loop runs expired timers in order of their due time, so smaller delays push first. A counter (the output length) tells you when the last one fired.

**Complexity:** O(n) work, but wall time is the **largest** value. It's a joke "sorting algorithm", and it breaks for close values (timer jitter), negatives or large numbers.

**Alternative:** \`Promise.all(nums.map(n => sleep(n).then(() => out.push(n)))).then(() => out)\`.

**Say aloud:** "The point is the event loop. Synchronous code runs first, then microtasks (promise callbacks), then timers in due-time order. This is also why \`waitForTimeout\` in tests is fragile, and why I prefer waiting for real conditions."`,
    followUps: [
      { q: 'In what order do console.log, Promise.resolve().then and setTimeout(0) callbacks run?', a: 'Synchronous code first, then all microtasks (promise .then callbacks), and only then the setTimeout(0) macrotask.' },
      { q: 'Why is page.waitForTimeout discouraged in Playwright tests?', a: 'Fixed sleeps are either too short (flaky) or too long (slow). Waiting for a locator, response or assertion reacts to the real state.' },
    ],
  },
];
