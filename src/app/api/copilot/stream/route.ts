import { NextResponse } from 'next/server'

import { getActiveSessionCount } from '@/lib/copilot/session-manager'

/**
 * GET /api/copilot/stream
 *
 * HTTP endpoint for health checks and connection info.
 * Actual WebSocket connections are handled by the custom server (server.mjs)
 * which intercepts the HTTP upgrade request before it reaches Next.js.
 *
 * If a client hits this endpoint without a WebSocket upgrade header,
 * they get connection instructions.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    protocol: 'websocket',
    path: '/api/copilot/stream',
    activeSessions: getActiveSessionCount(),
    // Token-based auth: use short-lived handshake tokens issued via /api/copilot/handshake.
    // For non-browser clients, prefer Authorization: Bearer <token> header on the upgrade request.
    // Do NOT pass long-lived JWTs as query parameters — they may be logged by reverse proxies.
    instructions:
      'Connect via WebSocket: ws(s)://host/api/copilot/stream. Authenticate using a short-lived handshake token or Authorization header.',
    audioFormat: {
      encoding: 'pcm',
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
    },
  })
}
