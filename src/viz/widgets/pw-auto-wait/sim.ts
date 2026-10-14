// Pure simulation of Playwright auto-waiting vs a hard sleep vs a web-first assertion.
// The mock app renders a Submit button in five stages before it is clickable:
//   absent → attached but hidden → animating in → covered by a spinner → disabled → ready.
// click() checks (playwright.dev/docs/actionability): the locator resolves to one element, then
// Visible, Stable, Receives events, Enabled, re-checking until they pass or the timeout hits.
// toBeVisible() retries only the visibility check (default expect timeout 5 s).
import type { BaseFrame } from '../../core';

export type Strategy = 'autowait' | 'sleep' | 'expect';
export interface Params {
  /** ms after page load when the button is finally enabled */
  readyAt: number;
  strategy: Strategy;
  /** action timeout for click(), expect timeout for toBeVisible() */
  timeout: number;
}
export const DEFAULT_PARAMS: Params = { readyAt: 3000, strategy: 'autowait', timeout: 5000 };

export const PHASES = ['absent', 'hidden', 'moving', 'covered', 'disabled', 'ready'] as const;
export type Phase = (typeof PHASES)[number];
export const PHASE_LABEL: Record<Phase, string> = {
  absent: 'not in DOM',
  hidden: 'attached, hidden',
  moving: 'animating in',
  covered: 'spinner overlay',
  disabled: 'disabled',
  ready: 'ready',
};
/** fraction of readyAt at which each phase starts */
const STARTS = [0, 0.2, 0.4, 0.6, 0.8, 1];
export const phaseStart = (k: number, R: number) => Math.round(STARTS[k] * R);
export function phaseAt(t: number, R: number): Phase {
  let k = 0;
  for (let j = 1; j < PHASES.length; j++) if (t >= phaseStart(j, R)) k = j;
  return PHASES[k];
}

export const CHECKS = ['Attached (1 match)', 'Visible', 'Stable', 'Receives events', 'Enabled'] as const;
export type CheckState = 'idle' | 'pass' | 'fail' | 'skip';
const WHY = [
  "waiting for getByRole('button', { name: 'Submit' })",
  'element is not visible',
  'element is not stable',
  '<div class="spinner"></div> intercepts pointer events',
  'element is not enabled',
];

export const SLEEP_MS = 2000;
export const SAVED_LINE = "await expect(page.getByText('Saved')).toBeVisible();";

export interface Frame extends BaseFrame {
  t: number;
  phase: Phase;
  checks: CheckState[];
  /** times at which checks ran so far */
  polls: number[];
  status: 'waiting' | 'sleeping' | 'pass' | 'fail';
  /** pointer has clicked */
  clicked: boolean;
  endT?: number;
  error?: string;
}

/** check k passes when the app has reached phase index > k; checks run in order, stopping at the first failure */
function evalChecks(phase: Phase, upTo: number): CheckState[] {
  const idx = PHASES.indexOf(phase);
  const out: CheckState[] = [];
  let failed = false;
  for (let k = 0; k < CHECKS.length; k++) {
    if (k >= upTo) out.push('skip');
    else if (failed) out.push('idle');
    else {
      const ok = idx > k;
      out.push(ok ? 'pass' : 'fail');
      if (!ok) failed = true;
    }
  }
  return out;
}
const firstFail = (c: CheckState[]) => c.indexOf('fail');

const APP_EVENT = [
  '',
  'app: the button is attached to the DOM but still visibility:hidden (empty box to the user).',
  'app: the button becomes visible and starts a slide-in animation, so its bounding box changes every frame.',
  'app: the animation ends, but a loading spinner overlay now sits on top of the button.',
  'app: the spinner disappears; the button is visible and uncovered but still has the disabled attribute.',
  'app: the form finishes loading and the button is enabled.',
];

