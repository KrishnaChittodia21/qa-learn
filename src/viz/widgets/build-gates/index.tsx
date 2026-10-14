import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { AREAS, BUILDS, DEFAULT_PARAMS, SMOKE, STAGES, fmt, regressionPlan, simulate, type BuildType, type Check, type Params, type Scope, type SmokeResult, type Stage } from './sim';

const BW = 104;
const GAP = 18;
const bx = (i: number) => 4 + i * (BW + GAP);
const LABEL: Record<Stage, [string, string]> = {
  build: ['New build', 'from CI'],
  smoke: ['Smoke', 'broad · shallow'],
  sanity: ['Sanity', 'narrow · deep'],
  regression: ['Regression', ''],
  release: ['Release', 'to users'],
  rejected: ['Rejected', '→ back to dev'],
};
const MARK: Record<Check, [string, string]> = {
  todo: ['○', 'var(--muted)'],
  pass: ['✓', 'var(--good)'],
  fail: ['✗', 'var(--bad)'],
  skip: ['–', 'var(--muted)'],
};
const REJ = { x: 190, y: 92, w: 118, h: 26 };

function CheckList({ x, title, items, checks, active }: { x: number; title: string; items: string[]; checks: Check[]; active: boolean }) {
  return (
    <g>
      <text x={x} y={176} fontSize={10.5} fontWeight={700} style={{ fill: active ? 'var(--accent)' : 'var(--text-2)' }}>
        {title}
      </text>
      {items.map((it, k) => {
        const [m, c] = MARK[checks[k] ?? 'todo'];
        return (
          <g key={it}>
            <text x={x + 6} y={196 + k * 18} fontSize={12} fontWeight={700} textAnchor="middle" style={{ fill: c, transition: 'fill 0.3s ease' }}>
              {m}
            </text>
            <text x={x + 16} y={196 + k * 18} fontSize={10} style={{ fill: checks[k] === 'todo' ? 'var(--text-2)' : 'var(--text)' }}>
              {it.length > 30 ? it.slice(0, 29) + '…' : it}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export default function BuildGatesViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const B = BUILDS[params.build];
  const planned = regressionPlan(params.build, params.scope).reduce((s, r) => s + r.planned, 0);
  const tokenAt: [number, number] = f.at === 'rejected' ? [REJ.x - 14, REJ.y + REJ.h / 2] : [bx(STAGES.indexOf(f.at)) + BW / 2, 78];
  const maxTests = Math.max(...AREAS.map((a) => a.tests));
  const sub = (s: Stage) => (s === 'regression' ? `${params.scope === 'full' ? 'full' : 'risk-based'} · ${planned}` : s === 'sanity' && params.build === 'feature' ? 'skipped' : LABEL[s][1]);

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<BuildType>
            label="Build type"
            value={params.build}
            options={[
              { value: 'feature', label: 'new feature' },
              { value: 'bugfix', label: 'bug-fix' },
              { value: 'hotfix', label: 'hotfix' },
            ]}
            onChange={(build) => setParams((p) => ({ ...p, build }))}
          />
          <Choice<SmokeResult> label="Smoke result" value={params.smoke} options={[{ value: 'pass', label: 'pass' }, { value: 'fail', label: 'fail' }]} onChange={(smoke) => setParams((p) => ({ ...p, smoke }))} />
          <Choice<Scope> label="Regression scope" value={params.scope} options={[{ value: 'full', label: 'full' }, { value: 'risk', label: 'risk-based' }]} onChange={(scope) => setParams((p) => ({ ...p, scope }))} />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> current gate
          <span className="viz-key" style={{ background: 'var(--good)' }} /> passed
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> failed / rejected
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> impacted area (always in regression)
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`${f.buildName} at ${f.at}. ${f.testsRun} tests run, ${fmt(f.minutes)} of testing.`}
      >
        <defs>
          <marker id="bg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
        </defs>
        {STAGES.map((s, i) => {
          const cur = f.at === s;
          const ok = f.passed.includes(s) && !cur;
          const skipped = s === 'sanity' && params.build === 'feature';
          const failed = s === 'smoke' && f.smoke.includes('fail') && (f.at === 'smoke' || f.at === 'rejected');
          const tone = failed ? 'bad' : cur ? 'accent' : ok ? 'good' : null;
          return (
            <g key={s} opacity={skipped ? 0.5 : 1}>
              {i > 0 && <line x1={bx(i) - GAP + 1} x2={bx(i) - 2} y1={40} y2={40} stroke="var(--muted)" markerEnd="url(#bg-arrow)" />}
              <rect x={bx(i)} y={18} width={BW} height={44} rx={8} fill={tone ? `var(--${tone}-soft)` : 'var(--surface-2)'} stroke={tone ? `var(--${tone})` : 'var(--border)'} strokeWidth={cur ? 2.5 : 1.2} strokeDasharray={skipped ? '4 3' : undefined} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
              <text x={bx(i) + BW / 2} y={36} textAnchor="middle" fontSize={12} fontWeight={700}>
                {LABEL[s][0]}
              </text>
              <text x={bx(i) + BW / 2} y={52} textAnchor="middle" fontSize={9.5} className="viz-label">
                {sub(s)}
              </text>
            </g>
          );
        })}
        {params.build === 'feature' && <path d={`M${bx(1) + BW / 2},18 Q${bx(2) + BW / 2},-6 ${bx(3) + BW / 2},16`} className="viz-edge" markerEnd="url(#bg-arrow)" />}
        {/* rejection branch */}
        <path d={`M${bx(1) + BW / 2},62 L${bx(1) + BW / 2},${REJ.y + REJ.h / 2} L${REJ.x - 2},${REJ.y + REJ.h / 2}`} className="viz-edge" markerEnd="url(#bg-arrow)" style={{ stroke: f.rejected ? 'var(--bad)' : undefined }} />
        <rect x={REJ.x} y={REJ.y} width={REJ.w} height={REJ.h} rx={13} fill={f.rejected ? 'var(--bad-soft)' : 'var(--surface-2)'} stroke={f.rejected ? 'var(--bad)' : 'var(--border)'} style={{ transition: 'fill 0.35s ease' }} />
        <text x={REJ.x + REJ.w / 2} y={REJ.y + 17} textAnchor="middle" fontSize={10.5} fontWeight={700} style={{ fill: f.rejected ? 'var(--bad)' : 'var(--text-2)' }}>
          ✗ rejected → dev
        </text>
        {/* moving build token */}
        <g style={{ transform: `translate(${tokenAt[0]}px, ${tokenAt[1]}px)`, transition: 'transform 0.6s cubic-bezier(.4,0,.2,1)' }}>
          <rect x={-22} y={-9} width={44} height={18} rx={9} fill={f.rejected ? 'var(--bad)' : f.at === 'release' ? 'var(--good)' : 'var(--accent)'} style={{ transition: 'fill 0.35s ease' }} />
          <text y={4} textAnchor="middle" fontSize={9.5} fontWeight={700} style={{ fill: 'var(--surface-2)' }}>
            build
          </text>
        </g>
        <text x={330} y={102} fontSize={10.5} fontWeight={700}>
          {f.buildName.length > 46 ? f.buildName.slice(0, 45) + '…' : f.buildName}
        </text>
        <text x={330} y={120} fontSize={10.5} style={{ fill: 'var(--text-2)' }}>
          tests run: <tspan fontWeight={700} style={{ fill: 'var(--text)' }}>{f.testsRun}</tspan> · testing time: <tspan fontWeight={700} style={{ fill: 'var(--text)' }}>{fmt(f.minutes)}</tspan>
        </text>
        <line x1={4} x2={596} y1={150} y2={150} stroke="var(--border)" />
        <CheckList x={6} title={`Smoke · ${SMOKE.length} checks, ~15 min`} items={SMOKE} checks={f.smoke} active={f.at === 'smoke'} />
        {params.build === 'feature' ? (
          <g>
            <text x={204} y={176} fontSize={10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
              Sanity · skipped
            </text>
            {['New feature → planned functional', 'testing of the Wishlist instead.', 'Sanity = a quick, deep check of', 'one fix or small change.'].map((l, k) => (
              <text key={k} x={204} y={196 + k * 16} fontSize={10} className="viz-label">
                {l}
              </text>
            ))}
          </g>
        ) : (
          <CheckList x={204} title={`Sanity · ${B.sanity.length} deep checks`} items={B.sanity} checks={f.sanity} active={f.at === 'sanity'} />
        )}
        <text x={400} y={176} fontSize={10.5} fontWeight={700} style={{ fill: f.at === 'regression' ? 'var(--accent)' : 'var(--text-2)' }}>
          Regression · {planned} tests, ~{fmt(planned * 0.3)}
        </text>
        {f.reg.map((r, k) => {
          const y = 186 + k * 18;
          const full = (AREAS[k].tests / maxTests) * 92;
          const plan = (r.planned / maxTests) * 92;
          const done = r.planned ? (r.done / r.planned) * plan : 0;
          return (
            <g key={r.name}>
              <text x={400} y={y + 10} fontSize={9.5} fontWeight={r.impacted ? 700 : 400} style={{ fill: r.impacted ? 'var(--warn)' : 'var(--text-2)' }}>
                {r.name}
              </text>
              <rect x={486} y={y + 1} width={full} height={11} rx={2} fill="none" stroke="var(--border)" strokeDasharray={r.planned < AREAS[k].tests ? '3 2' : undefined} />
              <rect x={486} y={y + 1} width={plan} height={11} rx={2} fill="var(--surface-2)" stroke="var(--border)" />
              <rect x={486} y={y + 1} width={done} height={11} rx={2} fill="var(--good)" style={{ transition: 'width 0.6s ease' }} />
              <text x={486 + full + 3} y={y + 10} fontSize={8.5} className="viz-label">
                {r.planned}
              </text>
            </g>
          );
        })}
      </svg>
    </VizFrame>
  );
}
