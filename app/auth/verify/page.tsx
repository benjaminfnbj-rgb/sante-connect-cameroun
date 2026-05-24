'use client'
import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 48, maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ width: 72, height: 72, background: '#f0fdf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>📧</div>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, color: '#0d4a3a', marginBottom: 12 }}>Vérifiez votre email</h1>
        <p style={{ color: '#5a7a6e', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
          Un email de confirmation a été envoyé à <strong style={{ color: '#0d4a3a' }}>{email}</strong>.<br />
          Cliquez sur le lien pour activer votre compte.
        </p>
        <div style={{ background: '#f0fdf8', borderRadius: 14, padding: 16, marginBottom: 28, fontSize: 14, color: '#2eb87a' }}>
          ✨ Votre essai gratuit de 1 mois commence dès la validation !
        </div>
        <Link href="/auth/login"><button style={{ background: 'linear-gradient(135deg,#1a7a5e,#2eb87a)', color: 'white', padding: '13px 36px', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Aller à la connexion</button></Link>
        <p style={{ marginTop: 20 }}><Link href="/" style={{ color: '#5a7a6e', fontSize: 13, textDecoration: 'none' }}>← Retour à l'accueil</Link></p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyContent /></Suspense>
}
