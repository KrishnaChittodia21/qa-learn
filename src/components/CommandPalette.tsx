import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, defaultFilter } from 'cmdk';
import {
  Award,
  BookOpen,
  Building2,
  ClipboardList,
  Code2,
  Compass,
  CornerDownLeft,
  FileText,
  FlaskConical,
  History,
  LayoutDashboard,
  ListTree,
  Map,
  Moon,
  Play,
  Search,
  Settings,
  Sparkles,
  Target,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { CODING_PROBLEMS, COMPANY_QUESTIONS, PHASES, TOPICS } from '../content';
import { PW_LAB_STEPS } from '../content/pwlab';
import { getProgress, setSettings } from '../lib/progress';
import { getUiPrefs, saveUiPrefs } from '../lib/uiPrefs';
import { nextStep } from '../lib/nextStep';
import { openGuide } from '../lib/appEvents';

interface Item {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  /** extra words to match on */
  words?: string;
  run: () => void;
}

const MAX_RECENT = 5;

/** ⌘K command palette (lazy-loaded on first open). */
export default function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const groups = useMemo(() => {
    const go = (href: string) => () => nav(href);
    // rail order: numbered pages 01–07, then the Tools group
    const pages: Item[] = [
      { id: 'page:/', label: 'Today', hint: '01', icon: LayoutDashboard, words: 'dashboard home', run: go('/') },
      { id: 'page:/contents', label: 'Syllabus: every stage, topic and section', hint: '02', icon: ListTree, words: 'contents index toc build matrix', run: go('/contents') },
      { id: 'page:/coding', label: 'JS Coding Practice', hint: '03', icon: Code2, words: 'javascript problems', run: go('/coding') },
      { id: 'page:/pw-lab', label: 'Playwright Lab (Judge)', hint: '04', icon: FlaskConical, words: 'mutants bugs tests', run: go('/pw-lab') },
      { id: 'page:/roadmap', label: '12-Week Roadmap & Projects', hint: '05', icon: Map, words: 'plan weeks', run: go('/roadmap') },
      { id: 'page:/weak-areas', label: 'Weak areas', hint: '06', icon: Target, words: 'mistakes revise', run: go('/weak-areas') },
      { id: 'page:/achievements', label: 'Achievements', hint: '07', icon: Award, words: 'badges milestones rewards trophies medals', run: go('/achievements') },
      { id: 'page:/playground', label: 'JS Playground', hint: 'Tool', icon: Terminal, words: 'run javascript console', run: go('/playground') },
      { id: 'page:/companies', label: 'Company Questions', hint: 'Tool', icon: Building2, words: 'interview', run: go('/companies') },
      { id: 'page:/settings', label: 'Settings', hint: 'Tool', icon: Settings, words: 'pass mark theme reset colour accent', run: go('/settings') },
    ];
    const actions: Item[] = [
      {
        id: 'action:next',
        label: 'Go to my next step',
        hint: nextStep(getProgress(), TOPICS, { companyTotal: COMPANY_QUESTIONS.length, codingTotal: CODING_PROBLEMS.length }).title,
        icon: Sparkles,
        run: () => nav(nextStep(getProgress(), TOPICS, { companyTotal: COMPANY_QUESTIONS.length, codingTotal: CODING_PROBLEMS.length }).href),
      },
      { id: 'action:guide', label: 'Open the guide (welcome tour)', icon: Compass, words: 'help tour', run: () => openGuide() },
      {
        id: 'action:theme',
        label: 'Toggle light / dark theme',
        icon: Moon,
        words: 'dark mode light mode',
        run: () => {
          const t = getProgress().settings.theme;
          const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          setSettings({ theme: dark ? 'light' : 'dark' });
        },
      },
    ];
    const phaseOf = new globalThis.Map(PHASES.map((ph) => [ph.id, ph] as const));
    const topics: Item[] = TOPICS.map((t) => ({
      id: `topic:${t.id}`,
      label: t.title,
      hint: `Phase ${phaseOf.get(t.phase)?.number}`,
      icon: BookOpen,
      words: `${t.subtitle} ${t.tags.join(' ')}`,
      run: go(`/topic/${t.id}`),
    }));
    const sections: Item[] = TOPICS.flatMap((t) =>
      t.sections.map((s, i) => ({
        id: `section:${t.id}:${i}`,
        label: `${t.title} › ${s.heading}`,
        icon: FileText,
        run: go(`/topic/${t.id}?tab=learn&s=${i}`),
      })),
    );
    const coding: Item[] = CODING_PROBLEMS.map((q) => ({
      id: `coding:${q.id}`,
      label: q.title,
      hint: `${q.category} · ${q.difficulty}`,
      icon: Code2,
      run: go(`/coding/${q.id}`),
    }));
    const company: Item[] = COMPANY_QUESTIONS.map((q) => ({
      id: `company:${q.id}`,
      label: `${q.company}: ${q.question}`,
      hint: q.area,
      icon: Building2,
      run: go('/companies'),
    }));
    const lab: Item[] = PW_LAB_STEPS.map((s, i) => ({
      id: `pwlab:${s.id}`,
      label: `Playwright Lab step ${i + 1}: ${s.title}`,
      hint: `${s.hiddenBugs} hidden bugs`,
      icon: FlaskConical,
      words: s.summary,
      run: go(`/pw-lab/${s.id}`),
    }));
    const playground: Item[] = [{ id: 'page:/playground#run', label: 'Run JavaScript in the Playground', icon: Play, run: go('/playground') }];
    return { pages, actions, topics, sections, coding, company, lab, playground };
  }, [nav]);

  const all = useMemo(() => Object.values(groups).flat(), [groups]);
  const byId = useMemo(() => new globalThis.Map(all.map((i) => [i.id, i] as const)), [all]);
  const recent = getUiPrefs()
    .recentCommands.map((id) => byId.get(id))
    .filter((i): i is Item => !!i);

  const choose = (item: Item) => {
    saveUiPrefs({ recentCommands: [item.id, ...getUiPrefs().recentCommands.filter((x) => x !== item.id)].slice(0, MAX_RECENT) });
    onOpenChange(false);
    setSearch('');
    item.run();
  };

  // big groups only appear once the learner types, which keeps the open snappy
  const typing = search.trim().length >= 2;
  const render = (heading: string, items: Item[], prefix = '') =>
    items.length > 0 && (
      <Command.Group heading={heading}>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Command.Item
              key={prefix + it.id}
              value={prefix + it.id}
              keywords={[it.label, it.hint ?? '', it.words ?? '']}
              onSelect={() => choose(it)}
            >
              <Icon size={16} aria-hidden="true" className="cmd-icon" />
              <span className="cmd-label">{it.label}</span>
              {it.hint && <span className="cmd-hint">{it.hint}</span>}
            </Command.Item>
          );
        })}
      </Command.Group>
    );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setSearch('');
      }}
      label="Search the course"
      overlayClassName="cmd-overlay"
      contentClassName="cmd-dialog"
      className="cmd"
      loop
      filter={(_value, q, keywords) => defaultFilter(keywords?.join(' ') ?? '', q)}
    >
      <div className="cmd-head" aria-hidden="true">
        <span className="mlabel">
          <b>Search specs</b> · pages, topics, sections, questions
        </span>
        <kbd className="kbd">⌘K</kbd>
      </div>
      <div className="cmd-field">
        <Search size={18} aria-hidden="true" className="cmd-field-icon" />
        <Command.Input value={search} onValueChange={setSearch} placeholder="Where to? Pages, topics, sections, questions…" className="cmd-input" />
      </div>
      <Command.List className="cmd-list">
        <Command.Empty className="cmd-empty">Hmm, nothing by that name. Try a shorter word?</Command.Empty>
        {!typing && recent.length > 0 && (
          <Command.Group heading="Recent">
            {recent.map((it) => {
              const Icon = it.icon;
              return (
                <Command.Item key={`recent:${it.id}`} value={`recent:${it.id}`} keywords={[it.label]} onSelect={() => choose(it)}>
                  <History size={16} aria-hidden="true" className="cmd-icon" />
                  <span className="cmd-label">{it.label}</span>
                  <Icon size={14} aria-hidden="true" className="cmd-hint" />
                </Command.Item>
              );
            })}
          </Command.Group>
        )}
        {render('Actions', groups.actions)}
        {render('Pages', groups.pages)}
        {render('Topics', groups.topics)}
        {typing && render('Sections', groups.sections)}
        {typing && render('Coding problems', groups.coding)}
        {typing && render('Playwright Lab', [...groups.lab, ...groups.playground])}
        {typing && render('Company questions', groups.company)}
      </Command.List>
      <div className="cmd-foot" aria-hidden="true">
        <span>
          <kbd className="kbd">↑</kbd>
          <kbd className="kbd">↓</kbd> move
        </span>
        <span>
          <kbd className="kbd">
            <CornerDownLeft size={11} />
          </kbd>{' '}
          open
        </span>
        <span>
          <kbd className="kbd">esc</kbd> close
        </span>
        <span className="cmd-foot-tip">
          <ClipboardList size={12} /> Type 2+ letters to search sections and questions
        </span>
      </div>
    </Command.Dialog>
  );
}
