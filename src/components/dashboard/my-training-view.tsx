/**
 * My Training View
 *
 * Client component wrapper for toggling between grid and table views
 */

"use client"

import { MyTrainingGrid } from '@/components/dashboard/my-training-grid'
import { MyTrainingTable } from '@/components/dashboard/my-training-table'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LayoutGrid, Table as TableIcon } from 'lucide-react'
import { useState } from 'react'
import type { EnrichedEnrollment } from '@/actions/enrollments'

interface Assignment {
  id: string
  type: 'scenario' | 'track'
  scenario_id?: string
  track_id?: string
  due_at?: string
  required?: boolean
  assigned_by?: {
    name?: string
    email?: string
  }
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

interface MyTrainingViewProps {
  enrollments: EnrichedEnrollment[]
  assignments?: Assignment[]
  maxItems?: number
}

export function MyTrainingView({ enrollments, assignments, maxItems }: MyTrainingViewProps) {
  const [isTableView, setIsTableView] = useState(false)

  return (
    <div className="space-y-4">
      {/* Toggle Switch */}
      <div className="flex items-center justify-end gap-2">
        <Label htmlFor="view-toggle" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <LayoutGrid className={`h-4 w-4 ${!isTableView ? 'text-primary' : ''}`} />
          Grid
        </Label>
        <Switch
          id="view-toggle"
          checked={isTableView}
          onCheckedChange={setIsTableView}
        />
        <Label htmlFor="view-toggle" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <TableIcon className={`h-4 w-4 ${isTableView ? 'text-primary' : ''}`} />
          Table
        </Label>
      </div>

      {/* Conditional Rendering */}
      {isTableView ? (
        <MyTrainingTable enrollments={enrollments} assignments={assignments} maxItems={maxItems} />
      ) : (
        <MyTrainingGrid enrollments={enrollments} assignments={assignments} maxItems={maxItems} />
      )}
    </div>
  )
}
