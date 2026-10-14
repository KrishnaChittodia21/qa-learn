import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { AREAS, CHARTER, DEFAULT_PARAMS, simulate, type Frame, type Kind, type MarkKind, type Params } from './sim';

const X0 = 20;
const XW = 560;
const BY = 40;
const BH = 22;
const SEG: Record<Kind, { c: string; soft: string; label: string }> = {
  T: { c: 'var(--accent)', soft: 'var(--accent-soft)', label: 'Test design & execution' },
  B: { c: 'var(--bad)', soft: 'var(--bad-soft)', label: 'Bug investigation & reporting' },
  S: { c: 'var(--warn)', soft: 'var(--warn-soft)', label: 'Setup' },
};
const MARK: Record<MarkKind, { c: string; sym: string }> = {
  note: { c: 'var(--accent)', sym: '✎' },
  bug: { c: 'var(--bad)', sym: '✱' },
  issue: { c: 'var(--warn)', sym: '?' },
};
const AREA_COL = { todo: 'var(--muted)', partial: 'var(--warn)', done: 'var(--good)' };

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

function Sheet({ f }: { f: Frame }) {
  const rows: { c: string; text: string; bold?: boolean }[] = [];
  if (f.proof.length) {
    rows.push({ c: 'var(--text)', text: 'DEBRIEF (PROOF)', bold: true });
    for (const p of f.proof) wrap(`${p.k}: ${p.text}`, 66).forEach((l, k) => rows.push({ c: k ? 'var(--text-2)' : 'var(--text)', text: (k ? '   ' : '') + l }));
  } else {
    rows.push({ c: 'var(--text)', text: 'SESSION SHEET', bold: true });
    wrap(`CHARTER: ${CHARTER}`, 62).forEach((l) => rows.push({ c: 'var(--text-2)', text: l }));
    for (const kind of ['note', 'bug', 'issue'] as MarkKind[]) {
      const ms = f.marks.filter((m) => m.kind === kind);
      rows.push({ c: MARK[kind].c, text: kind === 'note' ? 'TEST NOTES' : kind === 'bug' ? 'BUGS' : 'ISSUES', bold: true });
      (ms.length ? ms : [{ at: -1, text: '–' }]).slice(-4).forEach((m) => rows.push({ c: 'var(--text)', text: m.at < 0 ? '  –' : `  ${m.at}′ ${m.text}` }));
    }
  }
  return (
    <g>
      <rect x={6} y={96} width={356} height={228} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      {rows.slice(0, 15).map((r, k) => (
        <text key={k} x={14} y={112 + k * 14.2} fontSize={r.bold ? 9.5 : 9.8} fontWeight={r.bold ? 700 : 400} style={{ fill: r.c }}>
          {r.text}
        </text>
      ))}
    </g>
  );
}

