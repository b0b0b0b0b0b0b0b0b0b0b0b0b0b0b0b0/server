'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18n } from '@/lib/core/I18n';
import { applyDocumentLocale } from '@/lib/core/localeDirection';
import { catalog } from '@/locales/index';
import { DEFAULT_LOCALE } from '@/lib/config/constants';
import { readSharedLocale, toolsLocaleFromSiteLocale } from '@/lib/core/sharedLocale';

const LocaleContext = createContext(null);

const LEGACY_STORAGE_KEYS = ['server-tools.locale', 'server-tools.theme'];
const LEGACY_COOKIES = ['server-tools.locale', 'server-tools.theme'];

function dropLegacyPrefs() {
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {}
  LEGACY_COOKIES.forEach((name) => {
    document.cookie = `${name}=;path=/;max-age=0;samesite=lax`;
  });
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale outside provider');
  }
  return ctx;
}

export default function AppProviders({ children, initialLocale = DEFAULT_LOCALE }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dropLegacyPrefs();
    const sync = () => {
      const shared = toolsLocaleFromSiteLocale(readSharedLocale());
      if (!shared) return;
      applyDocumentLocale(shared);
      setLocaleState(shared);
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    sync();
    setReady(true);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const i18n = useMemo(() => new I18n(catalog, locale), [locale]);

  const t = useCallback((key, params) => i18n.t(key, params), [i18n]);

  useEffect(() => {
    if (!ready) return;
    document.title = i18n.t('meta.documentTitle');
  }, [i18n, locale, ready]);

  const localeValue = useMemo(
    () => ({ locale, i18n, t }),
    [locale, i18n, t],
  );

  return (
    <LocaleContext.Provider value={localeValue}>
      {children}
    </LocaleContext.Provider>
  );
}
