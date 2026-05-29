'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const REGIONS = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest']
const VILLES: Record<string,string[]> = {
  'Centre':['Yaoundé','Mbalmayo','Bafia','Nanga-Eboko','Obala'],
  'Littoral':['Douala','Nkongsamba','Edéa','Loum','Mbanga'],
  'Ouest':['Bafoussam','Dschang','Foumban','Mbouda','Baham'],
  'Nord-Ouest':['Bamenda','Kumbo','Nkambe','Wum','Fundong'],
  'Sud-Ouest':['Buea','Limbe','Kumba','Mamfe','Tiko'],
  'Nord':['Garoua','Guider','Poli','Figuil','Pitoa'],
  'Extrême-Nord':['Maroua','Mora','Kousséri','Yagoua','Kaélé'],
  'Adamaoua':['Ngaoundéré','Meiganga','Tibati','Tignère','Banyo'],
  'Est':['Bertoua','Abong-Mbang','Batouri','Yokadouma','Belabo'],
  'Sud':['Ebolowa','Sangmélima','Kribi','Lolodorf','Ambam'],
}

const PRO_TYPES = [
  {v:'doctor',l:'Médecin / Spécialiste',icon:'👨‍⚕️',docs:['Diplôme de médecine','Ordre des médecins','CNI'],free:false},
  {v:'pharmacy',l:'Pharmacie',icon:'💊',docs:['Diplôme de pharmacie','Agrément pharmacie','Ordre des pharmaciens','CNI'],free:false},
  {v:'private_clinic',l:'Clinique / Hôpital Privé',icon:'🏥',docs:['Autorisation d\'ouverture','Registre de commerce','Acte de création','CNI dirigeant'],free:false},
  {v:'public_hospital',l:'Structure Sanitaire Publique',icon:'🏛️',docs:['Acte de création officiel','Document MINSANTÉ','CNI directeur'],free:true},
  {v:'ngo',l:'ONG / Organisation de Santé',icon:'🤝',docs:['Statuts ONG','Récépissé enregistrement','Agrément activité','CNI responsable'],free:false},
  {v:'insurance',l:'Compagnie d\'Assurance',icon:'🛡️',docs:['Agrément CIMA','Registre de commerce','CNI dirigeant'],free:false},
  {v:'un_agency',l:'Agence ONU / Internationale',icon:'🌐',docs:['Accréditation officielle','Document accréditation','CNI représentant'],free:true},
  {v:'lab',l:'Laboratoire d\'Analyses',icon:'🔬',docs:['Agrément laboratoire','Diplôme biologiste','CNI responsable'],free:false},
]

