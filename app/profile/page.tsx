"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Shield, Wallet, Settings, Bell, Lock, Download, Upload, ChevronRight, User, CreditCard, FileText, DollarSign, HelpCircle, LogOut, Trash2, Globe, Moon, Sun, Fingerprint, Eye, EyeOff, Mail, Phone, MessageSquare, Gift, Star, Building2, UserCheck, Award as IdCard, Receipt, FileCheck, BarChart3, Percent, Gamepad2, Banknote, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import { useMainWallet } from "@/lib/hooks/use-main-wallet"
import { useAccountMode } from "@/lib/hooks/use-account-mode"
import { useToast } from "@/hooks/use-toast"
import { CreateVFDWalletModal } from "@/components/modals/create-vfd-wallet-modal"

type UserSettings = {
  biometric_enabled: boolean
  show_dashboard_balances: boolean
  interest_enabled: boolean
  dark_mode_enabled: boolean
  default_shielded: boolean
  hide_balances: boolean
  encrypt_memos: boolean
  transaction_alerts: boolean
  circle_updates: boolean
  budget_alerts: boolean
  goal_milestones: boolean
  security_alerts: boolean
  push_notifications: boolean
  email_notifications: boolean
  sms_notifications: boolean
  marketing_communications: boolean
  two_factor_enabled: boolean
  kyc_verified: boolean
  nin: string | null
  rewards_points: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { balance, refetch: refetchBalance } = useMainWallet()
  const { accountMode, isLoading: isModeLoading } = useAccountMode()
  
  const [profile, setProfile] = useState<{
    full_name: string
    email: string
    phone: string
    zcash_id: string
    created_at: string
    initials: string
  } | null>(null)
  
  const [settings, setSettings] = useState<UserSettings>({
    biometric_enabled: false,
    show_dashboard_balances: true,
    interest_enabled: false,
    dark_mode_enabled: false,
    default_shielded: true,
    hide_balances: false,
    encrypt_memos: true,
    transaction_alerts: true,
    circle_updates: true,
    budget_alerts: true,
    goal_milestones: true,
    security_alerts: true,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    marketing_communications: false,
    two_factor_enabled: false,
    kyc_verified: false,
    nin: null,
    rewards_points: 0
  })
  
  const [stats, setStats] = useState({
    totalBalance: 0,
    circleCount: 0,
    transactionCount: 0
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [showSwitchToLiveDialog, setShowSwitchToLiveDialog] = useState(false)
  const [showCreateVFDWalletModal, setShowCreateVFDWalletModal] = useState(false)

  useEffect(() => {
    loadProfileData()
  }, [])

  async function loadProfileData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileData) {
        const names = profileData.full_name?.split(" ") || ["User"]
        const initials = names.map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        setProfile({
          full_name: profileData.full_name || "User",
          email: profileData.email || user.email || "",
          phone: profileData.phone || "",
          zcash_id: profileData.zcash_id || "",
          created_at: profileData.created_at,
          initials,
        })
      }

      // Load settings
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (settingsData) {
        setSettings(settingsData)
      }

      // Load stats
      const [circlesRes, transactionsRes] = await Promise.all([
        supabase.from("circle_members").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("transactions").select("id", { count: "exact" }).or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      ])

      setStats({
        totalBalance: balance,
        circleCount: circlesRes.count || 0,
        transactionCount: transactionsRes.count || 0
      })

    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateSetting(key: keyof UserSettings, value: boolean) {
    try {
      console.log("[v0] Updating setting:", key, "to", value)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log("[v0] No user found")
        return
      }

      console.log("[v0] User ID:", user.id)

      const { data: existingSettings, error: checkError } = await supabase
        .from("user_settings")
        .select('*')
        .eq("user_id", user.id)
        .single()

      console.log("[v0] Existing settings:", existingSettings)

      let error

      if (existingSettings) {
        console.log("[v0] Updating existing settings")
        const { error: updateError } = await supabase
          .from("user_settings")
          .update({ [key]: value })
          .eq("user_id", user.id)

        error = updateError
        console.log("[v0] Update error:", error)
      } else {
        console.log("[v0] Creating new settings record")
        const { error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            [key]: value,
          })

        error = insertError
        console.log("[v0] Insert error:", error)
      }

      if (error) throw error

      setSettings(prev => ({ ...prev, [key]: value }))
      
      if (key === 'dark_mode_enabled') {
        console.log("[v0] Toggling dark mode:", value)
        if (value) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      toast({
        title: "Setting updated",
        description: "Your preference has been saved successfully.",
      })
    } catch (error) {
      console.error("[v0] Error updating setting:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update setting. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function handleSwitchMode(newMode: 'demo' | 'live') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (newMode === 'live') {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('vfd_wallet_id, vfd_account_number')
          .eq('user_id', user.id)
          .single()

        if (!profileData?.vfd_wallet_id || !profileData?.vfd_account_number) {
          setShowSwitchToLiveDialog(false)
          setShowCreateVFDWalletModal(true)
          return
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({ account_mode: newMode })
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: newMode === 'live' ? "Switched to Live Mode" : "Back in Demo Mode",
        description: newMode === 'live' 
          ? "Your dashboard is now empty - you're starting fresh with real money."
          : "Your practice data is still here!",
      })

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("[v0] Error switching mode:", error)
      toast({
        title: "Error",
        description: "Failed to switch account mode. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function handleVFDWalletCreated() {
    await handleSwitchMode('live')
    setShowCreateVFDWalletModal(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading || isModeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently"

  return (
    <div className="min-h-screen bg-background pb-24 pt-16 lg:pt-6 lg:pl-72">
      <div className="px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Account,</h1>
              <p className="text-muted-foreground">{profile?.full_name || "User"}</p>
            </div>
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                {profile?.initials || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden">
          <CardHeader className={`${
            accountMode === 'demo' 
              ? 'bg-gradient-to-r from-orange-500/10 to-orange-400/10 border-b border-orange-500/20' 
              : 'bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border-b border-emerald-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg mb-1">Account Mode</CardTitle>
                <CardDescription>Choose how you want to use Assura Cash</CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`flex items-center gap-2 px-3 py-2 text-sm ${
                  accountMode === 'demo'
                    ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30'
                    : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                }`}
              >
                {accountMode === 'demo' ? (
                  <>
                    <Gamepad2 className="h-4 w-4" />
                    Demo Mode - Playing with fake money
                  </>
                ) : (
                  <>
                    <Banknote className="h-4 w-4" />
                    Live Mode - Real money
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {accountMode === 'demo' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-muted p-2 flex-shrink-0">
                    <Gamepad2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      You're currently in Demo Mode
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Practice with fake money and explore all features without any risk. Your demo data is saved and you can return anytime.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowSwitchToLiveDialog(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  <Banknote className="mr-2 h-5 w-5" />
                  Switch to Live Mode
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-muted p-2 flex-shrink-0">
                    <Banknote className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      You're in Live Mode
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All transactions use real money. Your funds are secure and protected.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleSwitchMode('demo')}
                  variant="outline"
                  className="w-full border-orange-500/20 text-orange-600 hover:bg-orange-500/10"
                  size="lg"
                >
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Back to Demo Mode
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-3">
            <Label htmlFor="biometric" className="text-base font-normal flex items-center gap-2">
              Enable Finger Print/Face ID
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
            </Label>
            <Switch 
              id="biometric" 
              checked={settings.biometric_enabled}
              onCheckedChange={(checked) => updateSetting('biometric_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <Label htmlFor="show-balances" className="text-base font-normal">
              Show Dashboard Account Balances
            </Label>
            <Switch 
              id="show-balances" 
              checked={settings.show_dashboard_balances}
              onCheckedChange={(checked) => updateSetting('show_dashboard_balances', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <Label htmlFor="interest" className="text-base font-normal flex items-center gap-2">
              Interest Enabled on Savings (Riba)
              <Percent className="h-4 w-4 text-emerald-500" />
            </Label>
            <Switch 
              id="interest" 
              checked={settings.interest_enabled}
              onCheckedChange={(checked) => updateSetting('interest_enabled', checked)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Quick Stats Cards */}
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <Wallet className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  ₦{stats.totalBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total Balance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <User className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.circleCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Circles</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.transactionCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          {/* Financial & Rates */}
          <SettingsItem 
            icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
            label="Today's Rates"
            onClick={() => {}}
          />

          {/* Account Settings */}
          <SettingsItem 
            icon={<Settings className="h-5 w-5 text-muted-foreground" />}
            label="My Account Settings"
            onClick={() => router.push("/profile/account-settings")}
          />

          {/* Verification */}
          <SettingsItem 
            icon={<IdCard className="h-5 w-5 text-muted-foreground" />}
            label="Verify NIN"
            badge={settings.nin ? "Verified" : undefined}
            onClick={() => {}}
          />

          {/* Documents */}
          <SettingsItem 
            icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
            label="Generate Account Statement"
            onClick={() => {}}
          />

          <SettingsItem 
            icon={<FileCheck className="h-5 w-5 text-muted-foreground" />}
            label="Generate Reference Letter"
            onClick={() => {}}
          />

          {/* Theme */}
          <div className="flex items-center justify-between py-4 bg-card rounded-lg px-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                {settings.dark_mode_enabled ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <Label htmlFor="dark-mode" className="text-base font-normal">Enable Dark Mode</Label>
            </div>
            <Switch 
              id="dark-mode" 
              checked={settings.dark_mode_enabled}
              onCheckedChange={(checked) => updateSetting('dark_mode_enabled', checked)}
            />
          </div>

          {/* Support */}
          <SettingsItem 
            icon={<HelpCircle className="h-5 w-5 text-muted-foreground" />}
            label="Self Help"
            onClick={() => {}}
          />

          {/* Security */}
          <SettingsItem 
            icon={<Lock className="h-5 w-5 text-muted-foreground" />}
            label="Security"
            onClick={() => router.push("/profile/security")}
          />

          {/* Privacy */}
          <SettingsItem 
            icon={<Shield className="h-5 w-5 text-muted-foreground" />}
            label="Privacy Settings"
            onClick={() => router.push("/profile/privacy")}
          />

          {/* Notifications */}
          <SettingsItem 
            icon={<Bell className="h-5 w-5 text-muted-foreground" />}
            label="Notifications"
            onClick={() => router.push("/profile/notifications")}
          />

          {/* Linked Banks */}
          <SettingsItem 
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
            label="Linked Bank Accounts"
            onClick={() => {}}
          />

          {/* Referrals */}
          <SettingsItem 
            icon={<Gift className="h-5 w-5 text-muted-foreground" />}
            label="Referral Program"
            onClick={() => {}}
          />
        </div>

        <div className="mt-8 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5" />
            Delete Account
          </Button>
        </div>
      </div>

      <AlertDialog open={showSwitchToLiveDialog} onOpenChange={setShowSwitchToLiveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-emerald-500/20 p-3">
                <Banknote className="h-6 w-6 text-emerald-600" />
              </div>
              <AlertDialogTitle className="text-xl">Switch to Live Mode?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              You're about to switch to Live Mode where you can use real money. Your demo data will remain saved and you can switch back anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 px-6 pb-2">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="font-semibold text-foreground text-sm mb-2">To use Live Mode, you'll need to:</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <UserCheck className="h-3 w-3 text-primary" />
                  </div>
                  <span>Complete KYC verification (BVN, NIN)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <CreditCard className="h-3 w-3 text-primary" />
                  </div>
                  <span>Get your virtual bank account</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Wallet className="h-3 w-3 text-primary" />
                  </div>
                  <span>Fund your wallet with real money</span>
                </div>
              </div>
            </div>

            <div className="text-sm font-medium text-foreground">
              Ready to continue?
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSwitchToLiveDialog(false)
                handleSwitchMode('live')
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Switch to Live
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {profile && (
        <CreateVFDWalletModal
          open={showCreateVFDWalletModal}
          onOpenChange={setShowCreateVFDWalletModal}
          profile={profile}
          onSuccess={handleVFDWalletCreated}
        />
      )}
    </div>
  )
}

function SettingsItem({
  icon,
  label,
  badge,
  onClick
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full py-4 bg-card rounded-lg px-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">
          {icon}
        </div>
        <span className="text-base font-normal">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  )
}
