// Adapted from system-design-learn's scripts/validate-steps.mjs (M8 in qa-learn).
// ---------- Step lessons (M11): the player needs real actors, answerable tasks and lines the script can light ----------
const TASKS = new Set(['pick', 'choose', 'number', 'order', 'build', 'slider', 'break', 'estimate', 'dial']);
const SCENES = ['eq', 'count', 'bars', 'curve', 'dots', 'ladder', 'meter', 'seq', 'table', 'ring', 'hero', 'glyphs'];
const ACTIONS = ['say', 'send', 'badge', 'lit', 'down', 'show', 'keys', 'wait', ...SCENES];
const MODELS = new Set(['ttl-jitter', 'hit-ratio', 'availability']);
// must match src/components/steps/stage.ts: box size, the two stages, and how phones turn the wide stage tall
const BOX = { w: 190, h: 72 };
/** the least space between two boxes, in stage units */
const GAP = 6;
/** the key list drawn under `keysUnder`: 280 wide, centred on that actor */
const KEYS_W = 280;
/** a badge pill's width for its text (stage.ts: length × 9.6 + 26) */
const badgeW = (text) => text.length * 9.6 + 26;
// what fits inside a 190-wide box: the 21px title and the 14px monospace subtitle
const MAX_LABEL = 16;
const MAX_SUB = 21;
const LAYOUTS = [
  { name: 'wide', w: 900, h: 300, at: (a) => a },
  { name: 'phone', w: 500, h: 700, at: (a) => ({ x: 190 + (a.y - 130) * 1.45, y: 90 + a.x * 0.68 }) },
];

// ---- scenes: mirrors src/components/steps/scenes.ts (sizes in stage units; text widths are generous estimates) ----
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const chipW = (t) => Math.max(92, t.v.length * 18 + 40, (t.l?.length ?? 0) * 8.6 + 30);
const numText = (n) => `${n.prefix ?? ''}${fmt(n.to)}${n.unit ? ` ${n.unit}` : ''}`;
const ladderPos = (s, tall) => ((Math.log10(s) + 9) / 9) * (tall ? 570 : 780) + (tall ? 70 : 60);

