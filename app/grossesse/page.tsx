// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Données CPN Cameroun (OMS / MINSANTÉ) ───────────────────────────────────
const CPN_DATA = [
  {
    numero: 'CPN 1',
    semaines: 'S8 – S12',
    trimestre: 1,
    examens: [
      { nom: 'Bilan sanguin complet (NFS)', objectif: 'Détecter une anémie, trouble de coagulation' },
      { nom: 'Groupage sanguin + Rhésus', objectif: 'Identifier incompatibilité rhésus mère/bébé' },
      { nom: 'Sérologie VIH', objectif: 'Prévenir la transmission mère-enfant (PTME)' },
      { nom: 'Sérologie syphilis (TPHA/VDRL)', objectif: 'Dépister syphilis pouvant causer fausse couche ou malformations' },
      { nom: 'Sérologie hépatite B', objectif: 'Protéger le nouveau-né à la naissance' },
      { nom: 'Sérologie rubéole / toxoplasmose', objectif: 'Évaluer immunité et risque fœtal' },
      { nom: 'Glycémie à jeun', objectif: 'Dépistage précoce du diabète gestationnel' },
      { nom: 'ECBU (bactériologie urinaire)', objectif: 'Détecter infection urinaire silencieuse risquant l\'accouchement prématuré' },
      { nom: 'Prise de tension artérielle', objectif: 'Référence de base, dépistage hypertension' },
      { nom: 'Prise du poids', objectif: 'Référence pour suivi de prise de poids gestationnel' },
      { nom: 'Échographie de datation', objectif: 'Confirmer âge gestationnel, vitalité fœtale, nombre d\'embryons' },
    ],
    conseils: 'Commencer l\'acide folique (0,4 mg/j), arrêter alcool/tabac, prendre le carnet de santé.',
  },
  {
    numero: 'CPN 2',
    semaines: 'S16 – S20',
    trimestre: 1,
    examens: [
      { nom: 'Mesure hauteur utérine (HU)', objectif: 'Évaluer croissance fœtale (HU en cm ≈ semaine d\'aménorrhée)' },
      { nom: 'Auscultation bruits du cœur fœtal (BCF)', objectif: 'Confirmer vitalité fœtale' },
      { nom: 'Contrôle tension artérielle + poids', objectif: 'Dépistage précoce pré-éclampsie' },
      { nom: 'Recherche albumine dans les urines (bandelette)', objectif: 'Signe d\'alerte d\'une pré-éclampsie' },
      { nom: 'NFS de contrôle', objectif: 'Suivi anémie et efficacité supplémentation en fer' },
      { nom: 'Échographie morphologique (S22)', objectif: 'Dépistage malformations fœtales, sexe, position placenta' },
      { nom: 'Vaccin VAT 1 (Tétanos)', objectif: 'Immunisation contre le tétanos néonatal' },
    ],
    conseils: 'Commencer le fer (30 mg/j) et le calcium. Manger varié et équilibré.',
  },
  {
    numero: 'CPN 3',
    semaines: 'S28 – S32',
    trimestre: 3,
    examens: [
      { nom: 'Mesure hauteur utérine + BCF', objectif: 'Surveiller croissance et bien-être fœtal' },
      { nom: 'Contrôle TA + poids + albuminurie', objectif: 'Dépistage pré-éclampsie (risque maximal 3e trimestre)' },
      { nom: 'Test de tolérance au glucose (HGPO 75g)', objectif: 'Diagnostic définitif diabète gestationnel' },
      { nom: 'NFS + ferritine', objectif: 'Contrôle anémie en fin de grossesse' },
      { nom: 'Sérologie VIH de contrôle', objectif: 'Dépistage tardif, prévenir contamination à l\'accouchement' },
      { nom: 'Présentation fœtale (palper abdominal)', objectif: 'Vérifier si bébé est en position céphalique (tête en bas)' },
      { nom: 'Échographie 3e trimestre (S32–S34)', objectif: 'Croissance fœtale, quantité liquide amniotique, position placenta' },
      { nom: 'Vaccin VAT 2 (rappel tétanos)', objectif: 'Renforcement immunité, protège le nouveau-né' },
    ],
    conseils: 'Compter les mouvements fœtaux (≥ 10/jour). Préparer la valise de maternité.',
  },
  {
    numero: 'CPN 4',
    semaines: 'S36 – S38',
    trimestre: 3,
    examens: [
      { nom: 'Bilan complet pré-accouchement', objectif: 'Préparer prise en charge accouchement (groupe, rhésus, coagulation)' },
      { nom: 'Mesure bassin (pelvimétrie si nécessaire)', objectif: 'Évaluer faisabilité accouchement voie basse' },
      { nom: 'Vérification présentation fœtale', objectif: 'Confirmer position tête en bas, sinon orienter vers césarienne' },
      { nom: 'Contrôle TA + poids + albuminurie', objectif: 'Surveillance rapprochée hypertension gravidique' },
      { nom: 'Évaluation col utérin (toucher vaginal)', objectif: 'Apprécier maturité cervicale et imminence du travail' },
      { nom: 'Plan d\'accouchement', objectif: 'Orienter vers maternité adaptée, prévoir transport d\'urgence' },
    ],
    conseils: 'Rester proche d\'une maternité. Identifier un accompagnant et moyen de transport 24h/24.',
  },
]

