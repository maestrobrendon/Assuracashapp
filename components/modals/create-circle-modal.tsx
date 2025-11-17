"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Globe, Lock } from 'lucide-react'
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

interface CreateCircleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateCircleModal({ open, onOpenChange, onSuccess }: CreateCircleModalProps) {
  const [circleName, setCircleName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState<Date>()
  const [isPublic, setIsPublic] = useState(false)
  const [allowExternal, setAllowExternal] = useState(false)
  const [showMemberNames, setShowMemberNames] = useState(true)
  const [showContributions, setShowContributions] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const { accountMode, isLoading: accountModeLoading } = useAccountMode()

  const handleCreate = async () => {
    if (accountModeLoading || !accountMode) {
      alert("Please wait while we load your account settings...")
      return
    }

    setIsCreating(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        console.error("[v0] Not authenticated")
        alert("Please log in to create a circle")
        setIsCreating(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", session.user.id)
        .single()

      if (profileError || !profile) {
        console.error("[v0] Profile not found:", profileError)
        alert("Your profile is not set up yet. Please complete your profile first.")
        setIsCreating(false)
        return
      }

      console.log("[v0] Creating circle for user:", session.user.id, "mode:", accountMode)

      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .insert({
          name: circleName,
          description: description,
          category: category,
          target_amount: targetAmount ? Number.parseFloat(targetAmount) : null,
          visibility: isPublic ? "public" : "private",
          allow_external_contributions: allowExternal,
          created_by: session.user.id,
          purpose: description || circleName,
          current_balance: 0,
          member_count: 1,
          mode: accountMode,
        })
        .select()
        .single()

      if (circleError) {
        console.error("[v0] Error creating circle:", circleError)
        alert("Failed to create circle: " + circleError.message)
        setIsCreating(false)
        return
      }

      console.log("[v0] Circle created:", circle)

      const { error: memberError } = await supabase
        .from("circle_members")
        .insert({
          circle_id: circle.id,
          user_id: session.user.id,
          role: "admin",
          total_contributed: 0,
          mode: accountMode,
        })

      if (memberError) {
        console.error("[v0] Error adding circle admin:", memberError)
        alert("Failed to add you as admin: " + memberError.message)
        setIsCreating(false)
        return
      }

      console.log("[v0] Circle created successfully!")
      
      if (onSuccess) {
        onSuccess()
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      alert("An unexpected error occurred")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="circle-name">Circle Name *</Label>
              <Input
                id="circle-name"
                placeholder="e.g., Team Lunch Fund"
                value={circleName}
                onChange={(e) => setCircleName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this Circle for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent Split</SelectItem>
                  <SelectItem value="ajo">Ajo/Esusu</SelectItem>
                  <SelectItem value="savings">Group Savings</SelectItem>
                  <SelectItem value="charity">Charity/Fundraiser</SelectItem>
                  <SelectItem value="event">Event Planning</SelectItem>
                  <SelectItem value="project">Project Fund</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goal Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Goal Settings (Optional)</h3>

            <div className="space-y-2">
              <Label htmlFor="target-amount">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deadline (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-foreground">Privacy Settings</h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPublic ? (
                  <Globe className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Public Circle</p>
                  <p className="text-xs text-muted-foreground">Anyone can discover and join</p>
                </div>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Allow External Contributions</p>
                <p className="text-xs text-muted-foreground">Non-members can contribute via link</p>
              </div>
              <Switch checked={allowExternal} onCheckedChange={setAllowExternal} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Member Names</p>
                <p className="text-xs text-muted-foreground">Display names to all members</p>
              </div>
              <Switch checked={showMemberNames} onCheckedChange={setShowMemberNames} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Show Individual Contributions</p>
                <p className="text-xs text-muted-foreground">Display who contributed what</p>
              </div>
              <Switch checked={showContributions} onCheckedChange={setShowContributions} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreate} disabled={!circleName || isCreating}>
              {isCreating ? "Creating..." : "Create Circle"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
