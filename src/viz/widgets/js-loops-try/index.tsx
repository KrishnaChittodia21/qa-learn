import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { FLOWS, codeFor, simulate, type BlockId, type BlockState, type Flow, type LtFrame, type Mode, type Params, type Target } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const LH = 13;
const RX = 298;
const RW = 300;
const move = 'transform 0.45s ease, opacity 0.4s ease';

function CodePanel({ f, code }: { f: LtFrame; code: string[] }) {
  const codeH = code.length * LH + 10;
  const rows = Math.max(1, Math.floor((296 - codeH - 30) / 12));
  return (
    <g>
      <rect x={2} y={4} width={288} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <rect x={4} y={0} width={284} height={LH} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" style={{ transform: `translateY(${8 + Math.max(0, f.line) * LH}px)`, transition: 'transform 0.35s ease, opacity 0.3s', opacity: f.line >= 0 ? 1 : 0 }} />
      {code.map((l, i) => (
        <text key={i} x={8} y={18 + i * LH} fontSize={7.4} fontWeight={i === f.line ? 700 : 400} style={{ ...mono, whiteSpace: 'pre' }}>
          {l}
        </text>
      ))}
      <rect x={2} y={codeH + 10} width={288} height={286 - codeH - 10} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={8} y={codeH + 23} fontSize={9.5} fontWeight={700}>
        Console
      </text>
      {f.out.slice(-rows * 2).map((o, i, arr) => (
        <text key={`${f.out.length}-${i}`} x={8 + Math.floor(i / rows) * 142} y={codeH + 36 + (i % rows) * 12} fontSize={8.6} fontWeight={i === arr.length - 1 ? 700 : 400} style={mono}>
          {'> '}
          {o.length > 24 ? o.slice(0, 23) + '…' : o}
        </text>
      ))}
    </g>
  );
}

const COL_STATE = {
  idle: { text: 'waiting', color: 'var(--muted)' },
  run: { text: 'running', color: 'var(--accent)' },
  done: { text: 'done', color: 'var(--good)' },
  broke: { text: 'break', color: 'var(--warn)' },
  error: { text: 'threw', color: 'var(--bad)' },
};

