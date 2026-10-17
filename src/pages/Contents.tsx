import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  Check,
  ChevronDown,
  Code2,
  FlaskConical,
  ListTree,
  Map as MapIcon,
  PlayCircle,
  Search,
  Settings as SettingsIcon,
  Target,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_BY_TOPIC, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { ROADMAP } from '../content/roadmap';
import type { Topic } from '../types';
import { useProgress } from '../lib/progress';
import { topicCompletion, topicStatus } from '../lib/stats';
import { VIZ, vizForSection } from '../viz/registry';
import { TAB_META, tabLabel, type TabId } from '../lib/studyLoop';
import { weakTopics } from '../lib/weak';
import { ProgressRing } from '../components/ProgressRing';
import { EmptyState } from '../components/Doodles';

const STATUS_LABEL = { new: 'New', 'in-progress': 'In progress', passed: 'Passed' } as const;

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
  topic: Topic;
  /** indexes of the sections to list */
  sections: number[];
}

export default function ContentsPage() {
  const p = useProgress();
  const { hash } = useLocation();
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [onlyViz, setOnlyViz] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const q = query.trim().toLowerCase();
  const filtering = !!q || onlyUnread || onlyViz;

  const totals = useMemo(() => {
    const sections = TOPICS.reduce((a, t) => a + t.sections.length, 0);
    const mcq = TOPICS.reduce((a, t) => a + t.test.length, 0);
    const iq = TOPICS.reduce((a, t) => a + t.interviewQuestions.length, 0);
    const drills = TOPICS.reduce((a, t) => a + t.envelopeQuestions.length, 0);
    const labs = TOPICS.reduce((a, t) => a + t.codeChallenges.length, 0);
    return { sections, questions: mcq + iq + drills, labs, animations: VIZ.length };
  }, []);

  const views = useMemo(() => {
    const out = new Map<string, TopicView[]>();
    for (const ph of PHASES) {
      const phaseHit = !!q && ph.title.toLowerCase().includes(q);
      const list: TopicView[] = [];
      for (const t of TOPICS.filter((x) => x.phase === ph.id)) {
        const read = new Set(p.sections[t.id] ?? []);
        const topicHit = !q || phaseHit || [t.title, t.subtitle, ...t.tags].some((s) => s.toLowerCase().includes(q));
        let idx = t.sections.map((_, i) => i);
        if (onlyUnread) idx = idx.filter((i) => !read.has(i));
        if (onlyViz) idx = idx.filter((i) => vizForSection(t.id, t.sections[i].heading).length > 0);
        const headingHits = q ? idx.filter((i) => t.sections[i].heading.toLowerCase().includes(q)) : idx;
        if (!topicHit) idx = headingHits;
        if (filtering && !idx.length) continue;
        list.push({ topic: t, sections: idx });
      }
      if (list.length) out.set(ph.id, list);
    }
    return out;
  }, [p.sections, q, onlyUnread, onlyViz, filtering]);

  // deep links: /contents#phase-<id>
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    return () => cancelAnimationFrame(raf);
  }, [hash]);

  const jump = (phaseId: string) => {
    setCollapsed((c) => ({ ...c, [phaseId]: false }));
    nav(`/contents#phase-${phaseId}`, { replace: true });
    document.getElementById(`phase-${phaseId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const setAll = (open: boolean) => setCollapsed(Object.fromEntries(PHASES.map((ph) => [ph.id, !open])));
  const weakCount = weakTopics(p, TOPICS).length;
  const shownTopics = [...views.values()].reduce((a, l) => a + l.length, 0);

  const tools: { to: string; icon: LucideIcon; title: string; desc: string; count?: string }[] = [
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
      count: `${PW_LAB_STEPS.length} steps · ${PW_LAB_STEPS.reduce((a, s) => a + s.hiddenBugs, 0)} hidden bugs`,
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
      count: weakCount ? `${weakCount} topic${weakCount === 1 ? '' : 's'} to revise` : 'nothing yet',
    },
    { to: '/settings', icon: SettingsIcon, title: 'Settings', desc: 'Pass mark, exam timing, study-first lock, theme, coach tips and reset.' },
  ];

  return (
    <div className="page contents-page stagger">
      <div className="topic-head">
        <div className="eyebrow">
          <ListTree size={14} aria-hidden="true" /> Contents
        </div>
        <h1>
          Everything you&apos;ll <span className="marker">learn</span>
        </h1>
        <div className="contents-totals">
          <span>
            <strong>{PHASES.length}</strong> phases
          </span>
          <span>
            <strong>{TOPICS.length}</strong> topics
          </span>
          <span>
            <strong>{totals.sections}</strong> sections
          </span>
          <span>
            <strong>{totals.questions}</strong> questions
          </span>
          <span>
            <strong>{totals.labs}</strong> labs
          </span>
          <span>
            <strong>{totals.animations}</strong> animations
          </span>
          <span>
            <strong>{CODING_PROBLEMS.length}</strong> coding problems
          </span>
          <span>
            <strong>{COMPANY_QUESTIONS.length}</strong> company questions
          </span>
        </div>
      </div>

      <div className="contents-tools">
        <label className="contents-search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Find a topic, tag or section…"
            aria-label="Search the contents"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="row wrap gap-s">
          <button type="button" className={`chip ${onlyUnread ? 'on' : ''}`} aria-pressed={onlyUnread} onClick={() => setOnlyUnread((v) => !v)}>
            Only unread
          </button>
          <button type="button" className={`chip ${onlyViz ? 'on' : ''}`} aria-pressed={onlyViz} onClick={() => setOnlyViz((v) => !v)}>
            <PlayCircle size={14} aria-hidden="true" /> Only with animations
          </button>
          <button type="button" className="btn-ghost btn-xs" onClick={() => setAll(true)}>
            Expand all
          </button>
          <button type="button" className="btn-ghost btn-xs" onClick={() => setAll(false)}>
            Collapse all
          </button>
        </div>
        {filtering && (
          <p className="small muted" aria-live="polite">
            {shownTopics} matching topic{shownTopics === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <nav className="phase-jump" aria-label="Jump to phase">
        {PHASES.map((ph) => (
          <button key={ph.id} type="button" className="chip" onClick={() => jump(ph.id)} disabled={!views.has(ph.id)}>
            {ph.number}. {ph.title}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => document.getElementById('practice-tools')?.scrollIntoView({ behavior: 'smooth' })}>
          Practice &amp; tools
        </button>
      </nav>

      {PHASES.map((ph) => {
        const list = views.get(ph.id);
        if (!list) return null;
        const all = TOPICS.filter((t) => t.phase === ph.id);
        const passed = all.filter((t) => topicStatus(p, t) === 'passed').length;
        const open = filtering || !collapsed[ph.id];
        return (
          <section key={ph.id} id={`phase-${ph.id}`} className="contents-phase">
            <button
              type="button"
              className="contents-phase-head"
              aria-expanded={open}
              onClick={() => setCollapsed((c) => ({ ...c, [ph.id]: open }))}
            >
              <span className="contents-phase-num">{String(ph.number).padStart(2, '0')}</span>
              <span className="contents-phase-title">
                <strong>
                  <Hl text={ph.title} q={q} />
                </strong>
                <span className="muted small">{ph.blurb}</span>
              </span>
              <span className="contents-phase-meter small muted">
                <ProgressRing value={(passed / Math.max(1, all.length)) * 100} size={34} stroke={4} tone="good" showValue={false} label={`${passed} of ${all.length} topics passed`} />
                {passed}/{all.length} passed
              </span>
              <ChevronDown size={18} aria-hidden="true" className={`chev-icon ${open ? '' : 'closed'}`} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  className="contents-phase-body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {list.map((v) => (
                    <TopicEntry key={v.topic.id} view={v} q={q} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}
      {filtering && !views.size && (
        <EmptyState title="No matches here" mood="sleepy">
          Try another word, or switch off a filter or two.
        </EmptyState>
      )}

      <section id="practice-tools" className="contents-phase">
        <div className="contents-phase-head static">
          <span className="contents-phase-num">+</span>
          <span className="contents-phase-title">
            <strong>Practice &amp; tools</strong>
            <span className="muted small">Everything outside the topic lessons.</span>
          </span>
        </div>
        <div className="tools-grid">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to} className="tool-card">
                <Icon size={20} aria-hidden="true" className="tool-icon" />
                <span>
                  <strong>{t.title}</strong>
                  <span className="muted small"> {t.desc}</span>
                  {t.count && <span className="tool-count small">{t.count}</span>}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TopicEntry({ view, q }: { view: TopicView; q: string }) {
  const p = useProgress();
  const { topic: t, sections } = view;
  const st = topicStatus(p, t);
  const rec = p.tests[t.id];
  const read = new Set(p.sections[t.id] ?? []);
  const company = COMPANY_BY_TOPIC.get(t.id)?.length ?? 0;
  const chips: [TabId, number | undefined][] = [
    ['code', t.codeChallenges.length],
    ['interview', t.interviewQuestions.length],
    ['envelope', t.envelopeQuestions.length],
    ['cheat', undefined],
    ['exam', t.test.length],
    ['company', company],
  ];
  return (
    <article className={`contents-topic st-${st}`}>
      <div className="contents-topic-head">
        <ProgressRing value={topicCompletion(p, t)} size={38} stroke={4} tone={st === 'passed' ? 'good' : 'accent'} />
        <div className="contents-topic-title">
          <Link to={`/topic/${t.id}`}>
            <strong>
              <Hl text={t.title} q={q} />
            </strong>
          </Link>
          <span className="muted small">
            <Hl text={t.subtitle} q={q} />
          </span>
        </div>
        <span className={`status-pill st-${st}`}>
          {STATUS_LABEL[st]}
          {st === 'passed' && rec ? ` · ${rec.best}%` : ''}
        </span>
      </div>
      {sections.length > 0 && (
        <ol className="contents-sections">
          {sections.map((i) => {
            const s = t.sections[i];
            const viz = vizForSection(t.id, s.heading).length > 0;
            return (
              <li key={i} className={read.has(i) ? 'read' : ''}>
                <Link to={`/topic/${t.id}?tab=learn&s=${i}`}>
                  <span className="contents-sec-num">{i + 1}</span>
                  <span className="contents-sec-title">
                    <Hl text={s.heading} q={q} />
                  </span>
                  {viz && <PlayCircle size={14} className="contents-viz" aria-label="interactive animation" />}
                  {read.has(i) && <Check size={14} className="contents-read" aria-label="read" />}
                </Link>
              </li>
            );
          })}
        </ol>
      )}
      <div className="contents-chips">
        {chips
          .filter(([, n]) => n !== 0)
          .map(([id, n]) => {
            const Icon = TAB_META[id].icon;
            return (
              <Link key={id} to={`/topic/${t.id}?tab=${id}`} className="chip chip-link">
                <Icon size={13} aria-hidden="true" /> {tabLabel(t, id)}
                {n !== undefined && <span className="tab-count">{n}</span>}
              </Link>
            );
          })}
      </div>
    </article>
  );
}
