'use client';

import { ExternalLink } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import { getSearchResultPageUrl } from '@/lib/tools/plugins/pluginUtils';
import { ModrinthIcon, SpigotIcon } from '@/lib/ui/SourceIcons';

export default function PluginSearchResultRow({ source, item, onSelect }) {
  const { t } = useLocale();
  const pageUrl = getSearchResultPageUrl(source, item);

  return (
    <div className="plugin-search-result">
      <button
        type="button"
        className="plugin-search-result-main"
        onClick={() => onSelect(item.id)}
      >
        {item.iconUrl ? (
          <img src={item.iconUrl} alt="" width={32} height={32} />
        ) : source === 'modrinth' ? (
          <ModrinthIcon size={24} />
        ) : (
          <SpigotIcon size={24} />
        )}
        <span className="plugin-search-result-text">
          <strong>{item.name}</strong>
          {item.description && <span>{item.description}</span>}
        </span>
      </button>
      {pageUrl && (
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="plugin-search-result-link"
          onClick={(event) => event.stopPropagation()}
        >
          <ExternalLink size={14} strokeWidth={2} />
          <span>{t('tools.plugins.viewSource')}</span>
        </a>
      )}
    </div>
  );
}
