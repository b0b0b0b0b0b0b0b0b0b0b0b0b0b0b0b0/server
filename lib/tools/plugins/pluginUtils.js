import { SITE_PARENT_ORIGIN } from '@/lib/config/site.js';

const ALLOWED_PLUGIN_TYPES = new Set(['modrinth', 'spigot']);

export function isModrinthSiteHost(hostname) {
  return /^([\w-]+\.)?modrinth\.(com|black)$/i.test(hostname);
}

export function isModrinthPageUrl(url) {
  if (!url) return false;
  try {
    return isModrinthSiteHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function isAllowedPluginCatalogUrl(url) {
  if (!url) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (isModrinthSiteHost(host)) return true;
    return /^(www\.)?spigotmc\.org$/.test(host);
  } catch {
    return false;
  }
}

export function isAllowedCatalogPlugin(plugin) {
  return Boolean(
    plugin
    && ALLOWED_PLUGIN_TYPES.has(plugin.type)
    && plugin.id !== undefined
    && plugin.id !== null
    && isAllowedPluginCatalogUrl(plugin.url),
  );
}

export function isAllowedPluginAssetUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (isModrinthSiteHost(host) || host === 'cdn.modrinth.com') return true;
    return /^(www\.)?spigotmc\.org$/.test(host);
  } catch {
    return false;
  }
}

export function isAllowedPluginDownloadUrl(url) {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (isModrinthSiteHost(host) || host === 'cdn.modrinth.com') return true;
    return /^(www\.)?spigotmc\.org$/.test(host);
  } catch {
    return false;
  }
}

export function getSafePluginIconUrl(plugin) {
  const url = plugin?.iconUrl;
  return url && isAllowedPluginAssetUrl(url) ? url : undefined;
}

export function toModrinthBlackUrl(url) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!isModrinthSiteHost(parsed.hostname)) {
      return url;
    }
    return `${SITE_PARENT_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

export function getModrinthPluginUrl(slug) {
  return `${SITE_PARENT_ORIGIN}/plugin/${slug}`;
}

export function getPluginPageUrl(plugin) {
  if (!plugin?.url || !isAllowedPluginCatalogUrl(plugin.url)) return undefined;
  if (plugin.type === 'modrinth' || isModrinthPageUrl(plugin.url)) {
    return toModrinthBlackUrl(plugin.url);
  }
  if (plugin.type === 'spigot') {
    return plugin.url;
  }
  return undefined;
}

export function getSearchResultPageUrl(source, item) {
  if (!item) return undefined;
  if (item.url) {
    return getPluginPageUrl({ ...item, type: source });
  }
  if (source === 'spigot' && item.id != null) {
    return `https://www.spigotmc.org/resources/${item.id}`;
  }
  if (source === 'modrinth' && item.id != null) {
    return getModrinthPluginUrl(item.id);
  }
  return undefined;
}

export function getPluginDisplayName(plugin) {
  const name = String(plugin?.name ?? '').trim();
  if (!name) return '';
  if (plugin?.type === 'spigot') {
    const parts = name.split(/\s+[-–—|]\s+/);
    if (parts.length > 1) {
      const shortName = parts[0].trim();
      if (shortName && shortName.length <= 48) {
        return shortName;
      }
    }
  }
  return name;
}

export function isUnavailableForGameVersion(plugin) {
  return Boolean(plugin?.noBuildForGameVersion && plugin?.targetGameVersion);
}

function parsePluginVersionParts(name) {
  const raw = String(name ?? '').trim().replace(/^v/i, '');
  const match = raw.match(/(\d+(?:\.\d+)*)/);
  if (!match) return null;
  return {
    parts: match[1].split('.').map((part) => Number.parseInt(part, 10)),
  };
}

function isPrereleaseVersion(name) {
  return /dev|snapshot|alpha|beta|rc|pre|\+/i.test(String(name ?? ''));
}

