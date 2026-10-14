import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-strings-reverse',
    category: 'strings',
    difficulty: 'easy',
    title: 'Reverse a string',
    askedIn: 'Common in SDET coding-question lists (Medium, "Top Java Coding Interview Questions for SDET")',
    prompt: `Write \`reverseString(str)\` that returns the string reversed. Interviewers often ask for it **without** \`.reverse()\`.

**Example 1**
\`\`\`
reverseString('hello')  // 'olleh'
\`\`\`
**Example 2**
\`\`\`
reverseString('Playwright 1')  // '1 thgirwyalP'
\`\`\`

**Constraints**
- ASCII input; spaces and digits are kept.
- Empty string returns \`''\`.`,
    fnName: 'reverseString',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function reverseString(str) {
  // your code
}`,
    tests: [
      { args: ['hello'], expected: 'olleh' },
      { args: ['Playwright 1'], expected: '1 thgirwyalP' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['racecar'], expected: 'racecar' },
      { args: ['  ab '], expected: ' ba  ', hidden: true },
      { args: ['12345'], expected: '54321', hidden: true },
    ],
    hints: [
      'Loop from the last index down to 0.',
      'Build the result by appending each character.',
    ],
    solution: `function reverseString(str) {
  let out = '';
  for (let i = str.length - 1; i >= 0; i--) {
    out += str[i];
  }
  return out;
}`,
    explanation: `**Approach:** iterate backwards and append each character.

**Complexity:** O(n) time, O(n) space. String concatenation in modern engines is effectively linear.

