import type { InngestFunction } from 'inngest'

import { detectInactiveUsers } from './detect-inactive-users'
import { embedAttemptMemory } from './embed-attempt-memory'
import { sendDailyDigest } from './send-daily-digest'

/**
 * Standalone Inngest functions not owned by any agent.
 * Agent-owned functions are registered via the agent registry (src/lib/agents).
 */
export const functions: InngestFunction.Any[] = [detectInactiveUsers, embedAttemptMemory, sendDailyDigest]
