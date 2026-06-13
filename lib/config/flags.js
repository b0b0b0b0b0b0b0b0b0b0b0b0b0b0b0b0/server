export const FLAG_ENVIRONMENTS = ['linux', 'windows', 'macos', 'pterodactyl', 'command'];
export const FLAG_SOFTWARE = ['paper', 'purpur', 'velocity', 'waterfall'];
export const FLAG_PROXY_SOFTWARE = ['velocity', 'waterfall'];
export const FLAG_PROXY_MEMORY_MIN_GIB = 0.5;
export const FLAG_PROXY_MEMORY_WARN_GIB = 2;
export const FLAG_PROXY_MEMORY_DOC = 'https://docs.papermc.io/velocity/tuning/#allocate-enough-heap';
export const FLAG_PRESETS_BUKKIT = ['none', 'aikars', 'meowice', 'benchmarked', 'hillttys', 'obyduxs', 'etils'];
export const FLAG_PRESETS_PROXY = ['none', 'proxy'];
export const FLAG_PRESET_LINK_KEYS = ['aikars', 'meowice', 'benchmarked', 'hillttys', 'obyduxs'];

export const FLAG_PRESET_LINKS = {
  aikars: 'https://docs.papermc.io/paper/aikars-flags',
  meowice: 'https://github.com/MeowIce/meowice-flags',
  benchmarked: 'https://github.com/brucethemoose/Minecraft-Performance-Flags-Benchmarks',
  hillttys: 'https://github.com/hilltty/hilltty-flags/blob/main/english-lang.md',
  obyduxs: 'https://github.com/Obydux/Minecraft-GraalVM-Flags',
};

export const FLAG_SCRIPT_META = {
  linux: { filename: 'start.sh', language: 'bash' },
  windows: { filename: 'start.bat', language: 'batch' },
  macos: { filename: 'start.command', language: 'bash' },
  pterodactyl: { filename: 'startup', language: 'java' },
  command: { filename: 'command', language: 'java' },
};

export const FLAG_RESTART = {
  sleepSeconds: 5,
  restartingMessage: 'Restarting in 5 seconds...',
  cancelMessage: 'Press CTRL + C to cancel.',
};

export const FLAG_UTF8_ENCODING = '-Dfile.encoding=UTF-8';
export const FLAG_IGNORE_JAVA_VERSION = '-DPaper.IgnoreJavaVersion=true';

export const FLAG_DEFAULTS = {
  fileName: 'server.jar',
  environment: 'linux',
  software: 'paper',
  memory: 8,
  calculateOverhead: true,
  flagPreset: 'aikars',
  noGui: true,
  utf8Encoding: true,
  ignoreJavaVersion: false,
  useVariables: false,
  autoRestart: false,
  windowsPause: true,
};
