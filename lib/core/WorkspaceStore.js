import { FLAG_DEFAULTS } from '@/lib/config/flags';
import { PLUGIN_STORAGE_KEY } from '@/lib/config/plugins';
import {
  WORKSPACE_DEFAULTS,
  WORKSPACE_LEGACY_KEYS,
  WORKSPACE_STORAGE_KEY,
  WORKSPACE_VERSION,
  createEmptyServer,
  generateServerId,
} from '@/lib/config/workspace';
import { revivePlugin, serializePlugin, isAllowedCatalogPlugin } from '@/lib/tools/plugins/pluginUtils';
import {
  sanitizeScriptBasename,
  scriptExtensionKey,
} from '@/lib/tools/flags/scriptFilename';

const FALLBACK_DEFAULT_SERVER_NAME = 'My Server';

function reviveAnalysis(entry) {
  return {
    id: entry.id,
    link: entry.link ?? '',
    kind: entry.kind ?? 'unknown',
    savedAt: entry.savedAt ?? new Date().toISOString(),
  };
}

function reviveServer(entry) {
  const flags = { ...FLAG_DEFAULTS, ...(entry.flags ?? {}) };
  if (entry.flags?.scriptBasenames) {
    flags.scriptBasenames = { ...entry.flags.scriptBasenames };
  }
  return {
    id: entry.id,
    name: entry.name ?? 'Server',
    createdAt: entry.createdAt ?? new Date().toISOString(),
    flags,
    plugins: {
      software: entry.plugins?.software ?? 'paper',
      list: (entry.plugins?.list ?? entry.plugins?.plugins ?? []).map(revivePlugin),
    },
    analyses: (entry.analyses ?? []).map(reviveAnalysis),
  };
}

function readJson(storage, key, fallback = null) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function migrateLegacy(storage) {
  const servers = {};
  let activeServerId = null;
  let pluginsFilter = 'all';

  const pluginsRaw = readJson(storage, PLUGIN_STORAGE_KEY);
  const flagsRaw = readJson(storage, WORKSPACE_LEGACY_KEYS.flags, {});

  if (pluginsRaw?.servers && typeof pluginsRaw.servers === 'object') {
    pluginsFilter = pluginsRaw.filter ?? 'all';
    const entries = Object.entries(pluginsRaw.servers);

    entries.forEach(([name, server], index) => {
      const id = generateServerId();
      servers[id] = createEmptyServer(id, name);
      servers[id].plugins = {
        software: server.software ?? 'paper',
        list: (server.plugins ?? []).map(revivePlugin),
      };
      if (index === 0) {
        servers[id].flags = { ...FLAG_DEFAULTS, ...flagsRaw };
      }
      if (pluginsRaw.openServer === name) {
        activeServerId = id;
      }
    });
  }

  if (!Object.keys(servers).length) {
    const id = generateServerId();
    servers[id] = createEmptyServer(id, FALLBACK_DEFAULT_SERVER_NAME);
    servers[id].flags = { ...FLAG_DEFAULTS, ...flagsRaw };
    activeServerId = id;
  }

  if (!activeServerId) {
    activeServerId = Object.keys(servers)[0];
  }

  return {
    version: WORKSPACE_VERSION,
    activeServerId,
    pluginsFilter,
    scriptBasenames: {},
    servers,
  };
}

export class WorkspaceStore {
  constructor(data = WORKSPACE_DEFAULTS) {
    this.version = data.version ?? WORKSPACE_VERSION;
    this.activeServerId = data.activeServerId ?? null;
    this.pluginsFilter = data.pluginsFilter ?? 'all';
    this.scriptBasenames = { ...(data.scriptBasenames ?? {}) };
    this.servers = {};
    Object.entries(data.servers ?? {}).forEach(([id, server]) => {
      this.servers[id] = reviveServer({ ...server, id: server.id ?? id });
    });
    this.ensureActiveServer();
  }

  static load(storage) {
    const saved = readJson(storage, WORKSPACE_STORAGE_KEY);
    if (saved?.servers && Object.keys(saved.servers).length) {
      return new WorkspaceStore(saved);
    }
    return new WorkspaceStore(migrateLegacy(storage));
  }

