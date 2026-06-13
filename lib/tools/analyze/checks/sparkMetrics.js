function mb(bytes) {
  return Math.round(bytes / 1_000_000);
}

const HEAVY_PLUGINS = [
  'FastAsyncWorldEdit',
  'WorldEdit',
  'Citizens',
  'MythicMobs',
  'ModelEngine',
  'ItemsAdder',
  'MagicSpells',
  'LibsDisguises',
  'CoreProtect',
  'HolographicDisplays',
  'DecentHolograms',
];

export function analyzeSparkMetrics(sampler) {
  const fields = [];
  const stats = sampler.metadata?.platformStatistics;
  const system = sampler.metadata?.systemStatistics;
  if (!stats || !system) return fields;

  const players = stats.playerCount ?? 0;
  const tps = stats.tps;
  const mspt = stats.mspt;
  const world = stats.world;
  const heap = stats.memory?.heap;
  const plugins = Object.values(sampler.metadata.sources ?? {});

  if (players > 0 && mspt?.last5m) {
    const p95 = mspt.last5m.percentile95 ?? 0;
    const max = mspt.last5m.max ?? 0;
    if (p95 > 30 || max > 80) {
      fields.push({
        name: '❌ MSPT spikes',
        value: `With ${players} players, MSPT p95 is ${p95.toFixed(1)}ms and max spike is ${max.toFixed(1)}ms. TPS can look fine while players still feel lag.`,
      });
    }
  }

  if (heap?.max > 0 && heap?.used / heap.max > 0.75) {
    fields.push({
      name: '❌ Heap pressure',
      value: `Heap is ${mb(heap.used)}MB / ${mb(heap.max)}MB (${Math.round((heap.used / heap.max) * 100)}%). Consider more RAM or fewer loaded chunks/entities.`,
    });
  }

  const youngGc = stats.gc?.['G1 Young Generation'];
  if (youngGc?.avgTime > 45) {
    fields.push({
      name: '❌ GC pauses',
      value: `G1 young GC averages ${youngGc.avgTime.toFixed(0)}ms. Longer pauses often mean too little RAM or too many allocations.`,
    });
  }

  const itemCount = world?.entityCounts?.item ?? 0;
  if (itemCount >= 40) {
    fields.push({
      name: '❌ Ground items',
      value: `${itemCount} item entities are loaded. Clear ground drops and tune item merge/despawn settings.`,
    });
  }

  const heavy = plugins.filter((plugin) => HEAVY_PLUGINS.includes(plugin.name));
  if (heavy.length >= 3) {
    fields.push({
      name: '❌ Heavy plugins',
      value: `Detected ${heavy.length} performance-heavy plugins: ${heavy.map((plugin) => plugin.name).join(', ')}. This stack is a common TPS killer even with good configs.`,
    });
  }
  else if (plugins.length >= 50) {
    fields.push({
      name: '❌ Plugin count',
      value: `${plugins.length} plugins loaded. Large plugin counts increase tick work and update surface.`,
    });
  }

  const cpuModel = system.cpu?.modelName ?? '';
  if (system.cpu?.threads <= 2 && /qemu|virtual/i.test(cpuModel)) {
    fields.push({
      name: '❌ Virtual CPU',
      value: `CPU is ${cpuModel || 'virtual'} with ${system.cpu.threads} thread(s). Minecraft wants fast single-thread performance, not a cheap VPS.`,
      buttons: [{ text: 'Find a better host', url: 'https://modrinth.black' }],
    });
  }

  if (players > 0 && tps) {
    const avgTps = Math.min((tps.last1m + tps.last5m + tps.last15m) / 3, 20);
    if (avgTps >= 19.8 && mspt?.last5m?.percentile95 <= 25 && fields.length === 0) {
      fields.push({
        name: '✅ Tick health',
        value: `Average TPS is ${avgTps.toFixed(1)} with ${players} players. No obvious tick issues in this profile.`,
      });
    }
  }

  return fields;
}
