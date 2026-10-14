// Pure simulation of decision table testing (ISTQB CTFL v4.0): list the conditions, build the
// full table of 2^n rules row by row (halving pattern), fill in the actions per rule, then
// minimise it: delete infeasible rules and merge rules whose outcome does not depend on a
// condition ("-" = don't care). Each remaining rule is one test case. No React here.
import type { BaseFrame } from '../../core';

export type Scenario = 'login' | 'discount';
export interface Params {
  scenario: Scenario;
  n: number;
}
export const DEFAULT_PARAMS: Params = { scenario: 'login', n: 3 };

export type V = 'T' | 'F' | '-';

interface Spec {
  conditions: string[];
  actions: string[];
  /** action labels for a full rule (null = infeasible) */
  decide: (c: boolean[], n: number) => string[] | null;
  why: (c: boolean[]) => string;
  /** minimised rules per n, listed in the order of the full table */
  min: Record<number, string[]>;
}

export const SPECS: Record<Scenario, Spec> = {
  login: {
    conditions: ['Username registered?', 'Password correct?', 'Account locked?', 'OTP code correct?'],
    actions: ['Open dashboard', '"Invalid credentials"', '"Account locked"', '"Invalid OTP"'],
    decide: (c, n) => {
      const [user, pw, locked, otp] = c;
      if (n >= 3 && !user && locked) return null; // an unregistered user has no account to lock
      if (!user) return ['"Invalid credentials"'];
      if (n >= 3 && locked) return ['"Account locked"'];
      if (!pw) return ['"Invalid credentials"'];
      if (n >= 4 && !otp) return ['"Invalid OTP"'];
      return ['Open dashboard'];
    },
    why: () => 'an unregistered username has no account, so it cannot be locked',
    min: {
      2: ['TT', 'TF', 'F-'],
      3: ['T-T', 'TTF', 'TFF', 'F-F'],
      4: ['T-T-', 'TTFT', 'TTFF', 'TFF-', 'F-F-'],
    },
  },
  discount: {
    conditions: ['Loyalty member?', 'Order ≥ ₹1000?', 'Coupon entered?', 'First order?'],
    actions: ['10% member off', '15% coupon off', '20% welcome off', 'Free shipping'],
    decide: (c, n) => {
      const [member, big, coupon, first] = c;
      if (n >= 4 && member && first) return null; // membership needs a previous order
      const out: string[] = [];
      if (n >= 4 && first) out.push('20% welcome off');
      else if (n >= 3 && coupon) out.push('15% coupon off');
      else if (member) out.push('10% member off');
      if (big) out.push('Free shipping');
      return out;
    },
    why: () => 'loyalty membership requires a previous order, so a member cannot be on a first order',
    min: {
      2: ['TT', 'TF', 'FT', 'FF'],
      3: ['-TT', '-FT', 'TTF', 'TFF', 'FTF', 'FFF'],
      4: ['-TTF', '-FTF', 'TTFF', 'TFFF', 'FTFF', 'FFFF', 'FT-T', 'FF-T'],
    },
  },
};

export interface Col {
  /** stable id = index in the full table */
  id: number;
  vals: V[];
  /** actions; null until filled */
  acts: string[] | null;
  state: 'normal' | 'infeasible' | 'merging' | 'gone';
}

export interface Frame extends BaseFrame {
  conditions: string[];
  actions: string[];
  /** condition rows revealed (row-by-row fill) */
  rowsFilled: number;
  cols: Col[];
  /** column ids highlighted this frame */
  hi: number[];
  phase: 'setup' | 'fill' | 'actions' | 'infeasible' | 'merge' | 'final';
}

const fullCols = (n: number): boolean[][] =>
  Array.from({ length: 2 ** n }, (_, k) => Array.from({ length: n }, (_, r) => ((k >> (n - 1 - r)) & 1) === 0));

const tf = (b: boolean): V => (b ? 'T' : 'F');

/** does pattern p (with '-') cover the full rule c? */
export const covers = (p: string, c: boolean[]) => [...p].every((ch, i) => ch === '-' || ch === tf(c[i]));