export function simulate({ readyAt: R, strategy, timeout: T }: Params): Frame[] {
  if (strategy === 'sleep') return simulateSleep(R);
  const isClick = strategy === 'autowait';
  const upTo = isClick ? 5 : 2;
  // the moment the assertion/action can succeed
  const goal = isClick ? R : phaseStart(2, R);
  // poll schedule: click re-checks continuously (shown every 100 ms); expect backs off 100, 250, 500, 1000, 1000…
  const polls: number[] = [];
  if (isClick) for (let t = 0; t <= T; t += 100) polls.push(t);
  else {
    const gaps = [100, 250, 500, 1000];
    for (let t = 0, g = 0; t <= T; t += gaps[Math.min(g, 3)], g++) polls.push(t);
  }
  const passPoll = polls.find((p) => p >= goal);
  const endT = passPoll ?? T;
  const pass = passPoll !== undefined;

  // events: app phase changes and re-checks; at equal times the app changes first
  type Ev = { t: number; kind: 'app' | 'poll' | 'end' };
  const evs: Ev[] = [];
  for (let k = 1; k < PHASES.length; k++) {
    const c = phaseStart(k, R);
    if (c > endT) continue;
    evs.push({ t: c, kind: 'app' });
    const next = polls.find((p) => p >= c);
    if (next !== undefined && next < endT) evs.push({ t: next, kind: 'poll' });
  }
  if (isClick) {
    // show a sample of the continuous re-checks so long waits still animate
    const step = Math.max(100, Math.round(endT / 8 / 100) * 100);
    for (const p of polls) if (p < endT && p % step === 0) evs.push({ t: p, kind: 'poll' });
  } else for (const p of polls) if (p < endT) evs.push({ t: p, kind: 'poll' });
  evs.push({ t: endT, kind: 'end' });
  const order = { app: 0, poll: 1, end: 2 };
  const seen = new Set<string>();
  const list = evs
    .sort((a, b) => a.t - b.t || order[a.kind] - order[b.kind])
    .filter((e) => (seen.has(`${e.t}${e.kind}`) ? false : (seen.add(`${e.t}${e.kind}`), true)));

  const code = isClick ? 'click()' : 'toBeVisible()';
  const frames: Frame[] = [
    {
      t: 0,
      phase: 'absent',
      checks: evalChecks('absent', upTo).map((c) => (c === 'skip' ? c : 'idle')),
      polls: [],
      status: 'waiting',
      clicked: false,
      caption: isClick
        ? `click() will not act until the locator matches one element that is Visible, Stable, Receives events and Enabled. It keeps re-running the checks until they pass or the ${T} ms timeout is hit.`
        : `toBeVisible() is a web-first assertion: it re-checks only "is this element visible?", backing off 100, 250, 500, 1000 ms between attempts, up to the ${T} ms expect timeout.`,
      predict: `The app needs ${goal} ms to get the button ${isClick ? 'clickable' : 'visible'}, and the timeout is ${T} ms. Will ${code} pass, and when?`,
    },
  ];
  let checks = evalChecks('absent', upTo).map((c) => (c === 'skip' ? c : 'idle')) as CheckState[];
  let predicted = false;
  const pollsTo = (t: number) => polls.filter((p) => p <= t);
  for (const e of list) {
    const { t } = e;
    const phase = phaseAt(t, R);
    let status: Frame['status'] = 'waiting';
    let error: string | undefined;
    let caption: string;
    let clicked = false;
    if (e.kind === 'app') {
      caption = `${t} ms, ${APP_EVENT[PHASES.indexOf(phase)]}`;
    } else if (e.kind === 'poll') {
      checks = evalChecks(phase, upTo);
      const ff = firstFail(checks);
      caption = `${t} ms: re-check, "${CHECKS[ff]}" fails (${WHY[ff]}); ${isClick ? 'retrying' : 'backing off, then retrying'}.`;
    } else if (pass) {
      checks = evalChecks(phase, upTo);
      status = 'pass';
      clicked = isClick;
      caption = isClick
        ? `${t} ms: every check is green, so Playwright clicks. No sleep; it waited as long as the app needed (plus one re-check).`
        : `${t} ms: the element is visible, so the assertion passes on attempt ${pollsTo(t).length}, even though the button is "${PHASE_LABEL[phase]}".`;
    } else {
      const ff = Math.max(0, firstFail(evalChecks(phase, upTo)));
      checks = evalChecks(phase, upTo);
      status = 'fail';
      error = isClick
        ? `TimeoutError: locator.click: Timeout ${T}ms exceeded. ${WHY[ff]}`
        : `Timed out ${T}ms waiting for expect(locator).toBeVisible(): ${ff === 0 ? 'element(s) not found' : 'element is hidden'}`;
      caption = `${t} ms: timeout while "${CHECKS[ff]}" still fails. The test fails with ${error}`;
    }
    const fr: Frame = { t, phase, checks: [...checks], polls: pollsTo(t), status, clicked, endT: e.kind === 'end' ? endT : undefined, error, caption };
    if (!predicted && e.kind === 'app' && ((isClick && phase === 'covered') || (!isClick && phase === 'hidden'))) {
      fr.predict = isClick
        ? 'The button is visible and has stopped moving, but a spinner covers it. Does click() hit the spinner, throw, or keep waiting?'
        : 'The button is now in the DOM but visibility:hidden. Does toBeVisible() pass on the next attempt?';
      predicted = true;
    }
    frames.push(fr);
  }
  // keep the app timeline going after the test has moved on
  const done = frames[frames.length - 1];
  for (let k = 1; k < PHASES.length; k++) {
    const t = phaseStart(k, R);
    if (t <= endT || frames.length >= 38) continue;
    frames.push({
      ...done,
      t,
      phase: PHASES[k],
      clicked: false,
      caption: `${t} ms, ${APP_EVENT[k]} ${pass ? 'toBeVisible() never looked at this; it only promised visibility. A following click() would auto-wait for the rest.' : 'Too late: the test already failed.'}`,
      predict: undefined,
    });
  }
  if (!predicted) {
    const k = frames.findIndex((f) => f.status !== 'waiting') - 1;
    if (k > 0) frames[k].predict = `${isClick ? 'click()' : 'The assertion'} has ${endT - frames[k].t} ms left before ${pass ? 'its next attempt' : 'the timeout'}. Pass or fail?`;
  }
  if (!isClick)
    frames.push({
      ...frames[frames.length - 1],
      caption: `Contrast: expect(await submit.isVisible()).toBe(true) is NOT web-first. isVisible() returns immediately (at 0 ms the button is ${PHASE_LABEL[phaseAt(0, R)]}), so that line would fail at once with no retry.`,
      predict: undefined,
    });
  frames.push({
    ...frames[frames.length - 1],
    caption: pass
      ? `Result: PASS in ${endT} ms. ${isClick ? 'Auto-waiting adapts to a slow or fast app; no fixed sleep needed.' : 'Prefer web-first assertions: they wait for the condition instead of checking once.'}`
      : `Result: FAIL after ${endT} ms. The app needed ${goal} ms; raise the timeout only if that slowness is acceptable, otherwise it is a real bug.`,
    predict: undefined,
  });
  return frames;
}

