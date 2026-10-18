import type { CSSProperties } from 'react';
import { Check, Compass, Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { resetProgress, setSettings, useProgress, type Settings } from '../lib/progress';
import { saveUiPrefs, useUiPrefs } from '../lib/uiPrefs';
import { openGuide } from '../lib/appEvents';
import { showToast } from '../lib/celebrate';
import { ACCENTS } from '../lib/theme';

const LOCKS: { v: Settings['studyLock']; label: string; detail: string }[] = [
  { v: 'off', label: 'Off', detail: 'Everything open from the start.' },
  { v: 'exam', label: 'Lock exam', detail: 'The exam opens once every Learn section is read.' },
  { v: 'exam-interview', label: 'Exam + interview Qs', detail: 'Both wait until the lessons are read.' },
];
const THEMES: { v: Settings['theme']; label: string; icon: typeof Sun }[] = [
  { v: 'system', label: 'System', icon: Monitor },
  { v: 'light', label: 'Daylight', icon: Sun },
  { v: 'dark', label: 'Obsidian', icon: Moon },
];
/** each accent id (kept from older saves) → its Spectral hue */
const ACCENT_HUE: Record<string, string> = { indigo: 'var(--mint)', teal: 'var(--cyan)', rose: 'var(--lilac)', amber: 'var(--lime)' };

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="set-toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sw" aria-hidden="true" />
      <span className="set-toggle-b">
        <b>{label}</b>
        {hint && <span className="set-hint">{hint}</span>}
      </span>
      <span className={`mono set-state ${checked ? 't-pass' : ''}`} aria-hidden="true">
        {checked ? 'ON' : 'OFF'}
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const p = useProgress();
  const s = p.settings;
  const ui = useUiPrefs();
  const accent = s.accent ?? 'indigo';
  const examMin = Math.round((s.secondsPerQuestion * 15) / 60);

  return (
    <div className="page set-page">
      <div className="set-bento">
        <section className="panel cut-lg set-head rise" style={{ '--i': 1 } as CSSProperties} aria-labelledby="set-t">
          <div className="hd-top">
            <span className="chip holo">Calibration</span>
            <span className="mlabel">
              <b>Saved in this browser</b> · applies instantly
            </span>
          </div>
          <h1 id="set-t">
            <span className="display holo-text">Settings</span>
            <span className="sub">
              <span className="outline">Tune</span> the lab to you.
            </span>
          </h1>
          <dl className="set-read">
            <div>
              <dt>Pass mark</dt>
              <dd>
                {s.passMark}
                <small>%</small>
              </dd>
            </div>
            <div>
              <dt>Per question</dt>
              <dd>
                {s.secondsPerQuestion}
                <small>s</small>
              </dd>
            </div>
            <div>
              <dt>Study lock</dt>
              <dd className="set-read-t">{LOCKS.find((l) => l.v === s.studyLock)?.label}</dd>
            </div>
            <div>
              <dt>Theme</dt>
              <dd className="set-read-t">{THEMES.find((t) => t.v === s.theme)?.label}</dd>
            </div>
          </dl>
        </section>

        {/* ---------- exam calibration ---------- */}
        <section className="panel set-exam rise" style={{ '--i': 2 } as CSSProperties} aria-labelledby="set-exam-t">
          <div className="p-head">
            <h2 className="p-title" id="set-exam-t">
              Exam calibration
            </h2>
            <span className="mlabel">CH1–CH3</span>
          </div>
          <div className="set-field">
            <div className="set-row">
              <label htmlFor="set-pass" className="mlabel">
                <b>Pass mark</b>
              </label>
              <span className="readout">
                <span className="num">
                  {s.passMark}
                  <small>%</small>
                </span>
              </span>
            </div>
            <input
              id="set-pass"
              className="set-range"
              type="range"
              min={50}
              max={100}
              step={5}
              value={s.passMark}
              style={{ '--v': ((s.passMark - 50) / 50) * 100 } as CSSProperties}
              onChange={(e) => setSettings({ passMark: Number(e.target.value) })}
              aria-describedby="set-pass-h"
            />
            <div className="set-scale" aria-hidden="true">
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            <p className="set-hint" id="set-pass-h">
              Applies to future attempts. Exams you already passed stay passed.
            </p>
          </div>
          <hr className="hair" />
          <div className="set-field">
            <div className="set-row">
              <label htmlFor="set-time" className="mlabel">
                <b>Default time per exam question</b>
              </label>
              <span className="readout">
                <span className="num">
                  {s.secondsPerQuestion}
                  <small>s</small>
                </span>
              </span>
            </div>
            <input
              id="set-time"
              className="set-range"
              type="range"
              min={30}
              max={300}
              step={15}
              value={s.secondsPerQuestion}
              style={{ '--v': ((s.secondsPerQuestion - 30) / 270) * 100 } as CSSProperties}
              onChange={(e) => setSettings({ secondsPerQuestion: Number(e.target.value) })}
              aria-describedby="set-time-h"
            />
            <div className="set-scale" aria-hidden="true">
              <span>30s</span>
              <span>165s</span>
              <span>300s</span>
            </div>
            <p className="set-hint" id="set-time-h">
              Sets the default exam duration (a 15-question exam ≈ <span className="mono">{examMin} min</span>). You can still override it before
              each exam.
            </p>
          </div>
          <hr className="hair" />
          <Toggle checked={s.shuffle} onChange={(v) => setSettings({ shuffle: v })} label="Shuffle questions and options" hint="The default for every exam and drill." />
        </section>

        {/* ---------- appearance ---------- */}
        <section className="panel set-look rise" style={{ '--i': 3 } as CSSProperties} aria-labelledby="set-look-t">
          <div className="p-head">
            <h2 className="p-title" id="set-look-t">
              Appearance
            </h2>
            <span className="mlabel">Optics</span>
          </div>
          <div className="set-field">
            <span className="mlabel" id="set-theme-l">
              <b>Theme</b>
            </span>
            <div className="set-seg" role="group" aria-labelledby="set-theme-l">
              {THEMES.map((t) => (
                <button key={t.v} type="button" aria-pressed={s.theme === t.v} onClick={() => setSettings({ theme: t.v })}>
                  <t.icon size={15} aria-hidden="true" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="set-field">
            <span className="mlabel" id="accent-label">
              <b>Colour</b>
            </span>
            <div className="ink-picker" role="group" aria-labelledby="accent-label">
              {ACCENTS.map((a) => {
                const on = accent === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`ink-swatch ${on ? 'on' : ''}`}
                    data-value={a.id}
                    aria-pressed={on}
                    style={{ '--hue': ACCENT_HUE[a.id] } as CSSProperties}
                    onClick={() => setSettings({ accent: a.id })}
                  >
                    <span className="ink-sample" aria-hidden="true">
                      <i />
                      Aa
                    </span>
                    <span className="ink-label">
                      {a.label}
                      {on && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="set-hint">Paints buttons, links and highlights. Passed, failed and in-progress always keep their own colours.</p>
          </div>
        </section>

        {/* ---------- study-first lock ---------- */}
        <section className="panel set-lock rise" style={{ '--i': 4 } as CSSProperties} aria-labelledby="set-lock-t">
          <div className="p-head">
            <h2 className="p-title" id="set-lock-t">
              Study-first lock
            </h2>
            <span className="mlabel">Gate</span>
          </div>
          <div className="set-locks" role="group" aria-labelledby="set-lock-t">
            {LOCKS.map((l) => (
              <button key={l.v} type="button" className="set-lock-opt" aria-pressed={s.studyLock === l.v} onClick={() => setSettings({ studyLock: l.v })}>
                <span className="bx" aria-hidden="true" />
                <span>
                  <b>{l.label}</b>
                  <span className="set-hint">{l.detail}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="set-hint">Practice unlocks once every Learn section of the topic is marked read. Topics you have already passed are never re-locked.</p>
        </section>

        {/* ---------- guide ---------- */}
        <section className="panel set-guide rise" style={{ '--i': 5 } as CSSProperties} aria-labelledby="set-guide-t">
          <div className="p-head">
            <h2 className="p-title" id="set-guide-t">
              Guide
            </h2>
            <span className="mlabel">Help</span>
          </div>
          <Toggle
            checked={ui.showCoachTips}
            onChange={(v) => saveUiPrefs({ showCoachTips: v })}
            label="Show coach tips"
            hint="A short how-to the first time you open each tab."
          />
          <div className="set-actions">
            <button type="button" className="btn btn-sm" onClick={openGuide}>
              <Compass size={15} aria-hidden="true" /> Replay the welcome tour
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                saveUiPrefs({ coachDismissed: {}, showCoachTips: true });
                showToast('Coach tips are back', 'Dismissed tips will show again.');
              }}
            >
              Show dismissed tips again
            </button>
          </div>
        </section>

        {/* ---------- fresh start ---------- */}
        <section className="panel flat set-danger rise" style={{ '--i': 6 } as CSSProperties} aria-labelledby="set-danger-t">
          <div>
            <span className="mlabel t-fail">Danger zone</span>
            <h2 className="p-title" id="set-danger-t">
              Fresh start
            </h2>
            <p className="set-hint">Clears exam results, read markers, ratings, drafts and badges. Your settings stay put.</p>
          </div>
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => {
              if (window.confirm('Reset all progress? This can’t be undone.')) {
                resetProgress();
                showToast('Progress reset', 'A clean build. Stage 01 is queued.');
              }
            }}
          >
            <RotateCcw size={15} aria-hidden="true" /> Reset all progress
          </button>
        </section>
      </div>
    </div>
  );
}
