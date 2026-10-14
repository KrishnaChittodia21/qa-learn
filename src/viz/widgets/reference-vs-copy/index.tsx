import { useMemo, useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { SCENARIOS, simulate, type Obj, type Params, type RefFrame, type ScenarioId, type Var } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const LH = 15;
const VX = 278;
const VW = 112;
const VH = 24;
const OX = 428;
const OW = 158;
const FH = 16;
const fade = 'opacity 0.45s ease';
const vkey = (v: Pick<Var, 'name' | 'scope'>) => `${v.scope}|${v.name}`;
const objH = (o: Obj) => (o.kind === 'array' ? 20 + FH : 20 + o.fields.length * FH);

function arrayText(o: Obj) {
  const t = `[${o.fields.map((f) => f.v).join(', ')}]`;
  return t.length > 27 ? t.slice(0, 26) + '…]' : t;
}

/** stable slots: every variable / object that ever appears keeps one position for the whole run */
function useLayout(frames: RefFrame[]) {
  return useMemo(() => {
    const vars: Var[] = [];
    const objs: Obj[] = [];
    for (const f of frames) {
      for (const v of f.vars) if (!vars.some((x) => vkey(x) === vkey(v))) vars.push(v);
      for (const o of f.objs) if (!objs.some((x) => x.id === o.id)) objs.push(o);
    }
    const vy: Record<string, number> = {};
    vars.forEach((v, i) => (vy[vkey(v)] = 14 + i * (VH + 8)));
    const oy: Record<string, number> = {};
    let y = 10;
    for (const o of objs) {
      oy[o.id] = y;
      y += objH(o) + 10;
    }
    return { vars, objs, vy, oy };
  }, [frames]);
}

function RefView({ f, code, layout }: { f: RefFrame; code: string[]; layout: ReturnType<typeof useLayout> }) {
  const { vars, objs, vy, oy } = layout;
  const cur = (k: string) => f.vars.find((v) => vkey(v) === k);
  const curObj = (id: string) => f.objs.find((o) => o.id === id);
  // reachability from variables (unreachable objects would be garbage-collected)
  const reach = new Set<string>();
  const walk = (id?: string) => {
    if (!id || reach.has(id)) return;
    reach.add(id);
    curObj(id)?.fields.forEach((fl) => walk(fl.ref));
  };
  f.vars.forEach((v) => walk(v.ref));
  const scopes = [...new Set(f.vars.filter((v) => v.scope !== 'global').map((v) => v.scope))];
  const label = `Variables: ${f.vars.map((v) => `${v.name} ${v.ref ? `→ object ${v.ref}` : `= ${v.value}`}`).join('; ') || 'none'}. Console: ${f.out.join(', ') || 'empty'}.`;
  const codeH = code.length * LH + 10;

  return (
    <svg viewBox="0 0 600 300" className="viz-svg" role="img" aria-label={label}>
      <defs>
        <marker id="rvc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
        </marker>
      </defs>
      {/* code */}
      <rect x={2} y={6} width={266} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <rect x={4} y={0} width={262} height={LH} rx={3} fill="var(--accent-soft)" stroke="var(--accent)" style={{ transform: `translateY(${10 + Math.max(0, f.line) * LH}px)`, transition: 'transform 0.35s ease, opacity 0.3s', opacity: f.line >= 0 ? 1 : 0 }} />
      {code.map((l, i) => (
        <text key={i} x={8} y={21 + i * LH} fontSize={7.6} fontWeight={i === f.line ? 700 : 400} style={{ ...mono, whiteSpace: 'pre' }}>
          {l}
        </text>
      ))}
      {/* console */}
      <rect x={2} y={codeH + 14} width={266} height={292 - codeH - 14} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={8} y={codeH + 27} fontSize={9.5} fontWeight={700}>
        Console
      </text>
      {f.out.map((o, i) => (
        <text key={i} x={8 + (i >= 5 ? 130 : 0)} y={codeH + 41 + (i % 5) * 13} fontSize={9.5} fontWeight={i === f.out.length - 1 ? 700 : 400} style={mono}>
          {'> '}
          {o}
        </text>
      ))}

      <text x={VX} y={8} fontSize={9.5} className="viz-label">
        variables
      </text>
      <text x={OX} y={6} fontSize={9.5} className="viz-label">
        heap
      </text>

      {/* function frames */}
      {scopes.map((sc) => {
        const ys = f.vars.filter((v) => v.scope === sc).map((v) => vy[vkey(v)]);
        const top = Math.min(...ys) - 12;
        return (
          <g key={sc}>
            <rect x={VX - 4} y={top} width={VW + 8} height={Math.max(...ys) - top + VH + 4} rx={6} fill="none" stroke="var(--warn)" strokeDasharray="4 3" />
            <text x={VX + VW + 2} y={top + 9} textAnchor="end" fontSize={8.5} style={{ fill: 'var(--warn)' }}>
              {sc} frame
            </text>
          </g>
        );
      })}

      {/* field → object arrows (nested references) */}
      {objs.map((o0) => {
        const o = curObj(o0.id);
        return (o?.fields ?? []).map((fl, fi) =>
          fl.ref && oy[fl.ref] !== undefined ? (
            <path
              key={`${o0.id}-${fl.k}`}
              d={`M${OX + OW},${oy[o0.id] + 20 + fi * FH + 8} C${OX + OW + 28},${oy[o0.id] + 20 + fi * FH + 8} ${OX + OW + 28},${oy[fl.ref] + 12} ${OX + OW + 2},${oy[fl.ref] + 12}`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={1.5}
              markerEnd="url(#rvc-arrow)"
              style={{ transition: 'd 0.45s ease' }}
            />
          ) : null,
        );
      })}

      {/* variables and their arrows */}
      {vars.map((v0) => {
        const k = vkey(v0);
        const v = cur(k);
        const y = vy[k];
        const hot = !!v && f.hot.includes(v.name);
        return (
          <g key={k} style={{ opacity: v ? 1 : 0, transition: fade }}>
            {v?.ref && (
              <path d={`M${VX + VW - 8},${y + VH / 2} C${OX - 20},${y + VH / 2} ${OX - 30},${oy[v.ref] + 12} ${OX - 2},${oy[v.ref] + 12}`} fill="none" stroke="var(--accent)" strokeWidth={1.8} markerEnd="url(#rvc-arrow)" style={{ transition: 'd 0.45s ease' }} />
            )}
            <rect x={VX} y={y} width={VW} height={VH} rx={5} fill={hot ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={hot ? 'var(--accent)' : 'var(--border)'} strokeWidth={hot ? 2 : 1} style={{ transition: 'fill 0.35s, stroke 0.35s' }} />
            <text x={VX + 6} y={y + 16} fontSize={10} fontWeight={700} style={mono}>
              {v0.name}
            </text>
            {v?.ref ? (
              <circle cx={VX + VW - 8} cy={y + VH / 2} r={4} fill="var(--accent)" />
            ) : (
              <text x={VX + VW - 6} y={y + 16} textAnchor="end" fontSize={9.5} style={mono}>
                {(v?.value ?? '').length > 11 ? v!.value!.slice(0, 10) + '…' : v?.value}
              </text>
            )}
          </g>
        );
      })}

      {/* heap objects */}
      {objs.map((o0) => {
        const o = curObj(o0.id);
        const y = oy[o0.id];
        const fresh = f.hot.includes(o0.id);
        const dead = !!o && !reach.has(o0.id);
        return (
          <g key={o0.id} style={{ opacity: o ? (dead ? 0.35 : 1) : 0, transition: fade }}>
            <rect x={OX} y={y} width={OW} height={o ? objH(o) : objH(o0)} rx={6} fill="var(--surface-2)" stroke={fresh ? 'var(--accent)' : 'var(--border)'} strokeWidth={fresh ? 2.5 : 1.2} style={{ transition: 'stroke 0.35s, height 0.35s' }} />
            <text x={OX + 6} y={y + 13} fontSize={9} className="viz-label">
              {o0.kind === 'array' ? 'Array' : 'Object'} #{o0.id}
              {dead ? ' (unreachable → GC)' : ''}
            </text>
            {o?.kind === 'array' ? (
              <g>
                <rect x={OX + 2} y={y + 18} width={OW - 4} height={FH} rx={3} fill={f.hot.some((h) => h.startsWith(`${o.id}.`)) ? 'var(--warn-soft)' : 'transparent'} style={{ transition: 'fill 0.35s' }} />
                <text x={OX + 6} y={y + 30} fontSize={9.5} style={mono}>
                  {arrayText(o)}
                </text>
              </g>
            ) : (
              o?.fields.map((fl, fi) => (
                <g key={fl.k}>
                  <rect x={OX + 2} y={y + 18 + fi * FH} width={OW - 4} height={FH} rx={3} fill={f.hot.includes(`${o.id}.${fl.k}`) ? 'var(--warn-soft)' : 'transparent'} style={{ transition: 'fill 0.35s' }} />
                  <text x={OX + 6} y={y + 30 + fi * FH} fontSize={9.5} style={mono}>
                    {fl.k}: {fl.ref ? '' : fl.v}
                  </text>
                  {fl.ref && <circle cx={OX + OW - 8} cy={y + 26 + fi * FH} r={3.5} fill="var(--accent)" />}
                </g>
              ))
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ReferenceVsCopyViz() {
  const [params, setParams] = useState<Params>({ scenario: 'assign' });
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
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> reference (arrow to a heap object)
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> just mutated / function frame
        </>
      }
    >
      <RefView f={stepper.frame} code={SCENARIOS[params.scenario].code} layout={layout} />
    </VizFrame>
  );
}
