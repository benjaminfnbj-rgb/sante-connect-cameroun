import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails/send'

export async function POST(req: NextRequest) {
  try {
    const { to, name, orderRef, items, total, pharmacy } = await req.json()
    const result = await sendEmail.orderConfirmed(to, name, orderRef, items, total, pharmacy)
    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
