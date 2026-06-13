'use client';

import HomeToolCard from '@/app/components/HomeToolCard';
import { Flag, Zap, Blocks } from 'lucide-react';
import { tools } from '@/lib/config/tools';
import { useLocale } from '@/app/components/AppProviders';

const ICONS = {
  flag: Flag,
  zap: Zap,
  blocks: Blocks,
};

const STACK_PILLS = ['Paper', 'Purpur', 'Velocity'];

export default function HomeClient() {
  const { t } = useLocale();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-brand">
            <h1 className="home-hero-title">{t('site.name')}</h1>
            <span className="home-hero-abbrev">{t('site.abbrev')}</span>
          </div>
          <p className="home-hero-subtitle">{t('home.heroSubtitle')}</p>
          <div className="home-hero-meta">
            <span className="home-hero-badge">{t('home.heroBadge')}</span>
            <ul className="home-hero-stack">
              {STACK_PILLS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="home-tools">
        <div className="home-tools-head">
          <h2 className="home-tools-title">{t('home.toolsHeading')}</h2>
        </div>

        <div className="home-tools-row">
          {tools.map((tool) => {
            const Icon = ICONS[tool.icon];
            const title = t(tool.titleKey);
            const description = t(tool.homeDescriptionKey ?? tool.descriptionKey);

            return (
              <HomeToolCard
                key={tool.id}
                tool={tool}
                title={title}
                description={description}
                Icon={Icon}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
