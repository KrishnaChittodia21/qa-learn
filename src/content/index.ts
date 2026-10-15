import type { CodingProblem, CompanyQuestion, Topic } from '../types';
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

// company-reported questions live in company/*.ts, each exporting `QUESTIONS: CompanyQuestion[]`
const companyModules = import.meta.glob<{ QUESTIONS: CompanyQuestion[] }>('./company/*.ts', { eager: true });
export const COMPANY_QUESTIONS: CompanyQuestion[] = Object.values(companyModules)
  .flatMap((m) => m.QUESTIONS ?? [])
  .sort((a, b) => a.company.localeCompare(b.company) || b.source.year - a.source.year);

/** topic id → company questions taught there */
export const COMPANY_BY_TOPIC = COMPANY_QUESTIONS.reduce((m, q) => {
  if (q.topic) m.set(q.topic, [...(m.get(q.topic) ?? []), q]);
  return m;
}, new Map<string, CompanyQuestion[]>());
// the manual interview bank revises every manual topic, so it collects all manual and scenario questions
COMPANY_BY_TOPIC.set(
  'qa-manual-bank',
  COMPANY_QUESTIONS.filter((q) => q.area === 'manual' || q.area === 'scenario'),
);

export { PHASES };
