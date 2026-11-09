'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CloudCheck,
  CloudUpload,
  Download,
  History,
  LoaderCircle,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import ModalPortal from '@/app/components/ModalPortal';
import { useWorkspace } from '@/app/components/WorkspaceProvider';
import { summarizeWorkspace } from '@/lib/core/workspaceSchema';
import { mergeWorkspaces } from '@/app/components/workspace/useAccountSync';

function downloadJson(data, stamp) {
  const safeStamp = String(stamp).replace(/[^0-9-]/g, '').slice(0, 20) || 'backup';
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mtools-${safeStamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileStamp(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function Modal({ title, onClose, children, footer, wide = false }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.activeElement;
    panelRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  return (
    <ModalPortal>
      <div className="ws-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <div ref={panelRef} className={`ws-modal${wide ? ' ws-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
          <div className="ws-modal-head">
            <h2 className="ws-modal-title">{title}</h2>
            <button type="button" className="ws-modal-close" onClick={onClose} aria-label="×">
              <X size={18} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          <div className="ws-modal-body">{children}</div>
          {footer ? <div className="ws-modal-foot">{footer}</div> : null}
        </div>
      </div>
    </ModalPortal>
  );
}

function Summary({ summary, t, compact = false }) {
  if (!summary?.servers?.length) return <p className="ws-empty">{t('sync.empty')}</p>;
  return (
    <ul className={`ws-summary${compact ? ' ws-summary--compact' : ''}`}>
      {summary.servers.map((server) => (
        <li key={server.id} className="ws-summary-row">
          <span className="ws-summary-name">{server.name}</span>
          <span className="ws-summary-meta">
            {server.software ? <span>{server.software}</span> : null}
            {server.memory ? <span>{server.memory} GiB</span> : null}
            <span>{t('sync.pluginsCount', { n: server.plugins })}</span>
            {server.analyses ? <span>{t('sync.analysesCount', { n: server.analyses })}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TransferModal({ account, onClose }) {
  const { t } = useLocale();
  const local = account.snapshot();
  const remote = account.remote;
  const hasRemote = Boolean(remote?.servers && Object.keys(remote.servers).length);
  const [mode, setMode] = useState(hasRemote ? 'merge' : 'replace');
  const [step, setStep] = useState('choose');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const localSummary = summarizeWorkspace(local);
  const remoteSummary = summarizeWorkspace(remote);
  const resultSummary = summarizeWorkspace(
    mode === 'take' ? remote : mode === 'merge' && hasRemote ? mergeWorkspaces(remote, local) : local,
  );

  const modes = hasRemote
    ? [
      { id: 'merge', title: t('sync.modeMerge'), hint: t('sync.modeMergeHint') },
      { id: 'replace', title: t('sync.modeReplace'), hint: t('sync.modeReplaceHint') },
      { id: 'take', title: t('sync.modeTake'), hint: t('sync.modeTakeHint') },
    ]
    : [];

  const run = async () => {
    setBusy(true);
    setFailed(false);
    const result = await account.transfer(mode);
    setBusy(false);
    if (result.ok) setStep('done');
    else setFailed(true);
  };

  let body;
  let footer;
  if (step === 'done') {
    body = (
      <div className="ws-done">
        <span className="ws-done-icon"><Check size={26} strokeWidth={2.5} aria-hidden /></span>
        <p>{t('sync.done')}</p>
      </div>
    );
    footer = <button type="button" className="lum-btn lum-btn-primary" onClick={onClose}>{t('sync.close')}</button>;
  } else if (step === 'confirm') {
    body = (
      <>
        <p className="ws-lead">{t(`sync.confirm_${mode}`)}</p>
        <div className="ws-panel">
          <div className="ws-panel-title">{t('sync.result')}</div>
          <Summary summary={resultSummary} t={t} />
        </div>
        <p className="ws-note"><History size={14} aria-hidden /> {t('sync.backupNote')}</p>
        {failed ? <p className="ws-error"><TriangleAlert size={14} aria-hidden /> {t('sync.error')}</p> : null}
      </>
    );
    footer = (
      <>
        <button type="button" className="lum-btn" onClick={() => setStep('choose')} disabled={busy}>
          <ArrowLeft size={16} aria-hidden /> {t('sync.back')}
        </button>
        <button type="button" className="lum-btn lum-btn-primary" onClick={run} disabled={busy}>
          {busy ? <LoaderCircle size={16} className="ws-spin" aria-hidden /> : <CloudUpload size={16} aria-hidden />}
          {t('sync.confirm')}
        </button>
      </>
    );
  } else {
    body = (
      <>
        <p className="ws-lead">{t('sync.transferLead')}</p>
        <div className="ws-compare">
          <div className="ws-panel">
            <div className="ws-panel-title">{t('sync.here')}</div>
            <Summary summary={localSummary} t={t} compact />
          </div>
          <div className="ws-panel">
            <div className="ws-panel-title">{t('sync.account')}</div>
            <Summary summary={remoteSummary} t={t} compact />
          </div>
        </div>
        {modes.length ? (
          <div className="ws-modes" role="radiogroup">
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={mode === item.id}
                className={`ws-mode${mode === item.id ? ' is-active' : ''}`}
                onClick={() => setMode(item.id)}
              >
                <span className="ws-mode-dot" aria-hidden />
                <span className="ws-mode-text">
                  <span className="ws-mode-title">{item.title}</span>
                  <span className="ws-mode-hint">{item.hint}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </>
    );
    footer = (
      <>
        <button type="button" className="lum-btn" onClick={onClose}>{t('sync.cancel')}</button>
        <button type="button" className="lum-btn lum-btn-primary" onClick={() => setStep('confirm')}>
          {t('sync.next')}
        </button>
      </>
    );
  }

  return (
    <Modal title={t('sync.transferTitle')} onClose={busy ? () => {} : onClose} footer={footer} wide={step === 'choose'}>
      {body}
    </Modal>
  );
}

function BackupsModal({ account, onClose }) {
  const { t, locale } = useLocale();
  const [backups, setBackups] = useState(null);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [armedId, setArmedId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [restoredId, setRestoredId] = useState(null);

  const load = useCallback(async () => {
    const list = await account.listBackups();
    if (list) setBackups(list);
    else setFailed(true);
  }, [account.listBackups]);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (value) => new Date(value).toLocaleString(locale, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const download = async (backup) => {
    setBusyId(backup.id);
    const full = await account.readBackup(backup.id);
    setBusyId(null);
    if (full?.data) downloadJson(full.data, fileStamp(backup.createdAt));
  };

  const restore = async (backup) => {
    if (armedId !== backup.id) {
      setArmedId(backup.id);
      return;
    }
    setBusyId(backup.id);
    const result = await account.restore(backup.id);
    setBusyId(null);
    setArmedId(null);
    if (result.ok) {
      setRestoredId(backup.id);
      load();
    }
  };

  return (
    <Modal
      title={t('sync.backupsTitle')}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="lum-btn" onClick={() => downloadJson(account.snapshot(), fileStamp(Date.now()))}>
            <Download size={16} aria-hidden /> {t('sync.downloadCurrent')}
          </button>
          <button type="button" className="lum-btn lum-btn-primary" onClick={onClose}>{t('sync.close')}</button>
        </>
      )}
    >
      <p className="ws-lead">{t('sync.backupsLead')}</p>
      {failed ? <p className="ws-error"><TriangleAlert size={14} aria-hidden /> {t('sync.error')}</p> : null}
      {!backups && !failed ? <p className="ws-empty"><LoaderCircle size={14} className="ws-spin" aria-hidden /> {t('sync.loading')}</p> : null}
      {backups && !backups.length ? <p className="ws-empty">{t('sync.backupsEmpty')}</p> : null}
      {backups?.length ? (
        <ul className="ws-backups">
          {backups.map((backup) => {
            const open = openId === backup.id;
            const summary = backup.summary ?? { servers: [], plugins: 0, analyses: 0 };
            return (
              <li key={backup.id} className={`ws-backup${open ? ' is-open' : ''}`}>
                <div className="ws-backup-row">
                  <button type="button" className="ws-backup-main" onClick={() => setOpenId(open ? null : backup.id)} aria-expanded={open}>
                    <span className="ws-backup-date">{formatDate(backup.createdAt)}</span>
                    <span className="ws-backup-meta">
                      {t(`sync.reason_${backup.reason}`)} · {t('sync.serversCount', { n: summary.servers.length })} · {t('sync.pluginsCount', { n: summary.plugins })}
                    </span>
                    <ChevronDown size={16} className="ws-backup-chevron" aria-hidden />
                  </button>
                  <div className="ws-backup-actions">
                    <button type="button" className="lum-btn ws-icon-btn" onClick={() => download(backup)} disabled={busyId === backup.id} title={t('sync.download')} aria-label={t('sync.download')}>
                      <Download size={16} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={`lum-btn ws-restore${armedId === backup.id ? ' is-armed' : ''}`}
                      onClick={() => restore(backup)}
                      onBlur={() => setArmedId((current) => (current === backup.id ? null : current))}
                      disabled={busyId === backup.id}
                    >
                      {busyId === backup.id ? <LoaderCircle size={16} className="ws-spin" aria-hidden /> : <RotateCcw size={16} aria-hidden />}
                      {restoredId === backup.id ? t('sync.restored') : armedId === backup.id ? t('sync.restoreConfirm') : t('sync.restore')}
                    </button>
                  </div>
                </div>
                {open ? <Summary summary={summary} t={t} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </Modal>
  );
}

export default function AccountSync() {
  const { t } = useLocale();
  const { account } = useWorkspace();
  const [dialog, setDialog] = useState(null);
  const close = useCallback(() => setDialog(null), []);

  if (!account || (account.status !== 'available' && account.status !== 'synced')) return null;

  const statusText = {
    saving: t('sync.saving'),
    pending: t('sync.saving'),
    error: t('sync.retrying'),
  }[account.saving] ?? t('sync.synced');

  return (
    <div className="ws-sync">
      {account.status === 'available' ? (
        <button type="button" className="lum-btn ws-sync-cta" onClick={() => setDialog('transfer')}>
          <CloudUpload size={16} aria-hidden />
          {t('sync.toAccount')}
        </button>
      ) : (
        <>
          <span className={`ws-sync-status is-${account.saving}`} role="status">
            {account.saving === 'saving' || account.saving === 'pending'
              ? <LoaderCircle size={15} className="ws-spin" aria-hidden />
              : account.saving === 'error'
                ? <TriangleAlert size={15} aria-hidden />
                : <CloudCheck size={15} aria-hidden />}
            {statusText}
          </span>
          <button type="button" className="lum-btn ws-sync-backups" onClick={() => setDialog('backups')}>
            <History size={16} aria-hidden />
            {t('sync.backups')}
          </button>
        </>
      )}
      {account.notice === 'conflict' ? (
        <span className="ws-sync-notice">
          {t('sync.conflict')}
          <button type="button" className="ws-sync-notice-close" onClick={account.dismissNotice} aria-label={t('sync.close')}>
            <X size={14} aria-hidden />
          </button>
        </span>
      ) : null}
      {dialog === 'transfer' ? <TransferModal account={account} onClose={close} /> : null}
      {dialog === 'backups' ? <BackupsModal account={account} onClose={close} /> : null}
    </div>
  );
}
