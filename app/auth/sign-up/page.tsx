"use client"

import type React from "react"

import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { Wallet, Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      
      router.push('/auth/verify-email')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 sm:mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 sm:h-20 sm:w-20">
            <Wallet className="h-8 w-8 text-white sm:h-10 sm:w-10" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Assura Cash</h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">Create your account</p>
          </div>
        </div>

        <Card className="border border-gray-200/80 shadow-sm bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-8 px-6 sm:px-8">
            <CardTitle className="text-2xl font-semibold text-gray-900 sm:text-3xl">Get Started</CardTitle>
            <CardDescription className="text-sm text-gray-600 sm:text-base">
              Start with ₦500,000 demo money
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 sm:px-8">
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl border-gray-300 bg-white px-4 text-base transition-all focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-gray-300 bg-white px-4 text-base transition-all focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-gray-300 bg-white px-4 pr-12 text-base transition-all focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 rounded-xl border-gray-300 bg-white px-4 pr-12 text-base transition-all focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-base shadow-lg shadow-orange-500/30 transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center leading-relaxed pt-2">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-700 font-medium">
                    Terms
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-700 font-medium">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              href="/auth/login" 
              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Making <span className="font-semibold text-gray-600">Budgeting</span> sexy since 2025
        </p>
      </div>
    </div>
  )
}
