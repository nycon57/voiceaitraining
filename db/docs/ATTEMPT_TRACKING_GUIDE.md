# User Attempt Tracking Guide

## Overview

This guide explains how to track and compare multiple attempts of the same scenario by the same user in the Audio Agent Sales Training platform.

## Schema Structure

### Core Fields in `scenario_attempts`

```typescript
{
  id: uuid                    // Unique attempt identifier
  org_id: uuid               // Organization (for RLS)
  clerk_user_id: text        // User who made the attempt
  scenario_id: uuid          // Scenario being practiced
  assignment_id: uuid?       // Optional assignment link

  // Timing
  started_at: timestamptz    // When attempt began
  ended_at: timestamptz?     // When attempt completed
  duration_seconds: int?     // Duration in seconds

  // Performance
  score: numeric?            // Overall score (0-100)
  kpis: jsonb?              // Key performance indicators
  score_breakdown: jsonb?    // Detailed scoring data

  // Artifacts
  transcript_text: text?     // Full transcript
  transcript_json: jsonb?    // Structured transcript
  recording_path: text?      // Audio recording path

  // Feedback
  feedback_text: text?       // AI-generated feedback
  feedback_json: jsonb?      // Structured feedback
  manager_comments: text?    // Manager notes

  // Status
  status: enum              // in_progress | completed | failed
  metadata: jsonb           // Additional metadata
}
```

## Identifying Different Attempt Types

### Best Attempt
**Definition**: The attempt with the highest score for a given user-scenario combination.

**Query Pattern**:
```sql
SELECT DISTINCT ON (scenario_id)
    id as best_attempt_id,
    score as best_score,
    started_at
FROM scenario_attempts
WHERE org_id = ? AND clerk_user_id = ? AND scenario_id = ?
    AND status = 'completed' AND score IS NOT NULL
ORDER BY scenario_id, score DESC, started_at DESC;
```

**Use Cases**:
- Leaderboards
- Achievement tracking
- Progress certificates
- Best score badges

### Latest Attempt
**Definition**: The most recent completed attempt, regardless of score.

**Query Pattern**:
```sql
SELECT id, score, started_at
FROM scenario_attempts
WHERE org_id = ? AND clerk_user_id = ? AND scenario_id = ?
    AND status = 'completed'
ORDER BY started_at DESC
LIMIT 1;
```

**Use Cases**:
- Current performance level
- Recent activity feed
- "Try again" functionality
- Latest feedback display

### First Attempt
**Definition**: The earliest completed attempt, used as a baseline.

**Query Pattern**:
```sql
SELECT id, score, started_at
FROM scenario_attempts
WHERE org_id = ? AND clerk_user_id = ? AND scenario_id = ?
    AND status = 'completed'
ORDER BY started_at ASC
LIMIT 1;
```

**Use Cases**:
- Progress calculation
- Improvement percentage
- Before/after comparison
- Learning curve analysis

### Average Attempt
**Definition**: Statistical average of all attempts.

**Query Pattern**:
```sql
SELECT
    AVG(score) as avg_score,
    AVG(duration_seconds) as avg_duration,
    COUNT(*) as total_attempts
FROM scenario_attempts
WHERE org_id = ? AND clerk_user_id = ? AND scenario_id = ?
    AND status = 'completed' AND score IS NOT NULL;
```

**Use Cases**:
- Overall performance level
- Consistency metrics
- Statistical analysis
- Manager reporting

## Common Query Patterns

### 1. All Attempts for a Scenario (Chronological)

```typescript
// Server Action
export async function getUserScenarioAttempts(
  orgId: string,
  clerkUserId: string,
  scenarioId: string,
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('scenario_attempts')
    .select(`
      id,
      started_at,
      ended_at,
      duration_seconds,
      score,
      status,
      kpis,
      score_breakdown
    `)
    .eq('org_id', orgId)
    .eq('clerk_user_id', clerkUserId)
    .eq('scenario_id', scenarioId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit);

  return { data, error };
}
```

### 2. Best Attempts Across All Scenarios

```typescript
// Using the database function
export async function getUserBestAttempts(
  orgId: string,
  clerkUserId: string
) {
  const { data, error } = await supabase.rpc(
    'get_user_best_attempts',
    {
      p_org_id: orgId,
      p_clerk_user_id: clerkUserId
    }
  );

  return { data, error };
}
```

### 3. Score Improvement Over Time

```typescript
export async function getUserScoreImprovement(
  orgId: string,
  clerkUserId: string,
  scenarioId?: string,
  daysBack: number = 90
) {
  const { data, error } = await supabase.rpc(
    'get_user_score_improvement',
    {
      p_org_id: orgId,
      p_clerk_user_id: clerkUserId,
      p_scenario_id: scenarioId,
      p_days_back: daysBack
    }
  );

  return { data, error };
}
```

