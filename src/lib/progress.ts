import { useSyncExternalStore } from 'react';
import { mergeEarned, type EarnedNow, type StoredAchievement } from '../content/achievements';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, TOPICS } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { SHORTS_DATA } from '../content/shorts';
import { api, ApiError, localDate, timeZone } from './api';
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
    if (sync) localStorage.setItem(accountKey(sync.userId), JSON.stringify({ version: sync.version, pending: [...sync.sending, ...sync.pending], progress: state }));
    else localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked — keep in-memory state
  }
  listeners.forEach((l) => l());
}

/**
 * Apply a change. Study actions also record today in `activityDays`; settings changes pass activity=false. When signed
 * in, `op` (the same change as data) is queued for the account; the service applies it with the same rules
 * (progress-ops.ts).
 */
export function update(fn: (p: Progress) => Progress, activity = true, op?: Op) {
  let next = fn(state);
  if (activity) next = withActivity(next);
  if (sync && op) queue(op);
  setState(next);
}

// Exam results: recorded here only while signed out. Signed in, the service grades and records them itself (the app
// can't send scores), and refreshProgress() brings the result back.
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
    { op: 'section', topicId, index, read },
  );
}

export function markAllSectionsRead(topicId: string, count: number) {
  update((p) => ({ ...p, sections: { ...p.sections, [topicId]: Array.from({ length: count }, (_, i) => i) } }), true, { op: 'sectionsAll', topicId });
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
    { op: 'flag', bucket, id, on },
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
    { op: 'rate', id, rating: r },
  );
}

export function setDraft(id: string, text: string) {
  update((p) => ({ ...p, drafts: { ...p.drafts, [id]: text } }), true, { op: 'draft', id, text: text.slice(0, 20_000) });
}

export function setSettings(s: Partial<Settings>) {
  update((p) => ({ ...p, settings: { ...p.settings, ...s } }), false, { op: 'settings', settings: s });
}

/**
 * Store newly earned badges / tier-ups. Never downgrades, and doesn't count as study activity. For an account the
 * service earns them itself from the same rules, so nothing is queued.
 */
export function earnAchievements(earned: EarnedNow[], at = Date.now()) {
  if (!earned.length) return;
  update((p) => ({ ...p, achievements: mergeEarned(p.achievements, earned, at) }), false);
}

export function resetProgress() {
  update((p) => ({ ...DEFAULT, settings: p.settings, achievements: sync ? p.achievements : DEFAULT.achievements }), false, { op: 'reset' });
}

export function isPassed(p: Progress, topicId: string) {
  return !!p.tests[topicId]?.passedAt;
}

// ---- Save for later (M3): the same rule as the service (progress-ops.ts), so both agree on duplicates and limits ----
function savedOp(action: 'add' | 'remove' | 'done', kind: SavedKind, ref: string) {
  const op: Op = { op: 'saved', action, kind, ref };
  update((p) => replay(p, [op]), false, op);
}
export const isSaved = (p: Progress, kind: SavedKind, ref: string) => !!p.saved?.some((s) => s.kind === kind && s.ref === ref && !s.doneAt);
export const saveItem = (kind: SavedKind, ref: string) => savedOp('add', kind, ref);
export const removeSaved = (kind: SavedKind, ref: string) => savedOp('remove', kind, ref);
export const setSavedDone = (kind: SavedKind, ref: string) => savedOp('done', kind, ref);
/** the ☆ button: save, or take it off the list again */
export const toggleSaved = (kind: SavedKind, ref: string) => (isSaved(state, kind, ref) ? removeSaved(kind, ref) : saveItem(kind, ref));

// ---- Shorts (M7): watched to the end, and the quiz result; the first of each is kept ----
export function recordShort(id: string, event: 'watched' | 'quiz-first' | 'quiz-retry') {
  const op: Op = { op: 'short', id, event };
  update((p) => replay(p, [op]), false, op);
}

// ---- account sync (M2) ----
// Signed in, the account's copy lives under its own key with the changes not yet sent. Changes go out as one batch
// every 30 s, when the tab is hidden and on page close; a batch rejected as stale is replayed on the latest copy.
// Adapted from system-design-learn's src/lib/progress.ts.

