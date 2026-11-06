import { normalizeHex } from '@/lib/tools/rgb/color';

const FORMAT_CODES = {
  ampersand_hex: {
    prefix: '&',
    bold: '&l',
    italic: '&o',
    underline: '&n',
    strikethrough: '&m',
    obfuscate: '&k',
    color(hex, lowercase) {
      const value = lowercase ? hex.toLowerCase() : hex;
      return `&#${value}`;
    },
  },
  section_hex: {
    prefix: '§',
    bold: '§l',
    italic: '§o',
    underline: '§n',
    strikethrough: '§m',
    obfuscate: '§k',
    color(hex) {
      return `§x${hex.split('').map((ch) => `§${ch.toLowerCase()}`).join('')}`;
    },
  },
  minimessage: {
    prefix: '',
    bold: '<b>',
    boldClose: '</b>',
    italic: '<i>',
    italicClose: '</i>',
    underline: '<u>',
    underlineClose: '</u>',
    strikethrough: '<st>',
    strikethroughClose: '</st>',
    obfuscate: '<obf>',
    obfuscateClose: '</obf>',
    color(hex, lowercase) {
      const value = lowercase ? hex.toLowerCase() : hex;
      return `<#${value}>`;
    },
    wrap(text, formats) {
      let out = text;
      if (formats.obfuscate) out = `<obf>${out}</obf>`;
      if (formats.strikethrough) out = `<st>${out}</st>`;
      if (formats.underline) out = `<u>${out}</u>`;
      if (formats.italic) out = `<i>${out}</i>`;
      if (formats.bold) out = `<b>${out}</b>`;
      return out;
    },
  },
  json: {
    color(hex) {
      return hex.toLowerCase();
    },
  },
};

function activeFormatCodes(formatId, formats) {
  const spec = FORMAT_CODES[formatId];
  if (!spec || formatId === 'json' || formatId === 'minimessage') return '';
  const parts = [];
  if (formats.bold) parts.push(spec.bold);
  if (formats.italic) parts.push(spec.italic);
  if (formats.underline) parts.push(spec.underline);
  if (formats.strikethrough) parts.push(spec.strikethrough);
  if (formats.obfuscate) parts.push(spec.obfuscate);
  return parts.join('');
}

export function encodeCharacter({ formatId, hex, char, formats, lowercase }) {
  if (!char) return '';
  const normalized = normalizeHex(hex) ?? 'FFFFFF';
  const spec = FORMAT_CODES[formatId];

  if (formatId === 'json') {
    const entry = { text: char };
    entry.color = `#${spec.color(normalized, lowercase)}`;
    if (formats.bold) entry.bold = true;
    if (formats.italic) entry.italic = true;
    if (formats.underline) entry.underline = true;
    if (formats.strikethrough) entry.strikethrough = true;
    if (formats.obfuscate) entry.obfuscated = true;
    return entry;
  }

  if (formatId === 'minimessage') {
    const inner = spec.wrap(char, formats);
    return `${spec.color(normalized, lowercase)}${inner}`;
  }

  return `${spec.color(normalized, lowercase)}${activeFormatCodes(formatId, formats)}${char}`;
}

export function buildOutput({ formatId, segments, prefixSuffix, lowercase }) {
  const plain = segments.map((segment) => segment.char).join('');
  const body = segments.map((segment) => encodeCharacter({
    formatId,
    hex: segment.hex,
    char: segment.char,
    formats: segment.formats,
    lowercase,
  }));

  if (formatId === 'json') {
    const components = body.filter(Boolean);
    const wrapped = prefixSuffix
      ? [{ text: prefixSuffix.replace(/\$t/g, '') }, ...components]
      : components;
    return JSON.stringify(wrapped.length === 1 ? wrapped[0] : wrapped);
  }

  const joined = body.join('');
  if (!prefixSuffix) return joined;
  return prefixSuffix.replace(/\$t/g, joined);
}

export function getFormatOptions(t) {
  return [
    { value: 'ampersand_hex', label: t('tools.rgb.formats.ampersand') },
    { value: 'section_hex', label: t('tools.rgb.formats.section') },
    { value: 'minimessage', label: t('tools.rgb.formats.minimessage') },
    { value: 'json', label: t('tools.rgb.formats.json') },
  ];
}
