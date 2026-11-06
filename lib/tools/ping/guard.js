import { clientIp, isSameSite } from '@/components/mpa/server';

const WINDOW_MS = 60 * 1000;
const PER_IP_LIMIT = 30;
const GLOBAL_LIMIT = 900;
const MAX_TRACKED = 20000;

const buckets = new Map();
let globalBucket = { start: 0, count: 0 };

function hit(bucket, now) {
  if (now - bucket.start >= WINDOW_MS) {
    bucket.start = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  return bucket;
}

function sweep(now) {
  if (buckets.size < MAX_TRACKED) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.start >= WINDOW_MS) buckets.delete(key);
  }
  if (buckets.size >= MAX_TRACKED) buckets.clear();
}

function fromOurPage(request) {
  if (request.headers.get('origin')) return isSameSite(request);
  const site = request.headers.get('sec-fetch-site');
  return site === 'same-origin' || site === 'same-site';
}

export function guardPingRequest(request) {
  if (!fromOurPage(request)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const now = Date.now();
  sweep(now);

  const ip = clientIp(request);
  const bucket = hit(buckets.get(ip) || { start: now, count: 0 }, now);
  buckets.set(ip, bucket);
  globalBucket = hit(globalBucket, now);

  if (bucket.count > PER_IP_LIMIT || globalBucket.count > GLOBAL_LIMIT) {
    const retry = Math.max(1, Math.ceil((bucket.start + WINDOW_MS - now) / 1000));
    return Response.json(
      { online: false, error: 'Слишком много проверок подряд — подожди минутку' },
      { status: 429, headers: { 'retry-after': String(retry) } },
    );
  }
  return null;
}
