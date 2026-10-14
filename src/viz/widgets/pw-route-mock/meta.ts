import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-route-mock',
  title: 'page.route: fulfill, abort, continue or fetch + patch',
  blurb: 'Follow one request from the page through the route layer. Mock it, abort it, forward it with an extra header, or fetch the real response and patch one field. Try a URL the glob does not match, and register the route after goto.',
  placements: [
    { topic: 'pw-api-network', heading: 'Mocking the network with page.route' },
    { topic: 'pw-api-network', heading: 'Modifying real responses and requests' },
  ],
};
