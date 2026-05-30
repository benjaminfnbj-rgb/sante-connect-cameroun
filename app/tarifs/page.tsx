'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'basic', name: 'Basique', price_month: 1000, price_year: 10000,
    color: '#0d4a3a', gradient: 'linear-gradient(135deg,#0a2e22,#0d4a3a)', light: '#e8f5ee', icon: '🌿', badge: null,
    summary: 'L\'essentiel pour accéder aux soins',
    highlights: ['👨‍⚕️ Médecins vérifiés', '💊 Pharmacies de garde', '🏥 Carte hôpitaux', '🤖 IA · 5 questions/mois', '🌸 Suivi cycle'],
    kit: '🎁 Préservatifs',
    extras: [],
  },
  {
    id: 'intermediate', name: 'Intermédiaire', price_month: 1500, price_year: 15000,
    color: '#6d28d9', gradient: 'linear-gradient(135deg,#4c1d95,#7c3aed)', light: '#f5f3ff', icon: '💜', badge: 'Populaire',
    summary: 'Plus de confort et d\'hygiène',
    highlights: ['👨‍⚕️ Médecins vérifiés', '💊 Pharmacies de garde', '🏥 Carte hôpitaux', '🤖 IA · 10 questions/mois', '🌸 Suivi cycle'],
    kit: '🌸 Serviettes + 🎁 Préservatifs',
    extras: [],
  },
  {
    id: 'max', name: 'Max', price_month: 2000, price_year: 20000,
    color: '#b45309', gradient: 'linear-gradient(135deg,#78350f,#d97706)', light: '#fffbeb', icon: '⭐', badge: 'Recommandé',
    summary: 'Services complets + Assurances',
    highlights: ['👨‍⚕️ Médecins vérifiés', '💊 Pharmacies de garde', '🏥 Carte hôpitaux', '🤖 IA · 15 questions/mois', '🌸 Suivi cycle'],
    kit: '🌸 Serviettes + 🎁 Préservatifs',
    extras: ['🛡️ Espace Assurances — Santé, Vie, Maladie'],
  },
  {
    id: 'pregnancy', name: 'Grossesse', price_month: 2500, price_year: 25000,
    color: '#0891b2', gradient: 'linear-gradient(135deg,#075985,#0e7490)', light: '#e0f2fe', icon: '🤰', badge: 'Exclusif',
    summary: 'Dédié aux femmes enceintes',
    highlights: ['👨‍⚕️ Gynécologues & sages-femmes', '💊 Vitamines prénatales', '🏥 Maternités partenaires', '🤖 IA · 30 questions/mois', '🌸 Suivi cycle'],
    kit: '🌸 Kit Maternité post-partum',
    extras: ['🤰 Guide grossesse 7 CPN — Protocole MINSANTÉ', '🤱 Guide allaitement complet', '🛡️ Assurances Maternité'],
  },
  {
    id: 'family', name: 'Famille', price_month: 3000, price_year: 30000,
    color: '#be185d', gradient: 'linear-gradient(135deg,#831843,#be185d)', light: '#fdf2f8', icon: '👨‍👩‍👧‍👦', badge: 'Complet',
    summary: 'Tout inclus pour toute la famille',
    highlights: ['👨‍⚕️ Médecins vérifiés', '💊 Pharmacies de garde', '🏥 Carte hôpitaux', '🤖 IA · 30 questions/mois', '🌸 Suivi cycle'],
    kit: '🌸 Serviettes + 🎁 Préservatifs',
    extras: ['🛡️ Espace Assurances — Santé, Vie, Maladie', '💉 Calendrier Vaccinal Intelligent — BCG, DTC, VPO, ROR...'],
  },
]

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false)
  const [open, setOpen] = useState<string|null>(null)

  return (
    <div style={{ minHeight:'100vh', background:'#f4f6f4', fontFamily:'system-ui,sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shine { from{background-position:200% center} to{background-position:-200% center} }
        .plan:active { transform:scale(0.99); }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ background:'linear-gradient(160deg,#071c14,#0d4a3a)', padding:'48px 20px 56px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(46,184,122,0.07)' }}/>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }}/>
        <Link href="/" style={{ position:'absolute', top:18, left:18, color:'rgba(255,255,255,0.45)', textDecoration:'none', fontSize:12 }}>← Accueil</Link>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(46,184,122,0.15)', borderRadius:50, padding:'5px 14px', marginBottom:16 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block' }}/>
            <span style={{ color:'#4ade80', fontSize:11, fontWeight:700 }}>1 mois d'essai gratuit</span>
          </div>
          <h1 style={{ color:'white', fontSize:26, fontWeight:900, margin:'0 0 8px', letterSpacing:-.5 }}>Choisissez votre forfait</h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:'0 0 28px' }}>Sans engagement · Résiliable à tout moment</p>
          {/* Toggle */}
          <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.08)', borderRadius:50, padding:3 }}>
            {[false,true].map(isA => (
              <button key={String(isA)} onClick={()=>setAnnual(isA)} style={{
                padding:'9px 22px', borderRadius:50, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all .2s',
                background: annual===isA ? 'white' : 'transparent',
                color: annual===isA ? '#0d4a3a' : 'rgba(255,255,255,0.55)',
              }}>
                {isA ? '📅 Annuel −2 mois' : '📆 Mensuel'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CARDS ── */}
      <div style={{ maxWidth:500, margin:'-18px auto 0', padding:'0 14px 40px', display:'flex', flexDirection:'column', gap:12 }}>
        {PLANS.map((p, i) => {
          const price = annual ? p.price_year : p.price_month
          const isOpen = open === p.id
          return (
            <div key={p.id} className="plan" style={{
              background:'white', borderRadius:22, overflow:'hidden',
              boxShadow: isOpen ? `0 8px 32px ${p.color}30` : '0 3px 14px rgba(0,0,0,0.07)',
              border: isOpen ? `2px solid ${p.color}` : '2px solid transparent',
              transition:'all .25s', animation:`fadeUp ${.1+i*.06}s ease`,
            }}>

              {/* ── EN-TÊTE ── */}
              <div style={{ background:p.gradient, padding:'18px 20px 20px' }}>
                {/* Ligne badge */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:42, height:42, borderRadius:14, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{p.icon}</div>
                    <div>
                      <div style={{ color:'white', fontWeight:800, fontSize:16 }}>Forfait {p.name}</div>
                      <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:1 }}>{p.summary}</div>
                    </div>
                  </div>
                  {p.badge && (
                    <span style={{ background:'rgba(255,255,255,0.2)', color:'white', borderRadius:20, padding:'3px 12px', fontSize:10, fontWeight:800, flexShrink:0 }}>{p.badge}</span>
                  )}
                </div>

                {/* Prix bien visible */}
                <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
                  <span style={{ color:'white', fontWeight:900, fontSize:42, lineHeight:1, letterSpacing:-1 }}>
                    {price.toLocaleString()}
                  </span>
                  <div style={{ paddingBottom:6 }}>
                    <div style={{ color:'rgba(255,255,255,0.9)', fontWeight:700, fontSize:14 }}>FCFA</div>
                    <div style={{ color:'rgba(255,255,255,0.55)', fontSize:11 }}>/{annual?'an':'mois'}</div>
                  </div>
                  {annual && (
                    <span style={{ marginLeft:6, paddingBottom:6, color:'rgba(255,255,255,0.4)', fontSize:11, textDecoration:'line-through' }}>
                      {(p.price_month*12).toLocaleString()} F
                    </span>
                  )}
                </div>

                {annual && (
                  <div style={{ marginTop:6, display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.12)', borderRadius:20, padding:'3px 10px' }}>
                    <span style={{ color:'#86efac', fontSize:11, fontWeight:700 }}>🎉 Économie : {(p.price_month*2).toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>

              {/* ── CORPS CONDENSÉ ── */}
              <div style={{ padding:'14px 18px' }}>
                {/* Services clés en pills */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:12 }}>
                  {p.highlights.map((h,j) => (
                    <span key={j} style={{ background:'#f4f6f4', color:'#374151', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600 }}>{h}</span>
                  ))}
                </div>

                {/* Kit */}
                <div style={{ background:p.light, borderRadius:12, padding:'9px 13px', marginBottom:p.extras.length?10:0, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>📦</span>
                  <div>
                    <span style={{ color:p.color, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.6 }}>Kit mensuel · Pharmacie partenaire</span>
                    <div style={{ color:p.color, fontSize:12, fontWeight:600, marginTop:1 }}>{p.kit}</div>
                  </div>
                </div>

                {/* Extras */}
                {p.extras.length > 0 && (
                  <div style={{ marginBottom:0 }}>
                    {p.extras.map((e,j) => (
                      <div key={j} style={{ display:'flex', gap:8, alignItems:'flex-start', background:`${p.color}08`, borderRadius:10, padding:'8px 11px', marginBottom: j<p.extras.length-1?6:0, border:`1px solid ${p.color}20` }}>
                        <span style={{ color:p.color, fontSize:12, lineHeight:1.5 }}>✨ {e}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <Link href="/inscription" style={{
                  display:'block', textAlign:'center', marginTop:14,
                  padding:'13px', background:p.gradient, color:'white',
                  borderRadius:50, fontWeight:800, fontSize:14, textDecoration:'none',
                  boxShadow:`0 5px 18px ${p.color}45`, letterSpacing:-.1
                }}>
                  Commencer avec {p.name} →
                </Link>
              </div>
            </div>
          )
        })}

        {/* ── NOTES ── */}
        <div style={{ background:'white', borderRadius:18, padding:'16px 18px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:13, margin:'0 0 10px' }}>ℹ️ Bon à savoir</p>
          {[
            '🎁 1 mois d\'essai gratuit pour tout nouveau compte',
            '🏛️ Structures publiques : accès gratuit après validation KYC',
            '📦 Kits retirables en pharmacie partenaire via QR code',
            '🔄 Résiliation à tout moment, sans frais',
            '⚠️ Sans abonnement : accès aux urgences uniquement',
          ].map((n,i) => (
            <p key={i} style={{ color:'#6b7280', fontSize:12, margin:'0 0 5px', lineHeight:1.5 }}>{n}</p>
          ))}
        </div>

        {/* ── PRO CTA ── */}
        <div style={{ background:'linear-gradient(135deg,#071c14,#0d4a3a)', borderRadius:18, padding:'20px', textAlign:'center' }}>
          <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 5px' }}>Vous êtes professionnel de santé ?</p>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, margin:'0 0 14px' }}>Cliniques, pharmacies, ONG, assurances — rejoignez la plateforme</p>
          <Link href="/auth/register-pro" style={{ display:'inline-block', background:'white', color:'#0d4a3a', borderRadius:50, padding:'11px 28px', fontWeight:700, fontSize:13, textDecoration:'none' }}>
            Inscription professionnelle →
          </Link>
        </div>
      </div>
    </div>
  )
}
