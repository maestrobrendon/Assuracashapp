"use server"

import { createClient } from "@/lib/supabase/server"

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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: wallet, error } = await supabase
    .from("budget_wallets")
    .insert({
      user_id: user.id,
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: wallet, error } = await supabase
    .from("goal_wallets")
    .insert({
      user_id: user.id,
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from("budget_wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching budget wallets:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function getGoalWallets() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from("goal_wallets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching goal wallets:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function transferMoney(data: {
  fromWalletId: string
  fromWalletType: "main" | "budget" | "goal"
  toWalletId: string
  toWalletType: "main" | "budget" | "goal"
  amount: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Get from wallet to check balance
    const fromTableName = 
      data.fromWalletType === "main" ? "main_wallets" :
      data.fromWalletType === "budget" ? "budget_wallets" : "goal_wallets"
    
    const { data: fromWallet, error: fromError } = await supabase
      .from(fromTableName)
      .select("balance, name")
      .eq("id", data.fromWalletId)
      .single()

    if (fromError || !fromWallet) {
      return { error: "Source wallet not found" }
    }

    const currentBalance = Number(fromWallet.balance) || 0
    
    if (currentBalance < data.amount) {
      return { error: "Insufficient balance" }
    }

    // Get to wallet name
    const toTableName = 
      data.toWalletType === "main" ? "main_wallets" :
      data.toWalletType === "budget" ? "budget_wallets" : "goal_wallets"
    
    const { data: toWallet, error: toError } = await supabase
      .from(toTableName)
      .select("balance, name")
      .eq("id", data.toWalletId)
      .single()

    if (toError || !toWallet) {
      return { error: "Destination wallet not found" }
    }

    const toBalance = Number(toWallet.balance) || 0

    // Update from wallet (deduct)
    const { error: updateFromError } = await supabase
      .from(fromTableName)
      .update({ balance: currentBalance - data.amount })
      .eq("id", data.fromWalletId)

    if (updateFromError) {
      console.error("[v0] Error updating from wallet:", updateFromError)
      return { error: "Failed to deduct from source wallet" }
    }

    // Update to wallet (add)
    const { error: updateToError } = await supabase
      .from(toTableName)
      .update({ balance: toBalance + data.amount })
      .eq("id", data.toWalletId)

    if (updateToError) {
      console.error("[v0] Error updating to wallet:", updateToError)
      // Rollback from wallet
      await supabase
        .from(fromTableName)
        .update({ balance: currentBalance })
        .eq("id", data.fromWalletId)
      return { error: "Failed to add to destination wallet" }
    }

    // Create transaction record for the transfer
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        sender_id: user.id,
        receiver_id: user.id, // Same user, different wallets
        amount: data.amount,
        currency: "NGN",
        type: "transfer",
        description: `Transfer from ${fromWallet.name} to ${toWallet.name}`,
        status: "completed",
        reference_number: `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      })

    if (transactionError) {
      console.error("[v0] Error creating transaction:", transactionError)
      // Don't rollback the transfer, just log the error
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Transfer error:", error)
    return { error: error.message || "Transfer failed" }
  }
}
