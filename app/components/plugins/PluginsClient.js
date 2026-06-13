'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Blocks,
  Copy,
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import AddPluginModal from '@/app/components/plugins/AddPluginModal';
import PluginCard from '@/app/components/plugins/PluginCard';
import LumDropdown from '@/app/components/LumDropdown';
import {
  PLUGIN_FILTERS,
  PLUGIN_SOFTWARE,
  PLUGIN_SPIGOT_DOWNLOAD_LIMIT,
  PLUGIN_SPIGOT_DOWNLOAD_WINDOW_MS,
} from '@/lib/config/plugins';
import { PluginsStore } from '@/lib/tools/plugins/PluginsStore';
import { refreshPlugin } from '@/lib/tools/plugins/PluginRegistry';
import { downloadSpigotPlugin } from '@/lib/tools/plugins/SpigotPlugin';
import { isUpdateAvailable } from '@/lib/tools/plugins/pluginUtils';
import { PLUGIN_SOFTWARE_ICONS } from '@/lib/ui/PluginSoftwareIcons';
import { ModrinthIcon, SOURCE_ICONS, SpigotIcon } from '@/lib/ui/SourceIcons';

function cloneStore(store) {
  return new PluginsStore(store.snapshot());
}

export default function PluginsClient() {
  const { t } = useLocale();
  const [store, setStore] = useState(null);
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
    setStore(PluginsStore.load(window.localStorage));
  }, []);

  useEffect(() => {
    if (!store) return;
    store.save(window.localStorage);
  }, [store]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  const patchStore = useCallback((mutator) => {
    setStore((current) => {
      const next = cloneStore(current);
      mutator(next);
      return next;
    });
  }, []);

  const software = store?.activeServer?.software ?? 'paper';
  const plugins = store?.activePlugins ?? [];

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
    const filter = store?.filter ?? 'all';
    return plugins
      .map((plugin, index) => ({ plugin, index }))
      .filter(({ plugin }) => {
        if (filter === 'all') return true;
        if (filter === 'outdated') return isUpdateAvailable(plugin);
        return plugin.type === filter;
      });
  }, [plugins, store?.filter]);

  const outdatedCount = useMemo(
    () => plugins.filter((plugin) => isUpdateAvailable(plugin)).length,
    [plugins],
  );

  const setLoading = (key, value) => {
    setLoadingMap((current) => ({ ...current, [key]: value }));
  };

  const handleAddServer = () => {
    const name = window.prompt(t('tools.plugins.promptServerName'));
    if (!name?.trim()) return;
    patchStore((next) => {
      if (!next.addServer(name.trim())) {
        notify('warn', t('tools.plugins.serverExists'));
      }
    });
  };

  const handleRenameServer = () => {
    if (!store?.openServer) return;
    const name = window.prompt(t('tools.plugins.promptRename'), store.openServer);
    if (!name?.trim() || name === store.openServer) return;
    patchStore((next) => {
      if (!next.renameServer(name.trim())) {
        notify('warn', t('tools.plugins.serverExists'));
      }
    });
  };

  const handleDeleteServer = () => {
    if (!store?.openServer) return;
    if (!window.confirm(t('tools.plugins.confirmDelete', { name: store.openServer }))) return;
    patchStore((next) => next.deleteServer());
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
      patchStore((next) => next.importPlugins(parsed));
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
      patchStore((next) => next.updatePlugin(index, updated));
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
      patchStore((next) => {
        const target = next.activePlugins[index];
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
    patchStore((next) => {
      const target = next.activePlugins[index];
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
        patchStore((next) => next.updatePlugin(index, updated));
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
        patchStore((next) => {
          const target = next.activePlugins[index];
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

  if (!store) return null;

  const serverNames = Object.keys(store.servers);

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

      <div className="plugin-server-tabs">
        {serverNames.map((name) => (
          <button
            key={name}
            type="button"
            className={`lum-btn plugin-server-tab${store.openServer === name ? ' is-active' : ''}`}
            onClick={() => patchStore((next) => { next.openServer = name; })}
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          className="lum-btn plugin-server-tab plugin-server-tab--add"
          onClick={handleAddServer}
          title={t('tools.plugins.addServer')}
        >
          <Plus size={16} />
        </button>
      </div>

      {!store.openServer && (
        <p className="plugin-empty-servers">{t('tools.plugins.noServers')}</p>
      )}

      {store.openServer && (
        <>
          <div className="plugin-toolbar">
            <button type="button" className="lum-btn" onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              {t('tools.plugins.addPlugin')}
            </button>
            <button
              type="button"
              className="lum-btn lum-btn-icon"
              onClick={handleRenameServer}
              title={t('tools.plugins.renameServer')}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className="lum-btn lum-btn-icon plugin-toolbar-danger"
              onClick={handleDeleteServer}
              title={t('tools.plugins.deleteServer')}
            >
              <Trash2 size={16} />
            </button>
            <LumDropdown
              id="plugin-software"
              value={software}
              options={softwareOptions}
              iconOnly
              onChange={(value) => patchStore((next) => next.setSoftware(value))}
            />
            <button type="button" className="lum-btn" onClick={handleExport}>
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
            <LumDropdown
              id="plugin-filter"
              value={store.filter ?? 'all'}
              options={filterOptions}
              onChange={(value) => patchStore((next) => { next.filter = value; })}
            />
          </div>

          {plugins.length > 0 && (
            <div className="plugin-bulk-actions">
              <button
                type="button"
                className="lum-btn"
                onClick={handleCheckAll}
                disabled={bulkLoading === 'check'}
              >
                {bulkLoading === 'check' ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                {t('tools.plugins.checkAll')}
              </button>
              {outdatedCount > 0 && (
                <button
                  type="button"
                  className="lum-btn lum-btn-primary"
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
                onRemove={() => patchStore((next) => next.removePlugin(index))}
              />
            ))}
          </div>
        </>
      )}

      <AddPluginModal
        open={modalOpen}
        software={software}
        existingPlugins={plugins}
        onClose={() => setModalOpen(false)}
        onAdd={(plugin) => {
          let added = false;
          patchStore((next) => {
            added = next.addPlugin(plugin);
          });
          return added;
        }}
        onNotify={notify}
      />
    </div>
  );
}
