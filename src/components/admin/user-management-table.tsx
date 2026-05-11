'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, UserMinus, Shield, Clock, Mail } from 'lucide-react'
import { formatShortDate } from '@/lib/date-display'
import { updateUserRole, removeUserFromOrganization, revokeInvitation } from '@/actions/admin'

interface User {
  user_id: string
  role: string
  created_at: string
  user_profiles: {
    email: string
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  first_name: string
  last_name: string
  department?: string
  created_at: string
  clerk_invitation_id: string
}

interface UserManagementTableProps {
  members: User[]
  invitations: Invitation[]
  currentUserId: string
  currentUserRole: string
}

export function UserManagementTable({
  members,
  invitations,
  currentUserId,
  currentUserRole
}: UserManagementTableProps) {
  const [removeDialog, setRemoveDialog] = useState<{ open: boolean; user?: User }>({ open: false })
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; invitation?: Invitation }>({ open: false })
  const [isLoading, startUserTransition] = useTransition()

  const canManageUsers = currentUserRole === 'admin'
  const canInviteUsers = currentUserRole === 'admin' || currentUserRole === 'manager'

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'hr': return 'bg-chart-2/10 text-chart-2'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!canManageUsers) return

    startUserTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('role', newRole)
        await updateUserRole(formData)
      } catch (error) {
        console.error('Failed to update role:', error)
      }
    })
  }

  const handleRemoveUser = async () => {
    if (!removeDialog.user || !canManageUsers) return

    startUserTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('userId', removeDialog.user.user_id)
        await removeUserFromOrganization(formData)
        setRemoveDialog({ open: false })
      } catch (error) {
        console.error('Failed to remove user:', error)
      }
    })
  }

  const handleRevokeInvitation = async () => {
    if (!revokeDialog.invitation || !canInviteUsers) return

    startUserTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('invitationId', revokeDialog.invitation.clerk_invitation_id)
        await revokeInvitation(formData)
        setRevokeDialog({ open: false })
      } catch (error) {
        console.error('Failed to revoke invitation:', error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Organization Members ({members.length})
          </CardTitle>
          <CardDescription>
            Active users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={member.user_profiles.avatar_url} />
                        <AvatarFallback>
                          {member.user_profiles.first_name?.[0]}
                          {member.user_profiles.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.user_profiles.first_name} {member.user_profiles.last_name}
                        </div>
                        {member.user_id === currentUserId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.user_profiles.email}</TableCell>
                  <TableCell>
                    {canManageUsers && member.user_id !== currentUserId ? (
                      <Select
                        value={member.role}
                        onValueChange={(newRole) => handleRoleChange(member.user_id, newRole)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trainee">Trainee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {formatShortDate(member.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {canManageUsers && member.user_id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="size-8 p-0">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setRemoveDialog({ open: true, user: member })}
                          >
                            <UserMinus className="size-4 mr-2" />
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>
              Users who have been invited but haven't joined yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-zinc-200 flex items-center justify-center">
                          <Mail className="size-4 text-zinc-500" />
                        </div>
                        <div className="font-medium">
                          {invitation.first_name} {invitation.last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(invitation.role)}>
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{invitation.department || '-'}</TableCell>
                    <TableCell suppressHydrationWarning>
                      {formatShortDate(invitation.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {canInviteUsers && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeDialog({ open: true, invitation })}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Remove User Dialog */}
      <AlertDialog open={removeDialog.open} onOpenChange={(open) => setRemoveDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removeDialog.user?.user_profiles.first_name} {removeDialog.user?.user_profiles.last_name} from the organization?
              This action cannot be undone and will revoke all their access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Invitation Dialog */}
      <AlertDialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation for {revokeDialog.invitation?.email}?
              They will no longer be able to join the organization using this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvitation}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Revoking...' : 'Revoke Invitation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
