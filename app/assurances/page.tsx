// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const INSURANCE_TYPES = [
  {
    id: 'sante',
    icon: '🏥',
    title: 'Assurance Santé',
    desc: 'Couverture des frais médicaux, hospitalisations, consultations et médicaments.',
    color: '#0d4a3a', bg: '#e8f5ee',
    benefits: ['Consultations médicales remboursées', 'Hospitalisation prise en charge', 'Médicaments sur ordonnance', 'Examens biologiques et imagerie'],
  },
  {
    id: 'maladie',
    icon: '💊',
    title: 'Assurance Maladie',
    desc: 'Indemnités journalières en cas d\'arrêt maladie et incapacité temporaire.',
    color: '#1d4ed8', bg: '#eff6ff',
    benefits: ['Indemnités journalières', 'Incapacité temporaire de travail', 'Maladies chroniques couvertes', 'Accidents du travail'],
  },
  {
    id: 'vie',
    icon: '🛡️',
    title: 'Assurance Vie',
    desc: 'Protection financière de votre famille en cas de décès ou invalidité.',
    color: '#7c3aed', bg: '#f5f3ff',
    benefits: ['Capital décès versé aux bénéficiaires', 'Rente invalidité permanente', 'Épargne retraite', 'Prévoyance famille'],
  },
  {
    id: 'maternite',
    icon: '🤰',
    title: 'Assurance Maternité',
    desc: 'Couverture complète des frais liés à la grossesse et à l\'accouchement.',
    color: '#be185d', bg: '#fdf2f8',
    benefits: ['Consultations prénatales remboursées', 'Accouchement pris en charge', 'Soins post-partum', 'Suivi pédiatrique nouveau-né'],
  },
]

