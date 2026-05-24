// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

type Professional = {
  id: string; full_name: string; specialty?: string; city?: string
  address?: string; phone?: string; description?: string; cv_url?: string
  avatar_url?: string; is_verified?: boolean; is_public_structure?: boolean
  pro_type?: string; likes?: number; dislikes?: number
  working_hours?: Record<string, string>
}

export default function ProfessionalDetail() {
  const params = useParams()
  const id = params.id as string
  const [pro, setPro] = useState<Professional | null>(null)
  const [slots, setSlots] = useState<{id:string, slot_date:string, start_time:string, end_time:string, is_booked:boolean}[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [meds, setMeds] = useState<{id:string, name:string, price:number, stock_quantity:number, requires_prescription:boolean}[]>([])

  useEffect(() => {
    if (id) { loadPro(); loadSlots(); loadMeds() }
  }, [id])

  async function loadPro() {
    const { data } = await supabase.from('professionals').select('*').eq('id', id).single()
    setPro(data)
  }

  async function loadSlots() {
    const { data } = await supabase.from('availability_slots').select('*').eq('professional_id', id)
      .eq('is_booked', false).gte('slot_date', new Date().toISOString().split('T')[0]).order('slot_date').limit(10)
    if (data) setSlots(data)
  }

  async function loadMeds() {
    const { data } = await supabase.from('medications').select('*').eq('pharmacy_id', id).eq('is_available', true).limit(6)
    if (data) setMeds(data)
  }

  async function bookAppointment() {
    if (!selectedSlot) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/auth/login'; return }
    setBooking(true)

    const { data: userData } = await supabase.from('users').select('id').eq('auth_id', session.user.id).single()
    if (!userData) { setBooking(false); return }

    const slot = slots.find(s => s.id === selectedSlot)!
    const apptDate = `${slot.slot_date}T${slot.start_time}`

    await supabase.from('appointments').insert({
      patient_id: userData.id, professional_id: id,
      appointment_date: apptDate, reason, status: 'pending'
    })
    await supabase.from('availability_slots').update({ is_booked: true }).eq('id', selectedSlot)
    setBooked(true)
    setBooking(false)
  }

  if (!pro) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--cream)'}}>
      <div style={{fontSize:'48px'}}>⚕️</div>
    </div>
  )

  const proTypes: Record<string, string> = { doctor:'Médecin', pharmacist:'Pharmacien', clinic:'Clinique', hospital:'Hôpital', ngo:'ONG', lab:'Laboratoire' }
  const proIcons: Record<string, string> = { doctor:'👨‍⚕️', pharmacist:'💊', clinic:'🏥', hospital:'🏨', ngo:'🤝', lab:'🔬' }

  return (
    <div className="min-h-screen" style={{background:'var(--cream)'}}>
      <Navbar />
      <div className="pt-20 max-w-5xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="feature-card mb-6 p-8">
          <div className="flex flex-wrap items-start gap-6">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(0,132,61,0.1)', fontSize:'48px'}}>
              {proIcons[pro.pro_type as string] || '🏥'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-display text-3xl font-bold" style={{color:'var(--green-deep)'}}>{pro.full_name as string}</h1>
                {(pro.is_verified as boolean) && <span className="badge badge-green">✓ Vérifié</span>}
                {(pro.is_public_structure as boolean) && <span className="badge badge-blue">🏛️ Structure Publique</span>}
              </div>
              <div className="font-sans text-lg mb-2" style={{color:'var(--text-mid)'}}>
                {proTypes[pro.pro_type as string]} {pro.specialty ? `• ${pro.specialty}` : ''}
              </div>
              <div className="font-sans text-sm mb-3" style={{color:'var(--text-light)'}}>
                📍 {pro.city as string} {pro.address ? `• ${pro.address}` : ''}
              </div>
              {pro.phone && <div className="font-sans text-sm" style={{color:'var(--text-light)'}}>📞 {pro.phone as string}</div>}
            </div>
            <div className="flex flex-col gap-3 items-end">
              <div className="flex gap-3">
                <div className="text-center p-3 rounded-xl" style={{background:'rgba(0,132,61,0.05)'}}>
                  <div className="font-display text-2xl font-bold" style={{color:'var(--green-mid)'}}>👍 {pro.likes as number}</div>
                  <div className="font-sans text-xs" style={{color:'var(--text-light)'}}>J&apos;aime</div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{background:'rgba(211,47,47,0.05)'}}>
                  <div className="font-display text-2xl font-bold" style={{color:'var(--red-alert)'}}>👎 {pro.dislikes as number}</div>
                  <div className="font-sans text-xs" style={{color:'var(--text-light)'}}>Je n&apos;aime pas</div>
                </div>
              </div>
            </div>
          </div>
          {pro.description && (
            <div className="mt-6 p-4 rounded-xl" style={{background:'rgba(0,132,61,0.04)', border:'1px solid rgba(0,132,61,0.1)'}}>
              <h3 className="font-sans font-semibold mb-2" style={{color:'var(--green-deep)'}}>À propos</h3>
              <p className="font-sans text-sm leading-relaxed" style={{color:'var(--text-mid)'}}>{pro.description as string}</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Appointment booking */}
          <div className="feature-card p-6">
            <h2 className="font-display text-xl font-bold mb-5" style={{color:'var(--green-deep)'}}>📅 Prendre rendez-vous</h2>
            {booked ? (
              <div className="text-center py-8">
                <div style={{fontSize:'48px', marginBottom:'12px'}}>✅</div>
                <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--green-mid)'}}>Rendez-vous demandé !</h3>
                <p className="font-sans text-sm" style={{color:'var(--text-mid)'}}>Vous recevrez une confirmation par email.</p>
                <Link href="/dashboard" className="btn-primary mt-4 inline-block text-sm py-2 px-5">Voir mon tableau de bord</Link>
              </div>
            ) : slots.length > 0 ? (
              <>
                <div className="space-y-2 mb-4">
                  {slots.map(slot => (
                    <button key={slot.id} onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between transition-all font-sans text-sm ${selectedSlot === slot.id ? 'text-white' : ''}`}
                      style={{background: selectedSlot === slot.id ? 'var(--green-mid)' : 'rgba(0,132,61,0.05)', border:`1px solid ${selectedSlot === slot.id ? 'var(--green-mid)' : 'rgba(0,132,61,0.1)'}`}}>
                      <span>{new Date(slot.slot_date).toLocaleDateString('fr-FR', {weekday:'short', day:'numeric', month:'short'})}</span>
                      <span>{slot.start_time.slice(0,5)} – {slot.end_time.slice(0,5)}</span>
                    </button>
                  ))}
                </div>
                <textarea value={reason} onChange={e => setReason(e.target.value)} className="form-input mb-4" rows={2} placeholder="Motif de consultation (optionnel)..." />
                <button onClick={bookAppointment} disabled={!selectedSlot || booking} className="btn-primary w-full py-3">
                  {booking ? 'Réservation...' : '✓ Confirmer le rendez-vous'}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div style={{fontSize:'40px', marginBottom:'12px'}}>📅</div>
                <p className="font-sans text-sm" style={{color:'var(--text-mid)'}}>Aucun créneau disponible pour le moment</p>
              </div>
            )}
          </div>

          {/* Medications (if pharmacy) */}
          {(pro.pro_type === 'pharmacist') && (
            <div className="feature-card p-6">
              <h2 className="font-display text-xl font-bold mb-5" style={{color:'var(--green-deep)'}}>💊 Médicaments disponibles</h2>
              {meds.length > 0 ? (
                <div className="space-y-3">
                  {meds.map(med => (
                    <div key={med.id} className="flex items-center justify-between p-3 rounded-xl" style={{background:'rgba(0,102,204,0.04)', border:'1px solid rgba(0,102,204,0.08)'}}>
                      <div>
                        <div className="font-sans font-semibold text-sm" style={{color:'var(--text-dark)'}}>{med.name}</div>
                        <div className="font-sans text-xs" style={{color:'var(--text-light)'}}>
                          Stock: {med.stock_quantity} {med.requires_prescription ? '• Ordonnance requise' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-sans font-bold text-sm" style={{color:'var(--green-mid)'}}>{med.price?.toLocaleString('fr-FR')} FCFA</div>
                        <button className="font-sans text-xs mt-1" style={{color:'var(--blue-info)'}}>+ Ajouter</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-center py-4" style={{color:'var(--text-light)'}}>Aucun médicament en stock actuellement</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
