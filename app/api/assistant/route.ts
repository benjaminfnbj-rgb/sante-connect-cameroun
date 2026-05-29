import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://bicmljgguztcnhgujube.supabase.co'
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY21samdndXp0Y25oZ3VqdWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE3MjUsImV4cCI6MjA5NTEyNzcyNX0.g4uRn5fXKDQoM_5kVBM9m12rDlIBEIHNHI93JFIpgKU'

const QUOTAS: Record<string, number> = {
  free: 0, basic: 5, intermediate: 10, max: 15, family: 30, trial: 5
}

async function getApiKey(): Promise<string> {
  try {
    const res = await fetch(`${SB_URL}/rest/v1/app_config?key=eq.anthropic_key&select=value`, {
      headers: { 'apikey': SB_ANON, 'Authorization': `Bearer ${SB_ANON}` }
    })
    const data = await res.json()
    return data?.[0]?.value || ''
  } catch { return '' }
}

const SYSTEM = `Tu es l'Assistant Santé Connect Cameroun — bienveillant, professionnel, empathique.

RÔLES :
1. Information santé générale (symptômes, maladies, prévention, nutrition, paludisme, VIH/MST, maternité)
2. Orientation vers les bons spécialistes selon les symptômes
3. Assistant clientèle (services de la plateforme, abonnements)
4. Prévention adaptée au contexte camerounais

RÈGLES ABSOLUES :
- Informations GÉNÉRALES uniquement — jamais de diagnostic médical
- Ne prescris jamais de médicaments
- Toujours recommander de consulter un professionnel de santé
- Urgence → donner 119 (SAMU) ou 112 immédiatement
- Répondre en français, avec chaleur et professionnalisme
- Réponses concises : max 4 paragraphes courts
- Tu ne peux PAS souscrire ou modifier les abonnements

SERVICES SANTÉ CONNECT :
- Rendez-vous médecins vérifiés → /rendez-vous
- Pharmacie en ligne → /pharmacie  
- Structures sanitaires → /structures
- Santé féminine → /sante-feminine
- Assurances → /assurances (Forfait Max et Famille)
- Kit santé mensuel → /kit-sante
- Forfaits : Basique 1000F, Intermédiaire 1500F, Max 2000F, Famille 2500F → /tarifs

CONTEXTE : Cameroun, 10 régions, paludisme endémique, PEV MINSANTÉ.

Termine chaque réponse médicale par : "Consultez un professionnel de santé pour un avis personnalisé."`

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, plan } = await req.json()
    
    // Vérifier quota mensuel
    const quota = QUOTAS[plan || 'free'] || 0
    const monthYear = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    if (quota === 0) {
      return NextResponse.json({
        reply: `L'assistant IA est disponible dès le **Forfait Basique** (1 000 FCFA/mois).\n\n**Nos forfaits :**\n- 🌿 Basique : 1 000 FCFA → 5 questions/mois\n- 💜 Intermédiaire : 1 500 FCFA → 10 questions/mois\n- ⭐ Max : 2 000 FCFA → 15 questions/mois\n- 👨‍👩‍👧‍👦 Famille : 2 500 FCFA → 30 questions/mois\n\n👉 [Voir les forfaits](/tarifs) ou consultez directement nos [professionnels vérifiés](/professionnels).`,
        quotaExceeded: false,
        isUpgradeMessage: true
      })
    }

    // Vérifier usage ce mois
    if (userId) {
      const sb = createClient(SB_URL, SB_ANON, {
        global: { headers: { Authorization: `Bearer ${req.headers.get('x-user-token') || SB_ANON}` } }
      })
      
      const { data: usage } = await sb.from('ai_usage')
        .select('questions_used').eq('user_id', userId).eq('month_year', monthYear).single()
      
      const used = usage?.questions_used || 0
      
      if (used >= quota) {
        return NextResponse.json({
          reply: `Vous avez utilisé vos **${quota} questions** du mois (Forfait ${plan}).\n\n🔄 Pour continuer :\n- Consultez nos **[médecins vérifiés](/professionnels)** directement\n- Passez au forfait supérieur pour plus de questions :\n  - ⭐ Forfait Max : 15 questions/mois (2 000 FCFA)\n  - 👨‍👩‍👧‍👦 Forfait Famille : 30 questions/mois (2 500 FCFA)\n\n👉 [Mettre à niveau mon abonnement](/tarifs)\n\n🚨 Urgence médicale → **119** (SAMU)`,
          quotaExceeded: true,
          used, quota
        })
      }

      // Incrémenter l'usage
      await sb.from('ai_usage').upsert({
        user_id: userId, month_year: monthYear,
        questions_used: used + 1, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,month_year' })
    }

    const apiKey = await getApiKey()
    if (!apiKey) {
      return NextResponse.json({ reply: "Je suis temporairement indisponible. 🚨 Urgence → **119** ou **112**" })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: SYSTEM, messages: messages.slice(-10) }),
    })

    if (!response.ok) {
      return NextResponse.json({ reply: "Erreur technique. Réessayez.\n\n🚨 Urgence → **119** ou **112**" })
    }

    const data = await response.json()
    return NextResponse.json({ reply: data.content?.[0]?.text || 'Désolé, je ne peux pas répondre.' })
  } catch (err) {
    return NextResponse.json({ reply: "Erreur. Réessayez.\n\n🚨 Urgence → **119** ou **112**" })
  }
}
