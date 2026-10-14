import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { GROUPS, LADDERS, exprText, simulate, type CoFrame, type GroupId, type Op, type Params, type Tok } from './sim';

const mono = { fontFamily: 'var(--mono)' };
const ease = 'transform 0.45s ease, opacity 0.4s ease';
const TW = 124;
const TH = 56;
const LX = 18;
const RX = 214;
const TY = 78;
const RULE_Y = 66;
const RULE_H = 34;

/** colour by JS type so a conversion is visible as a colour change */
function tone(type: string) {
  if (type === 'string') return { fill: 'var(--warn-soft)', stroke: 'var(--warn)' };
  if (type === 'number') return { fill: 'var(--accent-soft)', stroke: 'var(--accent)' };
  if (type === 'boolean') return { fill: 'var(--good-soft)', stroke: 'var(--good)' };
  if (type === 'object') return { fill: 'var(--surface-2)', stroke: 'var(--text-2)' };
  return { fill: 'var(--bad-soft)', stroke: 'var(--bad)' };
}

function Token({ t, x, y }: { t?: Tok; x: number; y: number }) {
  const c = tone(t?.type ?? 'object');
  return (
    <g style={{ transform: `translate(${x}px, ${y - (t?.hot ? 8 : 0)}px)`, transition: ease, opacity: t ? 1 : 0 }}>
      <rect width={TW} height={TH} rx={8} fill={c.fill} stroke={c.stroke} strokeWidth={t?.hot ? 3 : 1.5} style={{ transition: 'fill 0.4s ease, stroke 0.4s ease, stroke-width 0.3s' }} />
      <text x={TW / 2} y={26} textAnchor="middle" fontSize={16} fontWeight={700} style={mono}>
        {t?.text}
      </text>
      <text x={TW / 2} y={45} textAnchor="middle" fontSize={10} className="viz-label">
        {t ? (t.hot ? `converted → ${t.type}` : t.type) : ''}
      </text>
    </g>
  );
}

