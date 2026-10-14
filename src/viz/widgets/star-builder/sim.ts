// Pure simulation of assembling a STAR (+ Learning) answer for a QA behavioural question, block
// by block, then reviewing it: vague vs specific phrases, "we" vs "I", and the ~2-minute time
// budget (S ~10%, T ~10%, A ~50–60%, R ~20%, L one line) from the qa-behavioral topic.
// Inline markup in the story text: {v:…} vague, {s:…} specific/quantified, {w:…} "we" where
// the interviewer needs "I". No React here.
import type { BaseFrame } from '../../core';

export type Story = 'missed' | 'conflict' | 'deadline';
export type Quality = 'weak' | 'strong';
export interface Params {
  story: Story;
  quality: Quality;
}
export const DEFAULT_PARAMS: Params = { story: 'missed', quality: 'strong' };

export type PartKey = 'S' | 'T' | 'A' | 'R' | 'L';
export const PART_NAME: Record<PartKey, string> = { S: 'Situation', T: 'Task', A: 'Action', R: 'Result', L: 'Learning' };
/** target seconds out of ~120 (S ~10%, T ~10%, A ~55%, R ~20%, L one line) */
export const TARGET: Record<PartKey, number> = { S: 12, T: 12, A: 66, R: 24, L: 6 };
export const KEYS: PartKey[] = ['S', 'T', 'A', 'R', 'L'];

export type SegKind = '' | 'v' | 's' | 'w';
export type Seg = [string, SegKind];
export interface Part {
  key: PartKey;
  sentences: string[];
  secs: number;
}

export const QUESTIONS: Record<Story, string> = {
  missed: 'Tell me about a bug you missed that reached production.',
  conflict: 'Tell me about a disagreement with a developer.',
  deadline: 'The release is tomorrow and testing is not finished. Tell me about a time that happened.',
};

const P = (key: PartKey, secs: number, ...sentences: string[]): Part => ({ key, secs, sentences });

export const STORIES: Record<Story, Record<Quality, Part[]>> = {
  missed: {
    strong: [
      P('S', 12, '{s:Release 4.2} of our e-commerce site: a customer reported that coupon discounts on {s:orders above 10,000} were off by a few rupees.'),
      P('T', 8, '{s:I owned checkout testing} for that release.'),
      P(
        'A',
        68,
        'I reproduced it {s:within an hour} with a {s:12,499 cart} and shared exact steps, data and the API response with the developer.',
        'I verified the hotfix and re-ran checkout regression {s:the same day}.',
        'Root cause on my side: {s:my coupon test data only used carts under 5,000}, so the rounding path for large totals never ran.',
        'I added {s:boundary-based coupon cases} (min, max cap, large totals) to the regression set.',
      ),
      P('R', 24, 'The hotfix went out {s:the same day}, and {s:the new cases run in every regression cycle} since.'),
      P('L', 8, 'I now derive test data from {s:boundaries and limits in the rules}, not from typical values.'),
    ],
    weak: [
      P('S', 45, 'So at my last company {v:we had a big project with lots of modules} and many releases, and one time {v:some customers had an issue} with coupons.'),
      P('T', 8, '{w:We were doing the testing}.'),
      P('A', 25, '{w:We checked it} and the developers fixed it.', 'After that {w:we} {v:tested a lot}.'),
      P('R', 7, '{v:It was fine after that}.'),
      P('L', 0),
    ],
  },
  conflict: {
    strong: [
      P('S', 13, '{s:Sprint 14}, checkout team: I logged a {s:High} bug that the coupon was lost after a {s:3-D Secure redirect}; the developer closed it as "works on my machine".'),
      P('T', 9, 'I needed it {s:fixed or consciously deferred before Friday\'s release}.'),
      P(
        'A',
        66,
        'I reproduced it on staging {s:three times} and attached a {s:HAR file and a screen recording}.',
        'I asked what differed on his machine: he tested {s:without the 3-D Secure sandbox}.',
        'I paired with him {s:for 20 minutes} on staging, and he saw it fail.',
        'I suggested we take the priority call {s:to triage with the PO} instead of arguing it between us.',
      ),
      P('R', 24, 'He fixed it {s:in the same sprint}, and the PO {s:added a 3-D Secure case to the acceptance criteria}.'),
      P('L', 8, 'I now attach {s:the HAR and environment details} to every payment bug up front.'),
    ],
    weak: [
      P('S', 40, 'There was a developer who {v:always rejected my bugs}; honestly {v:he was difficult to work with}.'),
      P('T', 8, 'I had to get my bug accepted.'),
      P('A', 22, 'I told him it was a real bug and {v:escalated it to my manager}.', '{v:Eventually} they agreed.'),
      P('R', 8, 'The bug got fixed {v:in the end}.'),
      P('L', 0),
    ],
  },
  deadline: {
    strong: [
      P('S', 12, '{s:Two days before release} the build arrived late, so our {s:two-day test window shrank to one day}.'),
      P('T', 12, 'As {s:the only tester} on the team, I had to decide what to test and tell the PO what would not be tested.'),
      P(
        'A',
        66,
        'I ranked by risk: {s:payment, coupon and login first}.',
        'I ran the {s:40-minute smoke}, then the {s:P1 and P2 cases}, and leaned on the automated regression suite.',
        'By {s:noon} I told the PO in writing: {s:P3 (about 40 cases: localisation and older browsers) will not be run}.',
        'I suggested shipping the new coupon flow {s:behind a feature flag}.',
      ),
      P('R', 22, 'We released {s:on time} with coupons behind the flag, and {s:no payment incident was reported} in the following month.'),
      P('L', 8, 'I now flag schedule risk {s:at the first slip}, not on release day.'),
    ],
    weak: [
      P('S', 38, '{w:We} had a {v:really tight deadline}; the release was {v:very important} and {v:everyone was stressed}.'),
      P('T', 8, '{w:We had to finish testing}.'),
      P('A', 20, 'I {v:worked all night} and {v:tested everything} as fast as I could.'),
      P('R', 6, '{w:We} released and {v:it was okay}.'),
      P('L', 0),
    ],
  },
};