// ─── Signes de danger ─────────────────────────────────────────────────────────
const SIGNES_DANGER = [
  {
    titre: 'Saignements vaginaux',
    icon: '🩸',
    color: '#dc2626',
    bg: '#fef2f2',
    urgence: true,
    desc: 'À n\'importe quel moment de la grossesse, tout saignement doit être signalé IMMÉDIATEMENT.',
    cat: '→ Fausse couche, placenta prævia, hématome rétroplacentaire.',
    cat2: '🚨 Se rendre en urgence à la maternité.',
  },
  {
    titre: 'Hypertension / Pré-éclampsie',
    icon: '💓',
    color: '#dc2626',
    bg: '#fef2f2',
    urgence: true,
    desc: 'TA ≥ 140/90 mmHg après 20 SA + œdèmes + albumine dans les urines.',
    cat: '→ Convulsions (éclampsie), risque vital mère et bébé.',
    cat2: '🚨 Hospitalisation immédiate obligatoire.',
  },
  {
    titre: 'Contractions avant 37 semaines',
    icon: '⚡',
    color: '#d97706',
    bg: '#fffbeb',
    urgence: true,
    desc: 'Contractions régulières et douloureuses avant le terme = menace d\'accouchement prématuré.',
    cat: '→ Bébé prématuré, complications respiratoires.',
    cat2: '🚨 Consulter en urgence pour tocolyse (médicaments stoppant le travail).',
  },
  {
    titre: 'Absence de mouvements fœtaux',
    icon: '👶',
    color: '#dc2626',
    bg: '#fef2f2',
    urgence: true,
    desc: 'Le bébé doit bouger ≥ 10 fois/jour après 28 SA. Moins de 10 mouvements en 12h = alarme.',
    cat: '→ Souffrance fœtale, mort fœtale in utero.',
    cat2: '🚨 Aller en urgence pour monitorage du rythme cardiaque fœtal (CTG).',
  },
  {
    titre: 'Perte de liquide amniotique',
    icon: '💧',
    color: '#1d4ed8',
    bg: '#eff6ff',
    urgence: true,
    desc: 'Écoulement soudain de liquide clair (rupture prématurée des membranes = RPM).',
    cat: '→ Infection fœtale (chorioamniotite), cordon procident.',
    cat2: '🚨 Maternité immédiatement, ne pas attendre les contractions.',
  },
  {
    titre: 'Maux de tête violents + vision trouble',
    icon: '🤕',
    color: '#dc2626',
    bg: '#fef2f2',
    urgence: true,
    desc: 'Associés à des phosphènes (éclairs lumineux) = signe de pré-éclampsie sévère.',
    cat: '→ Risque de crise convulsive (éclampsie).',
    cat2: '🚨 Urgence vitale — appeler le 119.',
  },
  {
    titre: 'Fièvre ≥ 38°C',
    icon: '🌡️',
    color: '#d97706',
    bg: '#fffbeb',
    urgence: false,
    desc: 'Toute fièvre pendant la grossesse doit être prise au sérieux.',
    cat: '→ Infection urinaire, paludisme, listériose, toxoplasmose.',
    cat2: '⚠️ Consulter rapidement sans automédication.',
  },
  {
    titre: 'Douleurs épigastriques (creux de l\'estomac)',
    icon: '😣',
    color: '#d97706',
    bg: '#fffbeb',
    urgence: true,
    desc: 'Douleur en barre sous les côtes droites = signe du syndrome HELLP (complication sévère).',
    cat: '→ Destruction des globules rouges, atteinte hépatique.',
    cat2: '🚨 Hospitalisation immédiate.',
  },
]

