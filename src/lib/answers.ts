// Answers come from qa-api after a real attempt (M2): the app's build ships content without them. This module wraps
// the reveal flow and keeps what was revealed during this visit in memory (never stored), so going back to a card
// doesn't cost another reveal.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { MCQ } from '../types';
import { api, ApiError } from './api';
import { flushProgress } from './progress';
import { useSession } from './session';

export type RevealKind = 'interview' | 'drill' | 'challenge' | 'coding';

/** mirrors LIMITS in api/src/practice.ts, so the button only enables when the service will accept the attempt */
export const MIN_ATTEMPT_SECONDS = 20;
export const MIN_ATTEMPT_CHARS = 20;

/** "select all that apply": the public hint in the app's build, or the answer itself where it is known */
export const isMulti = (q: MCQ) => q.multi ?? (q.correct?.length ?? 0) > 1;

/** the attempt the service accepts: long enough, not one repeated character, and not the untouched starter */
export const attemptOk = (text: string, starter?: string) => {
  const t = text.trim();
  return t.length >= MIN_ATTEMPT_CHARS && new Set(t.replace(/\s/g, '')).size >= 6 && t !== starter?.trim();
};

const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const remember = (key: string, value: unknown) => {
  cache.set(key, value);
  listeners.forEach((l) => l());
};
const useCached = <T>(key: string) => useSyncExternalStore(subscribe, () => cache.get(key) as T | undefined);

const messageFor = (e: unknown) =>
  e instanceof ApiError
    ? e.code === 'REVEAL_LIMIT'
      ? 'You have seen the most answers allowed today. The limit resets at midnight UTC.'
      : e.message
    : 'Something went wrong. Please try again.';

export interface Reveal<T> {
  answer: T | undefined;
  /** signed out, loading, or signed in */
  status: 'in' | 'out' | 'loading';
  /** seconds until the service accepts an attempt (the clock starts when the card is shown) */
  wait: number;
  busy: boolean;
  error: string;
  reveal: (attempt: string) => Promise<void>;
}

/** The answer to one question: opens it on the service when shown, then reveals it for a real attempt. */
export function useReveal<T>(kind: RevealKind, id: string): Reveal<T> {
  const session = useSession();
  const key = `${kind}:${id}`;
  const answer = useCached<T>(key);
  const token = useRef('');
  const [openedAt, setOpenedAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signedIn = session.status === 'in';

  const open = async () => {
    const res = await api<{ token: string }>(`/api/reveal/${kind}/${id}/open`, { body: {} });
    token.current = res.token;
    setOpenedAt(Date.now());
  };
  // opened once per card and sign-in: the clock starts when the question is on screen
  useEffect(() => {
    if (!signedIn || answer || token.current) return;
    open().catch((e) => setError(messageFor(e)));
  }, [signedIn, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const wait = openedAt ? Math.max(0, MIN_ATTEMPT_SECONDS - Math.floor((now - openedAt) / 1000)) : MIN_ATTEMPT_SECONDS;
  useEffect(() => {
    if (!openedAt || wait === 0 || answer) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [openedAt, wait, answer]);

  const reveal = async (attempt: string) => {
    setBusy(true);
    setError('');
    try {
      // the service checks the study-first lock against saved progress: send what is still queued first
      await flushProgress();
      remember(key, await api<T>(`/api/reveal/${kind}/${id}`, { body: { token: token.current, attempt } }));
    } catch (e) {
      // a used or expired token: open the question again (the clock restarts)
      if (e instanceof ApiError && e.code === 'BAD_TOKEN') {
        token.current = '';
        await open().catch(() => undefined);
      }
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };
  return { answer, status: session.status, wait, busy, error, reveal };
}

/** A company question's strong answer: for any signed-in learner, fetched when asked for. */
export function useCompanyAnswer(id: string) {
  const session = useSession();
  const key = `company:${id}`;
  const answer = useCached<{ answer: string; followUps?: { q: string; a: string }[] }>(key);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    setBusy(true);
    setError('');
    try {
      remember(key, await api(`/api/company/${id}`));
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };
  return { answer, status: session.status, busy, error, load };
}
