'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const emergencyNumbers = [
  { name: 'SAMU', number: '15', icon: '🚑', color: '#ff4444' },
  { name: 'Pompiers', number: '18', icon: '🚒', color: '#ff6600' },
  { name: 'Police', number: '17', icon: '👮', color: '#0066ff' },
  { name: 'Urgences', number: '112', icon: '📞', color: '#cc0000' },
]

const menuItems = [
  { icon: '🏠', label: 'Tableau de bord', key: 'home' },
  { icon: '📅', label: 'Rendez-vous', key: 'appointments' },
  { icon: '💊', label: 'Pharmacie', key: 'pharmacy' },
  { icon: '🤖', label: 'Assistant IA', key: 'ai' },
  { icon: '🌺', label: 'Santé Féminine', key: 'feminin' },
  { icon: '🛡️', label: 'Assurances', key: 'insurance' },
  { icon: '🎁', label: 'Mes Kits Santé', key: 'kits' },
  { icon: '🚨', label: 'Urgences', key: 'emergency' },
  { icon: '⚙️', label: 'Paramètres', key: 'settings' },
]

export default function PatientDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{role:string,content:string}[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [pharmacySearch, setPharmacySearch] = useState('')

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      createClient().from('profiles').select('*').eq('id', data.user.id).single()
        .then(({ data: p }) => setProfile(p))
    })
    // Load doctors
    createClient().from('professional_profiles').select('*, profiles(full_name, avatar_url)').eq('is_verified', true).limit(6)
      .then(({ data }) => setDoctors(data || []))
  }, [])

  const sendAiMessage = async () => {
    if (!aiMessage.trim()) return
    setAiLoading(true)
    const userMsg = aiMessage
    setAiMessage('')
    const newHistory = [...chatHistory, { role: 'user', content: userMsg }]
    setChatHistory(newHistory)
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: `Tu es l'Assistant Santé Connect Cameroun. Tu réponds aux questions de santé en français de manière informative et bienveillante. Tu n'es pas médecin et tu rappelles toujours de consulter un professionnel de santé pour tout diagnostic. Tu connais le contexte sanitaire camerounais. Tu peux orienter vers des spécialistes quand nécessaire. Sois concis et pratique.`,
          messages: newHistory.map(m => ({ role: m.role as 'user'|'assistant', content: m.content }))
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Je suis désolé, je ne peux pas répondre pour le moment.'
      setChatHistory([...newHistory, { role: 'assistant', content: reply }])
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' }])
    }
    setAiLoading(false)
  }

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Utilisateur'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 240, background: 'linear-gradient(180deg,#0d4a3a,#0f5c45)', minHeight: '100vh',
        position: 'fixed', left: 0, top: 0, zIndex: 100, display: 'flex', flexDirection: 'column', padding: '24px 0'
      }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(46,184,122,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 700, fontSize: 14 }}>Santé Connect</div>
              <div style={{ color: '#7ddcb1', fontSize: 10 }}>CAMEROUN</div>
            </div>
          </div>
        </div>

        {/* Profile mini */}
        <div style={{ padding: '16px 20px', marginBottom: 16, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#2eb87a,#1a7a5e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
              {firstName.charAt(0)}
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{firstName}</div>
              <div style={{ color: '#7ddcb1', fontSize: 11 }}>Patient • Abonné</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 12px' }}>
          {menuItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                borderRadius: 10, border: 'none', cursor: 'pointer', marginBottom: 2, textAlign: 'left',
                background: activeTab === item.key ? 'rgba(46,184,122,0.2)' : 'transparent',
                color: activeTab === item.key ? '#2eb87a' : 'rgba(255,255,255,0.7)',
                fontSize: 14, fontWeight: activeTab === item.key ? 600 : 400,
                transition: 'all 0.2s',
              }}>
              <span>{item.icon}</span> {item.label}
              {item.key === 'emergency' && <span style={{ marginLeft: 'auto', background: '#ff4444', color: 'white', padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>LIVE</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', background: 'rgba(255,68,68,0.15)', color: '#ff8080', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,68,68,0.2)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: 240, flex: 1, background: '#f4f7f5', minHeight: '100vh', padding: '32px 32px 32px 32px' }}>
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a' }}>
                Bonjour, {firstName} 👋
              </h1>
              <p style={{ color: '#5a7a6e', fontSize: 16 }}>Comment vous sentez-vous aujourd'hui ?</p>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: '📅', label: 'Prendre RDV', color: '#2eb87a', tab: 'appointments' },
                { icon: '💊', label: 'Commander méd.', color: '#1a7a5e', tab: 'pharmacy' },
                { icon: '🤖', label: 'Assistant IA', color: '#f5a623', tab: 'ai' },
                { icon: '🚨', label: 'Urgences', color: '#ff4444', tab: 'emergency' },
              ].map(a => (
                <button key={a.label} onClick={() => setActiveTab(a.tab)}
                  style={{ background: 'white', border: 'none', borderRadius: 16, padding: 20, cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{a.icon}</div>
                  <div style={{ color: a.color, fontWeight: 600, fontSize: 13 }}>{a.label}</div>
                </button>
              ))}
            </div>

            {/* Subscription status */}
            <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', borderRadius: 20, padding: 24, marginBottom: 28, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#7ddcb1', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>VOTRE ABONNEMENT</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700 }}>✨ Essai Gratuit en cours</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>Encore 28 jours restants</div>
              </div>
              <button style={{ background: '#f5a623', color: 'white', padding: '12px 24px', borderRadius: 50, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Souscrire →
              </button>
            </div>

            {/* Doctors */}
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0d4a3a', marginBottom: 16 }}>Médecins disponibles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { name: 'Dr. Nkouamou Paul', spec: 'Cardiologue', city: 'Yaoundé', rating: 48, note: '(127 avis)' },
                { name: 'Dr. Bello Aïcha', spec: 'Pédiatre', city: 'Douala', rating: 52, note: '(89 avis)' },
                { name: 'Dr. Fotso Marc', spec: 'Généraliste', city: 'Yaoundé', rating: 41, note: '(203 avis)' },
              ].map(doc => (
                <div key={doc.name} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>👨‍⚕️</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 14 }}>{doc.name}</div>
                      <div style={{ color: '#5a7a6e', fontSize: 12 }}>{doc.spec} • {doc.city}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#5a7a6e' }}>
                      👍 {doc.rating} {doc.note}
                    </div>
                    <div style={{ background: '#e8f9f1', color: '#2eb87a', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Vérifié</div>
                  </div>
                  <button onClick={() => setActiveTab('appointments')}
                    style={{ width: '100%', background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '10px', borderRadius: 30, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Prendre RDV
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 24 }}>📅 Mes Rendez-vous</h1>
            
            <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 20 }}>Rechercher un médecin</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12 }}>
                <select style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}>
                  <option>Toutes les spécialités</option>
                  <option>Cardiologue</option>
                  <option>Pédiatre</option>
                  <option>Gynécologue</option>
                  <option>Généraliste</option>
                  <option>Dermatologue</option>
                </select>
                <select style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' }}>
                  <option>Toutes les villes</option>
                  <option>Yaoundé</option>
                  <option>Douala</option>
                  <option>Bafoussam</option>
                  <option>Garoua</option>
                </select>
                <input type="date" style={{ padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                <button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '12px 24px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer' }}>Rechercher</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
              {[
                { name: 'Dr. Nkouamou Paul', spec: 'Cardiologue', city: 'Yaoundé', times: ['09:00','10:30','14:00','15:30'], rating: 48, reviews: 127 },
                { name: 'Dr. Bello Aïcha', spec: 'Pédiatre', city: 'Douala', times: ['08:30','11:00','14:30'], rating: 52, reviews: 89 },
                { name: 'Dr. Fotso Marc', spec: 'Médecin généraliste', city: 'Yaoundé', times: ['09:00','10:00','11:00','15:00','16:00'], rating: 41, reviews: 203 },
                { name: 'Dr. Ngono Sylvie', spec: 'Gynécologue', city: 'Douala', times: ['09:30','11:30','14:00'], rating: 38, reviews: 156 },
              ].map(doc => (
                <div key={doc.name} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, flexShrink: 0 }}>👨‍⚕️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 16 }}>{doc.name}</div>
                      <div style={{ color: '#5a7a6e', fontSize: 13 }}>{doc.spec}</div>
                      <div style={{ color: '#5a7a6e', fontSize: 12 }}>📍 {doc.city}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ background: '#e8f9f1', color: '#2eb87a', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Vérifié KYC</div>
                      <div style={{ fontSize: 12, color: '#5a7a6e', marginTop: 4 }}>👍 {doc.rating} ({doc.reviews})</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#5a7a6e', marginBottom: 8, fontWeight: 600 }}>Créneaux disponibles aujourd'hui :</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {doc.times.map(t => (
                        <button key={t} style={{ background: '#f0fdf8', border: '1.5px solid #2eb87a', color: '#1a7a5e', padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2eb87a'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f0fdf8'; (e.currentTarget as HTMLElement).style.color = '#1a7a5e' }}
                          onClick={() => alert(`RDV confirmé avec ${doc.name} à ${t} ✓`)}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI ASSISTANT TAB */}
        {activeTab === 'ai' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 8 }}>🤖 Assistant Santé IA</h1>
            <p style={{ color: '#5a7a6e', marginBottom: 24 }}>Posez vos questions de santé. L'IA vous oriente, mais ne remplace pas un médecin.</p>
            
            <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: 580 }}>
              {/* Chat header */}
              <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(46,184,122,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700 }}>Assistant Santé Connect</div>
                  <div style={{ color: '#7ddcb1', fontSize: 12 }}>● En ligne — Réponse rapide</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatHistory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                    <div style={{ color: '#5a7a6e', fontSize: 15 }}>Bonjour ! Je suis votre assistant santé.<br />Posez-moi vos questions de santé.</div>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
                      {['J\'ai de la fièvre', 'Symptômes paludisme', 'Trouver un pédiatre', 'Pharmacie de garde'].map(q => (
                        <button key={q} onClick={() => { setAiMessage(q); }}
                          style={{ background: '#f0fdf8', border: '1px solid #2eb87a', color: '#1a7a5e', padding: '8px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '72%', padding: '12px 18px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg,#1a7a5e,#2eb87a)' : '#f4f7f5',
                      color: msg.role === 'user' ? 'white' : '#1a2e26',
                      fontSize: 14, lineHeight: 1.6
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ background: '#f4f7f5', padding: '12px 18px', borderRadius: '18px 18px 18px 4px', color: '#5a7a6e', fontSize: 14 }}>
                      Assistant est en train de répondre...
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
                <input value={aiMessage} onChange={e => setAiMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                  placeholder="Décrivez vos symptômes ou posez une question..."
                  style={{ flex: 1, padding: '12px 18px', border: '1.5px solid #e2e8f0', borderRadius: 50, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                <button onClick={sendAiMessage} disabled={aiLoading || !aiMessage.trim()}
                  style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', width: 48, height: 48, borderRadius: '50%', border: 'none', fontSize: 20, cursor: 'pointer', opacity: aiLoading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ➤
                </button>
              </div>
            </div>
            <p style={{ color: '#5a7a6e', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
              ⚠️ L'assistant IA fournit des informations générales uniquement. Consultez toujours un médecin pour un diagnostic.
            </p>
          </div>
        )}

        {/* EMERGENCY TAB */}
        {activeTab === 'emergency' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 8 }}>🚨 Numéros d'Urgence</h1>
            <p style={{ color: '#5a7a6e', marginBottom: 28 }}>Accessible même sans abonnement actif</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { name: 'SAMU - Urgences Médicales', number: '15', icon: '🚑', color: '#ff4444', desc: 'Ambulances et secours médicaux d\'urgence' },
                { name: 'Sapeurs-Pompiers', number: '18', icon: '🚒', color: '#ff6600', desc: 'Incendie, accidents, sauvetage' },
                { name: 'Police Nationale', number: '17', icon: '👮', color: '#0066cc', desc: 'Sécurité et ordre public' },
                { name: 'Numéro d\'Urgence Européen', number: '112', icon: '📞', color: '#cc0000', desc: 'Toutes urgences, fonctionne sans crédit' },
                { name: 'CENACOM', number: '1500', icon: '🏥', color: '#006633', desc: 'Coordination urgences médicales Cameroun' },
                { name: 'Anti-Poison', number: '222-23-40-40', icon: '☠️', color: '#6600cc', desc: 'Intoxications et empoisonnements' },
              ].map(e => (
                <a key={e.name} href={`tel:${e.number}`}
                  style={{ textDecoration: 'none', background: 'white', borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `2px solid ${e.color}20`, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e2 => (e2.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                  onMouseLeave={e2 => (e2.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
                  <div style={{ width: 56, height: 56, background: `${e.color}15`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{e.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 15 }}>{e.name}</div>
                    <div style={{ color: '#5a7a6e', fontSize: 13, marginTop: 2 }}>{e.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 900, color: e.color }}>{e.number}</div>
                </a>
              ))}
            </div>

            <div style={{ background: '#fff8e6', border: '2px solid #f5a623', borderRadius: 16, padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28 }}>💡</span>
              <div>
                <div style={{ fontWeight: 700, color: '#7a5200', marginBottom: 4 }}>Conseil en cas d'urgence</div>
                <div style={{ color: '#7a5200', fontSize: 14, lineHeight: 1.6 }}>
                  Restez calme et exprimez clairement votre localisation (ville, quartier, point de repère). 
                  Décrivez la situation en quelques mots. Les numéros 15, 17, 18 et 112 fonctionnent <strong>même sans crédit</strong> sur votre téléphone.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHARMACY TAB */}
        {activeTab === 'pharmacy' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 24 }}>💊 Pharmacie en Ligne</h1>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <input value={pharmacySearch} onChange={e => setPharmacySearch(e.target.value)}
                placeholder="Rechercher un médicament..."
                style={{ flex: 1, padding: '13px 18px', border: '1.5px solid #e2e8f0', borderRadius: 50, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
              <button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '13px 28px', borderRadius: 50, border: 'none', fontWeight: 600, cursor: 'pointer' }}>Rechercher</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { name: 'Paracétamol 500mg', pharmacy: 'Pharmacie Centrale', price: '500 FCFA', stock: 'En stock', type: 'Antalgique' },
                { name: 'Amoxicilline 250mg', pharmacy: 'Pharmacie du Peuple', price: '1200 FCFA', stock: 'En stock', type: 'Antibiotique' },
                { name: 'Artémisinine+Luméfantrine', pharmacy: 'Pharmacie Djoum', price: '2500 FCFA', stock: 'En stock', type: 'Antipaludéen' },
                { name: 'Vitamine C 1000mg', pharmacy: 'Pharmacie Moderne', price: '800 FCFA', stock: 'Limité', type: 'Complément' },
                { name: 'Ibuprofène 400mg', pharmacy: 'Pharmacie Centrale', price: '600 FCFA', stock: 'En stock', type: 'Anti-inflammatoire' },
                { name: 'Metronidazole 250mg', pharmacy: 'Pharmacie du Peuple', price: '900 FCFA', stock: 'En stock', type: 'Antibiotique' },
              ].map(med => (
                <div key={med.name} style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>💊</div>
                  <div style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 14, marginBottom: 4 }}>{med.name}</div>
                  <div style={{ color: '#2eb87a', fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{med.type}</div>
                  <div style={{ color: '#5a7a6e', fontSize: 12, marginBottom: 12 }}>{med.pharmacy}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#0d4a3a', fontSize: 15 }}>{med.price}</span>
                    <span style={{ background: med.stock === 'En stock' ? '#e8f9f1' : '#fff8e6', color: med.stock === 'En stock' ? '#2eb87a' : '#f5a623', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{med.stock}</span>
                  </div>
                  <button style={{ width: '100%', background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '9px', borderRadius: 20, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Commander →
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, background: '#f0fdf8', borderRadius: 14, padding: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 24 }}>🛵</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0d4a3a' }}>Livraison à domicile disponible</div>
                <div style={{ color: '#5a7a6e', fontSize: 14 }}>Délai : 1-3h selon votre localisation. Ordonnance numérique acceptée.</div>
              </div>
            </div>
          </div>
        )}

        {/* FEMININE HEALTH TAB */}
        {activeTab === 'feminin' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 8 }}>🌺 Santé Féminine</h1>
            <p style={{ color: '#5a7a6e', marginBottom: 28 }}>Suivi de votre cycle menstruel et accompagnement personnalisé</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 20 }}>📅 Suivi du cycle</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 20 }}>
                  {['L','M','M','J','V','S','D'].map((d,i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#5a7a6e', fontWeight: 600, padding: 4 }}>{d}</div>
                  ))}
                  {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                    const isPeriod = day >= 3 && day <= 7
                    const isOvulation = day === 16
                    const isFertile = day >= 12 && day <= 18
                    return (
                      <div key={day} style={{
                        textAlign: 'center', padding: '6px 2px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                        background: isPeriod ? '#ff9999' : isOvulation ? '#2eb87a' : isFertile ? '#e8f9f1' : 'transparent',
                        color: isPeriod || isOvulation ? 'white' : '#1a2e26', cursor: 'pointer'
                      }}>
                        {day}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#5a7a6e' }}>
                  <span>🔴 Règles</span>
                  <span>🟢 Ovulation</span>
                  <span style={{ color: '#c8f0de' }}>🟩 Fertile</span>
                </div>
              </div>

              <div>
                <div style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: 16, padding: 24, marginBottom: 16, color: 'white' }}>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Prochain cycle prévu</div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700 }}>Dans 18 jours</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Durée moyenne : 28 jours</div>
                </div>

                <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                  <h4 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 12 }}>Enregistrer une période</h4>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="date" style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                    <button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Ajouter</button>
                  </div>
                </div>

                <div style={{ background: '#fff8e6', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontWeight: 600, color: '#7a5200', marginBottom: 8 }}>🌸 Serviettes hygiéniques gratuites</div>
                  <div style={{ color: '#7a5200', fontSize: 14 }}>Votre kit mensuel est prêt. Présentez votre QR code à la pharmacie partenaire la plus proche.</div>
                  <button style={{ marginTop: 12, background: '#f5a623', color: 'white', padding: '10px 20px', borderRadius: 20, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Générer mon QR Code</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KITS TAB */}
        {activeTab === 'kits' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 8 }}>🎁 Kits Santé</h1>
            <p style={{ color: '#5a7a6e', marginBottom: 28 }}>Retrait physique dans la pharmacie partenaire la plus proche</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, marginBottom: 24 }}>
              <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🛡️</div>
                <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 8 }}>Préservatifs</h3>
                <p style={{ color: '#5a7a6e', fontSize: 14, marginBottom: 16 }}>Inclus dans votre abonnement. Lutte contre le VIH et les MST.</p>
                <div style={{ background: '#e8f9f1', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ color: '#2eb87a', fontWeight: 600, fontSize: 13 }}>✓ Disponible ce mois</div>
                </div>
                <button style={{ width: '100%', background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '12px', borderRadius: 50, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Générer le reçu de retrait
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
                <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 8 }}>Serviettes Hygiéniques</h3>
                <p style={{ color: '#5a7a6e', fontSize: 14, marginBottom: 16 }}>Gratuites pour les femmes de moins de 50 ans. Lutte contre la précarité menstruelle.</p>
                <div style={{ background: '#fff8e6', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ color: '#f5a623', fontWeight: 600, fontSize: 13 }}>Réservé aux femmes &lt;50 ans</div>
                </div>
                <button style={{ width: '100%', background: 'linear-gradient(135deg,#f5a623,#e8950f)', color: 'white', padding: '12px', borderRadius: 50, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Générer le reçu de retrait
                </button>
              </div>
            </div>

            <div style={{ background: '#f4f7f5', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 16 }}>📍 Pharmacies partenaires proches</h3>
              {['Pharmacie Centrale - Yaoundé Centre (0.8 km)', 'Pharmacie du Peuple - Bastos (1.2 km)', 'Pharmacie Djoum - Melen (2.1 km)'].map((p, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 10, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#1a2e26', fontSize: 14 }}>📍 {p}</div>
                  <button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '6px 16px', borderRadius: 20, border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Itinéraire</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSURANCE TAB */}
        {activeTab === 'insurance' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 24 }}>🛡️ Assurances Santé</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {[
                { name: 'SAAR Cameroun', plan: 'Santé Essentiel', price: '5 000', cover: '500 000 FCFA', color: '#0d4a3a' },
                { name: 'ACTIVA Assurances', plan: 'Santé Premium', price: '12 000', cover: '2 000 000 FCFA', color: '#1a7a5e' },
                { name: 'AXA Cameroun', plan: 'Famille Plus', price: '20 000', cover: '5 000 000 FCFA', color: '#2eb87a' },
              ].map(ins => (
                <div key={ins.name} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ background: `linear-gradient(135deg,${ins.color},${ins.color}cc)`, padding: '20px 24px', color: 'white' }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{ins.name}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>{ins.plan}</div>
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0d4a3a', marginBottom: 4 }}>{ins.price} FCFA<span style={{ fontSize: 13, fontWeight: 400 }}>/mois</span></div>
                    <div style={{ color: '#5a7a6e', fontSize: 13, marginBottom: 20 }}>Couverture jusqu'à {ins.cover}</div>
                    {['Hospitalisation', 'Consultations', 'Médicaments', 'Urgences'].map(b => (
                      <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13, color: '#1a2e26' }}>
                        <span style={{ color: '#2eb87a' }}>✓</span> {b}
                      </div>
                    ))}
                    <button style={{ width: '100%', marginTop: 20, background: `linear-gradient(135deg,${ins.color},${ins.color}99)`, color: 'white', padding: '12px', borderRadius: 50, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                      Souscrire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 24 }}>⚙️ Paramètres</h1>
            <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', maxWidth: 640 }}>
              <h3 style={{ fontWeight: 700, color: '#0d4a3a', marginBottom: 24 }}>Informations du profil</h3>
              {[
                { label: 'Nom complet', value: profile?.full_name || '', field: 'full_name' },
                { label: 'Email', value: profile?.email || '', field: 'email' },
                { label: 'Téléphone', value: profile?.phone || '', field: 'phone' },
              ].map(f => (
                <div key={f.field} style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#0d4a3a', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                  <input defaultValue={f.value}
                    style={{ width: '100%', padding: '12px 15px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '13px 32px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
