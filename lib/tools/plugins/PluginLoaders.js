export function getPluginLoaders(software) {
  switch (software) {
    case 'purpur':
      return ['purpur', 'paper', 'spigot', 'bukkit'];
    case 'paper':
      return ['paper', 'spigot', 'bukkit'];
    case 'spigot':
      return ['spigot', 'bukkit'];
    case 'bukkit':
      return ['bukkit'];
    default:
      return [software];
  }
}

export function getModrinthVersionLoaders(software) {
  const loaders = getPluginLoaders(software);
  if (software === 'spigot' || software === 'bukkit') {
    return [...new Set([...loaders, 'paper', 'purpur'])];
  }
  return loaders;
}
