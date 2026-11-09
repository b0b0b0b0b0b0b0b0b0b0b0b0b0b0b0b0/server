import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const SSO_COOKIE = 'mp_sid';
const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001';
const PROJECT_ID_RE = /^[A-Za-z0-9]{6,12}$/;
const MAX_IDS = 200;
const MAX_BODY_BYTES = 32 * 1024;
const NO_STORE = { 'Cache-Control': 'private, no-store' };

function reply(body, status = 200) {
  return Response.json(body, { status, headers: NO_STORE });
}

function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!isSameOrigin(request)) return reply({ error: 'forbidden' }, 403);
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return reply({ error: 'bad_request' }, 400);
  }
  const text = await request.text().catch(() => null);
  if (!text || text.length > MAX_BODY_BYTES) return reply({ error: 'bad_request' }, 400);
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return reply({ error: 'bad_request' }, 400);
  }
  if (!body || !Array.isArray(body.projectIds)) return reply({ error: 'bad_request' }, 400);
  const projectIds = [...new Set(body.projectIds.filter((id) => typeof id === 'string' && PROJECT_ID_RE.test(id)))].slice(0, MAX_IDS);
  if (!projectIds.length) return reply({ added: 0, existing: 0, missing: 0 });

  const key = process.env.SSO_INTERNAL_KEY;
  const token = (await cookies()).get(SSO_COOKIE)?.value;
  if (!key || typeof token !== 'string' || !token || token.length > 128) return reply({ error: 'unauthorized' }, 401);

  try {
    const res = await fetch(`${INTERNAL_URL}/api/internal/favorites`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-key': key },
      body: JSON.stringify({ action: 'track', token, projectIds }),
      cache: 'no-store',
      signal: AbortSignal.timeout(60000),
    });
    const result = await res.json().catch(() => null);
    if (!result || typeof result !== 'object') return reply({ error: 'upstream' }, 502);
    return reply(result, res.status);
  } catch {
    return reply({ error: 'upstream' }, 502);
  }
}
