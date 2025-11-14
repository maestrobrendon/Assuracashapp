"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { ChevronLeft, Lock, Fingerprint, Shield, Smartphone, Key, History } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function SecurityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("user_settings")
      .select("two_factor_enabled, biometric_enabled")
      .eq("user_id", user.id)
      .single()

    if (data) {
      setTwoFactorEnabled(data.two_factor_enabled || false)
      setBiometricEnabled(data.biometric_enabled || false)
    }
  }

  async function updateSetting(key: string, value: boolean) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("user_settings")
      .update({ [key]: value })
      .eq("user_id", user.id)

    if (!error) {
      toast({
        title: "Setting updated",
        description: "Your security preference has been saved.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-muted-foreground">Manage your security settings</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-base font-normal">Change Password</Label>
              <p className="text-sm text-muted-foreground">Update your password</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Change</Button>
        </div>

        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Fingerprint className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="biometric-sec" className="text-base font-normal">Biometric Authentication</Label>
              <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
            </div>
          </div>
          <Switch 
            id="biometric-sec"
            checked={biometricEnabled}
            onCheckedChange={(checked) => {
              setBiometricEnabled(checked)
              updateSetting('biometric_enabled', checked)
            }}
          />
        </div>

        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="2fa" className="text-base font-normal">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <Switch 
            id="2fa"
            checked={twoFactorEnabled}
            onCheckedChange={(checked) => {
              setTwoFactorEnabled(checked)
              updateSetting('two_factor_enabled', checked)
            }}
          />
        </div>

        <button
          onClick={() => {}}
          className="flex items-center justify-between w-full py-4 bg-card rounded-lg px-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <Label className="text-base font-normal">Active Sessions</Label>
              <p className="text-sm text-muted-foreground">Manage logged-in devices</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {}}
          className="flex items-center justify-between w-full py-4 bg-card rounded-lg px-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <Label className="text-base font-normal">Login History</Label>
              <p className="text-sm text-muted-foreground">View recent login activity</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
