"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronUp, Check, Wallet, Target, Calendar, Upload, X } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

interface BudgetWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetWalletModal({ open, onOpenChange }: BudgetWalletModalProps) {
  const [walletType, setWalletType] = useState<"budget" | "goal">("budget")
  const [walletName, setWalletName] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [spendLimit, setSpendLimit] = useState("")
  const [lockWallet, setLockWallet] = useState(false)
  const [lockDuration, setLockDuration] = useState("")
  const [disbursementFrequency, setDisbursementFrequency] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("")
  const [dayOfMonth, setDayOfMonth] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [enableRollover, setEnableRollover] = useState(false)
  const [automaticAllocation, setAutomaticAllocation] = useState(false)
  const [allocationFrequency, setAllocationFrequency] = useState("")
  const [allocationDay, setAllocationDay] = useState("")
  const [allocationDayOfMonth, setAllocationDayOfMonth] = useState("")
  const [customNotifications, setCustomNotifications] = useState(false)

  const [goalDeadline, setGoalDeadline] = useState("")
  const [fundingSource, setFundingSource] = useState<"manual" | "auto">("manual")
  const [goalImage, setGoalImage] = useState<string | null>(null)
  const [smartReminders, setSmartReminders] = useState(false)
  const [flexContributions, setFlexContributions] = useState(false)

  const [step, setStep] = useState<"form" | "success">("form")
  const [isCreating, setIsCreating] = useState(false)

  const { accountMode } = useAccountMode()

  const handleCreate = async () => {
    setIsCreating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert("Please log in to create a wallet")
        setIsCreating(false)
        return
      }

      console.log("[v0] Creating wallet for user:", user.id)

