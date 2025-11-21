"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Check, AlertCircle } from "lucide-react"
import { BiometricAuthModal } from "@/components/modals/biometric-auth-modal"
import { useBiometric } from "@/lib/hooks/use-biometric"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { createTransaction } from "@/lib/actions/transactions"
import { useAccountMode } from "@/lib/hooks/use-account-mode"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; tag: string } | null>(null)

  const [biometricModalOpen, setBiometricModalOpen] = useState(false)
  const [requiresBiometric, setRequiresBiometric] = useState(false)
  const { isBiometricEnabled, isLoading: isBiometricLoading } = useBiometric()
  const { accountMode } = useAccountMode()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

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

  const handleReview = () => {
    setStep("review")
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, cash_tag, avatar_url")
        .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,cash_tag.ilike.%${searchQuery}%`)
        .limit(5)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error("[v0] Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleConfirm = () => {
    if (requiresBiometric) {
      setBiometricModalOpen(true)
    } else {
      processTransaction()
    }
  }

  const processTransaction = async () => {
    const sendAmount = Number.parseFloat(amount)
    if (!sendAmount || sendAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (sendAmount > currentBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds for this transaction",
        variant: "destructive",
      })
      return
    }

    if (!accountMode) {
      toast({
        title: "Error",
        description: "Account mode not loaded",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Starting send money transaction:", { amount: sendAmount, mode: accountMode })

      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to send money",
          variant: "destructive",
        })
        return
      }

      const { data: walletData, error: walletError } = await supabase
        .from("main_wallets")
        .select("balance")
        .eq("user_id", session.user.id)
        .eq("mode", accountMode)
        .maybeSingle()

      if (walletError) throw walletError

      const newBalance = (walletData?.balance || 0) - sendAmount
      console.log("[v0] Updating balance:", { oldBalance: walletData?.balance, newBalance })

      const { error: updateError } = await supabase
        .from("main_wallets")
        .update({ balance: newBalance })
        .eq("user_id", session.user.id)
        .eq("mode", accountMode)

      if (updateError) throw updateError

      let transactionDescription = ""
      if (sendMethod === "bank") {
        transactionDescription = `Sent to ${bankName} - ${accountNumber}`
      } else if (sendMethod === "user") {
        transactionDescription = `Sent to ${selectedUser?.name} (${selectedUser?.tag})`
      } else {
        transactionDescription = `Sent to circle`
      }

      if (note) {
        transactionDescription += ` - ${note}`
      }

      await createTransaction({
        userId: session.user.id,
        amount: sendAmount,
        type: "withdrawal",
        description: transactionDescription,
        status: "completed",
        mode: accountMode,
      })

      console.log("[v0] Send money transaction successful")
      setStep("success")

      toast({
        title: "Success!",
        description: `₦${sendAmount.toLocaleString()} sent successfully`,
      })
    } catch (error) {
      console.error("[v0] Error sending money:", error)
      toast({
        title: "Error",
        description: "Failed to send money. Please try again.",
        variant: "destructive",
      })
    }
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
    setSelectedUser(null)
    setSearchQuery("")
    setSearchResults([])
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
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or @username"
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>
                      <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} size="sm">
                        {isSearching ? "..." : "Find"}
                      </Button>
                    </div>
                  </div>

                  {searchResults.length > 0 && !selectedUser && (
                    <div className="space-y-2">
                      <Label>Results</Label>
                      <div className="space-y-2">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                            onClick={() => {
                              setSelectedUser({
                                id: user.user_id,
                                name: user.full_name || "Unknown",
                                tag: user.cash_tag || user.email,
                              })
                              setSearchResults([])
                              setSearchQuery("")
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground">{user.cash_tag || user.email}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Select
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/20">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {selectedUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedUser.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.tag}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                        Change
                      </Button>
                    </div>
                  )}

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
                    <span className="text-lg font-bold text-primary">
                      ₦{Number.parseFloat(amount).toLocaleString()}
                    </span>
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
        description={`Please authenticate to send ₦${amount ? Number.parseFloat(amount).toLocaleString() : "0"}`}
      />
    </>
  )
}