// ─── Alimentation ─────────────────────────────────────────────────────────────
const ALIMENTS_POUR = [
  { cat: '🥩 Protéines', items: ['Viande bien cuite (poulet, bœuf, poisson)', 'Œufs bien cuits', 'Légumineuses : niébé, arachides, haricots', 'Lait et produits laitiers pasteurisés'] },
  { cat: '🥬 Légumes & Fruits', items: ['Légumes verts feuillus : ndolé, légumes-feuilles', 'Patate douce, manioc, banane plantain', 'Mangue, papaye, citron (vitamine C)', 'Tout légume bien lavé et cuit'] },
  { cat: '🌾 Féculents & Énergie', items: ['Riz, maïs, igname, macabo', 'Mil, sorgho, pain complet', 'Huile de palme (avec modération)'] },
  { cat: '💊 Suppléments essentiels', items: ['Acide folique 0,4 mg/j (dès la conception → S12)', 'Fer 30–60 mg/j (prévient anémie)', 'Calcium 1 000 mg/j (os du bébé)', 'Vitamine D (absorption calcium)', 'Iode (développement cérébral du bébé)'] },
]

const ALIMENTS_CONTRE = [
  { icon:'🍺', label:'Alcool (aucune dose sûre)', desc:'Syndrome d\'alcoolisation fœtale, malformations cérébrales graves' },
  { icon:'🚬', label:'Tabac et drogues', desc:'Retard de croissance fœtale, fausse couche, mort subite du nourrisson' },
  { icon:'🐟', label:'Poisson cru (sashimi, sushi)', desc:'Risque listériose, anisakiase, contamination mercure' },
  { icon:'🥩', label:'Viande rouge/volaille crue ou saignante', desc:'Toxoplasmose, salmonellose — cuire à cœur' },
  { icon:'🧀', label:'Fromages à pâte molle non pasteurisés', desc:'Listériose pouvant provoquer mort fœtale in utero' },
  { icon:'🥚', label:'Œufs crus (mayonnaise maison)', desc:'Salmonellose' },
  { icon:'🌿', label:'Plantes médicinales non validées', desc:'Risque de contractions utérines, avortement spontané' },
  { icon:'💊', label:'Automédication (ibuprofène, aspirine)', desc:'Fermeture prématurée du canal artériel, saignements' },
  { icon:'☕', label:'Caféine excessive (> 200 mg/j)', desc:'Retard de croissance, fausse couche. Limiter à 1 café/jour' },
  { icon:'🥫', label:'Conserves industrielles, charcuterie', desc:'Risque listériose, excès sel aggravant hypertension' },
]

