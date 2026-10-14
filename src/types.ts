// Content contract for every topic file in src/content/topics/*.ts
// Markdown fields support GitHub-flavored markdown (tables, lists, bold, inline code).
// Do NOT put fenced code blocks inside markdown — use the `code` arrays instead.

export type PhaseId =
  | 'manual-basics'
  | 'manual-advanced'
  | 'api-sql'
  | 'javascript'
  | 'pw-basics'
  | 'pw-framework'
  | 'interview';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CodeSnippet {
  /** prism language id: typescript | javascript | sql | bash | yaml | json | http | gherkin | text */
  language: string;
  title?: string;
  code: string;
}

export interface Section {
  heading: string;
  /** markdown */
  body: string;
  code?: CodeSnippet[];
  /** optional ASCII diagram rendered in monospace */
  diagram?: string;
  keyPoints?: string[];
  /** e.g. "Alex Xu Vol 2 — Ch 4 Distributed Message Queue" */
  source?: string;
}

/** "Improve this" exercise: buggy code / weak test case / weak bug report → strong version */
export interface CodeChallenge {
  id: string;
  title: string;
  context: string;
  task: string;
  starter: CodeSnippet;
  hints: string[];
  solution: CodeSnippet;
  /** markdown: why the solution is better */
  explanation: string;
  /** what the interviewer asks after you present the solution */
  followUps?: FollowUp[];
  /**
   * Auto-judged JavaScript labs: the function the learner fixes in `starter`, and the tests that
   * judge it. The reference `solution` must pass every test and the buggy `starter` must fail one.
   */
  fnName?: string;
  tests?: CodingTest[];
}

export interface FollowUp {
  q: string;
  a: string;
}

export interface InterviewQuestion {
  id: string;
  difficulty: Difficulty;
  question: string;
  /** optional scenario framing the interviewer gives */
  context?: string;
  whatInterviewerLooksFor: string[];
  /** markdown */
  modelAnswer: string;
  followUps: FollowUp[];
  pitfalls: string[];
}

export interface EnvelopeStep {
  label: string;
  calc: string;
}

/** A worked practice drill (shown as "Practice Drills"): e.g. derive BVA values, predict JS output,
 *  estimate suite runtime. `assumptions` are the givens, `steps` the worked solution, `insight` the takeaway. */
export interface EnvelopeQuestion {
  id: string;
  question: string;
  assumptions: string[];
  steps: EnvelopeStep[];
  answer: string;
  /** the design implication the numbers reveal */
  insight: string;
  /** "now what if…" probes on the estimate */
  followUps?: FollowUp[];
}

export interface MCQ {
  id: string;
  difficulty: Difficulty;
  question: string;
  code?: CodeSnippet;
  options: string[];
  /** indexes into options; more than one => "select all that apply" */
  correct: number[];
  explanation: string;
  /** what the interviewer asks next once you have answered */
  followUps?: FollowUp[];
}

export interface Topic {
  id: string;
  phase: PhaseId;
  /** ordering within the phase, 1-based */
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  sources: string[];
  tags: string[];
  /** 6–10 crisp bullets for last-minute revision */
  cheatSheet: string[];
  sections: Section[];
  codeChallenges: CodeChallenge[];
  interviewQuestions: InterviewQuestion[];
  envelopeQuestions: EnvelopeQuestion[];
  test: MCQ[];
}

// ---------- JavaScript coding practice (src/content/coding/*.ts) ----------

export interface CodingTest {
  /** arguments passed to the function, in order (JSON-serialisable) */
  args: unknown[];
  /** expected return value, compared with deep equality */
  expected: unknown;
  /** hidden tests are run on Submit but their values are not shown */
  hidden?: boolean;
}

export interface CodingProblem {
  id: string;
  category: 'arrays' | 'strings' | 'objects' | 'logic' | 'async' | 'qa-utils';
  difficulty: Difficulty;
  title: string;
  /** markdown problem statement with examples */
  prompt: string;
  /** name of the function the learner implements */
  fnName: string;
  /** starter code with the function signature */
  starter: string;
  tests: CodingTest[];
  hints: string[];
  solution: string;
  /** markdown: approach, complexity, alternative solutions, interview talking points */
  explanation: string;
  /** e.g. "Asked in QA automation interviews (reported on Glassdoor, 2025)" — never invented */
  askedIn?: string;
  followUps?: FollowUp[];
}
