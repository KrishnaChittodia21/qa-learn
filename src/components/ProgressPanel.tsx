import { Link } from 'react-router-dom';
import { CODING_PROBLEMS, PHASES, TOPICS } from '../content';
import type { Progress } from '../lib/progress';
import { phaseProgress, practiceFigures, statusCounts, type PhaseProgress, type StatusCounts } from '../lib/dashMetrics';
import { ChartCard } from './charts/ChartCard';
import { ChartTooltip } from './charts/ChartTooltip';
import { pctOf, useTooltip } from './charts/core';

type StatusKey = 'passed' | 'inProgress' | 'notStarted';

// Test-report status, encoded with the app's semantic colours (passed green, in progress amber, not run grey).
// Values live in index.css (--viz-st-*, validated light + dark); labels, tooltips and the table view carry
// the same information, so colour never stands alone.
const STATES: { id: StatusKey; label: string; color: string }[] = [
  { id: 'passed', label: 'Passed', color: 'var(--viz-st-pass)' },
  { id: 'inProgress', label: 'In progress', color: 'var(--viz-st-prog)' },
  { id: 'notStarted', label: 'Not run', color: 'var(--viz-st-new)' },
];
const LEGEND = STATES.map((s) => ({ label: s.label, color: s.color }));
const mix = (c: Record<StatusKey, number>) => STATES.map((s) => `${c[s.id]} ${s.label.toLowerCase()}`).join(', ');

/** Dashboard summary: topics by status (donut), status mix per phase (stacked bars) and practice figures. */
export function ProgressPanel({ p }: { p: Progress }) {
  const all = statusCounts(p, TOPICS);
  const phases = phaseProgress(p, TOPICS, PHASES);
  const f = practiceFigures(p, TOPICS, CODING_PROBLEMS);
  const figures: { label: string; done: number; total: number; hint: string; href?: string }[] = [
    { label: 'Sections read', ...f.sections, hint: 'Tick “Read” at the end of each Learn section.' },
    { label: '“Improve This” labs done', ...f.labs, hint: 'Fix weak tests and buggy code; the JS labs run real tests.' },
    { label: 'JS coding problems solved', ...f.coding, hint: 'Solve them on the JS coding page; tests judge each one.', href: '/coding' },
    { label: 'Practice drills done', ...f.drills, hint: 'Worked problems, revealed one step at a time.' },
  ];

  return (
    <section className="dash-section progress-panel" aria-labelledby="progress-title">
      <div className="dash-section-head">
        <h2 id="progress-title">
          Progress at a <span className="marker">glance</span>
        </h2>
        <p className="muted small">
          A topic is passed once its full exam is. <Link to="/contents">All topics in Contents →</Link>
        </p>
      </div>
      <div className="progress-grid">
        <ChartCard
          title="Topics by status"
          subtitle={`${all.total} topics`}
          legend={LEGEND}
          table={{
            columns: ['Status', 'Topics', 'Share'],
            rows: STATES.map((s) => [s.label, all[s.id], `${pctOf(all[s.id], all.total)}%`]),
          }}
        >
          <StatusDonut counts={all} />
        </ChartCard>
        <ChartCard
          title="By phase"
          subtitle="Status of each phase's topics. Select a phase to open it."
          legend={LEGEND}
          table={{
            columns: ['Phase', 'Passed', 'In progress', 'Not run', 'Topics'],
            rows: phases.map((ph) => [`${ph.number}. ${ph.title}`, ph.passed, ph.inProgress, ph.notStarted, ph.total]),
          }}
        >
          <PhaseBars phases={phases} />
        </ChartCard>
        <div className="progress-figures" role="group" aria-label="Practice done">
          {figures.map((x) => (
            <div key={x.label} className="progress-figure">
              <div className="progress-figure-label">{x.href ? <Link to={x.href}>{x.label}</Link> : x.label}</div>
              <div className="progress-figure-value">
                {x.done}
                <span>/{x.total}</span>
              </div>
              <div className="progress-figure-meter" aria-hidden="true">
                <span style={{ width: `${pctOf(x.done, x.total)}%` }} />
              </div>
              <p className="progress-figure-hint">{x.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatusDonut({ counts }: { counts: StatusCounts }) {
  const { ref, tip, bind } = useTooltip();
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = Math.max(1, counts.total);
  const shown = STATES.filter((s) => counts[s.id] > 0);
  const gap = shown.length > 1 ? 2 : 0; // 2px surface gap between segments
  const segs = shown.map((s, i) => ({
    ...s,
    len: (counts[s.id] / total) * c,
    start: (shown.slice(0, i).reduce((a, x) => a + counts[x.id], 0) / total) * c,
  }));
  return (
    <div className="donut-wrap status-donut" ref={ref}>
      <div className="donut">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="group"
          aria-label={`Topics by status: ${mix(counts)}, of ${counts.total}.`}
        >
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segs.map((s) => {
              const share = pctOf(counts[s.id], counts.total);
              return (
                <circle
                  key={s.id}
                  className="donut-seg"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${Math.max(0, s.len - gap)} ${c}`}
                  strokeDashoffset={-s.start}
                  tabIndex={0}
                  role="img"
                  aria-label={`${s.label}: ${counts[s.id]} of ${counts.total} topics (${share}%)`}
                  {...bind({ value: `${counts[s.id]} · ${share}%`, label: `${s.label} topics`, color: s.color })}
                />
              );
            })}
          </g>
        </svg>
        <div className="donut-center" aria-hidden="true">
          <span className="donut-value">{pctOf(counts.passed, counts.total)}%</span>
          <span className="donut-label">passed</span>
        </div>
      </div>
      <ul className="donut-direct" aria-hidden="true">
        {STATES.map((s) => (
          <li key={s.id}>
            <strong>{counts[s.id]}</strong> {s.label.toLowerCase()}
          </li>
        ))}
      </ul>
      <ChartTooltip tip={tip} />
    </div>
  );
}

function PhaseBars({ phases }: { phases: PhaseProgress[] }) {
  const { ref, tip, bind } = useTooltip();
  return (
    <div className="phase-bars-wrap" ref={ref}>
      <ol className="phase-bars">
        {phases.map((ph) => (
          <li key={ph.id} className="phase-bar-row">
            <div className="phase-bar-head">
              <span className="phase-bar-num" aria-hidden="true">
                {String(ph.number).padStart(2, '0')}
              </span>
              <Link to={`/contents#phase-${ph.id}`} className="phase-bar-title">
                {ph.title}
              </Link>
              <span className="phase-bar-count">
                {ph.passed}/{ph.total} passed
              </span>
            </div>
            <div className="phase-bar" role="group" aria-label={`Phase ${ph.number}, ${ph.title}: ${mix(ph)}`}>
              {STATES.filter((s) => ph[s.id] > 0).map((s) => (
                <span
                  key={s.id}
                  className="phase-bar-seg"
                  style={{ flexGrow: ph[s.id], background: s.color }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${ph.title}: ${ph[s.id]} ${s.label.toLowerCase()}`}
                  {...bind({ value: `${ph[s.id]} of ${ph.total}`, label: `${s.label} · ${ph.title}`, color: s.color })}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <ChartTooltip tip={tip} />
    </div>
  );
}
