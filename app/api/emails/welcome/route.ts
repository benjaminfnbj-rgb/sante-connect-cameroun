import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(
  process.env.RESEND_API_KEY || 're_SK6FzEzf_7wtWabAW5XRkeQ4V2LRnMRvz'
)

// Resend free plan: use onboarding@resend.dev as sender
// Limitation: can only send to verified emails until domain is configured
// Once domain is added → change FROM to noreply@santeconnect.cm

const FROM = 'Santé Connect Cameroun <onboarding@resend.dev>'
const APP_URL = 'https://sante-connect-cameroun-git-main-benjaminfnbj-rgbs-projects.vercel.app'

export async function POST(req: NextRequest) {
  try {
    const { to, name, verifyUrl } = await req.json()
    if (!to || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="font-family:sans-serif;background:#f5f5f0;margin:0;padding:0;">
      <div style="max-width:580px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0d4a3a,#1a7a5e);padding:36px 40px;text-align:center;">
          <div style="font-size:40px;margin-bottom:8px;">🏥</div>
          <h1 style="color:white;font-size:22px;margin:0;font-family:Georgia,serif;">Santé Connect Cameroun</h1>
          <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:4px 0 0;">VOTRE SANTÉ, NOTRE PRIORITÉ</p>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#0d4a3a;font-size:22px;font-family:Georgia,serif;margin:0 0 16px;">Bienvenue ${name} ! 👋</h2>
          <p style="color:#444;line-height:1.7;font-size:15px;margin:0 0 24px;">
            Votre compte Santé Connect Cameroun a bien été créé. Cliquez sur le bouton ci-dessous pour activer votre compte et commencer à utiliser nos services.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${verifyUrl || APP_URL + '/connexion'}" style="display:inline-block;background:linear-gradient(135deg,#0d4a3a,#2eb87a);color:white;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:700;font-size:16px;box-shadow:0 8px 24px rgba(13,74,58,0.3);">
              ✅ Activer mon compte
            </a>
          </div>
          <div style="background:#f0fdf8;border-left:4px solid #2eb87a;padding:16px 20px;border-radius:0 10px 10px 0;margin:24px 0;">
            <p style="color:#0d4a3a;font-size:13px;margin:0;font-weight:700;">🎁 Votre mois d'essai gratuit est activé dès confirmation !</p>
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-top:20px;">
            <p style="color:#92400e;font-size:13px;margin:0;font-weight:600;">📋 Rappel de vos services inclus :</p>
            <p style="color:#444;font-size:13px;margin:8px 0 0;line-height:1.8;">
              ✓ Accès aux médecins vérifiés<br/>
              ✓ Pharmacie en ligne + livraison<br/>
              ✓ Assistant IA Santé<br/>
              ✓ Suivi santé féminine<br/>
              ✓ Kit santé mensuel (préservatifs + serviettes)<br/>
              ✓ Numéros d'urgence Cameroun
            </p>
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
        <div style="background:#0a1a14;padding:20px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">© 2025 Santé Connect Cameroun · Fait avec ❤️ pour la santé au Cameroun</p>
        </div>
      </div>
    </body></html>`

    const result = await resend.emails.send({
      from: FROM,
      to: [to],
      subject: '✅ Activez votre compte Santé Connect Cameroun',
      html,
    })

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (e) {
    console.error('Email error:', e)
    // Ne pas bloquer l'inscription si l'email échoue
    return NextResponse.json({ success: false, error: String(e) })
  }
}
