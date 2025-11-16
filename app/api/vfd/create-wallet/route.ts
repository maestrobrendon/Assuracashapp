import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { vfdFetch } from '@/lib/vfd/client'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { fullName, phoneNumber, email } = await req.json()

    console.log('[v0] Creating VFD wallet for user:', user.id)

    // Call VFD API to create wallet
    const vfdResponse = await vfdFetch('/wallet/create', {
      method: 'POST',
      body: JSON.stringify({
        walletName: fullName,
        customerName: fullName,
        bvn: '22222222222', // Test BVN for sandbox environment
        phoneNumber: phoneNumber,
        email: email,
        dateOfBirth: '1990-01-01', // Test DOB for sandbox
      }),
    })

    if (!vfdResponse.success) {
      console.error('[v0] VFD wallet creation failed:', vfdResponse)
      return NextResponse.json({ error: vfdResponse.message || 'Wallet creation failed' }, { status: 400 })
    }

    console.log('[v0] VFD wallet created successfully:', vfdResponse.data)

    // Save wallet details to database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        vfd_wallet_id: vfdResponse.data.walletId,
        vfd_account_number: vfdResponse.data.accountNumber,
        vfd_account_name: vfdResponse.data.accountName,
        vfd_wallet_reference: vfdResponse.data.walletReference,
        vfd_bank_name: 'VFD Microfinance Bank',
        phone_number: phoneNumber,
        kyc_status: 'approved',
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[v0] Error updating profile with VFD details:', updateError)
      throw updateError
    }

    // Initialize live mode main wallet with zero balance
    const { error: walletError } = await supabase
      .from('main_wallets')
      .upsert({
        user_id: user.id,
        balance: 0,
        currency: 'NGN',
        mode: 'live',
        bank_name: 'VFD Microfinance Bank',
        bank_account_number: vfdResponse.data.accountNumber,
      })

    if (walletError) {
      console.error('[v0] Error creating live main wallet:', walletError)
    }

    return NextResponse.json({
      success: true,
      accountNumber: vfdResponse.data.accountNumber,
      accountName: vfdResponse.data.accountName,
      bankName: 'VFD Microfinance Bank',
      walletId: vfdResponse.data.walletId,
    })

  } catch (error) {
    console.error('[v0] VFD wallet creation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create wallet' 
    }, { status: 500 })
  }
}
