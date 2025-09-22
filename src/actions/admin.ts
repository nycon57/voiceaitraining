'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { clerkClient } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, requireRole } from '@/lib/auth'

const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'trainee', 'hr']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  department: z.string().optional(),
  redirectUrl: z.string().url().optional(),
})

const bulkInviteSchema = z.object({
  users: z.array(inviteUserSchema),
})

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'manager', 'trainee', 'hr']),
})

export async function inviteUserToOrganization(formData: FormData) {
  const user = await getCurrentUser()
  if (!user?.orgId) {
    throw new Error('No organization context')
  }

  // Require admin or manager role
  await requireRole(['admin', 'manager'])

  const data = inviteUserSchema.parse({
    email: formData.get('email'),
    role: formData.get('role'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    department: formData.get('department') || undefined,
    redirectUrl: formData.get('redirectUrl') || undefined,
  })

  try {
    // Map our roles to Clerk roles
    const clerkRole = data.role === 'admin' ? 'org:admin' :
                     data.role === 'manager' ? 'org:manager' :
                     data.role === 'hr' ? 'org:hr' : 'org:member'

    // Create invitation via Clerk
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: user.orgId,
      emailAddress: data.email,
      role: clerkRole,
      inviterUserId: user.id,
      redirectUrl: data.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/org/${user.orgId}/dashboard`,
      publicMetadata: {
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
      }
    })

    // Log invitation in our database for tracking
    const supabase = await createClient()
    await supabase
      .from('user_invitations')
      .insert({
        org_id: user.orgId,
        email: data.email,
        role: data.role,
        first_name: data.firstName,
        last_name: data.lastName,
        department: data.department,
        invited_by: user.id,
        clerk_invitation_id: invitation.id,
        status: 'pending',
      })

    revalidatePath('/org/[orgId]/admin/users', 'page')
    return { success: true, invitationId: invitation.id }
  } catch (error: any) {
    console.error('Failed to invite user:', error)
    throw new Error(`Failed to send invitation: ${error.message}`)
  }
}

export async function bulkInviteUsers(formData: FormData) {
  const user = await getCurrentUser()
  if (!user?.orgId) {
    throw new Error('No organization context')
  }

  await requireRole(['admin', 'manager'])

  const csvData = formData.get('csvData') as string
  if (!csvData) {
    throw new Error('CSV data is required')
  }

  // Parse CSV data
  const lines = csvData.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

  const requiredHeaders = ['email', 'firstname', 'lastname', 'role']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
  }

  const users = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim())
    const user: any = {}

    headers.forEach((header, i) => {
      user[header] = values[i] || ''
    })

    try {
      return inviteUserSchema.parse({
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        role: user.role,
        department: user.department,
      })
    } catch (error) {
      throw new Error(`Row ${index + 2}: Invalid data - ${error}`)
    }
  })

  const results = []
  const errors = []

  for (const userData of users) {
    try {
      const clerkRole = userData.role === 'admin' ? 'org:admin' :
                       userData.role === 'manager' ? 'org:manager' :
                       userData.role === 'hr' ? 'org:hr' : 'org:member'

      const invitation = await clerkClient.organizations.createOrganizationInvitation({
        organizationId: user.orgId,
        emailAddress: userData.email,
        role: clerkRole,
        inviterUserId: user.id,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/org/${user.orgId}/dashboard`,
        publicMetadata: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          department: userData.department,
        }
      })

      // Log invitation
      const supabase = await createClient()
      await supabase
        .from('user_invitations')
        .insert({
          org_id: user.orgId,
          email: userData.email,
          role: userData.role,
          first_name: userData.firstName,
          last_name: userData.lastName,
          department: userData.department,
          invited_by: user.id,
          clerk_invitation_id: invitation.id,
          status: 'pending',
        })

      results.push({ email: userData.email, success: true, invitationId: invitation.id })
    } catch (error: any) {
      errors.push({ email: userData.email, error: error.message })
    }
  }

  revalidatePath('/org/[orgId]/admin/users', 'page')
  return { results, errors, total: users.length }
}

export async function updateUserRole(formData: FormData) {
  const user = await getCurrentUser()
  if (!user?.orgId) {
    throw new Error('No organization context')
  }

  await requireRole(['admin'])

  const data = updateUserRoleSchema.parse({
    userId: formData.get('userId'),
    role: formData.get('role'),
  })

  try {
    // Map role to Clerk role
    const clerkRole = data.role === 'admin' ? 'org:admin' :
                     data.role === 'manager' ? 'org:manager' :
                     data.role === 'hr' ? 'org:hr' : 'org:member'

    // Update role in Clerk
    await clerkClient.organizations.updateOrganizationMembership({
      organizationId: user.orgId,
      userId: data.userId,
      role: clerkRole,
    })

    // The webhook will handle updating our database

    revalidatePath('/org/[orgId]/admin/users', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update user role:', error)
    throw new Error(`Failed to update role: ${error.message}`)
  }
}

export async function removeUserFromOrganization(formData: FormData) {
  const user = await getCurrentUser()
  if (!user?.orgId) {
    throw new Error('No organization context')
  }

  await requireRole(['admin'])

  const userId = formData.get('userId') as string
  if (!userId) {
    throw new Error('User ID is required')
  }

  // Prevent removing self
  if (userId === user.id) {
    throw new Error('Cannot remove yourself from the organization')
  }

  try {
    // Remove from Clerk organization
    await clerkClient.organizations.deleteOrganizationMembership({
      organizationId: user.orgId,
      userId: userId,
    })

    // The webhook will handle updating our database

    revalidatePath('/org/[orgId]/admin/users', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to remove user:', error)
    throw new Error(`Failed to remove user: ${error.message}`)
  }
}

export async function revokeInvitation(formData: FormData) {
  const user = await getCurrentUser()
  if (!user?.orgId) {
    throw new Error('No organization context')
  }

  await requireRole(['admin', 'manager'])

  const invitationId = formData.get('invitationId') as string
  if (!invitationId) {
    throw new Error('Invitation ID is required')
  }

  try {
    // Revoke invitation in Clerk
    await clerkClient.organizations.revokeOrganizationInvitation({
      organizationId: user.orgId,
      invitationId: invitationId,
      requestingUserId: user.id,
    })

    // Update status in our database
    const supabase = await createClient()
    await supabase
      .from('user_invitations')
      .update({
        status: 'revoked',
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_invitation_id', invitationId)

    revalidatePath('/org/[orgId]/admin/users', 'page')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to revoke invitation:', error)
    throw new Error(`Failed to revoke invitation: ${error.message}`)
  }
}

export async function getOrganizationUsers() {
  const user = await getCurrentUser()
  if (!user?.orgId) {
    throw new Error('No organization context')
  }

  await requireRole(['admin', 'manager', 'hr'])

  const supabase = await createClient()

  // Get organization members
  const { data: members, error: membersError } = await supabase
    .from('org_members')
    .select(`
      user_id,
      role,
      created_at,
      updated_at,
      metadata,
      user_profiles!inner(
        email,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('org_id', user.orgId)
    .order('created_at', { ascending: false })

  if (membersError) {
    throw new Error(`Failed to fetch members: ${membersError.message}`)
  }

  // Get pending invitations
  const { data: invitations, error: invitationsError } = await supabase
    .from('user_invitations')
    .select('*')
    .eq('org_id', user.orgId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (invitationsError) {
    throw new Error(`Failed to fetch invitations: ${invitationsError.message}`)
  }

  return {
    members: members || [],
    invitations: invitations || [],
  }
}