import {

  aggregateActionableFrames,

  aggregateDatapackFunctionSamples,

  aggregatePluginSamples,

  fetchSparkFullProfile,

  formatActionableFrameList,

  getServerThreadNodes,

  getThreadBaselineSamples,

  getTickWaitShare,

  getWorstTimeWindow,

} from '@/lib/tools/analyze/sparkFullProfile';



const PLUGIN_SAMPLE_THRESHOLD = 800;

const MAX_PLUGIN_FINDINGS = 3;

const DATAPACK_SAMPLE_THRESHOLD = 1500;

const DATAPACK_BASELINE_RATIO = 0.1;



function formatMs(value) {

  return Number(value).toFixed(1);

}



function formatPluginShare(samples, baseline) {

  const share = Math.round((samples / baseline) * 100);

  return Math.min(Math.max(share, 1), 99);

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



  const baseline = getThreadBaselineSamples(nodes, worstWindow.index);

  const peakMspt = formatMs(worstWindow.msptMax);



  const datapackSamples = aggregateDatapackFunctionSamples(nodes, worstWindow.index);

  if (

    datapackSamples >= DATAPACK_SAMPLE_THRESHOLD

    && datapackSamples / baseline >= DATAPACK_BASELINE_RATIO

  ) {

    fields.push({

      name: '❌ Profiler · Command functions',

      value: `Peak MSPT ${peakMspt}ms in the worst 60s window. Datapack command functions (#tick / execute) dominate this profile — remove or simplify functions tagged #tick in your datapacks.`,

    });

  }



  const pluginSamples = aggregatePluginSamples(nodes, worstWindow.index)

    .filter((entry) => entry.samples >= PLUGIN_SAMPLE_THRESHOLD)

    .slice(0, MAX_PLUGIN_FINDINGS);



  for (const plugin of pluginSamples) {

    const share = formatPluginShare(plugin.samples, baseline);

    fields.push({

      name: `❌ Profiler · ${plugin.name}`,

      value: `Peak MSPT ${peakMspt}ms in the worst 60s window. ~${share}% of sampled tick time points at ${plugin.name} — check packet listeners and sync work on the main thread.`,

    });

  }



  const datapackDetected = datapackSamples >= DATAPACK_SAMPLE_THRESHOLD

    && datapackSamples / baseline >= DATAPACK_BASELINE_RATIO;



  if (!datapackDetected && pluginSamples.length === 0) {

    const actionable = aggregateActionableFrames(nodes, worstWindow.index);

    if (actionable.length > 0) {

      fields.push({

        name: '❌ Profiler · Hot frames',

        value: `Peak MSPT ${peakMspt}ms in the worst 60s window. In Spark, expand Server thread → Thread.run(). Main consumers here: ${formatActionableFrameList(actionable)}.`,

      });

    }

  }



  const waitShare = getTickWaitShare(nodes, worstWindow.index);

  if (waitShare >= 35 && pluginSamples.length === 0 && !datapackDetected) {

    fields.push({

      name: '⚠ Server thread wait',

      value: `~${waitShare}% of Server thread samples in the worst window are waiting (park/yield), not ticking. Often means the server is idle-waiting or thread scheduling is poor — check host CPU steal and single-thread headroom.`,

    });

  }



  return fields;

}


