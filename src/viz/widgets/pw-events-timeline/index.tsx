import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { CODE, simulate, type Params, type Scenario, type Target, type Timing, type Tone } from './sim';

const ease = 'transform 0.6s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease';
const TONE: Record<Tone, string> = { good: 'var(--good)', bad: 'var(--bad)', warn: 'var(--warn)', accent: 'var(--accent)', muted: 'var(--muted)' };
// piecewise time axis: zoom in on the busy 100–220 ms window, compress the long timeouts
const BP: [number, number][] = [
  [0, 70],
  [100, 110],
  [220, 330],
  [520, 420],
  [1100, 470],
  [6000, 535],
  [30000, 590],
];
function x(t: number) {
  for (let i = 1; i < BP.length; i++) {
    const [t0, x0] = BP[i - 1];
    const [t1, x1] = BP[i];
    if (t <= t1) return x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
  }
  return 590;
}
const TICKS = [0, 100, 200, 500, 1000, 5000, 30000];
const fmt = (t: number) => (t >= 1000 ? `${t / 1000}s` : `${t}ms`);
const SRC = { x: 130, y: 182 };
const BINS: { id: Target; label: string; sub: string; tone: string }[] = [
  { id: 'handler', label: 'handler / waiter', sub: 'event delivered', tone: 'var(--good)' },
  { id: 'auto', label: 'auto-dismissed', sub: 'no dialog listener', tone: 'var(--warn)' },
  { id: 'missed', label: 'missed', sub: 'nobody was waiting', tone: 'var(--bad)' },
];
const binX = (k: number) => 268 + k * 110;

