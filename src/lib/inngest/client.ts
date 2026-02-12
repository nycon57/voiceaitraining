import { EventSchemas, Inngest } from 'inngest'

import { eventSchemas } from '@/lib/events/types'

export const inngest = new Inngest({
  id: 'voiceai-training',
  schemas: new EventSchemas().fromSchema(eventSchemas),
})

const REQUIRED_ENV_VARS = ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'] as const

/** Asserts required Inngest env vars in production. Call at startup, not module load. */
export function assertInngestEnv(): void {
  if (process.env.NODE_ENV !== 'production') return

  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing ${missing.join(', ')}. ` +
        'Required in production. Get keys at https://app.inngest.com/settings/keys'
    )
  }
}
