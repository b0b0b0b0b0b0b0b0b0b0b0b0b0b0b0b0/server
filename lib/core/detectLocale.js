import { LOCALES, STORAGE_KEYS } from '@/lib/config/constants';
import { RUSSIAN_UI_LANGUAGE_CODES } from '@/lib/config/locale';
import { SettingsStore } from '@/lib/core/SettingsStore';

const russianUiLanguages = new Set(RUSSIAN_UI_LANGUAGE_CODES);

function baseLanguageTag(tag) {
  return String(tag ?? '')
    .toLowerCase()
    .split('-')[0];
}

function collectLocaleCandidates() {
  if (typeof navigator === 'undefined') {
    return [];
  }

  const candidates = [];
  if (navigator.languages?.length) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }
  return candidates;
}

export function detectLocaleFromAcceptLanguage(acceptLanguage) {
  if (!acceptLanguage) {
    return 'en';
  }

  const tags = acceptLanguage
    .split(',')
    .map((part) => part.trim().split(';')[0].trim());

  for (const tag of tags) {
    if (russianUiLanguages.has(baseLanguageTag(tag))) {
      return 'ru';
    }
  }

  return 'en';
}

export function detectBrowserLocale() {
  const candidates = collectLocaleCandidates();
  for (const tag of candidates) {
    if (russianUiLanguages.has(baseLanguageTag(tag))) {
      return 'ru';
    }
  }
  return 'en';
}

export function resolveServerLocale(cookieStore, acceptLanguage) {
  const saved = cookieStore.get(STORAGE_KEYS.locale)?.value;
  if (saved && LOCALES.includes(saved)) {
    return saved;
  }
  return detectLocaleFromAcceptLanguage(acceptLanguage);
}

export function resolveLocale(storage) {
  const settings = new SettingsStore(storage);
  const saved = settings.read(STORAGE_KEYS.locale, null);
  if (saved && LOCALES.includes(saved)) {
    return saved;
  }
  return detectBrowserLocale();
}
