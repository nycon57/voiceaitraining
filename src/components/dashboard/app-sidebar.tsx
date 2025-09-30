"use client"

import * as React from "react"
import {
  BookOpen,
  Users,
  Target,
  BarChart3,
  Trophy,
  Shield,
  Clipboard,
  Settings,
  TrendingUp,
  Home,
  Mic,
  History,
  UserCheck,
  FileText,
  Briefcase,
  Settings2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavGroup } from "@/components/layout/nav-group"
import { NavUser } from "@/components/layout/nav-user"
import Logo from "@/components/layout/logo"
import { type SidebarData } from "@/components/layout/types"
import type { AuthUser } from '@/lib/auth'

// Navigation data based on user role (WITHOUT org paths)
const getSidebarData = (userRole: AuthUser['role']): SidebarData => {
  const navGroups = []

  // General navigation for all users
  navGroups.push({
    title: "General",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Training Hub",
        url: "/training",
        icon: Mic,
      },
    ],
  })

  // Role-specific navigation
  switch (userRole) {
    case 'trainee':
      navGroups.push({
        title: "My Training",
        items: [
          {
            title: "Assignments",
            url: "/assignments",
            icon: Target,
            badge: "Soon",
          },
          {
            title: "Training History",
            url: "/training", // Redirect to training hub until attempts list is built
            icon: History,
            badge: "Soon",
          },
          {
            title: "Leaderboard",
            url: "/leaderboard",
            icon: Trophy,
            badge: "Soon",
          },
          {
            title: "My Progress",
            url: "/analytics", // Map to existing analytics page
            icon: TrendingUp,
          },
        ],
      })
      break

    case 'manager':
      navGroups.push(
        {
          title: "Team Management",
          items: [
            {
              title: "Team Overview",
              url: "/team",
              icon: Users,
            },
            {
              title: "Assign Training",
              icon: UserCheck,
              badge: "Soon",
              items: [
                {
                  title: "New Assignment",
                  url: "/scenarios", // Redirect to scenarios until assignments built
                },
                {
                  title: "Manage Assignments",
                  url: "/assignments",
                },
              ],
            },
            {
              title: "Team Reports",
              url: "/analytics", // Map to existing analytics page
              icon: BarChart3,
            },
          ],
        },
        {
          title: "Content",
          items: [
            {
              title: "Scenarios",
              url: "/scenarios",
              icon: FileText,
            },
            {
              title: "Training Tracks",
              url: "/tracks",
              icon: Briefcase,
              badge: "Soon",
            },
          ],
        }
      )
      break

    case 'admin':
      navGroups.push(
        {
          title: "Content Management",
          items: [
            {
              title: "Scenarios",
              icon: BookOpen,
              items: [
                {
                  title: "Scenario Library",
                  url: "/scenarios",
                },
                {
                  title: "Create Scenario",
                  url: "/scenarios/new",
                },
              ],
            },
            {
              title: "Training Tracks",
              url: "/tracks",
              icon: Briefcase,
              badge: "Soon",
            },
            {
              title: "Assignments",
              url: "/assignments",
              icon: Clipboard,
              badge: "Soon",
            },
          ],
        },
        {
          title: "Organization",
          items: [
            {
              title: "Team Management",
              url: "/team",
              icon: Users,
            },
            {
              title: "Analytics",
              url: "/analytics", // Fixed: use /analytics not /reports
              icon: BarChart3,
            },
            {
              title: "Settings",
              icon: Settings2,
              items: [
                {
                  title: "Design System",
                  url: "/admin/design-system", // Added existing page
                },
                {
                  title: "Billing",
                  url: "/billing", // Fixed: use /billing not /settings/billing
                },
                {
                  title: "Webhooks",
                  url: "/settings/webhooks", // Fixed: use existing webhooks page
                },
              ],
            },
          ],
        }
      )
      break

    case 'hr':
      navGroups.push({
        title: "HR & Compliance",
        items: [
          {
            title: "User Directory",
            url: "/admin/users", // Use existing users page
            icon: Users,
          },
          {
            title: "Analytics",
            url: "/analytics", // Use existing analytics page
            icon: BarChart3,
          },
          {
            title: "Compliance",
            icon: Shield,
            badge: "Soon",
            items: [
              {
                title: "Training Completion",
                url: "/analytics", // Redirect to analytics
              },
              {
                title: "Certifications",
                url: "/dashboard", // TODO: Create compliance pages
              },
              {
                title: "Audit Reports",
                url: "/dashboard", // TODO: Create compliance pages
              },
            ],
          },
        ],
      })
      break
  }

  // Common settings for all users
  navGroups.push({
    title: "Account",
    items: [
      {
        title: "Settings",
        icon: Settings,
        badge: "Soon",
        items: [
          {
            title: "Profile",
            url: "/settings/profile",
          },
          {
            title: "Preferences",
            url: "/settings/preferences",
          },
        ],
      },
    ],
  })

  return {
    user: {
      name: "User",
      email: "user@example.com",
      avatar: "",
      role: userRole,
    },
    navGroups,
  }
}

interface SerializedUser {
  id: string
  firstName?: string | null
  lastName?: string | null
  email: string
  role?: AuthUser['role']
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: AuthUser['role']
  user?: SerializedUser
}

export function AppSidebar({ userRole = 'trainee', user, ...props }: AppSidebarProps) {
  const sidebarData = getSidebarData(userRole)

  const sidebarUser = user ? {
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'User',
    email: user.email || '',
    role: user.role || 'trainee'
  } : sidebarData.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-16 items-center px-4">
          <Logo href="/dashboard" className="text-base" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}