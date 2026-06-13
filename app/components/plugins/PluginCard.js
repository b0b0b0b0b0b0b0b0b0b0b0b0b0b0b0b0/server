'use client';

import {
  Check,
  Download,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';import { useLocale } from '@/app/components/AppProviders';
import LumTooltip from '@/app/components/LumTooltip';
import { ModrinthIcon, SpigotIcon } from '@/lib/ui/SourceIcons';
import { formatPluginDate, getPluginPageUrl, getSafePluginIconUrl, isUpdateAvailable } from '@/lib/tools/plugins/pluginUtils';

export default function PluginCard({
  plugin,
  loading,
  onRefresh,
  onDownload,
  onMarkUpdated,
  onRemove,
  onRelink,
}) {
  const { t, locale } = useLocale();
  const updateAvailable = isUpdateAvailable(plugin);
  const pageUrl = getPluginPageUrl(plugin);
  const iconUrl = getSafePluginIconUrl(plugin);

  return (
    <article className={`plugin-card${updateAvailable ? ' plugin-card--outdated' : ''}`}>
      <div className="plugin-card-head">
        <div className="plugin-card-icon">
          {iconUrl ? (
            <img src={iconUrl} alt="" width={40} height={40} />
          ) : plugin.type === 'modrinth' ? (
            <ModrinthIcon size={28} />
          ) : plugin.type === 'spigot' ? (
            <SpigotIcon size={28} />
          ) : (
            <span className="plugin-card-icon-fallback">{plugin.name?.[0] ?? '?'}</span>
          )}
        </div>
        <div className="plugin-card-meta">
          <h3 className="plugin-card-title">{plugin.name}</h3>
          {plugin.mcVersions?.length > 0 && (
            <p className="plugin-card-versions-range">
              {plugin.mcVersions[0]} – {plugin.mcVersions[plugin.mcVersions.length - 1]}
            </p>
          )}
          {updateAvailable && plugin.latestVersion && (
            <p className="plugin-card-update-note">
              {t('tools.plugins.updateAvailable', {
                date: formatPluginDate(plugin.latestVersion.releaseDate, locale),
              })}
            </p>
          )}
        </div>
        <div className="plugin-card-head-actions">
        <LumTooltip content={t('tools.plugins.tooltips.relink')} side="bottom">
          <button
            type="button"
            className="lum-btn plugin-btn plugin-btn--icon plugin-card-relink"
            onClick={onRelink}
            aria-label={t('tools.plugins.relinkPlugin')}
          >
            <Link2 size={16} />
          </button>
        </LumTooltip>
        <LumTooltip content={t('tools.plugins.tooltips.remove')} side="bottom">
          <button
            type="button"
            className="lum-btn plugin-btn plugin-btn--icon plugin-btn--danger plugin-card-remove"
            onClick={onRemove}
            aria-label={t('tools.plugins.remove')}
          >
            <Trash2 size={16} />
          </button>
        </LumTooltip>
        </div>
      </div>

      {plugin.type !== 'misc' && plugin.description && (
        <p className="plugin-card-desc">{plugin.description}</p>
      )}

      <dl className="plugin-card-stats">
        {plugin.updateDate && (
          <div>
            <dt>{t('tools.plugins.lastChecked')}</dt>
            <dd>{formatPluginDate(plugin.updateDate, locale)}</dd>
          </div>
        )}
        {plugin.currentVersion && (
          <div>
            <dt>{t('tools.plugins.current')}</dt>
            <dd>{plugin.currentVersion.name}</dd>
          </div>
        )}
        {plugin.latestVersion && plugin.type !== 'misc' && (
          <div>
            <dt>{t('tools.plugins.latest')}</dt>
            <dd>{plugin.latestVersion.name}</dd>
          </div>
        )}
      </dl>

      <div className="plugin-card-actions">
        {plugin.type !== 'misc' && (
          <LumTooltip content={t('tools.plugins.tooltips.checkUpdate')}>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--compact"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
              {t('tools.plugins.checkUpdate')}
            </button>
          </LumTooltip>
        )}
        {updateAvailable && (plugin.file?.url || plugin.file?.externalUrl) && (
          <LumTooltip content={t('tools.plugins.tooltips.download')}>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--compact plugin-btn--primary"
              onClick={onDownload}
              disabled={loading}
            >
              <Download size={16} />
              {t('tools.plugins.download')}
            </button>
          </LumTooltip>
        )}
        {pageUrl && (
          <LumTooltip content={t('tools.plugins.tooltips.viewPlugin')}>
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lum-btn plugin-btn plugin-btn--compact"
            >
              <ExternalLink size={16} />
              {t('tools.plugins.viewPlugin')}
            </a>
          </LumTooltip>
        )}
        {updateAvailable && (
          <LumTooltip content={t('tools.plugins.tooltips.markUpdated')}>
            <button type="button" className="lum-btn plugin-btn plugin-btn--compact" onClick={onMarkUpdated}>
              <Check size={16} />
              {t('tools.plugins.markUpdated')}
            </button>
          </LumTooltip>
        )}
      </div>
    </article>
  );
}
