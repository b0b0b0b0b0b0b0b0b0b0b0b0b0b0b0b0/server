'use client';

import { useLocale } from '@/app/components/AppProviders';
import ServicesNav from '@/app/components/ServicesNav';
import ToolNav from '@/app/components/ToolNav';

export default function SiteHeader() {
  const { locale } = useLocale();

  return (
    <>
      <ServicesNav locale={locale} />
      <header className="site-header">
        <div className="site-header-inner">
          <ToolNav />
        </div>
      </header>
    </>
  );
}
