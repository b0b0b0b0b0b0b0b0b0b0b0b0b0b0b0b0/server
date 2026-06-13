import { fetchLatestMcRelease, isMcVersionOlder, normalizeMcVersion } from '@/lib/tools/analyze/minecraftVersion';

const FORK_BUTTONS = [
  { text: 'Paper', url: 'https://papermc.io' },
  { text: 'Purpur', url: 'https://purpurmc.org' },
];

export async function buildOutdatedVersionField(rawVersion) {
  const current = normalizeMcVersion(rawVersion);
  if (!current) return null;
  const latest = await fetchLatestMcRelease();
  if (!isMcVersionOlder(current, latest)) return null;
  return {
    name: '❌ Outdated',
    value: `You are using \`${current}\`. Update to \`${latest}\`.`,
    buttons: FORK_BUTTONS,
  };
}
