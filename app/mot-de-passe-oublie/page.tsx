'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = createClient()
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSent(true)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a,#1a7a5e)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:64, height:64, background:'rgba(255,255,255,0.12)', backdropFilter:'blur(20px)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px', border:'1.5px solid rgba(255,255,255,0.2)' }}>🔑</div>
          <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:21, fontWeight:700, margin:'0 0 4px' }}>Mot de passe oublié</h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontFamily:'sans-serif' }}>Nous vous enverrons un lien de réinitialisation</p>
        </div>

        <div style={{ background:'white', borderRadius:28, padding:'32px 28px', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:16 }}>📧</div>
              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:20, margin:'0 0 12px' }}>Email envoyé !</h2>
              <p style={{ color:'#555', fontSize:14, fontFamily:'sans-serif', lineHeight:1.7, margin:'0 0 24px' }}>
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.<br/>
                Vérifiez aussi vos spams.
              </p>
              <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:14, padding:14, marginBottom:20 }}>
                <p style={{ color:'#14532d', fontSize:13, fontFamily:'sans-serif', margin:0, lineHeight:1.6 }}>
                  📬 L&apos;email provient de <strong>onboarding@resend.dev</strong> — objet : <em>&ldquo;Reset your password&rdquo;</em>
                </p>
              </div>
              <Link href="/connexion" style={{ display:'block', textAlign:'center', background:'linear-gradient(135deg,#0d4a3a,#2eb87a)', color:'white', borderRadius:50, padding:'13px', fontWeight:700, fontSize:14, textDecoration:'none', fontFamily:'sans-serif' }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, margin:'0 0 6px' }}>Réinitialiser le mot de passe</h2>
              <p style={{ color:'#888', fontSize:13, fontFamily:'sans-serif', margin:'0 0 24px' }}>Entrez votre adresse email pour recevoir le lien.</p>

              {error && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', color:'#dc2626', fontSize:13, fontFamily:'sans-serif', marginBottom:18 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', marginBottom:6 }}>Adresse email</label>
                <input type="email" required placeholder="vous@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ width:'100%', padding:'13px 16px', borderRadius:14, border:'2px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:20 }}
                />
                <button type="submit" disabled={loading} style={{
                  width:'100%', padding:'15px', borderRadius:50, border:'none', cursor:'pointer',
                  background: loading ? '#ccc' : 'linear-gradient(135deg,#0d4a3a,#2eb87a)',
                  color:'white', fontWeight:700, fontSize:15, fontFamily:'sans-serif',
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(13,74,58,0.3)',
                }}>
                  {loading ? '⏳ Envoi en cours...' : '📧 Envoyer le lien de réinitialisation'}
                </button>
              </form>

              <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#888', fontFamily:'sans-serif' }}>
                <Link href="/connexion" style={{ color:'#0d4a3a', fontWeight:700, textDecoration:'none' }}>← Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
