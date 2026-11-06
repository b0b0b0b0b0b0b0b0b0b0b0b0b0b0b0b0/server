import { RGB_DEFAULT_STOPS } from '@/lib/config/rgb';
import { clamp, hexToRgb, lerpRgb, normalizeHex, rgbToHex } from '@/lib/tools/rgb/color';
import { buildOutput } from '@/lib/tools/rgb/formats';

export function sortStops(stops) {
  return [...stops]
    .map((stop, index) => ({
      id: stop.id ?? index,
      hex: normalizeHex(stop.hex) ? `#${normalizeHex(stop.hex)}` : stop.hex,
      position: clamp(Number(stop.position) || 0, 0, 100),
    }))
    .sort((a, b) => a.position - b.position);
}

export function redistributeStops(count, palette = RGB_DEFAULT_STOPS) {
  if (count <= 1) {
    return [{ id: 0, hex: palette[0]?.hex ?? RGB_DEFAULT_STOPS[0].hex, position: 0 }];
  }
  return Array.from({ length: count }, (_, index) => {
    const source = palette[Math.min(index, palette.length - 1)];
    return {
      id: index,
      hex: source.hex,
      position: Math.round((index / (count - 1)) * 100),
    };
  });
}

export function sampleGradientColor(stops, position) {
  const sorted = sortStops(stops);
  if (!sorted.length) return 'FFFFFF';
  if (sorted.length === 1) return normalizeHex(sorted[0].hex) ?? 'FFFFFF';

  const pos = clamp(position, 0, 100);
  let left = sorted[0];
  let right = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
      left = sorted[i];
      right = sorted[i + 1];
      break;
    }
  }

  if (left.position === right.position) {
    return normalizeHex(left.hex) ?? 'FFFFFF';
  }

  const t = (pos - left.position) / (right.position - left.position);
  return rgbToHex(lerpRgb(hexToRgb(left.hex), hexToRgb(right.hex), t));
}

function characterPositions(text, { disperse, charsPerColor }) {
  const chars = [...text];
  if (!chars.length) return [];

  if (disperse) {
    return chars.map((_, index) => (
      chars.length === 1 ? 0 : (index / (chars.length - 1)) * 100
    ));
  }

  const groupSize = clamp(charsPerColor, 1, 2);
  const groupCount = Math.ceil(chars.length / groupSize);
  return chars.map((_, index) => {
    const groupIndex = Math.floor(index / groupSize);
    return groupCount === 1 ? 0 : (groupIndex / (groupCount - 1)) * 100;
  });
}

export function buildGradientSegments(text, options) {
  const {
    stops,
    formats,
    trimSpaces,
    charsPerColor,
    disperse,
  } = options;

  const source = trimSpaces ? text.replace(/ /g, '') : text;
  const positions = characterPositions(source, { disperse, charsPerColor });

  return [...source].map((char, index) => ({
    char,
    hex: sampleGradientColor(stops, positions[index] ?? 0),
    formats,
  }));
}

export function generateRgbOutput(state) {
  const segments = buildGradientSegments(state.text, state);
  return buildOutput({
    formatId: state.formatId,
    segments,
    prefixSuffix: state.prefixSuffix?.trim() ? state.prefixSuffix : '',
    lowercase: state.lowercase,
  });
}
