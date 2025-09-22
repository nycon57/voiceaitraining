"use client"

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
import { Play, Eye, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableProps {
  data: Array<{
    id: number
    header: string
    type: string
    status: string
    target: string
    limit: string
    score?: string
    reviewer: string
  }>
}

export function DataTable({ data }: DataTableProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'in progress':
        return 'default'
      case 'assigned':
        return 'secondary'
      case 'overdue':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'scenario':
        return 'outline'
      case 'track':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader className="px-4 lg:px-6">
        <CardTitle>Recent Training Activities</CardTitle>
        <CardDescription>
          Your assigned scenarios and tracks with completion status
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 lg:px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Training Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target Score</TableHead>
              <TableHead>Your Score</TableHead>
              <TableHead>Assigned By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.header}</TableCell>
                <TableCell>
                  <Badge variant={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.target}%</TableCell>
                <TableCell>
                  {item.score === '--' ? (
                    <span className="text-muted-foreground">--</span>
                  ) : (
                    <span className={
                      item.score && parseInt(item.score) >= parseInt(item.target)
                        ? "text-green-600 font-medium"
                        : "text-orange-600 font-medium"
                    }>
                      {item.score}%
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.reviewer}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {item.status === 'Completed' ? (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    ) : (
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        {item.status === 'Assigned' ? 'Start' : 'Continue'}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {item.status === 'Completed' && (
                          <DropdownMenuItem>View Transcript</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Export Results</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}