import { ModrinthPlugin } from '@/lib/tools/plugins/ModrinthPlugin';
import { SpigotPlugin } from '@/lib/tools/plugins/SpigotPlugin';
import { normalizePluginFetchOptions } from '@/lib/tools/plugins/PluginFetchOptions';

export function createPlugin(data) {
  switch (data.type) {
    case 'modrinth':
      return new ModrinthPlugin(data);
    case 'spigot':
      return new SpigotPlugin(data);
    case 'misc':
      return {
        ...data,
        type: 'misc',
        toJSON() {
          return { ...this };
        },
      };
    default:
      throw new Error(`Unsupported plugin type: ${data.type}`);
  }
}

export function searchPlugins(type, query, loaders, gameVersion) {
  switch (type) {
    case 'modrinth':
      return ModrinthPlugin.search(query, loaders, gameVersion);
    case 'spigot':
      return SpigotPlugin.search(query);
    default:
      throw new Error(`Unsupported plugin source: ${type}`);
  }
}

export async function refreshPlugin(plugin, fetchOptions = {}) {
  if (plugin.type === 'misc') return plugin;
  const options = normalizePluginFetchOptions(fetchOptions);
  const instance = createPlugin(plugin);
  await instance.fetch(options);
  const next = instance.toJSON();
  next.currentVersion = plugin.currentVersion ?? next.currentVersion;
  return next;
}

export function pluginFromSearchHit(type, hit) {
  if (type === 'modrinth') {
    const id = hit.project_id ?? hit.slug ?? hit.id;
    return new ModrinthPlugin({ id }).fromData(hit);
  }
  return new SpigotPlugin({ id: hit.id }).fromData(hit);
}
