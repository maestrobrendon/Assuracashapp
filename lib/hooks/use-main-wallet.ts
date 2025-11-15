import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAccountMode } from './use-account-mode'

export function useMainWallet() {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accountMode, isLoading: isModeLoading } = useAccountMode()

  const fetchBalance = async () => {
    if (isModeLoading) return
    
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
        .eq('mode', accountMode)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (!data) {
        console.log('[v0] No main wallet found for mode:', accountMode, '- creating one')
        const { data: newWallet, error: insertError } = await supabase
          .from('main_wallets')
          .insert({
            user_id: user.id,
            mode: accountMode,
            balance: 0,
            currency: 'NGN'
          })
          .select('balance')
          .single()

        if (insertError) {
          // If duplicate key error, it means wallet was created by another process, fetch it
          if (insertError.code === '23505') {
            console.log('[v0] Main wallet already exists, fetching it')
            const { data: existingWallet } = await supabase
              .from('main_wallets')
              .select('balance')
              .eq('user_id', user.id)
              .eq('mode', accountMode)
              .single()
            
            setBalance(existingWallet?.balance || 0)
          } else {
            console.error('[v0] Error creating main wallet:', insertError)
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
  }, [accountMode, isModeLoading])

  return { balance, isLoading: isLoading || isModeLoading, error, refetch: fetchBalance }
}
