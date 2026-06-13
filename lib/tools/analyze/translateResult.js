const TITLE_KEYS = {
  '❌ Outdated': 'outdated',
  "❌ Aikar's Flags": 'aikarsFlags',
  '❌ Threads': 'threads',
  '❌ Low Memory': 'lowMemory',
  '❌ Outdated Flags': 'outdatedFlags',
  '❌ Timingcost': 'timingcost',
  '❌ Timingcost (URGENT)': 'timingcostUrgent',
  '❌ Processing Error': 'processingError',
  '❌ maxEntityCramming': 'maxEntityCramming',
  '✅ All good': 'allGood',
  '✅ Tick health': 'tickHealth',
  '❌ MSPT spikes': 'msptSpikes',
  '❌ MSPT': 'mspt',
  '⚠ MSPT': 'mspt',
  '✅ MSPT': 'mspt',
  '❌ Heap pressure': 'heapPressure',
  '❌ GC pauses': 'gcPauses',
  '❌ Ground items': 'groundItems',
  '❌ Heavy plugins': 'heavyPlugins',
  '❌ Plugin count': 'pluginCount',
  '❌ Virtual CPU': 'virtualCpu',
  '❌ MSPT': 'mspt',
  '⚠ MSPT': 'mspt',
  '✅ MSPT': 'mspt',
  '❌ Profiler': 'profiler',
  '⚠ Server thread wait': 'threadWait',
};

const BUTTON_KEYS = {
  'Learn More': 'learnMore',
  "Update Aikar's Flags": 'updateAikarsFlags',
  "Use Aikar's Flags": 'useAikarsFlags',
};

const MESSAGE_KEYS = {
  'Add `-XX:+PerfDisableSharedMem` to flags.': 'addPerfDisableSharedMem',
  'Add `XX:G1MixedGCCountTarget=4` to flags.': 'addG1MixedGCCountTarget',
  "Aikar's Flags add some optimizations to the java garbage collector.": 'aikarsIntro',
  'Allocate at least 6-10GB of ram to your server if you can afford it.': 'allocateMoreRam',
  'Analyzed with no recommendations.': 'noRecommendations',
  'Disable this in purpur.yml. It can cause issues with TCPShield': 'disablePurpurTcpShield',
  'FAWE has been known to cause issues.\nConsider replacing FAWE with Worldedit.': 'faweIssues',
  'GroupManager is an outdated permission plugin.\nConsider replacing it with a better plugin.': 'groupManagerOutdated',
  'LagAssist should only be used for analytics and preventative measures.\nAll other features of the plugin should be disabled.': 'lagAssistLimited',
  'LimitPillagers is not useful in 1.15 and above.': 'limitPillagersObsolete',
  'Mirai is prone to bugs and corruption (AKA Yatopia 2.0).\nFind a better server fork.': 'miraiBadFork',
  'PermissionsEx is an outdated permission plugin.\nConsider replacing it with a better plugin.': 'permissionsExOutdated',
  'Plugins that claim to remove lag actually cause more lag.': 'antiLagPlugins',
  'Stacking mobs causes more lag.': 'stackingMobs',
  'Stacking plugins actually causes more lag.\nRemove UltimateStacker.': 'removeUltimateStacker',
  'This datapack uses command functions which are laggy.': 'datapackFunctions',
  'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative such as [HeadsPlus](https://spigotmc.org/resources/headsplus-»-1-8-1-16-4.40265/) or [HeadDatabase](https://www.spigotmc.org/resources/head-database.14280/).': 'songodaPluginMarkdown',
  'This plugin was made by Songoda. Songoda is sketchy. You should find an alternative.': 'songodaPlugin',
  'VillagerOptimiser is not useful in 1.15 and above.': 'villagerOptimiserObsolete',
  'Yatopia is prone to bugs and is no longer in development.\nFind a better server fork.': 'yatopiaBadFork',
  "You don't need BookLimiter as Paper already fixes all crash bugs.": 'bookLimiterUnneeded',
  "You don't need EntityTrackerFixer as Paper already has its features.": 'entityTrackerFixerUnneeded',
  "You don't need Orebfuscator as Paper already has its features.": 'orebfuscatorUnneeded',
  "You don't need PacketLimiter as Paper already has its features.": 'packetLimiterUnneeded',
  "You must use G1GC when using Aikar's flags.": 'requireG1gc',
  "You probably don't need ExploitFixer as Paper already fixes all dupe and crash bugs.": 'exploitFixerUnneeded',
  "You probably don't need IllegalStack as Paper already fixes all dupe and crash bugs.": 'illegalStackUnneeded',
  "You probably don't need MineableSpawners as Purpur already has its features.": 'mineableSpawnersUnneeded',
  "You probably don't need PhantomSMP as Paper already has its features.": 'phantomSmpUnneeded',
  "You probably don't need PhantomSMP as Paper already has its features.\nEnable phantoms-only-attack-insomniacs in paper.yml.": 'phantomSmpPaperSetting',
  "You probably don't need SilkSpawners as Purpur already has its features.": 'silkSpawnersUnneeded',
  "You probably don't need VillagerLobotomizatornator as Purpur already adds its features.\nEnable villager.lobotomize.enabled in purpur.yml.": 'villagerLobotomizerPurpur',
  'You should be using more RAM with this many players.': 'moreRamForPlayers',
  "Your Xmx and Xms values should be equal when using Aikar's flags.": 'aikarsEqualHeap',
  'Your flags are outdated.': 'flagsOutdated',
  'ZGC is only good with a lot of memory.': 'zgcNeedsMemory',
  'bPermissions is an outdated permission plugin.\nConsider replacing it with a better plugin.': 'bPermissionsOutdated',
};

