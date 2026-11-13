// What each page is for (M4): shown by PageGuide when "Guide me" or "?" is used on that page, with a "Show me"
// walkthrough that points at the real elements. Stops whose element isn't on screen (the phone layout, a locked tab)
// are skipped, so a walk can list desktop and phone targets side by side.
import type { WalkStep } from './guide';

export interface Guide {
  title: string;
  intro: string;
  /** "what is what" on this page */
  items: [string, string][];
  /** "Show me": the same ideas pointed out on the real page */
  walk?: WalkStep[];
}

const rail = (to: string) => `.rail-a[href="#${to}"]`;

/** The menu: the rail on a desktop, the top bar on a phone. Also the walk after the first-visit tour. */
export const MENU_WALK: WalkStep[] = [
  { target: rail('/'), title: 'Dashboard', text: 'Your next step, the spot to fix and today’s Short. The app also reopens where you left off.' },
  { target: rail('/syllabus'), title: 'Syllabus', text: 'Every topic by stage, with its status. Pick one to study it.' },
  { target: rail('/track'), title: 'Track', text: 'Your progress charts: coverage, the journey, skills, bugs caught, exam trend, study days and coding.' },
  { target: rail('/coding'), title: 'Coding', text: 'JavaScript problems for the live-coding round, judged by tests as you type.' },
  { target: rail('/pw-lab'), title: 'Playwright Lab', text: 'Write real Playwright tests against a shop app with hidden bugs, then let the judge count what you caught.' },
  { target: rail('/roadmap'), title: 'Roadmap', text: 'Plan your journey: your pace decides when you finish each phase.' },
  { target: rail('/weak-areas'), title: 'Weak areas', text: 'The exam questions you got wrong, grouped by the section to reread. The number is how many are still wrong.' },
  { target: rail('/achievements'), title: 'Achievements', text: 'Badges that climb from bronze to diamond as you study.' },
  { target: rail('/saved'), title: 'Saved', text: 'Everything you pressed ☆ Save on, to come back to. The number is how many are still to do.' },
  { target: '.rail-search, .mtop [aria-label="Search"]', title: 'Search', text: 'Jump to any topic, section, problem or question by typing.', shortcut: '⌘K or Ctrl K' },
  { target: '.rail-a[aria-label^="Guide me"]', title: 'Guide me', text: 'Explains the page you are on, with a walkthrough like this one.', shortcut: '?' },
];

