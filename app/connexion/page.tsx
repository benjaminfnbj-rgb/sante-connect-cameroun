'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConnexionForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    // Session établie côté client → naviguer directement sans attendre le proxy
    // window.location.href est plus rapide que router.push car il recharge la page
    // et s'assure que les cookies de session sont bien envoyés avec la requête suivante
    window.location.href = redirect
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a,#1a7a5e)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
      
      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ width:68, height:68, background:'rgba(255,255,255,0.12)', backdropFilter:'blur(20px)', borderRadius:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 12px', border:'1.5px solid rgba(255,255,255,0.2)', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>🏥</div>
        <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:22, fontWeight:700, margin:'0 0 3px' }}>Santé Connect Cameroun</h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, fontFamily:'sans-serif' }}>Votre santé, connectée au Cameroun</p>
      </div>

      {/* Card */}
      <div style={{ background:'white', borderRadius:28, padding:'32px 28px', boxShadow:'0 24px 60px rgba(0,0,0,0.3)', width:'100%', maxWidth:400 }}>
        <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:24, fontWeight:700, margin:'0 0 4px' }}>Connexion</h2>
        <p style={{ color:'#888', fontSize:13, fontFamily:'sans-serif', margin:'0 0 24px' }}>Bienvenue ! Entrez vos identifiants.</p>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', color:'#dc2626', fontSize:13, fontFamily:'sans-serif', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', marginBottom:6 }}>Adresse email</label>
          <input
            type="email" required placeholder="vous@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'13px 16px', borderRadius:14, border:'2px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:16 }}
          />

          <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', marginBottom:6 }}>Mot de passe</label>
          <div style={{ position:'relative', marginBottom:10 }}>
            <input
              type={showPwd ? 'text' : 'password'} required placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width:'100%', padding:'13px 48px 13px 16px', borderRadius:14, border:'2px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box' }}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#aaa' }}>
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          <div style={{ textAlign:'right', marginBottom:22 }}>
            <Link href="/mot-de-passe-oublie" style={{ color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', fontWeight:600, textDecoration:'none' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:'15px', borderRadius:50, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#d1fae5' : 'linear-gradient(135deg,#0d4a3a,#2eb87a)',
            color: loading ? '#065f46' : 'white',
            fontWeight:700, fontSize:16, fontFamily:'sans-serif',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(13,74,58,0.35)',
            transition:'all 0.2s',
          }}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <span style={{ width:18, height:18, border:'2.5px solid #065f46', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                Connexion en cours...
              </span>
            ) : '🔐 Se connecter'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#888', fontFamily:'sans-serif' }}>
          Pas encore de compte ?{' '}
          <Link href="/inscription" style={{ color:'#0d4a3a', fontWeight:700, textDecoration:'none' }}>
            Créer un compte gratuit
          </Link>
        </p>
      </div>

      {/* Numéros urgence */}
      <div style={{ marginTop:20, background:'rgba(185,28,28,0.85)', backdropFilter:'blur(10px)', borderRadius:18, padding:'14px 20px', width:'100%', maxWidth:400 }}>
        <p style={{ color:'white', fontWeight:700, fontSize:12, fontFamily:'sans-serif', margin:'0 0 10px', textAlign:'center', letterSpacing:0.5 }}>🚨 URGENCES CAMEROUN — APPELS GRATUITS</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[['117','Police'],['118','Pompiers'],['119','SAMU'],['113','Gendarmerie'],['112','Universel'],['1510','Info Santé']].map(([n,l]) => (
            <a key={n} href={`tel:${n}`} style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 4px', textDecoration:'none', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ color:'white', fontWeight:800, fontSize:18, fontFamily:'monospace', lineHeight:1 }}>{n}</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:9, fontFamily:'sans-serif', marginTop:2 }}>{l}</div>
            </a>
          ))}
        </div>
      </div>

      <Link href="/" style={{ color:'rgba(255,255,255,0.4)', fontSize:12, fontFamily:'sans-serif', textDecoration:'none', marginTop:16 }}>
        ← Retour à l&apos;accueil
      </Link>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid rgba(255,255,255,0.2)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ConnexionForm />
    </Suspense>
  )
}
