import { clientIp } from '@/components/mpa/server'

export const dynamic = 'force-dynamic'

const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001'
const ID_RE = /^[0-9a-f]{32}$/
const VERSION_RE = /^\d{1,15}$/

export async function GET(request, { params }) {
  const { id } = await params
  if (!ID_RE.test(String(id || ''))) return new Response(null, { status: 404 })
  const version = new URL(request.url).searchParams.get('v')
  const query = version && VERSION_RE.test(version) ? `?v=${version}` : ''
  const ip = clientIp(request)
  try {
    const res = await fetch(`${INTERNAL_URL}/api/avatar/${id}${query}`, {
      headers: { 'x-forwarded-for': `${ip}, ${ip}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      const headers = { 'Cache-Control': 'no-store' }
      const retry = res.headers.get('retry-after')
      if (retry) headers['Retry-After'] = retry
      return new Response(null, { status: res.status === 404 ? 404 : res.status === 429 ? 429 : 502, headers })
    }
    return new Response(await res.arrayBuffer(), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=21600, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response(null, { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
