import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageSquare, RotateCcw, Target } from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS, TOPIC_BY_ID } from '../content';
import { useProgress } from '../lib/progress';
import { PW_LAB_STEPS } from '../content/pwlab';
import { nextStep } from '../lib/nextStep';
import { getUiPrefs } from '../lib/uiPrefs';
import { TAB_META, tabLabel, type TabId } from '../lib/studyLoop';
import { describeLocation, sameStudyTarget, type LocationLookup } from '../lib/studyLocation';
import { studyStreak } from '../lib/streak';
import { topicCompletion, topicStatus } from '../lib/stats';
import {
  codingByCategory,
  difficultyAccuracy,
  examScores,
  examTimeline,
  flagged,
  kpis,
  mistakesToDrill,
  phaseProgress,
  activityWeeks,
  ratingCounts,
  weakForChart,
} from '../lib/dashMetrics';
import { weakTopics } from '../lib/weak';
import { CountUp } from '../components/CountUp';
import { ProgressPanel } from '../components/ProgressPanel';
import { AchievementsSummary } from '../components/achievements/AchievementsSummary';
import { ChartCard } from '../components/charts/ChartCard';
import { BarList } from '../components/charts/BarList';
import { ColumnChart } from '../components/charts/ColumnChart';
import { LineChart } from '../components/charts/LineChart';
import { Heatmap } from '../components/charts/Heatmap';
import { StackedBar } from '../components/charts/StackedBar';
import { StatTile } from '../components/charts/StatTile';
import { C, plural } from '../components/charts/core';

const LOOKUP: LocationLookup = {
  topic: (id) => TOPIC_BY_ID.get(id),
  tabLabel: (id, tab) => {
    const t = TOPIC_BY_ID.get(id);
    return t && tab in TAB_META ? tabLabel(t, tab as TabId) : undefined;
  },
  coding: (id) => CODING_PROBLEMS.find((q) => q.id === id)?.title,
  labStep: (id) => PW_LAB_STEPS.find((s) => s.id === id)?.title,
};

