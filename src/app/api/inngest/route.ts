import { serve } from 'inngest/next'

import { inngest } from '@/lib/inngest/client'
import { functions } from '@/lib/inngest/functions'

// Inngest's serve() handles its own request validation and signature verification
// via INNGEST_SIGNING_KEY. No additional Zod validation needed for this handler.
// Use assertInngestEnv() from @/lib/inngest/client at app startup to validate
// that required environment variables are set in production.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
})
