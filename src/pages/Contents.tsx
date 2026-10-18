import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  Code2,
  FlaskConical,
  Map as MapIcon,
  PlayCircle,
  Search,
  Settings as SettingsIcon,
  Target,
  Terminal,
  X,
  type LucideIcon,
} from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_BY_TOPIC, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { ROADMAP } from '../content/roadmap';
import type { Topic } from '../types';
import { useProgress, type Progress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { VIZ, vizForSection } from '../viz/registry';
import { TAB_META, tabLabel, type TabId } from '../lib/studyLoop';
import { weakTopics } from '../lib/weak';
import { useUiPrefs } from '../lib/uiPrefs';
import { EmptyState } from '../components/Doodles';

/* ------------------------------------------------------------------ model */

/** a topic's state in the build: passed (first time / on retry), exam failed, running (current), started, queued */
type JobState = 'pass' | 'flaky' | 'fail' | 'run' | 'part' | 'queued';
/** what the Status filter groups by */
type StatusKey = 'pass' | 'run' | 'fail' | 'queued';
type TrackId = 'T1' | 'T2' | 'T3' | 'T4';

const STATUS_OF: Record<JobState, StatusKey> = {
  pass: 'pass',
  flaky: 'pass',
  fail: 'fail',
  run: 'run',
  part: 'queued',
  queued: 'queued',
};
const STATE_LABEL: Record<JobState, string> = {
  pass: 'passed',
  flaky: 'passed on retry',
  fail: 'exam failed',
  run: 'running',
  part: 'in progress',
  queued: 'queued',
};

const TRACKS: { id: TrackId; name: string; color: string }[] = [
  { id: 'T1', name: 'Manual & API', color: 'var(--lime)' },
  { id: 'T2', name: 'JavaScript', color: 'var(--mint)' },
  { id: 'T3', name: 'Playwright', color: 'var(--cyan)' },
  { id: 'T4', name: 'AI & Interview', color: 'var(--iris)' },
];
/** tracks group the phases: P1–3 manual & API, P4 JavaScript, P5–6 Playwright, P7–8 AI & interview */
const trackOf = (phaseNumber: number): TrackId => (phaseNumber <= 3 ? 'T1' : phaseNumber === 4 ? 'T2' : phaseNumber <= 6 ? 'T3' : 'T4');
const TRACK_BY_ID = Object.fromEntries(TRACKS.map((t) => [t.id, t])) as Record<TrackId, (typeof TRACKS)[number]>;

const NUM_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
const pad2 = (n: number) => String(n).padStart(2, '0');
/** "Arrays: Methods, Sorting…" → "Arrays", "Playwright Setup, Architecture…" → "Playwright Setup" (job tile name) */
const shortName = (t: Topic) => t.title.split(':')[0].split(',')[0].trim();
const fmtH = (min: number) => (min / 60).toFixed(1);
const isGreen = (s: JobState) => s === 'pass' || s === 'flaky';

interface Job {
  topic: Topic;
  code: string;
  phaseNumber: number;
  track: TrackId;
  state: JobState;
  read: number;
  total: number;
  best?: number;
  /** first section not yet read (or -1) */
  nextSection: number;
}

/** read indexes that still exist */
const readSet = (p: Progress, t: Topic) => new Set((p.sections[t.id] ?? []).filter((i) => i >= 0 && i < t.sections.length));

const ORDERED = PHASES.flatMap((ph) => TOPICS.filter((t) => t.phase === ph.id).sort((a, b) => a.order - b.order));

/** The topic being worked on: the last studied topic (started, exam not yet taken), else the first such topic. */
function runningTopic(p: Progress, lastStudy: string): string | null {
  const m = /^\/topic\/([^/?#]+)/.exec(lastStudy);
  const last = m && TOPICS.find((t) => t.id === m[1]);
  const ok = (t: Topic) => !p.tests[t.id] && topicStatus(p, t) === 'in-progress';
  if (last && ok(last)) return last.id;
  return ORDERED.find(ok)?.id ?? null;
}

function buildJobs(p: Progress, lastStudy: string): Job[] {
  const run = runningTopic(p, lastStudy);
  return PHASES.flatMap((ph) =>
    ORDERED.filter((t) => t.phase === ph.id).map((t, i) => {
      const rec = p.tests[t.id];
      const read = readSet(p, t);
      let state: JobState;
      if (rec?.passedAt) state = rec.history?.some((h) => h.at < rec.passedAt!) ? 'flaky' : 'pass';
      else if (rec) state = 'fail';
      else if (t.id === run) state = 'run';
      else state = topicStatus(p, t) === 'in-progress' ? 'part' : 'queued';
      return {
        topic: t,
        code: `${pad2(ph.number)}.${i + 1}`,
        phaseNumber: ph.number,
        track: trackOf(ph.number),
        state,
        read: read.size,
        total: t.sections.length,
        best: rec?.best,
        nextSection: t.sections.findIndex((_, s) => !read.has(s)),
      };
    }),
  );
}

type StageState = 'pass' | 'fail' | 'run' | 'part' | 'queued';
function stageState(jobs: Job[]): StageState {
  if (jobs.every((j) => isGreen(j.state))) return 'pass';
  if (jobs.some((j) => j.state === 'fail')) return 'fail';
  if (jobs.some((j) => j.state === 'run')) return 'run';
  if (jobs.some((j) => j.state !== 'queued')) return 'part';
  return 'queued';
}
const STAGE_CHIP: Record<StageState, { cls: string; text: string }> = {
  pass: { cls: 'pass', text: 'pass' },
  fail: { cls: 'fail', text: 'failed' },
  run: { cls: 'run', text: 'running' },
  part: { cls: 'skip', text: 'in progress' },
  queued: { cls: 'skip', text: 'queued' },
};

/** Highlights every case-insensitive occurrence of `q` in `text`. */
function Hl({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let i = 0;
  for (let at = lower.indexOf(q); at !== -1; at = lower.indexOf(q, i)) {
    if (at > i) parts.push(text.slice(i, at));
    parts.push(<mark key={at}>{text.slice(at, at + q.length)}</mark>);
    i = at + q.length;
  }
  parts.push(text.slice(i));
  return <>{parts}</>;
}

interface TopicView {
  job: Job;
  /** indexes of the sections to list */
  sections: number[];
  /** a section filter / heading search applies, so the list opens by itself */
  sectionHit: boolean;
}

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ page */

export default function ContentsPage() {
  const p = useProgress();
  const ui = useUiPrefs();
  const { hash } = useLocation();
  const nav = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [onlyViz, setOnlyViz] = useState(false);
  const [track, setTrack] = useState<TrackId | 'all'>('all');
  const [status, setStatus] = useState<StatusKey | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();
  const filtering = !!q || onlyUnread || onlyViz || track !== 'all' || !!status;

  const jobs = useMemo(() => buildJobs(p, ui.lastStudyLocation), [p, ui.lastStudyLocation]);
  const running = jobs.find((j) => j.state === 'run');

  const totals = useMemo(() => {
    const sections = TOPICS.reduce((a, t) => a + t.sections.length, 0);
    const mcq = TOPICS.reduce((a, t) => a + t.test.length, 0);
    const iq = TOPICS.reduce((a, t) => a + t.interviewQuestions.length, 0);
    const drills = TOPICS.reduce((a, t) => a + t.envelopeQuestions.length, 0);
    const labs = TOPICS.reduce((a, t) => a + t.codeChallenges.length, 0);
    const minutes = TOPICS.reduce((a, t) => a + t.estimatedMinutes, 0);
    return {
      sections,
      questions: mcq + iq + drills,
      labs,
      animations: VIZ.length,
      minutes,
    };
  }, []);

  const census = useMemo(() => {
    const c: Record<JobState, number> = {
      pass: 0,
      flaky: 0,
      fail: 0,
      run: 0,
      part: 0,
      queued: 0,
    };
    jobs.forEach((j) => c[j.state]++);
    const read = jobs.reduce((a, j) => a + j.read, 0);
    const tested = jobs.filter((j) => j.best !== undefined);
    const avg = tested.length ? Math.round(tested.reduce((a, j) => a + (j.best ?? 0), 0) / tested.length) : null;
    const covered = jobs.reduce((a, j) => a + j.topic.estimatedMinutes * (j.read / Math.max(1, j.total)), 0);
    const left = jobs
      .filter((j) => !isGreen(j.state))
      .reduce((a, j) => a + j.topic.estimatedMinutes * (1 - j.read / Math.max(1, j.total)), 0);
    return { c, green: c.pass + c.flaky, read, avg, covered, left };
  }, [jobs]);

  const views = useMemo(() => {
    const out = new Map<string, TopicView[]>();
    for (const ph of PHASES) {
      const phaseHit = !!q && ph.title.toLowerCase().includes(q);
      const list: TopicView[] = [];
      for (const j of jobs.filter((x) => x.topic.phase === ph.id)) {
        const t = j.topic;
        if (track !== 'all' && j.track !== track) continue;
        if (status && STATUS_OF[j.state] !== status) continue;
        const read = readSet(p, t);
        const topicHit = !q || phaseHit || [t.title, t.subtitle, ...t.tags].some((s) => s.toLowerCase().includes(q));
        let idx = t.sections.map((_, i) => i);
        if (onlyUnread) idx = idx.filter((i) => !read.has(i));
        if (onlyViz) idx = idx.filter((i) => vizForSection(t.id, t.sections[i].heading).length > 0);
        const headingHits = q ? idx.filter((i) => t.sections[i].heading.toLowerCase().includes(q)) : [];
        if (!topicHit) idx = headingHits;
        if ((q || onlyUnread || onlyViz) && !idx.length) continue;
        list.push({
          job: j,
          sections: idx,
          sectionHit: headingHits.length > 0 || onlyUnread || onlyViz,
        });
      }
      if (list.length) out.set(ph.id, list);
    }
    return out;
  }, [jobs, p, q, onlyUnread, onlyViz, track, status]);

  const shownIds = useMemo(() => new Set([...views.values()].flat().map((v) => v.job.topic.id)), [views]);

  // deep links: /contents#phase-<id> or #t-<topic id> — open the target, then scroll to it on the next frame
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let raf2 = 0;
    const raf = requestAnimationFrame(() => {
      if (id.startsWith('t-')) {
        const t = TOPICS.find((x) => x.id === id.slice(2));
        if (t) {
          setCollapsed((c) => ({ ...c, [t.phase]: false }));
          setOpenTopics((o) => ({ ...o, [t.id]: true }));
        }
      } else if (id.startsWith('phase-')) {
        setCollapsed((c) => ({ ...c, [id.slice(6)]: false }));
      }
      raf2 = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(raf2);
    };
  }, [hash]);

  // "/" focuses the filter (unless the learner is typing somewhere)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const behavior = (): ScrollBehavior => (prefersReduced() ? 'auto' : 'smooth');
  const jump = (phaseId: string) => {
    setCollapsed((c) => ({ ...c, [phaseId]: false }));
    nav(`/contents#phase-${phaseId}`, { replace: true });
    document.getElementById(`phase-${phaseId}`)?.scrollIntoView({ behavior: behavior(), block: 'start' });
  };
  const openJob = (topicId: string, phaseId: string) => {
    setCollapsed((c) => ({ ...c, [phaseId]: false }));
    setOpenTopics((o) => ({ ...o, [topicId]: true }));
    nav(`/contents#t-${topicId}`, { replace: true });
    requestAnimationFrame(() => document.getElementById(`t-${topicId}`)?.scrollIntoView({ behavior: behavior(), block: 'center' }));
  };
  const setAll = (open: boolean) => {
    setCollapsed(Object.fromEntries(PHASES.map((ph) => [ph.id, !open])));
    setOpenTopics(Object.fromEntries(TOPICS.map((t) => [t.id, open])));
  };
  const clearFilters = () => {
    setQuery('');
    setOnlyUnread(false);
    setOnlyViz(false);
    setTrack('all');
    setStatus(null);
  };

  const weakCount = weakTopics(p, TOPICS).length;
  const passMark = p.settings.passMark;
  const runPhase = running ? PHASES.find((ph) => ph.id === running.topic.phase) : undefined;
  const failed = jobs.filter((j) => j.state === 'fail');
  const queue = [
    ...(running ? [running] : []),
    ...failed,
    ...jobs.filter((j) => j.state === 'part'),
    ...jobs.filter((j) => j.state === 'queued'),
  ].slice(0, 3);
  const resume = running ?? jobs.find((j) => j.state === 'part') ?? jobs.find((j) => j.state === 'queued') ?? failed[0];
  const hrefFor = (j: Job) =>
    j.state === 'fail'
      ? `/topic/${j.topic.id}?tab=exam`
      : `/topic/${j.topic.id}?tab=learn${j.nextSection > 0 ? `&s=${j.nextSection}` : ''}`;
  const anyStarted = jobs.some((j) => j.state !== 'queued');
  const consoleSlot = document.getElementById('console-slot');

  const tools: {
    to: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    count?: string;
  }[] = [
    {
      to: '/coding',
      icon: Code2,
      title: 'JS Coding Practice',
      desc: 'Array, string, object and async problems asked in QA/SDET interviews, judged by real tests.',
      count: `${Object.keys(p.code).length}/${CODING_PROBLEMS.length} solved`,
    },
    {
      to: '/playground',
      icon: Terminal,
      title: 'JS Playground',
      desc: 'Run any JavaScript in the browser; open lesson snippets here with “Try it”.',
    },
    {
      to: '/pw-lab',
      icon: FlaskConical,
      title: 'Playwright Lab (Judge)',
      desc: 'Write real Playwright tests against a shop app with hidden bugs and see which ones you catch.',
      count: `${PW_LAB_STEPS.length} steps · ${PW_LAB_STEPS.reduce((a, s) => a + s.hiddenBugs, 0)} bugs`,
    },
    {
      to: '/companies',
      icon: Building2,
      title: 'Company Questions',
      desc: 'Questions candidates reported at named companies, each with its source.',
      count: `${Object.keys(p.company).length}/${COMPANY_QUESTIONS.length} practised`,
    },
    {
      to: '/roadmap',
      icon: MapIcon,
      title: '12-Week Roadmap & Projects',
      desc: 'A week-by-week plan with deliverables, practice sites and portfolio projects.',
      count: `${ROADMAP.length} weeks`,
    },
    {
      to: '/weak-areas',
      icon: Target,
      title: 'Weak Areas',
      desc: 'The sections behind the questions you missed, weakest first, with targeted practice.',
      count: weakCount ? `${weakCount} to revise` : 'nothing yet',
    },
    {
      to: '/settings',
      icon: SettingsIcon,
      title: 'Settings',
      desc: 'Pass mark, exam timing, study-first lock, theme, coach tips and reset.',
    },
  ];

  // stage reports: two masonry columns, filled greedily by size so neither runs long
  // (on phones the columns dissolve and CSS `order` restores phase order)
  const reportCols = useMemo(() => {
    const cols: { phases: string[]; h: number }[] = [
      { phases: [], h: 0 },
      { phases: [], h: 0 },
    ];
    for (const ph of PHASES) {
      const list = views.get(ph.id);
      if (!list) continue;
      const open = filtering || !collapsed[ph.id];
      const col = cols[0].h <= cols[1].h ? cols[0] : cols[1];
      col.phases.push(ph.id);
      col.h += 4 + (open ? list.length * 2.2 : 0);
    }
    return cols;
  }, [views, collapsed, filtering]);

  const renderReport = (phId: string) => {
    const ph = PHASES.find((x) => x.id === phId)!;
    const list = views.get(ph.id)!;
    const all = jobs.filter((j) => j.topic.phase === ph.id);
    const st = stageState(all);
    const tr = TRACK_BY_ID[trackOf(ph.number)];
    const open = filtering || !collapsed[ph.id];
    const secRead = all.reduce((a, j) => a + j.read, 0);
    const secTotal = all.reduce((a, j) => a + j.total, 0);
    const company = all.reduce((a, j) => a + (COMPANY_BY_TOPIC.get(j.topic.id)?.length ?? 0), 0);
    const mins = all.reduce((a, j) => a + j.topic.estimatedMinutes, 0);
    const passedN = all.filter((j) => isGreen(j.state)).length;
    const chip = STAGE_CHIP[st];
    const bodyId = `rep-body-${ph.id}`;
    const segN = Math.min(secTotal, 60);
    return (
      <section
        key={ph.id}
        id={`phase-${ph.id}`}
        className={`panel rep ${st}`}
        style={{ '--lc': tr.color, order: ph.number } as CSSProperties}
        aria-labelledby={`rep-${ph.id}`}
      >
        <span className="rep-ghost" aria-hidden="true">
          {pad2(ph.number)}
        </span>
        <header className="rep-head">
          <div className="rep-k">
            <span className="mlabel">
              <b>Stage {pad2(ph.number)}</b> · report
            </span>
            <span className="trk">
              <i aria-hidden="true" />
              {tr.id} {tr.name}
            </span>
            <span className="rep-st">
              <span className={`chip ${chip.cls}`}>
                {st === 'pass' && (
                  <span className="g" aria-hidden="true">
                    ✓
                  </span>
                )}
                {st === 'fail' ? (
                  <span className="glitch" data-text={chip.text}>
                    {chip.text}
                  </span>
                ) : (
                  chip.text
                )}
              </span>
              {!filtering && (
                <button
                  type="button"
                  className="icon-btn rep-tg"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  aria-label={`${open ? 'Hide' : 'Show'} the topics of stage ${ph.number}`}
                  onClick={() => setCollapsed((c) => ({ ...c, [ph.id]: open }))}
                >
                  <ChevronDown size={16} aria-hidden="true" className={`chev-icon ${open ? '' : 'closed'}`} />
                </button>
              )}
            </span>
          </div>
          <h2 className="h3" id={`rep-${ph.id}`}>
            <Hl text={ph.title} q={q} />
          </h2>
          <p className="rep-blurb">{ph.blurb}</p>
        </header>
        <div className="rep-stats">
          <div>
            <span className="mlabel">Jobs</span>
            <b>
              {passedN}
              <small>/{all.length}</small>
            </b>
          </div>
          <div>
            <span className="mlabel">Sections</span>
            <b>
              {secRead}
              <small>/{secTotal}</small>
            </b>
          </div>
          <div>
            <span className="mlabel">Est.</span>
            <b>
              {fmtH(mins)}
              <small>h</small>
            </b>
          </div>
          <div>
            <span className="mlabel">Company</span>
            <b>
              {company}
              <small>Qs</small>
            </b>
          </div>
          <span
            className="seg"
            role="progressbar"
            aria-label={`Stage ${ph.number}: ${secRead} of ${secTotal} sections read`}
            aria-valuemin={0}
            aria-valuemax={secTotal}
            aria-valuenow={secRead}
            style={
              {
                '--n': segN,
                '--v': (secRead / Math.max(1, secTotal)) * segN,
                '--gap': '1px',
                '--g': 'var(--lc)',
              } as CSSProperties
            }
          />
        </div>
        {open && (
          <ol className="trows" id={bodyId}>
            {list.map((v) => {
              const id = v.job.topic.id;
              const isOpen = openTopics[id] ?? ((filtering && v.sectionHit) || v.job.state === 'run');
              return (
                <TopicRow
                  key={id}
                  view={v}
                  q={q}
                  p={p}
                  passMark={passMark}
                  open={isOpen}
                  onToggle={(o) => setOpenTopics((s) => ({ ...s, [id]: o }))}
                />
              );
            })}
          </ol>
        )}
      </section>
    );
  };

  return (
    <div className="page syl-page">
      {consoleSlot &&
        createPortal(
          <span className="syl-slot">
            {runPhase
              ? `Stage ${pad2(runPhase.number)} running`
              : census.green === jobs.length
                ? 'Build green'
                : `${census.green}/${jobs.length} jobs green`}
          </span>,
          consoleSlot,
        )}

      <div className="syl-bento">
        {/* ---------- title plate ---------- */}
        <section className="panel cut-lg b-title rise" style={{ '--i': 1 } as CSSProperties} aria-labelledby="syl-t">
          <span className="ghost-grid" aria-hidden="true" />
          <div className="t-top">
            <span className="chip holo">Test plan</span>
            <span className="mlabel">
              <b>{TRACKS.length} tracks</b> · {PHASES.length} stages
            </span>
            <span className="coord">
              {TOPICS.length} JOBS · {Math.round(totals.minutes / 60)} H
            </span>
          </div>
          <h1 id="syl-t">
            <span className="display holo-text">Syllabus</span>
            <span className="sub">
              <span className="outline">{NUM_WORDS[PHASES.length] ?? PHASES.length} stages,</span> one green build.
            </span>
          </h1>
          <p className="lede">
            Every topic is a job in the build. Read its sections, clear the exam at <b className="mono">{passMark}%</b> and the job turns
            green.{' '}
            {runPhase ? (
              <>
                <b>Stage {pad2(runPhase.number)}</b> is running now.
              </>
            ) : anyStarted ? null : (
              <>Stage 01 is queued and ready.</>
            )}
          </p>
          <dl className="tot-strip" aria-label="Course totals">
            {(
              [
                [PHASES.length, 'phases'],
                [TOPICS.length, 'topics'],
                [totals.sections, 'sections'],
                [totals.questions, 'questions'],
                [totals.labs, 'labs'],
                [totals.animations, 'animations'],
                [CODING_PROBLEMS.length, 'coding'],
                [COMPANY_QUESTIONS.length, 'company Qs'],
              ] as const
            ).map(([n, l]) => (
              <div key={l}>
                <dd>{n}</dd>
                <dt>{l}</dt>
              </div>
            ))}
          </dl>
          <div className="t-cta">
            <Link className="btn btn-holo" to={resume ? hrefFor(resume) : '/weak-areas'}>
              {resume
                ? `${resume.state === 'fail' ? 'Re-run' : running ? 'Resume' : 'Start'} ${resume.code} ${shortName(resume.topic)}`
                : 'Revise weak areas'}
              <span className="arr">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
            <Link className="btn btn-line" to="/weak-areas">
              Weak areas
            </Link>
          </div>
        </section>

        {/* ---------- build summary ---------- */}
        <section className="panel b-tot rise" style={{ '--i': 2 } as CSSProperties} aria-labelledby="tot-t">
          <div className="p-head">
            <span className="mlabel" id="tot-t">
              Build summary · <b>{TOPICS.length} jobs</b>
            </span>
            {runPhase ? (
              <span className="chip run">Stage {pad2(runPhase.number)}</span>
            ) : census.green === jobs.length ? (
              <span className="chip pass">Green</span>
            ) : null}
          </div>
          <div
            className="jobbar"
            role="img"
            aria-label={`${TOPICS.length} jobs: ${census.green} passed, ${census.c.fail} failed, ${census.c.run} running, ${census.c.part} in progress, ${census.c.queued} queued`}
            style={{
              gridTemplateColumns: PHASES.map((ph) => `${TOPICS.filter((t) => t.phase === ph.id).length}fr`).join(' '),
            }}
          >
            {PHASES.map((ph) => (
              <div key={ph.id} className="jb-st">
                <div className="jb-cells">
                  {jobs
                    .filter((j) => j.topic.phase === ph.id)
                    .map((j) => (
                      <i
                        key={j.topic.id}
                        className={j.state === 'part' ? 'queued part' : j.state}
                        title={`${j.code} ${shortName(j.topic)} · ${STATE_LABEL[j.state]}`}
                      />
                    ))}
                </div>
                <span className="coord">{pad2(ph.number)}</span>
              </div>
            ))}
          </div>
          <div className="jb-key" aria-hidden="true">
            <span>
              <i style={{ background: 'var(--pass)' }} />
              <b>{census.green}</b> passed
            </span>
            <span>
              <i style={{ background: 'var(--run)' }} />
              <b>{census.c.run}</b> running
            </span>
            <span>
              <i style={{ background: 'var(--fail)' }} />
              <b>{census.c.fail}</b> exam failed
            </span>
            <span>
              <i
                style={{
                  background: 'linear-gradient(180deg,var(--track) 60%,var(--iris) 60%)',
                }}
              />
              <b>{census.c.part}</b> in progress
            </span>
            <span>
              <i style={{ background: 'var(--track)' }} />
              <b>{census.c.queued}</b> queued
            </span>
          </div>
          <div className="tot-mid">
            <div className="queue">
              <span className="mlabel">
                Queue · <b>next {queue.length} jobs</b>
              </span>
              {queue.map((j) => {
                const detail =
                  j.state === 'fail'
                    ? `re-attempt exam, pass ${passMark}%`
                    : j.nextSection >= 0 && j.read > 0
                      ? `§${j.nextSection + 1} ${j.topic.sections[j.nextSection].heading}`
                      : j.topic.subtitle;
                return (
                  <Link key={j.topic.id} className={`qrow ${j.state === 'run' ? 'run' : j.state === 'fail' ? 'fail' : ''}`} to={hrefFor(j)}>
                    <i className="dm" aria-hidden="true" />
                    <b>{j.code}</b>
                    <span>
                      {shortName(j.topic)} <small>— {detail}</small>
                    </span>
                    <em>{j.state === 'fail' ? `${j.best}%` : `${j.read}/${j.total}`}</em>
                  </Link>
                );
              })}
              {!queue.length && <p className="ink3 small">Every job is green. Ship it.</p>}
            </div>
            <div className="eta readout">
              <span className="mlabel">Reading left</span>
              <div className="num">
                {fmtH(census.left)}
                <small>h</small>
              </div>
              <span className="foot">
                of <b>{fmtH(totals.minutes)} h</b> of lessons
              </span>
            </div>
          </div>
          <div className="chans">
            <div className="ch readout">
              <span className="mlabel">
                Jobs green <span>CH1</span>
              </span>
              <div className="num">
                {census.green}
                <small>/{TOPICS.length}</small>
              </div>
              <div className="seg" style={{ '--n': TOPICS.length, '--v': census.green } as CSSProperties} />
            </div>
            <div className="ch readout">
              <span className="mlabel">
                Sections <span>CH2</span>
              </span>
              <div className="num">
                {census.read}
                <small>/{totals.sections}</small>
              </div>
              <div
                className="seg"
                style={
                  {
                    '--n': 40,
                    '--v': (census.read / Math.max(1, totals.sections)) * 40,
                    '--g': 'linear-gradient(90deg,var(--mint),var(--cyan))',
                  } as CSSProperties
                }
              />
            </div>
            <div className="ch readout">
              <span className="mlabel">
                Exam avg <span>CH3</span>
              </span>
              <div className="num">
                {census.avg ?? '—'}
                {census.avg !== null && <small>%</small>}
              </div>
              <div className="scale" style={{ '--v': census.avg ?? 0, '--m': passMark } as CSSProperties}>
                <span className="tr" />
                <span className="fl" />
                <span className="ticks" />
                <span className="mk" data-l={`PASS ${passMark}`} />
              </div>
            </div>
            <div className="ch readout">
              <span className="mlabel">
                Studied <span>CH4</span>
              </span>
              <div className="num">
                {fmtH(census.covered)}
                <small>/{Math.round(totals.minutes / 60)} h</small>
              </div>
              <div
                className="scale"
                style={
                  {
                    '--v': (census.covered / Math.max(1, totals.minutes)) * 100,
                    '--m': 100,
                    '--g': 'linear-gradient(90deg,var(--cyan),var(--iris))',
                  } as CSSProperties
                }
              >
                <span className="tr" />
                <span className="fl" />
                <span className="ticks" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- build matrix ---------- */}
        <section className="panel notch b-matrix rise" style={{ '--i': 3 } as CSSProperties} aria-labelledby="mx-t">
          <div className="p-head">
            <h2 className="p-title" id="mx-t">
              Build matrix
            </h2>
            <span className="mlabel">
              {TRACKS.length} tracks × {PHASES.length} stages · <b>{TOPICS.length} jobs</b>
            </span>
            {runPhase && <span className="chip run">Stage {pad2(runPhase.number)} running</span>}
          </div>
          <div className="fbar" role="search">
            <label className="fsearch">
              <span className="sr-only">Search the syllabus</span>
              <Search size={16} aria-hidden="true" />
              <input
                ref={searchRef}
                className="input"
                type="search"
                placeholder="Find a topic, tag or section…"
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpenTopics({});
                }}
              />
              <kbd className="kbd" aria-hidden="true">
                /
              </kbd>
            </label>
            <div className="fgrp" role="group" aria-label="Track">
              <span className="mlabel">Track</span>
              <button type="button" className="fb" aria-pressed={track === 'all'} onClick={() => setTrack('all')}>
                All
              </button>
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="fb"
                  aria-pressed={track === t.id}
                  title={t.name}
                  aria-label={`${t.id} ${t.name}`}
                  style={{ '--fc': t.color } as CSSProperties}
                  onClick={() => setTrack(track === t.id ? 'all' : t.id)}
                >
                  <span className="d" aria-hidden="true" />
                  {t.id}
                </button>
              ))}
            </div>
            <div className="fgrp" role="group" aria-label="Status">
              <span className="mlabel">Status</span>
              {(
                [
                  ['pass', 'Passed', 'var(--pass)', census.green],
                  ['run', 'Running', 'var(--run)', census.c.run],
                  ['fail', 'Failed', 'var(--fail)', census.c.fail],
                  ['queued', 'Queued', 'var(--skip)', census.c.part + census.c.queued],
                ] as const
              ).map(([id, label, c, n]) => (
                <button
                  key={id}
                  type="button"
                  className="fb"
                  aria-pressed={status === id}
                  style={{ '--fc': c } as CSSProperties}
                  onClick={() => setStatus(status === id ? null : id)}
                >
                  <span className="d" aria-hidden="true" />
                  {label} <span className="n">{n}</span>
                </button>
              ))}
            </div>
            <div className="fgrp" role="group" aria-label="Sections">
              <button
                type="button"
                className="fb"
                aria-pressed={onlyUnread}
                onClick={() => {
                  setOnlyUnread((v) => !v);
                  setOpenTopics({});
                }}
              >
                <span className="bx" aria-hidden="true" />
                Only unread
              </button>
              <button
                type="button"
                className="fb"
                aria-pressed={onlyViz}
                style={{ '--fc': 'var(--cyan)' } as CSSProperties}
                onClick={() => {
                  setOnlyViz((v) => !v);
                  setOpenTopics({});
                }}
              >
                <span className="bx" aria-hidden="true" />
                <PlayCircle size={12} aria-hidden="true" /> With animations
              </button>
            </div>
            <span className="mlabel fcount" aria-live="polite">
              <b>{shownIds.size}</b> / {TOPICS.length} jobs
              {filtering && (
                <button type="button" className="link-btn fclear" onClick={clearFilters}>
                  <X size={12} aria-hidden="true" /> Clear
                </button>
              )}
            </span>
          </div>

          <Matrix jobs={jobs} shown={filtering ? shownIds : null} passMark={passMark} onJump={jump} onOpenJob={openJob} />

          <div className="mx-legend">
            <span>
              <i className="k pass" /> Passed
            </span>
            <span>
              <i className="k flaky" /> Passed on retry
            </span>
            <span>
              <i className="k fail" /> Exam failed
            </span>
            <span>
              <i className="k run" /> Running
            </span>
            <span>
              <i className="k part" /> In progress
            </span>
            <span>
              <i className="k" /> Queued
            </span>
            <span className="sep" aria-hidden="true" />
            <span>
              <i className="w" /> Handoff · stage green
            </span>
            <span>
              <i className="w dash" /> Waiting
            </span>
            <span className="mx-hint">Score = best exam % · bar = sections read</span>
          </div>
          <div className="mx-tools">
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setAll(true)}>
              Expand all
            </button>
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => setAll(false)}>
              Collapse all
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => document.getElementById('practice-tools')?.scrollIntoView({ behavior: behavior() })}
            >
              Practice &amp; tools ↓
            </button>
          </div>
        </section>
      </div>

      {/* ---------- stage reports ---------- */}
      {views.size > 0 && (
        <div className="reports">
          {reportCols.map((col, i) => (
            <div key={i} className="rep-col">
              {col.phases.map(renderReport)}
            </div>
          ))}
        </div>
      )}
      {filtering && !views.size && (
        <div className="syl-empty">
          <EmptyState title="No matching jobs" mood="sleepy">
            Try another word, or switch off a filter or two.
          </EmptyState>
          <button type="button" className="btn btn-line btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}

      {/* ---------- practice & tools ---------- */}
      <section id="practice-tools" className="panel tools-panel" aria-labelledby="tools-t">
        <div className="p-head">
          <h2 className="p-title" id="tools-t">
            Practice &amp; tools
          </h2>
          <span className="mlabel">Everything outside the topic lessons</span>
        </div>
        <ul className="tools-grid">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link to={t.to} className="tool">
                  <Icon size={18} aria-hidden="true" className="tool-icon" />
                  <span className="tool-b">
                    <b>{t.title}</b>
                    <span className="tool-d">{t.desc}</span>
                  </span>
                  {t.count && <em className="tool-c">{t.count}</em>}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ matrix */

function Matrix({
  jobs,
  shown,
  passMark,
  onJump,
  onOpenJob,
}: {
  jobs: Job[];
  shown: Set<string> | null;
  passMark: number;
  onJump: (phaseId: string) => void;
  onOpenJob: (topicId: string, phaseId: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scanH, setScanH] = useState(600);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setScanH(Math.max(200, el.offsetHeight - 80)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stages = PHASES.map((ph) => {
    const list = jobs.filter((j) => j.topic.phase === ph.id);
    return { ph, list, state: stageState(list), track: trackOf(ph.number) };
  });

  return (
    <div className="mx-wrap" ref={wrapRef}>
      <div className="mx-grid">
        <div className="mx-corner" aria-hidden="true">
          <span className="mlabel">Track</span>
          <span className="mx-slash" />
          <span className="mlabel">Stage</span>
        </div>
        {stages.map(({ ph, list, state }) => {
          const done = list.filter((j) => isGreen(j.state)).length;
          return (
            <button
              key={ph.id}
              type="button"
              className={`mx-stage ${state}`}
              onClick={() => onJump(ph.id)}
              aria-label={`Stage ${ph.number}: ${ph.title}, ${done} of ${list.length} passed. Jump to its report`}
            >
              <span className="no">STAGE {pad2(ph.number)}</span>
              <span className="tt">{ph.title}</span>
              <span
                className="seg thin"
                style={
                  {
                    '--n': list.length,
                    '--v': done,
                    '--g': state === 'run' ? 'var(--run)' : state === 'queued' ? 'var(--skip)' : 'var(--pass)',
                  } as CSSProperties
                }
              />
              <span className="ct">
                {done}/{list.length}
              </span>
            </button>
          );
        })}

        {TRACKS.map((tr, ti) => {
          const trJobs = jobs.filter((j) => j.track === tr.id);
          const trDone = trJobs.filter((j) => isGreen(j.state)).length;
          return (
            <div
              key={tr.id}
              className="mx-row"
              role="group"
              aria-label={`Track ${tr.id}: ${tr.name}, ${trDone} of ${trJobs.length} jobs green`}
              style={{ '--lc': tr.color } as CSSProperties}
            >
              <div className="mx-lane" aria-hidden="true">
                <span className="lk">
                  <i />
                  {tr.id}
                </span>
                <span className="ln">{tr.name}</span>
                <span className="lv">
                  {trDone}
                  <small>/{trJobs.length}</small>
                </span>
                <span
                  className="seg thin"
                  style={
                    {
                      '--n': trJobs.length,
                      '--v': trDone,
                      '--g': 'var(--lc)',
                    } as CSSProperties
                  }
                />
              </div>
              {stages.map(({ ph, list, state, track }, si) => {
                if (track !== tr.id) return <div key={ph.id} className="mx-cell off" aria-hidden="true" />;
                const prev = stages[si - 1];
                const next = stages[si + 1];
                const firstOfTrack = !prev || prev.track !== tr.id;
                const sameNext = !!next && next.track === tr.id;
                const handoffDown = !!next && next.track !== tr.id && ti < TRACKS.length - 1;
                const litIn = !!prev && prev.state === 'pass';
                const litOut = state === 'pass';
                return (
                  <div key={ph.id} className={`mx-cell on ${state}`}>
                    <span className="mx-cell-h" aria-hidden="true">
                      Stage {pad2(ph.number)} · {ph.title}
                    </span>
                    {prev && firstOfTrack && <span className={`wire v drop ${litIn ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    {prev && <span className={`wire h in ${litIn ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    {sameNext && <span className={`wire h out ${litOut ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    {handoffDown && <span className={`wire v exit ${litOut ? 'lit' : 'dash'}`} aria-hidden="true" />}
                    <ul className="jobs" aria-label={`Stage ${ph.number}`}>
                      {list.map((j) => {
                        const dim = shown !== null && !shown.has(j.topic.id);
                        const label = `${j.code} ${j.topic.title}: ${STATE_LABEL[j.state]}${j.best !== undefined ? `, best ${j.best}% (pass ${passMark}%)` : ''}, ${j.read} of ${j.total} sections read`;
                        return (
                          <li key={j.topic.id} className="jw">
                            <Link
                              className={`job ${j.state}${dim ? ' dim' : ''}`}
                              to={`/contents#t-${j.topic.id}`}
                              replace
                              title={label}
                              aria-label={label}
                              tabIndex={dim ? -1 : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                onOpenJob(j.topic.id, j.topic.phase);
                              }}
                            >
                              <span className="l1">
                                <i className="dm" />
                                <b>{j.code}</b>
                                <em>{j.best !== undefined ? `${j.best}%` : j.read ? `${j.read}/${j.total}` : '··'}</em>
                              </span>
                              <span className="nm">{shortName(j.topic)}</span>
                              {!isGreen(j.state) && j.read > 0 && (
                                <span
                                  className="pg"
                                  style={
                                    {
                                      '--v': (j.read / Math.max(1, j.total)) * 100,
                                    } as CSSProperties
                                  }
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <span className="scan" aria-hidden="true" style={{ '--scan-h': `${scanH}px` } as CSSProperties} />
    </div>
  );
}

/* ------------------------------------------------------------------ topic row */

function TopicRow({
  view,
  q,
  p,
  passMark,
  open,
  onToggle,
}: {
  view: TopicView;
  q: string;
  p: Progress;
  passMark: number;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  const { job: j, sections } = view;
  const t = j.topic;
  const read = readSet(p, t);
  const company = COMPANY_BY_TOPIC.get(t.id)?.length ?? 0;
  const links: [TabId, string | undefined][] = [
    ['learn', `§${t.sections.length}`],
    ['code', t.codeChallenges.length ? String(t.codeChallenges.length) : undefined],
    ['interview', t.interviewQuestions.length ? String(t.interviewQuestions.length) : undefined],
    ['envelope', t.envelopeQuestions.length ? String(t.envelopeQuestions.length) : undefined],
    ['cheat', ''],
    ['exam', `${t.test.length} Q`],
    ['company', company ? String(company) : undefined],
  ];
  const nodeCls = j.state === 'run' ? 'now' : j.state === 'part' ? 'queued part' : j.state;
  const chip: Record<JobState, { cls: string; text: string }> = {
    pass: { cls: 'pass', text: 'pass' },
    flaky: { cls: 'flaky', text: 'retry pass' },
    fail: { cls: 'fail', text: 'exam failed' },
    run: { cls: 'run', text: 'running' },
    part: { cls: 'skip', text: 'in progress' },
    queued: { cls: 'skip', text: 'queued' },
  };
  const c = chip[j.state];
  const secId = `secs-${t.id}`;
  const nowIdx = j.state === 'run' ? j.nextSection : -1;
  return (
    <li className="trow-li">
      <div className={`trow ${j.state}${q ? ' searching' : ''}`} id={`t-${t.id}`}>
        <div className="trow-sum">
          <span className={`node ${nodeCls}`} aria-hidden="true">
            {isGreen(j.state) && <Check size={11} strokeWidth={3} />}
            {j.state === 'fail' && <X size={11} strokeWidth={3} />}
          </span>
          <span className="tt">
            <span className="cd">{j.code}</span>
            <Link className="nm" to={`/topic/${t.id}`}>
              <Hl text={t.title} q={q} />
            </Link>
            <span className="sub" title={t.subtitle}>
              <Hl text={t.subtitle} q={q} />
            </span>
            <span className="mt">
              {t.sections.length} sections · {t.estimatedMinutes} min · {t.test.length}-question exam
            </span>
          </span>
          <span className="rt">
            <span className={`chip ${c.cls}`}>
              {isGreen(j.state) && (
                <span className="g" aria-hidden="true">
                  ✓
                </span>
              )}
              {c.text}
            </span>
            {sections.length > 0 && (
              <button
                type="button"
                className="tg"
                aria-expanded={open}
                aria-controls={open ? secId : undefined}
                aria-label={`${open ? 'Hide' : 'Show'} the sections of ${t.title}`}
                onClick={() => onToggle(!open)}
              />
            )}
          </span>
          <span className="row2">
            <span className="rd">
              <span
                className="seg thin"
                role="progressbar"
                aria-label={`${j.read} of ${j.total} sections read`}
                aria-valuemin={0}
                aria-valuemax={j.total}
                aria-valuenow={j.read}
                style={
                  {
                    '--n': j.total,
                    '--v': j.read,
                    '--g': j.state === 'run' ? 'var(--run)' : isGreen(j.state) ? 'var(--pass)' : 'var(--iris)',
                  } as CSSProperties
                }
              />
              <span className="rn">
                <b>{j.read}</b>/{j.total} read
              </span>
            </span>
            <span className={`sc ${j.best === undefined ? 'none' : ''}`}>
              <b className={j.best === undefined ? '' : j.state === 'fail' ? 't-fail' : 't-pass'}>
                {j.best === undefined ? '—' : `${j.best}%`}
              </b>
              <small>{j.best === undefined ? 'no exam yet' : `best · pass ${passMark}`}</small>
            </span>
            <span className="qls">
              {links
                .filter(([, n]) => n !== undefined)
                .map(([id, n]) => {
                  const Icon = id === 'learn' ? BookOpen : TAB_META[id].icon;
                  return (
                    <Link key={id} className="ql" to={`/topic/${t.id}?tab=${id}`}>
                      <Icon size={13} aria-hidden="true" />
                      {tabLabel(t, id)}
                      {n && <em>{n}</em>}
                    </Link>
                  );
                })}
            </span>
          </span>
        </div>
        {open && sections.length > 0 && (
          <div className="tbody">
            <ol className="secs" id={secId} aria-label={`Sections of ${t.title}`}>
              {sections.map((i) => {
                const s = t.sections[i];
                const viz = vizForSection(t.id, s.heading).length > 0;
                const isRead = read.has(i);
                return (
                  <li key={i} className={isRead ? 'rd' : i === nowIdx ? 'now' : ''}>
                    <span className="tk" aria-hidden="true">
                      {isRead && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="sn">§{i + 1}</span>
                    <Link className="sh" to={`/topic/${t.id}?tab=learn&s=${i}`}>
                      <Hl text={s.heading} q={q} />
                      {viz && <PlayCircle size={13} className="sviz" aria-label="interactive animation" />}
                      {isRead && <span className="sr-only">, read</span>}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </li>
  );
}
