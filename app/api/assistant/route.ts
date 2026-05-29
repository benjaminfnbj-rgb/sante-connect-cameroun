import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = 'https://bicmljgguztcnhgujube.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY21samdndXp0Y25oZ3VqdWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE3MjUsImV4cCI6MjA5NTEyNzcyNX0.g4uRn5fXKDQoM_5kVBM9m12rDlIBEIHNHI93JFIpgKU'

async function getAnthropicKey(): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY
  try {
    // Fetch from Supabase config (with service-level access)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_config?key=eq.anthropic_key&select=value`, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      }
    })
    const data = await res.json()
    return data?.[0]?.value || ''
  } catch { return '' }
}

const SYSTEM = `Tu es l'Assistant Santé Connect Cameroun — un assistant de santé bienveillant, professionnel et empathique, dédié à la population camerounaise.

🎯 TES RÔLES :
1. INFORMATION SANTÉ : Répondre aux questions de santé générales (symptômes courants, maladies, nutrition, prévention, hygiène, santé maternelle, vaccination, paludisme, VIH/MST, etc.)
2. ORIENTATION MÉDICALE : Identifier le type de spécialiste adapté selon les symptômes et orienter vers les services de Santé Connect Cameroun
3. ASSISTANT CLIENTÈLE : Expliquer les services de la plateforme (rendez-vous, pharmacie en ligne, kit santé, assurances, structures sanitaires, abonnement 1000 FCFA/mois)
4. PRÉVENTION : Conseils adaptés au contexte camerounais (paludisme, eau potable, alimentation, etc.)

📋 RÈGLES ABSOLUES :
- Informations GÉNÉRALES et ÉDUCATIVES uniquement — jamais de diagnostic
- Ne prescris jamais de médicaments
- Rappelle toujours de consulter un professionnel de santé
- Urgence vitale → donne immédiatement 119 (SAMU) ou 117 (Police) ou 112
- Réponds en français avec chaleur et professionnalisme
- Sois concis : max 4-5 paragraphes courts
- Tu n'as aucun droit de souscrire ou annuler des abonnements

🏥 SERVICES SANTÉ CONNECT :
- Rendez-vous avec médecins vérifiés → /rendez-vous
- Pharmacie en ligne + livraison → /pharmacie  
- Structures sanitaires (6 catégories MINSANTÉ) → /structures
- Santé féminine / cycle menstruel → /sante-feminine
- Assurances santé → /assurances
- Kit santé mensuel (préservatifs + serviettes) → /kit-sante
- Abonnement : 1000 FCFA/mois ou 10000 FCFA/an → /tarifs

⚠️ FIN DE CHAQUE RÉPONSE MÉDICALE : "Je vous recommande de consulter un professionnel de santé pour un avis personnalisé."

🇨🇲 CONTEXTE : Cameroun, 10 régions, paludisme endémique, accès aux soins variable.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = await getAnthropicKey()

    if (!apiKey) {
      return NextResponse.json({
        reply: "Je suis temporairement indisponible. Pour toute urgence médicale, appelez le **119** (SAMU) ou **112**.\n\nPour vos besoins de santé, consultez nos services : rendez-vous médecin, pharmacie en ligne et structures sanitaires disponibles sur la plateforme."
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM,
        messages: messages.slice(-10),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({
        reply: "Je rencontre une difficulté technique. Veuillez réessayer.\n\n🚨 Urgence médicale → **119** (SAMU) ou **112**"
      })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || 'Désolé, je ne peux pas répondre pour le moment.'
    return NextResponse.json({ reply: text })
  } catch (err) {
    console.error('Assistant error:', err)
    return NextResponse.json({
      reply: "Une erreur est survenue. Veuillez réessayer.\n\n🚨 Urgence → **119** ou **112**"
    })
  }
}