### 4. Recent Attempts Comparison

```typescript
export async function getRecentAttemptsComparison(
  orgId: string,
  clerkUserId: string,
  scenarioId?: string,
  limit: number = 5
) {
  const { data, error } = await supabase.rpc(
    'get_recent_attempts_comparison',
    {
      p_org_id: orgId,
      p_clerk_user_id: clerkUserId,
      p_scenario_id: scenarioId,
      p_limit: limit
    }
  );

  return { data, error };
}
```

### 5. Attempt Comparison Summary

```typescript
export async function getAttemptComparisonSummary(
  orgId: string,
  clerkUserId: string,
  scenarioId: string
) {
  const { data, error } = await supabase.rpc(
    'get_attempt_comparison_summary',
    {
      p_org_id: orgId,
      p_clerk_user_id: clerkUserId,
      p_scenario_id: scenarioId
    }
  );

  // Returns:
  // - first_attempt_id, first_score, first_date
  // - best_attempt_id, best_score, best_date
  // - latest_attempt_id, latest_score, latest_date
  // - average_score, median_score, score_std_dev
  // - total_attempts, total_practice_seconds
  // - improvement_percentage

  return { data: data?.[0], error };
}
```

## Index Strategy

### Existing Indexes (Already in Place)
1. `idx_scenario_attempts_org_id_user_id` - User's attempts lookup
2. `idx_scenario_attempts_org_id_scenario_id` - Scenario attempts lookup
3. `idx_scenario_attempts_started_at` - Chronological sorting
4. `idx_scenario_attempts_status` - Status filtering

### New Recommended Indexes (Migration 0011)
1. `idx_scenario_attempts_user_scenario_time` - User-scenario chronological queries
2. `idx_scenario_attempts_user_scenario_score` - Best score lookups
3. `idx_scenario_attempts_user_recent` - Recent activity queries

### Index Selection by Query Type

| Query Type | Primary Index Used |
|------------|-------------------|
| All attempts for user + scenario | `idx_scenario_attempts_user_scenario_time` |
| Best attempt by score | `idx_scenario_attempts_user_scenario_score` |
| Recent attempts across scenarios | `idx_scenario_attempts_user_recent` |
| Specific attempt by ID | `scenario_attempts_pkey` |
| All attempts for a scenario (any user) | `idx_scenario_attempts_org_id_scenario_id` |

## Performance Considerations

### Query Optimization Tips

1. **Always filter by org_id first** - Required for RLS and uses composite indexes effectively
2. **Use status = 'completed'** - Filters out in-progress attempts (included in partial indexes)
3. **Filter NULL scores when needed** - `score IS NOT NULL` for meaningful comparisons
4. **Limit result sets** - Always use LIMIT for list queries (default: 50)
5. **Use window functions** - More efficient than subqueries for rankings and aggregations

### Caching Strategy

For frequently accessed data:

```typescript
// Cache user's best attempts (5 min TTL)
import { unstable_cache } from 'next/cache';

export const getCachedBestAttempts = unstable_cache(
  async (orgId: string, userId: string) => {
    return getUserBestAttempts(orgId, userId);
  },
  ['user-best-attempts'],
  {
    revalidate: 300, // 5 minutes
    tags: [`user-${userId}-attempts`]
  }
);

// Invalidate on new attempt completion
import { revalidateTag } from 'next/cache';

export async function onAttemptCompleted(userId: string) {
  revalidateTag(`user-${userId}-attempts`);
}
```

## UI Display Patterns

### Progress Card Component

```typescript
interface AttemptProgressCardProps {
  orgId: string;
  userId: string;
  scenarioId: string;
}

export async function AttemptProgressCard({
  orgId,
  userId,
  scenarioId
}: AttemptProgressCardProps) {
  const { data: summary } = await getAttemptComparisonSummary(
    orgId,
    userId,
    scenarioId
  );

  if (!summary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{summary.scenario_title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Total Attempts" value={summary.total_attempts} />
          <Stat label="Best Score" value={`${summary.best_score}%`} />
          <Stat label="Latest Score" value={`${summary.latest_score}%`} />
          <Stat
            label="Improvement"
            value={`${summary.improvement_percentage > 0 ? '+' : ''}${summary.improvement_percentage}%`}
            trend={summary.improvement_percentage > 0 ? 'up' : 'down'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Attempt History Timeline

```typescript
export async function AttemptHistoryTimeline({
  orgId,
  userId,
  scenarioId
}: AttemptProgressCardProps) {
  const { data: attempts } = await getUserScenarioAttempts(
    orgId,
    userId,
    scenarioId,
    10
  );

  return (
    <div className="space-y-4">
      {attempts?.map((attempt, idx) => (
        <TimelineItem
          key={attempt.id}
          attempt={attempt}
          attemptNumber={attempts.length - idx}
          isBest={attempt.score === Math.max(...attempts.map(a => a.score))}
          isLatest={idx === 0}
        />
      ))}
    </div>
  );
}
```

## Analytics and Reporting

### Improvement Rate Calculation

```sql
-- Calculate improvement rate (first to latest)
WITH first_and_latest AS (
  SELECT
    (SELECT score FROM scenario_attempts
     WHERE org_id = $1 AND clerk_user_id = $2 AND scenario_id = $3
       AND status = 'completed' AND score IS NOT NULL
     ORDER BY started_at ASC LIMIT 1) as first_score,
    (SELECT score FROM scenario_attempts
     WHERE org_id = $1 AND clerk_user_id = $2 AND scenario_id = $3
       AND status = 'completed' AND score IS NOT NULL
     ORDER BY started_at DESC LIMIT 1) as latest_score
)
SELECT
  first_score,
  latest_score,
  ROUND(((latest_score - first_score) / first_score * 100), 2) as improvement_pct,
  CASE
    WHEN latest_score > first_score THEN 'improving'
    WHEN latest_score = first_score THEN 'stable'
    ELSE 'declining'
  END as trend
