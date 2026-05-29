// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Calendrier OMS des visites prénatales recommandées ─────────────────────
const PRENATAL_SCHEDULE = [
  { week: 8,  type: 'consultation', label: '1ère consultation prénatale', icon: '🩺', desc: 'Bilan complet, groupage sanguin, sérologies', required: true },
  { week: 12, type: 'echo',         label: 'Échographie 1er trimestre',   icon: '🔬', desc: 'Mesure clarté nucale, datation de grossesse', required: true },
  { week: 16, type: 'consultation', label: '2ème consultation prénatale',  icon: '🩺', desc: 'Contrôle tension, poids, hauteur utérine', required: true },
  { week: 20, type: 'consultation', label: '3ème consultation prénatale',  icon: '🩺', desc: 'Contrôle de routine', required: true },
  { week: 22, type: 'echo',         label: 'Échographie morphologique',    icon: '🔬', desc: 'Morphologie fœtale complète, sexe', required: true },
  { week: 24, type: 'labo',         label: 'Test diabète gestationnel',    icon: '🧪', desc: 'Glycémie à jeun, test HGPO', required: true },
  { week: 28, type: 'consultation', label: '4ème consultation prénatale',  icon: '🩺', desc: 'Contrôle, préparation accouchement', required: true },
  { week: 28, type: 'vaccin',       label: 'Vaccin Tétanos (rappel)',       icon: '💉', desc: 'Immunisation tétanos pour la mère', required: true },
  { week: 32, type: 'echo',         label: 'Échographie 3ème trimestre',   icon: '🔬', desc: 'Croissance fœtale, position, liquide amniotique', required: true },
  { week: 32, type: 'consultation', label: '5ème consultation prénatale',  icon: '🩺', desc: 'Préparation accouchement, plan de naissance', required: true },
  { week: 36, type: 'consultation', label: '6ème consultation prénatale',  icon: '🩺', desc: 'Position bébé, bassin maternel', required: true },
  { week: 38, type: 'consultation', label: '7ème consultation prénatale',  icon: '🩺', desc: 'Surveillance rapprochée', required: true },
  { week: 40, type: 'consultation', label: '8ème consultation (terme)',     icon: '🩺', desc: 'Si pas d\'accouchement, surveillance', required: false },
]

const WEEK_TIPS: Record<number, { title: string; tips: string[] }> = {
  4:  { title: 'Semaine 4 — Début de grossesse', tips: ['Arrêtez l\'alcool et le tabac immédiatement', 'Commencez la supplémentation en acide folique', 'Consultez un médecin dès que possible'] },
  8:  { title: 'Semaine 8 — Embryon visible', tips: ['Le cœur bat déjà !', 'Prenez votre première consultation prénatale', 'Mangez des aliments riches en fer : viande, haricots, légumes verts', 'Reposez-vous, la fatigue est normale'] },
  12: { title: 'Semaine 12 — Fin du 1er trimestre', tips: ['Risque de fausse couche diminue fortement', 'Passez votre échographie du 1er trimestre', 'Les nausées commencent généralement à s\'atténuer', 'Annoncez votre grossesse si vous le souhaitez'] },
  16: { title: 'Semaine 16 — 2ème trimestre', tips: ['Vous pouvez peut-être sentir bébé bouger', 'Continuez les suppléments de fer et calcium', 'Hydratez-vous bien : 1,5L d\'eau par jour minimum', 'Dormez sur le côté gauche pour une meilleure circulation'] },
  20: { title: 'Semaine 20 — Mi-grossesse', tips: ['Bébé entend votre voix maintenant', 'Préparez votre liste pour la valise de maternité', 'Évitez de porter des charges lourdes', 'Continuez votre activité physique légère si possible'] },
  24: { title: 'Semaine 24 — Bébé viable', tips: ['Faites le test du diabète gestationnel', 'Surveillez les mouvements du bébé', 'Préparez votre plan de naissance', 'Inscrivez-vous aux cours de préparation à l\'accouchement'] },
  28: { title: 'Semaine 28 — 3ème trimestre', tips: ['Vaccin tétanos recommandé maintenant', 'Comptez les mouvements fœtaux : au moins 10 par jour', 'Surveillez tout gonflement excessif des pieds', 'Commencez à préparer la chambre de bébé'] },
  32: { title: 'Semaine 32 — Préparation finale', tips: ['Bébé est en position de plus en plus stable', 'Préparez votre valise de maternité', 'Apprenez les signes du travail', 'Repérez l\'itinéraire vers la maternité'] },
  36: { title: 'Semaine 36 — Quasi prêt !', tips: ['Bébé devrait être en position tête en bas', 'Restez près de la maternité', 'Surveillez tout signe de travail prématuré', 'Reposez-vous le plus possible'] },
  40: { title: 'Semaine 40 — Terme !', tips: ['Le travail peut commencer à tout moment', 'Appelez votre médecin dès les premières contractions', 'Urgence : appelez le 119 si douleurs intenses', 'Faites confiance à votre corps'] },
}

