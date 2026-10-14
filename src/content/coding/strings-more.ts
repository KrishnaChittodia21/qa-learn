import type { CodingProblem } from '../../types';

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'code-strings-move-char-to-end',
    category: 'strings',
    difficulty: 'easy',
    title: 'Move a character to the end of a string',
    prompt: `Write \`moveCharToEnd(str, ch)\` that moves **every** occurrence of the character \`ch\` to the end of the string. All other characters keep their order.

Do it with a loop: no \`replaceAll\`, \`split\`, regex or \`filter\`.

**Example 1**
\`\`\`
moveCharToEnd('hello world', 'o')  // 'hell wrldoo'
\`\`\`
**Example 2**
\`\`\`
moveCharToEnd('banana', 'a')  // 'bnnaaa'
\`\`\`

**Constraints**
- \`ch\` is a single character; matching is case-sensitive.
- Spaces are ordinary characters.`,
    fnName: 'moveCharToEnd',
    starter: `/**
 * @param {string} str
 * @param {string} ch single character
 * @returns {string}
 */
function moveCharToEnd(str, ch) {
  // your code
}`,
    tests: [
      { args: ['hello world', 'o'], expected: 'hell wrldoo' },
      { args: ['banana', 'a'], expected: 'bnnaaa' },
      { args: ['', 'x'], expected: '' },
      { args: ['a', 'a'], expected: 'a' },
      { args: ['abc', 'z'], expected: 'abc' },
      { args: ['xxxx', 'x'], expected: 'xxxx' },
      { args: ['Aa aA', 'a'], expected: 'A Aaa', hidden: true },
      { args: ['a b c', ' '], expected: 'abc  ', hidden: true },
    ],
    hints: [
      'Build two strings while you scan: the characters to keep, and the matched characters.',
      'Return `kept + moved`.',
    ],
    solution: `function moveCharToEnd(str, ch) {
  let kept = '';
  let moved = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ch) moved += ch;
    else kept += str[i];
  }
  return kept + moved;
}`,
    explanation: `**Approach:** strings are immutable in JavaScript, so "in place" is not possible. Build two accumulators in one pass and join them: everything that isn't \`ch\` in original order, then the matches.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`str.split(ch).join('') + ch.repeat(str.split(ch).length - 1)\`, or \`str.replaceAll(ch, '') + ch.repeat(count)\`.

**Say aloud:** "Strings are immutable, so I build a new one. It's the same idea as moving zeros to the end of an array, just with two buffers. For very long strings I'd collect characters in an array and join once."`,
    followUps: [
      { q: 'How would you do the array version in place?', a: 'Use a write pointer: copy every element that is not the target to arr[write++], then fill the remaining slots with the target. O(n) time, O(1) space, and stable.' },
    ],
  },
  {
    id: 'code-strings-move-first-to-end',
    category: 'strings',
    difficulty: 'easy',
    title: 'Move the first character or first word to the end',
    prompt: `Write \`moveFirstToEnd(str, unit)\` that moves the first **character** (\`unit === 'char'\`) or the first **word** (\`unit === 'word'\`) to the end.

Words are separated by single spaces. Don't use \`split\`, \`slice\` or \`substring\`; loop over the characters.

**Example 1**
\`\`\`
moveFirstToEnd('hello', 'char')  // 'elloh'
\`\`\`
**Example 2**
\`\`\`
moveFirstToEnd('quick brown fox', 'word')  // 'brown fox quick'
\`\`\`

**Constraints**
- Empty input returns \`''\`.
- A single character or single word comes back unchanged.`,
    fnName: 'moveFirstToEnd',
    starter: `/**
 * @param {string} str
 * @param {'char' | 'word'} unit
 * @returns {string}
 */
function moveFirstToEnd(str, unit) {
  // your code
}`,
    tests: [
      { args: ['hello', 'char'], expected: 'elloh' },
      { args: ['quick brown fox', 'word'], expected: 'brown fox quick' },
      { args: ['', 'char'], expected: '' },
      { args: ['', 'word'], expected: '' },
      { args: ['a', 'char'], expected: 'a' },
      { args: ['solo', 'word'], expected: 'solo' },
      { args: ['ab', 'char'], expected: 'ba', hidden: true },
      { args: ['go to test', 'word'], expected: 'to test go', hidden: true },
      { args: ['a b', 'word'], expected: 'b a', hidden: true },
    ],
    hints: [
      "For 'char': the answer is everything from index 1, followed by str[0].",
      "For 'word': find the index of the first space. If there is none, return the string as is.",
      'Then build: characters after the space + a space + characters before it.',
    ],
    solution: `function moveFirstToEnd(str, unit) {
  if (str.length === 0) return '';
  if (unit === 'char') {
    let rest = '';
    for (let i = 1; i < str.length; i++) rest += str[i];
    return rest + str[0];
  }
  let space = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ' ') { space = i; break; }
  }
  if (space === -1) return str;
  let first = '';
  for (let i = 0; i < space; i++) first += str[i];
  let rest = '';
  for (let i = space + 1; i < str.length; i++) rest += str[i];
  return rest + ' ' + first;
}`,
    explanation: `**Approach:** a "rotate left by one" on characters or on words. For characters, copy from index 1 and append the first character. For words, find the first space, then rebuild as \`rest + ' ' + firstWord\`. A string with no space is a single word and stays as it is.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`str.slice(1) + str[0]\` for characters. For words: \`const [first, ...rest] = str.split(' '); return [...rest, first].join(' ');\`.

**Say aloud:** "This is the string version of rotating an array by one. My edge cases are empty input, one character, and one word with no space."`,
    followUps: [
      { q: 'How would you move the LAST word to the front?', a: 'Find the last space with a backwards loop (or lastIndexOf), then return lastWord + " " + everythingBefore. With built-ins: words.unshift(words.pop()) on the split array.' },
    ],
  },
  {
    id: 'code-strings-digits-to-end',
    category: 'strings',
    difficulty: 'easy',
    title: 'Move all digits to the end',
    prompt: `Write \`digitsToEnd(str)\` that moves every digit \`0-9\` to the end of the string. Non-digits come first in their original order, then the digits in their original order.

No regex.

**Example 1**
\`\`\`
digitsToEnd('a1b2c3')  // 'abc123'
\`\`\`
**Example 2**
\`\`\`
digitsToEnd('Test42Case7')  // 'TestCase427'
\`\`\`

**Constraints**
- Spaces and punctuation are non-digits and stay in the first group.`,
    fnName: 'digitsToEnd',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function digitsToEnd(str) {
  // your code
}`,
    tests: [
      { args: ['a1b2c3'], expected: 'abc123' },
      { args: ['Test42Case7'], expected: 'TestCase427' },
      { args: [''], expected: '' },
      { args: ['5'], expected: '5' },
      { args: ['abc'], expected: 'abc' },
      { args: ['2024'], expected: '2024' },
      { args: ['id: 9, v 0.1'], expected: 'id: , v .901', hidden: true },
      { args: ['0a0'], expected: 'a00', hidden: true },
    ],
    hints: [
      "A character is a digit when `ch >= '0' && ch <= '9'` (string comparison works for single characters).",
      'Collect non-digits and digits in two separate strings, then concatenate.',
    ],
    solution: `function digitsToEnd(str) {
  let letters = '';
  let digits = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch >= '0' && ch <= '9') digits += ch;
    else letters += ch;
  }
  return letters + digits;
}`,
    explanation: `**Approach:** a stable partition into two buffers. The digit test \`ch >= '0' && ch <= '9'\` compares character codes, so no regex or \`Number()\` is needed.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`str.replace(/\\d/g, '') + str.replace(/\\D/g, '')\`. Avoid \`!isNaN(ch)\` as a digit test: \`isNaN(' ')\` is false, so spaces would count as digits.

**Say aloud:** "It's a stable partition. I check digits by character range, and I'd call out the isNaN-on-a-space trap."`,
    followUps: [
      { q: 'Why is !isNaN(ch) a bad digit check?', a: 'isNaN coerces with Number(), and Number(" ") is 0, so a space passes as a digit. Number("") is also 0. A range check or /\\d/ is exact.' },
    ],
  },
  {
    id: 'code-strings-uppercase-to-end',
    category: 'strings',
    difficulty: 'easy',
    title: 'Move all uppercase letters to the end',
    prompt: `Write \`uppercaseToEnd(str)\` that moves every uppercase letter \`A-Z\` to the end. Everything else stays first in its original order; the uppercase letters keep their order too.

**Example 1**
\`\`\`
uppercaseToEnd('HeLLo')  // 'eoHLL'
\`\`\`
**Example 2**
\`\`\`
uppercaseToEnd('aBcDe 1')  // 'ace 1BD'
\`\`\`

**Constraints**
- Only \`A-Z\` count as uppercase. Digits, spaces and punctuation are not uppercase.
- No regex.`,
    fnName: 'uppercaseToEnd',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function uppercaseToEnd(str) {
  // your code
}`,
    tests: [
      { args: ['HeLLo'], expected: 'eoHLL' },
      { args: ['aBcDe 1'], expected: 'ace 1BD' },
      { args: [''], expected: '' },
      { args: ['Q'], expected: 'Q' },
      { args: ['abc'], expected: 'abc' },
      { args: ['ABC'], expected: 'ABC', hidden: true },
      { args: ['1!A?b'], expected: '1!?bA', hidden: true },
    ],
    hints: [
      "Test with `ch >= 'A' && ch <= 'Z'`.",
      "`ch === ch.toUpperCase()` is a trap: it is also true for '1', ' ' and '!'.",
    ],
    solution: `function uppercaseToEnd(str) {
  let rest = '';
  let upper = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch >= 'A' && ch <= 'Z') upper += ch;
    else rest += ch;
  }
  return rest + upper;
}`,
    explanation: `**Approach:** stable partition into two buffers, with an ASCII range check for uppercase.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`str.replace(/[A-Z]/g, '') + str.replace(/[^A-Z]/g, '')\`.

**The trap:** \`ch === ch.toUpperCase()\` is true for digits, spaces and punctuation, because they have no case. If the interviewer wants letters in any alphabet, use \`ch !== ch.toLowerCase()\` (true only for characters that have a lowercase form).

**Say aloud:** "I define uppercase as A to Z, and I'd mention that the toUpperCase comparison misclassifies non-letters."`,
    followUps: [
      { q: 'How would you support non-English uppercase letters like É?', a: 'Use ch !== ch.toLowerCase(), which is only true for characters with a lowercase form, or the Unicode regex /\\p{Lu}/u.' },
    ],
  },
  {
    id: 'code-strings-vowels-to-end',
    category: 'strings',
    difficulty: 'easy',
    title: 'Move all vowels to the end',
    prompt: `Write \`vowelsToEnd(str)\` that moves every vowel (\`a e i o u\`, either case) to the end of the string. Consonants and other characters keep their order, and so do the vowels.

**Example 1**
\`\`\`
vowelsToEnd('programming')  // 'prgrmmngoai'
\`\`\`
**Example 2**
\`\`\`
vowelsToEnd('QA Engineer')  // 'Q ngnrAEiee'
\`\`\`

**Constraints**
- \`y\` is not a vowel.
- Keep each vowel's original case.`,
    fnName: 'vowelsToEnd',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function vowelsToEnd(str) {
  // your code
}`,
    tests: [
      { args: ['programming'], expected: 'prgrmmngoai' },
      { args: ['QA Engineer'], expected: 'Q ngnrAEiee' },
      { args: [''], expected: '' },
      { args: ['e'], expected: 'e' },
      { args: ['rhythm'], expected: 'rhythm' },
      { args: ['aeiou'], expected: 'aeiou', hidden: true },
      { args: ['UnIt'], expected: 'ntUI', hidden: true },
    ],
    hints: [
      "Keep a lookup string 'aeiouAEIOU' and check membership.",
      'Two buffers again: non-vowels first, vowels second.',
    ],
    solution: `function vowelsToEnd(str) {
  const vowels = 'aeiouAEIOU';
  let rest = '';
  let moved = '';
  for (let i = 0; i < str.length; i++) {
    let isVowel = false;
    for (let j = 0; j < vowels.length; j++) {
      if (str[i] === vowels[j]) { isVowel = true; break; }
    }
    if (isVowel) moved += str[i];
    else rest += str[i];
  }
  return rest + moved;
}`,
    explanation: `**Approach:** stable partition with a vowel check. The inner loop over 10 vowels is constant work, so the whole thing stays linear.

**Complexity:** O(n) time, O(n) space.

**With built-ins:** \`str.replace(/[aeiou]/gi, '') + (str.match(/[aeiou]/gi) || []).join('')\`. Note that \`match\` returns \`null\` (not \`[]\`) when nothing matches, which is a common bug. A \`Set\` of vowels with \`.has(ch)\` is the idiomatic lookup.

**Say aloud:** "I check both cases, keep the original character, and make sure a word with no vowels comes back unchanged."`,
    followUps: [
      { q: 'What does "rhythm".match(/[aeiou]/g) return, and why does it matter?', a: 'It returns null, not an empty array, so calling .join or .length on it throws a TypeError. Guard with || [].' },
    ],
  },
  {
    id: 'code-strings-remove-adjacent-duplicates',
    category: 'strings',
    difficulty: 'hard',
    title: 'Repeatedly remove adjacent duplicates',
    askedIn: 'LeetCode 1047; listed as "Repeatedly Remove Duplicates" (Hard) in GeeksforGeeks "Top 50 String Coding Problems for Interviews"; Hello Interview reports it asked at Goldman Sachs and Meta (2025–26)',
    prompt: `Write \`removeAdjacentDuplicates(str)\` that repeatedly removes **pairs of equal adjacent characters** until no such pair remains, and returns the result.

Removing a pair can bring two equal characters together, and they must be removed too.

**Example 1**
\`\`\`
removeAdjacentDuplicates('abbaca')  // 'ca'
// remove 'bb' → 'aaca', remove 'aa' → 'ca'
\`\`\`
**Example 2**
\`\`\`
removeAdjacentDuplicates('azxxzy')  // 'ay'
\`\`\`

**Constraints**
- \`0 <= str.length <= 10^5\`
- Case-sensitive.
- Aim for one pass, not "loop until nothing changes".`,
    fnName: 'removeAdjacentDuplicates',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function removeAdjacentDuplicates(str) {
  // your code
}`,
    tests: [
      { args: ['abbaca'], expected: 'ca' },
      { args: ['azxxzy'], expected: 'ay' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['abc'], expected: 'abc' },
      { args: ['aa'], expected: '' },
      { args: ['aaa'], expected: 'a', hidden: true },
      { args: ['abba'], expected: '', hidden: true },
      { args: ['aA'], expected: 'aA', hidden: true },
    ],
    hints: [
      'A brute force of "find a pair, remove it, start over" works but is O(n²).',
      'Use a stack: it holds the characters that have survived so far.',
      'For each character: if it equals the top of the stack, pop (the pair cancels). Otherwise push. Join the stack at the end.',
    ],
    solution: `function removeAdjacentDuplicates(str) {
  const stack = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join('');
}`,
    explanation: `**Approach:** a stack. The stack is the answer for the prefix processed so far. A new character either cancels the top (they are an adjacent pair once everything between them is gone) or is pushed. Cascading removals like \`abba\` happen automatically: after \`bb\` cancels, the top is \`a\` again.

**Complexity:** O(n) time, O(n) space.

**Brute force:** \`while (/(.)\\1/.test(s)) s = s.replace(/(.)\\1/g, '')\` is short but O(n²) in the worst case (\`'abccba'\`-style nesting needs many rounds). Note the pairs rule: \`'aaa'\` becomes \`'a'\`, because only two equal characters cancel at a time.

**Say aloud:** "Matching and cancelling neighbours is a stack pattern, like balanced brackets. I'd test a cascade (abba), an odd run (aaa) and case sensitivity."`,
    followUps: [
      { q: 'What if you must remove runs of k equal characters (LeetCode 1209)?', a: 'Store [char, count] pairs on the stack. Increment the count when the top matches, pop when it reaches k, and expand the pairs back into a string at the end.' },
      { q: 'How is this different from collapsing consecutive duplicates?', a: 'Collapsing keeps one of each run in a single pass ("aabba" gives "aba"), while this removes pairs repeatedly ("aabba" gives "a").' },
    ],
  },
  {
    id: 'code-strings-collapse-consecutive',
    category: 'strings',
    difficulty: 'easy',
    title: 'Remove consecutive duplicate characters',
    prompt: `Write \`collapseRepeats(str)\` that replaces every run of the same character with a single copy. Non-adjacent repeats are kept.

**Example 1**
\`\`\`
collapseRepeats('aaabccdd')  // 'abcd'
\`\`\`
**Example 2**
\`\`\`
collapseRepeats('aabbaa')  // 'aba'
\`\`\`

**Constraints**
- Case-sensitive: \`'aA'\` is two different characters.
- One pass, no regex.`,
    fnName: 'collapseRepeats',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function collapseRepeats(str) {
  // your code
}`,
    tests: [
      { args: ['aaabccdd'], expected: 'abcd' },
      { args: ['aabbaa'], expected: 'aba' },
      { args: [''], expected: '' },
      { args: ['x'], expected: 'x' },
      { args: ['abc'], expected: 'abc' },
      { args: ['zzzzzz'], expected: 'z' },
      { args: ['aAAa'], expected: 'aAa', hidden: true },
      { args: ['hello  world'], expected: 'helo world', hidden: true },
    ],
    hints: [
      'Compare each character with the previous one.',
      'Append it only when it differs from the character before it (the first character is always appended).',
    ],
    solution: `function collapseRepeats(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    if (i === 0 || str[i] !== str[i - 1]) out += str[i];
  }
  return out;
}`,
    explanation: `**Approach:** one pass, comparing each character with its predecessor in the **input**. Keep it only when it starts a new run.

