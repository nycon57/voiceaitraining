"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Zap, Heart, Star, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

const interactionStates = {
  hover: {
    title: "Hover States",
    description: "Visual feedback when users hover over interactive elements",
    examples: [
      { name: "Button Hover", effect: "Shadow lift + color change" },
      { name: "Card Hover", effect: "Subtle shadow increase" },
      { name: "Link Hover", effect: "Underline + color shift" },
      { name: "Icon Hover", effect: "Scale + color transition" }
    ]
  },
  focus: {
    title: "Focus States",
    description: "Clear indicators for keyboard navigation and accessibility",
    examples: [
      { name: "Input Focus", effect: "Ring outline + border color" },
      { name: "Button Focus", effect: "Ring outline + shadow" },
      { name: "Link Focus", effect: "Outline with rounded corners" },
      { name: "Card Focus", effect: "Border highlight + shadow" }
    ]
  },
  active: {
    title: "Active States",
    description: "Immediate feedback when elements are being pressed or clicked",
    examples: [
      { name: "Button Active", effect: "Scale down + darker color" },
      { name: "Toggle Active", effect: "Background fill + position change" },
      { name: "Tab Active", effect: "Border highlight + background" },
      { name: "Checkbox Active", effect: "Checkmark animation" }
    ]
  },
  disabled: {
    title: "Disabled States",
    description: "Clear indication when elements are not interactive",
    examples: [
      { name: "Button Disabled", effect: "Reduced opacity + no pointer" },
      { name: "Input Disabled", effect: "Muted background + text" },
      { name: "Link Disabled", effect: "Gray color + no underline" },
      { name: "Form Disabled", effect: "Overall opacity reduction" }
    ]
  }
}

const loadingStates = [
  {
    name: "Button Loading",
    component: "ButtonLoadingDemo",
    usage: "Form submissions, API calls"
  },
  {
    name: "Content Loading",
    component: "ContentLoadingDemo",
    usage: "Page content, data fetching"
  },
  {
    name: "Progress Loading",
    component: "ProgressLoadingDemo",
    usage: "File uploads, multi-step processes"
  },
  {
    name: "Skeleton Loading",
    component: "SkeletonLoadingDemo",
    usage: "Content placeholders, list items"
  }
]

const errorStates = [
  {
    type: "Field Error",
    description: "Individual form field validation",
    color: "text-red-600 border-red-500"
  },
  {
    type: "Page Error",
    description: "Full page error states",
    color: "text-red-600 bg-red-50"
  },
  {
    type: "Network Error",
    description: "Connection and API failures",
    color: "text-orange-600 bg-orange-50"
  },
  {
    type: "Permission Error",
    description: "Access denied scenarios",
    color: "text-yellow-600 bg-yellow-50"
  }
]

const microInteractions = [
  {
    name: "Heart Like",
    description: "Animated heart for favoriting",
    trigger: "Click to like/unlike"
  },
  {
    name: "Star Rating",
    description: "Interactive star rating component",
    trigger: "Hover and click stars"
  },
  {
    name: "Success Checkmark",
    description: "Animated checkmark for completed actions",
    trigger: "Automatic on success"
  },
  {
    name: "Loading Pulse",
    description: "Pulsing animation for loading states",
    trigger: "During async operations"
  }
]

function InteractiveButton({ children, className, ...props }: any) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        "active:translate-y-0 active:shadow-md",
        "disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function ButtonLoadingDemo() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleClick} disabled={isLoading} className="gap-2">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Click to see loading state with spinner and text change
      </p>
    </div>
  )
}

function ContentLoadingDemo() {
  const [isLoading, setIsLoading] = useState(false)

  const toggleLoading = () => {
    setIsLoading(!isLoading)
  }

  return (
    <div className="space-y-4">
      <Button onClick={toggleLoading} variant="outline">
        {isLoading ? "Hide" : "Show"} Loading State
      </Button>

      <div className="border rounded-lg p-4 min-h-[120px]">
        {isLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse bg-muted h-4 rounded w-3/4"></div>
            <div className="animate-pulse bg-muted h-4 rounded w-1/2"></div>
            <div className="animate-pulse bg-muted h-4 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-semibold">Content Title</h3>
            <p className="text-sm text-muted-foreground">
              This is the actual content that appears after loading is complete.
              It provides real information to the user.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgressLoadingDemo() {
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsRunning(false)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 200)
    }
    return () => clearInterval(interval)
  }, [isRunning, progress])

  const startProgress = () => {
    setProgress(0)
    setIsRunning(true)
  }

  const resetProgress = () => {
    setProgress(0)
    setIsRunning(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={startProgress} disabled={isRunning} size="sm">
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
        <Button onClick={resetProgress} variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Upload Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {progress === 100 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Upload completed successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function HeartLikeDemo() {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <button
      onClick={() => setIsLiked(!isLiked)}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        "hover:bg-red-50 dark:hover:bg-red-950/20",
        "focus:outline-none focus:ring-2 focus:ring-red-500/20"
      )}
    >
      <Heart
        className={cn(
          "h-6 w-6 transition-all duration-300",
          isLiked
            ? "fill-red-500 text-red-500 scale-110"
            : "text-muted-foreground hover:text-red-500"
        )}
      />
    </button>
  )
}

