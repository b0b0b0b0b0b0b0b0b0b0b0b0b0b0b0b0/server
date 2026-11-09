'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WorkspaceStore } from '@/lib/core/WorkspaceStore';
import { sanitizeWorkspace } from '@/lib/core/workspaceSchema';

const LINK_KEY = 'server-tools.workspace.account';
const BROWSER_BACKUP_KEY = 'server-tools.workspace.browser-backup';
const SAVE_DELAY_MS = 1200;
const RETRY_DELAY_MS = 6000;

function readLink() {
  try {
    return window.localStorage.getItem(LINK_KEY);
  } catch {
    return null;
  }
}

function writeLink(userId) {
  try {
    if (userId === null) window.localStorage.removeItem(LINK_KEY);
    else window.localStorage.setItem(LINK_KEY, String(userId));
  } catch {}
}

function backupBrowserCopy(store) {
  if (!store) return;
  try {
    window.localStorage.setItem(
      BROWSER_BACKUP_KEY,
      JSON.stringify({ savedAt: new Date().toISOString(), workspace: store.snapshot() }),
    );
  } catch {}
}

function cleanSnapshot(store) {
  return store ? sanitizeWorkspace(store.snapshot()) : null;
}

export function mergeWorkspaces(remote, local) {
  const merged = {
    ...local,
    servers: { ...(remote?.servers ?? {}) },
    serverOrder: [...(remote?.serverOrder ?? Object.keys(remote?.servers ?? {}))],
  };
  for (const id of local.serverOrder ?? Object.keys(local.servers)) {
    if (!Object.hasOwn(local.servers, id)) continue;
    merged.servers[id] = local.servers[id];
    if (!merged.serverOrder.includes(id)) merged.serverOrder.push(id);
  }
  return sanitizeWorkspace(merged);
}

