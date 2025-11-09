// Core type definitions for Assura Cash wallet system

export type WalletType = "main" | "budget" | "goal"
export type LockStatus = "locked" | "unlocked"
export type TransactionType = "credit" | "debit" | "transfer"
export type CircleRole = "admin" | "contributor" | "viewer"

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
  balance: number
  targetAmount?: number
  memberCount: number
  adminId: string
  isPublic: boolean
  createdAt: Date
  purpose: string
}

export interface CircleMember {
  id: string
  circleId: string
  userId: string
  userName: string
  role: CircleRole
  totalContributed: number
  joinedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  username: string
  avatar?: string
}
