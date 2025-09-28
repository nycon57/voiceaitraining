import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Shield, TrendingUp, Building2, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DemoCredentialsPage() {
  const demoUsers = [
    {
      role: 'Admin',
      email: 'admin@demo.com',
      name: 'John Admin',
      description: 'Full access to all features, user management, billing, and settings',
      color: 'bg-red-100 text-red-800',
      capabilities: [
        'Manage all users and roles',
        'View all analytics and reports',
        'Configure webhooks and integrations',
        'Access billing and subscription settings',
        'Create and edit scenarios and tracks'
      ]
    },
    {
      role: 'Manager',
      email: 'manager@demo.com',
      name: 'Jane Manager',
      description: 'Team management, assignments, and performance oversight',
      color: 'bg-blue-100 text-blue-800',
      capabilities: [
        'Invite new team members',
        'Create and assign training',
        'View team performance reports',
        'Review call recordings and scores',
        'Manage team assignments'
      ]
    },
    {
      role: 'HR',
      email: 'hr@demo.com',
      name: 'Sarah HR',
      description: 'Compliance reporting and training oversight',
      color: 'bg-purple-100 text-purple-800',
      capabilities: [
        'View compliance reports',
        'Track certification status',
        'Export training records',
        'Access audit reports',
        'Monitor completion rates'
      ]
    },
    {
      role: 'Trainee',
      email: 'trainee@demo.com',
      name: 'Bob Trainee',
      description: 'Basic access to assigned training and personal progress',
      color: 'bg-gray-100 text-gray-800',
      capabilities: [
        'Complete assigned scenarios',
        'View personal progress',
        'Access voice simulator',
        'Review feedback and scores',
        'Track leaderboard ranking'
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Demo Environment</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience our enterprise AI sales training platform with pre-configured demo accounts.
          Each role demonstrates different capabilities and access levels.
        </p>
      </div>

      <Alert className="mb-8 border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Demo Environment Notice:</strong> This is a demonstration environment with sample data.
          No real user data or payments are processed. Demo accounts reset periodically.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {demoUsers.map((user) => (
          <Card key={user.email} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {user.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {user.email}
                  </CardDescription>
                </div>
                <Badge className={user.color}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Key Capabilities:</h4>
                  <ul className="text-xs space-y-1">
                    {user.capabilities.map((capability, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Copy className="h-3 w-3" />
                    <span>Click to copy credentials</span>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigator.clipboard.writeText(user.email)}
                      className="text-left hover:bg-gray-50 p-1 rounded text-xs font-mono bg-gray-100 w-full"
                    >
                      {user.email}
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText('Demo123!')}
                      className="text-left hover:bg-gray-50 p-1 rounded text-xs font-mono bg-gray-100 w-full"
                    >
                      Password: Demo123!
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Demo Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> Demo Sales Organization</div>
              <div><strong>Plan:</strong> Professional</div>
              <div><strong>Users:</strong> 5 demo accounts</div>
              <div><strong>Features:</strong> Full feature access</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sample Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Scenarios:</strong> 3 loan officer training scenarios</div>
              <div><strong>Tracks:</strong> New Hire Certification program</div>
              <div><strong>Assignments:</strong> Active training assignments</div>
              <div><strong>Data:</strong> Sample attempts and scores</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Test Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• Voice AI simulations</div>
              <div>• Real-time scoring</div>
              <div>• Analytics dashboards</div>
              <div>• Team management</div>
              <div>• User provisioning</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-in">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Access Demo Environment
              </div>
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/request-demo">
              Request Live Demo
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <h3 className="font-semibold mb-3">Getting Started</h3>
          <ol className="text-sm text-left space-y-2">
            <li>1. Choose a demo account from above and copy the credentials</li>
            <li>2. Click "Access Demo Environment" to go to the sign-in page</li>
            <li>3. Sign in with the demo credentials (email and password: Demo123!)</li>
            <li>4. Explore the features available for that role</li>
            <li>5. Switch between accounts to see different permission levels</li>
          </ol>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            Questions about the demo? Contact us at{' '}
            <a href="mailto:demo@speakstride.com" className="underline">
              demo@speakstride.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}