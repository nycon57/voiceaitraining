"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Import all sections
import { BrandFoundationSection } from "./sections/brand-foundation"
import { DesignTokensSection } from "./sections/design-tokens"
import { ComponentLibrarySection } from "./sections/component-library"
import { LayoutSystemSection } from "./sections/layout-system"
import { InteractionDesignSection } from "./sections/interaction-design"
import { NavigationSidebar } from "./navigation-sidebar"

const sections = [
  {
    id: "brand",
    label: "Brand Foundation",
    icon: "🎨",
    component: BrandFoundationSection
  },
  {
    id: "tokens",
    label: "Design Tokens",
    icon: "⚡",
    component: DesignTokensSection
  },
  {
    id: "components",
    label: "Component Library",
    icon: "🧩",
    component: ComponentLibrarySection
  },
  {
    id: "layout",
    label: "Layout System",
    icon: "📐",
    component: LayoutSystemSection
  },
  {
    id: "interactions",
    label: "Interaction Design",
    icon: "✨",
    component: InteractionDesignSection
  }
]

export function DesignSystemDocs() {
  const [activeSection, setActiveSection] = useState("brand")

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-background">
      {/* Navigation Sidebar */}
      <div className="w-80 border-r border-border bg-card/50">
        <NavigationSidebar
          sections={sections}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {sections.map((section) => {
                if (section.id !== activeSection) return null

                const Component = section.component
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Component />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}