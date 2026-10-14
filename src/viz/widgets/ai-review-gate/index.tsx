import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { HEADER, simulate, type CheckState, type Line, type Mode, type Params, type Review, type Tone } from './sim';

const T = 'opacity 0.4s ease, transform 0.45s ease, fill 0.35s ease, stroke 0.35s ease';
const TONE: Record<Tone, { c: string; soft: string }> = {
  good: { c: 'var(--good)', soft: 'var(--good-soft)' },
  warn: { c: 'var(--warn)', soft: 'var(--warn-soft)' },
  bad: { c: 'var(--bad)', soft: 'var(--bad-soft)' },
};
const STATE: Record<CheckState, { mark: string; c: string; soft: string; text: string }> = {
  todo: { mark: '○', c: 'var(--muted)', soft: 'none', text: 'not run yet' },
  run: { mark: '◉', c: 'var(--accent)', soft: 'var(--accent-soft)', text: 'checking…' },
  flag: { mark: '⚑', c: 'var(--bad)', soft: 'var(--bad-soft)', text: 'problems found' },
  ok: { mark: '✓', c: 'var(--good)', soft: 'var(--good-soft)', text: 'clean' },
  skip: { mark: '–', c: 'var(--muted)', soft: 'none', text: 'skipped' },
};
const PANEL_W = 424;
const TOP = 44;

function lineStyle(l: Line) {
  if (l.flag) return TONE[l.flag];
  if (l.tag === '+' || l.tag === '~') return TONE.good;
  if (l.tag === '?') return TONE.warn;
  return null;
}

function wrap(s: string, max: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of s.split(' ')) {
    if ((cur + ' ' + w).trim().length > max) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}

