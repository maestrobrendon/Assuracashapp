"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Lock, Unlock, DollarSign, RefreshCw, Bell, Trash2, AlertTriangle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WalletSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallet: {
    id: string
    name: string
    type: "budget" | "goal"
    balance?: number
    locked?: boolean
    isLocked?: boolean
    lockUntil?: string
    spendLimit?: number
    enableRollover?: boolean
    customNotifications?: boolean
    lockDurationDays?: number
  }
  onUpdate?: () => void
  onDelete?: () => void
}

export function WalletSettingsModal({ open, onOpenChange, wallet, onUpdate, onDelete }: WalletSettingsModalProps) {
  const isCurrentlyLocked = wallet.locked || wallet.isLocked || (wallet.lockUntil && new Date(wallet.lockUntil) > new Date())
  
  const [isLocked, setIsLocked] = useState(isCurrentlyLocked)
  const [lockDuration, setLockDuration] = useState(wallet.lockDurationDays?.toString() || "")
  const [spendLimit, setSpendLimit] = useState(wallet.spendLimit?.toString() || "")
  const [enableRollover, setEnableRollover] = useState(wallet.enableRollover || false)
  const [customNotifications, setCustomNotifications] = useState(wallet.customNotifications || false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLockDialog, setShowLockDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsLocked(isCurrentlyLocked)
    setLockDuration(wallet.lockDurationDays?.toString() || "")
    setSpendLimit(wallet.spendLimit?.toString() || "")
    setEnableRollover(wallet.enableRollover || false)
    setCustomNotifications(wallet.customNotifications || false)
  }, [wallet, isCurrentlyLocked])

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleLockToggle = (checked: boolean) => {
    if (isCurrentlyLocked) {
      // Can't unlock a locked wallet
      toast({
        title: "Cannot Unlock",
        description: "This wallet is locked and cannot be unlocked until the expiration date.",
        variant: "destructive",
      })
      return
    }
    
    if (checked) {
      // Show confirmation dialog before locking
      setShowLockDialog(true)
    } else {
      setIsLocked(false)
    }
  }

  const confirmLock = async () => {
    console.log("[v0] confirmLock - Starting lock process")
    
    if (!lockDuration || Number.parseInt(lockDuration) <= 0) {
      toast({
        title: "Invalid Duration",
        description: "Please enter a valid lock duration in days",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log("[v0] confirmLock - User:", user?.id)
      
      if (!user) {
        throw new Error("Not authenticated")
      }

      const tableName = wallet.type === "budget" ? "budget_wallets" : "goal_wallets"
      const lockDays = Number.parseInt(lockDuration)
      const lockUntilDate = new Date()
      lockUntilDate.setDate(lockUntilDate.getDate() + lockDays)

      console.log("[v0] confirmLock - Locking wallet:", {
        walletId: wallet.id,
        tableName,
        lockDays,
        lockUntilDate: lockUntilDate.toISOString()
      })

      const { data, error } = await supabase
        .from(tableName)
        .update({
          is_locked: true,
          locked: true,
          lock_until: lockUntilDate.toISOString(),
          lock_duration_days: lockDays
        })
        .eq("id", wallet.id)
        .eq("user_id", user.id)
        .select()

      console.log("[v0] confirmLock - Update result:", { data, error })

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Failed to update wallet - no rows affected")
      }

      toast({
        title: "Wallet Locked",
        description: `${wallet.name} is now locked for ${lockDays} day${lockDays > 1 ? 's' : ''}`,
      })

      setIsLocked(true)
      setShowLockDialog(false)
      
      await onUpdate?.()
      
      setTimeout(() => {
        onOpenChange(false)
      }, 300)
      
    } catch (error: any) {
      console.error("[v0] confirmLock - Lock error:", error)
      toast({
        title: "Lock Failed",
        description: error.message || "Failed to lock wallet",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Not authenticated")
      }

      const tableName = wallet.type === "budget" ? "budget_wallets" : "goal_wallets"
      const updates: any = {}

      if (wallet.type === "budget") {
        if (spendLimit) updates.spend_limit = Number.parseFloat(spendLimit)
        updates.enable_rollover = enableRollover
        updates.custom_notifications = customNotifications
      }

      const { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq("id", wallet.id)
        .eq("user_id", user.id)

      if (error) throw error

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

  const handleDelete = async () => {
    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("Not authenticated")
      }

      const walletBalance = wallet.balance || 0
      const tableName = wallet.type === "budget" ? "budget_wallets" : "goal_wallets"

      // Transfer balance to main wallet if there's any
      if (walletBalance > 0) {
        const { data: mainWallet } = await supabase
          .from("main_wallets")
          .select("balance")
          .eq("user_id", user.id)
          .single()

        if (mainWallet) {
          const newMainBalance = (Number(mainWallet.balance) || 0) + walletBalance

          const { error: updateError } = await supabase
            .from("main_wallets")
            .update({ balance: newMainBalance })
            .eq("user_id", user.id)

          if (updateError) throw updateError

          // Record transaction
          await supabase.from("transactions").insert({
            user_id: user.id,
            sender_id: user.id,
            receiver_id: user.id,
            wallet_id: wallet.id,
            amount: walletBalance,
            type: "deposit",
            description: `${wallet.name} deleted - funds moved to main wallet`,
            status: "completed",
            reference_number: `DEL${Date.now()}`,
          })
        }
      }

      // Delete the wallet
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", wallet.id)
        .eq("user_id", user.id)

      if (deleteError) throw deleteError

      toast({
        title: "Wallet Deleted",
        description: walletBalance > 0 
          ? `${formatNaira(walletBalance)} has been moved to your main wallet` 
          : "Wallet has been deleted successfully",
      })

      onDelete?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("[v0] Delete error:", error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete wallet",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Wallet Settings</DialogTitle>
            <p className="text-sm text-muted-foreground">{wallet.name}</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isCurrentlyLocked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Unlock className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-base font-medium">Lock Wallet</Label>
                  <p className="text-xs text-muted-foreground">
                    {isCurrentlyLocked 
                      ? "Wallet is locked until expiration" 
                      : "Wallet is unlocked"}
                  </p>
                  {isCurrentlyLocked && wallet.lockUntil && (
                    <p className="text-xs text-amber-600 mt-1">
                      Unlocks on {new Date(wallet.lockUntil).toLocaleDateString('en-NG')}
                    </p>
                  )}
                </div>
              </div>
              <Switch 
                checked={isLocked} 
                onCheckedChange={handleLockToggle}
                disabled={isCurrentlyLocked}
                className={isCurrentlyLocked ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>

            {isLocked && !isCurrentlyLocked && (
              <div className="space-y-2 pl-8">
                <Label htmlFor="lockDuration" className="text-sm">Lock Duration (days)</Label>
                <Input
                  id="lockDuration"
                  type="number"
                  placeholder="Enter number of days"
                  value={lockDuration}
                  onChange={(e) => setLockDuration(e.target.value)}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  How long should the wallet remain locked?
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-2">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 dark:text-amber-200">
                      Once locked, this wallet cannot be unlocked until the expiration date.
                    </p>
                  </div>
                </div>
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
                      min="0"
                      step="0.01"
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

            <div className="border-t border-border pt-6">
              <div className="bg-destructive/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-destructive mb-1">Delete Wallet</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Permanently remove this wallet. Any remaining balance will be automatically transferred to your main wallet.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Wallet
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Wallet?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>Are you sure you want to delete <strong>{wallet.name}</strong>?</div>
              {wallet.balance && wallet.balance > 0 && (
                <div className="text-amber-600 dark:text-amber-400 font-medium">
                  The current balance of {formatNaira(wallet.balance)} will be automatically moved to your main wallet.
                </div>
              )}
              <div className="text-destructive font-medium">This action cannot be undone.</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete Wallet"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-600" />
              Lock Wallet?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>Are you sure you want to lock <strong>{wallet.name}</strong>?</div>
              {lockDuration && (
                <div className="text-amber-600 dark:text-amber-400 font-medium">
                  This wallet will be locked for {lockDuration} day{Number.parseInt(lockDuration) > 1 ? 's' : ''}.
                </div>
              )}
              <div className="text-amber-900 dark:text-amber-200 font-medium bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                Once locked, you will NOT be able to unlock it until the expiration date.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLock}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Yes, Lock Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
