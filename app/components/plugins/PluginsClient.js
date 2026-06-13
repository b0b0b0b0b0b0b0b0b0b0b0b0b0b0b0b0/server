'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Blocks,
  Copy,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import AddPluginModal from '@/app/components/plugins/AddPluginModal';
import PluginCard from '@/app/components/plugins/PluginCard';
import LumDropdown from '@/app/components/LumDropdown';
import ServerSwitcher from '@/app/components/ServerSwitcher';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import {
  PLUGIN_FILTERS,
  PLUGIN_SOFTWARE,
  PLUGIN_SPIGOT_DOWNLOAD_LIMIT,
  PLUGIN_SPIGOT_DOWNLOAD_WINDOW_MS,
} from '@/lib/config/plugins';
import { refreshPlugin } from '@/lib/tools/plugins/PluginRegistry';
import { downloadSpigotPlugin } from '@/lib/tools/plugins/SpigotPlugin';
import { isUpdateAvailable } from '@/lib/tools/plugins/pluginUtils';
import { PLUGIN_SOFTWARE_ICONS } from '@/lib/ui/PluginSoftwareIcons';
import { ModrinthIcon, SOURCE_ICONS, SpigotIcon } from '@/lib/ui/SourceIcons';

export default function PluginsClient() {
  const { t } = useLocale();
  const { ready, activeServerId, activeServer, pluginsFilter, patch } = useWorkspace();
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingMap, setLoadingMap] = useState({});
  const [bulkLoading, setBulkLoading] = useState(null);
  const [importValue, setImportValue] = useState('');
  const [toast, setToast] = useState(null);
  const [spigotRateLimit] = useState({
    downloadCount: 0,
    resetTime: 0,
    limit: PLUGIN_SPIGOT_DOWNLOAD_LIMIT,
    windowMs: PLUGIN_SPIGOT_DOWNLOAD_WINDOW_MS,
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const software = activeServer?.plugins.software ?? 'paper';
  const plugins = activeServer?.plugins.list ?? [];

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

  const visiblePlugins = useMemo(() => {
    const filter = pluginsFilter ?? 'all';
    return plugins
      .map((plugin, index) => ({ plugin, index }))
      .filter(({ plugin }) => {
        if (filter === 'all') return true;
        if (filter === 'outdated') return isUpdateAvailable(plugin);
        return plugin.type === filter;
      });
  }, [plugins, pluginsFilter]);

  const outdatedCount = useMemo(
    () => plugins.filter((plugin) => isUpdateAvailable(plugin)).length,
    [plugins],
  );

  const setLoading = (key, value) => {
    setLoadingMap((current) => ({ ...current, [key]: value }));
  };

  const handleExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(plugins, null, 2));
      notify('success', t('tools.plugins.exported'));
    } catch (error) {
      notify('error', `${t('tools.plugins.exportFailed')} ${error.message}`);
    }
  };

  const handleImport = () => {
    if (!importValue.trim()) return;
    try {
      const parsed = JSON.parse(importValue);
      patch((store) => {
        store.importPlugins(parsed, activeServerId);
      });
      setImportValue('');
      notify('success', t('tools.plugins.imported'));
    } catch (error) {
      notify('error', `${t('tools.plugins.importFailed')} ${error.message}`);
    }
  };

  const handleRefreshPlugin = async (index) => {
    const plugin = plugins[index];
    if (!plugin || plugin.type === 'misc') return;
    const key = `plugin-${index}`;
    setLoading(key, true);
    try {
      const updated = await refreshPlugin(plugin, software);
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
      } else if (plugin.file?.url) {
        window.open(plugin.file.url, '_blank');
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

  const handleCheckAll = async () => {
    setBulkLoading('check');
    try {
      for (let index = 0; index < plugins.length; index += 1) {
        const plugin = plugins[index];
        if (plugin.type === 'misc') continue;
        const updated = await refreshPlugin(plugin, software);
        updated.updateDate = new Date();
        patch((store) => {
          store.updatePlugin(index, updated, activeServerId);
        });
      }
      notify('success', t('tools.plugins.checkedAll'));
    } catch (error) {
      notify('error', `${t('tools.plugins.refreshError')} ${error.message}`);
    } finally {
      setBulkLoading(null);
    }
  };

  const handleDownloadAll = async () => {
    setBulkLoading('download');
    try {
      for (let index = 0; index < plugins.length; index += 1) {
        const plugin = plugins[index];
        if (!isUpdateAvailable(plugin)) continue;
        if (plugin.type === 'spigot') {
          await downloadSpigotPlugin(plugin, spigotRateLimit);
        } else if (plugin.file?.url) {
          window.open(plugin.file.url, '_blank');
        }
        patch((store) => {
          const list = store.getPluginList(activeServerId);
          const target = list[index];
          if (target?.latestVersion) {
            target.currentVersion = target.latestVersion;
            target.updateDate = new Date();
          }
        });
      }
    } finally {
      setBulkLoading(null);
    }
  };

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
            <button type="button" className="lum-btn plugin-btn plugin-btn--accent" onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              {t('tools.plugins.addPlugin')}
            </button>
          </div>

          <div className="plugin-toolbar-divider" aria-hidden />

          <div className="plugin-toolbar-group plugin-toolbar-group--filters">
            <LumDropdown
              id="plugin-software"
              value={software}
              options={softwareOptions}
              iconOnly
              onChange={(value) => patch((store) => { store.setPluginSoftware(value, activeServerId); })}
            />
            <LumDropdown
              id="plugin-filter"
              value={pluginsFilter ?? 'all'}
              options={filterOptions}
              onChange={(value) => patch((store) => { store.pluginsFilter = value; })}
            />
          </div>

          <div className="plugin-toolbar-divider" aria-hidden />

          <div className="plugin-toolbar-group plugin-toolbar-group--import">
            <button type="button" className="lum-btn plugin-btn" onClick={handleExport}>
              <Copy size={16} />
              {t('tools.plugins.export')}
            </button>
            <input
              className="lum-input plugin-import-input"
              value={importValue}
              placeholder={t('tools.plugins.importPlaceholder')}
              onChange={(event) => setImportValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleImport();
              }}
            />
          </div>
        </div>

        {plugins.length > 0 && (
          <div className="plugin-bulk-actions">
            <button
              type="button"
              className="lum-btn plugin-btn"
              onClick={handleCheckAll}
              disabled={bulkLoading === 'check'}
            >
              {bulkLoading === 'check' ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
              {t('tools.plugins.checkAll')}
            </button>
            {outdatedCount > 0 && (
              <button
                type="button"
                className="lum-btn plugin-btn plugin-btn--primary"
                onClick={handleDownloadAll}
                disabled={bulkLoading === 'download'}
              >
                {bulkLoading === 'download' ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                {t('tools.plugins.downloadAll', { count: outdatedCount })}
              </button>
            )}
            {outdatedCount > 10 && (
              <p className="field-hint">{t('tools.plugins.spigotRateHint')}</p>
            )}
          </div>
        )}

        <div className="plugin-grid">
          {visiblePlugins.length === 0 && (
            <p className="plugin-empty-list">{t('tools.plugins.emptyList')}</p>
          )}
          {visiblePlugins.map(({ plugin, index }) => (
            <PluginCard
              key={`${plugin.type}-${plugin.id}-${index}`}
              plugin={plugin}
              loading={loadingMap[`plugin-${index}`]}
              onRefresh={() => handleRefreshPlugin(index)}
              onDownload={() => handleDownloadPlugin(index)}
              onMarkUpdated={() => handleMarkUpdated(index)}
              onRemove={() => patch((store) => { store.removePlugin(index, activeServerId); })}
            />
          ))}
        </div>
      </>

      <AddPluginModal
        open={modalOpen}
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
    </div>
  );
}
