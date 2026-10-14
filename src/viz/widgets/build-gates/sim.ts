// Pure simulation of the test gates a build passes on its way to release:
// smoke (broad and shallow: is the build stable enough to test at all?) →
// sanity (narrow and deep on the changed/fixed area, for bug-fix and hotfix builds) →
// regression (did the change break anything that used to work? full or risk-based subset) → release.
// No React here.
import type { BaseFrame } from '../../core';

export type BuildType = 'feature' | 'bugfix' | 'hotfix';
export type SmokeResult = 'pass' | 'fail';
export type Scope = 'full' | 'risk';
export interface Params {
  build: BuildType;
  smoke: SmokeResult;
  scope: Scope;
}
export const DEFAULT_PARAMS: Params = { build: 'bugfix', smoke: 'pass', scope: 'risk' };

export type Stage = 'build' | 'smoke' | 'sanity' | 'regression' | 'release' | 'rejected';
export const STAGES: Stage[] = ['build', 'smoke', 'sanity', 'regression', 'release'];

export const SMOKE = ['App deploys and launches', 'Login works', 'Main navigation loads', 'Search returns results', 'Add to cart works', 'Checkout page opens'];
/** minutes per smoke check */
const SMOKE_MIN = 2.5;

export const BUILDS: Record<BuildType, { name: string; change: string; sanity: string[]; impacted: string[] }> = {
  feature: {
    name: 'Build 3.2.0 (new Wishlist feature)',
    change: 'new Wishlist feature',
    sanity: [],
    impacted: ['Catalog', 'Account', 'Cart & checkout'],
  },
  bugfix: {
    name: 'Build 3.1.1 (fix: coupon not applied)',
    change: 'coupon fix BUG-311',
    sanity: ['Coupon SAVE10 applies 10%', 'Coupon + min order value', 'Expired coupon rejected', 'Coupon removed → total restored', 'Coupon + member discount rule'],
    impacted: ['Promotions', 'Cart & checkout', 'Payments'],
  },
  hotfix: {
    name: 'Hotfix 3.1.0-hf1 (payments timing out in prod)',
    change: 'payment gateway timeout fix',
    sanity: ['Card payment succeeds', 'UPI payment succeeds', 'Gateway slow → retry once', 'Timeout → order not double-charged'],
    impacted: ['Payments', 'Cart & checkout'],
  },
};

export const AREAS: { name: string; tests: number }[] = [
  { name: 'Cart & checkout', tests: 220 },
  { name: 'Payments', tests: 180 },
  { name: 'Promotions', tests: 90 },
  { name: 'Catalog', tests: 160 },
  { name: 'Search', tests: 160 },
  { name: 'Account', tests: 140 },
  { name: 'Orders', tests: 150 },
  { name: 'Notifications', tests: 100 },
];
/** automated regression, minutes per test (parallel grid) */
const REG_MIN = 0.3;
/** risk-based: the critical-path share run in areas the change does not touch */
const CRITICAL_SHARE = 0.1;

export type Check = 'todo' | 'pass' | 'fail' | 'skip';

export interface Frame extends BaseFrame {
  at: Stage;
  buildName: string;
  smoke: Check[];
  sanity: Check[];
  /** per area: planned tests in this run (0 = not selected), executed so far */
  reg: { name: string; planned: number; done: number; impacted: boolean }[];
  testsRun: number;
  minutes: number;
  /** stages already passed */
  passed: Stage[];
  rejected: boolean;
}

export function regressionPlan(build: BuildType, scope: Scope) {
  const imp = BUILDS[build].impacted;
  return AREAS.map((a) => {
    const impacted = imp.includes(a.name);
    const planned = scope === 'full' || impacted ? a.tests : Math.round(a.tests * CRITICAL_SHARE);
    return { name: a.name, planned, done: 0, impacted };
  });
}