export function simulate({ scenario, n }: Params): Frame[] {
  n = Math.min(4, Math.max(2, n));
  const spec = SPECS[scenario];
  const conditions = spec.conditions.slice(0, n);
  const full = fullCols(n);
  const actsFor = (c: boolean[]) => spec.decide(c, n);
  const actions = spec.actions.filter((a) => full.some((c) => actsFor(c)?.includes(a)));
  const frames: Frame[] = [];
  let cols: Col[] = full.map((_, id) => ({ id, vals: Array(n).fill('-'), acts: null, state: 'normal' }));
  let rowsFilled = 0;
  const push = (phase: Frame['phase'], caption: string, hi: number[] = [], predict?: string) =>
    frames.push({ conditions, actions, rowsFilled, cols: cols.map((c) => ({ ...c, vals: [...c.vals] })), hi, phase, caption, predict });

  push('setup', `${n} binary conditions: ${conditions.join(' · ')}. Each combination of T/F values is one rule (a column of the table).`, [],
    'How many rules (columns) does the full table need?');

  for (let r = 0; r < n; r++) {
    rowsFilled = r + 1;
    cols = cols.map((c, k) => ({ ...c, vals: c.vals.map((v, i) => (i === r ? tf(full[k][r]) : v)) }));
    const block = 2 ** (n - 1 - r);
    push('fill', `${r === 0 ? `2^${n} = ${2 ** n} rules. ` : ''}Row ${r + 1} "${conditions[r]}": ${block === 1 ? 'alternate T, F' : `blocks of ${block} T then ${block} F`}. Halving the block each row guarantees every combination appears exactly once.`);
  }

  push('actions', `Now the action rows. For each rule, the specification (the test oracle) says what the system must do; mark the actions that apply.`);
  // actions, one rule per frame
  const infeasibleIds = full.map((c, id) => (actsFor(c) === null ? id : -1)).filter((id) => id >= 0);
  full.forEach((c, id) => {
    const a = actsFor(c);
    cols = cols.map((col) => (col.id === id ? { ...col, acts: a ?? [], state: a === null ? 'infeasible' : 'normal' } : col));
    const label = c.map(tf).join('');
    const predict =
      id === 0 && n >= 3
        ? `Before reading on: in which rules does at least one condition stop mattering?`
        : undefined;
    push('actions', a === null ? `Rule ${id + 1} (${label}): cannot happen, ${spec.why(c)}. Marked infeasible.` : `Rule ${id + 1} (${label}) → ${a.length ? a.join(' + ') : 'no discount, no free shipping'}.`, [id], predict);
  });

  // infeasible
  if (infeasibleIds.length) {
    cols = cols.map((c) => (infeasibleIds.includes(c.id) ? { ...c, state: 'gone' } : c));
    push('infeasible', `Minimise step 1: delete the ${infeasibleIds.length} infeasible rules (${infeasibleIds.map((i) => i + 1).join(', ')}): no test can ever produce them.`, infeasibleIds);
  } else {
    push('infeasible', 'Minimise step 1: look for infeasible rules (combinations that cannot occur). None here: every combination is possible.', [], undefined);
  }

  // merges, from the hand-checked minimised rules
  const mins = spec.min[n];
  const merged = mins.filter((p) => p.includes('-'));
  const before = frames.length;
  frames[before - 1].predict = merged.length
    ? `Look at rules with identical actions that differ in only one condition. Which can be merged into one rule with "-"?`
    : 'Can any two rules with the same actions be merged here?';
  for (const p of merged) {
    const ids = full.map((c, id) => (actsFor(c) !== null && covers(p, c) ? id : -1)).filter((id) => id >= 0);
    const keep = ids[0];
    const dc = [...p].map((ch, i) => (ch === '-' ? conditions[i] : null)).filter(Boolean);
    cols = cols.map((c) => (c.id === keep ? { ...c, state: 'merging' } : ids.includes(c.id) ? { ...c, state: 'merging' } : c));
    push('merge', `Rules ${ids.map((i) => i + 1).join(', ')} all give ${actsFor(full[keep])!.join(' + ') || 'nothing'}: "${dc.join('", "')}" does not change the outcome.`, ids);
    cols = cols.map((c) => (c.id === keep ? { ...c, vals: [...p] as V[], state: 'normal' } : ids.includes(c.id) ? { ...c, state: 'gone' } : c));
    push('merge', `Merged into one rule ${p.split('').join(' ')} ("-" = don't care). ${ids.length - 1} test case${ids.length > 2 ? 's' : ''} saved.`, [keep]);
  }
  if (!merged.length) push('merge', 'Nothing merges: each condition changes the outcome in every rule, so all rules stay.');

  const left = cols.filter((c) => c.state !== 'gone').length;
  push('final', `Minimised table: ${left} rules = ${left} test cases (vs ${2 ** n} in the full table). Full decision-table coverage = every feasible column exercised by at least one test.`);
  const ex = cols.find((c) => c.state !== 'gone' && c.vals.includes('-')) ?? cols.find((c) => c.state !== 'gone')!;
  const desc = ex.vals.map((v, i) => (v === '-' ? `${conditions[i].replace('?', '')} = any` : `${conditions[i].replace('?', '')} = ${v === 'T' ? 'yes' : 'no'}`)).join(', ');
  push('final', `Each remaining column is one test case with concrete data. E.g. ${desc} → expect ${ex.acts?.join(' + ') || 'no discount, no free shipping'}.`, [ex.id]);
  return frames;
}
