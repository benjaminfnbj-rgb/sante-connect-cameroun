// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── 7 CPN + 1 CPON — Protocole Cameroun ────────────────────────────────────
const CPN_DATA = [
  {
    id: 'CPN 1', mois: 'Avant 12 SA — 1er trimestre', trim: 1,
    color: '#0d4a3a', bg: '#e8f5ee', border: '#86efac',
    examens: [
      { nom: 'Ouverture du dossier obstétrical', obj: 'Antécédents médicaux, obstétricaux, familiaux et mode de vie' },
      { nom: 'Calcul DDR + terme prévu', obj: 'DDR + 9 mois + 7 jours = date prévue accouchement' },
      { nom: 'Poids + taille + IMC', obj: 'Référence de base, dépister obésité ou maigreur' },
      { nom: 'Tension artérielle (TA)', obj: 'TA de référence — normale < 140/90 mmHg' },
      { nom: 'Groupage ABO + Rhésus', obj: 'Incompatibilité rhésus, préparation transfusion' },
      { nom: 'NFS (numération formule sanguine)', obj: 'Dépister anémie, drépanocytose, thrombopénie' },
      { nom: 'Test VIH (PTME)', obj: 'Prévenir transmission mère-enfant — obligatoire au Cameroun' },
      { nom: 'Sérologie syphilis (TPHA/RPR)', obj: 'Syphilis non traitée → mort fœtale ou malformations' },
      { nom: 'Sérologie hépatite B (AgHBs)', obj: 'Vaccination du nouveau-né à la naissance si positive' },
      { nom: 'Glycémie à jeun', obj: 'Dépistage précoce diabète préexistant ou gestationnel' },
      { nom: 'ECBU + bandelette urinaire', obj: 'Infection urinaire silencieuse → risque prématurité' },
      { nom: 'TDR paludisme / goutte épaisse', obj: 'Paludisme endémique = source majeure anémie et prématurité' },
      { nom: 'TPI 1 — Sulfadoxine-Pyriméthamine', obj: 'Traitement Préventif Intermittent antipaludéen — 1ère dose' },
      { nom: 'Acide folique 5 mg/j + Fer', obj: 'Prévenir spina bifida (acide folique) et anémie (fer)' },
      { nom: 'Moustiquaire imprégnée (MII)', obj: 'Protection paludisme toutes les nuits' },
      { nom: '🔬 Échographie 1 — S11 à S14', obj: 'Datation précise, clarté nucale, vitalité fœtale, nb de fœtus' },
    ],
    conseil: 'Venir dès la suspicion de grossesse, AVANT 12 SA. Apporter le carnet de santé. Arrêter alcool, tabac, automédication.',
  },
  {
    id: 'CPN 2', mois: '4e mois (S15–S18)', trim: 2,
    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',
    examens: [
      { nom: 'Poids + TA + examen général', obj: 'Surveillance tension et prise de poids (+ 0,5 kg/sem)' },
      { nom: 'Hauteur utérine (HU) + BCF', obj: 'HU ≈ nombre SA en cm. BCF normal : 120–160 batt/min' },
      { nom: 'Bandelette urinaire (protéinurie)', obj: 'Signe précoce pré-éclampsie' },
      { nom: 'NFS de contrôle', obj: 'Efficacité supplémentation en fer, anémie persistante ?' },
      { nom: 'TPI 2 — Sulfadoxine-Pyriméthamine', obj: '2e dose TPI (≥ 4 semaines après TPI 1)' },
      { nom: 'VAT 1 — Vaccin Antitétanique', obj: '1ère dose VAT — protège mère ET nouveau-né contre tétanos' },
      { nom: 'Mébendazole 500 mg (dose unique)', obj: 'Déparasitage — à partir du 2e trimestre uniquement' },
      { nom: 'Supplémentation fer + acide folique', obj: 'Continuer jusqu\'au post-partum' },
    ],
    conseil: 'Continuer à dormir sous moustiquaire chaque nuit. Signaler tout saignement ou douleur abdominale.',
  },
  {
    id: 'CPN 3', mois: '5e mois (S19–S22)', trim: 2,
    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',
    examens: [
      { nom: 'Poids + TA + HU + BCF', obj: 'Surveillance croissance fœtale et état maternel' },
      { nom: 'Bandelette urinaire', obj: 'Surveillance protéinurie et glucosurie' },
      { nom: 'Sérologie VIH de contrôle', obj: 'Fenêtre sérologique : 2e test recommandé pour PTME' },
      { nom: 'TPI 3 — Sulfadoxine-Pyriméthamine', obj: '3e dose TPI (≥ 4 semaines après TPI 2)' },
      { nom: 'VAT 2 — Vaccin Antitétanique', obj: '2e dose VAT (4 semaines après VAT 1) — immunité complète' },
      { nom: '🔬 Échographie 2 — S22 à S24', obj: 'Morphologie fœtale complète, dépistage malformations, sexe, placenta' },
    ],
    conseil: 'L\'échographie morphologique est cruciale — ne pas la manquer. Compter les mouvements du bébé.',
  },
  {
    id: 'CPN 4', mois: '6e mois (S23–S26)', trim: 2,
    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe',
    examens: [
      { nom: 'Poids + TA + HU + BCF', obj: 'Fin du 2e trimestre — dépistage précoce complications' },
      { nom: 'Bandelette urinaire', obj: 'Surveillance pré-éclampsie' },
      { nom: 'Test HGPO 75g (diabète gestationnel)', obj: 'Glycémie 0h, 1h, 2h — diagnostic définitif diabète grossesse' },
      { nom: 'NFS + bilan de contrôle', obj: 'Préparer 3e trimestre, s\'assurer absence anémie' },
      { nom: 'Calcium 1,5 g/j (début)', obj: 'Réduit risque pré-éclampsie + ossification fœtale' },
    ],
    conseil: 'Début du 3e trimestre approche. Penser à préparer la valise de maternité.',
  },
  {
    id: 'CPN 5', mois: '7e mois (S27–S31)', trim: 3,
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    examens: [
      { nom: 'Poids + TA + HU + BCF', obj: 'Risque pré-éclampsie augmente — surveillance rapprochée' },
      { nom: 'Présentation fœtale (palper de Léopold)', obj: 'Vérifier position tête en bas. Si siège → orienter spécialiste' },
      { nom: 'Mouvements actifs fœtaux', obj: 'Bébé doit bouger ≥ 10 fois/jour. Absence = urgence' },
      { nom: 'Bandelette urinaire + œdèmes', obj: 'Œdèmes visage + TA + protéinurie = pré-éclampsie' },
      { nom: 'NFS + groupage sanguin', obj: 'Préparer bilan accouchement' },
      { nom: 'Sérologie VIH de contrôle', obj: 'Permettre PTME à l\'accouchement si nouvelle positivité' },
    ],
    conseil: 'Compter les mouvements de bébé chaque jour. Préparer la valise de maternité dès maintenant.',
  },
  {
    id: 'CPN 6', mois: '8e mois (S32–S35)', trim: 3,
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    examens: [
      { nom: 'Poids + TA + HU + BCF', obj: 'Surveillance maximale — 3e trimestre = risque le plus élevé' },
      { nom: 'Présentation fœtale finale', obj: 'Bébé doit être tête en bas. Si siège persistant → césarienne discutée' },
      { nom: 'Bandelette urinaire + œdèmes visage', obj: 'Alerte pré-éclampsie sévère' },
      { nom: '🔬 Échographie 3 — S32 à S34', obj: 'Croissance fœtale, liquide amniotique, position placenta, profil biophysique' },
      { nom: 'Pelvimétrie clinique (si indiquée)', obj: 'Évaluer bassin maternel — voie basse ou césarienne ?' },
    ],
    conseil: 'Rester à proximité de la maternité. Identifier moyen de transport 24h/24 et accompagnant.',
  },
  {
    id: 'CPN 7', mois: '9e mois — toutes les 2 semaines — OBLIGATOIRE', trim: 3,
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    examens: [
      { nom: 'Poids + TA + bandelette urinaire', obj: 'Surveillance maximale — risque le plus élevé pré-éclampsie/éclampsie' },
      { nom: 'HU + BCF + mouvements fœtaux', obj: 'Confirmer bien-être fœtal avant accouchement' },
      { nom: 'Présentation + engagement (Léopold)', obj: 'Confirmer engagement tête. Siège persistant → césarienne programmée' },
      { nom: 'Toucher vaginal (si indiqué)', obj: 'Maturité cervicale, engagement, score de Bishop — signes travail' },
      { nom: 'Bilan pré-opératoire complet', obj: 'NFS, groupage-Rh, TP-TCA, ECG si césarienne prévue' },
      { nom: 'VIH final (si résultats absents)', obj: 'Toute parturiente sans résultat VIH = test à la salle de travail' },
      { nom: 'VAT rappel (si schéma incomplet)', obj: 'Compléter immunisation si VAT non terminé' },
      { nom: 'Remise dossier obstétrical + plan accouchement', obj: 'Tous résultats à la maternité. Confirmer transport, accompagnant, n° 119' },
    ],
    conseil: 'CPN OBLIGATOIRES au 9e mois toutes les 2 semaines. APPELER LE 119 si : contractions régulières, perte eaux, saignements, bébé ne bouge plus.',
  },
]

