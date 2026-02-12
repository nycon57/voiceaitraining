import type { AgentDefinition } from '@/lib/agents/base'
import { registerAgent } from '@/lib/agents/registry'

import { onAttemptScored } from './on-attempt-scored'
import { onUserInactive } from './on-user-inactive'

export const coachAgent: AgentDefinition = {
  id: 'coach-agent',
  name: 'Coach Agent',
  description:
    'Maintains trainee weakness profiles after each scored attempt and sends practice reminders when trainees are inactive.',
  subscribesTo: ['attempt.scored', 'user.inactive'],
  inngestFunctions: [onAttemptScored, onUserInactive],
}

registerAgent(coachAgent)
