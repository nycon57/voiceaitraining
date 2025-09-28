import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from "@/components/layout/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, BarChart3, Trophy, Calendar } from "lucide-react"
import { TraineeOverview } from './_components/trainee/trainee-overview'
import { AdminOverview } from './_components/admin/admin-overview'
import { ManagerOverview } from './_components/manager/manager-overview'
import { HROverview } from './_components/hr/hr-overview'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Define tabs based on user role
  const getTabs = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { value: "overview", label: "Organization Overview", icon: BarChart3 },
          { value: "analytics", label: "Analytics", icon: BarChart3 },
          { value: "management", label: "Management", icon: Target },
        ]
      case 'manager':
        return [
          { value: "overview", label: "Team Overview", icon: Target },
          { value: "analytics", label: "Team Analytics", icon: BarChart3 },
          { value: "leaderboard", label: "Leaderboard", icon: Trophy },
        ]
      case 'hr':
        return [
          { value: "overview", label: "Compliance Overview", icon: Target },
          { value: "reports", label: "HR Reports", icon: BarChart3 },
        ]
      default: // trainee
        return [
          { value: "overview", label: "My Training", icon: Target },
          { value: "progress", label: "Progress", icon: BarChart3 },
          { value: "schedule", label: "Schedule", icon: Calendar },
        ]
    }
  }

  const tabs = getTabs(user.role || 'trainee')

  return (
    <>
      <Header />
      <div className="space-y-4 p-4">
        <div className="mb-2 flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {user.role === 'admin' ? 'Organization Dashboard' :
             user.role === 'manager' ? 'Team Dashboard' :
             user.role === 'hr' ? 'HR Dashboard' :
             'My Dashboard'}
          </h1>
        </div>

        <Tabs
          orientation="vertical"
          defaultValue="overview"
          className="space-y-4"
        >
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  <tab.icon size={14} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            {user.role === 'admin' && <AdminOverview user={user} />}
            {user.role === 'manager' && <ManagerOverview user={user} />}
            {user.role === 'hr' && <HROverview user={user} />}
            {(!user.role || user.role === 'trainee') && <TraineeOverview user={user} />}
          </TabsContent>

          {/* Additional tabs based on role */}
          {user.role === 'admin' && (
            <>
              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
                </div>
              </TabsContent>
              <TabsContent value="management" className="space-y-4">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Management tools coming soon...</p>
                </div>
              </TabsContent>
            </>
          )}

          {/* Similar placeholder tabs for other roles */}
          {tabs.slice(1).map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              <div className="text-center py-12">
                <p className="text-muted-foreground">{tab.label} coming soon...</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  )
}