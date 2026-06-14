'use client';

import {
  Check,
  Download,
  ExternalLink,
  Link2,
  Loader2,
  Package,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import LumTooltip from '@/app/components/LumTooltip';
import { ModrinthIcon, SpigotIcon } from '@/lib/ui/SourceIcons';
import { formatPluginDate, getPluginDisplayName, getPluginPageUrl, getSafePluginIconUrl, isInstalledLatest, isLatestForGameVersion, isUpdateAvailable, shouldShowLatestVersion } from '@/lib/tools/plugins/pluginUtils';

export default function PluginCard({
  plugin,
  gameVersion,
  loading,
  onRefresh,
  onDownload,
  onMarkUpdated,
  onSetVersion,
  onRemove,
  onRelink,
}) {
  const { t, locale } = useLocale();
  const updateAvailable = isUpdateAvailable(plugin);
  const latestForServer = isLatestForGameVersion(plugin, gameVersion);
  const showLatestVersion = latestForServer && shouldShowLatestVersion(plugin);
  const pageUrl = getPluginPageUrl(plugin);
  const iconUrl = getSafePluginIconUrl(plugin);
  const latestVersionTooltip = plugin.updateDate
    ? t('tools.plugins.lastCheckedShort', {
      date: formatPluginDate(plugin.updateDate, locale),
    })
    : null;

  return (
    <article className="plugin-card">
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
          <h3 className="plugin-card-title">{getPluginDisplayName(plugin)}</h3>
          {plugin.noBuildForGameVersion && plugin.targetGameVersion && (
            <p className="plugin-card-no-build">
              {t('tools.plugins.noVersionForMc', { version: plugin.targetGameVersion })}
            </p>
          )}
          {updateAvailable && plugin.latestVersion && latestForServer && (
            <p className="plugin-card-update-note">
              {t('tools.plugins.updateAvailable', {
                date: formatPluginDate(plugin.latestVersion.releaseDate, locale),
              })}
            </p>
          )}
        </div>
        <div className="plugin-card-head-actions">
        {pageUrl && (
          <LumTooltip content={t('tools.plugins.tooltips.viewPlugin')} side="bottom">
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lum-btn plugin-btn plugin-btn--icon plugin-card-page"
              aria-label={t('tools.plugins.viewPlugin')}
            >
              <ExternalLink size={16} />
            </a>
          </LumTooltip>
        )}
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

      {plugin.currentVersion && (
        <div className="plugin-card-versions">
          <p className="plugin-card-version-line">
            {t('tools.plugins.versionLineYour')}{' '}
            <strong>{plugin.currentVersion.name}</strong>
            {latestForServer && (
              showLatestVersion ? (
                <>
                  {' → '}
                  {t('tools.plugins.versionLineLatest')}{' '}
                  <LumTooltip
                    content={latestVersionTooltip}
                    side="bottom"
                    className="plugin-card-version-latest-tip"
                  >
                    <strong className="plugin-card-version-latest">{plugin.latestVersion.name}</strong>
                  </LumTooltip>
                </>
              ) : (
                <>
                  {' = '}
                  {t('tools.plugins.versionLineUpToDate')}{' '}
                  <LumTooltip
                    content={latestVersionTooltip}
                    side="bottom"
                    className="plugin-card-version-latest-tip"
                  >
                    <strong>{plugin.latestVersion.name}</strong>
                  </LumTooltip>
                </>
              )
            )}
          </p>
        </div>
      )}

      <div className="plugin-card-actions">
        {plugin.type !== 'misc' && (
          <LumTooltip content={t('tools.plugins.checkUpdate')}>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--icon plugin-btn--compact"
              onClick={onRefresh}
              disabled={loading}
              aria-label={t('tools.plugins.checkUpdate')}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
            </button>
          </LumTooltip>
        )}
        {plugin.type !== 'misc' && (
          <LumTooltip content={t('tools.plugins.changeVersion')}>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--icon plugin-btn--compact"
              onClick={onSetVersion}
              disabled={loading}
              aria-label={t('tools.plugins.changeVersion')}
            >
              <Package size={16} />
            </button>
          </LumTooltip>
        )}
        {plugin.type !== 'misc' && (
          <LumTooltip content={t('tools.plugins.tooltips.relink')}>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--icon plugin-btn--compact plugin-card-relink"
              onClick={onRelink}
              disabled={loading}
              aria-label={t('tools.plugins.relinkPlugin')}
            >
              <Link2 size={16} />
            </button>
          </LumTooltip>
        )}
        {updateAvailable && (
          <LumTooltip content={t('tools.plugins.markUpdated')}>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--icon plugin-btn--compact"
              onClick={onMarkUpdated}
              aria-label={t('tools.plugins.markUpdated')}
            >
              <Check size={16} />
            </button>
          </LumTooltip>
        )}
        {updateAvailable && (plugin.file?.url || plugin.file?.externalUrl) && (
          <LumTooltip content={t('tools.plugins.download')} className="plugin-card-download">
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--icon plugin-btn--compact plugin-btn--primary"
              onClick={onDownload}
              disabled={loading}
              aria-label={t('tools.plugins.download')}
            >
              <Download size={16} />
            </button>
          </LumTooltip>
        )}
      </div>
    </article>
  );
}
