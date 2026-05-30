// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const TYPE_LABELS: Record<string,{label:string,icon:string,color:string,bg:string}> = {
  doctor:         { label:'Médecin / Spécialiste', icon:'👨‍⚕️', color:'#0d4a3a', bg:'#e8f5ee' },
  pharmacy:       { label:'Pharmacie', icon:'💊', color:'#059669', bg:'#d1fae5' },
  private_clinic: { label:'Clinique Privée', icon:'🏥', color:'#1d4ed8', bg:'#dbeafe' },
  public_hospital:{ label:'Hôpital Public', icon:'🏛️', color:'#6b7280', bg:'#f3f4f6' },
  ngo:            { label:'ONG Santé', icon:'🤝', color:'#7c3aed', bg:'#ede9fe' },
  insurance:      { label:'Assurance', icon:'🛡️', color:'#b45309', bg:'#fef3c7' },
  lab:            { label:'Laboratoire', icon:'🔬', color:'#0891b2', bg:'#e0f2fe' },
  un_agency:      { label:'Agence ONU', icon:'🌐', color:'#1d4ed8', bg:'#dbeafe' },
}

export default function ProfessionnelsPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('tous')
  const [regionFilter, setRegionFilter] = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.from('professional_profiles')
      .select('*')
      .eq('verification_status','verified')
      .eq('is_visible',true)
      .order('structure_name')
      .then(({data}) => { setProfiles(data||[]); setLoading(false) })
  }, [])

  const types = ['tous',...Array.from(new Set((profiles as any[]).map(p=>p.structure_type))).filter(Boolean)]
  const regions = ['Toutes',...Array.from(new Set((profiles as any[]).map(p=>p.region))).filter(Boolean).sort()]

  const filtered = profiles.filter((p:any) => {
    const matchSearch = !search || p.structure_name?.toLowerCase().includes(search.toLowerCase()) || p.specialty?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter==='tous' || p.structure_type===typeFilter
    const matchRegion = !regionFilter || regionFilter==='Toutes' || p.region===regionFilter
    return matchSearch && matchType && matchRegion
  })

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:32,height:32,borderRadius:'50%',border:'3px solid #e8f5ee',borderTopColor:'#0d4a3a',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fa',fontFamily:'sans-serif',paddingBottom:30}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div style={{background:'linear-gradient(135deg,#0a2e22,#0d4a3a)',padding:'20px 16px 28px',textAlign:'center',position:'relative'}}>
        <Link href="/dashboard" style={{position:'absolute',top:16,left:16,color:'rgba(255,255,255,0.65)',textDecoration:'none',fontSize:13}}>← Retour</Link>
        <Link href="/auth/register-pro" style={{position:'absolute',top:12,right:16,background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'6px 12px',color:'white',textDecoration:'none',fontSize:12,fontWeight:700}}>+ Rejoindre</Link>
        <div style={{fontSize:32,marginBottom:6}}>👨‍⚕️</div>
        <h1 style={{color:'white',fontSize:20,fontWeight:800,margin:'0 0 4px'}}>Professionnels & Structures</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:12,margin:0}}>{profiles.length} professionnel(s) vérifié(s)</p>
      </div>

      <div style={{maxWidth:540,margin:'0 auto',padding:'0 14px'}}>
        {/* Recherche */}
        <div style={{background:'white',borderRadius:18,padding:'12px 16px',margin:'-14px 0 14px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:16}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, spécialité, ville..."
            style={{flex:1,border:'none',outline:'none',fontSize:14,fontFamily:'sans-serif'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16}}>✕</button>}
        </div>

        {/* Filtres type */}
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
          {types.map(t=>{
            const info = TYPE_LABELS[t]
            return (
              <button key={t} onClick={()=>setTypeFilter(t)} style={{flexShrink:0,display:'flex',alignItems:'center',gap:5,padding:'7px 13px',borderRadius:50,border:'none',cursor:'pointer',fontWeight:typeFilter===t?700:500,fontSize:12,background:typeFilter===t?'#0d4a3a':'white',color:typeFilter===t?'white':'#555',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
                {t==='tous'?'Tous':info?`${info.icon} ${info.label}`:t}
              </button>
            )
          })}
        </div>

        {/* Filtre région */}
        {regions.length>2&&(
          <div style={{marginBottom:14}}>
            <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)} style={{width:'100%',padding:'10px 14px',borderRadius:12,border:'1.5px solid #e5e7eb',fontSize:13,outline:'none',background:'white',fontFamily:'sans-serif'}}>
              {regions.map(r=><option key={r} value={r==='Toutes'?'':r}>{r}</option>)}
            </select>
          </div>
        )}

        {/* Liste */}
        {filtered.length===0 ? (
          <div style={{background:'white',borderRadius:18,padding:32,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:10}}>🔍</div>
            <p style={{color:'#888',fontSize:14}}>{profiles.length===0?'Aucun professionnel vérifié pour le moment.':'Aucun résultat pour cette recherche.'}</p>
            <Link href="/auth/register-pro" style={{display:'inline-block',marginTop:12,background:'#0d4a3a',color:'white',borderRadius:50,padding:'10px 24px',textDecoration:'none',fontWeight:700,fontSize:13}}>
              Inscrire ma structure →
            </Link>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.map((p:any)=>{
              const info = TYPE_LABELS[p.structure_type] || {icon:'🏥',color:'#0d4a3a',bg:'#e8f5ee',label:'Structure'}
              return (
                <div key={p.id} style={{background:'white',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.07)'}}>
                  {/* Header card */}
                  <div style={{padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
                    {/* Photo */}
                    <div style={{width:56,height:56,borderRadius:16,background:info.bg,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,border:`2px solid ${info.color}20`}}>
                      {p.profile_photo_url?<img src={p.profile_photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span>{info.icon}</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:800,color:'#0d4a3a',fontSize:15,marginBottom:2}}>{p.structure_name}</div>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:4}}>
                        <span style={{background:info.bg,color:info.color,borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700}}>{info.icon} {info.label}</span>
                        {p.specialty&&<span style={{background:'#f3f4f6',color:'#374151',borderRadius:6,padding:'2px 8px',fontSize:10}}>{p.specialty}</span>}
                        {p.is_public_sector&&<span style={{background:'#f0fdf4',color:'#16a34a',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700}}>🆓 Public</span>}
                      </div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {p.city&&<span style={{color:'#888',fontSize:11}}>📍 {p.city}{p.region?`, ${p.region}`:''}</span>}
                        {p.opening_hours&&<span style={{color:'#888',fontSize:11}}>🕐 {p.opening_hours}</span>}
                      </div>
                    </div>
                    {/* Notation */}
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0}}>
                      <div style={{display:'flex',gap:4}}>
                        <div style={{background:'#e8f5ee',borderRadius:8,padding:'4px 8px',fontSize:12,color:'#0d4a3a',fontWeight:700}}>👍 {p.likes||0}</div>
                        <div style={{background:'#fef2f2',borderRadius:8,padding:'4px 8px',fontSize:12,color:'#dc2626',fontWeight:700}}>👎 {p.dislikes||0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {p.description&&(
                    <div style={{padding:'0 16px 10px'}}>
                      <p style={{color:'#555',fontSize:12,margin:0,lineHeight:1.6}}>{p.description}</p>
                    </div>
                  )}

                  {/* Infos contact + actions */}
                  <div style={{borderTop:'1px solid #f5f5f5',padding:'10px 16px',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                    {p.phone&&(
                      <a href={`tel:${p.phone}`} style={{display:'flex',alignItems:'center',gap:5,background:'#e8f5ee',color:'#0d4a3a',borderRadius:10,padding:'7px 12px',textDecoration:'none',fontWeight:700,fontSize:12}}>
                        📞 Appeler
                      </a>
                    )}
                    {p.whatsapp&&(
                      <a href={`https://wa.me/${p.whatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:5,background:'#dcfce7',color:'#15803d',borderRadius:10,padding:'7px 12px',textDecoration:'none',fontWeight:700,fontSize:12}}>
                        💬 WhatsApp
                      </a>
                    )}
                    {p.accepts_insurance&&(
                      <span style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:10,padding:'7px 12px',fontSize:12,fontWeight:700}}>🛡️ Assurances</span>
                    )}
                    <Link href="/rendez-vous" style={{marginLeft:'auto',background:'#0d4a3a',color:'white',borderRadius:10,padding:'7px 14px',textDecoration:'none',fontWeight:700,fontSize:12}}>
                      🩺 Consulter →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
