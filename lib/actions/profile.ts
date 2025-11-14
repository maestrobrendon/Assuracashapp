"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone, username")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("[v0] Error fetching profile:", error)
    return { error: error.message, data: null }
  }

  return { data: profile }
}
