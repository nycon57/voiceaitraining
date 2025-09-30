# Design System and Brand Guidelines

## Overview

The Voice AI Training platform design system ensures consistency, accessibility, and quality across all user touchpoints. This document defines our visual identity, component library, and design principles.

**Design Philosophy**: Professional, modern, trustworthy, approachable
**Target Audience**: Sales professionals, managers, HR teams
**Last Updated**: September 29, 2025

---

## Brand Identity

### Brand Personality

**Core Attributes**:
- **Professional**: Enterprise-grade quality and reliability
- **Empowering**: Tools that make reps better, not replace them
- **Results-Driven**: Focus on measurable improvement and ROI
- **Innovative**: Cutting-edge AI technology, easy to use
- **Supportive**: Coaching, not judging

**Voice and Tone**:
- Clear and direct (avoid jargon)
- Encouraging and constructive
- Confident but not arrogant
- Expert but approachable
- Action-oriented

---

## Logo and Identity

### Logo Variations

**Primary Logo**: Full color with wordmark
- Use on light backgrounds
- Minimum width: 120px
- Clear space: Logo height × 0.5 on all sides

**Logo Mark Only**: Icon without wordmark
- For favicons, app icons, social avatars
- Minimum size: 32px × 32px

**Monochrome**: Black or white versions
- Use when color is not available
- Maintain same clear space rules

**File Formats**:
- SVG (preferred for web)
- PNG (with transparent background)
- PDF (for print)

**Location**: `/public/logos/`

---

## Color Palette

### Primary Colors

**Brand Blue** – Primary brand color
- Hex: `#0066FF`
- RGB: `0, 102, 255`
- Tailwind: `blue-600`
- Usage: Primary buttons, links, key actions

**Dark Blue** – Headers and emphasis
- Hex: `#0047B3`
- RGB: `0, 71, 179`
- Tailwind: `blue-700`
- Usage: Hover states, headings

### Neutral Colors

**Slate** – Text and UI elements
- `#1E293B` (slate-800) – Primary text
- `#475569` (slate-600) – Secondary text
- `#94A3B8` (slate-400) – Muted text
- `#E2E8F0` (slate-200) – Borders
- `#F8FAFC` (slate-50) – Backgrounds

### Semantic Colors

**Success Green**
- Hex: `#10B981`
- Tailwind: `green-500`
- Usage: Success messages, positive scores, completion states

**Warning Yellow**
- Hex: `#F59E0B`
- Tailwind: `amber-500`
- Usage: Warnings, medium priority alerts

**Error Red**
- Hex: `#EF4444`
- Tailwind: `red-500`
- Usage: Errors, destructive actions, low scores

**Info Blue**
- Hex: `#3B82F6`
- Tailwind: `blue-500`
- Usage: Informational messages, hints

### Accent Colors

**Purple** – Premium features
- Hex: `#8B5CF6`
- Tailwind: `violet-500`

**Teal** – Analytics and insights
- Hex: `#14B8A6`
- Tailwind: `teal-500`

---

## Typography

### Font Stack

**Primary Font**: Inter
- Usage: Body text, UI labels, buttons
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Import: `next/font/google`

**Monospace Font**: JetBrains Mono
- Usage: Code blocks, technical data
- Weight: 400 (regular)

