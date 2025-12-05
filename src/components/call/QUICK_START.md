# Call Cancellation - Quick Start

## TL;DR

Three new components for handling call cancellation:

1. **CancelAttemptDialog** - Confirmation before cancelling
2. **PostCallStatusModal** - Classify short calls (15-60s)
3. **Updated CallControls** - Cancel button added

---

## Minimal Integration (5 minutes)

### 1. Import Components
```typescript
import {
  LiveCallInterface,
  PostCallStatusModal,
  type CallCompletionReason
} from "@/components/call"
```

### 2. Add State
```typescript
const [showPostCallModal, setShowPostCallModal] = useState(false)
```

### 3. Handle Cancellation
```typescript
const handleCancelAttempt = async () => {
  await fetch(`/api/attempts/${attemptId}`, { method: 'DELETE' })
  router.push(`/scenarios/${scenarioId}`)
}
```

### 4. Handle Short Calls
```typescript
const handleCallEnded = () => {
  if (duration >= 15 && duration <= 60) {
    setShowPostCallModal(true)
  } else {
    router.push(`/attempts/${attemptId}`)
  }
}

const handlePostCallComplete = async (reason: CallCompletionReason) => {
  if (reason === 'cancelled') {
    await handleCancelAttempt()
    return
  }

  await fetch(`/api/attempts/${attemptId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      completion_reason: reason,
      is_practice: reason === 'practice',
      has_technical_issue: reason === 'technical'
    })
  })

  router.push(`/attempts/${attemptId}`)
}
```

### 5. Render Components
```typescript
<>
  <LiveCallInterface
    {...props}
    onCancelAttempt={handleCancelAttempt}
  />

  <PostCallStatusModal
    open={showPostCallModal}
    onOpenChange={setShowPostCallModal}
    onComplete={handlePostCallComplete}
    duration={duration}
  />
</>
```

---

## API Endpoints Needed

### DELETE /api/attempts/[attemptId]
```typescript
export async function DELETE(request: Request, { params }: { params: { attemptId: string } }) {
  // Delete the attempt
  // Verify user owns it
  // Return success
}
```

### PATCH /api/attempts/[attemptId]/status
```typescript
export async function PATCH(request: Request, { params }: { params: { attemptId: string } }) {
  // Update completion_reason, is_practice, has_technical_issue
  // Return updated attempt
}
```

---

## Database Schema (Optional but Recommended)

```sql
ALTER TABLE scenario_attempts
ADD COLUMN completion_reason TEXT,
ADD COLUMN is_practice BOOLEAN DEFAULT FALSE,
ADD COLUMN has_technical_issue BOOLEAN DEFAULT FALSE;
```

---

## Props Reference

### PostCallStatusModal
```typescript
{
  open: boolean                              // Control visibility
  onOpenChange: (open: boolean) => void     // Close handler
  onComplete: (reason) => void              // Selection handler
  duration: number                          // Call duration in seconds
}
```

### CallCompletionReason Type
```typescript
"complete" | "practice" | "technical" | "cancelled"
```

### LiveCallInterface (New Prop)
```typescript
{
  onCancelAttempt?: () => void  // Optional callback
}
```

---

## Full Example

See `USAGE_EXAMPLES.tsx` for complete implementations.

---

## Visual Preview

**Cancel Button** (bottom of call screen):
```
[  Timer  ] [Mute] [End Call] [Volume]

           [X] Cancel Attempt
```

**Post-Call Modal** (short calls only):
```
┌────────────────────────────────────┐
│        Mark This Attempt?          │
│   This was a short call (0:35)     │
│                                    │
│  ✓ Count as Complete [Recommended] │
│  🧪 Mark as Practice               │
│  ⚠ Technical Issue                 │
│                                    │
│  Cancel Attempt (link)             │
└────────────────────────────────────┘
```

---

## Common Issues

**Q: Cancel button not showing?**
A: Pass `onCancelAttempt` prop to `LiveCallInterface`

**Q: Modal not appearing for short calls?**
A: Check duration logic in `onCallEnded` handler

**Q: TypeScript errors?**
A: Import `CallCompletionReason` type from `@/components/call`

---

## More Info

- **Full docs**: See `INTEGRATION_GUIDE.md`
- **Examples**: See `USAGE_EXAMPLES.tsx`
- **Design specs**: See `COMPONENT_DESIGN.md`
