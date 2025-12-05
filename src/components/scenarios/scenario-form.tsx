"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { createScenario, updateScenario } from '@/actions/scenarios'
import { Loader2, Save, Eye, BookOpen, User, Settings, Zap } from 'lucide-react'

interface ScenarioFormProps {
  orgId: string
  scenario?: any // Existing scenario for editing
}

export function ScenarioForm({ orgId, scenario }: ScenarioFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  const [formData, setFormData] = useState({
    title: scenario?.title || '',
    description: scenario?.description || '',
    difficulty: scenario?.difficulty || '',
    estimated_duration: scenario?.estimated_duration || '',
    ai_prompt: scenario?.ai_prompt || '',
    persona: scenario?.persona || {
      role: 'client',
      profile: {
        name: '',
        background: '',
        goals: [],
        concerns: [],
        personality_traits: []
      }
    },
    rubric: scenario?.rubric || {
      goal_achievement: { weight: 40, description: 'Meeting the primary objective' },
      communication_quality: { weight: 30, description: 'Clear and professional communication' },
      product_knowledge: { weight: 20, description: 'Demonstrating expertise' },
      objection_handling: { weight: 10, description: 'Addressing concerns effectively' }
    },
    kpi_config: scenario?.kpi_config || {
      required_phrases: [],
      max_duration: 600,
      min_questions: 3,
      max_interruptions: 2
    }
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const form = new FormData()
      form.append('title', formData.title)
      form.append('description', formData.description)
      form.append('difficulty', formData.difficulty)
      form.append('estimated_duration', formData.estimated_duration.toString())
      form.append('ai_prompt', formData.ai_prompt)
      form.append('persona', JSON.stringify(formData.persona))
      form.append('rubric', JSON.stringify(formData.rubric))
      form.append('kpi_config', JSON.stringify(formData.kpi_config))

      if (scenario) {
        await updateScenario(scenario.id, form)
      } else {
        await createScenario(form)
      }

      router.push('/scenarios')
    } catch (error) {
      console.error('Failed to save scenario:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.')
      const updated = { ...prev }
      let current: Record<string, any> = updated

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return updated
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="persona" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Persona
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Prompt
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Scoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the core details of your training scenario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Scenario Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Cold Call Introduction"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe what this scenario covers and its learning objectives..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => updateFormData('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Easy</Badge>
                          <span>Beginner friendly</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                          <span>Intermediate level</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hard">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Hard</Badge>
                          <span>Advanced challenges</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.estimated_duration}
                    onChange={(e) => updateFormData('estimated_duration', parseInt(e.target.value) * 60)}
                    placeholder="10"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="persona" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Persona Configuration</CardTitle>
              <CardDescription>
                Define the character and background of the AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="persona-role">Role</Label>
                <Select
                  value={formData.persona.role}
                  onValueChange={(value) => updateFormData('persona.role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Potential Client</SelectItem>
                    <SelectItem value="existing_customer">Existing Customer</SelectItem>
                    <SelectItem value="lead">Sales Lead</SelectItem>
                    <SelectItem value="partner">Business Partner</SelectItem>
                    <SelectItem value="colleague">Colleague</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="persona-name">Character Name</Label>
                <Input
                  id="persona-name"
                  value={formData.persona.profile.name}
                  onChange={(e) => updateFormData('persona.profile.name', e.target.value)}
                  placeholder="e.g., Sarah Johnson"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="persona-background">Background & Context</Label>
                <Textarea
                  id="persona-background"
                  value={formData.persona.profile.background}
                  onChange={(e) => updateFormData('persona.profile.background', e.target.value)}
                  placeholder="Describe the character's situation, needs, and context..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI System Prompt</CardTitle>
              <CardDescription>
                Instructions that will guide the AI agent's behavior during the conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai_prompt">System Prompt</Label>
                <Textarea
                  id="ai_prompt"
                  value={formData.ai_prompt}
                  onChange={(e) => updateFormData('ai_prompt', e.target.value)}
                  placeholder="You are playing the role of a potential client interested in..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Tip: Be specific about the character's goals, personality, and how they should respond to different situations.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Rubric</CardTitle>
              <CardDescription>
                Define how performance will be evaluated for this scenario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.rubric).map(([key, criteria]) => {
                  const typedCriteria = criteria as { weight: number; description: string }
                  return (
                    <div key={key} className="space-y-2 p-4 border rounded-lg">
                      <Label className="capitalize font-medium">
                        {key.replace('_', ' ')}
                      </Label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={typedCriteria.weight}
                          onChange={(e) => updateFormData(`rubric.${key}.weight`, parseInt(e.target.value))}
                          placeholder="Weight %"
                          max="100"
                          min="0"
                        />
                        <Textarea
                          value={typedCriteria.description}
                          onChange={(e) => updateFormData(`rubric.${key}.description`, e.target.value)}
                          placeholder="Description..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            {scenario ? 'Update' : 'Create'} Scenario
          </Button>
        </div>
      </div>
    </form>
  )
}