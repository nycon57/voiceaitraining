import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'voiceai-training' })

const REQUIRED_ENV_VARS = ['INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY'] as const

/**
 * Validates that required Inngest env vars are set in production.
 * Call at app startup -- not at module load time, since CI injects env vars at deploy.
 */
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
