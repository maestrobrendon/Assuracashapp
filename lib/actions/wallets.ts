"use server"

import { supabase } from "@/lib/supabase"

export async function createBudgetWallet(data: {
  walletName: string
  budgetAmount: number
  spendLimit?: number
  lockWallet: boolean
  lockDuration?: number
  disbursementFrequency?: string
  dayOfWeek?: string
  dayOfMonth?: string
  enableRollover: boolean
  automaticAllocation: boolean
  allocationFrequency?: string
  allocationDay?: string
  allocationDayOfMonth?: string
  customNotifications: boolean
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log("[v0] createBudgetWallet - Session user ID:", session?.user?.id)

  if (!session?.user) {
    console.error("[v0] createBudgetWallet - No session found")
    return { error: "Not authenticated" }
  }

  const { data: wallet, error } = await supabase
    .from("budget_wallets")
    .insert({
      user_id: session.user.id,
      name: data.walletName,
      balance: data.budgetAmount,
      spend_limit: data.spendLimit,
      locked: data.lockWallet,
      lock_duration_days: data.lockDuration,
      disbursement_frequency: data.disbursementFrequency,
      disbursement_day: data.dayOfWeek || data.dayOfMonth,
      enable_rollover: data.enableRollover,
      automatic_allocation: data.automaticAllocation,
      allocation_frequency: data.allocationFrequency,
      allocation_day: data.allocationDay || data.allocationDayOfMonth,
      custom_notifications: data.customNotifications,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating budget wallet:", error)
    return { error: error.message }
  }

  return { data: wallet }
}

export async function createGoalWallet(data: {
  goalName: string
  targetAmount: number
  goalDeadline?: string
  fundingSource: "manual" | "auto"
  goalImage?: string
  smartReminders: boolean
  flexContributions: boolean
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log("[v0] createGoalWallet - Session user ID:", session?.user?.id)

  if (!session?.user) {
    console.error("[v0] createGoalWallet - No session found")
    return { error: "Not authenticated" }
  }

  const { data: wallet, error } = await supabase
    .from("goal_wallets")
    .insert({
      user_id: session.user.id,
      name: data.goalName,
      target_amount: data.targetAmount,
      current_amount: 0,
      deadline: data.goalDeadline,
      funding_source: data.fundingSource,
      image_url: data.goalImage,
      smart_reminders: data.smartReminders,
      flex_contributions: data.flexContributions,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating goal wallet:", error)
    return { error: error.message }
  }

  return { data: wallet }
}

export async function getBudgetWallets() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log("[v0] getBudgetWallets - Session user ID:", session?.user?.id)

  if (!session?.user) {
    console.error("[v0] getBudgetWallets - No session found")
    return { error: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from("budget_wallets")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching budget wallets:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function getGoalWallets() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log("[v0] getGoalWallets - Session user ID:", session?.user?.id)

  if (!session?.user) {
    console.error("[v0] getGoalWallets - No session found")
    return { error: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from("goal_wallets")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching goal wallets:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}
