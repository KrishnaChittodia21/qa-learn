import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { HANDLER_CODE, PATTERN, URLS, codeLines, simulate, type At, type Handler, type Params, type Timing, type Ui, type UrlChoice } from './sim';

const ease = 'transform 0.6s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease';
const TONE = { accent: 'var(--accent)', good: 'var(--good)', bad: 'var(--bad)', warn: 'var(--warn)', muted: 'var(--muted)' };
const COL: Record<At, number> = { page: 93, route: 299, server: 506 };
const ITEMS: Record<Ui, { text: string; tone: string }[]> = {
  blank: [{ text: '(blank page)', tone: 'var(--muted)' }],
  loading: [{ text: 'Loading products…', tone: 'var(--muted)' }],
  mock: [{ text: 'Mock shoe · $1', tone: 'var(--good)' }],
  error: [{ text: '⚠ Could not load products', tone: 'var(--bad)' }],
  real: [
    { text: 'Runner · $80', tone: 'var(--text)' },
    { text: 'Trail · $95', tone: 'var(--text)' },
    { text: 'Court · $70', tone: 'var(--text)' },
  ],
  patched: [
    { text: 'Runner · FREE', tone: 'var(--warn)' },
    { text: 'Trail · $95', tone: 'var(--text)' },
    { text: 'Court · $70', tone: 'var(--text)' },
  ],
};

