import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'http-request-flow',
  title: 'HTTP requests against Restful Booker',
  blurb: 'Follow real Restful Booker calls from client to server to datastore and back: methods, headers, status codes, and the token and bookingid saved for the next request.',
  placements: [
    { topic: 'api-http', heading: 'HTTP methods' },
    { topic: 'api-http', heading: 'Status codes' },
    { topic: 'api-postman', heading: 'Chaining requests' },
  ],
};
