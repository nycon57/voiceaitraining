import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from "next/headers"
import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from '@/components/dashboard/app-sidebar'

interface OrgLayoutProps {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgId } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  if (!user.orgId || user.orgId !== orgId) {
    redirect('/select-org')
  }

  const cookieStore = await cookies()
  const defaultClose = cookieStore.get("sidebar:state")?.value === "false"

  return (
    <div className="border-grid flex flex-1 flex-col">
      <SidebarProvider defaultOpen={!defaultClose}>
        <AppSidebar userRole={user.role || 'trainee'} />
        <div
          id="content"
          className={cn(
            "flex h-full w-full flex-col",
            "has-[div[data-layout=fixed]]:h-svh",
            "group-data-[scroll-locked=1]/body:h-full",
            "has-[data-layout=fixed]:group-data-[scroll-locked=1]/body:h-svh"
          )}
        >
          {children}
        </div>
      </SidebarProvider>
    </div>
  )
}