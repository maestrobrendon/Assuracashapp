"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase"

export function ThemeSync() {
  const { setTheme } = useTheme()

  useEffect(() => {
    loadThemePreference()

    // Subscribe to theme changes in the database
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
        },
        (payload: any) => {
          if (payload.new?.dark_mode_enabled !== undefined) {
            setTheme(payload.new.dark_mode_enabled ? 'dark' : 'light')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [setTheme])

  async function loadThemePreference() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("user_settings")
        .select("dark_mode_enabled")
        .eq("user_id", user.id)
        .single()

      if (data?.dark_mode_enabled !== undefined) {
        setTheme(data.dark_mode_enabled ? 'dark' : 'light')
      }
    } catch (error) {
      console.error("[v0] Error loading theme preference:", error)
    }
  }

  return null
}
