import { SPARK_PLUGIN_PACKAGES } from '@/lib/config/sparkPlugins';

const SPARK_FULL_TIMEOUT_MS = 30000;

export async function fetchSparkFullProfile(id) {
  const response = await fetch(`https://spark.lucko.me/${encodeURIComponent(id)}?raw=1&full=true`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(SPARK_FULL_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Spark full profile HTTP ${response.status}`);
  }
  return response.json();
}

export function getMsptWindow(metadata, window = 'last5m') {
  const mspt = metadata?.platformStatistics?.mspt?.[window];
  if (!mspt) return null;
  return {
    min: mspt.min,
    median: mspt.median,
    p95: mspt.percentile95,
    max: mspt.max,
    mean: mspt.mean,
  };
}

export function getTimeWindows(fullProfile) {
  const windows = fullProfile.timeWindows ?? [];
  return windows.map((windowId, index) => ({
    index,
    id: windowId,
    ...(fullProfile.timeWindowStatistics?.[windowId] ?? {}),
  }));
}

export function getWorstTimeWindow(fullProfile) {
  const windows = getTimeWindows(fullProfile);
  if (windows.length === 0) return null;
  return windows.reduce((worst, current) => (
    (current.msptMax ?? 0) > (worst.msptMax ?? 0) ? current : worst
  ));
}

function resolvePluginName(className) {
  if (!className) return null;
  for (const [prefix, pluginName] of Object.entries(SPARK_PLUGIN_PACKAGES)) {
    if (className.startsWith(prefix)) return pluginName;
  }
  return null;
}

export function aggregatePluginSamples(nodes, windowIndex) {
  const totals = new Map();
  walkThreadNodes(nodes, windowIndex, (node, sampleTime) => {
    if (sampleTime <= 0) return;
    const pluginName = resolvePluginName(node.className);
    if (!pluginName) return;
    totals.set(pluginName, (totals.get(pluginName) ?? 0) + sampleTime);
  });
  return [...totals.entries()]
    .map(([name, samples]) => ({ name, samples }))
    .sort((left, right) => right.samples - left.samples);
}

export function getServerThreadNodes(fullProfile) {
  const thread = fullProfile.threads?.find((entry) => (
    entry.name === 'Server thread' || entry.name?.includes('Server')
  )) ?? fullProfile.threads?.[0];
  return thread?.children ?? [];
}

export function walkThreadNodes(nodes, windowIndex, visitor) {
  for (const node of nodes) {
    const sampleTime = node.times?.[windowIndex] ?? 0;
    visitor(node, sampleTime);
    if (node.children?.length) {
      walkThreadNodes(node.children, windowIndex, visitor);
    }
  }
}

const DATAPACK_FUNCTION_METHODS = new Set(['tick', 'execute', 'executeTagFunctions']);

const HOTSPOT_SKIP = [
  (node) => node.className === 'java.lang.Thread' && node.methodName === 'run',
  (node) => node.className === 'native',
  (node) => (node.methodName ?? '') === 'run' && (node.className ?? '').endsWith('Thread'),
  (node) => ['park', 'parkNanos', 'yield', 'sleep', 'wait'].includes(node.methodName ?? ''),
  (node) => (node.className ?? '').includes('LockSupport'),
  (node) => (node.className ?? '').includes('Unsafe'),
  (node) => (node.className ?? '').includes('MinecraftServer'),
  (node) => (node.className ?? '').includes('DedicatedServer'),
  (node) => (node.methodName ?? '').includes('tickServer'),
  (node) => (node.methodName ?? '').includes('runServer'),
  (node) => (node.methodName ?? '').includes('spin'),
  (node) => (node.className ?? '').includes('$$Lambda'),
];

function bucketActionableFrame(node) {
  const className = node.className ?? '';
  const methodName = node.methodName ?? '';

  if (
    className.includes('ServerFunctionManager')
    && DATAPACK_FUNCTION_METHODS.has(methodName)
  ) {
    return 'datapack command functions (#tick / execute)';
  }
  if (className.includes('FunctionCallback')) {
    return 'scheduled command functions';
  }
  if (className.includes('net.minecraft.server.commands.ExecuteCommand')) {
    return 'heavy /execute chains';
  }
  if (className.includes('Commands.executeCommandInContext')) {
    return 'command execution';
  }

  const pluginName = resolvePluginName(className);
  if (pluginName) return pluginName;

  return null;
}

export function aggregateActionableFrames(nodes, windowIndex, options = {}) {
  const limit = options.limit ?? 3;
  const totals = new Map();

  walkThreadNodes(nodes, windowIndex, (node, sampleTime) => {
    if (sampleTime <= 0) return;
    if (HOTSPOT_SKIP.some((skip) => skip(node))) return;
    const label = bucketActionableFrame(node);
    if (!label) return;
    totals.set(label, (totals.get(label) ?? 0) + sampleTime);
  });

  return [...totals.entries()]
    .map(([label, samples]) => ({ label, samples }))
    .sort((left, right) => right.samples - left.samples)
    .slice(0, limit);
}

export function formatActionableFrameList(frames) {
  return frames.map((frame) => frame.label).join(', ');
}

export function aggregateDatapackFunctionSamples(nodes, windowIndex) {
  let samples = 0;
  walkThreadNodes(nodes, windowIndex, (node, sampleTime) => {
    if (sampleTime <= 0) return;
    const className = node.className ?? '';
    const methodName = node.methodName ?? '';
    if (
      className.includes('ServerFunctionManager')
      && DATAPACK_FUNCTION_METHODS.has(methodName)
    ) {
      samples += sampleTime;
      return;
    }
    if (className.includes('FunctionCallback')) {
      samples += sampleTime;
    }
  });
  return samples;
}

export function getThreadBaselineSamples(nodes, windowIndex) {
  let max = 0;
  for (const node of nodes) {
    if (node.className === 'java.lang.Thread' && node.methodName === 'run') {
      max = Math.max(max, node.times?.[windowIndex] ?? 0);
    }
  }
  return max || 1;
}

export function getTickWaitShare(nodes, windowIndex) {
  let waitSamples = 0;
  let totalSamples = 0;
  walkThreadNodes(nodes, windowIndex, (node, sampleTime) => {
    if (sampleTime <= 0) return;
    totalSamples += sampleTime;
    const method = node.methodName ?? '';
    const className = node.className ?? '';
    if (
      method === 'parkNanos'
      || method === 'park'
      || method === 'yield'
      || className.includes('LockSupport')
      || className.includes('Unsafe')
      || className === 'native'
    ) {
      waitSamples += sampleTime;
    }
  });
  if (totalSamples <= 0) return 0;
  return Math.round((waitSamples / totalSamples) * 100);
}
