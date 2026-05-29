// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function KitSantePage() {
  const [profile, setProfile] = useState(null)
  const [sub, setSub] = useState(null)
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => { const user = session?.user;
      if (!user) { router.push('/connexion'); return }
      const [{ data: p }, { data: s }, { data: w }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('kit_withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      ])
      setProfile(p); setSub(s); setWithdrawals(w || [])
      setLoading(false)
    })
  }, [router])

  const generateReceipt = async () => {
    setGenerating(true)
    const code = 'SCK-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const month = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
    const kitType = sub?.include_condoms !== false ? 'condoms_pads' : 'pads'
    await supabase.from('kit_withdrawals').insert({
      user_id: profile.id,
      subscription_id: sub?.id,
      kit_type: kitType,
      receipt_code: code,
    })
    setReceipt({ code, month })
    setGenerating(false)
  }

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#faf8f3' }}><div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #0d4a3a', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} /></div>

  const isFemaleUnder50 = profile?.gender === 'female' && (!profile?.date_of_birth || (new Date().getFullYear() - new Date(profile?.date_of_birth).getFullYear()) < 50)
  const isActive = sub?.status === 'active' || sub?.status === 'trial'
  const thisMonthMonth = new Date().toISOString().slice(0,7)
  const thisMonthWithdrawal = withdrawals.find(w => w.created_at?.slice(0,7) === thisMonthMonth)

  return (
    <div style={{ minHeight:'100vh', background:'#faf8f3', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding:'20px 20px 40px' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.7)', fontSize:14, textDecoration:'none', display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>← Retour</Link>
          <h1 style={{ color:'white', fontSize:24, fontFamily:'Georgia,serif', fontWeight:700, margin:'0 0 6px' }}>🎁 Mon Kit Santé</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>Retirez vos produits dans une pharmacie partenaire</p>
        </div>
      </div>

      <div style={{ maxWidth:500, margin:'-20px auto 0', padding:'0 16px' }}>
        {!isActive ? (
          <div style={{ background:'white', borderRadius:20, padding:28, textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
            <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', margin:'0 0 8px' }}>Abonnement requis</h3>
            <p style={{ color:'#888', fontSize:14, margin:'0 0 20px' }}>Souscrivez pour accéder aux kits santé mensuels</p>
            <Link href="/tarifs" style={{ display:'inline-block', background:'#0d4a3a', color:'white', borderRadius:50, padding:'12px 28px', fontWeight:700, fontSize:14, textDecoration:'none' }}>Voir les tarifs</Link>
          </div>
        ) : (
          <>
            {/* Ce que contient le kit */}
            <div style={{ background:'white', borderRadius:20, padding:24, marginBottom:16, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:16, margin:'0 0 16px' }}>📦 Votre kit ce mois</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {sub?.include_condoms !== false && (
                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'#f0fdf4', borderRadius:14 }}>
                    <div style={{ fontSize:28 }}>🛡️</div>
                    <div>
                      <div style={{ fontWeight:700, color:'#0d4a3a', fontSize:14 }}>Préservatifs</div>
                      <div style={{ color:'#888', fontSize:12 }}>Inclus dans l&apos;abonnement · Protection VIH/MST</div>
                    </div>
                    <div style={{ marginLeft:'auto', color:'#16a34a', fontWeight:700, fontSize:13 }}>✓ Inclus</div>
                  </div>
                )}
                {isFemaleUnder50 && (
                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'#fdf2f8', borderRadius:14 }}>
                    <div style={{ fontSize:28 }}>🌸</div>
                    <div>
                      <div style={{ fontWeight:700, color:'#be185d', fontSize:14 }}>Serviettes hygiéniques</div>
                      <div style={{ color:'#888', fontSize:12 }}>Gratuites · Lutte contre la précarité menstruelle</div>
                    </div>
                    <div style={{ marginLeft:'auto', color:'#be185d', fontWeight:700, fontSize:13 }}>✓ Gratuit</div>
                  </div>
                )}
                {sub?.include_condoms === false && !isFemaleUnder50 && (
                  <p style={{ color:'#888', fontSize:13, textAlign:'center', padding:16 }}>Vous avez refusé les produits lors de l&apos;abonnement.</p>
                )}
              </div>
            </div>

            {/* Générer reçu */}
            {!thisMonthWithdrawal && !receipt ? (
              <div style={{ background:'white', borderRadius:20, padding:24, marginBottom:16, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
                <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', margin:'0 0 8px' }}>Générer mon reçu</h3>
                <p style={{ color:'#888', fontSize:13, margin:'0 0 20px', lineHeight:1.6 }}>
                  Obtenez un code unique à présenter dans la pharmacie partenaire la plus proche pour retirer votre kit.
                </p>
                <button onClick={generateReceipt} disabled={generating} style={{
                  background:'linear-gradient(135deg,#0d4a3a,#2eb87a)', color:'white', border:'none',
                  borderRadius:50, padding:'14px 32px', fontWeight:700, fontSize:15, cursor:'pointer', width:'100%',
                }}>
                  {generating ? '⏳ Génération...' : '📋 Générer mon reçu de retrait'}
                </button>
              </div>
            ) : (
              <div style={{ background:'linear-gradient(135deg,#0d4a3a,#1a7a5e)', borderRadius:20, padding:28, marginBottom:16, textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
                <h3 style={{ color:'white', fontFamily:'Georgia,serif', margin:'0 0 8px' }}>Votre reçu est prêt !</h3>
                <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:14, padding:20, margin:'16px 0' }}>
                  <p style={{ color:'rgba(255,255,255,0.7)', fontSize:12, margin:'0 0 6px' }}>CODE DE RETRAIT</p>
                  <p style={{ color:'white', fontSize:28, fontWeight:700, fontFamily:'monospace', letterSpacing:3 }}>
                    {receipt?.code || thisMonthWithdrawal?.receipt_code}
                  </p>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:6 }}>
                    Valable jusqu&apos;au {new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, lineHeight:1.6 }}>
                  Présentez ce code dans la <strong>pharmacie partenaire la plus proche</strong> pour retirer votre kit santé.
                </p>
              </div>
            )}

            {/* Historique */}
            {withdrawals.length > 0 && (
              <div style={{ background:'white', borderRadius:20, padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:15, margin:'0 0 14px' }}>📜 Historique des retraits</h3>
                {withdrawals.map(w => (
                  <div key={w.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f0f0f0' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:'#333', fontFamily:'monospace' }}>{w.receipt_code}</div>
                      <div style={{ color:'#888', fontSize:12 }}>{new Date(w.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                    </div>
                    <span style={{ background:'#dcfce7', color:'#16a34a', borderRadius:8, padding:'3px 10px', fontSize:11, fontWeight:700 }}>Retiré</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
