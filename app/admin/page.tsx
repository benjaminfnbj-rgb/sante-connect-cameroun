// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [pendingKyc, setPendingKyc] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      const { data: p } = await sb.from('profiles').select('user_type').eq('id', user.id).single()
      if (!p || p.user_type !== 'admin') { router.push('/dashboard'); return }

      const [{ count: totalUsers }, { count: totalPros }, { count: activeSubs }, { data: pending }] = await Promise.all([
        sb.from('profiles').select('*', { count:'exact', head:true }),
        sb.from('professional_profiles').select('*', { count:'exact', head:true }),
        sb.from('subscriptions').select('*', { count:'exact', head:true }).in('status', ['active','trial']),
        sb.from('professional_profiles')
          .select('*, profiles!professional_profiles_user_id_fkey(full_name, email)')
          .eq('verification_status', 'pending').limit(30),
      ])
      setStats({ totalUsers: totalUsers||0, totalPros: totalPros||0, activeSubs: activeSubs||0 })
      setPendingKyc(pending || [])
      setLoading(false)
    })
  }, [router])

  const approveKyc = async (pro) => {
    const sb = createClient()
    await sb.from('professional_profiles').update({
      verification_status: 'verified',
      is_visible: true,
    }).eq('id', pro.id)
    // Send approval email
    try {
      await fetch('/api/emails/professional-approved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: pro.profiles?.email, name: pro.structure_name || pro.profiles?.full_name, status: 'approved' })
      })
    } catch(e) {}
    setPendingKyc(prev => prev.filter(p => p.id !== pro.id))
    setActionMsg(`✅ ${pro.structure_name || pro.profiles?.full_name} validé et notifié par email`)
    setTimeout(() => setActionMsg(''), 4000)
  }

  const rejectKyc = async (pro) => {
    const sb = createClient()
    await sb.from('professional_profiles').update({ verification_status: 'rejected', is_visible: false }).eq('id', pro.id)
    setPendingKyc(prev => prev.filter(p => p.id !== pro.id))
    setActionMsg(`❌ ${pro.structure_name || pro.profiles?.full_name} refusé`)
    setTimeout(() => setActionMsg(''), 4000)
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a1a14', color:'white', fontSize:18 }}>⏳ Chargement...</div>

  return (
    <div style={{ minHeight:'100vh', background:'#0a1a14', color:'white', paddingBottom:40, fontFamily:'sans-serif' }}>
      {/* Header */}
      <div style={{ background:'rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'20px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:20, fontFamily:'Georgia,serif', margin:'0 0 3px' }}>🛠️ Admin — Santé Connect</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:0 }}>Tableau de bord administrateur</p>
          </div>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.5)', fontSize:13, textDecoration:'none' }}>← Dashboard</Link>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 16px' }}>
        {actionMsg && (
          <div style={{ background:'rgba(46,184,122,0.15)', border:'1px solid #2eb87a', borderRadius:12, padding:'12px 20px', marginBottom:20, color:'#2eb87a', fontSize:14 }}>
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
            {[
              { label:'Utilisateurs', value: stats.totalUsers, icon:'👥', color:'#2eb87a' },
              { label:'Professionnels', value: stats.totalPros, icon:'👨‍⚕️', color:'#3b82f6' },
              { label:'Abonnements actifs', value: stats.activeSubs, icon:'💳', color:'#f5a623' },
            ].map((s, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.06)', borderRadius:16, padding:20, border:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontSize:26, fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ color:'rgba(255,255,255,0.45)', fontSize:12, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* KYC Pending */}
        <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:18, margin:0 }}>🔍 Validations KYC en attente</h2>
            {pendingKyc.length > 0 && (
              <span style={{ background:'#f5a623', color:'#0a1a14', borderRadius:20, padding:'2px 10px', fontSize:13, fontWeight:700 }}>{pendingKyc.length}</span>
            )}
          </div>

          {pendingKyc.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
              <p style={{ fontSize:14 }}>Aucune validation en attente</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {pendingKyc.map(pro => (
                <div key={pro.id} style={{ background:'rgba(255,255,255,0.07)', borderRadius:16, padding:'18px 20px', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>
                        {pro.structure_name || pro.profiles?.full_name || 'Structure sans nom'}
                      </div>
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:3 }}>📧 {pro.profiles?.email}</div>
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:3 }}>
                        🏷️ {pro.structure_type} · 📍 {pro.city || 'Ville non précisée'}
                      </div>
                      {pro.specialty && <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:3 }}>⚕️ {pro.specialty}</div>}
                      {pro.license_number && <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>📋 Licence: {pro.license_number}</div>}
                      {pro.order_registration && <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>📜 Ordre: {pro.order_registration}</div>}
                      {pro.is_public_sector && <div style={{ color:'#2eb87a', fontSize:12, fontWeight:700, marginTop:4 }}>🏛️ Structure publique — Accès gratuit</div>}
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button onClick={() => approveKyc(pro)} style={{ background:'#16a34a', color:'white', border:'none', borderRadius:12, padding:'10px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                        ✓ Valider
                      </button>
                      <button onClick={() => rejectKyc(pro)} style={{ background:'#dc2626', color:'white', border:'none', borderRadius:12, padding:'10px 16px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                        ✗ Refuser
                      </button>
                    </div>
                  </div>
                  {pro.description && (
                    <div style={{ marginTop:10, padding:'10px 14px', background:'rgba(255,255,255,0.05)', borderRadius:10, color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.5 }}>
                      {pro.description}
                    </div>
                  )}
                  {pro.cv_url && (
                    <a href={pro.cv_url} target="_blank" rel="noreferrer" style={{ display:'inline-block', marginTop:8, color:'#2eb87a', fontSize:12, textDecoration:'none', fontWeight:600 }}>
                      📄 Voir les documents →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
