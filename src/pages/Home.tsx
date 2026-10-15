import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Code2,
  FlaskConical,
  Map as MapIcon,
  MessageSquare,
  RotateCcw,
  Target,
  Terminal,
} from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS, TOPIC_BY_ID } from '../content';
import { useProgress } from '../lib/progress';
import { PW_LAB_STEPS } from '../content/pwlab';
import { nextStep } from '../lib/nextStep';
import { getUiPrefs } from '../lib/uiPrefs';
import { TAB_META, type TabId } from '../lib/studyLoop';
import { studyStreak } from '../lib/streak';
import {
  activeInLast,
  activityWeeks,
  codingByCategory,
  difficultyAccuracy,
  examScores,
  examTimeline,
  flagged,
  kpis,
  phaseProgress,
  ratingCounts,
  statusCounts,
  weakForChart,
} from '../lib/dashMetrics';
import { weakTopics } from '../lib/weak';
import { ProgressRing } from '../components/ProgressRing';
import { CountUp } from '../components/CountUp';
import { NextStepCard } from '../components/NextStepCard';
import { StreakCard } from '../components/StreakCard';
import { JourneyMap } from '../components/JourneyMap';
import { ChartCard } from '../components/charts/ChartCard';
import { Donut } from '../components/charts/Donut';
import { BarList } from '../components/charts/BarList';
import { ColumnChart } from '../components/charts/ColumnChart';
import { LineChart } from '../components/charts/LineChart';
import { Heatmap } from '../components/charts/Heatmap';
import { StackedBar } from '../components/charts/StackedBar';
import { StatTile } from '../components/charts/StatTile';
import { C, plural } from '../components/charts/core';

/** A readable name for a saved location, for "Continue where you left off". */
function describeLocation(loc: string): string | null {
  const [path, search = ''] = loc.split('?');
  const topic = /^\/topic\/([^/]+)/.exec(path);
  if (topic) {
    const t = TOPIC_BY_ID.get(topic[1]);
    if (!t) return null;
    const tab = new URLSearchParams(search).get('tab') as TabId | null;
    return tab && TAB_META[tab] ? `${t.title} · ${TAB_META[tab].label}` : t.title;
  }
  const coding = /^\/coding\/(.+)/.exec(path);
  if (coding) return CODING_PROBLEMS.find((q) => q.id === coding[1])?.title ?? 'JS coding practice';
  const lab = /^\/pw-lab\/(.+)/.exec(path);
  if (lab) {
    const s = PW_LAB_STEPS.find((x) => x.id === lab[1]);
    return s ? `Playwright Lab · ${s.title}` : 'Playwright Lab';
  }
  const pages: Record<string, string> = {
    '/coding': 'JS coding practice',
    '/pw-lab': 'Playwright Lab',
    '/playground': 'JS Playground',
    '/companies': 'Company questions',
    '/roadmap': '12-week roadmap',
  };
  return pages[path] ?? null;
}

