// Today (/): the Spectral Lab instrument board (qa-learn-designs/Main.html; phones: Mobile.html screens 01–02).
// Every readout is derived from real progress (src/lib/progress.ts) and content; nothing is invented.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, MessageSquare, RotateCcw, Target } from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_BY_TOPIC, COMPANY_QUESTIONS, PHASES, TOPICS, TOPIC_BY_ID } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { longestStreak } from '../content/achievements';
import { useProgress, type Progress } from '../lib/progress';
import { nextStep, type NextStepResult } from '../lib/nextStep';
import { getUiPrefs } from '../lib/uiPrefs';
import { openGuide } from '../lib/appEvents';
import { TAB_META, tabLabel, type TabId } from '../lib/studyLoop';
import { describeLocation, sameStudyTarget, type LocationLookup } from '../lib/studyLocation';
import { studyStreak } from '../lib/streak';
import { topicCompletion, topicStatus } from '../lib/stats';
import {
  activeInLast,
  activityWeeks,
  codingByCategory,
  difficultyAccuracy,
  examScores,
  examTimeline,
  flagged,
  kpis,
  ratingCounts,
  weakForChart,
} from '../lib/dashMetrics';
import { weakTopics } from '../lib/weak';
import {
  activitySignal,
  examEvents,
  judgeLines,
  pipelineStages,
  relTime,
  skillAxes,
  splitTitle,
  trackCoverage,
  weakestSpot,
  type JudgeSummary,
  type RunLine,
  type Track,
} from '../lib/todayData';
import type { Topic } from '../types';
import { CoveragePrism, MiniPrism, SkillRadar, Wave30 } from '../components/today/TodayViz';
import { ProgressPanel } from '../components/ProgressPanel';
import { AchievementsSummary } from '../components/achievements/AchievementsSummary';
import { ChartCard } from '../components/charts/ChartCard';
import { BarList } from '../components/charts/BarList';
import { ColumnChart } from '../components/charts/ColumnChart';
import { LineChart } from '../components/charts/LineChart';
import { Heatmap } from '../components/charts/Heatmap';
import { StackedBar } from '../components/charts/StackedBar';
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
const axisDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
const pad2 = (n: number) => String(n).padStart(2, '0');
const v = (o: Record<string, string | number>) => o as CSSProperties;

// ---------- small hooks ----------

