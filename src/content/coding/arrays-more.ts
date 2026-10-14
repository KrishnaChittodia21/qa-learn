import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-arrays-move-value-to-end',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Move every occurrence of a value to the end (in place)',
    askedIn: 'Generalisation of "Move All Zeroes To End" (LeetCode 283), listed in GeeksforGeeks "Top 50 Array Coding Problems for Interviews"',
    prompt: `Write \`moveToEnd(arr, value)\` that moves **every** occurrence of \`value\` to the end of the array while keeping the **relative order** of the other elements.

Do it **in place**: modify \`arr\` and return the same array (no new array, no \`filter\`, no \`sort\`).

**Example 1**
\`\`\`
moveToEnd([3, 1, 2, 1, 4], 1)  // [3, 2, 4, 1, 1]
\`\`\`
**Example 2**
\`\`\`
moveToEnd(['a', 'x', 'b', 'x'], 'x')  // ['a', 'b', 'x', 'x']
\`\`\`

**Constraints**
- \`0 <= arr.length <= 10^5\`
- Compare with \`===\`.
- O(1) extra space.`,
    fnName: 'moveToEnd',
    starter: `/**
 * @param {Array<number|string>} arr
 * @param {number|string} value
 * @returns {Array<number|string>} the same array, modified
 */
function moveToEnd(arr, value) {
  // your code
}`,
    tests: [
      { args: [[3, 1, 2, 1, 4], 1], expected: [3, 2, 4, 1, 1] },
      { args: [['a', 'x', 'b', 'x'], 'x'], expected: ['a', 'b', 'x', 'x'] },
      { args: [[], 5], expected: [] },
      { args: [[7], 7], expected: [7] },
      { args: [[1, 2, 3], 9], expected: [1, 2, 3] },
      { args: [[2, 2, 2], 2], expected: [2, 2, 2] },
      { args: [[5, 5, 1, 5, 2], 5], expected: [1, 2, 5, 5, 5], hidden: true },
      { args: [[1, '1', 1], 1], expected: ['1', 1, 1], hidden: true },
      { args: [[0, -1, 0, -1], -1], expected: [0, 0, -1, -1], hidden: true },
    ],
    hints: [
      'This is "move zeros to end" with any value. Keep a write index that starts at 0.',
      'Copy every element that is NOT the value to `arr[write]` and advance `write`.',
      'After the loop, fill positions `write..length-1` with the value.',
    ],
    solution: `function moveToEnd(arr, value) {
  let write = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== value) {
      arr[write] = arr[i];
      write++;
    }
  }
  while (write < arr.length) {
    arr[write] = value;
    write++;
  }
  return arr;
}`,
    explanation: `**Approach:** a write pointer. Walk the array once and compact every element that is not \`value\` to the front, in order. Everything from \`write\` onwards must then be \`value\`, so fill it in.

**Complexity:** O(n) time, O(1) extra space, one pass plus the fill.

**With built-ins:** \`[...arr.filter(x => x !== value), ...arr.filter(x => x === value)]\`. It's readable but allocates two new arrays and returns a different array, so it fails the "in place" requirement. \`sort\` is wrong here: it breaks the relative order of the other elements.

**Say aloud:** "Keeping order rules out a swap-from-both-ends approach, because that isn't stable. The write pointer is stable and in place. I'd test no occurrences, all occurrences and a single element."`,
    followUps: [
      { q: 'Why not swap matching elements with the last element?', a: 'Swapping with the end is O(n) and in place but not stable: [3,1,2,1,4] would become [3,4,2,1,1], which reorders the other elements.' },
      { q: 'How do you prove you modified the array in place?', a: 'Check identity: const a = [1,2]; moveToEnd(a, 1) === a should be true. A filter-based solution returns a new array and fails that check.' },
    ],
  },
  {
    id: 'code-arrays-rotate-one',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Move the first element to the end (or the last to the front)',
    prompt: `Write \`rotateOne(arr, direction)\` that rotates the array by **one** position, in place, and returns it.

- \`'left'\`: the **first** element moves to the **last** position.
- \`'right'\`: the **last** element moves to the **front**.

Do it with a manual loop: no \`shift\`, \`unshift\`, \`push\`, \`pop\`, \`splice\` or \`slice\`.

**Example 1**
\`\`\`
rotateOne([1, 2, 3, 4], 'left')   // [2, 3, 4, 1]
\`\`\`
**Example 2**
\`\`\`
rotateOne([1, 2, 3, 4], 'right')  // [4, 1, 2, 3]
\`\`\`

**Constraints**
- \`0 <= arr.length <= 10^5\`
- Empty and single-element arrays come back unchanged.`,
    fnName: 'rotateOne',
    starter: `/**
 * @param {number[]} arr
 * @param {'left' | 'right'} direction
 * @returns {number[]}
 */
function rotateOne(arr, direction) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3, 4], 'left'], expected: [2, 3, 4, 1] },
      { args: [[1, 2, 3, 4], 'right'], expected: [4, 1, 2, 3] },
      { args: [[], 'left'], expected: [] },
      { args: [[9], 'right'], expected: [9] },
      { args: [[1, 2], 'left'], expected: [2, 1] },
      { args: [[5, 5, 5], 'right'], expected: [5, 5, 5], hidden: true },
      { args: [[0, -1, 2, -3, 4], 'right'], expected: [4, 0, -1, 2, -3], hidden: true },
      { args: [[0, -1, 2, -3, 4], 'left'], expected: [-1, 2, -3, 4, 0], hidden: true },
    ],
    hints: [
      'Save the element that will be overwritten in a temporary variable first.',
      "For 'left', save arr[0], shift every element one step towards the front, then put the saved value at the end.",
      "For 'right', save the last element and loop backwards so you do not overwrite values you still need.",
    ],
    solution: `function rotateOne(arr, direction) {
  const n = arr.length;
  if (n < 2) return arr;
  if (direction === 'left') {
    const first = arr[0];
    for (let i = 0; i < n - 1; i++) arr[i] = arr[i + 1];
    arr[n - 1] = first;
  } else {
    const last = arr[n - 1];
    for (let i = n - 1; i > 0; i--) arr[i] = arr[i - 1];
    arr[0] = last;
  }
  return arr;
}`,
    explanation: `**Approach:** save the element that falls off one end in a temp variable, shift everything else by one, then drop the temp into the free slot. For a right rotation, loop **backwards**, otherwise you copy \`arr[0]\` into every cell.

**Complexity:** O(n) time, O(1) extra space.

**With built-ins:** left is \`arr.push(arr.shift())\`, right is \`arr.unshift(arr.pop())\`. Both are one-liners, but \`shift\`/\`unshift\` are O(n) internally anyway, because every index moves.

**Say aloud:** "This is rotate by one. The trap is loop direction when shifting right, and I'd call out that empty and single-element arrays are no-ops."`,
    followUps: [
      { q: 'How would you rotate by k positions efficiently?', a: 'Use k = k % n, then the reversal trick: reverse the whole array, reverse the first k, reverse the rest. That is O(n) time and O(1) space instead of k single rotations.' },
    ],
  },
  {
    id: 'code-arrays-negatives-to-end',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Move all negative numbers to the end',
    prompt: `Write \`negativesToEnd(nums)\` that returns a **new** array with all non-negative numbers first and all negative numbers after them. Both groups keep their **original relative order**.

Don't use \`filter\` or \`sort\`.

**Example 1**
\`\`\`
negativesToEnd([1, -1, 3, 2, -7, -5, 11, 6])  // [1, 3, 2, 11, 6, -1, -7, -5]
\`\`\`
**Example 2**
\`\`\`
negativesToEnd([-5, 0, -2])  // [0, -5, -2]
\`\`\`

**Constraints**
- \`0 <= nums.length <= 10^5\`
- \`0\` counts as non-negative.`,
    fnName: 'negativesToEnd',
    starter: `/**
 * @param {number[]} nums
 * @returns {number[]}
 */
function negativesToEnd(nums) {
  // your code
}`,
    tests: [
      { args: [[1, -1, 3, 2, -7, -5, 11, 6]], expected: [1, 3, 2, 11, 6, -1, -7, -5] },
      { args: [[-5, 0, -2]], expected: [0, -5, -2] },
      { args: [[]], expected: [] },
      { args: [[-3]], expected: [-3] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[-1, -2, -3]], expected: [-1, -2, -3], hidden: true },
      { args: [[0, -0.5, 0, 4]], expected: [0, 0, 4, -0.5], hidden: true },
    ],
    hints: [
      'Two buckets: one for non-negatives, one for negatives.',
      'Loop once, push each number into the right bucket, then join the buckets.',
    ],
    solution: `function negativesToEnd(nums) {
  const positives = [];
  const negatives = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) negatives.push(nums[i]);
    else positives.push(nums[i]);
  }
  for (let i = 0; i < negatives.length; i++) positives.push(negatives[i]);
  return positives;
}`,
    explanation: `**Approach:** a stable partition with two buckets. One pass decides which bucket each number goes into; appending the negatives after the non-negatives keeps both groups in order.

**Complexity:** O(n) time, O(n) extra space for the result.

**With built-ins:** \`[...nums.filter(n => n >= 0), ...nums.filter(n => n < 0)]\`. Sorting with \`(a, b) => (a < 0) - (b < 0)\` also works because \`Array.prototype.sort\` is stable since ES2019, but it is O(n log n) for an O(n) job.

**Say aloud:** "The order requirement makes this a stable partition. An in-place two-pointer swap is faster on memory but not stable, so I'd confirm which matters."`,
    followUps: [
      { q: 'Can you do it in place and stable?', a: 'Not in O(n) with O(1) space easily. A stable in-place partition is O(n²) with insertion-style shifting, or O(n log n) with a merge-based approach. Most interviewers accept O(n) extra space.' },
    ],
  },
  {
    id: 'code-arrays-even-odd',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Segregate even and odd numbers',
    prompt: `Write \`evenThenOdd(nums)\` that returns a new array with all **even** numbers first, then all **odd** numbers, each group in its original order.

Don't use \`filter\` or \`sort\`.

**Example 1**
\`\`\`
evenThenOdd([1, 2, 3, 4, 5, 6])  // [2, 4, 6, 1, 3, 5]
\`\`\`
**Example 2**
\`\`\`
evenThenOdd([7, -2, 0, -3])  // [-2, 0, 7, -3]
\`\`\`

**Constraints**
- Integers only, negatives allowed.
- \`0\` is even.`,
    fnName: 'evenThenOdd',
    starter: `/**
 * @param {number[]} nums
 * @returns {number[]}
 */
function evenThenOdd(nums) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3, 4, 5, 6]], expected: [2, 4, 6, 1, 3, 5] },
      { args: [[7, -2, 0, -3]], expected: [-2, 0, 7, -3] },
      { args: [[]], expected: [] },
      { args: [[5]], expected: [5] },
      { args: [[2, 4, 6]], expected: [2, 4, 6] },
      { args: [[1, 3, 5]], expected: [1, 3, 5], hidden: true },
      { args: [[-1, -4, 11, 8]], expected: [-4, 8, -1, 11], hidden: true },
    ],
    hints: [
      'A number is even when `n % 2 === 0`.',
      'Careful: `-3 % 2` is `-1`, not `1`, so test for even rather than `=== 1` for odd.',
      'Collect evens and odds separately, then append the odds after the evens.',
    ],
    solution: `function evenThenOdd(nums) {
  const evens = [];
  const odds = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] % 2 === 0) evens.push(nums[i]);
    else odds.push(nums[i]);
  }
  for (let i = 0; i < odds.length; i++) evens.push(odds[i]);
  return evens;
}`,
    explanation: `**Approach:** stable partition into two buckets in one pass, then concatenate.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`[...nums.filter(n => n % 2 === 0), ...nums.filter(n => n % 2 !== 0)]\`.

**The classic bug:** writing \`n % 2 === 1\` for odd. In JavaScript the remainder takes the sign of the dividend, so \`-3 % 2 === -1\` and negative odd numbers get misclassified. Testing \`=== 0\` for even avoids it.

**Say aloud:** "I check evenness with \`% 2 === 0\` because negative odds give -1. I'd include a negative odd number in my tests to catch exactly that."`,
    followUps: [
      { q: 'What if order does not matter and you must do it in place?', a: 'Use two pointers from both ends: advance left while even, move right back while odd, then swap. That is O(n) time and O(1) space but not stable.' },
    ],
  },
  {
    id: 'code-arrays-remove-duplicates-sorted',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Remove duplicates from a sorted array in place',
    askedIn: 'LeetCode 26; listed as "Remove Duplicates from Sorted Array" in GeeksforGeeks "Top 50 Array Coding Problems for Interviews"',
    prompt: `Given a **sorted** array \`nums\`, remove the duplicates **in place** so each value appears once, and return \`{ count, arr }\` where \`count\` is the number of unique values and \`arr\` is the same array object, truncated to \`count\` items (set \`arr.length = count\`).

No \`Set\`, no \`filter\`, no new array.

**Example 1**
\`\`\`
dedupeSorted([1, 1, 2])  // { count: 2, arr: [1, 2] }
\`\`\`
**Example 2**
\`\`\`
dedupeSorted([0, 0, 1, 1, 1, 2, 2, 3, 3, 4])  // { count: 5, arr: [0, 1, 2, 3, 4] }
\`\`\`

**Constraints**
- \`0 <= nums.length <= 3 * 10^4\`
- \`nums\` is sorted ascending.
- O(1) extra space.`,
    fnName: 'dedupeSorted',
    starter: `/**
 * @param {number[]} nums sorted ascending
 * @returns {{ count: number, arr: number[] }}
 */
function dedupeSorted(nums) {
  // your code
}`,
    tests: [
      { args: [[1, 1, 2]], expected: { count: 2, arr: [1, 2] } },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: { count: 5, arr: [0, 1, 2, 3, 4] } },
      { args: [[]], expected: { count: 0, arr: [] } },
      { args: [[7]], expected: { count: 1, arr: [7] } },
      { args: [[1, 2, 3]], expected: { count: 3, arr: [1, 2, 3] } },
      { args: [[4, 4, 4, 4]], expected: { count: 1, arr: [4] }, hidden: true },
      { args: [[-3, -3, -1, 0, 0, 5]], expected: { count: 4, arr: [-3, -1, 0, 5] }, hidden: true },
    ],
    hints: [
      'Because the array is sorted, duplicates are always next to each other.',
      'Keep a slow pointer `k` at the last unique value; scan with a fast pointer `i`.',
      'When `nums[i] !== nums[k]`, advance `k` and copy `nums[i]` there. The count is `k + 1` (or 0 for an empty array).',
    ],
    solution: `function dedupeSorted(nums) {
  if (nums.length === 0) return { count: 0, arr: nums };
  let k = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k]) {
      k++;
      nums[k] = nums[i];
    }
  }
  nums.length = k + 1;
  return { count: k + 1, arr: nums };
}`,
    explanation: `**Approach:** two pointers. \`k\` marks the end of the unique prefix; \`i\` scans ahead. Sorted input means a new value can only appear when \`nums[i]\` differs from the last unique value, so one comparison per element is enough.

**Complexity:** O(n) time, O(1) extra space.

**With built-ins:** \`[...new Set(nums)]\` works on any array, sorted or not, but it allocates a new array, so it does not satisfy the in-place requirement. On LeetCode the judge only checks the first \`k\` slots, which is why the classic version returns a count.

**Say aloud:** "Sorted is the key hint: duplicates are adjacent, so I don't need a Set. Slow and fast pointers give O(1) space. Empty input is the edge case that breaks \`k + 1\`."`,
    followUps: [
      { q: 'What if each value may appear at most twice (LeetCode 80)?', a: 'Compare with the element two slots behind the write pointer: write nums[i] when k < 2 or nums[i] !== nums[k - 2]. The same pattern generalises to "at most m times".' },
      { q: 'What changes if the array is not sorted?', a: 'Duplicates are no longer adjacent, so you need a seen-Set (O(n) space) or sort first (O(n log n), and the original order is lost).' },
    ],
  },
  {
    id: 'code-arrays-unique-by-key',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Remove duplicate objects by key',
    prompt: `Write \`uniqueBy(items, key)\` that removes objects whose \`item[key]\` value was already seen, keeping the **first** one. Return a new array in the original order.

This is the everyday QA version of dedupe: an API returns the same user twice and you need the unique list.

**Example 1**
\`\`\`
uniqueBy([{ id: 1, n: 'a' }, { id: 2, n: 'b' }, { id: 1, n: 'c' }], 'id')
// [{ id: 1, n: 'a' }, { id: 2, n: 'b' }]
\`\`\`
**Example 2**
\`\`\`
uniqueBy([{ email: 'x@t.io' }, { email: 'x@t.io' }], 'email')  // [{ email: 'x@t.io' }]
\`\`\`

**Constraints**
- Key values are strings or numbers.
- \`new Set(items)\` does **not** work here. Explain why.`,
    fnName: 'uniqueBy',
    starter: `/**
 * @param {object[]} items
 * @param {string} key
 * @returns {object[]}
 */
function uniqueBy(items, key) {
  // your code
}`,
    tests: [
      {
        args: [[{ id: 1, n: 'a' }, { id: 2, n: 'b' }, { id: 1, n: 'c' }], 'id'],
        expected: [{ id: 1, n: 'a' }, { id: 2, n: 'b' }],
      },
      { args: [[{ email: 'x@t.io' }, { email: 'x@t.io' }], 'email'], expected: [{ email: 'x@t.io' }] },
      { args: [[], 'id'], expected: [] },
      { args: [[{ id: 5 }], 'id'], expected: [{ id: 5 }] },
      { args: [[{ id: 1 }, { id: 2 }, { id: 3 }], 'id'], expected: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      { args: [[{ id: 1, v: 1 }, { id: 1, v: 2 }, { id: 1, v: 3 }], 'id'], expected: [{ id: 1, v: 1 }], hidden: true },
      { args: [[{ id: 1 }, { id: '1' }], 'id'], expected: [{ id: 1 }, { id: '1' }], hidden: true },
    ],
    hints: [
      'Two objects with the same content are still different references, so a Set of objects keeps both.',
      'Track the key values you have seen instead (a Set or a Map of keys).',
      "Use a Set (not a plain object) for seen keys so that 1 and '1' stay different.",
    ],
    solution: `function uniqueBy(items, key) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const k = item[key];
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}`,
    explanation: `**Approach:** keep a Set of key **values** already taken and push an item only the first time its key appears.

**Complexity:** O(n) time, O(n) space.

**Why \`new Set(items)\` fails:** Sets compare objects by **reference**. \`{ id: 1 }\` and another \`{ id: 1 }\` are two different objects, so both survive.

**With built-ins:** \`[...new Map(items.map(i => [i[key], i])).values()]\` is a popular one-liner, but it keeps the **last** item per key, not the first. Another option: \`items.filter((x, i) => items.findIndex(y => y[key] === x[key]) === i)\`, which is O(n²).

**Say aloud:** "Objects are compared by reference, so I dedupe on the key. I'd also ask whether to keep the first or the last duplicate, because the Map one-liner silently keeps the last."`,
    followUps: [
      { q: 'How would you dedupe by a combination of fields, e.g. firstName + lastName?', a: 'Build a composite key such as JSON.stringify([item.firstName, item.lastName]) and store that in the seen-Set. Avoid plain concatenation, because "ab"+"c" equals "a"+"bc".' },
    ],
  },
  {
    id: 'code-arrays-values-appearing-once',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Keep only values that appear exactly once',
    prompt: `Write \`onlyUnique(arr)\` that removes **every** value that has a duplicate, not just the extra copies. Keep the values that appear exactly once, in their original order.

**Example 1**
\`\`\`
onlyUnique([1, 2, 2, 3, 4, 4, 5])  // [1, 3, 5]
\`\`\`
**Example 2**
\`\`\`
onlyUnique(['a', 'b', 'a'])  // ['b']
\`\`\`

**Constraints**
- Values are numbers or strings; \`1\` and \`'1'\` are different.
- Try it without \`filter\`/\`indexOf\`/\`lastIndexOf\`.`,
    fnName: 'onlyUnique',
    starter: `/**
 * @param {Array<number|string>} arr
 * @returns {Array<number|string>}
 */
function onlyUnique(arr) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 2, 3, 4, 4, 5]], expected: [1, 3, 5] },
      { args: [['a', 'b', 'a']], expected: ['b'] },
      { args: [[]], expected: [] },
      { args: [[9]], expected: [9] },
      { args: [[3, 3, 3]], expected: [] },
      { args: [[1, 2, 3]], expected: [1, 2, 3], hidden: true },
      { args: [[1, '1', 1]], expected: ['1'], hidden: true },
      { args: [[5, 6, 5, 7, 6, 8]], expected: [7, 8], hidden: true },
    ],
    hints: [
      'You cannot decide on the first pass, because a later copy might appear. Count first.',
      'Pass 1: build a Map of value → count. Pass 2: keep values whose count is 1.',
    ],
    solution: `function onlyUnique(arr) {
  const counts = new Map();
  for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1);
  const out = [];
  for (const v of arr) {
    if (counts.get(v) === 1) out.push(v);
  }
  return out;
}`,
    explanation: `**Approach:** two passes. First count every value in a \`Map\`, then walk the original array and keep values whose count is exactly 1. Walking the original array (not the Map) keeps the input order.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`arr.filter(v => arr.indexOf(v) === arr.lastIndexOf(v))\`. It's a neat one-liner but O(n²), because each \`indexOf\` is a scan.

**Why a Map and not a plain object:** object keys are strings, so \`1\` and \`'1'\` would share a counter.

**Say aloud:** "This is different from dedupe: I drop every copy of a repeated value. I count first, then filter in order, which is linear."`,
    followUps: [
      { q: 'How is this different from removing duplicates?', a: 'Dedupe keeps one copy of each value ([1,2,2,3] gives [1,2,3]). This removes every value that repeats ([1,2,2,3] gives [1,3]).' },
    ],
  },
  {
    id: 'code-arrays-dedupe-case-insensitive',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Remove duplicate strings ignoring case',
    prompt: `Write \`dedupeIgnoreCase(words)\` that removes strings that are duplicates **ignoring case**, keeping the **first spelling** that appeared. Order is preserved.

Typical QA use: a dropdown must not show "Apple" and "apple" twice.

**Example 1**
\`\`\`
dedupeIgnoreCase(['Apple', 'banana', 'APPLE', 'Banana', 'cherry'])  // ['Apple', 'banana', 'cherry']
\`\`\`
**Example 2**
\`\`\`
dedupeIgnoreCase(['QA', 'qa', 'Qa'])  // ['QA']
\`\`\`

**Constraints**
- \`0 <= words.length <= 10^4\`
- Compare with \`toLowerCase()\`; whitespace is significant.`,
    fnName: 'dedupeIgnoreCase',
    starter: `/**
 * @param {string[]} words
 * @returns {string[]}
 */
function dedupeIgnoreCase(words) {
  // your code
}`,
    tests: [
      { args: [['Apple', 'banana', 'APPLE', 'Banana', 'cherry']], expected: ['Apple', 'banana', 'cherry'] },
      { args: [['QA', 'qa', 'Qa']], expected: ['QA'] },
      { args: [[]], expected: [] },
      { args: [['one']], expected: ['one'] },
      { args: [['a', 'b', 'c']], expected: ['a', 'b', 'c'] },
      { args: [['x', 'X', 'x', 'X']], expected: ['x'], hidden: true },
      { args: [['Test ', 'test', 'TEST ']], expected: ['Test ', 'test'], hidden: true },
    ],
    hints: [
      'Normalise each word to a comparison key with `toLowerCase()`.',
      'Store the normalised keys in a seen-collection, but push the original word into the result.',
    ],
    solution: `function dedupeIgnoreCase(words) {
  const seen = {};
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const key = words[i].toLowerCase();
    if (!seen[key]) {
      seen[key] = true;
      out.push(words[i]);
    }
  }
  return out;
}`,
    explanation: `**Approach:** compare on a normalised key (\`toLowerCase()\`), but output the original spelling. A plain object works as the seen-lookup because the keys are strings anyway.

**Complexity:** O(n · L) time where L is the average word length (lower-casing), O(n) space.

**With built-ins:** \`words.filter((w, i) => words.findIndex(x => x.toLowerCase() === w.toLowerCase()) === i)\` is O(n²). With a Set: \`const seen = new Set(); words.filter(w => !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase()))\`.

**Note:** \`[...new Set(words.map(w => w.toLowerCase()))]\` is wrong, because it loses the original casing.

**Say aloud:** "I separate the comparison key from the stored value. I'd clarify whether 'Test ' with a trailing space should equal 'test'; if so, I'd trim too."`,
    followUps: [
      { q: 'What about locale-specific characters like the Turkish dotted i?', a: 'toLowerCase can be wrong for some locales. Use toLocaleLowerCase with a locale, or localeCompare with sensitivity: "base" for accent/case-insensitive comparison.' },
    ],
  },
  {
    id: 'code-arrays-duplicate-counts',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Count the duplicates',
    prompt: `Write \`duplicateCounts(arr)\` that returns every value that appears **more than once**, together with how many times it appears, as \`[value, count]\` pairs in order of **first appearance**.

**Example 1**
\`\`\`
duplicateCounts([4, 2, 4, 5, 2, 4])  // [[4, 3], [2, 2]]
\`\`\`
**Example 2**
\`\`\`
duplicateCounts(['a', 'b', 'c'])  // []
\`\`\`

**Constraints**
- Values are numbers or strings; \`1\` and \`'1'\` are different values.
- \`0 <= arr.length <= 10^5\``,
    fnName: 'duplicateCounts',
    starter: `/**
 * @param {Array<number|string>} arr
 * @returns {Array<[number|string, number]>}
 */
function duplicateCounts(arr) {
  // your code
}`,
    tests: [
      { args: [[4, 2, 4, 5, 2, 4]], expected: [[4, 3], [2, 2]] },
      { args: [['a', 'b', 'c']], expected: [] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [] },
      { args: [[7, 7, 7, 7]], expected: [[7, 4]] },
      { args: [['x', 'y', 'y', 'x', 'z']], expected: [['x', 2], ['y', 2]], hidden: true },
      { args: [[1, '1', 1, '1', '1']], expected: [[1, 2], ['1', 3]], hidden: true },
    ],
    hints: [
      'Count every value with a Map (it keeps insertion order and distinguishes 1 from "1").',
      'Then iterate the Map and keep entries whose count is greater than 1.',
    ],
    solution: `function duplicateCounts(arr) {
  const counts = new Map();
  for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1);
  const out = [];
  for (const [value, count] of counts) {
    if (count > 1) out.push([value, count]);
  }
  return out;
}`,
    explanation: `**Approach:** build a frequency Map in one pass, then keep the entries with count > 1. A \`Map\` iterates in insertion order, which is exactly "order of first appearance".

**Complexity:** O(n) time, O(k) space for k distinct values.

**With built-ins:** \`[...counts].filter(([, c]) => c > 1)\`. A \`reduce\` into a plain object is common too, but object keys become strings (\`1\` and \`'1'\` merge) and integer-like keys are reordered numerically, so the "first appearance" order breaks.

**Say aloud:** "I'd confirm the output shape: list of values, counts, or total duplicate count. The counting pass is the same either way."`,
    followUps: [
      { q: 'How would you return just the total number of extra copies?', a: 'Sum count - 1 over every entry with count > 1. For [4,2,4,5,2,4] that is 2 + 1 = 3 extra copies.' },
      { q: 'Why not use a plain object for counting?', a: 'Object keys are strings, so 1 and "1" share a slot, and integer-like keys iterate in numeric order, not insertion order.' },
    ],
  },
  {
    id: 'code-arrays-first-repeating',
    category: 'arrays',
    difficulty: 'medium',
    title: 'First repeating element',
    prompt: `Write \`firstRepeating(arr)\` that returns the element that repeats **and** whose first occurrence comes earliest in the array. Return \`null\` if nothing repeats.

Careful: this is not the same as "the first element you see twice".

**Example 1**
\`\`\`
firstRepeating([10, 5, 3, 4, 3, 5, 6])  // 5  (5 is at index 1; 3 repeats sooner but starts at index 2)
\`\`\`
**Example 2**
\`\`\`
firstRepeating([1, 2, 3])  // null
\`\`\`

**Constraints**
- \`0 <= arr.length <= 10^5\`
- Aim for O(n).`,
    fnName: 'firstRepeating',
    starter: `/**
 * @param {number[]} arr
 * @returns {number | null}
 */
function firstRepeating(arr) {
  // your code
}`,
    tests: [
      { args: [[10, 5, 3, 4, 3, 5, 6]], expected: 5 },
      { args: [[1, 2, 3]], expected: null },
      { args: [[]], expected: null },
      { args: [[8]], expected: null },
      { args: [[2, 2]], expected: 2 },
      { args: [[6, 10, 5, 4, 9, 120, 4, 6, 10]], expected: 6, hidden: true },
      { args: [[1, 2, 3, 3, 2, 1]], expected: 1, hidden: true },
      { args: [[-1, 0, 0, -1]], expected: -1, hidden: true },
    ],
    hints: [
      'Scanning left to right and returning the first value already seen gives the earliest SECOND occurrence, which is the wrong answer for example 1.',
      'Scan from the RIGHT instead, keeping a Set of values seen so far.',
      'Each time the current value is already in the Set, record it as the answer. The last one recorded (furthest left) wins.',
    ],
    solution: `function firstRepeating(arr) {
  const seen = new Set();
  let answer = null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (seen.has(arr[i])) answer = arr[i];
    else seen.add(arr[i]);
  }
  return answer;
}`,
    explanation: `**Approach:** scan right to left with a Set. When you meet a value that is already in the Set, it occurs again somewhere to the right, so it is a repeating element. Because you are moving left, each new hit has an earlier first occurrence, so the last hit is the answer.

**Complexity:** O(n) time, O(n) space.

**Alternative:** count frequencies in a Map, then scan left to right and return the first value with count > 1. Same complexity, two passes, and arguably easier to explain. Brute force with \`arr.indexOf(v) !== arr.lastIndexOf(v)\` is O(n²).

**Say aloud:** "There are two definitions, earliest first occurrence or earliest second occurrence, so I'd clarify with the interviewer. For [10,5,3,4,3,5,6] they give 5 and 3."`,
    followUps: [
      { q: 'How would you return the element whose SECOND occurrence comes first?', a: 'Scan left to right with a Set and return the first value that is already in the Set. For [10,5,3,4,3,5,6] that returns 3.' },
    ],
  },
  {
    id: 'code-arrays-remove-value',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Remove a value without filter',
    prompt: `Write \`removeValue(arr, value)\` that returns a **new** array with every occurrence of \`value\` removed, using a manual loop.

Not allowed: \`filter\`, \`splice\`, \`indexOf\`, \`includes\`.

**Example 1**
\`\`\`
removeValue([3, 2, 2, 3], 3)  // [2, 2]
\`\`\`
**Example 2**
\`\`\`
removeValue(['qa', 'dev', 'qa'], 'qa')  // ['dev']
\`\`\`

**Constraints**
- Compare with \`===\`.
- The input array must not be modified.`,
    fnName: 'removeValue',
    starter: `/**
 * @param {Array<number|string>} arr
 * @param {number|string} value
 * @returns {Array<number|string>}
 */
function removeValue(arr, value) {
  // your code
}`,
    tests: [
      { args: [[3, 2, 2, 3], 3], expected: [2, 2] },
      { args: [['qa', 'dev', 'qa'], 'qa'], expected: ['dev'] },
      { args: [[], 1], expected: [] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2, 3], 4], expected: [1, 2, 3] },
      { args: [[0, 0, 0], 0], expected: [], hidden: true },
      { args: [[1, '1', 1], '1'], expected: [1, 1], hidden: true },
    ],
    hints: [
      'Create an empty result array.',
      'Loop over the input and copy across only elements that are `!== value`.',
    ],
    solution: `function removeValue(arr, value) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== value) out[out.length] = arr[i];
  }
  return out;
}`,
    explanation: `**Approach:** build a new array and copy every element that is not the target. Writing to \`out[out.length]\` is the no-built-ins way to append; \`push\` is fine if the interviewer allows it.

**Complexity:** O(n) time, O(n) space for the result.

**With built-ins:** \`arr.filter(x => x !== value)\`.

**A classic bug to mention:** removing with \`splice\` inside a forward \`for\` loop skips the element after each removal, because indices shift. Looping backwards, or building a new array as here, avoids it.

**Say aloud:** "I build a new array so I don't mutate the input, and so I avoid the splice-while-iterating index bug."`,
    followUps: [
      { q: 'How would you remove the value in place (LeetCode 27)?', a: 'Use a write pointer: copy each element that is not the value to arr[write++], then set arr.length = write. That is O(n) time and O(1) extra space.' },
    ],
  },
  {
    id: 'code-arrays-sort-012',
    category: 'arrays',
    difficulty: 'medium',
    title: "Sort 0s, 1s and 2s (Dutch national flag)",
    askedIn: 'LeetCode 75 (Sort Colors); "sort 0s, 1s and 2s" appears in GeeksforGeeks most-asked array question lists (summarised on foundit.in)',
    prompt: `Write \`sort012(nums)\` that sorts an array containing only \`0\`, \`1\` and \`2\` **in place**, in a single pass, and returns it.

No \`sort\`, no counting pass followed by an overwrite pass (that is the warm-up; the interviewer wants one pass).

**Example 1**
\`\`\`
sort012([2, 0, 2, 1, 1, 0])  // [0, 0, 1, 1, 2, 2]
\`\`\`
**Example 2**
\`\`\`
sort012([2, 0, 1])  // [0, 1, 2]
\`\`\`

**Constraints**
- \`0 <= nums.length <= 10^5\`
- Every value is 0, 1 or 2.
- O(1) extra space.`,
    fnName: 'sort012',
    starter: `/**
 * @param {Array<0|1|2>} nums
 * @returns {Array<0|1|2>}
 */
function sort012(nums) {
  // your code
}`,
    tests: [
      { args: [[2, 0, 2, 1, 1, 0]], expected: [0, 0, 1, 1, 2, 2] },
      { args: [[2, 0, 1]], expected: [0, 1, 2] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
      { args: [[2, 2, 2]], expected: [2, 2, 2] },
      { args: [[0, 1, 2]], expected: [0, 1, 2] },
      { args: [[2, 1, 0, 2, 1, 0, 0]], expected: [0, 0, 0, 1, 1, 2, 2], hidden: true },
      { args: [[1, 0]], expected: [0, 1], hidden: true },
      { args: [[2, 0]], expected: [0, 2], hidden: true },
    ],
    hints: [
      'Use three pointers: `low` (next slot for a 0), `mid` (current element), `high` (next slot for a 2, from the end).',
      'If nums[mid] is 0, swap it with nums[low] and advance both. If it is 1, just advance mid.',
      'If it is 2, swap with nums[high] and move high back, but do NOT advance mid: the swapped-in value has not been checked yet.',
    ],
    solution: `function sort012(nums) {
  let low = 0;
  let mid = 0;
  let high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      const t = nums[low]; nums[low] = nums[mid]; nums[mid] = t;
      low++;
      mid++;
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      const t = nums[high]; nums[high] = nums[mid]; nums[mid] = t;
      high--;
    }
  }
  return nums;
}`,
    explanation: `**Approach:** Dijkstra's Dutch national flag. Three regions grow as you scan: \`[0, low)\` is all 0s, \`[low, mid)\` is all 1s, \`(high, end]\` is all 2s, and \`[mid, high]\` is still unknown. Each step shrinks the unknown region by one.

**Complexity:** O(n) time, one pass, O(1) space.

**Alternatives:** \`nums.sort((a, b) => a - b)\` is O(n log n). Counting sort (count the 0s, 1s and 2s, then overwrite) is O(n) but takes two passes. That is a good warm-up answer to mention first.

**The classic bug:** advancing \`mid\` after swapping with \`high\`. The value that came from the end is unchecked and might be a 0.

**Say aloud:** "I'll mention counting sort first, then do the one-pass three-pointer version and state the invariant for each region."`,
    followUps: [
      { q: 'Why is it safe to advance mid after swapping with low?', a: 'Everything between low and mid has already been checked and is a 1 (or low === mid), so the value swapped into mid is known and does not need re-checking.' },
    ],
  },
  {
    id: 'code-arrays-leaders',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Leaders in an array',
    askedIn: 'Listed as "Array Leaders" in GeeksforGeeks "Top 50 Array Coding Problems for Interviews"',
    prompt: `An element is a **leader** if it is **strictly greater than every element to its right**. The last element is always a leader.

Write \`leaders(nums)\` that returns all leaders in their original left-to-right order.

**Example 1**
\`\`\`
leaders([16, 17, 4, 3, 5, 2])  // [17, 5, 2]
\`\`\`
**Example 2**
\`\`\`
leaders([1, 2, 3, 4])  // [4]
\`\`\`

**Constraints**
- \`0 <= nums.length <= 10^5\`
- Aim for O(n), not a nested loop.`,
    fnName: 'leaders',
    starter: `/**
 * @param {number[]} nums
 * @returns {number[]}
 */
function leaders(nums) {
  // your code
}`,
    tests: [
      { args: [[16, 17, 4, 3, 5, 2]], expected: [17, 5, 2] },
      { args: [[1, 2, 3, 4]], expected: [4] },
      { args: [[]], expected: [] },
      { args: [[7]], expected: [7] },
      { args: [[5, 4, 3, 2]], expected: [5, 4, 3, 2] },
      { args: [[3, 3, 3]], expected: [3], hidden: true },
      { args: [[-1, -5, -3, -4]], expected: [-1, -3, -4], hidden: true },
      { args: [[10, 22, 12, 3, 0, 6]], expected: [22, 12, 6], hidden: true },
    ],
    hints: [
      'Checking everything to the right of each element works but is O(n²).',
      'Walk from the right while tracking the maximum seen so far.',
      'An element is a leader when it is greater than that running max. Collect leaders, then reverse at the end.',
    ],
    solution: `function leaders(nums) {
  const out = [];
  let maxRight = -Infinity;
  for (let i = nums.length - 1; i >= 0; i--) {
    if (nums[i] > maxRight) {
      out.push(nums[i]);
      maxRight = nums[i];
    }
  }
  const result = [];
  for (let i = out.length - 1; i >= 0; i--) result.push(out[i]);
  return result;
}`,
    explanation: `**Approach:** scan right to left with a running \`maxRight\`. Anything strictly greater than everything seen so far is a leader. Leaders are collected in reverse order, so flip the list at the end.

**Complexity:** O(n) time, O(n) for the output.

**Brute force:** for each i, check all j > i. That is O(n²) and a fine first answer to state before optimising. With built-ins, the final flip is just \`out.reverse()\`.

**Edge case:** "strictly greater" means equal values are not leaders: \`[3, 3, 3]\` gives \`[3]\`. Seeding \`maxRight\` with \`-Infinity\` makes the last element (and negatives) work.

**Say aloud:** "Right-to-left with a running max turns O(n²) into O(n). I'd confirm strict versus greater-or-equal, because it changes the duplicates case."`,
    followUps: [
      { q: 'What changes if a leader only needs to be greater than or equal to everything on its right?', a: 'Use >= instead of > in the comparison. [3, 3, 3] would then return all three 3s instead of just the last one.' },
    ],
  },
  {
    id: 'code-arrays-same-elements',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Same elements regardless of order',
    prompt: `Write \`sameElements(a, b)\` that returns \`true\` when both arrays contain exactly the same values **with the same number of copies**, in any order.

QA use: asserting that an API returned the expected items when the order is not guaranteed.

**Example 1**
\`\`\`
sameElements([1, 2, 2, 3], [2, 3, 1, 2])  // true
\`\`\`
**Example 2**
\`\`\`
sameElements([1, 1, 2], [1, 2, 2])  // false  (same Set, different counts)
\`\`\`

**Constraints**
- Values are numbers or strings; \`1\` and \`'1'\` are different.
- Don't sort (sorting mixed types with the default comparator is unreliable).`,
    fnName: 'sameElements',
    starter: `/**
 * @param {Array<number|string>} a
 * @param {Array<number|string>} b
 * @returns {boolean}
 */
function sameElements(a, b) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 2, 3], [2, 3, 1, 2]], expected: true },
      { args: [[1, 1, 2], [1, 2, 2]], expected: false },
      { args: [[], []], expected: true },
      { args: [[1], []], expected: false },
      { args: [['a'], ['a']], expected: true },
      { args: [[1, 2, 3], [1, 2, 4]], expected: false },
      { args: [[1, '1'], ['1', 1]], expected: true, hidden: true },
      { args: [[1, 1], ['1', 1]], expected: false, hidden: true },
      { args: [[5, 5, 5], [5, 5, 5]], expected: true, hidden: true },
    ],
    hints: [
      'Different lengths can return false immediately.',
      'Count each value of `a` in a Map, then decrement for each value of `b`.',
      'If a count would go below zero (or a value is missing), return false.',
    ],
    solution: `function sameElements(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const v of a) counts.set(v, (counts.get(v) || 0) + 1);
  for (const v of b) {
    const c = counts.get(v);
    if (!c) return false;
    counts.set(v, c - 1);
  }
  return true;
}`,
    explanation: `**Approach:** a multiset comparison. Count \`a\`, then "spend" counts while walking \`b\`. Equal lengths plus never overspending means every count ends at zero, so there's no final check needed.

**Complexity:** O(n) time, O(k) space.

**With built-ins:** \`JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())\` is common in test code. It's O(n log n), and the default sort compares as strings, so it can't tell \`1\` from \`'1'\`. Comparing \`new Set(a)\` with \`new Set(b)\` is **wrong**, because it ignores counts (example 2).

**Say aloud:** "Order doesn't matter but counts do, so I need a multiset, not a Set. This is the same check as an anagram, applied to arrays."`,
    followUps: [
      { q: 'How do testing libraries express this assertion?', a: 'Sort copies of both arrays with the same comparator and use toEqual. Beware: expect.arrayContaining plus a length check is not enough, because [1,1,2] vs [1,2,2] would pass.' },
    ],
  },
  {
    id: 'code-arrays-replace-with-greatest-right',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Replace each element with the greatest to its right',
    prompt: `Write \`replaceWithGreatestRight(nums)\` that replaces every element with the **greatest element to its right**, and the last element with \`-1\`. Return the array (modifying it in place is fine).

**Example 1**
\`\`\`
replaceWithGreatestRight([17, 18, 5, 4, 6, 1])  // [18, 6, 6, 6, 1, -1]
\`\`\`
**Example 2**
\`\`\`
replaceWithGreatestRight([400])  // [-1]
\`\`\`

**Constraints**
- \`0 <= nums.length <= 10^4\`
- Values are non-negative.
- O(n) time, O(1) extra space.`,
    fnName: 'replaceWithGreatestRight',
    starter: `/**
 * @param {number[]} nums
 * @returns {number[]}
 */
function replaceWithGreatestRight(nums) {
  // your code
}`,
    tests: [
      { args: [[17, 18, 5, 4, 6, 1]], expected: [18, 6, 6, 6, 1, -1] },
      { args: [[400]], expected: [-1] },
      { args: [[]], expected: [] },
      { args: [[1, 2]], expected: [2, -1] },
      { args: [[5, 5, 5]], expected: [5, 5, -1] },
      { args: [[1, 2, 3, 4]], expected: [4, 4, 4, -1], hidden: true },
      { args: [[9, 0, 3, 0]], expected: [3, 3, 0, -1], hidden: true },
    ],
    hints: [
      'The answer for index i depends only on elements to the right, so walk from the right.',
      'Keep `maxRight`, starting at -1.',
      'At each index: remember the current value, write `maxRight` into the slot, then update `maxRight` with the remembered value.',
    ],
    solution: `function replaceWithGreatestRight(nums) {
  let maxRight = -1;
  for (let i = nums.length - 1; i >= 0; i--) {
    const current = nums[i];
    nums[i] = maxRight;
    if (current > maxRight) maxRight = current;
  }
  return nums;
}`,
    explanation: `**Approach:** right-to-left with a running max, the same trick as "leaders". Starting \`maxRight\` at \`-1\` handles the last element for free. Save the current value **before** overwriting it, otherwise you lose it.

**Complexity:** O(n) time, O(1) extra space.

**Brute force:** for each index, \`Math.max(...nums.slice(i + 1))\` is O(n²) and \`Math.max()\` of an empty slice is \`-Infinity\`, not \`-1\`.

**Say aloud:** "Each answer only depends on the suffix, so I process from the right and carry the suffix maximum. The ordering of read, write, update is the subtle part."`,
    followUps: [
      { q: 'This is LeetCode 1299. How is it related to "leaders in an array"?', a: 'Same right-to-left running maximum. An element is a leader exactly when it is greater than the value this function writes into its slot.' },
    ],
  },
];
