'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message { role: 'user' | 'assistant'; content: string; time?: string }

// Render markdown-like text to proper HTML/JSX
function MessageContent({ content }: { content: string }) {
  const parts = content.split('\n').map((line, i) => {
    // Bold **text**
    const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    const rendered2 = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    if (line.startsWith('# ')) return <h3 key={i} style={{ fontWeight:800, fontSize:15, color:'#0d4a3a', margin:'8px 0 4px' }} dangerouslySetInnerHTML={{ __html: line.slice(2) }} />
    if (line.startsWith('## ')) return <h4 key={i} style={{ fontWeight:700, fontSize:14, color:'#0d4a3a', margin:'6px 0 3px' }} dangerouslySetInnerHTML={{ __html: line.slice(3) }} />
    if (line.startsWith('- ') || line.startsWith('• ')) return (
      <div key={i} style={{ display:'flex', gap:8, margin:'3px 0' }}>
        <span style={{ color:'#2eb87a', flexShrink:0, fontWeight:700 }}>•</span>
        <span dangerouslySetInnerHTML={{ __html: rendered2 }} />
      </div>
    )
    if (line.trim() === '') return <div key={i} style={{ height:6 }} />
    return <p key={i} style={{ margin:'2px 0', lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html: rendered2 }} />
  })
  return <div style={{ fontSize:14 }}>{parts}</div>
}

const QUICK_QUESTIONS = [
  { icon:'🤒', text:'Symptômes de paludisme' },
  { icon:'🤰', text:'Santé maternelle' },
  { icon:'💊', text:'Trouver un médecin' },
  { icon:'🩺', text:'Vaccination enfant' },
  { icon:'❤️', text:'Hypertension artérielle' },
  { icon:'🏥', text:'Services disponibles' },
]