function StarRatingDemo() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setRating(star)}
          className="p-1 rounded transition-all duration-200 hover:scale-110"
        >
          <Star
            className={cn(
              "h-5 w-5 transition-all duration-200",
              (hover || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {rating ? `${rating}/5` : "Rate this"}
      </span>
    </div>
  )
}

function SuccessCheckmarkDemo() {
  const [showSuccess, setShowSuccess] = useState(false)

  const triggerSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Button onClick={triggerSuccess} disabled={showSuccess}>
        {showSuccess ? "Success!" : "Complete Task"}
      </Button>

      {showSuccess && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5 animate-in fade-in zoom-in duration-500" />
          <span className="animate-in fade-in slide-in-from-left duration-500 delay-150">
            Task completed successfully!
          </span>
        </div>
      )}
    </div>
  )
}

function ErrorStateDemo({ error }: { error: any }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>{error.type}:</strong> {error.description}
      </AlertDescription>
    </Alert>
  )
}

export function InteractionDesignSection() {
  const [activeState, setActiveState] = useState<string | null>(null)

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Interaction Design</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Thoughtful interactions that provide clear feedback, guide users through tasks,
          and create delightful experiences while maintaining accessibility and performance.
        </p>
      </div>

      {/* Component States */}
      <section id="states" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Component States</h2>
          <p className="text-lg text-muted-foreground">
            Every interactive element should provide clear visual feedback
            across all possible states to guide user understanding.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(interactionStates).map(([key, state]) => (
            <Card key={key} className="group">
              <CardHeader>
                <CardTitle>{state.title}</CardTitle>
                <CardDescription>{state.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Interactive Examples */}
                <div className="space-y-3">
                  {key === "hover" && (
                    <div className="space-y-3">
                      <InteractiveButton>Hover me</InteractiveButton>
                      <div className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        Hover card example
                      </div>
                    </div>
                  )}

                  {key === "focus" && (
                    <div className="space-y-3">
                      <InteractiveButton>Focus me (Tab)</InteractiveButton>
                      <input
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                        placeholder="Focus this input"
                      />
                    </div>
                  )}

                  {key === "active" && (
                    <div className="space-y-3">
                      <InteractiveButton>Press me</InteractiveButton>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        <span>Active checkbox</span>
                      </label>
                    </div>
                  )}

                  {key === "disabled" && (
                    <div className="space-y-3">
                      <InteractiveButton disabled>Disabled button</InteractiveButton>
                      <input
                        disabled
                        className="w-full p-2 border rounded-lg"
                        placeholder="Disabled input"
                      />
                    </div>
                  )}
                </div>

                {/* State Examples List */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Examples:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {state.examples.map((example, idx) => (
                      <li key={idx}>
                        <strong>{example.name}:</strong> {example.effect}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>State Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✓ Best Practices</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Provide immediate visual feedback</li>
                  <li>• Maintain consistent state behaviors</li>
                  <li>• Use appropriate timing (150-300ms)</li>
                  <li>• Ensure states are accessible via keyboard</li>
                  <li>• Test with screen readers</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600">✗ Avoid</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Overly aggressive animations</li>
                  <li>• Inconsistent state styling</li>
                  <li>• Missing focus indicators</li>
                  <li>• Delayed state feedback</li>
                  <li>• Unclear disabled states</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Loading States */}
      <section id="loading" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Loading States</h2>
          <p className="text-lg text-muted-foreground">
            Loading states keep users informed during async operations,
            reducing perceived wait time and maintaining engagement.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Button Loading</CardTitle>
              <CardDescription>Loading state for form submissions and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonLoadingDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Loading</CardTitle>
              <CardDescription>Skeleton states for content areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentLoadingDemo />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Progress Loading</CardTitle>
              <CardDescription>Progress indicators for long-running operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressLoadingDemo />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loading State Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Immediate Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Show loading state immediately when user initiates an action.
                  Don't wait for the request to start.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Progress Indication</h4>
                <p className="text-sm text-muted-foreground">
                  For operations longer than 3 seconds, show progress or
                  estimated time remaining when possible.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Graceful Degradation</h4>
                <p className="text-sm text-muted-foreground">
                  Provide fallbacks for slow connections and handle
                  timeout scenarios gracefully.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Error States */}
      <section id="errors" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Error States</h2>
          <p className="text-lg text-muted-foreground">
            Clear, helpful error messages that guide users toward resolution
            and maintain trust in the system.
          </p>
        </div>

        <div className="space-y-4">
          {errorStates.map((error, index) => (
            <ErrorStateDemo key={index} error={error} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Error Message Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">Writing Effective Errors</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use clear, non-technical language</li>
                  <li>• Explain what went wrong</li>
                  <li>• Provide actionable next steps</li>
                  <li>• Include relevant context</li>
                  <li>• Offer alternative solutions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Error Recovery</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Allow users to retry failed actions</li>
                  <li>• Preserve user input when possible</li>
                  <li>• Provide contact support options</li>
                  <li>• Log errors for debugging</li>
                  <li>• Monitor error frequency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Micro-interactions */}
      <section id="micro" className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Micro-interactions</h2>
          <p className="text-lg text-muted-foreground">
            Small, delightful animations that provide feedback and create
            emotional connections with users.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Heart Like Animation</CardTitle>
              <CardDescription>Animated heart for favoriting content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <HeartLikeDemo />
                <span className="text-sm text-muted-foreground">
                  Click to see animation
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Star Rating</CardTitle>
              <CardDescription>Interactive star rating with hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <StarRatingDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Checkmark</CardTitle>
              <CardDescription>Animated success feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <SuccessCheckmarkDemo />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading Pulse</CardTitle>
              <CardDescription>Subtle pulsing for ongoing processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Micro-interaction Principles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Trigger</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  What initiates the interaction
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Rules</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  What happens during the interaction
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Feedback</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  What the user sees and feels
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Loops</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  What determines the meta-rules
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}