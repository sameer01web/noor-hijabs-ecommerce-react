import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim().replace(/^["']|["']$/g, '') : ''
export const supabaseAnonKey = typeof rawAnonKey === 'string' ? rawAnonKey.trim().replace(/^["']|["']$/g, '') : ''

export const supabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))
)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

export async function getCurrentUser() {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data?.user ?? null
  } catch {
    return null
  }
}