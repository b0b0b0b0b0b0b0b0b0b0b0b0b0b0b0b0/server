import { RTL_LOCALES } from '@/lib/config/locale';

export function resolveDocumentDirection(locale) {
  return RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

export function applyDocumentLocale(locale) {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.lang = locale;
  document.documentElement.dir = resolveDocumentDirection(locale);
}
