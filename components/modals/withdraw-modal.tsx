"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Building2 } from "lucide-react"

interface WithdrawModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
}

export function WithdrawModal({ open, onOpenChange, currentBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [step, setStep] = useState<"form" | "review" | "success">("form")

  const linkedAccount = {
    bank: "GTBank",
    accountNumber: "0123456789",
    accountName: "Adebayo Olamide",
  }

  const handleReview = () => {
    setStep("review")
  }

  const handleConfirm = () => {
    setStep("success")
  }

  const handleClose = () => {
    setAmount("")
    setNote("")
    setStep("form")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Withdraw to Bank</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Available Balance:{" "}
                <span className="font-semibold text-primary">₦{currentBalance.toLocaleString()}</span>
              </p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Linked Account</p>
                    <p className="font-semibold">{linkedAccount.accountName}</p>
                    <p className="text-sm text-muted-foreground">
                      {linkedAccount.bank} - {linkedAccount.accountNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawNote">Note (Optional)</Label>
                <Input
                  id="withdrawNote"
                  placeholder="What's this withdrawal for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                className="flex-1"
                disabled={!amount || Number.parseFloat(amount) > currentBalance}
              >
                Review Withdrawal
              </Button>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Review Withdrawal</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold">₦{Number.parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fee</span>
                  <span className="font-semibold">₦0.00</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">₦{Number.parseFloat(amount).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Receiving Account</p>
                <p className="font-medium">{linkedAccount.accountName}</p>
                <p className="text-muted-foreground">
                  {linkedAccount.bank} - {linkedAccount.accountNumber}
                </p>
              </div>

              {note && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Note</p>
                  <p className="font-medium">{note}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Confirm Withdrawal
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
              <h3 className="mb-2 text-xl font-bold">Withdrawal Successful!</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                ₦{Number.parseFloat(amount).toLocaleString()} has been sent to your {linkedAccount.bank} account
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
