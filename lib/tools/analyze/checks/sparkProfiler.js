import {
  aggregatePluginSamples,
  fetchSparkFullProfile,
  getServerThreadNodes,
  getThreadBaselineSamples,
  getTickWaitShare,
  getWorstTimeWindow,
} from '@/lib/tools/analyze/sparkFullProfile';

const PLUGIN_SAMPLE_THRESHOLD = 800;
const MAX_PLUGIN_FINDINGS = 3;

function formatMs(value) {
  return Number(value).toFixed(1);
}

export async function analyzeSparkProfiler(id, metadata) {
  const fields = [];
  const mspt = metadata?.platformStatistics?.mspt?.last5m;
  if (!mspt || (mspt.max ?? 0) < 50) return fields;

  let fullProfile;
  try {
    fullProfile = await fetchSparkFullProfile(id);
  }
  catch {
    return fields;
  }

  const worstWindow = getWorstTimeWindow(fullProfile);
  const nodes = getServerThreadNodes(fullProfile);
  if (!worstWindow || nodes.length === 0) return fields;

  const pluginSamples = aggregatePluginSamples(nodes, worstWindow.index)
    .filter((entry) => entry.samples >= PLUGIN_SAMPLE_THRESHOLD)
    .slice(0, MAX_PLUGIN_FINDINGS);

  const baseline = getThreadBaselineSamples(nodes, worstWindow.index);

  for (const plugin of pluginSamples) {
    const share = Math.round((plugin.samples / baseline) * 100);
    fields.push({
      name: `❌ Profiler · ${plugin.name}`,
      value: `${share}% of Server thread samples in the worst 60s window (peak MSPT ${formatMs(worstWindow.msptMax)}ms). Heavy packet listeners or sync handlers — check what this plugin does on the main/Netty path.`,
    });
  }

  const waitShare = getTickWaitShare(nodes, worstWindow.index);
  if (waitShare >= 35 && pluginSamples.length === 0) {
    fields.push({
      name: '⚠ Server thread wait',
      value: `~${waitShare}% of Server thread samples in the worst window are waiting (park/yield), not ticking. Often means the server is idle-waiting or thread scheduling is poor — check host CPU steal and single-thread headroom.`,
    });
  }

  return fields;
}