export const fmt = (m: number) => (m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)} h ${Math.round(m % 60)} min`);

export function simulate({ build, smoke, scope }: Params): Frame[] {
  const B = BUILDS[build];
  const frames: Frame[] = [];
  let at: Stage = 'build';
  let buildName = B.name;
  let smk: Check[] = SMOKE.map(() => 'todo');
  let san: Check[] = B.sanity.map(() => 'todo');
  let reg = regressionPlan(build, scope);
  let testsRun = 0;
  let minutes = 0;
  let passed: Stage[] = [];
  let rejected = false;
  const push = (caption: string, predict?: string) =>
    frames.push({ at, buildName, smoke: [...smk], sanity: [...san], reg: reg.map((r) => ({ ...r })), testsRun, minutes, passed: [...passed], rejected, caption, predict });

  push(`${buildName} lands on the QA environment from CI.${build === 'hotfix' ? ' Production is affected right now, so every hour of testing is an hour of lost payments.' : ''}`,
    'What is the very first test gate, and why is it deliberately shallow?');

  // smoke
  at = 'smoke';
  push('Smoke test: a broad, shallow pass over the most critical functions. It answers "is this build stable enough to test at all?", not "is it correct?"');
  const failAt = smoke === 'fail' ? 1 : -1;
  for (let i = 0; i < SMOKE.length; i += 2) {
    const batch = [i, i + 1].filter((k) => k < SMOKE.length);
    let failedNow = false;
    for (const k of batch) {
      if (k === failAt) {
        smk[k] = 'fail';
        failedNow = true;
      } else smk[k] = 'pass';
      testsRun++;
      minutes += SMOKE_MIN;
    }
    if (failedNow) {
      push(`Smoke check "${SMOKE[failAt]}" FAILS: the login page returns HTTP 500.`, 'The smoke gate has failed. Will the team still run the sanity and regression suites on this build?');
      break;
    }
    push(`Smoke: ${batch.map((k) => `"${SMOKE[k]}"`).join(' and ')} pass (${testsRun}/${SMOKE.length}).`);
  }

  if (smoke === 'fail') {
    at = 'rejected';
    rejected = true;
    push(`No. The build is REJECTED back to development after ${fmt(minutes)}. Running ${reg.reduce((s, r) => s + r.planned, 0)} regression tests on a build where nobody can log in would waste hours and report hundreds of false failures.`);
    push('Developers fix the broken config and CI produces a new build. Smoke is the gate that protects the expensive testing behind it.');
    buildName = B.name.replace(/\(/, '(re-build, ');
    at = 'build';
    rejected = false;
    smk = SMOKE.map(() => 'todo');
    push(`${buildName} arrives. The whole pipeline restarts from the smoke gate.`);
    at = 'smoke';
    smk = SMOKE.map(() => 'pass');
    testsRun += SMOKE.length;
    minutes += SMOKE.length * SMOKE_MIN;
    push(`Smoke re-run: all ${SMOKE.length} checks pass in ${fmt(SMOKE.length * SMOKE_MIN)}. The build is accepted for testing.`);
  } else {
    push(`All ${SMOKE.length} smoke checks pass in ${fmt(minutes)}. The build is accepted for further testing.`);
  }
  passed = ['build', 'smoke'];

  // sanity
  if (build === 'feature') {
    push('This is a new-feature build. Sanity testing is for a narrow change or fix, so it is skipped here; the Wishlist itself gets full functional testing (planned test cases) in the sprint.',
      'The new feature works. Is the build ready to release?');
  } else {
    at = 'sanity';
    push(`Sanity test: narrow and deep, only on the ${B.change}. It checks the fix is rational and works before investing in regression. Often unscripted, run by the tester who knows the area.`,
      'The fixed area will get several deep checks. Will sanity also re-check search, account and notifications?');
    for (let k = 0; k < san.length; k++) {
      san[k] = 'pass';
      testsRun++;
      minutes += 6;
      if (k === 1 || k === san.length - 1) push(`Sanity: ${B.sanity.slice(0, k + 1).map((s) => `"${s}"`).slice(-2).join(', ')} pass (${k + 1}/${san.length}).`);
    }
    passed = [...passed, 'sanity'];
    push(`No: sanity stayed narrow. The fix is verified (${san.length} deep checks).`, 'The fix works. Is the build ready to release?');
  }

  // regression
  at = 'regression';
  const total = reg.reduce((s, r) => s + r.planned, 0);
  const fullTotal = AREAS.reduce((s, a) => s + a.tests, 0);
  push(
    scope === 'full'
      ? `Not yet: a change can break code that used to work. Full regression: all ${fullTotal} automated tests across ${AREAS.length} areas, about ${fmt(fullTotal * REG_MIN)}.`
      : `Not yet: a change can break code that used to work. Risk-based regression: every test in the impacted areas (${B.impacted.join(', ')}) plus ~${CRITICAL_SHARE * 100}% critical-path tests elsewhere = ${total} of ${fullTotal}.`,
  );
  const order = [...reg.keys()].sort((a, b) => Number(reg[b].impacted) - Number(reg[a].impacted));
  const chunks = [order.slice(0, 3), order.slice(3, 6), order.slice(6)];
  chunks.forEach((ch, ci) => {
    for (const k of ch) {
      reg[k] = { ...reg[k], done: reg[k].planned };
      testsRun += reg[k].planned;
      minutes += reg[k].planned * REG_MIN;
    }
    const names = ch.map((k) => `${reg[k].name} ${reg[k].planned}`).join(', ');
    push(ci === 0 ? `Impacted areas first: ${names}. All green.` : `Then ${names}${scope === 'risk' ? ' (critical paths only)' : ''}. All green.`);
  });
  passed = [...passed, 'regression'];
  const saved = fullTotal - total;
  push(
    scope === 'full'
      ? `Regression complete: ${total} tests in ${fmt(total * REG_MIN)}. Maximum confidence${build === 'hotfix' ? ', but production stayed broken that much longer; hotfixes usually take risk-based regression and run the full suite in the next cycle' : ''}.`
      : `Regression complete: ${total} tests in ${fmt(total * REG_MIN)}, ${saved} fewer than full (${fmt(saved * REG_MIN)} saved). The risk accepted: untested paths in areas the change did not touch.`,
  );

  at = 'release';
  passed = [...passed, 'release'];
  push(`${buildName} is released${build === 'hotfix' ? ' to production, and the hotfix branch is merged back so the next release keeps the fix' : ''}. Total: ${testsRun} tests, ${fmt(minutes)} of testing.`);
  return frames;
}
