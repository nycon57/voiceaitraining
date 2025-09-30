"use client"

/**
 * Loading Skeleton Component Examples
 *
 * This file demonstrates usage of all loading skeleton components.
 * Use these examples as reference for implementing loading states across the app.
 */

import {
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonList,
  SkeletonDashboard,
  SkeletonText,
  SkeletonForm
} from "@/components/ui/loading-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LoadingSkeletonExamples() {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h1 className="font-headline text-4xl font-bold mb-2">Loading Skeleton Components</h1>
        <p className="text-muted-foreground">
          Examples and usage patterns for all loading skeleton components
        </p>
      </div>

      {/* SkeletonCard Examples */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonCard</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for StatCard or any card-based loading states
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard hasIcon />
          <SkeletonCard hasIcon lines={3} />
          <SkeletonCard hasIcon lines={1} variant="wave" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonCard } from "@/components/ui/loading-skeleton"

// Basic usage
<SkeletonCard />

// With icon and custom lines
<SkeletonCard hasIcon lines={3} />

// With wave animation
<SkeletonCard variant="wave" />`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SkeletonTable Example */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonTable</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for data table loading states
        </p>

        <SkeletonTable rows={5} columns={4} />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonTable } from "@/components/ui/loading-skeleton"

// Default 5 rows, 4 columns
<SkeletonTable />

// Custom dimensions
<SkeletonTable rows={10} columns={6} />

// In a data table component
{isLoading ? (
  <SkeletonTable rows={data.length} columns={5} />
) : (
  <DataTable data={data} columns={columns} />
)}`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SkeletonChart Examples */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonChart</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for chart component loading states
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonChart type="line" />
          <SkeletonChart type="bar" />
          <SkeletonChart type="area" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonChart } from "@/components/ui/loading-skeleton"

// Line chart loading state
<SkeletonChart type="line" />

// Bar chart with custom height
<SkeletonChart type="bar" height="h-[400px]" />

// In a chart component
{isLoading ? (
  <SkeletonChart type="area" />
) : (
  <AreaChart data={chartData} />
)}`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SkeletonList Example */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonList</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for list item loading states
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold mb-2">Without Avatars</h3>
            <SkeletonList items={3} />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">With Avatars</h3>
            <SkeletonList items={3} hasAvatar />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonList } from "@/components/ui/loading-skeleton"

// Basic list
<SkeletonList items={5} />

// With avatars
<SkeletonList items={5} hasAvatar />

// In a list component
{isLoading ? (
  <SkeletonList items={assignments.length} />
) : (
  assignments.map(item => <ListItem key={item.id} {...item} />)
)}`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SkeletonText Example */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonText</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for text content loading states
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Full Width</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonText lines={3} width="full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Varied Width</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonText lines={3} width="varied" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonText } from "@/components/ui/loading-skeleton"

// Paragraph placeholder
<SkeletonText lines={3} width="varied" />

// Short text
<SkeletonText lines={1} width="short" />

// In a content component
{isLoading ? (
  <SkeletonText lines={5} width="varied" />
) : (
  <p>{content}</p>
)}`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SkeletonForm Example */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonForm</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for form loading states
        </p>

        <div className="max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Form Loading State</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonForm fields={4} hasButton />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonForm } from "@/components/ui/loading-skeleton"

// Basic form skeleton
<SkeletonForm fields={5} />

// Without submit button
<SkeletonForm fields={3} hasButton={false} />

// In a form component
{isLoading ? (
  <SkeletonForm fields={formFields.length} />
) : (
  <Form {...form}>...</Form>
)}`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* SkeletonDashboard Example */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">SkeletonDashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use for complete dashboard loading states. Combines all skeleton components
          in a standard dashboard layout.
        </p>

        <div className="border rounded-lg p-4 bg-muted/20">
          <SkeletonDashboard />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
{`import { SkeletonDashboard } from "@/components/ui/loading-skeleton"

// In a dashboard page
export default function DashboardPage() {
  const { data, isLoading } = useDashboardData()

  if (isLoading) {
    return <SkeletonDashboard />
  }

  return <DashboardContent data={data} />
}

// In a Suspense boundary
<Suspense fallback={<SkeletonDashboard />}>
  <DashboardContent />
</Suspense>`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* Animation Variants */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">Animation Variants</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All skeleton components support three animation variants
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Default (Pulse)</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonCard variant="default" hasIcon lines={2} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shimmer</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonCard variant="shimmer" hasIcon lines={2} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Wave</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonCard variant="wave" hasIcon lines={2} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold">Best Practices</h2>
        <Card>
          <CardContent className="pt-6">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Match skeleton structure to actual component layout for seamless transitions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Use SkeletonDashboard for page-level loading states</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Prefer shimmer variant for most cases (provides better visual feedback)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Match the number of skeleton items to expected data length when known</span>
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span>
                <span>Use with React Suspense for automatic loading state management</span>
              </li>
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>Avoid mixing different animation variants on the same page</span>
              </li>
              <li className="flex gap-2">
                <span className="text-destructive">✗</span>
                <span>Don't use skeleton loaders for very fast operations (under 300ms)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

/**
 * Minimal Loading State Example
 *
 * Shows how to create a minimal loading page using SkeletonDashboard
 */
export function DashboardLoadingPage() {
  return (
    <div className="container mx-auto py-6">
      <SkeletonDashboard />
    </div>
  )
}

/**
 * Component-Level Loading Example
 *
 * Shows how to use skeleton components within a specific component
 */
export function AssignmentsCardLoading() {
  return (
    <Card className="lg:col-span-8">
      <CardHeader>
        <div className="space-y-2">
          <SkeletonText lines={1} width="short" />
          <SkeletonText lines={1} width="medium" />
        </div>
      </CardHeader>
      <CardContent>
        <SkeletonList items={3} />
      </CardContent>
    </Card>
  )
}