import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from "@/components/layout/header"
import { TrainingHub } from './_components/training-hub'

export default async function TrainingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <>
      <Header />
      <div className="space-y-4 p-4">
        <div className="mb-2 flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Training Hub</h1>
            <p className="text-muted-foreground">
              Choose your training path and start practicing with AI-powered scenarios
            </p>
          </div>
        </div>

        <TrainingHub user={user} />
      </div>
    </>
  )
}