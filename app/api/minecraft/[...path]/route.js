import { allowedMinecraftPath, askPingEngine } from '@/lib/tools/ping/engine';
import { guardPingRequest } from '@/lib/tools/ping/guard';
import { PortValidator } from '@/app/components/ping/PortValidator';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const blocked = guardPingRequest(request);
  if (blocked) return blocked;
  const { path } = await params;
  const target = allowedMinecraftPath(path);
  if (!target) return Response.json({ error: 'Not found' }, { status: 404 });
  if (target.startsWith('skin/')) return askPingEngine(`/api/minecraft/${target}`);
  const address = (new URL(request.url).searchParams.get('s') || '').trim().slice(0, 255);
  if (!PortValidator.parseAddress(address).valid) {
    return Response.json({ success: false, error: 'Этот адрес проверять нельзя' }, { status: 400 });
  }
  return askPingEngine(`/api/minecraft/${target}?s=${encodeURIComponent(address)}`);
}
