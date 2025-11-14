"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { ChevronLeft, Shield, Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function PrivacyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    default_shielded: true,
    hide_balances: false,
    encrypt_memos: true,
    show_dashboard_balances: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("user_settings")
      .select("default_shielded, hide_balances, encrypt_memos, show_dashboard_balances")
      .eq("user_id", user.id)
      .single()

    if (data) {
      setSettings(data)
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
      setSettings(prev => ({ ...prev, [key]: value }))
      toast({
        title: "Privacy setting updated",
        description: "Your preference has been saved.",
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
        <h1 className="text-2xl font-bold">Privacy Settings</h1>
        <p className="text-sm text-muted-foreground">Control your privacy preferences</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="shielded" className="text-base font-normal">Default to Shielded Transactions</Label>
              <p className="text-sm text-muted-foreground">Hide addresses for privacy</p>
            </div>
          </div>
          <Switch 
            id="shielded"
            checked={settings.default_shielded}
            onCheckedChange={(checked) => updateSetting('default_shielded', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              {settings.hide_balances ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div>
              <Label htmlFor="hide-bal" className="text-base font-normal">Hide Balances</Label>
              <p className="text-sm text-muted-foreground">Mask balance amounts in UI</p>
            </div>
          </div>
          <Switch 
            id="hide-bal"
            checked={settings.hide_balances}
            onCheckedChange={(checked) => updateSetting('hide_balances', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="encrypt" className="text-base font-normal">Encrypt Transaction Memos</Label>
              <p className="text-sm text-muted-foreground">End-to-end encryption</p>
            </div>
          </div>
          <Switch 
            id="encrypt"
            checked={settings.encrypt_memos}
            onCheckedChange={(checked) => updateSetting('encrypt_memos', checked)}
          />
        </div>

        <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label htmlFor="show-dash" className="text-base font-normal">Show Dashboard Balances</Label>
              <p className="text-sm text-muted-foreground">Display balances on dashboard</p>
            </div>
          </div>
          <Switch 
            id="show-dash"
            checked={settings.show_dashboard_balances}
            onCheckedChange={(checked) => updateSetting('show_dashboard_balances', checked)}
          />
        </div>
      </div>
    </div>
  )
}
