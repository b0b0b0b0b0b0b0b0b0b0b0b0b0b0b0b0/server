export function formatGiB(value) {
  return `${Number(value).toFixed(1)} GiB`;
}

export function memoryPercent(value, min, max) {
  return ((Number(value) - min) / (max - min)) * 100;
}
