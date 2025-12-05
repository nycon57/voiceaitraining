# Supabase Storage Setup - Complete

## Summary

All Supabase storage buckets have been successfully created and configured with appropriate RLS policies for the Voice AI Training platform.

## Created Buckets

| Bucket | Privacy | Size Limit | MIME Types | Purpose |
|--------|---------|------------|------------|---------|
| **recordings** | Private | 50 MB | audio/mpeg, audio/mp3, audio/wav, audio/webm, audio/ogg, audio/m4a | Voice call recordings from Vapi |
| **transcripts** | Private | 10 MB | application/json, text/plain | Call transcripts (JSON and TXT) |
| **org-assets** | Private | 5 MB | image/jpeg, image/png, image/webp, image/svg+xml | Organization logos and brand assets |
| **scenario-assets** | Private | 10 MB | image/jpeg, image/png, image/webp, image/gif, application/pdf | Scenario images and attachments |
| **exports** | Private | 50 MB | text/csv, application/zip, application/pdf | Generated reports and exports |
| **tmp** | Private | 10 MB | All types | Temporary files |
| **avatars** | Private | 5 MB | image/jpeg, image/png, image/webp, image/gif | User avatars (pre-existing) |

## Path Structure

All buckets use org-scoped paths for multi-tenant security:

```
{bucket_name}/{org_id}/{resource_id}.{extension}
```

### Examples:

- **Recordings**: `recordings/550e8400-e29b-41d4-a716-446655440000/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3`
- **Transcripts**: `transcripts/550e8400-e29b-41d4-a716-446655440000/a1b2c3d4-e5f6-7890-abcd-ef1234567890.json`
- **Org Assets**: `org-assets/550e8400-e29b-41d4-a716-446655440000/logo.png`

## RLS Policies

Each bucket has 4 policies enforcing org-level access control:

1. **SELECT** - Users can read files from their org
2. **INSERT** - Users can upload files for their org
3. **UPDATE** - Users can update files from their org (where applicable)
4. **DELETE** - Users can delete files from their org

All policies validate: `(storage.foldername(name))[1] = current_setting('jwt.claims.org_id', true)`

This ensures users can only access files within their organization's folder.

## Database Function: `grant_signed_url`

Created a helper function to generate signed URLs with org-level access control:

```sql
CREATE FUNCTION public.grant_signed_url(
  storage_path text,
  ttl_seconds int DEFAULT 3600
) RETURNS text
```

### Features:
- Validates user has access to the org's files
- Generates short-lived signed URLs (default 1 hour)
- Works across all buckets
- Prevents cross-org access

## TypeScript Integration

### Files Created:

1. **`src/lib/supabase/recordings.ts`** - Complete recordings module with functions:
   - `uploadRecording()` - Upload a recording file
   - `downloadAndStoreRecording()` - Download from Vapi and store
   - `getRecordingPlaybackUrl()` - Generate signed URL for playback
   - `deleteRecording()` - Delete a recording
   - `recordingExists()` - Check if recording exists
   - `listOrgRecordings()` - List all recordings for an org
   - Helper functions for path manipulation

2. **`src/app/api/recordings/[attemptId]/playback/route.ts`** - API route example for generating playback URLs

3. **`db/example-vapi-webhook-handler.ts`** - Complete Vapi webhook handler example

### Updated Files:

1. **`src/lib/supabase/storage.ts`** - Added all bucket constants

## Usage Examples

### 1. End-of-Call Webhook (Store Recording)

```typescript
import { downloadAndStoreRecording } from '@/lib/supabase/recordings'

// In your Vapi webhook handler
const result = await downloadAndStoreRecording({
  vapiUrl: 'https://vapi.ai/recordings/abc123',
  attemptId: 'uuid',
  orgId: 'uuid'
})

// Update database
await supabase
  .from('scenario_attempts')
  .update({
    recording_path: result.storagePath,
    recording_url: null // Clear temporary Vapi URL
  })
  .eq('id', attemptId)
```

### 2. Generate Playback URL for Audio Player

```typescript
import { getRecordingPlaybackUrl } from '@/lib/supabase/recordings'

// In a server action or API route
const url = await getRecordingPlaybackUrl({
  attemptId: 'uuid',
  orgId: 'uuid',
  ttlSeconds: 3600 // 1 hour
})

// Return to client
return { playbackUrl: url }
```

