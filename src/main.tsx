import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// self-hosted variable fonts (woff2; browsers fetch only the unicode-range subsets a page uses)
// Spectral Lab type: Syne = display, Inter Tight = UI + reading (+ italic for <em> in lessons),
// Geist Mono = labels, code and every numeral
import '@fontsource-variable/syne/wght.css'
import '@fontsource-variable/inter-tight/wght.css'
import '@fontsource-variable/inter-tight/wght-italic.css'
import '@fontsource-variable/geist-mono/wght.css'
// styles, in cascade order (src/styles/*.css; each file's header names its owner and scope).
// The order mirrors the old single index.css, so rules that compete keep their original winner.
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/syllabus.css'
import './styles/topic.css'
import './styles/exam.css'
import './styles/practice.css'
import './styles/viz.css'
import './styles/coding.css'
import './styles/roadmap.css'
import './styles/pwlab.css'
import './styles/overlays.css'
import './styles/charts.css'
import './styles/today.css'
import './styles/settings.css'
import './styles/achievements.css'
import './prism-theme.css'
import App from './App.tsx'
import { applyThemeAttrs } from './lib/theme'
import { getProgress } from './lib/progress'

// set data-theme / data-accent before the first paint so there is no flash of the default theme
applyThemeAttrs(getProgress().settings)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
