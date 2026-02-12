import { Inngest } from 'inngest'

// Environment variables required for production:
// - INNGEST_EVENT_KEY: Used to send events to Inngest (required in production)
// - INNGEST_SIGNING_KEY: Used to securely communicate between your app and Inngest (required in production)
// Both are automatically read by the Inngest SDK from process.env.
// In development, the Inngest Dev Server operates without these keys.

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.INNGEST_EVENT_KEY
) {
  throw new Error(
    'INNGEST_EVENT_KEY is required in production. ' +
      'Set it in your environment variables. ' +
      'Get your key from https://app.inngest.com/settings/keys'
  )
}

export const inngest = new Inngest({ id: 'voiceai-training' })
