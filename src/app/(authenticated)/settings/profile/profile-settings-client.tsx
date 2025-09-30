'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Upload,
  X,
  Calendar,
  TrendingUp,
  Target,
  Bell,
  BellOff,
  Shield,
  Trash2,
  Key,
  Smartphone,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import type { AuthUser } from '@/lib/auth'
import { toast } from 'sonner'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  department: string
  avatarUrl: string | null
  memberSince: Date
  totalSessions: number
  averageScore: number
  profileCompletion: number
}

interface ProfileSettingsClientProps {
  user: AuthUser
  profileData: ProfileData
}

export function ProfileSettingsClient({ user, profileData }: ProfileSettingsClientProps) {
  const [formData, setFormData] = useState(profileData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [assignmentReminders, setAssignmentReminders] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [performanceAlerts, setPerformanceAlerts] = useState(false)

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Profile updated successfully', {
        description: 'Your changes have been saved.',
        icon: <CheckCircle2 className="h-4 w-4" />
      })
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to update profile', {
        description: 'Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    setFormData(profileData)
    setHasChanges(false)
    toast.info('Changes discarded')
  }

  const handleAvatarUpload = () => {
    toast.info('Avatar upload functionality coming soon')
  }

  const handleRemoveAvatar = () => {
    toast.success('Avatar removed')
  }

  const getInitials = () => {
    const first = formData.firstName?.[0] || ''
    const last = formData.lastName?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      case 'hr': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <>
      <Header />
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {hasChanges && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Don't forget to save your updates.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="flex-1"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Email Address</DialogTitle>
                          <DialogDescription>
                            This feature is managed through your authentication provider.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Close</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="e.g., Loan Officer"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="e.g., Sales"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a profile picture or avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatarUrl || undefined} />
                    <AvatarFallback className="text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button onClick={handleAvatarUpload} size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      {formData.avatarUrl && (
                        <Button onClick={handleRemoveAvatar} variant="outline" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how you receive updates and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications" className="text-base cursor-pointer">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inAppNotifications" className="text-base cursor-pointer">
                      In-App Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications in the application
                    </p>
                  </div>
                  <Switch
                    id="inAppNotifications"
                    checked={inAppNotifications}
                    onCheckedChange={setInAppNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="assignmentReminders" className="text-base cursor-pointer">
                      Assignment Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming assignments
                    </p>
                  </div>
                  <Switch
                    id="assignmentReminders"
                    checked={assignmentReminders}
                    onCheckedChange={setAssignmentReminders}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weeklyDigest" className="text-base cursor-pointer">
                      Weekly Digest
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your progress
                    </p>
                  </div>
                  <Switch
                    id="weeklyDigest"
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="performanceAlerts" className="text-base cursor-pointer">
                      Performance Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your scores change significantly
                    </p>
                  </div>
                  <Switch
                    id="performanceAlerts"
                    checked={performanceAlerts}
                    onCheckedChange={setPerformanceAlerts}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 3 months ago
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          This feature is managed through your authentication provider.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security (Coming soon)
                      </p>
                    </div>
                  </div>
                  <Switch disabled />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers, including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All training sessions and recordings</li>
                          <li>Performance history and scores</li>
                          <li>Personal information and preferences</li>
                          <li>Team assignments and progress</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Preview (1/3 width, sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={formData.avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-headline">
                    {formData.firstName || formData.lastName
                      ? `${formData.firstName} ${formData.lastName}`.trim()
                      : 'Your Name'}
                  </CardTitle>
                  <CardDescription>{formData.email}</CardDescription>
                  <div className="flex justify-center mt-2">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role || 'trainee'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {formatDate(formData.memberSince)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Quick Stats</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="h-4 w-4" />
                          <span>Total Sessions</span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formData.totalSessions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <span>Average Score</span>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formData.averageScore}%
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Profile Completion</span>
                        <span className="text-muted-foreground">
                          {formData.profileCompletion}%
                        </span>
                      </div>
                      <Progress value={formData.profileCompletion} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Complete your profile to unlock all features
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom on mobile, inline on desktop */}
        <div className="sticky bottom-4 z-10 lg:static">
          <Card className="shadow-lg lg:shadow-none">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={!hasChanges || isSubmitting}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Discard Changes
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
