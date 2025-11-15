"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, Building2, CreditCard, Landmark } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { createTransaction } from "@/lib/actions/transactions"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

interface AddFundsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFundsModal({ open, onOpenChange }: AddFundsModalProps) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank")
  const [step, setStep] = useState<"form" | "success">("form")
  const { toast } = useToast()
  const accountMode = useAccountMode()

  const handleAddFunds = async () => {
    const addAmount = Number.parseFloat(amount)
    if (!addAmount || addAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to add funds",
          variant: "destructive",
        })
        return
      }

      const { data: walletData, error: walletError } = await supabase
        .from('main_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .eq('mode', accountMode)
        .single()

      if (walletError) throw walletError

      const newBalance = (walletData.balance || 0) + addAmount

      const { error: updateError } = await supabase
        .from('main_wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id)
        .eq('mode', accountMode)

      if (updateError) throw updateError

      await createTransaction({
        userId: user.id,
        amount: addAmount,
        type: 'deposit',
        description: 'Added funds',
        status: 'completed',
        mode: accountMode,
      })

      setStep("success")
      
      toast({
        title: "Success!",
        description: `₦${addAmount.toLocaleString()} added to your wallet`,
      })
    } catch (error) {
      console.error('[v0] Error adding funds:', error)
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setAmount("")
    setMethod("bank")
    setStep("form")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add Funds to Main Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground">Top up your balance from external sources</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
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
                <div className="flex gap-2 pt-1">
                  {[5000, 10000, 20000, 50000].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      className="flex-1 text-xs"
                    >
                      ₦{preset.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Funding Method</Label>
                <RadioGroup value={method} onValueChange={setMethod} className="space-y-2">
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="bank" id="bank" className="mt-0.5" />
                    <label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Bank Transfer</p>
                          <p className="text-xs text-muted-foreground">Transfer from your Nigerian bank account</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" className="mt-0.5" />
                    <label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Debit/Credit Card</p>
                          <p className="text-xs text-muted-foreground">Instant top-up with card</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="ussd" id="ussd" className="mt-0.5" />
                    <label htmlFor="ussd" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">USSD Code</p>
                          <p className="text-xs text-muted-foreground">Use your bank's USSD code</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleAddFunds} className="flex-1" disabled={!amount || Number.parseFloat(amount) <= 0}>
                Add Funds
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Funds Added Successfully!</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              ₦{Number.parseFloat(amount).toLocaleString()} has been added to your main wallet
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
