import { unzipSync } from 'fflate';

const TARGETS = ['plugin.yml', 'paper-plugin.yml', 'bungee.yml'];

function normalizeYamlValue(raw) {
  let value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.trim();
}

export function parsePluginYml(text) {
  let name;
  let version;
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^(name|version)\s*:\s*(.+)$/i);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = normalizeYamlValue(match[2]);
    if (field === 'name') name = value;
    if (field === 'version') version = value;
  }
  return { name, version };
}

function pickManifestFile(files) {
  const normalized = Object.entries(files).map(([name, data]) => ({
    key: name.replace(/\\/g, '/').toLowerCase(),
    name,
    data,
  }));
  for (const target of TARGETS) {
    const hit = normalized.find((entry) => entry.key === target);
    if (hit) return hit;
  }
  return null;
}

export async function readJarPluginYml(file) {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const targetSet = new Set(TARGETS);

  let manifest;
  try {
    const files = unzipSync(data, {
      filter: (info) => targetSet.has(info.name.replace(/\\/g, '/').toLowerCase()),
    });
    manifest = pickManifestFile(files);
  } catch {
    return { ok: false, reason: 'readError' };
  }

  if (!manifest) {
    return { ok: false, reason: 'noManifest' };
  }

  const text = new TextDecoder().decode(manifest.data);
  const { name, version } = parsePluginYml(text);
  if (!name) {
    return { ok: false, reason: 'noName' };
  }

  return {
    ok: true,
    name,
    version: version || '',
    manifest: manifest.name,
  };
}
