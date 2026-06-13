import { SITE_PARENT_ORIGIN } from '@/lib/config/site.js';

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
  if (!plugin?.url) return undefined;
  if (plugin.type === 'modrinth' || isModrinthPageUrl(plugin.url)) {
    return toModrinthBlackUrl(plugin.url);
  }
  return plugin.url;
}

export function isUpdateAvailable(plugin) {
  if (!plugin?.latestVersion?.releaseDate || !plugin?.currentVersion?.releaseDate) {
    return false;
  }
  const latest = new Date(plugin.latestVersion.releaseDate).getTime();
  const current = new Date(plugin.currentVersion.releaseDate).getTime();
  return latest > current && Boolean(plugin.file?.url || plugin.type === 'misc');
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
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}
