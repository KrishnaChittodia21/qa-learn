import { useMemo, useState, type CSSProperties } from 'react';
import { COMPANY_QUESTIONS } from '../content';
import type { CompanyArea } from '../types';
import { useProgress } from '../lib/progress';
import { CompanyCard } from '../components/CompanyCard';
import { AREA_LABEL } from '../lib/companyAreas';

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
  const totalQ = Math.max(1, COMPANY_QUESTIONS.length);

  return (
    <div className="page co">
      <header className="co-head">
        <span className="mlabel">
          <b>Practice</b> · interview reports
        </span>
        <h1 className="h1">Company interview questions</h1>
        <p className="lede">
          Questions candidates reported being asked at specific companies, grouped by area. Each one links to where it was reported
          and to the lesson that teaches it. Try answering out loud before you reveal ours.
        </p>
      </header>

      {!COMPANY_QUESTIONS.length ? (
        <p className="muted">Company questions are being researched. Check back soon.</p>
      ) : (
        <>
          <section className="panel flat co-bar rise" style={{ '--i': 1 } as CSSProperties} aria-label="Progress and filters">
            <div className="co-read">
              <div className="readout">
                <span className="num">
                  {practised}
                  <small>/ {COMPANY_QUESTIONS.length} practised</small>
                </span>
              </div>
              <div
                className="seg"
                style={{ '--n': 40, '--v': (practised / totalQ) * 40, '--g': 'var(--pass)' } as CSSProperties}
                role="img"
                aria-label={`${practised} of ${COMPANY_QUESTIONS.length} practised`}
              />
              <span className="mlabel">
                <b>{companies.length}</b> companies · <b>{list.length}</b> shown
              </span>
            </div>
            <div className="co-filters">
              <div className="co-chips" role="group" aria-label="Area">
                <button type="button" className={`chip ${area === 'all' ? 'on' : ''}`} onClick={() => setArea('all')}>
                  All areas <span className="n">{inCompany.length}</span>
                </button>
                {AREAS.map((a) => {
                  const n = inCompany.filter((q) => q.area === a).length;
                  if (!n) return null;
                  return (
                    <button key={a} type="button" className={`chip ${area === a ? 'on' : ''}`} onClick={() => setArea(a)}>
                      {AREA_LABEL[a]} <span className="n">{n}</span>
                    </button>
                  );
                })}
              </div>
              <div className="co-row">
                <label className="co-sel">
                  <span className="mlabel">Company</span>
                  <select className="input" value={company} onChange={(e) => setCompany(e.target.value)}>
                    <option value="all">All companies ({COMPANY_QUESTIONS.length})</option>
                    {companies.map(([name, n]) => (
                      <option key={name} value={name}>
                        {name} ({n})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="check co-hide">
                  <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} /> Hide practised
                </label>
              </div>
            </div>
          </section>

          {!list.length && (
            <div className="runner co-none" data-theme="dark">
              <div className="rl skip">
                <span className="m">–</span>
                <span className="tx">No questions match these filters.</span>
                <span className="d">0 specs</span>
              </div>
            </div>
          )}
          <div className="co-list">
            {list.map((q) => (
              <CompanyCard key={q.id} q={q} />
            ))}
          </div>
          <p className="co-foot">
            Sources are candidates&apos; public interview reports. Questions are rewritten in our own words, and answers are ours, not
            the company&apos;s.
          </p>
        </>
      )}
    </div>
  );
}
