import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAccountMode } from './use-account-mode'

export function useMainWallet() {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accountMode, isLoading: isModeLoading } = useAccountMode()

  const fetchBalance = async () => {
    if (isModeLoading || !accountMode) {
      return
    }
    
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        setIsLoading(false)
        setBalance(0)
        return
      }

      const userId = session.user.id

      const { data, error: fetchError } = await supabase
        .from('main_wallets')
        .select('balance')
        .eq('user_id', userId)
        .eq('mode', accountMode)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        const { data: newWallet, error: insertError } = await supabase
          .from('main_wallets')
          .insert({
            user_id: userId,
            mode: accountMode,
            balance: 0,
            currency: 'NGN'
          })
          .select('balance')
          .single()

        if (insertError) {
          // If duplicate key error, wallet exists - fetch it
          if (insertError.code === '23505') {
            const { data: existingWallet } = await supabase
              .from('main_wallets')
              .select('balance')
              .eq('user_id', userId)
              .eq('mode', accountMode)
              .single()
            
            setBalance(existingWallet?.balance || 0)
          } else {
            throw insertError
          }
        } else {
          setBalance(newWallet?.balance || 0)
        }
      } else {
        setBalance(data.balance || 0)
      }

      setError(null)
    } catch (err: any) {
      console.error('[v0] Error fetching main wallet balance:', err.message)
      setError(err.message)
      setBalance(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isModeLoading && accountMode) {
      fetchBalance()
    }

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
  }, [accountMode, isModeLoading])

  return { balance, isLoading: isLoading || isModeLoading, error, refetch: fetchBalance }
}
