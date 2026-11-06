import { clamp, hexToRgb, rgbToHex } from '@/lib/tools/rgb/color';

export function rgbToHsv({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) hue = ((bn - rn) / delta + 2) / 6;
    else hue = ((rn - gn) / delta + 4) / 6;
  }

  const saturation = max === 0 ? 0 : delta / max;
  const value = max;

  return {
    h: hue * 360,
    s: saturation,
    v: value,
  };
}

export function hsvToRgb({ h, s, v }) {
  const hue = ((h % 360) + 360) % 360;
  const chroma = v * s;
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = v - chroma;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (hue < 60) {
    rp = chroma;
    gp = secondary;
  } else if (hue < 120) {
    rp = secondary;
    gp = chroma;
  } else if (hue < 180) {
    gp = chroma;
    bp = secondary;
  } else if (hue < 240) {
    gp = secondary;
    bp = chroma;
  } else if (hue < 300) {
    rp = secondary;
    bp = chroma;
  } else {
    rp = chroma;
    bp = secondary;
  }

  return {
    r: Math.round((rp + match) * 255),
    g: Math.round((gp + match) * 255),
    b: Math.round((bp + match) * 255),
  };
}

export function hsvToHex(hsv) {
  return rgbToHex(hsvToRgb(hsv));
}

export function hexToHsv(hex) {
  return rgbToHsv(hexToRgb(hex));
}

export function clampPopupLeft(percent) {
  return clamp(percent, 8, 92);
}
