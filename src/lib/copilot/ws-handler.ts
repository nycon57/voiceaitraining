import { randomUUID } from 'crypto'
import type { IncomingMessage } from 'http'
import type { WebSocket } from 'ws'

import { verifyToken } from '@clerk/backend'

import {
  createSession,
  removeSession,
  setSessionStatus,
  updateSessionActivity,
} from './session-manager'
import type { ServerMessage } from './types'
import { clientControlSchema, WS_CLOSE_CODES } from './types'

// ============================================================================
// Auth
// ============================================================================

interface TokenClaims {
  sub: string
  org_id?: string
  metadata?: Record<string, unknown>
}

async function authenticateToken(token: string): Promise<TokenClaims | null> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) {
      console.error('[copilot] CLERK_SECRET_KEY not configured')
      return null
    }

    const payload = await verifyToken(token, { secretKey })

    const sub = payload.sub
    if (!sub) return null

    // org_id may be in the token's custom claims or metadata
    const orgId =
      (payload as Record<string, unknown>).org_id as string | undefined

    return {
      sub,
      org_id: orgId,
      metadata: payload as unknown as Record<string, unknown>,
    }
  } catch (err) {
    console.warn('[copilot] Token verification failed:', (err as Error).message)
    return null
  }
}

// ============================================================================
// Origin allowlist
// ============================================================================

/** Reads comma-separated origin allowlist from env. Empty list = skip check. */
function getAllowedOrigins(): string[] {
  const raw = process.env.COPILOT_ALLOWED_ORIGINS
  if (!raw) return []
  return raw.split(',').map((o) => o.trim().toLowerCase()).filter(Boolean)
}

// ============================================================================
// Send helper
// ============================================================================

function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

// ============================================================================
// Connection handler — called by the custom server on upgrade
// ============================================================================

/**
 * Handles a new WebSocket connection for the copilot stream.
 *
 * Flow:
 * 1. Validate Origin against allowlist
 * 2. Extract token from Authorization header (or cookie fallback)
 * 3. Verify JWT → reject with 4001 if invalid
 * 4. Validate org_id presence → reject if missing
 * 5. Create session → send 'connected' message
 * 6. Listen for binary audio chunks and JSON control messages
 * 7. Clean up on close/error
 */
export async function handleCopilotConnection(
  ws: WebSocket,
  req: IncomingMessage,
): Promise<void> {
  // ── Origin validation ──────────────────────────────────────────────
  const allowedOrigins = getAllowedOrigins()
  const origin = req.headers.origin?.toLowerCase()
  if (allowedOrigins.length > 0 && (!origin || !allowedOrigins.includes(origin))) {
    send(ws, { type: 'error', code: 'AUTH_ORIGIN', message: 'Origin not allowed' })
    ws.close(WS_CLOSE_CODES.AUTH_FAILED, 'Origin not allowed')
    return
  }

  // ── Token extraction ───────────────────────────────────────────────
  // Prefer Authorization header; fall back to HttpOnly cookie for browser clients.
  let token: string | null = null
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    const cookieHeader = req.headers.cookie ?? ''
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('copilot_token='))
    if (match) {
      token = match.split('=').slice(1).join('=')
    }
  }

  if (!token) {
    send(ws, { type: 'error', code: 'AUTH_MISSING', message: 'Token required' })
    ws.close(WS_CLOSE_CODES.AUTH_FAILED, 'Token required')
    return
  }

  // Verify JWT
  const claims = await authenticateToken(token)
  if (!claims) {
    send(ws, {
      type: 'error',
      code: 'AUTH_INVALID',
      message: 'Invalid or expired token',
    })
    ws.close(WS_CLOSE_CODES.AUTH_FAILED, 'Invalid or expired token')
    return
  }

  // Validate org membership
  const orgId = claims.org_id
  if (!orgId) {
    send(ws, { type: 'error', code: 'MISSING_ORG', message: 'Organization ID required' })
    ws.close(WS_CLOSE_CODES.AUTH_FAILED, 'Organization ID required')
    return
  }

  // Create session
  const sessionId = randomUUID()
  const userId = claims.sub

  const session = createSession(sessionId, userId, orgId)
  let sequenceNumber = 0

  // Confirm connection
  send(ws, {
    type: 'connected',
    sessionId,
    sampleRate: 16_000,
    channels: 1,
  })

  console.log(
    `[copilot] Session ${sessionId} connected (user=${userId}, org=${orgId})`,
  )

  // ── Message handler ─────────────────────────────────────────────────
  ws.on('message', (data: Buffer | string, isBinary: boolean) => {
    if (isBinary) {
      // Binary data = audio chunk
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
      sequenceNumber++
      updateSessionActivity(sessionId, buffer.byteLength)

      // Audio chunk is now available for the processing pipeline.
      // Downstream consumers (US-032 live STT, US-033 analyzer) will
      // subscribe to these chunks via an event emitter or direct call.
      // For now, we acknowledge receipt so the client knows data arrived.
      if (sequenceNumber % 50 === 0) {
        send(ws, { type: 'ack', bytesReceived: session.audioByteCount })
      }
      return
    }

    // Text data = JSON control message
    try {
      const text = typeof data === 'string' ? data : data.toString('utf-8')
      const parsed = JSON.parse(text)
      const control = clientControlSchema.parse(parsed)

      switch (control.type) {
        case 'ping':
          updateSessionActivity(sessionId)
          break

        case 'config':
          if (control.metadata) {
            Object.assign(session.metadata, control.metadata)
          }
          updateSessionActivity(sessionId)
          break

        case 'end':
          setSessionStatus(sessionId, 'closing')
          ws.close(WS_CLOSE_CODES.NORMAL, 'Client ended session')
          break
      }
    } catch {
      send(ws, {
        type: 'error',
        code: 'INVALID_MESSAGE',
        message: 'Could not parse control message',
      })
    }
  })

  // ── Close handler ───────────────────────────────────────────────────
  ws.on('close', (code: number, reason: Buffer) => {
    const removed = removeSession(sessionId)
    console.log(
      `[copilot] Session ${sessionId} closed (code=${code}, reason=${reason.toString()}, bytes=${removed?.audioByteCount ?? 0})`,
    )
  })

  // ── Error handler ───────────────────────────────────────────────────
  ws.on('error', (err: Error) => {
    console.error(`[copilot] Session ${sessionId} error:`, err.message)
    setSessionStatus(sessionId, 'closed')
    removeSession(sessionId)
  })
}
