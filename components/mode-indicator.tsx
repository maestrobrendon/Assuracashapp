"use client"

import { useAccountMode } from "@/lib/hooks/use-account-mode"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Banknote } from 'lucide-react'

export function ModeIndicator() {
  const { accountMode, isLoading } = useAccountMode()

  if (isLoading) {
    return null
  }

  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1.5 px-2.5 py-1 ${
        accountMode === 'demo'
          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      }`}
    >
      {accountMode === 'demo' ? (
        <>
          <Gamepad2 className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">Demo</span>
        </>
      ) : (
        <>
          <Banknote className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">Live</span>
        </>
      )}
    </Badge>
  )
}
