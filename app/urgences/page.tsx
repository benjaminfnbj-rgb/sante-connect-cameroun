// @ts-nocheck
'use client'
import { useState } from 'react'

const NATIONALS = [
  { num: '117', label: 'Police Secours', icon: '🚔', color: '#1d4ed8', desc: 'Agression, vol, trouble à l\'ordre public' },
  { num: '118', label: 'Sapeurs-Pompiers', icon: '🚒', color: '#dc2626', desc: 'Incendies, accidents graves, noyades, secours à victimes' },
  { num: '113', label: 'Gendarmerie Nationale', icon: '⚖️', color: '#4f46e5', desc: 'Urgences hors villes, axes routiers, zones rurales' },
  { num: '112', label: 'Urgence Universelle', icon: '📞', color: '#0d4a3a', desc: 'Accessible depuis tout mobile, même sans carte SIM' },
  { num: '119', label: 'SAMU / Urgences Médicales', icon: '🚑', color: '#b91c1c', desc: 'Détresses médicales graves, ambulance' },
  { num: '1510', label: 'Numéro Vert Santé', icon: '💬', color: '#0891b2', desc: 'Signaler maladies suspectes, infos sanitaires, épidémies' },
]

const LOCALS = [
  { city: 'Yaoundé', nums: [
    { label: 'CHU de Yaoundé — Urgences', num: '+237 222 23 40 40', icon: '🏥' },
    { label: 'Hôpital Central de Yaoundé', num: '+237 222 22 06 05', icon: '🏥' },
    { label: 'Hôpital Général de Yaoundé', num: '+237 222 23 28 01', icon: '🏥' },
    { label: 'Centre Pasteur du Cameroun', num: '+237 222 23 12 22', icon: '🔬' },
    { label: 'Pompiers Yaoundé', num: '+237 222 22 31 32', icon: '🚒' },
  ]},
  { city: 'Douala', nums: [
    { label: 'SAMU Douala', num: '+237 233 40 32 32', icon: '🚑' },
    { label: 'Hôpital Général de Douala', num: '+237 233 40 24 42', icon: '🏥' },
    { label: 'Hôpital Laquintinie', num: '+237 233 42 73 01', icon: '🏥' },
    { label: 'Pompiers Douala', num: '+237 233 42 37 33', icon: '🚒' },
  ]},
  { city: 'Autres villes', nums: [
    { label: 'Hôpital Régional de Bafoussam', num: '+237 233 44 13 21', icon: '🏥' },
    { label: 'Hôpital Régional de Bamenda', num: '+237 233 36 11 55', icon: '🏥' },
    { label: 'Hôpital Régional de Garoua', num: '+237 222 27 12 34', icon: '🏥' },
    { label: 'Hôpital Régional de Maroua', num: '+237 222 29 22 01', icon: '🏥' },
    { label: 'Hôpital Régional de Bertoua', num: '+237 222 24 13 32', icon: '🏥' },
    { label: 'Hôpital Régional de Buea', num: '+237 233 32 25 15', icon: '🏥' },
    { label: 'Hôpital Régional d\'Ebolowa', num: '+237 222 28 14 06', icon: '🏥' },
    { label: 'Hôpital Régional de Ngaoundéré', num: '+237 222 25 11 44', icon: '🏥' },
    { label: 'Croix Rouge Cameroun', num: '+237 222 22 09 71', icon: '❤️' },
  ]},
]

const TIPS = [
  'Gardez votre calme et parlez clairement',
  'Donnez votre localisation exacte (ville, quartier, carrefour, point de repère)',
  'Précisez la nature du problème (incendie, accident, malaise, agression)',
  'Indiquez le nombre de personnes en danger ou blessées',
  'Ne raccrochez pas avant que l\'opérateur ne vous le demande',
]

