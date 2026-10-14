// Pure simulation of one session in Session-Based Test Management (Jonathan & James Bach, 2000):
// one charter, one uninterrupted timebox, a session sheet with TBS metrics (Test design and
// execution / Bug investigation and reporting / Session setup), charter vs opportunity time,
// notes, bugs and issues, then a PROOF debrief. Steps have fixed durations; whatever does not
// fit in the timebox is not covered and becomes a follow-up charter. No React here.
import type { BaseFrame } from '../../core';

export interface Params {
  /** short (45), normal (90) or long (120) session */
  minutes: 45 | 90 | 120;
  flaky: boolean;
}
export const DEFAULT_PARAMS: Params = { minutes: 90, flaky: false };

export const CHARTER = 'Explore order total recalculation with quantity changes, item removal and re-adding after a coupon to discover double or lost discounts.';

export type Kind = 'T' | 'B' | 'S';
export interface Seg {
  kind: Kind;
  start: number;
  end: number;
  /** opportunity (off-charter but valuable) test time */
  opp: boolean;
}
export type MarkKind = 'note' | 'bug' | 'issue';
export interface Mark {
  at: number;
  kind: MarkKind;
  text: string;
}
export interface Frame extends BaseFrame {
  segs: Seg[];
  marks: Mark[];
  now: number;
  /** charter areas: covered fully, partly, or not reached */
  areas: ('todo' | 'done' | 'partial')[];
  tbs: { T: number; B: number; S: number } | null;
  opp: number | null;
  /** PROOF letters revealed so far, with their text */
  proof: { k: string; text: string }[];
}

export const AREAS = ['baseline totals', 'quantity changes', 'remove + re-add', 'coupon persistence (opportunity)', 'boundary quantities'];

interface Step {
  kind: Kind;
  dur: number;
  opp?: boolean;
  area?: number;
  mark?: { kind: MarkKind; text: string; at: 'start' | 'end' };
  caption: string;
  predict?: string;
}

