// Splits content into what the UI may ship and the answer key qa-api keeps (milestone M1).
// Used by the split build (vite.config.ts), the bundle check and the answer-key sync (api/).
// Adapted from system-design-learn's scripts/content-split.ts.
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { CodingProblem, CompanyQuestion, Topic } from '../src/types.ts';

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '../src/content');

/** Fields that only appear after an attempt. They leave the UI bundle and live in `answer_keys`. */
export const ANSWER_FIELDS = {
  codeChallenges: { kind: 'challenge', fields: ['solution', 'explanation', 'followUps'] },
  interviewQuestions: { kind: 'interview', fields: ['whatInterviewerLooksFor', 'modelAnswer', 'followUps', 'pitfalls'] },
  envelopeQuestions: { kind: 'drill', fields: ['assumptions', 'steps', 'answer', 'insight', 'followUps'] },
  test: { kind: 'mcq', fields: ['correct', 'explanation', 'followUps'] },
} as const;

// shortcut: coding tests (hidden ones included) stay public because the judge runs in the browser; moving them
// needs server-side judging in a sandbox, decide that before hidden tests matter
const CODING_ANSWER = ['solution', 'explanation', 'followUps'] as const;
const COMPANY_ANSWER = ['answer', 'followUps'] as const;

type Doc = Record<string, unknown>;
export interface KeyDoc extends Doc {
  _id: string;
  contentHash: string;
}

const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 16);
const pick = (o: Doc, keys: readonly string[]) => Object.fromEntries(keys.filter((k) => k in o).map((k) => [k, o[k]]));
const omit = (o: Doc, keys: readonly string[]) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

/** What the UI may know before an attempt: it already shows these ("select all that apply", "3 assumptions"). */
function publicHints(list: string, q: Doc): Doc {
  if (list === 'test') return { multi: (q.correct as unknown[]).length > 1 };
  if (list === 'envelopeQuestions') return { assumptionCount: (q.assumptions as unknown[]).length, stepCount: (q.steps as unknown[]).length };
  return {};
}

export function splitTopic(topic: Topic) {
  const t = topic as unknown as Doc;
  const publicTopic: Doc = { ...t };
  const keys: KeyDoc[] = [];
  for (const [list, { kind, fields }] of Object.entries(ANSWER_FIELDS)) {
    const items = (t[list] ?? []) as Doc[];
    publicTopic[list] = items.map((q) => ({ ...omit(q, fields), ...publicHints(list, q) }));
    for (const q of items) {
      const answer = pick(q, fields);
      keys.push({ _id: q.id as string, topicId: topic.id, kind, ...answer, contentHash: hash(answer) });
    }
  }
  return { publicTopic, keys };
}

export function splitCoding(problems: CodingProblem[]) {
  const ps = problems as unknown as Doc[];
  return {
    publicProblems: ps.map((p) => omit(p, CODING_ANSWER)),
    docs: ps.map((p) => {
      const answer = pick(p, CODING_ANSWER);
      return { _id: p.id as string, ...answer, contentHash: hash(answer) } as KeyDoc;
    }),
  };
}

export function splitCompanyQuestions(questions: CompanyQuestion[]) {
  const qs = questions as unknown as Doc[];
  return {
    publicQuestions: qs.map((q) => omit(q, COMPANY_ANSWER)),
    docs: qs.map((q) => {
      const answer = pick(q, COMPANY_ANSWER);
      return { _id: q.id as string, topicId: q.topic, ...answer, contentHash: hash(answer) } as KeyDoc;
    }),
  };
}

const importAll = async <T>(dir: string, pick: (m: Doc) => T[]) => {
  const out: T[] = [];
  for (const f of readdirSync(join(CONTENT, dir)).filter((f) => f.endsWith('.ts')).sort()) {
    out.push(...pick(await import(pathToFileURL(join(CONTENT, dir, f)).href)));
  }
  return out;
};

export async function loadContent() {
  return {
    topics: await importAll<Topic>('topics', (m) => (m.default ? [m.default as Topic] : [])),
    coding: await importAll<CodingProblem>('coding', (m) => (m.PROBLEMS as CodingProblem[]) ?? []),
    companyQuestions: await importAll<CompanyQuestion>('company', (m) => (m.QUESTIONS as CompanyQuestion[]) ?? []),
  };
}

/** Everything qa-api keeps, built from `src/content`: one list per collection. */
export async function buildAnswerKey() {
  const { topics, coding, companyQuestions } = await loadContent();
  return {
    answer_keys: topics.flatMap((t) => splitTopic(t).keys),
    coding_solutions: splitCoding(coding).docs,
    company_questions: splitCompanyQuestions(companyQuestions).docs,
  };
}
