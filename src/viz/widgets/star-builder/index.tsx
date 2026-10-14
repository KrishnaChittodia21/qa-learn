import { useState } from 'react';
import { Choice, VizFrame, useFrames, useSimulation } from '../../core';
import { meta } from './meta';
import { DEFAULT_PARAMS, KEYS, PART_NAME, STORIES, TARGET, parse, simulate, type Params, type PartKey, type Quality, type SegKind, type Story } from './sim';

const TX = 34;
const MAXC = 74;
const LH = 12.5;
const BX = [458, 528];
const BW = 52;
const BY = 44;
const PX = 1.9; // px per second
const PART_C: Record<PartKey, string> = { S: 'var(--muted)', T: 'var(--text-2)', A: 'var(--accent)', R: 'var(--good)', L: 'var(--warn)' };
const KIND_C: Record<SegKind, string> = { '': 'var(--text)', v: 'var(--bad)', s: 'var(--good)', w: 'var(--warn)' };

type Word = { t: string; k: SegKind };
/** word-wrap segmented text, keeping each word's highlight kind */
function wrapSegs(text: string): Word[][] {
  const words: Word[] = parse(text).flatMap(([t, k]) => t.split(/(?<= )/).filter(Boolean).map((w) => ({ t: w, k })));
  const lines: Word[][] = [[]];
  let len = 0;
  for (const w of words) {
    if (len + w.t.length > MAXC && len > 0) {
      lines.push([]);
      len = 0;
    }
    lines[lines.length - 1].push(w);
    len += w.t.length;
  }
  return lines;
}

