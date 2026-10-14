// Pure simulation of JavaScript's comparison and + / - coercion rules.
// == follows the spec's IsLooselyEqual algorithm (ECMA-262 §7.2.14), simplified to the rules
// that matter without BigInt/Symbol: same type → strict compare; null/undefined pair → true;
// number vs string → ToNumber(string); boolean → ToNumber(boolean); object vs primitive →
// ToPrimitive(object) (valueOf, then toString); anything else → false.
// === (IsStrictlyEqual) stops at the type check. Every result is verified against Node in tests.
import type { BaseFrame } from '../../core';

export type GroupId = 'strnum' | 'special' | 'plus';
export type Op = '==' | '===';
export type Ladder = 'loose' | 'strict' | 'plus';

export interface Tok {
  text: string;
  type: string;
  /** just converted */
  hot?: boolean;
}

export interface CoFrame extends BaseFrame {
  /** active expression in the group (-1 before/after) */
  expr: number;
  /** result per expression once known */
  results: (string | null)[];
  left?: Tok;
  right?: Tok;
  op: string;
  ladder: Ladder;
  /** matching rule (-1 none) */
  rule: number;
  /** rules checked and not matched before `rule` */
  skipped: number[];
  /** rewrite chain of the current expression */
  trace: string[];
  verdict?: Tok;
}

export const LADDERS: Record<Ladder, string[]> = {
  loose: [
    'Same type? → compare with ===',
    'null vs undefined? → true',
    'number vs string? → ToNumber(string)',
    'boolean on a side? → ToNumber(boolean)',
    'object vs primitive? → ToPrimitive(obj)',
    'anything else → false',
  ],
  strict: ['Types differ? → false (stop)', 'Either side NaN? → false', 'Same value? → true, else false'],
  plus: [
    'a + b with a string side → ToString, join',
    'a + b, no strings → ToNumber, add',
    '- * / and unary + → always ToNumber',
    "ToNumber of non-numeric text → NaN",
  ],
};

export interface Group {
  id: GroupId;
  label: string;
  /** expressions as written with == (the op is swapped in for ===) */
  exprs: { l: string; r?: string; text?: string }[];
  /** arithmetic group: the == / === toggle does not apply */
  arithmetic?: boolean;
}

export const GROUPS: Record<GroupId, Group> = {
  strnum: { id: 'strnum', label: "'5' == 5 · 0 == '' · [] == false", exprs: [{ l: "'5'", r: '5' }, { l: '0', r: "''" }, { l: '[]', r: 'false' }] },
  special: { id: 'special', label: 'null == undefined · null == 0 · NaN === NaN', exprs: [{ l: 'null', r: 'undefined' }, { l: 'null', r: '0' }, { l: 'NaN', r: 'NaN' }] },
  plus: { id: 'plus', label: "'1' + 2 - 1 · 'b' + 'a' + +'a' + 'a'", arithmetic: true, exprs: [{ l: '', text: "'1' + 2 - 1" }, { l: '', text: "'b' + 'a' + +'a' + 'a'" }] },
};

export function exprText(g: Group, i: number, op: Op): string {
  const e = g.exprs[i];
  return e.text ?? `${e.l} ${op} ${e.r}`;
}

export interface Params {
  group: GroupId;
  op: Op;
}

const T = (text: string, type: string, hot = false): Tok => ({ text, type, hot });
const B = (b: boolean) => T(String(b), 'boolean');

