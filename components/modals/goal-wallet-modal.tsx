"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown, ChevronUp, Check, Calendar, Upload } from "lucide-react"

interface GoalWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalWalletModal({ open, onOpenChange }: GoalWalletModalProps) {
  const [goalName, setGoalName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [lockOption, setLockOption] = useState("lock")
  const [fundingSource, setFundingSource] = useState("manual")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [step, setStep] = useState<"form" | "success">("form")

  const handleCreate = () => {
    setStep("success")
  }

  const handleClose = () => {
    setGoalName("")
    setTargetAmount("")
    setDeadline("")
    setLockOption("lock")
    setFundingSource("manual")
    setShowAdvanced(false)
    setStep("form")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Goal Wallet</DialogTitle>
              <p className="text-sm text-muted-foreground">Save for defined goals with flexible timelines</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  placeholder="e.g., New iPhone, Vacation"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="200"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline / Goal Date</Label>
                <div className="relative">
                  <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Funding Source</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={fundingSource === "manual" ? "default" : "outline"}
                    onClick={() => setFundingSource("manual")}
                    className="h-auto py-3"
                  >
                    Manual Top-up
                  </Button>
                  <Button
                    type="button"
                    variant={fundingSource === "auto" ? "default" : "outline"}
                    onClick={() => setFundingSource("auto")}
                    className="h-auto py-3"
                  >
                    Auto-schedule
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Wallet Lock</Label>
                <p className="text-xs text-muted-foreground">Control access to the funds in this wallet.</p>
                <RadioGroup value={lockOption} onValueChange={setLockOption} className="space-y-2">
                  <div className="flex items-start space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="lock" id="lock" className="mt-0.5" />
                    <label htmlFor="lock" className="flex-1 text-sm leading-tight cursor-pointer">
                      Lock until goal is reached or deadline passes
                    </label>
                  </div>
                  <div className="flex items-start space-x-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value="open" id="open" className="mt-0.5" />
                    <label htmlFor="open" className="flex-1 text-sm leading-tight cursor-pointer">
                      Keep wallet open for withdrawals
                    </label>
                  </div>
                </RadioGroup>
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
                  <div className="space-y-2">
                    <Label htmlFor="goalImage">Goal Image (Optional)</Label>
                    <p className="text-xs text-muted-foreground">Add an image for goal visualization.</p>
                    <Button variant="outline" className="w-full justify-start bg-transparent" type="button">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose file
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="flex-1" disabled={!goalName || !targetAmount}>
                Create Goal
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
              <h3 className="mb-2 text-xl font-bold">Goal Wallet Created!</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Your {goalName} goal wallet has been created successfully
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
