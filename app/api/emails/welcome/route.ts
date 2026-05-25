import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails/send'

export async function POST(req: NextRequest) {
  try {
    const { to, name, verifyUrl } = await req.json()
    if (!to || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const result = await sendEmail.welcome(to, name, verifyUrl || 'https://sante-connect-cameroun.vercel.app/connexion')
    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
