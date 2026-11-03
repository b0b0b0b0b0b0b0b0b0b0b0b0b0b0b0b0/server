'use client'

import { useEffect, useState } from 'react'
import { errorText, getText } from '@/components/mpa/text'
import '@/components/mpa/mpa.css'

const ACCOUNT_SITE = 'https://modrinth.black'

export default function AccountPanel() {
  const [text, setText] = useState(getText)
  const [user, setUser] = useState(undefined)
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

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

  const rename = async (event) => {
    event.preventDefault()
    if (busy || !user) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const res = await fetch('/api/auth/rename', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.user) {
        setError(errorText(text, data?.error))
        if (data?.error === 'unauthorized') setUser(null)
      } else {
        setUser(data.user)
        setUsername(data.user.username)
        setNotice(text.saved)
      }
    } catch {
      setError(errorText(text, 'unavailable'))
    }
    setBusy(false)
  }

  const logout = async () => {
    setBusy(true)
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.assign('/')
  }

  if (user === undefined) return <div className="mpa-shell" />

  if (!user) {
    return (
      <div className="mpa-shell">
        <div className="mpa-card">
          <p className="mpa-title">{text.signedOut}</p>
          <a href="/login?next=%2Faccount" className="mpa-btn mpa-btn--primary">{text.signIn}</a>
        </div>
      </div>
    )
  }

  return (
    <div className="mpa-shell">
      <div className="mpa-card">
        <div className="mpa-profile">
          {user.avatar ? (
            <img src={user.avatar} alt="" width={56} height={56} className="mpa-avatar" />
          ) : (
            <span className="mpa-avatar mpa-avatar--initial">{user.username.slice(0, 1).toUpperCase()}</span>
          )}
          <div>
            <p className="mpa-title">{user.username}</p>
            <p className="mpa-hint">{text.oneAccount}</p>
          </div>
        </div>
        <form className="mpa-row" onSubmit={rename}>
          <label className="mpa-field mpa-grow">
            <span>{text.nickname}</span>
            <input
              className="mpa-input"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setNotice('') }}
              maxLength={24}
              required
            />
          </label>
          <button type="submit" className="mpa-btn mpa-btn--primary" disabled={busy || username.trim() === user.username}>
            {text.save}
          </button>
        </form>
        {error && <p className="mpa-error" role="alert">{error}</p>}
        {notice && <p className="mpa-ok">{notice}</p>}
        <div className="mpa-section">
          <p className="mpa-hint">{text.security}</p>
          <a href={`${ACCOUNT_SITE}/settings/security`} className="mpa-btn">{text.securityLink}</a>
        </div>
        <button type="button" className="mpa-btn mpa-btn--danger" onClick={logout} disabled={busy}>
          {text.logout}
        </button>
      </div>
    </div>
  )
}
