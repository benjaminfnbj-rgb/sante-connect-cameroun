// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PharmaciePage() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [guardOnly, setGuardOnly] = useState(false)
  const [region, setRegion] = useState('')
  const [userType, setUserType] = useState('')

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('professional_profiles')
        .select('*')
        .eq('structure_type', 'pharmacy')
        .eq('verification_status', 'verified')
        .eq('is_visible', true)
        .order('is_on_duty', { ascending: false })
        .order('structure_name'),
      sb.auth.getSession().then(({ data: { session } }) =>
        session?.user?.id
          ? sb.from('profiles').select('user_type').eq('id', session.user.id).single()
          : { data: null }
      )
    ]).then(([{ data: pharms }, profileRes]) => {
      setPharmacies(pharms || [])
      setUserType(profileRes?.data?.user_type || '')
      setLoading(false)
    })
  }, [])

  const regions = ['Toutes', ...Array.from(new Set(pharmacies.map((p: any) => p.region).filter(Boolean))).sort()]

  const filtered = pharmacies.filter((p: any) => {
    const matchSearch = !search ||
      p.structure_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase())
    const matchGuard = !guardOnly || p.is_on_duty
    const matchRegion = !region || region === 'Toutes' || p.region === region
    return matchSearch && matchGuard && matchRegion
  })

  const onDutyCount = pharmacies.filter((p: any) => p.is_on_duty).length

  const toggleDuty = async (id: string, current: boolean) => {
    const sb = createClient()
    await sb.from('professional_profiles').update({
      is_on_duty: !current,
      duty_until: !current ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
    }).eq('id', id)
    setPharmacies(prev => prev.map((p: any) =>
      p.id === id ? { ...p, is_on_duty: !current } : p
    ))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e8f5ee', borderTopColor: '#0d4a3a', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'sans-serif', paddingBottom: 40 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#0a2e22,#0d4a3a)', padding: '20px 16px 32px', position: 'relative' }}>
        <Link href="/dashboard" style={{ position: 'absolute', top: 16, left: 16, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13 }}>← Retour</Link>
        {userType === 'pharmacy' && (
          <Link href="/mon-profil-pro" style={{ position: 'absolute', top: 12, right: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 12px', color: 'white', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            ⚙️ Mon profil
          </Link>
        )}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>💊</div>
          <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Pharmacies partenaires</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '0 0 14px' }}>
            Appelez directement pour vérifier la disponibilité
          </p>
          {/* Badge gardes */}
          {onDutyCount > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(220,38,38,0.9)', borderRadius: 50, padding: '6px 16px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fca5a5', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>
                {onDutyCount} pharmacie{onDutyCount > 1 ? 's' : ''} de garde en ce moment
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 14px' }}>

        {/* Barre recherche */}
        <div style={{ background: 'white', borderRadius: 18, padding: '12px 16px', margin: '-16px 0 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom, ville, quartier..."
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'sans-serif' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16 }}>✕</button>
          )}
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {/* Toggle garde */}
          <button onClick={() => setGuardOnly(!guardOnly)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
            background: guardOnly ? '#dc2626' : 'white',
            color: guardOnly ? 'white' : '#555',
            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
          }}>
            {guardOnly && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fca5a5', display: 'inline-block', animation: 'pulse 1s infinite' }} />}
            🏥 De garde uniquement
          </button>

          {/* Filtre région */}
          {regions.length > 2 && (
            <select value={region} onChange={e => setRegion(e.target.value)} style={{
              padding: '8px 12px', borderRadius: 50, border: 'none', fontSize: 12, fontWeight: 600,
              background: 'white', color: '#555', boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
              outline: 'none', cursor: 'pointer',
            }}>
              {regions.map(r => <option key={r} value={r === 'Toutes' ? '' : r}>{r}</option>)}
            </select>
          )}
        </div>

        {/* Résultats */}
        {filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 18, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💊</div>
            <p style={{ color: '#888', fontSize: 14 }}>
              {pharmacies.length === 0
                ? 'Aucune pharmacie partenaire pour le moment.'
                : guardOnly ? 'Aucune pharmacie de garde actuellement.'
                : 'Aucune pharmacie pour cette recherche.'}
            </p>
            {userType === 'pharmacy' && (
              <Link href="/mon-profil-pro" style={{ display: 'inline-block', marginTop: 12, background: '#0d4a3a', color: 'white', borderRadius: 50, padding: '10px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                Compléter mon profil →
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((ph: any, i: number) => (
              <div key={ph.id} style={{
                background: 'white', borderRadius: 18, overflow: 'hidden',
                boxShadow: ph.is_on_duty ? '0 4px 20px rgba(220,38,38,0.12)' : '0 2px 10px rgba(0,0,0,0.06)',
                border: ph.is_on_duty ? '2px solid #fecaca' : '2px solid transparent',
                animation: `fadeUp ${.1 + i * .05}s ease`,
              }}>
                {/* Badge garde en haut */}
                {ph.is_on_duty && (
                  <div style={{ background: '#dc2626', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fca5a5', display: 'inline-block', animation: 'pulse 1s infinite', flexShrink: 0 }} />
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>
                      🏥 PHARMACIE DE GARDE — Ouverte en ce moment
                    </span>
                  </div>
                )}

                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Photo */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: ph.is_on_duty ? '#fef2f2' : '#e8f5ee',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                      border: `2px solid ${ph.is_on_duty ? '#fecaca' : '#d1fae5'}`,
                      overflow: 'hidden',
                    }}>
                      {ph.profile_photo_url
                        ? <img src={ph.profile_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '💊'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: '#0d4a3a', fontSize: 15, marginBottom: 3 }}>{ph.structure_name}</div>

                      {/* Localisation */}
                      {(ph.city || ph.region) && (
                        <div style={{ color: '#888', fontSize: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>📍</span>
                          <span>{[ph.address, ph.city, ph.region].filter(Boolean).join(', ')}</span>
                        </div>
                      )}

                      {/* Horaires */}
                      {ph.opening_hours && (
                        <div style={{ color: '#888', fontSize: 11, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>🕐</span>
                          <span>{ph.opening_hours}</span>
                        </div>
                      )}

                      {/* Description courte */}
                      {ph.description && (
                        <p style={{ color: '#666', fontSize: 12, margin: '0 0 8px', lineHeight: 1.5 }}>{ph.description}</p>
                      )}

                      {/* Notation */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        <span style={{ background: '#e8f5ee', color: '#0d4a3a', borderRadius: 7, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>👍 {ph.likes || 0}</span>
                        <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: 7, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>👎 {ph.dislikes || 0}</span>
                      </div>

                      {/* Boutons contact */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ph.phone && (
                          <a href={`tel:${ph.phone}`} style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: '#0d4a3a', color: 'white', borderRadius: 10,
                            padding: '9px 14px', textDecoration: 'none', fontWeight: 700, fontSize: 12,
                            boxShadow: '0 2px 8px rgba(13,74,58,0.25)',
                          }}>
                            📞 Appeler
                          </a>
                        )}
                        {ph.whatsapp && (
                          <a href={`https://wa.me/${ph.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: '#16a34a', color: 'white', borderRadius: 10,
                            padding: '9px 14px', textDecoration: 'none', fontWeight: 700, fontSize: 12,
                            boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                          }}>
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bouton de garde — visible uniquement pour les pharmacies */}
                {userType === 'pharmacy' && (
                  <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 16px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888', fontSize: 11 }}>Statut de garde</span>
                    <button onClick={() => toggleDuty(ph.id, ph.is_on_duty)} style={{
                      padding: '7px 16px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                      background: ph.is_on_duty ? '#dc2626' : '#0d4a3a',
                      color: 'white',
                    }}>
                      {ph.is_on_duty ? '✓ Je suis de garde — Désactiver' : '🏥 Activer la garde'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Note bas de page */}
        <div style={{ background: '#fffbeb', borderRadius: 14, padding: '12px 14px', marginTop: 16, border: '1px solid #fde68a' }}>
          <p style={{ color: '#92400e', fontSize: 11, margin: 0, lineHeight: 1.6 }}>
            💡 <strong>Comment utiliser :</strong> Appelez ou envoyez un WhatsApp pour vérifier la disponibilité du médicament avant de vous déplacer. Les pharmacies de garde sont disponibles en dehors des horaires normaux.
          </p>
        </div>

        {/* CTA inscription pharmacie */}
        <div style={{ background: 'linear-gradient(135deg,#0a2e22,#0d4a3a)', borderRadius: 16, padding: '18px', textAlign: 'center', marginTop: 14 }}>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 4px' }}>Vous êtes pharmacien ?</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: '0 0 12px' }}>Rejoignez la plateforme et soyez visible par des milliers de patients</p>
          <Link href="/auth/register-pro" style={{ display: 'inline-block', background: 'white', color: '#0d4a3a', borderRadius: 50, padding: '10px 24px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            Inscrire ma pharmacie →
          </Link>
        </div>
      </div>
    </div>
  )
}
