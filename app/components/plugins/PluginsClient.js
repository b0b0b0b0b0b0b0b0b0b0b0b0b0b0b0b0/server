'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Blocks,
  Download,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import AddPluginModal from '@/app/components/plugins/AddPluginModal';
import ImportJarsModal from '@/app/components/plugins/ImportJarsModal';
import RelinkPluginModal from '@/app/components/plugins/RelinkPluginModal';
import SetInstalledVersionModal from '@/app/components/plugins/SetInstalledVersionModal';
import PluginCard from '@/app/components/plugins/PluginCard';
import LumDropdown from '@/app/components/LumDropdown';
import LumTooltip from '@/app/components/LumTooltip';
import ServerSwitcher from '@/app/components/ServerSwitcher';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import {
  PLUGIN_FILTERS,
  PLUGIN_SOFTWARE,
  PLUGIN_BULK_CHECK_DELAY_MS,
  PLUGIN_SPIGOT_DOWNLOAD_LIMIT,
  PLUGIN_SPIGOT_DOWNLOAD_WINDOW_MS,
} from '@/lib/config/plugins';
import { delay, yieldToMain } from '@/lib/core/yieldToMain';
import { parsePluginImportJson, pluginExportFilename } from '@/lib/tools/plugins/pluginBackup';
import { refreshPlugin } from '@/lib/tools/plugins/PluginRegistry';
import { downloadSpigotPlugin } from '@/lib/tools/plugins/SpigotPlugin';
import { isUpdateAvailable, openPluginDownload } from '@/lib/tools/plugins/pluginUtils';
import { PLUGIN_SOFTWARE_ICONS } from '@/lib/ui/PluginSoftwareIcons';
import { ModrinthIcon, SOURCE_ICONS, SpigotIcon } from '@/lib/ui/SourceIcons';

const IMPORT_REASON_KEYS = {
  invalidJson: 'tools.plugins.importInvalidJson',
  invalidFormat: 'tools.plugins.importInvalidFormat',
  emptyList: 'tools.plugins.importEmptyList',
};

