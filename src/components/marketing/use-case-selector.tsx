import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Users, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface UseCaseSelectorProps {
  className?: string
}

export function UseCaseSelector({ className }: UseCaseSelectorProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl transition-transform group-hover:scale-150" />
        <CardHeader className="relative">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-2 ring-primary/10">
            <User className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-headline">I'm an Individual</CardTitle>
          <CardDescription className="text-base">
            Perfect for freelancers, consultants, and solo practitioners looking to sharpen their skills
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Start free with 10 sessions per month</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>AI-powered scenario generation (Pro+)</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Advanced analytics and insights</span>
            </li>
          </ul>
          <Button asChild className="w-full" size="lg">
            <Link href="/for/individuals">
              View Individual Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl transition-transform group-hover:scale-150" />
        <CardHeader className="relative">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-2 ring-primary/10">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-headline">I'm on a Team</CardTitle>
          <CardDescription className="text-base">
            Ideal for sales teams, call centers, and organizations training 10+ people
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Team dashboards and leaderboards</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Assignment tracking and compliance</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Advanced analytics and reporting</span>
            </li>
          </ul>
          <Button asChild className="w-full" size="lg">
            <Link href="/request-demo">
              Schedule a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface UseCaseCardProps {
  title: string
  description: string
  href: string
  cta: string
  features: string[]
  icon: React.ReactNode
  className?: string
}

export function UseCaseCard({ title, description, href, cta, features, icon, className }: UseCaseCardProps) {
  return (
    <Card className={cn("group relative overflow-hidden transition-all hover:shadow-lg", className)}>
      <CardHeader>
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-2 ring-primary/10">
          {icon}
        </div>
        <CardTitle className="text-xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-muted-foreground">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full">
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}