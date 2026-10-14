import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { AC, COLS, DEFAULT_PARAMS, simulate, type Bug, type Check, type Params } from './sim';

const CW = 118;
const colX = (k: number) => 4 + k * CW;
const ease = 'transform 0.6s cubic-bezier(.4,0,.2,1)';
const CHK: Record<Check, { c: string; mark: string }> = {
  pending: { c: 'var(--muted)', mark: '…' },
  ok: { c: 'var(--good)', mark: '✓' },
  fail: { c: 'var(--bad)', mark: '✗' },
  warn: { c: 'var(--warn)', mark: '!' },
};

export default function SprintFlowViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const cardX = colX(f.col) + 8;
  const outC = f.outcome === 'Go' ? 'var(--good)' : f.outcome === 'No-go' ? 'var(--bad)' : 'var(--warn)';

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Bug>
            label="Bug found in test"
            value={params.bug}
            options={[
              { value: 'none', label: 'none' },
              { value: 'minor', label: 'minor' },
              { value: 'critical', label: 'critical' },
            ]}
            onChange={(bug) => setParams((p) => ({ ...p, bug }))}
          />
          <Choice<string>
            label="Acceptance criteria up front"
            value={params.acFirst ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'yes (three amigos)' },
              { value: 'no', label: 'no' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, acFirst: v === 'yes' }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> story
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> defect / failed criterion
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> rework loop / condition
          <span className="viz-key" style={{ background: 'var(--good)' }} /> met
        </>
      }
    >
      <svg
        viewBox="0 0 600 330"
        className="viz-svg"
        role="img"
        aria-label={`Scrum board: story in ${COLS[f.col]}, sprint day ${f.day}. ${f.ac} of 4 acceptance criteria written.${f.defect ? ` ${f.defect.id} ${f.defect.sev}, ${f.defect.state}.` : ''}${f.outcome ? ` Decision: ${f.outcome}.` : ''}`}
      >
        <defs>
          <marker id="sf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--warn)" />
          </marker>
        </defs>
        {/* board */}
        {COLS.map((c, k) => (
          <g key={c}>
            <rect x={colX(k)} y={6} width={CW - 6} height={106} rx={8} fill={f.col === k ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={f.col === k ? 'var(--accent)' : 'var(--border)'} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
            <text x={colX(k) + (CW - 6) / 2} y={22} textAnchor="middle" fontSize={10.5} fontWeight={700}>
              {c}
            </text>
          </g>
        ))}
        {/* rework / defect loop: In test → In dev */}
        <path d={`M${colX(3) + 30},110 Q${colX(3) - 2},140 ${colX(2) + 70},112`} fill="none" stroke={f.loop ? 'var(--warn)' : 'var(--border)'} strokeWidth={f.loop ? 2.2 : 1} strokeDasharray="4 3" markerEnd="url(#sf-arrow)" style={{ transition: 'stroke 0.35s ease' }} />
        <text x={colX(3) - 4} y={140} textAnchor="middle" fontSize={9} style={{ fill: f.loop ? 'var(--warn)' : 'var(--text-2)' }}>
          {f.rework ? `rework ×${f.rework}` : 'loop back'}
        </text>
        {/* story card */}
        <g style={{ transform: `translate(${cardX}px, 30px)`, transition: ease }}>
          <rect width={96} height={44} rx={6} fill="var(--surface-2)" stroke="var(--accent)" strokeWidth={2} />
          <rect width={5} height={44} rx={2} fill="var(--accent)" />
          <text x={10} y={15} fontSize={10} fontWeight={700}>
            SHOP-412
          </text>
          <text x={10} y={27} fontSize={9}>
            Apply a coupon
          </text>
          <text x={10} y={39} fontSize={9} fontWeight={700} style={{ fill: f.ac ? (f.acGuessed ? 'var(--warn)' : 'var(--good)') : 'var(--bad)' }}>
            {f.ac ? `AC ${f.ac}/4${f.acGuessed ? ' (late)' : ''}` : 'no AC'}
          </text>
        </g>
        {/* defect card */}
        <g style={{ transform: `translate(${cardX + 4}px, ${f.defect ? 80 : 60}px)`, opacity: f.defect ? 1 : 0, transition: `${ease}, opacity 0.4s ease` }}>
          <rect width={92} height={24} rx={5} fill={f.defect?.sev === 'Critical' ? 'var(--bad-soft)' : 'var(--warn-soft)'} stroke={f.defect?.sev === 'Critical' ? 'var(--bad)' : 'var(--warn)'} />
          <text x={6} y={10} fontSize={8.5} fontWeight={700}>
            {f.defect ? `${f.defect.id} ${f.defect.sev}` : ''}
          </text>
          <text x={6} y={20} fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
            {f.defect?.state ?? ''}
          </text>
        </g>
        {/* sprint days */}
        <text x={6} y={166} fontSize={10} fontWeight={700}>
          Sprint day
        </text>
        {Array.from({ length: 11 }, (_, d) => (
          <g key={d}>
            <rect x={70 + d * 47} y={154} width={43} height={18} rx={4} fill={d === f.day ? 'var(--accent)' : d < f.day ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke="var(--border)" style={{ transition: 'fill 0.35s ease' }} />
            <text x={91.5 + d * 47} y={166.5} textAnchor="middle" fontSize={9} fontWeight={d === f.day ? 700 : 400} style={{ fill: d === f.day ? 'var(--surface-2)' : 'var(--text)' }}>
              {d === 0 ? 'refine' : d}
            </text>
          </g>
        ))}
        {/* tester panel */}
        <rect x={4} y={182} width={290} height={144} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={14} y={198} fontSize={10.5} fontWeight={700}>
          Tester is doing
        </text>
        {f.tester.map((t, k) => (
          <text key={k} x={14} y={214 + k * 14} fontSize={10}>
            • {t}
          </text>
        ))}
        <text x={14} y={264} fontSize={10.5} fontWeight={700}>
          Acceptance criteria
        </text>
        {AC.map((a, k) => (
          <text key={a} x={14} y={279 + k * 12.5} fontSize={9.5} opacity={k < f.ac ? 1 : 0.35} style={{ fill: k < f.ac ? (f.acGuessed ? 'var(--warn)' : 'var(--text)') : 'var(--text-2)', transition: 'opacity 0.4s ease' }}>
            {k < f.ac ? '✓' : '○'} {a}
          </text>
        ))}
        {/* go / no-go gate */}
        <rect x={302} y={182} width={294} height={144} rx={8} fill="var(--surface-2)" stroke={f.outcome ? outC : 'var(--border)'} strokeWidth={f.outcome ? 2 : 1} style={{ transition: 'stroke 0.35s ease' }} />
        <text x={312} y={198} fontSize={10.5} fontWeight={700}>
          Go / no-go: exit criteria
        </text>
        {f.gate.map((g, k) => {
          const c = CHK[g.state];
          return (
            <g key={g.label}>
              <circle cx={318} cy={210 + k * 17} r={6} fill={g.state === 'pending' ? 'var(--surface-2)' : c.c} stroke={c.c} style={{ transition: 'fill 0.35s ease' }} />
              <text x={318} y={213 + k * 17} textAnchor="middle" fontSize={8} fontWeight={700} style={{ fill: g.state === 'pending' ? c.c : 'var(--surface-2)' }}>
                {c.mark}
              </text>
              <text x={330} y={213.5 + k * 17} fontSize={9.5}>
                {g.label}
              </text>
            </g>
          );
        })}
        {!f.gate.length && (
          <text x={312} y={222} className="viz-label">
            checked on the release candidate at sprint end
          </text>
        )}
        <g opacity={f.outcome ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }}>
          <rect x={312} y={298} width={170} height={20} rx={10} fill={outC} />
          <text x={397} y={312} textAnchor="middle" fontSize={10.5} fontWeight={700} style={{ fill: 'var(--surface-2)' }}>
            {f.outcome || ' '}
          </text>
          <text x={490} y={312} fontSize={9} style={{ fill: 'var(--text-2)' }}>
            PO decides
          </text>
        </g>
      </svg>
    </VizFrame>
  );
}
