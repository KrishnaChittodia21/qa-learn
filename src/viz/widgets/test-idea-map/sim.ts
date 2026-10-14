// Pure simulation of answering "How would you test X?" with the repeatable frame from the
// qa-scenarios topic: clarify → functional (positive / negative / edge) → non-functional →
// prioritise (P1/P2/P3 by likelihood × impact) → close with what to automate. The mind map
// grows branch by branch; captions model what a candidate says aloud. No React here.
import type { BaseFrame } from '../../core';

export type Obj = 'login' | 'atm' | 'elevator' | 'pen' | 'search';
export type Depth = 'short' | 'full';
export interface Params {
  obj: Obj;
  depth: Depth;
}
export const DEFAULT_PARAMS: Params = { obj: 'login', depth: 'full' };

export const FUNC = ['pos0', 'pos1', 'neg0', 'neg1', 'edge0', 'edge1'] as const;
export const NFR = ['perf', 'sec', 'usab', 'a11y', 'compat'] as const;
export type LeafId = (typeof FUNC)[number] | (typeof NFR)[number];
export const NFR_LABEL: Record<(typeof NFR)[number], string> = {
  perf: 'Performance',
  sec: 'Security',
  usab: 'Usability',
  a11y: 'Accessibility',
  compat: 'Compatibility',
};

export interface ObjData {
  name: string;
  clarify: string[];
  assume: string;
  leaves: Record<LeafId, string>;
  prio: Record<LeafId, 1 | 2 | 3>;
  automate: string[];
  manual: string;
  why: string;
}

