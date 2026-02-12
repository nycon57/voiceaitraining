import type { InngestFunction } from 'inngest'

import { detectInactiveUsers } from './detect-inactive-users'

/**
 * Standalone Inngest functions not owned by any agent.
 * Agent-owned functions are registered via the agent registry (src/lib/agents).
 */
export const functions: InngestFunction.Any[] = [detectInactiveUsers]
