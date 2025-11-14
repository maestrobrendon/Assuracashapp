"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Lock } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // For phone login, we'll use email/password for now as Supabase phone auth requires additional setup
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email: loginMethod === "email" ? email : `${phoneNumber}@assura.app`,
        password,
      })

      if (signInError) throw signInError

      console.log("[v0] Login successful, user ID:", data.user?.id)
      console.log("[v0] Session:", data.session)

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify session is established
      const {
        data: { session },
      } = await supabase.auth.getSession()
      console.log("[v0] Verified session after login:", session?.user?.id)

      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user?.id).single()

      if (!profile) {
        router.push("/auth/setup-profile")
      } else {
        router.push("/")
      }
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Log In to Assura Cash</CardTitle>
              <CardDescription>Access your account securely</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "phone" | "email")} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone">Phone Number</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginMethod === "phone" ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 rounded-lg border bg-muted px-3">
                      <span className="text-2xl">🇳🇬</span>
                      <span className="text-sm">+234</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Next"}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                  Lost your phone? Lock your Account 🔒
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" size="lg" className="w-full bg-blue-700/20 text-white hover:bg-blue-700/30" asChild>
            <Link href="/auth/signup">
              New to Assura Cash? <span className="ml-1 font-semibold">Sign Up</span>
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-white/60">
          Making <span className="font-semibold">Budgeting</span> sexy <span className="font-semibold">2025 </span>.
        </p>
      </div>
    </div>
  )
}
