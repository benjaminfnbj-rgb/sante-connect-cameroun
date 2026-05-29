// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CAMEROON_VACCINES } from '@/lib/subscription'

export default function CalendrierVaccinalPage() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [children, setChildren] = useState([])
  const [selected, setSelected] = useState(null)
  const [records, setRecords] = useState([])
  const [showAddChild, setShowAddChild] = useState(false)
  const [form, setForm] = useState({ child_name:'', birth_date:'' })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      setUser(user)
      const [{ data: sub }, { data: kids }] = await Promise.all([
        sb.from('subscriptions').select('plan,status').eq('user_id', user.id).single(),
        sb.from('vaccine_calendar').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])
      setSubscription(sub)
      setChildren(kids || [])
      if (kids?.length > 0) {
        setSelected(kids[0].id)
        loadRecords(sb, kids[0].id, kids[0].birth_date)
      }
      setLoading(false)
    })
  }, [router])

  const loadRecords = async (sb, calendarId, birthDate) => {
    const { data } = await sb.from('vaccine_records').select('*').eq('calendar_id', calendarId)
    const birth = new Date(birthDate)
    const expected = CAMEROON_VACCINES.map(v => {
      const scheduled = new Date(birth.getTime() + v.daysFromBirth * 24*60*60*1000)
      const existing = data?.find(r => r.vaccine_name === v.name)
      const now = new Date()
      return {
        ...v,
        scheduled_date: scheduled.toISOString().split('T')[0],
        is_done: existing?.is_done || false,
        done_date: existing?.done_date || null,
        record_id: existing?.id || null,
        isPast: scheduled < now,
        isDue: Math.abs(scheduled.getTime() - now.getTime()) < 7*24*60*60*1000 && !existing?.is_done,
      }
    })
    setRecords(expected)
  }

  const addChild = async () => {
    if (!form.child_name || !form.birth_date) return
    const sb = createClient()
    const { data } = await sb.from('vaccine_calendar').insert({
      user_id: user.id, child_name: form.child_name, birth_date: form.birth_date
    }).select().single()
    if (data) {
      setChildren(prev => [data, ...prev])
      setSelected(data.id)
      loadRecords(sb, data.id, data.birth_date)
      setShowAddChild(false)
      setForm({ child_name:'', birth_date:'' })
    }
  }

  const toggleVaccine = async (vaccine) => {
    const sb = createClient()
    if (vaccine.record_id) {
      await sb.from('vaccine_records').update({ is_done: !vaccine.is_done, done_date: !vaccine.is_done ? new Date().toISOString().split('T')[0] : null }).eq('id', vaccine.record_id)
    } else {
      await sb.from('vaccine_records').insert({ calendar_id: selected, vaccine_name: vaccine.name, scheduled_date: vaccine.scheduled_date, is_done: true, done_date: new Date().toISOString().split('T')[0] })
    }
    const child = children.find(c => c.id === selected)
    if (child) loadRecords(createClient(), selected, child.birth_date)
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid #fce7f3', borderTopColor:'#be185d', animation:'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>

  if (!['family'].includes(subscription?.plan)) {
    return (
      <div style={{ minHeight:'100vh', background:'#fdf2f8', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:'white', borderRadius:28, padding:36, maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>💉</div>
          <h2 style={{ color:'#be185d', fontFamily:'Georgia,serif', fontSize:20, margin:'0 0 12px' }}>Calendrier Vaccinal Intelligent</h2>
          <p style={{ color:'#555', fontSize:14, lineHeight:1.7, margin:'0 0 20px' }}>Disponible uniquement avec le <strong>Forfait Famille / Maternité</strong> à <strong>2 500 FCFA/mois</strong>.</p>
          <Link href="/tarifs" style={{ display:'block', background:'linear-gradient(135deg,#be185d,#ec4899)', color:'white', borderRadius:50, padding:'14px', fontWeight:700, textDecoration:'none' }}>Voir les forfaits →</Link>
        </div>
      </div>
    )
  }

  const done = records.filter(r => r.is_done).length
  const progress = records.length > 0 ? Math.round(done / records.length * 100) : 0
  const due = records.filter(r => r.isDue)
  const overdue = records.filter(r => !r.is_done && r.isPast && !r.isDue)

  return (
    <div style={{ minHeight:'100vh', background:'#fdf2f8', fontFamily:'sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ background:'linear-gradient(135deg,#831843,#be185d)', padding:'20px 16px 50px', textAlign:'center' }}>
        <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.6)', fontSize:13, textDecoration:'none', display:'block', textAlign:'left', marginBottom:14 }}>← Retour</Link>
        <div style={{ fontSize:32, marginBottom:8 }}>💉</div>
        <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, margin:'0 0 4px' }}>Calendrier Vaccinal PEV</h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, margin:0 }}>Programme Élargi de Vaccination — MINSANTÉ Cameroun</p>
      </div>

      <div style={{ maxWidth:500, margin:'-20px auto 0', padding:'0 16px 40px' }}>
        {/* Sélecteur enfant */}
        <div style={{ background:'white', borderRadius:20, padding:16, marginBottom:12, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {children.map(child => (
              <button key={child.id} onClick={() => { setSelected(child.id); loadRecords(createClient(), child.id, child.birth_date) }} style={{
                flexShrink:0, padding:'8px 16px', borderRadius:50, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                background: selected === child.id ? '#be185d' : '#fdf2f8', color: selected === child.id ? 'white' : '#be185d',
              }}>👶 {child.child_name}</button>
            ))}
            <button onClick={() => setShowAddChild(!showAddChild)} style={{ flexShrink:0, padding:'8px 16px', borderRadius:50, border:'1.5px dashed #fca5a5', background:'transparent', color:'#be185d', cursor:'pointer', fontSize:13, fontWeight:700 }}>+ Ajouter</button>
          </div>
          {showAddChild && (
            <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:10 }}>
              <input placeholder="Prénom de l'enfant" value={form.child_name} onChange={e => setForm(p=>({...p,child_name:e.target.value}))}
                style={{ padding:'10px 14px', borderRadius:12, border:'1.5px solid #fce7f3', fontSize:13, outline:'none' }} />
              <input type="date" value={form.birth_date} onChange={e => setForm(p=>({...p,birth_date:e.target.value}))} max={new Date().toISOString().split('T')[0]}
                style={{ padding:'10px 14px', borderRadius:12, border:'1.5px solid #fce7f3', fontSize:13, outline:'none' }} />
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setShowAddChild(false)} style={{ flex:1, padding:'10px', borderRadius:50, border:'1.5px solid #e5e7eb', background:'white', color:'#666', cursor:'pointer', fontWeight:700, fontSize:13 }}>Annuler</button>
                <button onClick={addChild} style={{ flex:2, padding:'10px', borderRadius:50, border:'none', background:'linear-gradient(135deg,#be185d,#ec4899)', color:'white', cursor:'pointer', fontWeight:700, fontSize:13 }}>Enregistrer →</button>
              </div>
            </div>
          )}
        </div>

        {selected && records.length > 0 && (
          <>
            <div style={{ background:'white', borderRadius:18, padding:'16px 18px', marginBottom:12, boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color:'#be185d', fontWeight:700, fontSize:13 }}>Progression</span>
                <span style={{ color:'#be185d', fontWeight:800 }}>{done}/{records.length} vaccins</span>
              </div>
              <div style={{ height:8, background:'#fce7f3', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#be185d,#ec4899)', borderRadius:4 }} />
              </div>
            </div>

            {(due.length > 0 || overdue.length > 0) && (
              <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:16, padding:'14px 16px', marginBottom:12 }}>
                <p style={{ color:'#dc2626', fontWeight:700, fontSize:13, margin:'0 0 10px' }}>🚨 {overdue.length + due.length} vaccin(s) nécessitent votre attention</p>
                {[...overdue, ...due].map((v, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div>
                      <div style={{ color:'#dc2626', fontSize:13, fontWeight:600 }}>{v.label}</div>
                      <div style={{ color:'#aaa', fontSize:11 }}>Prévu: {new Date(v.scheduled_date).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <button onClick={() => toggleVaccine(v)} style={{ background:'#dc2626', color:'white', border:'none', borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer' }}>Fait ✓</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {records.map((v, i) => (
                <div key={i} style={{ background:'white', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 1px 6px rgba(0,0,0,0.04)', borderLeft:`3px solid ${v.is_done ? '#16a34a' : v.isDue ? '#dc2626' : '#e5e7eb'}` }}>
                  <button onClick={() => toggleVaccine(v)} style={{ width:26, height:26, borderRadius:'50%', border: v.is_done ? 'none' : '2px solid #d1d5db', background: v.is_done ? '#16a34a' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {v.is_done && <span style={{ color:'white', fontSize:13 }}>✓</span>}
                  </button>
                  <div style={{ flex:1 }}>
                    <div style={{ color: v.is_done ? '#888' : '#1a2e26', fontSize:13, fontWeight:600, textDecoration: v.is_done ? 'line-through' : 'none' }}>{v.label}</div>
                    <div style={{ color:'#aaa', fontSize:11 }}>{v.description} · {new Date(v.scheduled_date).toLocaleDateString('fr-FR')}</div>
                  </div>
                  {v.isDue && <span style={{ background:'#fef2f2', color:'#dc2626', borderRadius:6, padding:'2px 7px', fontSize:10, fontWeight:700 }}>À FAIRE</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {children.length === 0 && !showAddChild && (
          <div style={{ background:'white', borderRadius:20, padding:32, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>👶</div>
            <p style={{ color:'#888', fontSize:14 }}>Ajoutez votre enfant pour démarrer le suivi vaccinal.</p>
            <button onClick={() => setShowAddChild(true)} style={{ marginTop:12, padding:'12px 28px', borderRadius:50, border:'none', background:'linear-gradient(135deg,#be185d,#ec4899)', color:'white', fontWeight:700, cursor:'pointer' }}>+ Ajouter un enfant</button>
          </div>
        )}
      </div>
    </div>
  )
}