export default function AssurancesPage() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', email:'', type:'sante', message:'' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
      const { data: sub } = await sb.from('subscriptions').select('plan,status').eq('user_id', session.user.id).single()
      setSubscription(sub)
      setLoading(false)
    })
  }, [router])

  const hasAccess = ['max','family','pregnancy'].includes(subscription?.plan)

  const sendRequest = async () => {
    if (!form.name || !form.phone) return
    setSending(true)
    const sb = createClient()
    await sb.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Demande assurance envoyée',
      message: `Votre demande de devis ${form.type} a été transmise. Un conseiller vous contactera sous 48h.`,
      is_read: false,
    })
    setSent(true)
    setSending(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fa' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #e8f5ee', borderTopColor:'#0d4a3a', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Accès restreint
  if (!hasAccess) {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ background:'white', borderRadius:28, padding:'36px 24px', maxWidth:400, width:'100%', textAlign:'center', boxShadow:'0 24px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🛡️</div>
          <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:20, margin:'0 0 10px' }}>Espace Assurances</h2>
          <p style={{ color:'#555', fontSize:13, lineHeight:1.7, margin:'0 0 8px' }}>
            Disponible à partir du <strong>Forfait Max</strong> à <strong>2 000 FCFA/mois</strong>.
          </p>
          <p style={{ color:'#888', fontSize:12, margin:'0 0 24px', lineHeight:1.6 }}>
            Accédez aux offres de nos compagnies d'assurance partenaires — Santé, Maladie, Vie, Maternité.
          </p>
          <Link href="/tarifs" style={{ display:'block', background:'linear-gradient(135deg,#0d4a3a,#2eb87a)', color:'white', borderRadius:50, padding:'14px', fontWeight:700, textDecoration:'none', fontSize:14 }}>
            Voir les forfaits →
          </Link>
          <Link href="/dashboard" style={{ display:'block', marginTop:12, color:'#aaa', fontSize:12, textDecoration:'none' }}>← Retour au tableau de bord</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif', paddingBottom:40 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0a2e22,#0d4a3a)', padding:'20px 16px 28px', textAlign:'center', position:'relative' }}>
        <Link href="/dashboard" style={{ position:'absolute', top:16, left:16, color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13 }}>← Retour</Link>
        <div style={{ fontSize:32, marginBottom:8 }}>🛡️</div>
        <h1 style={{ color:'white', fontSize:20, fontWeight:800, margin:'0 0 4px' }}>Espace Assurances</h1>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0 }}>Compagnies partenaires vérifiées — Devis gratuit</p>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'16px 14px' }}>

        {/* Types d'assurance */}
        <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:14, margin:'0 0 12px' }}>Choisissez votre type de couverture</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {INSURANCE_TYPES.map((ins, i) => (
            <div key={ins.id} onClick={() => setSelected(selected===ins.id?null:ins.id)} style={{ background:'white', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', cursor:'pointer', border:`2px solid ${selected===ins.id?ins.color:'transparent'}`, animation:`fadeUp ${.1+i*.06}s ease` }}>
              <div style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:46, height:46, borderRadius:14, background:ins.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{ins.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#1a1a1a', fontSize:14 }}>{ins.title}</div>
                  <div style={{ color:'#888', fontSize:12, marginTop:2 }}>{ins.desc}</div>
                </div>
                <span style={{ color:ins.color, fontSize:18, transform:selected===ins.id?'rotate(90deg)':'none', transition:'transform .2s', flexShrink:0 }}>›</span>
              </div>
              {selected===ins.id && (
                <div style={{ padding:'0 16px 14px', borderTop:'1px solid #f5f5f5' }}>
                  {ins.benefits.map((b, j) => (
                    <div key={j} style={{ display:'flex', gap:8, marginBottom:5 }}>
                      <span style={{ color:ins.color, fontWeight:700 }}>✓</span>
                      <span style={{ color:'#555', fontSize:12, lineHeight:1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Formulaire devis */}
        {!sent ? (
          <div style={{ background:'white', borderRadius:20, padding:'20px 18px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
            <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:15, margin:'0 0 4px' }}>📋 Demander un devis gratuit</p>
            <p style={{ color:'#888', fontSize:12, margin:'0 0 16px' }}>Un conseiller de nos compagnies partenaires vous contactera sous 24-48h.</p>

            <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:11, marginBottom:5 }}>Type d'assurance souhaité</label>
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{ width:'100%', padding:'11px 13px', borderRadius:11, border:'1.5px solid #e5e7eb', fontSize:13, outline:'none', marginBottom:12, background:'white', fontFamily:'sans-serif' }}>
              {INSURANCE_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.title}</option>)}
            </select>

            <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:11, marginBottom:5 }}>Nom complet *</label>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Votre nom et prénom" style={{ width:'100%', padding:'11px 13px', borderRadius:11, border:'1.5px solid #e5e7eb', fontSize:13, outline:'none', marginBottom:12, boxSizing:'border-box', fontFamily:'sans-serif' }}/>

            <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:11, marginBottom:5 }}>Téléphone / WhatsApp *</label>
            <input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+237 6XX XXX XXX" style={{ width:'100%', padding:'11px 13px', borderRadius:11, border:'1.5px solid #e5e7eb', fontSize:13, outline:'none', marginBottom:12, boxSizing:'border-box', fontFamily:'sans-serif' }}/>

            <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:11, marginBottom:5 }}>Message (optionnel)</label>
            <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="Précisez vos besoins, votre budget, votre situation..." rows={3} style={{ width:'100%', padding:'11px 13px', borderRadius:11, border:'1.5px solid #e5e7eb', fontSize:13, outline:'none', marginBottom:16, resize:'none', boxSizing:'border-box', fontFamily:'sans-serif' }}/>

            <button onClick={sendRequest} disabled={!form.name||!form.phone||sending} style={{ width:'100%', padding:'14px', borderRadius:50, border:'none', background:form.name&&form.phone?'linear-gradient(135deg,#0d4a3a,#2eb87a)':'#e5e7eb', color:form.name&&form.phone?'white':'#aaa', fontWeight:700, fontSize:14, cursor:'pointer', boxShadow:form.name&&form.phone?'0 4px 14px rgba(13,74,58,0.3)':'none' }}>
              {sending?'⏳ Envoi...':'📨 Envoyer ma demande de devis'}
            </button>

            <p style={{ color:'#aaa', fontSize:11, textAlign:'center', margin:'10px 0 0' }}>Devis gratuit · Sans engagement · Réponse sous 48h</p>
          </div>
        ) : (
          <div style={{ background:'#e8f5ee', borderRadius:20, padding:'32px 24px', textAlign:'center', border:'1.5px solid #86efac' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
            <h3 style={{ color:'#0d4a3a', fontSize:18, fontFamily:'Georgia,serif', margin:'0 0 10px' }}>Demande envoyée !</h3>
            <p style={{ color:'#555', fontSize:13, lineHeight:1.7, margin:'0 0 20px' }}>
              Votre demande de devis a été transmise à nos compagnies partenaires.<br/>
              Un conseiller vous contactera au <strong>{form.phone}</strong> sous <strong>24 à 48 heures</strong>.
            </p>
            <button onClick={()=>setSent(false)} style={{ background:'#0d4a3a', color:'white', border:'none', borderRadius:50, padding:'12px 28px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Nouvelle demande
            </button>
          </div>
        )}

        {/* Note */}
        <div style={{ background:'#fffbeb', borderRadius:14, padding:'12px 14px', marginTop:14, border:'1px solid #fde68a' }}>
          <p style={{ color:'#92400e', fontSize:11, margin:0, lineHeight:1.6 }}>
            ℹ️ Santé Connect joue uniquement le rôle d'intermédiaire de mise en relation. Les contrats d'assurance sont directement souscrits auprès des compagnies partenaires agréées par le MINFI Cameroun.
          </p>
        </div>
      </div>
    </div>
  )
}