export default function StarBuilderViz() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const frames = useSimulation(simulate, params);
  const stepper = useFrames(frames);
  const f = stepper.frame;
  const story = STORIES[params.story];
  const partOf = (k: PartKey) => (f.fixed.includes(k) ? story.strong : story[params.quality])[KEYS.indexOf(k)];

  const measured = KEYS.map((k, i) => {
    const part = partOf(k);
    const n = f.shown[i];
    const lines = n ? wrapSegs(part.sentences.slice(0, n).join(' ')) : [];
    return { k, part, lines, h: 18 + Math.max(1, lines.length) * LH, n, fixed: f.fixed.includes(k) };
  });
  // stack the blocks: each starts 5px below the previous one
  const blocks = measured.map((b, i) => ({ ...b, top: 8 + measured.slice(0, i).reduce((acc, x) => acc + x.h + 5, 0) }));

  // spoken seconds per part so far
  const spoken = KEYS.map((k, i) => {
    const part = partOf(k);
    return part.sentences.length ? (part.secs * f.shown[i]) / part.sentences.length : 0;
  });
  const bar = (secs: number[], x: number, on: boolean) => {
    let acc = 0;
    return KEYS.map((k, i) => {
      const top = BY + acc * PX;
      acc += secs[i];
      return (
        <g key={k} opacity={on ? 1 : 0.3} style={{ transition: 'opacity 0.4s ease' }}>
          <rect x={x} y={top} width={BW} height={Math.max(0, secs[i] * PX)} fill={PART_C[k]} stroke="var(--surface-2)" style={{ transition: 'height 0.5s ease, y 0.5s ease' }} />
          {secs[i] * PX >= 13 && (
            <text x={x + BW / 2} y={top + secs[i] * PX / 2 + 4} textAnchor="middle" fontSize={9.5} fontWeight={700} style={{ fill: 'var(--surface-2)' }}>
              {k} {Math.round(secs[i])}s
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <VizFrame
      title={meta.title}
      blurb={meta.blurb}
      stepper={stepper}
      controls={
        <>
          <Choice<Story>
            label="Story"
            value={params.story}
            options={[
              { value: 'missed', label: 'bug missed in production' },
              { value: 'conflict', label: 'conflict with a developer' },
              { value: 'deadline', label: 'deadline pressure' },
            ]}
            onChange={(s) => setParams((p) => ({ ...p, story: s }))}
          />
          <Choice<Quality>
            label="Answer"
            value={params.quality}
            options={[
              { value: 'weak', label: 'weak' },
              { value: 'strong', label: 'strong' },
            ]}
            onChange={(quality) => setParams((p) => ({ ...p, quality }))}
          />
        </>
      }
      legend={
        <>
          <span className="viz-key" style={{ background: 'var(--good)' }} /> specific / checkable
          <span className="viz-key" style={{ background: 'var(--bad)' }} /> vague
          <span className="viz-key" style={{ background: 'var(--warn)' }} /> "we" where "I" is needed
        </>
      }
    >
      <svg
        viewBox="0 0 600 340"
        className="viz-svg"
        role="img"
        aria-label={`STAR answer, ${params.quality} version: ${KEYS.filter((_, i) => f.shown[i]).map((k) => PART_NAME[k]).join(', ') || 'nothing yet'} spoken, ${Math.round(f.elapsed)} seconds.${f.verdict ? ' ' + f.verdict + '.' : ''}`}
      >
        {blocks.map((b) => {
          const on = b.n > 0;
          const focus = f.focus === b.k;
          return (
            <g key={b.k}>
              <rect x={4} y={b.top} width={436} height={b.h} rx={7} fill={focus ? 'var(--accent-soft)' : 'var(--surface-2)'} stroke={b.fixed ? 'var(--good)' : focus ? 'var(--accent)' : 'var(--border)'} strokeDasharray={on || b.part.sentences.length ? undefined : '4 3'} style={{ transition: 'fill 0.35s ease, stroke 0.35s ease' }} />
              <circle cx={19} cy={b.top + 13} r={9} fill={on ? PART_C[b.k] : 'var(--surface-2)'} stroke={PART_C[b.k]} style={{ transition: 'fill 0.35s ease' }} />
              <text x={19} y={b.top + 16.5} textAnchor="middle" fontSize={10} fontWeight={700} style={{ fill: on ? 'var(--surface-2)' : PART_C[b.k] }}>
                {b.k}
              </text>
              <text x={TX} y={b.top + 14} fontSize={10} fontWeight={700}>
                {PART_NAME[b.k]}
                <tspan fontWeight={400} style={{ fill: 'var(--text-2)' }}>
                  {'  '}target ~{TARGET[b.k]}s{b.fixed ? ' · rewritten' : ''}
                </tspan>
              </text>
              {b.lines.map((ln, li) => (
                <text key={li} x={TX} y={b.top + 27 + li * LH} fontSize={9.6} style={{ opacity: 1, transition: 'opacity 0.4s ease' }}>
                  {ln.map((w, wi) => (
                    <tspan key={wi} fontWeight={f.highlight && w.k ? 700 : 400} style={{ fill: f.highlight ? KIND_C[w.k] : 'var(--text)', transition: 'fill 0.4s ease' }}>
                      {w.t}
                    </tspan>
                  ))}
                </text>
              ))}
              {!on && (
                <text x={TX} y={b.top + 27} fontSize={9.6} style={{ fill: 'var(--text-2)' }}>
                  {b.part.sentences.length === 0 && (focus || f.highlight || f.fixed.length > 0) ? '(missing: the answer just stops)' : '…'}
                </text>
              )}
            </g>
          );
        })}
        {/* time budget */}
        <text x={527} y={14} textAnchor="middle" fontSize={10.5} fontWeight={700}>
          Time budget (~2 min)
        </text>
        <text x={BX[0] + BW / 2} y={36} textAnchor="middle" className="viz-label">
          target
        </text>
        <text x={BX[1] + BW / 2} y={36} textAnchor="middle" className="viz-label">
          this answer
        </text>
        <rect x={BX[0]} y={BY} width={BW} height={120 * PX} fill="none" stroke="var(--border)" />
        <rect x={BX[1]} y={BY} width={BW} height={120 * PX} fill="none" stroke="var(--border)" />
        {bar(KEYS.map((k) => TARGET[k]), BX[0], f.showTime)}
        {bar(spoken, BX[1], true)}
        <text x={BX[1] + BW / 2} y={BY + 120 * PX + 14} textAnchor="middle" fontSize={10} fontWeight={700}>
          {Math.floor(f.elapsed / 60)}:{String(Math.round(f.elapsed % 60)).padStart(2, '0')} spoken
        </text>
        <g opacity={f.verdict ? 1 : 0} style={{ transition: 'opacity 0.4s ease' }}>
          <rect x={4} y={318} width={436} height={18} rx={9} fill={params.quality === 'strong' ? 'var(--good-soft)' : 'var(--bad-soft)'} stroke={params.quality === 'strong' ? 'var(--good)' : 'var(--bad)'} />
          <text x={222} y={331} textAnchor="middle" fontSize={10} fontWeight={700}>
            {f.verdict}
          </text>
        </g>
      </svg>
    </VizFrame>
  );
}
