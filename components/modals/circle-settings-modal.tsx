"use client"

import { useState, useEffect } from "react"
import { X, Lock, Globe, Shield, UserPlus, Calendar, Target, DollarSign, Users, Trash2, LogOut, Bell, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'

interface CircleSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circle: any
  userRole: string
  userId: string
  onUpdate: () => void
}

export function CircleSettingsModal({
  open,
  onOpenChange,
  circle,
  userRole,
  userId,
  onUpdate,
}: CircleSettingsModalProps) {
  const router = useRouter()
  const isAdmin = userRole === "admin"
  
  // Admin settings state
  const [circleName, setCircleName] = useState(circle?.name || "")
  const [description, setDescription] = useState(circle?.description || "")
  const [targetAmount, setTargetAmount] = useState(circle?.target_amount || 0)
  const [targetDate, setTargetDate] = useState(
    circle?.target_date ? new Date(circle.target_date).toISOString().split("T")[0] : ""
  )
  const [visibility, setVisibility] = useState<"public" | "private">(circle?.visibility || "private")
  const [allowExternal, setAllowExternal] = useState(circle?.allow_external_contributions || false)
  const [maxMembers, setMaxMembers] = useState(circle?.max_members || 50)
  const [category, setCategory] = useState(circle?.category || "general")
  
  // Member settings state
  const [notifications, setNotifications] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  
  // Co-admin management
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && isAdmin) {
      loadMembers()
    }
  }, [open, circle?.id])

  const loadMembers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", circle.id)
      .eq("mode", circle.mode)
    
    setMembers(data || [])
  }

  const handleSaveBasicSettings = async () => {
    setIsLoading(true)
    console.log("[v0] Saving basic circle settings...")
    
    const supabase = createClient()
    const { error } = await supabase
      .from("circles")
      .update({
        name: circleName,
        description,
        target_amount: targetAmount,
        target_date: targetDate,
        visibility,
        allow_external_contributions: allowExternal,
        max_members: maxMembers,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", circle.id)
      .eq("mode", circle.mode)

    if (error) {
      console.error("[v0] Error updating circle:", error)
      alert("Failed to update circle settings")
    } else {
      console.log("[v0] Circle settings updated successfully")
      onUpdate()
      alert("Circle settings updated successfully!")
    }
    
    setIsLoading(false)
  }

  const handlePromoteToModerator = async (memberId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("circle_members")
      .update({ role: "moderator" })
      .eq("id", memberId)
      .eq("circle_id", circle.id)

    if (error) {
      console.error("[v0] Error promoting member:", error)
      alert("Failed to promote member")
    } else {
      loadMembers()
      alert("Member promoted to moderator!")
    }
    setIsLoading(false)
  }

  const handleDemoteToMember = async (memberId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("circle_members")
      .update({ role: "member" })
      .eq("id", memberId)
      .eq("circle_id", circle.id)

    if (error) {
      console.error("[v0] Error demoting member:", error)
      alert("Failed to demote member")
    } else {
      loadMembers()
      alert("Member demoted to regular member")
    }
    setIsLoading(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the circle?")) return
    
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("circle_members")
      .delete()
      .eq("id", memberId)
      .eq("circle_id", circle.id)

    if (error) {
      console.error("[v0] Error removing member:", error)
      alert("Failed to remove member")
    } else {
      loadMembers()
      alert("Member removed successfully")
    }
    setIsLoading(false)
  }

  const handleLeaveCircle = async () => {
    if (userRole === "admin") {
      alert("As the admin, you cannot leave the circle. Please transfer ownership first or delete the circle.")
      return
    }

    if (!confirm("Are you sure you want to leave this circle? You can be re-invited later.")) return
    
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("circle_members")
      .delete()
      .eq("user_id", userId)
      .eq("circle_id", circle.id)

    if (error) {
      console.error("[v0] Error leaving circle:", error)
      alert("Failed to leave circle")
    } else {
      alert("You have left the circle")
      router.push("/circles")
    }
    setIsLoading(false)
  }

  const handleDeleteCircle = async () => {
    if (!confirm("Are you sure you want to delete this circle? This action cannot be undone and all data will be lost.")) return
    if (!confirm("Final confirmation: Delete this circle permanently?")) return
    
    setIsLoading(true)
    const supabase = createClient()
    
    // Delete circle members first
    await supabase
      .from("circle_members")
      .delete()
      .eq("circle_id", circle.id)
    
    // Delete circle transactions
    await supabase
      .from("circle_transactions")
      .delete()
      .eq("circle_id", circle.id)
    
    // Delete the circle
    const { error } = await supabase
      .from("circles")
      .delete()
      .eq("id", circle.id)
      .eq("mode", circle.mode)

    if (error) {
      console.error("[v0] Error deleting circle:", error)
      alert("Failed to delete circle")
    } else {
      alert("Circle deleted successfully")
      router.push("/circles")
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Circle Settings
          </DialogTitle>
          <DialogDescription>
            {isAdmin ? "Manage your circle settings and members" : "Manage your preferences for this circle"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={isAdmin ? "general" : "preferences"} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: isAdmin ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
            {isAdmin && (
              <>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </>
            )}
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* ADMIN: General Settings */}
          {isAdmin && (
            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Circle Name</Label>
                  <Input
                    id="name"
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    placeholder="Family Vacation Fund"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Saving together for our December holiday..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Amount (₦)</Label>
                    <Input
                      id="target"
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(Number(e.target.value))}
                      placeholder="500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Target Date</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="emergency">Emergency Fund</SelectItem>
                      <SelectItem value="event">Event Planning</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="charity">Charity</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        {visibility === "public" ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        Circle Visibility
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {visibility === "public" 
                          ? "Anyone can discover and request to join" 
                          : "Only people with invite link can join"}
                      </p>
                    </div>
                    <Switch
                      checked={visibility === "public"}
                      onCheckedChange={(checked) => setVisibility(checked ? "public" : "private")}
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow External Contributions</Label>
                      <p className="text-xs text-muted-foreground">
                        Non-members can contribute to this circle
                      </p>
                    </div>
                    <Switch checked={allowExternal} onCheckedChange={setAllowExternal} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    min={members.length}
                    max={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    Current members: {members.length}
                  </p>
                </div>

                <Button onClick={handleSaveBasicSettings} disabled={isLoading} className="w-full">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </TabsContent>
          )}

          {/* ADMIN: Members Management */}
          {isAdmin && (
            <TabsContent value="members" className="space-y-4">
              <div className="space-y-4">
                {members.map((member) => {
                  const isCurrentUser = member.user_id === userId
                  const memberRole = member.role

                  return (
                    <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border p-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {isCurrentUser ? "You" : "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {isCurrentUser ? "You" : `Member ${member.id.slice(0, 8)}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {memberRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <div className="flex gap-2">
                          {memberRole === "member" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromoteToModerator(member.id)}
                              disabled={isLoading}
                            >
                              <UserPlus className="mr-1 h-3 w-3" />
                              Make Moderator
                            </Button>
                          )}
                          {memberRole === "moderator" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDemoteToMember(member.id)}
                              disabled={isLoading}
                            >
                              Demote
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role Permissions
                </h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Admin:</strong> Full control - manage settings, members, funds</p>
                  <p><strong>Moderator:</strong> Can invite members and manage posts</p>
                  <p><strong>Member:</strong> Can contribute, withdraw (if allowed), and view activity</p>
                </div>
              </div>
            </TabsContent>
          )}

          {/* ADMIN: Advanced Settings */}
          {isAdmin && (
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-2">Danger Zone</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                      <div>
                        <p className="text-sm font-medium">Archive Circle</p>
                        <p className="text-xs text-muted-foreground">Make circle read-only (coming soon)</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Archive
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/50 bg-destructive/10">
                      <div>
                        <p className="text-sm font-medium text-destructive">Delete Circle</p>
                        <p className="text-xs text-muted-foreground">Permanently delete this circle and all data</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteCircle}
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <h4 className="font-medium">Contribution Rules</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Admin Approval</Label>
                      <p className="text-xs text-muted-foreground">
                        All withdrawals need admin approval
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Spending Limits</Label>
                      <p className="text-xs text-muted-foreground">
                        Set maximum withdrawal amounts
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-lock on Goal Reached</Label>
                      <p className="text-xs text-muted-foreground">
                        Prevent withdrawals after reaching target
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Member Names</Label>
                      <p className="text-xs text-muted-foreground">
                        Display full names of members
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Individual Contributions</Label>
                      <p className="text-xs text-muted-foreground">
                        Make contribution amounts visible to all
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* USER: Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Preferences
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Circle Updates</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about contributions and withdrawals
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Goal Milestones</Label>
                    <p className="text-xs text-muted-foreground">
                      Alerts when circle reaches 25%, 50%, 75%, 100%
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Member Activity</Label>
                    <p className="text-xs text-muted-foreground">
                      When members join or leave the circle
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Display Preferences
                </h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Circle Balance</Label>
                    <p className="text-xs text-muted-foreground">
                      Display balance on circle cards
                    </p>
                  </div>
                  <Switch checked={showBalance} onCheckedChange={setShowBalance} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show My Contributions</Label>
                    <p className="text-xs text-muted-foreground">
                      Display your total contribution amount
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              {!isAdmin && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Leave Circle
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    You can be re-invited to join again later. Your contribution history will be preserved.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLeaveCircle}
                    disabled={isLoading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Leave Circle
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
