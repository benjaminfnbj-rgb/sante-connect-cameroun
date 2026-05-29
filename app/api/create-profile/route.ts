import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bicmljgguztcnhgujube.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY21samdndXp0Y25oZ3VqdWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE3MjUsImV4cCI6MjA5NTEyNzcyNX0.g4uRn5fXKDQoM_5kVBM9m12rDlIBEIHNHI93JFIpgKU'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, userType, phone, gender, city, accessToken } = await req.json()
    if (!userId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Use the user's own access token to authenticate - this respects RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })

    const typeMap: Record<string, string> = {
      patient: 'patient', professional: 'professional', pharmacy: 'pharmacy',
      insurance: 'insurance', ngo: 'ngo', clinic: 'clinic', structure: 'structure',
    }
    const validType = typeMap[userType] || 'patient'

    // Insert profile - user is now authenticated so RLS allows it
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId, email,
      full_name: fullName || 'Utilisateur',
      user_type: validType,
      phone: phone || null,
      gender: gender || null,
      city: city || null,
    })

    if (profileError) {
      console.error('Profile error:', profileError.message)
      // Try minimal insert as fallback
      const { error: e2 } = await supabase.from('profiles').insert({
        id: userId, email, full_name: fullName || 'Utilisateur', user_type: validType
      })
      if (e2) console.error('Fallback insert error:', e2.message)
    }

    // Create subscription
    try { await supabase.from('subscriptions').upsert({
      user_id: userId, plan: 'free', status: 'trial',
      expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    }, { onConflict: 'user_id' }) } catch(e) { console.error('sub error:', e) }

    // Welcome notification
    try { await supabase.from('notifications').insert({
      user_id: userId,
      title: 'Bienvenue sur Santé Connect Cameroun ! 🎉',
      message: 'Votre mois d\'essai gratuit est activé.',
      type: 'system',
    }) } catch(e) { console.error('notif error:', e) }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