export default function UrgencesPage() {
  const [tab, setTab] = useState('national')

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f0', fontFamily:'sans-serif' }}>
      {/* Hero rouge */}
      <div style={{ background:'linear-gradient(160deg,#7f1d1d,#dc2626)', padding:'0 0 56px', textAlign:'center' }}>
        {/* Navbar mini */}
        <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:600, margin:'0 auto' }}>
          <a href="/" style={{ color:'rgba(255,255,255,0.7)', fontSize:14, textDecoration:'none' }}>← Accueil</a>
          <span style={{ color:'white', fontWeight:700, fontSize:14 }}>🏥 Santé Connect</span>
        </div>
        <div style={{ padding:'20px 20px 0' }}>
          <div style={{ fontSize:52, marginBottom:10 }}>🚨</div>
          <h1 style={{ color:'white', fontSize:26, fontFamily:'Georgia,serif', fontWeight:700, margin:'0 0 6px' }}>
            Numéros d&apos;Urgence
          </h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, margin:'0 0 20px' }}>
            Cameroun — Disponibles 24h/24 · 7j/7 · Appels gratuits
          </p>
          {/* 4 numéros critiques en gros */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, maxWidth:380, margin:'0 auto' }}>
            {[
              { num:'117', label:'Police', icon:'🚔' },
              { num:'118', label:'Pompiers', icon:'🚒' },
              { num:'119', label:'SAMU', icon:'🚑' },
              { num:'113', label:'Gendarmerie', icon:'⚖️' },
              { num:'112', label:'Universel', icon:'📞' },
              { num:'1510', label:'Info Santé', icon:'💬' },
            ].map(e => (
              <a key={e.num} href={`tel:${e.num}`} style={{
                background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)',
                border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:14,
                padding:'12px 8px', textDecoration:'none', textAlign:'center',
              }}>
                <div style={{ fontSize:18, marginBottom:2 }}>{e.icon}</div>
                <div style={{ color:'white', fontWeight:800, fontSize:20, lineHeight:1 }}>{e.num}</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:10, marginTop:3 }}>{e.label}</div>
              </a>
            ))}
          </div>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, marginTop:14 }}>
            Accessibles même sans abonnement actif
          </p>
        </div>
      </div>

      <div style={{ maxWidth:600, margin:'-20px auto 0', padding:'0 16px 40px' }}>
        {/* Onglets */}
        <div style={{ background:'white', borderRadius:20, padding:6, display:'flex', gap:4, marginBottom:16, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
          {[['national','🇨🇲 Nationaux'],['local','📍 Locaux'],['tips','💡 Conseils']].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{
              flex:1, padding:'10px 8px', borderRadius:14, border:'none', cursor:'pointer',
              background: tab === v ? '#dc2626' : 'transparent',
              color: tab === v ? 'white' : '#666',
              fontWeight:700, fontSize:13,
            }}>{l}</button>
          ))}
        </div>

        {/* Numéros nationaux */}
        {tab === 'national' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ color:'#888', fontSize:12, margin:'0 0 4px', textAlign:'center' }}>
              Ces numéros sont <strong>gratuits</strong> et valables sur tout le territoire camerounais
            </p>
            {NATIONALS.map(n => (
              <div key={n.num} style={{
                background:'white', borderRadius:18, padding:'16px 18px',
                boxShadow:'0 2px 12px rgba(0,0,0,0.06)',
                border:`1.5px solid ${n.color}20`,
                display:'flex', alignItems:'center', gap:14,
              }}>
                <div style={{ width:52, height:52, borderRadius:15, background:`${n.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                  {n.icon}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:'#0d4a3a', fontSize:15, marginBottom:2 }}>{n.label}</div>
                  <div style={{ color:n.color, fontWeight:800, fontSize:22, fontFamily:'monospace', lineHeight:1 }}>{n.num}</div>
                  <div style={{ color:'#888', fontSize:11, marginTop:4, lineHeight:1.4 }}>{n.desc}</div>
                </div>
                <a href={`tel:${n.num}`} style={{
                  background:n.color, color:'white', borderRadius:12,
                  padding:'10px 14px', textDecoration:'none', fontWeight:700,
                  fontSize:13, flexShrink:0, display:'flex', alignItems:'center', gap:5,
                }}>
                  📞 Appeler
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Numéros locaux */}
        {tab === 'local' && (
          <div>
            {LOCALS.map(section => (
              <div key={section.city} style={{ marginBottom:20 }}>
                <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:15, margin:'0 0 10px', display:'flex', alignItems:'center', gap:6 }}>
                  📍 {section.city}
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {section.nums.map(n => (
                    <div key={n.num} style={{ background:'white', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:12 }}>
                      <span style={{ fontSize:20, flexShrink:0 }}>{n.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, color:'#333', fontSize:13 }}>{n.label}</div>
                        <div style={{ color:'#dc2626', fontWeight:700, fontSize:14, fontFamily:'monospace' }}>{n.num}</div>
                      </div>
                      <a href={`tel:${n.num}`} style={{ background:'#dc2626', color:'white', borderRadius:10, padding:'8px 12px', textDecoration:'none', fontWeight:700, fontSize:12, flexShrink:0 }}>
                        📞
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Conseils */}
        {tab === 'tips' && (
          <div>
            <div style={{ background:'white', borderRadius:20, padding:24, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', marginBottom:16 }}>
              <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:17, margin:'0 0 16px' }}>
                💡 Conseils en cas d&apos;appel d&apos;urgence
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {TIPS.map((tip, i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                    <div style={{ width:26, height:26, background:'#0d4a3a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:12, flexShrink:0, marginTop:1 }}>
                      {i + 1}
                    </div>
                    <p style={{ color:'#444', fontSize:14, lineHeight:1.6, margin:0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:20, padding:20 }}>
              <h4 style={{ color:'#dc2626', fontWeight:700, fontSize:14, margin:'0 0 10px' }}>
                ⚠️ En cas d&apos;urgence vitale
              </h4>
              <p style={{ color:'#7f1d1d', fontSize:13, lineHeight:1.7, margin:'0 0 14px' }}>
                Pour toute détresse médicale grave, composez immédiatement le <strong>119 (SAMU)</strong> ou le <strong>112</strong>. Ces numéros fonctionnent même <strong>sans abonnement téléphonique actif</strong> et sont accessibles partout au Cameroun.
              </p>
              <div style={{ display:'flex', gap:8 }}>
                <a href="tel:119" style={{ flex:1, background:'#dc2626', color:'white', borderRadius:12, padding:'12px', textAlign:'center', textDecoration:'none', fontWeight:800, fontSize:16 }}>
                  119 SAMU
                </a>
                <a href="tel:112" style={{ flex:1, background:'#7f1d1d', color:'white', borderRadius:12, padding:'12px', textAlign:'center', textDecoration:'none', fontWeight:800, fontSize:16 }}>
                  112
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
