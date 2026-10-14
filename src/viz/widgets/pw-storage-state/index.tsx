import { useState } from 'react';
import { Choice, Slider, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { BODY_S, FILES, LOGIN_S, roleOf, simulate, type FileState, type Params, type TState, type Toggle } from './sim';

const ease = 'transform 0.6s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease, width 0.55s ease';
const T_FILL: Record<TState, string> = { idle: 'var(--surface-2)', pass: 'var(--good)', fail: 'var(--bad)' };
const F_FILL: Record<FileState, string> = { none: 'none', fresh: 'var(--good-soft)', stale: 'var(--warn-soft)' };
const F_STROKE: Record<FileState, string> = { none: 'var(--border)', fresh: 'var(--good)', stale: 'var(--warn)' };
const CONFIG = [
  'projects: [',
  "  { name: 'setup', testMatch: /.*\\.setup\\.ts/ },",
  "  { name: 'chromium', dependencies: ['setup'],",
  "    use: { storageState: 'playwright/.auth/user.json' } },",
  ']',
];
const BAR_X = 150;
const BAR_W = 440;

export default function PwStorageStateViz() {
  const [params, setParams] = useState<Params>({ tests: 12, roles: 1, expire: 'off' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const { tests: N, roles } = params;
  const maxT = N * (LOGIN_S + BODY_S);
  const w = (sec: number) => (BAR_W * sec) / maxT;
  const cols = 10;
  const cell = N > 30 ? 18 : 20;
  const gx = (k: number) => 360 + (k % cols) * (cell + 3);
  const gy = (k: number) => 64 + Math.floor(k / cols) * (cell + 3);
  const passed = f.tests.filter((t) => t === 'pass').length;
  const failed = f.tests.filter((t) => t === 'fail').length;
  const tokenTo = f.token ? { x: 470, y: 110 } : { x: 262, y: 57 };
  const setupOn = f.phase === 'setup' || f.phase === 'saved';

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Slider label="Tests" value={N} min={5} max={50} onChange={(v) => setParams((p) => ({ ...p, tests: v }))} />
          <Choice<'1' | '2'>
            label="Roles"
            value={String(roles) as '1' | '2'}
            options={[
              { value: '1', label: '1: user' },
              { value: '2', label: '2: admin + user' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, roles: Number(v) }))}
          />
          <Choice<Toggle>
            label="Session expired"
            value={params.expire}
            options={[
              { value: 'off', label: 'no' },
              { value: 'on', label: 'yes (stale file)' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, expire: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> test passed / fresh state
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> redirected to /login
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> stale file / UI login time
          <span className="viz-key" style={{ background: 'var(--accent)' }} /> admin-role test
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`${passed} of ${N} tests passed, ${failed} failed. UI login per test: ${f.uiLogins} logins, ${f.uiTime} s. storageState: ${f.ssLogins} logins, ${f.ssTime} s.`}
      >
        {/* setup project */}
        <rect x={8} y={30} width={160} height={74} rx={8} fill={setupOn ? 'var(--accent-soft)' : f.phase === 'skip' ? 'var(--surface-2)' : 'var(--surface)'} stroke={setupOn ? 'var(--accent)' : 'var(--border)'} strokeWidth={1.5} strokeDasharray={f.phase === 'skip' ? '5 4' : undefined} style={{ transition: ease }} />
        <text x={18} y={48} fontSize={11} fontWeight={700}>
          setup project
        </text>
        <text x={18} y={64} fontSize={9.5} style={{ fontFamily: 'var(--mono)', fill: 'var(--text-2)' }}>
          auth.setup.ts
        </text>
        <text x={18} y={82} fontSize={9.5} style={{ fill: f.phase === 'skip' ? 'var(--warn)' : setupOn ? 'var(--accent)' : 'var(--muted)' }}>
          {f.phase === 'skip' ? 'skipped (--no-deps)' : f.setupActive >= 0 ? `UI login: ${f.setupActive ? 'admin' : 'user'}…` : setupOn ? 'login → wait → save' : 'waits to run first'}
        </text>
        <text x={18} y={97} fontSize={9} style={{ fill: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
          {f.url && setupOn ? f.url : ''}
        </text>
        <line x1={168} y1={67} x2={196} y2={67} className="viz-edge" />

        {/* state files */}
        <text x={196} y={24} fontSize={9.5} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
          playwright/.auth/
        </text>
        {FILES.slice(0, roles).map((name, r) => (
          <g key={name}>
            <rect x={196} y={32 + r * 36} width={132} height={28} rx={5} fill={F_FILL[f.files[r]]} stroke={F_STROKE[f.files[r]]} strokeDasharray={f.files[r] === 'none' ? '4 3' : undefined} strokeWidth={1.5} style={{ transition: ease }} />
            <text x={206} y={50 + r * 36} fontSize={10} style={{ fontFamily: 'var(--mono)', fill: f.files[r] === 'none' ? 'var(--muted)' : 'var(--text)' }}>
              {name} {f.files[r] === 'stale' ? '(expired)' : f.files[r] === 'fresh' ? '✓' : ''}
            </text>
          </g>
        ))}
        <line x1={328} y1={67} x2={350} y2={67} className="viz-edge" />
        <g style={{ transform: `translate(${tokenTo.x}px, ${tokenTo.y}px)`, opacity: f.token ? 1 : 0, transition: ease }}>
          <rect x={-14} y={-9} width={28} height={18} rx={3} fill={f.url === '/login' ? 'var(--warn)' : 'var(--good)'} />
          <text y={4} textAnchor="middle" fontSize={8} fontWeight={700} style={{ fill: 'var(--surface)' }}>
            JSON
          </text>
        </g>

        {/* testing project */}
        <rect x={350} y={30} width={242} height={186} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />
        <text x={360} y={48} fontSize={10.5} fontWeight={700}>
          chromium · dependencies: [&apos;setup&apos;]
        </text>
        {f.tests.map((t, k) => {
          const admin = roleOf(k, N, roles) === 1;
          return (
            <g key={k}>
              <rect x={gx(k)} y={gy(k)} width={cell} height={cell} rx={4} fill={T_FILL[t]} stroke={admin ? 'var(--accent)' : 'var(--border)'} strokeWidth={admin ? 2 : 1} style={{ transition: ease }} />
              {admin && (
                <text x={gx(k) + cell / 2} y={gy(k) + cell / 2 + 3} textAnchor="middle" fontSize={8} fontWeight={700} style={{ fill: t === 'idle' ? 'var(--accent)' : 'var(--surface)' }}>
                  A
                </text>
              )}
            </g>
          );
        })}
        <text x={360} y={208} fontSize={10} style={{ fill: failed ? 'var(--bad)' : 'var(--text-2)' }}>
          {passed} passed · {failed} failed{f.url === '/login' ? ' · landed on /login' : ''}
        </text>

        {/* config */}
        <rect x={8} y={118} width={330} height={CONFIG.length * 15 + 10} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
        {CONFIG.map((l, i) => (
          <text key={i} x={14} y={133 + i * 15} fontSize={9} style={{ fontFamily: 'var(--mono)', fill: i === 0 || i === 4 ? 'var(--text-2)' : 'var(--text)' }}>
            {l.replace(/^ +/, (m) => '\u00a0'.repeat(m.length))}
          </text>
        ))}

        {/* time bars */}
        <text x={8} y={244} fontSize={10.5} fontWeight={700}>
          time spent (sum over tests)
        </text>
        {[
          { label: 'UI login every test', t: f.uiTime, logins: f.uiLogins, fill: 'var(--warn)', y: 256 },
          { label: 'storageState', t: f.ssTime, logins: f.ssLogins, fill: 'var(--good)', y: 290 },
        ].map((b) => (
          <g key={b.label}>
            <text x={8} y={b.y + 13} fontSize={10}>
              {b.label}
            </text>
            <rect x={BAR_X} y={b.y} width={BAR_W} height={18} rx={4} fill="var(--surface-2)" stroke="var(--border)" />
            <rect x={BAR_X} y={b.y} width={w(b.t)} height={18} rx={4} fill={b.fill} style={{ transition: ease }} />
            <text x={BAR_X + 6} y={b.y + 31} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
              {b.t} s · {b.logins} login{b.logins === 1 ? '' : 's'}
            </text>
          </g>
        ))}
        <rect x={BAR_X + w(f.ssTime)} y={290} width={w(f.ssWasted)} height={18} rx={4} fill="var(--bad)" opacity={0.6} style={{ transition: ease }} />
        <text x={BAR_X + BAR_W} y={334} textAnchor="end" fontSize={9} style={{ fill: 'var(--bad)', opacity: f.ssWasted ? 1 : 0 }}>
          red: {f.ssWasted} s wasted on tests that hit /login
        </text>
      </svg>
    </VizFrame>
  );
}
