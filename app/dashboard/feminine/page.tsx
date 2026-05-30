'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function Feminine() {
  const [cycles, setCycles] = useState<{id:string, cycle_start:string, cycle_end:string, cycle_length:number, symptoms:string[], notes:string}[]>([])
  const [form, setForm] = useState({ cycle_start: '', cycle_end: '', notes: '', symptoms: [] as string[] })
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const symptomOptions = ['Crampes', 'Maux de tête', 'Fatigue', 'Ballonnements', 'Sautes d\'humeur', 'Douleurs dorsales', 'Nausées', 'Acné']

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) { window.location.href = '/auth/login'; return }
    const { data: u } = await createClient().from('users').select('id').eq('auth_id', session.user.id).single()
    if (u) {
      setUserId(u.id)
      const { data } = await createClient().from('menstrual_cycles').select('*').eq('user_id', u.id).order('cycle_start', {ascending:false}).limit(6)
      if (data) setCycles(data)
    }
  }

  function toggleSymptom(s: string) {
    setForm(prev => ({...prev, symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s]}))
  }

  async function saveCycle(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    const start = new Date(form.cycle_start)
    const end = form.cycle_end ? new Date(form.cycle_end) : null
    const length = end ? Math.round((end.getTime() - start.getTime()) / (1000*60*60*24)) : null
    await createClient().from('menstrual_cycles').insert({
      user_id: userId, cycle_start: form.cycle_start,
      cycle_end: form.cycle_end || null, cycle_length: length,
      symptoms: form.symptoms, notes: form.notes
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setForm({ cycle_start: '', cycle_end: '', notes: '', symptoms: [] })
    loadData()
  }

  const avgLength = cycles.filter(c => c.cycle_length).reduce((a, c) => a + c.cycle_length, 0) / (cycles.filter(c => c.cycle_length).length || 1)

  return (
    <div className="min-h-screen p-6" style={{background:'var(--cream)'}}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="font-sans text-sm" style={{color:'#E91E8B'}}>← Tableau de bord</Link>
          <h1 className="font-display text-2xl font-bold" style={{color:'#C2185B'}}>🌸 Santé Féminine</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Cycles enregistrés', value: cycles.length.toString() },
            { label: 'Durée moyenne', value: cycles.length ? `${Math.round(avgLength)} jours` : '—' },
            { label: 'Dernier cycle', value: cycles[0] ? new Date(cycles[0].cycle_start).toLocaleDateString('fr-FR', {day:'numeric', month:'short'}) : '—' }
          ].map((s, i) => (
            <div key={i} className="feature-card p-4 text-center">
              <div className="font-display text-2xl font-bold mb-1" style={{color:'#C2185B'}}>{s.value}</div>
              <div className="font-sans text-xs" style={{color:'var(--text-light)'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Add cycle */}
          <div className="feature-card p-6" style={{'--before-background':'linear-gradient(90deg, #E91E8B, #F48FB1)'} as React.CSSProperties}>
            <h2 className="font-display text-xl font-bold mb-5" style={{color:'#C2185B'}}>Ajouter un cycle</h2>
            {saved && <div className="mb-4 p-3 rounded-xl font-sans text-sm" style={{background:'rgba(233,30,139,0.1)', color:'#C2185B'}}>✓ Cycle enregistré !</div>}
            <form onSubmit={saveCycle} className="space-y-4">
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Début du cycle</label>
                <input type="date" required value={form.cycle_start} onChange={e => setForm(p => ({...p, cycle_start: e.target.value}))} className="form-input" />
              </div>
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Fin du cycle (optionnel)</label>
                <input type="date" value={form.cycle_end} onChange={e => setForm(p => ({...p, cycle_end: e.target.value}))} className="form-input" />
              </div>
              <div>
                <label className="font-sans text-sm font-medium mb-2 block" style={{color:'var(--text-mid)'}}>Symptômes</label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map(s => (
                    <button key={s} type="button" onClick={() => toggleSymptom(s)}
                      className={`font-sans text-xs px-3 py-1.5 rounded-full transition-all border ${form.symptoms.includes(s) ? 'text-white border-transparent' : 'border-pink-300 text-pink-700'}`}
                      style={{background: form.symptoms.includes(s) ? '#E91E8B' : 'transparent'}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="form-input" rows={2} placeholder="Notes personnelles..." />
              </div>
              <button type="submit" className="w-full py-3 rounded-full font-sans font-semibold text-white transition-all hover:shadow-lg" style={{background:'linear-gradient(135deg, #E91E8B, #F06292)'}}>
                ✓ Enregistrer
              </button>
            </form>
          </div>

          {/* History */}
          <div className="feature-card p-6">
            <h2 className="font-display text-xl font-bold mb-5" style={{color:'#C2185B'}}>Historique des cycles</h2>
            {cycles.length > 0 ? (
              <div className="space-y-3">
                {cycles.map(c => (
                  <div key={c.id} className="p-4 rounded-xl" style={{background:'rgba(233,30,139,0.04)', border:'1px solid rgba(233,30,139,0.12)'}}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-semibold text-sm" style={{color:'#C2185B'}}>
                        {new Date(c.cycle_start).toLocaleDateString('fr-FR', {day:'numeric', month:'long'})}
                      </span>
                      {c.cycle_length && <span className="badge text-xs" style={{background:'rgba(233,30,139,0.1)', color:'#C2185B'}}>{c.cycle_length} jours</span>}
                    </div>
                    {c.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.symptoms.map((s, i) => <span key={i} className="font-sans text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(233,30,139,0.08)', color:'#E91E8B'}}>{s}</span>)}
                      </div>
                    )}
                    {c.notes && <p className="font-sans text-xs mt-2" style={{color:'var(--text-light)'}}>{c.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div style={{fontSize:'40px', marginBottom:'12px'}}>🌸</div>
                <p className="font-sans text-sm" style={{color:'var(--text-light)'}}>Aucun cycle enregistré. Commencez votre suivi aujourd&apos;hui !</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl font-sans text-xs text-center" style={{background:'rgba(233,30,139,0.05)', color:'var(--text-light)', border:'1px solid rgba(233,30,139,0.1)'}}>
          🔒 Vos données de santé féminine sont 100% privées et ne sont jamais partagées — Confidentialité totale garantie
        </div>
      </div>
    </div>
  )
}
