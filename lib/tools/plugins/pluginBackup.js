import { isAllowedCatalogPlugin } from '@/lib/tools/plugins/pluginUtils';

export function pluginExportFilename(serverName) {
  const slug = String(serverName ?? 'server')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `mtools-plugins-${slug || 'server'}.json`;
}

export function parsePluginImportJson(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalidJson' };
  }

  if (!Array.isArray(data)) {
    return { ok: false, reason: 'invalidFormat' };
  }

  if (!data.length) {
    return { ok: false, reason: 'emptyList' };
  }

  const valid = data.every((item) => isAllowedCatalogPlugin(item));

  if (!valid) {
    return { ok: false, reason: 'invalidFormat' };
  }

  return { ok: true, plugins: data };
}
