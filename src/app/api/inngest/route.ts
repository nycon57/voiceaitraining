import { serve } from 'inngest/next'

import { getAllAgentFunctions } from '@/lib/agents'
import { inngest } from '@/lib/inngest/client'
import { functions as standaloneFunctions } from '@/lib/inngest/functions'

// Agent functions are collected at module load time. Import agent registration
// modules (e.g. '@/lib/agents/coach') above this line so they register first.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...standaloneFunctions, ...getAllAgentFunctions()],
})
