// The diagram of a step lesson (M11): draws the actors once, then plays StepActions on top.
// Imperative on purpose: packets move every frame, and React state per frame would re-render the whole lesson.
import type { StepAction, StepActor, StepLesson } from '../../types';
import { drawScene, easeInOut, el, isScene, text } from './scenes';

// box size, VIEW and toTall are mirrored in scripts/validate-steps.mjs, which checks every lesson fits both stages
const BOX_W = 190;
const BOX_H = 72;
/** the stage in content coordinates (wide) and on phones (tall: the left-to-right row becomes top-to-bottom) */
export const VIEW = { wide: '0 0 900 300', tall: '0 0 500 700' };
type Pt = { x: number; y: number };
const toTall = (p: Pt): Pt => ({ x: 190 + (p.y - 130) * 1.45, y: 90 + p.x * 0.68 });

export class Cancelled extends Error {}

export class Stage {
  private token = 0;
  paused = false;
  private readonly reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly fx: SVGGElement;
  /** charts and equations (scenes.ts); while one is up, the boxes step aside */
  private readonly scene: SVGGElement;
  private readonly svg: SVGSVGElement;
  private readonly keysG: SVGGElement;
  private readonly nodes = new Map<string, SVGGElement>();
  private readonly lesson: StepLesson;
  private readonly onSay: (line: number) => void;
  private readonly tall: boolean;

  constructor(svg: SVGSVGElement, lesson: StepLesson, onSay: (line: number) => void, tall = false) {
    this.lesson = lesson;
    this.onSay = onSay;
    this.tall = tall;
    this.svg = svg;
    svg.replaceChildren();
    const nodesG = el('g', { class: 'st-nodes' }, svg);
    this.keysG = el('g', { class: 'st-keys' }, svg);
    this.scene = el('g', { class: 'st-scene' }, svg);
    this.fx = el('g', {}, svg);
    for (const a of lesson.actors) {
      const c = this.at(a.id);
      const g = el('g', { class: 'st-node', transform: `translate(${c.x - BOX_W / 2} ${c.y - BOX_H / 2})` }, nodesG);
      el('rect', { width: BOX_W, height: BOX_H, rx: 14 }, g);
      text(g, { class: 'st-node-t', x: BOX_W / 2, y: a.sub ? 31 : 43, 'text-anchor': 'middle' }, a.label);
      if (a.sub) text(g, { class: 'st-node-s', x: BOX_W / 2, y: 53, 'text-anchor': 'middle' }, a.sub);
      this.nodes.set(a.id, g);
    }
    this.reset();
  }

  private actor(id: string): StepActor {
    const a = this.lesson.actors.find((x) => x.id === id);
    if (!a) throw new Error(`unknown actor "${id}"`);
    return a;
  }
  /** where an actor's centre is drawn in the current layout */
  private at(id: string): Pt {
    const a = this.actor(id);
    return this.tall ? toTall(a) : { x: a.x, y: a.y };
  }

  /** back to the starting picture; stops whatever was playing */
  reset() {
    this.token++;
    this.paused = false;
    this.fx.replaceChildren();
    this.clearScene();
    this.keys([]);
    for (const a of this.lesson.actors) {
      const g = this.nodes.get(a.id)!;
      g.classList.remove('lit', 'down', 'wrongpick');
      g.classList.toggle('hidden', !!a.hidden);
    }
    this.pickable(null);
  }

