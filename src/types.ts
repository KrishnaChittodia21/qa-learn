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
  | 'ai-testing'
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
  /** M8: deeper material kept out of the main text (edge cases, real projects, follow-ups) and further reading */
  learnMore?: LearnMore;
  /** M8: the section as small animated steps, shown when the reader picks Steps over Read */
  steps?: StepLesson;
}

export interface LearnMore {
  /** markdown */
  body: string;
  links?: { name: string; url: string; what: string }[];
}

/** "Improve this" exercise: buggy code / weak test case / weak bug report → strong version */
export interface CodeChallenge {
  id: string;
  title: string;
  context: string;
  task: string;
  starter: CodeSnippet;
  hints: string[];
  // answer fields are optional in the type for older content; every shipped item has them
  solution?: CodeSnippet;
  /** markdown: why the solution is better */
  explanation?: string;
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
  whatInterviewerLooksFor?: string[];
  /** markdown */
  modelAnswer?: string;
  followUps?: FollowUp[];
  pitfalls?: string[];
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
  assumptions?: string[];
  steps?: EnvelopeStep[];
  answer?: string;
  /** the design implication the numbers reveal */
  insight?: string;
  /** "now what if…" probes on the estimate */
  followUps?: FollowUp[];
  /** public hints in the app's build, where the working itself is left out */
  assumptionCount?: number;
  stepCount?: number;
}

export interface MCQ {
  id: string;
  difficulty: Difficulty;
  question: string;
  code?: CodeSnippet;
  options: string[];
  /** indexes into options; more than one => "select all that apply" */
  correct?: number[];
  explanation?: string;
  /** what the interviewer asks next once you have answered */
  followUps?: FollowUp[];
  /** public hint in the app's build: "select all that apply" without saying which */
  multi?: boolean;
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
  solution?: string;
  /** markdown: approach, complexity, alternative solutions, interview talking points */
  explanation?: string;
  /** e.g. "Asked in QA automation interviews (reported on Glassdoor, 2025)" — never invented */
  askedIn?: string;
  followUps?: FollowUp[];
}

// ---------- Company-reported interview questions (src/content/company/*.ts) ----------

export type CompanyArea =
  | 'manual'
  | 'scenario'
  | 'api'
  | 'sql'
  | 'javascript'
  | 'playwright'
  | 'automation'
  | 'ai'
  | 'behavioral';

export interface CompanySource {
  /** e.g. "GeeksforGeeks — Infosys QA interview experience" */
  name: string;
  /** a page that was actually opened and that reports this question at this company */
  url: string;
  /** year the interview was reported, e.g. 2025 */
  year: number;
}

export interface CompanyQuestion {
  id: string;
  /** company name exactly as the source reports it, e.g. "Infosys", "Amazon" */
  company: string;
  area: CompanyArea;
  /** role the source mentions, e.g. "QA Engineer", "SDET-1", "Test Engineer" */
  role?: string;
  /** round the source mentions, e.g. "Technical round 1", "Managerial" */
  round?: string;
  difficulty: Difficulty;
  /** the question as asked, rewritten in our own words */
  question: string;
  /** markdown: a strong, concise answer */
  answer?: string;
  followUps?: FollowUp[];
  /** topic id where this is taught (gets a "Company Qs" tab entry) */
  topic?: string;
  source: CompanySource;
}

// ---------- Shorts (M7) ----------
// Text fields are plain text with two marks: *gradient words* in `head`, **bold** in `sub`.

export interface ShortStat {
  /** a number counts up from 0; a string ("$440M") is shown as is */
  value: number | string;
  label: string;
}

interface BeatBase {
  /** small caps line above the headline, e.g. "1996 · Kourou" */
  kicker: string;
  head?: string;
  sub?: string;
  stats?: ShortStat[];
  /** override the reading time the player works out from the words */
  seconds?: number;
}

export type ShortBeat =
  | (BeatBase & { type: 'counter'; value: number; decimals?: number; suffix?: string; unit: string })
  | (BeatBase & { type: 'spike'; head: string; mark: string })
  | (BeatBase & { type: 'race'; head: string; lanes: { label: string; seconds: number; after?: number; tone: 'rose' | 'blue' | 'cyan' | 'amber' | 'green' }[] })
  | (BeatBase & { type: 'grid'; head: string; cells: number; caption: string })
  | (BeatBase & { type: 'ladder'; head: string; rungs: { label: string; amount: number }[]; unit: string })
  | (BeatBase & { type: 'toggles'; head: string; items: { label: string; keep?: boolean }[]; keepLabel?: string })
  | (BeatBase & { type: 'flow'; head: string; steps: string[]; broken?: number })
  | (BeatBase & { type: 'quiz'; head: string; options: { text: string; why: string }[]; answer: number });

/** A ~90-second animated story attached to one lesson section (src/content/shorts.ts). */
export interface Short {
  /** unique, kebab-case (it is the URL: #/short/<id>) */
  id: string;
  title: string;
  /** the topic it belongs to and the section heading it tells (the heading must START with this text) */
  topic: string;
  heading: string;
  tags: string[];
  beats: ShortBeat[];
  /** the end card: the one idea to keep */
  takeaway: { head: string; sub: string };
}

// ---------- Step lessons (M8) ----------
// Adapted from system-design-learn (its M11). Text fields are plain text with two marks: **bold** and `code`.
export type StepTone = 'req' | 'ok' | 'miss' | 'del' | 'err';