FROM first_and_latest;
```

### Practice Consistency Score

```sql
-- Calculate consistency based on score variance
SELECT
  clerk_user_id,
  scenario_id,
  COUNT(*) as attempt_count,
  AVG(score) as avg_score,
  STDDEV(score) as score_variance,
  CASE
    WHEN STDDEV(score) < 5 THEN 'very_consistent'
    WHEN STDDEV(score) < 10 THEN 'consistent'
    WHEN STDDEV(score) < 15 THEN 'moderate'
    ELSE 'inconsistent'
  END as consistency_level
FROM scenario_attempts
WHERE org_id = $1
  AND status = 'completed'
  AND score IS NOT NULL
GROUP BY clerk_user_id, scenario_id
HAVING COUNT(*) >= 3;
```

## RLS Considerations

All queries automatically respect Row Level Security policies. The schema enforces:

- Users can only see their own attempts (trainee role)
- Managers can see team members' attempts
- Admins can see all org attempts
- HR can see all attempts for compliance

Server Actions must call `set_org_claim()` before querying:

```typescript
export async function getUserAttempts(scenarioId: string) {
  const { userId, orgId } = auth();

  // Set org claim for RLS
  await supabase.rpc('set_org_claim', { org_id: orgId });

  // Now query respects RLS
  const { data } = await supabase
    .from('scenario_attempts')
    .select('*')
    .eq('scenario_id', scenarioId);

  return data;
}
```

## Migration Guide

To apply the optimized indexes:

```bash
# Run migration 0011
psql $DATABASE_URL -f db/migrations/0011_add_user_scenario_attempt_tracking_index.sql

# Or using Supabase CLI
supabase db push
```

To apply the tracking functions:

```bash
# Run the SQL functions
psql $DATABASE_URL -f db/queries/user_attempt_tracking.sql

# Or via Supabase dashboard: SQL Editor > New Query > Paste and Run
```

## Testing Queries

Sample test data:

```sql
-- Insert test attempts for a user
INSERT INTO scenario_attempts (
  org_id,
  clerk_user_id,
  scenario_id,
  started_at,
  ended_at,
  duration_seconds,
  score,
  status
) VALUES
  ('org-uuid', 'user_123', 'scenario_1', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 300, 65, 'completed'),
  ('org-uuid', 'user_123', 'scenario_1', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 280, 72, 'completed'),
  ('org-uuid', 'user_123', 'scenario_1', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 250, 85, 'completed'),
  ('org-uuid', 'user_123', 'scenario_1', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 240, 88, 'completed');

-- Test improvement query
SELECT * FROM get_user_score_improvement('org-uuid', 'user_123', 'scenario_1', 30);

-- Test comparison summary
SELECT * FROM get_attempt_comparison_summary('org-uuid', 'user_123', 'scenario_1');
```

## Troubleshooting

### Slow Queries
- Verify indexes exist: `\di scenario_attempts*` in psql
- Check query plan: `EXPLAIN ANALYZE SELECT ...`
- Ensure org_id is always in WHERE clause
- Use partial indexes (status = 'completed')

### Missing Attempts
- Check status filter (only 'completed' attempts in most queries)
- Verify RLS is set correctly: `SELECT current_setting('jwt.claims.org_id')`
- Confirm user_id matches Clerk ID format

### Incorrect Best Score
- Ensure `score IS NOT NULL` in query
- Check for ties: multiple attempts with same score
- Verify ordering: `ORDER BY score DESC, started_at DESC`

## Related Documentation

- [Database Schema](./DB_SCHEMA.md)
- [RLS Policies](./SECURITY.md)
- [Performance Optimization](./PERFORMANCE.md)
- [Reporting Guide](./REPORTING.md)