export default function PluginsClient() {
  const { t } = useLocale();
  const { ready, activeServerId, activeServer, pluginsFilter, patch } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [jarModalOpen, setJarModalOpen] = useState(false);
  const [relinkIndex, setRelinkIndex] = useState(null);
  const [versionIndex, setVersionIndex] = useState(null);
  const [loadingMap, setLoadingMap] = useState({});
  const [bulkLoading, setBulkLoading] = useState(null);
  const [checkProgress, setCheckProgress] = useState(null);
  const [toast, setToast] = useState(null);
  const [spigotRateLimit] = useState({
    downloadCount: 0,
    resetTime: 0,
    limit: PLUGIN_SPIGOT_DOWNLOAD_LIMIT,
    windowMs: PLUGIN_SPIGOT_DOWNLOAD_WINDOW_MS,
  });
  const mountedRef = useRef(false);
  const importFileRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((type, message) => {
    if (!mountedRef.current) return;
    setToast({ type, message });
  }, []);

  const software = activeServer?.plugins.software ?? 'paper';
  const plugins = activeServer?.plugins.list ?? [];
  const serverName = activeServer?.name ?? t('workspace.defaultServerName');

  const softwareOptions = useMemo(
    () => PLUGIN_SOFTWARE.map((value) => {
      const Icon = PLUGIN_SOFTWARE_ICONS[value];
      return {
        value,
        label: t(`tools.plugins.softwares.${value}`),
        icon: Icon ? <Icon size={20} /> : null,
      };
    }),
    [t],
  );

  const filterOptions = useMemo(() => PLUGIN_FILTERS.map((value) => {
    if (value === 'all') {
      return { value, label: t('tools.plugins.filters.all'), icon: <Filter size={16} /> };
    }
    if (value === 'outdated') {
      return { value, label: t('tools.plugins.filters.outdated'), icon: <RefreshCw size={16} /> };
    }
    const Icon = SOURCE_ICONS[value];
    return {
      value,
      label: t(`tools.plugins.filters.${value}`),
      icon: Icon ? <Icon size={16} /> : null,
    };
  }), [t]);

  const pluginGroups = useMemo(() => {
    const filter = pluginsFilter ?? 'all';
    const filtered = plugins
      .map((plugin, index) => ({ plugin, index }))
      .filter(({ plugin }) => {
        if (filter === 'all') return true;
        if (filter === 'outdated') return isUpdateAvailable(plugin);
        return plugin.type === filter;
      });

    return {
      outdated: filtered.filter(({ plugin }) => isUpdateAvailable(plugin)),
      current: filtered.filter(({ plugin }) => !isUpdateAvailable(plugin)),
      total: filtered.length,
    };
  }, [plugins, pluginsFilter]);

  const setLoading = (key, value) => {
    if (!mountedRef.current) return;
    setLoadingMap((current) => ({ ...current, [key]: value }));
  };

  const setBulkLoadingSafe = (value) => {
    if (!mountedRef.current) return;
    setBulkLoading(value);
  };

  const handleExportFile = () => {
    try {
      const blob = new Blob([JSON.stringify(plugins, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pluginExportFilename(serverName);
      link.click();
      URL.revokeObjectURL(url);
      notify('success', t('tools.plugins.exported'));
    } catch (error) {
      notify('error', `${t('tools.plugins.exportFailed')} ${error.message}`);
    }
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    try {
      const parsed = parsePluginImportJson(await file.text());
      if (!parsed.ok) {
        const key = IMPORT_REASON_KEYS[parsed.reason];
        notify('error', key ? t(key) : t('tools.plugins.importFailed'));
        return;
      }
      patch((store) => {
        store.importPlugins(parsed.plugins, activeServerId);
      });
      notify('success', t('tools.plugins.imported'));
    } catch (error) {
      notify('error', `${t('tools.plugins.importFailed')} ${error.message}`);
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  const handleRefreshPlugin = async (index) => {
    const plugin = plugins[index];
    if (!plugin || plugin.type === 'misc') return;
    const key = `plugin-${index}`;
    setLoading(key, true);
    try {
      const updated = await refreshPlugin(plugin, software);
      if (!mountedRef.current) return;
      updated.updateDate = new Date();
      patch((store) => {
        store.updatePlugin(index, updated, activeServerId);
      });
    } catch (error) {
      notify('error', `${t('tools.plugins.refreshError')} ${error.message}`);
    } finally {
      setLoading(key, false);
    }
  };

  const handleDownloadPlugin = async (index) => {
    const plugin = plugins[index];
    if (!plugin?.file?.url && !plugin?.file?.externalUrl) return;
    const key = `plugin-${index}`;
    setLoading(key, true);
    try {
      if (plugin.type === 'spigot') {
        await downloadSpigotPlugin(plugin, spigotRateLimit);
      } else {
        openPluginDownload(plugin);
      }
      patch((store) => {
        const list = store.getPluginList(activeServerId);
        const target = list[index];
        if (target?.latestVersion) {
          target.currentVersion = target.latestVersion;
          target.updateDate = new Date();
        }
      });
    } finally {
      setLoading(key, false);
    }
  };

  const handleMarkUpdated = (index) => {
    patch((store) => {
      const list = store.getPluginList(activeServerId);
      const target = list[index];
      if (target?.latestVersion) {
        target.currentVersion = target.latestVersion;
        target.updateDate = new Date();
      }
    });
  };

  const handleRemovePlugin = (index) => {
    const plugin = plugins[index];
    if (!plugin) return;
    if (!window.confirm(t('tools.plugins.confirmRemove', { name: plugin.name }))) return;
    patch((store) => {
      store.removePlugin(index, activeServerId);
    });
    notify('success', t('tools.plugins.removed', { name: plugin.name }));
  };

  const handleRemoveAll = () => {
    if (!plugins.length) return;
    if (!window.confirm(t('tools.plugins.confirmRemoveAll', { count: plugins.length }))) return;
    patch((store) => {
      store.clearPlugins(activeServerId);
    });
    notify('success', t('tools.plugins.removedAll'));
  };

  const handleCheckAll = async () => {
    const checkable = plugins
      .map((plugin, index) => ({ plugin, index }))
      .filter(({ plugin }) => plugin.type !== 'misc');

    if (!checkable.length) return;

    setBulkLoadingSafe('check');
    setCheckProgress({ done: 0, total: checkable.length });

    try {
      for (let step = 0; step < checkable.length; step += 1) {
        const { plugin, index } = checkable[step];
        const key = `plugin-${index}`;
        setLoading(key, true);

        await delay(PLUGIN_BULK_CHECK_DELAY_MS);
        await yieldToMain();

        const updated = await refreshPlugin(plugin, software);
        if (!mountedRef.current) return;
        updated.updateDate = new Date();
        patch((store) => {
          store.updatePlugin(index, updated, activeServerId);
        });
        setLoading(key, false);
        setCheckProgress({ done: step + 1, total: checkable.length });
        await yieldToMain();
      }
      notify('success', t('tools.plugins.checkedAll'));
    } catch (error) {
      notify('error', `${t('tools.plugins.refreshError')} ${error.message}`);
    } finally {
      checkable.forEach(({ index }) => setLoading(`plugin-${index}`, false));
      setCheckProgress(null);
      setBulkLoadingSafe(null);
    }
  };

  const renderPluginCard = ({ plugin, index }) => (
    <PluginCard
      key={`${plugin.type}-${plugin.id}-${index}`}
      plugin={plugin}
      loading={loadingMap[`plugin-${index}`]}
      onRefresh={() => handleRefreshPlugin(index)}
      onDownload={() => handleDownloadPlugin(index)}
      onMarkUpdated={() => handleMarkUpdated(index)}
      onSetVersion={() => setVersionIndex(index)}
      onRemove={() => handleRemovePlugin(index)}
      onRelink={() => setRelinkIndex(index)}
    />
  );

  const checkProgressPercent = checkProgress?.total
    ? Math.round((checkProgress.done / checkProgress.total) * 100)
    : 0;

  if (!ready) return null;

  return (
    <div className="tool-page plugins-page">
      <header className="tool-page-head">
        <h1 className="tool-page-title">
          <span className="tool-page-title-icon tool-page-title-icon--violet">
            <Blocks size={20} />
          </span>
          {t('tools.plugins.title')}
          <span className="plugin-badge">{t('tools.plugins.experimental')}</span>
        </h1>
        <p className="tool-page-desc">{t('tools.plugins.description')}</p>
        <p className="tool-page-desc plugin-warning">{t('tools.plugins.warning')}</p>
      </header>

      {toast && (
        <div className={`plugin-toast plugin-toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      <ServerSwitcher />

      <>
        <div className="plugin-toolbar">
          <div className="plugin-toolbar-group">
            <LumTooltip content={t('tools.plugins.tooltips.importJars')}>
              <button type="button" className="lum-btn plugin-btn plugin-btn--accent" onClick={() => setJarModalOpen(true)}>
                <Upload size={16} />
                {t('tools.plugins.importJars')}
              </button>
            </LumTooltip>
            <LumTooltip content={t('tools.plugins.tooltips.addPlugin')}>
              <button type="button" className="lum-btn plugin-btn" onClick={() => setModalOpen(true)}>
                <Plus size={16} />
                {t('tools.plugins.addPlugin')}
              </button>
            </LumTooltip>
          </div>

          <div className="plugin-toolbar-divider" aria-hidden />

          <div className="plugin-toolbar-group plugin-toolbar-group--filters">
            <LumDropdown
              id="plugin-software"
              value={software}
              options={softwareOptions}
              iconOnly
              tooltip={t('tools.plugins.tooltips.software')}
              onChange={(value) => patch((store) => { store.setPluginSoftware(value, activeServerId); })}
            />
            <LumDropdown
              id="plugin-filter"
              value={pluginsFilter ?? 'all'}
              options={filterOptions}
              tooltip={t('tools.plugins.tooltips.filter')}
              onChange={(value) => patch((store) => { store.pluginsFilter = value; })}
            />
          </div>
        </div>

        <div className="plugin-data-bar">
          {plugins.length > 0 && (
            <LumTooltip content={t('tools.plugins.tooltips.export')}>
              <button type="button" className="plugin-data-action" onClick={handleExportFile}>
                <Download size={14} />
                {t('tools.plugins.export')}
              </button>
            </LumTooltip>
          )}
          <LumTooltip content={t('tools.plugins.tooltips.import')}>
            <button
              type="button"
              className="plugin-data-action"
              onClick={() => importFileRef.current?.click()}
            >
              <Upload size={14} />
              {t('tools.plugins.importJson')}
            </button>
          </LumTooltip>
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            className="plugin-backup-input"
            onChange={(event) => {
              handleImportFile(event.target.files?.[0]);
            }}
          />
        </div>

        {plugins.length > 0 && (
          <div className={`plugin-bulk-actions${bulkLoading === 'check' ? ' is-checking' : ''}`}>
            {bulkLoading === 'check' && checkProgress ? (
              <div className="plugin-check-all">
                <span className="plugin-check-all-icon" aria-hidden>
                  <Loader2 size={18} className="spin" />
                </span>
                <div className="plugin-check-all-body">
                  <p className="plugin-check-all-label">
                    {t('tools.plugins.checkAllProgress', checkProgress)}
                  </p>
                  <div className="plugin-check-all-track">
                    <div
                      className="plugin-check-all-bar"
                      role="progressbar"
                      aria-valuenow={checkProgressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: `${checkProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <LumTooltip content={t('tools.plugins.tooltips.checkAll')}>
                <button
                  type="button"
                  className="lum-btn plugin-btn"
                  onClick={handleCheckAll}
                >
                  <RefreshCw size={16} />
                  {t('tools.plugins.checkAll')}
                </button>
              </LumTooltip>
            )}
            <LumTooltip content={t('tools.plugins.tooltips.removeAll')}>
              <button
                type="button"
                className="lum-btn plugin-btn plugin-btn--danger plugin-btn--compact plugin-bulk-remove"
                onClick={handleRemoveAll}
                disabled={Boolean(bulkLoading)}
              >
                <Trash2 size={16} />
                {t('tools.plugins.removeAll', { count: plugins.length })}
              </button>
            </LumTooltip>
          </div>
        )}

        {pluginGroups.total === 0 && (
          <p className="plugin-empty-list">{t('tools.plugins.emptyList')}</p>
        )}

        {pluginGroups.outdated.length > 0 && (
          <section className="plugin-section">
            <h2 className="plugin-section-title plugin-section-title--outdated">
              {t('tools.plugins.sections.outdated', { count: pluginGroups.outdated.length })}
            </h2>
            <div className="plugin-grid">
              {pluginGroups.outdated.map(renderPluginCard)}
            </div>
          </section>
        )}

        {pluginGroups.current.length > 0 && (
          <section className="plugin-section">
            <h2 className="plugin-section-title">
              {t('tools.plugins.sections.current', { count: pluginGroups.current.length })}
            </h2>
            <div className="plugin-grid">
              {pluginGroups.current.map(renderPluginCard)}
            </div>
          </section>
        )}
      </>

      {modalOpen && (
      <AddPluginModal
        open
        software={software}
        existingPlugins={plugins}
        onClose={() => setModalOpen(false)}
        onAdd={(plugin) => {
          let added = false;
          patch((store) => {
            added = store.addPlugin(plugin, activeServerId);
          });
          return added;
        }}
        onNotify={notify}
      />
      )}

      {jarModalOpen && (
      <ImportJarsModal
        open
        software={software}
        existingPlugins={plugins}
        onClose={() => setJarModalOpen(false)}
        onImport={(items) => {
          let added = 0;
          patch((store) => {
            items.forEach((plugin) => {
              if (store.addPlugin(plugin, activeServerId)) added += 1;
            });
          });
          return { added, skipped: items.length - added };
        }}
        onNotify={notify}
      />
      )}

      {relinkIndex !== null && plugins[relinkIndex] && (
      <RelinkPluginModal
        open
        plugin={plugins[relinkIndex]}
        software={software}
        existingPlugins={plugins}
        excludeIndex={relinkIndex}
        onClose={() => setRelinkIndex(null)}
        onSave={(next) => {
          patch((store) => {
            store.updatePlugin(relinkIndex, next, activeServerId);
          });
          notify('success', t('tools.plugins.relinkSaved'));
        }}
        onNotify={notify}
      />
      )}

      {versionIndex !== null && plugins[versionIndex] && (
      <SetInstalledVersionModal
        open
        plugin={plugins[versionIndex]}
        software={software}
        onClose={() => setVersionIndex(null)}
        onSave={(next) => {
          patch((store) => {
            store.updatePlugin(versionIndex, next, activeServerId);
          });
          notify('success', t('tools.plugins.changeVersionSaved'));
        }}
        onNotify={notify}
      />
      )}
    </div>
  );
}
