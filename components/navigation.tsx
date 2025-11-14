"use client"

import { Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export function Navigation() {
  const pathname = usePathname()
  const [userInitials, setUserInitials] = useState("U")

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

        if (profile?.full_name) {
          const names = profile.full_name.split(" ")
          const initials = names
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          setUserInitials(initials)
        }
      }
    }
    loadUser()
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <Link href="/">
              <h1 className="text-2xl font-bold text-foreground">Assura Cash</h1>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/wallets"
              className={`text-sm font-medium transition-colors ${
                isActive("/wallets") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wallets
            </Link>
            <Link
              href="/circles"
              className={`text-sm font-medium transition-colors ${
                isActive("/circles") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Circles
            </Link>
            <Link
              href="/analytics"
              className={`text-sm font-medium transition-colors ${
                isActive("/analytics") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Analytics
            </Link>
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
