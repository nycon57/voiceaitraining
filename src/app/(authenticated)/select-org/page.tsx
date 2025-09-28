import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2 } from 'lucide-react'

export default async function SelectOrgPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // If user already has an org context, redirect to dashboard
  if (user.orgId) {
    redirect(`/org/${user.orgId}/dashboard`)
  }

  // Get user's organizations from Supabase
  const supabase = await createClient()
  const { data: orgs, error } = await supabase
    .from('org_members')
    .select(`
      org_id,
      role,
      orgs!inner(
        id,
        name,
        plan,
        created_at
      )
    `)
    .eq('user_id', user.id)

  const organizations = orgs?.map(member => ({
    id: member.org_id,
    name: member.orgs.name,
    plan: member.orgs.plan,
    role: member.role,
    created_at: member.orgs.created_at
  })) || []

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Organization</h1>
          <p className="text-muted-foreground">
            Choose an organization to continue to your dashboard
          </p>
        </div>

        {organizations.length > 0 ? (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Building2 className="h-6 w-6 mr-3" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {org.role} • {org.plan} plan
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <a href={`/org/${org.id}/dashboard`}>
                      Enter
                    </a>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organizations Found</h3>
              <p className="text-muted-foreground text-center mb-6">
                You're not a member of any organizations yet. Please contact your system administrator
                to request access or to be added to an organization.
              </p>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@speakstride.com" className="underline">
                    support@speakstride.com
                  </a>
                </p>
                <Button variant="outline" asChild>
                  <a href="/sign-in">Sign Out</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}