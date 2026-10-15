import { motion } from 'motion/react';
import { Check, ChevronRight, Lock } from 'lucide-react';
import type { Topic } from '../types';
import { useProgress } from '../lib/progress';
import { TAB_META, loopTabs, stepProgress, tabLabel, type TabId } from '../lib/studyLoop';

/**
 * Sticky "Study path" stepper: the topic's tabs shown as the study loop, each with its
 * own mini progress. It is the tab bar (same `?tab=` ids), so it keeps tablist semantics.
 */
export function StudyPath({
  topic,
  tab,
  locks,
  onSelect,
}: {
  topic: Topic;
  tab: TabId;
  locks: Partial<Record<TabId, boolean>>;
  onSelect: (id: TabId) => void;
}) {
  const p = useProgress();
  const steps = loopTabs(topic);
  // "current" = the first step not yet complete; earlier ones are done, later ones todo
  const currentIdx = steps.findIndex((id) => !stepProgress(p, topic, id).complete);
  const extras: TabId[] = ['cheat'];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const all = [...steps, ...extras];
    const i = all.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
      onSelect(next);
      requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus());
    }
  };

  const renderStep = (id: TabId, n?: number) => {
    const meta = TAB_META[id];
    const Icon = meta.icon;
    const prog = stepProgress(p, topic, id);
    const locked = !!locks[id];
    const idx = steps.indexOf(id);
    const state = locked ? 'locked' : prog.complete ? 'done' : idx === currentIdx ? 'current' : 'todo';
    const active = tab === id;
    const pct = prog.total ? Math.min(100, (prog.done / prog.total) * 100) : 0;
    return (
      <button
        key={id}
        id={`tab-${id}`}
        role="tab"
        type="button"
        aria-selected={active}
        aria-label={n === undefined ? tabLabel(topic, id) : undefined}
        tabIndex={active ? 0 : -1}
        className={`path-step st-${state} ${active ? 'active' : ''} ${n === undefined ? 'path-extra' : ''}`}
        onClick={() => onSelect(id)}
        title={`${meta.why}${locked ? ' (Read every Learn section first)' : ''}`}
      >
        {active && <motion.span layoutId={`path-indicator-${topic.id}`} className="path-indicator" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
        <span className="path-icon" aria-hidden="true">
          {locked ? <Lock size={15} /> : state === 'done' ? <Check size={15} strokeWidth={3} /> : <Icon size={15} />}
        </span>
        <span className="path-text">
          <span className="path-label">
            {n !== undefined && <span className="sr-only">Step {n}: </span>}
            {tabLabel(topic, id)}
          </span>
          {id !== 'cheat' && (
            <span className="path-meta">
              {locked ? 'locked' : prog.text}
              <span className="path-bar" aria-hidden="true">
                <motion.span className="path-bar-fill" initial={false} animate={{ width: `${id === 'exam' && prog.complete ? 100 : pct}%` }} transition={{ duration: 0.4 }} />
              </span>
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <div className="study-path" role="tablist" aria-label="Study path" onKeyDown={onKeyDown}>
      {steps.map((id, i) => (
        <span key={id} className="path-item">
          {i > 0 && <ChevronRight size={14} className="path-sep" aria-hidden="true" />}
          {renderStep(id, i + 1)}
        </span>
      ))}
      <span className="path-spacer" />
      {extras.map((id) => renderStep(id))}
    </div>
  );
}
