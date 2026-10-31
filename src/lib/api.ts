// The service lives behind the app's own origin at /api (Vite proxy in dev, the host's rewrite in production),
// so the login cookie is first-party and every call is a plain same-origin fetch.
// Copied from system-design-learn's src/lib/api.ts.

export class ApiError extends Error {
  status: number;
  code: string;
  body: unknown;
  constructor(status: number, code: string, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown; headers?: Record<string, string>; keepalive?: boolean } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
      credentials: 'same-origin',
      keepalive: init.keepalive,
      headers: { ...(init.body !== undefined && { 'content-type': 'application/json' }), ...init.headers },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, 'OFFLINE', 'Could not reach the server. Check your connection and try again.', null);
  }
  const text = await res.text();
  let data: unknown = null;
  let json = true;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // not JSON (e.g. a static host without the service): treated as an error below
    json = false;
  }
  if (!res.ok) {
    // the service's own errors are { error: { code, message } }; Better Auth's are { code, message }
    const e = (data as { error?: { code?: string; message?: string }; code?: string; message?: string } | null) ?? {};
    const code = e.error?.code ?? e.code ?? `HTTP_${res.status}`;
    throw new ApiError(res.status, code, e.error?.message ?? e.message ?? 'Something went wrong. Please try again.', data);
  }
  if (!json) throw new ApiError(res.status, 'BAD_RESPONSE', 'The server sent an unexpected reply.', text);
  return data as T;
}

/** the learner's local date and zone, sent with progress writes (streaks and late-night badges use them) */
export const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
