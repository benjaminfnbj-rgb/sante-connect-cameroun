// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'

const STATUS = {
  pending:   { label: 'En attente', color: '#d97706', bg: '#fffbeb' },
  confirmed: { label: 'Confirmé',   color: '#16a34a', bg: '#f0fdf4' },
  cancelled: { label: 'Annulé',     color: '#dc2626', bg: '#fef2f2' },
  completed: { label: 'Terminé',    color: '#2563eb', bg: '#eff6ff' },
}

export default function RendezVousPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/connexion'; return }
      setUserId(user.id)
      loadAppointments(user.id)
    })
  }, [])

  async function loadAppointments(uid) {
    const { data } = await createClient().from('appointments')
      .select('*, professional_profiles(structure_name, specialty, city)')
      .eq('patient_id', uid)
      .order('appointment_date', { ascending: false })
    if (data) setAppointments(data)
    setLoading(false)
  }

  async function cancel(id) {
    await createClient().from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (userId) loadAppointments(userId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 16px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ color: '#0d4a3a', fontFamily: 'Georgia,serif', fontSize: 24, margin: 0 }}>📅 Mes Rendez-vous</h1>
          <Link href="/professionnels" style={{ background: '#0d4a3a', color: 'white', borderRadius: 12, padding: '10px 18px', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
            + Nouveau RDV
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Chargement...</div>
        ) : appointments.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <h3 style={{ color: '#0d4a3a', fontFamily: 'Georgia,serif' }}>Aucun rendez-vous</h3>
            <p style={{ color: '#888', fontSize: 14, fontFamily: 'sans-serif', marginBottom: 20 }}>Prenez rendez-vous avec un professionnel de santé vérifié</p>
            <Link href="/professionnels" style={{ background: '#0d4a3a', color: 'white', borderRadius: 12, padding: '12px 24px', textDecoration: 'none', fontWeight: 700 }}>
              Trouver un médecin →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map(a => {
              const s = STATUS[a.status] || STATUS.pending
              const pro = a.professional_profiles
              const date = new Date(a.appointment_date)
              return (
                <div key={a.id} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${s.color}33` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 15, fontFamily: 'sans-serif' }}>
                        {pro?.structure_name || 'Professionnel de santé'}
                      </div>
                      <div style={{ color: '#888', fontSize: 13, fontFamily: 'sans-serif', marginTop: 2 }}>
                        {pro?.specialty} {pro?.city ? `· 📍 ${pro.city}` : ''}
                      </div>
                      <div style={{ color: '#444', fontSize: 14, fontFamily: 'sans-serif', marginTop: 6, fontWeight: 600 }}>
                        📅 {date.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                        {' '}⏰ {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {a.reason && <div style={{ color: '#666', fontSize: 12, fontFamily: 'sans-serif', marginTop: 4 }}>Motif : {a.reason}</div>}
                    </div>
                    <span style={{ background: s.bg, color: s.color, borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, fontFamily: 'sans-serif', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                  </div>
                  {a.status === 'pending' || a.status === 'confirmed' ? (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
                      <button onClick={() => cancel(a.id)} style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid #dc2626', background: 'white', color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                        Annuler
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
