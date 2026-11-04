// Progress changes as data: the rules for Save for later, Shorts and step lessons (duplicates, limits, unknown
// content). Pure: no React, no storage, so the tests run them directly. Adapted from system-design-learn.
import type { Topic } from '../types';
import type { Progress, Rating, SavedKind, Settings } from './progress';

export type FlagBucket = 'boe' | 'cc' | 'code' | 'company';

export type Op =
  /** exam results: recorded by the service when it grades, never accepted from the app */
  | { op: 'test'; topicId: string; score: number }
  | { op: 'answers'; results: { id: string; correct: boolean }[] }
  | { op: 'section'; topicId: string; index: number; read: boolean }
  | { op: 'sectionsAll'; topicId: string }
  | { op: 'flag'; bucket: FlagBucket; id: string; on: boolean }
  | { op: 'rate'; id: string; rating: Rating | null }
  | { op: 'draft'; id: string; text: string }
  | { op: 'settings'; settings: Partial<Settings> }
  /** Save for later (M3): the ☆ button and the Saved page */
  | { op: 'saved'; action: 'add' | 'remove' | 'done'; kind: SavedKind; ref: string }
  /** Shorts (M7): watched to the end card, or the quiz answered (first try or after a miss) */
  | { op: 'short'; id: string; event: 'watched' | 'quiz-first' | 'quiz-retry' }
  /** a section's step lesson (M8) finished: Your-turn steps missed on the first try (feeds Weak areas) */
  | { op: 'steps'; topicId: string; index: number; missed: number }
  /** Settings → Reset all progress: study progress goes, settings, earned badges and saved items stay */
  | { op: 'reset' };

/** changes that are not study, so they don't count towards the streak */
const NOT_ACTIVITY = new Set<Op['op']>(['settings', 'saved', 'reset']);
export const SAVED_MAX = 500;
/** study days kept (the streak and the consistency badges read them) */
export const ACTIVITY_DAYS_MAX = 400;
/** keeps the progress document far below Mongo's 16 MB limit */
export const DRAFTS_MAX_CHARS = 2_000_000;
/** draft id prefix → the content it belongs to (`iq:<id>`, `code:<id>`…) */
const DRAFT_PREFIX: Record<string, keyof ContentIndex['ids']> = { iq: 'iq', cc: 'cc', boe: 'boe', code: 'code' };

export const DEFAULT_SETTINGS: Settings = { passMark: 70, secondsPerQuestion: 90, shuffle: true, theme: 'system', studyLock: 'exam', accent: 'indigo' };

export const DEFAULT_PROGRESS: Progress = {
  tests: {}, sections: {}, iq: {}, boe: {}, cc: {}, drafts: {}, code: {}, company: {}, mcq: {},
  // fresh progress already matches current content, so no migration applies
  migrations: [], activityDays: [], achievements: {},
  settings: DEFAULT_SETTINGS,
};

/** Which ids exist, so stored progress only ever refers to real content. */
export interface ContentIndex {
  sectionCount: Map<string, number>;
  ids: Record<'iq' | 'boe' | 'cc' | 'code' | 'company' | 'mcq' | 'pwlab' | 'short', Set<string>>;
}

type TopicLike = Pick<Topic, 'id' | 'sections' | 'interviewQuestions' | 'envelopeQuestions' | 'codeChallenges' | 'test'>;

export function buildContentIndex(topics: TopicLike[], codingIds: string[], companyIds: string[], pwlabIds: string[], shortIds: string[]): ContentIndex {
  return {
    sectionCount: new Map(topics.map((t) => [t.id, t.sections.length])),
    ids: {
      iq: new Set(topics.flatMap((t) => t.interviewQuestions.map((q) => q.id))),
      boe: new Set(topics.flatMap((t) => t.envelopeQuestions.map((q) => q.id))),
      cc: new Set(topics.flatMap((t) => t.codeChallenges.map((q) => q.id))),
      code: new Set(codingIds),
      company: new Set(companyIds),
      mcq: new Set(topics.flatMap((t) => t.test.map((q) => q.id))),
      pwlab: new Set(pwlabIds),
      short: new Set(shortIds),
    },
  };
}

/** "topic:index" naming a real section, written exactly that way (no "t:0.5", "t:", "t:1:x") */
const sectionKeyKnown = (key: string, ix: ContentIndex) => {
  const [topic, i] = key.split(':');
  const n = Number(i);
  return Number.isInteger(n) && key === `${topic}:${n}` && n >= 0 && n < (ix.sectionCount.get(topic) ?? 0);
};

/** a saved item points at content that exists */
export const savedKnown = (kind: SavedKind, ref: string, ix: ContentIndex) => {
  switch (kind) {
    case 'topic': return ix.sectionCount.has(ref);
    case 'section': return sectionKeyKnown(ref, ix);
    case 'interview': return ix.ids.iq.has(ref);
    case 'drill': return ix.ids.boe.has(ref);
    case 'company': return ix.ids.company.has(ref);
    case 'coding': return ix.ids.code.has(ref);
    case 'pwlab': return ix.ids.pwlab.has(ref);
    case 'short': return ix.ids.short.has(ref);
    default: return false;
  }
};

const draftKnown = (id: string, ix: ContentIndex) => {
  const [prefix, ...rest] = id.split(':');
  const bucket = DRAFT_PREFIX[prefix];
  return !!bucket && ix.ids[bucket].has(rest.join(':'));
};

const draftChars = (drafts: Record<string, string>) => Object.values(drafts).reduce((n, t) => n + t.length, 0);