export function simulate(p: Params): Frame[] {
  const L = p.minutes;
  const flaky = p.flaky;
  const steps: Step[] = [
    {
      kind: 'S',
      dur: flaky ? 10 : 4,
      caption: flaky
        ? 'Setup: the staging login fails twice and test data has to be reloaded before testing can start. Setup time is logged, not hidden.'
        : 'Setup: log in to staging, load coupons_test.csv (SAVE10, EXP2024, FREESHIP). Setup counts as S in the TBS metrics.',
    },
    {
      kind: 'T',
      dur: 20,
      area: 0,
      mark: { kind: 'note', text: 'SAVE10 on 1, 2, 5 items: totals correct', at: 'end' },
      caption: 'Test design and execution: apply SAVE10 to carts of 1, 2 and 5 items and check every total. The test notes record what was covered, not just what failed.',
    },
    {
      kind: 'T',
      dur: 2,
      opp: true,
      mark: { kind: 'note', text: 'Opportunity: gift card in cart? → parked as new charter', at: 'end' },
      caption: 'A side idea appears (does a gift card in the cart change the discount?). A 2-minute look, then it is parked as a new charter instead of a detour.',
    },
    {
      kind: 'T',
      dur: 12,
      area: 1,
      mark: { kind: 'note', text: 'qty 2 → 0 → 2 via stepper: discount kept', at: 'end' },
      caption: 'Quantity changes with the coupon applied: 2 → 0 → 2 via the stepper. The discount is kept and the total is right.',
    },
    {
      kind: 'S',
      dur: flaky ? 15 : 5,
      mark: { kind: 'issue', text: flaky ? 'Staging tax service down 15 min' : 'Tax service slow; restarted', at: 'start' },
      caption: flaky
        ? 'The staging tax service goes down for 15 minutes. Waiting and re-checking the environment is Setup time, and it is logged as an issue.'
        : 'A short environment hiccup: the tax service is slow and is restarted. Logged under issues; the minutes go to Setup.',
    },
    {
      kind: 'T',
      dur: 4,
      area: 2,
      mark: { kind: 'note', text: 'Remove item, re-add: discount applied TWICE', at: 'end' },
      caption: 'Remove an item, re-add it from the inventory, check the total… the 10% discount is applied twice!',
      predict: 'You just saw a double discount. Does the time you now spend reproducing it and writing the report count as Test time?',
    },
    {
      kind: 'B',
      dur: 27,
      mark: { kind: 'bug', text: 'BUG-812 Discount applied twice after remove + re-add (High)', at: 'end' },
      caption: 'Bug investigation and reporting: reproduce it three times, isolate the trigger (re-add after removal), capture the request, write BUG-812. This is B time, not T.',
    },
    {
      kind: 'T',
      dur: 16,
      opp: true,
      area: 3,
      mark: { kind: 'issue', text: 'Should a coupon persist across logins? Ask PO', at: 'end' },
      caption: 'Opportunity testing: does the coupon survive logout and login? It does. Is that by design? Logged as a question for the PO.',
    },
    {
      kind: 'T',
      dur: 60,
      area: 4,
      mark: { kind: 'note', text: 'qty 0, 1, 99 with coupon: totals correct', at: 'end' },
      caption: 'Back on charter with the extra time: boundary quantities (0, 1, max 99) with the coupon applied. Totals are correct.',
    },
  ];

  const frames: Frame[] = [];
  const segs: Seg[] = [];
  const marks: Mark[] = [];
  const areas: Frame['areas'] = AREAS.map(() => 'todo');
  let now = 0;
  let bugDone = false;
  const push = (caption: string, extra: Partial<Frame> = {}, predict?: string) =>
    frames.push({ caption, predict, segs: segs.map((s) => ({ ...s })), marks: [...marks], now, areas: [...areas], tbs: null, opp: null, proof: [], ...extra });

  push(`One session = one charter, one uninterrupted ${L}-minute timebox (${L === 45 ? 'short' : L === 90 ? 'normal' : 'long'} in Bach's terms), one session sheet, one debrief. Charter: "${CHARTER}"`);

  for (const st of steps) {
    if (now >= L) break;
    const end = Math.min(L, now + st.dur);
    const cut = end - now < st.dur;
    segs.push({ kind: st.kind, start: now, end, opp: !!st.opp });
    if (st.mark && (!cut || st.mark.at === 'start')) marks.push({ at: st.mark.at === 'start' ? now : end, kind: st.mark.kind, text: st.mark.text });
    if (st.area !== undefined) areas[st.area] = cut ? 'partial' : 'done';
    if (st.kind === 'B') bugDone = !cut;
    if (st.kind === 'B' && cut) marks.push({ at: end, kind: 'bug', text: 'BUG-812 logged as a draft (report unfinished)' });
    now = end;
    const isLastArea = st.area === 4;
    if (cut && st.area === 2) {
      push(`Remove an item, re-add it… and the ${L}-minute timebox ends before the total is even checked. The double-discount bug stays hidden this session.`);
    } else {
      push((isLastArea ? 'Only a long session reaches this. ' : '') + st.caption + (cut ? ` The timebox ends at ${L} min, cutting this short.` : ''), {}, st.predict);
    }
  }

  const sum = (k: Kind) => segs.filter((s) => s.kind === k).reduce((a, s) => a + s.end - s.start, 0);
  const pct = (m: number) => Math.round((m / L) * 100);
  const tbs = { T: pct(sum('T')), B: pct(sum('B')), S: 0 };
  tbs.S = 100 - tbs.T - tbs.B;
  const oppMin = segs.filter((s) => s.opp).reduce((a, s) => a + s.end - s.start, 0);
  const opp = pct(oppMin);
  const notReached = AREAS.filter((_, k) => k < 4 && areas[k] !== 'done');

  push(`Time is up at ${L} min. The session sheet now holds ${marks.filter((m) => m.kind === 'note').length} test notes, ${marks.filter((m) => m.kind === 'bug').length} bug and ${marks.filter((m) => m.kind === 'issue').length} issue${marks.filter((m) => m.kind === 'issue').length === 1 ? '' : 's'}.`, {}, 'Before the numbers appear: which TBS bucket do you expect to be the biggest, and what would a high Setup % tell the lead?');
  push(
    `TBS metrics: Test ${tbs.T}% | Bug ${tbs.B}% | Setup ${tbs.S}%. ${tbs.S > 20 ? 'High Setup % means the environment is hurting testing: raise it as a project risk.' : 'Setup is low, so the environment is not the bottleneck.'} ${tbs.B >= 25 ? 'High Bug % says this area is buggy: schedule more sessions here.' : ''}`,
    { tbs },
  );
  push(`Charter vs opportunity: ${100 - opp} / ${opp}. Opportunity time is not waste${marks.some((m) => m.text.includes('PO')) ? ': it raised a question for the PO' : ': it parked a new charter idea'}. A very low on-charter % would mean the charter was wrong or the product surprised you.`, { tbs, opp });

  const proof: { k: string; text: string }[] = [];
  const P = [
    { k: 'Past', text: `${L} min on order totals with coupons; ${AREAS.filter((_, k) => areas[k] === 'done').length} charter areas covered.`, cap: 'Debrief with the lead, PROOF. Past: what happened in the session.' },
    {
      k: 'Results',
      text: marks.some((m) => m.kind === 'bug') ? (bugDone ? 'BUG-812 (High): double discount after remove + re-add.' : 'BUG-812 seen, report still a draft.') : 'No bugs found; totals held in the areas covered.',
      cap: 'Results: what was found, with bug IDs from the sheet.',
    },
    {
      k: 'Obstacles',
      text: flaky ? `Environment: ${sum('S')} min of setup (login failures, tax service outage).` : 'Only a short tax-service hiccup.',
      cap: 'Obstacles: what got in the way. Setup minutes are evidence, not excuses.',
    },
    {
      k: 'Outlook',
      text: notReached.length ? `Not reached: ${notReached.join(', ')} → new charter(s).` : 'Charter done; parked charter: gift card in cart.',
      cap: 'Outlook: what still needs doing. Uncovered areas become new charters in the backlog, ranked by risk.',
    },
    {
      k: 'Feelings',
      text: notReached.length ? 'Low–medium confidence: key areas untested.' : flaky ? 'Medium: covered, but rushed.' : 'Fairly confident in the areas covered.',
      cap: 'Feelings: how confident is the tester? The lead hears it straight, not just the numbers.',
    },
  ];
  for (const x of P) {
    proof.push({ k: x.k, text: x.text });
    push(x.cap, { tbs, opp, proof: [...proof] }, x.k === 'Outlook' && notReached.length ? 'Some charter areas were never reached. Does that make the session a failure?' : undefined);
  }
  push(
    notReached.length
      ? `Not a failure: the sheet shows exactly what was and was not covered, so the gap is visible and becomes the next charter. ${flaky ? 'The flaky environment cost coverage.' : 'Pick charter scope to fit the timebox.'}`
      : 'Session closed: one charter, one sheet, one debrief. The numbers (TBS, charter/opportunity) make exploration reportable without scripting it.',
    { tbs, opp, proof: [...proof] },
  );
  return frames;
}
