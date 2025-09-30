"use client";

import * as React from "react";
import Link from "next/link";
import { Mic, BookOpen, Sparkles } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OpportunityItem {
  id: string;
  title: string;
  description: string | null;
  difficulty?: "easy" | "medium" | "hard";
  type: "scenario" | "track";
  tags?: string[];
  scenario_count?: number; // for tracks
}

interface OpportunityCarouselProps {
  items?: OpportunityItem[];
  className?: string;
}

const difficultyConfig = {
  easy: {
    gradient: "from-green-500/10 to-green-600/5",
    border: "border-green-500/20",
    badge: "success",
  },
  medium: {
    gradient: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
    badge: "warning",
  },
  hard: {
    gradient: "from-red-500/10 to-red-600/5",
    border: "border-red-500/20",
    badge: "destructive",
  },
} as const;

function OpportunityCard({ item }: { item: OpportunityItem }) {
  const difficulty = item.difficulty || "medium";
  const config = difficultyConfig[difficulty];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg",
        "bg-gradient-to-br backdrop-blur-sm",
        config.gradient,
        config.border
      )}
    >
      {/* Difficulty Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <Badge variant={config.badge as any} size="sm" className="capitalize">
          {difficulty}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Title */}
        <h3 className="font-headline text-xl font-bold mb-2 pr-20 line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="muted" size="sm">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Scenario Count for Tracks */}
        {item.type === "track" && item.scenario_count !== undefined && (
          <p className="text-xs text-muted-foreground mb-4">
            {item.scenario_count} scenario{item.scenario_count !== 1 ? "s" : ""}
          </p>
        )}

        {/* CTA Button */}
        <Link
          href={
            item.type === "scenario"
              ? `/play/${item.id}`
              : `/tracks/${item.id}`
          }
          className="w-full mt-auto"
        >
          <Button
            variant="default"
            className="w-full group-hover:scale-[1.02] transition-transform"
          >
            {item.type === "scenario" ? (
              <>
                <Mic className="size-4" />
                Start Training
              </>
            ) : (
              <>
                <BookOpen className="size-4" />
                Explore Track
              </>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Sparkles className="size-8 text-muted-foreground" />
      </div>
      <h3 className="font-headline text-lg font-semibold mb-2">
        No New Opportunities
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Check back soon for new training scenarios and tracks tailored to your
        learning path.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border/50 bg-muted/10 p-6 animate-pulse"
        >
          <div className="h-6 bg-muted rounded mb-2" />
          <div className="h-4 bg-muted rounded mb-4 w-3/4" />
          <div className="flex gap-2 mb-4">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
          <div className="h-10 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function OpportunityCarousel({
  items,
  className,
}: OpportunityCarouselProps) {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  // Loading state
  if (items === undefined) {
    return (
      <div className={cn("w-full", className)}>
        <LoadingState />
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        className="w-full"
        onMouseEnter={() => autoplayPlugin.current.stop()}
        onMouseLeave={() => autoplayPlugin.current.play()}
      >
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <OpportunityCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12" />
        <CarouselNext className="hidden md:flex -right-12" />
      </Carousel>
    </div>
  );
}