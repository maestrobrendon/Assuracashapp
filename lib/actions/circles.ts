"use server"

import { createClient } from "@/lib/supabase/server"

export async function createCircle(data: {
  circleName: string
  description?: string
  category?: string
  targetAmount?: number
  deadline?: Date
  isPublic: boolean
  allowExternal: boolean
  showMemberNames: boolean
  showContributions: boolean
  recurringAmount?: number
  recurringFrequency?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: circle, error } = await supabase
    .from("circles")
    .insert({
      name: data.circleName,
      description: data.description,
      category: data.category,
      target_amount: data.targetAmount,
      visibility: data.isPublic ? "public" : "private",
      allow_external_contributions: data.allowExternal,
      created_by: user.id,
      purpose: data.description || "",
      current_balance: 0,
      member_count: 1,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating circle:", error)
    return { error: error.message }
  }

  const { error: memberError } = await supabase.from("circle_members").insert({
    circle_id: circle.id,
    user_id: user.id,
    role: "admin",
  })

  if (memberError) {
    console.error("[v0] Error adding circle admin:", memberError)
    return { error: memberError.message }
  }

  return { data: circle }
}

export async function getUserCircles() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] getUserCircles - User:", user?.id)

  if (!user) {
    return { error: "Not authenticated", data: [] }
  }

  const { data, error } = await supabase
    .from("circle_members")
    .select(`
      role,
      circles (
        *
      )
    `)
    .eq("user_id", user.id)

  console.log("[v0] getUserCircles - Raw data:", data)
  console.log("[v0] getUserCircles - Error:", error)

  if (error) {
    console.error("[v0] Error fetching user circles:", error)
    return { error: error.message, data: [] }
  }

  const circles = data?.map((item: any) => ({
    ...item.circles,
    role: item.role,
  }))

  console.log("[v0] getUserCircles - Formatted circles:", circles)

  return { data: circles || [] }
}

export async function getPublicCircles() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("circles")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("[v0] Error fetching public circles:", error)
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function getCircleById(circleId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: circle, error: circleError } = await supabase
    .from("circles")
    .select("*")
    .eq("id", circleId)
    .single()

  if (circleError || !circle) {
    console.error("[v0] Error fetching circle:", circleError)
    return { error: circleError?.message || "Circle not found" }
  }

  const { data: membership } = await supabase
    .from("circle_members")
    .select("role, total_contributed")
    .eq("circle_id", circleId)
    .eq("user_id", user.id)
    .single()

  const { data: members } = await supabase
    .from("circle_members")
    .select("id, user_id, role, total_contributed, joined_at")
    .eq("circle_id", circleId)
    .order("total_contributed", { ascending: false })

  const { data: transactions } = await supabase
    .from("circle_transactions")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(50)

  return {
    data: {
      ...circle,
      role: membership?.role || "member",
      userContribution: membership?.total_contributed || 0,
      members: members || [],
      transactions: transactions || [],
    },
  }
}

export async function contributeToCircle(circleId: string, amount: number, description?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data: mainWallet } = await supabase.from("main_wallets").select("balance").eq("user_id", user.id).single()

  if (!mainWallet || mainWallet.balance < amount) {
    return { error: "Insufficient balance in main wallet" }
  }

  const { data: circle } = await supabase.from("circles").select("current_balance").eq("id", circleId).single()

  if (!circle) {
    return { error: "Circle not found" }
  }

  const { error: walletError } = await supabase
    .from("main_wallets")
    .update({ balance: mainWallet.balance - amount, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)

  if (walletError) {
    console.error("[v0] Error updating main wallet:", walletError)
    return { error: "Failed to deduct from wallet" }
  }

  const { error: circleError } = await supabase
    .from("circles")
    .update({
      current_balance: circle.current_balance + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", circleId)

  if (circleError) {
    console.error("[v0] Error updating circle balance:", circleError)
    // Rollback wallet
    await supabase
      .from("main_wallets")
      .update({ balance: mainWallet.balance })
      .eq("user_id", user.id)
    return { error: "Failed to update circle balance" }
  }

  const { error: txError } = await supabase.from("circle_transactions").insert({
    circle_id: circleId,
    user_id: user.id,
    type: "contribution",
    amount: amount,
    description: description || "Contribution to circle",
    status: "completed",
    currency: "NGN",
  })

  if (txError) {
    console.error("[v0] Error creating transaction:", txError)
  }

  const { data: member } = await supabase
    .from("circle_members")
    .select("total_contributed")
    .eq("circle_id", circleId)
    .eq("user_id", user.id)
    .single()

  if (member) {
    await supabase
      .from("circle_members")
      .update({ total_contributed: (member.total_contributed || 0) + amount })
      .eq("circle_id", circleId)
      .eq("user_id", user.id)
  }

  await supabase.from("transactions").insert({
    sender_id: user.id,
    type: "transfer",
    amount: amount,
    description: `Contributed to ${description || "circle"}`,
    status: "completed",
    currency: "NGN",
  })

  return { success: true }
}
