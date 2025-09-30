import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { CommandMenu } from '@/components/command-menu'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const cookieStore = await cookies()
  const defaultClose = cookieStore.get("sidebar:state")?.value === "false"

  // Serialize user data for client component (only plain objects allowed)
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddresses?.[0]?.emailAddress || '',
    role: user.role,
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarProvider defaultOpen={!defaultClose}>
        <AppSidebar userRole={user.role || 'trainee'} user={serializedUser} />
        <div className="flex w-full flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </SidebarProvider>
      <CommandMenu userRole={user.role || 'trainee'} />
    </div>
  )
}