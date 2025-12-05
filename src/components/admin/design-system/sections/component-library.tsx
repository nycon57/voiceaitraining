"use client"

import { useState } from "react"
import { Copy, Check, Eye, Code2, ExternalLink, ChevronDown, ChevronRight, Info, Play, Plus, Settings, User, Calendar as CalendarIcon, Search, MoreHorizontal, Mail, Phone, Home, Star, Heart, Zap } from "lucide-react"

// Import all enhanced UI components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

const componentCategories = {
  brand: {
    title: "Brand Components",
    description: "Premium branded variants with gradient styling for featured content",
    components: ["Gradient Button", "Featured Card", "Brand Badge", "Component Combinations"]
  },
  buttons: {
    title: "Buttons & Actions",
    description: "Interactive elements for user actions and navigation",
    components: ["Button", "Toggle", "Toggle Group", "Loading Spinner"]
  },
  forms: {
    title: "Forms & Inputs",
    description: "Data collection and input components with validation",
    components: ["Input", "Textarea", "Select", "Checkbox", "Radio Group", "Switch", "Slider", "Calendar", "Form", "Label"]
  },
  layout: {
    title: "Layout & Structure",
    description: "Structural components for organizing content",
    components: ["Card", "Separator", "Accordion", "Collapsible", "Aspect Ratio", "Resizable", "Scroll Area"]
  },
  navigation: {
    title: "Navigation",
    description: "Navigation and menu components for site structure",
    components: ["Tabs", "Breadcrumb", "Navigation Menu", "Menubar", "Command", "Pagination"]
  },
  overlays: {
    title: "Overlays & Modals",
    description: "Modal and overlay components for interactions",
    components: ["Dialog", "Sheet", "Drawer", "Popover", "Hover Card", "Tooltip", "Dropdown Menu", "Context Menu", "Alert Dialog"]
  },
  data: {
    title: "Data Display",
    description: "Components for displaying and organizing data",
    components: ["Table", "Avatar", "Badge", "Progress", "Skeleton"]
  },
  feedback: {
    title: "Feedback & Status",
    description: "User feedback and status indication components",
    components: ["Alert", "Loading States", "Toast"]
  }
}

