'use client';

import Link from 'next/link';
import { Flag, Zap, Blocks } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';

const ICONS = {
  flag: Flag,
  zap: Zap,
  blocks: Blocks,
};

export default function ToolCard({ tool }) {
  const { t } = useLocale();
  const Icon = ICONS[tool.icon];
  const title = t(tool.titleKey);
  const description = t(tool.descriptionKey);

  const body = (
    <>
      <span className="tool-card-icon">{Icon && <Icon size={22} />}</span>
      <h3 className="tool-card-title">{title}</h3>
      <p className="tool-card-description">{description}</p>
      {tool.comingSoon && <span className="tool-card-badge">{t('common.comingSoon')}</span>}
    </>
  );

  if (tool.comingSoon) {
    return <div className={`tool-card tool-card--${tool.accent} is-disabled`}>{body}</div>;
  }

  return (
    <Link href={tool.href} className={`tool-card tool-card--${tool.accent}`}>
      {body}
    </Link>
  );
}
