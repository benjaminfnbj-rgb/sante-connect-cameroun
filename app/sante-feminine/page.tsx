// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
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
  {id:'sensibilite',label:'Seins sensibles',icon:'💗'},
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
  {id:'spotting',label:'Spotting',color:'#fda4af',size:8},
  {id:'light',label:'Légères',color:'#f43f5e',size:12},
  {id:'medium',label:'Modérées',color:'#be123c',size:16},
  {id:'heavy',label:'Abondantes',color:'#881337',size:20},
]
const PADS_BRANDS = ['Always','Kotex','Nana','Naturella','Carefree','Whisper','Autre marque']

// ─── Calculs ──────────────────────────────────────────────────────────────────
function computePredictions(cycles: any[]) {
  if (!cycles.length) return null
  const lengths = cycles.slice(0,-1).map((c,i)=>{
    const n=cycles[i+1]
    return Math.abs(new Date(c.cycle_start).getTime()-new Date(n.cycle_start).getTime())/864e5
  }).filter(l=>l>15&&l<60)
  const avgLen = lengths.length ? Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length) : 28
  const periodLens = cycles.filter(c=>c.cycle_end).map(c=>Math.abs(new Date(c.cycle_end).getTime()-new Date(c.cycle_start).getTime())/864e5+1)
  const avgPeriod = periodLens.length ? Math.round(periodLens.reduce((a,b)=>a+b,0)/periodLens.length) : 5
  const last = cycles[0]
  const lastStart = new Date(last.cycle_start)
  const nextPeriod = new Date(lastStart.getTime()+avgLen*864e5)
  const ovulation = new Date(nextPeriod.getTime()-14*864e5)
  const fertileStart = new Date(ovulation.getTime()-5*864e5)
  const fertileEnd = new Date(ovulation.getTime()+864e5)
  const today = new Date(); today.setHours(0,0,0,0)
  const daysUntil = Math.round((nextPeriod.getTime()-today.getTime())/864e5)
  const currentDay = Math.round((today.getTime()-lastStart.getTime())/864e5)+1
  let phase = 'folliculaire'
  if (currentDay>=1&&currentDay<=avgPeriod) phase='menstruation'
  else if (currentDay>=avgLen-16&&currentDay<=avgLen-12) phase='ovulation'
  else if (currentDay>avgLen-12) phase='lutéale'
  return { avgLen, avgPeriod, nextPeriod, ovulation, fertileStart, fertileEnd, daysUntil, currentDay, phase }
}

const PHASE_INFO: Record<string,{label:string,color:string,bg:string,desc:string}> = {
  menstruation:{ label:'🩸 Règles', color:'#be123c', bg:'#fff1f2', desc:'Reposez-vous, hydratez-vous bien.' },
  folliculaire:{ label:'🌱 Folliculaire', color:'#0d4a3a', bg:'#f0fdf4', desc:'Énergie en hausse ! Bon moment pour de nouveaux projets.' },
  ovulation:   { label:'🌸 Ovulation', color:'#d97706', bg:'#fffbeb', desc:'Fertilité maximale. Énergie au sommet.' },
  lutéale:     { label:'🌙 Lutéale', color:'#7c3aed', bg:'#f5f3ff', desc:'Ralentissez doucement. Prenez soin de vous.' },
}

