"use server"

import { createClient } from "@/lib/supabase/server"
import { Activity, ActivityType, RelatedEntityType } from "@/lib/types/activity"

export async function getUserActivities(
  userId: string,
  mode: string,
  options?: {
    limit?: number
    offset?: number
    activityTypes?: ActivityType[]
    dateFrom?: string
    dateTo?: string
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('mode', mode)
    .order('created_at', { ascending: false })

  if (options?.activityTypes && options.activityTypes.length > 0) {
    query = query.in('activity_type', options.activityTypes)
  }

  if (options?.dateFrom) {
    query = query.gte('created_at', options.dateFrom)
  }

  if (options?.dateTo) {
    query = query.lte('created_at', options.dateTo)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[v0] Error fetching activities:', error)
    return { activities: [], total: 0, error: error.message }
  }

  return { activities: data as Activity[], total: count || data?.length || 0, error: null }
}

export async function createActivity({
  userId,
  activityType,
  amount,
  description,
  mode,
  relatedEntityId,
  relatedEntityType,
  metadata,
  receiverId,
  walletId,
}: {
  userId: string
  activityType: ActivityType
  amount: number
  description: string
  mode: string
  relatedEntityId?: string
  relatedEntityType?: RelatedEntityType
  metadata?: Record<string, any>
  receiverId?: string
  walletId?: string
}) {
  const supabase = await createClient()

  const activityData = {
    sender_id: userId,
    receiver_id: receiverId || userId,
    activity_type: activityType,
    amount,
    description,
    mode,
    status: 'completed',
    currency: 'NGN',
    type: activityType.includes('deposit') || activityType.includes('receive') || activityType.includes('contribution') ? 'deposit' : 'withdrawal',
    related_entity_id: relatedEntityId,
    related_entity_type: relatedEntityType,
    metadata: metadata || {},
    wallet_id: walletId,
    reference_number: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert(activityData)
    .select()
    .single()

  if (error) {
    console.error('[v0] Error creating activity:', error)
    return { activity: null, error: error.message }
  }

  return { activity: data as Activity, error: null }
}

export async function getActivityStats(userId: string, mode: string) {
  const supabase = await createClient()

  // Get total activities count
  const { count: totalActivities } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('mode', mode)

  // Get activities this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: thisMonth } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('mode', mode)
    .gte('created_at', startOfMonth.toISOString())

  // Get total amount sent
  const { data: sentData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('sender_id', userId)
    .eq('mode', mode)
    .in('activity_type', ['send', 'transfer', 'withdrawal', 'contribution'])

  const totalSent = sentData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0

  // Get total amount received
  const { data: receivedData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('receiver_id', userId)
    .eq('mode', mode)
    .in('activity_type', ['receive', 'deposit', 'top_up'])

  const totalReceived = receivedData?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0

  return {
    totalActivities: totalActivities || 0,
    thisMonth: thisMonth || 0,
    totalSent,
    totalReceived,
  }
}