export function simulate({ group, op }: Params): CoFrame[] {
  const g = GROUPS[group];
  const frames: CoFrame[] = [];
  const ladder: Ladder = g.arithmetic ? 'plus' : op === '==' ? 'loose' : 'strict';
  const results: (string | null)[] = g.exprs.map(() => null);
  let st: Omit<CoFrame, 'caption' | 'predict' | 'results' | 'ladder'> = { expr: -1, op, rule: -1, skipped: [], trace: [] };
  const snap = (caption: string, predict?: string) => frames.push({ ...st, trace: [...st.trace], skipped: [...st.skipped], results: [...results], ladder, caption, predict });
  /** start expression i with its two operands */
  const load = (i: number, left: Tok | undefined, right: Tok | undefined, theOp: string, caption: string, predict?: string) => {
    st = { expr: i, left, right, op: theOp, rule: -1, skipped: [], trace: [exprText(g, i, op)] };
    snap(caption, predict);
  };
  const rule = (r: number, caption: string, predict?: string) => {
    st.skipped = Array.from({ length: r }, (_, k) => k);
    st.rule = r;
    st.left = st.left && { ...st.left, hot: false };
    st.right = st.right && { ...st.right, hot: false };
    snap(caption, predict);
  };
  const apply = (caption: string, side: 'left' | 'right' | 'both' | 'none', tok: Tok | [Tok, Tok], traceLine?: string, predict?: string) => {
    if (side === 'left') st.left = { ...(tok as Tok), hot: true };
    if (side === 'right') st.right = { ...(tok as Tok), hot: true };
    if (side === 'both') [st.left, st.right] = (tok as [Tok, Tok]).map((t) => ({ ...t, hot: true }));
    if (traceLine) st.trace.push(traceLine);
    snap(caption, predict);
  };
  const verdict = (v: Tok, caption: string) => {
    st.verdict = v;
    results[st.expr] = v.text;
    st.trace.push(v.text);
    snap(caption);
    st.verdict = undefined;
  };

  const intro = g.arithmetic
    ? 'Arithmetic coercion: + joins strings if EITHER side is a string; every other maths operator converts to numbers. Watch each sub-expression get rewritten.'
    : op === '=='
      ? 'Loose equality ==: when the types differ, JavaScript walks a fixed rule list, converting one side at a time until both sides have the same type.'
      : 'Strict equality ===: the very first check compares the TYPES. If they differ the answer is false, with no conversion at all.';
  snap(intro);

  if (group === 'strnum') {
    if (op === '==') {
      load(0, T("'5'", 'string'), T('5', 'number'), '==', "'5' == 5: a string on the left, a number on the right (think: badge text read from the page vs an expected count).", "Types differ. Will == answer true or false?");
      rule(2, 'Not the same type and not null/undefined, but number vs string matches: convert the STRING with ToNumber.');
      apply("ToNumber('5') is 5. The comparison is now 5 == 5.", 'left', T('5', 'number'), '5 == 5');
      rule(0, 'Back to the top of the list: both sides are numbers now, so compare them strictly.');
      verdict(B(true), "5 === 5 → true. == converted the string for you, which is exactly why '5' == 5 hides type bugs.");
      load(1, T('0', 'number'), T("''", 'string'), '==', "0 == '': a number against an EMPTY string.", 'Will the empty string be equal to 0?');
      rule(2, 'number vs string again: ToNumber the string.');
      apply("ToNumber('') is 0: an empty or whitespace-only string converts to 0, not NaN.", 'right', T('0', 'number'), '0 == 0');
      rule(0, 'Same type now: strict compare.');
      verdict(B(true), "0 === 0 → true, so an empty field and the number 0 look \"equal\" to ==.");
      load(2, T('[]', 'object'), T('false', 'boolean'), '==', '[] == false: an empty array against false. Remember Boolean([]) is true: arrays are truthy.', 'Is [] == false true or false?');
      rule(3, 'No same-type, null or number/string rule applies; a boolean side matches rule 4: ToNumber(false).');
      apply('ToNumber(false) is 0. Now [] == 0.', 'right', T('0', 'number'), '[] == 0');
      rule(4, 'Object vs number: convert the object with ToPrimitive (hint "default" → try valueOf(), then toString()).');
      apply('[].valueOf() returns the array itself, still an object, so ToPrimitive moves on to toString().', 'left', T('[]', 'object'));
      apply("[].toString() joins zero elements: ''. Now '' == 0.", 'left', T("''", 'string'), "'' == 0", "'' == 0 next. What happens to the empty string?");
      rule(2, 'number vs string: ToNumber the string.');
      apply("ToNumber('') is 0. Now 0 == 0.", 'left', T('0', 'number'), '0 == 0');
      rule(0, 'Same type: strict compare.');
      verdict(B(true), '0 === 0 → true. So [] == false is true even though if ([]) runs: == never asks about truthiness.');
    } else {
      load(0, T("'5'", 'string'), T('5', 'number'), '===', "'5' === 5: the same values, compared strictly.", 'Will === convert the string?');
      rule(0, "Type check first: string vs number. They differ, so the algorithm stops here.");
      verdict(B(false), "false, with no conversion. (== would have said true.) This is why badge text '2' === 2 fails an assertion.");
      load(1, T('0', 'number'), T("''", 'string'), '===', "0 === '': number vs string.");
      rule(0, 'Types differ → false straight away.');
      verdict(B(false), 'false. (== would say true because ToNumber(\'\') is 0.)');
      load(2, T('[]', 'object'), T('false', 'boolean'), '===', '[] === false: object vs boolean.', 'How many conversions happen this time?');
      rule(0, 'Types differ (object vs boolean): no ToPrimitive, no ToNumber.');
      verdict(B(false), 'false after zero conversions. (== needed four conversion steps and ended up true.)');
    }
    st = { expr: -1, op, rule: -1, skipped: [], trace: ["Number('5') === 5", 'true'] };
    snap("The safe habit: convert explicitly, then compare strictly. Number('5') === 5 is true and nobody has to remember the rule list.");
    st = { expr: -1, op, rule: -1, skipped: [], trace: ["'2' === '2'", 'true'] };
    snap("Or compare like with like: text from the page against expected text. In Playwright, await expect(badge).toHaveText('2') compares strings and retries.");
  }

  if (group === 'special') {
    if (op === '==') {
      load(0, T('null', 'null'), T('undefined', 'undefined'), '==', 'null == undefined: two "no value" values of different types.', 'No rule converts null into undefined. True or false?');
      rule(1, 'Rule 2 is a hard-coded special case: null and undefined are loosely equal to each other.');
      verdict(B(true), 'true, with no conversion. That is why x == null is the one accepted use of ==: it matches null OR undefined.');
      load(1, T('null', 'null'), T('0', 'number'), '==', 'null == 0. Careful: null >= 0 is true, because relational operators DO convert null to 0.', 'So is null == 0 true?');
      rule(5, 'Not the same type; the null rule needs undefined on the other side; and null is not a string, boolean or object, so no conversion rule applies.');
      verdict(B(false), 'false. == never converts null or undefined: they equal each other and nothing else.');
      load(2, T('NaN', 'number'), T('NaN', 'number'), '==', 'NaN == NaN: both sides are the number NaN ("not a number", e.g. Number(\'abc\')).', 'Same type, same value… equal?');
      rule(0, 'Same type, so == hands over to the strict comparison.');
      apply('IsStrictlyEqual: if either number is NaN the answer is false. NaN is not equal to anything, itself included.', 'both', [T('NaN', 'number'), T('NaN', 'number')]);
      verdict(B(false), 'false. Test for it with Number.isNaN(x) (or Object.is(x, NaN)), never x === NaN.');
    } else {
      load(0, T('null', 'null'), T('undefined', 'undefined'), '===', 'null === undefined. (typeof null says "object", a historic bug, but the spec type is Null.)', 'Does the special null/undefined rule apply to ===?');
      rule(0, 'Type check: Null vs Undefined. Different types → false.');
      verdict(B(false), 'false. The null/undefined special case exists only in ==.');
      load(1, T('null', 'null'), T('0', 'number'), '===', 'null === 0: Null vs Number.');
      rule(0, 'Types differ → false.');
      verdict(B(false), 'false, same as with ==, but for a simpler reason.');
      load(2, T('NaN', 'number'), T('NaN', 'number'), '===', 'NaN === NaN: both are numbers.', 'Same type passes the first check. Is NaN === NaN true?');
      rule(0, 'Type check passes: both are Number, so keep going.');
      rule(1, 'Number comparison: either side NaN → false.');
      verdict(B(false), 'false. NaN is the only value not equal to itself, so use Number.isNaN(x).');
    }
    st = { expr: -1, op, rule: -1, skipped: [], trace: ['x == null', 'Number.isNaN(x)'] };
    snap('Two idioms worth knowing: x == null (null OR undefined in one check) and Number.isNaN(x) (the only reliable NaN test).');
  }

  if (group === 'plus') {
    load(0, T("'1'", 'string'), T('2', 'number'), '+', "'1' + 2 - 1: + and - have the same precedence and run left to right, so first '1' + 2.", 'Will the result be 2, \'11\' or 11?');
    rule(0, '+ with a string on either side means string concatenation: ToString the other side.');
    apply("ToString(2) is '2', and '1' + '2' is '12'.", 'right', T("'2'", 'string'), "'12' - 1");
    st.left = T("'12'", 'string', true);
    st.right = T('1', 'number');
    st.op = '-';
    rule(2, "Now '12' - 1. Minus has no string meaning, so BOTH sides go through ToNumber.");
    apply("ToNumber('12') is 12, so 12 - 1 is 11.", 'left', T('12', 'number'), '11');
    verdict(T('11', 'number'), "11 (a number). The string became a number again; '1' + 2 + 1 would give '121' instead.");

    load(1, T("'b'", 'string'), T("'a'", 'string'), '+', "'b' + 'a' + +'a' + 'a' parses as (('b' + 'a') + (+'a')) + 'a'. The middle +'a' is UNARY plus.", 'What does it evaluate to?');
    rule(0, "'b' + 'a': both strings, so join them.");
    apply("'ba'.", 'left', T("'ba'", 'string'), "'ba' + +'a' + 'a'");
    st.left = undefined;
    st.right = T("'a'", 'string');
    st.op = '+ (unary)';
    rule(2, "Unary +'a' converts its operand with ToNumber.", "What is ToNumber('a')?");
    st.rule = 3;
    apply("'a' is not numeric text, so ToNumber('a') is NaN.", 'right', T('NaN', 'number'), "'ba' + NaN + 'a'");
    st.left = T("'ba'", 'string');
    st.right = T('NaN', 'number');
    st.op = '+';
    rule(0, "'ba' + NaN: a string side, so ToString(NaN), which is 'NaN'.");
    apply("'ba' + 'NaN' is 'baNaN'.", 'both', [T("'baNaN'", 'string'), T("'a'", 'string')], "'baNaN' + 'a'");
    rule(0, 'Last step: two strings, join them.');
    verdict(T("'baNaNa'", 'string'), "'baNaNa'. Add .toLowerCase() and you get the famous 'banana'.");
    st = { expr: -1, op: '+', rule: -1, skipped: [], trace: ["Number('1') + 2 - 1", '2'] };
    snap("Text read from the page is always a string: convert with Number() before doing maths, otherwise + quietly concatenates.");
  }

  return frames;
}
