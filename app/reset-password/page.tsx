'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function ResetForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase injecte le token dans l'URL automatiquement via le redirect
    const sb = createClient()
    sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token valide, prêt à réinitialiser
      }
    })
  }, [])

  const strength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }
  const pwdStrength = strength(password)
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  const strengthColors = ['', '#dc2626', '#f59e0b', '#16a34a', '#0d4a3a']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else { setDone(true); setTimeout(() => router.push('/dashboard'), 2500) }
  }

  const inp: React.CSSProperties = { width:'100%', padding:'13px 48px 13px 16px', borderRadius:14, border:'2px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box' }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a,#1a7a5e)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:64, height:64, background:'rgba(255,255,255,0.12)', borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 12px', border:'1.5px solid rgba(255,255,255,0.2)' }}>🔐</div>
          <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:21, fontWeight:700, margin:'0 0 4px' }}>Nouveau mot de passe</h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, fontFamily:'sans-serif' }}>Choisissez un mot de passe sécurisé</p>
        </div>

        <div style={{ background:'white', borderRadius:28, padding:'32px 28px', boxShadow:'0 24px 60px rgba(0,0,0,0.3)' }}>
          {done ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:20, margin:'0 0 10px' }}>Mot de passe mis à jour !</h2>
              <p style={{ color:'#666', fontSize:14, fontFamily:'sans-serif', lineHeight:1.6, margin:'0 0 20px' }}>
                Votre mot de passe a été modifié avec succès.<br/>Redirection automatique...
              </p>
              <Link href="/dashboard" style={{ display:'block', background:'linear-gradient(135deg,#0d4a3a,#2eb87a)', color:'white', borderRadius:50, padding:'13px', fontWeight:700, textDecoration:'none', fontFamily:'sans-serif' }}>
                Aller au tableau de bord →
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:20, margin:'0 0 6px' }}>Réinitialiser le mot de passe</h2>
              <p style={{ color:'#888', fontSize:13, fontFamily:'sans-serif', margin:'0 0 22px' }}>Minimum 8 caractères recommandés.</p>

              {error && (
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', color:'#dc2626', fontSize:13, fontFamily:'sans-serif', marginBottom:16 }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', marginBottom:6 }}>Nouveau mot de passe</label>
                <div style={{ position:'relative', marginBottom:8 }}>
                  <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="Minimum 8 caractères" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#aaa' }}>{showPwd ? '🙈' : '👁️'}</button>
                </div>

                {/* Indicateur de force */}
                {password.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex:1, height:4, borderRadius:4, background: i <= pwdStrength ? strengthColors[pwdStrength] : '#e5e7eb', transition:'background 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ color: strengthColors[pwdStrength], fontSize:12, fontFamily:'sans-serif', margin:0 }}>
                      {pwdStrength > 0 && `Force : ${strengthLabels[pwdStrength]}`}
                      {password.length < 8 && ' · Minimum 8 caractères'}
                    </p>
                  </div>
                )}

                <label style={{ display:'block', fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', marginBottom:6 }}>Confirmer le mot de passe</label>
                <div style={{ position:'relative', marginBottom: confirm.length > 0 ? 8 : 20 }}>
                  <input type={showConfirm ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} style={{ ...inp, borderColor: confirm.length > 0 ? (confirm === password ? '#16a34a' : '#dc2626') : '#e5e7eb' }} placeholder="Répétez le mot de passe" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#aaa' }}>{showConfirm ? '🙈' : '👁️'}</button>
                </div>
                {confirm.length > 0 && (
                  <p style={{ fontSize:12, fontFamily:'sans-serif', margin:'0 0 16px', color: confirm === password ? '#16a34a' : '#dc2626' }}>
                    {confirm === password ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                  </p>
                )}

                <button type="submit" disabled={loading || password !== confirm || password.length < 8} style={{
                  width:'100%', padding:'15px', borderRadius:50, border:'none',
                  background: (loading || password !== confirm || password.length < 8) ? '#ccc' : 'linear-gradient(135deg,#0d4a3a,#2eb87a)',
                  color:'white', fontWeight:700, fontSize:15, fontFamily:'sans-serif',
                  cursor: (password !== confirm || password.length < 8) ? 'not-allowed' : 'pointer',
                  boxShadow: (password === confirm && password.length >= 8) ? '0 6px 20px rgba(13,74,58,0.3)' : 'none',
                }}>
                  {loading ? '⏳ Mise à jour...' : '🔐 Mettre à jour le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#0d4a3a', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>Chargement...</div>}>
      <ResetForm />
    </Suspense>
  )
}
