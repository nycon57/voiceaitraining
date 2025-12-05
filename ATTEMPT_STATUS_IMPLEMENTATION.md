# Call Attempt Status Management - Implementation Summary

## Overview
This document describes the implementation of comprehensive status management for call attempts, including status updates, validation, and filtering capabilities.

## Status Values

The following status values are now supported for scenario attempts:

- **`completed`** - Successfully completed attempt that counts toward performance
- **`cancelled`** - User cancelled the call before completion (or auto-cancelled if < 15 seconds)
- **`practice`** - Practice attempt that does not count toward scoring
- **`technical_issue`** - Attempt failed due to technical problems

## Implementation Details

### 1. Type Updates

**File:** `/src/types/attempt.ts`

Updated `AttemptStatus` type to include new status values:
```typescript
export type AttemptStatus = 'completed' | 'cancelled' | 'practice' | 'technical_issue'
```

The database field is `attempt_status` in the `scenario_attempts` table.

### 2. Updated `/api/calls/end` Endpoint

**File:** `/src/app/api/calls/end/route.ts`

#### New Features:
- **Optional `status` parameter** in request body (defaults to `'completed'`)
- **Auto-discard logic**: Calls < 15 seconds are automatically set to `'cancelled'`
- **Conditional artifact saving**: Transcript and recording are NOT saved for cancelled attempts
- **Status-aware response**: Returns the final status and a message if auto-cancelled

#### Request Schema:
```typescript
{
  attemptId: string (uuid),
  transcript: array,
  duration: number,
  recordingUrl?: string (url),
  status?: 'completed' | 'cancelled' | 'practice' | 'technical_issue'
}
```

#### Response Schema:
```typescript
{
  success: boolean,
  attemptId: string,
  recordingUrl?: string,
  status: AttemptStatus,
  message?: string  // Only present if auto-cancelled
}
```

#### Auto-Discard Logic:
```typescript
if (duration < 15) {
  finalStatus = 'cancelled'
  // Transcript and recording are NOT saved
  // Message returned: "Call was too short and has been automatically cancelled"
}
```

### 3. New `/api/attempts/[attemptId]/status` Endpoint

**File:** `/src/app/api/attempts/[attemptId]/status/route.ts`

#### Method: PATCH

#### Purpose:
Allows users to update the status of their own attempts with time-based and analysis-based restrictions.

#### Request Schema:
```typescript
{
  status: 'completed' | 'cancelled' | 'practice' | 'technical_issue'
}
```

#### Validation Rules:
1. **Ownership validation**: User must own the attempt (org_id + clerk_user_id match)
2. **Time restriction**: Can only update status within 5 minutes of attempt creation
3. **Analysis restriction**: Cannot change status if attempt has already been analyzed (has a score)

#### Response Schema:
```typescript
{
  success: boolean,
  attempt: ScenarioAttempt
}
```

#### Error Responses:
- `404` - Attempt not found or access denied
- `403` - Time limit exceeded (> 5 minutes) or attempt already analyzed
- `400` - Invalid request body

### 4. Updated `/api/calls/analyze` Endpoint

**File:** `/src/app/api/calls/analyze/route.ts`

#### New Validation:
Analysis now **skips non-completed attempts** and returns an error response:

```typescript
if (attempt.attempt_status !== 'completed') {
  return Response(400, {
    error: 'Analysis skipped',
    message: `Cannot analyze attempts with status '${attempt.attempt_status}'. Only completed attempts can be analyzed.`,
    status: attempt.attempt_status
  })
}
```

This prevents wasted API calls and ensures only meaningful attempts are analyzed.

### 5. Updated `/api/scenarios/[scenarioId]/attempts` Endpoint

**File:** `/src/app/api/scenarios/[scenarioId]/attempts/route.ts`

#### New Query Parameter: `status`

**Values:**
- `completed` (default) - Show only completed attempts
- `cancelled` - Show only cancelled attempts
- `practice` - Show only practice attempts
- `technical_issue` - Show only attempts with technical issues
- `all` - Show all attempts (managers only)

#### Role-Based Access:
- **Regular users (trainees)**: Can filter by specific status, default to `completed`
- **Managers/Admins/HR**: Can use `status=all` to see all attempt statuses

#### Request Example:
```bash
GET /api/scenarios/{scenarioId}/attempts?status=all
GET /api/scenarios/{scenarioId}/attempts?status=practice
GET /api/scenarios/{scenarioId}/attempts  # defaults to completed
```

#### Response Schema:
```typescript
{
  attempts: AttemptStat[],
  statistics: {
    totalAttempts: number,
    averageScore: number,
    bestScore: number,
    firstScore: number,
    latestScore: number,
    improvement: number
  },
  filters: {
    statusFilter: string,
    isManager: boolean
  }
}
```

