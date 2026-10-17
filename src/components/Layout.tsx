import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  Building2,
  ChevronDown,
  Code2,
  FlaskConical,
  LayoutDashboard,
  ListTree,
  Map as MapIcon,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Target,
  Terminal,
} from 'lucide-react';
import { Toaster } from './Toaster';
import { SiteFooter } from './SiteFooter';
import { BrandMark } from './BrandMark';
import { on, openGuide } from '../lib/appEvents';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { setSettings, useProgress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { getUiPrefs, saveUiPrefs } from '../lib/uiPrefs';
import { applyThemeAttrs } from '../lib/theme';
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

/** below this width the main nav and the syllabus live in a drawer */
const isCompact = () => window.matchMedia('(max-width: 1099px)').matches;

export default function Layout() {
  const p = useProgress();
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => getUiPrefs().sidebarCollapsed);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => getUiPrefs().collapsedPhases);
  const location = useLocation();
  const loc = location.pathname + location.search;
  const locRef = useRef(loc);
  locRef.current = loc;
  const firstRoute = useRef(true);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => applyThemeAttrs(p.settings), [p.settings]);

  // track the OS preference so the toggle icon is right while theme = 'system'
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const isDark = p.settings.theme === 'dark' || (p.settings.theme === 'system' && systemDark);

  useEffect(() => saveUiPrefs({ sidebarCollapsed }), [sidebarCollapsed]);
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
    if (firstRoute.current) {
      firstRoute.current = false;
      const saved = getUiPrefs().lastScroll;
      if (saved && saved.loc === locRef.current) {
        requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: saved.y })));
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

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

  // Keep the active topic visible inside the sidebar list.
  useEffect(() => {
    const aside = sidebarRef.current;
    const active = aside?.querySelector<HTMLElement>('.side-topic.active');
    if (aside && active && (active.offsetTop < aside.scrollTop || active.offsetTop > aside.scrollTop + aside.clientHeight - 40)) {
      aside.scrollTop = active.offsetTop - aside.clientHeight / 3;
    }
  }, [location.pathname]);

  const toggleNav = () => {
    if (isCompact() || !syllabusPage) setNavOpen((o) => !o);
    else setSidebarCollapsed((c) => !c);
  };

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

  // the syllabus sits beside lessons, not beside a running exam
  const syllabusPage = location.pathname.startsWith('/topic/') && !location.pathname.endsWith('/exam');
  const codeSolved = Object.keys(p.code).length;
  const practiceNav = [
    { to: '/coding', label: 'JS coding', long: `JS coding practice (${codeSolved}/${CODING_PROBLEMS.length})`, icon: Code2 },
    { to: '/pw-lab', label: 'Playwright Lab', long: 'Playwright Lab (auto-judged)', icon: FlaskConical },
    { to: '/companies', label: 'Company Qs', long: `Company questions (${COMPANY_QUESTIONS.length})`, icon: Building2 },
    { to: '/playground', label: 'Playground', long: 'JS Playground', icon: Terminal },
    { to: '/roadmap', label: '12-week plan', long: '12-week roadmap & projects', icon: MapIcon },
  ];

  return (
    <div className={`shell ${syllabusPage ? 'has-syllabus' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <button
          className={`btn-ghost nav-toggle ${syllabusPage ? 'nav-toggle-syllabus' : ''}`}
          onClick={toggleNav}
          aria-label={syllabusPage ? 'Toggle the syllabus' : 'Open the menu'}
          aria-expanded={navOpen}
          title={syllabusPage ? (sidebarCollapsed ? 'Show syllabus' : 'Hide syllabus') : 'Menu'}
          type="button"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <NavLink to="/" className="brand" aria-label="QA Learn, today">
          <BrandMark />
          <span className="brand-name">QA Learn</span>
        </NavLink>
        <nav className="topnav" aria-label="Main">
          <NavLink to="/" end className="topnav-link">
            Today
          </NavLink>
          <NavLink to="/contents" className="topnav-link">
            Contents
          </NavLink>
          <NavLink to="/weak-areas" className="topnav-link">
            Weak areas{weakCount > 0 && <span className="count-tag fail" aria-label={`, ${weakCount} wrong answers`}>{weakCount}</span>}
          </NavLink>
          <span className="topnav-sep" aria-hidden="true" />
          {practiceNav.map((n) => (
            <NavLink key={n.to} to={n.to} className="topnav-link">
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="topbar-report" title="Topics whose full exam you have passed">
            <span className="report-pass">{passedCount}</span>/{TOPICS.length} passed
          </span>
          <button type="button" className="btn-ghost guide-btn" onClick={openGuide} title="Open the guide (press ?)">
            Guide me
          </button>
          <button
            type="button"
            className="btn-ghost icon-btn theme-toggle"
            onClick={() => setSettings({ theme: isDark ? 'light' : 'dark' })}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <NavLink to="/achievements" className="btn-ghost icon-btn" aria-label="Achievements" title="Achievements">
            <Award size={18} aria-hidden="true" />
          </NavLink>
          <NavLink to="/settings" className="btn-ghost icon-btn" aria-label="Settings" title="Settings">
            <SettingsIcon size={18} aria-hidden="true" />
          </NavLink>
        </div>
      </header>

      <motion.aside ref={sidebarRef} layoutScroll className={`sidebar ${navOpen ? 'open' : ''}`} aria-label="Syllabus">
        <nav className="drawer-nav" aria-label="Main">
          <NavLink to="/" end className="drawer-link">
            <LayoutDashboard size={16} aria-hidden="true" /> Today
          </NavLink>
          <NavLink to="/contents" className="drawer-link">
            <ListTree size={16} aria-hidden="true" /> Contents
          </NavLink>
          <NavLink to="/weak-areas" className="drawer-link">
            <Target size={16} aria-hidden="true" /> Weak areas{weakCount > 0 && <span className="count-tag fail">{weakCount}</span>}
          </NavLink>
          <NavLink to="/achievements" className="drawer-link">
            <Award size={16} aria-hidden="true" /> Achievements
          </NavLink>
          <div className="drawer-label">Practice</div>
          {practiceNav.map((n) => (
            <NavLink key={n.to} to={n.to} className="drawer-link">
              <n.icon size={16} aria-hidden="true" /> {n.long}
            </NavLink>
          ))}
          <NavLink to="/settings" className="drawer-link">
            <SettingsIcon size={16} aria-hidden="true" /> Settings
          </NavLink>
        </nav>
        <div className="syllabus-head">
          <span className="syllabus-title">Syllabus</span>
          <span className="syllabus-legend" aria-hidden="true">
            <span className="mark mark-passed" /> passed <span className="mark mark-in-progress" /> started <span className="mark mark-new" /> not run
          </span>
        </div>
        <input
          className="search"
          placeholder="Filter topics, tags…"
          aria-label="Filter topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
      </motion.aside>
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <main className="main" id="main" tabIndex={-1}>
        <AnimatePresence initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <SiteFooter />
      </main>

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
