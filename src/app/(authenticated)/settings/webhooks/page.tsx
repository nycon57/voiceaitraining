import { getCurrentUser } from '@/lib/auth'
import { getWebhooks } from '@/actions/webhooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WebhookForm } from '@/components/webhooks/webhook-form'
import { WebhookManager } from '@/components/webhooks/webhook-manager'
import { MoreHorizontal, Plus, Webhook, ExternalLink, Settings, Activity } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function WebhooksPage() {

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Check if user has access to webhooks
  const hasWebhookAccess = ['admin', 'manager'].includes(user.role || '')
  if (!hasWebhookAccess) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground text-center">
              Webhook management is limited to managers and administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  let webhooks
  try {
    webhooks = await getWebhooks()
  } catch (error) {
    console.error('Failed to load webhooks:', error)
    webhooks = []
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground">
            Manage webhook integrations for real-time event notifications
          </p>
        </div>
        <WebhookManager>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </WebhookManager>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            About Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🔗 Real-time Integration</h4>
              <p className="text-muted-foreground">
                Receive instant HTTP notifications when training events occur in your organization.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔐 Secure Delivery</h4>
              <p className="text-muted-foreground">
                All webhook requests are signed with HMAC SHA-256 for authentication and verification.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Automatic Retries</h4>
              <p className="text-muted-foreground">
                Failed webhook deliveries are automatically retried with exponential backoff.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Delivery Monitoring</h4>
              <p className="text-muted-foreground">
                Track delivery status, response codes, and troubleshoot failed webhooks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
          <CardDescription>
            {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook: any) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{webhook.name}</div>
                        {webhook.description && (
                          <div className="text-sm text-muted-foreground">
                            {webhook.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {webhook.url.length > 40
                            ? webhook.url.substring(0, 40) + '...'
                            : webhook.url
                          }
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(webhook.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.slice(0, 2).map((event: string) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          webhook.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {webhook.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(webhook.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {webhook.created_by_user?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <WebhookManager webhook={webhook}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Settings className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </WebhookManager>
                          <DropdownMenuItem asChild>
                            <a href={`/settings/webhooks/${webhook.id}/deliveries`}>
                              <Activity className="h-4 w-4 mr-2" />
                              View Deliveries
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
              <p className="text-muted-foreground mb-6">
                Create your first webhook to start receiving real-time notifications.
              </p>
              <WebhookManager>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </WebhookManager>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}