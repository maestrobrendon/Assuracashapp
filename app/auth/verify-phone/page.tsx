"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Wallet, ArrowLeft, Check } from "lucide-react"

export default function VerifyPhonePage() {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    const phone = sessionStorage.getItem("signup_phone")
    if (!phone) {
      router.push("/auth/signup")
      return
    }
    setPhoneNumber(phone)
    inputRefs.current[0]?.focus()
  }, [router])

  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join("")
    if (verificationCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate verification (in production, verify with Supabase OTP)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Store verification status
      sessionStorage.setItem("phone_verified", "true")

      // Move to profile setup
      router.push("/auth/setup-profile")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    if (countdown > 0) return

    setCode(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
    setCountdown(60)
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
            {/* Step 1 - Completed */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">STEP 1</p>
                <p className="text-sm text-muted-foreground">Phone Number</p>
              </div>
            </div>

            {/* Step 2 - Active */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                <span className="font-semibold text-white">2</span>
              </div>
              <div>
                <p className="font-semibold">STEP 2</p>
                <p className="text-sm text-muted-foreground">Verification</p>
              </div>
            </div>

            {/* Step 3 - Pending */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                <span className="font-semibold text-gray-400">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-400">STEP 3</p>
                <p className="text-sm text-muted-foreground">Profile Details</p>
              </div>
            </div>

            {/* Step 4 - Pending */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                <span className="font-semibold text-gray-400">4</span>
              </div>
              <div>
                <p className="font-semibold text-gray-400">STEP 4</p>
                <p className="text-sm text-muted-foreground">Setup Password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Verification form */}
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
              <CardTitle className="text-2xl">Verify Your Phone Number</CardTitle>
              <CardDescription>
                We've just sent you a 6 digit code via SMS. Check your messages and enter it here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-14 w-14 text-center text-xl font-semibold"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  ℹ️
                </span>
                <span className="text-muted-foreground">Didn't get the code?</span>
                <button
                  onClick={handleResend}
                  disabled={countdown > 0}
                  className={`font-semibold ${
                    countdown > 0 ? "cursor-not-allowed text-gray-400" : "text-blue-600 hover:underline"
                  }`}
                >
                  {countdown > 0 ? `Resend [${formatCountdown(countdown)}]` : "Resend"}
                </button>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>
              )}

              <Button onClick={handleVerify} className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
