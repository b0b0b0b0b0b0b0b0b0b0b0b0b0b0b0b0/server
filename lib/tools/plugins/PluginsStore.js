import {
  PLUGIN_DEFAULT_SERVER,
  PLUGIN_DEFAULTS,
  PLUGIN_STORAGE_KEY,
} from '@/lib/config/plugins';
import { revivePlugin, serializePlugin, isAllowedCatalogPlugin } from '@/lib/tools/plugins/pluginUtils';

function defaultServer() {
  return {
    software: 'paper',
    plugins: [],
  };
}

function reviveStore(data) {
  const servers = {};
  Object.entries(data.servers ?? {}).forEach(([name, server]) => {
    servers[name] = {
      software: server.software ?? 'paper',
      plugins: (server.plugins ?? []).map(revivePlugin),
    };
  });
  return {
    servers: Object.keys(servers).length ? servers : PLUGIN_DEFAULTS.servers,
    openServer: data.openServer ?? PLUGIN_DEFAULT_SERVER,
    filter: data.filter ?? 'all',
  };
}

export class PluginsStore {
  constructor(data = PLUGIN_DEFAULTS) {
    const revived = reviveStore(data);
    this.servers = revived.servers;
    this.openServer = revived.openServer;
    this.filter = revived.filter;
  }

  static load(storage) {
    try {
      const raw = storage.getItem(PLUGIN_STORAGE_KEY);
      if (!raw) return new PluginsStore();
      return new PluginsStore(JSON.parse(raw));
    } catch {
      return new PluginsStore();
    }
  }

  save(storage) {
    storage.setItem(PLUGIN_STORAGE_KEY, JSON.stringify(this.snapshot()));
  }

  snapshot() {
    const servers = {};
    Object.entries(this.servers).forEach(([name, server]) => {
      servers[name] = {
        software: server.software,
        plugins: server.plugins.map(serializePlugin),
      };
    });
    return {
      servers,
      openServer: this.openServer,
      filter: this.filter,
    };
  }

  get activeServer() {
    return this.openServer ? this.servers[this.openServer] : undefined;
  }

  get activePlugins() {
    return this.activeServer?.plugins ?? [];
  }

  setSoftware(software) {
    if (!this.activeServer) return;
    this.activeServer.software = software;
  }

  addServer(name) {
    if (this.servers[name]) return false;
    this.servers[name] = defaultServer();
    this.openServer = name;
    return true;
  }

  renameServer(nextName) {
    if (!this.openServer || this.openServer === nextName) return false;
    if (this.servers[nextName]) return false;
    this.servers[nextName] = this.servers[this.openServer];
    delete this.servers[this.openServer];
    this.openServer = nextName;
    return true;
  }

  deleteServer() {
    if (!this.openServer) return;
    delete this.servers[this.openServer];
    const names = Object.keys(this.servers);
    this.openServer = names[0];
  }

  addPlugin(plugin) {
    if (!this.activeServer || !isAllowedCatalogPlugin(plugin)) return false;
    const exists = this.activeServer.plugins.some(
      (item) => item.type === plugin.type && String(item.id) === String(plugin.id),
    );
    if (exists) return false;
    this.activeServer.plugins.push(plugin);
    return true;
  }

  removePlugin(index) {
    if (!this.activeServer) return;
    this.activeServer.plugins.splice(index, 1);
  }

  updatePlugin(index, plugin) {
    if (!this.activeServer || !isAllowedCatalogPlugin(plugin)) return;
    this.activeServer.plugins[index] = plugin;
  }

  importPlugins(plugins) {
    if (!this.activeServer || !Array.isArray(plugins)) return;
    plugins.forEach((plugin) => {
      if (!isAllowedCatalogPlugin(plugin)) return;
      const revived = revivePlugin(plugin);
      const exists = this.activeServer.plugins.some(
        (item) => item.type === revived.type && String(item.id) === String(revived.id),
      );
      if (!exists) this.activeServer.plugins.push(revived);
    });
  }
}
