import type { CompanyQuestion } from '../../types';

// Company-reported JavaScript / coding interview questions for QA, SDET and test-automation roles.
// Many coding rounds let candidates pick any language; answers here are in JavaScript.
// Every solution was run under Node with assertions before publishing.

const GFG_PAYTM_SDET = 'https://www.geeksforgeeks.org/interview-experiences/paytm-interview-experience-for-sdet-2022/';
const GFG_TTN = 'https://www.geeksforgeeks.org/interview-experiences/to-the-new-interview-experience-for-quality-engineer/';
const GFG_COUPA = 'https://www.geeksforgeeks.org/interview-experiences/coupa-software-interview-experience-sdet-role-full-time/';
const GFG_COMMVAULT = 'https://www.geeksforgeeks.org/interview-experiences/commvault-interview-experience-for-sdet/';
const GFG_INFOSYS_UI = 'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-for-test-engineer-ui-automation/';
const GFG_INFOSYS_AUTO =
  'https://www.geeksforgeeks.org/interview-experiences/infosys-interview-experience-for-automation-tester-4-6-years-of-experience-professional/';
const GFG_AMAZON_SDET = 'https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-set-432-sdet-off-campus/';
const GFG_INFOEDGE = 'https://www.geeksforgeeks.org/interview-experiences/infoedge-interview-experience-for-testing-on-campus/';
const GFG_GREY_ORANGE = 'https://www.geeksforgeeks.org/interview-experiences/grey-orange-interview-experience-for-sdet-on-campus/';
const GFG_ACKO = 'https://www.geeksforgeeks.org/interview-experiences/acko-interview-experience-for-sdet-internppo-on-campus/';
const GFG_JPMORGAN = 'https://www.geeksforgeeks.org/jp-morgan-interview-experience-sdet-role-for-experienced/';
const LC_AMAZON_LONDON = 'https://leetcode.com/discuss/post/300827/';
const LC_AMAZON_QAE = 'https://leetcode.com/discuss/post/5573766/';
const LC_SWIGGY = 'https://leetcode.com/discuss/interview-experience/5235311/Swiggy-or-SDET-or-Remote-or-May-2024-Offer/';
const LC_MASTERCARD = 'https://leetcode.com/discuss/post/6165153/';
const LC_SERVICENOW = 'https://leetcode.com/discuss/interview-experience/6396630/ServiceNow-SDET-Interview-Experience/';
const LC_LIVSPACE = 'https://leetcode.com/discuss/post/564679/';
const LC_EQ = 'https://leetcode.com/discuss/post/4366315/';
const LC_ZEPTO = 'https://leetcode.com/discuss/post/6026438/';
const MD_STRYKER = 'https://medium.com/@ArpitChoubey9/stryker-qa-automation-interview-question-0822c41c2cce';
const MD_GLOBANT = 'https://medium.com/@ArpitChoubey9/globant-automation-testing-interview-questions-738ac3bd4f9a';
const MD_BARCLAYS = 'https://medium.com/@ArpitChoubey9/barclays-interview-questions-for-test-automation-engineer-role-c356896ac3fa';

