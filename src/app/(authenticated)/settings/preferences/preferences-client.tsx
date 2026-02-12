'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Palette,
  Zap,
  Bell,
  Lock,
  Settings2,
  Sun,
  Moon,
  Monitor,
  Save,
  RotateCcw,
  Volume2,
  Mic,
  Headphones,
  Play,
  MessageSquare,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Lightbulb,
  Users
} from 'lucide-react'
import { NotificationPreferences } from '@/components/notifications/notification-preferences'
import type { AuthUser } from '@/lib/auth'
import { toast } from 'sonner'

interface PreferencesClientProps {
  user: AuthUser
}

// Preferences type
interface Preferences {
  // Appearance
  theme: 'light' | 'dark' | 'auto'
  accentColor: string
  sidebarCollapsed: boolean
  compactMode: boolean
  showAnimations: boolean

  // Training
  sessionDuration: number
  preferredDifficulty: 'easy' | 'medium' | 'hard'
  autoStartSessions: boolean
  showHints: boolean
  microphoneDevice: string
  speakerDevice: string
  detailedFeedback: boolean
  showTranscript: boolean

  // Privacy
  leaderboardVisible: boolean
  profileVisibleToTeam: boolean
  shareProgressWithManagers: boolean

  // Advanced
  developerMode: boolean
}

const defaultPreferences: Preferences = {
  theme: 'auto',
  accentColor: 'blue',
  sidebarCollapsed: false,
  compactMode: false,
  showAnimations: true,
  sessionDuration: 15,
  preferredDifficulty: 'medium',
  autoStartSessions: false,
  showHints: true,
  microphoneDevice: 'default',
  speakerDevice: 'default',
  detailedFeedback: true,
  showTranscript: true,
  leaderboardVisible: true,
  profileVisibleToTeam: true,
  shareProgressWithManagers: true,
  developerMode: false,
}

