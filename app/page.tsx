'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const emergencyNumbers = [
  { name: 'SAMU', number: '15', icon: '🚑' },
  { name: 'Pompiers', number: '18', icon: '🚒' },
  { name: 'Police', number: '17', icon: '👮' },
  { name: 'Urgences', number: '112', icon: '📞' },
]

const features = [
  { icon: '📅', title: 'Rendez-vous en ligne', desc: 'Planifiez vos consultations avec les meilleurs spécialistes' },
  { icon: '💊', title: 'Pharmacie en ligne', desc: 'Commandez vos médicaments et recevez-les à domicile' },
  { icon: '🤖', title: 'Assistant IA Santé', desc: 'Orienté par l\'IA vers les soins adaptés à vos besoins' },
  { icon: '🌺', title: 'Santé Féminine', desc: 'Suivi de cycle menstruel et accompagnement personnalisé' },
  { icon: '🛡️', title: 'Assurance Santé', desc: 'Souscrivez aux meilleures assurances partenaires' },
  { icon: '✅', title: 'Professionnels Vérifiés', desc: 'Tous nos praticiens sont certifiés et validés (KYC)' },
]

const stats = [
  { value: '500+', label: 'Médecins certifiés' },
  { value: '200+', label: 'Pharmacies partenaires' },
  { value: '50K+', label: 'Patients servis' },
  { value: '10', label: 'Régions couvertes' },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#faf8f3' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 2px 30px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 5%',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1a7a5e, #2eb87a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏥</div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 18, color: scrolled ? '#0d4a3a' : '#fff', lineHeight: 1 }}>Santé Connect</div>
              <div style={{ fontSize: 11, color: scrolled ? '#2eb87a' : '#7ddcb1', fontWeight: 500 }}>CAMEROUN</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {['Accueil','Services','Médecins','Pharmacies','Urgences'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: scrolled ? '#1a2e26' : '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 14, opacity: 0.85, transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.target as HTMLElement).style.opacity='1'}
                onMouseLeave={e => (e.target as HTMLElement).style.opacity='0.85'}>
                {item}
              </a>
            ))}
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '10px 24px', borderRadius: 50, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Connexion
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0d4a3a 0%, #0f5c45 50%, #1a7a5e 100%)',
        display: 'flex', alignItems: 'center',
        padding: '120px 5% 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(46,184,122,0.08)', border: '1px solid rgba(46,184,122,0.15)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(46,184,122,0.05)' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 50, padding: '6px 16px', marginBottom: 24 }}>
                <span style={{ width: 8, height: 8, background: '#f5a623', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ color: '#fcd68a', fontSize: 13, fontWeight: 500 }}>Plateforme de Santé Numérique #1 au Cameroun</span>
              </div>
              
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 56, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 24 }}>
                Votre Santé,<br />
                <span style={{ background: 'linear-gradient(135deg, #2eb87a, #f5a623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Notre Priorité
                </span>
              </h1>
              
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500 }}>
                Connectez-vous avec les meilleurs professionnels de santé au Cameroun. Rendez-vous en ligne, médicaments à domicile, suivi personnalisé — tout en un.
              </p>
              
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/auth/register" style={{ textDecoration: 'none' }}>
                  <button style={{ background: 'linear-gradient(135deg,#2eb87a,#1a7a5e)', color: 'white', padding: '16px 36px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 30px rgba(46,184,122,0.4)' }}>
                    Commencer Gratuitement
                  </button>
                </Link>
                <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '15px 32px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                  Découvrir nos services →
                </button>
              </div>

              {/* Pricing teaser */}
              <div style={{ marginTop: 40, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#fcd68a', fontWeight: 700, fontSize: 20 }}>1 000 FCFA<span style={{ fontSize: 12, fontWeight: 400 }}>/mois</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Accès complet</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)' }}>ou</div>
                <div style={{ background: 'rgba(245,166,35,0.15)', borderRadius: 12, padding: '12px 20px', border: '1px solid rgba(245,166,35,0.3)' }}>
                  <div style={{ color: '#f5a623', fontWeight: 700, fontSize: 20 }}>10 000 FCFA<span style={{ fontSize: 12, fontWeight: 400 }}>/an</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>2 mois offerts 🎉</div>
                </div>
              </div>
            </div>

            {/* Right visual */}
            <div style={{ position: 'relative' }}>
              {/* Floating card 1 */}
              <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', marginBottom: 20, animation: 'float 4s ease-in-out infinite' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0d4a3a' }}>Dr. Nkouamou Paul</div>
                    <div style={{ fontSize: 13, color: '#5a7a6e' }}>Cardiologue — Yaoundé</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: '#e8f9f1', color: '#2eb87a', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>✓ Vérifié</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['9h','10h','14h','15h30'].map(t => (
                    <div key={t} style={{ background: '#f0fdf8', border: '1px solid #2eb87a', color: '#1a7a5e', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t}</div>
                  ))}
                </div>
              </div>

              {/* Floating card 2 */}
              <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'float 4s ease-in-out infinite 1s', marginLeft: 40 }}>
                <div style={{ fontSize: 13, color: '#5a7a6e', marginBottom: 8 }}>🤖 Assistant Santé IA</div>
                <div style={{ background: '#f0fdf8', padding: 12, borderRadius: 10, fontSize: 14, color: '#0d4a3a', marginBottom: 8 }}>
                  "J'ai de la fièvre depuis 2 jours..."
                </div>
                <div style={{ background: 'linear-gradient(135deg,#0d4a3a,#1a7a5e)', padding: 12, borderRadius: 10, fontSize: 13, color: 'white' }}>
                  Je vous recommande le Dr. Bello, interniste à 2km. Disponible aujourd'hui à 14h.
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 24, background: 'rgba(255,255,255,0.06)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 900, color: '#2eb87a' }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMERGENCY BANNER */}
      <section id="urgences" style={{ background: '#ff1a1a', padding: '16px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>🚨 NUMÉROS D'URGENCE</span>
          {emergencyNumbers.map(e => (
            <a key={e.name} href={`tel:${e.number}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: 50 }}>
              <span>{e.icon}</span>
              <strong>{e.name}</strong>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18 }}>{e.number}</span>
            </a>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ color: '#2eb87a', fontWeight: 600, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Nos Services</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 800, color: '#0d4a3a', marginBottom: 16 }}>Tout pour votre santé</h2>
            <p style={{ color: '#5a7a6e', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>Une plateforme complète pour accéder aux meilleurs soins de santé au Cameroun</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {features.map((f, i) => (
              <div key={f.title} style={{
                background: 'white', borderRadius: 20, padding: 32,
                border: '1px solid rgba(46,184,122,0.12)',
                boxShadow: '0 4px 20px rgba(13,74,58,0.06)',
                transition: 'all 0.3s ease', cursor: 'pointer',
                animationDelay: `${i * 0.1}s`
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(13,74,58,0.15)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(13,74,58,0.06)' }}>
                <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f0fdf8, #e8f9f1)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#0d4a3a', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: '#5a7a6e', fontSize: 15, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: 'linear-gradient(160deg, #0d4a3a, #1a7a5e)', padding: '100px 5%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ color: '#7ddcb1', fontWeight: 600, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Comment ça marche</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 800, color: 'white', marginBottom: 16 }}>Simple en 3 étapes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40 }}>
            {[
              { step: '01', title: 'Créez votre compte', desc: 'Inscription gratuite avec 1 mois d\'essai. Vérification automatique par email.', icon: '👤' },
              { step: '02', title: 'Trouvez votre médecin', desc: 'Parcourez les profils vérifiés et réservez un créneau disponible en ligne.', icon: '🔍' },
              { step: '03', title: 'Accédez à vos soins', desc: 'Consultez, commandez vos médicaments et retirez vos kits santé en pharmacie.', icon: '❤️' },
            ].map((s, i) => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: 'rgba(46,184,122,0.15)', border: '1px solid rgba(46,184,122,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>{s.icon}</div>
                <div style={{ color: '#f5a623', fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 900, opacity: 0.3, lineHeight: 1 }}>{s.step}</div>
                <h3 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '8px 0 12px' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '100px 5%', background: '#faf8f3' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ color: '#2eb87a', fontWeight: 600, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Tarifs</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 800, color: '#0d4a3a', marginBottom: 16 }}>Abordable pour tous</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div style={{ background: 'white', borderRadius: 24, padding: 40, border: '2px solid rgba(46,184,122,0.2)', boxShadow: '0 8px 40px rgba(13,74,58,0.08)' }}>
              <div style={{ color: '#5a7a6e', fontWeight: 600, marginBottom: 8 }}>MENSUEL</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 900, color: '#0d4a3a' }}>1 000 <span style={{ fontSize: 16, fontWeight: 400 }}>FCFA</span></div>
              <div style={{ color: '#5a7a6e', fontSize: 14, marginBottom: 28 }}>par mois</div>
              {['Accès à tous les médecins','Rendez-vous en ligne','Pharmacies partenaires','Assistant IA Santé','Kit santé mensuel','Suivi cycle menstruel'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f0', color: '#1a2e26', fontSize: 14 }}>
                  <span style={{ color: '#2eb87a', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth/register"><button style={{ width: '100%', marginTop: 28, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '14px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Commencer</button></Link>
            </div>

            <div style={{ background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', borderRadius: 24, padding: 40, boxShadow: '0 20px 60px rgba(13,74,58,0.3)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 24, background: '#f5a623', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>🎉 MEILLEURE OFFRE</div>
              <div style={{ color: '#7ddcb1', fontWeight: 600, marginBottom: 8 }}>ANNUEL</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 900, color: 'white' }}>10 000 <span style={{ fontSize: 16, fontWeight: 400 }}>FCFA</span></div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 28 }}>par an • 2 mois offerts</div>
              {['Tout du plan mensuel','Priorité aux rendez-vous','Support premium','Kits santé annuels','Historique médical complet','Accès famille (bientôt)'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                  <span style={{ color: '#f5a623', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth/register"><button style={{ width: '100%', marginTop: 28, background: 'linear-gradient(135deg,#f5a623,#e8950f)', color: 'white', padding: '14px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Économiser 2 000 FCFA</button></Link>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#5a7a6e', fontSize: 14, marginTop: 24 }}>
            ✨ 1 mois d'essai gratuit pour tous les nouveaux inscrits • Structures sanitaires publiques : accès 100% gratuit
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #f5a623, #e8950f)', padding: '80px 5%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 16 }}>Rejoignez la révolution santé au Cameroun</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>Inscription gratuite. 1 mois d'essai offert. Aucune carte bancaire requise.</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/register"><button style={{ background: 'white', color: '#e8950f', padding: '16px 40px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Créer mon compte →</button></Link>
          <Link href="/auth/register?type=professional"><button style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '15px 36px', borderRadius: 50, border: '2px solid rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Je suis professionnel de santé</button></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a1a14', color: 'rgba(255,255,255,0.7)', padding: '60px 5% 30px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
                <span style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontWeight: 700, fontSize: 18 }}>Santé Connect Cameroun</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280 }}>La plateforme de santé numérique qui connecte patients et professionnels de santé au Cameroun.</p>
            </div>
            {[
              { title: 'Services', links: ['Médecins','Pharmacies','Assurances','Urgences'] },
              { title: 'Santé', links: ['Suivi menstruel','Assistant IA','Kits santé','Télémédecine'] },
              { title: 'Légal', links: ['Confidentialité','CGU','Contact','À propos'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#2eb87a', fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ marginBottom: 10, fontSize: 14, cursor: 'pointer' }}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, textAlign: 'center', fontSize: 13 }}>
            © 2025 Santé Connect Cameroun. Tous droits réservés. | Fait avec ❤️ pour la santé au Cameroun
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}
