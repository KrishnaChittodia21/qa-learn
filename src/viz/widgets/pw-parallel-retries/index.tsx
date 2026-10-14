import { useMemo, useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { FILES, TESTS, plan, simulate, type Params, type Verdict } from './sim';

const G_X0 = 92;
const G_X1 = 590;
const G_Y0 = 50;
const G_Y1 = 286;
const ease = 'fill 0.35s ease, stroke 0.35s ease, opacity 0.35s ease';
const VERDICT_COLOR: Record<Verdict, string> = { passed: 'var(--good)', flaky: 'var(--warn)', failed: 'var(--bad)' };

export default function PwParallelRetriesViz() {
  const [params, setParams] = useState<Params>({ workers: 2, shards: 1, retries: 1, fullyParallel: 'off' });
  const frames = useSimulation(simulate, params);
  const p = useMemo(() => plan(params), [params]);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const { workers: W, shards: S } = params;
  const set = (k: keyof Params) => (v: number) => setParams((q) => ({ ...q, [k]: v }));

  const maxT = Math.ceil(p.wall / 2) * 2 + 1;
  const x = (t: number) => G_X0 + (t / maxT) * (G_X1 - G_X0);
  const lanes = S * W;
  const laneH = Math.min(30, (G_Y1 - G_Y0) / lanes);
  const laneY = (shard: number, lane: number) => G_Y0 + (shard * W + lane) * laneH;
  const tickStep = maxT > 20 ? 5 : 2;

  const vs = Object.values(f.verdicts);
  const count = (k: Verdict) => vs.filter((v) => v === k).length;
  const running = p.bars.filter((b) => b.test >= 0 && b.start < f.now && b.end > f.now).length;

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Slider label="Workers per machine" value={W} min={1} max={4} onChange={set('workers')} />
          <Slider label="Shards (machines)" value={S} min={1} max={3} onChange={set('shards')} />
          <Slider label="Retries" value={params.retries} min={0} max={2} onChange={set('retries')} />
          <Choice<'off' | 'on'>
            label="fullyParallel"
            value={params.fullyParallel}
            options={[
              { value: 'off', label: 'off: file = unit' },
              { value: 'on', label: 'on: test = unit' },
            ]}
            onChange={(v) => setParams((q) => ({ ...q, fullyParallel: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> attempt passed
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> attempt failed (worker discarded)
          <span className="viz-key" style={{ background: 'var(--border)' }} /> worker start-up
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> flaky in report
          <span className="viz-key ring" /> retry
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`At ${f.now.toFixed(1)} s: ${count('passed')} passed, ${count('flaky')} flaky, ${count('failed')} failed; wall time ${p.wall.toFixed(1)} s across ${S} shard(s) with ${W} worker(s) each.`}
      >
        {/* report header */}
        <text x={4} y={18} fontSize={12} fontWeight={700}>
          t = {f.now.toFixed(1)} s{f.done ? ` · wall time ${p.wall.toFixed(1)} s (serial ${p.serial.toFixed(1)} s)` : ` · ${running} running`}
        </text>
        {(['passed', 'flaky', 'failed'] as Verdict[]).map((k, i) => (
          <g key={k} transform={`translate(${372 + i * 76}, 4)`}>
            <rect width={70} height={20} rx={10} fill="var(--surface-2)" stroke={VERDICT_COLOR[k]} strokeWidth={count(k) ? 2 : 1} style={{ transition: ease }} />
            <text x={35} y={14} textAnchor="middle" fontSize={10.5} fontWeight={700} style={{ fill: VERDICT_COLOR[k] }}>
              {count(k)} {k}
            </text>
          </g>
        ))}

        {/* time axis */}
        {Array.from({ length: Math.floor(maxT / tickStep) + 1 }, (_, i) => i * tickStep).map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={G_Y0 - 6} x2={x(t)} y2={G_Y1} stroke="var(--border)" strokeDasharray="2 4" />
            <text x={x(t)} y={G_Y0 - 10} textAnchor="middle" fontSize={9} style={{ fill: 'var(--text-2)' }}>
              {t}s
            </text>
          </g>
        ))}

        {/* lanes */}
        {Array.from({ length: S }, (_, s) => (
          <g key={s}>
            {s > 0 && <line x1={0} y1={laneY(s, 0)} x2={G_X1} y2={laneY(s, 0)} stroke="var(--text-2)" strokeWidth={1.2} />}
            {Array.from({ length: W }, (_, w) => (
              <g key={w}>
                <rect x={G_X0} y={laneY(s, w) + 1} width={G_X1 - G_X0} height={laneH - 2} fill="var(--surface-2)" opacity={0.6} />
                <text x={G_X0 - 6} y={laneY(s, w) + laneH / 2 + 3.5} textAnchor="end" fontSize={Math.min(10, laneH * 0.55)} style={{ fill: 'var(--text-2)' }}>
                  {S > 1 ? `shard ${s + 1} · ` : ''}w{w + 1}
                </text>
              </g>
            ))}
            {S > 1 && (
              <line x1={x(p.shardEnd[s])} y1={laneY(s, 0) + 1} x2={x(p.shardEnd[s])} y2={laneY(s, W) - 1} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="3 2" opacity={f.now >= p.shardEnd[s] ? 1 : 0.25} style={{ transition: ease }} />
            )}
          </g>
        ))}

        {/* bars */}
        {p.bars.map((b, i) => {
          const y = laneY(b.shard, b.lane) + 3;
          const h = laneH - 6;
          const shown = Math.max(0, Math.min(b.end, f.now) - b.start);
          const w = Math.max(0, x(b.start + shown) - x(b.start));
          if (b.test < 0)
            return <rect key={i} x={x(b.start)} y={y + h * 0.25} width={w} height={h * 0.5} rx={2} fill="var(--border)" style={{ transition: 'width 0.6s ease' }} />;
          const def = TESTS[b.test];
          const finished = f.now >= b.end;
          const verdict = f.verdicts[b.test];
          const fill = !finished ? 'var(--accent-soft)' : b.ok ? 'var(--good-soft)' : 'var(--bad-soft)';
          const stroke = !finished ? 'var(--accent)' : b.ok ? (verdict === 'flaky' ? 'var(--warn)' : 'var(--good)') : 'var(--bad)';
          const full = x(b.end) - x(b.start);
          return (
            <g key={i} style={{ opacity: shown > 0 ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              <rect x={x(b.start)} y={y} width={w} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={b.attempt ? 2.2 : 1.3} style={{ transition: `width 0.6s ease, ${ease}` }} />
              {full > 22 && h > 9 && (
                <text x={x(b.start) + 3} y={y + h / 2 + 3.5} fontSize={Math.min(10, h * 0.7)} fontWeight={600} style={{ fill: 'var(--text)', opacity: shown >= b.end - b.start ? 1 : 0.6 }}>
                  {def.label}
                  {b.attempt ? `↻${b.attempt}` : ''}
                  {finished && !b.ok ? ' ✗' : ''}
                </text>
              )}
            </g>
          );
        })}

        {/* now line */}
        <g style={{ transform: `translateX(${x(Math.min(f.now, maxT))}px)`, transition: 'transform 0.6s ease' }}>
          <line x1={0} y1={G_Y0 - 4} x2={0} y2={G_Y1 + 2} stroke="var(--text)" strokeWidth={1.6} />
        </g>

        {/* files / shards footer */}
        {FILES.map((file, i) => {
          const ids = TESTS.filter((t) => t.file === i);
          const shard = p.shardOf[ids[0].id];
          const mixed = ids.some((t) => p.shardOf[t.id] !== shard);
          return (
            <g key={file} transform={`translate(${4 + i * 149}, 298)`}>
              <rect width={143} height={38} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
              <text x={6} y={14} fontSize={10} fontWeight={700} style={{ fontFamily: 'var(--mono)' }}>
                {file}
              </text>
              <text x={6} y={30} fontSize={9} style={{ fill: 'var(--text-2)' }}>
                {ids.length} tests · {S > 1 ? (mixed ? 'split across shards' : `shard ${shard + 1}`) : `${ids.reduce((a, t) => a + t.dur, 0).toFixed(1)} s`}
                {ids.some((t) => t.kind === 'flaky') ? ' · 1 flaky' : ids.some((t) => t.kind === 'broken') ? ' · 1 broken' : ''}
              </text>
            </g>
          );
        })}
      </svg>
    </VizFrame>
  );
}
