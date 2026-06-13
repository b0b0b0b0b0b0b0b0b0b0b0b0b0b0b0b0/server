const MOJANG_MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';

export function normalizeMcVersion(raw) {
  if (!raw) return null;
  const mcMatch = String(raw).match(/\(MC:\s*([^)]+)\)/i);
  if (mcMatch) return mcMatch[1].trim();
  const clean = String(raw).split(')')[0].trim();
  if (/^\d+\.\d+(\.\d+)?$/.test(clean)) return clean;
  return clean;
}

export function isMcVersionOlder(current, latest) {
  const parse = (version) => version.split('.').map((part) => parseInt(part, 10) || 0);
  const left = parse(current);
  const right = parse(latest);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff < 0) return true;
    if (diff > 0) return false;
  }
  return false;
}

export async function fetchLatestMcRelease() {
  const response = await fetch(MOJANG_MANIFEST_URL, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  const manifest = await response.json();
  return manifest.latest.release;
}