function getClosestTip(week: number) {
  const keys = Object.keys(WEEK_TIPS).map(Number).sort((a,b)=>a-b)
  const closest = keys.filter(k => k <= week).pop() || keys[0]
  return WEEK_TIPS[closest]
}

const TYPE_COLORS = {
  consultation: { bg:'#e8f5ee', color:'#0d4a3a', border:'#86efac' },
  echo:         { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe' },
  labo:         { bg:'#fef9ee', color:'#b45309', border:'#fde68a' },
  vaccin:       { bg:'#f5f3ff', color:'#7c3aed', border:'#ddd6fe' },
}

export default function GrossessePage() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [pregnancy, setPregnancy] = useState(null)
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'home'|'visits'|'vaccins'|'conseils'>('home')
  // Setup grossesse
  const [showSetup, setShowSetup] = useState(false)
  const [setupDate, setSetupDate] = useState('')
  const [setupDoctor, setSetupDoctor] = useState('')
  const [setupClinic, setSetupClinic] = useState('')
  const [setupBlood, setSetupBlood] = useState('')
  const [setupSaving, setSetupSaving] = useState(false)
  // Ajouter visite
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [visitDate, setVisitDate] = useState('')
  const [visitType, setVisitType] = useState('consultation')
  const [visitDoctor, setVisitDoctor] = useState('')
  const [visitClinic, setVisitClinic] = useState('')
  const [visitWeight, setVisitWeight] = useState('')
  const [visitBP, setVisitBP] = useState('')
  const [visitBPM, setVisitBPM] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [visitNext, setVisitNext] = useState('')
  const [visitSaving, setVisitSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({data:{session}}) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
      const [{data:sub},{data:preg},{data:vis}] = await Promise.all([
        sb.from('subscriptions').select('plan,status').eq('user_id',session.user.id).single(),
        sb.from('pregnancy_tracking').select('*').eq('user_id',session.user.id).single(),
        sb.from('prenatal_visits').select('*').eq('user_id',session.user.id).order('visit_date',{ascending:true})
      ])
      setSubscription(sub)
      setPregnancy(preg)
      setVisits(vis||[])
      setLoading(false)
    })
  }, [router])

  const calcWeek = (lmpDate: string) => {
    const days = Math.round((Date.now() - new Date(lmpDate).getTime()) / 864e5)
    return Math.min(Math.max(Math.floor(days/7), 1), 42)
  }

  const calcEDB = (lmpDate: string) => {
    const edb = new Date(new Date(lmpDate).getTime() + 280 * 864e5)
    return edb
  }

  const saveSetup = async () => {
    if (!setupDate) return
    setSetupSaving(true)
    const sb = createClient()
    const edb = calcEDB(setupDate)
    const {data,error} = await sb.from('pregnancy_tracking').upsert({
      user_id: user.id,
      last_period_date: setupDate,
      expected_birth_date: edb.toISOString().split('T')[0],
      current_week: calcWeek(setupDate),
      doctor_name: setupDoctor || null,
      clinic_name: setupClinic || null,
      blood_type: setupBlood || null,
    },{onConflict:'user_id'}).select().single()
    if (!error) { setPregnancy(data); setShowSetup(false) }
    setSetupSaving(false)
  }

  const saveVisit = async () => {
    if (!visitDate) return
    setVisitSaving(true)
    const sb = createClient()
    const week = pregnancy ? calcWeek(pregnancy.last_period_date) : null
    const {data,error} = await sb.from('prenatal_visits').insert({
      user_id: user.id, visit_date: visitDate, visit_type: visitType,
      week_of_pregnancy: week, doctor_name: visitDoctor||null,
      clinic_name: visitClinic||null, weight: visitWeight||null,
      blood_pressure: visitBP||null, baby_heartbeat: visitBPM||null,
      notes: visitNotes||null, next_visit_date: visitNext||null, is_done: true,
    }).select().single()
    if (!error&&data) {
      setVisits(p=>[...p,data].sort((a,b)=>new Date(a.visit_date).getTime()-new Date(b.visit_date).getTime()))
      setShowAddVisit(false)
      setVisitDate(''); setVisitType('consultation'); setVisitDoctor(''); setVisitClinic('')
      setVisitWeight(''); setVisitBP(''); setVisitBPM(''); setVisitNotes(''); setVisitNext('')
    }
    setVisitSaving(false)
  }

  const fmtDate = (d:string|Date) => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})
  const today = new Date().toISOString().split('T')[0]

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fdf6ee'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid #fde68a',borderTopColor:'#d97706',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Vérifier accès au forfait grossesse
  if (subscription?.plan !== 'pregnancy') {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#92400e,#d97706,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:'white',borderRadius:28,padding:'36px 24px',maxWidth:400,width:'100%',textAlign:'center',boxShadow:'0 24px 60px rgba(0,0,0,0.2)'}}>
          <div style={{fontSize:52,marginBottom:16}}>🤰</div>
          <h2 style={{color:'#92400e',fontFamily:'Georgia,serif',fontSize:20,margin:'0 0 10px'}}>Suivi de Grossesse</h2>
          <div style={{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',borderRadius:16,padding:'16px',marginBottom:16,border:'1px solid #fde68a'}}>
            <div style={{color:'#92400e',fontWeight:800,fontSize:22,marginBottom:4}}>3 000 FCFA <span style={{fontSize:13,fontWeight:400}}>/mois</span></div>
            <div style={{color:'#78350f',fontSize:12,lineHeight:1.6}}>Forfait exclusif pour les femmes enceintes</div>
          </div>
          <div style={{textAlign:'left',marginBottom:20}}>
            {[
              '🩺 Suivi des consultations prénatales',
              '💉 Calendrier des vaccins obligatoires',
              '🔬 Suivi échographies et labos',
              '📊 Courbe de grossesse semaine/semaine',
              '💡 Conseils médicaux personnalisés',
              '🏥 Orientation vers maternités partenaires',
              '🌸 Accès complet à la Santé Féminine',
              '🛡️ Accès à l\'Espace Assurances',
            ].map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7,fontSize:13,color:'#555'}}>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <Link href="/tarifs" style={{display:'block',background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'white',borderRadius:50,padding:'14px',fontWeight:700,textDecoration:'none',fontSize:14,boxShadow:'0 4px 14px rgba(217,119,6,0.4)'}}>
            Souscrire au Forfait Grossesse →
          </Link>
          <Link href="/dashboard" style={{display:'block',marginTop:12,color:'#aaa',fontSize:12,textDecoration:'none'}}>← Retour au tableau de bord</Link>
        </div>
      </div>
    )
  }

  const currentWeek = pregnancy ? calcWeek(pregnancy.last_period_date) : 0
  const edb = pregnancy ? calcEDB(pregnancy.last_period_date) : null
  const daysLeft = edb ? Math.max(0, Math.round((edb.getTime()-Date.now())/864e5)) : null
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 26 ? 2 : 3
  const tip = pregnancy ? getClosestTip(currentWeek) : null

  // Visites planifiées et faites
  const doneVisitWeeks = new Set(visits.map(v=>v.week_of_pregnancy))
  const pendingVisits = PRENATAL_SCHEDULE.filter(s => s.week >= currentWeek - 1 && s.week <= currentWeek + 8)
  const vaccins = PRENATAL_SCHEDULE.filter(s => s.type === 'vaccin')
  const doneVaccins = visits.filter(v => v.visit_type === 'vaccin')

  const inp: React.CSSProperties = {width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #fde68a',fontSize:13,outline:'none',boxSizing:'border-box',marginBottom:10,fontFamily:'sans-serif'}
  const lbl: React.CSSProperties = {display:'block',fontWeight:700,color:'#92400e',fontSize:11,marginBottom:5}

  return (
    <div style={{minHeight:'100vh',background:'#fdf6ee',fontFamily:'sans-serif',paddingBottom:70}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── HEADER ── */}
      <div style={{background:'linear-gradient(160deg,#92400e,#d97706)',padding:'14px 16px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,maxWidth:520,margin:'0 auto'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.7)',textDecoration:'none',fontSize:13,flexShrink:0}}>← Retour</Link>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{color:'white',fontFamily:'Georgia,serif',fontSize:17,fontWeight:700}}>🤰 Suivi de Grossesse</div>
            {pregnancy && <div style={{color:'rgba(255,255,255,0.75)',fontSize:11,marginTop:2}}>Semaine {currentWeek} · Trimestre {trimester}</div>}
          </div>
          <button onClick={()=>setShowSetup(true)} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:10,padding:'6px 10px',cursor:'pointer',color:'white',fontSize:11,fontWeight:700,flexShrink:0}}>
            ✏️ Modifier
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{background:'white',borderBottom:'1px solid #fde68a',display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
        {[['home','🏠','Accueil'],['visits','📋','Visites'],['vaccins','💉','Vaccins'],['conseils','💡','Conseils']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{padding:'10px 4px',border:'none',background:'transparent',cursor:'pointer',color:tab===id?'#d97706':'#aaa',fontWeight:tab===id?700:400,fontSize:10,borderBottom:tab===id?'2.5px solid #d97706':'2.5px solid transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
            <span style={{fontSize:17}}>{icon}</span><span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── SETUP MODAL ── */}
      {(showSetup || !pregnancy) && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>pregnancy&&setShowSetup(false)}>
          <div style={{background:'white',borderRadius:'24px 24px 0 0',padding:'24px 20px 32px',width:'100%',maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <h3 style={{color:'#92400e',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 6px'}}>🤰 {pregnancy?'Modifier ma grossesse':'Commencer le suivi'}</h3>
            <p style={{color:'#888',fontSize:12,margin:'0 0 16px'}}>Date de vos dernières règles pour calculer votre terme et semaine.</p>
            <label style={lbl}>Date des dernières règles (DDR) *</label>
            <input type="date" value={setupDate} max={today} onChange={e=>setSetupDate(e.target.value)} style={inp}/>
            {setupDate && (
              <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'10px 14px',marginBottom:10}}>
                <div style={{color:'#92400e',fontWeight:700,fontSize:13}}>Semaine {calcWeek(setupDate)} de grossesse</div>
                <div style={{color:'#aaa',fontSize:11}}>Date prévue d'accouchement : {fmtDate(calcEDB(setupDate))}</div>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={lbl}>Médecin / Sage-femme</label>
                <input style={{...inp,marginBottom:0}} value={setupDoctor} onChange={e=>setSetupDoctor(e.target.value)} placeholder="Dr. Nom..." />
              </div>
              <div>
                <label style={lbl}>Groupe sanguin</label>
                <select style={{...inp,marginBottom:0}} value={setupBlood} onChange={e=>setSetupBlood(e.target.value)}>
                  <option value="">Inconnu</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:10}}>
              <label style={lbl}>Maternité / Clinique prévue</label>
              <input style={inp} value={setupClinic} onChange={e=>setSetupClinic(e.target.value)} placeholder="Nom de la structure sanitaire..."/>
            </div>
            <div style={{display:'flex',gap:10}}>
              {pregnancy&&<button onClick={()=>setShowSetup(false)} style={{flex:1,padding:'12px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,cursor:'pointer',fontSize:13}}>Annuler</button>}
              <button onClick={saveSetup} disabled={!setupDate||setupSaving} style={{flex:2,padding:'12px',borderRadius:50,border:'none',background:setupDate?'linear-gradient(135deg,#d97706,#f59e0b)':'#e5e7eb',color:setupDate?'white':'#aaa',fontWeight:700,cursor:setupDate?'pointer':'not-allowed',fontSize:13}}>
                {setupSaving?'⏳ Enregistrement...':'✅ Commencer le suivi'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:520,margin:'0 auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:12}}>

        {/* ─────── ACCUEIL ─────── */}
        {tab==='home' && pregnancy && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:12}}>
            {/* Progression grossesse */}
            <div style={{background:'white',borderRadius:20,padding:'18px 18px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1.5px solid #fde68a'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{color:'#d97706',fontWeight:800,fontSize:22}}>Semaine {currentWeek}</div>
                  <div style={{color:'#888',fontSize:12}}>Trimestre {trimester} sur 3</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#92400e',fontWeight:700,fontSize:13}}>{daysLeft} jours</div>
                  <div style={{color:'#aaa',fontSize:11}}>avant le terme</div>
                  <div style={{color:'#d97706',fontSize:11,marginTop:2}}>{fmtDate(edb!)}</div>
                </div>
              </div>
              {/* Barre progression */}
              <div style={{height:10,background:'#fef3c7',borderRadius:5,overflow:'hidden',marginBottom:6}}>
                <div style={{height:'100%',width:`${Math.min((currentWeek/40)*100,100)}%`,background:'linear-gradient(90deg,#d97706,#f59e0b)',borderRadius:5,transition:'width .5s'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#bbb'}}>
                {['S1','S13 T2','S27 T3','S40'].map((l,i)=><span key={i}>{l}</span>)}
              </div>
            </div>

            {/* Infos bébé selon semaine */}
            <div style={{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',borderRadius:18,padding:'16px',border:'1px solid #fde68a'}}>
              <div style={{color:'#92400e',fontWeight:700,fontSize:14,marginBottom:6}}>👶 Bébé cette semaine</div>
              {currentWeek <= 8 && <p style={{color:'#78350f',fontSize:13,margin:0,lineHeight:1.6}}>Votre bébé est à l'état d'embryon. Ses organes principaux se forment. Taille : {Math.round(currentWeek*0.5)} mm environ.</p>}
              {currentWeek > 8 && currentWeek <= 12 && <p style={{color:'#78350f',fontSize:13,margin:0,lineHeight:1.6}}>Tous les organes sont formés. Le cœur bat fort. Taille : environ {Math.round(currentWeek*0.6)} cm. C'est un fœtus !</p>}
              {currentWeek > 12 && currentWeek <= 20 && <p style={{color:'#78350f',fontSize:13,margin:0,lineHeight:1.6}}>Bébé grandit vite ! Il commence à bouger. Taille : {Math.round(10+(currentWeek-12)*1.2)} cm. Vous pourrez bientôt le sentir.</p>}
              {currentWeek > 20 && currentWeek <= 28 && <p style={{color:'#78350f',fontSize:13,margin:0,lineHeight:1.6}}>Bébé entend votre voix et réagit à la lumière. Taille : {Math.round(24+(currentWeek-20)*1.5)} cm. Poids : {Math.round(300+(currentWeek-20)*80)} g.</p>}
              {currentWeek > 28 && currentWeek <= 36 && <p style={{color:'#78350f',fontSize:13,margin:0,lineHeight:1.6}}>Bébé prend du poids rapidement. Il se prépare à naître. Taille : {Math.round(37+(currentWeek-28)*0.7)} cm. Poids : {Math.round(1000+(currentWeek-28)*250)} g.</p>}
              {currentWeek > 36 && <p style={{color:'#78350f',fontSize:13,margin:0,lineHeight:1.6}}>Bébé est prêt ! Il est en position pour naître. Taille : environ 50 cm. Poids : {Math.round(2500+(currentWeek-36)*200)} g en moyenne.</p>}
            </div>

            {/* Infos grossesse */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[
                {icon:'🩺',label:'Médecin',value:pregnancy.doctor_name||'Non renseigné',color:'#0d4a3a',bg:'#e8f5ee'},
                {icon:'🏥',label:'Maternité',value:pregnancy.clinic_name||'Non renseignée',color:'#1d4ed8',bg:'#eff6ff'},
                {icon:'🩸',label:'Groupe sanguin',value:pregnancy.blood_type||'Non renseigné',color:'#dc2626',bg:'#fef2f2'},
                {icon:'📅',label:'DDR',value:fmtDate(pregnancy.last_period_date),color:'#d97706',bg:'#fffbeb'},
              ].map((c,i)=>(
                <div key={i} style={{background:'white',borderRadius:14,padding:'12px 10px',boxShadow:'0 1px 6px rgba(0,0,0,0.04)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                    <div style={{width:26,height:26,borderRadius:8,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{c.icon}</div>
                    <span style={{color:'#bbb',fontSize:10}}>{c.label}</span>
                  </div>
                  <div style={{color:c.color,fontWeight:700,fontSize:12,lineHeight:1.3}}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Prochaine visite */}
            {pendingVisits.length > 0 && (
              <div style={{background:'white',borderRadius:18,padding:'14px 16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <p style={{fontWeight:700,color:'#d97706',fontSize:13,margin:'0 0 10px'}}>📅 Prochaines visites recommandées</p>
                {pendingVisits.slice(0,3).map((v,i)=>{
                  const tc = TYPE_COLORS[v.type]
                  const done = doneVisitWeeks.has(v.week)
                  return (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:i<2?8:0,opacity:done?0.5:1}}>
                      <div style={{width:34,height:34,borderRadius:10,background:tc.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,border:`1px solid ${tc.border}`}}>{v.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{color:done?'#888':tc.color,fontWeight:600,fontSize:12,textDecoration:done?'line-through':'none'}}>{v.label}</div>
                        <div style={{color:'#bbb',fontSize:10}}>Semaine {v.week}</div>
                      </div>
                      {done && <span style={{color:'#16a34a',fontSize:14}}>✓</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────── VISITES ─────── */}
        {tab==='visits' && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2 style={{color:'#92400e',fontFamily:'Georgia,serif',fontSize:16,margin:0}}>📋 Visites prénatales</h2>
              <button onClick={()=>setShowAddVisit(!showAddVisit)} style={{background:'linear-gradient(135deg,#d97706,#f59e0b)',color:'white',border:'none',borderRadius:12,padding:'8px 14px',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                {showAddVisit?'✕ Annuler':'+ Ajouter'}
              </button>
            </div>

            {/* Formulaire ajout visite */}
            {showAddVisit && (
              <div style={{background:'white',borderRadius:18,padding:18,boxShadow:'0 4px 16px rgba(0,0,0,0.08)',border:'1.5px solid #fde68a',animation:'fadeUp .2s ease'}}>
                <h3 style={{color:'#d97706',fontSize:14,margin:'0 0 12px',fontFamily:'Georgia,serif'}}>Enregistrer une visite</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div><label style={lbl}>Date *</label><input type="date" value={visitDate} max={today} onChange={e=>setVisitDate(e.target.value)} style={inp}/></div>
                  <div>
                    <label style={lbl}>Type *</label>
                    <select value={visitType} onChange={e=>setVisitType(e.target.value)} style={inp}>
                      <option value="consultation">Consultation</option>
                      <option value="echo">Échographie</option>
                      <option value="labo">Laboratoire</option>
                      <option value="vaccin">Vaccin</option>
                    </select>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div><label style={lbl}>Médecin</label><input style={inp} value={visitDoctor} onChange={e=>setVisitDoctor(e.target.value)} placeholder="Dr. Nom..."/></div>
                  <div><label style={lbl}>Structure</label><input style={inp} value={visitClinic} onChange={e=>setVisitClinic(e.target.value)} placeholder="Clinique..."/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                  <div><label style={lbl}>Poids (kg)</label><input style={inp} type="number" value={visitWeight} onChange={e=>setVisitWeight(e.target.value)} placeholder="65"/></div>
                  <div><label style={lbl}>Tension</label><input style={inp} value={visitBP} onChange={e=>setVisitBP(e.target.value)} placeholder="120/80"/></div>
                  <div><label style={lbl}>BPM bébé</label><input style={inp} type="number" value={visitBPM} onChange={e=>setVisitBPM(e.target.value)} placeholder="140"/></div>
                </div>
                <label style={lbl}>Prochaine visite prévue</label>
                <input type="date" value={visitNext} min={today} onChange={e=>setVisitNext(e.target.value)} style={inp}/>
                <textarea value={visitNotes} onChange={e=>setVisitNotes(e.target.value)} placeholder="Observations du médecin, prescriptions..." rows={2} style={{...inp,resize:'none'}}/>
                <button onClick={saveVisit} disabled={!visitDate||visitSaving} style={{width:'100%',padding:'12px',borderRadius:50,border:'none',background:visitDate?'linear-gradient(135deg,#d97706,#f59e0b)':'#e5e7eb',color:visitDate?'white':'#aaa',fontWeight:700,cursor:visitDate?'pointer':'not-allowed',fontSize:13}}>
                  {visitSaving?'⏳ Enregistrement...':'💾 Sauvegarder la visite'}
                </button>
              </div>
            )}

            {/* Calendrier recommandé */}
            <div style={{background:'white',borderRadius:18,padding:'14px 16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
              <p style={{fontWeight:700,color:'#92400e',fontSize:13,margin:'0 0 12px'}}>📋 Calendrier prénatal OMS</p>
              {PRENATAL_SCHEDULE.map((s,i)=>{
                const done = visits.some(v=>v.visit_type===s.type && Math.abs((v.week_of_pregnancy||0)-s.week)<=2)
                const tc = TYPE_COLORS[s.type]
                const isPast = pregnancy && s.week < currentWeek - 1
                const isCurrent = pregnancy && s.week >= currentWeek - 1 && s.week <= currentWeek + 2
                return (
                  <div key={i} style={{display:'flex',gap:10,marginBottom:10,opacity:done?0.55:1}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>
                      <div style={{width:32,height:32,borderRadius:10,background:done?'#e8f5ee':tc.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,border:`1.5px solid ${done?'#86efac':tc.border}`,flexShrink:0}}>
                        {done?'✓':s.icon}
                      </div>
                      {i<PRENATAL_SCHEDULE.length-1&&<div style={{width:1,height:14,background:'#f0f0f0',marginTop:2}}/>}
                    </div>
                    <div style={{flex:1,paddingBottom:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                        <span style={{fontWeight:700,color:done?'#888':isCurrent?tc.color:'#333',fontSize:12,textDecoration:done?'line-through':'none'}}>{s.label}</span>
                        <span style={{background:tc.bg,color:tc.color,borderRadius:6,padding:'1px 7px',fontSize:9,fontWeight:700,border:`1px solid ${tc.border}`}}>S{s.week}</span>
                        {isCurrent&&!done&&<span style={{background:'#fffbeb',color:'#d97706',borderRadius:6,padding:'1px 7px',fontSize:9,fontWeight:700}}>À FAIRE</span>}
                        {isPast&&!done&&<span style={{background:'#fef2f2',color:'#dc2626',borderRadius:6,padding:'1px 7px',fontSize:9,fontWeight:700}}>EN RETARD</span>}
                      </div>
                      <p style={{color:'#bbb',fontSize:10,margin:'2px 0 0'}}>{s.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Visites effectuées */}
            {visits.length > 0 && (
              <div style={{background:'white',borderRadius:18,padding:'14px 16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <p style={{fontWeight:700,color:'#92400e',fontSize:13,margin:'0 0 12px'}}>✅ Visites effectuées ({visits.length})</p>
                {visits.map((v,i)=>{
                  const tc = TYPE_COLORS[v.visit_type] || TYPE_COLORS.consultation
                  return (
                    <div key={v.id} style={{borderLeft:`3px solid ${tc.border}`,paddingLeft:12,marginBottom:i<visits.length-1?12:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div>
                          <div style={{fontWeight:700,color:tc.color,fontSize:13}}>{v.visit_type==='consultation'?'Consultation':v.visit_type==='echo'?'Échographie':v.visit_type==='labo'?'Laboratoire':'Vaccin'}</div>
                          <div style={{color:'#aaa',fontSize:11}}>{fmtDate(v.visit_date)}{v.week_of_pregnancy?` · S${v.week_of_pregnancy}`:''}</div>
                        </div>
                        <div style={{textAlign:'right',fontSize:11,color:'#888'}}>
                          {v.weight&&<div>⚖️ {v.weight} kg</div>}
                          {v.blood_pressure&&<div>💓 {v.blood_pressure}</div>}
                          {v.baby_heartbeat&&<div>🫀 {v.baby_heartbeat} bpm</div>}
                        </div>
                      </div>
                      {v.doctor_name&&<div style={{color:'#888',fontSize:11,marginTop:3}}>🩺 {v.doctor_name}{v.clinic_name?` · ${v.clinic_name}`:''}</div>}
                      {v.notes&&<p style={{color:'#555',fontSize:11,margin:'4px 0 0',lineHeight:1.5,fontStyle:'italic'}}>{v.notes}</p>}
                      {v.next_visit_date&&<div style={{color:'#d97706',fontSize:11,marginTop:4}}>📅 Prochaine visite : {fmtDate(v.next_visit_date)}</div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────── VACCINS ─────── */}
        {tab==='vaccins' && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{background:'#eff6ff',borderRadius:14,padding:'10px 14px',border:'1px solid #bfdbfe'}}>
              <p style={{color:'#1e40af',fontSize:12,margin:0,lineHeight:1.5}}>💉 Ces vaccins sont <strong>recommandés</strong> pendant la grossesse pour protéger la mère et le bébé. Consultez votre médecin.</p>
            </div>
            {[
              { name:'Tétanos (VAT)', when:'S28-S32', done: doneVaccins.some(v=>v.notes?.toLowerCase().includes('tétanos')||v.notes?.toLowerCase().includes('vat')), desc:'Obligatoire. Protège mère et bébé contre le tétanos néonatal.', priority:'high' },
              { name:'Grippe saisonnière', when:'Tout trimestre', done: doneVaccins.some(v=>v.notes?.toLowerCase().includes('grippe')), desc:'Recommandé. Réduit le risque de complications.', priority:'medium' },
              { name:'Coqueluche (Tdap)', when:'S27-S36', done: doneVaccins.some(v=>v.notes?.toLowerCase().includes('coqueluche')), desc:'Protège le nouveau-né avant sa propre vaccination.', priority:'medium' },
              { name:'Hépatite B', when:'Si non immune', done: doneVaccins.some(v=>v.notes?.toLowerCase().includes('hépatite')), desc:'Si non immunisée, peut être fait pendant la grossesse.', priority:'low' },
            ].map((v,i)=>(
              <div key={i} style={{background:'white',borderRadius:16,padding:'14px 16px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',display:'flex',gap:12,opacity:v.done?0.6:1}}>
                <div style={{width:40,height:40,borderRadius:12,background:v.done?'#e8f5ee':'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,border:`1.5px solid ${v.done?'#86efac':'#ddd6fe'}`}}>
                  {v.done?'✅':'💉'}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                    <div style={{fontWeight:700,color:v.done?'#888':'#7c3aed',fontSize:13,textDecoration:v.done?'line-through':'none'}}>{v.name}</div>
                    <span style={{background:'#f5f3ff',color:'#7c3aed',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700}}>{v.when}</span>
                  </div>
                  <p style={{color:'#888',fontSize:12,margin:0,lineHeight:1.5}}>{v.desc}</p>
                  {!v.done && <p style={{color:'#d97706',fontSize:11,margin:'4px 0 0',fontWeight:600}}>→ Parlez-en à votre médecin</p>}
                </div>
              </div>
            ))}
            <div style={{background:'#fef2f2',borderRadius:14,padding:'10px 14px',border:'1px solid #fecaca'}}>
              <p style={{color:'#dc2626',fontSize:11,margin:0,lineHeight:1.5}}>⚠️ Vaccins à <strong>éviter</strong> pendant la grossesse : ROR (rougeole), Varicelle, Fièvre jaune (sauf risque élevé). Consultez toujours votre médecin avant tout vaccin.</p>
            </div>
          </div>
        )}

        {/* ─────── CONSEILS ─────── */}
        {tab==='conseils' && (
          <div style={{animation:'fadeUp .3s ease',display:'flex',flexDirection:'column',gap:12}}>
            {pregnancy && tip && (
              <div style={{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',borderRadius:18,padding:'16px',border:'1.5px solid #fde68a'}}>
                <p style={{color:'#92400e',fontWeight:700,fontSize:14,margin:'0 0 10px'}}>{tip.title}</p>
                {tip.tips.map((t,i)=>(
                  <div key={i} style={{display:'flex',gap:8,marginBottom:7}}>
                    <span style={{color:'#d97706',flexShrink:0,fontWeight:700}}>•</span>
                    <span style={{color:'#78350f',fontSize:13,lineHeight:1.5}}>{t}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Conseils généraux */}
            {[
              { icon:'🥗', title:'Alimentation', color:'#059669', bg:'#ecfdf5', tips:['Mangez des protéines à chaque repas : viande, poisson, légumineuses','Consommez des légumes verts riches en acide folique','Évitez les fromages non pasteurisés, la charcuterie crue, les poissons crus','Prenez vos suppléments : acide folique, fer, calcium, vitamine D'] },
              { icon:'💊', title:'Suppléments essentiels', color:'#7c3aed', bg:'#f5f3ff', tips:['Acide folique : 0,4 mg/jour dès la conception (prévient spina bifida)','Fer : 30 mg/jour pour prévenir l\'anémie','Calcium : 1000 mg/jour pour les os du bébé','Iode : important pour le développement cérébral'] },
              { icon:'🚶‍♀️', title:'Activité physique', color:'#0d4a3a', bg:'#e8f5ee', tips:['Marche 30 min/jour est excellent','Évitez les sports de contact et les chutes','Natation et yoga prénatal sont idéaux','Arrêtez si douleurs, saignements ou essoufflement'] },
              { icon:'🚨', title:'Signes d\'alarme — Appelez le 119', color:'#dc2626', bg:'#fef2f2', tips:['Saignements vaginaux à tout moment','Douleurs abdominales intenses','Gonflement brutal du visage ou des mains','Maux de tête violents ou vision trouble','Diminution ou absence des mouvements du bébé','Contractions avant 37 semaines'] },
            ].map((section,i)=>(
              <div key={i} style={{background:'white',borderRadius:16,padding:'14px 16px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:12,background:section.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{section.icon}</div>
                  <span style={{fontWeight:700,color:section.color,fontSize:14}}>{section.title}</span>
                </div>
                {section.tips.map((t,j)=>(
                  <div key={j} style={{display:'flex',gap:8,marginBottom:j<section.tips.length-1?6:0}}>
                    <span style={{color:section.color,flexShrink:0,fontSize:12}}>›</span>
                    <span style={{color:'#555',fontSize:12,lineHeight:1.6}}>{t}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #fde68a',display:'flex',justifyContent:'space-around',padding:'8px 0 10px',boxShadow:'0 -4px 16px rgba(0,0,0,0.06)',zIndex:50}}>
        {[['home','🏠','Accueil'],['visits','📋','Visites'],['vaccins','💉','Vaccins'],['conseils','💡','Conseils']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id as any)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'3px 16px',border:'none',background:'transparent',cursor:'pointer',color:tab===id?'#d97706':'#bbb',fontWeight:tab===id?700:400}}>
            <span style={{fontSize:20}}>{icon}</span><span style={{fontSize:9}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
