'use client';
import { PixelNameTag } from '@/app/components/kitten/PixelOutfit';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useT } from '@/components/i18n/I18nProvider';
const MAIN = 'https://modrinth.black';
const DISCORD_ICON = 'M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13l.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01l.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6.01-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42Zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42Z';
const ICONS = {
    user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
    updates: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    favorites: [
        'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z',
    ],
    collections: ['m16 6 4 14M12 6v14M8 8v12M4 4v16'],
    downloads: ['M12 8v4l3 2M3.05 11a9 9 0 1 1 .5 4M3 4v5h5'],
    settings: [
        'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
        'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    ],
    logIn: ['M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3'],
    logOut: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'],
    out: ['M7 17 17 7M8 7h9v9'],
    news: ['M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2', 'M18 14h-8M15 18h-5M10 6h8v4h-8V6Z'],
};
const MAIN_LINKS = [
    { href: `${MAIN}/account?tab=updates`, label: 'account.updates', icon: 'updates' },
    { href: `${MAIN}/account?tab=favorites`, label: 'account.favorites', icon: 'favorites' },
    { href: `${MAIN}/account?tab=collections`, label: 'account.collections', icon: 'collections' },
    { href: `${MAIN}/account?tab=downloads`, label: 'account.downloads', icon: 'downloads' },
];
function Icon({ name, className = 'am-icon' }) {
    return (<svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name].map((d) => (<path key={d} d={d}/>))}
    </svg>);
}
function Avatar({ user, size }) {
    if (user.avatar)
        return <img src={user.avatar} alt="" width={size} height={size} className="nav-account-avatar" style={{ width: size, height: size }}/>;
    return (<span className="nav-account-initial" style={{ width: size, height: size }}>
      {user.username.slice(0, 1).toUpperCase()}
    </span>);
}
export default function AccountChip({ signInLabel }) {
    const t = useT();
    const [user, setUser] = useState(undefined);
    const [signInHref, setSignInHref] = useState('/login');
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const rootRef = useRef(null);
    const menuId = useId();
    useEffect(() => {
        let alive = true;
        let last = 0;
        setSignInHref(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        const load = () => {
            const now = Date.now();
            if (now - last < 5000)
                return;
            last = now;
            fetch('/api/me', { cache: 'no-store' })
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => { if (alive)
                setUser(data?.user || null); })
                .catch(() => { if (alive)
                setUser(null); });
        };
        const onVisible = () => { if (document.visibilityState === 'visible')
            load(); };
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
    const close = useCallback(() => setOpen(false), []);
    useEffect(() => {
        if (!open)
            return undefined;
        const onPointer = (event) => {
            if (!rootRef.current?.contains(event.target))
                close();
        };
        const onKey = (event) => {
            if (event.key === 'Escape') {
                close();
                rootRef.current?.querySelector('button')?.focus();
            }
        };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, close]);
    const logout = async () => {
        setBusy(true);
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
        window.location.assign('/');
    };
    const news = (<>
      <a href={`${MAIN}/news`} className="top-nav-link top-nav-link--icon" data-tooltip={t('nav.news')} aria-label={t('nav.news')}>
      <Icon name="news" className="nav-icon"/>
    </a>
      <a href={`${MAIN}/discord`} target="_blank" rel="noopener noreferrer" className="top-nav-link top-nav-link--icon" data-tooltip={t('nav.discord')} aria-label={t('nav.discord')}>
        <svg className="nav-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d={DISCORD_ICON} />
        </svg>
      </a>
    </>);
    if (user === undefined) {
        return (<div className="nav-tools">
        <span className="nav-icon-skel" aria-hidden="true"/>
        {news}
      </div>);
    }
    if (!user) {
        return (<div className="nav-tools">
        <div className="am-guest">
          <a href={signInHref} className="am-login" aria-label={signInLabel || t('account.signIn')} suppressHydrationWarning>
            <Icon name="logIn"/>
            <span className="am-login-text">{signInLabel || t('account.signIn')}</span>
          </a>
          <a href="/settings" className="top-nav-link top-nav-link--icon am-compact" data-tooltip={t('account.settings')} aria-label={t('account.settings')}>
            <Icon name="settings" className="nav-icon"/>
          </a>
        </div>
        {news}
      </div>);
    }
    return (<div className="nav-tools">
      <div ref={rootRef} className="am-root">
        <button type="button" onClick={() => setOpen((value) => !value)} className={`top-nav-link top-nav-link--icon am-trigger${open ? ' top-nav-link--active' : ''}`} data-tooltip={open ? undefined : t('account.menu')} aria-label={t('account.menu')} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId}>
          {user.avatar ? <img src={user.avatar} alt="" width={24} height={24} className="am-trigger-avatar" draggable={false}/> : <Icon name="user" className="nav-icon"/>}
        </button>

        {open ? (<div id={menuId} role="menu" className="am-menu glass-pop">
            <a href="/account" role="menuitem" onClick={close} className="am-head">
              <Avatar user={user} size={32}/>
              <span className="am-head-text">
                <span className="am-head-name"><PixelNameTag level={user.pixelBadge} size={16}>{user.username}</PixelNameTag></span>
                <span className="am-head-sub">{t('account.dashboard')}</span>
              </span>
            </a>

            {MAIN_LINKS.map((link) => (<a key={link.href} href={link.href} role="menuitem" onClick={close} className="am-item">
                <Icon name={link.icon}/>
                <span className="am-label">{t(link.label)}</span>
                <Icon name="out" className="am-out"/>
              </a>))}

            <div className="am-sep" role="separator"/>

            <a href="/settings" role="menuitem" onClick={close} className="am-item">
              <Icon name="settings"/>
              <span className="am-label">{t('account.settings')}</span>
            </a>

            <button type="button" role="menuitem" onClick={logout} disabled={busy} className="am-item am-item--danger">
              <Icon name="logOut"/>
              <span className="am-label">{t('account.logout')}</span>
            </button>
          </div>) : null}
      </div>
      {news}
    </div>);
}
