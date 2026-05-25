// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

const CATEGORIES = {
  medical:    { label: 'Urgences Médicales', icon: '🚑', color: '#dc2626' },
  fire:       { label: 'Sapeurs-Pompiers',    icon: '🚒', color: '#ea580c' },
  police:     { label: 'Police / Sécurité',   icon: '🚔', color: '#2563eb' },
  gendarmerie:{ label: 'Gendarmerie',         icon: '⚖️',  color: '#4f46e5' },
  universal:  { label: 'Numéro Universel',    icon: '📞', color: '#0d4a3a' },
  humanitarian:{ label: 'Aide Humanitaire',  icon: '❤️',  color: '#db2777' },
  road:       { label: 'Sécurité Routière',   icon: '🛣️',  color: '#ca8a04' },
  health_info:{ label: 'Info Santé',          icon: '💬', color: '#0891b2' },
  epidemic:   { label: 'Épidémies',           icon: '🦠',  color: '#7c3aed' },
  poison:     { label: 'Anti-Poison',         icon: '☠️',  color: '#374151' },
  violence:   { label: 'Aide aux Victimes',   icon: '🛡️',  color: '#be123c' },
}

const CITIES = ['Toutes les villes', 'Nationale', 'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Bertoua', 'Buea', 'Ebolowa', 'Ngaoundéré', 'Limbé']

export default function UrgencesPage() {
  const [numbers, setNumbers] = useState([])
  const [city, setCity] = useState('Toutes les villes')
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('emergency_contacts').select('*').order('is_national', { ascending: false }).then(({ data }) => {
      if (data) setNumbers(data)
    })
  }, [])

  const filtered = numbers.filter(n => {
    const matchCity = city === 'Toutes les villes' ||
      (city === 'Nationale' && n.is_national) ||
      (!n.is_national && n.city === city)
    const matchCat = cat === 'all' || n.category === cat
    const matchSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.number.includes(search)
    return matchCity && matchCat && matchSearch
  })

  const nationals = filtered.filter(n => n.is_national)
  const locals = filtered.filter(n => !n.is_national)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <Navbar />
      {/* Hero rouge urgence */}
      <div style={{ background: 'linear-gradient(135deg,#dc2626,#7f1d1d)', padding: '48px 20px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🚨</div>
        <h1 style={{ color: 'white', fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 700, margin: '0 0 8px' }}>
          Numéros d&apos;Urgence
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, margin: '0 0 24px' }}>
          Cameroun — Disponibles 24h/24 · 7j/7
        </p>
        {/* Boutons numéros critiques */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 500, margin: '0 auto' }}>
          {[
            { num: '15', label: 'SAMU', icon: '🚑' },
            { num: '18', label: 'Pompiers', icon: '🚒' },
            { num: '17', label: 'Police', icon: '🚔' },
            { num: '1730', label: 'Gendarmerie', icon: '⚖️' },
            { num: '112', label: 'Urgences', icon: '📞' },
            { num: '1510', label: 'Info Santé', icon: '💬' },
          ].map(e => (
            <a key={e.num} href={`tel:${e.num}`} style={{
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 16,
              padding: '12px 16px', textDecoration: 'none', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 20 }}>{e.icon}</div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{e.num}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 }}>{e.label}</div>
            </a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '-20px auto 40px', padding: '0 16px' }}>
        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <input
            placeholder="🔍 Rechercher un service, numéro..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 14, boxSizing: 'border-box', marginBottom: 12, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <select value={city} onChange={e => setCity(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={cat} onChange={e => setCat(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
              <option value="all">Toutes catégories</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
          </div>
          <p style={{ color: '#888', fontSize: 12, margin: 0 }}>{filtered.length} numéro(s) trouvé(s)</p>
        </div>

        {/* Numéros nationaux */}
        {nationals.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: '#0d4a3a', fontFamily: 'Georgia,serif', fontSize: 18, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              🇨🇲 Numéros Nationaux
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {nationals.map(n => <NumberCard key={n.id} n={n} />)}
            </div>
          </div>
        )}

        {/* Numéros locaux groupés par ville */}
        {locals.length > 0 && (
          <div>
            <h2 style={{ color: '#0d4a3a', fontFamily: 'Georgia,serif', fontSize: 18, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              📍 Numéros Locaux
            </h2>
            {CITIES.filter(c => c !== 'Toutes les villes' && c !== 'Nationale').map(c => {
              const cityNums = locals.filter(n => n.city === c)
              if (cityNums.length === 0) return null
              return (
                <div key={c} style={{ marginBottom: 20 }}>
                  <h3 style={{ color: '#444', fontSize: 14, fontFamily: 'sans-serif', fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
                    📍 {c}
                  </h3>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {cityNums.map(n => <NumberCard key={n.id} n={n} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>Aucun numéro trouvé pour cette recherche</p>
          </div>
        )}

        {/* Avertissement */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 16, padding: 20, marginTop: 24, textAlign: 'center' }}>
          <p style={{ color: '#92400e', fontSize: 13, fontFamily: 'sans-serif', margin: 0, lineHeight: 1.6 }}>
            ⚠️ <strong>En cas d&apos;urgence vitale</strong>, composez le <strong>15 (SAMU)</strong>, <strong>18 (Pompiers)</strong> ou <strong>112</strong> immédiatement.<br />
            Ces numéros sont disponibles même sans abonnement actif sur Santé Connect.
          </p>
        </div>
      </div>
    </div>
  )
}

function NumberCard({ n }: { n: any }) {
  const cat = CATEGORIES[n.category] || { label: n.category, icon: '📞', color: '#666' }
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, border: `1px solid ${cat.color}22` }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {cat.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 14, fontFamily: 'sans-serif' }}>{n.name}</div>
        <div style={{ color: cat.color, fontWeight: 700, fontSize: 18, fontFamily: 'monospace' }}>{n.number}</div>
        <div style={{ color: '#888', fontSize: 11, fontFamily: 'sans-serif' }}>
          {cat.label}{n.city ? ` · ${n.city}` : ' · National'}
        </div>
      </div>
      <a href={`tel:${n.number}`} style={{
        background: cat.color, color: 'white', borderRadius: 12, padding: '10px 16px',
        textDecoration: 'none', fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
      }}>
        📞 Appeler
      </a>
    </div>
  )
}
