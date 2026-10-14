import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-logic-fizzbuzz',
    category: 'logic',
    difficulty: 'easy',
    title: 'FizzBuzz (return an array)',
    prompt: `Write \`fizzBuzz(n)\` that returns an array for \`1..n\`: \`"FizzBuzz"\` for multiples of 3 **and** 5, \`"Fizz"\` for multiples of 3, \`"Buzz"\` for multiples of 5, and otherwise the number as a **string**.

**Example 1**
\`\`\`
fizzBuzz(5)  // ['1', '2', 'Fizz', '4', 'Buzz']
\`\`\`
**Example 2**
\`\`\`
fizzBuzz(15).at(-1)  // 'FizzBuzz'
\`\`\`

**Constraints**
- \`0 <= n <= 10^4\`; \`n = 0\` returns \`[]\`.`,
    fnName: 'fizzBuzz',
    starter: `/**
 * @param {number} n
 * @returns {string[]}
 */
function fizzBuzz(n) {
  // your code
}`,
    tests: [
      { args: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      { args: [0], expected: [] },
      { args: [1], expected: ['1'] },
      { args: [3], expected: ['1', '2', 'Fizz'] },
      { args: [15], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] },
      { args: [10], expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz'], hidden: true },
      { args: [2], expected: ['1', '2'], hidden: true },
    ],
    hints: [
      'Check the "both" case (divisible by 15) first.',
      'Use the modulo operator: `i % 3 === 0`.',
      'Convert numbers with `String(i)`.',
    ],
    solution: `function fizzBuzz(n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz');
    else if (i % 3 === 0) out.push('Fizz');
    else if (i % 5 === 0) out.push('Buzz');
    else out.push(String(i));
  }
  return out;
}`,
    explanation: `**Approach:** loop 1..n and check the most specific condition (15) first. Otherwise 15 would match "Fizz" and stop.

**Complexity:** O(n) time and space.

**Alternative (string building):** \`let s = ''; if (i % 3 === 0) s += 'Fizz'; if (i % 5 === 0) s += 'Buzz'; out.push(s || String(i));\`. This scales to new rules (e.g. 7 → "Bazz") without combinatorial branches.

**Say aloud:** "Condition order matters, and I'd test the boundaries 0, 1, 3, 5 and 15. The string-building variant is easier to extend."`,
    followUps: [
      { q: 'How would you make the rules configurable?', a: 'Pass an array like [[3,"Fizz"],[5,"Buzz"]], concatenate the words for every divisor that matches, and fall back to the number.' },
    ],
  },
  {
    id: 'code-logic-factorial',
    category: 'logic',
    difficulty: 'easy',
    title: 'Factorial',
    prompt: `Write \`factorial(n)\` that returns \`n!\` (the product of 1..n). \`0! = 1\`. Return \`null\` for negative input.

**Example 1**
\`\`\`
factorial(5)  // 120
\`\`\`
**Example 2**
\`\`\`
factorial(0)  // 1
\`\`\`

**Constraints**
- \`n\` is an integer, at most 18 (stays within \`Number.MAX_SAFE_INTEGER\`).`,
    fnName: 'factorial',
    starter: `/**
 * @param {number} n
 * @returns {number | null}
 */
function factorial(n) {
  // your code
}`,
    tests: [
      { args: [5], expected: 120 },
      { args: [0], expected: 1 },
      { args: [1], expected: 1 },
      { args: [-3], expected: null },
      { args: [10], expected: 3628800 },
      { args: [18], expected: 6402373705728000, hidden: true },
      { args: [3], expected: 6, hidden: true },
    ],
    hints: [
      'Iterative: multiply a running product by 2, 3, ... n.',
      'Recursive: `n * factorial(n - 1)` with base case `n <= 1`.',
    ],
    solution: `function factorial(n) {
  if (n < 0) return null;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}`,
    explanation: `**Approach:** an iterative product starting from 1, which naturally gives \`0! = 1! = 1\`.

**Complexity:** O(n) time, O(1) space. The recursive version uses O(n) stack.

**Alternative:** recursion, \`return n <= 1 ? 1 : n * factorial(n - 1)\`. It's elegant, but very deep recursion can overflow the stack. Beyond 18, results exceed \`MAX_SAFE_INTEGER\`; use \`BigInt\` (\`1n\`).

**Say aloud:** "I'd mention both versions, the base case for 0, negative-input handling, and precision limits for large n."`,
    followUps: [
      { q: 'What happens with factorial(25) using Number?', a: 'The result exceeds Number.MAX_SAFE_INTEGER, so it loses precision. Use BigInt for exact large factorials.' },
    ],
  },
  {
    id: 'code-logic-fibonacci',
    category: 'logic',
    difficulty: 'easy',
    title: 'First n Fibonacci numbers',
    prompt: `Write \`fibonacci(n)\` that returns an array of the first \`n\` Fibonacci numbers, starting \`0, 1\`.

**Example 1**
\`\`\`
fibonacci(7)  // [0, 1, 1, 2, 3, 5, 8]
\`\`\`
**Example 2**
\`\`\`
fibonacci(1)  // [0]
\`\`\`

**Constraints**
- \`0 <= n <= 70\`; \`n = 0\` returns \`[]\`.`,
    fnName: 'fibonacci',
    starter: `/**
 * @param {number} n
 * @returns {number[]}
 */
function fibonacci(n) {
  // your code
}`,
    tests: [
      { args: [7], expected: [0, 1, 1, 2, 3, 5, 8] },
      { args: [1], expected: [0] },
      { args: [0], expected: [] },
      { args: [2], expected: [0, 1] },
      { args: [10], expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34] },
      { args: [3], expected: [0, 1, 1], hidden: true },
      { args: [12], expected: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89], hidden: true },
    ],
    hints: [
      'Handle `n = 0` and `n = 1` explicitly.',
      'Each next value is the sum of the previous two: `out[i - 1] + out[i - 2]`.',
    ],
    solution: `function fibonacci(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    if (i < 2) out.push(i);
    else out.push(out[i - 1] + out[i - 2]);
  }
  return out;
}`,
    explanation: `**Approach:** build the list iteratively, where the first two are 0 and 1 and each later value is the sum of the previous two.

**Complexity:** O(n) time and space.

**Alternative:** naive recursion \`fib(n) = fib(n-1) + fib(n-2)\` is O(2^n). Memoisation brings it to O(n). Interviewers like hearing why the naive version is slow (repeated subproblems).

**Say aloud:** "Iterative is linear. If asked for recursion, I'd add memoisation and explain the exponential blow-up without it."`,
    followUps: [
      { q: 'Why is naive recursive Fibonacci slow?', a: 'It recomputes the same subproblems repeatedly, fib(n-2) is computed by both branches, giving O(2^n) calls. Memoising fixes it.' },
    ],
  },
  {
    id: 'code-logic-is-prime',
    category: 'logic',
    difficulty: 'easy',
    title: 'Prime check',
    prompt: `Write \`isPrime(n)\` that returns \`true\` if \`n\` is a prime number (greater than 1 with no divisors other than 1 and itself).

**Example 1**
\`\`\`
isPrime(7)  // true
\`\`\`
**Example 2**
\`\`\`
isPrime(9)  // false
\`\`\`

**Constraints**
- \`n\` is an integer (may be 0, 1 or negative, which are not prime).
- Aim for O(√n).`,
    fnName: 'isPrime',
    starter: `/**
 * @param {number} n
 * @returns {boolean}
 */
function isPrime(n) {
  // your code
}`,
    tests: [
      { args: [7], expected: true },
      { args: [9], expected: false },
      { args: [2], expected: true },
      { args: [1], expected: false },
      { args: [0], expected: false },
      { args: [-7], expected: false, hidden: true },
      { args: [97], expected: true, hidden: true },
      { args: [7919], expected: true, hidden: true },
      { args: [7917], expected: false },
    ],
    hints: [
      'Numbers below 2 are not prime.',
      'You only need to test divisors up to `Math.sqrt(n)`.',
      'Skip even numbers after checking 2.',
    ],
    solution: `function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}`,
    explanation: `**Approach:** trial division up to √n. If n has a factor larger than √n, it must pair with one smaller than √n, which we would already have found. Handle 2 separately, then test only odd divisors.

**Complexity:** O(√n) time, O(1) space.

**Alternative:** Sieve of Eratosthenes when you need all primes up to N (O(N log log N)). The naive loop to n-1 is O(n).

**Say aloud:** "Edge cases first: below 2, 2 itself and even numbers. Then √n trial division. I use \`d * d <= n\` to avoid a floating-point sqrt."`,
    followUps: [
      { q: 'How would you list all primes up to 100 efficiently?', a: 'Sieve of Eratosthenes: mark multiples of each prime starting at p*p as composite. The unmarked numbers are prime.' },
    ],
  },
  {
    id: 'code-logic-digit-sum',
    category: 'logic',
    difficulty: 'easy',
    title: 'Sum of digits',
    prompt: `Write \`digitSum(n)\` that returns the sum of the digits of an integer. Ignore the sign of negative numbers.

**Example 1**
\`\`\`
digitSum(1234)  // 10
\`\`\`
**Example 2**
\`\`\`
digitSum(-905)  // 14
\`\`\`

**Constraints**
- Try it arithmetically (\`% 10\`, divide by 10) without converting to a string.`,
    fnName: 'digitSum',
    starter: `/**
 * @param {number} n  integer
 * @returns {number}
 */
function digitSum(n) {
  // your code
}`,
    tests: [
      { args: [1234], expected: 10 },
      { args: [-905], expected: 14 },
      { args: [0], expected: 0 },
      { args: [7], expected: 7 },
      { args: [1000], expected: 1 },
      { args: [99999], expected: 45, hidden: true },
      { args: [-1], expected: 1, hidden: true },
    ],
    hints: [
      'Take the absolute value first.',
      '`n % 10` is the last digit; `Math.floor(n / 10)` drops it.',
    ],
    solution: `function digitSum(n) {
  let x = Math.abs(n);
  let sum = 0;
  while (x > 0) {
    sum += x % 10;
    x = Math.floor(x / 10);
  }
  return sum;
}`,
    explanation: `**Approach:** peel off the last digit with \`% 10\` and drop it with integer division until nothing is left.

**Complexity:** O(d) for d digits, O(1) space.

**With built-ins:** \`String(Math.abs(n)).split('').reduce((s, c) => s + Number(c), 0)\`. Without \`Math.abs\`, the "-" character becomes \`NaN\`.

**Say aloud:** "The arithmetic version shows I understand place value. The string version is quicker to write. Negatives and zero are my edge cases."`,
    followUps: [
      { q: 'How would you reduce to a single digit (digital root)?', a: 'Repeat the digit sum until the result is below 10, or use the formula 1 + (n - 1) % 9 for positive n.' },
    ],
  },
  {
    id: 'code-logic-leap-year',
    category: 'logic',
    difficulty: 'easy',
    title: 'Leap year',
    prompt: `Write \`isLeapYear(year)\` using the Gregorian rules: divisible by 4, **except** centuries, **unless** divisible by 400. Date-handling bugs make this a favourite for testers, because it's a natural boundary-value case.

**Example 1**
\`\`\`
isLeapYear(2024)  // true
\`\`\`
**Example 2**
\`\`\`
isLeapYear(1900)  // false
\`\`\`

**Constraints**
- \`1 <= year <= 9999\``,
    fnName: 'isLeapYear',
    starter: `/**
 * @param {number} year
 * @returns {boolean}
 */
function isLeapYear(year) {
  // your code
}`,
    tests: [
      { args: [2024], expected: true },
      { args: [1900], expected: false },
      { args: [2000], expected: true },
      { args: [2023], expected: false },
      { args: [2100], expected: false },
      { args: [2400], expected: true, hidden: true },
      { args: [4], expected: true, hidden: true },
    ],
    hints: [
      'Divisible by 400 → leap. Divisible by 100 → not leap. Divisible by 4 → leap.',
      'Check in that order, or combine: `(y % 4 === 0 && y % 100 !== 0) || y % 400 === 0`.',
    ],
    solution: `function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}`,
    explanation: `**Approach:** encode the three rules in one boolean expression.

**Complexity:** O(1).

**Alternative:** let the Date API decide. \`new Date(year, 1, 29).getMonth() === 1\` (Feb 29 exists only in leap years). Note that Date maps years 0–99 to 1900–1999, so it fails for year 4.

**Say aloud:** "As a tester, my equivalence classes are: not divisible by 4, divisible by 4, century and 400-year. That's 2023, 2024, 1900 and 2000."`,
    followUps: [
      { q: 'Which test data would you pick for a date-of-birth field?', a: 'Feb 29 on a leap year (2024) and a non-leap year (2023), the century cases 1900 and 2000, plus month and day boundaries like 31 April.' },
    ],
  },
];
