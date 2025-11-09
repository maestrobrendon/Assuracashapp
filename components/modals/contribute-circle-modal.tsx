"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Wallet, ArrowRight } from "lucide-react"

interface ContributeCircleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleName: string
  suggestedAmount?: number
}

export function ContributeCircleModal({ open, onOpenChange, circleName, suggestedAmount }: ContributeCircleModalProps) {
  const [amount, setAmount] = useState(suggestedAmount?.toString() || "")
  const [sourceWallet, setSourceWallet] = useState("main")
  const [note, setNote] = useState("")
  const [recurring, setRecurring] = useState(false)
  const [frequency, setFrequency] = useState("monthly")

  const handleContribute = () => {
    console.log("[v0] Contributing to circle:", { amount, sourceWallet, note, recurring, frequency })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contribute to {circleName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-8 text-lg font-semibold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {suggestedAmount && (
              <p className="text-xs text-muted-foreground">Suggested amount: ₦{suggestedAmount.toLocaleString()}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-wallet">From Wallet</Label>
            <Select value={sourceWallet} onValueChange={setSourceWallet}>
              <SelectTrigger id="source-wallet">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Main Wallet - ₦145,750.50
                  </div>
                </SelectItem>
                <SelectItem value="savings">Savings Wallet - ₦50,000.00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a message..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Set up recurring contribution</p>
                <p className="text-xs text-muted-foreground">Auto-contribute on a schedule</p>
              </div>
              <Switch checked={recurring} onCheckedChange={setRecurring} />
            </div>

            {recurring && (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleContribute} disabled={!amount}>
              Contribute ₦{amount || "0"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
