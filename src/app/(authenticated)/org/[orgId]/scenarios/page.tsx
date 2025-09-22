import { getScenarios } from '@/actions/scenarios'
import { getCurrentUser } from '@/lib/auth'
import { ScenarioList } from '@/components/scenarios/scenario-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, BookOpen, Zap } from 'lucide-react'
import Link from 'next/link'

interface ScenariosPageProps {
  params: Promise<{ orgId: string }>
}

export default async function ScenariosPage({ params }: ScenariosPageProps) {
  const { orgId } = await params
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const scenarios = await getScenarios()

  const canCreateScenarios = user.role === 'admin' || user.role === 'manager'

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Scenarios</h1>
          <p className="text-muted-foreground">
            Manage your voice training scenarios and content library
          </p>
        </div>
        {canCreateScenarios && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/org/${orgId}/scenarios/generate`}>
                <Zap className="h-4 w-4 mr-2" />
                AI Generate
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/org/${orgId}/scenarios/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Create Scenario
              </Link>
            </Button>
          </div>
        )}
      </div>

      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scenarios Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by creating your first training scenario. You can build it manually or use our AI generator.
            </p>
            {canCreateScenarios && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={`/org/${orgId}/scenarios/generate`}>
                    <Zap className="h-4 w-4 mr-2" />
                    AI Generate
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/org/${orgId}/scenarios/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Scenario
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <ScenarioList scenarios={scenarios} orgId={orgId} userRole={user.role} />
      )}
    </div>
  )
}