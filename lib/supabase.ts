import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bicmljgguztcnhgujube.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY21samdndXp0Y25oZ3VqdWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE3MjUsImV4cCI6MjA5NTEyNzcyNX0.g4uRn5fXKDQoM_5kVBM9m12rDlIBEIHNHI93JFIpgKU'

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