const VALUE_PATTERNS = [
  {
    re: /^You are using `(.+)`\. Update to `(.+)`\.$/,
    key: 'outdatedVersion',
    params: (match) => ({ current: match[1], latest: match[2] }),
  },
  {
    re: /^You only have (\d+) thread\(s\)\.(?: Look for better hosting\.)?$/,
    key: 'threadCount',
    params: (match) => ({ count: match[1] }),
  },
  {
    re: /^Your timingcost is (\d+)\. Your cpu is overloaded and\/or slow\.(?: Look for better hosting\.)?$/,
    key: 'timingcost',
    params: (match) => ({ cost: match[1] }),
  },
  {
    re: /^Your timingcost is (\d+)\. This value would be at most 200 on a reasonable server\. Your cpu is critically overloaded and\/or slow\. Hiding (\d+) comparitively negligible suggestions until you resolve this fundamental problem\.(?: Look for better hosting\.)?$/,
    key: 'timingcostUrgent',
    params: (match) => ({ cost: match[1], hidden: match[2] }),
  },
  {
    re: /^min ([\d.]+) · med ([\d.]+) · p95 ([\d.]+) · max ([\d.]+)ms(?: \((\d+) players\))?\. Values above 50ms are feelable; TPS can still show 20\.$/,
    key: 'msptOverview',
    params: (match) => ({
      min: match[1],
      med: match[2],
      p95: match[3],
      max: match[4],
      players: match[5] ? ` (${match[5]} players)` : '',
    }),
  },
  {
    re: /^Peak tick took ([\d.]+)ms with p95 at ([\d.]+)ms\. Players feel micro-freezes even when average TPS looks fine\.$/,
    key: 'msptSpikesDetail',
    params: (match) => ({ max: match[1], p95: match[2] }),
  },
  {
    re: /^(\d+)% of Server thread samples in the worst 60s window \(peak MSPT ([\d.]+)ms\)\. Heavy packet listeners or sync handlers — check what this plugin does on the main\/Netty path\.$/,
    key: 'profilerPlugin',
    params: (match) => ({ share: match[1], mspt: match[2] }),
  },
  {
    re: /^~(\d+)% of Server thread samples in the worst window are waiting \(park\/yield\), not ticking\. Often means the server is idle-waiting or thread scheduling is poor — check host CPU steal and single-thread headroom\.$/,
    key: 'threadWait',
    params: (match) => ({ share: match[1] }),
  },
  {
    re: /^With (\d+) players, MSPT p95 is ([\d.]+)ms and max spike is ([\d.]+)ms\. TPS can look fine while players still feel lag\.$/,
    key: 'msptSpikes',
    params: (match) => ({ players: match[1], p95: match[2], max: match[3] }),
  },
  {
    re: /^Heap is (\d+)MB \/ (\d+)MB \((\d+)%\)\. Consider more RAM or fewer loaded chunks\/entities\.$/,
    key: 'heapPressure',
    params: (match) => ({ used: match[1], max: match[2], percent: match[3] }),
  },
  {
    re: /^G1 young GC averages (\d+)ms\. Longer pauses often mean too little RAM or too many allocations\.$/,
    key: 'gcPauses',
    params: (match) => ({ ms: match[1] }),
  },
  {
    re: /^(\d+) item entities are loaded\. Clear ground drops and tune item merge\/despawn settings\.$/,
    key: 'groundItems',
    params: (match) => ({ count: match[1] }),
  },
  {
    re: /^Detected (\d+) performance-heavy plugins: (.+)\. This stack is a common TPS killer even with good configs\.$/,
    key: 'heavyPlugins',
    params: (match) => ({ count: match[1], plugins: match[2] }),
  },
  {
    re: /^(\d+) plugins loaded\. Large plugin counts increase tick work and update surface\.$/,
    key: 'pluginCount',
    params: (match) => ({ count: match[1] }),
  },
  {
    re: /^CPU is (.+) with (\d+) thread\(s\)\. Minecraft wants fast single-thread performance, not a cheap VPS\.(?: Look for better hosting\.)?$/,
    key: 'virtualCpu',
    params: (match) => ({ model: match[1], threads: match[2] }),
  },
  {
    re: /^Average TPS is ([\d.]+) with (\d+) players\. No obvious tick issues in this profile\.$/,
    key: 'tickHealth',
    params: (match) => ({ tps: match[1], players: match[2] }),
  },
  {
    re: /^Decrease this in (.+?)\.\nRecommended: (.+)\.$/,
    key: 'decreaseRecommended',
    params: (match) => ({ file: match[1], value: match[2] }),
  },
  {
    re: /^Increase this in (.+?)\.\nRecommended: (.+)\.$/,
    key: 'increaseRecommended',
    params: (match) => ({ file: match[1], value: match[2] }),
  },
  {
    re: /^Set a value in (.+?)\.\nRecommended: (.+)$/,
    key: 'setRecommended',
    params: (match) => ({ file: match[1], value: match[2] }),
  },
  {
    re: /^Decrease this by running the \/gamerule command in each world\.\nRecommended: (.+)\.$/,
    key: 'gameruleDecrease',
    params: (match) => ({ value: match[1] }),
  },
  {
    re: /^Set this to "ALTERNATE_CURRENT" in (.+?)\.$/,
    key: 'setAlternateCurrent',
    params: (match) => ({ file: match[1] }),
  },
  {
    re: /^Enable this in (.+?)\.$/,
    key: 'enableIn',
    params: (match) => ({ file: match[1] }),
  },
  {
    re: /^Enable this in (.+?)$/,
    key: 'enableIn',
    params: (match) => ({ file: match[1] }),
  },
  {
    re: /^Disable this in (.+?)\.$/,
    key: 'disableIn',
    params: (match) => ({ file: match[1] }),
  },
];

