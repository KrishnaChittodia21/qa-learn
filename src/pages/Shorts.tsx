// All Shorts (M7): ~90-second animated stories, each ending in one question. Unwatched first, then watched, with
// "Play all" for the unwatched ones. Adapted from system-design-learn's Shorts page (no daily unlock here).
import { Link } from 'react-router-dom';
import { Clapperboard, PlayCircle } from 'lucide-react';
import { useProgress } from '../lib/progress';
import { SHORTS } from '../lib/shorts';
import { ShortCard } from '../components/ShortCard';

export default function ShortsPage() {
  const p = useProgress();
  const watched = (id: string) => !!p.shorts?.[id]?.watchedAt;
  const unwatched = SHORTS.filter((e) => !watched(e.short.id));
  const done = SHORTS.filter((e) => watched(e.short.id));

  return (
    <div className="page sh-page">
      <header className="saved-head rise">
        <span className="mlabel">
          <Clapperboard size={13} aria-hidden /> Shorts
        </span>
        <h1 className="h1">Shorts</h1>
        <p className="muted">Ninety-second animated stories: famous software failures told as QA lessons, and how key testing ideas work. Each ends with one question.</p>
      </header>

      <div className="sh-status rise">
        <span className="mono">
          {done.length} of {SHORTS.length} watched
        </span>
        {unwatched.length > 1 && (
          <Link className="btn btn-primary btn-sm" to={`/short/${unwatched[0].short.id}?queue=${unwatched.map((e) => e.short.id).join(',')}`}>
            <PlayCircle size={15} aria-hidden /> Play all {unwatched.length} unwatched
          </Link>
        )}
      </div>

      <section aria-labelledby="sh-unwatched">
        <h2 id="sh-unwatched" className="sh-h2">
          Unwatched <span className="saved-n">{unwatched.length}</span>
        </h2>
        {unwatched.length ? (
          <ul className="sh-grid">
            {unwatched.map((e) => (
              <li key={e.short.id}>
                <ShortCard entry={e} watched={false} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">You have watched every Short.</p>
        )}
      </section>

      {done.length > 0 && (
        <section aria-labelledby="sh-watched">
          <h2 id="sh-watched" className="sh-h2">
            Watched <span className="saved-n">{done.length}</span>
          </h2>
          <ul className="sh-grid">
            {done.map((e) => (
              <li key={e.short.id}>
                <ShortCard entry={e} watched />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
