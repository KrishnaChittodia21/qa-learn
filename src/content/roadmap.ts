// 12-week plan, resources and practice projects shown on the Roadmap page.
// Topic ids link each week to the lessons that teach it.

export interface RoadmapWeek {
  weeks: string;
  title: string;
  focus: string[];
  deliverable: string;
  topics: string[];
  /** also link the JavaScript coding practice page */
  coding?: boolean;
}

export interface Resource {
  name: string;
  url: string;
  what: string;
}

export interface ResourceGroup {
  title: string;
  items: Resource[];
}

export interface PracticeProject {
  name: string;
  url: string;
  kind: string;
  practise: string[];
}

export const ROADMAP: RoadmapWeek[] = [
  {
    weeks: 'Weeks 1–2',
    title: 'Manual testing',
    focus: [
      'Revise SDLC/STLC, test levels and test types.',
      'Test design techniques: EP, BVA, decision tables, state transition.',
      'Defect life cycle, severity vs priority, writing reproducible bug reports.',
      'Exploratory and risk-based testing, Agile/Scrum testing, release activities.',
    ],
    deliverable: '30–40 test cases and five well-written bug reports (use SauceDemo).',
    topics: ['mt-fundamentals', 'mt-test-artifacts', 'mt-test-levels-types', 'mt-test-design', 'mt-defects', 'mt-exploratory-risk', 'mt-agile-release'],
  },
  {
    weeks: 'Weeks 3–4',
    title: 'API testing and SQL',
    focus: [
      'HTTP methods, status codes, headers, params, JSON and auth.',
      'Postman: collections, environments, test scripts, chaining, Newman.',
      'SQL: SELECT, WHERE, ORDER BY, aggregates, GROUP BY/HAVING, JOINs, subqueries.',
    ],
    deliverable: 'One Postman collection for Restful Booker with assertions, plus SQL practice notes.',
    topics: ['api-http', 'api-postman', 'sql-querying', 'sql-joins-validation'],
  },
  {
    weeks: 'Weeks 5–6',
    title: 'JavaScript',
    focus: [
      'Variables, types, operators, conditions, functions and closures.',
      'Arrays, objects, strings, classes, loops, modules and error handling.',
      'Promises, async/await and the event loop: why every Playwright call is awaited.',
    ],
    deliverable: 'Small JavaScript exercises: solve the array and string problems in Coding Practice.',
    topics: ['js-basics', 'js-functions', 'js-objects-strings', 'js-arrays', 'js-loops-modules-errors', 'js-async', 'js-output-puzzles'],
    coding: true,
  },
  {
    weeks: 'Weeks 7–8',
    title: 'Playwright fundamentals',
    focus: [
      'Install Node and Playwright, understand the project structure and config.',
      'Locators (getByRole, getByLabel, getByText, getByTestId) and actions.',
      'Web-first assertions, auto-waiting, dropdowns, alerts, tables, frames and forms.',
    ],
    deliverable: '10–15 working UI tests against SauceDemo and The Internet.',
    topics: ['pw-setup', 'pw-locators', 'pw-actions', 'pw-assertions-waiting'],
  },
  {
    weeks: 'Weeks 9–10',
    title: 'Automation framework',
    focus: [
      'Hooks, fixtures, the Page Object Model and test data management.',
      'Configuration, environments and authentication with storageState.',
      'Debugging with the trace viewer, fixing flaky tests, reports.',
    ],
    deliverable: 'An organised Playwright suite: POM, fixtures, config per environment, HTML report.',
    topics: ['pw-hooks-fixtures', 'pw-pom-data', 'pw-auth-config', 'pw-debug-flaky'],
  },
  {
    weeks: 'Weeks 11–12',
    title: 'Portfolio and interviews',
    focus: [
      'API tests in Playwright and network mocking.',
      'Git, GitHub and a GitHub Actions pipeline that publishes the report.',
      'Revise manual and automation interview questions; practise "how would you test…".',
    ],
    deliverable: 'One presentable QA portfolio project on GitHub with a README, test report and CI badge.',
    topics: ['pw-api-network', 'pw-git-ci', 'qa-scenarios', 'qa-interview-bank', 'qa-behavioral'],
  },
];

