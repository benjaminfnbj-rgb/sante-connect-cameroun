// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Plus, Heart, Calendar, Droplets, AlertCircle } from 'lucide-react'

export default function SanteFeministePage() {
  const [cycles, setCycles] = useState<Record<string, unknown>[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [cycleStart, setCycleStart] = useState('')
  const [cycleEnd, setCycleEnd] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<Record<string, string> | null>(null)

  const symptomsList = ['Douleurs', 'Fatigue', 'Migraines', 'Nausées', 'Humeur changeante', 'Gonflement', 'Acné']

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser({ id: user.id })
      supabase.from('menstrual_cycles').select('*')
        .eq('user_id', user.id).order('cycle_start', { ascending: false })
        .then(({ data }) => { setCycles(data || []); setLoading(false) })
    })
  }, [])

  const addCycle = async () => {
    if (!cycleStart || !user) return
    const supabase = createClient()
    const { data } = await supabase.from('menstrual_cycles').insert({
      user_id: user.id,
      cycle_start: cycleStart,
      cycle_end: cycleEnd || null,
      symptoms,
      notes,
      period_length: cycleEnd ? Math.ceil((new Date(cycleEnd).getTime() - new Date(cycleStart).getTime()) / (1000*60*60*24)) : null
    }).select().single()
    if (data) { setCycles(prev => [data, ...prev]); setShowAdd(false); setCycleStart(''); setCycleEnd(''); setSymptoms([]); setNotes('') }
  }

  const lastCycle = cycles[0] as Record<string, string> | undefined
  const nextPeriod = lastCycle?.cycle_start
    ? new Date(new Date(lastCycle.cycle_start).getTime() + 28 * 24 * 60 * 60 * 1000)
    : null
  const daysToNext = nextPeriod ? Math.ceil((nextPeriod.getTime() - Date.now()) / (1000*60*60*24)) : null

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream)'}}>
      <header className="sticky top-0 z-40 px-4 py-4" style={{background: 'white', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"><ArrowLeft size={20} style={{color: 'var(--text-muted)'}} /></Link>
            <div>
              <span className="font-bold text-lg" style={{fontFamily: 'Fraunces, serif'}}>Santé Féminine</span>
              <p className="text-xs" style={{color: 'var(--text-muted)'}}>Suivi de cycle menstruel</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{background: '#db2777'}}>
            <Plus size={20} />
          </button>
        </div>
      </header>
              {/* Bannière serviettes */}
              <div style={{background:'linear-gradient(135deg,#fdf2f8,#fce7f3)',border:'1px solid #f9a8d4',borderRadius:16,padding:'14px 18px',margin:'16px 0',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:24,flexShrink:0}}>🌸</span>
                <div>
                  <p style={{fontWeight:700,color:'#be185d',fontSize:13,fontFamily:'sans-serif',margin:'0 0 3px'}}>Serviettes hygiéniques gratuites</p>
                  <p style={{color:'#9d174d',fontSize:12,fontFamily:'sans-serif',margin:0,lineHeight:1.5}}>Incluses dans votre abonnement pour les femmes de moins de 50 ans. Retirez-les dans la pharmacie partenaire la plus proche.</p>
                </div>
                <a href="/kit-sante" style={{flexShrink:0,background:'#be185d',color:'white',borderRadius:10,padding:'6px 12px',fontSize:11,fontWeight:700,textDecoration:'none',fontFamily:'sans-serif'}}>Retirer →</a>
              </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Overview card */}
        {lastCycle && (
          <div className="p-6 rounded-2xl mb-6 text-white" style={{background: 'linear-gradient(135deg, #db2777, #be185d)'}}>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} />
              <span className="font-semibold">Aperçu de votre cycle</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{fontFamily: 'Fraunces, serif'}}>
                  {daysToNext !== null ? (daysToNext > 0 ? daysToNext : 'Aujourd\'hui') : '—'}
                </p>
                <p className="text-xs opacity-80">Jours avant prochaines règles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{fontFamily: 'Fraunces, serif'}}>28</p>
                <p className="text-xs opacity-80">Durée cycle estimée</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{fontFamily: 'Fraunces, serif'}}>{cycles.length}</p>
                <p className="text-xs opacity-80">Cycles enregistrés</p>
              </div>
            </div>
          </div>
        )}

        {!lastCycle && !loading && (
          <div className="text-center py-12 mb-6 rounded-2xl" style={{background: 'white', border: '2px dashed #fce7f3'}}>
            <Heart size={40} className="mx-auto mb-3" style={{color: '#db2777'}} />
            <p className="font-semibold mb-2">Commencez le suivi de votre cycle</p>
            <p className="text-sm mb-4" style={{color: 'var(--text-muted)'}}>Enregistrez vos règles pour des prédictions personnalisées</p>
            <button onClick={() => setShowAdd(true)}
              className="px-6 py-2.5 rounded-xl font-semibold text-white"
              style={{background: '#db2777'}}>
              Ajouter mon premier cycle
            </button>
          </div>
        )}

        {/* Cycles list */}
        <h2 className="font-bold mb-4" style={{fontFamily: 'Fraunces, serif'}}>Historique des cycles</h2>
        <div className="space-y-3">
          {cycles.map((cycle, i) => {
            const c = cycle as Record<string, string>
            return (
              <div key={i} className="p-4 rounded-2xl" style={{background: 'white', border: '1px solid var(--border)'}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets size={18} style={{color: '#db2777'}} />
                    <span className="font-semibold text-sm">
                      {new Date(c.cycle_start).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </span>
                  </div>
                  {c.period_length && (
                    <span className="text-xs px-2 py-1 rounded-full" style={{background: '#fce7f3', color: '#db2777'}}>
                      {c.period_length} jours
                    </span>
                  )}
                </div>
                {c.cycle_end && (
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                    Fin: {new Date(c.cycle_end).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {c.symptoms && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(c.symptoms as unknown as string[]).map((s, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{background: '#f9a8d4', color: '#831843'}}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl" style={{background: '#fce7f3', border: '1px solid #f9a8d4'}}>
          <div className="flex items-start gap-2">
            <AlertCircle size={16} style={{color: '#db2777', flexShrink: 0, marginTop: 2}} />
            <p className="text-xs" style={{color: '#831843'}}>
              Ces informations sont stockées de manière privée et sécurisée. Consultez un gynécologue pour tout suivi médical.
            </p>
          </div>
        </div>
      </main>

      {/* Add cycle modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="w-full max-w-md rounded-3xl p-6" style={{background: 'white'}}>
            <h3 className="font-bold text-lg mb-4" style={{fontFamily: 'Fraunces, serif'}}>Nouveau cycle</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Début des règles *</label>
                <input type="date" value={cycleStart} onChange={e => setCycleStart(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{background: 'var(--bg-cream)', border: '1px solid var(--border)'}} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Fin des règles</label>
                <input type="date" value={cycleEnd} onChange={e => setCycleEnd(e.target.value)}
                  min={cycleStart}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{background: 'var(--bg-cream)', border: '1px solid var(--border)'}} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Symptômes</label>
                <div className="flex flex-wrap gap-2">
                  {symptomsList.map(s => (
                    <button key={s} onClick={() => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: symptoms.includes(s) ? '#db2777' : 'var(--bg-cream)',
                        color: symptoms.includes(s) ? 'white' : 'var(--text-muted)'
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Observations personnelles..."
                  className="w-full px-4 py-3 rounded-xl outline-none resize-none text-sm"
                  style={{background: 'var(--bg-cream)', border: '1px solid var(--border)'}} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)}
                  className="flex-1 py-3 rounded-xl font-semibold" style={{background: 'var(--bg-cream)', color: 'var(--text-muted)'}}>
                  Annuler
                </button>
                <button onClick={addCycle}
                  className="flex-1 py-3 rounded-xl font-bold text-white" style={{background: '#db2777'}}>
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
