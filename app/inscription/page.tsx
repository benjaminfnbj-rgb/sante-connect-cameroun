'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

const roles = [
  { value: 'patient', label: '🏠 Patient / Particulier', desc: 'Accédez aux soins et services de santé' },
  { value: 'professional', label: '🩺 Médecin / Spécialiste', desc: 'Gérez vos rendez-vous et patients' },
  { value: 'pharmacy', label: '💊 Pharmacie', desc: 'Vendez vos médicaments en ligne' },
  { value: 'clinic', label: '🏥 Clinique / Hôpital', desc: 'Présentez vos services médicaux' },
  { value: 'insurance', label: '🛡️ Compagnie d\'assurance', desc: 'Proposez vos offres d\'assurance santé' },
  { value: 'ngo', label: '🤝 ONG / Organisation', desc: 'Actions de santé publique et humanitaire' },
]

export default function InscriptionPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('patient')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, user_type: role, phone, gender }
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'var(--bg-cream)'}}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: '#dcfce7'}}>
            <CheckCircle size={40} style={{color: 'var(--green-mid)'}} />
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{fontFamily: 'Fraunces, serif'}}>Compte créé avec succès !</h2>
          <p className="mb-6" style={{color: 'var(--text-muted)'}}>
            Vérifiez votre boîte email <strong>{email}</strong> pour confirmer votre compte. Vous bénéficiez de <strong>1 mois d'essai gratuit</strong>.
          </p>
          <Link href="/connexion" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white" style={{background: 'var(--green-deep)'}}>
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'var(--bg-cream)'}}>
      <div className="w-full max-w-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{color: 'var(--text-muted)'}}>
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{
                background: step >= s ? 'var(--green-deep)' : 'var(--border)',
                color: step >= s ? 'white' : 'var(--text-muted)'
              }}>{s}</div>
              {s < 2 && <div className="h-0.5 w-16" style={{background: step > s ? 'var(--green-deep)' : 'var(--border)'}} />}
            </div>
          ))}
          <span className="ml-2 text-sm" style={{color: 'var(--text-muted)'}}>{step === 1 ? 'Type de compte' : 'Informations'}</span>
        </div>

        <div className="p-8 rounded-3xl" style={{background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.06)'}}>
          <h1 className="text-3xl font-bold mb-2" style={{fontFamily: 'Fraunces, serif'}}>
            {step === 1 ? 'Choisissez votre profil' : 'Créer votre compte'}
          </h1>
          <p className="mb-6" style={{color: 'var(--text-muted)'}}>
            {step === 1 ? 'Sélectionnez le type de compte qui vous correspond' : '1 mois d\'essai gratuit — sans carte bancaire'}
          </p>

          {error && <div className="p-4 rounded-xl mb-6 text-sm" style={{background: '#fee2e2', color: '#dc2626'}}>{error}</div>}

          {step === 1 && (
            <div className="space-y-3">
              {roles.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className="w-full text-left p-4 rounded-xl transition-all"
                  style={{
                    background: role === r.value ? '#f0fdf4' : 'var(--bg-cream)',
                    border: `2px solid ${role === r.value ? 'var(--green-mid)' : 'transparent'}`,
                  }}
                >
                  <div className="font-semibold text-sm">{r.label}</div>
                  <div className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>{r.desc}</div>
                </button>
              ))}
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl font-bold text-white mt-4"
                style={{background: 'var(--green-deep)'}}
              >
                Continuer
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom complet *</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Jean Dupont" className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{background: 'var(--bg-cream)', border: '2px solid var(--border)'}} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com" className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{background: 'var(--bg-cream)', border: '2px solid var(--border)'}} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Téléphone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+237 6XX XXX XXX" className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{background: 'var(--bg-cream)', border: '2px solid var(--border)'}} />
              </div>
              {role === 'patient' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Genre</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{background: 'var(--bg-cream)', border: '2px solid var(--border)'}}>
                    <option value="">Sélectionner</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Mot de passe *</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères" className="w-full px-4 py-3 rounded-xl outline-none"
                  minLength={8} style={{background: 'var(--bg-cream)', border: '2px solid var(--border)'}} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl font-semibold"
                  style={{background: 'var(--bg-cream)', color: 'var(--text-muted)'}}>
                  Retour
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{background: 'var(--green-deep)'}}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Création...</> : 'Créer mon compte gratuit'}
                </button>
              </div>
            </form>
          )}
        </div>
        <p className="text-center mt-6 text-sm" style={{color: 'var(--text-muted)'}}>
          Déjà un compte ? <Link href="/connexion" className="font-semibold" style={{color: 'var(--green-mid)'}}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
