'use client'

import { useEffect, useState } from 'react'
import { KittenFace } from '@/components/mpa/Kitten'
import { errorText, getText } from '@/components/mpa/text'
import { ACCOUNT_SITE, ErrorBox, Field, Frame, Side, Spinner, Svg, USER_ICON } from '@/components/mpa/ui'

const SHIELD_ICON = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'
const EXIT_ICON = 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9'

export default function AccountPanel() {
  const [text, setText] = useState(getText)
  const [user, setUser] = useState(undefined)
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState({ text: '', id: 0 })

  useEffect(() => {
    setText(getText())
    let alive = true
    const load = () => {
      fetch('/api/me', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!alive) return
          const next = data?.user || null
          setUser((prev) => {
            if (!prev || !next || prev.username !== next.username) setUsername(next?.username || '')
            return next
          })
        })
        .catch(() => { if (alive) setUser(null) })
    }
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    load()
    window.addEventListener('focus', load)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      window.removeEventListener('focus', load)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const fail = (code) => setError((prev) => ({ text: errorText(text, code), id: prev.id + 1 }))

  const rename = async (event) => {
    event.preventDefault()
    if (busy || !user) return
    setBusy(true)
    setNotice('')
    setError((prev) => ({ text: '', id: prev.id }))
    try {
      const res = await fetch('/api/auth/rename', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.user) {
        fail(data?.error)
        if (data?.error === 'unauthorized') setUser(null)
      } else {
        setUser(data.user)
        setUsername(data.user.username)
        setNotice(text.saved)
      }
    } catch {
      fail('unavailable')
    }
    setBusy(false)
  }

  const logout = async () => {
    setBusy(true)
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.assign('/')
  }

  if (user === undefined) {
    return (
      <div className="mpa-page mpa-page--loading">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <Frame side={<Side text={text} />} home={text.home}>
        <div className="mpa-swap mpa-swap--left">
          <div className="mpa-head">
            <div>
              <h1 className="mpa-title">{text.signedOutTitle}</h1>
              <p className="mpa-lead">{text.signedOutLead}</p>
            </div>
            <span className="mpa-guard mpa-guard--static">
              <KittenFace mood="look" />
            </span>
          </div>
          <a href="/login?next=%2Faccount" className="mpa-submit mpa-submit--link">{text.submitLogin}</a>
        </div>
      </Frame>
    )
  }

  const profile = (
    <div className="mpa-profile mpa-rise">
      {user.avatar ? (
        <img src={user.avatar} alt="" width={96} height={96} className="mpa-profile-avatar" />
      ) : (
        <span className="mpa-profile-initial">{user.username.slice(0, 1).toUpperCase()}</span>
      )}
      <h2 className="mpa-side-title">{user.username}</h2>
      <p className="mpa-side-lead">{text.accountLead}</p>
    </div>
  )

  return (
    <Frame side={profile} home={text.home}>
      <div className="mpa-swap mpa-swap--left">
        <div className="mpa-head">
          <div>
            <h1 className="mpa-title">{text.accountTitle}</h1>
            <p className="mpa-lead">{text.accountLead}</p>
          </div>
        </div>

        <form className="mpa-form" onSubmit={rename}>
          <Field label={text.nickname} hint={text.usernameHint} icon={USER_ICON}>
            <input
              className="mpa-input"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setNotice('') }}
              autoCapitalize="none"
              spellCheck={false}
              maxLength={24}
              required
            />
          </Field>
          <ErrorBox shakeKey={error.id}>{error.text}</ErrorBox>
          {notice ? <p className="mpa-success">{notice}</p> : null}
          <button type="submit" className="mpa-submit" disabled={busy || username.trim() === user.username}>
            {busy ? <Spinner /> : null}
            {text.save}
          </button>
        </form>

        <div className="mpa-block">
          <span className="mpa-block-icon"><Svg path={SHIELD_ICON} className="mpa-icon mpa-icon--sm" /></span>
          <div className="mpa-block-body">
            <span className="mpa-perk-title">{text.security}</span>
            <span className="mpa-perk-text">{text.securityText}</span>
          </div>
          <a href={`${ACCOUNT_SITE}/settings/security`} className="mpa-ghost">{text.securityLink}</a>
        </div>

        <div className="mpa-block mpa-block--danger">
          <span className="mpa-block-icon"><Svg path={EXIT_ICON} className="mpa-icon mpa-icon--sm" /></span>
          <div className="mpa-block-body">
            <span className="mpa-perk-title">{text.logout}</span>
            <span className="mpa-perk-text">{text.logoutText}</span>
          </div>
          <button type="button" className="mpa-ghost mpa-ghost--danger" onClick={logout} disabled={busy}>
            {text.logout}
          </button>
        </div>
      </div>
    </Frame>
  )
}
