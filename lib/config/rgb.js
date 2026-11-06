export const RGB_DEFAULT_TEXT = 'MTools';

export const RGB_DEFAULT_STOPS = [
  { hex: '#F472B6', position: 0 },
  { hex: '#A78BFA', position: 34 },
  { hex: '#5B8DEF', position: 67 },
  { hex: '#2DD4BF', position: 100 },
];

export const RGB_CONTRAST_DARK = '#1a1f28';
export const RGB_CONTRAST_LIGHT = '#f8fafc';

export const RGB_STOP_HIT_RADIUS_PX = 8;

export const RGB_DEFAULT_STATE = {
  text: RGB_DEFAULT_TEXT,
  formatId: 'ampersand_hex',
  charsPerColor: 1,
  disperse: false,
  trimSpaces: true,
  lowercase: false,
  prefixSuffix: '',
  formats: {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    obfuscate: false,
  },
};

export const RGB_FORMAT_BUTTONS = [
  { key: 'bold', code: '&l' },
  { key: 'italic', code: '&o' },
  { key: 'underline', code: '&n' },
  { key: 'strikethrough', code: '&m' },
  { key: 'obfuscate', code: '&k' },
];

export const RGB_MIN_STOPS = 2;
export const RGB_MAX_STOPS = 8;

export const RGB_SWATCHES = [
  '#FAEDCB',
  '#C9E4DE',
  '#C6DEF1',
  '#DBCDF0',
  '#F2C6DE',
  '#FCD05C',
  '#5FE2C5',
  '#4498DB',
  '#9863E7',
  '#E43A96',
  '#000000',
  '#555555',
  '#AAAAAA',
  '#FFFFFF',
];
