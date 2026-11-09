import { cookies } from 'next/headers';

const SSO_COOKIE = 'mp_sid';
const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001';

export async function callAccountWorkspace(action, payload = {}) {
  const key = process.env.SSO_INTERNAL_KEY;
  const token = (await cookies()).get(SSO_COOKIE)?.value;
  if (!key || typeof token !== 'string' || !token || token.length > 128) {
    return { status: 401, body: { error: 'unauthorized' } };
  }
  try {
    const res = await fetch(`${INTERNAL_URL}/api/internal/workspace`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-key': key },
      body: JSON.stringify({ ...payload, action, token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const body = await res.json().catch(() => null);
    if (!body || typeof body !== 'object') return { status: 502, body: { error: 'upstream' } };
    return { status: res.status, body };
  } catch {
    return { status: 502, body: { error: 'upstream' } };
  }
}