  save(storage) {
    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(this.snapshot()));
  }

  clone() {
    return new WorkspaceStore(this.snapshot());
  }

  snapshot() {
    const servers = {};
    Object.entries(this.servers).forEach(([id, server]) => {
      servers[id] = {
        id: server.id,
        name: server.name,
        createdAt: server.createdAt,
        flags: { ...server.flags },
        plugins: {
          software: server.plugins.software,
          list: server.plugins.list.map(serializePlugin),
        },
        analyses: server.analyses.map((entry) => ({ ...entry })),
      };
    });
    return {
      version: this.version,
      activeServerId: this.activeServerId,
      pluginsFilter: this.pluginsFilter,
      scriptBasenames: { ...this.scriptBasenames },
      servers,
    };
  }

  ensureActiveServer() {
    if (this.activeServerId && this.servers[this.activeServerId]) return;
    const ids = Object.keys(this.servers);
    if (ids.length) {
      this.activeServerId = ids[0];
      return;
    }
    const id = generateServerId();
    this.servers[id] = createEmptyServer(id, FALLBACK_DEFAULT_SERVER_NAME);
    this.activeServerId = id;
  }

  get serverList() {
    return Object.values(this.servers)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((server) => ({ id: server.id, name: server.name }));
  }

  get activeServer() {
    this.ensureActiveServer();
    return this.servers[this.activeServerId];
  }

  setActiveServer(id) {
    if (!this.servers[id]) return false;
    this.activeServerId = id;
    return true;
  }

  addServer(name) {
    const id = generateServerId();
    const server = createEmptyServer(id, name);
    if (Object.keys(this.scriptBasenames).length) {
      server.flags.scriptBasenames = { ...this.scriptBasenames };
    }
    this.servers[id] = server;
    this.activeServerId = id;
    return id;
  }

  renameServer(id, name) {
    const server = this.servers[id];
    if (!server || !name?.trim()) return false;
    server.name = name.trim();
    return true;
  }

  deleteServer(id) {
    if (!this.servers[id]) return false;
    delete this.servers[id];
    const ids = Object.keys(this.servers);
    if (!ids.length) {
      this.addServer(FALLBACK_DEFAULT_SERVER_NAME);
      return true;
    }
    if (this.activeServerId === id) {
      this.activeServerId = ids[0];
    }
    return true;
  }

  getFlags(serverId = this.activeServerId) {
    return { ...FLAG_DEFAULTS, ...(this.servers[serverId]?.flags ?? {}) };
  }

  setFlags(serverId, flags) {
    const server = this.servers[serverId];
    if (!server) return;
    const preserved = server.flags?.scriptBasenames;
    server.flags = { ...FLAG_DEFAULTS, ...flags };
    if (preserved) {
      server.flags.scriptBasenames = preserved;
    }
  }

  setScriptBasename(serverId, environment, basename) {
    const server = this.servers[serverId];
    if (!server) return;
    const key = scriptExtensionKey(environment);
    const clean = sanitizeScriptBasename(basename, environment);
    this.scriptBasenames[key] = clean;
    if (!server.flags.scriptBasenames) {
      server.flags.scriptBasenames = {};
    }
    server.flags.scriptBasenames[key] = clean;
  }

  getPluginSoftware(serverId = this.activeServerId) {
    return this.servers[serverId]?.plugins.software ?? 'paper';
  }

  setPluginSoftware(software, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server) return;
    server.plugins.software = software;
  }

  getPluginList(serverId = this.activeServerId) {
    return this.servers[serverId]?.plugins.list ?? [];
  }

  addPlugin(plugin, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server || !isAllowedCatalogPlugin(plugin)) return false;
    const exists = server.plugins.list.some(
      (item) => item.type === plugin.type && String(item.id) === String(plugin.id),
    );
    if (exists) return false;
    server.plugins.list.push(plugin);
    return true;
  }

  removePlugin(index, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server) return;
    server.plugins.list.splice(index, 1);
  }

  clearPlugins(serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server) return;
    server.plugins.list = [];
  }

  updatePlugin(index, plugin, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server || !isAllowedCatalogPlugin(plugin)) return;
    server.plugins.list[index] = plugin;
  }

  importPlugins(plugins, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server || !Array.isArray(plugins)) return;
    plugins.forEach((plugin) => {
      if (!isAllowedCatalogPlugin(plugin)) return;
      const revived = revivePlugin(plugin);
      const exists = server.plugins.list.some(
        (item) => item.type === revived.type && String(item.id) === String(revived.id),
      );
      if (!exists) server.plugins.list.push(revived);
    });
  }

  saveAnalysis(entry, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server || !entry?.id) return;
    const normalized = reviveAnalysis({
      ...entry,
      savedAt: entry.savedAt ?? new Date().toISOString(),
    });
    const index = server.analyses.findIndex((item) => item.id === normalized.id);
    if (index >= 0) {
      server.analyses[index] = normalized;
    } else {
      server.analyses.unshift(normalized);
    }
    server.analyses = server.analyses.slice(0, 24);
  }

  getAnalyses(serverId = this.activeServerId) {
    return [...(this.servers[serverId]?.analyses ?? [])];
  }

  removeAnalysis(analysisId, serverId = this.activeServerId) {
    const server = this.servers[serverId];
    if (!server) return;
    server.analyses = server.analyses.filter((item) => item.id !== analysisId);
  }
}