/** One change. Returns the new progress, or why it was skipped (unknown content, drafts full…). */
function applyOne(p: Progress, o: Op, ix: ContentIndex, now: string, day: string): Progress | string {
  switch (o.op) {
    case 'test': {
      if (!ix.sectionCount.has(o.topicId)) return 'unknown topic';
      const prev = p.tests[o.topicId];
      const passed = o.score >= p.settings.passMark;
      return {
        ...p,
        tests: {
          ...p.tests,
          [o.topicId]: {
            best: Math.max(prev?.best ?? 0, o.score),
            last: o.score,
            attempts: (prev?.attempts ?? 0) + 1,
            passedAt: prev?.passedAt ?? (passed ? now : undefined),
            history: [...(prev?.history ?? []), { at: now, score: o.score }].slice(-10),
          },
        },
      };
    }
    case 'answers': {
      const known = o.results.filter((r) => ix.ids.mcq.has(r.id));
      if (!known.length) return 'unknown questions';
      const mcq = { ...p.mcq };
      for (const r of known) {
        const prev = mcq[r.id];
        mcq[r.id] = { seen: (prev?.seen ?? 0) + 1, wrong: (prev?.wrong ?? 0) + (r.correct ? 0 : 1), lastCorrect: r.correct, lastAt: now };
      }
      return { ...p, mcq };
    }
    case 'section': {
      if (o.index >= (ix.sectionCount.get(o.topicId) ?? 0)) return 'unknown section';
      const cur = new Set(p.sections[o.topicId] ?? []);
      if (o.read) cur.add(o.index);
      else cur.delete(o.index);
      return { ...p, sections: { ...p.sections, [o.topicId]: [...cur].sort((a, b) => a - b) } };
    }
    case 'sectionsAll': {
      const count = ix.sectionCount.get(o.topicId);
      if (count === undefined) return 'unknown topic';
      return { ...p, sections: { ...p.sections, [o.topicId]: Array.from({ length: count }, (_, i) => i) } };
    }
    case 'flag': {
      if (!ix.ids[o.bucket].has(o.id)) return 'unknown question';
      const next = { ...p[o.bucket] };
      if (o.on) next[o.id] = true;
      else delete next[o.id];
      return { ...p, [o.bucket]: next };
    }
    case 'rate': {
      if (!ix.ids.iq.has(o.id)) return 'unknown question';
      const next = { ...p.iq };
      if (o.rating) next[o.id] = o.rating;
      else delete next[o.id];
      return { ...p, iq: next };
    }
    case 'draft': {
      if (!draftKnown(o.id, ix)) return 'unknown question';
      const drafts = { ...p.drafts };
      if (o.text) drafts[o.id] = o.text;
      else delete drafts[o.id];
      if (draftChars(drafts) > DRAFTS_MAX_CHARS) return 'drafts full';
      return { ...p, drafts };
    }
    case 'settings':
      return { ...p, settings: { ...p.settings, ...o.settings } };
    case 'saved': {
      const list = p.saved ?? [];
      const at = list.findIndex((s) => s.kind === o.kind && s.ref === o.ref);
      if (o.action === 'remove') return at < 0 ? p : { ...p, saved: list.filter((_, i) => i !== at) };
      if (o.action === 'done') return at < 0 ? 'not saved' : { ...p, saved: list.map((s, i) => (i === at ? { ...s, doneAt: now } : s)) };
      // saving a done item again puts it back on the list
      if (at >= 0) return list[at].doneAt ? { ...p, saved: [...list.filter((_, i) => i !== at), { kind: o.kind, ref: o.ref, addedAt: now }] } : p;
      if (!savedKnown(o.kind, o.ref, ix)) return 'unknown item';
      if (list.length >= SAVED_MAX) return 'saved list full';
      return { ...p, saved: [...list, { kind: o.kind, ref: o.ref, addedAt: now }] };
    }
    case 'short': {
      if (!ix.ids.short.has(o.id)) return 'unknown short';
      const prev = p.shorts?.[o.id] ?? {};
      // the first watch (and its day, for the Shorts streak) and the first quiz result are kept
      const next =
        o.event === 'watched' ? (prev.watchedAt ? prev : { ...prev, watchedAt: now, day })
        : prev.quiz ? prev : { ...prev, quiz: o.event === 'quiz-first' ? ('first' as const) : ('retry' as const) };
      return next === prev ? p : { ...p, shorts: { ...p.shorts, [o.id]: next } };
    }
    case 'steps': {
      if (!sectionKeyKnown(`${o.topicId}:${o.index}`, ix) || !Number.isInteger(o.missed) || o.missed < 0 || o.missed > 50) return 'unknown section';
      return { ...p, steps: { ...p.steps, [`${o.topicId}:${o.index}`]: { missed: o.missed, at: now } } };
    }
    case 'reset':
      // as the local reset always did: badges once earned are never taken away; saved items are bookmarks, not progress
      return { ...DEFAULT_PROGRESS, settings: p.settings, achievements: p.achievements, ...(p.saved && { saved: p.saved }) };
  }
}

/** Applies a batch in order. `day` is the learner's local date (for the streak), `now` an ISO time. */
export function applyOps(p: Progress, ops: Op[], ix: ContentIndex, day: string, now: string) {
  const skipped: { index: number; reason: string }[] = [];
  let studied = false;
  ops.forEach((o, index) => {
    const next = applyOne(p, o, ix, now, day);
    if (typeof next === 'string') skipped.push({ index, reason: next });
    else {
      p = next;
      if (!NOT_ACTIVITY.has(o.op)) studied = true;
    }
  });
  const days = p.activityDays ?? [];
  if (studied && !days.includes(day)) p = { ...p, activityDays: [...days, day].sort().slice(-ACTIVITY_DAYS_MAX) };
  return { progress: p, skipped };
}
