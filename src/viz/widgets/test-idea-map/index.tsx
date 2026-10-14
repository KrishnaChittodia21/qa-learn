import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, FUNC, NFR, OBJECTS, simulate, type Branch, type Depth, type LeafId, type Obj, type Params } from './sim';

const CX = 300;
const CY = 176;
const LW = 200;
const PRI = {
  1: { c: 'var(--bad)', soft: 'var(--bad-soft)' },
  2: { c: 'var(--warn)', soft: 'var(--warn-soft)' },
  3: { c: 'var(--muted)', soft: 'var(--surface-2)' },
} as const;
const T = 'opacity 0.4s ease, transform 0.5s cubic-bezier(.4,0,.2,1)';
const FUNC_TAG: Record<string, string> = { pos: '+', neg: '−', edge: 'edge' };
const NFR_TAG: Record<string, string> = { perf: 'perf', sec: 'sec', usab: 'UX', a11y: 'a11y', compat: 'comp' };
/** split at the last space before `max` characters */
function split2(s: string, max: number): [string, string] {
  if (s.length <= max) return [s, ''];
  const i = s.lastIndexOf(' ', max);
  return [s.slice(0, i), s.slice(i + 1)];
}

/** hub anchor for each branch: [x, y, side] */
const HUB: Record<Branch, { x: number; y: number; label: string; right: boolean }> = {
  clarify: { x: 6, y: 18, label: '1  Clarify', right: false },
  func: { x: 6, y: 128, label: '2  Functional', right: false },
  nfr: { x: 394, y: 18, label: '3  Non-functional', right: true },
  prio: { x: 394, y: 132, label: '4  Prioritise', right: true },
  auto: { x: 394, y: 236, label: '5  Automate vs manual', right: true },
};
const BRANCHES: Branch[] = ['clarify', 'func', 'nfr', 'prio', 'auto'];

function Leaf({ x, y, text, tag, on, p, from }: { x: number; y: number; text: string; tag?: string; on: boolean; p?: 1 | 2 | 3; from: number }) {
  return (
    <g style={{ transform: `translate(${on ? x : x + from}px, ${y}px)`, opacity: on ? 1 : 0, transition: T }}>
      <rect width={LW} height={17} rx={5} fill={p ? PRI[p].soft : 'var(--surface-2)'} stroke={p ? PRI[p].c : 'var(--border)'} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
      {tag && (
        <text x={5} y={12} fontSize={8.5} fontWeight={700} style={{ fill: 'var(--accent)' }}>
          {tag}
        </text>
      )}
      <text x={tag ? 32 : 6} y={12} fontSize={9}>
        {text}
      </text>
      {p && (
        <text x={LW - 5} y={12} textAnchor="end" fontSize={8.5} fontWeight={700} style={{ fill: PRI[p].c }}>
          P{p}
        </text>
      )}
    </g>
  );
}

