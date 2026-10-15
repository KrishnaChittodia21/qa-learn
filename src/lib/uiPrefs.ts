// UI preferences (sidebar state, last page, scroll position, guide/coach flags). Kept separate from
// study progress so "Reset progress" doesn't wipe layout preferences.
import { useSyncExternalStore } from 'react';

export interface UiPrefs {
  sidebarCollapsed: boolean;
  collapsedPhases: Record<string, boolean>;
  /** pathname + search, e.g. "/topic/cache-failures?tab=learn" */
  lastLocation: string;
  lastScroll: { loc: string; y: number } | null;
  /** last study page (topic, coding problem, lab step) for "Continue where you left off" */
  lastStudyLocation: string;
  /** the welcome tour has been shown (opened automatically only once) */
  tourSeen: boolean;
  /** coach tips the learner dismissed, keyed by tip id (e.g. "tab:learn") */
  coachDismissed: Record<string, boolean>;
  showCoachTips: boolean;
  /** Playwright Lab steps whose "all bugs caught" result was already celebrated */
  celebratedPwSteps: string[];
  /** command palette: most recently chosen item ids, newest first */
  recentCommands: string[];
}

const KEY = 'qa-learn-ui-v1';

const DEFAULT: UiPrefs = {
  sidebarCollapsed: false,
  collapsedPhases: {},
  lastLocation: '/',
  lastScroll: null,
  lastStudyLocation: '',
  tourSeen: false,
  coachDismissed: {},
  showCoachTips: true,
  celebratedPwSteps: [],
  recentCommands: [],
};

// cached snapshot so useUiPrefs() returns a stable object between writes
let cache: UiPrefs | null = null;
const listeners = new Set<() => void>();

function read(): UiPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<UiPrefs>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function getUiPrefs(): UiPrefs {
  if (!cache) cache = read();
  return cache;
}

export function saveUiPrefs(patch: Partial<UiPrefs>) {
  cache = { ...getUiPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // storage blocked — preferences just won't persist
  }
  listeners.forEach((l) => l());
}

/** Reactive UI prefs, for components that render from them (coach tips, settings). */
export function useUiPrefs(): UiPrefs {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getUiPrefs,
  );
}

/** Where to reopen the app on a fresh start, or null to stay on the dashboard. */
export function resumeLocation(): string | null {
  const loc = getUiPrefs().lastLocation;
  if (!loc || loc === '/') return null;
  // an in-progress exam can't be resumed, so reopen the topic's exam tab instead
  const exam = /^\/topic\/([^/?]+)\/exam/.exec(loc);
  if (exam) return `/topic/${exam[1]}?tab=exam`;
  if (loc.startsWith('/practice')) return '/weak-areas';
  return loc;
}
