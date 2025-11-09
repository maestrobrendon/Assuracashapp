"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, CreditCard, Building2, QrCode, Check } from "lucide-react"

interface TopUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const [method, setMethod] = useState<"account" | "card" | "bank" | "qr" | null>(null)
  const [amount, setAmount] = useState("")
  const [step, setStep] = useState<"method" | "details" | "success">("method")

  const dedicatedAccount = "1234567890"
  const dedicatedBank = "Wema Bank"

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(dedicatedAccount)
  }

  const handleTopUp = () => {
    setStep("success")
  }

  const handleClose = () => {
    setMethod(null)
    setAmount("")
    setStep("method")
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
                Your current balance: <span className="font-semibold text-primary">₦0.00</span>
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
                    <Building2 className="h-5 w-5 text-primary" />
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

        {step === "method" && method === "account" && (
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
