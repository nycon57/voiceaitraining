declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_APP_URL: string
    NEXT_RUNTIME?: string

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string

    // Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
    CLERK_SECRET_KEY: string
    CLERK_WEBHOOK_SECRET?: string

    // Stripe
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
    NEXT_PUBLIC_STRIPE_PRICE_STARTER?: string
    NEXT_PUBLIC_STRIPE_PRICE_GROWTH?: string
    NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE?: string

    // Email
    RESEND_API_KEY: string
    EMAIL_FROM: string

    // AI
    OPENAI_API_KEY: string
    DEEPGRAM_API_KEY?: string
    ELEVENLABS_API_KEY?: string

    // Vapi
    VAPI_API_KEY: string
    VAPI_PROJECT_ID: string

    // Security
    WEBHOOK_DEFAULT_SECRET: string
    ENCRYPTION_KEY?: string

    // Monitoring
    SENTRY_DSN?: string
    NEXT_PUBLIC_POSTHOG_KEY?: string
    NEXT_PUBLIC_POSTHOG_HOST?: string
  }
}