const CPON = {
  delai: 'Dans les 6 semaines après l\'accouchement (idéalement avant J42)',
  examens: [
    { nom: 'Examen général de la mère', obj: 'Poids, TA, cicatrice césarienne ou épisiotomie, involution utérine' },
    { nom: 'Examen des seins', obj: 'Évaluer l\'allaitement, dépister engorgement, mastite, abcès' },
    { nom: 'Dépistage dépression post-partum (Edinburgh)', obj: 'Score EPDS — dépression post-partum touche 10 à 20% des mères' },
    { nom: 'Frottis cervical (si non fait pendant grossesse)', obj: 'Dépistage cancer du col de l\'utérus' },
    { nom: 'NFS si anémie en fin de grossesse', obj: 'Vérifier récupération hémoglobine après accouchement' },
    { nom: 'Vaccination et suivi du nouveau-né', obj: 'BCG, VPO, Hépatite B à la naissance — vérifier carnet vaccinal' },
    { nom: 'Counseling planification familiale', obj: 'Choisir contraception adaptée à l\'allaitement (DIU, progestatif seul)' },
    { nom: 'Counseling allaitement maternel exclusif', obj: 'Soutien, technique, prévention IST et PTME' },
  ],
}

const SIGNES = [
  { titre: 'Saignements vaginaux', icon: '🩸', niveau: 'URGENCE VITALE', color: '#dc2626', desc: 'À tout moment de la grossesse. Toujours signaler immédiatement.', cause: 'Fausse couche, placenta prævia, hématome rétroplacentaire', action: '🚨 Maternité EN URGENCE' },
  { titre: 'Hypertension + Pré-éclampsie', icon: '💓', niveau: 'URGENCE VITALE', color: '#dc2626', desc: 'TA ≥ 140/90 + œdèmes + albumine dans urines après 20 SA.', cause: 'Risque convulsions (éclampsie) — mortel pour mère et bébé', action: '🚨 Hospitalisation immédiate' },
  { titre: 'Contractions avant 37 SA', icon: '⚡', niveau: 'URGENT', color: '#d97706', desc: 'Contractions régulières et douloureuses avant le terme.', cause: 'Accouchement prématuré — complications respiratoires bébé', action: '⚠️ Consulter en urgence' },
  { titre: 'Bébé ne bouge plus', icon: '👶', niveau: 'URGENCE VITALE', color: '#dc2626', desc: 'Moins de 10 mouvements en 12h après 28 SA.', cause: 'Souffrance fœtale, mort fœtale in utero', action: '🚨 CTG en urgence à la maternité' },
  { titre: 'Perte de liquide (RPM)', icon: '💧', niveau: 'URGENCE VITALE', color: '#dc2626', desc: 'Écoulement soudain de liquide clair — rupture prématurée des membranes.', cause: 'Infection fœtale, cordon procident', action: '🚨 Maternité IMMÉDIATEMENT, sans attendre contractions' },
  { titre: 'Maux de tête + vision trouble', icon: '🤕', niveau: 'URGENCE VITALE', color: '#dc2626', desc: 'Phosphènes (éclairs) + céphalées violentes = pré-éclampsie sévère.', cause: 'Crise convulsive (éclampsie) imminente', action: '🚨 Appeler le 119 immédiatement' },
  { titre: 'Fièvre ≥ 38°C', icon: '🌡️', niveau: 'URGENT', color: '#d97706', desc: 'Toute fièvre pendant la grossesse est sérieuse.', cause: 'Infection urinaire, paludisme, listériose', action: '⚠️ Consulter rapidement — pas d\'automédication' },
  { titre: 'Douleur en barre sous les côtes', icon: '😣', niveau: 'URGENCE VITALE', color: '#dc2626', desc: 'Douleur épigastrique intense = signe du syndrome HELLP.', cause: 'Destruction globules rouges, atteinte hépatique grave', action: '🚨 Hospitalisation immédiate' },
]