export const QUESTIONS: CompanyQuestion[] = [
  {
    id: 'co-javascript-paytm-1',
    company: 'Paytm',
    area: 'javascript',
    role: 'SDET',
    round: 'Technical Interview I',
    difficulty: 'medium',
    question:
      'Remove every non-alphabet character from a sentence, then reverse the order of the words without reversing the letters inside each word.',
    answer: `Clean the string with a regex, split on whitespace, reverse the word array and join it back. (The candidate used a stack, and \`reverse()\` does the same job.)

    function reverseWords(s) {
      return s
        .replace(/[^A-Za-z\\s]/g, '')  // keep letters and spaces
        .split(/\\s+/)
        .filter(Boolean)               // drop empty words left by extra spaces
        .reverse()
        .join(' ');
    }

    reverseWords('Hello, World! 2 QA'); // 'QA World Hello'

The same with an explicit stack:

    const stack = [];
    for (const w of cleaned.split(/\\s+/)) if (w) stack.push(w);
    const out = [];
    while (stack.length) out.push(stack.pop());

**Complexity:** O(n) time and O(n) extra space for the word list.
**Edge cases to test:** an empty string, only symbols, several spaces between words, leading or trailing spaces, a single word, and non-ASCII letters (\`é\` is removed by \`[A-Za-z]\`; use \`/[^\\p{L}\\s]/gu\` to keep any letter).`,
    followUps: [
      {
        q: 'How would you reverse the letters of each word but keep the word order?',
        a: "Map over the words instead: s.split(' ').map(w => [...w].reverse().join('')).join(' '). It is still O(n), and the spread operator handles characters outside the BMP.",
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'GeeksforGeeks — Paytm interview experience for SDET (2022)', url: GFG_PAYTM_SDET, year: 2022 },
  },
  {
    id: 'co-javascript-to-the-new-1',
    company: 'To The New',
    area: 'javascript',
    role: 'Quality Engineer',
    round: 'Round 2: Coding round',
    difficulty: 'easy',
    question: 'Check whether a given string is a palindrome.',
    answer: `Normalise the string first (lower-case, remove non-alphanumerics), then compare characters from both ends with two pointers. That avoids building a reversed copy:

    function isPalindrome(s) {
      const t = s.toLowerCase().replace(/[^a-z0-9]/g, '');
      let i = 0, j = t.length - 1;
      while (i < j) {
        if (t[i++] !== t[j--]) return false;
      }
      return true;
    }

    isPalindrome('Madam');                          // true
    isPalindrome('A man, a plan, a canal: Panama'); // true
    isPalindrome('qa');                             // false

One-liner alternative: \`t === [...t].reverse().join('')\`. It is easy to read but uses O(n) extra memory.

**Complexity:** O(n) time, O(1) extra space for the comparison (the normalised copy is O(n)).
**Test cases to mention:** empty string (true), a single character, even and odd lengths, mixed case, spaces and punctuation, numbers (\`'12321'\`), and whether the spec wants case-sensitive matching.`,
    followUps: [
      {
        q: 'How would you check whether a number is a palindrome without converting it to a string?',
        a: 'Reverse it arithmetically: rev = rev * 10 + n % 10 while n > 0, then compare with the original. Negative numbers are not palindromes, and the loop is O(number of digits).',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'GeeksforGeeks — To The New interview experience for Quality Engineer', url: GFG_TTN, year: 2023 },
  },
  {
    id: 'co-javascript-coupa-software-1',
    company: 'Coupa Software',
    area: 'javascript',
    role: 'SDET',
    round: '1st round',
    difficulty: 'easy',
    question: 'An array holds the numbers 1 to n with exactly one number missing. Find the missing integer.',
    answer: `The sum of 1..n is n(n+1)/2. Subtract every element and what remains is the missing number:

    function findMissing(arr) {
      const n = arr.length + 1;      // one number is missing
      let sum = (n * (n + 1)) / 2;
      for (const x of arr) sum -= x;
      return sum;
    }

    findMissing([1, 2, 4, 5]); // 3

**Complexity:** O(n) time, O(1) space, and the array does not need to be sorted.

XOR variant (no overflow risk in languages with fixed-size integers):

    let x = 0;
    for (let i = 1; i <= n; i++) x ^= i;
    for (const v of arr) x ^= v;   // x is the missing number

Clarify with the interviewer: is the range 1..n or 0..n? Can there be duplicates or more than one missing number? (Then use a Set or a boolean array of size n, which is O(n) space.) Is the input sorted? (Then binary search on \`arr[i] !== i + 1\` gives O(log n).)`,
    followUps: [
      {
        q: 'What if two numbers are missing?',
        a: 'Use the sum and the sum of squares (two equations, two unknowns), or the XOR trick split by a set bit. A Set lookup over 1..n is the simplest correct O(n)-space answer.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'GeeksforGeeks — Coupa Software interview experience (SDET, full-time)', url: GFG_COUPA, year: 2024 },
  },
  {
    id: 'co-javascript-coupa-software-2',
    company: 'Coupa Software',
    area: 'javascript',
    role: 'SDET',
    round: '3rd round',
    difficulty: 'medium',
    question: 'What is debouncing? Implement a debounce function.',
    answer: `**Debouncing** delays a function until calls have **stopped** for \`wait\` ms. A burst of calls (keystrokes in a search box, resize events) results in **one** execution after the burst ends. It relies on a **closure** that keeps the pending timer id between calls:

    function debounce(fn, wait) {
      let timer;                       // kept alive by the closure
      return function (...args) {
        clearTimeout(timer);           // cancel the previous pending call
        timer = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    const search = debounce(q => console.log('API call for', q), 300);
    search('p'); search('pl'); search('pla'); // only 'pla' is logged, 300 ms later

Compare with **throttling**, which runs at most once every \`wait\` ms *during* the burst (good for scroll tracking). Debounce waits for quiet (good for search-as-you-type and auto-save).

**Why testers care:** a debounced search input means an E2E test must not assert immediately after typing. Wait for the network response (\`page.waitForResponse\`) or use auto-retrying assertions, and check that only one request is sent for a burst of keystrokes. In unit tests, use fake timers (\`jest.useFakeTimers()\`, \`advanceTimersByTime\`).`,
    followUps: [
      {
        q: 'How would you add a cancel method or a "leading" option?',
        a: 'Attach debounced.cancel = () => clearTimeout(timer). For leading: call fn immediately when no timer is pending, then ignore calls until the wait period has passed with no new calls.',
      },
    ],
    topic: 'js-functions',
    source: { name: 'GeeksforGeeks — Coupa Software interview experience (SDET, full-time)', url: GFG_COUPA, year: 2024 },
  },
  {
    id: 'co-javascript-coupa-software-3',
    company: 'Coupa Software',
    area: 'javascript',
    role: 'SDET',
    round: '3rd round',
    difficulty: 'medium',
    question: 'Find the length of the longest substring without repeating characters.',
    answer: `Use a **sliding window**: move \`start\` forward whenever the current character was last seen inside the window.

    function longestUnique(s) {
      const last = new Map();          // char -> last index seen
      let best = 0, start = 0;
      for (let i = 0; i < s.length; i++) {
        if (last.has(s[i]) && last.get(s[i]) >= start) {
          start = last.get(s[i]) + 1;  // jump past the previous copy
        }
        last.set(s[i], i);
        best = Math.max(best, i - start + 1);
      }
      return best;
    }

    longestUnique('abcabcbb'); // 3 ('abc')
    longestUnique('pwwkew');   // 3 ('wke')
    longestUnique('abba');     // 2
    longestUnique('');         // 0

**Complexity:** O(n) time. Each index is visited once, and \`start\` only moves forward. Space is O(k) for k distinct characters.

The \`>= start\` check matters: in \`'abba'\` the second \`a\` was last seen at index 0, which is *before* the window, so \`start\` must not move backwards. Good test inputs: empty, all identical (\`'bbbb'\` → 1), all unique, and repeats at the very end.`,
    followUps: [
      {
        q: 'How would you return the substring itself, not just its length?',
        a: 'Record bestStart whenever best improves (bestStart = start), then return s.slice(bestStart, bestStart + best). The complexity is unchanged.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'GeeksforGeeks — Coupa Software interview experience (SDET, full-time)', url: GFG_COUPA, year: 2024 },
  },
  {
    id: 'co-javascript-commvault-1',
    company: 'CommVault',
    area: 'javascript',
    role: 'SDET',
    round: 'Second technical round',
    difficulty: 'easy',
    question: 'Swap two numbers without using an extra (temporary) variable.',
    answer: `Three common ways in JavaScript:

    // 1. Destructuring (idiomatic, works for any type)
    let a = 5, b = 9;
    [a, b] = [b, a];            // a = 9, b = 5

    // 2. Arithmetic
    let x = 5, y = 9;
    x = x + y;                  // 14
    y = x - y;                  // 5
    x = x - y;                  // 9

    // 3. XOR (integers only)
    let p = 5, q = 9;
    p ^= q; q ^= p; p ^= q;     // p = 9, q = 5

Trade-offs to mention:
- **Arithmetic** can lose precision for very large numbers (beyond \`Number.MAX_SAFE_INTEGER\`) or floats. In fixed-width languages it can overflow.
- **XOR** works only on 32-bit integers in JS. Swapping a value with *itself* through references (\`arr[i] ^= arr[i]\`) zeroes it.
- **Destructuring** is clearest. It does create a temporary array internally, but no named variable.

All are O(1). In real code, readability wins, so use destructuring.`,
    followUps: [
      {
        q: 'How do you swap two elements of an array in place?',
        a: '[arr[i], arr[j]] = [arr[j], arr[i]]. Destructuring assignment works on any assignable targets, including array indexes and object properties.',
      },
    ],
    topic: 'js-basics',
    source: { name: 'GeeksforGeeks — CommVault interview experience for SDET', url: GFG_COMMVAULT, year: 2020 },
  },
  {
    id: 'co-javascript-infosys-1',
    company: 'Infosys',
    area: 'javascript',
    role: 'Test Engineer - UI Automation',
    round: 'Technical round 2',
    difficulty: 'easy',
    question: 'Write a program that checks whether a given year is a leap year.',
    answer: `Gregorian rule: a year is a leap year if it is divisible by 4, **except** century years, which must also be divisible by 400.

    function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    isLeapYear(2024); // true
    isLeapYear(2023); // false
    isLeapYear(1900); // false  (century, not divisible by 400)
    isLeapYear(2000); // true   (divisible by 400)

A trick that leans on the Date object: \`new Date(year, 1, 29).getDate() === 29\`. February 29 rolls over to March 1 in non-leap years.

**Complexity:** O(1).

As a tester, list the **equivalence classes and boundaries**: divisible by 4 but not 100 (2024), by 100 but not 400 (1900, 2100), by 400 (2000), not by 4 (2023). Add invalid input too: negative numbers, 0, decimals, strings, null. Decide whether the function should throw or return false for those.`,
    followUps: [
      {
        q: 'Why is 1900 not a leap year when it is divisible by 4?',
        a: 'Century years are leap years only if divisible by 400. The rule corrects the calendar drift, because a solar year is about 365.2425 days, not exactly 365.25.',
      },
    ],
    topic: 'js-basics',
    source: { name: 'GeeksforGeeks — Infosys interview experience for Test Engineer (UI Automation)', url: GFG_INFOSYS_UI, year: 2024 },
  },
  {
    id: 'co-javascript-infosys-2',
    company: 'Infosys',
    area: 'javascript',
    role: 'Automation Tester',
    difficulty: 'medium',
    question: 'Write a program that reads test data from a .csv file.',
    answer: `In Node.js, read the file and turn each row into an object keyed by the header row:

    import { readFileSync } from 'node:fs';

    function readCsv(path) {
      const text = readFileSync(path, 'utf8').trim();
      const [header, ...rows] = text.split(/\\r?\\n/);       // handles Windows line endings
      const keys = header.split(',').map(k => k.trim());
      return rows
        .filter(r => r.trim())                               // skip blank lines
        .map(r => {
          const values = r.split(',');
          return Object.fromEntries(keys.map((k, i) => [k, (values[i] ?? '').trim()]));
        });
    }

    // users.csv:  user,pass \\n admin,secret \\n qa,pw1
    for (const { user, pass } of readCsv('users.csv')) {
      // data-driven test: one login test per row
    }

**Complexity:** O(size of file).

Limitations to state: this simple split breaks on **quoted fields containing commas** (\`"Pune, MH"\`) or embedded newlines. For real data use a parser such as \`csv-parse\`, or \`papaparse\` in the browser. In Playwright, generate one \`test()\` per row inside a loop so each data set reports separately. In Java the usual answer is BufferedReader or OpenCSV.`,
    followUps: [
      {
        q: 'Why read the file synchronously here?',
        a: 'Test data is loaded once while the tests are being defined, before any run, so blocking is harmless and the test list can be built from it. In a server, use fs.promises.readFile or a stream so the event loop is not blocked.',
      },
    ],
    topic: 'js-loops-modules-errors',
    source: { name: 'GeeksforGeeks — Infosys interview experience for Automation Tester (4.6 years experience)', url: GFG_INFOSYS_AUTO, year: 2024 },
  },
  {
    id: 'co-javascript-amazon-1',
    company: 'Amazon',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 1: Telephonic interview',
    difficulty: 'medium',
    question: 'You can climb a staircase of n steps by taking either 2 or 3 steps at a time. In how many ways can you reach the top?',
    answer: `To land on step i, the last move was a 2-step from i-2 or a 3-step from i-3. So **ways(i) = ways(i-2) + ways(i-3)** with ways(0) = 1. Use bottom-up dynamic programming:

    function countWays(n) {
      const dp = new Array(n + 1).fill(0);
      dp[0] = 1;                       // one way to stand at the bottom
      for (let i = 1; i <= n; i++) {
        if (i >= 2) dp[i] += dp[i - 2];
        if (i >= 3) dp[i] += dp[i - 3];
      }
      return dp[n];
    }

    countWays(1); // 0
    countWays(5); // 2  (2+3, 3+2)
    countWays(7); // 3  (2+2+3, 2+3+2, 3+2+2)
    countWays(8); // 4

**Complexity:** O(n) time and O(n) space. Keeping only the last three values brings space down to O(1).

Talking points: order matters here (2+3 and 3+2 are different), so this counts **compositions**, not combinations. The naive recursion is exponential, so explain why memoisation or DP is needed. Test with n = 0, 1 (impossible → 0), and large n (results grow quickly; use BigInt past 2^53).`,
    followUps: [
      {
        q: 'How does the recurrence change if steps of 1, 2 or 3 are allowed?',
        a: 'ways(i) = ways(i-1) + ways(i-2) + ways(i-3) with ways(0) = 1, the tribonacci pattern. The same loop works with one more term.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'GeeksforGeeks — Amazon interview experience Set 432 (SDET off-campus)', url: GFG_AMAZON_SDET, year: 2018 },
  },
  {
    id: 'co-javascript-amazon-2',
    company: 'Amazon',
    area: 'javascript',
    role: 'QA Engineer',
    round: 'Phone interview',
    difficulty: 'easy',
    question: 'Write a program that reverses a given string.',
    answer: `Several ways, from idiomatic to manual:

    // 1. Built-ins (spread handles emoji and other surrogate pairs better than split(''))
    const rev1 = s => [...s].reverse().join('');

    // 2. Manual loop, no helpers (what interviewers often ask for)
    function reverse(s) {
      let out = '';
      for (let i = s.length - 1; i >= 0; i--) out += s[i];
      return out;
    }

    // 3. In place on a character array with two pointers (LeetCode's version)
    function reverseInPlace(chars) {
      for (let i = 0, j = chars.length - 1; i < j; i++, j--) {
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
    }

    reverse('hello'); // 'olleh'

**Complexity:** O(n) time. Strings are immutable in JS, so a new string takes O(n) space; the two-pointer swap on an array uses O(1) extra space.

Edge cases: empty string, one character, spaces and punctuation, and Unicode. \`'😀'.split('').reverse()\` breaks the emoji into invalid halves, while \`[...s]\` iterates by code point. (Combining accents still need \`Intl.Segmenter\` for full correctness.)`,
    followUps: [
      {
        q: 'Why is building a string with += in a loop acceptable in modern JavaScript?',
        a: 'Engines such as V8 use ropes (string builders) internally, so repeated concatenation is close to linear. For very large outputs, pushing to an array and joining once is still a safe choice.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'LeetCode Discuss — Amazon | QA Engineer | London | May 2017 [Offer]', url: LC_AMAZON_LONDON, year: 2017 },
  },
  {
    id: 'co-javascript-amazon-3',
    company: 'Amazon',
    area: 'javascript',
    role: 'QAE-1',
    round: '2nd round',
    difficulty: 'easy',
    question: 'From an array, find the number(s) that are repeated more than twice.',
    answer: `Count occurrences in one pass with a Map, then keep the values whose count is above 2:

    function repeatedMoreThanTwice(arr) {
      const count = new Map();
      for (const n of arr) count.set(n, (count.get(n) ?? 0) + 1);
      return [...count].filter(([, c]) => c > 2).map(([n]) => n);
    }

    repeatedMoreThanTwice([1, 3, 3, 2, 3, 1, 1, 1, 5]); // [1, 3]

**Complexity:** O(n) time, O(k) space for k distinct values. A Map keeps insertion order, so results come out in order of first appearance.

Alternatives: sort, then scan runs of equal values (O(n log n) time, O(1) extra space if sorting in place is allowed). Two nested loops are O(n²), which is fine to mention as a brute force but not as the final answer.

Clarify the requirement: "more than twice" means a count of **3 or more**, not "appears at least twice". Return each value once. Decide what to return when there is no match (an empty array). Test negatives, a single element, and all elements equal.`,
    followUps: [
      {
        q: 'Why use a Map instead of a plain object for counting?',
        a: 'Map keeps key types (1 and "1" stay distinct), has no prototype keys like "constructor", gives size directly, and iterates in insertion order. A plain object turns every key into a string.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'LeetCode Discuss — Amazon QAE, Hyderabad interview (July 2024)', url: LC_AMAZON_QAE, year: 2024 },
  },
  {
    id: 'co-javascript-info-edge-1',
    company: 'Info Edge',
    area: 'javascript',
    role: 'Testing Engineer (SDET)',
    round: 'Round 2: Technical Interview 1',
    difficulty: 'easy',
    question: 'Print the first non-repeating character in a string.',
    answer: `Make two passes. The first counts every character, and the second returns the first character whose count is 1:

    function firstNonRepeating(s) {
      const count = new Map();
      for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
      for (const ch of s) if (count.get(ch) === 1) return ch;
      return null;                     // every character repeats
    }

    firstNonRepeating('geeksforgeeks'); // 'f'
    firstNonRepeating('aabb');          // null

**Complexity:** O(n) time. Space is O(k), where k is the alphabet size (O(1) for a fixed alphabet).

A one-liner that is easy to say but O(n²): \`[...s].find(c => s.indexOf(c) === s.lastIndexOf(c))\`.

Clarify: is the match case-sensitive (\`'A'\` vs \`'a'\`)? Do spaces count? What should be returned when there is no answer (null, '' or -1)? Test the empty string, a single character, all repeated, and the unique character at the very end.`,
    followUps: [
      {
        q: 'How would you return the index instead of the character?',
        a: 'In the second pass iterate by index: for (let i = 0; i < s.length; i++) if (count.get(s[i]) === 1) return i; then return -1. This matches LeetCode 387.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'GeeksforGeeks — InfoEdge interview experience for Testing (on-campus)', url: GFG_INFOEDGE, year: 2022 },
  },
  {
    id: 'co-javascript-grey-orange-1',
    company: 'Grey Orange',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 2',
    difficulty: 'medium',
    question: 'What is the difference between synchronous and asynchronous programming?',
    answer: `- **Synchronous**: statements run one after another, and each one **blocks** until it finishes. A slow operation (reading a file, a network call) freezes everything after it.
- **Asynchronous**: a slow operation is **started** and the program keeps going. The result is handled **later** through a callback, a Promise or async/await when it is ready.

JavaScript runs on **one thread** with an **event loop**: async work (timers, I/O, HTTP) is handed to the runtime, and its callbacks are queued. Promise callbacks (**microtasks**) run before timer callbacks (**macrotasks**):

    console.log('A');
    setTimeout(() => console.log('B'), 0);
    Promise.resolve().then(() => console.log('C'));
    console.log('D');
    // A, D, C, B

    // async/await reads like synchronous code but does not block the thread
    async function getUser() {
      const res = await fetch('/api/user');   // pauses only this function
      return res.json();
    }

**Why SDETs care:** every Playwright/WebdriverIO action returns a Promise. A missing \`await\` makes steps race ahead, causing flaky "element not found" failures or assertions that silently never run. Async also explains why you wait for *conditions* (auto-waiting, \`expect.poll\`) instead of fixed sleeps.`,
    followUps: [
      {
        q: 'How do you run several independent API calls in parallel and wait for all of them?',
        a: 'Use await Promise.all([callA(), callB(), callC()]). It rejects as soon as any call fails. Use Promise.allSettled when you need every result, including failures.',
      },
    ],
    topic: 'js-async',
    source: { name: 'GeeksforGeeks — Grey Orange interview experience for SDET (on-campus)', url: GFG_GREY_ORANGE, year: 2023 },
  },
  {
    id: 'co-javascript-swiggy-1',
    company: 'Swiggy',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 1: Technical',
    difficulty: 'easy',
    question: 'Given a = "ABC" and b = "DEFGH", produce "ADBECFGH" by taking characters alternately from each string and appending the leftover characters.',
    answer: `Walk an index up to the longer length and append from each string while it still has characters:

    function interleave(a, b) {
      let out = '';
      const n = Math.max(a.length, b.length);
      for (let i = 0; i < n; i++) {
        if (i < a.length) out += a[i];
        if (i < b.length) out += b[i];
      }
      return out;
    }

    interleave('ABC', 'DEFGH'); // 'ADBECFGH'
    interleave('', 'XY');       // 'XY'

**Complexity:** O(n + m) time and O(n + m) for the output.

Alternative with two pointers: loop while both strings have characters, then append \`a.slice(i)\` and \`b.slice(j)\`. It is the same logic, and the leftover handling is explicit.

Test cases: equal lengths, either string longer, one or both empty, and Unicode or emoji (use \`[...a]\` arrays if code points matter).`,
    followUps: [
      {
        q: 'How would you generalise this to k strings?',
        a: 'Loop i from 0 to the maximum length, and for each string append s[i] if it exists. That is O(total characters). A queue of iterators also works, round-robin style.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'LeetCode Discuss — Swiggy | SDET | Remote | May 2024 [Offer]', url: LC_SWIGGY, year: 2024 },
  },
  {
    id: 'co-javascript-swiggy-2',
    company: 'Swiggy',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 3: Hiring Manager',
    difficulty: 'easy',
    question: 'Print the frequency of every character in a given string.',
    answer: `Count with an object (or a Map), then print the counts:

    function charFrequency(s) {
      const freq = {};
      for (const ch of s) freq[ch] = (freq[ch] ?? 0) + 1;
      return freq;
    }

    const f = charFrequency('Programming');
    // { P:1, r:2, o:1, g:2, a:1, m:2, i:1, n:1 }
    for (const [ch, n] of Object.entries(f)) console.log(ch + ': ' + n);

With reduce:

    const freq = [...s].reduce((m, c) => m.set(c, (m.get(c) ?? 0) + 1), new Map());

**Complexity:** O(n) time and O(k) space for k distinct characters.

Points to raise: should matching be **case-sensitive** (\`P\` vs \`p\`)? Should spaces or punctuation be ignored (filter with a regex first)? Do you need the output **sorted** by count (\`Object.entries(f).sort((x, y) => y[1] - x[1])\`)? \`for...of\` iterates by code point, so emoji are counted correctly.`,
    followUps: [
      {
        q: 'How would you find the most frequent character?',
        a: 'Track the maximum while counting, or reduce over the entries afterwards. Decide the tie-break rule, for example the first to reach the max count, or alphabetical order.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'LeetCode Discuss — Swiggy | SDET | Remote | May 2024 [Offer]', url: LC_SWIGGY, year: 2024 },
  },
  {
    id: 'co-javascript-swiggy-3',
    company: 'Swiggy',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 2: Technical',
    difficulty: 'easy',
    question: 'Check whether a string of brackets — (), {}, [] — is balanced.',
    answer: `Push opening brackets onto a **stack**. For each closing bracket, the top of the stack must be its matching opener:

    function isBalanced(s) {
      const pairs = { ')': '(', ']': '[', '}': '{' };
      const stack = [];
      for (const ch of s) {
        if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
        else if (ch in pairs) {
          if (stack.pop() !== pairs[ch]) return false;  // wrong or missing opener
        }
      }
      return stack.length === 0;                         // nothing left open
    }

    isBalanced('()(){{}}[()]'); // true
    isBalanced('()(){{}}[()}'); // false
    isBalanced('((');           // false

**Complexity:** O(n) time, O(n) space in the worst case (all openers).

Common bugs to call out: forgetting the final \`stack.length === 0\` check (\`'(('\` would pass), popping from an empty stack (\`pop()\` returns undefined, which correctly fails the comparison), and counting brackets per type instead of tracking **order** (\`'([)]'\` has equal counts but is not balanced).`,
    followUps: [
      {
        q: 'If only one bracket type is used, can you do it in O(1) space?',
        a: 'Yes. Keep a counter: +1 for "(" and -1 for ")". Fail if it ever goes negative, and require it to be 0 at the end. The stack is only needed to check the nesting order of different types.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'LeetCode Discuss — Swiggy | SDET | Remote | May 2024 [Offer]', url: LC_SWIGGY, year: 2024 },
  },
  {
    id: 'co-javascript-stryker-1',
    company: 'Stryker',
    area: 'javascript',
    role: 'QA Automation',
    round: 'Round 1',
    difficulty: 'easy',
    question: "From the string 'b4n3c6a1', how would you extract only the digits and, separately, only the letters?",
    answer: `Loop once and route each character by type:

    function splitDigitsLetters(s) {
      let digits = '', letters = '';
      for (const ch of s) {
        if (ch >= '0' && ch <= '9') digits += ch;
        else if (/[a-z]/i.test(ch)) letters += ch;
      }
      return { digits, letters };
    }

    splitDigitsLetters('b4n3c6a1'); // { digits: '4361', letters: 'bnca' }

Regex one-liners:

    const digits  = s.replace(/\\D/g, '');        // '4361'
    const letters = s.replace(/[^a-z]/gi, '');   // 'bnca'
    const nums    = s.match(/\\d+/g)?.map(Number); // [4, 3, 6, 1] (runs of digits)

**Complexity:** O(n) time and O(n) for the outputs.

Follow-ups to anticipate: the **sum** of the digits (\`[...digits].reduce((a, d) => a + +d, 0)\` → 14); whether multi-digit numbers (\`'a12b3'\`) should be read as 12 and 3 (use \`/\\d+/g\`); and what to do with other characters such as spaces or symbols (ignored here).`,
    followUps: [
      {
        q: 'How would you rebuild the string as letters followed by digits, each group sorted?',
        a: "[...letters].sort().join('') + [...digits].sort().join(''), which gives 'abcn1346'. Sorting makes it O(n log n). Counting sort over the fixed alphabets would be O(n).",
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'Medium — Stryker QA automation interview questions (Arpit Choubey)', url: MD_STRYKER, year: 2025 },
  },
  {
    id: 'co-javascript-globant-1',
    company: 'Globant',
    area: 'javascript',
    role: 'Automation Testing',
    round: 'L1 interview',
    difficulty: 'medium',
    question: 'Remove repeated words from a string without using built-in helper methods (no split, Set, filter and so on).',
    answer: `Scan the characters yourself to build words, and keep a plain object as a "seen" lookup:

    function removeRepeatedWords(s) {
      const seen = {};
      let out = '', word = '';
      const flush = () => {
        if (word !== '' && !seen[word]) {
          seen[word] = true;
          out += (out === '' ? '' : ' ') + word;
        }
        word = '';
      };
      for (let i = 0; i < s.length; i++) {
        if (s[i] === ' ') flush();      // a word ends at a space
        else word += s[i];
      }
      flush();                          // last word
      return out;
    }

    removeRepeatedWords('test the test of the  code'); // 'test the of code'

**Complexity:** O(n) time. The object lookup is O(1) on average, and space is O(number of distinct words).

Notes: it keeps the **first** occurrence and the original order, and collapses multiple spaces. Ask whether matching should ignore case (lower-case the word before the lookup), and whether punctuation attached to a word (\`'test,'\`) should be stripped. With built-ins allowed: \`[...new Set(s.split(/\\s+/))].join(' ')\`.`,
    followUps: [
      {
        q: 'How would you print only the words that were repeated?',
        a: 'Keep a count per word instead of a boolean, then output the words whose count is greater than 1. The single pass and O(n) cost stay the same.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'Medium — Globant automation testing interview questions (Arpit Choubey)', url: MD_GLOBANT, year: 2024 },
  },
  {
    id: 'co-javascript-mastercard-1',
    company: 'Mastercard',
    area: 'javascript',
    role: 'Sr SDET',
    round: 'Second round (technical)',
    difficulty: 'medium',
    question: 'Predict the output: s = 21 + "abc" + 49 + 14; and s = 21 + 49 + "abc" + 14;',
    answer: `\`+\` is evaluated **left to right**. Once either operand is a string, \`+\` becomes **string concatenation** for that step and every step after it:

    console.log(21 + 'abc' + 49 + 14);
    // 21 + 'abc'     -> '21abc'
    // '21abc' + 49   -> '21abc49'
    // '21abc49' + 14 -> '21abc4914'
    // Output: 21abc4914

    console.log(21 + 49 + 'abc' + 14);
    // 21 + 49        -> 70        (both numbers: addition)
    // 70 + 'abc'     -> '70abc'
    // '70abc' + 14   -> '70abc14'
    // Output: 70abc14

(The interview asked this in Java; JavaScript and Java give the same results here.)

Related JS traps worth knowing:
- \`'5' - 2\` → **3** (\`-\` always converts to numbers), while \`'5' + 2\` → **'52'**.
- \`1 + +'2'\` → **3** (unary \`+\` converts to a number).
- \`[] + {}\` → **'[object Object]'**, and \`true + 1\` → **2**.
- To add first, use parentheses: \`'abc' + (49 + 14)\` → **'abc63'**.`,
    followUps: [
      {
        q: 'What is the output of "3" * "4" and "3" + 4 + 5?',
        a: '"3" * "4" is 12, because * converts both strings to numbers. "3" + 4 + 5 is "345", because once the left side is a string each + concatenates.',
      },
    ],
    topic: 'js-output-puzzles',
    source: { name: 'LeetCode Discuss — Mastercard Pune | Sr SDET interview experience', url: LC_MASTERCARD, year: 2024 },
  },
  {
    id: 'co-javascript-mastercard-2',
    company: 'Mastercard',
    area: 'javascript',
    role: 'Sr SDET',
    round: 'Second round (technical)',
    difficulty: 'easy',
    question: 'Combine two integer arrays into a third array containing all elements of both, using only a single loop.',
    answer: `Size the result to the combined length, then fill it with one loop that reads from the first array and switches to the second after the first is used up:

    function mergeOneLoop(a1, a2) {
      const out = new Array(a1.length + a2.length);
      for (let i = 0; i < out.length; i++) {
        out[i] = i < a1.length ? a1[i] : a2[i - a1.length];
      }
      return out;
    }

    mergeOneLoop([1, 2, 3, 4, 5], [6, 7, 8, 9, 10]);
    // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

**Complexity:** O(n + m) time and space. There is exactly one loop, as required.

Idiomatic JS (if built-ins are allowed): \`[...a1, ...a2]\` or \`a1.concat(a2)\`. In Java the equivalent is \`System.arraycopy\` twice.

Clarify: should duplicates be removed (wrap the result in a Set)? Should the result be sorted? If both inputs are already sorted and the output must be sorted, that is the two-pointer **merge** step from merge sort instead.`,
    followUps: [
      {
        q: 'Can you do it with no explicit loop at all?',
        a: 'Yes: [...a1, ...a2], a1.concat(a2), or Array.from({ length: n + m }, (_, i) => i < n ? a1[i] : a2[i - n]). The built-ins still loop internally in O(n + m).',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'LeetCode Discuss — Mastercard Pune | Sr SDET interview experience', url: LC_MASTERCARD, year: 2024 },
  },
  {
    id: 'co-javascript-mastercard-3',
    company: 'Mastercard',
    area: 'javascript',
    role: 'Sr SDET',
    round: 'Second round (technical)',
    difficulty: 'easy',
    question: 'Swap each pair of adjacent elements in an array: [18, 45, 7, 10, 5] should become [45, 18, 10, 7, 5].',
    answer: `Step through the array two at a time and swap each pair. A trailing odd element stays where it is:

    function swapPairs(arr) {
      const r = [...arr];                       // do not mutate the input
      for (let i = 0; i + 1 < r.length; i += 2) {
        [r[i], r[i + 1]] = [r[i + 1], r[i]];
      }
      return r;
    }

    swapPairs([18, 45, 7, 10, 5]); // [45, 18, 10, 7, 5]
    swapPairs([1, 2]);             // [2, 1]
    swapPairs([]);                 // []

**Complexity:** O(n) time, O(1) extra space if done in place (drop the copy).

The loop condition \`i + 1 < r.length\` is the important detail. Using \`i < r.length\` would read past the end for odd lengths and write \`undefined\` into the array. Good test cases: empty, a single element, even length, odd length, and duplicates.`,
    followUps: [
      {
        q: 'How does this change for a linked list?',
        a: 'Re-link the nodes pair by pair with a dummy head: prev.next = second; first.next = second.next; second.next = first; then prev = first. It is O(n) time and O(1) space, as in LeetCode 24.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'LeetCode Discuss — Mastercard Pune | Sr SDET interview experience', url: LC_MASTERCARD, year: 2024 },
  },
  {
    id: 'co-javascript-servicenow-1',
    company: 'ServiceNow',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 2',
    difficulty: 'medium',
    question: 'Given an array containing duplicates, return an array with the indices of all the duplicated numbers.',
    answer: `Group indices by value in one pass, then collect the groups that have more than one index:

    function duplicateIndices(arr) {
      const idx = new Map();                     // value -> [indices]
      arr.forEach((v, i) => {
        if (!idx.has(v)) idx.set(v, []);
        idx.get(v).push(i);
      });
      const out = [];
      for (const [, list] of idx) if (list.length > 1) out.push(...list);
      return out.sort((a, b) => a - b);
    }

    duplicateIndices([4, 2, 4, 5, 2, 9]); // [0, 1, 2, 4]

**Complexity:** O(n) to group, plus O(d log d) to sort the d duplicate indices. Space is O(n).

Clarify what "indices of duplicates" means. All positions of repeated values (above)? Only the second and later occurrences (record \`i\` when \`seen.has(v)\`, giving [2, 4])? Or a map like \`{4: [0, 2], 2: [1, 4]}\` (return the Map itself)? Remember to sort numerically with \`(a, b) => a - b\`. The default \`sort()\` compares as strings, so 10 would come before 9.`,
    followUps: [
      {
        q: 'Why does [10, 9, 1].sort() return [1, 10, 9]?',
        a: 'Without a comparator, sort converts the elements to strings and compares UTF-16 code units, so "10" comes before "9". Pass (a, b) => a - b for numeric order.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'LeetCode Discuss — ServiceNow SDET interview experience', url: LC_SERVICENOW, year: 2025 },
  },
  {
    id: 'co-javascript-servicenow-2',
    company: 'ServiceNow',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 3: Hiring Manager',
    difficulty: 'medium',
    question: 'Given a string, return true if it is a valid IPv4 address.',
    answer: `A valid IPv4 address has exactly 4 dot-separated parts. Each part is 1–3 digits, between 0 and 255, with **no leading zeros** (except \`0\` itself):

    function isValidIPv4(s) {
      const parts = s.split('.');
      if (parts.length !== 4) return false;
      return parts.every(p =>
        /^\\d{1,3}$/.test(p) &&             // only digits, 1-3 of them
        !(p.length > 1 && p[0] === '0') &&  // no leading zero like '01'
        Number(p) <= 255
      );
    }

    isValidIPv4('192.168.1.1'); // true
    isValidIPv4('0.0.0.0');     // true
    isValidIPv4('256.1.1.1');   // false (out of range)
    isValidIPv4('01.1.1.1');    // false (leading zero)
    isValidIPv4('1.1.1');       // false (3 parts)
    isValidIPv4('1..1.1');      // false (empty part)
    isValidIPv4('1.1.1.a');     // false

**Complexity:** O(n).

Why not just \`Number(p)\`? Because \`Number('')\` is 0, \`Number(' 1')\` is 1 and \`Number('1e2')\` is 100, so all of those would slip through. The regex blocks them. This is a good place to show testing instincts: list the boundary values (0, 255, 256), empty parts, extra dots, whitespace, signs and letters. In Node, \`net.isIPv4()\` exists for production use.`,
    followUps: [
      {
        q: 'How would you extend this to IPv6?',
        a: 'Split on ":" into 8 groups of 1–4 hex digits, and handle the "::" shorthand, which may appear once and stands for one or more zero groups. In real code, use net.isIP() rather than a hand-written regex.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'LeetCode Discuss — ServiceNow SDET interview experience', url: LC_SERVICENOW, year: 2025 },
  },
  {
    id: 'co-javascript-acko-1',
    company: 'Acko',
    area: 'javascript',
    role: 'SDET Intern',
    round: 'Round 4: Hiring Manager',
    difficulty: 'medium',
    question: 'Explain scoping and hoisting in JavaScript.',
    answer: `**Scope** decides where a variable can be seen:
- **Global**, **function** scope (\`var\`, and function parameters), and **block** scope (\`let\`, \`const\` and \`class\` inside \`{ }\`).
- Scope is **lexical**: an inner function sees the variables where it was *written*. That is what makes closures work.

**Hoisting**: before code runs, the engine registers every declaration in its scope:
- \`var\` is hoisted and **initialised to undefined**.
- \`let\`/\`const\` are hoisted but **not initialised**. Touching them before the declaration line throws a ReferenceError. That window is the **temporal dead zone (TDZ)**.
- **Function declarations** are hoisted **with their body**, so you can call them before they appear. Function *expressions* follow the rule of the variable that holds them.

    console.log(a);      // undefined (var is hoisted)
    var a = 1;

    console.log(b);      // ReferenceError (TDZ)
    let b = 2;

    hello();             // 'hi' (declaration hoisted with its body)
    function hello() { console.log('hi'); }

    for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3 (one shared i)
    for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2 (new j each loop)

Best practice: use \`const\` by default and \`let\` when reassigning, and avoid \`var\`.`,
    followUps: [
      {
        q: 'Is a class declaration hoisted?',
        a: 'Yes, but like let it stays in the temporal dead zone, so using the class before its declaration throws a ReferenceError. Unlike function declarations, classes cannot be used before they are defined.',
      },
    ],
    topic: 'js-functions',
    source: { name: 'GeeksforGeeks — Acko interview experience for SDET Intern + PPO (on-campus)', url: GFG_ACKO, year: 2020 },
  },
  {
    id: 'co-javascript-acko-2',
    company: 'Acko',
    area: 'javascript',
    role: 'SDET Intern',
    round: 'Round 4: Hiring Manager',
    difficulty: 'medium',
    question: 'Briefly explain async/await — how did JavaScript get from callbacks to promises to async/await?',
    answer: `**1. Callbacks**: pass a function that runs when the work finishes. Nesting several of them leads to "callback hell" with error handling at every level:

    getUser(id, (err, user) => {
      if (err) return done(err);
      getOrders(user, (err, orders) => { /* deeper and deeper */ });
    });

**2. Promises**: an object for a future value with three states: *pending*, *fulfilled* or *rejected*. They chain flat, and one \`.catch\` handles errors from every step:

    getUser(id)
      .then(user => getOrders(user))
      .then(orders => show(orders))
      .catch(handleError);

**3. async/await**: syntax over promises. An \`async\` function always returns a Promise, and \`await\` pauses *that function* (not the thread) until the promise settles. It reads like synchronous code and uses ordinary \`try/catch\`:

    async function showOrders(id) {
      try {
        const user = await getUser(id);
        const orders = await getOrders(user);
        show(orders);
      } catch (e) { handleError(e); }
    }

Tips: independent awaits run **one after another**, so use \`await Promise.all([...])\` to run them in parallel. Never \`await\` inside \`forEach\`, because forEach does not wait; use \`for...of\` instead. A forgotten \`await\` in a Playwright test is one of the most common causes of flaky tests.`,
    followUps: [
      {
        q: 'What does an async function return if you return a plain value from it?',
        a: 'A Promise resolved with that value. async function f() { return 5 } returns Promise<5>, so callers must await f() or use .then to get 5.',
      },
    ],
    topic: 'js-async',
    source: { name: 'GeeksforGeeks — Acko interview experience for SDET Intern + PPO (on-campus)', url: GFG_ACKO, year: 2020 },
  },
  {
    id: 'co-javascript-jp-morgan-1',
    company: 'JP Morgan',
    area: 'javascript',
    role: 'SDET',
    round: 'Round 2 (Technical + Managerial)',
    difficulty: 'easy',
    question: 'Given two arrays, store the numbers that are not common to both in a third array (and, as a variation, the numbers that are common).',
    answer: `Use Sets for O(1) membership checks:

    function uncommon(a, b) {
      const sa = new Set(a), sb = new Set(b);
      return [
        ...[...sa].filter(x => !sb.has(x)),   // only in a
        ...[...sb].filter(x => !sa.has(x)),   // only in b
      ];
    }

    function common(a, b) {
      const sb = new Set(b);
      return [...new Set(a)].filter(x => sb.has(x));
    }

    uncommon([1, 2, 3, 4], [3, 4, 5]); // [1, 2, 5]
    common([1, 2, 3, 4], [3, 4, 5]);   // [3, 4]

**Complexity:** O(n + m) time and space. The brute force \`a.filter(x => !b.includes(x))\` is O(n·m), which is fine for tiny arrays but worth naming as the slower option.

In set terms, "uncommon" is the **symmetric difference** and "common" is the **intersection**. Clarify duplicates: should \`[2, 2]\` vs \`[2]\` count a 2 as uncommon? (The Set version de-duplicates.) If both arrays are sorted, two pointers give O(n + m) with O(1) extra space.`,
    followUps: [
      {
        q: 'Where does this come up in test automation?',
        a: 'Comparing an expected list with what the UI or API returned: items missing from the page (expected minus actual) and unexpected extra items (actual minus expected) make a far clearer failure message than "arrays differ".',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'GeeksforGeeks — JP Morgan interview experience (SDET role, experienced)', url: GFG_JPMORGAN, year: 2018 },
  },
  {
    id: 'co-javascript-livspace-1',
    company: 'Livspace',
    area: 'javascript',
    role: 'Test Engineer',
    round: 'Third technical round',
    difficulty: 'easy',
    question: 'Print an array with all duplicate numbers removed.',
    answer: `Keep the first occurrence of each value and preserve the order:

    // idiomatic
    const unique = arr => [...new Set(arr)];

    // explicit, shows the logic
    function removeDuplicates(arr) {
      const seen = new Set();
      const out = [];
      for (const n of arr) {
        if (!seen.has(n)) { seen.add(n); out.push(n); }
      }
      return out;
    }

    removeDuplicates([3, 1, 3, 2, 1]); // [3, 1, 2]

**Complexity:** O(n) time and O(n) space.

Other approaches and their costs:
- \`arr.filter((x, i) => arr.indexOf(x) === i)\` is short but **O(n²)**.
- Sort, then skip equal neighbours: O(n log n), and it changes the order.

Gotchas: a Set compares by **value for primitives** but by **reference for objects**, so \`[{id:1},{id:1}]\` is not de-duplicated. Key a Map by \`id\` for that. \`NaN\` is treated as equal to itself in a Set, but \`indexOf(NaN)\` is -1, so the filter version drops every NaN.`,
    followUps: [
      {
        q: 'How would you remove duplicates from an array of objects by id?',
        a: 'Use [...new Map(items.map(o => [o.id, o])).values()], which keeps the last object per id. To keep the first, only set the key when it is not already in the Map.',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'LeetCode Discuss — Livspace | Test Engineer | Bangalore | July 2019 [Offer]', url: LC_LIVSPACE, year: 2019 },
  },
  {
    id: 'co-javascript-eq-technologic-1',
    company: 'eQ Technologic',
    area: 'javascript',
    role: 'QA Engineer',
    round: 'Round 3: Technical interview',
    difficulty: 'easy',
    question: 'In JavaScript, print this pyramid pattern:  "  1", " 212", "32123" (generalised to n rows).',
    answer: `Each row i has (n − i) leading spaces, then counts **down** from i to 1, then **up** from 2 to i:

    function pattern(n) {
      const lines = [];
      for (let i = 1; i <= n; i++) {
        let row = ' '.repeat(n - i);
        for (let k = i; k >= 1; k--) row += k;   // descending half
        for (let k = 2; k <= i; k++) row += k;   // ascending half
        lines.push(row);
      }
      return lines.join('\\n');
    }

    console.log(pattern(3));
    //   1
    //  212
    // 32123

**Complexity:** O(n²) characters in total, which is the size of the output, so it cannot be done faster.

Tips for pattern questions: write row 1, 2 and 3 by hand first, find the formula for spaces and numbers per row, then code it. Build each row as a string and print once, because \`console.log\` always adds a newline. For n ≥ 10 the numbers have two digits and the alignment breaks. Mention that and pad with \`String(k).padStart(2)\` if needed.`,
    followUps: [
      {
        q: 'How would you print the inverted version (largest row first)?',
        a: 'Run the outer loop from n down to 1 and keep the inner logic, or build the lines array and print lines.reverse().join("\\n").',
      },
    ],
    topic: 'js-loops-modules-errors',
    source: { name: 'LeetCode Discuss — eQ Technologic on-campus 2023, QA Engineer', url: LC_EQ, year: 2023 },
  },
  {
    id: 'co-javascript-zepto-1',
    company: 'Zepto',
    area: 'javascript',
    role: 'SDET2',
    round: 'First round (bar-raiser)',
    difficulty: 'medium',
    question: 'Reverse a string without moving the special characters: "I am$&## Groot" should become "toorG ma$&## I".',
    answer: `Work out the rule from the example. The **word order is reversed**, and inside each word the **letters are reversed while special characters stay at their positions** (\`am$&##\` → \`ma$&##\`). Two pointers per word skip the non-letters:

    function reverseKeepSpecial(s) {
      const isLetter = c => /[A-Za-z]/.test(c);
      return s.split(' ').reverse().map(word => {
        const ch = [...word];
        let i = 0, j = ch.length - 1;
        while (i < j) {
          if (!isLetter(ch[i])) i++;
          else if (!isLetter(ch[j])) j--;
          else { [ch[i], ch[j]] = [ch[j], ch[i]]; i++; j--; }
        }
        return ch.join('');
      }).join(' ');
    }

    reverseKeepSpecial('I am$&## Groot'); // 'toorG ma$&## I'

**Complexity:** O(n) time and O(n) space.

The classic version of the problem keeps special characters fixed across the **whole** string: apply the same two-pointer loop to the full character array instead of each word. Confirm the expected output with the interviewer before coding, because this question is often stated loosely. Test cases: only symbols, symbols at both ends, multiple spaces, and digits (are they letters or specials?).`,
    followUps: [
      {
        q: 'What would the whole-string version return for "a,b$c"?',
        a: 'It returns "c,b$a". The letters a, b, c are reversed into the letter positions, while the comma and $ stay at indexes 1 and 3.',
      },
    ],
    topic: 'js-objects-strings',
    source: { name: 'LeetCode Discuss — ZEPTO | SDET2 | Interview Experience', url: LC_ZEPTO, year: 2024 },
  },
  {
    id: 'co-javascript-barclays-1',
    company: 'Barclays',
    area: 'javascript',
    role: 'Test Automation Engineer',
    difficulty: 'easy',
    question: 'Write a program to merge two sorted arrays into one sorted array, e.g. [10,20,30,40] and [15,25,35,45,50].',
    answer: `Use the **two-pointer merge** from merge sort. Always take the smaller head, then append whatever is left over:

    function mergeSorted(a, b) {
      const out = [];
      let i = 0, j = 0;
      while (i < a.length && j < b.length) {
        out.push(a[i] <= b[j] ? a[i++] : b[j++]);  // <= keeps it stable
      }
      while (i < a.length) out.push(a[i++]);
      while (j < b.length) out.push(b[j++]);
      return out;
    }

    mergeSorted([10, 20, 30, 40], [15, 25, 35, 45, 50]);
    // [10, 15, 20, 25, 30, 35, 40, 45, 50]

**Complexity:** O(n + m) time, O(n + m) for the output.

The shortcut \`[...a, ...b].sort((x, y) => x - y)\` is O((n+m) log(n+m)) and ignores the fact that the inputs are already sorted, which is exactly what the interviewer wants you to use. Also never call \`sort()\` without a comparator on numbers. Test cases: one array empty, all of a smaller than b, interleaved values, duplicates across arrays, and negative numbers.`,
    followUps: [
      {
        q: 'How would you merge k sorted arrays efficiently?',
        a: 'Use a min-heap holding the current head of each array: pop the smallest and push the next element from the same array. That is O(N log k) for N total elements. Pairwise merging also gives O(N log k).',
      },
    ],
    topic: 'js-arrays',
    source: { name: 'Medium — Barclays interview questions for Test Automation Engineer role (Arpit Choubey)', url: MD_BARCLAYS, year: 2024 },
  },
];
