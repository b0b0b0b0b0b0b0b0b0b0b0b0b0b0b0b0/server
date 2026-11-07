'use client';

import LumTooltip from '@/app/components/LumTooltip';
import AccountChip from '@/components/AccountChip';
import { useT } from '@/components/i18n/I18nProvider';
import '@/styles/services-nav.css';

const LINKS = [
  { href: 'https://modrinth.black', label: null, tip: 'nav.proxyTip' },
  { href: 'https://client.modrinth.black', label: 'nav.clientServer', tip: 'nav.clientServerTip' },
  { href: 'https://rp.modrinth.black', label: 'nav.rpRepack', tip: 'nav.rpRepackTip' },
  { href: 'https://jar.modrinth.black', label: 'nav.pluginTranslate', tip: 'nav.pluginTranslateTip' },
  { href: 'https://dm.modrinth.black', label: 'nav.deluxeMenu', tip: 'nav.deluxeMenuTip' },
];

export default function ServicesNav() {
  const t = useT();

  return (
    <nav className="svc-nav" aria-label={t('footer.servicesAria')}>
      <div className="svc-nav-inner">
        {LINKS.map((link) => (
          <LumTooltip key={link.href} content={t(link.tip)} side="bottom">
            <a href={link.href} className="svc-nav-link">
              {link.label ? t(link.label) : 'ModrinthProxy'}
            </a>
          </LumTooltip>
        ))}
        <div className="nav-more">
          <button type="button" className="svc-nav-link nav-more-trigger" aria-label={t('nav.more')} aria-haspopup="true">
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
                <span className="nav-more-desc">{t('nav.here')} · {t('nav.mtoolsTip')}</span>
              </span>
            </div>
          </div>
        </div>
        <AccountChip />
      </div>
    </nav>
  );
}