const LEVEL_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' } as const;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function Home() {
  const p = useProgress();
  const passMark = p.settings.passMark;
  const k = kpis(p, TOPICS);
  const step = nextStep(p, TOPICS, { companyTotal: COMPANY_QUESTIONS.length, codingTotal: CODING_PROBLEMS.length });
  const fresh = step.kind === 'start';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  const last = getUiPrefs().lastStudyLocation;
  const lastLabel = last ? describeLocation(last, LOOKUP) : null;
  const resume = last && lastLabel && !sameStudyTarget(last, step.href) ? { href: last, label: lastLabel } : null;

  // ---- record ledger ----
  const phases = phaseProgress(p, TOPICS, PHASES);
  const passedTopics = phases.reduce((n, ph) => n + ph.passed, 0);
  const mistakes = mistakesToDrill(p, TOPICS);
  const streak = studyStreak(p.activityDays);
  const onDesk = TOPICS.filter((t) => topicStatus(p, t) === 'in-progress')
    .map((t) => ({ t, pct: topicCompletion(p, t) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 4);
  const HOW: [string, string][] = [
    ['Read', 'the short sections on each topic’s Learn tab and tick “Read” as you finish each one.'],
    ['Improve This', 'turn weak tests and buggy code into strong ones. The JavaScript labs are judged by running real tests.'],
    ['Interview Qs & Drills', 'answer out loud and rate yourself, then work the Practice Drills one step at a time.'],
    ['Pass', `the timed Exam (${passMark}% or more). The topic is then marked passed in your record.`],
  ];

  // ---- study record ----
  const scores = examScores(p, TOPICS);
  const timeline = examTimeline(p, TOPICS);
  const levels = difficultyAccuracy(p, TOPICS);
  const ratings = ratingCounts(p, TOPICS);
  const weeks = activityWeeks(p.activityDays);
  const studyDays = (p.activityDays ?? []).length;
  const coding = codingByCategory(p, CODING_PROBLEMS);
  const codeSolved = coding.reduce((a, c) => a + c.solved, 0);
  const company = flagged(
    p.company,
    COMPANY_QUESTIONS.map((q) => q.id),
  );
  const weak = weakForChart(p, TOPICS);
  const totalWrong = weakTopics(p, TOPICS).reduce((n, w) => n + w.wrong.length, 0);
  const SCORE_ROWS = 10;

  return (
    <div className="page dash">
      <header className="today-lead">
        <section className="today-main" aria-labelledby="today-title">
          <p className="eyebrow today-date">{today}</p>
          <p className="today-kicker">{fresh ? 'Start here' : 'Your next step'}</p>
          <h1 id="today-title" className="today-title">
            {step.title}
          </h1>
          <p className="today-detail">{step.detail}</p>
          <div className="row gap-s wrap today-actions">
            <Link to={step.href} className="btn btn-primary btn-lg">
              {fresh ? 'Open the first lesson' : step.kind === 'read' ? 'Continue reading' : 'Go'}{' '}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {step.secondary && (
              <Link to={step.secondary.href} className="btn btn-lg">
                <Target size={16} aria-hidden="true" /> {step.secondary.title}
              </Link>
            )}
          </div>
          {resume && (
            <Link to={resume.href} className="resume-line">
              <span className="resume-label">Where you left off</span>
              <span className="resume-target">{resume.label}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </section>

        <aside className="ledger" aria-labelledby="ledger-title">
          <h2 id="ledger-title" className="ledger-title">
            Record
          </h2>
          <table className="ledger-phases">
            <caption className="sr-only">Topics passed per phase</caption>
            <colgroup>
              <col />
              <col className="ledger-col-bar" />
              <col className="ledger-col-count" />
            </colgroup>
            <tbody>
              {phases.map((ph) => (
                <tr key={ph.id}>
                  <th scope="row">
                    <span className="ledger-num">{String(ph.number).padStart(2, '0')}</span>
                    <span className="ledger-phase">{ph.title}</span>
                  </th>
                  <td className="ledger-bar" aria-hidden="true">
                    <span style={{ width: `${ph.total ? (ph.passed / ph.total) * 100 : 0}%` }} />
                  </td>
                  <td className="ledger-count">
                    {ph.passed}/{ph.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="ledger-facts">
            <div>
              <dt>Topics passed</dt>
              <dd>
                {passedTopics}
                <span>/{TOPICS.length}</span>
              </dd>
            </div>
            <div>
              <dt>Exam answers</dt>
              <dd>{k.mcqSeen}</dd>
            </div>
            <div>
              <dt>
                <Link to="/practice">Mistakes to drill</Link>
              </dt>
              <dd className={mistakes ? 'flag' : ''}>
                {mistakes}
                {mistakes > 0 && <span className="sr-only"> (needs attention)</span>}
              </dd>
            </div>
            <div>
              <dt>Study streak</dt>
              <dd>
                {streak}
                <span> day{streak === 1 ? '' : 's'}</span>
              </dd>
            </div>
          </dl>
        </aside>
      </header>

      {fresh && (
        <section className="dash-section how" aria-labelledby="how-title">
          <div className="dash-section-head">
            <h2 id="how-title">How this works</h2>
          </div>
          <ol className="how-steps">
            {HOW.map(([verb, rest], i) => (
              <li key={verb}>
                <span className="how-num">{String(i + 1).padStart(2, '0')}</span>
                <p>
                  <strong>{verb}</strong> {rest}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {onDesk.length > 0 && (
        <section className="dash-section desk" aria-labelledby="desk-title">
          <div className="dash-section-head">
            <h2 id="desk-title">On your desk</h2>
            <span className="muted small">In-progress topics, closest to done first</span>
          </div>
          <ul className="desk-list">
            {onDesk.map(({ t, pct }) => (
              <li key={t.id}>
                <Link to={`/topic/${t.id}`}>{t.title}</Link>
                <span className="desk-bar" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
                <span className="desk-pct">
                  {pct}%<span className="sr-only"> complete</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ProgressPanel p={p} />

      <AchievementsSummary p={p} />

      <section className="dash-section" aria-labelledby="dash-weak">
        <div className="dash-section-head">
          <h2 id="dash-weak">Weak areas &amp; how to reattempt</h2>
          <Link to="/weak-areas" className="small">
            Full weak-areas analysis →
          </Link>
        </div>
        <div className="weak-grid">
          <ChartCard
            title="Weakest topics"
            subtitle="Exam questions you currently have wrong, per topic (most first)."
            empty={
              !weak.length && (
                <>
                  <p>No weak areas yet. Take an exam to find them.</p>
                  <Link to={step.href} className="btn btn-sm">
                    {step.title} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </>
              )
            }
            table={{
              columns: ['Topic', 'Wrong now', 'Weakest section', 'Last exam', 'Shaky interview answers'],
              rows: weak.map((w) => [
                w.topic.title,
                w.wrong.length,
                w.sections[0]?.heading ?? '—',
                w.attempts ? `${w.last}%` : 'no exam yet',
                w.shakyInterview,
              ]),
            }}
          >
            <BarList
              color={C.weak}
              max={Math.max(1, ...weak.map((w) => w.wrong.length))}
              labelWidth="minmax(160px, 34%)"
              rows={weak.map((w) => {
                const why = [
                  w.attempts ? `last exam ${w.last}%${w.passed ? '' : ' (not passed)'}` : null,
                  w.shakyInterview ? `${plural(w.shakyInterview, 'shaky interview answer')}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ');
                return {
                  id: w.topic.id,
                  label: w.topic.title,
                  sub: why,
                  value: w.wrong.length,
                  display: `${w.wrong.length} wrong`,
                  ariaLabel: `${w.topic.title}: ${plural(w.wrong.length, 'question')} currently wrong. ${why}${w.sections[0] ? `. Weakest section: ${w.sections[0].heading}` : ''}`,
                  tip: {
                    value: `${plural(w.wrong.length, 'question')} wrong`,
                    label: w.topic.title,
                    detail: w.sections[0] ? `Weakest: ${w.sections[0].heading}` : why,
                  },
                  actions: (
                    <>
                      {w.wrong.length > 0 && (
                        <Link to={`/practice?topic=${w.topic.id}`} className="btn btn-xs">
                          <RotateCcw size={12} aria-hidden="true" /> Practise {plural(w.wrong.length, 'mistake')}
                        </Link>
                      )}
                      {w.sections[0] && (
                        <Link to={`/topic/${w.topic.id}?tab=learn&s=${w.sections[0].index}`} className="btn btn-xs">
                          <BookOpen size={12} aria-hidden="true" /> Revise “{w.sections[0].heading}”
                        </Link>
                      )}
                      {w.shakyInterview > 0 && (
                        <Link to={`/topic/${w.topic.id}?tab=interview`} className="btn btn-xs">
                          <MessageSquare size={12} aria-hidden="true" /> Re-practise interview Qs
                        </Link>
                      )}
                      <Link to={`/topic/${w.topic.id}/exam`} className="btn-ghost btn-xs">
                        Retake exam
                      </Link>
                    </>
                  ),
                };
              })}
            />
          </ChartCard>

          <section className="card howto-card" aria-labelledby="dash-howto">
            <h3 id="dash-howto" className="chart-title">
              <Target size={16} aria-hidden="true" className="card-icon" /> How to clear a weak area
            </h3>
            <ol className="howto-steps">
              <li>
                <strong>Practise your mistakes.</strong> The mistakes drill asks only the questions whose latest answer was wrong. A
                question leaves the list as soon as you answer it correctly, in the drill or in any exam. Skipped questions count as wrong.
              </li>
              <li>
                <strong>Revise the weakest section first.</strong> Each missed question is matched to the Learn section it most likely
                tests, so start with the section named on the row.
              </li>
              <li>
                <strong>Retake the full exam.</strong> A topic stays on the list until you pass its full-length exam ({passMark}%+). A
                shorter custom exam updates your answers but doesn&apos;t count as a pass.
              </li>
              <li>
                <strong>Re-rate shaky interview answers.</strong> Answers you rated <em>partly</em> or <em>missed</em> keep the topic listed
                until you practise them again and rate them <em>nailed it</em>.
              </li>
            </ol>
            <div className="row gap-s wrap">
              {totalWrong > 0 && (
                <Link to="/practice" className="btn btn-primary btn-sm">
                  <RotateCcw size={14} aria-hidden="true" /> Practise all {plural(totalWrong, 'mistake')}
                </Link>
              )}
              <Link to="/weak-areas" className="btn btn-sm">
                Weak areas page
              </Link>
            </div>
          </section>
        </div>
      </section>

      <section className="dash-section" aria-labelledby="dash-record">
        <div className="dash-section-head">
          <h2 id="dash-record">Study record</h2>
        </div>
        <div className="kpi-row">
          <StatTile label="Readiness" value={<CountUp value={k.readiness} suffix="%" />} hint="average completion of every topic" />
          <StatTile
            label="Average best score"
            value={k.avgBest === null ? '—' : <CountUp value={k.avgBest} suffix="%" />}
            hint={k.avgBest === null ? 'take an exam to see this' : `pass mark ${passMark}%`}
          />
          <StatTile
            label="Exam question accuracy"
            value={k.mcqAccuracy === null ? '—' : <CountUp value={k.mcqAccuracy} suffix="%" />}
            hint={k.mcqSeen ? `latest answer to ${plural(k.mcqSeen, 'question')}` : 'answer a question to see this'}
          />
          <StatTile
            label="Interview Qs practised"
            value={<CountUp value={k.interview.done} suffix={`/${k.interview.total}`} />}
            hint="self-rated answers"
          />
        </div>

        <div className="chart-grid">
          <ChartCard
            className="chart-wide"
            title="Exam scores"
            subtitle={`Best full-exam score per topic, against the ${passMark}% pass mark.`}
            empty={
              !scores.length && (
                <>
                  <p>Take your first exam to see your scores here.</p>
                  <Link to={step.href} className="btn btn-sm">
                    {step.title} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </>
              )
            }
            table={{
              columns: ['Topic', 'Best', 'Last', 'Attempts', 'Passed'],
              rows: scores.map((s) => [s.topic.title, `${s.best}%`, `${s.last}%`, s.attempts, s.passed ? 'Yes' : 'No']),
            }}
          >
            <BarList
              color={C.series}
              max={100}
              reference={{ value: passMark, label: `Pass ${passMark}%` }}
              rows={scores.slice(-SCORE_ROWS).map((s) => ({
                id: s.topic.id,
                label: s.topic.title,
                sub: `${s.passed ? '✓ Passed' : '✗ Not passed yet'} · ${plural(s.attempts, 'attempt')}`,
                value: s.best,
                display: `${s.best}%`,
                href: `/topic/${s.topic.id}?tab=exam`,
                ariaLabel: `${s.topic.title}: best ${s.best}%, last ${s.last}%, ${plural(s.attempts, 'attempt')}, ${s.passed ? 'passed' : 'not passed'}`,
                tip: { value: `Best ${s.best}%`, label: s.topic.title, detail: `Last ${s.last}% · ${plural(s.attempts, 'attempt')}` },
              }))}
            />
            {scores.length > SCORE_ROWS && (
              <p className="chart-note">
                Showing the last {SCORE_ROWS} topics in course order; the table lists all {scores.length}.
              </p>
            )}
          </ChartCard>
          <ChartCard
            title="Accuracy by difficulty"
            subtitle="Share of exam questions whose latest answer is correct."
            empty={!levels.length && <p>Answer some exam questions to see where the difficulty bites.</p>}
            table={{
              columns: ['Difficulty', 'Accuracy', 'Correct', 'Answered'],
              rows: levels.map((l) => [LEVEL_LABEL[l.level], `${l.pct}%`, l.correct, l.seen]),
            }}
          >
            <ColumnChart
              color={C.series}
              columns={levels.map((l) => ({
                id: l.level,
                label: LEVEL_LABEL[l.level],
                value: l.pct,
                display: `${l.pct}%`,
                ariaLabel: `${LEVEL_LABEL[l.level]}: ${l.pct}% correct, ${l.correct} of ${l.seen}`,
                tip: {
                  value: `${l.pct}% correct`,
                  label: `${LEVEL_LABEL[l.level]} questions`,
                  detail: `${l.correct} of ${l.seen} answered`,
                },
              }))}
            />
          </ChartCard>
          <ChartCard
            title="Exam score trend"
            subtitle={`Your last ${plural(timeline.length, 'full exam')}, oldest first, across all topics.`}
            empty={timeline.length < 2 && <p>Finish two full-length exams to see your score trend.</p>}
            table={{
              columns: ['Date', 'Topic', 'Score'],
              rows: timeline.map((a) => [shortDate(a.at), a.topic.title, `${a.score}%`]),
            }}
          >
            <LineChart
              color={C.series}
              reference={{ value: passMark, label: `Pass mark ${passMark}%` }}
              seriesLabel="Exam score"
              xLabels={timeline.length ? [shortDate(timeline[0].at), shortDate(timeline[timeline.length - 1].at)] : undefined}
              points={timeline.map((a, i) => ({
                id: `${a.at}-${i}`,
                value: a.score,
                ariaLabel: `${shortDate(a.at)}, ${a.topic.title}: ${a.score}%`,
                tip: { value: `${a.score}%`, label: a.topic.title, detail: shortDate(a.at) },
              }))}
            />
          </ChartCard>
          <ChartCard
            title="Study activity"
            subtitle={
              <>
                Last 12 weeks · {plural(studyDays, 'study day')} in total ·{' '}
                {streak ? `current streak ${plural(streak, 'day')}` : 'study today to start a streak'}
              </>
            }
            table={{
              columns: ['Week starting', 'Days studied'],
              rows: weeks.map((w) => [shortDate(`${w[0].day}T12:00:00`), w.filter((d) => d.active).length]),
            }}
          >
            <Heatmap weeks={weeks} color={C.series} />
          </ChartCard>
          <ChartCard
            title="Interview self-ratings"
            subtitle={
              ratings.total
                ? `How you rated your ${plural(ratings.total, 'practised answer')}.`
                : 'How you rate your practised interview answers.'
            }
            empty={
              !ratings.total && (
                <p>
                  Practise questions in any topic&apos;s <strong>Interview Qs</strong> tab and rate your answer to see this.
                </p>
              )
            }
            table={{
              columns: ['Rating', 'Answers', 'Share'],
              rows: (['nailed', 'partial', 'missed'] as const).map((r) => [
                r === 'nailed' ? 'Nailed it' : r === 'partial' ? 'Partly' : 'Missed',
                ratings[r],
                `${Math.round((ratings[r] / Math.max(1, ratings.total)) * 100)}%`,
              ]),
            }}
          >
            <StackedBar
              unit="answers"
              ariaLabel="Interview self-ratings"
              segments={[
                { label: 'Nailed it', value: ratings.nailed, color: C.ord3 },
                { label: 'Partly', value: ratings.partial, color: C.ord2 },
                { label: 'Missed', value: ratings.missed, color: C.ord1 },
              ]}
            />
            <p className="chart-note">
              Answers rated <em>partly</em> or <em>missed</em> keep their topic in your weak areas until you re-rate them.
            </p>
          </ChartCard>
          <ChartCard
            className="chart-wide"
            title="JS coding by category"
            subtitle={`JavaScript coding problems solved by category · ${codeSolved}/${CODING_PROBLEMS.length} in total.`}
            table={{
              columns: ['Category', 'Solved', 'Problems'],
              rows: coding.map((c) => [c.label, c.solved, c.total]),
            }}
            action={
              <Link to="/coding" className="small">
                Coding →
              </Link>
            }
          >
            <BarList
              color={C.series}
              max={100}
              rows={coding.map((c) => {
                const pct = Math.round((c.solved / Math.max(1, c.total)) * 100);
                return {
                  id: c.id,
                  label: c.label,
                  value: pct,
                  display: `${c.solved}/${c.total}`,
                  href: '/coding',
                  ariaLabel: `${c.label}: ${c.solved} of ${c.total} solved`,
                  tip: { value: `${c.solved}/${c.total} solved`, label: c.label, detail: `${pct}%` },
                };
              })}
            />
            <div className="mini-stats">
              <span>
                <strong>
                  {company.done}/{company.total}
                </strong>{' '}
                company questions practised
              </span>
            </div>
          </ChartCard>
        </div>
      </section>
    </div>
  );
}
