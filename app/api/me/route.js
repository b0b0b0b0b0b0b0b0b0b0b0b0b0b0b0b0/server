import { getModrinthUser } from '@/lib/core/modrinthAccount';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getModrinthUser();
  return Response.json({ user }, { headers: { 'Cache-Control': 'private, no-store' } });
}
