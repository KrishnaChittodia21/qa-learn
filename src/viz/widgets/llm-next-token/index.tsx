import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { CAPACITY, PROMPT, simulate, type Params, type Scenario, type Tone } from './sim';

const T = 'width 0.5s ease, x 0.5s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease, transform 0.5s ease';
const TONE: Record<Tone, { c: string; soft: string; mark: string }> = {
  good: { c: 'var(--good)', soft: 'var(--good-soft)', mark: '✓' },
  warn: { c: 'var(--warn)', soft: 'var(--warn-soft)', mark: '!' },
  bad: { c: 'var(--bad)', soft: 'var(--bad-soft)', mark: '✗' },
};
const BAR_X = 190;
const BAR_W = 250;
const CTX_X = 96;
const CTX_W = 496;

export default function LlmNextTokenViz() {
  const [params, setParams] = useState<Params>({ scenario: 'normal', temp: 0, seed: 1 });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const code = f.out.join('');

  // context window blocks: kept ones laid out left to right, dropped ones slide off to the left
  let cx = CTX_X;
  const blocks = f.ctx.map((b) => {
    const w = (b.tokens / CAPACITY) * CTX_W;
    const x = b.dropped ? CTX_X - 40 : cx;
    if (!b.dropped) cx += w;
    return { ...b, x, w };
  });
  const used = f.ctx.filter((b) => !b.dropped).reduce((a, b) => a + b.tokens, 0) + f.out.length * 6;
  const over = used > CAPACITY;

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
              { value: 'normal', label: 'well-known API' },
              { value: 'gap', label: 'knowledge gap' },
              { value: 'context', label: 'full context window' },
            ]}
            onChange={(scenario) => setParams((p) => ({ ...p, scenario }))}
          />
          <Slider label="Temperature" value={params.temp} min={0} max={1.5} step={0.1} format={(v) => v.toFixed(1)} onChange={(temp) => setParams((p) => ({ ...p, temp }))} />
          <div className="viz-choice">
            <span>Sampling seed: {params.seed}</span>
            <button type="button" className="chip" onClick={() => setParams((p) => ({ ...p, seed: p.seed + 1 }))}>
              🎲 Re-roll
            </button>
          </div>
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> chance of being picked at this temperature
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> illustrative base probability
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> fails a tester check
        </>
      }
    >
      <svg
        viewBox="0 0 600 344"
        className="viz-svg"
        role="img"
        aria-label={`Prompt: ${PROMPT}. Output so far: ${code || 'nothing'}. ${f.cands.length ? `Candidates for ${f.stepName}: ${f.cands.map((c) => `${c.label} ${Math.round(c.p * 100)}%`).join(', ')}${f.chosen >= 0 ? `; picked ${f.cands[f.chosen].label}` : ''}.` : ''} ${f.checks.length ? `Checks: ${f.checks.map((c) => c.text).join('; ')}.` : ''}`}
      >
        {/* prompt */}
        <rect x={4} y={4} width={592} height={28} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={12} y={22} fontSize={10.5}>
          <tspan fontWeight={700} style={{ fill: 'var(--accent)' }}>
            Prompt ▸{' '}
          </tspan>
          {PROMPT}
        </text>

        {/* context window */}
        <text x={8} y={50} fontSize={9} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
          context window
        </text>
        <text x={8} y={62} fontSize={8.5} style={{ fill: over ? 'var(--bad)' : 'var(--muted)', transition: T }}>
          {used} / {CAPACITY} tokens
        </text>
        <rect x={CTX_X} y={40} width={CTX_W} height={26} rx={4} fill="none" stroke="var(--border)" />
        {blocks.map((b) => (
          <g key={b.id} style={{ transform: `translate(${b.x}px, 40px)`, opacity: b.dropped ? 0 : 1, transition: T }}>
            <rect width={Math.max(2, b.w - 2)} height={26} rx={4} fill={b.rule ? 'var(--good-soft)' : b.id === 'p' ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={b.rule ? 'var(--good)' : b.id === 'p' ? 'var(--accent)' : 'var(--border)'} />
            {b.w > 50 && (
              <text x={5} y={17} fontSize={8.5} style={{ fill: 'var(--text)' }}>
                {b.label}
              </text>
            )}
          </g>
        ))}
        {f.ctx.some((b) => b.dropped) && (
          <text x={CTX_X} y={78} fontSize={8.5} style={{ fill: 'var(--bad)' }}>
            ◂ R1 "use getByTestId only" fell out of the window: the model can no longer see it
          </text>
        )}

        {/* output line */}
        <rect x={4} y={86} width={592} height={30} rx={6} fill="var(--surface)" stroke={f.phase === 'gen' ? 'var(--accent)' : 'var(--border)'} strokeWidth={1.5} style={{ transition: T }} />
        <text x={12} y={105} fontSize={code.length > 82 ? 8.6 : 9.8} style={{ fontFamily: 'var(--mono)' }}>
          {f.out.map((t, i) => (
            <tspan key={i} style={{ fill: i === f.out.length - 1 && f.phase === 'gen' ? 'var(--accent)' : 'var(--text)', fontWeight: i === f.out.length - 1 && f.phase === 'gen' ? 700 : 400 }}>
              {t}
            </tspan>
          ))}
          <tspan style={{ fill: 'var(--accent)' }}>{f.phase === 'gen' || f.phase === 'intro' || f.phase === 'context' ? '▍' : ''}</tspan>
        </text>

        {/* candidates */}
        <g style={{ opacity: f.cands.length ? 1 : 0, transition: T }}>
          <text x={8} y={136} fontSize={9.5} fontWeight={700}>
            Candidates for {f.stepName || '…'}
          </text>
          <text x={592} y={136} textAnchor="end" fontSize={8.5} fontWeight={700} style={{ fill: 'var(--warn)' }}>
            ILLUSTRATIVE numbers, not from a real model
          </text>
          {f.cands.map((c, i) => {
            const y = 144 + i * 24;
            const on = i === f.chosen;
            return (
              <g key={`${f.step}-${i}`}>
                <rect x={4} y={y} width={592} height={20} rx={4} fill={on ? 'var(--accent-soft)' : 'none'} stroke={on ? 'var(--accent)' : 'none'} style={{ transition: T }} />
                <text x={12} y={y + 14} fontSize={9.5} style={{ fontFamily: 'var(--mono)', fill: on ? 'var(--text)' : 'var(--text-2)' }}>
                  {c.label.length > 26 ? `${c.label.slice(0, 25)}…` : c.label}
                </text>
                <rect x={BAR_X} y={y + 4} width={BAR_W} height={12} rx={3} fill="var(--surface-2)" />
                <rect x={BAR_X} y={y + 4} width={BAR_W * c.q} height={12} rx={3} fill="var(--accent)" style={{ transition: T }} />
                <line x1={BAR_X + BAR_W * c.p} x2={BAR_X + BAR_W * c.p} y1={y + 1} y2={y + 19} stroke="var(--muted)" strokeWidth={2} />
                <text x={BAR_X + BAR_W + 8} y={y + 14} fontSize={9} style={{ fill: 'var(--text-2)' }}>
                  base {Math.round(c.p * 100)}% → {Math.round(c.q * 100)}%{on ? '  ◂ picked' : ''}
                </text>
              </g>
            );
          })}
          <text x={8} y={252} fontSize={8.5} style={{ fill: 'var(--muted)' }}>
            The rest of the probability is spread over thousands of other tokens; here only the shown ones are sampled.
          </text>
        </g>

        <text x={300} y={190} textAnchor="middle" fontSize={10} style={{ fill: 'var(--muted)', opacity: f.phase === 'intro' || f.phase === 'context' ? 1 : 0, transition: T }}>
          {f.phase === 'context' ? 'Filling the context window… generation starts when the prompt arrives.' : 'Step forward to see the first set of candidate tokens.'}
        </text>

        {/* tester checks */}
        <g style={{ opacity: f.phase === 'verify' || f.phase === 'done' ? 1 : 0, transition: T }}>
          <text x={8} y={136} fontSize={9.5} fontWeight={700}>
            Tester verifies against playwright.dev and the app
          </text>
          {f.checks.map((ck, i) => (
            <g key={i}>
              <rect x={4} y={144 + i * 26} width={592} height={22} rx={4} fill={TONE[ck.tone].soft} stroke={TONE[ck.tone].c} />
              <text x={12} y={159 + i * 26} fontSize={10} fontWeight={700} style={{ fill: TONE[ck.tone].c }}>
                {TONE[ck.tone].mark}
              </text>
              <text x={28} y={159 + i * 26} fontSize={9.5}>
                {ck.text}
              </text>
            </g>
          ))}
        </g>

        {/* status */}
        <text x={8} y={334} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          temperature {params.temp.toFixed(1)} · {params.temp === 0 ? 'greedy: identical output for every seed' : `sampling with seed ${params.seed}: re-roll for a different answer`}
        </text>
      </svg>
    </VizFrame>
  );
}
