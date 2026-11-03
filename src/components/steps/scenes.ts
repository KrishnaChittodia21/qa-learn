// Scenes for step lessons: an equation, bars, a curve, a dot grid, a latency ladder, meters, a counter, a sequence
// diagram, a table or a hash ring, drawn in
// place of the actor boxes so each step can animate its own mechanism. Every motion runs on the Stage's clock, so
// Pause freezes it, Back/Next cancels it and reduced motion jumps to the end.
// Sizes here are mirrored in scripts/validate-steps.mjs, which checks every scene fits both stages.
import type { SceneAction, SceneNumber, StepTone } from '../../types';

const NS = 'http://www.w3.org/2000/svg';
export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent?.appendChild(n);
  return n;
}
export function text(parent: Element, attrs: Record<string, string | number>, s: string) {
  const t = el('text', attrs, parent);
  t.textContent = s;
  return t;
}

/** a CSS cubic-bezier as a function of time (0..1) */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    if (x <= 0 || x >= 1) return Math.min(1, Math.max(0, x));
    let lo = 0;
    let hi = 1;
    let t = x;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (at(t, x1, x2) < x) lo = t;
      else hi = t;
    }
    return at(t, y1, y2);
  };
}
/** the app's --ease-out token (tokens.css): things arriving */
export const easeOut = bezier(0.22, 1, 0.36, 1);
/** things moving across the stage */
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

export interface SceneCtx {
  g: SVGGElement;
  tall: boolean;
  tween: (ms: number, frame: (e: number) => void, ease?: (k: number) => number) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
}

const fmt = (n: number, digits = 0) => n.toLocaleString('en-US', { maximumFractionDigits: digits });
const toneOf = (t?: StepTone) => `tone-${t ?? 'ink'}`;

/** fade + rise into place */
async function arrive(c: SceneCtx, g: SVGGElement, x: number, y: number, ms = 320) {
  g.style.opacity = '0';
  await c.tween(
    ms,
    (e) => {
      g.style.opacity = String(e);
      g.setAttribute('transform', `translate(${x} ${y + (1 - e) * 12})`);
    },
    easeOut,
  );
}

/** a number counting up to its value, then a soft glow */
async function countUp(c: SceneCtx, parent: SVGGElement, n: SceneNumber, x: number, y: number, size: number) {
  const g = el('g', { class: `sc-num ${toneOf(n.tone ?? 'ok')}` }, parent);
  const v = text(g, { class: 'sc-big', x, y, 'text-anchor': 'middle', 'font-size': size }, '0');
  if (n.l) text(g, { class: 'sc-cap', x, y: y + size * 0.62 + 8, 'text-anchor': 'middle' }, n.l);
  const from = n.from ?? 0;
  await c.tween(1100, (e) => (v.textContent = `${n.prefix ?? ''}${fmt(from + (n.to - from) * e, n.digits)}${n.unit ? ` ${n.unit}` : ''}`), easeOut);
  g.classList.add('done');
}

// ---- equation: chips arrive one by one, then the result counts up ----
export const EQ = { chipH: 86, opW: 48, opH: 40, gap: 10 };
export const chipW = (t: { v: string; l?: string }) => Math.max(92, t.v.length * 18 + 40, (t.l?.length ?? 0) * 8.6 + 30);

async function eq(c: SceneCtx, a: Extract<SceneAction, { eq: unknown }>) {
  const sizes = a.eq.map((t) => ('op' in t ? { w: EQ.opW, h: EQ.opH } : { w: chipW(t), h: EQ.chipH }));
  const res = a.result ? 120 : 0;
  // wide: one row; tall: one column
  const W = sizes.reduce((s, z) => s + z.w, 0) + EQ.gap * (sizes.length - 1);
  const H = sizes.reduce((s, z) => s + z.h, 0) + EQ.gap * (sizes.length - 1) + res;
  let x = (900 - W) / 2;
  let y = c.tall ? (700 - H) / 2 : a.result ? 40 : 107;
  for (const [i, t] of a.eq.entries()) {
    const { w, h } = sizes[i];
    const cx = c.tall ? 250 : x + w / 2;
    const cy = c.tall ? y + h / 2 : y + EQ.chipH / 2;
    const g = el('g', { class: 'op' in t ? 'sc-op' : `sc-chip ${toneOf(t.tone)}` }, c.g);
    if ('op' in t) text(g, { y: 11, 'text-anchor': 'middle' }, t.op);
    else {
      el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14 }, g);
      text(g, { class: 'sc-chip-v', y: t.l ? 4 : 11, 'text-anchor': 'middle' }, t.v);
      if (t.l) text(g, { class: 'sc-chip-l', y: 29, 'text-anchor': 'middle' }, t.l);
    }
    await arrive(c, g, cx, cy);
    await c.sleep(140);
    if (c.tall) y += h + EQ.gap;
    else x += w + EQ.gap;
  }
  if (a.result) {
    await c.sleep(200);
    await countUp(c, c.g, a.result, c.tall ? 250 : 450, c.tall ? y + 52 : 214, c.tall ? 44 : 50);
  }
}

