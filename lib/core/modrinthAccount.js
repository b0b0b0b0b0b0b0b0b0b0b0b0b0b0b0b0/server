import { cookies } from 'next/headers';

const SSO_COOKIE = 'mp_sid';
const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001';

function localAvatar(url) {
  const match = typeof url === 'string' ? url.match(/\/api\/avatar\/([0-9a-f]{32})(\?v=\d+)?$/) : null;
  return match ? `/api/avatar/${match[1]}${match[2] || ''}` : url;
}

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
    return data?.user ? { ...data.user, avatar: localAvatar(data.user.avatar) } : null;
  } catch {
    return null;
  }
}
