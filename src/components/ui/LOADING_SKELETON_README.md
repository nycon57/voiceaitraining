# Loading Skeleton Components

Comprehensive loading skeleton components for the Voice AI Training dashboard. These components provide animated placeholders during data loading, matching the design system and existing component layouts.

## Components

### SkeletonCard

Loading skeleton that matches the `StatCard` component layout with header, icon, and content lines.

```tsx
import { SkeletonCard } from "@/components/ui/loading-skeleton"

<SkeletonCard hasIcon lines={3} variant="shimmer" />
```

**Props:**
- `lines?: number` - Number of text lines (default: 2)
- `hasIcon?: boolean` - Show icon placeholder (default: false)
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Dashboard stat cards
- Metric displays
- KPI cards

---

### SkeletonTable

Loading skeleton for data tables with headers and rows.

```tsx
import { SkeletonTable } from "@/components/ui/loading-skeleton"

<SkeletonTable rows={5} columns={4} variant="shimmer" />
```

**Props:**
- `rows?: number` - Number of data rows (default: 5)
- `columns?: number` - Number of columns (default: 4)
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Data tables
- Assignment lists
- Attempt history
- User lists

---

### SkeletonChart

Loading skeleton for chart components with configurable visualization type.

```tsx
import { SkeletonChart } from "@/components/ui/loading-skeleton"

<SkeletonChart type="bar" height="h-[400px]" variant="shimmer" />
```

**Props:**
- `type?: "line" | "bar" | "area"` - Chart type (default: "line")
- `height?: string` - Tailwind height class (default: "h-[350px]")
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Performance charts
- Analytics graphs
- Trend visualizations
- Score distributions

---

### SkeletonList

Loading skeleton for vertical lists with optional avatars.

```tsx
import { SkeletonList } from "@/components/ui/loading-skeleton"

<SkeletonList items={5} hasAvatar variant="shimmer" />
```

**Props:**
- `items?: number` - Number of list items (default: 3)
- `hasAvatar?: boolean` - Show avatar placeholder (default: false)
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Assignment lists
- Recent activity feeds
- User lists
- Scenario lists

---

### SkeletonText

Loading skeleton for text content with various width patterns.

```tsx
import { SkeletonText } from "@/components/ui/loading-skeleton"

<SkeletonText lines={3} width="varied" variant="shimmer" />
```

**Props:**
- `lines?: number` - Number of text lines (default: 1)
- `width?: "full" | "varied" | "short" | "medium" | "long"` - Width pattern (default: "full")
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Description text
- Paragraph placeholders
- Title loading
- Labels

---

### SkeletonForm

Loading skeleton for form components with fields and optional submit button.

```tsx
import { SkeletonForm } from "@/components/ui/loading-skeleton"

<SkeletonForm fields={5} hasButton variant="shimmer" />
```

**Props:**
- `fields?: number` - Number of form fields (default: 3)
- `hasButton?: boolean` - Show submit button (default: true)
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Settings forms
- Scenario editors
- Profile editors
- Configuration dialogs

---

### SkeletonDashboard

Complete dashboard loading state with stat cards and content grid.

```tsx
import { SkeletonDashboard } from "@/components/ui/loading-skeleton"

<SkeletonDashboard variant="shimmer" />
```

**Props:**
- `variant?: "default" | "shimmer" | "wave"` - Animation style (default: "shimmer")
- `className?: string` - Additional CSS classes

**Use Cases:**
- Full page loading states
- Dashboard initial load
- Role-specific overview pages
- React Suspense fallback

---

## Animation Variants

All skeleton components support three animation variants:

### Default (Pulse)
Simple opacity pulse animation. Lightweight and universally supported.

```tsx
<SkeletonCard variant="default" />
```

### Shimmer (Recommended)
Smooth gradient animation that moves across the skeleton. Provides the best visual feedback.

```tsx
<SkeletonCard variant="shimmer" />
```

### Wave
Wave-like animation with a moving highlight. Alternative to shimmer.

```tsx
<SkeletonCard variant="wave" />
```

---

## Usage Patterns

### Page-Level Loading

```tsx
export default function DashboardPage() {
  const { data, isLoading } = useDashboardData()

  if (isLoading) {
    return <SkeletonDashboard />
  }

  return <DashboardContent data={data} />
}
```

