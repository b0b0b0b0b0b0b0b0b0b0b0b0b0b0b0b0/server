import { MinecraftVersions, fetchMinecraftVersionsFromModrinth } from '@/lib/tools/plugins/MinecraftVersions';
import { MODRINTH_GAME_VERSIONS_CACHE_SECONDS } from '@/lib/config/modrinth';

let cachedPayload = null;
let cacheTimestamp = 0;

function cacheHeaders(maxAge = MODRINTH_GAME_VERSIONS_CACHE_SECONDS) {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}`,
  };
}

export async function GET() {
  const now = Date.now();
  if (cachedPayload && now - cacheTimestamp < MODRINTH_GAME_VERSIONS_CACHE_SECONDS * 1000) {
    return Response.json(cachedPayload, { headers: cacheHeaders() });
  }

  try {
    const rows = await fetchMinecraftVersionsFromModrinth();
    const catalog = new MinecraftVersions(rows);
    const payload = catalog.toJSON();
    cachedPayload = payload;
    cacheTimestamp = now;
    return Response.json(payload, { headers: cacheHeaders() });
  } catch {
    if (cachedPayload) {
      return Response.json(cachedPayload, { headers: cacheHeaders() });
    }
    return Response.json(
      { release: [], full: [], entries: [] },
      { status: 200, headers: cacheHeaders(60) },
    );
  }
}