**Complexity:** O(n) time, O(n) space for the output.

**With built-ins:** \`str.replace(/(.)\\1+/g, '$1')\`. The backreference \`\\1\` matches "the same character again".

**Not the same as dedupe:** \`[...new Set(str)].join('')\` would turn \`'aabbaa'\` into \`'ab'\`, dropping the second run of \`a\`.

**Say aloud:** "Only adjacent repeats collapse, so a previous-character comparison is enough. I'd test that non-adjacent repeats survive."`,
    followUps: [
      { q: 'A related task: collapse multiple spaces into one. How?', a: 'Same loop, but only skip a character when both it and the previous character are spaces. With built-ins: str.replace(/ {2,}/g, " ") or / +/g.' },
    ],
  },
  {
    id: 'code-strings-remove-duplicate-words',
    category: 'strings',
    difficulty: 'easy',
    title: 'Remove duplicate words from a sentence',
    prompt: `Write \`removeDuplicateWords(sentence)\` that removes repeated words **ignoring case**, keeping the first occurrence with its original spelling. Words are separated by spaces; return them joined by single spaces.

**Example 1**
\`\`\`
removeDuplicateWords('the cat and the CAT')  // 'the cat and'
\`\`\`
**Example 2**
\`\`\`
removeDuplicateWords('Test test TEST case')  // 'Test case'
\`\`\`

**Constraints**
- There may be extra spaces between words; ignore empty tokens.
- Punctuation is part of the word (\`'cat.'\` differs from \`'cat'\`).`,
    fnName: 'removeDuplicateWords',
    starter: `/**
 * @param {string} sentence
 * @returns {string}
 */
function removeDuplicateWords(sentence) {
  // your code
}`,
    tests: [
      { args: ['the cat and the CAT'], expected: 'the cat and' },
      { args: ['Test test TEST case'], expected: 'Test case' },
      { args: [''], expected: '' },
      { args: ['hello'], expected: 'hello' },
      { args: ['one two three'], expected: 'one two three' },
      { args: ['go go go'], expected: 'go', hidden: true },
      { args: ['  a  b   A  '], expected: 'a b', hidden: true },
      { args: ['cat. cat'], expected: 'cat. cat', hidden: true },
    ],
    hints: [
      "Split on ' ' and skip empty strings created by extra spaces.",
      'Keep a seen-collection of lower-cased words; push the original word only on the first sighting.',
    ],
    solution: `function removeDuplicateWords(sentence) {
  const tokens = sentence.split(' ');
  const seen = {};
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    if (word === '') continue;
    const key = word.toLowerCase();
    if (!seen[key]) {
      seen[key] = true;
      out.push(word);
    }
  }
  return out.join(' ');
}`,
    explanation: `**Approach:** tokenise, then dedupe on a lower-cased key while keeping the original word. Skipping empty tokens handles double spaces and leading/trailing spaces.

**Complexity:** O(n) time over the characters, O(w) space for w words.

**With built-ins:** \`const seen = new Set(); sentence.split(/\\s+/).filter(w => w && !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase())).join(' ')\`. \`[...new Set(words)]\` alone is case-sensitive, so 'cat' and 'CAT' would both survive.

**Say aloud:** "It's the array dedupe again, on words, with a normalised key. I'd clarify how to treat punctuation and multiple spaces."`,
    followUps: [
      { q: 'How would you treat "cat." and "cat" as the same word?', a: 'Strip punctuation for the comparison key only, e.g. word.toLowerCase().replace(/[^a-z0-9]/g, ""), but still output the original word.' },
    ],
  },
  {
    id: 'code-strings-remove-char',
    category: 'strings',
    difficulty: 'easy',
    title: 'Remove a character without replaceAll',
    prompt: `Write \`removeChar(str, ch)\` that removes every occurrence of the character \`ch\` using a manual loop.

Not allowed: \`replace\`, \`replaceAll\`, \`split\`, regex.

**Example 1**
\`\`\`
removeChar('banana', 'a')  // 'bnn'
\`\`\`
**Example 2**
\`\`\`
removeChar('a b c', ' ')  // 'abc'
\`\`\`

**Constraints**
- Case-sensitive.
- \`ch\` is a single character.`,
    fnName: 'removeChar',
    starter: `/**
 * @param {string} str
 * @param {string} ch
 * @returns {string}
 */
function removeChar(str, ch) {
  // your code
}`,
    tests: [
      { args: ['banana', 'a'], expected: 'bnn' },
      { args: ['a b c', ' '], expected: 'abc' },
      { args: ['', 'a'], expected: '' },
      { args: ['a', 'a'], expected: '' },
      { args: ['hello', 'z'], expected: 'hello' },
      { args: ['aaaa', 'a'], expected: '', hidden: true },
      { args: ['AaAa', 'A'], expected: 'aa', hidden: true },
    ],
    hints: [
      'Strings are immutable, so build a new one.',
      'Append each character that is not `ch`.',
    ],
    solution: `function removeChar(str, ch) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] !== ch) out += str[i];
  }
  return out;
}`,
    explanation: `**Approach:** copy every character except \`ch\` into a new string.

**Complexity:** O(n) time, O(n) space. Modern engines optimise \`+=\` on strings well; for very large inputs, collecting into an array and calling \`join('')\` once is the safe choice.

**With built-ins:** \`str.replaceAll(ch, '')\` or \`str.split(ch).join('')\`. Watch out: \`str.replace(ch, '')\` with a **string** pattern only removes the **first** match, a very common bug.

**Say aloud:** "I'd mention the replace-only-replaces-the-first gotcha, then write the loop to show I don't depend on the built-in."`,
    followUps: [
      { q: 'What does "banana".replace("a", "") return?', a: '"bnana". With a string pattern, replace only touches the first match; use replaceAll or a regex with the g flag to remove all of them.' },
    ],
  },
  {
    id: 'code-strings-most-frequent-char',
    category: 'strings',
    difficulty: 'easy',
    title: 'Most frequent character',
    prompt: `Write \`mostFrequentChar(str)\` that returns the character that appears most often, **ignoring spaces**. If several characters tie, return the one that appears **first** in the string. Return \`null\` if there are no non-space characters.

**Example 1**
\`\`\`
mostFrequentChar('hello world')  // 'l'
\`\`\`
**Example 2**
\`\`\`
mostFrequentChar('abab')  // 'a'  (tie, 'a' comes first)
\`\`\`

**Constraints**
- Case-sensitive: \`'A'\` and \`'a'\` are different.`,
    fnName: 'mostFrequentChar',
    starter: `/**
 * @param {string} str
 * @returns {string | null}
 */
function mostFrequentChar(str) {
  // your code
}`,
    tests: [
      { args: ['hello world'], expected: 'l' },
      { args: ['abab'], expected: 'a' },
      { args: [''], expected: null },
      { args: ['   '], expected: null },
      { args: ['z'], expected: 'z' },
      { args: ['bbbb'], expected: 'b' },
      { args: ['abcbca'], expected: 'a', hidden: true },
      { args: ['xyzzy'], expected: 'y', hidden: true },
      { args: ['aAAa a'], expected: 'a', hidden: true },
    ],
    hints: [
      'Pass 1: count every non-space character.',
      'Pass 2: walk the string from the start and keep the first character whose count is strictly greater than the best so far.',
      'Strictly greater (not >=) is what makes ties go to the earliest character.',
    ],
    solution: `function mostFrequentChar(str) {
  const counts = {};
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') continue;
    counts[ch] = (counts[ch] || 0) + 1;
  }
  let best = null;
  let bestCount = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch !== ' ' && counts[ch] > bestCount) {
      best = ch;
      bestCount = counts[ch];
    }
  }
  return best;
}`,
    explanation: `**Approach:** count, then pick. Walking the **string** in the second pass (not the counts object) and replacing the best only on a strictly greater count makes ties resolve to the earliest character.

**Complexity:** O(n) time, O(k) space for k distinct characters.

**With built-ins:** \`Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]\`. It's shorter, but object key order puts integer-like keys ('1', '2') first, so the tie-break becomes unreliable, and the sort makes it O(k log k).

**Say aloud:** "I'd confirm the tie-break, case sensitivity and whether spaces count, because they change the answer. Then count and pick in two linear passes."`,
    followUps: [
      { q: 'How would you return all characters that share the top count?', a: 'Find the max count first, then walk the string and collect each character whose count equals the max, using a seen-set so each appears once.' },
    ],
  },
  {
    id: 'code-strings-reverse-each-word',
    category: 'strings',
    difficulty: 'easy',
    title: 'Reverse each word, keep word order',
    prompt: `Write \`reverseEachWord(str)\` that reverses the characters of **each word** but keeps the words in their original order. Spaces stay exactly where they are.

**Example 1**
\`\`\`
reverseEachWord('Hello World')  // 'olleH dlroW'
\`\`\`
**Example 2**
\`\`\`
reverseEachWord('QA  is fun')  // 'AQ  si nuf'
\`\`\`

**Constraints**
- A word is a run of non-space characters.
- Preserve multiple and leading/trailing spaces.
- Try without \`split\`/\`reverse\`.`,
    fnName: 'reverseEachWord',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function reverseEachWord(str) {
  // your code
}`,
    tests: [
      { args: ['Hello World'], expected: 'olleH dlroW' },
      { args: ['QA  is fun'], expected: 'AQ  si nuf' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['abc'], expected: 'cba' },
      { args: ['   '], expected: '   ', hidden: true },
      { args: [' ab cd '], expected: ' ba dc ', hidden: true },
    ],
    hints: [
      'Scan left to right and build the current word in reverse by prepending each character: `word = ch + word`.',
      'When you hit a space, flush the reversed word to the output, then append the space.',
      "Don't forget to flush the last word after the loop.",
    ],
    solution: `function reverseEachWord(str) {
  let out = '';
  let word = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === ' ') {
      out += word + ' ';
      word = '';
    } else {
      word = ch + word;
    }
  }
  return out + word;
}`,
    explanation: `**Approach:** one pass. Prepending each character to \`word\` reverses it as you go. A space flushes the current word and is copied through unchanged, so spacing is preserved exactly.

**Complexity:** O(n) time for normal text, O(n) space. Strictly, prepending copies the word each time (O(L²) for a word of length L), so for very long "words" collect characters and reverse them with an index loop instead.

**With built-ins:** \`str.split(' ').map(w => [...w].reverse().join('')).join(' ')\`. Splitting on a single space keeps empty tokens, so multiple spaces survive. Using \`[...w]\` instead of \`w.split('')\` keeps emoji intact.

**Say aloud:** "This is different from reversing the word order. I'd confirm which one is wanted, then make sure the spacing comes back unchanged."`,
    followUps: [
      { q: 'Why does "😀ab".split("").reverse().join("") break the emoji?', a: 'split("") splits into UTF-16 code units, and the emoji is two of them (a surrogate pair). Reversing swaps the halves. [...str] splits by code point and keeps it intact.' },
    ],
  },
  {
    id: 'code-strings-swap-case',
    category: 'strings',
    difficulty: 'easy',
    title: 'Swap the case of every letter',
    prompt: `Write \`swapCase(str)\` that turns uppercase letters into lowercase and lowercase letters into uppercase. Everything else is unchanged.

**Example 1**
\`\`\`
swapCase('Hello World')  // 'hELLO wORLD'
\`\`\`
**Example 2**
\`\`\`
swapCase('QA-Test 101')  // 'qa-tEST 101'
\`\`\`

**Constraints**
- ASCII letters only need to be handled.
- Digits, spaces and punctuation stay as they are.`,
    fnName: 'swapCase',
    starter: `/**
 * @param {string} str
 * @returns {string}
 */
function swapCase(str) {
  // your code
}`,
    tests: [
      { args: ['Hello World'], expected: 'hELLO wORLD' },
      { args: ['QA-Test 101'], expected: 'qa-tEST 101' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'A' },
      { args: ['123 !?'], expected: '123 !?' },
      { args: ['ABC'], expected: 'abc', hidden: true },
      { args: ['xYz'], expected: 'XyZ', hidden: true },
    ],
    hints: [
      "Check `ch >= 'a' && ch <= 'z'` for lowercase and `ch >= 'A' && ch <= 'Z'` for uppercase.",
      'Use toUpperCase / toLowerCase on that single character (or shift its char code by 32).',
    ],
    solution: `function swapCase(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch >= 'a' && ch <= 'z') out += ch.toUpperCase();
    else if (ch >= 'A' && ch <= 'Z') out += ch.toLowerCase();
    else out += ch;
  }
  return out;
}`,
    explanation: `**Approach:** classify each character by ASCII range and flip it; leave non-letters alone.

**Complexity:** O(n) time, O(n) space.

**Without toUpperCase:** \`String.fromCharCode(ch.charCodeAt(0) ^ 32)\` flips ASCII case, because upper and lower case letters differ only in bit 5 (value 32).

**With built-ins:** \`[...str].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')\`. It works because non-letters are unchanged both ways.

**Say aloud:** "I check ranges so that digits and punctuation pass through, and I can mention the XOR-32 trick if they ask for no built-ins at all."`,
    followUps: [
      { q: 'Why does XOR with 32 swap ASCII case?', a: "'A' is 65 (1000001) and 'a' is 97 (1100001). They differ only in the 32 bit, so toggling that bit converts between the two cases." },
    ],
  },
  {
    id: 'code-strings-all-unique-chars',
    category: 'strings',
    difficulty: 'easy',
    title: 'Does a string have all unique characters?',
    prompt: `Write \`hasAllUniqueChars(str)\` that returns \`true\` if no character appears more than once (case-sensitive, spaces count).

Interviewers usually ask for a version **without** \`Set\` too.

**Example 1**
\`\`\`
hasAllUniqueChars('abcde')  // true
\`\`\`
**Example 2**
\`\`\`
hasAllUniqueChars('hello')  // false
\`\`\`

**Constraints**
- The empty string counts as unique.
- Return as soon as you find a repeat.`,
    fnName: 'hasAllUniqueChars',
    starter: `/**
 * @param {string} str
 * @returns {boolean}
 */
function hasAllUniqueChars(str) {
  // your code
}`,
    tests: [
      { args: ['abcde'], expected: true },
      { args: ['hello'], expected: false },
      { args: [''], expected: true },
      { args: ['x'], expected: true },
      { args: ['aA'], expected: true },
      { args: ['aaaa'], expected: false },
      { args: ['a b c'], expected: false, hidden: true },
      { args: ['abcdefghijklmnopqrstuvwxyza'], expected: false, hidden: true },
    ],
    hints: [
      'Keep a lookup of characters already seen.',
      'Return false the moment you see a character a second time; return true after the loop.',
    ],
    solution: `function hasAllUniqueChars(str) {
  const seen = {};
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (seen[ch]) return false;
    seen[ch] = true;
  }
  return true;
}`,
    explanation: `**Approach:** one pass with a seen-lookup and an early exit on the first repeat.

**Complexity:** O(n) time, O(k) space. With a fixed alphabet (e.g. 128 ASCII characters) you can also say "any string longer than 128 must contain a repeat", by the pigeonhole principle.

**With built-ins:** \`new Set(str).size === str.length\`. It's a neat one-liner but always processes the whole string, with no early exit.

**Without extra space:** compare every pair (O(n²)), or sort the characters and check neighbours (O(n log n)).

**Say aloud:** "Set-size comparison is the one-liner; the loop exits early. If memory is restricted, sorting and comparing neighbours is the fallback."`,
    followUps: [
      { q: 'How would you solve it with no additional data structure?', a: 'Compare each character with every later one (O(n²)), or sort the characters and check adjacent pairs (O(n log n)), trading time for memory.' },
    ],
  },
];
