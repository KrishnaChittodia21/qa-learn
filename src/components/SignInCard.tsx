import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';

/**
 * Shown in place of anything that needs an account (graded exams, answers). Learn stays open without one. After
 * signing in the learner comes back to the same page. Adapted from system-design-learn's SignInCard.
 */
export function SignInCard({ what, loading = false }: { what: string; loading?: boolean }) {
  const { pathname, search } = useLocation();
  const next = encodeURIComponent(pathname + search);
  if (loading) {
    return (
      <section className="panel signin-card" aria-busy="true">
        <p className="muted">Checking your sign-in…</p>
      </section>
    );
  }
  return (
    <section className="panel signin-card" aria-labelledby="signin-h">
      <div className="signin-head">
        <span className="locked-ic" aria-hidden="true">
          <LogIn size={22} />
        </span>
        <div>
          <span className="mlabel">Your account</span>
          <h2 id="signin-h" className="signin-title">
            Sign up to {what}
          </h2>
        </div>
      </div>
      <p>
        Grading, answers and your progress are saved to your account, so they follow you to any device. Lessons stay
        open without signing in.
      </p>
      <div className="locked-acts">
        <Link className="btn btn-primary btn-sm" to={`/signup?next=${next}`}>
          Create an account
        </Link>
        <Link className="btn-ghost btn-sm" to={`/login?next=${next}`}>
          I already have an account
        </Link>
      </div>
    </section>
  );
}