async function request(method, payload) {
  const res = await fetch('/api/workspace', {
    method,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: method === 'POST' ? { 'content-type': 'application/json' } : undefined,
    body: method === 'POST' ? JSON.stringify(payload) : undefined,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body: body && typeof body === 'object' ? body : {} };
}

export function useAccountSync(workspace, setWorkspace, localize) {
  const [state, setState] = useState({ status: 'unknown', saving: 'idle', notice: null, remote: null, revision: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;
  const workspaceRef = useRef(workspace);
  workspaceRef.current = workspace;
  const lastSyncedRef = useRef(null);
  const timerRef = useRef(null);
  const inflightRef = useRef(false);
  const userIdRef = useRef(null);

  const update = useCallback((patch) => setState((current) => ({ ...current, ...patch })), []);

  const adopt = useCallback((data, revision, { keepBrowserCopy = true } = {}) => {
    const clean = sanitizeWorkspace(data);
    if (!clean) return false;
    if (keepBrowserCopy) backupBrowserCopy(workspaceRef.current);
    const store = new WorkspaceStore(clean);
    localize(store);
    lastSyncedRef.current = JSON.stringify(cleanSnapshot(store));
    setWorkspace(store);
    update({ status: 'synced', revision, remote: null, saving: 'saved' });
    return true;
  }, [localize, setWorkspace, update]);

  const pull = useCallback(async ({ initial = false } = {}) => {
    const { status, body } = await request('GET').catch(() => ({ status: 0, body: {} }));
    if (status === 401 || status === 0 || status >= 500 || !Number.isSafeInteger(body.userId)) {
      if (initial || status === 401) update({ status: 'guest', remote: null });
      return;
    }
    userIdRef.current = body.userId;
    const remote = body.workspace ? sanitizeWorkspace(body.workspace) : null;
    const linked = readLink() === String(body.userId);
    if (linked && remote) {
      if (initial || body.revision > stateRef.current.revision) {
        if (!initial) update({ notice: 'conflict' });
        adopt(remote, body.revision);
      }
      return;
    }
    if (linked && !remote) writeLink(null);
    update({ status: 'available', remote, revision: body.revision || 0 });
  }, [adopt, update]);

  useEffect(() => {
    if (!workspace || stateRef.current.status !== 'unknown') return;
    update({ status: 'checking' });
    pull({ initial: true });
  }, [workspace, pull, update]);

  const save = useCallback(async () => {
    timerRef.current = null;
    if (inflightRef.current || stateRef.current.status !== 'synced') return;
    const clean = cleanSnapshot(workspaceRef.current);
    if (!clean) return;
    const json = JSON.stringify(clean);
    if (json === lastSyncedRef.current) {
      update({ saving: 'saved' });
      return;
    }
    inflightRef.current = true;
    update({ saving: 'saving' });
    const { status, body } = await request('POST', {
      action: 'save',
      reason: 'auto',
      baseRevision: stateRef.current.revision,
      workspace: clean,
    }).catch(() => ({ status: 0, body: {} }));
    inflightRef.current = false;
    if (status === 200 && Number.isSafeInteger(body.revision)) {
      lastSyncedRef.current = json;
      update({ saving: 'saved', revision: body.revision });
      return;
    }
    if (status === 409) {
      await pull();
      return;
    }
    if (status === 401) {
      update({ status: 'guest', saving: 'idle' });
      return;
    }
    update({ saving: 'error' });
    timerRef.current = window.setTimeout(save, RETRY_DELAY_MS);
  }, [pull, update]);

  useEffect(() => {
    if (!workspace || state.status !== 'synced') return undefined;
    const json = JSON.stringify(cleanSnapshot(workspace));
    if (json === lastSyncedRef.current) return undefined;
    update({ saving: 'pending' });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(save, SAVE_DELAY_MS);
    return undefined;
  }, [workspace, state.status, save, update]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      const current = stateRef.current;
      if (current.status === 'synced' && !timerRef.current && !inflightRef.current) pull();
      else if (current.status === 'guest' || current.status === 'available') pull({ initial: current.status === 'guest' });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') onFocus();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pull]);

  const transfer = useCallback(async (mode) => {
    const local = cleanSnapshot(workspaceRef.current);
    const remote = stateRef.current.remote;
    const userId = userIdRef.current;
    if (!local || !Number.isSafeInteger(userId)) return { ok: false };

    if (mode === 'take') {
      if (!remote) return { ok: false };
      writeLink(userId);
      adopt(remote, stateRef.current.revision);
      return { ok: true };
    }

    const payload = mode === 'merge' && remote ? mergeWorkspaces(remote, local) : local;
    if (!payload) return { ok: false };
    const reason = mode === 'merge' && remote ? 'merge' : 'transfer';
    const { status, body } = await request('POST', { action: 'save', reason, workspace: payload })
      .catch(() => ({ status: 0, body: {} }));
    if (status !== 200 || !Number.isSafeInteger(body.revision)) return { ok: false, error: body.error };
    writeLink(userId);
    if (reason === 'merge') {
      adopt(payload, body.revision);
    } else {
      lastSyncedRef.current = JSON.stringify(payload);
      update({ status: 'synced', revision: body.revision, remote: null, saving: 'saved' });
    }
    return { ok: true };
  }, [adopt, update]);

  const listBackups = useCallback(async () => {
    const { status, body } = await request('POST', { action: 'backups' }).catch(() => ({ status: 0, body: {} }));
    return status === 200 && Array.isArray(body.backups) ? body.backups : null;
  }, []);

  const readBackup = useCallback(async (id) => {
    if (!Number.isSafeInteger(id)) return null;
    const { status, body } = await request('POST', { action: 'backup', id }).catch(() => ({ status: 0, body: {} }));
    if (status !== 200 || !body.backup) return null;
    return { ...body.backup, data: sanitizeWorkspace(body.backup.data) };
  }, []);

  const restore = useCallback(async (id) => {
    if (!Number.isSafeInteger(id)) return { ok: false };
    const { status, body } = await request('POST', { action: 'restore', id }).catch(() => ({ status: 0, body: {} }));
    if (status !== 200 || !Number.isSafeInteger(body.revision)) return { ok: false };
    if (Number.isSafeInteger(userIdRef.current)) writeLink(userIdRef.current);
    adopt(body.workspace, body.revision);
    return { ok: true };
  }, [adopt]);

  const dismissNotice = useCallback(() => update({ notice: null }), [update]);

  return {
    ...state,
    transfer,
    listBackups,
    readBackup,
    restore,
    dismissNotice,
    snapshot: () => cleanSnapshot(workspaceRef.current),
  };
}
