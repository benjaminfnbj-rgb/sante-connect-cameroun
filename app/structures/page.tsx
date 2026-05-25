// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

// ─── Pyramide sanitaire du Cameroun ─────────────────────────────────────────
const PYRAMID = [
  {
    cat: 1, level: 'strategique',
    label: 'Hôpitaux Généraux & CHU',
    short: 'HG / CHU',
    desc: 'Sommet de la pyramide — Soins ultra-spécialisés, enseignement universitaire, recherche clinique',
    examples: ['Hôpital Général (HG)', 'Centre Hospitalier Universitaire (CHU)'],
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    icon: '🏛️', acceptsFrom: [2,3,4,5,6], canReferTo: [],
  },
  {
    cat: 2, level: 'strategique',
    label: 'Hôpitaux Centraux',
    short: 'HC',
    desc: 'Référence nationale disciplinaire — Formation médicale, plateaux techniques avancés',
    examples: ['Hôpital Central (HC)'],
    color: '#ea580c', bg: '#fff7ed', border: '#fed7aa',
    icon: '🏥', acceptsFrom: [3,4,5,6], canReferTo: [1],
  },
  {
    cat: 3, level: 'intermediaire',
    label: 'Hôpitaux Régionaux',
    short: 'HR / HRA / CHR',
    desc: 'Référence régionale — Soins spécialisés, chirurgie complexe, imagerie médicale',
    examples: ['Hôpital Régional (HR)', 'Hôpital Régional Annexe (HRA)', 'Centre Hospitalier Régional (CHR)'],
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
    icon: '🏦', acceptsFrom: [4,5,6], canReferTo: [1,2],
  },
  {
    cat: 4, level: 'operationnel',
    label: 'Hôpitaux de District',
    short: 'HD',
    desc: 'Soins hospitaliers de base — Chirurgie générale, maternité niveau 2, laboratoire',
    examples: ['Hôpital de District (HD)'],
    color: '#16a34a', bg: '#f0fdf4', border: '#86efac',
    icon: '🏨', acceptsFrom: [5,6], canReferTo: [1,2,3],
  },
  {
    cat: 5, level: 'operationnel',
    label: 'Centres Médicaux d\'Arrondissement',
    short: 'CMA',
    desc: 'Soins intermédiaires — Chirurgie légère, maternité, consultations spécialisées simples',
    examples: ['Centre Médical d\'Arrondissement (CMA)'],
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    icon: '🏪', acceptsFrom: [6], canReferTo: [1,2,3,4],
  },
  {
    cat: 6, level: 'operationnel',
    label: 'Centres de Santé Intégrés / Arrondissement',
    short: 'CSI / CSA',
    desc: 'Premier contact — Soins de base, consultations générales, maternité, vaccination, prévention',
    examples: ['Centre de Santé Intégré (CSI)', 'Centre de Santé d\'Arrondissement (CSA)'],
    color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd',
    icon: '🏘️', acceptsFrom: [], canReferTo: [1,2,3,4,5],
  },
]

const PRIVATE_CAT = {
  label: 'Structures Sanitaires Privées',
  short: 'Privé',
  desc: 'Cliniques, cabinets médicaux, hôpitaux privés — Accès direct ou sur référence',
  examples: ['Clinique Privée', 'Cabinet Médical', 'Centre de Santé Privé', 'Hôpital Confessionnel'],
  color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe',
  icon: '🏥',
}