const ALIMENTS_OK = [
  { cat: '🥩 Protéines', items: ['Viande bien cuite : poulet, bœuf, poisson', 'Légumineuses : niébé, haricots, arachides', 'Œufs bien cuits', 'Lait et laitages pasteurisés'] },
  { cat: '🥬 Légumes & Fruits', items: ['Légumes verts : ndolé, légumes-feuilles', 'Patate douce, manioc, igname, macabo', 'Mangue, papaye, citron (vitamine C)', 'Tout légume bien lavé et cuit'] },
  { cat: '💊 Suppléments essentiels', items: ['Acide folique 5 mg/j dès la conception', 'Fer 30–60 mg/j — prévient l\'anémie', 'Calcium 1,5 g/j dès le 3e trimestre', 'Vitamine D et Iode (développement cérébral)'] },
]

const ALIMENTS_NON = [
  { icon:'🍺', item:'Alcool — AUCUNE dose sûre', raison:'Syndrome d\'alcoolisation fœtale, malformations cérébrales'},
  { icon:'🚬', item:'Tabac et drogues', raison:'Retard croissance, fausse couche, mort subite nourrisson'},
  { icon:'🐟', item:'Poisson cru / sushi', raison:'Listériose, mercure, anisakiase'},
  { icon:'🥩', item:'Viande saignante ou crue', raison:'Toxoplasmose, salmonellose — cuire à cœur'},
  { icon:'🧀', item:'Fromages pâte molle non pasteurisés', raison:'Listériose → mort fœtale in utero'},
  { icon:'🌿', item:'Plantes médicinales non validées', raison:'Contractions utérines, avortement spontané'},
  { icon:'💊', item:'Ibuprofène, aspirine (automédication)', raison:'Fermeture canal artériel, saignements fœtaux'},
  { icon:'☕', item:'Caféine > 200 mg/j (> 1 café)', raison:'Retard de croissance, fausse couche'},
]

