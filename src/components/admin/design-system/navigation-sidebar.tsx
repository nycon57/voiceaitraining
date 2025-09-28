"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface Section {
  id: string
  label: string
  icon: string
  component: React.ComponentType
}

interface NavigationSidebarProps {
  sections: Section[]
  activeSection: string
  onSectionChange: (sectionId: string) => void
}

const subsections = {
  brand: [
    { id: "colors", label: "Color Palette" },
    { id: "typography", label: "Typography" },
    { id: "logo", label: "Logo & Branding" },
    { id: "voice", label: "Brand Voice" }
  ],
  tokens: [
    { id: "spacing", label: "Spacing System" },
    { id: "radius", label: "Border Radius" },
    { id: "shadows", label: "Shadows & Elevation" },
    { id: "animations", label: "Animations & Transitions" }
  ],
  components: [
    { id: "buttons", label: "Buttons" },
    { id: "forms", label: "Forms & Inputs" },
    { id: "cards", label: "Cards & Containers" },
    { id: "navigation", label: "Navigation" },
    { id: "data", label: "Data Display" },
    { id: "feedback", label: "Feedback & Overlays" }
  ],
  layout: [
    { id: "grid", label: "Grid System" },
    { id: "containers", label: "Containers" },
    { id: "breakpoints", label: "Responsive Breakpoints" },
    { id: "templates", label: "Page Templates" }
  ],
  interactions: [
    { id: "states", label: "Component States" },
    { id: "loading", label: "Loading States" },
    { id: "errors", label: "Error States" },
    { id: "micro", label: "Micro-interactions" }
  ]
}

export function NavigationSidebar({
  sections,
  activeSection,
  onSectionChange
}: NavigationSidebarProps) {
  const scrollToSubsection = (subsectionId: string) => {
    const element = document.getElementById(subsectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Sections
          </h3>
          <div className="space-y-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  activeSection === section.id && "bg-secondary/80"
                )}
                onClick={() => onSectionChange(section.id)}
              >
                <span className="text-base">{section.icon}</span>
                <span className="font-medium">{section.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Subsection Navigation */}
        {activeSection && subsections[activeSection as keyof typeof subsections] && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {sections.find(s => s.id === activeSection)?.label} Contents
            </h3>
            <div className="space-y-1">
              {subsections[activeSection as keyof typeof subsections].map((subsection) => (
                <Button
                  key={subsection.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start pl-6 h-8 text-sm"
                  onClick={() => scrollToSubsection(subsection.id)}
                >
                  {subsection.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Quick Links */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Quick Links
          </h3>
          <div className="space-y-1 text-sm">
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              Figma Library
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              Component Checklist
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start h-8">
              Accessibility Guide
            </Button>
          </div>
        </div>

        {/* Version Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Version</span>
              <Badge variant="outline" className="text-xs">1.0.0</Badge>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>Sep 26, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}