import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-storage-state',
  title: 'Log in once: setup project + storageState',
  blurb: 'A setup project logs in through the UI once and saves playwright/.auth/user.json; dependent tests start logged in, each in a fresh context. Compare the time with UI login in every test, add an admin role, or let the saved session expire.',
  placements: [
    { topic: 'pw-auth-config', heading: 'Reusing authentication with storageState' },
    { topic: 'pw-auth-config', heading: 'Logging in: UI login per test vs saved state' },
  ],
};