function simulateSleep(R: number): Frame[] {
  const attachAt = phaseStart(1, R);
  const clickT = Math.max(SLEEP_MS, attachAt);
  const clickPhase = phaseAt(clickT, R);
  const ok = clickPhase === 'ready';
  const skipChecks: CheckState[] = ['idle', 'skip', 'skip', 'skip', 'skip'];
  const base = { polls: [] as number[], clicked: false };
  const frames: Frame[] = [
    {
      ...base,
      t: 0,
      phase: 'absent',
      checks: skipChecks,
      status: 'sleeping',
      caption: `waitForTimeout(${SLEEP_MS}) pauses blindly, then click({ force: true }) clicks immediately, skipping the actionability checks (a plain click() would auto-wait anyway, making the sleep pure waste).`,
      predict: `The app needs ${R} ms. What will the forced click hit at ${SLEEP_MS} ms?`,
    },
  ];
  const times = new Set<number>([0, SLEEP_MS, clickT]);
  for (let t = 200; t < SLEEP_MS; t += 200) times.add(t);
  for (let k = 1; k < PHASES.length; k++) if (phaseStart(k, R) <= clickT) times.add(phaseStart(k, R));
  let last: Phase = 'absent';
  for (const t of [...times].sort((a, b) => a - b)) {
    const phase = phaseAt(t, R);
    const parts: string[] = [];
    if (phase !== last) parts.push(`${t} ms, ${APP_EVENT[PHASES.indexOf(phase)]}`);
    let fr: Frame;
    if (t < SLEEP_MS) {
      parts.push(`${t} ms: still sleeping; nothing is checked.`);
      fr = { ...base, t, phase, checks: skipChecks, status: 'sleeping', caption: parts.join(' ') };
    } else if (t < clickT) {
      parts.push(`${t} ms: sleep over, but the button is not in the DOM yet, so the forced click waits only for it to attach.`);
      fr = { ...base, t, phase, checks: ['fail', 'skip', 'skip', 'skip', 'skip'], status: 'waiting', caption: parts.join(' ') };
    } else {
      const what: Record<Phase, string> = {
        absent: '',
        hidden: 'it clicks an invisible button; nothing happens',
        moving: 'the button is still sliding, so the click lands where it used to be',
        covered: 'the click lands on the spinner overlay, not the button',
        disabled: 'the button is disabled, so the click is ignored',
        ready: R < SLEEP_MS ? `it works, but the app was ready at ${R} ms, so ${SLEEP_MS - R} ms were wasted` : 'it works, just in time',
      };
      parts.push(`${t} ms: forced click: ${what[phase]}.`);
      fr = { ...base, t, phase, checks: ['pass', 'skip', 'skip', 'skip', 'skip'], status: ok ? 'pass' : 'fail', clicked: true, endT: clickT, caption: parts.join(' ') };
      if (!ok) fr.error = `${SAVED_LINE} fails: the form was never submitted`;
    }
    frames.push(fr);
    last = phase;
  }
  // predict right before the click
  const beforeClick = frames.length - 2;
  if (beforeClick > 0 && !frames[beforeClick].predict) frames[beforeClick].predict = `The forced click fires at ${clickT} ms. Is the button clickable at that instant?`;
  const clickFrame = frames[frames.length - 1];
  for (let k = 1; k < PHASES.length && !ok; k++) {
    const t = phaseStart(k, R);
    if (t <= clickT) continue;
    frames.push({ ...clickFrame, t, phase: PHASES[k], caption: `${t} ms, ${APP_EVENT[k]} Too late: the forced click already happened at ${clickT} ms.` });
  }
  frames.push({
    ...frames[frames.length - 1],
    caption: ok
      ? `Result: PASS in ${clickT} ms${R < SLEEP_MS ? `, ${SLEEP_MS - R} ms slower than needed. Multiply that by every sleep in the suite` : ''}. Move the slider above ${SLEEP_MS} ms to see it break.`
      : `Result: FAIL. A fixed sleep only works when the app is faster than the guess; on a slower CI machine it breaks. That is the classic flaky test.`,
    predict: undefined,
  });
  return frames;
}
