import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Header } from "@/components/layout/header"
import { SkeletonDashboard } from '@/components/ui/loading-skeleton'
import { TraineeOverview } from '@/components/dashboard/trainee-overview'
import { AdminOverview } from '@/components/dashboard/admin-overview'
import { ManagerOverview } from '@/components/dashboard/manager-overview'
import { HROverview } from '@/components/dashboard/hr-overview'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <>
      <Header />
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <Suspense fallback={<SkeletonDashboard />}>
          {user.role === 'admin' && <AdminOverview user={user} />}
          {user.role === 'manager' && <ManagerOverview user={user} />}
          {user.role === 'hr' && <HROverview user={user} />}
          {(!user.role || user.role === 'trainee') && <TraineeOverview user={user} />}
        </Suspense>
      </div>
    </>
  )
}