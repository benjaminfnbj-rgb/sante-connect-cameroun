'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

type Pro = {
  id: string
  full_name: string
  pro_type: string
  specialty: string
  city: string
  description: string
  likes: number
  dislikes: number
  is_verified: boolean
  avatar_url: string
}

const proTypes: Record<string, string> = {
  doctor: 'Médecin', pharmacist: 'Pharmacien', clinic: 'Clinique',
  hospital: 'Hôpital', ngo: 'ONG', insurance: 'Assurance',
  un_agency: 'Agence ONU', public_hospital: 'Hôpital Public', lab: 'Laboratoire'
}
const proIcons: Record<string, string> = {
  doctor: '👨‍⚕️', pharmacist: '💊', clinic: '🏥', hospital: '🏨',
  ngo: '🤝', insurance: '🛡️', un_agency: '🌐', public_hospital: '🏛️', lab: '🔬'
}

export default function Professionals() {
  const [pros, setPros] = useState<Pro[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCity, setFilterCity] = useState('all')

  useEffect(() => { loadPros() }, [])

  async function loadPros() {
    const { data } = await supabase.from('professionals').select('*').eq('is_blurred', false).order('likes', { ascending: false })
    if (data) setPros(data)
    setLoading(false)
  }

  async function handleRate(proId: string, isLike: boolean) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/auth/login'; return }
    const { data: userData } = await supabase.from('users').select('id').eq('auth_id', session.user.id).single()
    if (!userData) return

    await supabase.from('ratings').upsert({ patient_id: userData.id, professional_id: proId, is_like: isLike })
    const col = isLike ? 'likes' : 'dislikes'
    await supabase.from('professionals').update({ [col]: pros.find(p => p.id === proId)?.[col as 'likes'|'dislikes']! + 1 }).eq('id', proId)
    loadPros()
  }

  const cities = ['all', ...Array.from(new Set(pros.map(p => p.city).filter(Boolean)))]
  const types = ['all', ...Array.from(new Set(pros.map(p => p.pro_type).filter(Boolean)))]

  const filtered = pros.filter(p => {
    const matchSearch = !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.specialty?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || p.pro_type === filterType
    const matchCity = filterCity === 'all' || p.city === filterCity
    return matchSearch && matchType && matchCity
  })

  return (
    <div className="min-h-screen" style={{background:'var(--cream)'}}>
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="hero-gradient py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-4">Annuaire des Professionnels</h1>
            <p className="font-sans text-green-200 text-lg mb-8">Tous nos professionnels de santé sont vérifiés (KYC Pro)</p>
            <div className="flex flex-wrap gap-3 max-w-2xl mx-auto">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="form-input flex-1" placeholder="Rechercher par nom, spécialité..." />
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="form-input w-40">
                <option value="all">Toutes les villes</option>
                {cities.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Type filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {types.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`font-sans text-sm px-4 py-2 rounded-full transition-all ${filterType === t ? 'btn-primary' : 'btn-outline'}`}>
                {t === 'all' ? 'Tous' : proTypes[t] || t}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div style={{fontSize:'48px'}}>⚕️</div>
              <p className="font-sans mt-4" style={{color:'var(--text-mid)'}}>Chargement...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(pro => (
                <div key={pro.id} className="pro-card">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(0,132,61,0.08)', fontSize:'32px'}}>
                        {proIcons[pro.pro_type] || '🏥'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold" style={{color:'var(--green-deep)'}}>{pro.full_name}</h3>
                          {pro.is_verified && <span className="badge badge-green text-xs">✓ Vérifié</span>}
                        </div>
                        <div className="font-sans text-sm" style={{color:'var(--text-light)'}}>{proTypes[pro.pro_type]}</div>
                        {pro.specialty && <span className="badge badge-blue text-xs mt-1">{pro.specialty}</span>}
                        <div className="font-sans text-xs mt-1" style={{color:'var(--text-light)'}}>📍 {pro.city}</div>
                      </div>
                    </div>
                    {pro.description && (
                      <p className="font-sans text-sm mb-4 line-clamp-2" style={{color:'var(--text-mid)'}}>{pro.description}</p>
                    )}
                    {/* Rating */}
                    <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{background:'rgba(0,132,61,0.04)', border:'1px solid rgba(0,132,61,0.08)'}}>
                      <div className="flex items-center gap-1">
                        <span className="font-sans text-sm font-bold" style={{color:'var(--green-mid)'}}>👍 {pro.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-sans text-sm font-bold" style={{color:'var(--red-alert)'}}>👎 {pro.dislikes}</span>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button onClick={() => handleRate(pro.id, true)} className="btn-outline text-xs py-1 px-3" style={{color:'var(--green-mid)', borderColor:'var(--green-mid)'}}>👍</button>
                        <button onClick={() => handleRate(pro.id, false)} className="btn-outline text-xs py-1 px-3" style={{color:'var(--red-alert)', borderColor:'var(--red-alert)'}}>👎</button>
                      </div>
                    </div>
                    <Link href={`/professionals/${pro.id}`} className="btn-primary w-full text-center block text-sm py-2.5">
                      Voir le profil & prendre RDV
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div style={{fontSize:'64px', marginBottom:'16px'}}>🔍</div>
              <p className="font-display text-2xl font-bold mb-2" style={{color:'var(--green-deep)'}}>Aucun résultat</p>
              <p className="font-sans" style={{color:'var(--text-mid)'}}>Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
