import type { AgentDefinition } from '@/lib/agents/base'
import { registerAgent } from '@/lib/agents/registry'

import { onAttemptScored } from './on-attempt-scored'
import { onUserInactive } from './on-user-inactive'

export const coachAgent: AgentDefinition = {
  id: 'coach-agent',
  name: 'Coach Agent',
  description:
    'Subscribes to attempt and inactivity events to maintain weakness profiles and send practice reminders.',
  subscribesTo: ['attempt.scored', 'user.inactive'],
  inngestFunctions: [onAttemptScored, onUserInactive],
}

registerAgent(coachAgent)
