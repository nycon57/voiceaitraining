import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatCard, AlertCard } from '@/components/dashboard/cards'
import type { AlertItem } from '@/components/dashboard/cards'
import { TeamActivityChart, PerformanceTrendChart } from '@/components/charts'
import { getStatusVariant, generateAvatarFallback } from '@/lib/utils/dashboard-utils'
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
    value: "94%",
    icon: Shield,
    trend: { direction: 'up' as const, value: '+2%', isPositive: true },
    description: "Organization compliance rate"
  },
  {
    label: "Certifications",
    value: 156,
    icon: Award,
    trend: { direction: 'up' as const, value: '+12', isPositive: true },
    description: "Active certifications"
  },
  {
    label: "Training Hours",
    value: 2847,
    icon: Clock,
    trend: { direction: 'up' as const, value: '+15%', isPositive: true },
    description: "Total hours this quarter"
  },
  {
    label: "Audit Ready",
    value: "89%",
    icon: FileText,
    description: "Users meeting requirements"
  }
]

const mockComplianceAlerts: AlertItem[] = [
  {
    id: 1,
    type: 'warning',
    title: "12 certifications expiring soon",
    description: "Certifications expire within 30 days",
    icon: Clock,
    action: {
      label: "Review Details",
      href: "/hr/certifications?filter=expiring"
    }
  },
  {
    id: 2,
    type: 'error',
    title: "8 users with overdue training",
    description: "Mandatory training not completed",
    icon: AlertCircle,
    action: {
      label: "Review Details",
      href: "/hr/compliance?filter=overdue"
    }
  },
  {
    id: 3,
    type: 'info',
    title: "Quarterly audit due",
    description: "Q1 compliance audit scheduled for Feb 15",
    icon: FileText,
    action: {
      label: "Schedule Audit",
      href: "/hr/audit"
    }
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

const mockComplianceChartData = [
  { label: "Customer Service", value: 97, category: "completed" as const },
  { label: "Sales", value: 93, category: "completed" as const },
  { label: "Operations", value: 92, category: "completed" as const },
  { label: "Marketing", value: 89, category: "inProgress" as const },
]

const mockComplianceTrendData = [
  { date: "Week 1", score: 89, label: "Compliance Rate" },
  { date: "Week 2", score: 91, label: "Compliance Rate" },
  { date: "Week 3", score: 92, label: "Compliance Rate" },
  { date: "Week 4", score: 94, label: "Compliance Rate" }
]

export function HROverview({ user }: HROverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          HR & <span className="text-gradient">Compliance</span>
        </h2>
        <p className="text-muted-foreground">
          Monitor training compliance and certifications across your organization
        </p>
      </div>

      {/* Stats Grid - 4 column layout */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockComplianceStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Main Content Grid - 12 column system */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Department Compliance - 8 columns */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="font-headline">Department Compliance</CardTitle>
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
                      <Badge
                        variant={getStatusVariant(
                          dept.complianceRate >= 95 ? 'completed' :
                          dept.complianceRate >= 90 ? 'active' : 'overdue'
                        )}
                        className={
                          dept.complianceRate >= 95 ? 'bg-success text-success-foreground' :
                          dept.complianceRate >= 90 ? 'bg-warning text-warning-foreground' :
                          'bg-destructive text-destructive-foreground'
                        }
                      >
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
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - 4 columns */}
        <div className="space-y-6 lg:col-span-4">
          {/* Compliance Alerts */}
          <AlertCard
            title="Compliance Alerts"
            description="Items requiring immediate attention"
            alerts={mockComplianceAlerts}
            icon={AlertCircle}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
              <CardDescription>
                Common HR and compliance tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/hr/reports/generate">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Compliance Report
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/hr/audit">
                  <FileText className="h-4 w-4 mr-2" />
                  Schedule Audit
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/hr/certifications">
                  <Award className="h-4 w-4 mr-2" />
                  Manage Certifications
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/team">
                  <Users className="h-4 w-4 mr-2" />
                  User Directory
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compliance Analytics - Full width */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamActivityChart
          data={mockComplianceChartData}
          title="Compliance by Department"
          description="Compliance rates across departments"
          orientation="horizontal"
          showValues
        />

        <PerformanceTrendChart
          data={mockComplianceTrendData}
          title="Compliance Trend"
          description="Organization-wide compliance over time"
          chartType="area"
          showStats={false}
        />
      </div>

      {/* Recent Certifications - Full width */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Certifications</CardTitle>
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
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">{cert.userName}</h4>
                    <p className="text-sm text-muted-foreground">{cert.certification}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{cert.score}%</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{cert.completedDate}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{cert.validUntil}</div>
                    <div className="text-xs text-muted-foreground">Valid Until</div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Certified
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}