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
