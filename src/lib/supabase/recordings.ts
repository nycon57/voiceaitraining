/**
 * Supabase Storage - Recordings Module
 *
 * This module handles voice call recordings with org-scoped security.
 * All recordings are stored in a private bucket with RLS policies enforcing
 * org-level access control.
 *
 * Path Structure: {org_id}/{attempt_id}.{extension}
 * Example: "550e8400-e29b-41d4-a716-446655440000/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3"
 */

import { createClient, createAdminClient } from "./server"
import { STORAGE_BUCKETS } from "./storage"

export interface RecordingUploadOptions {
  attemptId: string
  orgId: string
  file: File | Blob
  fileName?: string
}

export interface RecordingMetadata {
  attemptId: string
  orgId: string
  fileName: string
  fileSize: number
  mimeType: string
  duration?: number
}

/**
 * Upload a recording file from Vapi (or any source) to Supabase Storage
 *
 * @example
 * ```typescript
 * const blob = await fetch(vapiRecordingUrl).then(r => r.blob())
 * const result = await uploadRecording({
 *   attemptId: 'uuid',
 *   orgId: 'uuid',
 *   file: blob,
 *   fileName: 'recording.mp3'
 * })
 * console.log(result.storagePath) // "org-uuid/attempt-uuid.mp3"
 * ```
 */
export async function uploadRecording(options: RecordingUploadOptions) {
  const { attemptId, orgId, file, fileName } = options

  // Determine file extension
  const extension = fileName
    ? fileName.split('.').pop()
    : file instanceof File
      ? file.name.split('.').pop()
      : 'mp3'

  // Build storage path: {org_id}/{attempt_id}.{ext}
  const storagePath = `${orgId}/${attemptId}.${extension}`

  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.RECORDINGS)
    .upload(storagePath, file, {
      contentType: file.type || 'audio/mpeg',
      upsert: true, // Allow overwriting if retrying
    })

  if (error) {
    console.error('[uploadRecording] Error uploading recording:', error)
    throw new Error(`Failed to upload recording: ${error.message}`)
  }

  return {
    storagePath: data.path,
    fullPath: `${STORAGE_BUCKETS.RECORDINGS}/${data.path}`,
  }
}

/**
 * Download recording from Vapi and upload to Supabase Storage
 * This is useful for the end-of-call webhook that needs to persist Vapi's
 * temporary recording (expires after 7 days)
 *
 * @example
 * ```typescript
 * const result = await downloadAndStoreRecording({
 *   vapiUrl: 'https://vapi.ai/recordings/abc123',
 *   attemptId: 'uuid',
 *   orgId: 'uuid'
 * })
 *
 * // Update scenario_attempts table
 * await supabase
 *   .from('scenario_attempts')
 *   .update({
 *     recording_path: result.storagePath,
 *     recording_url: null // Clear temporary Vapi URL
 *   })
 *   .eq('id', attemptId)
 * ```
 */
