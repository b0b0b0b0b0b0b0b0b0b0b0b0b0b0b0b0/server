export const tools = [
  {
    id: 'flags',
    href: '/tools/flags',
    section: 'serverTools',
    accent: 'orange',
    icon: 'flag',
    titleKey: 'tools.flags.title',
    descriptionKey: 'tools.flags.description',
    homeDescriptionKey: 'tools.flags.homeDescription',
    homeTags: ['Paper', 'Purpur', 'Aikar'],
  },
  {
    id: 'analyze',
    href: '/tools/analyze',
    section: 'serverTools',
    accent: 'yellow',
    icon: 'zap',
    titleKey: 'tools.analyze.title',
    descriptionKey: 'tools.analyze.description',
    homeDescriptionKey: 'tools.analyze.homeDescription',
    homeTags: ['Spark', 'Timings', 'MSPT'],
  },
  {
    id: 'plugins',
    href: '/tools/plugins',
    section: 'serverTools',
    accent: 'violet',
    icon: 'blocks',
    titleKey: 'tools.plugins.title',
    descriptionKey: 'tools.plugins.description',
    homeDescriptionKey: 'tools.plugins.homeDescription',
    homeTags: ['Modrinth', 'Spigot'],
  },
];

export const sections = [
  {
    id: 'serverTools',
    titleKey: 'sections.serverTools.title',
    descriptionKey: 'sections.serverTools.description',
  },
];

export function getToolByPath(pathname) {
  if (!pathname) return null;
  if (pathname.startsWith('/tools/flags')) return tools.find((tool) => tool.id === 'flags') ?? null;
  if (pathname.startsWith('/tools/analyze')) return tools.find((tool) => tool.id === 'analyze') ?? null;
  if (pathname.startsWith('/tools/plugins')) return tools.find((tool) => tool.id === 'plugins') ?? null;
  return null;
}

export function getToolNeighbors(pathname) {
  const current = getToolByPath(pathname);
  if (!current) {
    return { prev: null, next: null, current: null, index: -1 };
  }

  const index = tools.findIndex((tool) => tool.id === current.id);

  return {
    prev: index > 0 ? tools[index - 1] : null,
    next: index < tools.length - 1 ? tools[index + 1] : null,
    current,
    index,
  };
}

export function getPageAmbience(pathname) {
  const tool = getToolByPath(pathname);
  if (tool) return tool.id;
  if (pathname === '/') return 'home';
  return 'default';
}

function getPathOrder(pathname) {
  const tool = getToolByPath(pathname);
  if (tool) return tools.findIndex((item) => item.id === tool.id);
  if (pathname === '/') return -1;
  return 99;
}

export function getTransitionDirection(fromPath, toPath) {
  const fromOrder = getPathOrder(fromPath);
  const toOrder = getPathOrder(toPath);
  if (toOrder > fromOrder) return 'forward';
  if (toOrder < fromOrder) return 'back';
  return 'forward';
}
