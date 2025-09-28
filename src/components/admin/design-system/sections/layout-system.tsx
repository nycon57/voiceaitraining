"use client"

import { useState } from "react"
import { Copy, Check, Monitor, Smartphone, Tablet, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const breakpoints = {
  sm: { px: "640px", usage: "Small devices (phones in landscape)", icon: Smartphone },
  md: { px: "768px", usage: "Medium devices (tablets)", icon: Tablet },
  lg: { px: "1024px", usage: "Large devices (laptops)", icon: Laptop },
  xl: { px: "1280px", usage: "Extra large devices (desktops)", icon: Monitor },
  "2xl": { px: "1536px", usage: "2X large devices (large desktops)", icon: Monitor }
}

const containerSizes = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px"
}

const gridTemplates = [
  {
    name: "Two Column",
    classes: "grid grid-cols-1 md:grid-cols-2 gap-6",
    usage: "Side-by-side content, forms with preview"
  },
  {
    name: "Three Column",
    classes: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    usage: "Card grids, feature showcases"
  },
  {
    name: "Four Column",
    classes: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
    usage: "Statistics, small cards, metrics"
  },
  {
    name: "Sidebar Layout",
    classes: "grid grid-cols-1 lg:grid-cols-4 gap-6",
    usage: "Main content with sidebar"
  },
  {
    name: "Dashboard Grid",
    classes: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    usage: "Dashboard widgets and metrics"
  }
]

const pageTemplates = [
  {
    name: "Landing Page",
    structure: ["Hero Section", "Features Grid", "Testimonials", "CTA Section", "Footer"],
    usage: "Marketing pages, product showcases"
  },
  {
    name: "Dashboard",
    structure: ["Header", "Sidebar", "Main Content", "Widget Grid"],
    usage: "Application dashboards, analytics views"
  },
  {
    name: "Content Page",
    structure: ["Header", "Breadcrumbs", "Title Section", "Content Body", "Related Content"],
    usage: "Documentation, blog posts, detailed views"
  },
  {
    name: "Form Page",
    structure: ["Header", "Form Container", "Input Groups", "Actions", "Help Text"],
    usage: "Data entry, settings, user onboarding"
  }
]

function BreakpointDemo({ name, breakpoint }: { name: string, breakpoint: any }) {
  const [copied, setCopied] = useState(false)
  const Icon = breakpoint.icon

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm">{breakpoint.px}</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyValue(breakpoint.px)}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{breakpoint.usage}</p>
        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
          <code className="text-sm">
            {name === "sm" ? "@media (min-width: " + breakpoint.px + ")" :
             name + ":" + breakpoint.px}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}

