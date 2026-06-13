'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Package, X } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import ModalPortal from '@/app/components/ModalPortal';
import LumDropdown from '@/app/components/LumDropdown';
import { refreshPlugin } from '@/lib/tools/plugins/PluginRegistry';
import { formatPluginDate } from '@/lib/tools/plugins/pluginUtils';

export default function SetInstalledVersionModal({
  open,
  plugin,
  software,
  onClose,
  onSave,
  onNotify,
}) {
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(null);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!open || !plugin) return undefined;

    let cancelled = false;

    const load = async () => {
      if (plugin.versions?.length) {
        setDraft(plugin);
        setSelectedId(String(plugin.currentVersion?.id ?? plugin.versions[0]?.id ?? ''));
        return;
      }

      setLoading(true);
      try {
        const refreshed = await refreshPlugin(plugin, software);
        if (cancelled) return;
        setDraft(refreshed);
        setSelectedId(String(refreshed.currentVersion?.id ?? refreshed.versions?.[0]?.id ?? ''));
      } catch (error) {
        if (!cancelled) {
          onNotify('error', `${t('tools.plugins.fetchError')} ${error.message}`);
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      setDraft(null);
      setSelectedId('');
      setLoading(false);
    };
  }, [open, plugin, software, onClose, onNotify, t]);

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

    const options = draft.versions.map((version) => ({
      value: String(version.id),
      label: `${version.name} (${formatPluginDate(version.releaseDate, locale)})`,
    }));

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

  const canSave = Boolean(selectedId && draft?.versions?.length);

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

            {!loading && draft && !versionOptions.length && (
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
