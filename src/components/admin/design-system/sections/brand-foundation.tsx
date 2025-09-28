"use client"

import { useState } from "react"
import { Copy, Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Design tokens matching our actual SpeakStride brand gradient system
const designTokens = {
  colors: {
    // Brand gradient system - derived from #9259ED → #CF54EE → #FB8684
    brand: {
      purple: {
        50: { hex: "#faf7ff", name: "Purple 50", usage: "Lightest purple tint for backgrounds" },
        100: { hex: "#f2ecff", name: "Purple 100", usage: "Very light purple for subtle highlights" },
        200: { hex: "#e1d0ff", name: "Purple 200", usage: "Light purple for hover states" },
        300: { hex: "#c8a8ff", name: "Purple 300", usage: "Medium light purple for accents" },
        400: { hex: "#a577ff", name: "Purple 400", usage: "Medium purple for secondary actions" },
        500: { hex: "#9259ED", name: "Purple 500", usage: "Primary brand purple - main gradient start" },
        600: { hex: "#7c4bd9", name: "Purple 600", usage: "Darker purple for active states" },
        700: { hex: "#6a3dc2", name: "Purple 700", usage: "Dark purple for emphasis" },
        800: { hex: "#5831a1", name: "Purple 800", usage: "Very dark purple for contrast" },
        900: { hex: "#462681", name: "Purple 900", usage: "Darkest purple for text on light" }
      },
      magenta: {
        50: { hex: "#fef7fe", name: "Magenta 50", usage: "Lightest magenta tint" },
        100: { hex: "#fdeef8", name: "Magenta 100", usage: "Very light magenta" },
        200: { hex: "#faddf0", name: "Magenta 200", usage: "Light magenta for hover" },
        300: { hex: "#f4bce3", name: "Magenta 300", usage: "Medium light magenta" },
        400: { hex: "#ed8dd1", name: "Magenta 400", usage: "Medium magenta" },
        500: { hex: "#CF54EE", name: "Magenta 500", usage: "Primary brand magenta - gradient center" },
        600: { hex: "#b845d4", name: "Magenta 600", usage: "Darker magenta for active" },
        700: { hex: "#9e38b8", name: "Magenta 700", usage: "Dark magenta for emphasis" },
        800: { hex: "#822f96", name: "Magenta 800", usage: "Very dark magenta" },
        900: { hex: "#682879", name: "Magenta 900", usage: "Darkest magenta" }
      },
      coral: {
        50: { hex: "#fff9f9", name: "Coral 50", usage: "Lightest coral tint" },
        100: { hex: "#fef2f2", name: "Coral 100", usage: "Very light coral" },
        200: { hex: "#fee5e5", name: "Coral 200", usage: "Light coral for backgrounds" },
        300: { hex: "#fcc8c8", name: "Coral 300", usage: "Medium light coral" },
        400: { hex: "#fba5a5", name: "Coral 400", usage: "Medium coral" },
        500: { hex: "#FB8684", name: "Coral 500", usage: "Primary brand coral - gradient end" },
        600: { hex: "#f56565", name: "Coral 600", usage: "Darker coral for active" },
        700: { hex: "#e53e3e", name: "Coral 700", usage: "Dark coral for emphasis" },
        800: { hex: "#c53030", name: "Coral 800", usage: "Very dark coral" },
        900: { hex: "#9c2626", name: "Coral 900", usage: "Darkest coral" }
      }
    },
    semantic: {
      primary: {
        value: "var(--chart-1)",
        hex: "#9259ED",
        name: "Primary",
        usage: "Main brand color, primary actions, links - brand purple",
        cssVar: "--primary"
      },
      secondary: {
        value: "var(--chart-2)",
        hex: "#CF54EE",
        name: "Secondary",
        usage: "Secondary actions, accents - brand magenta",
        cssVar: "--secondary"
      },
      gradient: {
        value: "linear-gradient(to right, #9259ED, #CF54EE, #FB8684)",
        hex: "#9259ED → #CF54EE → #FB8684",
        name: "Brand Gradient",
        usage: "Headlines, accent text, hero elements, brand emphasis",
        cssVar: ".text-gradient"
      },
      background: {
        value: "oklch(0.87 0.02 320)",
        hex: "#fafaff",
        name: "Background",
        usage: "Main page background",
        cssVar: "--background"
      },
      foreground: {
        value: "oklch(0.05 0.02 290)",
        hex: "#0c0a1a",
        name: "Foreground",
        usage: "Primary text color",
        cssVar: "--foreground"
      },
      card: {
        value: "oklch(0.95 0.01 320)",
        hex: "#fbfbff",
        name: "Card",
        usage: "Card backgrounds, elevated surfaces",
        cssVar: "--card"
      },
      muted: {
        value: "oklch(0.15 0.03 50 / 0.08)",
        hex: "rgba(146, 89, 237, 0.08)",
        name: "Muted",
        usage: "Subtle backgrounds, disabled states - purple tint",
        cssVar: "--muted"
      },
      accent: {
        value: "oklch(0.97 0.01 285)",
        hex: "#faf7ff",
        name: "Accent",
        usage: "Hover states, focus rings - purple-50 tint",
        cssVar: "--accent"
      },
      border: {
        value: "oklch(0.90 0.02 285)",
        hex: "#e1d0ff",
        name: "Border",
        usage: "Component borders, dividers - purple-200 tint",
        cssVar: "--border"
      }
    },
    // Gradient variations
    gradients: {
      primary: {
        value: "linear-gradient(135deg, #9259ED 0%, #CF54EE 50%, #FB8684 100%)",
        name: "Primary Gradient",
        usage: "Main brand gradient - diagonal"
      },
      subtle: {
        value: "linear-gradient(135deg, rgba(146, 89, 237, 0.1) 0%, rgba(207, 84, 238, 0.1) 50%, rgba(251, 134, 132, 0.1) 100%)",
        name: "Subtle Gradient",
        usage: "Background overlays, subtle emphasis"
      },
      text: {
        value: "linear-gradient(90deg, #9259ED 0%, #CF54EE 50%, #FB8684 100%)",
        name: "Text Gradient",
        usage: "Gradient text effects, headlines"
      },
      border: {
        value: "linear-gradient(90deg, rgba(146, 89, 237, 0.3) 0%, rgba(207, 84, 238, 0.3) 50%, rgba(251, 134, 132, 0.3) 100%)",
        name: "Border Gradient",
        usage: "Gradient borders, dividers"
      }
    },
    status: {
      success: {
        value: "oklch(0.65 0.15 160)",
        hex: "#22c55e",
        name: "Success",
        usage: "Success states, confirmations, positive feedback",
        cssVar: "custom"
      },
      warning: {
        value: "oklch(0.75 0.15 70)",
        hex: "#f59e0b",
        name: "Warning",
        usage: "Warning states, cautions, important notices",
        cssVar: "custom"
      },
      error: {
        value: "oklch(0.604 0.191 22.216)",
        hex: "#ef4444",
        name: "Error",
        usage: "Error states, destructive actions, validation failures",
        cssVar: "--destructive"
      },
      info: {
        value: "oklch(0.6 0.2 240)",
        hex: "#3b82f6",
        name: "Info",
        usage: "Information, neutral alerts, tips",
        cssVar: "custom"
      }
    },
    charts: {
      chart1: {
        value: "oklch(0.58 0.2 285)",
        hex: "#9259ED",
        name: "Chart 1 (Purple)",
        usage: "Primary gradient color - brand purple",
        cssVar: "--chart-1"
      },
      chart2: {
        value: "oklch(0.65 0.25 320)",
        hex: "#CF54EE",
        name: "Chart 2 (Magenta)",
        usage: "Secondary gradient color - brand magenta",
        cssVar: "--chart-2"
      },
      chart3: {
        value: "oklch(0.72 0.15 25)",
        hex: "#FB8684",
        name: "Chart 3 (Coral)",
        usage: "Tertiary gradient color - brand coral",
        cssVar: "--chart-3"
      },
      chart4: {
        value: "oklch(0.5 0.15 240)",
        hex: "#3b82f6",
        name: "Chart 4",
        usage: "Quaternary data visualization color",
        cssVar: "--chart-4"
      },
      chart5: {
        value: "oklch(0.5 0.15 240)",
        hex: "#06b6d4",
        name: "Chart 5",
        usage: "Fifth data visualization color",
        cssVar: "--chart-5"
      }
    }
  }
}

const typography = {
  display: {
    "4xl": { size: "72px", lineHeight: "80px", weight: "700", usage: "Hero headlines" },
    "3xl": { size: "60px", lineHeight: "68px", weight: "700", usage: "Page titles" },
    "2xl": { size: "48px", lineHeight: "56px", weight: "600", usage: "Section headers" },
    "xl": { size: "36px", lineHeight: "44px", weight: "600", usage: "Card titles" }
  },
  heading: {
    "lg": { size: "30px", lineHeight: "38px", weight: "600", usage: "Large headings" },
    "md": { size: "24px", lineHeight: "32px", weight: "600", usage: "Medium headings" },
    "sm": { size: "20px", lineHeight: "28px", weight: "600", usage: "Small headings" },
    "xs": { size: "16px", lineHeight: "24px", weight: "600", usage: "Tiny headings" }
  },
  body: {
    "lg": { size: "18px", lineHeight: "28px", weight: "400", usage: "Large body text" },
    "md": { size: "16px", lineHeight: "24px", weight: "400", usage: "Default body text" },
    "sm": { size: "14px", lineHeight: "20px", weight: "400", usage: "Small text" },
    "xs": { size: "12px", lineHeight: "16px", weight: "400", usage: "Captions, labels" }
  }
}

function ColorSwatch({ color, showCode = false }: {
  color: {
    value?: string;
    hex: string;
    name: string;
    usage: string;
    cssVar?: string;
    note?: string;
  },
  showCode?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [copyFormat, setCopyFormat] = useState<'hex' | 'oklch' | 'css'>('hex')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getValueToCopy = () => {
    switch (copyFormat) {
      case 'hex':
        return color.hex
      case 'oklch':
        return color.value || color.hex
      case 'css':
        return color.cssVar?.startsWith('--') ? `hsl(var(${color.cssVar}))` : color.hex
      default:
        return color.hex
    }
  }

  return (
    <div className="group relative">
      <div
        className="h-24 rounded-xl shadow-sm border border-border cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] relative overflow-hidden"
        style={{
          background: color.value?.includes('gradient') ? color.value : color.hex
        }}
        onClick={() => copyToClipboard(getValueToCopy())}
      >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        {/* Copy indicator */}
        <div className={cn(
          "absolute top-2 right-2 p-1.5 rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-200",
          copied ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
        )}>
          {copied ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3 text-white" />}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">{color.name}</h4>
          {color.cssVar?.startsWith('--') && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              CSS Var
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{color.usage}</p>

        {color.note && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <span className="text-xs text-yellow-800 leading-relaxed">{color.note}</span>
          </div>
        )}

        {showCode && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {['hex', 'oklch', 'css'].map((format) => (
                <Button
                  key={format}
                  variant={copyFormat === format ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCopyFormat(format as 'hex' | 'oklch' | 'css')
                  }}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
            <code className="block text-xs font-mono bg-muted/80 px-3 py-2 rounded-lg border">
              {getValueToCopy()}
            </code>
          </div>
        )}
      </div>
    </div>
  )
}

function TypographyExample({ category, styles }: { category: string, styles: Record<string, any> }) {
  const isHeadlineCategory = category === 'display' || category === 'heading'

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold capitalize">{category}</h3>
      <div className="space-y-4">
        {Object.entries(styles).map(([size, style]) => (
          <div key={size} className="grid grid-cols-2 gap-6 items-center">
            <div>
              <p
                className={`mb-2 ${isHeadlineCategory ? 'font-headline' : 'font-sans'}`}
                style={{
                  fontSize: style.size,
                  lineHeight: style.lineHeight,
                  fontWeight: style.weight
                }}
              >
                {isHeadlineCategory ? 'SpeakStride Excellence' : 'The quick brown fox'}
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>{category} {size}:</strong> {style.usage}</p>
                <p>Size: {style.size} • Line: {style.lineHeight} • Weight: {style.weight}</p>
                <p><strong>Font:</strong> {isHeadlineCategory ? 'Space Grotesk' : 'Inter'}</p>
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <code className="text-sm">
                font-family: {isHeadlineCategory ? "'Space Grotesk', sans-serif" : "'Inter', sans-serif"};<br />
                font-size: {style.size};<br />
                line-height: {style.lineHeight};<br />
                font-weight: {style.weight};
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BrandFoundationSection() {
  const [showColorCodes, setShowColorCodes] = useState(false)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Brand Foundation</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          SpeakStride's brand foundation establishes our visual identity through carefully crafted colors,
          typography, and design principles that reflect innovation, trust, and professional excellence.
        </p>
      </div>

      {/* Color Palette */}
      <section id="colors" className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Color Palette</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorCodes(!showColorCodes)}
              className="gap-2"
            >
              {showColorCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showColorCodes ? "Hide" : "Show"} Codes
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">
            Our color system is built on accessibility and emotional resonance, using
            the OKLCH color space for perceptual uniformity and vibrant consistency.
          </p>
        </div>

        <Tabs defaultValue="brand" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 h-12">
            <TabsTrigger value="brand" className="text-sm font-medium">Brand Colors</TabsTrigger>
            <TabsTrigger value="gradients" className="text-sm font-medium">Gradients</TabsTrigger>
            <TabsTrigger value="semantic" className="text-sm font-medium">Semantic</TabsTrigger>
            <TabsTrigger value="status" className="text-sm font-medium">Status</TabsTrigger>
            <TabsTrigger value="themes" className="text-sm font-medium">Themes</TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="space-y-6">
            {/* Purple Scale */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💜 Purple Scale
                </CardTitle>
                <CardDescription>
                  Primary brand purple derived from #9259ED. Complete scale from light tints to deep shades.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                  {Object.entries(designTokens.colors.brand.purple).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} showCode={showColorCodes} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Magenta Scale */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎀 Magenta Scale
                </CardTitle>
                <CardDescription>
                  Secondary brand magenta derived from #CF54EE. Center point of the brand gradient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                  {Object.entries(designTokens.colors.brand.magenta).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} showCode={showColorCodes} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Coral Scale */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🪸 Coral Scale
                </CardTitle>
                <CardDescription>
                  Tertiary brand coral derived from #FB8684. Warm endpoint of the brand gradient.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                  {Object.entries(designTokens.colors.brand.coral).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} showCode={showColorCodes} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gradients" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌈 Brand Gradients
                </CardTitle>
                <CardDescription>
                  Complete gradient system derived from the SpeakStride brand colors.
                  Use these for backgrounds, text effects, and brand emphasis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(designTokens.colors.gradients).map(([key, gradient]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{gradient.name}</h4>
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          Gradient
                        </Badge>
                      </div>
                      <div
                        className="h-16 rounded-xl border cursor-pointer transition-all hover:shadow-lg"
                        style={{ background: gradient.value }}
                        onClick={() => navigator.clipboard.writeText(gradient.value)}
                      />
                      <p className="text-xs text-muted-foreground">{gradient.usage}</p>
                      {showColorCodes && (
                        <code className="block text-xs font-mono bg-muted/80 px-3 py-2 rounded-lg border">
                          background: {gradient.value};
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semantic" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Semantic Colors
                </CardTitle>
                <CardDescription>
                  Core semantic colors that power the interface. These are mapped to CSS custom properties
                  and automatically adapt to light/dark themes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.entries(designTokens.colors.semantic).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} showCode={showColorCodes} />
                  ))}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚦 Status Colors
                </CardTitle>
                <CardDescription>
                  Meaningful colors that communicate state, feedback, and user actions.
                  Essential for user experience and accessibility compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {Object.entries(designTokens.colors.status).map(([key, color]) => (
                    <ColorSwatch key={key} color={color} showCode={showColorCodes} />
                  ))}
                </div>

                {/* Status Examples */}
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Example Components</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm text-green-800">Success message</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm text-yellow-800">Warning notice</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm text-red-800">Error alert</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-blue-800">Info notification</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Accessibility</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• All status colors meet WCAG 2.1 AA contrast ratios</p>
                      <p>• Colors work for colorblind users</p>
                      <p>• Semantic meaning reinforced by icons and text</p>
                      <p>• Consistent usage across all components</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌓 Dark Mode Support
                </CardTitle>
                <CardDescription>
                  Our color system automatically adapts to dark mode using CSS custom properties.
                  Experience consistent branding across all themes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Theme Preview */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Light Mode */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Light Mode</h4>
                      <div className="p-4 bg-white border rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary" />
                          <div className="space-y-1">
                            <div className="h-2 w-20 bg-gray-900 rounded" />
                            <div className="h-2 w-16 bg-gray-500 rounded" />
                          </div>
                        </div>
                        <div className="h-px bg-gray-200" />
                        <div className="flex gap-2">
                          <div className="w-12 h-6 bg-primary rounded" />
                          <div className="w-12 h-6 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>

                    {/* Dark Mode */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Dark Mode</h4>
                      <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white" />
                          <div className="space-y-1">
                            <div className="h-2 w-20 bg-white rounded" />
                            <div className="h-2 w-16 bg-gray-400 rounded" />
                          </div>
                        </div>
                        <div className="h-px bg-gray-700" />
                        <div className="flex gap-2">
                          <div className="w-12 h-6 bg-white rounded" />
                          <div className="w-12 h-6 bg-gray-700 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Guide */}
                  <div className="bg-muted/50 p-6 rounded-xl border">
                    <h4 className="font-semibold mb-3">Implementation</h4>
                    <code className="text-sm bg-background p-3 rounded-lg border block">
                      {`/* Use CSS custom properties for automatic theme switching */
.component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}`}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* Typography */}
      <section id="typography" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Typography</h2>
          <p className="text-lg text-muted-foreground">
            Our typography system uses Space Grotesk for headlines and Inter for body text,
            providing excellent readability and modern aesthetics across all platforms and sizes.
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Font Stack</CardTitle>
              <CardDescription>
                Dual typeface system optimized for hierarchy and readability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Headlines & Display</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <code className="text-sm">
                    font-family: 'Space Grotesk', system-ui, sans-serif;
                  </code>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Primary:</strong> Space Grotesk - Modern, geometric, brand voice
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Usage:</strong> Headlines, hero text, blockquotes, brand elements
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Class:</strong> <code className="text-xs bg-muted px-1 rounded">font-headline</code>
                  </p>
                </div>

                {/* Space Grotesk Example */}
                <div className="mt-4 p-4 bg-gradient-to-r from-background to-accent/20 rounded-lg border">
                  <h3 className="font-headline text-2xl font-bold text-gradient mb-2">
                    SpeakStride Training
                  </h3>
                  <blockquote className="font-headline text-lg font-medium text-muted-foreground border-l-4 border-primary pl-4">
                    "Revolutionizing sales training through AI-powered voice simulation."
                  </blockquote>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Body & Interface</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <code className="text-sm">
                    font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
                  </code>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Primary:</strong> Inter - Optimized for screens, excellent legibility
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Usage:</strong> Body text, navigation, buttons, form labels
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Class:</strong> <code className="text-xs bg-muted px-1 rounded">font-sans</code> (default)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {Object.entries(typography).map(([category, styles]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Styles</CardTitle>
                  <CardDescription>
                    {category === 'display' && 'Space Grotesk for maximum brand impact and readability'}
                    {category === 'heading' && 'Space Grotesk for consistent hierarchy'}
                    {category === 'body' && 'Inter for optimal reading experience'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TypographyExample category={category} styles={styles} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Logo & Branding */}
      <section id="logo" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Logo & Branding</h2>
          <p className="text-lg text-muted-foreground">
            The SpeakStride logo combines typography with our brand gradient to create a memorable and distinctive identity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Primary Logo</CardTitle>
              <CardDescription>Main brand mark with gradient treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 bg-gradient-to-br from-background to-muted rounded-lg border">
                <div className="font-headline text-xl font-semibold tracking-tight">
                  <span className="text-foreground">Speak</span>
                  <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-medium">Stride</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <code className="block text-xs bg-muted p-2 rounded">
                  &lt;span&gt;Speak&lt;/span&gt;&lt;span className="text-gradient"&gt;Stride&lt;/span&gt;
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo Variations</CardTitle>
              <CardDescription>Different sizes and contexts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Large */}
                <div className="font-headline text-2xl font-semibold tracking-tight">
                  <span className="text-foreground">Speak</span>
                  <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-medium">Stride</span>
                </div>
                {/* Medium */}
                <div className="font-headline text-lg font-semibold tracking-tight">
                  <span className="text-foreground">Speak</span>
                  <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-medium">Stride</span>
                </div>
                {/* Small */}
                <div className="font-headline text-sm font-semibold tracking-tight">
                  <span className="text-foreground">Speak</span>
                  <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent font-medium">Stride</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logo Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold">Typography Details</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Font:</strong> Space Grotesk (headlines)</li>
                  <li>• <strong>Weight:</strong> Semibold (600)</li>
                  <li>• <strong>Tracking:</strong> Tight (-0.025em)</li>
                  <li>• <strong>"Speak":</strong> Standard foreground color</li>
                  <li>• <strong>"Stride":</strong> Gradient from purple to indigo</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">CSS Implementation</h4>
                <code className="block text-xs bg-muted p-3 rounded-lg border">
                  <div>.logo &#123;</div>
                  <div>&nbsp;&nbsp;font-family: 'Space Grotesk', sans-serif;</div>
                  <div>&nbsp;&nbsp;font-weight: 600;</div>
                  <div>&nbsp;&nbsp;letter-spacing: -0.025em;</div>
                  <div>&#125;</div>
                  <br />
                  <div>.logo-gradient &#123;</div>
                  <div>&nbsp;&nbsp;background: linear-gradient(to right, #9333ea, #8b5cf6, #6366f1);</div>
                  <div>&nbsp;&nbsp;-webkit-background-clip: text;</div>
                  <div>&nbsp;&nbsp;color: transparent;</div>
                  <div>&#125;</div>
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Best Practices</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use Space Grotesk font for brand consistency</li>
                  <li>• Maintain proper contrast on all backgrounds</li>
                  <li>• Keep gradient treatment on "Stride" portion</li>
                  <li>• Scale proportionally, never stretch</li>
                  <li>• Ensure minimum size of 14px for readability</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">✗ Avoid</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Using different fonts or weights</li>
                  <li>• Changing the gradient colors</li>
                  <li>• Applying gradient to entire logo</li>
                  <li>• Adding outlines, shadows, or effects</li>
                  <li>• Using on backgrounds that reduce contrast</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Brand Voice */}
      <section id="voice" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Brand Voice & Personality</h2>
          <p className="text-lg text-muted-foreground">
            Our communication principles that guide how we speak to our users across all touchpoints.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We maintain expertise and credibility while being approachable.
                Clear, confident communication that builds trust.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Innovative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Forward-thinking and cutting-edge, showcasing our AI technology
                without being overly technical or intimidating.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤝 Supportive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Encouraging and empowering, helping sales teams grow and succeed.
                We're partners in their journey to excellence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Clear
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simple, jargon-free communication that anyone can understand.
                We make complex AI concepts accessible.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Results-Focused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Emphasizing outcomes and measurable improvements.
                We speak to the value we deliver.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💡 Insightful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sharing knowledge and best practices that help users
                understand and improve their sales performance.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tone Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Writing Style</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use active voice</li>
                    <li>• Write in second person ("you")</li>
                    <li>• Keep sentences concise</li>
                    <li>• Use action-oriented language</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Vocabulary</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Training (not learning)</li>
                    <li>• Performance (not results)</li>
                    <li>• Scenario (not simulation)</li>
                    <li>• Insights (not analytics)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}