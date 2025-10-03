import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrainingHeroProps {
  totalScenarios: number
  totalTracks: number
  latestAdditions?: number
}

export function TrainingHero({ totalScenarios, totalTracks, latestAdditions = 0 }: TrainingHeroProps) {
  const stats = [
    {
      label: "Available Scenarios",
      value: totalScenarios,
      icon: BookOpen,
      iconColor: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      label: "Learning Tracks",
      value: totalTracks,
      icon: Target,
      iconColor: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "New This Week",
      value: latestAdditions,
      icon: TrendingUp,
      iconColor: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          <span className="text-gradient">Training Hub</span>
        </h1>
        <p className="text-muted-foreground">
          Discover and explore AI-powered scenarios and learning tracks to build your skills
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} animated={false} className="border-l-4 border-l-primary/20">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("rounded-lg p-3", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
