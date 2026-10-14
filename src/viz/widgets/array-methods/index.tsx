import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, code, simulate, type ArrFrame, type ItemState, type Method, type Params, type Preset } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const BW = 84;
const BH = 32;
const IN_Y = 48;
const OUT_Y = 168;
const sx = (slot: number) => 20 + slot * 95;
const move = 'transform 0.5s ease, opacity 0.5s ease';

const LOOK: Record<ItemState, { fill: string; stroke: string; opacity: number; dash?: string }> = {
  idle: { fill: 'var(--surface-2)', stroke: 'var(--border)', opacity: 1 },
  active: { fill: 'var(--accent-soft)', stroke: 'var(--accent)', opacity: 1 },
  kept: { fill: 'var(--good-soft)', stroke: 'var(--good)', opacity: 1 },
  dropped: { fill: 'var(--bad-soft)', stroke: 'var(--bad)', opacity: 0.55 },
  skipped: { fill: 'var(--surface-2)', stroke: 'var(--muted)', opacity: 0.4, dash: '4 3' },
  hit: { fill: 'var(--good-soft)', stroke: 'var(--good)', opacity: 1 },
  done: { fill: 'var(--surface-2)', stroke: 'var(--muted)', opacity: 0.8 },
};

function Box({ x, y, label, fill, stroke, opacity = 1, dash, bold, sw = 1.5 }: { x: number; y: number; label: string; fill: string; stroke: string; opacity?: number; dash?: string; bold?: boolean; sw?: number }) {
  return (
    <g style={{ transform: `translate(${x}px, ${y}px)`, transition: move, opacity }}>
      <rect width={BW} height={BH} rx={6} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
      <text x={BW / 2} y={21} textAnchor="middle" fontSize={12} fontWeight={bold ? 700 : 500} style={mono}>
        {label}
      </text>
    </g>
  );
}

