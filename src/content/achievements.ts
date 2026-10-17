// Achievements (GitHub-style milestone badges): pure data + pure evaluation. No React and no
// runtime imports (types only), so the same code runs in the app and in plain node checks.
//
// Every achievement is { id, name, description, group, art, tiers? | goal, measure, requirement, unit }.
//  - art: a glyph key resolved to a lucide icon by src/components/achievements/Badge.tsx
//  - tiers: [{ tier: 'bronze' | 'silver' | 'gold' | 'diamond', goal }] (goal may be a function of ctx)
//  - goal: for single-step badges (stored with tier 'standard')
//  - measure(progress, ctx) → number (the "34" in "34 / 50")
//  - requirement(goal, ctx, progress) → short text for a locked badge ("Pass 5 topic exams first time")
//
// Every measure reads only what src/lib/progress.ts actually records: read Learn sections, Improve This
// exercises (cc), practice drills (boe), interview self-ratings (iq), exam records (tests, with attempt
// history), exam answers (mcq), solved coding problems (code), practised company questions (company) and
// the study days (activityDays).
import type { CodingProblem, CompanyQuestion, PhaseId, Topic } from '../types';
import type { Progress } from '../lib/progress';

export type Tier = 'bronze' | 'silver' | 'gold' | 'diamond';
/** 'standard' is the only step of a single-step badge */
export type EarnedTier = Tier | 'standard';

/** what progress.achievements stores per earned badge */
export interface StoredAchievement {
  tier: EarnedTier;
  /** when the current (highest) tier was earned, ms since epoch */
  earnedAt: number;
  /** when each tier was first earned */
  tiers?: Partial<Record<EarnedTier, number>>;
}

export type AchievementGroupId = 'start' | 'content' | 'practice' | 'understanding' | 'consistency' | 'fun';

export interface AchievementContext {
  topics: Topic[];
  phases: { id: PhaseId; number: number; title: string }[];
  topicsByPhase: Map<PhaseId, Topic[]>;
  coding: CodingProblem[];
  hardCoding: CodingProblem[];
  /** companies with at least COMPANY_MIN questions: their question ids */
  companyBank: { company: string; ids: string[] }[];
  totals: { sections: number; cc: number; boe: number; iq: number };
}

type Goal = number | ((ctx: AchievementContext, p?: Progress) => number);

export interface Achievement {
  id: string;
  name: string;
  description: string;
  group: AchievementGroupId;
  art: string;
  tiers?: { tier: Tier; goal: Goal }[];
  goal?: Goal;
  measure: (p: Progress, ctx: AchievementContext) => number;
  requirement: (goal: number, ctx: AchievementContext, p?: Progress) => string;
  unit: string;
}

export interface TierStep {
  tier: EarnedTier;
  goal: number;
}

export interface AchievementEvaluation {
  id: string;
  value: number;
  tiers: (TierStep & { reached: boolean })[];
  /** highest tier reached, or null */
  tier: EarnedTier | null;
  /** next tier to reach, or null when maxed */
  next: TierStep | null;
  /** 0..1 toward `next` */
  fraction: number;
  requirement: string;
}

export interface EarnedNow {
  id: string;
  /** highest tier now reached */
  tier: EarnedTier;
  /** every tier newly reached (a jump from nothing to gold lists bronze, silver and gold) */
  tiers: EarnedTier[];
}

export const TIERS: Tier[] = ['bronze', 'silver', 'gold', 'diamond'];
export const TIER_LABEL: Record<EarnedTier, string> = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond', standard: '' };
/** rank for comparisons; 'standard' (single step) ranks with bronze */
export const tierRank = (tier: EarnedTier) => (tier === 'standard' ? 0 : TIERS.indexOf(tier));

