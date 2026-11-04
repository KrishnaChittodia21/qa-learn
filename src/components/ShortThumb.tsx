// A Short's thumbnail, drawn from its own content (no image files): the opening kicker, its headline number, a still
// "glimpse" of its first visual beat (spike, race, ladder, grid, switches or flow), length and a play mark.
// Adapted from system-design-learn's ShortThumb, trimmed to the eight beat types qa-learn uses.
import type { CSSProperties } from 'react';
import { Check, Play } from 'lucide-react';
import { shortLength } from '../lib/shorts';
import type { Short, ShortBeat } from '../types';

const TONES = ['var(--sp-blue)', 'var(--sp-cyan)', 'var(--sp-amber)', 'var(--sp-rose)', 'var(--sp-green)', 'var(--sp-violet)'];
const LANE = { rose: 'var(--sp-rose)', blue: 'var(--sp-blue)', cyan: 'var(--sp-cyan)', amber: 'var(--sp-amber)', green: 'var(--sp-green)' };
const DIM = 'var(--sp-line-2)';
const plain = (s = '') => s.replace(/\*+/g, '');

/** a still of one beat, in a 100 × 60 box */
function Glimpse({ beat, tone }: { beat: ShortBeat; tone: string }) {
  switch (beat.type) {
    case 'spike':
      return (
        <>
          <path d="M0 58 H100" style={{ stroke: DIM }} />
          <path d="M0 52 C 20 51, 32 49, 42 47 S 52 42, 56 22 S 64 6, 70 8 S 86 12, 100 13" fill="none" strokeWidth={3} strokeLinecap="round" style={{ stroke: tone }} />
          <circle cx={57} cy={19} r={3.5} style={{ fill: 'var(--sp-amber)' }} />
        </>
      );
    case 'race': {
      const lanes = beat.lanes.slice(0, 3);
      const max = Math.max(...lanes.map((l) => l.seconds + (l.after ?? 0)));
      const h = 60 / lanes.length;
      return lanes.map((l, i) => (
        <g key={l.label}>
          <rect x={0} y={i * h + h * 0.25} width={100} height={h * 0.5} rx={h * 0.25} style={{ fill: DIM }} />
          <rect x={0} y={i * h + h * 0.25} width={Math.max(8, ((l.seconds + (l.after ?? 0)) / max) * 100)} height={h * 0.5} rx={h * 0.25} style={{ fill: LANE[l.tone] }} />
        </g>
      ));
    }
    case 'ladder': {
      const rungs = beat.rungs.slice(0, 6);
      // square root, so a 100× rung doesn't flatten the others
      const max = Math.sqrt(Math.max(...rungs.map((r) => r.amount)));
      const w = 100 / rungs.length;
      return rungs.map((r, i) => {
        const h = Math.max(4, (Math.sqrt(r.amount) / max) * 56);
        return <rect key={r.label} x={i * w + w * 0.18} y={60 - h} width={w * 0.64} height={h} rx={2} opacity={0.45 + (0.55 * (i + 1)) / rungs.length} style={{ fill: tone }} />;
      });
    }
    case 'grid': {
      const n = Math.min(beat.cells, 32);
      // few cells: bigger squares, so 3 boxes don't shrink to dots
      const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(n * 2))));
      const w = 100 / cols;
      const h = Math.min(w, 60 / Math.ceil(n / cols));
      return Array.from({ length: n }, (_, i) => (
        <rect key={i} x={(i % cols) * w + w * 0.12} y={Math.floor(i / cols) * h + h * 0.12} width={w * 0.76} height={h * 0.76} rx={2} opacity={0.35 + ((i * 7) % 10) / 15} style={{ fill: tone }} />
      ));
    }
    case 'toggles': {
      const items = beat.items.slice(0, 4);
      const h = 60 / items.length;
      return items.map((it, i) => {
        const y = i * h + h / 2;
        return (
          <g key={it.label}>
            <rect x={0} y={y - 3} width={62} height={6} rx={3} style={{ fill: DIM }} />
            <rect x={72} y={y - 7} width={26} height={14} rx={7} style={{ fill: it.keep ? tone : 'var(--sp-line-2)' }} />
            <circle cx={it.keep ? 91 : 79} cy={y} r={5} fill="#fff" />
          </g>
        );
      });
    }
    case 'flow': {
      const steps = beat.steps.slice(0, 4);
      const gap = 100 / steps.length;
      return steps.map((s, i) => {
        const bad = beat.broken === i;
        const x = i * gap + gap / 2;
        return (
          <g key={s}>
            {i > 0 && <path d={`M${x - gap + 9} 30 H${x - 9}`} strokeWidth={2} strokeDasharray={bad ? '3 3' : undefined} style={{ stroke: bad ? 'var(--sp-rose)' : tone }} />}
            <rect x={x - 9} y={21} width={18} height={18} rx={5} opacity={bad ? 1 : 0.85} style={{ fill: bad ? 'var(--sp-rose)' : tone }} />
          </g>
        );
      });
    }
    default:
      return null;
  }
}


export function ShortThumb({ short, watched, mini = false }: { short: Short; watched: boolean; mini?: boolean }) {
  const tone = TONES[[...short.id].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  const num = short.beats.find((b) => b.type === 'counter');
  const visual = short.beats.find((b) => b.type !== 'counter' && b.type !== 'quiz');
  const big = num ? `${num.value.toLocaleString(undefined, { maximumFractionDigits: num.decimals ?? 0 })}${num.suffix ?? ''}` : plain(short.beats[0].head);
  return (
    <span className={`sh-thumb ${mini ? 'mini' : ''}`} style={{ '--tone': tone } as CSSProperties} aria-hidden>
      {!mini && <span className="sh-thumb-kicker mono">{plain(short.beats[0].kicker)}</span>}
      <span className="sh-thumb-main">
        <span className={`sh-thumb-big ${num ? (big.length > 7 ? 'is-long' : big.length > 5 ? 'is-mid' : '') : 'is-text'}`}>{big}</span>
        {visual && (
          <svg className="sh-thumb-glimpse" viewBox="-2 -2 104 64">
            <Glimpse beat={visual} tone={tone} />
          </svg>
        )}
      </span>
      {num && !mini && <span className="sh-thumb-unit mono">{plain(num.unit)}</span>}
      <span className="sh-thumb-play">
        <Play size={mini ? 11 : 16} fill="currentColor" />
      </span>
      <span className="sh-thumb-len mono">{shortLength(short)}</span>
      {watched && !mini && (
        <span className="sh-thumb-seen">
          <Check size={12} /> Watched
        </span>
      )}
    </span>
  );
}
