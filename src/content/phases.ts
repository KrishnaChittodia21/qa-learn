import type { PhaseId } from '../types';

export interface Phase {
  id: PhaseId;
  number: number;
  title: string;
  blurb: string;
}

export const PHASES: Phase[] = [
  { id: 'manual-basics', number: 1, title: 'Manual Testing Foundations', blurb: 'SDLC/STLC, QA vs QC, test artifacts, test levels and test types.' },
  { id: 'manual-advanced', number: 2, title: 'Test Design, Defects & Agile', blurb: 'BVA, EP, decision tables, bug reports, exploratory and risk-based testing, sprints and releases.' },
  { id: 'api-sql', number: 3, title: 'API Testing & SQL', blurb: 'HTTP, REST, Postman collections and assertions, and SQL for validating data.' },
  { id: 'javascript', number: 4, title: 'JavaScript for Testers', blurb: 'The JavaScript you need for Playwright: types, functions, arrays, objects, modules, errors and async/await.' },
  { id: 'pw-basics', number: 5, title: 'Playwright Fundamentals', blurb: 'Setup, locators, actions, web-first assertions and auto-waiting.' },
  { id: 'pw-framework', number: 6, title: 'Playwright Framework & CI', blurb: 'Hooks, fixtures, POM, auth, debugging flaky tests, API testing, Git and CI/CD.' },
  { id: 'interview', number: 7, title: 'QA Interview Prep', blurb: '"How would you test…" scenarios, rapid-fire manual and automation questions, and the behavioural round.' },
];
