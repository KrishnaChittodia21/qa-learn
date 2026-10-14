import { useMemo, useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { SNIPPETS, TDZ, simulate, type HoFrame, type Kind, type Params, type SnippetId } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const LH = 16;
const CY = 36;
const MX = 310;
const MW = 288;
const RH = 30;
const move = 'transform 0.45s ease, opacity 0.4s ease';

const KIND_TONE: Record<Kind, string> = { var: 'var(--warn)', let: 'var(--accent)', const: 'var(--accent)', function: 'var(--good)' };

function HoistView({ f, code, names }: { f: HoFrame; code: string[]; names: string[] }) {
  const creating = f.phase === 'creation';
  const crashed = f.phase === 'crashed';
  const codeH = code.length * LH + 10;
  const label = `${creating ? 'Phase 1, creation' : crashed ? 'Crashed with an uncaught error' : 'Phase 2, execution'}. Memory: ${
    f.mem.map((m) => `${m.name} (${m.kind}) = ${m.value === TDZ ? 'uninitialised, in the TDZ' : m.value}`).join('; ') || 'empty'
  }. Console: ${f.out.map((o) => o.text).join(', ') || 'empty'}.`;

  return (
    <svg viewBox="0 0 600 300" className="viz-svg" role="img" aria-label={label}>
      {/* phase banner */}
      <rect x={2} y={4} width={596} height={24} rx={12} fill="var(--surface-2)" stroke="var(--border)" />
      <rect x={0} y={6} width={294} height={20} rx={10} fill={crashed ? 'var(--bad-soft)' : creating ? 'var(--warn-soft)' : 'var(--accent-soft)'} stroke={crashed ? 'var(--bad)' : creating ? 'var(--warn)' : 'var(--accent)'} style={{ transform: `translateX(${creating ? 4 : 302}px)`, transition: 'transform 0.5s ease, fill 0.4s, stroke 0.4s' }} />
      <text x={151} y={20} textAnchor="middle" fontSize={10} fontWeight={creating ? 700 : 400}>
        Phase 1 · creation (register declarations)
      </text>
      <text x={449} y={20} textAnchor="middle" fontSize={10} fontWeight={creating ? 400 : 700}>
        {crashed ? 'Phase 2 · execution stopped: uncaught error' : 'Phase 2 · execution (run lines)'}
      </text>

      {/* code */}
      <rect x={2} y={CY} width={300} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <rect
        x={4}
        y={0}
        width={296}
        height={LH}
        rx={3}
        fill={crashed ? 'var(--bad-soft)' : creating ? 'var(--warn-soft)' : 'var(--accent-soft)'}
        stroke={crashed ? 'var(--bad)' : creating ? 'var(--warn)' : 'var(--accent)'}
        style={{ transform: `translateY(${CY + 5 + Math.max(0, f.line) * LH}px)`, transition: 'transform 0.35s ease, opacity 0.3s, fill 0.3s', opacity: f.line >= 0 ? 1 : 0 }}
      />
      {code.map((l, i) => (
        <g key={i}>
          <text x={8} y={CY + 17 + i * LH} fontSize={7.6} className="viz-label" style={mono}>
            {i + 1}
          </text>
          <text x={22} y={CY + 17 + i * LH} fontSize={7.8} fontWeight={i === f.line ? 700 : 400} style={{ ...mono, whiteSpace: 'pre' }}>
            {l}
          </text>
        </g>
      ))}

      {/* console */}
      <rect x={2} y={CY + codeH + 8} width={300} height={296 - CY - codeH - 8} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={8} y={CY + codeH + 22} fontSize={9.5} fontWeight={700}>
        Console
      </text>
      {f.out
        .flatMap((o, i) => {
          const cut = o.text.indexOf(': ');
          const last = i === f.out.length - 1;
          return o.text.length > 44 && cut > 0 ? [{ ...o, last, text: o.text.slice(0, cut + 1) }, { ...o, last, text: '  ' + o.text.slice(cut + 2), cont: true }] : [{ ...o, last }];
        })
        .map((o, i) => (
          <text key={i} x={8} y={CY + codeH + 37 + i * 13} fontSize={9} fontWeight={o.last ? 700 : 400} style={{ ...mono, fill: o.err ? 'var(--bad)' : undefined }}>
            {'cont' in o ? '' : '> '}
            {o.text}
          </text>
        ))}

      {/* memory */}
      <rect x={MX} y={CY} width={MW} height={260} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={MX + 8} y={CY + 15} fontSize={9.5} fontWeight={700}>
        Memory (script scope)
      </text>
      <text x={MX + 8} y={CY + 30} fontSize={8.5} className="viz-label">
        name
      </text>
      <text x={MX + 92} y={CY + 30} fontSize={8.5} className="viz-label">
        declared as
      </text>
      <text x={MX + 166} y={CY + 30} fontSize={8.5} className="viz-label">
        value
      </text>
      {names.map((n, i) => {
        const m = f.mem.find((x) => x.name === n);
        const tdz = m?.value === TDZ;
        const boom = f.boom === n;
        const hot = f.hot === n;
        return (
          <g key={n} style={{ transform: `translate(${MX + 6}px, ${CY + 38 + i * (RH + 6)}px) translateX(${m ? 0 : 24}px)`, opacity: m ? 1 : 0, transition: move }}>
            <rect width={MW - 12} height={RH} rx={6} fill={boom ? 'var(--bad-soft)' : hot ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={boom ? 'var(--bad)' : hot ? 'var(--accent)' : 'var(--border)'} strokeWidth={boom || hot ? 2 : 1} style={{ transition: 'fill 0.35s, stroke 0.35s' }} />
            <text x={8} y={19} fontSize={10.5} fontWeight={700} style={mono}>
              {n}
            </text>
            <text x={86} y={19} fontSize={9.5} fontWeight={700} style={{ ...mono, fill: m ? KIND_TONE[m.kind] : undefined }}>
              {m?.kind}
            </text>
            <rect x={156} y={5} width={MW - 12 - 162} height={RH - 10} rx={4} fill={tdz ? 'var(--warn-soft)' : 'transparent'} stroke={tdz ? 'var(--warn)' : 'none'} strokeDasharray="3 2" style={{ transition: 'fill 0.35s' }} />
            <text x={162} y={19} fontSize={tdz ? 8.6 : 9.5} style={{ ...mono, fill: boom ? 'var(--bad)' : tdz ? 'var(--warn)' : undefined, fontWeight: boom ? 700 : 400 }}>
              {boom ? 'ReferenceError!' : tdz ? 'TDZ (uninitialised)' : m?.value}
            </text>
          </g>
        );
      })}
      {f.mem.length === 0 && (
        <text x={MX + MW / 2} y={CY + 80} textAnchor="middle" fontSize={10} className="viz-label">
          (nothing registered yet)
        </text>
      )}
    </svg>
  );
}

export default function JsHoistingViz() {
  const [params, setParams] = useState<Params>({ snippet: 'tdz' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const names = useMemo(() => {
    const all: string[] = [];
    for (const f of frames) for (const m of f.mem) if (!all.includes(m.name)) all.push(m.name);
    return all;
  }, [frames]);
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
          <span className="viz-key" style={{ background: 'var(--good)' }} /> function declaration: whole function
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> var: undefined · TDZ: uninitialised
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> let / const
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> error
        </>
      }
    >
      <HoistView f={stepper.frame} code={SNIPPETS[params.snippet].code} names={names} />
    </VizFrame>
  );
}
