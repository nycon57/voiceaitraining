import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient, createAdminClient } from './supabase/server'
import type { User } from '@clerk/nextjs/server'

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
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  if (!user) return null

  // Use admin client to bypass RLS - we need org_id to set RLS context,
  // but we're querying to GET the org_id (chicken-and-egg problem)
  const supabase = await createAdminClient()
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('role, org_id, first_name, last_name, email')
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
    orgId: dbUser?.org_id
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
export async function withOrgGuard<T>(
  callback: (user: AuthUser, orgId: string) => Promise<T>
): Promise<T> {
  const user = await requireAuth()

  if (!user.orgId) {
    throw new Error('Organization context required')
  }

  // Set org context for RLS
  const supabase = await createClient()
  await supabase.rpc('set_org_claim', { org_id: user.orgId })

  return callback(user, user.orgId)
}

export async function withRoleGuard<T>(
  requiredRoles: UserRole | UserRole[],
  callback: (user: AuthUser, orgId: string) => Promise<T>
): Promise<T> {
  const user = await requireRole(requiredRoles)

  if (!user.orgId) {
    throw new Error('Organization context required')
  }

  // Set org context for RLS
  const supabase = await createClient()
  await supabase.rpc('set_org_claim', { org_id: user.orgId })

  return callback(user, user.orgId)
}