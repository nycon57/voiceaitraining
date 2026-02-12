import { Inngest } from 'inngest'

// Environment variables required for production:
// - INNGEST_EVENT_KEY: Used to send events to Inngest (required in production)
// - INNGEST_SIGNING_KEY: Used to securely communicate between Inngest and your app (required in production)
// Both are automatically read by the Inngest SDK from process.env.
// In development, the Inngest Dev Server operates without these keys.

export const inngest = new Inngest({ id: 'voiceai-training' })

/**
 * Validates that required Inngest environment variables are set in production.
 * Call at application startup or before first use — NOT at module load time,
 * to avoid breaking `next build` in CI where env vars are injected at deploy time.
 *
 * @throws {Error} If INNGEST_EVENT_KEY or INNGEST_SIGNING_KEY is missing in production
 */
export function assertInngestEnv(): void {
  if (process.env.NODE_ENV !== 'production') return

  const missing: string[] = []
  if (!process.env.INNGEST_EVENT_KEY) missing.push('INNGEST_EVENT_KEY')
  if (!process.env.INNGEST_SIGNING_KEY) missing.push('INNGEST_SIGNING_KEY')

  if (missing.length > 0) {
    throw new Error(
      `${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} required in production. ` +
        'Set them in your environment variables. ' +
        'Get your keys from https://app.inngest.com/settings/keys'
    )
  }
}