export default function SessionTimelineViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const fin = frames[frames.length - 1];
  const L = params.minutes;
  const x = (m: number) => X0 + (m / L) * XW;
  const ticks = Array.from({ length: L / 15 + 1 }, (_, k) => k * 15);

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<string>
            label="Session length"
            value={String(params.minutes)}
            options={[
              { value: '45', label: '45 min (short)' },
              { value: '90', label: '90 min (normal)' },
              { value: '120', label: '120 min (long)' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, minutes: Number(v) as Params['minutes'] }))}
          />
          <Choice<string>
            label="Environment"
            value={params.flaky ? 'flaky' : 'stable'}
            options={[
              { value: 'stable', label: 'stable' },
              { value: 'flaky', label: 'flaky' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, flaky: v === 'flaky' }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: SEG.T.c }} /> {SEG.T.label}
          <span className="viz-key" style={{ background: SEG.B.c }} /> {SEG.B.label}
          <span className="viz-key" style={{ background: SEG.S.c }} /> {SEG.S.label}
          <span className="viz-key" style={{ background: 'var(--accent-soft)', border: '1px dashed var(--accent)' }} /> opportunity
        </>
      }
    >
      <svg
        viewBox="0 0 600 330"
        className="viz-svg"
        role="img"
        aria-label={`SBTM session at minute ${f.now} of ${L}. ${f.marks.length} entries on the sheet.${f.tbs ? ` TBS: test ${f.tbs.T}%, bug ${f.tbs.B}%, setup ${f.tbs.S}%.` : ''}${f.opp !== null ? ` Charter ${100 - f.opp}%, opportunity ${f.opp}%.` : ''}`}
      >
        {/* timeline */}
        <rect x={X0} y={BY} width={XW} height={BH} rx={4} fill="var(--surface-2)" stroke="var(--border)" />
        {fin.segs.map((s, k) => {
          const on = k < f.segs.length;
          const c = SEG[s.kind];
          return (
            <rect
              key={k}
              x={x(s.start)}
              y={BY}
              width={x(s.end) - x(s.start)}
              height={BH}
              fill={s.opp ? c.soft : c.c}
              stroke={s.opp ? c.c : 'var(--surface-2)'}
              strokeDasharray={s.opp ? '3 2' : undefined}
              style={{ transform: `scaleX(${on ? 1 : 0})`, transformOrigin: `${x(s.start)}px 0px`, transition: 'transform 0.6s ease' }}
            />
          );
        })}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={BY + BH + 12} textAnchor="middle" fontSize={9} style={{ fill: 'var(--text-2)' }}>
            {t}′
          </text>
        ))}
        {fin.marks.map((m, k) => (
          <g key={k} style={{ transform: `translate(${x(m.at)}px, ${BY - 12 - (k % 2) * 13}px)`, opacity: k < f.marks.length ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <circle r={6} fill={MARK[m.kind].c} />
            <text y={3} textAnchor="middle" fontSize={8} fontWeight={700} style={{ fill: 'var(--surface-2)' }}>
              {MARK[m.kind].sym}
            </text>
          </g>
        ))}
        <g style={{ transform: `translateX(${x(f.now)}px)`, transition: 'transform 0.6s ease' }}>
          <line x1={0} x2={0} y1={BY - 4} y2={BY + BH + 4} stroke="var(--text)" strokeWidth={2} />
        </g>
        <text x={X0} y={14} fontSize={10.5} fontWeight={700}>
          {f.now}′ / {L}′ timebox
        </text>
        <Sheet f={f} />
        {/* charter areas */}
        <text x={372} y={110} fontSize={10} fontWeight={700}>
          Charter coverage
        </text>
        {AREAS.map((a, k) => (
          <g key={a} opacity={k === 4 && L < 120 ? 0.45 : 1}>
            <circle cx={378} cy={123 + k * 15} r={4.5} fill={AREA_COL[f.areas[k]]} style={{ transition: 'fill 0.35s ease' }} />
            <text x={388} y={126.5 + k * 15} fontSize={9.5}>
              {a} {f.areas[k] === 'partial' ? '(partly)' : ''}
            </text>
          </g>
        ))}
        {/* TBS + charter/opportunity bars */}
        <text x={372} y={212} fontSize={10} fontWeight={700} opacity={f.tbs ? 1 : 0.4}>
          TBS {f.tbs ? `T ${f.tbs.T}% · B ${f.tbs.B}% · S ${f.tbs.S}%` : '(after the session)'}
        </text>
        {(['T', 'B', 'S'] as Kind[]).map((k, n) => {
          const t = f.tbs ?? { T: 0, B: 0, S: 0 };
          const before = (['T', 'B', 'S'] as Kind[]).slice(0, n).reduce((a, j) => a + t[j], 0);
          return <rect key={k} x={372 + before * 2.2} y={218} width={t[k] * 2.2} height={14} fill={SEG[k].c} style={{ transition: 'width 0.6s ease, x 0.6s ease' }} />;
        })}
        <rect x={372} y={218} width={220} height={14} fill="none" stroke="var(--border)" />
        <text x={372} y={254} fontSize={10} fontWeight={700} opacity={f.opp !== null ? 1 : 0.4}>
          Charter vs opportunity {f.opp !== null ? `${100 - f.opp} / ${f.opp}` : ''}
        </text>
        <rect x={372} y={260} width={f.opp !== null ? (100 - f.opp) * 2.2 : 0} height={14} fill="var(--accent)" style={{ transition: 'width 0.6s ease' }} />
        <rect x={372 + (f.opp !== null ? (100 - f.opp) * 2.2 : 220)} y={260} width={f.opp !== null ? f.opp * 2.2 : 0} height={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeDasharray="3 2" style={{ transition: 'width 0.6s ease, x 0.6s ease' }} />
        <rect x={372} y={260} width={220} height={14} fill="none" stroke="var(--border)" />
        <text x={372} y={300} className="viz-label">
          {f.tbs && f.tbs.S > 20 ? 'high Setup %: raise env as a project risk' : f.tbs && f.tbs.B >= 25 ? 'high Bug %: plan more sessions here' : ''}
        </text>
      </svg>
    </VizFrame>
  );
}
