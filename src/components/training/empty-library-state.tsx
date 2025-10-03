"use client"

import { EmptyStateSearch } from "@/components/ui/empty-state"
import { BookOpen } from "lucide-react"

export interface EmptyLibraryStateProps {
  onClearFilters: () => void
  searchQuery?: string
}

export function EmptyLibraryState({
  onClearFilters,
  searchQuery,
}: EmptyLibraryStateProps) {
  // If there's a search query, use the search empty state
  if (searchQuery) {
    return (
      <EmptyStateSearch
        searchQuery={searchQuery}
        onClear={onClearFilters}
        description="No scenarios or tracks match your search. Try different keywords or clear your filters."
        animated={false}
      />
    )
  }

  // Otherwise show a generic "no results" state
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <h3 className="font-headline text-xl font-semibold tracking-tight">
          No training content found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Try adjusting your filters to see more scenarios and tracks.
        </p>
      </div>
      <button
        onClick={onClearFilters}
        className="text-sm text-primary hover:underline font-medium"
      >
        Clear all filters
      </button>
    </div>
  )
}