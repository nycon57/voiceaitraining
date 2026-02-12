import type { InngestFunction } from 'inngest'

/** Plain-object definition for an agent. No class inheritance — agents are data. */
export interface AgentDefinition {
  /** Unique identifier, e.g. 'coach-agent' */
  id: string
  /** Human-readable name, e.g. 'Coach Agent' */
  name: string
  /** What this agent does */
  description: string
  /** Event names this agent subscribes to */
  subscribesTo: string[]
  /** Inngest function implementations owned by this agent */
  inngestFunctions: InngestFunction.Any[]
}
