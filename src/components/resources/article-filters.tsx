"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ChevronDown, Clock, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ArticleFilters as ArticleFiltersType, ArticleSortOption } from '@/types/article'

interface ArticleFiltersProps {
  filters: ArticleFiltersType
  availableTags: string[]
  onFiltersChange: (filters: Partial<ArticleFiltersType>) => void
  className?: string
}

const sortOptions: ArticleSortOption[] = [
  {
    value: 'recent',
    label: 'Most Recent',
    description: 'Latest published articles first'
  },
  {
    value: 'popular',
    label: 'Most Popular',
    description: 'Sorted by view count'
  },
  {
    value: 'reading_time',
    label: 'Reading Time',
    description: 'Sorted by estimated read time'
  }
]

export function ArticleFilters({
  filters,
  availableTags,
  onFiltersChange,
  className
}: ArticleFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout>()

  // Debounce search input
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce)
    }

    const timeout = setTimeout(() => {
      onFiltersChange({ search: searchValue || undefined })
    }, 300)

    setSearchDebounce(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [searchValue])

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]

    onFiltersChange({
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ sortBy: sortBy as 'recent' | 'popular' | 'reading_time' })
  }

  const clearAllFilters = () => {
    setSearchValue('')
    onFiltersChange({
      search: undefined,
      tags: undefined,
      sortBy: 'recent',
      sortOrder: 'desc'
    })
  }

  const activeFiltersCount = [
    filters.search,
    filters.tags?.length
  ].filter(Boolean).length

  const getSortIcon = (sortBy: string) => {
    switch (sortBy) {
      case 'popular':
        return <TrendingUp className="w-4 h-4" />
      case 'reading_time':
        return <Clock className="w-4 h-4" />
      case 'recent':
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 bg-background/60 backdrop-blur-sm border-border/40 focus:border-chart-2/30 focus:ring-chart-2/20"
          />
        </div>

        {/* Sort Select */}
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px] bg-background/60 backdrop-blur-sm border-border/40">
            <div className="flex items-center gap-2">
              {getSortIcon(filters.sortBy || 'recent')}
              <SelectValue placeholder="Sort by..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {getSortIcon(option.value)}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="relative bg-background/60 backdrop-blur-sm border-border/40"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-chart-2/10 text-chart-2 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Filter Articles</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={filters.tags?.includes(tag) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer transition-all hover:scale-105",
                            filters.tags?.includes(tag)
                              ? "bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 text-white"
                              : "hover:border-chart-2/50 hover:text-chart-2"
                          )}
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(filters.search || (filters.tags && filters.tags.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => {
                    setSearchValue('')
                    onFiltersChange({ search: undefined })
                  }}
                />
              </Badge>
            )}

            {filters.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}