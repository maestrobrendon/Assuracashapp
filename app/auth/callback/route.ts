import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    
    // Check if demo data exists, if not create it
    if (data?.user) {
      const { data: mainWallet } = await supabase
        .from('main_wallets')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('mode', 'demo')
        .maybeSingle()
      
      // If no demo wallet exists, create demo data
      if (!mainWallet) {
        console.log('[v0] Creating demo data for new user:', data.user.id)
        const { error } = await supabase.rpc('create_demo_data_for_user', {
          user_id_param: data.user.id
        })
        
        if (error) {
          console.error('[v0] Error creating demo data:', error)
        } else {
          console.log('[v0] Demo data created successfully')
        }
      }
    }
  }

  // Redirect to root (/) which is your dashboard
  return NextResponse.redirect(new URL('/', request.url))
}
