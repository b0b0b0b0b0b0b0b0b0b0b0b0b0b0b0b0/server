'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18n } from '@/lib/core/I18n';
import { SettingsStore } from '@/lib/core/SettingsStore';
import { ThemeStore } from '@/lib/core/ThemeStore';
import { resolveLocale } from '@/lib/core/detectLocale';
import { catalog } from '@/locales/index';
import { DEFAULT_LOCALE, DEFAULT_THEME, STORAGE_KEYS } from '@/lib/config/constants';

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

export default function AppProviders({ children }) {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const themeStore = new ThemeStore(window.localStorage);
    const resolvedLocale = resolveLocale(window.localStorage);
    const savedTheme = themeStore.read(DEFAULT_THEME);
    setLocaleState(resolvedLocale);
    setThemeState(savedTheme);
    themeStore.apply(savedTheme);
    document.documentElement.lang = resolvedLocale;
    setThemeReady(true);
  }, []);

  const i18n = useMemo(() => new I18n(catalog, locale), [locale]);

  useEffect(() => {
    if (!themeReady) return;
    document.title = i18n.t('meta.documentTitle');
  }, [i18n, locale, themeReady]);

  const setLocale = (next) => {
    const settings = new SettingsStore(window.localStorage);
    settings.write(STORAGE_KEYS.locale, next);
    setLocaleState(next);
    document.documentElement.lang = next;
  };

  const setTheme = (next) => {
    const themeStore = new ThemeStore(window.localStorage);
    themeStore.write(next);
    themeStore.apply(next);
    setThemeState(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, i18n, t: (key, params) => i18n.t(key, params) }}>
      <ThemeContext.Provider value={{ theme, setTheme, ready: themeReady }}>
        {children}
      </ThemeContext.Provider>
    </LocaleContext.Provider>
  );
}
