"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp, Check } from "lucide-react"

interface BudgetWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetWalletModal({ open, onOpenChange }: BudgetWalletModalProps) {
  const [walletName, setWalletName] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [frequency, setFrequency] = useState("weekly")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [enableRollover, setEnableRollover] = useState(false)
  const [step, setStep] = useState<"form" | "success">("form")

  const categories = ["Groceries", "Restaurants", "Utilities", "Rent", "Mortgage", "Transportation"]

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleCreate = () => {
    setStep("success")
  }

  const handleClose = () => {
    setWalletName("")
    setBudgetAmount("")
    setFrequency("weekly")
    setShowAdvanced(false)
    setEnableRollover(false)
    setSelectedCategories([])
    setStep("form")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Budget Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground">Allocate funds for recurring short-term needs</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="walletName">Wallet Name</Label>
                <Input
                  id="walletName"
                  placeholder="e.g., Groceries, Transport"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetAmount">Budget Limit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="budgetAmount"
                    type="number"
                    placeholder="200"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Budget Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-primary transition-colors hover:bg-primary/10"
              >
                <span className="text-sm font-medium">Advanced Options</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-3">
                    <Label>Tracked Categories</Label>
                    <p className="text-xs text-muted-foreground">
                      Select which spending categories will count towards this budget.
                    </p>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <label
                            htmlFor={category}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between space-x-2 rounded-lg border border-border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="rollover">Enable Rollover</Label>
                      <p className="text-xs text-muted-foreground">
                        Carry over unused funds to the next budget period.
                      </p>
                    </div>
                    <Switch id="rollover" checked={enableRollover} onCheckedChange={setEnableRollover} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="flex-1" disabled={!walletName || !budgetAmount}>
                Create Budget
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
              <h3 className="mb-2 text-xl font-bold">Budget Wallet Created!</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Your {walletName} budget wallet has been created successfully
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
