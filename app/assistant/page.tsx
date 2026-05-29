'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Msg { role: 'user'|'assistant'; content: string; time?: string }

const QUOTAS: Record<string,number> = { free:0, basic:5, intermediate:10, max:15, family:30, trial:5 }

function renderMd(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" style="color:#2eb87a;font-weight:700">$1</a>')
    if (line.startsWith('- ') || line.startsWith('• '))
      return <div key={i} style={{display:'flex',gap:8,margin:'3px 0'}}><span style={{color:'#2eb87a',flexShrink:0}}>•</span><span dangerouslySetInnerHTML={{__html:html.replace(/^[-•]\s*/,'')}} /></div>
    if (line.trim()==='') return <div key={i} style={{height:6}}/>
    return <p key={i} style={{margin:'2px 0',lineHeight:1.6}} dangerouslySetInnerHTML={{__html:html}}/>
  })
}

const QUICK = [
  {icon:'🤒',text:'Symptômes de paludisme'},
  {icon:'🤰',text:'Santé maternelle'},
  {icon:'💊',text:'Trouver un médecin'},
  {icon:'🩺',text:'Vaccins enfant'},
  {icon:'❤️',text:'Hypertension'},
  {icon:'🏥',text:'Services disponibles'},
]

export default function AssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState('free')
  const [used, setUsed] = useState(0)
  const [quota, setQuota] = useState(0)
  const [token, setToken] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({data:{session}}) => {
      if (!session) return
      setUser(session.user)
      setToken(session.access_token)
      const [{data:sub},{data:usage}] = await Promise.all([
        sb.from('subscriptions').select('plan,status').eq('user_id',session.user.id).single(),
        sb.from('ai_usage').select('questions_used').eq('user_id',session.user.id).eq('month_year',new Date().toISOString().slice(0,7)).single()
      ])
      const p = sub?.plan || 'free'
      setPlan(p)
      const q = QUOTAS[p] || 0
      setQuota(q)
      setUsed(usage?.questions_used || 0)
      
      setMsgs([{
        role:'assistant',
        content:`Bonjour ! 👋 Je suis votre **Assistant Santé Connect Cameroun**.\n\nJe vous aide avec :\n- **Informations de santé** — symptômes, maladies, prévention\n- **Orientation médicale** — vers le bon spécialiste\n- **Services de la plateforme** — rendez-vous, pharmacie\n\n${q > 0 ? `📊 Vous avez **${q - (usage?.questions_used||0)}/${q} questions** disponibles ce mois.\n\n` : ''}⚠️ Je ne remplace pas un médecin.\n🚨 **Urgence → 119 (SAMU) ou 112**\n\nComment puis-je vous aider ?`,
        time: new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
      }])
    })
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs, typing])

  const send = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    const userMsg: Msg = { role:'user', content:msg, time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }
    setMsgs(p => [...p, userMsg])
    setInput('')
    setLoading(true); setTyping(true)

    try {
      const apiMsgs = [...msgs, userMsg].map(m => ({role:m.role, content:m.content}))
      const res = await fetch('/api/assistant', {
        method:'POST',
        headers:{'Content-Type':'application/json','x-user-token':token},
        body:JSON.stringify({messages:apiMsgs, userId:user?.id, plan})
      })
      const data = await res.json()
      setTyping(false)
      if (data.reply) {
        setMsgs(p => [...p, {role:'assistant', content:data.reply, time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}])
        if (!data.quotaExceeded && !data.isUpgradeMessage) {
          setUsed(u => u+1)
        }
      }
    } catch {
      setTyping(false)
      setMsgs(p => [...p, {role:'assistant', content:'Erreur technique. Réessayez.\n\n🚨 Urgence → **119** ou **112**', time:''}])
    }
    setLoading(false)
    inputRef.current?.focus()
  }

  const remaining = quota - used
  const pct = quota > 0 ? Math.max(0, (remaining/quota)*100) : 0

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:'#f0f4f8',fontFamily:'sans-serif'}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0a2e22,#0d4a3a)',padding:'14px 16px 18px',position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:600,margin:'0 auto',display:'flex',alignItems:'center',gap:12}}>
          <Link href="/dashboard" style={{width:36,height:36,borderRadius:12,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',textDecoration:'none',flexShrink:0}}>
            <span style={{color:'white',fontSize:16}}>←</span>
          </Link>
          <div style={{position:'relative',flexShrink:0}}>
            <div style={{width:44,height:44,borderRadius:14,background:'linear-gradient(135deg,#2eb87a,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 4px 12px rgba(46,184,122,0.4)'}}>🤖</div>
            <div style={{position:'absolute',bottom:1,right:1,width:11,height:11,borderRadius:'50%',background:'#4ade80',border:'2px solid #0d4a3a',animation:'pulse 2s infinite'}}/>
          </div>
          <div style={{flex:1}}>
            <p style={{color:'white',fontWeight:700,fontSize:14,margin:'0 0 2px',fontFamily:'Georgia,serif'}}>Assistant Santé Connect</p>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:11,margin:0}}>{loading ? '⏳ Réflexion...' : '● En ligne'}</p>
          </div>
          {quota > 0 && (
            <div style={{background:'rgba(255,255,255,0.1)',borderRadius:12,padding:'6px 10px',textAlign:'center',minWidth:60}}>
              <div style={{color: remaining <= 2 ? '#fca5a5' : '#4ade80',fontWeight:800,fontSize:14}}>{remaining}</div>
              <div style={{color:'rgba(255,255,255,0.5)',fontSize:9}}>restantes</div>
              <div style={{height:3,background:'rgba(255,255,255,0.15)',borderRadius:2,marginTop:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background: remaining <= 2 ? '#ef4444' : '#4ade80',borderRadius:2}}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avertissement */}
      <div style={{background:'#fffbeb',borderBottom:'1px solid #fde68a',padding:'7px 16px',textAlign:'center'}}>
        <p style={{color:'#92400e',fontSize:11,margin:0}}>
          ⚠️ Information générale uniquement · Ne remplace pas un médecin ·
          <a href="tel:119" style={{color:'#dc2626',fontWeight:700,marginLeft:6,textDecoration:'none'}}>🚨 119 (SAMU)</a>
        </p>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px 0'}}>
        <div style={{maxWidth:600,margin:'0 auto',display:'flex',flexDirection:'column',gap:10,paddingBottom:10}}>
          {msgs.map((msg,i) => (
            <div key={i} style={{display:'flex',flexDirection:msg.role==='user'?'row-reverse':'row',alignItems:'flex-end',gap:8,animation:'fadeUp 0.25s ease'}}>
              <div style={{width:34,height:34,borderRadius:11,flexShrink:0,background:msg.role==='assistant'?'linear-gradient(135deg,#2eb87a,#059669)':'linear-gradient(135deg,#0d4a3a,#166534)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                {msg.role==='assistant'?'🤖':'👤'}
              </div>
              <div style={{maxWidth:'78%',display:'flex',flexDirection:'column',gap:2,alignItems:msg.role==='user'?'flex-end':'flex-start'}}>
                <div style={{padding:'12px 16px',borderRadius:msg.role==='assistant'?'4px 18px 18px 18px':'18px 4px 18px 18px',background:msg.role==='user'?'linear-gradient(135deg,#0d4a3a,#1a7a5e)':'white',color:msg.role==='user'?'white':'#1a2e26',boxShadow:'0 2px 10px rgba(0,0,0,0.08)',border:msg.role==='assistant'?'1px solid #e8f5ee':'none',fontSize:14}}>
                  {msg.role==='user'?<p style={{margin:0,lineHeight:1.6}}>{msg.content}</p>:<div style={{lineHeight:1.6}}>{renderMd(msg.content)}</div>}
                </div>
                {msg.time && <span style={{color:'#bbb',fontSize:10,padding:'0 4px'}}>{msg.time}</span>}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{display:'flex',alignItems:'flex-end',gap:8,animation:'fadeUp 0.25s ease'}}>
              <div style={{width:34,height:34,borderRadius:11,background:'linear-gradient(135deg,#2eb87a,#059669)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div>
              <div style={{background:'white',borderRadius:'4px 18px 18px 18px',padding:'14px 18px',border:'1px solid #e8f5ee',display:'flex',gap:5,alignItems:'center'}}>
                {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:'50%',background:'#2eb87a',animation:`bounce 1.2s ease ${j*0.2}s infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
      </div>

      {/* Questions rapides */}
      {msgs.length <= 1 && (
        <div style={{padding:'10px 16px 0'}}>
          <div style={{maxWidth:600,margin:'0 auto'}}>
            <p style={{color:'#888',fontSize:11,textAlign:'center',margin:'0 0 7px'}}>Questions fréquentes</p>
            <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:4}}>
              {QUICK.map((q,i)=>(
                <button key={i} onClick={()=>send(q.text)} style={{flexShrink:0,display:'flex',alignItems:'center',gap:5,background:'white',border:'1.5px solid #e8f5ee',borderRadius:50,padding:'7px 13px',cursor:'pointer',fontSize:12,color:'#0d4a3a',fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 1px 5px rgba(0,0,0,0.05)'}}>
                  <span>{q.icon}</span><span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{background:'white',borderTop:'1px solid #e8f0e8',padding:'10px 16px 18px',position:'sticky',bottom:0,boxShadow:'0 -4px 16px rgba(0,0,0,0.05)'}}>
        <div style={{maxWidth:600,margin:'0 auto'}}>
          <div style={{display:'flex',gap:8,alignItems:'center',background:'#f5f9f5',borderRadius:50,padding:'5px 5px 5px 16px',border:`1.5px solid ${remaining<=0&&quota>0?'#fca5a5':'#d4e8d4'}`}}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              placeholder={remaining<=0&&quota>0?'Quota épuisé — Mettez à niveau votre abonnement':'Posez votre question de santé...'}
              disabled={loading||(remaining<=0&&quota>0)}
              style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:14,color:'#1a2e26',fontFamily:'sans-serif'}}
            />
            <button onClick={()=>send()} disabled={!input.trim()||loading||(remaining<=0&&quota>0)} style={{width:40,height:40,borderRadius:50,border:'none',cursor:'pointer',background:input.trim()&&!loading&&(remaining>0||quota===0)?'linear-gradient(135deg,#0d4a3a,#2eb87a)':'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
              {loading?<span style={{width:16,height:16,border:'2px solid #888',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}}/>:<span style={{color:input.trim()&&(remaining>0||quota===0)?'white':'#aaa'}}>➤</span>}
            </button>
          </div>
          <p style={{color:'#bbb',fontSize:10,textAlign:'center',margin:'6px 0 0'}}>
            {quota>0?`${remaining}/${quota} questions ce mois · `:''}Ne remplace pas un professionnel de santé
          </p>
        </div>
      </div>
    </div>
  )
}
