"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, ArrowLeft, Check } from "lucide-react"

export default function SetupProfilePage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const phone = sessionStorage.getItem("signup_phone")
    const verified = sessionStorage.getItem("phone_verified")

    if (!phone || !verified) {
      router.push("/auth/signup")
      return
    }
    setPhoneNumber(phone)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phoneNumber,
          },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (authData.user) {
        // Clear session storage
        sessionStorage.removeItem("signup_phone")
        sessionStorage.removeItem("phone_verified")

        // Show success message
        setError("Account created! Please check your email to verify your account before logging in.")

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left sidebar - Progress indicator */}
      <div className="hidden w-80 bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:block">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <span className="font-semibold">Assura Cash</span>
        </div>

        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-bold">Setup a Profile</h2>
          <p className="text-sm text-muted-foreground">Follow the steps below to get started with us</p>

          <div className="space-y-6">
            {/* Steps 1 & 2 - Completed */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">STEP 1 & 2</p>
                <p className="text-sm text-muted-foreground">Phone Verification</p>
              </div>
            </div>

            {/* Step 3 - Active */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                <span className="font-semibold text-white">3</span>
              </div>
              <div>
                <p className="font-semibold">STEP 3</p>
                <p className="text-sm text-muted-foreground">Profile Details</p>
              </div>
            </div>

            {/* Step 4 - Active */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                <span className="font-semibold text-white">4</span>
              </div>
              <div>
                <p className="font-semibold">STEP 4</p>
                <p className="text-sm text-muted-foreground">Setup Password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Profile setup form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Already have an account?</span>{" "}
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
                Login
              </Link>
            </div>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Let's get started 🎉</CardTitle>
              <CardDescription>Register to start saving and investing with Assura Cash today!</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">First & Last Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Enter a referral code (optional)</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="e.g 08123456789"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>

                {error && (
                  <div
                    className={`rounded-lg p-3 text-sm ${error.includes("check your email") ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"}`}
                  >
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create a Free Account"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    This form is encrypted{" "}
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-xs">
                      ✓
                    </span>
                  </span>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
