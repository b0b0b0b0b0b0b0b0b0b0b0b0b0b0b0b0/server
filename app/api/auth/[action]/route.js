import { callModrinth, clearSession, clientIp, isSameSite, sessionToken, setSession } from '@/components/mpa/server'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'private, no-store' }
const reply = (data, status = 200) => Response.json(data, { status, headers: noStore })

export async function GET(request, { params }) {
  const { action } = await params
  if (action !== 'captcha') return new Response(null, { status: 404 })
  const mode = new URL(request.url).searchParams.get('mode')
  const { status, data } = await callModrinth('captcha', { mode, ip: clientIp(request) })
  return reply(data, status)
}

export async function POST(request, { params }) {
  const { action } = await params
  if (!isSameSite(request)) return reply({ error: 'forbidden' }, 403)
  const body = await request.json().catch(() => ({}))
  const ip = clientIp(request)

  if (action === 'login' || action === 'register') {
    const { status, data } = await callModrinth(action, {
      username: body?.username,
      password: body?.password,
      captcha: body?.captcha,
      website: body?.website,
      ip,
    })
    if (status !== 200 || !data?.token) return reply({ error: data?.error || 'unavailable' }, status === 200 ? 503 : status)
    await setSession(data.token, data.expiresAt)
    return reply({ user: data.user })
  }

  if (action === 'rename') {
    const token = await sessionToken()
    if (!token) return reply({ error: 'unauthorized' }, 401)
    const { status, data } = await callModrinth('rename', { token, username: body?.username })
    return reply(data, status)
  }

  if (action === 'logout') {
    const token = await sessionToken()
    if (token) await callModrinth('logout', { token })
    await clearSession()
    return reply({ ok: true })
  }

  return new Response(null, { status: 404 })
}