/** problems with one scene action, on both stages */
function checkScene(a, at) {
  const e = [];
  const bad = (m) => e.push(`${at}: ${m}`);
  // picture scenes (qa-learn's generated lessons): icons only, so only the counts, the names and the cursor matter
  const named = (x) => typeof x?.icon === 'string' && /^[a-z0-9-]+$/.test(x.icon);
  if ('hero' in a && !named(a.hero)) bad('hero needs an icon name');
  if ('glyphs' in a) {
    const g = a.glyphs;
    if (!Array.isArray(g.items) || g.items.length < 1 || g.items.length > 8) bad('glyphs needs 1–8 items');
    else if (!g.items.every(named)) bad('every glyph needs an icon name');
    if (!['orbit', 'conveyor', 'dominoes', 'deal', 'constellation', 'tower', 'radar', 'balance', 'funnel', 'stamp'].includes(g.layout)) bad(`glyphs: unknown layout "${g.layout}"`);
    if (g.layout === 'orbit' && !g.hub) bad('an orbit needs a hub icon');
    if (!(Number.isInteger(g.at) && g.at >= 0 && g.at < (g.items?.length ?? 0))) bad(`glyphs: at ${g.at} is not one of its items`);
  }
  if ('eq' in a) {
    const t = a.eq ?? [];
    if (t.length < 2 || t.length > 9) bad('an equation needs 2–9 terms');
    const W = t.reduce((s, x) => s + ('op' in x ? 48 : chipW(x)), 0) + 10 * (t.length - 1);
    const H = t.reduce((s, x) => s + ('op' in x ? 40 : 86), 0) + 10 * (t.length - 1) + (a.result ? 120 : 0);
    if (W > 880) bad(`the equation is ${Math.round(W)} wide; the wide stage fits 880 (shorten values or labels)`);
    if (H > 680) bad(`the equation is ${H} tall; the phone stage fits 680 (fewer terms)`);
    if (t.some((x) => !('op' in x) && chipW(x) > 470)) bad('an equation chip is too wide for phones');
    if (a.result && numText(a.result).length > 16) bad(`result "${numText(a.result)}" is too long (max 16 characters)`);
    if (a.result?.l && a.result.l.length > 56) bad('result caption is too long (max 56 characters)');
  }
  if ('count' in a) {
    if (numText(a.count).length > 12) bad(`counter "${numText(a.count)}" is too long for phones (max 12 characters)`);
    if (a.count.l && a.count.l.length > 56) bad('counter caption is too long (max 56 characters)');
  }
  if ('bars' in a) {
    const b = a.bars ?? [];
    if (b.length < 1 || b.length > 6) bad('bars need 1–6 rows');
    for (const r of b) {
      if (!(r.v > 0)) bad(`bar "${r.l}" needs a positive value`);
      const val = r.text ?? `${fmt(r.v)}${a.unit ? ` ${a.unit}` : ''}`;
      if (r.l.length > 24) bad(`bar label "${r.l}" is too long (max 24 characters)`);
      if (val.length > 14) bad(`bar value "${val}" is too long (max 14 characters)`);
      if (r.l.length * 8.2 + val.length * 9.2 > 425) bad(`bar "${r.l}" and its value don't fit one line on phones`);
    }
    if (a.limit && a.limit.l.length > 22) bad('the limit label is too long (max 22 characters)');
  }
  if ('curve' in a) {
    if (!(a.curve?.length >= 3 && a.curve.every((v) => v >= 0))) bad('a curve needs 3+ non-negative points');
    for (const m of a.marks ?? []) if (m.l.length > 30) bad(`mark "${m.l}" is too long (max 30 characters)`);
    if (a.peak && a.peak.length > 16) bad('the peak label is too long (max 16 characters)');
  }
  if ('dots' in a) {
    if (!(a.dots >= 2 && a.dots <= 120)) bad('dots need 2–120');
    if (!(a.on >= 0 && a.on <= a.dots)) bad('dots: on must be between 0 and the total');
    if (!a.l || a.l.length > 50) bad('dots need a caption of at most 50 characters');
  }
  if ('ladder' in a) {
    const r = a.ladder ?? [];
    if (r.length < 2 || r.length > 7) bad('a ladder needs 2–7 rungs');
    if (r.some((x) => !(x.s >= 1e-9 && x.s <= 1))) bad('ladder times must be between 1 ns and 1 s (in seconds)');
    const w = (x) => x.l.length * 10.4 + 10;
    r.forEach((x, i) => {
      const p = ladderPos(x.s, false);
      if (p - w(x) / 2 < 0 || p + w(x) / 2 > 900) bad(`ladder label "${x.l}" is cut off on the wide stage`);
      const y = r[i + 2];
      if (y && Math.abs(ladderPos(y.s, false) - p) < (w(x) + w(y)) / 2 + 6) bad(`ladder labels "${x.l}" and "${y.l}" overlap on the wide stage`);
      const n = r[i + 1];
      if (n && Math.abs(ladderPos(n.s, true) - ladderPos(x.s, true)) < 26) bad(`ladder rungs "${x.l}" and "${n.l}" are too close on phones`);
      if (i && ladderPos(x.s, false) < ladderPos(r[i - 1].s, false)) bad('ladder rungs go from fastest to slowest');
    });
  }
  if ('meter' in a) {
    const m = a.meter ?? [];
    if (m.length < 1 || m.length > 3) bad('meters need 1–3 rows');
    for (const x of m) {
      const val = `${fmt(x.v)} / ${fmt(x.max)} ${x.unit} · 100%`;
      if (x.l.length * 8.5 + val.length * 9.2 > 410) bad(`meter "${x.l}" and its value don't fit one line on phones`);
    }
  }
  if ('seq' in a) {
    const { lanes = [], msgs = [] } = a.seq ?? {};
    if (lanes.length < 2 || lanes.length > 4) bad('a sequence needs 2–4 lanes');
    if (msgs.length < 1 || msgs.length > 6) bad('a sequence needs 1–6 messages');
    // lane centres on the phone stage (the tighter one): 80…420
    const xs = lanes.map((_, i) => 80 + (i * 340) / Math.max(1, lanes.length - 1));
    const gap = lanes.length > 1 ? 340 / (lanes.length - 1) : 340;
    lanes.forEach((l) => {
      if (Math.max(76, l.length * 10.6 + 26) > gap - 6 && lanes.length > 2) bad(`lane "${l}" is too wide for its column on phones`);
      if (l.length > 14) bad(`lane "${l}" is too long (max 14 characters)`);
    });
    for (const m of msgs) {
      if (!(m.from >= 0 && m.from < lanes.length && m.to >= 0 && m.to < lanes.length)) bad(`message "${m.l}" uses a lane that doesn't exist`);
      else if (m.from === m.to) {
        if (m.l.length * 9.8 + 24 > Math.min(gap, 180) + 40) bad(`note "${m.l}" is too wide for its lane on phones`);
      } else if (m.l.length * 9.6 > Math.abs(xs[m.to] - xs[m.from]) + 30) bad(`message "${m.l}" is longer than its arrow on phones`);
    }
  }
  if ('table' in a) {
    const { cols = [], rows = [] } = a.table ?? {};
    if (cols.length < 1 || rows.length < 1 || rows.length > 6) bad('a table needs columns and 1–6 rows');
    if (rows.some((r) => r.length !== cols.length)) bad('every table row needs one value per column');
    const W = cols.map((h, j) => Math.max(h.length, ...rows.map((r) => (r[j] ?? '').length)) * 9 + 26).reduce((s, w) => s + w, 0);
    if (W > 480) bad(`the table is ${Math.round(W)} wide; phones fit 480 (shorter values or fewer columns)`);
    if (a.table.l && a.table.l.length > 50) bad('the table caption is too long (max 50 characters)');
  }
  if ('ring' in a) {
    const { nodes = [], keys = [], add } = a.ring ?? {};
    const all = [...nodes, ...(add ? [add] : [])];
    if (nodes.length < 2 || all.length > 6) bad('a ring needs 2–6 nodes');
    if (keys.length > 8) bad('a ring fits at most 8 keys');
    if ([...all, ...keys].some((n) => !(n.at >= 0 && n.at < 360))) bad('ring angles must be 0–359');
    if (all.some((n) => n.l.length > 8) || keys.some((k) => k.l.length > 6)) bad('ring labels: nodes max 8 characters, keys max 6');
    const close = (p, q) => Math.min(Math.abs(p.at - q.at), 360 - Math.abs(p.at - q.at)) < 24;
    all.forEach((p, i) => all.slice(i + 1).forEach((q) => close(p, q) && bad(`ring nodes "${p.l}" and "${q.l}" are too close`)));
    keys.forEach((p, i) => keys.slice(i + 1).forEach((q) => close(p, q) && bad(`ring keys "${p.l}" and "${q.l}" are too close`)));
  }
  return e;
}

