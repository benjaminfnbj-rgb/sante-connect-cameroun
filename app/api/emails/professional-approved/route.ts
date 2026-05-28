import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/emails/send'

export async function POST(req: NextRequest) {
  try {
    const { to, name, status } = await req.json()
    if (!to || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    if (status === 'pending') {
      // Email de réception de dossier KYC
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY || 're_SK6FzEzf_7wtWabAW5XRkeQ4V2LRnMRvz')
      await resend.emails.send({
        from: 'Santé Connect Cameroun <onboarding@resend.dev>',
        to,
        subject: '📋 Demande d\'inscription reçue — Santé Connect Cameroun',
        html: `
          <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;background:#faf8f3;padding:40px 20px">
            <div style="background:linear-gradient(135deg,#0d4a3a,#1a7a5e);borderRadius:20px;padding:32px;text-align:center;margin-bottom:28px">
              <div style="font-size:40px;margin-bottom:10px">🏥</div>
              <h1 style="color:white;font-size:20px;margin:0">Santé Connect Cameroun</h1>
            </div>
            <h2 style="color:#0d4a3a;font-size:20px">Bonjour ${name},</h2>
            <p style="color:#444;font-size:15px;line-height:1.7">Votre demande d'inscription professionnelle a bien été reçue et est en cours d'examen par notre équipe.</p>
            <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:18px;margin:20px 0">
              <p style="color:#92400e;font-size:14px;margin:0;font-weight:700">⏳ Prochaines étapes :</p>
              <p style="color:#78350f;font-size:13px;line-height:1.7;margin:10px 0 0">
                1. Envoyez vos documents officiels à <strong>kyc@santeconnect.cm</strong><br>
                2. Notre équipe vérifiera votre dossier sous 24-48h<br>
                3. Vous recevrez un email de validation ou de demande de compléments<br>
                4. Après validation, votre profil sera visible par tous les patients
              </p>
            </div>
            <p style="color:#888;font-size:12px;text-align:center;margin-top:24px">© 2025 Santé Connect Cameroun</p>
          </div>
        `
      })
    } else {
      // Email de validation finale
      const result = await sendEmail.professionalApproved(to, name)
      return NextResponse.json({ success: true, id: result.data?.id })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
