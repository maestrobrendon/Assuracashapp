import { Wallet, Shield, Copy, QrCode, ArrowUpRight, ArrowDownRight, Plus, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WalletsPage() {
  // Mock wallet data
  const wallets = [
    {
      id: 1,
      name: "Main Wallet",
      type: "shielded",
      address: "zs1abc...3x8k",
      balance: 87.5,
      isDefault: true,
    },
    {
      id: 2,
      name: "Savings",
      type: "shielded",
      address: "zs1def...9k2p",
      balance: 37.95,
      isDefault: false,
    },
    {
      id: 3,
      name: "Transparent Wallet",
      type: "transparent",
      address: "t1xyz...4m9n",
      balance: 15.0,
      isDefault: false,
    },
  ]

  const allTransactions = [
    {
      id: 1,
      type: "received",
      amount: 15.5,
      address: "zs1...3x8k",
      counterparty: "zs1...7h4j",
      date: "2024-01-15T14:30:00",
      status: "confirmed",
      shielded: true,
      memo: "Payment for services",
    },
    {
      id: 2,
      type: "sent",
      amount: 5.25,
      address: "zs1...3x8k",
      counterparty: "zs1...9k2p",
      date: "2024-01-15T09:15:00",
      status: "confirmed",
      shielded: true,
      memo: "",
    },
    {
      id: 3,
      type: "received",
      amount: 50.0,
      address: "zs1...9k2p",
      counterparty: "Circle: Team Fund",
      date: "2024-01-14T16:45:00",
      status: "confirmed",
      shielded: false,
      memo: "Monthly distribution",
    },
    {
      id: 4,
      type: "sent",
      amount: 12.75,
      address: "t1...4m9n",
      counterparty: "t1...8k3m",
      date: "2024-01-13T11:20:00",
      status: "confirmed",
      shielded: false,
      memo: "",
    },
    {
      id: 5,
      type: "sent",
      amount: 3.5,
      address: "zs1...3x8k",
      counterparty: "zs1...2n7p",
      date: "2024-01-13T08:00:00",
      status: "pending",
      shielded: true,
      memo: "",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">My Wallets</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Wallet
          </Button>
        </div>

        {/* Wallet Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className={wallet.isDefault ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{wallet.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={wallet.type === "shielded" ? "default" : "secondary"} className="text-xs">
                        {wallet.type === "shielded" ? (
                          <>
                            <Shield className="mr-1 h-3 w-3" />
                            Shielded
                          </>
                        ) : (
                          <>
                            <Wallet className="mr-1 h-3 w-3" />
                            Transparent
                          </>
                        )}
                      </Badge>
                      {wallet.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-foreground">{wallet.balance.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">ZEC</p>
                </div>
                <div className="mb-4 flex items-center gap-2 rounded bg-muted p-2">
                  <code className="flex-1 text-xs text-muted-foreground">{wallet.address}</code>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    Send
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <QrCode className="mr-1 h-3 w-3" />
                    Receive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="space-y-3">
                  {allTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-full p-2.5 ${
                            tx.type === "received"
                              ? "bg-success/10"
                              : tx.status === "pending"
                                ? "bg-accent/10"
                                : "bg-muted"
                          }`}
                        >
                          {tx.type === "received" ? (
                            <ArrowDownRight className="h-5 w-5 text-success" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-accent" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">
                              {tx.type === "received" ? "Received" : "Sent"}
                            </p>
                            {tx.shielded && (
                              <Badge variant="secondary" className="h-5 text-xs">
                                <Shield className="mr-1 h-3 w-3" />
                                Private
                              </Badge>
                            )}
                            {tx.status === "pending" && (
                              <Badge variant="outline" className="h-5 text-xs text-accent">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tx.type === "received" ? "From" : "To"}:{" "}
                            <code className="rounded bg-muted px-1">{tx.counterparty}</code>
                          </p>
                          {tx.memo && <p className="text-sm text-muted-foreground italic">"{tx.memo}"</p>}
                          <p className="text-xs text-muted-foreground">
                            Wallet: <code className="rounded bg-muted px-1">{tx.address}</code>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            tx.type === "received" ? "text-success" : "text-foreground"
                          }`}
                        >
                          {tx.type === "received" ? "+" : "-"}
                          {tx.amount.toFixed(2)} ZEC
                        </p>
                        <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="sent" className="mt-0">
                <div className="space-y-3">
                  {allTransactions
                    .filter((tx) => tx.type === "sent")
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-start justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-muted p-2.5">
                            <ArrowUpRight className="h-5 w-5 text-accent" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">Sent</p>
                              {tx.shielded && (
                                <Badge variant="secondary" className="h-5 text-xs">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              To: <code className="rounded bg-muted px-1">{tx.counterparty}</code>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">-{tx.amount.toFixed(2)} ZEC</p>
                          <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="received" className="mt-0">
                <div className="space-y-3">
                  {allTransactions
                    .filter((tx) => tx.type === "received")
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-start justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-success/10 p-2.5">
                            <ArrowDownRight className="h-5 w-5 text-success" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">Received</p>
                              {tx.shielded && (
                                <Badge variant="secondary" className="h-5 text-xs">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Private
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              From: <code className="rounded bg-muted px-1">{tx.counterparty}</code>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-success">+{tx.amount.toFixed(2)} ZEC</p>
                          <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <div className="space-y-3">
                  {allTransactions
                    .filter((tx) => tx.status === "pending")
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-start justify-between rounded-lg border border-accent/20 bg-accent/5 p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-accent/10 p-2.5">
                            <ArrowUpRight className="h-5 w-5 text-accent" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">Sent</p>
                              <Badge variant="outline" className="h-5 text-xs text-accent">
                                Pending Confirmation
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              To: <code className="rounded bg-muted px-1">{tx.counterparty}</code>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">-{tx.amount.toFixed(2)} ZEC</p>
                          <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
