import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { CLICK_LINE, CODE, COMPARE_LINE, PRODUCTS, RERENDER_LINE, nodeId, simulate, type LocatorKind, type Mark, type Params, type Rerender } from './sim';

const SLOT_W = 99;
const BOX_W = 90;
const slotX = (i: number) => 9 + i * SLOT_W;
const ITEM_Y = 120;
const BTN_Y = 186;
const ease = 'fill 0.35s ease, stroke 0.35s ease, opacity 0.35s ease';

function markStyle(m: Mark): { fill: string; stroke: string; sw: number; op: number; dash?: string } {
  switch (m) {
    case 'scan':
      return { fill: 'var(--accent-soft)', stroke: 'var(--accent)', sw: 3, op: 1 };
    case 'match':
      return { fill: 'var(--good-soft)', stroke: 'var(--good)', sw: 2, op: 1 };
    case 'target':
      return { fill: 'var(--good-soft)', stroke: 'var(--good)', sw: 3.5, op: 1 };
    case 'reject':
      return { fill: 'var(--surface-2)', stroke: 'var(--border)', sw: 1.2, op: 0.45 };
    case 'wrong':
      return { fill: 'var(--warn-soft)', stroke: 'var(--warn)', sw: 3.5, op: 1 };
    case 'violation':
      return { fill: 'var(--bad-soft)', stroke: 'var(--bad)', sw: 2.5, op: 1 };
    case 'stale':
      return { fill: 'var(--bad-soft)', stroke: 'var(--bad)', sw: 2.5, op: 1, dash: '4 3' };
    default:
      return { fill: 'var(--surface-2)', stroke: 'var(--border)', sw: 1.2, op: 1 };
  }
}

