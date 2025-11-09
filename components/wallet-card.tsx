"use client"

import { Lock, LockOpen, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatNaira, getDaysUntilUnlock } from "@/lib/mock-data"
import type { Wallet } from "@/lib/types"

interface WalletCardProps {
  wallet: Wallet
  onClick?: () => void
}

export function WalletCard({ wallet, onClick }: WalletCardProps) {
  const isLocked = wallet.lockStatus === "locked"
  const progress = wallet.targetAmount ? (wallet.balance / wallet.targetAmount) * 100 : 100
  const remaining = wallet.targetAmount ? wallet.targetAmount - wallet.balance : 0
  const daysUntilUnlock = wallet.lockUntil ? getDaysUntilUnlock(wallet.lockUntil) : 0

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border/50 bg-card shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header with name and status badge */}
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-muted-foreground">{wallet.name}</h3>
          {isLocked ? (
            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
              <Lock className="mr-1 h-3 w-3" />
              Locked {daysUntilUnlock > 0 ? `${daysUntilUnlock}d` : ""}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              <LockOpen className="mr-1 h-3 w-3" />
              Available
            </Badge>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <p className="text-4xl font-bold text-foreground">{formatNaira(wallet.balance).replace(".00", "")}</p>
          {wallet.type === "goal" && wallet.targetAmount && (
            <div className="mt-2 flex items-center gap-2">
              <div className="rounded-full bg-success/10 px-3 py-1">
                <span className="text-sm font-medium text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />+{Math.round(progress)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Balance info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {wallet.targetAmount
              ? `You have ${formatNaira(remaining)} left`
              : `Balance: ${formatNaira(wallet.balance)}`}
          </span>
          {wallet.targetAmount && <span>{formatNaira(wallet.targetAmount)}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