**Implementation**:
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      {children}
    </html>
  )
}
```

### Type Scale

| Size | Tailwind | Line Height | Usage |
|------|----------|-------------|-------|
| 12px | text-xs | 16px | Captions, helper text |
| 14px | text-sm | 20px | Body small, labels |
| 16px | text-base | 24px | Body, default |
| 18px | text-lg | 28px | Lead paragraph |
| 20px | text-xl | 28px | Section titles |
| 24px | text-2xl | 32px | Card headings |
| 30px | text-3xl | 36px | Page headings |
| 36px | text-4xl | 40px | Hero headings |
| 48px | text-5xl | 48px | Marketing headlines |

### Typography Rules

**Hierarchy**:
- One H1 per page
- Use semantic HTML (h1-h6, p, span)
- Consistent line-height for readability

**Accessibility**:
- Minimum font size: 14px (text-sm)
- Body text: 16px (text-base)
- Line length: Max 75 characters for readability
- Color contrast: AA standard minimum (4.5:1)

---

## Spacing System

Based on 4px base unit:

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | space-1 | Tight spacing |
| sm | 8px | space-2 | Form input padding |
| md | 16px | space-4 | Card padding, gaps |
| lg | 24px | space-6 | Section spacing |
| xl | 32px | space-8 | Large gaps |
| 2xl | 48px | space-12 | Page sections |
| 3xl | 64px | space-16 | Hero spacing |

**Consistent Spacing**:
- Card padding: `p-6` (24px)
- Form field spacing: `space-y-4` (16px between fields)
- Section spacing: `space-y-12` (48px between sections)

---

## Component Library

### Buttons

**Primary Button**:
```tsx
<Button variant="default" size="default">
  Get Started
</Button>
```
- Background: `bg-blue-600`
- Hover: `hover:bg-blue-700`
- Text: White
- Usage: Primary CTAs, form submissions

**Secondary Button**:
```tsx
<Button variant="outline" size="default">
  Learn More
</Button>
```
- Border: `border-slate-300`
- Hover: `hover:bg-slate-50`
- Text: `text-slate-700`
- Usage: Secondary actions

**Destructive Button**:
```tsx
<Button variant="destructive" size="default">
  Delete
</Button>
```
- Background: `bg-red-600`
- Usage: Delete, remove, cancel actions

**Button Sizes**:
- `sm` – 32px height, text-sm
- `default` – 40px height, text-base
- `lg` – 48px height, text-lg

---

### Cards

**Standard Card**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Card Styles**:
- Background: White
- Border: `border-slate-200`
- Border radius: `rounded-lg` (8px)
- Shadow: `shadow-sm`
- Padding: `p-6`

---

### Forms

**Input Field**:
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
  <p className="text-xs text-slate-500">Helper text</p>
</div>
```

**Input Styling**:
- Height: 40px
- Border: `border-slate-300`
- Focus: `ring-2 ring-blue-500`
- Disabled: `bg-slate-50 cursor-not-allowed`

**Form Layout**:
- Vertical spacing: `space-y-4`
- Label above input
- Error message below input in red
- Submit button right-aligned

---

### Tables

**Data Table**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Score</TableHead>
      <TableHead>Date</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>87</TableCell>
      <TableCell>Sep 29, 2025</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Table Styling**:
- Header background: `bg-slate-50`
- Row hover: `hover:bg-slate-50`
- Borders: `border-b border-slate-200`
- Padding: `px-4 py-3`

---

### Badges

**Status Badges**:
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="outline">Pending</Badge>
```

**Badge Sizes**:
- Default: `text-xs` (12px), `px-2 py-1`
- Large: `text-sm` (14px), `px-3 py-1`

---

### Toasts

**Success Toast**:
```tsx
toast.success("Scenario created successfully!")
```

**Error Toast**:
```tsx
toast.error("Failed to save changes. Please try again.")
```

**Position**: Bottom-right
**Duration**: 5 seconds
**Max visible**: 3 toasts

---

## Iconography

**Icon Library**: Lucide React

**Icon Sizes**:
- Small: 16px (`size={16}`)
- Default: 20px (`size={20}`)
- Large: 24px (`size={24}`)

**Icon Usage**:
- Use sparingly for clarity
- Always pair with text labels
- Maintain consistent stroke width (2px)

**Common Icons**:
- Home: `Home`
- User: `User`
- Settings: `Settings`
- Check: `Check`
- X: `X`
- Plus: `Plus`
- Search: `Search`

---

## Accessibility

### Color Contrast

**Text on Background**:
- Body text on white: Must be ≥ 4.5:1 (AA)
- Large text on white: Must be ≥ 3:1 (AAA)
- Link text: `text-blue-600` passes AA

**Testing**:
```bash
# Use Chrome DevTools Lighthouse
# Or online tool: WebAIM Contrast Checker
```

---

### Keyboard Navigation

**Focus States**:
- All interactive elements must have visible focus
- Use `ring-2 ring-blue-500 ring-offset-2`
- Never remove focus outline without alternative

**Tab Order**:
- Logical tab order (top to bottom, left to right)
- Skip links for long navigation
- Modal traps focus inside

---

### Screen Readers

**Semantic HTML**:
- Use `<button>` not `<div onClick>`
- Use `<label>` for form inputs
- Use `<nav>`, `<main>`, `<aside>`

**ARIA Labels**:
```tsx
<button aria-label="Close dialog">
  <X />
