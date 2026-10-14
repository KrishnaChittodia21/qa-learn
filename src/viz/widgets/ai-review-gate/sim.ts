// Pure simulation of a tester reviewing AI output. An AI draft is a starting point: it tends to cover the
// happy path, can invent requirements or APIs, and copies bad habits seen in its training data (hard waits,
// brittle selectors, missing await, credentials in code). The checklist below is the reviewer's gate.
// The drafts and the escaped bugs are ILLUSTRATIVE examples written for teaching.
import type { BaseFrame } from '../../core';

export type Mode = 'cases' | 'script';
export type Review = 'review' | 'accept';
export interface Params {
  mode: Mode;
  review: Review;
}
export type Tone = 'good' | 'warn' | 'bad';
export interface Line {
  text: string;
  flag?: Tone;
  /** + added by the reviewer, ~ rewritten, ? open question */
  tag?: '+' | '~' | '?';
}
export type CheckState = 'todo' | 'run' | 'flag' | 'ok' | 'skip';
export interface CheckRow {
  label: string;
  state: CheckState;
}
export interface Note {
  text: string;
  tone: Tone;
}
export interface Frame extends BaseFrame {
  phase: 'draft' | 'review' | 'fixed' | 'prod';
  lines: Line[];
  shown: number;
  checks: CheckRow[];
  notes: Note[];
  escapes: string[];
}

export const HEADER: Record<Mode, string> = {
  cases: 'Story: a signed-in shopper pays for the cart with a saved card and sees an order confirmation.',
  script: "Prompt: write a Playwright test for checkout on shop.test.",
};

const DRAFT: Record<Mode, string[]> = {
  cases: [
    'TC1  Pay with a valid saved card → confirmation with order number',
    'TC2  Pay with a newly added valid card → confirmation shown',
    'TC3  Order total = item prices + shipping',
    'TC4  Confirmation email is sent to the shopper',
    'TC5  Check out a cart with 1 item',
    'TC6  Check out a cart with 3 items',
    'TC7  Apply a valid promo code → discount applied',
    'TC8  Product images load on the product page',
  ],
  script: [
    "import { test, expect } from '@playwright/test';",
    "test('checkout', async ({ page }) => {",
    "  await page.goto('https://shop.test/login');",
    "  await page.fill('#email', 'admin@shop.test');",
    "  await page.fill('#password', 'Admin@123');",
    "  page.click('//div[2]/form/button');",
    '  await page.waitForTimeout(5000);',
    "  await page.click('.btn-primary.checkout');",
    "  await page.locator('#pay').click();",
    '  await expect(page).toHaveOrderConfirmed();',
    '});',
  ],
};

interface Item {
  label: string;
  flags: { line: number; tone: Tone; note: string }[];
  /** finding not tied to one line (e.g. something missing) */
  missing?: Note;
  predict?: string;
}
const CHECKLIST: Record<Mode, Item[]> = {
  cases: [
    {
      label: 'Traceable to the story?',
      flags: [
        { line: 3, tone: 'warn', note: 'TC4: email is not in the story. Ask the PO: real requirement or invented?' },
        { line: 7, tone: 'bad', note: 'TC8: product page, not checkout. Out of scope: drop it.' },
      ],
    },
    {
      label: 'Negative cases?',
      flags: [],
      missing: { text: '0 of 8 cases test a failure: no declined card, expired card or empty cart.', tone: 'bad' },
      predict: 'How many of the 8 drafted cases test something going wrong?',
    },
    {
      label: 'Boundaries?',
      flags: [
        { line: 4, tone: 'warn', note: 'TC5/TC6: 1 and 3 items are not boundaries. Where is the max quantity, and max + 1?' },
        { line: 5, tone: 'warn', note: 'TC5/TC6: 1 and 3 items are not boundaries. Where is the max quantity, and max + 1?' },
      ],
    },
    {
      label: 'Permissions / state?',
      flags: [],
      missing: { text: 'No guest user, no double-click on Pay, no session expiring mid-payment.', tone: 'bad' },
    },
    {
      label: 'Non-functional?',
      flags: [],
      missing: { text: 'No security (card masking) or accessibility (keyboard-only checkout) case.', tone: 'warn' },
    },
  ],
  script: [
    { label: 'Hard waits?', flags: [{ line: 6, tone: 'bad', note: 'waitForTimeout(5000): always 5 s slower and still flaky. Wait for a state instead.' }] },
    {
      label: 'Brittle CSS / XPath?',
      flags: [
        { line: 5, tone: 'warn', note: 'Position-based XPath and styling classes break on any layout change. Use roles/labels.' },
        { line: 7, tone: 'warn', note: 'Position-based XPath and styling classes break on any layout change. Use roles/labels.' },
      ],
    },
    {
      label: 'Missing await?',
      flags: [{ line: 5, tone: 'bad', note: 'page.click(...) is not awaited: the next line runs before the click finishes.' }],
      predict: 'Look at line 6 of the draft. What happens when it runs?',
    },
    {
      label: 'Hard-coded credentials?',
      flags: [
        { line: 3, tone: 'bad', note: 'Admin email and password committed to the repo. Read them from env / a secret store.' },
        { line: 4, tone: 'bad', note: 'Admin email and password committed to the repo. Read them from env / a secret store.' },
      ],
    },
    { label: 'Invented API?', flags: [{ line: 9, tone: 'bad', note: 'toHaveOrderConfirmed does not exist in the Playwright docs: "is not a function".' }] },
    {
      label: 'Real assertions?',
      flags: [{ line: 1, tone: 'warn', note: "Only assertion is invented, so nothing checks the outcome. Name 'checkout' says nothing either." }],
    },
  ],
};