const INITIAL_MSG: Message = {
  role: 'assistant',
  content: `Bonjour ! 👋 Je suis votre **Assistant Santé Connect Cameroun**.

Je suis là pour vous aider avec :
- **Informations de santé** — symptômes, maladies, prévention
- **Orientation médicale** — vous diriger vers le bon spécialiste
- **Services de la plateforme** — rendez-vous, pharmacie, structures sanitaires

⚠️ Je ne remplace pas un médecin. Pour tout symptôme grave, consultez immédiatement un professionnel.

🚨 **Urgence vitale ? Appelez le 119 (SAMU) ou 112**

Comment puis-je vous aider aujourd'hui ?`,
  time: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg: Message = {
      role: 'user', content: msg,
      time: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setIsTyping(true)

    try {
      const apiMessages = [...messages, userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()
      setIsTyping(false)

      if (data.reply) {
        setMessages(prev => [...prev, {
          role: 'assistant', content: data.reply,
          time: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
        }])
      } else {
        throw new Error('No reply')
      }
    } catch {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Je rencontre une difficulté technique. Veuillez réessayer dans un instant.\n\n🚨 En cas d\'urgence médicale, appelez le **119** (SAMU) ou **112**.',
        time: new Date().toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#f0f4f8', fontFamily:'sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-4px) } }
        .msg-anim { animation: fadeUp 0.3s ease; }
        .send-btn:active { transform: scale(0.92); }
        .quick-btn:active { transform: scale(0.94); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0a2e22,#0d4a3a)',
        padding: '16px 16px 20px',
        position: 'sticky', top:0, zIndex:50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ maxWidth:600, margin:'0 auto', display:'flex', alignItems:'center', gap:14 }}>
          <Link href="/dashboard" style={{
            width:38, height:38, borderRadius:12,
            background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center',
            textDecoration:'none', flexShrink:0,
          }}>
            <span style={{ color:'white', fontSize:18, lineHeight:1 }}>←</span>
          </Link>
          {/* Avatar IA animé */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{
              width:46, height:46, borderRadius:16,
              background:'linear-gradient(135deg,#2eb87a,#059669)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
              boxShadow:'0 4px 12px rgba(46,184,122,0.4)',
            }}>🤖</div>
            <div style={{
              position:'absolute', bottom:1, right:1,
              width:12, height:12, borderRadius:'50%',
              background:'#4ade80', border:'2px solid #0d4a3a',
              animation: 'pulse 2s infinite',
            }} />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 2px', fontFamily:'Georgia,serif' }}>
              Assistant Santé Connect
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', animation:'pulse 2s infinite' }} />
              <span style={{ color:'rgba(255,255,255,0.7)', fontSize:11 }}>
                {loading ? 'En train de réfléchir...' : 'En ligne · Prêt à vous aider'}
              </span>
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'5px 10px' }}>
            <span style={{ color:'rgba(255,255,255,0.8)', fontSize:10, fontWeight:600 }}>🇨🇲 CM</span>
          </div>
        </div>
      </div>

      {/* ── BANNIÈRE AVERTISSEMENT ── */}
      <div style={{
        background:'linear-gradient(90deg,#fffbeb,#fef9ee)',
        borderBottom:'1px solid #fde68a',
        padding:'8px 16px', textAlign:'center',
      }}>
        <p style={{ color:'#92400e', fontSize:12, margin:0 }}>
          ⚠️ Information générale uniquement — Ne remplace pas un médecin.
          <a href="tel:119" style={{ color:'#dc2626', fontWeight:700, marginLeft:6, textDecoration:'none' }}>🚨 Urgence: 119 (SAMU)</a>
        </p>
      </div>

      {/* ── MESSAGES ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 0' }}>
        <div style={{ maxWidth:600, margin:'0 auto', display:'flex', flexDirection:'column', gap:12, paddingBottom:12 }}>

          {messages.map((msg, i) => (
            <div key={i} className="msg-anim" style={{
              display:'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems:'flex-end', gap:10,
            }}>
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div style={{
                  width:36, height:36, borderRadius:12, flexShrink:0,
                  background:'linear-gradient(135deg,#2eb87a,#059669)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
                  boxShadow:'0 2px 8px rgba(46,184,122,0.3)',
                }}>🤖</div>
              )}
              {msg.role === 'user' && (
                <div style={{
                  width:36, height:36, borderRadius:12, flexShrink:0,
                  background:'linear-gradient(135deg,#0d4a3a,#166534)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                  boxShadow:'0 2px 8px rgba(13,74,58,0.3)',
                }}>👤</div>
              )}

              <div style={{ maxWidth:'78%', display:'flex', flexDirection:'column', gap:3,
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {/* Bulle */}
                <div style={{
                  padding: msg.role === 'assistant' ? '14px 16px' : '12px 16px',
                  borderRadius: msg.role === 'assistant' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,#0d4a3a,#1a7a5e)'
                    : 'white',
                  color: msg.role === 'user' ? 'white' : '#1a2e26',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: msg.role === 'assistant' ? '1px solid #e8f5ee' : 'none',
                }}>
                  {msg.role === 'user'
                    ? <p style={{ margin:0, fontSize:14, lineHeight:1.6 }}>{msg.content}</p>
                    : <MessageContent content={msg.content} />
                  }
                </div>
                {/* Heure */}
                {msg.time && (
                  <span style={{ color:'#aaa', fontSize:10, padding:'0 4px' }}>{msg.time}</span>
                )}
              </div>
            </div>
          ))}

          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="msg-anim" style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
              <div style={{
                width:36, height:36, borderRadius:12, flexShrink:0,
                background:'linear-gradient(135deg,#2eb87a,#059669)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
              }}>🤖</div>
              <div style={{
                background:'white', borderRadius:'4px 18px 18px 18px',
                padding:'14px 18px', border:'1px solid #e8f5ee',
                boxShadow:'0 2px 12px rgba(0,0,0,0.08)',
                display:'flex', gap:5, alignItems:'center',
              }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width:8, height:8, borderRadius:'50%', background:'#2eb87a',
                    animation:`bounce 1.2s ease ${j * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── QUESTIONS RAPIDES ── */}
      {messages.length <= 2 && (
        <div style={{ padding:'12px 16px 0', background:'transparent' }}>
          <div style={{ maxWidth:600, margin:'0 auto' }}>
            <p style={{ color:'#888', fontSize:12, margin:'0 0 8px', textAlign:'center' }}>Questions fréquentes</p>
            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)} className="quick-btn" style={{
                  flexShrink:0, display:'flex', alignItems:'center', gap:6,
                  background:'white', border:'1.5px solid #e8f5ee',
                  borderRadius:50, padding:'8px 14px', cursor:'pointer',
                  fontSize:13, color:'#0d4a3a', fontWeight:600,
                  boxShadow:'0 1px 6px rgba(0,0,0,0.06)', transition:'transform 0.1s',
                  whiteSpace:'nowrap',
                }}>
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INPUT ── */}
      <div style={{
        background:'white', borderTop:'1px solid #e8f0e8',
        padding:'12px 16px 20px', position:'sticky', bottom:0,
        boxShadow:'0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{
            display:'flex', gap:10, alignItems:'center',
            background:'#f5f9f5', borderRadius:50, padding:'6px 6px 6px 18px',
            border:'1.5px solid #d4e8d4',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Posez votre question de santé..."
              disabled={loading}
              style={{
                flex:1, background:'transparent', border:'none', outline:'none',
                fontSize:14, color:'#1a2e26', fontFamily:'sans-serif',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="send-btn"
              style={{
                width:42, height:42, borderRadius:50, border:'none', cursor:'pointer',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg,#0d4a3a,#2eb87a)'
                  : '#e5e7eb',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, transition:'all 0.2s',
                boxShadow: input.trim() && !loading ? '0 4px 12px rgba(13,74,58,0.4)' : 'none',
              }}
            >
              {loading
                ? <span style={{ animation:'pulse 1s infinite', fontSize:16 }}>⏳</span>
                : <span style={{ color: input.trim() ? 'white' : '#aaa' }}>➤</span>
              }
            </button>
          </div>
          <p style={{ color:'#aaa', fontSize:10, textAlign:'center', margin:'8px 0 0' }}>
            L'IA ne remplace pas un professionnel de santé · Données non médicalement certifiées
          </p>
        </div>
      </div>
    </div>
  )
}