interface Sync {
  userId: string;
  version: number;
  /** the service's copy has arrived (or could not be fetched): until then the shown copy may be a stale cache or none */
  loaded: boolean;
  /** queued, not yet sent */
  pending: Op[];
  /** the batch on the wire (kept apart, so new changes can't be merged into it) */
  sending: Op[];
  batchId?: string;
  /** ops in the batch with that id: a resend must carry exactly the same ones, or the service's dedupe drops the rest */
  batchLen?: number;
  timer?: ReturnType<typeof setInterval>;
}
let sync: Sync | null = null;
const accountKey = (userId: string) => `qa-learn-account-v1:${userId}`;
const FLUSH_MS = 30_000;
let contentIndex: ContentIndex | undefined;
const index = () =>
  (contentIndex ??= buildContentIndex(TOPICS, CODING_PROBLEMS.map((q) => q.id), COMPANY_QUESTIONS.map((q) => q.id), PW_LAB_STEPS.map((s) => s.id), SHORTS_DATA.map((s) => s.id)));
const replay = (p: Progress, ops: Op[]) => (ops.length ? applyOps(p, ops, index(), localDay(), new Date().toISOString()).progress : p);

/** a newer change to the same thing replaces the queued one (drafts are saved on every keystroke) */
const opKey = (o: Op) =>
  o.op === 'draft' ? `draft|${o.id}`
  : o.op === 'section' ? `section|${o.topicId}|${o.index}`
  : o.op === 'flag' ? `flag|${o.bucket}|${o.id}`
  : o.op === 'rate' ? `rate|${o.id}`
  : o.op === 'settings' ? 'settings'
  : null;

function queue(op: Op) {
  if (!sync) return;
  if (op.op === 'settings') {
    const prev = sync.pending.find((o) => o.op === 'settings');
    if (prev && prev.op === 'settings') op = { op: 'settings', settings: { ...prev.settings, ...op.settings } };
  }
  const k = opKey(op);
  sync.pending = [...sync.pending.filter((o) => k === null || opKey(o) !== k), op];
}

const hidden = () => {
  if (document.visibilityState === 'hidden') void flushProgress(true);
};
const pagehide = () => void flushProgress(true);

// the service refuses bodies over 100 KB, and browsers refuse keepalive (page closing) bodies over 64 KB
const BATCH_BYTES = 90_000;
const KEEPALIVE_BYTES = 60_000;
const utf8 = new TextEncoder();

/** How many of the oldest queued changes fit in one request (at most 200, always at least one). */
export function batchSize(pending: Op[], maxBytes: number): number {
  let bytes = 0;
  let n = 0;
  while (n < Math.min(200, pending.length)) {
    bytes += utf8.encode(JSON.stringify(pending[n])).length + 1;
    if (n > 0 && bytes > maxBytes) break;
    n++;
  }
  return n;
}

/** Sends queued changes now. `keepalive` lets the request finish while the page is closing. */
export async function flushProgress(keepalive = false): Promise<void> {
  const s = sync;
  if (!s || s.sending.length || !s.pending.length) return;
  if (!s.batchId) {
    s.batchId = crypto.randomUUID();
    s.batchLen = batchSize(s.pending, keepalive ? KEEPALIVE_BYTES : BATCH_BYTES);
  }
  s.sending = s.pending.slice(0, s.batchLen);
  s.pending = s.pending.slice(s.sending.length);
  try {
    const res = await api<{ version: number }>('/api/progress', {
      method: 'PATCH',
      keepalive,
      body: { batchId: s.batchId, baseVersion: s.version, day: localDate(), timeZone: timeZone(), ops: s.sending },
    });
    if (sync !== s) return;
    s.version = res.version;
    s.sending = [];
    s.batchId = undefined;
    setState(state);
    if (s.pending.length) void flushProgress(keepalive);
  } catch (e) {
    if (sync !== s) return;
    const sent = s.sending.length;
    const unsent = [...s.sending, ...s.pending];
    s.sending = [];
    if (e instanceof ApiError && e.code === 'VERSION_CONFLICT') {
      // another device wrote first: take its copy and replay what we haven't sent on top
      const current = (e.body as { current: { version: number; progress: Progress } }).current;
      s.version = current.version;
      s.batchId = undefined;
      s.pending = unsent;
      setState(replay(current.progress, unsent));
      void flushProgress(keepalive);
    } else if (e instanceof ApiError && e.status === 400) {
      // a change the service refuses would block every later one: drop that batch (the rest stays queued)
      s.batchId = undefined;
      s.pending = unsent.slice(sent);
      console.warn('progress batch refused', e.message);
    } else {
      // offline, signed out elsewhere or the service is down: keep everything (and the batch id) for the next try
      s.pending = unsent;
    }
  }
}

