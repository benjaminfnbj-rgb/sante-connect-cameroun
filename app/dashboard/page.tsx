// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function DashboardPage() {
  const { profile, subscription, loading, signOut: handleLogout } = useAuth()
  const [greeting, setGreeting] = useState('Bonjour')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Bonjour')
    else if (h < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e8f5ee', borderTopColor:'#0d4a3a', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#888', fontSize:13, fontFamily:'sans-serif' }}>Chargement...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const firstName = profile?.full_name?.split(' ')[0] || 'Utilisateur'
  const initials = (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const daysLeft = subscription?.expires_at
    ? Math.max(0, Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000*60*60*24)))
    : null

  const subStatus = subscription?.status
  const isActive = subStatus === 'active' || subStatus === 'trial'

  const services = [
    { icon:'🩺', label:'Consultation', href:'/rendez-vous', color:'#0d4a3a', bg:'#e8f5ee', desc:'Consulter un médecin' },
    { icon:'💊', label:'Pharmacie', href:'/pharmacie', color:'#1d4ed8', bg:'#eff6ff', desc:'Médicaments' },
    { icon:'🤖', label:'Assistant IA', href:'/assistant', color:'#d97706', bg:'#fffbeb', desc:'Conseils santé' },
    { icon:'🌺', label:'Santé Féminine', href:'/sante-feminine', color:'#be185d', bg:'#fdf2f8', desc:'Cycle menstruel' },
    { icon:'🛡️', label:'Assurances', href:'/assurances', color:'#7c3aed', bg:'#f5f3ff', desc:'Couverture santé' },
    { icon:'🏥', label:'Structures', href:'/structures', color:'#0891b2', bg:'#ecfeff', desc:'Pyramide sanitaire' },
    { icon:'🎁', label:'Kit Santé', href:'/kit-sante', color:'#059669', bg:'#ecfdf5', desc:'Retraits mensuels' },
    { icon:'🤰', label:'Grossesse', href:'/grossesse', color:'#d97706', bg:'#fffbeb', desc:'Suivi prénatal' },
  { icon:'👤', label:'Mon Profil', href:'/profil', color:'#6b7280', bg:'#f9fafb', desc:'Mes informations' },
  { icon:'⚙️', label:'Espace Pro', href:'/mon-profil-pro', color:'#0891b2', bg:'#e0f2fe', desc:'Gérer mon profil', proOnly: true },
  ]

  const urgences = [
    { n:'117', l:'Police' },
    { n:'118', l:'Pompiers' },
    { n:'119', l:'SAMU' },
    { n:'112', l:'Universel' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .dash-service-card:active { transform: scale(0.96); }
        .dash-urgence-btn:active { transform: scale(0.94); }
        .dash-header-btn:active { opacity: 0.7; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0a2e22 0%, #0d4a3a 60%, #166534 100%)',
        padding: '52px 20px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:-20, left:-30, width:140, height:140, borderRadius:'50%', background:'rgba(46,184,122,0.08)' }} />

        <div style={{ maxWidth:500, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            {/* Salutation */}
            <div>
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, margin:'0 0 4px', letterSpacing:0.3 }}>{greeting} 👋</p>
              <h1 style={{ color:'white', fontSize:22, fontWeight:700, margin:0, fontFamily:'Georgia,serif', letterSpacing:-0.3 }}>
                {firstName}
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                <div style={{
                  width:8, height:8, borderRadius:'50%',
                  background: isActive ? '#4ade80' : '#f87171',
                  boxShadow: isActive ? '0 0 6px #4ade80' : 'none',
                }} />
                <span style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>
                  {subStatus === 'trial' ? `Essai gratuit · ${daysLeft} j restants` :
                   subStatus === 'active' ? 'Abonnement actif' :
                   subStatus === 'expired' ? 'Abonnement expiré' : 'Aucun abonnement'}
                </span>
              </div>
            </div>
            {/* Actions header */}
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <Link href="/notifications" className="dash-header-btn" style={{
                width:42, height:42, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)',
                border:'1px solid rgba(255,255,255,0.15)', textDecoration:'none',
              }}>
                <span style={{ fontSize:18 }}>🔔</span>
              </Link>
              <button onClick={handleLogout} className="dash-header-btn" style={{
                width:42, height:42, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)',
                border:'1px solid rgba(255,255,255,0.15)', cursor:'pointer',
              }}>
                <span style={{ fontSize:18 }}>🚪</span>
              </button>
              {/* Avatar */}
              <div style={{
                width:42, height:42, borderRadius:'50%',
                background:'linear-gradient(135deg,#2eb87a,#0d4a3a)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'white', fontWeight:700, fontSize:15,
                border:'2px solid rgba(255,255,255,0.3)',
              }}>{initials}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARTE ABONNEMENT (overlap sur le header) ── */}
      <div style={{ maxWidth:500, margin:'-36px auto 0', padding:'0 16px', position:'relative', zIndex:10 }}>
        <div style={{
          background:'white', borderRadius:24, padding:'18px 20px',
          boxShadow:'0 8px 32px rgba(0,0,0,0.12)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          animation:'fadeUp 0.4s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              width:48, height:48, borderRadius:16,
              background: isActive ? '#e8f5ee' : '#fef2f2',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0,
            }}>
              {subStatus === 'trial' ? '🎁' : subStatus === 'active' ? '✅' : '⚠️'}
            </div>
            <div>
              <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:15, margin:'0 0 3px' }}>
                {subStatus === 'trial' ? 'Essai gratuit en cours' :
                 subStatus === 'active' ? 'Abonnement actif' : 'Abonnement expiré'}
              </p>
              <p style={{ color:'#888', fontSize:12, margin:0 }}>
                {subStatus === 'trial' && daysLeft !== null ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}` :
                 subscription?.expires_at ? `Jusqu'au ${new Date(subscription.expires_at).toLocaleDateString('fr-FR')}` :
                 'Accès limité aux services'}
              </p>
            </div>
          </div>
          <Link href="/tarifs" style={{
            background: isActive ? '#f0fdf4' : 'linear-gradient(135deg,#0d4a3a,#2eb87a)',
            color: isActive ? '#0d4a3a' : 'white',
            borderRadius:14, padding:'9px 16px', fontWeight:700, fontSize:12,
            textDecoration:'none', flexShrink:0,
            border: isActive ? '1px solid #86efac' : 'none',
          }}>
            {isActive ? 'Gérer' : 'S\'abonner'}
          </Link>
        </div>

        {/* ── GRILLE SERVICES ── */}
        <div style={{ marginTop:24 }}>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:17, margin:'0 0 14px', fontFamily:'Georgia,serif' }}>
            Mes services
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {services.map((s, i) => (
              <Link key={i} href={s.href} className="dash-service-card" style={{
                textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center',
                gap:8, padding:'14px 6px 12px', background:'white', borderRadius:20,
                boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
                transition:'transform 0.15s',
                animation:`fadeUp ${0.3 + i * 0.05}s ease`,
              }}>
                <div style={{
                  width:46, height:46, borderRadius:15, background:s.bg,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                }}>
                  {s.icon}
                </div>
                <span style={{ color:'#1a2e26', fontSize:11, fontWeight:600, textAlign:'center', lineHeight:1.3 }}>
                  {s.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── ACCÈS RAPIDE (Professionnel/Pharmacie) ── */}
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:10 }}>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:17, margin:'0 0 4px', fontFamily:'Georgia,serif' }}>
            Trouver des soins
          </p>
          <Link href="/professionnels" style={{
            background:'white', borderRadius:20, padding:'16px 20px',
            display:'flex', alignItems:'center', gap:14, textDecoration:'none',
            boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width:48, height:48, borderRadius:16, background:'#e8f5ee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>👨‍⚕️</div>
            <div style={{ flex:1 }}>
              <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:14, margin:'0 0 2px' }}>Médecins & Spécialistes</p>
              <p style={{ color:'#888', fontSize:12, margin:0 }}>Consultez les professionnels vérifiés</p>
            </div>
            <span style={{ color:'#0d4a3a', fontSize:20 }}>›</span>
          </Link>
          <Link href="/structures" style={{
            background:'white', borderRadius:20, padding:'16px 20px',
            display:'flex', alignItems:'center', gap:14, textDecoration:'none',
            boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width:48, height:48, borderRadius:16, background:'#ecfeff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🏥</div>
            <div style={{ flex:1 }}>
              <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:14, margin:'0 0 2px' }}>Structures Sanitaires</p>
              <p style={{ color:'#888', fontSize:12, margin:0 }}>6 catégories · Pyramide du MINSANTÉ</p>
            </div>
            <span style={{ color:'#0d4a3a', fontSize:20 }}>›</span>
          </Link>
        </div>

        {/* ── URGENCES ── */}
        <div style={{
          marginTop:20, marginBottom:32,
          background:'linear-gradient(135deg,#7f1d1d,#dc2626)',
          borderRadius:24, padding:'18px 20px',
          boxShadow:'0 4px 20px rgba(220,38,38,0.3)',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>🚨</span>
              <span style={{ color:'white', fontWeight:700, fontSize:14 }}>Urgences Cameroun</span>
            </div>
            <Link href="/urgences" style={{
              color:'rgba(255,255,255,0.8)', fontSize:12, textDecoration:'none',
              background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'4px 10px',
            }}>Voir tous →</Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {urgences.map(u => (
              <a key={u.n} href={`tel:${u.n}`} className="dash-urgence-btn" style={{
                background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)',
                borderRadius:14, padding:'10px 4px', textAlign:'center',
                textDecoration:'none', border:'1px solid rgba(255,255,255,0.2)',
                transition:'transform 0.1s',
              }}>
                <div style={{ color:'white', fontWeight:800, fontSize:18, fontFamily:'monospace', lineHeight:1 }}>{u.n}</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:9, marginTop:3 }}>{u.l}</div>
              </a>
            ))}
          </div>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10, textAlign:'center', marginTop:10, margin:'10px 0 0' }}>
            Accessibles même sans abonnement actif
          </p>
        </div>
      </div>
    </div>
  )
}