function translateKey(t, base, key, params = {}) {
  return t(`${base}.${key}`, params);
}

function translateConfigPathName(name, t) {
  const match = name.match(/^(✅|❌|⚠)\s*(.+)$/);
  if (!match) return name;
  const translated = match[2].split('.').map((segment) => {
    const label = t(`tools.analyze.results.paths.${segment}`);
    return label.startsWith('tools.analyze.results.paths.') ? segment : label;
  });
  return `${match[1]} ${translated.join('.')}`;
}

function translateName(name, t) {
  const titleKey = TITLE_KEYS[name];
  if (titleKey) {
    return translateKey(t, 'tools.analyze.results.titles', titleKey);
  }
  const profilerMatch = name.match(/^❌ Profiler · (.+)$/);
  if (profilerMatch) {
    return `${translateKey(t, 'tools.analyze.results.titles', 'profiler')} · ${profilerMatch[1]}`;
  }
  if (/^(✅|❌|⚠)\s*.+\..+$/.test(name)) {
    return translateConfigPathName(name, t);
  }
  return name;
}

function translateValue(value, t) {
  for (const pattern of VALUE_PATTERNS) {
    const match = value.match(pattern.re);
    if (match) {
      return translateKey(t, 'tools.analyze.results.patterns', pattern.key, pattern.params(match));
    }
  }
  const messageKey = MESSAGE_KEYS[value];
  if (messageKey) {
    return translateKey(t, 'tools.analyze.results.messages', messageKey);
  }
  if (value.startsWith('MTools cannot process') || value.startsWith('MTools is unable to process')) {
    return value;
  }
  return value;
}

function translateButton(text, t) {
  const buttonKey = BUTTON_KEYS[text];
  if (buttonKey) {
    return translateKey(t, 'tools.analyze.results.buttons', buttonKey);
  }
  return text;
}

export function translateAnalyzeResults(results, t) {
  return results.map((field) => ({
    ...field,
    name: translateName(field.name, t),
    value: translateValue(field.value, t),
    buttons: field.buttons
      ?.filter((button) => button.text !== 'Find a better host' && button.url !== 'https://modrinth.black')
      ?.map((button) => ({
      ...button,
      text: translateButton(button.text, t),
    })),
  }));
}
