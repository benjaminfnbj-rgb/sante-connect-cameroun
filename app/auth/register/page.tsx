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
    user_type: defaultType, gender: '', city: '',
    specialty: '', structure_name: '',
    accept_condoms: true,
  })

  const update = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }))

  const userTypes = [
    { value: 'patient', label: 'Patient', icon: '👤', desc: 'Je cherche des soins de santé' },
    { value: 'professional', label: 'Médecin / Praticien', icon: '👨‍⚕️', desc: 'Je suis professionnel de santé' },
    { value: 'pharmacy', label: 'Pharmacie', icon: '💊', desc: 'Je gère une pharmacie' },
    { value: 'insurance', label: 'Assurance', icon: '🛡️', desc: 'Je propose des assurances santé' },
    { value: 'ngo', label: 'ONG / Structure', icon: '🏥', desc: 'Organisation de santé' },
  ]

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Créer le compte auth avec les métadonnées correctes
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone,
            user_type: form.user_type, // champ correct pour le trigger
          }
        }
      })
      if (authError) throw authError
      if (!data.user) throw new Error('Erreur création compte')

      // 2. Upsert profil - seulement les colonnes qui existent dans la BD
      // Le trigger handle_new_user crée déjà le profil automatiquement
      // On fait un upsert pour enrichir avec les données supplémentaires
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone || null,
        user_type: form.user_type,
        city: form.city || null,
        gender: form.gender || null,
        // ✅ Uniquement les colonnes qui existent dans la table
      })
      if (profileError) {
        console.error('Profile upsert info:', profileError.message)
        // Non bloquant - le trigger a déjà créé le profil de base
      }

      // 3. Si professionnel, créer le profil pro
      if (['professional', 'pharmacy', 'insurance', 'ngo'].includes(form.user_type)) {
        const structureTypeMap: Record<string, string> = {
          professional: 'other',
          pharmacy: 'pharmacy',
          insurance: 'insurance',
          ngo: 'ngo',
        }
        const { error: proError } = await supabase.from('professional_profiles').insert({
          user_id: data.user.id,
          structure_type: structureTypeMap[form.user_type] || 'other',
          structure_name: form.structure_name || form.full_name,
          specialty: form.specialty || null,
          city: form.city || 'Non précisé',
          verification_status: 'pending',
          is_visible: false,
        })
        if (proError) console.error('Pro profile error (non-blocking):', proError)
      }

      router.push('/auth/verify?email=' + encodeURIComponent(form.email))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'inscription'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 } as React.CSSProperties,
    card: { background: 'white', borderRadius: 24, padding: '40px 32px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' } as React.CSSProperties,
    title: { fontSize: 28, fontWeight: 700, color: '#0d4a3a', textAlign: 'center', marginBottom: 6 } as React.CSSProperties,
    sub: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 28 } as React.CSSProperties,
    label: { display: 'block', fontWeight: 600, color: '#0d4a3a', marginBottom: 6, fontSize: 14 } as React.CSSProperties,
    input: { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 16 },
    btn: { width: '100%', padding: '14px', borderRadius: 50, background: 'linear-gradient(135deg,#0d4a3a,#2eb87a)', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 8 } as React.CSSProperties,
    error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', color: '#dc2626', fontSize: 14, marginBottom: 16 } as React.CSSProperties,
    typeCard: (selected: boolean) => ({ border: `2px solid ${selected ? '#0d4a3a' : '#e5e7eb'}`, background: selected ? '#f0fdf8' : 'white', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }) as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏥</div>
          <h1 style={s.title}>Créer un compte</h1>
          <p style={s.sub}>1 mois d&apos;essai gratuit • Sans carte bancaire</p>
          {/* Étapes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: 60, height: 4, borderRadius: 4, background: i <= step ? '#0d4a3a' : '#e5e7eb' }} />
            ))}
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        {step === 1 && (
          <>
            <p style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 12 }}>Je suis...</p>
            {userTypes.map(t => (
              <div key={t.value} style={s.typeCard(form.user_type === t.value)} onClick={() => update('user_type', t.value)}>
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 14 }}>{t.label}</div>
                  <div style={{ color: '#888', fontSize: 12 }}>{t.desc}</div>
                </div>
                {form.user_type === t.value && <span style={{ marginLeft: 'auto', color: '#0d4a3a' }}>✓</span>}
              </div>
            ))}
            <button style={s.btn} onClick={() => setStep(2)}>Continuer →</button>
          </>
        )}

        {step === 2 && (
          <>
            <label style={s.label}>Nom complet *</label>
            <input style={s.input} placeholder="Jean Dupont" value={form.full_name} onChange={e => update('full_name', e.target.value)} />

            <label style={s.label}>Email *</label>
            <input style={s.input} type="email" placeholder="vous@email.com" value={form.email} onChange={e => update('email', e.target.value)} />

            <label style={s.label}>Mot de passe *</label>
            <input style={s.input} type="password" placeholder="Min. 8 caractères" value={form.password} onChange={e => update('password', e.target.value)} />

            <label style={s.label}>Téléphone</label>
            <input style={s.input} type="tel" placeholder="+237 6XX XXX XXX" value={form.phone} onChange={e => update('phone', e.target.value)} />

            <label style={s.label}>Ville</label>
            <input style={s.input} placeholder="Yaoundé, Douala..." value={form.city} onChange={e => update('city', e.target.value)} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...s.btn, background: '#e5e7eb', color: '#333', flex: 1 }} onClick={() => setStep(1)}>← Retour</button>
              <button style={{ ...s.btn, flex: 2 }} onClick={() => setStep(3)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {form.user_type === 'professional' && (
              <>
                <label style={s.label}>Spécialité médicale</label>
                <input style={s.input} placeholder="Médecin généraliste, Dentiste..." value={form.specialty} onChange={e => update('specialty', e.target.value)} />
              </>
            )}
            {['pharmacy', 'insurance', 'ngo'].includes(form.user_type) && (
              <>
                <label style={s.label}>Nom de la structure</label>
                <input style={s.input} placeholder="Nom de votre organisation" value={form.structure_name} onChange={e => update('structure_name', e.target.value)} />
              </>
            )}
            {['professional', 'pharmacy', 'insurance', 'ngo'].includes(form.user_type) && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
                📋 Vous devrez téléverser vos documents officiels (diplômes, agréments) pour validation après inscription.
              </div>
            )}
            {form.user_type === 'patient' && (
              <div style={{ background: '#f0fdf8', border: '1px solid #86efac', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.accept_condoms} onChange={e => update('accept_condoms', e.target.checked)} />
                  <span style={{ fontSize: 13, color: '#0d4a3a' }}>
                    🎁 Inclure les préservatifs dans mon abonnement (kit santé mensuel)
                  </span>
                </label>
              </div>
            )}
            <div style={{ background: '#f0fdf8', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#0d4a3a' }}>
              <strong>✅ Récapitulatif :</strong><br />
              {form.full_name} • {form.email}<br />
              Type : {userTypes.find(t => t.value === form.user_type)?.label}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...s.btn, background: '#e5e7eb', color: '#333', flex: 1 }} onClick={() => setStep(2)}>← Retour</button>
              <button style={{ ...s.btn, flex: 2 }} onClick={handleRegister} disabled={loading}>
                {loading ? '⏳ Création...' : '🚀 Créer mon compte'}
              </button>
            </div>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          Déjà un compte ? <Link href="/connexion" style={{ color: '#0d4a3a', fontWeight: 700 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0d4a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