export const GROUPS: { id: AchievementGroupId; title: string; blurb: string }[] = [
  { id: 'start', title: 'Getting started', blurb: 'Your first entries in the test log.' },
  { id: 'content', title: 'Lessons & phases', blurb: 'Read the course and pass every phase, one exam at a time.' },
  { id: 'practice', title: 'Practice', blurb: 'Improve This exercises, coding problems, drills and interview answers.' },
  { id: 'understanding', title: 'Understanding', blurb: 'Pass first time, score 100%, and fix your own regressions.' },
  { id: 'consistency', title: 'Consistency', blurb: 'Show up day after day.' },
  { id: 'fun', title: 'Just for fun', blurb: 'Small surprises along the way.' },
];

/** a company needs at least this many reported questions to count for Company Ready */
export const COMPANY_MIN = 5;

// ---------- measuring helpers (all read the real progress shape) ----------
const count = (rec: Record<string, unknown> | undefined) => Object.keys(rec ?? {}).length;
const isPassed = (p: Progress, topicId: string) => !!p.tests[topicId]?.passedAt;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Learn sections marked read, counting only sections that still exist */
const sectionsRead = (p: Progress, ctx: AchievementContext) =>
  ctx.topics.reduce((n, t) => n + (p.sections[t.id] ?? []).filter((i) => i >= 0 && i < t.sections.length).length, 0);

/**
 * Attempts of a topic exam that failed before it was first passed. passedAt is stamped just before
 * the passing attempt's history entry, so every entry strictly earlier than passedAt is a failure.
 * Returns null when the exam is not passed or the attempt history is incomplete (capped at 10).
 */
function failsBeforePass(p: Progress, topicId: string): number | null {
  const rec = p.tests[topicId];
  if (!rec?.passedAt || !rec.history?.length) return null;
  const before = rec.history.filter((h) => h.at < rec.passedAt!).length;
  if (rec.attempts !== rec.history.length && before === 0) return null; // the earliest attempts were trimmed
  return before;
}

const DAY_MS = 86_400_000;
/** "2026-10-15" → a day number (UTC midnight, so DST never breaks a run) */
const dayNum = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10))) / DAY_MS;

/** longest run of consecutive study days ever recorded */
export function longestStreak(days: string[] = []): number {
  const nums = [...new Set(days.map(dayNum))].filter(Number.isFinite).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i] - nums[i - 1] === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

/** weekends (Saturday + the following Sunday) with study on both days */
function fullWeekends(days: string[] = []): number {
  const set = new Set(days.map(dayNum));
  // day number 0 = Thu 1 Jan 1970, so (n + 4) % 7 === 6 is a Saturday
  return [...set].filter((n) => (((n + 4) % 7) + 7) % 7 === 6 && set.has(n + 1)).length;
}

/** exam attempts and exam answers stamped between 00:00 and 03:59 local time */
function lateNightCount(p: Progress): number {
  const stamps = [
    ...Object.values(p.tests).flatMap((t) => (t.history ?? []).map((h) => h.at)),
    ...Object.values(p.mcq).map((m) => m.lastAt),
  ];
  return stamps.filter((at) => {
    const d = new Date(at);
    return !Number.isNaN(d.getTime()) && d.getHours() < 4;
  }).length;
}

/** Precomputes the content-dependent lists every measure needs. */
export function buildAchievementContext({
  topics,
  phases,
  coding,
  companyQuestions,
}: {
  topics: Topic[];
  phases: { id: PhaseId; number: number; title: string }[];
  coding: CodingProblem[];
  companyQuestions: CompanyQuestion[];
}): AchievementContext {
  const topicsByPhase = new Map<PhaseId, Topic[]>();
  for (const t of topics) topicsByPhase.set(t.phase, [...(topicsByPhase.get(t.phase) ?? []), t]);
  const byCompany = new Map<string, string[]>();
  for (const q of companyQuestions) byCompany.set(q.company, [...(byCompany.get(q.company) ?? []), q.id]);
  const companyBank = [...byCompany].filter(([, ids]) => ids.length >= COMPANY_MIN).map(([company, ids]) => ({ company, ids }));
  const sum = (f: (t: Topic) => number) => topics.reduce((n, t) => n + f(t), 0);
  return {
    topics,
    phases,
    topicsByPhase,
    coding,
    hardCoding: coding.filter((q) => q.difficulty === 'hard' || q.difficulty === 'expert'),
    companyBank,
    totals: {
      sections: sum((t) => t.sections.length),
      cc: sum((t) => t.codeChallenges.length),
      boe: sum((t) => t.envelopeQuestions.length),
      iq: sum((t) => t.interviewQuestions.length),
    },
  };
}

