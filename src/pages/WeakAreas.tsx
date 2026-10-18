import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PHASES, TOPICS, TOPIC_BY_ID } from '../content';
import type { Difficulty } from '../types';
import { useProgress } from '../lib/progress';
import { accuracyBreakdown, currentlyWrong, pct, weakTopics, type Accuracy, type TopicWeakness } from '../lib/weak';
import { Exam } from './Exam';

const LEVEL_FILL: Record<Difficulty, string> = { easy: 'var(--mint)', medium: 'var(--cyan)', hard: 'var(--iris)', expert: 'var(--lilac)' };
const two = (n: number) => String(n).padStart(2, '0');
const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** one accuracy meter row: label, segmented meter, % and raw counts */
function Meter({ label, a, fill, mark = 70 }: { label: ReactNode; a: Accuracy; fill?: string; mark?: number }) {
  const v = pct(a);
  const low = v !== null && v < mark;
  return (
    <div className={`wk-meter ${low ? 'low' : ''} ${v === null ? 'none' : ''}`}>
      <span className="nm">{label}</span>
      <span className="v">
        {v === null ? '—' : `${v}%`}
        <small>{a.seen ? `${a.correct}/${a.seen}` : 'no data'}</small>
      </span>
      <div className="seg" style={vars({ '--n': 20, '--v': ((v ?? 0) / 100) * 20, ...(low ? { '--g': 'var(--fail)' } : fill ? { '--g': fill } : {}) })} />
    </div>
  );
}

/** diagnostic terminal used for the empty and all-clear states */
function Diagnose({ lines, caret = true }: { lines: { cls: string; m: string; tx: ReactNode; d?: string }[]; caret?: boolean }) {
  return (
    <div className="runner wk-term" data-theme="dark">
      <div className="wk-cmd">
        <span className="ink3">$</span> npx qa-learn diagnose --weak
      </div>
      {lines.map((l, i) => (
        <div key={i} className={`rl ${l.cls}`}>
          <span className="m">{l.m}</span>
          <span className="tx">{l.tx}</span>
          <span className="d">{l.d ?? ''}</span>
        </div>
      ))}
      {caret && (
        <div className="wk-cmd">
          <span className="ink3">$</span>
          <span className="caret" />
        </div>
      )}
    </div>
  );
}

