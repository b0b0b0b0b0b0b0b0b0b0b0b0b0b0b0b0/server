import { LOCALE_DETECTION_ORDER, LOCALE_LANGUAGE_CODES } from '@/lib/config/locale';
import { SHARED_LOCALE_COOKIE, toolsLocaleFromSiteLocale } from '@/lib/core/sharedLocale';

const localeLanguageSets = Object.fromEntries(
  Object.entries(LOCALE_LANGUAGE_CODES).map(([locale, codes]) => [locale, new Set(codes)]),
);

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

function detectLocaleFromTags(tags) {
  for (const tag of tags) {
    const base = baseLanguageTag(tag);
    for (const locale of LOCALE_DETECTION_ORDER) {
      if (localeLanguageSets[locale]?.has(base)) {
        return locale;
      }
    }
  }
  return 'en';
}

export function detectLocaleFromAcceptLanguage(acceptLanguage) {
  if (!acceptLanguage) {
    return 'en';
  }

  const tags = acceptLanguage
    .split(',')
    .map((part) => part.trim().split(';')[0].trim());

  return detectLocaleFromTags(tags);
}

export function detectBrowserLocale() {
  return detectLocaleFromTags(collectLocaleCandidates());
}

export function resolveServerLocale(cookieStore, acceptLanguage) {
  const shared = toolsLocaleFromSiteLocale(cookieStore.get(SHARED_LOCALE_COOKIE)?.value);
  if (shared) {
    return shared;
  }
  return detectLocaleFromAcceptLanguage(acceptLanguage);
}
