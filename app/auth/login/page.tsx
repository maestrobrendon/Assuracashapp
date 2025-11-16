"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Lock, Eye, EyeOff, Mail, Phone } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email: loginMethod === "email" ? email : `${phoneNumber}@assura.app`,
        password,
      })

      if (signInError) throw signInError

      console.log("[v0] Login successful, user ID:", data.user?.id)

      // SUCCESS - Redirect to dashboard
      window.location.href = '/dashboard'
      
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Assura Cash</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Africa's First<br />
            Spending Operating<br />
            System
          </h1>
          <p className="text-xl text-orange-100 max-w-md">
            Take control of your finances with intelligent budgeting, goal tracking, and group savings.
          </p>
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2 text-white">
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <span className="text-sm">Demo Mode</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <span className="text-sm">Live Transactions</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <div className="h-2 w-2 rounded-full bg-white"></div>
              <span className="text-sm">Virtual Accounts</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-orange-100">
          Making <span className="font-semibold">Budgeting</span> sexy since 2025
        </p>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 pb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Assura Cash</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <Tabs 
                value={loginMethod} 
                onValueChange={(v) => setLoginMethod(v as "phone" | "email")} 
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger 
                    value="email"
                    className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger 
                    value="phone"
                    className="data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleLogin} className="space-y-5">
                {loginMethod === "phone" ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
                        <span className="text-xl">🇳🇬</span>
                        <span className="text-sm text-gray-600 font-medium">+234</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="801 234 5678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">Don't have an account?</p>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold h-11" 
              asChild
            >
              <Link href="/auth/sign-up">
                Create Free Account
              </Link>
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500 pt-4">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
