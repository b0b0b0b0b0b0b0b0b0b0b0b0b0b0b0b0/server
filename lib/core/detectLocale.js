import { DEFAULT_LOCALE, LOCALES, STORAGE_KEYS } from '@/lib/config/constants';
import { SettingsStore } from '@/lib/core/SettingsStore';

/** Languages mapped to Russian UI (RU, UA, CIS). */
export const CIS_LANGUAGE_CODES = new Set([
  'ru',
  'uk',
  'be',
  'kk',
  'ky',
  'uz',
  'tg',
  'az',
  'hy',
  'ka',
  'tk',
  'mo',
  'tt',
  'os',
  'ab',
]);

function baseLanguageTag(tag) {
  return String(tag ?? '')
    .toLowerCase()
    .split('-')[0];
}

export function detectBrowserLocale(fallback = DEFAULT_LOCALE) {
  if (typeof navigator === 'undefined') {
    return fallback;
  }

  const tags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || fallback];

  for (const tag of tags) {
    const base = baseLanguageTag(tag);
    if (CIS_LANGUAGE_CODES.has(base)) {
      return 'ru';
    }
  }

  return 'en';
}

export function resolveLocale(storage) {
  const settings = new SettingsStore(storage);
  const saved = settings.read(STORAGE_KEYS.locale, null);
  if (saved && LOCALES.includes(saved)) {
    return saved;
  }
  return detectBrowserLocale();
}

export function buildLocaleBootScript() {
  const cis = [...CIS_LANGUAGE_CODES].map((code) => `'${code}'`).join(',');
  return `try{var sk='${STORAGE_KEYS.locale}';var l=localStorage.getItem(sk);if(l){try{l=JSON.parse(l)}catch(e){}if(l==='ru'||l==='en'){document.documentElement.lang=l}}else{var cis=[${cis}];var tags=navigator.languages&&navigator.languages.length?Array.from(navigator.languages):[navigator.language||'en'];var pick='en';for(var i=0;i<tags.length;i++){var b=String(tags[i]||'').toLowerCase().split('-')[0];if(cis.indexOf(b)!==-1){pick='ru';break}}document.documentElement.lang=pick}}catch(e){}`;
}