#### Permissions:
```typescript
if (statusFilter === 'all' && !isManager) {
  return Response(403, {
    error: 'Insufficient permissions to view all attempt statuses'
  })
}
```

## API Usage Examples

### 1. End a call with explicit status
```typescript
POST /api/calls/end
{
  "attemptId": "uuid",
  "transcript": [...],
  "duration": 180,
  "recordingUrl": "https://...",
  "status": "practice"
}
```

### 2. End a call (auto-cancelled if too short)
```typescript
POST /api/calls/end
{
  "attemptId": "uuid",
  "transcript": [...],
  "duration": 12,  // < 15 seconds
  "recordingUrl": "https://..."
  // No status provided, but will be auto-cancelled
}

// Response:
{
  "success": true,
  "attemptId": "uuid",
  "status": "cancelled",
  "message": "Call was too short and has been automatically cancelled"
}
```

### 3. Update attempt status (within 5 minutes)
```typescript
PATCH /api/attempts/{attemptId}/status
{
  "status": "technical_issue"
}

// Response:
{
  "success": true,
  "attempt": { ... }
}
```

### 4. Get attempts with status filter
```typescript
// Get only completed attempts (default)
GET /api/scenarios/{scenarioId}/attempts

// Get only practice attempts
GET /api/scenarios/{scenarioId}/attempts?status=practice

// Get all attempts (managers only)
GET /api/scenarios/{scenarioId}/attempts?status=all
```

### 5. Analyze attempt (only works for completed)
```typescript
POST /api/calls/analyze
{
  "attemptId": "uuid",
  "transcript": [...],
  "kpis": { ... }
}

// If attempt status is not 'completed':
{
  "error": "Analysis skipped",
  "message": "Cannot analyze attempts with status 'practice'. Only completed attempts can be analyzed.",
  "status": "practice"
}
```

## Database Schema

The `scenario_attempts` table should have the following field:

```sql
attempt_status VARCHAR NOT NULL DEFAULT 'in_progress'
  CHECK (attempt_status IN ('in_progress', 'completed', 'failed', 'cancelled', 'practice', 'technical_issue'))
```

## Business Logic Summary

### Status Workflow
1. **Attempt Created** → `in_progress`
2. **Call Ends** → Determines final status:
   - Duration < 15s → Auto `cancelled`
   - Explicit status provided → Uses that status
   - No status provided → `completed`
3. **Post-Call**:
   - Only `completed` attempts can be analyzed
   - Only non-analyzed attempts can have status updated
   - Status updates restricted to 5-minute window

### Artifact Handling
- **Cancelled attempts**: No transcript or recording saved
- **Other statuses**: Full transcript and recording saved

### Filtering & Visibility
- **Trainees**: See only their own attempts, filtered by specific status
- **Managers**: Can see `all` statuses for team oversight

## Rate Limiting Considerations

The status update endpoint (`PATCH /api/attempts/[attemptId]/status`) should have rate limiting to prevent abuse:
- Recommended: 10 requests per minute per user
- Time-based restriction (5 minutes) provides natural rate limiting

## Testing Checklist

- [ ] Test auto-cancel for calls < 15 seconds
- [ ] Test explicit status override
- [ ] Test status update within 5-minute window
- [ ] Test status update rejection after 5 minutes
- [ ] Test status update rejection for analyzed attempts
- [ ] Test analysis rejection for non-completed attempts
- [ ] Test status filtering for trainees
- [ ] Test `status=all` for managers
- [ ] Test `status=all` rejection for trainees
- [ ] Verify no transcript/recording saved for cancelled attempts

## Security Considerations

1. **Ownership validation**: All endpoints verify `org_id` and `clerk_user_id` match
2. **Role-based access**: Only managers can view all attempt statuses
3. **Time restrictions**: Prevent retroactive status changes beyond 5 minutes
4. **Analysis protection**: Cannot modify analyzed attempts to preserve data integrity
5. **Input validation**: All inputs validated with Zod schemas

## Files Modified

1. `/src/types/attempt.ts` - Added new status values
2. `/src/app/api/calls/end/route.ts` - Added status handling and auto-discard
3. `/src/app/api/calls/analyze/route.ts` - Added status validation
4. `/src/app/api/scenarios/[scenarioId]/attempts/route.ts` - Added status filtering

## Files Created

1. `/src/app/api/attempts/[attemptId]/status/route.ts` - New status update endpoint

## Next Steps

Consider implementing:
1. **Webhook events** for status changes
2. **Analytics dashboard** showing status distribution
3. **Bulk status updates** for managers
4. **Status change audit log** for compliance
5. **Client-side hooks** for status management (e.g., `useAttemptStatus`)