      if (walletType === "budget") {
        const { data: wallet, error } = await supabase
          .from("budget_wallets")
          .insert({
            user_id: user.id,
            name: walletName,
            balance: Number.parseFloat(budgetAmount),
            spend_limit: spendLimit ? Number.parseFloat(spendLimit) : null,
            is_locked: lockWallet,
            lock_until: lockDuration 
              ? new Date(Date.now() + Number.parseInt(lockDuration) * 24 * 60 * 60 * 1000).toISOString() 
              : null,
            disbursement_frequency: disbursementFrequency || null,
            day_of_week: disbursementFrequency === "monthly" ? null : dayOfWeek || null,
            enable_rollover: enableRollover,
            automatic_allocation: automaticAllocation,
            allocation_frequency: allocationFrequency || null,
            allocation_day: allocationFrequency === "monthly" && allocationDayOfMonth 
              ? Number.parseInt(allocationDayOfMonth) 
              : null,
            custom_notifications: customNotifications,
            mode: accountMode,
          })
          .select()
          .single()

        if (error) {
          console.error("[v0] Error creating budget wallet:", error)
          alert("Failed to create budget wallet: " + error.message)
          setIsCreating(false)
          return
        }

        console.log("[v0] Budget wallet created:", wallet)
      } else {
        const { data: wallet, error } = await supabase
          .from("goal_wallets")
          .insert({
            user_id: user.id,
            name: walletName,
            target_amount: Number.parseFloat(budgetAmount),
            balance: 0,
            target_date: goalDeadline || null,
            funding_source: fundingSource,
            smart_reminders: smartReminders,
            flex_contributions: flexContributions,
            is_locked: lockWallet,
            locked: lockWallet,
            lock_until: lockDuration 
              ? new Date(Date.now() + Number.parseInt(lockDuration) * 24 * 60 * 60 * 1000).toISOString() 
              : null,
            lock_duration_days: lockDuration ? Number.parseInt(lockDuration) : null,
            mode: accountMode,
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
      }

      setStep("success")
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      alert("An unexpected error occurred: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setWalletType("budget")
    setWalletName("")
    setBudgetAmount("")
    setSpendLimit("")
    setLockWallet(false)
    setLockDuration("")
    setDisbursementFrequency("")
    setDayOfWeek("")
    setDayOfMonth("")
    setShowAdvanced(false)
    setEnableRollover(false)
    setAutomaticAllocation(false)
    setAllocationFrequency("")
    setAllocationDay("")
    setAllocationDayOfMonth("")
    setCustomNotifications(false)
    setGoalDeadline("")
    setFundingSource("manual")
    setGoalImage(null)
    setSmartReminders(false)
    setFlexContributions(false)
    setStep("form")
    onOpenChange(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGoalImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Wallet</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex gap-2 rounded-lg bg-muted p-1">
                <button
                  onClick={() => setWalletType("budget")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    walletType === "budget"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  Budget
                </button>
                <button
                  onClick={() => setWalletType("goal")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    walletType === "goal"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Goal
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletName">{walletType === "budget" ? "Budget Name" : "Goal Name"}</Label>
                <Input
                  id="walletName"
                  placeholder={walletType === "budget" ? "e.g., Weekly Groceries" : "e.g., New Phone, Vacation"}
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetAmount">
                  {walletType === "budget" ? "Total Budget Amount" : "Target Amount"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="budgetAmount"
                  type="number"
                  placeholder={walletType === "budget" ? "200" : "50000"}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {walletType === "budget"
                    ? "This amount will be moved from your main balance."
                    : "The total amount you want to save."}
                </p>
              </div>

              {walletType === "budget" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="spendLimit">Spend Limit (Optional)</Label>
                    <Input
                      id="spendLimit"
                      type="text"
                      placeholder="e.g., ₦5000 per transaction"
                      value={spendLimit}
                      onChange={(e) => setSpendLimit(e.target.value)}
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">Set a maximum amount for any single transaction.</p>
                  </div>

                  <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="lockWallet" className="text-base">
                          Lock Wallet
                        </Label>
                        <p className="text-xs text-muted-foreground">Lock funds and set a disbursement schedule.</p>
                      </div>
                      <Switch id="lockWallet" checked={lockWallet} onCheckedChange={setLockWallet} />
                    </div>

                    {lockWallet && (
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="lockDuration">Lock Duration (in days)</Label>
                          <Input
                            id="lockDuration"
                            type="number"
                            placeholder="e.g., 30"
                            value={lockDuration}
                            onChange={(e) => setLockDuration(e.target.value)}
                            className="bg-background"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="disbursementFrequency">Disbursement Frequency</Label>
                          <Select value={disbursementFrequency} onValueChange={setDisbursementFrequency}>
                            <SelectTrigger id="disbursementFrequency" className="bg-background">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {(disbursementFrequency === "daily" ||
                          disbursementFrequency === "weekly" ||
                          disbursementFrequency === "biweekly") && (
                          <div className="space-y-2">
                            <Label htmlFor="dayOfWeek">Day of the Week</Label>
                            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                              <SelectTrigger id="dayOfWeek" className="bg-background">
                                <SelectValue placeholder="Select a day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="tuesday">Tuesday</SelectItem>
                                <SelectItem value="wednesday">Wednesday</SelectItem>
                                <SelectItem value="thursday">Thursday</SelectItem>
                                <SelectItem value="friday">Friday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                                <SelectItem value="sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {disbursementFrequency === "monthly" && (
                          <div className="space-y-2">
                            <Label htmlFor="dayOfMonth">Day of the Month</Label>
                            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                              <SelectTrigger id="dayOfMonth" className="bg-background">
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="goalDeadline">Deadline / Goal Date</Label>
                    <div className="relative">
                      <Input
                        id="goalDeadline"
                        type="date"
                        value={goalDeadline}
                        onChange={(e) => setGoalDeadline(e.target.value)}
                        className="bg-background"
                      />
                      <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Funding Source</Label>
                    <div className="flex gap-2 rounded-lg bg-muted p-1">
                      <button
                        onClick={() => setFundingSource("manual")}
                        className={`flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          fundingSource === "manual"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Manual Top-up
                      </button>
                      <button
                        onClick={() => setFundingSource("auto")}
                        className={`flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                          fundingSource === "auto"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Auto-schedule
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goalImage">Goal Image (Optional)</Label>
                    <p className="text-xs text-muted-foreground mb-2">Add an image for goal visualization.</p>

                    {goalImage ? (
                      <div className="relative rounded-lg border border-border overflow-hidden">
                        <img src={goalImage || "/placeholder.svg"} alt="Goal" className="w-full h-32 object-cover" />
                        <button
                          onClick={() => setGoalImage(null)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="goalImage"
                        className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Choose file - No file chosen</span>
                        <input
                          id="goalImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="lockGoalWallet" className="text-base">
                          Lock Wallet
                        </Label>
                        <p className="text-xs text-muted-foreground">Lock funds until a specific date.</p>
                      </div>
                      <Switch id="lockGoalWallet" checked={lockWallet} onCheckedChange={setLockWallet} />
                    </div>

                    {lockWallet && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="lockDurationGoal">Lock Duration (in days)</Label>
                        <Input
                          id="lockDurationGoal"
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
                </>
              )}

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between text-primary hover:text-primary/80 transition-colors"
              >
                <span className="text-sm font-medium">Advanced Options</span>
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvanced && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                  {walletType === "budget" ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <Label htmlFor="automaticAllocation" className="text-base">
                              Automatic Allocation
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically fund this budget from your main wallet.
                            </p>
                          </div>
                          <Switch
                            id="automaticAllocation"
                            checked={automaticAllocation}
                            onCheckedChange={setAutomaticAllocation}
                          />
                        </div>

                        {automaticAllocation && (
                          <div className="space-y-3 pt-2">
                            <div className="space-y-2">
                              <Label htmlFor="allocationFrequency">Allocation Frequency</Label>
                              <Select value={allocationFrequency} onValueChange={setAllocationFrequency}>
                                <SelectTrigger id="allocationFrequency" className="bg-background">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                The budget amount will be debited automatically.
                              </p>
                            </div>

                            {(allocationFrequency === "daily" ||
                              allocationFrequency === "weekly" ||
                              allocationFrequency === "biweekly") && (
                              <div className="space-y-2">
                                <Label htmlFor="allocationDay">Day of the Week</Label>
                                <Select value={allocationDay} onValueChange={setAllocationDay}>
                                  <SelectTrigger id="allocationDay" className="bg-background">
                                    <SelectValue placeholder="Select a day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monday">Monday</SelectItem>
                                    <SelectItem value="tuesday">Tuesday</SelectItem>
                                    <SelectItem value="wednesday">Wednesday</SelectItem>
                                    <SelectItem value="thursday">Thursday</SelectItem>
                                    <SelectItem value="friday">Friday</SelectItem>
                                    <SelectItem value="saturday">Saturday</SelectItem>
                                    <SelectItem value="sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {allocationFrequency === "monthly" && (
                              <div className="space-y-2">
                                <Label htmlFor="allocationDayOfMonth">Day of the Month</Label>
                                <Select value={allocationDayOfMonth} onValueChange={setAllocationDayOfMonth}>
                                  <SelectTrigger id="allocationDayOfMonth" className="bg-background">
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                      <SelectItem key={day} value={day.toString()}>
                                        {day}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="rollover" className="text-base">
                            Enable Rollover
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Carry over unspent allocation to the next period.
                          </p>
                        </div>
                        <Switch id="rollover" checked={enableRollover} onCheckedChange={setEnableRollover} />
                      </div>

                      <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="customNotifications" className="text-base">
                            Custom Notifications
                          </Label>
                          <p className="text-xs text-muted-foreground">Get a reminder before each allocation.</p>
                        </div>
                        <Switch
                          id="customNotifications"
                          checked={customNotifications}
                          onCheckedChange={setCustomNotifications}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="smartReminders" className="text-base">
                            Smart Reminders
                          </Label>
                          <p className="text-xs text-muted-foreground">Get intelligent reminders to fund your goal.</p>
                        </div>
                        <Switch id="smartReminders" checked={smartReminders} onCheckedChange={setSmartReminders} />
                      </div>

                      <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="space-y-0.5">
                          <Label htmlFor="flexContributions" className="text-base">
                            Flex Contributions
                          </Label>
                          <p className="text-xs text-muted-foreground">Auto-adjust contributions if you miss one.</p>
                        </div>
                        <Switch
                          id="flexContributions"
                          checked={flexContributions}
                          onCheckedChange={setFlexContributions}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent" disabled={isCreating}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                className="flex-1 bg-primary"
                disabled={!walletName || !budgetAmount || isCreating}
              >
                {isCreating ? "Creating..." : `Create ${walletType === "budget" ? "Budget" : "Goal"}`}
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
              <h3 className="mb-2 text-xl font-bold">{walletType === "budget" ? "Budget" : "Goal"} Wallet Created!</h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Your {walletName} {walletType} wallet has been created successfully
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
