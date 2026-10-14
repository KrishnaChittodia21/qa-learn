// Pure simulation of next-token generation. An LLM produces text one token at a time: it assigns a
// probability to every token in its vocabulary, then picks one. Temperature 0 = always the most likely
// token (greedy, repeatable); higher temperature flattens the distribution (p^(1/T), renormalised) so a
// less likely token is sometimes sampled. The model has no API lookup: it continues with what LOOKS likely,
// so a gap in its training data gives a fluent, confident, wrong answer. A chat app that exceeds the context
// window drops (or summarises) the oldest messages, which the model then never sees.
// All probabilities below are ILLUSTRATIVE, hand-written for teaching, not taken from a real model.
// Tokens are simplified: real tokenizers split code into smaller pieces.
import { rng, type BaseFrame } from '../../core';

export type Scenario = 'normal' | 'gap' | 'context';
export interface Params {
  scenario: Scenario;
  temp: number;
  seed: number;
}
export interface Cand {
  label: string;
  text: string;
  /** illustrative base probability */
  p: number;
}
export interface ShownCand extends Cand {
  /** probability actually sampled from at this temperature (renormalised over the shown candidates) */
  q: number;
}
export type Tone = 'good' | 'warn' | 'bad';
export interface Check {
  text: string;
  tone: Tone;
}
export interface CtxBlock {
  id: string;
  label: string;
  tokens: number;
  dropped: boolean;
  rule?: boolean;
}
export interface Frame extends BaseFrame {
  phase: 'intro' | 'context' | 'gen' | 'verify' | 'done';
  out: string[];
  step: number;
  stepName: string;
  cands: ShownCand[];
  chosen: number;
  ctx: CtxBlock[];
  checks: Check[];
}

export const PROMPT = 'Write a Playwright assertion that the cart badge shows 2';
export const CAPACITY = 4000;

const STEP_NAMES = ['how the line starts', 'the page object', 'the locator method', 'the locator argument', 'the matcher', 'the expected value'];

function candidates(step: number, prev: string[], sc: Scenario): Cand[] {
  switch (step) {
    case 0:
      return [
        { label: 'await expect(', text: 'await expect(', p: 0.84 },
        { label: 'expect(', text: 'expect(', p: 0.11 },
        { label: 'await expect.soft(', text: 'await expect.soft(', p: 0.03 },
      ];
    case 1:
      return [
        { label: 'page', text: 'page', p: 0.9 },
        { label: 'cartPage', text: 'cartPage', p: 0.05 },
        { label: 'this.page', text: 'this.page', p: 0.03 },
      ];
    case 2:
      return sc === 'context'
        ? [
            { label: '.locator(', text: '.locator(', p: 0.52 },
            { label: '.getByTestId(', text: '.getByTestId(', p: 0.31 },
            { label: '.getByRole(', text: '.getByRole(', p: 0.1 },
          ]
        : [
            { label: '.getByTestId(', text: '.getByTestId(', p: 0.58 },
            { label: '.locator(', text: '.locator(', p: 0.27 },
            { label: '.getByRole(', text: '.getByRole(', p: 0.09 },
          ];
    case 3: {
      const m = prev[2];
      const args: [string, number][] =
        m === '.getByTestId('
          ? [["'cart-badge'", 0.71], ["'cart-count'", 0.16], ["'badge'", 0.06]]
          : m === '.locator('
            ? [["'.cart-badge'", 0.63], ["'#cart-count'", 0.21], ["'span.badge'", 0.09]]
            : [["'status'", 0.51], ["'link', { name: 'Cart' }", 0.27], ["'button', { name: 'Cart' }", 0.12]];
      return args.map(([a, p]) => ({ label: a, text: `${a})`, p }));
    }
    case 4: {
      const ms: [string, number][] =
        sc === 'gap'
          ? [['toHaveBadgeCount(', 0.46], ['toHaveText(', 0.29], ['toContainText(', 0.13], ['toHaveCount(', 0.08]]
          : [['toHaveText(', 0.62], ['toContainText(', 0.19], ['toHaveCount(', 0.11], ['toHaveValue(', 0.04]];
      return ms.map(([l, p]) => ({ label: l, text: `).${l}`, p }));
    }
    default: {
      const m = prev[4];
      const vs: [string, number][] =
        m === 'toHaveText('
          ? [["'2'", 0.81], ['2', 0.09], ['/^2$/', 0.05]]
          : m === 'toContainText('
            ? [["'2'", 0.88], ['2', 0.06]]
            : m === 'toHaveValue('
              ? [["'2'", 0.85], ['2', 0.08]]
              : [['2', 0.9], ["'2'", 0.06]];
      return vs.map(([v, p]) => ({ label: v, text: `${v});`, p }));
    }
  }
}

