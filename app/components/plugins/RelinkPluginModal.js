'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link2, ExternalLink, Loader2, X } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import ModalPortal from '@/app/components/ModalPortal';
import LumDropdown from '@/app/components/LumDropdown';
import { PLUGIN_SOURCES, PLUGIN_URL_REGEX } from '@/lib/config/plugins';
import { getPluginLoaders } from '@/lib/tools/plugins/PluginLoaders';
import {
  createPlugin,
  pluginFromSearchHit,
  searchPlugins,
} from '@/lib/tools/plugins/PluginRegistry';
import { preserveVersionOnRelink, getPluginPageUrl } from '@/lib/tools/plugins/pluginUtils';
import PluginSearchResultRow from '@/app/components/plugins/PluginSearchResultRow';
import { SOURCE_ICONS } from '@/lib/ui/SourceIcons';

const SOURCE_DESCRIPTION_KEYS = {
  modrinth: 'tools.plugins.sources.modrinthDesc',
  spigot: 'tools.plugins.sources.spigotDesc',
};

export default function RelinkPluginModal({
  open,
  plugin,
  software,
  existingPlugins,
  excludeIndex = null,
  mergePlugin,
  onClose,
  onSave,
  onNotify,
}) {
  const { t } = useLocale();
  const [source, setSource] = useState('modrinth');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const onNotifyRef = useRef(onNotify);
  const tRef = useRef(t);
  const suppressSearchRef = useRef(false);

  useEffect(() => {
    onNotifyRef.current = onNotify;
    tRef.current = t;
  }, [onNotify, t]);

  const loaders = useMemo(() => getPluginLoaders(software), [software]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !plugin) return undefined;
    const initialSource = plugin.type === 'spigot' ? 'spigot' : 'modrinth';
    setSource(initialSource);
    setQuery(plugin.name ?? '');
    setSearchResults([]);
    setDraft(null);
    setLoading(false);
    return undefined;
  }, [open, plugin]);

  const sourceOptions = useMemo(
    () => PLUGIN_SOURCES.map((value) => {
      const Icon = SOURCE_ICONS[value];
      return {
        value,
        label: t(`tools.plugins.sources.${value}`),
        icon: Icon ? <Icon size={20} /> : null,
      };
    }),
    [t],
  );

  const isDuplicate = (id, type) => existingPlugins.some(
    (item, index) => {
      if (excludeIndex !== null && index === excludeIndex) return false;
      return item.type === type && String(item.id) === String(id);
    },
  );

  const resolveFromUrl = async (value) => {
    const match = value.match(PLUGIN_URL_REGEX[source]);
    if (!match) return false;
    const pluginId = source === 'spigot' ? match[2] : match[1];
    if (isDuplicate(pluginId, source)) {
      onNotifyRef.current('warn', tRef.current('tools.plugins.alreadyAdded'));
      return true;
    }
    setLoading(true);
    try {
      const instance = createPlugin({ type: source, id: pluginId });
      await instance.fetch(software);
      setDraft(instance.toJSON());
      setSearchResults([]);
    } catch (error) {
      onNotifyRef.current('error', `${tRef.current('tools.plugins.fetchError')} ${error.message}`);
    } finally {
      setLoading(false);
    }
    return true;
  };

  useEffect(() => {
    if (!open || !query.trim()) {
      setSearchResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (suppressSearchRef.current) {
        suppressSearchRef.current = false;
        return;
      }

      const value = query.trim();
      const handled = await resolveFromUrl(value);
      if (cancelled || handled) return;

      setLoading(true);
      try {
        const hits = await searchPlugins(source, value, loaders);
        if (cancelled) return;
        if (!hits.length) {
          setSearchResults([]);
          setDraft(null);
          return;
        }
        setSearchResults(
          hits.map((hit) => {
            const instance = pluginFromSearchHit(source, hit);
            return instance.toJSON ? instance.toJSON() : instance;
          }),
        );
        setDraft(null);
      } catch (error) {
        if (!cancelled) {
          onNotifyRef.current('error', `${tRef.current('tools.plugins.searchError')} ${error.message}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, source, open, software, loaders]);

  const handleSelectResult = async (pluginId) => {
    const hit = searchResults.find((item) => String(item.id) === String(pluginId));
    if (!hit) return;
    if (isDuplicate(hit.id, source)) {
      onNotify('warn', t('tools.plugins.alreadyAdded'));
      return;
    }
    setLoading(true);
    try {
      const instance = createPlugin({ type: source, id: hit.id });
      await instance.fetch(software);
      setDraft(instance.toJSON());
      setSearchResults([]);
      suppressSearchRef.current = true;
      setQuery(hit.name ?? '');
    } catch (error) {
      onNotify('error', `${t('tools.plugins.fetchError')} ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const canSave = Boolean(draft?.id);

  const handleSave = () => {
    if (!canSave || !draft || !plugin) return;
    if (isDuplicate(draft.id, draft.type)) {
      onNotify('warn', t('tools.plugins.alreadyAdded'));
      return;
    }
    onSave((mergePlugin ?? preserveVersionOnRelink)(plugin, draft));
    onClose();
  };

  if (!open || !plugin) return null;

  const currentPageUrl = getPluginPageUrl(plugin);
  const draftPageUrl = draft ? getPluginPageUrl({ ...draft, type: draft.type ?? source }) : undefined;

  return (
    <ModalPortal>
      <div className="plugin-modal-backdrop" onClick={onClose} role="presentation">
        <div
          className="plugin-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plugin-relink-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="plugin-modal-head">
            <h2 className="plugin-modal-title" id="plugin-relink-title">
              <Link2 size={24} />
              {t('tools.plugins.relinkPlugin')}
            </h2>
            <button type="button" className="lum-btn plugin-btn plugin-btn--icon plugin-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="plugin-modal-body lum-scroll">
            <p className="field-hint">{t('tools.plugins.relinkPluginDesc')}</p>

            <div className="plugin-relink-current">
              <div className="plugin-relink-current-head">
                <span className="plugin-relink-current-label">{t('tools.plugins.relinkCurrent')}</span>
                {currentPageUrl && (
                  <a
                    href={currentPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="plugin-relink-source-link"
                  >
                    <ExternalLink size={13} strokeWidth={2} />
                    {t('tools.plugins.viewSource')}
                  </a>
                )}
              </div>
              <strong>{plugin.name}</strong>
              {plugin.currentVersion?.name && (
                <span className="plugin-relink-current-version">
                  {t('tools.plugins.current')}: {plugin.currentVersion.name}
                </span>
              )}
            </div>

            <LumDropdown
              id="plugin-relink-source"
              label={t('tools.plugins.pluginSource')}
              value={source}
              options={sourceOptions}
              onChange={(value) => {
                setSource(value);
                setDraft(null);
                setSearchResults([]);
              }}
            />
            <p className="field-hint">{t(SOURCE_DESCRIPTION_KEYS[source])}</p>

            <label className="field">
              <span className="field-label">{t('tools.plugins.searchLabel')}</span>
              <input
                className="lum-input"
                value={query}
                placeholder={t(`tools.plugins.searchPlaceholder.${source}`)}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {loading && (
              <p className="plugin-modal-status">
                <Loader2 size={16} className="spin" />
                {t('tools.plugins.loading')}
              </p>
            )}
            {searchResults.length > 0 && (
              <div className="plugin-search-results">
                <p className="field-label">{t('tools.plugins.searchResults')}</p>
                {searchResults.map((item) => (
                  <PluginSearchResultRow
                    key={`${source}-${item.id}`}
                    source={source}
                    item={item}
                    onSelect={handleSelectResult}
                  />
                ))}
              </div>
            )}
            {draft && (
              <div className="plugin-relink-preview">
                <div className="plugin-relink-current-head">
                  <p className="field-label">{t('tools.plugins.relinkPreview')}</p>
                  {draftPageUrl && (
                    <a
                      href={draftPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="plugin-relink-source-link"
                    >
                      <ExternalLink size={13} strokeWidth={2} />
                      {t('tools.plugins.viewSource')}
                    </a>
                  )}
                </div>
                <p className="plugin-relink-preview-name">{draft.name}</p>
              </div>
            )}
          </div>

          <div className="plugin-modal-foot">
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--primary"
              onClick={handleSave}
              disabled={!canSave}
            >
              {t('tools.plugins.relinkSave')}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
