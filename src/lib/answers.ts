// Model answers, solutions and company answers ship with the content: they show after the learner's own attempt.
// What was revealed during this visit is kept in memory, so going back to a card keeps it open.
import { useSyncExternalStore } from 'react';
import type { MCQ } from '../types';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, TOPICS } from '../content';

export type RevealKind = 'interview' | 'drill' | 'challenge' | 'coding';

/** the attempt asked for before an answer shows */
export const MIN_ATTEMPT_CHARS = 20;

/** "select all that apply" */
export const isMulti = (q: MCQ) => q.multi ?? (q.correct?.length ?? 0) > 1;

/** a real attempt: long enough, not one repeated character, and not the untouched starter */
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
const useCached = <T,>(key: string) => useSyncExternalStore(subscribe, () => cache.get(key) as T | undefined);

export interface Reveal<T> {
  answer: T | undefined;
  reveal: () => void;
}

/** every question that has a hidden answer, by "kind:id"; the item itself carries the answer fields */
let items: Map<string, unknown> | undefined;
const itemFor = (key: string) =>
  (items ??= new Map<string, unknown>([
    ...TOPICS.flatMap((t) => [
      ...t.interviewQuestions.map((q) => [`interview:${q.id}`, q] as const),
      ...t.envelopeQuestions.map((q) => [`drill:${q.id}`, q] as const),
      ...t.codeChallenges.map((q) => [`challenge:${q.id}`, q] as const),
    ]),
    ...CODING_PROBLEMS.map((q) => [`coding:${q.id}`, q] as const),
    ...COMPANY_QUESTIONS.map((q) => [`company:${q.id}`, { answer: q.answer ?? '', followUps: q.followUps }] as const),
  ])).get(key);

/** The answer to one question, shown once the learner has made an attempt. */
export function useReveal<T>(kind: RevealKind, id: string): Reveal<T> {
  const key = `${kind}:${id}`;
  return { answer: useCached<T>(key), reveal: () => remember(key, itemFor(key)) };
}

/** A company question's strong answer, shown when asked for. */
export function useCompanyAnswer(id: string) {
  const key = `company:${id}`;
  const answer = useCached<{ answer: string; followUps?: { q: string; a: string }[] }>(key);
  return { answer, load: () => remember(key, itemFor(key)) };
}
