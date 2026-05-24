'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAppointments() }, [])

  async function loadAppointments() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/auth/login'; return }
    const { data: u } = await supabase.from('users').select('id').eq('auth_id', session.user.id).single()
    if (!u) return
    const { data } = await supabase.from('appointments')
      .select('*, professionals(full_name, pro_type, city)')
      .eq('patient_id', u.id).order('appointment_date', {ascending: false})
    if (data) setAppointments(data)
    setLoading(false)
  }

  async function cancelAppointment(id: string) {
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    loadAppointments()
  }

  const statusColors: Record<string, string> = { pending: '#C8A84B', confirmed: '#00843D', cancelled: '#D32F2F', completed: '#0066CC' }
  const statusLabels: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé' }

  return (
    <div className="min-h-screen p-6" style={{background:'var(--cream)'}}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="font-sans text-sm" style={{color:'var(--green-mid)'}}>← Tableau de bord</Link>
          <h1 className="font-display text-2xl font-bold" style={{color:'var(--green-deep)'}}>Mes rendez-vous</h1>
        </div>

        <Link href="/professionals" className="btn-primary mb-6 inline-flex items-center gap-2 text-sm py-2.5 px-5">
          + Nouveau rendez-vous
        </Link>

        {loading ? <div className="text-center py-12 font-sans" style={{color:'var(--text-mid)'}}>Chargement...</div> :
          appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(a => {
                const pro = a.professionals as Record<string, string>
                return (
                  <div key={a.id as string} className="feature-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(0,132,61,0.08)', fontSize:'24px'}}>📅</div>
                        <div>
                          <div className="font-sans font-semibold" style={{color:'var(--text-dark)'}}>{pro?.full_name || 'Professionnel'}</div>
                          <div className="font-sans text-sm" style={{color:'var(--text-light)'}}>📍 {pro?.city}</div>
                          <div className="font-sans text-sm mt-1" style={{color:'var(--text-mid)'}}>
                            🗓️ {new Date(a.appointment_date as string).toLocaleDateString('fr-FR', {weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                          </div>
                          {(a.reason as string) && <div className="font-sans text-xs mt-1" style={{color:'var(--text-light)'}}>Motif: {a.reason as string}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="badge text-xs" style={{background:`${statusColors[a.status as string]}15`, color:statusColors[a.status as string]}}>
                          {statusLabels[a.status as string]}
                        </span>
                        {(a.status as string) === 'pending' && (
                          <button onClick={() => cancelAppointment(a.id as string)} className="font-sans text-xs" style={{color:'var(--red-alert)'}}>Annuler</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div style={{fontSize:'64px', marginBottom:'16px'}}>📅</div>
              <p className="font-display text-xl font-bold mb-2" style={{color:'var(--green-deep)'}}>Aucun rendez-vous</p>
              <p className="font-sans" style={{color:'var(--text-mid)'}}>Prenez votre premier rendez-vous avec un professionnel de santé</p>
              <Link href="/professionals" className="btn-primary mt-5 inline-block">Trouver un médecin →</Link>
            </div>
          )}
      </div>
    </div>
  )
}