/** Playwright Lab judge results (public/judge-results.json, written by `npm run judge`); null when absent. */
function useJudge(): JudgeSummary | null {
  const [data, setData] = useState<JudgeSummary | null>(null);
  useEffect(() => {
    let live = true;
    fetch(`${import.meta.env.BASE_URL}judge-results.json?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : null))
      .then((j: JudgeSummary | null) => live && j?.steps && setData(j))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);
  return data;
}

/** true when the Daylight theme is showing (explicit setting or the OS preference under "system") */
function useLightTone(theme: Progress['settings']['theme']) {
  const [sysLight, setSysLight] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const on = (e: MediaQueryListEvent) => setSysLight(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return theme === 'light' || (theme === 'system' && sysLight);
}

/** the shell's #console-slot (Layout renders it before the page) */
function useConsoleSlot() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEl(document.getElementById('console-slot')));
    return () => cancelAnimationFrame(id);
  }, []);
  return el;
}

// ---------- page ----------

export default function Home() {
  const p = useProgress();
  const judge = useJudge();
  const light = useLightTone(p.settings.theme);
  const slot = useConsoleSlot();
  const mark = p.settings.passMark;
  const step = nextStep(p, TOPICS, { companyTotal: COMPANY_QUESTIONS.length, codingTotal: CODING_PROBLEMS.length });
  const fresh = step.kind === 'start';
  const runNo = Object.values(p.tests).reduce((n, r) => n + (r.attempts || 0), 0);

  const tracks = trackCoverage(p, TOPICS);
  const passedN = tracks.reduce((n, t) => n + t.done, 0);
  const k = kpis(p, TOPICS);
  const judgeCaught = judge?.overall.mutantsCaught ?? 0;
  const bugsTotal = judge?.overall.mutantsTotal ?? PW_LAB_STEPS.reduce((n, s) => n + s.hiddenBugs, 0);
  const codeSolved = flagged(
    p.code,
    CODING_PROBLEMS.map((q) => q.id),
  ).done;

  return (
    <div className={`page today ${fresh ? 'is-fresh' : ''}`} data-tone={light ? 'light' : 'dark'}>
      {slot &&
        createPortal(
          <span className="today-run" title="Full exam attempts recorded">
            RUN #{runNo}
          </span>,
          slot,
        )}
      <h1 className="sr-only">Today</h1>
      <div className="bento">
        <Hero p={p} step={step} />
        <PrismPanel tracks={tracks} passed={passedN} examAvg={k.avgBest} codeSolved={codeSolved} bugs={judge ? judgeCaught : null} bugsTotal={bugsTotal} />
        <Readouts p={p} passed={passedN} />
        <Pipeline p={p} current={step.topic} runNo={runNo} passed={passedN} />
        <Signal p={p} />
        <Runner p={p} step={step} judge={judge} />
        {fresh ? <HowItWorks mark={mark} /> : <WeakSpot p={p} />}
        <Coding p={p} />
        <Radar p={p} />
        <LabGrid judge={judge} />
        <AchievementsSummary p={p} />
      </div>
      <StudyRecord p={p} step={step} />
    </div>
  );
}

// ---------- hero: next mission ----------

function Hero({ p, step }: { p: Progress; step: NextStepResult }) {
  const mark = p.settings.passMark;
  const t = step.topic;
  const last = getUiPrefs().lastStudyLocation;
  const lastLabel = last ? describeLocation(last, LOOKUP) : null;
  const resume = last && lastLabel && !sameStudyTarget(last, step.href) ? { href: last, label: lastLabel } : null;

  if (!t) return <HeroPractice p={p} step={step} resume={resume} />;

  const phase = PHASES.find((ph) => ph.id === t.phase);
  const inPhase = TOPICS.filter((x) => x.phase === t.phase);
  const pp = pad2(phase?.number ?? 0);
  const S = t.sections.length;
  const read = new Set((p.sections[t.id] ?? []).filter((i) => i >= 0 && i < S));
  const readN = read.size;
  const nextSec = t.sections.findIndex((_, i) => !read.has(i));
  const L = t.codeChallenges.length;
  const labs = t.codeChallenges.filter((c) => p.cc[c.id]).length;
  const company = COMPANY_BY_TOPIC.get(t.id) ?? [];
  const compDone = company.filter((q) => p.company[q.id]).length;
  const rec = p.tests[t.id];
  const Q = t.test.length;
  const minLeft = Math.max(5, Math.round((t.estimatedMinutes * (100 - topicCompletion(p, t))) / 100));
  const { head, sub } = splitTitle(t.title);
  const cur = step.kind === 'read' || step.kind === 'start' ? 0 : step.kind === 'labs' ? 1 : 2;

  const cta =
    step.kind === 'start'
      ? 'Start lesson one'
      : step.kind === 'read'
        ? `${readN ? 'Resume' : 'Start'} §${nextSec + 1}`
        : step.kind === 'labs'
          ? 'Open the labs'
          : step.kind === 'interview'
            ? 'Practise interview Qs'
            : step.kind === 'drills'
              ? 'Work the drills'
              : rec
                ? 'Retake the exam'
                : 'Take the exam';
  const detail = step.detail.startsWith(`${t.title}: `) ? step.detail.slice(t.title.length + 2) : step.detail;
  const lede =
    (step.kind === 'read' || step.kind === 'start') && nextSec >= 0 ? (
      <>
        {readN ? 'Next section' : 'First section'}: <b>§{nextSec + 1} {t.sections[nextSec].heading}</b>. You&apos;ve read {readN} of {S} sections;{' '}
        {L ? `${plural(L, t.id === 'qa-behavioral' ? 'Answer Lab' : 'Improve This lab')}, ` : ''}a {Q}-question exam
        {company.length ? ` and ${plural(company.length, 'company-reported question')}` : ''} follow.
      </>
    ) : (
      <>
        Next: <b>{step.title}</b>. {detail}
      </>
    );
  const secLabel = (step.kind === 'read' || step.kind === 'start') && nextSec >= 0 ? `§${nextSec + 1} ${t.sections[nextSec].heading}` : step.title;

  const mission: MissionCell[] = [
    { k: 'Learn', kd: '01 Learn', v: `${readN}/${S}`, small: 'sections', n: S, val: readN },
    { k: 'Lab', kd: '02 Code lab', v: L ? `${labs}/${L}` : '—', small: L ? 'labs' : 'none', n: Math.max(L, 1), val: labs },
    { k: 'Exam', kd: '03 Exam', v: rec ? `${rec.best}%` : `${Q} Q`, small: rec ? `best · pass ${mark}%` : `pass ${mark}%`, n: 10, val: rec ? rec.best / 10 : 0 },
    { k: 'Co. Qs', kd: '04 Company Qs', v: company.length ? `${compDone}/${company.length}` : '—', small: 'reported', n: Math.max(company.length, 1), val: compDone },
  ];

  return (
    <section className={`panel cut-lg b-hero hero rise ${step.kind === 'start' ? 'is-start' : ''}`} style={v({ '--i': 1 })} aria-labelledby="hero-t">
      <div className="hero-top">
        <span className="chip holo">{step.kind === 'start' ? 'First mission' : 'Next mission'}</span>
        <span className="mlabel hide-m">
          <b>Phase {pp}</b> · {phase?.title}
        </span>
        <span className="coord">
          SPEC {pp}.{inPhase.indexOf(t) + 1}
          <span className="hide-m"> · {t.estimatedMinutes} MIN</span>
        </span>
      </div>
      <HeroTitle head={head} sub={sub} />
      <p className="lede hide-m">{lede}</p>
      <div className="mm-sec only-m">
        <span className="mlabel">
          Next · <b>{secLabel}</b>
        </span>
        <span className="mono mm-n">
          {readN}/{S}
        </span>
      </div>
      <div className="seg only-m mm-seg" style={v({ '--n': S, '--v': readN, '--g': 'linear-gradient(90deg,var(--mint),var(--cyan))' })} aria-hidden="true" />
      <div className="hero-cta">
        <Link className="btn btn-holo" to={step.href}>
          {cta}
          <span className="arr">
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>
        <Link className="btn btn-line hide-m" to="/contents">
          Open syllabus
        </Link>
        <span className="mlabel eta hide-m">≈ {minLeft} min left</span>
      </div>
      <div className="mm-eta mlabel only-m">
        ≈ {minLeft} min left · Phase {pp} · {phase?.title.split(' ')[0]}
      </div>
      {resume && <ResumeLine {...resume} />}
      <Mission cells={mission} cur={cur} />
    </section>
  );
}

interface MissionCell {
  k: string;
  kd: string;
  v: string;
  small: string;
  n: number;
  val: number;
}

function Mission({ cells, cur }: { cells: MissionCell[]; cur: number }) {
  return (
    <div className="mission" role="list" aria-label="Mission checklist">
      {cells.map((c, i) => (
        <div key={c.kd} role="listitem" className={i === cur ? 'cur' : undefined} aria-current={i === cur ? 'step' : undefined}>
          <span className="mlabel">
            <span className="hide-m">{c.kd}</span>
            <span className="only-m">{c.k}</span>
          </span>
          <div className="v">
            <b>{c.v}</b>
            <small>{c.small}</small>
          </div>
          <div className="seg thin" style={v({ '--n': Math.min(c.n, 30), '--v': (c.val / c.n) * Math.min(c.n, 30) })} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function ResumeLine({ href, label }: { href: string; label: string }) {
  return (
    <Link to={href} className="resume-line">
      <span className="mlabel">Pick up where you left off</span>
      <span className="resume-target">{label}</span>
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}

/** rough width of a word in em at Syne 800 (wide m/w, narrow i/l/t), so the hero can size it to fit */
const wordEms = (w: string) =>
  [...w].reduce((n, ch) => n + (/[mwMW]/.test(ch) ? 1.25 : /[iljI.,:'’!]/.test(ch) ? 0.42 : /[tfr\-()]/.test(ch) ? 0.62 : /[A-Z0-9&]/.test(ch) ? 1 : 0.86), 0);

/** Display title sized so its longest word always fits the hero (no mid-word breaks). */
function HeroTitle({ head, sub }: { head: string; sub?: string }) {
  const longest = Math.max(...head.split(/\s+/).map(wordEms), 4);
  const size = head.length <= 12 ? 'xl' : head.length <= 22 ? 'lg' : head.length <= 38 ? 'md' : 'sm';
  const words = sub ? sub.split(' ') : [];
  const cut = words.length > 3 ? 2 : words.length > 1 ? 1 : 0;
  return (
    <h2 id="hero-t" className={`hero-title t-${size}`} style={v({ '--lw': longest })}>
      <span className="display holo-text">{head}</span>
      {sub && (
        <span className="sub">
          {cut > 0 && <span className="outline">{words.slice(0, cut).join(' ')}</span>} {words.slice(cut).join(' ')}
        </span>
      )}
    </h2>
  );
}

/** every topic passed: the hero points at the practice pages */
function HeroPractice({ p, step, resume }: { p: Progress; step: NextStepResult; resume: { href: string; label: string } | null }) {
  const company = flagged(
    p.company,
    COMPANY_QUESTIONS.map((q) => q.id),
  );
  const code = flagged(
    p.code,
    CODING_PROBLEMS.map((q) => q.id),
  );
  const cells: MissionCell[] = [
    { k: 'Topics', kd: '01 Topics', v: `${TOPICS.length}/${TOPICS.length}`, small: 'passed', n: 10, val: 10 },
    { k: 'Coding', kd: '02 Coding', v: `${code.done}/${code.total}`, small: 'solved', n: 30, val: (code.done / Math.max(1, code.total)) * 30 },
    { k: 'Co. Qs', kd: '03 Company Qs', v: `${company.done}/${company.total}`, small: 'practised', n: 30, val: (company.done / Math.max(1, company.total)) * 30 },
    { k: 'Lab', kd: '04 PW Lab', v: '8', small: 'steps', n: 8, val: 0 },
  ];
  return (
    <section className="panel cut-lg b-hero hero rise" style={v({ '--i': 1 })} aria-labelledby="hero-t">
      <div className="hero-top">
        <span className="chip pass">All exams passed</span>
        <span className="coord">BUILD GREEN</span>
      </div>
      <HeroTitle head="Keep sharp" sub={step.title} />
      <p className="lede hide-m">{step.detail}</p>
      <div className="hero-cta">
        <Link className="btn btn-holo" to={step.href}>
          Let&apos;s go
          <span className="arr">
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>
        {step.secondary && (
          <Link className="btn btn-line" to={step.secondary.href}>
            {step.secondary.title}
          </Link>
        )}
      </div>
      {resume && <ResumeLine {...resume} />}
      <Mission cells={cells} cur={1} />
    </section>
  );
}

// ---------- coverage prism ----------

function PrismPanel({
  tracks,
  passed,
  examAvg,
  codeSolved,
  bugs,
  bugsTotal,
}: {
  tracks: Track[];
  passed: number;
  examAvg: number | null;
  codeSolved: number;
  bugs: number | null;
  bugsTotal: number;
}) {
  const top = [...tracks].reverse();
  return (
    <section className="panel b-prism rise" style={v({ '--i': 2 })} aria-labelledby="prism-t">
      <div className="p-head">
        <span className="mlabel" id="prism-t">
          Coverage prism<span className="hide-m"> · <b>4 tracks</b></span>
        </span>
        <span className="mlabel">
          <b>
            {passed} / {TOPICS.length}
          </b>{' '}
          topics
        </span>
      </div>
      <div className="stage hide-m">
        <CoveragePrism tracks={tracks} />
        <div className="scan" aria-hidden="true" />
        {['c1', 'c2', 'c3', 'c4'].map((c) => (
          <span key={c} className={`xhair ${c}`} aria-hidden="true">
            <i />
          </span>
        ))}
      </div>
      <div className="mc-body only-m">
        <div className="mc-prism">
          <MiniPrism tracks={tracks} />
          <span className="xhair" aria-hidden="true">
            <i />
          </span>
        </div>
        <div className="mc-tracks">
          {top.map((t) => (
            <div className="tk" key={t.code}>
              <span className="nm">
                <i style={{ background: `var(--${t.hue})` }} />
                {t.code} {t.short}
              </span>
              <span className="pc">{t.total ? Math.round((t.done / t.total) * 100) : 0}%</span>
              <div className="seg thin" style={v({ '--n': t.total, '--v': t.done, '--g': `var(--${t.hue})` })} />
            </div>
          ))}
        </div>
      </div>
      <div className="legend hide-m">
        {top.map((t) => (
          <div className="lg-row" key={t.code}>
            <i className="sw" style={{ background: `var(--${t.hue})` }} />
            <span className="nm">
              <span>{t.code}</span>
              {t.name}
            </span>
            <span className="pc">
              {t.done}/{t.total} · {t.total ? Math.round((t.done / t.total) * 100) : 0}%
            </span>
            <div className="seg thin" style={v({ '--n': t.total, '--v': t.done, '--g': `var(--${t.hue})` })} aria-hidden="true" />
          </div>
        ))}
      </div>
      <div className="mc-read only-m">
        <div className="readout">
          <span className="mlabel">Exam avg</span>
          <div className="num">
            {examAvg ?? '—'}
            {examAvg !== null && <small>%</small>}
          </div>
        </div>
        <div className="readout">
          <span className="mlabel">Coding</span>
          <div className="num">
            {codeSolved}
            <small>/{CODING_PROBLEMS.length}</small>
          </div>
        </div>
        <div className="readout">
          <span className="mlabel">Bugs</span>
          <div className="num">
            {bugs ?? '—'}
            <small>/{bugsTotal}</small>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- readout channels ----------

function Readouts({ p, passed }: { p: Progress; passed: number }) {
  const mark = p.settings.passMark;
  const inProg = TOPICS.filter((t) => topicStatus(p, t) === 'in-progress').length;
  const scores = examScores(p, TOPICS);
  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.best, 0) / scores.length) : null;
  const below = scores.filter((s) => !s.passed).length;
  const company = flagged(
    p.company,
    COMPANY_QUESTIONS.map((q) => q.id),
  );
  const ratings = ratingCounts(p, TOPICS);
  const week = activeInLast(p.activityDays, 7);
  const streak = studyStreak(p.activityDays);
  const best = longestStreak(p.activityDays);
  return (
    <section className="panel flat b-read rise" style={v({ '--i': 3 })} aria-label="Readouts">
      <div className="ch readout">
        <span className="mlabel">
          Topics <span>CH1</span>
        </span>
        <div className="num">
          {passed}
          <small>/{TOPICS.length}</small>
        </div>
        <div className="seg" style={v({ '--n': TOPICS.length, '--v': passed })} aria-hidden="true" />
        <div className="foot">
          <b>{inProg}</b> in progress
        </div>
      </div>
      <div className="ch readout">
        <span className="mlabel">
          Exam avg <span>CH2</span>
        </span>
        <div className="num">
          {avg ?? '—'}
          <small>{avg === null ? 'no exams' : '%'}</small>
        </div>
        <div className="scale" style={v({ '--v': avg ?? 0, '--m': mark })} aria-hidden="true">
          <span className="tr" />
          <span className="fl" />
          <span className="ticks" />
          <span className="mk" data-l={`PASS ${mark}`} />
        </div>
        <div className="foot">
          <b>{scores.length}</b> {scores.length === 1 ? 'exam' : 'exams'} · <b>{below}</b> below
        </div>
      </div>
      <div className="ch readout">
        <span className="mlabel">
          Company Qs <span>CH3</span>
        </span>
        <div className="num">
          {company.done}
          <small>/{company.total}</small>
        </div>
        <div className="seg" style={v({ '--n': 34, '--v': (company.done / Math.max(1, company.total)) * 34, '--g': 'linear-gradient(90deg,var(--cyan),var(--iris))' })} aria-hidden="true" />
        <div className="foot">
          <b>{ratings.nailed}</b> rated “nailed it”
        </div>
      </div>
      <div className="ch readout">
        <span className="mlabel">
          Study days <span>CH4</span>
        </span>
        <div className="num">
          {week}
          <small>/7 days</small>
        </div>
        <div className="seg" style={v({ '--n': 7, '--v': week, '--g': 'linear-gradient(90deg,var(--lime),var(--mint))', '--gap': '3px' })} aria-hidden="true" />
        <div className="foot">
          streak <b>{streak}</b> · best <b>{best}</b>
        </div>
      </div>
    </section>
  );
}

// ---------- journey pipeline ----------

const STATE_WORD = { pass: 'PASS', flaky: 'PARTIAL', fail: 'FAILING', now: 'RUNNING', queued: 'QUEUED' } as const;
const STATE_TEXT = { pass: 't-pass', flaky: 't-flaky', fail: 't-fail', now: 't-cyan', queued: '' } as const;
const STATE_FILL = { pass: 'var(--pass)', flaky: 'var(--flaky)', fail: 'var(--fail)', now: 'var(--run)', queued: 'var(--iris)' } as const;

function Pipeline({ p, current, runNo, passed }: { p: Progress; current?: Topic; runNo: number; passed: number }) {
  const stages = pipelineStages(p, TOPICS, PHASES, current);
  const now = stages.find((s) => s.state === 'now');
  return (
    <section className="panel b-pipe rise" style={v({ '--i': 4 })} aria-labelledby="pipe-t">
      <div className="p-head">
        <h2 className="p-title" id="pipe-t">
          Journey pipeline
        </h2>
        {now ? <span className="chip run">Stage {pad2(now.phase.number)} running</span> : <span className="chip pass">All stages green</span>}
        <span className="mlabel hide-m">
          run #{runNo} · <b>{passed}/{TOPICS.length} jobs green</b>
        </span>
      </div>
      <ol className="pipe">
        {stages.map((s) => (
          <li key={s.phase.id} className={`st ${s.state}`} aria-label={`Stage ${s.phase.number}, ${s.phase.title}: ${STATE_WORD[s.state].toLowerCase()}, ${s.passed} of ${s.total} topics passed`}>
            <div className="ln" aria-hidden="true">
              <span className={`node ${s.state}`}>
                {s.state === 'pass' ? <Check size={12} strokeWidth={3} /> : s.state === 'flaky' ? <b>~</b> : s.state === 'fail' ? <b>✗</b> : null}
              </span>
              <span className={`flow ${s.state === 'pass' ? 'lit' : 'dash'}`} />
            </div>
            <div className="no" aria-hidden="true">
              <span className="hide-m">STAGE </span>
              {pad2(s.phase.number)}
            </div>
            <Link className="tt" to={`/contents#phase-${s.phase.id}`}>
              {s.phase.title}
            </Link>
            <div className="seg thin" style={v({ '--n': s.total, '--v': s.passed, ...(s.passed ? { '--g': STATE_FILL[s.state] } : {}) })} aria-hidden="true" />
            <div className="mt" aria-hidden="true">
              <span className={STATE_TEXT[s.state]}>{STATE_WORD[s.state]}</span>
              {s.passed}/{s.total}
            </div>
          </li>
        ))}
      </ol>
      {now && (
        <p className="pipe-now only-m">
          <span className="t-cyan mono">▸ {pad2(now.phase.number)}</span> {now.phase.title} ·{' '}
          <span className="mono">
            {now.passed}/{now.total}
          </span>
        </p>
      )}
    </section>
  );
}

