import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Users,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  Award,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import type { AuthUser } from '@/lib/auth'

interface HROverviewProps {
  user: AuthUser
}

// Mock data for initial development
const mockComplianceStats = [
  {
    label: "Overall Compliance",
    value: 94,
    icon: Shield,
    trend: "+2%",
    description: "Organization compliance rate"
  },
  {
    label: "Certifications",
    value: 156,
    icon: Award,
    trend: "+12",
    description: "Active certifications"
  },
  {
    label: "Training Hours",
    value: 2847,
    icon: Clock,
    trend: "+15%",
    description: "Total hours this quarter"
  },
  {
    label: "Audit Ready",
    value: 89,
    icon: FileText,
    trend: "%",
    description: "Users meeting requirements"
  }
]

const mockComplianceAlerts = [
  {
    id: 1,
    type: "certification_expiring",
    severity: "warning",
    title: "12 certifications expiring soon",
    description: "Certifications expire within 30 days",
    count: 12,
    dueDate: "Next 30 days"
  },
  {
    id: 2,
    type: "training_overdue",
    severity: "critical",
    title: "8 users with overdue training",
    description: "Mandatory training not completed",
    count: 8,
    dueDate: "Past due"
  },
  {
    id: 3,
    type: "audit_required",
    severity: "info",
    title: "Quarterly audit due",
    description: "Q1 compliance audit scheduled",
    count: 1,
    dueDate: "2025-02-15"
  }
]

const mockDepartmentCompliance = [
  {
    department: "Sales",
    totalUsers: 45,
    compliantUsers: 42,
    complianceRate: 93,
    lastUpdated: "2025-01-20"
  },
  {
    department: "Customer Service",
    totalUsers: 32,
    compliantUsers: 31,
    complianceRate: 97,
    lastUpdated: "2025-01-19"
  },
  {
    department: "Marketing",
    totalUsers: 18,
    compliantUsers: 16,
    complianceRate: 89,
    lastUpdated: "2025-01-18"
  },
  {
    department: "Operations",
    totalUsers: 24,
    compliantUsers: 22,
    complianceRate: 92,
    lastUpdated: "2025-01-20"
  }
]

const mockRecentCertifications = [
  {
    id: 1,
    userName: "Sarah Johnson",
    certification: "Sales Professional Level 2",
    completedDate: "2025-01-19",
    score: 94,
    validUntil: "2026-01-19"
  },
  {
    id: 2,
    userName: "Mike Chen",
    certification: "Customer Communication Basics",
    completedDate: "2025-01-18",
    score: 87,
    validUntil: "2025-07-18"
  },
  {
    id: 3,
    userName: "Lisa Rodriguez",
    certification: "Advanced Objection Handling",
    completedDate: "2025-01-17",
    score: 96,
    validUntil: "2026-01-17"
  }
]

export function HROverview({ user }: HROverviewProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-12">

      {/* Compliance Stats Cards */}
      {mockComplianceStats.map((stat) => (
        <Card key={stat.label} className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.trend} • {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Compliance Alerts */}
      <Card className="col-span-3 md:col-span-3 lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Compliance Alerts</CardTitle>
            <CardDescription className="text-sm">
              Items requiring immediate attention
            </CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          {mockComplianceAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 border rounded-lg ${
                alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                alert.severity === 'warning' ? 'border-orange-200 bg-orange-50' :
                'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {alert.severity === 'critical' ? (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                ) : alert.severity === 'warning' ? (
                  <Clock className="h-4 w-4 text-orange-500" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">{alert.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {alert.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Due: {alert.dueDate}</span>
                <Badge variant={
                  alert.severity === 'critical' ? 'destructive' :
                  alert.severity === 'warning' ? 'default' : 'secondary'
                }>
                  {alert.count} items
                </Badge>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2">
                Review Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Department Compliance */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-8">
        <CardHeader>
          <CardTitle>Department Compliance</CardTitle>
          <CardDescription>
            Compliance rates by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDepartmentCompliance.map((dept) => (
              <div
                key={dept.department}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{dept.department}</h4>
                    <Badge variant={dept.complianceRate >= 95 ? 'default' : dept.complianceRate >= 90 ? 'secondary' : 'destructive'}>
                      {dept.complianceRate}% Compliant
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {dept.compliantUsers}/{dept.totalUsers} users
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated: {dept.lastUpdated}
                    </div>
                  </div>

                  <Progress value={dept.complianceRate} className="h-2" />
                </div>

                <div className="ml-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/hr/compliance?department=${dept.department.toLowerCase()}`}>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Certifications */}
      <Card className="col-span-3 md:col-span-6 lg:col-span-8">
        <CardHeader>
          <CardTitle>Recent Certifications</CardTitle>
          <CardDescription>
            Latest training certifications achieved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentCertifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{cert.userName}</h4>
                    <p className="text-sm text-muted-foreground">{cert.certification}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{cert.score}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{cert.completedDate}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{cert.validUntil}</div>
                    <div className="text-xs text-muted-foreground">Valid Until</div>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Certified
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="col-span-3 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common HR and compliance tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" asChild>
            <Link href="/hr/reports/generate">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Generate Compliance Report
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/hr/audit">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Schedule Audit
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/hr/certifications">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Manage Certifications
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/team">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Directory
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  )
}