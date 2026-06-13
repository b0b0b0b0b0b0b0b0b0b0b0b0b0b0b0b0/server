import { FLAG_SCRIPT_META } from '@/lib/config/flags';

export function scriptExtensionKey(environment) {
  const filename = FLAG_SCRIPT_META[environment]?.filename ?? 'start.sh';
  const dot = filename.lastIndexOf('.');
  if (dot <= 0) return filename;
  return filename.slice(dot);
}

export function defaultScriptBasename(environment) {
  const filename = FLAG_SCRIPT_META[environment]?.filename ?? 'start.sh';
  const key = scriptExtensionKey(environment);
  if (key === filename) return filename;
  return filename.slice(0, filename.length - key.length);
}

export function buildScriptFilename(environment, basename) {
  const key = scriptExtensionKey(environment);
  const base = (basename || defaultScriptBasename(environment)).trim() || defaultScriptBasename(environment);
  if (key === FLAG_SCRIPT_META[environment]?.filename) {
    return base;
  }
  return `${base}${key}`;
}

export function resolveScriptBasename(environment, scriptBasenames = {}) {
  const key = scriptExtensionKey(environment);
  return scriptBasenames[key] ?? defaultScriptBasename(environment);
}

export function resolveScriptFilename(environment, scriptBasenames = {}) {
  return buildScriptFilename(environment, resolveScriptBasename(environment, scriptBasenames));
}

export function sanitizeScriptBasename(value, environment) {
  const cleaned = String(value ?? '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-');
  return cleaned || defaultScriptBasename(environment);
}
