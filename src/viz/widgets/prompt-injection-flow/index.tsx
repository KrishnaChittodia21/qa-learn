import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { simulate, type Defences, type Frame, type Node, type Params, type Scenario, type TextLine, type Tone } from './sim';

const T = 'transform 0.6s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease';
const C: Record<Tone, string> = { muted: 'var(--muted)', accent: 'var(--accent)', good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' };
const SOFT: Record<Tone, string> = { muted: 'var(--surface-2)', accent: 'var(--accent-soft)', good: 'var(--good-soft)', warn: 'var(--warn-soft)', bad: 'var(--bad-soft)' };
const NODES: { id: Node; label: string; sub: string }[] = [
  { id: 'user', label: 'Alice', sub: 'user u-17' },
  { id: 'app', label: 'App', sub: 'builds the prompt' },
  { id: 'model', label: 'LLM', sub: 'predicts a reply' },
  { id: 'filter', label: 'Output check', sub: 'scans the draft' },
  { id: 'reply', label: 'Reply', sub: 'shown to Alice' },
];
const NX = (i: number) => 6 + i * 118;
const NW = 104;
const LH = 10;
const FILTER: Record<Frame['filter'], { text: string; c: string }> = {
  idle: { text: '', c: 'var(--muted)' },
  none: { text: 'none configured', c: 'var(--bad)' },
  scan: { text: 'scanning…', c: 'var(--accent)' },
  pass: { text: 'pass ✓', c: 'var(--good)' },
  blocked: { text: 'BLOCKED', c: 'var(--warn)' },
};

function Lines({ lines, x, y, size = 8.4 }: { lines: TextLine[]; x: number; y: number; size?: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={y + i * LH} fontSize={size} style={{ fill: l.leak ? 'var(--bad)' : 'var(--text)', fontWeight: l.leak ? 700 : 400 }}>
          {l.t}
        </text>
      ))}
    </>
  );
}

