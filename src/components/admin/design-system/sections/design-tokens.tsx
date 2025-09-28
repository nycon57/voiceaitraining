"use client"

import { useState } from "react"
import { Copy, Check, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const spacingSystem = {
  0: { px: "0px", rem: "0rem", usage: "No spacing" },
  0.5: { px: "2px", rem: "0.125rem", usage: "Micro spacing" },
  1: { px: "4px", rem: "0.25rem", usage: "Fine details" },
  1.5: { px: "6px", rem: "0.375rem", usage: "Small gaps" },
  2: { px: "8px", rem: "0.5rem", usage: "Compact spacing" },
  2.5: { px: "10px", rem: "0.625rem", usage: "Tight spacing" },
  3: { px: "12px", rem: "0.75rem", usage: "Small padding" },
  3.5: { px: "14px", rem: "0.875rem", usage: "Medium-small" },
  4: { px: "16px", rem: "1rem", usage: "Base unit" },
  5: { px: "20px", rem: "1.25rem", usage: "Comfortable spacing" },
  6: { px: "24px", rem: "1.5rem", usage: "Medium padding" },
  7: { px: "28px", rem: "1.75rem", usage: "Large-medium" },
  8: { px: "32px", rem: "2rem", usage: "Large spacing" },
  9: { px: "36px", rem: "2.25rem", usage: "Extra large" },
  10: { px: "40px", rem: "2.5rem", usage: "Section spacing" },
  11: { px: "44px", rem: "2.75rem", usage: "Large sections" },
  12: { px: "48px", rem: "3rem", usage: "Major spacing" },
  14: { px: "56px", rem: "3.5rem", usage: "Large margins" },
  16: { px: "64px", rem: "4rem", usage: "Page sections" },
  20: { px: "80px", rem: "5rem", usage: "Large page sections" },
  24: { px: "96px", rem: "6rem", usage: "Major page spacing" },
  28: { px: "112px", rem: "7rem", usage: "Hero sections" },
  32: { px: "128px", rem: "8rem", usage: "Large hero spacing" },
  36: { px: "144px", rem: "9rem", usage: "Maximum spacing" },
  40: { px: "160px", rem: "10rem", usage: "Largest spacing" },
  44: { px: "176px", rem: "11rem", usage: "Extra large" },
  48: { px: "192px", rem: "12rem", usage: "Massive spacing" },
  52: { px: "208px", rem: "13rem", usage: "Ultra spacing" },
  56: { px: "224px", rem: "14rem", usage: "Maximum layout" },
  60: { px: "240px", rem: "15rem", usage: "Extreme spacing" },
  64: { px: "256px", rem: "16rem", usage: "Ultimate spacing" },
  72: { px: "288px", rem: "18rem", usage: "Largest possible" },
  80: { px: "320px", rem: "20rem", usage: "Maximum available" },
  96: { px: "384px", rem: "24rem", usage: "Ultra maximum" }
}

const radiusSystem = {
  none: { px: "0px", usage: "No rounding, sharp edges" },
  sm: { px: "4px", usage: "Subtle rounding for fine elements" },
  md: { px: "6px", usage: "Standard rounding for most elements" },
  lg: { px: "8px", usage: "Default border radius" },
  xl: { px: "12px", usage: "Large rounding for prominent elements" },
  "2xl": { px: "16px", usage: "Extra large rounding" },
  "3xl": { px: "24px", usage: "Very large rounding" },
  full: { px: "9999px", usage: "Full rounding for circles/pills" }
}

const shadowSystem = {
  sm: {
    value: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    usage: "Subtle shadow for small elements"
  },
  md: {
    value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    usage: "Default shadow for cards and buttons"
  },
  lg: {
    value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    usage: "Elevated elements and modals"
  },
  xl: {
    value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    usage: "High elevation, dropdowns"
  },
  "2xl": {
    value: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    usage: "Maximum elevation for overlays"
  },
  inner: {
    value: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    usage: "Inset shadow for inputs and wells"
  }
}

const animationSystem = {
  spin: {
    duration: "1s",
    timing: "linear",
    iteration: "infinite",
    keyframes: "0deg to 360deg rotation",
    usage: "Loading spinners"
  },
  ping: {
    duration: "1s",
    timing: "cubic-bezier(0, 0, 0.2, 1)",
    iteration: "infinite",
    keyframes: "Scale and fade pulse",
    usage: "Notification indicators"
  },
  pulse: {
    duration: "2s",
    timing: "cubic-bezier(0.4, 0, 0.6, 1)",
    iteration: "infinite",
    keyframes: "Opacity pulse",
    usage: "Loading states"
  },
  bounce: {
    duration: "1s",
    timing: "ease-in-out",
    iteration: "infinite",
    keyframes: "Up and down movement",
    usage: "Attention-grabbing elements"
  }
}

const transitionSystem = {
  none: { duration: "0s", usage: "No transition" },
  fast: { duration: "75ms", timing: "ease-out", usage: "Instant feedback" },
  normal: { duration: "150ms", timing: "ease-out", usage: "Standard interactions" },
  slow: { duration: "300ms", timing: "ease-out", usage: "Smooth state changes" },
  slower: { duration: "500ms", timing: "ease-out", usage: "Complex transitions" },
  slowest: { duration: "1000ms", timing: "ease-out", usage: "Page transitions" }
}

function SpacingDemo({ size, value }: { size: string, value: { px: string, rem: string, usage: string } }) {
  const [copied, setCopied] = useState(false)

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{size}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyValue(value.rem)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {value.px} • {value.rem}
          </div>
        </div>

        <div className="mb-3">
          <div
            className="bg-primary h-4 rounded-sm"
            style={{ width: value.px }}
          />
        </div>

        <p className="text-xs text-muted-foreground">{value.usage}</p>
      </div>
    </div>
  )
}

