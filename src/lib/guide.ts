// "Guide me" UI state (M4): the guide for the page on screen and the running "Show me" walkthrough. The welcome tour
// keeps its own state in Layout. Adapted from system-design-learn's src/lib/guide.ts.
import { useSyncExternalStore } from 'react';

/** One stop of a "Show me" walkthrough: the first visible element matching `target` gets the spotlight. */
export interface WalkStep {
  target: string;
  title: string;
  text: string;
  /** a keyboard shortcut, shown only on devices with a mouse and keyboard */
  shortcut?: string;
}

interface GuideState {
  /** the guide for the page on screen (PageGuide) */
  page: boolean;
  /** the running "Show me" walkthrough */
  walk: WalkStep[] | null;
}

let state: GuideState = { page: false, walk: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<GuideState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

export const openPageGuide = () => set({ page: true });
export const closePageGuide = () => set({ page: false });
export const startWalk = (walk: WalkStep[]) => set({ walk, page: false });
export const endWalk = () => set({ walk: null });

export function useGuide(): GuideState {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
  );
}
