import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  ChevronDown,
  Code2,
  Compass,
  FlaskConical,
  LayoutDashboard,
  ListTree,
  Map as MapIcon,
  Menu,
  Moon,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Target,
  Terminal,
} from 'lucide-react';
import { Toaster } from './Toaster';
import { SiteFooter } from './SiteFooter';
import { on, openGuide } from '../lib/appEvents';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { setSettings, useProgress } from '../lib/progress';
import { topicStatus } from '../lib/stats';
import { getUiPrefs, saveUiPrefs } from '../lib/uiPrefs';
import { applyThemeAttrs } from '../lib/theme';

// overlays are lazy so cmdk and the tour stay out of the main bundle until first use
const CommandPalette = lazy(() => import('./CommandPalette'));
const WelcomeTour = lazy(() => import('./WelcomeTour'));

/** pages worth offering under "Continue where you left off" */
const STUDY_PAGE = /^\/(topic|coding|pw-lab|playground|companies|roadmap)/;

/** true when a keystroke is going into a text field or code editor */
function typingInField(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
}

const STATUS_LABEL = { new: 'not started', 'in-progress': 'in progress', passed: 'passed' } as const;

/** Sidebar link with the shared active pill that slides between items (motion layoutId). */
function SideLink({ to, end, className = '', children }: { to: string; end?: boolean; className?: string; children: ReactNode }) {
  return (
    <NavLink to={to} end={end} className={`side-link ${className}`}>
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="side-active"
              className="side-active"
              aria-hidden="true"
              transition={{ type: 'spring', stiffness: 520, damping: 42 }}
            />
          )}
          {children}
        </>
      )}
    </NavLink>
  );
}

const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

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
    if (isMobile()) setNavOpen((o) => !o);
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

  return (
    <div className={`shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="topbar">
        <button
          className="btn-ghost nav-toggle"
          onClick={toggleNav}
          aria-label="Toggle topic sidebar"
          title={sidebarCollapsed ? 'Show topics' : 'Hide topics'}
          type="button"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <NavLink to="/" className="brand">
          <span className="brand-tile" aria-hidden="true">
            <ShieldCheck size={16} strokeWidth={2.4} />
          </span>
          <span className="brand-name">QA Learn</span>
          <span className="brand-sub">Manual · JS · Playwright</span>
        </NavLink>
        <div className="topbar-right">
          <button type="button" className="btn-ghost guide-btn" onClick={openGuide} aria-label="Open the guide" title="Guide (press ?)">
            <Compass size={18} aria-hidden="true" />
            <span className="guide-btn-text">Guide</span>
          </button>
          <span className="pill topbar-pill">
            {passedCount}/{TOPICS.length} passed
          </span>
          <button
            type="button"
            className="btn-ghost theme-toggle"
            onClick={() => setSettings({ theme: isDark ? 'light' : 'dark' })}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <NavLink to="/settings" className="btn-ghost icon-btn" aria-label="Settings" title="Settings">
            <SettingsIcon size={18} aria-hidden="true" />
          </NavLink>
        </div>
      </header>

      <motion.aside ref={sidebarRef} layoutScroll className={`sidebar ${navOpen ? 'open' : ''}`}>
        <input
          className="search"
          placeholder="Filter topics, tags…"
          aria-label="Filter topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <nav>
          <SideLink to="/" end>
            <LayoutDashboard size={16} aria-hidden="true" className="side-icon" />
            Dashboard
          </SideLink>
          <SideLink to="/contents">
            <ListTree size={16} aria-hidden="true" className="side-icon" />
            Contents
          </SideLink>
          <SideLink to="/weak-areas">
            <Target size={16} aria-hidden="true" className="side-icon" />
            Weak Areas{weakCount > 0 && <span className="side-badge">{weakCount}</span>}
          </SideLink>
          {PHASES.map((ph) => {
            const topics = filtered.filter((t) => t.phase === ph.id);
            if (!topics.length) return null;
            const isCollapsed = collapsed[ph.id] && !query;
            return (
              <div key={ph.id} className="side-phase">
                <button
                  className="side-phase-title"
                  onClick={() => setCollapsed((c) => ({ ...c, [ph.id]: !c[ph.id] }))}
                  type="button"
                  aria-expanded={!isCollapsed}
                >
                  <span className="side-phase-name">
                    <span className="side-phase-num">{ph.number}</span>
                    {ph.title}
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
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      {topics.map((t) => {
                        const st = topicStatus(p, t);
                        return (
                          <SideLink key={t.id} to={`/topic/${t.id}`} className="side-topic">
                            <span className={`dot dot-${st}`} aria-hidden="true" />
                            {t.title}
                            <span className="sr-only">, {STATUS_LABEL[st]}</span>
                          </SideLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <div className="side-phase">
            <div className="side-phase-title static">Practice</div>
            <SideLink to="/coding" className="side-topic">
              <Code2 size={16} aria-hidden="true" className="side-icon" />
              JS Coding Practice ({Object.keys(p.code).length}/{CODING_PROBLEMS.length})
            </SideLink>
            <SideLink to="/pw-lab" className="side-topic">
              <FlaskConical size={16} aria-hidden="true" className="side-icon" />
              Playwright Lab (Judge)
            </SideLink>
            <SideLink to="/companies" className="side-topic">
              <Building2 size={16} aria-hidden="true" className="side-icon" />
              Company Questions ({COMPANY_QUESTIONS.length})
            </SideLink>
            <SideLink to="/playground" className="side-topic">
              <Terminal size={16} aria-hidden="true" className="side-icon" />
              JS Playground
            </SideLink>
            <SideLink to="/roadmap" className="side-topic">
              <MapIcon size={16} aria-hidden="true" className="side-icon" />
              12-Week Roadmap &amp; Projects
            </SideLink>
          </div>
        </nav>
      </motion.aside>
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}

      <main className="main">
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
      </Suspense>
    </div>
  );
}