export interface StepActor {
  id: string;
  label: string;
  sub?: string;
  /** centre, in the 900×300 stage */
  x: number;
  y: number;
  /** starts hidden; a `show` action brings it in */
  hidden?: boolean;
}

/** One move on the stage. A Watch step plays a list of these, looping like a GIF. */
export type StepAction =
  /** light up explanation line n (0-based); earlier lines turn "done" */
  | { say: number }
  /** a packet travels between two actors; `curve` arcs over the middle (e.g. the app reading the database itself), `count` sends several staggered */
  | { send: [from: string, to: string]; label?: string; tone?: StepTone; curve?: boolean; count?: number }
  /** a pill above an actor for a moment */
  | { badge: string; text: string; tone?: StepTone; ms?: number }
  | { lit: string; on?: boolean }
  /** an actor goes grey (switched off) */
  | { down: string; on?: boolean }
  | { show: string; on?: boolean }
  /** the keys shown under the scene's `keysUnder` actor; `gone` keys are drawn as deleted */
  | { keys: { key: string; note?: string; gone?: boolean }[] }
  | { wait: number }
  | SceneAction;

/** a number that counts up from `from` (default 0) to `to` */
export interface SceneNumber {
  to: number;
  from?: number;
  digits?: number;
  prefix?: string;
  unit?: string;
  l?: string;
  tone?: StepTone;
}

/** A scene replaces the actor boxes while its step plays (components/steps/scenes.ts); a new scene replaces the last. */
export type SceneAction =
  /** chips (a value with a small label) and operators arrive one by one, then the result counts up */
  | { eq: ({ v: string; l?: string; tone?: StepTone } | { op: string })[]; result?: SceneNumber }
  | { count: SceneNumber }
  /** horizontal bars; `log` for values spanning powers of ten; `limit` draws a capacity line */
  | { bars: { l: string; v: number; text?: string; tone?: StepTone }[]; log?: boolean; unit?: string; limit?: { v: number; l: string } }
  /** a line that draws itself (e.g. traffic over a day), then horizontal marks (average, peak) */
  | { curve: number[]; marks?: { v: number; l: string; tone?: StepTone }[]; x?: [string, string]; peak?: string }
  /** a grid of `dots` where the first `on` light up */
  | { dots: number; on: number; l: string; tone?: StepTone }
  /** a log time axis from 1 ns to 1 s; `s` is seconds */
  | { ladder: { l: string; s: number; tone?: StepTone }[] }
  /** capacity bars that fill to v/max and turn red at `warn` (a fraction) */
  | { meter: { l: string; v: number; max: number; unit: string; warn?: number; digits?: number }[] }
  /** a sequence diagram: lanes across the top, messages one by one down the page; from === to is a note on that lane */
  | { seq: { lanes: string[]; msgs: { from: number; to: number; l: string; tone?: StepTone; wait?: number }[] } }
  /** a small table whose rows arrive one by one; `tones` highlights rows, `strike` crosses them out */
  | { table: { cols: string[]; rows: string[][]; tones?: (StepTone | null)[]; strike?: number[]; l?: string } }
  /** consistent hashing: nodes and keys at angles (0–359°, clockwise from the top); `add` joins a node and moves only its keys */
  | { ring: { nodes: { l: string; at: number }[]; keys: { l: string; at: number }[]; add?: { l: string; at: number } } };

/** A Your-turn task. Every task has buttons, so it works without the diagram (keyboard, screen readers, phones). */
export type StepTask =
  /** click an actor on the diagram (or its button) */
  | { type: 'pick'; question: string; answer: string; hints: Record<string, string> }
  /** one of a few options; `why` explains a wrong pick */
  | { type: 'choose'; question: string; options: { text: string; why?: string }[]; answer: number }
  | { type: 'number'; question: string; options: number[]; answer: number; hint: string }
  /** tap the items in the right order (`items` is the right order; they are shown shuffled) */
  | { type: 'order'; question: string; items: string[]; hint: string }
  /** build a value from parts: like order, but the parts fill labelled slots joined by `join` */
  | { type: 'build'; question: string; parts: { text: string; label: string }[]; join: string; hint: string }
  /** drag until the chart is calm; `model` names a built-in chart */
  | { type: 'slider'; question: string; model: 'ttl-jitter' | 'hit-ratio' | 'availability'; label: string; min: number; max: number; unit: string }
  /** switch an actor off, then send a request and watch what happens */
  | { type: 'break'; question: string; actor: string; offLabel: string; sendLabel: string }
  /** type a number (2.3K, 2300, 2.3e3, 10^5 all work); right when within `within`× of the answer */
  | { type: 'estimate'; question: string; answer: number; within: number; unit: string; hint: string }
  /** drag how many units to provision: right when count × per covers `need` without passing need × slack (default 1.5) */
  | { type: 'dial'; question: string; label: string; min: number; max: number; step?: number; per: number; need: number; unit: string; capUnit: string; slack?: number };

interface StepBase {
  title: string;
  /** the explanation beside the diagram, one idea per line */
  lines: string[];
}

export type Step =
  | (StepBase & { kind: 'watch'; script: StepAction[] })
  /** `then` plays (looping) once the task is solved; `solved` is the one-line takeaway */
  | (StepBase & { kind: 'turn'; task: StepTask; solved: string; setup?: StepAction[]; then?: StepAction[] });

export interface StepLesson {
  actors: StepActor[];
  /** the actor whose stored keys are drawn under it (e.g. the cache) */
  keysUnder?: string;
  steps: Step[];
}
