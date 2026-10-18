import { Component, Suspense, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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
  type Progress,
  type Rating,
} from '../lib/progress';
import { CodeBlock, CodeEditor, Diagram, DifficultyBadge, FollowUps, Markdown, Reveal } from '../components/ui';
import { practiceLocked, topicCompletion, topicStatus } from '../lib/stats';
import { vizForSection } from '../viz/registry';
import { VizFigure } from '../viz/core';
import { TestRunner } from '../components/TestRunner';
import { currentlyWrong, weakSections } from '../lib/weak';
import { StudyPath } from '../components/StudyPath';
import { CoachTip } from '../components/CoachTip';
import { NextUp } from '../components/NextUp';
import { TAB_META, loopTabs, stepProgress, tabLabel, type TabId } from '../lib/studyLoop';
import { celebrate } from '../lib/celebrate';
import { ArrowRight, BookOpen, ChevronDown, Lightbulb, PlayCircle, RotateCcw, Zap } from 'lucide-react';

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

const pad2 = (n: number) => String(n).padStart(2, '0');
const segStyle = (n: number, v: number, extra?: Record<string, string>) =>
  ({ '--n': Math.max(1, n), '--v': Math.max(0, Math.min(n, v)), ...extra }) as CSSProperties;

/** "05.2": phase number . topic order — the topic's spec coordinate. */
function specCode(topic: Topic) {
  const phase = PHASES.find((ph) => ph.id === topic.phase);
  return `${pad2(phase?.number ?? 0)}.${topic.order}`;
}

/** Index of the first unread Learn section (the "▶ current" one), or -1 when all are read. */
function currentSection(p: Progress, topic: Topic) {
  const read = new Set(p.sections[topic.id] ?? []);
  return topic.sections.findIndex((_, i) => !read.has(i));
}

/** Splits "Main: rest" so the main part can be the holo display and the rest a sub-line. */
function splitTitle(title: string) {
  const at = title.indexOf(': ');
  if (at < 0) return { main: title, sub: '' };
  return { main: title.slice(0, at), sub: title.slice(at + 2) };
}

const noopSubscribe = () => () => {};

