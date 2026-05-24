// @ts-nocheck
'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `Tu es l'Assistant Santé Connect Cameroun, un assistant virtuel bienveillant et professionnel spécialisé dans la santé au Cameroun. 

Règles strictes :
1. Tu fournis des informations de santé GÉNÉRALES et éducatives uniquement
2. Tu ne poses JAMAIS de diagnostic médical
3. Tu rappelles TOUJOURS de consulter un médecin pour tout symptôme
4. Tu peux orienter vers des spécialistes selon les symptômes
5. Pour toute urgence vitale, tu donnes immédiatement le numéro 15 (SAMU Cameroun)
6. Tu réponds en français, avec empathie et professionnalisme
7. Tu peux parler de santé générale, nutrition, prévention, hygiène, maladies courantes
8. Tu mentionnes les services de Santé Connect Cameroun (rendez-vous, pharmacie, etc.) quand pertinent

Tu ne remplaces jamais un médecin. Tu es un outil d'information et d'orientation.`

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Bonjour ! Je suis l\'Assistant Santé Connect Cameroun.\n\nJe peux répondre à vos questions de santé générales et vous orienter vers les meilleurs professionnels. **Je ne remplace pas un médecin** — pour tout symptôme grave, consultez immédiatement un professionnel.\n\n🚨 Urgence ? Appelez le **15** (SAMU)\n\nComment puis-je vous aider aujourd\'hui ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Désolé, je n\'ai pas pu traiter votre demande.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' }])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--bg-cream)'}}>
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-4" style={{background: 'white', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard"><ArrowLeft size={20} style={{color: 'var(--text-muted)'}} /></Link>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'var(--green-deep)'}}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold" style={{color: 'var(--text-dark)'}}>Assistant Santé Connect</p>
            <p className="text-xs" style={{color: 'var(--green-mid)'}}>● En ligne</p>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="px-4 py-2 text-center" style={{background: '#fffbeb'}}>
        <p className="text-xs" style={{color: '#92400e'}}>
          <AlertTriangle size={12} className="inline mr-1" />
          Information générale uniquement — Ne remplace pas un médecin. Urgence: <strong>15</strong>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                background: msg.role === 'assistant' ? 'var(--green-deep)' : 'var(--text-muted)'
              }}>
                {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-white" />}
              </div>
              <div className="max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap" style={{
                background: msg.role === 'user' ? 'var(--green-deep)' : 'white',
                color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'var(--green-deep)'}}>
                <Bot size={16} className="text-white" />
              </div>
              <div className="p-4 rounded-2xl" style={{background: 'white', border: '1px solid var(--border)'}}>
                <Loader2 size={16} className="animate-spin" style={{color: 'var(--green-mid)'}} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-4 py-4" style={{background: 'white', borderTop: '1px solid var(--border)'}}>
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Posez votre question de santé..."
            className="flex-1 px-4 py-3 rounded-xl outline-none text-sm"
            style={{background: 'var(--bg-cream)', border: '2px solid var(--border)'}}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{background: input.trim() && !loading ? 'var(--green-deep)' : 'var(--border)'}}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="max-w-2xl mx-auto mt-3 flex flex-wrap gap-2">
          {['Symptômes fièvre', 'Rendez-vous médecin', 'Vaccins recommandés', 'Pharmacie proche'].map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{background: 'var(--bg-cream)', border: '1px solid var(--border)', color: 'var(--text-muted)'}}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