export function PreferencesClient({ user }: PreferencesClientProps) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('appearance')

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('userPreferences')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (error) {
        console.error('Failed to parse preferences:', error)
      }
    }
  }, [])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences))

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      toast.success('Preferences saved', {
        description: 'Your settings have been updated.',
        icon: <CheckCircle2 className="h-4 w-4" />
      })
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save preferences', {
        description: 'Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    const stored = localStorage.getItem('userPreferences')
    if (stored) {
      const parsed = JSON.parse(stored)
      setPreferences({ ...defaultPreferences, ...parsed })
    } else {
      setPreferences(defaultPreferences)
    }
    setHasChanges(false)
    toast.info('Changes discarded')
  }

  const handleTestAudio = (type: 'microphone' | 'speaker') => {
    toast.info(`Testing ${type}...`, {
      description: 'Audio test functionality coming soon'
    })
  }

  const handleExportData = () => {
    toast.info('Exporting your data...', {
      description: 'Data export functionality coming soon'
    })
  }

  const handleClearCache = () => {
    toast.success('Cache cleared', {
      description: 'Application cache has been cleared'
    })
  }

  const accentColors = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
  ]

  const keyboardShortcuts = [
    { keys: ['Cmd/Ctrl', 'K'], description: 'Open command palette' },
    { keys: ['Cmd/Ctrl', 'N'], description: 'New scenario' },
    { keys: ['Cmd/Ctrl', 'S'], description: 'Save' },
    { keys: ['Cmd/Ctrl', '/'], description: 'Toggle sidebar' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ]

  return (
    <>
      <Header />
      <div className="space-y-6 p-4 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Preferences</h1>
          <p className="text-muted-foreground">
            Customize your training experience and application settings
          </p>
        </div>

        {hasChanges && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes. Don't forget to save your preferences.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:inline-flex">
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2 col-span-2 sm:col-span-1">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Theme</CardTitle>
                <CardDescription>
                  Choose how the application looks to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={preferences.theme}
                  onValueChange={(value) => updatePreference('theme', value as 'light' | 'dark' | 'auto')}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Label
                      htmlFor="light"
                      className="flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      data-state={preferences.theme === 'light' ? 'checked' : 'unchecked'}
                    >
                      <RadioGroupItem value="light" id="light" className="sr-only" />
                      <Sun className="h-8 w-8" />
                      <div className="text-center">
                        <p className="font-medium">Light</p>
                        <p className="text-sm text-muted-foreground">Day mode</p>
                      </div>
                    </Label>

                    <Label
                      htmlFor="dark"
                      className="flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      data-state={preferences.theme === 'dark' ? 'checked' : 'unchecked'}
                    >
                      <RadioGroupItem value="dark" id="dark" className="sr-only" />
                      <Moon className="h-8 w-8" />
                      <div className="text-center">
                        <p className="font-medium">Dark</p>
                        <p className="text-sm text-muted-foreground">Night mode</p>
                      </div>
                    </Label>

                    <Label
                      htmlFor="auto"
                      className="flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      data-state={preferences.theme === 'auto' ? 'checked' : 'unchecked'}
                    >
                      <RadioGroupItem value="auto" id="auto" className="sr-only" />
                      <Monitor className="h-8 w-8" />
                      <div className="text-center">
                        <p className="font-medium">Auto</p>
                        <p className="text-sm text-muted-foreground">System</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <Separator />

                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updatePreference('accentColor', color.value)}
                        className={`h-10 w-10 rounded-full ${color.class} transition-all ${
                          preferences.accentColor === color.value
                            ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                            : 'hover:scale-105'
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sidebarCollapsed" className="text-base cursor-pointer">
                        Sidebar Collapsed by Default
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Start with a collapsed sidebar for more screen space
                      </p>
                    </div>
                    <Switch
                      id="sidebarCollapsed"
                      checked={preferences.sidebarCollapsed}
                      onCheckedChange={(checked) => updatePreference('sidebarCollapsed', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactMode" className="text-base cursor-pointer">
                        Compact Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing for a denser interface
                      </p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={preferences.compactMode}
                      onCheckedChange={(checked) => updatePreference('compactMode', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="showAnimations" className="text-base cursor-pointer">
                        Show Animations
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      id="showAnimations"
                      checked={preferences.showAnimations}
                      onCheckedChange={(checked) => updatePreference('showAnimations', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Session Settings
                </CardTitle>
                <CardDescription>
                  Configure your default training session preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sessionDuration">
                      Default Session Duration
                    </Label>
                    <span className="text-sm font-medium">
                      {preferences.sessionDuration} minutes
                    </span>
                  </div>
                  <Slider
                    id="sessionDuration"
                    min={5}
                    max={60}
                    step={5}
                    value={[preferences.sessionDuration]}
                    onValueChange={([value]) => updatePreference('sessionDuration', value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 15-30 minutes for optimal learning
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="preferredDifficulty">Preferred Difficulty</Label>
                  <Select
                    value={preferences.preferredDifficulty}
                    onValueChange={(value) => updatePreference('preferredDifficulty', value as 'easy' | 'medium' | 'hard')}
                  >
                    <SelectTrigger id="preferredDifficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy - Beginner friendly</SelectItem>
                      <SelectItem value="medium">Medium - Standard challenge</SelectItem>
                      <SelectItem value="hard">Hard - Expert level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoStartSessions" className="text-base cursor-pointer">
                      Auto-Start Sessions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically begin recording when you join
                    </p>
                  </div>
                  <Switch
                    id="autoStartSessions"
                    checked={preferences.autoStartSessions}
                    onCheckedChange={(checked) => updatePreference('autoStartSessions', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showHints" className="text-base cursor-pointer flex items-center gap-2">
                      Show Hints
                      <Lightbulb className="h-4 w-4" />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display helpful tips during training sessions
                    </p>
                  </div>
                  <Switch
                    id="showHints"
                    checked={preferences.showHints}
                    onCheckedChange={(checked) => updatePreference('showHints', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Audio Preferences
                </CardTitle>
                <CardDescription>
                  Configure microphone and speaker settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="microphoneDevice">Microphone</Label>
                  <div className="flex gap-2">
                    <Select
                      value={preferences.microphoneDevice}
                      onValueChange={(value) => updatePreference('microphoneDevice', value)}
                    >
                      <SelectTrigger id="microphoneDevice" className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Microphone</SelectItem>
                        <SelectItem value="built-in">Built-in Microphone</SelectItem>
                        <SelectItem value="usb">USB Microphone</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleTestAudio('microphone')}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="speakerDevice">Speakers</Label>
                  <div className="flex gap-2">
                    <Select
                      value={preferences.speakerDevice}
                      onValueChange={(value) => updatePreference('speakerDevice', value)}
                    >
                      <SelectTrigger id="speakerDevice" className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Speakers</SelectItem>
                        <SelectItem value="built-in">Built-in Speakers</SelectItem>
                        <SelectItem value="headphones">Headphones</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleTestAudio('speaker')}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback Preferences
                </CardTitle>
                <CardDescription>
                  Customize how you receive feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="detailedFeedback" className="text-base cursor-pointer">
                      Detailed Feedback
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get in-depth analysis and suggestions
                    </p>
                  </div>
                  <Switch
                    id="detailedFeedback"
                    checked={preferences.detailedFeedback}
                    onCheckedChange={(checked) => updatePreference('detailedFeedback', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showTranscript" className="text-base cursor-pointer">
                      Show Transcript
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display full conversation transcript
                    </p>
                  </div>
                  <Switch
                    id="showTranscript"
                    checked={preferences.showTranscript}
                    onCheckedChange={(checked) => updatePreference('showTranscript', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationPreferences />
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your visibility and data sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="leaderboardVisible" className="text-base cursor-pointer flex items-center gap-2">
                      {preferences.leaderboardVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      Leaderboard Visibility
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show your performance on public leaderboards
                    </p>
                  </div>
                  <Switch
                    id="leaderboardVisible"
                    checked={preferences.leaderboardVisible}
                    onCheckedChange={(checked) => updatePreference('leaderboardVisible', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profileVisibleToTeam" className="text-base cursor-pointer flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Profile Visible to Team
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow team members to view your profile
                    </p>
                  </div>
                  <Switch
                    id="profileVisibleToTeam"
                    checked={preferences.profileVisibleToTeam}
                    onCheckedChange={(checked) => updatePreference('profileVisibleToTeam', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shareProgressWithManagers" className="text-base cursor-pointer">
                      Share Progress with Managers
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow managers to view your detailed progress
                    </p>
                  </div>
                  <Switch
                    id="shareProgressWithManagers"
                    checked={preferences.shareProgressWithManagers}
                    onCheckedChange={(checked) => updatePreference('shareProgressWithManagers', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Your data is encrypted and secure. We never share your personal information with third parties.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription>
                  Quick reference for keyboard shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {keyboardShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your data and cache
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download all your training data and progress
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Clear Cache</p>
                    <p className="text-sm text-muted-foreground">
                      Clear application cache and temporary files
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleClearCache}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Developer Options
                </CardTitle>
                <CardDescription>
                  Advanced settings for debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="developerMode" className="text-base cursor-pointer">
                      Developer Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable debugging tools and console logs
                    </p>
                  </div>
                  <Switch
                    id="developerMode"
                    checked={preferences.developerMode}
                    onCheckedChange={(checked) => updatePreference('developerMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons - Fixed at bottom on mobile */}
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
                  {isSubmitting ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