const REGIONS = ['Toutes', 'Centre', 'Littoral', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Nord', 'Extrême-Nord', 'Adamaoua', 'Est', 'Sud']

export default function StructuresPage() {
  const [structures, setStructures] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [region, setRegion] = useState('Toutes')
  const [search, setSearch] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  const [referralFrom, setReferralFrom] = useState(null)
  const [view, setView] = useState('pyramid') // 'pyramid' | 'list'

  useEffect(() => {
    supabase.from('professional_profiles')
      .select('*')
      .eq('verification_status', 'verified')
      .eq('is_visible', true)
      .then(({ data }) => { if (data) setStructures(data) })
  }, [])

  const getCatInfo = (cat) => PYRAMID.find(p => p.cat === cat)

  // Filtre référence/contre-référence
  const getReferralPath = (fromCat) => {
    const info = getCatInfo(fromCat)
    if (!info) return []
    return info.canReferTo.map(c => getCatInfo(c)).filter(Boolean)
  }

  const filtered = structures.filter(s => {
    const matchCat = selectedCat === null || s.health_category === selectedCat
    const matchRegion = region === 'Toutes' || s.region === region
    const matchSearch = !search || s.structure_name?.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchRegion && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding: '40px 20px 56px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🏥</div>
        <h1 style={{ color: 'white', fontSize: 28, fontFamily: 'Georgia,serif', fontWeight: 700, margin: '0 0 8px' }}>
          Structures Sanitaires
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: '0 0 20px' }}>
          Pyramide sanitaire du Cameroun — 6 niveaux + Secteur privé
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {['pyramid', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: view === v ? 'white' : 'rgba(255,255,255,0.2)',
              color: view === v ? '#0d4a3a' : 'white',
              fontWeight: 700, fontSize: 13,
            }}>
              {v === 'pyramid' ? '🔺 Pyramide' : '📋 Liste'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '-20px auto 40px', padding: '0 16px' }}>

        {/* Outil Référence/Contre-Référence */}
        <div style={{ background: 'white', borderRadius: 20, padding: 20, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showReferral ? 16 : 0 }}>
            <div>
              <h3 style={{ color: '#0d4a3a', fontSize: 15, fontWeight: 700, fontFamily: 'sans-serif', margin: 0 }}>
                🔄 Outil Référence / Contre-Référence
              </h3>
              <p style={{ color: '#888', fontSize: 12, margin: '4px 0 0', fontFamily: 'sans-serif' }}>
                Parcours patient selon la pyramide sanitaire
              </p>
            </div>
            <button onClick={() => setShowReferral(!showReferral)} style={{
              padding: '8px 16px', borderRadius: 12, border: '1.5px solid #0d4a3a',
              background: showReferral ? '#0d4a3a' : 'white', color: showReferral ? 'white' : '#0d4a3a',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>
              {showReferral ? 'Fermer' : 'Ouvrir'}
            </button>
          </div>

          {showReferral && (
            <div>
              <p style={{ color: '#444', fontSize: 13, fontFamily: 'sans-serif', margin: '0 0 14px', lineHeight: 1.6 }}>
                Le système de santé camerounais suit une logique de <strong>référence ascendante</strong> (CSI → CHU) 
                et de <strong>contre-référence descendante</strong> (CHU → CSI) pour assurer la continuité des soins.
                Sélectionnez votre point de départ :
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {PYRAMID.slice().reverse().map(p => (
                  <button key={p.cat} onClick={() => setReferralFrom(referralFrom === p.cat ? null : p.cat)} style={{
                    padding: '8px 14px', borderRadius: 12, border: `2px solid ${p.color}`,
                    background: referralFrom === p.cat ? p.color : p.bg,
                    color: referralFrom === p.cat ? 'white' : p.color,
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  }}>
                    {p.icon} {p.short}
                  </button>
                ))}
              </div>

              {referralFrom && (() => {
                const from = getCatInfo(referralFrom)
                const referTo = getReferralPath(referralFrom)
                return (
                  <div>
                    {/* Référence montante */}
                    {referTo.length > 0 && (
                      <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 16, marginBottom: 12 }}>
                        <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif', margin: '0 0 10px' }}>
                          ⬆️ Référence montante depuis {from.short} vers :
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {referTo.map(r => (
                            <div key={r.cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ background: r.color, color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'sans-serif' }}>
                                Cat. {r.cat} — {r.short}
                              </div>
                              <span style={{ color: '#444', fontSize: 12, fontFamily: 'sans-serif' }}>{r.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Contre-référence descendante */}
                    {from.acceptsFrom.length > 0 && (
                      <div style={{ background: '#eff6ff', borderRadius: 14, padding: 16 }}>
                        <p style={{ color: '#2563eb', fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif', margin: '0 0 10px' }}>
                          ⬇️ Contre-référence — {from.short} reçoit les patients de :
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {from.acceptsFrom.map(c => {
                            const info = getCatInfo(c)
                            return info ? (
                              <div key={c} style={{ background: info.color, color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'sans-serif' }}>
                                {info.icon} {info.short}
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                    {from.cat === 1 && (
                      <div style={{ background: '#fef2f2', borderRadius: 14, padding: 14 }}>
                        <p style={{ color: '#dc2626', fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif', margin: 0 }}>
                          🏛️ Sommet de la pyramide — Reçoit les références de tous les niveaux inférieurs.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Filtres */}
        <div style={{ background: 'white', borderRadius: 20, padding: 16, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input placeholder="🔍 Rechercher une structure, ville..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none' }}
            />
            <select value={region} onChange={e => setRegion(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 12, border: '1.5px solid #e5e7eb', fontSize: 13, background: 'white', cursor: 'pointer' }}>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* VUE PYRAMIDE */}
        {view === 'pyramid' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ color: '#888', fontSize: 13, fontFamily: 'sans-serif' }}>
                Cliquez sur un niveau pour filtrer les structures · La pyramide respecte l&apos;organisation du MINSANTÉ
              </p>
            </div>

            {/* Pyramide visuelle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 32 }}>
              {PYRAMID.map((p, i) => {
                const width = 60 + (i * 40 / PYRAMID.length * 10)
                const isSelected = selectedCat === p.cat
                return (
                  <div key={p.cat} onClick={() => setSelectedCat(isSelected ? null : p.cat)}
                    style={{
                      width: `${Math.min(100, 30 + i * 12)}%`, maxWidth: 700,
                      background: isSelected ? p.color : p.bg,
                      border: `2px solid ${isSelected ? p.color : p.border}`,
                      borderRadius: 14, padding: '14px 20px', cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: isSelected ? `0 4px 20px ${p.color}40` : 'none',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{p.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{
                            background: isSelected ? 'rgba(255,255,255,0.3)' : p.color,
                            color: 'white', borderRadius: 6, padding: '2px 8px',
                            fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif',
                          }}>Cat. {p.cat}</span>
                          <span style={{ fontWeight: 700, color: isSelected ? 'white' : p.color, fontSize: 14, fontFamily: 'sans-serif' }}>
                            {p.short}
                          </span>
                          <span style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : '#666', fontSize: 11, fontFamily: 'sans-serif' }}>
                            {p.level === 'strategique' ? '🔴 Niveau Stratégique' : p.level === 'intermediaire' ? '🟡 Niveau Intermédiaire' : '🟢 Niveau Opérationnel'}
                          </span>
                        </div>
                        <div style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : '#444', fontSize: 12, fontFamily: 'sans-serif', marginTop: 4 }}>
                          {p.label}
                        </div>
                      </div>
                      {isSelected && <span style={{ color: 'white', fontSize: 18 }}>✓</span>}
                    </div>
                  </div>
                )
              })}

              {/* Secteur privé */}
              <div onClick={() => setSelectedCat(selectedCat === 99 ? null : 99)}
                style={{
                  width: '100%', maxWidth: 700,
                  background: selectedCat === 99 ? PRIVATE_CAT.color : PRIVATE_CAT.bg,
                  border: `2px dashed ${selectedCat === 99 ? PRIVATE_CAT.color : PRIVATE_CAT.border}`,
                  borderRadius: 14, padding: '14px 20px', cursor: 'pointer', marginTop: 8,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>🏥</div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        background: selectedCat === 99 ? 'rgba(255,255,255,0.3)' : PRIVATE_CAT.color,
                        color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif',
                      }}>Privé</span>
                      <span style={{ fontWeight: 700, color: selectedCat === 99 ? 'white' : PRIVATE_CAT.color, fontSize: 14, fontFamily: 'sans-serif' }}>
                        Structures Sanitaires Privées
                      </span>
                    </div>
                    <div style={{ color: selectedCat === 99 ? 'rgba(255,255,255,0.85)' : '#555', fontSize: 12, fontFamily: 'sans-serif', marginTop: 4 }}>
                      Cliniques, hôpitaux privés, cabinets — Accès direct ou sur référence
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Détail du niveau sélectionné */}
            {selectedCat && selectedCat !== 99 && (() => {
              const info = getCatInfo(selectedCat)
              return (
                <div style={{ background: info.bg, border: `2px solid ${info.border}`, borderRadius: 20, padding: 20, marginBottom: 24 }}>
                  <h3 style={{ color: info.color, fontFamily: 'Georgia,serif', fontSize: 18, margin: '0 0 8px' }}>
                    {info.icon} {info.label}
                  </h3>
                  <p style={{ color: '#444', fontSize: 13, fontFamily: 'sans-serif', margin: '0 0 12px', lineHeight: 1.6 }}>{info.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {info.examples.map(ex => (
                      <span key={ex} style={{ background: `${info.color}20`, color: info.color, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, fontFamily: 'sans-serif' }}>
                        {ex}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {info.canReferTo.length > 0 && (
                      <div style={{ fontSize: 12, fontFamily: 'sans-serif', color: '#555' }}>
                        ⬆️ <strong>Référence vers :</strong> Cat. {info.canReferTo.join(', ')}
                      </div>
                    )}
                    {info.acceptsFrom.length > 0 && (
                      <div style={{ fontSize: 12, fontFamily: 'sans-serif', color: '#555' }}>
                        ⬇️ <strong>Reçoit de :</strong> Cat. {info.acceptsFrom.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Structures de ce niveau */}
            {filtered.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {filtered.map(s => <StructureCard key={s.id} s={s} getCatInfo={getCatInfo} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
                <p style={{ color: '#888', fontFamily: 'sans-serif' }}>
                  {selectedCat ? 'Aucune structure de ce niveau enregistrée pour le moment.' : 'Sélectionnez un niveau dans la pyramide pour voir les structures.'}
                </p>
                <p style={{ color: '#aaa', fontSize: 13, fontFamily: 'sans-serif' }}>
                  Vous êtes une structure sanitaire ? <Link href="/auth/register?type=structure" style={{ color: '#0d4a3a', fontWeight: 700 }}>Inscrivez-vous</Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* VUE LISTE */}
        {view === 'list' && (
          <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={() => setSelectedCat(null)} style={{
                padding: '8px 16px', borderRadius: 20, border: '1.5px solid #e5e7eb',
                background: selectedCat === null ? '#0d4a3a' : 'white',
                color: selectedCat === null ? 'white' : '#333',
                fontWeight: 700, fontSize: 12, cursor: 'pointer',
              }}>Tous</button>
              {PYRAMID.map(p => (
                <button key={p.cat} onClick={() => setSelectedCat(selectedCat === p.cat ? null : p.cat)} style={{
                  padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${p.color}`,
                  background: selectedCat === p.cat ? p.color : 'white',
                  color: selectedCat === p.cat ? 'white' : p.color,
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                  {p.icon} {p.short}
                </button>
              ))}
            </div>
            {filtered.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {filtered.map(s => <StructureCard key={s.id} s={s} getCatInfo={getCatInfo} />)}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 20 }}>
                <p style={{ color: '#888', fontFamily: 'sans-serif' }}>Aucune structure trouvée</p>
              </div>
            )}
          </div>
        )}

        {/* CTA inscription */}
        <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', borderRadius: 20, padding: 28, marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏥</div>
          <h3 style={{ color: 'white', fontFamily: 'Georgia,serif', fontSize: 18, margin: '0 0 8px' }}>
            Vous gérez une structure sanitaire ?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'sans-serif', margin: '0 0 16px' }}>
            Inscrivez votre établissement pour être visible par les patients. Les structures publiques bénéficient d&apos;un accès 100% gratuit.
          </p>
          <Link href="/auth/register?type=structure" style={{
            display: 'inline-block', background: 'white', color: '#0d4a3a',
            borderRadius: 50, padding: '12px 28px', fontWeight: 700, fontSize: 14,
            textDecoration: 'none',
          }}>
            Inscrire ma structure →
          </Link>
        </div>
      </div>
    </div>
  )
}

function StructureCard({ s, getCatInfo }: { s: any, getCatInfo: any }) {
  const info = s.health_category ? getCatInfo(s.health_category) : null
  return (
    <Link href={`/professionals/${s.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '16px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: info ? `1px solid ${info.border}` : '1px solid #e5e7eb',
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
            background: info ? info.bg : '#f5f5f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>
            {s.profile_photo ? <img src={s.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (info ? info.icon : '🏥')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 15, fontFamily: 'sans-serif' }}>
                {s.structure_name || 'Structure sanitaire'}
              </span>
              {s.verification_status === 'verified' && (
                <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>✓ Vérifié</span>
              )}
              {s.is_public_sector && (
                <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>🏛️ Public</span>
              )}
            </div>
            {info && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ background: info.color, color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif' }}>
                  Cat. {info.cat} — {info.short}
                </span>
              </div>
            )}
            <div style={{ color: '#888', fontSize: 12, fontFamily: 'sans-serif' }}>
              📍 {s.city}{s.region ? `, ${s.region}` : ''}
            </div>
            {s.description && (
              <div style={{ color: '#555', fontSize: 12, fontFamily: 'sans-serif', marginTop: 4, lineHeight: 1.5 }}>
                {s.description.slice(0, 80)}{s.description.length > 80 ? '...' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
