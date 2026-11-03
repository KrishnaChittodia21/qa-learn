// Progress changes as data (M2). The service applies batches of these to the stored progress; the app queues them
// and sends one batch every ~30 s. Pure: no React, no storage, so both sides run the same rules.
// Adapted from system-design-learn's src/lib/progress-ops.ts. Type-only imports: the service loads this file in Node.
import type { Topic } from '../types';
import type { Progress, Rating, SavedItem, SavedKind, Settings, ShortRecord } from './progress';

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

// ---- first-login import: merge the browser's saved progress into the account once ----

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const isoish = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const int = (v: unknown, min: number, max: number) => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Merges untrusted local progress into the stored one. Only known ids and well-formed values are taken; for each item
 * the furthest-along copy wins (best scores, more attempts, union of read sections, done flags, all study days).
 * Exam passes and badges are not taken: passes come only from server grading, and the service re-evaluates badges.
 */
export function mergeImport(server: Progress, local: unknown, ix: ContentIndex): Progress {
  const l = obj(local);
  const out: Progress = structuredClone(server);

  for (const [topic, raw] of Object.entries(obj(l.tests))) {
    const r = obj(raw);
    if (!ix.sectionCount.has(topic) || !int(r.best, 0, 100) || !int(r.last, 0, 100) || !int(r.attempts, 1, 100_000)) continue;
    const prev = out.tests[topic];
    const history = (Array.isArray(r.history) ? r.history : [])
      .map(obj)
      .filter((h) => isoish(h.at) && int(h.score, 0, 100))
      .map((h) => ({ at: h.at as string, score: h.score as number }));
    // a pass is never imported: it only comes from a server-graded exam (it opens the study lock and company badges)
    const passedAt = prev?.passedAt;
    out.tests[topic] = {
      best: Math.max(prev?.best ?? 0, r.best as number),
      last: prev && (prev.history?.at(-1)?.at ?? '') > (history.at(-1)?.at ?? '') ? prev.last : (r.last as number),
      attempts: Math.max(prev?.attempts ?? 0, r.attempts as number),
      ...(passedAt && { passedAt }),
      history: [...(prev?.history ?? []), ...history].sort((a, b) => a.at.localeCompare(b.at)).slice(-10),
    };
  }
  for (const [topic, raw] of Object.entries(obj(l.sections))) {
    const count = ix.sectionCount.get(topic) ?? 0;
    const read = (Array.isArray(raw) ? raw : []).filter((i) => int(i, 0, count - 1)) as number[];
    if (read.length) out.sections[topic] = [...new Set([...(out.sections[topic] ?? []), ...read])].sort((a, b) => a - b);
  }
  for (const bucket of ['boe', 'cc', 'code', 'company'] as const) {
    for (const id of Object.keys(obj(l[bucket]))) if (ix.ids[bucket].has(id)) out[bucket][id] = true;
  }
  for (const [id, r] of Object.entries(obj(l.iq))) {
    if (ix.ids.iq.has(id) && !out.iq[id] && ['nailed', 'partial', 'missed'].includes(r as string)) out.iq[id] = r as Rating;
  }
  for (const [id, text] of Object.entries(obj(l.drafts))) {
    if (draftKnown(id, ix) && typeof text === 'string' && text && !out.drafts[id] && draftChars(out.drafts) + text.length <= DRAFTS_MAX_CHARS) {
      out.drafts[id] = text;
    }
  }
  for (const [id, raw] of Object.entries(obj(l.mcq))) {
    const r = obj(raw);
    if (!ix.ids.mcq.has(id) || !int(r.seen, 1, 100_000) || !int(r.wrong, 0, r.seen as number) || !isoish(r.lastAt)) continue;
    const prev = out.mcq[id];
    if (!prev || (r.seen as number) > prev.seen) out.mcq[id] = { seen: r.seen as number, wrong: r.wrong as number, lastCorrect: r.lastCorrect === true, lastAt: r.lastAt };
  }
  const days = (Array.isArray(l.activityDays) ? l.activityDays : []).filter((d): d is string => typeof d === 'string' && DAY.test(d));
  if (days.length) out.activityDays = [...new Set([...(out.activityDays ?? []), ...days])].sort().slice(-ACTIVITY_DAYS_MAX);

  // settings: the account's own win; the browser's only fill in while the account still has the defaults
  const s = obj(l.settings);
  const settings: Partial<Settings> = {};
  if (int(s.passMark, 50, 100)) settings.passMark = s.passMark as number;
  if (int(s.secondsPerQuestion, 30, 300)) settings.secondsPerQuestion = s.secondsPerQuestion as number;
  if (typeof s.shuffle === 'boolean') settings.shuffle = s.shuffle;
  if (['system', 'light', 'dark'].includes(s.theme as string)) settings.theme = s.theme as Settings['theme'];
  if (['off', 'exam', 'exam-interview'].includes(s.studyLock as string)) settings.studyLock = s.studyLock as Settings['studyLock'];
  if (['indigo', 'teal', 'rose', 'amber'].includes(s.accent as string)) settings.accent = s.accent as Settings['accent'];
  out.settings = JSON.stringify(server.settings) === JSON.stringify(DEFAULT_SETTINGS) ? { ...server.settings, ...settings } : server.settings;

  const saved = new Map((out.saved ?? []).map((x) => [`${x.kind}|${x.ref}`, x]));
  for (const raw of Array.isArray(l.saved) ? l.saved : []) {
    const x = obj(raw) as unknown as SavedItem;
    if (saved.size >= SAVED_MAX || typeof x.ref !== 'string' || saved.has(`${x.kind}|${x.ref}`) || !isoish(x.addedAt)) continue;
    if (!savedKnown(x.kind, x.ref, ix)) continue;
    saved.set(`${x.kind}|${x.ref}`, { kind: x.kind, ref: x.ref, addedAt: x.addedAt, ...(isoish(x.doneAt) && { doneAt: x.doneAt }) });
  }
  if (saved.size) out.saved = [...saved.values()];

  for (const [id, raw] of Object.entries(obj(l.shorts))) {
    const r = obj(raw);
    if (!ix.ids.short.has(id) || out.shorts?.[id]) continue;
    const rec: ShortRecord = {
      ...(isoish(r.watchedAt) && { watchedAt: r.watchedAt }),
      ...(typeof r.day === 'string' && DAY.test(r.day) && { day: r.day }),
      ...((r.quiz === 'first' || r.quiz === 'retry') && { quiz: r.quiz as ShortRecord['quiz'] }),
    };
    if (Object.keys(rec).length) out.shorts = { ...out.shorts, [id]: rec };
  }
  return out;
}