/** Puts a readout into the shell console strip (#console-slot). */
function ConsoleReadout({ children }: { children: ReactNode }) {
  // the slot is rendered by Layout; re-read after commit (useSyncExternalStore re-checks the snapshot)
  const slot = useSyncExternalStore(noopSubscribe, () => document.getElementById('console-slot'), () => null);
  return slot ? createPortal(<span className="tp-console">{children}</span>, slot) : null;
}

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
  const idx = TOPICS.findIndex((t) => t.id === topic.id);
  const prev = TOPICS[idx - 1];
  const next = TOPICS[idx + 1];
  const locks: Partial<Record<TabId, boolean>> = {
    interview: practiceLocked(p, topic, 'interview'),
    exam: practiceLocked(p, topic, 'exam'),
  };
  const selectTab = (t: TabId) => {
    setParams({ tab: t }, { replace: true });
    const anchor = document.querySelector<HTMLElement>('.tp-tabs-anchor');
    // bring the new tab's content into view without jumping above the topic header
    if (anchor) {
      const top = anchor.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top) window.scrollTo({ top });
    }
  };
  const cur = currentSection(p, topic);
  const spec = specCode(topic);

  return (
    <div className="page topic-page">
      <ConsoleReadout>
        SPEC {spec}
        {tab === 'learn' && cur >= 0 ? ` · §${cur + 1}` : ` · ${tabLabel(topic, tab)}`}
      </ConsoleReadout>
      <TopicCompleteWatcher topic={topic} />
      <div className="tp-bento">
        <ChapterPlate topic={topic} />
        <SpecPanel topic={topic} prev={prev} next={next} onSelect={selectTab} />

        <div className="tp-tabs-anchor" aria-hidden="true" />
        <StudyPath topic={topic} tab={tab} locks={locks} onSelect={selectTab} />

        <div className="tp-coach">
          <CoachTip id={`tab:${tab}`} title={`How to use ${tabLabel(topic, tab)}:`}>
            {TAB_META[tab].tip}
          </CoachTip>
        </div>

        {tab === 'learn' ? (
          <LearnTab topic={topic} onSelect={selectTab} locks={locks} />
        ) : (
          <div className="tp-body" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            {tab === 'code' && <CodeTab topic={topic} />}
            {tab === 'interview' && (locks.interview ? <StudyLock topic={topic} what="interview questions" /> : <InterviewTab topic={topic} />)}
            {tab === 'envelope' && topic.envelopeQuestions.map((q, i) => <EnvelopeCard key={q.id} q={q} n={i + 1} />)}
            {tab === 'cheat' && <CheatSheet topic={topic} />}
            {tab === 'exam' && (locks.exam ? <StudyLock topic={topic} what="exam" /> : <ExamIntro topic={topic} />)}
            {tab === 'company' && (
              <div className="tp-company">
                <div className="tp-callout run">
                  <span className="mlabel">Field reports</span>
                  Questions candidates reported being asked at named companies about this topic. Each links to its source. See every
                  company&apos;s questions on the <Link to="/companies">Company Questions</Link> page.
                </div>
                {(COMPANY_BY_TOPIC.get(topic.id) ?? []).map((q) => (
                  <CompanyCard key={q.id} q={q} showTopic={false} />
                ))}
              </div>
            )}
            <TabFooter topic={topic} tab={tab} next={next} onSelect={selectTab} />
            <TopicPager topic={topic} prev={prev} next={next} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- chapter plate */

function ChapterPlate({ topic }: { topic: Topic }) {
  const p = useProgress();
  const phase = PHASES.find((ph) => ph.id === topic.phase);
  const inPhase = TOPICS.filter((t) => t.phase === topic.phase);
  const status = topicStatus(p, topic);
  const pct = topicCompletion(p, topic);
  const read = (p.sections[topic.id] ?? []).filter((i) => i < topic.sections.length).length;
  const cur = currentSection(p, topic);
  const running = cur >= 0 ? 1 : 0;
  const queued = topic.sections.length - read - running;
  const { main, sub } = splitTitle(topic.title);
  const subWords = sub.split(' ');
  const size = main.length <= 12 ? 'l' : main.length <= 26 ? 'm' : 's';
  return (
    <header className="panel cut-lg tp-chap rise" style={{ '--i': 1 } as CSSProperties}>
      <span className="ghost-no" aria-hidden="true">
        {specCode(topic)}
      </span>
      <div className="chap-top">
        {status === 'passed' ? (
          <span className="chip pass">
            <span className="g">✓</span>Spec passed
          </span>
        ) : status === 'in-progress' ? (
          <span className="chip run">Spec running</span>
        ) : (
          <span className="chip skip">Queued</span>
        )}
        <span className="mlabel">
          <b>Phase {pad2(phase?.number ?? 0)}</b> · {phase?.title} · topic {topic.order} of {inPhase.length}
        </span>
        <span className="coord">{topic.id.toUpperCase()}</span>
      </div>
      <h1 className={`chap-title t-${size}`} style={{ '--lw': Math.max(...main.split(/\s+/).map((w) => w.length)) } as CSSProperties}>
        <span className="display holo-text">{main}</span>
        {sub && (
          <span className="sub">
            <span className="outline">{subWords.slice(0, 2).join(' ')}</span> {subWords.slice(2).join(' ')}
          </span>
        )}
      </h1>
      <p className="lede">{topic.subtitle}</p>
      <div className="instr" aria-label="Spec readouts">
        <div>
          <span className="mlabel">Phase</span>
          <div className="v">
            {pad2(phase?.number ?? 0)}
            <small>/ {pad2(PHASES.length)}</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Time</span>
          <div className="v">
            {topic.estimatedMinutes}
            <small>min</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Sections</span>
          <div className="v">
            {topic.sections.length}
            <small>§</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Labs</span>
          <div className="v">
            {topic.codeChallenges.length}
            <small>{topic.envelopeQuestions.length ? `+ ${topic.envelopeQuestions.length} drills` : 'labs'}</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Exam</span>
          <div className="v">
            {topic.test.length}
            <small>Q · {p.settings.passMark}%</small>
          </div>
        </div>
        <div className="cmp">
          <div className="row">
            <span className="mlabel">Completion</span>
            <span className="mlabel">
              <b>{pct}%</b>
            </span>
          </div>
          <div
            className="seg tall"
            style={segStyle(topic.sections.length, read, { '--gap': '3px' })}
            role="img"
            aria-label={`${read} of ${topic.sections.length} sections read; topic ${pct}% complete`}
          />
          <div className="lg" aria-hidden="true">
            <span>
              <i className="k-pass" />
              {read} ✓
            </span>
            <span>
              <i className="k-run" />
              {running} ▶
            </span>
            <span>
              <i className="k-q" />
              {queued} ○
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- spec coordinates */

function SpecPanel({ topic, prev, next, onSelect }: { topic: Topic; prev?: Topic; next?: Topic; onSelect: (t: TabId) => void }) {
  const p = useProgress();
  const cur = currentSection(p, topic);
  const steps = loopTabs(topic);
  return (
    <aside className="panel tp-spec rise" style={{ '--i': 2 } as CSSProperties} aria-labelledby="spec-t">
      <div className="p-head">
        <span className="mlabel" id="spec-t">
          Spec coordinates
        </span>
        <span className="mlabel">
          <b>{specCode(topic)}</b>
        </span>
      </div>
      <dl className="spec-tbl">
        <div>
          <dt>Topic id</dt>
          <dd className="mono">{topic.id}</dd>
        </div>
        <div>
          <dt>Now</dt>
          <dd>
            {cur >= 0 ? (
              <>
                <span className="t-cyan mono">§{cur + 1}</span> {topic.sections[cur].heading}
              </>
            ) : (
              <>
                <span className="t-pass mono">✓</span> Every section read
              </>
            )}
          </dd>
        </div>
        {prev && (
          <div>
            <dt>Before</dt>
            <dd>
              <Link to={`/topic/${prev.id}`} className="spec-link">
                <span className="mono">{specCode(prev)}</span> {prev.title}
              </Link>{' '}
              {topicStatus(p, prev) === 'passed' && <span className="t-pass mono">✓</span>}
            </dd>
          </div>
        )}
        {next && (
          <div>
            <dt>Unlocks</dt>
            <dd>
              <Link to={`/topic/${next.id}`} className="spec-link">
                <span className="mono">{specCode(next)}</span> {next.title}
              </Link>
            </dd>
          </div>
        )}
      </dl>
      <div className="chan">
        {steps.map((s) => {
          const prog = stepProgress(p, topic, s);
          const exam = s === 'exam';
          const n = exam ? 10 : Math.min(prog.total, 20);
          const v = exam ? (prog.complete ? 10 : Math.round(prog.done / 10)) : Math.round((prog.done / Math.max(1, prog.total)) * n);
          return (
            <div key={s}>
              <span>{tabLabel(topic, s)}</span>
              <span className="mono">{exam ? prog.text : `${prog.done} / ${prog.total}`}</span>
              <div className="seg thin" style={segStyle(n, v, prog.complete ? { '--g': 'var(--pass)' } : {})} aria-hidden="true" />
            </div>
          );
        })}
      </div>
      <div className="tags">
        {topic.tags.slice(0, 8).map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      {topic.sources.length > 0 && (
        <details className="topic-sources">
          <summary className="mlabel">Sources ({topic.sources.length})</summary>
          <ul>
            {topic.sources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="go">
        <button type="button" className="btn btn-line btn-sm" onClick={() => onSelect('exam')}>
          Exam
        </button>
        <button type="button" className="btn btn-line btn-sm" onClick={() => onSelect('cheat')}>
          Cheat sheet
        </button>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- learn */

function LearnTab({ topic, onSelect, locks }: { topic: Topic; onSelect: (t: TabId) => void; locks: Partial<Record<TabId, boolean>> }) {
  const p = useProgress();
  const read = new Set(p.sections[topic.id] ?? []);
  const [params] = useSearchParams();
  const target = params.get('s');
  const [tocOpen, setTocOpen] = useState(false);
  const cur = currentSection(p, topic);
  const total = topic.sections.length;
  const readCount = topic.sections.filter((_, i) => read.has(i)).length;
  const secMin = Math.max(1, Math.round(topic.estimatedMinutes / Math.max(1, total)));
  const spec = specCode(topic);
  const idx = TOPICS.findIndex((t) => t.id === topic.id);
  const next = TOPICS[idx + 1];
  const prev = TOPICS[idx - 1];

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

  const go = (i: number) => {
    setTocOpen(false);
    document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const after = loopTabs(topic).filter((t) => t !== 'learn');

  return (
    <>
      <aside className={`panel tp-toc rise ${tocOpen ? 'open' : ''}`} style={{ '--i': 4 } as CSSProperties} aria-labelledby="toc-t">
        <button type="button" className="toc-toggle" aria-expanded={tocOpen} aria-controls="toc-tree" onClick={() => setTocOpen((o) => !o)}>
          <span className="mlabel" id="toc-t">
            Contents · spec tree
          </span>
          <span className="mlabel">
            <b>
              {readCount}/{total}
            </b>
          </span>
          <ChevronDown size={16} aria-hidden="true" className="toc-chev" />
        </button>
        <div className="toc-meter">
          <div className="row">
            <b>
              {readCount}
              <small>/{total} read</small>
            </b>
            {cur >= 0 && <span className="mlabel t-cyan">§{cur + 1} ▸</span>}
          </div>
          <div className="seg" style={segStyle(total, readCount)} aria-hidden="true" />
        </div>
        <div className="tree-wrap" id="toc-tree">
          <ol className="tree">
            {topic.sections.map((s, i) => {
              const st = read.has(i) ? 'pass' : i === cur ? 'run' : 'queued';
              return (
                <li key={s.heading}>
                  <button type="button" className={`tl ${st}`} onClick={() => go(i)} aria-current={i === cur ? 'step' : undefined}>
                    <span className="m" aria-hidden="true">
                      {st === 'pass' ? '✓' : st === 'run' ? '▶' : '○'}
                    </span>
                    <span className="n">§{pad2(i + 1)}</span>
                    <span className="tx">
                      {s.heading}
                      <span className="sr-only">{st === 'pass' ? ' (read)' : st === 'run' ? ' (current)' : ''}</span>
                      {vizForSection(topic.id, s.heading).length > 0 && (
                        <span className="fig" title="Has an interactive figure">
                          <PlayCircle size={11} aria-hidden="true" /> FIG
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {after.length > 0 && (
            <>
              <div className="tree-g">
                <span className="mlabel">After the read</span>
              </div>
              <ol className="tree extra">
                {after.map((t) => {
                  const prog = stepProgress(p, topic, t);
                  const locked = !!locks[t];
                  const st = prog.complete ? 'pass' : 'queued';
                  return (
                    <li key={t}>
                      <button type="button" className={`tl ${st} ${locked ? 'locked' : ''}`} onClick={() => onSelect(t)}>
                        <span className="m" aria-hidden="true">
                          {prog.complete ? '✓' : locked ? '⊘' : '○'}
                        </span>
                        <span className="n">{t === 'envelope' ? 'DRL' : t === 'interview' ? 'INT' : t === 'company' ? 'CMP' : t === 'exam' ? 'EXM' : 'LAB'}</span>
                        <span className="tx">
                          {tabLabel(topic, t)} · <span className="mono">{locked ? 'locked' : prog.text}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
          <div className="toc-foot">
            <span className="coord">≈ {Math.round((topic.estimatedMinutes * (total - readCount)) / Math.max(1, total))} MIN LEFT</span>
            <span className="coord">SPEC {spec}</span>
          </div>
        </div>
      </aside>

      <div className="tp-article" role="tabpanel" aria-labelledby="tab-learn">
        {topic.sections.map((s, i) => {
          const isRead = read.has(i);
          const { main, sub } = splitTitle(s.heading);
          return (
            <div key={s.heading} className="sec-group">
              <section id={`s-${i}`} className={`panel tp-sec ${isRead ? 'is-read' : ''}`} aria-labelledby={`s-${i}-t`}>
                <div className="sec-no">
                  <span className="big">
                    § {pad2(i + 1)} / {pad2(total)}
                  </span>
                  {isRead ? (
                    <span className="chip pass">
                      <span className="g">✓</span>Read
                    </span>
                  ) : i === cur ? (
                    <span className="chip run">Reading</span>
                  ) : (
                    <span className="chip skip">Queued</span>
                  )}
                  <span className="coord">
                    {spec}.{i + 1} · ≈ {secMin} MIN
                  </span>
                </div>
                <h2 className="h2" id={`s-${i}-t`}>
                  {main}
                  {sub && (
                    <>
                      : <span className="outline">{sub}</span>
                    </>
                  )}
                </h2>
                {s.source && (
                  <div className="source">
                    <BookOpen size={14} aria-hidden="true" /> {s.source}
                  </div>
                )}
                <div className="prose">
                  <Markdown>{s.body}</Markdown>
                </div>
                {s.diagram && <Diagram text={s.diagram} />}
                <div className="sec-foot">
                  <label className={`tp-tick ${isRead ? 'on' : ''}`}>
                    <input type="checkbox" checked={isRead} onChange={() => toggleSectionRead(topic.id, i)} />
                    <span className="box" aria-hidden="true">
                      {isRead ? '✓' : ''}
                    </span>
                    <span>{isRead ? 'Read · passed' : 'Mark as read'}</span>
                  </label>
                  {i < total - 1 && (
                    <button type="button" className="btn-ghost btn-sm" onClick={() => go(i + 1)}>
                      §{pad2(i + 2)} next <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </section>
              <SectionViz topic={topic} sectionIndex={i} />
              {s.code && s.code.length > 0 && (
                <section className="panel tp-work" aria-label={`Worked example for section ${i + 1}`}>
                  <div className="p-head">
                    <span className="mlabel">
                      Worked example · <b>§{i + 1}</b>
                    </span>
                    <span className="mlabel">
                      {s.code.length} snippet{s.code.length === 1 ? '' : 's'} · {Array.from(new Set(s.code.map((c) => c.language))).join(' · ')}
                    </span>
                  </div>
                  {s.code.map((c, j) => (
                    <CodeBlock key={j} snippet={c} />
                  ))}
                </section>
              )}
              {s.keyPoints && s.keyPoints.length > 0 && (
                <aside className="panel tp-keys" aria-label={`Key points, section ${i + 1}`}>
                  <div className="p-head">
                    <span className="mlabel">Key points · §{i + 1}</span>
                    <span className="mlabel">
                      <b>{s.keyPoints.length}</b>
                    </span>
                  </div>
                  <ol className="kp">
                    {s.keyPoints.map((k) => (
                      <li key={k}>
                        <span>{k}</span>
                      </li>
                    ))}
                  </ol>
                </aside>
              )}
            </div>
          );
        })}
        <TabFooter topic={topic} tab="learn" next={next} onSelect={onSelect} />
        <TopicPager topic={topic} prev={prev} next={next} />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- code lab */

function CodeTab({ topic }: { topic: Topic }) {
  const p = useProgress();
  // the one foil card per screen: the first lab still to do
  const foilId = topic.codeChallenges.find((c) => !p.cc[c.id])?.id;
  return (
    <>
      {topic.codeChallenges.map((c, i) => (
        <ChallengeCard key={c.id} c={c} n={i + 1} foil={c.id === foilId} />
      ))}
    </>
  );
}

function ChallengeCard({ c, n, foil }: { c: CodeChallenge; n: number; foil: boolean }) {
  const p = useProgress();
  const draftKey = `cc:${c.id}`;
  const code = p.drafts[draftKey] ?? c.starter.code;
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const done = !!p.cc[c.id];
  const edited = p.drafts[draftKey] !== undefined && p.drafts[draftKey] !== c.starter.code;
  return (
    <article className={`panel cut-lg tp-try ${foil ? 'foil' : ''}`} aria-labelledby={`cc-${c.id}`}>
      <div className="try">
        <div>
          <div className="p-head">
            <span className="chip holo">Lab {pad2(n)}</span>
            {done ? (
              <span className="chip pass">
                <span className="g">✓</span>Completed
              </span>
            ) : (
              <span className="mlabel">{edited ? 'draft saved' : 'not started'}</span>
            )}
          </div>
          <h3 className="h3" id={`cc-${c.id}`}>
            {c.title}
          </h3>
          <div className="prose">
            <Markdown>{c.context}</Markdown>
          </div>
        </div>
        <div className="side">
          <div className="task">
            <span className="mlabel">Your task</span>
            <Markdown>{c.task}</Markdown>
          </div>
          <div className="acts">
            {hints < c.hints.length && (
              <button className="btn btn-line btn-sm" type="button" onClick={() => setHints((h) => h + 1)}>
                Hint {hints + 1} / {c.hints.length}
              </button>
            )}
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? 'Hide solution' : 'Compare with reference'}
            </button>
            <button className={`btn btn-sm ${!done && foil ? 'btn-primary' : 'btn-line'}`} type="button" onClick={() => setFlag('cc', c.id, !done)}>
              {done ? 'Mark not done' : 'Mark as done'}
            </button>
          </div>
          {c.hints.slice(0, hints).map((h, i) => (
            <div key={i} className="hintline">
              <span className="mlabel">Hint {i + 1}</span>
              <span>{h}</span>
            </div>
          ))}
        </div>
        <div className="ed" data-theme="dark">
          <div className="ed-tabs">
            <span className="on">{c.starter.title ?? `lab-${pad2(n)}.${c.starter.language === 'text' ? 'txt' : c.starter.language}`}</span>
            <span className="kb">{c.starter.language === 'text' ? 'REWRITE' : 'EDIT'} · AUTOSAVED</span>
            <button className="ed-reset" type="button" onClick={() => setDraft(draftKey, c.starter.code)}>
              <RotateCcw size={12} aria-hidden="true" /> Reset to starter
            </button>
          </div>
          <CodeEditor value={code} onChange={(v) => setDraft(draftKey, v)} language={c.starter.language} />
          {c.fnName && c.tests?.length ? (
            <div className="out">
              <p className="lab-judged">
                <Zap size={13} aria-hidden="true" /> Auto-judged: <code>{c.fnName}</code> runs against {c.tests.length} tests. Pass them all to
                complete this lab.
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
            </div>
          ) : null}
        </div>
      </div>
      {showSolution && (
        <div className="solution">
          <span className="mlabel">Reference solution</span>
          <CodeBlock snippet={c.solution} />
          <div className="prose">
            <Markdown>{c.explanation}</Markdown>
          </div>
          <FollowUps items={c.followUps} />
        </div>
      )}
    </article>
  );
}

/* ---------------------------------------------------------------- interview */

function InterviewTab({ topic }: { topic: Topic }) {
  const p = useProgress();
  const rated = topic.interviewQuestions.filter((q) => p.iq[q.id]).length;
  const total = topic.interviewQuestions.length;
  return (
    <>
      <div className="tp-callout run">
        <div className="row between wrap">
          <span className="mlabel">How to practise</span>
          <span className="mlabel">
            <b>
              {rated}/{total}
            </b>{' '}
            rated
          </span>
        </div>
        Answer out loud or type your answer <em>before</em> revealing anything, as you would in a real interview. Then compare with what
        the interviewer is looking for and the model answer, work through the follow-ups and rate yourself honestly.
        <div className="seg thin" style={segStyle(total, rated)} aria-hidden="true" />
      </div>
      {topic.interviewQuestions.map((q, i) => (
        <InterviewCard key={q.id} q={q} n={i + 1} />
      ))}
    </>
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
    <article className="panel tp-card iq">
      <div className="p-head">
        <span className="mlabel">
          <b>Q{pad2(n)}</b> · interview
        </span>
        <DifficultyBadge d={q.difficulty} />
        {rating && <span className={`chip ${rating === 'nailed' ? 'pass' : rating === 'partial' ? 'flaky' : 'fail'}`}>{rating}</span>}
      </div>
      <h3 className="card-q">{q.question}</h3>
      {q.context && <div className="context">{q.context}</div>}
      <textarea
        className="answer-box"
        placeholder="Draft your answer: structure it, give a concrete example, mention risks and trade-offs…"
        value={p.drafts[draftKey] ?? ''}
        onChange={(e) => setDraft(draftKey, e.target.value)}
        rows={5}
        aria-label={`Your answer to question ${n}`}
      />
      <Reveal label="What the interviewer is looking for">
        <div className="pr-list">
          {q.whatInterviewerLooksFor.map((s) => (
            <div key={s} className="pr-row ok">
              <span className="st">PASS</span>
              <div>{s}</div>
            </div>
          ))}
        </div>
      </Reveal>
      {!answer ? (
        <button className="btn btn-line btn-sm" type="button" onClick={() => setAnswer(true)}>
          Reveal model answer
        </button>
      ) : (
        <div className="model-answer">
          <span className="mlabel">Model answer</span>
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
            <button className="btn-ghost btn-sm" type="button" onClick={() => setFu((x) => x + 1)}>
              + Next follow-up ({fu}/{q.followUps.length})
            </button>
          )}
          <Reveal label="Pitfalls: what weak candidates say">
            <div className="pr-list">
              {q.pitfalls.map((s) => (
                <div key={s} className="pr-row bad">
                  <span className="st">FAIL</span>
                  <div>{s}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}
      <div className="rating">
        <span className="mlabel">How did you do?</span>
        {(['nailed', 'partial', 'missed'] as Rating[]).map((r) => (
          <button key={r} type="button" aria-pressed={rating === r} className={`chip chip-${r} ${rating === r ? 'on' : ''}`} onClick={() => rate(r)}>
            {r === 'nailed' ? 'Nailed it' : r === 'partial' ? 'Partially' : 'Missed it'}
          </button>
        ))}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- drills */

function EnvelopeCard({ q, n }: { q: EnvelopeQuestion; n: number }) {
  const p = useProgress();
  const draftKey = `boe:${q.id}`;
  // stage 0: question only · 1: assumptions · 2..k+1: steps · k+2: answer
  const [stage, setStage] = useState(0);
  const total = q.steps.length + 2;
  const done = !!p.boe[q.id];
  return (
    <article className="panel tp-card boe">
      <div className="p-head">
        <span className="mlabel">
          <b>Drill {pad2(n)}</b> · stage {Math.min(stage, total)}/{total}
        </span>
        {done && (
          <span className="chip pass">
            <span className="g">✓</span>Done
          </span>
        )}
      </div>
      <h3 className="card-q">{q.question}</h3>
      <div className="seg thin" style={segStyle(total, stage, { '--g': 'var(--run)' })} aria-hidden="true" />
      <textarea
        className="answer-box mono"
        placeholder="Your attempt: work it out here before revealing the solution…"
        value={p.drafts[draftKey] ?? ''}
        onChange={(e) => setDraft(draftKey, e.target.value)}
        rows={4}
        aria-label={`Your working for drill ${n}`}
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
              <span className="ln">S{pad2(i + 1)}</span>
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
            <Lightbulb size={15} aria-hidden="true" className="card-icon" /> <strong>Takeaway:</strong> {q.insight}
          </div>
          <FollowUps items={q.followUps} />
        </div>
      )}
      <div className="row gap-s wrap">
        {stage < total && (
          <button className="btn btn-line btn-sm" type="button" onClick={() => setStage((s) => s + 1)}>
            {stage === 0 ? 'Reveal the givens' : stage < total - 1 ? `Reveal step ${stage}/${q.steps.length}` : 'Reveal answer'}
          </button>
        )}
        {stage < total && (
          <button className="btn-ghost btn-sm" type="button" onClick={() => setStage(total)}>
            Show everything
          </button>
        )}
        <button className="btn btn-line btn-sm" type="button" onClick={() => setFlag('boe', q.id, !done)}>
          {done ? 'Mark not done' : 'Mark as done'}
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- cheat sheet */

function CheatSheet({ topic }: { topic: Topic }) {
  return (
    <section className="panel cut-lg tp-cheat" aria-labelledby="cheat-t">
      <div className="p-head">
        <span className="mlabel">
          Cheat sheet · SPEC <b>{specCode(topic)}</b>
        </span>
        <span className="mlabel">
          <b>{topic.cheatSheet.length}</b> lines
        </span>
      </div>
      <h2 className="h2" id="cheat-t">
        Last-minute <span className="outline">revision</span>
      </h2>
      <ol className="kp cheat">
        {topic.cheatSheet.map((c) => (
          <li key={c}>
            <Markdown>{c}</Markdown>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- exam */

function ExamIntro({ topic }: { topic: Topic }) {
  const p = useProgress();
  const nav = useNavigate();
  const rec = p.tests[topic.id];
  const minutes = Math.ceil((topic.test.length * p.settings.secondsPerQuestion) / 60);
  const multi = topic.test.filter((q) => q.correct.length > 1).length;
  const wrong = currentlyWrong(p, topic);
  const weak = weakSections(topic, wrong);
  return (
    <section className="panel cut-lg tp-exam exam-intro" aria-labelledby="exam-t">
      <div className="p-head">
        <span className="mlabel">Timed exam · SPEC {specCode(topic)}</span>
        {rec?.passedAt ? (
          <span className="chip pass">
            <span className="g">✓</span>Passed
          </span>
        ) : rec ? (
          <span className="chip fail">Not passed</span>
        ) : (
          <span className="chip skip">Not run</span>
        )}
      </div>
      <h2 className="h2" id="exam-t">
        {topic.title}
      </h2>
      <div className="instr ex-instr">
        <div>
          <span className="mlabel">Questions</span>
          <div className="v">
            {topic.test.length}
            <small>Q</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Select-all</span>
          <div className="v">
            {multi}
            <small>exact</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Time</span>
          <div className="v">
            {minutes}
            <small>min · {p.settings.secondsPerQuestion}s/Q</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Pass mark</span>
          <div className="v">
            {p.settings.passMark}
            <small>%</small>
          </div>
        </div>
        <div>
          <span className="mlabel">Best</span>
          <div className="v">
            {rec ? rec.best : '—'}
            <small>{rec ? `% · ${rec.attempts} runs · last ${rec.last}%` : 'not run'}</small>
          </div>
        </div>
      </div>
      <ul className="ex-rules">
        <li>
          {topic.test.length} scenario-based questions; {multi} are &ldquo;select all that apply&rdquo;, which need an exact match to score.
          You can change the time on the next screen.
        </li>
        <li>Only full-length attempts count as a pass. The exam auto-submits when time runs out.</li>
        <li>Each explanation says why the tempting wrong options are wrong.</li>
        <li>
          <strong>Interview mode</strong> (on by default): lock in each answer to see instant feedback and the interviewer&apos;s follow-up
          questions, just like a real round.
        </li>
      </ul>
      <div className="row gap-s wrap">
        <button className="btn btn-primary" type="button" onClick={() => nav(`/topic/${topic.id}/exam`)}>
          Set up exam <ArrowRight size={16} aria-hidden="true" />
        </button>
        {wrong.length > 0 && (
          <button className="btn btn-line" type="button" onClick={() => nav(`/practice?topic=${topic.id}`)}>
            Practise my {wrong.length} mistakes
          </button>
        )}
      </div>
      {weak.length > 0 && (
        <div className="tp-weak">
          <div className="p-head">
            <span className="mlabel">Your weak sections in this topic</span>
            <span className="chip fail">{weak.length} fail</span>
          </div>
          {weak.map((ws) => (
            <div key={ws.index} className="pr-row bad">
              <span className="st">FAIL</span>
              <div>
                <b>
                  §{ws.index + 1} {ws.heading}
                </b>
                <p>
                  {ws.missed.length} missed exam question{ws.missed.length === 1 ? '' : 's'} map to this section.
                </p>
                <div className="fix">
                  <span className="fx">FIX</span>
                  <Link to={`/topic/${topic.id}?tab=learn&s=${ws.index}`}>Revise §{ws.index + 1} →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Shown instead of practice tabs until every Learn section is marked read (Settings → study-first lock). */
export function StudyLock({ topic, what }: { topic: Topic; what: string }) {
  const p = useProgress();
  const nav = useNavigate();
  const read = new Set(p.sections[topic.id] ?? []);
  const readCount = topic.sections.filter((_, i) => read.has(i)).length;
  const unread = topic.sections.map((s, i) => ({ s, i })).filter((x) => !read.has(x.i));
  const goRead = (i: number) => nav(`/topic/${topic.id}?tab=learn&s=${i}`);
  return (
    <section className="panel cut-lg study-lock" aria-labelledby="lock-t">
      <div className="p-head">
        <span className="chip skip">⊘ Locked</span>
        <span className="mlabel">Prerequisite · Learn</span>
      </div>
      <h2 className="h2" id="lock-t">
        Study <span className="outline">first</span>
      </h2>
      <p className="lock-lede">
        The {what} for this topic unlock once you&apos;ve read every Learn section, so the questions always come after the explanation.
      </p>
      <div className="lock-meter">
        <div className="row between">
          <span className="mlabel">Sections read</span>
          <span className="mono">
            {readCount}/{topic.sections.length}
          </span>
        </div>
        <div className="seg tall" style={segStyle(topic.sections.length, readCount, { '--gap': '3px' })} aria-hidden="true" />
      </div>
      <div className="label">Still to read</div>
      <ol className="tree unread">
        {unread.map(({ s, i }, k) => (
          <li key={i}>
            <button type="button" className={`tl ${k === 0 ? 'run' : 'queued'}`} onClick={() => goRead(i)}>
              <span className="m" aria-hidden="true">
                {k === 0 ? '▶' : '○'}
              </span>
              <span className="n">§{pad2(i + 1)}</span>
              <span className="tx">{s.heading}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="row gap-s wrap">
        {unread.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={() => goRead(unread[0].i)}>
            Continue reading <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className="btn-ghost btn-sm"
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
    </section>
  );
}

/* ---------------------------------------------------------------- figures */

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
      {vizzes.map(({ meta, Component }, k) => {
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
          <VizFigure key={meta.id} fig={`${sectionIndex + 1}.${k + 1}`} spec={specCode(topic)}>
            <VizErrorBoundary title={meta.title}>
              <Suspense fallback={<div className="viz-loading">Loading interactive: {meta.title}…</div>}>
                <Component />
              </Suspense>
            </VizErrorBoundary>
          </VizFigure>
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

/* ---------------------------------------------------------------- footer + pager */

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

/** Previous / next topic, with the position in the syllabus between them. */
function TopicPager({ topic, prev, next }: { topic: Topic; prev?: Topic; next?: Topic }) {
  const p = useProgress();
  const idx = TOPICS.findIndex((t) => t.id === topic.id);
  const passed = TOPICS.filter((t) => topicStatus(p, t) === 'passed').length;
  return (
    <nav className="panel tp-pager" aria-label="Topic pager">
      {prev ? (
        <Link className="pg prev" to={`/topic/${prev.id}`}>
          <span className="dir" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
          <span className="pg-t">
            <span className="mlabel">
              SPEC {specCode(prev)}
              {topicStatus(p, prev) === 'passed' ? ' · passed ✓' : ' · previous'}
            </span>
            <span className="t">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span className="pg" />
      )}
      <div className="pg-mid">
        <span className="mlabel">
          Topic <b>{idx + 1}</b> of {TOPICS.length}
        </span>
        <div className="seg thin" style={segStyle(TOPICS.length, passed, { '--gap': '2px' })} role="img" aria-label={`${passed} of ${TOPICS.length} topics passed`} />
        <span className="coord">{passed} PASSED</span>
      </div>
      {next ? (
        <Link className="pg next" to={`/topic/${next.id}`}>
          <span className="pg-t">
            <span className="mlabel">SPEC {specCode(next)} · next</span>
            <span className="t">{next.title}</span>
          </span>
          <span className="dir" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        </Link>
      ) : (
        <Link className="pg next" to="/coding">
          <span className="pg-t">
            <span className="mlabel">Then</span>
            <span className="t">JavaScript coding practice</span>
          </span>
          <span className="dir" aria-hidden="true">
            <ArrowRight size={18} />
          </span>
        </Link>
      )}
    </nav>
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
