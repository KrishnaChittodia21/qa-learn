import { useSyncExternalStore } from 'react';
import { mergeEarned, type EarnedNow, type StoredAchievement } from '../content/achievements';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, TOPICS } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { SHORTS_DATA } from '../content/shorts';
import { applyOps, buildContentIndex, DEFAULT_PROGRESS, type ContentIndex, type Op } from './progress-ops';

export type Rating = 'nailed' | 'partial' | 'missed';

export interface TestRecord {
  best: number;
  last: number;
  attempts: number;
  passedAt?: string;
  /** most recent full-length attempts, oldest first (max 10) */
  history?: { at: string; score: number }[];
}

/** per-question outcome across every attempt (full exams and practice drills) */
export interface McqRecord {
  seen: number;
  wrong: number;
  lastCorrect: boolean;
  lastAt: string;
}

/** what the ☆ Save button can put on the Saved page; `ref` is the item's id ("topic:index" for a section) */
export type SavedKind = 'topic' | 'section' | 'interview' | 'drill' | 'company' | 'coding' | 'pwlab' | 'short';
export interface SavedItem {
  kind: SavedKind;
  ref: string;
  addedAt: string;
  doneAt?: string;
}

/** Settings → Accent colour (applied as data-accent on <html>) */
export type Accent = 'indigo' | 'teal' | 'rose' | 'amber';

export interface Settings {
  passMark: number;
  secondsPerQuestion: number;
  shuffle: boolean;
  theme: 'system' | 'light' | 'dark';
  /** study-first lock: which practice unlocks only after every Learn section is marked read */
  studyLock: 'off' | 'exam' | 'exam-interview';
  /** optional for saves made before accent themes existed; defaults to 'indigo' */
  accent?: Accent;
}

export interface ShortRecord {
  watchedAt?: string;
  day?: string;
  quiz?: 'first' | 'retry';
}

export interface Progress {
  tests: Record<string, TestRecord>;
  sections: Record<string, number[]>;
  iq: Record<string, Rating>;
  boe: Record<string, true>;
  cc: Record<string, true>;
  drafts: Record<string, string>;
  /** solved JavaScript coding problems */
  code: Record<string, true>;
  /** company questions marked as practised */
  company: Record<string, true>;
  mcq: Record<string, McqRecord>;
  /** applied one-off data migrations */
  migrations?: string[];
  /** local dates (YYYY-MM-DD) with any study activity, oldest first (max 400); drives the study streak */
  activityDays?: string[];
  /** earned badges (src/content/achievements.ts); optional for saves made before achievements existed */
  achievements?: Record<string, StoredAchievement>;
  /** Save for later, oldest first (max 500); optional for saves made before it existed */
  saved?: SavedItem[];
  /** Shorts (M7) by id: when first watched to the end (and that local day), and the first quiz result */
  shorts?: Record<string, ShortRecord>;
  /** step lessons (M8) by "topicId:sectionIndex": Your-turn steps missed on the first try in the latest run */
  steps?: Record<string, { missed: number; at: string }>;
  settings: Settings;
}

const KEY = 'qa-learn-progress-v1';
const DEFAULT = DEFAULT_PROGRESS;

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    // migrations are judged from what was saved, not from the defaults merged in
    return migrate({ ...DEFAULT, ...parsed, settings: { ...DEFAULT.settings, ...parsed.settings } }, parsed.migrations ?? []);
  } catch {
    return DEFAULT;
  }
}

// One-off content migrations for data keyed by section index.
function migrate(p: Progress, applied: string[]): Progress {
  const done = new Set(applied);
  return { ...p, migrations: [...done] };
}

let state: Progress = load();
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, () => state);
}

export function getProgress(): Progress {
  return state;
}

/** local calendar date, e.g. "2026-10-15" */
export function localDay(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function withActivity(p: Progress): Progress {
  const today = localDay();
  const days = p.activityDays ?? [];
  if (days[days.length - 1] === today) return p;
  return { ...p, activityDays: [...days.filter((d) => d !== today), today].slice(-400) };
}

function setState(next: Progress) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked — keep in-memory state
  }
  listeners.forEach((l) => l());
}

/** Apply a change. Study actions also record today in `activityDays`; settings changes pass activity=false. */
export function update(fn: (p: Progress) => Progress, activity = true) {
  let next = fn(state);
  if (activity) next = withActivity(next);
  setState(next);
}

// Exam results, graded in the browser.
export function recordTest(topicId: string, score: number) {
  update((p) => {
    const prev = p.tests[topicId];
    const passed = score >= p.settings.passMark;
    const rec: TestRecord = {
      best: Math.max(prev?.best ?? 0, score),
      last: score,
      attempts: (prev?.attempts ?? 0) + 1,
      passedAt: prev?.passedAt ?? (passed ? new Date().toISOString() : undefined),
      history: [...(prev?.history ?? []), { at: new Date().toISOString(), score }].slice(-10),
    };
    return { ...p, tests: { ...p.tests, [topicId]: rec } };
  });
}