export const OBJECTS: Record<Obj, ObjData> = {
  login: {
    name: 'a login page',
    clarify: ['Email or username? SSO, 2FA?', 'Lockout after how many fails?', 'Web only, or mobile too?'],
    assume: 'email + password on the web, lockout after 5 failures',
    leaves: {
      pos0: 'Valid login lands right per role',
      pos1: 'Enter key submits the form',
      neg0: 'Wrong password: generic error',
      neg1: 'Locked user: clear message',
      edge0: 'Spaces / uppercase in email',
      edge1: 'Max length, unicode, paste',
      perf: '100 concurrent logins',
      sec: 'Lockout, HTTPS, generic errors',
      usab: 'Show/hide password, caps hint',
      a11y: 'Labels, tab order, errors read',
      compat: 'Chromium, Firefox, WebKit',
    },
    prio: { pos0: 1, neg0: 1, sec: 1, neg1: 2, edge0: 2, a11y: 2, perf: 2, pos1: 3, edge1: 3, usab: 3, compat: 3 },
    automate: ['Login per role, UI + API', 'Lockout rule as an API test'],
    manual: 'Explore session + Back button',
    why: 'wrong-password handling and lockout are where login incidents come from',
  },
  atm: {
    name: 'an ATM',
    clarify: ['Withdraw, balance, PIN change?', 'Own-bank and other-bank cards?', 'Limits and note denominations?'],
    assume: 'withdrawal and balance, own-bank card, a daily limit',
    leaves: {
      pos0: 'Valid PIN, withdraw, cash out',
      pos1: 'Balance enquiry is correct',
      neg0: '3 wrong PINs: card retained',
      neg1: 'Over balance / not a multiple',
      edge0: 'Debited, no cash → reversal',
      edge1: 'Exactly the daily limit',
      perf: 'Response time at peak hours',
      sec: 'PIN masked, keypad shield',
      usab: 'Card returned before cash',
      a11y: 'Audio jack, braille keypad',
      compat: 'Other banks\' cards, networks',
    },
    prio: { pos0: 1, edge0: 1, neg0: 1, sec: 1, neg1: 2, edge1: 2, usab: 2, pos1: 3, perf: 3, a11y: 2, compat: 3 },
    automate: ['Limit + denomination rules (API)', 'State-machine paths in a simulator'],
    manual: 'Card slot and cash-jam hardware',
    why: 'money must never leave the account without cash coming out',
  },
  elevator: {
    name: 'an elevator',
    clarify: ['Control software, whole lift or UX?', 'How many floors and cars?', 'Keycard floors, fire mode, load?'],
    assume: 'the control software, 10 floors, 2 cars',
    leaves: {
      pos0: 'Call + select: stops level',
      pos1: 'Display and chime match floor',
      neg0: 'Doors never open between floors',
      neg1: 'Overload: alarm, will not move',
      edge0: 'Calls from every floor at once',
      edge1: 'Power cut: safe stop at a floor',
      perf: '9 a.m. rush: fair wait times',
      sec: 'Keycard floors need a card',
      usab: 'Door-open button holds doors',
      a11y: 'Braille, audio, wheelchair time',
      compat: 'Fire-service mode integration',
    },
    prio: { neg0: 1, neg1: 1, edge1: 1, pos0: 1, edge0: 2, perf: 2, sec: 2, a11y: 2, pos1: 3, usab: 3, compat: 2 },
    automate: ['Scheduling logic in a simulator', 'Door/sensor state-machine tests'],
    manual: 'Ride comfort, real-load trials',
    why: 'passenger safety comes before scheduling and comfort',
  },
  pen: {
    name: 'a pen',
    clarify: ['Ballpoint, gel or fountain?', 'Who uses it, and for what?', 'Any spec, e.g. writing length?'],
    assume: 'a retractable office ballpoint claiming 1.5 km of writing',
    leaves: {
      pos0: 'Smooth line on A4 at first touch',
      pos1: 'Clicker extends and retracts',
      neg0: 'Glossy / wet paper, upside down',
      neg1: 'Clicker pressed 10,000 times',
      edge0: 'Line length vs the 1.5 km claim',
      edge1: 'Shirt pocket at 40°C: no leak',
      perf: 'Ink keeps up with fast writing',
      sec: 'Safety: vented cap, non-toxic',
      usab: '30-minute grip comfort',
      a11y: 'Left-handed use, no smudge',
      compat: 'Cheque paper, carbon forms',
    },
    prio: { pos0: 1, edge1: 1, sec: 1, neg1: 2, edge0: 2, neg0: 2, pos1: 2, usab: 3, a11y: 3, compat: 3, perf: 3 },
    automate: ['Click-cycle rig (factory line)', 'Line-length rig'],
    manual: 'Comfort, smudge, look and feel',
    why: 'leaks and a swallowable cap hurt people; a short line only disappoints',
  },
  search: {
    name: 'a search box',
    clarify: ['Product search? Autocomplete?', 'Filters, sort, pagination?', 'Typos and synonyms supported?'],
    assume: 'e-commerce product search with filters and paging',
    leaves: {
      pos0: 'Exact and partial name match',
      pos1: 'Case-insensitive results',
      neg0: 'Blank / spaces-only search',
      neg1: 'No match: helpful empty state',
      edge0: 'Very long text, emoji, % and _',
      edge1: 'Misspelling, e.g. "iphne"',
      perf: 'Autocomplete is debounced',
      sec: '<script> shown as plain text',
      usab: 'Filters + sort combine right',
      a11y: 'Result count announced',
      compat: 'Mobile and desktop browsers',
    },
    prio: { pos0: 1, sec: 1, usab: 1, neg1: 2, edge0: 2, edge1: 2, perf: 2, pos1: 3, neg0: 3, a11y: 3, compat: 3 },
    automate: ['Matching rules via API, data-driven', 'Pagination: no gaps or duplicates'],
    manual: 'Explore relevance and ranking',
    why: 'finding the product and safe rendering of input matter most',
  },
};

export type Branch = 'clarify' | 'func' | 'nfr' | 'prio' | 'auto';
export interface Frame extends BaseFrame {
  branches: Branch[];
  /** clarify questions shown (0–3) and whether the assumption is stated */
  questions: number;
  assumed: boolean;
  leaves: LeafId[];
  /** priorities revealed for leaves */
  prio: Partial<Record<LeafId, 1 | 2 | 3>>;
  autoShown: boolean;
  focus: Branch | null;
}

