# Chart Components Library

A comprehensive collection of chart components for the Voice AI Training dashboard, built with Recharts and styled to match the brand design system.

## Features

- **Brand-aligned colors**: Uses the official brand colors (#9259ED, #CF54EE, #FB8684) and semantic colors
- **Dark mode support**: Fully compatible with the dark mode design system
- **Responsive design**: Mobile-first approach with simplified views on small screens
- **Loading states**: Built-in skeleton loaders for async data
- **Empty states**: User-friendly empty state messages with icons
- **TypeScript**: Fully typed with exported interfaces
- **Accessibility**: Built on accessible Recharts components with proper labeling

## Components

### 1. PerformanceTrendChart

Line or area chart for tracking performance scores over time.

**Features:**
- Line or area chart display with gradient fills
- Configurable data points
- Automatic trend calculation (+/- percentage)
- Average score display
- Total attempts counter
- Responsive grid layout for stats

**Props:**
```typescript
interface PerformanceTrendChartProps {
  data: PerformanceTrendData[];
  title?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  showArea?: boolean;        // Show area chart instead of line
  showDataPoints?: boolean;  // Show dots on data points
  maxScore?: number;         // Maximum score value (default: 100)
}
```

**Usage:**
```tsx
import { PerformanceTrendChart } from "@/components/charts";

const data = [
  { date: "2025-01-01", score: 75, label: "Attempt 1" },
  { date: "2025-01-02", score: 82, label: "Attempt 2" },
  { date: "2025-01-03", score: 88, label: "Attempt 3" },
];

<PerformanceTrendChart
  data={data}
  title="My Performance"
  showArea={true}
  showDataPoints={true}
/>
```

### 2. TeamActivityChart

Bar chart for visualizing team activity metrics.

**Features:**
- Vertical or horizontal bar layouts
- Color-coded categories
- Automatic sorting by value
- Top performer highlight
- Total activity counter
- Category legend
- Configurable value labels

**Props:**
```typescript
interface TeamActivityChartProps {
  data: TeamActivityData[];
  title?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  colorByCategory?: boolean; // Color bars by category
  horizontal?: boolean;      // Horizontal bar chart
  showValues?: boolean;      // Show value labels on bars
}
```

**Usage:**
```tsx
import { TeamActivityChart } from "@/components/charts";

const data = [
  { label: "John Doe", value: 45, category: "completed" },
  { label: "Jane Smith", value: 38, category: "completed" },
  { label: "Bob Wilson", value: 22, category: "inProgress" },
];

<TeamActivityChart
  data={data}
  title="Team Completions"
  colorByCategory={true}
/>
```

**Category Colors:**
- `completed`: Success green
- `inProgress`: Warning yellow
- `pending`: Info blue
- `failed`: Destructive red
- `default`: Primary purple

### 3. KPIMetricsChart

Area chart for tracking multiple KPI metrics over time.

**Features:**
- Multiple metrics on single chart
- Gradient area fills
- Semantic color mapping
- Configurable metric labels
- Average calculations
- Optional stacking
- Legend display
- Data point counter

**Props:**
```typescript
interface KPIMetricsChartProps {
  data: KPIMetricsData[];
  title?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  metrics?: string[];                    // Metric keys to display
  metricLabels?: Record<string, string>; // Custom labels
  metricColors?: Record<string, string>; // Custom colors
  showLegend?: boolean;                  // Show legend (default: true)
  stacked?: boolean;                     // Stack areas
}
```

**Usage:**
```tsx
import { KPIMetricsChart } from "@/components/charts";

const data = [
  { date: "2025-01-01", accuracy: 85, speed: 72, quality: 90 },
  { date: "2025-01-02", accuracy: 88, speed: 75, quality: 92 },
  { date: "2025-01-03", accuracy: 91, speed: 80, quality: 94 },
];

<KPIMetricsChart
  data={data}
  metrics={["accuracy", "speed", "quality"]}
  metricLabels={{
    accuracy: "Accuracy Score",
    speed: "Response Speed",
    quality: "Call Quality"
  }}
  metricColors={{
    accuracy: "hsl(var(--success))",
    speed: "hsl(var(--warning))",
    quality: "hsl(var(--info))"
  }}
  title="KPI Overview"
  showLegend={true}
/>
```

## Data Types

```typescript
// Performance trend data point
interface PerformanceTrendData {
  date: string | Date;
  score: number;
  label?: string;
}

// Team activity data point
interface TeamActivityData {
  label: string;
  value: number;
  category?: string; // "completed" | "inProgress" | "pending" | "failed"
}

// KPI metrics data point
interface KPIMetricsData {
  date: string | Date;
  [key: string]: string | Date | number | undefined; // Dynamic KPI fields
}
```

## Styling

All charts are wrapped in `Card` components with:
- **Font**: Space Grotesk for titles (via `font-headline` class)
- **Spacing**: Consistent padding and gaps
- **Borders**: Subtle borders with rounded corners
- **Colors**: CSS variables for theme compatibility
- **Shadows**: Subtle elevation on hover

### Color Variables

```css
--chart-1: #9259ED  /* Primary purple */
--chart-2: #CF54EE  /* Magenta */
--chart-3: #FB8684  /* Coral */
--success: ...       /* Success green */
--warning: ...       /* Warning yellow */
--info: ...          /* Info blue */
```

## Responsive Behavior

### Mobile (< 768px)
- Simplified axis labels
- Truncated text
- Stacked stat cards
- Reduced chart height
- Simplified tooltips

### Desktop (≥ 768px)
- Full labels
- Grid layouts
- Detailed tooltips
- Optimal chart heights

## Best Practices

1. **Data Preparation**: Format dates and numbers before passing to charts
2. **Loading States**: Always provide `isLoading` prop when fetching data
3. **Empty States**: Charts automatically handle empty data arrays
4. **Performance**: Memoize data transformations for large datasets
5. **Accessibility**: Provide descriptive titles and descriptions
6. **Colors**: Use semantic colors for meaningful data categories

## Examples

### Dashboard Page
```tsx
import {
  PerformanceTrendChart,
  TeamActivityChart,
  KPIMetricsChart
} from "@/components/charts";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PerformanceTrendChart
        data={performanceData}
        isLoading={isLoading}
        className="md:col-span-2"
      />
      <TeamActivityChart
        data={teamData}
        isLoading={isLoading}
      />
      <KPIMetricsChart
        data={kpiData}
        isLoading={isLoading}
        metrics={["accuracy", "speed"]}
      />
    </div>
  );
}
```

## Dependencies

- `recharts`: ^2.15.4
- `lucide-react`: For icons
- `framer-motion`: For Card animations
- ShadCN UI components: Card, Skeleton, Chart utilities

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android