function ComponentShowcase({
  title,
  children,
  code,
  usage,
  guidelines,
  animated = false
}: {
  title: string
  children: React.ReactNode
  code: string
  usage: string
  guidelines?: { dos: string[], donts: string[] }
  animated?: boolean
}) {
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={cn("overflow-hidden transition-all duration-300", animated && "hover:shadow-lg")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline">{title}</CardTitle>
            <CardDescription className="mt-1">{usage}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {animated && (
              <Badge variant="secondary" className="text-xs">
                Animated
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="gap-2"
            >
              {showCode ? <Eye className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
              {showCode ? "Preview" : "Code"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {showCode ? (
          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{code}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 gap-2"
                onClick={copyCode}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6 bg-card/50 backdrop-blur-sm">
              {children}
            </div>

            {guidelines && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    ✓ Do
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {guidelines.dos.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    ✗ Don't
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {guidelines.donts.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ButtonExamples() {
  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Button Variants"
        usage="Enhanced button variants with Peakstride styling and animation support"
        code={`<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>`}
        guidelines={{
          dos: [
            "Use prop for better user experience",
            "Use success/warning/info variants for specific contexts",
            "Combine with glass morphism effects",
            "Leverage Peakstride color palette"
          ],
          donts: [
            "Overuse buttons in dense layouts",
            "Mix too many variant colors in one section",
            "Forget to test dark mode combinations",
            "Use destructive variant for non-destructive actions"
          ]
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="muted">Muted</Button>
          <Button variant="gradient">Gradient</Button>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Button Sizes & States"
        usage="Multiple sizes and interactive states with enhanced animations"
        code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">
  <Settings className="h-4 w-4" />
</Button>
<Button disabled>Disabled</Button>
<LoadingSpinner size="sm" />
<Button>
  <LoadingSpinner size="sm" className="mr-2" />
  Loading
</Button>`}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <LoadingSpinner size="sm" />
            <Button>
              <LoadingSpinner size="sm" className="mr-2" />
              Loading
            </Button>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Toggle & Toggle Group"
        usage="Toggle components with enhanced styling and animation"
        code={`<Toggle aria-label="Toggle italic">
  <Star className="h-4 w-4" />
</Toggle>

<ToggleGroup type="multiple">
  <ToggleGroupItem value="bold" aria-label="Toggle bold">
    <Star className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Toggle italic">
    <Heart className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Toggle underline">
    <Zap className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Toggle aria-label="Toggle favorite">
              <Star className="h-4 w-4" />
            </Toggle>
            <Toggle aria-label="Toggle like" variant="outline">
              <Heart className="h-4 w-4" />
            </Toggle>
          </div>

          <ToggleGroup type="multiple">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <Star className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Heart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <Zap className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </ComponentShowcase>
    </div>
  )
}

function FormExamples() {
  const [sliderValue, setSliderValue] = useState([50])
  const [date, setDate] = useState<Date>()

  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Enhanced Input Fields"
        usage="Input components with Peakstride styling and animation support"
        code={`<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="Enter your email"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea
    id="message"
    placeholder="Type your message..."
  />
</div>`}
        guidelines={{
          dos: [
            "Use isHeadline prop for label styling consistency",
            "Enable animations for better UX",
            "Provide clear placeholder text",
            "Use appropriate input types"
          ],
          donts: [
            "Skip label-input associations",
            "Use vague placeholder text",
            "Forget validation states",
            "Make inputs too narrow"
          ]
        }}
      >
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message..." />
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Select & Form Controls"
        usage="Enhanced selection and form control components"
        code={`<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>`}
      >
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label >Select Option</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label >Radio Group</Label>
            <RadioGroup defaultValue="option1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="r1" />
                <Label htmlFor="r1">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="r2" />
                <Label htmlFor="r2">Option 2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option3" id="r3" />
                <Label htmlFor="r3">Option 3</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="notifications" />
            <Label htmlFor="notifications">Enable notifications</Label>
          </div>

          <div className="space-y-2">
            <Label >Volume: {sliderValue[0]}%</Label>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Calendar & Date Selection"
        usage="Enhanced calendar component with Peakstride styling"
        code={`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>`}
      >
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
          />
        </div>
      </ComponentShowcase>
    </div>
  )
}

function LayoutExamples() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Enhanced Cards"
        usage="Card components with glass morphism and enhanced styling"
        code={`<Card>
  <CardHeader>
    <CardTitle isHeadline>Analytics Overview</CardTitle>
    <CardDescription>
      Your training performance at a glance
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm">Scenarios Completed</span>
        <span className="font-medium">24</span>
      </div>
    </div>
  </CardContent>
</Card>`}
        guidelines={{
          dos: [
            "Use prop for hover effects",
            "Use isHeadline for consistent typography",
            "Apply glass morphism sparingly",
            "Maintain proper spacing hierarchy"
          ],
          donts: [
            "Overuse glass effects",
            "Make cards too narrow",
            "Skip semantic structure",
            "Nest cards too deeply"
          ]
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle isHeadline>Analytics Overview</CardTitle>
              <CardDescription>
                Your training performance at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Scenarios Completed</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Score</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Hours Trained</span>
                  <span className="font-medium">12.5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="featured">
            <CardHeader>
              <CardTitle isHeadline>Recent Activity</CardTitle>
              <CardDescription>
                Latest training sessions and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                  <span className="text-sm">Completed "Objection Handling"</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">Started "Cold Calling Basics"</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-amber-500 rounded-full" />
                  <span className="text-sm">Achieved 90% score milestone</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Accordion & Collapsible"
        usage="Expandable content components with smooth animations"
        code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost">Toggle Content</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className="p-4 border rounded">
      Collapsible content goes here
    </div>
  </CollapsibleContent>
</Collapsible>`}
      >
        <div className="space-y-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>How does the training system work?</AccordionTrigger>
              <AccordionContent>
                Our AI-powered training system simulates real sales conversations, providing
                personalized feedback and scoring based on your performance metrics.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I track my progress?</AccordionTrigger>
              <AccordionContent>
                Yes, you can view detailed analytics including completion rates, average scores,
                and improvement trends over time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is the content customizable?</AccordionTrigger>
              <AccordionContent>
                Absolutely. Administrators can create custom scenarios, adjust scoring criteria,
                and tailor content to specific industries or roles.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-4">
                <span>Advanced Settings</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 px-4 pb-4">
              <div className="rounded-md border p-4 space-y-2">
                <Label >API Configuration</Label>
                <Input placeholder="https://api.example.com" />
                <Label >Timeout Settings</Label>
                <Input type="number" placeholder="30" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Separators & Layout"
        usage="Structural components for organizing content with enhanced styling"
        code={`<div className="space-y-4">
  <div>Section 1 Content</div>
  <Separator />
  <div>Section 2 Content</div>
  <Separator orientation="vertical" className="h-8" />
  <div>Section 3 Content</div>
</div>`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded">Section 1 Content</div>
          <Separator />
          <div className="p-4 bg-muted/50 rounded">Section 2 Content</div>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-muted/50 rounded flex-1">Left Content</div>
            <Separator orientation="vertical" className="h-8" />
            <div className="p-4 bg-muted/50 rounded flex-1">Right Content</div>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Scroll Area & Resizable"
        usage="Advanced layout components for content management"
        code={`<ScrollArea className="h-[200px] w-full rounded-md border p-4">
  <div className="space-y-4">
    {Array.from({ length: 50 }).map((_, i) => (
      <div key={i} className="text-sm">
        Item {i + 1}
      </div>
    ))}
  </div>
</ScrollArea>

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={50}>
    <div className="p-6">Panel 1</div>
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={50}>
    <div className="p-6">Panel 2</div>
  </ResizablePanel>
</ResizablePanelGroup>`}
      >
        <div className="space-y-6">
          <div>
            <Label  className="mb-2 block">Scroll Area Example</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="text-sm p-2 border rounded">
                    Training Scenario {i + 1}: Sales Call Simulation
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <Label  className="mb-2 block">Resizable Panels</Label>
            <div className="h-[200px] w-full border rounded">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  <div className="p-6 h-full flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <h4 className="font-medium">Left Panel</h4>
                      <p className="text-sm text-muted-foreground">Drag the handle to resize</p>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  <div className="p-6 h-full flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <h4 className="font-medium">Right Panel</h4>
                      <p className="text-sm text-muted-foreground">Content area</p>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </div>
      </ComponentShowcase>
    </div>
  )
}

function NavigationExamples() {
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Enhanced Tabs"
        usage="Tab navigation with improved styling and animations"
        code={`<Tabs defaultValue="overview">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        Overview content goes here.
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>`}
        guidelines={{
          dos: [
            "Use prop for smooth transitions",
            "Keep tab labels concise and clear",
            "Maintain consistent tab spacing",
            "Use semantic tab order"
          ],
          donts: [
            "Use too many tabs in one group",
            "Make tab content drastically different in height",
            "Skip keyboard navigation support",
            "Use vague tab labels"
          ]
        }}
      >
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle isHeadline>Training Overview</CardTitle>
                <CardDescription>
                  Your current training status and recent activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Scenarios Completed</Label>
                    <div className="text-2xl font-bold">24</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Average Score</Label>
                    <div className="text-2xl font-bold">87%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle isHeadline>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed insights into your training performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress This Week</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Goal</span>
                      <span>60%</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle isHeadline>Training Settings</CardTitle>
                <CardDescription>
                  Customize your training preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Email Notifications</Label>
                  <Switch id="notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminders">Daily Reminders</Label>
                  <Switch id="reminders" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </ComponentShowcase>

      <ComponentShowcase
        title="Breadcrumb Navigation"
        usage="Enhanced breadcrumb component with improved styling"
        code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/training">Training</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Scenarios</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/training">Training</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/scenarios">Scenarios</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sales Call Simulation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ComponentShowcase>

      <ComponentShowcase
        title="Command & Search"
        usage="Enhanced command palette with search functionality"
        code={`<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        <span>Calendar</span>
      </CommandItem>
      <CommandItem>
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}
      >
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setCommandOpen(true)}
            className="w-full justify-start text-left"
          >
            <Search className="mr-2 h-4 w-4" />
            Search commands...
          </Button>

          <div className="border rounded-lg">
            <Command>
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Training">
                  <CommandItem>
                    <Play className="mr-2 h-4 w-4" />
                    <span>Start New Scenario</span>
                  </CommandItem>
                  <CommandItem>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>View Schedule</span>
                  </CommandItem>
                  <CommandItem>
                    <Star className="mr-2 h-4 w-4" />
                    <span>View Progress</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </CommandItem>
                  <CommandItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Pagination"
        usage="Enhanced pagination component with improved styling"
        code={`<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`}
      >
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">8</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </ComponentShowcase>

      <ComponentShowcase
        title="Menubar & Navigation Menu"
        usage="Enhanced menu components with improved interactions"
        code={`<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Scenario</MenubarItem>
      <MenubarItem>Open Training</MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Export Data</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}
      >
        <div className="space-y-4">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New Scenario</MenubarItem>
                <MenubarItem>Open Training</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Export Data</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Training</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Start Session</MenubarItem>
                <MenubarItem>View Progress</MenubarItem>
                <MenubarItem>Settings</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Help</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Documentation</MenubarItem>
                <MenubarItem>Support</MenubarItem>
                <MenubarItem>About</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </ComponentShowcase>
    </div>
  )
}

function OverlayExamples() {
  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Enhanced Dialogs"
        usage="Modal dialogs with improved styling and animations"
        code={`<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to perform this action?
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end space-x-2">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </DialogContent>
</Dialog>`}
        guidelines={{
          dos: [
            "Use isHeadline prop for dialog titles",
            "Enable animations for better UX",
            "Provide clear action buttons",
            "Include descriptive content"
          ],
          donts: [
            "Make dialogs too wide or tall",
            "Skip confirmation for destructive actions",
            "Use vague button labels",
            "Nest dialogs too deeply"
          ]
        }}
      >
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Training Scenario</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "Sales Call Simulation"? This action cannot be undone and will remove all associated data.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">Delete</Button>
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Sheet & Drawer"
        usage="Slide-out panels and drawers with enhanced animations"
        code={`<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here.
      </SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" className="col-span-3" />
      </div>
    </div>
  </SheetContent>
</Sheet>`}
      >
        <div className="flex gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Training Settings</SheetTitle>
                <SheetDescription>
                  Configure your training preferences and notifications.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="notifications" />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Quick Actions</DrawerTitle>
                <DrawerDescription>
                  Choose an action to perform quickly.
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <Button className="w-full">Start New Training</Button>
                <Button className="w-full" variant="outline">View Progress</Button>
                <Button className="w-full" variant="outline">Export Data</Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Popovers & Hover Cards"
        usage="Contextual overlays with enhanced styling"
        code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Training Settings</h4>
        <p className="text-sm text-muted-foreground">
          Configure your training preferences.
        </p>
      </div>
    </div>
  </PopoverContent>
</Popover>`}
      >
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Training Options</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Training Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize your training experience and notifications.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="audio" />
                    <Label htmlFor="audio">Audio feedback</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="visual" />
                    <Label htmlFor="visual">Visual indicators</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="progress" />
                    <Label htmlFor="progress">Progress tracking</Label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">@john_doe</Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">John Doe</h4>
                  <p className="text-sm">Sales Training Specialist</p>
                  <div className="flex items-center pt-2">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    <span className="text-xs text-muted-foreground">
                      Joined December 2023
                    </span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Tooltips & Dropdown Menus"
        usage="Enhanced tooltips and dropdown menus with better animations"
        code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" size="icon">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information about this feature</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
      >
        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View additional training information and tips</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure your training preferences</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Account
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="border rounded p-4">
            <ContextMenu>
              <ContextMenuTrigger className="text-sm">
                Right-click this area
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Copy</ContextMenuItem>
                <ContextMenuItem>Paste</ContextMenuItem>
                <ContextMenuItem>Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </ComponentShowcase>
    </div>
  )
}

function DataExamples() {
  const tableData = [
    { name: "John Doe", role: "Sales Rep", score: "92%", status: "Active", avatar: "JD" },
    { name: "Jane Smith", role: "Manager", score: "88%", status: "Active", avatar: "JS" },
    { name: "Bob Johnson", role: "Sales Rep", score: "76%", status: "Training", avatar: "BJ" },
    { name: "Alice Brown", role: "Senior Rep", score: "94%", status: "Active", avatar: "AB" },
  ]

  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Enhanced Data Table"
        usage="Table component with improved styling and interactions"
        code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Score</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.name}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>{item.role}</TableCell>
        <TableCell>{item.score}</TableCell>
        <TableCell>
          <Badge variant={item.status === "Active" ? "success" : "warning"}>
            {item.status}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
        guidelines={{
          dos: [
            "Use enhanced badge variants for status",
            "Include animations for better UX",
            "Maintain consistent data formatting",
            "Use semantic table structure"
          ],
          donts: [
            "Make tables too wide for mobile",
            "Skip table headers",
            "Use unclear status indicators",
            "Overcrowd table cells"
          ]
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{item.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.role}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell className="font-mono">{item.score}</TableCell>
                <TableCell>
                  <Badge variant={item.status === "Active" ? "success" : "warning"}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ComponentShowcase>

      <ComponentShowcase
        title="Enhanced Avatars & Badges"
        usage="User representation with improved styling and variants"
        code={`<div className="flex items-center space-x-4">
  <Avatar>
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <div>
    <p className="font-medium">John Doe</p>
    <div className="flex gap-2">
      <Badge variant="success">Pro</Badge>
      <Badge variant="info">Manager</Badge>
      <Badge variant="warning">Online</Badge>
    </div>
  </div>
</div>`}
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">John Doe</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="success">Pro</Badge>
                <Badge variant="info">Manager</Badge>
                <Badge variant="secondary">Online</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Badge Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Avatar Sizes</h4>
            <div className="flex items-center gap-4">
              <Avatar size="sm">
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
              <Avatar size="xl">
                <AvatarFallback>XL</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Enhanced Progress Indicators"
        usage="Progress components with improved animations and variants"
        code={`<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Training Progress</span>
    <span>75%</span>
  </div>
  <Progress value={75} variant="success" />
</div>`}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>75%</span>
              </div>
              <Progress value={75} variant="success" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Goal</span>
                <span>60%</span>
              </div>
              <Progress value={60} variant="warning" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scenario Completion</span>
                <span>90%</span>
              </div>
              <Progress value={90} variant="secondary" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span>25%</span>
              </div>
              <Progress value={25} variant="destructive" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Progress Sizes</h4>
            <div className="space-y-3">
              <Progress value={75} size="sm" />
              <Progress value={75} />
              <Progress value={75} size="lg" />
            </div>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Enhanced Loading States"
        usage="Skeleton loaders with improved animations and variants"
        code={`<div className="space-y-4">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-4 w-[150px]" />
</div>

<LoadingSpinner size="lg" />
<LoadingSpinner />`}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-[125px] w-full rounded-lg" />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Loading Spinners</h4>
            <div className="flex items-center gap-6">
              <div className="text-center space-y-2">
                <LoadingSpinner size="sm" />
                <p className="text-xs text-muted-foreground">Small</p>
              </div>
              <div className="text-center space-y-2">
                <LoadingSpinner />
                <p className="text-xs text-muted-foreground">Default</p>
              </div>
              <div className="text-center space-y-2">
                <LoadingSpinner size="lg" />
                <p className="text-xs text-muted-foreground">Large</p>
              </div>
              <div className="text-center space-y-2">
                <LoadingSpinner />
                <p className="text-xs text-muted-foreground">Dots</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentShowcase>
    </div>
  )
}

function BrandExamples() {
  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Gradient Button Variants"
        usage="Branded gradient button for primary CTAs and featured actions"
        code={`<Button variant="gradient" size="sm">
  Small Gradient
</Button>
<Button variant="gradient">
  Start Training
</Button>
<Button variant="gradient" size="lg">
  <Play className="mr-2 h-5 w-5" />
  Large with Icon
</Button>`}
        guidelines={{
          dos: [
            "Use for primary CTAs and hero actions",
            "Apply to key conversion points",
            "Maintain white text for contrast",
            "Limit to 1-2 per screen for impact"
          ],
          donts: [
            "Overuse gradient buttons",
            "Use for secondary actions",
            "Combine with other gradients nearby",
            "Use on busy backgrounds"
          ]
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="gradient" size="sm">
            Small Gradient
          </Button>
          <Button variant="gradient">
            Start Training
          </Button>
          <Button variant="gradient" size="lg">
            <Play className="mr-2 h-5 w-5" />
            Begin Session
          </Button>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Featured Card Variant"
        usage="Premium card design with gradient border for highlighting special content"
        code={`<Card variant="featured">
  <CardHeader>
    <CardTitle isHeadline>Premium Feature</CardTitle>
    <CardDescription>
      This card stands out with a gradient border
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Featured content goes here...</p>
  </CardContent>
</Card>`}
        guidelines={{
          dos: [
            "Highlight premium or featured content",
            "Use for special announcements",
            "Maintain proper spacing and hierarchy",
            "Test in both light and dark modes"
          ],
          donts: [
            "Use for every card on the page",
            "Combine with too many other effects",
            "Make content too dense",
            "Forget to test accessibility"
          ]
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="default">
            <CardHeader>
              <CardTitle isHeadline>Standard Card</CardTitle>
              <CardDescription>
                Regular card design for comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This is a standard card with default styling. Use this for most content areas.
              </p>
            </CardContent>
          </Card>

          <Card variant="featured">
            <CardHeader>
              <CardTitle isHeadline>Featured Training</CardTitle>
              <CardDescription>
                New premium scenario available now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  This featured card draws attention with its gradient border and enhanced shadow.
                </p>
                <Button variant="gradient" size="sm">
                  Start Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Brand Badge Variant"
        usage="Gradient badge for highlighting premium features and special status"
        code={`<Badge variant="brand">Featured</Badge>
<Badge variant="brand" size="lg">
  <Star className="h-3 w-3" />
  Premium
</Badge>
<Badge variant="brand">New</Badge>`}
        guidelines={{
          dos: [
            "Use for premium indicators",
            "Apply to featured content labels",
            "Maintain consistent sizing",
            "Test contrast in all themes"
          ],
          donts: [
            "Overuse on a single page",
            "Use for regular status indicators",
            "Make them too large",
            "Pair with too many other badges"
          ]
        }}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="brand">Featured</Badge>
            <Badge variant="brand">
              <Star className="h-3 w-3" />
              Premium
            </Badge>
            <Badge variant="brand" size="lg">
              New Release
            </Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Brand Badge Examples in Context</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm">Advanced Sales Training</span>
              <Badge variant="brand" size="sm">Featured</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">AI Voice Coaching</span>
              <Badge variant="brand" size="sm">Premium</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Objection Handling Master</span>
              <Badge variant="brand" size="sm">New</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Comparison with Other Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="brand">Brand</Badge>
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Brand Component Combinations"
        usage="Effective combinations of branded components for maximum impact"
        code={`<Card variant="featured">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle isHeadline>Premium Training</CardTitle>
      <Badge variant="brand">Featured</Badge>
    </div>
    <CardDescription>
      Unlock advanced sales techniques
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button variant="gradient" className="w-full">
      Start Training
    </Button>
  </CardContent>
</Card>`}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="featured">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle isHeadline>Premium Training</CardTitle>
                <Badge variant="brand">Featured</Badge>
              </div>
              <CardDescription>
                Master advanced objection handling techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <Button variant="gradient" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Continue Training
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle isHeadline>Special Offer</CardTitle>
                <Badge variant="brand">
                  <Zap className="h-3 w-3" />
                  Limited Time
                </Badge>
              </div>
              <CardDescription>
                Unlock premium features with our special offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-gradient-to-br from-chart-1/10 to-chart-3/10 p-4">
                  <div className="text-3xl font-bold">50% Off</div>
                  <div className="text-sm text-muted-foreground">First 3 months</div>
                </div>
                <Button variant="gradient" className="w-full">
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ComponentShowcase>
    </div>
  )
}

function FeedbackExamples() {
  return (
    <div className="space-y-8">
      <ComponentShowcase
        title="Enhanced Alerts"
        usage="Alert components with improved styling and variants"
        code={`<Alert variant="info">
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is an informational alert with helpful context.
  </AlertDescription>
</Alert>

<Alert variant="success">
  <Check className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    Your training session has been completed successfully.
  </AlertDescription>
</Alert>`}
        guidelines={{
          dos: [
            "Use appropriate variants for different message types",
            "Include clear titles and descriptions",
            "Add relevant icons for better recognition",
            "Enable animations for better UX"
          ],
          donts: [
            "Overuse destructive alerts",
            "Make alert text too long",
            "Stack too many alerts",
            "Use alerts for non-important information"
          ]
        }}
      >
        <div className="space-y-4">
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              New training scenarios are now available. Check out the latest additions to improve your skills.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your training session has been completed successfully. Great job on achieving a 95% score!
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <ExternalLink className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Your training schedule has been updated. Please review the new assignments in your dashboard.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <ExternalLink className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Unable to save your progress. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Loading Spinner Variants"
        usage="Enhanced loading indicators with multiple styles"
        code={`<LoadingSpinner size="sm" />
<LoadingSpinner />
<LoadingSpinner size="lg" />
<LoadingSpinner />
<LoadingSpinner size="lg" />`}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center space-y-2">
            <LoadingSpinner size="sm" />
            <p className="text-xs text-muted-foreground">Small</p>
          </div>
          <div className="text-center space-y-2">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground">Default</p>
          </div>
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-muted-foreground">Large</p>
          </div>
          <div className="text-center space-y-2">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground">Dots</p>
          </div>
          <div className="text-center space-y-2">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-muted-foreground">Pulse</p>
          </div>
        </div>
      </ComponentShowcase>

      <ComponentShowcase
        title="Toast Notifications"
        usage="Non-blocking notifications for user feedback (using Sonner)"
        code={`import { toast } from "sonner"

// Success toast
toast.success("Training completed successfully!")

// Error toast
toast.error("Failed to save progress")

// Info toast
toast.info("New scenario available")

// Warning toast
toast.warning("Session expires in 5 minutes")`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // This would normally trigger a toast
                console.log("Success toast triggered")
              }}
            >
              Success Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // This would normally trigger a toast
                console.log("Error toast triggered")
              }}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // This would normally trigger a toast
                console.log("Info toast triggered")
              }}
            >
              Info Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // This would normally trigger a toast
                console.log("Warning toast triggered")
              }}
            >
              Warning Toast
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Note: Toast notifications appear at the bottom-right of the screen.
            The actual toast implementation requires the Sonner provider to be configured.
          </p>
        </div>
      </ComponentShowcase>
    </div>
  )
}

export function ComponentLibrarySection() {
  const [activeCategory, setActiveCategory] = useState("brand")
  const [searchQuery, setSearchQuery] = useState("")

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "brand":
        return <BrandExamples />
      case "buttons":
        return <ButtonExamples />
      case "forms":
        return <FormExamples />
      case "layout":
        return <LayoutExamples />
      case "navigation":
        return <NavigationExamples />
      case "overlays":
        return <OverlayExamples />
      case "data":
        return <DataExamples />
      case "feedback":
        return <FeedbackExamples />
      default:
        return <BrandExamples />
    }
  }

  const filteredCategories = Object.entries(componentCategories).filter(
    ([key, category]) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.components.some(comp =>
        comp.toLowerCase().includes(searchQuery.toLowerCase())
      )
  )

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            Enhanced Component Library
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            A comprehensive collection of 46 enhanced shadcn/ui components with Peakstride styling,
            animations, glass morphism effects, and extended variants. Each component includes
            interactive examples, code snippets, and usage guidelines.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Component Categories */}
      <section id="components" className="space-y-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mb-8">
            {filteredCategories.map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Category Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                {componentCategories[activeCategory as keyof typeof componentCategories]?.title}
                <Badge variant="secondary" className="text-xs">
                  {componentCategories[activeCategory as keyof typeof componentCategories]?.components.length} components
                </Badge>
              </CardTitle>
              <CardDescription>
                {componentCategories[activeCategory as keyof typeof componentCategories]?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {componentCategories[activeCategory as keyof typeof componentCategories]?.components.map((component) => (
                  <Badge key={component} variant="outline">
                    {component}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Component Examples */}
          <div className="space-y-8">
            {renderCategoryContent()}
          </div>
        </Tabs>
      </section>

      {/* Enhanced Guidelines */}
      <section className="space-y-8">
        <Separator />
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-headline">Peakstride Component Guidelines</h2>
          <p className="text-lg text-muted-foreground">
            Enhanced principles for using components effectively with Peakstride styling and animations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Enhanced Animations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Use `animated` prop for smooth micro-interactions</p>
              <p>• Leverage glass morphism effects for depth</p>
              <p>• Apply consistent easing and duration</p>
              <p>• Respect user motion preferences</p>
              <p>• Combine animations thoughtfully</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Typography Enhancement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Use `isHeadline` prop for consistent heading styles</p>
              <p>• Leverage font-headline class for titles</p>
              <p>• Maintain proper hierarchy with enhanced styling</p>
              <p>• Ensure readability across all variants</p>
              <p>• Support both light and dark themes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Color Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Use success, warning, info variants contextually</p>
              <p>• Maintain brand consistency with Peakstride palette</p>
              <p>• Ensure proper contrast ratios</p>
              <p>• Test across light and dark modes</p>
              <p>• Apply semantic meaning to colors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Accessibility Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• All components meet WCAG 2.1 AA standards</p>
              <p>• Enhanced keyboard navigation support</p>
              <p>• Screen reader compatibility maintained</p>
              <p>• Improved focus indicators with animations</p>
              <p>• Motion reduction support included</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Responsive Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Mobile-first responsive approach maintained</p>
              <p>• Enhanced touch targets for mobile</p>
              <p>• Fluid animations across breakpoints</p>
              <p>• Consistent spacing with enhanced system</p>
              <p>• Optimized for all device sizes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Optimized animations with GPU acceleration</p>
              <p>• Lazy loading for complex components</p>
              <p>• Minimal bundle size impact</p>
              <p>• Tree-shaking compatible exports</p>
              <p>• Efficient re-render patterns</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="space-y-8">
        <Separator />
        <div className="space-y-4">
          <h2 className="text-3xl font-bold font-headline">Quick Reference</h2>
          <p className="text-lg text-muted-foreground">
            Common props and patterns for enhanced components.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Enhanced Props</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <code className="bg-muted px-2 py-1 rounded">animated</code>
                  <p className="mt-1 text-muted-foreground">
                    Enables smooth animations and micro-interactions
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">isHeadline</code>
                  <p className="mt-1 text-muted-foreground">
                    Applies consistent headline typography styling
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">variant="success|warning|info"</code>
                  <p className="mt-1 text-muted-foreground">
                    Extended color variants for semantic meaning
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">size="sm|default|lg|xl"</code>
                  <p className="mt-1 text-muted-foreground">
                    Enhanced size options with proper scaling
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Usage Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <strong>Form Components</strong>
                  <p className="mt-1 text-muted-foreground">
                    Always pair with Label, use prop, validate input states
                  </p>
                </div>
                <div>
                  <strong>Interactive Elements</strong>
                  <p className="mt-1 text-muted-foreground">
                    Enable animations, provide clear feedback, maintain consistency
                  </p>
                </div>
                <div>
                  <strong>Data Display</strong>
                  <p className="mt-1 text-muted-foreground">
                    Use semantic variants, maintain proper hierarchy, ensure readability
                  </p>
                </div>
                <div>
                  <strong>Layout Components</strong>
                  <p className="mt-1 text-muted-foreground">
                    Apply glass effects sparingly, maintain spacing, enable animations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}