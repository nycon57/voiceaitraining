"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, CheckCircle2 } from "lucide-react"

interface LearningObjectivesProps {
  scenario: {
    persona?: any
    rubric?: any
    metadata?: Record<string, unknown>
  }
}

export function LearningObjectives({ scenario }: LearningObjectivesProps) {
  // Extract objectives from scenario data
  const objectives: Array<{ title: string; description: string }> = []

  // Try to get objectives from persona
  if (scenario.persona?.objectives && Array.isArray(scenario.persona.objectives)) {
    scenario.persona.objectives.forEach((obj: string) => {
      objectives.push({
        title: obj,
        description: '',
      })
    })
  }

  // Try to get from metadata
  if (scenario.metadata?.learning_objectives && Array.isArray(scenario.metadata.learning_objectives)) {
    (scenario.metadata.learning_objectives as any[]).forEach((obj) => {
      if (typeof obj === 'string') {
        objectives.push({ title: obj, description: '' })
      } else if (obj.title) {
        objectives.push({
          title: obj.title,
          description: obj.description || '',
        })
      }
    })
  }

  // Default objectives if none provided
  if (objectives.length === 0) {
    objectives.push(
      {
        title: 'Master the fundamentals',
        description: 'Build a strong foundation in core techniques',
      },
      {
        title: 'Handle objections effectively',
        description: 'Learn to address common concerns with confidence',
      },
      {
        title: 'Build rapport and trust',
        description: 'Create meaningful connections with clients',
      },
      {
        title: 'Close with confidence',
        description: 'Perfect your closing techniques',
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          What You'll Learn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">{objective.title}</div>
                {objective.description && (
                  <div className="text-sm text-muted-foreground">
                    {objective.description}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
