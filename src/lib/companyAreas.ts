import type { CompanyArea } from '../types';

/** Display names for company-question areas, in filter order. */
export const AREA_LABEL: Record<CompanyArea, string> = {
  manual: 'Manual testing',
  scenario: '"How would you test…"',
  api: 'API testing',
  sql: 'SQL',
  javascript: 'JavaScript',
  playwright: 'Playwright',
  automation: 'Automation & CI',
  ai: 'AI in testing',
  behavioral: 'HR & managerial',
};
