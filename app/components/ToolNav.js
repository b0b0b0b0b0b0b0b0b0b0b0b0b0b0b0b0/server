'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { tools } from '@/lib/config/tools';
import { useLocale } from '@/app/components/AppProviders';

export default function ToolNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const items = [
    { id: 'home', href: '/', label: t('nav.home'), active: pathname === '/' },
    ...tools.map((tool) => ({
      id: tool.id,
      href: tool.href,
      label: t(tool.titleKey),
      active: pathname === tool.href || pathname.startsWith(`${tool.href}/`),
    })),
  ];

  return (
    <nav className="tool-tabs" aria-label={t('nav.tools')}>
      {items.map(({ id, href, label, active }) => (
        <Link
          key={id}
          href={href}
          className={`tool-tab${active ? ' is-active' : ''}`}
          prefetch
          aria-current={active ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
