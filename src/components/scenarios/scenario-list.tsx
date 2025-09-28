"use client"

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Edit,
  Archive,
  MoreHorizontal,
  Search,
  Filter,
  Clock,
  Target,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { publishScenario, archiveScenario } from '@/actions/scenarios'

interface Scenario {
  id: string
  title: string
  description?: string
  difficulty?: string
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
  created_by: string
  estimated_duration?: number
}

interface ScenarioListProps {
  scenarios: Scenario[]
  orgId: string
  userRole?: string
}

export function ScenarioList({ scenarios, orgId, userRole }: ScenarioListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  const canManageScenarios = userRole === 'admin' || userRole === 'manager'

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || scenario.status === statusFilter
    const matchesDifficulty = difficultyFilter === 'all' || scenario.difficulty === difficultyFilter

    return matchesSearch && matchesStatus && matchesDifficulty
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'archived':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = async (scenarioId: string, action: 'publish' | 'archive') => {
    try {
      if (action === 'publish') {
        await publishScenario(scenarioId)
      } else {
        await archiveScenario(scenarioId)
      }
    } catch (error) {
      console.error(`Failed to ${action} scenario:`, error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scenarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScenarios.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{scenario.title}</div>
                      {scenario.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {scenario.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {scenario.difficulty && (
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(scenario.difficulty)}
                      >
                        {scenario.difficulty}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(scenario.status)}>
                      {scenario.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {scenario.estimated_duration ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {Math.round(scenario.estimated_duration / 60)}m
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(scenario.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {scenario.status === 'active' && (
                        <Button asChild size="sm">
                          <Link href={`/org/${orgId}/play/${scenario.id}`}>
                            <div className="flex items-center gap-1">
                              <Play className="h-4 w-4" />
                              Practice
                            </div>
                          </Link>
                        </Button>
                      )}
                      {canManageScenarios && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/org/${orgId}/scenarios/${scenario.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {scenario.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(scenario.id, 'publish')}
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(scenario.id, 'archive')}
                              className="text-red-600"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredScenarios.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No scenarios found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}