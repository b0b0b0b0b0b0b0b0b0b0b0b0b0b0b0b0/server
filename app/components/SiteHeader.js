'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLocale, useTheme } from '@/app/components/AppProviders';
import LumDropdown from '@/app/components/LumDropdown';
import { labels } from '@/locales/index';
import { LOCALES } from '@/lib/config/constants';

export default function SiteHeader() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme, ready } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const localeOptions = useMemo(
    () => LOCALES.map((code) => ({
      value: code,
      label: labels[code],
    })),
    [],
  );

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-logo">
          <span className="site-header-brand">{t('site.name')}</span>
          <span className="site-header-abbrev">{t('site.abbrev')}</span>
        </Link>
        <nav className="site-header-nav" aria-label={t('nav.language')}>
          <div className="site-header-locale">
            <LumDropdown
              id="header-locale"
              value={locale}
              options={localeOptions}
              onChange={setLocale}
            />
          </div>
          <button
            type="button"
            className="site-header-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('nav.theme')}
          >
            {mounted && ready && (theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />)}
          </button>
        </nav>
      </div>
    </header>
  );
}
