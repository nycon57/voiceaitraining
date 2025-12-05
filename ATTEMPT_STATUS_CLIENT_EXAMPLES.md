# Client Usage Examples for Attempt Status Management

This document provides practical client-side examples for using the new attempt status management endpoints.

## Table of Contents
1. [End Call with Status](#1-end-call-with-status)
2. [Update Attempt Status](#2-update-attempt-status)
3. [Fetch Attempts with Status Filter](#3-fetch-attempts-with-status-filter)
4. [Handle Analysis Errors](#4-handle-analysis-errors)
5. [React Hooks](#5-react-hooks)

---

## 1. End Call with Status

### Basic Usage - Let the system decide
```typescript
async function endCall(attemptId: string, transcript: any[], duration: number, recordingUrl?: string) {
  const response = await fetch('/api/calls/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      transcript,
      duration,
      recordingUrl,
      // No status - defaults to 'completed' or 'cancelled' if < 15s
    }),
  })

  const data = await response.json()

  if (data.status === 'cancelled' && data.message) {
    // Call was too short and auto-cancelled
    console.log(data.message)
    // "Call was too short and has been automatically cancelled"
  }

  return data
}
```

### Explicit Practice Mode
```typescript
async function endPracticeCall(attemptId: string, transcript: any[], duration: number) {
  const response = await fetch('/api/calls/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      transcript,
      duration,
      status: 'practice', // Explicit practice status
    }),
  })

  return response.json()
}
```

### Handle Technical Issues
```typescript
async function endCallWithTechnicalIssue(attemptId: string, transcript: any[], duration: number) {
  const response = await fetch('/api/calls/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      transcript,
      duration,
      status: 'technical_issue',
    }),
  })

  return response.json()
}
```

---

## 2. Update Attempt Status

### Basic Status Update
```typescript
async function updateAttemptStatus(attemptId: string, status: 'completed' | 'cancelled' | 'practice' | 'technical_issue') {
  const response = await fetch(`/api/attempts/${attemptId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }

  return response.json()
}
```

### With Error Handling
```typescript
async function updateAttemptStatusSafe(attemptId: string, status: AttemptStatus) {
  try {
    const response = await fetch(`/api/attempts/${attemptId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 403) {
        // Time limit exceeded or already analyzed
        if (data.minutesElapsed) {
          throw new Error(`Cannot update status after ${data.minutesElapsed} minutes`)
        } else {
          throw new Error('Cannot change status of analyzed attempts')
        }
      }
      throw new Error(data.error || 'Failed to update status')
    }

    return data
  } catch (error) {
    console.error('Error updating attempt status:', error)
    throw error
  }
}
```

---

## 3. Fetch Attempts with Status Filter

### Get Completed Attempts (Default)
```typescript
async function getCompletedAttempts(scenarioId: string) {
  const response = await fetch(`/api/scenarios/${scenarioId}/attempts`)
  return response.json()
}
```

### Get Practice Attempts
```typescript
async function getPracticeAttempts(scenarioId: string) {
  const response = await fetch(`/api/scenarios/${scenarioId}/attempts?status=practice`)
  return response.json()
}
```

### Get All Attempts (Managers Only)
```typescript
async function getAllAttempts(scenarioId: string) {
  const response = await fetch(`/api/scenarios/${scenarioId}/attempts?status=all`)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Insufficient permissions to view all attempt statuses')
    }
    throw new Error('Failed to fetch attempts')
  }

  return response.json()
}
```

### Dynamic Status Filter
```typescript
type StatusFilter = 'completed' | 'cancelled' | 'practice' | 'technical_issue' | 'all'

async function getAttemptsByStatus(scenarioId: string, status: StatusFilter = 'completed') {
  const params = new URLSearchParams({ status })
  const response = await fetch(`/api/scenarios/${scenarioId}/attempts?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch attempts')
  }

  const data = await response.json()

  console.log('Filter applied:', data.filters.statusFilter)
  console.log('User is manager:', data.filters.isManager)
  console.log('Total attempts:', data.statistics.totalAttempts)

  return data
}
```

---

## 4. Handle Analysis Errors

### Analyze with Status Check
```typescript
async function analyzeAttempt(attemptId: string, transcript: any[], kpis: any) {
  const response = await fetch('/api/calls/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      transcript,
      kpis,
    }),
  })

  if (!response.ok) {
    const data = await response.json()

    if (data.error === 'Analysis skipped') {
      // Attempt status is not 'completed'
      console.log(`Analysis skipped: ${data.message}`)
      console.log(`Current status: ${data.status}`)
      return null
    }

    throw new Error('Analysis failed')
  }

  // Stream analysis results
  const reader = response.body?.getReader()
  // ... handle streaming
}
```

---

## 5. React Hooks

### useAttemptStatus Hook
```typescript
import { useState } from 'react'

type AttemptStatus = 'completed' | 'cancelled' | 'practice' | 'technical_issue'

export function useAttemptStatus(initialAttemptId?: string) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (attemptId: string, status: AttemptStatus) => {
    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/attempts/${attemptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.minutesElapsed) {
          throw new Error(`Cannot update status after ${data.minutesElapsed} minutes (limit: 5 minutes)`)
        }
        throw new Error(data.error || 'Failed to update status')
      }

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  return { updateStatus, isUpdating, error }
}
```

### useAttempts Hook with Filtering
```typescript
import { useState, useEffect } from 'react'

type StatusFilter = 'completed' | 'cancelled' | 'practice' | 'technical_issue' | 'all'

export function useAttempts(scenarioId: string, statusFilter: StatusFilter = 'completed') {
  const [attempts, setAttempts] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttempts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ status: statusFilter })
        const response = await fetch(`/api/scenarios/${scenarioId}/attempts?${params}`)

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Insufficient permissions')
          }
          throw new Error('Failed to fetch attempts')
        }

        const data = await response.json()
        setAttempts(data.attempts)
        setStatistics(data.statistics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttempts()
  }, [scenarioId, statusFilter])

  return { attempts, statistics, isLoading, error }
}
```

### Example Component Usage
```tsx
'use client'

