import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { CHECKS, PHASES, PHASE_LABEL, SLEEP_MS, phaseStart, simulate, type CheckState, type Params, type Phase, type Strategy } from './sim';

const CODE: Record<Strategy, string[]> = {
  autowait: ["await page.getByRole('button', { name: 'Submit' }).click();"],
  sleep: [`await page.waitForTimeout(${SLEEP_MS});            // hard sleep`, 'await submit.click({ force: true });     // no actionability checks'],
  expect: ["await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();"],
};
const BAND: Record<Phase, string> = {
  absent: 'var(--surface-2)',
  hidden: 'var(--border)',
  moving: 'var(--accent-soft)',
  covered: 'var(--bad-soft)',
  disabled: 'var(--warn-soft)',
  ready: 'var(--good-soft)',
};
const BAND_LABEL: Record<Phase, string> = { absent: 'absent', hidden: 'hidden', moving: 'moving', covered: 'overlay', disabled: 'disabled', ready: 'ready' };
const CHECK_COLOR: Record<CheckState, string> = { pass: 'var(--good)', fail: 'var(--bad)', idle: 'var(--muted)', skip: 'var(--border)' };
const T_X0 = 24;
const T_X1 = 580;
const ease = 'transform 0.5s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.35s ease';

export default function PwAutoWaitViz() {
  const [params, setParams] = useState<Params>({ readyAt: 3000, strategy: 'autowait', timeout: 5000 });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const { readyAt: R, strategy, timeout: T } = params;

  const maxT = Math.ceil((Math.max(T, R, SLEEP_MS) * 1.08) / 1000) * 1000;
  const x = (ms: number) => T_X0 + (Math.min(ms, maxT) / maxT) * (T_X1 - T_X0);

  // button geometry on the mock page
  const k = PHASES.indexOf(f.phase);
  const mStart = phaseStart(2, R);
  const mEnd = phaseStart(3, R);
  const slide = k < 2 ? -70 : k === 2 ? -70 * (1 - (f.t - mStart) / Math.max(1, mEnd - mStart)) : 0;
  const btnX = 70;
  const btnY = 168;
  const pressed = f.clicked;
  const hit = pressed && f.status === 'pass';
  const btnFill = hit ? 'var(--good)' : f.phase === 'ready' ? 'var(--accent)' : 'var(--surface-2)';
  const btnText = hit || f.phase === 'ready' ? 'var(--surface)' : 'var(--muted)';
  const cursor = pressed ? { x: btnX + 60, y: btnY + 18 } : { x: 222, y: 92 };

  const statusColor = f.status === 'pass' ? 'var(--good)' : f.status === 'fail' ? 'var(--bad)' : f.status === 'sleeping' ? 'var(--warn)' : 'var(--accent)';
  const statusText =
    f.status === 'pass' ? `PASS at ${f.endT} ms` : f.status === 'fail' ? `FAIL at ${f.endT} ms` : f.status === 'sleeping' ? 'sleeping, not looking' : 'waiting, re-checking';
  const panelTitle = strategy === 'autowait' ? 'click() actionability checks' : strategy === 'expect' ? 'toBeVisible() checks' : 'click({ force: true })';
  const skipNote = strategy === 'sleep' ? 'skipped by force' : 'not checked';

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Strategy>
            label="Strategy"
            value={strategy}
            options={[
              { value: 'autowait', label: 'Auto-wait click' },
              { value: 'sleep', label: 'Hard sleep 2 s' },
              { value: 'expect', label: 'Web-first assertion' },
            ]}
            onChange={(s) => setParams((p) => ({ ...p, strategy: s }))}
          />
          <Slider label="App ready after" value={R} min={1000} max={8000} step={250} onChange={(v) => setParams((p) => ({ ...p, readyAt: v }))} format={(v) => `${v} ms`} />
          <Slider label="Timeout (action / expect)" value={T} min={1000} max={10000} step={500} onChange={(v) => setParams((p) => ({ ...p, timeout: v }))} format={(v) => `${v} ms`} />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> check passes
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> check fails (retry)
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> not reached yet
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> re-check attempt
          <span className="viz-key" style={{ background: 'var(--bad-soft)' }} /> spinner overlay phase
        </>
      }
    >
      <svg viewBox="0 0 600 330" className="viz-svg" role="img" aria-label={`At ${f.t} ms the Submit button is ${PHASE_LABEL[f.phase]}; ${statusText}.`}>
        {/* code */}
        <rect x={4} y={4} width={592} height={CODE[strategy].length * 16 + 12} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        {CODE[strategy].map((line, i) => (
          <text key={i} x={14} y={22 + i * 16} fontSize={11} style={{ fontFamily: 'var(--mono)' }}>
            {line}
          </text>
        ))}

        {/* mock page */}
        <g>
          <rect x={10} y={58} width={240} height={168} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
          <rect x={10} y={58} width={240} height={20} rx={8} fill="var(--surface-2)" />
          {[22, 34, 46].map((cx) => (
            <circle key={cx} cx={cx} cy={68} r={3.5} fill="var(--border)" />
          ))}
          <text x={60} y={72} className="viz-label" fontSize={10}>
            app.example/checkout
          </text>
          <rect x={28} y={96} width={200} height={14} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
          <rect x={28} y={120} width={200} height={14} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
          <rect x={28} y={144} width={120} height={10} rx={3} fill="var(--surface-2)" />
          {/* placeholder where the button will be */}
          {k === 0 && (
            <text x={btnX + 60} y={btnY + 22} textAnchor="middle" className="viz-label" fontSize={10}>
              (no button in the DOM)
            </text>
          )}
          <g style={{ transform: `translateX(${slide}px)`, transition: ease, opacity: k === 0 ? 0 : k === 1 ? 0.25 : 1 }}>
            <rect
              x={btnX}
              y={btnY}
              width={120}
              height={34}
              rx={7}
              fill={btnFill}
              stroke={k === 1 ? 'var(--muted)' : f.phase === 'ready' || hit ? 'none' : 'var(--border)'}
              strokeDasharray={k === 1 ? '4 3' : undefined}
              strokeWidth={1.5}
              style={{ transition: ease }}
            />
            <text x={btnX + 60} y={btnY + 22} textAnchor="middle" fontSize={13} fontWeight={700} style={{ fill: btnText, transition: ease }}>
              {hit ? 'Saved ✓' : 'Submit'}
            </text>
          </g>
          {/* spinner overlay */}
          <g style={{ opacity: f.phase === 'covered' ? 1 : 0, transition: ease }}>
            <rect x={11} y={79} width={238} height={146} fill="var(--surface-2)" opacity={0.85} />
            <circle cx={130} cy={150} r={16} fill="none" stroke="var(--border)" strokeWidth={4} />
            <path d="M130,134 A16,16 0 0 1 146,150" fill="none" stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
            <text x={130} y={118} textAnchor="middle" className="viz-label" fontSize={10}>
              div.spinner covers the form
            </text>
          </g>
          {/* pointer */}
          <g style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)`, transition: 'transform 0.6s ease' }}>
            {pressed && <circle r={14} fill={hit ? 'var(--good-soft)' : 'var(--bad-soft)'} stroke={hit ? 'var(--good)' : 'var(--bad)'} strokeWidth={2} />}
            <path d="M0,0 L0,16 L4,12 L7,19 L10,18 L7,11 L12,11 Z" fill="var(--text)" stroke="var(--surface)" strokeWidth={1} />
          </g>
        </g>

        {/* checks panel */}
        <text x={266} y={70} fontSize={12} fontWeight={700}>
          {panelTitle}
        </text>
        {CHECKS.map((name, i) => {
          const s = f.checks[i];
          const y = 92 + i * 26;
          return (
            <g key={name}>
              <rect x={262} y={y - 13} width={330} height={22} rx={6} fill={s === 'fail' ? 'var(--bad-soft)' : s === 'pass' ? 'var(--good-soft)' : 'var(--surface-2)'} style={{ transition: ease }} />
              <circle cx={276} cy={y - 2} r={7} fill={s === 'skip' ? 'none' : CHECK_COLOR[s]} stroke={CHECK_COLOR[s]} strokeWidth={1.5} strokeDasharray={s === 'skip' ? '2 2' : undefined} style={{ transition: ease }} />
              <text x={276} y={y + 2} textAnchor="middle" fontSize={9} fontWeight={700} style={{ fill: 'var(--surface)' }}>
                {s === 'pass' ? '✓' : s === 'fail' ? '✗' : ''}
              </text>
              <text x={290} y={y + 2} fontSize={12} style={{ fill: s === 'skip' ? 'var(--muted)' : 'var(--text)' }}>
                {i + 1}. {name}
              </text>
              <text x={584} y={y + 2} textAnchor="end" fontSize={10} style={{ fill: s === 'fail' ? 'var(--bad)' : 'var(--text-2)' }}>
                {s === 'skip' ? skipNote : s === 'fail' ? 'retry…' : s === 'pass' ? 'ok' : ''}
              </text>
            </g>
          );
        })}
        <text x={266} y={234} fontSize={12} fontWeight={700} style={{ fill: statusColor, transition: ease }}>
          t = {f.t} ms · {statusText}
        </text>

        {/* timeline */}
        {PHASES.map((p, i) => {
          const a = phaseStart(i, R);
          const b = i < PHASES.length - 1 ? phaseStart(i + 1, R) : maxT;
          const w = x(b) - x(a);
          return (
            <g key={p}>
              <rect x={x(a)} y={252} width={Math.max(0, w)} height={16} fill={BAND[p]} stroke="var(--surface)" />
              {w > 34 && (
                <text x={x(a) + w / 2} y={263} textAnchor="middle" fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
                  {BAND_LABEL[p]}
                </text>
              )}
            </g>
          );
        })}
        <line x1={x(T)} y1={246} x2={x(T)} y2={304} stroke="var(--bad)" strokeWidth={1.5} strokeDasharray="4 3" opacity={strategy === 'sleep' ? 0.25 : 1} />
        <text x={x(T)} y={244} textAnchor="middle" fontSize={9} style={{ fill: 'var(--bad)' }}>
          timeout {T}
        </text>
        {strategy === 'sleep' && (
          <>
            <rect x={x(0)} y={272} width={x(SLEEP_MS) - x(0)} height={6} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" />
            <text x={x(SLEEP_MS) + 4} y={279} fontSize={9} style={{ fill: 'var(--warn)' }}>
              sleep {SLEEP_MS} ms
            </text>
          </>
        )}
        {f.polls.map((p) => (
          <circle key={p} cx={x(p)} cy={286} r={3} fill="var(--accent)" className="viz-dot" />
        ))}
        <rect x={x(0)} y={294} width={x(f.endT ?? f.t) - x(0)} height={5} rx={2} fill={statusColor} style={{ transition: 'width 0.5s ease, fill 0.35s ease' }} />
        <line x1={x(0)} y1={304} x2={x(maxT)} y2={304} stroke="var(--border)" />
        {Array.from({ length: maxT / 1000 + 1 }, (_, s) => (
          <text key={s} x={x(s * 1000)} y={318} textAnchor="middle" fontSize={9} style={{ fill: 'var(--text-2)' }}>
            {s}s
          </text>
        ))}
        <g style={{ transform: `translateX(${x(f.t)}px)`, transition: 'transform 0.5s ease' }}>
          <line x1={0} y1={248} x2={0} y2={304} stroke="var(--text)" strokeWidth={2} />
          <path d="M-5,246 L5,246 L0,252 Z" fill="var(--text)" />
        </g>
      </svg>
    </VizFrame>
  );
}
