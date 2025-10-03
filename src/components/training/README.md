# Training Library Components

This directory contains all UI components for the training library redesign. All components follow the established design system patterns from the dashboard and team management pages.

## Components Overview

### 1. TrainingStatsCards
**File**: `training-stats-cards.tsx`

Displays 4 metric cards in a responsive grid showing enrollment statistics:
- Enrolled Courses (count)
- Completed (count)
- In Progress (count)
- Total Hours (sum of durations)

**Features**:
- Colored left borders (chart-1, chart-2, chart-3, chart-4)
- Matches StatCard layout from dashboard
- Responsive: 2 cols mobile, 4 cols desktop
- Icons: BookOpen, CheckCircle, Clock, TrendingUp

**Props**:
```typescript
interface TrainingStatsCardsProps {
  enrollmentStats: {
    enrolledCourses: number
    completed: number
    inProgress: number
    totalHours: number
  }
}
```

### 2. MyCourses
**File**: `my-courses.tsx`

Horizontal scrolling list of enrolled courses with progress tracking.

**Features**:
- Horizontal scroll with navigation buttons (desktop)
- Empty state when no enrollments
- Progress bar for each course
- Thumbnail with gradient fallback
- Type badge (SCENARIO or TRACK)
- Continue CTA button
- Smooth scroll behavior
- Hover effects and animations

**Props**:
```typescript
interface CourseEnrollment {
  id: string
  type: "scenario" | "track"
  title: string
  thumbnailUrl?: string
  progress: number
  href: string
}

interface MyCoursesProps {
  enrollments: CourseEnrollment[]
  onContinue?: (enrollmentId: string) => void
}
```

### 3. TrainingFilters
**File**: `training-filters.tsx`

Comprehensive filter bar with search and multiple select dropdowns.

**Features**:
- Debounced search input (300ms)
- Category select dropdown
- Industry select dropdown
- Difficulty select (Easy, Medium, Hard)
- Sort dropdown (Newest, Popular, A-Z, Duration)
- Clear filters button (appears when filters active)
- Responsive layout: stack on mobile, horizontal on desktop
- Auto-notification to parent on filter changes

**Props**:
```typescript
interface TrainingFiltersState {
  search: string
  category: string
  industry: string
  difficulty: string
  sort: string
}

interface TrainingFiltersProps {
  onFilterChange: (filters: TrainingFiltersState) => void
  categories: Array<{ value: string; label: string }>
  industries: Array<{ value: string; label: string }>
}
```

### 4. ScenarioCard
**File**: `scenario-card.tsx`

Archive-style card for individual scenarios with comprehensive metadata display.

**Features**:
- 16:9 aspect ratio thumbnail with gradient fallback
- Type and category badges
- Duration range display
- Difficulty indicator with color coding (Easy/Medium/Hard)
- Industry and attempt count
- Up to 3 tags (+ overflow indicator)
- Average score with progress bar
- Enroll or Continue button based on enrollment status
- Hover effects: lift, shadow, scale thumbnail
- Responsive and accessible

**Props**:
```typescript
interface ScenarioCardData {
  id: string
  title: string
  description: string
  category: string
  industry: string
  difficulty: "easy" | "medium" | "hard"
  durationMin: number
  durationMax: number
  thumbnailUrl?: string
  tags: string[]
  averageScore?: number
  attemptCount: number
  isEnrolled?: boolean
}

interface ScenarioCardProps {
  scenario: ScenarioCardData
  onEnroll?: (scenarioId: string) => void
  onContinue?: (scenarioId: string) => void
}
```

### 5. TrackCard
**File**: `track-card.tsx`

Similar to ScenarioCard but optimized for learning tracks.

**Features**:
- 16:9 aspect ratio thumbnail with gradient fallback
- Type badge (TRACK) and scenario count badge
- Total duration in hours
- Enrolled count display
- Industry badge
- Up to 3 tags (+ overflow indicator)
- Progress bar if enrolled
- Enroll or Continue button based on enrollment status
- Hover effects matching ScenarioCard
- Distinct visual styling with chart-4 accent color

