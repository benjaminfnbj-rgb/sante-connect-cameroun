'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data, error } = await createClient().auth.signInWithPassword({ email, password })
      if (error) throw error
      // Get profile to redirect appropriately
      const { data: profile } = await createClient().from('profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'professional' || profile?.role === 'pharmacy') {
        router.push('/dashboard/professional')
      } else {
        router.push('/dashboard/patient')
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, width: '100%', maxWidth: 440, boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>🏥</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a' }}>Connexion</h1>
          <p style={{ color: '#5a7a6e', fontSize: 15, marginTop: 6 }}>Bienvenue sur Santé Connect Cameroun</p>
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', fontSize: 14, marginBottom: 8 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
              placeholder="votre@email.com" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', fontSize: 14, marginBottom: 8 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '13px 16px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '15px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 16, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: '#5a7a6e', fontSize: 14 }}>
          Pas encore de compte ? <Link href="/auth/register" style={{ color: '#2eb87a', fontWeight: 600, textDecoration: 'none' }}>S'inscrire gratuitement</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
          <Link href="/" style={{ color: '#5a7a6e', fontSize: 13, textDecoration: 'none' }}>← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  )
}