const LEVEL_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' } as const;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export default function Home() {
  const p = useProgress();
  const passMark = p.settings.passMark;
  const k = kpis(p, TOPICS);
  const step = nextStep(p, TOPICS, { companyTotal: COMPANY_QUESTIONS.length, codingTotal: CODING_PROBLEMS.length });

  const last = getUiPrefs().lastStudyLocation;
  const lastLabel = last ? describeLocation(last) : null;
  const sameAsNext = last && (last === step.href || last.split('&s=')[0] === step.href.split('&s=')[0]);
  const resume = last && lastLabel && !sameAsNext ? { href: last, label: lastLabel } : undefined;

  // ---- metrics ----
  const status = statusCounts(p, TOPICS);
  const phases = phaseProgress(p, TOPICS, PHASES);
  const scores = examScores(p, TOPICS);
  const timeline = examTimeline(p, TOPICS);
  const levels = difficultyAccuracy(p, TOPICS);
  const ratings = ratingCounts(p, TOPICS);
  const weeks = activityWeeks(p.activityDays);
  const streak = studyStreak(p.activityDays);
  const week = activeInLast(p.activityDays, 7);
  const studyDays = (p.activityDays ?? []).length;
  const coding = codingByCategory(p, CODING_PROBLEMS);
  const codeSolved = coding.reduce((a, c) => a + c.solved, 0);
  const labs = flagged(p.cc, TOPICS.flatMap((t) => t.codeChallenges.map((c) => c.id)));
  const drills = flagged(p.boe, TOPICS.flatMap((t) => t.envelopeQuestions.map((q) => q.id)));
  const company = flagged(p.company, COMPANY_QUESTIONS.map((q) => q.id));
  const weak = weakForChart(p, TOPICS);
  const weakAll = weakTopics(p, TOPICS);
  const totalWrong = weakAll.reduce((n, w) => n + w.wrong.length, 0);
  const SCORE_ROWS = 10;

  return (
    <div className="page dash stagger">
      <section className="hero hero-gradient dash-hero featured">
        <div className="aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-copy">
          <h1>
            <span className="text-gradient">Your QA engineer roadmap</span>
          </h1>
          <p className="lead">
            {TOPICS.length} topics across {PHASES.length} phases: manual testing, API &amp; SQL, JavaScript, Playwright, AI and
            interview prep. Learn each topic with animations, improve weak tests and buggy code, practise interview questions and
            drills, then pass the timed exam.
          </p>
        </div>
        <div className="hero-readiness">
          <ProgressRing value={k.readiness} size={104} stroke={10} tone={k.readiness === 100 ? 'good' : 'accent'} label={`Readiness ${k.readiness}%`} />
          <div>
            <strong>Interview readiness</strong>
            <div className="muted small">Average completion across every topic: reading, labs, questions, drills and exams.</div>
          </div>
        </div>
      </section>

      <NextStepCard step={step} resume={resume} />

      {/* ---------- roadmap ---------- */}
      <section className="dash-section" aria-labelledby="dash-roadmap">
        <div className="dash-section-head">
          <h2 id="dash-roadmap">Your roadmap</h2>
          <Link to="/contents" className="small">
            All topics in Contents →
          </Link>
        </div>
        <div className="dash-row">
          <StreakCard days={p.activityDays} />
          <JourneyMap />
        </div>
        <ChartCard
          title="Progress by phase"
          subtitle="Average completion of each phase's topics (reading, labs, interview questions, drills and the exam). Select a phase to open it."
          table={{
            columns: ['Phase', 'Complete', 'Exams passed'],
            rows: phases.map((ph) => [`${ph.number}. ${ph.title}`, `${ph.pct}%`, `${ph.passed}/${ph.total}`]),
          }}
        >
          <BarList
            color={C.series}
            max={100}
            labelWidth="minmax(150px, 34%)"
            rows={phases.map((ph) => ({
              id: ph.id,
              label: `${ph.number}. ${ph.title}`,
              sub: `${ph.passed}/${ph.total} exams passed`,
              value: ph.pct,
              display: `${ph.pct}%`,
              href: `/contents#phase-${ph.id}`,
              ariaLabel: `Phase ${ph.number}, ${ph.title}: ${ph.pct}% complete, ${ph.passed} of ${ph.total} exams passed. Open in Contents`,
              tip: { value: `${ph.pct}% complete`, label: `Phase ${ph.number}: ${ph.title}`, detail: `${ph.passed}/${ph.total} exams passed` },
            }))}
          />
        </ChartCard>
      </section>

      {/* ---------- metrics ---------- */}
      <section className="dash-section" aria-labelledby="dash-metrics">
        <div className="dash-section-head">
          <h2 id="dash-metrics">Metrics</h2>
        </div>
        <div className="kpi-row">
          <StatTile label="Exams passed" value={<CountUp value={k.examsPassed.done} suffix={`/${k.examsPassed.total}`} />} hint={`${scores.length} attempted`} />
          <StatTile label="Readiness" value={<CountUp value={k.readiness} suffix="%" />} hint="average topic completion" />
          <StatTile
            label="Average best score"
            value={k.avgBest === null ? '—' : <CountUp value={k.avgBest} suffix="%" />}
            hint={k.avgBest === null ? 'take an exam to see this' : `pass mark ${passMark}%`}
          />
          <StatTile
            label="Exam question accuracy"
            value={k.mcqAccuracy === null ? '—' : <CountUp value={k.mcqAccuracy} suffix="%" />}
            hint={k.mcqSeen ? `latest answer to ${plural(k.mcqSeen, 'question')}` : 'no answers yet'}
          />
          <StatTile label="Interview Qs practised" value={<CountUp value={k.interview.done} suffix={`/${k.interview.total}`} />} hint="self-rated answers" />
          <StatTile
            label="Study days"
            value={<CountUp value={week} suffix="/7" />}
            hint={`this week · ${streak ? `${plural(streak, 'day')} streak` : 'no streak yet'}`}
          />
        </div>

        <div className="chart-grid">
          <ChartCard
            title="Overall progress"
            subtitle={`${TOPICS.length} topics by state. A topic is passed once you score ${passMark}%+ on its full exam.`}
            table={{
              columns: ['State', 'Topics', 'Share'],
              rows: [
                ['Passed', status.passed, `${Math.round((status.passed / Math.max(1, status.total)) * 100)}%`],
                ['In progress', status.inProgress, `${Math.round((status.inProgress / Math.max(1, status.total)) * 100)}%`],
                ['Not started', status.notStarted, `${Math.round((status.notStarted / Math.max(1, status.total)) * 100)}%`],
              ],
            }}
          >
            <Donut
              center={`${status.passed}/${status.total}`}
              centerLabel="passed"
              ariaLabel="Topics by state"
              segments={[
                { label: 'Passed', value: status.passed, color: C.ord3, detail: 'exam passed' },
                { label: 'In progress', value: status.inProgress, color: C.ord2, detail: 'started, exam not passed yet' },
                { label: 'Not started', value: status.notStarted, color: C.ord1, detail: 'nothing done yet' },
              ]}
            />
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
                tip: { value: `${l.pct}% correct`, label: `${LEVEL_LABEL[l.level]} questions`, detail: `${l.correct} of ${l.seen} answered` },
              }))}
            />
          </ChartCard>
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
              <p className="chart-note">Showing the last {SCORE_ROWS} topics in course order; the table lists all {scores.length}.</p>
            )}
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
            subtitle={ratings.total ? `How you rated your ${plural(ratings.total, 'practised answer')}.` : 'How you rate your practised interview answers.'}
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
            title="Practice"
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
                  {labs.done}/{labs.total}
                </strong>{' '}
                “Improve This” labs done
              </span>
              <span>
                <strong>
                  {drills.done}/{drills.total}
                </strong>{' '}
                practice drills done
              </span>
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

      {/* ---------- weak areas ---------- */}
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
                question leaves the list as soon as you answer it correctly, in the drill or in any exam. Skipped questions count as
                wrong.
              </li>
              <li>
                <strong>Revise the weakest section first.</strong> Each missed question is matched to the Learn section it most
                likely tests, so start with the section named on the row.
              </li>
              <li>
                <strong>Retake the full exam.</strong> A topic stays on the list until you pass its full-length exam ({passMark}%+).
                A shorter custom exam updates your answers but doesn&apos;t count as a pass.
              </li>
              <li>
                <strong>Re-rate shaky interview answers.</strong> Answers you rated <em>partly</em> or <em>missed</em> keep the topic
                listed until you practise them again and rate them <em>nailed it</em>.
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

      {/* ---------- practice links ---------- */}
      <nav className="dash-practice" aria-label="Practice">
        <span className="eyebrow">Practice</span>
        <Link to="/coding" className="practice-chip">
          <Code2 size={15} aria-hidden="true" /> JS coding ({codeSolved}/{CODING_PROBLEMS.length})
        </Link>
        <Link to="/companies" className="practice-chip">
          <Building2 size={15} aria-hidden="true" /> Company questions
        </Link>
        <Link to="/playground" className="practice-chip">
          <Terminal size={15} aria-hidden="true" /> JS Playground
        </Link>
        <Link to="/pw-lab" className="practice-chip">
          <FlaskConical size={15} aria-hidden="true" /> Playwright Lab
        </Link>
        <Link to="/roadmap" className="practice-chip">
          <MapIcon size={15} aria-hidden="true" /> 12-week plan
        </Link>
      </nav>
    </div>
  );
}
