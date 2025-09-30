import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ProfileSettingsClient } from './profile-settings-client'

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Mock user data - in production this would come from DB
  const profileData = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.emailAddresses[0]?.emailAddress || '',
    phone: '',
    jobTitle: '',
    department: '',
    avatarUrl: null as string | null,
    memberSince: new Date('2024-01-15'),
    totalSessions: 42,
    averageScore: 87,
    profileCompletion: 75,
  }

  return <ProfileSettingsClient user={user} profileData={profileData} />
}
