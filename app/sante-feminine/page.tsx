// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Constantes ──────────────────────────────────────────────────────────────
const SYMPTOMS = [
  {id:'douleurs',label:'Douleurs',icon:'😣'},
  {id:'fatigue',label:'Fatigue',icon:'😴'},
  {id:'migraines',label:'Migraines',icon:'🤕'},
  {id:'nausees',label:'Nausées',icon:'🤢'},
  {id:'humeur',label:'Humeur changeante',icon:'😤'},
  {id:'gonflement',label:'Gonflement',icon:'🫧'},
  {id:'acne',label:'Acné',icon:'😮'},
  {id:'saignements',label:'Saignements abondants',icon:'🩸'},
  {id:'crampes',label:'Crampes',icon:'⚡'},
  {id:'insomnie',label:'Insomnie',icon:'🌙'},
  {id:'envies',label:'Envies alimentaires',icon:'🍫'},
  {id:'sensibilite',label:'Sensibilité des seins',icon:'💗'},
]
const MOODS = [
  {id:'heureuse',label:'Heureuse',emoji:'😊'},
  {id:'neutre',label:'Neutre',emoji:'😐'},
  {id:'triste',label:'Triste',emoji:'😢'},
  {id:'anxieuse',label:'Anxieuse',emoji:'😰'},
  {id:'irritable',label:'Irritable',emoji:'😤'},
  {id:'energique',label:'Énergique',emoji:'⚡'},
  {id:'fatiguee',label:'Fatiguée',emoji:'😫'},
  {id:'romantique',label:'Romantique',emoji:'🥰'},
]
const FLOWS = [
  {id:'spotting',label:'Spotting',color:'#fda4af',dot:8},
  {id:'light',label:'Légères',color:'#f43f5e',dot:12},
  {id:'medium',label:'Modérées',color:'#be123c',dot:16},
  {id:'heavy',label:'Abondantes',color:'#881337',dot:20},
]

// ─── Calculs prédictifs ───────────────────────────────────────────────────────
function computePredictions(cycles: any[]) {
  if (!cycles.length) return null
  const lengths = cycles.slice(0,-1).map((c,i) => {
    const next = cycles[i+1]
    return Math.abs(new Date(c.cycle_start).getTime() - new Date(next.cycle_start).getTime()) / 864e5
  }).filter(l => l > 15 && l < 60)
  const avgLen = lengths.length ? Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length) : 28
  const periodLens = cycles.filter(c=>c.cycle_end).map(c => Math.abs(new Date(c.cycle_end).getTime() - new Date(c.cycle_start).getTime()) / 864e5 + 1)
  const avgPeriod = periodLens.length ? Math.round(periodLens.reduce((a,b)=>a+b,0)/periodLens.length) : 5
  const last = cycles[0]
  const lastStart = new Date(last.cycle_start)
  const nextPeriod = new Date(lastStart.getTime() + avgLen * 864e5)
  const ovulation = new Date(nextPeriod.getTime() - 14 * 864e5)
  const fertileStart = new Date(ovulation.getTime() - 5 * 864e5)
  const fertileEnd = new Date(ovulation.getTime() + 1 * 864e5)
  const today = new Date(); today.setHours(0,0,0,0)
  const daysUntil = Math.round((nextPeriod.getTime() - today.getTime()) / 864e5)
  const currentDay = Math.round((today.getTime() - lastStart.getTime()) / 864e5) + 1
  // Phase actuelle
  let phase = 'folliculaire'
  if (currentDay <= avgPeriod) phase = 'menstruation'
  else if (currentDay >= avgLen - 14 - 3 && currentDay <= avgLen - 14 + 2) phase = 'ovulation'
  else if (currentDay > avgLen - 14 + 2) phase = 'lutéale'
  return { avgLen, avgPeriod, nextPeriod, ovulation, fertileStart, fertileEnd, daysUntil, currentDay, phase }
}

