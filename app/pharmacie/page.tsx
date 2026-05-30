// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PharmaciePage() {
  const [products, setProducts] = useState([])
  const [pharmacies, setPharmacies] = useState([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Record<string,number>>({})
  const [userType, setUserType] = useState('')

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('pharmacy_products').select(`*, profiles!pharmacy_id(id,full_name)`).eq('is_available',true).order('created_at',{ascending:false}),
      sb.from('professional_profiles').select('*').eq('structure_type','pharmacy').eq('verification_status','verified'),
      sb.auth.getSession().then(({data:{session}}) => session?.user?.id ? sb.from('profiles').select('user_type').eq('id',session.user.id).single() : {data:null})
    ]).then(([{data:prods},{data:pharms},profileRes]) => {
      setProducts(prods||[])
      setPharmacies(pharms||[])
      setUserType(profileRes?.data?.user_type||'')
      setLoading(false)
    })
  }, [])

  const cats = ['Tous',...Array.from(new Set((products as any[]).map(p=>p.category))).filter(Boolean)]
  const filtered = products.filter((p:any) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.generic_name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = cat==='Tous' || p.category===cat
    return matchSearch && matchCat
  })

  const addCart = (id:string) => setCart(c=>({...c,[id]:(c[id]||0)+1}))
  const remCart = (id:string) => setCart(c=>{ const n={...c}; if(n[id]>1) n[id]--; else delete n[id]; return n })
  const total = Object.entries(cart).reduce((s,[id,qty])=>{ const p=products.find((x:any)=>x.id===id) as any; return s+(p?.price_fcfa||0)*qty },0)
  const cartCount = Object.values(cart).reduce((s,v)=>s+v,0)

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fa'}}>
      <div style={{width:32,height:32,borderRadius:'50%',border:'3px solid #e8f5ee',borderTopColor:'#0d4a3a',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fa',fontFamily:'sans-serif',paddingBottom:80}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* HEADER */}
      <div style={{background:'linear-gradient(135deg,#0a2e22,#0d4a3a)',padding:'20px 16px 28px',textAlign:'center',position:'relative'}}>
        <Link href="/dashboard" style={{position:'absolute',top:16,left:16,color:'rgba(255,255,255,0.65)',textDecoration:'none',fontSize:13}}>← Retour</Link>
        {userType==='pharmacy'&&(
          <Link href="/mon-profil-pro" style={{position:'absolute',top:12,right:16,background:'rgba(255,255,255,0.15)',borderRadius:10,padding:'6px 12px',color:'white',textDecoration:'none',fontSize:12,fontWeight:700}}>⚙️ Mon stock</Link>
        )}
        <div style={{fontSize:36,marginBottom:6}}>💊</div>
        <h1 style={{color:'white',fontSize:20,fontWeight:800,margin:'0 0 4px'}}>Pharmacie en ligne</h1>
        <p style={{color:'rgba(255,255,255,0.65)',fontSize:12,margin:0}}>Commandez et faites livrer à domicile au Cameroun</p>
      </div>

      <div style={{maxWidth:540,margin:'0 auto',padding:'0 14px'}}>
        {/* Barre de recherche */}
        <div style={{background:'white',borderRadius:18,padding:'12px 16px',margin:'-14px 0 14px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:16}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un médicament..."
            style={{flex:1,border:'none',outline:'none',fontSize:14,fontFamily:'sans-serif',color:'#333'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16}}>✕</button>}
        </div>

        {/* Catégories */}
        <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,marginBottom:14}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{flexShrink:0,padding:'7px 14px',borderRadius:50,border:'none',cursor:'pointer',fontWeight:cat===c?700:500,fontSize:12,background:cat===c?'#0d4a3a':'white',color:cat===c?'white':'#555',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
              {c}
            </button>
          ))}
        </div>

        {/* Avertissement ordonnance */}
        <div style={{background:'#fffbeb',borderRadius:14,padding:'10px 14px',marginBottom:14,border:'1px solid #fde68a',display:'flex',gap:8}}>
          <span style={{flexShrink:0,fontSize:16}}>⚠️</span>
          <p style={{color:'#92400e',fontSize:11,margin:0,lineHeight:1.5}}>Les médicaments sur ordonnance nécessitent une <strong>prescription médicale valide</strong>. Un pharmacien vérifiera votre ordonnance avant la livraison.</p>
        </div>

        {/* Pharmacies partenaires */}
        {pharmacies.length>0&&(
          <div style={{marginBottom:14}}>
            <p style={{fontWeight:700,color:'#0d4a3a',fontSize:13,margin:'0 0 10px'}}>🏪 Pharmacies partenaires vérifiées</p>
            <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4}}>
              {pharmacies.map(ph=>(
                <div key={ph.id} style={{flexShrink:0,background:'white',borderRadius:14,padding:'10px 14px',boxShadow:'0 1px 6px rgba(0,0,0,0.06)',minWidth:160}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'#e8f5ee',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:6}}>
                    {ph.profile_photo_url?<img src={ph.profile_photo_url} alt="" style={{width:'100%',height:'100%',borderRadius:10,objectFit:'cover'}}/>:'🏪'}
                  </div>
                  <div style={{fontWeight:700,color:'#0d4a3a',fontSize:12}}>{ph.structure_name}</div>
                  {ph.city&&<div style={{color:'#888',fontSize:10}}>📍 {ph.city}</div>}
                  {ph.opening_hours&&<div style={{color:'#aaa',fontSize:10}}>🕐 {ph.opening_hours}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produits */}
        {filtered.length===0 ? (
          <div style={{background:'white',borderRadius:18,padding:32,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:10}}>🔍</div>
            <p style={{color:'#888',fontSize:14}}>{search?`Aucun résultat pour "${search}"`:products.length===0?'Aucun médicament disponible pour l\'instant.':'Aucun produit dans cette catégorie.'}</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.map((p:any)=>(
              <div key={p.id} style={{background:'white',borderRadius:16,padding:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)',display:'flex',gap:12,alignItems:'flex-start'}}>
                <div style={{width:52,height:52,borderRadius:14,background:p.requires_prescription?'#fef2f2':'#e8f5ee',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>💊</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,color:'#0d4a3a',fontSize:14}}>{p.name}</div>
                  {p.generic_name&&<div style={{color:'#888',fontSize:11,marginTop:1}}>{p.generic_name}</div>}
                  <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap'}}>
                    <span style={{background:'#e8f5ee',color:'#0d4a3a',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700}}>{p.category}</span>
                    {p.requires_prescription&&<span style={{background:'#fef2f2',color:'#dc2626',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700}}>Sur ordonnance</span>}
                  </div>
                  {p.description&&<p style={{color:'#666',fontSize:12,margin:'5px 0 0',lineHeight:1.4}}>{p.description}</p>}
                  {p.profiles?.full_name&&<p style={{color:'#aaa',fontSize:10,margin:'4px 0 0'}}>📍 {p.profiles.full_name}</p>}
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                  <div style={{fontWeight:800,color:'#0d4a3a',fontSize:15}}>{p.price_fcfa?.toLocaleString()} F</div>
                  <div style={{color:'#aaa',fontSize:10}}>/{p.unit}</div>
                  {cart[p.id] ? (
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <button onClick={()=>remCart(p.id)} style={{width:26,height:26,borderRadius:8,border:'none',background:'#fef2f2',color:'#dc2626',fontWeight:700,cursor:'pointer',fontSize:16}}>−</button>
                      <span style={{fontWeight:700,color:'#0d4a3a',fontSize:14,minWidth:16,textAlign:'center'}}>{cart[p.id]}</span>
                      <button onClick={()=>addCart(p.id)} style={{width:26,height:26,borderRadius:8,border:'none',background:'#e8f5ee',color:'#0d4a3a',fontWeight:700,cursor:'pointer',fontSize:16}}>+</button>
                    </div>
                  ) : (
                    <button onClick={()=>addCart(p.id)} style={{padding:'7px 14px',borderRadius:10,border:'none',background:'#0d4a3a',color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>Ajouter</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panier flottant */}
      {cartCount>0&&(
        <div style={{position:'fixed',bottom:16,left:16,right:16,maxWidth:540,margin:'0 auto',background:'linear-gradient(135deg,#0d4a3a,#2eb87a)',borderRadius:18,padding:'14px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 8px 24px rgba(13,74,58,0.4)',zIndex:100}}>
          <div>
            <div style={{color:'white',fontWeight:800,fontSize:15}}>🛒 {cartCount} article(s)</div>
            <div style={{color:'rgba(255,255,255,0.75)',fontSize:12}}>Total : {total.toLocaleString()} FCFA</div>
          </div>
          <button style={{background:'white',color:'#0d4a3a',border:'none',borderRadius:12,padding:'10px 20px',fontWeight:800,fontSize:13,cursor:'pointer'}}>
            Commander →
          </button>
        </div>
      )}
    </div>
  )
}