function ArrView({ f, p }: { f: ArrFrame; p: Params }) {
  const m = p.method;
  const accX = 300 - BW / 2 - 20;
  const label = `${code(p)}: ${f.calls} callback calls so far. Input: ${f.items
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((i) => i.label)
    .join(', ')}.${f.acc !== undefined ? ` Accumulator ${f.acc}.` : ''}${f.out.length ? ` Output: ${f.out.map((o) => o.label).join(', ')}.` : ''}${f.result ? ` Returns ${f.result}.` : ''}`;
  return (
    <svg viewBox="0 0 600 252" className="viz-svg" role="img" aria-label={label}>
      <text x={20} y={16} fontSize={11.5} fontWeight={700} style={mono}>
        {code(p)}
      </text>
      <text x={580} y={16} textAnchor="end" fontSize={10.5} className="viz-label">
        {m === 'sort' ? 'comparisons' : 'callback calls'}: {f.calls}
      </text>
      <text x={20} y={IN_Y - 8} fontSize={10} className="viz-label">
        {m === 'sort' ? 'array (sorted in place)' : 'input array'}
      </text>

      {/* index labels */}
      {f.items.map((_, k) => (
        <text key={k} x={sx(k) + BW / 2} y={IN_Y + BH + 13} textAnchor="middle" fontSize={9.5} className="viz-label">
          [{k}]
        </text>
      ))}

      {/* comparison bracket for sort */}
      {f.pair && (
        <path
          d={(() => {
            const [a, b] = f.pair.map((id) => sx(f.items[id].slot) + BW / 2).sort((u, v) => u - v);
            return `M${a},${IN_Y - 2} Q${(a + b) / 2},${IN_Y - 22} ${b},${IN_Y - 2}`;
          })()}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
        />
      )}

      {/* reduce: tokens pour into the accumulator */}
      {m === 'reduce' &&
        f.items.map((it) => {
          const poured = f.poured.includes(it.id);
          return (
            <Box
              key={`g${it.id}`}
              x={poured ? accX + 20 : sx(it.slot)}
              y={poured ? OUT_Y : IN_Y}
              label={it.label}
              fill="var(--accent-soft)"
              stroke="var(--accent)"
              opacity={poured ? 0 : 1}
            />
          );
        })}

      {/* output boxes are always mounted so they can glide from their source item */}
      {(m === 'map' || m === 'filter') &&
        f.items.map((it) => {
          const o = f.out.find((q) => q.from === it.id);
          return (
            <Box
              key={`o${it.id}`}
              x={o ? sx(o.slot) : sx(it.slot)}
              y={o ? OUT_Y : IN_Y}
              label={o ? o.label : it.label}
              fill={m === 'map' ? 'var(--accent-soft)' : 'var(--good-soft)'}
              stroke={m === 'map' ? 'var(--accent)' : 'var(--good)'}
              opacity={o ? 1 : 0}
              bold
            />
          );
        })}

      {/* input items */}
      {f.items.map((it) => {
        const l = LOOK[it.state];
        return <Box key={it.id} x={sx(it.slot)} y={IN_Y} label={it.label} fill={l.fill} stroke={l.stroke} opacity={l.opacity} dash={l.dash} sw={it.state === 'active' || it.state === 'hit' ? 3 : 1.5} />;
      })}

      {/* callback call */}
      <g style={{ opacity: f.call ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        <rect x={60} y={108} width={480} height={26} rx={13} fill="var(--surface-2)" stroke="var(--accent)" />
        <text x={300} y={125} textAnchor="middle" fontSize={11.5} style={mono}>
          {m === 'sort' ? f.call : `callback${f.call}`}
        </text>
      </g>
      <path d="M300,96 L300,106" className="viz-edge" />
      <path d="M300,136 L300,160" className="viz-edge" />

      {(m === 'map' || m === 'filter') && (
        <text x={20} y={OUT_Y - 6} fontSize={10} className="viz-label">
          new array (length {f.out.length})
        </text>
      )}

      {m === 'reduce' && (
        <g>
          <rect x={accX} y={OUT_Y - 6} width={BW + 40} height={BH + 12} rx={8} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth={2} />
          <text x={accX + (BW + 40) / 2} y={OUT_Y + 19} textAnchor="middle" fontSize={12} fontWeight={700} style={mono}>
            {f.acc}
          </text>
          <text x={accX + BW + 50} y={OUT_Y + 19} fontSize={10.5} className="viz-label">
            ← acc (accumulator)
          </text>
        </g>
      )}

      {/* return value */}
      <g style={{ opacity: f.result ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <rect x={20} y={222} width={560} height={24} rx={6} fill="var(--good-soft)" stroke="var(--good)" />
        <text x={30} y={238} fontSize={11.5} fontWeight={700} style={mono}>
          returns {f.result ?? ''}
        </text>
      </g>
    </svg>
  );
}

const METHODS: Method[] = ['map', 'filter', 'reduce', 'find', 'some', 'every', 'sort'];

export default function ArrayMethodsViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const set = <K extends keyof Params>(k: K) => (v: Params[K]) => setParams((p) => ({ ...p, [k]: v }));
  const usesT = ['filter', 'find', 'some', 'every'].includes(params.method);

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Method> label="Method" value={params.method} options={METHODS.map((m) => ({ value: m, label: m }))} onChange={set('method')} />
          <Choice<Preset>
            label="Input"
            value={params.preset}
            options={[
              { value: 'numbers', label: '[10, 9, 1, 2, 25, 3]' },
              { value: 'prices', label: 'SauceDemo prices ("$29.99")' },
            ]}
            onChange={set('preset')}
          />
          {usesT && <Slider label="Threshold (value >)" value={params.threshold} min={0} max={50} onChange={set('threshold')} />}
          {params.method === 'sort' && (
            <Choice<'no' | 'yes'>
              label="Comparator"
              value={params.comparator ? 'yes' : 'no'}
              options={[
                { value: 'no', label: 'none (default)' },
                { value: 'yes', label: '(a, b) => a - b' },
              ]}
              onChange={(v) => set('comparator')(v === 'yes')}
            />
          )}
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> current call
          <span className="viz-key" style={{ background: 'var(--good)' }} /> kept / match
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> filtered out
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> visited / never called (dashed)
        </>
      }
    >
      <ArrView f={stepper.frame} p={params} />
    </VizFrame>
  );
}
