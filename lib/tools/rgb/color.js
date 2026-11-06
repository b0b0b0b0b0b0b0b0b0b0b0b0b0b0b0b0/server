import { RGB_CONTRAST_DARK, RGB_CONTRAST_LIGHT } from '@/lib/config/rgb';

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHex(value) {
  const raw = String(value ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return raw.split('').map((ch) => ch + ch).join('').toUpperCase();
  }
  return null;
}

export function hexToRgb(hex) {
  const normalized = normalizeHex(hex);
  if (!normalized) return { r: 255, g: 255, b: 255 };
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const part = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

export function lerpRgb(a, b, t) {
  const ratio = clamp(t, 0, 1);
  return {
    r: a.r + (b.r - a.r) * ratio,
    g: a.g + (b.g - a.g) * ratio,
    b: a.b + (b.b - a.b) * ratio,
  };
}

export function darkenHex(hex, amount = 0.28) {
  const rgb = hexToRgb(hex);
  const factor = 1 - amount;
  return rgbToHex({
    r: rgb.r * factor,
    g: rgb.g * factor,
    b: rgb.b * factor,
  });
}

export function contrastTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? RGB_CONTRAST_DARK : RGB_CONTRAST_LIGHT;
}
