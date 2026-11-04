// Scenes for step lessons: an equation, bars, a curve, a dot grid, a latency ladder, meters, a counter, a sequence
// diagram, a table or a hash ring, drawn in
// place of the actor boxes so each step can animate its own mechanism. Every motion runs on the Stage's clock, so
// Pause freezes it, Back/Next cancels it and reduced motion jumps to the end.
// Sizes here are mirrored in scripts/validate-steps.mjs, which checks every scene fits both stages.
import type { SceneAction, SceneNumber, StepTone } from '../../types';
import { GLYPHS } from './glyphs';

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

// ---- picture scenes (generated lessons): icons only, the words stay in the lines beside the stage ----
// Each `glyphs` style is its own little machine: an orbit, a conveyor, dominoes, a dealt hand, a constellation, a
// tower, a radar, a balance, a funnel or a stamped checklist. `at` is the line being lit: what is already drawn stays,
// and only the new item animates in, so the picture builds up in step with the lines. Looping background motion is
// CSS (it freezes with Pause via .sl.paused); every entrance runs on the Stage clock.

type GlyphsAction = Extract<SceneAction, { glyphs: unknown }>['glyphs'];
type Style = GlyphsAction['layout'];
type Item = { icon: string; tone?: StepTone };
type Kind = 'tile' | 'card' | 'domino' | 'block' | 'orb';

