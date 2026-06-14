function isConfigFinding(name) {
  const raw = name.replace(/^[✅❌⚠]\s*/, '').trim();
  return raw.includes('.');
}

export function classifyFindingSeverity(field) {
  const name = field.name ?? '';
  const value = field.value ?? '';

  if (name.startsWith('✅')) return 'ok';
  if (name.startsWith('⚠')) return 'warn';

  if (name.includes('Command functions') || value.includes('command functions (#tick')) {
    return 'issue';
  }
  if (value.includes('command functions which are laggy')) {
    return 'issue';
  }
  if (name.includes('Timingcost (URGENT)')) return 'issue';
  if (name.includes('MSPT spikes')) return 'issue';
  if (name.startsWith('❌ MSPT')) return 'issue';
  if (name.includes('Heavy plugins')) return 'issue';
  if (name.includes('Heap pressure')) return 'issue';
  if (name.includes('GC pauses')) return 'issue';
  if (name.includes('Ground items')) return 'issue';
  if (name.includes('Timingcost')) return 'issue';
  if (name.includes('Processing Error')) return 'issue';
  if (name.includes('Hot frames')) return 'issue';

  if (name.startsWith('❌ Profiler ·')) {
    if (name.includes('Command functions') || name.includes('Hot frames')) return 'issue';
    return 'warn';
  }

  if (isConfigFinding(name)) return 'warn';
  if (name.includes('Plugin count')) return 'warn';
  if (name.includes('Outdated')) return 'warn';
  if (name.includes("Aikar")) return 'warn';
  if (name.includes('Threads')) return 'warn';
  if (name.includes('Virtual CPU')) return 'warn';
  if (name.includes('Low Memory')) return 'warn';
  if (name.includes('thread wait')) return 'warn';

  if (name.startsWith('❌')) return 'issue';
  return 'warn';
}
