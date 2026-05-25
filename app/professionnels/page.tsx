// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

const SPECIALTIES = ['Toutes', 'Médecin généraliste', 'Pédiatre', 'Gynécologue', 'Cardiologue', 'Dermatologue', 'Chirurgien', 'Ophtalmologue', 'Dentiste', 'Neurologue', 'Psychiatre', 'Kinésithérapeute', 'Radiologue', 'Urgentiste']
const CITIES = ['Toutes', 'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Bertoua', 'Buea', 'Ebolowa', 'Ngaoundéré']
const PRO_TYPES = { professional: '👨‍⚕️ Médecin', pharmacy: '💊 Pharmacie', insurance: '🛡️ Assurance', ngo: '🤝 ONG', structure: '🏥 Structure' }

export default function ProfessionnelsPage() {
  const [pros, setPros] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('Toutes')
  const [city, setCity] = useState('Toutes')
  const [type, setType] = useState('all')

  useEffect(() => {
    supabase
      .from('professional_profiles')
      .select('*, profiles(full_name, avatar_url, city, user_type, email)')
      .eq('verification_status', 'verified')
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        setPros(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = pros.filter(p => {
    const name = p.structure_name || p.profiles?.full_name || ''
    const spec = p.specialty || ''
    const proCity = p.city || p.profiles?.city || ''
    const q = search.toLowerCase()
    return (
      (!search || name.toLowerCase().includes(q) || spec.toLowerCase().includes(q)) &&
      (specialty === 'Toutes' || spec.toLowerCase().includes(specialty.toLowerCase())) &&
      (city === 'Toutes' || proCity.toLowerCase().includes(city.toLowerCase())) &&
      (type === 'all' || p.structure_type === type || p.profiles?.user_type === type)
    )
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding: '40px 20px 56px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>👨‍⚕️</div>
        <h1 style={{ color: 'white', fontSize: 28, fontFamily: 'Georgia,serif', fontWeight: 700, margin: '0 0 8px' }}>
          Professionnels de Santé
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: 0 }}>
          Médecins, pharmacies, assurances et ONG vérifiés au Cameroun
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '-20px auto 40px', padding: '0 16px' }}>
        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <input placeholder="🔍 Rechercher un médecin, spécialité, structure..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', marginBottom: 12, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
              {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={city} onChange={e => setCity(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
              <option value="all">Tous les types</option>
              {Object.entries(PRO_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <p style={{ color: '#888', fontSize: 12, margin: '10px 0 0', fontFamily: 'sans-serif' }}>
            {loading ? 'Chargement...' : `${filtered.length} professionnel(s) trouvé(s)`}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #0d4a3a', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#888', fontFamily: 'sans-serif' }}>Chargement des professionnels...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ color: '#888', fontFamily: 'sans-serif', marginBottom: 8 }}>Aucun professionnel trouvé</p>
            <p style={{ color: '#aaa', fontSize: 13, fontFamily: 'sans-serif' }}>
              Vous êtes professionnel de santé ? <Link href="/auth/register?type=professional" style={{ color: '#0d4a3a', fontWeight: 700 }}>Inscrivez-vous</Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filtered.map(p => <ProCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProCard({ p }) {
  const name = p.structure_name || p.profiles?.full_name || 'Professionnel'
  const city = p.city || p.profiles?.city || ''
  const type = p.profiles?.user_type || 'professional'
  const typeLabel = PRO_TYPES[type] || '👤 Professionnel'

  return (
    <Link href={`/professionals/${p.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: 18, padding: '18px 20px', boxShadow: '0 2px 14px rgba(0,0,0,0.06)', border: '1px solid #f0f0eb', display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, overflow: 'hidden' }}>
          {p.profile_photo ? <img src={p.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍⚕️'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 16, fontFamily: 'Georgia,serif' }}>{name}</span>
            <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>✓ Vérifié</span>
            {p.is_public_sector && <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>🏛️ Public · Gratuit</span>}
          </div>
          <div style={{ color: '#2eb87a', fontSize: 13, fontFamily: 'sans-serif', marginBottom: 4 }}>
            {typeLabel}{p.specialty ? ` · ${p.specialty}` : ''}
          </div>
          <div style={{ color: '#888', fontSize: 12, fontFamily: 'sans-serif' }}>
            📍 {city || 'Cameroun'}
          </div>
          {p.description && (
            <p style={{ color: '#555', fontSize: 13, fontFamily: 'sans-serif', margin: '6px 0 0', lineHeight: 1.5 }}>
              {p.description.slice(0, 100)}{p.description.length > 100 ? '...' : ''}
            </p>
          )}
        </div>
        <div style={{ color: '#0d4a3a', fontWeight: 700, fontSize: 12, fontFamily: 'sans-serif', flexShrink: 0, background: '#f0fdf4', borderRadius: 10, padding: '8px 12px' }}>
          Voir →
        </div>
      </div>
    </Link>
  )
}

