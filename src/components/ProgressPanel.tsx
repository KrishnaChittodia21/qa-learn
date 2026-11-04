import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CODING_PROBLEMS, TOPICS } from '../content';
import type { Progress } from '../lib/progress';
import { kpis, practiceFigures } from '../lib/dashMetrics';
import { CountUp } from './CountUp';

/** Today → Study record: the practice ledger (sections, labs, coding, drills, interview answers, readiness, exam accuracy). */
export function ProgressPanel({ p }: { p: Progress }) {
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
  );
}
