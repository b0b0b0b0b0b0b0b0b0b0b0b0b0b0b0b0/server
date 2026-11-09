import {
  MODRINTH_API_V3,
  MODRINTH_GAME_VERSIONS_CACHE_SECONDS,
  MODRINTH_USER_AGENT,
} from '@/lib/config/modrinth';
import { compareMinecraftVersionsDesc } from '@/lib/tools/plugins/minecraftVersionSort';

export function normalizeGameVersionTagRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    version: row.value ?? row.version,
    version_type: row.type ?? row.version_type ?? 'release',
    date: row.created ?? row.date,
    major: Boolean(row.major),
  }));
}

export async function fetchMinecraftVersionsFromModrinth() {
  const url = `${MODRINTH_API_V3}/loader_field?loader_field=game_versions`;
  const response = await fetch(url, {
    headers: { 'User-Agent': MODRINTH_USER_AGENT },
    next: { revalidate: MODRINTH_GAME_VERSIONS_CACHE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`Modrinth game versions failed (${response.status})`);
  }
  const data = await response.json();
  return normalizeGameVersionTagRows(data);
}

export class MinecraftVersions {
  constructor(data) {
    if (Array.isArray(data)) {
      this.entries = [...data].sort((a, b) => compareMinecraftVersionsDesc(a.version, b.version));
      this.release = this.entries
        .filter((entry) => entry.version_type === 'release')
        .map((entry) => entry.version);
      this.full = this.entries.map((entry) => entry.version);
      return;
    }
    this.entries = Array.isArray(data?.entries) ? data.entries : [];
    this.release = [...(data?.release ?? [])];
    this.full = [...(data?.full ?? [])];
  }

  getRelease() {
    return [...this.release];
  }

  getFull() {
    return [...this.full];
  }

  getEntries() {
    return [...this.entries];
  }

  getDefaultRelease() {
    return this.release[0] ?? '';
  }

  toJSON() {
    return {
      release: this.getRelease(),
      full: this.getFull(),
      entries: this.getEntries(),
    };
  }
}

export async function loadMinecraftVersionsCatalog() {
  const rows = await fetchMinecraftVersionsFromModrinth();
  return new MinecraftVersions(rows);
}