// ─── Calendrier mensuel ───────────────────────────────────────────────────────
function MonthCalendar({ cycles, predictions, dailyLogs, onDayClick }:{
  cycles:any[], predictions:any, dailyLogs:Record<string,any>, onDayClick:(d:string)=>void
}) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date(); today.setHours(0,0,0,0)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const prevMonth = () => setViewDate(new Date(year, month-1, 1))
  const nextMonth = () => setViewDate(new Date(year, month+1, 1))

  // Construire un set des jours de règles
  const periodDays = new Set<string>()
  const futurePeriodDays = new Set<string>()
  const ovulationDays = new Set<string>()
  const fertileDays = new Set<string>()

  cycles.forEach(c => {
    const start = new Date(c.cycle_start)
    const end = c.cycle_end ? new Date(c.cycle_end) : new Date(start.getTime() + (predictions?.avgPeriod||5)*864e5)
    for (let d=new Date(start); d<=end; d.setDate(d.getDate()+1))
      periodDays.add(d.toISOString().split('T')[0])
  })

  if (predictions) {
    // Prédictions futures
    const np = new Date(predictions.nextPeriod)
    for (let i=0; i<predictions.avgPeriod; i++) {
      const d = new Date(np.getTime()+i*864e5)
      if (d>=today) futurePeriodDays.add(d.toISOString().split('T')[0])
    }
    // Ovulation
    const ov = new Date(predictions.ovulation)
    ovulationDays.add(ov.toISOString().split('T')[0])
    // Fenêtre fertile
    for (let d=new Date(predictions.fertileStart); d<=predictions.fertileEnd; d.setDate(d.getDate()+1))
      fertileDays.add(d.toISOString().split('T')[0])
  }

  const days = []
  for (let i=0; i<(firstDay===0?6:firstDay-1); i++) days.push(null)
  for (let d=1; d<=daysInMonth; d++) days.push(d)

  const fmt = (d:number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  return (
    <div style={{background:'white',borderRadius:20,padding:'16px 14px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
      {/* Navigation mois */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <button onClick={prevMonth} style={{background:'#fdf2f8',border:'none',width:32,height:32,borderRadius:10,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
        <span style={{fontWeight:700,color:'#be185d',fontSize:15,fontFamily:'Georgia,serif'}}>
          {viewDate.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
        </span>
        <button onClick={nextMonth} style={{background:'#fdf2f8',border:'none',width:32,height:32,borderRadius:10,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
      </div>

      {/* Jours de la semaine */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>
        {['L','M','M','J','V','S','D'].map((d,i)=>(
          <div key={i} style={{textAlign:'center',fontSize:10,color:'#bbb',fontWeight:700,padding:'4px 0'}}>{d}</div>
        ))}
      </div>

      {/* Grille des jours */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {days.map((d,i) => {
          if (!d) return <div key={i}/>
          const key = fmt(d)
          const isPeriod = periodDays.has(key)
          const isFuturePeriod = futurePeriodDays.has(key)
          const isOvulation = ovulationDays.has(key)
          const isFertile = fertileDays.has(key) && !isOvulation
          const isToday = key === today.toISOString().split('T')[0]
          const hasLog = !!dailyLogs[key]
          const logFlow = dailyLogs[key]?.flow
          let bg = 'transparent', color = '#333', border = 'none'
          if (isPeriod) { bg='#be123c'; color='white' }
          else if (isFuturePeriod) { bg='#fce7f3'; color='#be185d' }
          else if (isOvulation) { bg='#fbbf24'; color='white' }
          else if (isFertile) { bg='#d1fae5'; color='#059669' }
          if (isToday) { border='2px solid #be185d' }
          return (
            <button key={i} onClick={()=>onDayClick(key)} style={{
              aspectRatio:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              borderRadius:10,background:bg,color,border,cursor:'pointer',position:'relative',
              fontSize:12,fontWeight:isToday?800:500,transition:'all .1s',padding:2,
            }}>
              {d}
              {hasLog && logFlow && logFlow!=='none' && (
                <div style={{width:4,height:4,borderRadius:'50%',background:isPeriod?'white':'#be185d',position:'absolute',bottom:3}}/>
              )}
            </button>
          )
        })}
      </div>

      {/* Légende */}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12,justifyContent:'center'}}>
        {[
          {color:'#be123c',label:'Règles'},
          {color:'#fce7f3',label:'Prévision',text:'#be185d'},
          {color:'#fbbf24',label:'Ovulation'},
          {color:'#d1fae5',label:'Fertile',text:'#059669'},
        ].map(l=>(
          <div key={l.label} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:10,height:10,borderRadius:3,background:l.color,flexShrink:0}}/>
            <span style={{fontSize:10,color:'#888'}}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function SanteFeministePage() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [cycles, setCycles] = useState([])
  const [dailyLogs, setDailyLogs] = useState<Record<string,any>>({})
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
  const [selectedLogDate, setSelectedLogDate] = useState(new Date().toISOString().split('T')[0])
  const [logFlow, setLogFlow] = useState('')
  const [logMood, setLogMood] = useState('')
  const [logPain, setLogPain] = useState(0)
  const [logEnergy, setLogEnergy] = useState(3)
  const [logSymptoms, setLogSymptoms] = useState<string[]>([])
  const [logNotes, setLogNotes] = useState('')
  const [logSaving, setLogSaving] = useState(false)
  const [logSaved, setLogSaved] = useState(false)
  // Préférences kit
  const [showKitPrefs, setShowKitPrefs] = useState(false)
  const [acceptCondoms, setAcceptCondoms] = useState<boolean|null>(null)
  const [acceptPads, setAcceptPads] = useState<boolean|null>(null)
  const [padsBrand, setPadsBrand] = useState('')
  const [kitSaving, setKitSaving] = useState(false)
  const router = useRouter()

  const todayStr = new Date().toISOString().split('T')[0]
  const hasPadsAccess = ['intermediate','max','family'].includes(subscription?.plan)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({data:{session}}) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
      const [{data:sub},{data:c},{data:logs}] = await Promise.all([
        sb.from('subscriptions').select('*').eq('user_id',session.user.id).single(),
        sb.from('menstrual_cycles').select('*').eq('user_id',session.user.id).order('cycle_start',{ascending:false}).limit(24),
        sb.from('cycle_daily_logs').select('*').eq('user_id',session.user.id).order('log_date',{ascending:false}).limit(90),
      ])
      setSubscription(sub)
      if (sub) { setAcceptCondoms(sub.accepts_condoms ?? true); setAcceptPads(sub.accepts_pads ?? true); setPadsBrand(sub.pads_brand_preference||'') }
      const data = c||[]
      setCycles(data)
      setPredictions(computePredictions(data))
      const logsMap: Record<string,any> = {}
      ;(logs||[]).forEach((l:any) => { logsMap[l.log_date] = l })
      setDailyLogs(logsMap)
      // Today's log pre-fill
      const tl = logsMap[todayStr]
      if (tl) { setLogFlow(tl.flow||''); setLogMood(tl.mood||''); setLogPain(tl.pain_level||0); setLogEnergy(tl.energy||3); setLogSymptoms(tl.symptoms||[]); setLogNotes(tl.notes||''); setLogSaved(true) }
      setLoading(false)
    })
  }, [router])

  const handleDayClick = useCallback((dateStr: string) => {
    setSelectedLogDate(dateStr)
    const existing = dailyLogs[dateStr]
    if (existing) { setLogFlow(existing.flow||''); setLogMood(existing.mood||''); setLogPain(existing.pain_level||0); setLogEnergy(existing.energy||3); setLogSymptoms(existing.symptoms||[]); setLogNotes(existing.notes||'') }
    else { setLogFlow(''); setLogMood(''); setLogPain(0); setLogEnergy(3); setLogSymptoms([]); setLogNotes('') }
    setLogSaved(false)
    setTab('log')
  }, [dailyLogs])

  const saveCycle = async () => {
    if (!formStart) return
    setSaving(true)
    const sb = createClient()
    const {data,error} = await sb.from('menstrual_cycles').insert({
      user_id:user.id, cycle_start:formStart, period_start:formStart,
      cycle_end:formEnd||null, period_end:formEnd||null,
      flow_intensity:formFlow, symptoms:formSymptoms, notes:formNotes,
    }).select().single()
    if (!error&&data) {
      const nc = [data,...cycles]; setCycles(nc); setPredictions(computePredictions(nc))
      setShowForm(false); setFormStart(''); setFormEnd(''); setFormFlow('medium'); setFormSymptoms([]); setFormNotes('')
    }
    setSaving(false)
  }

  const saveLog = async () => {
    setLogSaving(true)
    const sb = createClient()
    await sb.from('cycle_daily_logs').upsert({
      user_id:user.id, log_date:selectedLogDate,
      flow:logFlow||null, mood:logMood||null,
      pain_level:logPain, energy:logEnergy,
      symptoms:logSymptoms, notes:logNotes,
    },{onConflict:'user_id,log_date'})
    const newLogs = {...dailyLogs, [selectedLogDate]:{flow:logFlow,mood:logMood,pain_level:logPain,energy:logEnergy,symptoms:logSymptoms,notes:logNotes}}
    setDailyLogs(newLogs)
    setLogSaved(true); setLogSaving(false)
  }

  const saveKitPrefs = async () => {
    setKitSaving(true)
    const sb = createClient()
    await sb.from('subscriptions').update({accepts_condoms:acceptCondoms, accepts_pads:acceptPads, pads_brand_preference:padsBrand||null}).eq('user_id',user.id)
    setShowKitPrefs(false); setKitSaving(false)
  }

  const toggleSym = (id:string, arr:string[], set:(v:string[])=>void) =>
    set(arr.includes(id)?arr.filter(x=>x!==id):[...arr,id])

  const fmtDate = (d:Date) => d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fdf2f8'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid #fce7f3',borderTopColor:'#be185d',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#fdf2f8',fontFamily:'sans-serif',paddingBottom:70}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .chip:active{transform:scale(0.94)}
        .day-btn:active{opacity:0.7}
      `}</style>

      {/* ── HEADER COMPACT ── */}
      <div style={{background:'linear-gradient(160deg,#831843,#be185d)',padding:'14px 16px 16px',position:'relative'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.7)',textDecoration:'none',fontSize:13,flexShrink:0}}>← Retour</Link>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{color:'white',fontFamily:'Georgia,serif',fontSize:17,fontWeight:700}}>🌸 Santé Féminine</div>
            {predictions && (
              <div style={{color:'rgba(255,255,255,0.75)',fontSize:11,marginTop:2}}>
                {PHASE_INFO[predictions.phase].label} · J{predictions.currentDay}/{predictions.avgLen}
              </div>
            )}
          </div>
          {/* Bouton préférences kit */}
          {(hasPadsAccess || subscription?.plan==='basic') && (
            <button onClick={()=>setShowKitPrefs(true)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:10,padding:'7px 10px',cursor:'pointer',color:'white',fontSize:11,fontWeight:700,flexShrink:0}}>
              📦 Kit
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{background:'white',borderBottom:'1px solid #fce7f3',padding:'0 14px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',position:'sticky',top:0,zIndex:40}}>
        {[['home','🏠','Accueil'],['log','📝','Journal'],['calendar','📅','Calendrier'],['stats','📊','Stats']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{padding:'11px 4px',border:'none',background:'transparent',cursor:'pointer',color:tab===id?'#be185d':'#aaa',fontWeight:tab===id?700:400,fontSize:11,borderBottom:tab===id?'2.5px solid #be185d':'2.5px solid transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:1,transition:'all .15s'}}>
            <span style={{fontSize:18}}>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── MODAL PRÉFÉRENCES KIT ── */}
      {showKitPrefs && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setShowKitPrefs(false)}>
          <div style={{background:'white',borderRadius:'24px 24px 0 0',padding:'24px 20px 32px',width:'100%',maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 6px'}}>📦 Mes préférences de kit mensuel</h3>
            <p style={{color:'#888',fontSize:12,margin:'0 0 18px',lineHeight:1.5}}>Vous êtes libre de choisir ce que vous souhaitez recevoir dans votre kit mensuel.</p>

            {/* Préservatifs — disponible dès Basique */}
            <div style={{background:'#f0fdf4',borderRadius:14,padding:'14px 16px',marginBottom:12,border:'1px solid #86efac'}}>
              <div style={{fontWeight:700,color:'#0d4a3a',fontSize:14,marginBottom:10}}>🎁 Préservatifs <span style={{background:'#dcfce7',color:'#16a34a',borderRadius:6,padding:'2px 8px',fontSize:10,marginLeft:6}}>Forfait Basique+</span></div>
              <p style={{color:'#555',fontSize:12,margin:'0 0 12px'}}>Inclus dans votre abonnement pour la prévention VIH/IST.</p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setAcceptCondoms(true)} style={{flex:1,padding:'11px',borderRadius:12,border:`2px solid ${acceptCondoms===true?'#16a34a':'#e5e7eb'}`,background:acceptCondoms===true?'#f0fdf4':'white',color:acceptCondoms===true?'#16a34a':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                  ✓ Accepter
                </button>
                <button onClick={()=>setAcceptCondoms(false)} style={{flex:1,padding:'11px',borderRadius:12,border:`2px solid ${acceptCondoms===false?'#dc2626':'#e5e7eb'}`,background:acceptCondoms===false?'#fef2f2':'white',color:acceptCondoms===false?'#dc2626':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                  ✗ Refuser
                </button>
              </div>
            </div>

            {/* Serviettes — à partir de Intermédiaire */}
            <div style={{background:hasPadsAccess?'#fdf2f8':'#f9fafb',borderRadius:14,padding:'14px 16px',marginBottom:18,border:`1px solid ${hasPadsAccess?'#fbcfe8':'#e5e7eb'}`,opacity:hasPadsAccess?1:0.6}}>
              <div style={{fontWeight:700,color:hasPadsAccess?'#be185d':'#888',fontSize:14,marginBottom:4}}>
                🌸 Serviettes hygiéniques <span style={{background:'#fce7f3',color:'#be185d',borderRadius:6,padding:'2px 8px',fontSize:10,marginLeft:6}}>Forfait Intermédiaire+</span>
              </div>
              {!hasPadsAccess ? (
                <p style={{color:'#888',fontSize:12,margin:'0 0 8px'}}>Disponible à partir du Forfait Intermédiaire (1 500 FCFA/mois).</p>
              ) : (
                <>
                  <p style={{color:'#9d174d',fontSize:12,margin:'0 0 10px'}}>Choisissez votre marque préférée et si vous souhaitez les inclure dans votre kit.</p>
                  <div style={{display:'flex',gap:10,marginBottom:12}}>
                    <button onClick={()=>setAcceptPads(true)} style={{flex:1,padding:'11px',borderRadius:12,border:`2px solid ${acceptPads===true?'#be185d':'#e5e7eb'}`,background:acceptPads===true?'#fdf2f8':'white',color:acceptPads===true?'#be185d':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      ✓ Accepter
                    </button>
                    <button onClick={()=>setAcceptPads(false)} style={{flex:1,padding:'11px',borderRadius:12,border:`2px solid ${acceptPads===false?'#dc2626':'#e5e7eb'}`,background:acceptPads===false?'#fef2f2':'white',color:acceptPads===false?'#dc2626':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                      ✗ Refuser
                    </button>
                  </div>
                  {acceptPads && (
                    <>
                      <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>Marque préférée :</label>
                      <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                        {PADS_BRANDS.map(b=>(
                          <button key={b} onClick={()=>setPadsBrand(b)} style={{padding:'7px 13px',borderRadius:50,border:`1.5px solid ${padsBrand===b?'#be185d':'#fce7f3'}`,background:padsBrand===b?'#be185d':'white',color:padsBrand===b?'white':'#be185d',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                            {b}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <button onClick={saveKitPrefs} disabled={kitSaving} style={{width:'100%',padding:'14px',borderRadius:50,border:'none',background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(190,24,93,0.3)'}}>
              {kitSaving?'⏳ Enregistrement...':'💾 Sauvegarder mes préférences'}
            </button>
          </div>
        </div>
      )}

      <div style={{maxWidth:520,margin:'0 auto',padding:'14px 14px 0'}}>

        {/* ─────── ACCUEIL ─────── */}
        {tab==='home' && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:12}}>
            {/* Info médicale discrète */}
            <div style={{background:'#eff6ff',borderRadius:14,padding:'10px 14px',display:'flex',gap:8,alignItems:'flex-start'}}>
              <span style={{fontSize:14,flexShrink:0}}>ℹ️</span>
              <p style={{color:'#1e40af',fontSize:11,margin:0,lineHeight:1.5}}>Données <strong>privées & sécurisées</strong>. Consultez un gynécologue pour tout suivi médical.</p>
            </div>

            {/* Phase + prédictions */}
            {predictions ? (
              <>
                {/* Phase du cycle */}
                <div style={{background:PHASE_INFO[predictions.phase].bg,borderRadius:18,padding:'16px 18px',border:`1.5px solid ${PHASE_INFO[predictions.phase].color}30`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{fontWeight:700,color:PHASE_INFO[predictions.phase].color,fontSize:15}}>{PHASE_INFO[predictions.phase].label}</div>
                    <div style={{background:PHASE_INFO[predictions.phase].color,color:'white',borderRadius:8,padding:'3px 10px',fontSize:11,fontWeight:700}}>J{predictions.currentDay}</div>
                  </div>
                  <p style={{color:'#555',fontSize:12,margin:'0 0 10px',lineHeight:1.5}}>{PHASE_INFO[predictions.phase].desc}</p>
                  {/* Barre progression cycle */}
                  <div style={{height:5,background:'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.min((predictions.currentDay/predictions.avgLen)*100,100)}%`,background:PHASE_INFO[predictions.phase].color,borderRadius:3,transition:'width .5s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                    <span style={{fontSize:10,color:'#aaa'}}>J1</span>
                    <span style={{fontSize:10,color:'#aaa'}}>J{predictions.avgLen}</span>
                  </div>
                </div>

                {/* Cards rapides */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    {icon:'🩸',label:'Prochaines règles',value:predictions.daysUntil<=0?'Aujourd\'hui':predictions.daysUntil===1?'Demain':`J-${predictions.daysUntil}`,sub:fmtDate(predictions.nextPeriod),color:'#be185d',bg:'#fff1f2'},
                    {icon:'🌸',label:'Ovulation',value:fmtDate(predictions.ovulation),sub:`J${predictions.avgLen-14}`,color:'#d97706',bg:'#fffbeb'},
                    {icon:'💚',label:'Fenêtre fertile',value:fmtDate(predictions.fertileStart),sub:`→ ${fmtDate(predictions.fertileEnd)}`,color:'#059669',bg:'#ecfdf5'},
                    {icon:'📏',label:'Cycle / Règles',value:`${predictions.avgLen}j`,sub:`Règles: ${predictions.avgPeriod}j moy.`,color:'#7c3aed',bg:'#f5f3ff'},
                  ].map((c,i)=>(
                    <div key={i} style={{background:'white',borderRadius:14,padding:'12px 10px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                        <div style={{width:28,height:28,borderRadius:9,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{c.icon}</div>
                        <span style={{color:'#bbb',fontSize:10}}>{c.label}</span>
                      </div>
                      <div style={{color:c.color,fontWeight:800,fontSize:14}}>{c.value}</div>
                      <div style={{color:'#ccc',fontSize:10,marginTop:1}}>{c.sub}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{background:'white',borderRadius:18,padding:28,textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <div style={{fontSize:44,marginBottom:10}}>🌸</div>
                <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:16,margin:'0 0 8px'}}>Commencer le suivi</h3>
                <p style={{color:'#888',fontSize:13,margin:'0 0 16px',lineHeight:1.6}}>Enregistrez vos premières règles pour voir vos prédictions personnalisées.</p>
                <button onClick={()=>setShowForm(true)} style={{background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',border:'none',borderRadius:50,padding:'12px 24px',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                  + Enregistrer mes règles
                </button>
              </div>
            )}

            {/* Bouton nouveau cycle */}
            <button onClick={()=>setShowForm(!showForm)} style={{padding:'13px',borderRadius:50,border:'none',cursor:'pointer',background:showForm?'#f0f0f0':'linear-gradient(135deg,#be185d,#db2777)',color:showForm?'#666':'white',fontWeight:700,fontSize:14,boxShadow:showForm?'none':'0 5px 16px rgba(190,24,93,0.28)'}}>
              {showForm?'✕ Annuler':'+ Nouvelles règles'}
            </button>

            {/* Formulaire */}
            {showForm && (
              <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',border:'1.5px solid #fce7f3',animation:'fadeUp .2s ease'}}>
                <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:15,margin:'0 0 14px'}}>📝 Enregistrer des règles</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                  <div>
                    <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:5}}>Début *</label>
                    <input type="date" value={formStart} max={todayStr} onChange={e=>setFormStart(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:5}}>Fin</label>
                    <input type="date" value={formEnd} max={todayStr} min={formStart} onChange={e=>setFormEnd(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box'}}/>
                  </div>
                </div>
                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:8}}>Intensité</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:12}}>
                  {FLOWS.map(f=>(
                    <button key={f.id} onClick={()=>setFormFlow(f.id)} style={{padding:'9px 3px',borderRadius:10,border:`2px solid ${formFlow===f.id?f.color:'#f5f5f5'}`,background:formFlow===f.id?f.color+'22':'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                      <div style={{width:f.size,height:f.size,borderRadius:'50%',background:f.color}}/>
                      <span style={{fontSize:9,color:formFlow===f.id?f.color:'#aaa',fontWeight:600}}>{f.label}</span>
                    </button>
                  ))}
                </div>
                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:8}}>Symptômes</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14}}>
                  {SYMPTOMS.map(s=>(
                    <button key={s.id} className="chip" onClick={()=>toggleSym(s.id,formSymptoms,setFormSymptoms)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 11px',borderRadius:50,border:`1.5px solid ${formSymptoms.includes(s.id)?'#be185d':'#fce7f3'}`,background:formSymptoms.includes(s.id)?'#be185d':'white',color:formSymptoms.includes(s.id)?'white':'#be185d',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                      <span>{s.icon}</span><span>{s.label}</span>
                    </button>
                  ))}
                </div>
                <textarea value={formNotes} onChange={e=>setFormNotes(e.target.value)} placeholder="Notes personnelles..." rows={2} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:12,outline:'none',boxSizing:'border-box',resize:'none',marginBottom:12,fontFamily:'sans-serif'}}/>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setShowForm(false)} style={{flex:1,padding:'11px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,fontSize:13,cursor:'pointer'}}>Annuler</button>
                  <button onClick={saveCycle} disabled={!formStart||saving} style={{flex:2,padding:'11px',borderRadius:50,border:'none',cursor:'pointer',background:!formStart?'#e5e7eb':'linear-gradient(135deg,#be185d,#db2777)',color:!formStart?'#aaa':'white',fontWeight:700,fontSize:13}}>
                    {saving?'⏳ Enregistrement...':'💾 Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────── JOURNAL ─────── */}
        {tab==='log' && (
          <div style={{animation:'fadeUp .3s ease'}}>
            <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div>
                  <div style={{color:'#be185d',fontWeight:700,fontSize:15}}>📝 Journal</div>
                  <div style={{color:'#aaa',fontSize:11}}>
                    {new Date(selectedLogDate).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
                  </div>
                </div>
                {logSaved&&<span style={{background:'#e8f5ee',color:'#16a34a',borderRadius:8,padding:'3px 10px',fontSize:10,fontWeight:700}}>✓ Sauvegardé</span>}
              </div>
              {selectedLogDate!==todayStr&&(
                <div style={{background:'#fffbeb',borderRadius:10,padding:'8px 12px',marginBottom:14,fontSize:12,color:'#92400e'}}>
                  📅 Vous modifiez le journal du {new Date(selectedLogDate).toLocaleDateString('fr-FR',{day:'2-digit',month:'long'})}
                </div>
              )}
              {/* Flux */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>🩸 Flux</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:16}}>
                {[{id:'none',label:'Aucun',color:'#e5e7eb',size:8},...FLOWS].map(f=>(
                  <button key={f.id} onClick={()=>setLogFlow(f.id)} style={{padding:'9px 3px',borderRadius:10,border:`2px solid ${logFlow===f.id?(f.id==='none'?'#9ca3af':f.color):'#f5f5f5'}`,background:logFlow===f.id?f.color+'20':'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:f.size||8,height:f.size||8,borderRadius:'50%',background:f.color||'#e5e7eb'}}/>
                    <span style={{fontSize:9,color:logFlow===f.id?(f.id==='none'?'#6b7280':f.color):'#bbb',fontWeight:600}}>{f.label}</span>
                  </button>
                ))}
              </div>
              {/* Humeur */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>💭 Humeur</label>
              <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
                {MOODS.map(m=>(
                  <button key={m.id} onClick={()=>setLogMood(m.id)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'9px 10px',borderRadius:12,border:`2px solid ${logMood===m.id?'#be185d':'#f5f5f5'}`,background:logMood===m.id?'#fff0f5':'white',cursor:'pointer',minWidth:55}}>
                    <span style={{fontSize:20}}>{m.emoji}</span>
                    <span style={{fontSize:9,color:logMood===m.id?'#be185d':'#aaa',fontWeight:logMood===m.id?700:400}}>{m.label}</span>
                  </button>
                ))}
              </div>
              {/* Douleur + Énergie */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
                <div>
                  <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>😣 Douleur</label>
                  <div style={{display:'flex',gap:4}}>
                    {[0,1,2,3,4,5].map(v=>(
                      <button key={v} onClick={()=>setLogPain(v)} style={{flex:1,aspectRatio:'1',borderRadius:'50%',border:`2px solid ${logPain===v?'#be185d':'#f0f0f0'}`,background:logPain===v?'#be185d':'white',color:logPain===v?'white':'#888',fontWeight:700,fontSize:11,cursor:'pointer',padding:0}}>{v}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>⚡ Énergie</label>
                  <div style={{display:'flex',gap:4}}>
                    {[1,2,3,4,5].map(v=>(
                      <button key={v} onClick={()=>setLogEnergy(v)} style={{flex:1,aspectRatio:'1',borderRadius:'50%',border:`2px solid ${logEnergy===v?'#f59e0b':'#f0f0f0'}`,background:logEnergy===v?'#f59e0b':'white',color:logEnergy===v?'white':'#888',fontWeight:700,fontSize:10,cursor:'pointer',padding:0}}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Symptômes */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>🌡️ Symptômes</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:14}}>
                {SYMPTOMS.map(s=>(
                  <button key={s.id} className="chip" onClick={()=>toggleSym(s.id,logSymptoms,setLogSymptoms)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 11px',borderRadius:50,border:`1.5px solid ${logSymptoms.includes(s.id)?'#be185d':'#fce7f3'}`,background:logSymptoms.includes(s.id)?'#be185d':'white',color:logSymptoms.includes(s.id)?'white':'#be185d',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </button>
                ))}
              </div>
              <textarea value={logNotes} onChange={e=>setLogNotes(e.target.value)} placeholder="Notes personnelles..." rows={2} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:12,outline:'none',boxSizing:'border-box',resize:'none',marginBottom:14,fontFamily:'sans-serif'}}/>
              <button onClick={saveLog} disabled={logSaving} style={{width:'100%',padding:'14px',borderRadius:50,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',fontWeight:700,fontSize:14,boxShadow:'0 4px 14px rgba(190,24,93,0.25)'}}>
                {logSaving?'⏳ Enregistrement...':logSaved?'✅ Mis à jour !':'💾 Sauvegarder'}
              </button>
            </div>
          </div>
        )}

        {/* ─────── CALENDRIER ─────── */}
        {tab==='calendar' && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:12}}>
            <MonthCalendar cycles={cycles} predictions={predictions} dailyLogs={dailyLogs} onDayClick={handleDayClick}/>
            <p style={{color:'#be185d',fontSize:12,textAlign:'center',margin:0}}>Appuyez sur un jour pour enregistrer vos données</p>
            {/* Historique compact */}
            {cycles.length>0&&(
              <div style={{background:'white',borderRadius:18,padding:16,boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <p style={{fontWeight:700,color:'#831843',fontSize:13,margin:'0 0 12px'}}>📜 Cycles récents</p>
                {cycles.slice(0,5).map((c,i)=>{
                  const start = new Date(c.cycle_start)
                  const end = c.cycle_end?new Date(c.cycle_end):null
                  const dur = end?Math.round((end.getTime()-start.getTime())/864e5)+1:null
                  const flow = FLOWS.find(f=>f.id===c.flow_intensity)
                  return (
                    <div key={c.id} style={{display:'flex',alignItems:'center',gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<4?'1px solid #fce7f3':'none'}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:flow?.color||'#be185d',flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{color:'#be185d',fontWeight:700,fontSize:12}}>{start.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}</div>
                        {dur&&<div style={{color:'#bbb',fontSize:10}}>{dur}j de règles</div>}
                      </div>
                      {c.symptoms?.length>0&&<div style={{color:'#bbb',fontSize:10}}>{c.symptoms.length} symptôme(s)</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────── STATS ─────── */}
        {tab==='stats' && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:10}}>
            {predictions?(
              <>
                {[
                  {label:'⏱️ Durée du cycle',value:`${predictions.avgLen} jours`,max:35,current:predictions.avgLen,min:20,color:'#be185d'},
                  {label:'🩸 Durée des règles',value:`${predictions.avgPeriod} jours`,max:8,current:predictions.avgPeriod,min:2,color:'#dc2626'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'white',borderRadius:16,padding:'16px 18px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                      <span style={{fontWeight:700,color:'#0d4a3a',fontSize:13}}>{s.label}</span>
                      <span style={{color:s.color,fontWeight:800,fontSize:18}}>{s.value}</span>
                    </div>
                    <div style={{height:7,background:'#fce7f3',borderRadius:4,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${((s.current-s.min)/(s.max-s.min))*100}%`,background:`linear-gradient(90deg,${s.color},#db2777)`,borderRadius:4}}/>
                    </div>
                  </div>
                ))}
                <div style={{background:'white',borderRadius:16,padding:'16px 18px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontWeight:700,color:'#0d4a3a',fontSize:13}}>📅 Cycles enregistrés</span>
                  <span style={{color:'#be185d',fontWeight:800,fontSize:18}}>{cycles.length}</span>
                </div>
                {/* Top symptômes */}
                {(()=>{
                  const allS = cycles.flatMap(c=>c.symptoms||[])
                  const freq: Record<string,number> = {}
                  allS.forEach((s:string)=>{ freq[s]=(freq[s]||0)+1 })
                  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
                  return top.length>0?(
                    <div style={{background:'white',borderRadius:16,padding:'16px 18px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                      <p style={{fontWeight:700,color:'#0d4a3a',fontSize:13,margin:'0 0 12px'}}>🎯 Symptômes fréquents</p>
                      {top.map(([id,count])=>{
                        const s=SYMPTOMS.find(x=>x.id===id)
                        return s?(
                          <div key={id} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                            <span style={{fontSize:15}}>{s.icon}</span>
                            <span style={{flex:1,fontSize:12,color:'#555'}}>{s.label}</span>
                            <div style={{width:50,height:5,background:'#fce7f3',borderRadius:3,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${(count/cycles.length)*100}%`,background:'#be185d',borderRadius:3}}/>
                            </div>
                            <span style={{color:'#be185d',fontWeight:700,fontSize:11,minWidth:18}}>{count}×</span>
                          </div>
                        ):null
                      })}
                    </div>
                  ):null
                })()}
              </>
            ):(
              <div style={{background:'white',borderRadius:18,padding:28,textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:10}}>📊</div>
                <p style={{color:'#888',fontSize:13}}>Enregistrez au moins 2 cycles pour voir vos statistiques.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #fce7f3',display:'flex',justifyContent:'space-around',padding:'8px 0 10px',boxShadow:'0 -4px 16px rgba(0,0,0,0.06)',zIndex:50}}>
        {[['home','🏠','Accueil'],['log','📝','Journal'],['calendar','📅','Calendrier'],['stats','📊','Stats']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'3px 16px',border:'none',background:'transparent',cursor:'pointer',color:tab===id?'#be185d':'#bbb',fontWeight:tab===id?700:400}}>
            <span style={{fontSize:20}}>{icon}</span><span style={{fontSize:9}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
