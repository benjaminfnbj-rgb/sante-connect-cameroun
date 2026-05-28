// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['Tous','Analgésiques','Antibiotiques','Antipaludéens','Vitamines','Dermatologie','Pédiatrie','Cardiologie','Diabète']

const DEMO_PRODUCTS = [
  { id:'d1', name:'Paracétamol 500mg', category:'Analgésiques', price:500, stock_quantity:150, description:'Antidouleur et antipyrétique. Boîte de 20 comprimés.', requires_prescription:false, pharmacy_name:'Pharmacie Centrale Yaoundé' },
  { id:'d2', name:'Amoxicilline 500mg', category:'Antibiotiques', price:3500, stock_quantity:80, description:'Antibiotique à large spectre. Boîte de 16 gélules. Sur ordonnance.', requires_prescription:true, pharmacy_name:'Pharmacie du Peuple Douala' },
  { id:'d3', name:'Coartem 20/120mg', category:'Antipaludéens', price:4200, stock_quantity:45, description:'Traitement du paludisme non compliqué. 24 comprimés.', requires_prescription:true, pharmacy_name:'Pharmacie Centrale Yaoundé' },
  { id:'d4', name:'Vitamine C 1000mg', category:'Vitamines', price:1200, stock_quantity:200, description:'Effervescent. Renforcement du système immunitaire. 20 comprimés.', requires_prescription:false, pharmacy_name:'Pharmacie Bafoussam Santé' },
  { id:'d5', name:'Ibuprofen 400mg', category:'Analgésiques', price:800, stock_quantity:120, description:'Anti-inflammatoire et antidouleur. 20 comprimés.', requires_prescription:false, pharmacy_name:'Pharmacie du Peuple Douala' },
  { id:'d6', name:'Bétaméthasone crème', category:'Dermatologie', price:2800, stock_quantity:35, description:'Traitement dermatologiques. Tube 30g.', requires_prescription:true, pharmacy_name:'Pharmacie Centrale Yaoundé' },
  { id:'d7', name:'Sirop pédiatrique Paracétamol', category:'Pédiatrie', price:1500, stock_quantity:60, description:'Pour enfants de 2 à 12 ans. Flacon 120ml.', requires_prescription:false, pharmacy_name:'Pharmacie Bafoussam Santé' },
  { id:'d8', name:'Metformine 500mg', category:'Diabète', price:1800, stock_quantity:90, description:'Traitement du diabète de type 2. 60 comprimés.', requires_prescription:true, pharmacy_name:'Pharmacie du Peuple Douala' },
  { id:'d9', name:'Zinc + Vitamine D', category:'Vitamines', price:2200, stock_quantity:110, description:'Complément alimentaire immunité. 30 gélules.', requires_prescription:false, pharmacy_name:'Pharmacie Centrale Yaoundé' },
]

