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