export function comparePluginVersionNames(a, b) {
  const left = parsePluginVersionParts(a);
  const right = parsePluginVersionParts(b);
  if (!left || !right) return null;
  const len = Math.max(left.parts.length, right.parts.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (left.parts[i] ?? 0) - (right.parts[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function isNewerThanLatest(plugin) {
  if (!plugin?.currentVersion || !plugin?.latestVersion) return false;
  if (isPrereleaseVersion(plugin.currentVersion.name)) return false;
  const cmp = comparePluginVersionNames(
    plugin.currentVersion.name,
    plugin.latestVersion.name,
  );
  return cmp !== null && cmp > 0;
}

export function isUpdateAvailable(plugin) {
  if (!plugin?.latestVersion || !plugin?.currentVersion) {
    return false;
  }
  if (isInstalledLatest(plugin)) {
    return false;
  }
  if (isNewerThanLatest(plugin)) {
    return false;
  }
  return Boolean(plugin.file?.url || plugin.file?.externalUrl);
}

export function isLatestForGameVersion(plugin, gameVersion) {
  if (!gameVersion || plugin?.type === 'misc' || plugin?.noBuildForGameVersion) {
    return false;
  }
  if (!plugin.latestVersion) {
    return false;
  }
  if (plugin.type === 'spigot') {
    return true;
  }
  return plugin.targetGameVersion === gameVersion;
}

export function isInstalledLatest(plugin) {
  if (!plugin?.currentVersion || !plugin?.latestVersion) {
    return !plugin?.latestVersion;
  }
  if (String(plugin.currentVersion.id) === String(plugin.latestVersion.id)) {
    return true;
  }
  if (plugin.currentVersion.name === plugin.latestVersion.name) {
    return true;
  }
  return isNewerThanLatest(plugin);
}

export function shouldShowLatestVersion(plugin) {
  if (!plugin?.latestVersion || !plugin?.currentVersion) {
    return false;
  }
  return !isInstalledLatest(plugin);
}

function resolvePluginDownloadUrl(plugin) {
  if (!ALLOWED_PLUGIN_TYPES.has(plugin.type)) return null;
  if (plugin.file?.externalUrl) {
    return isAllowedPluginDownloadUrl(plugin.file.externalUrl) ? plugin.file.externalUrl : null;
  }
  if (plugin.type === 'spigot' && plugin.file?.url) {
    const url = `https://www.spigotmc.org/${plugin.file.url}`;
    return isAllowedPluginDownloadUrl(url) ? url : null;
  }
  if (plugin.file?.url) {
    return isAllowedPluginDownloadUrl(plugin.file.url) ? plugin.file.url : null;
  }
  return null;
}

export function triggerDownloadOpen(url) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function openPluginDownload(plugin, rateLimit) {
  const url = resolvePluginDownloadUrl(plugin);
  if (!url) return { opened: false, deferred: false };

  if (plugin.type === 'spigot' && rateLimit && !plugin.file?.externalUrl) {
    const atLimit = rateLimit.downloadCount >= rateLimit.limit && Date.now() < rateLimit.resetTime;
    if (atLimit) return { opened: false, deferred: true };
    triggerDownloadOpen(url);
    rateLimit.downloadCount += 1;
    if (rateLimit.resetTime < Date.now()) {
      rateLimit.resetTime = Date.now() + rateLimit.windowMs;
    }
    return { opened: true, deferred: false };
  }

  triggerDownloadOpen(url);
  return { opened: true, deferred: false };
}

export function reviveDate(value) {
  if (!value) return undefined;
  return value instanceof Date ? value : new Date(value);
}

export function revivePlugin(plugin) {
  if (!plugin) return plugin;
  const revived = { ...plugin };
  if (revived.releaseDate) revived.releaseDate = reviveDate(revived.releaseDate);
  if (revived.updateDate) revived.updateDate = reviveDate(revived.updateDate);
  if (revived.currentVersion) {
    revived.currentVersion = {
      ...revived.currentVersion,
      releaseDate: reviveDate(revived.currentVersion.releaseDate),
    };
  }
  if (revived.latestVersion) {
    revived.latestVersion = {
      ...revived.latestVersion,
      releaseDate: reviveDate(revived.latestVersion.releaseDate),
    };
  }
  if (revived.versions) {
    revived.versions = revived.versions.map((version) => ({
      ...version,
      releaseDate: reviveDate(version.releaseDate),
    }));
  }
  if ((revived.type === 'modrinth' || isModrinthPageUrl(revived.url)) && revived.url) {
    revived.url = toModrinthBlackUrl(revived.url);
  }
  if (revived.iconUrl && !isAllowedPluginAssetUrl(revived.iconUrl)) {
    delete revived.iconUrl;
  }
  return revived;
}

export function serializePlugin(plugin) {
  const copy = { ...plugin };
  if (copy.releaseDate instanceof Date) copy.releaseDate = copy.releaseDate.toISOString();
  if (copy.updateDate instanceof Date) copy.updateDate = copy.updateDate.toISOString();
  if (copy.currentVersion?.releaseDate instanceof Date) {
    copy.currentVersion = {
      ...copy.currentVersion,
      releaseDate: copy.currentVersion.releaseDate.toISOString(),
    };
  }
  if (copy.latestVersion?.releaseDate instanceof Date) {
    copy.latestVersion = {
      ...copy.latestVersion,
      releaseDate: copy.latestVersion.releaseDate.toISOString(),
    };
  }
  if (copy.versions) {
    copy.versions = copy.versions.map((version) => ({
      ...version,
      releaseDate: version.releaseDate instanceof Date
        ? version.releaseDate.toISOString()
        : version.releaseDate,
    }));
  }
  if ((copy.type === 'modrinth' || isModrinthPageUrl(copy.url)) && copy.url) {
    copy.url = toModrinthBlackUrl(copy.url);
  }
  return copy;
}

export function formatPluginDate(value, locale) {
  if (!value) return '';
  const date = reviveDate(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0 || date.getFullYear() < 1980) return '';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function spigotVersionsNeedRefresh(plugin) {
  if (plugin?.type !== 'spigot' || !plugin.versions?.length) return false;
  return plugin.versions.some((version) => {
    const date = reviveDate(version.releaseDate);
    return date && date.getFullYear() < 1980;
  });
}

export function preserveVersionOnRelink(original, next) {
  return {
    ...next,
    currentVersion: original?.currentVersion ?? next.currentVersion,
    updateDate: new Date(),
  };
}
