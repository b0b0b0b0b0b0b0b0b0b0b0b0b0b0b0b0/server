'use client';

import { useEffect, useState } from 'react';
import LumTooltip from '@/app/components/LumTooltip';
import '@/styles/services-nav.css';


const TEXT = {
  ru: {
    aria: 'Сервисы modrinth.black',
    more: 'Ещё сервисы',
    here: 'Вы здесь',
    links: [
      { href: 'https://modrinth.black', label: 'ModrinthProxy', tip: 'Модринт по-русски' },
      { href: 'https://client.modrinth.black', label: 'Клиент/Сервер', tip: 'Скачать все версии Minecraft' },
      { href: 'https://rp.modrinth.black', label: 'RP Перепак', tip: 'Перепаковка защищённых ресурспаков' },
      { href: 'https://jar.modrinth.black', label: 'Перевод Плагинов', tip: 'Перевод плагинов онлайн (InJarTranslator)' },
      { href: 'https://dm.modrinth.black', label: 'Редактор DeluxeMenu', tip: 'Редактор DeluxeMenu и AbstractMenus' },
    ],
    mtoolsDesc: 'Инструменты для серверов Minecraft',
    signIn: 'Войти',
    ping: 'Пинг серверов',
    pingDesc: 'Проверка серверов (мб недоступен в РФ)',
  },
  en: {
    aria: 'modrinth.black services',
    more: 'More services',
    here: 'You are here',
    links: [
      { href: 'https://modrinth.black', label: 'ModrinthProxy', tip: 'Modrinth in Russian' },
      { href: 'https://client.modrinth.black', label: 'Client/Server', tip: 'Download every Minecraft version' },
      { href: 'https://rp.modrinth.black', label: 'RP Repack', tip: 'Repack protected resource packs' },
      { href: 'https://jar.modrinth.black', label: 'Plugin Translator', tip: 'Translate plugins online (InJarTranslator)' },
      { href: 'https://dm.modrinth.black', label: 'DeluxeMenu Editor', tip: 'DeluxeMenu and AbstractMenus editor' },
    ],
    mtoolsDesc: 'Tools for Minecraft servers',
    signIn: 'Sign in',
    ping: 'Server ping',
    pingDesc: 'Check Minecraft servers (may be unavailable in Russia)',
  },
};

export default function ServicesNav({ locale }) {
  const text = locale === 'ru' || locale === 'uk' ? TEXT.ru : TEXT.en;
  const [account, setAccount] = useState(undefined);
  const [signInHref, setSignInHref] = useState('/login');

  useEffect(() => {
    let alive = true;
    let last = 0;
    setSignInHref(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    const load = () => {
      const now = Date.now();
      if (now - last < 5000) return;
      last = now;
      fetch('/api/me', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (alive) setAccount(data?.user || null); })
        .catch(() => { if (alive) setAccount(null); });
    };
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    load();
    const timer = window.setInterval(onVisible, 60000);
    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return (
    <nav className="svc-nav" aria-label={text.aria}>
      <div className="svc-nav-inner">
        {text.links.map((link) => (
          <LumTooltip key={link.href} content={link.tip} side="bottom">
            <a href={link.href} className="svc-nav-link">
              {link.label}
            </a>
          </LumTooltip>
        ))}
        <div className="nav-more">
          <button type="button" className="svc-nav-link nav-more-trigger" aria-label={text.more} aria-haspopup="true">
            <svg className="nav-more-dots" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="5" r="1.9" />
              <circle cx="12" cy="12" r="1.9" />
              <circle cx="12" cy="19" r="1.9" />
            </svg>
          </button>
          <div className="nav-more-panel" role="menu">
            <div className="nav-more-list">
              <span className="nav-more-item nav-more-item--here" role="menuitem" aria-current="page">
                <span className="nav-more-title">
                  <span className="svc-nav-dot" aria-hidden="true" />
                  MTools
                </span>
                <span className="nav-more-desc">{text.here} · {text.mtoolsDesc}</span>
              </span>
              <a href="https://ping.modrinth.black" target="_blank" rel="noopener noreferrer" className="nav-more-item" role="menuitem">
                <span className="nav-more-title">{text.ping}</span>
                <span className="nav-more-desc">{text.pingDesc}</span>
              </a>
            </div>
          </div>
        </div>
        {account && (
          <a href="/account" className="nav-account" title={account.username}>
            {account.avatar ? (
              <img src={account.avatar} alt="" width={22} height={22} className="nav-account-avatar" />
            ) : (
              <span className="nav-account-initial">{account.username.slice(0, 1).toUpperCase()}</span>
            )}
            <span className="nav-account-name">{account.username}</span>
          </a>
        )}
        {account === null && (
          <a href={signInHref} className="nav-account nav-account--guest">
            {text.signIn}
          </a>
        )}
      </div>
    </nav>
  );
}
