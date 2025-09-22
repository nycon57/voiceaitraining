"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  Target,
  BarChart3,
  Calendar,
  PlayCircle,
  History,
  Trophy,
  Webhook,
  CreditCard,
  Shield,
  UserPlus,
  Clipboard,
  Settings,
  TrendingUp,
  Home,
  Mic,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavProjects } from "@/components/dashboard/nav-projects"
import { NavUser } from "@/components/dashboard/nav-user"
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This would come from your auth context/hook
interface User {
  id: string
  email: string
  name: string
  role: 'trainee' | 'manager' | 'admin' | 'hr'
}

interface Team {
  name: string
  logo: React.ElementType
  plan: string
}

// Navigation data based on user role
const getNavigationData = (userRole: User['role'], orgId?: string) => {
  const baseNavigation = {
    navMain: [] as any[],
    projects: [] as any[],
  }

  const orgPath = orgId ? `/org/${orgId}` : ''

  // Common navigation for all users
  baseNavigation.navMain.push({
    title: "Dashboard",
    url: `${orgPath}/dashboard`,
    icon: Home,
    isActive: true,
  })

  // Role-specific navigation
  switch (userRole) {
    case 'trainee':
      baseNavigation.navMain.push(
        {
          title: "My Training",
          url: `${orgPath}/assignments`,
          icon: Target,
          items: [
            {
              title: "Assignments",
              url: `${orgPath}/assignments`,
            },
            {
              title: "Practice",
              url: `${orgPath}/scenarios`,
            },
            {
              title: "History",
              url: `${orgPath}/attempts`,
            },
          ],
        },
        {
          title: "Voice Simulator",
          url: `${orgPath}/play`,
          icon: Mic,
        },
        {
          title: "Leaderboard",
          url: `${orgPath}/leaderboard`,
          icon: Trophy,
        },
        {
          title: "My Progress",
          url: `${orgPath}/progress`,
          icon: TrendingUp,
        }
      )
      break

    case 'manager':
      baseNavigation.navMain.push(
        {
          title: "Team Management",
          url: `${orgPath}/team`,
          icon: Users,
          items: [
            {
              title: "Team Overview",
              url: `${orgPath}/team`,
            },
            {
              title: "Assign Training",
              url: `${orgPath}/assignments/new`,
            },
            {
              title: "Team Performance",
              url: `${orgPath}/reports/team`,
            },
            {
              title: "Reviews",
              url: `${orgPath}/attempts`,
            },
          ],
        },
        {
          title: "Content Library",
          url: `${orgPath}/scenarios`,
          icon: BookOpen,
          items: [
            {
              title: "Scenarios",
              url: `${orgPath}/scenarios`,
            },
            {
              title: "Training Tracks",
              url: `${orgPath}/tracks`,
            },
          ],
        },
        {
          title: "Analytics",
          url: `${orgPath}/reports`,
          icon: BarChart3,
          items: [
            {
              title: "Team Reports",
              url: `${orgPath}/reports`,
            },
            {
              title: "Leaderboards",
              url: `${orgPath}/leaderboard`,
            },
            {
              title: "Performance Trends",
              url: `${orgPath}/reports/trends`,
            },
          ],
        },
        {
          title: "Assignments",
          url: `${orgPath}/assignments`,
          icon: Clipboard,
        }
      )
      break

    case 'admin':
      baseNavigation.navMain.push(
        {
          title: "Organization",
          url: `${orgPath}/settings`,
          icon: Settings2,
          items: [
            {
              title: "User Management",
              url: `${orgPath}/admin/users`,
            },
            {
              title: "Teams",
              url: `${orgPath}/settings/teams`,
            },
            {
              title: "Billing",
              url: `${orgPath}/settings/billing`,
            },
            {
              title: "Settings",
              url: `${orgPath}/settings`,
            },
          ],
        },
        {
          title: "Content Management",
          url: `${orgPath}/scenarios`,
          icon: BookOpen,
          items: [
            {
              title: "Scenarios",
              url: `${orgPath}/scenarios`,
            },
            {
              title: "Training Tracks",
              url: `${orgPath}/tracks`,
            },
            {
              title: "AI Content Generator",
              url: `${orgPath}/scenarios/generate`,
            },
          ],
        },
        {
          title: "Analytics & Reports",
          url: `${orgPath}/reports`,
          icon: PieChart,
          items: [
            {
              title: "Organization Overview",
              url: `${orgPath}/reports`,
            },
            {
              title: "Team Performance",
              url: `${orgPath}/reports/teams`,
            },
            {
              title: "Scenario Analytics",
              url: `${orgPath}/reports/scenarios`,
            },
            {
              title: "Export Data",
              url: `${orgPath}/reports/export`,
            },
          ],
        },
        {
          title: "Integrations",
          url: `${orgPath}/settings/webhooks`,
          icon: Webhook,
          items: [
            {
              title: "Webhooks",
              url: `${orgPath}/settings/webhooks`,
            },
            {
              title: "API Settings",
              url: `${orgPath}/settings/api`,
            },
            {
              title: "Third-party Apps",
              url: `${orgPath}/settings/integrations`,
            },
          ],
        }
      )
      break

    case 'hr':
      baseNavigation.navMain.push(
        {
          title: "Compliance",
          url: `${orgPath}/hr/compliance`,
          icon: Shield,
          items: [
            {
              title: "Training Completion",
              url: `${orgPath}/hr/compliance`,
            },
            {
              title: "Certification Status",
              url: `${orgPath}/hr/certifications`,
            },
            {
              title: "Audit Reports",
              url: `${orgPath}/hr/audit`,
            },
          ],
        },
        {
          title: "Reporting",
          url: `${orgPath}/hr/reports`,
          icon: BarChart3,
          items: [
            {
              title: "HR Dashboard",
              url: `${orgPath}/hr`,
            },
            {
              title: "Employee Performance",
              url: `${orgPath}/hr/performance`,
            },
            {
              title: "Training Metrics",
              url: `${orgPath}/hr/metrics`,
            },
            {
              title: "Export Reports",
              url: `${orgPath}/hr/export`,
            },
          ],
        },
        {
          title: "User Directory",
          url: `${orgPath}/users`,
          icon: Users,
        }
      )
      break
  }

  // Recent scenarios/tracks as projects
  baseNavigation.projects = [
    {
      name: "Cold Call Mastery",
      url: `${orgPath}/scenarios/1`,
      icon: Frame,
    },
    {
      name: "Objection Handling",
      url: `${orgPath}/scenarios/2`,
      icon: PieChart,
    },
    {
      name: "Loan Officer Onboarding",
      url: `${orgPath}/tracks/1`,
      icon: Map,
    },
  ]

  return baseNavigation
}

const data = {
  user: {
    name: "John Doe", // This would come from Clerk
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
    role: "admin" as const, // This would come from your auth context
  },
  teams: [
    {
      name: "Voice AI Training",
      logo: AudioWaveform,
      plan: "Enterprise",
    },
    {
      name: "Acme Sales Corp",
      logo: GalleryVerticalEnd,
      plan: "Professional",
    },
    {
      name: "Global Lending Inc",
      logo: Command,
      plan: "Professional",
    },
  ] satisfies Team[],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: User['role']
  orgId?: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export function AppSidebar({ userRole = 'admin', orgId, user, ...props }: AppSidebarProps) {
  const navigationData = getNavigationData(userRole, orgId)

  const sidebarUser = user || data.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavProjects projects={navigationData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}