function IterView({ f }: { f: LtFrame }) {
  const n = f.items.length || 1;
  const bw = n > 2 ? 68 : 142;
  const bx = (i: number) => RX + 4 + i * (bw + 6);
  const nc = f.cols.length || 1;
  const cw = (RW - (nc - 1) * 6) / nc;
  return (
    <g>
      <text x={RX + 4} y={14} fontSize={9.5} className="viz-label">
        {f.items[0]?.kind === 'index' ? 'browsers (array with an extra property)' : 'user (plain object)'}
      </text>
      {f.items.map((it, i) => {
        const on = i === f.cursor;
        const prop = it.kind === 'prop' && f.items[0].kind === 'index';
        return (
          <g key={it.key} style={{ transform: `translate(${bx(i)}px, 22px)` }}>
            <rect width={bw} height={42} rx={6} fill={on ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={on ? 'var(--accent)' : prop ? 'var(--warn)' : 'var(--border)'} strokeWidth={on ? 2.5 : 1.2} strokeDasharray={prop ? '4 3' : undefined} style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
            <text x={bw / 2} y={14} textAnchor="middle" fontSize={8.5} className="viz-label">
              {it.kind === 'index' ? `[${it.key}]` : it.key}
            </text>
            <text x={bw / 2} y={31} textAnchor="middle" fontSize={9.5} fontWeight={700} style={mono}>
              {it.val}
            </text>
          </g>
        );
      })}
      {/* visiting cursor */}
      <g style={{ transform: `translate(${bx(Math.max(0, f.cursor)) + bw / 2}px, 70px)`, opacity: f.cursor >= 0 ? 1 : 0, transition: move }}>
        <path d="M0,0 L-7,10 L7,10 z" fill="var(--accent)" />
        <text y={22} textAnchor="middle" fontSize={8.5} fontWeight={700} style={{ fill: 'var(--accent)' }}>
          {f.col >= 0 ? f.cols[f.col].title : ''}
        </text>
      </g>
      {/* what each loop visited */}
      {f.cols.map((c, ci) => {
        const x = RX + ci * (cw + 6);
        const st = COL_STATE[c.state];
        const on = ci === f.col;
        return (
          <g key={c.title}>
            <rect x={x} y={104} width={cw} height={190} rx={6} fill="var(--surface-2)" stroke={on ? 'var(--accent)' : 'var(--border)'} strokeWidth={on ? 2 : 1} style={{ transition: 'stroke 0.3s' }} />
            <text x={x + 6} y={118} fontSize={c.title.length > 10 ? 7.8 : 9.5} fontWeight={700} style={mono}>
              {c.title}
            </text>
            <text x={x + 6} y={130} fontSize={8.5} style={{ fill: st.color, transition: 'fill 0.3s' }}>
              {st.text}
            </text>
            {c.got.map((g, gi) => (
              <g key={gi} style={{ transform: `translate(${x + 5}px, ${138 + gi * 24}px)` }}>
                <rect width={cw - 10} height={19} rx={4} fill={g.bad ? 'var(--bad-soft)' : 'var(--good-soft)'} stroke={g.bad ? 'var(--bad)' : 'var(--good)'} />
                <text x={(cw - 10) / 2} y={13} textAnchor="middle" fontSize={8.6} style={mono}>
                  {g.text}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}

const BLOCKS: { id: BlockId; label: string }[] = [
  { id: 'try', label: 'try { … }' },
  { id: 'catch', label: 'catch (err) { … }' },
  { id: 'finally', label: 'finally { … }' },
  { id: 'after', label: 'code after try/catch' },
  { id: 'caller', label: 'caller (outer try/catch)' },
];
const BH = 32;
const by = (i: number) => 8 + i * (BH + 8);
const LOOK: Record<BlockState, { fill: string; stroke: string; dash?: string; op: number; tag: string }> = {
  idle: { fill: 'var(--surface-2)', stroke: 'var(--border)', op: 1, tag: '' },
  active: { fill: 'var(--accent-soft)', stroke: 'var(--accent)', op: 1, tag: 'running' },
  ran: { fill: 'var(--good-soft)', stroke: 'var(--good)', op: 1, tag: 'ran' },
  skipped: { fill: 'var(--surface-2)', stroke: 'var(--muted)', dash: '4 3', op: 0.5, tag: 'skipped' },
  waiting: { fill: 'var(--surface-2)', stroke: 'var(--accent)', dash: '4 3', op: 1, tag: 'waiting for checkout()' },
};

function FlowView({ f }: { f: LtFrame }) {
  const ai = Math.max(0, BLOCKS.findIndex((b) => b.id === f.at));
  return (
    <g>
      {BLOCKS.map((b, i) => {
        const L = LOOK[f.blocks[b.id]];
        return (
          <g key={b.id} style={{ opacity: L.op, transition: 'opacity 0.35s' }}>
            <rect x={RX + 24} y={by(i)} width={RW - 24} height={BH} rx={6} fill={L.fill} stroke={L.stroke} strokeWidth={f.blocks[b.id] === 'active' ? 2.5 : 1.2} strokeDasharray={L.dash} style={{ transition: 'fill 0.35s, stroke 0.35s' }} />
            <text x={RX + 32} y={by(i) + 20} fontSize={10} fontWeight={700} style={mono}>
              {b.label}
            </text>
            <text x={RX + RW - 8} y={by(i) + 20} textAnchor="end" fontSize={8.5} style={{ fill: L.stroke }}>
              {L.tag}
            </text>
          </g>
        );
      })}
      {/* execution token */}
      <g style={{ transform: `translate(${RX + 10}px, ${by(ai) + BH / 2}px)`, opacity: f.at ? 1 : 0, transition: move }}>
        <circle r={8} fill="var(--accent)" />
        <path d="M-3,-4 L4,0 L-3,4 z" fill="var(--surface-2)" />
      </g>
      {/* pending completion parked while finally runs */}
      <g style={{ transform: `translate(${RX + 150}px, ${by(ai) + 4}px)`, opacity: f.pending ? 1 : 0, transition: move }}>
        <rect width={146} height={BH - 8} rx={12} fill={f.pending?.kind === 'throw' ? 'var(--bad-soft)' : 'var(--warn-soft)'} stroke={f.pending?.kind === 'throw' ? 'var(--bad)' : 'var(--warn)'} strokeWidth={1.5} />
        <text x={73} y={16} textAnchor="middle" fontSize={8.2} fontWeight={700} style={mono}>
          pending {f.pending?.kind}: {f.pending?.text.replace("Error('card declined')", 'Error')}
        </text>
      </g>
      {/* what checkout() hands to its caller */}
      <rect x={RX} y={214} width={RW} height={80} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={RX + 8} y={230} fontSize={9.5} fontWeight={700}>
        checkout() completes with
      </text>
      <g style={{ transform: `translate(${RX + 8}px, ${f.result ? 240 : 250}px)`, opacity: f.result ? 1 : 0, transition: move }}>
        <rect width={RW - 16} height={30} rx={15} fill={f.result?.kind === 'throw' ? 'var(--bad-soft)' : 'var(--good-soft)'} stroke={f.result?.kind === 'throw' ? 'var(--bad)' : 'var(--good)'} strokeWidth={2} />
        <text x={(RW - 16) / 2} y={20} textAnchor="middle" fontSize={11} fontWeight={800} style={mono}>
          {f.result ? (f.result.kind === 'return' ? `return ${f.result.text}` : `throw ${f.result.text}`) : ''}
        </text>
      </g>
    </g>
  );
}

export default function JsLoopsTryViz() {
  return <LoopsTryViz initialMode="iterate" />;
}

/** Shared by the try/catch widget (js-try-catch), which opens in the error-flow mode. */
export function LoopsTryViz({ initialMode }: { initialMode: Params['mode'] }) {
  const [params, setParams] = useState<Params>({ mode: initialMode, target: 'array', stop: 'no', flow: 'throw' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const label =
    params.mode === 'iterate'
      ? `Loops over ${params.target === 'array' ? 'an array with an extra property' : 'a plain object'}. ${f.cols.map((c) => `${c.title} visited ${c.got.map((g) => g.text).join(', ') || 'nothing yet'} (${COL_STATE[c.state].text})`).join('; ')}. Console: ${f.out.join(', ') || 'empty'}.`
      : `try/catch/finally, ${FLOWS[params.flow].label}. ${f.at ? `Running ${f.at}. ` : ''}${f.pending ? `Pending ${f.pending.kind} ${f.pending.text}. ` : ''}${f.result ? `checkout() completes with ${f.result.kind} ${f.result.text}. ` : ''}Console: ${f.out.join(', ') || 'empty'}.`;
  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Mode>
            label="Mode"
            value={params.mode}
            options={[
              { value: 'iterate', label: 'what loops visit' },
              { value: 'errors', label: 'try / catch / finally' },
            ]}
            onChange={(mode) => setParams({ ...params, mode })}
          />
          {params.mode === 'iterate' && (
            <Choice<Target>
              label="Loop over"
              value={params.target}
              options={[
                { value: 'array', label: 'array + extra prop' },
                { value: 'object', label: 'plain object' },
              ]}
              onChange={(target) => setParams({ ...params, target })}
            />
          )}
          {params.mode === 'iterate' && params.target === 'array' && (
            <Choice<'no' | 'yes'>
              label="Stop at 'firefox'"
              value={params.stop}
              options={[
                { value: 'no', label: 'no' },
                { value: 'yes', label: 'yes (break / return)' },
              ]}
              onChange={(stop) => setParams({ ...params, stop })}
            />
          )}
          {params.mode === 'errors' && (
            <Choice<Flow> label="Scenario" value={params.flow} options={(Object.keys(FLOWS) as Flow[]).map((k) => ({ value: k, label: FLOWS[k].label }))} onChange={(flow) => setParams({ ...params, flow })} />
          )}
        </>
      }
      legend={
        params.mode === 'iterate' ? (
          <>
            <span className="viz-key" style={{ background: 'var(--accent)' }} /> cursor: item being visited
            <span className="viz-key" style={{ background: 'var(--warn)' }} /> extra (non-index) property
            <span className="viz-key" style={{ background: 'var(--bad)' }} /> skipped / error
          </>
        ) : (
          <>
            <span className="viz-key" style={{ background: 'var(--accent)' }} /> running
            <span className="viz-key" style={{ background: 'var(--good)' }} /> ran / returned
            <span className="viz-key" style={{ background: 'var(--warn)' }} /> pending return
            <span className="viz-key" style={{ background: 'var(--bad)' }} /> pending / final throw
          </>
        )
      }
    >
      <svg viewBox="0 0 600 300" className="viz-svg" role="img" aria-label={label}>
        <CodePanel f={f} code={codeFor(params)} />
        {params.mode === 'iterate' ? <IterView f={f} /> : <FlowView f={f} />}
      </svg>
    </VizFrame>
  );
}
