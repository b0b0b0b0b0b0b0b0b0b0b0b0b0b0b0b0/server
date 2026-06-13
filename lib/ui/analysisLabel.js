export function detectAnalysisKind(link = '', id = '') {
  const source = `${link} ${id}`.toLowerCase();
  if (source.includes('timin')) return 'timings';
  if (source.includes('spark')) return 'spark';
  return 'profile';
}

export function formatAnalysisLabel(entry, locale = 'en') {
  const date = entry.savedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.savedAt))
    : '';
  const kind = entry.kind === 'timings' ? 'Timings' : 'Spark';
  const shortId = entry.id.length > 10 ? `${entry.id.slice(0, 8)}…` : entry.id;
  return date ? `${kind} · ${shortId} · ${date}` : `${kind} · ${shortId}`;
}