export async function downloadAndStoreRecording(options: {
  vapiUrl: string
  attemptId: string
  orgId: string
}) {
  const { vapiUrl, attemptId, orgId } = options

  try {
    // Download from Vapi
    const response = await fetch(vapiUrl)
    if (!response.ok) {
      throw new Error(`Failed to download from Vapi: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Determine file extension from content-type or URL
    const contentType = response.headers.get('content-type') || 'audio/mpeg'
    const extension = contentType.includes('wav') ? 'wav'
      : contentType.includes('webm') ? 'webm'
      : contentType.includes('ogg') ? 'ogg'
      : 'mp3'

    // Upload to Supabase
    return await uploadRecording({
      attemptId,
      orgId,
      file: blob,
      fileName: `recording.${extension}`
    })
  } catch (error) {
    console.error('[downloadAndStoreRecording] Error:', error)
    throw error
  }
}

/**
 * Generate a signed URL for playback
 * Uses the database function `grant_signed_url` which enforces org-level access
 *
 * @example
 * ```typescript
 * // In a server action or API route
 * const playbackUrl = await getRecordingPlaybackUrl({
 *   attemptId: 'uuid',
 *   orgId: 'uuid',
 *   ttlSeconds: 3600 // 1 hour
 * })
 *
 * // Return to client for audio player
 * return { url: playbackUrl }
 * ```
 */
export async function getRecordingPlaybackUrl(options: {
  attemptId: string
  orgId: string
  extension?: string
  ttlSeconds?: number
}) {
  const { attemptId, orgId, extension = 'mp3', ttlSeconds = 3600 } = options

  const storagePath = `${orgId}/${attemptId}.${extension}`

  const supabase = await createClient()

  // Use the database function for org-scoped access control
  const { data, error } = await supabase.rpc('grant_signed_url', {
    storage_path: `${STORAGE_BUCKETS.RECORDINGS}/${storagePath}`,
    ttl_seconds: ttlSeconds
  })

  if (error) {
    console.error('[getRecordingPlaybackUrl] Error generating signed URL:', error)
    throw new Error(`Failed to generate playback URL: ${error.message}`)
  }

  return data as string
}

/**
 * Alternative: Generate signed URL using Supabase Storage API directly
 * This is faster but bypasses the database function's additional validation
 *
 * @example
 * ```typescript
 * const url = await getRecordingSignedUrlDirect({
 *   storagePath: 'org-uuid/attempt-uuid.mp3',
 *   ttlSeconds: 1800 // 30 minutes
 * })
 * ```
 */
export async function getRecordingSignedUrlDirect(options: {
  storagePath: string
  ttlSeconds?: number
}) {
  const { storagePath, ttlSeconds = 3600 } = options

  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.RECORDINGS)
    .createSignedUrl(storagePath, ttlSeconds)

  if (error) {
    console.error('[getRecordingSignedUrlDirect] Error:', error)
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a recording from storage
 * Useful for cleanup or when a user deletes an attempt
 *
 * @example
 * ```typescript
 * await deleteRecording({
 *   attemptId: 'uuid',
 *   orgId: 'uuid'
 * })
 * ```
 */
export async function deleteRecording(options: {
  attemptId: string
  orgId: string
  extension?: string
}) {
  const { attemptId, orgId, extension = 'mp3' } = options

  const storagePath = `${orgId}/${attemptId}.${extension}`

  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.RECORDINGS)
    .remove([storagePath])

  if (error) {
    console.error('[deleteRecording] Error deleting recording:', error)
    throw new Error(`Failed to delete recording: ${error.message}`)
  }

  return { success: true }
}

/**
 * Get recording metadata from storage
 *
 * @example
 * ```typescript
 * const metadata = await getRecordingMetadata({
 *   attemptId: 'uuid',
 *   orgId: 'uuid'
 * })
 * console.log(`File size: ${metadata.size} bytes`)
 * ```
 */
export async function getRecordingMetadata(options: {
  attemptId: string
  orgId: string
  extension?: string
}) {
  const { attemptId, orgId, extension = 'mp3' } = options

  const storagePath = `${orgId}/${attemptId}.${extension}`

  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.RECORDINGS)
    .list(orgId, {
      search: `${attemptId}.${extension}`
    })

  if (error) {
    console.error('[getRecordingMetadata] Error:', error)
    throw new Error(`Failed to get recording metadata: ${error.message}`)
  }

  const file = data?.[0]
  if (!file) {
    throw new Error('Recording not found')
  }

  return {
    name: file.name,
    size: file.metadata?.size || 0,
    mimeType: file.metadata?.mimetype || 'audio/mpeg',
    lastModified: file.updated_at,
    createdAt: file.created_at,
  }
}

/**
 * Check if a recording exists
 *
 * @example
 * ```typescript
 * const exists = await recordingExists({
 *   attemptId: 'uuid',
 *   orgId: 'uuid'
 * })
 * if (!exists) {
 *   // Trigger re-download from Vapi
 * }
 * ```
 */
export async function recordingExists(options: {
  attemptId: string
  orgId: string
  extension?: string
}): Promise<boolean> {
  try {
    await getRecordingMetadata(options)
    return true
  } catch (error) {
    return false
  }
}

/**
 * List all recordings for an organization
 * Useful for admin dashboards or cleanup tasks
 *
 * @example
 * ```typescript
 * const recordings = await listOrgRecordings({
 *   orgId: 'uuid',
 *   limit: 100
 * })
 * console.log(`Found ${recordings.length} recordings`)
 * ```
 */
export async function listOrgRecordings(options: {
  orgId: string
  limit?: number
  offset?: number
}) {
  const { orgId, limit = 100, offset = 0 } = options

  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.RECORDINGS)
    .list(orgId, {
      limit,
      offset,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) {
    console.error('[listOrgRecordings] Error:', error)
    throw new Error(`Failed to list recordings: ${error.message}`)
  }

  return data
}

/**
 * Helper to build the expected storage path
 *
 * @example
 * ```typescript
 * const path = buildRecordingPath('org-uuid', 'attempt-uuid', 'mp3')
 * // Returns: "org-uuid/attempt-uuid.mp3"
 * ```
 */
export function buildRecordingPath(
  orgId: string,
  attemptId: string,
  extension: string = 'mp3'
): string {
  return `${orgId}/${attemptId}.${extension}`
}

/**
 * Parse a storage path to extract org_id and attempt_id
 *
 * @example
 * ```typescript
 * const { orgId, attemptId } = parseRecordingPath('org-uuid/attempt-uuid.mp3')
 * ```
 */
export function parseRecordingPath(storagePath: string): {
  orgId: string
  attemptId: string
  extension: string
} {
  const parts = storagePath.split('/')
  if (parts.length !== 2) {
    throw new Error('Invalid recording path format')
  }

  const [orgId, fileNameWithExt] = parts
  const fileParts = fileNameWithExt.split('.')
  const extension = fileParts.pop() || 'mp3'
  const attemptId = fileParts.join('.')

  return { orgId, attemptId, extension }
}