export const PRIORITY: string[] = [
  'Manual testing fundamentals',
  'Test case writing and defect reporting',
  'API testing with Postman',
  'SQL fundamentals',
  'JavaScript fundamentals',
  'Playwright basics',
  'Debugging, fixtures and POM',
  'Git and GitHub',
  'API automation and basic CI/CD',
  'Portfolio development and interview preparation',
];

export const PROJECTS: PracticeProject[] = [
  {
    name: 'SauceDemo',
    url: 'https://www.saucedemo.com/',
    kind: 'E-commerce UI',
    practise: ['Login (valid, locked-out, problem users)', 'Product sorting', 'Cart and checkout', 'Validation errors'],
  },
  {
    name: 'The Internet (Herokuapp)',
    url: 'https://the-internet.herokuapp.com/',
    kind: 'Browser interactions',
    practise: ['Basic and form authentication', 'Dropdowns, checkboxes, alerts', 'File upload/download', 'Dynamic loading, frames, new windows'],
  },
  {
    name: 'Restful Booker',
    url: 'https://restful-booker.herokuapp.com/apidoc/index.html',
    kind: 'REST API',
    practise: ['Create a token (POST /auth)', 'Create, read, update, delete bookings', 'Negative tests: bad token, bad payload', 'Chain requests with variables'],
  },
  {
    name: 'Playwright TodoMVC demo',
    url: 'https://demo.playwright.dev/todomvc',
    kind: 'UI (used in the Playwright docs)',
    practise: ['Add, complete and filter todos', 'Assert counts and lists', 'Local storage state'],
  },
  {
    name: 'Practice Software Testing (Toolshop)',
    url: 'https://practicesoftwaretesting.com/',
    kind: 'E-commerce UI + API',
    practise: ['Search and filters', 'Registration and login', 'Checkout with multiple payment types', 'A documented REST API'],
  },
  {
    name: 'UI Testing Playground',
    url: 'http://uitestingplayground.com/',
    kind: 'Tricky UI cases',
    practise: ['Dynamic IDs', 'Hidden and overlapped elements', 'AJAX data and client-side delays', 'Visibility and scrollbars'],
  },
];

