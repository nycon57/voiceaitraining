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
    instructions:
      'Connect via WebSocket: ws(s)://host/api/copilot/stream?token=<jwt>',
    audioFormat: {
      encoding: 'pcm',
      sampleRate: 16000,
      channels: 1,
      bitDepth: 16,
    },
  })
}