// ---------- phase graduates ----------
// [phase, badge name, glyph, what passing the phase proves]
const PHASE_BADGES: [PhaseId, string, string, string][] = [
  ['manual-basics', 'Test Basis Builder', 'clipboard', 'the manual testing foundations: STLC, test artifacts, levels and types'],
  ['manual-advanced', 'Edge-Case Explorer', 'compass', 'test design, defects and agile: BVA, EP, decision tables, bug reports, risk'],
  ['api-sql', 'Endpoint Inspector', 'database', 'API testing and SQL: HTTP, Postman, joins and data validation'],
  ['javascript', 'Script Wrangler', 'braces', 'JavaScript for testers: functions, arrays, objects, errors and async'],
  ['pw-basics', 'Locator Licensed', 'crosshair', 'Playwright fundamentals: setup, locators, actions and web-first assertions'],
  ['pw-framework', 'Pipeline Pilot', 'branch', 'the Playwright framework and CI: fixtures, POM, auth, flaky tests, Git and CI/CD'],
  ['ai-testing', 'Prompt Prober', 'bot', 'AI for testers: how LLMs fail, AI in daily QA and testing a chatbot'],
  ['interview', 'Offer Ready', 'briefcase', 'QA interview prep: scenarios, rapid-fire banks and the behavioural round'],
];

const phaseTitle = (ctx: AchievementContext, id: PhaseId) => ctx.phases.find((ph) => ph.id === id);

const phaseGraduate = ([phaseId, name, art, proves]: [PhaseId, string, string, string]): Achievement => ({
  id: `phase-${phaseId}`,
  name,
  description: `Passed every topic exam in ${proves}.`,
  group: 'content',
  art,
  goal: (ctx) => ctx.topicsByPhase.get(phaseId)?.length || 1,
  measure: (p, ctx) => (ctx.topicsByPhase.get(phaseId) ?? []).filter((t) => isPassed(p, t.id)).length,
  requirement: (goal, ctx) => {
    const ph = phaseTitle(ctx, phaseId);
    return `Pass all ${plural(goal, 'topic exam')} in phase ${ph?.number ?? ''}, ${ph?.title ?? phaseId}`;
  },
  unit: 'exams passed',
});

