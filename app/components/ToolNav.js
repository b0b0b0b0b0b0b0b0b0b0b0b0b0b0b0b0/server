'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getToolNeighbors, tools } from '@/lib/config/tools';
import { useLocale } from '@/app/components/AppProviders';

export default function ToolNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { prev, next, current } = getToolNeighbors(pathname);

  if (!current) return null;

  return (
    <nav className="tool-nav" aria-label={t('nav.tools')}>
      <div className="tool-nav-side">
        {prev ? (
          <Link href={prev.href} className="tool-nav-link tool-nav-link--prev" prefetch>
            <ChevronLeft size={18} strokeWidth={2.25} />
            <span className="tool-nav-link-label">{t(prev.titleKey)}</span>
          </Link>
        ) : (
          <span className="tool-nav-spacer" />
        )}
      </div>

      <div className="tool-nav-track">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className={`tool-nav-pill${tool.id === current.id ? ' is-active' : ''}`}
            data-accent={tool.accent}
            prefetch
            aria-current={tool.id === current.id ? 'page' : undefined}
          >
            <span className="tool-nav-pill-dot" />
            <span className="tool-nav-pill-label">{t(tool.titleKey)}</span>
          </Link>
        ))}
      </div>

      <div className="tool-nav-side tool-nav-side--end">
        {next ? (
          <Link href={next.href} className="tool-nav-link tool-nav-link--next" prefetch>
            <span className="tool-nav-link-label">{t(next.titleKey)}</span>
            <ChevronRight size={18} strokeWidth={2.25} />
          </Link>
        ) : (
          <span className="tool-nav-spacer" />
        )}
      </div>
    </nav>
  );
}
