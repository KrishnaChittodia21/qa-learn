import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { SNIPPETS, simulate, type LoopFrame, type Params, type Phase, type SnippetId, type Tok } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const LH = 16;
const TW = 90;
const TH = 22;

type Place = 'stack' | 'web' | 'micro' | 'macro';
const PANEL: Record<Place, { x: number; y: number; w: number; h: number; title: string }> = {
  stack: { x: 298, y: 8, w: 100, h: 156, title: 'Call stack' },
  web: { x: 404, y: 8, w: 192, h: 48, title: 'Web APIs (timers)' },
  micro: { x: 404, y: 62, w: 192, h: 48, title: 'Microtask queue' },
  macro: { x: 404, y: 116, w: 192, h: 48, title: 'Task (macrotask) queue' },
};

function pos(place: Place, i: number) {
  const p = PANEL[place];
  if (place === 'stack') return { x: p.x + (p.w - TW) / 2, y: p.y + p.h - 8 - (i + 1) * (TH + 6) };
  return { x: p.x + 6 + i * (TW + 4), y: p.y + 20 };
}

/** colour by origin so a callback can be traced from queue to stack */
function tone(t: Tok) {
  const c = t.id[0];
  if (c === 't') return { fill: 'var(--warn-soft)', stroke: 'var(--warn)' };
  if (c === 'm') return { fill: 'var(--good-soft)', stroke: 'var(--good)' };
  return { fill: 'var(--accent-soft)', stroke: 'var(--accent)' };
}

const PHASE: Record<Phase, string> = {
  script: 'running: script task',
  micro: 'running: microtasks',
  task: 'running: one task',
  idle: 'loop: checking queues',
  done: 'loop: idle',
};

function Tokens({ f }: { f: LoopFrame }) {
  const all: { t: Tok; place: Place; i: number }[] = [];
  (['stack', 'web', 'micro', 'macro'] as Place[]).forEach((pl) => f[pl].forEach((t, i) => all.push({ t, place: pl, i })));
  all.sort((a, b) => (a.t.id < b.t.id ? -1 : 1)); // stable DOM order so React moves, not remounts
  return (
    <g>
      {all.map(({ t, place, i }) => {
        const p = pos(place, i);
        const c = tone(t);
        const top = place === 'stack' && i === f.stack.length - 1;
        return (
          <g key={t.id} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: 'transform 0.45s ease' }}>
            <rect width={TW} height={TH} rx={5} fill={c.fill} stroke={c.stroke} strokeWidth={top ? 2.5 : 1.2} style={{ transition: 'stroke-width 0.3s' }} />
            <text x={TW / 2} y={15} textAnchor="middle" fontSize={9} style={mono}>
              {t.label.length > 16 ? t.label.slice(0, 15) + '…' : t.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function LoopView({ f, code }: { f: LoopFrame; code: string[] }) {
  const label = `Event loop, ${PHASE[f.phase]}. Stack: ${f.stack.map((t) => t.label).join(', ') || 'empty'}. Microtasks: ${
    f.micro.map((t) => t.label).join(', ') || 'none'
  }. Tasks: ${f.macro.map((t) => t.label).join(', ') || 'none'}. Console: ${f.out.join(' ') || 'nothing yet'}.`;
  const codeH = code.length * LH + 12;
  return (
    <svg viewBox="0 0 600 252" className="viz-svg" role="img" aria-label={label}>
      {/* code listing */}
      <rect x={2} y={8} width={290} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <rect
        x={4}
        y={0}
        width={286}
        height={LH}
        rx={3}
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        style={{ transform: `translateY(${14 + Math.max(0, f.line) * LH}px)`, transition: 'transform 0.35s ease, opacity 0.3s', opacity: f.line >= 0 ? 1 : 0 }}
      />
      {code.map((l, i) => (
        <g key={i}>
          <text x={8} y={26 + i * LH} fontSize={8} className="viz-label" style={mono}>
            {i + 1}
          </text>
          <text x={26} y={26 + i * LH} fontSize={8.6} fontWeight={i === f.line ? 700 : 400} style={{ ...mono, whiteSpace: 'pre' }}>
            {l}
          </text>
        </g>
      ))}

      {/* panels */}
      {(Object.keys(PANEL) as Place[]).map((k) => {
        const p = PANEL[k];
        const busy = f[k].length > 0;
        return (
          <g key={k}>
            <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={6} fill="var(--surface-2)" stroke={busy ? 'var(--text-2)' : 'var(--border)'} style={{ transition: 'stroke 0.3s' }} />
            <text x={p.x + 6} y={p.y + 13} fontSize={9.5} fontWeight={700}>
              {p.title}
            </text>
          </g>
        );
      })}
      <text x={348} y={PANEL.stack.y + PANEL.stack.h - 10} textAnchor="middle" fontSize={9} className="viz-label">
        {f.stack.length ? '' : '(empty)'}
      </text>

      {/* loop arrows: web → tasks, queues → stack */}
      <path d="M596,32 Q614,86 596,140" className="viz-edge" />
      <path d="M404,86 L398,96" className="viz-edge" />
      <path d="M404,140 L398,130" className="viz-edge" />

      <Tokens f={f} />

      {/* phase pill */}
      <rect
        x={298}
        y={172}
        width={298}
        height={20}
        rx={10}
        fill={f.phase === 'micro' ? 'var(--good-soft)' : f.phase === 'task' ? 'var(--warn-soft)' : f.phase === 'script' ? 'var(--accent-soft)' : 'var(--surface-2)'}
        stroke="var(--border)"
        style={{ transition: 'fill 0.35s ease' }}
      />
      <text x={447} y={186} textAnchor="middle" fontSize={10} fontWeight={700}>
        ⟳ {PHASE[f.phase]}
      </text>

      {/* console */}
      <rect x={298} y={200} width={298} height={44} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={304} y={213} fontSize={9.5} fontWeight={700}>
        Console
      </text>
      {f.out.map((o, i) => {
        const fresh = i === f.out.length - 1 && f.fresh === o;
        return (
          <g key={i} style={{ transform: `translate(${304 + i * 48}px, 219px)` }}>
            <rect width={44} height={19} rx={4} fill={fresh ? 'var(--accent)' : 'var(--accent-soft)'} stroke="var(--accent)" style={{ transition: 'fill 0.4s ease' }} />
            <text x={22} y={13} textAnchor="middle" fontSize={9.5} fontWeight={700} style={{ ...mono, fill: fresh ? 'var(--accent-text)' : undefined }}>
              {o}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function JsEventLoopViz() {
  const [params, setParams] = useState<Params>({ snippet: 'classic' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const sn = SNIPPETS[params.snippet];

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <Choice<SnippetId>
          label="Snippet"
          value={params.snippet}
          options={(Object.keys(SNIPPETS) as SnippetId[]).map((k) => ({ value: k, label: SNIPPETS[k].label }))}
          onChange={(snippet) => setParams({ snippet })}
        />
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> script / function frame
          <span className="viz-key" style={{ background: 'var(--good)' }} /> microtask (promise callback, await resume)
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> timer callback (task)
          <span>Order: script → all microtasks → one task → all microtasks → …</span>
        </>
      }
    >
      <LoopView f={stepper.frame} code={sn.code} />
    </VizFrame>
  );
}
