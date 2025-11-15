"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Check, AlertCircle } from 'lucide-react'
import { BiometricAuthModal } from "@/components/modals/biometric-auth-modal"
import { useBiometric } from "@/lib/hooks/use-biometric"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SendMoneyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
}

export function SendMoneyModal({ open, onOpenChange, currentBalance }: SendMoneyModalProps) {
  const [step, setStep] = useState<"form" | "review" | "success">("form")
  const [sendMethod, setSendMethod] = useState<"bank" | "user" | "circle">("bank")

  // Form states
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  
  const [biometricModalOpen, setBiometricModalOpen] = useState(false)
  const [requiresBiometric, setRequiresBiometric] = useState(false)
  const { isBiometricEnabled, isLoading: isBiometricLoading } = useBiometric()

  const recentUsers = [
    { name: "Jane Doe", username: "@janedoe", avatar: "J" },
    { name: "John Smith", username: "@johnsmith", avatar: "J" },
    { name: "Emily White", username: "@emilywhite", avatar: "E" },
  ]

  const nigerianBanks = [
    "Access Bank",
    "GTBank",
    "First Bank",
    "Zenith Bank",
    "UBA",
    "Kuda Bank",
    "OPay",
    "PalmPay",
    "Moniepoint",
    "Wema Bank",
  ]

  const checkBiometricRequirement = () => {
    const amountValue = Number.parseFloat(amount)
    // Require biometric for transactions over ₦10,000 if biometric is enabled
    if (isBiometricEnabled && amountValue >= 10000) {
      setRequiresBiometric(true)
      return true
    }
    setRequiresBiometric(false)
    return false
  }

  useEffect(() => {
    if (amount) {
      checkBiometricRequirement()
    }
  }, [amount, isBiometricEnabled])

  const handleReview = () => {
    setStep("review")
  }

  const handleConfirm = () => {
    if (requiresBiometric) {
      setBiometricModalOpen(true)
    } else {
      processTransaction()
    }
  }

  const processTransaction = () => {
    setStep("success")
  }

  const handleBiometricCancel = () => {
    setBiometricModalOpen(false)
  }

  const handleClose = () => {
    setStep("form")
    onOpenChange(false)
    // Reset form
    setBankName("")
    setAccountNumber("")
    setAmount("")
    setNote("")
    setSelectedUser("")
    setRequiresBiometric(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          {step === "form" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Send Money</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Your Main Balance:{" "}
                  <span className="font-semibold text-primary">₦{currentBalance.toLocaleString()}</span>
                </p>
              </DialogHeader>

              <Tabs value={sendMethod} onValueChange={(v) => setSendMethod(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bank">Bank</TabsTrigger>
                  <TabsTrigger value="user">Assura User</TabsTrigger>
                  <TabsTrigger value="circle">Circle</TabsTrigger>
                </TabsList>

                <TabsContent value="bank" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank">Bank</Label>
                    <Select value={bankName} onValueChange={setBankName}>
                      <SelectTrigger id="bank">
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigerianBanks.map((bank) => (
                          <SelectItem key={bank} value={bank}>
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Account Number</Label>
                    <Input
                      id="account"
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    {requiresBiometric && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Biometric authentication will be required for this transaction amount
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Input
                      id="note"
                      placeholder="What's this for?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </TabsContent>

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
                          className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
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
                          <Button
                            size="sm"
                            variant={selectedUser === user.username ? "default" : "outline"}
                            onClick={() => setSelectedUser(user.username)}
                          >
                            {selectedUser === user.username ? "Selected" : "Select"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedUser && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="userAmount">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                          <Input
                            id="userAmount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        {requiresBiometric && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Biometric authentication will be required for this transaction amount
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="userNote">Note (Optional)</Label>
                        <Input
                          id="userNote"
                          placeholder="What's this for?"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="circle" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">Select a circle to send money to</p>
                  {/* Circle selection would go here */}
                </TabsContent>
              </Tabs>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleReview}
                  className="flex-1"
                  disabled={!amount || (sendMethod === "bank" && (!bankName || !accountNumber))}
                >
                  Review Transfer
                </Button>
              </div>
            </>
          )}

          {step === "review" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Review Transfer</DialogTitle>
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

                {sendMethod === "bank" && (
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Recipient</p>
                    <p className="font-medium">
                      {bankName} - {accountNumber}
                    </p>
                  </div>
                )}

                {note && (
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">Note</p>
                    <p className="font-medium">{note}</p>
                  </div>
                )}
                
                {requiresBiometric && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      This transaction requires biometric authentication
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  {requiresBiometric ? "Authenticate & Confirm" : "Confirm Transfer"}
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
                <h3 className="mb-2 text-xl font-bold">Transfer Successful!</h3>
                <p className="mb-6 text-center text-sm text-muted-foreground">
                  ₦{Number.parseFloat(amount).toLocaleString()} has been sent successfully
                </p>
                <Button onClick={handleClose} className="w-full">
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BiometricAuthModal
        open={biometricModalOpen}
        onOpenChange={setBiometricModalOpen}
        onSuccess={processTransaction}
        onCancel={handleBiometricCancel}
        title="Authenticate Transaction"
        description={`Please authenticate to send ₦${amount ? Number.parseFloat(amount).toLocaleString() : '0'}`}
      />
    </>
  )
}