export default function PwRouteMockViz() {
  const [params, setParams] = useState<Params>({ handler: 'fulfill', url: 'match', timing: 'before' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const code = [`const handler = ${HANDLER_CODE[params.handler][0]}`, ...HANDLER_CODE[params.handler].slice(1), ...codeLines(params)];
  const offset = HANDLER_CODE[params.handler].length;
  const codeH = code.length * 15 + 10;
  const top = codeH + 14;
  const tok = f.token;
  const tokY = tok?.kind === 'res' ? top + 92 : top + 62;
  const statusColor = f.status === 'pass' ? 'var(--good)' : f.status === 'fail' ? 'var(--bad)' : 'var(--text-2)';
  const matchColor = f.match === 'match' ? 'var(--good)' : f.match === 'nomatch' ? 'var(--warn)' : 'var(--muted)';

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Handler>
            label="Handler"
            value={params.handler}
            options={[
              { value: 'fulfill', label: 'fulfill (mock)' },
              { value: 'abort', label: 'abort' },
              { value: 'continue', label: 'continue + header' },
              { value: 'fetch', label: 'fetch + patch' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, handler: v }))}
          />
          <Choice<UrlChoice>
            label="App requests"
            value={params.url}
            options={[
              { value: 'match', label: '/api/products?cat=shoes' },
              { value: 'nomatch', label: '/api/v2/products?cat=shoes' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, url: v }))}
          />
          <Choice<Timing>
            label="page.route registered"
            value={params.timing}
            options={[
              { value: 'before', label: 'before goto' },
              { value: 'after', label: 'after goto' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, timing: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> request
          <span className="viz-key" style={{ background: 'var(--good)' }} /> response
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> modified by the handler
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> aborted
        </>
      }
    >
      <svg
        viewBox={`0 0 600 ${top + 190}`}
        className="viz-svg"
        role="img"
        aria-label={`Page shows ${f.ui}; route ${f.routeOn ? 'registered' : 'not registered'}; last URL check: ${f.match}; handler ${f.handlerRan ? 'ran' : 'did not run'}; real server API hits: ${f.serverHits}; test ${f.status}.`}
      >
        {/* code */}
        <rect x={4} y={4} width={592} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        {code.map((l, i) => {
          const active = i - offset === f.line && f.line >= 0;
          return (
            <g key={i}>
              <rect x={6} y={8 + i * 15} width={588} height={14} rx={3} fill={active ? 'var(--accent-soft)' : 'none'} style={{ transition: ease }} />
              <text x={12} y={18 + i * 15} fontSize={l.length > 92 ? 8.6 : 9.6} style={{ fontFamily: 'var(--mono)', fill: active ? 'var(--text)' : 'var(--text-2)' }}>
                {l.replace(/^ +/, (m) => '\u00a0'.repeat(m.length))}
              </text>
            </g>
          );
        })}

        {/* lanes */}
        <line x1={178} y1={top + 62} x2={420} y2={top + 62} className="viz-edge" />
        <line x1={178} y1={top + 92} x2={420} y2={top + 92} className="viz-edge" strokeDasharray="4 3" />
        {/* page */}
        <rect x={8} y={top} width={170} height={140} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
        <rect x={8} y={top} width={170} height={18} rx={8} fill="var(--surface-2)" />
        <text x={16} y={top + 13} fontSize={9} style={{ fill: 'var(--text-2)' }}>
          page · shop.test/shop
        </text>
        {ITEMS[f.ui].map((it, i) => (
          <g key={`${f.ui}${i}`}>
            <rect x={16} y={top + 28 + i * 26} width={154} height={22} rx={4} fill={f.ui === 'error' ? 'var(--bad-soft)' : f.ui === 'mock' ? 'var(--good-soft)' : 'var(--surface-2)'} style={{ transition: ease }} />
            <text x={24} y={top + 43 + i * 26} fontSize={10} style={{ fill: it.tone }}>
              {it.text}
            </text>
          </g>
        ))}

        {/* route layer */}
        <rect x={214} y={top} width={170} height={140} rx={8} fill={f.routeOn ? 'var(--accent-soft)' : 'none'} stroke={f.routeOn ? 'var(--accent)' : 'var(--border)'} strokeDasharray={f.routeOn ? undefined : '5 4'} strokeWidth={1.5} style={{ transition: ease }} />
        <text x={299} y={top + 16} textAnchor="middle" fontSize={10} fontWeight={700}>
          route layer
        </text>
        <text x={299} y={top + 32} textAnchor="middle" fontSize={9} style={{ fontFamily: 'var(--mono)', fill: f.routeOn ? 'var(--text)' : 'var(--muted)' }}>
          {f.routeOn ? PATTERN : 'no routes yet'}
        </text>
        <text x={299} y={top + 126} textAnchor="middle" fontSize={9} style={{ fill: f.handlerRan ? 'var(--accent)' : 'var(--muted)' }}>
          {f.handlerRan ? `handler ran: ${params.handler}` : 'handler idle'}
        </text>

        {/* server */}
        <rect x={420} y={top} width={172} height={140} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
        <text x={506} y={top + 16} textAnchor="middle" fontSize={10} fontWeight={700}>
          real server
        </text>
        <text x={506} y={top + 32} textAnchor="middle" fontSize={9.5} style={{ fill: f.serverHits ? 'var(--text)' : 'var(--muted)' }}>
          API hits: {f.serverHits}
        </text>
        <text x={506} y={top + 126} textAnchor="middle" fontSize={9} style={{ fill: 'var(--warn)', opacity: f.header ? 1 : 0, transition: ease }}>
          received x-test: 1
        </text>

        {/* moving token */}
        <g style={{ transform: `translate(${tok ? COL[tok.at] : COL.page}px, ${tokY}px)`, opacity: tok ? 1 : 0, transition: ease }}>
          <rect x={-46} y={-10} width={92} height={20} rx={10} fill={tok ? TONE[tok.tone] : 'var(--accent)'} />
          <text y={4} textAnchor="middle" fontSize={8.5} fontWeight={700} style={{ fill: 'var(--surface)' }}>
            {tok?.label ?? ''}
          </text>
        </g>

        {/* url check + status */}
        <text x={8} y={top + 162} fontSize={9.5} style={{ fontFamily: 'var(--mono)' }}>
          URL {URLS[params.url]}
        </text>
        <text x={8} y={top + 178} fontSize={9.5} style={{ fontFamily: 'var(--mono)', fill: matchColor, transition: ease }}>
          glob {PATTERN} → {f.match === 'match' ? 'MATCH' : f.match === 'nomatch' ? 'no match' : f.match === 'unrouted' ? 'no route registered' : '…'}
        </text>
        <text x={592} y={top + 178} textAnchor="end" fontSize={11} fontWeight={700} style={{ fill: statusColor, transition: ease }}>
          {f.status === 'running' ? 'test running' : f.status === 'pass' ? 'PASS' : 'FAIL'}
        </text>
      </svg>
    </VizFrame>
  );
}
