'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Blocks, Loader2, X } from 'lucide-react';
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
import PluginSearchResultRow from '@/app/components/plugins/PluginSearchResultRow';
import { SOURCE_ICONS } from '@/lib/ui/SourceIcons';
import { formatPluginDate } from '@/lib/tools/plugins/pluginUtils';

const SOURCE_DESCRIPTION_KEYS = {
  modrinth: 'tools.plugins.sources.modrinthDesc',
  spigot: 'tools.plugins.sources.spigotDesc',
};

export default function AddPluginModal({
  open,
  software,
  existingPlugins,
  onClose,
  onAdd,
  onNotify,
}) {
  const { t, locale } = useLocale();
  const [source, setSource] = useState('modrinth');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const onNotifyRef = useRef(onNotify);
  const tRef = useRef(t);

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
    if (!open) return undefined;
    return () => {
      setSource('modrinth');
      setQuery('');
      setSearchResults([]);
      setDraft(null);
      setLoading(false);
    };
  }, [open]);

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

  const versionOptions = useMemo(() => {
    if (!draft?.versions?.length) return [];
    return draft.versions.map((version) => ({
      value: String(version.id),
      label: `${version.name} (${formatPluginDate(version.releaseDate, locale)})`,
    }));
  }, [draft, locale]);

  const resetDraft = () => {
    setDraft(null);
    setSearchResults([]);
  };

  const isDuplicate = (id, type) => existingPlugins.some(
    (plugin) => plugin.type === type && String(plugin.id) === String(id),
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
      const value = query.trim();
      const handled = await resolveFromUrl(value);
      if (cancelled || handled) return;

      setLoading(true);
      try {
        const hits = await searchPlugins(source, value, loaders);
        if (cancelled) return;
        if (!hits.length) {
          onNotifyRef.current('warn', tRef.current('tools.plugins.noResults', { query: value }));
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
        if (!cancelled) onNotifyRef.current('error', `${tRef.current('tools.plugins.searchError')} ${error.message}`);
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
      setQuery(hit.name ?? '');
    } catch (error) {
      onNotify('error', `${t('tools.plugins.fetchError')} ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (versionId) => {
    if (!draft?.versions) return;
    const selected = draft.versions.find((version) => String(version.id) === versionId);
    if (!selected) return;
    setDraft({ ...draft, currentVersion: selected });
  };

  const canAdd = Boolean(draft?.currentVersion);

  const handleAdd = () => {
    if (!canAdd || !draft) return;
    const added = onAdd({
      ...draft,
      updateDate: new Date(),
    });
    if (!added) {
      onNotify('warn', t('tools.plugins.alreadyAdded'));
      return;
    }
    onClose();
  };

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="plugin-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="plugin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plugin-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="plugin-modal-head">
          <h2 className="plugin-modal-title" id="plugin-modal-title">
            <Blocks size={24} />
            {t('tools.plugins.addPlugin')}
          </h2>
          <button type="button" className="lum-btn plugin-btn plugin-btn--icon plugin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="plugin-modal-body lum-scroll">
          <LumDropdown
            id="plugin-source"
            label={t('tools.plugins.pluginSource')}
            value={source}
            options={sourceOptions}
            onChange={(value) => {
              setSource(value);
              setQuery('');
              resetDraft();
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
          {draft?.versions?.length > 0 && (
            <LumDropdown
              id="plugin-version"
              label={t('tools.plugins.currentVersionLabel')}
              value={draft.currentVersion ? String(draft.currentVersion.id) : ''}
              options={versionOptions}
              onChange={handleVersionChange}
            />
          )}
        </div>

        {canAdd && (
          <div className="plugin-modal-foot">
            <button type="button" className="lum-btn plugin-btn plugin-btn--primary" onClick={handleAdd}>
              {t('tools.plugins.add')}
            </button>
          </div>
        )}
      </div>
    </div>
    </ModalPortal>
  );
}
