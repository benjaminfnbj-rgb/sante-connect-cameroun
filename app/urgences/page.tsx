// @ts-nocheck
import Link from 'next/link'
import { Phone, ArrowLeft, AlertTriangle, Heart, Flame, Shield } from 'lucide-react'

const urgences = [
  { name: 'SAMU', number: '15', category: 'medical', icon: Heart, color: '#dc2626', bg: '#fee2e2', desc: 'Service d\'Aide Médicale Urgente — Urgences médicales' },
  { name: 'Sapeurs-Pompiers', number: '18', category: 'fire', icon: Flame, color: '#ea580c', bg: '#ffedd5', desc: 'Pompiers et secours — Incendies et accidents' },
  { name: 'Police Nationale', number: '17', category: 'police', icon: Shield, color: '#1d4ed8', bg: '#dbeafe', desc: 'Police nationale du Cameroun' },
  { name: 'Gendarmerie Nationale', number: '113', category: 'police', icon: Shield, color: '#1d4ed8', bg: '#dbeafe', desc: 'Gendarmerie — Zones rurales et semi-urbaines' },
  { name: 'Hôpital Central de Yaoundé', number: '+237 222 23 40 27', category: 'hospital', icon: Heart, color: '#059669', bg: '#d1fae5', desc: 'Principal hôpital de la capitale' },
  { name: 'CHU de Yaoundé', number: '+237 222 31 36 94', category: 'hospital', icon: Heart, color: '#059669', bg: '#d1fae5', desc: 'Centre Hospitalier Universitaire de Yaoundé' },
  { name: 'Hôpital Général de Douala', number: '+237 233 42 77 77', category: 'hospital', icon: Heart, color: '#059669', bg: '#d1fae5', desc: 'Principal hôpital économique' },
  { name: 'Croix-Rouge Cameroun', number: '+237 222 22 05 57', category: 'ngo', icon: Heart, color: '#dc2626', bg: '#fee2e2', desc: 'Aide humanitaire d\'urgence' },
  { name: 'Anti-Poison', number: '+237 222 23 40 27', category: 'medical', icon: AlertTriangle, color: '#d97706', bg: '#fef3c7', desc: 'Intoxications et empoisonnements' },
  { name: 'Urgences Pédiatriques', number: '+237 222 20 09 35', category: 'medical', icon: Heart, color: '#dc2626', bg: '#fee2e2', desc: 'Urgences pour enfants' },
]

export default function UrgencesPage() {
  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream)'}}>
      <div className="sticky top-0 z-50 py-4 px-4" style={{background: '#dc2626'}}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white font-semibold">
            <ArrowLeft size={20} /> Retour
          </Link>
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <AlertTriangle size={20} /> Numéros d'Urgence
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="p-6 rounded-2xl mb-8 text-white text-center" style={{background: '#dc2626'}}>
          <p className="text-2xl font-bold" style={{fontFamily: 'Fraunces, serif'}}>🚨 En cas d'urgence vitale</p>
          <p className="mt-2 text-white/80">Ces numéros sont disponibles 24h/24 et 7j/7, même sans abonnement</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="tel:15" className="flex flex-col items-center p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.2)'}}>
              <span className="text-3xl font-bold">15</span>
              <span className="text-sm">SAMU</span>
            </a>
            <a href="tel:18" className="flex flex-col items-center p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.2)'}}>
              <span className="text-3xl font-bold">18</span>
              <span className="text-sm">Pompiers</span>
            </a>
            <a href="tel:17" className="flex flex-col items-center p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.2)'}}>
              <span className="text-3xl font-bold">17</span>
              <span className="text-sm">Police</span>
            </a>
            <a href="tel:113" className="flex flex-col items-center p-4 rounded-xl" style={{background: 'rgba(255,255,255,0.2)'}}>
              <span className="text-3xl font-bold">113</span>
              <span className="text-sm">Gendarmerie</span>
            </a>
          </div>
        </div>

        <div className="space-y-3">
          {urgences.map((u, i) => {
            const Icon = u.icon
            return (
              <a key={i} href={`tel:${u.number.replace(/\s/g, '')}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card-hover"
                style={{background: 'white', border: '1px solid var(--border)', textDecoration: 'none'}}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background: u.bg}}>
                  <Icon size={24} style={{color: u.color}} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{color: 'var(--text-dark)'}}>{u.name}</p>
                  <p className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>{u.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg" style={{color: u.color}}>{u.number}</span>
                  <Phone size={18} style={{color: u.color}} />
                </div>
              </a>
            )
          })}
        </div>

        <div className="mt-8 p-5 rounded-2xl text-center" style={{background: '#f0fdf4', border: '1px solid #bbf7d0'}}>
          <p className="text-sm font-medium" style={{color: 'var(--green-deep)'}}>
            ✅ Ces numéros sont accessibles gratuitement, même sans abonnement Santé Connect
          </p>
        </div>
      </div>
    </div>
  )
}
