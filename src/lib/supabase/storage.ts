import { createClient } from "./server"

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
) {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options)

  if (error) {
    throw error
  }

  return data
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw error
  }

  return data.signedUrl
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    throw error
  }
}

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  RECORDINGS: 'recordings',
  TRANSCRIPTS: 'transcripts',
  ORG_ASSETS: 'org-assets',
  SCENARIO_ASSETS: 'scenario-assets',
  EXPORTS: 'exports',
  TMP: 'tmp'
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]