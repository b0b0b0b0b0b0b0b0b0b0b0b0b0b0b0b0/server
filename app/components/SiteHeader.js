'use client';

import Link from 'next/link';
import { useLocale } from '@/app/components/AppProviders';
import ServicesNav from '@/app/components/ServicesNav';

export default function SiteHeader() {
  const { t, locale } = useLocale();

  return (
    <>
      <ServicesNav locale={locale} />
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="site-header-logo">
            <span className="site-header-brand">{t('site.name')}</span>
            <span className="site-header-abbrev">{t('site.abbrev')}</span>
          </Link>
        </div>
      </header>
    </>
  );
}