export default function PromptInjectionFlowViz() {
  const [params, setParams] = useState<Params>({ scenario: 'direct', defences: 'off' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const on = params.defences === 'on';
  const tokIdx = f.token ? NODES.findIndex((n) => n.id === f.token!.at) : 0;
  const replyLeak = f.reply.some((l) => l.leak);
  let by = 88;
  const blocks = f.blocks.map((b) => {
    const y = by;
    const h = 16 + b.lines.length * LH;
    by += h + 4;
    return { ...b, y, h };
  });

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Scenario>
            label="Alice sends"
            value={params.scenario}
            options={[
              { value: 'normal', label: 'normal question' },
              { value: 'direct', label: 'direct injection' },
              { value: 'indirect', label: 'poisoned review (indirect)' },
              { value: 'extract', label: 'extract system prompt' },
            ]}
            onChange={(scenario) => setParams((p) => ({ ...p, scenario }))}
          />
          <Choice<Defences>
            label="Defences"
            value={params.defences}
            options={[
              { value: 'off', label: 'off' },
              { value: 'on', label: 'on' },
            ]}
            onChange={(defences) => setParams((p) => ({ ...p, defences }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> developer instructions
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> injected text / leaked data
          <span className="viz-key" style={{ background: 'var(--good)' }} /> defence in place
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> over-shared data
        </>
      }
    >
      <svg
        viewBox="0 0 600 360"
        className="viz-svg"
        role="img"
        aria-label={`Scenario ${params.scenario}, defences ${params.defences}. ${f.token ? `Message at ${f.token.at}.` : ''} Prompt holds: ${f.blocks.map((b) => b.title).join('; ') || 'nothing yet'}. Output check: ${FILTER[f.filter].text || 'not reached'}. Reply: ${f.reply.map((l) => l.t).join(' ') || 'none yet'}${replyLeak ? ' (contains leaked data)' : ''}.${f.tester ? ` Tester check ${f.tester.pass ? 'passes' : 'fails'}: ${f.tester.text}.` : ''}`}
      >
        {/* pipeline */}
        {NODES.map((n, i) => {
          const act = f.active === n.id;
          const isF = n.id === 'filter';
          return (
            <g key={n.id}>
              {i > 0 && <line x1={NX(i) - 14} y1={26} x2={NX(i) - 2} y2={26} className="viz-edge" />}
              <rect x={NX(i)} y={6} width={NW} height={40} rx={7} fill={act ? 'var(--accent-soft)' : 'var(--surface)'} stroke={act ? 'var(--accent)' : isF && on ? 'var(--good)' : 'var(--border)'} strokeWidth={1.5} strokeDasharray={isF && !on ? '5 4' : undefined} style={{ transition: T }} />
              <text x={NX(i) + NW / 2} y={22} textAnchor="middle" fontSize={10.5} fontWeight={700}>
                {n.label}
              </text>
              <text x={NX(i) + NW / 2} y={36} textAnchor="middle" fontSize={8.5} style={{ fill: isF && f.filter !== 'idle' ? FILTER[f.filter].c : 'var(--text-2)' }}>
                {isF && f.filter !== 'idle' ? FILTER[f.filter].text : isF && !on ? 'none' : n.sub}
              </text>
            </g>
          );
        })}
        <g style={{ transform: `translate(${NX(tokIdx) + NW / 2}px, 60px)`, opacity: f.token ? 1 : 0, transition: T }}>
          <rect x={-44} y={-8} width={88} height={16} rx={8} fill={f.token ? C[f.token.tone] : 'var(--accent)'} style={{ transition: T }} />
          <text y={4} textAnchor="middle" fontSize={8.5} fontWeight={700} style={{ fill: 'var(--surface)' }}>
            {f.token?.label ?? ''}
          </text>
        </g>

        {/* prompt panel */}
        <rect x={6} y={72} width={352} height={224} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={14} y={84} fontSize={9.5} fontWeight={700}>
          The prompt the model receives (one stream of text)
        </text>
        {blocks.map((b) => (
          <g key={b.id} style={{ transform: `translate(10px, ${b.y}px)`, transition: T }}>
            <rect width={344} height={b.h} rx={4} fill={SOFT[b.tone]} stroke={C[b.tone]} strokeDasharray={b.fenced ? '4 2' : undefined} style={{ transition: T }} />
            <text x={6} y={11} fontSize={8.5} fontWeight={700} style={{ fill: C[b.tone] }}>
              {b.fenced ? `<${b.id === 'doc' ? 'doc' : b.id === 'user' ? 'user' : 'data'}> ` : ''}
              {b.title}
            </text>
            <Lines lines={b.lines} x={6} y={23} />
          </g>
        ))}

        {/* model draft + reply */}
        <rect x={366} y={72} width={228} height={104} rx={6} fill="var(--surface)" stroke={f.active === 'model' ? 'var(--accent)' : 'var(--border)'} style={{ transition: T }} />
        <text x={374} y={86} fontSize={9.5} fontWeight={700}>
          Model draft
        </text>
        <Lines lines={f.draft} x={374} y={100} />
        <rect x={366} y={184} width={228} height={112} rx={6} fill={replyLeak ? 'var(--bad-soft)' : f.reply.length ? 'var(--good-soft)' : 'var(--surface)'} stroke={replyLeak ? 'var(--bad)' : f.reply.length ? 'var(--good)' : 'var(--border)'} style={{ transition: T }} />
        <text x={374} y={198} fontSize={9.5} fontWeight={700} style={{ fill: replyLeak ? 'var(--bad)' : 'var(--text)' }}>
          {replyLeak ? 'Reply Alice sees: DATA LEAK' : 'Reply Alice sees'}
        </text>
        <Lines lines={f.reply} x={374} y={212} />
        {f.filter === 'blocked' && (
          <text x={374} y={286} fontSize={8.5} style={{ fill: 'var(--warn)' }}>
            draft replaced by the output filter
          </text>
        )}

        {/* defences + tester */}
        <text x={8} y={314} fontSize={9} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
          Defences:
        </text>
        {['least-privilege data', 'untrusted text tagged as data', 'output filter'].map((d, i) => (
          <g key={d}>
            <rect x={66 + i * 146} y={304} width={140} height={15} rx={7.5} fill={on ? 'var(--good-soft)' : 'var(--surface-2)'} stroke={on ? 'var(--good)' : 'var(--border)'} style={{ transition: T }} />
            <text x={136 + i * 146} y={315} textAnchor="middle" fontSize={8.5} style={{ fill: on ? 'var(--good)' : 'var(--muted)' }}>
              {on ? '✓' : '✗'} {d}
            </text>
          </g>
        ))}
        <rect x={6} y={326} width={588} height={28} rx={6} fill={f.tester ? (f.tester.pass ? 'var(--good-soft)' : 'var(--bad-soft)') : 'none'} stroke={f.tester ? (f.tester.pass ? 'var(--good)' : 'var(--bad)') : 'var(--border)'} strokeDasharray={f.tester ? undefined : '4 3'} style={{ transition: T }} />
        <text x={14} y={344} fontSize={9.5} style={{ fill: f.tester ? 'var(--text)' : 'var(--muted)' }}>
          {f.tester ? (
            <>
              <tspan fontWeight={700} style={{ fill: f.tester.pass ? 'var(--good)' : 'var(--bad)' }}>
                Tester check {f.tester.pass ? 'PASS' : 'FAIL'}:{' '}
              </tspan>
              {f.tester.text}
            </>
          ) : (
            'Tester check: runs once the reply arrives'
          )}
        </text>
      </svg>
    </VizFrame>
  );
}
