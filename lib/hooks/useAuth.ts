'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const sb = createClient()

    // getSession() uses local cache — instant, no network call
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        if (requireAuth) router.push('/connexion')
        setLoading(false)
        return
      }
      setUser(session.user)

      const [{ data: p }, { data: s }] = await Promise.all([
        sb.from('profiles').select('*').eq('id', session.user.id).single(),
        sb.from('subscriptions').select('plan,status,expires_at')
          .eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(1).single()
      ])
      setProfile(p)
      setSubscription(s)
      setLoading(false)
    })

    const { data: { subscription: authSub } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null); setProfile(null); setSubscription(null)
        if (requireAuth) router.push('/connexion')
      }
    })
    return () => authSub.unsubscribe()
  }, [requireAuth, router])

  const signOut = async () => {
    await createClient().auth.signOut()
    router.push('/')
  }

  const plan = subscription?.plan || 'free'
  const isActive = ['active', 'trial'].includes(subscription?.status || '')

  return {
    user, profile, subscription, loading, signOut, plan, isActive,
    canAccess: {
      condomsKit:      ['basic','intermediate','max','family'].includes(plan) && isActive,
      padsKit:         ['intermediate','max','family'].includes(plan) && isActive,
      insurance:       ['max','family'].includes(plan) && isActive,
      vaccineCalendar: plan === 'family' && isActive,
    }
  }
}