const ALLAIT_STEPS = [
  { n:'1', t:'Dans la 1ère heure de vie', d:'Contact peau à peau immédiat — stimule montée laiteuse et transfère anticorps (colostrum)' },
  { n:'2', t:'Position correcte', d:'Ventre contre ventre. Tête, cou et dos alignés. Mère confortable, assise ou allongée' },
  { n:'3', t:'Prise correcte du sein', d:'Bouche grande ouverte, lèvres éversées, menton touche le sein, aréole entière en bouche — PAS seulement le mamelon' },
  { n:'4', t:'Signes d\'une bonne tétée', d:'Succion profonde et lente, déglutition audible, bébé se détache seul, sein ramolli après' },
  { n:'5', t:'Fréquence', d:'À la demande — 8 à 12 fois par 24h. Vider un sein complètement avant l\'autre' },
  { n:'6', t:'Soin des mamelons', d:'Laisser sécher à l\'air. Appliquer une goutte de lait maternel. Éviter savon et alcool' },
]

const HYGIENE_ITEMS = [
  { icon:'💧', t:'Hydratation', d:'1,5 à 2 litres d\'eau par jour. Eau bouillie ou embouteillée recommandée.' },
  { icon:'🦟', t:'Prévention paludisme', d:'Dormir sous moustiquaire imprégnée chaque nuit. Prendre la SP à chaque CPN.' },
  { icon:'🚶‍♀️', t:'Activité physique', d:'Marche 30 min/jour. Éviter sports de contact, efforts intenses, position allongée sur le dos après 20 SA.' },
  { icon:'😴', t:'Sommeil', d:'Dormir sur le côté gauche favorise la circulation placentaire. Minimum 8h/nuit.' },
  { icon:'🦷', t:'Santé dentaire', d:'Consulter un dentiste. Gingivites et caries favorisées par hormones peuvent déclencher prématurité.' },
  { icon:'🐈', t:'Éviter la litière des chats', d:'Risque toxoplasmose — dangereuse pour le fœtus.' },
  { icon:'🧪', t:'Produits chimiques', d:'Éviter peintures, pesticides, produits ménagers agressifs. Porter des gants.' },
]

