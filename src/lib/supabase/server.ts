import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { auth } from "@clerk/nextjs/server"

// Admin client - bypasses RLS, use only for system operations
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  )
}

// User client - respects RLS using Clerk JWT
export async function createClient() {
  const cookieStore = await cookies()
  const { getToken } = await auth()

  // Get Clerk JWT with custom template
  const clerkToken = await getToken({ template: "supabase" })

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: clerkToken ? {
          Authorization: `Bearer ${clerkToken}`
        } : {}
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  )
}

export async function setOrgClaim(orgId: string) {
  const supabase = await createClient()
  await supabase.rpc('set_org_claim', { org_id: orgId })
}

export async function withOrgContext<T>(
  orgId: string,
  callback: () => Promise<T>
): Promise<T> {
  await setOrgClaim(orgId)
  return callback()
}