import { Suspense } from "react"
import { DesignSystemDocs } from "@/components/admin/design-system/design-system-docs"
import { PageHeader } from "@/components/admin/design-system/page-header"

export default function DesignSystemPage() {
  return (
    <div className="space-y-8">
      <PageHeader />
      <Suspense fallback={<div>Loading design system...</div>}>
        <DesignSystemDocs />
      </Suspense>
    </div>
  )
}