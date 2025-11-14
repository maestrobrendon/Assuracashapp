"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { transferMoney } from "@/lib/actions/wallets"

interface MoveMoneyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface WalletOption {
  id: string
  name: string
  balance: number
  type: "main" | "budget" | "goal"
  locked?: boolean
}

export function MoveMoneyModal({ open, onOpenChange }: MoveMoneyModalProps) {
  const [amount, setAmount] = useState("")
  const [fromWallet, setFromWallet] = useState<WalletOption | null>(null)
  const [toWallet, setToWallet] = useState<WalletOption | null>(null)
  const [allWallets, setAllWallets] = useState<WalletOption[]>([])
  const [unlockedWallets, setUnlockedWallets] = useState<WalletOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const { toast } = useToast()

  const fetchWallets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const all: WalletOption[] = []
      const unlocked: WalletOption[] = []

      const { data: mainWallet } = await supabase
        .from("main_wallets")
        .select("id, balance")
        .eq("user_id", user.id)
        .single()

      if (mainWallet) {
        const mainWalletOption = {
          id: mainWallet.id,
          name: "Main Wallet",
          balance: Number(mainWallet.balance) || 0,
          type: "main" as const,
          locked: false,
        }
        all.push(mainWalletOption)
        unlocked.push(mainWalletOption)
      }

      const { data: budgetWallets } = await supabase
        .from("budget_wallets")
        .select("id, name, balance, locked, is_locked")
        .eq("user_id", user.id)

      if (budgetWallets) {
        budgetWallets.forEach((wallet) => {
          const walletOption: WalletOption = {
            id: wallet.id,
            name: wallet.name,
            balance: Number(wallet.balance) || 0,
            type: "budget",
            locked: wallet.locked || wallet.is_locked || false,
          }
          all.push(walletOption)
          // Only add to unlocked list if not locked
          if (!walletOption.locked) {
            unlocked.push(walletOption)
          }
        })
      }

      const { data: goalWallets } = await supabase
        .from("goal_wallets")
        .select("id, name, balance")
        .eq("user_id", user.id)

      if (goalWallets) {
        goalWallets.forEach((wallet) => {
          const walletOption: WalletOption = {
            id: wallet.id,
            name: wallet.name,
            balance: Number(wallet.balance) || 0,
            type: "goal",
            locked: false,
          }
          all.push(walletOption)
          unlocked.push(walletOption)
        })
      }

      setAllWallets(all)
      setUnlockedWallets(unlocked)
      
      if (!fromWallet) {
        const main = unlocked.find(w => w.type === "main")
        if (main) {
          setFromWallet(main)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching wallets:", error)
    }
  }

  useEffect(() => {
    if (open) {
      fetchWallets()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const channel = supabase
      .channel("wallet-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "main_wallets" }, fetchWallets)
      .on("postgres_changes", { event: "*", schema: "public", table: "budget_wallets" }, fetchWallets)
      .on("postgres_changes", { event: "*", schema: "public", table: "goal_wallets" }, fetchWallets)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open])

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleMove = async () => {
    if (!fromWallet || !toWallet || !amount) return

    const transferAmount = Number.parseFloat(amount)
    
    if (transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive",
      })
      return
    }

    if (transferAmount > fromWallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough funds in ${fromWallet.name}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await transferMoney({
        fromWalletId: fromWallet.id,
        fromWalletType: fromWallet.type,
        toWalletId: toWallet.id,
        toWalletType: toWallet.type,
        amount: transferAmount,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Transfer Successful",
        description: `${formatNaira(transferAmount)} moved from ${fromWallet.name} to ${toWallet.name}`,
      })

      // Reset form
      setAmount("")
      setToWallet(null)
      await fetchWallets()
      
      // Close modal after short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (error: any) {
      console.error("[v0] Transfer error:", error)
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to complete transfer",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAmount("")
    setToWallet(null)
    setShowFromDropdown(false)
    setShowToDropdown(false)
    onOpenChange(false)
  }

  const availableToWallets = allWallets.filter((w) => w.id !== fromWallet?.id)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Move Money Between Wallets</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Transfer funds from your main wallet to budget/goal wallets
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* From Wallet Section */}
          <div className="space-y-2">
            <Label className="text-sm">From Wallet</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFromDropdown(!showFromDropdown)}
                className="w-full rounded-lg border bg-card p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{fromWallet?.name || "Select wallet"}</p>
                  {fromWallet && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Available: {formatNaira(fromWallet.balance)}
                    </p>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* From Wallet Dropdown */}
              {showFromDropdown && (
                <div className="absolute z-50 w-full mt-1 rounded-lg border bg-card shadow-lg max-h-[240px] overflow-y-auto">
                  {unlockedWallets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 px-3">
                      No unlocked wallets available
                    </p>
                  ) : (
                    unlockedWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => {
                          setFromWallet(wallet)
                          setShowFromDropdown(false)
                          // Reset to wallet if same as new from wallet
                          if (toWallet?.id === wallet.id) {
                            setToWallet(null)
                          }
                        }}
                        className={`w-full p-3 text-left hover:bg-primary/10 transition-colors border-b last:border-b-0 ${
                          fromWallet?.id === wallet.id ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{wallet.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {wallet.type} Wallet
                            </p>
                          </div>
                          <p className="font-semibold text-sm">{formatNaira(wallet.balance)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* To Wallet Section with Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm">To Wallet</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToDropdown(!showToDropdown)}
                className="w-full rounded-lg border bg-card p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    {toWallet ? toWallet.name : "Select wallet"}
                  </p>
                  {toWallet && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatNaira(toWallet.balance)}
                    </p>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              {showToDropdown && (
                <div className="absolute z-50 w-full mt-1 rounded-lg border bg-card shadow-lg max-h-[240px] overflow-y-auto">
                  {availableToWallets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4 px-3">
                      No other wallets available
                    </p>
                  ) : (
                    availableToWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => {
                          setToWallet(wallet)
                          setShowToDropdown(false)
                        }}
                        className={`w-full p-3 text-left hover:bg-primary/10 transition-colors border-b last:border-b-0 ${
                          toWallet?.id === wallet.id ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{wallet.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {wallet.type} Wallet
                            </p>
                          </div>
                          <p className="font-semibold text-sm">{formatNaira(wallet.balance)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          {toWallet && (
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ₦
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-11"
                />
              </div>
              {fromWallet && (
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <Button
                      key={percent}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(((fromWallet.balance * percent) / 100).toFixed(2))}
                      className="flex-1 text-xs h-8"
                    >
                      {percent}%
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1" 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={!amount || !toWallet || Number.parseFloat(amount) <= 0 || isLoading}
          >
            {isLoading ? "Moving..." : "Move Money"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
