'use client'

import { useEffect, useState } from 'react'
import { SITE_PALETTES } from '@/lib/core/siteLook'
import { LOCALES } from '@/lib/i18n/locales'
import { useLocale, useT } from '@/components/i18n/I18nProvider'
import { soundsMuted, setSoundsMuted, onSoundsMutedChange } from '@/app/components/kitten/softSounds'
import { calmMode, setCalmMode, onCalmModeChange } from '@/app/components/kitten/calmMode'
import { LOCALE_COOKIE, PALETTE_COOKIE, THEME_COOKIE, applyLook, readPalette, readTheme, writePref } from './sharedPrefs'

const MAIN = 'https://modrinth.black'

const THEMES = [
  { id: 'system', label: 'settings.themeSystem', aria: 'settings.themeSystemAria' },
  { id: 'light', label: 'settings.themeLight', aria: 'settings.themeLightAria' },
  { id: 'dark', label: 'settings.themeDark', aria: 'settings.themeDarkAria' },
]

const SECTIONS = [
  { id: 'appearance', href: '/settings', label: 'sn.appearance', icon: 'appearance' },
  { id: 'language', href: '/settings/language', label: 'sn.language', icon: 'language' },
]

const ICONS = {
  appearance: [
    'M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3',
    'M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7M14.5 17.5 4.5 15',
  ],
  language: ['m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6'],
  dashboard: ['M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z'],
  profile: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
  notifications: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  extras: [
    'M12 3l1.9 5.8 5.8 1.9-5.8 1.9L12 18.4l-1.9-5.8-5.8-1.9 5.8-1.9Z',
    'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z',
  ],
  data: ['M12 8v4l3 2M3.05 11a9 9 0 1 1 .5 4M3 4v5h5'],
  security: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10'],
  signIn: ['M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3'],
  out: ['M7 17 17 7M8 7h9v9'],
  shared: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', 'M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20'],
  chevron: ['m9 18 6-6-6-6'],
  warn: ['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0M12 9v4M12 17h.01'],
  check: ['M20 6 9 17l-5-5'],
}

const ACCOUNT_LINKS = [
  { href: '/account', label: 'account.dashboard', icon: 'dashboard' },
  { href: `${MAIN}/settings/profile`, label: 'sn.profile', icon: 'profile', out: true },
  { href: `${MAIN}/settings/notifications`, label: 'sn.notifications', icon: 'notifications', out: true },
  { href: `${MAIN}/settings/extras`, label: 'sn.extras', icon: 'extras', out: true },
  { href: `${MAIN}/settings/data`, label: 'sn.data', icon: 'data', out: true },
  { href: `${MAIN}/settings/security`, label: 'sn.security', icon: 'security', out: true },
]

function Icon({ name, className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function Dot({ on }) {
  return (
    <svg className="st-dot" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      {on ? <circle cx="12" cy="12" r="5" fill="currentColor" /> : null}
    </svg>
  )
}

function rgb(channels) {
  return `rgb(${channels.split(' ').join(', ')})`
}

function Sidebar({ signedIn, section }) {
  const t = useT()
  return (
    <nav aria-label={t('settings.navAria')}>
      <ul className="st-nav">
        <li className="st-nav-group">{t('sn.display')}</li>
        {SECTIONS.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              className={`st-nav-item${section === item.id ? ' st-nav-item--active' : ''}`}
              aria-current={section === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} />
              <span className="st-nav-label">{t(item.label)}</span>
            </a>
          </li>
        ))}
        <li className="st-nav-group">{t('sn.account')}</li>
        {signedIn === null ? (
          ACCOUNT_LINKS.map((link, index) => (
            <li key={link.href} className="st-skel-item" aria-hidden="true">
              <span className="st-skel st-skel-icon" />
              <span className="st-skel st-skel-line" style={{ width: `${[52, 64, 72, 58, 68, 80][index % 6]}%` }} />
            </li>
          ))
        ) : signedIn === false ? (
          <li className="st-signin">
            <p>{t('sn.signInHint')}</p>
            <a href={`/login?next=${encodeURIComponent('/settings')}`}>
              <Icon name="signIn" />
              {t('sn.signIn')}
            </a>
          </li>
        ) : (
          ACCOUNT_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="st-nav-item">
                <Icon name={link.icon} />
                <span className="st-nav-label">{t(link.label)}</span>
                {link.out ? <Icon name="out" className="st-nav-out" /> : null}
              </a>
            </li>
          ))
        )}
      </ul>
    </nav>
  )
}

