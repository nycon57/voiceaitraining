import type { CopilotSession, CopilotSessionStatus } from './types'

/**
 * In-memory session manager for active copilot WebSocket connections.
 *
 * Sessions live only as long as the server process. This is intentional:
 * copilot sessions are ephemeral (one per live call) and don't need persistence.
 */

const sessions = new Map<string, CopilotSession>()

/** Interval (ms) between stale-session sweeps */
const STALE_CHECK_INTERVAL = 60_000
/** Sessions with no activity for this long are considered stale */
const STALE_THRESHOLD = 5 * 60_000

// Periodic cleanup of stale sessions (leaked connections that never closed)
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupRunning(): void {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [id, session] of sessions) {
      if (now - session.lastActivityAt.getTime() > STALE_THRESHOLD) {
        sessions.delete(id)
        console.log(`[copilot] Reaped stale session ${id}`)
      }
    }
    if (sessions.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }, STALE_CHECK_INTERVAL)
  // Don't prevent process exit
  cleanupTimer.unref()
}

export function createSession(
  id: string,
  userId: string,
  orgId: string,
  metadata: Record<string, unknown> = {},
): CopilotSession {
  const now = new Date()
  const session: CopilotSession = {
    id,
    userId,
    orgId,
    status: 'active',
    createdAt: now,
    lastActivityAt: now,
    audioByteCount: 0,
    metadata,
  }
  sessions.set(id, session)
  ensureCleanupRunning()
  return session
}

export function getSession(id: string): CopilotSession | undefined {
  return sessions.get(id)
}

export function updateSessionActivity(id: string, audioBytes?: number): void {
  const session = sessions.get(id)
  if (!session) return
  session.lastActivityAt = new Date()
  if (typeof audioBytes === 'number') {
    session.audioByteCount += audioBytes
  }
}

export function setSessionStatus(id: string, status: CopilotSessionStatus): void {
  const session = sessions.get(id)
  if (!session) return
  session.status = status
}

export function removeSession(id: string): CopilotSession | undefined {
  const session = sessions.get(id)
  sessions.delete(id)
  return session
}

export function getActiveSessionCount(): number {
  return sessions.size
}

export function getSessionsByUser(userId: string): CopilotSession[] {
  return Array.from(sessions.values()).filter((s) => s.userId === userId)
}

export function getSessionsByOrg(orgId: string): CopilotSession[] {
  return Array.from(sessions.values()).filter((s) => s.orgId === orgId)
}
