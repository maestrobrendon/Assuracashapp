"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, CreditCard, Building2, QrCode, Check, Landmark } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { createTransaction } from "@/lib/actions/transactions"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

interface TopUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_LINKED_BANKS = [
  { id: "1", name: "Access Bank", accountNumber: "0123456789", logo: "🏦" },
  { id: "2", name: "GTBank", accountNumber: "9876543210", logo: "🏦" },
  { id: "3", name: "Zenith Bank", accountNumber: "5555666677", logo: "🏦" },
]

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [method, setMethod] = useState<"account" | "card" | "bank" | "qr" | null>(null)
  const [amount, setAmount] = useState("")
  const [step, setStep] = useState<"method" | "details" | "success">("method")
  const [currentBalance, setCurrentBalance] = useState(0)
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const { toast } = useToast()
  const { accountMode, isLoading: accountModeLoading } = useAccountMode()

  const dedicatedAccount = "1234567890"
  const dedicatedBank = "Wema Bank"

  useEffect(() => {
    if (open) {
      fetchCurrentBalance()
    }
  }, [open])

  const fetchCurrentBalance = async () => {
    try {
      if (accountModeLoading || !accountMode) return

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from('main_wallets')
        .select('balance')
        .eq('user_id', session.user.id)
        .eq('mode', accountMode)
        .single()

      if (!error && data) {
        setCurrentBalance(data.balance)
      }
    } catch (error) {
      console.error('[v0] Error fetching balance:', error)
    }
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(dedicatedAccount)
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    })
  }

  const handleTopUp = async () => {
    const topUpAmount = Number.parseFloat(amount)
    if (!topUpAmount || topUpAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!accountMode) {
      toast({
        title: "Error",
        description: "Account mode not loaded",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('[v0] Starting top-up transaction:', { amount: topUpAmount, mode: accountMode })
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to top up",
          variant: "destructive",
        })
        return
      }

      const { data: walletData, error: walletError } = await supabase
        .from('main_wallets')
        .select('balance')
        .eq('user_id', session.user.id)
        .eq('mode', accountMode)
        .maybeSingle()

      if (walletError) throw walletError

      const newBalance = (walletData?.balance || 0) + topUpAmount
      console.log('[v0] Updating balance:', { oldBalance: walletData?.balance, newBalance })

      const { error: updateError } = await supabase
        .from('main_wallets')
        .update({ balance: newBalance })
        .eq('user_id', session.user.id)
        .eq('mode', accountMode)

      if (updateError) throw updateError

      await createTransaction({
        userId: session.user.id,
        amount: topUpAmount,
        type: 'deposit',
        description: `Added funds via ${method === 'card' ? 'card' : method === 'bank' ? 'linked bank' : method === 'qr' ? 'QR code' : 'bank transfer'}`,
        status: 'completed',
        mode: accountMode,
      })

      console.log('[v0] Top-up successful')
      setStep("success")
      
      toast({
        title: "Success!",
        description: `₦${topUpAmount.toLocaleString()} added to your wallet`,
      })
      
      setTimeout(() => {
        fetchCurrentBalance()
      }, 500)
    } catch (error) {
      console.error('[v0] Error topping up:', error)
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setMethod(null)
    setAmount("")
    setStep("method")
    setSelectedBank(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "method" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Top Up Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Your current balance: <span className="font-semibold text-primary">₦{currentBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </p>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <button
                onClick={() => setMethod("account")}
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Dedicated Account Number</h4>
                    <p className="text-sm text-muted-foreground">Transfer to your unique account to top up.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMethod("card")
                  setStep("details")
                }}
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Top Up with Card</h4>
                    <p className="text-sm text-muted-foreground">Use your debit or credit card.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMethod("bank")
                  setStep("details")
                }}
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Landmark className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Top Up from Linked Bank</h4>
                    <p className="text-sm text-muted-foreground">Directly debit a linked bank account.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setMethod("qr")
                  setStep("details")
                }}
                className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Top Up via QR Code</h4>
                    <p className="text-sm text-muted-foreground">Scan a code to pay.</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {method === "account" && step === "method" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Dedicated Account Number</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
                <p className="mb-2 text-sm text-muted-foreground">Bank Name</p>
                <p className="mb-4 text-lg font-semibold">{dedicatedBank}</p>

                <p className="mb-2 text-sm text-muted-foreground">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold tracking-wider">{dedicatedAccount}</p>
                  <Button size="icon" variant="ghost" onClick={handleCopyAccount}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Transfer any amount to this account number and it will reflect in your Assura Cash wallet instantly.
                </p>
              </div>
            </div>

            <Button onClick={() => setMethod(null)} className="w-full">
              Done
            </Button>
          </>
        )}

        {step === "details" && method === "card" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Top Up with Card</DialogTitle>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="0000 0000 0000 0000" maxLength={19} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" maxLength={3} type="password" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleTopUp} className="flex-1" disabled={!amount}>
                Top Up
              </Button>
            </div>
          </>
        )}

        {step === "details" && method === "bank" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Select Linked Bank</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                {SAMPLE_LINKED_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selectedBank === bank.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{bank.logo}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{bank.name}</h4>
                        <p className="text-sm text-muted-foreground">{bank.accountNumber}</p>
                      </div>
                      {selectedBank === bank.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedBank && (
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
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleTopUp} className="flex-1" disabled={!selectedBank || !amount}>
                Top Up
              </Button>
            </div>
          </>
        )}

        {step === "details" && method === "qr" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Top Up via QR Code</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-xl border-2 border-border bg-muted/50 p-8">
                  <QrCode className="h-48 w-48 text-muted-foreground" />
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Scan this QR code with your banking app to complete the top-up
                </p>
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
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleTopUp} className="flex-1" disabled={!amount}>
                Confirm
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Top Up Successful!</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                ₦{Number.parseFloat(amount || "0").toLocaleString()} has been added to your wallet
              </p>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
