"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Calendar, Filter, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
  sender_id: string
  receiver_id: string
  status: string
  reference_number: string
  mode: string
}

type Wallet = {
  id: string
  name: string
  balance: number
  type: 'main' | 'budget' | 'goal'
  mode: string
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30") // days
  const [selectedWallet, setSelectedWallet] = useState<string>("all")
  const [userId, setUserId] = useState<string>("")
  const accountMode = useAccountMode()

  useEffect(() => {
    loadData()
  }, [accountMode])

  async function loadData() {
    if (!accountMode) return
    
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    setUserId(user.id)

    const { data: transData } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('mode', accountMode)
      .order('created_at', { ascending: false })

    const { data: mainWallet } = await supabase
      .from('main_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('mode', accountMode)
      .single()

    const { data: budgetWallets } = await supabase
      .from('budget_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('mode', accountMode)

    const { data: goalWallets } = await supabase
      .from('goal_wallets')
      .select('*')
      .eq('user_id', user.id)
      .eq('mode', accountMode)

    const allWallets: Wallet[] = []
    if (mainWallet) {
      allWallets.push({
        id: mainWallet.id,
        name: 'Main Wallet',
        balance: Number(mainWallet.balance) || 0,
        type: 'main',
        mode: mainWallet.mode
      })
    }
    if (budgetWallets) {
      budgetWallets.forEach(w => allWallets.push({
        id: w.id,
        name: w.name,
        balance: Number(w.balance) || 0,
        type: 'budget',
        mode: w.mode
      }))
    }
    if (goalWallets) {
      goalWallets.forEach(w => allWallets.push({
        id: w.id,
        name: w.name,
        balance: Number(w.balance) || 0,
        type: 'goal',
        mode: w.mode
      }))
    }

    setTransactions(transData || [])
    setWallets(allWallets)
    setLoading(false)

    const channel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'main_wallets' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_wallets' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_wallets' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const daysAgo = Number(timeRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
    return new Date(t.created_at) >= cutoffDate
  })

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  
  const income = filteredTransactions
    .filter(t => t.receiver_id === userId && t.type !== 'transfer')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const expenses = filteredTransactions
    .filter(t => t.sender_id === userId && t.type !== 'transfer')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  
  const netChange = income - expenses

  const dailyData = filteredTransactions.reduce((acc: any, t) => {
    const date = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0 }
    }
    if (t.receiver_id === userId && t.type !== 'transfer') {
      acc[date].income += Number(t.amount)
    } else if (t.sender_id === userId && t.type !== 'transfer') {
      acc[date].expenses += Number(t.amount)
    }
    return acc
  }, {})

  const trendData = Object.values(dailyData).slice(-14) // Last 14 days

  const walletDistribution = wallets.map(w => ({
    name: w.name,
    value: w.balance,
    type: w.type
  }))

  const typeBreakdown = filteredTransactions.reduce((acc: any, t) => {
    if (!acc[t.type]) {
      acc[t.type] = { type: t.type, count: 0, amount: 0 }
    }
    acc[t.type].count += 1
    acc[t.type].amount += Number(t.amount)
    return acc
  }, {})

  const transactionTypes = Object.values(typeBreakdown)

  const avgTransaction = filteredTransactions.length > 0 
    ? filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / filteredTransactions.length
    : 0

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Analytics</h2>
            <p className="mt-1 text-muted-foreground">Comprehensive insights into your finances</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₦{totalBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Wallet className="h-3 w-3" />
                    <span>{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    +₦{income.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>Last {timeRange} days</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    -₦{expenses.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>Last {timeRange} days</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Net Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {netChange >= 0 ? '+' : ''}₦{netChange.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {netChange >= 0 ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                    <span>{netChange >= 0 ? 'Surplus' : 'Deficit'}</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Daily transaction trends over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    income: {
                      label: "Income",
                      color: "hsl(var(--success))",
                    },
                    expenses: {
                      label: "Expenses",
                      color: "hsl(var(--destructive))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--success))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--destructive))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Balance Distribution</CardTitle>
                  <CardDescription>Money across all your wallets</CardDescription>
                </CardHeader>
                <CardContent>
                  {walletDistribution.length > 0 ? (
                    <>
                      <ChartContainer
                        config={{
                          value: {
                            label: "Balance",
                            color: "hsl(var(--primary))",
                          },
                        }}
                        className="h-[250px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={walletDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="hsl(var(--primary))"
                              dataKey="value"
                            >
                              {walletDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <div className="mt-4 space-y-2">
                        {walletDistribution.map((w, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-foreground">{w.name}</span>
                              <Badge variant="secondary" className="text-xs">{w.type}</Badge>
                            </div>
                            <span className="font-medium text-foreground">₦{w.value.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                      No wallet data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Types</CardTitle>
                  <CardDescription>Breakdown by transaction category</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionTypes.length > 0 ? (
                    <div className="space-y-4">
                      {transactionTypes.map((type: any, i) => {
                        const total = transactionTypes.reduce((sum: number, t: any) => sum + t.amount, 0)
                        const percentage = total > 0 ? (type.amount / total * 100) : 0
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize text-foreground">{type.type}</span>
                                <Badge variant="outline" className="text-xs">{type.count} txns</Badge>
                              </div>
                              <span className="text-muted-foreground">
                                ₦{type.amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${percentage}%` }} 
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                      No transactions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{filteredTransactions.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">In selected period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₦{avgTransaction.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Largest Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    ₦{Math.max(...filteredTransactions.map(t => Number(t.amount)), 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Highest amount</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All transactions in the selected period</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {filteredTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              transaction.sender_id === userId ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                            }`}>
                              {transaction.sender_id === userId ? (
                                <ArrowUpRight className="h-5 w-5" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{transaction.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.created_at).toLocaleDateString('en-NG', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <Badge variant="outline" className="text-xs capitalize">{transaction.type}</Badge>
                                <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${
                              transaction.sender_id === userId ? 'text-destructive' : 'text-success'
                            }`}>
                              {transaction.sender_id === userId ? '-' : '+'}₦{Number(transaction.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">{transaction.reference_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                      No transactions in this period
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Overview</CardTitle>
                <CardDescription>Detailed view of individual wallet performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wallets</SelectItem>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} (₦{wallet.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wallets
                .filter(w => selectedWallet === 'all' || w.id === selectedWallet)
                .map((wallet) => (
                  <Card key={wallet.id} className="relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10" />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{wallet.name}</CardTitle>
                          <Badge variant="secondary" className="mt-2 text-xs capitalize">{wallet.type}</Badge>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{wallet.name} - Transaction History</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[400px]">
                              <div className="space-y-3">
                                {filteredTransactions
                                  .filter(t => t.description.includes(wallet.name))
                                  .map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between rounded-lg border p-3">
                                      <div>
                                        <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(transaction.created_at).toLocaleDateString('en-NG', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                      </div>
                                      <p className={`text-sm font-semibold ${
                                        transaction.sender_id === userId ? 'text-destructive' : 'text-success'
                                      }`}>
                                        {transaction.sender_id === userId ? '-' : '+'}₦{Number(transaction.amount).toLocaleString('en-NG')}
                                      </p>
                                    </div>
                                  ))}
                                {filteredTransactions.filter(t => t.description.includes(wallet.name)).length === 0 && (
                                  <p className="py-8 text-center text-sm text-muted-foreground">No transactions for this wallet</p>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-2xl font-bold text-foreground">
                            ₦{wallet.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Transactions</span>
                          <span className="font-medium text-foreground">
                            {filteredTransactions.filter(t => t.description.includes(wallet.name)).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Pattern</CardTitle>
                  <CardDescription>Your transaction behavior analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most Active Day</span>
                    <span className="font-medium text-foreground">
                      {filteredTransactions.length > 0 ? 
                        new Date(filteredTransactions[0].created_at).toLocaleDateString('en-US', { weekday: 'long' }) 
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Income/Expense Ratio</span>
                    <span className="font-medium text-foreground">
                      {expenses > 0 ? (income / expenses).toFixed(2) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Savings Rate</span>
                    <span className={`font-medium ${netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {income > 0 ? `${((netChange / income) * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Health</CardTitle>
                  <CardDescription>Overall assessment of your finances</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Budget Adherence</span>
                      <span className="text-sm font-medium text-foreground">
                        {netChange >= 0 ? 'Excellent' : 'Needs Improvement'}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div 
                        className={`h-full ${netChange >= 0 ? 'bg-success' : 'bg-destructive'}`} 
                        style={{ width: `${Math.min(Math.abs(netChange / (income || 1)) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-foreground">
                      {netChange >= 0 
                        ? `Great job! You're saving ₦${netChange.toLocaleString('en-NG')} this period. Keep it up!`
                        : `You're spending ₦${Math.abs(netChange).toLocaleString('en-NG')} more than you earn. Consider reviewing your expenses.`
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>AI-powered insights based on your transaction data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {netChange >= 0 ? (
                    <>
                      <div className="rounded-lg border-l-4 border-success bg-success/5 p-4">
                        <p className="font-medium text-foreground">Excellent Financial Discipline</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          You're maintaining a positive cash flow. Consider allocating {((netChange / income) * 100 * 0.5).toFixed(0)}% to your goal wallets.
                        </p>
                      </div>
                      <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                        <p className="font-medium text-foreground">Investment Opportunity</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          With ₦{netChange.toLocaleString('en-NG')} surplus, explore creating a new investment goal wallet.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg border-l-4 border-destructive bg-destructive/5 p-4">
                        <p className="font-medium text-foreground">Budget Review Needed</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your expenses exceed income by ₦{Math.abs(netChange).toLocaleString('en-NG')}. Review your spending categories.
                        </p>
                      </div>
                      <div className="rounded-lg border-l-4 border-warning bg-warning/5 p-4">
                        <p className="font-medium text-foreground">Set Spending Limits</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Consider setting spend limits on your budget wallets to control expenses.
                        </p>
                      </div>
                    </>
                  )}
                  <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                    <p className="font-medium text-foreground">Track Your Progress</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You have {wallets.filter(w => w.type === 'goal').length} goal wallet{wallets.filter(w => w.type === 'goal').length !== 1 ? 's' : ''}. Regular contributions help achieve your financial goals faster.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
