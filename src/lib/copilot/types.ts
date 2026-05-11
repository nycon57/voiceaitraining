import { z } from 'zod'

// ============================================================================
// Audio format constants
// ============================================================================

/** Expected audio: PCM 16-bit, 16 kHz, mono */
const AUDIO_SAMPLE_RATE = 16_000
const AUDIO_CHANNELS = 1
const AUDIO_BIT_DEPTH = 16

// ============================================================================
// Session types
// ============================================================================

export type CopilotSessionStatus = 'connecting' | 'active' | 'closing' | 'closed'

export interface CopilotSession {
  id: string
  userId: string
  orgId: string
  status: CopilotSessionStatus
  createdAt: Date
  lastActivityAt: Date
  /** Total audio bytes received during this session */
  audioByteCount: number
  /** Metadata attached at connection time */
  metadata: Record<string, unknown>
}

export type ServerMessage = ConnectedMessage | ErrorMessage | AckMessage

// ============================================================================
// WebSocket message types (client → server)
// ============================================================================

/** Binary audio chunks are sent as raw Buffer, not JSON */

export const clientControlSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('ping') }),
  z.object({
    type: z.literal('config'),
    sampleRate: z.number().int().positive().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  z.object({ type: z.literal('end') }),
])

// ============================================================================
// WebSocket close codes
// ============================================================================

export const WS_CLOSE_CODES = {
  NORMAL: 1000,
  GOING_AWAY: 1001,
  AUTH_FAILED: 4001,
  INVALID_PAYLOAD: 4002,
  SESSION_EXPIRED: 4003,
  SERVER_ERROR: 4008,
} as const
