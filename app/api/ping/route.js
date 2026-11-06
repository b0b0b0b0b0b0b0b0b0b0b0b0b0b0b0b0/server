import { askPingEngine } from '@/lib/tools/ping/engine';
import { guardPingRequest } from '@/lib/tools/ping/guard';
import { PortValidator } from '@/app/components/ping/PortValidator';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const blocked = guardPingRequest(request);
  if (blocked) return blocked;
  const body = await request.json().catch(() => null);
  const host = typeof body?.host === 'string' ? body.host.trim().slice(0, 255) : '';
  const port = Number(body?.port) || 25565;
  if (!host) return Response.json({ error: 'Host is required' }, { status: 400 });
  if (!Number.isInteger(port) || port < 1 || port > 65535 || PortValidator.isForbidden(port)) {
    return Response.json({ online: false, error: 'Этот порт проверять нельзя' }, { status: 400 });
  }
  return askPingEngine('/api/ping', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ host, port }),
  });
}
