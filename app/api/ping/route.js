import { askPingEngine } from '@/lib/tools/ping/engine';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const host = typeof body?.host === 'string' ? body.host.trim().slice(0, 255) : '';
  const port = Number(body?.port) || 25565;
  if (!host) return Response.json({ error: 'Host is required' }, { status: 400 });
  return askPingEngine('/api/ping', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ host, port }),
  });
}
