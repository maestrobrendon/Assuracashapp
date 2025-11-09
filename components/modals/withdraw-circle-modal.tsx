"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WithdrawCircleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleBalance: number
}

export function WithdrawCircleModal({ open, onOpenChange, circleBalance }: WithdrawCircleModalProps) {
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState("my-wallet")
  const [reason, setReason] = useState("")
  const [receipt, setReceipt] = useState<File | null>(null)

  const handleWithdraw = () => {
    console.log("[v0] Withdrawing from circle:", { amount, destination, reason, receipt })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All withdrawals are logged and visible to Circle members for transparency.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                className="pl-8 text-lg font-semibold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={circleBalance}
              />
            </div>
            <p className="text-xs text-muted-foreground">Available: ₦{circleBalance.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger id="destination">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my-wallet">My Assura Wallet</SelectItem>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="member">Another Member's Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason/Note *</Label>
            <Textarea
              id="reason"
              placeholder="Explain what these funds will be used for..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">This will be visible to all members</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Attach Receipt (Optional)</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => document.getElementById("receipt-upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {receipt ? receipt.name : "Upload File"}
              </Button>
              <input
                id="receipt-upload"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleWithdraw} disabled={!amount || !reason}>
              Withdraw ₦{amount || "0"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
