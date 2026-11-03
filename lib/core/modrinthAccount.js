import { cookies } from 'next/headers';

const SSO_COOKIE = 'mp_sid';
const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001';

export async function getModrinthUser() {
  const key = process.env.SSO_INTERNAL_KEY;
  const token = (await cookies()).get(SSO_COOKIE)?.value;
  if (!key || !token || token.length > 128) return null;
  try {
    const res = await fetch(`${INTERNAL_URL}/api/internal/session`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-key': key },
      body: JSON.stringify({ token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  } catch {
    return null;
  }
}
