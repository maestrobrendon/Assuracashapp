export type ActivityType =
  | 'transfer'
  | 'deposit'
  | 'withdrawal'
  | 'contribution'
  | 'wallet_created'
  | 'wallet_funded'
  | 'wallet_withdrawal'
  | 'circle_created'
  | 'circle_joined'
  | 'circle_contribution'
  | 'circle_withdrawal'
  | 'budget_created'
  | 'budget_funded'
  | 'budget_disbursement'
  | 'goal_created'
  | 'goal_contribution'
  | 'goal_completed'
  | 'send'
  | 'receive'
  | 'top_up'
  | 'request_sent'
  | 'request_received'

export type RelatedEntityType =
  | 'budget_wallet'
  | 'goal_wallet'
  | 'circle'
  | 'user'
  | 'main_wallet'

export interface Activity {
  id: string
  user_id: string
  activity_type: ActivityType
  amount: number
  currency: string
  description: string
  status: string
  created_at: string
  related_entity_id?: string
  related_entity_type?: RelatedEntityType
  metadata?: Record<string, any>
  sender_id?: string
  receiver_id?: string
  reference_number?: string
}

export interface ActivityFilters {
  type?: ActivityType[]
  dateRange?: {
    from: Date
    to: Date
  }
  searchQuery?: string
  entityType?: RelatedEntityType[]
}
