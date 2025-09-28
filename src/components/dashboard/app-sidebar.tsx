"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Users,
  Target,
  BarChart3,
  Trophy,
  Webhook,
  CreditCard,
  Shield,
  Clipboard,
  Settings,
  TrendingUp,
  Home,
  Mic,
  PlayCircle,
  History,
  Calendar,
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
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import { type SidebarData } from "@/components/layout/types"
import type { AuthUser } from '@/lib/auth'

// Navigation data based on user role (WITHOUT org paths)
const getSidebarData = (userRole: AuthUser['role']): SidebarData => {
  const teams = [
    {
      name: "SpeakStride",
      logo: AudioWaveform,
      plan: "Voice AI Training",
    },
  ]

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
          },
          {
            title: "Training History",
            url: "/attempts",
            icon: History,
          },
          {
            title: "Leaderboard",
            url: "/leaderboard",
            icon: Trophy,
          },
          {
            title: "My Progress",
            url: "/reports",
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
              items: [
                {
                  title: "New Assignment",
                  url: "/assignments/new",
                },
                {
                  title: "Manage Assignments",
                  url: "/assignments",
                },
              ],
            },
            {
              title: "Team Reports",
              url: "/reports",
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
            },
            {
              title: "Assignments",
              url: "/assignments",
              icon: Clipboard,
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
              url: "/reports",
              icon: BarChart3,
            },
            {
              title: "Settings",
              icon: Settings2,
              items: [
                {
                  title: "Organization",
                  url: "/settings/organization",
                },
                {
                  title: "Billing",
                  url: "/settings/billing",
                },
                {
                  title: "Integrations",
                  url: "/settings/integrations",
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
            title: "Compliance",
            icon: Shield,
            items: [
              {
                title: "Training Completion",
                url: "/hr/compliance",
              },
              {
                title: "Certifications",
                url: "/hr/certifications",
              },
              {
                title: "Audit Reports",
                url: "/hr/audit",
              },
            ],
          },
          {
            title: "HR Reports",
            url: "/hr/reports",
            icon: BarChart3,
          },
          {
            title: "User Directory",
            url: "/team",
            icon: Users,
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
    teams,
    navGroups,
  }
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: AuthUser['role']
  user?: AuthUser
}

export function AppSidebar({ userRole = 'trainee', user, ...props }: AppSidebarProps) {
  const sidebarData = getSidebarData(userRole)

  const sidebarUser = user ? {
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress || 'User',
    email: user.emailAddresses[0]?.emailAddress || '',
    role: user.role || 'trainee'
  } : sidebarData.user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
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