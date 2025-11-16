"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Loader2, CreditCard, Copy } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface CreateVFDWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: {
    full_name: string
    email: string
    phone: string
  }
  onSuccess: () => void
}

export function CreateVFDWalletModal({ open, onOpenChange, profile, onSuccess }: CreateVFDWalletModalProps) {
  const [step, setStep] = useState<"form" | "creating" | "success">("form")
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [phoneNumber, setPhoneNumber] = useState(profile.phone || "")
  const [email, setEmail] = useState(profile.email || "")
  const [accountDetails, setAccountDetails] = useState<{
    accountNumber: string
    accountName: string
    bankName: string
  } | null>(null)
  const { toast } = useToast()

  const handleCreateWallet = async () => {
    if (!fullName || !phoneNumber || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Validate Nigerian phone number
    if (!phoneNumber.match(/^0[7-9][0-1]\d{8}$/)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Nigerian phone number (e.g., 08012345678)",
        variant: "destructive",
      })
      return
    }

    setStep("creating")

    try {
      const response = await fetch('/api/vfd/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wallet')
      }

      setAccountDetails({
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        bankName: data.bankName,
      })
      setStep("success")
      
      toast({
        title: "Virtual account created!",
        description: "Your VFD bank account has been set up successfully.",
      })

      onSuccess()
    } catch (error) {
      console.error('[v0] Error creating VFD wallet:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create virtual account. Please try again.",
        variant: "destructive",
      })
      setStep("form")
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const handleClose = () => {
    if (step === "success") {
      onSuccess()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "form" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-emerald-500/20 p-3">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Create Virtual Account</DialogTitle>
                  <DialogDescription>Set up your VFD bank account to receive deposits</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08012345678"
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground">Nigerian phone number (11 digits)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateWallet} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Create Account
              </Button>
            </div>
          </>
        )}

        {step === "creating" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Creating your virtual account...</h3>
            <p className="text-sm text-muted-foreground text-center">
              This may take a few moments. Please don't close this window.
            </p>
          </div>
        )}

        {step === "success" && accountDetails && (
          <div className="py-4">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Account Created Successfully!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Your virtual bank account is ready to receive deposits
              </p>
            </div>

            <div className="space-y-3 bg-muted rounded-lg p-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">{accountDetails.accountNumber}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(accountDetails.accountNumber, "Account number")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Account Name</p>
                <p className="text-sm font-medium">{accountDetails.accountName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="text-sm font-medium">{accountDetails.bankName}</p>
              </div>
            </div>

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 mb-6">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Transfer money from any Nigerian bank to this account number and it will automatically reflect in your Assura Cash wallet.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
