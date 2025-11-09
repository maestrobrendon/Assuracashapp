"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Check } from "lucide-react"

interface RequestMoneyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestMoneyModal({ open, onOpenChange }: RequestMoneyModalProps) {
  const [step, setStep] = useState<"form" | "success">("form")
  const [requestMethod, setRequestMethod] = useState<"user" | "circle">("user")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [selectedUser, setSelectedUser] = useState("")

  const recentUsers = [
    { name: "Jane Doe", username: "@janedoe", avatar: "J" },
    { name: "John Smith", username: "@johnsmith", avatar: "J" },
    { name: "Emily White", username: "@emilywhite", avatar: "E" },
  ]

  const handleRequest = () => {
    // Process request
    setStep("success")
  }

  const handleClose = () => {
    setStep("form")
    onOpenChange(false)
    setAmount("")
    setNote("")
    setSelectedUser("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Request Money</DialogTitle>
              <p className="text-sm text-muted-foreground">Request payment from Assura users or circle members</p>
            </DialogHeader>

            <Tabs value={requestMethod} onValueChange={(v) => setRequestMethod(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user">Assura User</TabsTrigger>
                <TabsTrigger value="circle">Circle</TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Search User</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search by name or @username" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recents</Label>
                  <div className="space-y-2">
                    {recentUsers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                        onClick={() => setSelectedUser(user.username)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.username}</p>
                          </div>
                        </div>
                        <Button size="sm" variant={selectedUser === user.username ? "default" : "outline"}>
                          {selectedUser === user.username ? "Selected" : "Select"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedUser && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="requestAmount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                        <Input
                          id="requestAmount"
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requestNote">What's this for?</Label>
                      <Input
                        id="requestNote"
                        placeholder="e.g., Dinner split, Rent contribution"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="circle" className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">Select a circle to request money from</p>
                {/* Circle selection would go here */}
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleRequest} className="flex-1" disabled={!amount || !selectedUser}>
                Send Request
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Request Sent!</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Your request for ₦{Number.parseFloat(amount).toLocaleString()} has been sent
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
