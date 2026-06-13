'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLocale, useTheme } from '@/app/components/AppProviders';
import { labels } from '@/locales/index';
import { LOCALES } from '@/lib/config/constants';

export default function SiteHeader() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme, ready } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-logo">
          <span className="site-header-brand">{t('site.name')}</span>
          <span className="site-header-abbrev">{t('site.abbrev')}</span>
        </Link>
        <nav className="site-header-nav" aria-label={t('nav.language')}>
          <select
            className="site-header-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            aria-label={t('nav.language')}
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>{labels[code]}</option>
            ))}
          </select>
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