// ─── Hygiène & Conseils généraux ─────────────────────────────────────────────
const HYGIENE = [
  { icon:'💧', title:'Hydratation', desc:'Boire 1,5 à 2 litres d\'eau par jour. L\'eau bouillie ou en bouteille est recommandée.' },
  { icon:'🚿', title:'Hygiène corporelle', desc:'Toilette quotidienne. Éviter les bains trop chauds (risque d\'hyperthermie fœtale). Pas de douche vaginale.' },
  { icon:'🦟', title:'Prévention paludisme', desc:'Utiliser moustiquaire imprégnée chaque nuit. La chimioprophylaxie à la sulfadoxine-pyriméthamine (SP) est recommandée au Cameroun à chaque CPN à partir du 2e trimestre.' },
  { icon:'🚶‍♀️', title:'Activité physique', desc:'Marche 30 min/jour recommandée. Éviter efforts intenses, sports de contact, positions allongées sur le dos après 20 SA.' },
  { icon:'😴', title:'Repos', desc:'Dormir sur le côté gauche favorise la circulation placentaire. Minimum 8h de sommeil. Éviter le stress intense.' },
  { icon:'🦷', title:'Santé dentaire', desc:'Consulter un dentiste. Les hormones favorisent les caries et gingivites qui peuvent déclencher un accouchement prématuré.' },
  { icon:'🐈', title:'Éviter les chats (litière)', desc:'Les excréments de chats peuvent transmettre la toxoplasmose, dangereuse pour le fœtus.' },
  { icon:'🧪', title:'Produits chimiques', desc:'Éviter peintures, pesticides, produits ménagers agressifs sans ventilation. Porter des gants si nécessaire.' },
]

