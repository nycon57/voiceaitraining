import { Suspense } from "react"
import { DesignSystemDocs } from "@/components/admin/design-system/design-system-docs"
import { DesignSystemHeader } from "@/components/admin/design-system/design-system-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export const metadata = {
  title: "Design System | SpeakStride",
  description: "Comprehensive design system documentation for SpeakStride - Voice AI Training Platform",
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DesignSystemHeader />
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <DesignSystemDocs />
      </Suspense>
    </div>
  )
}