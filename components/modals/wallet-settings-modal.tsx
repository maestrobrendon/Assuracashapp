"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Lock, Unlock, DollarSign, RefreshCw, Bell } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { updateWalletSettings } from "@/lib/actions/wallets"

interface WalletSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallet: {
    id: string
    name: string
    type: "budget" | "goal"
    locked?: boolean
    isLocked?: boolean
    spendLimit?: number
    enableRollover?: boolean
    customNotifications?: boolean
    lockDurationDays?: number
  }
  onUpdate?: () => void
}

export function WalletSettingsModal({ open, onOpenChange, wallet, onUpdate }: WalletSettingsModalProps) {
  const [isLocked, setIsLocked] = useState(wallet.locked || wallet.isLocked || false)
  const [lockDuration, setLockDuration] = useState(wallet.lockDurationDays?.toString() || "")
  const [spendLimit, setSpendLimit] = useState(wallet.spendLimit?.toString() || "")
  const [enableRollover, setEnableRollover] = useState(wallet.enableRollover || false)
  const [customNotifications, setCustomNotifications] = useState(wallet.customNotifications || false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsProcessing(true)

    try {
      const settings: any = {
        locked: isLocked,
      }

      if (isLocked && lockDuration) {
        settings.lockDuration = Number.parseInt(lockDuration)
      }

      if (wallet.type === "budget") {
        if (spendLimit) settings.spendLimit = Number.parseFloat(spendLimit)
        settings.enableRollover = enableRollover
        settings.customNotifications = customNotifications
      }

      const result = await updateWalletSettings({
        walletId: wallet.id,
        walletType: wallet.type,
        settings,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Settings Updated",
        description: "Wallet settings have been saved successfully",
      })

      onUpdate?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("[v0] Settings update error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update wallet settings",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Wallet Settings</DialogTitle>
          <p className="text-sm text-muted-foreground">{wallet.name}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lock Wallet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isLocked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Unlock className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-base font-medium">Lock Wallet</Label>
                <p className="text-xs text-muted-foreground">
                  {isLocked ? "Wallet is locked" : "Wallet is unlocked"}
                </p>
              </div>
            </div>
            <Switch checked={isLocked} onCheckedChange={setIsLocked} />
          </div>

          {isLocked && (
            <div className="space-y-2 pl-8">
              <Label htmlFor="lockDuration" className="text-sm">Lock Duration (days)</Label>
              <Input
                id="lockDuration"
                type="number"
                placeholder="Enter number of days"
                value={lockDuration}
                onChange={(e) => setLockDuration(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                How long should the wallet remain locked?
              </p>
            </div>
          )}

          {/* Budget Wallet Specific Settings */}
          {wallet.type === "budget" && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="spendLimit" className="text-base font-medium">Spending Limit</Label>
                </div>
                <div className="pl-8">
                  <Input
                    id="spendLimit"
                    type="number"
                    placeholder="Enter spending limit"
                    value={spendLimit}
                    onChange={(e) => setSpendLimit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum amount that can be spent from this wallet
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">Automatic Rollover</Label>
                    <p className="text-xs text-muted-foreground">
                      Roll unused funds to next period
                    </p>
                  </div>
                </div>
                <Switch checked={enableRollover} onCheckedChange={setEnableRollover} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">Custom Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts for this wallet
                    </p>
                  </div>
                </div>
                <Switch checked={customNotifications} onCheckedChange={setCustomNotifications} />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isProcessing}
          >
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
