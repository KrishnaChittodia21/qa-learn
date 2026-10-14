// Pure simulation of Array.prototype methods, one callback call per step.
// Results are computed with the real JS operations (Number(), +, String comparison) so the
// captions show exactly what the engine produces, floating-point noise included.
// Sort is shown as insertion sort (V8's TimSort uses binary insertion sort for short runs);
// the comparison ORDER differs from V8 but the result is the same for any consistent comparator.
import type { BaseFrame } from '../../core';

export type Method = 'map' | 'filter' | 'reduce' | 'find' | 'some' | 'every' | 'sort';
export type Preset = 'numbers' | 'prices';

export interface Params {
  method: Method;
  preset: Preset;
  threshold: number;
  /** sort only: pass a numeric comparator */
  comparator: boolean;
}

export const DEFAULT_PARAMS: Params = { method: 'map', preset: 'numbers', threshold: 5, comparator: false };

type V = number | string;
export const INPUT: Record<Preset, V[]> = {
  numbers: [10, 9, 1, 2, 25, 3],
  // SauceDemo inventory prices in the default (Name A to Z) order
  prices: ['$29.99', '$9.99', '$15.99', '$49.99', '$7.99', '$15.99'],
};

export type ItemState = 'idle' | 'active' | 'kept' | 'dropped' | 'skipped' | 'hit' | 'done';

export interface Item {
  id: number;
  label: string;
  /** current position in the input row (changes only for sort) */
  slot: number;
  state: ItemState;
}

export interface Out {
  /** id of the input item that produced it */
  from: number;
  label: string;
  slot: number;
}

export interface ArrFrame extends BaseFrame {
  items: Item[];
  out: Out[];
  /** reduce accumulator (as printed by JS) */
  acc?: string;
  /** reduce: ids already poured into the accumulator */
  poured: number[];
  /** the callback call of this step, e.g. "(acc = 10, x = 9, i = 1) → 19" */
  call: string;
  /** final return value once known */
  result?: string;
  calls: number;
  /** sort: the pair being compared */
  pair?: [number, number];
}

const num = (v: V) => (typeof v === 'number' ? v : Number(v.slice(1)));
const show = (v: V) => (typeof v === 'string' ? `'${v}'` : String(v));
const arr = (vs: V[]) => `[${vs.map(show).join(', ')}]`;

export function code(p: Params): string {
  const n = p.preset === 'numbers';
  const x = n ? 'x' : 'p';
  const val = n ? 'x' : 'Number(p.slice(1))';
  const pred = `${x} => ${val} > ${p.threshold}`;
  switch (p.method) {
    case 'map':
      return n ? 'nums.map(x => x * 2)' : 'prices.map(p => Number(p.slice(1)))';
    case 'filter':
      return `${n ? 'nums' : 'prices'}.filter(${pred})`;
    case 'reduce':
      return `${n ? 'nums' : 'prices'}.reduce((acc, ${x}) => acc + ${val}, 0)`;
    case 'find':
    case 'some':
    case 'every':
      return `${n ? 'nums' : 'prices'}.${p.method}(${pred})`;
    case 'sort':
      return p.comparator
        ? `${n ? 'nums' : 'prices'}.sort((a, b) => ${n ? 'a - b' : 'Number(a.slice(1)) - Number(b.slice(1))'})`
        : `${n ? 'nums' : 'prices'}.sort()`;
  }
}

