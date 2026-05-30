'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const s = {
    navLink: { color: scrolled ? '#0d4a3a' : 'white', fontFamily: 'sans-serif', fontSize: 14, fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
    btn: (primary: boolean) => ({
      padding: primary ? '12px 24px' : '10px 20px',
      borderRadius: 50, fontFamily: 'sans-serif', fontWeight: 700, fontSize: 14,
      textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s',
      background: primary ? 'linear-gradient(135deg,#2eb87a,#0d4a3a)' : 'rgba(255,255,255,0.15)',
      color: 'white', border: primary ? 'none' : '1.5px solid rgba(255,255,255,0.5)',
      backdropFilter: primary ? 'none' : 'blur(10px)',
    } as React.CSSProperties),
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#faf8f3', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 2px 30px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s', padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#0d4a3a,#2eb87a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>
            <span style={{ fontWeight: 800, fontSize: 16, color: scrolled ? '#0d4a3a' : 'white', fontFamily: 'Georgia,serif' }}>Santé Connect</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
            {[['Professionnels', '/professionnels'], ['Structures', '/structures'], ['Pharmacie', '/pharmacie'], ['Assurances', '/assurances'], ['Assistant IA', '/assistant']].map(([l, h]) => (
              <Link key={h} href={h} style={s.navLink}>{l}</Link>
            ))}
            <Link href="/urgences" style={{ ...s.navLink, color: '#ef4444', fontWeight: 700 }}>🚨 Urgences</Link>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/connexion" style={{ color: scrolled ? '#0d4a3a' : 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'none' }} className="md:block">Connexion</Link>
            <Link href="/inscription" style={{ background: 'linear-gradient(135deg,#0d4a3a,#2eb87a)', color: 'white', borderRadius: 50, padding: '10px 20px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              Commencer
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, padding: 8 }} className="md:hidden">
              {[0, 1, 2].map(i => <div key={i} style={{ width: 22, height: 2, background: scrolled ? '#0d4a3a' : 'white', borderRadius: 2 }} />)}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div style={{ background: 'white', padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
            {[['Professionnels', '/professionnels'], ['Structures', '/structures'], ['Pharmacie', '/pharmacie'], ['Assurances', '/assurances'], ['Assistant IA', '/assistant'], ['🚨 Urgences', '/urgences'], ['Connexion', '/connexion']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', color: '#0d4a3a', fontWeight: 600, padding: '10px 0', textDecoration: 'none', borderBottom: '1px solid #f0f0f0', fontFamily: 'sans-serif', fontSize: 15 }} onClick={() => setMenuOpen(false)}>{l}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(160deg,#0a2e22 0%,#0d4a3a 50%,#1a7a5e 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '120px 5% 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 20% 50%, #2eb87a 0%, transparent 50%), radial-gradient(circle at 80% 20%, #f5a623 0%, transparent 40%)' }} />
        {/* Urgences sticky */}
        <div style={{ position: 'absolute', top: 88, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ background: 'rgba(220,38,38,0.9)', backdropFilter: 'blur(20px)', borderRadius: 50, padding: '6px 16px', display: 'flex', gap: 12 }}>
            {[['117','Police'],['118','Pompiers'],['119','SAMU'],['113','Gendarmerie'],['112','Universel'],['1510','Info Santé']].map(([n, l]) => (
              <a key={n} href={`tel:${n}`} style={{ color: 'white', fontFamily: 'sans-serif', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>{n} {l}</a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 750, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(46,184,122,0.2)', borderRadius: 50, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: '#2eb87a', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ color: '#7ddcb1', fontSize: 13, fontFamily: 'sans-serif', fontWeight: 600 }}>Plateforme de Santé Numérique · Cameroun</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(32px,6vw,62px)', fontFamily: 'Georgia,serif', fontWeight: 700, lineHeight: 1.15, margin: '0 0 20px' }}>
            Votre santé,<br />
            <span style={{ background: 'linear-gradient(135deg,#2eb87a,#f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              connectée au Cameroun
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.7, margin: '0 0 36px', fontFamily: 'sans-serif' }}>
            Médecins vérifiés, pharmacies en ligne, assistant IA santé, suivi menstruel, assurances et kits de santé.
            Tout en un, disponible 24h/24 pour toute la population camerounaise.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/inscription" style={{ background: 'linear-gradient(135deg,#2eb87a,#0d4a3a)', color: 'white', borderRadius: 50, padding: '16px 36px', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 30px rgba(46,184,122,0.4)', fontFamily: 'sans-serif' }}>
              🚀 Commencer gratuitement
            </Link>
            <Link href="/professionnels" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 50, padding: '16px 32px', fontWeight: 600, fontSize: 15, textDecoration: 'none', fontFamily: 'sans-serif' }}>
              Trouver un médecin →
            </Link>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 20, fontFamily: 'sans-serif' }}>
            1 mois d&apos;essai gratuit · Sans carte bancaire · Structures publiques gratuites
          </p>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 700, margin: '60px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[['500+','Médecins'],['200+','Pharmacies'],['10','Régions'],['24h','Disponible']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#2eb87a', fontSize: 22, fontWeight: 800, fontFamily: 'Georgia,serif' }}>{v}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'sans-serif', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div style={{ padding: '80px 5%', background: '#faf8f3' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(26px,4vw,40px)', fontFamily: 'Georgia,serif', color: '#0d4a3a', margin: '0 0 12px' }}>Tous vos services de santé en un seul endroit</h2>
            <p style={{ color: '#6b7a6e', fontSize: 16, fontFamily: 'sans-serif' }}>Une plateforme complète conçue pour le Cameroun</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {[
              { icon: '📅', title: 'Rendez-vous en ligne', desc: 'Consultez les disponibilités et réservez avec des médecins vérifiés KYC en quelques clics.', href: '/professionnels', color: '#0d4a3a', bg: '#e8f5ee' },
              { icon: '💊', title: 'Pharmacie en ligne', desc: 'Commandez vos médicaments auprès des pharmacies partenaires et recevez-les à domicile.', href: '/pharmacie', color: '#2563eb', bg: '#eff6ff' },
              { icon: '🤖', title: 'Assistant IA Santé', desc: 'L\'IA vous oriente intelligemment vers les soins adaptés à votre situation sans remplacer le médecin.', href: '/assistant', color: '#d97706', bg: '#fffbeb' },
              { icon: '🌺', title: 'Santé Féminine', desc: 'Suivi de cycle menstruel, symptômes, ovulation et rappels personnalisés pour votre santé au quotidien.', href: '/sante-feminine', color: '#db2777', bg: '#fdf2f8' },
              { icon: '🏥', title: 'Structures Sanitaires', desc: 'Pyramide des 6 catégories d\'établissements du MINSANTÉ avec logique référence / contre-référence.', href: '/structures', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: '🛡️', title: 'Assurance Santé', desc: 'Souscrivez à des assurances santé, maladie et vie auprès de nos compagnies partenaires.', href: '/assurances', color: '#059669', bg: '#ecfdf5' },
              { icon: '🎁', title: 'Kit Santé Mensuel', desc: 'Préservatifs inclus dans l\'abonnement et serviettes hygiéniques gratuites pour les femmes de moins de 50 ans.', href: '/kit-sante', color: '#ea580c', bg: '#fff7ed' },
              { icon: '🚨', title: 'Numéros d\'urgence', desc: '35 numéros d\'urgence au Cameroun toujours accessibles, même sans abonnement actif.', href: '/urgences', color: '#dc2626', bg: '#fef2f2' },
            ].map((f, i) => (
              <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1.5px solid #e5e7eb', transition: 'all 0.2s', cursor: 'pointer', height: '100%' }}>
                  <div style={{ width: 52, height: 52, background: f.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ color: f.color, fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{f.title}</h3>
                  <p style={{ color: '#6b7a6e', fontSize: 13, fontFamily: 'sans-serif', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── PYRAMIDE SANITAIRE ── */}
      <div style={{ padding: '80px 5%', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontFamily: 'Georgia,serif', color: '#0d4a3a', margin: '0 0 12px' }}>Pyramide Sanitaire du Cameroun</h2>
          <p style={{ color: '#6b7a6e', fontSize: 15, fontFamily: 'sans-serif', margin: '0 0 40px' }}>6 niveaux de soins respectant la logique du MINSANTÉ</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {[
              { w: '30%', label: 'Cat.1 — HG / CHU', sub: 'Niveau Stratégique', color: '#dc2626', bg: '#fef2f2' },
              { w: '45%', label: 'Cat.2 — Hôpitaux Centraux', sub: 'Niveau Stratégique', color: '#ea580c', bg: '#fff7ed' },
              { w: '60%', label: 'Cat.3 — Hôpitaux Régionaux', sub: 'Niveau Intermédiaire', color: '#d97706', bg: '#fffbeb' },
              { w: '75%', label: 'Cat.4 — Hôpitaux de District', sub: 'Niveau Opérationnel', color: '#16a34a', bg: '#f0fdf4' },
              { w: '88%', label: 'Cat.5 — CMA', sub: 'Niveau Opérationnel', color: '#0891b2', bg: '#ecfeff' },
              { w: '100%', label: 'Cat.6 — CSI / CSA', sub: 'Niveau Opérationnel — Premier contact', color: '#7c3aed', bg: '#f5f3ff' },
            ].map((l, i) => (
              <div key={i} style={{ width: l.w, background: l.bg, border: `2px solid ${l.color}30`, borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: l.color, fontSize: 13, fontFamily: 'sans-serif' }}>{l.label}</div>
                <div style={{ color: '#888', fontSize: 11, fontFamily: 'sans-serif' }}>{l.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ color: '#888', fontSize: 12, fontFamily: 'sans-serif' }}>⬆️ Référence montante</span>
            <span style={{ color: '#ccc', fontSize: 12 }}>·</span>
            <span style={{ color: '#888', fontSize: 12, fontFamily: 'sans-serif' }}>⬇️ Contre-référence descendante</span>
          </div>
          <Link href="/structures" style={{ display: 'inline-block', marginTop: 24, background: '#0d4a3a', color: 'white', borderRadius: 50, padding: '12px 28px', fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: 'sans-serif' }}>
            Explorer les structures →
          </Link>
        </div>
      </div>

      {/* ── TARIFS ── */}
      <div style={{ padding: '80px 5%', background: '#faf8f3' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontFamily: 'Georgia,serif', color: '#0d4a3a', margin: '0 0 12px' }}>Tarifs simples et transparents</h2>
          <p style={{ color: '#6b7a6e', fontSize: 15, fontFamily: 'sans-serif', margin: '0 0 40px' }}>Accessibles à tous les Camerounais</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {[
              { title: 'Mensuel', price: '1 000 FCFA', period: '/mois', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', badge: null },
              { title: 'Annuel', price: '10 000 FCFA', period: '/an', color: '#0d4a3a', bg: 'white', border: '#0d4a3a', badge: '🎉 2 mois offerts' },
              { title: 'Secteur Public', price: 'GRATUIT', period: 'toujours', color: '#16a34a', bg: '#f0fdf4', border: '#86efac', badge: '🏛️ Structures publiques' },
            ].map((p, i) => (
              <div key={i} style={{ background: p.bg, borderRadius: 20, padding: 28, border: `2px solid ${p.border}`, position: 'relative' }}>
                {p.badge && <div style={{ background: p.color, color: 'white', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontFamily: 'sans-serif', fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>{p.badge}</div>}
                <h3 style={{ color: p.color, fontFamily: 'Georgia,serif', fontSize: 18, margin: '0 0 8px' }}>{p.title}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', margin: '12px 0' }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: p.color, fontFamily: 'sans-serif' }}>{p.price}</span>
                  <span style={{ color: '#888', fontSize: 13, fontFamily: 'sans-serif' }}>{p.period}</span>
                </div>
                <div style={{ color: '#666', fontSize: 13, fontFamily: 'sans-serif', lineHeight: 1.8, textAlign: 'left' }}>
                  {['Accès complet à tous les services', 'Médecins vérifiés', 'Pharmacie + livraison', 'Assistant IA + Santé féminine', 'Kit santé mensuel', '1 mois d\'essai gratuit'].map((f, j) => (
                    <div key={j}>✓ {f}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Link href="/inscription" style={{ display: 'inline-block', marginTop: 32, background: 'linear-gradient(135deg,#0d4a3a,#2eb87a)', color: 'white', borderRadius: 50, padding: '16px 40px', fontWeight: 700, fontSize: 16, textDecoration: 'none', fontFamily: 'sans-serif', boxShadow: '0 8px 30px rgba(13,74,58,0.3)' }}>
            Commencer l&apos;essai gratuit →
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a1a14', color: 'rgba(255,255,255,0.6)', padding: '48px 5% 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🏥</span>
                <span style={{ color: 'white', fontWeight: 800, fontFamily: 'Georgia,serif' }}>Santé Connect</span>
              </div>
              <p style={{ fontSize: 13, fontFamily: 'sans-serif', lineHeight: 1.7 }}>La plateforme de santé numérique pour tous les Camerounais.</p>
            </div>
            {[
              { title: 'Services', links: [['Professionnels','/professionnels'], ['Structures','/structures'], ['Pharmacie','/pharmacie'], ['Assurances','/assurances']] },
              { title: 'Santé', links: [['Assistant IA','/assistant'], ['Santé Féminine','/sante-feminine'], ['Kit Santé','/kit-sante'], ['Urgences','/urgences']] },
              { title: 'Compte', links: [['Connexion','/connexion'], ['Inscription','/inscription'], ['Tarifs','/tarifs'], ['Dashboard','/dashboard']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ color: 'white', fontFamily: 'sans-serif', fontWeight: 700, fontSize: 13, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>{col.title}</h4>
                {col.links.map(([l, h]) => <Link key={h} href={h} style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'sans-serif', textDecoration: 'none', marginBottom: 8 }}>{l}</Link>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontFamily: 'sans-serif', margin: 0 }}>
              © 2025 Santé Connect Cameroun · Fait avec ❤️ pour la santé au Cameroun · 
              <a href="tel:15" style={{ color: '#ef4444', fontWeight: 700 }}>🚨 Urgences : 15</a>
            </p>
          </div>
        </div>
      </footer>
    
      {/* Footer légal */}
      <div style={{ background:'#0a2e22', padding:'20px 16px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:11, margin:'0 0 8px' }}>© 2026 Santé Connect Cameroun</p>
        <div style={{ display:'flex', justifyContent:'center', gap:16 }}>
          <a href="/mentions-legales" style={{ color:'rgba(255,255,255,0.4)', fontSize:11, textDecoration:'none' }}>Mentions légales</a>
          <a href="/cgu" style={{ color:'rgba(255,255,255,0.4)', fontSize:11, textDecoration:'none' }}>CGU</a>
          <a href="/tarifs" style={{ color:'rgba(255,255,255,0.4)', fontSize:11, textDecoration:'none' }}>Tarifs</a>
        </div>
      </div>
    </div>
  )
}