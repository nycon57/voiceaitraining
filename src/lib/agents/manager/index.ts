import type { AgentDefinition } from '@/lib/agents/base'
import { registerAgent } from '@/lib/agents/registry'

export const managerAgent: AgentDefinition = {
  id: 'manager-intelligence',
  name: 'Manager Intelligence Agent',
  description:
    'Monitors team performance to surface systemic skill gaps, at-risk reps, and top performers across the organization.',
  subscribesTo: [
    'attempt.scored',
    'coach.weakness.updated',
    'user.inactive',
  ],
  inngestFunctions: [],
}

registerAgent(managerAgent)
