'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useAccountMode() {
  const [accountMode, setAccountMode] = useState<'demo' | 'live'>('demo')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAccountMode() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('account_mode')
          .eq('user_id', user.id)
          .single()

        if (profile?.account_mode) {
          setAccountMode(profile.account_mode as 'demo' | 'live')
        }
      } catch (error) {
        console.error('[v0] Error fetching account mode:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountMode()

    const channel = supabase
      .channel('account-mode-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          if (payload.new.account_mode) {
            setAccountMode(payload.new.account_mode as 'demo' | 'live')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { accountMode, isLoading }
}
