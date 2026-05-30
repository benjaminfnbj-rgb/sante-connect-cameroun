'use client'
import { useState } from 'react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'basic',
    name: 'Basique',
    price_month: 1000,
    price_year: 10000,
    color: '#0d4a3a',
    gradient: 'linear-gradient(135deg,#0a2e22,#0d4a3a)',
    bg: '#e8f5ee',
    border: '#86efac',
    icon: '🌿',
    badge: null,
    aiQuota: '5 questions/mois',
    kit: '🎁 Préservatifs',
    features: [
      '👨‍⚕️ Annuaire médecins vérifiés (WhatsApp)',
      '💊 Géolocalisation pharmacies de garde',
      '🏥 Carte hôpitaux (pyramide MINSANTÉ)',
      '📅 Prise de rendez-vous en ligne',
      '🤖 Assistant IA Santé (5 questions/mois)',
      '🌸 Suivi cycle menstruel',
      '🚨 Numéros d\'urgence 24h/24',
    ],
    kitDetail: ['🎁 Préservatifs inclus — Prévention VIH/IST'],
    extras: [],
  },
  {
    id: 'intermediate',
    name: 'Intermédiaire',
    price_month: 1500,
    price_year: 15000,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg,#5b21b6,#7c3aed)',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: '💜',
    badge: 'Populaire',
    aiQuota: '10 questions/mois',
    kit: '🌸 Serviettes + Préservatifs',
    features: [
      '👨‍⚕️ Annuaire médecins vérifiés (WhatsApp)',
      '💊 Géolocalisation pharmacies de garde',
      '🏥 Carte hôpitaux (pyramide MINSANTÉ)',
      '📅 Prise de rendez-vous en ligne',
      '🤖 Assistant IA Santé (10 questions/mois)',
      '🌸 Suivi cycle menstruel',
      '🚨 Numéros d\'urgence 24h/24',
    ],
    kitDetail: [
      '🌸 Serviettes hygiéniques — Hygiène menstruelle',
      '🎁 Préservatifs inclus — Prévention VIH/IST',
    ],
    extras: [],
  },
  {
    id: 'max',
    name: 'Max',
    price_month: 2000,
    price_year: 20000,
    color: '#b45309',
    gradient: 'linear-gradient(135deg,#92400e,#d97706)',
    bg: '#fffbeb',
    border: '#fde68a',
    icon: '⭐',
    badge: 'Recommandé',
    aiQuota: '15 questions/mois',
    kit: '🌸 Serviettes + Préservatifs',
    features: [
      '👨‍⚕️ Annuaire médecins vérifiés (WhatsApp)',
      '💊 Géolocalisation pharmacies de garde',
      '🏥 Carte hôpitaux (pyramide MINSANTÉ)',
      '📅 Prise de rendez-vous en ligne',
      '🤖 Assistant IA Santé (15 questions/mois)',
      '🌸 Suivi cycle menstruel',
      '🚨 Numéros d\'urgence 24h/24',
    ],
    kitDetail: [
      '🌸 Serviettes hygiéniques',
      '🎁 Préservatifs inclus',
    ],
    extras: ['🛡️ Espace Assurances — Santé, Vie, Maladie'],
  },
  {
    id: 'family',
    name: 'Famille',
    price_month: 3000,
    price_year: 30000,
    color: '#be185d',
    gradient: 'linear-gradient(135deg,#9d174d,#ec4899)',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    icon: '👨‍👩‍👧‍👦',
    badge: 'Complet',
    aiQuota: '30 questions/mois',
    kit: '🌸 Serviettes + Préservatifs',
    features: [
      '👨‍⚕️ Annuaire médecins vérifiés (WhatsApp)',
      '💊 Géolocalisation pharmacies de garde',
      '🏥 Carte hôpitaux (pyramide MINSANTÉ)',
      '📅 Prise de rendez-vous en ligne',
      '🤖 Assistant IA Santé (30 questions/mois)',
      '🌸 Suivi cycle menstruel',
      '🚨 Numéros d\'urgence 24h/24',
    ],
    kitDetail: [
      '🌸 Serviettes hygiéniques',
      '🎁 Préservatifs inclus',
    ],
    extras: [
      '🛡️ Espace Assurances — Santé, Vie, Maladie',
      '💉 Calendrier Vaccinal Intelligent — Alertes BCG, DTC, VPO, ROR...',
    ],
  },
  {
    id: 'pregnancy',
    name: 'Suivi Grossesse',
    price_month: 2500,
    price_year: 25000,
    color: '#0891b2',
    gradient: 'linear-gradient(135deg,#075985,#0891b2)',
    bg: '#e0f2fe',
    border: '#bae6fd',
    icon: '🤰',
    badge: 'Exclusif',
    aiQuota: '30 questions/mois',
    kit: '🌸 Kit Maternité',
    features: [
      '👨‍⚕️ Annuaire gynécologues & sages-femmes',
      '💊 Pharmacie (vitamines prénatales)',
      '🏥 Cartographie maternités partenaires',
      '📅 Consultation gynécologue en ligne',
      '🤖 Assistant IA Santé (30 questions/mois)',
      '🌸 Suivi cycle menstruel',
      '🚨 Numéros d\'urgence 24h/24',
    ],
    kitDetail: ['🌸 Serviettes hygiéniques post-partum'],
    extras: [
      '🤰 Guide grossesse complet — 7 CPN + CPON officiel MINSANTÉ',
      '💉 Calendrier vaccins prénataux — VAT, TPI-SP...',
      '🥗 Conseils nutrition, signes de danger',
      '🤱 Guide allaitement maternel complet',
      '🛡️ Espace Assurances Maternité',
    ],
  },
]

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .plan-card { transition: transform .2s, box-shadow .2s; }
        .plan-card:hover { transform: translateY(-3px); }
      `}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(160deg,#0a2e22,#0d4a3a)', padding:'40px 20px 50px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }}/>
        <div style={{ position:'absolute', bottom:-30, left:-30, width:150, height:150, borderRadius:'50%', background:'rgba(46,184,122,0.06)' }}/>
        <Link href="/" style={{ position:'absolute', top:16, left:16, color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:12 }}>← Accueil</Link>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>💎</div>
          <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:24, fontWeight:700, margin:'0 0 6px' }}>Nos Forfaits</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:'0 0 24px', lineHeight:1.6 }}>
            Choisissez votre accès à la santé numérique.<br/>1 mois d&apos;essai gratuit · Sans engagement
          </p>

          {/* Toggle mensuel / annuel */}
          <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.1)', borderRadius:50, padding:4, gap:4 }}>
            {[false, true].map(isAnnual => (
              <button key={String(isAnnual)} onClick={() => setAnnual(isAnnual)} style={{
                padding:'9px 20px', borderRadius:50, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                background: annual === isAnnual ? 'white' : 'transparent',
                color: annual === isAnnual ? '#0d4a3a' : 'rgba(255,255,255,0.65)',
                transition:'all .2s',
              }}>
                {isAnnual ? '📅 Annuel (2 mois offerts)' : '📆 Mensuel'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PLANS */}
      <div style={{ maxWidth:520, margin:'-20px auto 0', padding:'0 14px 40px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {PLANS.map((plan, i) => {
            const price = annual ? plan.price_year : plan.price_month
            const saving = annual ? plan.price_month * 2 : 0
            return (
              <div key={plan.id} className="plan-card" style={{
                background:'white', borderRadius:22, overflow:'hidden',
                boxShadow:'0 4px 20px rgba(0,0,0,0.08)',
                border:`1.5px solid ${plan.border}`,
                animation:`fadeUp ${.15 + i*.07}s ease`,
              }}>
                {/* En-tête coloré */}
                <div style={{ background: plan.gradient, padding:'18px 20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:28 }}>{plan.icon}</span>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                          <span style={{ color:'white', fontWeight:800, fontSize:17 }}>Forfait {plan.name}</span>
                          {plan.badge && (
                            <span style={{ background:'rgba(255,255,255,0.22)', color:'white', borderRadius:20, padding:'2px 10px', fontSize:10, fontWeight:700 }}>
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ color:'rgba(255,255,255,0.65)', fontSize:11 }}>
                          {annual ? '10 mois payés · 2 offerts' : 'Sans engagement · Résiliable'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:'white', fontWeight:900, fontSize:24, lineHeight:1 }}>
                        {price.toLocaleString()}
                      </div>
                      <div style={{ color:'rgba(255,255,255,0.7)', fontSize:11 }}>
                        FCFA/{annual ? 'an' : 'mois'}
                      </div>
                      {annual && (
                        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, textDecoration:'line-through', marginTop:1 }}>
                          {(plan.price_month * 12).toLocaleString()} F
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ padding:'16px 18px' }}>
                  {/* Services inclus */}
                  <p style={{ color:'#9ca3af', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, margin:'0 0 10px' }}>Services inclus</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                        <span style={{ color:'#16a34a', fontSize:13, flexShrink:0, marginTop:1 }}>✓</span>
                        <span style={{ color:'#374151', fontSize:12, lineHeight:1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kit physique */}
                  <div style={{ background:plan.bg, borderRadius:12, padding:'10px 12px', marginBottom:plan.extras.length > 0 ? 10 : 14, border:`1px solid ${plan.border}` }}>
                    <p style={{ color:plan.color, fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.7, margin:'0 0 6px' }}>
                      📦 Kit mensuel — Retrait en pharmacie partenaire
                    </p>
                    {plan.kitDetail.map((k, j) => (
                      <div key={j} style={{ color:plan.color, fontSize:12, marginBottom: j < plan.kitDetail.length-1 ? 3 : 0 }}>{k}</div>
                    ))}
                  </div>

                  {/* Extras exclusifs */}
                  {plan.extras.length > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <p style={{ color:'#9ca3af', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:.8, margin:'0 0 8px' }}>✨ Accès exclusifs</p>
                      {plan.extras.map((e, j) => (
                        <div key={j} style={{
                          display:'flex', alignItems:'flex-start', gap:8, marginBottom: j < plan.extras.length-1 ? 6 : 0,
                          background:`${plan.color}10`, borderRadius:10, padding:'8px 10px', border:`1px solid ${plan.color}25`,
                        }}>
                          <span style={{ color:plan.color, fontSize:12, lineHeight:1.5 }}>{e}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <Link href="/inscription" style={{
                    display:'block', textAlign:'center', padding:'13px',
                    background: plan.gradient, color:'white', borderRadius:50,
                    fontWeight:700, fontSize:14, textDecoration:'none',
                    boxShadow:`0 4px 14px ${plan.color}40`,
                  }}>
                    Choisir le Forfait {plan.name} →
                  </Link>

                  {annual && saving > 0 && (
                    <p style={{ textAlign:'center', color:'#16a34a', fontSize:11, margin:'6px 0 0', fontWeight:600 }}>
                      🎉 Économisez {saving.toLocaleString()} FCFA/an
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Notes bas de page */}
        <div style={{ background:'white', borderRadius:18, padding:'16px 18px', marginTop:14, boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:13, margin:'0 0 10px' }}>ℹ️ Informations importantes</p>
          {[
            '🎁 1 mois d\'essai gratuit pour tout nouveau compte',
            '🏛️ Structures sanitaires publiques : accès GRATUIT après validation KYC',
            '📦 Kits physiques retirables via QR code en pharmacie partenaire',
            '🔄 Résiliation possible à tout moment sans frais',
            '⚠️ Sans abonnement : accès uniquement aux numéros d\'urgence',
          ].map((note, i) => (
            <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:13, flexShrink:0 }}></span>
              <p style={{ color:'#555', fontSize:12, margin:0, lineHeight:1.5 }}>{note}</p>
            </div>
          ))}
        </div>

        {/* CTA pro */}
        <div style={{ background:'linear-gradient(135deg,#0a2e22,#0d4a3a)', borderRadius:18, padding:'20px', marginTop:14, textAlign:'center' }}>
          <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 6px' }}>Vous êtes un professionnel de santé ?</p>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:12, margin:'0 0 14px', lineHeight:1.5 }}>
            Cliniques, pharmacies, médecins, ONG, assurances — rejoignez la plateforme avec un abonnement professionnel.
          </p>
          <Link href="/auth/register-pro" style={{ display:'inline-block', background:'white', color:'#0d4a3a', borderRadius:50, padding:'11px 28px', fontWeight:700, fontSize:13, textDecoration:'none' }}>
            Inscription professionnelle →
          </Link>
        </div>
      </div>
    </div>
  )
}
