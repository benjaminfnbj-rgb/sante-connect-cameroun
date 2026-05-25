// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [pendingKyc, setPendingKyc] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      const { data: p } = await supabase.from('profiles').select('user_type').eq('id', user.id).single()
      if (!p || p.user_type !== 'admin') { router.push('/dashboard'); return }

      const [{ count: totalUsers }, { count: totalPros }, { count: activeSubs }, { data: pending }] = await Promise.all([
        supabase.from('profiles').select('*', { count:'exact', head:true }),
        supabase.from('professional_profiles').select('*', { count:'exact', head:true }),
        supabase.from('subscriptions').select('*', { count:'exact', head:true }).eq('status', 'active'),
        supabase.from('professional_profiles').select('*, profiles(full_name, email)').eq('verification_status', 'pending').limit(20),
      ])
      setStats({ totalUsers, totalPros, activeSubs })
      setPendingKyc(pending || [])
      setLoading(false)
    })
  }, [router])

  const approveKyc = async (id) => {
    await supabase.from('professional_profiles').update({ verification_status: 'verified', is_visible: true }).eq('id', id)
    setPendingKyc(prev => prev.filter(p => p.id !== id))
  }

  const rejectKyc = async (id) => {
    await supabase.from('professional_profiles').update({ verification_status: 'rejected' }).eq('id', id)
    setPendingKyc(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d4a3a' }}><div style={{ color:'white', fontSize:20 }}>⏳ Chargement admin...</div></div>

  return (
    <div style={{ minHeight:'100vh', background:'#0a1a14', color:'white', padding:'0 0 40px' }}>
      {/* Header */}
      <div style={{ background:'rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'20px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:22, fontFamily:'Georgia,serif', margin:'0 0 4px' }}>🛠️ Admin — Santé Connect</h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0 }}>Tableau de bord administrateur</p>
          </div>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.6)', fontSize:13, textDecoration:'none' }}>← Dashboard</Link>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 16px' }}>
        {/* Stats */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
            {[
              { label:'Utilisateurs total', value: stats.totalUsers || 0, icon:'👥', color:'#2eb87a' },
              { label:'Professionnels inscrits', value: stats.totalPros || 0, icon:'👨‍⚕️', color:'#3b82f6' },
              { label:'Abonnements actifs', value: stats.activeSubs || 0, icon:'💳', color:'#f5a623' },
            ].map((s, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.07)', borderRadius:16, padding:20, border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontSize:28, fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* KYC Pending */}
        <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:18, margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
            🔍 Validations KYC en attente
            {pendingKyc.length > 0 && <span style={{ background:'#f5a623', color:'#0a1a14', borderRadius:20, padding:'2px 10px', fontSize:13, fontWeight:700 }}>{pendingKyc.length}</span>}
          </h2>
          {pendingKyc.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
              <p style={{ fontSize:14 }}>Aucune validation en attente</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {pendingKyc.map(pro => (
                <div key={pro.id} style={{ background:'rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 20px', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{pro.structure_name || pro.profiles?.full_name}</div>
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>📧 {pro.profiles?.email}</div>
                      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>🏷️ {pro.structure_type} · 📍 {pro.city || 'N/A'}</div>
                      {pro.license_number && <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12 }}>📋 Licence: {pro.license_number}</div>}
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button onClick={() => approveKyc(pro.id)} style={{ background:'#16a34a', color:'white', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>✓ Valider</button>
                      <button onClick={() => rejectKyc(pro.id)} style={{ background:'#dc2626', color:'white', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>✗ Refuser</button>
                    </div>
                  </div>
                  {pro.cv_url && (
                    <a href={pro.cv_url} target="_blank" rel="noreferrer" style={{ color:'#2eb87a', fontSize:12, textDecoration:'none', display:'inline-block', marginTop:8 }}>
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
