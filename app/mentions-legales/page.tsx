import Link from 'next/link'

export default function MentionsLegalesPage() {
  const S = { h2: { color:'#0d4a3a', fontSize:15, fontWeight:700, margin:'20px 0 8px', fontFamily:'Georgia,serif' } as React.CSSProperties,
               p: { color:'#555', fontSize:13, lineHeight:1.7, margin:'0 0 10px' } as React.CSSProperties }
  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0a2e22,#0d4a3a)', padding:'20px 16px 28px' }}>
        <Link href="/" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13 }}>← Retour</Link>
        <h1 style={{ color:'white', fontSize:20, fontWeight:800, margin:'12px 0 0' }}>Mentions Légales</h1>
      </div>
      <div style={{ maxWidth:560, margin:'0 auto', padding:'20px 16px 40px' }}>
        <div style={{ background:'white', borderRadius:18, padding:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>

          <h2 style={S.h2}>1. Éditeur de l'application</h2>
          <p style={S.p}><strong>Santé Connect Cameroun</strong><br/>Application de mise en relation santé numérique<br/>Cameroun</p>

          <h2 style={S.h2}>2. Hébergement</h2>
          <p style={S.p}>L'application est hébergée par <strong>Vercel Inc.</strong> — 340 Pine Street, San Francisco, CA 94104, États-Unis.<br/>Base de données hébergée par <strong>Supabase</strong>.</p>

          <h2 style={S.h2}>3. Nature du service</h2>
          <p style={S.p}>Santé Connect Cameroun est une <strong>plateforme d'intermédiation</strong> qui met en relation des professionnels de santé vérifiés et des patients. Elle ne pratique pas d'actes médicaux et ne remplace en aucun cas une consultation médicale.</p>

          <h2 style={S.h2}>4. Données personnelles</h2>
          <p style={S.p}>Conformément à la <strong>Loi camerounaise n°2010/012</strong> relative à la cybersécurité et à la cybercriminalité, et au <strong>RGPD</strong> pour les utilisateurs européens :</p>
          <p style={S.p}>• Les données collectées sont : nom, email, téléphone, région, ville.<br/>• <strong>Aucune donnée médicale</strong> n'est stockée par la plateforme.<br/>• Les données ne sont jamais vendues à des tiers.<br/>• Vous pouvez demander la suppression de votre compte à tout moment.</p>

          <h2 style={S.h2}>5. Secret médical</h2>
          <p style={S.p}>Santé Connect agit uniquement comme intermédiaire de mise en relation. La plateforme <strong>ne stocke, ne traite et ne gère aucun dossier médical</strong>. Le secret médical est assuré directement entre le patient et le professionnel de santé.</p>

          <h2 style={S.h2}>6. Limitation de responsabilité</h2>
          <p style={S.p}>Les informations de santé disponibles sur la plateforme sont fournies à titre <strong>éducatif uniquement</strong>. Santé Connect ne peut être tenu responsable des décisions prises sur la base de ces informations. Consultez toujours un professionnel de santé qualifié.</p>

          <h2 style={S.h2}>7. Propriété intellectuelle</h2>
          <p style={S.p}>L'ensemble du contenu de l'application (textes, design, code) est la propriété exclusive de Santé Connect Cameroun. Toute reproduction est interdite sans autorisation.</p>

          <h2 style={S.h2}>8. Contact</h2>
          <p style={S.p}>Pour toute question : <strong>contact@santeconnect.cm</strong></p>

          <p style={{ color:'#aaa', fontSize:11, marginTop:20, textAlign:'center' }}>Dernière mise à jour : Mai 2026</p>
        </div>
        <div style={{ marginTop:12, textAlign:'center' }}>
          <Link href="/cgu" style={{ color:'#0d4a3a', fontSize:13, fontWeight:700, textDecoration:'none' }}>Voir les CGU →</Link>
        </div>
      </div>
    </div>
  )
}
