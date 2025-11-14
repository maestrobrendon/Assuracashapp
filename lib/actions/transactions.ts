'use server'

import { supabase } from '@/lib/supabase'

function generateReferenceNumber(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TXN${timestamp}${random}`
}

export async function createTransaction(data: {
  userId: string
  amount: number
  type: string
  description: string
  walletId?: string
  receiverId?: string
  status?: string
}) {
  try {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        sender_id: data.userId,
        receiver_id: data.receiverId || null,
        amount: data.amount,
        currency: 'NGN',
        type: data.type,
        description: data.description,
        status: data.status || 'completed',
        reference_number: generateReferenceNumber(),
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data: transaction }
  } catch (error: any) {
    console.error('[v0] Error creating transaction:', error)
    return { success: false, error: error.message }
  }
}

export async function getUserTransactions(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('[v0] Error fetching transactions:', error)
    return { success: false, error: error.message, data: [] }
  }
}
