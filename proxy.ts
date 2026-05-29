import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = [
  '/dashboard', '/profil', '/rendez-vous', '/sante-feminine',
  '/assistant', '/assurances', '/kit-sante', '/notifications', '/admin',
  '/structures', '/professionnels', '/calendrier-vaccinal',
]
const AUTH_PAGES = ['/connexion', '/inscription']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Laisser passer les API routes et ressources statiques sans vérification
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next')) {
    return NextResponse.next({ request })
  }

  const isProtected = PROTECTED.some(r => pathname.startsWith(r))
  const isAuthPage = AUTH_PAGES.includes(pathname)

  // Si ni protégée ni page d'auth, passer directement (ex: /tarifs, /urgences, /)
  if (!isProtected && !isAuthPage) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    'https://bicmljgguztcnhgujube.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpY21samdndXp0Y25oZ3VqdWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTE3MjUsImV4cCI6MjA5NTEyNzcyNX0.g4uRn5fXKDQoM_5kVBM9m12rDlIBEIHNHI93JFIpgKU',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Utiliser getUser() uniquement pour les pages qui en ont vraiment besoin
  const { data: { user } } = await supabase.auth.getUser()

  // Non connecté → page protégée
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Connecté → page d'auth (rediriger vers dashboard)
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
