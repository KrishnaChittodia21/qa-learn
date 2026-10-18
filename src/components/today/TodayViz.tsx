// Today instruments drawn in SVG: the coverage prism (big + phone-size), the skill radar and the
// 30-day signal waveform. Shapes follow qa-learn-designs/Main.html (build.py prism()/radar()/wave30());
// every value comes from real progress (src/lib/todayData.ts). Colours are spectrum tokens set
// through CSS custom properties so both themes resolve them; styling lives in today.css.
import type { CSSProperties } from 'react';
import type { SignalDay, SkillAxis, Track } from '../../lib/todayData';

type Pt = [number, number];
const pts = (ps: Pt[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const hueVar = (h: string) => `var(--${h})`;
const pct = (t: Track) => (t.total ? Math.round((t.done / t.total) * 100) : 0);

/** Isometric pyramid: one layer per track (bottom = T1), each lit up to its coverage; a beam enters, a spectrum leaves. */
export function CoveragePrism({ tracks }: { tracks: Track[] }) {
  const W = 520;
  const H = 500;
  const cx = 250;
  const by = 372;
  const hw = 172;
  const hh = 88;
  const A: Pt = [cx, 96];
  const F: Pt = [cx, by + hh];
  const L: Pt = [cx - hw, by];
  const R: Pt = [cx + hw, by];
  const B: Pt = [cx, by - hh];
  const cuts = [0, 0.33, 0.58, 0.79, 1];
  const gap = 15;
  const P = (p: Pt, f: number, dy: number): Pt => [p[0] + (A[0] - p[0]) * f, p[1] + (A[1] - p[1]) * f - dy];
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  // the beam enters the left face of layer T3 and the spectrum leaves through the right face
  const kIn = 2;
  const fMid = (cuts[kIn] + cuts[kIn + 1]) / 2;
  const dyIn = gap * kIn;
  const pin = mid(P(L, fMid, dyIn), P(F, fMid, dyIn));
  const po = mid(P(F, fMid, dyIn), P(R, fMid, dyIn));
  const pout: Pt = [po[0] + 6, po[1] - 4];
  const label = `Coverage prism: ${tracks.map((t) => `${t.name} ${t.done} of ${t.total} topics passed (${pct(t)}%)`).join(', ')}`;

  return (
    <svg className="prism-svg" viewBox={`0 36 ${W} ${H - 36}`} role="img" aria-label={label}>
      <defs>
        {tracks.map((t) => (
          <linearGradient key={t.hue} id={`pf-${t.hue}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" className="pf-a" style={{ stopColor: hueVar(t.hue) }} />
            <stop offset="1" className="pf-b" style={{ stopColor: hueVar(t.hue) }} />
          </linearGradient>
        ))}
        <linearGradient id="pr-beam-in" x1="0" x2="1">
          <stop offset="0" style={{ stopColor: 'var(--ink)', stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: 'var(--ink)', stopOpacity: 0.95 }} />
        </linearGradient>
        {['lime', 'mint', 'cyan', 'iris', 'lilac'].map((c) => (
          <linearGradient key={c} id={`ray-${c}`} x1="0" x2="1">
            <stop offset="0" style={{ stopColor: hueVar(c), stopOpacity: 0.95 }} />
            <stop offset="1" style={{ stopColor: hueVar(c), stopOpacity: 0 }} />
          </linearGradient>
        ))}
        <pattern id="pr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0v5" style={{ stroke: 'var(--ink-3)' }} strokeWidth=".7" opacity=".45" />
        </pattern>
      </defs>

      <g className="pr-floor">
        {[1, 1.28, 1.56].map((s) => (
          <polygon
            key={s}
            points={pts([
              [cx - hw * s, by],
              [cx, by + hh * s],
              [cx + hw * s, by],
              [cx, by - hh * s],
            ])}
            fill="none"
            style={{ stroke: 'var(--tick)' }}
            strokeWidth="1"
            strokeDasharray={s > 1 ? '2 5' : undefined}
            opacity={s === 1 ? 0.9 : 0.55}
          />
        ))}
      </g>
      <path className="pr-beam" d={`M0 ${(pin[1] + 18).toFixed(1)} L${pin[0].toFixed(1)} ${pin[1].toFixed(1)}`} stroke="url(#pr-beam-in)" strokeWidth="2.4" fill="none" />

      {tracks.map((t, k) => {
        const f0 = cuts[k];
        const f1 = cuts[k + 1];
        const dy = gap * k;
        const cov = t.total ? t.done / t.total : 0;
        const fc = f0 + (f1 - f0) * cov;
        const [Lf0, Ff0, Rf0, Bf0] = [P(L, f0, dy), P(F, f0, dy), P(R, f0, dy), P(B, f0, dy)];
        const [Lf1, Ff1, Rf1, Bf1] = [P(L, f1, dy), P(F, f1, dy), P(R, f1, dy), P(B, f1, dy)];
        const [Lc, Fc, Rc] = [P(L, fc, dy), P(F, fc, dy), P(R, fc, dy)];
        const ty = (Lf0[1] + Lf1[1]) / 2;
        const tx = (Lf0[0] + Lf1[0]) / 2;
        return (
          <g key={t.code} className="pr-layer" style={{ '--i': k, '--lc': hueVar(t.hue) } as CSSProperties}>
            <path className="pr-back" d={`M${Lf0[0].toFixed(1)} ${Lf0[1].toFixed(1)} L${Bf0[0].toFixed(1)} ${Bf0[1].toFixed(1)} L${Rf0[0].toFixed(1)} ${Rf0[1].toFixed(1)}`} />
            <polygon className="pr-empty pr-l" points={pts([Lf0, Ff0, Ff1, Lf1])} fill="url(#pr-hatch)" />
            <polygon className="pr-empty pr-r" points={pts([Ff0, Rf0, Rf1, Ff1])} fill="url(#pr-hatch)" />
            {cov > 0 && (
              <>
                <polygon className="pr-fill pr-l" points={pts([Lf0, Ff0, Fc, Lc])} fill={`url(#pf-${t.hue})`} />
                <polygon className="pr-fill pr-r" points={pts([Ff0, Rf0, Rc, Fc])} fill={`url(#pf-${t.hue})`} />
              </>
            )}
            {cov > 0 && cov < 1 && (
              <path className="pr-level" d={`M${Lc[0].toFixed(1)} ${Lc[1].toFixed(1)} L${Fc[0].toFixed(1)} ${Fc[1].toFixed(1)} L${Rc[0].toFixed(1)} ${Rc[1].toFixed(1)}`} />
            )}
            {k < tracks.length - 1 && <polygon className="pr-cap" points={pts([Lf1, Ff1, Rf1, Bf1])} />}
            <polygon className="pr-edge" points={pts([Lf0, Ff0, Rf0, Rf1, Ff1, Lf1])} />
            <path className="pr-edge" d={`M${Ff0[0].toFixed(1)} ${Ff0[1].toFixed(1)} L${Ff1[0].toFixed(1)} ${Ff1[1].toFixed(1)}`} />
            <path d={`M${(tx - 8).toFixed(1)} ${ty.toFixed(1)} H14`} style={{ stroke: 'var(--tick)' }} strokeWidth="1" strokeDasharray="1 3" />
            <rect x="10" y={(ty - 3).toFixed(1)} width="6" height="6" style={{ fill: hueVar(t.hue) }} transform={`rotate(45 13 ${ty.toFixed(1)})`} />
            <text x="24" y={(ty - 6).toFixed(1)} className="pr-t">
              {t.code}
            </text>
            <text x="24" y={(ty + 13).toFixed(1)} className="pr-v">
              {pct(t)}%
            </text>
          </g>
        );
      })}

      <g className="pr-rays">
        {['lime', 'mint', 'cyan', 'iris', 'lilac'].map((c, i) => {
          const yEnd = pout[1] - 70 + i * 38;
          return (
            <polygon
              key={c}
              points={pts([
                [pout[0], pout[1] - 1.2 + i * 0.6],
                [W, yEnd],
                [W, yEnd + 22],
                [pout[0], pout[1] + 1.2 + i * 0.6],
              ])}
              fill={`url(#ray-${c})`}
              opacity=".85"
            />
          );
        })}
      </g>
      <path d={`M${pin[0].toFixed(1)} ${pin[1].toFixed(1)} L${pout[0].toFixed(1)} ${pout[1].toFixed(1)}`} style={{ stroke: 'var(--ink)' }} strokeWidth="1.2" strokeDasharray="2 3" opacity=".7" />
      <rect x={pin[0] - 3} y={pin[1] - 3} width="6" height="6" style={{ fill: 'var(--ink)' }} transform={`rotate(45 ${pin[0].toFixed(1)} ${pin[1].toFixed(1)})`} />
      <path d={`M${A[0]} ${A[1] - gap * 3 - 18} V${A[1] - gap * 3 - 4}`} style={{ stroke: 'var(--tick)' }} strokeWidth="1" />
      <text x={A[0] + 8} y={A[1] - gap * 3 - 8} className="pr-c">
        APEX · E2E
      </text>
      <text x={cx + hw - 30} y={by + hh + 8} className="pr-c">
        BASE · MANUAL
      </text>
      <text x={W - 6} y={(pout[1] - 82).toFixed(1)} className="pr-c" textAnchor="end">
        SPECTRUM ▸
      </text>
    </svg>
  );
}

/** Phone-size prism (Mobile.html screen 01): same layers, no labels. */
export function MiniPrism({ tracks }: { tracks: Track[] }) {
  const cx = 60;
  const A: Pt = [60, 8];
  const by = 122;
  const hw = 56;
  const hh = 15.7;
  const L: Pt = [cx - hw, by];
  const F: Pt = [cx, by + hh];
  const R: Pt = [cx + hw, by];
  const B: Pt = [cx, by - hh];
  const cuts = [0, 0.3, 0.55, 0.77, 1];
  const gap = 4;
  const P = (p: Pt, f: number, dy: number): Pt => [p[0] + (A[0] - p[0]) * f, p[1] + (A[1] - p[1]) * f - dy];
  return (
    <svg className="miniprism" viewBox="0 0 120 142" aria-hidden="true">
      {tracks.map((t, k) => {
        const f0 = cuts[k];
        const f1 = cuts[k + 1];
        const dy = gap * k;
        const cov = t.total ? t.done / t.total : 0;
        const fc = f0 + (f1 - f0) * cov;
        const [Lf0, Ff0, Rf0] = [P(L, f0, dy), P(F, f0, dy), P(R, f0, dy)];
        const [Lf1, Ff1, Rf1, Bf1] = [P(L, f1, dy), P(F, f1, dy), P(R, f1, dy), P(B, f1, dy)];
        const [Lc, Fc, Rc] = [P(L, fc, dy), P(F, fc, dy), P(R, fc, dy)];
        return (
          <g key={t.code} className="mp-l" style={{ '--c': hueVar(t.hue), '--i': k } as CSSProperties}>
            <polygon className="e" points={pts([Lf0, Ff0, Ff1, Lf1])} />
            <polygon className="e r" points={pts([Ff0, Rf0, Rf1, Ff1])} />
            {cov > 0 && <polygon className="f" points={pts([Lf0, Ff0, Fc, Lc])} />}
            {cov > 0 && <polygon className="f r" points={pts([Ff0, Rf0, Rc, Fc])} />}
            <polyline className="o" points={pts([Lf1, Lf0, Ff0, Rf0, Rf1])} />
            <path className="o" d={`M${Ff0[0].toFixed(1)} ${Ff0[1].toFixed(1)}V${Ff1[1].toFixed(1)}`} />
            {k < tracks.length - 1 && <polygon className="cap" points={pts([Lf1, Ff1, Rf1, Bf1])} />}
          </g>
        );
      })}
    </svg>
  );
}

/** Hex spider chart: your accuracy per skill vs the pass mark ("interview-ready"). */
export function SkillRadar({ axes, target }: { axes: SkillAxis[]; target: number }) {
  const W = 400;
  const H = 290;
  const cx = 200;
  const cy = 148;
  const R = 104;
  const n = axes.length;
  const pt = (i: number, v: number): Pt => {
    const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
    return [cx + ((R * v) / 100) * Math.cos(a), cy + ((R * v) / 100) * Math.sin(a)];
  };
  const poly = (vals: number[]) => pts(vals.map((v, i) => pt(i, v)));
  const label = `Skill radar, share of exam questions answered correctly: ${axes.map((a) => `${a.label} ${a.value}%`).join(', ')}. Pass mark ${target}%.`;
  return (
    <svg className="radar-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id="rad-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--lime)', stopOpacity: 0.45 }} />
          <stop offset=".5" style={{ stopColor: 'var(--cyan)', stopOpacity: 0.28 }} />
          <stop offset="1" style={{ stopColor: 'var(--lilac)', stopOpacity: 0.4 }} />
        </linearGradient>
        <linearGradient id="rad-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--lime)' }} />
          <stop offset=".5" style={{ stopColor: 'var(--mint)' }} />
          <stop offset="1" style={{ stopColor: 'var(--cyan)' }} />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map((r) => (
        <polygon key={r} points={poly(axes.map(() => r))} fill="none" className="rad-grid" strokeDasharray={r < 100 ? '2 4' : undefined} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <path key={i} d={`M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}`} className="rad-grid" />;
      })}
      <polygon points={poly(axes.map(() => target))} fill="none" className="rad-target" />
      <polygon className="rad-shape" points={poly(axes.map((a) => Math.max(a.value, 2)))} fill="url(#rad-fill)" stroke="url(#rad-stroke)" strokeWidth="1.8" strokeLinejoin="round" />
      {axes.map((a, i) => {
        const [x, y] = pt(i, Math.max(a.value, 2));
        const weak = a.value < 40;
        const [lx, ly] = pt(i, 112);
        const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
        const dy = ly < cy - 60 ? -10 : ly > cy + 60 ? 16 : 0;
        return (
          <g key={a.label}>
            <rect x={x - 3.5} y={y - 3.5} width="7" height="7" className={weak ? 'rad-dot weak' : 'rad-dot'} transform={`rotate(45 ${x.toFixed(1)} ${y.toFixed(1)})`} />
            <text x={lx} y={ly + dy - 4} textAnchor={anchor} className="rad-l">
              {a.label}
            </text>
            <text x={lx} y={ly + dy + 10} textAnchor={anchor} className={weak ? 'rad-v weak' : 'rad-v'}>
              {a.value}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** 30 bars, one per day: off days are coral stubs, today pulses. */
export function Wave30({ days }: { days: SignalDay[] }) {
  const active = days.filter((d) => d.h > 0).length;
  return (
    <div className="wave30" role="img" aria-label={`Study activity over the last ${days.length} days: ${active} active days`}>
      {days.map((d, i) => (
        <i key={d.day} className={d.h === 0 ? 'off' : i === days.length - 1 ? 'now' : undefined} style={{ '--h': Math.max(d.h, 6) } as CSSProperties} />
      ))}
    </div>
  );
}