export default function RegisterProPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    pro_type:'', structure_name:'', specialty:'', description:'',
    region:'', city:'', address:'', phone:'', whatsapp:'', website:'',
    license_number:'', order_registration:'', email:'', password:'', confirmPwd:'',
  })
  const [docs, setDocs] = useState<File[]>([])
  const [showPwd, setShowPwd] = useState(false)

  const up = (k: string, v: string) => setForm(p => ({...p,[k]:v}))
  const selected = PRO_TYPES.find(t => t.v === form.pro_type)
  const cities = form.region ? (VILLES[form.region] || []) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPwd) { setError('Les mots de passe ne correspondent pas'); return }
    if (form.password.length < 8) { setError('Mot de passe trop court (min. 8 caractères)'); return }
    setLoading(true); setError('')

    const sb = createClient()
    try {
      const userType = form.pro_type === 'doctor' ? 'professional' : form.pro_type
      const {data, error: authErr} = await sb.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.structure_name, user_type: userType, phone: form.phone } }
      })
      if (authErr) throw authErr
      if (!data.user) throw new Error('Erreur création compte')

      // Créer profil via API
      await fetch('/api/create-profile', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          userId: data.user.id, email: form.email,
          fullName: form.structure_name, userType: userType,
          phone: form.phone, city: form.city, region: form.region,
          accessToken: data.session?.access_token || ''
        })
      })

      // Créer profil professionnel
      await sb.from('professional_profiles').insert({
        user_id: data.user.id,
        structure_type: form.pro_type,
        structure_name: form.structure_name,
        specialty: form.specialty || null,
        description: form.description || null,
        region: form.region, city: form.city,
        address: form.address || null,
        phone: form.phone || null, whatsapp: form.whatsapp || null,
        website: form.website || null,
        license_number: form.license_number || null,
        order_registration: form.order_registration || null,
        verification_status: 'pending',
        is_visible: false,
        is_public_sector: ['public_hospital','un_agency'].includes(form.pro_type),
      })

      // Upload documents KYC
      for (const doc of docs) {
        const path = `${data.user.id}/${Date.now()}_${doc.name}`
        const {data: uploadData} = await sb.storage.from('kyc-docs').upload(path, doc)
        if (uploadData) {
          await sb.from('kyc_documents').insert({
            user_id: data.user.id,
            document_url: uploadData.path,
            document_type: doc.name,
            verification_status: 'pending'
          })
        }
      }

      setSuccess(true)
    } catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inscription')
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = {width:'100%',padding:'11px 14px',borderRadius:12,border:'1.5px solid #e5e7eb',fontSize:14,outline:'none',fontFamily:'sans-serif',boxSizing:'border-box',marginBottom:12}
  const lbl: React.CSSProperties = {display:'block',fontWeight:700,color:'#0d4a3a',fontSize:12,fontFamily:'sans-serif',marginBottom:5}

  if (success) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0a2e22,#0d4a3a)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:28,padding:36,maxWidth:440,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:52,marginBottom:16}}>✅</div>
        <h2 style={{color:'#0d4a3a',fontFamily:'Georgia,serif',fontSize:20,margin:'0 0 12px'}}>Inscription envoyée !</h2>
        <p style={{color:'#555',fontSize:13,fontFamily:'sans-serif',lineHeight:1.7,margin:'0 0 16px'}}>
          Dossier reçu pour <strong>{form.structure_name}</strong>.<br/>
          Email de confirmation envoyé à <strong>{form.email}</strong>.
        </p>
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:14,padding:14,marginBottom:20}}>
          <p style={{color:'#92400e',fontSize:12,fontFamily:'sans-serif',margin:0,lineHeight:1.7}}>
            ⏳ Votre profil sera visible après vérification KYC (24-48h).<br/>
            📧 Envoyez vos documents originaux à : <strong>kyc@santeconnect.cm</strong>
          </p>
        </div>
        <Link href="/connexion" style={{display:'block',background:'linear-gradient(135deg,#0d4a3a,#2eb87a)',color:'white',borderRadius:50,padding:'13px',fontWeight:700,textDecoration:'none',fontFamily:'sans-serif',fontSize:14}}>
          Accéder à mon espace →
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#0a2e22,#0d4a3a)',padding:'20px 16px',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:480,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:32,marginBottom:8}}>🏥</div>
          <h1 style={{color:'white',fontFamily:'Georgia,serif',fontSize:18,fontWeight:700,margin:'0 0 4px'}}>Espace Professionnel</h1>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:11}}>Vérification KYC obligatoire</p>
          <div style={{display:'flex',gap:5,justifyContent:'center',marginTop:12}}>
            {[1,2,3,4].map(i=><div key={i} style={{width:50,height:3,borderRadius:3,background:i<=step?'#2eb87a':'rgba(255,255,255,0.2)'}}/>)}
          </div>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:10,marginTop:4}}>Étape {step}/4</p>
        </div>

        <div style={{background:'white',borderRadius:24,padding:'24px 20px'}}>
          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',color:'#dc2626',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}

          {/* ÉTAPE 1 — Type */}
          {step===1 && (
            <div>
              <h2 style={{color:'#0d4a3a',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 14px'}}>Type de structure</h2>
              <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:18}}>
                {PRO_TYPES.map(t => (
                  <div key={t.v} onClick={()=>up('pro_type',t.v)} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:12,cursor:'pointer',border:form.pro_type===t.v?'2px solid #0d4a3a':'2px solid #f0f0f0',background:form.pro_type===t.v?'#e8f5ee':'white'}}>
                    <span style={{fontSize:20,flexShrink:0}}>{t.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:form.pro_type===t.v?'#0d4a3a':'#333',fontSize:13}}>{t.l}</div>
                      {t.free && <div style={{color:'#16a34a',fontSize:10,fontWeight:700}}>🆓 Gratuit pour le secteur public</div>}
                    </div>
                    <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${form.pro_type===t.v?'#0d4a3a':'#ddd'}`,background:form.pro_type===t.v?'#0d4a3a':'white',flexShrink:0}}/>
                  </div>
                ))}
              </div>
              <button onClick={()=>form.pro_type&&setStep(2)} disabled={!form.pro_type} style={{width:'100%',padding:'13px',borderRadius:50,border:'none',cursor:form.pro_type?'pointer':'not-allowed',background:form.pro_type?'linear-gradient(135deg,#0d4a3a,#2eb87a)':'#e5e7eb',color:form.pro_type?'white':'#aaa',fontWeight:700,fontSize:14}}>
                Continuer →
              </button>
            </div>
          )}

          {/* ÉTAPE 2 — Infos + Localisation */}
          {step===2 && (
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#e8f5ee',borderRadius:10,padding:'8px 12px',marginBottom:14}}>
                <span style={{fontSize:18}}>{selected?.icon}</span>
                <span style={{fontWeight:700,color:'#0d4a3a',fontSize:12}}>{selected?.l}</span>
                <button onClick={()=>setStep(1)} style={{marginLeft:'auto',background:'none',border:'none',color:'#888',fontSize:11,cursor:'pointer'}}>Changer</button>
              </div>
              <h2 style={{color:'#0d4a3a',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 14px'}}>Informations & Localisation</h2>

              <label style={lbl}>Nom / Raison sociale *</label>
              <input style={inp} placeholder="Dr. Kamga, Clinique Espoir..." value={form.structure_name} onChange={e=>up('structure_name',e.target.value)} required/>

              {['doctor','lab'].includes(form.pro_type) && <>
                <label style={lbl}>Spécialité</label>
                <input style={inp} placeholder="Cardiologie, Pédiatrie..." value={form.specialty} onChange={e=>up('specialty',e.target.value)}/>
              </>}

              {/* LOCALISATION */}
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:12,padding:'12px 14px',marginBottom:12}}>
                <p style={{color:'#15803d',fontWeight:700,fontSize:12,margin:'0 0 10px'}}>📍 Localisation</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div>
                    <label style={lbl}>Région *</label>
                    <select style={{...inp,marginBottom:0}} value={form.region} onChange={e=>{up('region',e.target.value);up('city','')}} required>
                      <option value="">Sélectionner</option>
                      {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Ville *</label>
                    <select style={{...inp,marginBottom:0}} value={form.city} onChange={e=>up('city',e.target.value)} required disabled={!form.region}>
                      <option value="">Sélectionner</option>
                      {cities.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <label style={lbl}>Adresse complète</label>
                <input style={{...inp,marginBottom:0}} placeholder="Quartier, avenue, rue..." value={form.address} onChange={e=>up('address',e.target.value)}/>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <label style={lbl}>Téléphone</label>
                  <input style={{...inp}} placeholder="+237 6XX..." value={form.phone} onChange={e=>up('phone',e.target.value)}/>
                </div>
                <div>
                  <label style={lbl}>WhatsApp</label>
                  <input style={{...inp}} placeholder="+237 6XX..." value={form.whatsapp} onChange={e=>up('whatsapp',e.target.value)}/>
                </div>
              </div>

              <label style={lbl}>Description des activités</label>
              <textarea style={{...inp,resize:'vertical'} as React.CSSProperties} rows={3} placeholder="Services, spécialités, horaires..." value={form.description} onChange={e=>up('description',e.target.value)}/>

              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setStep(1)} style={{flex:1,padding:'12px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,cursor:'pointer',fontSize:13}}>← Retour</button>
                <button onClick={()=>form.structure_name&&form.region&&form.city&&setStep(3)} disabled={!form.structure_name||!form.region||!form.city} style={{flex:2,padding:'12px',borderRadius:50,border:'none',background:form.structure_name&&form.region&&form.city?'linear-gradient(135deg,#0d4a3a,#2eb87a)':'#e5e7eb',color:form.structure_name&&form.region&&form.city?'white':'#aaa',fontWeight:700,cursor:form.structure_name&&form.region&&form.city?'pointer':'not-allowed',fontSize:13}}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 — Documents KYC */}
          {step===3 && (
            <div>
              <h2 style={{color:'#0d4a3a',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 6px'}}>Documents KYC</h2>
              <p style={{color:'#888',fontSize:12,margin:'0 0 16px',lineHeight:1.5}}>Téléversez vos documents officiels. Ils seront vérifiés sous 24-48h.</p>

              <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
                <p style={{color:'#92400e',fontWeight:700,fontSize:12,margin:'0 0 8px'}}>📋 Documents requis pour {selected?.l} :</p>
                {selected?.docs.map((doc,i)=>(
                  <div key={i} style={{color:'#78350f',fontSize:12,marginBottom:4,display:'flex',gap:6}}><span>•</span><span>{doc}</span></div>
                ))}
              </div>

              {/* Zone de dépôt de fichiers */}
              <div style={{border:'2px dashed #d1fae5',borderRadius:14,padding:'20px',textAlign:'center',marginBottom:14,background:'#f0fdf4'}}>
                <div style={{fontSize:32,marginBottom:8}}>📁</div>
                <p style={{color:'#0d4a3a',fontWeight:700,fontSize:13,margin:'0 0 4px'}}>Ajouter vos documents</p>
                <p style={{color:'#888',fontSize:11,margin:'0 0 12px'}}>PDF, JPG, PNG — Max 10Mo par fichier</p>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e=>setDocs(Array.from(e.target.files||[]))}
                  style={{display:'none'}} id="docs-input"/>
                <label htmlFor="docs-input" style={{background:'linear-gradient(135deg,#0d4a3a,#2eb87a)',color:'white',borderRadius:50,padding:'9px 24px',cursor:'pointer',fontWeight:700,fontSize:13}}>
                  Parcourir les fichiers
                </label>
              </div>

              {docs.length > 0 && (
                <div style={{marginBottom:14}}>
                  <p style={{color:'#0d4a3a',fontWeight:700,fontSize:12,margin:'0 0 8px'}}>{docs.length} fichier(s) sélectionné(s) :</p>
                  {docs.map((f,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#e8f5ee',borderRadius:10,marginBottom:5}}>
                      <span style={{fontSize:16}}>📄</span>
                      <span style={{fontSize:12,color:'#0d4a3a',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>
                      <span style={{color:'#888',fontSize:10}}>{(f.size/1024).toFixed(0)}Ko</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:12,padding:'10px 14px',marginBottom:16}}>
                <p style={{color:'#1e40af',fontSize:11,margin:0,lineHeight:1.5}}>
                  📧 Vous pouvez aussi envoyer les originaux à <strong>kyc@santeconnect.cm</strong> avec votre email d'inscription.
                </p>
              </div>

              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setStep(2)} style={{flex:1,padding:'12px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,cursor:'pointer',fontSize:13}}>← Retour</button>
                <button onClick={()=>setStep(4)} style={{flex:2,padding:'12px',borderRadius:50,border:'none',background:'linear-gradient(135deg,#0d4a3a,#2eb87a)',color:'white',fontWeight:700,cursor:'pointer',fontSize:13}}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 4 — Compte */}
          {step===4 && (
            <form onSubmit={handleSubmit}>
              <h2 style={{color:'#0d4a3a',fontFamily:'Georgia,serif',fontSize:17,margin:'0 0 6px'}}>Créer le compte</h2>
              <p style={{color:'#888',fontSize:12,margin:'0 0 16px'}}>Email et mot de passe pour accéder à votre espace.</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:0}}>
                <div>
                  <label style={lbl}>N° Licence / Agrément</label>
                  <input style={inp} placeholder="N° officiel" value={form.license_number} onChange={e=>up('license_number',e.target.value)}/>
                </div>
                <div>
                  <label style={lbl}>N° Ordre professionnel</label>
                  <input style={inp} placeholder="Médecin/Pharmacien" value={form.order_registration} onChange={e=>up('order_registration',e.target.value)}/>
                </div>
              </div>

              <label style={lbl}>Email professionnel *</label>
              <input style={inp} type="email" required placeholder="contact@votrestructure.cm" value={form.email} onChange={e=>up('email',e.target.value)}/>

              <label style={lbl}>Mot de passe *</label>
              <div style={{position:'relative',marginBottom:12}}>
                <input style={{...inp,marginBottom:0,paddingRight:44}} type={showPwd?'text':'password'} required minLength={8} placeholder="Minimum 8 caractères" value={form.password} onChange={e=>up('password',e.target.value)}/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:16,color:'#aaa'}}>
                  {showPwd?'🙈':'👁️'}
                </button>
              </div>

              <label style={lbl}>Confirmer le mot de passe *</label>
              <input style={{...inp,borderColor:form.confirmPwd.length>0?(form.confirmPwd===form.password?'#16a34a':'#dc2626'):'#e5e7eb'}} type="password" required placeholder="Répéter le mot de passe" value={form.confirmPwd} onChange={e=>up('confirmPwd',e.target.value)}/>
              {form.confirmPwd.length>0 && (
                <p style={{fontSize:11,color:form.confirmPwd===form.password?'#16a34a':'#dc2626',margin:'-8px 0 12px'}}>
                  {form.confirmPwd===form.password?'✓ Mots de passe identiques':'✗ Mots de passe différents'}
                </p>
              )}

              {selected?.free && <div style={{background:'#e8f5ee',border:'1px solid #86efac',borderRadius:12,padding:'10px 14px',marginBottom:14}}><p style={{color:'#14532d',fontSize:12,margin:0,fontWeight:700}}>🏛️ Structure publique — Accès 100% gratuit après validation</p></div>}

              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>setStep(3)} style={{flex:1,padding:'12px',borderRadius:50,border:'1.5px solid #e5e7eb',background:'white',color:'#666',fontWeight:700,cursor:'pointer',fontSize:13}}>← Retour</button>
                <button type="submit" disabled={loading||form.password!==form.confirmPwd||form.password.length<8} style={{flex:2,padding:'12px',borderRadius:50,border:'none',background:loading||form.password!==form.confirmPwd||form.password.length<8?'#e5e7eb':'linear-gradient(135deg,#0d4a3a,#2eb87a)',color:loading||form.password!==form.confirmPwd||form.password.length<8?'#aaa':'white',fontWeight:700,cursor:'pointer',fontSize:13}}>
                  {loading?'⏳ Inscription...':'✅ Créer mon compte pro'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{textAlign:'center',marginTop:12}}>
          <Link href="/connexion" style={{color:'rgba(255,255,255,0.4)',fontSize:12,textDecoration:'none'}}>Déjà un compte ? Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