export function simulate(p: Params): Frame[] {
  const d = OBJECTS[p.obj];
  const full = p.depth === 'full';
  const frames: Frame[] = [];
  const branches: Branch[] = [];
  const leaves: LeafId[] = [];
  let prio: Frame['prio'] = {};
  let questions = 0;
  let assumed = false;
  let autoShown = false;
  const push = (caption: string, focus: Branch | null, predict?: string) =>
    frames.push({ caption, predict, branches: [...branches], questions, assumed, leaves: [...leaves], prio: { ...prio }, autoShown, focus });
  const say = (s: string) => `Say aloud: "${s}"`;
  /** lower-case the first letter unless the word is an acronym (PIN, API, SSO) */
  const lc = (s: string) => (/^[A-Z][A-Z0-9]/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

  push(`"How would you test ${d.name}?" The interviewer is scoring structure, not a list. ${full ? 'A full answer takes about 5 minutes.' : 'In a 60-second version you name one idea per branch and jump to priorities.'}`, null);

  branches.push('clarify');
  questions = full ? 3 : 2;
  push(say(`Before I list tests, a few questions. ${d.clarify.slice(0, questions).join(' ')}`), 'clarify');
  assumed = true;
  push(say(`If there's no spec, I'll assume ${d.assume}, and I'll say so as I go.`), 'clarify');

  branches.push('func');
  leaves.push('pos0');
  if (full) leaves.push('pos1');
  push(say(`Functional, happy path first: ${lc(d.leaves.pos0)}${full ? `; ${lc(d.leaves.pos1)}` : ''}.`), 'func', 'Happy path is on the map. What kind of case do most candidates forget to say out loud next?');
  leaves.push('neg0');
  if (full) leaves.push('neg1');
  push(say(`Negative: ${lc(d.leaves.neg0)}${full ? `; ${lc(d.leaves.neg1)}` : ''}. Each invalid class is its own case with its own expected result.`), 'func');
  leaves.push('edge0');
  if (full) leaves.push('edge1');
  push(say(`Edge cases: ${lc(d.leaves.edge0)}${full ? `; ${lc(d.leaves.edge1)}` : ''}. Boundaries, limits and failures halfway are where bugs cluster.`), 'func');

  branches.push('nfr');
  const nfrs = full ? [...NFR] : [...NFR].sort((a, b) => d.prio[a] - d.prio[b] || NFR.indexOf(a) - NFR.indexOf(b)).slice(0, 3);
  for (const n of nfrs) {
    leaves.push(n);
    push(say(`${NFR_LABEL[n]}: ${lc(d.leaves[n])}.`), 'nfr');
  }

  branches.push('prio');
  const p1 = leaves.filter((l) => d.prio[l] === 1);
  const predictPrio = `${leaves.length} ideas on the map. If you only had one hour, which ones are P1?`;
  frames[frames.length - 1].predict = predictPrio;
  for (const l of p1) prio[l] = 1;
  push(say(`If I had an hour, my P1s are ${p1.map((l) => lc(d.leaves[l])).join('; ')}, because ${d.why}.`), 'prio');
  if (full) {
    prio = Object.fromEntries(leaves.map((l) => [l, d.prio[l]])) as Frame['prio'];
    const p3 = leaves.filter((l) => d.prio[l] === 3).length;
    push(say(`Then P2 for likely-and-annoying, P3 (${p3} ideas) only if time allows. I rank by likelihood × impact.`), 'prio', 'Which of these ideas are worth automating, and which stay manual?');
  } else {
    frames[frames.length - 1].predict = 'Time is nearly up. What is the one closing point that shows engineering sense?';
  }

  branches.push('auto');
  autoShown = true;
  push(say(`I'd automate ${d.automate.map(lc).join(' and ')}: repeatable checks that run on every build. Manual and exploratory: ${lc(d.manual)}.`), 'auto');
  push(
    `Close: name test data and environment needs, then stop. Map: ${leaves.length} test ideas across functional and non-functional, ${p1.length} P1, ${d.automate.length} automation candidates. Same frame works for ${p.obj === 'pen' ? 'a login page' : 'a pen'} too.`,
    null,
  );
  return frames;
}
