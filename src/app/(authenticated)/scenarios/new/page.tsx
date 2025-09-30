import { getCurrentUser, requireRole } from '@/lib/auth'
import { ScenarioForm } from '@/components/scenarios/scenario-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function NewScenarioPage() {

  // Ensure user has permission to create scenarios
  await requireRole(['admin', 'manager'])

  const user = await getCurrentUser()
  if (!user?.orgId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/scenarios`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scenarios
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Create New Scenario</h1>
          <p className="text-muted-foreground">
            Build a new voice training scenario for your team
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <ScenarioForm orgId={user.orgId} />
      </div>
    </div>
  )
}