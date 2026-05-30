'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Insurance() {
  const [offers, setOffers] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    createClient().from('insurance_offers').select('*, professionals(full_name)').eq('is_active', true).then(({data}) => { if (data) setOffers(data) })
  }, [])

  const typeLabels: Record<string, string> = { health:'Santé', illness:'Maladie', life:'Vie', combined:'Combinée' }
  const typeIcons: Record<string, string> = { health:'🏥', illness:'💊', life:'❤️', combined:'🛡️' }

  return (
    <div className="min-h-screen p-6" style={{background:'var(--cream)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="font-sans text-sm" style={{color:'var(--green-mid)'}}>← Tableau de bord</Link>
          <h1 className="font-display text-2xl font-bold" style={{color:'var(--green-deep)'}}>🛡️ Assurances Santé</h1>
        </div>

        <div className="feature-card p-6 mb-8">
          <h2 className="font-display text-xl font-bold mb-3" style={{color:'var(--green-deep)'}}>Protégez votre santé et celle de votre famille</h2>
          <p className="font-sans text-sm" style={{color:'var(--text-mid)'}}>
            Parcourez nos offres d&apos;assurances santé, maladie et vie proposées par nos partenaires assureurs vérifiés. Souscrivez directement en ligne.
          </p>
        </div>

        {offers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {offers.map(offer => {
              const insurer = offer.professionals as Record<string, string>
              return (
                <div key={offer.id as string} className="feature-card p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{background:'rgba(200,168,75,0.1)'}}>
                      {typeIcons[offer.coverage_type as string] || '🛡️'}
                    </div>
                    <div>
                      <h3 className="font-display font-bold" style={{color:'var(--green-deep)'}}>{offer.name as string}</h3>
                      <div className="font-sans text-sm" style={{color:'var(--text-light)'}}>{insurer?.full_name}</div>
                      <span className="badge badge-gold text-xs mt-1">{typeLabels[offer.coverage_type as string]}</span>
                    </div>
                  </div>
                  {(offer.description as string) && <p className="font-sans text-sm mb-4 leading-relaxed" style={{color:'var(--text-mid)'}}>{offer.description as string}</p>}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 rounded-xl" style={{background:'rgba(0,132,61,0.05)'}}>
                      <div className="font-display text-lg font-bold" style={{color:'var(--green-mid)'}}>{(offer.price_monthly as number)?.toLocaleString('fr-FR')}</div>
                      <div className="font-sans text-xs" style={{color:'var(--text-light)'}}>FCFA/mois</div>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{background:'rgba(200,168,75,0.08)'}}>
                      <div className="font-display text-lg font-bold" style={{color:'var(--gold)'}}>{(offer.price_annual as number)?.toLocaleString('fr-FR')}</div>
                      <div className="font-sans text-xs" style={{color:'var(--text-light)'}}>FCFA/an</div>
                    </div>
                  </div>
                  <button className="btn-primary w-full text-sm py-2.5">Souscrire en ligne →</button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div style={{fontSize:'64px', marginBottom:'16px'}}>🛡️</div>
            <p className="font-display text-2xl font-bold mb-2" style={{color:'var(--green-deep)'}}>Bientôt disponible</p>
            <p className="font-sans" style={{color:'var(--text-mid)'}}>Des partenaires assureurs rejoignent bientôt la plateforme</p>
            <Link href="/auth/register-pro" className="btn-gold mt-5 inline-block text-sm py-2.5 px-6">
              Rejoindre en tant qu&apos;assureur →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
