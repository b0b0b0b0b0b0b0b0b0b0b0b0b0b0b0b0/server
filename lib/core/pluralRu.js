export function pluralRu(count, forms) {
  const abs = Math.abs(count) % 100;
  const mod = abs % 10;
  if (abs > 10 && abs < 20) return forms.many;
  if (mod > 1 && mod < 5) return forms.few;
  if (mod === 1) return forms.one;
  return forms.many;
}
