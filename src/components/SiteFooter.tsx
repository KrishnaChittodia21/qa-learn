import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';

/** Footer at the end of every page: brand on the left, copyright on the right. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-row">
        <Link to="/" className="brand footer-brand">
          <BrandMark size={24} />
          <span className="brand-name">QA Learn</span>
        </Link>
        <span className="footer-tag">Made for curious bug hunters</span>
        <span className="footer-copy">© 2026 QA Learn</span>
      </div>
    </footer>
  );
}