export const ACHIEVEMENTS: Achievement[] = [
  // ---- getting started ----
  {
    id: 'hello-tester',
    name: 'Hello, Tester',
    description: 'Marked your first Learn section as read.',
    group: 'start',
    art: 'footprints',
    goal: 1,
    measure: (p, ctx) => sectionsRead(p, ctx),
    requirement: () => 'Mark any Learn section as read',
    unit: 'sections',
  },
  {
    id: 'first-test-case',
    name: 'First Test Case',
    description: 'Completed your first Improve This exercise.',
    group: 'start',
    art: 'clipboard-check',
    goal: 1,
    measure: (p) => count(p.cc),
    requirement: () => 'Complete any Improve This exercise',
    unit: 'exercises',
  },
  {
    id: 'first-green-run',
    name: 'First Green Run',
    description: 'Passed your first topic exam.',
    group: 'start',
    art: 'check',
    goal: 1,
    measure: (p, ctx) => ctx.topics.filter((t) => isPassed(p, t.id)).length,
    requirement: () => 'Pass any full-length topic exam',
    unit: 'exams passed',
  },
  {
    id: 'hello-console',
    name: 'Hello, Console',
    description: 'Solved your first JavaScript coding problem.',
    group: 'start',
    art: 'terminal',
    goal: 1,
    measure: (p, ctx) => ctx.coding.filter((q) => p.code[q.id]).length,
    requirement: () => 'Solve any JavaScript coding problem',
    unit: 'solved',
  },

  // ---- lessons & phases ----
  {
    id: 'spec-reader',
    name: 'Spec Reader',
    description: 'Learn sections read.',
    group: 'content',
    art: 'book',
    tiers: [
      { tier: 'bronze', goal: 10 },
      { tier: 'silver', goal: 50 },
      { tier: 'gold', goal: 150 },
      { tier: 'diamond', goal: (ctx) => ctx.totals.sections },
    ],
    measure: (p, ctx) => sectionsRead(p, ctx),
    requirement: (goal) => `Mark ${plural(goal, 'Learn section')} as read`,
    unit: 'sections',
  },
  ...PHASE_BADGES.map(phaseGraduate),
  {
    id: 'release-candidate',
    name: 'Release Candidate',
    description: 'Passed every topic exam in the course.',
    group: 'content',
    art: 'rocket',
    goal: (ctx) => ctx.topics.length,
    measure: (p, ctx) => ctx.topics.filter((t) => isPassed(p, t.id)).length,
    requirement: (goal) => `Pass all ${goal} topic exams`,
    unit: 'exams passed',
  },

  // ---- practice ----
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Improve This exercises completed: weak test cases, vague bug reports, buggy code and flaky tests fixed.',
    group: 'practice',
    art: 'bug',
    tiers: [
      { tier: 'bronze', goal: 5 },
      { tier: 'silver', goal: 20 },
      { tier: 'gold', goal: 40 },
      { tier: 'diamond', goal: (ctx) => ctx.totals.cc },
    ],
    measure: (p, ctx) => ctx.topics.reduce((n, t) => n + t.codeChallenges.filter((c) => p.cc[c.id]).length, 0),
    requirement: (goal) => `Complete ${plural(goal, 'Improve This exercise')}`,
    unit: 'exercises',
  },
  {
    id: 'unit-under-test',
    name: 'Unit Under Test',
    description: 'JavaScript coding problems solved (every visible and hidden test passing).',
    group: 'practice',
    art: 'code',
    tiers: [
      { tier: 'bronze', goal: 5 },
      { tier: 'silver', goal: 25 },
      { tier: 'gold', goal: 50 },
      { tier: 'diamond', goal: (ctx) => ctx.coding.length },
    ],
    measure: (p, ctx) => ctx.coding.filter((q) => p.code[q.id]).length,
    requirement: (goal) => `Solve ${plural(goal, 'JavaScript coding problem')}`,
    unit: 'solved',
  },
  {
    id: 'stress-tester',
    name: 'Stress Tester',
    description: 'Hard JavaScript coding problems solved.',
    group: 'practice',
    art: 'gauge',
    tiers: [
      { tier: 'bronze', goal: 1 },
      { tier: 'gold', goal: (ctx) => ctx.hardCoding.length },
    ],
    measure: (p, ctx) => ctx.hardCoding.filter((q) => p.code[q.id]).length,
    requirement: (goal) => (goal === 1 ? 'Solve a Hard coding problem' : `Solve all ${goal} Hard coding problems`),
    unit: 'solved',
  },
  {
    id: 'drill-sergeant',
    name: 'Drill Sergeant',
    description: 'Practice drills worked through to the answer.',
    group: 'practice',
    art: 'dumbbell',
    tiers: [
      { tier: 'bronze', goal: 5 },
      { tier: 'silver', goal: 25 },
      { tier: 'gold', goal: 60 },
      { tier: 'diamond', goal: (ctx) => ctx.totals.boe },
    ],
    measure: (p, ctx) => ctx.topics.reduce((n, t) => n + t.envelopeQuestions.filter((q) => p.boe[q.id]).length, 0),
    requirement: (goal) => `Work through ${plural(goal, 'practice drill')}`,
    unit: 'drills',
  },
  {
    id: 'mock-interview',
    name: 'Mock Interview',
    description: 'Interview questions answered out loud and self-rated.',
    group: 'practice',
    art: 'message',
    tiers: [
      { tier: 'bronze', goal: 10 },
      { tier: 'silver', goal: 50 },
      { tier: 'gold', goal: 150 },
      { tier: 'diamond', goal: (ctx) => ctx.totals.iq },
    ],
    measure: (p, ctx) => ctx.topics.reduce((n, t) => n + t.interviewQuestions.filter((q) => p.iq[q.id]).length, 0),
    requirement: (goal) => `Practise and rate ${plural(goal, 'interview answer')}`,
    unit: 'answers',
  },

  // ---- understanding ----
  {
    id: 'first-pass-yield',
    name: 'First-Pass Yield',
    description: 'Topic exams passed on the very first attempt.',
    group: 'understanding',
    art: 'badge-check',
    tiers: [
      { tier: 'bronze', goal: 1 },
      { tier: 'silver', goal: 5 },
      { tier: 'gold', goal: 15 },
      // not "all": one failed exam would otherwise lock diamond forever
      { tier: 'diamond', goal: (ctx) => Math.min(30, ctx.topics.length) },
    ],
    measure: (p, ctx) => ctx.topics.filter((t) => failsBeforePass(p, t.id) === 0).length,
    requirement: (goal) => `Pass ${plural(goal, 'topic exam')} on the first attempt`,
    unit: 'first-time passes',
  },
  {
    id: 'green-build',
    name: 'Green Build',
    description: 'Topic exams with a perfect 100% score.',
    group: 'understanding',
    art: 'shield',
    tiers: [
      { tier: 'bronze', goal: 1 },
      { tier: 'silver', goal: 5 },
      { tier: 'gold', goal: 15 },
    ],
    measure: (p, ctx) => ctx.topics.filter((t) => (p.tests[t.id]?.best ?? 0) >= 100).length,
    requirement: (goal) => (goal === 1 ? 'Score 100% on a full topic exam' : `Score 100% on ${goal} different topic exams`),
    unit: 'perfect exams',
  },
  {
    id: 'regression-ranger',
    name: 'Regression Ranger',
    description: 'Exam questions you once got wrong and now answer correctly.',
    group: 'understanding',
    art: 'history',
    tiers: [
      { tier: 'bronze', goal: 5 },
      { tier: 'silver', goal: 25 },
      { tier: 'gold', goal: 100 },
    ],
    measure: (p) => Object.values(p.mcq).filter((m) => m.wrong > 0 && m.lastCorrect).length,
    requirement: (goal) => `Fix ${plural(goal, 'exam question')} you had wrong (answer it right again)`,
    unit: 'fixed',
  },
  {
    id: 'nailed-it',
    name: 'Nailed It',
    description: 'Interview answers you rated “nailed it”.',
    group: 'understanding',
    art: 'target',
    tiers: [
      { tier: 'bronze', goal: 10 },
      { tier: 'silver', goal: 50 },
      { tier: 'gold', goal: 150 },
    ],
    measure: (p, ctx) => ctx.topics.reduce((n, t) => n + t.interviewQuestions.filter((q) => p.iq[q.id] === 'nailed').length, 0),
    requirement: (goal) => `Rate ${plural(goal, 'interview answer')} “nailed it”`,
    unit: 'nailed',
  },

  // ---- consistency ----
  {
    id: 'nightly-build',
    name: 'Nightly Build',
    description: 'Days studied in a row (your longest streak).',
    group: 'consistency',
    art: 'flame',
    tiers: [
      { tier: 'bronze', goal: 3 },
      { tier: 'silver', goal: 7 },
      { tier: 'gold', goal: 30 },
      { tier: 'diamond', goal: 100 },
    ],
    measure: (p) => longestStreak(p.activityDays),
    requirement: (goal) => `Study ${goal} days in a row`,
    unit: 'days',
  },
  {
    id: 'release-cadence',
    name: 'Release Cadence',
    description: 'Days with any study activity, in total.',
    group: 'consistency',
    art: 'calendar',
    tiers: [
      { tier: 'bronze', goal: 5 },
      { tier: 'silver', goal: 20 },
      { tier: 'gold', goal: 60 },
      { tier: 'diamond', goal: 150 },
    ],
    measure: (p) => new Set(p.activityDays ?? []).size,
    requirement: (goal) => `Study on ${plural(goal, 'different day')}`,
    unit: 'days',
  },

  // ---- fun ----
  {
    id: 'midnight-deploy',
    name: 'Midnight Deploy',
    description: 'Answered exam questions between midnight and 4 am.',
    group: 'fun',
    art: 'moon',
    goal: 1,
    measure: (p) => lateNightCount(p),
    requirement: () => 'Answer an exam between 00:00 and 03:59',
    unit: 'late runs',
  },
  {
    id: 'flaky-fixer',
    name: 'Flaky Fixer',
    description: 'Passed a topic exam after failing it at least twice.',
    group: 'fun',
    art: 'wrench',
    goal: 1,
    measure: (p, ctx) => ctx.topics.filter((t) => (failsBeforePass(p, t.id) ?? 0) >= 2).length,
    requirement: () => 'Pass a topic exam after 2+ failed attempts at it',
    unit: 'comebacks',
  },
  {
    id: 'weekend-on-call',
    name: 'Weekend On-Call',
    description: 'Studied on both the Saturday and the Sunday of a weekend.',
    group: 'fun',
    art: 'coffee',
    goal: 1,
    measure: (p) => fullWeekends(p.activityDays),
    requirement: () => 'Study on a Saturday and the Sunday after it',
    unit: 'weekends',
  },
  {
    id: 'company-ready',
    name: 'Company Ready',
    description: 'Practised every reported question from one company.',
    group: 'fun',
    art: 'building',
    // progress shows the company you are closest to finishing
    goal: (ctx, p) => (p ? bestCompany(p, ctx)?.total : undefined) || Math.min(...ctx.companyBank.map((c) => c.ids.length)) || 1,
    measure: (p, ctx) => bestCompany(p, ctx)?.done || 0,
    requirement: (_goal, ctx, p) => {
      const b = p && bestCompany(p, ctx);
      return b && b.done > 0
        ? `Practise all ${b.total} ${b.company} questions`
        : `Practise every question from one company (${COMPANY_MIN}+ reported questions)`;
    },
    unit: 'practised',
  },
];

