// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowLeft, Star, MapPin, ThumbsUp, ThumbsDown, Filter } from 'lucide-react'

export default function ProfessionnelsPage() {
  const [professionals, setProfessionals] = useState<Record<string, string | number | boolean | null>[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [specialty, setSpecialty] = useState('')

  useEffect(() => {
    const supabase = createClient()
    const query = supabase
      .from('professional_profiles')
      .select(`*, profiles!inner(full_name, avatar_url, city, role)`)
      .eq('is_public', true)
      .eq('verification_status', 'verified')

    query.then(({ data }) => { setProfessionals(data || []); setLoading(false) })
  }, [])

  const filtered = professionals.filter(p => {
    const profile = p.profiles as Record<string, string>
    const name = profile?.full_name?.toLowerCase() || ''
    const spec = (p.specialty as string)?.toLowerCase() || ''
    const q = search.toLowerCase()
    return (!search || name.includes(q) || spec.includes(q)) &&
           (!specialty || spec.includes(specialty.toLowerCase()))
  })

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream)'}}>
      <header className="sticky top-0 z-40 px-4 py-4" style={{background: 'white', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard"><ArrowLeft size={20} style={{color: 'var(--text-muted)'}} /></Link>
            <span className="font-bold text-lg" style={{fontFamily: 'Fraunces, serif'}}>Professionnels de santé</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color: 'var(--text-muted)'}} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Médecin, spécialité, nom..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm"
                style={{background: 'var(--bg-cream)', border: '1px solid var(--border)'}} />
            </div>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{background: 'var(--bg-cream)', border: '1px solid var(--border)'}}>
              <option value="">Toutes spécialités</option>
              <option>Médecine générale</option>
              <option>Pédiatrie</option>
              <option>Gynécologie</option>
              <option>Dermatologie</option>
              <option>Cardiologie</option>
              <option>Ophtalmologie</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20" style={{color: 'var(--text-muted)'}}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium mb-2" style={{color: 'var(--text-dark)'}}>Aucun professionnel trouvé</p>
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>Modifiez vos critères de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>{filtered.length} professionnel(s) trouvé(s)</p>
            {filtered.map((pro, i) => {
              const profile = pro.profiles as Record<string, string>
              const likes = pro.likes as number || 0
              const dislikes = pro.dislikes as number || 0
              const total = likes + dislikes
              const rating = total > 0 ? Math.round((likes / total) * 100) : null
              return (
                <Link key={i} href={`/professionnels/${(pro.user_id as string)}`}
                  className="block p-5 rounded-2xl bg-card-hover"
                  style={{background: 'white', border: '1px solid var(--border)', textDecoration: 'none'}}>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl" style={{background: 'var(--green-deep)'}}>
                      {profile?.full_name?.[0] || 'P'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold" style={{color: 'var(--text-dark)'}}>{profile?.full_name}</p>
                          <p className="text-sm" style={{color: 'var(--green-mid)'}}>{pro.specialty as string || 'Professionnel de santé'}</p>
                          <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                            <MapPin size={12} className="inline mr-1" />{profile?.city || 'Cameroun'}
                          </p>
                        </div>
                        {rating !== null && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <ThumbsUp size={14} style={{color: 'var(--green-mid)'}} />
                              <span className="text-sm font-bold" style={{color: 'var(--green-mid)'}}>{rating}%</span>
                            </div>
                            <p className="text-xs" style={{color: 'var(--text-muted)'}}>{total} avis</p>
                          </div>
                        )}
                      </div>
                      {pro.description && (
                        <p className="text-sm mt-2 line-clamp-2" style={{color: 'var(--text-muted)'}}>{pro.description as string}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
