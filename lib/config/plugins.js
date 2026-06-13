export const PLUGIN_STORAGE_KEY = 'plugins';

export const PLUGIN_DEFAULT_SERVER = 'My Server';

export const PLUGIN_SOFTWARE = [
  'paper',
  'purpur',
  'velocity',
  'waterfall',
  'spigot',
  'forge',
  'fabric',
];

export const PLUGIN_SOURCES = ['modrinth', 'spigot'];

export const PLUGIN_FILTERS = ['all', 'outdated', 'modrinth', 'spigot'];

export const PLUGIN_URL_REGEX = {
  modrinth: /modrinth\.(?:com|black)\/plugin\/([^/?#]+)/i,
  spigot: /spigotmc\.org\/resources\/([^./]+)\.(\d+)/i,
};

export const PLUGIN_SPIGOT_DOWNLOAD_LIMIT = 10;

export const PLUGIN_SPIGOT_DOWNLOAD_WINDOW_MS = 60_000;

export const PLUGIN_DEFAULTS = {
  servers: {
    [PLUGIN_DEFAULT_SERVER]: {
      software: 'paper',
      plugins: [],
    },
  },
  openServer: PLUGIN_DEFAULT_SERVER,
  filter: 'all',
};