export default function GrossessePage() {
  const [tab, setTab] = useState<'cpn'|'danger'|'nutrition'|'hygiene'>('cpn')
  const [expandedCPN, setExpandedCPN] = useState<number | null>(0)

  const TABS = [
    { id:'cpn',      icon:'📋', label:'Calendrier CPN' },
    { id:'danger',   icon:'🚨', label:'Signes danger' },
    { id:'nutrition',icon:'🥗', label:'Nutrition' },
    { id:'hygiene',  icon:'💡', label:'Conseils' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#fdf6ee', fontFamily:'sans-serif', paddingBottom:80 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .row:active { opacity:0.8; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:'linear-gradient(160deg,#78350f,#d97706)', padding:'14px 16px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, maxWidth:560, margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:13, flexShrink:0 }}>← Retour</Link>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ color:'white', fontFamily:'Georgia,serif', fontSize:17, fontWeight:700 }}>🤰 Suivi de Grossesse</div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:11, marginTop:2 }}>Guide éducatif santé maternelle & fœtale</div>
          </div>
          <div style={{ width:48 }} />
        </div>
      </div>

      {/* ── BANDEAU DISCLAIMER ── */}
      <div style={{ background:'#fffbeb', borderBottom:'1px solid #fde68a', padding:'8px 16px' }}>
        <p style={{ color:'#92400e', fontSize:11, margin:0, textAlign:'center', lineHeight:1.5 }}>
          ⚕️ <strong>Informations éducatives uniquement.</strong> Pour tout suivi médical, consultez un(e) sage-femme, médecin ou gynécologue.
        </p>
      </div>

      {/* ── TABS ── */}
      <div style={{ background:'white', borderBottom:'1px solid #fde68a', display:'grid', gridTemplateColumns:'repeat(4,1fr)', position:'sticky', top:0, zIndex:40 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ padding:'10px 4px', border:'none', background:'transparent', cursor:'pointer', color:tab===t.id?'#d97706':'#aaa', fontWeight:tab===t.id?700:400, fontSize:10, borderBottom:tab===t.id?'2.5px solid #d97706':'2.5px solid transparent', display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <span style={{ fontSize:16 }}>{t.icon}</span>
            <span style={{ lineHeight:1.2, textAlign:'center' }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'16px 14px' }}>

        {/* ─── CALENDRIER CPN ─── */}
        {tab==='cpn' && (
          <div style={{ animation:'fadeUp .3s ease', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:'12px 14px' }}>
              <p style={{ color:'#92400e', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>📋 Calendrier des Consultations Prénatales (CPN)</p>
              <p style={{ color:'#78350f', fontSize:12, margin:0, lineHeight:1.6 }}>Le <strong>MINSANTÉ Cameroun</strong> et l'<strong>OMS</strong> recommandent au minimum <strong>4 CPN</strong> pour toute grossesse. Chaque consultation inclut des examens cliniques et biologiques ciblés.</p>
            </div>

            {CPN_DATA.map((cpn, idx) => (
              <div key={idx} style={{ background:'white', borderRadius:18, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
                {/* En-tête CPN */}
                <button className="row" onClick={() => setExpandedCPN(expandedCPN===idx ? null : idx)} style={{ width:'100%', padding:'14px 16px', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
                  <div style={{ width:44, height:44, borderRadius:14, background: cpn.trimestre===1?'#e8f5ee':cpn.trimestre===2?'#eff6ff':'#fdf2f8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, fontWeight:700, color: cpn.trimestre===1?'#0d4a3a':cpn.trimestre===2?'#1d4ed8':'#be185d' }}>
                    {idx+1}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#d97706', fontSize:14 }}>{cpn.numero}</div>
                    <div style={{ color:'#888', fontSize:12 }}>Semaines {cpn.semaines} · T{cpn.trimestre}</div>
                  </div>
                  <span style={{ color:'#d97706', fontSize:18, transform: expandedCPN===idx?'rotate(90deg)':'rotate(0deg)', transition:'transform .2s' }}>›</span>
                </button>

                {expandedCPN===idx && (
                  <div style={{ padding:'0 16px 16px', animation:'fadeUp .2s ease' }}>
                    {/* Tableau examens */}
                    <div style={{ border:'1px solid #fde68a', borderRadius:12, overflow:'hidden', marginBottom:12 }}>
                      <div style={{ background:'#d97706', padding:'8px 12px', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:8 }}>
                        <span style={{ color:'white', fontWeight:700, fontSize:11 }}>EXAMEN</span>
                        <span style={{ color:'white', fontWeight:700, fontSize:11 }}>OBJECTIF</span>
                      </div>
                      {cpn.examens.map((ex, i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:8, padding:'9px 12px', background:i%2===0?'white':'#fffbeb', borderTop:'1px solid #fde68a' }}>
                          <div style={{ color:'#92400e', fontSize:11, fontWeight:600, lineHeight:1.4 }}>{ex.nom}</div>
                          <div style={{ color:'#78350f', fontSize:11, lineHeight:1.4 }}>{ex.objectif}</div>
                        </div>
                      ))}
                    </div>
                    {/* Conseil de la visite */}
                    <div style={{ background:'#f0fdf4', borderRadius:10, padding:'10px 12px', border:'1px solid #86efac', display:'flex', gap:8 }}>
                      <span style={{ fontSize:14, flexShrink:0 }}>💡</span>
                      <p style={{ color:'#14532d', fontSize:12, margin:0, lineHeight:1.5 }}>{cpn.conseils}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Note finale CPN */}
            <div style={{ background:'#eff6ff', borderRadius:14, padding:'12px 14px', border:'1px solid #bfdbfe' }}>
              <p style={{ color:'#1e40af', fontSize:12, margin:0, lineHeight:1.6 }}>
                ℹ️ En cas de <strong>grossesse à risque</strong> (HTA, diabète, gémellaire, ATCD fausse couche), des consultations supplémentaires peuvent être prescrites. Suivez les recommandations de votre médecin ou sage-femme.
              </p>
            </div>
          </div>
        )}

        {/* ─── SIGNES DE DANGER ─── */}
        {tab==='danger' && (
          <div style={{ animation:'fadeUp .3s ease', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:14, padding:'12px 14px' }}>
              <p style={{ color:'#dc2626', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>🚨 Signes de danger — Ne jamais ignorer</p>
              <p style={{ color:'#7f1d1d', fontSize:12, margin:0, lineHeight:1.5 }}>En cas de signe d'alerte, <strong>ne pas attendre</strong>. Se rendre immédiatement dans une structure sanitaire ou appeler le <strong>119 (SAMU)</strong>.</p>
            </div>

            {SIGNES_DANGER.map((s, i) => (
              <div key={i} style={{ background:'white', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', borderLeft:`4px solid ${s.color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:s.color, fontSize:13 }}>{s.titre}</div>
                    {s.urgence && <span style={{ background:s.color, color:'white', borderRadius:6, padding:'1px 8px', fontSize:10, fontWeight:700 }}>URGENCE</span>}
                  </div>
                </div>
                <p style={{ color:'#444', fontSize:12, margin:'0 0 5px', lineHeight:1.5 }}>{s.desc}</p>
                <p style={{ color:'#666', fontSize:12, margin:'0 0 5px', lineHeight:1.5, fontStyle:'italic' }}>{s.cat}</p>
                <p style={{ color:s.color, fontSize:12, margin:0, fontWeight:700 }}>{s.cat2}</p>
              </div>
            ))}

            <div style={{ background:'#f0fdf4', borderRadius:14, padding:'12px 14px', border:'1px solid #86efac' }}>
              <p style={{ color:'#14532d', fontSize:12, margin:0, lineHeight:1.6 }}>
                ✅ <strong>Rappel :</strong> Aucun signe d'alarme ne doit être banalisé ou traité par automédication. Votre sage-femme ou médecin est votre premier recours. Ces informations sont données à titre éducatif uniquement.
              </p>
            </div>
          </div>
        )}

        {/* ─── NUTRITION ─── */}
        {tab==='nutrition' && (
          <div style={{ animation:'fadeUp .3s ease', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'#f0fdf4', borderRadius:14, padding:'12px 14px', border:'1px solid #86efac' }}>
              <p style={{ color:'#14532d', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>🥗 Alimentation pendant la grossesse</p>
              <p style={{ color:'#166534', fontSize:12, margin:0, lineHeight:1.5 }}>Une bonne nutrition couvre les besoins de la mère ET du bébé. Les carences en fer, acide folique et calcium sont les plus fréquentes en Afrique subsaharienne.</p>
            </div>

            {/* Aliments recommandés */}
            <p style={{ color:'#15803d', fontWeight:700, fontSize:14, margin:'4px 0 0' }}>✅ Aliments et apports recommandés</p>
            {ALIMENTS_POUR.map((cat, i) => (
              <div key={i} style={{ background:'white', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight:700, color:'#0d4a3a', fontSize:13, marginBottom:8 }}>{cat.cat}</div>
                {cat.items.map((item, j) => (
                  <div key={j} style={{ display:'flex', gap:8, marginBottom:5 }}>
                    <span style={{ color:'#16a34a', flexShrink:0, fontWeight:700 }}>•</span>
                    <span style={{ color:'#555', fontSize:12, lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Aliments contre-indiqués */}
            <p style={{ color:'#dc2626', fontWeight:700, fontSize:14, margin:'8px 0 0' }}>❌ Aliments et substances à éviter absolument</p>
            <div style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              {ALIMENTS_CONTRE.map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 14px', borderBottom:i<ALIMENTS_CONTRE.length-1?'1px solid #fef2f2':'none' }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#dc2626', fontSize:12 }}>{a.label}</div>
                    <div style={{ color:'#888', fontSize:11, lineHeight:1.4, marginTop:2 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:'#eff6ff', borderRadius:14, padding:'12px 14px', border:'1px solid #bfdbfe' }}>
              <p style={{ color:'#1e40af', fontSize:12, margin:0, lineHeight:1.6 }}>
                ℹ️ En cas de nausées sévères, de perte de poids ou de difficultés alimentaires, consultez votre médecin. Ces informations sont éducatives — votre professionnel de santé adaptera vos besoins à votre situation.
              </p>
            </div>
          </div>
        )}

        {/* ─── HYGIÈNE & CONSEILS ─── */}
        {tab==='hygiene' && (
          <div style={{ animation:'fadeUp .3s ease', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#fffbeb', borderRadius:14, padding:'12px 14px', border:'1px solid #fde68a' }}>
              <p style={{ color:'#92400e', fontWeight:700, fontSize:13, margin:'0 0 4px' }}>💡 Conseils essentiels pour une grossesse saine</p>
              <p style={{ color:'#78350f', fontSize:12, margin:0, lineHeight:1.5 }}>Ces recommandations contribuent à réduire les complications et à assurer la sécurité de la mère et de l'enfant tout au long de la grossesse.</p>
            </div>

            {HYGIENE.map((h, i) => (
              <div key={i} style={{ background:'white', borderRadius:16, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, border:'1px solid #fde68a' }}>{h.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:'#92400e', fontSize:13, marginBottom:4 }}>{h.title}</div>
                  <p style={{ color:'#555', fontSize:12, margin:0, lineHeight:1.6 }}>{h.desc}</p>
                </div>
              </div>
            ))}

            {/* Valise de maternité */}
            <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:16, padding:'16px', border:'1.5px solid #fde68a' }}>
              <p style={{ fontWeight:700, color:'#92400e', fontSize:13, margin:'0 0 10px' }}>👜 Préparer la valise de maternité (dès S34)</p>
              {[
                '📄 Carnet de santé, carte nationale d\'identité, carnet de mariage',
                '🩺 Résultats d\'examens, ordonnances, échographies',
                '👗 Vêtements amples pour la mère (3 tenues)',
                '🧴 Articles de toilette, serviettes hygiéniques post-partum',
                '👶 Vêtements nourrisson (3 sets), couverture, couches',
                '💊 Médicaments prescrits, suppléments',
                '📱 Téléphone chargé, numéros d\'urgence notés',
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6, fontSize:12, color:'#78350f' }}>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Numéros utiles */}
            <div style={{ background:'linear-gradient(135deg,#7f1d1d,#dc2626)', borderRadius:16, padding:'16px' }}>
              <p style={{ color:'white', fontWeight:700, fontSize:13, margin:'0 0 10px' }}>🚨 Numéros d'urgence Cameroun</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['119','SAMU / Urgences médicales'],['117','Police Secours'],['118','Sapeurs-Pompiers'],['1510','Info Santé MINSANTÉ']].map(([n,l]) => (
                  <a key={n} href={`tel:${n}`} style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'10px 12px', textDecoration:'none', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ color:'white', fontWeight:800, fontSize:20, fontFamily:'monospace' }}>{n}</div>
                    <div style={{ color:'rgba(255,255,255,0.75)', fontSize:10, marginTop:2 }}>{l}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Disclaimer final */}
            <div style={{ background:'#f8fafc', borderRadius:14, padding:'14px 16px', border:'1px solid #e2e8f0' }}>
              <p style={{ color:'#475569', fontSize:12, margin:0, lineHeight:1.7, textAlign:'center', fontStyle:'italic' }}>
                📚 Toutes les informations de cette rubrique sont fournies <strong>à titre éducatif uniquement</strong>. Elles ne remplacent en aucun cas l'avis d'un professionnel de santé qualifié.<br/><br/>
                Pour un suivi personnalisé et adapté à votre situation, veuillez consulter votre <strong>sage-femme, médecin ou gynécologue-obstétricien</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #fde68a', display:'flex', justifyContent:'space-around', padding:'8px 0 10px', boxShadow:'0 -4px 16px rgba(0,0,0,0.06)', zIndex:50 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:1, padding:'3px 12px', border:'none', background:'transparent', cursor:'pointer', color:tab===t.id?'#d97706':'#bbb', fontWeight:tab===t.id?700:400 }}>
            <span style={{ fontSize:19 }}>{t.icon}</span>
            <span style={{ fontSize:9, lineHeight:1.2, textAlign:'center' }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
