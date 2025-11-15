"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Fingerprint, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BiometricAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onCancel: () => void
  title?: string
  description?: string
}

export function BiometricAuthModal({
  open,
  onOpenChange,
  onSuccess,
  onCancel,
  title = "Authenticate Transaction",
  description = "This transaction requires biometric authentication to proceed.",
}: BiometricAuthModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStatus, setAuthStatus] = useState<"idle" | "authenticating" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleAuthenticate = async () => {
    setIsAuthenticating(true)
    setAuthStatus("authenticating")
    setErrorMessage("")

    try {
      // Simulate biometric authentication
      // In production, this would use WebAuthn API or platform-specific biometric APIs
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.1 // 90% success rate
      
      if (isSuccess) {
        setAuthStatus("success")
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 800)
      } else {
        setAuthStatus("error")
        setErrorMessage("Authentication failed. Please try again.")
        setIsAuthenticating(false)
      }
    } catch (error) {
      setAuthStatus("error")
      setErrorMessage("Authentication failed. Please try again.")
      setIsAuthenticating(false)
    }
  }

  const handleClose = () => {
    setIsAuthenticating(false)
    setAuthStatus("idle")
    setErrorMessage("")
    onOpenChange(false)
  }

  const handleCancelClick = () => {
    onCancel()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          {authStatus === "idle" && (
            <>
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Fingerprint className="h-12 w-12 text-primary" />
              </div>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Tap the button below to authenticate with your fingerprint or face ID
              </p>
            </>
          )}

          {authStatus === "authenticating" && (
            <>
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                <Fingerprint className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <p className="mb-2 text-center font-semibold">Authenticating...</p>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Please use your fingerprint or face ID
              </p>
            </>
          )}

          {authStatus === "success" && (
            <>
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              <p className="mb-2 text-center font-semibold text-success">Authentication Successful!</p>
              <p className="mb-8 text-center text-sm text-muted-foreground">
                Your transaction is being processed...
              </p>
            </>
          )}

          {authStatus === "error" && (
            <>
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {authStatus !== "success" && (
            <>
              <Button
                variant="outline"
                onClick={handleCancelClick}
                className="flex-1"
                disabled={isAuthenticating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAuthenticate}
                className="flex-1"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Authenticate
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
