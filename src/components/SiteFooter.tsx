import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

/** Footer at the end of every page: brand on the left, copyright on the right. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-row">
        <Link to="/" className="brand footer-brand">
          <span className="brand-tile" aria-hidden="true">
            <ShieldCheck size={16} strokeWidth={2.4} />
          </span>
          <span className="brand-name">QA Learn</span>
        </Link>
        <span className="footer-copy">© 2026 QA Learn</span>
      </div>
    </footer>
  );
}
