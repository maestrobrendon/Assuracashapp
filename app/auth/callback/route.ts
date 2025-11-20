import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("[v0] Session exchange failed:", sessionError)
      return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
    }

    // CRITICAL: Initialize demo data for new users
    if (data?.user) {
      try {
        console.log("[v0] Checking demo data for user:", data.user.id)

        // We removed the check for existing wallet so this runs every time to fill in any missing pieces
        const { error: rpcError } = await supabase.rpc("create_demo_data_for_user", {
          new_user_id: data.user.id,
        })

        if (rpcError) {
          console.error("[v0] Demo data creation failed:", rpcError.message, rpcError.details)
        } else {
          console.log("[v0] ✅ Demo data check/creation completed successfully for user:", data.user.id)
        }
      } catch (err) {
        console.error("[v0] Unexpected error in demo data creation:", err)
      }
    } else {
      console.error("[v0] No user data after session exchange")
    }
  } else {
    console.error("[v0] No code parameter in callback URL")
  }

  // Always redirect to dashboard
  return NextResponse.redirect(new URL("/", request.url))
}
