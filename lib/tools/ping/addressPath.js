const PING_PATH = '/tools/ping';

export function pingAddressPath(address) {
  const clean = String(address || '').trim();
  if (!clean) return PING_PATH;
  return `${PING_PATH}/${encodeURIComponent(clean).replace(/%3A/gi, ':')}`;
}

export function readPingAddress(pathname, search) {
  const fromQuery = new URLSearchParams(search || '').get('s');
  if (fromQuery) return fromQuery;
  const path = String(pathname || '');
  if (!path.startsWith(`${PING_PATH}/`)) return '';
  const segment = path.slice(PING_PATH.length + 1).split('/')[0];
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
