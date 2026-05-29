// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SanteFeministePage() {
  const [cycles, setCycles] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ start: '', end: '', symptoms: [] as string[], notes: '' })
  const router = useRouter()

  const SYMPTOMS = ['Douleurs','Fatigue','Migraines','Nausées','Humeur changeante','Gonflement','Acné','Saignements abondants','Crampes','Insomnie']

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => { const user = session?.user;
      if (!user) { router.push('/connexion'); return }
      setUser(user)
      const { data } = await sb.from('menstrual_cycles').select('*').eq('user_id', user.id).order('cycle_start', { ascending: false }).limit(12)
      setCycles(data || [])
      setLoading(false)
    })
  }, [router])

  const toggleSymptom = (s: string) => {
    setForm(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }))
  }

  const savecycle = async () => {
    if (!form.start) return
    setSaving(true)
    const sb = createClient()
    const { data, error } = await sb.from('menstrual_cycles').insert({
      user_id: user.id, cycle_start: form.start,
      cycle_end: form.end || null, symptoms: form.symptoms, notes: form.notes
    }).select().single()
    if (!error && data) {
      setCycles(prev => [data, ...prev])
      setForm({ start: '', end: '', symptoms: [], notes: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  // Calculs prédictifs basés sur les cycles
  const avgCycleLength = cycles.length >= 2 ? Math.round(
    cycles.slice(0, -1).reduce((sum, c, i) => {
      const next = cycles[i + 1]
      const days = Math.abs(new Date(c.cycle_start).getTime() - new Date(next.cycle_start).getTime()) / (1000*60*60*24)
      return sum + days
    }, 0) / (cycles.length - 1)
  ) : 28

  const lastCycle = cycles[0]
  const nextPeriod = lastCycle ? new Date(new Date(lastCycle.cycle_start).getTime() + avgCycleLength * 24*60*60*1000) : null
  const daysUntilNext = nextPeriod ? Math.round((nextPeriod.getTime() - Date.now()) / (1000*60*60*24)) : null
  const ovulationDay = nextPeriod ? new Date(nextPeriod.getTime() - 14*24*60*60*1000) : null

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fdf2f8' }}>
      <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #be185d', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fdf2f8', fontFamily:'sans-serif', paddingBottom:40 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#831843,#be185d,#db2777)', padding:'28px 20px 48px', textAlign:'center' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.6)', fontSize:13, textDecoration:'none', display:'block', textAlign:'left', marginBottom:14 }}>← Retour</Link>
          <div style={{ fontSize:40, marginBottom:8 }}>🌸</div>
          <h1 style={{ color:'white', fontSize:22, fontFamily:'Georgia,serif', fontWeight:700, margin:'0 0 4px' }}>Santé Féminine</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, margin:0 }}>Suivi de cycle menstruel personnalisé</p>
        </div>
      </div>

      <div style={{ maxWidth:500, margin:'-20px auto 0', padding:'0 16px' }}>

        {/* Serviettes hygiéniques gratuites */}
        <div style={{ background:'white', borderRadius:20, padding:18, marginBottom:14, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1.5px solid #f9a8d4', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:48, height:48, background:'#fdf2f8', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🌸</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#be185d', fontSize:14, marginBottom:3 }}>Serviettes hygiéniques gratuites</div>
            <div style={{ color:'#9d174d', fontSize:12, lineHeight:1.5 }}>Incluses dans votre abonnement pour les femmes de moins de 50 ans. Retrait en pharmacie partenaire.</div>
          </div>
          <Link href="/kit-sante" style={{ background:'#be185d', color:'white', borderRadius:12, padding:'8px 14px', textDecoration:'none', fontWeight:700, fontSize:12, flexShrink:0 }}>
            Retirer →
          </Link>
        </div>

        {/* Stats prédictives */}
        {cycles.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
            {[
              { icon:'📅', label:'Cycle moyen', value:`${avgCycleLength}j` },
              { icon:'🔮', label:'Prochaines règles', value: daysUntilNext !== null ? (daysUntilNext <= 0 ? 'Aujourd\'hui' : `J-${daysUntilNext}`) : 'N/A' },
              { icon:'🌟', label:'Ovulation est.', value: ovulationDay ? ovulationDay.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}) : 'N/A' },
            ].map((s,i) => (
              <div key={i} style={{ background:'white', borderRadius:16, padding:'14px 10px', textAlign:'center', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid #fce7f3' }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontWeight:800, color:'#be185d', fontSize:16 }}>{s.value}</div>
                <div style={{ color:'#888', fontSize:10, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Avertissement médical */}
        <div style={{ background:'#fff1f7', border:'1px solid #fbcfe8', borderRadius:14, padding:'12px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
          <p style={{ color:'#9d174d', fontSize:12, margin:0, lineHeight:1.5 }}>Ces informations sont stockées de manière <strong>privée et sécurisée</strong>. Consultez un gynécologue pour tout suivi médical professionnel.</p>
        </div>

        {/* Bouton nouveau cycle */}
        <button onClick={() => setShowForm(!showForm)} style={{
          width:'100%', padding:'14px', borderRadius:50, border:'none', cursor:'pointer',
          background: showForm ? '#f0f0f0' : 'linear-gradient(135deg,#be185d,#db2777)',
          color: showForm ? '#666' : 'white', fontWeight:700, fontSize:15, marginBottom:16,
          boxShadow: showForm ? 'none' : '0 6px 20px rgba(190,24,93,0.35)',
        }}>
          {showForm ? '✕ Annuler' : '+ Nouveau cycle'}
        </button>

        {/* Formulaire */}
        {showForm && (
          <div style={{ background:'white', borderRadius:20, padding:24, marginBottom:16, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1.5px solid #fce7f3' }}>
            <h3 style={{ color:'#be185d', fontFamily:'Georgia,serif', fontSize:17, margin:'0 0 18px' }}>📝 Enregistrer un cycle</h3>

            <label style={{ display:'block', fontWeight:700, color:'#831843', fontSize:13, marginBottom:6 }}>Début des règles *</label>
            <input type="date" value={form.start} onChange={e => setForm(p=>({...p,start:e.target.value}))} max={new Date().toISOString().split('T')[0]}
              style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #fce7f3', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:14, fontFamily:'sans-serif' }}
            />

            <label style={{ display:'block', fontWeight:700, color:'#831843', fontSize:13, marginBottom:6 }}>Fin des règles</label>
            <input type="date" value={form.end} onChange={e => setForm(p=>({...p,end:e.target.value}))} max={new Date().toISOString().split('T')[0]}
              style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #fce7f3', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:14, fontFamily:'sans-serif' }}
            />

            <label style={{ display:'block', fontWeight:700, color:'#831843', fontSize:13, marginBottom:10 }}>Symptômes</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {SYMPTOMS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)} style={{
                  padding:'7px 14px', borderRadius:50, border:`1.5px solid ${form.symptoms.includes(s) ? '#be185d' : '#fce7f3'}`,
                  background: form.symptoms.includes(s) ? '#be185d' : 'white',
                  color: form.symptoms.includes(s) ? 'white' : '#be185d',
                  fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                }}>
                  {s}
                </button>
              ))}
            </div>

            <label style={{ display:'block', fontWeight:700, color:'#831843', fontSize:13, marginBottom:6 }}>Notes personnelles</label>
            <textarea value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} placeholder="Observations, ressentis..." rows={3}
              style={{ width:'100%', padding:'12px 14px', borderRadius:12, border:'1.5px solid #fce7f3', fontSize:13, outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:16, fontFamily:'sans-serif' }}
            />

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowForm(false)} style={{ flex:1, padding:'13px', borderRadius:50, border:'1.5px solid #e5e7eb', background:'white', color:'#666', fontWeight:700, fontSize:14, cursor:'pointer' }}>Annuler</button>
              <button onClick={savecycle} disabled={!form.start || saving} style={{
                flex:2, padding:'13px', borderRadius:50, border:'none', cursor:'pointer',
                background: !form.start ? '#e5e7eb' : 'linear-gradient(135deg,#be185d,#db2777)',
                color: !form.start ? '#aaa' : 'white', fontWeight:700, fontSize:14,
              }}>
                {saving ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* Historique */}
        <h2 style={{ color:'#831843', fontFamily:'Georgia,serif', fontSize:18, margin:'0 0 14px' }}>📜 Historique des cycles</h2>
        {cycles.length === 0 ? (
          <div style={{ background:'white', borderRadius:20, padding:32, textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🌸</div>
            <p style={{ color:'#888', fontSize:14 }}>Aucun cycle enregistré pour le moment.</p>
            <p style={{ color:'#aaa', fontSize:12 }}>Commencez à suivre votre cycle en cliquant sur &ldquo;+ Nouveau cycle&rdquo;</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {cycles.map((c,i) => {
              const start = new Date(c.cycle_start)
              const end = c.cycle_end ? new Date(c.cycle_end) : null
              const duration = end ? Math.round((end.getTime()-start.getTime())/(1000*60*60*24)) : null
              return (
                <div key={c.id} style={{ background:'white', borderRadius:18, padding:18, boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid #fce7f3' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:700, color:'#be185d', fontSize:15 }}>
                        {start.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}
                      </div>
                      {end && <div style={{ color:'#888', fontSize:12, marginTop:2 }}>→ {end.toLocaleDateString('fr-FR',{day:'2-digit',month:'long'})} · {duration}j de règles</div>}
                    </div>
                    {i === 0 && <span style={{ background:'#fdf2f8', color:'#be185d', borderRadius:8, padding:'3px 10px', fontSize:11, fontWeight:700 }}>Dernier</span>}
                  </div>
                  {c.symptoms?.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {c.symptoms.map(s => (
                        <span key={s} style={{ background:'#fce7f3', color:'#9d174d', borderRadius:6, padding:'3px 9px', fontSize:11 }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {c.notes && <p style={{ color:'#555', fontSize:12, margin:'8px 0 0', lineHeight:1.5, fontStyle:'italic' }}>{c.notes}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