/** every box inside the stage and clear of the others, on desktop and on phones */
function checkLayout(actors, where, keysUnder, maxKeys = 0) {
  const e = [];
  for (const L of LAYOUTS) {
    const boxes = actors.map((a) => ({ id: a.id, ...L.at(a) }));
    const under = boxes.find((b) => b.id === keysUnder);
    if (under && (under.x - KEYS_W / 2 < 0 || under.x + KEYS_W / 2 > L.w)) e.push(`${where}: the key list under "${keysUnder}" sticks out of the ${L.name} stage`);
    // the list grows downwards, one 34-unit row per key (stage.ts); on phones a right-hand box sits near the bottom
    if (under && maxKeys && under.y + BOX.h / 2 + 12 + maxKeys * 34 - 5 > L.h)
      e.push(`${where}: ${maxKeys} keys under "${keysUnder}" run off the bottom of the ${L.name} stage (move that box left, or show fewer keys)`);
    for (const b of boxes) {
      if (b.x - BOX.w / 2 < 0 || b.x + BOX.w / 2 > L.w || b.y - BOX.h / 2 < 0 || b.y + BOX.h / 2 > L.h) e.push(`${where}: actor "${b.id}" sticks out of the ${L.name} stage`);
    }
    boxes.forEach((p, i) =>
      boxes.slice(i + 1).forEach((q) => {
        // a few units of air between boxes: edge to edge reads as one shape
        if (Math.abs(p.x - q.x) < BOX.w + GAP && Math.abs(p.y - q.y) < BOX.h + GAP) e.push(`${where}: actors "${p.id}" and "${q.id}" overlap or touch on the ${L.name} stage`);
      }),
    );
  }
  return e;
}

