'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const roles = [
  { value: 'patient', icon: '👤', label: 'Patient / Particulier', desc: 'Accéder aux soins, rendez-vous, pharmacie et services de santé', color: '#0d4a3a', bg: '#e8f5ee' },
  { value: 'professional', icon: '👨‍⚕️', label: 'Médecin / Spécialiste', desc: 'Gérer vos consultations et votre agenda médical en ligne', color: '#2563eb', bg: '#eff6ff' },
  { value: 'pharmacy', icon: '💊', label: 'Pharmacie', desc: 'Publier votre stock et recevoir des commandes en ligne', color: '#059669', bg: '#ecfdf5' },
  { value: 'structure', icon: '🏥', label: 'Clinique / Hôpital', desc: 'Présenter vos services et accueillir de nouveaux patients', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'insurance', icon: '🛡️', label: 'Compagnie d\'assurance', desc: 'Proposer vos offres d\'assurance santé, maladie et vie', color: '#d97706', bg: '#fffbeb' },
  { value: 'ngo', icon: '🤝', label: 'ONG / Organisation', desc: 'Mener des actions de santé publique et humanitaire', color: '#db2777', bg: '#fdf2f8' },
]

export default function InscriptionPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('patient')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const selectedRole = roles.find(r => r.value === role)!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: signUpData, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, user_type: role, phone, gender } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else {
      // Créer le profil via API sécurisée (évite les problèmes RLS)
      if (signUpData.user) {
        try {
          await fetch('/api/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: signUpData.user.id,
              email, fullName, userType: role, phone, gender, city: '',
              accessToken: signUpData.session?.access_token || ''
            })
          })
        } catch(e) { /* non bloquant */ }
      }
      // Envoyer email de bienvenue via Resend
      try {
        await fetch('/api/emails/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            name: fullName,
            verifyUrl: 'https://sante-connect-cameroun.vercel.app/connexion'
          })
        })
      } catch(e) { /* email non bloquant */ }
      setSuccess(true)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 40, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: '#0d4a3a', fontFamily: 'Georgia,serif', fontSize: 22, margin: '0 0 12px' }}>Compte créé !</h2>
        <p style={{ color: '#666', fontSize: 14, fontFamily: 'sans-serif', lineHeight: 1.7, margin: '0 0 24px' }}>
          Vérifiez votre email <strong>{email}</strong> et cliquez sur le lien pour activer votre compte.<br/>
          Votre mois d&apos;essai gratuit démarre dès activation.
        </p>
        <Link href="/connexion" style={{ display: 'inline-block', background: '#0d4a3a', color: 'white', borderRadius: 50, padding: '12px 32px', fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: 'sans-serif' }}>
          Se connecter →
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, padding: '36px 28px', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>

        {/* Logo + titre */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#0d4a3a,#2eb87a)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px' }}>🏥</div>
          <h1 style={{ color: '#0d4a3a', fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Créer votre compte</h1>
          <p style={{ color: '#888', fontSize: 13, fontFamily: 'sans-serif', margin: 0 }}>1 mois d&apos;essai gratuit · Sans carte bancaire</p>
          {/* Barre de progression */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
            {[1, 2].map(i => (
              <div key={i} style={{ flex: 1, maxWidth: 80, height: 4, borderRadius: 4, background: i <= step ? 'linear-gradient(90deg,#0d4a3a,#2eb87a)' : '#e5e7eb', transition: 'background 0.3s' }} />
            ))}
          </div>
          <p style={{ color: '#aaa', fontSize: 11, fontFamily: 'sans-serif', marginTop: 6 }}>Étape {step} sur 2</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 13, fontFamily: 'sans-serif', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ÉTAPE 1 — Choisir le type de compte */}
        {step === 1 && (
          <div>
            <p style={{ color: '#0d4a3a', fontWeight: 700, fontSize: 14, fontFamily: 'sans-serif', margin: '0 0 14px' }}>Je suis...</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {roles.map(r => (
                <div key={r.value} onClick={() => setRole(r.value)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.15s',
                  border: role === r.value ? `2px solid ${r.color}` : '2px solid #f0f0f0',
                  background: role === r.value ? r.bg : 'white',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: role === r.value ? r.bg : '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    {r.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: role === r.value ? r.color : '#1a2e26', fontSize: 14, fontFamily: 'sans-serif' }}>{r.label}</div>
                    <div style={{ color: '#888', fontSize: 12, fontFamily: 'sans-serif', marginTop: 2 }}>{r.desc}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${role === r.value ? r.color : '#ddd'}`, background: role === r.value ? r.color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {role === r.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{
              width: '100%', padding: '14px', borderRadius: 50, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg,${selectedRole.color},#2eb87a)`,
              color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'sans-serif',
            }}>
              Continuer avec {selectedRole.label} →
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888', fontFamily: 'sans-serif' }}>
              Déjà un compte ? <Link href="/connexion" style={{ color: '#0d4a3a', fontWeight: 700 }}>Se connecter</Link>
            </p>
          </div>
        )}

        {/* ÉTAPE 2 — Informations */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: selectedRole.bg, borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>{selectedRole.icon}</span>
              <span style={{ fontWeight: 700, color: selectedRole.color, fontSize: 13, fontFamily: 'sans-serif' }}>{selectedRole.label}</span>
              <button type="button" onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'sans-serif' }}>Changer</button>
            </div>

            {/* Nom complet */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 13, fontFamily: 'sans-serif' }}>Nom complet *</label>
              <input type="text" required placeholder="Jean Dupont" value={fullName} onChange={e => setFullName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 13, fontFamily: 'sans-serif' }}>Adresse email *</label>
              <input type="email" required placeholder="vous@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
            </div>

            {/* Mot de passe avec œil */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 13, fontFamily: 'sans-serif' }}>Mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  required placeholder="Minimum 8 caractères" value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: 12,
                    border: password.length > 0 ? (password.length >= 8 ? '1.5px solid #16a34a' : '1.5px solid #f59e0b') : '1.5px solid #e5e7eb',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888', padding: 0, lineHeight: 1 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p style={{ fontSize: 11, fontFamily: 'sans-serif', margin: '4px 0 0', color: '#f59e0b' }}>⚠️ Minimum 8 caractères ({password.length}/8)</p>
              )}
              {password.length >= 8 && (
                <p style={{ fontSize: 11, fontFamily: 'sans-serif', margin: '4px 0 0', color: '#16a34a' }}>✓ Longueur correcte</p>
              )}
            </div>

            {/* Confirmer mot de passe avec œil + validation en temps réel */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 13, fontFamily: 'sans-serif' }}>Confirmer le mot de passe *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required placeholder="Répétez le mot de passe" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: 12,
                    border: confirmPassword.length > 0
                      ? (confirmPassword === password ? '1.5px solid #16a34a' : '1.5px solid #dc2626')
                      : '1.5px solid #e5e7eb',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888', padding: 0, lineHeight: 1 }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p style={{ fontSize: 11, fontFamily: 'sans-serif', margin: '4px 0 0',
                  color: confirmPassword === password ? '#16a34a' : '#dc2626' }}>
                  {confirmPassword === password
                    ? '✅ Les mots de passe correspondent'
                    : '❌ Les mots de passe ne correspondent pas'}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 13, fontFamily: 'sans-serif' }}>Téléphone</label>
              <input type="tel" placeholder="+237 6XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 13, fontFamily: 'sans-serif' }}>Genre</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['male','Homme','👨'],['female','Femme','👩'],['other','Autre','🧑']].map(([v, l, ic]) => (
                  <div key={v} onClick={() => setGender(v)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                    border: gender === v ? '2px solid #0d4a3a' : '2px solid #e5e7eb',
                    background: gender === v ? '#e8f5ee' : 'white',
                  }}>
                    <div style={{ fontSize: 18 }}>{ic}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: gender === v ? '#0d4a3a' : '#666', fontFamily: 'sans-serif' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px', borderRadius: 50, border: '1.5px solid #e5e7eb', background: 'white', color: '#666', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'sans-serif' }}>← Retour</button>
              <button type="submit"
                disabled={loading || password !== confirmPassword || password.length < 8}
                style={{ flex: 2, padding: '13px', borderRadius: 50, border: 'none',
                  background: (password === confirmPassword && password.length >= 8 && !loading)
                    ? 'linear-gradient(135deg,#0d4a3a,#2eb87a)' : '#ccc',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: (password === confirmPassword && password.length >= 8) ? 'pointer' : 'not-allowed',
                  fontFamily: 'sans-serif' }}>
                {loading ? '⏳ Création...' : '🚀 Créer mon compte'}
              </button>
            </div>
          </form>
        )}

        <Link href="/" style={{ display: 'block', textAlign: 'center', marginTop: 16, color: '#aaa', fontSize: 12, textDecoration: 'none', fontFamily: 'sans-serif' }}>← Retour à l&apos;accueil</Link>
      </div>
    </div>
  )
}