// ---- bars: grow from the left; log scale for values that span powers of ten ----
export const BARS = { wide: { x0: 250, len: 500, row: 50, rows: 250 }, tall: { x0: 30, len: 440, row: 96, rows: 560 } };

async function bars(c: SceneCtx, a: Extract<SceneAction, { bars: unknown }>) {
  const n = a.bars.length;
  const vs = a.bars.map((b) => b.v).concat(a.limit ? [a.limit.v] : []);
  const max = Math.max(...vs);
  const lo = a.log ? Math.log10(Math.min(...vs)) - 0.6 : 0;
  const frac = (v: number) => (a.log ? (Math.log10(v) - lo) / (Math.log10(max) - lo) : v / max);
  const B = c.tall ? BARS.tall : BARS.wide;
  const row = Math.min(B.row, B.rows / n);
  const top = (c.tall ? 360 : 155) - (row * n) / 2;
  if (a.limit) {
    const lx = B.x0 + frac(a.limit.v) * B.len;
    const lg = el('g', { class: 'sc-limit' }, c.g);
    el('line', { x1: lx, x2: lx, y1: top - 6, y2: top + row * n }, lg);
    text(lg, { x: lx, y: top - 14, 'text-anchor': c.tall ? 'end' : 'middle' }, a.limit.l);
  }
  const label = (b: { v: number; text?: string }, e: number) => b.text ?? `${fmt(a.log ? b.v : b.v * e)}${a.unit ? ` ${a.unit}` : ''}`;
  await Promise.all(
    a.bars.map(async (b, i) => {
      await c.sleep(i * 160);
      const y = top + i * row + row / 2;
      const w = Math.max(4, frac(b.v) * B.len);
      const g = el('g', { class: `sc-bar ${toneOf(b.tone ?? 'req')}` }, c.g);
      // tall: the label sits above its bar and the value at the right end of that line
      text(g, { class: 'sc-bar-l', x: c.tall ? B.x0 : B.x0 - 16, y: c.tall ? y - 20 : y + 5, 'text-anchor': c.tall ? 'start' : 'end' }, b.l);
      const bar = el('rect', { x: 0, y: -11, width: w, height: 22, rx: 6 }, g);
      const val = text(g, { class: 'sc-bar-v', x: c.tall ? B.x0 + B.len : B.x0 + 10, y: c.tall ? y - 20 : y + 5, 'text-anchor': c.tall ? 'end' : 'start', opacity: b.text ? 0 : 1 }, '');
      await c.tween(
        800,
        (e) => {
          bar.setAttribute('transform', `translate(${B.x0} ${y}) scale(${Math.max(0.001, e)} 1)`);
          if (!c.tall) val.setAttribute('x', String(B.x0 + w * e + 10));
          val.textContent = label(b, e);
          if (b.text) val.setAttribute('opacity', String(e));
        },
        easeOut,
      );
    }),
  );
}

