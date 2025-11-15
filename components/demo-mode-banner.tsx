"use client"

import { useState } from "react"
import { useAccountMode } from "@/lib/hooks/use-account-mode"
import { Button } from "@/components/ui/button"
import { X, Gamepad2 } from 'lucide-react'
import Link from "next/link"

export function DemoModeBanner() {
  const { accountMode } = useAccountMode()
  const [isDismissed, setIsDismissed] = useState(false)

  if (accountMode === 'live' || isDismissed) {
    return null
  }

  return (
    <div className="relative bg-gradient-to-r from-orange-500/10 to-orange-400/10 border border-orange-500/20 rounded-lg p-4 mb-6">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-start gap-3 pr-8">
        <div className="rounded-full bg-orange-500/20 p-2 flex-shrink-0">
          <Gamepad2 className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
            You're in Demo Mode - No real money at risk
          </p>
          <p className="text-sm text-orange-800 dark:text-orange-200">
            Practice with fake money and explore all features risk-free.{" "}
            <Link href="/profile" className="underline font-medium hover:text-orange-900">
              Switch to Live Mode
            </Link>{" "}
            when you're ready for real transactions.
          </p>
        </div>
      </div>
    </div>
  )
}
