import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CODING_PROBLEMS, PHASES, TOPICS } from '../content';
import type { Progress } from '../lib/progress';
import { kpis, phaseProgress, practiceFigures, statusCounts, type PhaseProgress } from '../lib/dashMetrics';
import { ChartCard } from './charts/ChartCard';
import { ChartTooltip } from './charts/ChartTooltip';
import { pctOf, plural, useTooltip } from './charts/core';
import { CountUp } from './CountUp';

type StatusKey = 'passed' | 'inProgress' | 'notStarted';

// Test-report status: passed (pass mint), in progress (run cyan), not run (empty track). Values live in
// charts.css (--viz-st-*, both themes); labels, tooltips and the table view carry the same information,
// so colour never stands alone.
const STATES: { id: StatusKey; label: string; color: string }[] = [
  { id: 'passed', label: 'Passed', color: 'var(--viz-st-pass)' },
  { id: 'inProgress', label: 'In progress', color: 'var(--viz-st-prog)' },
  { id: 'notStarted', label: 'Not run', color: 'var(--viz-st-new)' },
];
const LEGEND = STATES.map((s) => ({ label: s.label, color: s.color }));
const mix = (c: Record<StatusKey, number>) => STATES.map((s) => `${c[s.id]} ${s.label.toLowerCase()}`).join(', ');

/**
 * Today → Study record: topics by status (one stacked strip for the course + one per phase) and the
 * practice ledger (sections, labs, coding, drills, interview answers, readiness, exam accuracy).
 * Renders two panels; the parent grid places them (.r-status, .r-ledger).
 */
export function ProgressPanel({ p }: { p: Progress }) {
  const all = statusCounts(p, TOPICS);
  const phases = phaseProgress(p, TOPICS, PHASES);
  const f = practiceFigures(p, TOPICS, CODING_PROBLEMS);
  const k = kpis(p, TOPICS);
  const figures: { label: string; done: number; total: number; hint: string; href?: string }[] = [
    { label: 'Sections read', ...f.sections, hint: 'Tick “Read” at the end of each Learn section.' },
    { label: '“Improve This” labs', ...f.labs, hint: 'Fix weak tests and buggy code; the JS labs run real tests.' },
    { label: 'JS coding problems', ...f.coding, hint: 'Solve them on the coding page; tests judge each one.', href: '/coding' },
    { label: 'Practice drills', ...f.drills, hint: 'Worked problems, revealed one step at a time.' },
    { label: 'Interview Qs practised', ...k.interview, hint: 'Answer out loud, then rate yourself.' },
  ];

  return (
    <>
      <ChartCard
        className="r-status"
        title="Topics by status"
        subtitle={
          <>
            {plural(all.total, 'topic')} · a topic passes once its full exam does. <Link to="/contents">Syllabus →</Link>
          </>
        }
        legend={LEGEND}
        table={{
          columns: ['Phase', 'Passed', 'In progress', 'Not run', 'Topics'],
          rows: [
            ...phases.map((ph) => [`${ph.number}. ${ph.title}`, ph.passed, ph.inProgress, ph.notStarted, ph.total]),
            ['All phases', all.passed, all.inProgress, all.notStarted, all.total],
          ],
        }}
      >
        <StatusBars all={all} phases={phases} />
      </ChartCard>

      <section className="panel r-ledger rise" aria-labelledby="ledger-t">
        <div className="p-head">
          <span className="mlabel" id="ledger-t">
            Practice ledger
          </span>
          <span className="mlabel">
            readiness <b>{k.readiness}%</b>
          </span>
        </div>
        <div className="ledger-top">
          <div className="readout">
            <span className="mlabel">Readiness</span>
            <div className="num">
              <CountUp value={k.readiness} />
              <small>%</small>
            </div>
          </div>
          <div className="readout">
            <span className="mlabel">Exam accuracy</span>
            <div className="num">
              {k.mcqAccuracy === null ? '—' : <CountUp value={k.mcqAccuracy} />}
              <small>{k.mcqAccuracy === null ? 'no answers' : '%'}</small>
            </div>
          </div>
          <div className="readout">
            <span className="mlabel">Avg best</span>
            <div className="num">
              {k.avgBest === null ? '—' : <CountUp value={k.avgBest} />}
              <small>{k.avgBest === null ? 'no exams' : '%'}</small>
            </div>
          </div>
        </div>
        <ul className="ledger-rows" aria-label="Practice done">
          {figures.map((x) => (
            <li key={x.label} title={x.hint}>
              <span className="lr-l">{x.href ? <Link to={x.href}>{x.label}</Link> : x.label}</span>
              <span className="lr-v mono">
                {x.done}
                <small>/{x.total}</small>
              </span>
              <span
                className="seg thin"
                style={{ '--n': Math.min(x.total, 40) || 1, '--v': x.total ? (x.done / x.total) * Math.min(x.total, 40) : 0 } as CSSProperties}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={x.total}
                aria-valuenow={x.done}
                aria-label={`${x.label}: ${x.done} of ${x.total}`}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function StatusBars({ all, phases }: { all: Record<StatusKey, number> & { total: number }; phases: PhaseProgress[] }) {
  const { ref, tip, bind } = useTooltip();
  const rows = [{ id: 'all', number: 0, title: 'All phases', ...all }, ...phases];
  return (
    <div className="phase-bars-wrap" ref={ref}>
      <ol className="phase-bars">
        {rows.map((ph) => (
          <li key={ph.id} className={ph.id === 'all' ? 'phase-bar-row is-all' : 'phase-bar-row'}>
            <div className="phase-bar-head">
              <span className="phase-bar-num" aria-hidden="true">
                {ph.id === 'all' ? 'ALL' : String(ph.number).padStart(2, '0')}
              </span>
              {ph.id === 'all' ? (
                <span className="phase-bar-title">Course</span>
              ) : (
                <Link to={`/contents#phase-${ph.id}`} className="phase-bar-title">
                  {ph.title}
                </Link>
              )}
              <span className="phase-bar-count">
                {ph.passed}/{ph.total}
                <span className="sr-only"> passed</span>
              </span>
            </div>
            <div className="phase-bar" role="group" aria-label={`${ph.title}: ${mix(ph)}`}>
              {STATES.filter((s) => ph[s.id] > 0).map((s) => (
                <span
                  key={s.id}
                  className="phase-bar-seg"
                  style={{ flexGrow: ph[s.id], background: s.color }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${ph.title}: ${ph[s.id]} ${s.label.toLowerCase()} (${pctOf(ph[s.id], ph.total)}%)`}
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