// ---- curve: the line draws itself, then horizontal marks slide in ----
async function curve(c: SceneCtx, a: Extract<SceneAction, { curve: unknown }>) {
  const P = c.tall ? { L: 40, R: 460, T: 190, B: 520 } : { L: 70, R: 850, T: 46, B: 236 };
  const max = Math.max(...a.curve, ...(a.marks ?? []).map((m) => m.v)) * 1.12;
  const pts = a.curve.map((v, i) => ({ x: P.L + (i * (P.R - P.L)) / (a.curve.length - 1), y: P.B - (v / max) * (P.B - P.T) }));
  // smooth: quadratic segments through the midpoints
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q${pts[i].x} ${pts[i].y} ${(pts[i].x + pts[i + 1].x) / 2} ${(pts[i].y + pts[i + 1].y) / 2}`;
  d += ` L${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
  el('line', { class: 'sc-axis', x1: P.L, x2: P.R, y1: P.B, y2: P.B }, c.g);
  if (a.x) {
    text(c.g, { class: 'sc-cap', x: P.L, y: P.B + 24 }, a.x[0]);
    text(c.g, { class: 'sc-cap', x: P.R, y: P.B + 24, 'text-anchor': 'end' }, a.x[1]);
  }
  const area = el('path', { class: 'sc-area', d: `${d} L${P.R} ${P.B} L${P.L} ${P.B} Z`, opacity: 0 }, c.g);
  const line = el('path', { class: 'sc-line', d }, c.g);
  const len = line.getTotalLength();
  line.setAttribute('stroke-dasharray', String(len));
  await c.tween(
    1400,
    (e) => {
      line.setAttribute('stroke-dashoffset', String(len * (1 - e)));
      area.setAttribute('opacity', String(e));
    },
    easeInOut,
  );
  if (a.peak) {
    const top = pts.reduce((m, p) => (p.y < m.y ? p : m));
    const g = el('g', { class: 'sc-peak tone-err' }, c.g);
    el('circle', { r: 8 }, g);
    text(g, { y: -18, 'text-anchor': 'middle' }, a.peak);
    await arrive(c, g, top.x, top.y);
  }
  for (const m of a.marks ?? []) {
    const y = P.B - (m.v / max) * (P.B - P.T);
    const g = el('g', { class: `sc-mark ${toneOf(m.tone ?? 'miss')}` }, c.g);
    const ln = el('line', { x1: P.L, x2: P.L, y1: y, y2: y }, g);
    const t = text(g, { x: P.R, y: y - 9, 'text-anchor': 'end', opacity: 0 }, m.l);
    await c.tween(
      700,
      (e) => {
        ln.setAttribute('x2', String(P.L + (P.R - P.L) * e));
        t.setAttribute('opacity', String(e));
      },
      easeOut,
    );
    await c.sleep(150);
  }
}

// ---- dots: a grid where `on` of `n` light up ----
export const dotGrid = (n: number, tall: boolean) => {
  const cols = Math.min(n, tall ? 10 : 25);
  return { cols, gap: tall ? 40 : 24, r: tall ? 13 : 8, rows: Math.ceil(n / cols) };
};

async function dots(c: SceneCtx, a: Extract<SceneAction, { dots: unknown }>) {
  const G = dotGrid(a.dots, c.tall);
  const w = (G.cols - 1) * G.gap;
  const h = (G.rows - 1) * G.gap;
  const x0 = (c.tall ? 250 : 450) - w / 2;
  const y0 = (c.tall ? 330 : 128) - h / 2;
  const cs = Array.from({ length: a.dots }, (_, i) => el('circle', { class: 'sc-dot', cx: x0 + (i % G.cols) * G.gap, cy: y0 + Math.floor(i / G.cols) * G.gap, r: G.r }, c.g));
  const cap = text(c.g, { class: 'sc-dots-l', x: c.tall ? 250 : 450, y: y0 + h + G.r + 40, 'text-anchor': 'middle', opacity: 0 }, a.l);
  await c.sleep(300);
  const each = Math.min(45, 900 / Math.max(1, a.on));
  for (let i = 0; i < a.on; i++) {
    cs[i].classList.add('on', toneOf(a.tone ?? 'req'));
    await c.sleep(each);
  }
  await c.tween(400, (e) => cap.setAttribute('opacity', String(e)), easeOut);
}

// ---- ladder: a log time axis (1 ns … 1 s); a probe travels to each item, which pops in ----
export const ladderPos = (s: number, tall: boolean) => {
  const k = (Math.log10(s) + 9) / 9;
  return tall ? 70 + k * 570 : 60 + k * 780;
};

async function ladder(c: SceneCtx, a: Extract<SceneAction, { ladder: unknown }>) {
  const T = c.tall;
  const axis = 205;
  el('line', T ? { class: 'sc-axis', x1: 110, x2: 110, y1: 70, y2: 640 } : { class: 'sc-axis', x1: 60, x2: 840, y1: axis, y2: axis }, c.g);
  for (const [s, l] of [
    [1e-9, '1 ns'],
    [1e-6, '1 µs'],
    [1e-3, '1 ms'],
    [1, '1 s'],
  ] as const) {
    const p = ladderPos(s, T);
    el('line', T ? { class: 'sc-tick', x1: 102, x2: 118, y1: p, y2: p } : { class: 'sc-tick', x1: p, x2: p, y1: axis - 8, y2: axis + 8 }, c.g);
    text(c.g, T ? { class: 'sc-cap', x: 94, y: p + 5, 'text-anchor': 'end' } : { class: 'sc-cap', x: p, y: axis + 34, 'text-anchor': 'middle' }, l);
  }
  const probe = el('circle', { class: 'sc-probe', r: 7, cx: T ? 110 : 60, cy: T ? 70 : axis }, c.g);
  let at = T ? 70 : 60;
  for (const [i, it] of a.ladder.entries()) {
    const p = ladderPos(it.s, T);
    const from = at;
    await c.tween(650, (e) => probe.setAttribute(T ? 'cy' : 'cx', String(from + (p - from) * e)), easeInOut);
    at = p;
    const g = el('g', { class: `sc-rung ${toneOf(it.tone ?? 'req')}` }, c.g);
    el('circle', { r: 11 }, g);
    // wide: labels alternate between two heights above the axis so neighbours don't collide
    const lift = i % 2 ? 100 : 46;
    if (!T) el('line', { class: 'sc-lead', x1: 0, x2: 0, y1: -10, y2: -lift + 8 }, g);
    text(g, T ? { x: 28, y: 6 } : { y: -lift, 'text-anchor': 'middle' }, it.l);
    await arrive(c, g, T ? 110 : p, T ? p : axis, 260);
    await c.sleep(180);
  }
  probe.remove();
}

// ---- meters: capacity bars that fill and turn red past `warn` ----
export const METER = { wide: { x0: 110, len: 680, gap: 90, mid: 160 }, tall: { x0: 40, len: 420, gap: 150, mid: 350 } };

async function meter(c: SceneCtx, a: Extract<SceneAction, { meter: unknown }>) {
  const M = c.tall ? METER.tall : METER.wide;
  const top = M.mid - ((a.meter.length - 1) * M.gap) / 2;
  await Promise.all(
    a.meter.map(async (m, i) => {
      await c.sleep(i * 200);
      const y = top + i * M.gap;
      const f = Math.min(1, m.v / m.max);
      const hot = m.warn !== undefined && f >= m.warn;
      const g = el('g', { class: `sc-meter ${hot ? 'tone-err' : 'tone-ok'}` }, c.g);
      text(g, { class: 'sc-meter-l', x: M.x0, y: y - 32 }, m.l);
      const val = text(g, { class: 'sc-meter-v', x: M.x0 + M.len, y: y - 32, 'text-anchor': 'end' }, '');
      el('rect', { class: 'sc-meter-bg', x: M.x0, y: y - 20, width: M.len, height: 40, rx: 20 }, g);
      const fill = el('rect', { class: 'sc-meter-fill', x: 0, y: -20, width: Math.max(40, f * M.len), height: 40, rx: 20 }, g);
      if (m.warn !== undefined) el('line', { class: 'sc-warn', x1: M.x0 + m.warn * M.len, x2: M.x0 + m.warn * M.len, y1: y - 28, y2: y + 28 }, g);
      await c.tween(
        1100,
        (e) => {
          fill.setAttribute('transform', `translate(${M.x0} ${y}) scale(${Math.max(0.001, e)} 1)`);
          // the bar stops at full; the text still says how far over it is (60 KB on an 8 KB page = 750%)
          val.textContent = `${fmt(m.v * e, m.digits)} / ${fmt(m.max)} ${m.unit} · ${Math.round((m.v / m.max) * e * 100)}%`;
        },
        easeOut,
      );
    }),
  );
}

// ---- seq: a sequence diagram; lanes across, messages arrive one by one down the page ----
export const seqLayout = (lanes: number, msgs: number, tall: boolean) => {
  const x0 = tall ? 80 : 130;
  const x1 = tall ? 420 : 770;
  const xs = Array.from({ length: lanes }, (_, i) => (lanes === 1 ? (x0 + x1) / 2 : x0 + (i * (x1 - x0)) / (lanes - 1)));
  const top = tall ? 120 : 76;
  const row = tall ? Math.min(84, 540 / msgs) : Math.min(46, 210 / msgs);
  return { xs, top, row, head: tall ? 50 : 26 };
};

async function seq(c: SceneCtx, a: Extract<SceneAction, { seq: unknown }>) {
  const L = seqLayout(a.seq.lanes.length, a.seq.msgs.length, c.tall);
  const bottom = L.top + L.row * a.seq.msgs.length;
  a.seq.lanes.forEach((name, i) => {
    el('line', { class: 'sc-life', x1: L.xs[i], x2: L.xs[i], y1: L.head + 18, y2: bottom }, c.g);
    const g = el('g', { class: 'sc-lane', transform: `translate(${L.xs[i]} ${L.head})` }, c.g);
    const w = Math.max(76, name.length * 10.6 + 26);
    el('rect', { x: -w / 2, y: -18, width: w, height: 36, rx: 10 }, g);
    text(g, { y: 6, 'text-anchor': 'middle' }, name);
  });
  for (const [i, m] of a.seq.msgs.entries()) {
    const y = L.top + i * L.row + L.row / 2;
    const g = el('g', { class: `sc-msg ${toneOf(m.tone ?? 'req')}` }, c.g);
    const fx = L.xs[m.from];
    const tx = L.xs[m.to];
    if (m.from === m.to) {
      // a note on one lane: something that happens there (write the WAL, check the cache)
      const w = Math.max(64, m.l.length * 9.8 + 24);
      const note = el('g', { class: 'sc-note' }, g);
      el('rect', { x: -w / 2, y: -15, width: w, height: 30, rx: 8 }, note);
      text(note, { y: 5, 'text-anchor': 'middle' }, m.l);
      await arrive(c, note, fx, y, 280);
    } else {
      const dir = Math.sign(tx - fx);
      const ln = el('line', { x1: fx, x2: fx, y1: y, y2: y }, g);
      const head = el('path', { d: `M0 0 L${-12 * dir} -6 L${-12 * dir} 6 Z`, opacity: 0 }, g);
      const t = text(g, { class: 'sc-msg-l', x: (fx + tx) / 2, y: y - 9, 'text-anchor': 'middle', opacity: 0 }, m.l);
      await c.tween(
        560,
        (e) => {
          const x = fx + (tx - fx) * e;
          ln.setAttribute('x2', String(x - 6 * dir));
          head.setAttribute('transform', `translate(${x} ${y})`);
          head.setAttribute('opacity', String(Math.min(1, e * 3)));
          t.setAttribute('opacity', String(e));
        },
        easeInOut,
      );
    }
    await c.sleep(m.wait ?? 220);
  }
}

// ---- table: rows arrive; some are highlighted or struck through ----
export const tableCols = (cols: string[], rows: string[][]) =>
  cols.map((h, j) => Math.max(h.length, ...rows.map((r) => (r[j] ?? '').length)) * 9 + 26);

async function table(c: SceneCtx, a: Extract<SceneAction, { table: unknown }>) {
  const T = a.table;
  const ws = tableCols(T.cols, T.rows);
  const W = ws.reduce((s, w) => s + w, 0);
  const rowH = c.tall ? 44 : 34;
  const H = rowH * (T.rows.length + 1);
  // small tables grow to fill the wide stage
  const k = c.tall ? 1 : Math.min(1.5, 840 / W, (T.l ? 230 : 270) / H);
  const box = el('g', { transform: `translate(${(c.tall ? 250 : 450) - (W * k) / 2} ${(c.tall ? 330 : T.l ? 136 : 150) - (H * k) / 2}) scale(${k})` }, c.g);
  const x0 = 0;
  const y0 = 0;
  const cell = (g: SVGGElement, vals: string[], cls: string) => {
    let x = 0;
    vals.forEach((v, j) => {
      text(g, { class: cls, x: x + 13, y: rowH / 2 + 5 }, v);
      x += ws[j];
    });
  };
  const head = el('g', { class: 'sc-th', transform: `translate(${x0} ${y0})` }, box);
  el('rect', { width: W, height: rowH, rx: 8 }, head);
  cell(head, T.cols, 'sc-th-t');
  for (const [i, r] of T.rows.entries()) {
    const tone = T.tones?.[i];
    const g = el('g', { class: `sc-tr ${tone ? `hl tone-${tone}` : ''}` }, box);
    el('rect', { width: W, height: rowH - 4, y: 2, rx: 6 }, g);
    cell(g, r, 'sc-td');
    if (T.strike?.includes(i)) el('line', { class: 'sc-strike', x1: 8, x2: W - 8, y1: rowH / 2, y2: rowH / 2 }, g);
    await arrive(c, g, x0, y0 + (i + 1) * rowH, 260);
    await c.sleep(110);
  }
  if (T.l) {
    const cap = text(box, { class: 'sc-dots-l', x: W / 2, y: H + 30 / k, 'text-anchor': 'middle', opacity: 0, style: `font-size:${16 / k}px` }, T.l);
    await c.tween(350, (e) => cap.setAttribute('opacity', String(e)), easeOut);
  }
}

// ---- ring: consistent hashing; each key belongs to the next node clockwise ----
export const RING = { wide: { cx: 450, cy: 152, r: 108 }, tall: { cx: 250, cy: 340, r: 165 } };
const owner = (at: number, nodes: { at: number }[]) => {
  const sorted = [...nodes].sort((p, q) => p.at - q.at);
  return sorted.find((n) => n.at >= at) ?? sorted[0];
};

async function ring(c: SceneCtx, a: Extract<SceneAction, { ring: unknown }>) {
  const R = c.tall ? RING.tall : RING.wide;
  const pt = (deg: number, r = R.r) => ({ x: R.cx + r * Math.sin((deg * Math.PI) / 180), y: R.cy - r * Math.cos((deg * Math.PI) / 180) });
  el('circle', { class: 'sc-ring', cx: R.cx, cy: R.cy, r: R.r }, c.g);
  const nodes = [...a.ring.nodes];
  const drawNode = async (n: { l: string; at: number }, fresh: boolean) => {
    const p = pt(n.at);
    const g = el('g', { class: `sc-rnode ${fresh ? 'tone-ok' : 'tone-req'}` }, c.g);
    el('rect', { x: -14, y: -14, width: 28, height: 28, rx: 7 }, g);
    const out = pt(n.at, R.r + 34);
    text(g, { x: out.x - p.x, y: out.y - p.y + 5, 'text-anchor': out.x > p.x + 4 ? 'start' : out.x < p.x - 4 ? 'end' : 'middle' }, n.l);
    await arrive(c, g, p.x, p.y, 280);
  };
  for (const n of nodes) await drawNode(n, false);
  const keyG = new Map<string, { g: SVGGElement; link: SVGLineElement }>();
  for (const k of a.ring.keys) {
    const p = pt(k.at, R.r - 24);
    const own = pt(owner(k.at, nodes).at, R.r - 16);
    const link = el('line', { class: 'sc-rlink', x1: p.x, y1: p.y, x2: p.x, y2: p.y }, c.g);
    const g = el('g', { class: 'sc-rkey tone-miss' }, c.g);
    el('circle', { r: 7 }, g);
    const lab = pt(k.at, R.r - 48);
    text(g, { x: lab.x - p.x, y: lab.y - p.y + 4, 'text-anchor': 'middle' }, k.l);
    await arrive(c, g, p.x, p.y, 220);
    await c.tween(380, (e) => {
      link.setAttribute('x2', String(p.x + (own.x - p.x) * e));
      link.setAttribute('y2', String(p.y + (own.y - p.y) * e));
    }, easeOut);
    keyG.set(k.l, { g, link });
  }
  if (!a.ring.add) return;
  await c.sleep(500);
  const before = new Map(a.ring.keys.map((k) => [k.l, owner(k.at, nodes)]));
  nodes.push(a.ring.add);
  await drawNode(a.ring.add, true);
  // only the keys that now belong to the new node move
  for (const k of a.ring.keys) {
    const now = owner(k.at, nodes);
    if (now === before.get(k.l)) continue;
    const { g, link } = keyG.get(k.l)!;
    g.setAttribute('class', 'sc-rkey tone-ok');
    const from = { x: Number(link.getAttribute('x2')), y: Number(link.getAttribute('y2')) };
    const to = pt(now.at, R.r - 16);
    await c.tween(520, (e) => {
      link.setAttribute('x2', String(from.x + (to.x - from.x) * e));
      link.setAttribute('y2', String(from.y + (to.y - from.y) * e));
    }, easeInOut);
    link.setAttribute('class', 'sc-rlink moved');
  }
}

/** draws one scene; the caller has already cleared the previous one */
export async function drawScene(c: SceneCtx, a: SceneAction) {
  if ('eq' in a) return eq(c, a);
  if ('bars' in a) return bars(c, a);
  if ('curve' in a) return curve(c, a);
  if ('dots' in a) return dots(c, a);
  if ('ladder' in a) return ladder(c, a);
  if ('meter' in a) return meter(c, a);
  if ('seq' in a) return seq(c, a);
  if ('table' in a) return table(c, a);
  if ('ring' in a) return ring(c, a);
  return countUp(c, el('g', {}, c.g), a.count, c.tall ? 250 : 450, c.tall ? 340 : 150, c.tall ? 52 : 64);
}

export const isScene = (a: object): a is SceneAction => ['eq', 'bars', 'curve', 'dots', 'ladder', 'meter', 'count', 'seq', 'table', 'ring'].some((k) => k in a);
