import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    console.log('[v0] VFD webhook received:', body)
    
    // VFD sends wallet credit notifications
    if (body.eventType === 'WALLET_CREDIT' || body.eventType === 'CREDIT') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Find user by wallet ID or account number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('vfd_wallet_id', body.data.walletId)
        .single()

      if (profileError || !profile) {
        console.error('[v0] Wallet not found for VFD ID:', body.data.walletId)
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
      }

      const amount = parseFloat(body.data.amount)

      console.log('[v0] Processing deposit for user:', profile.user_id, 'amount:', amount)

      // Update main wallet balance (live mode)
      const { data: wallet } = await supabase
        .from('main_wallets')
        .select('balance')
        .eq('user_id', profile.user_id)
        .eq('mode', 'live')
        .single()

      const newBalance = (wallet?.balance || 0) + amount

      const { error: updateError } = await supabase
        .from('main_wallets')
        .update({ balance: newBalance })
        .eq('user_id', profile.user_id)
        .eq('mode', 'live')

      if (updateError) {
        console.error('[v0] Error updating wallet balance:', updateError)
        throw updateError
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          sender_id: profile.user_id,
          amount: amount,
          currency: 'NGN',
          type: 'deposit',
          status: 'completed',
          description: `Deposit from ${body.data.senderName || 'Bank Transfer'}`,
          reference_number: body.data.reference || body.data.sessionId,
          mode: 'live',
        })

      if (txError) {
        console.error('[v0] Error creating transaction:', txError)
      }

      console.log('[v0] Deposit processed successfully')

      return NextResponse.json({ success: true })
    }

    // Handle other webhook events
    return NextResponse.json({ success: true, message: 'Event type not handled' })

  } catch (error) {
    console.error('[v0] VFD webhook error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Webhook processing failed' 
    }, { status: 500 })
  }
}
