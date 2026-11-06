'use client';
import React, { useEffect, useRef, useState } from 'react';
import FooterKitten from '@/app/components/footer/FooterKitten';
const EMAIL = 'black-minecraft@proton.me';
const SERVICES = [
    { id: 'proxy', href: 'https://modrinth.black', label: 'ModrinthProxy', icon: 'M21 7.5 12 3 3 7.5m18 0-9 4.5m9-4.5v9L12 21m0-9L3 7.5m9 4.5v9M3 7.5v9L12 21' },
    { id: 'client', href: 'https://client.modrinth.black', label: 'Клиент / Сервер', icon: 'M12 4v11m0 0-4-4m4 4 4-4M5 20h14' },
    { id: 'rp', href: 'https://rp.modrinth.black', label: 'RP Перепак', icon: 'M20 7 12 3 4 7m16 0v10l-8 4m8-14-8 4m0 10L4 17V7m8 14V11M4 7l8 4' },
    { id: 'jar', href: 'https://jar.modrinth.black', label: 'Перевод плагинов', icon: 'M4 5h8M8 3v2m2.5 0C9.6 9.4 7.2 12.6 4 14.5m2.5-6c1.2 2.4 3 4.2 5.5 5.5M13 21l4-9 4 9m-6.8-3h5.6' },
    { id: 'dm', href: 'https://dm.modrinth.black', label: 'Редактор DeluxeMenu', icon: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
    { id: 'mtools', href: 'https://mtools.modrinth.black', label: 'MTools', icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z' },
    { id: 'ping', href: 'https://ping.modrinth.black', label: 'Пинг серверов', icon: 'M3 12h4l3-8 4 16 3-8h4' },
];
function EmailCopy() {
    const [copied, setCopied] = useState(false);
    const timer = useRef(undefined);
    useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            if (timer.current)
                clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        }
        catch {
            setCopied(false);
        }
    };
    return (<button type="button" className={`sf-email${copied ? ' sf-email--copied' : ''}`} onClick={copy} aria-label="Скопировать почту">
      <span className="sf-email-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
          <path d="m3 7 9 6 9-6"/>
        </svg>
      </span>
      <span className="sf-email-text">
        <span className="sf-email-address">{EMAIL}</span>
        <span className="sf-email-hint">{copied ? 'Скопировано!' : 'Нажми, чтобы скопировать'}</span>
      </span>
      <span className="sf-email-action" aria-hidden="true">
        {copied ? (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5"/>
          </svg>) : (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="12" height="12" rx="2"/>
            <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
          </svg>)}
      </span>
    </button>);
}
export default function SiteFooter({ here, title, domain, tagline, accent }) {
    return (<footer className="sf">
      <div className="sf-line" aria-hidden="true"></div>
      <div className="sf-glow sf-glow--a" aria-hidden="true"></div>
      <div className="sf-glow sf-glow--b" aria-hidden="true"></div>

      <div className="sf-inner">
        <div className="sf-grid">
          <div className="sf-brand">
            <a href="https://modrinth.black" className="sf-family">
              <span className="sf-family-dot" aria-hidden="true"></span>
              Часть modrinth.black
            </a>
            <h3 className="sf-title">{title}</h3>
            <p className="sf-domain">{domain}</p>
            <p className="sf-tagline">
              {tagline}
              <span className="sf-accent">{accent}</span>
            </p>
            <FooterKitten />
          </div>

          <nav className="sf-col" aria-label="Сервисы modrinth.black">
            <h4 className="sf-heading">Сервисы</h4>
            <ul className="sf-services">
              {SERVICES.map((service) => {
            const current = service.id === here;
            return (<li key={service.id}>
                    <a href={service.href} className={`sf-service${current ? ' sf-service--here' : ''}`} aria-current={current ? 'page' : undefined} target={service.id === 'ping' && !current ? '_blank' : undefined} rel={service.id === 'ping' && !current ? 'noopener noreferrer' : undefined}>
                      <svg className="sf-service-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={service.icon}/>
                      </svg>
                      <span>{service.label}</span>
                      {current && <span className="sf-here">вы здесь</span>}
                    </a>
                  </li>);
        })}
            </ul>
          </nav>

          <div className="sf-col">
            <h4 className="sf-heading">Связаться с нами</h4>
            <p className="sf-text">Для официальных запросов</p>
            <EmailCopy />
          </div>
        </div>

        <div className="sf-bottom">
          <div className="sf-disclaimer">
            <span className="sf-disclaimer-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"/>
              </svg>
            </span>
            <div>
              <p className="sf-disclaimer-title">Disclaimer</p>
              <p className="sf-disclaimer-text">Not an official Minecraft service. Not approved by or associated with Mojang or Microsoft.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>);
}