**Props**:
```typescript
interface TrackCardData {
  id: string
  title: string
  description: string
  scenarioCount: number
  totalDurationMin: number
  totalDurationMax: number
  industry: string
  thumbnailUrl?: string
  tags: string[]
  enrolledCount: number
  isEnrolled?: boolean
  progress?: number
}

interface TrackCardProps {
  track: TrackCardData
  enrollment?: {
    progress: number
  }
  onEnroll?: (trackId: string) => void
  onContinue?: (trackId: string) => void
}
```

### 6. EmptyLibraryState
**File**: `empty-library-state.tsx`

Empty state for when no scenarios/tracks match filters.

**Features**:
- Search-aware: shows EmptyStateSearch if search query present
- Generic "no results" state otherwise
- Clear filters CTA
- Follows existing EmptyState patterns
- Center aligned with icon

**Props**:
```typescript
interface EmptyLibraryStateProps {
  onClearFilters: () => void
  searchQuery?: string
}
```

## Design Patterns Used

### Colored Borders
Following the team management pattern, stat cards use colored left borders:
```tsx
className="border-l-4 border-l-chart-1"
```

### Card Hover Effects
All cards use consistent hover states:
```tsx
className="hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
```

### Gradient Thumbnails
Default gradients for cards without images:
```tsx
// Scenarios
bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20

// Tracks
bg-gradient-to-br from-chart-3/20 via-chart-4/20 to-chart-1/20
```

### Difficulty Color Coding
```typescript
const difficultyConfig = {
  easy: { color: "text-success", bgColor: "bg-success/10" },
  medium: { color: "text-warning", bgColor: "bg-warning/10" },
  hard: { color: "text-destructive", bgColor: "bg-destructive/10" },
}
```

### Responsive Grids
Standard responsive patterns:
- Stats: `grid-cols-2 lg:grid-cols-4`
- Cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

## Usage Example

```tsx
import { TrainingStatsCards } from "@/components/training/training-stats-cards"
import { MyCourses } from "@/components/training/my-courses"
import { TrainingFilters } from "@/components/training/training-filters"
import { ScenarioCard } from "@/components/training/scenario-card"
import { TrackCard } from "@/components/training/track-card"
import { EmptyLibraryState } from "@/components/training/empty-library-state"

export default function TrainingPage() {
  const [filters, setFilters] = useState<TrainingFiltersState>({...})

  return (
    <div className="space-y-6">
      {/* Stats */}
      <TrainingStatsCards enrollmentStats={{...}} />

      {/* Enrolled Courses */}
      <MyCourses enrollments={[...]} onContinue={handleContinue} />

      {/* Filters */}
      <TrainingFilters
        onFilterChange={setFilters}
        categories={[...]}
        industries={[...]}
      />

      {/* Library Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {scenarios.map(scenario => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onEnroll={handleEnroll}
          />
        ))}
        {tracks.map(track => (
          <TrackCard
            key={track.id}
            track={track}
            onEnroll={handleEnroll}
          />
        ))}
      </div>

      {/* Empty State */}
      {(scenarios.length === 0 && tracks.length === 0) && (
        <EmptyLibraryState
          onClearFilters={clearFilters}
          searchQuery={filters.search}
        />
      )}
    </div>
  )
}
```

## Icons Used

All icons from `lucide-react`:
- **BookOpen**: Scenarios, courses, empty states
- **CheckCircle**: Completed stat
- **Clock**: Duration, time estimates
- **TrendingUp**: Total hours stat
- **BarChart3**: Difficulty indicator
- **Briefcase**: Industry
- **Users**: Attempt count, enrolled count
- **ArrowRight**: CTA buttons
- **Layers**: Track thumbnail fallback
- **Search**: Search input
- **X**: Clear filters
- **ChevronLeft/Right**: Scroll buttons

## TypeScript

All components are fully typed with exported interfaces. No `any` types used. Strict mode compatible.

## Accessibility

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Semantic HTML structure
- Alt text on images (with fallback icons)
- Progress indicators with labels

## Performance

- Debounced search (300ms)
- Conditional rendering for empty states
- Optimized animations with Framer Motion
- Lazy badge rendering (max 3 tags + overflow)
- Efficient filter state management