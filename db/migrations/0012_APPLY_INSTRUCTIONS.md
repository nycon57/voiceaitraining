# Migration 0012: Add attempt_status Enum

## Overview
This migration adds an `attempt_status` column to the `scenario_attempts` table to track different states of call attempts.

## Changes

### Database Schema
- **New Enum Type**: `attempt_status` with values:
  - `completed` - Successfully completed attempt that counts toward performance
  - `cancelled` - User cancelled the call before completion
  - `practice` - Practice attempt that does not count toward scoring
  - `technical_issue` - Attempt failed due to technical problems

- **New Column**: `scenario_attempts.attempt_status`
  - Type: `attempt_status` enum
  - Default: `'completed'`
  - NOT NULL

- **New Indexes**:
  - `idx_scenario_attempts_status` - Partial index for completed attempts (optimizes leaderboard queries)
  - `idx_scenario_attempts_practice` - Partial index for practice attempts (optimizes user practice history)

### TypeScript Updates
Updated `/src/types/attempt.ts`:
- `AttemptStatus` type now matches database enum exactly
- `ScenarioAttempt` interface field renamed from `status` to `attempt_status`

## Applying the Migration

### Using psql
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f db/migrations/0012_add_attempt_status_enum.sql
```

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `0012_add_attempt_status_enum.sql`
4. Execute the migration

### Verification
After applying, run the verification queries (uncommented from the migration file):

```sql
-- Verify the enum type was created
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'attempt_status'::regtype
ORDER BY enumsortorder;

-- Verify the column was added
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'scenario_attempts'
  AND column_name = 'attempt_status';

-- Verify the indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'scenario_attempts'
  AND indexname IN ('idx_scenario_attempts_status', 'idx_scenario_attempts_practice');
```

## Rollback

If you need to rollback this migration:

```sql
DROP INDEX IF EXISTS idx_scenario_attempts_practice;
DROP INDEX IF EXISTS idx_scenario_attempts_status;
ALTER TABLE scenario_attempts DROP COLUMN IF EXISTS attempt_status;
DROP TYPE IF EXISTS attempt_status;
```

## Backward Compatibility

- **Default Value**: All existing records will automatically have `attempt_status = 'completed'`
- **NOT NULL Constraint**: Safe to apply because of the default value
- **Application Code**: Update any queries that reference the `status` field to use `attempt_status`

## Application Updates Needed

After applying this migration, you'll need to update:

1. **Server Actions** - Update any queries that filter by status:
   ```typescript
   // Before
   .eq('status', 'completed')

   // After
   .eq('attempt_status', 'completed')
   ```

2. **API Routes** - Update response mappings to use `attempt_status`

3. **Components** - Update UI components that display or filter by status

4. **Filtering Logic** - Update leaderboard and reporting queries to filter by `attempt_status = 'completed'`

## Performance Notes

- The partial indexes on `attempt_status` will significantly improve queries that filter by status
- The `idx_scenario_attempts_status` index includes `org_id` and `started_at` for composite query optimization
- Practice mode queries will benefit from the dedicated partial index

## Testing Recommendations

1. Test creating new attempts with different status values
2. Test filtering attempts by status in UI
3. Verify leaderboard queries only show completed attempts
4. Test practice mode filtering
5. Verify backward compatibility with existing attempts
