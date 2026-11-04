// A Short as a link card (M7): its thumbnail (drawn from its own first frame), a Day badge (its place in course
// order), the title, where it lives and its length. Used on the Shorts page, Home, a topic's Shorts strip and Saved.
import { Link } from 'react-router-dom';
import { SHORTS, type ShortEntry } from '../lib/shorts';
import { ShortThumb } from './ShortThumb';

export function ShortCard({ entry, watched, href, mini = false }: { entry: ShortEntry; watched: boolean; href?: string; mini?: boolean }) {
  const { short, topic, section } = entry;
  return (
    <Link to={href ?? `/short/${short.id}`} className={`sh-card ${mini ? 'mini' : ''} ${watched ? 'seen' : ''}`}>
      <ShortThumb short={short} watched={watched} mini={mini} />
      {!mini && (
        <span className="sh-tags">
          <span className="sh-day mono">Day {SHORTS.indexOf(entry) + 1}</span>
        </span>
      )}
      <span className="sh-body">
        <span className="sh-title">{short.title}</span>
        <span className="sh-ctx">
          {topic.title}
          {mini ? '' : `, section ${section + 1}`}
        </span>
      </span>
    </Link>
  );
}
