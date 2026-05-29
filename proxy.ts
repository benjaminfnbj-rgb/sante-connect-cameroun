import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED = [
  '/dashboard', '/profil', '/rendez-vous', '/pharmacie', '/sante-feminine',
  '/assistant', '/assurances', '/kit-sante', '/notifications', '/admin',
  '/structures', '/professionnels', '/calendrier-vaccinal',
]

const AUTH_ONLY = ['/connexion', '/inscription']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
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

  // Rafraîchir la session (maintient la connexion active)
  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED.some(r => pathname.startsWith(r))
  const isAuthPage = AUTH_ONLY.includes(pathname)

  // Non connecté → page protégée = rediriger vers connexion
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Connecté → essaie d'aller sur connexion/inscription = rediriger vers dashboard
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