export const RESOURCES: ResourceGroup[] = [
  {
    title: 'Bookmark first',
    items: [
      { name: 'Playwright documentation', url: 'https://playwright.dev/docs/intro', what: 'Installation, locators, assertions, debugging, API testing and frameworks.' },
      { name: 'Microsoft Learn: Build with Playwright', url: 'https://learn.microsoft.com/en-us/training/modules/build-with-playwright/', what: 'Guided beginner lessons with exercises.' },
      { name: 'Ministry of Testing', url: 'https://www.ministryoftesting.com/', what: 'Articles, community discussions and exploratory testing techniques.' },
      { name: 'ISTQB Foundation Level (CTFL v4.0)', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level', what: 'Testing fundamentals, test design, defect management and test process. Download the syllabus PDF.' },
      { name: 'Test Automation University', url: 'https://testautomationu.applitools.com/', what: 'Free video courses on automation, including Playwright and JavaScript.' },
    ],
  },
  {
    title: 'Manual testing',
    items: [
      { name: 'Guru99: Manual Testing tutorial', url: 'https://www.guru99.com/manual-testing.html', what: 'Beginner-friendly coverage of the whole manual syllabus.' },
      { name: 'Rapid Software Testing (Bach & Bolton)', url: 'https://www.satisfice.com/', what: 'Heuristics, oracles and exploratory testing from the people who defined it.' },
      { name: 'DevelopSense (Michael Bolton)', url: 'https://developsense.com/', what: 'Essays on testing vs checking, oracles and test reporting.' },
      { name: 'Software Testing Help', url: 'https://www.softwaretestinghelp.com/', what: 'Test case templates, interview question lists and tutorials.' },
    ],
  },
  {
    title: 'JavaScript',
    items: [
      { name: 'javascript.info', url: 'https://javascript.info/', what: 'The best free modern JavaScript tutorial. Do parts 1 and the Promises chapter.' },
      { name: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', what: 'The reference for every built-in, with examples.' },
      { name: 'Eloquent JavaScript (Marijn Haverbeke)', url: 'https://eloquentjavascript.net/', what: 'Free online book with exercises.' },
      { name: "You Don't Know JS Yet (Kyle Simpson)", url: 'https://github.com/getify/You-Dont-Know-JS', what: 'Free book series on scope, closures and types.' },
    ],
  },
  {
    title: 'Playwright in depth',
    items: [
      { name: 'Playwright: Assertions', url: 'https://playwright.dev/docs/test-assertions', what: 'Every web-first assertion and how retries work.' },
      { name: 'Playwright: Debugging & Trace viewer', url: 'https://playwright.dev/docs/debug', what: 'Inspector, UI mode, trace viewer.' },
      { name: 'Playwright: Best practices', url: 'https://playwright.dev/docs/best-practices', what: 'Test user-visible behaviour, isolate tests, prefer role locators.' },
      { name: 'Playwright: Fixtures', url: 'https://playwright.dev/docs/test-fixtures', what: 'Built-in and custom fixtures.' },
      { name: 'Playwright: Page Object Model', url: 'https://playwright.dev/docs/pom', what: 'The official POM pattern.' },
      { name: 'Playwright: API testing', url: 'https://playwright.dev/docs/api-testing', what: 'The request fixture and APIRequestContext.' },
      { name: 'Playwright YouTube channel', url: 'https://www.youtube.com/@Playwrightdev', what: 'Release videos and feature walkthroughs from the Playwright team.' },
    ],
  },
  {
    title: 'API, SQL and tools',
    items: [
      { name: 'Postman Learning Center', url: 'https://learning.postman.com/docs/getting-started/quick-start', what: 'Requests, collections, scripts and the collection runner.' },
      { name: 'SQLBolt', url: 'https://sqlbolt.com/', what: 'Interactive SQL lessons in the browser.' },
      { name: 'Atlassian Jira guides', url: 'https://www.atlassian.com/software/jira/guides', what: 'Issues, workflows, boards and filters.' },
      { name: 'GitHub Skills', url: 'https://skills.github.com/', what: 'Hands-on Git, GitHub and GitHub Actions courses.' },
      { name: 'MDN: HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', what: 'Methods, status codes, headers and cookies.' },
    ],
  },
  {
    title: 'Classic books (worth reading)',
    items: [
      { name: 'The Art of Software Testing (Glenford Myers)', url: 'https://www.wiley.com/en-us/The+Art+of+Software+Testing%2C+3rd+Edition-p-9781118031964', what: 'The classic on test case design and the psychology of testing.' },
      { name: 'Lessons Learned in Software Testing (Kaner, Bach, Pettichord)', url: 'https://www.wiley.com/en-us/Lessons+Learned+in+Software+Testing%3A+A+Context+Driven+Approach-p-9780471081128', what: '293 short practical lessons from experienced testers.' },
      { name: 'Explore It! (Elisabeth Hendrickson)', url: 'https://pragprog.com/titles/ehxta/explore-it/', what: 'Charters, heuristics and exploratory testing in practice.' },
      { name: 'Agile Testing (Lisa Crispin & Janet Gregory)', url: 'https://agiletester.ca/', what: 'Testing in Agile teams and the Agile Testing Quadrants.' },
    ],
  },
];

export const RESUME_TIP =
  'Keep Playwright listed as a skill you are **learning** until you can demonstrate it confidently: a public portfolio project with POM, fixtures, API tests, a CI run and a report you can walk an interviewer through. Interviewers probe every skill on the resume, and honest positioning plus a working demo beats an overstated claim.';
