import { FLAG_DEFAULTS } from '@/lib/config/flags';

export const WORKSPACE_STORAGE_KEY = 'server-tools.workspace';
export const WORKSPACE_VERSION = 1;

export const WORKSPACE_LEGACY_KEYS = {
  plugins: 'plugins',
  flags: 'server-tools.tool.flags',
};

export function generateServerId() {
  return `srv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyServer(id, name) {
  return {
    id,
    name,
    createdAt: new Date().toISOString(),
    flags: { ...FLAG_DEFAULTS },
    plugins: {
      software: 'paper',
      list: [],
    },
    analyses: [],
  };
}

export const WORKSPACE_DEFAULTS = {
  version: WORKSPACE_VERSION,
  activeServerId: null,
  pluginsFilter: 'all',
  scriptBasenames: {},
  servers: {},
};
