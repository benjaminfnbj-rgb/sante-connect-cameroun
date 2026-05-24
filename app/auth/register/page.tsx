'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') || 'patient'

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '',
    role: defaultType, gender: '', birth_date: '',
    specialty: '', structure_name: '', city: '',
    accept_condoms: true,
  })

  const update = (field: string, val: any) => setForm(p => ({ ...p, [field]: val }))

  const roles = [
    { value: 'patient', label: 'Patient', icon: '👤', desc: 'Je cherche des soins de santé' },
    { value: 'professional', label: 'Médecin / Praticien', icon: '👨‍⚕️', desc: 'Je suis professionnel de santé' },
    { value: 'pharmacy', label: 'Pharmacie', icon: '💊', desc: 'Je gère une pharmacie' },
    { value: 'insurance', label: 'Assurance', icon: '🛡️', desc: 'Je propose des assurances santé' },
  ]

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            role: form.role,
          }
        }
      })
      if (error) throw error

      if (data.user) {
        // Insert profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: form.email,
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
          is_active: true,
        })

        if (form.role === 'professional') {
          await supabase.from('professional_profiles').insert({
            user_id: data.user.id,
            specialty: form.specialty,
            structure_name: form.structure_name,
            city: form.city,
            is_verified: false,
          })
        }
      }

      router.push('/auth/verify?email=' + encodeURIComponent(form.email))
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '40px 48px', width: '100%', maxWidth: 520, boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 14px' }}>🏥</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 800, color: '#0d4a3a' }}>Créer un compte</h1>
          <p style={{ color: '#5a7a6e', fontSize: 14, marginTop: 4 }}>1 mois d'essai gratuit • Sans carte bancaire</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? '#2eb87a' : '#e2e8f0', transition: 'background 0.3s' }} />
          ))}
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>{error}</div>}

        {/* Step 1: Role */}
        {step === 1 && (
          <div>
            <h2 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 20, fontSize: 18 }}>Vous êtes...</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {roles.map(r => (
                <div key={r.value} onClick={() => update('role', r.value)}
                  style={{ padding: 16, borderRadius: 14, border: `2px solid ${form.role === r.value ? '#2eb87a' : '#e2e8f0'}`, background: form.role === r.value ? '#f0fdf8' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 14 }}>{r.label}</div>
                  <div style={{ color: '#5a7a6e', fontSize: 12, marginTop: 2 }}>{r.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ width: '100%', background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '14px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Continuer →
            </button>
          </div>
        )}

        {/* Step 2: Personal info */}
        {step === 2 && (
          <div>
            <h2 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 20, fontSize: 18 }}>Informations personnelles</h2>
            {[
              { label: 'Nom complet', field: 'full_name', type: 'text', placeholder: 'Jean Dupont' },
              { label: 'Email', field: 'email', type: 'email', placeholder: 'jean@email.com' },
              { label: 'Téléphone', field: 'phone', type: 'tel', placeholder: '+237 6XX XXX XXX' },
              { label: 'Mot de passe', field: 'password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.field} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.field]} onChange={e => update(f.field, e.target.value)}
                  placeholder={f.placeholder} required
                  style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
              </div>
            ))}

            {form.role === 'patient' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', fontSize: 13, marginBottom: 6 }}>Genre</label>
                <select value={form.gender} onChange={e => update('gender', e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'white', boxSizing: 'border-box' }}>
                  <option value="">Sélectionner...</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: '#f0f0f0', color: '#5a7a6e', padding: '13px', borderRadius: 50, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
              <button onClick={() => setStep(3)} style={{ flex: 2, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '13px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Continuer →</button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & extras */}
        {step === 3 && (
          <div>
            <h2 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 20, fontSize: 18 }}>Finaliser l'inscription</h2>

            {(form.role === 'professional' || form.role === 'pharmacy') && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', fontSize: 13, marginBottom: 6 }}>
                    {form.role === 'professional' ? 'Spécialité médicale' : 'Nom de la pharmacie'}
                  </label>
                  <input type="text" value={form.specialty || form.structure_name}
                    onChange={e => update(form.role === 'professional' ? 'specialty' : 'structure_name', e.target.value)}
                    style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
                    placeholder={form.role === 'professional' ? 'Cardiologie, Pédiatrie...' : 'Pharmacie du Centre...'} />
                </div>
                <div style={{ background: '#fff8e6', border: '1px solid #f5a623', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: '#7a5200' }}>
                  📋 Vous devrez téléverser vos documents officiels (diplômes, agrément) pour validation KYC après l'inscription.
                </div>
              </>
            )}

            {form.role === 'patient' && (
              <div style={{ background: '#f0fdf8', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 12, fontSize: 15 }}>🎁 Kit Santé inclus dans votre abonnement</h3>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.accept_condoms} onChange={e => update('accept_condoms', e.target.checked)}
                    style={{ marginTop: 3, width: 18, height: 18 }} />
                  <span style={{ color: '#1a2e26', fontSize: 14 }}>
                    Je souhaite recevoir des <strong>préservatifs gratuits</strong> avec mon abonnement (lutte contre le VIH/MST)
                  </span>
                </label>
                {form.gender === 'female' && (
                  <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 10, fontSize: 13, color: '#5a7a6e' }}>
                    🌸 En tant que femme de moins de 50 ans, vous recevrez également des <strong>serviettes hygiéniques gratuites</strong>.
                  </div>
                )}
              </div>
            )}

            <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: '#5a7a6e' }}>
              <strong style={{ color: '#0d4a3a' }}>🔒 Confidentialité garantie</strong><br />
              Vos données médicales restent privées. La plateforme agit uniquement comme intermédiaire de mise en relation.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, background: '#f0f0f0', color: '#5a7a6e', padding: '13px', borderRadius: 50, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>← Retour</button>
              <button onClick={handleRegister} disabled={loading}
                style={{ flex: 2, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '13px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 14, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Création...' : '✓ Créer mon compte'}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, color: '#5a7a6e', fontSize: 13 }}>
          Déjà inscrit ? <Link href="/auth/login" style={{ color: '#2eb87a', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