function RadiusDemo({ name, value }: { name: string, value: { px: string, usage: string } }) {
  const [copied, setCopied] = useState(false)

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{name}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyValue(value.px)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">{value.px}</div>
        </div>

        <div className="mb-3">
          <div
            className="bg-primary h-16 w-full"
            style={{ borderRadius: value.px }}
          />
        </div>

        <p className="text-xs text-muted-foreground">{value.usage}</p>
      </div>
    </div>
  )
}

function ShadowDemo({ name, shadow }: { name: string, shadow: { value: string, usage: string } }) {
  const [copied, setCopied] = useState(false)

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative">
      <div className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{name}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyValue(shadow.value)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className="mb-3 flex justify-center">
          <div
            className="bg-card h-16 w-24 rounded-lg border"
            style={{ boxShadow: shadow.value }}
          />
        </div>

        <p className="text-xs text-muted-foreground">{shadow.usage}</p>
      </div>
    </div>
  )
}

function AnimationDemo({ name, animation }: { name: string, animation: any }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(`animate-${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000)
    }
  }

  return (
    <div className="group relative">
      <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{name}</code>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyValue(name)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAnimation}
            className="gap-1"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isPlaying ? "Stop" : "Play"}
          </Button>
        </div>

        <div className="mb-3 flex justify-center h-16 items-center">
          <div
            className={cn(
              "bg-primary h-8 w-8 rounded-full",
              isPlaying && `animate-${name}`
            )}
          />
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p><strong>Usage:</strong> {animation.usage}</p>
          <p><strong>Duration:</strong> {animation.duration}</p>
          <p><strong>Timing:</strong> {animation.timing}</p>
        </div>
      </div>
    </div>
  )
}

export function DesignTokensSection() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Design Tokens</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Our design tokens provide the fundamental building blocks for consistent spacing,
          sizing, elevation, and motion throughout the SpeakStride platform.
        </p>
      </div>

      {/* Spacing System */}
      <section id="spacing" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Spacing System</h2>
          <p className="text-lg text-muted-foreground">
            A systematic approach to spacing that creates visual rhythm and hierarchy.
            Built on a 4px base unit for pixel-perfect alignment.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Spacing Scale</CardTitle>
            <CardDescription>
              Consistent spacing values from micro (2px) to maximum (384px).
              Use these values for margins, padding, and gaps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(spacingSystem).slice(0, 24).map(([size, value]) => (
                <SpacingDemo key={size} size={size} value={value} />
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Usage Guidelines</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Use multiples of 4px for all spacing values</p>
                <p>• Prefer smaller spacing (4-16px) for component internals</p>
                <p>• Use larger spacing (24-64px) for layout and page structure</p>
                <p>• Maintain consistent spacing ratios for visual harmony</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Border Radius */}
      <section id="radius" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Border Radius</h2>
          <p className="text-lg text-muted-foreground">
            Carefully crafted border radius values that create a modern, friendly appearance
            while maintaining professional aesthetics.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Radius Scale</CardTitle>
            <CardDescription>
              From sharp edges to fully rounded, these values cover all interface needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(radiusSystem).map(([name, value]) => (
                <RadiusDemo key={name} name={name} value={value} />
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Usage Guidelines</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• <code>lg (8px)</code> is our default border radius</p>
                <p>• Use <code>sm (4px)</code> for small elements like badges</p>
                <p>• Use <code>xl (12px)</code> and above for prominent cards</p>
                <p>• Use <code>full</code> for circular elements and pills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Shadows & Elevation */}
      <section id="shadows" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Shadows & Elevation</h2>
          <p className="text-lg text-muted-foreground">
            Subtle shadows that create depth and hierarchy without overwhelming the interface.
            Designed for both light and dark themes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shadow Scale</CardTitle>
            <CardDescription>
              Progressive elevation system from subtle to prominent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(shadowSystem).map(([name, shadow]) => (
                <ShadowDemo key={name} name={name} shadow={shadow} />
              ))}
            </div>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Elevation Hierarchy</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• <code>sm</code>: Buttons, small cards</p>
                <p>• <code>md</code>: Default cards, form elements</p>
                <p>• <code>lg</code>: Navigation, prominent cards</p>
                <p>• <code>xl</code>: Dropdowns, popovers</p>
                <p>• <code>2xl</code>: Modals, overlays</p>
                <p>• <code>inner</code>: Input fields, wells</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Animations & Transitions */}
      <section id="animations" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Animations & Transitions</h2>
          <p className="text-lg text-muted-foreground">
            Smooth, purposeful motion that enhances user experience without distraction.
            Respects user preferences for reduced motion.
          </p>
        </div>

        <Tabs defaultValue="animations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="transitions">Transitions</TabsTrigger>
          </TabsList>

          <TabsContent value="animations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Animation Presets</CardTitle>
                <CardDescription>
                  Pre-built animations for common interface patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(animationSystem).map(([name, animation]) => (
                    <AnimationDemo key={name} name={name} animation={animation} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transition Timing</CardTitle>
                <CardDescription>
                  Consistent timing values for smooth state changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(transitionSystem).map(([name, transition]) => (
                    <div key={name} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {name}
                        </code>
                        <div className="text-xs text-muted-foreground">
                          {transition.duration}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {transition.usage}
                      </p>
                      {'timing' in transition && (
                        <div className="text-xs text-muted-foreground">
                          Timing: {transition.timing}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Motion Principles</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Use ease-out timing for most interactions</p>
                    <p>• Keep animations under 500ms for responsiveness</p>
                    <p>• Respect <code>prefers-reduced-motion</code> settings</p>
                    <p>• Use faster transitions (75-150ms) for immediate feedback</p>
                    <p>• Use slower transitions (300-500ms) for complex state changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}