/** temperature-adjusted distribution over the shown candidates */
export function applyTemp(c: Cand[], T: number): ShownCand[] {
  if (T <= 0) {
    const best = c.reduce((b, x, i) => (x.p > c[b].p ? i : b), 0);
    return c.map((x, i) => ({ ...x, q: i === best ? 1 : 0 }));
  }
  const w = c.map((x) => Math.pow(x.p, 1 / T));
  const s = w.reduce((a, b) => a + b, 0);
  return c.map((x, i) => ({ ...x, q: w[i] / s }));
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

function verify(pick: string[], sc: Scenario): Check[] {
  const [start, subj, loc, arg, matcher, val] = pick;
  const out: Check[] = [];
  out.push(
    start === 'await expect('
      ? { text: 'await expect(...): awaited, auto-retrying web-first assertion', tone: 'good' }
      : start === 'expect('
        ? { text: 'expect(...) not awaited: the test can end before the check settles', tone: 'bad' }
        : { text: 'expect.soft: real API, but the test keeps going after a failure', tone: 'warn' },
  );
  if (subj !== 'page')
    out.push(
      subj === 'cartPage'
        ? { text: 'cartPage is not defined in a plain test: ReferenceError', tone: 'bad' }
        : { text: 'this.page only works inside a page-object class', tone: 'warn' },
    );
  if (loc === '.locator(')
    out.push(
      sc === 'context'
        ? { text: `locator(${arg}): breaks team rule R1 "getByTestId only"; the rule left the context`, tone: 'bad' }
        : { text: `locator(${arg}): CSS selector, works but brittle; prefer test id or role`, tone: 'warn' },
    );
  out.push({ text: `${arg} is a guess: the model never saw your DOM; confirm it exists`, tone: 'warn' });
  const mt: Record<string, Check> = {
    'toHaveText(': { text: 'toHaveText: real LocatorAssertions matcher, right meaning', tone: 'good' },
    'toContainText(': { text: "toContainText: real, but would also pass for '12'", tone: 'warn' },
    'toHaveCount(': { text: 'toHaveCount: real, wrong meaning: counts matching elements', tone: 'bad' },
    'toHaveValue(': { text: 'toHaveValue: real, wrong meaning: for input field values', tone: 'bad' },
    'toHaveBadgeCount(': { text: 'toHaveBadgeCount: not in the Playwright docs; "is not a function"', tone: 'bad' },
  };
  out.push(mt[matcher]);
  const wantsNum = matcher === 'toHaveCount(' || matcher === 'toHaveBadgeCount(';
  if (!wantsNum && val === '2') out.push({ text: `${matcher}2): TypeScript error, expects a string or RegExp`, tone: 'bad' });
  if (matcher === 'toHaveCount(' && val === "'2'") out.push({ text: "toHaveCount('2'): TypeScript error, expects a number", tone: 'bad' });
  return out;
}

export function simulate(p: Params): Frame[] {
  const { scenario: sc, temp } = p;
  const r = rng(p.seed * 7919 + 13);
  const frames: Frame[] = [];
  let s: Omit<Frame, 'caption' | 'predict'> = { phase: 'intro', out: [], step: -1, stepName: '', cands: [], chosen: -1, ctx: [], checks: [] };
  const push = (patch: Partial<Frame>, caption: string, predict?: string) => {
    s = { ...s, ...patch };
    frames.push({ ...s, caption, predict });
  };
  const tempText = temp === 0 ? 'temperature 0 (greedy: always the top token)' : `temperature ${temp.toFixed(1)}`;

  if (sc === 'context') {
    push(
      { ctx: [] },
      `A long chat with an AI assistant. The context window (here an illustrative ${CAPACITY} tokens) is everything the model can see at once: older messages plus the new prompt.`,
    );
    const msgs: CtxBlock[] = [
      { id: 'r1', label: 'R1: use getByTestId only', tokens: 400, dropped: false, rule: true },
      { id: 'm2', label: 'pasted login.spec (CSS)', tokens: 1500, dropped: false },
      { id: 'm3', label: 'AI: refactored login', tokens: 900, dropped: false },
      { id: 'm4', label: 'pasted cart.spec (CSS)', tokens: 1300, dropped: false },
    ];
    const capt = [
      'Message 1 sets a team rule: "use getByTestId locators only". 400 of 4000 tokens used.',
      'Message 2 pastes an old login test full of CSS selectors. 1900 tokens used.',
      "The assistant's refactored login test adds 900 more. 2800 tokens used.",
    ];
    msgs.slice(0, 3).forEach((m, i) => push({ phase: 'context', ctx: [...s.ctx, m] }, capt[i]));
    push(
      { ctx: [...s.ctx, msgs[3]] },
      'Message 4 pastes the old cart test (1300 tokens). Total 4100: over the 4000-token window.',
      'Something has to give. Which message will the model stop seeing?',
    );
    push(
      { ctx: s.ctx.map((b) => (b.id === 'r1' ? { ...b, dropped: true } : b)) },
      'The chat app trims the OLDEST message to fit (apps differ: some summarise; a raw API call over the limit is rejected). R1 is gone, silently.',
    );
    push(
      { ctx: [...s.ctx, { id: 'p', label: 'prompt', tokens: 100, dropped: false }] },
      `The new prompt arrives: "${PROMPT}". The model sees the CSS-heavy history, but not the rule.`,
    );
  } else {
    push(
      { ctx: [{ id: 'p', label: 'prompt', tokens: 100, dropped: false }] },
      `Prompt: "${PROMPT}". The model predicts the answer one token at a time; each pick becomes part of the input for the next. Probabilities shown are illustrative, not from a real model.`,
    );
  }

  const pick: string[] = [];
  for (let step = 0; step < 6; step++) {
    const base = candidates(step, pick, sc);
    const cands = applyTemp(base, temp);
    const x = r();
    let chosen = 0;
    if (temp <= 0) chosen = cands.findIndex((c) => c.q === 1);
    else {
      let acc = 0;
      chosen = cands.length - 1;
      for (let i = 0; i < cands.length; i++) {
        acc += cands[i].q;
        if (x < acc) {
          chosen = i;
          break;
        }
      }
    }
    const top = base.reduce((b, c, i) => (c.p > base[b].p ? i : b), 0);
    let predict: string | undefined;
    let caption = `Next: ${STEP_NAMES[step]}. Top candidate ${base[top].label} at ${pct(base[top].p)} (top ${base.length} of the whole vocabulary shown). Bars = chance of being picked at ${tempText}.`;
    if (step === 0) predict = temp === 0 ? 'Temperature is 0. Which token will be picked, and would a re-roll change it?' : `Temperature is ${temp.toFixed(1)}. Is the top token (${pct(base[top].p)}) guaranteed?`;
    if (step === 2 && sc === 'context') caption = `Next: the locator method. With R1 gone and CSS examples filling the window, .locator( now leads (with R1 in view it would have been .getByTestId().`;
    if (step === 4 && sc === 'gap') {
      caption = 'Next: the matcher. Knowledge gap: few training examples assert a badge. Names like toHaveCount and toHaveClass plus the prompt words "badge" make an invented toHaveBadgeCount( the top candidate.';
      predict = 'The top candidate does not exist in Playwright. Will the output show any sign of doubt?';
    }
    push({ phase: 'gen', step, stepName: STEP_NAMES[step], cands, chosen: -1 }, caption, predict);
    const c = cands[chosen];
    pick.push(c.label);
    let why: string;
    if (temp <= 0) why = `Greedy pick: ${c.label} (${pct(c.p)}), the most likely token. Same prompt, same pick, every time.`;
    else if (chosen === top) why = `Sampled ${c.label}: the top token, chosen with ${pct(c.q)} chance at T=${temp.toFixed(1)} (roll ${x.toFixed(2)}).`;
    else why = `Sampled ${c.label}, NOT the top token: only ${pct(c.p)} base, ${pct(c.q)} at T=${temp.toFixed(1)} (roll ${x.toFixed(2)}). Higher temperature makes such picks more frequent.`;
    if (step === 4 && sc === 'gap' && c.label === 'toHaveBadgeCount(') why = 'toHaveBadgeCount( is appended in the same confident style as every other token. No warning appears: a chat answer does not show how likely each token was, and a 46% token looks as sure as a 99% one.';
    push({ out: [...s.out, c.text], chosen }, why);
  }

  const code = s.out.join('');
  push(
    { phase: 'verify', step: -1, cands: [], chosen: -1 },
    `Done: ${code} It reads like real Playwright code, because fluent-looking text is exactly what the model is trained to produce.`,
    'Will this assertion compile and check the right thing? How would you know?',
  );
  const checks = verify(pick, sc);
  checks.forEach((ck, i) =>
    push(
      { checks: checks.slice(0, i + 1) },
      `Tester check ${i + 1}, against the Playwright docs and the app: ${ck.text}.`,
    ),
  );
  const bad = checks.filter((c) => c.tone === 'bad').length;
  const warn = checks.filter((c) => c.tone === 'warn').length;
  push(
    { phase: 'done' },
    bad
      ? `${bad} blocking problem${bad > 1 ? 's' : ''}, ${warn} to confirm. Fluent ≠ correct: verify APIs against the docs and run the test before trusting it.${temp > 0 ? ' Re-roll to see a different answer from the same prompt.' : ''}`
      : `No blocking problem this time, ${warn} thing${warn === 1 ? '' : 's'} to confirm in the app. Still run it: a guessed test id fails only when executed.${temp > 0 ? ' Re-roll: the same prompt can give a different answer.' : ' Try a higher temperature, then re-roll.'}`,
  );
  return frames;
}