export function WeakAreasPage() {
  const p = useProgress();
  const answered = Object.keys(p.mcq).length;
  const weak = weakTopics(p, TOPICS);
  const { byDifficulty, byFormat } = accuracyBreakdown(p, TOPICS);
  const overall = Object.values(byDifficulty).reduce((acc, a) => ({ seen: acc.seen + a.seen, correct: acc.correct + a.correct }), {
    seen: 0,
    correct: 0,
  });
  const totalWrong = weak.reduce((n, w) => n + w.wrong.length, 0);
  const passMark = p.settings.passMark;

  if (!answered) {
    return (
      <div className="page wk">
        <header className="wk-head">
          <span className="mlabel">
            <b>Diagnostics</b> · 0 specs analysed
          </span>
          <h1 className="h1">Weak areas</h1>
        </header>
        <section className="panel cut-lg wk-empty rise" style={vars({ '--i': 1 })} aria-labelledby="wk-empty-t">
          <div className="wk-empty-copy">
            <span className="chip skip">No data</span>
            <h2 className="h3" id="wk-empty-t">
              Nothing to analyse… yet!
            </h2>
            <p>
              Take any topic exam and this page lights up with the topics, sections and question types where you lose marks, plus
              links straight to what to revise.
            </p>
            <Link to="/" className="btn btn-holo">
              Find my next exam{' '}
              <span className="arr">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
          <Diagnose
            lines={[
              { cls: 'skip', m: '–', tx: 'scanning exam history…', d: '0 runs' },
              { cls: 'skip', m: '–', tx: 'no specs answered yet', d: '0/0' },
            ]}
          />
        </section>
      </div>
    );
  }

  const levels: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  const ov = pct(overall) ?? 0;
  const failingTopics = weak.filter((w) => w.wrong.length > 0).length;
  return (
    <div className="page wk">
      <header className="wk-head">
        <span className="mlabel">
          <b>Diagnostics</b> · {answered} specs analysed
        </span>
        <h1 className="h1">Weak areas</h1>
        <p className="lede">
          Based on your latest answer to each of the {answered} exam questions you&apos;ve attempted. A question leaves this list once
          you answer it correctly.
        </p>
      </header>

      <div className="wk-bento">
        <section className="panel cut-lg wk-hero rise" style={vars({ '--i': 1 })} aria-labelledby="wk-hero-t">
          <div className="p-head">
            <span className="mlabel" id="wk-hero-t">
              Overall · <b>latest answers</b>
            </span>
            {totalWrong > 0 ? (
              <span className="chip fail glitch" data-text={`✗ ${totalWrong} failing`}>
                ✗ {totalWrong} failing
              </span>
            ) : (
              <span className="chip pass">✓ All green</span>
            )}
          </div>
          <div className={`numeral wk-big ${ov >= passMark ? '' : 't-fail'}`}>
            {ov}
            <small>% accuracy</small>
          </div>
          <div className="scale" style={vars({ '--v': ov, '--m': passMark, ...(ov >= passMark ? {} : { '--g': 'var(--fail)' }) })}>
            <span className="tr" />
            <span className="fl" />
            <span className="ticks" />
            <span className="mk" data-l={`PASS ${passMark}`} />
            <span className="nums">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </span>
          </div>
          <p className="wk-sum">
            <b className="mono">{overall.correct}</b>/{overall.seen} specs passing ·{' '}
            <b className={`mono ${totalWrong ? 't-fail' : ''}`}>{totalWrong}</b> failing across{' '}
            <b className="mono">{failingTopics}</b> topic{failingTopics === 1 ? '' : 's'}
          </p>
          {totalWrong > 0 && (
            <div className="wk-act">
              <Link to="/practice" className="btn btn-holo btn-sm">
                Practise all {totalWrong} mistakes{' '}
                <span className="arr">
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </div>
          )}
        </section>

        <section className="panel hov wk-diff rise" style={vars({ '--i': 2 })} aria-labelledby="wk-diff-t">
          <div className="p-head">
            <span className="mlabel" id="wk-diff-t">
              Accuracy · <b>by difficulty</b>
            </span>
            <span className="mlabel">pass {passMark}</span>
          </div>
          <div className="wk-meters">
            {levels.map((d) => (
              <Meter key={d} label={d} a={byDifficulty[d]} fill={LEVEL_FILL[d]} mark={passMark} />
            ))}
          </div>
        </section>

        <section className="panel hov wk-type rise" style={vars({ '--i': 3 })} aria-labelledby="wk-type-t">
          <div className="p-head">
            <span className="mlabel" id="wk-type-t">
              Accuracy · <b>by question type</b>
            </span>
          </div>
          <div className="wk-meters">
            <Meter label="Single answer" a={byFormat.single} mark={passMark} />
            <Meter label="Select all that apply" a={byFormat.multi} mark={passMark} />
            <Meter label="Reading code" a={byFormat.code} mark={passMark} />
          </div>
          <p className="wk-note">
            A low &quot;select all&quot; score usually means you spot the main idea but miss a second valid trade-off. Read explanations
            for the options you skipped.
          </p>
        </section>
      </div>

      <div className="wk-list-h">
        <h2 className="h2">Failing specs by topic</h2>
        <span className="mlabel">
          {weak.length} topic{weak.length === 1 ? '' : 's'} · weakest first
        </span>
      </div>

      {!weak.length && (
        <section className="panel wk-clear rise" aria-label="All clear">
          <div className="wk-empty-copy">
            <span className="chip pass">✓ Clean sheet</span>
            <h3 className="h3">No weak topics right now.</h3>
            <p>Every question you&apos;ve attempted is currently correct. Go you.</p>
          </div>
          <Diagnose
            caret={false}
            lines={[
              { cls: 'pass', m: '✓', tx: <b>{answered} specs re-checked</b>, d: `${overall.correct}/${overall.seen}` },
              { cls: 'pass', m: '✓', tx: <b>0 failing · 0 flaky</b>, d: 'all green' },
            ]}
          />
        </section>
      )}

      <div className="wk-grid">
        {weak.map((w, i) => (
          <WeakTopicCard key={w.topic.id} w={w} i={i} passMark={passMark} foil={i === 0} />
        ))}
      </div>
      {weak.length > 0 && (
        <p className="wk-foot">
          Sections are matched automatically from each question&apos;s wording, so treat them as a pointer. The exam review shows the
          exact reasoning.
        </p>
      )}
    </div>
  );
}

