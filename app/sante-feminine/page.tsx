// @ts-nocheck
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Constantes ───────────────────────────────────────────────────────────────
const SYMPTOMS = [
  {id:'crampes',label:'Crampes',icon:'⚡'},
  {id:'douleurs',label:'Douleurs',icon:'😣'},
  {id:'fatigue',label:'Fatigue',icon:'😴'},
  {id:'migraines',label:'Migraines',icon:'🤕'},
  {id:'nausees',label:'Nausées',icon:'🤢'},
  {id:'ballonnements',label:'Ballonnements',icon:'🫧'},
  {id:'acne',label:'Acné',icon:'😮'},
  {id:'seins',label:'Seins sensibles',icon:'💗'},
  {id:'saignements',label:'Saignements abondants',icon:'🩸'},
  {id:'insomnie',label:'Insomnie',icon:'🌙'},
  {id:'envies',label:'Envies alimentaires',icon:'🍫'},
  {id:'humeur',label:'Humeur changeante',icon:'😤'},
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
const MUCUS = [
  {id:'dry',label:'Sèches',desc:'Pas de glaire',color:'#9ca3af',fertility:'Faible'},
  {id:'sticky',label:'Collantes',desc:'Épaisse, blanche',color:'#d97706',fertility:'Faible'},
  {id:'creamy',label:'Crémeuses',desc:'Blanche, opaque',color:'#f59e0b',fertility:'Moyenne'},
  {id:'watery',label:'Aqueuses',desc:'Transparente',color:'#0891b2',fertility:'Élevée'},
  {id:'egg_white',label:'Blanc d\'œuf',desc:'Transparente, élastique',color:'#16a34a',fertility:'Très élevée 🌸'},
]

// ─── Calculs prédictifs ───────────────────────────────────────────────────────
function computePredictions(cycles: any[]) {
  if (!cycles.length) return null
  const lengths = cycles.slice(0,-1).map((c,i) => {
    const n = cycles[i+1]
    return Math.abs(new Date(c.cycle_start).getTime()-new Date(n.cycle_start).getTime())/864e5
  }).filter(l => l>15&&l<60)
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
  const isIrregular = lengths.length >= 3 && Math.max(...lengths)-Math.min(...lengths) > 7
  return { avgLen, avgPeriod, nextPeriod, ovulation, fertileStart, fertileEnd, daysUntil, currentDay, phase, isIrregular }
}

const PHASE_INFO: Record<string,any> = {
  menstruation:{ label:'🩸 Règles', color:'#be123c', bg:'#fff1f2', tip:'Reposez-vous bien. Hydratez-vous et mangez du fer (légumes verts, viandes).' },
  folliculaire:{ label:'🌱 Folliculaire', color:'#0d4a3a', bg:'#f0fdf4', tip:'Énergie en hausse ! Bon moment pour démarrer de nouveaux projets et faire du sport.' },
  ovulation:   { label:'🌸 Ovulation', color:'#d97706', bg:'#fffbeb', tip:'Fertilité maximale. Glaire de type "blanc d\'œuf" ? Vous êtes probablement fertile.' },
  lutéale:     { label:'🌙 Phase Lutéale', color:'#7c3aed', bg:'#f5f3ff', tip:'Possible SPM : irritabilité, crampes, envies de sucre sont normaux. Prenez soin de vous.' },
}

// ─── Calendrier ───────────────────────────────────────────────────────────────
function MonthCalendar({ cycles, predictions, dailyLogs, onDayClick }: any) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date(); today.setHours(0,0,0,0)
  const year = viewDate.getFullYear(), month = viewDate.getMonth()
  const firstDay = new Date(year,month,1).getDay()
  const daysInMonth = new Date(year,month+1,0).getDate()
  const periodDays = new Set<string>()
  const futurePeriodDays = new Set<string>()
  const ovulationDays = new Set<string>()
  const fertileDays = new Set<string>()
  cycles.forEach((c:any) => {
    const start = new Date(c.cycle_start)
    const end = c.cycle_end ? new Date(c.cycle_end) : new Date(start.getTime()+(predictions?.avgPeriod||5)*864e5)
    for (let d=new Date(start); d<=end; d.setDate(d.getDate()+1))
      periodDays.add(d.toISOString().split('T')[0])
  })
  if (predictions) {
    const np = new Date(predictions.nextPeriod)
    for (let i=0; i<predictions.avgPeriod; i++) {
      const d = new Date(np.getTime()+i*864e5)
      if (d>=today) futurePeriodDays.add(d.toISOString().split('T')[0])
    }
    ovulationDays.add(predictions.ovulation.toISOString().split('T')[0])
    for (let d=new Date(predictions.fertileStart); d<=predictions.fertileEnd; d.setDate(d.getDate()+1))
      fertileDays.add(d.toISOString().split('T')[0])
  }
  const days: (number|null)[] = []
  for (let i=0; i<(firstDay===0?6:firstDay-1); i++) days.push(null)
  for (let d=1; d<=daysInMonth; d++) days.push(d)
  const fmt = (d:number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  return (
    <div style={{background:'white',borderRadius:18,padding:'14px 12px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <button onClick={()=>setViewDate(new Date(year,month-1,1))} style={{background:'#fdf2f8',border:'none',width:30,height:30,borderRadius:9,cursor:'pointer',fontSize:15}}>‹</button>
        <span style={{fontWeight:700,color:'#be185d',fontSize:14}}>{viewDate.toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</span>
        <button onClick={()=>setViewDate(new Date(year,month+1,1))} style={{background:'#fdf2f8',border:'none',width:30,height:30,borderRadius:9,cursor:'pointer',fontSize:15}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>
        {['L','M','M','J','V','S','D'].map((d,i)=><div key={i} style={{textAlign:'center',fontSize:9,color:'#bbb',fontWeight:700,padding:'3px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {days.map((d,i) => {
          if (!d) return <div key={i}/>
          const key = fmt(d)
          const ip = periodDays.has(key), ifp = futurePeriodDays.has(key)
          const io = ovulationDays.has(key), ife = fertileDays.has(key)&&!io
          const isToday = key===today.toISOString().split('T')[0]
          const log = dailyLogs[key]
          let bg='transparent', color='#333', border='none'
          if (ip) { bg='#be123c'; color='white' }
          else if (ifp) { bg='#fce7f3'; color='#be185d' }
          else if (io) { bg='#fbbf24'; color='white' }
          else if (ife) { bg='#d1fae5'; color='#059669' }
          if (isToday) border=`2px solid ${ip?'white':'#be185d'}`
          return (
            <button key={i} onClick={()=>onDayClick(key)} style={{aspectRatio:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRadius:8,background:bg,color,border,cursor:'pointer',fontSize:11,fontWeight:isToday?800:500,position:'relative',padding:1}}>
              {d}
              {log && (log.flow||log.mood) && (
                <div style={{width:3,height:3,borderRadius:'50%',background:ip?'rgba(255,255,255,0.7)':'#be185d',position:'absolute',bottom:2}}/>
              )}
            </button>
          )
        })}
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10,justifyContent:'center'}}>
        {[['#be123c','Règles'],['#fce7f3','Prévision'],['#fbbf24','Ovulation'],['#d1fae5','Fertile']].map(([c,l])=>(
          <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:8,height:8,borderRadius:2,background:c}}/>
            <span style={{fontSize:9,color:'#888'}}>{l}</span>
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
  // Form cycle
  const [showForm, setShowForm] = useState(false)
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')
  const [formFlow, setFormFlow] = useState('medium')
  const [formSymptoms, setFormSymptoms] = useState<string[]>([])
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)
  // Log journalier
  const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0])
  const [logFlow, setLogFlow] = useState('')
  const [logMood, setLogMood] = useState('')
  const [logPain, setLogPain] = useState(0)
  const [logEnergy, setLogEnergy] = useState(3)
  const [logStress, setLogStress] = useState(0)
  const [logSymptoms, setLogSymptoms] = useState<string[]>([])
  const [logMucus, setLogMucus] = useState('')
  const [logTemp, setLogTemp] = useState('')
  const [logWeight, setLogWeight] = useState('')
  const [logSleep, setLogSleep] = useState('')
  const [logWater, setLogWater] = useState(0)
  const [logSex, setLogSex] = useState(false)
  const [logSexProt, setLogSexProt] = useState(true)
  const [logNotes, setLogNotes] = useState('')
  const [logSaving, setLogSaving] = useState(false)
  const [logSaved, setLogSaved] = useState(false)
  // Kit prefs
  const [showKitPrefs, setShowKitPrefs] = useState(false)
  const [acceptCondoms, setAcceptCondoms] = useState<boolean|null>(null)
  const [acceptPads, setAcceptPads] = useState<boolean|null>(null)
  const [padsBrand, setPadsBrand] = useState('')
  const [kitSaving, setKitSaving] = useState(false)
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const hasPadsAccess = ['intermediate','max','family','pregnancy'].includes(subscription?.plan)

  const fillLog = useCallback((existing: any) => {
    if (!existing) { setLogFlow(''); setLogMood(''); setLogPain(0); setLogEnergy(3); setLogStress(0); setLogSymptoms([]); setLogMucus(''); setLogTemp(''); setLogWeight(''); setLogSleep(''); setLogWater(0); setLogSex(false); setLogSexProt(true); setLogNotes(''); return }
    setLogFlow(existing.flow||''); setLogMood(existing.mood||''); setLogPain(existing.pain_level||0)
    setLogEnergy(existing.energy||3); setLogStress(existing.stress_level||0); setLogSymptoms(existing.symptoms||[])
    setLogMucus(existing.cervical_mucus||''); setLogTemp(existing.basal_temp||''); setLogWeight(existing.weight||'')
    setLogSleep(existing.sleep_hours||''); setLogWater(existing.water_glasses||0); setLogSex(existing.had_sex||false)
    setLogSexProt(existing.sex_protected!==false); setLogNotes(existing.notes||'')
  }, [])

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
      if (sub) { setAcceptCondoms(sub.accepts_condoms??true); setAcceptPads(sub.accepts_pads??true); setPadsBrand(sub.pads_brand_preference||'') }
      const data = c||[]
      setCycles(data); setPredictions(computePredictions(data))
      const logsMap: Record<string,any> = {}
      ;(logs||[]).forEach((l:any) => { logsMap[l.log_date]=l })
      setDailyLogs(logsMap)
      fillLog(logsMap[today])
      setLoading(false)
    })
  }, [router])

  const handleDayClick = useCallback((dateStr: string) => {
    setSelDate(dateStr); fillLog(dailyLogs[dateStr]); setLogSaved(!!dailyLogs[dateStr]); setTab('log')
  }, [dailyLogs, fillLog])

  const saveCycle = async () => {
    if (!formStart) return
    setSaving(true)
    const sb = createClient()
    const {data,error} = await sb.from('menstrual_cycles').insert({
      user_id:user.id, cycle_start:formStart, period_start:formStart,
      cycle_end:formEnd||null, period_end:formEnd||null,
      flow_intensity:formFlow, symptoms:formSymptoms, notes:formNotes,
    }).select().single()
    if (!error&&data) { const nc=[data,...cycles]; setCycles(nc); setPredictions(computePredictions(nc)); setShowForm(false); setFormStart(''); setFormEnd(''); setFormFlow('medium'); setFormSymptoms([]); setFormNotes('') }
    setSaving(false)
  }

  const saveLog = async () => {
    setLogSaving(true)
    const sb = createClient()
    await sb.from('cycle_daily_logs').upsert({
      user_id:user.id, log_date:selDate,
      flow:logFlow||null, mood:logMood||null, pain_level:logPain, energy:logEnergy,
      stress_level:logStress, symptoms:logSymptoms, cervical_mucus:logMucus||null,
      basal_temp:logTemp?parseFloat(logTemp):null, weight:logWeight?parseFloat(logWeight):null,
      sleep_hours:logSleep?parseFloat(logSleep):null, water_glasses:logWater,
      had_sex:logSex, sex_protected:logSex?logSexProt:null, notes:logNotes||null,
    },{onConflict:'user_id,log_date'})
    const newLogs = {...dailyLogs, [selDate]:{flow:logFlow,mood:logMood,pain_level:logPain,energy:logEnergy,stress_level:logStress,symptoms:logSymptoms,cervical_mucus:logMucus,basal_temp:logTemp,weight:logWeight,sleep_hours:logSleep,water_glasses:logWater,had_sex:logSex,sex_protected:logSexProt,notes:logNotes}}
    setDailyLogs(newLogs); setLogSaved(true); setLogSaving(false)
  }

  const saveKitPrefs = async () => {
    setKitSaving(true)
    const sb = createClient()
    await sb.from('subscriptions').update({accepts_condoms:acceptCondoms,accepts_pads:acceptPads,pads_brand_preference:padsBrand||null}).eq('user_id',user.id)
    setShowKitPrefs(false); setKitSaving(false)
  }

  const toggleSym = (id:string) => setLogSymptoms(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const toggleFormSym = (id:string) => setFormSymptoms(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
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
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .chip:active{transform:scale(.94)}
      `}</style>

      {/* HEADER */}
      <div style={{background:'linear-gradient(160deg,#831843,#be185d)',padding:'14px 16px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,maxWidth:520,margin:'0 auto'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.65)',textDecoration:'none',fontSize:13}}>← Retour</Link>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{color:'white',fontFamily:'Georgia,serif',fontSize:17,fontWeight:700}}>🌸 Santé Féminine</div>
            {predictions&&<div style={{color:'rgba(255,255,255,0.7)',fontSize:11,marginTop:1}}>{PHASE_INFO[predictions.phase].label} · J{predictions.currentDay}/{predictions.avgLen}</div>}
          </div>
          <button onClick={()=>setShowKitPrefs(true)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:9,padding:'6px 9px',cursor:'pointer',color:'white',fontSize:10,fontWeight:700}}>📦 Kit</button>
        </div>
      </div>



      {/* MODAL KIT */}
      {showKitPrefs&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:200,display:'flex',alignItems:'flex-end'}} onClick={()=>setShowKitPrefs(false)}>
          <div style={{background:'white',borderRadius:'22px 22px 0 0',padding:'22px 18px 32px',width:'100%',maxWidth:500,margin:'0 auto'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:16,margin:'0 0 5px'}}>📦 Préférences Kit Mensuel</h3>
            <p style={{color:'#888',fontSize:12,margin:'0 0 16px'}}>Choisissez librement ce que vous souhaitez recevoir.</p>
            <div style={{background:'#f0fdf4',borderRadius:13,padding:'13px 14px',marginBottom:10,border:'1px solid #86efac'}}>
              <div style={{fontWeight:700,color:'#0d4a3a',fontSize:13,marginBottom:8}}>🎁 Préservatifs <span style={{background:'#dcfce7',color:'#16a34a',borderRadius:5,padding:'1px 7px',fontSize:9,marginLeft:5}}>Basique+</span></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setAcceptCondoms(true)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${acceptCondoms===true?'#16a34a':'#e5e7eb'}`,background:acceptCondoms===true?'#f0fdf4':'white',color:acceptCondoms===true?'#16a34a':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Accepter</button>
                <button onClick={()=>setAcceptCondoms(false)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${acceptCondoms===false?'#dc2626':'#e5e7eb'}`,background:acceptCondoms===false?'#fef2f2':'white',color:acceptCondoms===false?'#dc2626':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>✗ Refuser</button>
              </div>
            </div>
            <div style={{background:hasPadsAccess?'#fdf2f8':'#f9fafb',borderRadius:13,padding:'13px 14px',marginBottom:16,border:'1px solid #fbcfe8',opacity:hasPadsAccess?1:0.55}}>
              <div style={{fontWeight:700,color:hasPadsAccess?'#be185d':'#888',fontSize:13,marginBottom:hasPadsAccess?8:4}}>🌸 Serviettes <span style={{background:'#fce7f3',color:'#be185d',borderRadius:5,padding:'1px 7px',fontSize:9,marginLeft:5}}>Intermédiaire+</span></div>
              {!hasPadsAccess?<p style={{color:'#888',fontSize:11,margin:0}}>Disponible dès le Forfait Intermédiaire (1 500 F/mois)</p>:<>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <button onClick={()=>setAcceptPads(true)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${acceptPads===true?'#be185d':'#e5e7eb'}`,background:acceptPads===true?'#fdf2f8':'white',color:acceptPads===true?'#be185d':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Accepter</button>
                  <button onClick={()=>setAcceptPads(false)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${acceptPads===false?'#dc2626':'#e5e7eb'}`,background:acceptPads===false?'#fef2f2':'white',color:acceptPads===false?'#dc2626':'#888',fontWeight:700,fontSize:13,cursor:'pointer'}}>✗ Refuser</button>
                </div>
                {acceptPads&&<>
                  <p style={{color:'#831843',fontWeight:700,fontSize:11,margin:'0 0 7px'}}>Marque préférée :</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {['Always','Kotex','Nana','Naturella','Carefree','Whisper','Autre'].map(b=>(
                      <button key={b} onClick={()=>setPadsBrand(b)} style={{padding:'6px 12px',borderRadius:50,border:`1.5px solid ${padsBrand===b?'#be185d':'#fce7f3'}`,background:padsBrand===b?'#be185d':'white',color:padsBrand===b?'white':'#be185d',fontSize:11,fontWeight:600,cursor:'pointer'}}>{b}</button>
                    ))}
                  </div>
                </>}
              </>}
            </div>
            <button onClick={saveKitPrefs} disabled={kitSaving} style={{width:'100%',padding:'13px',borderRadius:50,border:'none',background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              {kitSaving?'⏳ Enregistrement...':'💾 Sauvegarder mes préférences'}
            </button>
          </div>
        </div>
      )}

      <div style={{maxWidth:520,margin:'0 auto',padding:'14px 14px 0'}}>

        {/* ─── ACCUEIL ─── */}
        {tab==='home'&&(
          <div style={{animation:'fadeUp .25s ease',display:'flex',flexDirection:'column',gap:12}}>
            {/* Conseil IA du jour selon la phase */}
            {predictions&&(
              <div style={{background:PHASE_INFO[predictions.phase].bg,borderRadius:18,padding:'14px 16px',border:`1.5px solid ${PHASE_INFO[predictions.phase].color}30`}}>
                <div style={{fontWeight:700,color:PHASE_INFO[predictions.phase].color,fontSize:14,marginBottom:5}}>{PHASE_INFO[predictions.phase].label}</div>
                <p style={{color:'#555',fontSize:12,margin:'0 0 8px',lineHeight:1.6}}>{PHASE_INFO[predictions.phase].tip}</p>
                {predictions.isIrregular&&<div style={{background:'#fffbeb',borderRadius:8,padding:'6px 10px',fontSize:11,color:'#92400e'}}>⚠️ Cycle irrégulier détecté — Les prédictions sont approximatives.</div>}
                <div style={{height:5,background:'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden',marginTop:8}}>
                  <div style={{height:'100%',width:`${Math.min((predictions.currentDay/predictions.avgLen)*100,100)}%`,background:PHASE_INFO[predictions.phase].color,borderRadius:3}}/>
                </div>
              </div>
            )}

            {/* Cards prédictions */}
            {predictions&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
                {[
                  {icon:'🩸',label:'Prochaines règles',value:predictions.daysUntil<=0?'Aujourd\'hui':predictions.daysUntil===1?'Demain':`J-${predictions.daysUntil}`,sub:fmtDate(predictions.nextPeriod),color:'#be185d',bg:'#fff1f2'},
                  {icon:'🌸',label:'Ovulation',value:fmtDate(predictions.ovulation),sub:`J${predictions.avgLen-14}`,color:'#d97706',bg:'#fffbeb'},
                  {icon:'💚',label:'Fenêtre fertile',value:`${fmtDate(predictions.fertileStart)}`,sub:`→ ${fmtDate(predictions.fertileEnd)}`,color:'#059669',bg:'#ecfdf5'},
                  {icon:'📏',label:'Cycle / Règles',value:`${predictions.avgLen}j`,sub:`Règles: ${predictions.avgPeriod}j moy.`,color:'#7c3aed',bg:'#f5f3ff'},
                ].map((c,i)=>(
                  <div key={i} style={{background:'white',borderRadius:14,padding:'11px 10px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                      <div style={{width:26,height:26,borderRadius:8,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{c.icon}</div>
                      <span style={{color:'#bbb',fontSize:9}}>{c.label}</span>
                    </div>
                    <div style={{color:c.color,fontWeight:800,fontSize:13}}>{c.value}</div>
                    <div style={{color:'#ccc',fontSize:10,marginTop:1}}>{c.sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Résumé du journal d'aujourd'hui */}
            {dailyLogs[today]&&(
              <div style={{background:'white',borderRadius:16,padding:'12px 14px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)',cursor:'pointer'}} onClick={()=>setTab('log')}>
                <p style={{fontWeight:700,color:'#be185d',fontSize:13,margin:'0 0 6px'}}>📝 Journal d'aujourd'hui</p>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {dailyLogs[today].mood&&<span style={{background:'#fdf2f8',color:'#be185d',borderRadius:7,padding:'3px 9px',fontSize:11}}>{MOODS.find(m=>m.id===dailyLogs[today].mood)?.emoji} {MOODS.find(m=>m.id===dailyLogs[today].mood)?.label}</span>}
                  {dailyLogs[today].cervical_mucus&&<span style={{background:'#e0f2fe',color:'#0891b2',borderRadius:7,padding:'3px 9px',fontSize:11}}>💧 {MUCUS.find(m=>m.id===dailyLogs[today].cervical_mucus)?.label}</span>}
                  {dailyLogs[today].symptoms?.length>0&&<span style={{background:'#f5f3ff',color:'#7c3aed',borderRadius:7,padding:'3px 9px',fontSize:11}}>{dailyLogs[today].symptoms.length} symptôme(s)</span>}
                </div>
              </div>
            )}

            {/* Sans cycle */}
            {!predictions&&(
              <div style={{background:'white',borderRadius:18,padding:28,textAlign:'center'}}>
                <div style={{fontSize:44,marginBottom:10}}>🌸</div>
                <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:16,margin:'0 0 8px'}}>Commencer le suivi</h3>
                <p style={{color:'#888',fontSize:13,margin:'0 0 16px',lineHeight:1.6}}>Enregistrez vos premières règles pour des prédictions personnalisées.</p>
                <button onClick={()=>setShowForm(true)} style={{background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',border:'none',borderRadius:50,padding:'12px 24px',fontWeight:700,fontSize:13,cursor:'pointer'}}>+ Enregistrer mes règles</button>
              </div>
            )}



            {/* Formulaire */}
            {showForm&&(
              <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 4px 16px rgba(0,0,0,0.08)',border:'1.5px solid #fce7f3',animation:'fadeUp .2s ease'}}>
                <h3 style={{color:'#be185d',fontFamily:'Georgia,serif',fontSize:15,margin:'0 0 14px'}}>📝 Enregistrer des règles</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:12}}>
                  <div><label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:4}}>Début *</label>
                    <input type="date" value={formStart} max={today} onChange={e=>setFormStart(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box'}}/></div>
                  <div><label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:4}}>Fin</label>
                    <input type="date" value={formEnd} max={today} min={formStart} onChange={e=>setFormEnd(e.target.value)} style={{width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box'}}/></div>
                </div>
                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:8}}>Intensité</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:12}}>
                  {FLOWS.map(f=><button key={f.id} onClick={()=>setFormFlow(f.id)} style={{padding:'9px 3px',borderRadius:10,border:`2px solid ${formFlow===f.id?f.color:'#f5f5f5'}`,background:formFlow===f.id?f.color+'22':'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:f.size,height:f.size,borderRadius:'50%',background:f.color}}/><span style={{fontSize:9,color:formFlow===f.id?f.color:'#aaa',fontWeight:600}}>{f.label}</span>
                  </button>)}
                </div>
                <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:11,marginBottom:8}}>Symptômes</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                  {SYMPTOMS.map(s=><button key={s.id} className="chip" onClick={()=>toggleFormSym(s.id)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:50,border:`1.5px solid ${formSymptoms.includes(s.id)?'#be185d':'#fce7f3'}`,background:formSymptoms.includes(s.id)?'#be185d':'white',color:formSymptoms.includes(s.id)?'white':'#be185d',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </button>)}
                </div>
                <textarea value={formNotes} onChange={e=>setFormNotes(e.target.value)} placeholder="Notes..." rows={2} style={{width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:12,outline:'none',boxSizing:'border-box',resize:'none',marginBottom:12,fontFamily:'sans-serif'}}/>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setShowForm(false)} style={{flex:1,padding:'11px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,fontSize:12,cursor:'pointer'}}>Annuler</button>
                  <button onClick={saveCycle} disabled={!formStart||saving} style={{flex:2,padding:'11px',borderRadius:50,border:'none',background:!formStart?'#e5e7eb':'linear-gradient(135deg,#be185d,#db2777)',color:!formStart?'#aaa':'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                    {saving?'⏳...':'💾 Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── JOURNAL (inspiré Flo) ─── */}
        {tab==='log'&&(
          <div style={{animation:'fadeUp .25s ease'}}>
            <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div>
                  <div style={{color:'#be185d',fontWeight:700,fontSize:15}}>📝 Journal</div>
                  <div style={{color:'#aaa',fontSize:11}}>{new Date(selDate).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'})}</div>
                </div>
                {logSaved&&<span style={{background:'#e8f5ee',color:'#16a34a',borderRadius:8,padding:'3px 9px',fontSize:10,fontWeight:700}}>✓ Sauvegardé</span>}
              </div>
              {selDate!==today&&<div style={{background:'#fffbeb',borderRadius:9,padding:'7px 11px',marginBottom:14,fontSize:11,color:'#92400e'}}>📅 Modification du {new Date(selDate).toLocaleDateString('fr-FR',{day:'2-digit',month:'long'})}</div>}

              {/* FLUX */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>🩸 Flux</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5,marginBottom:16}}>
                {[{id:'none',label:'Aucun',color:'#e5e7eb',size:8},...FLOWS].map(f=>(
                  <button key={f.id} onClick={()=>setLogFlow(f.id)} style={{padding:'8px 2px',borderRadius:9,border:`2px solid ${logFlow===f.id?(f.id==='none'?'#6b7280':f.color):'#f5f5f5'}`,background:logFlow===f.id?f.color+'20':'white',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                    <div style={{width:f.size||8,height:f.size||8,borderRadius:'50%',background:f.color||'#e5e7eb'}}/><span style={{fontSize:9,color:logFlow===f.id?(f.id==='none'?'#6b7280':f.color):'#bbb',fontWeight:600}}>{f.label}</span>
                  </button>
                ))}
              </div>

              {/* GLAIRE CERVICALE — Nouveau (Flo) */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>💧 Glaires cervicales</label>
              <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:4,marginBottom:4}}>
                {MUCUS.map(m=>(
                  <button key={m.id} onClick={()=>setLogMucus(m.id)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'8px 10px',borderRadius:11,border:`2px solid ${logMucus===m.id?m.color:'#f5f5f5'}`,background:logMucus===m.id?m.color+'18':'white',cursor:'pointer',minWidth:68}}>
                    <div style={{width:14,height:14,borderRadius:'50%',background:m.color}}/>
                    <span style={{fontSize:10,color:logMucus===m.id?m.color:'#888',fontWeight:logMucus===m.id?700:400,textAlign:'center'}}>{m.label}</span>
                  </button>
                ))}
              </div>
              {logMucus&&(
                <div style={{background:'#e0f2fe',borderRadius:8,padding:'5px 10px',marginBottom:14,fontSize:11,color:'#0891b2'}}>
                  💧 {MUCUS.find(m=>m.id===logMucus)?.desc} · Fertilité : <strong>{MUCUS.find(m=>m.id===logMucus)?.fertility}</strong>
                </div>
              )}
              {!logMucus&&<div style={{height:14}}/>}

              {/* HUMEUR */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>💭 Humeur</label>
              <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:4,marginBottom:16}}>
                {MOODS.map(m=>(
                  <button key={m.id} onClick={()=>setLogMood(m.id)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'8px 9px',borderRadius:11,border:`2px solid ${logMood===m.id?'#be185d':'#f5f5f5'}`,background:logMood===m.id?'#fff0f5':'white',cursor:'pointer',minWidth:52}}>
                    <span style={{fontSize:20}}>{m.emoji}</span><span style={{fontSize:9,color:logMood===m.id?'#be185d':'#aaa',fontWeight:logMood===m.id?700:400}}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* DOULEUR + ÉNERGIE + STRESS */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
                {[
                  {label:'😣 Douleur',val:logPain,set:setLogPain,max:5,color:'#be185d'},
                  {label:'⚡ Énergie',val:logEnergy,set:setLogEnergy,max:5,color:'#f59e0b'},
                  {label:'😰 Stress',val:logStress,set:setLogStress,max:5,color:'#7c3aed'},
                ].map(({label,val,set,max,color})=>(
                  <div key={label}>
                    <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:10,marginBottom:6}}>{label}</label>
                    <div style={{display:'flex',gap:3}}>
                      {Array.from({length:max+1},(_,v)=>(
                        <button key={v} onClick={()=>set(v)} style={{flex:1,aspectRatio:'1',borderRadius:'50%',border:`2px solid ${val===v?color:'#f0f0f0'}`,background:val===v?color:'white',color:val===v?'white':'#888',fontWeight:700,fontSize:10,cursor:'pointer',padding:0}}>{v}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* SYMPTÔMES */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>🌡️ Symptômes</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
                {SYMPTOMS.map(s=>(
                  <button key={s.id} className="chip" onClick={()=>toggleSym(s.id)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 10px',borderRadius:50,border:`1.5px solid ${logSymptoms.includes(s.id)?'#be185d':'#fce7f3'}`,background:logSymptoms.includes(s.id)?'#be185d':'white',color:logSymptoms.includes(s.id)?'white':'#be185d',fontSize:11,fontWeight:600,cursor:'pointer'}}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* DONNÉES BIOMÉTRIQUES — Nouveau (Flo) */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>📊 Données corporelles</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:12}}>
                {[
                  {label:'🌡️ Température basale (°C)',val:logTemp,set:setLogTemp,ph:'36.5',type:'number'},
                  {label:'⚖️ Poids (kg)',val:logWeight,set:setLogWeight,ph:'65',type:'number'},
                  {label:'😴 Sommeil (heures)',val:logSleep,set:setLogSleep,ph:'8',type:'number'},
                ].map(({label,val,set,ph,type})=>(
                  <div key={label}>
                    <label style={{display:'block',color:'#9d174d',fontSize:10,fontWeight:600,marginBottom:4}}>{label}</label>
                    <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:'100%',padding:'9px 10px',borderRadius:9,border:'1.5px solid #fce7f3',fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'sans-serif'}}/>
                  </div>
                ))}
                <div>
                  <label style={{display:'block',color:'#9d174d',fontSize:10,fontWeight:600,marginBottom:4}}>💧 Verres d'eau</label>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button onClick={()=>setLogWater(Math.max(0,logWater-1))} style={{width:32,height:32,borderRadius:'50%',border:'1.5px solid #fce7f3',background:'white',cursor:'pointer',fontWeight:700,fontSize:16}}>−</button>
                    <span style={{fontWeight:800,color:'#0891b2',fontSize:18,minWidth:24,textAlign:'center'}}>{logWater}</span>
                    <button onClick={()=>setLogWater(logWater+1)} style={{width:32,height:32,borderRadius:'50%',border:'none',background:'#0891b2',color:'white',cursor:'pointer',fontWeight:700,fontSize:16}}>+</button>
                  </div>
                </div>
              </div>

              {/* RAPPORTS SEXUELS — Nouveau (Flo) */}
              <label style={{display:'block',fontWeight:700,color:'#831843',fontSize:12,marginBottom:8}}>💑 Rapports sexuels</label>
              <div style={{display:'flex',gap:8,marginBottom:logSex?10:16}}>
                <button onClick={()=>setLogSex(false)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${!logSex?'#be185d':'#f5f5f5'}`,background:!logSex?'#fff0f5':'white',color:!logSex?'#be185d':'#888',fontWeight:700,fontSize:12,cursor:'pointer'}}>Non</button>
                <button onClick={()=>setLogSex(true)} style={{flex:1,padding:'10px',borderRadius:10,border:`2px solid ${logSex?'#be185d':'#f5f5f5'}`,background:logSex?'#fff0f5':'white',color:logSex?'#be185d':'#888',fontWeight:700,fontSize:12,cursor:'pointer'}}>Oui</button>
              </div>
              {logSex&&(
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <button onClick={()=>setLogSexProt(true)} style={{flex:1,padding:'9px',borderRadius:10,border:`2px solid ${logSexProt?'#16a34a':'#f5f5f5'}`,background:logSexProt?'#f0fdf4':'white',color:logSexProt?'#16a34a':'#888',fontWeight:700,fontSize:11,cursor:'pointer'}}>🛡️ Protégé</button>
                  <button onClick={()=>setLogSexProt(false)} style={{flex:1,padding:'9px',borderRadius:10,border:`2px solid ${!logSexProt?'#d97706':'#f5f5f5'}`,background:!logSexProt?'#fffbeb':'white',color:!logSexProt?'#d97706':'#888',fontWeight:700,fontSize:11,cursor:'pointer'}}>⚠️ Non protégé</button>
                </div>
              )}

              {/* NOTES */}
              <textarea value={logNotes} onChange={e=>setLogNotes(e.target.value)} placeholder="Notes personnelles..." rows={2} style={{width:'100%',padding:'10px',borderRadius:10,border:'1.5px solid #fce7f3',fontSize:12,outline:'none',boxSizing:'border-box',resize:'none',marginBottom:16,fontFamily:'sans-serif'}}/>

              <button onClick={saveLog} disabled={logSaving} style={{width:'100%',padding:'14px',borderRadius:50,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#be185d,#db2777)',color:'white',fontWeight:700,fontSize:14,boxShadow:'0 4px 14px rgba(190,24,93,0.25)'}}>
                {logSaving?'⏳ Enregistrement...':logSaved?'✅ Mis à jour !':'💾 Sauvegarder le journal'}
              </button>
            </div>
          </div>
        )}

        {/* ─── CALENDRIER ─── */}
        {tab==='calendar'&&(
          <div style={{animation:'fadeUp .25s ease',display:'flex',flexDirection:'column',gap:12}}>
            <MonthCalendar cycles={cycles} predictions={predictions} dailyLogs={dailyLogs} onDayClick={handleDayClick}/>
            <p style={{color:'#be185d',fontSize:12,textAlign:'center',margin:0}}>Appuyez sur un jour pour enregistrer vos données</p>
            {cycles.length>0&&(
              <div style={{background:'white',borderRadius:16,padding:14,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <p style={{fontWeight:700,color:'#831843',fontSize:13,margin:'0 0 10px'}}>📜 Cycles récents</p>
                {cycles.slice(0,5).map((c:any,i:number)=>{
                  const flow=FLOWS.find(f=>f.id===c.flow_intensity)
                  const dur=c.cycle_end?Math.round((new Date(c.cycle_end).getTime()-new Date(c.cycle_start).getTime())/864e5)+1:null
                  return (
                    <div key={c.id} style={{display:'flex',alignItems:'center',gap:9,paddingBottom:8,marginBottom:8,borderBottom:i<4?'1px solid #fce7f3':'none'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:flow?.color||'#be185d',flexShrink:0}}/>
                      <div style={{flex:1}}>
                        <div style={{color:'#be185d',fontWeight:700,fontSize:12}}>{new Date(c.cycle_start).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}</div>
                        {dur&&<div style={{color:'#bbb',fontSize:10}}>{dur}j de règles</div>}
                      </div>
                      {c.symptoms?.length>0&&<span style={{color:'#bbb',fontSize:10}}>{c.symptoms.length} symptôme(s)</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── ANALYSES (inspiré Flo) ─── */}
        {tab==='stats'&&(
          <div style={{animation:'fadeUp .25s ease',display:'flex',flexDirection:'column',gap:10}}>
            <h2 style={{color:'#831843',fontFamily:'Georgia,serif',fontSize:16,margin:0}}>📊 Mes analyses</h2>
            {predictions?(
              <>
                {[
                  {label:'⏱️ Durée du cycle',value:`${predictions.avgLen} jours`,max:35,current:predictions.avgLen,min:20,color:'#be185d'},
                  {label:'🩸 Durée des règles',value:`${predictions.avgPeriod} jours`,max:8,current:predictions.avgPeriod,min:2,color:'#dc2626'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'white',borderRadius:14,padding:'14px 16px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontWeight:700,color:'#0d4a3a',fontSize:13}}>{s.label}</span>
                      <span style={{color:s.color,fontWeight:800,fontSize:17}}>{s.value}</span>
                    </div>
                    <div style={{height:6,background:'#fce7f3',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${((s.current-s.min)/(s.max-s.min))*100}%`,background:`linear-gradient(90deg,${s.color},#db2777)`,borderRadius:3}}/>
                    </div>
                  </div>
                ))}
                <div style={{background:'white',borderRadius:14,padding:'14px 16px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)',display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontWeight:700,color:'#0d4a3a',fontSize:13}}>📅 Cycles enregistrés</span>
                  <span style={{color:'#be185d',fontWeight:800,fontSize:17}}>{cycles.length}</span>
                </div>
                {/* Glaires les plus fréquentes (Flo) */}
                {(()=>{
                  const allMucus = Object.values(dailyLogs).map((l:any)=>l.cervical_mucus).filter(Boolean)
                  const freq: Record<string,number> = {}
                  allMucus.forEach((m:string)=>{ freq[m]=(freq[m]||0)+1 })
                  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3)
                  return top.length>0?(
                    <div style={{background:'white',borderRadius:14,padding:'14px 16px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
                      <p style={{fontWeight:700,color:'#0d4a3a',fontSize:13,margin:'0 0 10px'}}>💧 Glaires les plus fréquentes</p>
                      {top.map(([id,count])=>{
                        const m=MUCUS.find(x=>x.id===id)
                        return m?(
                          <div key={id} style={{display:'flex',alignItems:'center',gap:9,marginBottom:7}}>
                            <div style={{width:10,height:10,borderRadius:'50%',background:m.color,flexShrink:0}}/>
                            <span style={{flex:1,fontSize:12,color:'#555'}}>{m.label} — {m.fertility}</span>
                            <span style={{color:'#be185d',fontWeight:700,fontSize:12}}>{count}×</span>
                          </div>
                        ):null
                      })}
                    </div>
                  ):null
                })()}
                {/* Top symptômes */}
                {(()=>{
                  const allS = cycles.flatMap((c:any)=>c.symptoms||[])
                  const freq: Record<string,number> = {}
                  allS.forEach((s:string)=>{ freq[s]=(freq[s]||0)+1 })
                  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5)
                  return top.length>0?(
                    <div style={{background:'white',borderRadius:14,padding:'14px 16px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
                      <p style={{fontWeight:700,color:'#0d4a3a',fontSize:13,margin:'0 0 10px'}}>🎯 Symptômes fréquents</p>
                      {top.map(([id,count])=>{
                        const s=SYMPTOMS.find(x=>x.id===id)
                        return s?(
                          <div key={id} style={{display:'flex',alignItems:'center',gap:9,marginBottom:7}}>
                            <span style={{fontSize:14}}>{s.icon}</span>
                            <span style={{flex:1,fontSize:12,color:'#555'}}>{s.label}</span>
                            <div style={{width:44,height:5,background:'#fce7f3',borderRadius:3,overflow:'hidden'}}>
                              <div style={{height:'100%',width:`${(count/cycles.length)*100}%`,background:'#be185d',borderRadius:3}}/>
                            </div>
                            <span style={{color:'#be185d',fontWeight:700,fontSize:11,minWidth:18}}>{count}×</span>
                          </div>
                        ):null
                      })}
                    </div>
                  ):null
                })()}
                {/* Avertissement cycle irrégulier */}
                {predictions.isIrregular&&(
                  <div style={{background:'#fffbeb',borderRadius:14,padding:'12px 14px',border:'1px solid #fde68a'}}>
                    <p style={{fontWeight:700,color:'#92400e',fontSize:13,margin:'0 0 5px'}}>⚠️ Cycle irrégulier détecté</p>
                    <p style={{color:'#78350f',fontSize:12,margin:0,lineHeight:1.6}}>Vos cycles varient de plus de 7 jours. Cela peut être normal, mais consultez un gynécologue si cela persiste (possible SOPK, endométriose ou autre cause).</p>
                  </div>
                )}
              </>
            ):(
              <div style={{background:'white',borderRadius:16,padding:28,textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:10}}>📊</div>
                <p style={{color:'#888',fontSize:13}}>Enregistrez au moins 2 cycles pour voir vos analyses.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #fce7f3',display:'flex',justifyContent:'space-around',padding:'7px 0 10px',boxShadow:'0 -4px 14px rgba(0,0,0,0.06)',zIndex:50}}>
        {[['home','🏠','Accueil'],['log','📝','Journal'],['calendar','📅','Calendrier'],['stats','📊','Analyses']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'3px 14px',border:'none',background:'transparent',cursor:'pointer',color:tab===id?'#be185d':'#bbb',fontWeight:tab===id?700:400}}>
            <span style={{fontSize:tab===id?21:18}}>{icon}</span><span style={{fontSize:9}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
