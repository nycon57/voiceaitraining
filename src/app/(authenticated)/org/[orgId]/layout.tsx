import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

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

  const sidebarUser = {
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress || 'User',
    email: user.emailAddresses[0]?.emailAddress || '',
    role: user.role || 'trainee'
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        userRole={user.role || 'trainee'}
        orgId={orgId}
        user={sidebarUser}
      />
      <SidebarInset>
        <SiteHeader user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}