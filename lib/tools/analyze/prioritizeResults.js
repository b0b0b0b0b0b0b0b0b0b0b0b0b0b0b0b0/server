function isConfigFinding(name) {
  const raw = name.replace(/^[✅❌⚠]\s*/, '').trim();
  return raw.includes('.');
}

export function getFindingPriority(field) {
  const name = field.name ?? '';
  const value = field.value ?? '';

  if (name.includes('Command functions')) return 0;
  if (name.includes('Hot frames')) return 8;
  if (
    value.includes('command functions which are laggy')
    || value.includes('command functions (#tick')
    || value.includes('command functions —')
  ) {
    return 1;
  }
  if (name.includes('Timingcost (URGENT)')) return 5;
  if (name.startsWith('❌ Profiler ·')) return 10;
  if (name.includes('MSPT spikes')) return 20;
  if (/^❌ MSPT/.test(name) || /^⚠ MSPT/.test(name)) return 25;
  if (name.includes('Timingcost')) return 30;
  if (name.includes('Heavy plugins')) return 35;
  if (name.includes('Heap pressure')) return 40;
  if (name.includes('GC pauses')) return 45;
  if (name.includes('Ground items')) return 50;
  if (name.includes('Plugin count')) return 55;
  if (name.includes('thread wait')) return 60;
  if (name.includes('Virtual CPU')) return 70;
  if (name.includes('Threads')) return 75;
  if (name.includes('Low Memory')) return 80;
  if (name.includes('Outdated Flags')) return 210;
  if (name.includes('Outdated')) return 220;
  if (name.includes("Aikar")) return 230;
  if (isConfigFinding(name)) return 200;
  return 100;
}

export function prioritizeAnalyzeResults(results) {
  return [...results].sort((left, right) => {
    const delta = getFindingPriority(left) - getFindingPriority(right);
    if (delta !== 0) return delta;
    return 0;
  });
}