import { useState } from 'react'
import { useAttempts } from '@/hooks/useAttempts'
import { useAttemptStatus } from '@/hooks/useAttemptStatus'

export function AttemptsList({ scenarioId }: { scenarioId: string }) {
  const [statusFilter, setStatusFilter] = useState<'completed' | 'practice' | 'all'>('completed')
  const { attempts, statistics, isLoading } = useAttempts(scenarioId, statusFilter)
  const { updateStatus, isUpdating } = useAttemptStatus()

  const handleMarkAsPractice = async (attemptId: string) => {
    try {
      await updateStatus(attemptId, 'practice')
      // Refresh attempts list
      window.location.reload() // Or use proper state management
    } catch (error) {
      console.error('Failed to mark as practice:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded p-2"
        >
          <option value="completed">Completed</option>
          <option value="practice">Practice</option>
          <option value="all">All (Managers)</option>
        </select>
      </div>

      {statistics && (
        <div className="mb-4">
          <p>Total Attempts: {statistics.totalAttempts}</p>
          <p>Average Score: {statistics.averageScore}</p>
        </div>
      )}

      <div className="space-y-2">
        {attempts.map((attempt) => (
          <div key={attempt.attemptNumber} className="border p-4 rounded">
            <p>Attempt #{attempt.attemptNumber}</p>
            <p>Score: {attempt.score}</p>
            <button
              onClick={() => handleMarkAsPractice(attempt.id)}
              disabled={isUpdating}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Mark as Practice
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Complete Call Flow Example

```typescript
// Complete flow: Start → End → Optionally Update Status → Analyze
async function completeCallFlow() {
  // 1. Start call (existing logic)
  const startResponse = await fetch('/api/calls/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId: 'scenario-123' }),
  })
  const { attemptId } = await startResponse.json()

  // 2. Conduct call (collect transcript, duration, etc.)
  const transcript = [/* ... */]
  const duration = 180 // seconds
  const recordingUrl = 'https://...'

  // 3. End call
  const endResponse = await fetch('/api/calls/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attemptId,
      transcript,
      duration,
      recordingUrl,
      // Let it auto-determine status or explicitly set:
      // status: 'practice'
    }),
  })
  const endData = await endResponse.json()

  if (endData.status === 'cancelled') {
    console.log('Call was cancelled:', endData.message)
    return
  }

  // 4. Optionally update status (within 5 minutes)
  // Example: User realizes this should be a practice attempt
  const userWantsPractice = confirm('Mark this as a practice attempt?')
  if (userWantsPractice) {
    await fetch(`/api/attempts/${attemptId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'practice' }),
    })
  }

  // 5. Analyze (only if status is 'completed')
  if (endData.status === 'completed') {
    const kpis = {/* calculated KPIs */}
    const analyzeResponse = await fetch('/api/calls/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        transcript,
        kpis,
      }),
    })

    // Stream analysis results...
  }
}
```

---

## Error Handling Best Practices

```typescript
async function robustEndCall(attemptId: string, transcript: any[], duration: number, recordingUrl?: string) {
  try {
    const response = await fetch('/api/calls/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId,
        transcript,
        duration,
        recordingUrl,
      }),
    })

    if (!response.ok) {
      const data = await response.json()

      switch (response.status) {
        case 401:
          throw new Error('Unauthorized - please sign in')
        case 400:
          throw new Error(`Invalid request: ${data.error}`)
        case 500:
          throw new Error('Server error - please try again')
        default:
          throw new Error(data.error || 'Unknown error')
      }
    }

    const data = await response.json()

    // Log auto-cancel events
    if (data.status === 'cancelled' && data.message) {
      console.warn('Auto-cancelled:', data.message)
      // Track in analytics
      analytics.track('attempt_auto_cancelled', {
        attemptId,
        duration,
        reason: 'too_short',
      })
    }

    return data
  } catch (error) {
    console.error('Error ending call:', error)
    // Show user-friendly error message
    throw error
  }
}
```