/** The company whose list is closest to done (finished ones win, then by share practised, then shorter lists). */
function bestCompany(p: Progress, ctx: AchievementContext) {
  let best: { company: string; done: number; total: number } | null = null;
  const score = (r: { done: number; total: number }) => (r.done === r.total ? 2 : 0) + r.done / r.total;
  for (const c of ctx.companyBank) {
    const row = { company: c.company, done: c.ids.filter((id) => p.company[id]).length, total: c.ids.length };
    if (!best || score(row) > score(best) || (score(row) === score(best) && row.total < best.total)) best = row;
  }
  return best;
}

export const achievementById: Record<string, Achievement> = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const ACHIEVEMENT_TOTAL = ACHIEVEMENTS.length;

const resolve = (goal: Goal | undefined, ctx: AchievementContext, p?: Progress) => (typeof goal === 'function' ? goal(ctx, p) : (goal ?? 1));

/** The tier ladder of one achievement with goals resolved. */
export function tierLadder(a: Achievement, ctx: AchievementContext, p?: Progress): TierStep[] {
  if (a.tiers) {
    const out: TierStep[] = [];
    for (const t of a.tiers) {
      const goal = resolve(t.goal, ctx, p);
      // a content-sized goal ("all") never sits at or below an earlier fixed step
      if (!out.length || goal > out[out.length - 1].goal) out.push({ tier: t.tier, goal });
    }
    return out;
  }
  return [{ tier: 'standard', goal: resolve(a.goal, ctx, p) }];
}

