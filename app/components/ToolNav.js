'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Flag, House, Palette, Zap } from 'lucide-react';
import { tools } from '@/lib/config/tools';
import { useLocale } from '@/app/components/AppProviders';

const ICONS = {
  flag: Flag,
  zap: Zap,
  palette: Palette,
  activity: Activity,
};

export default function ToolNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const items = [
    { id: 'home', href: '/', label: t('nav.home'), Icon: House, accent: 'home', active: pathname === '/' },
    ...tools.map((tool) => ({
      id: tool.id,
      href: tool.href,
      label: t(tool.titleKey),
      Icon: ICONS[tool.icon] || Activity,
      accent: tool.accent,
      active: pathname === tool.href || pathname.startsWith(`${tool.href}/`),
    })),
  ];

  return (
    <nav className="tool-dock" aria-label={t('nav.tools')}>
      <div className="tool-dock-shelf">
        {items.map(({ id, href, label, Icon, accent, active }) => (
          <Link
            key={id}
            href={href}
            className={`tool-dock-item${active ? ' is-active' : ''}`}
            data-accent={accent}
            prefetch
            title={label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="tool-dock-tile">
              <Icon className="tool-dock-icon" size={20} strokeWidth={2.25} aria-hidden />
            </span>
            <span className="tool-dock-label">{label}</span>
            <span className="tool-dock-dot" aria-hidden />
          </Link>
        ))}
      </div>
    </nav>
  );
}
