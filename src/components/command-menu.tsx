"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  Mic,
  Target,
  History,
  Trophy,
  TrendingUp,
  Users,
  UserCheck,
  BarChart3,
  FileText,
  Briefcase,
  BookOpen,
  Clipboard,
  Settings2,
  Shield,
  Settings,
  PlayCircle,
  Plus,
  Eye,
  Calendar,
  CreditCard,
  Webhook,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

interface CommandMenuItem {
  label: string
  icon?: React.ElementType
  onSelect: () => void
  shortcut?: string
  keywords?: string[]
}

interface CommandMenuProps {
  userRole?: "trainee" | "manager" | "admin" | "hr"
}

export function CommandMenu({ userRole = "trainee" }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Navigation helper
  const navigate = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  // Navigation items - available to all users
  const navigationItems: CommandMenuItem[] = [
    {
      label: "Dashboard",
      icon: Home,
      onSelect: () => navigate("/dashboard"),
      keywords: ["home", "overview"],
    },
    {
      label: "Training Hub",
      icon: Mic,
      onSelect: () => navigate("/training"),
      keywords: ["training", "practice", "learn"],
    },
  ]

  // Trainee-specific items
  const traineeItems: CommandMenuItem[] = [
    {
      label: "My Assignments (Coming Soon)",
      icon: Target,
      onSelect: () => navigate("/assignments"),
      keywords: ["assignments", "tasks", "todo"],
    },
    {
      label: "Training History (Coming Soon)",
      icon: History,
      onSelect: () => navigate("/training"),
      keywords: ["history", "past", "attempts", "sessions"],
    },
    {
      label: "Leaderboard (Coming Soon)",
      icon: Trophy,
      onSelect: () => navigate("/leaderboard"),
      keywords: ["leaderboard", "ranking", "competition"],
    },
    {
      label: "My Progress",
      icon: TrendingUp,
      onSelect: () => navigate("/analytics"),
      keywords: ["progress", "reports", "analytics"],
    },
  ]

  // Manager-specific items
  const managerItems: CommandMenuItem[] = [
    {
      label: "Team Overview",
      icon: Users,
      onSelect: () => navigate("/team"),
      keywords: ["team", "members", "employees"],
    },
    {
      label: "New Assignment (Coming Soon)",
      icon: UserCheck,
      onSelect: () => navigate("/training"),
      keywords: ["assign", "new", "create"],
    },
    {
      label: "Manage Assignments (Coming Soon)",
      icon: Clipboard,
      onSelect: () => navigate("/assignments"),
      keywords: ["assignments", "manage"],
    },
    {
      label: "Team Reports",
      icon: BarChart3,
      onSelect: () => navigate("/analytics"),
      keywords: ["reports", "analytics", "stats"],
    },
    {
      label: "Scenarios",
      icon: FileText,
      onSelect: () => navigate("/training"),
      keywords: ["scenarios", "content", "training"],
    },
    {
      label: "Training Tracks",
      icon: Briefcase,
      onSelect: () => navigate("/training"),
      keywords: ["tracks", "courses", "curriculum", "training"],
    },
  ]

  // Admin-specific items
  const adminItems: CommandMenuItem[] = [
    {
      label: "Training Library",
      icon: BookOpen,
      onSelect: () => navigate("/training"),
      keywords: ["scenarios", "library", "content", "training", "tracks"],
    },
    {
      label: "Create Scenario",
      icon: Plus,
      onSelect: () => navigate("/scenarios/new"),
      keywords: ["create", "new", "scenario"],
    },
    {
      label: "Training Tracks",
      icon: Briefcase,
      onSelect: () => navigate("/training"),
      keywords: ["tracks", "courses", "training"],
    },
    {
      label: "All Assignments (Coming Soon)",
      icon: Clipboard,
      onSelect: () => navigate("/assignments"),
      keywords: ["assignments", "all"],
    },
    {
      label: "Team Management",
      icon: Users,
      onSelect: () => navigate("/team"),
      keywords: ["team", "users", "members"],
    },
    {
      label: "Analytics",
      icon: BarChart3,
      onSelect: () => navigate("/analytics"),
      keywords: ["analytics", "reports", "data"],
    },
    {
      label: "Design System",
      icon: Settings2,
      onSelect: () => navigate("/admin/design-system"),
      keywords: ["design", "system", "components", "ui"],
    },
    {
      label: "Billing",
      icon: CreditCard,
      onSelect: () => navigate("/billing"),
      keywords: ["billing", "payment", "subscription"],
    },
    {
      label: "Webhooks",
      icon: Webhook,
      onSelect: () => navigate("/settings/webhooks"),
      keywords: ["integrations", "webhooks", "api"],
    },
  ]

  // HR-specific items
  const hrItems: CommandMenuItem[] = [
    {
      label: "User Directory",
      icon: Users,
      onSelect: () => navigate("/admin/users"),
      keywords: ["users", "directory", "employees", "team"],
    },
    {
      label: "Analytics",
      icon: BarChart3,
      onSelect: () => navigate("/analytics"),
      keywords: ["analytics", "reports", "data"],
    },
    {
      label: "Training Completion (Coming Soon)",
      icon: Shield,
      onSelect: () => navigate("/analytics"),
      keywords: ["compliance", "completion", "training"],
    },
    {
      label: "Certifications (Coming Soon)",
      icon: Shield,
      onSelect: () => navigate("/dashboard"),
      keywords: ["certifications", "certificates"],
    },
    {
      label: "Audit Reports (Coming Soon)",
      icon: FileText,
      onSelect: () => navigate("/dashboard"),
      keywords: ["audit", "reports", "compliance"],
    },
  ]

  // Quick actions available to all users
  const quickActions: CommandMenuItem[] = [
    {
      label: "Start Training",
      icon: PlayCircle,
      onSelect: () => navigate("/training"),
      shortcut: "T",
      keywords: ["start", "begin", "training"],
    },
    {
      label: "View Recent Sessions (Coming Soon)",
      icon: History,
      onSelect: () => navigate("/training"),
      shortcut: "H",
      keywords: ["recent", "history", "sessions"],
    },
  ]

  // Add role-specific quick actions
  if (userRole === "admin" || userRole === "manager") {
    quickActions.push({
      label: "New Scenario",
      icon: Plus,
      onSelect: () => navigate("/scenarios/new"),
      shortcut: "N",
      keywords: ["new", "create", "scenario"],
    })
  }

  // Settings items for all users
  const settingsItems: CommandMenuItem[] = [
    {
      label: "Profile Settings (Coming Soon)",
      icon: Settings,
      onSelect: () => navigate("/settings/profile"),
      keywords: ["profile", "settings", "account"],
    },
    {
      label: "Preferences (Coming Soon)",
      icon: Settings,
      onSelect: () => navigate("/settings/preferences"),
      keywords: ["preferences", "settings"],
    },
  ]

  // Get role-specific items
  const getRoleItems = () => {
    switch (userRole) {
      case "trainee":
        return traineeItems
      case "manager":
        return managerItems
      case "admin":
        return adminItems
      case "hr":
        return hrItems
      default:
        return []
    }
  }

  const roleItems = getRoleItems()

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Menu"
      description="Quick navigation and actions"
      animated
      showCloseButton
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={item.onSelect}
              keywords={item.keywords}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              <span>{item.label}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator key="sep-1" />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={item.onSelect}
              keywords={item.keywords}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Role-specific items */}
        {roleItems.length > 0 && (
          <>
            <CommandSeparator key="sep-2" />
            <CommandGroup
              heading={
                userRole === "trainee"
                  ? "My Training"
                  : userRole === "manager"
                    ? "Team Management"
                    : userRole === "admin"
                      ? "Administration"
                      : "HR & Compliance"
              }
            >
              {roleItems.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={item.onSelect}
                  keywords={item.keywords}
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Settings */}
        <CommandSeparator key="sep-3" />
        <CommandGroup heading="Settings">
          {settingsItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={item.onSelect}
              keywords={item.keywords}
            >
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}