import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  Building2,
  ChevronDown,
  CircleHelp,
  Code2,
  Crosshair,
  FlaskConical,
  LayoutGrid,
  Layers,
  ListTree,
  Moon,
  Route,
  Search,
  SlidersHorizontal,
  Sun,
  Terminal,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react';
import { Toaster } from './Toaster';
import { SiteFooter } from './SiteFooter';
import { BrandMark, BrandName } from './BrandMark';
import { on, openGuide } from '../lib/appEvents';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { localDay, setSettings, useProgress, type Progress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { studyStreak } from '../lib/streak';
import { getUiPrefs, saveUiPrefs } from '../lib/uiPrefs';
import { applyThemeAttrs } from '../lib/theme';
import { useFocusTrap } from '../lib/useFocusTrap';
import { useAchievementDetection } from '../lib/useAchievements';
import { achievementById, TIER_LABEL } from '../content/achievements';

// overlays are lazy so cmdk and the tour stay out of the main bundle until first use
const CommandPalette = lazy(() => import('./CommandPalette'));
const WelcomeTour = lazy(() => import('./WelcomeTour'));
const AchievementCelebration = lazy(() => import('./achievements/AchievementCelebration'));

/** pages worth offering under "Continue where you left off" */
const STUDY_PAGE = /^\/(topic|coding|pw-lab|playground|companies|roadmap)/;

/** true when a keystroke is going into a text field or code editor */
function typingInField(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
}

const STATUS_LABEL = { new: 'not started', 'in-progress': 'in progress', passed: 'passed' } as const;

type Icon = ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true'; strokeWidth?: number }>;
interface NavItem {
  to: string;
  label: string;
  /** short label for the mobile dock */
  dock?: string;
  icon: Icon;
  /** extra paths that count as "this section" (e.g. a topic page belongs to the Syllabus) */
  match: (path: string) => boolean;
}

/** primary instruments, in the mockup's order (numbered 01–07 in the rail) */
const PRIMARY: NavItem[] = [
  { to: '/', label: 'Today', icon: Crosshair, match: (p) => p === '/' },
  { to: '/contents', label: 'Syllabus', icon: Layers, match: (p) => p.startsWith('/contents') || p.startsWith('/topic/') },
  { to: '/coding', label: 'Coding', icon: Code2, match: (p) => p.startsWith('/coding') },
  { to: '/pw-lab', label: 'Playwright Lab', dock: 'Lab', icon: FlaskConical, match: (p) => p.startsWith('/pw-lab') },
  { to: '/roadmap', label: 'Roadmap', icon: Route, match: (p) => p.startsWith('/roadmap') },
  { to: '/weak-areas', label: 'Weak areas', icon: TriangleAlert, match: (p) => p.startsWith('/weak-areas') || p.startsWith('/practice') },
  { to: '/achievements', label: 'Achievements', icon: Award, match: (p) => p.startsWith('/achievements') },
];
/** secondary tools (rail group "Tools"; the mobile "More" sheet holds these + the primary items without a dock slot) */
const TOOLS: NavItem[] = [
  { to: '/playground', label: 'Playground', icon: Terminal, match: (p) => p.startsWith('/playground') },
  { to: '/companies', label: 'Company Qs', icon: Building2, match: (p) => p.startsWith('/companies') },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontal, match: (p) => p.startsWith('/settings') },
];
const DOCK = PRIMARY.slice(0, 4);
const MORE = [...PRIMARY.slice(4), ...TOOLS];

/** breadcrumb for the console strip (mono, uppercase via CSS) */
function crumbsFor(path: string): string[] {
  const topic = path.match(/^\/topic\/([^/]+)/);
  if (topic) {
    const t = TOPICS.find((x) => x.id === topic[1]);
    const ph = t && PHASES.find((p) => p.id === t.phase);
    const out = ['Syllabus'];
    if (ph) out.push(`Phase ${String(ph.number).padStart(2, '0')}`);
    out.push(t?.title.split(':')[0] ?? topic[1]);
    if (path.endsWith('/exam')) out.push('Exam');
    return out;
  }
  const coding = path.match(/^\/coding\/(.+)/);
  if (coding) return ['Coding', CODING_PROBLEMS.find((c) => c.id === coding[1])?.title ?? coding[1]];
  const lab = path.match(/^\/pw-lab\/(.+)/);
  if (lab) return ['Playwright Lab', `@${lab[1]}`];
  if (path.startsWith('/practice')) return ['Weak areas', 'Practice'];
  const item = [...PRIMARY, ...TOOLS].find((n) => n.match(path));
  return [item?.label ?? 'Today'];
}

