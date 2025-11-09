// Mock data for development
import type { Wallet, Transaction, Circle, User } from "./types"

export const mockUser: User = {
  id: "user-1",
  name: "Adebayo Okonkwo",
  email: "adebayo@example.com",
  phone: "+234 812 345 6789",
  username: "@adebayo",
  avatar: "/placeholder-user.jpg",
}

export const mockWallets: Wallet[] = [
  {
    id: "wallet-main",
    name: "Main Wallet",
    type: "main",
    balance: 145750.5,
    lockStatus: "unlocked",
    createdAt: new Date("2024-01-01"),
    color: "emerald",
    icon: "wallet",
  },
  {
    id: "wallet-1",
    name: "Rent Money",
    type: "budget",
    balance: 350000,
    lockStatus: "locked",
    lockUntil: new Date("2025-02-01"),
    createdAt: new Date("2025-01-01"),
    contributionSchedule: "monthly",
    color: "blue",
    icon: "home",
  },
  {
    id: "wallet-2",
    name: "Groceries",
    type: "budget",
    balance: 45000,
    lockStatus: "unlocked",
    createdAt: new Date("2025-01-05"),
    contributionSchedule: "weekly",
    color: "orange",
    icon: "shopping-cart",
  },
  {
    id: "wallet-3",
    name: "Emergency Fund",
    type: "goal",
    balance: 280000,
    targetAmount: 500000,
    lockStatus: "locked",
    lockUntil: new Date("2025-12-31"),
    createdAt: new Date("2024-06-01"),
    color: "red",
    icon: "shield",
  },
  {
    id: "wallet-4",
    name: "School Fees",
    type: "goal",
    balance: 180000,
    targetAmount: 450000,
    lockStatus: "locked",
    lockUntil: new Date("2025-09-01"),
    createdAt: new Date("2024-09-01"),
    color: "indigo",
    icon: "graduation-cap",
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    walletId: "wallet-main",
    type: "credit",
    amount: 50000,
    description: "Salary Payment",
    timestamp: new Date("2025-01-15"),
    status: "completed",
  },
  {
    id: "tx-2",
    walletId: "wallet-main",
    type: "debit",
    amount: 15000,
    description: "Transfer to Rent Money",
    timestamp: new Date("2025-01-14"),
    toWallet: "wallet-1",
    status: "completed",
  },
  {
    id: "tx-3",
    walletId: "wallet-main",
    type: "credit",
    amount: 8500,
    description: "Payment from @chioma",
    timestamp: new Date("2025-01-13"),
    status: "completed",
  },
  {
    id: "tx-4",
    walletId: "wallet-main",
    type: "debit",
    amount: 25000,
    description: "Bank Transfer to GTBank",
    timestamp: new Date("2025-01-12"),
    status: "completed",
  },
  {
    id: "tx-5",
    walletId: "wallet-main",
    type: "credit",
    amount: 12000,
    description: "Refund from Jumia",
    timestamp: new Date("2025-01-11"),
    status: "completed",
  },
]

export const mockCircles: Circle[] = [
  {
    id: "circle-1",
    name: "Flatmates Rent Fund",
    description: "Monthly rent contribution for our 3-bedroom apartment",
    balance: 850000,
    targetAmount: 900000,
    memberCount: 3,
    adminId: "user-1",
    isPublic: false,
    createdAt: new Date("2024-08-01"),
    purpose: "Rent Split",
  },
  {
    id: "circle-2",
    name: "Wedding Ajo - Feb 2025",
    description: "Monthly savings group for Kemi's wedding",
    balance: 1250000,
    targetAmount: 2000000,
    memberCount: 8,
    adminId: "user-5",
    isPublic: false,
    createdAt: new Date("2024-10-01"),
    purpose: "Ajo/Esusu",
  },
  {
    id: "circle-3",
    name: "Family Vacation Pool",
    description: "Saving together for December holiday in Dubai",
    balance: 420000,
    targetAmount: 1500000,
    memberCount: 5,
    adminId: "user-1",
    isPublic: false,
    createdAt: new Date("2024-11-01"),
    purpose: "Group Savings",
  },
]

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace("NGN", "₦")
}

export const getDaysUntilUnlock = (unlockDate: Date): number => {
  const now = new Date()
  const diff = unlockDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
