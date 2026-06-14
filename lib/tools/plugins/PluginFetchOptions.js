export function normalizePluginFetchOptions(softwareOrOptions, gameVersion) {
  if (softwareOrOptions && typeof softwareOrOptions === 'object') {
    return {
      software: softwareOrOptions.software ?? 'paper',
      gameVersion: softwareOrOptions.gameVersion ?? undefined,
      allVersions: Boolean(softwareOrOptions.allVersions),
    };
  }
  return {
    software: softwareOrOptions ?? 'paper',
    gameVersion: gameVersion ?? undefined,
    allVersions: false,
  };
}
