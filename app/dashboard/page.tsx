// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, Pill, Shield, Phone, Heart, Bot, 
  Bell, User, LogOut, Package, ChevronRight,
  Clock, CheckCircle, AlertTriangle
} from 'lucide-react'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-cream)'}}>
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{borderColor: 'var(--green-mid)', borderTopColor: 'transparent'}} />
    </div>
  )

  const quickLinks = [
    { icon: Calendar, label: 'Rendez-vous', href: '/rendez-vous', color: '#1a8a56', bg: '#f0fdf4' },
    { icon: Pill, label: 'Pharmacie', href: '/pharmacie', color: '#2563eb', bg: '#eff6ff' },
    { icon: Shield, label: 'Assurances', href: '/assurances', color: '#7c3aed', bg: '#f5f3ff' },
    { icon: Heart, label: 'Cycle', href: '/sante-feminine', color: '#db2777', bg: '#fdf2f8' },
    { icon: Bot, label: 'Assistant IA', href: '/assistant', color: '#d97706', bg: '#fffbeb' },
    { icon: Phone, label: 'Urgences', href: '/urgences', color: '#dc2626', bg: '#fef2f2' },
    { icon: Package, label: 'Mon kit santé', href: '/kit-sante', color: '#059669', bg: '#ecfdf5' },
    { icon: User, label: 'Mon profil', href: '/profil', color: '#6b7280', bg: '#f9fafb' },
  ]

  const isTrialing = profile?.subscription_status === 'trial'
  const trialEnd = profile?.subscription_end ? new Date(profile.subscription_end) : null
  const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000*60*60*24)) : 0

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream)'}}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{background: 'white', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>Bonjour,</p>
            <p className="font-bold text-lg" style={{fontFamily: 'Fraunces, serif', color: 'var(--text-dark)'}}>{profile?.full_name || 'Utilisateur'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'var(--bg-cream)'}}>
              <Bell size={20} style={{color: 'var(--text-muted)'}} />
            </Link>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'var(--bg-cream)'}}>
              <LogOut size={20} style={{color: 'var(--text-muted)'}} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Trial banner */}
        {isTrialing && daysLeft > 0 && (
          <div className="p-4 rounded-2xl mb-6 flex items-center justify-between" style={{background: '#fffbeb', border: '1px solid #fde68a'}}>
            <div className="flex items-center gap-3">
              <Clock size={20} style={{color: '#d97706'}} />
              <div>
                <p className="font-semibold text-sm" style={{color: '#92400e'}}>Essai gratuit en cours</p>
                <p className="text-xs" style={{color: '#b45309'}}>{daysLeft} jour(s) restant(s)</p>
              </div>
            </div>
            <Link href="/tarifs" className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{background: '#d97706'}}>
              S'abonner
            </Link>
          </div>
        )}

        {/* Subscription status */}
        <div className="p-5 rounded-2xl mb-6" style={{background: 'linear-gradient(135deg, #0a5c36, #1a8a56)', color: 'white'}}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Statut abonnement</p>
              <p className="text-xl font-bold mt-1" style={{fontFamily: 'Fraunces, serif'}}>
                {profile?.subscription_status === 'active' ? '✅ Actif' :
                 profile?.subscription_status === 'trial' ? '🎁 Essai gratuit' :
                 profile?.subscription_status === 'expired' ? '⚠️ Expiré' : '—'}
              </p>
              {profile?.subscription_end && (
                <p className="text-sm opacity-70 mt-1">
                  Jusqu'au {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
            <Link href="/tarifs" className="px-4 py-2 rounded-xl text-xs font-semibold" style={{background: 'rgba(255,255,255,0.2)'}}>
              {profile?.subscription_status === 'active' ? 'Gérer' : 'S\'abonner'}
            </Link>
          </div>
        </div>

        {/* Quick access */}
        <h2 className="font-bold text-lg mb-4" style={{fontFamily: 'Fraunces, serif'}}>Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {quickLinks.map((link, i) => {
            const Icon = link.icon
            return (
              <Link key={i} href={link.href}
                className="p-4 rounded-2xl flex flex-col items-center gap-2 text-center bg-card-hover"
                style={{background: 'white', border: '1px solid var(--border)', textDecoration: 'none'}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: link.bg}}>
                  <Icon size={20} style={{color: link.color}} />
                </div>
                <span className="text-xs font-medium" style={{color: 'var(--text-dark)'}}>{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Emergency */}
        <div className="p-5 rounded-2xl" style={{background: '#fef2f2', border: '1px solid #fecaca'}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} style={{color: '#dc2626'}} />
              <span className="font-bold" style={{color: '#dc2626'}}>Numéros d'urgence</span>
            </div>
            <Link href="/urgences" className="text-xs font-medium" style={{color: '#dc2626'}}>Voir tous <ChevronRight size={14} className="inline" /></Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[{n:'15', l:'SAMU'},{n:'18', l:'Pompiers'},{n:'17', l:'Police'},{n:'1730', l:'Gendarmerie'}].map((u,i) => (
              <a key={i} href={`tel:${u.n}`} className="text-center py-2 rounded-xl" style={{background: 'white'}}>
                <p className="font-bold text-lg" style={{color: '#dc2626'}}>{u.n}</p>
                <p className="text-xs" style={{color: 'var(--text-muted)'}}>{u.l}</p>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
