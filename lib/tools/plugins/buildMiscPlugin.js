function slugifyPluginId(value) {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug;
}

export function miscPluginIdFromName(name, fallback) {
  return slugifyPluginId(name) || slugifyPluginId(fallback) || `jar-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildMiscPluginFromJar({ name, version, fileName }) {
  const now = new Date();
  const versionLabel = version || 'Unknown';
  const id = miscPluginIdFromName(name, fileName?.replace(/\.jar$/i, ''));

  return {
    id,
    type: 'misc',
    name,
    url: '',
    iconUrl: '',
    currentVersion: {
      id: 'jar',
      name: versionLabel,
      releaseDate: now,
    },
    latestVersion: {
      id: 'jar',
      name: versionLabel,
      releaseDate: now,
    },
    updateDate: now,
  };
}
