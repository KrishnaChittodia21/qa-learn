import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { SCENARIO_LABEL, simulate, type HttpFrame, type Lane, type Params, type ScenarioId } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const LANE_X: Record<Lane, number> = { client: 90, server: 300, db: 510 };
const LANES: { id: Lane; label: string }[] = [
  { id: 'client', label: 'Client (Postman)' },
  { id: 'server', label: 'API server' },
  { id: 'db', label: 'Datastore' },
];
const PW = 156;
const WRAP = 66;

function statusTone(s?: number) {
  if (s === undefined) return { fill: 'var(--accent-soft)', stroke: 'var(--accent)' };
  if (s < 300) return { fill: 'var(--good-soft)', stroke: 'var(--good)' };
  if (s < 500) return { fill: 'var(--warn-soft)', stroke: 'var(--warn)' };
  return { fill: 'var(--bad-soft)', stroke: 'var(--bad)' };
}

/** wrap long request/response lines at commas or spaces */
function wrap(lines: string[]): string[] {
  const out: string[] = [];
  for (const l of lines) {
    let rest = l;
    while (rest.length > WRAP) {
      const cut = Math.max(rest.lastIndexOf(',', WRAP), rest.lastIndexOf(' ', WRAP));
      const at = cut > 10 ? cut + 1 : WRAP;
      out.push(rest.slice(0, at));
      rest = '  ' + rest.slice(at).trimStart();
    }
    out.push(rest);
  }
  return out;
}

