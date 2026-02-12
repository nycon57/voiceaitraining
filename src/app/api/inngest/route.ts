import { serve } from 'inngest/next'

import { getAllAgentFunctions } from '@/lib/agents'
// Agent registration modules — must import before getAllAgentFunctions() runs.
import '@/lib/agents/coach'
import '@/lib/agents/manager'
import { inngest } from '@/lib/inngest/client'
import { functions as standaloneFunctions } from '@/lib/inngest/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [...standaloneFunctions, ...getAllAgentFunctions()],
})
