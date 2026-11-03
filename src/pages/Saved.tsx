// Saved for later (M3): everything shortlisted with the ☆ button. Adapted from system-design-learn's Saved page.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Building2, Calculator, Check, ChevronDown, Code2, FlaskConical, Mic, Star, Trash2, Undo2 } from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, TOPICS, TOPIC_BY_ID } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { removeSaved, saveItem, setSavedDone, useProgress, type SavedItem } from '../lib/progress';
import { SignInCard } from '../components/SignInCard';
import { useSession } from '../lib/session';

type Group = 'lessons' | 'questions' | 'coding';
interface Resolved {
  item: SavedItem;
  group: Group;
  kindLabel: string;
  title: string;
  context: string;
  href: string;
}

const iqTopic = new Map(TOPICS.flatMap((t) => t.interviewQuestions.map((q) => [q.id, { t, q }] as const)));
const drillTopic = new Map(TOPICS.flatMap((t) => t.envelopeQuestions.map((q) => [q.id, { t, q }] as const)));
const company = new Map(COMPANY_QUESTIONS.map((q) => [q.id, q]));
const coding = new Map(CODING_PROBLEMS.map((q) => [q.id, q]));
const pwlab = new Map(PW_LAB_STEPS.map((s) => [s.id, s]));

/** where a saved item lives now; null when its content is gone (hidden rather than shown as a broken link) */
function resolve(item: SavedItem): Resolved | null {
  switch (item.kind) {
    case 'topic': {
      const t = TOPIC_BY_ID.get(item.ref);
      return t ? { item, group: 'lessons', kindLabel: 'Topic', title: t.title, context: t.subtitle, href: `/topic/${t.id}` } : null;
    }
    case 'section': {
      const [id, i] = item.ref.split(':');
      const t = TOPIC_BY_ID.get(id);
      const s = t?.sections[Number(i)];
      return t && s ? { item, group: 'lessons', kindLabel: `Section ${Number(i) + 1}`, title: s.heading, context: t.title, href: `/topic/${t.id}?tab=learn&s=${i}` } : null;
    }
    case 'interview': {
      const hit = iqTopic.get(item.ref);
      return hit ? { item, group: 'questions', kindLabel: 'Interview question', title: hit.q.question, context: hit.t.title, href: `/topic/${hit.t.id}?tab=interview` } : null;
    }
    case 'drill': {
      const hit = drillTopic.get(item.ref);
      return hit ? { item, group: 'questions', kindLabel: 'Practice drill', title: hit.q.question, context: hit.t.title, href: `/topic/${hit.t.id}?tab=envelope` } : null;
    }
    case 'company': {
      const q = company.get(item.ref);
      return q ? { item, group: 'questions', kindLabel: 'Company question', title: q.question, context: q.company, href: q.topic ? `/topic/${q.topic}?tab=company` : '/companies' } : null;
    }
    case 'coding': {
      const q = coding.get(item.ref);
      return q ? { item, group: 'coding', kindLabel: 'Coding problem', title: q.title, context: q.difficulty, href: `/coding/${q.id}` } : null;
    }
    case 'pwlab': {
      const s = pwlab.get(item.ref);
      return s ? { item, group: 'coding', kindLabel: 'Playwright Lab step', title: s.title, context: 'Playwright Lab', href: `/pw-lab/${s.id}` } : null;
    }
    default:
      return null;
  }
}

const ICON = { topic: BookOpen, section: BookOpen, interview: Mic, drill: Calculator, company: Building2, coding: Code2, pwlab: FlaskConical };
const FILTERS: { id: 'all' | Group; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lessons', label: 'Lessons' },
  { id: 'questions', label: 'Questions' },
  { id: 'coding', label: 'Coding & Lab' },
];
const ago = (iso: string) => {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
};

/** active saved items whose content still exists (the menu badge counts these) */
export const activeSaved = (saved: SavedItem[] = []) => saved.filter((s) => !s.doneAt && resolve(s));

