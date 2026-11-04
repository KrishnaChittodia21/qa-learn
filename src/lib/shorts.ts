// Shorts (M7): every Short with its topic and section, how long each beat stays up, and today's Short.
// Adapted from system-design-learn's lib/shorts.ts. One learner, kept in this browser: every Short is open.
import { TOPICS, TOPIC_BY_ID } from '../content';
import { SHORTS_DATA } from '../content/shorts';
import type { Short, ShortBeat, Topic } from '../types';
import type { ShortRecord } from './progress';

export interface ShortEntry {
  short: Short;
  topic: Topic;
  /** index of the section the Short tells */
  section: number;
}

/** in course order (topic, then section) */
export const SHORTS: ShortEntry[] = SHORTS_DATA.flatMap((short) => {
  const topic = TOPIC_BY_ID.get(short.topic);
  const section = topic?.sections.findIndex((s) => s.heading.startsWith(short.heading)) ?? -1;
  return topic && section >= 0 ? [{ short, topic, section }] : [];
}).sort((a, b) => TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic) || a.section - b.section);
export const SHORT_BY_ID = new Map(SHORTS.map((e) => [e.short.id, e]));

/** the Short that tells this section, if any */
export const shortForSection = (topicId: string, section: number) => SHORTS.find((e) => e.topic.id === topicId && e.section === section);

export const SPEEDS = [1, 1.25, 0.75] as const;

function beatWords(b: ShortBeat): string[] {
  switch (b.type) {
    case 'counter': return [b.unit];
    case 'race': return b.lanes.map((l) => l.label);
    case 'grid': return [b.caption];
    case 'ladder': return b.rungs.map((r) => `${r.label} ${r.amount}`);
    case 'toggles': return b.items.map((i) => i.label);
    case 'flow': return b.steps;
    default: return [];
  }
}

const wordsIn = (b: ShortBeat) =>
  [b.kicker, b.head, b.sub, ...(b.stats ?? []).map((s) => `${s.value} ${s.label}`), ...beatWords(b)]
    .join(' ')
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;

/** How long a beat stays up at 1×, in ms: time for its animation plus ~3 words a second of reading. A quiz waits. */
export function beatMs(b: ShortBeat): number {
  if (b.type === 'quiz') return Infinity;
  if (b.seconds) return b.seconds * 1000;
  return Math.max(5200, 3500 + wordsIn(b) * 330);
}

/** "1:35": the whole Short at 1×, counting a quiz as 15 s and the end card as 6 s */
export function shortLength(s: Short): string {
  const ms = s.beats.reduce((a, b) => a + (b.type === 'quiz' ? 15_000 : beatMs(b)), 0) + 6000;
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

/**
 * Today's Short: one already watched today stays up (ticked), so the card doesn't change the moment it ends.
 * Otherwise the first unwatched one in course order; when all are watched, one picked by the date.
 */
export function shortOfTheDay(watched: Record<string, ShortRecord> | undefined, today: string, all: ShortEntry[] = SHORTS) {
  if (!all.length) return null;
  const todays = all.find((e) => watched?.[e.short.id]?.day === today);
  if (todays) return { entry: todays, watched: true };
  const next = all.find((e) => !watched?.[e.short.id]?.watchedAt);
  if (next) return { entry: next, watched: false };
  const n = Math.floor(Date.parse(`${today}T00:00:00Z`) / 86_400_000);
  return { entry: all[n % all.length], watched: true };
}