export default function GrossessePage() {
  const [tab, setTab] = useState<'cpn'|'danger'|'nutrition'|'allaitement'|'conseils'>('cpn')
  const [openCPN, setOpenCPN] = useState<number|null>(0)
  const [showCPON, setShowCPON] = useState(false)

  const TABS = [
    { id:'cpn', icon:'📋', label:'CPN' },
    { id:'danger', icon:'🚨', label:'Dangers' },
    { id:'nutrition', icon:'🥗', label:'Nutrition' },
    { id:'allaitement', icon:'🤱', label:'Allaitement' },
    { id:'conseils', icon:'💡', label:'Conseils' },
  ]

  const trimColors = { 1:'#0d4a3a', 2:'#1d4ed8', 3:'#7c3aed' }
  const trimBg = { 1:'#e8f5ee', 2:'#eff6ff', 3:'#f5f3ff' }
  const trimLabel = { 1:'T1', 2:'T2', 3:'T3' }

  return (
    <div style={{ minHeight:'100vh', background:'#faf7f4', fontFamily:'system-ui,sans-serif', paddingBottom:72 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cpn-row:active { opacity:.75 }
      `}</style>

      {/* HEADER */}
      <div style={{ background:'linear-gradient(135deg,#78350f,#c2690a)', padding:'14px 16px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, maxWidth:560, margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.65)', textDecoration:'none', fontSize:13 }}>← Retour</Link>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ color:'white', fontSize:17, fontWeight:700 }}>🤰 Suivi de Grossesse</div>
            <div style={{ color:'rgba(255,255,255,0.65)', fontSize:11, marginTop:1 }}>Guide éducatif santé maternelle & fœtale</div>
          </div>
          <div style={{ width:44 }}/>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div style={{ background:'#fffbeb', borderBottom:'1px solid #fde68a', padding:'8px 16px', textAlign:'center' }}>
        <p style={{ color:'#92400e', fontSize:11, margin:0 }}>
          ⚕️ <strong>Informations éducatives uniquement.</strong> Consultez un(e) sage-femme, médecin ou gynécologue pour votre suivi.
        </p>
      </div>

      {/* TABS */}
      <div style={{ background:'white', borderBottom:'2px solid #f0ebe3', display:'flex', position:'sticky', top:0, zIndex:40, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ flex:1, minWidth:64, padding:'10px 4px', border:'none', background:'transparent', cursor:'pointer', color:tab===t.id?'#c2690a':'#9ca3af', fontWeight:tab===t.id?700:400, fontSize:10, borderBottom:tab===t.id?'2px solid #c2690a':'2px solid transparent', display:'flex', flexDirection:'column', alignItems:'center', gap:2, transition:'all .15s', marginBottom:-2 }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ maxWidth:560, margin:'0 auto', padding:'14px 14px' }}>

        {/* ── CPN ── */}
        {tab==='cpn' && (
          <div style={{ animation:'fadeUp .25s ease', display:'flex', flexDirection:'column', gap:10 }}>

            {/* Résumé */}
            <div style={{ background:'white', borderRadius:16, padding:'14px 16px', boxShadow:'0 1px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontWeight:700, color:'#92400e', fontSize:14, margin:'0 0 6px' }}>📋 Calendrier officiel — Cameroun</p>
              <p style={{ color:'#555', fontSize:12, margin:'0 0 10px', lineHeight:1.6 }}>
                Le protocole camerounais prévoit <strong>7 consultations prénatales</strong> mensuelles + <strong>3 échographies</strong> recommandées + <strong>1 consultation post-natale (CPON)</strong> après l'accouchement.
              </p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[['T1','#e8f5ee','#0d4a3a','CPN 1'],['T2','#eff6ff','#1d4ed8','CPN 2–4'],['T3','#f5f3ff','#7c3aed','CPN 5–7'],['Post','#fef2f2','#dc2626','CPON']].map(([l,bg,c,sub])=>(
                  <div key={l} style={{ background:bg, borderRadius:10, padding:'7px 12px', flex:1, minWidth:72, textAlign:'center' }}>
                    <div style={{ color:c, fontWeight:800, fontSize:14 }}>{l}</div>
                    <div style={{ color:c, fontSize:10, opacity:.8 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Echographies */}
            <div style={{ background:'#eff6ff', borderRadius:14, padding:'12px 14px', border:'1px solid #bfdbfe' }}>
              <p style={{ color:'#1d4ed8', fontWeight:700, fontSize:13, margin:'0 0 8px' }}>🔬 3 Échographies recommandées</p>
              {[
                ['Écho 1','S11–S14','Datation, clarté nucale, vitalité fœtale, nombre de fœtus'],
                ['Écho 2','S22–S24','Morphologie fœtale complète, dépistage malformations, sexe, placenta'],
                ['Écho 3','S32–S34','Croissance fœtale, position, liquide amniotique, profil biophysique'],
              ].map(([l,s,d],i)=>(
                <div key={i} style={{ display:'flex', gap:10, marginBottom:i<2?8:0, alignItems:'flex-start' }}>
                  <div style={{ background:'#1d4ed8', color:'white', borderRadius:8, padding:'2px 8px', fontSize:11, fontWeight:700, flexShrink:0, marginTop:1 }}>{l}</div>
                  <div>
                    <span style={{ color:'#1e40af', fontWeight:600, fontSize:12 }}>{s}</span>
                    <span style={{ color:'#555', fontSize:11 }}> — {d}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CPN accordéon */}
            {CPN_DATA.map((cpn, idx) => (
              <div key={idx} style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:`1px solid ${cpn.border}` }}>
                <button className="cpn-row" onClick={() => setOpenCPN(openCPN===idx?null:idx)} style={{ width:'100%', padding:'13px 16px', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:cpn.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${cpn.border}` }}>
                    <span style={{ color:cpn.color, fontWeight:800, fontSize:13, lineHeight:1 }}>{cpn.id.split(' ')[1]}</span>
                    <span style={{ color:cpn.color, fontSize:8, opacity:.7 }}>{trimLabel[cpn.trim]}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:'#1a1a1a', fontSize:14 }}>{cpn.id}</div>
                    <div style={{ color:'#888', fontSize:11, marginTop:1 }}>{cpn.mois}</div>
                  </div>
                  <span style={{ color:cpn.color, fontSize:18, transform:openCPN===idx?'rotate(90deg)':'none', transition:'transform .2s', flexShrink:0 }}>›</span>
                </button>

                {openCPN===idx && (
                  <div style={{ padding:'0 14px 14px', animation:'fadeUp .2s ease' }}>
                    {/* Tableau */}
                    <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #f0f0f0', marginBottom:10 }}>
                      <div style={{ background:cpn.color, padding:'7px 12px', display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:8 }}>
                        <span style={{ color:'white', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:.5 }}>Examen</span>
                        <span style={{ color:'white', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:.5 }}>Objectif</span>
                      </div>
                      {cpn.examens.map((ex,i)=>(
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:8, padding:'9px 12px', background:i%2===0?'white':'#fafafa', borderTop:'1px solid #f0f0f0' }}>
                          <div style={{ color:cpn.color, fontSize:11, fontWeight:600, lineHeight:1.4 }}>{ex.nom}</div>
                          <div style={{ color:'#555', fontSize:11, lineHeight:1.4 }}>{ex.obj}</div>
                        </div>
                      ))}
                    </div>
                    {/* Conseil */}
                    <div style={{ background:cpn.bg, borderRadius:10, padding:'10px 12px', display:'flex', gap:8, border:`1px solid ${cpn.border}` }}>
                      <span style={{ flexShrink:0 }}>💡</span>
                      <p style={{ color:cpn.color, fontSize:11, margin:0, lineHeight:1.5 }}>{cpn.conseil}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* CPON */}
            <div style={{ background:'white', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:'1px solid #fecaca' }}>
              <button className="cpn-row" onClick={() => setShowCPON(!showCPON)} style={{ width:'100%', padding:'13px 16px', background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12, textAlign:'left' }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'#fef2f2', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, border:'1px solid #fecaca' }}>
                  <span style={{ color:'#dc2626', fontWeight:800, fontSize:11, lineHeight:1 }}>CPON</span>
                  <span style={{ color:'#dc2626', fontSize:8, opacity:.7 }}>Post-natal</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#1a1a1a', fontSize:14 }}>Consultation Post-Natale</div>
                  <div style={{ color:'#888', fontSize:11, marginTop:1 }}>{CPON.delai}</div>
                </div>
                <span style={{ color:'#dc2626', fontSize:18, transform:showCPON?'rotate(90deg)':'none', transition:'transform .2s' }}>›</span>
              </button>
              {showCPON && (
                <div style={{ padding:'0 14px 14px', animation:'fadeUp .2s ease' }}>
                  <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid #f0f0f0', marginBottom:10 }}>
                    <div style={{ background:'#dc2626', padding:'7px 12px', display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:8 }}>
                      <span style={{ color:'white', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>Examen</span>
                      <span style={{ color:'white', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>Objectif</span>
                    </div>
                    {CPON.examens.map((ex,i)=>(
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:8, padding:'9px 12px', background:i%2===0?'white':'#fafafa', borderTop:'1px solid #f0f0f0' }}>
                        <div style={{ color:'#dc2626', fontSize:11, fontWeight:600, lineHeight:1.4 }}>{ex.nom}</div>
                        <div style={{ color:'#555', fontSize:11, lineHeight:1.4 }}>{ex.obj}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fef2f2', borderRadius:10, padding:'10px 12px', display:'flex', gap:8, border:'1px solid #fecaca' }}>
                    <span>💡</span>
                    <p style={{ color:'#dc2626', fontSize:11, margin:0, lineHeight:1.5 }}>La CPON est souvent négligée — elle est essentielle pour la santé de la mère et du nouveau-né. Ne pas la manquer.</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background:'#eff6ff', borderRadius:12, padding:'10px 14px', border:'1px solid #bfdbfe' }}>
              <p style={{ color:'#1e40af', fontSize:11, margin:0, lineHeight:1.6 }}>ℹ️ En cas de grossesse à risque (HTA, diabète, gémellaire, antécédent fausse couche), des consultations supplémentaires peuvent être prescrites.</p>
            </div>
          </div>
        )}

        {/* ── DANGER ── */}
        {tab==='danger' && (
          <div style={{ animation:'fadeUp .25s ease', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#fef2f2', borderRadius:14, padding:'12px 14px', border:'1.5px solid #fecaca' }}>
              <p style={{ color:'#dc2626', fontWeight:700, fontSize:13, margin:'0 0 3px' }}>🚨 Ne jamais ignorer ces signaux</p>
              <p style={{ color:'#7f1d1d', fontSize:12, margin:0 }}>En cas de signe d'alerte, ne pas attendre. Appeler le <strong>119</strong> ou aller immédiatement à la maternité.</p>
            </div>

            {SIGNES.map((s,i)=>(
              <div key={i} style={{ background:'white', borderRadius:14, padding:'14px', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', borderLeft:`4px solid ${s.color}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:11, background:s.color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:s.color, fontSize:13 }}>{s.titre}</div>
                    <span style={{ background:s.color, color:'white', borderRadius:6, padding:'1px 8px', fontSize:9, fontWeight:700 }}>{s.niveau}</span>
                  </div>
                </div>
                <p style={{ color:'#444', fontSize:12, margin:'0 0 4px', lineHeight:1.5 }}>{s.desc}</p>
                <p style={{ color:'#777', fontSize:11, margin:'0 0 6px', fontStyle:'italic' }}>→ {s.cause}</p>
                <p style={{ color:s.color, fontSize:12, fontWeight:700, margin:0 }}>{s.action}</p>
              </div>
            ))}

            <a href="tel:119" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, background:'linear-gradient(135deg,#7f1d1d,#dc2626)', borderRadius:16, padding:'16px', textDecoration:'none', boxShadow:'0 4px 16px rgba(220,38,38,0.3)' }}>
              <span style={{ fontSize:24 }}>📞</span>
              <div>
                <div style={{ color:'white', fontWeight:800, fontSize:22, lineHeight:1 }}>119</div>
                <div style={{ color:'rgba(255,255,255,0.75)', fontSize:11 }}>SAMU — Urgences médicales 24h/24</div>
              </div>
            </a>
          </div>
        )}

        {/* ── NUTRITION ── */}
        {tab==='nutrition' && (
          <div style={{ animation:'fadeUp .25s ease', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#f0fdf4', borderRadius:14, padding:'12px 14px', border:'1px solid #86efac' }}>
              <p style={{ color:'#14532d', fontWeight:700, fontSize:13, margin:'0 0 3px' }}>🥗 Manger pour deux — mieux, pas plus</p>
              <p style={{ color:'#166534', fontSize:12, margin:0 }}>Les carences en fer, acide folique et calcium sont les plus fréquentes au Cameroun pendant la grossesse.</p>
            </div>

            <p style={{ color:'#15803d', fontWeight:700, fontSize:13, margin:'4px 0 0' }}>✅ Aliments à privilégier</p>
            {ALIMENTS_OK.map((g,i)=>(
              <div key={i} style={{ background:'white', borderRadius:14, padding:'12px 14px', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
                <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:13, margin:'0 0 8px' }}>{g.cat}</p>
                {g.items.map((item,j)=>(
                  <div key={j} style={{ display:'flex', gap:8, marginBottom:4 }}>
                    <span style={{ color:'#16a34a', flexShrink:0 }}>•</span>
                    <span style={{ color:'#555', fontSize:12, lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}

            <p style={{ color:'#dc2626', fontWeight:700, fontSize:13, margin:'8px 0 0' }}>❌ À éviter absolument</p>
            <div style={{ background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
              {ALIMENTS_NON.map((a,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderTop:i>0?'1px solid #fef2f2':'none' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, color:'#dc2626', fontSize:12 }}>{a.item}</div>
                    <div style={{ color:'#888', fontSize:11, marginTop:2 }}>{a.raison}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALLAITEMENT ── */}
        {tab==='allaitement' && (
          <div style={{ animation:'fadeUp .25s ease', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#ecfdf5', borderRadius:14, padding:'12px 14px', border:'1px solid #6ee7b7' }}>
              <p style={{ color:'#065f46', fontWeight:700, fontSize:13, margin:'0 0 3px' }}>🤱 Allaitement maternel exclusif recommandé</p>
              <p style={{ color:'#047857', fontSize:12, margin:0 }}>OMS & MINSANTÉ Cameroun : <strong>exclusif 6 mois</strong>, puis avec alimentation complémentaire jusqu'à <strong>2 ans et au-delà</strong>.</p>
            </div>

            {/* Bénéfices */}
            <div style={{ background:'white', borderRadius:14, padding:'14px', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
              <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:13, margin:'0 0 10px' }}>✅ Pourquoi allaiter ?</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['👶 Pour bébé',['Anticorps et immunité','Développement cérébral','Prévention diarrhée, otites','Lait gratuit, stérile, chaud']],['👩 Pour la mère',['Retour en forme plus vite','Réduit risque cancer sein','Contraception naturelle','Économise l\'argent']]].map(([t,items])=>(
                  <div key={t} style={{ background:'#f0fdf4', borderRadius:10, padding:'10px' }}>
                    <p style={{ fontWeight:700, color:'#065f46', fontSize:12, margin:'0 0 6px' }}>{t}</p>
                    {items.map((it,j)=><div key={j} style={{ color:'#166534', fontSize:11, marginBottom:3 }}>• {it}</div>)}
                  </div>
                ))}
              </div>
            </div>

            {/* Technique */}
            <div style={{ background:'white', borderRadius:14, padding:'14px', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
              <p style={{ fontWeight:700, color:'#92400e', fontSize:13, margin:'0 0 10px' }}>🤱 Technique correcte — Étape par étape</p>
              {ALLAIT_STEPS.map((s,i)=>(
                <div key={i} style={{ display:'flex', gap:10, marginBottom:i<5?10:0 }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background:'#d97706', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#92400e', fontSize:12, marginBottom:2 }}>{s.t}</div>
                    <p style={{ color:'#555', fontSize:11, margin:0, lineHeight:1.5 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Problèmes fréquents */}
            <div style={{ background:'white', borderRadius:14, padding:'14px', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
              <p style={{ fontWeight:700, color:'#7c3aed', fontSize:13, margin:'0 0 10px' }}>🛠️ Problèmes fréquents</p>
              {[
                {p:'Crevasses / Mamelons douloureux', s:'Corriger la position de succion. Appliquer lait maternel. Consulter sage-femme si douleur persiste.', u:false},
                {p:'Engorgement mammaire', s:'Tétées fréquentes. Massage doux. Compresse tiède avant, froide après. Ne PAS arrêter l\'allaitement.', u:false},
                {p:'Mastite (sein rouge, chaud + fièvre)', s:'Continuer à allaiter. Consulter médecin rapidement — antibiotiques souvent nécessaires.', u:true},
                {p:'Abcès du sein', s:'URGENCE CHIRURGICALE. Ne pas drainer seul. Consulter chirurgien immédiatement.', u:true},
              ].map((p,i)=>(
                <div key={i} style={{ borderLeft:`3px solid ${p.u?'#dc2626':'#7c3aed'}`, paddingLeft:10, marginBottom:i<3?10:0 }}>
                  <div style={{ fontWeight:700, color:p.u?'#dc2626':'#7c3aed', fontSize:12, marginBottom:2 }}>{p.u&&'🚨 '}{p.p}</div>
                  <p style={{ color:'#555', fontSize:11, margin:0, lineHeight:1.5 }}>{p.s}</p>
                </div>
              ))}
            </div>

            {/* Contre-indications */}
            <div style={{ background:'#fef2f2', borderRadius:14, padding:'14px', border:'1.5px solid #fecaca' }}>
              <p style={{ fontWeight:700, color:'#dc2626', fontSize:13, margin:'0 0 8px' }}>❌ Contre-indications absolues</p>
              {['Mère VIH+ au Cameroun (sauf accès garantis ARV + eau potable — décision médicale)','Chimiothérapie anticancéreuse active','Traitement radioactif (iode radioactif)','Galactosémie classique chez le nouveau-né','Mère sous drogues dures (héroïne, cocaïne)'].map((c,i)=>(
                <div key={i} style={{ display:'flex', gap:7, marginBottom:5 }}>
                  <span style={{ color:'#dc2626', fontWeight:700, flexShrink:0 }}>✗</span>
                  <span style={{ color:'#7f1d1d', fontSize:11, lineHeight:1.5 }}>{c}</span>
                </div>
              ))}
              <div style={{ background:'white', borderRadius:10, padding:'10px', marginTop:10 }}>
                <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:12, margin:'0 0 6px' }}>✅ PAS contre-indiqué :</p>
                {['Hépatite B (vacciner le nouveau-né à la naissance)','Mastite — continuer à allaiter','Antibiotiques habituels, paracétamol','Covid-19 — le lait contient des anticorps protecteurs'].map((c,i)=>(
                  <div key={i} style={{ display:'flex', gap:7, marginBottom:4 }}>
                    <span style={{ color:'#16a34a', flexShrink:0 }}>✓</span>
                    <span style={{ color:'#444', fontSize:11, lineHeight:1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sevrage */}
            <div style={{ background:'white', borderRadius:14, padding:'14px', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
              <p style={{ fontWeight:700, color:'#0d4a3a', fontSize:13, margin:'0 0 10px' }}>🌱 Sevrage progressif</p>
              {[['#16a34a','0–6 mois','Allaitement EXCLUSIF. Pas d\'eau, jus ni bouillie. Le lait maternel suffit.'],['#d97706','6 mois','Introduire purées, bouillies enrichies, viandes mixées — EN CONTINUANT l\'allaitement'],['#0891b2','6–24 mois','Allaitement + alimentation familiale. L\'OMS recommande 2 ans minimum.']].map(([c,a,d],i)=>(
                <div key={i} style={{ display:'flex', gap:10, marginBottom:i<2?8:0, padding:'9px 10px', background:'#f9fafb', borderRadius:10, borderLeft:`3px solid ${c}` }}>
                  <div style={{ background:c, color:'white', borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:700, alignSelf:'flex-start', whiteSpace:'nowrap', flexShrink:0 }}>{a}</div>
                  <p style={{ color:'#444', fontSize:11, margin:0, lineHeight:1.5 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CONSEILS ── */}
        {tab==='conseils' && (
          <div style={{ animation:'fadeUp .25s ease', display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#fffbeb', borderRadius:14, padding:'12px 14px', border:'1px solid #fde68a' }}>
              <p style={{ color:'#92400e', fontWeight:700, fontSize:13, margin:'0 0 3px' }}>💡 Conseils pour une grossesse saine</p>
              <p style={{ color:'#78350f', fontSize:12, margin:0 }}>Des habitudes simples qui protègent la mère et le bébé tout au long de la grossesse.</p>
            </div>

            {HYGIENE_ITEMS.map((h,i)=>(
              <div key={i} style={{ background:'white', borderRadius:14, padding:'12px 14px', display:'flex', gap:12, alignItems:'flex-start', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ width:38, height:38, borderRadius:11, background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, border:'1px solid #fde68a' }}>{h.icon}</div>
                <div>
                  <p style={{ fontWeight:700, color:'#92400e', fontSize:13, margin:'0 0 3px' }}>{h.t}</p>
                  <p style={{ color:'#555', fontSize:12, margin:0, lineHeight:1.5 }}>{h.d}</p>
                </div>
              </div>
            ))}

            {/* Valise */}
            <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', borderRadius:14, padding:'14px', border:'1.5px solid #fde68a' }}>
              <p style={{ fontWeight:700, color:'#92400e', fontSize:13, margin:'0 0 10px' }}>👜 Valise de maternité — dès S34</p>
              {['📄 Carnet de santé, CNI, résultats examens et échographies','👗 3 tenues amples pour la mère','🧴 Articles de toilette, serviettes post-partum','👶 Vêtements nourrisson (3 sets), couches, couverture','💊 Médicaments prescrits et suppléments','📱 Téléphone chargé + numéros d\'urgence notés'].map((item,i)=>(
                <div key={i} style={{ color:'#78350f', fontSize:12, marginBottom:5 }}>{item}</div>
              ))}
            </div>

            {/* Urgences */}
            <div style={{ background:'linear-gradient(135deg,#7f1d1d,#b91c1c)', borderRadius:14, padding:'14px' }}>
              <p style={{ color:'white', fontWeight:700, fontSize:13, margin:'0 0 10px' }}>🚨 Numéros d'urgence Cameroun</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[['119','SAMU · Urgences médicales'],['117','Police Secours'],['118','Sapeurs-Pompiers'],['1510','Info Santé MINSANTÉ']].map(([n,l])=>(
                  <a key={n} href={`tel:${n}`} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px', textDecoration:'none', textAlign:'center' }}>
                    <div style={{ color:'white', fontWeight:800, fontSize:20, fontFamily:'monospace' }}>{n}</div>
                    <div style={{ color:'rgba(255,255,255,0.7)', fontSize:10, marginTop:2 }}>{l}</div>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background:'#f8fafc', borderRadius:12, padding:'12px 14px', border:'1px solid #e2e8f0' }}>
              <p style={{ color:'#64748b', fontSize:11, margin:0, textAlign:'center', lineHeight:1.7, fontStyle:'italic' }}>
                📚 Informations <strong>à titre éducatif uniquement</strong>. Elles ne remplacent pas l'avis d'un professionnel de santé.<br/>
                Consultez votre <strong>sage-femme, médecin ou gynécologue-obstétricien</strong> pour votre suivi personnalisé.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #f0ebe3', display:'flex', padding:'8px 0 10px', boxShadow:'0 -2px 12px rgba(0,0,0,0.06)', zIndex:50 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'3px 0', border:'none', background:'transparent', cursor:'pointer', color:tab===t.id?'#c2690a':'#c4b5a0', fontWeight:tab===t.id?700:400 }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:9 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
