'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Mapping frontend → ENUMs exacts de la BD
const STRUCTURE_TYPE_MAP: Record<string, string> = {
  doctor:          'other',
  pharmacist:      'pharmacy',
  clinic:          'private_clinic',
  hospital:        'private_clinic',
  public_hospital: 'public_hospital',
  ngo:             'ngo',
  insurance:       'insurance',
  un_agency:       'un_agency',
  lab:             'lab',
}

const PRO_TYPES = [
  { v:'doctor',          l:'Médecin / Spécialiste',        icon:'👨‍⚕️', isPublic: false },
  { v:'pharmacist',      l:'Pharmacie',                    icon:'💊', isPublic: false },
  { v:'clinic',          l:'Clinique / Hôpital Privé',     icon:'🏥', isPublic: false },
  { v:'public_hospital', l:'Structure Sanitaire Publique', icon:'🏛️', isPublic: true  },
  { v:'ngo',             l:'ONG / Organisation Santé',     icon:'🤝', isPublic: false },
  { v:'insurance',       l:'Compagnie d\'Assurance',       icon:'🛡️', isPublic: false },
  { v:'un_agency',       l:'Agence ONU / Internationale',  icon:'🌐', isPublic: true  },
  { v:'lab',             l:'Laboratoire d\'Analyses',      icon:'🔬', isPublic: false },
]

const VILLES = ['Yaoundé','Douala','Bafoussam','Bamenda','Garoua','Maroua','Bertoua','Buea','Ebolowa','Ngaoundéré','Limbé']

