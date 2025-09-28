import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Users, Zap } from 'lucide-react'

export default function RequestDemoPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Request a Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See how our enterprise AI sales training platform can transform your sales team's performance.
          Schedule a personalized demo with our team.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Enterprise-Grade Platform
            </CardTitle>
            <CardDescription>
              Built for large sales organizations with advanced security, compliance, and admin controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Multi-tenant organization management</li>
              <li>• Role-based access control</li>
              <li>• SSO and enterprise integrations</li>
              <li>• Advanced reporting and analytics</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Comprehensive tools for managing sales teams, assignments, and performance tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Bulk user provisioning</li>
              <li>• Team-based assignments</li>
              <li>• Manager dashboards</li>
              <li>• HR compliance reporting</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Fill out the form below and our team will contact you within 24 hours to schedule your demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input id="email" type="email" placeholder="john@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Acme Corporation" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" placeholder="Sales Manager" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSize">Sales Team Size</Label>
                <select id="teamSize" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select team size</option>
                  <option value="1-10">1-10 people</option>
                  <option value="11-25">11-25 people</option>
                  <option value="26-50">26-50 people</option>
                  <option value="51-100">51-100 people</option>
                  <option value="100+">100+ people</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Implementation Timeline</Label>
                <select id="timeline" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select timeline</option>
                  <option value="immediate">Immediate (0-1 month)</option>
                  <option value="short">Short term (1-3 months)</option>
                  <option value="medium">Medium term (3-6 months)</option>
                  <option value="long">Long term (6+ months)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Tell us about your sales training needs</Label>
              <Textarea
                id="message"
                placeholder="What challenges are you looking to solve? What specific features interest you most?"
                className="min-h-[120px]"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Request Demo
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Have questions? Email us at{' '}
          <a href="mailto:sales@speakstride.com" className="underline">
            sales@speakstride.com
          </a>{' '}
          or call{' '}
          <a href="tel:+1-555-123-4567" className="underline">
            +1 (555) 123-4567
          </a>
        </p>
      </div>
    </div>
  )
}