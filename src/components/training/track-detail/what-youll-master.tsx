"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle2 } from "lucide-react"

interface WhatYoullMasterProps {
  scenarios: Array<{
    id: string
    title: string
  }>
}

export function WhatYoullMaster({ scenarios }: WhatYoullMasterProps) {
  // Generate learning outcomes based on scenario count
  const outcomes = [
    {
      title: 'Complete mastery of core skills',
      description: `Progress through ${scenarios.length} carefully designed scenarios`,
    },
    {
      title: 'Build confidence through practice',
      description: 'Tackle increasingly complex situations with proven techniques',
    },
    {
      title: 'Develop advanced communication skills',
      description: 'Master the art of professional conversation and persuasion',
    },
    {
      title: 'Achieve measurable results',
      description: 'Track your progress with detailed performance metrics',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Award className="h-5 w-5" />
          What You'll Master
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {outcomes.map((outcome, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium mb-1">{outcome.title}</div>
                <div className="text-sm text-muted-foreground">
                  {outcome.description}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Scenario Preview */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-sm font-medium mb-3">This track includes:</div>
          <div className="grid gap-2">
            {scenarios.slice(0, 5).map((scenario, index) => (
              <div
                key={scenario.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {index + 1}
                </div>
                <span>{scenario.title}</span>
              </div>
            ))}
            {scenarios.length > 5 && (
              <div className="text-sm text-muted-foreground italic">
                ...and {scenarios.length - 5} more scenarios
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