export default function TestIdeaMapViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const d = OBJECTS[params.obj];
  const nfrShown = NFR.filter((n) => f.leaves.includes(n));
  const has = (b: Branch) => f.branches.includes(b);
  const count = (n: 1 | 2 | 3) => Object.values(f.prio).filter((v) => v === n).length;
  const funcRows = FUNC.filter((l) => params.depth === 'full' || l.endsWith('0'));

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Obj>
            label="Test"
            value={params.obj}
            options={[
              { value: 'login', label: 'login page' },
              { value: 'atm', label: 'ATM' },
              { value: 'elevator', label: 'elevator' },
              { value: 'pen', label: 'pen' },
              { value: 'search', label: 'search box' },
            ]}
            onChange={(obj) => setParams((p) => ({ ...p, obj }))}
          />
          <Choice<Depth>
            label="Answer"
            value={params.depth}
            options={[
              { value: 'short', label: '60-second' },
              { value: 'full', label: 'full (5 min)' },
            ]}
            onChange={(depth) => setParams((p) => ({ ...p, depth }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> P1 must test
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> P2
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> P3 if time allows
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> branch being spoken
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`Mind map for testing ${d.name}: ${f.branches.length} of 5 branches, ${f.leaves.length} test ideas, ${count(1)} marked P1.${f.autoShown ? ' Automation candidates listed.' : ''}`}
      >
        {/* edges centre → hubs */}
        {BRANCHES.map((b) => {
          const h = HUB[b];
          const hx = h.right ? h.x - 4 : h.x + LW + 4;
          const hy = h.y + 6;
          return (
            <path
              key={b}
              d={`M${CX},${CY} C${(CX + hx) / 2},${CY} ${(CX + hx) / 2},${hy} ${hx},${hy}`}
              fill="none"
              stroke={f.focus === b ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={f.focus === b ? 2.4 : 1.4}
              opacity={has(b) ? 1 : 0}
              style={{ transition: 'opacity 0.4s ease, stroke 0.35s ease' }}
            />
          );
        })}
        <ellipse cx={CX} cy={CY} rx={74} ry={30} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
        <text x={CX} y={CY - 3} textAnchor="middle" fontSize={10} style={{ fill: 'var(--text-2)' }}>
          How would you test
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize={12} fontWeight={700}>
          {d.name}?
        </text>
        {/* hub titles */}
        {BRANCHES.map((b) => (
          <text key={b} x={HUB[b].x} y={HUB[b].y + 10} fontSize={10.5} fontWeight={700} opacity={has(b) ? 1 : 0.25} style={{ fill: f.focus === b ? 'var(--accent)' : 'var(--text)', transition: 'opacity 0.4s ease, fill 0.35s ease' }}>
            {HUB[b].label}
          </text>
        ))}
        {/* clarify */}
        {d.clarify.map((q, k) => (
          <Leaf key={q} x={6} y={20 + (k + 1) * 19} text={q} tag="?" on={k < f.questions} from={40} />
        ))}
        <g opacity={f.assumed ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }}>
          {split2(`Assume: ${d.assume}`, 46).map((line, k) => (
            <text key={k} x={8} y={110 + k * 11} fontSize={9} fontStyle="italic" style={{ fill: 'var(--text-2)' }}>
              {line}
            </text>
          ))}
        </g>
        {/* functional */}
        {funcRows.map((l, k) => (
          <Leaf key={l} x={6} y={146 + k * 20} text={d.leaves[l]} tag={FUNC_TAG[l.replace(/\d/, '')]} on={f.leaves.includes(l)} p={f.prio[l]} from={40} />
        ))}
        {/* non-functional */}
        {(params.depth === 'full' ? [...NFR] : nfrShown.length ? nfrShown : []).map((n, k) => (
          <Leaf key={n} x={394} y={38 + k * 19} text={d.leaves[n]} tag={NFR_TAG[n]} on={f.leaves.includes(n as LeafId)} p={f.prio[n]} from={-40} />
        ))}
        {/* prioritise */}
        {([1, 2, 3] as const).map((n, k) => (
          <g key={n} opacity={has('prio') ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }}>
            <text x={396} y={164 + k * 20} fontSize={10} fontWeight={700} style={{ fill: PRI[n].c }}>
              P{n}
            </text>
            <rect x={420} y={155 + k * 20} width={Math.max(0, count(n)) * 22} height={12} rx={3} fill={PRI[n].c} style={{ transition: 'width 0.5s ease' }} />
            <text x={426 + count(n) * 22} y={165 + k * 20} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
              {count(n) ? `${count(n)} idea${count(n) > 1 ? 's' : ''}` : ''}
            </text>
          </g>
        ))}
        {/* automate */}
        {d.automate.map((a, k) => (
          <Leaf key={a} x={394} y={254 + k * 20} text={`⚙ ${a}`} on={f.autoShown} from={-40} />
        ))}
        <Leaf x={394} y={294} text={`✋ ${d.manual}`} on={f.autoShown} from={-40} />
        {/* progress */}
        {BRANCHES.map((b, k) => (
          <circle key={b} cx={CX - 40 + k * 20} cy={CY + 48} r={5} fill={has(b) ? 'var(--accent)' : 'var(--surface-2)'} stroke="var(--accent)" style={{ transition: 'fill 0.35s ease' }} />
        ))}
        <text x={CX} y={CY + 68} textAnchor="middle" className="viz-label">
          {f.focus ? `now: ${HUB[f.focus].label.slice(3).toLowerCase()}` : `${f.branches.length}/5 branches`}
        </text>
      </svg>
    </VizFrame>
  );
}