  /** make actors clickable for a "pick" task; null turns it off */
  pickable(ids: string[] | null, onPick?: (id: string) => void) {
    for (const [id, g] of this.nodes) {
      const on = !!ids?.includes(id);
      g.classList.toggle('pickable', on);
      if (!on) {
        g.removeAttribute('tabindex');
        g.removeAttribute('role');
        g.removeAttribute('aria-label');
        g.onclick = g.onkeydown = null;
        continue;
      }
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', this.actor(id).label);
      g.onclick = () => onPick?.(id);
      g.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPick?.(id);
        }
      };
    }
  }
  wrongPick(id: string) {
    this.nodes.get(id)?.classList.add('wrongpick');
  }

  /** waits on frames, so pausing freezes it */
  sleep(ms: number) {
    const my = this.token;
    let left = this.reduce ? Math.min(ms, 150) : ms;
    let last = performance.now();
    return new Promise<void>((res, rej) => {
      const tick = (now: number) => {
        if (my !== this.token) return rej(new Cancelled());
        if (!this.paused) left -= now - last;
        last = now;
        if (left <= 0) res();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  private clearScene() {
    this.scene.replaceChildren();
    this.svg.classList.remove('scene-on');
  }

  private tween(ms: number, frame: (e: number) => void, ease: (k: number) => number = easeInOut) {
    const my = this.token;
    let t = 0;
    let last = performance.now();
    return new Promise<void>((res, rej) => {
      const step = (now: number) => {
        if (my !== this.token) return rej(new Cancelled());
        if (!this.paused) t += now - last;
        last = now;
        const k = this.reduce ? 1 : Math.min(1, t / ms);
        frame(ease(k));
        if (k >= 1) res();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  private async send(from: string, to: string, label = '', tone = 'req', curve = false, lane = 0) {
    const a = this.at(from);
    const b = this.at(to);
    // leave and arrive at the box edges facing each other, along whichever way the boxes are further apart
    const sideways = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
    let p: Pt, q: Pt, c: Pt;
    if (sideways) {
      const dir = Math.sign(b.x - a.x) || 1;
      p = { x: a.x + (dir * BOX_W) / 2, y: a.y + lane };
      q = { x: b.x - (dir * BOX_W) / 2, y: b.y + lane };
      c = { x: (p.x + q.x) / 2, y: Math.min(p.y, q.y) - 140 };
    } else {
      const dir = Math.sign(b.y - a.y) || 1;
      p = { x: a.x + lane, y: a.y + (dir * BOX_H) / 2 };
      q = { x: b.x + lane, y: b.y - (dir * BOX_H) / 2 };
      // bypassing the box in between: leave and arrive on the right and arc out
      if (curve) [p, q] = [{ x: a.x + BOX_W / 2, y: a.y }, { x: b.x + BOX_W / 2, y: b.y }];
      c = { x: Math.min(Math.max(p.x, q.x) + 170, this.tall ? 490 : 890), y: (p.y + q.y) / 2 };
    }
    let arc: SVGPathElement | undefined;
    if (curve) arc = el('path', { class: `st-arc tone-${tone}`, d: `M${p.x} ${p.y} Q${c.x} ${c.y} ${q.x} ${q.y}` }, this.fx);
    const g = el('g', { class: `st-pk tone-${tone}` }, this.fx);
    el('circle', { r: 8 }, g);
    // moving up/down, a label above the dot would cover the box it leaves: put it beside
    if (label) text(g, { class: 'st-pk-l', ...(sideways ? { y: -15, 'text-anchor': 'middle' } : { x: 16, y: 5 }) }, label);
    try {
      await this.tween(curve ? 950 : 850, (e) => {
        const x = curve ? (1 - e) ** 2 * p.x + 2 * (1 - e) * e * c.x + e * e * q.x : p.x + (q.x - p.x) * e;
        const y = curve ? (1 - e) ** 2 * p.y + 2 * (1 - e) * e * c.y + e * e * q.y : p.y + (q.y - p.y) * e;
        g.setAttribute('transform', `translate(${x} ${y})`);
      });
    } finally {
      g.remove();
      arc?.remove();
    }
  }

  private async badge(id: string, s: string, tone = 'ok', ms = 900) {
    const a = this.at(id);
    const g = el('g', { class: `st-badge tone-${tone}`, transform: `translate(${a.x} ${a.y - BOX_H / 2 - 20})` }, this.fx);
    const w = s.length * 9.6 + 26;
    el('rect', { x: -w / 2, y: -14, width: w, height: 26, rx: 13 }, g);
    text(g, { y: 4, 'text-anchor': 'middle' }, s);
    try {
      await this.sleep(ms);
    } finally {
      g.remove();
    }
  }

  private keys(ks: { key: string; note?: string; gone?: boolean }[]) {
    this.keysG.replaceChildren();
    const under = this.lesson.keysUnder ? this.at(this.lesson.keysUnder) : null;
    if (!under) return;
    ks.forEach((k, i) => {
      const g = el('g', { class: `st-key ${k.gone ? 'gone' : ''}`, transform: `translate(${under.x - 140} ${under.y + BOX_H / 2 + 12 + i * 34})` }, this.keysG);
      el('rect', { width: 280, height: 29, rx: 8 }, g);
      text(g, { x: 10, y: 20 }, k.gone ? `${k.key}  ✕ deleted` : k.key);
      if (k.note && !k.gone) text(g, { class: 'st-key-note', x: 270, y: 20, 'text-anchor': 'end' }, k.note);
    });
  }

  async do(a: StepAction) {
    if (isScene(a)) {
      this.clearScene();
      this.svg.classList.add('scene-on');
      await drawScene({ g: this.scene, tall: this.tall, tween: (ms, f, e) => this.tween(ms, f, e), sleep: (ms) => this.sleep(ms) }, a);
    } else if ('say' in a) this.onSay(a.say);
    else if ('send' in a) {
      const n = a.count ?? 1;
      await Promise.all(
        Array.from({ length: n }, (_, k) =>
          this.sleep(k * 120).then(() => this.send(a.send[0], a.send[1], k === n - 1 ? a.label : '', a.tone, a.curve, n > 1 ? (k - (n - 1) / 2) * 14 : 0)),
        ),
      );
    } else if ('badge' in a) await this.badge(a.badge, a.text, a.tone, a.ms);
    else if ('lit' in a) this.nodes.get(a.lit)?.classList.toggle('lit', a.on ?? true);
    else if ('down' in a) this.nodes.get(a.down)?.classList.toggle('down', a.on ?? true);
    else if ('show' in a) this.nodes.get(a.show)?.classList.toggle('hidden', !(a.on ?? true));
    else if ('keys' in a) this.keys(a.keys);
    else if ('wait' in a) await this.sleep(a.wait);
  }

  async play(actions: StepAction[]) {
    for (const a of actions) await this.do(a);
  }

  /** GIF-style: repeats until the step changes (once with reduced motion); `setup` restores the start each loop */
  async loop(actions: StepAction[], setup: StepAction[] = []) {
    for (;;) {
      this.fx.replaceChildren();
      this.clearScene();
      for (const g of this.nodes.values()) g.classList.remove('lit');
      // an answer scene replaces the question scene anyway: don't replay it every loop
      await this.play(actions.some(isScene) ? setup.filter((x) => !isScene(x)) : setup);
      this.onSay(-1);
      await this.play(actions);
      this.onSay(Number.MAX_SAFE_INTEGER);
      if (this.reduce) return;
      await this.sleep(1800);
    }
  }
}

/** a cancelled animation is not an error */
export const quiet = (p: Promise<unknown>) =>
  p.catch((e: unknown) => {
    if (!(e instanceof Cancelled)) throw e;
  });

// ---- the TTL-jitter chart (slider task, model 'ttl-jitter') ----

/** 40 keys written at once with a 600 s TTL: how bunched up do their expiries land for a given jitter? */
export function jitterPeak(jitterPct: number, keys = 40, bins = 24) {
  const counts = Array<number>(bins).fill(0);
  for (let k = 0; k < keys; k++) {
    const x = (k / (keys - 1)) * 2 - 1;
    const t = 600 * (1 + x * (jitterPct / 100));
    counts[Math.max(0, Math.min(bins - 1, Math.floor(((t - 420) / 360) * bins)))]++;
  }
  return { counts, peak: Math.max(...counts) };
}
/** calm enough: at least ±10% and no more than 5 misses landing together */
export const jitterCalm = (jitterPct: number) => jitterPct >= 10 && jitterPeak(jitterPct).peak <= 5;

// ---- the hit-ratio chart (slider task, model 'hit-ratio'): the section's own numbers ----

export const HIT = { qps: 50_000, dbLimit: 500, tCache: 0.5, tDb: 10 };
/** database reads a second at hit ratio h (0–1): only misses reach it */
export const dbLoad = (h: number) => Math.round(HIT.qps * (1 - h));
/** average read time: every read pays the cache, a miss also pays the database */
export const effLatency = (h: number) => HIT.tCache + (1 - h) * HIT.tDb;
/** safe once the database is within its limit (h ≥ 99%) */
export const hitCalm = (h: number) => dbLoad(h) <= HIT.dbLimit;

/** a fixed order per question (same every visit), so the right answer is not always in the same place */
export function shuffleFor(seed: string, n: number) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  // murmur3's finaliser: spreads the hash so every position is about equally likely
  const next = () => {
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
  };
  const order = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// ---- the availability chart (slider task, model 'availability'): the lesson's own table ----

export const NINES = [
  { a: '99%', month: '7.2 h', year: '3.65 days', needs: 'One instance and restarts' },
  { a: '99.9%', month: '43.2 min', year: '8.76 h', needs: 'Redundant instances; one zone is OK-ish' },
  { a: '99.95%', month: '21.6 min', year: '4.38 h', needs: 'Multi-AZ, automated failover, fast rollback' },
  { a: '99.99%', month: '4.3 min', year: '52.6 min', needs: 'Multi-AZ everything, no manual recovery steps' },
  { a: '99.999%', month: '26 s', year: '5.3 min', needs: 'Multi-region active-active; rarely justified' },
];
/** the task: allow at most ~22 minutes of downtime a month, with the least machinery (99.95%) */
export const NINES_TARGET = 2;

// ---- typed estimates (task 'estimate') ----
const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, g: 1e9, t: 1e12, p: 1e15 };
/** "2.3K", "2,300", "2.3e3", "2.3 × 10^3", "10^5" (and the task's unit after it) → a number; null when unreadable */
export function parseAmount(raw: string, unit = ''): number | null {
  let s = raw.trim().toLowerCase().replace(/[,_\s]/g, '').replace(/[×*]/g, 'x');
  const u = unit.toLowerCase().replace(/\s/g, '');
  if (u && s.endsWith(u)) s = s.slice(0, -u.length);
  const pow = s.match(/^10\^(-?\d+)$/);
  if (pow) return 10 ** Number(pow[1]);
  const m = s.match(/^(\d*\.?\d+)(?:x10\^(-?\d+)|e(-?\d+))?([kmbgtp]?)$/);
  if (!m) return null;
  return Number(m[1]) * 10 ** Number(m[2] ?? m[3] ?? 0) * (SUFFIX[m[4]] ?? 1);
}
/** how far off a guess is, as "3.4" or "12" (times) */
export const timesOff = (r: number) => (r < 10 ? r.toFixed(1) : Math.round(r).toLocaleString('en-US'));