const GUIDES: { match: (path: string) => boolean; guide: Guide }[] = [
  {
    match: (p) => p === '/',
    guide: {
      title: 'Dashboard',
      intro: 'Where to go next: one next step, the spot to fix, today’s Short, the next coding problem and your badges.',
      items: [
        ['Next mission', 'The one thing to do next, in study order: read, practise, then pass the exam.'],
        ['Weak spot', 'The section your wrong answers point at, to reread before anything new.'],
        ['Short of the day', 'A 90-second story; a new one each day you watch.'],
        ['Build matrix', 'Every topic as a cell, by track and stage. Click a cell to open its topic, or a stage to open its first topic.'],
        ['Tracking', 'Your numbers, charts and streak are on Track.'],
      ],
      walk: [
        { target: '.hero-cta', title: 'Your next step', text: 'Always one button: the next section to read, the next lab, or the exam.' },
        { target: '.b-short', title: 'Short of the day', text: 'A quick story that ends with one question.' },
        { target: '.b-matrix', title: 'Build matrix', text: 'Each cell is a topic: its colour is its status, its bar the sections read.' },
        ...MENU_WALK,
      ],
    },
  },
  {
    match: (p) => p === '/syllabus',
    guide: {
      title: 'Syllabus',
      intro: 'Every topic in the course, by stage and in study order.',
      items: [
        ['Stages', 'Click a stage to fold it open or shut; your choice is remembered.'],
        ['Status marks', 'Passed, started or not run yet, from what you have read and the exams you passed.'],
        ['Filter', 'Type a word to find a topic by its title or tags.'],
      ],
      walk: [
        { target: '.syllabus-page .search', title: 'Filter', text: 'Find a topic by word or tag.' },
        { target: '.syllabus-page .side-phase-title', title: 'Stages', text: 'Each stage with how many of its topics you passed. Click to open or close it.' },
      ],
    },
  },
  {
    match: (p) => p === '/track',
    guide: {
      title: 'Track',
      intro: 'How you are doing, in charts: nothing to act on here, just where you stand.',
      items: [
        ['Coverage prism', 'How much of each track you have passed.'],
        ['Journey pipeline', 'Every stage of the course and where you are in it.'],
        ['Skill radar and bugs caught', 'Exam accuracy by skill, and the hidden bugs your Playwright Lab tests caught.'],
        ['Study record', 'Your exam score trend, study days and JS coding by category.'],
      ],
      walk: [
        { target: '[aria-label^="Coverage prism"]', title: 'Coverage', text: 'How much of each track you have passed.' },
        { target: '.b-pipe', title: 'Journey pipeline', text: 'Every stage in order; the lit one is where you are.' },
        { target: '.b-radar', title: 'Skill radar', text: 'Share of exam questions you currently answer right, by skill.' },
      ],
    },
  },
  {
    match: (p) => /^\/topic\/[^/]+\/exam$/.test(p),
    guide: {
      title: 'Exam',
      intro: 'A timed exam on one topic. A full-length run that reaches the pass mark marks the topic passed.',
      items: [
        ['Interview mode', 'Lock each answer to see the verdict and the follow-up question at once, like a real interview.'],
        ['Questions and time', 'Fewer questions makes a practice run; only full-length runs count towards passing.'],
        ['Review', 'After submitting, every question with its explanation, and the sections to reread.'],
      ],
      walk: [
        { target: '#ex-count', title: 'Questions', text: 'How many questions this run has. All of them counts towards passing.' },
        { target: '[aria-label="Run summary"]', title: 'Run summary', text: 'The pass mark, time per question and your best score so far.' },
        { target: '.ex-setup-act', title: 'Start', text: 'Starts the timer. Keys 1–5 pick an option, arrows move, F flags, L locks an answer.' },
      ],
    },
  },
  {
    match: (p) => p.startsWith('/topic/'),
    guide: {
      title: 'Topic',
      intro: 'Each topic is a study loop: learn, practise, then pass the exam.',
      items: [
        ['Learn', 'Short sections with diagrams and animations. Tick “Mark as read” as you finish each one.'],
        ['Labs', '“Improve This” exercises: turn weak tests and buggy code into strong ones.'],
        ['Interview', 'Answer out loud or in writing first, then see the model answer and rate yourself.'],
        ['Drills', 'Worked practice problems, revealed one step at a time.'],
        ['Exam', 'Locked until every section is read (you can change that in Settings).'],
        ['☆ Save', 'Puts the topic, a section or a question on your Saved list.'],
      ],
      walk: [
        { target: '.tl', title: 'Study path', text: 'The steps of this topic, left to right. Each fills in as you finish it.' },
        { target: '.tp-tick', title: 'Mark as read', text: 'Tick each section when you have read it. That unlocks the exam.' },
        { target: '.save-btn', title: '☆ Save', text: 'Save the topic or a section to come back to it from Saved.' },
        { target: '[aria-label="Topic pager"]', title: 'Next topic', text: 'Moves on to the previous or next topic in the course.' },
      ],
    },
  },
  {
    match: (p) => /^\/coding\/.+/.test(p),
    guide: {
      title: 'Coding problem',
      intro: 'Write the function, run the tests, then submit to run the hidden ones too.',
      items: [
        ['Hints', 'One at a time, so you only take the help you need.'],
        ['Run and Submit', 'Run checks the visible tests; Submit adds the hidden ones and marks the problem solved.'],
        ['Reference solution', 'Opens after your own attempt, with the explanation and follow-up questions.'],
      ],
      walk: [
        { target: '.cx-stmt', title: 'The problem', text: 'What the function must do, with example tests.' },
        { target: '.cx-hints', title: 'Hints', text: 'Reveal them one at a time.' },
        { target: '.save-btn', title: '☆ Save', text: 'Keep this problem on your Saved list.' },
        { target: '[aria-label="Problem navigation"]', title: 'Next problem', text: 'Moves through the problems in order.' },
      ],
    },
  },
  {
    match: (p) => p === '/coding',
    guide: {
      title: 'Coding',
      intro: 'JavaScript problems for the live-coding round, from arrays and strings to async and QA utilities.',
      items: [
        ['Categories and difficulty', 'Filter to what you want to practise.'],
        ['Status', 'Solved, draft (started) or not started.'],
      ],
      walk: [{ target: '.cx-filterbar', title: 'Filters', text: 'Search, difficulty and category: find the next problem to solve.' }, { target: '.cx-prog', title: 'Your progress', text: 'Problems solved, by difficulty.' }, { target: '.cx-grp-h', title: 'Groups', text: 'Problems grouped by category; open one to see its list.' }],
    },
  },
  {
    match: (p) => p.startsWith('/pw-lab/'),
    guide: {
      title: 'Playwright Lab step',
      intro: 'Write Playwright tests for one part of the shop app. The judge runs them against hidden bugs.',
      items: [
        ['Mission', 'What to test in this step and how many bugs are hidden in it.'],
        ['Run it', 'Start the practice app, run your tests, then the judge.'],
        ['Hints', 'Nudges towards the behaviour the hidden bugs break.'],
      ],
      walk: [
        { target: '.lab-crumb', title: 'Where you are', text: 'Back to the lab overview.' },
        { target: '.save-btn', title: '☆ Save', text: 'Keep this step on your Saved list.' },
        { target: '.lab-cmd', title: 'Commands', text: 'Copy these to start the app, run your tests and grade them.' },
        { target: '.lab-hints', title: 'Hints', text: 'Open one when you are stuck.' },
      ],
    },
  },
  {
    match: (p) => p === '/pw-lab',
    guide: {
      title: 'Playwright Lab',
      intro: 'A real app with hidden bugs, and eight steps of Playwright tests to catch them.',
      items: [
        ['Steps', 'Login, search, sorting, cart, checkout, promo codes, orders and the API.'],
        ['The judge', 'Runs your tests against copies of the app with one bug each and counts the bugs you caught.'],
      ],
      walk: [{ target: '.lab-intro', title: 'The lab', text: 'Write Playwright tests against a shop app with hidden bugs.' }, { target: '.lab-setup', title: 'Set up', text: 'Start the practice app, then run the judge to score your tests.' }, { target: '.lab-scoring', title: 'Scoring', text: 'A step is done when your tests pass on the correct app and catch every hidden bug.' }, { target: '.lab-cta', title: 'Start', text: 'Opens the next step to work on.' }],
    },
  },
  {
    match: (p) => p === '/playground',
    guide: { title: 'Playground', intro: 'A scratchpad to run JavaScript and try ideas from the lessons.', items: [['Run', 'Runs your code and shows its output.']], walk: [{ target: '.pg-editor', title: 'Editor', text: 'Write any JavaScript here. It runs in your browser.' }, { target: '.pg-examples', title: 'Examples', text: 'Load a ready-made snippet to start from.' }, { target: '.pg-output', title: 'Output', text: 'console.log output and errors, with line numbers.' }] },
  },
  {
    match: (p) => p === '/roadmap',
    guide: {
      title: 'Roadmap',
      intro: 'Plan your journey: how much time you have decides when you finish each phase.',
      items: [
        ['Pace', 'Minutes a day and days a week. The finish date updates as you change them.'],
        ['Goal', 'The whole course, or just the phases or topics you pick.'],
        ['Pacer', 'Where your plan expects you today. Fall behind and it suggests how to catch up.'],
        ['Below', 'Practice projects, what to prioritise, and resources.'],
      ],
      walk: [{ target: '.pl-calc', title: 'Your pace', text: 'Set your minutes and days, pick a goal, then start the plan.' }],
    },
  },
  {
    match: (p) => p === '/companies',
    guide: {
      title: 'Company questions',
      intro: 'Questions candidates reported from real interviews, with the source of each.',
      items: [
        ['Filters', 'By company, area and difficulty.'],
        ['Practised', 'Mark a question once you have answered it out loud.'],
      ],
      walk: [
        { target: '.co-filters', title: 'Filters', text: 'Narrow the list by company, area or difficulty.' },
        { target: '.co-list', title: 'Questions', text: 'Try each one first, then open the strong answer.' },
      ],
    },
  },
  {
    match: (p) => p === '/weak-areas',
    guide: {
      title: 'Weak areas',
      intro: 'Where your exam answers say to focus, weakest first.',
      items: [
        ['Topics', 'Failed or shaky topics, with the sections your wrong answers point at.'],
        ['Mistakes drill', 'Retake only the questions you got wrong.'],
      ],
      walk: [{ target: '.wk-head', title: 'Weak areas', text: 'Topics your exam answers, interview ratings and missed steps say need work.' }, { target: '.wk-empty', title: 'Nothing yet', text: 'Take an exam and missed questions show up here.' }, { target: '.wk-card', title: 'A weak topic', text: 'Its missed sections, with buttons to drill the mistakes or retake the exam.' }],
    },
  },
  {
    match: (p) => p === '/practice',
    guide: { title: 'Mistakes drill', intro: 'An exam made of the questions you currently have wrong.', items: [['Fix them', 'A right answer takes a question out of the pile.']], walk: [{ target: '.wk-head', title: 'Mistakes drill', text: 'Only the questions whose latest answer was wrong.' }, { target: '.ex-setup-act', title: 'Start', text: 'A timed run; answering right takes a question off the list.' }] },
  },
  {
    match: (p) => p === '/achievements',
    guide: {
      title: 'Achievements',
      intro: 'Badges for reading, practising, passing exams and studying regularly.',
      items: [
        ['Tiers', 'Most badges climb bronze, silver, gold, diamond.'],
        ['Next up', 'The badge closest to its next tier.'],
      ],
      walk: [
        { target: '.ach-filters', title: 'Filters', text: 'Show earned, in progress or locked badges.' },
        { target: '.ach-bento', title: 'Badges', text: 'Each shows what earns its next tier.' },
      ],
    },
  },
  {
    match: (p) => p === '/saved',
    guide: {
      title: 'Saved',
      intro: 'Everything you pressed ☆ Save on, to come back to.',
      items: [
        ['Filters', 'Lessons, questions, or coding and lab.'],
        ['Done', 'Mark an item done when you have gone back to it; it moves to the Done list.'],
      ],
      walk: [
        { target: '.saved-chips', title: 'Filters', text: 'Show one kind of item at a time.' },
        { target: '.saved-list', title: 'Your list', text: 'Open an item where it lives, mark it done or remove it.' },
      ],
    },
  },
  {
    match: (p) => p === '/shorts',
    guide: {
      title: 'Shorts',
      intro: 'Ninety-second animated stories: famous software failures and how key testing ideas work.',
      items: [
        ['Unwatched first', 'A Short counts as watched once you reach its end card.'],
        ['Play all', 'Plays every unwatched Short back to back.'],
        ['One question each', 'Every Short ends with a quick question before the lesson it comes from.'],
      ],
      walk: [
        { target: '.sh-status', title: 'Your count', text: 'How many you have watched, and Play all.' },
        { target: '.sh-grid', title: 'The Shorts', text: 'Open one to play it.' },
      ],
    },
  },
  {
    match: (p) => p.startsWith('/short/'),
    guide: {
      title: 'Short',
      intro: 'A Short plays itself, one beat at a time.',
      items: [
        ['Move', 'Tap the left or right side, use Back and Next, or the ← → keys.'],
        ['Pause', 'Press and hold, the ❚❚ button, or Space.'],
        ['Speed', 'The 1× button cycles normal, faster and slower reading.'],
        ['Your turn', 'The quiz waits for your answer before Next works.'],
      ],
      walk: [
        { target: '.sp-bars', title: 'Beats', text: 'One bar per beat; the last is the end card.' },
        { target: '.sp-top', title: 'Controls', text: 'Save, reading speed and pause.' },
        { target: '.sp-navrow', title: 'Back and Next', text: 'Read any beat again.' },
      ],
    },
  },
  {
    match: (p) => p === '/settings',
    guide: {
      title: 'Settings',
      intro: 'How exams run and how the app looks.',
      items: [
        ['Exams', 'Pass mark, time per question and shuffling.'],
        ['Study-first lock', 'Whether exams (and interview answers) wait until every section is read.'],
        ['Appearance', 'Theme and accent colour.'],
      ],
      walk: [{ target: '.set-tabs', title: 'Sections', text: 'One section at a time: exams, appearance, study lock, guide and tips, reset.' }, { target: '.set-read', title: 'At a glance', text: 'Your current pass mark, timing, lock and theme.' }, { target: '#set-tab-danger', title: 'Reset', text: 'Clears your progress; settings stay.' }],
    },
  },
];

/** the guide for a page, or null for an unknown path ("Guide me" opens the welcome tour there) */
export const guideFor = (path: string): Guide | null => GUIDES.find((g) => g.match(path))?.guide ?? null;