function GridDemo({ template }: { template: any }) {
  const [copied, setCopied] = useState(false)

  const copyValue = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getGridItems = () => {
    const itemCount = template.classes.includes("grid-cols-4") ? 4 :
                     template.classes.includes("grid-cols-3") ? 3 :
                     template.classes.includes("grid-cols-2") ? 2 : 6

    return Array.from({ length: itemCount }, (_, i) => (
      <div key={i} className="bg-primary/10 border border-primary/20 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
        <span className="text-sm font-medium text-primary">Item {i + 1}</span>
      </div>
    ))
  }

  return (
    <Card className="group relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.usage}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyValue(template.classes)}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Grid Demo */}
        <div className={template.classes}>
          {getGridItems()}
        </div>

        {/* Code */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <code className="text-sm break-all">{template.classes}</code>
        </div>
      </CardContent>
    </Card>
  )
}

function ContainerDemo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Container Behavior</CardTitle>
          <CardDescription>
            Responsive container that adapts to screen size with maximum widths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <div className="container bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Container Example</h3>
                <p className="text-sm text-muted-foreground">
                  This container automatically adjusts its width based on screen size
                </p>
                <div className="text-xs text-muted-foreground">
                  Current max-width varies by breakpoint
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Container Sizes</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(containerSizes).map(([breakpoint, size]) => (
                  <div key={breakpoint} className="flex justify-between">
                    <span className="text-muted-foreground">{breakpoint}+</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{size}</code>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Centers content horizontally</p>
                <p>• Adds responsive padding</p>
                <p>• Prevents content from being too wide</p>
                <p>• Maintains readability on large screens</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <code className="text-sm">
              {`<div className="container mx-auto px-4">
  <!-- Your content here -->
</div>`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PageTemplateDemo({ template }: { template: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.usage}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Structure */}
        <div className="border border-border rounded-lg p-4 bg-card">
          <div className="space-y-2">
            {template.structure.map((section: string, index: number) => (
              <div
                key={section}
                className={cn(
                  "rounded-md p-3 text-sm font-medium text-center",
                  index === 0 ? "bg-primary/20 text-primary" :
                  index === 1 ? "bg-secondary/20 text-secondary-foreground" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {section}
              </div>
            ))}
          </div>
        </div>

        {/* Structure List */}
        <div>
          <h4 className="font-semibold mb-2">Structure Components</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {template.structure.map((section: string) => (
              <li key={section}>• {section}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export function LayoutSystemSection() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Layout System</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          A comprehensive layout system built on CSS Grid and Flexbox, providing consistent
          structure and responsive behavior across all screen sizes and devices.
        </p>
      </div>

      {/* Grid System */}
      <section id="grid" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Grid System</h2>
          <p className="text-lg text-muted-foreground">
            Flexible grid layouts that adapt seamlessly from mobile to desktop,
            built with CSS Grid for maximum control and responsiveness.
          </p>
        </div>

        <div className="space-y-8">
          {gridTemplates.map((template) => (
            <GridDemo key={template.name} template={template} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grid Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Do</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use consistent gap spacing (4, 6, 8px)</li>
                  <li>• Start with mobile-first grid layouts</li>
                  <li>• Consider content hierarchy in grid placement</li>
                  <li>• Use semantic HTML structure within grids</li>
                  <li>• Test layouts at all breakpoints</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">✗ Don't</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Create too many columns on mobile</li>
                  <li>• Use fixed heights that break content</li>
                  <li>• Ignore content overflow in grid items</li>
                  <li>• Make grids too complex for the content</li>
                  <li>• Forget about keyboard navigation order</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Containers */}
      <section id="containers" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Containers</h2>
          <p className="text-lg text-muted-foreground">
            Content containers that provide consistent maximum widths and
            horizontal centering across different screen sizes.
          </p>
        </div>

        <ContainerDemo />
      </section>

      <Separator />

      {/* Responsive Breakpoints */}
      <section id="breakpoints" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Responsive Breakpoints</h2>
          <p className="text-lg text-muted-foreground">
            Mobile-first breakpoint system that ensures consistent behavior
            across all device types and screen orientations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(breakpoints).map(([name, breakpoint]) => (
            <BreakpointDemo key={name} name={name} breakpoint={breakpoint} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Breakpoint Strategy</CardTitle>
            <CardDescription>
              How to effectively use breakpoints for responsive design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Mobile First</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Start with mobile styles, then enhance for larger screens
                  </p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm">
                      {`/* Mobile first approach */
.element {
  width: 100%; /* Mobile */
}

@media (min-width: 768px) {
  .element {
    width: 50%; /* Tablet+ */
  }
}

@media (min-width: 1024px) {
  .element {
    width: 33.333%; /* Desktop+ */
  }
}`}
                    </code>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tailwind Classes</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use responsive prefixes for different breakpoints
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Default (mobile)</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">w-full</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Small+</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">sm:w-1/2</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium+</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">md:w-1/3</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Large+</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">lg:w-1/4</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Testing Responsive Layouts
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Test at actual device sizes, not just browser resize</li>
                  <li>• Consider touch targets (minimum 44px) for mobile</li>
                  <li>• Verify text remains readable at all sizes</li>
                  <li>• Check horizontal scrolling doesn't occur unexpectedly</li>
                  <li>• Test both portrait and landscape orientations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Page Templates */}
      <section id="templates" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Page Templates</h2>
          <p className="text-lg text-muted-foreground">
            Common page layouts and structures that provide consistency
            across different types of content and functionality.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pageTemplates.map((template) => (
            <PageTemplateDemo key={template.name} template={template} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Layout Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="font-semibold mb-3">Hierarchy</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Primary navigation at the top</li>
                    <li>• Main content in the center</li>
                    <li>• Secondary content in sidebars</li>
                    <li>• Footer at the bottom</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Spacing</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Consistent section padding</li>
                    <li>• Adequate whitespace between elements</li>
                    <li>• Visual breathing room</li>
                    <li>• Logical content grouping</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Accessibility</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Logical reading order</li>
                    <li>• Skip links for navigation</li>
                    <li>• Landmark roles for sections</li>
                    <li>• Focus management</li>
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