// Core type definitions for Assura Cash wallet system

export type WalletType = "main" | "budget" | "goal"
export type LockStatus = "locked" | "unlocked"
export type TransactionType = "credit" | "debit" | "transfer"
export type CircleRole = "admin" | "moderator" | "member"

export interface Wallet {
  id: string
  name: string
  type: WalletType
  balance: number
  lockStatus: LockStatus
  lockUntil?: Date
  createdAt: Date
  color?: string
  icon?: string
  targetAmount?: number // For goals
  contributionSchedule?: "daily" | "weekly" | "monthly" // For budgets
}

export interface Transaction {
  id: string
  walletId: string
  type: TransactionType
  amount: number
  description: string
  timestamp: Date
  fromWallet?: string
  toWallet?: string
  recipientName?: string
  status: "pending" | "completed" | "failed"
}

export interface Circle {
  id: string
  name: string
  description: string
  purpose: string
  balance: number
  targetAmount?: number
  deadline?: Date
  memberCount: number
  members?: CircleMember[]
  adminId: string
  isPublic: boolean
  createdAt: Date
  category?: string
  allowExternalContributions?: boolean
  externalLinkId?: string
  privacySettings?: {
    showMemberNames: boolean
    showIndividualContributions: boolean
  }
  recurringContribution?: {
    amount: number
    frequency: "daily" | "weekly" | "monthly"
  }
}

export interface CircleMember {
  id: string
  circleId?: string
  userId: string
  userName?: string
  name: string
  username: string
  avatar?: string
  role: CircleRole
  totalContributed: number
  joinedAt: Date
}

export interface CircleTransaction {
  id: string
  circleId: string
  type: "contribution" | "withdrawal" | "external"
  amount: number
  from?: string
  fromName?: string
  to?: string
  toName?: string
  note?: string
  timestamp: Date
  receiptUrl?: string
}

export interface CirclePost {
  id: string
  circleId: string
  authorId: string
  authorName: string
  authorRole: CircleRole
  content: string
  imageUrl?: string
  timestamp: Date
  reactions: { emoji: string; count: number; users: string[] }[]
}

export interface FavoriteContact {
  id: string
  name: string
  username: string
  initials: string
  avatar: string | null
}

export interface PendingRequest {
  id: string
  from: string
  username: string
  amount: number
  reason: string
  expiresAt: Date
  avatar: string
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  username: string
  avatar?: string
}
