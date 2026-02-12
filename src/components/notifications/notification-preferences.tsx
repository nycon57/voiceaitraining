'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Bell, Clock, Lightbulb, Mail, Monitor, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferencesInput,
} from '@/actions/notifications'

const COMMON_TIMEZONE_VALUES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'UTC',
]

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz })
    return true
  } catch {
    return false
  }
}

const formSchema = z.object({
  channel_email: z.boolean(),
  channel_push: z.boolean(),
  channel_in_app: z.boolean(),
  quiet_hours_start: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').nullable(),
  quiet_hours_end: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format').nullable(),
  quiet_hours_timezone: z
    .string()
    .refine(isValidTimezone, {
      message: 'Invalid timezone. Please select a valid IANA timezone.',
    }),
  digest_frequency: z.enum(['daily', 'weekly', 'none']),
  coach_nudges: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>


export function NotificationPreferences() {
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel_email: true,
      channel_push: true,
      channel_in_app: true,
      quiet_hours_start: null,
      quiet_hours_end: null,
      quiet_hours_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      digest_frequency: 'daily',
      coach_nudges: true,
    },
  })

  useEffect(() => {
    async function load() {
      try {
        const prefs = await getNotificationPreferences()
        form.reset({
          channel_email: prefs.channel_email,
          channel_push: prefs.channel_push,
          channel_in_app: prefs.channel_in_app,
          quiet_hours_start: prefs.quiet_hours_start,
          quiet_hours_end: prefs.quiet_hours_end,
          quiet_hours_timezone: prefs.quiet_hours_timezone,
          digest_frequency: prefs.digest_frequency as 'daily' | 'weekly' | 'none',
          coach_nudges: prefs.coach_nudges,
        })
      } catch (err) {
        console.error('Failed to load notification preferences:', err)
        toast.error('Failed to load notification preferences')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [form])

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await updateNotificationPreferences(values as NotificationPreferencesInput)
        form.reset(values)
        toast.success('Notification preferences saved')
      } catch (err) {
        console.error('Failed to save notification preferences:', err)
        toast.error('Failed to save notification preferences')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="channel_email"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between" animated={false}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base cursor-pointer flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email notifications
                    </FormLabel>
                    <FormDescription animated={false}>
                      Receive notifications via email
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

            <Separator />

            <FormField
              control={form.control}
              name="channel_push"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between" animated={false}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base cursor-pointer flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Push notifications
                    </FormLabel>
                    <FormDescription animated={false}>
                      Receive browser push notifications
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

            <Separator />

            <FormField
              control={form.control}
              name="channel_in_app"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between" animated={false}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base cursor-pointer flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      In-app notifications
                    </FormLabel>
                    <FormDescription animated={false}>
                      Show notifications inside the application
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
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Pause notifications during specific hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quiet_hours_start"
                render={({ field }) => (
                  <FormItem animated={false}>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage animated={false} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quiet_hours_end"
                render={({ field }) => (
                  <FormItem animated={false}>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage animated={false} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="quiet_hours_timezone"
              render={({ field }) => (
                <FormItem animated={false}>
                  <FormLabel>Timezone</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMON_TIMEZONE_VALUES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage animated={false} />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Coach & Digest */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Coaching & Digest
            </CardTitle>
            <CardDescription>
              Control coaching nudges and digest emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="coach_nudges"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between" animated={false}>
                  <div className="space-y-0.5">
                    <FormLabel className="text-base cursor-pointer">
                      Coach nudges
                    </FormLabel>
                    <FormDescription animated={false}>
                      Receive AI coach recommendations and practice reminders
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

            <Separator />

            <FormField
              control={form.control}
              name="digest_frequency"
              render={({ field }) => (
                <FormItem animated={false}>
                  <FormLabel>Digest frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="none">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription animated={false}>
                    How often you receive a summary of your training activity
                  </FormDescription>
                  <FormMessage animated={false} />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !form.formState.isDirty}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isPending ? 'Saving...' : 'Save notification preferences'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
