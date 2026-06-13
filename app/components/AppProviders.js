'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18n } from '@/lib/core/I18n';
import { SettingsStore } from '@/lib/core/SettingsStore';
import { ThemeStore } from '@/lib/core/ThemeStore';
import { writePrefCookie } from '@/lib/core/prefCookies';
import { catalog } from '@/locales/index';
import { DEFAULT_LOCALE, DEFAULT_THEME, LOCALES, STORAGE_KEYS } from '@/lib/config/constants';

const LocaleContext = createContext(null);
const ThemeContext = createContext(null);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale outside provider');
  }
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme outside provider');
  }
  return ctx;
}

export default function AppProviders({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialTheme = DEFAULT_THEME,
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [theme, setThemeState] = useState(initialTheme);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const settings = new SettingsStore(window.localStorage);
    const themeStore = new ThemeStore(window.localStorage);
    const storedLocale = settings.read(STORAGE_KEYS.locale, null);
    const storedTheme = themeStore.read(null);

    const resolvedLocale = storedLocale && LOCALES.includes(storedLocale)
      ? storedLocale
      : initialLocale;

    const resolvedTheme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : initialTheme;

    if (!storedLocale && LOCALES.includes(resolvedLocale)) {
      settings.write(STORAGE_KEYS.locale, resolvedLocale);
    }

    setLocaleState(resolvedLocale);
    setThemeState(resolvedTheme);
    themeStore.apply(resolvedTheme);
    document.documentElement.lang = resolvedLocale;
    writePrefCookie(STORAGE_KEYS.locale, resolvedLocale);
    writePrefCookie(STORAGE_KEYS.theme, resolvedTheme);
    setReady(true);
  }, [initialLocale, initialTheme]);

  const i18n = useMemo(() => new I18n(catalog, locale), [locale]);

  useEffect(() => {
    if (!ready) return;
    document.title = i18n.t('meta.documentTitle');
  }, [i18n, locale, ready]);

  const setLocale = (next) => {
    const settings = new SettingsStore(window.localStorage);
    settings.write(STORAGE_KEYS.locale, next);
    setLocaleState(next);
    document.documentElement.lang = next;
    writePrefCookie(STORAGE_KEYS.locale, next);
  };

  const setTheme = (next) => {
    const themeStore = new ThemeStore(window.localStorage);
    themeStore.write(next);
    themeStore.apply(next);
    setThemeState(next);
    writePrefCookie(STORAGE_KEYS.theme, next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, i18n, t: (key, params) => i18n.t(key, params) }}>
      <ThemeContext.Provider value={{ theme, setTheme, ready }}>
        {children}
      </ThemeContext.Provider>
    </LocaleContext.Provider>
  );
}
