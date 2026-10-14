import type { CodingProblem, Topic } from '../types';
import { PHASES } from './phases';

const topicModules = import.meta.glob<{ default: Topic }>('./topics/*.ts', { eager: true });

const phaseIndex = (id: string) => PHASES.findIndex((p) => p.id === id);

export const TOPICS: Topic[] = Object.values(topicModules)
  .map((m) => m.default)
  .filter((t): t is Topic => !!t && typeof t === 'object' && !!t.id)
  .sort((a, b) => phaseIndex(a.phase) - phaseIndex(b.phase) || a.order - b.order);

export const TOPIC_BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

/** exam question id → owning topic */
export const MCQ_TOPIC = new Map(TOPICS.flatMap((t) => t.test.map((q) => [q.id, t] as const)));

// coding problems live in coding/*.ts, each exporting `PROBLEMS: CodingProblem[]`
const codingModules = import.meta.glob<{ PROBLEMS: CodingProblem[] }>('./coding/*.ts', { eager: true });
const CATEGORY_ORDER = ['arrays', 'strings', 'objects', 'logic', 'async', 'qa-utils'];
const DIFF_ORDER = ['easy', 'medium', 'hard', 'expert'];

export const CODING_PROBLEMS: CodingProblem[] = Object.values(codingModules)
  .flatMap((m) => m.PROBLEMS ?? [])
  .sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      DIFF_ORDER.indexOf(a.difficulty) - DIFF_ORDER.indexOf(b.difficulty),
  );

export { PHASES };
