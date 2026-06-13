import { ModrinthPlugin } from '@/lib/tools/plugins/ModrinthPlugin';
import { SpigotPlugin } from '@/lib/tools/plugins/SpigotPlugin';

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

export function searchPlugins(type, query, loaders) {
  switch (type) {
    case 'modrinth':
      return ModrinthPlugin.search(query, loaders);
    case 'spigot':
      return SpigotPlugin.search(query);
    default:
      throw new Error(`Unsupported plugin source: ${type}`);
  }
}

export async function refreshPlugin(plugin, software) {
  if (plugin.type === 'misc') return plugin;
  const instance = createPlugin(plugin);
  if (plugin.type === 'modrinth') {
    await instance.fetch(software);
  } else {
    await instance.fetch();
  }
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
