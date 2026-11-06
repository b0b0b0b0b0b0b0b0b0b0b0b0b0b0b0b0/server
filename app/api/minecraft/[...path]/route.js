import { allowedMinecraftPath, askPingEngine } from '@/lib/tools/ping/engine';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { path } = await params;
  const target = allowedMinecraftPath(path);
  if (!target) return Response.json({ error: 'Not found' }, { status: 404 });
  const query = new URL(request.url).searchParams;
  const address = (query.get('s') || '').trim().slice(0, 255);
  const search = target.startsWith('skin/') ? '' : `?s=${encodeURIComponent(address)}`;
  return askPingEngine(`/api/minecraft/${target}${search}`);
}
