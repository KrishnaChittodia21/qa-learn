import { test, expect, type APIRequestContext } from '@playwright/test';
import { PASSWORD } from './helpers';

async function token(request: APIRequestContext, username: string) {
  const res = await request.post('/api/login', { data: { username, password: PASSWORD } });
  expect(res.status()).toBe(200);
  return (await res.json()).token as string;
}
const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

test.describe('REST API', { tag: '@step8' }, () => {
  test('create an order returns 201', async ({ request }) => {
    const t = await token(request, 'alice');
    const res = await request.post('/api/orders', { headers: auth(t), data: { items: [{ productId: 1, quantity: 2 }] } });
    expect(res.status()).toBe(201);
    const order = await res.json();
    expect(order.total).toBe(107.98);
    const get = await request.get(`/api/orders/${order.id}`, { headers: auth(t) });
    expect(get.status()).toBe(200);
  });

  test('orders need a token', async ({ request }) => {
    const res = await request.get('/api/orders');
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: 'Authentication required' });
  });

  test('a user cannot delete another user\'s order', async ({ request }) => {
    const alice = await token(request, 'alice');
    const bob = await token(request, 'bob');
    const created = await (await request.post('/api/orders', { headers: auth(alice), data: { items: [{ productId: 2, quantity: 1 }] } })).json();
    const del = await request.delete(`/api/orders/${created.id}`, { headers: auth(bob) });
    expect(del.status()).toBe(404);
    expect((await request.get(`/api/orders/${created.id}`, { headers: auth(alice) })).status()).toBe(200);
  });

  test('quantity above 10 is rejected', async ({ request }) => {
    const t = await token(request, 'alice');
    const ok = await request.post('/api/orders', { headers: auth(t), data: { items: [{ productId: 3, quantity: 10 }] } });
    expect(ok.status()).toBe(201);
    const bad = await request.post('/api/orders', { headers: auth(t), data: { items: [{ productId: 3, quantity: 11 }] } });
    expect(bad.status()).toBe(400);
  });

  test('unknown product is 404', async ({ request }) => {
    const res = await request.get('/api/products/999');
    expect(res.status()).toBe(404);
    expect(await res.json()).toHaveProperty('error');
  });
});
