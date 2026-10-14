import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-arrays-sum-and-max',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Sum and max without Math.max',
    prompt: `Write \`sumAndMax(nums)\` that returns an object \`{ sum, max }\` for an array of numbers, **without** using \`Math.max\` or \`reduce\`.

If the array is empty, return \`{ sum: 0, max: null }\`.

**Example 1**
\`\`\`
sumAndMax([3, 7, 2])  // { sum: 12, max: 7 }
\`\`\`
**Example 2**
\`\`\`
sumAndMax([-5, -2, -9])  // { sum: -16, max: -2 }
\`\`\`

**Constraints**
- \`0 <= nums.length <= 10^4\`
- Values can be negative.`,
    fnName: 'sumAndMax',
    starter: `/**
 * @param {number[]} nums
 * @returns {{ sum: number, max: number | null }}
 */
function sumAndMax(nums) {
  // your code
}`,
    tests: [
      { args: [[3, 7, 2]], expected: { sum: 12, max: 7 } },
      { args: [[-5, -2, -9]], expected: { sum: -16, max: -2 } },
      { args: [[]], expected: { sum: 0, max: null } },
      { args: [[42]], expected: { sum: 42, max: 42 } },
      { args: [[1, 1, 1, 1]], expected: { sum: 4, max: 1 } },
      { args: [[0, -1, 5, 5, 3]], expected: { sum: 12, max: 5 }, hidden: true },
      { args: [[-100]], expected: { sum: -100, max: -100 }, hidden: true },
    ],
    hints: [
      'One loop can track both values at once.',
      'Start `max` at the first element, not at 0, or an all-negative array gives the wrong answer.',
      'Handle the empty array before the loop.',
    ],
    solution: `function sumAndMax(nums) {
  if (nums.length === 0) return { sum: 0, max: null };
  let sum = 0;
  let max = nums[0];
  for (const n of nums) {
    sum += n;
    if (n > max) max = n;
  }
  return { sum, max };
}`,
    explanation: `**Approach:** one pass. Keep a running \`sum\` and a \`max\` seeded with the **first element** (seeding with 0 is the classic bug: \`[-5, -2]\` would report 0).

**Complexity:** O(n) time, O(1) extra space.

**With built-ins:** \`nums.reduce((a, b) => a + b, 0)\` and \`Math.max(...nums)\`. Note that \`Math.max()\` of an empty array is \`-Infinity\`, and spreading a huge array can overflow the call stack.

**Say aloud:** "I seed max with the first element so negatives work, and I special-case empty input. That is the edge case I'd test first."`,
    followUps: [
      { q: 'Why not initialise max to 0?', a: 'Because an array of only negative numbers would wrongly return 0. Seed with nums[0] or -Infinity.' },
      { q: 'What does Math.max(...[]) return?', a: '-Infinity, so the built-in version still needs an explicit empty-array check if you want null.' },
    ],
  },
  {
    id: 'code-arrays-second-largest',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Second largest distinct number',
    askedIn: 'Common in SDET coding-question lists (Medium, "Top Java Coding Interview Questions for SDET")',
    prompt: `Write \`secondLargest(nums)\` that returns the second largest **distinct** value. Return \`null\` if there is none. Do not sort.

**Example 1**
\`\`\`
secondLargest([10, 5, 8, 20])  // 10
\`\`\`
**Example 2**
\`\`\`
secondLargest([7, 7, 7])  // null
\`\`\`

**Constraints**
- \`0 <= nums.length <= 10^5\`
- Duplicates allowed; negatives allowed.`,
    fnName: 'secondLargest',
    starter: `/**
 * @param {number[]} nums
 * @returns {number | null}
 */
function secondLargest(nums) {
  // your code
}`,
    tests: [
      { args: [[10, 5, 8, 20]], expected: 10 },
      { args: [[7, 7, 7]], expected: null },
      { args: [[]], expected: null },
      { args: [[4]], expected: null },
      { args: [[20, 20, 10]], expected: 10 },
      { args: [[-1, -5, -3]], expected: -3, hidden: true },
      { args: [[1, 2]], expected: 1, hidden: true },
      { args: [[5, 9, 9, 3, 8]], expected: 8, hidden: true },
    ],
    hints: [
      'Track two variables: `first` and `second`.',
      'When you see a new maximum, the old maximum becomes `second`.',
      'Skip values equal to `first` so duplicates of the max do not count.',
    ],
    solution: `function secondLargest(nums) {
  let first = -Infinity;
  let second = -Infinity;
  for (const n of nums) {
    if (n > first) {
      second = first;
      first = n;
    } else if (n < first && n > second) {
      second = n;
    }
  }
  return second === -Infinity ? null : second;
}`,
    explanation: `**Approach:** single pass with two trackers. A bigger value pushes \`first\` down into \`second\`; a value strictly between them replaces \`second\`. Equal-to-max values are ignored, which handles \`[20, 20, 10]\`.

**Complexity:** O(n) time, O(1) space.

**With built-ins:** \`[...new Set(nums)].sort((a, b) => b - a)[1] ?? null\`. It's shorter but O(n log n), and forgetting the comparator sorts numbers as strings.

**Say aloud:** "I clarify whether duplicates count, then do one pass. Edge cases are empty input, a single element and all-equal values."`,
    followUps: [
      { q: 'How would you find the k-th largest?', a: 'Sort distinct values descending and index k-1 (O(n log n)), or keep a min-heap of size k for O(n log k).' },
    ],
  },
  {
    id: 'code-arrays-remove-duplicates',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Remove duplicates (keep first occurrence)',
    askedIn: 'Reported by SDET candidates on Glassdoor ("remove duplicates from an array of strings")',
    prompt: `Write \`removeDuplicates(arr)\` that returns a new array with duplicates removed, keeping the **first** occurrence order. Interviewers usually ask for two versions, one with \`Set\` and one without.

**Example 1**
\`\`\`
removeDuplicates([1, 2, 2, 3, 1])  // [1, 2, 3]
\`\`\`
**Example 2**
\`\`\`
removeDuplicates(['a', 'b', 'a'])  // ['a', 'b']
\`\`\`

**Constraints**
- Elements are numbers or strings.
- Do not mutate the input.`,
    fnName: 'removeDuplicates',
    starter: `/**
 * @param {(number|string)[]} arr
 * @returns {(number|string)[]}
 */
function removeDuplicates(arr) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] },
      { args: [['a', 'b', 'a']], expected: ['a', 'b'] },
      { args: [[]], expected: [] },
      { args: [[5]], expected: [5] },
      { args: [[9, 9, 9]], expected: [9] },
      { args: [[1, '1', 1]], expected: [1, '1'], hidden: true },
      { args: [[3, 2, 1, 2, 3]], expected: [3, 2, 1], hidden: true },
    ],
    hints: [
      'With built-ins, a `Set` keeps only unique values and preserves insertion order.',
      'Without `Set`, keep a "seen" lookup and push only values you have not seen.',
      'Careful: `1` and `"1"` are different values. A plain object key would merge them.',
    ],
    solution: `function removeDuplicates(arr) {
  const result = [];
  for (const item of arr) {
    if (!result.includes(item)) result.push(item);
  }
  return result;
}`,
    explanation: `**Approach (no Set):** walk the array and push each item only if it is not already in \`result\`. This is O(n²) because \`includes\` scans, which is fine for short lists.

**With built-ins:** \`[...new Set(arr)]\` is O(n) and keeps insertion order. Another option is \`arr.filter((x, i) => arr.indexOf(x) === i)\`.

**Faster without Set:** a \`Map\` or a seen-object gives O(n). With a plain object, \`1\` and \`"1"\` collide as keys, so use a \`Map\` or prefix keys with \`typeof\`.

**Complexity:** Set version O(n) time / O(n) space.

**Say aloud:** "Set is the idiomatic answer. If you want it without Set I'll use a seen lookup, and I'll watch for number-vs-string key collisions."`,
    followUps: [
      { q: 'How would you remove duplicate objects like {id: 1}?', a: 'Set compares by reference, so dedupe by a key: keep a Set of seen ids and filter items whose id is not yet in it.' },
    ],
  },
  {
    id: 'code-arrays-reverse-in-place',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Reverse an array in place',
    prompt: `Write \`reverseInPlace(arr)\` that reverses the array **in place** (mutating it) using two pointers, without \`.reverse()\`, and returns the same array.

**Example 1**
\`\`\`
reverseInPlace([1, 2, 3, 4])  // [4, 3, 2, 1]
\`\`\`
**Example 2**
\`\`\`
reverseInPlace(['a'])  // ['a']
\`\`\`

**Constraints**
- O(1) extra space: no new array.`,
    fnName: 'reverseInPlace',
    starter: `/**
 * @param {any[]} arr
 * @returns {any[]} the same array, reversed
 */
function reverseInPlace(arr) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: [4, 3, 2, 1] },
      { args: [['a']], expected: ['a'] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3]], expected: [3, 2, 1] },
      { args: [[true, false]], expected: [false, true] },
      { args: [[5, 5, 1, 5]], expected: [5, 1, 5, 5], hidden: true },
      { args: [[0, -1, -2, -3, -4]], expected: [-4, -3, -2, -1, 0], hidden: true },
    ],
    hints: [
      'Put one pointer at the start and one at the end.',
      'Swap them, then move both pointers toward the middle.',
      'Stop when the pointers meet or cross.',
    ],
    solution: `function reverseInPlace(arr) {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
    left++;
    right--;
  }
  return arr;
}`,
    explanation: `**Approach:** two pointers. Swap \`arr[left]\` and \`arr[right]\`, then move inward. Destructuring \`[arr[l], arr[r]] = [arr[r], arr[l]]\` also works.

**Complexity:** O(n) time (n/2 swaps), O(1) space.

**With built-ins:** \`arr.reverse()\` mutates in place. \`[...arr].reverse()\` or \`arr.toReversed()\` (ES2023) returns a copy.

**Say aloud:** "Two pointers, swap and move inward. Odd lengths leave the middle untouched, and empty and single-element arrays fall straight through the loop."`,
    followUps: [
      { q: 'Why can mutating an input be a problem in test code?', a: 'Shared fixtures get silently changed for later tests. Prefer copies (toReversed / spread) unless in-place is required.' },
    ],
  },
  {
    id: 'code-arrays-rotate',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Rotate array right by k',
    prompt: `Write \`rotateRight(nums, k)\` that returns the array rotated to the right by \`k\` steps. \`k\` may be larger than the array length.

**Example 1**
\`\`\`
rotateRight([1, 2, 3, 4, 5], 2)  // [4, 5, 1, 2, 3]
\`\`\`
**Example 2**
\`\`\`
rotateRight([1, 2, 3], 4)  // [3, 1, 2]   (4 % 3 = 1)
\`\`\`

**Constraints**
- \`0 <= k <= 10^9\`
- Empty array returns \`[]\`.`,
    fnName: 'rotateRight',
    starter: `/**
 * @param {number[]} nums
 * @param {number} k
 * @returns {number[]}
 */
function rotateRight(nums, k) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
      { args: [[1, 2, 3], 4], expected: [3, 1, 2] },
      { args: [[], 3], expected: [] },
      { args: [[1, 2, 3], 0], expected: [1, 2, 3] },
      { args: [[1, 2, 3], 3], expected: [1, 2, 3] },
      { args: [[7], 100], expected: [7], hidden: true },
      { args: [[1, 2, 3, 4, 5, 6], 1000000000], expected: [3, 4, 5, 6, 1, 2], hidden: true },
    ],
    hints: [
      'Rotating by `n` (the length) changes nothing, so reduce `k` with `k % n`.',
      'The last `k` items move to the front.',
      'Guard against `n === 0` before using `%`.',
    ],
    solution: `function rotateRight(nums, k) {
  const n = nums.length;
  if (n === 0) return [];
  const steps = k % n;
  const result = [];
  for (let i = 0; i < n; i++) {
    result[(i + steps) % n] = nums[i];
  }
  return result;
}`,
    explanation: `**Approach:** normalise \`k = k % n\`, then place each element at index \`(i + k) % n\` in a new array.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`[...nums.slice(n - k), ...nums.slice(0, n - k)]\`. For **in-place O(1) space**, use the triple reverse: reverse the whole array, then the first k items, then the rest.

**Say aloud:** "I take k mod n first, otherwise a huge k loops forever or indexes out of range. Then I check empty and k = 0."`,
    followUps: [
      { q: 'How do you rotate in place with O(1) extra space?', a: 'Reverse the whole array, reverse the first k elements, then reverse the remaining n-k elements.' },
    ],
  },
  {
    id: 'code-arrays-missing-number',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Find the missing number in 1..n',
    prompt: `An array contains the numbers \`1..n\` with exactly **one** missing, in any order (length \`n - 1\`). Write \`missingNumber(nums)\` that returns the missing number.

**Example 1**
\`\`\`
missingNumber([1, 2, 4, 5])  // 3
\`\`\`
**Example 2**
\`\`\`
missingNumber([2, 3, 1, 5])  // 4
\`\`\`

**Constraints**
- \`n >= 1\`. If the input is \`[]\`, n is 1 and the answer is 1.
- No duplicates.`,
    fnName: 'missingNumber',
    starter: `/**
 * @param {number[]} nums
 * @returns {number}
 */
function missingNumber(nums) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 4, 5]], expected: 3 },
      { args: [[2, 3, 1, 5]], expected: 4 },
      { args: [[]], expected: 1 },
      { args: [[1]], expected: 2 },
      { args: [[2]], expected: 1 },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], expected: 10, hidden: true },
      { args: [[10, 9, 8, 7, 6, 5, 4, 3, 1]], expected: 2, hidden: true },
    ],
    hints: [
      'The array should have n = nums.length + 1 numbers.',
      'The sum of 1..n is `n * (n + 1) / 2`.',
      'Expected sum minus actual sum is the missing number.',
    ],
    solution: `function missingNumber(nums) {
  const n = nums.length + 1;
  let expected = (n * (n + 1)) / 2;
  for (const x of nums) expected -= x;
  return expected;
}`,
    explanation: `**Approach:** Gauss's formula. The expected total of 1..n is \`n(n+1)/2\`, and subtracting every present number leaves the missing one.

**Complexity:** O(n) time, O(1) space.

**Alternatives:** XOR all of 1..n with all elements (avoids overflow in languages with fixed ints), or put values in a \`Set\` and scan 1..n for the absent one (O(n) space). Sorting works but costs O(n log n).

**Say aloud:** "Since exactly one is missing, the sum difference gives it in one pass. If there could be several missing, I'd switch to a Set."`,
    followUps: [
      { q: 'What if two numbers were missing?', a: 'Use a Set of present values and scan 1..n collecting absent ones, or use both the sum and the sum of squares to solve for the two unknowns.' },
    ],
  },
  {
    id: 'code-arrays-move-zeros',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Move zeros to the end',
    prompt: `Write \`moveZeros(nums)\` that returns the array with all \`0\`s moved to the end while keeping the **relative order** of the non-zero elements.

**Example 1**
\`\`\`
moveZeros([0, 1, 0, 3, 12])  // [1, 3, 12, 0, 0]
\`\`\`
**Example 2**
\`\`\`
moveZeros([0, 0, 1])  // [1, 0, 0]
\`\`\`

**Constraints**
- Try to do it in one pass with O(1) extra space (write pointer).`,
    fnName: 'moveZeros',
    starter: `/**
 * @param {number[]} nums
 * @returns {number[]}
 */
function moveZeros(nums) {
  // your code
}`,
    tests: [
      { args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { args: [[0, 0, 1]], expected: [1, 0, 0] },
      { args: [[]], expected: [] },
      { args: [[0]], expected: [0] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[0, 0, 0]], expected: [0, 0, 0], hidden: true },
      { args: [[4, 0, -2, 0, 0, 7]], expected: [4, -2, 7, 0, 0, 0], hidden: true },
    ],
    hints: [
      'Keep a write index that starts at 0.',
      'Copy every non-zero value to the write index and advance it.',
      'Fill the rest of the array with zeros.',
    ],
    solution: `function moveZeros(nums) {
  let write = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) nums[write++] = nums[i];
  }
  while (write < nums.length) nums[write++] = 0;
  return nums;
}`,
    explanation: `**Approach:** a write pointer. Compact the non-zeros to the front in order, then fill the tail with zeros. This is stable and in place.

**Complexity:** O(n) time, O(1) space.

**With built-ins:** \`[...nums.filter(x => x !== 0), ...nums.filter(x => x === 0)]\`. It's clear but allocates new arrays. Sorting does **not** work, because it breaks relative order.

**Say aloud:** "The requirement to keep order rules out sorting. I'll use a write index, which also answers the in-place follow-up."`,
    followUps: [
      { q: 'Is your solution stable?', a: 'Yes. Non-zero elements are copied in their original order, so their relative order is preserved.' },
    ],
  },
  {
    id: 'code-arrays-two-sum',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Two Sum (return indices)',
    prompt: `Write \`twoSum(nums, target)\` that returns the indices \`[i, j]\` (with \`i < j\`) of the **first** pair whose values add up to \`target\`, where "first" means smallest \`j\`. Return \`[]\` if no pair exists.

**Example 1**
\`\`\`
twoSum([2, 7, 11, 15], 9)  // [0, 1]
\`\`\`
**Example 2**
\`\`\`
twoSum([3, 2, 4], 6)  // [1, 2]
\`\`\`

**Constraints**
- An element cannot be used twice.
- Aim for O(n).`,
    fnName: 'twoSum',
    starter: `/**
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[]}
 */
function twoSum(nums, target) {
  // your code
}`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[1, 2, 3], 100], expected: [] },
      { args: [[], 0], expected: [] },
      { args: [[5], 10], expected: [], hidden: true },
      { args: [[-3, 4, 3, 90], 0], expected: [0, 2], hidden: true },
      { args: [[1, 5, 1, 5], 10], expected: [1, 3], hidden: true },
    ],
    hints: [
      'Brute force: check every pair with two loops (O(n²)).',
      'For each number, the partner you need is `target - num`.',
      'Store values you have seen in a Map of value → index, and check it before inserting the current one.',
    ],
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let j = 0; j < nums.length; j++) {
    const need = target - nums[j];
    if (seen.has(need)) return [seen.get(need), j];
    if (!seen.has(nums[j])) seen.set(nums[j], j);
  }
  return [];
}`,
    explanation: `**Approach:** hash map. For each index \`j\`, look up the complement \`target - nums[j]\` among earlier values. Checking **before** inserting prevents using one element twice (e.g. \`[5]\`, target 10).

**Complexity:** O(n) time, O(n) space.

**Alternative:** nested loops, O(n²) time and O(1) space. Or sort with two pointers, but sorting loses the original indices unless you carry them along.

**Say aloud:** "I'd mention the brute force first, then optimise with a Map from value to index. I check the map before inserting so the same element isn't reused."`,
    followUps: [
      { q: 'What if the array were already sorted?', a: 'Use two pointers from both ends: move left up if the sum is too small, right down if too big. O(n) time, O(1) space.' },
    ],
  },
  {
    id: 'code-arrays-merge-sorted',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Merge two sorted arrays',
    prompt: `Write \`mergeSorted(a, b)\` that merges two ascending arrays into one ascending array **without** calling \`sort\`.

**Example 1**
\`\`\`
mergeSorted([1, 3, 5], [2, 4, 6])  // [1, 2, 3, 4, 5, 6]
\`\`\`
**Example 2**
\`\`\`
mergeSorted([], [1, 2])  // [1, 2]
\`\`\`

**Constraints**
- Keep duplicates.
- Target O(n + m).`,
    fnName: 'mergeSorted',
    starter: `/**
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function mergeSorted(a, b) {
  // your code
}`,
    tests: [
      { args: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] },
      { args: [[], [1, 2]], expected: [1, 2] },
      { args: [[1, 2], []], expected: [1, 2] },
      { args: [[], []], expected: [] },
      { args: [[1, 1, 2], [1, 3]], expected: [1, 1, 1, 2, 3] },
      { args: [[-5, 0, 10], [-6, 11]], expected: [-6, -5, 0, 10, 11], hidden: true },
      { args: [[1, 2, 3], [4, 5, 6, 7, 8]], expected: [1, 2, 3, 4, 5, 6, 7, 8], hidden: true },
    ],
    hints: [
      'Use one pointer per array.',
      'Push the smaller current value and advance that pointer.',
      'When one array runs out, append the rest of the other.',
    ],
    solution: `function mergeSorted(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) out.push(a[i++]);
    else out.push(b[j++]);
  }
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}`,
    explanation: `**Approach:** the merge step of merge sort. Two pointers, always take the smaller head, then drain whichever array has leftovers.

**Complexity:** O(n + m) time, O(n + m) space for the output.

**With built-ins:** \`[...a, ...b].sort((x, y) => x - y)\` is O((n+m) log(n+m)) and ignores the fact that the inputs are already sorted. Interviewers want to see that you use that fact.

**Say aloud:** "Both inputs are sorted, so a linear merge beats concatenate-and-sort. Using \`<=\` keeps the merge stable."`,
    followUps: [
      { q: 'How would you merge k sorted arrays?', a: 'Use a min-heap of the current heads (O(N log k)), or merge pairs repeatedly like merge sort does.' },
    ],
  },
  {
    id: 'code-arrays-chunk',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Chunk an array',
    prompt: `Write \`chunk(arr, size)\` that splits the array into groups of length \`size\`. The last group may be shorter. This is useful for batching test data or API calls.

**Example 1**
\`\`\`
chunk([1, 2, 3, 4, 5], 2)  // [[1, 2], [3, 4], [5]]
\`\`\`
**Example 2**
\`\`\`
chunk(['a', 'b', 'c'], 3)  // [['a', 'b', 'c']]
\`\`\`

**Constraints**
- \`size >= 1\`
- Empty input returns \`[]\`.`,
    fnName: 'chunk',
    starter: `/**
 * @param {any[]} arr
 * @param {number} size
 * @returns {any[][]}
 */
function chunk(arr, size) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [[1, 2], [3, 4], [5]] },
      { args: [['a', 'b', 'c'], 3], expected: [['a', 'b', 'c']] },
      { args: [[], 2], expected: [] },
      { args: [[1, 2, 3], 1], expected: [[1], [2], [3]] },
      { args: [[1, 2], 5], expected: [[1, 2]] },
      { args: [[1, 2, 3, 4, 5, 6], 3], expected: [[1, 2, 3], [4, 5, 6]], hidden: true },
      { args: [[0, 0, 0, 0], 3], expected: [[0, 0, 0], [0]], hidden: true },
    ],
    hints: [
      'Loop with `i += size`.',
      '`arr.slice(i, i + size)` gives one chunk and handles the short last chunk.',
    ],
    solution: `function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}`,
    explanation: `**Approach:** step through the array in increments of \`size\`, slicing each window. \`slice\` clamps at the end, so the last chunk is naturally shorter.

**Complexity:** O(n) time and space.

**Without slice:** keep a \`current\` array, push into it, and when it reaches \`size\` push it to the output and start a new one. After the loop, push any leftover.

**Say aloud:** "I'd validate size >= 1, otherwise the loop never advances. That's an infinite-loop bug I'd want a test for."`,
    followUps: [
      { q: 'What happens if size is 0?', a: 'With i += 0 the loop never ends, so validate the input and throw or return [] for size < 1.' },
    ],
  },
  {
    id: 'code-arrays-flatten',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Flatten a nested array (no .flat)',
    prompt: `Write \`flatten(arr)\` that flattens an arbitrarily nested array into one level **without** using \`Array.prototype.flat\`.

**Example 1**
\`\`\`
flatten([1, [2, [3, [4]], 5]])  // [1, 2, 3, 4, 5]
\`\`\`
**Example 2**
\`\`\`
flatten([[], [[]], 1])  // [1]
\`\`\`

**Constraints**
- Elements are numbers, strings or arrays.
- Keep the original order.`,
    fnName: 'flatten',
    starter: `/**
 * @param {any[]} arr
 * @returns {any[]}
 */
function flatten(arr) {
  // your code
}`,
    tests: [
      { args: [[1, [2, [3, [4]], 5]]], expected: [1, 2, 3, 4, 5] },
      { args: [[[], [[]], 1]], expected: [1] },
      { args: [[]], expected: [] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[['a'], ['b', ['c']]]], expected: ['a', 'b', 'c'] },
      { args: [[[[[[7]]]]]], expected: [7], hidden: true },
      { args: [[0, [0, [0]], 'x']], expected: [0, 0, 0, 'x'], hidden: true },
    ],
    hints: [
      'Use `Array.isArray(item)` to decide whether to go deeper.',
      'Recursion: flatten the inner array and push its items.',
      'Iterative option: use a stack.',
    ],
    solution: `function flatten(arr) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      for (const inner of flatten(item)) out.push(inner);
    } else {
      out.push(item);
    }
  }
  return out;
}`,
    explanation: `**Approach:** recursion. Non-arrays are pushed, arrays are flattened and their results appended.

**Complexity:** O(n) time, where n is the total number of elements across all levels. O(d) call-stack depth.

**With built-ins:** \`arr.flat(Infinity)\`. Iteratively: a stack seeded with the items, popping and pushing children back (reverse at the end, or unshift to keep order). With reduce: \`arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flatten(x) : x), [])\`.

**Say aloud:** "Recursion is the natural fit. For very deep nesting I'd switch to an explicit stack to avoid stack overflow."`,
    followUps: [
      { q: 'How would you flatten only to depth d?', a: 'Pass a depth parameter. Recurse only while depth > 0, decrementing each level, and push arrays as-is when depth hits 0.' },
    ],
  },
  {
    id: 'code-arrays-frequency-count',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Frequency count to an object',
    prompt: `Write \`frequencyCount(arr)\` that returns an object mapping each value to how many times it appears.

**Example 1**
\`\`\`
frequencyCount(['pass', 'fail', 'pass'])  // { pass: 2, fail: 1 }
\`\`\`
**Example 2**
\`\`\`
frequencyCount([1, 2, 1])  // { '1': 2, '2': 1 }
\`\`\`

**Constraints**
- Object keys are strings, so numbers become string keys.
- Empty input returns \`{}\`.`,
    fnName: 'frequencyCount',
    starter: `/**
 * @param {(string|number)[]} arr
 * @returns {Record<string, number>}
 */
function frequencyCount(arr) {
  // your code
}`,
    tests: [
      { args: [['pass', 'fail', 'pass']], expected: { pass: 2, fail: 1 } },
      { args: [[1, 2, 1]], expected: { '1': 2, '2': 1 } },
      { args: [[]], expected: {} },
      { args: [['x']], expected: { x: 1 } },
      { args: [['a', 'a', 'a']], expected: { a: 3 } },
      { args: [['A', 'a', 'A']], expected: { A: 2, a: 1 }, hidden: true },
      { args: [['skip', 'pass', 'skip', 'fail', 'skip']], expected: { skip: 3, pass: 1, fail: 1 }, hidden: true },
    ],
    hints: [
      'Start with an empty object `{}`.',
      '`counts[x] = (counts[x] || 0) + 1` handles the first sighting.',
    ],
    solution: `function frequencyCount(arr) {
  const counts = {};
  for (const x of arr) {
    counts[x] = (counts[x] || 0) + 1;
  }
  return counts;
}`,
    explanation: `**Approach:** a hash-map tally. This pattern underlies anagram checks, duplicate finding, test-result summaries and more.

**Complexity:** O(n) time, O(k) space for k distinct values.

**Alternative:** \`arr.reduce((acc, x) => ({ ...acc, [x]: (acc[x] ?? 0) + 1 }), {})\`. It's shorter, but spreading each step is O(n·k). A \`Map\` keeps original key types (number 1 vs string "1").

**Say aloud:** "This is the counting pattern. I'd mention that object keys are coerced to strings, and use a Map if types matter."`,
    followUps: [
      { q: 'How would you return the most frequent value?', a: 'After counting, loop over the entries tracking the key with the highest count. Decide upfront how to break ties.' },
    ],
  },
  {
    id: 'code-arrays-intersection',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Intersection of two arrays',
    prompt: `Write \`intersection(a, b)\` that returns the **unique** values present in both arrays, in the order they first appear in \`a\`.

**Example 1**
\`\`\`
intersection([1, 2, 2, 3], [2, 3, 4])  // [2, 3]
\`\`\`
**Example 2**
\`\`\`
intersection(['a', 'b'], ['c'])  // []
\`\`\`

**Constraints**
- Aim for O(n + m) using a Set.`,
    fnName: 'intersection',
    starter: `/**
 * @param {(number|string)[]} a
 * @param {(number|string)[]} b
 * @returns {(number|string)[]}
 */
function intersection(a, b) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 2, 3], [2, 3, 4]], expected: [2, 3] },
      { args: [['a', 'b'], ['c']], expected: [] },
      { args: [[], [1]], expected: [] },
      { args: [[1, 1, 1], [1]], expected: [1] },
      { args: [[5, 4, 3], [3, 4, 5]], expected: [5, 4, 3] },
      { args: [[1, 2], []], expected: [], hidden: true },
      { args: [['Login', 'Cart', 'Checkout'], ['Checkout', 'Login']], expected: ['Login', 'Checkout'], hidden: true },
    ],
    hints: [
      'Put `b` into a Set for O(1) lookups.',
      'Track what you already added so duplicates in `a` appear once.',
    ],
    solution: `function intersection(a, b) {
  const inB = new Set(b);
  const added = new Set();
  const out = [];
  for (const x of a) {
    if (inB.has(x) && !added.has(x)) {
      out.push(x);
      added.add(x);
    }
  }
  return out;
}`,
    explanation: `**Approach:** build a Set from \`b\`, then walk \`a\` and keep values found in the Set, skipping ones already added.

**Complexity:** O(n + m) time, O(m) space.

**Without Set:** \`a.filter((x, i) => b.includes(x) && a.indexOf(x) === i)\` is O(n·m), fine for small lists.

**Say aloud:** "I clarify whether duplicates should repeat or appear once and which order to keep, then use a Set for linear time."`,
    followUps: [
      { q: 'How would you get the difference (in a but not b)?', a: 'Same Set of b, but keep values where !inB.has(x). Run it both ways to get missing and extra items.' },
    ],
  },
  {
    id: 'code-arrays-find-duplicates',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Find duplicate values',
    prompt: `Write \`findDuplicates(arr)\` that returns each value that appears **more than once**, listed once, in the order its **second** occurrence is reached.

**Example 1**
\`\`\`
findDuplicates([1, 2, 3, 2, 1, 2])  // [2, 1]
\`\`\`
**Example 2**
\`\`\`
findDuplicates(['a', 'b'])  // []
\`\`\`

**Constraints**
- Values are numbers or strings.`,
    fnName: 'findDuplicates',
    starter: `/**
 * @param {(number|string)[]} arr
 * @returns {(number|string)[]}
 */
function findDuplicates(arr) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 3, 2, 1, 2]], expected: [2, 1] },
      { args: [['a', 'b']], expected: [] },
      { args: [[]], expected: [] },
      { args: [[7, 7, 7, 7]], expected: [7] },
      { args: [['x', 'y', 'x', 'y']], expected: ['x', 'y'] },
      { args: [[1, '1', 1]], expected: [1], hidden: true },
      { args: [[0, -1, 0, -1, 5]], expected: [0, -1], hidden: true },
    ],
    hints: [
      'Keep a `seen` Set and a `reported` Set.',
      'If a value is already in `seen` and not yet in `reported`, it is a duplicate to report.',
    ],
    solution: `function findDuplicates(arr) {
  const seen = new Set();
  const reported = new Set();
  const out = [];
  for (const x of arr) {
    if (seen.has(x)) {
      if (!reported.has(x)) {
        reported.add(x);
        out.push(x);
      }
    } else {
      seen.add(x);
    }
  }
  return out;
}`,
    explanation: `**Approach:** two Sets. \`seen\` records first sightings, and \`reported\` ensures each duplicate is output once.

**Complexity:** O(n) time, O(n) space.

**Alternatives:** count frequencies first and keep keys with count > 1 (order then follows first appearance). Or \`arr.filter((x, i) => arr.indexOf(x) !== i)\` piped through a Set, which is O(n²).

**Say aloud:** "In QA this is how I'd find duplicate IDs in an API response. A Set gives it in one pass."`,
    followUps: [
      { q: 'How would you return how many times each duplicate appears?', a: 'Build a frequency map, then keep the entries whose count is greater than 1, e.g. { 2: 3, 1: 2 }.' },
    ],
  },
  {
    id: 'code-arrays-max-subarray',
    category: 'arrays',
    difficulty: 'hard',
    title: "Maximum subarray sum (Kadane's)",
    prompt: `Write \`maxSubarraySum(nums)\` that returns the largest sum of any **contiguous, non-empty** subarray.

**Example 1**
\`\`\`
maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])  // 6  ([4, -1, 2, 1])
\`\`\`
**Example 2**
\`\`\`
maxSubarraySum([-3, -1, -2])  // -1
\`\`\`

**Constraints**
- \`1 <= nums.length <= 10^5\`
- Aim for O(n).`,
    fnName: 'maxSubarraySum',
    starter: `/**
 * @param {number[]} nums  (non-empty)
 * @returns {number}
 */
function maxSubarraySum(nums) {
  // your code
}`,
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[-3, -1, -2]], expected: -1 },
      { args: [[5]], expected: 5 },
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[5, -10, 6]], expected: 6 },
      { args: [[2, -1, 2, -1, 2]], expected: 4, hidden: true },
      { args: [[-5]], expected: -5, hidden: true },
      { args: [[0, 0, 0]], expected: 0, hidden: true },
    ],
    hints: [
      'Brute force: try every start and end (O(n²)).',
      'At each index, either extend the previous subarray or start fresh at this element.',
      '`current = Math.max(x, current + x)`, and track the best `current` seen.',
    ],
    solution: `function maxSubarraySum(nums) {
  let current = nums[0];
  let best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    current = Math.max(nums[i], current + nums[i]);
    best = Math.max(best, current);
  }
  return best;
}`,
    explanation: `**Approach:** Kadane's algorithm. \`current\` is the best sum of a subarray **ending here**. If the running sum so far is negative it only drags you down, so start fresh at the current element. \`best\` is the overall max.

**Complexity:** O(n) time, O(1) space.

**Alternative:** brute force over all (i, j) pairs with a running sum is O(n²). It's a fine first answer to say aloud before optimising.

**Say aloud:** "I seed with the first element, not 0, so all-negative arrays return the least-negative value. I'd test that edge case explicitly."`,
    followUps: [
      { q: 'How would you also return the subarray itself?', a: 'Track a tentative start index that resets when you start fresh, and record start/end whenever best improves.' },
    ],
  },
  {
    id: 'code-arrays-is-sorted',
    category: 'arrays',
    difficulty: 'easy',
    title: 'Is the array sorted ascending?',
    prompt: `Write \`isSortedAsc(arr)\` that returns \`true\` if every element is **less than or equal to** the next one.

**Example 1**
\`\`\`
isSortedAsc([1, 2, 2, 5])  // true
\`\`\`
**Example 2**
\`\`\`
isSortedAsc([3, 1, 2])  // false
\`\`\`

**Constraints**
- Empty and single-element arrays are sorted.
- Numbers only.`,
    fnName: 'isSortedAsc',
    starter: `/**
 * @param {number[]} arr
 * @returns {boolean}
 */
function isSortedAsc(arr) {
  // your code
}`,
    tests: [
      { args: [[1, 2, 2, 5]], expected: true },
      { args: [[3, 1, 2]], expected: false },
      { args: [[]], expected: true },
      { args: [[9]], expected: true },
      { args: [[1, 2, 3, 2]], expected: false },
      { args: [[-5, -5, 0, 10]], expected: true, hidden: true },
      { args: [[2, 10]], expected: true, hidden: true },
    ],
    hints: [
      'Compare each element with the next one.',
      'Return false at the first pair that is out of order.',
    ],
    solution: `function isSortedAsc(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}`,
    explanation: `**Approach:** compare adjacent pairs and fail fast on the first inversion.

**Complexity:** O(n) time, O(1) space.

**With built-ins:** \`arr.every((x, i) => i === 0 || arr[i - 1] <= x)\`. Or compare against \`[...arr].sort((a, b) => a - b)\`, which is O(n log n). Forgetting the comparator sorts \`[2, 10]\` as \`[10, 2]\`, a classic bug when verifying sort in UI tests.

**Say aloud:** "This is exactly how I'd assert a price sort in Playwright: grab the values, then check adjacent pairs."`,
    followUps: [
      { q: 'Why is [10, 2].sort() surprising?', a: 'Default sort compares as strings, so "10" < "2". Always pass (a, b) => a - b for numbers.' },
    ],
  },
  {
    id: 'code-arrays-group-by',
    category: 'arrays',
    difficulty: 'medium',
    title: 'Group objects by a key',
    prompt: `Write \`groupBy(items, key)\` that groups an array of objects by the value of \`key\`. Return an object whose keys are those values and whose values are arrays of the matching items (in original order).

**Example 1**
\`\`\`
groupBy([{ n: 'a', s: 'pass' }, { n: 'b', s: 'fail' }, { n: 'c', s: 'pass' }], 's')
// { pass: [{n:'a',s:'pass'}, {n:'c',s:'pass'}], fail: [{n:'b',s:'fail'}] }
\`\`\`
**Example 2**
\`\`\`
groupBy([], 'x')  // {}
\`\`\`

**Constraints**
- Items missing the key are grouped under \`"undefined"\`.`,
    fnName: 'groupBy',
    starter: `/**
 * @param {object[]} items
 * @param {string} key
 * @returns {Record<string, object[]>}
 */
function groupBy(items, key) {
  // your code
}`,
    tests: [
      {
        args: [[{ n: 'a', s: 'pass' }, { n: 'b', s: 'fail' }, { n: 'c', s: 'pass' }], 's'],
        expected: { pass: [{ n: 'a', s: 'pass' }, { n: 'c', s: 'pass' }], fail: [{ n: 'b', s: 'fail' }] },
      },
      { args: [[], 'x'], expected: {} },
      { args: [[{ t: 1 }], 't'], expected: { '1': [{ t: 1 }] } },
      { args: [[{ a: 1 }, { b: 2 }], 'a'], expected: { '1': [{ a: 1 }], undefined: [{ b: 2 }] } },
      {
        args: [[{ browser: 'chromium', ok: true }, { browser: 'firefox', ok: false }, { browser: 'chromium', ok: false }], 'browser'],
        expected: {
          chromium: [{ browser: 'chromium', ok: true }, { browser: 'chromium', ok: false }],
          firefox: [{ browser: 'firefox', ok: false }],
        },
      },
      { args: [[{ k: 'x' }, { k: 'x' }, { k: 'x' }], 'k'], expected: { x: [{ k: 'x' }, { k: 'x' }, { k: 'x' }] }, hidden: true },
      { args: [[{ p: true }, { p: false }], 'p'], expected: { true: [{ p: true }], false: [{ p: false }] }, hidden: true },
    ],
    hints: [
      'Loop the items and read `item[key]`.',
      'Create the group array on first sight: `groups[k] = groups[k] || []`.',
    ],
    solution: `function groupBy(items, key) {
  const groups = {};
  for (const item of items) {
    const k = String(item[key]);
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}`,
    explanation: `**Approach:** one pass, bucketing items into arrays keyed by \`String(item[key])\`.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`Object.groupBy(items, item => item[key])\` (ES2024) returns a null-prototype object, and \`Map.groupBy\` keeps non-string keys. With reduce: \`items.reduce((acc, it) => ((acc[it[key]] ??= []).push(it), acc), {})\`.

**Say aloud:** "Handy for reports, e.g. grouping Playwright results by project or status. I'd mention Object.groupBy exists but may not be available in older runtimes."`,
    followUps: [
      { q: 'How would you group by a computed value, like price range?', a: 'Accept a callback instead of a key name: const k = fn(item). Object.groupBy works the same way.' },
    ],
  },
  {
    id: 'code-arrays-pairs-with-sum',
    category: 'arrays',
    difficulty: 'medium',
    title: 'All unique pairs that sum to a target',
    prompt: `Write \`pairsWithSum(nums, target)\` that returns every **unique** pair of values \`[a, b]\` with \`a + b === target\` and \`a <= b\`. Sort the result by \`a\` ascending. Each array element can be used at most once per pair.

**Example 1**
\`\`\`
pairsWithSum([1, 5, 3, 7, 4, 2], 6)  // [[1, 5], [2, 4]]
\`\`\`
**Example 2**
\`\`\`
pairsWithSum([3, 3, 3], 6)  // [[3, 3]]
\`\`\`

**Constraints**
- Values may repeat; report each value-pair once.`,
    fnName: 'pairsWithSum',
    starter: `/**
 * @param {number[]} nums
 * @param {number} target
 * @returns {number[][]}
 */
function pairsWithSum(nums, target) {
  // your code
}`,
    tests: [
      { args: [[1, 5, 3, 7, 4, 2], 6], expected: [[1, 5], [2, 4]] },
      { args: [[3, 3, 3], 6], expected: [[3, 3]] },
      { args: [[3], 6], expected: [] },
      { args: [[], 0], expected: [] },
      { args: [[1, 2, 3], 10], expected: [] },
      { args: [[-1, 0, 1, 2, -2], 0], expected: [[-2, 2], [-1, 1]], hidden: true },
      { args: [[2, 2, 2, 4, 4], 6], expected: [[2, 4]], hidden: true },
      { args: [[5, 1, 1], 2], expected: [[1, 1]], hidden: true },
    ],
    hints: [
      'Sort a copy, then use two pointers from both ends.',
      'If the sum is too small move left up; too big, move right down.',
      'After a match, skip over repeated values on both sides.',
    ],
    solution: `function pairsWithSum(nums, target) {
  const s = [...nums].sort((a, b) => a - b);
  const out = [];
  let l = 0;
  let r = s.length - 1;
  while (l < r) {
    const sum = s[l] + s[r];
    if (sum === target) {
      out.push([s[l], s[r]]);
      const lv = s[l];
      const rv = s[r];
      while (l < r && s[l] === lv) l++;
      while (l < r && s[r] === rv) r--;
    } else if (sum < target) {
      l++;
    } else {
      r--;
    }
  }
  return out;
}`,
    explanation: `**Approach:** sort a copy, then use two pointers. On a match, record it and skip duplicates on both sides so each value-pair appears once. \`l < r\` guarantees two different elements, so \`[3]\` with target 6 gives nothing.

**Complexity:** O(n log n) for the sort, O(n) for the scan. O(n) space for the copy.

**Alternative (hash):** count values in a Map. For each distinct value \`a <= target - a\`, check that the complement exists (and that count >= 2 when \`a === target - a\`). That's O(n), then sort the output.

**Say aloud:** "Unlike Two Sum, I return values, not indices, so sorting is allowed. I'd clarify whether [3, 3] needs two separate 3s."`,
    followUps: [
      { q: 'How does this extend to three numbers (3Sum)?', a: 'Sort, fix each index i, then run the same two-pointer search on the rest for target - nums[i]. That is O(n²).' },
    ],
  },
];
