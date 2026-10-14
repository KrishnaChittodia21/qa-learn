import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-qa-utils-valid-email',
    category: 'qa-utils',
    difficulty: 'medium',
    title: 'Validate an email format',
    prompt: `Write \`isValidEmail(email)\` that returns \`true\` for a **reasonable** email format:
- a local part of letters, digits and \`. _ % + -\`, which does not start or end with \`.\` and has no \`..\`
- exactly one \`@\`
- a domain of dot-separated labels (letters, digits, \`-\`) ending in a TLD of 2+ letters

**Example 1**
\`\`\`
isValidEmail('test.user+qa@mail.example.com')  // true
\`\`\`
**Example 2**
\`\`\`
isValidEmail('a@b')  // false   (no TLD)
\`\`\`

**Constraints**
- This is a format check for test data, not full RFC 5322.`,
    fnName: 'isValidEmail',
    starter: `/**
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  // your code
}`,
    tests: [
      { args: ['test.user+qa@mail.example.com'], expected: true },
      { args: ['a@b'], expected: false },
      { args: ['a@b.co'], expected: true },
      { args: ['no-at.example.com'], expected: false },
      { args: [''], expected: false },
      { args: ['a@@b.com'], expected: false },
      { args: ['a b@c.com'], expected: false },
      { args: ['.a@b.com'], expected: false, hidden: true },
      { args: ['a..b@c.com'], expected: false, hidden: true },
      { args: ['QA_Lead-1@sub.domain.io'], expected: true, hidden: true },
    ],
    hints: [
      'A regex is the usual tool: anchor it with `^` and `$`.',
      'Local part: one or more "chunks" separated by single dots, `[A-Za-z0-9_%+-]+(\\.[A-Za-z0-9_%+-]+)*`.',
      'Domain: labels separated by dots, then `\\.[A-Za-z]{2,}$`.',
    ],
    solution: `function isValidEmail(email) {
  const re = /^[A-Za-z0-9_%+-]+(\\.[A-Za-z0-9_%+-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}$/;
  return typeof email === 'string' && re.test(email);
}`,
    explanation: `**Approach:** one anchored regex. Writing the local part as "chunks separated by single dots" rules out leading, trailing and double dots without lookaheads.

**Complexity:** O(n) for the regex match.

**Without regex:** split on \`@\` (expect exactly 2 parts), split the domain on \`.\` (≥ 2 labels, last label ≥ 2 letters), and check each character against an allowed set. It's more code but easier to explain line by line.

**Say aloud:** "As a tester I care more about the **test data** than a perfect regex: valid, missing @, double @, spaces, no TLD, leading dot, double dot, plus-addressing and subdomains. Real validation is ultimately done by sending a confirmation email."`,
    followUps: [
      { q: 'Why not use a full RFC 5322 regex?', a: 'It is enormous and still accepts addresses most apps reject. Product rules and a confirmation email matter more than perfect syntax.' },
      { q: 'What negative test cases would you write for an email field?', a: 'Missing @, two @s, no domain, no TLD, spaces, leading or trailing dots, consecutive dots, over-long input and script injection strings.' },
    ],
  },
  {
    id: 'code-qa-utils-prices-sorted',
    category: 'qa-utils',
    difficulty: 'easy',
    title: 'Verify prices are sorted (asc/desc)',
    prompt: `On SauceDemo you choose "Price (low to high)" and must verify the list. Write \`isSortedPrices(prices, order)\` where \`order\` is \`'asc'\` or \`'desc'\`. Equal neighbours are allowed.

**Example 1**
\`\`\`
isSortedPrices([7.99, 9.99, 15.99, 15.99, 29.99, 49.99], 'asc')  // true
\`\`\`
**Example 2**
\`\`\`
isSortedPrices([49.99, 9.99, 29.99], 'desc')  // false
\`\`\`

**Constraints**
- Empty or single-item lists are sorted.`,
    fnName: 'isSortedPrices',
    starter: `/**
 * @param {number[]} prices
 * @param {'asc' | 'desc'} order
 * @returns {boolean}
 */
function isSortedPrices(prices, order) {
  // your code
}`,
    tests: [
      { args: [[7.99, 9.99, 15.99, 15.99, 29.99, 49.99], 'asc'], expected: true },
      { args: [[49.99, 9.99, 29.99], 'desc'], expected: false },
      { args: [[49.99, 29.99, 15.99, 15.99, 9.99, 7.99], 'desc'], expected: true },
      { args: [[], 'asc'], expected: true },
      { args: [[5], 'desc'], expected: true },
      { args: [[9.99, 7.99], 'asc'], expected: false, hidden: true },
      { args: [[2, 10, 100], 'asc'], expected: true, hidden: true },
      { args: [[1, 2], 'desc'], expected: false, hidden: true },
    ],
    hints: [
      'Compare each price with the next one.',
      'For "asc" fail when `prev > next`; for "desc" fail when `prev < next`.',
    ],
    solution: `function isSortedPrices(prices, order) {
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    const cur = prices[i];
    if (order === 'asc' && prev > cur) return false;
    if (order === 'desc' && prev < cur) return false;
  }
  return true;
}`,
    explanation: `**Approach:** adjacent-pair comparison with the direction as a parameter.

**Complexity:** O(n) time, O(1) space.

**Alternative:** \`const expected = [...prices].sort((a, b) => order === 'asc' ? a - b : b - a); expect(prices).toEqual(expected);\`. It gives a nicer diff on failure. Forgetting the comparator sorts \`[2, 10, 100]\` as strings and breaks the check.

**In Playwright:** \`const prices = (await page.locator('.inventory_item_price').allTextContents()).map(t => parseFloat(t.replace('$', '')));\`, then assert with either approach.

**Say aloud:** "Copy before sorting, because sort mutates. And compare numbers, not the '$29.99' strings."`,
    followUps: [
      { q: 'How would you verify a name sort (A to Z) on SauceDemo?', a: 'Grab allTextContents() of the item names and compare with a copy sorted by (a, b) => a.localeCompare(b).' },
    ],
  },
  {
    id: 'code-qa-utils-cart-total',
    category: 'qa-utils',
    difficulty: 'medium',
    title: 'Parse "$29.99" prices and sum the cart',
    prompt: `Write \`cartTotal(priceTexts)\` that takes the price **texts** as read from the page (e.g. \`'$29.99'\`, \`'Price: $9.99'\`, \`' $ 15.99 '\`), extracts the number from each, and returns the total **rounded to 2 decimals**. Texts with no number count as 0.

**Example 1**
\`\`\`
cartTotal(['$29.99', '$9.99'])  // 39.98
\`\`\`
**Example 2**
\`\`\`
cartTotal(['$0.10', '$0.20'])  // 0.3   (not 0.30000000000000004)
\`\`\`

**Constraints**
- Prices are non-negative; thousands separators like \`1,299.00\` may appear.`,
    fnName: 'cartTotal',
    starter: `/**
 * @param {string[]} priceTexts
 * @returns {number}
 */
function cartTotal(priceTexts) {
  // your code
}`,
    tests: [
      { args: [['$29.99', '$9.99']], expected: 39.98 },
      { args: [['$0.10', '$0.20']], expected: 0.3 },
      { args: [[]], expected: 0 },
      { args: [['Price: $9.99']], expected: 9.99 },
      { args: [[' $ 15.99 ', '$7.99']], expected: 23.98 },
      { args: [['$1,299.00', '$0.99']], expected: 1299.99, hidden: true },
      { args: [['Free', '$5']], expected: 5, hidden: true },
      { args: [['$29.99', '$9.99', '$15.99', '$49.99', '$7.99', '$15.99']], expected: 129.94, hidden: true },
    ],
    hints: [
      'Remove everything except digits and the dot: `text.replace(/[^0-9.]/g, "")`.',
      '`parseFloat("")` is NaN, so treat that as 0.',
      'Add in **cents** (Math.round(x * 100)) to avoid floating-point drift, then divide by 100.',
    ],
    solution: `function cartTotal(priceTexts) {
  let cents = 0;
  for (const text of priceTexts) {
    const n = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(n)) cents += Math.round(n * 100);
  }
  return cents / 100;
}`,
    explanation: `**Approach:** strip non-numeric characters (\`$\`, labels, spaces, commas), parse, convert to **integer cents**, sum, then divide by 100 once.

**Why cents:** binary floating point can't represent 0.1 exactly, so \`0.1 + 0.2 === 0.30000000000000004\`. Summing integers avoids that drift.

**Complexity:** O(n · L) for n texts of length L.

**Alternative:** sum floats and round at the end with \`Math.round(sum * 100) / 100\`, or \`Number(sum.toFixed(2))\`. That's usually fine for small carts, but cents is the robust habit.

**Say aloud:** "On SauceDemo I'd sum item prices from the cart and assert they equal the 'Item total' on the checkout overview. Then I'd check that tax plus item total equals the total."`,
    followUps: [
      { q: 'Why does 0.1 + 0.2 !== 0.3 in JavaScript?', a: 'Numbers are IEEE-754 binary doubles, and 0.1 and 0.2 have no exact binary form, so tiny rounding errors appear.' },
      { q: 'How would you compare money values in an assertion?', a: 'Compare integer cents, or use expect(actual).toBeCloseTo(expected, 2), which allows a tiny floating-point difference.' },
    ],
  },
  {
    id: 'code-qa-utils-compare-lists',
    category: 'qa-utils',
    difficulty: 'easy',
    title: 'Compare expected vs actual lists',
    prompt: `Write \`compareLists(expected, actual)\` returning \`{ missing, extra }\`: \`missing\` holds items in \`expected\` but not in \`actual\`, and \`extra\` holds items in \`actual\` but not in \`expected\`. Keep the original order and don't repeat items. This gives a clear failure message instead of "arrays differ".

**Example 1**
\`\`\`
compareLists(['Home', 'Cart', 'Logout'], ['Home', 'Logout', 'About'])
// { missing: ['Cart'], extra: ['About'] }
\`\`\`
**Example 2**
\`\`\`
compareLists(['a'], ['a'])  // { missing: [], extra: [] }
\`\`\`

**Constraints**
- Comparison is exact (case-sensitive).`,
    fnName: 'compareLists',
    starter: `/**
 * @param {string[]} expected
 * @param {string[]} actual
 * @returns {{ missing: string[], extra: string[] }}
 */
function compareLists(expected, actual) {
  // your code
}`,
    tests: [
      { args: [['Home', 'Cart', 'Logout'], ['Home', 'Logout', 'About']], expected: { missing: ['Cart'], extra: ['About'] } },
      { args: [['a'], ['a']], expected: { missing: [], extra: [] } },
      { args: [[], []], expected: { missing: [], extra: [] } },
      { args: [['a', 'b'], []], expected: { missing: ['a', 'b'], extra: [] } },
      { args: [[], ['x']], expected: { missing: [], extra: ['x'] } },
      { args: [['Login'], ['login']], expected: { missing: ['Login'], extra: ['login'] }, hidden: true },
      { args: [['a', 'a', 'b'], ['c', 'c']], expected: { missing: ['a', 'b'], extra: ['c'] }, hidden: true },
    ],
    hints: [
      'Build a Set for each list.',
      'Filter `expected` by "not in actual set" and vice versa.',
      'Dedupe the results (another Set, or track what you added).',
    ],
    solution: `function compareLists(expected, actual) {
  const exp = new Set(expected);
  const act = new Set(actual);
  const missing = [...exp].filter(function (x) { return !act.has(x); });
  const extra = [...act].filter(function (x) { return !exp.has(x); });
  return { missing, extra };
}`,
    explanation: `**Approach:** the set difference both ways. Converting to Sets first dedupes and gives O(1) lookups, and spreading a Set keeps first-seen order.

**Complexity:** O(n + m) time and space.

**Without Set:** \`expected.filter(x => !actual.includes(x))\`, then dedupe. That's O(n·m), fine for short menu lists.

**Say aloud:** "In a test I'd assert \`expect(diff).toEqual({ missing: [], extra: [] })\`, because the failure output then names exactly what's wrong. If counts matter (duplicates), I'd compare frequency maps instead."`,
    followUps: [
      { q: 'How would you also detect wrong order when the items are the same?', a: 'If missing and extra are both empty, compare position by position and report the first index where expected[i] !== actual[i].' },
    ],
  },
  {
    id: 'code-qa-utils-mask-card',
    category: 'qa-utils',
    difficulty: 'easy',
    title: 'Mask a credit-card number',
    prompt: `Write \`maskCard(card)\` that removes spaces and dashes, then replaces every digit except the **last 4** with \`*\`. If there are 4 or fewer digits, return them unmasked. Use it to keep card numbers out of logs and reports.

**Example 1**
\`\`\`
maskCard('4111 1111 1111 1234')  // '************1234'
\`\`\`
**Example 2**
\`\`\`
maskCard('3782-822463-10005')  // '***********0005'
\`\`\`

**Constraints**
- Input contains only digits, spaces and dashes.`,
    fnName: 'maskCard',
    starter: `/**
 * @param {string} card
 * @returns {string}
 */
function maskCard(card) {
  // your code
}`,
    tests: [
      { args: ['4111 1111 1111 1234'], expected: '************1234' },
      { args: ['3782-822463-10005'], expected: '***********0005' },
      { args: [''], expected: '' },
      { args: ['1234'], expected: '1234' },
      { args: ['12'], expected: '12' },
      { args: ['12345'], expected: '*2345', hidden: true },
      { args: ['5555555555554444'], expected: '************4444', hidden: true },
    ],
    hints: [
      'Clean first: `card.replace(/[ -]/g, "")`.',
      '`"*".repeat(len - 4) + digits.slice(-4)`. Guard the short case.',
    ],
    solution: `function maskCard(card) {
  const digits = card.replace(/[ -]/g, '');
  if (digits.length <= 4) return digits;
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}`,
    explanation: `**Approach:** normalise, then build the mask with \`repeat\` and keep the last 4 with \`slice(-4)\`.

**Complexity:** O(n).

**Alternatives:** \`digits.slice(0, -4).replace(/\\d/g, '*') + digits.slice(-4)\`, or \`String.prototype.padStart\`: \`digits.slice(-4).padStart(digits.length, '*')\`.

**Say aloud:** "\`'*'.repeat(-1)\` throws a RangeError, so the short-input guard isn't optional. In real suites, mask secrets in logs, traces and screenshots, and use test card numbers like 4111 1111 1111 1111, never real ones."`,
    followUps: [
      { q: 'What happens if you call "*".repeat(-1)?', a: 'It throws a RangeError (invalid count value), which is why inputs with four or fewer digits need an explicit guard.' },
    ],
  },
  {
    id: 'code-qa-utils-unique-username',
    category: 'qa-utils',
    difficulty: 'easy',
    title: 'Generate a unique test username',
    prompt: `Tests that create users must not collide. Write \`nextUsername(prefix, existing)\`. Normalise the prefix (trim, lowercase, spaces → \`_\`), then return \`prefix_N\` with the **smallest** \`N >= 1\` that is not already in \`existing\`.

**Example 1**
\`\`\`
nextUsername('QA User', ['qa_user_1', 'qa_user_2'])  // 'qa_user_3'
\`\`\`
**Example 2**
\`\`\`
nextUsername('tester', ['tester_2'])  // 'tester_1'
\`\`\`

**Constraints**
- \`existing\` may contain unrelated names.`,
    fnName: 'nextUsername',
    starter: `/**
 * @param {string} prefix
 * @param {string[]} existing
 * @returns {string}
 */
function nextUsername(prefix, existing) {
  // your code
}`,
    tests: [
      { args: ['QA User', ['qa_user_1', 'qa_user_2']], expected: 'qa_user_3' },
      { args: ['tester', ['tester_2']], expected: 'tester_1' },
      { args: ['tester', []], expected: 'tester_1' },
      { args: ['  Admin  ', ['admin_1']], expected: 'admin_2' },
      { args: ['bot', ['bot_1', 'bot_3']], expected: 'bot_2' },
      { args: ['load test user', ['load_test_user_1', 'other_2']], expected: 'load_test_user_2', hidden: true },
      { args: ['u', ['u_1', 'u_2', 'u_3', 'u_4', 'u_5']], expected: 'u_6', hidden: true },
    ],
    hints: [
      'Normalise with `trim().toLowerCase().replace(/\\s+/g, "_")`.',
      'Put `existing` in a Set, then count up from 1 until the candidate is free.',
    ],
    solution: `function nextUsername(prefix, existing) {
  const base = prefix.trim().toLowerCase().replace(/\\s+/g, '_');
  const taken = new Set(existing);
  let n = 1;
  while (taken.has(base + '_' + n)) n++;
  return base + '_' + n;
}`,
    explanation: `**Approach:** normalise, build a Set of taken names, and increment N until the candidate is free.

**Complexity:** O(k + m) where k is the existing count and m the number of probes.

**Alternatives:** a timestamp or random suffix (\`Date.now()\`, \`crypto.randomUUID()\`) avoids the lookup entirely. For parallel Playwright workers, include \`testInfo.workerIndex\` (or \`parallelIndex\`) so workers never collide.

**Say aloud:** "Unique test data is what makes tests independent and parallel-safe. In real suites I'd prefer worker index plus timestamp, and clean up created users in an afterEach or teardown."`,
    followUps: [
      { q: 'Why can a counter-based name still collide when tests run in parallel?', a: 'Two workers can read the same existing list and pick the same next N. Add workerIndex, a timestamp or a UUID to make names globally unique.' },
    ],
  },
  {
    id: 'code-qa-utils-summarize-results',
    category: 'qa-utils',
    difficulty: 'medium',
    title: 'Summarise test results',
    prompt: `Write \`summarizeResults(results)\` for an array of \`{ name, status }\` where status is \`'passed'\`, \`'failed'\` or \`'skipped'\`. Return \`{ passed, failed, skipped, passRate }\`, where \`passRate\` is \`passed / (passed + failed) * 100\` rounded to **1 decimal** (skipped tests are excluded), or \`0\` if nothing ran.

**Example 1**
\`\`\`
summarizeResults([{ name: 'login', status: 'passed' }, { name: 'cart', status: 'failed' }, { name: 'sort', status: 'passed' }])
// { passed: 2, failed: 1, skipped: 0, passRate: 66.7 }
\`\`\`
**Example 2**
\`\`\`
summarizeResults([])  // { passed: 0, failed: 0, skipped: 0, passRate: 0 }
\`\`\`

**Constraints**
- Ignore any other status values.`,
    fnName: 'summarizeResults',
    starter: `/**
 * @param {{ name: string, status: 'passed' | 'failed' | 'skipped' }[]} results
 * @returns {{ passed: number, failed: number, skipped: number, passRate: number }}
 */
function summarizeResults(results) {
  // your code
}`,
    tests: [
      {
        args: [[{ name: 'login', status: 'passed' }, { name: 'cart', status: 'failed' }, { name: 'sort', status: 'passed' }]],
        expected: { passed: 2, failed: 1, skipped: 0, passRate: 66.7 },
      },
      { args: [[]], expected: { passed: 0, failed: 0, skipped: 0, passRate: 0 } },
      { args: [[{ name: 'a', status: 'skipped' }]], expected: { passed: 0, failed: 0, skipped: 1, passRate: 0 } },
      { args: [[{ name: 'a', status: 'passed' }]], expected: { passed: 1, failed: 0, skipped: 0, passRate: 100 } },
      { args: [[{ name: 'a', status: 'failed' }, { name: 'b', status: 'skipped' }]], expected: { passed: 0, failed: 1, skipped: 1, passRate: 0 } },
      {
        args: [[{ name: 'a', status: 'passed' }, { name: 'b', status: 'passed' }, { name: 'c', status: 'failed' }, { name: 'd', status: 'skipped' }, { name: 'e', status: 'timedOut' }]],
        expected: { passed: 2, failed: 1, skipped: 1, passRate: 66.7 },
        hidden: true,
      },
      {
        args: [[{ name: 'a', status: 'passed' }, { name: 'b', status: 'failed' }, { name: 'c', status: 'failed' }, { name: 'd', status: 'failed' }, { name: 'e', status: 'failed' }, { name: 'f', status: 'failed' }]],
        expected: { passed: 1, failed: 5, skipped: 0, passRate: 16.7 },
        hidden: true,
      },
    ],
    hints: [
      'Initialise `{ passed: 0, failed: 0, skipped: 0 }` and increment `counts[r.status]` if that key exists.',
      'Executed = passed + failed. Guard against dividing by 0.',
      'Round to 1 decimal with `Math.round(x * 10) / 10`.',
    ],
    solution: `function summarizeResults(results) {
  const counts = { passed: 0, failed: 0, skipped: 0 };
  for (const r of results) {
    if (r.status in counts) counts[r.status]++;
  }
  const executed = counts.passed + counts.failed;
  const passRate = executed === 0 ? 0 : Math.round((counts.passed / executed) * 1000) / 10;
  return { passed: counts.passed, failed: counts.failed, skipped: counts.skipped, passRate };
}`,
    explanation: `**Approach:** count by status (the frequency pattern restricted to known keys), then compute the rate over **executed** tests with a divide-by-zero guard.

**Complexity:** O(n) time, O(1) space.

**Alternative:** three \`filter(...).length\` calls. They're readable, but each does a pass over the array. \`reduce\` into the counts object is the one-pass functional version.

**Rounding:** \`Math.round(ratio * 1000) / 10\` gives a percentage with one decimal. \`toFixed(1)\` returns a **string**, so wrap it in \`Number()\` if you use it.

**Say aloud:** "I'd confirm the definition first: do skipped tests count in the denominator? And I'd handle the zero-executed case. Playwright reporters and CI dashboards compute exactly this."`,
    followUps: [
      { q: 'How would you treat flaky tests (passed on retry)?', a: 'Count them as passed for the rate but report them separately as flaky, since they signal instability even though the build is green.' },
    ],
  },
];
