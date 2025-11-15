"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp, Check, Calendar, Upload } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

interface GoalWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalWalletModal({ open, onOpenChange }: GoalWalletModalProps) {
  const [goalName, setGoalName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [fundingSource, setFundingSource] = useState<"manual" | "auto">("manual")
  const [goalImage, setGoalImage] = useState<File | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [lockWallet, setLockWallet] = useState(false)
  const [lockDuration, setLockDuration] = useState("")

  const [smartReminders, setSmartReminders] = useState(false)
  const [flexContributions, setFlexContributions] = useState(false)

  const [step, setStep] = useState<"form" | "success">("form")
  const [isCreating, setIsCreating] = useState(false)

  const accountMode = useAccountMode()

  const handleCreate = async () => {
    setIsCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert("Please log in to create a goal wallet")
        setIsCreating(false)
        return
      }

      const { data: wallet, error } = await supabase
        .from("goal_wallets")
        .insert({
          user_id: user.id,
          name: goalName,
          target_amount: Number.parseFloat(targetAmount),
          balance: 0,
          target_date: deadline || null,
          funding_source: fundingSource,
          smart_reminders: smartReminders,
          flex_contributions: flexContributions,
          is_locked: lockWallet,
          locked: lockWallet,
          lock_until: lockDuration 
            ? new Date(Date.now() + Number.parseInt(lockDuration) * 24 * 60 * 60 * 1000).toISOString() 
            : null,
          lock_duration_days: lockDuration ? Number.parseInt(lockDuration) : null,
          mode: accountMode, // Add mode field
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating goal wallet:", error)
        alert("Failed to create goal wallet: " + error.message)
        setIsCreating(false)
        return
      }

      console.log("[v0] Goal wallet created:", wallet)
      setStep("success")
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setGoalName("")
    setTargetAmount("")
    setDeadline("")
    setFundingSource("manual")
    setGoalImage(null)
    setShowAdvanced(false)
    setLockWallet(false)
    setLockDuration("")
    setSmartReminders(false)
    setFlexContributions(false)
    setStep("form")
    onOpenChange(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGoalImage(e.target.files[0])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Wallet</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="goalName" className="text-sm font-medium">
                  Goal Name
                </Label>
                <Input
                  id="goalName"
                  placeholder="e.g., New Phone, Vacation"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-sm font-medium">
                  Target Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="1200"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="pl-8 bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-medium">
                  Deadline / Goal Date
                </Label>
                <div className="relative">
                  <Input
                    id="deadline"
                    type="date"
                    placeholder="Pick a date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-background"
                  />
                  <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Funding Source</Label>
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
                <Label htmlFor="goalImage" className="text-sm font-medium">
                  Goal Image (Optional)
                </Label>
                <p className="text-xs text-muted-foreground">Add an image for goal visualization.</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 justify-start bg-background"
                    type="button"
                    onClick={() => document.getElementById("goalImageInput")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose file
                  </Button>
                  <span className="text-sm text-muted-foreground">{goalImage ? goalImage.name : "No file chosen"}</span>
                  <input
                    id="goalImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lockWallet" className="text-base">
                      Lock Wallet
                    </Label>
                    <p className="text-xs text-muted-foreground">Lock funds until a specific date.</p>
                  </div>
                  <Switch id="lockWallet" checked={lockWallet} onCheckedChange={setLockWallet} />
                </div>

                {lockWallet && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="lockDuration">Lock Duration (in days)</Label>
                    <Input
                      id="lockDuration"
                      type="number"
                      placeholder="e.g., 30"
                      value={lockDuration}
                      onChange={(e) => setLockDuration(e.target.value)}
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Funds will be locked for this many days from creation.
                    </p>
                  </div>
                )}
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
                  {/* Smart Reminders */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="smartReminders" className="text-sm font-medium cursor-pointer">
                        Smart Reminders
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">Get intelligent reminders to fund your goal.</p>
                    </div>
                    <Switch id="smartReminders" checked={smartReminders} onCheckedChange={setSmartReminders} />
                  </div>

                  {/* Flex Contributions */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="flexContributions" className="text-sm font-medium cursor-pointer">
                        Flex Contributions
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">Auto-adjust contributions if you miss one.</p>
                    </div>
                    <Switch id="flexContributions" checked={flexContributions} onCheckedChange={setFlexContributions} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent" disabled={isCreating}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!goalName || !targetAmount || !deadline || isCreating}
              >
                {isCreating ? "Creating..." : "Create Goal"}
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
