import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  email: string
  full_name: string
  phone: string
  role: 'patient' | 'professional' | 'pharmacy' | 'insurance' | 'admin'
  avatar_url?: string
  is_active: boolean
  subscription_end?: string
  created_at: string
}