export default function PharmaciePage() {
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [cat, setCat] = useState('Tous')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    // Charger les vrais produits depuis Supabase en plus des démos
    supabase.from('pharmacy_products').select('*').eq('is_available', true)
      .then(({ data }) => { if (data && data.length > 0) setProducts([...DEMO_PRODUCTS, ...data]) })
  }, [])

  const filtered = products.filter(p => {
    const matchCat = cat === 'Tous' || p.category === cat
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id)
      if (existing) return prev.map(i => i.id === p.id ? {...i, qty: i.qty+1} : i)
      return [...prev, {...p, qty:1}]
    })
  }

  const totalCart = cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f0', fontFamily:'sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding:'32px 20px 48px', marginTop:0 }}>
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:10 }}>💊</div>
          <h1 style={{ color:'white', fontSize:26, fontFamily:'Georgia,serif', fontWeight:700, margin:'0 0 6px' }}>Pharmacie en ligne</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, margin:0 }}>Commandez et faites livrer à domicile au Cameroun</p>
        </div>
      </div>

      <div style={{ maxWidth:700, margin:'-20px auto 0', padding:'0 16px 40px' }}>

        {/* Barre recherche + panier */}
        <div style={{ background:'white', borderRadius:20, padding:16, marginBottom:14, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', display:'flex', gap:10, alignItems:'center' }}>
          <input placeholder="🔍 Rechercher un médicament..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, padding:'11px 16px', borderRadius:12, border:'1.5px solid #e5e7eb', fontSize:14, outline:'none' }}
          />
          {cart.length > 0 && (
            <button onClick={() => setShowCart(true)} style={{ position:'relative', background:'#0d4a3a', color:'white', border:'none', borderRadius:14, padding:'11px 18px', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              🛒 {cart.reduce((s,i)=>s+i.qty,0)}
              <span style={{ fontSize:11 }}>{totalCart.toLocaleString()} F</span>
            </button>
          )}
        </div>

        {/* Catégories */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:16 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding:'8px 16px', borderRadius:50, border:'none', cursor:'pointer', whiteSpace:'nowrap',
              background: cat === c ? '#0d4a3a' : 'white', color: cat === c ? 'white' : '#555',
              fontWeight: cat === c ? 700 : 400, fontSize:13, flexShrink:0,
              boxShadow: cat === c ? '0 4px 12px rgba(13,74,58,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
            }}>{c}</button>
          ))}
        </div>

        {/* Avertissement */}
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:'12px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
          <p style={{ color:'#92400e', fontSize:12, margin:0, lineHeight:1.5 }}>Les médicaments sur ordonnance nécessitent une <strong>prescription médicale valide</strong>. Un pharmacien vérifiera votre ordonnance avant la livraison.</p>
        </div>

        {/* Produits */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background:'white', borderRadius:18, padding:18, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f0f0f0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                    <span style={{ fontWeight:700, color:'#0d4a3a', fontSize:15 }}>{p.name}</span>
                    {p.requires_prescription && (
                      <span style={{ background:'#fef3c7', color:'#d97706', borderRadius:6, padding:'2px 7px', fontSize:10, fontWeight:700 }}>📋 Ordonnance</span>
                    )}
                  </div>
                  <span style={{ background:'#f0fdf4', color:'#16a34a', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{p.category}</span>
                </div>
              </div>
              {p.description && <p style={{ color:'#666', fontSize:12, lineHeight:1.5, margin:'0 0 12px' }}>{p.description}</p>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f5f5f5', paddingTop:12 }}>
                <div>
                  <div style={{ color:'#0d4a3a', fontWeight:800, fontSize:18 }}>{p.price?.toLocaleString()} <span style={{ fontSize:12, fontWeight:600 }}>FCFA</span></div>
                  <div style={{ color: p.stock_quantity > 10 ? '#16a34a' : '#dc2626', fontSize:11, marginTop:2 }}>
                    {p.stock_quantity > 0 ? `✓ En stock (${p.stock_quantity})` : '✗ Rupture de stock'}
                  </div>
                </div>
                <button onClick={() => addToCart(p)} disabled={p.stock_quantity === 0} style={{
                  background: p.stock_quantity === 0 ? '#e5e7eb' : 'linear-gradient(135deg,#0d4a3a,#2eb87a)',
                  color: p.stock_quantity === 0 ? '#aaa' : 'white', border:'none', borderRadius:12,
                  padding:'10px 18px', fontWeight:700, fontSize:13, cursor: p.stock_quantity === 0 ? 'not-allowed' : 'pointer',
                }}>
                  {p.stock_quantity === 0 ? 'Indisponible' : '+ Ajouter'}
                </button>
              </div>
              {p.pharmacy_name && <div style={{ color:'#aaa', fontSize:11, marginTop:8 }}>🏪 {p.pharmacy_name}</div>}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px', background:'white', borderRadius:20 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>💊</div>
            <p style={{ color:'#888', fontSize:15 }}>Aucun médicament trouvé pour cette recherche</p>
            <button onClick={() => {setSearch(''); setCat('Tous')}} style={{ marginTop:12, padding:'10px 24px', borderRadius:50, background:'#0d4a3a', color:'white', border:'none', cursor:'pointer', fontWeight:700 }}>
              Tout afficher
            </button>
          </div>
        )}
      </div>

      {/* Modal panier */}
      {showCart && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' }} onClick={() => setShowCart(false)}>
          <div style={{ background:'white', borderRadius:'24px 24px 0 0', padding:28, width:'100%', maxWidth:500, maxHeight:'80vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'#0d4a3a', fontFamily:'Georgia,serif', fontSize:20, margin:'0 0 20px' }}>🛒 Mon panier</h3>
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight:700, color:'#333', fontSize:14 }}>{item.name}</div>
                  <div style={{ color:'#888', fontSize:12 }}>Qté: {item.qty} × {item.price?.toLocaleString()} FCFA</div>
                </div>
                <div style={{ fontWeight:700, color:'#0d4a3a' }}>{(item.price * item.qty).toLocaleString()} F</div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 0', fontWeight:800, fontSize:16, color:'#0d4a3a', borderTop:'2px solid #e5e7eb' }}>
              <span>Total</span><span>{totalCart.toLocaleString()} FCFA</span>
            </div>
            <Link href="/dashboard" style={{ display:'block', textAlign:'center', background:'linear-gradient(135deg,#0d4a3a,#2eb87a)', color:'white', borderRadius:50, padding:'15px', fontWeight:700, fontSize:15, textDecoration:'none', marginTop:8 }}>
              Commander → Connexion requise
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
