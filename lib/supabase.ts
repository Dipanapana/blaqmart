import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

// Lazy initialization to avoid build errors when env vars are missing
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required. Check your environment variables.')
    }
    _supabase = createClient(supabaseUrl, supabaseKey)
  }
  return _supabase
}

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and service key are required. Check your environment variables.')
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return _supabaseAdmin
}

// For backwards compatibility - lazy getters
export const supabase = {
  get storage() {
    return getSupabase().storage
  },
  get auth() {
    return getSupabase().auth
  },
  get from() {
    return getSupabase().from.bind(getSupabase())
  },
}

export const supabaseAdmin = {
  get storage() {
    return getSupabaseAdmin().storage
  },
  get auth() {
    return getSupabaseAdmin().auth
  },
  get from() {
    return getSupabaseAdmin().from.bind(getSupabaseAdmin())
  },
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (default: 'products')
 * @param folder - Optional folder path within the bucket
 * @returns Public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: string = "products",
  folder?: string
): Promise<string> {
  const client = getSupabase()
  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { data, error } = await client.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name (default: 'products')
 */
export async function deleteImage(
  url: string,
  bucket: string = "products"
): Promise<void> {
  const client = getSupabase()
  // Extract the file path from the URL
  const urlParts = url.split(`/${bucket}/`)
  if (urlParts.length < 2) {
    throw new Error("Invalid image URL")
  }

  const filePath = urlParts[1]

  const { error } = await client.storage.from(bucket).remove([filePath])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}
