const ENGINE_URL = (process.env.PING_ENGINE_URL || 'https://ping.modrinth.black').replace(/\/+$/, '');
const ENGINE_KEY = process.env.PING_ENGINE_KEY || '';
const TIMEOUT_MS = 25000;
const ALLOWED_PATHS = new Set(['query', 'players', 'skin']);

export function allowedMinecraftPath(parts) {
  if (!Array.isArray(parts) || parts.length === 0 || parts.length > 2) return null;
  const [head, tail] = parts;
  if (!ALLOWED_PATHS.has(head)) return null;
  if (head === 'skin') {
    if (!tail || !/^[A-Za-z0-9_-]{1,36}$/.test(tail)) return null;
    return `skin/${tail}`;
  }
  if (tail) return null;
  return head;
}

export async function askPingEngine(path, init = {}) {
  const headers = { 'user-agent': 'modrinth.black-mtools', ...(init.headers || {}) };
  if (ENGINE_KEY) headers['x-mtools-key'] = ENGINE_KEY;
  try {
    const res = await fetch(`${ENGINE_URL}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const type = res.headers.get('content-type') || '';
    if (!type.includes('application/json')) {
      return Response.json({ online: false, error: 'Сервис проверки сейчас недоступен' }, { status: 502 });
    }
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return Response.json({ online: false, error: 'Сервис проверки не ответил вовремя' }, { status: 504 });
  }
}
