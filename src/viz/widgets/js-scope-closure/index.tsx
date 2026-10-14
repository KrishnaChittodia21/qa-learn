import { useMemo, useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { SCENARIOS, simulate, type Env, type Params, type ScFrame, type ScenarioId, type StackEntry } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const LH = 14;
const SX = 240;
const SW = 94;
const FH = 22;
const EX = 344;
const EW = 254;
const CW = 124;
const RH = 13;
const move = 'transform 0.45s ease, opacity 0.4s ease';

const envH = (n: number) => 22 + Math.max(1, n) * RH;

/** stable positions: every environment slot and stack frame keeps one place for the whole run */
function useLayout(frames: ScFrame[]) {
  return useMemo(() => {
    const slots: string[] = [];
    const maxVars: Record<string, number> = {};
    const parentSlot: Record<string, string> = {};
    const stackIds: { e: StackEntry; idx: number }[] = [];
    for (const f of frames) {
      for (const e of f.envs) {
        const par = f.envs.find((x) => x.id === e.parent);
        if (par) parentSlot[e.slot] = par.slot;
        if (!slots.includes(e.slot)) slots.push(e.slot);
        maxVars[e.slot] = Math.max(maxVars[e.slot] ?? 0, e.vars.length);
      }
      f.stack.forEach((e, idx) => !stackIds.some((x) => x.e.id === e.id) && stackIds.push({ e, idx }));
    }
    const pos: Record<string, { x: number; y: number; w: number; h: number }> = {};
    pos.g = { x: EX, y: 18, w: EW, h: envH(maxVars.g ?? 1) };
    let y = pos.g.y + pos.g.h + 22;
    const rest = slots.filter((s) => s !== 'g');
    // two per row, but a child never sits beside its parent (its scope link must point up)
    const rows: string[][] = [];
    for (const s of rest) {
      const row = rows[rows.length - 1];
      if (row && row.length < 2 && !row.includes(parentSlot[s])) row.push(s);
      else rows.push([s]);
    }
    for (const row of rows) {
      const h = Math.max(...row.map((s) => envH(maxVars[s])));
      row.forEach((s, c) => (pos[s] = { x: EX + c * (CW + 6), y, w: CW, h: envH(maxVars[s]) }));
      y += h + 20;
    }
    return { pos, stackIds };
  }, [frames]);
}

function EnvBox({ e, f, p }: { e: Env; f: ScFrame; p: { x: number; y: number; w: number; h: number } }) {
  const inStack = f.stack.some((s) => s.env === e.id);
  const kept = e.id !== 'g' && !inStack;
  const li = f.look?.path.indexOf(e.id) ?? -1;
  const found = li >= 0 && li === f.look!.path.length - 1 && f.look!.found;
  const stroke = found ? 'var(--good)' : li >= 0 ? 'var(--warn)' : kept ? 'var(--accent)' : 'var(--border)';
  return (
    <g>
      <rect x={p.x} y={p.y} width={p.w} height={envH(e.vars.length)} rx={6} fill={found ? 'var(--good-soft)' : 'var(--surface-2)'} stroke={stroke} strokeWidth={li >= 0 || kept || f.hot.includes(e.id) ? 2.2 : 1.2} style={{ transition: 'stroke 0.35s, fill 0.35s, height 0.35s' }} />
      <text x={p.x + 6} y={p.y + 13} fontSize={8.5} fontWeight={700}>
        {e.label}
      </text>
      {kept && (
        <text x={p.x + p.w - 5} y={p.y + 13} textAnchor="end" fontSize={8} style={{ fill: 'var(--accent)' }}>
          kept alive
        </text>
      )}
      {e.vars.length === 0 && (
        <text x={p.x + 6} y={p.y + 30} fontSize={8} className="viz-label">
          (no own variables)
        </text>
      )}
      {e.vars.map((b, i) => {
        const y = p.y + 18 + i * RH;
        const hot = f.hot.includes(`${e.id}.${b.k}`);
        const n = b.fns?.length ?? 0;
        return (
          <g key={b.k}>
            <rect x={p.x + 2} y={y} width={p.w - 4} height={RH} rx={3} fill={hot ? 'var(--warn-soft)' : 'transparent'} style={{ transition: 'fill 0.35s' }} />
            <text x={p.x + 6} y={y + 10} fontSize={8.5} fontWeight={f.look?.name === b.k && found ? 700 : 400} style={mono}>
              {b.k}
            </text>
            <text x={p.x + p.w - 8 - n * 11} y={y + 10} textAnchor="end" fontSize={8.5} style={{ ...mono, fill: b.v.startsWith('‹') ? 'var(--muted)' : undefined }}>
              {b.v}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function ScopeView({ f, code, layout }: { f: ScFrame; code: string[]; layout: ReturnType<typeof useLayout> }) {
  const { pos, stackIds } = layout;
  const codeH = code.length * LH + 10;
  const box = (id: string) => {
    const e = f.envs.find((x) => x.id === id);
    return e ? { e, p: pos[e.slot] } : undefined;
  };
  const label = `Call stack: ${f.stack.map((s) => s.label).join(' > ') || 'empty'}. Environments: ${f.envs
    .map((e) => `${e.label} {${e.vars.map((b) => `${b.k}=${b.v}`).join(', ')}}`)
    .join('; ')}.${f.look ? ` Looking up ${f.look.name}: ${f.look.found ? 'found' : 'not found'}.` : ''} Console: ${f.out.join(', ') || 'empty'}.`;
  const top = f.stack[f.stack.length - 1];
  const topBox = top && box(top.env);

  return (
    <svg viewBox="0 0 600 300" className="viz-svg" role="img" aria-label={label}>
      <defs>
        <marker id="ssc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
        </marker>
      </defs>
      {/* code + console */}
      <rect x={2} y={4} width={232} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <rect x={4} y={0} width={228} height={LH} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" style={{ transform: `translateY(${8 + Math.max(0, f.line) * LH}px)`, transition: 'transform 0.35s ease, opacity 0.3s', opacity: f.line >= 0 ? 1 : 0 }} />
      {code.map((l, i) => (
        <text key={i} x={8} y={18 + i * LH} fontSize={7.8} fontWeight={i === f.line ? 700 : 400} style={{ ...mono, whiteSpace: 'pre' }}>
          {l}
        </text>
      ))}
      <rect x={2} y={codeH + 10} width={232} height={288 - codeH - 10} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={8} y={codeH + 23} fontSize={9.5} fontWeight={700}>
        Console
      </text>
      {f.out.map((o, i) => (
        <text key={i} x={8} y={codeH + 37 + i * 12} fontSize={9} fontWeight={i === f.out.length - 1 ? 700 : 400} style={mono}>
          {'> '}
          {o}
        </text>
      ))}

      {/* call stack */}
      <rect x={SX} y={4} width={SW} height={284} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={SX + 6} y={17} fontSize={9.5} fontWeight={700}>
        Call stack
      </text>
      {stackIds.map(({ e, idx }) => {
        const cur = f.stack.findIndex((s) => s.id === e.id);
        const at = cur >= 0 ? cur : idx;
        const isTop = cur === f.stack.length - 1;
        const label = cur >= 0 ? f.stack[cur].label : e.label;
        return (
          <g key={e.id} style={{ transform: `translate(${SX + 4}px, ${280 - (at + 1) * (FH + 4) - (cur >= 0 ? 0 : 18)}px)`, opacity: cur >= 0 ? 1 : 0, transition: move }}>
            <rect width={SW - 8} height={FH} rx={5} fill={isTop ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={isTop ? 'var(--accent)' : 'var(--text-2)'} strokeWidth={isTop ? 2 : 1} style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
            <text x={(SW - 8) / 2} y={14} textAnchor="middle" fontSize={label.length > 15 ? 7.2 : 8.2} style={mono}>
              {label}
            </text>
          </g>
        );
      })}
      {topBox && top.id !== 'script' && (
        <path d={`M${SX + SW - 4},${280 - f.stack.length * (FH + 4) + FH / 2} L${topBox.p.x - 2},${topBox.p.y + 10}`} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 3" fill="none" opacity={0.7} style={{ transition: 'd 0.45s ease' }} />
      )}

      {/* scope-chain links (child → parent) */}
      {f.envs.map((e) => {
        const a = pos[e.slot];
        const b = e.parent && box(e.parent);
        if (!b) return null;
        const bh = envH(b.e.vars.length);
        const d = `M${a.x + 18},${a.y} L${a.x + 18},${b.p.y + bh + 1}`;
        return <path key={`p-${e.id}`} d={d} stroke="var(--muted)" strokeDasharray="2 3" strokeWidth={1.6} fill="none" />;
      })}

      {/* environments (all ever seen, so entering/leaving fades) */}
      {Object.entries(pos).map(([slot, p]) => {
        const e = f.envs.find((x) => x.slot === slot);
        return (
          <g key={slot} style={{ opacity: e ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            {e && <EnvBox e={e} f={f} p={p} />}
          </g>
        );
      })}

      {/* backpacks: function value → environment it was created in */}
      {f.envs.flatMap((e) =>
        e.vars.flatMap((b, i) =>
          (b.fns ?? []).map((target, k) => {
            const p = pos[e.slot];
            const t = box(target);
            if (!t) return null;
            const n = b.fns!.length;
            const x = p.x + p.w - 10 - (n - 1 - k) * 11;
            const y = p.y + 18 + i * RH + 6;
            const self = target === e.id;
            const tx = self ? p.x + 70 + k * 12 : t.p.x + 30 + k * 6;
            const ty = self ? p.y : t.p.y;
            const d = self ? `M${x},${y - 5} C${x},${p.y - 12} ${tx + 10},${p.y - 14} ${tx},${ty - 2}` : `M${x},${y + 4} C${x},${y + 30} ${tx},${ty - 24} ${tx},${ty - 2}`;
            return (
              <g key={`${e.id}-${b.k}-${k}`}>
                <path d={d} stroke="var(--accent)" strokeWidth={1.5} fill="none" markerEnd="url(#ssc-arrow)" />
                <rect x={x - 4} y={y - 4} width={8} height={9} rx={2} fill="var(--accent)" />
                <path d={`M${x - 2},${y - 4} Q${x},${y - 8} ${x + 2},${y - 4}`} stroke="var(--accent)" fill="none" strokeWidth={1.2} />
              </g>
            );
          }),
        ),
      )}

      {f.look && (
        <text x={EX + EW} y={296} textAnchor="end" fontSize={9} fontWeight={700} style={{ fill: f.look.found ? 'var(--good)' : 'var(--bad)' }}>
          lookup {f.look.name}: {f.look.path.map((id) => f.envs.find((e) => e.id === id)?.label).join(' → ')} {f.look.found ? '✓ found' : '✗ not found'}
        </text>
      )}
    </svg>
  );
}

export default function JsScopeClosureViz() {
  const [params, setParams] = useState<Params>({ scenario: 'counter' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const layout = useLayout(frames);
  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <Choice<ScenarioId>
          label="Scenario"
          value={params.scenario}
          options={(Object.keys(SCENARIOS) as ScenarioId[]).map((k) => ({ value: k, label: SCENARIOS[k].label }))}
          onChange={(scenario) => setParams({ scenario })}
        />
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> backpack: function → environment it was created in
          <span className="viz-key" style={{ background: 'var(--muted)' }} /> scope chain (dashed, child → parent)
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> lookup visiting
          <span className="viz-key" style={{ background: 'var(--good)' }} /> variable found
        </>
      }
    >
      <ScopeView f={stepper.frame} code={SCENARIOS[params.scenario].code} layout={layout} />
    </VizFrame>
  );
}