export default function PwLocatorResolutionViz() {
  const [params, setParams] = useState<Params>({ locator: 'role', rerender: 'no' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const re = params.rerender === 'yes';

  const lines = [CODE[params.locator], ...(re ? [RERENDER_LINE] : []), CLICK_LINE, ...(params.locator === 'handle' ? [COMPARE_LINE] : [])];
  const codeH = lines.length * 14 + 10;

  // moving "query" token: follows the node being inspected
  const scanBtn = Object.keys(f.btnMark).find((s) => f.btnMark[s] === 'scan');
  const scanItem = Object.keys(f.itemMark).find((s) => f.itemMark[s] === 'scan');
  const scanSlug = scanBtn ?? scanItem;
  const tokenPos = scanSlug ? { x: slotX(f.order.indexOf(scanSlug)) + BOX_W - 6, y: scanBtn ? BTN_Y + 2 : ITEM_Y + 2 } : { x: 300, y: 96 };

  const statusColor = f.status === 'pass' ? 'var(--good)' : f.status === 'fail' ? 'var(--bad)' : f.status === 'warn' ? 'var(--warn)' : 'var(--accent)';
  const statusText =
    f.error ??
    (f.status === 'pass'
      ? 'clicked the right button'
      : f.status === 'warn'
        ? 'passed, but by luck (DOM order)'
        : f.status === 'running'
          ? 'resolving…'
          : f.count === null
            ? 'not resolved yet (lazy)'
            : 'ready');

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<LocatorKind>
            label="Locator"
            value={params.locator}
            options={[
              { value: 'role', label: 'Role only' },
              { value: 'filter', label: 'Filter by card' },
              { value: 'first', label: 'First match' },
              { value: 'testid', label: 'Test id' },
              { value: 'handle', label: 'ElementHandle' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, locator: v }))}
          />
          <Choice<Rerender>
            label="List re-renders before the click"
            value={params.rerender}
            options={[
              { value: 'no', label: 'no' },
              { value: 'yes', label: 'yes, sort Z→A' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, rerender: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> being inspected
          <span className="viz-key" style={{ background: 'var(--good)' }} /> matches
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> strict violation / stale
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> wrong element clicked
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`DOM generation ${f.gen}; ${f.count === null ? 'locator not resolved' : `${f.count} matching element(s)`}; ${statusText}; cart has ${f.cart.length} item(s).`}
      >
        {/* code */}
        <rect x={2} y={2} width={596} height={codeH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        {lines.map((ln, i) => (
          <g key={i}>
            <rect x={5} y={6 + i * 14} width={590} height={14} rx={3} fill={i === f.line ? 'var(--accent-soft)' : 'transparent'} style={{ transition: ease }} />
            <text x={10} y={17 + i * 14} fontSize={9.5} style={{ fontFamily: 'var(--mono)', fill: i === f.line ? 'var(--text)' : 'var(--text-2)' }}>
              {ln}
            </text>
          </g>
        ))}

        {/* DOM tree */}
        <rect x={240} y={84} width={120} height={20} rx={5} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={300} y={98} textAnchor="middle" fontSize={10} style={{ fontFamily: 'var(--mono)' }}>
          div.inventory_list
        </text>
        <line x1={slotX(0) + BOX_W / 2} y1={110} x2={slotX(5) + BOX_W / 2} y2={110} stroke="var(--muted)" strokeWidth={1.2} />
        <line x1={300} y1={104} x2={300} y2={110} stroke="var(--muted)" strokeWidth={1.2} />
        {PRODUCTS.map((p) => {
          const i = f.order.indexOf(p.slug);
          const im = markStyle(f.itemMark[p.slug]);
          const bm = markStyle(f.btnMark[p.slug]);
          return (
            <g key={p.slug} style={{ transform: `translateX(${slotX(i)}px)`, transition: 'transform 0.8s ease, opacity 0.4s ease', opacity: f.detached ? 0.35 : 1 }}>
              <line x1={BOX_W / 2} y1={110} x2={BOX_W / 2} y2={ITEM_Y} stroke="var(--muted)" strokeWidth={1.2} strokeDasharray={f.detached ? '3 3' : undefined} />
              <rect y={ITEM_Y} width={BOX_W} height={52} rx={6} fill={im.fill} stroke={f.detached ? 'var(--bad)' : im.stroke} strokeWidth={im.sw} strokeDasharray={f.detached ? '4 3' : im.dash} opacity={im.op} style={{ transition: ease }} />
              <text x={4} y={ITEM_Y + 12} fontSize={7.5} style={{ fill: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                .inventory_item #{nodeId(p.slug, f.gen, false)}
              </text>
              <text x={5} y={ITEM_Y + 28} fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
                {p.short[0]}
              </text>
              <text x={5} y={ITEM_Y + 42} fontSize={10} fontWeight={700}>
                {p.short[1]}
              </text>
              <line x1={BOX_W / 2} y1={ITEM_Y + 52} x2={BOX_W / 2} y2={BTN_Y} stroke="var(--muted)" strokeWidth={1.2} />
              <rect y={BTN_Y} width={BOX_W} height={34} rx={6} fill={bm.fill} stroke={f.detached ? 'var(--bad)' : bm.stroke} strokeWidth={bm.sw} strokeDasharray={f.detached ? '4 3' : bm.dash} opacity={bm.op} style={{ transition: ease }} />
              <text x={5} y={BTN_Y + 13} fontSize={8.5} style={{ fill: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                button #{nodeId(p.slug, f.gen, true)}
              </text>
              <text x={5} y={BTN_Y + 27} fontSize={10} fontWeight={600}>
                Add to cart
              </text>
            </g>
          );
        })}
        {f.detached && (
          <text x={300} y={240} textAnchor="middle" fontSize={11} fontWeight={700} style={{ fill: 'var(--bad)' }}>
            old nodes detached, list being rebuilt…
          </text>
        )}
        {/* query token */}
        <g style={{ transform: `translate(${tokenPos.x}px, ${tokenPos.y}px)`, transition: 'transform 0.45s ease', opacity: scanSlug ? 1 : 0 }}>
          <circle r={8} fill="var(--accent)" />
          <circle r={3.5} fill="none" stroke="var(--surface)" strokeWidth={1.6} cx={-1} cy={-1} />
          <line x1={1.5} y1={1.5} x2={4.5} y2={4.5} stroke="var(--surface)" strokeWidth={1.6} />
        </g>

        {/* result panel */}
        <rect x={2} y={252} width={596} height={86} rx={8} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={14} y={274} fontSize={11} style={{ fill: 'var(--text-2)' }}>
          {f.compare ? 'locator matches' : params.locator === 'handle' ? 'handle target' : 'matches'}
        </text>
        <text x={14} y={306} fontSize={28} fontWeight={800} style={{ fill: f.count === null ? 'var(--muted)' : f.count === 1 ? 'var(--good)' : 'var(--bad)', transition: ease }}>
          {f.count === null ? '–' : f.count}
        </text>
        <text x={14} y={326} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          {f.count === null ? 'nothing queried' : f.count === 1 ? 'exactly one: strict OK' : 'more than one'}
        </text>
        <text x={130} y={274} fontSize={12} fontWeight={700} style={{ fill: statusColor, transition: ease }}>
          {f.status === 'fail' ? '✗ ' : f.status === 'pass' ? '✓ ' : f.status === 'warn' ? '⚠ ' : ''}
          {statusText.length > 70 ? statusText.slice(0, 68) + '…' : statusText}
        </text>
        {f.handle && !f.compare && (
          <text x={130} y={296} fontSize={11} style={{ fontFamily: 'var(--mono)', fill: f.handle.attached ? 'var(--text)' : 'var(--bad)' }}>
            add → ElementHandle(button #{nodeId(f.handle.slug, f.handle.gen, true)}) · {f.handle.attached ? 'attached' : 'DETACHED'}
          </text>
        )}
        {!f.handle && params.locator !== 'handle' && (
          <text x={130} y={296} fontSize={11} style={{ fill: 'var(--text-2)' }}>
            add = Locator (a recipe; re-resolved on every action) · DOM generation {f.gen}
          </text>
        )}
        {/* cart */}
        <g transform="translate(130, 306)">
          <path d="M0,4 L5,4 L9,20 L26,20 L30,9 L7,9" fill="none" stroke="var(--text-2)" strokeWidth={1.8} strokeLinejoin="round" />
          <circle cx={12} cy={25} r={2.2} fill="var(--text-2)" />
          <circle cx={24} cy={25} r={2.2} fill="var(--text-2)" />
          <g style={{ opacity: f.cart.length ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <circle cx={30} cy={2} r={8} fill={f.status === 'fail' ? 'var(--warn)' : 'var(--bad)'} />
            <text x={30} y={6} textAnchor="middle" fontSize={10} fontWeight={700} style={{ fill: 'var(--surface)' }}>
              {f.cart.length}
            </text>
          </g>
          <text x={46} y={20} fontSize={11} style={{ fill: f.cart.length ? 'var(--text)' : 'var(--muted)' }}>
            {f.cart.length ? `cart: ${f.cart.join(', ')}` : 'cart: empty'}
          </text>
        </g>
      </svg>
    </VizFrame>
  );
}
