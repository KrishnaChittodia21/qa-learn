import { Link } from 'react-router-dom';
import { BrandMark, BrandName } from './BrandMark';

/** Footer at the end of every page: a slim instrument strip — mark, tag line, copyright. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-row">
        <Link to="/" className="brand footer-brand" aria-label="QA.learn, today">
          <BrandMark size={24} />
          <BrandName sub={false} />
        </Link>
        <span className="footer-tag">Made for curious bug hunters</span>
        <span className="footer-copy">© 2026 QA.learn · local lab</span>
      </div>
    </footer>
  );
}