// ---------- 30-day signal ----------

function Signal({ p }: { p: Progress }) {
  const days = activitySignal(p, 30);
  const active = days.filter((d) => d.h > 0).length;
  const streak = studyStreak(p.activityDays);
  const best = longestStreak(p.activityDays);
  const now = new Date();
  const mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15);
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  return (
    <section className="panel b-sig rise" style={v({ '--i': 5 })} aria-labelledby="sig-t">
      <div className="p-head">
        <span className="mlabel" id="sig-t">
          Signal · 30d
        </span>
        <span className={`chip ${streak ? 'pass' : 'skip'}`}>{streak}-day streak</span>
      </div>
      <div className="sig-num">
        <b>{active}</b>
        <span className="ink2">
          study days
          <br />
          <span className="ink3">best run {best}</span>
        </span>
      </div>
      <Wave30 days={days} />
      <div className="sig-axis" aria-hidden="true">
        <span className="coord">{axisDate(first)}</span>
        <span className="coord">{axisDate(mid)}</span>
        <span className="coord">TODAY</span>
      </div>
    </section>
  );
}

// ---------- runner: real recent checks ----------

const MARK = { pass: '✓', fail: '✗', flaky: '~', skip: '–', run: '▸' } as const;

function Runner({ p, step, judge }: { p: Progress; step: NextStepResult; judge: JudgeSummary | null }) {
  const mark = p.settings.passMark;
  const events = examEvents(p, TOPICS);
  const [now] = useState(() => Date.now());
  const timed: RunLine[] = [
    ...events.map((e, i) => ({
      key: `ex-${e.topic.id}-${e.at}-${i}`,
      kind: e.kind,
      spec: e.topic.id,
      what: 'exam',
      extra: e.kind === 'fail' ? `${e.score}% (pass ${mark}%)` : e.kind === 'flaky' ? `${e.score}% · passed on retry #${e.retry}` : `${e.score}%`,
      d: relTime(e.at, now),
      at: e.at,
    })),
    ...judgeLines(judge).map((l) => ({ ...l, d: l.d })),
  ]
    .sort((a, b) => (b.at ?? 0) - (a.at ?? 0))
    .slice(0, 8);

  const code = flagged(
    p.code,
    CODING_PROBLEMS.map((q) => q.id),
  );
  const ratings = ratingCounts(p, TOPICS);
  const totals: RunLine[] = [];
  if (code.done) totals.push({ key: 'code', kind: 'pass', spec: 'coding', what: `${code.done}/${code.total} problems solved`, d: 'total' });
  if (ratings.partial + ratings.missed)
    totals.push({ key: 'iq', kind: 'flaky', spec: 'interview', what: `${ratings.partial + ratings.missed} answers rated partly / missed`, d: 'total' });
  const t = step.topic;
  const queued = t ? TOPICS.slice(TOPICS.indexOf(t) + 1).find((x) => topicStatus(p, x) === 'new') : undefined;
  if (queued) totals.push({ key: 'skip', kind: 'skip', spec: queued.id, what: '', extra: 'not started', d: 'skip' });
  const lines = [...timed.reverse(), ...totals];

  const fails = events.filter((e) => e.kind === 'fail').length;
  const passes = events.filter((e) => e.kind === 'pass').length;
  const flaky = events.filter((e) => e.kind === 'flaky').length;
  const total = passes + fails + flaky;
  const specs = new Set(lines.map((l) => l.spec)).size;
  const oldest = timed[0]?.at;

  // failure trace: the most recent failing exam that is still not passed
  const lastFail = events.find((e) => e.kind === 'fail' && !p.tests[e.topic.id]?.passedAt);
  const w = lastFail ? weakTopics(p, TOPICS).find((x) => x.topic.id === lastFail.topic.id) : undefined;
  const sec = w?.sections[0];

  return (
    <section className="panel b-run rise" data-theme="dark" style={v({ '--i': 6 })} aria-labelledby="run-t">
      <div className="run-head">
        <span className="dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="ttl" id="run-t">
          runner — <span className="hide-m">recent </span>checks
        </span>
        <span className="chip run">live</span>
      </div>
      <div className="run-body runner">
        <div className="cmd hide-m">
          <span>$</span> qa-learn run{oldest ? ` --since=${new Date(oldest).toISOString().slice(0, 10)}` : ''} --reporter=line
        </div>
        <div className="run-info hide-m">
          {lines.length > 1 || timed.length
            ? `Running ${plural(lines.length + (t ? 1 : 0), 'check')} from ${plural(specs, 'spec')}`
            : 'No checks recorded yet: every pass, fail and retry you make lands here.'}
        </div>
        <ul className="rl-list" aria-label="Recent checks">
          {lines.map((l, i) => (
            <li key={l.key} className={`rl ${l.kind}`} style={v({ '--i': i })}>
              <span className={`m ${l.kind === 'fail' && i === lastFailIndex(lines) ? 'glitch' : ''}`} data-text={MARK[l.kind]} aria-hidden="true">
                {MARK[l.kind]}
              </span>
              <span className="tx">
                <span className="sr-only">{l.kind === 'skip' ? 'skipped' : l.kind === 'flaky' ? 'flaky' : l.kind === 'fail' ? 'failed' : 'passed'}: </span>
                {l.spec}
                {l.what && (
                  <>
                    {' '}
                    › <b>{l.what}</b>
                  </>
                )}
                {l.extra && (l.kind === 'flaky' ? <em> {l.extra}</em> : ` · ${l.extra}`)}
              </span>
              <span className="d">{l.d}</span>
            </li>
          ))}
          {t && (
            <li className="rl run" style={v({ '--i': lines.length })}>
              <span className="m" aria-hidden="true">
                ▸
              </span>
              <span className="tx">
                <span className="sr-only">running: </span>
                {t.id} › <b>{step.title}</b>
                <span className="caret" aria-hidden="true" />
              </span>
              <span className="d">running</span>
            </li>
          )}
        </ul>
        {lastFail && (
          <div className="trace hide-m">
            <div className="tr-h">
              <span className="t-fail">1)</span> {lastFail.topic.id} › exam{sec ? ' › ' : ''}
              {sec && <b>§{sec.index + 1} {sec.heading}</b>}
            </div>
            <div>
              <span className="ink3">Expected</span> <span className="t-pass">≥ {mark}%</span> <span className="ink3">— the pass mark</span>
            </div>
            <div>
              <span className="ink3">Received</span> <span className="t-fail">{lastFail.score}%</span>
              {w && w.wrong.length > 0 && <span className="ink3"> — {plural(w.wrong.length, 'question')} still wrong</span>}
            </div>
            {sec && (
              <div className="ink3">
                {'  '}at <span className="t-cyan">{lastFail.topic.id}.ts</span>:§{sec.index + 1} “{sec.heading}”
              </div>
            )}
          </div>
        )}
      </div>
      <div className="run-sum">
        <div className="sum-bar" aria-hidden="true">
          {total ? (
            <>
              <i className="p" style={{ flex: passes }} />
              <i className="f" style={{ flex: fails }} />
              <i className="k" style={{ flex: flaky }} />
            </>
          ) : (
            <i className="e" />
          )}
        </div>
        <div className="sum-txt">
          <b className="t-pass">
            {passes}
            <span className="hide-m"> passed</span>
            <span className="only-m"> ✓</span>
          </b>
          <b className="t-fail">
            {fails}
            <span className="hide-m"> failed</span>
            <span className="only-m"> ✗</span>
          </b>
          <b className="t-flaky">
            {flaky}
            <span className="hide-m"> flaky</span>
            <span className="only-m"> ~</span>
          </b>
          <span className="sum-r">{plural(total, 'exam run')}</span>
        </div>
      </div>
    </section>
  );
}