const REVIEWED: Record<Mode, Line[]> = {
  cases: [
    { text: 'TC1  Pay with a valid saved card → confirmation with order number' },
    { text: 'TC2  Pay with a newly added valid card → confirmation shown' },
    { text: 'TC3  Order total = item prices + shipping' },
    { text: 'TC4  Email after payment? → question for the PO', tag: '?' },
    { text: 'TC5  Quantity 1, max per item, and max + 1 → limit message', tag: '~' },
    { text: 'TC7  Apply a valid promo code → discount applied' },
    { text: 'N1   Declined card → error shown, no order created', tag: '+' },
    { text: 'N2   Expired saved card → asked to update the card', tag: '+' },
    { text: 'N3   Empty cart → Pay is disabled', tag: '+' },
    { text: 'S1   Guest opens /checkout → redirected to sign in', tag: '+' },
    { text: 'S2   Double-click Pay → exactly one order, one charge', tag: '+' },
    { text: 'S3   Session expires on payment page → no order, clear message', tag: '+' },
    { text: 'NF1  Card number masked: only the last 4 digits shown', tag: '+' },
    { text: 'NF2  Whole checkout works with keyboard and screen reader', tag: '+' },
  ],
  script: [
    { text: "import { test, expect } from '@playwright/test';" },
    { text: "test('signed-in shopper can pay with a saved card', async ({ page }) => {", tag: '~' },
    { text: "  await page.goto('/login'); // baseURL comes from the config", tag: '~' },
    { text: "  await page.getByLabel('Email').fill(process.env.SHOP_USER!);", tag: '~' },
    { text: "  await page.getByLabel('Password').fill(process.env.SHOP_PASS!);", tag: '~' },
    { text: "  await page.getByRole('button', { name: 'Sign in' }).click();", tag: '~' },
    { text: '  await expect(page).toHaveURL(/\\/shop/); // replaces the 5 s sleep', tag: '~' },
    { text: "  await page.getByRole('link', { name: 'Checkout' }).click();", tag: '~' },
    { text: "  await page.getByRole('button', { name: 'Pay now' }).click();", tag: '~' },
    { text: "  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();", tag: '~' },
    { text: '});' },
  ],
};

const ESCAPES: Record<Mode, string[]> = {
  cases: [
    'A declined card still creates an order: no negative test existed.',
    'Double-clicking Pay charges the card twice: state was never tested.',
    'A guest reaches /checkout by URL: permissions were never tested.',
    'The full card number shows on the review page: no security case.',
    'TC8 passed every run, yet it never touched checkout.',
  ],
  script: [
    'CI goes red on every run: toHaveOrderConfirmed is not a function.',
    'To make CI green someone deletes that line: the test now asserts nothing.',
    'Unawaited click + 5 s sleep: green locally, flaky on slower CI machines.',
    'The admin password now sits in git history: a security incident on its own.',
    'A real checkout bug ships; the green test cannot notice it.',
  ],
};

