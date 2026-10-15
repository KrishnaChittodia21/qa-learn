// The study loop every topic follows, shared by the Study path stepper, the welcome tour,
// coach tips, the Contents page and the command palette. Tab ids match `?tab=` in URLs.
import { BookOpen, Building2, ClipboardCheck, Dumbbell, FileText, MessagesSquare, Wrench, type LucideIcon } from 'lucide-react';
import type { Topic } from '../types';
import type { Progress } from './progress';
import { COMPANY_BY_TOPIC } from '../content';

export type TabId = 'learn' | 'code' | 'interview' | 'envelope' | 'cheat' | 'exam' | 'company';

export interface TabMeta {
  id: TabId;
  label: string;
  icon: LucideIcon;
  /** one line on why this step matters (tour + stepper tooltips) */
  why: string;
  /** coach tip shown the first time a learner opens this tab */
  tip: string;
}

export const TAB_META: Record<TabId, TabMeta> = {
  learn: {
    id: 'learn',
    label: 'Learn',
    icon: BookOpen,
    why: 'Read the short sections and play with the animations.',
    tip: 'Read one section at a time and tick “Read” when you finish it. The ✓ marks drive your progress and unlock the exam.',
  },
  code: {
    id: 'code',
    label: 'Improve This',
    icon: Wrench,
    why: 'Fix weak tests and buggy code: doing beats re-reading.',
    tip: 'Edit the starter in place (it saves as you type). Use hints one at a time, then compare with the reference solution and mark it done.',
  },
  interview: {
    id: 'interview',
    label: 'Interview Qs',
    icon: MessagesSquare,
    why: 'Answer out loud, compare with a model answer, rate yourself.',
    tip: 'Draft your answer before revealing anything. Then rate yourself honestly: shaky answers show up in Weak Areas.',
  },
  envelope: {
    id: 'envelope',
    label: 'Practice Drills',
    icon: Dumbbell,
    why: 'Worked problems revealed one step at a time.',
    tip: 'Try the drill in the box first, then reveal the givens and each step to check your working.',
  },
  cheat: {
    id: 'cheat',
    label: 'Cheat Sheet',
    icon: FileText,
    why: 'Last-minute revision bullets.',
    tip: 'A one-screen summary of the topic. Skim it right before the exam or an interview.',
  },
  exam: {
    id: 'exam',
    label: 'Exam',
    icon: ClipboardCheck,
    why: 'A timed exam: passing it marks the topic as done.',
    tip: 'Timed, scenario-based questions. Passing marks the topic done; every miss is mapped to the section to revise.',
  },
  company: {
    id: 'company',
    label: 'Company Qs',
    icon: Building2,
    why: 'Questions candidates were really asked at named companies.',
    tip: 'Real reported questions on this topic. Try each one out loud, then reveal our answer and its source.',
  },
};

/** Tab label, with the behavioural topic's "Answer Lab" wording. */
export function tabLabel(topic: Topic, id: TabId) {
  return id === 'code' && topic.id === 'qa-behavioral' ? 'Answer Lab' : TAB_META[id].label;
}

/** The study loop in order (Cheat Sheet sits beside it, not in it). */
export function loopTabs(topic: Topic): TabId[] {
  const ids: TabId[] = ['learn'];
  if (topic.codeChallenges.length) ids.push('code');
  if (topic.interviewQuestions.length) ids.push('interview');
  if (topic.envelopeQuestions.length) ids.push('envelope');
  ids.push('exam');
  if (COMPANY_BY_TOPIC.get(topic.id)?.length) ids.push('company');
  return ids;
}

export interface StepProgress {
  done: number;
  total: number;
  complete: boolean;
  /** short text such as "3/8" or "best 80%" */
  text: string;
}

export function stepProgress(p: Progress, topic: Topic, id: TabId): StepProgress {
  const frac = (done: number, total: number): StepProgress => ({ done, total, complete: total > 0 && done >= total, text: `${done}/${total}` });
  switch (id) {
    case 'learn':
      return frac((p.sections[topic.id] ?? []).filter((i) => i < topic.sections.length).length, topic.sections.length);
    case 'code':
      return frac(topic.codeChallenges.filter((c) => p.cc[c.id]).length, topic.codeChallenges.length);
    case 'interview':
      return frac(topic.interviewQuestions.filter((q) => p.iq[q.id]).length, topic.interviewQuestions.length);
    case 'envelope':
      return frac(topic.envelopeQuestions.filter((q) => p.boe[q.id]).length, topic.envelopeQuestions.length);
    case 'exam': {
      const rec = p.tests[topic.id];
      return { done: rec?.best ?? 0, total: 100, complete: !!rec?.passedAt, text: rec ? `best ${rec.best}%` : 'not taken' };
    }
    case 'company': {
      const qs = COMPANY_BY_TOPIC.get(topic.id) ?? [];
      return frac(qs.filter((q) => p.company[q.id]).length, qs.length);
    }
    default:
      return { done: 0, total: 0, complete: false, text: '' };
  }
}
