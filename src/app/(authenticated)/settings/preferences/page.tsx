import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { PreferencesClient } from './preferences-client'

export default async function PreferencesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return <PreferencesClient user={user} />
}
