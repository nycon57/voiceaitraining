"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export interface TrainingFiltersState {
  search: string
  category: string
  industry: string
  difficulty: string
  sort: string
}

export interface TrainingFiltersProps {
  onFilterChange: (filters: TrainingFiltersState) => void
  categories: Array<{ value: string; label: string }>
  industries: Array<{ value: string; label: string }>
}

export function TrainingFilters({
  onFilterChange,
  categories,
  industries,
}: TrainingFiltersProps) {
  const [filters, setFilters] = useState<TrainingFiltersState>({
    search: "",
    category: "all",
    industry: "all",
    difficulty: "all",
    sort: "newest",
  })
  const [searchInput, setSearchInput] = useState("")

  const updateFilters = (nextFilters: TrainingFiltersState) => {
    setFilters(nextFilters)
    onFilterChange(nextFilters)
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.industry !== "all" ||
    filters.difficulty !== "all" ||
    filters.sort !== "newest"

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "all",
      industry: "all",
      difficulty: "all",
      sort: "newest",
    }

    setSearchInput("")
    updateFilters(clearedFilters)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search scenarios and tracks..."
            value={searchInput}
            onChange={(e) => {
              const search = e.target.value
              setSearchInput(search)
              updateFilters({ ...filters, search })
            }}
            className="pl-9"
          />
        </div>

        {/* Category Select */}
        <Select
          value={filters.category}
          onValueChange={(value) => updateFilters({ ...filters, category: value })}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Industry Select */}
        <Select
          value={filters.industry}
          onValueChange={(value) => updateFilters({ ...filters, industry: value })}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty Select */}
        <Select
          value={filters.difficulty}
          onValueChange={(value) => updateFilters({ ...filters, difficulty: value })}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select
          value={filters.sort}
          onValueChange={(value) => updateFilters({ ...filters, sort: value })}
        >
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="flex-shrink-0"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
