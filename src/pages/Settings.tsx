import { Check, Compass } from 'lucide-react';
import { resetProgress, setSettings, useProgress } from '../lib/progress';
import { saveUiPrefs, useUiPrefs } from '../lib/uiPrefs';
import { openGuide } from '../lib/appEvents';
import { ACCENTS } from '../lib/theme';

export default function SettingsPage() {
  const p = useProgress();
  const s = p.settings;
  const ui = useUiPrefs();
  return (
    <div className="page narrow">
      <h1>Settings</h1>
      <div className="card form">
        <label>
          <span>
            Pass mark: <strong>{s.passMark}%</strong>
          </span>
          <input type="range" min={50} max={100} step={5} value={s.passMark} onChange={(e) => setSettings({ passMark: Number(e.target.value) })} />
          <span className="muted small">Applies to future attempts. Exams you already passed stay passed.</span>
        </label>
        <label>
          <span>
            Default time per exam question: <strong>{s.secondsPerQuestion}s</strong>
          </span>
          <input
            type="range"
            min={30}
            max={300}
            step={15}
            value={s.secondsPerQuestion}
            onChange={(e) => setSettings({ secondsPerQuestion: Number(e.target.value) })}
          />
          <span className="muted small">Sets the default exam duration. You can still override it before each exam.</span>
        </label>
        <div className="field">
          <span>Study-first lock</span>
          <div className="row gap-s wrap">
            {(
              [
                ['off', 'Off'],
                ['exam', 'Lock exam'],
                ['exam-interview', 'Lock exam + interview Qs'],
              ] as const
            ).map(([v, label]) => (
              <button key={v} type="button" className={`chip ${s.studyLock === v ? 'on' : ''}`} onClick={() => setSettings({ studyLock: v })}>
                {label}
              </button>
            ))}
          </div>
          <span className="muted small">
            Practice unlocks once every Learn section of the topic is marked read. Topics you have already passed are never re-locked.
          </span>
        </div>
        <label className="check">
          <input type="checkbox" checked={s.shuffle} onChange={(e) => setSettings({ shuffle: e.target.checked })} /> Shuffle questions
          and options by default
        </label>
        <div className="field">
          <span>Theme</span>
          <div className="row gap-s">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button key={t} type="button" className={`chip ${s.theme === t ? 'on' : ''}`} onClick={() => setSettings({ theme: t })}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span id="accent-label">Accent colour</span>
          <div className="accent-picker" role="group" aria-labelledby="accent-label">
            {ACCENTS.map((a) => {
              const on = (s.accent ?? 'indigo') === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`accent-swatch ${on ? 'on' : ''}`}
                  data-value={a.id}
                  aria-pressed={on}
                  onClick={() => setSettings({ accent: a.id })}
                >
                  <span className="accent-dot" aria-hidden="true">
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                  {a.label}
                </button>
              );
            })}
          </div>
          <span className="muted small">Buttons, links and highlights. Charts keep their own colours so they stay comparable.</span>
        </div>
      </div>
      <div className="card form">
        <h3>Guide</h3>
        <label className="check">
          <input type="checkbox" checked={ui.showCoachTips} onChange={(e) => saveUiPrefs({ showCoachTips: e.target.checked })} /> Show coach
          tips (a short how-to the first time you open each tab)
        </label>
        <div className="row gap-s wrap">
          <button type="button" className="btn" onClick={openGuide}>
            <Compass size={16} aria-hidden="true" /> Replay the welcome tour
          </button>
          <button type="button" className="btn-ghost" onClick={() => saveUiPrefs({ coachDismissed: {}, showCoachTips: true })}>
            Show dismissed tips again
          </button>
        </div>
      </div>
      <div className="card danger">
        <h3>Reset progress</h3>
        <p className="muted small">Clears exam results, read markers, ratings and drafts. Settings are kept.</p>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => {
            if (window.confirm('Reset all progress? This cannot be undone.')) resetProgress();
          }}
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
