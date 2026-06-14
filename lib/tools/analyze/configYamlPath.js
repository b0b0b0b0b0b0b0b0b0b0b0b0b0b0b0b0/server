const SPIGOT_WORLD_SETTINGS_FILES = new Set(['spigot.yml', 'purpur.yml']);

export const CONFIG_FILES = {
  BUKKIT: 'bukkit.yml',
  SPIGOT: 'spigot.yml',
  PAPER_WORLD: 'config/paper-world-defaults.yml',
  PAPER_GLOBAL: 'config/paper-global.yml',
  PURPUR: 'purpur.yml',
  SERVER_PROPERTIES: 'server.properties',
};

export function extractRawConfigName(name) {
  return (name ?? '').replace(/^[✅❌⚠]\s*/, '').trim();
}

export function extractConfigFileFromValue(value) {
  if (!value) return null;
  const match = value.match(
    /(?:\bin\b|\bfor\b) ((?:config\/)?[A-Za-z0-9._-]+\.yml|server\.properties)/,
  );
  return match?.[1] ?? null;
}

export function resolveYamlSegments(configKey, configFile) {
  if (!configKey) return [];
  const segments = configKey.split('.');
  if (SPIGOT_WORLD_SETTINGS_FILES.has(configFile)) {
    return ['world-settings', 'default', ...segments];
  }
  return segments;
}

export function formatYamlSnippet(segments, leafValue) {
  if (!segments?.length) return '';
  return segments
    .map((segment, index) => {
      const indent = '  '.repeat(index);
      if (index === segments.length - 1) {
        const valueSuffix =
          leafValue !== undefined && leafValue !== null && String(leafValue).length > 0
            ? ` ${leafValue}`
            : '';
        return `${indent}${segment}:${valueSuffix}`;
      }
      return `${indent}${segment}:`;
    })
    .join('\n');
}

export function buildConfigYamlMessage(field, recommendedValue) {
  const configKey = field?.configKey ?? extractRawConfigName(field?.name ?? '');
  const configFile = field?.configFile ?? extractConfigFileFromValue(field?.value ?? '');
  const segments = resolveYamlSegments(configKey, configFile);
  return formatYamlSnippet(segments, recommendedValue);
}
