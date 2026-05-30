// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    createClient().auth.getSession().then(async ({ data: { session } }) => { const user = session?.user;
      if (!user) { router.push('/connexion'); return }
      const { data } = await createClient().from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
      setNotifs(data || [])
      setLoading(false)
      // Mark all as read
      await createClient().from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    })
  }, [router])

  const icons = { appointment: '📅', subscription: '💳', system: '🔔', kit: '🎁', order: '💊', emergency: '🚨' }

  return (
    <div style={{ minHeight:'100vh', background:'#faf8f3', paddingBottom:40 }}>
      <div style={{ background:'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding:'20px 20px 40px' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'rgba(255,255,255,0.7)', fontSize:14, textDecoration:'none', marginBottom:16, display:'block' }}>← Retour</Link>
          <h1 style={{ color:'white', fontSize:24, fontFamily:'Georgia,serif', fontWeight:700 }}>🔔 Notifications</h1>
        </div>
      </div>
      <div style={{ maxWidth:500, margin:'-20px auto 0', padding:'0 16px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:40 }}><div style={{ fontSize:32 }}>⏳</div></div>
        ) : notifs.length === 0 ? (
          <div style={{ background:'white', borderRadius:20, padding:40, textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
            <p style={{ color:'#888', fontSize:14 }}>Aucune notification pour l&apos;instant</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
            {notifs.map(n => (
              <div key={n.id} style={{
                background: n.is_read ? 'white' : '#f0fdf4',
                borderRadius:16, padding:'16px 20px',
                border: n.is_read ? '1px solid #e5e7eb' : '1px solid #86efac',
                boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ fontSize:24, flexShrink:0 }}>{icons[n.type] || '🔔'}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#0d4a3a', fontSize:14, marginBottom:3 }}>{n.title}</div>
                    <div style={{ color:'#555', fontSize:13, lineHeight:1.5 }}>{n.message}</div>
                    <div style={{ color:'#aaa', fontSize:11, marginTop:6 }}>{new Date(n.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}</div>
                  </div>
                  {!n.is_read && <div style={{ width:8, height:8, background:'#16a34a', borderRadius:'50%', flexShrink:0, marginTop:4 }} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
