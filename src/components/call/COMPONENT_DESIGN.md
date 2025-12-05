# Call Attempt Cancellation - UI Component Design

## Component Overview

This document describes the visual design and UX patterns for the call attempt cancellation feature.

---

## 1. Cancel Attempt Button (in CallControls)

### Location
- Appears in the CallControls component at the bottom of the call screen
- Positioned in a secondary row below the main call controls
- Centered horizontally

### Visual Design
```
┌─────────────────────────────────────────────────────────────┐
│                   [Timer] [Mute] [End] [Volume]            │
│                                                             │
│              [X] Cancel Attempt (ghost button)             │
└─────────────────────────────────────────────────────────────┘
```

### Styling Details
- **Variant**: `ghost` - minimal visual weight
- **Size**: `sm` - smaller than primary controls
- **Icon**: `XCircle` from lucide-react (16px)
- **Text Color**: `text-muted-foreground` by default
- **Hover State**: `hover:text-destructive hover:bg-destructive/10`
- **Disabled State**: Grayed out when call is ending

### Accessibility
- ARIA label: "Cancel Attempt"
- Keyboard accessible
- Clear focus indicators
- Screen reader announces: "Cancel this training attempt"

---

## 2. Cancel Attempt Confirmation Dialog

### Visual Design
```
┌──────────────────────────────────────────────┐
│                                              │
│       Cancel This Attempt?                   │
│                                              │
│   This call will not be saved or counted.   │
│   Are you sure you want to cancel?          │
│                                              │
│   [  Go Back  ]    [ Yes, Cancel ]          │
│                                              │
└──────────────────────────────────────────────┘
```

### Styling Details
- **Size**: `sm` (320px max width on desktop)
- **Title**: "Cancel This Attempt?" - font-headline, text-lg
- **Description**: Two sentences explaining the action
- **Primary Action**: "Go Back" (outline variant) - encourages continuation
- **Destructive Action**: "Yes, Cancel" (destructive variant, red)

### Button Order (RTL friendly)
- Left: "Go Back" (safe action, outline)
- Right: "Yes, Cancel" (destructive, red)

### Accessibility
- Focus trap within dialog
- Escape key closes dialog (same as "Go Back")
- Title announced to screen readers
- Clear visual hierarchy discourages accidental cancellation

---

## 3. Post-Call Status Modal

### Visual Design
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    [Clock Icon]                            │
│                                                            │
│              Mark This Attempt?                            │
│                                                            │
│   This was a short call (0:35). How would you like to     │
│   record this session?                                     │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│   ┌──────────────────────────────────────────────────┐   │
│   │ ✓  Count as Complete          [Recommended]      │   │
│   │    Save and score normally. Best for brief       │   │
│   │    but meaningful interactions.                  │   │
│   └──────────────────────────────────────────────────┘   │
│                                                            │
│   ┌──────────────────────────────────────────────────┐   │
│   │ 🧪  Mark as Practice                             │   │
│   │    Save for reference, but don't count toward    │   │
│   │    your score.                                   │   │
│   └──────────────────────────────────────────────────┘   │
│                                                            │
│   ┌──────────────────────────────────────────────────┐   │
│   │ ⚠  Technical Issue                               │   │
│   │    Save for review, flag as having technical     │   │
│   │    problems. Your manager will be notified.      │   │
│   └──────────────────────────────────────────────────┘   │
│                                                            │
│  ─────────────────────────────────────────────────────    │
│                                                            │
│                [X] Cancel Attempt                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Top Section
- **Icon**: Clock icon in warning color, 64px, centered
- **Title**: "Mark This Attempt?" - font-headline, text-xl, centered
- **Description**: Shows duration, explains context
- **Separator**: Horizontal line for visual separation

### Option Cards
Each option is a large, tappable button with:
- **Border**: 2px border, rounded-lg
- **Padding**: 16px all around
- **Hover State**: `border-primary`, `bg-primary/5`
- **Focus State**: Ring with offset for keyboard navigation

**Card Structure:**
```
┌──────────────────────────────────────────────┐
│ [Icon]  Title                   [Badge]     │
│         Description text                    │
└──────────────────────────────────────────────┘
```

**Icons (40px rounded circles):**
- Complete: Green check (`CheckCircle2`) in `bg-success/10`
- Practice: Blue flask (`FlaskConical`) in `bg-primary/10`
- Technical: Orange warning (`AlertTriangle`) in `bg-warning/10`

**Badges:**
- "Recommended" on "Count as Complete" option
- Primary color, small size

### Bottom Section
- **Separator**: Another horizontal line
- **Cancel Link**: Ghost button, centered, small, muted color
- **Icon**: `XCircle` 16px
- **Text**: "Cancel Attempt"

### Sizing
- **Desktop**: 480px max width
- **Mobile**: Full width minus 32px margins
- **Height**: Auto, scrollable if needed

### Accessibility
- No close button in header (forces choice)
- Each option is keyboard accessible
- Clear visual feedback on hover/focus
- Screen reader describes each option fully
- Recommended option marked with ARIA
- Cancel option less prominent (doesn't encourage it)

---

## Visual Hierarchy Principles

### Primary Actions (Encouraged)
1. "Count as Complete" - Most prominent, recommended badge
2. "Mark as Practice" - Secondary option
3. "Technical Issue" - Tertiary option

### Destructive/Discouraged Actions
4. "Cancel Attempt" - Least prominent, ghost button, bottom

### Color System
- **Success/Encouraged**: Green (`success` color)
- **Neutral Options**: Primary blue
- **Warning**: Orange for technical issues
- **Destructive**: Red for cancellation

---

## Responsive Design

### Desktop (≥768px)
- Modal: 480px centered
- Options: Full width cards with icons on left
- Two-column button layout where applicable

### Mobile (<768px)
- Modal: Full width minus safe margins
- Options: Stacked vertically, full width
- Single column for all buttons
- Touch-friendly 44px minimum tap targets
- Reduced padding for smaller screens

---

## Animation & Transitions

### Modal Entry
- Fade in overlay: 200ms ease-out
- Scale in content: 200ms ease-out from 95%
- Initial scale: 0.95, Final: 1.0

### Option Hover
- Border color transition: 150ms
- Background color transition: 150ms
- Slight scale on active state (touch feedback)

### Icon Transitions
- Icon background color: 200ms on hover

---

## Dark Mode Considerations

All components support dark mode:
- Proper contrast ratios maintained (WCAG AA)
- Border colors adjust for visibility
- Icon backgrounds remain visible
- Text remains readable
- Focus indicators clearly visible

---

## States & Error Handling

### Loading States
- Buttons show loading spinner when processing
- Disabled state while API calls are in flight

### Error States
- Toast notification if cancellation fails
- User can retry or dismiss
- Error doesn't block UI

### Success States
- Immediate navigation on successful action
- No success toast needed (action is obvious)

---

## Implementation Notes

### Component Props
All components use TypeScript strict mode:
- Required props clearly marked
- Optional props with default values
- Callback types properly defined

### Performance
- Components are client-side only (`"use client"`)
- Minimal re-renders with proper state management
- No unnecessary animations

### Testing Recommendations
1. Test all dialog states (open/close)
2. Test keyboard navigation through options
3. Test with screen readers
4. Test on mobile and desktop viewports
5. Test dark mode appearance
6. Test error handling flows
