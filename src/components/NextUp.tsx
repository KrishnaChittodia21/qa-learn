import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** "Next up" footer at the end of a tab's content: one obvious way forward. */
export function NextUp({
  lead,
  label,
  to,
  onClick,
}: {
  lead: string;
  label: string;
  to?: string;
  onClick?: () => void;
}) {
  return (
    <div className="next-up">
      <span className="next-up-lead">
        <span className="mlabel">Next up</span>
        {lead}
      </span>
      {to ? (
        <Link to={to} className="btn btn-primary" onClick={onClick}>
          {label} <ArrowRight size={16} aria-hidden="true" className="arr" />
        </Link>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onClick}>
          {label} <ArrowRight size={16} aria-hidden="true" className="arr" />
        </button>
      )}
    </div>
  );
}
