// "Your next step": one obvious action for the learner, derived only from progress + content.
// Pure (no React, no storage) so it can be unit-tested with plain objects.
import type { Topic } from '../types';
import type { Progress } from './progress';
import { weakTopics } from './weak';

export type NextStepKind = 'start' | 'read' | 'labs' | 'interview' | 'drills' | 'exam' | 'practice' | 'revise';

export interface NextStep {
  title: string;
  /** one line on why this is the next thing to do */
  detail: string;
  href: string;
  kind: NextStepKind;
  topic?: Topic;
}

export interface NextStepResult extends NextStep {
  /** "or revise weak area: …" when the learner has weak spots */
  secondary?: NextStep;
}

export interface NextStepExtras {
  /** company questions: total and practised, for the "all passed" fallback */
  companyTotal?: number;
  /** solved JS coding problems out of this many */
  codingTotal?: number;
}

const passed = (p: Progress, id: string) => !!p.tests[id]?.passedAt;

function hasAnyProgress(p: Progress): boolean {
  return (
    Object.values(p.sections).some((s) => s.length > 0) ||
    Object.keys(p.tests).length > 0 ||
    Object.keys(p.iq).length > 0 ||
    Object.keys(p.boe).length > 0 ||
    Object.keys(p.cc).length > 0 ||
    Object.keys(p.code ?? {}).length > 0 ||
    Object.keys(p.company ?? {}).length > 0
  );
}

/** The single next action inside one topic, in study-loop order. */
export function topicNextStep(p: Progress, t: Topic): NextStep {
  const base = `/topic/${t.id}`;
  const read = new Set(p.sections[t.id] ?? []);
  const unread = t.sections.findIndex((_, i) => !read.has(i));
  if (unread >= 0) {
    return {
      kind: 'read',
      title: `Read §${unread + 1} ${t.sections[unread].heading}`,
      detail: `${t.title}: ${read.size}/${t.sections.length} sections read. Each section takes a few minutes; tick “Read” when done.`,
      href: `${base}?tab=learn&s=${unread}`,
      topic: t,
    };
  }
  const labsLeft = t.codeChallenges.filter((c) => !p.cc[c.id]).length;
  if (labsLeft > 0) {
    const name = t.id === 'qa-behavioral' ? 'Answer Lab' : 'Improve This labs';
    return {
      kind: 'labs',
      title: `Try the ${name} (${labsLeft} left)`,
      detail: `${t.title}: turn weak tests and buggy code into strong ones. Doing beats re-reading.`,
      href: `${base}?tab=code`,
      topic: t,
    };
  }
  const iqLeft = t.interviewQuestions.filter((q) => !p.iq[q.id]).length;
  if (iqLeft > 0) {
    return {
      kind: 'interview',
      title: `Practise interview questions (${iqLeft} left)`,
      detail: `${t.title}: answer out loud before revealing the model answer, then rate yourself.`,
      href: `${base}?tab=interview`,
      topic: t,
    };
  }
  const drillsLeft = t.envelopeQuestions.filter((q) => !p.boe[q.id]).length;
  if (drillsLeft > 0) {
    return {
      kind: 'drills',
      title: `Work through the drills (${drillsLeft} left)`,
      detail: `${t.title}: reveal one step at a time and check your working.`,
      href: `${base}?tab=envelope`,
      topic: t,
    };
  }
  const rec = p.tests[t.id];
  return {
    kind: 'exam',
    title: rec ? `Retake the exam: best ${rec.best}%` : `Take the exam (pass mark ${p.settings.passMark}%)`,
    detail: rec
      ? `${t.title}: you need ${p.settings.passMark}% to pass. Revise the sections you missed, then try again.`
      : `${t.title}: ${t.test.length} timed questions. Passing it marks the topic as done.`,
    href: `${base}?tab=exam`,
    topic: t,
  };
}

export function nextStep(p: Progress, topics: Topic[], extras: NextStepExtras = {}): NextStepResult {
  const weak = weakTopics(p, topics)[0];
  const secondary: NextStep | undefined = weak
    ? weak.sections[0]
      ? {
          kind: 'revise',
          title: `Revise weak area: ${weak.sections[0].heading}`,
          detail: `${weak.topic.title}: ${weak.sections[0].missed.length} exam question(s) missed here.`,
          href: `/topic/${weak.topic.id}?tab=learn&s=${weak.sections[0].index}`,
          topic: weak.topic,
        }
      : {
          kind: 'revise',
          title: `Revise weak area: ${weak.topic.title}`,
          detail: weak.shakyInterview
            ? `${weak.shakyInterview} interview question(s) rated partial or missed.`
            : `Best exam score so far ${weak.best}%.`,
          href: `/topic/${weak.topic.id}`,
          topic: weak.topic,
        }
    : undefined;

  const first = topics[0];
  if (first && !hasAnyProgress(p)) {
    return {
      kind: 'start',
      title: `Start Phase 1: ${first.title}`,
      detail: 'Begin with the first lesson. Every topic follows the same loop: learn, practise, then pass the exam.',
      href: `/topic/${first.id}?tab=learn&s=0`,
      topic: first,
    };
  }

  const current = topics.find((t) => !passed(p, t.id));
  if (current) return { ...topicNextStep(p, current), secondary };

  // every topic passed → point to the practice pages
  const companyLeft = (extras.companyTotal ?? 0) - Object.keys(p.company ?? {}).length;
  const codingLeft = (extras.codingTotal ?? 0) - Object.keys(p.code ?? {}).length;
  const practice: NextStep =
    companyLeft > 0
      ? {
          kind: 'practice',
          title: `Practise company interview questions (${companyLeft} left)`,
          detail: 'Every exam is passed. Rehearse questions candidates were really asked at named companies.',
          href: '/companies',
        }
      : codingLeft > 0
        ? {
            kind: 'practice',
            title: `Solve JS coding problems (${codingLeft} left)`,
            detail: 'Every exam is passed. Keep your JavaScript sharp for the live-coding round.',
            href: '/coding',
          }
        : {
            kind: 'practice',
            title: 'Catch every bug in the Playwright Lab',
            detail: 'Every exam is passed. Write real Playwright tests against an app with hidden bugs.',
            href: '/pw-lab',
          };
  return {
    ...practice,
    secondary: secondary ?? {
      kind: 'practice',
      title: 'Playwright Lab (Judge)',
      detail: 'Write real tests and see which hidden bugs they catch.',
      href: '/pw-lab',
    },
  };
}
