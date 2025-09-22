import { getCurrentUser, requireRole } from '@/lib/auth'
import { getOrganizationUsers } from '@/actions/admin'
import { UserInviteForm } from '@/components/admin/user-invite-form'
import { UserManagementTable } from '@/components/admin/user-management-table'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user?.orgId) {
    redirect('/select-org')
  }

  try {
    // Require admin, manager, or HR role to view this page
    await requireRole(['admin', 'manager', 'hr'])
  } catch {
    redirect(`/org/${user.orgId}/dashboard`)
  }

  let data
  try {
    data = await getOrganizationUsers()
  } catch (error) {
    console.error('Failed to load organization data:', error)
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
          <p className="text-muted-foreground">
            Failed to load organization users. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  const canInviteUsers = user.role === 'admin' || user.role === 'manager'

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage organization members, roles, and invitations
        </p>
      </div>

      {canInviteUsers && (
        <UserInviteForm />
      )}

      <UserManagementTable
        members={data.members}
        invitations={data.invitations}
        currentUserId={user.id}
        currentUserRole={user.role}
      />
    </div>
  )
}