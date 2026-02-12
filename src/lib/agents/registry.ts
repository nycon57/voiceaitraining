import type { InngestFunction } from 'inngest'

import type { AgentDefinition } from './base'

const agents = new Map<string, AgentDefinition>()

/** Register an agent. Overwrites any existing agent with the same id. */
export function registerAgent(agent: AgentDefinition): void {
  agents.set(agent.id, agent)
}

/** Look up an agent by id. Returns undefined if not found. */
export function getAgent(id: string): AgentDefinition | undefined {
  return agents.get(id)
}

/** Collect all Inngest functions from every registered agent. */
export function getAllAgentFunctions(): InngestFunction.Any[] {
  return Array.from(agents.values()).flatMap((agent) => agent.inngestFunctions)
}

/** Find all agents that subscribe to a given event name. */
export function getAgentsByEvent(eventName: string): AgentDefinition[] {
  return Array.from(agents.values()).filter((agent) =>
    agent.subscribesTo.includes(eventName)
  )
}
