import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { CHANGES, SPECS, simulate, type Change, type Params, type Pom, type SpecState } from './sim';

const ease = 'transform 0.55s ease, fill 0.35s ease, stroke 0.35s ease, opacity 0.4s ease, width 0.5s ease';
const SPEC_FILL: Record<SpecState, string> = { pass: 'var(--good-soft)', fail: 'var(--bad-soft)', idle: 'var(--surface-2)', edited: 'var(--warn-soft)' };
const SPEC_STROKE: Record<SpecState, string> = { pass: 'var(--good)', fail: 'var(--bad)', idle: 'var(--border)', edited: 'var(--warn)' };
const SPEC_TAG: Record<SpecState, string> = { pass: '✓ pass', fail: '✗ fail', idle: 'not run', edited: 'edited' };
const SHORT_LOC = ['#user-name', '#password', "button 'Login'"];
const SHORT: Record<Change, { before: string; after: string }> = {
  rename: { before: "button 'Login'", after: "button 'Sign in'" },
  id: { before: '#user-name', after: "placeholder 'Username'" },
  mfa: { before: '(no OTP step)', after: '+ OTP step' },
};
const rowY = (k: number) => 64 + k * 44;
const chipY = (j: number) => 124 + j * 42;
// DOM element y centres: username, password, button, mfa box
const DOM_Y = [118, 150, 186, 250];

