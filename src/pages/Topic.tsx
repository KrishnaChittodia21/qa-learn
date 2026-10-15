import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { COMPANY_BY_TOPIC, PHASES, TOPICS, TOPIC_BY_ID } from '../content';
import { CompanyCard } from '../components/CompanyCard';
import type { CodeChallenge, EnvelopeQuestion, InterviewQuestion, Topic } from '../types';
import {
  rateIQ,
  setDraft,
  markAllSectionsRead,
  setFlag,
  toggleSectionRead,
  useProgress,
  type Rating,
} from '../lib/progress';
import { Badge, CodeBlock, CodeEditor, Diagram, DifficultyBadge, FollowUps, Markdown, ProgressBar, Reveal } from '../components/ui';
import { practiceLocked, topicCompletion } from '../lib/stats';
import { vizForSection } from '../viz/registry';
import { TestRunner } from '../components/TestRunner';
import { currentlyWrong, weakSections } from '../lib/weak';
import { StudyPath } from '../components/StudyPath';
import { CoachTip } from '../components/CoachTip';
import { NextUp } from '../components/NextUp';
import { ProgressRing } from '../components/ProgressRing';
import { TAB_META, loopTabs, tabLabel, type TabId } from '../lib/studyLoop';
import { celebrate } from '../lib/celebrate';
import { BookOpen, Lightbulb, PlayCircle, Zap } from 'lucide-react';

const TAB_IDS: TabId[] = ['learn', 'code', 'interview', 'envelope', 'cheat', 'exam', 'company'];

const FOOTER_LEAD: Record<TabId, string> = {
  learn: 'Finished reading?',
  code: 'Labs done?',
  interview: 'Rated every question?',
  envelope: 'Drills done?',
  cheat: 'Revised the essentials?',
  exam: 'Passed the exam?',
  company: 'Practised the company questions?',
};

export default function TopicPage() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const topic = TOPIC_BY_ID.get(id);
  const p = useProgress();
  if (!topic) {
    return (
      <div className="page">
        <h1>Topic not found</h1>
        <Link to="/">← Back to dashboard</Link>
      </div>
    );
  }
  const tab = TAB_IDS.find((t) => t === params.get('tab')) ?? 'learn';
  const phase = PHASES.find((ph) => ph.id === topic.phase);
  const idx = TOPICS.findIndex((t) => t.id === topic.id);
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];
  const locks: Partial<Record<TabId, boolean>> = {
    interview: practiceLocked(p, topic, 'interview'),
    exam: practiceLocked(p, topic, 'exam'),
  };
  const selectTab = (t: TabId) => {
    setParams({ tab: t }, { replace: true });
    const path = document.querySelector<HTMLElement>('.study-path');
    // bring the new tab's content into view without jumping above the topic header
    if (path && window.scrollY > path.offsetTop) window.scrollTo({ top: path.offsetTop - 70 });
  };

  return (
    <div className="page">
      <div className="topic-head">
        <div className="eyebrow">
          Phase {phase?.number} · {phase?.title}
        </div>
        <h1>{topic.title}</h1>
        <p className="lead">{topic.subtitle}</p>
        <div className="row wrap gap-s">
          <Badge>{topic.estimatedMinutes} min</Badge>
          {topic.tags.slice(0, 8).map((t) => (
            <Badge key={t} tone="tag">
              {t}
            </Badge>
          ))}
        </div>
        {topic.sources.length > 0 && <p className="muted small">Sources: {topic.sources.join(' · ')}</p>}
        <div className="topic-progress">
          <ProgressRing value={topicCompletion(p, topic)} size={40} tone={topicCompletion(p, topic) === 100 ? 'good' : 'accent'} />
          <span className="small muted">{topicCompletion(p, topic)}% of this topic complete</span>
        </div>
      </div>
      <TopicCompleteWatcher topic={topic} />

      <StudyPath topic={topic} tab={tab} locks={locks} onSelect={selectTab} />
      <CoachTip id={`tab:${tab}`} title={`How to use ${tabLabel(topic, tab)}:`}>
        {TAB_META[tab].tip}
      </CoachTip>

      {tab === 'learn' && <LearnTab topic={topic} />}
      {tab === 'code' && topic.codeChallenges.map((c, i) => <ChallengeCard key={c.id} c={c} n={i + 1} />)}
      {tab === 'interview' && (locks.interview ? <StudyLock topic={topic} what="interview questions" /> : <InterviewTab topic={topic} />)}
      {tab === 'envelope' && topic.envelopeQuestions.map((q, i) => <EnvelopeCard key={q.id} q={q} n={i + 1} />)}
      {tab === 'cheat' && <CheatSheet topic={topic} />}
      {tab === 'exam' && (locks.exam ? <StudyLock topic={topic} what="exam" /> : <ExamIntro topic={topic} />)}
      {tab === 'company' && (
        <div>
          <div className="card info small">
            Questions candidates reported being asked at named companies about this topic. Each links to its source. See every
            company&apos;s questions on the <Link to="/companies">Company Questions</Link> page.
          </div>
          {(COMPANY_BY_TOPIC.get(topic.id) ?? []).map((q) => (
            <CompanyCard key={q.id} q={q} showTopic={false} />
          ))}
        </div>
      )}

      <TabFooter topic={topic} tab={tab} next={next} onSelect={selectTab} />

      <div className="pager">
        {prev ? <Link to={`/topic/${prev.id}`}>← {prev.title}</Link> : <span />}
        {next ? <Link to={`/topic/${next.id}`}>{next.title} →</Link> : <Link to="/coding">JavaScript coding practice →</Link>}
      </div>
    </div>
  );
}