function WeakTopicCard({ w, i, passMark, foil }: { w: TopicWeakness; i: number; passMark: number; foil: boolean }) {
  const ph = PHASES.find((x) => x.id === w.topic.phase);
  const total = w.topic.test.length;
  const maxMissed = Math.max(...w.sections.map((s) => s.missed.length), 1);
  const hist = w.history.slice(-8);
  return (
    <article className={`panel ${foil ? 'foil cut-lg' : 'hov'} wk-card rise ${foil ? 'lead' : ''}`} style={vars({ '--i': 4 + Math.min(i, 6) })}>
      <div className="p-head">
        <span className="mlabel">
          {ph ? (
            <>
              <b>Phase {two(ph.number)}</b> · {w.topic.id}
            </>
          ) : (
            w.topic.id
          )}
        </span>
        {w.attempts > 0 ? (
          w.passed ? (
            <span className="chip pass">✓ Passed</span>
          ) : (
            <span className="chip fail glitch" data-text={`✗ Fail ×${w.attempts}`}>
              ✗ Fail ×{w.attempts}
            </span>
          )
        ) : (
          <span className="chip skip">Drill only</span>
        )}
      </div>
      <div className="wk-card-top">
        <div className="wk-card-title">
          <h3 className="h3">
            <Link to={`/topic/${w.topic.id}`}>{w.topic.title}</Link>
          </h3>
          {w.attempts > 0 && (
            <p className="wk-meta">
              last <b className={w.last >= passMark ? 't-pass' : 't-fail'}>{w.last}%</b> · best <b>{w.best}%</b> · {w.attempts} attempt
              {w.attempts === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div className="readout wk-count" title="questions currently wrong">
          <span className={`num ${w.wrong.length ? 't-fail' : ''}`}>
            {w.wrong.length}
            <small>/{total}</small>
          </span>
          <span className="mlabel">failing specs</span>
        </div>
      </div>

      {hist.length > 1 && (
        <div className="wk-trend" aria-label={`Score trend: ${hist.join(', ')}`}>
          <span className="mlabel">Trend</span>
          <div className="wk-bars">
            <span className="pm" style={{ bottom: `${passMark}%` }} />
            {hist.map((s, k) => (
              <i key={k} className={s >= passMark ? 'p' : 'f'} style={{ height: `${Math.max(4, s)}%` }} title={`${s}%`} />
            ))}
          </div>
          <span className="mono wk-trend-v">{hist.join(' → ')}</span>
        </div>
      )}

      {w.sections.length > 0 && (
        <div className="wk-miss">
          <span className="mlabel">Sections behind the misses</span>
          {w.sections.slice(0, 5).map((ws) => (
            <div key={ws.index} className="wk-row">
              <span className="no">§{ws.index + 1}</span>
              <span className="nm">{ws.heading}</span>
              <Link to={`/topic/${w.topic.id}?tab=learn&s=${ws.index}`} className="btn btn-line btn-xs">
                Revise
              </Link>
              <span className="ms">{ws.missed.length} missed</span>
              <div className="seg thin" style={vars({ '--n': maxMissed, '--v': ws.missed.length, '--g': 'var(--fail)' })} />
            </div>
          ))}
        </div>
      )}
      {w.shakyInterview > 0 && (
        <p className="wk-shaky">
          <span className="chip flaky">Flaky</span>
          <span>
            {w.shakyInterview} interview question{w.shakyInterview === 1 ? '' : 's'} self-rated <em>partial</em> or <em>missed</em>.{' '}
            <Link to={`/topic/${w.topic.id}?tab=interview`}>Practise them →</Link>
          </span>
        </p>
      )}
      <div className="wk-card-act">
        {w.wrong.length > 0 && (
          <Link to={`/practice?topic=${w.topic.id}`} className={`btn btn-sm ${foil ? 'btn-holo' : 'btn-line'}`}>
            Practise {w.wrong.length} mistake{w.wrong.length === 1 ? '' : 's'}
          </Link>
        )}
        <Link to={`/topic/${w.topic.id}/exam`} className="btn btn-ghost btn-sm">
          Retake full exam
        </Link>
      </div>
    </article>
  );
}

/** Timed drill of questions whose latest answer was wrong, for one topic or all topics. */
export function PracticePage() {
  const p = useProgress();
  const [params] = useSearchParams();
  const topicId = params.get('topic');
  const topic = topicId ? TOPIC_BY_ID.get(topicId) : undefined;
  // snapshot once so the list doesn't change while answers are being recorded
  const [questions] = useState(() => (topic ? [topic] : TOPICS).flatMap((t) => currentlyWrong(p, t)));

  if (!questions.length) {
    return (
      <div className="page wk">
        <header className="wk-head">
          <span className="mlabel">
            <b>Mistakes drill</b> · {topic ? topic.title : 'all topics'}
          </span>
          <h1 className="h1">Nothing to fix. Nice!</h1>
        </header>
        <section className="panel cut-lg wk-empty rise" style={vars({ '--i': 1 })} aria-label="Drill pile empty">
          <div className="wk-empty-copy">
            <span className="chip pass">✓ 0 in the pile</span>
            <h2 className="h3">Zero mistakes in the drill pile</h2>
            <p>
              {topic
                ? `Every question you've attempted in ${topic.title} is currently correct.`
                : 'Every question you have attempted is currently correct.'}
            </p>
            <Link to="/weak-areas" className="btn btn-line">
              ← Back to weak areas
            </Link>
          </div>
          <Diagnose caret={false} lines={[{ cls: 'pass', m: '✓', tx: <b>0 failing specs to drill</b>, d: 'all green' }]} />
        </section>
      </div>
    );
  }
  return (
    <Exam
      key={topicId ?? 'all'}
      title={`Mistakes drill · ${topic ? topic.title : 'all topics'}`}
      questions={questions}
      backHref={topic ? `/topic/${topic.id}?tab=exam` : '/weak-areas'}
    />
  );
}
