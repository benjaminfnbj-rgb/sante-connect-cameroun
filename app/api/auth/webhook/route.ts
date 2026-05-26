import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails/send'

// Supabase Auth Webhook - appelé pour chaque événement auth
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, record } = body

    if (!record?.email) {
      return NextResponse.json({ received: true })
    }

    const name = record.raw_user_meta_data?.full_name || record.email.split('@')[0]

    switch (type) {
      case 'INSERT': // Nouvel utilisateur
        await sendEmail.welcome(record.email, name)
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: String(err) }, { status: 200 }) // 200 to prevent retries
  }
}
