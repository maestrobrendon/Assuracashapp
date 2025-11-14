"use server"

import { supabase } from "@/lib/supabase"

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
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log("[v0] createCircle - Session user ID:", session?.user?.id)

  if (!session?.user) {
    console.error("[v0] createCircle - No session found")
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
      created_by: session.user.id,
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
    user_id: session.user.id,
    role: "admin",
  })

  if (memberError) {
    console.error("[v0] Error adding circle admin:", memberError)
    return { error: memberError.message }
  }

  return { data: circle }
}

export async function getUserCircles() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log("[v0] getUserCircles - Session user ID:", session?.user?.id)

  if (!session?.user) {
    console.error("[v0] getUserCircles - No session found")
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
    .eq("user_id", session.user.id)

  if (error) {
    console.error("[v0] Error fetching user circles:", error)
    return { error: error.message, data: [] }
  }

  const circles = data?.map((item: any) => ({
    ...item.circles,
    role: item.role,
  }))

  return { data: circles || [] }
}

export async function getPublicCircles() {
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
