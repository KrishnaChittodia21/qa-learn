import { useMemo, useState } from 'react';
import { COMPANY_QUESTIONS } from '../content';
import type { CompanyArea } from '../types';
import { useProgress } from '../lib/progress';
import { CompanyCard } from '../components/CompanyCard';
import { AREA_LABEL } from '../lib/companyAreas';
import { ProgressBar } from '../components/ui';

const AREAS = Object.keys(AREA_LABEL) as CompanyArea[];

export default function CompaniesPage() {
  const p = useProgress();
  const [area, setArea] = useState<'all' | CompanyArea>('all');
  const [company, setCompany] = useState('all');
  const [hideDone, setHideDone] = useState(false);

  const companies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of COMPANY_QUESTIONS) counts.set(q.company, (counts.get(q.company) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, []);

  const inCompany = COMPANY_QUESTIONS.filter((q) => company === 'all' || q.company === company);
  const list = inCompany.filter((q) => (area === 'all' || q.area === area) && !(hideDone && p.company[q.id]));
  const practised = COMPANY_QUESTIONS.filter((q) => p.company[q.id]).length;

  return (
    <div className="page">
      <div className="topic-head">
        <div className="eyebrow">Practice</div>
        <h1>Company interview questions</h1>
        <p className="lead">
          Questions candidates reported being asked at specific companies, grouped by area. Each one links to where it was reported
          and to the lesson that teaches it. Try answering out loud before you reveal ours.
        </p>
        <div className="topic-progress">
          <ProgressBar value={(practised / Math.max(1, COMPANY_QUESTIONS.length)) * 100} tone="good" />
          <span className="small muted">
            {practised}/{COMPANY_QUESTIONS.length} practised · {companies.length} companies
          </span>
        </div>
      </div>

      {!COMPANY_QUESTIONS.length ? (
        <p className="muted">Company questions are being researched. Check back soon.</p>
      ) : (
        <>
          <div className="row wrap gap-s coding-filters">
            <button type="button" className={`chip ${area === 'all' ? 'on' : ''}`} onClick={() => setArea('all')}>
              All areas ({inCompany.length})
            </button>
            {AREAS.map((a) => {
              const n = inCompany.filter((q) => q.area === a).length;
              if (!n) return null;
              return (
                <button key={a} type="button" className={`chip ${area === a ? 'on' : ''}`} onClick={() => setArea(a)}>
                  {AREA_LABEL[a]} ({n})
                </button>
              );
            })}
          </div>
          <div className="row wrap gap-s coding-filters">
            <label className="small">
              Company{' '}
              <select className="pg-examples" value={company} onChange={(e) => setCompany(e.target.value)}>
                <option value="all">All companies ({COMPANY_QUESTIONS.length})</option>
                {companies.map(([name, n]) => (
                  <option key={name} value={name}>
                    {name} ({n})
                  </option>
                ))}
              </select>
            </label>
            <label className="small muted hide-solved">
              <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide practised
            </label>
          </div>
          {!list.length && <p className="muted">No questions match these filters.</p>}
          {list.map((q) => (
            <CompanyCard key={q.id} q={q} />
          ))}
          <p className="muted small">
            Sources are candidates&apos; public interview reports. Questions are rewritten in our own words, and answers are ours, not
            the company&apos;s.
          </p>
        </>
      )}
    </div>
  );
}
