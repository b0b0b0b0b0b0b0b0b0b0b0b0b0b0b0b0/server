import { callAccountWorkspace } from '@/lib/core/accountWorkspace';
import { serializeWorkspace } from '@/lib/core/workspaceSchema';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 1536 * 1024;
const NO_STORE = { 'Cache-Control': 'private, no-store' };
const SAVE_REASONS = new Set(['auto', 'transfer', 'merge']);

function reply(body, status = 200) {
  return Response.json(body, { status, headers: NO_STORE });
}

function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readBody(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return null;
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) return null;
  const text = await request.text().catch(() => null);
  if (!text || text.length > MAX_BODY_BYTES) return null;
  try {
    const body = JSON.parse(text);
    return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
  } catch {
    return null;
  }
}

function isBackupId(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export async function GET() {
  const { status, body } = await callAccountWorkspace('get');
  return reply(body, status);
}

export async function POST(request) {
  if (!isSameOrigin(request)) return reply({ error: 'forbidden' }, 403);
  const body = await readBody(request);
  if (!body || typeof body.action !== 'string') return reply({ error: 'bad_request' }, 400);

  if (body.action === 'save') {
    const reason = SAVE_REASONS.has(body.reason) ? body.reason : null;
    if (!reason) return reply({ error: 'bad_request' }, 400);
    const baseRevision = Number.isSafeInteger(body.baseRevision) ? body.baseRevision : null;
    const serialized = serializeWorkspace(body.workspace);
    if (!serialized) return reply({ error: 'invalid' }, 400);
    const { status, body: result } = await callAccountWorkspace('save', {
      workspace: serialized.clean,
      reason,
      baseRevision,
    });
    return reply(result, status);
  }

  if (body.action === 'backups') {
    const { status, body: result } = await callAccountWorkspace('backups');
    return reply(result, status);
  }

  if (body.action === 'backup' || body.action === 'restore') {
    if (!isBackupId(body.id)) return reply({ error: 'bad_request' }, 400);
    const { status, body: result } = await callAccountWorkspace(body.action, { id: body.id });
    return reply(result, status);
  }

  return reply({ error: 'bad_request' }, 400);
}
