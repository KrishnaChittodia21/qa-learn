// A Short as a link card (M7): a small poster in the player's palette (the first beat's kicker and headline), the
// title, where it lives and its length. Used on the Shorts page, Home, a topic's Shorts strip and Saved.
import { Link } from 'react-router-dom';
import { Check, Play } from 'lucide-react';
import { shortLength, type ShortEntry } from '../lib/shorts';

const plain = (t = '') => t.replace(/\*+/g, '');

export function ShortCard({ entry, watched, href, mini = false }: { entry: ShortEntry; watched: boolean; href?: string; mini?: boolean }) {
  const { short, topic, section } = entry;
  const first = short.beats[0];
  return (
    <Link to={href ?? `/short/${short.id}`} className={`sh-card ${mini ? 'mini' : ''} ${watched ? 'seen' : ''}`}>
      <span className="sh-poster" aria-hidden="true">
        <span className="sh-poster-kick">{first.kicker}</span>
        <span className="sh-poster-head">{plain(first.head)}</span>
        <span className="sh-play">{watched ? <Check size={16} /> : <Play size={16} />}</span>
      </span>
      <span className="sh-body">
        <span className="sh-title">{short.title}</span>
        <span className="sh-ctx">
          {watched ? 'Watched · ' : ''}
          {shortLength(short)} · {topic.title}
          {mini ? '' : `, section ${section + 1}`}
        </span>
      </span>
    </Link>
  );
}
