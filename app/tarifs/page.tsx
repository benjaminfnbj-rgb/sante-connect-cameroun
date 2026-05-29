'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'basic',
    name: 'Basique',
    price: 1000,
    color: '#0d4a3a',
    bg: '#e8f5ee',
    gradient: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)',
    icon: '🌿',
    badge: null,
    services: [
      { icon:'👨‍⚕️', label:'Annuaire médecins vérifié', desc:'Redirection WhatsApp directe' },
      { icon:'💊', label:'Géolocalisation pharmacies de garde', desc:'Ouvertes 24h/24' },
      { icon:'🏥', label:'Cartographie hôpitaux', desc:'Pyramide MINSANTÉ officielle' },
      { icon:'🤖', label:'Assistant IA Santé', desc:'Conseils & orientation' },
      { icon:'📅', label:'Prise de rendez-vous', desc:'En ligne avec professionnels vérifiés' },
    ],
    kit: [
      { icon:'🎁', label:'Préservatifs', desc:'Inclus mensuellement — Prévention VIH/IST' },
    ],
    extras: [],
    kitLabel: 'Kit Prévention',
    kitColor: '#0d4a3a',
  },
  {
    id: 'intermediate',
    name: 'Intermédiaire',
    price: 1500,
    color: '#7c3aed',
    bg: '#f5f3ff',
    gradient: 'linear-gradient(135deg,#7c3aed,#a855f7)',
    icon: '💜',
    badge: 'Populaire',
    services: [
      { icon:'👨‍⚕️', label:'Annuaire médecins vérifié', desc:'Redirection WhatsApp directe' },
      { icon:'💊', label:'Géolocalisation pharmacies de garde', desc:'Ouvertes 24h/24' },
      { icon:'🏥', label:'Cartographie hôpitaux', desc:'Pyramide MINSANTÉ officielle' },
      { icon:'🤖', label:'Assistant IA Santé', desc:'Conseils & orientation' },
      { icon:'📅', label:'Prise de rendez-vous', desc:'En ligne avec professionnels vérifiés' },
    ],
    kit: [
      { icon:'🌸', label:'Serviettes hygiéniques', desc:'Lutte contre la précarité menstruelle' },
      { icon:'🎁', label:'Préservatifs', desc:'Prévention VIH/IST' },
    ],
    extras: [],
    kitLabel: 'Kit Confort & Hygiène',
    kitColor: '#7c3aed',
  },
  {
    id: 'max',
    name: 'Max',
    price: 2000,
    color: '#b45309',
    bg: '#fffbeb',
    gradient: 'linear-gradient(135deg,#b45309,#f59e0b)',
    icon: '⭐',
    badge: 'Recommandé',
    services: [
      { icon:'👨‍⚕️', label:'Annuaire médecins vérifié', desc:'Redirection WhatsApp directe' },
      { icon:'💊', label:'Géolocalisation pharmacies de garde', desc:'Ouvertes 24h/24' },
      { icon:'🏥', label:'Cartographie hôpitaux', desc:'Pyramide MINSANTÉ officielle' },
      { icon:'🤖', label:'Assistant IA Santé', desc:'Conseils & orientation' },
      { icon:'📅', label:'Prise de rendez-vous', desc:'En ligne avec professionnels vérifiés' },
    ],
    kit: [
      { icon:'🌸', label:'Serviettes hygiéniques', desc:'Lutte contre la précarité menstruelle' },
      { icon:'🎁', label:'Préservatifs', desc:'Prévention VIH/IST' },
    ],
    extras: [
      { icon:'🛡️', label:'Espace Assurances', desc:'Devis & souscriptions — Santé, Vie, Maladie' },
    ],
    kitLabel: 'Kit Confort & Hygiène',
    kitColor: '#b45309',
  },
  {
    id: 'family',
    name: 'Famille / Maternité',
    price: 2500,
    color: '#be185d',
    bg: '#fdf2f8',
    gradient: 'linear-gradient(135deg,#be185d,#ec4899)',
    icon: '👨‍👩‍👧‍👦',
    badge: 'Complet',
    services: [
      { icon:'👨‍⚕️', label:'Annuaire médecins vérifié', desc:'Redirection WhatsApp directe' },
      { icon:'💊', label:'Géolocalisation pharmacies de garde', desc:'Ouvertes 24h/24' },
      { icon:'🏥', label:'Cartographie hôpitaux', desc:'Pyramide MINSANTÉ officielle' },
      { icon:'🤖', label:'Assistant IA Santé', desc:'Conseils & orientation' },
      { icon:'📅', label:'Prise de rendez-vous', desc:'En ligne avec professionnels vérifiés' },
    ],
    kit: [
      { icon:'🌸', label:'Serviettes hygiéniques', desc:'Lutte contre la précarité menstruelle' },
      { icon:'🎁', label:'Préservatifs', desc:'Prévention VIH/IST' },
    ],
    extras: [
      { icon:'🛡️', label:'Espace Assurances', desc:'Devis & souscriptions — Santé, Vie, Maladie' },
      { icon:'💉', label:'Calendrier Vaccinal Intelligent', desc:'Alertes BCG, DTC, VPO, ROR... selon âge de l\'enfant' },
    ],
    kitLabel: 'Kit Complet Famille',
    kitColor: '#be185d',
  },
]

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const getPrice = (p: number) => annual ? Math.round(p * 10) : p
  const getSaving = (p: number) => Math.round(p * 2)

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
        .plan-card:hover { transform: translateY(-4px); }
        .plan-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0a2e22,#0d4a3a)', padding:'48px 20px 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />
        <div style={{ position:'absolute', bottom:-30, left:-30, width:150, height:150, borderRadius:'50%', background:'rgba(46,184,122,0.06)' }} />
        <Link href="/dashboard" style={{ position:'absolute', top:16, left:16, color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13 }}>← Retour</Link>
        <div style={{ maxWidth:500, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>💎</div>
          <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:24, fontWeight:700, margin:'0 0 8px' }}>
            Nos Forfaits
          </h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14, margin:'0 0 24px', lineHeight:1.6 }}>
            Choisissez votre accès à la santé numérique au Cameroun.<br/>
            1 mois d&apos;essai gratuit · Sans engagement
          </p>

          {/* Toggle mensuel/annuel */}
          <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.1)', borderRadius:50, padding:4, gap:4 }}>
            {[false, true].map(isAnnual => (
              <button key={String(isAnnual)} onClick={() => setAnnual(isAnnual)} style={{
                padding:'8px 20px', borderRadius:50, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                background: annual === isAnnual ? 'white' : 'transparent',
                color: annual === isAnnual ? '#0d4a3a' : 'rgba(255,255,255,0.7)',
                transition:'all 0.2s',
              }}>
                {isAnnual ? '📅 Annuel (−2 mois offerts)' : '📆 Mensuel'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille forfaits */}
      <div style={{ maxWidth:600, margin:'-20px auto 0', padding:'0 16px 40px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {PLANS.map((plan, i) => (
            <div key={plan.id} className="plan-card" style={{
              background:'white', borderRadius:24, overflow:'hidden',
              boxShadow: selected === plan.id ? `0 8px 32px rgba(0,0,0,0.12), 0 0 0 3px ${plan.color}` : '0 4px 20px rgba(0,0,0,0.07)',
              border: selected === plan.id ? `2px solid ${plan.color}` : '2px solid transparent',
              animation:`fadeUp ${0.2 + i * 0.08}s ease`,
              cursor:'pointer',
            }} onClick={() => setSelected(selected === plan.id ? null : plan.id)}>

              {/* En-tête du plan */}
              <div style={{ background: plan.gradient, padding:'20px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:26 }}>{plan.icon}</span>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <h2 style={{ color:'white', fontSize:16, fontWeight:700, margin:0, fontFamily:'Georgia,serif' }}>
                          Forfait {plan.name}
                        </h2>
                        {plan.badge && (
                          <span style={{ background:'rgba(255,255,255,0.25)', color:'white', borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:700 }}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ color:'rgba(255,255,255,0.75)', fontSize:11, marginTop:2 }}>
                        {annual ? '10 mois payés pour 12' : 'Sans engagement · Résiliable à tout moment'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:'white', fontWeight:800, fontSize:22, lineHeight:1 }}>
                      {getPrice(plan.price).toLocaleString()}
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.8)', fontSize:11 }}>
                      FCFA/{annual ? 'an' : 'mois'}
                    </div>
                    {annual && (
                      <div style={{ color:'rgba(255,255,255,0.6)', fontSize:10, textDecoration:'line-through' }}>
                        {(plan.price * 12).toLocaleString()} FCFA
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenu détaillé */}
              <div style={{ padding:'18px 22px' }}>

                {/* Services de base */}
                <div style={{ marginBottom:14 }}>
                  <p style={{ color:'#888', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, margin:'0 0 10px' }}>Services inclus</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {plan.services.map((s, j) => (
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:30, height:30, borderRadius:10, background:plan.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>
                          {s.icon}
                        </div>
                        <div>
                          <div style={{ color:'#1a2e26', fontSize:13, fontWeight:600 }}>{s.label}</div>
                          <div style={{ color:'#aaa', fontSize:11 }}>{s.desc}</div>
                        </div>
                        <span style={{ marginLeft:'auto', color:'#16a34a', fontSize:16 }}>✓</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kit physique */}
                <div style={{ background:plan.bg, borderRadius:14, padding:'12px 14px', marginBottom:plan.extras.length > 0 ? 12 : 16 }}>
                  <p style={{ color:plan.color, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, margin:'0 0 8px' }}>
                    📦 {plan.kitLabel} — Retrait en pharmacie partenaire
                  </p>
                  {plan.kit.map((k, j) => (
                    <div key={j} style={{ display:'flex', alignItems:'center', gap:8, marginBottom: j < plan.kit.length-1 ? 6 : 0 }}>
                      <span style={{ fontSize:16 }}>{k.icon}</span>
                      <div>
                        <div style={{ color:plan.color, fontSize:12, fontWeight:700 }}>{k.label}</div>
                        <div style={{ color:'#888', fontSize:11 }}>{k.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extras exclusifs */}
                {plan.extras.length > 0 && (
                  <div style={{ borderTop:'1px dashed #e5e7eb', paddingTop:12, marginBottom:16 }}>
                    <p style={{ color:'#888', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, margin:'0 0 10px' }}>
                      ✨ Accès exclusifs
                    </p>
                    {plan.extras.map((e, j) => (
                      <div key={j} style={{
                        display:'flex', alignItems:'center', gap:10, marginBottom: j < plan.extras.length-1 ? 8 : 0,
                        background:'linear-gradient(90deg,rgba(255,215,0,0.08),transparent)',
                        borderRadius:12, padding:'8px 10px', border:`1px solid ${plan.color}30`,
                      }}>
                        <div style={{ width:32, height:32, borderRadius:10, background: plan.color + '15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                          {e.icon}
                        </div>
                        <div>
                          <div style={{ color:plan.color, fontSize:13, fontWeight:700 }}>{e.label}</div>
                          <div style={{ color:'#888', fontSize:11 }}>{e.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <Link href="/inscription" className="plan-btn" style={{
                  display:'block', textAlign:'center', padding:'13px',
                  background: plan.gradient, color:'white', borderRadius:50,
                  fontWeight:700, fontSize:14, textDecoration:'none',
                  boxShadow:`0 4px 16px ${plan.color}40`,
                }}>
                  Choisir le Forfait {plan.name} →
                </Link>

                {annual && (
                  <p style={{ textAlign:'center', color:'#16a34a', fontSize:11, marginTop:6 }}>
                    🎉 Économisez {getSaving(plan.price).toLocaleString()} FCFA/an
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Note bas de page */}
        <div style={{ background:'white', borderRadius:20, padding:'18px 20px', marginTop:16, boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:13, margin:'0 0 10px' }}>ℹ️ Informations importantes</p>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {[
              '🎁 1 mois d\'essai gratuit pour tout nouveau compte',
              '🏛️ Les structures sanitaires publiques ont un accès GRATUIT après validation KYC',
              '📦 Retrait des kits physiques via QR code en pharmacie partenaire',
              '🔄 Résiliation possible à tout moment sans frais',
              '👨‍⚕️ Tous les abonnés accèdent aux professionnels de santé vérifiés',
            ].map((note, i) => (
              <p key={i} style={{ color:'#555', fontSize:12, margin:0, lineHeight:1.5 }}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
