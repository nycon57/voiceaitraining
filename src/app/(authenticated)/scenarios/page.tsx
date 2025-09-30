import { getScenarios } from '@/actions/scenarios'
import { getCurrentUser } from '@/lib/auth'
import { Suspense } from 'react'
import { ScenarioList } from '@/components/scenarios/scenario-list'
import { Button } from '@/components/ui/button'
import { EmptyStateList } from '@/components/ui/empty-state'
import { SkeletonTable } from '@/components/ui/loading-skeleton'
import { Plus, Zap } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ScenariosPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const scenarios = await getScenarios()

  const canCreateScenarios = user.role === 'admin' || user.role === 'manager'

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Training Scenarios</h1>
          <p className="text-muted-foreground">
            Manage your voice training scenarios and content library
          </p>
        </div>
        {canCreateScenarios && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/scenarios/generate">
                <Zap className="h-4 w-4 mr-2" />
                AI Generate
              </Link>
            </Button>
            <Button asChild>
              <Link href="/scenarios/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Scenario
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Suspense fallback={<SkeletonTable rows={8} columns={6} />}>
        {scenarios.length === 0 ? (
          <div className="rounded-lg border bg-card">
            <EmptyStateList
              title="No Scenarios Yet"
              description="Get started by creating your first training scenario. You can build it manually or use our AI generator."
              onCreate={canCreateScenarios ? () => {} : undefined}
              createLabel="Create Scenario"
            />
            {canCreateScenarios && (
              <div className="flex justify-center gap-2 pb-6">
                <Button asChild variant="outline">
                  <Link href="/scenarios/generate">
                    <Zap className="h-4 w-4 mr-2" />
                    AI Generate
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/scenarios/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Scenario
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ScenarioList scenarios={scenarios} userRole={user.role} />
        )}
      </Suspense>
    </div>
  )
}