/** study signal for the last `n` days (oldest first): 0 = no activity, else a 1–100 bar height */
function activitySignal(p: Progress, n: number, now = new Date()) {
  const active = new Set(p.activityDays ?? []);
  const events = new Map<string, number>();
  const bump = (iso?: string) => {
    if (!iso) return;
    const d = localDay(new Date(iso));
    events.set(d, (events.get(d) ?? 0) + 1);
  };
  Object.values(p.mcq).forEach((r) => bump(r.lastAt));
  Object.values(p.tests).forEach((r) => r.history?.forEach((h) => bump(h.at)));
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (n - 1 - i));
    const day = localDay(d);
    if (!active.has(day)) return { day, h: 0 };
    return { day, h: Math.min(100, 34 + (events.get(day) ?? 0) * 6) };
  });
}

const fmtDate = (d: Date) =>
  `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })} ${d.getFullYear()}`;

export default function Layout() {
  const p = useProgress();
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => getUiPrefs().collapsedPhases);
  const location = useLocation();
  const path = location.pathname;
  const loc = path + location.search;
  const locRef = useRef(loc);
  locRef.current = loc;
  const firstRoute = useRef(true);
  const sidebarRef = useRef<HTMLElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => applyThemeAttrs(p.settings), [p.settings]);

  // track the OS preference so the theme switch is right while theme = 'system'
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const isDark = p.settings.theme === 'dark' || (p.settings.theme === 'system' && systemDark);

  useEffect(() => saveUiPrefs({ collapsedPhases: collapsed }), [collapsed]);
  useEffect(() => {
    saveUiPrefs(STUDY_PAGE.test(loc) ? { lastLocation: loc, lastStudyLocation: loc } : { lastLocation: loc });
  }, [loc]);

  // ---- guide (welcome tour) and command palette ----
  const [tourOpen, setTourOpen] = useState(() => !getUiPrefs().tourSeen);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteLoaded, setPaletteLoaded] = useState(false);
  const showPalette = useCallback(() => {
    setPaletteLoaded(true);
    setPaletteOpen(true);
  }, []);
  const closeTour = useCallback(() => setTourOpen(false), []);
  useEffect(() => {
    if (tourOpen) saveUiPrefs({ tourSeen: true });
  }, [tourOpen]);
  useEffect(() => on('open-guide', () => setTourOpen(true)), []);

  // ---- achievements: detect + store new badges; celebrate once the guide is closed ----
  const navigate = useNavigate();
  const { queue: unlocked, dismiss: dismissUnlocked } = useAchievementDetection(p);
  const viewAllAchievements = useCallback(() => {
    dismissUnlocked();
    navigate('/achievements');
  }, [dismissUnlocked, navigate]);
  const unlockedNews = tourOpen
    ? ''
    : unlocked.length === 1
      ? `Achievement unlocked: ${achievementById[unlocked[0].id]?.name}${TIER_LABEL[unlocked[0].tier] ? `, ${TIER_LABEL[unlocked[0].tier]} tier` : ''}`
      : unlocked.length > 1
        ? `You've earned ${unlocked.length} achievements`
        : '';
  useEffect(() => on('open-palette', showPalette), [showPalette]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (paletteOpen) setPaletteOpen(false);
        else showPalette();
      } else if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !typingInField(e) && !paletteOpen) {
        e.preventDefault();
        setTourOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, showPalette]);

  // New page → top of page, except on app start, where we restore the saved scroll position.
  useEffect(() => {
    setNavOpen(false);
    setMoreOpen(false);
    if (firstRoute.current) {
      firstRoute.current = false;
      const saved = getUiPrefs().lastScroll;
      if (saved && saved.loc === locRef.current) {
        requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: saved.y })));
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [path]);

  // Remember how far down the current page the user has read.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => saveUiPrefs({ lastScroll: { loc: locRef.current, y: Math.round(window.scrollY) } }), 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Syllabus drawer + More sheet: trap focus while open, Escape closes, focus returns to the opener.
  const closeNav = useCallback(() => setNavOpen(false), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  useFocusTrap(sidebarRef, navOpen, closeNav);
  useFocusTrap(moreRef, moreOpen, closeMore);

  // Keep the active topic visible inside the syllabus list when the drawer opens.
  useEffect(() => {
    if (!navOpen) return;
    const aside = sidebarRef.current;
    const active = aside?.querySelector<HTMLElement>('.side-topic.active');
    if (aside && active && (active.offsetTop < aside.scrollTop || active.offsetTop > aside.scrollTop + aside.clientHeight - 40)) {
      aside.scrollTop = active.offsetTop - aside.clientHeight / 3;
    }
  }, [navOpen, path]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOPICS;
    return TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query]);

  const weakCount = Object.values(p.mcq).filter((r) => !r.lastCorrect).length;
  const passedCount = TOPICS.filter((t) => topicStatus(p, t) === 'passed').length;
  const codeSolved = Object.keys(p.code).length;
  const streak = studyStreak(p.activityDays);
  const wave = useMemo(() => activitySignal(p, 14), [p]);
  const crumbs = crumbsFor(path);
  const today = useMemo(() => fmtDate(new Date()), []);

  // topic pages (not a running exam) are where the syllabus index matters most
  const syllabusPage = path.startsWith('/topic/') && !path.endsWith('/exam');
  const moreActive = MORE.some((n) => n.match(path));

  const countFor = (to: string) =>
    to === '/weak-areas' && weakCount > 0 ? (
      <span className="count-tag fail" aria-label={`, ${weakCount} wrong answers`}>
        {weakCount}
      </span>
    ) : null;
  const titleFor = (to: string, label: string) =>
    to === '/coding'
      ? `JS coding practice (${codeSolved}/${CODING_PROBLEMS.length})`
      : to === '/companies'
        ? `Company questions (${COMPANY_QUESTIONS.length})`
        : label;

  const themeSwitch = (
    <div className="theme-seg" role="group" aria-label="Theme">
      <button type="button" aria-pressed={isDark} onClick={() => setSettings({ theme: 'dark' })} title="Obsidian (dark)">
        <Moon size={14} aria-hidden="true" />
        <span className="lbl">Obsidian</span>
      </button>
      <button type="button" aria-pressed={!isDark} onClick={() => setSettings({ theme: 'light' })} title="Daylight (light)">
        <Sun size={14} aria-hidden="true" />
        <span className="lbl">Daylight</span>
      </button>
    </div>
  );

  return (
    <div className={`shell ${syllabusPage ? 'has-syllabus' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* fixed lab background: gradient (body::before) + lattice + crosshairs + scanlines + grain */}
      <div className="lattice" aria-hidden="true" />
      <div className="lab-bg-marks" aria-hidden="true">
        <span className="xhair" style={{ top: 118, right: '6%' }}>
          <i />
        </span>
        <span className="xhair" style={{ top: '62%', right: '2.2%' }}>
          <i />
        </span>
        <span className="xhair" style={{ bottom: '7%', left: 'calc(var(--rail-w) + 1.4%)' }}>
          <i />
        </span>
      </div>
      <div className="scanlines" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* ---- desktop: fixed left instrument rail ---- */}
      <aside className="rail" aria-label="Main navigation">
        <Link to="/" className="brand" aria-label="QA.learn, today">
          <BrandMark />
          <BrandName />
        </Link>
        <button type="button" className="rail-search" onClick={showPalette} aria-label="Search (Command K)" title="Search (⌘K)">
          <Search size={16} aria-hidden="true" />
          <span className="lbl">Search specs</span>
          <kbd className="kbd">⌘K</kbd>
        </button>
        <div className="rail-label">Navigate</div>
        <nav className="rail-nav" aria-label="Main">
          {PRIMARY.map((n, i) => (
            <Link
              key={n.to}
              to={n.to}
              className="rail-a"
              aria-current={n.match(path) ? 'page' : undefined}
              aria-label={n.label}
              title={titleFor(n.to, n.label)}
            >
              <n.icon size={18} aria-hidden="true" strokeWidth={1.6} />
              <span className="lbl">{n.label}</span>
              {countFor(n.to)}
              <span className="ix">{String(i + 1).padStart(2, '0')}</span>
            </Link>
          ))}
        </nav>
        <div className="rail-label">Tools</div>
        <nav className="rail-nav rail-tools" aria-label="Tools">
          {TOOLS.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rail-a"
              aria-current={n.match(path) ? 'page' : undefined}
              aria-label={n.label}
              title={titleFor(n.to, n.label)}
            >
              <n.icon size={18} aria-hidden="true" strokeWidth={1.6} />
              <span className="lbl">{n.label}</span>
            </Link>
          ))}
          <button type="button" className="rail-a" onClick={openGuide} aria-label="Guide me (press ?)" title="Open the guide (press ?)">
            <CircleHelp size={18} aria-hidden="true" strokeWidth={1.6} />
            <span className="lbl">Guide me</span>
            <kbd className="kbd ix">?</kbd>
          </button>
        </nav>
        <div className="rail-spacer" />
        <div className="rail-streak" title={`${streak}-day study streak`}>
          <div className="row">
            <span className="mlabel">Streak</span>
            <b>
              {streak}
              <small>{streak === 1 ? 'day' : 'days'}</small>
            </b>
          </div>
          <div className="wave14" role="img" aria-label="Study activity over the last 14 days">
            {wave.map((d, i) => (
              <i
                key={d.day}
                className={d.h === 0 ? 'off' : i === wave.length - 1 ? 'now' : undefined}
                style={{ '--h': Math.max(d.h, 8) } as CSSProperties}
              />
            ))}
          </div>
        </div>
        {themeSwitch}
        <div className="rail-status">
          <span className="dot" aria-hidden="true" />
          <span className="txt">
            LAB ONLINE · {passedCount}/{TOPICS.length} PASSED
          </span>
        </div>
      </aside>

      {/* ---- mobile: compact top bar ---- */}
      <header className="mtop">
        <Link to="/" className="brand" aria-label="QA.learn, today">
          <BrandMark size={30} />
          <BrandName sub={false} />
        </Link>
        <span className="m-streak" title={`${streak}-day study streak`}>
          <Zap size={14} aria-hidden="true" />
          <b>{streak}</b>d<span className="sr-only"> study streak</span>
        </span>
        <button type="button" className="icon-btn m-ibtn" onClick={showPalette} aria-label="Search">
          <Search size={18} aria-hidden="true" />
        </button>
      </header>

      {/* ---- syllabus index: a drawer over the page (topic list by phase) ---- */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${navOpen ? 'open' : ''}`}
        aria-label="Syllabus"
        inert={!navOpen}
        role={navOpen ? 'dialog' : undefined}
        aria-modal={navOpen ? true : undefined}
      >
        <div className="syllabus-head">
          <span className="syllabus-title">Syllabus</span>
          <button type="button" className="icon-btn" onClick={closeNav} aria-label="Close the syllabus">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="syllabus-legend" aria-hidden="true">
          <span className="mark mark-passed" /> passed <span className="mark mark-in-progress" /> started <span className="mark mark-new" /> not run
        </div>
        <input
          className="search"
          placeholder="Filter topics, tags…"
          aria-label="Filter topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-autofocus
        />
        <nav aria-label="Topics by phase">
          {PHASES.map((ph) => {
            const topics = filtered.filter((t) => t.phase === ph.id);
            if (!topics.length) return null;
            const isCollapsed = collapsed[ph.id] && !query;
            const phPassed = topics.filter((t) => topicStatus(p, t) === 'passed').length;
            return (
              <div key={ph.id} className="side-phase">
                <button
                  className="side-phase-title"
                  onClick={() => setCollapsed((c) => ({ ...c, [ph.id]: !c[ph.id] }))}
                  type="button"
                  aria-expanded={!isCollapsed}
                >
                  <span className="side-phase-num">{String(ph.number).padStart(2, '0')}</span>
                  <span className="side-phase-name">{ph.title}</span>
                  <span className="side-phase-count">
                    {phPassed}/{topics.length}
                  </span>
                  <ChevronDown size={14} aria-hidden="true" className={`chev-icon ${isCollapsed ? 'closed' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      className="side-phase-list"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {topics.map((t) => {
                        const st = topicStatus(p, t);
                        return (
                          <NavLink key={t.id} to={`/topic/${t.id}`} className="side-link side-topic">
                            <span className={`mark mark-${st}`} aria-hidden="true" />
                            <span className="side-topic-title">{t.title}</span>
                            <span className="sr-only">, {STATUS_LABEL[st]}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </aside>
      {navOpen && <div className="scrim" onClick={closeNav} />}

      <main className="main" id="main" tabIndex={-1}>
        {/* console strip: mono breadcrumb + readouts (not a nav). Pages may portal a status into #console-slot. */}
        <div className="console shell-console">
          <span className="crumb">
            <Link to="/" className="crumb-root">
              QA.LEARN
            </Link>
            {crumbs.map((c, i) => (
              <span key={i} className="crumb-seg">
                <span aria-hidden="true">/</span>
                {i === crumbs.length - 1 ? <b aria-current="page">{c}</b> : c}
              </span>
            ))}
          </span>
          <span className="console-date">{today}</span>
          <span className="sp" aria-hidden="true" />
          <span className="console-slot" id="console-slot" />
          <span className="live" title="Topics whose full exam you have passed">
            {passedCount}/{TOPICS.length} PASSED
          </span>
          <button
            type="button"
            className={`icon-btn console-btn ${syllabusPage ? 'is-topic' : ''}`}
            onClick={() => setNavOpen((o) => !o)}
            aria-label="Open the syllabus index"
            aria-expanded={navOpen}
            title="Syllabus index"
          >
            <ListTree size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="ruler shell-ruler" aria-hidden="true" />
        <AnimatePresence initial={false}>
          <motion.div
            key={path}
            className="page-host"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <SiteFooter />
      </main>

      {/* ---- mobile: bottom instrument dock + More sheet ---- */}
      <nav className="dock" aria-label="Main">
        {DOCK.map((n) => (
          <Link key={n.to} to={n.to} aria-current={n.match(path) ? 'page' : undefined}>
            <n.icon size={20} aria-hidden="true" strokeWidth={1.6} />
            <span>{n.dock ?? n.label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={moreActive ? 'is-active' : undefined}
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
        >
          <LayoutGrid size={20} aria-hidden="true" strokeWidth={1.6} />
          <span>More</span>
          {weakCount > 0 && (
            <i className="badge-n" aria-label={`, ${weakCount} wrong answers`}>
              {weakCount}
            </i>
          )}
        </button>
      </nav>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div className="scrim sheet-scrim" onClick={closeMore} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              ref={moreRef}
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="More"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div className="sheet-head">
                <span className="mlabel">
                  <b>More</b> · instruments
                </span>
                <button type="button" className="icon-btn" onClick={closeMore} aria-label="Close">
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="sheet-grid">
                {MORE.map((n) => (
                  <Link key={n.to} to={n.to} className="sheet-a" aria-current={n.match(path) ? 'page' : undefined}>
                    <n.icon size={18} aria-hidden="true" strokeWidth={1.6} />
                    <span>{titleFor(n.to, n.label)}</span>
                    {countFor(n.to)}
                  </Link>
                ))}
                <button
                  type="button"
                  className="sheet-a"
                  onClick={() => {
                    setMoreOpen(false);
                    setNavOpen(true);
                  }}
                >
                  <ListTree size={18} aria-hidden="true" strokeWidth={1.6} />
                  <span>Syllabus index</span>
                </button>
                <button
                  type="button"
                  className="sheet-a"
                  onClick={() => {
                    setMoreOpen(false);
                    openGuide();
                  }}
                >
                  <CircleHelp size={18} aria-hidden="true" strokeWidth={1.6} />
                  <span>Guide me</span>
                </button>
              </div>
              {themeSwitch}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toaster />
      <Suspense fallback={null}>
        {paletteLoaded && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
        {tourOpen && <WelcomeTour onClose={closeTour} />}
        {/* achievement unlocks wait until the guide is closed */}
        {unlocked.length > 0 && !tourOpen && <AchievementCelebration items={unlocked} onClose={dismissUnlocked} onViewAll={viewAllAchievements} />}
      </Suspense>
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {unlockedNews}
      </div>
    </div>
  );
}
