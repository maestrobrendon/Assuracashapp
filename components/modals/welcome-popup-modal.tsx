"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Wallet, Target, Users } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface WelcomePopupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivate: () => Promise<void>
}

export function WelcomePopupModal({ open, onOpenChange, onActivate }: WelcomePopupModalProps) {
  const [isActivating, setIsActivating] = useState(false)

  const handleActivate = async () => {
    setIsActivating(true)
    try {
      await onActivate()

      // Mark user as having seen the welcome popup
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("profiles").update({ has_seen_welcome_popup: true }).eq("user_id", user.id)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error activating demo account:", error)
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Welcome to Assura Cash!</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground pt-2">
            You're starting in Demo Mode where you can practice with fake money risk-free. No real transactions, just
            pure exploration!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">₦500,000 Demo Balance</h4>
              <p className="text-sm text-muted-foreground">Start with plenty of fake money to explore</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">6 Sample Wallets</h4>
              <p className="text-sm text-muted-foreground">Budget and goal wallets ready to use</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">5 Sample Circles</h4>
              <p className="text-sm text-muted-foreground">Experience group savings features</p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleActivate}
          disabled={isActivating}
          size="lg"
          className="w-full h-12 text-base font-semibold"
        >
          {isActivating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Activating Your Demo Account...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Activate My Demo Account
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">You can switch to Live Mode anytime from Settings</p>
      </DialogContent>
    </Dialog>
  )
}