</button>

<input
  type="text"
  aria-describedby="email-helper"
/>
<p id="email-helper">We'll never share your email</p>
```

---

## Dark Mode

**Strategy**: Preparation for dark mode (not yet implemented)

**CSS Variables**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

**Implementation**:
- Use CSS variables for all colors
- Test all components in dark mode
- Ensure contrast ratios maintained

---

## Animation and Motion

### Principles

**Purposeful**: Every animation should have a reason
**Fast**: Keep durations <300ms for UI transitions
**Natural**: Use easing functions for realistic motion

### Transitions

**Default Transition**:
```tsx
className="transition-colors duration-200"
```

**Hover Effects**:
- Scale: `hover:scale-105 transition-transform`
- Opacity: `hover:opacity-80 transition-opacity`
- Background: `hover:bg-slate-50 transition-colors`

**Page Transitions**:
```tsx
import { ViewTransitions } from 'next-view-transitions'

// Enabled via next-view-transitions package
```

---

## Responsive Design

### Breakpoints

| Name | Min Width | Tailwind | Usage |
|------|-----------|----------|-------|
| Mobile | 0px | (default) | Mobile-first default |
| Tablet | 768px | md: | Tablet portrait |
| Desktop | 1024px | lg: | Desktop |
| Large | 1280px | xl: | Large desktop |
| XL | 1536px | 2xl: | Extra large screens |

### Mobile-First Approach

**Example**:
```tsx
<div className="flex flex-col md:flex-row lg:gap-8">
  {/* Mobile: Stack vertically */}
  {/* Tablet+: Side by side */}
</div>
```

**Guidelines**:
- Design for mobile first
- Progressively enhance for larger screens
- Test on real devices, not just browser resize

---

## Design Tokens

**Location**: `src/styles/globals.css`

**Example**:
```css
@layer base {
  :root {
    --radius: 0.5rem;
    --border: hsl(214.3 31.8% 91.4%);
    --input: hsl(214.3 31.8% 91.4%);
    --ring: hsl(222.2 84% 4.9%);
  }
}
```

---

## Grid System

**Container**:
```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
  {/* Content */}
</div>
```

**Grid Layouts**:
```tsx
{/* 2 column on tablet, 3 column on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

---

## Usage Guidelines

### Do's

✅ Use ShadCN/UI components as base
✅ Follow spacing system consistently
✅ Test accessibility on every PR
✅ Maintain color contrast ratios
✅ Use semantic HTML
✅ Keep animations subtle and fast

### Don'ts

❌ Don't use hardcoded colors (use Tailwind classes)
❌ Don't remove focus outlines without alternative
❌ Don't use `<div>` where semantic element exists
❌ Don't create custom components when ShadCN exists
❌ Don't exceed 75 characters per line of text
❌ Don't use animations >500ms

---

## Design Resources

**Figma File**: [Link to Figma design system]
**Component Playground**: `/admin/design-system`
**Storybook**: (Coming soon)

**External Tools**:
- ShadCN/UI: https://ui.shadcn.com
- Tailwind CSS: https://tailwindcss.com
- Lucide Icons: https://lucide.dev
- Radix Primitives: https://radix-ui.com

---

## Version History

- **v0.1** (Sep 29, 2025) - Initial design system documentation
- **v0.2** (Planned) - Dark mode implementation
- **v0.3** (Planned) - Mobile app design tokens