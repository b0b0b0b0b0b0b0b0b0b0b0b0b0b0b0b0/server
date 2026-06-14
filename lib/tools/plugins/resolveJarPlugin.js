import { delay, yieldToMain } from '@/lib/core/yieldToMain';
import { getPluginLoaders } from '@/lib/tools/plugins/PluginLoaders';
import { createPlugin, searchPlugins } from '@/lib/tools/plugins/PluginRegistry';
import { normalizePluginFetchOptions } from '@/lib/tools/plugins/PluginFetchOptions';

const SEARCH_QUERY_DELAY_MS = 140;
const RESOLVE_ITEM_DELAY_MS = 180;
const MAX_SEARCH_QUERIES = 3;
const MIN_MATCH_SCORE = 90;
const ALLOWED_SUFFIXES = new Set(['x', 're', 'v2', 'mc', '2', 'plus']);

export function normalizeName(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function scoreNameMatch(candidate, query) {
  const q = normalizeName(query);
  const c = normalizeName(candidate);
  if (!q || !c) return 0;
  if (c === q) return 100;

  const shorter = q.length <= c.length ? q : c;
  const longer = q.length > c.length ? q : c;
  if (!longer.startsWith(shorter)) return 0;

  const extra = longer.slice(shorter.length);
  if (!extra) return 100;
  if (extra.length <= 1) return 92;
  if (extra.length <= 4 && ALLOWED_SUFFIXES.has(extra)) return 90;
  return 0;
}

function normalizeVersion(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\+.*$/, '')
    .replace(/\.jar$/i, '')
    .trim();
}

export function jarSearchNames({ name, fileName }) {
  const names = [];
  const add = (value) => {
    const trimmed = String(value ?? '').trim();
    if (trimmed && !names.some((item) => normalizeName(item) === normalizeName(trimmed))) {
      names.push(trimmed);
    }
  };

  add(name);
  const base = fileName?.replace(/\.jar$/i, '');
  add(base);
  if (base) {
    add(base.replace(/[-_][\d.]+(?:[-_][\d.]+)*$/i, ''));
    const firstSegment = base.split(/[-_]/)[0];
    if (firstSegment && firstSegment !== base) add(firstSegment);
  }
  return names.slice(0, MAX_SEARCH_QUERIES);
}

function rankHits(hits, searchNames, getFields) {
  return hits
    .map((hit) => {
      const fields = getFields(hit);
      const score = Math.max(
        ...searchNames.flatMap((query) => fields.map((field) => scoreNameMatch(field, query))),
      );
      const shortestField = fields.reduce(
        (shortest, field) => (normalizeName(field).length < normalizeName(shortest).length ? field : shortest),
        fields[0],
      );
      return { hit, score, length: normalizeName(shortestField).length };
    })
    .filter((item) => item.score >= MIN_MATCH_SCORE)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.length - b.length;
    });
}

export function pickInstalledVersion(versions, jarVersion) {
  if (!jarVersion) {
    return versions?.[0] ?? null;
  }

  const target = normalizeVersion(jarVersion);
  if (!versions?.length) {
    return {
      id: 'jar-installed',
      name: jarVersion,
      releaseDate: new Date(0),
    };
  }

  const exact = versions.find((version) => normalizeVersion(version.name) === target);
  if (exact) return exact;

  const partial = versions.find((version) => {
    const candidate = normalizeVersion(version.name);
    return candidate.startsWith(target) || target.startsWith(candidate);
  });
  if (partial) return partial;

  return {
    id: 'jar-installed',
    name: jarVersion,
    releaseDate: new Date(0),
  };
}

export function mergeJarRelinkPlugin(jarItem, fetched) {
  const currentVersion = pickInstalledVersion(fetched.versions, jarItem?.version)
    ?? fetched.currentVersion
    ?? fetched.latestVersion;

  return {
    ...fetched,
    currentVersion,
    updateDate: new Date(),
  };
}

function isDuplicate(plugin, existingPlugins, seen) {
  const key = `${plugin.type}:${plugin.id}`;
  if (seen.has(key)) return true;
  return existingPlugins.some(
    (item) => item.type === plugin.type && String(item.id) === String(plugin.id),
  );
}

async function searchCatalog(type, query, loaders, gameVersion) {
  await yieldToMain();
  if (type === 'modrinth') {
    return searchPlugins('modrinth', query, loaders, gameVersion);
  }
  return searchPlugins('spigot', query);
}