/** parse {v:…} {s:…} {w:…} markup into segments */
export function parse(text: string): Seg[] {
  const out: Seg[] = [];
  const re = /\{([vsw]):([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push([text.slice(last, m.index), '']);
    out.push([m[2], m[1] as SegKind]);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push([text.slice(last), '']);
  return out;
}

export interface Frame extends BaseFrame {
  /** sentences shown per part (index matches KEYS) */
  shown: number[];
  focus: PartKey | null;
  /** colour vague/specific/we phrases */
  highlight: boolean;
  showTime: boolean;
  /** parts swapped for their strong rewrite (weak answers only) */
  fixed: PartKey[];
  /** seconds spoken so far */
  elapsed: number;
  verdict: string;
}

export function simulate(p: Params): Frame[] {
  const parts = STORIES[p.story][p.quality];
  const strong = p.quality === 'strong';
  const frames: Frame[] = [];
  const shown = KEYS.map(() => 0);
  let elapsed = 0;
  let highlight = false;
  let showTime = false;
  let verdict = '';
  const fixed: PartKey[] = [];
  const push = (caption: string, focus: PartKey | null, predict?: string) =>
    frames.push({ caption, predict, shown: [...shown], focus, highlight, showTime, fixed: [...fixed], elapsed, verdict });

  push(`Question: "${QUESTIONS[p.story]}" You have about two minutes. Watch the ${strong ? 'strong' : 'weak'} answer assemble block by block.`, null);

  const notes: Record<PartKey, string> = strong
    ? {
        S: 'Situation in one or two sentences: which product, which release, what was at stake. Short, with concrete anchors.',
        T: 'Task: what YOU were responsible for in that moment. One line.',
        A: '',
        R: 'Result with an observable outcome. Numbers only if they are real and defensible: a follow-up question will test them.',
        L: 'Learning: one line on what you do differently now. Interviewers remember this part.',
      }
    : {
        S: 'The context rambles: lots of words, no product, no release, no stakes the interviewer can picture.',
        T: '"We were doing the testing" hides the candidate. Whose task was it?',
        A: '',
        R: 'Result with nothing observable: what does "fine" mean? Nothing to remember.',
        L: 'No learning at all. The story ends without showing growth.',
      };

  parts.forEach((part, pi) => {
    if (part.key === 'A') {
      const before = elapsed;
      part.sentences.forEach((_, si) => {
        shown[pi] = si + 1;
        elapsed = before + Math.round((part.secs * (si + 1)) / part.sentences.length);
        push(
          si === 0
            ? strong
              ? 'Action, the biggest block (~50–60%): the steps I took, in order, with evidence. Say "I" for your actions.'
              : 'Action: the part that should carry the answer is two short lines, and the actor is "we".'
            : strong
              ? ['', 'Next step: what I did after the first move. Each sentence is a verb the interviewer can score.', 'Then the honest root cause and the trade-off. Owning it scores higher than defending it.', 'And the prevention or the option offered: this is what makes the story about judgement.'][si]
              : 'That is the whole Action block. Nothing an interviewer can verify or score.',
          'A',
        );
      });
      return;
    }
    shown[pi] = part.sentences.length;
    elapsed += part.secs;
    push(
      notes[part.key],
      part.key,
      part.key === 'T' ? 'Which STAR block should take the most of the two minutes, and roughly how much?' : undefined,
    );
  });

  if (!strong) {
    push('Interviewer follow-up: "What did YOU do, specifically?" A weak answer invites probing, and the second attempt is under more pressure.', null, 'Which phrases in this answer would an interviewer mark down?');
  }

  highlight = true;
  const segs = parts.flatMap((pt) => pt.sentences.flatMap(parse));
  const vague = segs.filter((s) => s[1] === 'v').length;
  const specific = segs.filter((s) => s[1] === 's').length;
  const we = segs.filter((s) => s[1] === 'w').length;
  push(
    strong
      ? `Review: ${specific} specific, checkable details (release, numbers, tools, people) and 0 vague phrases. Every action starts with "I".`
      : `Review: ${vague} vague phrase${vague === 1 ? '' : 's'} (red)${we ? ` and ${we} "we" where the interviewer needs "I" (amber)` : ', and blame instead of evidence'}. No specific detail to check.`,
    null,
    strong ? 'Specifics look good. Now: does the time split match the STAR budget?' : undefined,
  );
  showTime = true;
  const a = parts.find((pt) => pt.key === 'A')!.secs;
  const s = parts.find((pt) => pt.key === 'S')!.secs;
  push(
    strong
      ? `Time budget: ${elapsed} s in total, Action ${Math.round((a / elapsed) * 100)}%. Context is short, Action dominates, Result and Learning are clear.`
      : `Time budget: ${elapsed} s, but Situation took ${s} s (${Math.round((s / elapsed) * 100)}%) while Action got ${a} s. The proportions are upside down.`,
    null,
  );
  if (!strong) {
    const good = STORIES[p.story].strong;
    const si = KEYS.indexOf('S');
    fixed.push('S');
    shown[si] = good[si].sentences.length;
    push(`Rewrite the Situation: ${good[si].secs} s of concrete context instead of ${s} s of scene-setting.`, 'S');
    for (const k of ['A', 'R', 'L'] as PartKey[]) {
      fixed.push(k);
      shown[KEYS.indexOf(k)] = good[KEYS.indexOf(k)].sentences.length;
    }
    push('Rewrite Action, Result and Learning: "I" + verbs + evidence, an observable outcome, one learning. Same story, now scoreable.', 'A');
  }
  verdict = strong ? 'Scores well: clear ownership, evidence, outcome, learning' : `Scores low: vague${we ? ', "we" not "I"' : ''}, thin Action, no learning`;
  push(
    strong
      ? 'Verdict: this answer can be bent to other questions too (attention to detail, ownership, learning from mistakes). Keep 6–8 stories like it in your bank.'
      : 'Verdict: rebuild it with the STAR budget. Cut the Situation to two lines, list your own actions with evidence, end with a real result and one learning. Switch to "strong" to compare.',
    null,
  );
  return frames;
}