export default function PomRippleViz() {
  const [params, setParams] = useState<Params>({ pom: 'off', change: 'rename' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const on = params.pom === 'on';
  const c = CHANGES[params.change];
  const sh = SHORT[params.change];
  const dom = f.uiChanged ? c.dom : { userId: 'user-name', button: 'Login', mfa: false };
  const domTarget = c.broken === -1 ? 3 : c.broken;
  const brokenOn = f.uiChanged && !f.poFixed;
  const pencilAt = f.pencil === 6 ? { x: 300, y: 118 } : f.pencil >= 0 ? { x: 130, y: rowY(f.pencil) + 4 } : { x: 300, y: 20 };
  const fails = f.specs.filter((s) => s === 'fail').length;
  const passes = f.specs.filter((s) => s === 'pass').length;

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Pom>
            label="Page Object Model"
            value={params.pom}
            options={[
              { value: 'off', label: 'off: selectors in every spec' },
              { value: 'on', label: 'on: LoginPage' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, pom: v }))}
          />
          <Choice<Change>
            label="UI change"
            value={params.change}
            options={[
              { value: 'rename', label: 'button renamed' },
              { value: 'id', label: 'field id changed' },
              { value: 'mfa', label: 'new MFA step' },
            ]}
            onChange={(v) => setParams((p) => ({ ...p, change: v }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> passing / working link
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> broken by the UI change
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> edited by hand
        </>
      }
    >
      <svg viewBox="0 0 600 340" className="viz-svg" role="img" aria-label={`${on ? 'With' : 'Without'} POM: ${passes} specs pass, ${fails} fail; ${f.edits} edits so far (${f.lines} lines).`}>
        {/* edit counter */}
        <text x={8} y={22} fontSize={11.5} fontWeight={700}>
          edits: {f.edits} · lines changed: {f.lines} · files touched: {f.edits}
        </text>
        <rect x={300} y={11} width={292} height={14} rx={7} fill="var(--surface-2)" stroke="var(--border)" />
        <rect x={300} y={11} width={(292 * f.edits) / 6} height={14} rx={7} fill={on ? 'var(--good)' : 'var(--warn)'} style={{ transition: ease }} />
        {['specs', 'page object', 'locators', 'DOM'].map((h, i) => (
          <text key={h} x={[8, 182, 350, 510][i]} y={52} fontSize={10} fontWeight={700} style={{ fill: 'var(--text-2)' }}>
            {h}
          </text>
        ))}

        {/* arrows */}
        {SPECS.map((_, k) => {
          const y = rowY(k) + 17;
          const fixed = on ? f.poFixed : f.fixedSpecs[k];
          const bad = f.uiChanged && !fixed;
          const col = bad ? 'var(--bad)' : 'var(--border)';
          return on ? (
            <line key={k} x1={148} y1={y} x2={182} y2={190} stroke="var(--border)" strokeWidth={1.2} />
          ) : (
            <g key={k}>
              <line x1={148} y1={y} x2={350} y2={y} stroke={col} strokeWidth={1.2} strokeDasharray="3 3" style={{ transition: ease }} />
              <line x1={486} y1={y} x2={510} y2={DOM_Y[domTarget]} stroke={col} strokeWidth={1} opacity={0.7} style={{ transition: ease }} />
            </g>
          );
        })}
        {on &&
          [0, 1, 2].map((j) => {
            const bad = brokenOn && c.broken === j;
            return (
              <g key={j}>
                <line x1={322} y1={190} x2={350} y2={chipY(j) + 15} stroke="var(--border)" />
                <line x1={486} y1={chipY(j) + 15} x2={510} y2={DOM_Y[j]} stroke={bad ? 'var(--bad)' : 'var(--good)'} strokeWidth={bad ? 2 : 1.2} style={{ transition: ease }} />
              </g>
            );
          })}

        {/* specs */}
        {SPECS.map((name, k) => {
          const st = f.specs[k];
          return (
            <g key={name}>
              <rect x={8} y={rowY(k)} width={140} height={34} rx={6} fill={SPEC_FILL[st]} stroke={SPEC_STROKE[st]} strokeWidth={f.focus === k ? 2.5 : 1.2} style={{ transition: ease }} />
              <text x={16} y={rowY(k) + 14} fontSize={10} fontWeight={700} style={{ fontFamily: 'var(--mono)' }}>
                {name}
              </text>
              <text x={16} y={rowY(k) + 27} fontSize={8.5} style={{ fill: 'var(--text-2)', fontFamily: 'var(--mono)' }}>
                {on ? 'loginPage.login()' : 'fill · fill · click'}
              </text>
              <text x={142} y={rowY(k) + 27} textAnchor="end" fontSize={8.5} fontWeight={700} style={{ fill: SPEC_STROKE[st] }}>
                {SPEC_TAG[st]}
              </text>
            </g>
          );
        })}

        {/* page object */}
        {on ? (
          <g>
            <rect x={182} y={110} width={140} height={160} rx={8} fill={f.poFixed ? 'var(--warn-soft)' : 'var(--accent-soft)'} stroke={f.focus === 6 ? 'var(--warn)' : 'var(--accent)'} strokeWidth={f.focus === 6 ? 2.5 : 1.5} style={{ transition: ease }} />
            <text x={192} y={130} fontSize={11} fontWeight={700} style={{ fontFamily: 'var(--mono)' }}>
              LoginPage.ts
            </text>
            {['login(user, pass) {', '\u00a0\u00a0username.fill(user)', '\u00a0\u00a0password.fill(pass)', '\u00a0\u00a0loginButton.click()'].map((l, i) => (
              <text key={i} x={192} y={152 + i * 16} fontSize={9} style={{ fontFamily: 'var(--mono)', fill: 'var(--text-2)' }}>
                {l}
              </text>
            ))}
            <text x={192} y={216} fontSize={9} style={{ fontFamily: 'var(--mono)', fill: 'var(--warn)', opacity: params.change === 'mfa' && f.poFixed ? 1 : 0, transition: ease }}>
              {'\u00a0\u00a0otp.fill(code); verify'}
            </text>
            <text x={192} y={232} fontSize={9} style={{ fontFamily: 'var(--mono)', fill: 'var(--text-2)' }}>
              {'}'}
            </text>
            <text x={252} y={258} textAnchor="middle" fontSize={8.5} style={{ fill: 'var(--text-2)' }}>
              used by all 6 specs
            </text>
          </g>
        ) : (
          <g>
            <rect x={182} y={110} width={140} height={160} rx={8} fill="none" stroke="var(--border)" strokeDasharray="5 4" />
            <text x={252} y={186} textAnchor="middle" fontSize={9.5} style={{ fill: 'var(--muted)' }}>
              no page object:
            </text>
            <text x={252} y={200} textAnchor="middle" fontSize={9.5} style={{ fill: 'var(--muted)' }}>
              each spec has its own copy
            </text>
          </g>
        )}

        {/* locators */}
        {on
          ? [0, 1, 2, 3].map((j) => {
              const isTarget = c.broken === j || (j === 3 && c.broken === -1);
              if (j === 3 && params.change !== 'mfa') return null;
              const bad = brokenOn && isTarget;
              const fixed = f.poFixed && isTarget;
              const label = j === 3 ? (fixed ? sh.after : sh.before) : fixed ? sh.after : SHORT_LOC[j];
              return (
                <g key={j}>
                  <rect x={350} y={chipY(j)} width={136} height={30} rx={15} fill={bad ? 'var(--bad-soft)' : fixed ? 'var(--warn-soft)' : 'var(--surface-2)'} stroke={bad ? 'var(--bad)' : fixed ? 'var(--warn)' : 'var(--border)'} strokeDasharray={j === 3 && !fixed ? '4 3' : undefined} style={{ transition: ease }} />
                  <text x={418} y={chipY(j) + 19} textAnchor="middle" fontSize={9} style={{ fontFamily: 'var(--mono)' }}>
                    {label}
                  </text>
                </g>
              );
            })
          : SPECS.map((_, k) => {
              const fixed = f.fixedSpecs[k];
              const bad = f.uiChanged && !fixed;
              return (
                <g key={k}>
                  <rect x={350} y={rowY(k) + 4} width={136} height={26} rx={13} fill={bad ? 'var(--bad-soft)' : fixed ? 'var(--warn-soft)' : 'var(--surface-2)'} stroke={bad ? 'var(--bad)' : fixed ? 'var(--warn)' : 'var(--border)'} style={{ transition: ease }} />
                  <text x={418} y={rowY(k) + 21} textAnchor="middle" fontSize={9} style={{ fontFamily: 'var(--mono)' }}>
                    {fixed ? sh.after : sh.before}
                  </text>
                </g>
              );
            })}

        {/* DOM */}
        <rect x={510} y={96} width={84} height={dom.mfa ? 180 : 116} rx={7} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} style={{ transition: ease }} />
        <rect x={518} y={108} width={68} height={20} rx={3} fill="var(--surface-2)" stroke={f.uiChanged && c.broken === 0 ? 'var(--warn)' : 'var(--border)'} />
        <text x={522} y={122} fontSize={8} style={{ fontFamily: 'var(--mono)', fill: 'var(--text-2)' }}>
          #{dom.userId}
        </text>
        <rect x={518} y={140} width={68} height={20} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
        <text x={522} y={154} fontSize={8} style={{ fontFamily: 'var(--mono)', fill: 'var(--text-2)' }}>
          #password
        </text>
        <rect x={518} y={174} width={68} height={24} rx={5} fill="var(--accent)" stroke={f.uiChanged && c.broken === 2 ? 'var(--warn)' : 'none'} strokeWidth={2} />
        <text x={552} y={190} textAnchor="middle" fontSize={10} fontWeight={700} style={{ fill: 'var(--surface)' }}>
          {dom.button}
        </text>
        <g style={{ opacity: dom.mfa ? 1 : 0, transition: ease }}>
          <text x={552} y={226} textAnchor="middle" fontSize={8} style={{ fill: 'var(--warn)' }}>
            then /mfa:
          </text>
          <rect x={518} y={238} width={68} height={22} rx={3} fill="var(--warn-soft)" stroke="var(--warn)" />
          <text x={552} y={253} textAnchor="middle" fontSize={8}>
            one-time code
          </text>
        </g>

        {/* error + pencil */}
        <text x={182} y={334} fontSize={9} style={{ fill: 'var(--bad)', opacity: f.error && fails ? 1 : 0, transition: ease }}>
          {f.error && f.error.length > 74 ? `${f.error.slice(0, 73)}…` : f.error}
        </text>
        <g style={{ transform: `translate(${pencilAt.x}px, ${pencilAt.y}px)`, opacity: f.pencil >= 0 ? 1 : 0, transition: ease }}>
          <circle r={10} fill="var(--warn)" />
          <text y={4} textAnchor="middle" fontSize={11} style={{ fill: 'var(--surface)' }}>
            ✎
          </text>
        </g>
      </svg>
    </VizFrame>
  );
}
