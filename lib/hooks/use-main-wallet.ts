import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useMainWallet() {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('main_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      setBalance(data?.balance || 0)
      setError(null)
    } catch (err: any) {
      console.error('[v0] Error fetching main wallet balance:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()

    const channel = supabase
      .channel('main-wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'main_wallets'
        },
        () => {
          fetchBalance()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { balance, isLoading, error, refetch: fetchBalance }
}
