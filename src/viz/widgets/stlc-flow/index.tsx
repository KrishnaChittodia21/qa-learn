import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, PHASES, VPAIRS, simulate, type Check, type Defect, type Frame, type Params, type YesNo } from './sim';

const BW = 90;
const GAP = 8;
const bx = (i: number) => 6 + i * (BW + GAP);
const DEV = { x: 470, y: 80, w: 124, h: 24 };
const ease = 'transform 0.6s cubic-bezier(.4,0,.2,1), fill 0.35s ease';

/** greedy word wrap for SVG text */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max) {
      out.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

const CHECK: Record<Check, { fill: string; stroke: string; mark: string }> = {
  pending: { fill: 'var(--surface-2)', stroke: 'var(--border)', mark: '…' },
  ok: { fill: 'var(--good-soft)', stroke: 'var(--good)', mark: '✓' },
  fail: { fill: 'var(--bad-soft)', stroke: 'var(--bad)', mark: '✗' },
};

function tokenPos(f: Frame): [number, number] {
  if (f.at === 'dev') return [DEV.x + 16, DEV.y + DEV.h / 2];
  if (f.at < 0) return [bx(0) - 2, 66];
  return [bx(f.at) + BW / 2, 66];
}

function Card({ f, width }: { f: Frame; width: number }) {
  const idx = f.at === 'dev' ? 4 : f.at;
  if (idx < 0) {
    return (
      <text x={10} y={150} className="viz-label">
        {wrap('Press ▶ or step forward. Each phase starts only when its entry criteria hold and ends only when its exit criteria hold.', Math.floor(width / 5.6)).map((l, k) => (
          <tspan key={k} x={10} dy={k ? 15 : 0}>
            {l}
          </tspan>
        ))}
      </text>
    );
  }
  const ph = PHASES[idx];
  const chars = Math.floor((width - 110) / 5.5);
  const rows: { label: string; text: string; check?: Check }[] = [
    { label: 'Entry', text: ph.entry, check: f.entry },
    { label: 'Activities', text: ph.activities },
    { label: 'Exit', text: ph.exit, check: f.exit },
    { label: 'Deliverable', text: ph.deliverable, check: f.exit === 'ok' ? 'ok' : 'pending' },
  ];
  let y = 140;
  return (
    <g>
      <rect x={4} y={118} width={width - 8} height={212} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={14} y={136} fontSize={12} fontWeight={700}>
        {ph.name}
        {f.bug ? '' : f.step === 'blocked' ? ' · BLOCKED' : ''}
      </text>
      {f.bug && (
        <text x={width - 14} y={136} fontSize={10} fontWeight={700} textAnchor="end" style={{ fill: f.bug.endsWith('(Closed)') ? 'var(--good)' : 'var(--bad)' }}>
          {f.bug.length > 46 && width < 400 ? f.bug.replace(/:.*\(/, ' (') : f.bug}
        </text>
      )}
      {rows.map((r) => {
        const lines = wrap(r.text, chars);
        const top = y + 6;
        y += Math.max(1, lines.length) * 13 + 14;
        const c = r.check ? CHECK[r.check] : null;
        return (
          <g key={r.label}>
            {c && <rect x={14} y={top} width={14} height={14} rx={3} fill={c.fill} stroke={c.stroke} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />}
            {c && (
              <text x={21} y={top + 11} fontSize={10} fontWeight={700} textAnchor="middle" style={{ fill: c.stroke }}>
                {c.mark}
              </text>
            )}
            <text x={34} y={top + 11} fontSize={10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
              {r.label}
            </text>
            <text x={106} y={top + 11} fontSize={10.5}>
              {lines.map((l, k) => (
                <tspan key={k} x={106} dy={k ? 13 : 0}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function VModel({ f }: { f: Frame }) {
  const W = 84;
  const ly = (k: number) => 130 + k * 42;
  return (
    <g>
      <text x={490} y={124} fontSize={10.5} fontWeight={700} textAnchor="middle" style={{ fill: 'var(--text-2)' }}>
        V-model
      </text>
      <path d={`M${384 + W / 2},${ly(0) + 26} L490,318 L${596 - W / 2},${ly(0) + 26}`} className="viz-edge" />
      <text x={506} y={316} fontSize={9.5} className="viz-label">
        code
      </text>
      {VPAIRS.map(([dev, test], k) => {
        const hi = f.vHi.includes(k);
        const left = hi && (f.vArm === 'left' || f.vArm === 'both');
        const right = hi && (f.vArm === 'right' || f.vArm === 'both');
        const lx = 384 + k * 5;
        const rx = 596 - W - k * 5;
        const box = (x: number, on: boolean, label: string) => (
          <g>
            <rect x={x} y={ly(k)} width={W} height={26} rx={6} fill={on ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={on ? 'var(--accent)' : 'var(--border)'} strokeWidth={on ? 2 : 1} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
            {wrap(label, 15).map((l, j, arr) => (
              <text key={j} x={x + W / 2} y={ly(k) + 16 + (j - (arr.length - 1) / 2) * 10} fontSize={9.5} textAnchor="middle" fontWeight={on ? 700 : 400}>
                {l}
              </text>
            ))}
          </g>
        );
        return (
          <g key={k}>
            <line x1={lx + W} x2={rx} y1={ly(k) + 13} y2={ly(k) + 13} stroke={hi ? 'var(--accent)' : 'var(--border)'} strokeDasharray="3 3" strokeWidth={hi ? 2 : 1} style={{ transition: 'stroke 0.35s ease' }} />
            {box(lx, left, dev)}
            {box(rx, right, test)}
          </g>
        );
      })}
    </g>
  );
}

export default function StlcFlowViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const v = params.vmodel === 'yes';
  const [tx, ty] = tokenPos(f);
  const tokenFill = f.step === 'blocked' || f.step === 'defect' ? 'var(--bad)' : f.at === 'dev' ? 'var(--warn)' : f.step === 'done' ? 'var(--good)' : 'var(--accent)';
  const where = f.at === 'dev' ? 'with developers for a fix' : f.at < 0 ? 'not started' : PHASES[f.at].name;

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Defect>
            label="Defect found in execution"
            value={params.defect}
            options={[
              { value: 'none', label: 'none' },
              { value: 'minor', label: 'minor' },
              { value: 'blocker', label: 'blocker' },
            ]}
            onChange={(defect) => setParams((p) => ({ ...p, defect }))}
          />
          <Choice<YesNo> label="Environment ready?" value={params.envReady} options={[{ value: 'yes', label: 'yes' }, { value: 'no', label: 'no' }]} onChange={(envReady) => setParams((p) => ({ ...p, envReady }))} />
          <Choice<YesNo> label="V-model mapping" value={params.vmodel} options={[{ value: 'yes', label: 'show' }, { value: 'no', label: 'hide' }]} onChange={(vmodel) => setParams((p) => ({ ...p, vmodel }))} />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> current phase
          <span className="viz-key" style={{ background: 'var(--good)' }} /> criteria met / phase done
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> blocked or defect
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> back with dev
        </>
      }
    >
      <svg
        viewBox="0 0 600 334"
        className="viz-svg"
        role="img"
        aria-label={`STLC at ${where}. Entry ${f.entry}, exit ${f.exit}. ${f.done.length} of 6 phases done.${f.bug ? ' ' + f.bug + '.' : ''}`}
      >
        <defs>
          <marker id="stlc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
        </defs>
        {PHASES.map((ph, i) => {
          const done = f.done.includes(i);
          const cur = f.at === i;
          const blocked = cur && (f.step === 'blocked' || f.step === 'defect');
          const fill = blocked ? 'var(--bad-soft)' : cur ? 'var(--accent-soft)' : done ? 'var(--good-soft)' : 'var(--surface-2)';
          const stroke = blocked ? 'var(--bad)' : cur ? 'var(--accent)' : done ? 'var(--good)' : 'var(--border)';
          return (
            <g key={i}>
              {i > 0 && <line x1={bx(i) - GAP} x2={bx(i) - 1} y1={34} y2={34} stroke="var(--muted)" markerEnd="url(#stlc-arrow)" />}
              <rect x={bx(i)} y={14} width={BW} height={40} rx={8} fill={fill} stroke={stroke} strokeWidth={cur ? 2.5 : 1.2} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
              <text x={bx(i) + BW / 2} y={31} fontSize={10.5} fontWeight={700} textAnchor="middle">
                {i + 1}. {ph.short}
              </text>
              <text x={bx(i) + BW / 2} y={46} fontSize={10} textAnchor="middle" style={{ fill: done ? 'var(--good)' : 'var(--text-2)' }}>
                {done ? '✓ exit met' : cur ? 'in progress' : ''}
              </text>
            </g>
          );
        })}
        {/* defect loop: execution → dev → execution */}
        <path d={`M${bx(4) + BW / 2 + 12},56 Q${bx(4) + BW / 2 + 20},${DEV.y + DEV.h / 2} ${DEV.x - 2},${DEV.y + DEV.h / 2}`} className="viz-edge" markerEnd="url(#stlc-arrow)" style={{ stroke: f.loop ? 'var(--warn)' : undefined, transition: 'stroke 0.35s ease' }} />
        <path d={`M${DEV.x + DEV.w - 20},${DEV.y} Q${bx(4) + BW + 14},76 ${bx(4) + BW - 8},57`} className="viz-edge" markerEnd="url(#stlc-arrow)" style={{ stroke: f.loop ? 'var(--warn)' : undefined, transition: 'stroke 0.35s ease' }} />
        <rect x={DEV.x} y={DEV.y} width={DEV.w} height={DEV.h} rx={12} fill={f.at === 'dev' ? 'var(--warn-soft)' : 'var(--surface-2)'} stroke={f.at === 'dev' ? 'var(--warn)' : 'var(--border)'} style={{ transition: 'fill 0.35s ease' }} />
        <text x={DEV.x + DEV.w / 2 + 10} y={DEV.y + 16} fontSize={9.5} textAnchor="middle">
          dev fix → new build
        </text>
        <text x={8} y={96} className="viz-label">
          {f.loop ? 'defect loop: fix → retest (confirmation) → regression' : `deliverables so far: ${f.deliverables.length}`}
        </text>
        {/* moving token */}
        <g style={{ transform: `translate(${tx}px, ${ty}px)`, transition: ease }}>
          <circle r={9} fill={tokenFill} stroke="var(--surface-2)" strokeWidth={2} style={{ transition: 'fill 0.35s ease' }} />
          <text y={3.5} fontSize={9} fontWeight={700} textAnchor="middle" style={{ fill: 'var(--surface-2)' }}>
            {f.step === 'blocked' ? '!' : f.step === 'defect' ? '🐞' : '▶'}
          </text>
        </g>
        <Card f={f} width={v ? 376 : 600} />
        {v && <VModel f={f} />}
      </svg>
    </VizFrame>
  );
}
