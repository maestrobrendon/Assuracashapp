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
            console.log("[v0] Theme changed via database:", payload.new.dark_mode_enabled)
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.log("[v0] No user session, using light theme")
        setTheme('light')
        return
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("dark_mode_enabled")
        .eq("user_id", session.user.id)
        .single()

      if (error) {
        console.log("[v0] No user settings found, defaulting to light theme")
        setTheme('light')
        return
      }

      const theme = data?.dark_mode_enabled === true ? 'dark' : 'light'
      console.log("[v0] Loading theme preference:", theme, "from dark_mode_enabled:", data?.dark_mode_enabled)
      setTheme(theme)
    } catch (error) {
      console.error("[v0] Error loading theme preference:", error)
      setTheme('light')
    }
  }

  return null
}
