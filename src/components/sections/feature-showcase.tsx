"use client";

import {
  Mic,
  Target,
  Users,
  MessageSquare,
  Clock,
  BookOpen
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// New dedicated voice AI training features showcase
const features = [
  {
    icon: Mic,
    title: "AI Voice Simulation",
    description: "Practice with realistic AI prospects that respond like real customers, handle objections, and adapt to your conversation style.",
    isCore: true
  },
  {
    icon: Target,
    title: "Instant Performance Scoring",
    description: "Get immediate feedback on talk-listen ratio, objection handling, closing techniques, and conversation flow.",
    isCore: true
  },
  {
    icon: BookOpen,
    title: "Scenario-Based Training",
    description: "Master specific sales situations with custom scenarios designed for your industry and target audience.",
    isCore: true
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Track progress, assign training modules, and compare performance across your entire sales organization.",
    isCore: false
  },
  {
    icon: MessageSquare,
    title: "Real-Time Feedback",
    description: "Receive AI-powered insights during and after calls to identify improvement opportunities instantly.",
    isCore: false
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Practice anytime, anywhere with unlimited access to AI training partners that never get tired.",
    isCore: false
  }
];

export default function VoiceAIFeatureShowcase() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Platform Features
            </Badge>
          </div>
          <h2 className="text-4xl mb-6 md:text-5xl lg:text-6xl font-headline">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Transform Your Sales Team
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines AI voice simulation, performance analytics, and team management
            to deliver measurable improvements in sales performance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-border/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.isCore && (
                      <Badge
                        variant="success"
                        size="sm"
                        className="shrink-0"
                      >
                        Core Feature
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-headline">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Subtle gradient border effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-muted/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-border/50">
            <h3 className="text-2xl font-bold mb-4 font-headline">
              Ready to see these features in action?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of sales teams already using our platform to close more deals
              and reduce training time by 80%.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                No setup required
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                14-day free trial
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Legacy flexible component for backwards compatibility
interface FeatureItem {
  icon?: LucideIcon;
  title: string;
  description: string;
  iconColor?: 'destructive' | 'primary' | 'secondary' | 'muted';
}

interface StatItem {
  value: string;
  label: string;
  valueColor?: 'destructive' | 'primary' | 'secondary' | 'muted';
}

interface StatsSection {
  title: string;
  description?: string;
  stats: StatItem[];
}

interface FeatureShowcaseProps {
  // Section styling
  variant?: 'default' | 'muted' | 'accent';
  className?: string;

  // Header content
  badge?: {
    text: string;
    variant?: 'default' | 'outline' | 'secondary';
  };
  title: string;
  description?: string;

  // Main content options
  features?: FeatureItem[];
  image?: {
    src: string;
    alt: string;
    position?: 'left' | 'right';
  };

  // Stats section
  statsSection?: StatsSection;
}

const FeatureShowcase = ({
  variant = 'default',
  className,
  badge,
  title,
  description,
  features,
  image,
  statsSection
}: FeatureShowcaseProps) => {
  const sectionClasses = cn(
    "py-32",
    variant === 'muted' && "bg-muted/20",
    variant === 'accent' && "bg-accent/5",
    className
  );

  return (
    <section className={sectionClasses}>
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center">
          {badge && (
            <Badge
              variant={badge.variant || 'outline'}
              className="mb-4 px-3 py-2 text-muted-foreground"
            >
              {badge.text}
            </Badge>
          )}
          <h2 className="font-headline text-4xl leading-tight tracking-tight md:text-5xl">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto text-lg leading-snug">
              {description}
            </p>
          )}
        </div>

        {/* Main content area */}
        {(features || image) && (
          <div className="mt-16">
            {/* Card layout with image and features */}
            {image ? (
              <div className="rounded-lg border bg-card p-10 shadow-sm">
                <div className="flex w-full flex-col items-center justify-between gap-8 md:flex-row">
                  {/* Content side */}
                  <div className={cn(
                    "w-full max-w-md",
                    image.position === 'right' && "md:order-1"
                  )}>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-medium lg:text-3xl">
                        {features?.[0]?.title || "Feature Overview"}
                      </h3>
                      <p className="text-sm text-muted-foreground lg:text-base">
                        {features?.[0]?.description || "Discover the benefits of our solution."}
                      </p>
                    </div>
                  </div>

                  {/* Image side */}
                  <div className="w-full max-w-lg">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="max-h-[420px] w-full rounded-lg object-cover"
                    />
                  </div>
                </div>

                {/* Additional features grid below */}
                {features && features.length > 1 && (
                  <div className="mt-24 grid grid-cols-1 justify-between gap-12 sm:grid-cols-2 md:grid-cols-4">
                    {features.slice(1).map((feature, index) => (
                      <div key={index}>
                        <h6 className="text-lg mb-3 font-semibold">{feature.title}</h6>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : features ? (
              /* Features only grid */
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const iconColorClass = feature.iconColor === 'destructive'
                    ? 'bg-destructive/10 text-destructive'
                    : feature.iconColor === 'primary'
                    ? 'bg-primary/10 text-primary'
                    : feature.iconColor === 'secondary'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-muted text-muted-foreground';

                  const titleColorClass = feature.iconColor === 'destructive'
                    ? 'text-destructive'
                    : '';

                  return (
                    <div key={index} className="text-center">
                      {Icon && (
                        <div className={cn(
                          "mx-auto flex h-16 w-16 items-center justify-center rounded-full",
                          iconColorClass
                        )}>
                          <Icon className="h-8 w-8" />
                        </div>
                      )}
                      <h3 className={cn(
                        "font-headline mt-4 text-xl font-bold",
                        titleColorClass
                      )}>
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}

        {/* Stats section */}
        {statsSection && (
          <div className="mt-16 rounded-lg border bg-background p-8 md:p-12">
            <div className="text-center">
              <h3 className="font-headline text-2xl font-bold md:text-3xl">
                {statsSection.title}
              </h3>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {statsSection.stats.map((stat, index) => {
                  const valueColorClass = stat.valueColor === 'destructive'
                    ? 'text-destructive'
                    : stat.valueColor === 'primary'
                    ? 'text-primary'
                    : stat.valueColor === 'secondary'
                    ? 'text-secondary'
                    : '';

                  return (
                    <div key={index} className="space-y-2">
                      <div className={cn(
                        "text-3xl font-bold",
                        valueColorClass
                      )}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {statsSection.description && (
                <p className="text-muted-foreground mt-6 text-lg">
                  {statsSection.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export { FeatureShowcase, VoiceAIFeatureShowcase };