"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Wallet } from "lucide-react"

export default function SignupPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)

    try {
      // Store phone number in session storage for next step
      sessionStorage.setItem("signup_phone", phoneNumber)
      router.push("/auth/verify-phone")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Welcome message (hidden on mobile) */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-12 lg:flex">
        <div className="max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Assura Cash</h2>
              <p className="text-sm text-muted-foreground">Smart Money Management</p>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Welcome
              <br />
              to Assura Cash!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Save money, invest securely, and manage your finances with ease. Join thousands of users building wealth
              today.
            </p>
          </div>
          <div className="h-1 w-16 rounded-full bg-blue-600" />
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-right">
            <span className="text-sm text-muted-foreground">Already have an account?</span>{" "}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:underline">
              Login
            </Link>
          </div>

          <Card className="border-none shadow-none">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Setup a Profile</CardTitle>
              <CardDescription>Just enter your phone number to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContinue} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 rounded-lg border bg-muted px-3">
                      <span className="text-2xl">🇳🇬</span>
                      <span className="text-sm font-medium">+234</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="flex-1"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
                    I agree to Assura Cash's{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </Link>
                    ,{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/cookies" className="text-blue-600 hover:underline">
                      Cookies Policy
                    </Link>
                  </label>
                </div>

                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