export function simulate(p: Params): ArrFrame[] {
  const input = INPUT[p.preset];
  const t = p.threshold;
  const items: Item[] = input.map((v, i) => ({ id: i, label: String(v), slot: i, state: 'idle' }));
  const out: Out[] = [];
  const poured: number[] = [];
  const frames: ArrFrame[] = [];
  let calls = 0;
  let acc: number | undefined;
  let result: string | undefined;
  const set = (id: number, s: ItemState) => (items[id].state = s);
  const push = (caption: string, call = '', predict?: string, pair?: [number, number]) =>
    frames.push({
      items: items.map((x) => ({ ...x })),
      out: out.map((o) => ({ ...o })),
      acc: acc === undefined ? undefined : String(acc),
      poured: [...poured],
      call,
      result,
      calls,
      caption,
      predict,
      pair,
    });
  const c = code(p);
  const pred = (v: V) => num(v) > t;

  if (p.method === 'map' || p.method === 'filter' || p.method === 'reduce') {
    const intro: Record<string, [string, string]> = {
      map: [`${c}: map calls the callback once per item and collects every return value into a NEW array of the same length.`, 'Will the original array change after map?'],
      filter: [`${c}: filter calls the predicate once per item and keeps the items for which it returns a truthy value.`, `How many of ${arr(input)} will survive?`],
      reduce: [`${c}: reduce threads an accumulator through every call; the initial value 0 is the first acc.`, 'What is acc after the first call?'],
    };
    if (p.method === 'reduce') acc = 0;
    push(intro[p.method][0], '', intro[p.method][1]);
    let firstDrop = true;
    input.forEach((v, i) => {
      set(i, 'active');
      calls++;
      if (p.method === 'map') {
        const r = typeof v === 'number' ? v * 2 : num(v);
        push(`Call ${calls}: callback(${show(v)}, ${i}) returns ${r}${typeof v === 'string' ? ' (a number now, no $ and no quotes)' : ''}.`, `(x = ${show(v)}, i = ${i}) → ${r}`, i === input.length - 1 ? 'What is the complete result array?' : undefined);
        out.push({ from: i, label: String(r), slot: i });
        set(i, 'done');
        push(`${r} lands at index ${i} of the new array. The original ${show(v)} is untouched.`, `(x = ${show(v)}, i = ${i}) → ${r}`);
      } else if (p.method === 'filter') {
        const keep = pred(v);
        const ask = (!keep && firstDrop) || (firstDrop && i === input.length - 1);
        if (!keep) firstDrop = false;
        push(`Call ${calls}: is ${show(v)}${typeof v === 'string' ? ` (→ ${num(v)})` : ''} > ${t}? ${keep ? 'true' : 'false'}.`, `(x = ${show(v)}, i = ${i}) → ${keep}`, ask ? (keep ? `Last item and nothing dropped so far. What length will the result have?` : `The predicate returned false. Is ${show(v)} copied into the result?`) : undefined);
        if (keep) out.push({ from: i, label: String(v), slot: out.length });
        set(i, keep ? 'kept' : 'dropped');
        push(keep ? `Kept: ${show(v)} is copied (same value) to result[${out.length - 1}].` : `Dropped: ${show(v)} is skipped; the result has no hole, later items close up.`, `(x = ${show(v)}, i = ${i}) → ${keep}`);
      } else {
        const before = acc!;
        const next = before + num(v);
        const noisy = String(next).length > 10;
        push(
          `Call ${calls}: callback(acc = ${before}, x = ${show(v)}, i = ${i}) returns ${before} + ${num(v)}.`,
          `(acc = ${before}, x = ${show(v)}, i = ${i}) → ${next}`,
          i === input.length - 1
            ? 'What is the final value reduce returns?'
            : typeof v === 'string' && String(before + num(v)).length > 10
              ? `${before} + ${num(v)}: what will JavaScript print for the new total?`
              : undefined,
        );
        acc = next;
        poured.push(i);
        set(i, 'done');
        push(
          noisy
            ? `acc is now ${next}, not ${next.toFixed(2)}: 0.1-style decimals have no exact binary form. Compare money in cents or with toFixed(2), never with ===.`
            : `acc becomes ${next} and is passed into the next call.`,
          `(acc = ${before}, x = ${show(v)}, i = ${i}) → ${next}`,
        );
      }
    });
    result = p.method === 'reduce' ? String(acc) : arr(out.map((o) => (p.method === 'map' || typeof input[o.from] === 'number' ? Number(o.label) : o.label)));
    push(
      p.method === 'reduce'
        ? `reduce returns ${acc} after ${calls} calls.${p.preset === 'prices' ? ' Assert totals with toBeCloseTo or integer cents; an intermediate sum was 105.96000000000001.' : ''}`
        : `${p.method} returns a new array ${result} (length ${out.length}) after ${calls} calls; the original is unchanged.`,
    );
    return frames;
  }

  if (p.method === 'find' || p.method === 'some' || p.method === 'every') {
    const m = p.method;
    const stopOn = m === 'every' ? false : true;
    const what = m === 'find' ? 'the first item where the predicate is true (or undefined)' : m === 'some' ? 'true as soon as ONE call returns true' : 'false as soon as ONE call returns false';
    push(`${c}: ${m} returns ${what}, then STOPS calling the callback.`);
    push(`Each call receives (x, i, array) and asks: is the value > ${t}?${p.preset === 'prices' ? ' The price strings are converted with Number(p.slice(1)) first.' : ''}`, '', `How many times will the callback be called on ${arr(input)}?`);
    let stopAt = -1;
    for (let i = 0; i < input.length; i++) {
      const v = input[i];
      const r = pred(v);
      set(i, 'active');
      calls++;
      push(`Call ${calls}: is ${show(v)}${typeof v === 'string' ? ` (→ ${num(v)})` : ''} > ${t}? ${r}.`, `(x = ${show(v)}, i = ${i}) → ${r}`);
      if (r === stopOn) {
        set(i, 'hit');
        stopAt = i;
        result = m === 'find' ? show(v) : String(r);
        push(`${r} → ${m} short-circuits and returns ${result}. No more callback calls.`, `(x = ${show(v)}, i = ${i}) → ${r}`, i < input.length - 1 ? `${m} already returned. Will the callback see ${show(input[i + 1])}?` : undefined);
        break;
      }
      set(i, 'done');
      if (i === input.length - 1) {
        result = m === 'find' ? 'undefined' : String(m === 'every');
        push(`No ${stopOn ? 'true' : 'false'} anywhere, so ${m} checks all ${input.length} items and returns ${result}.`, '', undefined);
      } else push(`${r}: keep going to index ${i + 1}.`, `(x = ${show(v)}, i = ${i}) → ${r}`, i === input.length - 2 ? 'Last item next. What will the method return if it does not match?' : undefined);
    }
    if (stopAt >= 0 && stopAt < input.length - 1) {
      for (let i = stopAt + 1; i < input.length; i++) {
        set(i, 'skipped');
        push(`index ${i} (${show(input[i])}) is never passed to the callback. A console.log or a counter inside it would not run; filter(...)${m === 'find' ? '[0]' : '.length'} would still call it here.`, `(x = ${show(input[i])}, i = ${i}) not called`);
      }
    }
    const all = input.filter(pred);
    push(`Compare filter(...): it always makes ${input.length} calls and returns ${arr(all)}${m === 'find' ? '; [0] of that is the same item find returned, at higher cost' : ''}.`);
    const tip = {
      find: "QA use: users.find(u => u.username === 'locked_out_user') picks one test account. No match gives undefined, so assert it exists before using it.",
      some: 'QA use: prices.some(p => p <= 0) flags invalid data and stops at the first bad price.',
      every: 'QA use: expect(prices.every(p => p > 0)).toBe(true) works, but a failure does not say WHICH item; filter out the failures to report them.',
    }[m];
    push(tip);
    push(`${m} returned ${result} after ${calls} of ${input.length} possible calls.${m === 'every' ? ' Note [].every(...) is true (vacuous truth), [].some(...) is false.' : m === 'find' ? ' findIndex would return the index, findLast searches from the end.' : ''}`);
    return frames;
  }

  // sort: insertion sort with the real comparator
  const cmp = p.comparator
    ? (a: V, b: V) => num(a) - num(b)
    : (a: V, b: V) => {
        const sa = String(a);
        const sb = String(b);
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      };
  push(
    p.comparator
      ? `${c}: the comparator returns a negative number if a comes first, positive if b comes first, 0 to keep order.`
      : `${c} with NO comparator converts every item to a string and compares UTF-16 code units, like a dictionary.`,
    '',
    p.comparator ? 'compare(a, b) returns a positive number. Who goes first?' : `What does ${arr(input)}.sort() return?`,
  );
  const order = items.map((x) => x.id);
  let askedSwap = false;
  for (let i = 1; i < order.length; i++) {
    let j = i;
    while (j > 0) {
      const a = items[order[j - 1]];
      const b = items[order[j]];
      const av = input[a.id];
      const bv = input[b.id];
      const r = cmp(av, bv);
      calls++;
      a.state = b.state = 'active';
      const why = p.comparator
        ? `${num(av)} - ${num(bv)} = ${Number((num(av) - num(bv)).toFixed(2))}`
        : `'${av}' vs '${bv}': ${firstDiff(String(av), String(bv))}`;
      const ask = !askedSwap && r > 0;
      if (ask) askedSwap = true;
      if (r > 0) {
        [order[j - 1], order[j]] = [order[j], order[j - 1]];
        order.forEach((id, k) => (items[id].slot = k));
      }
      push(r > 0 ? `compare(${show(av)}, ${show(bv)}): ${why} → positive, so swap.` : `compare(${show(av)}, ${show(bv)}): ${why} → ${r === 0 ? 'zero' : 'negative'}, already in order; this pass stops.`, `compare(a = ${show(av)}, b = ${show(bv)}) → ${r > 0 ? '+' : r < 0 ? '−' : '0'}`, ask ? (p.comparator ? 'Which item will end up last?' : 'These are compared as strings. Which item will end up last?') : undefined, [a.id, b.id]);
      a.state = b.state = 'idle';
      if (r <= 0) break;
      j--;
    }
  }
  items.forEach((x) => (x.state = 'done'));
  const sorted = order.map((id) => input[id]);
  result = arr(sorted);
  push(
    p.comparator
      ? `Sorted numerically: ${result} after ${calls} comparisons.`
      : `Result ${result}: lexicographic, so ${typeof input[0] === 'number' ? '10 sorts before 2 and 25 before 3' : "'$49.99' sorts before '$7.99'"}. Pass a comparator to sort by value.`,
  );
  push('sort() works IN PLACE and returns the same array, so a shared test-data array is now reordered for every later test. Use toSorted() (ES2023) or [...arr].sort() to keep the original.');
  return frames;
}

function firstDiff(a: string, b: string) {
  let k = 0;
  while (k < a.length && k < b.length && a[k] === b[k]) k++;
  if (k === a.length || k === b.length) return `'${a.length <= b.length ? a : b}' is a prefix, shorter first`;
  return `'${a[k]}' ${a[k] < b[k] ? '<' : '>'} '${b[k]}' at position ${k}`;
}

/** the real JS results, for tests */
export function realResult(p: Params): string {
  const input = [...INPUT[p.preset]] as (number | string)[];
  const n = (v: V) => num(v);
  const g = (v: V) => n(v) > p.threshold;
  switch (p.method) {
    case 'map':
      return arr(input.map((v) => (typeof v === 'number' ? v * 2 : n(v))));
    case 'filter':
      return arr(input.filter(g));
    case 'reduce':
      return String(input.reduce((a: number, v) => a + n(v), 0));
    case 'find': {
      const r = input.find(g);
      return r === undefined ? 'undefined' : show(r);
    }
    case 'some':
      return String(input.some(g));
    case 'every':
      return String(input.every(g));
    case 'sort':
      return arr(p.comparator ? input.sort((a, b) => n(a) - n(b)) : input.sort());
  }
}
