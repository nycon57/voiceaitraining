import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient, createAdminClient } from './supabase/server'
import type { User } from '@clerk/nextjs/server'
import type { PlanType } from './plans'

export type UserRole = 'trainee' | 'manager' | 'admin' | 'hr'

export interface AuthUser {
  id: string
  role?: UserRole
  orgId?: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  name?: string
  emailAddresses: { emailAddress: string }[]
  isPersonalOrg?: boolean
  plan?: PlanType
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  if (!user) return null

  // Use admin client to bypass RLS - we need org_id to set RLS context,
  // but we're querying to GET the org_id (chicken-and-egg problem)
  const supabase = await createAdminClient()
  const { data: dbUser, error } = await supabase
    .from('users')
    .select(`
      role,
      org_id,
      first_name,
      last_name,
      email,
      orgs:org_id (
        is_personal,
        plan
      )
    `)
    .eq('clerk_user_id', user.id)
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching user from database:', error)
  }

  // Fallback to Clerk data if Supabase user not found
  const firstName = dbUser?.first_name || user.firstName
  const lastName = dbUser?.last_name || user.lastName
  const email = dbUser?.email || user.emailAddresses[0]?.emailAddress

  // Extract org info from array (Supabase returns joins as arrays)
  const orgInfo = Array.isArray(dbUser?.orgs) ? dbUser.orgs[0] : dbUser?.orgs

  return {
    id: user.id,
    firstName,
    lastName,
    email,
    name: firstName || user.firstName || 'User',
    emailAddresses: user.emailAddresses.map(email => ({
      emailAddress: email.emailAddress
    })),
    role: dbUser?.role as UserRole,
    orgId: dbUser?.org_id,
    isPersonalOrg: orgInfo?.is_personal || false,
    plan: orgInfo?.plan as PlanType
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(requiredRoles: UserRole | UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!user.role || !roles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${roles.join(' or ')}`)
  }

  return user
}

export function hasRole(userRole?: UserRole, requiredRoles?: UserRole | UserRole[]): boolean {
  if (!userRole || !requiredRoles) return false
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(userRole)
}

export function hasPermission(
  userRole?: UserRole,
  permission?: 'read' | 'write' | 'admin'
): boolean {
  if (!userRole) return false

  switch (permission) {
    case 'read':
      return ['trainee', 'manager', 'admin', 'hr'].includes(userRole)
    case 'write':
      return ['manager', 'admin'].includes(userRole)
    case 'admin':
      return userRole === 'admin'
    default:
      return false
  }
}

// Guard for server actions and API routes
// Returns admin client with RLS claims already set for the session
export async function withOrgGuard<T>(
  callback: (user: AuthUser, orgId: string, supabase: Awaited<ReturnType<typeof createAdminClient>>) => Promise<T>
): Promise<T> {
  const user = await requireAuth()

  console.log('[DEBUG] withOrgGuard - User:', {
    id: user.id,
    orgId: user.orgId,
    role: user.role,
    email: user.email,
  })

  if (!user.orgId) {
    console.error('[DEBUG] withOrgGuard - No orgId found for user:', user.id)
    throw new Error('Organization context required')
  }

  // Set user and org context for RLS using admin client
  // Admin client is required to call set_config() functions
  const supabase = await createAdminClient()

  console.log('[DEBUG] withOrgGuard - Calling RPC set_user_and_org_claims with:', {
    p_user_id: user.id,
    p_org_id: user.orgId
  })

  const { data, error } = await supabase.rpc('set_user_and_org_claims', {
    p_user_id: user.id,
    p_org_id: user.orgId
  })

  if (error) {
    console.error('[DEBUG] withOrgGuard - RPC call failed with error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: JSON.stringify(error, null, 2)
    })
    throw new Error(`Failed to set RLS claims: ${error.message}`)
  }

  console.log('[DEBUG] withOrgGuard - RPC call succeeded, data:', data)

  // Pass the admin client with claims set to the callback
  return callback(user, user.orgId, supabase)
}

export async function withRoleGuard<T>(
  requiredRoles: UserRole | UserRole[],
  callback: (user: AuthUser, orgId: string, supabase: Awaited<ReturnType<typeof createAdminClient>>) => Promise<T>
): Promise<T> {
  const user = await requireRole(requiredRoles)

  console.log('[DEBUG] withRoleGuard - User:', {
    id: user.id,
    orgId: user.orgId,
    role: user.role,
    requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
    email: user.email,
  })

  if (!user.orgId) {
    console.error('[DEBUG] withRoleGuard - No orgId found for user:', user.id)
    throw new Error('Organization context required')
  }

  // Set user and org context for RLS using admin client
  // Admin client is required to call set_config() functions
  const supabase = await createAdminClient()

  console.log('[DEBUG] withRoleGuard - Calling RPC set_user_and_org_claims with:', {
    p_user_id: user.id,
    p_org_id: user.orgId
  })

  const { data, error } = await supabase.rpc('set_user_and_org_claims', {
    p_user_id: user.id,
    p_org_id: user.orgId
  })

  if (error) {
    console.error('[DEBUG] withRoleGuard - RPC call failed with error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: JSON.stringify(error, null, 2)
    })
    throw new Error(`Failed to set RLS claims: ${error.message}`)
  }

  console.log('[DEBUG] withRoleGuard - RPC call succeeded, data:', data)

  // Pass the admin client with claims set to the callback
  return callback(user, user.orgId, supabase)
}

// ============================================================================
// Personal Organization Helpers
// ============================================================================

/**
 * Check if the current user is in a personal organization
 */
export async function isPersonalOrgUser(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.isPersonalOrg || false
}

/**
 * Get personal org ID for a user
 */
export async function getPersonalOrgId(clerkUserId: string): Promise<string | null> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .rpc('get_personal_org_id', { p_clerk_user_id: clerkUserId })

  if (error) {
    console.error('Error getting personal org ID:', error)
    return null
  }

  return data
}

/**
 * Check if an org is a personal org
 */
export async function isPersonalOrg(orgId: string): Promise<boolean> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('orgs')
    .select('is_personal')
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error checking if org is personal:', error)
    return false
  }

  return data?.is_personal || false
}

/**
 * Get org details including personal status
 */
export async function getOrgDetails(orgId: string) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('orgs')
    .select('id, name, plan, is_personal, personal_user_clerk_id, plan_limits, settings')
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error fetching org details:', error)
    return null
  }

  return data
}

/**
 * Check if team features should be shown
 * Returns false for personal orgs, true for team orgs
 */
export function shouldShowTeamFeatures(user?: AuthUser | null): boolean {
  if (!user) return false

  // Personal org users don't see team features
  if (user.isPersonalOrg) return false

  // Team org users see team features
  return true
}

/**
 * Check if user has access to a specific feature based on plan
 */
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user || !user.orgId) return false

  const orgDetails = await getOrgDetails(user.orgId)
  if (!orgDetails) return false

  const limits = orgDetails.plan_limits || {}

  // Check specific feature access
  switch (feature) {
    case 'ai_generation':
      return limits.ai_generation === true
    case 'custom_branding':
      return limits.custom_branding === true
    case 'priority_support':
      return limits.priority_support === true
    case 'webhooks':
      return limits.webhooks === true
    case 'sso':
      return limits.sso === true
    default:
      return false
  }
}

/**
 * Check if user is within usage limits
 */
export async function checkUsageLimit(
  limitType: 'max_users' | 'max_sessions_per_month' | 'max_scenarios',
  currentCount: number
): Promise<{ allowed: boolean; limit: number; usage: number }> {
  const user = await getCurrentUser()
  if (!user || !user.orgId) {
    return { allowed: false, limit: 0, usage: currentCount }
  }

  const orgDetails = await getOrgDetails(user.orgId)
  if (!orgDetails) {
    return { allowed: false, limit: 0, usage: currentCount }
  }

  const limits = orgDetails.plan_limits || {}
  const limit = limits[limitType] || 0

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, usage: currentCount }
  }

  return {
    allowed: currentCount < limit,
    limit,
    usage: currentCount
  }
}