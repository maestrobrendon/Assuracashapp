"use client"

import { TrendingUp, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalyticsPage() {
  // Mock data for charts
  const balanceHistory = [
    { month: "Jan", balance: 85 },
    { month: "Feb", balance: 92 },
    { month: "Mar", balance: 88 },
    { month: "Apr", balance: 105 },
    { month: "May", balance: 115 },
    { month: "Jun", balance: 125 },
  ]

  const transactionVolume = [
    { month: "Jan", sent: 45, received: 52 },
    { month: "Feb", sent: 38, received: 58 },
    { month: "Mar", sent: 52, received: 48 },
    { month: "Apr", sent: 48, received: 65 },
    { month: "May", sent: 55, received: 72 },
    { month: "Jun", sent: 62, received: 68 },
  ]

  const categoryBreakdown = [
    { category: "Circles", amount: 234, percentage: 45 },
    { category: "Personal", amount: 156, percentage: 30 },
    { category: "Savings", amount: 89, percentage: 17 },
    { category: "Investments", amount: 42, percentage: 8 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
          <p className="mt-1 text-muted-foreground">Track your financial activity and insights</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="circles">Circles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">125.45 ZEC</div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8.2% from last month</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">68.5 ZEC</div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12.3% from last month</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">62.0 ZEC</div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <TrendingUp className="h-3 w-3" />
                    <span>+5.1% from last month</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">+6.5 ZEC</div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    <span>Positive this month</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Balance History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Balance History</CardTitle>
                <CardDescription>Your total balance over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    balance: {
                      label: "Balance",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Balance by Category</CardTitle>
                <CardDescription>How your funds are distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{cat.category}</span>
                        <span className="text-muted-foreground">
                          {cat.amount} ZEC ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Transaction Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Sent vs Received over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    sent: {
                      label: "Sent",
                      color: "hsl(var(--accent))",
                    },
                    received: {
                      label: "Received",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionVolume}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="sent" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="received" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Transaction Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Transactions</span>
                    <span className="font-semibold text-foreground">247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shielded Transactions</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">189</span>
                      <Badge variant="secondary" className="text-xs">
                        76%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Transaction</span>
                    <span className="font-semibold text-foreground">12.3 ZEC</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Privacy Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">A+</span>
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Excellent! You're using shielded transactions for maximum privacy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="circles" className="space-y-6">
            {/* Circle Performance */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Circles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">3</div>
                  <p className="mt-1 text-xs text-muted-foreground">16 total members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Pooled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">836.45 ZEC</div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" />
                    <span>+15.2% this month</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Your Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">124.5 ZEC</div>
                  <p className="mt-1 text-xs text-muted-foreground">Across all circles</p>
                </CardContent>
              </Card>
            </div>

            {/* Circle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Circle Performance</CardTitle>
                <CardDescription>Progress toward monthly goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-foreground">Team Fund</span>
                    <span className="text-sm text-muted-foreground">234 / 500 ZEC</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: "47%" }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">47% of goal</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-foreground">Project Alpha</span>
                    <span className="text-sm text-muted-foreground">89 / 200 ZEC</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: "45%" }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">45% of goal</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-foreground">Savings Pool</span>
                    <span className="text-sm text-muted-foreground">513 / 1000 ZEC</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: "51%" }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">51% of goal</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
