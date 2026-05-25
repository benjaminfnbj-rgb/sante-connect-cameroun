'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPro() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '',
    pro_type: '', specialty: '', description: '', city: '', address: '',
    is_public_structure: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(k: string, v: string | boolean) { setForm(prev => ({...prev, [k]: v})) }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('professional_profiles').insert({
        auth_id: data.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        pro_type: form.pro_type,
        specialty: form.specialty,
        description: form.description,
        city: form.city,
        address: form.address,
        is_public_structure: form.is_public_structure,
        is_verified: false,
        is_blurred: true,
        subscription_plan: form.is_public_structure ? 'free' : 'monthly'
      })
    }
    router.push('/auth/verify')
    setLoading(false)
  }

  const proTypes = [
    {v:'doctor', l:'Médecin'}, {v:'pharmacist', l:'Pharmacien'},
    {v:'clinic', l:'Clinique privée'}, {v:'hospital', l:'Hôpital'},
    {v:'public_hospital', l:'Structure publique'}, {v:'ngo', l:'ONG Santé'},
    {v:'insurance', l:'Compagnie d\'assurance'}, {v:'un_agency', l:'Agence ONU'},
    {v:'lab', l:'Laboratoire'}
  ]

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{background:'var(--cream)'}}>
      <div className="w-full max-w-lg px-4">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <span style={{fontSize:'28px'}}>🏥</span>
          <span className="font-display text-2xl font-bold" style={{color:'var(--green-deep)'}}>Santé Connect Pro</span>
        </Link>

        <div className="card-glass p-8">
          <h1 className="font-display text-2xl font-bold mb-2" style={{color:'var(--green-deep)'}}>Espace Professionnel</h1>
          <div className="badge badge-gold mb-6">KYC Pro requis — Vérification des documents</div>

          {error && <div className="mb-4 p-3 rounded-xl font-sans text-sm" style={{background:'rgba(211,47,47,0.1)', color:'var(--red-alert)'}}>{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Nom / Raison sociale</label>
                <input required value={form.full_name} onChange={e => update('full_name', e.target.value)} className="form-input" placeholder="Dr. Dupont ou Clinique Espoir" />
              </div>
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Type</label>
                <select required value={form.pro_type} onChange={e => update('pro_type', e.target.value)} className="form-input">
                  <option value="">Sélectionner</option>
                  {proTypes.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Email</label>
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Téléphone</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} className="form-input" placeholder="+237..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Spécialité</label>
                <input value={form.specialty} onChange={e => update('specialty', e.target.value)} className="form-input" placeholder="Cardiologie, Pédiatrie..." />
              </div>
              <div>
                <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Ville</label>
                <select value={form.city} onChange={e => update('city', e.target.value)} className="form-input">
                  <option value="">Ville</option>
                  {['Yaoundé','Douala','Bafoussam','Bamenda','Garoua','Maroua'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Description des activités</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} className="form-input" rows={3} placeholder="Décrivez vos services et spécialités..." />
            </div>
            <div>
              <label className="font-sans text-sm font-medium mb-1 block" style={{color:'var(--text-mid)'}}>Mot de passe</label>
              <input type="password" required minLength={8} value={form.password} onChange={e => update('password', e.target.value)} className="form-input" placeholder="8 caractères minimum" />
            </div>

            <div className="p-4 rounded-xl" style={{background:'rgba(0,132,61,0.05)', border:'1px solid rgba(0,132,61,0.15)'}}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_public_structure} onChange={e => update('is_public_structure', e.target.checked)} className="mt-1 w-4 h-4 accent-green-600" />
                <div>
                  <div className="font-sans text-sm font-semibold" style={{color:'var(--green-deep)'}}>Structure sanitaire publique</div>
                  <div className="font-sans text-xs mt-1" style={{color:'var(--text-light)'}}>Accès gratuit après vérification de vos documents officiels</div>
                </div>
              </label>
            </div>

            <div className="p-4 rounded-xl" style={{background:'rgba(200,168,75,0.1)', border:'1px solid rgba(200,168,75,0.2)'}}>
              <p className="font-sans text-xs font-semibold mb-2" style={{color:'#8B6914'}}>📋 Documents requis (à envoyer après inscription) :</p>
              <ul className="font-sans text-xs space-y-1" style={{color:'var(--text-mid)'}}>
                <li>• Diplôme(s) et certificats professionnels</li>
                <li>• Agrément d&apos;exercice</li>
                <li>• Inscription à l&apos;Ordre des médecins/pharmaciens</li>
                <li>• Pièce d&apos;identité officielle</li>
              </ul>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Inscription...' : '✓ Créer mon compte professionnel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
