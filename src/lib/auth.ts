import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from './supabase/server'
import type { User } from '@clerk/nextjs/server'

export type UserRole = 'trainee' | 'manager' | 'admin' | 'hr'

export interface AuthUser {
  id: string
  role?: UserRole
  orgId?: string
  firstName?: string | null
  lastName?: string | null
  emailAddresses: { emailAddress: string }[]
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  if (!user) return null

  const { orgId } = await auth()
  if (!orgId) return user as AuthUser

  // Get user role from org membership
  const supabase = await createClient()
  const { data: member } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single()

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddresses: user.emailAddresses,
    role: member?.role as UserRole,
    orgId
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