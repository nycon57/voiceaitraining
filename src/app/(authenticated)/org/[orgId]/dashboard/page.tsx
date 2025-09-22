import { getCurrentUser } from '@/lib/auth'
import { SectionCards } from '@/components/dashboard/section-cards'
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive'
import { DataTable } from '@/components/dashboard/data-table'

// Mock data for initial development
const mockData = [
  {
    id: 1,
    header: "Cold Call Introduction",
    type: "Scenario",
    status: "Completed",
    target: "85",
    limit: "70",
    score: "88",
    reviewer: "You"
  },
  {
    id: 2,
    header: "Objection Handling",
    type: "Scenario",
    status: "In Progress",
    target: "80",
    limit: "70",
    score: "--",
    reviewer: "You"
  },
  {
    id: 3,
    header: "Loan Officer Track 1",
    type: "Track",
    status: "Assigned",
    target: "75",
    limit: "70",
    score: "--",
    reviewer: "Manager"
  }
]

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName}! Here's your training overview.
              </p>
            </div>
            <SectionCards />
          </div>
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={mockData} />
        </div>
      </div>
    </div>
  )
}