### Component-Level Loading

```tsx
function AssignmentsCard() {
  const { assignments, isLoading } = useAssignments()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonList items={3} />
        ) : (
          assignments.map(item => <AssignmentItem key={item.id} {...item} />)
        )}
      </CardContent>
    </Card>
  )
}
```

### With React Suspense

```tsx
import { Suspense } from 'react'
import { SkeletonDashboard } from "@/components/ui/loading-skeleton"

export default function Page() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <DashboardContent />
    </Suspense>
  )
}
```

### Multiple Components

```tsx
function StatsGrid({ isLoading, stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {isLoading ? (
        <>
          <SkeletonCard hasIcon />
          <SkeletonCard hasIcon />
          <SkeletonCard hasIcon />
          <SkeletonCard hasIcon />
        </>
      ) : (
        stats.map(stat => <StatCard key={stat.label} {...stat} />)
      )}
    </div>
  )
}
```

---

## Best Practices

### ✓ Do

- **Match layouts**: Ensure skeleton structure matches the actual component layout for seamless transitions
- **Use shimmer variant**: Provides the best visual feedback for most cases
- **Match item counts**: When data length is known, match skeleton items to expected data
- **Consistent variants**: Use the same animation variant across a page
- **Page-level skeletons**: Use `SkeletonDashboard` for initial page loads
- **Suspense integration**: Combine with React Suspense for automatic loading state management

### ✗ Don't

- **Mix variants**: Avoid using different animation variants on the same page
- **Over-skeleton**: Don't use skeletons for very fast operations (under 300ms)
- **Wrong dimensions**: Don't use skeletons that don't match final content dimensions
- **Excessive skeletons**: Avoid showing too many skeleton items that extend beyond viewport

---

## Accessibility

All skeleton components include proper ARIA attributes and respect reduced motion preferences:

- Animations automatically disable when `prefers-reduced-motion` is set
- Semantic HTML structure maintained
- Proper contrast ratios in light and dark modes
- Screen reader friendly (marked as loading content)

---

## Dark Mode

All skeleton components automatically adapt to dark mode using CSS custom properties:

- `bg-muted/60` - Base skeleton color
- `bg-muted/40` - Shimmer highlight color
- Maintains proper contrast in both themes
- Smooth transitions when theme changes

---

## Performance

Skeleton components are optimized for performance:

- Pure CSS animations (no JavaScript)
- Minimal re-renders
- Efficient DOM structure
- Tailwind JIT compilation support
- No external dependencies beyond base UI components

---

## Examples

See `loading-skeleton-examples.tsx` for comprehensive examples of all components and usage patterns.

To view examples in your app:
1. Import and render the `LoadingSkeletonExamples` component
2. Navigate to the examples page
3. Review interactive examples and code snippets

---

## Implementation Details

### Animation Configuration

Animations are defined in `tailwind.config.ts`:

```typescript
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' }
  },
  wave: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
},
animation: {
  shimmer: 'shimmer 2s ease-in-out infinite',
  wave: 'wave 2s ease-in-out infinite'
}
```

### Base Skeleton Component

All skeleton components build on the base `Skeleton` component from `@/components/ui/skeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton variant="shimmer" className="h-4 w-24" />
```

---

## Troubleshooting

### Animations not working
- Ensure `tailwind.config.ts` includes the shimmer and wave keyframes
- Check that `tailwindcss-animate` plugin is installed
- Verify CSS is being processed correctly

### Layout shifts
- Match skeleton dimensions to actual content
- Use fixed heights where possible
- Test loading → loaded transition

### Performance issues
- Reduce number of skeleton items
- Use simpler animation variants
- Consider virtualization for long lists

---

## Contributing

When adding new skeleton components:

1. Follow existing naming convention (`Skeleton[ComponentName]`)
2. Support all three animation variants
3. Include comprehensive JSDoc comments
4. Add TypeScript interfaces for all props
5. Include usage examples in examples file
6. Test in both light and dark modes
7. Verify responsive behavior
8. Check accessibility with screen readers

---

## Related Components

- `Skeleton` - Base skeleton primitive
- `Card` - Card container component
- `StatCard` - Stat card component that SkeletonCard mimics
- `Table` - Table component that SkeletonTable mimics
- `ChartContainer` - Chart wrapper that SkeletonChart mimics