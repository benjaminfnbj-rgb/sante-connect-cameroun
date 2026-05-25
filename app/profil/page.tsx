// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/connexion'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: s } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
      if (p) { setProfile(p); setForm({ full_name: p.full_name, phone: p.phone || '', city: p.city || '', gender: p.gender || '' }) }
      if (s) setSubscription(s)
      setLoading(false)
    })
  }, [router])

  async function save() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name, phone: form.phone || null, city: form.city || null, gender: form.gender || null
    }).eq('id', profile.id)
    if (!error) { setProfile({ ...profile, ...form }); setEditing(false); setMsg('✅ Profil mis à jour !') }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f0' }}>Chargement...</div>

  const subStatus = subscription?.status
  const subExpiry = subscription?.expires_at ? new Date(subscription.expires_at) : null
  const daysLeft = subExpiry ? Math.max(0, Math.ceil((subExpiry - Date.now()) / (1000*60*60*24))) : 0

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '100px 16px 40px' }}>
        {msg && <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#16a34a', fontSize: 14, fontFamily: 'sans-serif' }}>{msg}</div>}

        {/* Avatar + nom */}
        <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', borderRadius: 20, padding: '32px 24px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 12px' }}>
            {profile?.gender === 'female' ? '👩' : '👤'}
          </div>
          <h2 style={{ color: 'white', fontFamily: 'Georgia,serif', fontSize: 20, margin: '0 0 4px' }}>{profile?.full_name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'sans-serif', margin: 0 }}>{profile?.email}</p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 12px', marginTop: 8, color: 'white', fontSize: 12, fontFamily: 'sans-serif' }}>
            {profile?.user_type === 'patient' ? '👤 Patient' : profile?.user_type === 'professional' ? '👨‍⚕️ Professionnel' : profile?.user_type}
          </div>
        </div>

        {/* Abonnement */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: '#0d4a3a', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 14, margin: '0 0 14px' }}>🎫 Mon Abonnement</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: subStatus === 'active' ? '#16a34a' : subStatus === 'trial' ? '#d97706' : '#dc2626', fontSize: 16 }}>
                {subStatus === 'active' ? '✅ Actif' : subStatus === 'trial' ? `🎁 Essai gratuit — ${daysLeft} jours restants` : '🔒 Expiré'}
              </div>
              {subExpiry && <div style={{ color: '#888', fontSize: 12, fontFamily: 'sans-serif', marginTop: 4 }}>Expire le {subExpiry.toLocaleDateString('fr-FR')}</div>}
            </div>
            <Link href="/tarifs" style={{ background: '#0d4a3a', color: 'white', borderRadius: 10, padding: '8px 16px', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>
              {subStatus === 'active' ? 'Gérer' : "S'abonner"}
            </Link>
          </div>
        </div>

        {/* Infos perso */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#0d4a3a', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 14, margin: 0 }}>👤 Informations personnelles</h3>
            <button onClick={() => setEditing(!editing)} style={{ background: editing ? '#fee2e2' : '#f0fdf4', color: editing ? '#dc2626' : '#16a34a', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              {editing ? 'Annuler' : '✏️ Modifier'}
            </button>
          </div>
          {editing ? (
            <div>
              {[['full_name','Nom complet','text'],['phone','Téléphone','tel'],['city','Ville','text']].map(([k,l,t]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', color: '#888', fontSize: 12, fontFamily: 'sans-serif', marginBottom: 4 }}>{l}</label>
                  <input type={t} value={form[k] || ''} onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', color: '#888', fontSize: 12, fontFamily: 'sans-serif', marginBottom: 4 }}>Genre</label>
                <select value={form.gender || ''} onChange={e => setForm(p => ({...p, gender: e.target.value}))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, background: 'white' }}>
                  <option value="">Non précisé</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <button onClick={save} disabled={saving} style={{ width: '100%', padding: 12, borderRadius: 12, background: '#0d4a3a', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['📧 Email', profile?.email],['📱 Téléphone', profile?.phone || '—'],['📍 Ville', profile?.city || '—'],['⚥ Genre', profile?.gender === 'male' ? 'Homme' : profile?.gender === 'female' ? 'Femme' : '—']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888', fontSize: 13, fontFamily: 'sans-serif' }}>{l}</span>
                  <span style={{ color: '#0d4a3a', fontSize: 13, fontFamily: 'sans-serif', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {[
            { href: '/dashboard', icon: '🏠', label: 'Tableau de bord' },
            { href: '/rendez-vous', icon: '📅', label: 'Mes rendez-vous' },
            { href: '/dashboard/kits', icon: '🎁', label: 'Mon kit santé' },
            { href: '/tarifs', icon: '💳', label: 'Gérer mon abonnement' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ color: '#0d4a3a', fontFamily: 'sans-serif', fontWeight: 600, fontSize: 14 }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', color: '#aaa' }}>›</span>
            </Link>
          ))}
          <button onClick={logout} style={{ width: '100%', padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            <span style={{ color: '#dc2626', fontFamily: 'sans-serif', fontWeight: 600, fontSize: 14 }}>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  )
}
