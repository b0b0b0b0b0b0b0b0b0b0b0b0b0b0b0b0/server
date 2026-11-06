import { LOCALES } from '@/lib/config/constants';

export const SHARED_LOCALE_COOKIE = 'site-locale';

const RUSSIAN_SITE_LOCALES = new Set(['ru', 'orv', 'uk']);

export function toolsLocaleFromSiteLocale(siteLocale) {
  if (!siteLocale) return null;
  if (RUSSIAN_SITE_LOCALES.has(siteLocale)) return 'ru';
  return LOCALES.includes(siteLocale) ? siteLocale : 'en';
}

export function readSharedLocale() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)site-locale=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}
