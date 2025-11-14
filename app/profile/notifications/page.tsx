"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    transaction_alerts: true,
    circle_updates: true,
    budget_alerts: true,
    goal_milestones: true,
    security_alerts: true,
    marketing_communications: false,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (data) {
      setSettings({
        transaction_alerts: data.transaction_alerts,
        circle_updates: data.circle_updates,
        budget_alerts: data.budget_alerts,
        goal_milestones: data.goal_milestones,
        security_alerts: data.security_alerts,
        marketing_communications: data.marketing_communications,
        push_notifications: data.push_notifications,
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications
      })
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
        title: "Notification setting updated",
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
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Choose what updates you want to receive</p>
      </div>

      <div className="space-y-6">
        {/* Alert Types */}
        <div>
          <h3 className="text-sm font-medium mb-3">Alert Types</h3>
          <div className="space-y-3">
            <NotificationToggle
              label="Transaction Alerts"
              description="Incoming and outgoing transactions"
              checked={settings.transaction_alerts}
              onChange={(checked) => updateSetting('transaction_alerts', checked)}
            />
            <NotificationToggle
              label="Circle Updates"
              description="Circle contributions and payouts"
              checked={settings.circle_updates}
              onChange={(checked) => updateSetting('circle_updates', checked)}
            />
            <NotificationToggle
              label="Budget Alerts"
              description="When approaching spend limits"
              checked={settings.budget_alerts}
              onChange={(checked) => updateSetting('budget_alerts', checked)}
            />
            <NotificationToggle
              label="Goal Milestones"
              description="Savings goal achievements"
              checked={settings.goal_milestones}
              onChange={(checked) => updateSetting('goal_milestones', checked)}
            />
            <NotificationToggle
              label="Security Alerts"
              description="Important security updates"
              checked={settings.security_alerts}
              onChange={(checked) => updateSetting('security_alerts', checked)}
            />
            <NotificationToggle
              label="Marketing"
              description="Promotional communications"
              checked={settings.marketing_communications}
              onChange={(checked) => updateSetting('marketing_communications', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Delivery Methods */}
        <div>
          <h3 className="text-sm font-medium mb-3">Delivery Methods</h3>
          <div className="space-y-3">
            <NotificationToggle
              icon={<Smartphone className="h-5 w-5 text-muted-foreground" />}
              label="Push Notifications"
              description="In-app notifications"
              checked={settings.push_notifications}
              onChange={(checked) => updateSetting('push_notifications', checked)}
            />
            <NotificationToggle
              icon={<Mail className="h-5 w-5 text-muted-foreground" />}
              label="Email Notifications"
              description="Updates via email"
              checked={settings.email_notifications}
              onChange={(checked) => updateSetting('email_notifications', checked)}
            />
            <NotificationToggle
              icon={<MessageSquare className="h-5 w-5 text-muted-foreground" />}
              label="SMS Notifications"
              description="Text message alerts"
              checked={settings.sms_notifications}
              onChange={(checked) => updateSetting('sms_notifications', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationToggle({
  icon,
  label,
  description,
  checked,
  onChange
}: {
  icon?: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 bg-card rounded-lg px-4">
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <div className="rounded-full bg-muted p-2">
            {icon}
          </div>
        )}
        <div>
          <Label className="text-base font-normal">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
