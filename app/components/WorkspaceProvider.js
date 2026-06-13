'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/app/components/AppProviders';
import { WorkspaceStore } from '@/lib/core/WorkspaceStore';

const DEFAULT_SERVER_NAMES = {
  en: 'My Server',
  ru: 'Мой сервер',
  kk: 'Менің серверім',
  de: 'Mein Server',
  fr: 'Mon serveur',
  es: 'Mi servidor',
  pl: 'Mój serwer',
  nl: 'Mijn server',
  ja: 'マイサーバー',
  zh: '我的服务器',
  tr: 'Sunucum',
  vi: 'Máy chủ của tôi',
  ko: '내 서버',
  hi: 'मेरा सर्वर',
  ar: 'خادمي',
  fa: 'سرور من',
  he: 'השרת שלי',
};

function localizeDefaultServerNames(store, locale) {
  const target = DEFAULT_SERVER_NAMES[locale] ?? DEFAULT_SERVER_NAMES.en;
  const legacy = new Set(Object.values(DEFAULT_SERVER_NAMES));

  Object.values(store.servers).forEach((server) => {
    if (legacy.has(server.name)) {
      server.name = target;
    }
  });
}

const WorkspaceContext = createContext(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace outside provider');
  }
  return ctx;
}

export default function WorkspaceProvider({ children }) {
  const { locale } = useLocale();
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    const store = WorkspaceStore.load(window.localStorage);
    localizeDefaultServerNames(store, locale);
    setWorkspace(store);
  }, []);

  useEffect(() => {
    if (!workspace) return;
    setWorkspace((current) => {
      const next = current.clone();
      localizeDefaultServerNames(next, locale);
      return next;
    });
  }, [locale]);

  useEffect(() => {
    if (!workspace) return;
    workspace.save(window.localStorage);
  }, [workspace]);

  const patch = useCallback((mutator) => {
    setWorkspace((current) => {
      if (!current) return current;
      const next = current.clone();
      mutator(next);
      return next;
    });
  }, []);

  const value = useMemo(() => {
    if (!workspace) {
      return {
        ready: false,
        workspace: null,
        patch,
        activeServerId: null,
        activeServer: null,
        serverList: [],
        pluginsFilter: 'all',
      };
    }

    return {
      ready: true,
      workspace,
      patch,
      activeServerId: workspace.activeServerId,
      activeServer: workspace.activeServer,
      serverList: workspace.serverList,
      pluginsFilter: workspace.pluginsFilter,
    };
  }, [workspace, patch]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
