// One Short, full page (M7): #/short/<id>, or #/short/<id>?queue=a,b,c to play a list back to back (Saved → Play all).
// Adapted from system-design-learn's Short page; every Short is open (one learner, kept in this browser).
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ShortPlayer, type UpNext } from '../components/ShortPlayer';
import { recordShort } from '../lib/progress';
import { SHORT_BY_ID, shortLength } from '../lib/shorts';

export default function ShortPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const entry = SHORT_BY_ID.get(id);
  if (!entry) {
    return (
      <div className="short-missing">
        <h1>That Short doesn't exist</h1>
        <p>
          It may have moved. <Link to="/shorts">See all Shorts</Link>
        </p>
      </div>
    );
  }
  const { short, topic, section } = entry;
  const lesson = `/topic/${topic.id}?tab=learn&s=${section}`;
  // a list to play: only real Shorts, and this one must be in it
  const queue = (params.get('queue') ?? '').split(',').filter((q) => SHORT_BY_ID.has(q));
  const at = queue.indexOf(short.id);
  const nextId = at >= 0 ? queue[at + 1] : undefined;
  const next: UpNext | undefined = nextId
    ? { href: `/short/${nextId}?queue=${queue.join(',')}${params.get('from') === 'saved' ? '&from=saved' : ''}`, title: SHORT_BY_ID.get(nextId)!.short.title, position: `${at + 2} of ${queue.length}` }
    : undefined;
  return (
    <div className="short-page">
      <div className="short-page-top">
        {/* Saved → Play all adds from=saved, so Back returns there */}
        <Link to={params.get('from') === 'saved' ? '/saved' : '/shorts'}>
          <ArrowLeft size={15} aria-hidden /> {at >= 0 ? `${at + 1} of ${queue.length}` : 'All Shorts'}
        </Link>
        <Link to={lesson} title={topic.sections[section].heading}>
          <BookOpen size={15} aria-hidden /> {shortLength(short)} · the lesson
        </Link>
      </div>
      {/* keyed by id: the next Short starts from its first beat */}
      <ShortPlayer
        key={short.id}
        entry={entry}
        next={next}
        onFinish={() => recordShort(short.id, 'watched')}
        onQuiz={(firstTry) => recordShort(short.id, firstTry ? 'quiz-first' : 'quiz-retry')}
      />
    </div>
  );
}