export default function PwEventsTimelineViz() {
  const [params, setParams] = useState<Params>({ scenario: 'dialog-before', timing: 'sync' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const code = CODE[params.scenario];
  const kind = params.scenario.startsWith('dialog') ? 'dialog' : params.scenario === 'download' ? 'download' : 'popup';
  const tk = f.token ? BINS.findIndex((b) => b.id === f.token) : -1;
  const tokenPos = tk >= 0 ? { x: binX(tk) + 50, y: 226 } : SRC;
  const statusColor = f.status === 'pass' ? 'var(--good)' : f.status === 'fail' ? 'var(--bad)' : 'var(--accent)';
  const pageLabel = f.page === 'dialog' ? 'frozen in confirm()' : f.page === 'loading' ? 'loading' : 'running';
  const clickLabel = { idle: 'not called', running: 'running', done: 'resolved', stalled: 'STALLED' }[f.click];
  // labels: newest marker first, then older ones only where they do not crowd an already-labelled one
  const shown = new Set<number>();
  const placed: Record<string, number[]> = { test: [], browser: [] };
  for (let k = f.markers.length - 1; k >= 0; k--) {
    const m = f.markers[k];
    if (placed[m.lane].every((px) => Math.abs(px - x(m.t)) > 40)) {
      placed[m.lane].push(x(m.t));
      shown.add(k);
    }
  }

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Scenario>
            label="Scenario"
            value={params.scenario}
            options={[
              { value: 'dialog-before', label: 'dialog: handler before' },
              { value: 'dialog-after', label: 'dialog: handler after' },
              { value: 'dialog-noop', label: 'dialog: never accepts' },
              { value: 'popup-before', label: 'popup: wait before' },
              { value: 'popup-after', label: 'popup: wait after' },
              { value: 'download', label: 'download' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, scenario: v }))}
          />
          <Choice<Timing>
            label="App reacts"
            value={params.timing}
            options={[
              { value: 'sync', label: 'immediately' },
              { value: 'delayed', label: '300 ms later' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, timing: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> test-code step
          <span className="viz-key" style={{ background: 'var(--good)' }} /> event delivered / pass
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> auto-dismiss / luck
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> missed / fail
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`At ${fmt(f.t)}: page ${pageLabel}, click ${clickLabel}, ${f.listeners} dialog listeners${f.waiting ? `, waiting for ${f.waiting}` : ''}, result "${f.result || 'empty'}", ${f.tabs} tab(s); test ${f.status}.`}
      >
        {/* code */}
        <rect x={4} y={4} width={592} height={code.length * 16 + 10} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        {code.map((l, i) => (
          <g key={i}>
            <rect x={6} y={8 + i * 16} width={588} height={15} rx={3} fill={i === f.line ? 'var(--accent-soft)' : 'none'} style={{ transition: ease }} />
            <text x={14} y={19 + i * 16} fontSize={10.5} style={{ fontFamily: 'var(--mono)', fill: i === f.line ? 'var(--text)' : 'var(--text-2)' }}>
              {l}
            </text>
          </g>
        ))}

        {/* mock browser */}
        <rect x={8} y={104} width={244} height={146} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
        {[0, 1].map((k) => (
          <g key={k} style={{ opacity: k < f.tabs ? 1 : 0, transition: ease }}>
            <rect x={14 + k * 92} y={108} width={88} height={16} rx={4} fill={k === 0 ? 'var(--surface-2)' : 'var(--good-soft)'} stroke={k === 0 ? 'var(--border)' : 'var(--good)'} />
            <text x={20 + k * 92} y={120} fontSize={9}>
              {k === 0 ? (kind === 'popup' ? '/windows' : kind === 'download' ? '/download' : '/javascript_alerts') : 'New Window'}
            </text>
          </g>
        ))}
        <g style={{ opacity: f.page === 'loading' ? 0.3 : 1, transition: ease }}>
          <rect x={24} y={138} width={150} height={22} rx={5} fill={kind === 'dialog' ? 'var(--accent)' : 'none'} stroke={kind === 'dialog' ? 'none' : 'var(--border)'} />
          <text x={99} y={153} textAnchor="middle" fontSize={10} fontWeight={700} style={{ fill: kind === 'dialog' ? 'var(--surface)' : 'var(--accent)', textDecoration: kind === 'dialog' ? undefined : 'underline' }}>
            {kind === 'dialog' ? 'Click for JS Confirm' : kind === 'popup' ? 'Click Here' : 'some-file.txt'}
          </text>
          {kind === 'dialog' && (
            <text x={24} y={186} fontSize={10} style={{ fontFamily: 'var(--mono)', fill: f.result.includes('Ok') ? 'var(--good)' : f.result ? 'var(--bad)' : 'var(--muted)' }}>
              #result: {f.result || '(empty)'}
            </text>
          )}
        </g>
        {kind === 'download' && (
          <g style={{ opacity: f.download === 'none' ? 0 : 1, transition: ease }}>
            <rect x={14} y={222} width={232} height={22} rx={5} fill={f.download === 'saved' ? 'var(--good-soft)' : f.download === 'deleted' ? 'var(--surface-2)' : 'var(--warn-soft)'} stroke="var(--border)" style={{ transition: ease }} />
            <text x={22} y={237} fontSize={9.5} style={{ fontFamily: 'var(--mono)' }}>
              ⬇ some-file.txt · {f.download === 'temp' ? 'temp folder' : f.download === 'saved' ? 'saved to test-results/' : 'temp deleted, copy kept'}
            </text>
          </g>
        )}
        <g style={{ opacity: f.page === 'dialog' ? 1 : 0, transition: ease }}>
          <rect x={40} y={164} width={180} height={64} rx={7} fill="var(--surface)" stroke="var(--warn)" strokeWidth={2} />
          <text x={52} y={182} fontSize={10.5} fontWeight={700}>
            I am a JS Confirm
          </text>
          <rect x={98} y={198} width={54} height={20} rx={4} fill="var(--surface-2)" stroke="var(--border)" />
          <text x={125} y={212} textAnchor="middle" fontSize={9.5}>
            Cancel
          </text>
          <rect x={158} y={198} width={50} height={20} rx={4} fill="var(--accent)" />
          <text x={183} y={212} textAnchor="middle" fontSize={9.5} style={{ fill: 'var(--surface)' }}>
            OK
          </text>
        </g>

        {/* playwright side */}
        <text x={266} y={118} fontSize={10.5}>
          {kind === 'dialog' ? (
            <>
              dialog listeners: <tspan fontWeight={700} style={{ fill: f.listeners ? 'var(--good)' : 'var(--warn)' }}>{f.listeners}</tspan>
            </>
          ) : (
            <>
              waitForEvent(&apos;{kind}&apos;): <tspan fontWeight={700} style={{ fill: f.waiting ? 'var(--good)' : 'var(--muted)' }}>{f.waiting ? 'listening' : 'not listening'}</tspan>
            </>
          )}
        </text>
        <text x={266} y={138} fontSize={10.5}>
          click(): <tspan fontWeight={700} style={{ fill: f.click === 'stalled' ? 'var(--bad)' : f.click === 'done' ? 'var(--good)' : 'var(--text)' }}>{clickLabel}</tspan>
          {'   '}page JS: <tspan fontWeight={700} style={{ fill: f.page === 'dialog' ? 'var(--warn)' : 'var(--text)' }}>{pageLabel}</tspan>
        </text>
        <text x={266} y={160} fontSize={11} fontWeight={700} style={{ fill: statusColor, transition: ease }}>
          t = {fmt(f.t)} · {f.status === 'running' ? 'test running' : f.status === 'pass' ? 'PASS' : 'FAIL'}
        </text>
        <text x={266} y={186} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          where the {kind} event went:
        </text>
        {BINS.map((b, k) => (
          <g key={b.id}>
            <rect x={binX(k)} y={194} width={102} height={50} rx={6} fill={tk === k ? 'var(--surface-2)' : 'none'} stroke={tk === k ? b.tone : 'var(--border)'} strokeWidth={tk === k ? 2 : 1} strokeDasharray={tk === k ? undefined : '4 3'} style={{ transition: ease }} />
            <text x={binX(k) + 51} y={208} textAnchor="middle" fontSize={9.5} fontWeight={700} style={{ fill: b.tone }}>
              {b.label}
            </text>
            <text x={binX(k) + 51} y={240} textAnchor="middle" fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
              {b.sub}
            </text>
          </g>
        ))}
        <g style={{ transform: `translate(${tokenPos.x}px, ${tokenPos.y}px)`, opacity: tk >= 0 ? 1 : 0, transition: ease }}>
          <circle r={7} fill={tk >= 0 ? BINS[tk].tone : 'var(--accent)'} />
          <text y={3} textAnchor="middle" fontSize={8} fontWeight={700} style={{ fill: 'var(--surface)' }}>
            ev
          </text>
        </g>

        {/* timeline */}
        {(['test', 'browser'] as const).map((lane, li) => (
          <g key={lane}>
            <text x={8} y={284 + li * 32} fontSize={9.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
              {lane === 'test' ? 'test code' : 'browser'}
            </text>
            <line x1={70} y1={280 + li * 32} x2={590} y2={280 + li * 32} stroke="var(--border)" />
          </g>
        ))}
        {f.markers.map((m, k) => {
          const mx = x(m.t);
          const y = m.lane === 'test' ? 280 : 312;
          const newest = k === f.markers.length - 1;
          const show = shown.has(k);
          return (
            <g key={k}>
              <circle cx={mx} cy={y} r={newest ? 5 : 3.5} fill={TONE[m.tone]} className="viz-dot" />
              {show && (
                <text x={mx} y={y - 8} textAnchor="middle" fontSize={8} fontWeight={newest ? 700 : 400} style={{ fill: newest ? TONE[m.tone] : 'var(--text-2)' }}>
                  {m.label}
                </text>
              )}
            </g>
          );
        })}
        {TICKS.map((t) => (
          <text key={t} x={x(t)} y={336} textAnchor="middle" fontSize={8} style={{ fill: 'var(--muted)' }}>
            {fmt(t)}
          </text>
        ))}
        <g style={{ transform: `translateX(${x(f.t)}px)`, transition: 'transform 0.5s ease' }}>
          <line x1={0} y1={262} x2={0} y2={324} stroke="var(--text)" strokeWidth={1.5} />
          <path d="M-4,260 L4,260 L0,266 Z" fill="var(--text)" />
        </g>
      </svg>
    </VizFrame>
  );
}