async function resolveModrinth(searchNames, version, fetchOptions) {
  const { software, gameVersion } = fetchOptions;
  const loaders = getPluginLoaders(software);
  const hitsById = new Map();
  let bestSoFar = null;

  for (const query of searchNames) {
    await delay(SEARCH_QUERY_DELAY_MS);
    const hits = await searchCatalog('modrinth', query, loaders, gameVersion);
    hits.forEach((hit) => {
      const id = hit.project_id ?? hit.slug ?? hit.id;
      if (!hitsById.has(id)) hitsById.set(id, hit);
    });

    const ranked = rankHits(
      [...hitsById.values()],
      searchNames,
      (hit) => [hit.title, hit.slug],
    );
    if (ranked[0]) {
      bestSoFar = ranked[0];
      if (ranked[0].score >= 100) break;
    }
  }

  if (!bestSoFar) return null;

  await yieldToMain();
  const instance = createPlugin({
    type: 'modrinth',
    id: bestSoFar.hit.project_id ?? bestSoFar.hit.slug ?? bestSoFar.hit.id,
  });
  await instance.fetch(fetchOptions);
  const plugin = instance.toJSON();
  plugin.currentVersion = pickInstalledVersion(plugin.versions, version) ?? plugin.latestVersion;
  return plugin;
}

async function resolveSpigot(searchNames, version, fetchOptions) {
  const hitsById = new Map();
  let bestSoFar = null;

  for (const query of searchNames) {
    await delay(SEARCH_QUERY_DELAY_MS);
    const hits = await searchCatalog('spigot', query);
    hits.forEach((hit) => {
      if (!hitsById.has(hit.id)) hitsById.set(hit.id, hit);
    });

    const ranked = rankHits(
      [...hitsById.values()],
      searchNames,
      (hit) => [hit.name],
    );
    if (ranked[0]) {
      bestSoFar = ranked[0];
      if (ranked[0].score >= 100) break;
    }
  }

  if (!bestSoFar) return null;

  await yieldToMain();
  const instance = createPlugin({ type: 'spigot', id: bestSoFar.hit.id });
  await instance.fetch(fetchOptions);
  const plugin = instance.toJSON();
  plugin.currentVersion = pickInstalledVersion(plugin.versions, version) ?? plugin.latestVersion;
  return plugin;
}

async function resolveParsedJar(item, fetchOptions) {
  const { name, version, fileName } = item;
  const searchNames = jarSearchNames({ name, fileName });

  try {
    const modrinth = await resolveModrinth(searchNames, version, fetchOptions);
    if (modrinth) {
      return { ...item, plugin: modrinth, source: 'modrinth' };
    }

    await yieldToMain();
    const spigot = await resolveSpigot(searchNames, version, fetchOptions);
    if (spigot) {
      return { ...item, plugin: spigot, source: 'spigot' };
    }
  } catch {
  }

  return {
    ...item,
    status: 'notFound',
    reason: 'notFound',
  };
}

function finalizeResolved(item, existingPlugins, seen) {
  if (item.status === 'notFound') {
    return {
      fileName: item.fileName,
      name: item.name,
      version: item.version,
      manifest: item.manifest,
      status: 'notFound',
      reason: 'notFound',
    };
  }

  const plugin = {
    ...item.plugin,
    updateDate: new Date(),
  };

  if (isDuplicate(plugin, existingPlugins, seen)) {
    return {
      fileName: item.fileName,
      name: item.name,
      version: item.version,
      manifest: item.manifest,
      status: 'skipped',
      reason: 'duplicate',
      plugin,
      source: item.source,
    };
  }

  seen.add(`${plugin.type}:${plugin.id}`);
  return {
    fileName: item.fileName,
    name: item.name,
    version: item.version,
    manifest: item.manifest,
    status: 'ready',
    plugin,
    source: item.source,
  };
}

export async function resolveJarPlugins(parsedItems, existingPlugins, fetchOptions, { onProgress, onItem } = {}) {
  const options = normalizePluginFetchOptions(fetchOptions);
  const seen = new Set();
  const results = [];

  for (let index = 0; index < parsedItems.length; index += 1) {
    await delay(RESOLVE_ITEM_DELAY_MS);
    await yieldToMain();

    const resolved = await resolveParsedJar(parsedItems[index], options);
    const entry = finalizeResolved(resolved, existingPlugins, seen);
    results.push(entry);
    onItem?.(entry, index + 1, parsedItems.length);
    onProgress?.(index + 1, parsedItems.length);
    await yieldToMain();
  }

  return {
    results,
    ready: results.filter((item) => item.status === 'ready'),
    skipped: results.filter((item) => item.status === 'skipped'),
    notFound: results.filter((item) => item.status === 'notFound'),
    failed: [],
  };
}
