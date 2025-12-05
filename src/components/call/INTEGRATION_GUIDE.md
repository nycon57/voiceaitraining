# Call Attempt Cancellation - Integration Guide

## Overview

This guide explains how to integrate the new call attempt cancellation UI components into your call page.

## New Components

### 1. CancelAttemptDialog
Location: `src/components/call/CancelAttemptDialog.tsx`

A simple confirmation dialog for canceling an attempt.

**Props:**
- `open`: boolean - Controls dialog visibility
- `onOpenChange`: (open: boolean) => void - Callback when dialog state changes
- `onConfirm`: () => void - Callback when user confirms cancellation

### 2. PostCallStatusModal
Location: `src/components/call/PostCallStatusModal.tsx`

A modal shown after short calls (15-60 seconds) to let users choose how to classify the attempt.

**Props:**
- `open`: boolean - Controls modal visibility
- `onOpenChange`: (open: boolean) => void - Callback when modal state changes
- `onComplete`: (reason: CallCompletionReason) => void - Callback with selected reason
- `duration`: number - Call duration in seconds

**CallCompletionReason type:**
- `"complete"` - Count as a normal completed attempt
- `"practice"` - Mark as practice (saved but not scored)
- `"technical"` - Flag as technical issue
- `"cancelled"` - Cancel the attempt entirely

### 3. Updated CallControls
The CallControls component now includes an optional "Cancel Attempt" button.

**New Props:**
- `onCancelAttempt?`: () => void - Optional callback for canceling attempt

## Integration Example

Here's how to integrate these components into your call page:

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LiveCallInterface } from "@/components/call/LiveCallInterface"
import { PostCallStatusModal, CallCompletionReason } from "@/components/call/PostCallStatusModal"
import { useVapiCall } from "@/hooks/useVapiCall"

export default function CallPage({ params }: { params: { scenarioId: string } }) {
  const router = useRouter()
  const [showPostCallModal, setShowPostCallModal] = useState(false)

  const {
    status,
    transcript,
    kpis,
    isMuted,
    toggleMute,
    endCall,
    // ... other hook values
  } = useVapiCall({
    scenarioId: params.scenarioId,
    onCallEnded: handleCallEnded,
  })

  // Handle normal call end
  function handleCallEnded() {
    // Check if call was very short (15-60 seconds)
    if (kpis.duration >= 15 && kpis.duration <= 60) {
      setShowPostCallModal(true)
    } else {
      // Normal flow - proceed to analysis
      router.push(\`/attempts/\${attemptId}\`)
    }
  }

  // Handle cancellation
  async function handleCancelAttempt() {
    try {
      // End the call immediately
      await endCall()

      // Delete the attempt from the database
      await fetch(\`/api/attempts/\${attemptId}\`, {
        method: 'DELETE'
      })

      // Redirect back to scenario page
      router.push(\`/scenarios/\${params.scenarioId}\`)
    } catch (error) {
      console.error('Failed to cancel attempt:', error)
    }
  }

  // Handle post-call status selection
  async function handlePostCallComplete(reason: CallCompletionReason) {
    if (reason === 'cancelled') {
      // User chose to cancel from the modal
      await handleCancelAttempt()
      return
    }

    try {
      // Update attempt with the selected reason
      await fetch(\`/api/attempts/\${attemptId}/status\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reason,
          is_practice: reason === 'practice',
          has_technical_issue: reason === 'technical',
        })
      })

      // Proceed to analysis screen
      router.push(\`/attempts/\${attemptId}\`)
    } catch (error) {
      console.error('Failed to update attempt status:', error)
    }
  }

  return (
    <>
      <LiveCallInterface
        scenario={scenario}
        user={user}
        status={status}
        transcript={transcript}
        kpis={kpis}
        isMuted={isMuted}
        isAgentSpeaking={isAgentSpeaking}
        isUserSpeaking={isUserSpeaking}
        volume={volume}
        onToggleMute={toggleMute}
        onEndCall={endCall}
        onCancelAttempt={handleCancelAttempt}  // Add this
        onVolumeChange={setVolume}
      />

      <PostCallStatusModal
        open={showPostCallModal}
        onOpenChange={setShowPostCallModal}
        onComplete={handlePostCallComplete}
        duration={kpis.duration}
      />
    </>
  )
}
```

## Database Schema Additions

You may want to add these fields to your `scenario_attempts` table:

```sql
ALTER TABLE scenario_attempts
ADD COLUMN is_practice BOOLEAN DEFAULT FALSE,
ADD COLUMN has_technical_issue BOOLEAN DEFAULT FALSE,
ADD COLUMN completion_reason TEXT;
```

## API Endpoints to Create

### DELETE /api/attempts/[attemptId]
Permanently delete a cancelled attempt.

### PATCH /api/attempts/[attemptId]/status
Update attempt status with completion reason.

```typescript
// Request body
{
  status: "complete" | "practice" | "technical" | "cancelled",
  is_practice: boolean,
  has_technical_issue: boolean
}
```

## User Flow

### Normal Flow (60+ seconds)
1. User clicks "End Call"
2. System saves and analyzes attempt
3. User sees analysis screen

### Short Call Flow (15-60 seconds)
1. User clicks "End Call"
2. PostCallStatusModal appears
3. User selects option:
   - **Count as Complete**: Normal analysis
   - **Mark as Practice**: Saved, not scored
   - **Technical Issue**: Flagged for review
   - **Cancel Attempt**: Deleted entirely

### Cancellation Flow (anytime)
1. User clicks "Cancel Attempt"
2. CancelAttemptDialog appears for confirmation
3. If confirmed: attempt deleted, redirects to scenario

## Styling Notes

- All components follow the existing ShadCN/UI design system
- Responsive design works on mobile and desktop
- Proper ARIA labels for accessibility
- Destructive actions use appropriate visual hierarchy (less prominent)
- Primary actions are highlighted (e.g., "Count as Complete")

## Next Steps

1. Add the new optional fields to your database schema
2. Create the DELETE and PATCH API endpoints
3. Update your call page to integrate these components
4. Test the flows thoroughly on both mobile and desktop
5. Consider adding analytics events for tracking cancellation rates