/** a springy settle: overshoots a little, then rests at 1 */
const spring = (k: number) => 1 - Math.cos(k * Math.PI * 2.4) * Math.exp(-5 * k);
const easeIn = (k: number) => k * k * k;
function bounce(k: number) {
  const n = 7.5625;
  const d = 2.75;
  if (k < 1 / d) return n * k * k;
  if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
  if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
  return n * (k -= 2.625 / d) * k + 0.984375;
}
const setT = (g: Element, x: number, y: number, rot = 0, s: number | [number, number] = 1) =>
  g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${Array.isArray(s) ? s.join(' ') : s})`);
const lerp = (a: number, b: number, e: number) => a + (b - a) * e;
/** runs alongside the main motion: a Back/Next mid-way cancels it quietly instead of as an unhandled rejection */
function bg<T>(p: Promise<T>) {
  p.catch(() => {});
  return p;
}

/** rings that expand and fade where something just landed */
function burst(c: SceneCtx, parent: Element, x: number, y: number, r: number, n = 2) {
  const rings = Array.from({ length: n }, () => el('circle', { class: 'sc-burst', cx: x, cy: y, r: 4 }, parent));
  return c
    .tween(900, (e) => rings.forEach((ring, k) => {
      const f = Math.max(0, Math.min(1, e * 1.3 - k * 0.3));
      ring.setAttribute('r', String(4 + r * f));
      ring.style.opacity = String(0.6 * (1 - f));
    }), easeOut)
    .finally(() => rings.forEach((r) => r.remove()));
}
/** a 24 × 24 stroke icon (glyphs.ts), centred on 0,0 at `size`; each stroke can be drawn on (pathLength 1) */
function glyph(parent: Element, name: string, size: number, dy = 0) {
  const g = el('g', { class: 'sc-glyph', transform: `translate(${-size / 2} ${dy - size / 2}) scale(${size / 24})` }, parent);
  for (const [tag, attrs] of GLYPHS[name] ?? GLYPHS.sparkles) el(tag as 'path', { ...attrs, pathLength: 1 }, g);
  return g;
}
/** strokes an icon on, as if drawn by hand */
function drawOn(c: SceneCtx, g: Element, ms = 650) {
  const parts = [...g.querySelectorAll<SVGElement>('.sc-glyph > *')];
  for (const p of parts) {
    p.style.strokeDasharray = '1';
    p.style.strokeDashoffset = '1';
  }
  return c.tween(ms, (e) => parts.forEach((p) => (p.style.strokeDashoffset = String(1 - e))), easeOut);
}
/** a line that draws itself from its start to its end */
function drawLine(c: SceneCtx, line: SVGElement, ms = 420) {
  line.setAttribute('pathLength', '1');
  line.style.strokeDasharray = '1';
  line.style.strokeDashoffset = '1';
  return c.tween(ms, (e) => (line.style.strokeDashoffset = String(1 - e)), easeOut);
}
async function pop(c: SceneCtx, g: SVGGElement, x: number, y: number, rot = 0, ms = 560) {
  await c.tween(ms, (e) => {
    g.style.opacity = String(Math.min(1, e * 2.5));
    setT(g, x, y, rot, 0.3 + 0.7 * spring(e));
  });
}
/** an icon on a shape; (0,0) is its centre (a domino's: its foot) */
function shape(parent: Element, it: Item, w: number, h: number, kind: Kind) {
  const g = el('g', { class: `sc-piece sc-${kind} ${toneOf(it.tone)}` }, parent);
  if (kind === 'orb') el('circle', { class: 'sc-shape', r: w / 2 }, g);
  else el('rect', { class: 'sc-shape', x: -w / 2, y: kind === 'domino' ? -h : -h / 2, width: w, height: h, rx: kind === 'block' ? 10 : kind === 'card' ? 12 : Math.min(w, h) * 0.26 }, g);
  if (kind === 'card') el('rect', { class: 'sc-card-in', x: -w / 2 + 6, y: -h / 2 + 6, width: w - 12, height: h - 12, rx: 8 }, g);
  if (kind === 'domino') el('line', { class: 'sc-domino-mid', x1: -w / 2 + 8, x2: w / 2 - 8, y1: -h * 0.36, y2: -h * 0.36 }, g);
  glyph(g, it.icon, Math.min(w, kind === 'domino' ? h * 0.55 : h) * 0.52, kind === 'domino' ? -h * 0.66 : 0);
  return g;
}

interface Kit {
  c: SceneCtx;
  root: SVGGElement;
  back: SVGGElement;
  items: Item[];
  n: number;
  at: number;
  W: number;
  H: number;
  tall: boolean;
  hub: string;
  /** item i's piece: tagged with its index, lit when it is the line being read, hidden until a live entrance shows it */
  piece: (i: number, parent: Element, w: number, h: number, kind: Kind, live: boolean) => SVGGElement;
}
interface Machine {
  build(): void;
  add(i: number, live: boolean): Promise<void> | void;
}

function orbit(k: Kit): Machine {
  const { c, tall, n } = k;
  const cx = k.W / 2;
  const cy = k.H / 2;
  const rx = tall ? 165 : 330;
  const ry = tall ? 245 : 105;
  const size = tall ? 78 : 58;
  const hubR = tall ? 62 : 46;
  // wide: start at the side (and turn a ring of 4 by 45°) so items spread out sideways instead of crowding the hub
  const ang = (i: number) => ((tall ? -90 : n % 4 === 0 ? 45 : 0) + (i * 360) / n) * (Math.PI / 180);
  const pt = (a: number, r = 1) => ({ x: cx + rx * r * Math.cos(a), y: cy + ry * r * Math.sin(a) });
  return {
    build() {
      el('ellipse', { class: 'sc-ring', cx, cy, rx, ry }, k.back);
      const squash = el('g', { transform: `translate(${cx} ${cy}) scale(1 ${ry / rx})` }, k.back);
      const spin = el('g', { class: 'sc-spin' }, squash);
      el('circle', { class: 'sc-ghost', r: rx }, spin);
      [0, 1, 2].forEach((j) => el('circle', { class: `sc-spark s${j}`, r: 5 - j, cx: rx * Math.cos(j * 2.1), cy: rx * Math.sin(j * 2.1) }, spin));
      const h = el('g', { class: 'sc-hub' }, k.root);
      el('circle', { class: 'sc-hub-pulse', r: hubR }, h);
      el('circle', { class: 'sc-hub-core', r: hubR }, h);
      glyph(h, k.hub, hubR * 0.95);
      setT(h, cx, cy);
    },
    async add(i, live) {
      const a = ang(i);
      const end = pt(a);
      const spoke = el('line', { class: 'sc-spoke', x1: cx, y1: cy, x2: end.x, y2: end.y }, k.back);
      const g = k.piece(i, k.root, size, size, 'tile', live);
      if (!live) return setT(g, end.x, end.y);
      // spirals out of the hub onto its place on the ring
      await c.tween(900, (e) => {
        const p = pt(a - 2.4 * (1 - e), e);
        g.style.opacity = String(Math.min(1, e * 3));
        setT(g, p.x, p.y, 0, 0.35 + 0.65 * e);
      }, easeOut);
      bg(burst(c, k.back, end.x, end.y, size));
      bg(drawLine(c, spoke));
      await drawOn(c, g);
    },
  };
}

function conveyor(k: Kit): Machine {
  const { c, tall, n } = k;
  const gap = n > 1 ? (tall ? 520 : 680) / (n - 1) : 0;
  const size = Math.min(tall ? 84 : 86, (n > 1 ? gap : 200) - 18);
  const slot = (i: number) => (tall ? { x: 190, y: n > 1 ? 90 + i * gap : 350 } : { x: n > 1 ? 110 + i * gap : 450, y: 108 });
  const belt = (i: number) => (tall ? { x: 392, y: slot(i).y } : { x: slot(i).x, y: 234 });
  const start = tall ? { x: 392, y: 30 } : { x: 30, y: 234 };
  return {
    build() {
      if (tall) el('rect', { class: 'sc-belt', x: 378, y: 30, width: 28, height: 640, rx: 14 }, k.back);
      else el('rect', { class: 'sc-belt', x: 20, y: 220, width: 860, height: 28, rx: 14 }, k.back);
      el('line', tall ? { class: 'sc-belt-run', x1: 392, y1: 40, x2: 392, y2: 660 } : { class: 'sc-belt-run', x1: 30, y1: 234, x2: 870, y2: 234 }, k.back);
      for (const end of tall ? [{ x: 392, y: 44 }, { x: 392, y: 656 }] : [{ x: 34, y: 234 }, { x: 866, y: 234 }]) {
        const r = el('g', { transform: `translate(${end.x} ${end.y})` }, k.back);
        const s = el('g', { class: 'sc-spin fast' }, r);
        el('circle', { class: 'sc-roller', r: 11 }, s);
        el('line', { class: 'sc-roller-l', x1: -11, x2: 11, y1: 0, y2: 0 }, s);
      }
      for (let i = 0; i < n; i++) {
        const s = slot(i);
        const b = belt(i);
        el('line', { class: 'sc-post', x1: s.x, y1: s.y, x2: b.x, y2: b.y }, k.back);
      }
    },
    async add(i, live) {
      const s = slot(i);
      const g = k.piece(i, k.root, size, size, 'tile', live);
      if (!live) return setT(g, s.x, s.y);
      const parcel = el('g', { class: 'sc-parcel' }, k.root);
      el('rect', { x: -17, y: -17, width: 34, height: 34, rx: 8 }, parcel);
      glyph(parcel, 'package', 20);
      const b = belt(i);
      await c.tween(650, (e) => setT(parcel, lerp(start.x, b.x, e), lerp(start.y, b.y, e)), easeInOut);
      // hops off the belt up into its station
      await c.tween(420, (e) => setT(parcel, lerp(b.x, s.x, e), lerp(b.y, s.y, e) - Math.sin(e * Math.PI) * 46, e * 200, 1 - 0.4 * e), easeInOut);
      parcel.remove();
      bg(burst(c, k.back, s.x, s.y, size * 0.9));
      await pop(c, g, s.x, s.y);
      await drawOn(c, g, 450);
    },
  };
}

function dominoes(k: Kit): Machine {
  const { c, tall, n } = k;
  const per = tall ? Math.min(4, n) : n;
  // close together, so a tipping domino lands on the next one
  const gap = per > 1 ? Math.min(tall ? 110 : 120, (tall ? 330 : 680) / (per - 1)) : 0;
  const w = Math.min(tall ? 56 : 62, (per > 1 ? gap : 200) * 0.55);
  const h = w * 1.75;
  const rows = Math.ceil(n / per);
  const floor = (r: number) => (tall ? 350 - (rows - 1) * 150 + r * 300 : 262);
  const foot = (i: number) => ({ x: (tall ? 250 : 450) + ((i % per) - (per - 1) / 2) * gap, y: floor(Math.floor(i / per)) });
  const LEAN = per > 1 ? Math.min(32, (Math.asin(Math.min(1, (gap - w * 0.9) / h)) * 180) / Math.PI) : 0;
  return {
    build() {
      for (let r = 0; r < rows; r++) el('line', { class: 'sc-floor', x1: tall ? 40 : 40, x2: tall ? 460 : 860, y1: floor(r), y2: floor(r) }, k.back);
    },
    async add(i, live) {
      const f = foot(i);
      const g = k.piece(i, k.root, w, h, 'domino', live);
      if (!live) return setT(g, f.x, f.y, i < k.at && i % per !== per - 1 ? LEAN : 0);
      // stands up from the floor…
      await c.tween(520, (e) => {
        g.style.opacity = String(Math.min(1, e * 3));
        setT(g, f.x, f.y, 0, [1, 0.08 + 0.92 * spring(e)]);
      });
      bg(drawOn(c, g, 450));
      // …then the one before tips over into it, and it wobbles from the knock
      const prev = k.root.querySelector<SVGGElement>(`[data-i="${i - 1}"]`);
      if (prev && (i - 1) % per !== per - 1) {
        const pf = foot(i - 1);
        await c.tween(380, (e) => setT(prev, pf.x, pf.y, LEAN * e), easeIn);
        bg(burst(c, k.back, f.x - w / 2, f.y - h * 0.8, 26, 1));
        await c.tween(420, (e) => setT(g, f.x, f.y, 7 * Math.sin(e * Math.PI * 2) * (1 - e)));
      }
    },
  };
}

function deal(k: Kit): Machine {
  const { c, tall, n } = k;
  const rows = Math.ceil(n / 2);
  const rowGap = Math.min(170, 580 / rows);
  const spacing = Math.min(130, 760 / n);
  const w = tall ? (rowGap - 18) * 0.8 : Math.min(96, spacing * 0.9);
  const h = tall ? rowGap - 18 : w * 1.3;
  const slot = (i: number) => {
    if (tall) return { x: 250 + (i % 2 ? 100 : -100), y: 350 + (Math.floor(i / 2) - (rows - 1) / 2) * rowGap, rot: i % 2 ? 5 : -5 };
    const off = i - (n - 1) / 2;
    return { x: 450 + off * spacing, y: 150 + off * off * 4, rot: off * 5 };
  };
  const deck = tall ? { x: 250, y: 650 } : { x: 60, y: 236 };
  return {
    build() {
      for (let d = 2; d >= 0; d--) el('rect', { class: 'sc-deck', x: deck.x - 24 + d * 3, y: deck.y - 32 - d * 3, width: 48, height: 64, rx: 7 }, k.back);
    },
    async add(i, live) {
      const s = slot(i);
      const g = k.piece(i, k.root, w, h, 'card', live);
      if (!live) return setT(g, s.x, s.y, s.rot);
      // flies off the deck, spinning, and flips face up halfway
      await c.tween(760, (e) => {
        g.style.opacity = String(Math.min(1, e * 4));
        g.classList.toggle('face-down', e < 0.5);
        setT(g, lerp(deck.x, s.x, e), lerp(deck.y, s.y, e) - Math.sin(e * Math.PI) * 50, s.rot - 220 * (1 - e), [Math.max(0.02, Math.abs(Math.cos(e * Math.PI))) * lerp(0.5, 1, e), lerp(0.5, 1, e)]);
      }, easeOut);
      g.classList.remove('face-down');
      bg(burst(c, k.back, s.x, s.y, w));
      await drawOn(c, g, 500);
    },
  };
}

function constellation(k: Kit): Machine {
  const { c, tall, n } = k;
  const size = 74;
  const slot = (i: number) =>
    tall ? { x: 250 + (n > 1 ? (i % 2 ? 105 : -105) : 0), y: n > 1 ? 90 + i * (520 / (n - 1)) : 350 } : { x: n > 1 ? 100 + i * (700 / (n - 1)) : 450, y: 150 + (n > 1 ? (i % 2 ? 62 : -62) : 0) };
  return {
    build() {
      let seed = 7 + n;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let s = 0; s < 34; s++) {
        const star = el('circle', { class: 'sc-star', cx: rnd() * k.W, cy: rnd() * k.H, r: 0.8 + rnd() * 1.6 }, k.back);
        star.style.animationDelay = `${(rnd() * -3).toFixed(2)}s`;
      }
    },
    async add(i, live) {
      const s = slot(i);
      const link = i > 0 ? el('line', { class: 'sc-constel', x1: slot(i - 1).x, y1: slot(i - 1).y, x2: s.x, y2: s.y }, k.back) : null;
      const g = k.piece(i, k.root, size, size, 'orb', live);
      if (!live) return setT(g, s.x, s.y);
      if (link) await drawLine(c, link, 520);
      bg(burst(c, k.back, s.x, s.y, size * 1.1, 3));
      await pop(c, g, s.x, s.y, 0, 620);
      await drawOn(c, g, 500);
    },
  };
}

function tower(k: Kit): Machine {
  const { c, tall, n } = k;
  // wide: a staircase rising left to right; tall: a pyramid stacked bottom up
  const colW = Math.min(130, 720 / n);
  const tallH = Math.min(78, 580 / n);
  const box = (i: number) =>
    tall
      ? { x: 250, y: 660 - tallH * (i + 0.5) - i * 3, w: 420 - (i * 240) / Math.max(n, 1), h: tallH }
      : (() => {
          const bh = 70 + (n > 1 ? i * Math.min(48, 160 / (n - 1)) : 60);
          return { x: 450 + (i - (n - 1) / 2) * colW, y: 282 - bh / 2, w: colW - 12, h: bh };
        })();
  const ground = tall ? 662 : 284;
  return {
    build() {
      el('line', { class: 'sc-floor', x1: 30, x2: k.W - 30, y1: ground, y2: ground }, k.back);
    },
    async add(i, live) {
      const b = box(i);
      const g = k.piece(i, k.root, b.w, b.h, 'block', live);
      if (!live) return setT(g, b.x, b.y);
      // drops from above the stage and bounces to rest, with a puff of dust
      await c.tween(760, (e) => {
        g.style.opacity = '1';
        setT(g, b.x, lerp(-b.h, b.y, e));
      }, bounce);
      const foot = b.y + b.h / 2;
      const dust = [-1, 1].map((d) => ({ d, n: el('circle', { class: 'sc-dust', cx: b.x + (d * b.w) / 2, cy: foot, r: 4 }, k.back) }));
      const squash = bg(c.tween(300, (e) => setT(g, b.x, b.y, 0, [1 + 0.06 * Math.sin(e * Math.PI), 1 - 0.08 * Math.sin(e * Math.PI)])));
      await c.tween(420, (e) => dust.forEach(({ d, n: p }) => {
        p.setAttribute('cx', String(b.x + (d * b.w) / 2 + d * 30 * e));
        p.setAttribute('cy', String(foot - 10 * Math.sin(e * Math.PI)));
        p.style.opacity = String(1 - e);
      }), easeOut);
      dust.forEach(({ n: p }) => p.remove());
      await squash;
      await drawOn(c, g, 450);
    },
  };
}

function radar(k: Kit): Machine {
  const { c, tall, n } = k;
  const cx = k.W / 2;
  const cy = k.H / 2;
  const R = tall ? 205 : 134;
  const rr = R * 0.66;
  const size = Math.min(tall ? 72 : 52, ((2 * Math.PI * rr) / n) * 0.7);
  const pos = (i: number) => {
    const a = (-70 + (i * 360) / n) * (Math.PI / 180);
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) };
  };
  return {
    build() {
      for (const r of [R / 3, (2 * R) / 3, R]) el('circle', { class: 'sc-radar-ring', cx, cy, r }, k.back);
      el('line', { class: 'sc-radar-ring', x1: cx - R, x2: cx + R, y1: cy, y2: cy }, k.back);
      el('line', { class: 'sc-radar-ring', x1: cx, x2: cx, y1: cy - R, y2: cy + R }, k.back);
      const at = el('g', { transform: `translate(${cx} ${cy})` }, k.back);
      const spin = el('g', { class: 'sc-spin sweep' }, at);
      el('circle', { class: 'sc-ghost', r: R }, spin);
      const a = (-42 * Math.PI) / 180;
      el('path', { class: 'sc-wedge', d: `M0 0 L${R} 0 A${R} ${R} 0 0 0 ${R * Math.cos(a)} ${R * Math.sin(a)} Z` }, spin);
      el('line', { class: 'sc-sweep-edge', x1: 0, y1: 0, x2: R, y2: 0 }, spin);
      el('circle', { class: 'sc-radar-dot', cx, cy, r: 5 }, k.back);
    },
    async add(i, live) {
      const p = pos(i);
      const g = k.piece(i, k.root, size, size, 'orb', live);
      if (!live) return setT(g, p.x, p.y);
      const beam = el('line', { class: 'sc-beam', x1: cx, y1: cy, x2: p.x, y2: p.y }, k.back);
      await drawLine(c, beam, 300);
      bg(burst(c, k.back, p.x, p.y, size, 3));
      await pop(c, g, p.x, p.y);
      bg(c.tween(500, (e) => (beam.style.opacity = String(1 - e))).then(() => beam.remove()));
      await drawOn(c, g, 450);
    },
  };
}

function balance(k: Kit): Machine {
  const { c, tall, n } = k;
  const pv = tall ? { x: 250, y: 250 } : { x: 450, y: 92 };
  const L = tall ? 180 : 270;
  const hang = tall ? 200 : 62;
  const size = tall ? 64 : 50;
  const m = Math.ceil(n / 2);
  const local = (j: number) =>
    tall && m > 2 ? { x: ((j % 2) - 0.5) * (size + 8), y: -size / 2 - 6 - Math.floor(j / 2) * (size + 6) } : { x: (j - (m - 1) / 2) * (size + 6), y: -size / 2 - 6 };
  const plateW = (tall && m > 2 ? 2 : m) * (size + 6) + 20;
  const q = <T extends Element>(s: string) => k.root.querySelector<T>(s)!;
  const tiltFor = (count: number) => {
    const left = Math.ceil(count / 2);
    return Math.max(-14, Math.min(14, (count - left - left) * 8));
  };
  /** the beam at angle θ (degrees): the strings and pans follow its ends */
  const pose = (deg: number) => {
    const t = (deg * Math.PI) / 180;
    q<SVGGElement>('.sc-beam-g').setAttribute('transform', `rotate(${deg} ${pv.x} ${pv.y})`);
    [-1, 1].forEach((s) => {
      const ex = pv.x + s * L * Math.cos(t);
      const ey = pv.y + s * L * Math.sin(t);
      const str = q<SVGLineElement>(`.sc-string.s${s + 1}`);
      str.setAttribute('x1', String(ex));
      str.setAttribute('y1', String(ey));
      str.setAttribute('x2', String(ex));
      str.setAttribute('y2', String(ey + hang));
      setT(q(`.sc-pan.s${s + 1}`), ex, ey + hang);
    });
    k.root.dataset.tilt = String(deg);
  };
  return {
    build() {
      el('path', { class: 'sc-stand', d: `M${pv.x} ${pv.y} L${pv.x - 34} ${tall ? 660 : 286} L${pv.x + 34} ${tall ? 660 : 286} Z` }, k.back);
      const beam = el('g', { class: 'sc-beam-g' }, k.root);
      el('line', { class: 'sc-beam-bar', x1: pv.x - L, x2: pv.x + L, y1: pv.y, y2: pv.y }, beam);
      el('circle', { class: 'sc-pivot', cx: pv.x, cy: pv.y, r: 9 }, beam);
      [-1, 1].forEach((s) => {
        el('line', { class: `sc-string s${s + 1}` }, k.root);
        const pan = el('g', { class: `sc-pan s${s + 1}` }, k.root);
        el('path', { class: 'sc-plate', d: `M${-plateW / 2} 0 Q0 22 ${plateW / 2} 0 Z` }, pan);
      });
      pose(0);
    },
    async add(i, live) {
      const s = i % 2 ? 1 : -1;
      const j = Math.floor(i / 2);
      const pan = q<SVGGElement>(`.sc-pan.s${s + 1}`);
      const p = local(j);
      const g = k.piece(i, pan, size, size, 'tile', live);
      const from = Number(k.root.dataset.tilt ?? 0);
      const to = tiltFor(i + 1);
      if (!live) {
        setT(g, p.x, p.y);
        return pose(to);
      }
      // drops into its pan, then the beam swings to the new weight
      await c.tween(560, (e) => {
        g.style.opacity = String(Math.min(1, e * 3));
        setT(g, p.x, lerp(p.y - 160, p.y, e));
      }, bounce);
      await c.tween(900, (e) => pose(lerp(from, to, spring(e))));
      await drawOn(c, g, 450);
    },
  };
}

function funnel(k: Kit): Machine {
  const { c, tall, n } = k;
  const rows = Math.ceil(n / 2);
  const size = tall ? 70 : 50;
  const out = (i: number) =>
    tall
      ? { x: 250 + (i % 2 ? 80 : -80), y: 485 + (Math.floor(i / 2) - (rows - 1) / 2) * Math.min(90, 330 / rows) }
      : { x: 690 + (i % 2 ? 100 : 0), y: 150 + (Math.floor(i / 2) - (rows - 1) / 2) * 64 };
  const mouth = tall ? { x: 250, y: 90 } : { x: 330, y: 150 };
  const neck = tall ? { x: 250, y: 300 } : { x: 545, y: 150 };
  const entry = (i: number) => (tall ? { x: 110 + (i % 3) * 140, y: 30 } : { x: 70, y: 60 + (i % 3) * 90 });
  return {
    build() {
      const d = tall ? 'M60 70 L440 70 L275 270 L275 320 L225 320 L225 270 Z' : 'M310 30 L310 270 L500 172 L560 172 L560 128 L500 128 Z';
      el('path', { class: 'sc-funnel', d }, k.back);
      el('path', { class: 'sc-funnel-flow', d: tall ? 'M120 90 Q250 150 250 310' : 'M330 60 Q420 150 555 150 M330 240 Q420 150 555 150' }, k.back);
    },
    async add(i, live) {
      const o = out(i);
      const g = k.piece(i, k.root, size, size, 'tile', live);
      if (!live) return setT(g, o.x, o.y);
      const e0 = entry(i);
      // sucked into the mouth, spun through the neck, and dropped into its place in the sorted pile
      await c.tween(520, (e) => {
        g.style.opacity = String(Math.min(1, e * 3));
        setT(g, lerp(e0.x, mouth.x, e), lerp(e0.y, mouth.y, e), 0, lerp(1, 0.8, e));
      }, easeIn);
      await c.tween(460, (e) => setT(g, lerp(mouth.x, neck.x, e), lerp(mouth.y, neck.y, e), 360 * e, lerp(0.8, 0.35, e)), easeInOut);
      await c.tween(560, (e) => setT(g, lerp(neck.x, o.x, e), lerp(neck.y, o.y, e) - Math.sin(e * Math.PI) * 30, 0, 0.35 + 0.65 * spring(e)), easeOut);
      bg(burst(c, k.back, o.x, o.y, size));
      await drawOn(c, g, 450);
    },
  };
}

function stamp(k: Kit): Machine {
  const { c, tall, n } = k;
  const cols = tall ? Math.min(2, n) : Math.min(5, n);
  const rows = Math.ceil(n / cols);
  const gapX = tall ? 200 : 160;
  const gapY = tall ? Math.min(170, 600 / rows) : Math.min(140, 270 / rows);
  const size = Math.min(tall ? 120 : 100, gapY - 28, gapX - 44);
  const pos = (i: number) => {
    const r = Math.floor(i / cols);
    const inRow = Math.min(cols, n - r * cols);
    return { x: k.W / 2 + ((i % cols) - (inRow - 1) / 2) * gapX, y: k.H / 2 + (r - (rows - 1) / 2) * gapY };
  };
  const seal = (g: SVGGElement) => {
    const m = el('g', { class: 'sc-seal' }, g);
    el('circle', { r: 16 }, m);
    el('path', { class: 'sc-tick', d: 'M -7 0 L -2 5 L 7 -5' }, m);
    return m;
  };
  return {
    build() {},
    async add(i, live) {
      const p = pos(i);
      const g = k.piece(i, k.root, size, size, 'tile', live);
      const m = seal(g);
      const sx = size / 2 - 4;
      const sy = size / 2 - 4;
      if (!live) {
        setT(m, sx, sy);
        return setT(g, p.x, p.y);
      }
      m.style.opacity = '0';
      await c.tween(420, (e) => {
        g.style.opacity = String(e);
        setT(g, p.x, p.y + 40 * (1 - e));
      }, easeOut);
      await drawOn(c, g, 420);
      // the stamp slams down, the card jolts and a shockwave rolls out
      await c.tween(240, (e) => {
        m.style.opacity = String(e);
        setT(m, sx, sy, -30 * (1 - e), lerp(2.8, 1, e));
      }, easeIn);
      bg(burst(c, k.back, p.x + sx, p.y + sy, 44, 2));
      await c.tween(300, (e) => setT(g, p.x + 4 * Math.sin(e * Math.PI * 6) * (1 - e), p.y));
    },
  };
}

const MACHINES: Record<Style, (k: Kit) => Machine> = { orbit, conveyor, dominoes, deal, constellation, tower, radar, balance, funnel, stamp };

async function glyphs(c: SceneCtx, a: Extract<SceneAction, { glyphs: unknown }>) {
  const { items, layout, hub, at } = a.glyphs;
  const n = items.length;
  const key = JSON.stringify([items, layout, hub, c.tall]);
  let root = c.g.querySelector<SVGGElement>(':scope > .sc-machine');
  const fresh = !root || root.dataset.key !== key || Number(root.dataset.drawn) > at;
  if (fresh) {
    c.g.replaceChildren();
    root = el('g', { class: `sc-machine sc-${layout}` }, c.g);
    root.dataset.key = key;
    root.dataset.drawn = '0';
    el('g', { class: 'sc-back' }, root);
  }
  const r = root!;
  const back = r.querySelector<SVGGElement>(':scope > .sc-back')!;
  const kit: Kit = {
    c, root: r, back, items, n, at, W: c.tall ? 500 : 900, H: c.tall ? 700 : 300, tall: c.tall, hub: hub ?? 'sparkles',
    piece: (i, parent, w, h, kind, live) => {
      const g = shape(parent, items[i], w, h, kind);
      g.dataset.i = String(i);
      if (i === at) g.classList.add('now');
      if (live) g.style.opacity = '0';
      return g;
    },
  };
  const m = MACHINES[layout](kit);
  if (fresh) m.build();
  for (const old of r.querySelectorAll('.sc-piece.now')) old.classList.remove('now');
  for (let i = Number(r.dataset.drawn); i <= at && i < n; i++) {
    r.dataset.drawn = String(i + 1);
    await m.add(i, i === at);
    const g = r.querySelector<SVGGElement>(`[data-i="${i}"]`);
    if (g) g.style.opacity = '';
  }
  r.querySelector(`[data-i="${at}"]`)?.classList.add('now');
}

/** the opening picture: a portal of counter-rotating rings, drifting motes and the subject's icon drawing itself */
async function hero(c: SceneCtx, a: Extract<SceneAction, { hero: unknown }>) {
  const cx = c.tall ? 250 : 450;
  const cy = c.tall ? 330 : 150;
  const R = c.tall ? 120 : 88;
  const back = el('g', { transform: `translate(${cx} ${cy})` }, c.g);
  for (const [r, cls] of [[R + 20, ''], [R + 40, 'rev']] as const) {
    const s = el('g', { class: `sc-spin ${cls}` }, back);
    el('circle', { class: 'sc-portal', r }, s);
    el('circle', { class: 'sc-spark s0', r: 4, cx: r, cy: 0 }, s);
  }
  for (let m = 0; m < 8; m++) {
    const ang = (m / 8) * Math.PI * 2;
    const mote = el('circle', { class: 'sc-mote', r: 2.5, cx: Math.cos(ang) * (R + 8), cy: Math.sin(ang) * (R + 8) }, back);
    mote.style.animationDelay = `${(-m * 0.37).toFixed(2)}s`;
    mote.style.setProperty('--dx', `${(Math.cos(ang) * 26).toFixed(1)}px`);
    mote.style.setProperty('--dy', `${(Math.sin(ang) * 26).toFixed(1)}px`);
  }
  const g = el('g', { class: `sc-hero ${toneOf(a.hero.tone)}` }, c.g);
  el('circle', { r: R }, g);
  glyph(g, a.hero.icon, R * 0.95);
  g.style.opacity = '0';
  bg(burst(c, c.g, cx, cy, R + 30, 3));
  await pop(c, g, cx, cy, 0, 640);
  await drawOn(c, g, 1100);
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
  if ('hero' in a) return hero(c, a);
  if ('glyphs' in a) return glyphs(c, a);
  return countUp(c, el('g', {}, c.g), a.count, c.tall ? 250 : 450, c.tall ? 340 : 150, c.tall ? 52 : 64);
}

export const SCENE_KEYS = ['eq', 'bars', 'curve', 'dots', 'ladder', 'meter', 'count', 'seq', 'table', 'ring', 'hero', 'glyphs'];
export const isScene = (a: object): a is SceneAction => SCENE_KEYS.some((k) => k in a);
