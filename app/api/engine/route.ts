import { NextResponse } from 'next/server';

/**
 * GET /api/engine/status
 * Returns basic health info. The main simulation runs client-side;
 * this endpoint exists for integration / health-check purposes.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'ThreadSphere engine running client-side via React hooks',
    version: '1.0.0',
    timestamp: Date.now(),
  });
}

/**
 * POST /api/engine/status
 * Accepts a simulation snapshot for server-side logging (optional).
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    // In a full deployment this could persist to a database / stream to observability
    console.log('[ThreadSphere API] Snapshot received:', JSON.stringify(body).slice(0, 200));
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