export default function RegisterProPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    pro_type: '',
    structure_name: '',
    specialty: '',
    description: '',
    city: '',
    address: '',
    license_number: '',
    order_registration: '',
    email: '',
    password: '',
    phone: '',
    is_public_sector: false,
  })

  const up = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))
  const selected = PRO_TYPES.find(t => t.v === form.pro_type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const sb = createClient()

    try {
      // 1. Créer le compte Auth
      const { data, error: authErr } = await sb.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.structure_name,
            user_type: form.pro_type === 'doctor' ? 'professional' : (form.pro_type === 'pharmacist' ? 'pharmacy' : form.pro_type),
            phone: form.phone,
          }
        }
      })
      if (authErr) throw authErr
      if (!data.user) throw new Error('Erreur création compte')

      // 2. Créer le profil professionnel avec les champs exacts de la BD
      const structureType = STRUCTURE_TYPE_MAP[form.pro_type] || 'other'
      const { error: proErr } = await sb.from('professional_profiles').insert({
        user_id:            data.user.id,           // ✅ user_id (pas auth_id)
        structure_type:     structureType,           // ✅ ENUM valide
        structure_name:     form.structure_name,
        specialty:          form.specialty || null,
        description:        form.description || null,
        city:               form.city || null,
        address:            form.address || null,
        license_number:     form.license_number || null,
        order_registration: form.order_registration || null,
        is_public_sector:   form.pro_type === 'public_hospital' || form.pro_type === 'un_agency',
        verification_status:'pending',               // ✅ ENUM valide
        is_visible:         false,                   // ✅ colonne correcte (pas is_blurred)
      })
      if (proErr) console.warn('Pro profile warning:', proErr.message)

      // 3. Envoyer email de bienvenue + notification de demande KYC
      try {
        await fetch('/api/emails/professional-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.email,
            name: form.structure_name,
            status: 'pending'
          })
        })
      } catch(e) { /* non bloquant */ }

      setSuccess(true)
    } catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inscription')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:28, padding:40, maxWidth:440, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
        <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:22, margin:'0 0 12px' }}>Compte créé !</h2>
        <p style={{ color:'#555', fontSize:14, fontFamily:'sans-serif', lineHeight:1.7, margin:'0 0 16px' }}>
          Votre demande d&apos;inscription a bien été enregistrée.<br/>
          Un email de confirmation a été envoyé à <strong>{form.email}</strong>.
        </p>
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:16, marginBottom:20 }}>
          <p style={{ color:'#92400e', fontSize:13, fontFamily:'sans-serif', margin:0, lineHeight:1.6 }}>
            ⏳ <strong>Votre profil sera visible</strong> après validation de vos documents par notre équipe (24-48h).<br/>
            En attendant, votre compte est actif mais votre profil est en attente de vérification KYC.
          </p>
        </div>
        <Link href="/connexion" style={{ display:'inline-block', background:'linear-gradient(135deg,#0d4a3a,#2eb87a)', color:'white', borderRadius:50, padding:'13px 32px', fontWeight:700, fontSize:14, textDecoration:'none', fontFamily:'sans-serif' }}>
          Accéder à mon espace →
        </Link>
      </div>
    </div>
  )

  const inp: React.CSSProperties = { width:'100%', padding:'12px 15px', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:14, outline:'none', fontFamily:'sans-serif', boxSizing:'border-box', marginBottom:14 }
  const lbl: React.CSSProperties = { display:'block', fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif', marginBottom:6 }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a2e22,#0d4a3a)', padding:'24px 16px', display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:480 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🏥</div>
          <h1 style={{ color:'white', fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, margin:'0 0 4px' }}>Espace Professionnel</h1>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, fontFamily:'sans-serif' }}>KYC requis — Vérification des documents officiels</p>
          {/* Progress */}
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ flex:1, maxWidth:70, height:4, borderRadius:4, background: i <= step ? '#2eb87a' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontFamily:'sans-serif', marginTop:5 }}>Étape {step}/3</p>
        </div>

        <div style={{ background:'white', borderRadius:28, padding:'28px 24px' }}>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'12px 16px', color:'#dc2626', fontSize:13, fontFamily:'sans-serif', marginBottom:16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* ÉTAPE 1 — Type de structure */}
          {step === 1 && (
            <div>
              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:18, margin:'0 0 4px' }}>Votre type de structure</h2>
              <p style={{ color:'#888', fontSize:13, fontFamily:'sans-serif', margin:'0 0 18px' }}>Choisissez votre catégorie professionnelle</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                {PRO_TYPES.map(t => (
                  <div key={t.v} onClick={() => up('pro_type', t.v)} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'13px 16px',
                    borderRadius:14, cursor:'pointer', transition:'all 0.15s',
                    border: form.pro_type === t.v ? '2px solid #0d4a3a' : '2px solid #f0f0f0',
                    background: form.pro_type === t.v ? '#e8f5ee' : 'white',
                  }}>
                    <span style={{ fontSize:22, flexShrink:0 }}>{t.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color: form.pro_type === t.v ? '#0d4a3a' : '#333', fontSize:14, fontFamily:'sans-serif' }}>{t.l}</div>
                      {t.isPublic && <div style={{ color:'#16a34a', fontSize:11, fontFamily:'sans-serif', marginTop:1 }}>🆓 Accès gratuit</div>}
                    </div>
                    <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${form.pro_type === t.v ? '#0d4a3a' : '#ddd'}`, background: form.pro_type === t.v ? '#0d4a3a' : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {form.pro_type === t.v && <div style={{ width:7, height:7, background:'white', borderRadius:'50%' }} />}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => form.pro_type && setStep(2)} disabled={!form.pro_type} style={{
                width:'100%', padding:'14px', borderRadius:50, border:'none', cursor: form.pro_type ? 'pointer' : 'not-allowed',
                background: form.pro_type ? 'linear-gradient(135deg,#0d4a3a,#2eb87a)' : '#e5e7eb',
                color: form.pro_type ? 'white' : '#aaa', fontWeight:700, fontSize:15, fontFamily:'sans-serif',
              }}>Continuer →</button>
            </div>
          )}

          {/* ÉTAPE 2 — Informations de la structure */}
          {step === 2 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:'#e8f5ee', borderRadius:12, padding:'10px 14px', marginBottom:18 }}>
                <span style={{ fontSize:20 }}>{selected?.icon}</span>
                <span style={{ fontWeight:700, color:'#0d4a3a', fontSize:13, fontFamily:'sans-serif' }}>{selected?.l}</span>
                <button onClick={() => setStep(1)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#888', fontSize:12, cursor:'pointer' }}>Changer</button>
              </div>

              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:18, margin:'0 0 16px' }}>Informations de la structure</h2>

              <label style={lbl}>Nom / Raison sociale *</label>
              <input style={inp} required placeholder="Dr. Dupont, Clinique Espoir, Pharmacie..." value={form.structure_name} onChange={e => up('structure_name', e.target.value)} />

              {['doctor','pharmacist','lab'].includes(form.pro_type) && <>
                <label style={lbl}>Spécialité</label>
                <input style={inp} placeholder="Cardiologie, Pédiatrie, Analyses biologiques..." value={form.specialty} onChange={e => up('specialty', e.target.value)} />
              </>}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lbl}>Ville *</label>
                  <select style={{ ...inp, marginBottom:0 }} value={form.city} onChange={e => up('city', e.target.value)}>
                    <option value="">Sélectionner</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Téléphone</label>
                  <input style={{ ...inp, marginBottom:0 }} placeholder="+237 6XX..." value={form.phone} onChange={e => up('phone', e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop:14 }}>
                <label style={lbl}>Adresse complète</label>
                <input style={inp} placeholder="Quartier, rue..." value={form.address} onChange={e => up('address', e.target.value)} />
              </div>

              <label style={lbl}>Description des activités</label>
              <textarea style={{ ...inp, resize:'vertical' }} rows={3} placeholder="Décrivez vos services, spécialités et horaires..." value={form.description} onChange={e => up('description', e.target.value)} />

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setStep(1)} style={{ flex:1, padding:'13px', borderRadius:50, border:'1.5px solid #e5e7eb', background:'white', color:'#666', fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>← Retour</button>
                <button onClick={() => form.structure_name && form.city && setStep(3)} disabled={!form.structure_name || !form.city} style={{
                  flex:2, padding:'13px', borderRadius:50, border:'none',
                  background: form.structure_name && form.city ? 'linear-gradient(135deg,#0d4a3a,#2eb87a)' : '#e5e7eb',
                  color: form.structure_name && form.city ? 'white' : '#aaa', fontWeight:700, fontSize:14, fontFamily:'sans-serif', cursor: form.structure_name && form.city ? 'pointer' : 'not-allowed',
                }}>Continuer →</button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Documents KYC + Compte */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:18, margin:'0 0 6px' }}>Identifiants & Documents KYC</h2>
              <p style={{ color:'#888', fontSize:12, fontFamily:'sans-serif', margin:'0 0 16px', lineHeight:1.5 }}>
                Votre profil sera visible après vérification de vos documents par notre équipe (24-48h).
              </p>

              <label style={lbl}>Email professionnel *</label>
              <input style={inp} type="email" required placeholder="contact@votrestructure.cm" value={form.email} onChange={e => up('email', e.target.value)} />

              <label style={lbl}>Mot de passe *</label>
              <input style={inp} type="password" required minLength={8} placeholder="Minimum 8 caractères" value={form.password} onChange={e => up('password', e.target.value)} />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:0 }}>
                <div>
                  <label style={lbl}>N° de licence / agrément</label>
                  <input style={{ ...inp }} placeholder="N° officiel" value={form.license_number} onChange={e => up('license_number', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>N° Ordre (médecins/pharmaciens)</label>
                  <input style={{ ...inp }} placeholder="Inscription Ordre" value={form.order_registration} onChange={e => up('order_registration', e.target.value)} />
                </div>
              </div>

              {/* Documents requis */}
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:16, marginBottom:16 }}>
                <p style={{ color:'#92400e', fontSize:12, fontFamily:'sans-serif', fontWeight:700, margin:'0 0 8px' }}>📋 Documents à envoyer pour validation :</p>
                {['Diplôme(s) et certificats professionnels', 'Agrément / Autorisation d\'exercice', 'Inscription à l\'Ordre (médecins/pharmaciens)', 'Pièce d\'identité officielle', form.pro_type === 'public_hospital' ? 'Acte de création de la structure publique' : 'Registre de commerce (structures privées)'].map((doc, i) => (
                  <div key={i} style={{ color:'#78350f', fontSize:12, fontFamily:'sans-serif', marginBottom:4, display:'flex', gap:6 }}>
                    <span>•</span><span>{doc}</span>
                  </div>
                ))}
                <p style={{ color:'#92400e', fontSize:11, fontFamily:'sans-serif', margin:'10px 0 0', fontStyle:'italic' }}>
                  📧 Envoyez vos documents à : <strong>kyc@santeconnect.cm</strong>
                </p>
              </div>

              {form.pro_type === 'public_hospital' && (
                <div style={{ background:'#e8f5ee', border:'1px solid #86efac', borderRadius:14, padding:14, marginBottom:16 }}>
                  <p style={{ color:'#14532d', fontSize:13, fontFamily:'sans-serif', margin:0, fontWeight:700 }}>
                    🏛️ Structure publique — Accès 100% gratuit après validation
                  </p>
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={() => setStep(2)} style={{ flex:1, padding:'13px', borderRadius:50, border:'1.5px solid #e5e7eb', background:'white', color:'#666', fontWeight:700, fontFamily:'sans-serif', cursor:'pointer' }}>← Retour</button>
                <button type="submit" disabled={loading} style={{
                  flex:2, padding:'13px', borderRadius:50, border:'none',
                  background: loading ? '#ccc' : 'linear-gradient(135deg,#0d4a3a,#2eb87a)',
                  color:'white', fontWeight:700, fontSize:14, fontFamily:'sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                  {loading ? '⏳ Création...' : '✅ Créer mon compte pro'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:14 }}>
          <Link href="/connexion" style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:'sans-serif', textDecoration:'none' }}>Déjà un compte ? Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
