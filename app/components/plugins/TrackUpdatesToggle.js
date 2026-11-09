'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, ExternalLink, LoaderCircle } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import { useWorkspace } from '@/app/components/WorkspaceProvider';

const PROJECT_ID_RE = /^[A-Za-z0-9]{6,12}$/;
const SENT_KEY = 'server-tools.track.sent';
const SEND_DELAY_MS = 2500;
const UPDATES_URL = 'https://modrinth.black/account?tab=updates';

function readSent() {
  try {
    const list = JSON.parse(window.sessionStorage.getItem(SENT_KEY) || '[]');
    return new Set(Array.isArray(list) ? list.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeSent(set) {
  try {
    window.sessionStorage.setItem(SENT_KEY, JSON.stringify([...set].slice(-2000)));
  } catch {}
}

export default function TrackUpdatesToggle() {
  const { t } = useLocale();
  const { ready, workspace, account, patch } = useWorkspace();
  const [state, setState] = useState({ phase: 'idle', added: 0 });
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  const enabled = Boolean(workspace?.trackUpdates);
  const signedIn = account?.status === 'available' || account?.status === 'synced';

  const modrinthIds = useMemo(() => {
    if (!workspace) return [];
    const ids = new Set();
    for (const server of Object.values(workspace.servers)) {
      for (const plugin of server.plugins?.list ?? []) {
        if (plugin?.type === 'modrinth' && typeof plugin.id === 'string' && PROJECT_ID_RE.test(plugin.id)) ids.add(plugin.id);
      }
    }
    return [...ids].sort();
  }, [workspace]);
  const idsKey = modrinthIds.join(',');

  useEffect(() => {
    if (!enabled || !signedIn || !modrinthIds.length) return undefined;
    const pending = modrinthIds.filter((id) => !readSent().has(id));
    if (!pending.length) {
      setState((current) => (current.phase === 'idle' ? { phase: 'ok', added: 0 } : current));
      return undefined;
    }
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      timerRef.current = null;
      if (busyRef.current) return;
      busyRef.current = true;
      setState((current) => ({ ...current, phase: 'syncing' }));
      const batch = pending.slice(0, 200);
      try {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ projectIds: batch }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          const sent = readSent();
          batch.forEach((id) => sent.add(id));
          writeSent(sent);
          setState((current) => ({ phase: 'ok', added: current.added + (Number(body.added) || 0) }));
        } else {
          setState((current) => ({ ...current, phase: res.status === 429 ? 'rate' : 'error' }));
        }
      } catch {
        setState((current) => ({ ...current, phase: 'error' }));
      } finally {
        busyRef.current = false;
      }
    }, SEND_DELAY_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [enabled, signedIn, idsKey]);

  if (!ready || !signedIn) return null;

  let status = null;
  if (enabled) {
    if (!modrinthIds.length) status = t('tools.plugins.track.none');
    else if (state.phase === 'syncing') status = t('tools.plugins.track.syncing');
    else if (state.phase === 'error') status = t('tools.plugins.track.error');
    else if (state.phase === 'rate') status = t('tools.plugins.track.rate');
    else if (state.added) status = t('tools.plugins.track.added', { n: state.added });
    else status = t('tools.plugins.track.ok', { n: modrinthIds.length });
  }

  return (
    <div className={`plugin-track${enabled ? ' is-on' : ''}`}>
      <label className="plugin-track-main" htmlFor="plugin-track-updates">
        <span className="plugin-track-icon" aria-hidden>
          <BellRing size={18} />
        </span>
        <span className="plugin-track-text">
          <span className="plugin-track-title">{t('tools.plugins.track.title')}</span>
          <span className="plugin-track-hint">{t('tools.plugins.track.hint')}</span>
        </span>
        <span className="lum-toggle">
          <input
            id="plugin-track-updates"
            type="checkbox"
            checked={enabled}
            onChange={(event) => {
              const next = event.target.checked;
              setState({ phase: 'idle', added: 0 });
              patch((store) => { store.trackUpdates = next; });
            }}
          />
          <span className="lum-toggle-track" />
        </span>
      </label>
      {enabled ? (
        <div className="plugin-track-status">
          <span className={`plugin-track-state is-${state.phase}`}>
            {state.phase === 'syncing' ? <LoaderCircle size={14} className="ws-spin" aria-hidden /> : null}
            {status}
          </span>
          <a className="plugin-track-link" href={UPDATES_URL} target="_blank" rel="noopener noreferrer">
            {t('tools.plugins.track.open')}
            <ExternalLink size={13} aria-hidden />
          </a>
        </div>
      ) : null}
    </div>
  );
}
