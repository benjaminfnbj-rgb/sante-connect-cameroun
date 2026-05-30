// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'

const PYRAMID = [
  { cat:1, short:'HG / CHU', label:'Hôpitaux Généraux & CHU', level:'Stratégique', color:'#dc2626', bg:'#fef2f2', icon:'🏛️', width:'55%',
    desc:'Soins ultra-spécialisés, enseignement universitaire, recherche clinique.' },
  { cat:2, short:'HC', label:'Hôpitaux Centraux', level:'Stratégique', color:'#ea580c', bg:'#fff7ed', icon:'🏥', width:'65%',
    desc:'Référence nationale disciplinaire. Plateaux techniques avancés.' },
  { cat:3, short:'HR / CHR', label:'Hôpitaux Régionaux', level:'Intermédiaire', color:'#d97706', bg:'#fffbeb', icon:'🏦', width:'75%',
    desc:'Soins spécialisés, chirurgie complexe, imagerie médicale.' },
  { cat:4, short:'HD', label:'Hôpitaux de District', level:'Opérationnel', color:'#16a34a', bg:'#f0fdf4', icon:'🏨', width:'85%',
    desc:'Chirurgie générale, maternité, laboratoire de base.' },
  { cat:5, short:'CMA', label:'Centres Médicaux d\'Arrond.', level:'Opérationnel', color:'#0891b2', bg:'#e0f2fe', icon:'🏪', width:'92%',
    desc:'Chirurgie légère, consultations spécialisées simples.' },
  { cat:6, short:'CSI / Cliniques', label:'Centres de Santé Intégrés', level:'Périphérique', color:'#7c3aed', bg:'#f5f3ff', icon:'🏠', width:'100%',
    desc:'Premier recours. Soins préventifs, consultations curatives de base.' },
]

export default function StructuresPage() {
  const [open, setOpen] = useState<number|null>(null)

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif', paddingBottom:40 }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#0a2e22,#0d4a3a)', padding:'20px 16px 28px', textAlign:'center', position:'relative' }}>
        <Link href="/dashboard" style={{ position:'absolute', top:16, left:16, color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13 }}>← Retour</Link>
        <div style={{ fontSize:28, marginBottom:6 }}>🏥</div>
        <h1 style={{ color:'white', fontSize:19, fontWeight:800, margin:'0 0 3px' }}>Pyramide Sanitaire</h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, margin:0 }}>6 niveaux — Protocole officiel MINSANTÉ Cameroun</p>
      </div>

      <div style={{ maxWidth:500, margin:'0 auto', padding:'16px 14px' }}>

        {/* Info rapide */}
        <div style={{ background:'white', borderRadius:14, padding:'12px 14px', marginBottom:16, boxShadow:'0 1px 6px rgba(0,0,0,0.05)', display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:20 }}>ℹ️</span>
          <p style={{ color:'#555', fontSize:12, margin:0, lineHeight:1.5 }}>Appuyez sur un niveau pour voir sa description. Les patients sont orientés du bas vers le haut selon la complexité des soins.</p>
        </div>

        {/* Pyramide visuelle compacte */}
        <div style={{ background:'white', borderRadius:18, padding:'20px 16px', boxShadow:'0 3px 16px rgba(0,0,0,0.07)', marginBottom:16 }}>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:12, textAlign:'center', margin:'0 0 14px', textTransform:'uppercase', letterSpacing:.7 }}>▲ Référence · Soins complexes en haut</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
            {PYRAMID.map((p, i) => (
              <button key={p.cat} onClick={() => setOpen(open===p.cat?null:p.cat)} style={{
                width: p.width, minWidth:0,
                padding:'10px 14px', borderRadius:12,
                background: open===p.cat ? p.color : p.bg,
                border:`1.5px solid ${p.color}40`,
                cursor:'pointer', textAlign:'center',
                transition:'all .2s',
                boxShadow: open===p.cat ? `0 4px 14px ${p.color}35` : 'none',
              }}>
                <div style={{ color: open===p.cat ? 'white' : p.color, fontWeight:700, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {p.icon} Cat.{p.cat} — {p.short}
                </div>
                <div style={{ color: open===p.cat ? 'rgba(255,255,255,0.75)' : '#888', fontSize:10, marginTop:1 }}>{p.level}</div>
                {open===p.cat && (
                  <div style={{ color:'rgba(255,255,255,0.9)', fontSize:11, marginTop:6, lineHeight:1.5, fontWeight:400 }}>
                    {p.label}<br/>{p.desc}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p style={{ color:'#0d4a3a', fontWeight:700, fontSize:12, textAlign:'center', margin:'14px 0 0', textTransform:'uppercase', letterSpacing:.7 }}>▼ Soins de base · Premier recours en bas</p>
        </div>

        {/* Tableau récap compact */}
        <div style={{ background:'white', borderRadius:18, overflow:'hidden', boxShadow:'0 3px 16px rgba(0,0,0,0.07)', marginBottom:16 }}>
          <div style={{ background:'#0d4a3a', padding:'10px 16px' }}>
            <p style={{ color:'white', fontWeight:700, fontSize:13, margin:0 }}>📋 Tableau de référence rapide</p>
          </div>
          {PYRAMID.map((p, i) => (
            <div key={p.cat} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', background:i%2===0?'white':'#fafafa', borderTop:'1px solid #f0f0f0' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:p.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, border:`1px solid ${p.color}30` }}>{p.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:p.color, fontSize:12 }}>Cat.{p.cat} — {p.label}</div>
                <div style={{ color:'#888', fontSize:10, marginTop:1 }}>{p.short} · {p.level}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Règle d'orientation */}
        <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:16, padding:'14px 16px', border:'1px solid #fde68a', marginBottom:16 }}>
          <p style={{ color:'#92400e', fontWeight:700, fontSize:13, margin:'0 0 8px' }}>🔄 Règle d'orientation</p>
          {[
            '🩺 Commencez toujours par le niveau le plus bas disponible',
            '📋 Un médecin vous délivre une lettre de référence pour monter de niveau',
            '🚨 Urgence vitale → aller directement au niveau disponible le plus proche',
            '🆓 Les structures publiques sont gratuites ou à tarif social',
          ].map((r,i) => (
            <div key={i} style={{ color:'#78350f', fontSize:11, marginBottom:4, lineHeight:1.5 }}>{r}</div>
          ))}
        </div>

        {/* CTA trouver structure */}
        <div style={{ background:'linear-gradient(135deg,#0a2e22,#0d4a3a)', borderRadius:16, padding:'18px', textAlign:'center' }}>
          <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 6px' }}>Trouver une structure près de vous</p>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, margin:'0 0 14px' }}>Cliniques, hôpitaux et centres de santé vérifiés</p>
          <Link href="/professionnels" style={{ display:'inline-block', background:'white', color:'#0d4a3a', borderRadius:50, padding:'10px 24px', fontWeight:700, fontSize:13, textDecoration:'none' }}>
            Voir les structures →
          </Link>
        </div>
      </div>
    </div>
  )
}