export function recordAnswers(results: { id: string; correct: boolean }[]) {
  const at = new Date().toISOString();
  update((p) => {
    const mcq = { ...p.mcq };
    for (const r of results) {
      const prev = mcq[r.id];
      mcq[r.id] = {
        seen: (prev?.seen ?? 0) + 1,
        wrong: (prev?.wrong ?? 0) + (r.correct ? 0 : 1),
        lastCorrect: r.correct,
        lastAt: at,
      };
    }
    return { ...p, mcq };
  });
}

export function toggleSectionRead(topicId: string, index: number) {
  const read = !(state.sections[topicId] ?? []).includes(index);
  update(
    (p) => {
      const cur = new Set(p.sections[topicId] ?? []);
      if (read) cur.add(index);
      else cur.delete(index);
      return { ...p, sections: { ...p.sections, [topicId]: [...cur].sort((a, b) => a - b) } };
    },
    true,
  );
}

export function markAllSectionsRead(topicId: string, count: number) {
  update((p) => ({ ...p, sections: { ...p.sections, [topicId]: Array.from({ length: count }, (_, i) => i) } }));
}

export function setFlag(bucket: 'boe' | 'cc' | 'code' | 'company', id: string, on: boolean) {
  update(
    (p) => {
      const next = { ...p[bucket] };
      if (on) next[id] = true;
      else delete next[id];
      return { ...p, [bucket]: next };
    },
    true,
  );
}

export function rateIQ(id: string, r: Rating | null) {
  update(
    (p) => {
      const next = { ...p.iq };
      if (r) next[id] = r;
      else delete next[id];
      return { ...p, iq: next };
    },
    true,
  );
}

export function setDraft(id: string, text: string) {
  update((p) => ({ ...p, drafts: { ...p.drafts, [id]: text } }));
}

export function setSettings(s: Partial<Settings>) {
  update((p) => ({ ...p, settings: { ...p.settings, ...s } }), false);
}

/** Store newly earned badges / tier-ups. Never downgrades, and doesn't count as study activity. */
export function earnAchievements(earned: EarnedNow[], at = Date.now()) {
  if (!earned.length) return;
  update((p) => ({ ...p, achievements: mergeEarned(p.achievements, earned, at) }), false);
}

export function resetProgress() {
  update((p) => ({ ...DEFAULT, settings: p.settings }), false);
}

export function isPassed(p: Progress, topicId: string) {
  return !!p.tests[topicId]?.passedAt;
}

// ---- Save for later: the rules for duplicates and limits live in progress-ops.ts ----
function savedOp(action: 'add' | 'remove' | 'done', kind: SavedKind, ref: string) {
  update((p) => replay(p, [{ op: 'saved', action, kind, ref }]), false);
}
export const isSaved = (p: Progress, kind: SavedKind, ref: string) => !!p.saved?.some((s) => s.kind === kind && s.ref === ref && !s.doneAt);
export const saveItem = (kind: SavedKind, ref: string) => savedOp('add', kind, ref);
export const removeSaved = (kind: SavedKind, ref: string) => savedOp('remove', kind, ref);
export const setSavedDone = (kind: SavedKind, ref: string) => savedOp('done', kind, ref);
/** the ☆ button: save, or take it off the list again */
export const toggleSaved = (kind: SavedKind, ref: string) => (isSaved(state, kind, ref) ? removeSaved(kind, ref) : saveItem(kind, ref));

// ---- Shorts (M7): watched to the end, and the quiz result; the first of each is kept ----
export function recordShort(id: string, event: 'watched' | 'quiz-first' | 'quiz-retry') {
  update((p) => replay(p, [{ op: 'short', id, event }]), false);
}

// ---- step lessons (M8): finishing records the latest run's misses (Weak areas reads them) ----
export function recordSteps(topicId: string, index: number, missed: number) {
  update((p) => replay(p, [{ op: 'steps', topicId, index, missed }]), false);
}

// the shared change rules (progress-ops.ts) need to know which content exists
let contentIndex: ContentIndex | undefined;
const index = () =>
  (contentIndex ??= buildContentIndex(TOPICS, CODING_PROBLEMS.map((q) => q.id), COMPANY_QUESTIONS.map((q) => q.id), PW_LAB_STEPS.map((s) => s.id), SHORTS_DATA.map((s) => s.id)));
const replay = (p: Progress, ops: Op[]) => (ops.length ? applyOps(p, ops, index(), localDay(), new Date().toISOString()).progress : p);
