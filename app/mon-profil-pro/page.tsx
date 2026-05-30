// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const REGIONS = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest']
const VILLES: Record<string,string[]> = {
  'Centre':['Yaoundé','Mbalmayo','Bafia','Obala'],
  'Littoral':['Douala','Nkongsamba','Edéa','Loum'],
  'Ouest':['Bafoussam','Dschang','Foumban','Mbouda'],
  'Nord-Ouest':['Bamenda','Kumbo','Nkambe','Wum'],
  'Sud-Ouest':['Buea','Limbe','Kumba','Mamfe'],
  'Nord':['Garoua','Guider','Poli'],
  'Extrême-Nord':['Maroua','Mora','Kousséri'],
  'Adamaoua':['Ngaoundéré','Meiganga','Tibati'],
  'Est':['Bertoua','Abong-Mbang','Batouri'],
  'Sud':['Ebolowa','Sangmélima','Kribi'],
}

const MED_CATEGORIES = ['Analgésiques','Antibiotiques','Antipaludéens','Antiparasitaires','Vitamines & Compléments','Antihypertenseurs','Diabète','Contraceptifs','Dermatologie','Pédiatrie','Maternité','Soins courants','Autre']

export default function MonProfilProPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [proProfile, setProProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'profil'|'stock'|'apercu'>('profil')
  // Profil form
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [hours, setHours] = useState('')
  const [insurance, setInsurance] = useState(false)
  const [photoFile, setPhotoFile] = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isOnDuty, setIsOnDuty] = useState(false)
  const [dutyLoading, setDutyLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  // Produit form
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodGeneric, setProdGeneric] = useState('')
  const [prodCat, setProdCat] = useState('Analgésiques')
  const [prodDesc, setProdDesc] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodUnit, setProdUnit] = useState('boîte')
  const [prodPrescription, setProdPrescription] = useState(false)
  const [prodSaving, setProdSaving] = useState(false)
  const router = useRouter()

  const isPharmacy = proProfile?.structure_type === 'pharmacy'

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({data:{session}}) => {
      if (!session) { router.push('/connexion'); return }
      setUser(session.user)
      const [{data:p},{data:pp},{data:prods}] = await Promise.all([
        sb.from('profiles').select('*').eq('id',session.user.id).single(),
        sb.from('professional_profiles').select('*').eq('user_id',session.user.id).single(),
        sb.from('pharmacy_products').select('*').eq('pharmacy_id',session.user.id).order('created_at',{ascending:false})
      ])
      setProfile(p)
      if (pp) {
        setProProfile(pp)
        setName(pp.structure_name||'')
        setDesc(pp.description||'')
        setRegion(pp.region||'')
        setCity(pp.city||'')
        setAddress(pp.address||'')
        setPhone(pp.phone||'')
        setWhatsapp(pp.whatsapp||'')
        setHours(pp.opening_hours||'')
        setInsurance(pp.accepts_insurance||false)
        if (pp.profile_photo_url) setPhotoPreview(pp.profile_photo_url)
        setIsOnDuty(pp.is_on_duty || false)
      }
      setProducts(prods||[])
      setLoading(false)
    })
  }, [router])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const toggleDuty = async () => {
    if (!proProfile?.id) return
    setDutyLoading(true)
    const sb = createClient()
    const newStatus = !isOnDuty
    await sb.from('professional_profiles').update({
      is_on_duty: newStatus,
      duty_until: newStatus ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null
    }).eq('id', proProfile.id)
    setIsOnDuty(newStatus)
    setDutyLoading(false)
  }

  const saveProfil = async () => {
    setSaving(true)
    const sb = createClient()
    let photoUrl = proProfile?.profile_photo_url || null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${user.id}/profile.${ext}`
      const {data:up} = await sb.storage.from('profile-photos').upload(path, photoFile, {upsert:true})
      if (up) {
        const {data:url} = sb.storage.from('profile-photos').getPublicUrl(path)
        photoUrl = url.publicUrl
      }
    }
    await sb.from('professional_profiles').upsert({
      user_id: user.id,
      structure_name: name,
      description: desc,
      region, city, address,
      phone, whatsapp,
      opening_hours: hours,
      accepts_insurance: insurance,
      profile_photo_url: photoUrl,
      updated_at: new Date().toISOString()
    }, {onConflict:'user_id'})
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const addProduct = async () => {
    if (!prodName || !prodPrice) return
    setProdSaving(true)
    const sb = createClient()
    const {data} = await sb.from('pharmacy_products').insert({
      pharmacy_id: user.id,
      name: prodName, generic_name: prodGeneric||null,
      category: prodCat, description: prodDesc||null,
      price_fcfa: parseInt(prodPrice), unit: prodUnit,
      requires_prescription: prodPrescription,
      is_available: true,
    }).select().single()
    if (data) {
      setProducts(p => [data,...p])
      setShowAddProduct(false)
      setProdName(''); setProdGeneric(''); setProdDesc(''); setProdPrice(''); setProdPrescription(false)
    }
    setProdSaving(false)
  }

  const toggleProduct = async (id: string, available: boolean) => {
    const sb = createClient()
    await sb.from('pharmacy_products').update({is_available: !available}).eq('id',id)
    setProducts(p => p.map(x => x.id===id ? {...x,is_available:!available} : x))
  }

  const deleteProduct = async (id: string) => {
    const sb = createClient()
    await sb.from('pharmacy_products').delete().eq('id',id)
    setProducts(p => p.filter(x => x.id!==id))
  }

  const inp = {width:'100%',padding:'11px 13px',borderRadius:11,border:'1.5px solid #e5e7eb',fontSize:13,outline:'none',boxSizing:'border-box' as const,marginBottom:10,fontFamily:'sans-serif'}
  const lbl = {display:'block' as const,fontWeight:700,color:'#0d4a3a',fontSize:11,marginBottom:4}

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
      <div style={{background:'linear-gradient(135deg,#0a2e22,#0d4a3a)',padding:'16px 16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,maxWidth:540,margin:'0 auto'}}>
          <Link href="/dashboard" style={{color:'rgba(255,255,255,0.65)',textDecoration:'none',fontSize:13}}>← Retour</Link>
          <div style={{flex:1,textAlign:'center'}}>
            <div style={{color:'white',fontWeight:700,fontSize:16}}>Mon Espace Pro</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:11,marginTop:1}}>{name||'Profil professionnel'}</div>
          </div>
          <div style={{width:48}}/>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:'white',borderBottom:'1px solid #e5e7eb',display:'grid',gridTemplateColumns:isPharmacy?'1fr 1fr 1fr':'1fr 1fr',maxWidth:540,margin:'0 auto'}}>
        {(['profil','apercu',...(isPharmacy?['stock']:[])] as string[]).map(t=>(
          <button key={t} onClick={()=>setTab(t as any)} style={{padding:'11px',border:'none',background:'transparent',cursor:'pointer',color:tab===t?'#0d4a3a':'#9ca3af',fontWeight:tab===t?700:400,fontSize:12,borderBottom:tab===t?'2.5px solid #0d4a3a':'2.5px solid transparent'}}>
            {t==='profil'?'✏️ Mon Profil':t==='stock'?'💊 Mon Stock':'👁️ Aperçu public'}
          </button>
        ))}
      </div>

      <div style={{maxWidth:540,margin:'0 auto',padding:'14px 14px'}}>

        {/* ── PROFIL ── */}
        {tab==='profil' && (
          <div style={{animation:'fadeUp .25s ease',display:'flex',flexDirection:'column',gap:12}}>
            {saved && <div style={{background:'#e8f5ee',borderRadius:12,padding:'10px 14px',color:'#0d4a3a',fontWeight:700,fontSize:13,textAlign:'center'}}>✅ Profil mis à jour avec succès !</div>}

            {/* Statut de garde */}
            {isPharmacy && (
              <div style={{background:isOnDuty?'#fef2f2':'#f0fdf4',borderRadius:16,padding:'14px 16px',border:`1.5px solid ${isOnDuty?'#fecaca':'#86efac'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:700,color:isOnDuty?'#dc2626':'#0d4a3a',fontSize:14}}>
                      {isOnDuty?'🏥 Pharmacie de garde — Active':'🏥 Statut de garde'}
                    </div>
                    <div style={{color:'#888',fontSize:11,marginTop:2}}>
                      {isOnDuty?'Visible en rouge sur la carte · Patients informés':'Activez pour signaler que vous êtes de garde'}
                    </div>
                  </div>
                  <div style={{width:50,height:26,borderRadius:50,background:isOnDuty?'#dc2626':'#d1d5db',position:'relative',cursor:'pointer',transition:'background .2s',flexShrink:0}} onClick={toggleDuty}>
                    <div style={{position:'absolute',top:3,left:isOnDuty?26:3,width:20,height:20,borderRadius:'50%',background:'white',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}/>
                  </div>
                </div>
                <button onClick={toggleDuty} disabled={dutyLoading} style={{width:'100%',padding:'11px',borderRadius:50,border:'none',background:isOnDuty?'#dc2626':'#0d4a3a',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                  {dutyLoading?'⏳ Mise à jour...':isOnDuty?'🔴 Je suis de garde (cliquer pour désactiver)':'🟢 Activer le statut de garde'}
                </button>
              </div>
            )}

            {/* Photo de profil */}
            <div style={{background:'white',borderRadius:18,padding:'18px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)',textAlign:'center'}}>
              <div style={{position:'relative',display:'inline-block',marginBottom:12}}>
                <div style={{width:88,height:88,borderRadius:24,background:photoPreview?'transparent':'#e8f5ee',overflow:'hidden',border:'3px solid #e8f5ee',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto'}}>
                  {photoPreview ? <img src={photoPreview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '🏥'}
                </div>
                <label htmlFor="photo-input" style={{position:'absolute',bottom:-4,right:-4,width:28,height:28,borderRadius:'50%',background:'#0d4a3a',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,border:'2px solid white'}}>📷</label>
                <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{display:'none'}}/>
              </div>
              <p style={{color:'#888',fontSize:11,margin:0}}>Photo visible par les patients</p>
            </div>

            {/* Infos générales */}
            <div style={{background:'white',borderRadius:18,padding:'18px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
              <p style={{fontWeight:700,color:'#0d4a3a',fontSize:14,margin:'0 0 14px'}}>📋 Informations générales</p>
              <label style={lbl}>Nom / Raison sociale *</label>
              <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Dr. Kamga, Clinique Espoir, Pharmacie..."/>
              <label style={lbl}>Description de vos activités</label>
              <textarea style={{...inp,resize:'none'}} rows={3} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Spécialités, services proposés, horaires généraux..."/>
              <label style={lbl}>Horaires d'ouverture</label>
              <input style={inp} value={hours} onChange={e=>setHours(e.target.value)} placeholder="Lun–Ven 8h–18h · Sam 8h–14h"/>
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#f0fdf4',borderRadius:10,cursor:'pointer'}} onClick={()=>setInsurance(!insurance)}>
                <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${insurance?'#0d4a3a':'#d1d5db'}`,background:insurance?'#0d4a3a':'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {insurance&&<span style={{color:'white',fontSize:13}}>✓</span>}
                </div>
                <span style={{fontSize:13,color:'#0d4a3a',fontWeight:600}}>Accepte les assurances</span>
              </div>
            </div>

            {/* Localisation */}
            <div style={{background:'white',borderRadius:18,padding:'18px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
              <p style={{fontWeight:700,color:'#0d4a3a',fontSize:14,margin:'0 0 14px'}}>📍 Localisation</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={lbl}>Région</label>
                  <select style={{...inp,marginBottom:0}} value={region} onChange={e=>{setRegion(e.target.value);setCity('')}}>
                    <option value="">Sélectionner</option>
                    {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Ville</label>
                  <select style={{...inp,marginBottom:0}} value={city} onChange={e=>setCity(e.target.value)} disabled={!region}>
                    <option value="">Sélectionner</option>
                    {(VILLES[region]||[]).map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginTop:10}}>
                <label style={lbl}>Adresse complète</label>
                <input style={inp} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Quartier, avenue, rue, bâtiment..."/>
              </div>
            </div>

            {/* Contact */}
            <div style={{background:'white',borderRadius:18,padding:'18px',boxShadow:'0 2px 10px rgba(0,0,0,0.06)'}}>
              <p style={{fontWeight:700,color:'#0d4a3a',fontSize:14,margin:'0 0 14px'}}>📞 Contact</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={lbl}>Téléphone</label>
                  <input style={{...inp,marginBottom:0}} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+237 6XX..."/>
                </div>
                <div>
                  <label style={lbl}>WhatsApp</label>
                  <input style={{...inp,marginBottom:0}} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+237 6XX..."/>
                </div>
              </div>
            </div>

            <button onClick={saveProfil} disabled={saving} style={{padding:'14px',borderRadius:50,border:'none',background:saving?'#e5e7eb':'linear-gradient(135deg,#0d4a3a,#2eb87a)',color:saving?'#aaa':'white',fontWeight:700,fontSize:14,cursor:'pointer',boxShadow:'0 4px 14px rgba(13,74,58,0.3)'}}>
              {saving?'⏳ Enregistrement...':saved?'✅ Enregistré !':'💾 Sauvegarder le profil'}
            </button>
          </div>
        )}

        {/* ── STOCK PHARMACIE ── */}
        {tab==='stock' && isPharmacy && (
          <div style={{animation:'fadeUp .25s ease',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{fontWeight:700,color:'#0d4a3a',fontSize:15,margin:0}}>💊 Mon Stock</p>
                <p style={{color:'#888',fontSize:11,margin:'2px 0 0'}}>{products.filter(p=>p.is_available).length} produit(s) disponible(s)</p>
              </div>
              <button onClick={()=>setShowAddProduct(!showAddProduct)} style={{background:showAddProduct?'#f0f0f0':'linear-gradient(135deg,#0d4a3a,#2eb87a)',color:showAddProduct?'#555':'white',border:'none',borderRadius:12,padding:'9px 16px',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                {showAddProduct?'✕ Annuler':'+ Ajouter'}
              </button>
            </div>

            {/* Formulaire ajout produit */}
            {showAddProduct && (
              <div style={{background:'white',borderRadius:18,padding:'18px',boxShadow:'0 4px 16px rgba(0,0,0,0.08)',border:'1.5px solid #d1fae5',animation:'fadeUp .2s ease'}}>
                <p style={{fontWeight:700,color:'#0d4a3a',fontSize:14,margin:'0 0 14px'}}>➕ Nouveau médicament / produit</p>
                <label style={lbl}>Nom du produit *</label>
                <input style={inp} value={prodName} onChange={e=>setProdName(e.target.value)} placeholder="Ex: Paracétamol 500mg, Coartem..."/>
                <label style={lbl}>Nom générique / DCI</label>
                <input style={inp} value={prodGeneric} onChange={e=>setProdGeneric(e.target.value)} placeholder="Ex: Paracétamol, Artémether-Luméfantrine..."/>
                <label style={lbl}>Catégorie</label>
                <select style={inp} value={prodCat} onChange={e=>setProdCat(e.target.value)}>
                  {MED_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <label style={lbl}>Prix (FCFA) *</label>
                    <input style={{...inp,marginBottom:0}} type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} placeholder="Ex: 500"/>
                  </div>
                  <div>
                    <label style={lbl}>Unité</label>
                    <select style={{...inp,marginBottom:0}} value={prodUnit} onChange={e=>setProdUnit(e.target.value)}>
                      {['boîte','plaquette','flacon','tube','sachet','unité','comprimé'].map(u=><option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{marginTop:10}}>
                  <label style={lbl}>Description / Indication</label>
                  <input style={inp} value={prodDesc} onChange={e=>setProdDesc(e.target.value)} placeholder="Ex: Antidouleur, boîte de 20 comprimés..."/>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#fef2f2',borderRadius:10,cursor:'pointer',marginBottom:14}} onClick={()=>setProdPrescription(!prodPrescription)}>
                  <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${prodPrescription?'#dc2626':'#d1d5db'}`,background:prodPrescription?'#dc2626':'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {prodPrescription&&<span style={{color:'white',fontSize:13}}>✓</span>}
                  </div>
                  <span style={{fontSize:13,color:'#dc2626',fontWeight:600}}>Nécessite une ordonnance médicale</span>
                </div>
                <button onClick={addProduct} disabled={!prodName||!prodPrice||prodSaving} style={{width:'100%',padding:'12px',borderRadius:50,border:'none',background:prodName&&prodPrice?'linear-gradient(135deg,#0d4a3a,#2eb87a)':'#e5e7eb',color:prodName&&prodPrice?'white':'#aaa',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                  {prodSaving?'⏳ Ajout...':'✅ Ajouter au stock'}
                </button>
              </div>
            )}

            {/* Liste des produits */}
            {products.length===0 ? (
              <div style={{background:'white',borderRadius:18,padding:32,textAlign:'center'}}>
                <div style={{fontSize:40,marginBottom:10}}>💊</div>
                <p style={{color:'#888',fontSize:13}}>Aucun produit dans votre stock.<br/>Ajoutez vos médicaments disponibles.</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {products.map((p,i)=>(
                  <div key={p.id} style={{background:'white',borderRadius:14,padding:'12px 14px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)',display:'flex',alignItems:'center',gap:12,opacity:p.is_available?1:0.5}}>
                    <div style={{width:42,height:42,borderRadius:12,background:'#e8f5ee',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>💊</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#0d4a3a',fontSize:13}}>{p.name}</div>
                      <div style={{color:'#888',fontSize:11}}>{p.category} · {p.price_fcfa?.toLocaleString()} FCFA / {p.unit}</div>
                      {p.requires_prescription && <span style={{background:'#fef2f2',color:'#dc2626',borderRadius:5,padding:'1px 6px',fontSize:9,fontWeight:700}}>ORDONNANCE</span>}
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>toggleProduct(p.id,p.is_available)} style={{padding:'5px 10px',borderRadius:8,border:'none',background:p.is_available?'#e8f5ee':'#f3f4f6',color:p.is_available?'#0d4a3a':'#888',fontSize:10,fontWeight:700,cursor:'pointer'}}>
                        {p.is_available?'✓ Dispo':'Indispo'}
                      </button>
                      <button onClick={()=>deleteProduct(p.id)} style={{padding:'5px 8px',borderRadius:8,border:'none',background:'#fef2f2',color:'#dc2626',fontSize:12,cursor:'pointer'}}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── APERÇU PUBLIC ── */}
        {tab==='apercu' && (
          <div style={{animation:'fadeUp .25s ease',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{background:'#fffbeb',borderRadius:12,padding:'10px 14px',border:'1px solid #fde68a'}}>
              <p style={{color:'#92400e',fontSize:12,margin:0}}>👁️ Voici comment les patients voient votre profil une fois vérifié.</p>
            </div>

            {/* Card profil */}
            <div style={{background:'white',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,0.09)'}}>
              {/* Cover */}
              <div style={{height:80,background:'linear-gradient(135deg,#0d4a3a,#2eb87a)'}}/>
              <div style={{padding:'0 18px 18px'}}>
                <div style={{width:72,height:72,borderRadius:20,border:'3px solid white',background:'#e8f5ee',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,marginTop:-36,marginBottom:10}}>
                  {photoPreview?<img src={photoPreview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'🏥'}
                </div>
                <div style={{fontWeight:800,color:'#0d4a3a',fontSize:17,marginBottom:2}}>{name||'Nom de la structure'}</div>
                <div style={{color:'#888',fontSize:12,marginBottom:8}}>{region&&city?`📍 ${city}, ${region}`:''}</div>
                {desc&&<p style={{color:'#555',fontSize:12,lineHeight:1.6,margin:'0 0 10px'}}>{desc}</p>}
                <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                  {phone&&<div style={{background:'#e8f5ee',color:'#0d4a3a',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700}}>📞 {phone}</div>}
                  {whatsapp&&<div style={{background:'#dcfce7',color:'#15803d',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700}}>💬 WhatsApp</div>}
                  {hours&&<div style={{background:'#fffbeb',color:'#92400e',borderRadius:8,padding:'5px 10px',fontSize:11}}>🕐 {hours}</div>}
                  {insurance&&<div style={{background:'#eff6ff',color:'#1d4ed8',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:700}}>🛡️ Assurances acceptées</div>}
                </div>
              </div>
            </div>

            {/* Stock aperçu si pharmacie */}
            {isPharmacy && products.filter(p=>p.is_available).length>0 && (
              <div style={{background:'white',borderRadius:18,padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
                <p style={{fontWeight:700,color:'#0d4a3a',fontSize:14,margin:'0 0 12px'}}>💊 Médicaments disponibles ({products.filter(p=>p.is_available).length})</p>
                {products.filter(p=>p.is_available).slice(0,4).map(p=>(
                  <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
                    <div>
                      <div style={{fontWeight:600,color:'#1a1a1a',fontSize:13}}>{p.name}</div>
                      <div style={{color:'#888',fontSize:11}}>{p.category}{p.requires_prescription?' · Ordonnance requise':''}</div>
                    </div>
                    <div style={{fontWeight:800,color:'#0d4a3a',fontSize:14}}>{p.price_fcfa?.toLocaleString()} F</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{background:'#f0fdf4',borderRadius:12,padding:'10px 14px',border:'1px solid #86efac',textAlign:'center'}}>
              <p style={{color:'#14532d',fontSize:12,margin:0}}>✅ Votre profil sera visible après validation KYC par notre équipe.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
