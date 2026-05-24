// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Search, ShoppingCart, Plus, Minus, Pill, AlertCircle } from 'lucide-react'

export default function PharmaciePage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('pharmacy_products').select(`*, profiles!inner(full_name, city)`)
      .eq('is_available', true).gt('stock_quantity', 0)
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [])

  const filtered = products.filter(p => {
    const name = (p.name as string)?.toLowerCase() || ''
    const cat = (p.category as string)?.toLowerCase() || ''
    const q = search.toLowerCase()
    return (!search || name.includes(q)) && (!category || cat === category.toLowerCase())
  })

  const addToCart = (id: string) => setCart(prev => ({...prev, [id]: (prev[id] || 0) + 1}))
  const removeFromCart = (id: string) => setCart(prev => {
    const n = { ...prev }
    if (n[id] > 1) n[id]--
    else delete n[id]
    return n
  })
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)

  const categories = ['Analgésiques', 'Antibiotiques', 'Antipaludéens', 'Vitamines', 'Dermatologie', 'Pédiatrie']

  return (
    <div className="min-h-screen" style={{background: 'var(--bg-cream)'}}>
      <header className="sticky top-0 z-40 px-4 py-4" style={{background: 'white', borderBottom: '1px solid var(--border)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard"><ArrowLeft size={20} style={{color: 'var(--text-muted)'}} /></Link>
              <span className="font-bold text-lg" style={{fontFamily: 'Fraunces, serif'}}>Pharmacie en ligne</span>
            </div>
            {cartCount > 0 && (
              <Link href="/pharmacie/panier" className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white" style={{background: 'var(--green-deep)'}}>
                <ShoppingCart size={18} />
                <span className="text-sm">{cartCount}</span>
              </Link>
            )}
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color: 'var(--text-muted)'}} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un médicament..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{background: 'var(--bg-cream)', border: '1px solid var(--border)'}} />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button onClick={() => setCategory('')}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{background: !category ? 'var(--green-deep)' : 'var(--bg-cream)', color: !category ? 'white' : 'var(--text-muted)'}}>
              Tous
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c === category ? '' : c)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{background: category === c ? 'var(--green-deep)' : 'var(--bg-cream)', color: category === c ? 'white' : 'var(--text-muted)'}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="p-3 rounded-xl mb-6 flex items-center gap-2" style={{background: '#fffbeb', border: '1px solid #fde68a'}}>
          <AlertCircle size={16} style={{color: '#d97706'}} />
          <p className="text-xs" style={{color: '#92400e'}}>Les médicaments sur ordonnance nécessitent une prescription médicale valide.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Pill size={40} className="mx-auto mb-3" style={{color: 'var(--text-muted)'}} />
            <p className="font-medium">Aucun médicament trouvé</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((product, i) => {
              const p = product as Record<string, unknown>
              const pharmacy = p.profiles as Record<string, string>
              const qty = cart[p.id as string] || 0
              return (
                <div key={i} className="p-4 rounded-2xl" style={{background: 'white', border: '1px solid var(--border)'}}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{color: 'var(--text-dark)'}}>{p.name as string}</p>
                      <p className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>{p.category as string}</p>
                      {pharmacy && (
                        <p className="text-xs mt-0.5" style={{color: 'var(--green-mid)'}}>
                          📍 {pharmacy.full_name} — {pharmacy.city}
                        </p>
                      )}
                    </div>
                    {(p.requires_prescription as boolean) && (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-2" style={{background: '#fee2e2', color: '#dc2626'}}>
                        Ordonnance
                      </span>
                    )}
                  </div>
                  {(p.description as string | null) && (
                    <p className="text-xs mb-3 line-clamp-2" style={{color: 'var(--text-muted)'}}>{p.description as string}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold" style={{color: 'var(--green-deep)'}}>{(p.price as number)?.toLocaleString()} FCFA</span>
                      <span className="text-xs ml-2" style={{color: 'var(--text-muted)'}}>Stock: {p.stock_quantity as number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <>
                          <button onClick={() => removeFromCart(p.id as string)}
                            className="w-7 h-7 rounded-full flex items-center justify-center" style={{background: 'var(--bg-cream)'}}>
                            <Minus size={14} />
                          </button>
                          <span className="font-bold w-5 text-center">{qty}</span>
                          <button onClick={() => addToCart(p.id as string)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{background: 'var(--green-deep)'}}>
                            <Plus size={14} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => addToCart(p.id as string)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white" style={{background: 'var(--green-deep)'}}>
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-0 w-full max-w-sm px-4">
          <Link href="/pharmacie/panier"
            className="flex items-center justify-between gap-4 px-6 py-4 rounded-2xl text-white font-bold shadow-xl"
            style={{background: 'var(--green-deep)'}}>
            <ShoppingCart size={20} />
            <span>Voir le panier ({cartCount} articles)</span>
          </Link>
        </div>
      )}
    </div>
  )
}