function MachineView({ f, p }: { f: CoFrame; p: Params }) {
  const g = GROUPS[p.group];
  const rules = LADDERS[f.ladder];
  const n = g.exprs.length;
  const cw = (588 - (n - 1) * 6) / n;
  const label = `${f.expr >= 0 ? exprText(g, f.expr, p.op) : 'Overview'}. ${f.left ? `Left: ${f.left.text} (${f.left.type}). ` : ''}${f.right ? `Right: ${f.right.text} (${f.right.type}). ` : ''}${
    f.rule >= 0 ? `Rule: ${rules[f.rule]}. ` : ''
  }Rewrites: ${f.trace.join(' → ') || 'none'}. Results: ${g.exprs.map((_, i) => `${exprText(g, i, p.op)} is ${f.results[i] ?? 'pending'}`).join('; ')}.`;
  const vc = f.verdict ? tone(f.verdict.type) : tone('object');

  return (
    <svg viewBox="0 0 600 300" className="viz-svg" role="img" aria-label={label}>
      {/* expression chips with results */}
      {g.exprs.map((_, i) => {
        const r = f.results[i];
        const on = i === f.expr;
        return (
          <g key={i} style={{ transform: `translate(${6 + i * (cw + 6)}px, 6px)` }}>
            <rect width={cw} height={26} rx={6} fill={on ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={on ? 'var(--accent)' : 'var(--border)'} strokeWidth={on ? 2 : 1} style={{ transition: 'fill 0.35s, stroke 0.35s' }} />
            <text x={8} y={17} fontSize={n > 2 ? 10 : 11} fontWeight={on ? 700 : 500} style={mono}>
              {exprText(g, i, p.op)}
            </text>
            <text x={cw - 8} y={17} textAnchor="end" fontSize={10.5} fontWeight={700} style={{ ...mono, fill: r === 'true' ? 'var(--good)' : r === 'false' ? 'var(--bad)' : 'var(--accent)', opacity: r ? 1 : 0, transition: 'opacity 0.4s' }}>
              → {r}
            </text>
          </g>
        );
      })}

      {/* the machine */}
      <rect x={6} y={40} width={344} height={162} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={14} y={56} fontSize={10} fontWeight={700}>
        {g.arithmetic ? 'Operator machine' : `${p.op} machine`}
      </text>
      <Token t={f.left} x={LX} y={TY} />
      <Token t={f.right} x={RX} y={TY} />
      <text x={(LX + TW + RX) / 2} y={TY + 33} textAnchor="middle" fontSize={f.op.length > 3 ? 11 : 20} fontWeight={700} style={{ ...mono, opacity: f.left || f.right ? 1 : 0, transition: 'opacity 0.3s' }}>
        {f.op}
      </text>
      {/* verdict drops out of the operator */}
      <g style={{ transform: `translate(116px, ${f.verdict ? 148 : 110}px) scale(${f.verdict ? 1 : 0.6})`, transformOrigin: '56px 0', opacity: f.verdict ? 1 : 0, transition: ease }}>
        <rect width={112} height={44} rx={22} fill={vc.fill} stroke={vc.stroke} strokeWidth={2.5} />
        <text x={56} y={28} textAnchor="middle" fontSize={15} fontWeight={800} style={mono}>
          {f.verdict?.text}
        </text>
      </g>
      {!f.left && !f.right && (
        <text x={178} y={128} textAnchor="middle" fontSize={11} className="viz-label">
          {f.expr < 0 ? 'Pick an expression set; step to feed each one in.' : ''}
        </text>
      )}

      {/* rewrite trace */}
      <rect x={6} y={208} width={344} height={86} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={14} y={223} fontSize={10} fontWeight={700}>
        Rewrites
      </text>
      {f.trace.map((t, i) => (
        <text key={`${f.expr}-${i}`} x={14 + (i >= 5 ? 168 : 0)} y={238 + (i % 5) * 12} fontSize={10} fontWeight={i === f.trace.length - 1 ? 700 : 400} style={{ ...mono, whiteSpace: 'pre' }}>
          {i ? '→ ' : '  '}
          {t}
        </text>
      ))}

      {/* rule list */}
      <rect x={358} y={40} width={236} height={254} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={366} y={56} fontSize={10} fontWeight={700}>
        {f.ladder === 'loose' ? '== rules, checked top-down' : f.ladder === 'strict' ? '=== rules (no conversion)' : '+ and - rules'}
      </text>
      <rect
        x={362}
        y={0}
        width={228}
        height={RULE_H - 4}
        rx={5}
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth={2}
        style={{ transform: `translateY(${RULE_Y + Math.max(0, f.rule) * RULE_H}px)`, opacity: f.rule >= 0 ? 1 : 0, transition: ease }}
      />
      {rules.map((r, i) => {
        const [cond, act] = r.split(' → ');
        const skipped = f.skipped.includes(i);
        return (
          <g key={`${f.ladder}-${i}`} style={{ opacity: skipped ? 0.45 : 1, transition: 'opacity 0.35s' }}>
            <text x={370} y={RULE_Y + i * RULE_H + 12} fontSize={9.5} fontWeight={i === f.rule ? 700 : 500}>
              {i + 1}. {cond}
            </text>
            <text x={382} y={RULE_Y + i * RULE_H + 24} fontSize={9} style={mono} className="viz-label">
              → {act}
            </text>
            <text x={584} y={RULE_Y + i * RULE_H + 18} textAnchor="end" fontSize={11} fontWeight={700} style={{ fill: skipped ? 'var(--muted)' : 'var(--accent)', opacity: skipped || i === f.rule ? 1 : 0 }}>
              {skipped ? '✗' : '✓'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function JsCoercionViz() {
  const [params, setParams] = useState<Params>({ group: 'strnum', op: '==' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const g = GROUPS[params.group];
  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<GroupId>
            label="Expressions"
            value={params.group}
            options={(Object.keys(GROUPS) as GroupId[]).map((k) => ({ value: k, label: GROUPS[k].label }))}
            onChange={(group) => setParams({ ...params, group })}
          />
          {!g.arithmetic && (
            <Choice<Op>
              label="Operator"
              value={params.op}
              options={[
                { value: '==', label: '== (loose)' },
                { value: '===', label: '=== (strict)' },
              ]}
              onChange={(op) => setParams({ ...params, op })}
            />
          )}
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> string
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> number
          <span className="viz-key" style={{ background: 'var(--good)' }} /> boolean
          <span className="viz-key" style={{ background: 'var(--text-2)' }} /> object
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> null / undefined
        </>
      }
    >
      <MachineView f={stepper.frame} p={params} />
    </VizFrame>
  );
}
