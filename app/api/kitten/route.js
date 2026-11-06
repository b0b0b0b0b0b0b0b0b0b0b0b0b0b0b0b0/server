import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
const SSO_COOKIE = 'mp_sid';
const INTERNAL_URL = process.env.MODRINTH_INTERNAL_URL || 'http://127.0.0.1:3001';
const NO_STORE = { 'Cache-Control': 'private, no-store' };
async function askKitten(add) {
    const key = process.env.SSO_INTERNAL_KEY;
    const token = (await cookies()).get(SSO_COOKIE)?.value;
    if (!key || !token || token.length > 128)
        return null;
    try {
        const res = await fetch(`${INTERNAL_URL}/api/internal/kitten`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-internal-key': key },
            body: JSON.stringify({ token, add }),
            cache: 'no-store',
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        return typeof data?.pets === 'number' ? data : null;
    }
    catch {
        return null;
    }
}
export async function GET() {
    return Response.json((await askKitten(0)) ?? { pets: null }, { headers: NO_STORE });
}
export async function POST(request) {
    const body = await request.json().catch(() => null);
    const add = Math.max(1, Math.min(5, Math.floor(Number(body?.add) || 1)));
    return Response.json((await askKitten(add)) ?? { pets: null }, { headers: NO_STORE });
}
