'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';
import { ServerCard } from '@/app/components/ping/ServerCard';
import { ServerInput } from '@/app/components/ping/ServerInput';
import { PlayerSearch } from '@/app/components/ping/PlayerSearch';
import { PlayerCard } from '@/app/components/ping/PlayerCard';
import { MinecraftServer } from '@/app/components/ping/MinecraftServer';
import { MinecraftPlayer } from '@/app/components/ping/MinecraftPlayer';
import { PortValidator } from '@/app/components/ping/PortValidator';
import { setPingTranslator } from '@/app/components/ping/pingText';

function writeAddressToUrl(address) {
  const url = new URL(window.location.href);
  if (address) url.searchParams.set('s', address);
  else url.searchParams.delete('s');
  window.history.replaceState({}, '', url.pathname + url.search);
}

export default function PingClient() {
  const { t } = useLocale();
  setPingTranslator(t);
  const [server, setServer] = useState(null);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [initialAddress, setInitialAddress] = useState(undefined);
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  const searchServer = useCallback(async (address) => {
    const parsed = PortValidator.parseAddress(address);
    const canonical = parsed.valid ? PortValidator.formatAddress(parsed.host, parsed.port) : address;
    setServerLoading(true);
    setServerError(null);
    setServer(null);
    setInitialAddress(canonical);
    writeAddressToUrl(canonical);
    if (!parsed.valid) {
      setServerLoading(false);
      setServerError(parsed.error);
      return;
    }
    const next = new MinecraftServer(canonical);
    try {
      await next.ping();
      setServer(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setServer(next);
      setServerError(!message || message.includes('Failed to ping') ? t('tools.ping.offline') : message);
    } finally {
      setServerLoading(false);
    }
  }, [t]);

  const refreshServer = useCallback(async () => {
    if (!server) return;
    setServerLoading(true);
    setServerError(null);
    try {
      await server.refresh();
    } catch {
      setServerError(t('tools.ping.refreshFailed'));
    } finally {
      setServerLoading(false);
    }
  }, [server, t]);

  const searchPlayer = useCallback(async (username) => {
    setPlayerLoading(true);
    setPlayerError(null);
    setPlayer(null);
    const next = new MinecraftPlayer(username);
    try {
      await next.fetch();
      setPlayer(next);
    } catch {
      setPlayerError(t('tools.ping.playerNotFound'));
    } finally {
      setPlayerLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const address = new URLSearchParams(window.location.search).get('s');
    setReady(true);
    if (address) searchServer(address);
  }, [searchServer]);

  return (
    <section className="tool-page ping-page">
      <header className="tool-page-head">
        <h1 className="tool-page-title">
          <span className="tool-page-title-icon tool-page-title-icon--ping">
            <Activity size={20} strokeWidth={2} aria-hidden />
          </span>
          {t('tools.ping.title')}
        </h1>
        <p className="tool-page-desc">{t('tools.ping.description')}</p>
      </header>

      <div className="ping-section">
        <h2 className="ping-section-title">{t('tools.ping.serverTitle')}</h2>
        <p className="ping-section-hint">{t('tools.ping.serverHint')}</p>
        {ready && (
          <ServerInput onSearch={searchServer} loading={serverLoading} initialValue={initialAddress} />
        )}

        {serverError && <div className="notification error">{serverError}</div>}

        {serverLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('tools.ping.connecting')}</p>
          </div>
        )}

        {!serverLoading && server && (
          <div className="result-container">
            <ServerCard server={server} onRefresh={refreshServer} />
          </div>
        )}
      </div>

      <div className="ping-divider"></div>

      <div className="ping-section">
        <PlayerSearch onSearch={searchPlayer} loading={playerLoading} />

        {playerError && <div className="notification error">{playerError}</div>}

        {playerLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{t('tools.ping.loadingPlayer')}</p>
          </div>
        )}

        {!playerLoading && player && (
          <div className="result-container">
            <PlayerCard player={player} />
          </div>
        )}
      </div>
    </section>
  );
}
