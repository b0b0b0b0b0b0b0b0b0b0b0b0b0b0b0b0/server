import { cookies } from 'next/headers'

const SSO_COOKIE = 'mp_sid'
const SSO_HINT_COOKIE = 'mp_sso'
const SITE_DOMAIN = 'modrinth.black'
const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001'
const TRUSTED_PROXY_HOPS = Math.max(1, parseInt(process.env.TRUSTED_PROXY_HOPS || '2', 10) || 2)

export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const chain = forwarded.split(',').map((part) => part.trim()).filter(Boolean)
    if (chain.length > 0) return chain[Math.max(0, chain.length - TRUSTED_PROXY_HOPS)]
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

export function isSameSite(request) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    const host = new URL(origin).hostname.toLowerCase()
    const own = (request.headers.get('host') || '').split(':')[0].toLowerCase()
    return host === own || host === SITE_DOMAIN || host.endsWith('.' + SITE_DOMAIN)
  } catch {
    return false
  }
}

export async function callModrinth(action, payload) {
  const key = process.env.SSO_INTERNAL_KEY
  if (!key) return { status: 503, data: { error: 'unavailable' } }
  try {
    const res = await fetch(`${INTERNAL_URL}/api/internal/auth/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-internal-key': key },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json().catch(() => ({ error: 'unavailable' }))
    return { status: res.status, data }
  } catch {
    return { status: 503, data: { error: 'unavailable' } }
  }
}

function cookieOptions(maxAge) {
  const domain = process.env.SESSION_COOKIE_DOMAIN
  return {
    ...(domain ? { domain } : {}),
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

export async function setSession(token, expiresAt) {
  const store = await cookies()
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
  store.set(SSO_COOKIE, token, { ...cookieOptions(maxAge), httpOnly: true })
  store.set(SSO_HINT_COOKIE, '1', cookieOptions(maxAge))
}

export async function clearSession() {
  const store = await cookies()
  store.set(SSO_COOKIE, '', { ...cookieOptions(0), httpOnly: true })
  store.set(SSO_HINT_COOKIE, '', cookieOptions(0))
}

export async function sessionToken() {
  const token = (await cookies()).get(SSO_COOKIE)?.value
  return token && token.length <= 128 ? token : null
}
