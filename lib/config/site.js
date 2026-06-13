export const SITE_ORIGIN = 'https://server.modrinth.black';
export const SITE_PARENT_ORIGIN = 'https://modrinth.black';
export const SITE_NAME = 'MTools';
export const SITE_ABBREV = 'MST';
export const SITE_PARENT_NAME = 'modrinth.black';

export const SITE_KEYWORDS = [
  'mtools',
  'mst',
  'minecraft server tools',
  'minecraft flags generator',
  'aikar flags',
  'jvm flags minecraft',
  'paper server flags',
  'purpur flags',
  'velocity proxy flags',
  'minecraft startup script',
  'minecraft ram overhead',
  'minecraft server optimization',
  'modrinth.black',
];

export const SITE_ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/tools/flags', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/tools/analyze', changeFrequency: 'weekly', priority: 0.88 },
  { path: '/tools/plugins', changeFrequency: 'weekly', priority: 0.85 },
];
