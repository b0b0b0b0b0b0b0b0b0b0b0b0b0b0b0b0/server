'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Blocks, CheckCircle2, CircleAlert, Link2, Loader2, Upload, X } from 'lucide-react';
import LumTooltip from '@/app/components/LumTooltip';
import { useLocale } from '@/app/components/AppProviders';
import ModalPortal from '@/app/components/ModalPortal';
import RelinkPluginModal from '@/app/components/plugins/RelinkPluginModal';
import { mergeJarRelinkPlugin, resolveJarPlugins } from '@/lib/tools/plugins/resolveJarPlugin';
import { scanPluginJars } from '@/lib/tools/plugins/scanPluginJars';
import { ModrinthIcon, SpigotIcon } from '@/lib/ui/SourceIcons';

const REASON_KEYS = {
  notJar: 'tools.plugins.jarReasonNotJar',
  noManifest: 'tools.plugins.jarReasonNoManifest',
  noName: 'tools.plugins.jarReasonNoName',
  readError: 'tools.plugins.jarReasonReadError',
  duplicate: 'tools.plugins.jarReasonDuplicate',
  notFound: 'tools.plugins.jarReasonNotFound',
};

function SourceBadge({ source, t }) {
  if (source === 'modrinth') {
    return (
      <span className="plugin-jar-item-source plugin-jar-item-source--modrinth">
        <ModrinthIcon size={14} />
        {t('tools.plugins.jarSourceModrinth')}
      </span>
    );
  }
  if (source === 'spigot') {
    return (
      <span className="plugin-jar-item-source plugin-jar-item-source--spigot">
        <SpigotIcon size={14} />
        {t('tools.plugins.jarSourceSpigot')}
      </span>
    );
  }
  return null;
}

function summarizeItems(items) {
  return items.reduce((counts, item) => {
    if (item.status === 'ready') counts.ready += 1;
    else if (item.status === 'skipped') counts.skipped += 1;
    else if (item.status === 'notFound') counts.notFound += 1;
    else if (item.status === 'failed') counts.failed += 1;
    return counts;
  }, { ready: 0, skipped: 0, notFound: 0, failed: 0 });
}