export default function AiReviewGateViz() {
  const [params, setParams] = useState<Params>({ mode: 'cases', review: 'review' });
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const code = params.mode === 'script';
  const row = Math.min(17, 228 / f.lines.length);
  const longest = Math.max(...f.lines.map((l) => l.text.length));
  const fs = code ? (longest > 72 ? 7.6 : 8.6) : 9.2;
  const flagged = f.lines.filter((l) => l.flag).length;
  const bottom = f.phase === 'prod' ? f.escapes.map((e) => ({ text: e, tone: 'bad' as Tone })) : f.notes;
  const bottomLines = bottom.flatMap((n) => wrap(n.text, 104).map((t, k) => ({ t, tone: n.tone, first: k === 0 })));

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Mode>
            label="AI draft"
            value={params.mode}
            options={[
              { value: 'cases', label: '8 test cases for a story' },
              { value: 'script', label: 'Playwright script' },
            ]}
            onChange={(mode) => setParams((p) => ({ ...p, mode }))}
          />
          <Choice<Review>
            label="Tester"
            value={params.review}
            options={[
              { value: 'review', label: 'runs the review checklist' },
              { value: 'accept', label: 'accepts without review' },
            ]}
            onChange={(review) => setParams((p) => ({ ...p, review }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> must fix
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> fix or ask
          <span className="viz-key" style={{ background: 'var(--good)' }} /> added / rewritten by the tester
        </>
      }
    >
      <svg
        viewBox="0 0 600 360"
        className="viz-svg"
        role="img"
        aria-label={`${f.phase === 'fixed' ? 'Reviewed version' : 'AI draft'}: ${f.shown} of ${f.lines.length} lines shown, ${flagged} flagged. Checklist: ${f.checks.map((c) => `${c.label} ${STATE[c.state].text}`).join('; ')}.${f.escapes.length ? ` Escaped to production: ${f.escapes.join(' ')}` : ''}`}
      >
        <text x={6} y={14} fontSize={9.5} style={{ fill: 'var(--text-2)' }}>
          {HEADER[params.mode]}
        </text>

        {/* draft / reviewed panel */}
        <rect x={4} y={22} width={PANEL_W} height={254} rx={6} fill={f.phase === 'fixed' ? 'var(--good-soft)' : 'var(--surface-2)'} stroke={f.phase === 'prod' ? 'var(--bad)' : 'var(--border)'} style={{ transition: T }} />
        <text x={12} y={36} fontSize={9.5} fontWeight={700} style={{ fill: f.phase === 'fixed' ? 'var(--good)' : 'var(--text)' }}>
          {f.phase === 'fixed' ? 'Reviewed version (tester-owned)' : f.phase === 'prod' ? 'AI draft, shipped unreviewed' : 'AI draft'}
        </text>
        {f.lines.map((l, i) => {
          const y = TOP + i * row;
          const st = lineStyle(l);
          const on = i < f.shown;
          return (
            <g key={`${f.phase === 'fixed' ? 'r' : 'd'}${i}`} style={{ transform: `translate(${on ? 0 : -14}px, ${y}px)`, opacity: on ? 1 : 0, transition: T }}>
              <rect x={8} y={0} width={PANEL_W - 8} height={row - 2} rx={3} fill={st ? st.soft : 'var(--surface)'} stroke={st ? st.c : 'none'} style={{ transition: T }} />
              <text x={14} y={row - 6} fontSize={8} style={{ fill: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                {l.tag ?? (code ? i + 1 : '')}
              </text>
              <text x={30} y={row - 6} fontSize={fs} style={{ fill: 'var(--text)', fontFamily: code ? 'var(--mono)' : undefined }}>
                {l.text.replace(/^ +/, (m) => ' '.repeat(m.length))}
              </text>
              {l.flag && (
                <text x={PANEL_W - 4} y={row - 6} textAnchor="end" fontSize={9} fontWeight={700} style={{ fill: TONE[l.flag].c }}>
                  {l.flag === 'bad' ? '✗' : '!'}
                </text>
              )}
            </g>
          );
        })}

        {/* checklist */}
        <rect x={434} y={22} width={162} height={254} rx={6} fill="var(--surface)" stroke="var(--border)" />
        <text x={442} y={36} fontSize={9.5} fontWeight={700}>
          Review checklist
        </text>
        {f.checks.map((c, i) => {
          const st = STATE[c.state];
          const y = TOP + i * 36;
          return (
            <g key={c.label}>
              <rect x={438} y={y} width={154} height={32} rx={5} fill={st.soft} stroke={c.state === 'todo' || c.state === 'skip' ? 'var(--border)' : st.c} style={{ transition: T }} />
              <text x={446} y={y + 14} fontSize={10} fontWeight={700} style={{ fill: st.c, transition: T }}>
                {st.mark}
              </text>
              <text x={460} y={y + 14} fontSize={9} style={{ fill: c.state === 'skip' ? 'var(--muted)' : 'var(--text)', textDecoration: c.state === 'skip' ? 'line-through' : undefined }}>
                {c.label}
              </text>
              <text x={460} y={y + 26} fontSize={8} style={{ fill: st.c }}>
                {st.text}
              </text>
            </g>
          );
        })}

        {/* findings / escapes */}
        <rect x={4} y={282} width={592} height={74} rx={6} fill={f.phase === 'prod' && f.escapes.length ? 'var(--bad-soft)' : 'none'} stroke={f.phase === 'prod' ? 'var(--bad)' : 'var(--border)'} strokeDasharray={bottom.length ? undefined : '4 3'} style={{ transition: T }} />
        <text x={12} y={295} fontSize={9} fontWeight={700} style={{ fill: f.phase === 'prod' ? 'var(--bad)' : 'var(--text-2)' }}>
          {f.phase === 'prod' ? 'In production (illustrative)' : 'Findings'}
        </text>
        {bottomLines.slice(0, 5).map((b, i) => (
          <text key={`${i}${b.t}`} x={12} y={306 + i * 11} fontSize={9} style={{ fill: 'var(--text)' }}>
            <tspan style={{ fill: TONE[b.tone].c }} fontWeight={700}>
              {b.first ? (b.tone === 'good' ? '✓ ' : b.tone === 'warn' ? '! ' : '✗ ') : '   '}
            </tspan>
            {b.t}
          </text>
        ))}
        {!bottom.length && (
          <text x={12} y={312} fontSize={9} style={{ fill: 'var(--muted)' }}>
            {f.phase === 'prod' ? 'Waiting for the first run…' : 'Each checklist question adds its findings here.'}
          </text>
        )}
      </svg>
    </VizFrame>
  );
}
