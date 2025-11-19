import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    // Exchange code for session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('[v0] Session exchange failed:', sessionError)
      return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url))
    }
    
    // CRITICAL: Initialize demo data for new users
    if (data?.user) {
      try {
        console.log('[v0] Checking demo data for user:', data.user.id)
        
        // Check if user already has demo data
        const { data: mainWallet, error: walletError } = await supabase
          .from('main_wallets')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('mode', 'demo')
          .maybeSingle()
        
        if (walletError) {
          console.error('[v0] Error checking main wallet:', walletError)
        }
        
        // If no demo wallet exists, create all demo data
        if (!mainWallet) {
          console.log('[v0] No demo wallet found. Creating demo data...')
          
          const { error: rpcError } = await supabase.rpc('create_demo_data_for_user', {
            user_id_param: data.user.id
          })
          
          if (rpcError) {
            console.error('[v0] Demo data creation failed:', rpcError.message, rpcError.details)
          } else {
            console.log('[v0] ✅ Demo data created successfully for user:', data.user.id)
          }
        } else {
          console.log('[v0] Demo wallet already exists for user:', data.user.id)
        }
      } catch (err) {
        console.error('[v0] Unexpected error in demo data creation:', err)
      }
    } else {
      console.error('[v0] No user data after session exchange')
    }
  } else {
    console.error('[v0] No code parameter in callback URL')
  }

  // Always redirect to dashboard
  return NextResponse.redirect(new URL('/', request.url))
}
