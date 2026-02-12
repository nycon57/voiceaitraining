import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for background jobs where cookies() is unavailable.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
