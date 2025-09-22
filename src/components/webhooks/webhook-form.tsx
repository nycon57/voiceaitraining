'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, Info } from 'lucide-react'
import { createWebhook, updateWebhook, WEBHOOK_EVENTS } from '@/actions/webhooks'
import { toast } from '@/components/hooks/use-toast'

const webhookFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  retry_attempts: z.number().min(0).max(10).default(3),
  timeout_seconds: z.number().min(1).max(60).default(30),
})

type WebhookFormData = z.infer<typeof webhookFormSchema>

interface WebhookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook?: any
  onSuccess?: () => void
}

const EVENT_DESCRIPTIONS = {
  'scenario.assigned': 'When a scenario is assigned to a user',
  'scenario.completed': 'When a user completes a scenario training session',
  'attempt.scored.low': 'When an attempt receives a score below 60%',
  'attempt.scored.high': 'When an attempt receives a score of 80% or higher',
  'track.completed': 'When a user completes an entire training track',
  'user.added': 'When a new user joins the organization',
  'user.removed': 'When a user is removed from the organization',
  'assignment.overdue': 'When an assignment deadline passes without completion',
  'performance.milestone': 'When a user reaches a performance milestone',
} as const

export function WebhookForm({ open, onOpenChange, webhook, onSuccess }: WebhookFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!webhook

  const form = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: webhook ? {
      name: webhook.name,
      url: webhook.url,
      events: webhook.events || [],
      description: webhook.description || '',
      enabled: webhook.enabled ?? true,
      retry_attempts: webhook.retry_attempts ?? 3,
      timeout_seconds: webhook.timeout_seconds ?? 30,
    } : {
      name: '',
      url: '',
      events: [],
      description: '',
      enabled: true,
      retry_attempts: 3,
      timeout_seconds: 30,
    }
  })

  const onSubmit = async (data: WebhookFormData) => {
    setIsLoading(true)
    try {
      if (isEditing) {
        await updateWebhook(webhook.id, data)
        toast({
          title: 'Webhook updated',
          description: 'Your webhook has been updated successfully.',
        })
      } else {
        await createWebhook(data)
        toast({
          title: 'Webhook created',
          description: 'Your webhook has been created successfully.',
        })
      }
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedEvents = form.watch('events')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Webhook' : 'Create Webhook'}
          </DialogTitle>
          <DialogDescription>
            Configure a webhook endpoint to receive real-time notifications about training events.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Integration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription className="text-xs">
                        Webhook will receive events
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Input
                        placeholder="https://api.example.com/webhooks"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => window.open(field.value, '_blank')}
                        disabled={!field.value}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    The URL where webhook events will be sent via HTTP POST
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this webhook is used for..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              render={() => (
                <FormItem>
                  <FormLabel>Events to Subscribe</FormLabel>
                  <FormDescription>
                    Choose which events should trigger this webhook
                  </FormDescription>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {WEBHOOK_EVENTS.map((event) => (
                      <FormField
                        key={event}
                        control={form.control}
                        name="events"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={event}
                              className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(event)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, event])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== event
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-mono text-sm">
                                  {event}
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  {EVENT_DESCRIPTIONS[event as keyof typeof EVENT_DESCRIPTIONS]}
                                </FormDescription>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                  {selectedEvents.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm text-muted-foreground mb-2">
                        Selected events ({selectedEvents.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvents.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="retry_attempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retry Attempts</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Number of retries for failed deliveries (0-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeout_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={60}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Request timeout in seconds (1-60)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start space-x-2 rounded-md border p-3 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <div className="font-medium mb-1">Webhook Security</div>
                <div>All webhook requests include HMAC SHA-256 signatures for verification. Use the webhook secret to validate request authenticity.</div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Webhook' : 'Create Webhook'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}