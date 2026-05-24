'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex" style={{background: 'var(--bg-cream)'}}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white" style={{background: 'linear-gradient(135deg, #0a5c36 0%, #1a8a56 100%)'}}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 font-bold text-lg">SC</div>
          <span className="font-bold text-xl" style={{fontFamily: 'Fraunces, serif'}}>Santé Connect</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Fraunces, serif'}}>Votre santé, notre priorité</h2>
          <p className="text-lg opacity-80">Accédez à des milliers de professionnels de santé vérifiés partout au Cameroun.</p>
        </div>
        <div className="p-6 rounded-2xl" style={{background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)'}}>
          <p className="text-sm opacity-80 mb-1">🚨 Urgences toujours accessibles</p>
          <p className="font-semibold">SAMU: 15 · Pompiers: 18 · Police: 17</p>
        </div>
      </div>
      
      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{color: 'var(--text-muted)'}}>
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{fontFamily: 'Fraunces, serif'}}>Connexion</h1>
          <p className="mb-8" style={{color: 'var(--text-muted)'}}>Bienvenue ! Entrez vos identifiants pour continuer.</p>
          
          {error && (
            <div className="p-4 rounded-xl mb-6 text-sm" style={{background: '#fee2e2', color: '#dc2626'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{background: 'white', border: '2px solid var(--border)', fontSize: '0.95rem'}}
                onFocus={e => e.target.style.borderColor = 'var(--green-mid)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all"
                  style={{background: 'white', border: '2px solid var(--border)', fontSize: '0.95rem'}}
                  onFocus={e => e.target.style.borderColor = 'var(--green-mid)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{color: 'var(--text-muted)'}}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link href="/mot-de-passe-oublie" className="text-sm" style={{color: 'var(--green-mid)'}}>Mot de passe oublié ?</Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{background: loading ? 'var(--green-mid)' : 'var(--green-deep)', opacity: loading ? 0.7 : 1}}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm" style={{color: 'var(--text-muted)'}}>
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="font-semibold" style={{color: 'var(--green-mid)'}}>Créer un compte gratuit</Link>
          </p>
          
          <div className="mt-6 p-4 rounded-xl text-center" style={{background: '#fee2e2'}}>
            <p className="text-sm font-semibold" style={{color: '#dc2626'}}>🚨 Urgence médicale ?</p>
            <p className="text-sm mt-1" style={{color: '#dc2626'}}>Appelez le SAMU : <strong>15</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