export function evaluateAchievement(a: Achievement, p: Progress, ctx: AchievementContext): AchievementEvaluation {
  const value = a.measure(p, ctx) || 0;
  const ladder = tierLadder(a, ctx, p).map((t) => ({ ...t, reached: value >= t.goal }));
  const reached = ladder.filter((t) => t.reached);
  const top = reached[reached.length - 1] ?? null;
  const next = ladder.find((t) => !t.reached) ?? null;
  return {
    id: a.id,
    value,
    tiers: ladder,
    tier: top?.tier ?? null,
    next: next && { tier: next.tier, goal: next.goal },
    fraction: next ? Math.min(1, value / next.goal) : 1,
    requirement: a.requirement((next ?? ladder[ladder.length - 1]).goal, ctx, p),
  };
}

/** Evaluate the whole catalogue: { [id]: evaluation }. */
export function evaluateAll(p: Progress, ctx: AchievementContext): Record<string, AchievementEvaluation> {
  const out: Record<string, AchievementEvaluation> = {};
  for (const a of ACHIEVEMENTS) out[a.id] = evaluateAchievement(a, p, ctx);
  return out;
}

/**
 * Compare evaluations with what is stored in progress.achievements and list what is newly earned.
 * Stored tiers are never revoked, downgraded or re-awarded.
 */
