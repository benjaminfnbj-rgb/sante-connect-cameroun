import Link from 'next/link'
import { CheckCircle, ArrowLeft, ArrowRight, Star } from 'lucide-react'

export default function TarifsPage() {
  const patientFeatures = [
    'Prise de rendez-vous en ligne',
    'Commande de médicaments',
    'Livraison à domicile',
    'Suivi du cycle menstruel',
    'Assistant IA Santé',
    'Annuaire des urgences',
    'Kit santé mensuel (préservatifs)',
    'Serviettes hygiéniques (femmes <50 ans)',
    'Accès aux offres d\'assurance',
    'Historique de rendez-vous',
  ]

  const proFeatures = [
    'Profil public vérifié (KYC Pro)',
    'Gestion des disponibilités',
    'Agenda des rendez-vous',
    'Système d\'avis patients',
    'Statistiques de réputation',
    'Notifications automatiques',
    'Support prioritaire',
  ]

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream)'}}>
      <div className="py-4 px-4 sticky top-0 z-40" style={{background: 'white', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/"><ArrowLeft size={20} style={{color: 'var(--text-muted)'}} /></Link>
          <span className="font-bold text-lg" style={{fontFamily: 'Fraunces, serif'}}>Tarifs & Abonnements</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{background: '#f0fdf4', color: 'var(--green-deep)'}}>
            🎁 1 mois d'essai gratuit pour tous
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{fontFamily: 'Fraunces, serif'}}>Des tarifs accessibles à tous les Camerounais</h1>
          <p className="text-lg" style={{color: 'var(--text-muted)'}}>Des plans transparents, sans frais cachés</p>
        </div>

        {/* Patient plans */}
        <h2 className="text-2xl font-bold mb-6" style={{fontFamily: 'Fraunces, serif'}}>Pour les patients</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl" style={{background: 'white', border: '1px solid var(--border)'}}>
            <p className="font-semibold mb-1" style={{color: 'var(--text-muted)'}}>Essai gratuit</p>
            <p className="text-4xl font-bold mb-1" style={{fontFamily: 'Fraunces, serif'}}>0 FCFA</p>
            <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>Pendant 1 mois complet</p>
            <div className="space-y-2 mb-6">
              {patientFeatures.slice(0,5).map((f,i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{color: 'var(--green-mid)'}} /> {f}
                </div>
              ))}
            </div>
            <Link href="/inscription" className="block text-center py-3 rounded-xl font-semibold" style={{background: 'var(--bg-cream)', color: 'var(--text-dark)'}}>
              Commencer gratuit
            </Link>
          </div>

          <div className="p-6 rounded-2xl relative" style={{background: 'var(--green-deep)', border: '2px solid var(--green-mid)'}}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{background: 'var(--yellow-accent)', color: '#1a1a2e'}}>
              ⭐ Recommandé
            </div>
            <p className="font-semibold mb-1 text-green-300">Mensuel</p>
            <p className="text-4xl font-bold mb-1 text-white" style={{fontFamily: 'Fraunces, serif'}}>1 000</p>
            <p className="text-sm mb-6 text-green-300">FCFA par mois</p>
            <div className="space-y-2 mb-6">
              {patientFeatures.map((f,i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-green-100">
                  <CheckCircle size={15} style={{color: 'var(--green-light)'}} /> {f}
                </div>
              ))}
            </div>
            <Link href="/inscription" className="block text-center py-3 rounded-xl font-bold" style={{background: 'var(--yellow-accent)', color: '#1a1a2e'}}>
              S'abonner maintenant <ArrowRight size={16} className="inline" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl" style={{background: 'white', border: '1px solid var(--border)'}}>
            <p className="font-semibold mb-1" style={{color: 'var(--text-muted)'}}>Annuel</p>
            <p className="text-4xl font-bold mb-1" style={{fontFamily: 'Fraunces, serif'}}>10 000</p>
            <p className="text-sm mb-1" style={{color: 'var(--text-muted)'}}>FCFA par an</p>
            <p className="text-xs mb-6 px-2 py-1 rounded-full inline-block font-semibold" style={{background: '#dcfce7', color: 'var(--green-deep)'}}>2 mois offerts</p>
            <div className="space-y-2 mb-6">
              {patientFeatures.map((f,i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{color: 'var(--green-mid)'}} /> {f}
                </div>
              ))}
            </div>
            <Link href="/inscription" className="block text-center py-3 rounded-xl font-semibold text-white" style={{background: 'var(--green-mid)'}}>
              S'abonner annuellement
            </Link>
          </div>
        </div>

        {/* Professional plans */}
        <h2 className="text-2xl font-bold mb-6" style={{fontFamily: 'Fraunces, serif'}}>Pour les professionnels</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl" style={{background: 'white', border: '2px solid #bbf7d0'}}>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{background: '#dcfce7', color: 'var(--green-deep)'}}>
              🏥 Structures publiques
            </div>
            <p className="text-4xl font-bold mb-2" style={{fontFamily: 'Fraunces, serif', color: 'var(--green-deep)'}}>GRATUIT</p>
            <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>Accès entièrement gratuit pour les structures sanitaires publiques, sous vérification de documents officiels.</p>
            <div className="space-y-2 mb-6">
              {proFeatures.map((f,i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{color: 'var(--green-mid)'}} /> {f}
                </div>
              ))}
            </div>
            <Link href="/professionnels/inscription" className="block text-center py-3 rounded-xl font-semibold text-white" style={{background: 'var(--green-deep)'}}>
              S'inscrire gratuitement
            </Link>
          </div>
          
          <div className="p-6 rounded-2xl" style={{background: 'white', border: '1px solid var(--border)'}}>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{background: '#fffbeb', color: '#92400e'}}>
              💼 Acteurs privés
            </div>
            <p className="text-sm mb-2 font-medium">Cliniques, pharmacies, assurances, ONG, médecins privés</p>
            <p className="text-3xl font-bold mb-1" style={{fontFamily: 'Fraunces, serif'}}>Sur devis</p>
            <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>Abonnement mensuel ou annuel selon le type de structure et le volume d'activité.</p>
            <div className="space-y-2 mb-6">
              {proFeatures.map((f,i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} style={{color: 'var(--green-mid)'}} /> {f}
                </div>
              ))}
            </div>
            <Link href="/contact" className="block text-center py-3 rounded-xl font-semibold" style={{background: 'var(--bg-cream)', color: 'var(--text-dark)'}}>
              Nous contacter
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl text-center" style={{background: '#fef2f2', border: '1px solid #fecaca'}}>
          <p className="font-semibold" style={{color: '#dc2626'}}>🚨 Les numéros d'urgence sont toujours accessibles gratuitement, même sans abonnement</p>
        </div>
      </div>
    </div>
  )
}
