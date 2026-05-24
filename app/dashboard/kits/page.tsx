'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Kits() {
  const [receipts, setReceipts] = useState<Record<string, unknown>[]>([])
  const [user, setUser] = useState<{id:string, gender:string, date_of_birth:string, include_condoms:boolean, subscription_plan:string} | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: u } = await supabase.from('users').select('*').eq('auth_id', session.user.id).single()
    if (u) {
      setUser(u)
      const now = new Date()
      const { data } = await supabase.from('health_kit_receipts').select('*').eq('user_id', u.id).order('created_at', {ascending:false})
      if (data) setReceipts(data)
    }
  }

  async function generateReceipt() {
    if (!user) return
    setGenerating(true)
    const now = new Date()
    const age = user.date_of_birth ? (now.getFullYear() - new Date(user.date_of_birth).getFullYear()) : 999

    let kitType = 'condom'
    if (user.gender === 'female' && age < 50) {
      kitType = user.include_condoms ? 'both' : 'pad'
    } else {
      kitType = user.include_condoms ? 'condom' : 'none'
    }

    if (kitType !== 'none') {
      await supabase.from('health_kit_receipts').insert({
        user_id: user.id, kit_type: kitType,
        period_month: now.getMonth() + 1, period_year: now.getFullYear()
      })
      loadData()
    }
    setGenerating(false)
  }

  const kitLabels: Record<string, string> = { condom: '🛡️ Préservatifs', pad: '🌸 Serviettes hygiéniques', both: '🛡️🌸 Kit complet' }

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const hasCurrentReceipt = receipts.some(r => r.period_month === currentMonth && r.period_year === currentYear)

  return (
    <div className="min-h-screen p-6" style={{background:'var(--cream)'}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="font-sans text-sm" style={{color:'var(--green-mid)'}}>← Tableau de bord</Link>
          <h1 className="font-display text-2xl font-bold" style={{color:'var(--green-deep)'}}>📦 Mes Kits de Santé</h1>
        </div>

        {/* Info */}
        <div className="feature-card p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-3" style={{color:'var(--green-deep)'}}>Comment ça marche ?</h2>
          <div className="space-y-3">
            {[
              { n:'1', t:'Générez votre reçu', d:'Obtenez votre reçu mensuel pour retirer vos kits santé' },
              { n:'2', t:'Rendez-vous en pharmacie', d:'Présentez votre reçu dans la pharmacie partenaire la plus proche' },
              { n:'3', t:'Retirez vos produits', d:'Récupérez vos préservatifs et/ou serviettes hygiéniques' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-sm text-white flex-shrink-0" style={{background:'var(--green-mid)'}}>{s.n}</div>
                <div><div className="font-sans font-semibold text-sm" style={{color:'var(--text-dark)'}}>{s.t}</div><div className="font-sans text-xs" style={{color:'var(--text-light)'}}>{s.d}</div></div>
              </div>
            ))}
          </div>
        </div>

        {user?.subscription_plan === 'free' && !receipts.length ? (
          <div className="feature-card p-6 text-center">
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🔒</div>
            <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--green-deep)'}}>Abonnement requis</h3>
            <p className="font-sans text-sm mb-4" style={{color:'var(--text-mid)'}}>Les kits de santé sont inclus dans votre abonnement mensuel ou annuel</p>
            <Link href="/dashboard/subscription" className="btn-gold">Souscrire à un abonnement</Link>
          </div>
        ) : (
          <>
            {!hasCurrentReceipt && (
              <div className="feature-card p-6 mb-6 text-center">
                <div style={{fontSize:'48px', marginBottom:'12px'}}>🎁</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--green-deep)'}}>Kit de ce mois disponible</h3>
                <p className="font-sans text-sm mb-5" style={{color:'var(--text-mid)'}}>
                  Générez votre reçu pour {new Date().toLocaleDateString('fr-FR', {month:'long', year:'numeric'})}
                </p>
                <button onClick={generateReceipt} disabled={generating} className="btn-primary py-3 px-8">
                  {generating ? 'Génération...' : '✓ Générer mon reçu'}
                </button>
              </div>
            )}

            {receipts.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4" style={{color:'var(--green-deep)'}}>Mes reçus</h2>
                <div className="space-y-4">
                  {receipts.map(r => (
                    <div key={r.id as string} className="feature-card p-5">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="font-sans font-semibold" style={{color:'var(--text-dark)'}}>{kitLabels[r.kit_type as string] || r.kit_type as string}</div>
                          <div className="font-sans text-sm mt-1" style={{color:'var(--text-light)'}}>
                            {r.period_month as number}/{r.period_year as number} • Code: <span className="font-mono font-bold" style={{color:'var(--green-mid)'}}>{r.receipt_code as string}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`badge ${r.is_collected ? 'badge-green' : 'badge-gold'}`}>
                            {r.is_collected ? '✓ Retiré' : '⏳ En attente'}
                          </span>
                          {!r.is_collected && (
                            <button onClick={() => window.print()} className="btn-outline text-sm py-1.5 px-4">🖨️ Imprimer</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
