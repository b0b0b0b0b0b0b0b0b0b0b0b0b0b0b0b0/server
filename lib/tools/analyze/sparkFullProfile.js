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
  for (const node of nodes) {
    const sampleTime = node.times?.[windowIndex] ?? 0;
    if (sampleTime <= 0) continue;
    const pluginName = resolvePluginName(node.className);
    if (!pluginName) continue;
    totals.set(pluginName, (totals.get(pluginName) ?? 0) + sampleTime);
  }
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
  for (const node of nodes) {
    const sampleTime = node.times?.[windowIndex] ?? 0;
    if (sampleTime <= 0) continue;
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
  }
  if (totalSamples <= 0) return 0;
  return Math.round((waitSamples / totalSamples) * 100);
}
