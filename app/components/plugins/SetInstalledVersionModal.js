'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Package, X } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import ModalPortal from '@/app/components/ModalPortal';
import LumDropdown from '@/app/components/LumDropdown';
import PluginModalNotice from '@/app/components/plugins/PluginModalNotice';
import { refreshPlugin } from '@/lib/tools/plugins/PluginRegistry';
import { formatPluginDate, spigotVersionsNeedRefresh } from '@/lib/tools/plugins/pluginUtils';

export default function SetInstalledVersionModal({
  open,
  plugin,
  software,
  gameVersion,
  onClose,
  onSave,
}) {
  const { t, locale } = useLocale();
  const fetchOptions = useMemo(
    () => ({ software, gameVersion, allVersions: true }),
    [software, gameVersion],
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const pluginRef = useRef(plugin);
  pluginRef.current = plugin;

  const pluginKey = plugin ? `${plugin.type}:${plugin.id}` : '';

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setSelectedId('');
      setLoading(false);
      setNotice(null);
      return undefined;
    }

    const currentPlugin = pluginRef.current;
    if (!currentPlugin) return undefined;

    let cancelled = false;

    const load = async () => {
      if (currentPlugin.versions?.length && !spigotVersionsNeedRefresh(currentPlugin)) {
        setDraft(currentPlugin);
        setSelectedId(String(currentPlugin.currentVersion?.id ?? currentPlugin.versions[0]?.id ?? ''));
        return;
      }

      setLoading(true);
      setNotice(null);
      try {
        const refreshed = await refreshPlugin(currentPlugin, fetchOptions);
        if (cancelled) return;
        setDraft(refreshed);
        setSelectedId(String(refreshed.currentVersion?.id ?? refreshed.versions?.[0]?.id ?? ''));
      } catch (error) {
        if (!cancelled) {
          setNotice({ type: 'error', message: `${t('tools.plugins.fetchError')} ${error.message}` });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, pluginKey, fetchOptions, t]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, loading, onClose]);

  const versionOptions = useMemo(() => {
    if (!draft?.versions?.length) return [];

    const options = draft.versions.map((version) => {
      const dateLabel = formatPluginDate(version.releaseDate, locale);
      return {
        value: String(version.id),
        label: dateLabel ? `${version.name} (${dateLabel})` : version.name,
      };
    });

    const currentId = draft.currentVersion?.id;
    if (
      currentId
      && !draft.versions.some((version) => String(version.id) === String(currentId))
    ) {
      options.unshift({
        value: String(currentId),
        label: draft.currentVersion.name,
      });
    }

    return options;
  }, [draft, locale]);

  const handleSave = () => {
    if (!draft || !selectedId) return;

    const fromList = draft.versions?.find((version) => String(version.id) === selectedId);
    const nextVersion = fromList
      ?? (String(draft.currentVersion?.id) === selectedId ? draft.currentVersion : null);

    if (!nextVersion) return;

    onSave({
      ...draft,
      currentVersion: nextVersion,
      updateDate: new Date(),
    });
    onClose();
  };

  if (!open || !plugin) return null;

  const canSave = Boolean(selectedId && versionOptions.length);

  return (
    <ModalPortal>
      <div className="plugin-modal-backdrop" onClick={loading ? undefined : onClose} role="presentation">
        <div
          className="plugin-modal plugin-modal--version"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plugin-version-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="plugin-modal-head">
            <h2 className="plugin-modal-title" id="plugin-version-title">
              <Package size={24} />
              {t('tools.plugins.changeVersion')}
            </h2>
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--icon plugin-modal-close"
              onClick={onClose}
              disabled={loading}
            >
              <X size={18} />
            </button>
          </div>

          <div className="plugin-modal-body lum-scroll">
            <p className="field-hint">{t('tools.plugins.changeVersionDesc')}</p>

            <div className="plugin-relink-current">
              <span className="plugin-relink-current-label">{plugin.name}</span>
              {plugin.currentVersion?.name && (
                <span className="plugin-relink-current-version">
                  {t('tools.plugins.current')}: {plugin.currentVersion.name}
                </span>
              )}
            </div>

            <PluginModalNotice notice={notice} />

            {loading && (
              <p className="plugin-modal-status">
                <Loader2 size={16} className="spin" />
                {t('tools.plugins.loading')}
              </p>
            )}

            {!loading && versionOptions.length > 0 && (
              <LumDropdown
                id="plugin-installed-version"
                label={t('tools.plugins.currentVersionLabel')}
                value={selectedId}
                options={versionOptions}
                onChange={setSelectedId}
              />
            )}

            {!loading && draft && !versionOptions.length && !notice && (
              <p className="plugin-modal-status">{t('tools.plugins.noVersions')}</p>
            )}
          </div>

          <div className="plugin-modal-foot">
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--primary"
              onClick={handleSave}
              disabled={!canSave || loading}
            >
              {t('tools.plugins.changeVersionSave')}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