export default function SavedPage() {
  const p = useProgress();
  const session = useSession();
  const [filter, setFilter] = useState<'all' | Group>('all');
  const [oldestFirst, setOldestFirst] = useState(false);
  const [showDone, setShowDone] = useState(false);
  if (session.status !== 'in') {
    return (
      <div className="page saved-page">
        <SignInCard what="save things for later" loading={session.status === 'loading'} />
      </div>
    );
  }
  const all = (p.saved ?? []).map(resolve).filter((r): r is Resolved => !!r);
  const active = all.filter((r) => !r.item.doneAt);
  const done = all.filter((r) => r.item.doneAt);
  const shown = active
    .filter((r) => filter === 'all' || r.group === filter)
    .sort((a, b) => (oldestFirst ? 1 : -1) * a.item.addedAt.localeCompare(b.item.addedAt));
  const count = (g: 'all' | Group) => active.filter((r) => g === 'all' || r.group === g).length;

  return (
    <div className="page saved-page">
      <header className="saved-head">
        <span className="mlabel">
          <Star size={13} aria-hidden="true" /> Saved for later
        </span>
        <h1 className="h1">Saved</h1>
        <p className="muted">Everything you starred to come back to. Open it, then mark it done when you have.</p>
      </header>

      <div className="saved-tools">
        <div className="saved-chips" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={`chip ${filter === f.id ? 'on' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label} <span className="saved-n">{count(f.id)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={() => setOldestFirst((o) => !o)} aria-label={`Sorted ${oldestFirst ? 'oldest' : 'newest'} first. Change the order`}>
          {oldestFirst ? 'Oldest first' : 'Newest first'}
        </button>
      </div>

      {shown.length ? (
        <ul className="saved-list" aria-label="Saved items">
          {shown.map((r) => {
            const Icon = ICON[r.item.kind];
            return (
              <li key={`${r.item.kind}|${r.item.ref}`} className="saved-row panel flat">
                <span className="saved-ic" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <Link to={r.href} className="saved-main">
                  <span className="saved-kind mlabel">
                    {r.kindLabel} · saved {ago(r.item.addedAt)}
                  </span>
                  <span className="saved-title">{r.title}</span>
                  <span className="saved-ctx">{r.context}</span>
                </Link>
                <span className="saved-acts">
                  <button type="button" className="btn btn-sm" onClick={() => setSavedDone(r.item.kind, r.item.ref)}>
                    <Check size={14} aria-hidden="true" /> Done
                  </button>
                  <button type="button" className="btn-ghost btn-sm" aria-label={`Remove ${r.title}`} title="Remove" onClick={() => removeSaved(r.item.kind, r.item.ref)}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="saved-empty panel flat">
          <Star size={34} aria-hidden="true" />
          <h2 className="h3">{active.length ? `Nothing in ${FILTERS.find((f) => f.id === filter)?.label}` : 'Nothing saved yet'}</h2>
          <p className="muted">
            {active.length
              ? 'Try another filter.'
              : 'Press ☆ Save on a topic, a Learn section, an interview question, a drill, a company question, a coding problem or a Playwright Lab step, and it lands here.'}
          </p>
          {!active.length && (
            <Link className="btn btn-primary btn-sm" to="/contents">
              Browse the syllabus
            </Link>
          )}
        </div>
      )}

      {done.length > 0 && (
        <section className="saved-done" aria-label="Done">
          <div className="saved-done-head">
            <button type="button" className="btn-ghost btn-sm" aria-expanded={showDone} onClick={() => setShowDone((s) => !s)}>
              <ChevronDown size={15} aria-hidden="true" className={showDone ? 'open' : ''} /> Done ({done.length})
            </button>
            {showDone && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => done.forEach((r) => removeSaved(r.item.kind, r.item.ref))}>
                Clear done
              </button>
            )}
          </div>
          {showDone && (
            <ul className="saved-list done">
              {done.map((r) => (
                <li key={`${r.item.kind}|${r.item.ref}`} className="saved-row panel flat">
                  <Link to={r.href} className="saved-main">
                    <span className="saved-kind mlabel">{r.kindLabel}</span>
                    <span className="saved-title">{r.title}</span>
                  </Link>
                  <span className="saved-acts">
                    <button type="button" className="btn-ghost btn-sm" onClick={() => saveItem(r.item.kind, r.item.ref)}>
                      <Undo2 size={14} aria-hidden="true" /> Back to list
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