function LearnTab({ topic }: { topic: Topic }) {
  const p = useProgress();
  const read = new Set(p.sections[topic.id] ?? []);
  const [params] = useSearchParams();
  const target = params.get('s');

  // deep link from weak-area reports: /topic/:id?tab=learn&s=<section index>
  useEffect(() => {
    if (target === null) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`s-${target}`);
      if (!el) return;
      el.scrollIntoView({ block: 'start' });
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 1800);
    });
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <div className="learn">
      <nav className="toc card">
        <div className="toc-title">
          In this topic <span className="muted small">({read.size}/{topic.sections.length} read)</span>
        </div>
        <ol>
          {topic.sections.map((s, i) => (
            <li key={s.heading} className={read.has(i) ? 'done' : ''}>
              <button
                type="button"
                className="link-btn"
                onClick={() => document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {s.heading}
                {vizForSection(topic.id, s.heading).length > 0 && (
                  <PlayCircle size={14} className="toc-viz" aria-label="has an interactive animation" />
                )}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      {topic.sections.map((s, i) => (
        <article key={s.heading} id={`s-${i}`} className="card section">
          <div className="section-head">
            <h2>
              <span className="section-num">{i + 1}</span> {s.heading}
            </h2>
            <label className="check">
              <input type="checkbox" checked={read.has(i)} onChange={() => toggleSectionRead(topic.id, i)} /> Read
            </label>
          </div>
          {s.source && (
            <div className="source">
              <BookOpen size={14} aria-hidden="true" /> {s.source}
            </div>
          )}
          <Markdown>{s.body}</Markdown>
          {s.diagram && <Diagram text={s.diagram} />}
          <SectionViz topic={topic} sectionIndex={i} />
          {s.code?.map((c, j) => <CodeBlock key={j} snippet={c} />)}
          {s.keyPoints && s.keyPoints.length > 0 && (
            <div className="keypoints">
              <div className="keypoints-title">Key points</div>
              <ul>
                {s.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function ChallengeCard({ c, n }: { c: CodeChallenge; n: number }) {
  const p = useProgress();
  const draftKey = `cc:${c.id}`;
  const code = p.drafts[draftKey] ?? c.starter.code;
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const done = !!p.cc[c.id];
  return (
    <article className="card">
      <div className="section-head">
        <h2>
          <span className="section-num">{n}</span> {c.title}
        </h2>
        {done && <Badge tone="good">Completed</Badge>}
      </div>
      <Markdown>{c.context}</Markdown>
      <div className="task">
        <strong>Your task:</strong> <Markdown>{c.task}</Markdown>
      </div>
      <div className="row between">
        <span className="small muted">
          {c.starter.language === 'text' ? 'Rewrite the answer below.' : 'Edit the code below.'} Your changes are saved automatically.{' '}
          {c.starter.title && `(${c.starter.title})`}
        </span>
        <button className="btn-ghost btn-xs" type="button" onClick={() => setDraft(draftKey, c.starter.code)}>
          Reset to starter
        </button>
      </div>
      <CodeEditor value={code} onChange={(v) => setDraft(draftKey, v)} language={c.starter.language} />
      {c.fnName && c.tests?.length ? (
        <>
          <p className="small muted lab-judged">
            <Zap size={14} aria-hidden="true" /> Auto-judged: your <code>{c.fnName}</code> is run against {c.tests.length} tests. Pass them all to complete this lab.
          </p>
          <TestRunner
            code={code}
            fnName={c.fnName}
            tests={c.tests}
            onAllPassed={() => {
              setFlag('cc', c.id, true);
              celebrate('Lab solved!', `${c.title}: every test passes.`);
            }}
          />
        </>
      ) : null}
      <div className="hints">
        {c.hints.slice(0, hints).map((h, i) => (
          <div key={i} className="hint">
            <Lightbulb size={15} aria-hidden="true" /> <strong>Hint {i + 1}:</strong> {h}
          </div>
        ))}
        <div className="row gap-s wrap">
          {hints < c.hints.length && (
            <button className="btn" type="button" onClick={() => setHints((h) => h + 1)}>
              Show hint {hints + 1}/{c.hints.length}
            </button>
          )}
          <button className="btn" type="button" onClick={() => setShowSolution((s) => !s)}>
            {showSolution ? 'Hide solution' : 'Compare with reference solution'}
          </button>
          <button className={`btn ${done ? '' : 'btn-primary'}`} type="button" onClick={() => setFlag('cc', c.id, !done)}>
            {done ? 'Mark not done' : 'Mark as done'}
          </button>
        </div>
      </div>
      {showSolution && (
        <div className="solution">
          <CodeBlock snippet={c.solution} />
          <Markdown>{c.explanation}</Markdown>
          <FollowUps items={c.followUps} />
        </div>
      )}
    </article>
  );
}

function InterviewTab({ topic }: { topic: Topic }) {
  const p = useProgress();
  const rated = topic.interviewQuestions.filter((q) => p.iq[q.id]).length;
  return (
    <div>
      <div className="card info">
        <strong>How to practise:</strong> answer out loud or type your answer <em>before</em> revealing anything, as you would in a
        real interview. Then compare with what the interviewer is looking for and the model answer, work through the follow-ups
        and rate yourself honestly. <span className="muted">({rated}/{topic.interviewQuestions.length} rated)</span>
      </div>
      {topic.interviewQuestions.map((q, i) => (
        <InterviewCard key={q.id} q={q} n={i + 1} />
      ))}
    </div>
  );
}

function InterviewCard({ q, n }: { q: InterviewQuestion; n: number }) {
  const p = useProgress();
  const draftKey = `iq:${q.id}`;
  const [answer, setAnswer] = useState(false);
  const [fu, setFu] = useState(0);
  const rating = p.iq[q.id];
  const rate = (r: Rating) => rateIQ(q.id, rating === r ? null : r);
  return (
    <article className="card iq">
      <div className="section-head">
        <h3>
          <span className="section-num">Q{n}</span> {q.question}
        </h3>
        <DifficultyBadge d={q.difficulty} />
      </div>
      {q.context && <div className="context">{q.context}</div>}
      <textarea
        className="answer-box"
        placeholder="Draft your answer: structure it, give a concrete example, mention risks and trade-offs…"
        value={p.drafts[draftKey] ?? ''}
        onChange={(e) => setDraft(draftKey, e.target.value)}
        rows={5}
      />
      <Reveal label="What the interviewer is looking for">
        <ul>
          {q.whatInterviewerLooksFor.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Reveal>
      {!answer ? (
        <button className="btn" type="button" onClick={() => setAnswer(true)}>
          Reveal model answer
        </button>
      ) : (
        <div className="model-answer">
          <div className="label">Model answer</div>
          <Markdown>{q.modelAnswer}</Markdown>
        </div>
      )}
      {answer && (
        <div className="followups">
          <div className="label">Interviewer follow-ups</div>
          {q.followUps.slice(0, fu).map((f, i) => (
            <div key={i} className="followup">
              <div className="fq">↳ {f.q}</div>
              <Reveal label="Show answer">
                <Markdown>{f.a}</Markdown>
              </Reveal>
            </div>
          ))}
          {fu < q.followUps.length && (
            <button className="btn-ghost" type="button" onClick={() => setFu((x) => x + 1)}>
              + Next follow-up ({fu}/{q.followUps.length})
            </button>
          )}
          <Reveal label="Pitfalls: what weak candidates say">
            <ul className="pitfalls">
              {q.pitfalls.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      )}
      <div className="rating">
        <span className="small muted">How did you do?</span>
        {(['nailed', 'partial', 'missed'] as Rating[]).map((r) => (
          <button key={r} type="button" className={`chip chip-${r} ${rating === r ? 'on' : ''}`} onClick={() => rate(r)}>
            {r === 'nailed' ? 'Nailed it' : r === 'partial' ? 'Partially' : 'Missed it'}
          </button>
        ))}
      </div>
    </article>
  );
}

function EnvelopeCard({ q, n }: { q: EnvelopeQuestion; n: number }) {
  const p = useProgress();
  const draftKey = `boe:${q.id}`;
  // stage 0: question only · 1: assumptions · 2..k+1: steps · k+2: answer
  const [stage, setStage] = useState(0);
  const total = q.steps.length + 2;
  const done = !!p.boe[q.id];
  return (
    <article className="card boe">
      <div className="section-head">
        <h3>
          <span className="section-num">E{n}</span> {q.question}
        </h3>
        {done && <Badge tone="good">Done</Badge>}
      </div>
      <textarea
        className="answer-box mono"
        placeholder="Your attempt: work it out here before revealing the solution…"
        value={p.drafts[draftKey] ?? ''}
        onChange={(e) => setDraft(draftKey, e.target.value)}
        rows={4}
      />
      {stage >= 1 && (
        <div className="assumptions">
          <div className="label">Given</div>
          <ul>
            {q.assumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {stage >= 2 && (
        <ol className="steps">
          {q.steps.slice(0, stage - 1).map((s, i) => (
            <li key={i}>
              <span className="step-label">{s.label}</span>
              <code className="step-calc">{s.calc}</code>
            </li>
          ))}
        </ol>
      )}
      {stage >= total && (
        <div className="boe-answer">
          <div className="label">Answer</div>
          <Markdown>{q.answer}</Markdown>
          <div className="insight">
            🎯 <strong>Takeaway:</strong> {q.insight}
          </div>
          <FollowUps items={q.followUps} />
        </div>
      )}
      <div className="row gap-s wrap">
        {stage < total && (
          <button className="btn" type="button" onClick={() => setStage((s) => s + 1)}>
            {stage === 0 ? 'Reveal the givens' : stage < total - 1 ? `Reveal step ${stage}/${q.steps.length}` : 'Reveal answer'}
          </button>
        )}
        {stage < total && (
          <button className="btn-ghost" type="button" onClick={() => setStage(total)}>
            Show everything
          </button>
        )}
        <button className={`btn ${done ? '' : 'btn-primary'}`} type="button" onClick={() => setFlag('boe', q.id, !done)}>
          {done ? 'Mark not done' : 'Mark as done'}
        </button>
      </div>
    </article>
  );
}

function CheatSheet({ topic }: { topic: Topic }) {
  return (
    <div className="card">
      <h2>Last-minute revision</h2>
      <ul className="cheat">
        {topic.cheatSheet.map((c) => (
          <li key={c}>
            <Markdown>{c}</Markdown>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExamIntro({ topic }: { topic: Topic }) {
  const p = useProgress();
  const nav = useNavigate();
  const rec = p.tests[topic.id];
  const minutes = Math.ceil((topic.test.length * p.settings.secondsPerQuestion) / 60);
  const multi = topic.test.filter((q) => q.correct.length > 1).length;
  const wrong = currentlyWrong(p, topic);
  const weak = weakSections(topic, wrong);
  return (
    <div className="card exam-intro">
      <h2>Timed exam: {topic.title}</h2>
      <ul>
        <li>
          <strong>{topic.test.length}</strong> scenario-based questions ({multi} are "select all that apply", which need an exact match
          to score)
        </li>
        <li>
          Default time: <strong>{minutes} min</strong> ({p.settings.secondsPerQuestion}s/question). You can change it on the next
          screen.
        </li>
        <li>
          Pass mark: <strong>{p.settings.passMark}%</strong>. Only full-length attempts count as a pass.
        </li>
        <li>The exam auto-submits when time runs out. Each explanation says why the tempting wrong options are wrong.</li>
        <li>
          <strong>Interview mode</strong> (on by default): lock in each answer to see instant feedback and the interviewer&apos;s
          follow-up questions, just like a real round.
        </li>
      </ul>
      {rec && (
        <p>
          Attempts: {rec.attempts} · Best: <strong>{rec.best}%</strong> · Last: {rec.last}%{' '}
          {rec.passedAt && <Badge tone="good">Passed</Badge>}
        </p>
      )}
      <div className="row gap-s wrap">
        <button className="btn btn-primary" type="button" onClick={() => nav(`/topic/${topic.id}/exam`)}>
          Set up exam →
        </button>
        {wrong.length > 0 && (
          <button className="btn" type="button" onClick={() => nav(`/practice?topic=${topic.id}`)}>
            Practise my {wrong.length} mistakes
          </button>
        )}
      </div>
      {weak.length > 0 && (
        <div className="weak-card inline">
          <div className="label">Your weak sections in this topic</div>
          <ul className="weak-sections">
            {weak.map((ws) => (
              <li key={ws.index}>
                <span className="weak-count">{ws.missed.length} missed</span>
                <span className="weak-heading">{ws.heading}</span>
                <Link to={`/topic/${topic.id}?tab=learn&s=${ws.index}`} className="small">
                  Revise section →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Shown instead of practice tabs until every Learn section is marked read (Settings → study-first lock). */
export function StudyLock({ topic, what }: { topic: Topic; what: string }) {
  const p = useProgress();
  const nav = useNavigate();
  const read = new Set(p.sections[topic.id] ?? []);
  const unread = topic.sections.map((s, i) => ({ s, i })).filter((x) => !read.has(x.i));
  const goRead = (i: number) => nav(`/topic/${topic.id}?tab=learn&s=${i}`);
  return (
    <div className="card study-lock">
      <h2>Study first</h2>
      <p>
        The {what} for this topic unlock once you&apos;ve read every Learn section, so the questions always come after the explanation.
      </p>
      <div className="topic-progress">
        <ProgressBar value={(read.size / Math.max(1, topic.sections.length)) * 100} />
        <span className="small muted">
          {read.size}/{topic.sections.length} sections read
        </span>
      </div>
      <div className="label">Still to read</div>
      <ol className="unread">
        {unread.map(({ s, i }) => (
          <li key={i}>
            <button type="button" className="link-btn" onClick={() => goRead(i)}>
              §{i + 1} {s.heading}
            </button>
          </li>
        ))}
      </ol>
      <div className="row gap-s wrap">
        {unread.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={() => goRead(unread[0].i)}>
            Continue reading →
          </button>
        )}
        <button
          type="button"
          className="btn-ghost small"
          onClick={() => {
            if (window.confirm('Mark every section of this topic as read and unlock its practice?')) {
              markAllSectionsRead(topic.id, topic.sections.length);
            }
          }}
        >
          I&apos;ve already studied this: mark all as read
        </button>
      </div>
      <p className="muted small">
        Tick &quot;Read&quot; on each section as you finish it. You can change or turn off this lock in <Link to="/settings">Settings</Link>.
      </p>
    </div>
  );
}

/**
 * Interactive visualisations placed on this section (lazy-loaded). A visualisation placed on
 * several sections of the same topic renders once, at its first placement; later sections link back.
 */
function SectionViz({ topic, sectionIndex }: { topic: Topic; sectionIndex: number }) {
  const vizzes = vizForSection(topic.id, topic.sections[sectionIndex].heading);
  if (!vizzes.length) return null;
  const firstIndex = (id: string) =>
    topic.sections.findIndex((s) => vizForSection(topic.id, s.heading).some((v) => v.meta.id === id));
  return (
    <>
      {vizzes.map(({ meta, Component }) => {
        const first = firstIndex(meta.id);
        if (first !== sectionIndex) {
          return (
            <button
              key={meta.id}
              type="button"
              className="viz-backlink"
              onClick={() => document.getElementById(`s-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              <PlayCircle size={15} aria-hidden="true" /> Interactive: {meta.title} (in §{first + 1} above), revisit it with this section in mind
            </button>
          );
        }
        return (
          <VizErrorBoundary key={meta.id} title={meta.title}>
            <Suspense fallback={<div className="viz-loading">Loading interactive: {meta.title}…</div>}>
              <Component />
            </Suspense>
          </VizErrorBoundary>
        );
      })}
    </>
  );
}

/**
 * Keeps a broken or unloadable visualisation (e.g. its lazy chunk failed to download because the
 * dev server restarted or the app was redeployed) from taking down the whole lesson page.
 */
class VizErrorBoundary extends Component<{ title: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="viz-loading" role="alert">
        Couldn&apos;t load the interactive &ldquo;{this.props.title}&rdquo; ({this.state.error.message}).{' '}
        <button type="button" className="link-btn" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    );
  }
}

/** "Next up" footer at the end of every tab: the next step of the loop, or the next topic. */
function TabFooter({ topic, tab, next, onSelect }: { topic: Topic; tab: TabId; next?: Topic; onSelect: (t: TabId) => void }) {
  const loop = loopTabs(topic);
  const after: TabId | undefined = tab === 'cheat' ? 'exam' : loop[loop.indexOf(tab) + 1];
  if (after) {
    return <NextUp lead={FOOTER_LEAD[tab]} label={`Next: ${tabLabel(topic, after)}`} onClick={() => onSelect(after)} />;
  }
  return next ? (
    <NextUp lead={FOOTER_LEAD[tab]} label={`Next topic: ${next.title}`} to={`/topic/${next.id}`} />
  ) : (
    <NextUp lead="That was the last topic." label="Practise JS coding problems" to="/coding" />
  );
}

/** Confetti the moment a topic reaches 100% (not when opening an already-complete topic). */
function TopicCompleteWatcher({ topic }: { topic: Topic }) {
  const p = useProgress();
  const pct = topicCompletion(p, topic);
  const prev = useRef<{ id: string; pct: number }>({ id: topic.id, pct });
  useEffect(() => {
    const was = prev.current;
    if (was.id === topic.id && was.pct < 100 && pct === 100) celebrate('Topic complete!', `${topic.title} is 100% done.`);
    prev.current = { id: topic.id, pct };
  }, [pct, topic.id, topic.title]);
  return null;
}