const lastFailIndex = (lines: RunLine[]) => {
  for (let i = lines.length - 1; i >= 0; i--) if (lines[i].kind === 'fail') return i;
  return -1;
};

// ---------- skill radar ----------

function Radar({ p }: { p: Progress }) {
  const axes = skillAxes(p, TOPICS);
  const any = axes.some((a) => a.correct > 0);
  return (
    <section className="panel hov b-radar rise" style={v({ '--i': 7 })} aria-labelledby="rad-t">
      <div className="p-head">
        <span className="mlabel" id="rad-t">
          Skill radar
        </span>
        <span className="mlabel">{axes.length} axes</span>
      </div>
      <SkillRadar axes={axes} target={p.settings.passMark} />
      <div className="rad-key mlabel">
        <span>
          <i />
          You
        </span>
        <span>
          <i className="t" />
          Pass mark
        </span>
      </div>
      <p className="rad-note">
        {any
          ? 'Share of each skill’s exam questions you currently answer correctly.'
          : 'Answer exam questions and each axis lights up with the share you get right.'}
      </p>
    </section>
  );
}

// ---------- weak spot / first visit ----------

function WeakSpot({ p }: { p: Progress }) {
  const mark = p.settings.passMark;
  const w = weakestSpot(p, TOPICS);
  if (!w) {
    const passed = Object.values(p.tests).filter((r) => r.passedAt).length;
    return (
      <section className="panel foil cut-lg b-weak is-clear rise" style={v({ '--i': 8 })} aria-labelledby="weak-t">
        <div className="p-head">
          <span className="mlabel">Weak spot</span>
          <span className="chip pass">✓ none</span>
        </div>
        <h2 className="h3" id="weak-t">
          No weak spot right now
        </h2>
        <p>
          {passed
            ? `Every exam you have taken is at or above the ${mark}% pass mark and no answers are still wrong.`
            : 'Take a topic exam and any questions you miss are traced back to the section that teaches them.'}
        </p>
        <div className="act">
          <Link className="btn btn-line btn-sm" to="/weak-areas">
            Weak areas page
          </Link>
        </div>
      </section>
    );
  }
  const ph = PHASES.find((x) => x.id === w.topic.phase);
  const secs = w.sections.slice(0, 3);
  const maxMiss = Math.max(4, ...secs.map((s) => s.missed.length));
  const failText = w.fails ? `✗ Fail ×${w.fails}` : w.wrong.length ? `✗ ${w.wrong.length} wrong` : '~ Shaky';
  const failChip = w.fails || w.wrong.length ? 'fail' : 'flaky';
  return (
    <section className="panel foil cut-lg b-weak rise" style={v({ '--i': 8 })} aria-labelledby="weak-t">
      <div className="p-head">
        <span className="mlabel">
          Weak spot · <b>Phase {pad2(ph?.number ?? 0)}</b>
        </span>
        <span className={`chip ${failChip}`}>
          {failChip === 'fail' ? (
            <span className="glitch" data-text={failText}>
              {failText}
            </span>
          ) : (
            failText
          )}
        </span>
      </div>
      <h2 className="h3" id="weak-t">
        <Link to={`/topic/${w.topic.id}`}>{w.topic.title}</Link>
      </h2>
      <p className="hide-m">
        {w.attempts ? `Exam best ${w.best}%, last ${w.last}%, pass mark ${mark}%.` : `No full exam yet; pass mark ${mark}%.`}
        {secs.length > 0 && ` Your misses cluster around ${secs.map((s) => s.heading).slice(0, 2).join(' and ')}.`}
        {!secs.length && w.shakyInterview > 0 && ` ${plural(w.shakyInterview, 'interview answer')} rated partly or missed.`}
      </p>
      <div className="scale only-m" style={v({ '--v': w.last, '--m': mark, '--g': 'var(--fail)' })} aria-hidden="true">
        <span className="tr" />
        <span className="fl" />
        <span className="ticks" />
        <span className="mk" data-l={`PASS ${mark}`} />
      </div>
      <div className="mw-row only-m">
        <span className="mono t-fail">{w.last}%</span>
        <span className="ink3">{secs.map((s) => s.heading).join(' · ') || `${w.shakyInterview} shaky interview answers`}</span>
      </div>
      {secs.length > 0 && (
        <ul className="miss hide-m" aria-label="Missed questions by section">
          {secs.map((s) => (
            <li key={s.index}>
              <Link to={`/topic/${w.topic.id}?tab=learn&s=${s.index}`}>
                §{s.index + 1} {s.heading}
              </Link>
              <span className="mono">{s.missed.length} missed</span>
              <span className="seg thin" style={v({ '--n': maxMiss, '--v': s.missed.length })} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}
      <div className="act">
        {w.wrong.length > 0 ? (
          <Link className="btn btn-holo btn-sm" to={`/practice?topic=${w.topic.id}`}>
            <RotateCcw size={14} aria-hidden="true" /> Re-attempt {w.wrong.length} missed
          </Link>
        ) : w.shakyInterview > 0 ? (
          <Link className="btn btn-holo btn-sm" to={`/topic/${w.topic.id}?tab=interview`}>
            <MessageSquare size={14} aria-hidden="true" /> Re-practise interview Qs
          </Link>
        ) : (
          <Link className="btn btn-holo btn-sm" to={`/topic/${w.topic.id}/exam`}>
            Retake exam
          </Link>
        )}
        <Link className="btn btn-ghost btn-sm" to={`/topic/${w.topic.id}?tab=cheat`}>
          Cheat sheet
        </Link>
      </div>
    </section>
  );
}

function HowItWorks({ mark }: { mark: number }) {
  const HOW: [string, string][] = [
    ['Read', 'the bite-sized sections on each topic’s Learn tab and tick “Read” as you finish each one.'],
    ['Improve This', 'turn weak tests and buggy code into strong ones. The JavaScript labs are judged by running real tests.'],
    ['Interview Qs & drills', 'answer out loud and rate yourself, then work the practice drills one step at a time.'],
    ['Pass', `the timed exam (${mark}% or more) and the topic’s pipeline stage turns green.`],
  ];
  return (
    <section className="panel foil cut-lg b-weak b-how rise" style={v({ '--i': 8 })} aria-labelledby="how-t">
      <div className="p-head">
        <span className="mlabel">First run · how it works</span>
        <span className="chip holo">4 steps</span>
      </div>
      <h2 className="h3" id="how-t">
        Four steps to <span className="holo-text">passed</span>
      </h2>
      <ol className="how-steps">
        {HOW.map(([verb, rest], i) => (
          <li key={verb}>
            <span className="node queued" aria-hidden="true">
              <b>{i + 1}</b>
            </span>
            <p>
              <strong>{verb}</strong> {rest}
            </p>
          </li>
        ))}
      </ol>
      <div className="act">
        <button type="button" className="btn btn-line btn-sm" onClick={() => openGuide()}>
          Take the 1-minute tour
        </button>
        <Link className="btn btn-ghost btn-sm" to="/contents">
          Browse the syllabus
        </Link>
      </div>
    </section>
  );
}

// ---------- coding ----------

function Coding({ p }: { p: Progress }) {
  const solved = CODING_PROBLEMS.filter((q) => p.code[q.id]).length;
  const levels = (['easy', 'medium', 'hard', 'expert'] as const)
    .map((lvl) => {
      const qs = CODING_PROBLEMS.filter((q) => q.difficulty === lvl);
      return { lvl, total: qs.length, done: qs.filter((q) => p.code[q.id]).length };
    })
    .filter((x) => x.total > 0);
  const started = CODING_PROBLEMS.find((q) => !p.code[q.id] && p.drafts[`code:${q.id}`] !== undefined && p.drafts[`code:${q.id}`] !== q.starter);
  const next = started ?? CODING_PROBLEMS.find((q) => !p.code[q.id]);
  return (
    <section className="panel hov b-code rise" style={v({ '--i': 9 })} aria-labelledby="code-t">
      <div className="p-head">
        <span className="mlabel" id="code-t">
          Coding practice
        </span>
        <Link className="mlabel p-link" to="/coding">
          Open ↗
        </Link>
      </div>
      <div className="big-pair">
        <b>{solved}</b>
        <span className="ink3">/ {CODING_PROBLEMS.length} solved</span>
      </div>
      <div className="diff">
        {levels.map((l) => (
          <div key={l.lvl}>
            <span>{LEVEL_LABEL[l.lvl]}</span>
            <span
              className="seg thin"
              style={v({ '--n': l.total, '--v': l.done, '--gap': '1px', '--g': l.lvl === 'easy' ? 'var(--mint)' : l.lvl === 'medium' ? 'var(--cyan)' : 'var(--iris)' })}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={l.total}
              aria-valuenow={l.done}
              aria-label={`${LEVEL_LABEL[l.lvl]}: ${l.done} of ${l.total} solved`}
            />
            <span>
              {l.done}/{l.total}
            </span>
          </div>
        ))}
      </div>
      {next ? (
        <Link className="next-link" to={`/coding/${next.id}`}>
          <span>
            <span className="t">{next.title}</span>
            <span className="s">
              {started ? <span className="t-flaky">~ draft saved</span> : <span className="t-cyan">▸ next</span>} · {next.category} · {next.difficulty}
            </span>
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <p className="ink2 small">Every problem solved.</p>
      )}
    </section>
  );
}

// ---------- Playwright Lab bug grid ----------

function LabGrid({ judge }: { judge: JudgeSummary | null }) {
  const steps = PW_LAB_STEPS.map((s) => {
    const r = judge?.steps[s.id];
    const total = r?.mutantsTotal || s.hiddenBugs;
    return { s, total, caught: r && r.status === 'scored' ? r.mutantsCaught : 0, ran: !!r && r.status !== 'no-tests' };
  });
  const caught = steps.reduce((n, x) => n + x.caught, 0);
  const total = steps.reduce((n, x) => n + x.total, 0);
  const cur = steps.find((x) => x.caught < x.total);
  return (
    <section className="panel hov b-lab rise" style={v({ '--i': 10 })} aria-labelledby="lab-t">
      <div className="p-head">
        <span className="mlabel" id="lab-t">
          PW Lab · QA Shop
        </span>
        <Link className="mlabel p-link" to="/pw-lab">
          Open ↗
        </Link>
      </div>
      <div className="big-pair">
        <b>{judge ? caught : '—'}</b>
        <span className="ink3">/ {total} hidden bugs caught</span>
      </div>
      <ul className="matrix" aria-label="Hidden bugs caught per step">
        {steps.map((x) => (
          <li
            key={x.s.id}
            className={`mx ${x.caught === x.total ? 'done' : x === cur ? 'cur' : ''}`}
            aria-label={`${x.s.tag} ${x.s.title}: ${judge ? `${x.caught} of ${x.total} bugs caught` : 'no judge results yet'}`}
          >
            <span className="cells" aria-hidden="true">
              {Array.from({ length: x.total }, (_, i) => (
                <i key={i} className={i >= x.total - x.caught ? 'c' : undefined} />
              ))}
            </span>
            <span className="lb" aria-hidden="true">
              @s{x.s.id.replace('step', '')}
            </span>
          </li>
        ))}
      </ul>
      {cur ? (
        <Link className="next-link" to={`/pw-lab/${cur.s.id}`}>
          <span>
            <span className="t">
              {cur.s.tag} · {cur.s.title}
            </span>
            <span className="s">
              <span className="t-cyan">▸ next</span> · {judge ? `${cur.total - cur.caught} of ${cur.total} bugs still hidden` : 'no judge run yet · npm run judge'}
            </span>
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <p className="ink2 small">Every hidden bug caught.</p>
      )}
    </section>
  );
}

// ---------- study record (charts with table views) ----------

function StudyRecord({ p, step }: { p: Progress; step: NextStepResult }) {
  const passMark = p.settings.passMark;
  const scores = examScores(p, TOPICS);
  const timeline = examTimeline(p, TOPICS);
  const levels = difficultyAccuracy(p, TOPICS);
  const ratings = ratingCounts(p, TOPICS);
  const weeks = activityWeeks(p.activityDays);
  const studyDays = (p.activityDays ?? []).length;
  const streak = studyStreak(p.activityDays);
  const coding = codingByCategory(p, CODING_PROBLEMS);
  const codeSolved = coding.reduce((a, c) => a + c.solved, 0);
  const company = flagged(
    p.company,
    COMPANY_QUESTIONS.map((q) => q.id),
  );
  const weak = weakForChart(p, TOPICS);
  const totalWrong = weakTopics(p, TOPICS).reduce((n, w) => n + w.wrong.length, 0);
  const onDesk = TOPICS.filter((t) => topicStatus(p, t) === 'in-progress')
    .map((t) => ({ t, pct: topicCompletion(p, t) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);
  const SCORE_ROWS = 10;
  const firstStep: ReactNode = (
    <Link to={step.href} className="btn btn-sm">
      {step.title} <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );

  return (
    <section className="record" aria-labelledby="rec-t">
      <div className="rec-head">
        <h2 className="h2" id="rec-t">
          Study <span className="outline">record</span>
        </h2>
        <span className="mlabel">every chart has a table view</span>
        <Link className="mlabel p-link" to="/weak-areas">
          Weak areas ↗
        </Link>
      </div>
      <div className="rec-grid">
        <ChartCard
          className="r-scores rise"
          title="Exam scores"
          subtitle={`Best full-exam score per topic, against the ${passMark}% pass mark.`}
          empty={
            !scores.length && (
              <>
                <p>
                  <strong>Your scores will live here.</strong> Take your first exam to see them.
                </p>
                {firstStep}
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
              color: s.passed ? undefined : C.weak,
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

        <ProgressPanel p={p} />

        <ChartCard
          className="r-weak rise"
          title="Weakest topics"
          subtitle="Exam questions you currently have wrong, per topic (most first)."
          empty={
            !weak.length && (
              <>
                <p>
                  <strong>No tricky spots yet.</strong> Take an exam and the questions you miss are traced back to their section.
                </p>
                {firstStep}
              </>
            )
          }
          table={{
            columns: ['Topic', 'Wrong now', 'Weakest section', 'Last exam', 'Shaky interview answers'],
            rows: weak.map((w) => [w.topic.title, w.wrong.length, w.sections[0]?.heading ?? '—', w.attempts ? `${w.last}%` : 'no exam yet', w.shakyInterview]),
          }}
        >
          <BarList
            color={C.weak}
            max={Math.max(1, ...weak.map((w) => w.wrong.length))}
            labelWidth="minmax(160px, 34%)"
            rows={weak.map((w) => {
              const why = [w.attempts ? `last exam ${w.last}%${w.passed ? '' : ' (not passed)'}` : null, w.shakyInterview ? plural(w.shakyInterview, 'shaky interview answer') : null]
                .filter(Boolean)
                .join(' · ');
              return {
                id: w.topic.id,
                label: w.topic.title,
                sub: why,
                value: w.wrong.length,
                display: `${w.wrong.length} wrong`,
                ariaLabel: `${w.topic.title}: ${plural(w.wrong.length, 'question')} currently wrong. ${why}${w.sections[0] ? `. Weakest section: ${w.sections[0].heading}` : ''}`,
                tip: { value: `${plural(w.wrong.length, 'question')} wrong`, label: w.topic.title, detail: w.sections[0] ? `Weakest: ${w.sections[0].heading}` : why },
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

        <section className="panel r-howto rise" aria-labelledby="howto-t">
          <div className="p-head">
            <span className="mlabel" id="howto-t">
              <Target size={12} aria-hidden="true" /> How to clear a weak area
            </span>
          </div>
          <ol className="howto-steps">
            <li>
              <strong>Practise your mistakes.</strong> The mistakes drill asks only the questions whose latest answer was wrong. A question leaves
              the list as soon as you answer it correctly, in the drill or in any exam. Skipped questions count as wrong.
            </li>
            <li>
              <strong>Revise the weakest section first.</strong> Each missed question is matched to the Learn section it most likely tests, so
              start with the section named on the row.
            </li>
            <li>
              <strong>Retake the full exam.</strong> A topic stays on the list until you pass its full-length exam ({passMark}%+). A shorter custom
              exam updates your answers but doesn&apos;t count as a pass.
            </li>
            <li>
              <strong>Re-rate shaky interview answers.</strong> Answers you rated <em>partly</em> or <em>missed</em> keep the topic listed until you
              practise them again and rate them <em>nailed it</em>.
            </li>
          </ol>
          <div className="act">
            {totalWrong > 0 && (
              <Link to="/practice" className="btn btn-line btn-sm">
                <RotateCcw size={14} aria-hidden="true" /> Practise all {plural(totalWrong, 'mistake')}
              </Link>
            )}
            <Link to="/weak-areas" className="btn btn-ghost btn-sm">
              Weak areas page
            </Link>
          </div>
        </section>

        <section className="panel r-desk rise" aria-labelledby="desk-t">
          <div className="p-head">
            <span className="mlabel" id="desk-t">
              Open specs · in progress
            </span>
            <span className="mlabel">
              <b>{onDesk.length}</b> shown
            </span>
          </div>
          {onDesk.length ? (
            <ul className="desk-list">
              {onDesk.map(({ t, pct }) => (
                <li key={t.id}>
                  <Link to={`/topic/${t.id}`}>{t.title}</Link>
                  <span className="mono desk-pct">
                    {pct}%<span className="sr-only"> complete</span>
                  </span>
                  <span className="seg thin" style={v({ '--n': 20, '--v': pct / 5 })} aria-hidden="true" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="ink2 small">No topic is half-done. Start one from the hero above; it shows up here, closest to done first.</p>
          )}
        </section>

        <ChartCard
          className="r-trend rise"
          title="Exam score trend"
          subtitle={`Your last ${plural(timeline.length, 'full exam')}, oldest first, across all topics.`}
          empty={
            timeline.length < 2 && (
              <p>
                <strong>A trend needs two dots.</strong> Finish two full-length exams to see your line.
              </p>
            )
          }
          table={{ columns: ['Date', 'Topic', 'Score'], rows: timeline.map((a) => [shortDate(a.at), a.topic.title, `${a.score}%`]) }}
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
          className="r-levels rise"
          title="Accuracy by difficulty"
          subtitle="Share of exam questions whose latest answer is correct."
          empty={
            !levels.length && (
              <p>
                <strong>Nothing to chart yet.</strong> Answer a few exam questions to see where the difficulty bites.
              </p>
            )
          }
          table={{ columns: ['Difficulty', 'Accuracy', 'Correct', 'Answered'], rows: levels.map((l) => [LEVEL_LABEL[l.level], `${l.pct}%`, l.correct, l.seen]) }}
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
          className="r-ratings rise"
          title="Interview self-ratings"
          subtitle={ratings.total ? `How you rated your ${plural(ratings.total, 'practised answer')}.` : 'How you rate your practised interview answers.'}
          empty={
            !ratings.total && (
              <p>
                <strong>No ratings yet.</strong> Practise in any topic&apos;s Interview Qs tab and rate your answer to fill this in.
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
          className="r-heat rise"
          title="Study activity"
          subtitle={
            <>
              Last 12 weeks · {plural(studyDays, 'study day')} in total · {streak ? `current streak ${plural(streak, 'day')}` : 'study today to start a streak'}
            </>
          }
          table={{ columns: ['Week starting', 'Days studied'], rows: weeks.map((w) => [shortDate(`${w[0].day}T12:00:00`), w.filter((d) => d.active).length]) }}
        >
          <Heatmap weeks={weeks} color={C.series} />
        </ChartCard>

        <ChartCard
          className="r-coding rise"
          title="JS coding by category"
          subtitle={`Problems solved by category · ${codeSolved}/${CODING_PROBLEMS.length} in total.`}
          table={{ columns: ['Category', 'Solved', 'Problems'], rows: coding.map((c) => [c.label, c.solved, c.total]) }}
          action={
            <Link to="/coding" className="mlabel p-link">
              Coding ↗
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
  );
}