export function newlyEarned(evaluations: Record<string, AchievementEvaluation>, stored: Record<string, StoredAchievement> = {}): EarnedNow[] {
  const out: EarnedNow[] = [];
  for (const a of ACHIEVEMENTS) {
    const ev = evaluations[a.id];
    if (!ev?.tier) continue;
    const have = stored[a.id];
    const haveRank = have?.tier ? tierRank(have.tier) : -1;
    if (tierRank(ev.tier) <= haveRank) continue;
    const fresh = ev.tiers.filter((t) => t.reached && tierRank(t.tier) > haveRank).map((t) => t.tier);
    out.push({ id: a.id, tier: ev.tier, tiers: fresh });
  }
  return out;
}

/** Merge newly earned badges into the stored map (pure; never downgrades). */
export function mergeEarned(stored: Record<string, StoredAchievement> = {}, earned: EarnedNow[], at: number): Record<string, StoredAchievement> {
  const next = { ...stored };
  for (const e of earned) {
    const prev = next[e.id];
    if (prev?.tier && tierRank(prev.tier) >= tierRank(e.tier)) continue;
    const tiers = { ...(prev?.tiers ?? {}) };
    for (const t of e.tiers.length ? e.tiers : [e.tier]) if (!tiers[t]) tiers[t] = at;
    next[e.id] = { ...prev, tier: e.tier, earnedAt: at, tiers };
  }
  return next;
}

/** Stored entries as a list of earned badges, most recent first (unknown ids are ignored). */
export function earnedList(stored: Record<string, StoredAchievement> = {}) {
  return Object.entries(stored)
    .filter(([id, s]) => achievementById[id] && s?.tier)
    .map(([id, s]) => ({ id, ...s, achievement: achievementById[id] }))
    .sort((a, b) => (b.earnedAt || 0) - (a.earnedAt || 0));
}

/** The locked or still-climbing badge closest to its next step (highest fraction, ties → smaller gap). */
export function closestNext(evaluations: Record<string, AchievementEvaluation>) {
  let best: { achievement: Achievement; ev: AchievementEvaluation & { next: TierStep }; gap: number } | null = null;
  for (const a of ACHIEVEMENTS) {
    const ev = evaluations[a.id];
    if (!ev?.next) continue;
    const gap = ev.next.goal - ev.value;
    if (!best || ev.fraction > best.ev.fraction || (ev.fraction === best.ev.fraction && gap < best.gap)) {
      best = { achievement: a, ev: ev as AchievementEvaluation & { next: TierStep }, gap };
    }
  }
  return best;
}
