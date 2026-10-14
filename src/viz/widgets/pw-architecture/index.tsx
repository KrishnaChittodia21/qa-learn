import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { simulate, type Frame, type Mode, type Params, type Toggle, type Worker } from './sim';

const ease = 'transform 0.55s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease';
const STAGES: Frame['stage'][] = ['cli', 'config', 'spawn', 'launch', 'run', 'collect', 'report'];
const reached = (f: Frame, s: Frame['stage']) => STAGES.indexOf(f.stage) >= STAGES.indexOf(s);

function TopBox({ x, w, title, sub, on, done }: { x: number; w: number; title: string; sub: string; on: boolean; done?: boolean }) {
  return (
    <g style={{ opacity: on ? 1 : 0.35, transition: ease }}>
      <rect x={x} y={8} width={w} height={42} rx={7} fill={done ? 'var(--good-soft)' : on ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={done ? 'var(--good)' : on ? 'var(--accent)' : 'var(--border)'} style={{ transition: ease }} />
      <text x={x + 10} y={25} fontSize={11.5} fontWeight={700} style={{ fontFamily: 'var(--mono)' }}>
        {title}
      </text>
      <text x={x + 10} y={41} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
        {sub}
      </text>
    </g>
  );
}

function WorkerCol({ w, x, width, mode }: { w: Worker; x: number; width: number; mode: Mode }) {
  const cx = x + width / 2;
  const n = w.contexts.length;
  const ctxW = n > 1 ? (width - 30) / 2 : width - 20;
  const short = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);
  const chars = Math.floor(width / 6.2);
  return (
    <g style={{ opacity: w.spawned ? 1 : 0.15, transition: ease }}>
      {/* worker process */}
      <rect x={x} y={64} width={width} height={42} rx={7} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={x + 8} y={79} fontSize={10.5} fontWeight={700}>
        worker {w.id} · Node process
      </text>
      <text x={x + 8} y={96} fontSize={9.5} style={{ fill: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
        {w.test ? short(`${w.file}: ${w.test}`, chars) : w.ran ? `${w.ran} test${w.ran > 1 ? 's' : ''} done` : 'idle'}
      </text>
      {/* wire */}
      <line x1={cx} y1={106} x2={cx} y2={142} className="viz-edge" strokeDasharray="3 3" style={{ opacity: w.browser ? 1 : 0.3 }} />
      <g style={{ transform: `translate(${cx}px, ${w.wire === 'down' ? 136 : 112}px)`, opacity: w.wire === 'none' ? 0 : 1, transition: ease }}>
        <circle r={5} fill={w.wire === 'down' ? 'var(--accent)' : 'var(--good)'} />
      </g>
      <text x={cx + 9} y={128} fontSize={8.5} style={{ fill: w.wire === 'up' ? 'var(--good)' : 'var(--accent)', fontFamily: 'var(--mono)', opacity: w.cmd ? 1 : 0, transition: ease }}>
        {short(w.cmd, Math.floor((width / 2 - 12) / 5.2))}
      </text>
      {/* browser */}
      <g style={{ opacity: w.browser ? 1 : 0.2, transition: ease }}>
        <rect x={x} y={144} width={width} height={186} rx={8} fill="var(--surface)" stroke={w.browser ? 'var(--accent)' : 'var(--border)'} strokeWidth={1.5} style={{ transition: ease }} />
        <text x={x + 8} y={160} fontSize={10.5} fontWeight={700}>
          {width > 260 ? 'Browser: Chromium' : 'Chromium'}
        </text>
        <text x={x + width - 8} y={160} textAnchor="end" fontSize={9} style={{ fill: mode === 'headed' ? 'var(--warn)' : 'var(--text-2)' }}>
          {mode === 'headed' ? (width > 260 ? 'headed (window)' : 'headed') : 'headless'}
        </text>
        {w.contexts.length === 0 && (
          <text x={cx} y={246} textAnchor="middle" fontSize={9.5} style={{ fill: 'var(--muted)' }}>
            {w.browser ? 'no context open' : ''}
          </text>
        )}
        {w.contexts.map((c, j) => {
          const cxX = x + 10 + j * (ctxW + 10);
          return (
            <g key={j}>
              <rect x={cxX} y={170} width={ctxW} height={150} rx={7} fill="var(--accent-soft)" stroke="var(--accent)" strokeDasharray="5 3" />
              <text x={cxX + 7} y={185} fontSize={9.5} fontWeight={700}>
                {c.label}
              </text>
              <rect x={cxX + 7} y={194} width={ctxW - 14} height={74} rx={5} fill="var(--surface)" stroke="var(--border)" />
              {mode === 'headed' && [0, 1, 2].map((d) => <circle key={d} cx={cxX + 15 + d * 8} cy={201} r={2.5} fill="var(--border)" />)}
              <text x={cxX + ctxW / 2} y={236} textAnchor="middle" fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
                Page (tab)
              </text>
              <text x={cxX + 7} y={286} fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
                cookie jar
              </text>
              <rect x={cxX + 7} y={292} width={ctxW - 14} height={18} rx={9} fill={c.cookie ? 'var(--good-soft)' : 'var(--surface-2)'} stroke={c.cookie ? 'var(--good)' : 'var(--border)'} style={{ transition: ease }} />
              <text x={cxX + ctxW / 2} y={304} textAnchor="middle" fontSize={8.5} style={{ fill: c.cookie ? 'var(--good)' : 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {c.cookie ? short(c.cookie, Math.floor((ctxW - 14) / 5)) : '(empty)'}
              </text>
            </g>
          );
        })}
      </g>
    </g>
  );
}

export default function PwArchitectureViz() {
  const [params, setParams] = useState<Params>({ workers: 2, twoUsers: 'off', mode: 'headless' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const W = params.workers;
  const gap = 10;
  const colW = (584 - gap * (W - 1)) / W;
  const openCtx = f.workers.reduce((s, w) => s + w.contexts.length, 0);
  const browsers = f.workers.filter((w) => w.browser).length;

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Slider label="Workers" value={W} min={1} max={3} onChange={(v) => setParams((p) => ({ ...p, workers: v }))} />
          <Choice<Toggle>
            label="Two users in one test"
            value={params.twoUsers}
            options={[
              { value: 'off', label: 'off' },
              { value: 'on', label: 'on: 2 contexts' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, twoUsers: v }))}
          />
          <Choice<Mode>
            label="Browser"
            value={params.mode}
            options={[
              { value: 'headless', label: 'headless' },
              { value: 'headed', label: '--headed' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, mode: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> command sent to browser
          <span className="viz-key" style={{ background: 'var(--good)' }} /> result / cookie stored
          <span className="viz-key" style={{ background: 'var(--accent-soft)' }} /> BrowserContext (isolated profile)
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`Stage ${f.stage}: ${W} workers, ${browsers} browsers running, ${openCtx} contexts open, ${f.passed} of ${f.total} tests passed${f.report ? ', report written' : ''}.`}
      >
        <TopBox x={8} w={180} title="npx playwright test" sub="Node test runner" on />
        <TopBox x={206} w={180} title="playwright.config.ts" sub={reached(f, 'config') ? `workers: ${W} · chromium · html` : 'not read yet'} on={reached(f, 'config')} />
        <TopBox x={404} w={188} title="playwright-report/" sub={f.report ? `index.html · ${f.passed}/${f.total} passed` : `${f.passed}/${f.total} results in`} on={f.passed > 0 || f.report} done={f.report} />
        <line x1={188} y1={29} x2={206} y2={29} className="viz-edge" />
        <line x1={386} y1={29} x2={404} y2={29} className="viz-edge" />
        <line x1={98} y1={50} x2={98} y2={64} className="viz-edge" style={{ opacity: reached(f, 'spawn') ? 1 : 0.2 }} />
        {f.workers.map((w, k) => (
          <WorkerCol key={k} w={w} x={8 + k * (colW + gap)} width={colW} mode={params.mode} />
        ))}
      </svg>
    </VizFrame>
  );
}
