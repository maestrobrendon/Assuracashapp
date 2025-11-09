import { Shield, Wallet, Settings, Bell, Lock, Download, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-foreground">John Doe</h2>
              <Badge className="bg-primary/10 text-primary">
                <Shield className="mr-1 h-3 w-3" />
                Privacy Advocate
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">Member since January 2024</p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">125.45 ZEC</div>
            <p className="text-xs text-muted-foreground">Across 3 wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Circles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">247</div>
            <p className="text-xs text-muted-foreground">76% shielded</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Manage your privacy and security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="default-shielded">Default to Shielded Transactions</Label>
                <p className="text-sm text-muted-foreground">Use shielded addresses by default for maximum privacy</p>
              </div>
              <Switch id="default-shielded" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hide-balances">Hide Balances</Label>
                <p className="text-sm text-muted-foreground">Mask balance amounts in the UI</p>
              </div>
              <Switch id="hide-balances" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="memo-encryption">Encrypt Transaction Memos</Label>
                <p className="text-sm text-muted-foreground">Add end-to-end encryption to transaction notes</p>
              </div>
              <Switch id="memo-encryption" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what updates you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified of incoming and outgoing transactions</p>
              </div>
              <Switch id="transaction-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="circle-updates">Circle Updates</Label>
                <p className="text-sm text-muted-foreground">Notifications about circle activity and goals</p>
              </div>
              <Switch id="circle-updates" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-summary">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly financial summary email</p>
              </div>
              <Switch id="weekly-summary" />
            </div>
          </CardContent>
        </Card>

        {/* Connected Wallets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connected Wallets
            </CardTitle>
            <CardDescription>Manage your Zcash wallet connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Main Wallet</p>
                  <p className="text-sm text-muted-foreground">zs1abc...3x8k</p>
                </div>
              </div>
              <Badge variant="secondary">Default</Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Savings</p>
                  <p className="text-sm text-muted-foreground">zs1def...9k2p</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="mr-2 h-4 w-4" />
              Connect New Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              Clear Transaction History
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
