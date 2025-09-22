import { getScenario } from '@/actions/scenarios'
import { requireRole } from '@/lib/auth'
import { ScenarioForm } from '@/components/scenarios/scenario-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditScenarioPageProps {
  params: Promise<{ orgId: string; scenarioId: string }>
}

export default async function EditScenarioPage({ params }: EditScenarioPageProps) {
  const { orgId, scenarioId } = await params

  // Ensure user has permission to edit scenarios
  await requireRole(['admin', 'manager'])

  let scenario
  try {
    scenario = await getScenario(scenarioId)
  } catch (error) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/org/${orgId}/scenarios`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scenarios
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Scenario</h1>
          <p className="text-muted-foreground">
            Modify the details and configuration of "{scenario.title}"
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ScenarioForm orgId={orgId} scenario={scenario} />
      </div>
    </div>
  )
}