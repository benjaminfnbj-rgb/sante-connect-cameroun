'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Cette page redirige vers la nouvelle page d'inscription unifiée
function RedirectRegister() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || ''

  useEffect(() => {
    router.replace('/inscription' + (type ? `?type=${type}` : ''))
  }, [router, type])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#0d4a3a,#1a7a5e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏥</div>
        <p style={{ fontFamily: 'sans-serif', fontSize: 14 }}>Redirection...</p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#0d4a3a', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
        Chargement...
      </div>
    }>
      <RedirectRegister />
    </Suspense>
  )
}