/** Reloads the account's copy (after the service recorded something itself, e.g. a graded exam). */
export async function refreshProgress() {
  const s = sync;
  if (!s) return;
  await flushProgress();
  const res = await api<{ version: number; progress: Progress }>('/api/progress');
  if (sync !== s) return;
  s.version = res.version;
  // keep the badges this browser knew of: the ones the service just earned are then spotted and celebrated once
  setState({ ...replay(res.progress, s.pending), achievements: state.achievements });
}

const hasProgress = (p: Progress) =>
  [p.tests, p.sections, p.iq, p.boe, p.cc, p.code, p.drafts, p.company, p.mcq].some((x) => Object.keys(x).length) ||
  !!p.activityDays?.length ||
  !!p.saved?.length;

/** Signed in: show the cached account copy at once, then load the latest (importing this browser's progress once). */
export async function startSync(userId: string) {
  if (sync?.userId === userId) return;
  stopSync();
  let cached: { version: number; pending: Op[]; progress: Progress } | null = null;
  try {
    cached = JSON.parse(localStorage.getItem(accountKey(userId)) ?? 'null');
  } catch {
    // a broken cache is simply ignored
  }
  const anonymous = load();
  sync = { userId, version: cached?.version ?? 0, pending: cached?.pending ?? [], sending: [], loaded: false };
  const s = sync;
  if (cached) setState(cached.progress);
  s.timer = setInterval(() => void flushProgress(), FLUSH_MS);
  document.addEventListener('visibilitychange', hidden);
  window.addEventListener('pagehide', pagehide);
  try {
    let res = await api<{ version: number; progress: Progress; imported: boolean }>('/api/progress');
    if (!res.imported && hasProgress(anonymous)) {
      try {
        res = { ...(await api<{ version: number; progress: Progress }>('/api/progress/import', { body: { progress: anonymous, timeZone: timeZone() } })), imported: true };
      } catch (e) {
        if (!(e instanceof ApiError && e.code === 'ALREADY_IMPORTED')) throw e;
        res = { ...(e.body as { current: { version: number; progress: Progress } }).current, imported: true };
      }
    }
    if (sync !== s) return;
    s.version = res.version;
    s.loaded = true;
    setState(replay(res.progress, s.pending));
    void flushProgress();
  } catch {
    // offline: keep working on the cached copy; the timer retries the queue
    if (sync === s) {
      s.loaded = true;
      listeners.forEach((l) => l());
    }
  }
}

/**
 * Signed out: the account's copy leaves this browser, and the visitor's own local progress is shown again.
 * `keepCache`: the session expired, so keep unsent changes for when this account signs in again.
 */
export function stopSync(keepCache = false) {
  if (!sync) return;
  clearInterval(sync.timer);
  document.removeEventListener('visibilitychange', hidden);
  window.removeEventListener('pagehide', pagehide);
  try {
    if (!keepCache) localStorage.removeItem(accountKey(sync.userId));
  } catch {
    // blocked storage: nothing to remove
  }
  // the look stays on this device (theme, accent), so signing out doesn't flash the visitor's own theme
  const { theme, accent } = state.settings;
  sync = null;
  const local = load();
  state = { ...local, settings: { ...local.settings, theme, ...(accent && { accent }) } };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // blocked storage: the look applies for this visit only
  }
  listeners.forEach((l) => l());
}

export const isSyncing = () => !!sync;

/**
 * False while signed in and the account's progress has not arrived yet (the shown copy may be an old cache or the
 * signed-out one). Pages that take a one-off snapshot of progress (the mistakes drill) wait for it.
 */
export const isProgressLoaded = () => !sync || sync.loaded;

export function useProgressLoaded(): boolean {
  return useSyncExternalStore(subscribe, isProgressLoaded);
}
