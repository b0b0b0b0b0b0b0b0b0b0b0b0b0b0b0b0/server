import { PortValidator } from '@/app/components/ping/PortValidator';
import { pingEngineOrigin, readPingEngine } from '@/lib/tools/ping/engine';

const OG_IMAGE_GEN = '3';

function clean(text) {
  return String(text || '')
    .replace(/[§&](?:#[0-9a-f]{6}|x(?:[§&][0-9a-f]){6}|[0-9a-fk-orx])/gi, '')
    .replace(/§/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max) {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function pickVersion(result) {
  const branded = clean(result?.versionName);
  const mapped = clean(result?.version);
  if (/\d+\.\d+/.test(branded)) return branded;
  if (mapped && mapped !== 'хз') return mapped;
  return branded;
}

function imageUrl({ host, online, players, version, motd }) {
  const query = new URLSearchParams();
  query.set('h', host);
  query.set('o', online ? '1' : '0');
  if (players) query.set('p', players);
  if (version) query.set('v', truncate(version, 40));
  if (motd) query.set('m', truncate(motd, 90));
  query.set('n', OG_IMAGE_GEN);
  return `${pingEngineOrigin()}/og.png?${query.toString()}`;
}

export async function buildServerSharePreview(address) {
  const parsed = PortValidator.parseAddress(address);
  if (!parsed.valid || PortValidator.isForbidden(parsed.port)) return null;
  const host = PortValidator.formatAddress(parsed.host, parsed.port);
  const result = await readPingEngine('/api/ping', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ host: parsed.host, port: parsed.port, bedrock: false }),
  });
  const online = Boolean(result?.online);
  if (!online) {
    return {
      host,
      title: `${host} — оффлайн`,
      description: `Сервер ${host} сейчас не отвечает`,
      image: imageUrl({ host, online: false }),
    };
  }
  const players = `${result?.players?.online ?? 0}/${result?.players?.max ?? 0}`;
  const version = pickVersion(result);
  const motd = clean((result?.motd?.clean || []).filter(Boolean).join(' '));
  const description = ['Сервер онлайн', version ? `версия ${version}` : '', motd].filter(Boolean).join(' · ');
  return {
    host,
    title: `${host} — ${players} онлайн`,
    description: truncate(description, 180),
    image: imageUrl({ host, online: true, players, version, motd }),
  };
}
