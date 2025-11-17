"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    const getEmail = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user?.email) {
        setEmail(data.user.email)
        // If email is already confirmed, redirect to dashboard
        if (data.user.email_confirmed_at) {
          router.push('/dashboard')
        }
      }
    }
    getEmail()
  }, [])

  const handleResendEmail = async () => {
    if (!email) return
    
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      
      if (error) throw error
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Assura Cash</h1>
            <p className="mt-1 text-sm text-gray-600">Verify your email</p>
          </div>
        </div>

        <Card className="border border-gray-200/80 shadow-sm bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardContent className="pt-8 px-6 pb-8 sm:px-8">
            <div className="text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                <p className="text-gray-600">
                  We've sent a confirmation link to
                </p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-left">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-blue-900">
                      <p className="font-medium">Click the link in the email to verify your account</p>
                      <p className="text-blue-700">The link will expire in 24 hours</p>
                    </div>
                  </div>
                </div>

                {resent && (
                  <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-900 font-medium">Email sent! Check your inbox</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <p className="text-sm text-gray-600">Didn't receive the email?</p>
                  <Button
                    onClick={handleResendEmail}
                    disabled={resending}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold"
                  >
                    {resending ? "Sending..." : "Resend confirmation email"}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-400">
          Making <span className="font-semibold text-gray-600">Budgeting</span> sexy since 2025
        </p>
      </div>
    </div>
  )
}
