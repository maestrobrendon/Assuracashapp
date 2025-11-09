"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ArrowRight } from "lucide-react"
import { mockWallets, formatNaira } from "@/lib/mock-data"

interface MoveMoneyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoveMoneyModal({ open, onOpenChange }: MoveMoneyModalProps) {
  const [amount, setAmount] = useState("")
  const [fromWallet, setFromWallet] = useState("wallet-main")
  const [toWallet, setToWallet] = useState("")
  const [step, setStep] = useState<"form" | "success">("form")

  const budgetWallets = mockWallets.filter((w) => w.type !== "main")
  const mainWallet = mockWallets.find((w) => w.type === "main")

  const handleMove = () => {
    setStep("success")
  }

  const handleClose = () => {
    setAmount("")
    setFromWallet("wallet-main")
    setToWallet("")
    setStep("form")
    onOpenChange(false)
  }

  const selectedFromWallet = mockWallets.find((w) => w.id === fromWallet)
  const selectedToWallet = mockWallets.find((w) => w.id === toWallet)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Move Money Between Wallets</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Transfer funds from your main wallet to budget/goal wallets
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fromWallet">From Wallet</Label>
                <Select value={fromWallet} onValueChange={setFromWallet}>
                  <SelectTrigger id="fromWallet">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} - {formatNaira(wallet.balance)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFromWallet && (
                  <p className="text-xs text-muted-foreground">Available: {formatNaira(selectedFromWallet.balance)}</p>
                )}
              </div>

              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-2">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toWallet">To Wallet</Label>
                <Select value={toWallet} onValueChange={setToWallet}>
                  <SelectTrigger id="toWallet">
                    <SelectValue placeholder="Select destination wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWallets
                      .filter((w) => w.id !== fromWallet)
                      .map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} - {formatNaira(wallet.balance)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {selectedFromWallet && (
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(((selectedFromWallet.balance * percent) / 100).toFixed(2))}
                        className="flex-1 text-xs"
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleMove}
                className="flex-1"
                disabled={!amount || !toWallet || Number.parseFloat(amount) <= 0}
              >
                Move Money
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Transfer Successful!</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {formatNaira(Number.parseFloat(amount))} has been moved from {selectedFromWallet?.name} to{" "}
              {selectedToWallet?.name}
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
