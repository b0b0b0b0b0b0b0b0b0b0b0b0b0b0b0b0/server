'use client';

import { tools, sections } from '@/lib/config/tools';
import ToolCard from '@/app/components/ToolCard';
import { useLocale } from '@/app/components/AppProviders';

export default function HomeClient() {
  const { t } = useLocale();

  return (
    <div>
      <section className="page-intro">
        <div className="page-intro-brand">
          <h1 className="page-intro-title">{t('site.name')}</h1>
          <span className="page-intro-abbrev">{t('site.abbrev')}</span>
        </div>
        <p className="page-intro-text">{t('site.tagline')}</p>
      </section>
      {sections.map((section) => {
        const items = tools.filter((tool) => tool.section === section.id);
        return (
          <section key={section.id} className="section-block">
            <h2 className="section-title">{t(section.titleKey)}</h2>
            <p className="section-desc">{t(section.descriptionKey)}</p>
            <div className="tool-grid">
              {items.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
