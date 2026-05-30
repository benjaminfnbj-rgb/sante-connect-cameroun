import Link from 'next/link'

export default function CGUPage() {
  const S = { h2: { color:'#0d4a3a', fontSize:15, fontWeight:700, margin:'20px 0 8px', fontFamily:'Georgia,serif' } as React.CSSProperties,
               p: { color:'#555', fontSize:13, lineHeight:1.7, margin:'0 0 10px' } as React.CSSProperties }
  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fa', fontFamily:'sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#0a2e22,#0d4a3a)', padding:'20px 16px 28px' }}>
        <Link href="/" style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontSize:13 }}>← Retour</Link>
        <h1 style={{ color:'white', fontSize:20, fontWeight:800, margin:'12px 0 0' }}>Conditions Générales d'Utilisation</h1>
      </div>
      <div style={{ maxWidth:560, margin:'0 auto', padding:'20px 16px 40px' }}>
        <div style={{ background:'white', borderRadius:18, padding:'20px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>

          <h2 style={S.h2}>1. Acceptation des conditions</h2>
          <p style={S.p}>En utilisant Santé Connect Cameroun, vous acceptez les présentes CGU. Si vous n'acceptez pas ces conditions, n'utilisez pas l'application.</p>

          <h2 style={S.h2}>2. Description du service</h2>
          <p style={S.p}>Santé Connect est une plateforme numérique de santé qui permet de :<br/>• Trouver et contacter des professionnels de santé vérifiés<br/>• Accéder à des informations éducatives sur la santé<br/>• Commander des médicaments auprès de pharmacies partenaires<br/>• Suivre son cycle menstruel et sa grossesse</p>

          <h2 style={S.h2}>3. Abonnement et paiement</h2>
          <p style={S.p}>• 1 mois d'essai gratuit pour tout nouveau compte<br/>• L'abonnement est renouvelé automatiquement chaque mois<br/>• Résiliation possible à tout moment, sans frais<br/>• En cas de non-paiement, le profil professionnel est suspendu jusqu'au renouvellement<br/>• Les urgences restent accessibles gratuitement en toutes circonstances</p>

          <h2 style={S.h2}>4. Obligations des utilisateurs</h2>
          <p style={S.p}>Vous vous engagez à :<br/>• Fournir des informations exactes lors de l'inscription<br/>• Ne pas usurper l'identité d'un professionnel de santé<br/>• Ne pas utiliser la plateforme à des fins illicites<br/>• Respecter la vie privée des autres utilisateurs</p>

          <h2 style={S.h2}>5. Obligations des professionnels</h2>
          <p style={S.p}>Tout professionnel inscrit certifie :<br/>• Détenir les diplômes et agréments requis par la loi camerounaise<br/>• Être inscrit à l'Ordre professionnel correspondant<br/>• Exercer légalement sur le territoire camerounais</p>

          <h2 style={S.h2}>6. Informations médicales</h2>
          <p style={S.p}>Les informations de santé sur la plateforme sont <strong>à titre éducatif uniquement</strong>. Elles ne constituent pas un avis médical. Santé Connect décline toute responsabilité pour les décisions médicales prises sur la base de ces informations.</p>

          <h2 style={S.h2}>7. Suspension de compte</h2>
          <p style={S.p}>Santé Connect se réserve le droit de suspendre tout compte en cas de :<br/>• Fausse déclaration de diplômes ou agréments<br/>• Comportement frauduleux<br/>• Violation des présentes CGU</p>

          <h2 style={S.h2}>8. Droit applicable</h2>
          <p style={S.p}>Les présentes CGU sont régies par le droit camerounais. Tout litige relève de la compétence des tribunaux de Yaoundé, Cameroun.</p>

          <p style={{ color:'#aaa', fontSize:11, marginTop:20, textAlign:'center' }}>Dernière mise à jour : Mai 2026</p>
        </div>
        <div style={{ marginTop:12, textAlign:'center' }}>
          <Link href="/mentions-legales" style={{ color:'#0d4a3a', fontSize:13, fontWeight:700, textDecoration:'none' }}>← Mentions légales</Link>
        </div>
      </div>
    </div>
  )
}
