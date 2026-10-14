import { Fragment, useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { BUGS, DEFAULT_PARAMS, EDGES, NODES, simulate, type Actor, type BugKind, type Params, type Scenario, type Status } from './sim';

const PH = 28;
const pw = (s: Status) => Math.max(64, s.length * 6.4 + 16);
const MAIN: Status[] = ['New', 'Assigned', 'Open', 'Fixed', 'Retest', 'Verified', 'Closed'];
const BAD: Status[] = ['Rejected', 'Duplicate', 'Not a bug', 'Reopened', 'Cannot reproduce'];

const ACTOR: Record<Actor, { color: string; soft: string; label: string }> = {
  tester: { color: 'var(--accent)', soft: 'var(--accent-soft)', label: 'Tester' },
  lead: { color: 'var(--warn)', soft: 'var(--warn-soft)', label: 'Lead / triage' },
  developer: { color: 'var(--good)', soft: 'var(--good-soft)', label: 'Developer' },
  PO: { color: 'var(--muted)', soft: 'var(--surface-2)', label: 'Product owner' },
};

/** curved routes for edges that would otherwise cross nodes */
const CURVES: Partial<Record<string, string>> = {
  'Duplicate>Closed': 'M45,46 Q300,-10 548,136',
  'Rejected>Closed': 'M145,46 Q380,10 556,136',
  'Not a bug>Closed': 'M245,254 Q420,350 560,164',
  'Reopened>Assigned': 'M365,230 Q240,190 128,164',
};

/** straight edge clipped to both pills */
function straight(a: Status, b: Status): string {
  const p = NODES[a];
  const q = NODES[b];
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  const clip = (s: Status) => Math.min(dx ? pw(s) / 2 / Math.abs(dx) : Infinity, dy ? PH / 2 / Math.abs(dy) : Infinity);
  const t0 = clip(a) + 0.01;
  const t1 = 1 - clip(b) - 0.04;
  return `M${p.x + dx * t0},${p.y + dy * t0} L${p.x + dx * t1},${p.y + dy * t1}`;
}

export default function DefectLifecycleViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const bug = BUGS[params.bug];
  const last = f.history[f.history.length - 1] ?? '';
  const ticket = last.startsWith('BUG-298') ? 'BUG-298 (original)' : 'BUG-311';
  const walked = new Set(f.trail.slice(1).map((s, i) => `${f.trail[i]}>${s}`));
  const pos = NODES[f.status];
  const a = ACTOR[f.actor];

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
              { value: 'happy', label: 'happy path' },
              { value: 'reopen', label: 'fix fails retest' },
              { value: 'duplicate', label: 'duplicate' },
              { value: 'deferred', label: 'deferred' },
              { value: 'norepro', label: 'cannot reproduce' },
            ]}
            onChange={(scenario) => setParams((p) => ({ ...p, scenario }))}
          />
          <Choice<BugKind>
            label="Severity / priority"
            value={params.bug}
            options={[
              { value: 's1p1', label: 'S1 / P1' },
              { value: 's2p3', label: 'S2 / P3' },
              { value: 's4p2', label: 'S4 / P2' },
            ]}
            onChange={(b) => setParams((p) => ({ ...p, bug: b }))}
          />
        </>
      }
      legend={
        <>
          {(Object.keys(ACTOR) as Actor[]).map((k) => (
            <Fragment key={k}>
              <span className="viz-key" style={{ background: ACTOR[k].color }} /> {ACTOR[k].label}
            </Fragment>
          ))}
          <span className="viz-key" style={{ background: 'var(--bad-soft)', border: '1px solid var(--bad)' }} /> exit / rework branch
        </>
      }
    >
      <svg viewBox="0 0 600 372" className="viz-svg" role="img" aria-label={`${ticket} is ${f.status}; acting: ${a.label}; assignee ${f.assignee}.`}>
        <defs>
          <marker id="dl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
          </marker>
          <marker id="dl-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {EDGES.map(([s, t]) => {
          const k = `${s}>${t}`;
          const on = walked.has(k);
          return (
            <path
              key={k}
              d={CURVES[k] ?? straight(s, t)}
              className="viz-edge"
              markerEnd={on ? 'url(#dl-arrow-on)' : 'url(#dl-arrow)'}
              style={{ stroke: on ? 'var(--accent)' : undefined, strokeWidth: on ? 2.2 : undefined, strokeDasharray: on ? 'none' : undefined, transition: 'stroke 0.35s ease' }}
            />
          );
        })}
        {(Object.keys(NODES) as Status[]).map((s) => {
          const n = NODES[s];
          const w = pw(s);
          const cur = s === f.status;
          const seen = f.trail.includes(s);
          const branch = !MAIN.includes(s);
          const tone = BAD.includes(s) ? 'bad' : s === 'Deferred' ? 'warn' : s === 'Closed' || s === 'Verified' ? 'good' : 'accent';
          return (
            <g key={s}>
              <rect
                x={n.x - w / 2}
                y={n.y - PH / 2}
                width={w}
                height={PH}
                rx={PH / 2}
                fill={cur ? `var(--${tone}-soft)` : seen ? 'var(--surface-2)' : 'var(--surface-2)'}
                stroke={cur ? `var(--${tone})` : seen ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={cur ? 3 : seen ? 1.6 : 1}
                strokeDasharray={branch && !cur && !seen ? '4 3' : undefined}
                style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }}
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fontWeight={cur ? 700 : 500} style={{ fill: seen || cur ? 'var(--text)' : 'var(--text-2)' }}>
                {s}
              </text>
            </g>
          );
        })}
        {/* moving bug token */}
        <g style={{ transform: `translate(${pos.x}px, ${pos.y - PH / 2 - 12}px)`, transition: 'transform 0.6s cubic-bezier(.4,0,.2,1)' }}>
          <circle r={11} fill={a.soft} stroke={a.color} strokeWidth={2.5} style={{ transition: 'stroke 0.35s ease, fill 0.35s ease' }} />
          <text y={4} textAnchor="middle" fontSize={11}>
            🐞
          </text>
        </g>
        {/* ticket panel */}
        <rect x={4} y={290} width={592} height={78} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={14} y={308} fontSize={11.5} fontWeight={700}>
          {ticket}: {ticket.startsWith('BUG-298') ? 'same root cause' : bug.title}
        </text>
        <text x={14} y={325} fontSize={10.5} style={{ fill: 'var(--text-2)' }}>
          Severity {bug.severity} · Priority {bug.priority} · Status <tspan fontWeight={700} style={{ fill: 'var(--text)' }}>{f.status}</tspan>
        </text>
        <text x={14} y={342} fontSize={10.5} style={{ fill: 'var(--text-2)' }}>
          Assignee: {f.assignee}
          {f.attempt > 1 ? ` · fix attempt ${f.attempt}` : ''}
        </text>
        <rect x={14} y={349} width={a.label.length * 6.4 + 46} height={16} rx={8} fill={a.soft} stroke={a.color} style={{ transition: 'fill 0.35s ease' }} />
        <text x={22} y={361} fontSize={10} fontWeight={700} style={{ fill: a.color }}>
          acting: {a.label}
        </text>
        <text x={318} y={308} fontSize={10.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
          history
        </text>
        {f.history.slice(-3).map((h, k, arr) => (
          <text key={f.history.length - arr.length + k} x={318} y={325 + k * 15} fontSize={10} fontWeight={k === arr.length - 1 ? 700 : 400} style={{ fontFamily: 'var(--mono)', fill: k === arr.length - 1 ? 'var(--text)' : 'var(--text-2)' }}>
            {h.length > 44 ? h.slice(0, 43) + '…' : h}
          </text>
        ))}
      </svg>
    </VizFrame>
  );
}
