// @ts-nocheck
'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Calendrier CPN officiel Cameroun (MINSANTÉ / DSF) ─────────────────────
// Source : Direction de la Santé Familiale, Ministère de la Santé Publique du Cameroun
// CPN1 = jusqu'à 14e SA | CPN2 = 2e trimestre | CPN3 = 3e trimestre avant 9e mois | CPN4 = 9e mois obligatoire
const CPN_DATA = [
  {
    numero: 'CPN 1',
    semaines: 'Jusqu\'à la 14e SA incluse — 1er trimestre',
    trimestre: 1,
    examens: [
      { nom: 'Ouverture du dossier obstétrical', objectif: 'Enregistrer les antécédents médicaux, obstétricaux, familiaux et mode de vie' },
      { nom: 'Calcul DDR et terme prévu d\'accouchement', objectif: 'Dater la grossesse (DDR + 9 mois + 7 jours) et fixer le terme prévu' },
      { nom: 'Prise du poids et de la taille', objectif: 'Établir l\'IMC de référence, dépister obésité ou maigreur excessive' },
      { nom: 'Prise de la Tension Artérielle (TA)', objectif: 'Référence de base — TA normale < 140/90 mmHg' },
      { nom: 'Examen général : muqueuses, œdèmes, seins', objectif: 'Dépister anémie clinique, œdèmes précoces, préparer l\'allaitement' },
      { nom: 'Examen obstétrical : hauteur utérine + BCF si audibles', objectif: 'Confirmer grossesse intra-utérine, vitalité fœtale' },
      { nom: 'Groupage sanguin ABO + Rhésus', objectif: 'Dépister incompatibilité fœto-maternelle Rhésus — clé pour PTME et transfusion' },
      { nom: 'Numération Formule Sanguine (NFS)', objectif: 'Dépister anémie (Hb < 11 g/dL), drépanocytose, thrombopénie' },
      { nom: 'Test de dépistage VIH (PTME)', objectif: 'Prévenir Transmission Mère-Enfant du VIH — obligatoire et confidentiel au Cameroun' },
      { nom: 'Sérologie Syphilis (TPHA / RPR)', objectif: 'La syphilis non traitée cause mort fœtale ou malformations graves' },
      { nom: 'Sérologie Hépatite B (AgHBs)', objectif: 'Si positive : vaccination du nouveau-né à la naissance (dans les 12h)' },
      { nom: 'Glycémie à jeun', objectif: 'Dépistage précoce diabète préexistant ou gestationnel' },
      { nom: 'ECBU + bandelette urinaire', objectif: 'Infection urinaire silencieuse → risque accouchement prématuré. Protéinurie = alerte HTA' },
      { nom: 'Goutte épaisse / TDR paludisme', objectif: 'Paludisme endémique au Cameroun — source majeure d\'anémie et de prématurité' },
      { nom: 'TPI 1 — Sulfadoxine-Pyriméthamine (SP)', objectif: 'Traitement Préventif Intermittent du paludisme — 1ère dose dès CPN1 (protocole MINSANTÉ)' },
      { nom: 'Supplémentation Acide Folique 5 mg/j + Fer', objectif: 'Acide folique : prévenir anomalies du tube neural (spina bifida). Fer : prévenir anémie' },
      { nom: 'Remise de la moustiquaire imprégnée (MII)', objectif: 'Protection paludisme toutes les nuits — recommandée tout au long de la grossesse' },
      { nom: 'Éducation pour la Santé (EPS)', objectif: 'Hygiène, alimentation, signes de danger, préparation à l\'accouchement, planification familiale' },
    ],
    conseils: 'Venir dès suspicion de grossesse, idéalement avant 8 SA et au plus tard avant 14 SA. Apporter le carnet de santé maternelle. Arrêter alcool, tabac, automédication. Prendre acide folique dès la conception.',
  },
  {
    numero: 'CPN 2',
    semaines: '2e trimestre — entre 15 SA et 27 SA',
    trimestre: 2,
    examens: [
      { nom: 'Prise du poids et de la TA', objectif: 'Gain pondéral normal : 0,5 à 1 kg/semaine. TA ≥ 140/90 = alerte HTA' },
      { nom: 'Mesure de la Hauteur Utérine (HU)', objectif: 'HU (cm) doit ≈ nombre de SA (ex : 24 cm à 24 SA ± 2 cm). HU < SA - 4 = retard de croissance' },
      { nom: 'Auscultation des Bruits du Cœur Fœtal (BCF)', objectif: 'Normal : 120 à 160 batt/min. Confirme vitalité fœtale' },
      { nom: 'Examen des membres : œdèmes, varices', objectif: 'Œdèmes des membres inférieurs = surveiller. Œdèmes du visage = alarme pré-éclampsie' },
      { nom: 'Bandelette urinaire (protéinurie + glucosurie)', objectif: 'Protéinurie = signe pré-éclampsie. Glucosurie = signe diabète gestationnel' },
      { nom: 'NFS de contrôle', objectif: 'Évaluer efficacité supplémentation en fer. Dépister anémie aggravée ou persistante' },
      { nom: 'Sérologie VIH de contrôle (si CPN1 négative)', objectif: 'Fenêtre sérologique : un 2e test est recommandé pour sécuriser le programme PTME' },
      { nom: 'Goutte épaisse / TDR paludisme (si fièvre ou anémie)', objectif: 'Paludisme au 2e trimestre : risque fausse couche tardive, retard de croissance' },
      { nom: 'TPI 2 — Sulfadoxine-Pyriméthamine (SP)', objectif: '2e dose TPI antipaludéen — intervalle ≥ 4 semaines après TPI 1' },
      { nom: 'VAT 1 — Vaccin Antitétanique', objectif: '1ère dose de vaccin antitétanique — protège mère ET nouveau-né contre tétanos néonatal' },
      { nom: 'Déparasitage — Mébendazole 500 mg (dose unique)', objectif: 'Élimine ankylostomes et vers intestinaux aggravant l\'anémie — prescrit à partir du 2e trimestre uniquement' },
      { nom: 'Supplémentation fer + acide folique (suite)', objectif: 'Continuer jusqu\'au post-partum — besoins augmentent avec le volume sanguin maternel' },
      { nom: 'Échographie morphologique (idéalement S20–S22)', objectif: 'Bilan morphologique fœtal complet, dépistage malformations, localisation placenta, liquide amniotique' },
      { nom: 'Éducation pour la Santé (EPS)', objectif: 'Signes de danger 2e trimestre, mouvements fœtaux, allaitement, planification familiale post-partum' },
    ],
    conseils: 'Revenir au 5e ou 6e mois de grossesse. Dormir chaque nuit sous moustiquaire. Signaler immédiatement tout saignement, douleur abdominale, fièvre ou absence de mouvements fœtaux.',
  },
  {
    numero: 'CPN 3',
    semaines: '3e trimestre — entre 28 SA et avant le 9e mois (avant 36 SA)',
    trimestre: 3,
    examens: [
      { nom: 'Prise du poids et de la TA (systématique)', objectif: 'Prise de poids > 1 kg/semaine + TA ≥ 140/90 = suspicion pré-éclampsie — surveiller en urgence' },
      { nom: 'Mesure de la Hauteur Utérine (HU)', objectif: 'Dépister retard de croissance (HU < SA - 4 cm) ou macrosomie fœtale' },
      { nom: 'Auscultation BCF + évaluation mouvements actifs fœtaux', objectif: 'Bébé doit bouger ≥ 10 fois par jour après 28 SA. Absence = urgence obstétricale' },
      { nom: 'Palper abdominal : présentation fœtale (4 manœuvres de Léopold)', objectif: 'Vérifier présentation céphalique (tête en bas). Si siège ou transverse → orienter maternité de référence' },
      { nom: 'Bandelette urinaire (protéinurie)', objectif: 'Protéinurie + HTA au 3e trimestre = pré-éclampsie — hospitalisation immédiate requise' },
      { nom: 'Examen des œdèmes (visage, mains, pieds)', objectif: 'Œdèmes du visage et des mains = signe d\'alerte pré-éclampsie sévère' },
      { nom: 'NFS + groupage sanguin (bilan d\'accouchement)', objectif: 'Préparer éventuelle transfusion à l\'accouchement — compléter le dossier' },
      { nom: 'Dépistage diabète gestationnel — HGPO 75g', objectif: 'Test de référence si non réalisé ou glycémie borderline — glycémie 0h, 1h, 2h après charge glucosée' },
      { nom: 'Sérologie VIH de contrôle', objectif: 'Dernier test avant accouchement — permettre PTME immédiate si nouvelle positivité' },
      { nom: 'Goutte épaisse / TDR paludisme (si symptômes)', objectif: 'Paludisme au 3e trimestre : accouchement prématuré, anémie sévère, petit poids de naissance' },
      { nom: 'TPI 3 — Sulfadoxine-Pyriméthamine (SP)', objectif: '3e dose TPI si ≥ 4 semaines après TPI 2 — dernière dose recommandée' },
      { nom: 'VAT 2 — Vaccin Antitétanique (4 semaines après VAT 1)', objectif: 'Immunité complète après 2 doses — protection dure 3 ans. Rappel VAT 3 à la prochaine grossesse' },
      { nom: 'Supplémentation Fer + Acide Folique + Calcium 1,5 g/j', objectif: 'Calcium au 3e trimestre : réduit risque pré-éclampsie et assure ossification fœtale' },
      { nom: 'Éducation pour la Santé — préparation à l\'accouchement', objectif: 'Identifier maternité, organiser transport, accompagnant. Reconnaître signes début de travail' },
    ],
    conseils: 'Revenir au 8e mois. Préparer la valise de maternité. Avoir un moyen de transport disponible 24h/24. Identifier un accompagnant. Compter les mouvements de bébé chaque jour (≥ 10/jour).',
  },
  {
    numero: 'CPN 4',
    semaines: '9e mois — à partir de 36 SA — OBLIGATOIRE',
    trimestre: 3,
    examens: [
      { nom: 'Prise du poids et de la TA', objectif: 'Surveillance maximale — risque le plus élevé de pré-éclampsie et d\'éclampsie au 9e mois' },
      { nom: 'Mesure finale de la Hauteur Utérine', objectif: 'Estimation clinique du volume fœtal, cohérence avec le terme' },
      { nom: 'Auscultation BCF', objectif: 'Dernière confirmation vitalité fœtale avant accouchement' },
      { nom: 'Présentation + engagement fœtal (4 manœuvres de Léopold)', objectif: 'Confirmer présentation céphalique engagée. Si siège persistant → césarienne programmée' },
      { nom: 'Bandelette urinaire (protéinurie finale)', objectif: 'Dernière vérification avant accouchement — aucun signe pré-éclampsie non détecté' },
      { nom: 'Pelvimétrie clinique (si indiquée)', objectif: 'Évaluer dimensions du bassin. Décider voie d\'accouchement : voie basse ou césarienne' },
      { nom: 'Toucher vaginal (si indiqué)', objectif: 'Apprécier maturité cervicale, engagement fœtal, signes de travail imminent (score de Bishop)' },
      { nom: 'Bilan pré-opératoire (si césarienne prévue)', objectif: 'NFS, groupage-Rhésus, TP-TCA, ECG — préparer le bloc opératoire en sécurité' },
      { nom: 'Sérologie VIH finale (si résultats antérieurs absents)', objectif: 'Toute parturiente sans statut VIH connu doit être testée à l\'arrivée en salle de travail — PTME d\'urgence si positive' },
      { nom: 'VAT de rappel (si schéma incomplet)', objectif: 'Compléter immunisation si VAT 1 et/ou VAT 2 non reçus lors des CPN précédentes' },
      { nom: 'Remise du dossier obstétrical complet à la maternité', objectif: 'Tous les examens, sérologies, CPN précédentes doivent être disponibles pour la sage-femme/médecin accoucheur' },
      { nom: 'Plan d\'accouchement formalisé avec la femme', objectif: 'Confirmer maternité, noter numéro d\'urgence 119, organiser transport 24h/24, accompagnant désigné' },
      { nom: 'Éducation sur les signes de travail et urgences', objectif: 'Contractions régulières + rapprochées, rupture de la poche des eaux, saignements = aller immédiatement en maternité' },
    ],
    conseils: 'La CPN4 est OBLIGATOIRE — ne jamais la manquer. Rester à proximité de la maternité. Aller en urgence si : contractions toutes les 5 min, perte des eaux, saignements abondants, bébé ne bouge plus. APPELER LE 119 EN CAS D\'URGENCE.',
  },
]

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
