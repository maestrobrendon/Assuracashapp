"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wallet } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-2xl">
          <Wallet className="h-10 w-10 text-blue-600" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Assura Cash</h1>
          <p className="text-sm text-blue-100">Smart Money Management</p>
        </div>
        <div className="mt-8">
          <div className="h-1 w-24 animate-pulse rounded-full bg-white/30">
            <div className="h-full w-3/4 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-white" />
          </div>
          <p className="mt-2 text-center text-xs text-blue-200">Initializing</p>
        </div>
      </div>
    </div>
  )
}