### 3. Client-Side Audio Player

```tsx
'use client'

import { useEffect, useState } from 'react'

export function RecordingPlayer({ attemptId }: { attemptId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUrl() {
      try {
        const response = await fetch(`/api/recordings/${attemptId}/playback`)
        const data = await response.json()
        setUrl(data.url)
      } catch (error) {
        console.error('Failed to load recording:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUrl()
  }, [attemptId])

  if (loading) return <div>Loading...</div>
  if (!url) return <div>Recording not available</div>

  return (
    <audio controls src={url}>
      Your browser does not support the audio element.
    </audio>
  )
}
```

### 4. Server Action to Delete Recording

```typescript
'use server'

import { deleteRecording } from '@/lib/supabase/recordings'
import { withOrgGuard } from '@/lib/auth'

export async function deleteAttemptRecording(attemptId: string) {
  return withOrgGuard(async (user, orgId, supabase) => {
    // Verify ownership
    const { data: attempt } = await supabase
      .from('scenario_attempts')
      .select('id, recording_path')
      .eq('id', attemptId)
      .single()

    if (!attempt) {
      throw new Error('Attempt not found')
    }

    // Delete from storage
    await deleteRecording({
      attemptId,
      orgId
    })

    // Clear database reference
    await supabase
      .from('scenario_attempts')
      .update({ recording_path: null })
      .eq('id', attemptId)

    return { success: true }
  })
}
```

## Migrations Applied

Two migrations were successfully applied:

1. **`create_recordings_bucket_and_policies`** (2025-10-03)
   - Created recordings bucket
   - Added RLS policies for recordings
   - Created `grant_signed_url()` function

2. **`create_additional_storage_buckets`** (2025-10-03)
   - Created transcripts, org-assets, scenario-assets, exports, tmp buckets
   - Added RLS policies for all new buckets

## Security Features

- ✅ **Private buckets** - All buckets are private (not publicly accessible)
- ✅ **Row Level Security** - RLS policies enforce org-level access
- ✅ **Short-lived URLs** - Signed URLs expire (default 1 hour)
- ✅ **Path validation** - Database function validates org ownership
- ✅ **File size limits** - Each bucket has appropriate size limits
- ✅ **MIME type restrictions** - Only allowed file types can be uploaded

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vapi (for webhooks)
VAPI_API_KEY=your_vapi_api_key
VAPI_WEBHOOK_SECRET=your_webhook_secret
```

## Testing Checklist

- [ ] Upload a test recording via `uploadRecording()`
- [ ] Generate signed URL via `getRecordingPlaybackUrl()`
- [ ] Verify URL expires after TTL
- [ ] Test cross-org access is blocked
- [ ] Download from Vapi via `downloadAndStoreRecording()`
- [ ] Verify recording appears in `scenario_attempts.recording_path`
- [ ] Test playback in audio player
- [ ] Test deletion via `deleteRecording()`
- [ ] Verify RLS policies with different org users

## Next Steps

1. **Implement Vapi webhook handler** - Use the example in `db/example-vapi-webhook-handler.ts`
2. **Update scenario_attempts flow** - Store recordings after each call
3. **Add audio player component** - Use the example above
4. **Set up background job** - Clean up old tmp files (>24 hours)
5. **Monitor storage usage** - Add alerts for approaching limits
6. **Test with real Vapi calls** - Verify end-to-end flow

## Storage Dashboard

View and manage storage in Supabase Dashboard:
- **URL**: https://supabase.com/dashboard/project/nloxrwqgrecscilpahri/storage/buckets
- **Buckets**: All 7 buckets visible
- **Usage**: Monitor per-bucket storage usage
- **Browse**: View files and folder structure

## Support

For issues or questions:
- Check Supabase Storage docs: https://supabase.com/docs/guides/storage
- Review RLS policies in SQL editor
- Check browser console for CORS/auth errors
- Verify JWT claims are being set correctly

---

**Setup Status**: ✅ Complete
**Date**: 2025-10-03
**Database**: Voice AI (nloxrwqgrecscilpahri)
**Region**: us-east-2