function HttpView({ f }: { f: HttpFrame }) {
  const tone = statusTone(f.dir === 'res' ? f.status : undefined);
  const px = LANE_X[f.packet] - PW / 2;
  const card = f.card ? wrap(f.card.lines).slice(0, 14) : [];
  const label = `${f.dir === 'none' ? 'Idle' : f.dir === 'req' ? `Request ${f.tag} at the ${f.packet}` : `Response ${f.tag} back at the client`}. Saved variables: token ${f.vars.token ?? 'unset'}, bookingid ${
    f.vars.bookingid ?? 'unset'
  }. Completed: ${f.history.map((h) => `${h.label} ${h.status}`).join(', ') || 'none'}.`;

  return (
    <svg viewBox="0 0 600 330" className="viz-svg" role="img" aria-label={label}>
      <defs>
        <marker id="hrf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
        </marker>
      </defs>
      {/* lanes */}
      {LANES.map((l) => {
        const on = f.dir !== 'none' && f.packet === l.id;
        return (
          <g key={l.id}>
            <rect x={LANE_X[l.id] - 66} y={6} width={132} height={24} rx={12} fill={on ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={on ? 'var(--accent)' : 'var(--border)'} style={{ transition: 'fill 0.35s, stroke 0.35s' }} />
            <text x={LANE_X[l.id]} y={22} textAnchor="middle" fontSize={11} fontWeight={700}>
              {l.label}
            </text>
            <line x1={LANE_X[l.id]} x2={LANE_X[l.id]} y1={30} y2={118} className="viz-edge" />
          </g>
        );
      })}
      <path d="M100,104 L290,104" className="viz-edge" markerEnd="url(#hrf-arrow)" />
      <path d="M310,104 L500,104" className="viz-edge" markerEnd="url(#hrf-arrow)" />
      <text x={195} y={116} textAnchor="middle" fontSize={9} className="viz-label">
        HTTP over TCP/TLS
      </text>
      <text x={405} y={116} textAnchor="middle" fontSize={9} className="viz-label">
        query
      </text>

      {/* the travelling message */}
      <g style={{ transform: `translate(${px}px, 50px)`, transition: 'transform 0.6s ease, opacity 0.35s ease', opacity: f.dir === 'none' ? 0 : 1 }}>
        <rect width={PW} height={32} rx={8} fill={tone.fill} stroke={tone.stroke} strokeWidth={2} style={{ transition: 'fill 0.35s, stroke 0.35s' }} />
        <text x={PW / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={700} style={mono}>
          {f.dir === 'res' ? '← ' : ''}
          {f.tag}
          {f.dir === 'req' ? ' →' : ''}
        </text>
      </g>

      {/* request / response card */}
      <rect x={6} y={132} width={388} height={192} rx={8} fill="var(--surface-2)" stroke={f.card ? (f.card.kind === 'response' ? statusTone(f.status).stroke : 'var(--accent)') : 'var(--border)'} strokeWidth={1.5} style={{ transition: 'stroke 0.35s' }} />
      <text x={14} y={148} fontSize={10} fontWeight={700}>
        {f.card ? (f.card.kind === 'request' ? 'Request' : f.card.lines[0].startsWith('//') ? 'Post-response script' : 'Response') : 'Pick a scenario and press ▶'}
      </text>
      {card.map((l, i) => (
        <text
          key={i}
          x={14}
          y={164 + i * 12}
          fontSize={9}
          fontWeight={i === 0 ? 700 : 400}
          style={{ ...mono, whiteSpace: 'pre', fill: i === 0 && f.card?.kind === 'response' && !l.startsWith('//') ? statusTone(f.status).stroke : undefined }}
        >
          {l}
        </text>
      ))}

      {/* environment variables */}
      <rect x={402} y={132} width={192} height={70} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={410} y={148} fontSize={10} fontWeight={700}>
        Environment variables
      </text>
      {(['token', 'bookingid'] as const).map((k, i) => {
        const fresh = f.fresh === k;
        return (
          <g key={k}>
            <rect x={408} y={156 + i * 21} width={180} height={18} rx={4} fill={fresh ? 'var(--good-soft)' : 'transparent'} stroke={fresh ? 'var(--good)' : 'var(--border)'} style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
            <text x={414} y={169 + i * 21} fontSize={9.5} style={mono}>
              {`{{${k}}}`}
            </text>
            <text x={582} y={169 + i * 21} textAnchor="end" fontSize={9.5} fontWeight={700} className={f.vars[k] ? undefined : 'viz-label'} style={mono}>
              {f.vars[k] ?? 'unset'}
            </text>
          </g>
        );
      })}

      {/* run history */}
      <rect x={402} y={210} width={192} height={114} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={410} y={226} fontSize={10} fontWeight={700}>
        Run history
      </text>
      {f.history.map((h, i) => {
        const t = statusTone(h.status);
        return (
          <g key={i}>
            <text x={410} y={244 + i * 15} fontSize={9} style={mono}>
              {h.label}
            </text>
            <rect x={552} y={234 + i * 15} width={36} height={13} rx={6} fill={t.fill} stroke={t.stroke} />
            <text x={570} y={244 + i * 15} textAnchor="middle" fontSize={9} fontWeight={700} style={mono}>
              {h.status}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function HttpRequestFlowViz() {
  const [params, setParams] = useState<Params>({ scenario: 'chain', auth: true });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const set = <K extends keyof Params>(k: K) => (v: Params[K]) => setParams((p) => ({ ...p, [k]: v }));
  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<ScenarioId>
            label="Scenario"
            value={params.scenario}
            options={(Object.keys(SCENARIO_LABEL) as ScenarioId[]).map((k) => ({ value: k, label: SCENARIO_LABEL[k] }))}
            onChange={set('scenario')}
          />
          <Choice<'on' | 'off'>
            label="Auth header on PUT/DELETE"
            value={params.auth ? 'on' : 'off'}
            options={[
              { value: 'on', label: 'send token cookie' },
              { value: 'off', label: 'no token' },
            ]}
            onChange={(v) => set('auth')(v === 'on')}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> request
          <span className="viz-key" style={{ background: 'var(--good)' }} /> 2xx success
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> 4xx client error
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> 5xx server error
        </>
      }
    >
      <HttpView f={stepper.frame} />
    </VizFrame>
  );
}