**With built-ins:** \`str.split('').reverse().join('')\`. For emoji or other surrogate pairs, use \`[...str].reverse().join('')\`, because \`split('')\` breaks them into halves.

**Say aloud:** "I'll show the loop, then mention the one-liner. Strings are immutable in JS, so either way I build a new string."`,
    followUps: [
      { q: 'Why can split("") break emoji?', a: 'It splits by UTF-16 code units, so a surrogate pair like an emoji becomes two broken halves. Spreading [...str] iterates by code point.' },
    ],
  },
  {
    id: 'code-strings-palindrome',
    category: 'strings',
    difficulty: 'easy',
    title: 'Palindrome check (ignore case and symbols)',
    askedIn: 'Reported by SDET candidates on Glassdoor; also in Medium SDET coding-question lists',
    prompt: `Write \`isPalindrome(str)\` that returns \`true\` if the string reads the same forwards and backwards, **ignoring case and any non-alphanumeric characters**.

**Example 1**
\`\`\`
isPalindrome('A man, a plan, a canal: Panama')  // true
\`\`\`
**Example 2**
\`\`\`
isPalindrome('race a car')  // false
\`\`\`

**Constraints**
- Empty string (or only symbols) counts as a palindrome.`,
    fnName: 'isPalindrome',
    starter: `/**
 * @param {string} str
 * @returns {boolean}
 */
function isPalindrome(str) {
  // your code
}`,
    tests: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['race a car'], expected: false },
      { args: [''], expected: true },
      { args: ['a'], expected: true },
      { args: ['Madam'], expected: true },
      { args: ['!!!'], expected: true, hidden: true },
      { args: ['No lemon, no melon'], expected: true, hidden: true },
      { args: ['ab2a'], expected: false, hidden: true },
    ],
    hints: [
      'First normalise: lowercase and keep only a-z and 0-9.',
      'Then compare characters from both ends moving inward.',
    ],
    solution: `function isPalindrome(str) {
  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let l = 0;
  let r = clean.length - 1;
  while (l < r) {
    if (clean[l] !== clean[r]) return false;
    l++;
    r--;
  }
  return true;
}`,
    explanation: `**Approach:** normalise with a regex (\`/[^a-z0-9]/g\` after lowercasing), then compare with two pointers.

**Complexity:** O(n) time, O(n) space for the cleaned copy. Skipping symbols in place with the pointers makes it O(1) space.

**With built-ins:** \`clean === clean.split('').reverse().join('')\`. It's shorter but builds a second string.

**Say aloud:** "I'd clarify the rules: case, spaces, punctuation. Then I'd list my test cases: empty string, one character, mixed case, punctuation-only."`,
    followUps: [
      { q: 'How would you check if a number is a palindrome without converting to a string?', a: 'Reverse it arithmetically: repeatedly take n % 10, build rev = rev * 10 + digit, divide n by 10, then compare rev with the original.' },
    ],
  },
  {
    id: 'code-strings-count-vowels',
    category: 'strings',
    difficulty: 'easy',
    title: 'Count vowels',
    prompt: `Write \`countVowels(str)\` that returns the number of vowels (\`a e i o u\`, any case) in the string.

**Example 1**
\`\`\`
countVowels('Playwright')  // 2
\`\`\`
**Example 2**
\`\`\`
countVowels('AEIOU xyz')  // 5
\`\`\`

**Constraints**
- \`y\` is **not** a vowel here.`,
    fnName: 'countVowels',
    starter: `/**
 * @param {string} str
 * @returns {number}
 */
function countVowels(str) {
  // your code
}`,
    tests: [
      { args: ['Playwright'], expected: 2 },
      { args: ['AEIOU xyz'], expected: 5 },
      { args: [''], expected: 0 },
      { args: ['rhythm'], expected: 0 },
      { args: ['a'], expected: 1 },
      { args: ['Quality Assurance'], expected: 7, hidden: true },
      { args: ['123 !?'], expected: 0, hidden: true },
    ],
    hints: [
      'Put the vowels in a string or Set: `"aeiou"`.',
      'Lowercase each character before checking.',
    ],
    solution: `function countVowels(str) {
  const vowels = 'aeiou';
  let count = 0;
  for (const ch of str.toLowerCase()) {
    if (vowels.includes(ch)) count++;
  }
  return count;
}`,
    explanation: `**Approach:** lowercase once, then count characters found in \`"aeiou"\`.

**Complexity:** O(n) time, O(1) space (the vowel set is a constant size).

**With built-ins:** \`(str.match(/[aeiou]/gi) || []).length\`. Note that \`match\` returns \`null\` when nothing matches, so the \`|| []\` matters.

**Say aloud:** "I'd confirm whether y counts. And with regex, match returns null, not an empty array, on no match, which is a common bug."`,
    followUps: [
      { q: 'How would you return the count per vowel?', a: 'Use a frequency map: initialise { a:0, e:0, i:0, o:0, u:0 } and increment the matching key for each vowel found.' },
    ],
  },
  {
    id: 'code-strings-char-frequency',
    category: 'strings',
    difficulty: 'easy',
    title: 'Character frequency',
    prompt: `Write \`charFrequency(str)\` that returns an object mapping each character to its count. Ignore spaces; treat upper and lower case as the **same** (use lowercase keys).

**Example 1**
\`\`\`
charFrequency('hello')  // { h: 1, e: 1, l: 2, o: 1 }
\`\`\`
**Example 2**
\`\`\`
charFrequency('Aa B')  // { a: 2, b: 1 }
\`\`\`

**Constraints**
- Empty string returns \`{}\`.`,
    fnName: 'charFrequency',
    starter: `/**
 * @param {string} str
 * @returns {Record<string, number>}
 */
function charFrequency(str) {
  // your code
}`,
    tests: [
      { args: ['hello'], expected: { h: 1, e: 1, l: 2, o: 1 } },
      { args: ['Aa B'], expected: { a: 2, b: 1 } },
      { args: [''], expected: {} },
      { args: ['   '], expected: {} },
      { args: ['zz'], expected: { z: 2 } },
      { args: ['a1a1!'], expected: { a: 2, '1': 2, '!': 1 }, hidden: true },
      { args: ['Test Test'], expected: { t: 4, e: 2, s: 2 }, hidden: true },
    ],
    hints: [
      'Lowercase the string first.',
      'Skip `" "`, then tally with `counts[ch] = (counts[ch] || 0) + 1`.',
    ],
    solution: `function charFrequency(str) {
  const counts = {};
  for (const ch of str.toLowerCase()) {
    if (ch === ' ') continue;
    counts[ch] = (counts[ch] || 0) + 1;
  }
  return counts;
}`,
    explanation: `**Approach:** the counting pattern over characters. Normalise case, skip spaces, tally into an object.

**Complexity:** O(n) time, O(k) space for k distinct characters.

**Alternative:** a \`Map\` (keeps insertion order explicitly and allows any key type), or \`reduce\`. For only a-z you could use a fixed array of 26 counts indexed by \`charCodeAt(0) - 97\`.

**Say aloud:** "This counting map is the building block for anagram, first-unique-character and duplicate-character problems."`,
    followUps: [
      { q: 'How would you find the most frequent character?', a: 'After counting, iterate Object.entries and keep the entry with the highest count, deciding upfront how ties are broken.' },
    ],
  },
  {
    id: 'code-strings-first-non-repeating',
    category: 'strings',
    difficulty: 'medium',
    title: 'First non-repeating character',
    prompt: `Write \`firstNonRepeating(str)\` that returns the first character that appears **exactly once** (case-sensitive), or \`null\` if there is none.

**Example 1**
\`\`\`
firstNonRepeating('swiss')  // 'w'
\`\`\`
**Example 2**
\`\`\`
firstNonRepeating('aabb')  // null
\`\`\`

**Constraints**
- Case-sensitive: \`'a'\` and \`'A'\` are different.`,
    fnName: 'firstNonRepeating',
    starter: `/**
 * @param {string} str
 * @returns {string | null}
 */
function firstNonRepeating(str) {
  // your code
}`,
    tests: [
      { args: ['swiss'], expected: 'w' },
      { args: ['aabb'], expected: null },
      { args: [''], expected: null },
      { args: ['x'], expected: 'x' },
      { args: ['aAbB'], expected: 'a' },
      { args: ['loveleetcode'], expected: 'v', hidden: true },
      { args: ['abcabcd'], expected: 'd', hidden: true },
    ],
    hints: [
      'Two passes: count every character first.',
      'Second pass: return the first character whose count is 1.',
    ],
    solution: `function firstNonRepeating(str) {
  const counts = {};
  for (const ch of str) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of str) {
    if (counts[ch] === 1) return ch;
  }
  return null;
}`,
    explanation: `**Approach:** two passes. Build frequency counts, then scan the string in order and return the first character with count 1.

**Complexity:** O(n) time, O(k) space.

**Alternative:** \`str.indexOf(ch) === str.lastIndexOf(ch)\` for each character. It's a neat one-liner with \`find\`, but O(n²).

**Say aloud:** "The second pass goes over the string, not the map, so the original order decides which is 'first'."`,
    followUps: [
      { q: 'Why scan the string rather than the counts object in pass two?', a: 'Object key order puts integer-like keys first, so iterating the string guarantees the original character order.' },
    ],
  },
  {
    id: 'code-strings-anagram',
    category: 'strings',
    difficulty: 'easy',
    title: 'Anagram check',
    askedIn: 'Appears in Medium SDET JavaScript / Java coding-question lists',
    prompt: `Write \`isAnagram(a, b)\` that returns \`true\` if the two strings contain the same letters in any order, **ignoring case and spaces**.

**Example 1**
\`\`\`
isAnagram('Listen', 'Silent')  // true
\`\`\`
**Example 2**
\`\`\`
isAnagram('Dormitory', 'dirty room')  // true
\`\`\`

**Constraints**
- Other characters (digits, punctuation) count as-is.`,
    fnName: 'isAnagram',
    starter: `/**
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function isAnagram(a, b) {
  // your code
}`,
    tests: [
      { args: ['Listen', 'Silent'], expected: true },
      { args: ['Dormitory', 'dirty room'], expected: true },
      { args: ['abc', 'abd'], expected: false },
      { args: ['', ''], expected: true },
      { args: ['aab', 'abb'], expected: false },
      { args: ['abc', 'abcc'], expected: false, hidden: true },
      { args: ['A gentleman', 'Elegant man'], expected: true, hidden: true },
    ],
    hints: [
      'Normalise both: lowercase and remove spaces.',
      'Different lengths cannot be anagrams.',
      'Count characters of `a` up, characters of `b` down; every count must end at 0.',
    ],
    solution: `function isAnagram(a, b) {
  const x = a.toLowerCase().split(' ').join('');
  const y = b.toLowerCase().split(' ').join('');
  if (x.length !== y.length) return false;
  const counts = {};
  for (const ch of x) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of y) {
    if (!counts[ch]) return false;
    counts[ch]--;
  }
  return true;
}`,
    explanation: `**Approach:** normalise, check lengths, then use one frequency map: increment for \`a\`, decrement for \`b\`. If \`b\` needs a character with zero remaining, it's not an anagram.

**Complexity:** O(n) time, O(k) space.

**With built-ins:** \`sort(x) === sort(y)\` where \`sort = s => s.split('').sort().join('')\`. It reads well but costs O(n log n).

**Say aloud:** "The sort approach is easy to explain. The counting approach is linear. The length check is a cheap early exit."`,
    followUps: [
      { q: 'How would you group a list of words into anagram sets?', a: 'Use a Map keyed by each word\'s sorted letters (or its letter-count signature) and push the word into that key\'s array.' },
    ],
  },
  {
    id: 'code-strings-capitalize-words',
    category: 'strings',
    difficulty: 'easy',
    title: 'Capitalize each word',
    prompt: `Write \`capitalizeWords(str)\` that upper-cases the first letter of each word and lower-cases the rest. Words are separated by single spaces; keep the spacing as-is.

**Example 1**
\`\`\`
capitalizeWords('hello world')  // 'Hello World'
\`\`\`
**Example 2**
\`\`\`
capitalizeWords('pLAYWRIGHT tEST')  // 'Playwright Test'
\`\`\`

**Constraints**
- Empty string returns \`''\`.`,
    fnName: 'capitalizeWords',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function capitalizeWords(str) {
  // your code
}`,
    tests: [
      { args: ['hello world'], expected: 'Hello World' },
      { args: ['pLAYWRIGHT tEST'], expected: 'Playwright Test' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'A' },
      { args: ['add to cart'], expected: 'Add To Cart' },
      { args: ['123 abc'], expected: '123 Abc', hidden: true },
      { args: ['x  y'], expected: 'X  Y', hidden: true },
    ],
    hints: [
      'Split on `" "`, transform each word, and join with `" "`.',
      '`word[0].toUpperCase() + word.slice(1).toLowerCase()`. Watch out for empty words.',
    ],
    solution: `function capitalizeWords(str) {
  return str
    .split(' ')
    .map(function (w) {
      return w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w;
    })
    .join(' ');
}`,
    explanation: `**Approach:** split on spaces, capitalise each word, join back. Splitting on a single space keeps double spaces as empty words, and the guard on \`w\` avoids \`undefined[0]\`.

**Complexity:** O(n) time and space.

**Alternative:** regex \`str.toLowerCase().replace(/\\b[a-z]/g, c => c.toUpperCase())\`. Or a manual loop that upper-cases a character when the previous one was a space.

**Say aloud:** "My edge cases are an empty string, double spaces and words starting with digits. Those are exactly what I'd put in a data-driven test."`,
    followUps: [
      { q: 'Why might the \\b regex approach mis-handle names like "o\'neil"?', a: 'The apostrophe is a word boundary, so it would produce "O\'Neil". That might be desired or not, so clarify the requirement.' },
    ],
  },
  {
    id: 'code-strings-reverse-words',
    category: 'strings',
    difficulty: 'easy',
    title: 'Reverse the order of words',
    askedIn: 'Appears in Medium SDET JavaScript coding-question lists (reverse words in a string)',
    prompt: `Write \`reverseWords(str)\` that reverses the **order of words**. Trim leading/trailing spaces and collapse multiple spaces into one.

**Example 1**
\`\`\`
reverseWords('the sky is blue')  // 'blue is sky the'
\`\`\`
**Example 2**
\`\`\`
reverseWords('  hello   world  ')  // 'world hello'
\`\`\`

**Constraints**
- Whitespace-only input returns \`''\`.`,
    fnName: 'reverseWords',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function reverseWords(str) {
  // your code
}`,
    tests: [
      { args: ['the sky is blue'], expected: 'blue is sky the' },
      { args: ['  hello   world  '], expected: 'world hello' },
      { args: [''], expected: '' },
      { args: ['   '], expected: '' },
      { args: ['one'], expected: 'one' },
      { args: ['a b  c'], expected: 'c b a', hidden: true },
      { args: ['Login then Logout'], expected: 'Logout then Login', hidden: true },
    ],
    hints: [
      'Split on spaces and drop empty strings.',
      'Build the result from the last word to the first.',
    ],
    solution: `function reverseWords(str) {
  const words = str.split(' ').filter(function (w) { return w.length > 0; });
  const out = [];
  for (let i = words.length - 1; i >= 0; i--) out.push(words[i]);
  return out.join(' ');
}`,
    explanation: `**Approach:** split, discard empty pieces (they come from repeated spaces), walk backwards, join with single spaces.

**Complexity:** O(n) time and space.

**With built-ins:** \`str.trim().split(/\\s+/).reverse().join(' ')\`. But \`''.split(/\\s+/)\` gives \`['']\`, so the result is still \`''\`, which is fine here and worth noticing.

**Say aloud:** "Before coding I'd ask how to handle extra spaces, then make it a test case. A related follow-up is reversing each word's letters in place."`,
    followUps: [
      { q: 'How would you reverse each word but keep word order?', a: "Split into words, reverse each word's characters (split, reverse, join), then join the words back with spaces." },
    ],
  },
  {
    id: 'code-strings-longest-word',
    category: 'strings',
    difficulty: 'easy',
    title: 'Longest word in a sentence',
    prompt: `Write \`longestWord(sentence)\` that returns the longest word. Ignore punctuation (keep only letters and digits). On a tie, return the **first** one. Return \`''\` for no words.

**Example 1**
\`\`\`
longestWord('I love automation testing')  // 'automation'
\`\`\`
**Example 2**
\`\`\`
longestWord('fun& time!')  // 'time'   ('fun' and 'time': 4 > 3)
\`\`\`

**Constraints**
- Words are separated by whitespace.`,
    fnName: 'longestWord',
    starter: `/**
 * @param {string} sentence
 * @returns {string}
 */
function longestWord(sentence) {
  // your code
}`,
    tests: [
      { args: ['I love automation testing'], expected: 'automation' },
      { args: ['fun& time!'], expected: 'time' },
      { args: [''], expected: '' },
      { args: ['cat dog'], expected: 'cat' },
      { args: ['a'], expected: 'a' },
      { args: ['!!! ???'], expected: '', hidden: true },
      { args: ['Hello, world!!'], expected: 'Hello', hidden: true },
    ],
    hints: [
      'Split on spaces and strip non-alphanumeric characters from each word.',
      'Replace the best word only when the new one is **strictly** longer (that keeps the first on ties).',
    ],
    solution: `function longestWord(sentence) {
  let best = '';
  for (const raw of sentence.split(' ')) {
    const w = raw.replace(/[^A-Za-z0-9]/g, '');
    if (w.length > best.length) best = w;
  }
  return best;
}`,
    explanation: `**Approach:** split, clean each token with a regex, keep the longest. Using \`>\` rather than \`>=\` keeps the first word on ties.

**Complexity:** O(n) time, O(n) space for the split.

**With built-ins:** \`sentence.match(/[A-Za-z0-9]+/g)\` to extract words, then \`reduce\` to pick the longest. Remember that \`match\` returns \`null\` when there are no words.

**Say aloud:** "Tie-breaking and punctuation are requirement questions. I'd ask, then encode the answer in tests."`,
    followUps: [
      { q: 'How would you return all words that tie for longest?', a: 'First find the max length in one pass, then filter the cleaned words whose length equals it.' },
    ],
  },
  {
    id: 'code-strings-compress',
    category: 'strings',
    difficulty: 'medium',
    title: 'String compression (run-length)',
    prompt: `Write \`compress(str)\` that replaces each run of the same character with the character followed by the run length, e.g. \`"aabccc"\` → \`"a2b1c3"\`.

**Example 1**
\`\`\`
compress('aabccc')  // 'a2b1c3'
\`\`\`
**Example 2**
\`\`\`
compress('abca')  // 'a1b1c1a1'
\`\`\`

**Constraints**
- Runs are consecutive only: non-adjacent repeats start a new run.
- Empty string returns \`''\`.`,
    fnName: 'compress',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function compress(str) {
  // your code
}`,
    tests: [
      { args: ['aabccc'], expected: 'a2b1c3' },
      { args: ['abca'], expected: 'a1b1c1a1' },
      { args: [''], expected: '' },
      { args: ['z'], expected: 'z1' },
      { args: ['aaaaaaaaaaaa'], expected: 'a12' },
      { args: ['AAaa'], expected: 'A2a2', hidden: true },
      { args: ['  x'], expected: ' 2x1', hidden: true },
    ],
    hints: [
      'Keep a counter for the current run.',
      'When the next character differs (or you reach the end), append char + count and reset.',
    ],
    solution: `function compress(str) {
  let out = '';
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === str[i + 1]) {
      count++;
    } else {
      out += str[i] + count;
      count = 1;
    }
  }
  return out;
}`,
    explanation: `**Approach:** one pass comparing each character with the next. When the run ends (including at the last index, where \`str[i + 1]\` is \`undefined\`), emit char + count.

**Complexity:** O(n) time, O(n) space for the output.

**With built-ins:** \`str.replace(/(.)\\1*/g, m => m[0] + m.length)\`. The regex captures each run via a backreference.

**Say aloud:** "The classic bug is forgetting to flush the last run. Comparing with i + 1 handles that naturally. I'd test multi-digit counts like 12."`,
    followUps: [
      { q: 'How would you decompress "a2b1c3"?', a: 'Scan characters: when you see a letter, read all following digits as the count, then repeat the letter that many times.' },
    ],
  },
  {
    id: 'code-strings-count-words',
    category: 'strings',
    difficulty: 'easy',
    title: 'Count words',
    prompt: `Write \`countWords(str)\` that returns the number of words, where words are separated by **any amount of whitespace** (spaces, tabs, newlines).

**Example 1**
\`\`\`
countWords('Hello world from QA')  // 4
\`\`\`
**Example 2**
\`\`\`
countWords('   spaced    out   ')  // 2
\`\`\`

**Constraints**
- Empty or whitespace-only input returns \`0\`.`,
    fnName: 'countWords',
    starter: `/**
 * @param {string} str
 * @returns {number}
 */
function countWords(str) {
  // your code
}`,
    tests: [
      { args: ['Hello world from QA'], expected: 4 },
      { args: ['   spaced    out   '], expected: 2 },
      { args: [''], expected: 0 },
      { args: ['     '], expected: 0 },
      { args: ['one'], expected: 1 },
      { args: ['tab\tseparated\nlines'], expected: 3, hidden: true },
      { args: ['a b c d e f'], expected: 6, hidden: true },
    ],
    hints: [
      'A naive `split(" ").length` returns 1 for an empty string. Why?',
      'Count transitions from whitespace to non-whitespace, or split on `/\\s+/` after trimming.',
    ],
    solution: `function countWords(str) {
  let count = 0;
  let inWord = false;
  for (const ch of str) {
    const isSpace = ch === ' ' || ch === '\\t' || ch === '\\n' || ch === '\\r';
    if (!isSpace && !inWord) {
      count++;
      inWord = true;
    } else if (isSpace) {
      inWord = false;
    }
  }
  return count;
}`,
    explanation: `**Approach:** a small state machine. Count each time you enter a word (a non-space after a space or at the start).

**Complexity:** O(n) time, O(1) space.

**With built-ins:** \`const t = str.trim(); return t ? t.split(/\\s+/).length : 0;\`. The empty check matters because \`''.split(/\\s+/)\` returns \`['']\`, with length 1.

**Say aloud:** "The trap is that splitting an empty string gives one element. I'd add empty and whitespace-only inputs to my tests."`,
    followUps: [
      { q: 'Why does "".split(" ").length equal 1?', a: 'Splitting a string with no separator present returns an array containing the whole string, here [""], so its length is 1.' },
    ],
  },
  {
    id: 'code-strings-remove-duplicate-chars',
    category: 'strings',
    difficulty: 'easy',
    title: 'Remove duplicate characters',
    prompt: `Write \`removeDuplicateChars(str)\` that keeps only the **first** occurrence of each character (case-sensitive), preserving order.

**Example 1**
\`\`\`
removeDuplicateChars('programming')  // 'progamin'
\`\`\`
**Example 2**
\`\`\`
removeDuplicateChars('aAaA')  // 'aA'
\`\`\`

**Constraints**
- Spaces are characters too.`,
    fnName: 'removeDuplicateChars',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function removeDuplicateChars(str) {
  // your code
}`,
    tests: [
      { args: ['programming'], expected: 'progamin' },
      { args: ['aAaA'], expected: 'aA' },
      { args: [''], expected: '' },
      { args: ['abc'], expected: 'abc' },
      { args: ['zzzz'], expected: 'z' },
      { args: ['a b a b'], expected: 'a b', hidden: true },
      { args: ['112233'], expected: '123', hidden: true },
    ],
    hints: [
      'Keep a Set of characters already added.',
      'Append a character only the first time you see it.',
    ],
    solution: `function removeDuplicateChars(str) {
  const seen = new Set();
  let out = '';
  for (const ch of str) {
    if (!seen.has(ch)) {
      seen.add(ch);
      out += ch;
    }
  }
  return out;
}`,
    explanation: `**Approach:** a seen-Set while building the output in order.

**Complexity:** O(n) time, O(k) space.

**With built-ins:** \`[...new Set(str)].join('')\`. A Set of a string iterates its characters and keeps insertion order. Without a Set: \`str.split('').filter((c, i) => str.indexOf(c) === i).join('')\`, which is O(n²).

**Say aloud:** "Same pattern as array dedupe: Set is the idiomatic one-liner, and indexOf shows I understand it without built-ins."`,
    followUps: [
      { q: 'How would you remove all characters that appear more than once (not just extra copies)?', a: 'Count frequencies first, then keep only characters with count === 1. "programming" becomes "poain".' },
    ],
  },
];
