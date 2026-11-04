// Steps for every Learn section (Read · Steps): a section without a hand-written step lesson gets one generated from its
// own content. Its text becomes short Watch steps whose box shows pictures only (an icon per line, the words stay in the lines), the topic's exam
// questions that map to the section become Your-turn questions, and the key points close it as a recap.
// Hand-written lessons (`section.steps`) always win. Pure apart from a small cache; tests/autoSteps.test.ts checks every
// generated lesson against the same rules the hand-written ones must pass.
import type { MCQ, Section, Step, StepAction, StepLesson, StepTone, Topic } from '../types';
import { sectionForQuestion } from './weak';

/** lines per Watch step (the validator allows 1–5) */
const LINES = 4;
/** Watch steps from the text, before the questions and the recap */
const MAX_TEXT_STEPS = 10;
const MAX_TURNS = 3;
/** table rows per step */
const TABLE_ROWS = 6;

/** markdown down to the two marks the player renders: **bold** and `code` */
export function plainLine(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1$2')
    .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, '$1$2')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const sentences = (para: string) =>
  plainLine(para)
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“`*(])/)
    .map((x) => x.trim())
    .filter(Boolean);

type Block = { kind: 'text'; lines: string[]; title?: string; list?: boolean; ordered?: boolean } | { kind: 'table'; cols: string[]; rows: string[][] };

/** the section body as blocks: paragraphs and lists become lines, tables stay tables; code fences are left to Read */
function blocks(body: string): Block[] {
  const out: Block[] = [];
  const lines = body.split('\n');
  let i = 0;
  let sawCode = false;
  while (i < lines.length) {
    const ln = lines[i];
    if (/^\s*```/.test(ln)) {
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) i++;
      i++;
      sawCode = true;
      continue;
    }
    if (/^\s*\|/.test(ln)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => plainLine(c));
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c.replace(/\s/g, '')))) rows.push(cells);
        i++;
      }
      if (rows.length > 1) out.push({ kind: 'table', cols: rows[0], rows: rows.slice(1) });
      continue;
    }
    if (!ln.trim()) {
      i++;
      continue;
    }
    // a paragraph or a list: gather until a blank line, a table or a fence
    const chunk: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^\s*(\||```)/.test(lines[i])) chunk.push(lines[i++]);
    const isList = chunk.every((c, k) => /^\s*([-*]|\d+\.)\s+/.test(c) || (k > 0 && /^\s{2,}/.test(c)));
    const raw = isList ? chunk.filter((c) => /^\s*([-*]|\d+\.)\s+/.test(c)).map((c) => c.replace(/^\s*([-*]|\d+\.)\s+/, '')) : [chunk.join(' ')];
    // a leading "**Label:**" names the step
    const lead = raw[0].match(/^\*\*([^*]{2,60}?):?\*\*:?\s*/);
    const title = lead ? lead[1].replace(/:$/, '') : undefined;
    const text = isList ? raw.map((r) => plainLine(r)) : sentences(raw[0]);
    if (text.length) out.push({ kind: 'text', lines: text, title, list: isList, ordered: isList && /^\s*\d+\./.test(chunk[0]) });
  }
  if (sawCode) out.push({ kind: 'text', lines: ['This part has a code example: switch to **Read** to see it in full.'] });
  return out;
}

const titleOf = (heading: string) => heading.split(/:\s|\s\(/)[0].trim();

// ---- pictures: each line gets an icon from what it says (glyphs.ts has the drawings) ----
const ICONS: [RegExp, string][] = [
  [/\bbugs?\b|defect|fault/i, 'bug'],
  [/\bfail|crash|broken|\berrors?\b/i, 'circle-x'],
  [/\bpass(es|ed)?\b|success|\bcorrect\b|\bvalid\b/i, 'circle-check'],
  [/log ?in|sign in|password|credential|\bauth/i, 'log-in'],
  [/\bai\b|llm|\bmodel\b|prompt|chatbot|\bbot\b|hallucinat/i, 'bot'],
  [/database|\bsql\b|query|join|\btables?\b|\brows?\b/i, 'database'],
  [/\bapis?\b|endpoint|request|response|\bhttp|\bserver|status code/i, 'server'],
  [/browser|\bpages?\b|\bweb\b|website|\burl\b|\bui\b/i, 'globe'],
  [/mobile|phone|\bios\b|android/i, 'smartphone'],
  [/time ?out|\bwait|second|minute|delay|slow/i, 'timer'],
  [/secur|token|secret|encrypt|inject/i, 'shield-check'],
  [/\block|permission|access|role/i, 'lock'],
  [/warn|\brisk|danger|careful|caution/i, 'triangle-alert'],
  [/report|document|spec(ification)?\b|requirement|\bplan\b|strategy/i, 'file-text'],
  [/test cases?|checklist|scenario|charter/i, 'clipboard-list'],
  [/assert|expect|verif|confirm|\bcheck/i, 'square-check-big'],
  [/\bcode\b|function|javascript|\bjs\b|variable|typescript|\bclass\b|object/i, 'code'],
  [/terminal|command|\bcli\b|\bnpm\b|\bnode\b/i, 'terminal'],
  [/locator|selector|search|\bfind/i, 'search'],
  [/visible|\bsee\b|\bview|look|watch/i, 'eye'],
  [/\bgoals?\b|\baim\b|focus|target|purpose/i, 'target'],
  [/perform|\bspeed|\bfast|\bload\b|latency/i, 'gauge'],
  [/\bgit\b|branch|merge|commit|pull request/i, 'git-branch'],
  [/release|deploy|launch|\bship|production/i, 'rocket'],
  [/install|package|dependenc|\bbuild/i, 'package'],
  [/config|setting|option|environment/i, 'settings'],
  [/retr(y|ies)|\bagain\b|repeat|regression|re-?run/i, 'repeat'],
  [/\blevels?\b|layer|pyramid|\bstack/i, 'layers'],
  [/network|integrat|connect|service/i, 'network'],
  [/pipeline|\bci\b|workflow|automat/i, 'workflow'],
  [/\bidea\b|\btip\b|remember|intuition/i, 'lightbulb'],
  [/learn|\bread\b|\bbook|study|course/i, 'book-open'],
  [/interview|question|\bask\b|chat|message|communicat|feedback/i, 'message-square'],
  [/e-?mail/i, 'mail'],
  [/\bpay|\bcard\b|checkout|coupon/i, 'credit-card'],
  [/\bcart\b|\bshop|product|\border(s)?\b/i, 'shopping-cart'],
  [/money|\bcost|price|budget|revenue/i, 'banknote'],
  [/improv|grow|increase|trend|better/i, 'trending-up'],
  [/metric|chart|count|number|percent|%|coverage|score/i, 'chart-column'],
  [/\bdates?\b|\bdays?\b|week|schedule|sprint|deadline/i, 'calendar'],
  [/\bfix|repair|debug|\btools?\b/i, 'wrench'],
  [/click|button|\btap\b/i, 'mouse-pointer-click'],
  [/\btype\b|input|field|\bforms?\b|keyboard/i, 'keyboard'],
  [/screenshot|image|visual|video|trace/i, 'image'],
  [/compare|\bvs\b|versus|balance|trade-?off|differ/i, 'scale'],
  [/filter|narrow/i, 'funnel'],
  [/\border\b|sequence|\bsteps?\b|first|then|next/i, 'list-ordered'],
  [/priorit|important|critical|severity|\bflag/i, 'flag'],
  [/fixture|hook|setup|teardown/i, 'puzzle'],
  [/user|customer|\bperson|people|tester|developer|\bteam|manager|\bpo\b|stakeholder/i, 'users'],
  [/data\b|dataset|json|csv/i, 'table'],
  [/award|\bbest\b|\bwin|achiev|goal/i, 'trophy'],
  [/think|reason|understand|knowledge|brain/i, 'brain'],
  [/\brules?\b|standard|principle|law/i, 'scale'],
  [/link|depend|relat/i, 'link'],
  [/\brun\b|execut|play/i, 'play'],
  [/\btests?\b|testing|experiment|\blab\b/i, 'flask-conical'],
];
const FALLBACK = ['sparkles', 'lightbulb', 'target', 'puzzle', 'zap', 'book-open'];

/** an icon for a line; skips icons already used in the same picture so every tile differs */
export function iconFor(text: string, used: Set<string> = new Set()): string {
  for (const [re, icon] of ICONS) if (!used.has(icon) && re.test(text)) return icon;
  return FALLBACK.find((f) => !used.has(f)) ?? 'sparkles';
}
const toneFor = (text: string): StepTone | undefined =>
  /\bfail|\bbugs?\b|defect|\berror|wrong|crash|missing|broken|\bnot\b|never|avoid|mistake|\bbad\b|flaky/i.test(text)
    ? 'err'
    : /\bpass(es|ed)?\b|\bcorrect\b|\bvalid\b|success|\bfixed\b|\bgood\b|\bbest\b|green/i.test(text)
      ? 'ok'
      : undefined;

/** the icons for a list of lines, all different */
function tilesFor(lns: string[]) {
  const used = new Set<string>();
  return lns.slice(0, 8).map((l) => {
    const icon = iconFor(l, used);
    used.add(icon);
    return { icon, tone: toneFor(l) };
  });
}

/** words in a title or text that mean the list is a sequence */
const ORDERED = /\b(process|steps?|phases?|life ?cycle|workflow|order|flow|pipeline|stlc|sdlc|stages?|how to|sequence|first|then)\b|→/i;

type Kind = 'para' | 'list' | 'ordered' | 'rows';

/** a Watch step whose picture builds up line by line: the scene is redrawn per line with `at` moving on */
function watch(title: string, lns: string[], scene: (at: number) => StepAction): Step {
  return { kind: 'watch', title, lines: lns, script: lns.flatMap((_, k) => [{ say: k }, scene(k), { wait: 1400 }]) };
}

type Style = Extract<StepAction, { glyphs: unknown }>['glyphs']['layout'];
/** words that call for a particular machine */
const STYLE_RULES: [RegExp, Style][] = [
  [/compar|\bvs\.?\b|versus|differ|trade-?off|\bpros\b|\bcons\b|balance|\bagainst\b/i, 'balance'],
  [/filter|narrow|triage|prioriti|select|choos|\bsort/i, 'funnel'],
  [/\blevels?\b|layer|pyramid|\bstack|\btiers?\b|foundation|matur/i, 'tower'],
  [/\bfind|search|locat|explor|inspect|detect|discover|\bscan|investigat|\bhunt/i, 'radar'],
  [/\bcause|leads? to|\bresult|\bchain|because|trigger|→|so that|\bimpact/i, 'dominoes'],
];
const BY_KIND: Record<Kind, Style[]> = {
  ordered: ['conveyor', 'dominoes', 'tower'],
  list: ['orbit', 'constellation', 'radar'],
  para: ['deal', 'constellation', 'orbit'],
  rows: ['tower', 'deal', 'constellation'],
};
const ANY: Style[] = ['deal', 'orbit', 'constellation', 'conveyor', 'radar', 'tower', 'funnel', 'balance', 'dominoes'];

/** the machine for a step: one its words call for, else one that suits its kind, never one of the last two used */
export function styleFor(kind: Kind, text: string, recent: Style[]): Style {
  const fit = STYLE_RULES.filter(([re]) => re.test(text)).map(([, st]) => st);
  const order = [...fit, ...BY_KIND[kind], ...ANY];
  return order.find((st) => !recent.includes(st)) ?? order[0];
}

/** the picture for a step: its machine builds up one item per line */
function sceneFor(style: Style, lns: string[], hub: string): (at: number) => StepAction {
  const items = tilesFor(lns);
  return (at) => ({ glyphs: { items, layout: style, hub, at: Math.min(at, items.length - 1) } });
}

function textSteps(section: Section): Step[] {
  const steps: Step[] = [];
  const base = titleOf(section.heading);
  const hub = iconFor(base);
  const recent: Style[] = [];
  let pending: string[] = [];
  let pendingTitle: string | undefined;
  let kind: Kind = 'para';
  const flush = () => {
    if (!pending.length) return;
    const title = pendingTitle ?? base;
    if (!steps.length) {
      // the opening: the section's term and its first line, then the rest of the lines as usual
      // the opening: one big picture of the section's subject while its first lines light up
      steps.push({
        kind: 'watch',
        title,
        lines: pending,
        script: [{ hero: { icon: hub } }, ...pending.flatMap((_, k) => [{ say: k }, { wait: 1500 }])],
      });
    } else {
      const style = styleFor(kind, `${title} ${pending.join(' ')}`, recent);
      recent.unshift(style);
      recent.length = Math.min(recent.length, 2);
      steps.push(watch(title, pending, sceneFor(style, pending, hub)));
    }
    pending = [];
    pendingTitle = undefined;
  };
  for (const b of blocks(section.body)) {
    if (b.kind === 'table') {
      flush();
      for (let k = 0; k < b.rows.length; k += TABLE_ROWS) {
        const rows = b.rows.slice(k, k + TABLE_ROWS);
        // the row text goes in the lines, the box shows one picture per row
        kind = 'rows';
        for (const r of rows) {
          pending.push(r.map((c, j) => (j === 0 ? `**${c}**` : c)).filter(Boolean).join(' · '));
          if (pending.length >= LINES) flush();
        }
        flush();
      }
      continue;
    }
    if (b.title && pending.length) flush();
    if (b.title) pendingTitle = b.title;
    kind = b.list ? (b.ordered || ORDERED.test(`${b.title ?? ''} ${base}`) || b.lines.some((l) => l.includes('→')) ? 'ordered' : 'list') : 'para';
    for (const l of b.lines) {
      pending.push(l);
      if (pending.length >= LINES) flush();
    }
    flush();
  }
  flush();
  return steps.slice(0, MAX_TEXT_STEPS);
}

/** single-answer exam questions without code that map to this section */
function questionsFor(topic: Topic, index: number): MCQ[] {
  return topic.test
    .filter((q) => (q.correct?.length ?? 0) === 1 && !q.code && q.options.length >= 2 && q.options.length <= 5 && sectionForQuestion(topic, q) === index)
    .slice(0, MAX_TURNS);
}

function turnFromMcq(q: MCQ): Step {
  const answer = q.correct![0];
  const why = sentences(q.explanation ?? '')[0] ?? 'That is the one the section describes.';
  return {
    kind: 'turn',
    title: 'Your turn',
    lines: ['Pick the answer the section supports.'],
    task: {
      type: 'choose',
      question: plainLine(q.question),
      options: q.options.map((o, k) => (k === answer ? { text: plainLine(o) } : { text: plainLine(o), why: 'Not this one: look back at the steps before.' })),
      answer,
    },
    solved: why,
    setup: [{ hero: { icon: 'circle-question-mark', tone: 'miss' } }],
  };
}

/** no exam question maps here: ask which statement is this section's key point (the others come from nearby sections) */
function turnFromKeyPoints(topic: Topic, index: number): Step | null {
  const mine = topic.sections[index].keyPoints?.[0];
  const others = topic.sections.flatMap((s, k) => (k !== index ? (s.keyPoints?.slice(0, 1) ?? []) : [])).slice(0, 2);
  if (!mine || others.length < 1) return null;
  // a fixed position per section, so the right answer isn't always first
  const answer = index % (others.length + 1);
  const options: { text: string; why?: string }[] = others.map((o) => ({ text: plainLine(o), why: 'That is a key point of another section of this topic.' }));
  options.splice(answer, 0, { text: plainLine(mine) });
  return {
    kind: 'turn',
    title: 'Your turn',
    lines: ['Which statement is this section about?'],
    task: { type: 'choose', question: 'Which of these is a key point of this section?', options, answer },
    solved: plainLine(mine),
    setup: [{ hero: { icon: 'circle-question-mark', tone: 'miss' } }],
  };
}

const cache = new Map<string, StepLesson | null>();

/** A section's step lesson: its hand-written one, or one generated from its content (null when it has no text). */
export function lessonFor(topic: Topic, index: number): StepLesson | null {
  const section = topic.sections[index];
  if (section.steps) return section.steps;
  const key = `${topic.id}:${index}`;
  if (cache.has(key)) return cache.get(key)!;
  const text = textSteps(section);
  let lesson: StepLesson | null = null;
  if (text.length) {
    const qs = questionsFor(topic, index);
    const turns = qs.length ? qs.map(turnFromMcq) : [turnFromKeyPoints(topic, index)].filter((s): s is Step => !!s);
    const kp = (section.keyPoints ?? []).slice(0, 5).map(plainLine);
    const recap: Step[] = kp.length ? [watch('Key points', kp, (at) => ({ glyphs: { items: tilesFor(kp), layout: 'stamp', at } }))] : [];
    lesson = { actors: [], steps: [...text, ...turns, ...recap] };
  }
  cache.set(key, lesson);
  return lesson;
}
