"use client"

import {
  Home,
  Wallet,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Circles", href: "/circles", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
]

const bottomNavigation = [
  { name: "Settings", href: "/profile", icon: Settings },
  { name: "Support", href: "/support", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsUserMenuOpen(false)
      setIsMobileMenuOpen(false)
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background border-b border-border px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
            <Shield className="h-5 w-5 text-background" />
          </div>
          <h1 className="text-base font-semibold text-foreground">Assura Cash</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="h-9 w-9">
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-background border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground">
                <Shield className="h-6 w-6 text-background" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">Assura Cash</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm font-medium text-muted-foreground mb-3 px-1">Main Menu</p>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            <div className="py-3" />

            {bottomNavigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-4 mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-5 dark:from-blue-900/30 dark:to-blue-800/30">
            <h3 className="text-lg font-semibold text-foreground mb-2">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mb-4">Unlock advanced features and unlimited transactions.</p>
            <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium rounded-xl h-11">
              Upgrade now
            </Button>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-all hover:bg-muted/50"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">James Doe</p>
                <p className="text-xs text-muted-foreground truncate">james.doe@email.com</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
