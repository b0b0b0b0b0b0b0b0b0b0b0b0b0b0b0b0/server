'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Boxes, Search, Shirt, Users, ArrowRight } from 'lucide-react';
import { useLocale } from '@/app/components/AppProviders';

const EXAMPLES = ['mc.hypixel.net', '2b2t.org', 'play.cubecraft.net'];

export default function HomePingSpotlight() {
  const { t } = useLocale();
  const router = useRouter();
  const [address, setAddress] = useState('');

  const open = (value) => {
    const clean = value.trim();
    router.push(clean ? `/tools/ping?s=${encodeURIComponent(clean)}` : '/tools/ping');
  };

  const submit = (event) => {
    event.preventDefault();
    open(address);
  };

  return (
    <section className="home-ping" aria-labelledby="home-ping-title">
      <div className="home-ping-glow home-ping-glow--a" aria-hidden />
      <div className="home-ping-glow home-ping-glow--b" aria-hidden />

      <div className="home-ping-main">
        <span className="home-ping-badge">
          <span className="home-ping-badge-dot" aria-hidden />
          {t('home.ping.badge')}
        </span>
        <h2 id="home-ping-title" className="home-ping-title">{t('home.ping.title')}</h2>
        <p className="home-ping-subtitle">{t('home.ping.subtitle')}</p>

        <form className="home-ping-form" onSubmit={submit}>
          <label className="home-ping-field">
            <Search size={18} aria-hidden className="home-ping-field-icon" />
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder={t('home.ping.placeholder')}
              aria-label={t('home.ping.placeholder')}
              className="home-ping-input"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <button type="submit" className="home-ping-button">
            {t('home.ping.button')}
            <ArrowRight size={18} aria-hidden />
          </button>
        </form>

        <div className="home-ping-examples">
          <span className="home-ping-examples-label">{t('home.ping.examples')}</span>
          {EXAMPLES.map((example) => (
            <button key={example} type="button" className="home-ping-chip" onClick={() => open(example)}>
              {example}
            </button>
          ))}
        </div>
      </div>

      <div className="home-ping-side">
        <div className="home-ping-radar" aria-hidden>
          <span className="home-ping-wave" />
          <span className="home-ping-wave home-ping-wave--2" />
          <span className="home-ping-wave home-ping-wave--3" />
          <span className="home-ping-core">
            <Activity size={30} strokeWidth={2.2} />
          </span>
          <span className="home-ping-blip home-ping-blip--a" />
          <span className="home-ping-blip home-ping-blip--b" />
          <span className="home-ping-blip home-ping-blip--c" />
        </div>

        <ul className="home-ping-features">
          <li>
            <Boxes size={18} aria-hidden />
            <span>{t('home.ping.featureEditions')}</span>
          </li>
          <li>
            <Users size={18} aria-hidden />
            <span>{t('home.ping.featurePlayers')}</span>
          </li>
          <li>
            <Shirt size={18} aria-hidden />
            <span>{t('home.ping.featureSkins')}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