export function simulate(p: Params): Frame[] {
  const { mode, review } = p;
  const draft = DRAFT[mode];
  const items = CHECKLIST[mode];
  const frames: Frame[] = [];
  let s: Omit<Frame, 'caption' | 'predict'> = {
    phase: 'draft',
    lines: draft.map((text) => ({ text })),
    shown: 0,
    checks: items.map((it) => ({ label: it.label, state: 'todo' })),
    notes: [],
    escapes: [],
  };
  const push = (patch: Partial<Frame>, caption: string, predict?: string) => {
    s = { ...s, ...patch };
    frames.push({ ...s, caption, predict });
  };
  const setCheck = (i: number, state: CheckState) => s.checks.map((c, k) => (k === i ? { ...c, state } : c));

  push(
    {},
    mode === 'cases'
      ? 'The tester asks an AI assistant for test cases for this story. The draft streams in within seconds.'
      : 'The tester asks an AI assistant for a Playwright checkout test. The draft streams in within seconds.',
  );
  const batch = mode === 'cases' ? 2 : 4;
  for (let n = batch; n < draft.length + batch; n += batch) {
    const shown = Math.min(n, draft.length);
    const done = shown === draft.length;
    push(
      { shown },
      done
        ? `${draft.length} ${mode === 'cases' ? 'test cases' : 'lines'}, neatly formatted and confident. Looking complete is not the same as being complete.`
        : `Lines ${n - batch + 1}–${shown} arrive: ${mode === 'cases' ? 'clear titles, plausible expectations' : 'it looks like a normal Playwright test'}.`,
      done && review === 'accept' ? 'The draft is accepted without review. What could reach production?' : done && mode === 'script' ? 'Before the checklist runs: how many problems can you spot?' : undefined,
    );
  }

  if (review === 'accept') {
    push(
      { phase: 'prod', checks: s.checks.map((c) => ({ ...c, state: 'skip' })) },
      mode === 'cases' ? 'Accepted as-is: the 8 cases become the regression suite. All 8 pass and the feature ships.' : 'Accepted as-is: the script is merged and runs in CI.',
      mode === 'cases' ? 'Every test is green on release day. Does that mean checkout works?' : undefined,
    );
    if (mode === 'script') push({}, 'First CI run after the merge.', 'Will the suite go green?');
    ESCAPES[mode].forEach((e) => push({ escapes: [...s.escapes, e] }, `Escaped (illustrative): ${e}`));
    push(
      {},
      `${ESCAPES[mode].length} problems got through that one checklist pass would have caught. AI saves typing time, not thinking time: the tester still owns the review.`,
    );
    return frames;
  }

  push({ phase: 'review' }, 'The tester runs the review checklist, one question at a time, against the story and the docs.');
  items.forEach((it, i) => {
    push({ checks: setCheck(i, 'run'), notes: [] }, `Check ${i + 1}/${items.length}: ${it.label} The reviewer scans the whole draft for this one risk.`, it.predict);
    const lines = s.lines.map((l, k) => {
      const f = it.flags.find((x) => x.line === k);
      if (!f) return l;
      const worst = l.flag === 'bad' || f.tone === 'bad' ? 'bad' : 'warn';
      return { ...l, flag: worst as Tone };
    });
    const notes: Note[] = [];
    for (const f of it.flags) if (!notes.some((n) => n.text === f.note)) notes.push({ text: f.note, tone: f.tone });
    if (it.missing) notes.push(it.missing);
    const flagged = it.flags.length > 0 || !!it.missing;
    push(
      { checks: setCheck(i, flagged ? 'flag' : 'ok'), lines, notes },
      it.flags.length ? `${new Set(it.flags.map((f) => f.line)).size} line(s) flagged. ${notes[0].text}` : notes[0] ? `Nothing to flag on a line, because the problem is what is MISSING. ${notes[0].text}` : 'Nothing found.',
    );
  });
  const red = s.lines.filter((l) => l.flag === 'bad').length;
  const amber = s.lines.filter((l) => l.flag === 'warn').length;
  const missing = items.filter((it) => it.missing).length;
  push(
    { notes: [] },
    `Review done: ${red} red and ${amber} amber line(s)${missing ? `, plus ${missing} gap(s) where whole areas are missing` : ''}.`,
    'What will the reviewed version keep, change and add?',
  );
  const rev = REVIEWED[mode];
  push(
    { phase: 'fixed', lines: rev, shown: rev.length, notes: [] },
    mode === 'cases'
      ? 'Reviewed version: TC8 dropped, TC5/TC6 merged into a boundary case, TC4 parked as a PO question, 8 cases added for failures, state and non-functional risks.'
      : 'Reviewed version: awaited role/label locators, credentials from env, the sleep replaced by a state assertion, and a real web-first assertion on the outcome.',
  );
  push(
    {
      notes:
        mode === 'cases'
          ? [{ text: '+ added   ~ rewritten   ? open question. Kept the useful AI work; replaced the guesswork.', tone: 'good' }]
          : [{ text: 'Still to do: run it (twice) and watch it fail when Pay is broken. Better still: sign in once via storageState.', tone: 'warn' }],
    },
    mode === 'cases'
      ? `${rev.filter((l) => l.tag === '+').length} cases added, ${rev.filter((l) => !l.tag).length} kept unchanged. The AI did the typing; the tester supplied the risk thinking.`
      : 'A reviewed script is only trusted after it has run and been seen to fail for the right reason.',
  );
  return frames;
}
