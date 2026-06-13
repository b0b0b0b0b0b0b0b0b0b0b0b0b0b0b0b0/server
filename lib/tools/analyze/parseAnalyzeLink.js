const SPARK_BLOCKLIST = ['downloads', 'download', 'docs'];

function tryParseUrl(input) {
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    return new URL(candidate.split('\n')[0].split('#')[0]);
  }
  catch {
    return null;
  }
}

function sparkIdFromPath(pathname) {
  const id = pathname.replace(/^\/+/, '').split('/')[0];
  if (!id || SPARK_BLOCKLIST.includes(id.toLowerCase())) return null;
  return id;
}

export function parseAnalyzeLink(link) {
  const trimmed = link.trim().split('\n')[0].trim();
  if (!trimmed) {
    return { error: 'empty' };
  }
  if (/spigotmc\.org\/go\/timings/i.test(trimmed)) {
    return { error: 'spigotTimings' };
  }
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { id: trimmed };
  }

  const url = tryParseUrl(trimmed);
  if (url) {
    if (url.hostname === 'spark.lucko.me' || url.hostname.endsWith('.spark.lucko.me')) {
      const id = sparkIdFromPath(url.pathname);
      if (id) return { id };
    }
    if (url.hostname === 'timings.aikar.co' || url.hostname === 'timin.gs') {
      const id = url.searchParams.get('id');
      if (id) return { id };
    }
    const analyzeMatch = url.pathname.match(/\/(?:resources\/)?analyze\/([a-zA-Z0-9_-]+)/);
    if (analyzeMatch) {
      return { id: analyzeMatch[1] };
    }
  }

  const sparkMatch = trimmed.match(/spark\.lucko\.me\/([a-zA-Z0-9_-]+)/i);
  if (sparkMatch && !SPARK_BLOCKLIST.includes(sparkMatch[1].toLowerCase())) {
    return { id: sparkMatch[1] };
  }

  const timingsMatch = trimmed
    .replace('/d=', '/?id=')
    .match(/timin(?:gs\.aikar\.co|\.gs)[^?]*\?[^#]*(?:^|[?&])id=([^&#]+)/i);
  if (timingsMatch) {
    return { id: timingsMatch[1] };
  }

  return { error: 'invalid' };
}