function AppearanceSection({ theme, palette, sounds, calm, onTheme, onPalette, onSounds, onCalm }) {
  const t = useT()
  return (
    <>
      <p className="st-note">
        <Icon name="shared" />
        {t('settings.sharedNote')}
      </p>

      <section className="st-card" aria-labelledby="st-theme">
        <h2 id="st-theme" className="st-card-title">{t('settings.themeTitle')}</h2>
        <p className="st-card-hint">{t('settings.themeHint')}</p>
        <div className="st-themes">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTheme(item.id)}
              className={`st-radio${theme === item.id ? ' st-radio--selected' : ''}`}
              aria-label={t(item.aria)}
              aria-pressed={theme === item.id}
            >
              <div className={`st-preview st-preview--${item.id}`}>
                <div className="st-mock">
                  <div className="st-mock-icon" />
                  <div className="st-mock-line st-mock-line--long" />
                  <div className="st-mock-line st-mock-line--short" />
                </div>
              </div>
              <div className="st-label">
                <Dot on={theme === item.id} />
                <span>{t(item.label)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="st-card" aria-labelledby="st-palette">
        <h2 id="st-palette" className="st-card-title">{t('settings.paletteTitle')}</h2>
        <p className="st-card-hint">{t('settings.paletteHint')}</p>
        <div className="st-palettes">
          {Object.entries(SITE_PALETTES).map(([id, colors]) => {
            const selected = palette === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onPalette(id)}
                className={`st-radio${selected ? ' st-radio--selected' : ''}`}
                style={{ '--st-ring': rgb(colors.accent), '--st-ring-light': rgb(colors.light) }}
                aria-pressed={selected}
              >
                <div className="st-preview">
                  <div className="st-swatch">
                    <div className="st-swatch-top">
                      <div className="st-swatch-dot" />
                      <div className="st-swatch-line" style={{ width: 40 }} />
                    </div>
                    <div className="st-swatch-body">
                      <div className="st-swatch-line" style={{ width: 48 }} />
                      <div className="st-swatch-bar" />
                    </div>
                  </div>
                </div>
                <div className="st-label">
                  <Dot on={selected} />
                  <span>{t(`settings.palette.${id}`)}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="st-card" aria-labelledby="st-sounds">
        <h2 id="st-sounds" className="st-card-title">{t('settings.soundsTitle')}</h2>
        <p className="st-card-hint">{t('settings.soundsHint')}</p>
        <div className="st-row">
          <label htmlFor="st-sounds-switch" className="st-row-text">
            <span className="st-row-title">{t('settings.kittenSounds')}</span>
            <span className="st-row-hint">{t('settings.kittenSoundsHint')}</span>
          </label>
          <button
            id="st-sounds-switch"
            type="button"
            role="switch"
            aria-checked={sounds}
            onClick={onSounds}
            className={`st-switch${sounds ? ' st-switch--on' : ''}`}
            data-tooltip={sounds ? t('settings.on') : t('settings.off')}
          >
            <span className="st-knob" />
          </button>
        </div>
        <div className="st-row">
          <label htmlFor="st-calm-switch" className="st-row-text">
            <span className="st-row-title">{t('settings.calmMode')}</span>
            <span className="st-row-hint">{t('settings.calmModeHint')}</span>
          </label>
          <button
            id="st-calm-switch"
            type="button"
            role="switch"
            aria-checked={calm}
            onClick={onCalm}
            className={`st-switch${calm ? ' st-switch--on' : ''}`}
            data-tooltip={calm ? t('settings.on') : t('settings.off')}
          >
            <span className="st-knob" />
          </button>
        </div>
      </section>
    </>
  )
}

function LanguageSection({ locale, onChoose }) {
  const t = useT()
  return (
    <section className="st-card" aria-labelledby="st-language">
      <h2 id="st-language" className="st-card-title">{t('settings.languageTitle')}</h2>
      <div className="st-warn">
        <span className="st-warn-icon">
          <Icon name="warn" />
        </span>
        <p>{t('settings.languageWarn')}</p>
      </div>
      <div role="radiogroup" aria-label={t('settings.languageStandard')} className="st-langs">
        <strong className="st-langs-title">{t('settings.languageStandard')}</strong>
        {LOCALES.map((item) => {
          const selected = locale === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${item.nativeName}. ${item.englishName}`}
              onClick={() => onChoose(item.id)}
              className={`st-lang${selected ? ' st-lang--selected' : ''}`}
            >
              <span className="st-lang-main">
                <img src={item.flagUrl || `https://flagcdn.com/${item.flag}.svg`} alt="" aria-hidden="true" className="st-flag" loading="lazy" />
                <span className="st-lang-names">
                  <span className="st-lang-native">{item.nativeName}</span>
                  {item.englishName !== item.nativeName ? <span className="st-lang-english">{item.englishName}</span> : null}
                </span>
              </span>
              {selected ? (
                <span className="st-lang-check">
                  <Icon name="check" />
                </span>
              ) : (
                <span className="st-lang-ring" />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function SettingsPage({ section = 'appearance' }) {
  const t = useT()
  const siteLocale = useLocale()
  const current = SECTIONS.find((item) => item.id === section) || SECTIONS[0]
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState('system')
  const [palette, setPalette] = useState('pink')
  const [sounds, setSounds] = useState(true)
  const [calm, setCalm] = useState(false)
  const [locale, setLocale] = useState(siteLocale)
  const [signedIn, setSignedIn] = useState(null)

  useEffect(() => {
    setLocale(siteLocale)
  }, [siteLocale])

  useEffect(() => {
    const sync = () => {
      setTheme(readTheme())
      setPalette(readPalette(SITE_PALETTES))
      setSounds(!soundsMuted())
      setCalm(calmMode())
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync()
    }
    sync()
    setReady(true)
    fetch('/api/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSignedIn(Boolean(data?.user)))
      .catch(() => setSignedIn(false))
    const offSounds = onSoundsMutedChange((muted) => setSounds(!muted))
    const offCalm = onCalmModeChange(setCalm)
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      offSounds()
      offCalm()
      window.removeEventListener('focus', sync)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const chooseTheme = (id) => {
    setTheme(id)
    writePref(THEME_COOKIE, id)
    applyLook()
  }

  const choosePalette = (id) => {
    setPalette(id)
    writePref(PALETTE_COOKIE, id)
    applyLook()
  }

  const chooseLocale = (id) => {
    setLocale(id)
    writePref(LOCALE_COOKIE, id)
    window.dispatchEvent(new Event('site-locale-changed'))
  }

  const title = t(current.label)

  return (
    <div className="st-page">
      <div className="st-head">
        <ol className="st-crumbs" aria-label={t('settings.crumbsAria')}>
          <li>
            <a href="/">{t('settings.home')}</a>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron" className="st-crumb-sep" />
          </li>
          <li>
            <a href="/settings">{t('settings.pageTitle')}</a>
          </li>
          <li aria-hidden="true">
            <Icon name="chevron" className="st-crumb-sep" />
          </li>
          <li>{title}</li>
        </ol>
        <h1 className="st-title">{title}</h1>
      </div>

      <div className="st-layout">
        <aside className="st-aside">
          <Sidebar signedIn={signedIn} section={current.id} />
        </aside>

        {ready ? (
          <div className="st-main st-fade">
            {current.id === 'language' ? (
              <LanguageSection locale={locale} onChoose={chooseLocale} />
            ) : (
              <AppearanceSection
                theme={theme}
                palette={palette}
                sounds={sounds}
                calm={calm}
                onTheme={chooseTheme}
                onPalette={choosePalette}
                onSounds={() => setSoundsMuted(sounds)}
                onCalm={() => setCalmMode(!calm)}
              />
            )}
          </div>
        ) : (
          <div className="st-main st-loading" aria-hidden="true">
            <div style={{ height: 192 }} />
            <div style={{ height: 384 }} />
          </div>
        )}
      </div>
    </div>
  )
}
