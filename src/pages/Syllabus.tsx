// #/syllabus: every topic by stage, with its status, and a filter. A stage folds open and shut (remembered in the UI
// prefs). The list styles are shared with the rest of the shell (shell.css: .side-phase, .side-link, .search).
import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { PHASES, TOPICS } from '../content';
import { useProgress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { getUiPrefs, saveUiPrefs } from '../lib/uiPrefs';

const STATUS_LABEL = { new: 'not started', 'in-progress': 'in progress', passed: 'passed' } as const;

export default function SyllabusPage() {
  const p = useProgress();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => getUiPrefs().collapsedPhases);
  useEffect(() => saveUiPrefs({ collapsedPhases: collapsed }), [collapsed]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOPICS;
    return TOPICS.filter((t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)));
  }, [query]);
  const passed = TOPICS.filter((t) => topicStatus(p, t) === 'passed').length;

  return (
    <div className="page syllabus-page">
      <section className="panel syllabus-panel rise" aria-labelledby="syl-title">
        <div className="syllabus-head">
          <h1 id="syl-title" className="syllabus-title">
            Syllabus
          </h1>
          <span className="mlabel">
            <b>{passed}</b> / {TOPICS.length} passed
          </span>
        </div>
        <div className="syllabus-legend" aria-hidden="true">
          <span className="mark mark-passed" /> passed <span className="mark mark-in-progress" /> started <span className="mark mark-new" /> not run
        </div>
        <input className="search" placeholder="Filter topics, tags…" aria-label="Filter topics" value={query} onChange={(e) => setQuery(e.target.value)} />
        <nav aria-label="Topics by phase">
          {PHASES.map((ph) => {
            const topics = filtered.filter((t) => t.phase === ph.id);
            if (!topics.length) return null;
            const isCollapsed = collapsed[ph.id] && !query;
            const phPassed = topics.filter((t) => topicStatus(p, t) === 'passed').length;
            return (
              <div key={ph.id} className="side-phase">
                <button className="side-phase-title" onClick={() => setCollapsed((c) => ({ ...c, [ph.id]: !c[ph.id] }))} type="button" aria-expanded={!isCollapsed}>
                  <span className="side-phase-num">{String(ph.number).padStart(2, '0')}</span>
                  <span className="side-phase-name">{ph.title}</span>
                  <span className="side-phase-count">
                    {phPassed}/{topics.length}
                  </span>
                  <ChevronDown size={14} aria-hidden="true" className={`chev-icon ${isCollapsed ? 'closed' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      className="side-phase-list"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {topics.map((t) => {
                        const st = topicStatus(p, t);
                        return (
                          <NavLink key={t.id} to={`/topic/${t.id}`} className="side-link side-topic">
                            <span className={`mark mark-${st}`} aria-hidden="true" />
                            <span className="side-topic-title">{t.title}</span>
                            <span className="sr-only">, {STATUS_LABEL[st]}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {!filtered.length && <p className="muted">No topic matches “{query}”.</p>}
        </nav>
      </section>
    </div>
  );
}
