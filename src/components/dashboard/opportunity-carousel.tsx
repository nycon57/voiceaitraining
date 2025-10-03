"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ScenarioCard, TrackCard } from "@/components/training";
import type { ScenarioCardData, TrackCardData } from "@/components/training";

interface OpportunityCarouselProps {
  scenarios?: ScenarioCardData[];
  tracks?: TrackCardData[];
  className?: string;
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
  scenarios = [],
  tracks = [],
  className,
}: OpportunityCarouselProps) {
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  // Combine scenarios and tracks with type indicator
  const allItems = [
    ...scenarios.map(s => ({ ...s, itemType: 'scenario' as const })),
    ...tracks.map(t => ({ ...t, itemType: 'track' as const })),
  ];

  // Loading state
  if (scenarios === undefined && tracks === undefined) {
    return (
      <div className={cn("w-full", className)}>
        <LoadingState />
      </div>
    );
  }

  // Empty state
  if (allItems.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={cn("w-full relative px-12", className)}>
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
          {allItems.map((item) => (
            <CarouselItem
              key={item.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              {item.itemType === 'scenario' ? (
                <ScenarioCard scenario={item} />
              ) : (
                <TrackCard track={item} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-12" />
        <CarouselNext className="hidden md:flex -right-12" />
      </Carousel>
    </div>
  );
}