export default function ImportJarsModal({
  open,
  software,
  gameVersion,
  existingPlugins,
  onClose,
  onImport,
  onNotify,
}) {
  const { t } = useLocale();
  const fetchOptions = useMemo(() => ({ software, gameVersion }), [software, gameVersion]);
  const inputId = useId();
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const onNotifyRef = useRef(onNotify);
  const tRef = useRef(t);
  const dropPulseTimerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dropPulse, setDropPulse] = useState(false);
  const [phase, setPhase] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [relinkItem, setRelinkItem] = useState(null);

  const reset = useCallback(() => {
    if (!mountedRef.current) return;
    setDragging(false);
    setDropPulse(false);
    setPhase(null);
    setProgress({ done: 0, total: 0 });
    setItems([]);
    setSelected(new Set());
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    onNotifyRef.current = onNotify;
    tRef.current = t;
    return () => {
      mountedRef.current = false;
      if (dropPulseTimerRef.current) clearTimeout(dropPulseTimerRef.current);
    };
  }, [onNotify, t]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !phase) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, phase, onClose]);

  useEffect(() => {
    if (open) return undefined;
    reset();
    return undefined;
  }, [open, reset]);

  const selectReadyItem = useCallback((entry) => {
    if (entry.status !== 'ready' || !entry.plugin) return;
    const key = `${entry.plugin.type}:${entry.plugin.id}`;
    setSelected((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
  }, []);

  const runImport = async (fileList) => {
    const files = [...fileList];
    if (!files.length || !mountedRef.current) return;

    setDropPulse(true);
    if (dropPulseTimerRef.current) clearTimeout(dropPulseTimerRef.current);
    dropPulseTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setDropPulse(false);
    }, 560);

    setPhase('parse');
    setItems([]);
    setSelected(new Set());
    setProgress({ done: 0, total: files.length });

    const parsedQueue = [];

    try {
      const parsed = await scanPluginJars(files, {
        onProgress: (done, total) => {
          if (!mountedRef.current) return;
          setProgress({ done, total });
        },
        onItem: (result) => {
          if (!mountedRef.current) return;
          if (result.status === 'parsed') {
            parsedQueue.push(result);
            setItems((current) => [
              ...current,
              {
                fileName: result.fileName,
                name: result.name,
                version: result.version,
                manifest: result.manifest,
                status: 'resolving',
              },
            ]);
            return;
          }
          setItems((current) => [...current, result]);
        },
      });

      if (!mountedRef.current) return;

      if (!parsed.parsed.length) {
        setPhase(null);
        return;
      }

      setPhase('resolve');
      setProgress({ done: 0, total: parsed.parsed.length });

      await resolveJarPlugins(
        parsed.parsed,
        existingPlugins,
        fetchOptions,
        {
          onProgress: (done, total) => {
            if (!mountedRef.current) return;
            setProgress({ done, total });
          },
          onItem: (entry) => {
            if (!mountedRef.current) return;
            setItems((current) => current.map((item) => (
              item.fileName === entry.fileName ? entry : item
            )));
            selectReadyItem(entry);
          },
        },
      );
    } catch (error) {
      if (mountedRef.current) {
        onNotifyRef.current('error', `${tRef.current('tools.plugins.jarScanFailed')} ${error.message}`);
      }
    } finally {
      if (mountedRef.current) setPhase(null);
    }
  };

  const handleFiles = (fileList) => {
    if (phase) return;
    runImport(fileList);
  };

  const itemKey = (item) => (
    item.plugin ? `${item.plugin.type}:${item.plugin.id}` : item.fileName
  );

  const toggleItem = (key) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const counts = useMemo(() => summarizeItems(items), [items]);
  const readyItems = useMemo(
    () => items.filter((item) => item.status === 'ready'),
    [items],
  );

  const handleImport = () => {
    if (!readyItems.length) return;
    const plugins = readyItems
      .filter((item) => selected.has(itemKey(item)))
      .map((item) => item.plugin);
    if (!plugins.length) return;

    const { added } = onImport(plugins);
    onNotify(
      'success',
      t('tools.plugins.jarImported', {
        added,
        skipped: counts.skipped + (plugins.length - added),
        failed: counts.failed,
      }),
    );
    onClose();
  };

  const reasonLabel = (reason) => {
    const key = REASON_KEYS[reason];
    return key ? t(key) : reason;
  };

  const relinkExistingPlugins = useMemo(() => {
    const fromScan = readyItems
      .filter((item) => !relinkItem || itemKey(item) !== itemKey(relinkItem))
      .map((item) => item.plugin);
    return [...existingPlugins, ...fromScan];
  }, [existingPlugins, readyItems, relinkItem]);

  const handleRelinkSave = (merged) => {
    if (!relinkItem) return;
    const oldKey = itemKey(relinkItem);
    const newKey = `${merged.type}:${merged.id}`;
    const nextSource = merged.type === 'spigot' ? 'spigot' : 'modrinth';

    const duplicateInBatch = readyItems.some(
      (item) => itemKey(item) !== oldKey
        && item.plugin?.type === merged.type
        && String(item.plugin?.id) === String(merged.id),
    );
    if (duplicateInBatch) {
      onNotify('warn', t('tools.plugins.alreadyAdded'));
      return;
    }

    setItems((current) => current.map((item) => {
      if (itemKey(item) !== oldKey) return item;
      return {
        ...item,
        plugin: merged,
        source: nextSource,
        name: item.name ?? relinkItem.name,
      };
    }));

    setSelected((current) => {
      const nextSelected = new Set(current);
      const wasSelected = nextSelected.has(oldKey);
      nextSelected.delete(oldKey);
      if (wasSelected) nextSelected.add(newKey);
      return nextSelected;
    });
    setRelinkItem(null);
    onNotify('success', t('tools.plugins.relinkSaved'));
  };

  if (!open) return null;

  const selectedCount = readyItems.filter((item) => selected.has(itemKey(item))).length;
  const progressPercent = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;
  const showResults = items.length > 0;

  return (
    <>
    <ModalPortal>
      <div className="plugin-modal-backdrop" onClick={phase ? undefined : onClose} role="presentation">
      <div
        className="plugin-modal plugin-modal--jars"
        role="dialog"
        aria-modal="true"
        aria-labelledby="plugin-jars-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="plugin-modal-head">
          <h2 className="plugin-modal-title" id="plugin-jars-title">
            <Blocks size={24} />
            {t('tools.plugins.importJarsTitle')}
          </h2>
          <button
            type="button"
            className="lum-btn plugin-btn plugin-btn--icon plugin-modal-close"
            onClick={onClose}
            disabled={Boolean(phase)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="plugin-modal-body lum-scroll">
          <p className="field-hint">{t('tools.plugins.importJarsDesc')}</p>

          <div
            className={[
              'plugin-jar-drop',
              dragging ? 'is-dragging' : '',
              phase ? 'is-busy' : '',
              dropPulse ? 'is-dropped' : '',
            ].filter(Boolean).join(' ')}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setDragging(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
          >
            <Upload size={28} strokeWidth={1.75} />
            <p className="plugin-jar-drop-title">{t('tools.plugins.importJarsDrop')}</p>
            <p className="plugin-jar-drop-hint">{t('tools.plugins.importJarsHint')}</p>
            <label className="lum-btn plugin-btn plugin-btn--accent" htmlFor={inputId}>
              {t('tools.plugins.importJarsBrowse')}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept=".jar,application/java-archive"
              multiple
              className="plugin-jar-input"
              disabled={Boolean(phase)}
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = '';
              }}
            />
          </div>

          {phase && (
            <div className="plugin-jar-progress-wrap">
              <div className="plugin-jar-progress-track">
                <div
                  className="plugin-jar-progress-bar"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="plugin-jar-status">
                <Loader2 size={16} className="spin" />
                {phase === 'parse'
                  ? t('tools.plugins.importJarsParsing', progress)
                  : t('tools.plugins.importJarsResolving', progress)}
              </p>
            </div>
          )}

          {showResults && (
            <div className={`plugin-jar-results${phase ? ' is-streaming' : ''}`}>
              {!phase && (
                <div className="plugin-jar-summary">
                  <span className="plugin-jar-summary-item plugin-jar-summary-item--ok">
                    <CheckCircle2 size={14} />
                    {t('tools.plugins.importJarsFound', { count: counts.ready })}
                  </span>
                  <span className="plugin-jar-summary-item plugin-jar-summary-item--skip">
                    {t('tools.plugins.importJarsSkipped', { count: counts.skipped })}
                  </span>
                  <span className="plugin-jar-summary-item plugin-jar-summary-item--unknown">
                    {t('tools.plugins.importJarsNotFound', { count: counts.notFound })}
                  </span>
                  <span className="plugin-jar-summary-item plugin-jar-summary-item--fail">
                    <CircleAlert size={14} />
                    {t('tools.plugins.importJarsFailed', { count: counts.failed })}
                  </span>
                </div>
              )}

              <ul className="plugin-jar-list">
                {items.map((item, index) => (
                  <li
                    key={item.fileName}
                    className={`plugin-jar-item plugin-jar-item--${item.status}`}
                    style={{ '--jar-item-delay': `${Math.min(index, 12) * 40}ms` }}
                  >
                    {item.status === 'ready' ? (
                      <div className="plugin-jar-item-ready">
                        <label className="plugin-jar-item-ready-main">
                          <span className="plugin-jar-item-main">
                            <strong>{item.plugin.name}</strong>
                            <span className="plugin-jar-item-file">{item.fileName}</span>
                          </span>
                          <SourceBadge source={item.source} t={t} />
                          <span className="plugin-jar-item-version">
                            {item.version
                              ? t('tools.plugins.jarVersion', { version: item.version })
                              : t('tools.plugins.jarNoVersion')}
                          </span>
                          <span className="lum-toggle">
                            <input
                              type="checkbox"
                              checked={selected.has(itemKey(item))}
                              onChange={() => toggleItem(itemKey(item))}
                            />
                            <span className="lum-toggle-track" />
                          </span>
                        </label>
                        <LumTooltip content={t('tools.plugins.tooltips.relink')} side="left">
                          <button
                            type="button"
                            className="lum-btn plugin-btn plugin-btn--icon plugin-jar-relink"
                            onClick={() => setRelinkItem(item)}
                            aria-label={t('tools.plugins.relinkPlugin')}
                          >
                            <Link2 size={15} />
                          </button>
                        </LumTooltip>
                      </div>
                    ) : item.status === 'resolving' ? (
                      <div className="plugin-jar-item-static plugin-jar-item-resolving">
                        <span className="plugin-jar-item-main">
                          <strong>{item.name ?? item.fileName}</strong>
                          <span className="plugin-jar-item-file">{item.fileName}</span>
                        </span>
                        <span className="plugin-jar-item-reason plugin-jar-item-reason--pending">
                          <Loader2 size={13} className="spin" />
                          {t('tools.plugins.jarResolving')}
                        </span>
                      </div>
                    ) : (
                      <div className="plugin-jar-item-static">
                        <span className="plugin-jar-item-main">
                          <strong>{item.plugin?.name ?? item.name ?? item.fileName}</strong>
                          {(item.plugin?.name || item.name) && (
                            <span className="plugin-jar-item-file">{item.fileName}</span>
                          )}
                        </span>
                        <span className="plugin-jar-item-reason">{reasonLabel(item.reason)}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {!phase && items.length === 0 && (
                <p className="plugin-jar-empty">{t('tools.plugins.importJarsNoFiles')}</p>
              )}
            </div>
          )}
        </div>

        {readyItems.length > 0 && !phase && (
          <div className="plugin-modal-foot">
            <button
              type="button"
              className="lum-btn plugin-btn plugin-btn--primary"
              onClick={handleImport}
              disabled={selectedCount === 0}
            >
              {t('tools.plugins.importJarsAdd', { count: selectedCount })}
            </button>
          </div>
        )}
      </div>
    </div>
    </ModalPortal>

    {relinkItem?.plugin && (
      <RelinkPluginModal
        open
        plugin={relinkItem.plugin}
        software={software}
        gameVersion={gameVersion}
        existingPlugins={relinkExistingPlugins}
        mergePlugin={(_, draft) => mergeJarRelinkPlugin(relinkItem, draft)}
        onClose={() => setRelinkItem(null)}
        onSave={handleRelinkSave}
        onNotify={onNotify}
      />
    )}
    </>
  );
}