const PHASE_INFO = {
  menstruation: { label:'🩸 Menstruation', color:'#be123c', bg:'#fff1f2', desc:'Votre corps se régénère. Reposez-vous, hydratez-vous bien.' },
  folliculaire: { label:'🌱 Phase Folliculaire', color:'#0d4a3a', bg:'#f0fdf4', desc:'Énergie en hausse ! Bon moment pour commencer de nouveaux projets.' },
  ovulation:    { label:'🌸 Ovulation', color:'#d97706', bg:'#fffbeb', desc:'Période de fertilité maximale. Vous êtes au sommet de votre énergie.' },
  lutéale:      { label:'🌙 Phase Lutéale', color:'#7c3aed', bg:'#f5f3ff', desc:'Ralentissez doucement. Pensez à vous et à votre bien-être.' },
}

// ─── Calendrier circulaire ────────────────────────────────────────────────────
function CycleWheel({ predictions, avgPeriod }: { predictions: any, avgPeriod: number }) {
  if (!predictions) return null
  const { avgLen, currentDay, phase } = predictions
  const cx = 110, cy = 110, r = 90, stroke = 18
  const segments = [
    { days: avgPeriod, color:'#be123c', label:'Règles' },
    { days: avgLen - 14 - avgPeriod - 3, color:'#86efac', label:'Folliculaire' },
    { days: 6, color:'#fbbf24', label:'Ovulation' },
    { days: 13, color:'#c084fc', label:'Lutéale' },
  ]
  let total = 0
  const arcs = segments.map(s => { const start = total; total += s.days; return {...s, start} })
  const toRad = (deg: number) => (deg - 90) * Math.PI / 180
  const arc = (start: number, end: number) => {
    const r2 = r; const s = toRad(start/avgLen*360); const e = toRad(end/avgLen*360)
    const x1=cx+r2*Math.cos(s), y1=cy+r2*Math.sin(s), x2=cx+r2*Math.cos(e), y2=cy+r2*Math.sin(e)
    const large = (end-start)/avgLen*360 > 180 ? 1 : 0
    return `M${x1},${y1} A${r2},${r2} 0 ${large},1 ${x2},${y2}`
  }
  const dotAngle = (currentDay-1)/avgLen*360 - 90
  const dotX = cx + (r-stroke/2)*Math.cos(dotAngle*Math.PI/180)
  const dotY = cy + (r-stroke/2)*Math.sin(dotAngle*Math.PI/180)
  return (
    <svg width={220} height={220} style={{overflow:'visible'}}>
      {/* Fond */}
      <circle cx={cx} cy={cy} r={r+stroke/2} fill="none" stroke="#f5e6f0" strokeWidth={stroke}/>
      {/* Arcs de couleur */}
      {arcs.map((seg,i) => (
        <path key={i} d={arc(seg.start, seg.start+seg.days)} fill="none" stroke={seg.color} strokeWidth={stroke} strokeLinecap="round"/>
      ))}
      {/* Indicateur aujourd'hui */}
      <circle cx={dotX} cy={dotY} r={10} fill="white" stroke="#be185d" strokeWidth={3}/>
      <circle cx={dotX} cy={dotY} r={5} fill="#be185d"/>
      {/* Centre */}
      <text x={cx} y={cy-12} textAnchor="middle" fontSize={28} fontWeight="800" fill="#be185d">J{currentDay}</text>
      <text x={cx} y={cy+10} textAnchor="middle" fontSize={11} fill="#888">Jour du cycle</text>
      <text x={cx} y={cy+26} textAnchor="middle" fontSize={10} fill="#be185d" fontWeight="700">sur {avgLen} jours</text>
    </svg>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function SanteFeministePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'home'|'log'|'calendar'|'stats'>('home')
  const [predictions, setPredictions] = useState(null)
  // Formulaire cycle
  const [showForm, setShowForm] = useState(false)
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')
  const [formFlow, setFormFlow] = useState('medium')
  const [formSymptoms, setFormSymptoms] = useState<string[]>([])
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)
  // Log journalier
  const [logDate] = useState(new Date().toISOString().split('T')[0])
  const [logFlow, setLogFlow] = useState('')
  const [logMood, setLogMood] = useState('')
  const [logPain, setLogPain] = useState(0)
  const [logEnergy, setLogEnergy] = useState(3)
  const [logSymptoms, setLogSymptoms] = useState<string[]>([])
  const [logNotes, setLogNotes] = useState('')
  const [logSaving, setLogSaving] = useState(false)
  const [logSaved, setLogSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({data:{session}}) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
      const [{data:p},{data:c},{data:todayLog}] = await Promise.all([
        sb.from('profiles').select('full_name,gender,date_of_birth').eq('id',session.user.id).single(),
        sb.from('menstrual_cycles').select('*').eq('user_id',session.user.id).order('cycle_start',{ascending:false}).limit(24),
        sb.from('cycle_daily_logs').select('*').eq('user_id',session.user.id).eq('log_date',new Date().toISOString().split('T')[0]).single(),
      ])
      setProfile(p)
      const data = c || []
      setCycles(data)
      setPredictions(computePredictions(data))
      // Pre-fill today's log
      if (todayLog) { setLogFlow(todayLog.flow||''); setLogMood(todayLog.mood||''); setLogPain(todayLog.pain_level||0); setLogEnergy(todayLog.energy||3); setLogSymptoms(todayLog.symptoms||[]); setLogNotes(todayLog.notes||''); setLogSaved(true) }
      setLoading(false)
    })
  }, [router])

  const saveCycle = async () => {
    if (!formStart) return
    setSaving(true)
    const sb = createClient()
    const { data, error } = await sb.from('menstrual_cycles').insert({
      user_id: user.id,
      cycle_start: formStart,
      period_start: formStart,
      cycle_end: formEnd || null,
      period_end: formEnd || null,
      flow_intensity: formFlow,
      symptoms: formSymptoms,
      notes: formNotes,
    }).select().single()
    if (!error && data) {
      const newCycles = [data, ...cycles]
      setCycles(newCycles)
      setPredictions(computePredictions(newCycles))
      setShowForm(false)
      setFormStart(''); setFormEnd(''); setFormFlow('medium'); setFormSymptoms([]); setFormNotes('')
    }
    setSaving(false)
  }

  const saveLog = async () => {
    setLogSaving(true)
    const sb = createClient()
    await sb.from('cycle_daily_logs').upsert({
      user_id: user.id, log_date: logDate,
      flow: logFlow || null, mood: logMood || null,
      pain_level: logPain, energy: logEnergy,
      symptoms: logSymptoms, notes: logNotes,
    }, { onConflict: 'user_id,log_date' })
    setLogSaved(true)
    setLogSaving(false)
  }

  const toggleSym = (id: string, arr: string[], set: (v:string[])=>void) =>
    set(arr.includes(id) ? arr.filter(x=>x!==id) : [...arr,id])

  const fmtDate = (d: Date) => d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
  const todayStr = new Date().toISOString().split('T')[0]
  const age = profile?.date_of_birth ? Math.floor((Date.now()-new Date(profile.date_of_birth).getTime())/315576e5) : null

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fdf2f8'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid #fce7f3',borderTopColor:'#be185d',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#fdf2f8',fontFamily:'sans-serif',paddingBottom:80}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .tab-btn:active{transform:scale(0.95)}
        .sym-chip:active{transform:scale(0.94)}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(160deg,#831843,#be185d,#db2777)',padding:'20px 16px 56px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <div style={{position:'absolute',bottom:-30,left:-30,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}}/>
        <Link href="/dashboard" style={{position:'absolute',top:16,left:16,color:'rgba(255,255,255,0.6)',textDecoration:'none',fontSize:13}}>← Retour</Link>
        <div style={{fontSize:36,marginBottom:6}}>🌸</div>
        <h1 style={{color:'white',fontFamily:'Georgia,serif',fontSize:20,fontWeight:700,margin:'0 0 3px'}}>Santé Féminine</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:12,margin:0}}>Suivi de cycle menstruel personnalisé</p>
      </div>

      <div style={{maxWidth:520,margin:'-28px auto 0',padding:'0 14px'}}>

        {/* ── NAVIGATION TABS ── */}
        <div style={{background:'white',borderRadius:20,padding:5,marginBottom:14,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:3,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',animation:'fadeUp .3s ease'}}>
          {[['home','🏠','Accueil'],['log','📝','Aujourd\'hui'],['calendar','📅','Historique'],['stats','📊','Analyses']].map(([id,icon,label])=>(
            <button key={id} className="tab-btn" onClick={()=>setTab(id as any)} style={{padding:'9px 4px',borderRadius:14,border:'none',cursor:'pointer',background:tab===id?'linear-gradient(135deg,#be185d,#db2777)':'transparent',color:tab===id?'white':'#888',fontWeight:tab===id?700:400,fontSize:10,display:'flex',flexDirection:'column',alignItems:'center',gap:2,transition:'all .2s'}}>
              <span style={{fontSize:16}}>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {/* ─────────────────── ACCUEIL ─────────────────── */}
        {tab==='home' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            {/* Bannière serviettes */}
            {(age===null||age<50) && (
              <div style={{background:'white',borderRadius:20,padding:16,marginBottom:12,display:'flex',alignItems:'center',gap:12,boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1.5px solid #fbcfe8'}}>
                <div style={{width:46,height:46,background:'#fdf2f8',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>🌸</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'#be185d',fontSize:13,marginBottom:2}}>Serviettes hygiéniques gratuites</div>
                  <div style={{color:'#9d174d',fontSize:11,lineHeight:1.5}}>Incluses dans votre abonnement · Retrait en pharmacie partenaire</div>
                </div>
                <Link href="/kit-sante" style={{background:'#be185d',color:'white',borderRadius:12,padding:'8px 12px',textDecoration:'none',fontWeight:700,fontSize:11,flexShrink:0,whiteSpace:'nowrap'}}>Retirer →</Link>
              </div>
            )}

            {/* Roue du cycle */}
            {predictions ? (
              <>
                <div style={{background:'white',borderRadius:20,padding:'20px 16px',marginBottom:12,textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                  <div style={{display:'flex',justifyContent:'center',marginBottom:14}}>
                    <CycleWheel predictions={predictions} avgPeriod={predictions.avgPeriod}/>
                  </div>
                  {/* Phase actuelle */}
                  <div style={{background:PHASE_INFO[predictions.phase].bg,borderRadius:14,padding:'12px 16px',border:`1px solid ${PHASE_INFO[predictions.phase].color}30`}}>
                    <div style={{fontWeight:700,color:PHASE_INFO[predictions.phase].color,fontSize:14,marginBottom:4}}>{PHASE_INFO[predictions.phase].label}</div>
                    <div style={{color:'#555',fontSize:12,lineHeight:1.5}}>{PHASE_INFO[predictions.phase].desc}</div>
                  </div>
                </div>

                {/* Cards prédictions */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                  {[
                    {icon:'🩸',label:'Prochaines règles',value:predictions.daysUntil<=0?'Aujourd\'hui':predictions.daysUntil===1?'Demain':`Dans ${predictions.daysUntil}j`,sub:fmtDate(predictions.nextPeriod),color:'#be185d',bg:'#fff1f2'},
                    {icon:'🌸',label:'Ovulation',value:fmtDate(predictions.ovulation),sub:`J${predictions.avgLen-14} du cycle`,color:'#d97706',bg:'#fffbeb'},
                    {icon:'💚',label:'Fenêtre fertile',value:fmtDate(predictions.fertileStart),sub:`→ ${fmtDate(predictions.fertileEnd)}`,color:'#059669',bg:'#ecfdf5'},
                    {icon:'📏',label:'Cycle moyen',value:`${predictions.avgLen} jours`,sub:`Règles: ${predictions.avgPeriod}j`,color:'#7c3aed',bg:'#f5f3ff'},
                  ].map((c,i)=>(
                    <div key={i} style={{background:'white',borderRadius:16,padding:'14px 12px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <div style={{width:32,height:32,borderRadius:10,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{c.icon}</div>
                        <div style={{color:'#aaa',fontSize:10,flex:1}}>{c.label}</div>
                      </div>
                      <div style={{color:c.color,fontWeight:800,fontSize:14}}>{c.value}</div>
                      <div style={{color:'#bbb',fontSize:10,marginTop:2}}>{c.sub}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{background:'white',borderRadius:20,padding:32,textAlign:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',marginBottom:12}}>
                <div style={{fontSize:48,marginBottom:12}}>🌸</div>
                <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:16,margin:'0 0 8px'}}>Commencer le suivi</h3>
                <p style={{color:'#888',fontSize:13,margin:'0 0 20px',lineHeight:1.6}}>Enregistrez vos premières règles pour voir vos prédictions personnalisées.</p>
                <button onClick={()=>setShowForm(true)} style={{background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',border:'none',borderRadius:50,padding:'13px 28px',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(190,24,93,0.35)'}}>
                  + Enregistrer mes règles
                </button>
              </div>
            )}

            {/* Avertissement médical */}
            <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:14,padding:'10px 14px',marginBottom:12,display:'flex',gap:10}}>
              <span style={{fontSize:16,flexShrink:0}}>ℹ️</span>
              <p style={{color:'#1e40af',fontSize:11,margin:0,lineHeight:1.5}}>Ces informations sont <strong>privées et sécurisées</strong>. Consultez un gynécologue pour tout suivi médical professionnel.</p>
            </div>

            {/* Bouton nouveau cycle */}
            <button onClick={()=>setShowForm(!showForm)} style={{width:'100%',padding:'14px',borderRadius:50,border:'none',cursor:'pointer',background:showForm?'#f0f0f0':'linear-gradient(135deg,#be185d,#db2777)',color:showForm?'#666':'white',fontWeight:700,fontSize:14,boxShadow:showForm?'none':'0 6px 20px rgba(190,24,93,0.3)',marginBottom:16}}>
              {showForm?'✕ Annuler':'+ Nouvelles règles'}
            </button>

            {/* Formulaire nouveau cycle */}
            {showForm && (
              <div style={{background:'white',borderRadius:20,padding:22,marginBottom:16,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',border:'1.5px solid #fce7f3',animation:'fadeUp .25s ease'}}>
                <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:16,margin:'0 0 16px'}}>📝 Enregistrer des règles</h3>
                
                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:6}}>Début des règles *</label>
                <input type="date" value={formStart} max={todayStr} onChange={e=>setFormStart(e.target.value)}
                  style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #fce7f3',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:14,fontFamily:'sans-serif'}}/>

                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:6}}>Fin des règles</label>
                <input type="date" value={formEnd} max={todayStr} min={formStart} onChange={e=>setFormEnd(e.target.value)}
                  style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #fce7f3',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:14,fontFamily:'sans-serif'}}/>

                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:10}}>Intensité des règles</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
                  {FLOWS.map(f=>(
                    <button key={f.id} onClick={()=>setFormFlow(f.id)} style={{padding:'10px 4px',borderRadius:12,border:`2px solid ${formFlow===f.id?f.color:'#f5f5f5'}`,background:formFlow===f.id?f.color+'20':'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <div style={{width:f.dot,height:f.dot,borderRadius:'50%',background:f.color}}/>
                      <span style={{fontSize:10,color:formFlow===f.id?f.color:'#888',fontWeight:formFlow===f.id?700:400}}>{f.label}</span>
                    </button>
                  ))}
                </div>

                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:10}}>Symptômes</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                  {SYMPTOMS.map(s=>(
                    <button key={s.id} className="sym-chip" onClick={()=>toggleSym(s.id,formSymptoms,setFormSymptoms)} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:50,border:`1.5px solid ${formSymptoms.includes(s.id)?'#be185d':'#fce7f3'}`,background:formSymptoms.includes(s.id)?'#be185d':'white',color:formSymptoms.includes(s.id)?'white':'#be185d',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                      <span>{s.icon}</span><span>{s.label}</span>
                    </button>
                  ))}
                </div>

                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:6}}>Notes personnelles</label>
                <textarea value={formNotes} onChange={e=>setFormNotes(e.target.value)} placeholder="Observations, ressentis..." rows={3}
                  style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical',marginBottom:16,fontFamily:'sans-serif'}}/>

                <div style={{display:'flex',gap:10}}>
                  <button onClick={()=>setShowForm(false)} style={{flex:1,padding:'12px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,fontSize:13,cursor:'pointer'}}>Annuler</button>
                  <button onClick={saveCycle} disabled={!formStart||saving} style={{flex:2,padding:'12px',borderRadius:50,border:'none',cursor:'pointer',background:!formStart?'#e5e7eb':'linear-gradient(135deg,#be185d,#db2777)',color:!formStart?'#aaa':'white',fontWeight:700,fontSize:13,boxShadow:formStart?'0 4px 14px rgba(190,24,93,0.3)':'none'}}>
                    {saving?'⏳ Enregistrement...':'💾 Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────── LOG JOURNALIER ─────────────────── */}
        {tab==='log' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <div style={{background:'white',borderRadius:20,padding:22,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                <div style={{flex:1}}>
                  <h2 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 2px'}}>📝 Journal du jour</h2>
                  <p style={{color:'#aaa',fontSize:11,margin:0}}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'})}</p>
                </div>
                {logSaved && <span style={{background:'#e8f5ee',color:'#16a34a',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:700}}>✓ Sauvegardé</span>}
              </div>

              {/* Flux */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:10}}>🩸 Flux aujourd'hui</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7,marginBottom:18}}>
                {[{id:'none',label:'Aucun',color:'#e5e7eb',dot:8},...FLOWS].map(f=>(
                  <button key={f.id} onClick={()=>setLogFlow(f.id)} style={{padding:'10px 4px',borderRadius:12,border:`2px solid ${logFlow===f.id?(f.id==='none'?'#6b7280':f.color):'#f5f5f5'}`,background:logFlow===f.id?(f.id==='none'?'#f9fafb':f.color+'20'):'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                    <div style={{width:f.dot,height:f.dot,borderRadius:'50%',background:f.color}}/>
                    <span style={{fontSize:9,color:logFlow===f.id?(f.id==='none'?'#6b7280':f.color):'#888',fontWeight:logFlow===f.id?700:400}}>{f.label}</span>
                  </button>
                ))}
              </div>

              {/* Humeur */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:10}}>💭 Humeur</label>
              <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:4,marginBottom:18}}>
                {MOODS.map(m=>(
                  <button key={m.id} onClick={()=>setLogMood(m.id)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 12px',borderRadius:14,border:`2px solid ${logMood===m.id?'#be185d':'#f5f5f5'}`,background:logMood===m.id?'#fff0f5':'white',cursor:'pointer',minWidth:60}}>
                    <span style={{fontSize:22}}>{m.emoji}</span>
                    <span style={{fontSize:9,color:logMood===m.id?'#be185d':'#888',fontWeight:logMood===m.id?700:400}}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Douleur + Énergie */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
                <div>
                  <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>😣 Douleur</label>
                  <div style={{display:'flex',gap:5,justifyContent:'space-between'}}>
                    {[0,1,2,3,4,5].map(v=>(
                      <button key={v} onClick={()=>setLogPain(v)} style={{width:34,height:34,borderRadius:'50%',border:`2px solid ${logPain===v?'#be185d':'#f5f5f5'}`,background:logPain===v?'#be185d':'white',color:logPain===v?'white':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>⚡ Énergie</label>
                  <div style={{display:'flex',gap:5,justifyContent:'space-between'}}>
                    {[1,2,3,4,5].map(v=>(
                      <button key={v} onClick={()=>setLogEnergy(v)} style={{width:34,height:34,borderRadius:'50%',border:`2px solid ${logEnergy===v?'#f59e0b':'#f5f5f5'}`,background:logEnergy===v?'#f59e0b':'white',color:logEnergy===v?'white':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>{'⚡'.repeat(v)}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Symptômes */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:10}}>🌡️ Symptômes</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:18}}>
                {SYMPTOMS.map(s=>(
                  <button key={s.id} className="sym-chip" onClick={()=>toggleSym(s.id,logSymptoms,setLogSymptoms)} style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:50,border:`1.5px solid ${logSymptoms.includes(s.id)?'#be185d':'#fce7f3'}`,background:logSymptoms.includes(s.id)?'#be185d':'white',color:logSymptoms.includes(s.id)?'white':'#be185d',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:6}}>📓 Notes</label>
              <textarea value={logNotes} onChange={e=>setLogNotes(e.target.value)} placeholder="Comment vous sentez-vous ?" rows={2}
                style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical',marginBottom:18,fontFamily:'sans-serif'}}/>

              <button onClick={saveLog} disabled={logSaving} style={{width:'100%',padding:'14px',borderRadius:50,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',fontWeight:700,fontSize:14,boxShadow:'0 4px 14px rgba(190,24,93,0.3)'}}>
                {logSaving?'⏳ Enregistrement...':logSaved?'✅ Mis à jour !':'💾 Sauvegarder le journal'}
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────── HISTORIQUE ─────────────────── */}
        {tab==='calendar' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <h2 style={{color:'#831843',fontFamily:'Georgia,serif',fontSize:17,margin:0}}>📜 Historique des cycles</h2>
              <button onClick={()=>{setTab('home');setTimeout(()=>setShowForm(true),100)}} style={{background:'#be185d',color:'white',border:'none',borderRadius:12,padding:'7px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>+ Nouveau</button>
            </div>
            {cycles.length===0?(
              <div style={{background:'white',borderRadius:20,padding:32,textAlign:'center'}}>
                <div style={{fontSize:40,marginBottom:12}}>🌸</div>
                <p style={{color:'#888',fontSize:14}}>Aucun cycle enregistré. Commencez le suivi !</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {cycles.map((c,i)=>{
                  const start = new Date(c.cycle_start)
                  const end = c.cycle_end ? new Date(c.cycle_end) : null
                  const dur = end ? Math.round((end.getTime()-start.getTime())/864e5)+1 : null
                  const flow = FLOWS.find(f=>f.id===c.flow_intensity)
                  return (
                    <div key={c.id} style={{background:'white',borderRadius:16,padding:16,boxShadow:'0 2px 10px rgba(0,0,0,0.05)',borderLeft:`4px solid ${flow?.color||'#be185d'}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,color:'#be185d',fontSize:14}}>{start.toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</div>
                          {end&&<div style={{color:'#aaa',fontSize:11,marginTop:2}}>→ {end.toLocaleDateString('fr-FR',{day:'2-digit',month:'long'})} · {dur}j de règles</div>}
                        </div>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          {flow&&<div style={{width:10,height:10,borderRadius:'50%',background:flow.color}}/>}
                          {i===0&&<span style={{background:'#fdf2f8',color:'#be185d',borderRadius:8,padding:'2px 8px',fontSize:10,fontWeight:700}}>Dernier</span>}
                        </div>
                      </div>
                      {c.symptoms?.length>0&&(
                        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:c.notes?8:0}}>
                          {c.symptoms.map((s:string)=>{
                            const sym = SYMPTOMS.find(x=>x.id===s)
                            return sym?<span key={s} style={{background:'#fce7f3',color:'#9d174d',borderRadius:6,padding:'2px 8px',fontSize:10}}>{sym.icon} {sym.label}</span>:null
                          })}
                        </div>
                      )}
                      {c.notes&&<p style={{color:'#555',fontSize:11,margin:'6px 0 0',fontStyle:'italic',lineHeight:1.4}}>{c.notes}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────── STATISTIQUES ─────────────────── */}
        {tab==='stats' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <h2 style={{color:'#831843',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 14px'}}>📊 Mes statistiques</h2>
            {predictions?(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {/* Durée cycle */}
                <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{fontWeight:700,color:'#0d4a3a',fontSize:14}}>⏱️ Durée du cycle</span>
                    <span style={{color:'#be185d',fontWeight:800,fontSize:20}}>{predictions.avgLen}j</span>
                  </div>
                  <div style={{height:8,background:'#fce7f3',borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min((predictions.avgLen/35)*100,100)}%`,background:'linear-gradient(90deg,#be185d,#db2777)',borderRadius:4}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
                    <span style={{color:'#bbb',fontSize:10}}>20j (court)</span>
                    <span style={{color:'#bbb',fontSize:10}}>35j (long)</span>
                  </div>
                </div>
                {/* Durée règles */}
                <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{fontWeight:700,color:'#0d4a3a',fontSize:14}}>🩸 Durée des règles</span>
                    <span style={{color:'#be185d',fontWeight:800,fontSize:20}}>{predictions.avgPeriod}j</span>
                  </div>
                  <div style={{height:8,background:'#fce7f3',borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min((predictions.avgPeriod/8)*100,100)}%`,background:'linear-gradient(90deg,#be185d,#db2777)',borderRadius:4}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
                    <span style={{color:'#bbb',fontSize:10}}>2j (court)</span>
                    <span style={{color:'#bbb',fontSize:10}}>8j (long)</span>
                  </div>
                </div>
                {/* Nombre de cycles */}
                <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontWeight:700,color:'#0d4a3a',fontSize:14}}>📅 Cycles enregistrés</span>
                    <span style={{color:'#be185d',fontWeight:800,fontSize:20}}>{cycles.length}</span>
                  </div>
                </div>
                {/* Symptômes fréquents */}
                {cycles.length>0&&(()=>{
                  const allSym = cycles.flatMap(c=>c.symptoms||[])
                  const freq: Record<string,number> = {}
                  allSym.forEach((s:string)=>{ freq[s]=(freq[s]||0)+1 })
                  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
                  return top.length>0?(
                    <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                      <p style={{fontWeight:700,color:'#0d4a3a',fontSize:14,margin:'0 0 12px'}}>🎯 Symptômes fréquents</p>
                      {top.map(([id,count])=>{
                        const s=SYMPTOMS.find(x=>x.id===id)
                        return s?(
                          <div key={id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                            <span style={{fontSize:16}}>{s.icon}</span>
                            <span style={{flex:1,fontSize:13,color:'#555'}}>{s.label}</span>
                            <div style={{width:60,height:6,background:'#fce7f3',borderRadius:3,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${(count/cycles.length)*100}%`,background:'#be185d',borderRadius:3}}/>
                            </div>
                            <span style={{color:'#be185d',fontWeight:700,fontSize:12,minWidth:20}}>{count}x</span>
                          </div>
                        ):null
                      })}
                    </div>
                  ):null
                })()}
              </div>
            ):(
              <div style={{background:'white',borderRadius:20,padding:32,textAlign:'center'}}>
                <div style={{fontSize:40,marginBottom:12}}>📊</div>
                <p style={{color:'#888',fontSize:14}}>Enregistrez au moins 2 cycles pour voir vos statistiques personnalisées.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV MOBILE ── */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #fce7f3',padding:'8px 0',display:'flex',justifyContent:'space-around',boxShadow:'0 -4px 20px rgba(0,0,0,0.08)',zIndex:100}}>
        {[['home','🏠','Accueil'],['log','📝','Aujourd\'hui'],['calendar','📅','Historique'],['stats','📊','Analyses']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'5px 16px',borderRadius:12,border:'none',background:'transparent',cursor:'pointer',color:tab===id?'#be185d':'#aaa',fontWeight:tab===id?700:400}}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontSize:9}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