/** Problems with one section's step lesson (empty when fine). */
export function checkSteps(lesson, where) {
  const e = [];
  const actors = new Set();
  for (const a of lesson.actors ?? []) {
    if (!a.id || !a.label) e.push(`${where}: every actor needs an id and a label`);
    if (a.label?.length > MAX_LABEL) e.push(`${where}: actor "${a.id}" label is too long for its box (max ${MAX_LABEL} characters)`);
    if (a.sub?.length > MAX_SUB) e.push(`${where}: actor "${a.id}" subtitle "${a.sub}" is too long for its box (max ${MAX_SUB} characters)`);
    if (actors.has(a.id)) e.push(`${where}: duplicate actor "${a.id}"`);
    if (!(a.x >= 0 && a.x <= 900 && a.y >= 0 && a.y <= 300)) e.push(`${where}: actor "${a.id}" is outside the 900×300 stage`);
    actors.add(a.id);
  }
  const keyLists = (lesson.steps ?? []).flatMap((st) => [...(st.script ?? []), ...(st.setup ?? []), ...(st.then ?? [])]).filter((a) => 'keys' in a);
  const maxKeys = Math.max(0, ...keyLists.map((a) => a.keys.length));
  e.push(...checkLayout(lesson.actors ?? [], where, lesson.keysUnder, maxKeys));
  // pick buttons show the label: two boxes may share one only if their subtitles tell them apart
  const named = new Map();
  for (const a of lesson.actors ?? []) {
    const key = `${a.label}|${a.sub ?? ''}`;
    if (named.has(key)) e.push(`${where}: actors "${named.get(key)}" and "${a.id}" look identical (same label and subtitle)`);
    named.set(key, a.id);
  }
  if (lesson.keysUnder && !actors.has(lesson.keysUnder)) e.push(`${where}: keysUnder "${lesson.keysUnder}" is not an actor`);
  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  if (steps.length < 4 || steps.length > 16) e.push(`${where}: ${steps.length} steps (needs 4–16)`);
  if (!steps.some((s) => s.kind === 'turn')) e.push(`${where}: needs at least one Your turn step`);
  if (steps[0]?.kind === 'turn') e.push(`${where}: open with a Watch step, not a Your turn`);

  const actor = (id, at) => {
    if (!actors.has(id)) e.push(`${at}: unknown actor "${id}"`);
  };
  const byId = new Map((lesson.actors ?? []).map((a) => [a.id, a]));
  // a badge is centred above its actor: it must not be cut off at either side of the stage
  const badgeFits = (a, at) => {
    const who = byId.get(a.badge);
    if (!who) return;
    for (const L of LAYOUTS) {
      const { x } = L.at(who);
      if (x - badgeW(a.text) / 2 < 0 || x + badgeW(a.text) / 2 > L.w) e.push(`${at}: badge "${a.text}" is cut off on the ${L.name} stage (shorten it)`);
    }
  };
  const script = (list, at, lines) => {
    for (const a of list ?? []) {
      const kind = ACTIONS.find((k) => k in a);
      if (!kind) e.push(`${at}: unknown action ${JSON.stringify(a)}`);
      else if (kind === 'say' && !(Number.isInteger(a.say) && a.say >= 0 && a.say < lines)) e.push(`${at}: say ${a.say} but the step has ${lines} lines`);
      else if (SCENES.includes(kind)) e.push(...checkScene(a, at));
      else if (kind === 'send') a.send.forEach((id) => actor(id, at));
      else if (['badge', 'lit', 'down', 'show'].includes(kind)) {
        actor(a[kind], at);
        if (kind === 'badge') badgeFits(a, at);
      }
    }
  };

  for (const [i, s] of steps.entries()) {
    const at = `${where} step ${i + 1} "${s.title ?? ''}"`;
    if (!s.title?.trim()) e.push(`${at}: no title`);
    if (!(s.lines?.length >= 1 && s.lines.length <= 5)) e.push(`${at}: needs 1–5 lines`);
    const n = s.lines?.length ?? 0;
    if (s.kind === 'watch') {
      if (!s.script?.length) e.push(`${at}: a Watch step needs a script`);
      script(s.script, at, n);
      if (!s.script?.some((a) => 'say' in a)) e.push(`${at}: the script never lights a line (say)`);
      continue;
    }
    if (s.kind !== 'turn') {
      e.push(`${at}: kind must be watch or turn`);
      continue;
    }
    script(s.setup, `${at} setup`, n);
    script(s.then, `${at} then`, n);
    if (!s.solved?.trim()) e.push(`${at}: needs a "solved" takeaway`);
    const t = s.task ?? {};
    if (!TASKS.has(t.type)) {
      e.push(`${at}: unknown task "${t.type}"`);
      continue;
    }
    if (!t.question?.trim()) e.push(`${at}: the task needs a question`);
    if (t.type === 'pick') {
      actor(t.answer, at);
      Object.keys(t.hints ?? {}).forEach((id) => actor(id, at));
      if (!Object.keys(t.hints ?? {}).length) e.push(`${at}: pick needs at least one wrong actor with a hint`);
    }
    if (t.type === 'choose') {
      if (!(t.options?.length >= 2 && t.options.length <= 5)) e.push(`${at}: choose needs 2–5 options`);
      if (!Number.isInteger(t.answer) || t.answer < 0 || t.answer >= (t.options?.length ?? 0)) e.push(`${at}: answer index out of range`);
      if (t.options?.some((o, k) => k !== t.answer && !o.why?.trim())) e.push(`${at}: every wrong option needs a why`);
    }
    if (t.type === 'number' && !(t.options?.includes(t.answer) && t.hint)) e.push(`${at}: number needs the answer among its options and a hint`);
    if (t.type === 'order' && !(t.items?.length >= 3 && t.hint)) e.push(`${at}: order needs 3+ items and a hint`);
    if (t.type === 'build' && !(t.parts?.length >= 2 && t.parts.every((p) => p.text && p.label) && t.hint)) e.push(`${at}: build needs 2+ labelled parts and a hint`);
    if (t.type === 'slider' && !(MODELS.has(t.model) && t.max > t.min)) e.push(`${at}: slider needs a known model and min < max`);
    if (t.type === 'break') actor(t.actor, at);
    if (t.type === 'estimate' && !(t.answer > 0 && t.within > 1 && t.unit && t.hint)) e.push(`${at}: estimate needs a positive answer, within > 1, a unit and a hint`);
    if (t.type === 'dial') {
      const step = t.step ?? 1;
      const best = Math.ceil(t.need / t.per / step) * step;
      if (!(t.per > 0 && t.need > 0 && t.max > t.min && t.unit && t.capUnit && t.label)) e.push(`${at}: dial needs per, need, min < max, unit, capUnit and a label`);
      else if (best < t.min || best > t.max || best * t.per > t.need * (t.slack ?? 1.5)) e.push(`${at}: the dial can't reach a right answer (${best} ${t.unit})`);
      else if (t.min * t.per >= t.need) e.push(`${at}: the dial starts already solved`);
    }
  }
  return e;
}
