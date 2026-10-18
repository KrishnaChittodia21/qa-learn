import { Lock } from 'lucide-react';
import type { Topic } from '../types';
import { useProgress } from '../lib/progress';
import { TAB_META, loopTabs, stepProgress, tabLabel, type TabId } from '../lib/studyLoop';
import { COMPANY_BY_TOPIC } from '../content';

/** How many items a tab holds (shown as the mono count beside its label). */
function tabCount(topic: Topic, id: TabId): number {
  switch (id) {
    case 'learn':
      return topic.sections.length;
    case 'code':
      return topic.codeChallenges.length;
    case 'interview':
      return topic.interviewQuestions.length;
    case 'envelope':
      return topic.envelopeQuestions.length;
    case 'cheat':
      return topic.cheatSheet.length;
    case 'exam':
      return topic.test.length;
    case 'company':
      return COMPANY_BY_TOPIC.get(topic.id)?.length ?? 0;
  }
}

/**
 * Sticky "Study path" tab strip: the topic's tabs in study-loop order, each with an index, its
 * item count, its own progress and a lock when the study-first lock applies. It is the tab bar
 * (same `?tab=` ids), so it keeps tablist semantics and ←/→ keyboard navigation.
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
  const all = [...steps, ...extras];

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = all.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
      onSelect(next);
      requestAnimationFrame(() => {
        const el = document.getElementById(`tab-${next}`);
        el?.focus();
        el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }
  };

  const renderStep = (id: TabId, n: number) => {
    const meta = TAB_META[id];
    const prog = stepProgress(p, topic, id);
    const locked = !!locks[id];
    const idx = steps.indexOf(id);
    const state = id === 'cheat' ? 'extra' : locked ? 'locked' : prog.complete ? 'done' : idx === currentIdx ? 'current' : 'todo';
    const active = tab === id;
    const pct = id === 'exam' && prog.complete ? 100 : prog.total ? Math.min(100, (prog.done / prog.total) * 100) : 0;
    const count = tabCount(topic, id);
    const status = locked ? 'locked' : id === 'cheat' ? `${count} lines` : prog.text;
    return (
      <button
        key={id}
        id={`tab-${id}`}
        role="tab"
        type="button"
        aria-selected={active}
        tabIndex={active ? 0 : -1}
        className={`path-step tab st-${state} ${active ? 'active' : ''}`}
        onClick={() => onSelect(id)}
        title={`${meta.why}${locked ? ' (Read every Learn section first)' : ''}`}
      >
        <span className="ix" aria-hidden="true">
          {state === 'done' ? '✓' : String(n).padStart(2, '0')}
        </span>
        <span className="path-label">{tabLabel(topic, id)}</span>
        {locked ? (
          <span className="ct lk" aria-hidden="true">
            <Lock size={11} />
          </span>
        ) : (
          <span className="ct" aria-hidden="true">
            {count}
          </span>
        )}
        <span className="sr-only">, {status}</span>
        {id !== 'cheat' && (
          <span className="path-bar" aria-hidden="true">
            <span className="path-bar-fill" style={{ width: `${pct}%` }} />
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="panel flat study-path tp-tabs" aria-label="Topic views">
      <div className="tabs" role="tablist" aria-label="Study path" onKeyDown={onKeyDown}>
        {steps.map((id, i) => renderStep(id, i + 1))}
        <span className="path-spacer" aria-hidden="true" />
        {extras.map((id, i) => renderStep(id, steps.length + i + 1))}
      </div>
    </nav>
  );
}
